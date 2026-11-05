import { isFillCell, rmfTable, workKind, type Desk, type Step, type Task } from "./model";
import { ATTEST, RMF, attestDone, fileExts, fileNameOk, openBefore, rmfAt, rmfExpected, rmfFilled, rmfGiven, rmfKey, submitCodes } from "./forms";
import { LADDER, STUDY, briefOf, briefStatus, compareDone, derivedAt, handedIn, liveRow, regEmpty, regKey, regOf, regRows, regStatus, reportDone } from "./registers";
import { stepKey, type Progress } from "./progress";
import { waitingAt } from "./inbox";
import { CANONICAL_ID, optionOrder, shown } from "./option-order";

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
export function stepAnswered(desk: Desk, p: Progress, task: Task, s: Step, start?: Date): boolean {
  const key = stepKey(task.id, s.n);
  const pick = p.picks[key];
  // A colleague's message placed at this step is answered before the step closes (owner, 31 Oct).
  if (waitingAt(desk, p, task.id, s.n).length) return false;
  if (s.kind === "pick" && (typeof pick !== "string" || !(p.acks?.[key] ?? []).includes("checked"))) return false;
  const att = ATTEST[task.id]?.[s.n];
  if (att) return att.every((a) => attestDone(p, task.id, a.code));
  if (regOf(task.id, s.n)?.report?.step === s.n) return reportDone(desk, p, task);
  const cons = regOf(task.id, s.n)?.consistency;
  if (cons?.step === s.n) {
    const reg = regOf(task.id, s.n)!;
    return !!p.answers[`${key}#checked`] && regRows(reg, p, task.id).every((_, ri) => !cons.bad(liveRow(reg, p, task.id, ri), desk));
  }
  if (regOf(task.id, s.n)?.compare?.step === s.n) return compareDone(regOf(task.id, s.n)!, desk, p, task.id);
  if (regOf(task.id, s.n)?.checkRows?.[s.n] && !p.rowChecks?.[`${task.id}-${s.n}`]) return false;
  // A step that also hands its files in (T6.2 step 6) is done once they are submitted too.
  if (regOf(task.id, s.n)?.steps[s.n]) return regStatus(desk, p, task, s.n).ok && (workKind(s, desk) !== "submit" || !!p.logs?.[key]);
  if (briefOf(task.id, s.n)?.steps[s.n] !== undefined) return briefStatus(p, task, s.n, desk).ok;
  const t = rmfTable(s);
  // A copy is in once it matches the screen it is copied from (KR1: an exact copy), not once typed.
  // A pre-filled table (steps 1 and 5) is done once checked too, so the learner sees each row's verdict.
  if (t !== null) return rmfFilled(p, task.id, t, start && rmfExpected(desk, start, t)) && (!start || !rmfGiven(desk, start, t) || !!p.grids?.[rmfKey(task.id)]?.[rmfAt(t)]);
  if (s.kind === "each") {
    const rows = task.panel.pl.r ?? [];
    return typeof pick === "object" && rows.length > 0 ? rows.every((_, i) => pick[i]) : typeof pick === "object" && Object.keys(pick).length > 0;
  }
  if (LADDER[task.id]?.[s.n]) return (p.acks?.[key] ?? []).includes("done");
  const study = STUDY[task.id]?.[s.n];
  if (study) return study.every((q) => (p.acks?.[key] ?? []).includes(q.id));
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

/** The cells still to fill in each register a step hands in, the learner's only (a derived cell fills itself). */
export function handInGaps(desk: Desk, p: Progress, task: Task, n: number): { code: string; n: number }[] {
  return handedIn(task.id, n)
    .map((reg) => ({ code: reg.code, n: regEmpty(desk, p, task, n, reg).filter((c) => { const [ri, ci] = c.split(",").map(Number); return derivedAt(reg, p, task.id, ri, ci) === null; }).length }))
    .filter((g) => g.n > 0);
}

/** "Fill the 2 empty cells in REG-BRIEF first.", or null when the step's hand-in has none. */
function gapsWhy(desk: Desk, p: Progress, task: Task, n: number): string | null {
  const gaps = handInGaps(desk, p, task, n);
  return gaps.length ? `Fill ${gaps.map((g) => `the ${g.n} empty cell${g.n > 1 ? "s" : ""} in ${g.code}`).join(" and ")} first.` : null;
}

/** Why Submit is not open yet, naming the next thing to do; null once it is. */
export function submitWhy(desk: Desk, p: Progress, task: Task, s: Step): string | null {
  if (waitingAt(desk, p, task.id, s.n).length) return "Reply to your message in the Inbox first.";
  const before = openBefore(p, task, s);
  if (before.length) return `Finish step${before.length > 1 ? "s" : ""} ${before.join(", ")} first.`;
  const gaps = gapsWhy(desk, p, task, s.n);
  if (gaps) return gaps;
  if (handedIn(task.id, s.n).some((reg) => regEmpty(desk, p, task, s.n, reg).length)) return "Wait for the lines the platform writes from your answers.";
  const files = submitCodes(task, s).filter((c) => fileExts(task, c).length);
  if (files.some((c) => !fileNameOk(desk, task, c, p.answers[`${stepKey(task.id, s.n)}#${c}`] ?? ""))) return `Name ${files.length > 1 ? `the ${files.length} files` : "the file"} first.`;
  return null;
}

/**
 * Why "Mark activity complete" is not open yet, naming the next thing to do (owner, 2 Nov 2026: a disabled button
 * always says why). Null once the step's work is in.
 */
export function lockedWhy(desk: Desk, p: Progress, task: Task, s: Step, start?: Date): string | null {
  if (stepAnswered(desk, p, task, s, start)) return null;
  const key = stepKey(task.id, s.n);
  if (waitingAt(desk, p, task.id, s.n).length) return "Reply to your message in the Inbox first.";
  if (s.kind === "pick" && !(p.acks?.[key] ?? []).includes("checked")) return "Pick an option and click Check my answer first.";
  const reg = regOf(task.id, s.n);
  if (reg?.checkRows?.[s.n] && !p.rowChecks?.[`${task.id}-${s.n}`]) return "Fill every row, then click Check my answers.";
  const files = submitCodes(task, s).filter((c) => fileExts(task, c).length).length;
  const submit = workKind(s, desk) === "submit" && !p.logs?.[key] ? (submitWhy(desk, p, task, s) ?? `Submit ${files > 1 ? `the ${files} files` : files ? "the file" : "your work"} first.`) : null;
  if (reg?.steps[s.n]) {
    const g = regStatus(desk, p, task, s.n);
    const left = g.cells - g.filled;
    // A hand-in step counts as Submit does: a cell the platform writes once the others are in (T11.2 step 9's
    // "Found late") is not the learner's to fill, so "3 cells left" beside "2 empty cells" was one count too many.
    if (!g.ok) return gapsWhy(desk, p, task, s.n) ?? (left > 0 ? `Fill or correct the ${left} cell${left > 1 ? "s" : ""} left in ${reg.code} first.` : `Fill ${reg.code} first.`);
    return submit ?? "Finish the step's work above first.";
  }
  if (submit) return submit;
  if (STUDY[task.id]?.[s.n]) return "Find each item above first.";
  if (LADDER[task.id]?.[s.n]) return "Walk the rule above to its first yes first.";
  return "Finish the step's work above first.";
}

/** A step's submission as one readable line, for the step row and My Submissions. A pick is stored canonical and
 *  shown in the learner's letter (option-order.ts), so pass their mentee ID. */
export function submissionText(desk: Desk, p: Progress, task: Task, s: Step, menteeId = CANONICAL_ID): string {
  const key = stepKey(task.id, s.n);
  const pick = p.picks[key];
  const letter = (c: string) => shown(optionOrder(menteeId, s.did ?? key, s.opt!.length), c);
  const head = typeof pick === "string" && s.opt ? `${letter(pick)}. ${s.opt[pick.charCodeAt(0) - 65] ?? ""}` : "";
  return [head, workText(desk, p, task, s)].filter(Boolean).join(" · ");
}

function workText(desk: Desk, p: Progress, task: Task, s: Step): string {
  const key = stepKey(task.id, s.n);
  const pick = p.picks[key];
  const reg = regOf(task.id, s.n);
  if (reg?.steps[s.n]) {
    // regStatus counts the cells the register gives too (it gates Mark complete on them), so an untouched
    // step read "4 of 7 cells filled" (T11.2 step 9). Say nothing until the learner has typed one of its cells.
    const own = reg.steps[s.n];
    const typed = Object.entries(p.grids?.[regKey(task.id, reg.code)] ?? {}).some(([k, v]) => (own.length ? own.includes(Number(k.split(",")[1])) : /^\d+,\d+$/.test(k)) && !!String(v).trim());
    if (!typed) return "";
    const g = regStatus(desk, p, task, s.n);
    const cols = reg.steps[s.n].map((ci) => reg.cols[ci].h.split(" ")[0]).join(", ");
    return g.filled ? `${reg.code} column${reg.steps[s.n].length > 1 ? "s" : ""} ${cols}: ${g.filled} of ${g.cells} cells filled` : "";
  }
  const b = briefOf(task.id, s.n);
  if (b?.steps[s.n] !== undefined) {
    const g = briefStatus(p, task, s.n);
    return g.filled ? `${b.code} section ${b.sections[b.steps[s.n]].h}: ${g.filled} of ${g.cells} lines filled` : "";
  }
  const t = rmfTable(s);
  if (t !== null) {
    const cells = p.grids?.[rmfKey(task.id)] ?? {};
    // Only once checked or completed: tables 1 and 3 arrive pre-filled, and under "You submitted" before the learner had
    // done anything the programme's values read as theirs (tester, 4 Nov, F1.1 step 1).
    return rmfFilled(p, task.id, t) && (!!cells[rmfAt(t)] || !!p.done[key]) ? `${RMF.file} · ${RMF.tables[t].title}: ${RMF.tables[t].rows.map((r, i) => `${r} ${(cells[`${t},${i}`] ?? "").trim()}`).join(" · ")}` : "";
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
