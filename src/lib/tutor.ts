import { api } from "./api";

/**
 * The study assistant's two calls (backend api/tutor.py). The server works out which steps a question touches and
 * what it may say about each (teach before a step is done, explain after), so the client sends only where the
 * learner is. Names travel as the learner sees them: the server swaps to and from the canonical ones itself.
 */
export type TutorMode = "teach" | "explain" | "general" | "refused";
export interface TutorUsage { used: number; allowance: number }
export interface TutorStep { task: string; step: number; mode: "teach" | "explain" }
export interface TutorReply {
  answer: string;
  sources: string[];
  mode: TutorMode;
  /** refused: "exam" | "allowance" | "off_topic" | "busy"; teach: "fallback" when the step's hints stood in. */
  reason: string | null;
  steps: TutorStep[];
  usage: TutorUsage;
}
export interface TutorTurn { role: "learner" | "assistant"; text: string }

export const askTutor = (body: { question: string; task?: string; step?: number; page?: string; history?: TutorTurn[] }) =>
  api.post<TutorReply>("/me/tutor/ask", body);
export const tutorUsage = () => api.get<TutorUsage>("/me/tutor/usage");

/** Under every answer: each is sent as the next question, so the same teach / explain rule governs it. */
export const FOLLOW_UPS = ["Explain it another way", "Give me another example", "Simpler, please", "Quiz me"];

/** The empty panel's starters, by whether a step is in hand. */
export const starters = (hasStep: boolean): string[] =>
  hasStep
    ? ["Where do I find the rule for this step?", "Explain this step in simple terms", "Show me how to reason, with an example", "Quiz me on what I have done so far"]
    : ["What's due this week?", "How do the exams work?", "What is a Statement of Applicability?", "Quiz me on ISO/IEC 27001 basics"];

/** "F1.2 step 3 · teaching mode": what the panel's header says it is reading for. */
export const readingFor = (task: string, step: number, done: boolean) =>
  `${task} step ${step} · ${done ? "explaining: this step is done" : "teaching mode: no answers until this step is done"}`;
