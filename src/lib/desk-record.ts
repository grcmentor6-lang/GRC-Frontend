"use client";

import { whenDmy } from "@/lib/dates";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "@/lib/api";
import { ALL_WEEKS_OPEN } from "@/lib/flags";
import { loadDesk, startOf, weekOpen, type Desk } from "@/lib/desk/model";
import { stepKey, useProgress, type Progress } from "@/lib/desk/progress";
import type { Scores } from "@/lib/desk/badges";
import { LI_MARK } from "./desk/li-reset";

/**
 * The learner's record as My Submissions and Reports read it: the desk catalogue plus this account's
 * saved desk work (desk_progress), and one set of counts both pages show, so they always agree.
 * ponytail: client-side over useProgress; swap for GET /me/record when it lands (dates per step live there).
 */
export function useDeskRecord() {
  const { user } = useAuth();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { progress, status, retry } = useProgress(user?.email ?? "");
  useEffect(() => {
    loadDesk().then(setDesk, (e: Error) => setError(e.message));
  }, []);
  const start = useMemo(() => startOf(user?.startDate), [user?.startDate]);
  const preview = ALL_WEEKS_OPEN || user?.role === "admin";
  const state: "loading" | "failed" | "ready" = error || status === "failed" ? "failed" : !desk || !user || status !== "ready" ? "loading" : "ready";
  // Only weeks that have opened, week 1 first: what is not open yet has nothing to show.
  const weeks = desk ? desk.weeks.filter((w) => preview || weekOpen(w.n, start)) : [];
  return { state, desk, progress, start, weeks, retry: error ? () => location.reload() : retry };
}

/**
 * Released task scores (0-100), by task id, from GET /me/record: the server re-checks each pick against its
 * key at submission (backend services/desk_record.task_scores), so a score is never worked out in the browser.
 * A submitted task the server released no score for maps to null; a task not submitted is absent.
 * Null while loading; an empty map when the record cannot be read.
 */
export function useTaskScores(): Scores | null {
  const [scores, setScores] = useState<Scores | null>(null);
  useEffect(() => {
    let live = true;
    api
      .get<{ tasks: { taskId: string; submittedAt: string | null; releasedScore: number | null }[] }>("/me/record")
      .then((r) => Object.fromEntries(r.tasks.filter((t) => t.submittedAt).map((t) => [t.taskId, t.releasedScore])))
      .catch(() => ({}))
      .then((s) => live && setScores(s));
    return () => {
      live = false;
    };
  }, []);
  return scores;
}


export interface ScoreItem {
  kind: "decision" | "inbox" | "rows"; id: string; title: string; fraction: number; why: string;
  rowsRight?: number; rowsTotal?: number; worth: number; earned: number; lost: number;
  wrong: { label: string; pick: string; best: string; why: string }[];
}
/** What a released score is made of (backend desk_record.score_breakdown): earned points add up to the score. Private to the learner. */
export interface ScoreBreakdown { score: number; items: ScoreItem[]; note: string }

/**
 * The breakdown of each submitted task's score, by task id, from the same GET /me/record. Null while loading.
 * ponytail: its own GET beside useTaskScores' (as kc-record.tsx has); share one fetch if a fourth reader appears.
 */
export function useScoreBreakdowns(): Record<string, ScoreBreakdown> | null {
  const [b, setB] = useState<Record<string, ScoreBreakdown> | null>(null);
  useEffect(() => {
    let live = true;
    api
      .get<{ tasks: { taskId: string; submittedAt: string | null; scoreBreakdown?: ScoreBreakdown | null }[] }>("/me/record")
      .then((r) => Object.fromEntries(r.tasks.filter((t) => t.submittedAt && t.scoreBreakdown).map((t) => [t.taskId, t.scoreBreakdown as ScoreBreakdown])))
      .catch(() => ({}))
      .then((x) => live && setB(x));
    return () => {
      live = false;
    };
  }, []);
  return b;
}

/** Shown for a submitted task the server released no score for: it had no item an answer key could check. */
export const NOT_SCORED = "Not scored: this task has no answer-key items";

/** The average of the released scores, rounded to a whole number as on the Certificate and CV; null when none is released. */
export function averageScore(scores: Scores): number | null {
  const got = Object.values(scores).filter((s): s is number => typeof s === "number");
  return got.length ? Math.round(got.reduce((x, y) => x + y, 0) / got.length) : null;
}

/** The counts both pages show. A decision is a step that asks for a pick ("pick" or per-row "each"). */
export function recordCounts(desk: Desk, p: Progress) {
  const tasks = desk.order.map((id) => desk.tasks[id]);
  const steps = tasks.flatMap((t) => t.steps.map((s) => ({ t, s, done: !!p.done[stepKey(t.id, s.n)] })));
  const decisions = steps.filter((x) => x.s.kind !== "do");
  return {
    steps: steps.length,
    stepsDone: steps.filter((x) => x.done).length,
    decisions: decisions.length,
    decisionsDone: decisions.filter((x) => x.done).length,
    tasks: tasks.length,
    tasksSubmitted: tasks.filter((t) => p.submitted[t.id]).length,
  };
}

/** True when the account has saved nothing at all on the desk: the honest empty record. */
export const recordEmpty = (p: Progress) =>
  !Object.keys(p.done).length && !Object.keys(p.submitted).length && !Object.keys(p.answers).some((k) => k !== LI_MARK) && !Object.keys(p.picks).length && !Object.keys(p.grids ?? {}).length;

export const fmtWhen = (iso: string) => whenDmy(iso);
