// Record worked tasks. Source: Record_Verb_Task_Register.xlsx. The mentee enters rows into an
// authoritative register; there is no answer key — the gate is Layer-1 deterministic validation
// (mandatory fields, ID format, controlled vocab, owner-is-a-role, no duplicate IDs, conditional
// rationale, pass↔score consistency).

export interface RecCol {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  required?: boolean;
  options?: string[];
  /** Regex source the value must match (e.g. asset-ID format). */
  idFormat?: { pattern: string; example: string };
  /** Owner-is-a-role rule: reject department/team/division values. */
  notDepartment?: boolean;
  /** Required only when another column equals a value (e.g. rationale if Confidential). */
  condReq?: { key: string; equals: string };
  /** No duplicate values across rows (e.g. Asset ID, Participant Name). */
  unique?: boolean;
}

export interface RecordTask {
  title: string;
  standard: string;
  registerName: string;
  requiredRows: number;
  /** Title of the reference document the rows are transcribed from — shown in the workspace so the
   *  register isn't a blank table with no stated source. Must match a doc in the step's reference
   *  strip (see backend _seed/grc101_content.json → activities[code].references). */
  source?: string;
  columns: RecCol[];
  /** Cross-field rule: Pass iff score ≥ threshold (when both present). */
  passRule?: { passKey: string; scoreKey: string; threshold: number };
  feedsNext: string;
}

export const RECORD_TASKS: Record<string, RecordTask> = {
  // Columns mirror the step's own brief and source document (see grc101_content.json AA-001 → 1.3):
  // "asset name, data held, location, and a named owner", one row per asset in the intake notes.
  // Classification is deliberately NOT here — the brief says "leave classification blank for now,
  // that's the next step", and step 1.4 (Apply) is that step. It used to be a *required* CIA column,
  // so a mentee who followed the instruction could never submit.
  "AA-001/1.3": {
    title: "Information Asset Register",
    standard: "ISO 27001 A.5.9 Inventory",
    registerName: "Information Asset Register",
    requiredRows: 8, // the intake notes list 8 distinct assets; the brief says one row per asset
    source: "CloudTech — Asset Intake Notes",
    feedsNext: "Feeds Step 1.4 (Apply classification) and Step 1.5 (Cross-reference).",
    columns: [
      { key: "assetId", label: "Asset ID", type: "text", required: true, idFormat: { pattern: "^AST-\\d{4}$", example: "AST-0001" }, unique: true },
      { key: "name", label: "Asset Name", type: "text", required: true },
      { key: "type", label: "Asset Type", type: "select", required: true, options: ["Application/SaaS", "Server", "Database", "Endpoint", "Network Share", "Document Store", "Source Code"] },
      // The source rules are explicit that this names the data types ("names, emails, hashed
      // passwords"), not a vague "customer data" — it was mandatory in the brief but had no column.
      { key: "dataHeld", label: "Data Held", type: "text", required: true },
      { key: "location", label: "Storage Location", type: "text", required: true },
      { key: "owner", label: "Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "CA-001/6": {
    title: "Training Attendance Register",
    standard: "ISO 27001 A.6.3 Awareness & training",
    registerName: "Training Attendance Register",
    requiredRows: 4,
    feedsNext: "Feeds Step 7 (Score / pass-rate) and Step 8 (Training Completion Report).",
    passRule: { passKey: "pass", scoreKey: "score", threshold: 80 },
    columns: [
      { key: "name", label: "Participant Name", type: "text", required: true, unique: true },
      { key: "role", label: "Role", type: "text", required: true },
      { key: "dept", label: "Department/Unit", type: "text", required: true },
      { key: "date", label: "Session Date", type: "date", required: true },
      { key: "status", label: "Attendance Status", type: "select", required: true, options: ["Present in-person", "Present remote", "Absent", "Excused"] },
      { key: "score", label: "K-Check Score %", type: "number" },
      { key: "pass", label: "Pass/Fail", type: "select", options: ["Pass", "Fail"] },
    ],
  },

  // ── Risk, assessment and privacy registers ────────────────────────────────────────────────
  "GRM-001/4.3": {
    title: "Operational Risk Register",
    standard: "ISO 27001 Cl. 6.1.2 Risk assessment",
    registerName: "Risk Register v1.0",
    requiredRows: 6,
    source: "Risk identification workshop output (GRM-001-S2-OUT)",
    feedsNext: "Feeds Step 4 (scoring), Step 5 (treatment) and MM-002, SPA-001, BCRP-001.",
    columns: [
      { key: "riskId", label: "Risk ID", type: "text", required: true, idFormat: { pattern: "^[A-Z]{2,4}-R-\\d{2}$", example: "AMN-R-01" }, unique: true },
      // The acceptance criterion is cause -> event -> consequence, so it is one field, not three:
      // splitting it lets a mentee write an event with no cause and still pass the required check.
      { key: "description", label: "Risk (cause → event → consequence)", type: "text", required: true },
      { key: "source", label: "Threat Source", type: "select", required: true, options: ["Internal process", "Third party", "External/operational", "Technology", "People"] },
      { key: "controls", label: "Existing Controls (state 'policy only' where that is the truth)", type: "text", required: true },
      { key: "likelihood", label: "Likelihood (1–5)", type: "number", required: true },
      { key: "impact", label: "Impact (1–5)", type: "number", required: true },
      { key: "inherent", label: "Inherent Score (L×I)", type: "number", required: true },
      { key: "owner", label: "Risk Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "AA-002/2.3": {
    title: "CIS IG1 Safeguard Assessment",
    standard: "CIS Controls v8 IG1",
    registerName: "IG1 Assessment Worksheet",
    requiredRows: 8,
    source: "Evidence received from system owners (AA-002-S2-OUT)",
    feedsNext: "Feeds Step 4 (scoring), Step 5 (gap ranking) and IE-001, TV-001, SPA-001.",
    columns: [
      { key: "safeguard", label: "Safeguard (e.g. 1.1)", type: "text", required: true, unique: true },
      { key: "title", label: "Safeguard Title", type: "text", required: true },
      { key: "state", label: "Current State", type: "select", required: true, options: ["Implemented", "Partial", "Not Implemented", "Not Applicable"] },
      { key: "evidence", label: "Evidence Reviewed", type: "text", required: true },
      { key: "ref", label: "Evidence Reference (or '—')", type: "text", required: true },
      // "Not applicable determinations carry rationale" is in the acceptance criteria, and a
      // free N/A with no reason is the usual way a gap analysis quietly loses a safeguard.
      { key: "naRationale", label: "Not-Applicable Rationale", type: "text", condReq: { key: "state", equals: "Not Applicable" } },
    ],
  },
  "AA-003/3.4": {
    title: "Article 30 Record of Processing",
    standard: "GDPR Art. 30 (and local equivalent)",
    registerName: "RoPA",
    requiredRows: 5,
    source: "Data-flow map and processing inventory (AA-003-S2/S3-OUT)",
    feedsNext: "Feeds Steps 5–8 and DD-003 (retention), LRC-001, TPRM-001.",
    columns: [
      { key: "activity", label: "Processing Activity", type: "text", required: true, unique: true },
      { key: "role", label: "Our Role", type: "select", required: true, options: ["Controller", "Joint controller", "Processor"] },
      { key: "purpose", label: "Purpose", type: "text", required: true },
      { key: "subjects", label: "Data Subjects", type: "text", required: true },
      { key: "categories", label: "Data Categories", type: "text", required: true },
      { key: "lawfulBasis", label: "Lawful Basis", type: "select", required: true, options: ["Consent", "Contract", "Legal obligation", "Vital interests", "Public task", "Legitimate interests", "Not defined"] },
      { key: "recipients", label: "Recipients / Processors", type: "text", required: true },
      { key: "transfers", label: "International Transfers & Safeguard", type: "text", required: true },
      { key: "retention", label: "Retention Period", type: "text", required: true },
      { key: "owner", label: "Accountable Role", type: "text", required: true, notDepartment: true },
    ],
  },
  "CRM-001/7.3": {
    title: "Regulatory Obligations Long-List",
    standard: "ISO 27001 A.5.31 Legal & contractual requirements",
    registerName: "Obligations Register",
    requiredRows: 8,
    feedsNext: "Feeds Step 4 (applicability screening) and Step 5 (obligation-to-control mapping).",
    columns: [
      { key: "obligationId", label: "Obligation ID", type: "text", required: true, idFormat: { pattern: "^OBL-\\d{3}$", example: "OBL-001" }, unique: true },
      { key: "category", label: "Category", type: "select", required: true, options: ["Legislation", "Sector regulation", "Contractual", "Voluntary standard"] },
      { key: "instrument", label: "Instrument / Clause", type: "text", required: true },
      { key: "requirement", label: "What It Requires Of Us", type: "text", required: true },
      { key: "trigger", label: "Why It Applies Here", type: "text", required: true },
      { key: "owner", label: "Accountable Role", type: "text", required: true, notDepartment: true },
    ],
  },
  "CRM-002/8.4": {
    title: "Control Implementation Status",
    standard: "ISO 27001 Annex A · Cl. 6.1.3 Statement of Applicability",
    registerName: "Control Implementation Matrix",
    requiredRows: 6,
    source: "Applicable-control list (CRM-002-S3-OUT)",
    feedsNext: "Feeds Step 5 (gap identification), Step 8 (matrix sign-off) and CRM-003, PE-002.",
    columns: [
      { key: "control", label: "Annex A Control", type: "text", required: true, unique: true },
      { key: "process", label: "Business Process Covered", type: "text", required: true },
      { key: "status", label: "Implementation Status", type: "select", required: true, options: ["Implemented", "Partial", "Not Implemented"] },
      { key: "evidenceType", label: "Evidence Type Expected", type: "text", required: true },
      { key: "owner", label: "Control Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "limitation", label: "Known Limitation", type: "text", condReq: { key: "status", equals: "Partial" } },
    ],
  },

  // ── Retention, policy and document registers ──────────────────────────────────────────────
  "DD-003/4": {
    title: "Data Retention Schedule",
    standard: "GDPR Art. 5(1)(e) Storage limitation · ISO 27001 A.5.33",
    registerName: "Data Retention Schedule",
    requiredRows: 6,
    source: "Data element inventory for the selected category",
    feedsNext: "Feeds Step 5 (triggers and disposal) and Step 7 (schedule approval).",
    columns: [
      { key: "element", label: "Data Element", type: "text", required: true, unique: true },
      { key: "category", label: "Record Category", type: "text", required: true },
      { key: "system", label: "System Of Record", type: "text", required: true },
      { key: "basis", label: "Retention Basis (law, contract or business need)", type: "text", required: true },
      { key: "owner", label: "Data Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "DD-003/5": {
    title: "Retention Triggers and Disposal Methods",
    standard: "GDPR Art. 5(1)(e) · ISO 27001 A.8.10 Information deletion",
    registerName: "Retention Schedule — disposal detail",
    requiredRows: 6,
    source: "Data Retention Schedule (DD-003-S4-OUT)",
    feedsNext: "Feeds Step 6 (legal review) and Step 7 (approval).",
    columns: [
      { key: "element", label: "Data Element", type: "text", required: true, unique: true },
      { key: "trigger", label: "Retention Trigger", type: "text", required: true },
      { key: "period", label: "Retention Period From Trigger", type: "text", required: true },
      { key: "reviewPoint", label: "Review Point", type: "text", required: true },
      { key: "disposal", label: "Disposal Method", type: "select", required: true, options: ["Secure deletion", "Anonymisation", "Archive", "Return to client"] },
      { key: "verification", label: "How Disposal Is Evidenced", type: "text", required: true },
    ],
  },
  "CRM-001/7.8": {
    title: "Obligations Register — Registration & Review",
    standard: "ISO 27001 Cl. 7.5.3 Control of documented information",
    registerName: "Policy Register",
    requiredRows: 1,
    feedsNext: "Closes CRM-001; the review date feeds the compliance calendar.",
    columns: [
      { key: "docId", label: "Document ID", type: "text", required: true, idFormat: { pattern: "^[A-Z]{2,4}-DOC-\\d{3}$", example: "AMN-DOC-014" }, unique: true },
      { key: "title", label: "Document Title", type: "text", required: true },
      { key: "version", label: "Version", type: "text", required: true },
      { key: "approved", label: "Approval Date", type: "date", required: true },
      { key: "owner", label: "Document Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "cadence", label: "Review Cadence", type: "select", required: true, options: ["Quarterly", "Half-yearly", "Annually"] },
      { key: "nextReview", label: "Next Review Date", type: "date", required: true },
    ],
  },
  "GRM-002/5.8": {
    title: "Policy Register Entry",
    standard: "ISO 27001 Cl. 5.2 Policy · Cl. 7.5.3 Documented information",
    registerName: "Policy Register",
    requiredRows: 1,
    feedsNext: "Closes GRM-002; the review date feeds the management review cycle.",
    columns: [
      { key: "docId", label: "Policy ID", type: "text", required: true, idFormat: { pattern: "^[A-Z]{2,4}-POL-\\d{3}$", example: "AMN-POL-001" }, unique: true },
      { key: "title", label: "Policy Title", type: "text", required: true },
      { key: "version", label: "Version", type: "text", required: true },
      { key: "approver", label: "Approved By (role)", type: "text", required: true, notDepartment: true },
      { key: "approved", label: "Approval Date", type: "date", required: true },
      { key: "nextReview", label: "Next Review Date", type: "date", required: true },
      { key: "audience", label: "Audience & Communication Route", type: "text", required: true },
    ],
  },
  "CRM-003/9.2": {
    title: "SOC 2 Common Criteria Control Points",
    standard: "SOC 2 Type II (AICPA TSC) — CC1–CC9",
    registerName: "Common Criteria Listing",
    requiredRows: 9,
    source: "COSO-derived Common Criteria for the Security category",
    feedsNext: "Feeds Step 9.3 (mapping), 9.4 (gaps) and 9.5 (ISO cross-reference).",
    columns: [
      { key: "cc", label: "CC Point", type: "text", required: true, unique: true },
      { key: "title", label: "Criterion Title", type: "text", required: true },
      { key: "coso", label: "COSO Principle", type: "text", required: true },
      { key: "intent", label: "What It Requires, In Your Own Words", type: "text", required: true },
      { key: "applies", label: "Applies To Security Category", type: "select", required: true, options: ["Yes", "No"] },
    ],
  },
  "DD-001/8": {
    title: "Procedure Registration & Staff Communication",
    standard: "ISO 27001 A.5.26 Response to incidents · Cl. 7.5.3",
    registerName: "Policy Library",
    requiredRows: 1,
    feedsNext: "Closes DD-001; the procedure becomes the control evidenced under CC7.4 / A.5.26.",
    columns: [
      { key: "docId", label: "Document ID", type: "text", required: true, idFormat: { pattern: "^[A-Z]{2,4}-PRO-\\d{3}$", example: "AMN-PRO-002" }, unique: true },
      { key: "title", label: "Procedure Title", type: "text", required: true },
      { key: "version", label: "Version", type: "text", required: true },
      { key: "effective", label: "Effective Date", type: "date", required: true },
      { key: "owner", label: "Procedure Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "announcement", label: "Staff Announcement (one paragraph)", type: "text", required: true },
      { key: "channel", label: "Communication Channel", type: "text", required: true },
    ],
  },

  // ── Stakeholder and roadmap registers ─────────────────────────────────────────────────────
  "SPA-002/2": {
    title: "Stakeholder Brainstorm",
    standard: "ISO 27001 Cl. 4.2 Interested parties",
    registerName: "Stakeholder Long-List",
    requiredRows: 10,
    feedsNext: "Feeds Step 3 (Stakeholder Register) and Step 4 (influence/interest grid).",
    columns: [
      { key: "stakeholder", label: "Stakeholder / Group", type: "text", required: true, unique: true },
      { key: "side", label: "Internal or External", type: "select", required: true, options: ["Internal", "External"] },
      { key: "why", label: "Why They Are Affected", type: "text", required: true },
    ],
  },
  "SPA-002/3": {
    title: "Stakeholder Register",
    standard: "ISO 27001 Cl. 4.2 Interested parties · Cl. 7.4 Communication",
    registerName: "Stakeholder Register",
    requiredRows: 8,
    source: "Stakeholder long-list (SPA-002-S2-OUT)",
    feedsNext: "Feeds Step 4 (influence/interest mapping) and Step 6 (communication plan).",
    columns: [
      { key: "stakeholder", label: "Name / Group", type: "text", required: true, unique: true },
      { key: "role", label: "Role", type: "text", required: true, notDepartment: true },
      { key: "interestIn", label: "Interest In The Initiative", type: "text", required: true },
      { key: "influence", label: "Level Of Influence", type: "select", required: true, options: ["High", "Medium", "Low"] },
      { key: "interest", label: "Level Of Interest", type: "select", required: true, options: ["High", "Medium", "Low"] },
      { key: "needs", label: "Communication Needs", type: "text", required: true },
      { key: "channel", label: "Preferred Channel", type: "select", required: true, options: ["1:1 briefing", "Steering meeting", "Written report", "Email update", "Team stand-up"] },
    ],
  },
  "SPA-001/3": {
    title: "Roadmap Action Detail",
    standard: "ISO 27001 Cl. 6.2 Objectives and planning",
    registerName: "GRC Action Detail Sheet",
    requiredRows: 6,
    source: "Banded gap list (SPA-001-S2-OUT)",
    feedsNext: "Feeds Step 4 (Gantt), Step 5 (uplift estimate) and Step 6 (management briefing).",
    columns: [
      { key: "actionId", label: "Action ID", type: "text", required: true, idFormat: { pattern: "^R-\\d{2}$", example: "R-01" }, unique: true },
      { key: "description", label: "Action Description", type: "text", required: true },
      { key: "control", label: "ISO 27001 Clause / Control Addressed", type: "text", required: true },
      { key: "phase", label: "Phase", type: "select", required: true, options: ["Quick Win (0–3m)", "Medium-Term (3–6m)", "Strategic (6–12m)"] },
      { key: "hours", label: "Resource Requirement (hours)", type: "number", required: true },
      { key: "owner", label: "Responsible Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "metric", label: "Success Metric", type: "text", required: true },
      { key: "target", label: "Target Completion Date", type: "date", required: true },
    ],
  },

  // ── Risk-cycle maintenance ────────────────────────────────────────────────────────────────
  "MM-002/5": {
    title: "New Risks This Cycle",
    standard: "ISO 27001 Cl. 6.1.2 · Cl. 9.1 Monitoring",
    registerName: "Risk Register — new entries",
    requiredRows: 3,
    source: "This month's findings: incidents, audit results, change records",
    feedsNext: "Feeds Steps 6–8 and SPA-001, TPRM-001.",
    columns: [
      { key: "riskId", label: "Risk ID", type: "text", required: true, idFormat: { pattern: "^[A-Z]{2,4}-R-\\d{2}$", example: "AMN-R-13" }, unique: true },
      { key: "description", label: "Risk (cause → event → consequence)", type: "text", required: true },
      // "evidence from real findings; the discipline against invented risks" — a new risk with no
      // triggering finding is the failure mode this column exists to make visible.
      { key: "origin", label: "Triggering Finding (what surfaced it this month)", type: "text", required: true },
      { key: "likelihood", label: "Likelihood (1–5)", type: "number", required: true },
      { key: "impact", label: "Impact (1–5)", type: "number", required: true },
      { key: "inherent", label: "Inherent Score (L×I)", type: "number", required: true },
      { key: "topScorer", label: "Enters In The Top Five?", type: "select", required: true, options: ["Yes", "No"] },
      { key: "owner", label: "Risk Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "MM-002/7": {
    title: "Risk Register v2.0 and Management Summary",
    standard: "ISO 27001 Cl. 9.1 Monitoring · Cl. 9.3 Management review",
    registerName: "Register revision history",
    requiredRows: 4,
    feedsNext: "Feeds Step 8 (distribution) and CA-002, SPA-001, MM-001.",
    columns: [
      { key: "riskId", label: "Risk ID", type: "text", required: true, unique: true },
      { key: "change", label: "Change This Cycle", type: "select", required: true, options: ["Added", "Score raised", "Score lowered", "Closed", "Owner changed", "No change"] },
      { key: "reason", label: "Reason For The Change", type: "text", required: true },
      { key: "movement", label: "Score Movement (from → to)", type: "text", required: true },
      // "a positive result included" — a summary that only reports deterioration reads as
      // alarmism and management stops trusting the movement figures.
      { key: "direction", label: "Improvement Or Deterioration", type: "select", required: true, options: ["Improvement", "Deterioration", "Neutral"] },
    ],
  },
  "MM-002/8": {
    title: "Register Distribution and Filing",
    standard: "ISO 27001 Cl. 7.5.3 Documented information · A.5.13 Labelling",
    registerName: "Distribution Record",
    requiredRows: 4,
    feedsNext: "Feeds CA-002, PE-002, TPRM-001, SPA-001 and the next MM-002 cycle.",
    columns: [
      { key: "recipient", label: "Recipient (role)", type: "text", required: true, notDepartment: true, unique: true },
      { key: "risks", label: "Risks They Own", type: "text", required: true },
      { key: "newOwner", label: "Newly Assigned This Cycle", type: "select", required: true, options: ["Yes", "No"] },
      { key: "briefed", label: "Briefing Date (required before distribution for new owners)", type: "date", condReq: { key: "newOwner", equals: "Yes" } },
      { key: "classification", label: "Handling Restriction Applied", type: "select", required: true, options: ["Internal", "Confidential", "Restricted"] },
      { key: "filedAt", label: "Evidence Repository Location", type: "text", required: true },
    ],
  },

  // ── Implementation tracking and evidence ──────────────────────────────────────────────────
  "IE-001/3": {
    title: "Control Implementation Tracker",
    standard: "CIS Controls v8 IG1 · ISO 27001 Cl. 8.1",
    registerName: "Control Implementation Tracker",
    requiredRows: 6,
    source: "Remediation plan (IE-001-S2-OUT)",
    feedsNext: "Feeds Steps 4–6 and Step 8; blockers route back to DD-003, GRM-001.",
    columns: [
      { key: "safeguard", label: "Safeguard", type: "text", required: true },
      { key: "week", label: "Week", type: "select", required: true, options: ["Week 1", "Week 2", "Week 3"] },
      { key: "status", label: "Status", type: "select", required: true, options: ["Not started", "In progress", "Blocked", "Complete"] },
      { key: "progress", label: "What Moved This Week", type: "text", required: true },
      { key: "blocker", label: "Blocker", type: "text", condReq: { key: "status", equals: "Blocked" } },
      { key: "resolutionDate", label: "Blocker Resolution Date", type: "date", condReq: { key: "status", equals: "Blocked" } },
      { key: "owner", label: "Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "IE-001/4": {
    title: "Safeguard Evidence Repository",
    standard: "CIS Controls v8 IG1 · ISO 27001 A.5.35 Independent review",
    registerName: "Evidence Repository",
    requiredRows: 6,
    feedsNext: "Feeds Steps 5, 7 and 8, and PE-002, CRM-003.",
    columns: [
      { key: "safeguard", label: "Safeguard", type: "text", required: true, unique: true },
      { key: "evidenceType", label: "Evidence Type", type: "select", required: true, options: ["Screenshot", "Configuration export", "Policy document", "Ticket / record", "None available"] },
      { key: "filename", label: "Filed As", type: "text", required: true },
      { key: "captured", label: "Capture Date", type: "date", required: true },
      { key: "quality", label: "Quality Check", type: "select", required: true, options: ["Accepted", "Rejected — re-collect"] },
      // "absent items recorded as absent" — a blank row is indistinguishable from a missing
      // control, and that is exactly the ambiguity an auditor charges for.
      { key: "absenceNote", label: "Why No Evidence Exists", type: "text", condReq: { key: "evidenceType", equals: "None available" } },
      { key: "rejectReason", label: "Rejection Reason", type: "text", condReq: { key: "quality", equals: "Rejected — re-collect" } },
    ],
  },
  "IE-001/6": {
    title: "Remediation Issues",
    standard: "ISO 27001 Cl. 10.1 Nonconformity and corrective action",
    registerName: "Remediation Issue Log",
    requiredRows: 4,
    source: "Acceptance-test results (IE-001-S5-OUT)",
    feedsNext: "Feeds Steps 7–8 and DD-003, TV-001, MM-002.",
    columns: [
      { key: "issueId", label: "Issue ID", type: "text", required: true, idFormat: { pattern: "^REM-\\d{3}$", example: "REM-001" }, unique: true },
      { key: "safeguard", label: "Safeguard That Failed", type: "text", required: true },
      { key: "failure", label: "What Failed In Acceptance Testing", type: "text", required: true },
      { key: "owner", label: "Issue Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "target", label: "Target Resolution Date", type: "date", required: true },
      { key: "escalation", label: "Escalation Route If Missed", type: "text", required: true },
      { key: "systemic", label: "Symptom Of A Systemic Cause?", type: "select", required: true, options: ["Yes", "No"] },
      { key: "systemicNote", label: "The Systemic Observation", type: "text", condReq: { key: "systemic", equals: "Yes" } },
    ],
  },
  "PE-002/3": {
    title: "Audit Evidence Collection",
    standard: "ISO 27001 A.5.35 · Cl. 9.2 Internal audit",
    registerName: "Evidence Collection Log",
    requiredRows: 6,
    source: "Evidence request list (PE-002-S2-OUT)",
    feedsNext: "Feeds Steps 4–6 (labelling, indexing, self-review).",
    columns: [
      { key: "requirement", label: "Audit Requirement", type: "text", required: true, unique: true },
      { key: "item", label: "Evidence Item", type: "text", required: true },
      { key: "provider", label: "Provided By (role)", type: "text", required: true, notDepartment: true },
      { key: "sourceTask", label: "Reused From (prior task, or 'new collection')", type: "text", required: true },
      { key: "status", label: "Collection Status", type: "select", required: true, options: ["Accepted", "Returned for rework", "Deliberately not collected"] },
      { key: "note", label: "Rework Reason Or Non-Collection Rationale", type: "text", condReq: { key: "status", equals: "Returned for rework" } },
    ],
  },
  "PE-002/4": {
    title: "Evidence Labelling",
    standard: "ISO 27001 A.5.13 Labelling · Cl. 7.5.3",
    registerName: "Evidence Index",
    requiredRows: 6,
    source: "Collected evidence items (PE-002-S3-OUT)",
    feedsNext: "Feeds Steps 5–7 (indexing, pack assembly, self-review).",
    columns: [
      { key: "evidenceId", label: "Evidence ID", type: "text", required: true, idFormat: { pattern: "^EV-[A-Z0-9.\\-]+$", example: "EV-A5.18-01" }, unique: true },
      { key: "control", label: "Control Reference", type: "text", required: true },
      { key: "date", label: "Evidence Date", type: "date", required: true },
      { key: "version", label: "Version", type: "text", required: true },
      { key: "source", label: "Source System / Owner", type: "text", required: true },
      { key: "period", label: "Period Covered", type: "text", required: true },
      { key: "crossRef", label: "Also Evidences (cross-reference)", type: "text" },
      { key: "handling", label: "Handling Rule", type: "select", required: true, options: ["Internal", "Confidential", "Restricted — redact before issue"] },
    ],
  },
  "PE-002/7": {
    title: "Evidence Pack Self-Review",
    standard: "ISO 27001 Cl. 9.2 Internal audit",
    registerName: "Audit Evidence Checklist",
    requiredRows: 6,
    feedsNext: "Feeds Step 8 (issue to the auditor) and PE-001, IE-002.",
    columns: [
      { key: "criterion", label: "Checklist Criterion", type: "text", required: true, unique: true },
      { key: "result", label: "Result", type: "select", required: true, options: ["Met", "Partially met", "Not met", "Criterion does not fit — gap in the checklist"] },
      { key: "evidence", label: "What You Checked", type: "text", required: true },
      { key: "action", label: "Action Before Issue", type: "text", condReq: { key: "result", equals: "Partially met" } },
      { key: "failAction", label: "Action Before Issue", type: "text", condReq: { key: "result", equals: "Not met" } },
    ],
  },

  // ── Awareness delivery ────────────────────────────────────────────────────────────────────
  "CA-001/2": {
    title: "Session Invitation and Pre-Communication",
    standard: "ISO 27001 A.6.3 Awareness, education and training",
    registerName: "Session Communication Record",
    requiredRows: 2,
    feedsNext: "Feeds Steps 3–4 (setup and delivery).",
    columns: [
      { key: "comm", label: "Communication", type: "select", required: true, options: ["Calendar invitation", "Pre-session communication"], unique: true },
      { key: "sender", label: "Sent By (role — pick the credible sender, not GRC by default)", type: "text", required: true, notDepartment: true },
      { key: "audience", label: "Audience", type: "text", required: true },
      { key: "duration", label: "Stated Duration", type: "text", required: true },
      { key: "content", label: "What It Says Is Covered", type: "text", required: true },
      { key: "expectation", label: "What Attendees Are Expected To Do", type: "text", required: true },
      // "the barrier to attendance named and addressed; compliance framing avoided" — the two
      // things that decide whether people actually turn up.
      { key: "barrier", label: "Barrier To Attendance, And How It Is Addressed", type: "text", required: true },
    ],
  },
  "CA-001/3": {
    title: "Room and Technology Setup",
    standard: "ISO 27001 A.6.3 Awareness, education and training",
    registerName: "Setup Test Record",
    requiredRows: 5,
    feedsNext: "Feeds Steps 4–5 (delivery and knowledge check).",
    columns: [
      { key: "check", label: "Check Performed", type: "text", required: true, unique: true },
      { key: "position", label: "Tested From", type: "select", required: true, options: ["Back of the room", "Front of the room", "Remote participant", "Presenter station"] },
      { key: "result", label: "Result", type: "select", required: true, options: ["Pass", "Defect found and fixed", "Defect outstanding"] },
      { key: "defect", label: "Defect And Fix", type: "text", condReq: { key: "result", equals: "Defect found and fixed" } },
      { key: "contingency", label: "Contingency If It Fails On The Day (must preserve the exercises)", type: "text", required: true },
    ],
  },
  "CA-001/8": {
    title: "Training Completion Report",
    standard: "ISO 27001 A.6.3 · Cl. 9.1 Monitoring",
    registerName: "Training Completion Report",
    requiredRows: 5,
    feedsNext: "Feeds MM-001, DD-002, CA-002 and PE-002.",
    columns: [
      { key: "section", label: "Report Section", type: "select", required: true, options: ["Attendance", "Knowledge-check results", "Qualitative observation", "Behaviour-change evidence", "Recommendation"], unique: true },
      { key: "finding", label: "Finding", type: "text", required: true },
      { key: "figure", label: "Supporting Figure", type: "text", required: true },
      // The acceptance criterion is that the failure is stated as prominently as the pass; a
      // report that leads only with the pass rate is the one nobody acts on.
      { key: "tone", label: "Is This A Positive Or Negative Result?", type: "select", required: true, options: ["Positive", "Negative", "Mixed"] },
      { key: "followUp", label: "Follow-Up Action", type: "text", required: true },
    ],
  },
  "DD-002/7": {
    title: "Training Module Pilot Feedback",
    standard: "ISO 27001 A.6.3 Awareness, education and training",
    registerName: "Training Feedback Form",
    requiredRows: 2,
    source: "Two pilot colleagues",
    feedsNext: "Feeds Step 8 (final module) and CA-001, KT-001.",
    columns: [
      { key: "reviewer", label: "Pilot Reviewer (role)", type: "text", required: true, notDepartment: true, unique: true },
      { key: "score", label: "Overall Score %", type: "number", required: true },
      { key: "quote", label: "Direct Quote From The Feedback", type: "text", required: true },
      { key: "change", label: "Change Made In Response", type: "text", required: true },
      { key: "assumption", label: "Assumption Of Yours It Corrected", type: "text", required: true },
      { key: "declined", label: "Feedback Deliberately Not Acted On, And Why", type: "text", required: true },
    ],
  },

  // ── Access review and document QA ─────────────────────────────────────────────────────────
  "TV-001/4": {
    title: "Access Review Worksheet",
    standard: "ISO 27001 A.5.18 Access rights · A.8.2 Privileged access",
    registerName: "Access Review Worksheet",
    requiredRows: 8,
    source: "Account extract reconciled to the HR active list (TV-001-S3-OUT)",
    feedsNext: "Feeds Steps 5, 6 and 8, and IE-001, MM-002.",
    columns: [
      { key: "account", label: "Account", type: "text", required: true, unique: true },
      { key: "system", label: "System", type: "text", required: true },
      { key: "finding", label: "Finding Type", type: "select", required: true, options: ["Clean", "Dormant", "Orphaned", "Excessive privilege", "Missing account", "Shared account"] },
      { key: "action", label: "Recommended Action", type: "text", required: true },
      { key: "performer", label: "Action Performed By (role)", type: "text", required: true, notDepartment: true },
      { key: "confirmer", label: "Confirmed By (role)", type: "text", required: true, notDepartment: true },
      // "consequential actions beyond disabling where contracts require them" — an orphaned
      // account on a client system usually triggers a notification obligation as well.
      { key: "consequential", label: "Consequential Action (notification, contract, licence)", type: "text" },
    ],
  },
  "TV-001/8": {
    title: "Access Review Report Issue",
    standard: "ISO 27001 A.5.18 · Cl. 9.1 Monitoring",
    registerName: "Report Issue Record",
    requiredRows: 5,
    feedsNext: "Feeds IE-001, MM-001, MM-002, CRM-003, PE-002, CA-002.",
    columns: [
      { key: "element", label: "Report Element", type: "select", required: true, options: ["Clean rate", "Exception rate", "Systemic cause", "Action already taken", "Remediation deadline", "Periodicity requirement"], unique: true },
      { key: "content", label: "What The Report States", type: "text", required: true },
      { key: "acknowledged", label: "IT Manager Acknowledgement", type: "select", required: true, options: ["Accepted", "Accepted with variation", "Disputed"] },
      { key: "variation", label: "The Variation Or Dispute, Recorded Verbatim", type: "text", condReq: { key: "acknowledged", equals: "Accepted with variation" } },
      { key: "dispute", label: "The Variation Or Dispute, Recorded Verbatim", type: "text", condReq: { key: "acknowledged", equals: "Disputed" } },
    ],
  },
  "QA-001/3": {
    title: "Correction Requests",
    standard: "ISO 27001 Cl. 7.5.2 Creating and updating · Cl. 10.1",
    registerName: "Correction Request Log",
    requiredRows: 6,
    source: "Document review findings (QA-001-S2-OUT)",
    feedsNext: "Feeds Steps 4–6 (author response, re-review, closure).",
    columns: [
      { key: "crId", label: "CR ID", type: "text", required: true, idFormat: { pattern: "^CR-\\d{2}$", example: "CR-01" }, unique: true },
      { key: "document", label: "Document", type: "text", required: true },
      { key: "section", label: "Section", type: "text", required: true },
      { key: "deficiency", label: "Deficiency", type: "text", required: true },
      { key: "severity", label: "Severity", type: "select", required: true, options: ["Minor", "Major"] },
      // "severity rule declared and applied including to non-obvious cases" — without the rule
      // written down, severity drifts to whatever the reviewer felt that day.
      { key: "severityRule", label: "Why That Severity, Under Your Stated Rule", type: "text", required: true },
      { key: "correction", label: "Recommended Correction (specific, not 'review wording')", type: "text", required: true },
    ],
  },
};

export function getRecordTask(taskCode?: string, activityCode?: string): RecordTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return RECORD_TASKS[`${taskCode}/${activityCode}`];
}
