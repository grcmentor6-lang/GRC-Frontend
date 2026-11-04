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

export const JOBS: Job[] = [
  {
    id: "grc-analyst",
    title: "GRC Analyst",
    level: "Entry / Analyst",
    jobFunction: "Governance, risk & compliance",
    standards: ["ISO/IEC 27001:2022", "NIST CSF 2.0"],
    responsibilities: [
      { duty: "Map which frameworks and regulations bind the organisation", task: "F1.2" },
      { duty: "Maintain the regulatory obligations register", task: "T3.1" },
      { duty: "Map requirements to ISO/IEC 27001 controls and internal policy", task: "T3.2" },
      { duty: "Keep the risk register current", task: "T7.1" },
      { duty: "Classify information assets", task: "F2.1" },
    ],
  },
  {
    id: "policy-analyst",
    title: "Policy & Governance Analyst",
    level: "Entry / Analyst",
    jobFunction: "Policy & governance",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Review policies for currency and gaps", task: "T4.1" },
      { duty: "Write procedures (SOPs) from policy statements", task: "T4.2" },
      { duty: "Build control crosswalks between frameworks", task: "T3.2" },
      { duty: "Brief the business on regulatory change", task: "T11.2" },
    ],
  },
  {
    id: "compliance-analyst",
    title: "Compliance Analyst",
    level: "Entry / Associate",
    jobFunction: "Compliance management",
    standards: ["ISO/IEC 27001:2022", "SOC 2"],
    responsibilities: [
      { duty: "Document the organisation's context and interested parties", task: "F1.3" },
      { duty: "Maintain the obligations register", task: "T3.1" },
      { duty: "Prepare provided-by-client (PBC) evidence request lists for audits", task: "T5.1" },
      { duty: "Assemble, validate and index audit evidence packs", task: "T5.2" },
      { duty: "Track corrective actions to closure for management review", task: "T12.1" },
    ],
  },
  {
    id: "privacy-associate",
    title: "Privacy & Data Protection Associate",
    level: "Entry / Associate",
    jobFunction: "Data privacy",
    standards: ["GDPR"],
    responsibilities: [
      { duty: "Maintain records of processing (RoPA) and data-flow maps", task: "T10.1" },
      { duty: "Assess personal-data breaches for notification", task: "T10.2" },
      { duty: "Apply the data classification scheme", task: "F2.1" },
    ],
  },
  {
    id: "it-risk-associate",
    title: "IT Risk & Controls Associate",
    level: "Entry / Associate",
    jobFunction: "Risk management",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Maintain the risk register", task: "T7.1" },
      { duty: "Summarise top risks for board reporting and draft risk acceptances", task: "T7.2" },
      { duty: "Run user access reviews", task: "T6.1" },
      { duty: "Reconcile leavers against de-provisioning records", task: "T6.2" },
    ],
  },
  {
    id: "it-audit-associate",
    title: "IT Audit & Assurance Associate",
    level: "Entry / Associate",
    jobFunction: "Audit & assurance",
    standards: ["ISO/IEC 27001:2022", "SOC 2"],
    responsibilities: [
      { duty: "Judge whether evidence is sufficient and appropriate", task: "F2.2" },
      { duty: "Test vulnerability-remediation SLA compliance", task: "T8.1" },
      { duty: "Test privileged-access review controls", task: "T8.2" },
      { duty: "Support surveillance audits: answer auditor requests and findings", task: "T12.2" },
    ],
  },
  {
    id: "vendor-risk-analyst",
    title: "Third-Party / Vendor Risk Analyst",
    level: "Entry / Analyst",
    jobFunction: "Third-party risk",
    standards: ["SOC 2", "ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Run vendor intake, tiering and security questionnaires", task: "T9.1" },
      { duty: "Review SOC 2 reports and make onboarding risk decisions", task: "T9.2" },
    ],
  },
  {
    id: "awareness-specialist",
    title: "Security Awareness & Training Coordinator",
    level: "Entry / Coordinator",
    jobFunction: "Security culture",
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Assemble security awareness campaign packs", task: "T11.1" },
      { duty: "Communicate regulatory change to staff", task: "T11.2" },
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
