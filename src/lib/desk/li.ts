import type { Desk } from "./model";
import { stepKey, type Progress } from "./progress";

/**
 * The ISO/IEC 27001 Lead Implementer map on the Certification page, from his workbook's ISO coverage sheet
 * (docs/li101/LI101_source.xlsx, carried into sample.json as `isocov` by scripts/build-li101.py): every clause 4–10
 * requirement and Annex A control, the week and task(s) that implement it, and how deep. How far the mentee is comes
 * from their desk progress, so nothing here is stored.
 */
export interface LiReq { ref: string; title: string; theme: string; week: number; tasks: string; depth: string; docs: string }
export interface LiMap { intro: string; levels: string; clauses: LiReq[]; controls: LiReq[] }

export const LI_INTRO =
  "GRC 101 follows one ISO/IEC 27001:2022 implementation over 12 weeks: the context, scope and baseline gap first (weeks 1–2); leadership, risk, the Statement of Applicability and support (weeks 3–6); thirteen control sprints that implement and evidence all 93 Annex A controls (weeks 3–10); then measurement, internal audit, management review and certification readiness (weeks 11–12). It is an intern-level programme: it prepares you to sit a Lead Implementer course and exam, and does not award, replace or guarantee any certification. The PECB \"Lead Implementer\" credential additionally requires 5 years of professional experience (2 in information security management) and 300 hours of ISMS project activity. ISO text is not reproduced.";

export const LI_LEVELS =
  "Depth: Clause deliverable (you produce what the clause requires) · Deep-dive (a full evidence pack for the control) · Sprint (the control's status, maturity level and first evidence item, in a control sprint).";

/** The documented information each clause requires (ISO/IEC 27001:2022, summarised); "—" where it requires none. */
const DOCS: Record<string, string> = {
  "4.3": "Scope of the ISMS",
  "5.2": "Information security policy",
  "6.1.2": "Information security risk assessment process",
  "6.1.3": "Risk treatment process; Statement of Applicability",
  "6.2": "Information security objectives",
  "7.2": "Evidence of competence",
  "7.5": "Documented information determined necessary by the organisation",
  "8.1": "Documented information to have confidence processes were carried out as planned",
  "8.2": "Results of risk assessments",
  "8.3": "Results of risk treatment",
  "9.1": "Monitoring and measurement results",
  "9.2": "Audit programme(s) and audit results",
  "9.3": "Results of management reviews",
  "10.2": "Nature of nonconformities, actions taken and results of corrective action",
};

/** "4.1 Understanding the organization…" → ref and title; "Annex A — Organizational" → its theme. */
export function liMap(desk: Pick<Desk, "isocov">): LiMap {
  const rows = (desk.isocov ?? []).map(([req, type, week, tasks, depth]) => {
    const [, ref, title] = req.match(/^(\S+)\s+(.*)$/) ?? [, req, ""];
    return { type, req: { ref, title, theme: type.replace(/^Annex A\s+[—–-]\s+/, ""), week, tasks, depth, docs: type === "Clause" ? DOCS[ref] ?? "—" : "" } };
  });
  return {
    intro: LI_INTRO,
    levels: LI_LEVELS,
    clauses: rows.filter((r) => r.type === "Clause").map((r) => r.req),
    controls: rows.filter((r) => r.type !== "Clause").map((r) => r.req),
  };
}

/** The tasks a cell names ("T4.1, F2.2"; "T10.2, T3.2–T10.2 control sprints"). The rest is shown as written. */
export function workIn(cell: string): string[] {
  return [...new Set(cell.match(/\b[FT]\d{1,2}\.\d\b/g) ?? [])];
}

/** Where a task stands, by its steps. */
export function itemProgress(desk: Desk, p: Progress, id: string): { done: number; total: number } {
  const steps = desk.tasks[id]?.steps ?? [];
  return { done: steps.filter((s) => p.done[stepKey(id, s.n)]).length, total: steps.length };
}

export const itemDone = (desk: Desk, p: Progress, id: string) => {
  const g = itemProgress(desk, p, id);
  return g.total > 0 && g.done === g.total;
};

export type Standing = "done" | "started" | "open" | "none";
/** A row of the map: done when all the tasks it names are done. A row naming none is "none". */
export function standing(desk: Desk, p: Progress, cells: string[]): { state: Standing; done: number; total: number } {
  const ids = [...new Set(cells.flatMap(workIn))].filter((id) => desk.tasks[id]);
  const done = ids.filter((id) => itemDone(desk, p, id)).length;
  const started = ids.some((id) => itemProgress(desk, p, id).done > 0);
  return { state: !ids.length ? "none" : done === ids.length ? "done" : started || done ? "started" : "open", done, total: ids.length };
}

/** Where a task lives on the desk, so a chip can open the work itself. */
export const itemHref = (desk: Desk, id: string): string | null => (desk.tasks[id] ? `/app/desk#${id}` : null);
