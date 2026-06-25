// Identify-verb worked tasks (dataset + answer key). Source: Identify_Verb_Task_Register.xlsx.
// Each task: the mentee states the flagging criterion, scans the dataset, flags rows meeting
// the criterion, and gives every flag a proposed action + accountable role. `shouldFlag` is the
// answer key. Layer 1 = action+owner on every flag + criterion stated; submission is gated on
// flagging exactly the answer-key rows (see IdentifyWorkspace).

export interface IdentifyRow {
  id: number;
  /** Descriptive column values, aligned to `columns`. */
  cells: string[];
  /** Answer key: whether this row meets the flagging criterion. */
  shouldFlag: boolean;
}

export interface IdentifyTask {
  title: string;
  standard: string;
  /** The flagging criterion the mentee states before scanning (Layer 1). */
  criterion: string;
  /** Header labels for the descriptive columns. */
  columns: string[];
  rows: IdentifyRow[];
  /** Accountable-role options for the per-flag owner picker. */
  owners: string[];
  /** Where the flagged list feeds next. */
  feedsNext: string;
}

export const IDENTIFY_TASKS: Record<string, IdentifyTask> = {
  "AA-001/1.6": {
    title: "Identify Ownerless Assets",
    standard: "ISO 27001 A.5.9 Inventory; A.5.2 Roles & responsibilities",
    criterion: "Flag any asset where the Owner field is blank or 'Unassigned'.",
    columns: ["Asset", "Owner (current)"],
    owners: ["Department Head / IT Operations Manager", "Data Platform Lead", "Head of Engineering", "CISO", "HR Systems Manager"],
    feedsNext: "Feeds the Review / Present steps — the flagged ownerless-asset list with owners.",
    rows: [
      { id: 1, cells: ["CRM SaaS platform", "Service Owner – CRM"], shouldFlag: false },
      { id: 2, cells: ["Billing/ERP system", "Financial Controller"], shouldFlag: false },
      { id: 3, cells: ["Customer PII database", "Data Platform Lead"], shouldFlag: false },
      { id: 4, cells: ["Source code repository", "Head of Engineering"], shouldFlag: false },
      { id: 5, cells: ["Marketing analytics SaaS", "Unassigned"], shouldFlag: true },
      { id: 6, cells: ["Legacy reporting server", ""], shouldFlag: true },
      { id: 7, cells: ["Email/SaaS suite", "IT Operations Manager"], shouldFlag: false },
      { id: 8, cells: ["Payroll system", "Chief Human Resources Officer"], shouldFlag: false },
      { id: 9, cells: ["Shadow Jira instance", ""], shouldFlag: true },
      { id: 10, cells: ["Internal wiki", "Head of Engineering"], shouldFlag: false },
      { id: 11, cells: ["Backup vault", "Data Platform Lead"], shouldFlag: false },
      { id: 12, cells: ["Contractor laptop pool", "Unassigned"], shouldFlag: true },
      { id: 13, cells: ["SIEM platform", "Chief Information Security Officer"], shouldFlag: false },
      { id: 14, cells: ["Public website", "Head of Marketing"], shouldFlag: false },
      { id: 15, cells: ["Test CRM sandbox", ""], shouldFlag: true },
      { id: 16, cells: ["IdP / SSO", "Chief Information Security Officer"], shouldFlag: false },
      { id: 17, cells: ["Container registry", "Head of Engineering"], shouldFlag: false },
      { id: 18, cells: ["Data warehouse", "Unassigned"], shouldFlag: true },
      { id: 19, cells: ["Office file server", "IT Operations Manager"], shouldFlag: false },
      { id: 20, cells: ["Monitoring/Grafana", "SRE Lead"], shouldFlag: false },
      { id: 21, cells: ["Old VPN appliance", ""], shouldFlag: true },
      { id: 22, cells: ["HR SaaS", "HR Systems Manager"], shouldFlag: false },
      { id: 23, cells: ["Document e-sign tool", "Unassigned"], shouldFlag: true },
      { id: 24, cells: ["Code signing keys", "Chief Information Security Officer"], shouldFlag: false },
    ],
  },
  "AA-002/2.5": {
    title: "Identify Top Control Gaps (CIS IG1)",
    standard: "CIS Controls v8 — IG1 Safeguards (Controls 1–6)",
    criterion: "Flag safeguards that are Not Implemented AND High exposure (the top gaps).",
    columns: ["CIS v8 IG1 Safeguard", "Control group", "Status", "Risk exposure"],
    owners: ["IT Manager / Compliance Manager", "CISO", "Process Owner", "IT Operations"],
    feedsNext: "Feeds the remediation-recommendation step — the top-gap list with priority + owner.",
    rows: [
      { id: 1, cells: ["1.1 Asset inventory", "CC1 Inventory", "Not Implemented", "High"], shouldFlag: true },
      { id: 2, cells: ["2.1 Software inventory", "CC2 Software", "Partial", "Medium"], shouldFlag: false },
      { id: 3, cells: ["3.1 Data management process", "CC3 Data", "Not Implemented", "High"], shouldFlag: true },
      { id: 4, cells: ["3.3 Access control to data", "CC3 Data", "Partial", "High"], shouldFlag: false },
      { id: 5, cells: ["4.1 Secure configuration", "CC4 Config", "Not Implemented", "High"], shouldFlag: true },
      { id: 6, cells: ["4.7 Default accounts/passwords", "CC4 Config", "Not Implemented", "High"], shouldFlag: true },
      { id: 7, cells: ["5.1 Account inventory", "CC5 Accounts", "Implemented", "Low"], shouldFlag: false },
      { id: 8, cells: ["5.3 Disable dormant accounts", "CC5 Accounts", "Partial", "Medium"], shouldFlag: false },
      { id: 9, cells: ["6.1 Access grant process", "CC6 Access", "Implemented", "Low"], shouldFlag: false },
      { id: 10, cells: ["6.2 Access revoke process", "CC6 Access", "Partial", "Medium"], shouldFlag: false },
      { id: 11, cells: ["1.2 Unauthorised asset handling", "CC1 Inventory", "Not Implemented", "Medium"], shouldFlag: false },
      { id: 12, cells: ["2.3 Unauthorised software", "CC2 Software", "Not Implemented", "High"], shouldFlag: true },
      { id: 13, cells: ["3.4 Retention", "CC3 Data", "Partial", "Low"], shouldFlag: false },
      { id: 14, cells: ["4.2 Config maintenance", "CC4 Config", "Partial", "Medium"], shouldFlag: false },
      { id: 15, cells: ["5.2 Unique passwords", "CC5 Accounts", "Implemented", "Low"], shouldFlag: false },
      { id: 16, cells: ["6.3 MFA for external", "CC6 Access", "Not Implemented", "High"], shouldFlag: true },
      { id: 17, cells: ["6.5 MFA for admin", "CC6 Access", "Not Implemented", "High"], shouldFlag: true },
      { id: 18, cells: ["2.2 Authorised software list", "CC2 Software", "Partial", "Medium"], shouldFlag: false },
      { id: 19, cells: ["4.6 Manage default accounts", "CC4 Config", "Implemented", "Low"], shouldFlag: false },
      { id: 20, cells: ["3.2 Data inventory", "CC3 Data", "Partial", "Medium"], shouldFlag: false },
    ],
  },
  "CRM-002/8.7": {
    title: "Identify Top Uncontrolled Risks",
    standard: "ISO 27001:2022 — Annex A (93 controls, 4 themes)",
    criterion: "Flag risks where control coverage = Gap AND exposure = High.",
    columns: ["Risk (from matrix gap)", "Process", "Control coverage", "Exposure"],
    owners: ["Compliance Manager / Process Owner", "CISO", "IT Manager", "Process Owner"],
    feedsNext: "Feeds the matrix review — the top uncontrolled-risk list with mitigation owner.",
    rows: [
      { id: 1, cells: ["No encryption of backups", "Customer data backup", "Gap", "High"], shouldFlag: true },
      { id: 2, cells: ["Unrestricted prod DB access", "User onboarding", "Gap", "High"], shouldFlag: true },
      { id: 3, cells: ["No code review gate", "Software release", "Partial", "Medium"], shouldFlag: false },
      { id: 4, cells: ["Vendor with no security review", "Vendor onboarding", "Gap", "High"], shouldFlag: true },
      { id: 5, cells: ["No log monitoring", "Incident handling", "Gap", "High"], shouldFlag: true },
      { id: 6, cells: ["Shared admin credentials", "User onboarding", "Gap", "High"], shouldFlag: true },
      { id: 7, cells: ["Manual offboarding only", "User offboarding", "Partial", "Medium"], shouldFlag: false },
      { id: 8, cells: ["No DR test", "Customer data backup", "Gap", "Medium"], shouldFlag: false },
      { id: 9, cells: ["Unpatched build server", "Software release", "Partial", "Medium"], shouldFlag: false },
      { id: 10, cells: ["No data classification", "Customer data backup", "Partial", "Low"], shouldFlag: false },
      { id: 11, cells: ["Default cloud config", "Software release", "Gap", "High"], shouldFlag: true },
      { id: 12, cells: ["No MFA on VPN", "Remote access", "Gap", "High"], shouldFlag: true },
      { id: 13, cells: ["Email auto-forward allowed", "Comms", "Partial", "Low"], shouldFlag: false },
      { id: 14, cells: ["No vendor DPA", "Vendor onboarding", "Gap", "Medium"], shouldFlag: false },
      { id: 15, cells: ["Excessive access rights", "User onboarding", "Partial", "Medium"], shouldFlag: false },
      { id: 16, cells: ["No incident runbook", "Incident handling", "Gap", "Medium"], shouldFlag: false },
      { id: 17, cells: ["Unencrypted laptops", "Remote access", "Gap", "High"], shouldFlag: true },
      { id: 18, cells: ["No change approval", "Software release", "Partial", "Low"], shouldFlag: false },
    ],
  },
  "CRM-003/9.4": {
    title: "Identify Unmapped SOC 2 Criteria",
    standard: "SOC 2 Type II (AICPA TSC) — CC1–CC9",
    criterion: "Flag any CC point where 'Internal control mapped?' = N.",
    columns: ["SOC 2 CC point", "Internal control mapped? (Y/N)"],
    owners: ["Control Owner / Information Security Auditor", "Compliance Manager", "CISO", "IT Manager"],
    feedsNext: "Feeds the ISO cross-reference / readiness dashboard — the unmapped-CC list.",
    rows: [
      { id: 1, cells: ["CC1.1 Integrity & ethics", "Y"], shouldFlag: false },
      { id: 2, cells: ["CC1.2 Board oversight", "Y"], shouldFlag: false },
      { id: 3, cells: ["CC1.4 Competence/training", "Y"], shouldFlag: false },
      { id: 4, cells: ["CC2.1 Quality information", "Y"], shouldFlag: false },
      { id: 5, cells: ["CC3.1 Risk objectives", "N"], shouldFlag: true },
      { id: 6, cells: ["CC3.2 Risk identification", "Y"], shouldFlag: false },
      { id: 7, cells: ["CC4.1 Monitoring controls", "N"], shouldFlag: true },
      { id: 8, cells: ["CC5.2 Technology controls", "Y"], shouldFlag: false },
      { id: 9, cells: ["CC6.1 Logical access", "Y"], shouldFlag: false },
      { id: 10, cells: ["CC6.2 Registration/authorisation", "Y"], shouldFlag: false },
      { id: 11, cells: ["CC6.3 Access removal", "N"], shouldFlag: true },
      { id: 12, cells: ["CC6.6 Boundary protection", "N"], shouldFlag: true },
      { id: 13, cells: ["CC6.7 Data in transit", "Y"], shouldFlag: false },
      { id: 14, cells: ["CC7.1 Vulnerability detection", "Y"], shouldFlag: false },
      { id: 15, cells: ["CC7.2 Security monitoring", "N"], shouldFlag: true },
      { id: 16, cells: ["CC7.4 Incident response", "Y"], shouldFlag: false },
      { id: 17, cells: ["CC8.1 Change management", "N"], shouldFlag: true },
      { id: 18, cells: ["CC9.2 Vendor risk", "Y"], shouldFlag: false },
    ],
  },
  "TPRM-001/6": {
    title: "Identify Vendors Missing a DPA",
    standard: "ISO 27001 A.5.19/5.20; GDPR Art 28 (DPA)",
    criterion: "Flag vendors where DPA is None/Expired AND data access is process or store.",
    columns: ["Vendor", "Data access", "DPA status"],
    owners: ["Vendor/Third-Party Risk Analyst / Procurement", "Procurement", "Compliance Manager", "DPO"],
    feedsNext: "Feeds the Supplier Register summary — the missing-DPA vendor list with owner.",
    rows: [
      { id: 1, cells: ["Cloud IaaS Co", "store", "Signed"], shouldFlag: false },
      { id: 2, cells: ["Email SaaS Co", "store", "None"], shouldFlag: true },
      { id: 3, cells: ["Payroll Co", "store", "Expired"], shouldFlag: true },
      { id: 4, cells: ["CRM SaaS Co", "store", "Signed"], shouldFlag: false },
      { id: 5, cells: ["Marketing email Co", "process", "None"], shouldFlag: true },
      { id: 6, cells: ["Helpdesk SaaS Co", "process", "Signed"], shouldFlag: false },
      { id: 7, cells: ["Analytics Co", "process", "None"], shouldFlag: true },
      { id: 8, cells: ["Background-check Co", "store", "None"], shouldFlag: true },
      { id: 9, cells: ["Translation Co", "view", "None"], shouldFlag: false },
      { id: 10, cells: ["Office cleaning Co", "none", "None"], shouldFlag: false },
      { id: 11, cells: ["Stationery Co", "none", "None"], shouldFlag: false },
      { id: 12, cells: ["Legal advisors Co", "view", "Signed"], shouldFlag: false },
      { id: 13, cells: ["Accounting Co", "process", "Expired"], shouldFlag: true },
      { id: 14, cells: ["Survey tool Co", "process", "None"], shouldFlag: true },
      { id: 15, cells: ["Recruitment Co", "process", "None"], shouldFlag: true },
      { id: 16, cells: ["Backup/DR Co", "store", "Signed"], shouldFlag: false },
      { id: 17, cells: ["SIEM SaaS Co", "process", "Signed"], shouldFlag: false },
      { id: 18, cells: ["Catering Co", "none", "None"], shouldFlag: false },
      { id: 19, cells: ["Courier Co", "view", "None"], shouldFlag: false },
      { id: 20, cells: ["E-sign Co", "store", "None"], shouldFlag: true },
      { id: 21, cells: ["Password mgr Co", "store", "Signed"], shouldFlag: false },
      { id: 22, cells: ["Telecoms Co", "view", "Signed"], shouldFlag: false },
    ],
  },
  "BCRP-001/5": {
    title: "Identify Single Points of Failure",
    standard: "ISO 27001 A.5.29 (Security during disruption); A.5.30 (ICT readiness)",
    criterion: "Flag any dependency where 'Backup/alternative?' = N (single point of failure).",
    columns: ["Critical function", "Key dependency", "Backup/alternative? (Y/N)"],
    owners: ["Business Continuity Analyst / Function Owner", "Function Owner", "IT Manager", "Operations Manager"],
    feedsNext: "Feeds the BIA Summary Table — the flagged SPOF list with workaround + owner.",
    rows: [
      { id: 1, cells: ["Inbound call handling", "ACD/telephony platform", "N"], shouldFlag: true },
      { id: 2, cells: ["Agent authentication", "Single SSO provider", "N"], shouldFlag: true },
      { id: 3, cells: ["Ticketing", "Helpdesk SaaS", "Y"], shouldFlag: false },
      { id: 4, cells: ["Payroll run", "Payroll vendor", "N"], shouldFlag: true },
      { id: 5, cells: ["Knowledge base", "Internal wiki", "Y"], shouldFlag: false },
      { id: 6, cells: ["Customer data access", "Primary CRM", "N"], shouldFlag: true },
      { id: 7, cells: ["Workforce scheduling", "WFM tool", "Y"], shouldFlag: false },
      { id: 8, cells: ["Email", "Email SaaS", "Y"], shouldFlag: false },
      { id: 9, cells: ["Quality monitoring", "Call-recording system", "N"], shouldFlag: true },
      { id: 10, cells: ["Network connectivity", "Single ISP link", "N"], shouldFlag: true },
      { id: 11, cells: ["Reporting", "BI platform", "Y"], shouldFlag: false },
      { id: 12, cells: ["Identity provisioning", "One IT admin (key person)", "N"], shouldFlag: true },
      { id: 13, cells: ["Document storage", "File server FS01", "Y"], shouldFlag: false },
      { id: 14, cells: ["Backups", "Single backup vendor", "Y"], shouldFlag: false },
      { id: 15, cells: ["Escalation comms", "Manager phone tree", "Y"], shouldFlag: false },
      { id: 16, cells: ["Power", "Single UPS, no generator", "N"], shouldFlag: true },
      { id: 17, cells: ["VPN remote access", "One VPN appliance", "N"], shouldFlag: true },
      { id: 18, cells: ["Translation/localisation", "Sole vendor", "N"], shouldFlag: true },
    ],
  },
};

export function getIdentifyTask(taskCode?: string, activityCode?: string): IdentifyTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return IDENTIFY_TASKS[`${taskCode}/${activityCode}`];
}
