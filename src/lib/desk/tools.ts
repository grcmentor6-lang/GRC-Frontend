import type { Desk } from "./model";
import { stepKey, type Progress } from "./progress";

/**
 * Which platform tools the mentee may open.
 *
 * The steps send the mentee into the toolbar: a step names the tool it is done in (`step.key`,
 * "evidence|Audit Requests (PBC)"). So a tool a step uses opens while that step is the one in hand,
 * and stays open for reading once any step that uses it is complete. A tool no step uses is
 * reference material and follows the pack's own week gate (`secs[].u`, `tools[].u`). The utilities
 * (search, add, inbox, systems, alerts, filter, help) are always open.
 */

export const UTILITIES = new Set(["search", "add", "inbox", "systems", "alerts", "filter", "help"]);

export interface Here {
  task: string;
  n: number;
}

type Use = { task: string; n: number; week: number };
const cache = new WeakMap<Desk, Map<string, Use[]>>();

/** tool key → the steps done in it. */
export function toolUses(desk: Desk): Map<string, Use[]> {
  let m = cache.get(desk);
  if (!m) {
    m = new Map();
    for (const t of Object.values(desk.tasks))
      for (const s of t.steps) if (s.key) m.set(s.key, [...(m.get(s.key) ?? []), { task: t.id, n: s.n, week: t.week }]);
    cache.set(desk, m);
  }
  return m;
}

export function toolOpen(desk: Desk, progress: Progress, isOpen: (w: number) => boolean, here: Here | null, key: string): boolean {
  const sec = key.split("|")[0];
  if (UTILITIES.has(sec)) return true;
  const uses = toolUses(desk).get(key);
  if (uses?.length)
    return uses.some((u) => (isOpen(u.week) && here?.task === u.task && here.n === u.n) || !!progress.done[stepKey(u.task, u.n)]);
  const secWeek = desk.secs.find((s) => s?.k === sec)?.u ?? 1;
  const toolWeek = desk.sections[sec]?.tools.find((t) => `${sec}|${t.n}` === key)?.u ?? 1;
  return isOpen(secWeek) && isOpen(toolWeek);
}

export function sectionOpen(desk: Desk, progress: Progress, isOpen: (w: number) => boolean, here: Here | null, sec: string): boolean {
  return UTILITIES.has(sec) || (desk.sections[sec]?.tools ?? []).some((t) => toolOpen(desk, progress, isOpen, here, `${sec}|${t.n}`));
}

/** What a locked tool waits for, in words. */
export function unlockHint(desk: Desk, key: string): string {
  const uses = toolUses(desk).get(key);
  if (uses?.length) return `Opens at ${uses[0].task} step ${uses[0].n}`;
  const sec = key.split("|")[0];
  const w = Math.max(desk.secs.find((s) => s?.k === sec)?.u ?? 1, desk.sections[sec]?.tools.find((t) => `${sec}|${t.n}` === key)?.u ?? 1);
  return `Opens in week ${w}`;
}
