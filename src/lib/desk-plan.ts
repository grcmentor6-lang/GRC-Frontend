import { dayIndex, dueDate, weekOpen, type Desk } from "@/lib/desk/model";
import { stepKey, type Progress } from "@/lib/desk/progress";

/**
 * The mentee's plan as the Working Desk itself computes it: every task's due date (start + dueDay),
 * whether it is handed in, and the next step to do. Dashboard, Calendar, the Up-next bell and the
 * header gauge all read this, so they say what the desk says. Pure, so it can be checked without React.
 */
export type DueState = "submitted" | "overdue" | "today" | "upcoming" | "not-open";

export interface PlanTask {
  id: string;
  title: string;
  week: number;
  due: Date;
  /** Whole days from today to the due date; negative once past. */
  left: number;
  state: DueState;
  stepsDone: number;
  steps: number;
}

export function planOf(desk: Desk, p: Progress, start: Date, preview = false, now = new Date()): PlanTask[] {
  const today = dayIndex(start, now);
  return desk.order.map((id) => {
    const t = desk.tasks[id];
    const left = t.dueDay - today;
    const open = preview || weekOpen(t.week, start, now);
    const state: DueState = p.submitted[id] ? "submitted" : !open ? "not-open" : left < 0 ? "overdue" : left === 0 ? "today" : "upcoming";
    return {
      id, title: t.title, week: t.week, due: dueDate(start, t.dueDay), left, state,
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

/** "Overdue by 2 days" / "Due today" / "Due in 3 days": the desk's own wording (week-panel.tsx). */
export function dueText(t: PlanTask): string {
  if (t.state === "submitted") return "Submitted";
  if (t.left < 0) return `Overdue by ${-t.left} day${t.left === -1 ? "" : "s"}`;
  if (t.left === 0) return "Due today";
  if (t.left === 1) return "Due tomorrow";
  return `Due in ${t.left} days`;
}
