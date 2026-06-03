/**
 * Catalogue reference data from the backend (programs, rubric, standards).
 * Verb *presentation* lives in lib/verbs.ts (fixed product spec); see that file.
 */
import { api } from "./api";

export interface Program {
  id: string;
  code: string;
  title: string;
  eyebrow: string;
  status: "active" | "locked";
  order: number;
  blurb: string;
  tagline: string;
  unlocksAfter: string | null;
}

export interface RubricDimension {
  id: string;
  label: string;
  order: number;
}

export interface Standard {
  id: string;
  label: string;
  tone: string;
}

export const catalog = {
  programs: () => api.get<Program[]>("/catalog/programs", { noAuth: true }),
  rubric: () => api.get<RubricDimension[]>("/catalog/rubric", { noAuth: true }),
  standards: () => api.get<Standard[]>("/catalog/standards", { noAuth: true }),
};
