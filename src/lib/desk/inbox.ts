import type { Desk } from "./model";
import { stepKey, type Progress } from "./progress";
import { reached, type Here } from "./tools";

/**
 * Where each task message (inject) arrives: the step of its task it belongs to (owner, 30 Oct: messages
 * arrive at their step, not at the start of the week). A message not listed here arrives when its task is
 * reached. Filled task by task in the rework pass, by the builder who checks the message fits the step.
 */
export const INJ_AT: Record<string, number> = {
  // The outside-data drill: once the data rules are saved and the undertaking signed (step 3), and the
  // storage question answered (step 4), whose best option the drill's option A would otherwise hint at.
  "F1.1-J2": 5,
  // The Warsaw row's Polish-only act: once the GDPR row's office is read and checked (step 4) and the evidence-ref
  // question answered (step 5), whose best option the message's option C ("named in the addendum") would hint at.
  "F1.2-J1": 6,
};

/** The messages placed at a step that still wait for the learner's reply: the step cannot be completed until they have one. */
export const waitingAt = (desk: Desk, p: Progress, taskId: string, n: number) => desk.tasks[taskId].inj.filter((id) => INJ_AT[id] === n && !p.msgs[id]);

/** A message has arrived: its task is reached and, if it belongs to a step, the learner has got to that step. */
export function released(desk: Desk, p: Progress, here: Here | null | undefined, id: string): boolean {
  const m = desk.inj[id];
  if (!m || !desk.tasks[m.task] || !reached(desk, p, here, m.task)) return false;
  const n = INJ_AT[id];
  if (!n || n === 1 || p.submitted[m.task]) return true;
  return (here?.task === m.task && here.n >= n) || !!p.done[stepKey(m.task, n - 1)] || !!p.done[stepKey(m.task, n)];
}
