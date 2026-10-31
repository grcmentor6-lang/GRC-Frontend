/**
 * GRC 101 v1.8.8 desk content — the shape the engine produces for one mentee.
 *
 * ponytail: `loadDesk` reads the sample mentee (M2610-00001) extracted by
 * scripts/build-desk-sample.py. Phase 1 swaps the fetch for the backend's /me/desk, which runs the
 * engine per mentee and keeps answer keys server-side. Nothing else here changes.
 */

export type Table = { h: string[]; r: string[][] };
export type StepKind = "do" | "pick" | "each";

export interface Step {
  n: number;
  t: string;
  w: string;
  tool: string;
  key: string;
  o: string;
  sec: string;
  kind: StepKind;
  opt: string[] | null;
  why: string | null;
  did: string | null;
  help: string;
  li: string | null;
  refs: { rules: string[]; /** [document, sections cited] */ docs: [string, string[]][]; pages: string[]; tpls: string[]; ds: string[]; clauses: string[] };
}

export interface Task {
  id: string;
  week: number;
  title: string;
  obj: string;
  krs: string[];
  inputs: string[];
  dueDay: number;
  hrs: number;
  org: "A" | "B" | "AB";
  orglbl: string;
  owner: string;
  support: string;
  rev: string;
  subs: { code: string; name: string; fmt: string }[];
  refs: string[];
  anchor: string;
  card: Record<string, string | string[]>;
  meta: { stage: string; thread: string; domains: string[]; builds: string[]; feeds: string[]; sec: string; tool: string; template: string; record: string };
  panel: { tool: string; stamp: string; kind: string; pl: Partial<Table> };
  steps: Step[];
  li: string[];
  inj: string[];
  hc: string;
  weight: number;
  ndec: number;
}

export interface Week {
  n: number; ph: string; th: string; obj: string; lead: string; deliver: string; resp: [string, string][];
  /** How the week runs: the Monday brief, the messages, the pre-written help. */
  meet: string;
  support: [string, string][];
  crit: string[];
  hc?: string; gate?: string; kc?: string;
}
export interface Inject {
  task: string; id: string; type: string; sim_notice: string; notice: string; options: string[];
  sender: string; ref: string; assess: string; dueDay: number;
  /** What to do with it, in the pack's words ("Read the situation.", "Add the rows…"). */
  steps: string[];
  /** Minutes after the task is first opened that the message arrives. */
  release_offset_min: number;
}
export interface Org {
  key: "A" | "B"; name: string; short: string; office: string; offices: string[]; industry: string;
  context: string; standards?: unknown; legal_note?: string;
}
export interface Section { t: string; sub: string; tools: { n: string; d: string; k: string; /** Week it opens, when later than its section. */ u?: number }[] }
export interface ToolMock { tool: string; stamp: string; kind: string; pl: Record<string, unknown>; /** Built live: "tasks" (this week's tasks) or "inbox" (the task messages). */ dyn?: "tasks" | "inbox" }
/** A platform screen as a task sees it: a task with its own data on a shared screen has it under "<key>#<task>" (T6.2's
 *  leavers on Access Reviews › Terminated User Check, which shows T6.1's review to every other task). */
export const screenOf = (desk: { tp: Record<string, ToolMock> }, key: string, task?: string | null): ToolMock | undefined =>
  (task ? desk.tp[`${key}#${task}`] : undefined) ?? desk.tp[key] ?? desk.tp[`${key.split("|")[0]}|*`];
export interface LiExt { id: string; host: string; week: number; title: string; hours: number; clauses: string; obj: string; kr: string }

export interface Desk {
  mentee: string;
  version: string;
  orgs: Record<"A" | "B", Org>;
  weeks: Week[];
  order: string[];
  tasks: Record<string, Task>;
  rules: Record<string, [string, string]>;
  pages: Record<string, Table>;
  tpls: Record<string, [string, string, string, string]>;
  ds: Record<string, Table>;
  docs: Record<string, string>;
  inj: Record<string, Inject>;
  sections: Record<string, Section>;
  secs: ({ k: string; l: string; u: number } | null)[];
  ut: { k: string; l: string }[];
  tp: Record<string, ToolMock>;
  /** Section key → the rule that governs work in it ("Evidence must be dated…"). */
  guard: Record<string, string>;
  cards: Record<string, [string, string | string[]][]>;
  notes: Record<string, [number, string, string, string, string][]>;
  li: Record<string, LiExt>;
  litrack: { title: string; hours: number; obj: string; note: string };
  people: { office: [string, string, string, string[], string[]][]; human: [string, string, string][] };
  connections: { stages: string[][]; threads: string[][]; links: string[][] };
  library: { docs: [string, string, [string, string][]][] };
  iso: Record<string, string>;
  help: [string, string][];
  /** The five pass rules, in the manual's words. */
  gates: string[];
  domains: Record<string, string>;
  programme: { title: string; weeks: number; hours_per_week: string; model: string };
}

let cached: Promise<Desk> | null = null;
export function loadDesk(): Promise<Desk> {
  // "no-cache": revalidate with the server on every load, so a rebuilt sample.json reaches testers at
  // once instead of an old copy the browser kept (the file is not fingerprinted). Still a 304 when unchanged.
  cached ??= fetch("/desk/sample.json", { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(`Desk content failed to load (${r.status})`);
    return r.json();
  });
  return cached;
}

/** The eight questions, in the order the mentee meets them: what, how, why, then the rest.
 *  `card` is the task-card key in the content; `title`, where set, is what the screen says instead. */
/**
 * The help on a step, behind its "Help with this step" button. Trimmed 2026-10-15 to what the row
 * does not already say: How's plain-English note now sits inside Do, Where and Deliver are the
 * "Do this step in … / Done when" bar, Learn's rules are under Reference, Impact repeated Why.
 */
export const QUESTIONS = [
  { key: "do", label: "Do", icon: "qDo", card: "What will I do" },
  { key: "why", label: "Why", icon: "qWhy", card: "Why am I doing this" },
  { key: "read", label: "Reference", icon: "qRead", card: "What to read or refer", title: "References" },
] as const;
export type QuestionKey = (typeof QUESTIONS)[number]["key"];
/** The heading a question shows on screen. */
export const qTitle = (q: (typeof QUESTIONS)[number]): string => ("title" in q ? q.title : q.card);

/** "KR2 — … · Activities 3–4" / "· Activity 7" / "· Activities 10–14 of T3.1" → [3, 4]. */
export function krActivities(kr: string): number[] {
  // "Activities 1–3, 6": a list of steps and ranges (T12.1's KR1 named step 6 after its range).
  const m = kr.match(/Activit(?:y|ies)\s+(\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+(?:\s*[–-]\s*\d+)?)*)/);
  if (!m) return [];
  return m[1].split(",").flatMap((part) => {
    const [a, b = a] = part.split(/[–-]/).map((x) => Number(x.trim()));
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  });
}

export function krFor(task: Task, n: number): { kr: string; index: number } | null {
  const index = task.krs.findIndex((k) => krActivities(k).includes(n));
  return index < 0 ? null : { kr: task.krs[index], index };
}

/** "KR2 — Sample size … · Activities 3–4" → { tag: "KR2", text: "Sample size …" }. */
export function splitKr(kr: string): { tag: string; text: string } {
  const [tag, rest = ""] = kr.split(" — ");
  return { tag, text: rest.replace(/\s*·\s*Activit.*$/, "") };
}

// ── Schedule. A mentee starts any day; week n opens 7·(n−1) days after their start. ──

const DAY = 86_400_000;
export function dayIndex(start: Date, now = new Date()): number {
  return Math.floor((now.getTime() - start.getTime()) / DAY);
}
/** The mentee's start date ("2026-10-08") as local midnight; today when none is set. */
export function startOf(iso: string | null | undefined): Date {
  const d = iso ? new Date(`${iso.slice(0, 10)}T00:00:00`) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekOpen(week: number, start: Date, now = new Date()): boolean {
  return dayIndex(start, now) >= (week - 1) * 7;
}
export function currentWeek(start: Date, now = new Date()): number {
  return Math.min(12, Math.max(1, Math.floor(dayIndex(start, now) / 7) + 1));
}
export function dueDate(start: Date, dueDay: number): Date {
  return new Date(start.getTime() + dueDay * DAY);
}
export const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
/** A week's test (KC-01, FGE…) is due on the last day of its week: Sun 11 Oct for a Mon 05 Oct start. */
export const testDue = (start: Date, week: number) => dueDate(start, week * 7 - 1);
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** 05-OCT-2026: the date format the pack asks the mentee to write. */
export const dmy = (d: Date) => `${String(d.getDate()).padStart(2, "0")}-${MON[d.getMonth()]}-${d.getFullYear()}`;

/**
 * A reading step ("Nothing to produce — you read …") is worked by reading the screen and confirming
 * it. Returns the parts to confirm, or null for a step that produces something. (v1.8.9 turned the
 * one step that read both organisations into copying from them, READ-ME-FIRST table 1.)
 */
export function readingParts(s: Step): string[] | null {
  return /^nothing to produce/i.test(s.o) ? ["read"] : null;
}

/** "READ-ME-FIRST table 2 filled (4 folder paths)" → 1: the READ-ME-FIRST table a step fills. */
export function rmfTable(s: Step): number | null {
  const m = s.o.match(/READ-ME-FIRST table (\d)/);
  return m ? Number(m[1]) - 1 : null;
}

/** A register cell the pack leaves for the mentee: "copy", "copy from …", "calc", or blank. */
export const isFillCell = (c: unknown) => /^(copy\b.*|calc)$/i.test(String(c ?? "").trim()) || String(c ?? "").trim() === "";
/** A register cell a decision step fills: "◆" or "◆ Decide". */
export const isDecideCell = (c: unknown) => String(c ?? "").trim().startsWith("◆");

/**
 * How a "do" step is worked, from what the pack says it produces:
 *   read — "Nothing to produce — you read …": read it and confirm (readingParts);
 *   grid — "Values copied …" in a register with cells left to fill: fill them in the register;
 *   copy — "Values copied …" anywhere else: the value(s) plus where they came from;
 *   form — "READ-ME-FIRST table n filled": fill that table (lib/desk/forms);
 *   submit — "… submitted with manifest": name each file by the convention, submit, get a receipt;
 *   log  — "Step ticked in the work log": tick it, time-stamped;
 *   note — anything else: a short note of what was done.
 */
export type WorkKind = "read" | "grid" | "copy" | "log" | "form" | "submit" | "note";
export function workKind(s: Step, desk: Desk): WorkKind {
  if (s.kind === "do" && rmfTable(s) !== null) return "form";
  if (readingParts(s)) return "read";
  // "Values copied …", "Four organisation labels copied with source", "Section 2 copied with source"
  if (/\bcopied\b/i.test(s.o)) {
    const pl = desk.tp[s.key]?.pl as { h?: unknown[]; r?: unknown[][] } | undefined;
    return pl?.h && pl.r?.some((r) => r.some(isFillCell)) ? "grid" : "copy";
  }
  if (/\bsubmitted\b/.test(s.o)) return "submit";
  if (/^step ticked in the work log/i.test(s.o)) return "log";
  return "note";
}

/** Reference ids an activity cites, flattened for the "Read" view. */
export type RefKind = "rule" | "page" | "tpl" | "ds" | "doc" | "clause";
export function stepRefs(s: Step): { kind: RefKind; id: string }[] {
  const r = s.refs;
  return [
    ...r.rules.map((id) => ({ kind: "rule" as const, id })),
    ...r.pages.map((id) => ({ kind: "page" as const, id })),
    ...r.tpls.map((id) => ({ kind: "tpl" as const, id })),
    ...r.ds.map((id) => ({ kind: "ds" as const, id })),
    // A document citation carries its sections: "BKB-ADD-16#7", "BKB-ERM-001#6.2–6.4".
    ...r.docs.map(([id, secs]) => ({ kind: "doc" as const, id: secs.length ? `${id}#${secs.join(",")}` : id })),
    ...r.clauses.map((id) => ({ kind: "clause" as const, id })),
  ];
}
