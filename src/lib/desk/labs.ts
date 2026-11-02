import type { Progress } from "./progress";

/**
 * The Tech Lab (opened from the toolbar's Systems).
 *
 * One console, components/desk/lab-console.tsx, plus data per lab. To add a lab: its console data at
 * public/desk/labs/<id>.json, its key in backend/_seed/grc101_lab_keys.json, a line in LABS, and its row in
 * the Systems menu (build-desk-sample.py: LABS_BUILT). Nothing in the browser says which rows are defects.
 */
export interface LabRef {
  id: string;
  /** Toolbar key of the lab, in the Systems menu. */
  tool: string;
  /** The desk task its findings feed. */
  task: string;
  /** Step of that task whose completion opens the lab ("reached" at the next step): a lab must not answer steps still to do. */
  after: string;
}

export const LABS: LabRef[] = [{ id: "TL-16-BUS-25-BIZ01-C", tool: "systems|AppAdmin (business SaaS)", task: "T6.1", after: "T6.1-7" }];

export const labOf = (toolKey: string) => LABS.find((l) => l.tool === toolKey);
export const labOpen = (l: LabRef, p?: Progress) => !p || !!p.done[l.after] || !!p.submitted[l.task];

export interface LabView {
  key: string;
  title: string;
  sub: string;
  cols: string[];
  /** Columns with a drop-down; every view also has Search. */
  filters: string[];
  rows: string[][];
}
export type LabPart =
  | { id: string; kind: "capture"; title: string; ask: string; where: string }
  /** `from`: the rows come from an earlier part, so nothing lists them before the learner has found them. */
  | { id: string; kind: "rows"; title: string; ask: string; where: string; options: string[]; from: { part: string; keep?: string }[] };

export interface Lab {
  id: string;
  sim: string;
  title: string;
  org: string;
  product: string;
  capability: string;
  tenant: string;
  asOf: string;
  related: string;
  context: string;
  atWork: string;
  owner: [string, string];
  rules: [string, string][];
  views: LabView[];
  parts: LabPart[];
  guide: { view: string; col: string; value: string };
}

/** What Capture evidence records: the view, filter, rows, UTC time and a SHA-256, never the rows' other cells. */
export interface LabCapture {
  ref: string;
  lab: string;
  view: string;
  viewTitle: string;
  filter: string;
  ids: string[];
  utc: string;
  sha: string;
}
export interface LabRow {
  pick: string;
  best: string;
  correct: boolean | null;
  why: string;
}
export type LabResult = { ref?: string; why?: string; hint?: string; correct?: boolean | null; rows?: Record<string, LabRow> };
export interface LabState {
  /** Part id → its result; a capture part is finished only when `correct`. */
  parts: Record<string, LabResult>;
  findings?: string[];
  /** ISO time of Mark complete. */
  done?: string;
}

export const allCaptures = (p: Progress): LabCapture[] => p.labCaptures ?? [];

/** Findings with their evidence refs and times written in: "{admins}" → "E1 (2026-11-02 10:14 UTC)". */
export function labFindings(p: Progress, id: string): string[] {
  const s = p.labs?.[id];
  const caps = allCaptures(p);
  return (s?.findings ?? []).map((f) =>
    f.replace(/\{(\w+)\}/g, (_, part) => {
      const c = caps.find((x) => x.ref === s?.parts[part]?.ref);
      return c ? `${c.ref} (${c.utc})` : "";
    }),
  );
}

/** The lab's findings for the task's hand-in, once complete and only if complete before it was sealed. */
export function labFeed(p: Progress, task: string): string {
  const l = LABS.find((x) => x.task === task);
  const s = l && p.labs?.[l.id];
  if (!l || !s?.done || (p.submitted[task] && p.submitted[task] < s.done)) return "";
  return labFindings(p, l.id).join(" ");
}

/** Rows of a `rows` part, from the learner's own earlier parts. */
export function partRows(part: Extract<LabPart, { kind: "rows" }>, s: LabState, caps: LabCapture[]): string[] {
  const out: string[] = [];
  for (const f of part.from) {
    const r = s.parts[f.part];
    if (r?.rows) out.push(...Object.entries(r.rows).filter(([, v]) => !f.keep || v.best === f.keep).map(([k]) => k));
    else out.push(...(caps.find((c) => c.ref === r?.ref)?.ids ?? []));
  }
  return [...new Set(out)];
}
