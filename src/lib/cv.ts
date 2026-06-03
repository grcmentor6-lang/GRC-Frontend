/**
 * Auto-compiled CV (authed) + public share view. Mirrors the FastAPI CvOut.
 * Everything is derived from graded fieldwork — no hand-authored content.
 */
import { api } from "./api";

export interface CvProfile {
  initials: string;
  name: string;
  headline: string;
  location: string;
  email: string;
  linkedin?: string | null;
  openToWork: boolean;
  summary: string;
}

export interface CvMetric { value: string; sub: string; label: string }

export interface CvExperienceItem {
  verb: string;
  step: string;
  score: number;
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
