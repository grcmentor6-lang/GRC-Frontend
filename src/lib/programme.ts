import { useEffect, useState } from "react";
import { loadDesk, type Desk } from "@/lib/desk/model";
import { LABS } from "@/lib/desk/labs";
import { opensAfter } from "@/lib/desk/kc";

/**
 * The programme's facts, in one place. Guide, Help, billing panel, Calendar, org cards and the certificate copy read
 * these, so a number is never typed into a page. Derived from the desk (public/desk/sample.json) and the record code
 * wherever it can be; what only the server knows is mirrored here and pinned by programme.test.ts against the server's
 * own files (a drift fails the test, it does not ship quietly).
 */

/** The programme's size, for text that renders before the desk has loaded. programme.test.ts pins these to sample.json;
 *  programmeFacts(desk) reads the desk itself. */
export const COUNTS = { weeks: 12, tasks: 25, steps: 216, labs: LABS.length, labTasks: new Set(LABS.map((l) => l.task)).size };

/** Platform access from the start date (backend services/schedule.py ACCESS_DAYS = 14 * 7). W1's access end date reads this. */
export const ACCESS_WEEKS = 14;
/** The one-time extension for sharing on LinkedIn (backend SHARE_BONUS_DAYS = 28). */
export const SHARE_BONUS_WEEKS = 4;
/** A failed exam's further attempt opens this many days after the last (backend desk_kc.RETAKE_DAYS). */
export const RETAKE_DAYS = 7;

export interface ExamFact { id: "FGE" | "FEX"; title: string; questions: number; minutes: number; attempts: number; passMark: number; week: number }
/** backend/_seed/grc101_kc_keys.json "checks" (kind gate / final). */
export const EXAMS: ExamFact[] = [
  { id: "FGE", title: "Foundation Gate Exam", questions: 30, minutes: 45, attempts: 2, passMark: 70, week: 2 },
  { id: "FEX", title: "Final Exam + practical station", questions: 40, minutes: 60, attempts: 2, passMark: 60, week: 12 },
];

/** Task scores (0-100, from the answer keys) are released at submission and shown on My Submissions, Dashboard,
 *  Reports, CV and Certificate (backend desk_record released_score). No mentor or person marks them. */
export const SCORES_SHOWN = true;

/** The support model, stated as it is (owner, 26 Nov 2026: no mentor review; 27 Nov: a 24-hour email reply when stuck). */
export const SUPPORT_LINES = {
  live: "There is no live chat and no mentor or person reviewing your work. Every brief, note and message is pre-written, and your work is checked automatically.",
  help: "Help with this step (the ? on a step) gives the note and references for it.",
};

/** What "Report a problem" sends (components/app/feedback-widget.tsx), and what happens next (owner, 27 Nov 2026: 24-hour reply when stuck). */
export const REPORT_SENDS =
  "Report a problem sends the note you type, the page you were on, the task and step you had open (for example F1.1 step 4) and, only if you add one, a screenshot. The programme office reads every report. Tick “I'm stuck and can't continue” and it replies to your sign-in email within 24 hours. Your own past reports are listed in the same box.";

/** True since UX101 W5: lib/desk/glossary.test.ts fails when a code in step text has no entry. */
export const GLOSSARY_LINE =
  "Learn › Glossary explains every code and term the desk uses in plain English, and you can search it. On a step, hover over (or tap) a code to read its meaning without leaving the step.";

export interface ProgrammeFacts {
  weeks: number; tasks: number; steps: number; labs: number;
  accessWeeks: number; shareBonusWeeks: number;
  exams: ExamFact[]; scoresShown: boolean;
  toolbar: { week: number; sections: string[] }[];
  orgs: OrgCount[];
}
export interface OrgCount { key: "A" | "B"; name: string; own: number; examplesIn: number; role: "main" | "examples" }

/** Toolbar sections by the week they open (desk.secs[].u). Utilities with no week (Inbox, Systems, Help) are left out. */
export function toolbarByWeek(desk: Desk): { week: number; sections: string[] }[] {
  const by = new Map<number, string[]>();
  for (const s of desk.secs) if (s) by.set(s.u, [...(by.get(s.u) ?? []), s.l]);
  return [...by.entries()].sort((a, b) => a[0] - b[0]).map(([week, sections]) => ({ week, sections }));
}

/** Tasks per organisation without counting a joint task twice: the organisation you work for owns its tasks; the one
 *  that only supplies worked examples shows how many tasks borrow from it, not "25". */
export function orgCounts(desk: Desk): OrgCount[] {
  const total = desk.order.length;
  return (["A", "B"] as const).map((k) => {
    const mine = desk.order.filter((id) => desk.tasks[id].org === k).length;
    const touched = desk.order.filter((id) => desk.tasks[id].org.includes(k)).length;
    const main = touched >= total / 2;
    return { key: k, name: desk.orgs[k].short, own: main ? total : mine, examplesIn: main ? 0 : touched, role: main ? "main" : "examples" };
  });
}

export function programmeFacts(desk: Desk): ProgrammeFacts {
  return {
    weeks: desk.programme.weeks,
    tasks: desk.order.length,
    steps: desk.order.reduce((n, id) => n + desk.tasks[id].steps.length, 0),
    labs: LABS.length,
    accessWeeks: ACCESS_WEEKS,
    shareBonusWeeks: SHARE_BONUS_WEEKS,
    exams: EXAMS,
    scoresShown: SCORES_SHOWN,
    toolbar: toolbarByWeek(desk),
    orgs: orgCounts(desk),
  };
}

/** "F1.1–F2.2" / "all 25 tasks (F1.1–T12.2)": the tasks an exam waits for. The rule itself is lib/desk/kc.ts
 *  opensAfter (the server's opens_after), so the Guide and the Calendar cannot say something the desk does not do. */
export function examOpensAfter(desk: Desk, e: ExamFact): string {
  const ids = opensAfter(desk, e.id);
  const span = ids.length > 2 ? `${ids[0]}–${ids[ids.length - 1]}` : ids.join(" and ");
  return ids.length === desk.order.length ? `all ${ids.length} tasks (${span})` : span;
}

/** The desk's Help screen: the pack's entries, with the two that made claims the product cannot keep corrected. */
export function helpEntries(desk: Desk): [string, string][] {
  return desk.help.map(([t, d]) => {
    if (t === "Report a problem") return [t, `Broken file, missing value, outside data offered: use the Report a problem button at the bottom right. ${REPORT_SENDS}`];
    if (t === "Glossary") return [t, GLOSSARY_LINE];
    return [t, d];
  });
}

/** Client pages: the facts once the desk has loaded. */
export function useProgrammeFacts(): { desk: Desk | null; facts: ProgrammeFacts | null } {
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => { loadDesk().then(setDesk, () => setDesk(null)); }, []);
  return { desk, facts: desk ? programmeFacts(desk) : null };
}
