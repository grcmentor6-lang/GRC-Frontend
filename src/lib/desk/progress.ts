"use client";

import { useSyncExternalStore } from "react";
import { storeFor } from "./progress-sync";

/**
 * What the mentee has done on the desk.
 *
 * The server holds the only copy, per account (table desk_progress); the browser holds none. Opening does one GET,
 * shared by every useProgress on the page (progress-sync.ts); the desk shows its skeleton until then, or Try again
 * if it fails, so an empty desk can never overwrite real work. `update` changes memory and notes the changed keys;
 * after a pause they go up as one PATCH of keys, one request at a time, with retries, and at once when the tab hides
 * (keepalive). A browser's old v7 copy, if newer, is sent up once and removed. /app/desk?reset=1 replaces the
 * person's own server copy with an empty one (PUT), without touching anyone else's.
 * ponytail: a key is the unit of a save, so two tabs keep each other's keys but the later of two edits to the same
 * key (one register's grid) wins, and a tab sees the other's work on reload. Unsaved work left when the connection
 * is down lives only in the tab; the header says so and closing asks first.
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
  /** Tech Lab id → its parts' results (POST /me/desk/lab), findings and completion. */
  labs?: Record<string, import("./labs").LabState>;
  /** Every Capture evidence, in order: E1, E2 …, shown on Evidence › Capture Screenshot. */
  labCaptures?: import("./labs").LabCapture[];
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

export { EMPTY } from "./progress-sync";

/** The signed-in person's desk work, from one shared store: every caller on the page sees the same copy. */
export function useProgress(who: string) {
  const s = storeFor(who);
  const progress = useSyncExternalStore(s.subscribe, () => s.progress, () => s.progress);
  const status = useSyncExternalStore(s.subscribe, () => s.status, () => s.status);
  return { progress, update: s.update, status, retry: s.load };
}

/** Saved, saving, or not saved yet. Separate from useProgress so the note redraws alone. */
export function useSaveState(who: string) {
  const s = storeFor(who);
  return useSyncExternalStore(s.subscribe, () => s.saveState, () => s.saveState);
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
