/**
 * Per-activity schedule (authed). Mirrors GET /me/schedule.
 * Each activity gets its planned day (from the RUA/Actions/Research timeline) + a status.
 * Used across the Working Desk to show deadlines next to steps, tasks and the open activity.
 */
import { isoDmy } from "@/lib/dates";
import { api } from "./api";

export type ScheduleStage = "rua" | "actions" | "research";
export type ScheduleStatus = "done" | "overdue" | "upcoming";

export interface ScheduleItem {
  activityId: string;
  taskCode: string;
  stage: ScheduleStage;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  status: ScheduleStatus;
}

export const scheduleApi = {
  get: (program = "grc101") =>
    api.get<ScheduleItem[]>("/me/schedule", { query: { program } }),
};

const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);

/** "Tue 15 Jul" — compact absolute date. */
export function fmtDue(iso: string): string {
  const d = parseISO(iso);
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${isoDmy(iso)}`;
}

/** Days from today (negative = past). */
function daysFromToday(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseISO(iso).getTime() - today.getTime()) / 86400000);
}

/** Chip label + ring/text classes for a scheduled activity. Done wins; else overdue is red,
 *  due within 2 days is amber, otherwise a quiet slate. Shows the absolute date, not "in N days". */
export function dueChip(item: Pick<ScheduleItem, "date" | "status">): { text: string; cls: string } {
  if (item.status === "done") return { text: "Done", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
  const due = fmtDue(item.date);
  if (item.status === "overdue") return { text: `Overdue · ${due}`, cls: "bg-rose-50 text-rose-700 ring-rose-100" };
  const soon = daysFromToday(item.date) <= 2;
  return { text: `Due ${due}`, cls: soon ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-slate-50 text-slate-600 ring-slate-200" };
}
