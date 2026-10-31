import type { Desk, Task } from "./model";
import { stepKey, type Progress } from "./progress";
import { stepReads, stepSources } from "./registers";

/**
 * Which platform tools the mentee may open.
 *
 * Every tool waits for its week (the pack's own gate: `secs[].u`, `tools[].u`). A tool a step works in or
 * reads from also waits for the learner to reach the first task that uses it (owner, 30 Oct: tools unlock
 * task by task), and stays open after. Home and Learn & Grow are the learner's reference shelf and keep
 * the week gate only, as does a screen no step uses yet. The step in hand is what turns a tool into a
 * workplace: its tool opens as the modal the step is worked in (DeskApp.openTool), and the toolbar marks it.
 */

/** Utilities on the dock (owner, 30 Oct: Search, Quick Add, Notifications and Framework filter removed). */
export const UTILITIES = new Set(["inbox", "systems", "help"]);
const SHELF = new Set(["home", "learn"]);

export interface Here {
  task: string;
  n: number;
}

const weekOf = (desk: Desk, key: string) => {
  const sec = key.split("|")[0];
  return Math.max(desk.secs.find((s) => s?.k === sec)?.u ?? 1, desk.sections[sec]?.tools.find((t) => `${sec}|${t.n}` === key)?.u ?? 1);
};

/** The toolbar keys a step works in or reads from. */
export function stepUses(task: Task, n: number): string[] {
  const s = task.steps[n - 1];
  if (!s) return [];
  return [
    s.key?.split("#")[0],
    ...stepReads(task.id, n).map((k) => k.split("#")[0]),
    stepSources(task, n, s.refs.docs).length ? "policies|Policy Library" : null,
    s.refs.pages.length ? "learn|Reference pages" : null,
    s.refs.rules.length ? "learn|Rule tables" : null,
  ].filter((k): k is string => !!k);
}

/** Tool key → the first step (in programme order) that uses it. */
const firstUse = new WeakMap<Desk, Map<string, Here>>();
function firstUses(desk: Desk): Map<string, Here> {
  let m = firstUse.get(desk);
  if (m) return m;
  m = new Map();
  for (const id of desk.order) for (const s of desk.tasks[id].steps) for (const k of stepUses(desk.tasks[id], s.n)) if (!m.has(k)) m.set(k, { task: id, n: s.n });
  firstUse.set(desk, m);
  return m;
}

/** A task the learner has reached: the one in hand, or one with work done or handed in. */
export const reached = (desk: Desk, p: Progress, here: Here | null | undefined, id: string) =>
  here?.task === id || !!p.submitted[id] || desk.tasks[id].steps.some((s) => p.done[stepKey(id, s.n)]);

export function toolOpen(desk: Desk, isOpen: (w: number) => boolean, key: string, p?: Progress, here?: Here | null): boolean {
  const sec = key.split("|")[0];
  if (UTILITIES.has(sec)) return true;
  if (!isOpen(weekOf(desk, key))) return false;
  if (SHELF.has(sec) || !p || !firstUses(desk).has(key)) return true;
  return desk.order.some((id) => reached(desk, p, here, id) && desk.tasks[id].steps.some((s) => stepUses(desk.tasks[id], s.n).includes(key)));
}

export function sectionOpen(desk: Desk, isOpen: (w: number) => boolean, sec: string, p?: Progress, here?: Here | null): boolean {
  return UTILITIES.has(sec) || (desk.sections[sec]?.tools ?? []).some((t) => toolOpen(desk, isOpen, `${sec}|${t.n}`, p, here));
}

/** What a locked tool waits for, in words. */
export function unlockHint(desk: Desk, isOpen: (w: number) => boolean, key: string): string {
  const w = weekOf(desk, key);
  const first = firstUses(desk).get(key);
  if (!isOpen(w) || !first) return `Opens in week ${w}`;
  return `Opens at ${first.task} step ${first.n}`;
}
