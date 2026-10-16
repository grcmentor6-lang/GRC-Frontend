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
}

const EMPTY: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {} };

export function useProgress(who: string) {
  // v4 (2026-10-15): progress reset with the new work types; bump again for a fresh start.
  const key = `grc101.desk.v4.${who}`;
  // Lazy read: the desk mounts only in the browser, after its content has loaded.
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      for (const old of [`grc101.desk.${who}`, `grc101.desk.v2.${who}`, `grc101.desk.v3.${who}`]) localStorage.removeItem(old); // earlier saves, no longer read
      const raw = localStorage.getItem(key);
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

export const stepKey = (taskId: string, n: number) => `${taskId}-${n}`;

export type TaskStatus = "submitted" | "started" | "todo";
export function taskStatus(p: Progress, t: { id: string; steps: { n: number }[] }): TaskStatus {
  if (p.submitted[t.id]) return "submitted";
  return t.steps.some((s) => p.done[stepKey(t.id, s.n)]) ? "started" : "todo";
}
