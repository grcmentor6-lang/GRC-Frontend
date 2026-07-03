// Research-method catalogue for the Research Submission gate — the closing step (code x.9) of
// every task. Task-agnostic: {org} {standard} {deliverable} {title} placeholders are filled from
// the task's RUA entry / TASK_META at render time. Ported from the Research Submission mockup.
import type { IconName } from "@/components/ui/icon";

export interface ResearchMethod {
  key: string;
  name: string;
  icon: IconName;
  tag: string;
  definition: string;
  why: string;
  prompts: string[];
  sourceHint: string;
}

export const RESEARCH_METHODS: ResearchMethod[] = [
  {
    key: "contextual",
    name: "Contextual Analysis",
    icon: "briefcase",
    tag: "Tailor, don't template",
    definition: "Studying the organisation's specific business model, sector and operating environment so your work fits the organisation — not a cookie-cutter template.",
    why: "A generic answer proves you can copy; a contextual one proves you understood {org}.",
    prompts: [
      "What does {org} actually do — customers, revenue model, critical operations — and how does that change the shape of the {deliverable}?",
      "Which parts of the business would feel it first if “{title}” were done badly?",
      "Name one thing a cookie-cutter template would get wrong for {org}, and what you did differently.",
    ],
    sourceHint: "Organisation brief in your task pack, sector overviews, company-profile material.",
  },
  {
    key: "gap",
    name: "Gap Analysis",
    icon: "gauge",
    tag: "Current state vs required state",
    definition: "Researching the difference between the current state (how things are done now) and the desired state required by a specific standard or regulatory requirement.",
    why: "The distance between today and {standard} is where all the real work in this task lives.",
    prompts: [
      "What is the current state at {org} for the area this task covers — and what evidence tells you that?",
      "What exactly does {standard} require the desired state to look like? Cite the clause or control.",
      "Which gaps carry the most risk, which are quick wins, and how did you decide?",
    ],
    sourceHint: "The governing clauses of {standard}, prior task outputs, internal documents you inspected.",
  },
  {
    key: "horizon",
    name: "Horizon Scanning",
    icon: "globe",
    tag: "What's coming next",
    definition: "Proactively researching upcoming changes in legislation and emerging cyber threats that could impact the business's compliance or risk posture.",
    why: "A deliverable built only for today's rules is already ageing — show you looked 12–24 months out.",
    prompts: [
      "Which upcoming regulation, amendment or enforcement trend could affect {org} within 12–24 months?",
      "Which emerging threat trend is most relevant to {org}'s sector, and why that one?",
      "What did you build into the {deliverable} today so it survives that change?",
    ],
    sourceHint: "Regulator announcements, ENISA / NCSC / CISA advisories, reputable threat-landscape reports.",
  },
];

export const RESEARCH_SOURCE_TYPES = [
  "Standard / framework", "Regulation / law", "Regulator guidance",
  "Industry report", "Threat advisory", "News / analysis", "Internal document", "Interview / SME",
];

/** Fill the {org} {standard} {deliverable} {title} placeholders with this task's context. */
export function fillMethod(text: string, ctx: { org: string; standard: string; deliverable: string; title: string }): string {
  return text
    .replaceAll("{org}", ctx.org)
    .replaceAll("{standard}", ctx.standard)
    .replaceAll("{deliverable}", ctx.deliverable)
    .replaceAll("{title}", ctx.title);
}
