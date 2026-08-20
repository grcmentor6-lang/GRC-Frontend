// Prioritise worked tasks. Source: Prioritise_Verb_Task_Register.xlsx. Mentee scores each item per
// criterion; the aggregate + rank compute live; ties require a documented tiebreaker (Layer 1).
// AA-002/2.5 and SPA-001/2 are the `prioritise`-tagged catalog steps.

export interface PrioTask {
  title: string;
  standard: string;
  criteria: string[];
  scaleMax: number;
  aggregate: "sum" | "product";
  items: { id: number; label: string }[];
  feedsNext: string;
}

export const PRIORITISE_TASKS: Record<string, PrioTask> = {
  "SPA-001/2": {
    title: "Band the consolidated gaps for the 12-month roadmap",
    standard: "ISO 27001 Cl 6.1.3 Risk treatment; Cl 6.2 Objectives and planning",
    // Effort and dependency decide the band; severity decides the order WITHIN it. Scoring
    // severity alone produces a ranking that cannot be executed, because an action whose input
    // does not exist yet cannot start however urgent it is.
    criteria: ["Severity", "Effort to close", "Blocks other actions"],
    scaleMax: 5,
    aggregate: "sum",
    feedsNext: "The banded list feeds Step 3 (action detail) and Step 4 (Gantt).",
    items: [
      { id: 1, label: "No documented risk assessment (Cl. 6.1.2)" },
      { id: 2, label: "No central deficiency monitoring (Cl. 9.1 / A.5.35)" },
      { id: 3, label: "Leaver deprovisioning manual and late (A.5.18)" },
      { id: 4, label: "Deployments carry no approval record (A.8.32)" },
      { id: 5, label: "No scheduled access recertification (A.5.18)" },
      { id: 6, label: "Security monitoring has no thresholds or triage record (A.8.16)" },
      { id: 7, label: "No consolidated vendor risk assessment (A.5.19)" },
      { id: 8, label: "Boundary protection undocumented (A.8.20)" },
      { id: 9, label: "No policy register or acknowledgement tracking (A.5.1)" },
      { id: 10, label: "Warehouse columns unclassified, roles not derived from them (A.5.12)" },
    ],
  },
  "AA-002/2.5": {
    title: "Prioritise top CIS control gaps by risk exposure",
    standard: "CIS Controls v8 IG1",
    criteria: ["Exploitability", "Impact", "Prevalence"],
    scaleMax: 5,
    aggregate: "sum",
    feedsNext: "The ranked gap list feeds the Recommend step.",
    items: [
      { id: 1, label: "Default admin passwords" },
      { id: 2, label: "No MFA for admin" },
      { id: 3, label: "No asset inventory" },
      { id: 4, label: "No patching policy" },
      { id: 5, label: "No data-protection process" },
      { id: 6, label: "No secure-config baseline" },
      { id: 7, label: "Unauthorised software" },
      { id: 8, label: "No access-revoke process" },
    ],
  },
};

export function getPrioTask(taskCode?: string, activityCode?: string): PrioTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return PRIORITISE_TASKS[`${taskCode}/${activityCode}`];
}
