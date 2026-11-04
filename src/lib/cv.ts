/**
 * Auto-compiled CV (authed) + public share view. Mirrors the FastAPI CvOut.
 * Everything is derived from graded fieldwork — no hand-authored content.
 */
import { api } from "./api";

export interface CvProfile {
  initials: string;
  name: string;
  location: string;
  /** Null on the public CV: a shared link never carries the learner's address. */
  email: string | null;
  linkedin?: string | null;
  /** Not sent: nobody has been asked, so it is not claimed for them. */
  openToWork?: boolean;
  summary: string;
}

export interface CvMetric { value: string; sub: string; label: string }

export interface CvExperienceItem {
  verb: string;
  step: string;
  /** Null: the desk does not score a hand-in yet. */
  score: number | null;
  when: string;
  text: string;
  note: string;
  by: string;
}

export interface CvExperienceTask {
  code: string;
  title: string;
  standards: string;
  items: CvExperienceItem[];
}

export interface CvExperienceOrg {
  org: string;
  industry: string;
  program: string;
  phase: string;
  period: string;
  tasks: CvExperienceTask[];
}

export interface CvSkill { id: string; label: string; value: number }
/**
 * One of the ten judgment competences, and what this mentee's decisions showed on it. Scored 0-4
 * over roughly three or four observations, which is enough to separate "has not shown it" from
 * "cannot do it" and not enough to support a finer claim — hence `observations` travels with the
 * value and the sheet prints both.
 */
export interface CvCompetence {
  id: string;
  label: string;
  what: string;
  value: number;
  observations: number;
}
export interface CvJudgment {
  /** Judgment calls answered and verified. */
  calls: number;
  /** How many of those took one of the defensible options. Context, not the grade. */
  defensible: number;
  average: number;
  competences: CvCompetence[];
}

export interface CvVerbs { done: string[]; active: string[] }
export interface CvStandard { label: string; tone: string }
export interface CvEndorsement { quote: string; name: string; role: string; initials: string }
export interface CvProgram { title: string; code: string; provider: string; cohort: string; status: string }

export interface Cv {
  slug: string;
  publicUrl: string;
  profile: CvProfile;
  metrics: CvMetric[];
  completedTaskCodes: string[];
  experience: CvExperienceOrg[];
  skills: CvSkill[];
  judgment?: CvJudgment | null;
  verbs: CvVerbs;
  standards: CvStandard[];
  endorsement?: CvEndorsement | null;
  program?: CvProgram | null;
  updatedAt: string;
}

export const cvApi = {
  /** The signed-in mentee's own CV. */
  mine: (program = "grc101") => api.get<Cv>("/me/cv", { query: { program } }),
  /** Public CV by share slug (unauthenticated). */
  public: (slug: string, program = "grc101") => api.get<Cv>(`/cv/${slug}`, { query: { program }, noAuth: true }),
};
