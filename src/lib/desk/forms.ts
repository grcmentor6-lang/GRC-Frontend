import { dmy, dueDate, testDue, type Desk, type Step, type Task } from "./model";
import { stepKey, type Progress } from "./progress";

/**
 * READ-ME-FIRST (ONB-RMF): the file F1.1 issues with three empty tables, filled by three steps from
 * three screens. Titles and row labels are the engine's (GRC101_Engine/p_tasks.py, F1.1 ONB-RMF).
 */
export const RMF = {
  file: "READ-ME-FIRST",
  tables: [
    { title: "My assignment", from: "Home › My Organisation", rows: ["Organisation 1", "Its home office", "Organisation 2", "Its home office", "Task owner of F1.2", "Your start date"] },
    { title: "My folders", from: "Home › My Tasks › F1.1", rows: ["00_Admin", "01_Inputs", "02_Working", "03_Submission"] },
    { title: "My week-1 dates", from: "Home › My plan", rows: ["F1.2", "F1.3", "KC-01"] },
  ],
};
export const rmfKey = (taskId: string) => `${taskId}|${RMF.file}`;

/** A task's four folders, as the pack writes them: /M2610-00001/W01/F1.1/01_Inputs. */
export function folders(desk: Desk, task: Task): string[] {
  const base = `/${desk.mentee}/W${String(task.week).padStart(2, "0")}/${task.id}`;
  return [`/${desk.mentee}/00_Admin`, `${base}/01_Inputs`, `${base}/02_Working`, `${base}/03_Submission`];
}

/**
 * What each row says on the screen it is copied from. Not an answer key: every value is on a screen
 * the step opens, and KR1 asks for an exact copy, so a mismatch is shown as the mentee types.
 */
export function rmfExpected(desk: Desk, start: Date, t: number): string[] {
  const { A, B } = desk.orgs;
  if (t === 0) return [A.name, A.office, B.name, B.office, desk.tasks["F1.2"]?.owner ?? "", dmy(start)];
  if (t === 1) return folders(desk, desk.tasks["F1.1"]);
  return RMF.tables[2].rows.map((r) => dmy(desk.tasks[r] ? dueDate(start, desk.tasks[r].dueDay) : testDue(start, 1)));
}

export const same = (a: string, b: string) => a.trim().replace(/\s+/g, " ").toLowerCase() === b.trim().replace(/\s+/g, " ").toLowerCase();

export function rmfFilled(p: Progress, taskId: string, t: number): boolean {
  const cells = p.grids?.[rmfKey(taskId)] ?? {};
  return RMF.tables[t].rows.every((_, i) => (cells[`${t},${i}`] ?? "").trim());
}

// ── Submitting a deliverable: the file name by the convention, then a receipt (hash + UTC time). ──

const split = (x: string) => x.split(/,\s*|\s+and\s+|\s+with\s+/).map((c) => c.trim()).filter(Boolean);

/** "POL-CUR, POL-GAP submitted with manifest" → both codes; "Work submitted" → the codes its text names. */
export function submitCodes(task: Task, s: Step): string[] {
  const named = split(s.o.split(/\s+submitted\b/)[0]).filter((c) => task.subs.some((x) => x.code === c));
  if (named.length) return named;
  const m = s.w.match(/Submit ([^.]+)\./);
  return m ? split(m[1]) : [];
}

/** File extensions a deliverable's format allows: "XLSX (template T-OBL)" → ["xlsx"]; a platform form → none. */
export function fileExts(task: Task, code: string): string[] {
  const m = (task.subs.find((x) => x.code === code)?.fmt ?? "").match(/^([A-Z]{3,4}(?:\/[A-Z]{3,4})*)\b/);
  return m ? m[1].toLowerCase().split("/") : [];
}

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
/** <mentee ID>_<task>_<code>_v<n>.<ext>, e.g. M2610-00417_F1.1_ONB-RMF_v1.docx. */
export function fileNameOk(desk: Desk, task: Task, code: string, name: string): boolean {
  const exts = fileExts(task, code);
  return new RegExp(`^${esc(desk.mentee)}_${esc(task.id)}_${esc(code)}_v\\d+\\.(${exts.join("|")})$`, "i").test(name.trim());
}

/** The receipt's hash: SHA-256 over everything the mentee has entered for the task, and the file names. */
export async function receiptHash(desk: Desk, p: Progress, task: Task, files: string[]): Promise<string> {
  const mine = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o ?? {}).filter(([k]) => k.startsWith(`${task.id}-`) || k.startsWith(`${task.id}|`)));
  const body = JSON.stringify({ mentee: desk.mentee, task: task.id, files, picks: mine(p.picks), answers: mine(p.answers), grids: mine(p.grids), acks: mine(p.acks) });
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Steps before this one still open: a deliverable is submitted once the work in it is done. */
export const openBefore = (p: Progress, task: Task, s: Step) => task.steps.filter((x) => x.n < s.n && !p.done[stepKey(task.id, x.n)]).map((x) => x.n);
