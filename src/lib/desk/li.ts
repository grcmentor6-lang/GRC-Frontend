import type { Desk } from "./model";
import { stepKey, type Progress } from "./progress";

/**
 * The ISO/IEC 27001 Lead Implementer map: the six LI-* sheets of the Programme Workbook, extracted
 * by scripts/build-li-map.py into public/desk/li.json. Which work covers what is the pack's; how
 * far the mentee is comes from their desk progress, so nothing here is stored.
 */
export interface LiStatement { d: number; ref: string; type: string; text: string; before: string; lvlBefore: string; added: string; lvlAfter: string; change: string }
export interface LiClause { ref: string; title: string; before: string; lvlBefore: string; added: string; lvlAfter: string; docs: string }
export interface LiControl { ref: string; title: string; theme: string; tasks: string; labs: string; soa: string; pool: string; depth: string }
export interface LiExtension { id: string; task: string; week: string; title: string; domains: string; iso: string; hours: string; objective: string; kr: string }
export interface LiCourseDay { day: string; topic: string; weeks: string; tasks: string }
export interface LiMap {
  title: string;
  intro: string;
  levels: string;
  domains: { n: number; title: string }[];
  statements: LiStatement[];
  clauses: LiClause[];
  controls: LiControl[];
  extensions: LiExtension[];
  course: LiCourseDay[];
}

let cached: Promise<LiMap> | null = null;
export function loadLi(): Promise<LiMap> {
  cached ??= fetch("/desk/li.json", { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(`Lead Implementer map failed to load (${r.status})`);
    return r.json();
  });
  return cached;
}

/**
 * The work a cell names, as desk items: core tasks ("F1.2", "T7.1") and extensions ("LI-05"). The
 * rest of a cell — test items (I43–I57), Technology Lab simulators, notes in brackets — is shown as
 * written but is not desk work, so it does not count towards progress.
 */
export function workIn(cell: string): string[] {
  const ids = cell.match(/\b(?:[FT]\d{1,2}\.\d|LI-\d\d)\b/g) ?? [];
  return [...new Set(ids)];
}

/** An extension's steps, by the tag the desk content carries on them. */
export const extSteps = (desk: Desk, id: string) =>
  Object.values(desk.tasks).flatMap((t) => t.steps.filter((s) => s.li === id).map((s) => ({ task: t, step: s })));

/**
 * Where an item stands: an extension by its own steps, a core task by its steps outside any
 * extension (the extension steps are counted on their own row).
 */
export function itemProgress(desk: Desk, p: Progress, id: string): { done: number; total: number } {
  const steps = id.startsWith("LI-")
    ? extSteps(desk, id)
    : (desk.tasks[id]?.steps ?? []).filter((s) => !s.li).map((s) => ({ task: desk.tasks[id], step: s }));
  return { done: steps.filter(({ task, step }) => p.done[stepKey(task.id, step.n)]).length, total: steps.length };
}

export const itemDone = (desk: Desk, p: Progress, id: string) => {
  const g = itemProgress(desk, p, id);
  return g.total > 0 && g.done === g.total;
};

export type Standing = "done" | "started" | "open" | "none";
/** A row of the map: done when all the desk work it names is done. A row naming none is "none". */
export function standing(desk: Desk, p: Progress, cells: string[]): { state: Standing; done: number; total: number } {
  const ids = [...new Set(cells.flatMap(workIn))].filter((id) => id.startsWith("LI-") || desk.tasks[id]);
  const done = ids.filter((id) => itemDone(desk, p, id)).length;
  const started = ids.some((id) => itemProgress(desk, p, id).done > 0);
  return { state: !ids.length ? "none" : done === ids.length ? "done" : started || done ? "started" : "open", done, total: ids.length };
}

/** Where an item lives on the desk: its first step, so a chip can open the work itself. */
export function itemHref(desk: Desk, id: string): string | null {
  if (id.startsWith("LI-")) {
    const first = extSteps(desk, id)[0];
    return first ? `/app/desk#${first.task.id}-${first.step.n}` : null;
  }
  return desk.tasks[id] ? `/app/desk#${id}` : null;
}
