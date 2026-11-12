// The desk's order (owner, 12 Nov 2026: "don't open the next task if the previous one is not complete, and the same
// for steps"). A task opens once every task before it in the programme's order is submitted; a step once every step
// before it in its task is complete. What is already submitted or complete stays open: nobody is locked out of work
// they have done. Weeks are not part of this: they all stay open (flags.ts ALL_WEEKS_OPEN).
//
// ponytail: enforced on the desk only. The progress document is the browser's own, so a server-side copy of this rule
// would stop nobody who edits it; the knowledge checks, which are graded on the server, enforce theirs there.
import type { Desk, Task } from "./model";
import { stepKey, type Progress } from "./progress";

/** The task to submit first, or null when `id` is open. */
export function taskGate(desk: Desk, p: Progress, id: string): string | null {
  if (p.submitted[id]) return null;
  const i = desk.order.indexOf(id);
  return desk.order.slice(0, Math.max(i, 0)).find((t) => !p.submitted[t]) ?? null;
}

/** The step to complete first, or null when step `n` is open. */
export function stepGate(p: Progress, task: Task, n: number): number | null {
  if (p.done[stepKey(task.id, n)]) return null;
  return task.steps.find((s) => s.n < n && !p.done[stepKey(task.id, s.n)])?.n ?? null;
}
