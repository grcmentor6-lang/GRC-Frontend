import { isFillCell, rmfTable, workKind, type Desk, type Step, type Task } from "./model";
import { RMF, rmfFilled, rmfKey } from "./forms";
import { BRIEFS, REGISTERS, briefStatus, regStatus } from "./registers";
import { stepKey, type Progress } from "./progress";

/** Where a task's register lives in progress: one per task and tool, shared by the task's steps. */
export const gridKey = (taskId: string, toolKey: string) => `${taskId}|${toolKey}`;

/**
 * Where a register stands. A row the mentee has started must be finished (every cell left to fill
 * is filled); the step is done once at least one row is, and none is left half-done. The pack does
 * not say which rows belong to which step, so this is the check that can honestly be made.
 */
export function gridStatus(desk: Desk, p: Progress, taskId: string, toolKey: string) {
  const rows = ((desk.tp[toolKey]?.pl as { r?: unknown[][] } | undefined)?.r ?? []) as unknown[][];
  const fills = p.grids?.[gridKey(taskId, toolKey)] ?? {};
  let cells = 0, filled = 0, started = 0, complete = 0;
  rows.forEach((r, ri) => {
    const open = r.map((c, ci) => (isFillCell(c) ? ci : -1)).filter((ci) => ci >= 0);
    if (!open.length) return;
    const got = open.filter((ci) => (fills[`${ri},${ci}`] ?? "").trim()).length;
    cells += open.length;
    filled += got;
    if (got) started++;
    if (got === open.length) complete++;
  });
  return { cells, filled, started, complete, ok: complete > 0 && complete === started };
}

/**
 * Whether a step's work is in: the gate on "Mark activity complete". A decision needs its pick, and
 * then whatever work the pack puts after it ("Then: … copy into table 2", "… submitted").
 */
export function stepAnswered(desk: Desk, p: Progress, task: Task, s: Step): boolean {
  const key = stepKey(task.id, s.n);
  const pick = p.picks[key];
  if (s.kind === "pick" && typeof pick !== "string") return false;
  if (REGISTERS[task.id]?.steps[s.n]) return regStatus(desk, p, task, s.n).ok;
  if (BRIEFS[task.id]?.steps[s.n] !== undefined) return briefStatus(p, task, s.n).ok;
  const t = rmfTable(s);
  if (t !== null) return rmfFilled(p, task.id, t);
  if (s.kind === "each") {
    const rows = task.panel.pl.r ?? [];
    return typeof pick === "object" && rows.length > 0 ? rows.every((_, i) => pick[i]) : typeof pick === "object" && Object.keys(pick).length > 0;
  }
  const kind = workKind(s, desk);
  if (kind === "submit") return !!p.logs?.[key];
  if (s.kind === "pick") return true;
  switch (kind) {
    case "read":
      return (p.acks?.[key] ?? []).includes("read");
    case "grid":
      return gridStatus(desk, p, task.id, s.key).ok;
    case "copy":
      return !!(p.answers[key] ?? "").trim() && !!(p.answers[`${key}#ref`] ?? "").trim();
    case "log":
      return !!p.logs?.[key];
    default:
      return true;
  }
}

/** A step's submission as one readable line, for the step row and My Submissions. */
export function submissionText(desk: Desk, p: Progress, task: Task, s: Step): string {
  const key = stepKey(task.id, s.n);
  const pick = p.picks[key];
  const head = typeof pick === "string" && s.opt ? `${pick}. ${s.opt[pick.charCodeAt(0) - 65] ?? ""}` : "";
  return [head, workText(desk, p, task, s)].filter(Boolean).join(" · ");
}

function workText(desk: Desk, p: Progress, task: Task, s: Step): string {
  const key = stepKey(task.id, s.n);
  const pick = p.picks[key];
  const reg = REGISTERS[task.id];
  if (reg?.steps[s.n]) {
    const g = regStatus(desk, p, task, s.n);
    const cols = reg.steps[s.n].map((ci) => reg.cols[ci].h.split(" ")[0]).join(", ");
    return g.filled ? `${reg.code} column${reg.steps[s.n].length > 1 ? "s" : ""} ${cols}: ${g.filled} of ${g.cells} cells filled` : "";
  }
  const b = BRIEFS[task.id];
  if (b?.steps[s.n] !== undefined) {
    const g = briefStatus(p, task, s.n);
    return g.filled ? `${b.code} section ${b.sections[b.steps[s.n]].h}: ${g.filled} of ${g.cells} lines filled` : "";
  }
  const t = rmfTable(s);
  if (t !== null) {
    const cells = p.grids?.[rmfKey(task.id)] ?? {};
    return rmfFilled(p, task.id, t) ? `${RMF.file} table ${t + 1}: ${RMF.tables[t].rows.map((r, i) => `${r} ${(cells[`${t},${i}`] ?? "").trim()}`).join(" · ")}` : "";
  }
  if (pick && typeof pick === "object") {
    const rows = task.panel.pl.r ?? [];
    return Object.entries(pick).map(([i, v]) => `${rows[+i]?.[0] ?? `Row ${+i + 1}`}: ${v}`).join(" · ");
  }
  const kind = workKind(s, desk);
  if (kind === "submit") {
    const at = p.logs?.[key];
    return at ? `${(p.answers[key] ?? "").trim() || "Submitted"} · receipt ${(p.answers[`${key}#hash`] ?? "").slice(0, 12)}… · ${at.replace("T", " ").slice(0, 19)} UTC` : "";
  }
  if (s.kind !== "do") return "";
  switch (kind) {
    case "read":
      return (p.acks?.[key] ?? []).length ? "Read and confirmed" : "";
    case "grid": {
      const g = gridStatus(desk, p, task.id, s.key);
      return g.filled ? `${g.filled} of ${g.cells} cells filled in ${desk.tp[s.key]?.tool ?? "the register"} · ${g.complete} row${g.complete === 1 ? "" : "s"} complete` : "";
    }
    case "copy": {
      const v = (p.answers[key] ?? "").trim();
      const ref = (p.answers[`${key}#ref`] ?? "").trim();
      return v ? `${v}${ref ? ` · source: ${ref}` : ""}` : "";
    }
    case "log": {
      const at = p.logs?.[key];
      const note = (p.answers[key] ?? "").trim();
      return at ? `Logged ${new Date(at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}${note ? ` · ${note}` : ""}` : "";
    }
    default:
      return (p.answers[key] ?? "").trim();
  }
}
