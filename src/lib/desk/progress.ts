"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/**
 * What the mentee has done on the desk.
 *
 * Kept on the server per account (GET and PUT /me/desk/progress, table desk_progress), with a copy in
 * localStorage so the desk opens at once and survives a dropped connection. Callers only see `progress`
 * and `update`. ponytail: pages outside the desk (badges, CV) still read the browser's copy, so on a new
 * device they fill in once the desk has been opened there.
 */
export interface Progress {
  /** "T5.1-3" → completed. */
  done: Record<string, boolean>;
  /** "T5.1-3" → the option picked, or one option per row for a per-row decision. */
  picks: Record<string, string | Record<string, string>>;
  /** "T5.1-3" → the mentee's typed work for that activity; "T5.1:PBC-LIST" → a typed deliverable. */
  answers: Record<string, string>;
  /** "T5.1" → ISO time the task was submitted. */
  submitted: Record<string, string>;
  /** Task message id → option letter ("OK" for a notice that is only acknowledged). */
  msgs: Record<string, string>;
  /** "F1.1-1" → the parts of a reading step the mentee confirmed they read ("A", "B", "read"). */
  acks: Record<string, string[]>;
  /** "T3.1|regwatch|Obligations Register" → the register's filled cells, "row,col" → value. Shared by the task's steps. */
  grids: Record<string, Record<string, string>>;
  /** "T5.1-7" → ISO time the step was ticked in the work log. */
  logs: Record<string, string>;
  /** Decision id ("F1.1-D1") → the feedback revealed once the pick was locked (POST /me/desk/decision). */
  decisions: Record<string, DecisionFeedback>;
  /** "<task>-<step>" → a per-row decision's feedback, once its rows were checked (POST /me/desk/rows). */
  rowChecks?: Record<string, RowsFeedback>;
  /** When this copy last changed (ms): the newer of the browser's and the server's copy wins. */
  savedAt?: number;
}

export interface RowsFeedback {
  /** Row label → the pick, the key's value, whether it matches (null: the key's value is not one of
   *  the step's options, so it cannot be scored) and the reason, from the step's rule. */
  rows: Record<string, { pick: string; best: string; correct: boolean | null; why: string }>;
  note?: string | null;
  /** When the rows were checked (ISO): T12.2 logs it as the time its files were sent. */
  at?: string;
}

export interface DecisionFeedback {
  pick: string;
  /** Null where the best answer depends on the mentee's own material; the reviewer checks it. */
  best: string | null;
  correct: boolean | null;
  why: string | null;
  /** Per option, A–C. Null until the reasons for this decision are written. */
  options: { reason: string; consequence: string }[] | null;
  reviewed: boolean;
}

const EMPTY: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {} };

/**
 * Where a mentee's desk progress is kept. The version is bumped to start everyone afresh:
 * v4 (2026-10-15) with the new work types, v5 (2026-10-20) emptied every submission by request, v6 (2026-10-21) cleared decision steps only,
 * v7 (2026-10-28) emptied every submission again by request, for testing the rebuilt tasks.
 */
export const progressKey = (who: string) => `grc101.desk.v7.${who}`;

/** Pause after the last change before saving to the server; the browser's copy is written at once. */
const SAVE_AFTER_MS = 1500;
const save = (p: Progress) => api.put("/me/desk/progress", { data: JSON.stringify(p) }).catch(() => {
  /* offline or signed out: the browser keeps it, and it goes up on the next load as the newer copy */
});

export function useProgress(who: string) {
  const key = progressKey(who);
  // /app/desk?reset=1 empties the signed-in person's own desk and nobody else's (owner, 31 Oct), without bumping
  // the version above, which would start every tester afresh. An empty copy dated now, not just a removal: it must
  // beat the older copy on the server, which goes too. The address is cleaned so a reload cannot wipe again.
  const [wiped] = useState(() => {
    try {
      const url = new URL(location.href);
      if (!url.searchParams.has("reset")) return false;
      localStorage.setItem(key, JSON.stringify({ ...EMPTY, savedAt: Date.now() }));
      url.searchParams.delete("reset");
      history.replaceState(null, "", url);
      return true;
    } catch {
      return false;
    }
  });
  // Lazy read: the desk mounts only in the browser, after its content has loaded.
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      for (const v of ["", "v2.", "v3.", "v4.", "v5.", "v6."]) localStorage.removeItem(`grc101.desk.${v}${who}`); // earlier saves, no longer read
      const raw = localStorage.getItem(key);
      return raw ? resetStaleRowChecks({ ...EMPTY, ...JSON.parse(raw) }) : EMPTY;
    } catch {
      return EMPTY; // private window or blocked storage: start empty
    }
  });

  const update = useCallback(
    (fn: (p: Progress) => Progress) =>
      setProgress((p) => {
        const next = { ...fn(p), savedAt: Date.now() };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* unsaved here, but the server still gets it */
        }
        return next;
      }),
    [key],
  );

  // A change goes up once the learner pauses. `saved` is the copy the server already has, or the one read on opening.
  const saved = useRef(progress.savedAt);
  useEffect(() => {
    if (progress.savedAt === saved.current) return;
    const t = setTimeout(() => {
      saved.current = progress.savedAt;
      save(progress);
    }, SAVE_AFTER_MS);
    return () => clearTimeout(t);
  }, [progress]);

  // On opening: the server's copy replaces this browser's if it is newer (work done on another device);
  // otherwise this browser's goes up, which is also how work saved before the database moves across.
  useEffect(() => {
    let live = true;
    if (wiped) {
      save({ ...EMPTY, savedAt: Date.now() });
      return;
    }
    api
      .get<{ data?: string | null }>("/me/desk/progress")
      .then((r) => {
        const server = r?.data ? ({ ...EMPTY, ...JSON.parse(r.data) } as Progress) : null;
        const local = readProgress(who);
        if (!live || local.savedAt !== saved.current) return; // the learner has already started working
        if (server && (server.savedAt ?? 0) > (local.savedAt ?? 0)) {
          saved.current = server.savedAt;
          setProgress(server);
          try {
            localStorage.setItem(key, JSON.stringify(server));
          } catch {
            /* the session still works from memory */
          }
        } else if ((!server || local.savedAt !== server.savedAt) && (local.savedAt || Object.keys(local.done).length || Object.keys(local.grids).length || Object.keys(local.picks).length)) {
          save(local);
        }
      })
      .catch(() => {
        /* the browser's copy stands */
      });
    return () => {
      live = false;
    };
  }, [key, who, wiped]);

  return { progress, update };
}

/**
 * F1.2 step 3 was checked against a key with two unscorable rows until 2026-10-28, when they got
 * answers. A check saved before then still carries a "not scored" row, so that step is reopened
 * empty: its check, completion and the rows it fills (column D, rows 2 onward; row 1 is step 2's).
 * ponytail: one hard-coded step; remove once testers have reloaded.
 */
function resetStaleRowChecks(p: Progress): Progress {
  const id = "F1.2-3";
  const chk = p.rowChecks?.[id];
  if (!chk || !Object.values(chk.rows).some((r) => r.correct === null)) return p;
  const rowChecks = { ...p.rowChecks };
  const done = { ...p.done };
  const logs = { ...p.logs };
  delete rowChecks[id];
  delete done[id];
  delete logs[id];
  const grids = Object.fromEntries(
    Object.entries(p.grids).map(([k, cells]) => [
      k,
      k.startsWith("F1.2|") ? Object.fromEntries(Object.entries(cells).filter(([c]) => !/^[1-9]\d*,3$/.test(c))) : cells,
    ]),
  );
  return { ...p, rowChecks, done, logs, grids };
}

/**
 * A read-only look at someone's desk progress, for pages outside the desk (Badges, Dashboard, CV,
 * Certificate). Empty for no one, or when storage is blocked.
 */
export function readProgress(who: string | null | undefined): Progress {
  if (!who || typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(progressKey(who));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const stepKey = (taskId: string, n: number) => `${taskId}-${n}`;

export type TaskStatus = "submitted" | "started" | "todo";
export function taskStatus(p: Progress, t: { id: string; steps: { n: number }[] }): TaskStatus {
  if (p.submitted[t.id]) return "submitted";
  return t.steps.some((s) => p.done[stepKey(t.id, s.n)]) ? "started" : "todo";
}

/** A decision's pick is checked (locked, feedback shown): its step's second part may begin. */
export const decisionChecked = (p: Progress, taskId: string, n: number) =>
  !!p.done[stepKey(taskId, n)] || (p.acks[stepKey(taskId, n)] ?? []).includes("checked");
