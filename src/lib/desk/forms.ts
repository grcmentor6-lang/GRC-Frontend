import { dmy, dueDate, testDue, type Desk, type Step, type Task } from "./model";
import { stepKey, type Progress } from "./progress";

/**
 * READ-ME-FIRST (ONB-RMF): the file F1.1 issues with three empty tables, filled by three steps from
 * three screens. Titles and row labels are the engine's (GRC101_Engine/p_tasks.py, F1.1 ONB-RMF).
 */
export const RMF = {
  file: "READ-ME-FIRST",
  tables: [
    // Row labels name the value to write, in the words of the screen it is copied from: My
    // Organisation calls the organisations Org A and Org B (the engine's "Organisation 1 / 2").
    { title: "My assignment", from: "Home › My Organisation", rows: ["Org A name", "Org A home office", "Org B name", "Org B home office", "Task owner of F1.2", "Your start date"] },
    { title: "My folders", from: "Home › My Tasks › F1.1", rows: ["00_Admin path", "01_Inputs path", "02_Working path", "03_Submission path"] },
    { title: "My week-1 dates", from: "Home › My plan", rows: ["F1.2 due date", "F1.3 due date", "KC-01 due date"] },
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
  return RMF.tables[2].rows.map((r) => {
    const id = r.split(" ")[0]; // "F1.2 due date" → F1.2
    return dmy(desk.tasks[id] ? dueDate(start, desk.tasks[id].dueDay) : testDue(start, 1));
  });
}

/**
 * The onboarding attestations, done on the F1.1 steps that ask for them: the undertaking (signed with
 * full name and mentee ID) and the four data rules (each ticked, then saved). The pack describes them
 * only in a line each, so every item below restates a line of the pack, and says which:
 *   Undertaking — "Own work, workspace files only, report outside data. E-signature." (F1.1 panel);
 *     "Accounts are personal. Sharing breaks the undertaking" (F1.1-D1, BKB-POL-024 §3.1).
 *   Data rules — "synthetic data only, own work, no AI tools for task work" (F1.1 What will I learn,
 *     BKB-POL-024 §3.1, BKB-POL-022 §7.1); "work data never leaves the platform" (F1.1-D2).
 * Not yet reviewed by a GRC professional.
 */
export const ATTEST: Record<string, Record<number, { code: string; title: string; items: string[]; sign: boolean }>> = {
  "F1.1": {
    2: {
      code: "ADM-UND",
      title: "Undertaking",
      sign: true,
      items: [
        "All the work I submit is my own.",
        "I keep task files in my workspace only.",
        "I report any outside data I come across.",
        "My account is personal. I do not share it.",
      ],
    },
    3: {
      code: "ADM-RULES",
      title: "Data and AI rules",
      sign: false,
      items: [
        "I use only the synthetic data the platform gives me.",
        "All my task work is my own.",
        "I use no AI tool for task work.",
        "Task data never leaves the platform.",
      ],
    },
  },
};
export const attestKey = (taskId: string, code: string) => `${taskId}|${code}`;
/** Signed or saved: the time is set only by the form's own button. */
export const attestDone = (p: { grids?: Record<string, Record<string, string>> }, taskId: string, code: string) =>
  !!p.grids?.[attestKey(taskId, code)]?.at;

/** The READ-ME-FIRST rows that hold a date: "Your start date" in table 1 and all of table 3. */
export const isDateRow = (t: number, i: number) => t === 2 || (t === 0 && i === 5);

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** A date picker's "2026-10-18" as the pack writes it, "18-OCT-2026" (stored and checked that way). */
export const isoToDmy = (iso: string) => (iso ? dmy(new Date(`${iso}T00:00:00`)) : "");
/** Back again, for the picker to show what is stored; "" when the stored value is not a date. */
export function dmyToIso(v: string): string {
  const m = v.trim().toUpperCase().match(/^(\d{1,2})-([A-Z]{3})-(\d{4})$/);
  const mon = m ? MON.indexOf(m[2]) : -1;
  return m && mon >= 0 ? `${m[3]}-${String(mon + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
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
