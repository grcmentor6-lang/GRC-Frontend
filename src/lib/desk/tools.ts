import type { Desk } from "./model";

/**
 * Which platform tools the mentee may open.
 *
 * Every tool opens for reading, as a floating window, once its week has come (the pack's own week
 * gate: `secs[].u`, `tools[].u`); the utilities (search, add, inbox, systems, alerts, filter, help)
 * are always open. The step in hand is what turns a tool into a workplace: its tool opens as the
 * modal the step is worked in (DeskApp.openTool), and the toolbar marks it.
 */

export const UTILITIES = new Set(["search", "add", "inbox", "systems", "alerts", "filter", "help"]);

export interface Here {
  task: string;
  n: number;
}

const weekOf = (desk: Desk, key: string) => {
  const sec = key.split("|")[0];
  return Math.max(desk.secs.find((s) => s?.k === sec)?.u ?? 1, desk.sections[sec]?.tools.find((t) => `${sec}|${t.n}` === key)?.u ?? 1);
};

export function toolOpen(desk: Desk, isOpen: (w: number) => boolean, key: string): boolean {
  return UTILITIES.has(key.split("|")[0]) || isOpen(weekOf(desk, key));
}

export function sectionOpen(desk: Desk, isOpen: (w: number) => boolean, sec: string): boolean {
  return UTILITIES.has(sec) || (desk.sections[sec]?.tools ?? []).some((t) => toolOpen(desk, isOpen, `${sec}|${t.n}`));
}

/** What a locked tool waits for, in words. */
export const unlockHint = (desk: Desk, key: string) => `Opens in week ${weekOf(desk, key)}`;
