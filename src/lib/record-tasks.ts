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
    source: "Risk record fields",
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
    source: "GlobalConnect current state",
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
    source: "RoPA (Article 30) fields",
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
    source: "CloudTech — Implementation Snapshot",
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
    source: "Schedule fields",
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
    source: "Triggers & disposal",
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
    source: "Common Criteria CC1–CC9",
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
    source: "Register fields",
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
    source: "Action record fields",
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
    source: "Adding new risks",
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
    source: "Tracker",
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
    source: "Remediation issue",
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
    source: "Collection",
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
    source: "Labelling convention",
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
    source: "Pilot feedback",
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
    source: "Worksheet fields",
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
    source: "Correction request",
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

  // ── Metrics, reporting and document control ───────────────────────────────────────────────
  "MM-001/2": {
    title: "KPI Definition Cards",
    standard: "ISO 27001 Cl. 9.1 Monitoring, measurement, analysis and evaluation",
    registerName: "KPI Definition Card set",
    requiredRows: 5,
    feedsNext: "Feeds Step 4 (first collection) and Step 5 (Month 1 report).",
    columns: [
      { key: "kpi", label: "KPI Name", type: "text", required: true, unique: true },
      { key: "formula", label: "Formula", type: "text", required: true },
      { key: "dataSource", label: "Data Source", type: "text", required: true },
      { key: "frequency", label: "Measurement Frequency", type: "select", required: true, options: ["Weekly", "Monthly", "Quarterly"] },
      { key: "owner", label: "KPI Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "target", label: "Target Threshold", type: "text", required: true },
      { key: "rag", label: "RAG Thresholds", type: "text", required: true },
      { key: "targetBasis", label: "Why That Target (say so where it is not self-evident)", type: "text", required: true },
      // Every metric can be gamed; naming how, on the card, is what stops the number quietly
      // becoming the objective. Cl. 9.1 asks for valid results, not just results.
      { key: "gaming", label: "How This KPI Could Be Gamed", type: "text", required: true },
    ],
  },
  "MM-001/4": {
    title: "Month 1 Data Collection",
    standard: "ISO 27001 Cl. 9.1 Monitoring",
    registerName: "Collection Log",
    requiredRows: 5,
    source: "Data collection",
    feedsNext: "Feeds Step 5 (Month 1 GRC Metrics Report).",
    columns: [
      { key: "kpi", label: "KPI", type: "text", required: true, unique: true },
      { key: "value", label: "Value Obtained", type: "text", required: true },
      { key: "quality", label: "Data Quality", type: "select", required: true, options: ["Complete", "Partial", "Not measurable this cycle"] },
      { key: "issue", label: "Quality Issue Or Unmeasurable Portion", type: "text", condReq: { key: "quality", equals: "Partial" } },
      { key: "notMeasurable", label: "Quality Issue Or Unmeasurable Portion", type: "text", condReq: { key: "quality", equals: "Not measurable this cycle" } },
      { key: "ambiguity", label: "Definitional Ambiguity Found, And How Resolved", type: "text", required: true },
      { key: "effortHours", label: "Collection Effort (hours)", type: "number", required: true },
      { key: "sustainable", label: "Sustainable At This Cadence?", type: "select", required: true, options: ["Yes", "No — needs automation", "No — reduce frequency"] },
    ],
  },
  "MM-001/5": {
    title: "Month 1 GRC Metrics Report",
    standard: "ISO 27001 Cl. 9.1 · Cl. 9.3 Management review",
    registerName: "Month 1 Metrics Report",
    requiredRows: 5,
    feedsNext: "Feeds the management review pack and the next MM-001 cycle.",
    columns: [
      { key: "kpi", label: "KPI", type: "text", required: true, unique: true },
      { key: "value", label: "Reported Value", type: "text", required: true },
      { key: "rag", label: "RAG", type: "select", required: true, options: ["Green", "Amber", "Red", "No baseline yet"] },
      { key: "direction", label: "Direction Of Travel", type: "select", required: true, options: ["Improving", "Deteriorating", "Flat", "First month — no trend"] },
      // "partial data flagged rather than estimated" — the single discipline that keeps a
      // metrics report honest in its first cycle.
      { key: "coverage", label: "Coverage Limitation Shown On The Report Face", type: "text", required: true },
    ],
  },
  "CA-002/4": {
    title: "Management Compliance Status Report",
    standard: "ISO 27001 Cl. 9.3 Management review",
    registerName: "Compliance Status Report",
    requiredRows: 5,
    feedsNext: "Feeds Step 5 (presentation) and the management review record.",
    columns: [
      { key: "element", label: "Report Element", type: "select", required: true, options: ["Overall compliance RAG", "Top risk", "Top achievement", "Decision required", "30-day outlook"] },
      { key: "content", label: "Content", type: "text", required: true },
      // "every risk and achievement quantified" and "the outlook is falsifiable" — both are
      // what stop a status report becoming a mood report.
      { key: "quantified", label: "The Number Behind It", type: "text", required: true },
      { key: "askOf", label: "What Is Needed, From Whom (role)", type: "text", condReq: { key: "element", equals: "Decision required" } },
      { key: "testable", label: "How You Will Know In 30 Days Whether This Was Right", type: "text", condReq: { key: "element", equals: "30-day outlook" } },
    ],
  },
  "IE-002/4": {
    title: "Document Control Folder Structure",
    standard: "ISO 27001 Cl. 7.5.3 Control of documented information",
    registerName: "Folder Structure Design",
    requiredRows: 5,
    feedsNext: "Feeds Step 5 (migration) and Step 6 (naming convention roll-out).",
    columns: [
      { key: "area", label: "Folder / Area", type: "text", required: true, unique: true },
      { key: "state", label: "Holds", type: "select", required: true, options: ["Approved (published)", "Working (drafts)", "Evidence", "Archive"] },
      { key: "access", label: "Who Can Write", type: "text", required: true, notDepartment: true },
      { key: "readAccess", label: "Who Can Read", type: "text", required: true },
      { key: "regime", label: "Assurance Regime It Serves", type: "text", required: true },
      { key: "correction", label: "Access Correction Applied During Setup", type: "text" },
      { key: "rejected", label: "Design Considered And Rejected, With Reason", type: "text" },
    ],
  },
  "IE-002/5": {
    title: "Document Migration",
    standard: "ISO 27001 Cl. 7.5.3 Control of documented information",
    registerName: "Migration Log",
    requiredRows: 6,
    source: "Migration rules",
    feedsNext: "Feeds Step 6 (naming roll-out) and Step 8 (control handover).",
    columns: [
      { key: "oldName", label: "Original Name / Location (preserve it)", type: "text", required: true, unique: true },
      { key: "newName", label: "New Name Under The Convention", type: "text", required: true },
      { key: "action", label: "Migration Action", type: "select", required: true, options: ["Migrated", "Superseded — archived", "Duplicate — merged", "Contradiction raised", "Could not be located"] },
      { key: "note", label: "Contradiction Raised (do not tidy it away)", type: "text", condReq: { key: "action", equals: "Contradiction raised" } },
      { key: "missing", label: "Where It Was Last Seen", type: "text", condReq: { key: "action", equals: "Could not be located" } },
      // An access breach found mid-migration is a finding in its own right, not housekeeping.
      { key: "accessBreach", label: "Access Breach Found, And Escalated To (role)", type: "text" },
    ],
  },
  "QA-001/5": {
    title: "Major Deficiency Discussions",
    standard: "ISO 27001 Cl. 7.5.2 · Cl. 10.1 Corrective action",
    registerName: "Owner Discussion Log",
    requiredRows: 4,
    source: "Owner discussion",
    feedsNext: "Feeds Step 6 (correction tracking) and Step 7 (re-review).",
    columns: [
      { key: "crId", label: "CR ID", type: "text", required: true, unique: true },
      { key: "owner", label: "Document Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "date", label: "Discussion Date", type: "date", required: true },
      { key: "ownerInput", label: "Information The Owner Had That The Review Lacked", type: "text", required: true },
      { key: "outcome", label: "Outcome", type: "select", required: true, options: ["Accepted as raised", "Reclassified after challenge", "Owner's mechanism adopted instead", "Withdrawn"] },
      { key: "reclassified", label: "Why The Challenge Was Correct", type: "text", condReq: { key: "outcome", equals: "Reclassified after challenge" } },
      { key: "adopted", label: "The Better Mechanism The Owner Proposed", type: "text", condReq: { key: "outcome", equals: "Owner's mechanism adopted instead" } },
    ],
  },
  "QA-001/6": {
    title: "Correction Tracking Log",
    standard: "ISO 27001 Cl. 10.1 Nonconformity and corrective action",
    registerName: "Correction Tracking Log",
    requiredRows: 6,
    feedsNext: "Feeds Step 7 (re-review) and Step 8 (closure report).",
    columns: [
      { key: "crId", label: "CR ID", type: "text", required: true, unique: true },
      { key: "owner", label: "Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "raised", label: "Date Raised", type: "date", required: true },
      { key: "due", label: "Date Due", type: "date", required: true },
      { key: "status", label: "Status", type: "select", required: true, options: ["Open", "Corrected — evidence supplied", "Bundled with another CR", "Escalated", "Out of scope"] },
      { key: "evidence", label: "Evidence Of Correction", type: "text", condReq: { key: "status", equals: "Corrected — evidence supplied" } },
      { key: "bundleReason", label: "Bundled With Which CR, And Why", type: "text", condReq: { key: "status", equals: "Bundled with another CR" } },
      // "escalation rule defined in advance" — deciding the rule after a CR goes late is how
      // escalation stops being credible.
      { key: "escalationRule", label: "Escalation Rule (state it before it is needed)", type: "text", required: true },
    ],
  },

  // ── Continuity, vendor and interview registers ────────────────────────────────────────────
  "BCRP-001/6": {
    title: "BIA Summary Table",
    standard: "ISO 27001 A.5.30 ICT readiness for business continuity",
    registerName: "BIA Summary Table",
    requiredRows: 5,
    source: "BIA summary table",
    feedsNext: "Feeds Step 7 (BIA Report) and BCRP-002, SPA-001.",
    columns: [
      { key: "function", label: "Critical Function", type: "text", required: true, unique: true },
      { key: "impactScore", label: "Impact Score", type: "number", required: true },
      { key: "rank", label: "Rank", type: "number", required: true, unique: true },
      // Magnitude and time-to-impact are different questions, and a table with one column
      // conflates a function that hurts instantly with one that hurts eventually.
      { key: "timeToImpact", label: "Time Until Impact Is Felt", type: "text", required: true },
      { key: "rto", label: "RTO", type: "text", required: true },
      { key: "rpo", label: "RPO", type: "text", required: true },
      { key: "dependency", label: "Dependency It Shares With Other Functions", type: "text", required: true },
      { key: "recoveryControl", label: "Who Controls Recovery (name the third party where it is not us)", type: "text", required: true },
    ],
  },
  "BCRP-002/5": {
    title: "Checklist Success Criteria From The BIA",
    standard: "ISO 27001 A.5.30 ICT readiness for business continuity",
    registerName: "DR Checklist — success criteria",
    requiredRows: 5,
    source: "RTO/RPO as criteria",
    feedsNext: "Feeds Step 6 (walkthrough) and Step 8 (filing and test scheduling).",
    columns: [
      { key: "step", label: "Checklist Step", type: "text", required: true, unique: true },
      // "criteria embedded not referenced" — a step that says "meet the RTO" sends the reader
      // to another document mid-incident, which is when nobody goes and looks.
      { key: "criterion", label: "Success Criterion, Stated In Full Here", type: "text", required: true },
      { key: "blocking", label: "Blocking Step?", type: "select", required: true, options: ["Yes — cannot proceed until met", "No — proceed and flag"] },
      { key: "failureMode", label: "Failure Mode This Step Defends Against", type: "text", required: true },
      { key: "gap", label: "Gap Against The BIA Target, And Its Mitigation Or Escalation", type: "text" },
    ],
  },
  "BCRP-002/8": {
    title: "DR Checklist Filing and Test Recommendation",
    standard: "ISO 27001 A.5.30 · A.5.29 Security during disruption",
    registerName: "DR Documentation Library",
    requiredRows: 4,
    feedsNext: "Feeds the IT Manager's test schedule, TPRM-001 and LRC-001.",
    columns: [
      { key: "item", label: "Item Filed Or Recommended", type: "text", required: true, unique: true },
      { key: "kind", label: "Type", type: "select", required: true, options: ["Checklist filed", "Test recommendation", "Finding routed", "Residual risk accepted"] },
      // The distinction the acceptance criteria insist on: a talk-through proves the document,
      // a live restoration proves the capability. Conflating them overstates assurance.
      { key: "assurance", label: "What It Proves (talk-through = document, live test = capability)", type: "text", required: true },
      { key: "cost", label: "Cost / Disruption", type: "text", condReq: { key: "kind", equals: "Test recommendation" } },
      { key: "routedTo", label: "Routed To (role)", type: "text", condReq: { key: "kind", equals: "Finding routed" }, notDepartment: true },
      { key: "acceptedBy", label: "Risk Accepted By (role)", type: "text", condReq: { key: "kind", equals: "Residual risk accepted" }, notDepartment: true },
    ],
  },
  "TPRM-001/2": {
    title: "Supplier Inventory",
    standard: "ISO 27001 A.5.19 Supplier relationships · A.5.21 ICT supply chain",
    registerName: "Supplier Register",
    requiredRows: 8,
    feedsNext: "Feeds Steps 3–6 (risk rating, DPA check) and Step 7 (register and summary).",
    columns: [
      { key: "vendor", label: "Vendor Name", type: "text", required: true, unique: true },
      { key: "service", label: "Service / Product Provided", type: "text", required: true },
      // The taxonomy has to be defined before it is applied, or "process" and "store" get used
      // interchangeably and the risk rating built on top of them means nothing.
      { key: "dataAccess", label: "Type Of Data Access", type: "select", required: true, options: ["None", "View", "Process", "Store"] },
      { key: "systems", label: "Systems Connected To", type: "text", required: true },
      { key: "contract", label: "Contract Status", type: "select", required: true, options: ["Signed and current", "Expired", "Auto-renewing", "None on file"] },
      { key: "contact", label: "Primary Contact", type: "text", required: true },
      { key: "internalOwner", label: "Internal Owner (role) — flag if none", type: "text", required: true, notDepartment: true },
    ],
  },
  "TPRM-001/7": {
    title: "Supplier Register and High-Risk Summary",
    standard: "ISO 27001 A.5.19 · A.5.20 Supplier agreements",
    registerName: "Supplier Register v1.0",
    requiredRows: 5,
    feedsNext: "Feeds Step 8 (sign-off) and TPRM-002, CRM-003, SPA-001.",
    columns: [
      { key: "vendor", label: "Vendor", type: "text", required: true, unique: true },
      { key: "rating", label: "Risk Rating", type: "select", required: true, options: ["High", "Medium", "Low"] },
      { key: "driver", label: "What Drives That Rating", type: "text", required: true },
      { key: "dpa", label: "DPA Status", type: "select", required: true, options: ["Signed", "Expired", "None", "Not required"] },
      { key: "dpaRationale", label: "Why No DPA Is Required", type: "text", condReq: { key: "dpa", equals: "Not required" } },
      { key: "action", label: "Next Action And Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "TPRM-002/2": {
    title: "Questionnaire Customisation",
    standard: "ISO 27001 A.5.19 Supplier relationships",
    registerName: "Vendor Security Questionnaire",
    requiredRows: 6,
    source: "Questionnaire areas",
    feedsNext: "Feeds Step 3 (issue to vendor) and Step 5 (response review).",
    columns: [
      { key: "questionId", label: "Question ID", type: "text", required: true, idFormat: { pattern: "^Q-\\d{2}$", example: "Q-01" }, unique: true },
      { key: "question", label: "Question", type: "text", required: true },
      { key: "domain", label: "Domain", type: "select", required: true, options: ["Governance", "Access control", "Data protection", "Incident response", "Business continuity", "Sub-processors"] },
      { key: "change", label: "Customisation", type: "select", required: true, options: ["Kept as standard", "Reworded for this service type", "Added for this vendor", "Removed as not applicable"] },
      { key: "reason", label: "Why This Change For This Service Type", type: "text", condReq: { key: "change", equals: "Added for this vendor" } },
      { key: "removalReason", label: "Why This Change For This Service Type", type: "text", condReq: { key: "change", equals: "Removed as not applicable" } },
    ],
  },
  "TPRM-002/3": {
    title: "Questionnaire Issue",
    standard: "ISO 27001 A.5.20 Supplier agreements",
    registerName: "Questionnaire Issue Record",
    requiredRows: 1,
    feedsNext: "Feeds Step 4 (chase) and Step 5 (response review).",
    columns: [
      { key: "vendor", label: "Vendor", type: "text", required: true },
      { key: "contact", label: "Security / Compliance Contact", type: "text", required: true },
      { key: "sent", label: "Date Sent", type: "date", required: true },
      { key: "due", label: "Response Deadline (two weeks)", type: "date", required: true },
      { key: "authority", label: "Contractual Basis For Asking", type: "text", required: true },
      { key: "escalation", label: "Escalation If No Response", type: "text", required: true },
    ],
  },
  "TPRM-002/8": {
    title: "Due-Diligence Assessment Report",
    standard: "ISO 27001 A.5.19 · A.5.22 Monitoring supplier services",
    registerName: "Due-Diligence Assessment Report",
    requiredRows: 5,
    feedsNext: "Feeds the vendor risk register, contract renewal and TPRM-001.",
    columns: [
      { key: "finding", label: "Finding", type: "text", required: true, unique: true },
      { key: "evidence", label: "Evidence Or Absence Of It", type: "text", required: true },
      { key: "severity", label: "Severity", type: "select", required: true, options: ["High", "Medium", "Low", "Observation"] },
      { key: "ratingEffect", label: "Effect On The Risk Rating", type: "select", required: true, options: ["Confirms the rating", "Raises it", "Lowers it"] },
      { key: "mitigation", label: "Recommended Mitigation", type: "select", required: true, options: ["Contractual clause", "Operational control our side", "Increased monitoring", "Accept with review date", "Do not proceed"] },
      { key: "detail", label: "Mitigation Detail And Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "CA-003/8": {
    title: "Interview Insights Fed Downstream",
    standard: "ISO 27001 Cl. 4.2 Interested parties",
    registerName: "Insight Routing Log",
    requiredRows: 5,
    source: "Feeding insights forward",
    feedsNext: "Feeds SPA-002 (Stakeholder Register) and SPA-001 (Roadmap).",
    columns: [
      { key: "insight", label: "Insight From The Interview", type: "text", required: true, unique: true },
      // "converted into register and roadmap changes rather than remaining a report" — the whole
      // point of the step, and the thing most commonly skipped.
      { key: "destination", label: "Where It Lands", type: "select", required: true, options: ["Stakeholder Register — new entry", "Stakeholder Register — amended entry", "Roadmap — new action", "Roadmap — re-sequenced action", "Escalation commitment"] },
      { key: "change", label: "The Concrete Change Made", type: "text", required: true },
      { key: "owner", label: "Owner Of The Change (role)", type: "text", required: true, notDepartment: true },
      { key: "commitment", label: "Commitment Made In The Interview, And How It Was Kept", type: "text", condReq: { key: "destination", equals: "Escalation commitment" } },
    ],
  },
  "LRC-001/4": {
    title: "Privacy Notice Benchmark",
    standard: "GDPR Arts. 12–14 Transparency",
    registerName: "Benchmark Assessment",
    requiredRows: 5,
    source: "Model notice features",
    feedsNext: "Feeds Step 5 (gap assessment) and Step 6 (redraft).",
    columns: [
      { key: "feature", label: "Feature Of The Benchmark Notice", type: "text", required: true, unique: true },
      { key: "verdict", label: "Assessment", type: "select", required: true, options: ["Strength — adopt", "Strength — do not adopt", "Weakness — avoid"] },
      // "adoption structural rather than copied text" — copying another controller's wording is
      // how a notice ends up describing processing the organisation does not do.
      { key: "adoption", label: "What You Adopt (the structure, not the wording)", type: "text", condReq: { key: "verdict", equals: "Strength — adopt" } },
      { key: "declined", label: "Why Not Adopted Here", type: "text", condReq: { key: "verdict", equals: "Strength — do not adopt" } },
      { key: "weakness", label: "The Weakness, And What You Do Instead", type: "text", condReq: { key: "verdict", equals: "Weakness — avoid" } },
    ],
  },

  // ── Simulation observation and rotation close-out ─────────────────────────────────────────
  "RR-001/2": {
    title: "Tabletop Attendance and Observer Position",
    standard: "ISO 27001 A.5.24 Incident management planning",
    registerName: "Observation Setup Record",
    requiredRows: 4,
    feedsNext: "Feeds Step 3 (structured notes) and Step 4 (debrief point).",
    columns: [
      { key: "item", label: "Setup Decision", type: "select", required: true, options: ["Attendance", "Capture position", "Role boundary", "Observation limitation"], unique: true },
      { key: "decision", label: "What You Decided", type: "text", required: true },
      { key: "reason", label: "Why", type: "text", required: true },
      // The observer role fails the moment the observer starts helping — and it is always
      // under pressure, when the room is stuck, that the boundary gets crossed.
      { key: "pressure", label: "Where The Boundary Was Tested, And How You Held It", type: "text", condReq: { key: "item", equals: "Role boundary" } },
    ],
  },
  "RR-001/3": {
    title: "Tabletop Observation Sheet",
    standard: "ISO 27001 A.5.24 · A.5.27 Learning from incidents",
    registerName: "Tabletop Observation Sheet",
    requiredRows: 8,
    feedsNext: "Feeds Step 4 (debrief point) and Steps 6–8 (report and amendments).",
    columns: [
      { key: "time", label: "Timestamp", type: "text", required: true },
      { key: "observation", label: "Decision, Escalation Or Gap Observed", type: "text", required: true },
      { key: "category", label: "Category", type: "select", required: true, options: ["Decision made", "Escalation path used", "Communication gap", "Tool / resource gap", "Deviation from procedure"] },
      { key: "expected", label: "What The Procedure Expected At This Point", type: "text", required: true },
      { key: "clause", label: "Procedure Clause Deviated From", type: "text", condReq: { key: "category", equals: "Deviation from procedure" } },
      { key: "predicted", label: "Did You Predict This Failure? Assess Honestly", type: "select", required: true, options: ["Predicted", "Not predicted", "Predicted the opposite"] },
    ],
  },
  "RR-001/4": {
    title: "Debrief Observation Point",
    standard: "ISO 27001 A.5.27 Learning from information security incidents",
    registerName: "Debrief Contribution Record",
    requiredRows: 3,
    source: "Debrief contribution",
    feedsNext: "Feeds Steps 6–8 (report and procedure amendments).",
    columns: [
      { key: "candidate", label: "Candidate Point From Your Notes", type: "text", required: true, unique: true },
      { key: "raised", label: "Raised In The Debrief?", type: "select", required: true, options: ["Raised — this was the one", "Held back"] },
      // The selection rule the acceptance criteria set: an inability to act beats a slow action,
      // because delay is a tuning problem and inability is a capability gap.
      { key: "selection", label: "Why This One Over The Others (inability outranks delay)", type: "text", required: true },
      { key: "response", label: "The Room's Response", type: "text", condReq: { key: "raised", equals: "Raised — this was the one" } },
      { key: "missed", label: "What Others Added That You Had Missed", type: "text", condReq: { key: "raised", equals: "Raised — this was the one" } },
    ],
  },
  "RR-001/8": {
    title: "Simulation Report Filing and Amendments",
    standard: "ISO 27001 A.5.27 · Cl. 10.1 Corrective action",
    registerName: "Amendment Routing Log",
    requiredRows: 5,
    feedsNext: "Feeds DD-001 (procedure), GRM-001 (risk), PE-002 (evidence) and the re-test schedule.",
    columns: [
      { key: "amendment", label: "Proposed Amendment Or Filing", type: "text", required: true, unique: true },
      { key: "kind", label: "Type", type: "select", required: true, options: ["Procedure amendment", "New requirement", "New risk", "Filed evidence", "Re-test scheduled"] },
      { key: "routedTo", label: "Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "outcome", label: "Outcome", type: "select", required: true, options: ["Accepted", "Accepted with change", "Rejected", "Pending"] },
      { key: "regime", label: "Framework / Assurance Regime It Is Filed Against", type: "text", required: true },
      { key: "retestDate", label: "Re-Test Date", type: "date", condReq: { key: "kind", equals: "Re-test scheduled" } },
    ],
  },
  "KT-001/6": {
    title: "Onboarding Pack Pilot",
    standard: "ISO 27001 A.6.3 Awareness, education and training",
    registerName: "Pilot Review Record",
    requiredRows: 5,
    source: "Pilot feedback",
    feedsNext: "Feeds Step 7 (revision) and Step 8 (handover to HR).",
    columns: [
      { key: "item", label: "Pack Item Tested", type: "text", required: true, unique: true },
      // Asking "was this useful?" gets a polite yes. Testing recall is the only way to find out
      // whether the pack actually taught anything.
      { key: "method", label: "How It Was Tested", type: "select", required: true, options: ["Recall tested", "Opinion sought", "Task performed unaided"] },
      { key: "result", label: "Result", type: "text", required: true },
      { key: "ruleReason", label: "A Rule In The Pack — And The Reason You Added For It", type: "text", required: true },
      { key: "controlFailure", label: "Live Control Failure Surfaced, And Escalated To (role)", type: "text" },
    ],
  },
  "KT-001/8": {
    title: "Pack Handover to HR",
    standard: "ISO 27001 A.6.3 · Cl. 7.5.3 Documented information",
    registerName: "Handover Record",
    requiredRows: 5,
    feedsNext: "Closes KT-001; the pack enters the standard onboarding process.",
    columns: [
      { key: "item", label: "Handover Element", type: "select", required: true, options: ["Formal acceptance", "HR improvement adopted", "Maintenance load resolved", "Population outside the standard process", "Measurement agreed"], unique: true },
      { key: "detail", label: "Detail", type: "text", required: true },
      { key: "owner", label: "Owner After Handover (role)", type: "text", required: true, notDepartment: true },
      { key: "population", label: "Who This Population Is, And How They Are Covered Instead", type: "text", condReq: { key: "item", equals: "Population outside the standard process" } },
      { key: "measure", label: "The Agreed Measure Of Whether It Works", type: "text", condReq: { key: "item", equals: "Measurement agreed" } },
    ],
  },
  "KT-002/2": {
    title: "Lessons Learned Worksheet",
    standard: "ISO 27001 A.5.27 Learning from incidents · Cl. 10.2 Continual improvement",
    registerName: "Lessons Learned Worksheet",
    requiredRows: 5,
    feedsNext: "Feeds Steps 3–7 (retrospective) and Step 8 (improvement backlog).",
    columns: [
      { key: "question", label: "Worksheet Question", type: "select", required: true, options: ["What did I learn?", "What went well?", "What was difficult?", "What would I do differently?", "What knowledge gaps remain?"], unique: true },
      { key: "answer", label: "Answer — name the organisation and the task", type: "text", required: true },
      { key: "example", label: "The Specific Instance It Came From", type: "text", required: true },
      // "what generalises distinguished from what does not" — the difference between a lesson
      // and an anecdote, and the reason a retrospective is worth writing at all.
      { key: "generalises", label: "Does This Generalise Beyond That Organisation?", type: "select", required: true, options: ["Generalises", "Specific to that context"] },
    ],
  },
  "KT-002/8": {
    title: "Improvement Backlog Contribution",
    standard: "ISO 27001 Cl. 10.2 Continual improvement",
    registerName: "Programme Improvement Backlog",
    requiredRows: 6,
    source: "Closing the loop",
    feedsNext: "Closes the rotation; items enter the programme improvement backlog.",
    columns: [
      { key: "itemId", label: "Backlog ID", type: "text", required: true, idFormat: { pattern: "^IMP-\\d{2}$", example: "IMP-01" }, unique: true },
      { key: "recommendation", label: "Recommendation", type: "text", required: true },
      { key: "evidence", label: "Evidence It Rests On", type: "text", required: true },
      { key: "change", label: "The Concrete Change Proposed", type: "text", required: true },
      { key: "estimate", label: "Effort Estimate", type: "text", required: true },
      { key: "origin", label: "Where It Came From", type: "select", required: true, options: ["My own retrospective", "Peer input", "Challenge received", "Mentor feedback"] },
    ],
  },
  "QA-002/3": {
    title: "Audit-Firm Testing Practice Research",
    standard: "ISO 27001 Cl 9.2 Internal audit; A.5.35 Independent review",
    registerName: "Testing Practice Research Log",
    requiredRows: 3,
    source: "Professional testing norms",
    feedsNext: "Feeds Step 4 (methodology sheets) and Step 5 (methodology overview).",
    columns: [
      { key: "control", label: "Control", type: "text", required: true, unique: true },
      { key: "practice", label: "How Professional Firms Test It", type: "text", required: true },
      { key: "approach", label: "Approach They Rely On", type: "select", required: true, options: ["Inquiry", "Observation", "Inspection", "Re-performance"] },
      { key: "sourceRef", label: "Reference Extract It Came From", type: "text", required: true },
      // Copying a Big Four sample size into a ten-person organisation is the standard error;
      // the adaptation, and its reason, is the actual work of this step.
      { key: "adaptation", label: "What Must Change For An Organisation Of This Size, And Why", type: "text", required: true },
    ],
  },
  "QA-002/4": {
    title: "Control Testing Methodology Sheets",
    standard: "ISO 27001 Cl 9.2 Internal audit",
    registerName: "Control Testing Methodology Sheet",
    requiredRows: 3,
    source: "Methodology sheet",
    feedsNext: "Feeds Step 5 (methodology overview) and Step 6 (mentor review).",
    columns: [
      { key: "control", label: "Control", type: "text", required: true, unique: true },
      { key: "objective", label: "Control Objective", type: "text", required: true },
      { key: "approach", label: "Test Approach", type: "select", required: true, options: ["Inquiry", "Observation", "Inspection", "Re-performance"] },
      { key: "steps", label: "Test Steps (executable by someone who did not write them)", type: "text", required: true },
      { key: "sample", label: "Sample Size And How Selected", type: "text", required: true },
      { key: "evidence", label: "Evidence Required", type: "text", required: true },
      // Two testers reaching different verdicts on the same evidence means the criteria are
      // subjective, which is the failure this column is written to prevent.
      { key: "passFail", label: "Pass / Fail Criteria (two testers must reach the same verdict)", type: "text", required: true },
      { key: "tester", label: "Who May Perform It (role, independent of the control owner)", type: "text", required: true, notDepartment: true },
    ],
  },
};

export function getRecordTask(taskCode?: string, activityCode?: string): RecordTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return RECORD_TASKS[`${taskCode}/${activityCode}`];
}
