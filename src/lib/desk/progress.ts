"use client";

import { useCallback, useState } from "react";

/**
 * What the mentee has done on the desk.
 *
 * ponytail: kept in localStorage per account so the base build needs no schema change. Phase 3
 * moves it behind PUT /me/desk/progress; callers only see `progress` and `update`.
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

export function useProgress(who: string) {
  const key = progressKey(who);
  // Lazy read: the desk mounts only in the browser, after its content has loaded.
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      for (const v of ["", "v2.", "v3.", "v4.", "v5.", "v6."]) localStorage.removeItem(`grc101.desk.${v}${who}`); // earlier saves, no longer read
      // /app/desk?reset=1 empties the signed-in person's own desk and nobody else's (owner, 31 Oct), without bumping
      // the version above, which would start every tester afresh. The address is cleaned so a reload cannot wipe again.
      const url = new URL(location.href);
      if (url.searchParams.has("reset")) {
        localStorage.removeItem(key);
        url.searchParams.delete("reset");
        history.replaceState(null, "", url);
      }
      const raw = localStorage.getItem(key);
      return raw ? resetStaleRowChecks({ ...EMPTY, ...JSON.parse(raw) }) : EMPTY;
    } catch {
      return EMPTY; // private window or blocked storage: start empty
    }
  });

  const update = useCallback(
    (fn: (p: Progress) => Progress) =>
      setProgress((p) => {
        const next = fn(p);
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* unsaved, but the session still works */
        }
        return next;
      }),
    [key],
  );

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
