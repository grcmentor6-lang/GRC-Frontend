// Cross-Reference worked tasks (two-source reconciliation + answer key). Source:
// Cross-Reference_Verb_Task_Register.xlsx. The mentee states a comparison method, assigns a
// status to each row from the task's vocabulary, and gives every discrepancy a corrective
// action. `status` is the answer key; `clean` is the non-discrepancy value. Submission is gated
// on every row's status matching the key + an action on each discrepancy + a method (see workspace).

export interface XRefRow {
  id: number;
  /** Descriptive column values (Source A + Source B), aligned to `columns`. */
  cells: string[];
  /** Answer-key status for this row. */
  status: string;
}

export interface XRefTask {
  title: string;
  standard: string;
  sources: string;
  /** Example comparison method (also the placeholder for the mentee's method statement). */
  method: string;
  columns: string[];
  /** The status vocabulary the mentee picks from per row. */
  statuses: string[];
  /** The non-discrepancy status (e.g. Match / Covered / Clean). */
  clean: string;
  rows: XRefRow[];
  feedsNext: string;
}

export const XREF_TASKS: Record<string, XRefTask> = {
  "AA-001/1.5": {
    title: "Asset Register ↔ Network/Application Inventory",
    standard: "ISO/IEC 27001:2022 — A.5.9 Inventory of assets; A.8.1 Endpoint devices",
    sources: "A = Information Asset Register · B = Network diagrams & application inventories",
    method: "Matched each register asset to the network/app inventory by name & system; flagged items present in only one source and any duplicates.",
    columns: ["Asset / System", "In Asset Register? (A)", "On Network/App Inventory? (B)"],
    statuses: ["Match", "Gap: register only", "Gap: network only", "Duplicate"],
    clean: "Match",
    feedsNext: "Feeds Step 6 — identify unowned/unregistered assets.",
    rows: [
      { id: 1, cells: ["CRM SaaS platform", "Y", "Y"], status: "Match" },
      { id: 2, cells: ["Billing / ERP system", "Y", "Y"], status: "Match" },
      { id: 3, cells: ["Customer PII database", "Y", "Y"], status: "Match" },
      { id: 4, cells: ["Source code repository", "Y", "Y"], status: "Match" },
      { id: 5, cells: ["Email / SaaS suite", "Y", "Y"], status: "Match" },
      { id: 6, cells: ["HR SaaS", "Y", "Y"], status: "Match" },
      { id: 7, cells: ["Payroll system", "Y", "Y"], status: "Match" },
      { id: 8, cells: ["SIEM platform", "Y", "Y"], status: "Match" },
      { id: 9, cells: ["Build server 03", "Y", "Y"], status: "Match" },
      { id: 10, cells: ["Public marketing website", "Y", "Y"], status: "Match" },
      { id: 11, cells: ["Internal wiki", "Y", "Y"], status: "Match" },
      { id: 12, cells: ["Backup vault", "Y", "Y"], status: "Match" },
      { id: 13, cells: ["Legacy reporting server (decommissioned)", "Y", "N"], status: "Gap: register only" },
      { id: 14, cells: ["Old VPN appliance", "Y", "N"], status: "Gap: register only" },
      { id: 15, cells: ["Test CRM sandbox (retired)", "Y", "N"], status: "Gap: register only" },
      { id: 16, cells: ["Unmanaged marketing analytics SaaS", "N", "Y"], status: "Gap: network only" },
      { id: 17, cells: ["Personal Dropbox sync (found on host)", "N", "Y"], status: "Gap: network only" },
      { id: 18, cells: ["Unregistered Raspberry Pi (lab)", "N", "Y"], status: "Gap: network only" },
      { id: 19, cells: ["Contractor laptop (BYOD)", "N", "Y"], status: "Gap: network only" },
      { id: 20, cells: ["Shadow Jira instance", "N", "Y"], status: "Gap: network only" },
      { id: 21, cells: ["File server FS01", "Y", "Y"], status: "Match" },
      { id: 22, cells: ["Identity provider (IdP)", "Y", "Y"], status: "Match" },
      { id: 23, cells: ["Container registry", "Y", "Y"], status: "Match" },
      { id: 24, cells: ["Monitoring/Grafana", "Y", "Y"], status: "Match" },
      { id: 25, cells: ["CRM SaaS platform", "Y", "Y"], status: "Duplicate" },
      { id: 26, cells: ["Staging database", "Y", "Y"], status: "Match" },
    ],
  },
  "CRM-003/9.5": {
    title: "SOC 2 Common Criteria ↔ ISO 27001 Control Matrix",
    standard: "SOC 2 Type II (AICPA TSC) CC1–CC9 · ISO 27001 Annex A control matrix (CRM-002)",
    sources: "A = SOC 2 Common Criteria points · B = ISO 27001 Control Matrix",
    method: "Mapped each SOC 2 CC point to its nearest ISO 27001 Annex A control, then checked the org's ISO control matrix for presence; flagged unmapped points as gaps.",
    columns: ["SOC 2 CC point (A)", "Mapped ISO 27001 control (B)", "In ISO Matrix? (Y/N)"],
    statuses: ["Covered", "Gap"],
    clean: "Covered",
    feedsNext: "Feeds the SOC 2 readiness traffic-light dashboard.",
    rows: [
      { id: 1, cells: ["CC1.1 Integrity & ethical values", "A.5.1 Policies for information security", "Y"], status: "Covered" },
      { id: 2, cells: ["CC1.2 Board oversight", "A.5.2 Information security roles", "Y"], status: "Covered" },
      { id: 3, cells: ["CC1.4 Competence / training", "A.6.3 Awareness & training", "Y"], status: "Covered" },
      { id: 4, cells: ["CC2.1 Quality information", "A.5.9 Inventory of assets", "Y"], status: "Covered" },
      { id: 5, cells: ["CC2.2 Internal communication", "A.5.1 Policies", "Y"], status: "Covered" },
      { id: 6, cells: ["CC3.1 Risk objectives", "Clause 6.1.2 Risk assessment", "Y"], status: "Covered" },
      { id: 7, cells: ["CC3.2 Risk identification", "Clause 6.1.2 Risk assessment", "Y"], status: "Covered" },
      { id: 8, cells: ["CC4.1 Monitoring controls", "A.5.35 Independent review", "N"], status: "Gap" },
      { id: 9, cells: ["CC5.2 Technology controls", "A.8.x Technological controls", "Y"], status: "Covered" },
      { id: 10, cells: ["CC6.1 Logical access", "A.8.3 Access restriction", "Y"], status: "Covered" },
      { id: 11, cells: ["CC6.2 Registration/authorisation", "A.5.18 Access rights", "Y"], status: "Covered" },
      { id: 12, cells: ["CC6.3 Access removal", "A.5.18 Access rights", "Y"], status: "Covered" },
      { id: 13, cells: ["CC6.6 Boundary protection", "A.8.20 Network security", "N"], status: "Gap" },
      { id: 14, cells: ["CC6.7 Data in transit", "A.8.24 Use of cryptography", "Y"], status: "Covered" },
      { id: 15, cells: ["CC7.1 Vulnerability detection", "A.8.8 Technical vulnerabilities", "Y"], status: "Covered" },
      { id: 16, cells: ["CC7.2 Security monitoring", "A.8.16 Monitoring activities", "N"], status: "Gap" },
      { id: 17, cells: ["CC7.3 Incident evaluation", "A.5.24 Incident mgmt planning", "Y"], status: "Covered" },
      { id: 18, cells: ["CC7.4 Incident response", "A.5.26 Response to incidents", "Y"], status: "Covered" },
      { id: 19, cells: ["CC8.1 Change management", "A.8.32 Change management", "N"], status: "Gap" },
      { id: 20, cells: ["CC9.2 Vendor risk", "A.5.19 Supplier relationships", "Y"], status: "Covered" },
    ],
  },
  "TV-001/3": {
    title: "System Accounts ↔ HR Employee List",
    standard: "ISO/IEC 27001:2022 — A.8.2 Privileged access; A.8.3 Access restriction; A.8.5 Secure auth; A.5.18 Access rights",
    sources: "A = System user-account extract (role, last-login) · B = HR active-employee list",
    method: "Joined accounts to HR by name/employee ID; rule-checked HR status, last-login age (>90d = dormant), and admin justification; account-less active staff = missing account.",
    columns: ["Username (A)", "System", "Privilege", "Last login (days)", "In HR active? (B)", "Admin justified?"],
    statuses: ["Clean", "Dormant", "Orphaned", "Excessive privilege", "Missing account"],
    clean: "Clean",
    feedsNext: "Feeds the Access Review Worksheet & Access Control Testing Report.",
    rows: [
      { id: 1, cells: ["j.smith", "GitLab", "Standard", "3", "Y", "-"], status: "Clean" },
      { id: 2, cells: ["a.khan", "GitLab", "Standard", "1", "Y", "-"], status: "Clean" },
      { id: 3, cells: ["m.oconnor", "Jira", "Standard", "7", "Y", "-"], status: "Clean" },
      { id: 4, cells: ["r.patel", "Jira", "Admin", "2", "Y", "Y"], status: "Clean" },
      { id: 5, cells: ["s.lee", "AWS", "Admin", "1", "Y", "Y"], status: "Clean" },
      { id: 6, cells: ["t.brown", "AWS", "Standard", "10", "Y", "-"], status: "Clean" },
      { id: 7, cells: ["k.nguyen", "CRM", "Standard", "4", "Y", "-"], status: "Clean" },
      { id: 8, cells: ["d.garcia", "CRM", "Standard", "6", "Y", "-"], status: "Clean" },
      { id: 9, cells: ["p.wilson", "GitLab", "Standard", "140", "Y", "-"], status: "Dormant" },
      { id: 10, cells: ["l.martin", "Jira", "Standard", "210", "Y", "-"], status: "Dormant" },
      { id: 11, cells: ["c.davis", "AWS", "Standard", "95", "Y", "-"], status: "Dormant" },
      { id: 12, cells: ["f.muller", "CRM", "Standard", "180", "Y", "-"], status: "Dormant" },
      { id: 13, cells: ["svc_backup", "AWS", "Admin", "2", "N", "-"], status: "Orphaned" },
      { id: 14, cells: ["admin_old", "GitLab", "Admin", "320", "N", "-"], status: "Orphaned" },
      { id: 15, cells: ["j.taylor", "Jira", "Standard", "30", "N", "-"], status: "Orphaned" },
      { id: 16, cells: ["contractor1", "CRM", "Standard", "45", "N", "-"], status: "Orphaned" },
      { id: 17, cells: ["e.white", "AWS", "Admin", "5", "Y", "N"], status: "Excessive privilege" },
      { id: 18, cells: ["h.clark", "GitLab", "Admin", "9", "Y", "N"], status: "Excessive privilege" },
      { id: 19, cells: ["n.lewis", "Jira", "Admin", "12", "Y", "N"], status: "Excessive privilege" },
      { id: 20, cells: ["g.hall", "CRM", "Admin", "4", "Y", "N"], status: "Excessive privilege" },
      { id: 21, cells: ["b.young", "GitLab", "Standard", "2", "Y", "-"], status: "Clean" },
      { id: 22, cells: ["o.king", "Jira", "Standard", "8", "Y", "-"], status: "Clean" },
      { id: 23, cells: ["v.scott", "AWS", "Standard", "15", "Y", "-"], status: "Clean" },
      { id: 24, cells: ["w.green", "CRM", "Standard", "20", "Y", "-"], status: "Clean" },
      { id: 25, cells: ["i.adams", "GitLab", "Standard", "60", "Y", "-"], status: "Clean" },
      { id: 26, cells: ["z.baker", "Jira", "Standard", "70", "Y", "-"], status: "Clean" },
      { id: 27, cells: ["svc_ci", "GitLab", "Admin", "1", "N", "Y"], status: "Orphaned" },
      { id: 28, cells: ["q.evans", "AWS", "Standard", "3", "Y", "-"], status: "Clean" },
      { id: 29, cells: ["—", "CRM", "—", "", "Y", "-"], status: "Missing account" },
      { id: 30, cells: ["—", "Jira", "—", "", "Y", "-"], status: "Missing account" },
    ],
  },
};

export function getXRefTask(taskCode?: string, activityCode?: string): XRefTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return XREF_TASKS[`${taskCode}/${activityCode}`];
}
