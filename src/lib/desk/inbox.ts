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
  // LI101 messages (docs/li101/inbox.md): each arrives after the step whose call it tests, never at it.
  "F1.2-J1": 4,
  "F1.3-J1": 7,
  "F2.1-J1": 6,
  "F2.2-J1": 6,
  "T3.1-J1": 7,
  "T3.2-J1": 9,
  "T4.1-J1": 4,
  "T4.2-J1": 9,
  "T5.1-J1": 6,
  "T5.2-J1": 6,
  "T6.1-J1": 3,
  "T6.2-J1": 9,
  "T7.1-J1": 9,
  "T7.2-J1": 8,
  "T8.1-J1": 11,
  "T8.2-J1": 3,
  "T9.1-J1": 4,
  "T9.2-J1": 3,
  "T10.1-J1": 3,
  "T10.2-J1": 2,
  "T11.1-J1": 6,
  "T11.2-J1": 6,
  "T12.1-J1": 5,
  "T12.2-J1": 4,
  "T12.2-J2": 6,
  // The other tasks' messages went with their old content (GRC 101 rebuilt to the Lead Implementer workbook, docs/li101).
};

/**
 * The step a message holds, which is never the step it arrives at: it arrives at INJ_AT, is read in the Inbox while the
 * learner works on, and is required from the next step (the task's last step, the hand-in, for a message that arrives
 * there). F1.1-J2 is the old drill, which holds its own step.
 */
export const holdStep = (desk: Desk, id: string): number => {
  const n = INJ_AT[id], m = desk.inj[id];
  return !n || !m || id === "F1.1-J2" ? n : Math.min(n + 1, desk.tasks[m.task].steps.length);
};

/** The messages that wait for the learner's reply at step `n`: the step cannot be completed until they have one. */
export const waitingAt = (desk: Desk, p: Progress, taskId: string, n: number) => desk.tasks[taskId].inj.filter((id) => holdStep(desk, id) === n && !p.msgs[id]);

/** A message has arrived: its task is reached and, if it belongs to a step, the learner has got to that step. */
export function released(desk: Desk, p: Progress, here: Here | null | undefined, id: string): boolean {
  const m = desk.inj[id];
  if (!m || !desk.tasks[m.task] || !reached(desk, p, here, m.task)) return false;
  const n = INJ_AT[id];
  if (!n || n === 1 || p.submitted[m.task]) return true;
  return (here?.task === m.task && here.n >= n) || !!p.done[stepKey(m.task, n - 1)] || !!p.done[stepKey(m.task, n)];
}
