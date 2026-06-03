/**
 * Per-user learnings tree + progress (authed). Mirrors the FastAPI LearningsOut / ProgressOut.
 */
import { api } from "./api";

export type TaskStatus = "not-started" | "in-progress" | "complete" | "locked" | "upcoming" | "active";

export interface LearningStep {
  id: string;
  code: string;
  /** Canonical verb id (matches lib/verbs.ts) — backend is source of truth for which verb. */
  verb: string;
  title: string;
  /** Authoritative per-step status from the backend. */
  status?: "pending" | "current" | "in-progress" | "complete" | "locked";
}

export interface LearningTask {
  id: string;
  code: string;
  title: string;
  standards: string;
  status: TaskStatus;
  done: number;
  total: number;
  steps: LearningStep[];
}

export interface LearningProject {
  id: string;
  code: string;
  title: string;
  standards: string;
  status: TaskStatus;
  tasks: LearningTask[];
}

export interface LearningOrg {
  id: string;
  name: string;
  industry: string;
  initials: string;
  tone: string;
  status: TaskStatus;
  context: string;
  projects: LearningProject[];
}

export interface Learnings {
  programId: string;
  status: "active" | "locked";
  orgs: LearningOrg[];
}

export interface Progress {
  programId: string;
  overallPct: number;
  currentPhase: number;
  totalPhases: number;
  activitiesDone: number;
  activitiesTotal: number;
  avgScore: number;
  scoreOutOf: number;
  reviewsCount: number;
  verbsPracticed: number;
  verbsTotal: number;
  standardsEngaged: { label: string; tone: string }[];
  rubricScores: { id: string; label: string; value: number }[];
}

export const learningsApi = {
  get: (program: string) => api.get<Learnings>("/me/learnings", { query: { program } }),
  progress: (program: string) => api.get<Progress>("/me/progress", { query: { program } }),
};
