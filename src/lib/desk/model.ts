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
  refs: { rules: string[]; docs: string[]; pages: string[]; tpls: string[]; ds: string[]; clauses: string[] };
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
  cached ??= fetch("/desk/sample.json").then((r) => {
    if (!r.ok) throw new Error(`Desk content failed to load (${r.status})`);
    return r.json();
  });
  return cached;
}

/** The eight questions, in the order the mentee meets them: what, how, why, then the rest.
 *  `card` is the task-card key in the content; `title`, where set, is what the screen says instead. */
export const QUESTIONS = [
  { key: "do", label: "Do", icon: "qDo", card: "What will I do" },
  { key: "how", label: "How", icon: "qHow", card: "How to do it" },
  { key: "why", label: "Why", icon: "qWhy", card: "Why am I doing this" },
  { key: "where", label: "Where", icon: "qWhere", card: "Where to add" },
  { key: "read", label: "Reference", icon: "qRead", card: "What to read or refer", title: "References" },
  { key: "deliver", label: "Deliver", icon: "qDeliver", card: "What to deliver" },
  { key: "learn", label: "Learn", icon: "qLearn", card: "What will I learn" },
  { key: "impact", label: "Impact", icon: "qImpact", card: "Why is this important" },
] as const;
export type QuestionKey = (typeof QUESTIONS)[number]["key"];
/** The heading a question shows on screen. */
export const qTitle = (q: (typeof QUESTIONS)[number]): string => ("title" in q ? q.title : q.card);

/** "KR2 — … · Activities 3–4" / "· Activity 7" / "· Activities 10–14 of T3.1" → [3, 4]. */
export function krActivities(kr: string): number[] {
  const m = kr.match(/Activit(?:y|ies)\s+(\d+)(?:\s*[–-]\s*(\d+))?/);
  if (!m) return [];
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
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

/** Reference ids an activity cites, flattened for the "Read" view. */
export type RefKind = "rule" | "page" | "tpl" | "ds" | "doc" | "clause";
export function stepRefs(s: Step): { kind: RefKind; id: string }[] {
  const r = s.refs;
  return [
    ...r.rules.map((id) => ({ kind: "rule" as const, id })),
    ...r.pages.map((id) => ({ kind: "page" as const, id })),
    ...r.tpls.map((id) => ({ kind: "tpl" as const, id })),
    ...r.ds.map((id) => ({ kind: "ds" as const, id })),
    ...r.docs.map((id) => ({ kind: "doc" as const, id })),
    ...r.clauses.map((id) => ({ kind: "clause" as const, id })),
  ];
}
