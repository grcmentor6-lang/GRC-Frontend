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
  /** The one concrete thing that would have scored higher. Empty at full marks. */
  missing?: string;
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

export interface MentorReview {
  decisionId: number;
  outcome: "approve" | "approve_note" | "disapprove_return" | "disapprove_escalate";
  gateName: string;
  /** `action` is the corrective step, shown verbatim as the reviewer selected it. */
  reasons: { text: string; action: string | null }[];
  note: string;
  reviewerName: string;
  reviewerRole: string;
  decidedAt: string;
  advisory: boolean;
  /** approve_note only: the step stays incomplete, and the next one locked, until acknowledged. */
  needsAcknowledgement: boolean;
}

/** A mentor decision as it appears in the Up-next bell. Full detail lives on the step itself. */
export interface MentorFeedback {
  id: string;
  activityId: string;
  taskCode: string;
  activityCode: string;
  gateName: string;
  outcome: MentorReview["outcome"];
  reviewerName: string;
  decidedAt: string;
}

/**
 * The reference answer. Present only when the learner can no longer reach it themselves — an
 * escalated gate, or attempts exhausted without a pass. Never sent in any other state.
 */
export interface ModelAnswer {
  reason: "attempts_exhausted" | "escalated";
  artefact: string;
  acceptance: string;
  worked: string;
  /**
   * Escalated only: acknowledging this decision releases the step. Null when nothing is owed —
   * including for `attempts_exhausted`, which releases through `deskApi.releaseAfterAnswer`
   * instead, there being no mentor decision to acknowledge.
   */
  acknowledgeDecisionId: number | null;
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
  /**
   * Present only on the 70 mentor review-gate steps, once a mentor has decided. While `advisory`
   * is true the decision is shown to the learner but gates nothing — their result is still the
   * AI's. Do not branch progression on this.
   */
  mentorReview: MentorReview | null;
  modelAnswer: ModelAnswer | null;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
}

export interface SubmitResponse {
  submissionId: number;
  layer1: Layer1Result;
  review: Review | null;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
}

export interface SubmissionSummary {
  id: number;
  activityId?: string;
  payload?: ActivityPayload;
  revisionNo: number;
  status: string;
  createdAt: string;
  layer1: Layer1Result | null;
}
export interface SubmissionDetail {
  submission: SubmissionSummary;
  review: Review | null;
}

export const deskApi = {
  activity: (id: string) => api.get<ActivityDetail>(`/me/activities/${id}`),
  mentorFeedback: () => api.get<MentorFeedback[]>("/me/mentor-feedback"),
  acknowledgeMentorFeedback: (decisionId: number) =>
    api.post<{ ok: boolean }>(`/me/mentor-feedback/${decisionId}/acknowledge`),
  /** Confirm the worked answer has been read on a step with no attempts left. Completes the step. */
  releaseAfterAnswer: (id: string) => api.post<{ ok: boolean }>(`/me/activities/${id}/release`),
  saveDraft: (id: string, payload: ActivityPayload) =>
    api.put<{ ok: boolean }>(`/me/activities/${id}/draft`, { payload }),
  submit: (id: string, payload: ActivityPayload) =>
    api.post<SubmitResponse>(`/me/activities/${id}/submit`, { payload }),
  submissions: (id: string) => api.get<SubmissionDetail[]>(`/me/activities/${id}/submissions`),
};
