import type { Desk, Task } from "./model";
import type { Progress } from "./progress";

/**
 * A task's deliverable as a template register the steps fill column by column (T-FAM, T-OBL …).
 * Columns and step wording are the engine's (GRC101_Engine/p_tasks.py); given rows are the mentee's
 * dataset (Sample_Packs/mentee/<id>/Datasets_*.xlsx). Cells left "" are the mentee's to fill.
 *
 * ponytail: rows are the sample mentee's (M2610-00001), like public/desk/sample.json. Phase 1 serves
 * them per mentee from /me/desk with the rest of the content.
 */
export interface Register {
  /** Template code, as the step names it. */
  code: string;
  title: string;
  /** Steps that show it in place of their tool: the ones that fill it and the ones that read it. */
  on: number[];
  cols: {
    h: string;
    /** A drop-down: "step" takes the options of the step that fills it, a list is the template's own. */
    opts?: "step" | string[];
    /** Numbered by the platform, never typed: "OBL" → OBL-01, OBL-02 … */
    auto?: string;
  }[];
  /** Given rows; empty for a register the mentee builds row by row (see `grow`). */
  rows: string[][];
  /**
   * A register built from nothing: the mentee adds rows, up to `target`. `adds` is step → the
   * fewest rows that step must add (0: it may add some); a step not listed fills its columns on
   * every row, and a step with no columns is done when the register has exactly `target` rows.
   */
  grow?: { target: number; adds: Record<number, number> };
  /** Sources a step reads from that its own refs do not name (or name only as a whole document). */
  extra?: Record<number, [string, string[]][]>;
  /** Rows the mentee fills; the others are worked examples, read-only. */
  mine: (row: string[], desk: Desk) => boolean;
  /** Step number → the columns it fills. */
  steps: Record<number, number[]>;
}

const A = (row: string[], desk: Desk) => row[0] === desk.orgs.A.name;

export const REGISTERS: Record<string, Register> = {
  "F1.2": {
    code: "T-FAM",
    title: "FAM-MAP · Framework map (template T-FAM)",
    on: [1, 2, 3, 4, 5],
    cols: [
      { h: "A Organisation" },
      { h: "B Standard" },
      { h: "C Mandatory/Optional" },
      { h: "D Instrument type (R01)", opts: "step" },
      { h: "E Offices (R02)" },
      { h: "F Rule" },
      { h: "G Evidence ref" },
    ],
    // FAM-LIST, W01. ponytail: the dataset gives the worked rows' D and E only; F and G are filled by
    // the pack's own step rule ("R01", "; R02", "<addendum> §2–§3"), which is what step 1 says they hold.
    rows: [
      ["GlobalConnect Customer Solutions", "ISO/IEC 27001:2022", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "DPA 2012 (Philippines)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "PCI DSS v4.0.1 (for financial clients)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "HIPAA (for US healthcare clients)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "GDPR (for EU client data)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "ISO 18295 (Customer Contact Centres)", "Optional", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "COPC CX Standard", "Optional", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "ISO 9001", "Optional", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "SOC 2 Type II", "Optional", "", "", "", ""],
      ...[
        ["ISO/IEC 27001:2022", "Mandatory", "Certifiable standard"],
        ["KVKK (Turkey) — Law 6698", "Mandatory", "Law / regulation"],
        ["GDPR (EU)", "Mandatory", "Law / regulation"],
        ["COPPA Rule (16 CFR 312)", "Mandatory", "Law / regulation"],
        ["FERPA (34 CFR 99)", "Mandatory", "Law / regulation"],
        ["ISO/IEC 29151", "Mandatory", "Code of practice"],
        ["ISO/IEC 27701", "Optional", "Certifiable standard (extension to ISO/IEC 27001)"],
        ["NIST Privacy Framework 1.0", "Optional", "Voluntary framework"],
        ["SDPC National Data Privacy Agreement", "Optional", "Model contract"],
        ["iNACOL / NSQOL standards", "Optional", "Voluntary framework"],
      ].map(([b, c, d]) => ["LearnTech Educational Solutions", b, c, d, "see BKB-ADD-36 §2", "R01; R02", "BKB-ADD-36 §2–§3"]),
    ],
    mine: A,
    // 3: D + "R01" in F · 4: E + "; R02" in F · 5: G
    steps: { 3: [3, 5], 4: [4, 5], 5: [6] },
  },
  "F1.3": {
    code: "CTX-IP",
    title: "CTX-IP · Interested parties",
    on: [5],
    cols: [{ h: "Party" }, { h: "Internal/External" }, { h: "Requirement" }, { h: "Standard/law" }, { h: "Rule" }, { h: "Evidence ref" }],
    // Five rows: the first five parties of the addendum §4 (rule R04).
    rows: Array.from({ length: 5 }, () => ["", "", "", "", "", ""]),
    mine: () => true,
    steps: { 5: [0, 1, 2, 3, 4, 5] },
  },
  "T3.1": {
    code: "T-OBL",
    title: "OBL-REG · Obligations register extract (template T-OBL)",
    on: [1, 2, 3, 4, 5, 6, 7],
    // The 12 columns of T-OBL (GRC101_Engine/p_tasks.py T3.1; MenteePack Ref-Templates: "12 columns").
    cols: [
      { h: "Obl. ID", auto: "OBL" },
      { h: "Obligation (plain English)" },
      { h: "Source instrument" },
      { h: "Article/clause" },
      { h: "Type", opts: ["law", "reg", "standard", "contract"] },
      { h: "Office(s)" },
      { h: "Process" },
      { h: "Owner role" },
      { h: "Evidence of compliance" },
      { h: "Frequency / deadline" },
      { h: "Linked BKB policy" },
      { h: "Evidence ref" },
    ],
    rows: [],
    mine: () => true,
    // 1–4 copy obligations in (R10: one per row), 5 owns them from the linked policy, 6 stops at 15,
    // 7 checks each clock against BKB-ERM-001 Annex A ("Differs — addendum governs").
    steps: { 1: [1, 2, 3, 4, 5, 11], 2: [1, 2, 3, 4, 5, 11], 3: [1, 2, 3, 4, 5, 11], 4: [1, 2, 3, 4, 5, 11], 5: [6, 7, 8, 9, 10], 6: [], 7: [9] },
    grow: { target: 15, adds: { 1: 1, 2: 0, 3: 1, 4: 3 } },
    extra: {
      3: [["BKB-ADD-16", ["2.1", "6"]]],
      4: [["Organization_Profiles", ["1"]]],
      5: [["BKB-POL-000", ["3"]], ["BKB-POL-014", ["5"]]],
      7: [["BKB-ERM-001", ["Annex A"]]],
    },
  },
};

export const regKey = (taskId: string, code: string) => `${taskId}|${code}`;

/** The register's rows: the given ones, or as many blank ones as the mentee has added. */
export function regRows(reg: Register, p: Progress, taskId: string): string[][] {
  if (!reg.grow) return reg.rows;
  const n = Number(p.grids?.[regKey(taskId, reg.code)]?.["#rows"] ?? 0);
  return Array.from({ length: n }, () => reg.cols.map(() => ""));
}

/** The step that added a row, for a register the mentee builds. */
export const addedBy = (reg: Register, p: Progress, taskId: string, ri: number) => Number(p.grids?.[regKey(taskId, reg.code)]?.[`${ri},by`] ?? 0);

/** A cell's value: the given value, the platform's number, or the mentee's entry. */
export function cellValue(reg: Register, p: Progress, taskId: string, ri: number, ci: number): string {
  const auto = reg.cols[ci].auto;
  if (auto) return `${auto}-${String(ri + 1).padStart(2, "0")}`;
  return reg.rows[ri]?.[ci] || (p.grids?.[regKey(taskId, reg.code)]?.[`${ri},${ci}`] ?? "");
}

/** How far a step's columns are filled on the rows it answers for; done when every one is. */
export function regStatus(desk: Desk, p: Progress, task: Task, n: number) {
  const reg = REGISTERS[task.id];
  if (!reg) return { cells: 0, filled: 0, ok: false, rows: 0 };
  const cols = reg.steps[n] ?? [];
  const rows = regRows(reg, p, task.id);
  if (reg.grow && !cols.length) return { cells: reg.grow.target, filled: rows.length, ok: rows.length === reg.grow.target, rows: rows.length };
  const adds = reg.grow?.adds[n];
  const mineRows = rows.map((r, ri) => ri).filter((ri) => (adds === undefined ? reg.mine(rows[ri], desk) : addedBy(reg, p, task.id, ri) === n));
  let cells = 0, filled = 0;
  for (const ri of mineRows)
    for (const ci of cols) {
      cells++;
      if (cellValue(reg, p, task.id, ri, ci).trim()) filled++;
    }
  const enough = adds === undefined ? cells > 0 : mineRows.length >= adds;
  return { cells, filled, ok: enough && filled === cells, rows: mineRows.length };
}

/** Grid cells with a row added (stamped with the step that added it) or one removed and the rest moved up. */
export function addRow(cells: Record<string, string>, n: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  return { ...cells, "#rows": String(count + 1), [`${count},by`]: String(n) };
}
export function removeRow(cells: Record<string, string>, ri: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  const out: Record<string, string> = { "#rows": String(Math.max(0, count - 1)) };
  for (const [k, v] of Object.entries(cells)) {
    const m = k.match(/^(\d+),(.+)$/);
    if (!m) continue;
    const r = Number(m[1]);
    if (r < ri) out[k] = v;
    else if (r > ri) out[`${r - 1},${m[2]}`] = v;
  }
  return out;
}

/** The sources a step reads, its own refs first; an `extra` entry replaces a ref to the same document. */
export function stepSources(task: Task, n: number, own: [string, string[]][]): [string, string[]][] {
  const extra = REGISTERS[task.id]?.extra?.[n] ?? BRIEFS[task.id]?.extra?.[n] ?? [];
  return [...own.filter(([id]) => !extra.some(([x]) => x === id)), ...extra];
}

/** What a step shows in place of its tool: the task's register or its brief, when the step works on it. */
export function deliverableFor(task: Task, n: number): "register" | "brief" | null {
  if (REGISTERS[task.id]?.on.includes(n)) return "register";
  if (BRIEFS[task.id]?.on.includes(n)) return "brief";
  return null;
}

/**
 * A document template with fixed sections (T-CTX …): one section given as the worked example, the
 * others filled by the steps, each with its "Source:" line. Sections and their lines are the engine's.
 */
export interface Brief {
  code: string;
  title: string;
  /** Printed in the footer, as the pack requires (BKB-POL-004 §3.1). */
  label: string;
  sections: { h: string; /** The worked example: a cited document section shown as given. */ given?: [string, string[]]; /** Labelled lines; none means a free list, one item per line. */ lines?: string[] }[];
  on: number[];
  /** Step number → the section it fills. */
  steps: Record<number, number>;
  /** Sources a step reads from that the pack names only as a workbook not on the platform. */
  extra?: Record<number, [string, string[]][]>;
}

export const BRIEFS: Record<string, Brief> = {
  "F1.3": {
    code: "T-CTX",
    title: "CTX-BRIEF · Context brief (template T-CTX)",
    label: "Internal",
    sections: [
      { h: "1 Services", given: ["BKB-ADD-16", ["1.1"]] },
      { h: "2 Data handled" },
      { h: "3 Legal environment", lines: ["Law", "Authority", "Breach clock", "Cyber law", "Transfer rule"] },
      { h: "4 Mission Critical assets" },
    ],
    on: [1, 2, 3, 4],
    steps: { 2: 1, 3: 2, 4: 3 },
    // ponytail: Information_Asset_Register_by_Department.xlsx is not in the pack; BKB-ADD-16 §8.1 is the
    // register's Mission Critical assets by office, the same filter step 4 asks for. Swap in the
    // workbook when it ships.
    extra: { 4: [["BKB-ADD-16", ["8.1"]]] },
  },
};

export const briefKey = (taskId: string, code: string) => `${taskId}|${code}`;

/** A section is done when every line (or the list) and its Source line are filled. */
export function briefStatus(p: Progress, task: Task, n: number) {
  const b = BRIEFS[task.id];
  const sec = b?.steps[n];
  if (!b || sec === undefined) return { ok: false, filled: 0, cells: 0 };
  const v = p.grids?.[briefKey(task.id, b.code)] ?? {};
  const keys = [...(b.sections[sec].lines ?? [""]).map((_, i) => `${sec},${i}`), `${sec},src`];
  const filled = keys.filter((k) => (v[k] ?? "").trim()).length;
  return { ok: filled === keys.length, filled, cells: keys.length };
}
