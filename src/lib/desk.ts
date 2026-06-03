/**
 * Working Desk — activity workspace + grading loop. Mirrors the FastAPI Slice-A contract:
 * GET /me/activities/{id}, PUT …/draft, POST …/submit, GET /me/submissions/{id}.
 */
import { api } from "./api";

export interface ActivityPayload {
  fields: Record<string, unknown>;
  notes: string;
  attachments: unknown[];
}

export interface Layer1Check {
  label: string;
  passed: boolean;
  detail: string;
}
export interface Layer1Result {
  passed: boolean;
  checks: Layer1Check[];
}

export interface ReviewDimension {
  id: string;
  label: string;
  score: number;
  justification: string;
}
export interface Review {
  id: number;
  submissionId: number;
  overallScore: number;
  dimensions: ReviewDimension[];
  feedback: string;
  decision: "pass" | "revise" | string;
  model: string;
  createdAt: string;
}

export interface ActivityDetail {
  id: string;
  code: string;
  verb: { id: string };
  title: string;
  taskCode: string;
  taskTitle: string;
  status: string;
  draft: ActivityPayload | null;
  latestReview: Review | null;
}

export interface SubmitResponse {
  submissionId: number;
  layer1: Layer1Result;
  review: Review | null;
}

export interface SubmissionSummary {
  id: number;
  revisionNo: number;
  status: string;
  createdAt: string;
  layer1: Layer1Result | null;
}
export interface SubmissionDetail {
  submission: SubmissionSummary;
  review: Review | null;
}

export interface ActivityFeedItem {
  activityId: string;
  activityCode: string;
  activityTitle: string;
  taskCode: string;
  verb: string;
  overallScore: number;
  decision: "pass" | "revise" | string;
  feedback: string;
  createdAt: string;
}

export const deskApi = {
  activity: (id: string) => api.get<ActivityDetail>(`/me/activities/${id}`),
  saveDraft: (id: string, payload: ActivityPayload) =>
    api.put<{ ok: boolean }>(`/me/activities/${id}/draft`, { payload }),
  submit: (id: string, payload: ActivityPayload) =>
    api.post<SubmitResponse>(`/me/activities/${id}/submit`, { payload }),
  submissions: (id: string) => api.get<SubmissionDetail[]>(`/me/activities/${id}/submissions`),
  activityFeed: (program = "grc101") =>
    api.get<ActivityFeedItem[]>("/me/activity-feed", { query: { program } }),
};
