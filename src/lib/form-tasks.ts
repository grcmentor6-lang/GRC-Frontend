// Form-style worked tasks: Recommend / Validate / Draft / Schedule. Source: the respective verb
// registers. Each is a per-item completeness form (gate = required fields filled; Layer-2 quality is
// graded separately). `kind` selects the field schema in the workspace (FormFlow).

export type FormKind = "recommend" | "validate" | "draft" | "schedule" | "compile" | "document" | "signoff" | "score" | "assess";
export interface FormItem { id: number; label: string; options?: Record<string, string[]>; weight?: number; }
export interface FormTask {
  kind: FormKind; title: string; standard: string; itemLabel: string;
  owners?: string[];
  /** Assess only: the maturity/RAG scale (label → numeric value, for outlier detection). */
  scale?: { label: string; value: number }[];
  items: FormItem[]; feedsNext: string;
}

export const FORM_TASKS: Record<string, FormTask> = {
  "AA-002/2.6": {
    kind: "recommend", title: "CIS Gap Remediation", standard: "CIS Controls v8 IG1", itemLabel: "gap",
    owners: ["Compliance Manager", "IT Manager", "Operations Manager"],
    feedsNext: "Feeds the Compile / Present step.",
    items: [
      { id: 1, label: "Default admin passwords" },
      { id: 2, label: "No MFA for admin/remote" },
      { id: 3, label: "No asset inventory" },
      { id: 4, label: "No patching policy" },
      { id: 5, label: "No data-protection process" },
      { id: 6, label: "No secure-config baseline" },
    ],
  },
  "GRM-001/4.6": {
    kind: "recommend", title: "Risk Treatment Options", standard: "ISO 27001 Cl 6.1.3", itemLabel: "gap",
    owners: ["Cyber Risk Manager", "IT Manager", "Vendor Risk Analyst"],
    feedsNext: "Feeds the Compile / Present step.",
    items: [
      { id: 1, label: "Phishing → account compromise (25, Critical)" },
      { id: 2, label: "Mis-sent client email (16, High)" },
      { id: 3, label: "Ransomware (15, High)" },
      { id: 4, label: "Unpatched VPN (12, Medium)" },
      { id: 5, label: "Vendor breach (8, Medium)" },
    ],
  },
  "IE-001/5": {
    kind: "validate", title: "Implementations vs Acceptance Criteria", standard: "CIS Controls v8 IG1 (acceptance criteria)", itemLabel: "finding",
    feedsNext: "Feeds the Recommend / Draft step.",
    items: [
      { id: 1, label: "Asset inventory deployed (CIS 1.1)" },
      { id: 2, label: "Data ACLs configured (CIS 3.3)" },
      { id: 3, label: "MFA on admin accounts (CIS 6.5)" },
      { id: 4, label: "Default accounts disabled (CIS 4.7)" },
      { id: 5, label: "Patch SLA operating (CIS 7.3)" },
      { id: 6, label: "Software inventory maintained (CIS 2.1)" },
    ],
  },
  "QA-001/7": {
    kind: "validate", title: "Correction-Request Closure", standard: "ISO 27001 Cl 7.5.2/7.5.3; A.5.36", itemLabel: "finding",
    feedsNext: "Feeds the Recommend / Draft step.",
    items: [
      { id: 1, label: "CR-01 Document control block added" },
      { id: 2, label: "CR-02 Review date updated" },
      { id: 3, label: "CR-03 MFA contradiction resolved (§3/§5)" },
      { id: 4, label: "CR-04 ISO citation corrected" },
      { id: 5, label: "CR-05 Acronyms defined" },
      { id: 6, label: "CR-06 Approval signatures obtained" },
    ],
  },
  "AA-002/2.7": {
    kind: "validate", title: "Gap Findings before Issue", standard: "CIS Controls v8 IG1", itemLabel: "finding",
    feedsNext: "Feeds the Recommend / Draft step.",
    items: [
      { id: 1, label: "No asset inventory (gap)" },
      { id: 2, label: "Default admin passwords (gap)" },
      { id: 3, label: "No MFA for admin (gap)" },
      { id: 4, label: "No patching policy (gap)" },
      { id: 5, label: "Weak data-protection process (gap)" },
      { id: 6, label: "No secure-config baseline (gap)" },
    ],
  },
  "GRM-002/5.3": {
    kind: "draft", title: "Acceptable Use Policy", standard: "ISO 27001 Cl 5.2; A.5.1; A.6.7; A.8.1", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Document Control" },
      { id: 2, label: "Purpose" },
      { id: 3, label: "Scope" },
      { id: 4, label: "Definitions" },
      { id: 5, label: "Policy Statements" },
      { id: 6, label: "Roles & Responsibilities" },
      { id: 7, label: "Exceptions" },
      { id: 8, label: "Related Documents" },
      { id: 9, label: "Review History" },
    ],
  },
  "DD-001/3": {
    kind: "draft", title: "Incident Reporting Procedure", standard: "ISO 27001 A.6.8; A.5.26; A.5.28", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Purpose" },
      { id: 2, label: "Scope" },
      { id: 3, label: "Definitions" },
      { id: 4, label: "How to Recognise an Incident" },
      { id: 5, label: "How to Report" },
      { id: 6, label: "Escalation Path" },
      { id: 7, label: "Confidentiality Obligations" },
      { id: 8, label: "Responsibilities" },
      { id: 9, label: "Document Control" },
    ],
  },
  "DD-003/6": {
    kind: "draft", title: "Data Disposal Instruction", standard: "GDPR Art 5(1)(e); Art 17", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Purpose" },
      { id: 2, label: "Scope" },
      { id: 3, label: "Disposal Methods" },
      { id: 4, label: "Verification & Evidence" },
      { id: 5, label: "Responsibilities" },
      { id: 6, label: "Records" },
      { id: 7, label: "Document Control" },
    ],
  },
  "LRC-001/5": {
    kind: "draft", title: "Privacy Notice", standard: "GDPR Art 13; Art 14", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Who We Are" },
      { id: 2, label: "Data We Collect" },
      { id: 3, label: "Purposes & Lawful Basis" },
      { id: 4, label: "Recipients" },
      { id: 5, label: "International Transfers" },
      { id: 6, label: "Retention" },
      { id: 7, label: "Your Rights" },
      { id: 8, label: "Right to Complain" },
      { id: 9, label: "Automated Decisions" },
      { id: 10, label: "Source of Data" },
      { id: 11, label: "Contact / DPO" },
    ],
  },
  "PE-001/4": {
    kind: "draft", title: "Project Charter", standard: "ISO 27001 Cl 6.2; Cl 5.3", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Background" },
      { id: 2, label: "Objectives" },
      { id: 3, label: "Success Criteria" },
      { id: 4, label: "Scope" },
      { id: 5, label: "Out-of-Scope" },
      { id: 6, label: "Deliverables" },
      { id: 7, label: "Team & Governance" },
      { id: 8, label: "Risks/Assumptions" },
      { id: 9, label: "Sign-off" },
    ],
  },
  "BCRP-002/4": {
    kind: "draft", title: "ICT DR Checklist", standard: "ISO 27001 A.5.30; A.8.13; A.8.14", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Preparation" },
      { id: 2, label: "Incident Detection/Declaration" },
      { id: 3, label: "Backup Retrieval" },
      { id: 4, label: "Restoration Sequence" },
      { id: 5, label: "Validation Testing" },
      { id: 6, label: "Return to Normal & Sign-off" },
      { id: 7, label: "RTO/RPO Criteria" },
      { id: 8, label: "Document Control" },
    ],
  },
  "AA-002/2.2": {
    kind: "schedule", title: "Evidence Walkthroughs", standard: "CIS Controls v8 IG1", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "IT Manager", options: { time: ["Mon 10:00", "Tue 14:00", "Wed 11:00"] } },
      { id: 2, label: "Systems Administrator", options: { time: ["Tue 10:00", "Wed 15:00", "Thu 09:00"] } },
      { id: 3, label: "Network/Operations Lead", options: { time: ["Wed 10:00", "Thu 13:00", "Fri 11:00"] } },
      { id: 4, label: "Data Owner", options: { time: ["Thu 10:00", "Fri 14:00", "Mon 09:00"] } },
      { id: 5, label: "Service Desk Lead", options: { time: ["Fri 10:00", "Mon 11:00", "Tue 15:00"] } },
    ],
  },
  "MM-001/8": {
    kind: "schedule", title: "Recurring KPI Data Invites", standard: "ISO 27001 Cl 9.1", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "Policy data owner", options: { time: ["1st Mon 09:00", "1st Tue 09:00", "1st Wed 09:00"] } },
      { id: 2, label: "Training data owner", options: { time: ["1st Mon 10:00", "1st Tue 10:00", "1st Wed 10:00"] } },
      { id: 3, label: "Incident data owner", options: { time: ["1st Mon 11:00", "1st Tue 11:00", "1st Wed 11:00"] } },
      { id: 4, label: "Access data owner", options: { time: ["1st Tue 09:00", "1st Wed 09:00", "1st Thu 09:00"] } },
      { id: 5, label: "Vendor data owner", options: { time: ["1st Tue 10:00", "1st Wed 10:00", "1st Thu 10:00"] } },
    ],
  },
  "MM-002/1": {
    kind: "schedule", title: "Risk Register Review Meeting", standard: "ISO 27001 Cl 9.1; 6.1", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "Risk Owner 1 (Business-Unit Manager)", options: { time: ["Tue 14:00", "Wed 10:00", "Thu 15:00"] } },
      { id: 2, label: "Risk Owner 2 (Operations Lead)", options: { time: ["Tue 14:00", "Wed 10:00", "Thu 15:00"] } },
      { id: 3, label: "Cyber Risk Manager (mentor)", options: { time: ["Wed 10:00", "Wed 11:00"] } },
      { id: 4, label: "Pre-read circulation", options: { time: ["Mon 09:00", "Mon 13:00"] } },
    ],
  },
  "CA-001/1": {
    kind: "schedule", title: "All-Staff Awareness Session", standard: "ISO 27001 A.6.3", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "HR Manager", options: { time: ["Wed 11:00", "Thu 14:00", "Fri 10:00"] } },
      { id: 2, label: "Facilities/Operations", options: { time: ["Thu 13:30", "Thu 14:00"] } },
      { id: 3, label: "Department heads", options: { time: ["Thu 14:00"] } },
      { id: 4, label: "IT (AV test)", options: { time: ["Thu 13:30", "Thu 13:45"] } },
    ],
  },
  "AA-002/2.8": {
    kind: "compile", title: "CIS Gap Analysis Report", standard: "CIS Controls v8 IG1", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Scope & Objectives" },
      { id: 3, label: "Methodology" },
      { id: 4, label: "Compliance Findings" },
      { id: 5, label: "Top Gaps" },
      { id: 6, label: "Remediation Plan" },
      { id: 7, label: "Conclusion" },
    ],
  },
  "TV-002/8": {
    kind: "compile", title: "Spot-Check Report", standard: "ISO 27001 A.5.36; A.6.3", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Scope (3 policies)" },
      { id: 3, label: "Method" },
      { id: 4, label: "Compliance Rates" },
      { id: 5, label: "Findings" },
      { id: 6, label: "Recommendations" },
      { id: 7, label: "Conclusion" },
    ],
  },
  "CA-003/6": {
    kind: "compile", title: "Stakeholder Needs Discovery Report", standard: "ISO 27001 Cl 4.2", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Interviews Conducted" },
      { id: 3, label: "Method" },
      { id: 4, label: "Common Themes" },
      { id: 5, label: "Key Quotes" },
      { id: 6, label: "Implications" },
      { id: 7, label: "Recommendations" },
    ],
  },
  "PE-002/6": {
    kind: "compile", title: "Audit Evidence Pack", standard: "ISO 27001 Cl 7.5; A.5.35", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Cover / Index" },
      { id: 2, label: "Controls Covered" },
      { id: 3, label: "Evidence Items" },
      { id: 4, label: "Validation Notes" },
      { id: 5, label: "Gaps / Pending" },
      { id: 6, label: "Self-Review" },
      { id: 7, label: "Sign-off Block" },
    ],
  },
  "QA-001/4": {
    kind: "compile", title: "Quality Review Report", standard: "ISO 27001 Cl 7.5.2/7.5.3", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Documents Reviewed" },
      { id: 3, label: "Method" },
      { id: 4, label: "Correction Requests" },
      { id: 5, label: "Major Deficiencies" },
      { id: 6, label: "Minor Deficiencies" },
      { id: 7, label: "Closure Status" },
    ],
  },
  "KT-002/6": {
    kind: "compile", title: "Mentee Portfolio Index", standard: "ISO 27001 (programme close)", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Index Cover" },
      { id: 2, label: "Deliverables Produced" },
      { id: 3, label: "Verbs Practised" },
      { id: 4, label: "Badges Earned" },
      { id: 5, label: "Links / References" },
      { id: 6, label: "Lessons Learned" },
      { id: 7, label: "Sign-off" },
    ],
  },
  "AA-003/3.6": {
    kind: "document", title: "Data-Flow Findings", standard: "GDPR Art 30/35", itemLabel: "section",
    feedsNext: "The documented artefact feeds future Compile / Review steps.",
    items: [
      { id: 1, label: "Process" },
      { id: 2, label: "Data flow" },
      { id: 3, label: "Lawful basis" },
      { id: 4, label: "Gaps" },
      { id: 5, label: "Disposition" },
      { id: 6, label: "References" },
    ],
  },
  "CRM-002/8.3": {
    kind: "document", title: "Control Applicability Record", standard: "ISO 27001 Annex A", itemLabel: "section",
    feedsNext: "The documented artefact feeds future Compile / Review steps.",
    items: [
      { id: 1, label: "Control" },
      { id: 2, label: "Applicability rationale" },
      { id: 3, label: "Status" },
      { id: 4, label: "Evidence type" },
      { id: 5, label: "Owner" },
      { id: 6, label: "References" },
    ],
  },
  "AA-003/3.8": {
    kind: "signoff", title: "RoPA/DPIA (Process Owner)", standard: "GDPR Art 30/35", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "RoPA entry — student enrolment" },
      { id: 2, label: "DPIA screening disposition (required)" },
      { id: 3, label: "Lawful-basis documentation" },
    ],
  },
  "GRM-002/5.7": {
    kind: "signoff", title: "InfoSec Policy (Management)", standard: "ISO 27001 Cl 5.2; A.5.1", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Acceptable Use Policy v1.0" },
      { id: 2, label: "ISO control references" },
      { id: 3, label: "Exceptions process" },
    ],
  },
  "DD-003/8": {
    kind: "signoff", title: "Retention Schedule (Legal/Owner)", standard: "GDPR Art 5(1)(e); Art 17", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Retention Schedule (employee records)" },
      { id: 2, label: "Disposal Instruction" },
      { id: 3, label: "Payroll retention (7-year)" },
    ],
  },
  "LRC-001/8": {
    kind: "signoff", title: "Privacy Notice (DPO/Legal)", standard: "GDPR Art 13/14", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Revised Privacy Notice draft" },
      { id: 2, label: "Transfer safeguards (US email)" },
      { id: 3, label: "Retention statements" },
    ],
  },
  "PE-001/7": {
    kind: "signoff", title: "Project Charter (Sponsor)", standard: "ISO 27001 Cl 6.2; 5.3", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Project Charter v1.0" },
      { id: 2, label: "Scope & out-of-scope" },
      { id: 3, label: "Resource plan" },
    ],
  },
  "CA-001/7": {
    kind: "score", title: "Knowledge-Check Rubric", standard: "ISO 27001 A.6.3", itemLabel: "dimension",
    feedsNext: "The scored rubric feeds Prioritise / Compile.",
    items: [
      { id: 1, label: "Phishing recognition", weight: 1 },
      { id: 2, label: "Passwords & MFA", weight: 1 },
      { id: 3, label: "Clean desk / clear screen", weight: 1 },
      { id: 4, label: "Data handling / classification", weight: 1 },
      { id: 5, label: "Incident reporting", weight: 1 },
    ],
  },
  "GRM-003/6.4": {
    kind: "score", title: "CSF Maturity Rubric", standard: "NIST CSF 2.0", itemLabel: "dimension",
    feedsNext: "The scored rubric feeds Prioritise / Compile.",
    items: [
      { id: 1, label: "Govern", weight: 2 },
      { id: 2, label: "Identify", weight: 1 },
      { id: 3, label: "Protect", weight: 2 },
      { id: 4, label: "Detect", weight: 2 },
      { id: 5, label: "Respond", weight: 1 },
      { id: 6, label: "Recover", weight: 1 },
    ],
  },
  "CRM-003/9.6": {
    kind: "assess", title: "SOC 2 Readiness (RAG)", standard: "SOC 2 Type II (AICPA TSC)", itemLabel: "item",
    scale: [{ label: "Red", value: 1 }, { label: "Amber", value: 2 }, { label: "Green", value: 3 }],
    feedsNext: "The assessment feeds Prioritise / Recommend / Compile.",
    items: [
      { id: 1, label: "CC1 Control Environment" },
      { id: 2, label: "CC2 Communication & Information" },
      { id: 3, label: "CC3 Risk Assessment" },
      { id: 4, label: "CC5 Control Activities" },
      { id: 5, label: "CC6 Logical & Physical Access" },
      { id: 6, label: "CC7 System Monitoring" },
    ],
  },

  // ── Draft steps ───────────────────────────────────────────────────────────────────────────
  // `kind: "draft"` gives each item a section body plus an optional standards citation, so the
  // items ARE the document's sections. Where a step revises rather than authors, the items are
  // the things that must be shown to have changed — a revision with no diff is not a revision.
  "GRM-002/5.6": {
    kind: "draft", title: "Policy Revision — Review Feedback Incorporated",
    standard: "ISO 27001 Cl 5.2; Cl 7.5.2 Creating and updating", itemLabel: "change",
    feedsNext: "Feeds Step 5.7 (approval) and Step 5.8 (Policy Register entry).",
    items: [
      { id: 1, label: "Change 1 — what the reviewer said, and the wording now" },
      { id: 2, label: "Change 2 — what the reviewer said, and the wording now" },
      { id: 3, label: "Change 3 — what the reviewer said, and the wording now" },
      { id: 4, label: "Feedback deliberately not adopted, and the reasoning" },
      { id: 5, label: "Version history entry for this revision" },
    ],
  },
  "GRM-003/6.2": {
    kind: "draft", title: "Maturity Questionnaire — Departmental Adaptation",
    standard: "NIST CSF 2.0 Functions; ISO 27001 Cl 4.1 Context", itemLabel: "function",
    feedsNext: "Feeds Step 6.3 (assessment interviews) and Step 6.5 (scoring).",
    items: [
      { id: 1, label: "GOVERN — questions adapted to this department's decision rights" },
      { id: 2, label: "IDENTIFY — questions adapted to the assets this department actually holds" },
      { id: 3, label: "PROTECT — questions adapted to the controls in this department's hands" },
      { id: 4, label: "DETECT — questions adapted to what this department would notice" },
      { id: 5, label: "RESPOND & RECOVER — questions adapted to this department's role in an incident" },
      { id: 6, label: "Generic questions removed, and why they did not apply here" },
    ],
  },
  "GRM-003/6.7": {
    kind: "draft", title: "Maturity Improvement Roadmap (one page)",
    standard: "ISO 27001 Cl 6.2 Objectives and planning; Cl 10.2", itemLabel: "section",
    feedsNext: "Feeds Step 6.8 (presentation) and SPA-001.",
    items: [
      { id: 1, label: "Current maturity position, in one sentence" },
      { id: 2, label: "Gap 1 — action, owner, target maturity level, date" },
      { id: 3, label: "Gap 2 — action, owner, target maturity level, date" },
      { id: 4, label: "Gap 3 — action, owner, target maturity level, date" },
      { id: 5, label: "Sequencing rationale — why this order and not by score" },
      { id: 6, label: "What is deliberately NOT on the roadmap this cycle" },
    ],
  },
  "TV-002/2": {
    kind: "draft", title: "Testable Control Statements",
    standard: "ISO 27001 A.5.35 Independent review; Cl 9.2 Internal audit", itemLabel: "policy",
    feedsNext: "Feeds Step 3 (evidence request) and Step 5 (testing).",
    items: [
      { id: 1, label: "Policy 1 — two or three testable statements, and the evidence that confirms each" },
      { id: 2, label: "Policy 2 — two or three testable statements, and the evidence that confirms each" },
      { id: 3, label: "Policy 3 — two or three testable statements, and the evidence that confirms each" },
      // A statement nobody could fail is not a test. Naming the disproof is what makes the
      // spot-check a control test rather than a confirmation exercise.
      { id: 4, label: "For each statement: what a FAIL would look like in the evidence" },
    ],
  },
  "TV-002/7": {
    kind: "draft", title: "Remediation Recommendations",
    standard: "ISO 27001 Cl 10.1 Nonconformity and corrective action", itemLabel: "finding",
    owners: ["IT Manager", "CISO", "Compliance Manager", "HR Manager", "Head of Platform"],
    feedsNext: "Feeds Step 8 (report issue) and IE-001, MM-002.",
    items: [
      { id: 1, label: "Non-compliant finding 1 — recommendation, owner, evidence of closure" },
      { id: 2, label: "Non-compliant finding 2 — recommendation, owner, evidence of closure" },
      { id: 3, label: "Non-compliant finding 3 — recommendation, owner, evidence of closure" },
      { id: 4, label: "Systemic cause common to the findings, if there is one" },
      { id: 5, label: "Which recommendation to do first, and why" },
    ],
  },
  "DD-001/4": {
    kind: "draft", title: "Incident Reporting Quick Reference Card",
    standard: "ISO 27001 A.6.8 Event reporting; A.5.26 Response to incidents", itemLabel: "panel",
    feedsNext: "Feeds Step 5 (walkthrough) and Step 8 (staff communication).",
    items: [
      { id: 1, label: "What counts as an incident — in staff language, with two examples" },
      { id: 2, label: "What to do in the first five minutes (and what NOT to do)" },
      { id: 3, label: "Who to contact — route, and the out-of-hours route" },
      { id: 4, label: "What information to have ready" },
      { id: 5, label: "The reassurance line — reporting a false alarm is not a mistake" },
    ],
  },
  "DD-001/7": {
    kind: "draft", title: "Incident Procedure — Final Revision",
    standard: "ISO 27001 A.5.26; Cl 7.5.2 Creating and updating", itemLabel: "change",
    feedsNext: "Feeds Step 8 (registration and staff communication).",
    items: [
      { id: 1, label: "Change 1 — the feedback, and the revised wording" },
      { id: 2, label: "Change 2 — the feedback, and the revised wording" },
      { id: 3, label: "Change 3 — the feedback, and the revised wording" },
      { id: 4, label: "Feedback not adopted, and why the procedure is better without it" },
      { id: 5, label: "Final check — every role named in the procedure exists and is filled" },
    ],
  },
  "MM-002/2": {
    kind: "draft", title: "Risk Review Meeting Pack",
    standard: "ISO 27001 Cl 9.1 Monitoring; Cl 9.3 Management review", itemLabel: "section",
    feedsNext: "Feeds Steps 3–4 (the review meeting itself).",
    items: [
      { id: 1, label: "Agenda — items in the order they will be taken, with time boxes" },
      { id: 2, label: "Pre-reading note — what attendees must have read, and the decisions being asked of them" },
      { id: 3, label: "Risks scheduled for review this cycle, and why these ones" },
      { id: 4, label: "Attendees — role, and what each is there to decide or inform" },
      { id: 5, label: "Circulation record — sent to whom, when, and the reading deadline" },
    ],
  },
  "MM-002/4": {
    kind: "draft", title: "In-Meeting Risk Updates",
    standard: "ISO 27001 Cl 6.1.3 Risk treatment; Cl 9.3", itemLabel: "update",
    feedsNext: "Feeds Step 5 (new risks) and Step 7 (Register v2.0).",
    items: [
      { id: 1, label: "Score change 1 — risk ID, old score, new score, the evidence that moved it" },
      { id: 2, label: "Score change 2 — risk ID, old score, new score, the evidence that moved it" },
      { id: 3, label: "Treatment status change — risk ID, and what actually completed" },
      { id: 4, label: "Risk proposed for closure — and the evidence that justifies closing it" },
      // Disagreement in the room is data. Averaged away it disappears; recorded, it tells the
      // next cycle where the organisation's risk appetite is genuinely unsettled.
      { id: 5, label: "Any disagreement on a score, recorded rather than averaged away" },
    ],
  },
  "DD-002/2": {
    kind: "draft", title: "Training Module Learning Objectives",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "objective",
    feedsNext: "Feeds Step 3 (content outline) and Step 5 (knowledge check).",
    items: [
      // Objectives written as observable behaviour, not "understand" — otherwise the knowledge
      // check in step 5 has nothing it can actually test against.
      { id: 1, label: "Phishing — what the learner will be able to DO afterwards" },
      { id: 2, label: "Passwords — what the learner will be able to DO afterwards" },
      { id: 3, label: "Data handling — what the learner will be able to DO afterwards" },
      { id: 4, label: "How each objective will be evidenced as met" },
    ],
  },
  "DD-002/3": {
    kind: "draft", title: "Training Content Outline",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "segment",
    feedsNext: "Feeds Step 4 (slides) and Step 5 (knowledge check).",
    items: [
      { id: 1, label: "Phishing — 10 minutes: hook, teaching points, exercise" },
      { id: 2, label: "Passwords — 10 minutes: hook, teaching points, exercise" },
      { id: 3, label: "Data handling — 10 minutes: hook, teaching points, exercise" },
      { id: 4, label: "Organisation-specific examples used in place of generic ones" },
      { id: 5, label: "Timing plan — what gets cut first if the session overruns" },
    ],
  },
  "DD-002/4": {
    kind: "draft", title: "Awareness Slide Deck (10–12 slides)",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "slide",
    feedsNext: "Feeds Step 6 (mentor review) and Step 7 (pilot).",
    items: [
      { id: 1, label: "Title and why this matters here — one slide" },
      { id: 2, label: "Phishing — teaching slides and the worked example" },
      { id: 3, label: "Passwords — teaching slides and the worked example" },
      { id: 4, label: "Data handling — teaching slides and the worked example" },
      { id: 5, label: "What to do if you think something has gone wrong" },
      { id: 6, label: "Slide count check, and what was cut to stay inside it" },
    ],
  },
  "DD-002/5": {
    kind: "draft", title: "Five-Question Knowledge Check",
    standard: "ISO 27001 A.6.3; Cl 9.1 Monitoring", itemLabel: "question",
    feedsNext: "Feeds Step 7 (pilot) and CA-001 (delivery and scoring).",
    items: [
      { id: 1, label: "Q1 — question, options, correct answer, objective it tests" },
      { id: 2, label: "Q2 — question, options, correct answer, objective it tests" },
      { id: 3, label: "Q3 — question, options, correct answer, objective it tests" },
      { id: 4, label: "Q4 — question, options, correct answer, objective it tests" },
      { id: 5, label: "Q5 — question, options, correct answer, objective it tests" },
      // A distractor nobody picks teaches nothing; one that is plausibly right is where the
      // learning happens.
      { id: 6, label: "For each question: the plausible wrong answer, and why people pick it" },
    ],
  },
  "SPA-002/6": {
    kind: "draft", title: "Stakeholder Communication Plan",
    standard: "ISO 27001 Cl 7.4 Communication; Cl 4.2 Interested parties", itemLabel: "audience",
    feedsNext: "Feeds Step 7 (sponsor review) and Step 8 (sign-off).",
    items: [
      { id: 1, label: "Key players (high influence, high interest) — what, how often, which channel" },
      { id: 2, label: "Keep satisfied (high influence, low interest) — what, how often, which channel" },
      { id: 3, label: "Keep informed (low influence, high interest) — what, how often, which channel" },
      { id: 4, label: "Monitor (low influence, low interest) — what, how often, which channel" },
      { id: 5, label: "Escalation route when a communication is ignored" },
    ],
  },
  "SPA-001/6": {
    kind: "draft", title: "Management Briefing (one page)",
    standard: "ISO 27001 Cl 6.2 Objectives and planning; Cl 9.3", itemLabel: "section",
    feedsNext: "Feeds Step 7 (mentor review) and Step 8 (endorsement).",
    items: [
      { id: 1, label: "Context — why now, in two sentences" },
      { id: 2, label: "Priorities — the phases and what each buys" },
      { id: 3, label: "Investment summary — effort, owners, and what management is committing to" },
      { id: 4, label: "Next steps — and precisely what endorsement is being sought on" },
      { id: 5, label: "The one-page test — what was cut to hold it to a page" },
    ],
  },
  "IE-001/2": {
    kind: "draft", title: "Implementation Task Cards",
    standard: "CIS Controls v8 IG1; ISO 27001 Cl 8.1 Operational planning", itemLabel: "card",
    owners: ["IT Manager", "Head of Platform", "Security Eng. Lead", "Data Platform Lead"],
    feedsNext: "Feeds Step 3 (weekly tracking) and Step 5 (acceptance testing).",
    items: [
      { id: 1, label: "Safeguard 1 — what must be done, IT owner, tools, acceptance criteria, evidence" },
      { id: 2, label: "Safeguard 2 — what must be done, IT owner, tools, acceptance criteria, evidence" },
      { id: 3, label: "Safeguard 3 — what must be done, IT owner, tools, acceptance criteria, evidence" },
      { id: 4, label: "Safeguard 4 — what must be done, IT owner, tools, acceptance criteria, evidence" },
      { id: 5, label: "Dependencies between cards, and the resulting order" },
    ],
  },
  "IE-001/7": {
    kind: "draft", title: "Gap Analysis Update After Remediation",
    standard: "CIS Controls v8 IG1; ISO 27001 Cl 9.1", itemLabel: "update",
    feedsNext: "Feeds Step 8 (progress report) and AA-002, PE-002.",
    items: [
      { id: 1, label: "Safeguards moved to Implemented — with the evidence reference for each" },
      { id: 2, label: "Safeguards moved to Partial — and what still remains" },
      { id: 3, label: "Safeguards unchanged — and why remediation did not reach them" },
      { id: 4, label: "Score before and after, with the arithmetic shown" },
      // The trap this column exists for: one control appearing to close several safeguards at
      // once, which inflates the score without improving the position.
      { id: 5, label: "Overlapping effects counted once, not once per safeguard" },
    ],
  },
  "IE-001/8": {
    kind: "draft", title: "Implementation Progress Report",
    standard: "CIS Controls v8 IG1; ISO 27001 Cl 9.1 Monitoring", itemLabel: "section",
    feedsNext: "Closes IE-001; feeds PE-002 and the next remediation cycle.",
    items: [
      { id: 1, label: "Position — what was implemented, against what was planned" },
      { id: 2, label: "Evidence — what an auditor could sample today that they could not before" },
      { id: 3, label: "Blockers — what stopped, who owns it, and by when" },
      { id: 4, label: "Remaining exposure, stated plainly" },
      { id: 5, label: "What the IT Manager is being asked to decide or resource next" },
    ],
  },
  "TV-001/6": {
    kind: "draft", title: "Access Control Testing Report",
    standard: "ISO 27001 A.5.18 Access rights; A.8.2 Privileged access", itemLabel: "section",
    feedsNext: "Feeds Step 7 (mentor review) and Step 8 (issue to the IT Manager).",
    items: [
      { id: 1, label: "Scope and method — accounts in scope, sources reconciled, and what was excluded" },
      { id: 2, label: "Findings by type, with counts and the clean rate alongside the exception rate" },
      { id: 3, label: "The most serious finding, and why it is the most serious" },
      { id: 4, label: "Remediation recommendations — action, owner, deadline" },
      { id: 5, label: "Systemic cause behind the individual findings" },
      { id: 6, label: "Recommended review periodicity, and the reasoning for that interval" },
    ],
  },
  "IE-002/2": {
    kind: "draft", title: "Document Control Policy",
    standard: "ISO 27001 Cl 7.5.2; Cl 7.5.3 Control of documented information", itemLabel: "section",
    feedsNext: "Feeds Step 3 (Document Register) and Step 4 (folder structure).",
    items: [
      { id: 1, label: "Versioning scheme — and what makes a change major rather than minor" },
      { id: 2, label: "Naming convention — with a worked example of a compliant filename" },
      { id: 3, label: "Storage locations — approved versus working, and why they are separate" },
      { id: 4, label: "Access rights — who may read, write and approve" },
      { id: 5, label: "Review frequency, and who is accountable for triggering it" },
      { id: 6, label: "What happens to superseded versions" },
    ],
  },
  "IE-002/3": {
    kind: "draft", title: "Document Register",
    standard: "ISO 27001 Cl 7.5.3 Control of documented information", itemLabel: "section",
    feedsNext: "Feeds Step 4 (folder structure) and Step 5 (migration).",
    items: [
      { id: 1, label: "Register fields — and why each one is needed for control, not decoration" },
      { id: 2, label: "Policies indexed — count, and the coverage claim you can defend" },
      { id: 3, label: "Procedures indexed — count, and the coverage claim you can defend" },
      { id: 4, label: "Documents found that nobody owns, and how they were resolved" },
      { id: 5, label: "How the register stays current once you hand it over" },
    ],
  },
  "CA-002/3": {
    kind: "draft", title: "Executive Compliance Status Report",
    standard: "ISO 27001 Cl 9.3 Management review", itemLabel: "section",
    feedsNext: "Feeds Step 4 (content assembly) and Step 5 (presentation).",
    items: [
      { id: 1, label: "Overall compliance RAG, and the single sentence that justifies the colour" },
      { id: 2, label: "Top three risks — each with a number attached" },
      { id: 3, label: "Top three achievements — each with a number attached" },
      { id: 4, label: "Decisions required — what is needed, from whom, by when" },
      { id: 5, label: "30-day outlook, written so it can be proved wrong in 30 days" },
      { id: 6, label: "What was cut to hold one page" },
    ],
  },
  "CA-002/7": {
    kind: "draft", title: "Status Report — Final Revision",
    standard: "ISO 27001 Cl 9.3 Management review", itemLabel: "change",
    feedsNext: "Feeds Step 8 (issue to management) and MM-001, SPA-001.",
    items: [
      { id: 1, label: "Change 1 — the feedback, and what the report now says" },
      { id: 2, label: "Change 2 — the feedback, and what the report now says" },
      { id: 3, label: "Change 3 — the feedback, and what the report now says" },
      { id: 4, label: "Feedback not adopted, and why the report is more useful without it" },
      { id: 5, label: "Still one page after the changes — what gave way" },
    ],
  },
  "KT-001/3": {
    kind: "draft", title: "New Joiner GRC Checklist",
    standard: "ISO 27001 A.6.1 Screening; A.6.3 Awareness; A.5.18 Access", itemLabel: "stage",
    owners: ["HR Manager", "Line Manager", "IT Manager", "Compliance Manager"],
    feedsNext: "Feeds Step 4 (Day-1 briefing) and Step 6 (pilot).",
    items: [
      { id: 1, label: "Day 1 — actions for the joiner, and actions for their manager" },
      { id: 2, label: "Day 7 — actions for the joiner, and actions for their manager" },
      { id: 3, label: "Day 30 — actions for the joiner, and actions for their manager" },
      { id: 4, label: "Which items are blocking (access not granted until done) and which are not" },
      { id: 5, label: "How completion is evidenced, and who checks" },
    ],
  },
  "KT-001/4": {
    kind: "draft", title: "Day-1 Security Briefing (five slides)",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "slide",
    feedsNext: "Feeds Step 6 (pilot) and Step 8 (handover to HR).",
    items: [
      { id: 1, label: "Slide 1 — the three things that matter most on day one" },
      { id: 2, label: "Slide 2 — how we handle information here, with one real example" },
      { id: 3, label: "Slide 3 — accounts, access and what to do when you need more" },
      { id: 4, label: "Slide 4 — how to report something that looks wrong, and the no-blame line" },
      // A manager who is not a security specialist has to deliver this cold; if the slide
      // needs them to improvise, it will not be delivered as intended.
      { id: 5, label: "Slide 5 — where to find everything, plus manager speaker notes" },
    ],
  },
  "KT-001/7": {
    kind: "draft", title: "Onboarding Pack — Final Versions",
    standard: "ISO 27001 A.6.3; Cl 7.5.2 Creating and updating", itemLabel: "change",
    feedsNext: "Feeds Step 8 (handover to HR).",
    items: [
      { id: 1, label: "Checklist — what the pilot changed" },
      { id: 2, label: "Day-1 briefing — what the pilot changed" },
      { id: 3, label: "Reference guide — what the pilot changed" },
      { id: 4, label: "Pilot feedback not adopted, and the reason" },
      { id: 5, label: "Version and owner set on each final artefact" },
    ],
  },
  "KT-002/5": {
    kind: "draft", title: "Lessons Learned Report",
    standard: "ISO 27001 Cl 10.2 Continual improvement; A.5.27", itemLabel: "section",
    feedsNext: "Feeds Step 6 (peer review) and Step 8 (improvement backlog).",
    items: [
      { id: 1, label: "What this programme actually asks of you, in plain terms" },
      { id: 2, label: "What I got wrong early, and what it cost" },
      { id: 3, label: "What I would tell myself on day one" },
      { id: 4, label: "Which lessons generalise, and which were specific to my organisations" },
      { id: 5, label: "Knowledge gaps I still have, stated without hedging" },
      { id: 6, label: "The one thing a future mentee should do differently" },
    ],
  },
  "RR-001/5": {
    kind: "draft", title: "Post-Exercise Lessons Learned Report",
    standard: "ISO 27001 A.5.27 Learning from incidents; A.5.24", itemLabel: "section",
    feedsNext: "Feeds Step 6 (procedure amendments) and Step 8 (filing).",
    items: [
      { id: 1, label: "Exercise summary — scenario, participants, duration" },
      { id: 2, label: "Timeline of decisions, against what the procedure expected" },
      { id: 3, label: "What worked — stated as prominently as what did not" },
      { id: 4, label: "Deviations from procedure, each with the clause it breached" },
      { id: 5, label: "Capability gaps (could not) separated from timing gaps (too slow)" },
      { id: 6, label: "Proposed procedure amendments, each with an owner" },
      // Written inside 48 hours because recall of who said what, and in what order,
      // decays faster than anyone expects.
      { id: 7, label: "Written within 48 hours — date and time of writing" },
    ],
  },
  "MM-001/6": {
    kind: "draft", title: "Management Commentary (three sentences)",
    standard: "ISO 27001 Cl 9.1 Monitoring; Cl 9.3", itemLabel: "sentence",
    feedsNext: "Feeds Step 7 (report issue) and CA-002.",
    items: [
      { id: 1, label: "Sentence 1 — what the RAG status actually means this month" },
      { id: 2, label: "Sentence 2 — what changed, and what caused it" },
      { id: 3, label: "Sentence 3 — what management should do or watch as a result" },
      { id: 4, label: "The interpretation you rejected, and why the data does not support it" },
    ],
  },
  "CA-003/1": {
    kind: "draft", title: "Stakeholder Interview Guide",
    standard: "ISO 27001 Cl 4.2 Interested parties; Cl 7.4", itemLabel: "section",
    feedsNext: "Feeds Steps 2–5 (the interviews) and Step 8 (routing insights).",
    items: [
      { id: 1, label: "Opening — purpose, duration, and what you will do with what they say" },
      // Open questions only: a closed question gets a yes and teaches nothing, which is the
      // usual reason a discovery interview produces no discoveries.
      { id: 2, label: "Questions on their objectives and pressures — open, not closed" },
      { id: 3, label: "Questions on where GRC currently helps or hinders them" },
      { id: 4, label: "Questions on risks they see that we may not" },
      { id: 5, label: "Closing — what happens next, and what they can expect from you" },
      { id: 6, label: "Adaptations by stakeholder type, and why each differs" },
    ],
  },
  "BCRP-001/4": {
    kind: "draft", title: "RTO and RPO Definition",
    standard: "ISO 27001 A.5.30 ICT readiness for business continuity", itemLabel: "function",
    feedsNext: "Feeds Step 6 (BIA summary) and BCRP-002 (DR checklist criteria).",
    items: [
      { id: 1, label: "Function 1 — RTO, RPO, and the business consequence that sets them" },
      { id: 2, label: "Function 2 — RTO, RPO, and the business consequence that sets them" },
      { id: 3, label: "Function 3 — RTO, RPO, and the business consequence that sets them" },
      // The gap between what the business wants and what the estate can currently deliver IS
      // the finding; an RTO agreed without testing feasibility is an aspiration.
      { id: 4, label: "Where the stated RTO/RPO exceeds current capability, and by how much" },
      { id: 5, label: "Who has to agree these targets for them to mean anything" },
    ],
  },
  "BCRP-001/7": {
    kind: "draft", title: "BIA Report",
    standard: "ISO 27001 A.5.30; Cl 6.1.2 Risk assessment", itemLabel: "section",
    feedsNext: "Feeds Step 8 (sign-off) and BCRP-002, SPA-001.",
    items: [
      { id: 1, label: "Methodology — how criticality was determined, and by whom" },
      { id: 2, label: "Findings — critical functions ranked, with impact scores" },
      { id: 3, label: "RTO / RPO table" },
      { id: 4, label: "Single points of failure, including shared dependencies" },
      { id: 5, label: "Recommended continuity measures, each with an owner" },
      { id: 6, label: "Limitations — what this BIA did not cover, and why" },
    ],
  },
  "BCRP-002/7": {
    kind: "draft", title: "DR Checklist — Talk-Through Corrections",
    standard: "ISO 27001 A.5.30 ICT readiness for business continuity", itemLabel: "correction",
    feedsNext: "Feeds Step 8 (filing and live-test recommendation).",
    items: [
      { id: 1, label: "Correction 1 — what the walkthrough exposed, and the revised step" },
      { id: 2, label: "Correction 2 — what the walkthrough exposed, and the revised step" },
      { id: 3, label: "Correction 3 — what the walkthrough exposed, and the revised step" },
      { id: 4, label: "A step nobody could actually perform, and what replaced it" },
      { id: 5, label: "What the talk-through could NOT prove, and now needs a live test" },
    ],
  },
  "PE-001/2": {
    kind: "draft", title: "Project Objectives and Scope",
    standard: "ISO 27001 Cl 6.2 Objectives; Cl 4.3 Scope", itemLabel: "section",
    feedsNext: "Feeds Steps 3–5 (charter assembly) and Step 8 (sponsor sign-off).",
    items: [
      { id: 1, label: "Objectives — measurable, with the measure stated" },
      { id: 2, label: "Success criteria — how anyone would know this succeeded" },
      { id: 3, label: "Out of scope — named explicitly, with the reason for each exclusion" },
      // "Out of scope" without a reason is the line every stakeholder later disputes.
      { id: 4, label: "The exclusion most likely to be challenged, and your answer" },
      { id: 5, label: "Assumptions the objectives rest on" },
    ],
  },
  "QA-002/2": {
    kind: "draft", title: "Control Test Design",
    standard: "ISO 27001 Cl 9.2 Internal audit; A.5.35", itemLabel: "control",
    feedsNext: "Feeds Step 4 (methodology sheets) and Step 5 (methodology overview).",
    items: [
      { id: 1, label: "Control 1 — objective, test approach, steps, evidence, pass/fail criteria" },
      { id: 2, label: "Control 2 — objective, test approach, steps, evidence, pass/fail criteria" },
      { id: 3, label: "Control 3 — objective, test approach, steps, evidence, pass/fail criteria" },
      // Inquiry alone proves nothing; the choice between inquiry, observation, inspection and
      // re-performance is the whole design decision, so it has to be argued.
      { id: 4, label: "Why that test approach for each control, and what a weaker one would miss" },
    ],
  },
  "QA-002/5": {
    kind: "draft", title: "Testing Methodology Overview (one page)",
    standard: "ISO 27001 Cl 9.2 Internal audit", itemLabel: "section",
    feedsNext: "Feeds Step 6 (mentor review) and Step 7 (QA library).",
    items: [
      { id: 1, label: "Sampling approach — sample size, how selected, and why that is defensible" },
      { id: 2, label: "Frequency — how often each control class is tested, and the basis" },
      { id: 3, label: "Documentation standard — what every test record must contain" },
      { id: 4, label: "How a failed test is escalated and tracked to closure" },
      { id: 5, label: "How someone else could re-run a test and get the same answer" },
    ],
  },
  "QA-002/7": {
    kind: "draft", title: "Methodology — Final Revision and Library Entry",
    standard: "ISO 27001 Cl 9.2; Cl 7.5.3 Documented information", itemLabel: "change",
    feedsNext: "Closes QA-002; the methodology enters the GRC Quality Assurance Library.",
    items: [
      { id: 1, label: "Change 1 — the feedback, and the revised methodology" },
      { id: 2, label: "Change 2 — the feedback, and the revised methodology" },
      { id: 3, label: "Feedback not adopted, and the reasoning" },
      { id: 4, label: "Library entry — ID, version, owner, review date" },
      { id: 5, label: "How the next person will find and use this without asking you" },
    ],
  },

  // ── Compile steps ─────────────────────────────────────────────────────────────────────────
  // `kind: "compile"` gives each item a source artefact plus its content, so the items are the
  // sections of the assembled deliverable and every one has to name where it came from. That is
  // the discipline the verb exists for: a compiled report whose figures have no traceable source
  // is where inconsistencies between the detail and the summary get in.
  "SPA-001/1": {
    kind: "compile", title: "Consolidated Findings for the Roadmap",
    standard: "ISO 27001 Cl 6.1.2; Cl 6.2 Objectives and planning", itemLabel: "section",
    feedsNext: "Feeds Step 2 (banding) and Step 3 (action detail).",
    items: [
      { id: 1, label: "Gap analysis findings (AA-002) — what carries into the roadmap" },
      { id: 2, label: "Risk register findings (GRM-001) — what carries into the roadmap" },
      { id: 3, label: "Maturity findings (GRM-003) — what carries into the roadmap" },
      // The merge rule has to be stated or the count is unauditable: the same root cause appears
      // under three different names across three sources.
      { id: 4, label: "Consolidation rule — when two findings become one action, and the count" },
      { id: 5, label: "Where the sources disagree on severity, and which rating you carried" },
      { id: 6, label: "Executive summary — verdict, shape of the year, and the governing clause" },
    ],
  },
  "SPA-001/4": {
    kind: "compile", title: "12-Month Gantt Layout",
    standard: "ISO 27001 Cl 6.2 Objectives and planning", itemLabel: "phase",
    feedsNext: "Feeds Step 5 (uplift estimate) and Step 6 (management briefing).",
    items: [
      { id: 1, label: "Foundation (months 1–3) — actions, owners, closing milestone" },
      { id: 2, label: "Build (months 4–6) — actions, owners, closing milestone" },
      { id: 3, label: "Optimise (months 7–12) — actions, owners, closing milestone" },
      { id: 4, label: "Critical path — which action gates which, and what a slip costs" },
      { id: 5, label: "Load per quarter, against the capacity the named owners actually have" },
    ],
  },
  "CA-002/1": {
    kind: "compile", title: "Task Outputs for the Status Report",
    standard: "ISO 27001 Cl 9.3 Management review", itemLabel: "source",
    feedsNext: "Feeds Step 2 (message selection) and Step 3 (report drafting).",
    items: [
      { id: 1, label: "Gap analysis — the figure that goes to management, and its date" },
      { id: 2, label: "Risk register — the figure that goes to management, and its date" },
      { id: 3, label: "Maturity assessment — the figure that goes to management, and its date" },
      { id: 4, label: "KPI tracker — the figure that goes to management, and its date" },
      // Figures gathered on different dates describe different organisations; saying so is what
      // stops the report implying a single snapshot it does not have.
      { id: 5, label: "As-at dates reconciled — what period this report actually describes" },
    ],
  },
  "KT-001/2": {
    kind: "compile", title: "New Joiner GRC Reference Guide",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "section",
    feedsNext: "Feeds Step 5 (mentor review) and Step 6 (pilot).",
    items: [
      { id: 1, label: "Key policies and where to find them" },
      { id: 2, label: "How to report a security incident" },
      { id: 3, label: "Data classification rules, with an example of each level" },
      { id: 4, label: "Acceptable use of systems" },
      { id: 5, label: "Top phishing warning signs, drawn from real attempts here" },
      { id: 6, label: "Who to contact for GRC questions" },
      { id: 7, label: "Four-page limit — what was cut, and where it went instead" },
    ],
  },
  "MM-001/3": {
    kind: "compile", title: "Monthly GRC Metrics Tracker",
    standard: "ISO 27001 Cl 9.1 Monitoring, measurement, analysis and evaluation", itemLabel: "component",
    feedsNext: "Feeds Step 4 (first collection) and Step 5 (Month 1 report).",
    items: [
      { id: 1, label: "KPI rows — each pulling its definition from the Step 2 cards" },
      { id: 2, label: "Data entry columns, and who fills each one" },
      { id: 3, label: "Auto-RAG rules — the thresholds and how they are applied" },
      { id: 4, label: "Trend view — how month-on-month direction is shown" },
      // A tracker that silently colours a blank cell green is worse than no tracker.
      { id: 5, label: "How a missing month is displayed, so it is not read as a good result" },
    ],
  },
  "PE-001/5": {
    kind: "compile", title: "Milestone Timeline",
    standard: "ISO 27001 Cl 6.2 Objectives and planning", itemLabel: "milestone",
    feedsNext: "Feeds Step 6 (project risks) and Step 7 (charter review).",
    items: [
      { id: 1, label: "Milestone 1 — what is verifiably complete, date, and who confirms it" },
      { id: 2, label: "Milestone 2 — what is verifiably complete, date, and who confirms it" },
      { id: 3, label: "Milestone 3 — what is verifiably complete, date, and who confirms it" },
      { id: 4, label: "Milestone 4 — what is verifiably complete, date, and who confirms it" },
      // Milestones only, not tasks: a milestone nobody can verify is a date, not a milestone.
      { id: 5, label: "Why each is a milestone rather than a task, and what evidences it" },
    ],
  },
  "DD-002/8": {
    kind: "compile", title: "Final Training Materials",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "artefact",
    feedsNext: "Closes DD-002; the pack feeds CA-001 delivery and KT-001.",
    items: [
      { id: 1, label: "Slide deck — final version, with what the pilot changed" },
      { id: 2, label: "Knowledge check — final version, with what the pilot changed" },
      { id: 3, label: "Facilitator guide — final version, with what the pilot changed" },
      { id: 4, label: "Version, owner and review date set on each artefact" },
      { id: 5, label: "Pilot feedback deliberately not adopted, and the reasoning" },
    ],
  },

  // ── Document steps ────────────────────────────────────────────────────────────────────────
  // `kind: "document"` requires a cross-reference on every section, so each piece of the record
  // points back at the artefact it derives from rather than standing as an unsupported assertion.
  "CRM-001/7.4": {
    kind: "document", title: "Obligation Detail Records",
    standard: "ISO 27001 A.5.31 Legal and contractual requirements", itemLabel: "obligation",
    feedsNext: "Feeds Step 7.5 (control mapping) and Step 7.6 (gap identification).",
    items: [
      { id: 1, label: "Obligation 1 — source, requirement, applicability rationale, owner, status, review date" },
      { id: 2, label: "Obligation 2 — source, requirement, applicability rationale, owner, status, review date" },
      { id: 3, label: "Obligation 3 — source, requirement, applicability rationale, owner, status, review date" },
      { id: 4, label: "Obligation 4 — source, requirement, applicability rationale, owner, status, review date" },
      // Applicability is the field auditors probe hardest, because "it applies because it is a
      // well-known regulation" is not a rationale.
      { id: 5, label: "For each: why it applies to THIS organisation specifically" },
    ],
  },
  "CRM-003/9.3": {
    kind: "document", title: "Common Criteria Mapping",
    standard: "SOC 2 Type II (AICPA TSC) CC1–CC9", itemLabel: "criterion cluster",
    feedsNext: "Feeds Step 9.4 (gap list), 9.5 (ISO cross-reference) and 9.6 (RAG dashboard).",
    items: [
      { id: 1, label: "CC1–CC2 — description, example audit test, expected evidence, internal control or GAP" },
      { id: 2, label: "CC3–CC4 — description, example audit test, expected evidence, internal control or GAP" },
      { id: 3, label: "CC5–CC6 — description, example audit test, expected evidence, internal control or GAP" },
      { id: 4, label: "CC7–CC8 — description, example audit test, expected evidence, internal control or GAP" },
      { id: 5, label: "CC9 — description, example audit test, expected evidence, internal control or GAP" },
      // A blank control column is indistinguishable from an unconsidered criterion, which is why
      // the acceptance criteria require an explicit GAP marker rather than an empty cell.
      { id: 6, label: "Completeness statement — every criterion carries a control or an explicit GAP" },
    ],
  },
  "TV-002/5": {
    kind: "document", title: "Control Testing Workpaper",
    standard: "ISO 27001 Cl 9.2 Internal audit; A.5.35", itemLabel: "test",
    feedsNext: "Feeds Step 6 (findings summary) and Step 7 (remediation recommendations).",
    items: [
      { id: 1, label: "Test 1 — statement tested, sample, what was found, verdict" },
      { id: 2, label: "Test 2 — statement tested, sample, what was found, verdict" },
      { id: 3, label: "Test 3 — statement tested, sample, what was found, verdict" },
      // Reproducibility is what makes a workpaper a workpaper rather than a note.
      { id: 4, label: "How the sample was selected, so someone else could repeat this test" },
      { id: 5, label: "What you could NOT test, and why it is recorded rather than omitted" },
    ],
  },
  "DD-002/6": {
    kind: "document", title: "Facilitator Guide (one page)",
    standard: "ISO 27001 A.6.3 Awareness, education and training", itemLabel: "section",
    feedsNext: "Feeds Step 7 (pilot) and Step 8 (final materials).",
    items: [
      { id: 1, label: "Timings per segment, and what to cut if the session overruns" },
      { id: 2, label: "The exercises — how to run each, and what a good answer sounds like" },
      // The guide is delivered by a manager or HR person, not a security specialist, so the
      // hardest questions have to be answered on the page rather than improvised.
      { id: 3, label: "Three questions attendees are likely to ask, with answers to give" },
      { id: 4, label: "What to do when someone discloses a live incident mid-session" },
      { id: 5, label: "What to send afterwards, and who records completion" },
    ],
  },
  "CA-003/4": {
    kind: "document", title: "Stakeholder Interview Summary",
    standard: "ISO 27001 Cl 4.2 Interested parties; Cl 7.4", itemLabel: "section",
    feedsNext: "Feeds Step 5 (theme identification) and Step 8 (routing).",
    items: [
      { id: 1, label: "Who, when, and what they are accountable for" },
      { id: 2, label: "Their objectives and pressures, in their words" },
      { id: 3, label: "Where GRC currently helps or hinders them" },
      { id: 4, label: "Risks they raised that we had not identified" },
      { id: 5, label: "Anything you committed to do, and by when" },
      // Written within 24 hours because attribution and nuance decay fastest, and a summary
      // written a week later reconstructs what you now think they meant.
      { id: 6, label: "Attribution basis — named or anonymous, and what they agreed to" },
    ],
  },
  "LRC-001/3": {
    kind: "document", title: "Clarity and Plain-Language Findings",
    standard: "GDPR Art. 12 — concise, transparent, intelligible, plain language", itemLabel: "finding",
    feedsNext: "Feeds Step 5 (gap assessment) and Step 6 (redraft).",
    items: [
      { id: 1, label: "Element present but unclear 1 — the wording, and why a reader would misread it" },
      { id: 2, label: "Element present but unclear 2 — the wording, and why a reader would misread it" },
      { id: 3, label: "Element present but unclear 3 — the wording, and why a reader would misread it" },
      // Art. 12 is a standalone obligation: a notice can contain every Art. 13 element and still
      // fail because nobody can understand it.
      { id: 4, label: "Why unclear-but-present is an Art. 12 failure in its own right" },
      { id: 5, label: "Where the audience includes children or vulnerable readers, and what changes" },
    ],
  },

  // ── Validate steps ────────────────────────────────────────────────────────────────────────
  // `kind: "validate"` marks each item Verified or Unverified and demands a follow-up action on
  // anything unverified, so a check that fails cannot be recorded and then quietly abandoned.
  "CA-001/5": {
    kind: "validate", title: "Knowledge Check Administration",
    standard: "ISO 27001 A.6.3; Cl 9.1 Monitoring", itemLabel: "question",
    feedsNext: "Feeds Step 6 (scoring) and Step 8 (Training Completion Report).",
    items: [
      { id: 1, label: "Q1 result — pass rate across the group" },
      { id: 2, label: "Q2 result — pass rate across the group" },
      { id: 3, label: "Q3 result — pass rate across the group" },
      { id: 4, label: "Q4 result — pass rate across the group" },
      { id: 5, label: "Q5 result — pass rate across the group" },
      // A question most of the room fails is usually a teaching failure, not a learner failure.
      { id: 6, label: "Any question the group failed — is the question wrong, or the teaching?" },
    ],
  },
  "LRC-001/6": {
    kind: "validate", title: "Plain-Language Verification",
    standard: "GDPR Art. 12 — intelligible and plain language", itemLabel: "check",
    feedsNext: "Feeds Step 7 (mentor review) and Step 8 (approval and publication).",
    items: [
      { id: 1, label: "Readability score against the Grade 8 target" },
      { id: 2, label: "Legal terms remaining — each justified or replaced" },
      { id: 3, label: "Sentence length — longest sentence, and whether it survives" },
      { id: 4, label: "Passive constructions hiding who acts on the data" },
      // The measurable proxy and the actual obligation are not the same thing; a notice can hit
      // Grade 8 and still be incomprehensible about what it actually does.
      { id: 5, label: "Comprehension test with a real reader, beyond the readability score" },
    ],
  },
  "BCRP-002/6": {
    kind: "validate", title: "DR Checklist Talk-Through",
    standard: "ISO 27001 A.5.30 ICT readiness for business continuity", itemLabel: "step",
    feedsNext: "Feeds Step 7 (corrections) and Step 8 (filing and live-test recommendation).",
    items: [
      { id: 1, label: "Step 1 — could the named person actually perform it as written?" },
      { id: 2, label: "Step 2 — could the named person actually perform it as written?" },
      { id: 3, label: "Step 3 — could the named person actually perform it as written?" },
      { id: 4, label: "Step 4 — could the named person actually perform it as written?" },
      { id: 5, label: "Credentials and access assumed by the checklist — do they exist today?" },
      // A talk-through proves the document, never the capability; saying so keeps the assurance
      // claim honest when this is filed.
      { id: 6, label: "What this exercise could NOT prove, and now needs a live restoration test" },
    ],
  },

  // ── Schedule step ─────────────────────────────────────────────────────────────────────────
  "IE-002/8": {
    kind: "schedule", title: "Policy Review Reminders",
    standard: "ISO 27001 Cl 7.5.3 Control of documented information", itemLabel: "reminder",
    feedsNext: "Closes IE-002; the reminders sustain the document control cycle.",
    items: [
      { id: 1, label: "Overdue policies — review reminder", options: { time: ["Immediately", "Within 1 week", "Within 1 month"] } },
      { id: 2, label: "Policies due this quarter — review reminder", options: { time: ["6 weeks before due", "1 month before due", "2 weeks before due"] } },
      { id: 3, label: "Policies due next quarter — review reminder", options: { time: ["1 month before due", "2 weeks before due", "On the due date"] } },
      // A reminder addressed to a person leaves with that person; addressed to a role it does not.
      { id: 4, label: "Annual document-control health check", options: { time: ["Annually on the ISMS anniversary", "Each January", "Before the certification audit"] } },
    ],
  },

  // ── Assess step ───────────────────────────────────────────────────────────────────────────
  "TV-002/4": {
    kind: "assess", title: "Evidence Sample Evaluation",
    standard: "ISO 27001 Cl 9.2 Internal audit; A.5.35", itemLabel: "sample",
    scale: [{ label: "Non-compliant", value: 1 }, { label: "Partially compliant", value: 2 }, { label: "Compliant", value: 3 }],
    feedsNext: "Feeds Step 5 (workpaper) and Step 7 (remediation recommendations).",
    items: [
      { id: 1, label: "Policy 1, statement A — evidence sample" },
      { id: 2, label: "Policy 1, statement B — evidence sample" },
      { id: 3, label: "Policy 2, statement A — evidence sample" },
      { id: 4, label: "Policy 2, statement B — evidence sample" },
      { id: 5, label: "Policy 3, statement A — evidence sample" },
      { id: 6, label: "Policy 3, statement B — evidence sample" },
    ],
  },
};

export function getFormTask(taskCode?: string, activityCode?: string): FormTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return FORM_TASKS[`${taskCode}/${activityCode}`];
}
