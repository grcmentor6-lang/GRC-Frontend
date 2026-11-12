import type { Desk, Task } from "./model";
import { stepKey, type Progress } from "./progress";
import { stepReads, stepSources } from "./registers";
import { labOf, labOpen } from "./labs";

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

/** Tool key → the first step (in programme order) that uses it, and every task with a step that uses it. */
type Use = Here & { tasks: Set<string> };
const firstUse = new WeakMap<Desk, Map<string, Use>>();
function firstUses(desk: Desk): Map<string, Use> {
  let m = firstUse.get(desk);
  if (m) return m;
  m = new Map();
  for (const id of desk.order)
    for (const s of desk.tasks[id].steps)
      for (const k of stepUses(desk.tasks[id], s.n)) {
        const u = m.get(k);
        if (u) u.tasks.add(id);
        else m.set(k, { task: id, n: s.n, tasks: new Set([id]) });
      }
  firstUse.set(desk, m);
  return m;
}

/** A task the learner has reached: the one in hand, or one with work done or handed in. */
export const reached = (desk: Desk, p: Progress, here: Here | null | undefined, id: string) =>
  here?.task === id || !!p.submitted[id] || desk.tasks[id].steps.some((s) => p.done[stepKey(id, s.n)]);

export function toolOpen(desk: Desk, isOpen: (w: number) => boolean, key: string, p?: Progress, here?: Here | null): boolean {
  const sec = key.split("|")[0];
  const lab = labOf(key);
  if (lab) return labOpen(lab, p);
  if (UTILITIES.has(sec)) return true;
  if (!isOpen(weekOf(desk, key))) return false;
  const use = firstUses(desk).get(key);
  if (SHELF.has(sec) || !p || !use) return true;
  // The tasks that use the tool come from the index built once per desk: walking every step of every reached task
  // for every tool, on each render of the toolbar, took tens of milliseconds (tools.test.ts holds the two equal).
  return desk.order.some((id) => use.tasks.has(id) && reached(desk, p, here, id));
}

export function sectionOpen(desk: Desk, isOpen: (w: number) => boolean, sec: string, p?: Progress, here?: Here | null): boolean {
  return UTILITIES.has(sec) || (desk.sections[sec]?.tools ?? []).some((t) => toolOpen(desk, isOpen, `${sec}|${t.n}`, p, here));
}

/**
 * Steps whose learner goes first to another section than the one the step is done in: the first menu
 * the step's guide sends them to (step-guides.ts), as the Policies or Learn source a step reads before
 * it writes. Checked against the guides by tools.test.ts. "<task>-<step>", by section.
 */
const FIRST_MENU: Record<string, string> = {
  learn: "F1.2-3 T3.1-9 T3.1-10 T3.1-11 T3.1-12 T3.1-13 T3.1-17 T3.1-18 T3.2-5 T3.2-8 T3.2-9 T3.2-10 T3.2-11 T3.2-12 T4.1-3 T4.1-4 T4.1-8 T4.2-9 T5.1-8 T5.1-9 T5.1-10 T5.1-11 T5.1-12 T6.1-4 T6.1-5 T6.1-8 T6.2-3 T7.1-5 T7.1-7 T7.1-10 T7.1-11 T7.1-12 T7.1-13 T7.2-1 T7.2-3 T7.2-4 T7.2-10 T7.2-14 T8.1-1 T8.1-4 T8.1-7 T8.1-9 T8.1-10 T8.2-4 T8.2-10 T11.1-1 T11.1-3 T11.2-7 T11.2-9 T11.2-10 T11.2-11 T11.2-12 T11.2-13 T12.1-2 T12.1-8 T12.1-11 T12.1-12",
  policies: "F1.2-4 F1.3-1 F1.3-2 F1.3-3 F1.3-4 F1.3-5 F2.1-2 F2.1-4 F2.1-5 T3.1-1 T3.1-3 T3.1-4 T3.1-5 T3.1-7 T3.1-8 T3.1-15 T3.2-1 T3.2-3 T4.1-2 T5.1-1 T5.1-4 T5.2-5 T6.2-5 T6.2-6 T7.1-3 T7.1-8 T7.2-7 T7.2-8 T7.2-9 T8.1-5 T8.1-6 T8.2-9 T9.1-4 T9.1-7 T10.1-1 T10.1-2 T10.1-4 T10.2-3 T10.2-4 T10.2-6 T10.2-9 T11.2-1 T11.2-3 T11.2-5 T11.2-6 T11.2-8 T12.2-5 T12.2-6",
  home: "T7.2-6 T7.2-12 T7.2-13 T11.1-9 T12.1-14",
  risk: "T10.1-3 T11.1-5",
  testing: "T6.1-7",
  awareness: "T11.1-4",
};
const firstMenu = new Map(Object.entries(FIRST_MENU).flatMap(([sec, ids]) => ids.split(" ").map((id) => [id, sec] as const)));

/** The toolbar menu a step opens by itself when it comes in hand (owner, 3 Nov): where its learner goes first. */
export const stepMenu = (task: Task, n: number): string | null => firstMenu.get(`${task.id}-${n}`) ?? task.steps[n - 1]?.key?.split("|")[0] ?? null;

/** What a locked tool waits for, in words. */
export function unlockHint(desk: Desk, isOpen: (w: number) => boolean, key: string): string {
  const w = weekOf(desk, key);
  const first = firstUses(desk).get(key);
  if (!isOpen(w) || !first) return `Opens in week ${w}`;
  return `Opens at ${first.task} step ${first.n}`;
}
