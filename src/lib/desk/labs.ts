import type { Progress } from "./progress";

/**
 * The Tech Lab (opened from the toolbar's Systems).
 *
 * One console, components/desk/lab-console.tsx, plus data per lab. To add a lab: its console data at
 * public/desk/labs/<id>.json, its key in backend/_seed/grc101_lab_keys.json, a line in LABS, and its row in
 * the Systems menu (build-desk-sample.py: LABS_BUILT). Nothing in the browser says which rows are defects.
 * Labs are required: see LABS below.
 */
export interface LabRef {
  id: string;
  /** Toolbar key of the lab, in the Systems menu. */
  tool: string;
  /** The desk task its findings feed. */
  task: string;
  /** Step of that task whose completion opens the lab: a lab must not answer steps still to do. */
  after: string | null;
}

// The five Tech Lab simulators are mandatory parts of GRC 101 (owner, 26 Nov 2026). Each joins one sprint, opens when the step
// named in `after` is done (a lab must not answer steps still to do), and its task's Submit stays closed until the lab is
// marked complete with its findings recorded (lib/desk/work.ts submitWhy; the server decides the same in api/desk.py and
// services/desk_record.py). `after` must come before the task's hand-in step. Placement and why: docs/li101/labs.md.
export const LABS: LabRef[] = [
  { id: "TL-36-BUS-03-FIN01-C", tool: "systems|LedgerSim", task: "T3.2", after: "T3.2-5" },
  { id: "TL-16-BUS-25-BIZ01-C", tool: "systems|AppAdmin (business SaaS)", task: "T7.1", after: "T7.1-4" },
  { id: "TL-36-SOC-14-SIEM01-O", tool: "systems|LogLens", task: "T9.2", after: "T9.2-5" },
  { id: "TL-36-INF-07-NET02-C", tool: "systems|NetShield", task: "T10.1", after: "T10.1-5" },
  { id: "TL-36-SOC-08-DLP02-C", tool: "systems|DataSentry", task: "T10.1", after: "T10.1-5" },
];

export const labOf = (toolKey: string) => LABS.find((l) => l.tool === toolKey);
export const labOpen = (l: LabRef, p?: Progress) => !!l.after && (!p || !!p.done[l.after] || !!p.submitted[l.task]);
/** A lab is complete once Mark complete is pressed, which the console allows only with the findings in. */
export const labDone = (l: LabRef, p: Progress) => !!p.labs?.[l.id]?.done && !!p.labs?.[l.id]?.findings?.length;
/** The task's labs that are open and not complete yet: what its Submit waits for. */
export const labsLeft = (task: string, p: Progress) => LABS.filter((l) => l.task === task && labOpen(l, p) && !labDone(l, p));
/** "Finish the Tech Lab LedgerSim (Systems › LedgerSim on the toolbar) first.", or null. */
export const labWhy = (task: string, p: Progress): string | null => {
  const left = labsLeft(task, p);
  if (!left.length) return null;
  const n = (l: LabRef) => l.tool.split("|")[1].replace(" (business SaaS)", "");
  return `Finish the Tech Lab ${left.map(n).join(" and ")} first (Systems on the toolbar): ${left.length > 1 ? "they are" : "it is"} part of this task.`;
};

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
  /** Where the findings land in the related task's hand-in. */
  feed: string;
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
  /** UTC time the learner deleted it: a stub that only holds its number. */
  deleted?: string;
}
export interface LabRow {
  pick: string;
  best: string;
  correct: boolean | null;
  why: string;
}
export type LabResult = {
  ref?: string;
  why?: string;
  hint?: string;
  correct?: boolean | null;
  rows?: Record<string, LabRow>;
  /** Capture parts: wrong checks so far (the server's count), and whether the answer was shown: the part then reads
   *  "shown, not found", scores nothing and bars "with distinction". `recipe` is the filter it was shown. */
  misses?: number;
  released?: boolean;
  recipe?: string;
};
/** Wrong checks after which a capture part may ask to be shown the answer (the server's LAB_SHOW_AFTER). */
export const LAB_SHOW_AFTER = 3;
export interface LabState {
  /** Part id → its result; a capture part is finished only when `correct`. */
  parts: Record<string, LabResult>;
  findings?: string[];
  /** ISO time of Mark complete. */
  done?: string;
}

// A deleted capture stays in the list as a stub (`deleted` set, its rows and hash dropped), so its E-number is never
// given again: numbering counts the whole list. Everything a learner sees reads this, which leaves the stubs out.
export const allCaptures = (p: Progress): LabCapture[] => (p.labCaptures ?? []).filter((c) => !c.deleted);

/** Why a capture may not be deleted, or null: one behind a right answer is the evidence for a finding the memo
 *  records, and evidence behind a recorded finding is never removed (Decisions Made, Tech Lab). */
export function keptFor(s: LabState, ref: string, parts: LabPart[]): string | null {
  const i = parts.findIndex((x) => s.parts[x.id]?.ref === ref && s.parts[x.id]?.correct === true);
  return i < 0 ? null : `Kept: the evidence for your right answer to question ${i + 1}${s.done ? " and the findings" : ""}.`;
}

/** The list with one capture deleted: a stub keeps its number, nothing of what it held. */
export const deleteCapture = (all: LabCapture[], ref: string, utc: string): LabCapture[] =>
  all.map((c) => (c.ref === ref ? { ref: c.ref, lab: c.lab, view: "", viewTitle: "", filter: "", ids: [], utc: c.utc, sha: "", deleted: utc } : c));

/** Findings with their evidence refs and times written in: "{admins}" → "E1 (2026-11-02 10:14 UTC)". */
export function labFindings(p: Progress, id: string): string[] {
  const s = p.labs?.[id];
  const caps = allCaptures(p);
  return (s?.findings ?? []).map((f) =>
    f.replace(/\{(\w+)\}/g, (_, part) => {
      if (s?.parts[part]?.released) return `the filter shown to you after ${LAB_SHOW_AFTER} tries`; // a part found with help is not evidence of the learner's own
      const c = caps.find((x) => x.ref === s?.parts[part]?.ref);
      return c ? `${c.ref} (${c.utc})` : "";
    }),
  );
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
