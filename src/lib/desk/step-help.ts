/**
 * Every step's own help (UX101 W9, G-07 S-06): why it matters on the job, and hints 1 and 3. Written in
 * docs/ux101/w9/help-*.json, merged and checked by docs/ux101/build_step_help.py, and held to the answer keys by
 * backend/tests/test_step_hints_no_answers.py. Hint 2 is the step's Sources (step-sources.ts), opened with the same links.
 * Hints reveal one at a time; how far a learner went is kept in progress.hints, and costs no marks.
 */
import HELP from "./step-help.json";
import { stepKey, type Progress } from "./progress";
import { toLearner } from "./names";

export interface StepHelpText { why: string; h1: string; h3: string }
const all = HELP as unknown as Record<string, StepHelpText>;

/** The text names the organisations canonically; a learner reads their own names (names.ts), as on every other desk text. */
export const stepHelp = (taskId: string, n: number): StepHelpText | undefined => {
  const h = all[stepKey(taskId, n)];
  return h && { why: toLearner(h.why), h1: toLearner(h.h1), h3: toLearner(h.h3) };
};
/** Hints a learner has opened on a step: 0 to 3. */
export const hintsOpened = (p: Progress, taskId: string, n: number): number => p.hints?.[stepKey(taskId, n)] ?? 0;
