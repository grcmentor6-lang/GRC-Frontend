// Typical entry-level GRC roles — fixed product reference data. These are role PROFILES, not
// vacancies: no employer, salary or job board is named, because none of them is real. "Find
// openings" sends the learner to a live search for the title instead.
//
// Match is NOT stored: it's derived at runtime from the mentee's own desk progress (desk_progress),
// so it moves only when they submit the Working Desk tasks each duty is mapped to.

import type { Progress } from "./desk/progress";

export interface JobResponsibility {
  /** The duty as a job post would word it. */
  duty: string;
  /** The Working Desk task whose work backs this duty (an id in public/desk/sample.json `order`). */
  task: string;
}

export interface Job {
  id: string;
  title: string;
  level: string;
  /** The role's primary function. */
  jobFunction: string;
  /** Standards such posts commonly ask for — market context, not a claim about the mentee. */
  standards: string[];
  responsibilities: JobResponsibility[];
}

// Each duty is backed by one GRC 101 task and words what that task hands in (his Tasks sheet, "Hands in" and
// "Responsibility"). GRC 101 works on ISO/IEC 27001 only, so no role lists another framework.
export const JOBS: Job[] = [
  {
    id: "grc-analyst",
    title: "GRC Analyst",
    level: "Entry / Analyst",
    jobFunction: "Governance, risk & compliance",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Map the ISO/IEC 27000 family of standards and place the ISMS clauses in the Plan-Do-Check-Act cycle", task: "F1.2" },
      { duty: "Run a baseline gap analysis of ISO/IEC 27001 clauses 4–10 and rate their maturity", task: "F2.2" },
      { duty: "Keep the risk register current with asset–threat–control chains", task: "T4.2" },
      { duty: "Maintain the Statement of Applicability for the Annex A controls", task: "T5.2" },
      { duty: "Track corrective actions and prepare the management-review pack", task: "T12.1" },
    ],
  },
  {
    id: "policy-analyst",
    title: "Policy & Governance Analyst",
    level: "Entry / Analyst",
    jobFunction: "Policy & governance",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Write the ISMS scope statement and the list of ISMS processes", task: "F2.1" },
      { duty: "Check the information security policy against ISO/IEC 27001 and keep the topic-specific policy register", task: "T3.1" },
      { duty: "Assign ISMS roles in a RACI and check segregation of duties", task: "T3.2" },
      { duty: "Control documented information: the document-control block and the mandatory-documents register", task: "T6.2" },
    ],
  },
  {
    id: "compliance-analyst",
    title: "Compliance Analyst",
    level: "Entry / Associate",
    jobFunction: "Compliance management",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Record the organisation's internal and external issues and its interested parties", task: "F1.3" },
      { duty: "Maintain the Statement of Applicability and the ISMS objectives", task: "T5.2" },
      { duty: "Keep the obligations register for legal, regulatory and contractual requirements", task: "T8.2" },
      { duty: "Plan the internal audit programme and write nonconformity reports", task: "T11.2" },
      { duty: "Answer a certification body's evidence requests and respond to a finding", task: "T12.2" },
    ],
  },
  {
    id: "privacy-associate",
    title: "Privacy & Data Protection Associate",
    level: "Entry / Associate",
    jobFunction: "Data privacy",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Maintain a record of processing (RoPA) entry", task: "T8.2" },
      { duty: "Work the notification deadlines of a personal-data incident in a tabletop exercise", task: "T8.1" },
      { duty: "Keep the asset inventory and apply the classification scheme", task: "T4.1" },
    ],
  },
  {
    id: "it-risk-associate",
    title: "IT Risk & Controls Associate",
    level: "Entry / Associate",
    jobFunction: "Risk management",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Set the risk assessment method and criteria", task: "T4.1" },
      { duty: "Identify and analyse risks in the risk register", task: "T4.2" },
      { duty: "Write the risk treatment plan and a risk acceptance request", task: "T5.1" },
      { duty: "Build role-based access rules and review access against them", task: "T7.1" },
      { duty: "Check configuration baselines and the cryptography and key register", task: "T10.1" },
    ],
  },
  {
    id: "it-audit-associate",
    title: "IT Audit & Assurance Associate",
    level: "Entry / Associate",
    jobFunction: "Audit & assurance",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Run a physical security walkthrough and record its findings", task: "T9.1" },
      { duty: "Test vulnerability-remediation SLA compliance", task: "T9.2" },
      { duty: "Test a sample of changes against the change process", task: "T10.2" },
      { duty: "Plan internal audits and raise nonconformities", task: "T11.2" },
      { duty: "Support the certification audit: evidence requests and finding responses", task: "T12.2" },
    ],
  },
  {
    id: "vendor-risk-analyst",
    title: "Third-Party / Vendor Risk Analyst",
    level: "Entry / Analyst",
    jobFunction: "Third-party risk",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Tier suppliers and check their contracts against a clause checklist", task: "T7.2" },
      { duty: "Set out cloud and supply-chain security responsibilities", task: "T7.2" },
    ],
  },
  {
    id: "awareness-specialist",
    title: "Security Awareness & Training Coordinator",
    level: "Entry / Coordinator",
    jobFunction: "Security culture",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Build a competence matrix and an ISMS communication plan", task: "T6.1" },
      { duty: "Plan a security awareness campaign", task: "T6.1" },
      { duty: "Report ISMS performance measures to management", task: "T11.1" },
    ],
  },
];

// ---- runtime match derivation ----

export type RespState = "matched" | "partial" | "gap";

export interface DerivedResponsibility extends JobResponsibility {
  state: RespState;
}
export interface DerivedJob extends Job {
  /** 0–100: share of the role's duties backed by desk tasks you submitted (half for one started). */
  match: number;
  derivedResponsibilities: DerivedResponsibility[];
}

/** Submitted task → matched; any step of it done → partial; otherwise a gap. */
function stateOf(p: Progress, task: string): RespState {
  if (p.submitted[task]) return "matched";
  return Object.keys(p.done).some((k) => k.startsWith(`${task}-`) && p.done[k]) ? "partial" : "gap";
}

/** Derive every role's live match from the mentee's desk progress. Pure — safe to memoise. */
export function deriveJobs(p: Progress): DerivedJob[] {
  return JOBS.map((job) => {
    const derivedResponsibilities = job.responsibilities.map((r) => ({ ...r, state: stateOf(p, r.task) }));
    const score = derivedResponsibilities.reduce((n, r) => n + (r.state === "matched" ? 1 : r.state === "partial" ? 0.5 : 0), 0);
    const match = derivedResponsibilities.length ? Math.round((score / derivedResponsibilities.length) * 100) : 0;
    return { ...job, match, derivedResponsibilities };
  });
}

export interface MatchMeta {
  label: string;
  ring: string;
  txt: string;
  soft: string;
}
export function matchMeta(p: number): MatchMeta {
  if (p >= 90) return { label: "Strong match", ring: "#10b981", txt: "text-emerald-600", soft: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
  if (p >= 80) return { label: "Great match", ring: "#6366F1", txt: "text-indigo-600", soft: "bg-indigo-50 text-indigo-700 ring-indigo-100" };
  if (p >= 60) return { label: "Good match", ring: "#8b5cf6", txt: "text-violet-600", soft: "bg-violet-50 text-violet-700 ring-violet-100" };
  if (p >= 30) return { label: "Emerging match", ring: "#f59e0b", txt: "text-amber-700", soft: "bg-amber-50 text-amber-700 ring-amber-100" };
  if (p > 0) return { label: "Early match", ring: "#94a3b8", txt: "text-slate-600", soft: "bg-slate-100 text-slate-600 ring-slate-200/70" };
  return { label: "Not started", ring: "#94a3b8", txt: "text-slate-500", soft: "bg-slate-100 text-slate-600 ring-slate-200/70" };
}
