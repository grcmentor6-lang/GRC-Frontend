import type { Desk, Task } from "./model";
import { stepKey, type Progress } from "./progress";
import { nextTask } from "../desk-plan";

/**
 * The first week's helpers (UX101 W10, strategy 1 and 5): how long a step takes, where to pause, what was done last
 * and what to do next, and what a hand-in lets the learner say. Pure, so desk-first-week.test.ts can check them.
 * Nothing here reads a score: Week 0 and these cards never count towards one.
 */

/** About how long one step takes: the task's hours (his Tasks sheet) shared by its steps, to the nearest 5 minutes, never under 5. */
export const stepMinutes = (t: Pick<Task, "hrs" | "steps">) => Math.max(5, Math.round((t.hrs * 60) / t.steps.length / 5) * 5);

/** "about 15 min", or "about 1 h 15 min" from 90 minutes up. */
export const aboutMin = (m: number) => `about ${m >= 90 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`}`;

/** A pause is offered once about this much work has gone by since the last one (or the task's start). */
export const PAUSE_AFTER_MIN = 40;

/**
 * A natural place to stop: the step after which at least `PAUSE_AFTER_MIN` minutes of the task have run since the last
 * stopping point. The last step is never one (the task ends there, with its Submit).
 */
export function pauseAfter(t: Pick<Task, "hrs" | "steps">, n: number): boolean {
  const m = stepMinutes(t);
  let run = 0;
  for (const s of t.steps) {
    run += m;
    const stop = run >= PAUSE_AFTER_MIN && s.n !== t.steps[t.steps.length - 1].n;
    if (stop) run = 0;
    if (s.n === n) return stop;
  }
  return false;
}

/** The last step done, in the programme's order (progress keeps no times), or null before any work. */
export function lastDone(desk: Desk, p: Progress): { task: Task; n: number } | null {
  for (let i = desk.order.length - 1; i >= 0; i--) {
    const t = desk.tasks[desk.order[i]];
    for (let j = t.steps.length - 1; j >= 0; j--) if (p.done[stepKey(t.id, t.steps[j].n)]) return { task: t, n: t.steps[j].n };
  }
  return null;
}

/** What to do next: the next unfinished task's first step not done, with its length. Null when every task is in. */
export function firstAction(desk: Desk, p: Progress) {
  const id = nextTask(desk, p);
  if (!id) return null;
  const task = desk.tasks[id];
  const step = task.steps.find((s) => !p.done[stepKey(id, s.n)]) ?? task.steps[task.steps.length - 1];
  const started = task.steps.some((s) => p.done[stepKey(id, s.n)]) || Object.keys(p.submitted).length > 0;
  const minutes = stepMinutes(task);
  return { task, n: step.n, minutes, started, href: `/app/desk#${id}-${step.n}`, label: `${started ? "Continue" : "Start"} ${id} step ${step.n} · ${aboutMin(minutes)}` };
}

/** The learner's own first week: the programme's week 1 is still the one they are working in. */
export const inFirstWeek = (desk: Desk, p: Progress) => {
  const id = nextTask(desk, p);
  return !!id && desk.tasks[id].week === 1;
};

const bare = (s: string) => s.replace(/^[A-Z]\.[ivx]+\s+/, "");
const noParen = (s: string) => s.replace(/\s*\([^)]*\)/g, "").trim();

/**
 * "What you can now say in an interview": only the task's own catalogue fields: the method it practises, its
 * responsibility and the files it hands in. No score, no skill the task does not list, no review.
 */
export function interviewCard(t: Pick<Task, "id" | "title" | "method" | "resp" | "subs">) {
  const handIns = t.subs.map((x) => x.name);
  const method = bare(t.method);
  const skill = noParen(t.resp);
  const list = handIns.length > 1 ? `${handIns.slice(0, -1).join(", ")} and ${handIns[handIns.length - 1]}` : handIns[0] ?? "";
  const line = `In ${t.id}, “${t.title}”, I practised “${method}”${list ? ` and handed in: ${list}` : ""}.`;
  return { method, skill, handIns, line, claims: [method, skill, ...handIns] };
}
