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
 * v4 (2026-10-15) with the new work types, v5 (2026-10-20) emptied every submission by request, v6 (2026-10-21) cleared decision steps only.
 */
export const progressKey = (who: string) => `grc101.desk.v6.${who}`;

/**
 * v6 (2026-10-21): decision steps gained their second half (the forms and tables after "Then:"),
 * so every decision submission is cleared, by request, and the rest of the work is kept.
 */
function fromV5(who: string): string | null {
  const raw = localStorage.getItem(`grc101.desk.v5.${who}`);
  if (!raw) return null;
  const p = JSON.parse(raw) as Partial<Progress>;
  const decided = Object.keys(p.picks ?? {});
  for (const k of decided) delete p.done?.[k];
  const out = JSON.stringify({ ...p, picks: {}, decisions: {} });
  localStorage.setItem(`grc101.desk.v6.${who}`, out);
  localStorage.removeItem(`grc101.desk.v5.${who}`);
  return out;
}

export function useProgress(who: string) {
  const key = progressKey(who);
  // Lazy read: the desk mounts only in the browser, after its content has loaded.
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      for (const old of [`grc101.desk.${who}`, `grc101.desk.v2.${who}`, `grc101.desk.v3.${who}`, `grc101.desk.v4.${who}`]) localStorage.removeItem(old); // earlier saves, no longer read
      const raw = localStorage.getItem(key) ?? fromV5(who);
      return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
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
