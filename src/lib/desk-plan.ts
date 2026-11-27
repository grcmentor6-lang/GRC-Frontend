import { dayIndex, dueDate, weekOpen, type Desk, type Task } from "@/lib/desk/model";
import { stepKey, type Progress } from "@/lib/desk/progress";
import { ACCESS_WEEKS } from "@/lib/programme";

/**
 * The mentee's plan as the Working Desk itself computes it, from ONE date: their start date (users.start_date, on
 * GET /me as `startDate`). Week n begins 7·(n−1) days after it; a task is due start + dueDay; a week's check on the
 * week's last day (model.ts testDue); the Onboarding record's dates in F1.1 are the same sums (forms.ts rmfExpected).
 * The access end is the server's `accessExpiresOn` (start + 14 weeks + bonus) and is the one date a re-plan never moves.
 * Dashboard, Calendar, the Up-next bell, the desk's week panel, task sheet and week overview all read this module, so
 * they say the same thing. Pure, so it can be checked without React (desk-plan.test.ts).
 *
 * "Overdue" is only ever said of the one task the learner is on, their next unfinished task in the programme's order:
 * never before the start, never before they have done anything at all, never of a task or week they have not reached
 * (it waits behind the one in hand, so it cannot be late yet). A task whose date has passed but which the learner has
 * not reached is "not-reached", drawn plainly as "Not started yet".
 */
export type DueState = "submitted" | "overdue" | "today" | "upcoming" | "not-reached" | "not-open";

export interface PlanTask {
  id: string;
  title: string;
  week: number;
  /** The organisation(s) it is for. */
  org: Task["org"];
  due: Date;
  /** Whole days from today to the due date; negative once past. */
  left: number;
  state: DueState;
  stepsDone: number;
  steps: number;
}

/** The learner's next unfinished task in the programme's order: where the desk opens. Null when every task is in. */
export const nextTask = (desk: Desk, p: Progress): string | null => desk.order.find((id) => !p.submitted[id]) ?? null;

/** The week the learner is working in: their next unfinished task's. One past the last week when every task is in. */
export function workWeek(desk: Desk, p: Progress): number {
  const id = nextTask(desk, p);
  return id ? desk.tasks[id].week : desk.weeks.length + 1;
}

/** The learner has reached week `n` in their own order: every task of the weeks before it is handed in. */
export const weekReached = (desk: Desk, p: Progress, n: number) => workWeek(desk, p) >= n;

/** Every task of week `n` is handed in (what a week's knowledge check waits for). */
export const weekDone = (desk: Desk, p: Progress, n: number) => desk.order.every((id) => desk.tasks[id].week !== n || !!p.submitted[id]);

/** The week the calendar says it is, from the start date: 0 before the start, and not capped at the last week. */
export const calendarWeek = (start: Date, now = new Date()) => Math.max(0, Math.floor(dayIndex(start, now) / 7) + 1);

export function planOf(desk: Desk, p: Progress, start: Date, preview = false, now = new Date()): PlanTask[] {
  const today = dayIndex(start, now);
  const mine = nextTask(desk, p);
  const begun = Object.keys(p.done).length > 0 || Object.keys(p.submitted).length > 0;
  return desk.order.map((id) => {
    const t = desk.tasks[id];
    const left = t.dueDay - today;
    const open = preview || weekOpen(t.week, start, now);
    const state: DueState = p.submitted[id] ? "submitted" : !open ? "not-open" : left < 0 ? (begun && id === mine ? "overdue" : "not-reached") : left === 0 ? "today" : "upcoming";
    return {
      id, title: t.title, week: t.week, org: t.org, due: dueDate(start, t.dueDay), left, state,
      stepsDone: t.steps.filter((s) => p.done[stepKey(id, s.n)]).length, steps: t.steps.length,
    };
  });
}

/** The step to continue: the first open task not handed in, at its first step not done. Null when every open task is in. */
export function nextStep(desk: Desk, p: Progress, plan: PlanTask[]) {
  const t = plan.find((x) => x.state !== "submitted" && x.state !== "not-open");
  if (!t) return null;
  const steps = desk.tasks[t.id].steps;
  const s = steps.find((x) => !p.done[stepKey(t.id, x.n)]) ?? steps[steps.length - 1];
  return { task: t, n: s.n, href: `/app/desk#${t.id}-${s.n}` };
}

/** "Overdue by 2 days" / "Due today" / "Due in 3 days" / "Not started yet": the one wording, everywhere. */
export function dueText(t: PlanTask): string {
  if (t.state === "submitted") return "Submitted";
  if (t.state === "not-reached") return "Not started yet";
  if (t.left < 0) return `Overdue by ${-t.left} day${t.left === -1 ? "" : "s"}`;
  if (t.left === 0) return "Due today";
  if (t.left === 1) return "Due tomorrow";
  return `Due in ${t.left} days`;
}

/** How loudly a due line is drawn. Only "late" is red, and only for work the learner has reached. */
export type Urgency = "done" | "late" | "today" | "soon" | "later";
export const urgency = (t: PlanTask): Urgency =>
  t.state === "submitted" ? "done" : t.state === "overdue" ? "late" : t.state === "today" ? "today" : t.state === "upcoming" && t.left === 1 ? "soon" : "later";

/**
 * What being late costs, as the code has it (27 Nov 2026): nothing. No score, badge or certificate rule reads a due
 * date (backend services/desk_record.py, certificate.py; lib/desk/badges.ts); a knowledge check's "late" is its own
 * timer running out, not its week's date. The access end is the only date with a consequence.
 * The Guide's "Deadlines and late work" and the overdue label's tooltip both say this sentence.
 */
export const LATE_RULE =
  "Due dates are a plan to keep you on pace. Handing in late loses no marks and blocks no badge or certificate. The one fixed date is the end of your access.";

// ── Catching up: a learner two or more weeks behind the calendar is offered a new plan, not a page of red. ──

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
/** A local day as "2026-11-27" (never toISOString: before 05:30 in India that is still yesterday). */
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const midnight = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);
/** `n` days after a local day, as a local midnight (by calendar day, so a clock change cannot shift it). */
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** The access end for a first choice of start date: start + 14 weeks (backend services/schedule.py access_expires_on). */
export const accessEndFor = (startIso: string) => isoDay(addDays(midnight(startIso), ACCESS_WEEKS * 7));

/** Where a learner stands against their access: "open" (weeks 1-12), "grace" (from the first day of week 13 to the access
 *  end, inclusive) or "ended" (the desk is read-only; backend api/deps.py desk_write_refusal). Local days, like the rest. */
export function accessPhase(startIso: string | null | undefined, accessEndIso: string | null | undefined, today: Date = new Date()): "open" | "grace" | "ended" {
  if (!startIso || !accessEndIso) return "open";
  const t = isoDay(today);
  if (t > accessEndIso.slice(0, 10)) return "ended";
  return t >= isoDay(addDays(midnight(startIso), 84)) ? "grace" : "open";
}

/** A start date may move to `newIso` only if the whole programme still fits before the access end, which stays put
 *  (backend services/schedule.py restart_error holds the same rule). */
export const fitsAccess = (desk: Desk, newIso: string, accessEndIso: string | null | undefined) =>
  !accessEndIso || addDays(midnight(newIso), desk.weeks.length * 7) <= midnight(accessEndIso);

export const BEHIND_WEEKS = 2;

export interface CatchUp {
  /** Whole weeks the calendar is ahead of the learner's own week. */
  weeksBehind: number;
  /** The learner's week, and the calendar's. */
  week: number;
  calendar: number;
  /** The start date that puts the learner's week at today (ISO), or null when the 12 weeks would no longer fit
   *  before the access end: then the offer is the focus list alone. */
  newStart: string | null;
  /** The next tasks to hand in, in order. */
  focus: PlanTask[];
  /** Days of access left, when the access end is known. */
  daysLeft: number | null;
}

/** The catch-up offer, or null when the learner is less than two weeks behind (or done, or not started). */
export function catchUp(desk: Desk, p: Progress, start: Date, accessEndIso?: string | null, now = new Date()): CatchUp | null {
  const week = workWeek(desk, p);
  if (week > desk.weeks.length) return null;
  const calendar = calendarWeek(start, now);
  const weeksBehind = calendar - week;
  if (weeksBehind < BEHIND_WEEKS) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const moved = isoDay(addDays(today, -7 * (week - 1)));
  const focus = planOf(desk, p, start, true, now).filter((t) => t.state !== "submitted").slice(0, 3);
  return {
    weeksBehind, week, calendar, focus,
    newStart: fitsAccess(desk, moved, accessEndIso) ? moved : null,
    daysLeft: accessEndIso ? Math.round((midnight(accessEndIso).getTime() - today.getTime()) / DAY) : null,
  };
}
