// The desk's order (owner, 12 Nov 2026: "don't open the next task if the previous one is not complete, and the same
// for steps"). A task opens once every task before it in the programme's order is submitted; a step once every step
// before it in its task is complete. Weeks are not part of this: they all stay open (flags.ts ALL_WEEKS_OPEN).
//
// What a learner has already reached never locks again (owner, 25 Nov 2026). An earlier task can stop being
// submitted after they have moved on (T3.2's first part was rebuilt and its steps 1 to 7 reopened): the tasks they
// have handed in or done a step in stay open, and so does the one after the last task they handed in, which was open
// to them when they handed that in. A task further on, which they never reached, still waits for every task before it.
//
// ponytail: enforced on the desk only. The progress document is the browser's own, so a server-side copy of this rule
// would stop nobody who edits it; the knowledge checks, which are graded on the server, enforce theirs there.
import type { Desk, Task } from "./model";
import { stepKey, type Progress } from "./progress";
import { reached } from "./tools";

/** The task to submit first, or null when `id` is open. */
export function taskGate(desk: Desk, p: Progress, id: string): string | null {
  if (reached(desk, p, null, id)) return null;
  const i = desk.order.indexOf(id);
  // The task after the last one handed in was open when that one went in.
  if (i <= desk.order.findLastIndex((t) => !!p.submitted[t]) + 1) return null;
  return desk.order.slice(0, Math.max(i, 0)).find((t) => !p.submitted[t]) ?? null;
}

/** The step to complete first, or null when step `n` is open. */
export function stepGate(p: Progress, task: Task, n: number): number | null {
  if (p.done[stepKey(task.id, n)]) return null;
  return task.steps.find((s) => s.n < n && !p.done[stepKey(task.id, s.n)])?.n ?? null;
}
