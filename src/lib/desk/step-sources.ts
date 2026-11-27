/**
 * Where each step's answer can be found (UX101 W4, R-02 / R-03): the audit of all 216 steps (docs/ux101/step-sources.json
 * in the root repo, written out by docs/ux101/build_step_sources.py) joined with what the step itself cites. It names
 * places only (a document section, a rule, a page, a dataset, a screen, an earlier hand-in) and never the fact that
 * answers. The "Read first" / "Sources for this step" card draws it (components/desk/read-first.tsx).
 */
import AUDIT from "./step-sources.json";
import type { Task } from "./model";
import { stepReads, stepSources } from "./registers";

export type StepSource =
  | { k: "doc"; id: string; secs: string[]; /** Opening words of the paragraph to bring into view, in a long section. */ spot?: string }
  | { k: "rule" | "page" | "ds" | "lib"; id: string }
  | { k: "tool"; id: string; find?: string }
  | { k: "own"; id: string; task: string; step: number }
  | { k: "sheet" };

export const QUICK_REF = "learn|Framework Quick Reference";
const audited = AUDIT as unknown as Record<string, StepSource[]>;
/** Screens that only list the things a step names one by one: the named thing is the source, not the list. */
const LISTS: Record<string, StepSource["k"]> = { "learn|Reference pages": "page", "learn|Rule tables": "rule", "policies|Policy Library": "doc" };

export const auditedSources = (taskId: string, n: number): StepSource[] => audited[`${taskId}-${n}`] ?? [];

/** The sections of `doc` a step reads: its own citations and the audit's (the document window shows and jumps to these). */
export function docSections(task: Task, n: number, doc: string): string[] {
  const src = stepSourceList(task, n).find((x) => x.k === "doc" && x.id === doc);
  return src && src.k === "doc" ? src.secs : [];
}

export function stepSourceList(task: Task, n: number): StepSource[] {
  const s = task.steps[n - 1];
  if (!s) return [];
  const out: StepSource[] = [];
  const add = (x: StepSource) => {
    if (x.k === "doc") {
      const have = out.find((o) => o.k === "doc" && o.id === x.id) as Extract<StepSource, { k: "doc" }> | undefined;
      if (have) Object.assign(have, { secs: [...new Set([...have.secs, ...x.secs])], spot: have.spot ?? x.spot });
      else out.push({ ...x, secs: [...x.secs] });
    } else if (x.k === "tool") {
      const have = out.find((o) => o.k === "tool" && o.id === x.id && (!o.find || !x.find || o.find === x.find)) as Extract<StepSource, { k: "tool" }> | undefined;
      if (!have) out.push(x);
      else if (x.find && !have.find) have.find = x.find;
    } else if (!out.some((o) => o.k === x.k && (o as { id?: string }).id === (x as { id?: string }).id)) out.push(x);
  };
  for (const [id, secs] of stepSources(task, n, s.refs.docs)) add({ k: "doc", id, secs });
  for (const id of s.refs.rules) add({ k: "rule", id });
  for (const id of s.refs.pages) add({ k: "page", id });
  for (const id of s.refs.ds) add({ k: "ds", id });
  for (const x of auditedSources(task.id, n)) add(x.k === "tool" ? { ...x } : x);
  for (const key of stepReads(task.id, n).map((k) => k.split("#")[0])) add({ k: "tool", id: key });
  // The list a named thing is opened from is not a second source.
  return out.filter((x) => !(x.k === "tool" && LISTS[x.id] && out.some((o) => o.k === LISTS[x.id])));
}
