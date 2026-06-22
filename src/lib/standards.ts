// Standards-first catalogue for the Standards Overview. The 5 standards GRC101 mentees work
// through. Tasks are NOT hardcoded here — they're grouped live from TASK_META by `standardId`,
// so the overview always reflects the real task catalogue. Live progress comes from the
// learnings tree at render time.
import { TASK_META } from "./taskmeta";
import type { Learnings, LearningTask } from "./learnings";

/** Flatten the learnings tree to a code→task map (a task code can recur across placements —
 *  keep the most-progressed instance so the program-level overview shows real progress). */
export function buildTaskIndex(learnings: Learnings | null | undefined): Map<string, LearningTask> {
  const map = new Map<string, LearningTask>();
  for (const org of learnings?.orgs ?? []) {
    for (const proj of org.projects) {
      for (const task of proj.tasks) {
        const prev = map.get(task.code);
        if (!prev || task.done > prev.done) map.set(task.code, task);
      }
    }
  }
  return map;
}

export interface StandardMeta {
  id: string;
  /** Short display code, e.g. "ISO 27001" — a recognised short name for the chip. */
  code: string;
  /** 3–4 char monogram for the badge tile. */
  short: string;
  /** Authoritative full label — derived from the real task catalogue (TASK_META), not authored here. */
  fullName: string;
  domain: string;
  /** Tone key into VERB_TONES — derived from the real task catalogue so it matches task chips. */
  tone: string;
  description: string;
  tagline: string;
  /** NIST cross-cuts every other standard's tasks; shown as a cross-reference section. */
  crossCutting?: boolean;
}

/** Per-standard enrichment (short name, domain, blurb) — display copy that has no backend field.
 *  The authoritative `fullName` (label) and `tone` are derived from TASK_META below, so the
 *  standard's name/colour always match the real task data and can never drift. */
interface StandardEnrichment {
  id: string; code: string; short: string; domain: string; description: string; tagline: string; crossCutting?: boolean;
}

const STANDARD_ENRICHMENT: StandardEnrichment[] = [
  {
    id: "iso27001", code: "ISO 27001", short: "ISO", domain: "Information Security Management System",
    description: "International standard for Information Security Management Systems. Establishes a framework for assessing risks, selecting controls (Annex A), and continually improving the security programme.",
    tagline: "Build a defensible, risk-driven ISMS.",
  },
  {
    id: "nistcsf", code: "NIST CSF 2.0", short: "NIST", domain: "Risk-Based Cybersecurity", crossCutting: true,
    description: "Six functions — Govern, Identify, Protect, Detect, Respond, Recover — that organise risk-based cybersecurity outcomes for any organisation, and map across every other framework in this programme.",
    tagline: "Cross-cuts every standard you'll touch.",
  },
  {
    id: "cisv8", code: "CIS Controls v8", short: "CIS", domain: "Prioritised Security Controls",
    description: "Eighteen Critical Security Controls grouped into Implementation Groups (IG1–IG3). The mentee starts at IG1 — the cyber-hygiene baseline every organisation should meet.",
    tagline: "Tactical, prioritised, measurable.",
  },
  {
    id: "soc2", code: "SOC 2", short: "SOC", domain: "Trust Services Criteria",
    description: "The AICPA Trust Services Criteria — Security, Availability, Processing Integrity, Confidentiality and Privacy — used to demonstrate the design and operating effectiveness of controls to customers.",
    tagline: "Prove control effectiveness to customers.",
  },
  {
    id: "gdpr", code: "GDPR", short: "GDPR", domain: "Data Protection & Privacy",
    description: "EU 2016/679 — lawful basis, data-subject rights, Records of Processing Activities (Article 30), and DPIA screening (Article 35). The mentee maps a real personal-data flow end-to-end.",
    tagline: "Map the data; document the basis.",
  },
];

/** First real task carrying each standard — the source of truth for the standard's label + tone. */
const realStandardData = (id: string): { label?: string; tone?: string } => {
  const t = Object.values(TASK_META).find((m) => m.standardId === id);
  return { label: t?.standardLabel, tone: t?.standardTone };
};

export const STANDARDS: StandardMeta[] = STANDARD_ENRICHMENT.map((e) => {
  const real = realStandardData(e.id);
  return { ...e, fullName: real.label ?? e.code, tone: real.tone ?? "indigo" };
});

export const STANDARD_BY_ID: Record<string, StandardMeta> = Object.fromEntries(STANDARDS.map((s) => [s.id, s]));

/** Task codes owned by each standard, in TASK_META declaration order. */
export const STANDARD_TASK_CODES: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const s of STANDARDS) out[s.id] = [];
  for (const [code, meta] of Object.entries(TASK_META)) {
    (out[meta.standardId] ??= []).push(code);
  }
  return out;
})();

export const tasksForStandard = (id: string): string[] => STANDARD_TASK_CODES[id] ?? [];

export const standardForTaskCode = (code?: string): StandardMeta | null => {
  if (!code) return null;
  const id = TASK_META[code]?.standardId;
  return id ? STANDARD_BY_ID[id] ?? null : null;
};

/** Tasks owned by OTHER standards that carry a NIST CSF cross-reference (NIST's cross-cut view). */
export const nistCrossRefTaskCodes = (): string[] =>
  Object.entries(TASK_META)
    .filter(([, m]) => m.standardId !== "nistcsf" && !!m.nistCrossRef?.trim())
    .map(([code]) => code);
