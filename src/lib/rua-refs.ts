// Per-task RUA reference artifacts — the reference material the programme hands the mentee for
// Parts A & B of every RUA gate (control extracts, cross-walk sheets, template docs, prerequisite
// briefs, task description, deliverable spec, and one study primer per key concept). Built from
// the GRC101 RUA Reference Artifact Register v2 (rows carried verbatim) using the same page
// templates as the manager's RUA_Reference_Artifacts pages. View-only, rendered in-app.
// Generated — regenerate rather than hand-editing (scratchpad/generate_rua_refs.py).
import type { TaskReference } from "./taskmeta";

/** A reference artifact plus the RUA tab it belongs to. */
export interface RuaRef extends TaskReference {
  tab: "study" | "inspect" | "acquire" | "clarify" | "confirm" | "explain";
}

export const RUA_REFS: Record<string, RuaRef[]> = {
  "AA-001": [
    {
      "id": "rua-aa-001-ref-001",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.9 — Inventory of information and other associated assets; Annex A 5.12 — Classification of information; Annex A 8.1 — User…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.9 | Inventory of information and other associated assets |\n| Annex A 5.12 | Classification of information |\n| Annex A 8.1 | User endpoint devices |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-aa-001-ref-002",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — ID.AM-01 (Inventories of hardware maintained); ID.AM-02 (Inventories of software maintained); ID.AM-05 (Assets are…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | ID.AM-01 (Inventories of hardware maintained) |\n| — | ID.AM-02 (Inventories of software maintained) |\n| — | ID.AM-05 (Assets are prioritised). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-aa-001-ref-003",
      "title": "Information Asset Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet with columns: Asset ID, Asset Name, Asset Type, Owner, Location, Format, CIA Classification, Custodian, Review Date, Notes",
      "body": "Working template you obtain and review: Information Asset Register Template. spreadsheet with columns: Asset ID, Asset Name, Asset Type, Owner, Location, Format, CIA Classification, Custodian, Review Date, Notes\n\n## Structure\n| Asset ID | Asset Name | Asset Type | Owner | Location | Format | CIA Classification | Custodian | Review Date | Notes\n\nBlank template — one row per item. Populate during the task.",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-001-ref-004",
      "title": "Asset Discovery Interview Guide",
      "kind": "Template / Working Document",
      "summary": "structured question set",
      "body": "Working template you obtain and review: Asset Discovery Interview Guide. structured question set\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-001-ref-005",
      "title": "Organisation and business-unit context for CloudTech Solutions Enterprise or Apex Software Development Group",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Organisation and business-unit context for CloudTech Solutions Enterprise or Apex Software Development Group",
      "body": "Organisation and business-unit context for CloudTech Solutions Enterprise or Apex Software Development Group\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-001-ref-006",
      "title": "Confirmed IT/Operations contact for the initial systems list",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Confirmed IT/Operations contact for the initial systems list",
      "body": "Confirmed IT/Operations contact for the initial systems list\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-001-ref-007",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-AA-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-AA-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand what an information asset is, why classification matters, and how the register will be built and signed off, before any interviews or data gathering begin.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.9 — Inventory of information and other associated assets; Annex A 5.12 — Classification of information; Annex A 8.1 — User endpoint devices.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — ID.AM-01 (Inventories of hardware maintained); ID.AM-02 (Inventories of software maintained); ID.AM-05 (Assets are prioritised).\n3. Obtain and review every provided template and document: Information Asset Register Template (spreadsheet with columns: Asset ID, Asset Name, Asset Type, Owner, Location, Format, CIA Classification, Custodian, Review Date, Notes); Asset Discovery Interview Guide (structured question set).\n4. Secure prerequisite inputs: Organisation and business-unit context for CloudTech Solutions Enterprise or Apex Software Development Group; Confirmed IT/Operations contact for the initial systems list; No prior GRC 101 task outputs required — this is a foundation task.\n5. Re-read the task description and all activity steps of GRC101-AA-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Information Asset Register — a signed-off spreadsheet listing all identified assets with classification, owner, location, and residual gaps.",
      "tab": "clarify"
    },
    {
      "id": "rua-aa-001-ref-008",
      "title": "Deliverable Specification — Information Asset Register",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Information Asset Register — a signed-off spreadsheet listing all identified assets with classification, owner, location, and residual gaps.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nInformation Asset Register — a signed-off spreadsheet listing all identified assets with classification, owner, location, and residual gaps.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-aa-001-ref-009",
      "title": "Study note / primer — Information asset types: data, software, hardware, services, people and intangibles",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Information asset types: data, software, hardware, services, people and…",
      "body": "A study primer that enables you to explain, in your own words: Information asset types: data, software, hardware, services, people and intangibles.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-001-ref-010",
      "title": "Study note / primer — The CIA triad (Confidentiality, Integrity, Availability) as the basis for classification",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The CIA triad (Confidentiality, Integrity, Availability) as the basis…",
      "body": "A study primer that enables you to explain, in your own words: The CIA triad (Confidentiality, Integrity, Availability) as the basis for classification.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-001-ref-011",
      "title": "Study note / primer — Asset ownership versus custodianship — why every asset needs a named owner",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Asset ownership versus custodianship — why every asset needs a named owner",
      "body": "A study primer that enables you to explain, in your own words: Asset ownership versus custodianship — why every asset needs a named owner.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-001-ref-012",
      "title": "Study note / primer — The three-tier classification scheme (Public / Internal / Confidential) under ISO/IEC…",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The three-tier classification scheme (Public / Internal / Confidential)…",
      "body": "A study primer that enables you to explain, in your own words: The three-tier classification scheme (Public / Internal / Confidential) under ISO/IEC 27001:2022 Annex A 5.12.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-001-ref-013",
      "title": "Study note / primer — Intent of Annex A 5.9 (asset inventory) and A 8.1 (user endpoint devices)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Intent of Annex A 5.9 (asset inventory) and A 8.1 (user endpoint devices)",
      "body": "A study primer that enables you to explain, in your own words: Intent of Annex A 5.9 (asset inventory) and A 8.1 (user endpoint devices).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "AA-002": [
    {
      "id": "rua-aa-002-ref-014",
      "title": "CIS Controls v8 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Controls 1–6: Inventory of Enterprise Assets; Inventory of Software Assets; Data Protection; Secure Configuration; Account Management;…",
      "body": "The governing control references you must study before work begins, drawn from CIS Controls v8 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n|  | Controls 1–6: Inventory of Enterprise Assets |\n|  | Inventory of Software Assets |\n|  | Data Protection |\n|  | Secure Configuration |\n|  | Account Management |\n|  | Access Control Management (Implementation Group 1 sub-controls only) |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-aa-002-ref-015",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — ID.AM, PR.AA, PR.DS (Protect: Identity Management; Data Security).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | ID.AM, PR.AA, PR.DS (Protect: Identity Management |\n| — | Data Security). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-aa-002-ref-016",
      "title": "CIS Controls v8 IG1 Assessment Worksheet",
      "kind": "Template / Working Document",
      "summary": "pre-built spreadsheet with all 56 IG1 Safeguards, status dropdowns, evidence columns, and auto-scoring",
      "body": "Working template you obtain and review: CIS Controls v8 IG1 Assessment Worksheet. pre-built spreadsheet with all 56 IG1 Safeguards, status dropdowns, evidence columns, and auto-scoring\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-002-ref-017",
      "title": "Gap Analysis Report Template",
      "kind": "Template / Working Document",
      "summary": "Word with executive summary, findings table, and remediation roadmap sections",
      "body": "Working template you obtain and review: Gap Analysis Report Template. Word with executive summary, findings table, and remediation roadmap sections\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-002-ref-018",
      "title": "CIS Controls v8 IG1 Assessment Worksheet reviewed end to end",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "CIS Controls v8 IG1 Assessment Worksheet reviewed end to end",
      "body": "CIS Controls v8 IG1 Assessment Worksheet reviewed end to end\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-002-ref-019",
      "title": "Evidence-request list understood before approaching IT/operations staff",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Evidence-request list understood before approaching IT/operations staff",
      "body": "Evidence-request list understood before approaching IT/operations staff\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-002-ref-020",
      "title": "Walkthrough access to IT and operations staff confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Walkthrough access to IT and operations staff confirmed",
      "body": "Walkthrough access to IT and operations staff confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-002-ref-021",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-AA-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-AA-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the CIS Controls v8 structure, the meaning of Implementation Group 1, and evidence-based gap assessment before scheduling any walkthroughs.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references:  — Controls 1–6: Inventory of Enterprise Assets;  — Inventory of Software Assets;  — Data Protection;  — Secure Configuration;  — Account Management;  — Access Control Management (Implementation Group 1 sub-controls only).\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.DS (Protect: Identity Management; Data Security).\n3. Obtain and review every provided template and document: CIS Controls v8 IG1 Assessment Worksheet (pre-built spreadsheet with all 56 IG1 Safeguards, status dropdowns, evidence columns, and auto-scoring); Gap Analysis Report Template (Word with executive summary, findings table, and remediation roadmap sections).\n4. Secure prerequisite inputs: CIS Controls v8 IG1 Assessment Worksheet reviewed end to end; Evidence-request list understood before approaching IT/operations staff; Walkthrough access to IT and operations staff confirmed.\n5. Re-read the task description and all activity steps of GRC101-AA-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: CIS Controls v8 IG1 Gap Analysis Report — scored assessment per Control group, gap list with remediation priorities, and an executive summary.",
      "tab": "clarify"
    },
    {
      "id": "rua-aa-002-ref-022",
      "title": "Deliverable Specification — CIS Controls v8 IG1 Gap Analysis Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "CIS Controls v8 IG1 Gap Analysis Report — scored assessment per Control group, gap list with remediation priorities, and an executive…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nCIS Controls v8 IG1 Gap Analysis Report — scored assessment per Control group, gap list with remediation priorities, and an executive summary.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to CIS Controls v8 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-aa-002-ref-023",
      "title": "Study note / primer — CIS Controls v8 structure: 18 Controls, safeguards, and Implementation Groups (IG1/IG2/IG3)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: CIS Controls v8 structure: 18 Controls, safeguards, and Implementation…",
      "body": "A study primer that enables you to explain, in your own words: CIS Controls v8 structure: 18 Controls, safeguards, and Implementation Groups (IG1/IG2/IG3).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-002-ref-024",
      "title": "Study note / primer — Why IG1's 56 Safeguards represent essential cyber hygiene",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Why IG1's 56 Safeguards represent essential cyber hygiene",
      "body": "A study primer that enables you to explain, in your own words: Why IG1's 56 Safeguards represent essential cyber hygiene.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-002-ref-025",
      "title": "Study note / primer — Assessment statuses: Implemented / Partial / Not Implemented / Not Applicable",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Assessment statuses: Implemented / Partial / Not Implemented / Not…",
      "body": "A study primer that enables you to explain, in your own words: Assessment statuses: Implemented / Partial / Not Implemented / Not Applicable.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-002-ref-026",
      "title": "Study note / primer — Evidence-based assessment versus self-attestation",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Evidence-based assessment versus self-attestation",
      "body": "A study primer that enables you to explain, in your own words: Evidence-based assessment versus self-attestation.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-002-ref-027",
      "title": "Study note / primer — Compliance percentage scoring per Control group and gap prioritisation by risk exposure",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Compliance percentage scoring per Control group and gap prioritisation…",
      "body": "A study primer that enables you to explain, in your own words: Compliance percentage scoring per Control group and gap prioritisation by risk exposure.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "AA-003": [
    {
      "id": "rua-aa-003-ref-028",
      "title": "GDPR (EU) 2016/679 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Article 4 (Definitions — personal data, processing, controller, processor); Article 13 & 14 (Information to be provided); Article 30…",
      "body": "The governing control references you must study before work begins, drawn from GDPR (EU) 2016/679 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Article 4 (Definitions | personal data, processing, controller, processor) |\n|  | Article 13 & 14 (Information to be provided) |\n| Article 30 (Records of processing activities | RoPA) |\n|  | Article 35 (Data protection impact assessment screening) |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-aa-003-ref-029",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.OC-05 (Legal, regulatory and contractual requirements are understood); ID.AM-08 (Systems/services involving external…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.OC-05 (Legal, regulatory and contractual requirements are understood) |\n| — | ID.AM-08 (Systems/services involving external parties are inventoried). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-aa-003-ref-030",
      "title": "RoPA Template",
      "kind": "Template / Working Document",
      "summary": "Article 30-compliant spreadsheet: processing activity, purposes, legal basis, data categories, data subjects, recipients, retention,…",
      "body": "Working template you obtain and review: RoPA Template. Article 30-compliant spreadsheet: processing activity, purposes, legal basis, data categories, data subjects, recipients, retention, transfers, security measures\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-003-ref-031",
      "title": "DPIA Screening Checklist",
      "kind": "Template / Working Document",
      "summary": "nine-criteria Word form",
      "body": "Working template you obtain and review: DPIA Screening Checklist. nine-criteria Word form\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-003-ref-032",
      "title": "Data Flow Diagram Template",
      "kind": "Template / Working Document",
      "summary": "Visio/draw.io swimlane template",
      "body": "Working template you obtain and review: Data Flow Diagram Template. Visio/draw.io swimlane template\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-aa-003-ref-033",
      "title": "Candidate data-heavy processes identified (e.g. student registration, account sign-up)",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Candidate data-heavy processes identified (e.g. student registration, account sign-up)",
      "body": "Candidate data-heavy processes identified (e.g. student registration, account sign-up)\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-003-ref-034",
      "title": "RoPA Template, DPIA Screening Checklist and Data Flow Diagram Template reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "RoPA Template, DPIA Screening Checklist and Data Flow Diagram Template reviewed",
      "body": "RoPA Template, DPIA Screening Checklist and Data Flow Diagram Template reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-003-ref-035",
      "title": "Process-owner access confirmed via the mentor",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Process-owner access confirmed via the mentor",
      "body": "Process-owner access confirmed via the mentor\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-aa-003-ref-036",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-AA-003",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-AA-003. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand core GDPR definitions, lawful bases, and the purpose of RoPA and DPIA screening before selecting a process or interviewing its owner.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Article 4 (Definitions — personal data, processing, controller, processor);  — Article 13 & 14 (Information to be provided); Article 30 (Records of processing activities — RoPA);  — Article 35 (Data protection impact assessment screening).\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.OC-05 (Legal, regulatory and contractual requirements are understood); ID.AM-08 (Systems/services involving external parties are inventoried).\n3. Obtain and review every provided template and document: RoPA Template (Article 30-compliant spreadsheet: processing activity, purposes, legal basis, data categories, data subjects, recipients, retention, transfers, security measures); DPIA Screening Checklist (nine-criteria Word form); Data Flow Diagram Template (Visio/draw.io swimlane template).\n4. Secure prerequisite inputs: Candidate data-heavy processes identified (e.g. student registration, account sign-up); RoPA Template, DPIA Screening Checklist and Data Flow Diagram Template reviewed; Process-owner access confirmed via the mentor.\n5. Re-read the task description and all activity steps of GRC101-AA-003; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Completed RoPA Entry (for one process) + DPIA Screening Form with disposition (full DPIA required / not required) and supporting data-flow diagram.",
      "tab": "clarify"
    },
    {
      "id": "rua-aa-003-ref-037",
      "title": "Deliverable Specification — Completed RoPA Entry (for one process) + DPIA Screening Form with disposition (full DPIA…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Completed RoPA Entry (for one process) + DPIA Screening Form with disposition (full DPIA required / not required) and supporting…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nCompleted RoPA Entry (for one process) + DPIA Screening Form with disposition (full DPIA required / not required) and supporting data-flow diagram.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to GDPR (EU) 2016/679 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-aa-003-ref-038",
      "title": "Study note / primer — GDPR Article 4 definitions: personal data, processing, controller, processor",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: GDPR Article 4 definitions: personal data, processing, controller, processor",
      "body": "A study primer that enables you to explain, in your own words: GDPR Article 4 definitions: personal data, processing, controller, processor.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-003-ref-039",
      "title": "Study note / primer — The six lawful bases for processing under Article 6",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The six lawful bases for processing under Article 6",
      "body": "A study primer that enables you to explain, in your own words: The six lawful bases for processing under Article 6.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-003-ref-040",
      "title": "Study note / primer — Records of Processing Activities (RoPA) under Article 30 — purpose and mandatory fields",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Records of Processing Activities (RoPA) under Article 30 — purpose and…",
      "body": "A study primer that enables you to explain, in your own words: Records of Processing Activities (RoPA) under Article 30 — purpose and mandatory fields.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-003-ref-041",
      "title": "Study note / primer — DPIA screening: the nine-criteria test per EDPB guidelines (Article 35)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: DPIA screening: the nine-criteria test per EDPB guidelines (Article 35)",
      "body": "A study primer that enables you to explain, in your own words: DPIA screening: the nine-criteria test per EDPB guidelines (Article 35).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-aa-003-ref-042",
      "title": "Study note / primer — Cross-border transfer basics and third-party recipients",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Cross-border transfer basics and third-party recipients",
      "body": "A study primer that enables you to explain, in your own words: Cross-border transfer basics and third-party recipients.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "GRM-001": [
    {
      "id": "rua-grm-001-ref-043",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 6.1.2 — Information security risk assessment; Clause 6.1.3 — Information security risk treatment; Annex A 5.9 — Inventory of…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 6.1.2 | Information security risk assessment |\n| Clause 6.1.3 | Information security risk treatment |\n| Annex A 5.9 | Inventory of information and other associated assets |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-grm-001-ref-044",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.RM-01 (Risk management objectives established); ID.RA-01 (Vulnerabilities identified); ID.RA-04 (Potential impacts and…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.RM-01 (Risk management objectives established) |\n| — | ID.RA-01 (Vulnerabilities identified) |\n| — | ID.RA-04 (Potential impacts and likelihoods determined). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-grm-001-ref-045",
      "title": "Risk Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Risk ID, Description, Threat Source, Asset Affected, Existing Controls, Likelihood, Impact, Inherent Score, Risk Category,…",
      "body": "Working template you obtain and review: Risk Register Template. spreadsheet: Risk ID, Description, Threat Source, Asset Affected, Existing Controls, Likelihood, Impact, Inherent Score, Risk Category, Treatment Option, Risk Owner, Target Residual Score, Review Date\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-001-ref-046",
      "title": "5×5 Risk Matrix Reference Card",
      "kind": "Template / Working Document",
      "summary": "5×5 Risk Matrix Reference Card",
      "body": "Working template you obtain and review: 5×5 Risk Matrix Reference Card.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-001-ref-047",
      "title": "Risk Identification Workshop Guide",
      "kind": "Template / Working Document",
      "summary": "Risk Identification Workshop Guide",
      "body": "Working template you obtain and review: Risk Identification Workshop Guide.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-001-ref-048",
      "title": "Asset register from GRC101-AA-001 (or the provided equivalent) reviewed to understand the risk surface",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Asset register from GRC101-AA-001 (or the provided equivalent) reviewed to understand the risk surface",
      "body": "Asset register from GRC101-AA-001 (or the provided equivalent) reviewed to understand the risk surface\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-001-ref-049",
      "title": "Risk Identification Workshop Guide and 5×5 Risk Matrix Reference Card studied",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Risk Identification Workshop Guide and 5×5 Risk Matrix Reference Card studied",
      "body": "Risk Identification Workshop Guide and 5×5 Risk Matrix Reference Card studied\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-001-ref-050",
      "title": "Workshop access to two business-unit managers confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Workshop access to two business-unit managers confirmed",
      "body": "Workshop access to two business-unit managers confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-001-ref-051",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-GRM-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-GRM-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you can think in risk terms — threat, likelihood, impact, inherent versus residual — and understands the 5×5 matrix and treatment options before facilitating any workshop.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 6.1.2 — Information security risk assessment; Clause 6.1.3 — Information security risk treatment; Annex A 5.9 — Inventory of information and other associated assets.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.RM-01 (Risk management objectives established); ID.RA-01 (Vulnerabilities identified); ID.RA-04 (Potential impacts and likelihoods determined).\n3. Obtain and review every provided template and document: Risk Register Template (spreadsheet: Risk ID, Description, Threat Source, Asset Affected, Existing Controls, Likelihood, Impact, Inherent Score, Risk Category, Treatment Option, Risk Owner, Target Residual Score, Review Date); 5×5 Risk Matrix Reference Card; Risk Identification Workshop Guide.\n4. Secure prerequisite inputs: Asset register from GRC101-AA-001 (or the provided equivalent) reviewed to understand the risk surface; Risk Identification Workshop Guide and 5×5 Risk Matrix Reference Card studied; Workshop access to two business-unit managers confirmed.\n5. Re-read the task description and all activity steps of GRC101-GRM-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Basic Risk Register — spreadsheet with all identified risks scored on a 5×5 matrix, ISO 27001 control domain mapping, risk treatment options, and a one-page management summary.",
      "tab": "clarify"
    },
    {
      "id": "rua-grm-001-ref-052",
      "title": "Deliverable Specification — Basic Risk Register",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Basic Risk Register — spreadsheet with all identified risks scored on a 5×5 matrix, ISO 27001 control domain mapping, risk treatment…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nBasic Risk Register — spreadsheet with all identified risks scored on a 5×5 matrix, ISO 27001 control domain mapping, risk treatment options, and a one-page management summary.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-grm-001-ref-053",
      "title": "Study note / primer — Threat, vulnerability, likelihood and impact, and how they combine into a risk score",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Threat, vulnerability, likelihood and impact, and how they combine into…",
      "body": "A study primer that enables you to explain, in your own words: Threat, vulnerability, likelihood and impact, and how they combine into a risk score.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-001-ref-054",
      "title": "Study note / primer — Inherent versus residual risk and the effect of existing controls",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Inherent versus residual risk and the effect of existing controls",
      "body": "A study primer that enables you to explain, in your own words: Inherent versus residual risk and the effect of existing controls.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-001-ref-055",
      "title": "Study note / primer — The 5×5 risk matrix and Critical / High / Medium / Low categorisation",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The 5×5 risk matrix and Critical / High / Medium / Low categorisation",
      "body": "A study primer that enables you to explain, in your own words: The 5×5 risk matrix and Critical / High / Medium / Low categorisation.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-001-ref-056",
      "title": "Study note / primer — STRIDE-lite prompt categories for structured risk identification",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: STRIDE-lite prompt categories for structured risk identification",
      "body": "A study primer that enables you to explain, in your own words: STRIDE-lite prompt categories for structured risk identification.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-001-ref-057",
      "title": "Study note / primer — Risk treatment options: accept, mitigate, transfer, avoid (ISO 27001 Clauses 6.1.2 and 6.1.3)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Risk treatment options: accept, mitigate, transfer, avoid (ISO 27001…",
      "body": "A study primer that enables you to explain, in your own words: Risk treatment options: accept, mitigate, transfer, avoid (ISO 27001 Clauses 6.1.2 and 6.1.3).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "GRM-002": [
    {
      "id": "rua-grm-002-ref-058",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 5.2 — Policy; Annex A 5.1 — Policies for information security; Annex A 6.7 — Remote working; Annex A 8.1 — User endpoint devices.",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 5.2 | Policy |\n| Annex A 5.1 | Policies for information security |\n| Annex A 6.7 | Remote working |\n| Annex A 8.1 | User endpoint devices |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-grm-002-ref-059",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.PO-01 (Policy for managing cybersecurity risks established); GV.PO-02 (Policy reviewed, updated, and communicated).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.PO-01 (Policy for managing cybersecurity risks established) |\n| — | GV.PO-02 (Policy reviewed, updated, and communicated). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-grm-002-ref-060",
      "title": "Policy Template",
      "kind": "Template / Working Document",
      "summary": "Word document with standard headers: Document Control, Purpose, Scope, Definitions, Policy Statements, Roles and Responsibilities,…",
      "body": "Working template you obtain and review: Policy Template. Word document with standard headers: Document Control, Purpose, Scope, Definitions, Policy Statements, Roles and Responsibilities, Exceptions, Related Documents, Review History\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-002-ref-061",
      "title": "Policy Review Comment Sheet",
      "kind": "Template / Working Document",
      "summary": "Policy Review Comment Sheet",
      "body": "Working template you obtain and review: Policy Review Comment Sheet.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-002-ref-062",
      "title": "Policy Approval and Sign-Off Form",
      "kind": "Template / Working Document",
      "summary": "Policy Approval and Sign-Off Form",
      "body": "Working template you obtain and review: Policy Approval and Sign-Off Form.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-002-ref-063",
      "title": "Policy Register",
      "kind": "Template / Working Document",
      "summary": "spreadsheet",
      "body": "Working template you obtain and review: Policy Register. spreadsheet\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-002-ref-064",
      "title": "Two existing policies from the organisation's document library read for tone and structure",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Two existing policies from the organisation's document library read for tone and structure",
      "body": "Two existing policies from the organisation's document library read for tone and structure\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-002-ref-065",
      "title": "Policy Template, Policy Review Comment Sheet, Approval Form and Policy Register reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Policy Template, Policy Review Comment Sheet, Approval Form and Policy Register reviewed",
      "body": "Policy Template, Policy Review Comment Sheet, Approval Form and Policy Register reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-002-ref-066",
      "title": "Policy type shortlist (AUP or Remote Working) discussed with the mentor",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Policy type shortlist (AUP or Remote Working) discussed with the mentor",
      "body": "Policy type shortlist (AUP or Remote Working) discussed with the mentor\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-002-ref-067",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-GRM-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-GRM-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand what a policy is (and is not), what ISO 27001 Clause 5.2 requires of it, and how the review-and-approval cycle works before drafting begins.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 5.2 — Policy; Annex A 5.1 — Policies for information security; Annex A 6.7 — Remote working; Annex A 8.1 — User endpoint devices.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.PO-01 (Policy for managing cybersecurity risks established); GV.PO-02 (Policy reviewed, updated, and communicated).\n3. Obtain and review every provided template and document: Policy Template (Word document with standard headers: Document Control, Purpose, Scope, Definitions, Policy Statements, Roles and Responsibilities, Exceptions, Related Documents, Review History); Policy Review Comment Sheet; Policy Approval and Sign-Off Form; Policy Register (spreadsheet).\n4. Secure prerequisite inputs: Two existing policies from the organisation's document library read for tone and structure; Policy Template, Policy Review Comment Sheet, Approval Form and Policy Register reviewed; Policy type shortlist (AUP or Remote Working) discussed with the mentor.\n5. Re-read the task description and all activity steps of GRC101-GRM-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Approved Information Security Policy (AUP or Remote Working Policy) — final version with ISO 27001 control references, management signature, and Policy Register entry.",
      "tab": "clarify"
    },
    {
      "id": "rua-grm-002-ref-068",
      "title": "Deliverable Specification — Approved Information Security Policy (AUP or Remote Working Policy)",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Approved Information Security Policy (AUP or Remote Working Policy) — final version with ISO 27001 control references, management…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nApproved Information Security Policy (AUP or Remote Working Policy) — final version with ISO 27001 control references, management signature, and Policy Register entry.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-grm-002-ref-069",
      "title": "Study note / primer — Policy versus procedure versus standard versus guideline",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Policy versus procedure versus standard versus guideline",
      "body": "A study primer that enables you to explain, in your own words: Policy versus procedure versus standard versus guideline.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-002-ref-070",
      "title": "Study note / primer — ISO 27001:2022 Clause 5.2 requirements for an information security policy",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001:2022 Clause 5.2 requirements for an information security policy",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001:2022 Clause 5.2 requirements for an information security policy.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-002-ref-071",
      "title": "Study note / primer — Mapping policy statements to Annex A controls (A 5.1, A 6.7, A 8.1)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Mapping policy statements to Annex A controls (A 5.1, A 6.7, A 8.1)",
      "body": "A study primer that enables you to explain, in your own words: Mapping policy statements to Annex A controls (A 5.1, A 6.7, A 8.1).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-002-ref-072",
      "title": "Study note / primer — Document control basics: versioning, review cycles, the Policy Register",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Document control basics: versioning, review cycles, the Policy Register",
      "body": "A study primer that enables you to explain, in your own words: Document control basics: versioning, review cycles, the Policy Register.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-002-ref-073",
      "title": "Study note / primer — The structured review cycle: reviewer roles, comment sheets, approval and sign-off",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The structured review cycle: reviewer roles, comment sheets, approval…",
      "body": "A study primer that enables you to explain, in your own words: The structured review cycle: reviewer roles, comment sheets, approval and sign-off.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "GRM-003": [
    {
      "id": "rua-grm-003-ref-074",
      "title": "NIST CSF 2.0 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Tier Definitions (Tier 1 Partial → Tier 4 Adaptive); GV.OC — Organizational Context; GV.RM — Risk Management Strategy; GV.PO — Policy.",
      "body": "The governing control references you must study before work begins, drawn from NIST CSF 2.0 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n|  | Tier Definitions (Tier 1 Partial → Tier 4 Adaptive) |\n| GV.OC | Organizational Context |\n| GV.RM | Risk Management Strategy |\n| GV.PO | Policy |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-grm-003-ref-075",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — All six Functions (Govern, Identify, Protect, Detect, Respond, Recover) assessed at Tier level; ISO 27001:2022 — Clause…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | All six Functions (Govern, Identify, Protect, Detect, Respond, Recover) assessed at Tier level |\n| — | ISO 27001:2022 — Clause 9.1 (Monitoring, measurement, analysis and evaluation). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-grm-003-ref-076",
      "title": "NIST CSF 2.0 Maturity Assessment Questionnaire",
      "kind": "Template / Working Document",
      "summary": "Word — 6 Function tabs, 10–15 questions each with Tier anchors",
      "body": "Working template you obtain and review: NIST CSF 2.0 Maturity Assessment Questionnaire. Word — 6 Function tabs, 10–15 questions each with Tier anchors\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-003-ref-077",
      "title": "CSF Maturity Spider Diagram",
      "kind": "Template / Working Document",
      "summary": "Excel — auto-plots from scores",
      "body": "Working template you obtain and review: CSF Maturity Spider Diagram. Excel — auto-plots from scores\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-003-ref-078",
      "title": "Maturity Assessment Report Template",
      "kind": "Template / Working Document",
      "summary": "Word with cover page, scoring table, diagram placeholder, and roadmap section",
      "body": "Working template you obtain and review: Maturity Assessment Report Template. Word with cover page, scoring table, diagram placeholder, and roadmap section\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-grm-003-ref-079",
      "title": "NIST CSF 2.0 Maturity Assessment Questionnaire reviewed across all six Function tabs",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "NIST CSF 2.0 Maturity Assessment Questionnaire reviewed across all six Function tabs",
      "body": "NIST CSF 2.0 Maturity Assessment Questionnaire reviewed across all six Function tabs\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-003-ref-080",
      "title": "CSF Maturity Spider Diagram tool tested with dummy scores",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "CSF Maturity Spider Diagram tool tested with dummy scores",
      "body": "CSF Maturity Spider Diagram tool tested with dummy scores\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-003-ref-081",
      "title": "90-minute interview slot with the department head and IT lead confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "90-minute interview slot with the department head and IT lead confirmed",
      "body": "90-minute interview slot with the department head and IT lead confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-grm-003-ref-082",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-GRM-003",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-GRM-003. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the NIST CSF 2.0 Functions and Tier model, and the difference between maturity and compliance, before adapting the questionnaire or booking interviews.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references:  — Tier Definitions (Tier 1 Partial → Tier 4 Adaptive); GV.OC — Organizational Context; GV.RM — Risk Management Strategy; GV.PO — Policy.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — Functions (Govern, Identify, Protect, Detect, Respond, Recover); Clause 9.1 (Monitoring, measurement, analysis and evaluation).\n3. Obtain and review every provided template and document: NIST CSF 2.0 Maturity Assessment Questionnaire (Word — 6 Function tabs, 10–15 questions each with Tier anchors); CSF Maturity Spider Diagram (Excel — auto-plots from scores); Maturity Assessment Report Template (Word with cover page, scoring table, diagram placeholder, and roadmap section).\n4. Secure prerequisite inputs: NIST CSF 2.0 Maturity Assessment Questionnaire reviewed across all six Function tabs; CSF Maturity Spider Diagram tool tested with dummy scores; 90-minute interview slot with the department head and IT lead confirmed.\n5. Re-read the task description and all activity steps of GRC101-GRM-003; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: GRC Maturity Assessment Report — CSF Tier scoring per Function, spider diagram (current vs. target state), top-three gap narrative, and a prioritised improvement roadmap.",
      "tab": "clarify"
    },
    {
      "id": "rua-grm-003-ref-083",
      "title": "Deliverable Specification — GRC Maturity Assessment Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "GRC Maturity Assessment Report — CSF Tier scoring per Function, spider diagram (current vs. target state), top-three gap narrative, and…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nGRC Maturity Assessment Report — CSF Tier scoring per Function, spider diagram (current vs. target state), top-three gap narrative, and a prioritised improvement roadmap.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to NIST CSF 2.0 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-grm-003-ref-084",
      "title": "Study note / primer — The six NIST CSF 2.0 Functions: Govern, Identify, Protect, Detect, Respond, Recover",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The six NIST CSF 2.0 Functions: Govern, Identify, Protect, Detect,…",
      "body": "A study primer that enables you to explain, in your own words: The six NIST CSF 2.0 Functions: Govern, Identify, Protect, Detect, Respond, Recover.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-003-ref-085",
      "title": "Study note / primer — Tier definitions: 1 Partial, 2 Risk-Informed, 3 Repeatable, 4 Adaptive",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Tier definitions: 1 Partial, 2 Risk-Informed, 3 Repeatable, 4 Adaptive",
      "body": "A study primer that enables you to explain, in your own words: Tier definitions: 1 Partial, 2 Risk-Informed, 3 Repeatable, 4 Adaptive.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-003-ref-086",
      "title": "Study note / primer — Maturity versus compliance — why they are different measurements",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Maturity versus compliance — why they are different measurements",
      "body": "A study primer that enables you to explain, in your own words: Maturity versus compliance — why they are different measurements.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-003-ref-087",
      "title": "Study note / primer — Interview-based scoring with Tier anchors and justification notes",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Interview-based scoring with Tier anchors and justification notes",
      "body": "A study primer that enables you to explain, in your own words: Interview-based scoring with Tier anchors and justification notes.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-grm-003-ref-088",
      "title": "Study note / primer — Current-state versus target-state profiling and the spider diagram",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Current-state versus target-state profiling and the spider diagram",
      "body": "A study primer that enables you to explain, in your own words: Current-state versus target-state profiling and the spider diagram.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "CRM-001": [
    {
      "id": "rua-crm-001-ref-089",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 4.1 — Understanding the organisation and its context; Clause 4.2 — Understanding the needs and expectations of interested…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 4.1 | Understanding the organisation and its context |\n| Clause 4.2 | Understanding the needs and expectations of interested parties |\n| Annex A 5.31 | Legal, statutory, regulatory and contractual requirements |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-crm-001-ref-090",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.OC-03 (Legal, regulatory, and contractual requirements understood and managed); GV.OC-05 (Outcomes, capabilities, and…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.OC-03 (Legal, regulatory, and contractual requirements understood and managed) |\n| — | GV.OC-05 (Outcomes, capabilities, and services that the organisation depends on are understood). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-crm-001-ref-091",
      "title": "Regulatory Obligations Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Obligation ID, Source/Regulation, Specific Requirement, Jurisdiction, Applicability Rationale, ISO 27001 Mapping, Control…",
      "body": "Working template you obtain and review: Regulatory Obligations Register Template. spreadsheet: Obligation ID, Source/Regulation, Specific Requirement, Jurisdiction, Applicability Rationale, ISO 27001 Mapping, Control Owner, Compliance Status, Evidence Reference, Gap Flag, Next Review Date\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-001-ref-092",
      "title": "Regulatory Scoping Interview Guide",
      "kind": "Template / Working Document",
      "summary": "Word",
      "body": "Working template you obtain and review: Regulatory Scoping Interview Guide. Word\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-001-ref-093",
      "title": "Organisation's jurisdiction(s) and sector regulatory landscape researched at a high level",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Organisation's jurisdiction(s) and sector regulatory landscape researched at a high level",
      "body": "Organisation's jurisdiction(s) and sector regulatory landscape researched at a high level\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-001-ref-094",
      "title": "Regulatory Scoping Interview Guide reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Regulatory Scoping Interview Guide reviewed",
      "body": "Regulatory Scoping Interview Guide reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-001-ref-095",
      "title": "Legal/Compliance contact and IT Manager interview slots confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Legal/Compliance contact and IT Manager interview slots confirmed",
      "body": "Legal/Compliance contact and IT Manager interview slots confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-001-ref-096",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-CRM-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-CRM-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the four categories of obligations, how applicability is determined, and why the register anchors all later compliance work, before any scoping interviews.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 4.1 — Understanding the organisation and its context; Clause 4.2 — Understanding the needs and expectations of interested parties; Annex A 5.31 — Legal, statutory, regulatory and contractual requirements.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.OC-03 (Legal, regulatory, and contractual requirements understood and managed); GV.OC-05 (Outcomes, capabilities, and services that the organisation depends on are understood).\n3. Obtain and review every provided template and document: Regulatory Obligations Register Template (spreadsheet: Obligation ID, Source/Regulation, Specific Requirement, Jurisdiction, Applicability Rationale, ISO 27001 Mapping, Control Owner, Compliance Status, Evidence Reference, Gap Flag, Next Review Date); Regulatory Scoping Interview Guide (Word).\n4. Secure prerequisite inputs: Organisation's jurisdiction(s) and sector regulatory landscape researched at a high level; Regulatory Scoping Interview Guide reviewed; Legal/Compliance contact and IT Manager interview slots confirmed.\n5. Re-read the task description and all activity steps of GRC101-CRM-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Regulatory Obligations Register — a signed-off spreadsheet listing all applicable requirements with control mapping, compliance status, owner, and gap flags.",
      "tab": "clarify"
    },
    {
      "id": "rua-crm-001-ref-097",
      "title": "Deliverable Specification — Regulatory Obligations Register",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Regulatory Obligations Register — a signed-off spreadsheet listing all applicable requirements with control mapping, compliance status,…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nRegulatory Obligations Register — a signed-off spreadsheet listing all applicable requirements with control mapping, compliance status, owner, and gap flags.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-crm-001-ref-098",
      "title": "Study note / primer — Four obligation categories: legislation, sector-specific regulation, contractual obligations,…",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Four obligation categories: legislation, sector-specific regulation,…",
      "body": "A study primer that enables you to explain, in your own words: Four obligation categories: legislation, sector-specific regulation, contractual obligations, voluntary standards.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-001-ref-099",
      "title": "Study note / primer — ISO 27001 Clauses 4.1 and 4.2 — organisational context and interested parties",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001 Clauses 4.1 and 4.2 — organisational context and interested…",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001 Clauses 4.1 and 4.2 — organisational context and interested parties.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-001-ref-100",
      "title": "Study note / primer — Annex A 5.31 — legal, statutory, regulatory and contractual requirements",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Annex A 5.31 — legal, statutory, regulatory and contractual requirements",
      "body": "A study primer that enables you to explain, in your own words: Annex A 5.31 — legal, statutory, regulatory and contractual requirements.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-001-ref-101",
      "title": "Study note / primer — Applicability rationale — documenting why an obligation applies",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Applicability rationale — documenting why an obligation applies",
      "body": "A study primer that enables you to explain, in your own words: Applicability rationale — documenting why an obligation applies.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-001-ref-102",
      "title": "Study note / primer — Compliance status ratings (Met / Partial / Gap) and review scheduling",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Compliance status ratings (Met / Partial / Gap) and review scheduling",
      "body": "A study primer that enables you to explain, in your own words: Compliance status ratings (Met / Partial / Gap) and review scheduling.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "CRM-002": [
    {
      "id": "rua-crm-002-ref-103",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A — All 93 controls across 4 Themes: Organisational (37), People (8), Physical (14), Technological (34).",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A | All 93 controls across 4 Themes: Organisational (37), People (8), Physical (14), Technological (34) |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-crm-002-ref-104",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — All Functions (cross-walk between ISO 27001 Annex A and NIST CSF Categories/Subcategories).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | All Functions (cross-walk between ISO 27001 Annex A and NIST CSF Categories/Subcategories). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-crm-002-ref-105",
      "title": "ISO 27001 Control Applicability Matrix Template",
      "kind": "Template / Working Document",
      "summary": "Excel — 93 Annex A controls as rows, business processes as columns, with status dropdowns and auto-gap count",
      "body": "Working template you obtain and review: ISO 27001 Control Applicability Matrix Template. Excel — 93 Annex A controls as rows, business processes as columns, with status dropdowns and auto-gap count\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-002-ref-106",
      "title": "Control Applicability Worksheet",
      "kind": "Template / Working Document",
      "summary": "Word — per-process question prompts",
      "body": "Working template you obtain and review: Control Applicability Worksheet. Word — per-process question prompts\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-002-ref-107",
      "title": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet",
      "kind": "Template / Working Document",
      "summary": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet",
      "body": "Working template you obtain and review: NIST CSF to ISO 27001 Cross-Walk Reference Sheet.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-002-ref-108",
      "title": "Candidate business processes discussed with the mentor (onboarding, release, backup, vendor contracting, incident…",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Candidate business processes discussed with the mentor (onboarding, release, backup, vendor contracting, incident logging)",
      "body": "Candidate business processes discussed with the mentor (onboarding, release, backup, vendor contracting, incident logging)\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-002-ref-109",
      "title": "Control Applicability Matrix Template and per-process Worksheet reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Control Applicability Matrix Template and per-process Worksheet reviewed",
      "body": "Control Applicability Matrix Template and per-process Worksheet reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-002-ref-110",
      "title": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet skimmed for orientation",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet skimmed for orientation",
      "body": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet skimmed for orientation\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-002-ref-111",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-CRM-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-CRM-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you know the Annex A control structure and can reason about control applicability per business process before selecting processes or building the matrix.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A — All 93 controls across 4 Themes: Organisational (37), People (8), Physical (14), Technological (34).\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — Functions (cross-walk between ISO 27001 Annex A and NIST CSF Categories/Subcategories).\n3. Obtain and review every provided template and document: ISO 27001 Control Applicability Matrix Template (Excel — 93 Annex A controls as rows, business processes as columns, with status dropdowns and auto-gap count); Control Applicability Worksheet (Word — per-process question prompts); NIST CSF to ISO 27001 Cross-Walk Reference Sheet.\n4. Secure prerequisite inputs: Candidate business processes discussed with the mentor (onboarding, release, backup, vendor contracting, incident logging); Control Applicability Matrix Template and per-process Worksheet reviewed; NIST CSF to ISO 27001 Cross-Walk Reference Sheet skimmed for orientation.\n5. Re-read the task description and all activity steps of GRC101-CRM-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: ISO 27001 Control Matrix (Process-to-Control Mapping) — a spreadsheet mapping 5 business processes × 93 Annex A controls with applicability, implementation status, control owner, and gap summary.",
      "tab": "clarify"
    },
    {
      "id": "rua-crm-002-ref-112",
      "title": "Deliverable Specification — ISO 27001 Control Matrix (Process-to-Control Mapping)",
      "kind": "Deliverable Acceptance Specification",
      "summary": "ISO 27001 Control Matrix (Process-to-Control Mapping) — a spreadsheet mapping 5 business processes × 93 Annex A controls with…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nISO 27001 Control Matrix (Process-to-Control Mapping) — a spreadsheet mapping 5 business processes × 93 Annex A controls with applicability, implementation status, control owner, and gap summary.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-crm-002-ref-113",
      "title": "Study note / primer — ISO 27001:2022 Annex A structure: 93 controls across Organisational (37), People (8), Physical…",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001:2022 Annex A structure: 93 controls across Organisational…",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001:2022 Annex A structure: 93 controls across Organisational (37), People (8), Physical (14), Technological (34) themes.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-002-ref-114",
      "title": "Study note / primer — Control applicability rationale: applicable / not applicable / partially applicable",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Control applicability rationale: applicable / not applicable / partially…",
      "body": "A study primer that enables you to explain, in your own words: Control applicability rationale: applicable / not applicable / partially applicable.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-002-ref-115",
      "title": "Study note / primer — Process view versus control view of an organisation",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Process view versus control view of an organisation",
      "body": "A study primer that enables you to explain, in your own words: Process view versus control view of an organisation.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-002-ref-116",
      "title": "Study note / primer — The control matrix as a process × control grid and its relationship to the Statement of…",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The control matrix as a process × control grid and its relationship to…",
      "body": "A study primer that enables you to explain, in your own words: The control matrix as a process × control grid and its relationship to the Statement of Applicability.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-002-ref-117",
      "title": "Study note / primer — Implementation status evidence and control ownership",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Implementation status evidence and control ownership",
      "body": "A study primer that enables you to explain, in your own words: Implementation status evidence and control ownership.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "CRM-003": [
    {
      "id": "rua-crm-003-ref-118",
      "title": "SOC 2 Type II (AICPA Trust Services Criteria) — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "CC1–CC9 (Common Criteria — Security); A1 (Availability — awareness); C1 (Confidentiality — awareness).",
      "body": "The governing control references you must study before work begins, drawn from SOC 2 Type II (AICPA Trust Services Criteria) — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| CC1–CC9 (Common Criteria | Security) |\n| A1 (Availability | awareness) |\n| C1 (Confidentiality | awareness) |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-crm-003-ref-119",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.PO, PR.AA, PR.DS (Policy; Identity Management; Data Security) cross-walked to TSC Common Criteria.",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.PO, PR.AA, PR.DS (Policy |\n| — | Identity Management |\n| — | Data Security) cross-walked to TSC Common Criteria. |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-crm-003-ref-120",
      "title": "SOC 2 Common Criteria Mapping Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: CC ID, Criterion Description, Example Audit Test, Internal Control Reference, Evidence Type, Gap Flag, RAG Status",
      "body": "Working template you obtain and review: SOC 2 Common Criteria Mapping Template. spreadsheet: CC ID, Criterion Description, Example Audit Test, Internal Control Reference, Evidence Type, Gap Flag, RAG Status\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-003-ref-121",
      "title": "SOC 2 Awareness Briefing Template",
      "kind": "Template / Working Document",
      "summary": "Word, 2-page format",
      "body": "Working template you obtain and review: SOC 2 Awareness Briefing Template. Word, 2-page format\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-003-ref-122",
      "title": "Sample anonymised SOC 2 Type II report",
      "kind": "Template / Working Document",
      "summary": "provided by mentor for learning purposes",
      "body": "Working template you obtain and review: Sample anonymised SOC 2 Type II report. provided by mentor for learning purposes\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-crm-003-ref-123",
      "title": "Sample anonymised SOC 2 Type II report obtained from the mentor",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Sample anonymised SOC 2 Type II report obtained from the mentor",
      "body": "Sample anonymised SOC 2 Type II report obtained from the mentor\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-003-ref-124",
      "title": "CC Mapping worksheet template reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "CC Mapping worksheet template reviewed",
      "body": "CC Mapping worksheet template reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-003-ref-125",
      "title": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained where available for cross-reference",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained where available for cross-reference",
      "body": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained where available for cross-reference\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-crm-003-ref-126",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-CRM-003",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-CRM-003. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand what a SOC 2 Type II report is, how the Trust Services Criteria are organised, and how audit evidence works before annotating the sample report.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: CC1–CC9 (Common Criteria — Security); A1 (Availability — awareness); C1 (Confidentiality — awareness).\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.DS (Policy; Identity Management; Data Security).\n3. Obtain and review every provided template and document: SOC 2 Common Criteria Mapping Template (spreadsheet: CC ID, Criterion Description, Example Audit Test, Internal Control Reference, Evidence Type, Gap Flag, RAG Status); SOC 2 Awareness Briefing Template (Word, 2-page format); Sample anonymised SOC 2 Type II report (provided by mentor for learning purposes).\n4. Secure prerequisite inputs: Sample anonymised SOC 2 Type II report obtained from the mentor; CC Mapping worksheet template reviewed; ISO 27001 Control Matrix from GRC101-CRM-002 obtained where available for cross-reference.\n5. Re-read the task description and all activity steps of GRC101-CRM-003; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: SOC 2 Control Awareness Summary — traffic-light dashboard per Common Criteria cluster, control-gap list, and a two-page IT-team briefing document.",
      "tab": "clarify"
    },
    {
      "id": "rua-crm-003-ref-127",
      "title": "Deliverable Specification — SOC 2 Control Awareness Summary",
      "kind": "Deliverable Acceptance Specification",
      "summary": "SOC 2 Control Awareness Summary — traffic-light dashboard per Common Criteria cluster, control-gap list, and a two-page IT-team briefing…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nSOC 2 Control Awareness Summary — traffic-light dashboard per Common Criteria cluster, control-gap list, and a two-page IT-team briefing document.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to SOC 2 Type II (AICPA Trust Services Criteria) |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-crm-003-ref-128",
      "title": "Study note / primer — SOC 1 versus SOC 2 versus SOC 3, and Type I versus Type II",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: SOC 1 versus SOC 2 versus SOC 3, and Type I versus Type II",
      "body": "A study primer that enables you to explain, in your own words: SOC 1 versus SOC 2 versus SOC 3, and Type I versus Type II.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-003-ref-129",
      "title": "Study note / primer — Trust Services Criteria categories; Security (Common Criteria) as the mandatory category",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Trust Services Criteria categories; Security (Common Criteria) as the…",
      "body": "A study primer that enables you to explain, in your own words: Trust Services Criteria categories; Security (Common Criteria) as the mandatory category.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-003-ref-130",
      "title": "Study note / primer — Common Criteria CC1–CC9 and their COSO Framework foundation",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Common Criteria CC1–CC9 and their COSO Framework foundation",
      "body": "A study primer that enables you to explain, in your own words: Common Criteria CC1–CC9 and their COSO Framework foundation.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-003-ref-131",
      "title": "Study note / primer — Auditor opinions, exceptions and what they signal",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Auditor opinions, exceptions and what they signal",
      "body": "A study primer that enables you to explain, in your own words: Auditor opinions, exceptions and what they signal.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-crm-003-ref-132",
      "title": "Study note / primer — Mapping criteria to internal controls and RAG readiness summaries",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Mapping criteria to internal controls and RAG readiness summaries",
      "body": "A study primer that enables you to explain, in your own words: Mapping criteria to internal controls and RAG readiness summaries.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "DD-001": [
    {
      "id": "rua-dd-001-ref-133",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 6.8 — Information security event reporting; Annex A 5.26 — Response to information security incidents; Annex A 5.28 — Collection…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 6.8 | Information security event reporting |\n| Annex A 5.26 | Response to information security incidents |\n| Annex A 5.28 | Collection of evidence |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-dd-001-ref-134",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — RS.CO-02 (Incidents reported); RS.MA-01 (Incident response activities aligned with plans); DE.AE-06 (Information on…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | RS.CO-02 (Incidents reported) |\n| — | RS.MA-01 (Incident response activities aligned with plans) |\n| — | DE.AE-06 (Information on adverse events communicated). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-dd-001-ref-135",
      "title": "Procedure Template",
      "kind": "Template / Working Document",
      "summary": "Word — with standard headers: Purpose, Scope, Definitions, Procedure Steps, Responsibilities, Related Documents, Document Control",
      "body": "Working template you obtain and review: Procedure Template. Word — with standard headers: Purpose, Scope, Definitions, Procedure Steps, Responsibilities, Related Documents, Document Control\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-001-ref-136",
      "title": "Incident Reporting Quick Reference Card Template",
      "kind": "Template / Working Document",
      "summary": "A5 Word layout",
      "body": "Working template you obtain and review: Incident Reporting Quick Reference Card Template. A5 Word layout\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-001-ref-137",
      "title": "Staff Communication Template",
      "kind": "Template / Working Document",
      "summary": "50-word email announcement",
      "body": "Working template you obtain and review: Staff Communication Template. 50-word email announcement\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-001-ref-138",
      "title": "Existing incident-related documentation gathered (helpdesk tickets, email chains, informal guidance)",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Existing incident-related documentation gathered (helpdesk tickets, email chains, informal guidance)",
      "body": "Existing incident-related documentation gathered (helpdesk tickets, email chains, informal guidance)\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-001-ref-139",
      "title": "Procedure Template and Quick Reference Card Template reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Procedure Template and Quick Reference Card Template reviewed",
      "body": "Procedure Template and Quick Reference Card Template reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-001-ref-140",
      "title": "Interview slots with the IT Manager and one front-line staff member confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Interview slots with the IT Manager and one front-line staff member confirmed",
      "body": "Interview slots with the IT Manager and one front-line staff member confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-001-ref-141",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-DD-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-DD-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the difference between events and incidents, what Annex A 6.8 requires of staff reporting, and how a usable procedure is structured, before drafting.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 6.8 — Information security event reporting; Annex A 5.26 — Response to information security incidents; Annex A 5.28 — Collection of evidence.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — RS.CO-02 (Incidents reported); RS.MA-01 (Incident response activities aligned with plans); DE.AE-06 (Information on adverse events communicated).\n3. Obtain and review every provided template and document: Procedure Template (Word — with standard headers: Purpose, Scope, Definitions, Procedure Steps, Responsibilities, Related Documents, Document Control); Incident Reporting Quick Reference Card Template (A5 Word layout); Staff Communication Template (50-word email announcement).\n4. Secure prerequisite inputs: Existing incident-related documentation gathered (helpdesk tickets, email chains, informal guidance); Procedure Template and Quick Reference Card Template reviewed; Interview slots with the IT Manager and one front-line staff member confirmed.\n5. Re-read the task description and all activity steps of GRC101-DD-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Incident Reporting Procedure (full document) + Incident Reporting Quick Reference Card (one-page PDF-ready) + Staff Communication Draft.",
      "tab": "clarify"
    },
    {
      "id": "rua-dd-001-ref-142",
      "title": "Deliverable Specification — Incident Reporting Procedure (full document) + Incident Reporting Quick Reference Card…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Incident Reporting Procedure (full document) + Incident Reporting Quick Reference Card (one-page PDF-ready) + Staff Communication Draft.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nIncident Reporting Procedure (full document) + Incident Reporting Quick Reference Card (one-page PDF-ready) + Staff Communication Draft.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-dd-001-ref-143",
      "title": "Study note / primer — Security event versus security incident — definitions and examples",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Security event versus security incident — definitions and examples",
      "body": "A study primer that enables you to explain, in your own words: Security event versus security incident — definitions and examples.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-001-ref-144",
      "title": "Study note / primer — Annex A 6.8 (event reporting), A 5.26 (incident response) and A 5.28 (evidence collection) intent",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Annex A 6.8 (event reporting), A 5.26 (incident response) and A 5.28…",
      "body": "A study primer that enables you to explain, in your own words: Annex A 6.8 (event reporting), A 5.26 (incident response) and A 5.28 (evidence collection) intent.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-001-ref-145",
      "title": "Study note / primer — Procedure structure: purpose, scope, definitions, steps, responsibilities, document control",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Procedure structure: purpose, scope, definitions, steps,…",
      "body": "A study primer that enables you to explain, in your own words: Procedure structure: purpose, scope, definitions, steps, responsibilities, document control.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-001-ref-146",
      "title": "Study note / primer — Reporting channels and escalation timelines",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Reporting channels and escalation timelines",
      "body": "A study primer that enables you to explain, in your own words: Reporting channels and escalation timelines.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-001-ref-147",
      "title": "Study note / primer — Writing for all staff: plain language and the one-page quick reference discipline",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Writing for all staff: plain language and the one-page quick reference…",
      "body": "A study primer that enables you to explain, in your own words: Writing for all staff: plain language and the one-page quick reference discipline.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "DD-002": [
    {
      "id": "rua-dd-002-ref-148",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 6.3 — Information security awareness, education and training; Annex A 6.6 — Confidentiality or non-disclosure agreements; Annex…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 6.3 | Information security awareness, education and training |\n| Annex A 6.6 | Confidentiality or non-disclosure agreements |\n| Annex A 5.1 | Policies for information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-dd-002-ref-149",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — PR.AT-01 (Personnel are provided awareness and training); PR.AT-02 (Individuals with elevated privileges are provided…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | PR.AT-01 (Personnel are provided awareness and training) |\n| — | PR.AT-02 (Individuals with elevated privileges are provided awareness and training) |\n| CIS Controls v8 | Control 14 (Security Awareness and Skills Training). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-dd-002-ref-150",
      "title": "Training Content Outline Template",
      "kind": "Template / Working Document",
      "summary": "Word — with topic, learning objective, key messages, and timing per section",
      "body": "Working template you obtain and review: Training Content Outline Template. Word — with topic, learning objective, key messages, and timing per section\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-002-ref-151",
      "title": "Security Awareness Slide Deck Template",
      "kind": "Template / Working Document",
      "summary": "PowerPoint — branded, 12-slide structure",
      "body": "Working template you obtain and review: Security Awareness Slide Deck Template. PowerPoint — branded, 12-slide structure\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-002-ref-152",
      "title": "Knowledge Check Template",
      "kind": "Template / Working Document",
      "summary": "Word — 5-question MCQ with answer key",
      "body": "Working template you obtain and review: Knowledge Check Template. Word — 5-question MCQ with answer key\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-002-ref-153",
      "title": "Facilitator Guide Template",
      "kind": "Template / Working Document",
      "summary": "Word — A4 one-pager",
      "body": "Working template you obtain and review: Facilitator Guide Template. Word — A4 one-pager\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-002-ref-154",
      "title": "Training Attendance Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet",
      "body": "Working template you obtain and review: Training Attendance Register Template. spreadsheet\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-002-ref-155",
      "title": "Existing HR onboarding materials and current security guidance reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Existing HR onboarding materials and current security guidance reviewed",
      "body": "Existing HR onboarding materials and current security guidance reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-002-ref-156",
      "title": "Training Content Outline, Slide Deck, Knowledge Check and Facilitator Guide templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Training Content Outline, Slide Deck, Knowledge Check and Facilitator Guide templates reviewed",
      "body": "Training Content Outline, Slide Deck, Knowledge Check and Facilitator Guide templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-002-ref-157",
      "title": "Two colleagues identified for the pilot session",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Two colleagues identified for the pilot session",
      "body": "Two colleagues identified for the pilot session\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-002-ref-158",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-DD-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-DD-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand learning-objective design, the three core topics, and how knowledge checks measure learning, before outlining any content.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 6.3 — Information security awareness, education and training; Annex A 6.6 — Confidentiality or non-disclosure agreements; Annex A 5.1 — Policies for information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.AT-01 (Personnel are provided awareness and training); PR.AT-02 (Individuals with elevated privileges are provided awareness and training); Control 14 (Security Awareness and Skills Training).\n3. Obtain and review every provided template and document: Training Content Outline Template (Word — with topic, learning objective, key messages, and timing per section); Security Awareness Slide Deck Template (PowerPoint — branded, 12-slide structure); Knowledge Check Template (Word — 5-question MCQ with answer key); Facilitator Guide Template (Word — A4 one-pager); Training Attendance Register Template (spreadsheet).\n4. Secure prerequisite inputs: Existing HR onboarding materials and current security guidance reviewed; Training Content Outline, Slide Deck, Knowledge Check and Facilitator Guide templates reviewed; Two colleagues identified for the pilot session.\n5. Re-read the task description and all activity steps of GRC101-DD-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Security Awareness Training Module — 10–12 slide deck, five-question knowledge check, one-page Facilitator Guide, and a training attendance register template.",
      "tab": "clarify"
    },
    {
      "id": "rua-dd-002-ref-159",
      "title": "Deliverable Specification — Security Awareness Training Module",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Security Awareness Training Module — 10–12 slide deck, five-question knowledge check, one-page Facilitator Guide, and a training…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nSecurity Awareness Training Module — 10–12 slide deck, five-question knowledge check, one-page Facilitator Guide, and a training attendance register template.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-dd-002-ref-160",
      "title": "Study note / primer — Measurable learning objectives and how they drive content design",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Measurable learning objectives and how they drive content design",
      "body": "A study primer that enables you to explain, in your own words: Measurable learning objectives and how they drive content design.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-002-ref-161",
      "title": "Study note / primer — Adult-learning basics: relevance, brevity, plain language, engagement",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Adult-learning basics: relevance, brevity, plain language, engagement",
      "body": "A study primer that enables you to explain, in your own words: Adult-learning basics: relevance, brevity, plain language, engagement.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-002-ref-162",
      "title": "Study note / primer — Core messages for phishing recognition, password hygiene and data handling",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Core messages for phishing recognition, password hygiene and data handling",
      "body": "A study primer that enables you to explain, in your own words: Core messages for phishing recognition, password hygiene and data handling.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-002-ref-163",
      "title": "Study note / primer — Knowledge-check design: aligned questions, plausible distractors, answer keys",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Knowledge-check design: aligned questions, plausible distractors, answer…",
      "body": "A study primer that enables you to explain, in your own words: Knowledge-check design: aligned questions, plausible distractors, answer keys.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-002-ref-164",
      "title": "Study note / primer — Annex A 6.3 awareness and training obligations",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Annex A 6.3 awareness and training obligations",
      "body": "A study primer that enables you to explain, in your own words: Annex A 6.3 awareness and training obligations.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "DD-003": [
    {
      "id": "rua-dd-003-ref-165",
      "title": "GDPR (EU) 2016/679 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Article 5(1)(e) — Storage limitation principle; Article 17 — Right to erasure; Recital 39 — Data kept no longer than necessary.",
      "body": "The governing control references you must study before work begins, drawn from GDPR (EU) 2016/679 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Article 5(1)(e) | Storage limitation principle |\n| Article 17 | Right to erasure |\n| Recital 39 | Data kept no longer than necessary |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-dd-003-ref-166",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — PR.DS-01 (Data at rest protected); PR.DS-10 (Data in use protected); CIS Controls v8 — Control 3.11 (Encrypt Sensitive…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | PR.DS-01 (Data at rest protected) |\n| — | PR.DS-10 (Data in use protected) |\n| CIS Controls v8 | Control 3.11 (Encrypt Sensitive Data at Rest) complementary to retention lifecycle. |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-dd-003-ref-167",
      "title": "Data Retention Schedule Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Data Element, Data Category, System/Location, Retention Trigger, Retention Period, Legal Basis, Disposal Method, Disposal…",
      "body": "Working template you obtain and review: Data Retention Schedule Template. spreadsheet: Data Element, Data Category, System/Location, Retention Trigger, Retention Period, Legal Basis, Disposal Method, Disposal Responsible, Last Review, Next Review, Notes\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-003-ref-168",
      "title": "Data Disposal Instruction Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-pager per disposal method",
      "body": "Working template you obtain and review: Data Disposal Instruction Template. Word — one-pager per disposal method\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-003-ref-169",
      "title": "Legal Retention Reference Sheet",
      "kind": "Template / Working Document",
      "summary": "jurisdiction-specific summary — provided by mentor",
      "body": "Working template you obtain and review: Legal Retention Reference Sheet. jurisdiction-specific summary — provided by mentor\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-dd-003-ref-170",
      "title": "Target data category agreed with the mentor (e.g. employee records, client contacts)",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Target data category agreed with the mentor (e.g. employee records, client contacts)",
      "body": "Target data category agreed with the mentor (e.g. employee records, client contacts)\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-003-ref-171",
      "title": "Data Retention Schedule Template and Disposal Instruction Template reviewed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Data Retention Schedule Template and Disposal Instruction Template reviewed",
      "body": "Data Retention Schedule Template and Disposal Instruction Template reviewed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-003-ref-172",
      "title": "Data owner and IT/system owner interview slots confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Data owner and IT/system owner interview slots confirmed",
      "body": "Data owner and IT/system owner interview slots confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-dd-003-ref-173",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-DD-003",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-DD-003. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the storage-limitation principle, retention triggers versus periods, and disposal methods before researching legal requirements or interviewing data owners.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Article 5(1)(e) — Storage limitation principle; Article 17 — Right to erasure; Recital 39 — Data kept no longer than necessary.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.DS-01 (Data at rest protected); PR.DS-10 (Data in use protected); Control 3.11 (Encrypt Sensitive Data at Rest).\n3. Obtain and review every provided template and document: Data Retention Schedule Template (spreadsheet: Data Element, Data Category, System/Location, Retention Trigger, Retention Period, Legal Basis, Disposal Method, Disposal Responsible, Last Review, Next Review, Notes); Data Disposal Instruction Template (Word — one-pager per disposal method); Legal Retention Reference Sheet (jurisdiction-specific summary — provided by mentor).\n4. Secure prerequisite inputs: Target data category agreed with the mentor (e.g. employee records, client contacts); Data Retention Schedule Template and Disposal Instruction Template reviewed; Data owner and IT/system owner interview slots confirmed.\n5. Re-read the task description and all activity steps of GRC101-DD-003; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Data Retention Schedule (for one data category) — approved spreadsheet with retention triggers, periods, legal basis, disposal method, and responsible owner; plus a Data Disposal Instruction document.",
      "tab": "clarify"
    },
    {
      "id": "rua-dd-003-ref-174",
      "title": "Deliverable Specification — Data Retention Schedule (for one data category)",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Data Retention Schedule (for one data category) — approved spreadsheet with retention triggers, periods, legal basis, disposal method,…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nData Retention Schedule (for one data category) — approved spreadsheet with retention triggers, periods, legal basis, disposal method, and responsible owner; plus a Data Disposal Instruction document.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to GDPR (EU) 2016/679 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-dd-003-ref-175",
      "title": "Study note / primer — GDPR Article 5(1)(e) storage limitation and Recital 39",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: GDPR Article 5(1)(e) storage limitation and Recital 39",
      "body": "A study primer that enables you to explain, in your own words: GDPR Article 5(1)(e) storage limitation and Recital 39.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-003-ref-176",
      "title": "Study note / primer — Retention trigger versus retention period (e.g. end of employment + 6 years)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Retention trigger versus retention period (e.g. end of employment + 6 years)",
      "body": "A study primer that enables you to explain, in your own words: Retention trigger versus retention period (e.g. end of employment + 6 years).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-003-ref-177",
      "title": "Study note / primer — Sources of legal retention minimums: employment, tax and sector-specific law",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Sources of legal retention minimums: employment, tax and sector-specific law",
      "body": "A study primer that enables you to explain, in your own words: Sources of legal retention minimums: employment, tax and sector-specific law.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-003-ref-178",
      "title": "Study note / primer — Disposal methods per medium and documented disposal instructions",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Disposal methods per medium and documented disposal instructions",
      "body": "A study primer that enables you to explain, in your own words: Disposal methods per medium and documented disposal instructions.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-dd-003-ref-179",
      "title": "Study note / primer — Interplay with Article 17 right to erasure and its exemptions",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Interplay with Article 17 right to erasure and its exemptions",
      "body": "A study primer that enables you to explain, in your own words: Interplay with Article 17 right to erasure and its exemptions.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "SPA-001": [
    {
      "id": "rua-spa-001-ref-180",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 6.2 — Information security objectives and planning to achieve them; Clause 9.3 — Management review; Annex A 5.35 — Independent…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 6.2 | Information security objectives and planning to achieve them |\n| Clause 9.3 | Management review |\n| Annex A 5.35 | Independent review of information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-spa-001-ref-181",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.RM-06 (Risk tolerance determined and communicated); GV.OC (Organisational Context understood and used to prioritise…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.RM-06 (Risk tolerance determined and communicated) |\n| — | GV.OC (Organisational Context understood and used to prioritise cybersecurity risk). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-spa-001-ref-182",
      "title": "GRC Roadmap Template",
      "kind": "Template / Working Document",
      "summary": "Excel — Gantt chart with action IDs, descriptions, phase, owner, control reference, start/end dates, status, and estimated effort",
      "body": "Working template you obtain and review: GRC Roadmap Template. Excel — Gantt chart with action IDs, descriptions, phase, owner, control reference, start/end dates, status, and estimated effort\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-spa-001-ref-183",
      "title": "Management Briefing Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page format: context, priorities, investment summary, next steps",
      "body": "Working template you obtain and review: Management Briefing Template. Word — one-page format: context, priorities, investment summary, next steps\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-spa-001-ref-184",
      "title": "GRC Action Detail Sheet",
      "kind": "Template / Working Document",
      "summary": "spreadsheet supporting the Gantt",
      "body": "Working template you obtain and review: GRC Action Detail Sheet. spreadsheet supporting the Gantt\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-spa-001-ref-185",
      "title": "Gap Analysis (GRC101-AA-002), Risk Register (GRC101-GRM-001) and Maturity Assessment (GRC101-GRM-003) outputs…",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Gap Analysis (GRC101-AA-002), Risk Register (GRC101-GRM-001) and Maturity Assessment (GRC101-GRM-003) outputs obtained and read",
      "body": "Gap Analysis (GRC101-AA-002), Risk Register (GRC101-GRM-001) and Maturity Assessment (GRC101-GRM-003) outputs obtained and read\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-spa-001-ref-186",
      "title": "GRC Roadmap Gantt Template and Management Briefing Template reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "GRC Roadmap Gantt Template and Management Briefing Template reviewed",
      "body": "GRC Roadmap Gantt Template and Management Briefing Template reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-spa-001-ref-187",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-SPA-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-SPA-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you have absorbed the gap, risk and maturity findings that feed the roadmap, and understands phased planning and prioritisation, before consolidating anything.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 6.2 — Information security objectives and planning to achieve them; Clause 9.3 — Management review; Annex A 5.35 — Independent review of information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.RM-06 (Risk tolerance determined and communicated); GV.OC (Organisational Context understood and used to prioritise cybersecurity risk).\n3. Obtain and review every provided template and document: GRC Roadmap Template (Excel — Gantt chart with action IDs, descriptions, phase, owner, control reference, start/end dates, status, and estimated effort); Management Briefing Template (Word — one-page format: context, priorities, investment summary, next steps); GRC Action Detail Sheet (spreadsheet supporting the Gantt).\n4. Secure prerequisite inputs: Gap Analysis (GRC101-AA-002), Risk Register (GRC101-GRM-001) and Maturity Assessment (GRC101-GRM-003) outputs obtained and read; GRC Roadmap Gantt Template and Management Briefing Template reviewed.\n5. Re-read the task description and all activity steps of GRC101-SPA-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: 12-Month GRC Improvement Roadmap — phased action plan (Gantt chart), per-action detail spreadsheet, and a one-page Management Briefing.",
      "tab": "clarify"
    },
    {
      "id": "rua-spa-001-ref-188",
      "title": "Deliverable Specification — 12-Month GRC Improvement Roadmap",
      "kind": "Deliverable Acceptance Specification",
      "summary": "12-Month GRC Improvement Roadmap — phased action plan (Gantt chart), per-action detail spreadsheet, and a one-page Management Briefing.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\n12-Month GRC Improvement Roadmap — phased action plan (Gantt chart), per-action detail spreadsheet, and a one-page Management Briefing.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-spa-001-ref-189",
      "title": "Study note / primer — Phased planning: Quick Wins (0–3 months), Medium-Term (3–6), Longer-Term (6–12)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Phased planning: Quick Wins (0–3 months), Medium-Term (3–6), Longer-Term…",
      "body": "A study primer that enables you to explain, in your own words: Phased planning: Quick Wins (0–3 months), Medium-Term (3–6), Longer-Term (6–12).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-001-ref-190",
      "title": "Study note / primer — ISO 27001 Clause 6.2 — objectives and planning to achieve them",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001 Clause 6.2 — objectives and planning to achieve them",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001 Clause 6.2 — objectives and planning to achieve them.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-001-ref-191",
      "title": "Study note / primer — Effort-versus-impact prioritisation and dependency sequencing",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Effort-versus-impact prioritisation and dependency sequencing",
      "body": "A study primer that enables you to explain, in your own words: Effort-versus-impact prioritisation and dependency sequencing.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-001-ref-192",
      "title": "Study note / primer — Gantt basics: milestones, owners, phases, status",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Gantt basics: milestones, owners, phases, status",
      "body": "A study primer that enables you to explain, in your own words: Gantt basics: milestones, owners, phases, status.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-001-ref-193",
      "title": "Study note / primer — Estimating compliance uplift and writing an investment rationale for management",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Estimating compliance uplift and writing an investment rationale for…",
      "body": "A study primer that enables you to explain, in your own words: Estimating compliance uplift and writing an investment rationale for management.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "SPA-002": [
    {
      "id": "rua-spa-002-ref-194",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 4.2 — Understanding the needs and expectations of interested parties; Clause 5.3 — Organisational roles, responsibilities and…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 4.2 | Understanding the needs and expectations of interested parties |\n| Clause 5.3 | Organisational roles, responsibilities and authorities |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-spa-002-ref-195",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.OC-02 (Internal and external stakeholders identified); GV.SC-04 (Suppliers and third parties are informed of their roles).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.OC-02 (Internal and external stakeholders identified) |\n| — | GV.SC-04 (Suppliers and third parties are informed of their roles). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-spa-002-ref-196",
      "title": "Stakeholder Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Stakeholder ID, Name/Group, Role, Interest Area, Influence Level 1–5, Interest Level 1–5, Quadrant, Engagement Strategy,…",
      "body": "Working template you obtain and review: Stakeholder Register Template. spreadsheet: Stakeholder ID, Name/Group, Role, Interest Area, Influence Level 1–5, Interest Level 1–5, Quadrant, Engagement Strategy, Communication Channel, Frequency, Owner\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-spa-002-ref-197",
      "title": "Influence-Interest Matrix Template",
      "kind": "Template / Working Document",
      "summary": "PowerPoint 2×2 diagram",
      "body": "Working template you obtain and review: Influence-Interest Matrix Template. PowerPoint 2×2 diagram\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-spa-002-ref-198",
      "title": "Stakeholder Communication Plan Template",
      "kind": "Template / Working Document",
      "summary": "Word table format",
      "body": "Working template you obtain and review: Stakeholder Communication Plan Template. Word table format\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-spa-002-ref-199",
      "title": "A GRC initiative selected from the 12-month roadmap (GRC101-SPA-001)",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "A GRC initiative selected from the 12-month roadmap (GRC101-SPA-001)",
      "body": "A GRC initiative selected from the 12-month roadmap (GRC101-SPA-001)\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-spa-002-ref-200",
      "title": "Stakeholder Register, Influence-Interest Matrix and Communication Plan templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Stakeholder Register, Influence-Interest Matrix and Communication Plan templates reviewed",
      "body": "Stakeholder Register, Influence-Interest Matrix and Communication Plan templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-spa-002-ref-201",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-SPA-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-SPA-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand stakeholder analysis mechanics — influence, interest, quadrants and engagement strategies — and has a confirmed initiative in scope, before brainstorming stakeholders.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 4.2 — Understanding the needs and expectations of interested parties; Clause 5.3 — Organisational roles, responsibilities and authorities.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.OC-02 (Internal and external stakeholders identified); GV.SC-04 (Suppliers and third parties are informed of their roles).\n3. Obtain and review every provided template and document: Stakeholder Register Template (spreadsheet: Stakeholder ID, Name/Group, Role, Interest Area, Influence Level 1–5, Interest Level 1–5, Quadrant, Engagement Strategy, Communication Channel, Frequency, Owner); Influence-Interest Matrix Template (PowerPoint 2×2 diagram); Stakeholder Communication Plan Template (Word table format).\n4. Secure prerequisite inputs: A GRC initiative selected from the 12-month roadmap (GRC101-SPA-001); Stakeholder Register, Influence-Interest Matrix and Communication Plan templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-SPA-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative.",
      "tab": "clarify"
    },
    {
      "id": "rua-spa-002-ref-202",
      "title": "Deliverable Specification — Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nStakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-spa-002-ref-203",
      "title": "Study note / primer — Interested parties under ISO 27001 Clause 4.2 and roles under Clause 5.3",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Interested parties under ISO 27001 Clause 4.2 and roles under Clause 5.3",
      "body": "A study primer that enables you to explain, in your own words: Interested parties under ISO 27001 Clause 4.2 and roles under Clause 5.3.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-002-ref-204",
      "title": "Study note / primer — Influence versus interest and the 2×2 Influence-Interest Matrix",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Influence versus interest and the 2×2 Influence-Interest Matrix",
      "body": "A study primer that enables you to explain, in your own words: Influence versus interest and the 2×2 Influence-Interest Matrix.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-002-ref-205",
      "title": "Study note / primer — Quadrant strategies: Manage Closely / Keep Satisfied / Keep Informed / Monitor",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Quadrant strategies: Manage Closely / Keep Satisfied / Keep Informed /…",
      "body": "A study primer that enables you to explain, in your own words: Quadrant strategies: Manage Closely / Keep Satisfied / Keep Informed / Monitor.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-002-ref-206",
      "title": "Study note / primer — Stakeholder registers and communication planning (what, how often, which channel)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Stakeholder registers and communication planning (what, how often, which…",
      "body": "A study primer that enables you to explain, in your own words: Stakeholder registers and communication planning (what, how often, which channel).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-spa-002-ref-207",
      "title": "Study note / primer — Internal versus external stakeholder identification",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Internal versus external stakeholder identification",
      "body": "A study primer that enables you to explain, in your own words: Internal versus external stakeholder identification.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "IE-001": [
    {
      "id": "rua-ie-001-ref-208",
      "title": "CIS Controls v8 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Control 1.1 (Establish and maintain detailed enterprise asset inventory); Control 3.3 (Configure data access control lists); Control 5.2…",
      "body": "The governing control references you must study before work begins, drawn from CIS Controls v8 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n|  | Control 1.1 (Establish and maintain detailed enterprise asset inventory) |\n|  | Control 3.3 (Configure data access control lists) |\n|  | Control 5.2 (Use unique passwords) |\n|  | Control 5.3 (Disable dormant accounts) |\n|  | Control 6.1 (Establish access-granting process) |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-ie-001-ref-209",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — PR.AA-01 (Identities managed); PR.DS-01 (Data at rest protected); PR.DS-02 (Data in transit protected).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | PR.AA-01 (Identities managed) |\n| — | PR.DS-01 (Data at rest protected) |\n| — | PR.DS-02 (Data in transit protected). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-ie-001-ref-210",
      "title": "Control Implementation Tracker Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Safeguard ID, Description, IT Owner, Target Date, Status, Evidence Reference, Acceptance Criteria, Pass/Fail, Notes",
      "body": "Working template you obtain and review: Control Implementation Tracker Template. spreadsheet: Safeguard ID, Description, IT Owner, Target Date, Status, Evidence Reference, Acceptance Criteria, Pass/Fail, Notes\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-001-ref-211",
      "title": "Implementation Task Card Template",
      "kind": "Template / Working Document",
      "summary": "Word — one card per control",
      "body": "Working template you obtain and review: Implementation Task Card Template. Word — one card per control\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-001-ref-212",
      "title": "Evidence Repository Folder Structure Guide",
      "kind": "Template / Working Document",
      "summary": "naming conventions and filing instructions",
      "body": "Working template you obtain and review: Evidence Repository Folder Structure Guide. naming conventions and filing instructions\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-001-ref-213",
      "title": "CIS gap analysis from GRC101-AA-002 obtained and the candidate safeguards reviewed",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "CIS gap analysis from GRC101-AA-002 obtained and the candidate safeguards reviewed",
      "body": "CIS gap analysis from GRC101-AA-002 obtained and the candidate safeguards reviewed\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ie-001-ref-214",
      "title": "Implementation Tracker and Task Card templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Implementation Tracker and Task Card templates reviewed",
      "body": "Implementation Tracker and Task Card templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ie-001-ref-215",
      "title": "IT Manager commitment to the implementation window confirmed",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "IT Manager commitment to the implementation window confirmed",
      "body": "IT Manager commitment to the implementation window confirmed\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ie-001-ref-216",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-IE-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-IE-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the remediation lifecycle, acceptance criteria and evidence expectations for the five selected safeguards before creating task cards or tracking anything.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references:  — Control 1.1 (Establish and maintain detailed enterprise asset inventory);  — Control 3.3 (Configure data access control lists);  — Control 5.2 (Use unique passwords);  — Control 5.3 (Disable dormant accounts);  — Control 6.1 (Establish access-granting process).\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.AA-01 (Identities managed); PR.DS-01 (Data at rest protected); PR.DS-02 (Data in transit protected).\n3. Obtain and review every provided template and document: Control Implementation Tracker Template (spreadsheet: Safeguard ID, Description, IT Owner, Target Date, Status, Evidence Reference, Acceptance Criteria, Pass/Fail, Notes); Implementation Task Card Template (Word — one card per control); Evidence Repository Folder Structure Guide (naming conventions and filing instructions).\n4. Secure prerequisite inputs: CIS gap analysis from GRC101-AA-002 obtained and the candidate safeguards reviewed; Implementation Tracker and Task Card templates reviewed; IT Manager commitment to the implementation window confirmed.\n5. Re-read the task description and all activity steps of GRC101-IE-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Control Implementation Tracker (updated with evidence references) + Evidence Repository (filed artefacts) + Implementation Progress Report.",
      "tab": "clarify"
    },
    {
      "id": "rua-ie-001-ref-217",
      "title": "Deliverable Specification — Control Implementation Tracker (updated with evidence references) + Evidence Repository…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Control Implementation Tracker (updated with evidence references) + Evidence Repository (filed artefacts) + Implementation Progress Report.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nControl Implementation Tracker (updated with evidence references) + Evidence Repository (filed artefacts) + Implementation Progress Report.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to CIS Controls v8 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-ie-001-ref-218",
      "title": "Study note / primer — The remediation lifecycle: select, plan, implement, evidence, verify, close",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The remediation lifecycle: select, plan, implement, evidence, verify, close",
      "body": "A study primer that enables you to explain, in your own words: The remediation lifecycle: select, plan, implement, evidence, verify, close.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-001-ref-219",
      "title": "Study note / primer — Acceptance criteria — defining done before work starts",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Acceptance criteria — defining done before work starts",
      "body": "A study primer that enables you to explain, in your own words: Acceptance criteria — defining done before work starts.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-001-ref-220",
      "title": "Study note / primer — Implementation evidence types: screenshots, configuration exports, policy documents",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Implementation evidence types: screenshots, configuration exports,…",
      "body": "A study primer that enables you to explain, in your own words: Implementation evidence types: screenshots, configuration exports, policy documents.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-001-ref-221",
      "title": "Study note / primer — Raising and escalating remediation issues when acceptance fails",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Raising and escalating remediation issues when acceptance fails",
      "body": "A study primer that enables you to explain, in your own words: Raising and escalating remediation issues when acceptance fails.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-001-ref-222",
      "title": "Study note / primer — Keeping the tracker current and updating the AA-002 gap analysis on completion",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Keeping the tracker current and updating the AA-002 gap analysis on…",
      "body": "A study primer that enables you to explain, in your own words: Keeping the tracker current and updating the AA-002 gap analysis on completion.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "IE-002": [
    {
      "id": "rua-ie-002-ref-223",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 7.5 — Documented information; Clause 7.5.3 — Control of documented information; Annex A 5.1 — Policies for information security.",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 7.5 | Documented information |\n| Clause 7.5.3 | Control of documented information |\n| Annex A 5.1 | Policies for information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-ie-002-ref-224",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.PO-02 (Policy reviewed, updated, communicated); GV.OC (Organisational context maintained through documented information).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.PO-02 (Policy reviewed, updated, communicated) |\n| — | GV.OC (Organisational context maintained through documented information). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-ie-002-ref-225",
      "title": "Document Control Policy Template",
      "kind": "Template / Working Document",
      "summary": "Word",
      "body": "Working template you obtain and review: Document Control Policy Template. Word\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-002-ref-226",
      "title": "Document Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Doc ID, Title, Version, Status, Owner, Approver, Date Approved, Next Review Date, Location Link",
      "body": "Working template you obtain and review: Document Register Template. spreadsheet: Doc ID, Title, Version, Status, Owner, Approver, Date Approved, Next Review Date, Location Link\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-002-ref-227",
      "title": "GRC Folder Structure Guide",
      "kind": "Template / Working Document",
      "summary": "Word — recommended hierarchy and naming conventions",
      "body": "Working template you obtain and review: GRC Folder Structure Guide. Word — recommended hierarchy and naming conventions\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-002-ref-228",
      "title": "Version Numbering Guide",
      "kind": "Template / Working Document",
      "summary": "reference card",
      "body": "Working template you obtain and review: Version Numbering Guide. reference card\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ie-002-ref-229",
      "title": "Inventory of existing GRC documents and their current storage locations gathered",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Inventory of existing GRC documents and their current storage locations gathered",
      "body": "Inventory of existing GRC documents and their current storage locations gathered\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ie-002-ref-230",
      "title": "Document Control Policy, Document Register, Folder Structure and Version Numbering templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Document Control Policy, Document Register, Folder Structure and Version Numbering templates reviewed",
      "body": "Document Control Policy, Document Register, Folder Structure and Version Numbering templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ie-002-ref-231",
      "title": "Approved policy artefacts from GRC101-GRM-002 identified for migration where available",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Approved policy artefacts from GRC101-GRM-002 identified for migration where available",
      "body": "Approved policy artefacts from GRC101-GRM-002 identified for migration where available\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ie-002-ref-232",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-IE-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-IE-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand ISO 27001 Clause 7.5 documented-information requirements, version numbering and document lifecycles before auditing the current state or designing the structure.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 7.5 — Documented information; Clause 7.5.3 — Control of documented information; Annex A 5.1 — Policies for information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.PO-02 (Policy reviewed, updated, communicated); GV.OC (Organisational context maintained through documented information).\n3. Obtain and review every provided template and document: Document Control Policy Template (Word); Document Register Template (spreadsheet: Doc ID, Title, Version, Status, Owner, Approver, Date Approved, Next Review Date, Location Link); GRC Folder Structure Guide (Word — recommended hierarchy and naming conventions); Version Numbering Guide (reference card).\n4. Secure prerequisite inputs: Inventory of existing GRC documents and their current storage locations gathered; Document Control Policy, Document Register, Folder Structure and Version Numbering templates reviewed; Approved policy artefacts from GRC101-GRM-002 identified for migration where available.\n5. Re-read the task description and all activity steps of GRC101-IE-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Document Control Policy (approved) + Document Register (populated) + Implemented folder structure on the shared drive + Training summary note.",
      "tab": "clarify"
    },
    {
      "id": "rua-ie-002-ref-233",
      "title": "Deliverable Specification — Document Control Policy (approved) + Document Register (populated) + Implemented folder…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Document Control Policy (approved) + Document Register (populated) + Implemented folder structure on the shared drive + Training summary…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nDocument Control Policy (approved) + Document Register (populated) + Implemented folder structure on the shared drive + Training summary note.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-ie-002-ref-234",
      "title": "Study note / primer — Clause 7.5 / 7.5.3 — creating, updating and controlling documented information",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Clause 7.5 / 7.5.3 — creating, updating and controlling documented…",
      "body": "A study primer that enables you to explain, in your own words: Clause 7.5 / 7.5.3 — creating, updating and controlling documented information.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-002-ref-235",
      "title": "Study note / primer — Version numbering schemes: major versus minor versions",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Version numbering schemes: major versus minor versions",
      "body": "A study primer that enables you to explain, in your own words: Version numbering schemes: major versus minor versions.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-002-ref-236",
      "title": "Study note / primer — Naming conventions and folder hierarchy design",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Naming conventions and folder hierarchy design",
      "body": "A study primer that enables you to explain, in your own words: Naming conventions and folder hierarchy design.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-002-ref-237",
      "title": "Study note / primer — Document lifecycle: draft, review, approved, published, retired",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Document lifecycle: draft, review, approved, published, retired",
      "body": "A study primer that enables you to explain, in your own words: Document lifecycle: draft, review, approved, published, retired.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ie-002-ref-238",
      "title": "Study note / primer — The Document Register as the master index with owners and review dates",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The Document Register as the master index with owners and review dates",
      "body": "A study primer that enables you to explain, in your own words: The Document Register as the master index with owners and review dates.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "TV-001": [
    {
      "id": "rua-tv-001-ref-239",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 8.2 — Privileged access rights; Annex A 8.3 — Information access restriction; Annex A 8.5 — Secure authentication; Annex A 5.18…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 8.2 | Privileged access rights |\n| Annex A 8.3 | Information access restriction |\n| Annex A 8.5 | Secure authentication |\n| Annex A 5.18 | Access rights |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-tv-001-ref-240",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — PR.AA-01 (Identities and credentials managed); PR.AA-02 (Identities are proofed and bound to credentials); CIS Controls…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | PR.AA-01 (Identities and credentials managed) |\n| — | PR.AA-02 (Identities are proofed and bound to credentials) |\n| CIS Controls v8 | Control 5 (Account Management), Control 6 (Access Control Management). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-tv-001-ref-241",
      "title": "Access Review Worksheet",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Account ID, Username, System, Role/Permission Level, Last Login Date, HR Status, Finding Type, Recommended Action,…",
      "body": "Working template you obtain and review: Access Review Worksheet. spreadsheet: Account ID, Username, System, Role/Permission Level, Last Login Date, HR Status, Finding Type, Recommended Action, Priority, IT Owner Action\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tv-001-ref-242",
      "title": "Access Control Testing Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — executive summary, findings table, remediation recommendations, sign-off block",
      "body": "Working template you obtain and review: Access Control Testing Report Template. Word — executive summary, findings table, remediation recommendations, sign-off block\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tv-001-ref-243",
      "title": "Cross-Reference Methodology Guide",
      "kind": "Template / Working Document",
      "summary": "Cross-Reference Methodology Guide",
      "body": "Working template you obtain and review: Cross-Reference Methodology Guide.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tv-001-ref-244",
      "title": "System owner and HR contact identified and extract requests understood",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "System owner and HR contact identified and extract requests understood",
      "body": "System owner and HR contact identified and extract requests understood\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tv-001-ref-245",
      "title": "Access Review Worksheet and Testing Report templates reviewed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Access Review Worksheet and Testing Report templates reviewed",
      "body": "Access Review Worksheet and Testing Report templates reviewed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tv-001-ref-246",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-TV-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-TV-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand least privilege, account states and finding types — and the sensitivity of the data being handled — before requesting any account extract.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 8.2 — Privileged access rights; Annex A 8.3 — Information access restriction; Annex A 8.5 — Secure authentication; Annex A 5.18 — Access rights.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.AA-01 (Identities and credentials managed); PR.AA-02 (Identities are proofed and bound to credentials); Control 5 (Account Management); Control 6 (Access Control Management).\n3. Obtain and review every provided template and document: Access Review Worksheet (spreadsheet: Account ID, Username, System, Role/Permission Level, Last Login Date, HR Status, Finding Type, Recommended Action, Priority, IT Owner Action); Access Control Testing Report Template (Word — executive summary, findings table, remediation recommendations, sign-off block); Cross-Reference Methodology Guide.\n4. Secure prerequisite inputs: System owner and HR contact identified and extract requests understood; Access Review Worksheet and Testing Report templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-TV-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Access Control Testing Report — findings table (account status, issue type, recommendation), executive summary with remediation priority, and a signed remediation acknowledgement from the IT Manager.",
      "tab": "clarify"
    },
    {
      "id": "rua-tv-001-ref-247",
      "title": "Deliverable Specification — Access Control Testing Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Access Control Testing Report — findings table (account status, issue type, recommendation), executive summary with remediation…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nAccess Control Testing Report — findings table (account status, issue type, recommendation), executive summary with remediation priority, and a signed remediation acknowledgement from the IT Manager.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-tv-001-ref-248",
      "title": "Study note / primer — Least privilege and role-based access (Annex A 5.18, 8.2, 8.3, 8.5)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Least privilege and role-based access (Annex A 5.18, 8.2, 8.3, 8.5)",
      "body": "A study primer that enables you to explain, in your own words: Least privilege and role-based access (Annex A 5.18, 8.2, 8.3, 8.5).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-001-ref-249",
      "title": "Study note / primer — Joiner–mover–leaver lifecycle and where access errors creep in",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Joiner–mover–leaver lifecycle and where access errors creep in",
      "body": "A study primer that enables you to explain, in your own words: Joiner–mover–leaver lifecycle and where access errors creep in.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-001-ref-250",
      "title": "Study note / primer — Orphaned versus dormant versus mismatched accounts",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Orphaned versus dormant versus mismatched accounts",
      "body": "A study primer that enables you to explain, in your own words: Orphaned versus dormant versus mismatched accounts.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-001-ref-251",
      "title": "Study note / primer — Independent data sources: system extract cross-referenced against HR records",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Independent data sources: system extract cross-referenced against HR records",
      "body": "A study primer that enables you to explain, in your own words: Independent data sources: system extract cross-referenced against HR records.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-001-ref-252",
      "title": "Study note / primer — Finding types, priorities and remediation deadlines",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Finding types, priorities and remediation deadlines",
      "body": "A study primer that enables you to explain, in your own words: Finding types, priorities and remediation deadlines.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "TV-002": [
    {
      "id": "rua-tv-002-ref-253",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.36 — Compliance with policies, rules and standards for information security; Annex A 6.3 — Information security awareness,…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.36 | Compliance with policies, rules and standards for information security |\n| Annex A 6.3 | Information security awareness, education and training |\n| Annex A 8.1 | User endpoint devices |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-tv-002-ref-254",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.PO-02 (Policy reviewed and communicated); PR.AT-01 (Personnel provided awareness and training); DE.CM (Monitoring…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.PO-02 (Policy reviewed and communicated) |\n| — | PR.AT-01 (Personnel provided awareness and training) |\n| — | DE.CM (Monitoring performed). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-tv-002-ref-255",
      "title": "Control Testing Workpaper Template",
      "kind": "Template / Working Document",
      "summary": "Word — Control ID, Control Statement, Test Procedure, Evidence Requested, Evidence Received, Result, Finding Narrative, Recommendation",
      "body": "Working template you obtain and review: Control Testing Workpaper Template. Word — Control ID, Control Statement, Test Procedure, Evidence Requested, Evidence Received, Result, Finding Narrative, Recommendation\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tv-002-ref-256",
      "title": "Spot-Check Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — cover page, scope, methodology, findings summary table, recommendations, appendix",
      "body": "Working template you obtain and review: Spot-Check Report Template. Word — cover page, scope, methodology, findings summary table, recommendations, appendix\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tv-002-ref-257",
      "title": "Compliance Rate Calculator",
      "kind": "Template / Working Document",
      "summary": "Excel formula sheet",
      "body": "Working template you obtain and review: Compliance Rate Calculator. Excel formula sheet\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tv-002-ref-258",
      "title": "Three candidate policies identified (e.g. from GRC101-GRM-002 or the document library)",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Three candidate policies identified (e.g. from GRC101-GRM-002 or the document library)",
      "body": "Three candidate policies identified (e.g. from GRC101-GRM-002 or the document library)\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tv-002-ref-259",
      "title": "Control Testing Workpaper and Spot-Check Report templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Control Testing Workpaper and Spot-Check Report templates reviewed",
      "body": "Control Testing Workpaper and Spot-Check Report templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tv-002-ref-260",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-TV-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-TV-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you can turn a policy clause into a testable control statement and understands evidence sampling before selecting policies or requesting evidence.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.36 — Compliance with policies, rules and standards for information security; Annex A 6.3 — Information security awareness, education and training; Annex A 8.1 — User endpoint devices.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.PO-02 (Policy reviewed and communicated); PR.AT-01 (Personnel provided awareness and training); DE.CM (Monitoring performed).\n3. Obtain and review every provided template and document: Control Testing Workpaper Template (Word — Control ID, Control Statement, Test Procedure, Evidence Requested, Evidence Received, Result, Finding Narrative, Recommendation); Spot-Check Report Template (Word — cover page, scope, methodology, findings summary table, recommendations, appendix); Compliance Rate Calculator (Excel formula sheet).\n4. Secure prerequisite inputs: Three candidate policies identified (e.g. from GRC101-GRM-002 or the document library); Control Testing Workpaper and Spot-Check Report templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-TV-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Policy Compliance Spot-Check Report — control testing workpapers (one per policy), compliance rate summary, findings table, and remediation recommendations.",
      "tab": "clarify"
    },
    {
      "id": "rua-tv-002-ref-261",
      "title": "Deliverable Specification — Policy Compliance Spot-Check Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Policy Compliance Spot-Check Report — control testing workpapers (one per policy), compliance rate summary, findings table, and…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nPolicy Compliance Spot-Check Report — control testing workpapers (one per policy), compliance rate summary, findings table, and remediation recommendations.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-tv-002-ref-262",
      "title": "Study note / primer — Control statements: specific, observable, testable assertions derived from policy text",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Control statements: specific, observable, testable assertions derived…",
      "body": "A study primer that enables you to explain, in your own words: Control statements: specific, observable, testable assertions derived from policy text.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-002-ref-263",
      "title": "Study note / primer — Evidence sampling: what to request, sample size, and period covered",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Evidence sampling: what to request, sample size, and period covered",
      "body": "A study primer that enables you to explain, in your own words: Evidence sampling: what to request, sample size, and period covered.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-002-ref-264",
      "title": "Study note / primer — Test techniques: inquiry versus inspection of evidence",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Test techniques: inquiry versus inspection of evidence",
      "body": "A study primer that enables you to explain, in your own words: Test techniques: inquiry versus inspection of evidence.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-002-ref-265",
      "title": "Study note / primer — Result categories: compliant / partially compliant / non-compliant",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Result categories: compliant / partially compliant / non-compliant",
      "body": "A study primer that enables you to explain, in your own words: Result categories: compliant / partially compliant / non-compliant.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tv-002-ref-266",
      "title": "Study note / primer — Compliance rate calculation and remediation recommendations (Annex A 5.36)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Compliance rate calculation and remediation recommendations (Annex A 5.36)",
      "body": "A study primer that enables you to explain, in your own words: Compliance rate calculation and remediation recommendations (Annex A 5.36).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "MM-001": [
    {
      "id": "rua-mm-001-ref-267",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 9.1 — Monitoring, measurement, analysis and evaluation; Clause 9.3 — Management review; Annex A 5.35 — Independent review of…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 9.1 | Monitoring, measurement, analysis and evaluation |\n| Clause 9.3 | Management review |\n| Annex A 5.35 | Independent review of information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-mm-001-ref-268",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.RM-06 (Risk management outcomes communicated); DE.CM-09 (Computing hardware and software monitored); PR.PS-04 (Logs of…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.RM-06 (Risk management outcomes communicated) |\n| — | DE.CM-09 (Computing hardware and software monitored) |\n| — | PR.PS-04 (Logs of events created). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-mm-001-ref-269",
      "title": "KPI Definition Card Template",
      "kind": "Template / Working Document",
      "summary": "Word — one card per KPI: name, formula, data source, frequency, owner, target, RAG thresholds, chart type",
      "body": "Working template you obtain and review: KPI Definition Card Template. Word — one card per KPI: name, formula, data source, frequency, owner, target, RAG thresholds, chart type\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-001-ref-270",
      "title": "Monthly GRC Metrics Tracking Spreadsheet Template",
      "kind": "Template / Working Document",
      "summary": "Excel — auto-RAG, 12-month rolling, trend sparklines",
      "body": "Working template you obtain and review: Monthly GRC Metrics Tracking Spreadsheet Template. Excel — auto-RAG, 12-month rolling, trend sparklines\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-001-ref-271",
      "title": "GRC Metrics Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page: RAG dashboard, commentary, actions required",
      "body": "Working template you obtain and review: GRC Metrics Report Template. Word — one-page: RAG dashboard, commentary, actions required\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-001-ref-272",
      "title": "Compliance status outputs from earlier tasks for this organisation reviewed as the baseline",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Compliance status outputs from earlier tasks for this organisation reviewed as the baseline",
      "body": "Compliance status outputs from earlier tasks for this organisation reviewed as the baseline\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-mm-001-ref-273",
      "title": "KPI Definition Card, Tracking Spreadsheet and Metrics Report templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "KPI Definition Card, Tracking Spreadsheet and Metrics Report templates reviewed",
      "body": "KPI Definition Card, Tracking Spreadsheet and Metrics Report templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-mm-001-ref-274",
      "title": "IT and HR data owners identified for month-1 collection",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "IT and HR data owners identified for month-1 collection",
      "body": "IT and HR data owners identified for month-1 collection\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-mm-001-ref-275",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-MM-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-MM-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand what makes a good GRC KPI, how RAG thresholds work, and what Clause 9.1 requires, before defining any metric or building the tracker.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 9.1 — Monitoring, measurement, analysis and evaluation; Clause 9.3 — Management review; Annex A 5.35 — Independent review of information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.RM-06 (Risk management outcomes communicated); DE.CM-09 (Computing hardware and software monitored); PR.PS-04 (Logs of events created).\n3. Obtain and review every provided template and document: KPI Definition Card Template (Word — one card per KPI: name, formula, data source, frequency, owner, target, RAG thresholds, chart type); Monthly GRC Metrics Tracking Spreadsheet Template (Excel — auto-RAG, 12-month rolling, trend sparklines); GRC Metrics Report Template (Word — one-page: RAG dashboard, commentary, actions required).\n4. Secure prerequisite inputs: Compliance status outputs from earlier tasks for this organisation reviewed as the baseline; KPI Definition Card, Tracking Spreadsheet and Metrics Report templates reviewed; IT and HR data owners identified for month-1 collection.\n5. Re-read the task description and all activity steps of GRC101-MM-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: GRC KPI Definition Pack (five KPI Definition Cards) + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report (one-page).",
      "tab": "clarify"
    },
    {
      "id": "rua-mm-001-ref-276",
      "title": "Deliverable Specification — GRC KPI Definition Pack (five KPI Definition Cards) + Monthly GRC Metrics Tracking…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "GRC KPI Definition Pack (five KPI Definition Cards) + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report (one-page).",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nGRC KPI Definition Pack (five KPI Definition Cards) + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report (one-page).\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-mm-001-ref-277",
      "title": "Study note / primer — KPI versus KRI, and leading versus lagging indicators",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: KPI versus KRI, and leading versus lagging indicators",
      "body": "A study primer that enables you to explain, in your own words: KPI versus KRI, and leading versus lagging indicators.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-001-ref-278",
      "title": "Study note / primer — KPI anatomy: name, formula, data source, frequency, owner, target, RAG thresholds",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: KPI anatomy: name, formula, data source, frequency, owner, target, RAG…",
      "body": "A study primer that enables you to explain, in your own words: KPI anatomy: name, formula, data source, frequency, owner, target, RAG thresholds.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-001-ref-279",
      "title": "Study note / primer — Data source reliability and collection effort",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Data source reliability and collection effort",
      "body": "A study primer that enables you to explain, in your own words: Data source reliability and collection effort.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-001-ref-280",
      "title": "Study note / primer — ISO 27001 Clause 9.1 monitoring and measurement requirements",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001 Clause 9.1 monitoring and measurement requirements",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001 Clause 9.1 monitoring and measurement requirements.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-001-ref-281",
      "title": "Study note / primer — Interpreting RAG status into management commentary",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Interpreting RAG status into management commentary",
      "body": "A study primer that enables you to explain, in your own words: Interpreting RAG status into management commentary.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "MM-002": [
    {
      "id": "rua-mm-002-ref-282",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 6.1.2 — Information security risk assessment (ongoing); Clause 9.1 — Monitoring, measurement, analysis and evaluation; Annex A…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 6.1.2 | Information security risk assessment (ongoing) |\n| Clause 9.1 | Monitoring, measurement, analysis and evaluation |\n| Annex A 5.9 | Inventory of information and other associated assets (maintained) |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-mm-002-ref-283",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — ID.RA-06 (Risks identified); GV.RM-07 (Risk responses managed); DE.CM (Adverse events monitored).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | ID.RA-06 (Risks identified) |\n| — | GV.RM-07 (Risk responses managed) |\n| — | DE.CM (Adverse events monitored). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-mm-002-ref-284",
      "title": "Risk Register Review Meeting Agenda Template",
      "kind": "Template / Working Document",
      "summary": "Word",
      "body": "Working template you obtain and review: Risk Register Review Meeting Agenda Template. Word\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-002-ref-285",
      "title": "Risk Register",
      "kind": "Template / Working Document",
      "summary": "reuse from GRM-001 template — version controlled",
      "body": "Working template you obtain and review: Risk Register. reuse from GRM-001 template — version controlled\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-002-ref-286",
      "title": "Monthly Risk Summary Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page: portfolio table, RAG movement arrows, narrative commentary",
      "body": "Working template you obtain and review: Monthly Risk Summary Template. Word — one-page: portfolio table, RAG movement arrows, narrative commentary\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-002-ref-287",
      "title": "Risk Register Version Control Log",
      "kind": "Template / Working Document",
      "summary": "spreadsheet tab",
      "body": "Working template you obtain and review: Risk Register Version Control Log. spreadsheet tab\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-mm-002-ref-288",
      "title": "Risk Register from GRC101-GRM-001 obtained, current version confirmed",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Risk Register from GRC101-GRM-001 obtained, current version confirmed",
      "body": "Risk Register from GRC101-GRM-001 obtained, current version confirmed\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-mm-002-ref-289",
      "title": "Both risk owners identified and availability checked",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Both risk owners identified and availability checked",
      "body": "Both risk owners identified and availability checked\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-mm-002-ref-290",
      "title": "Review Meeting Agenda and Monthly Risk Summary templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Review Meeting Agenda and Monthly Risk Summary templates reviewed",
      "body": "Review Meeting Agenda and Monthly Risk Summary templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-mm-002-ref-291",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-MM-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-MM-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand the risk register as a living document and can facilitate a structured review meeting before scheduling it with the risk owners.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 6.1.2 — Information security risk assessment (ongoing); Clause 9.1 — Monitoring, measurement, analysis and evaluation; Annex A 5.9 — Inventory of information and other associated assets (maintained).\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — ID.RA-06 (Risks identified); GV.RM-07 (Risk responses managed); DE.CM (Adverse events monitored).\n3. Obtain and review every provided template and document: Risk Register Review Meeting Agenda Template (Word); Risk Register (reuse from GRM-001 template — version controlled); Monthly Risk Summary Template (Word — one-page: portfolio table, RAG movement arrows, narrative commentary); Risk Register Version Control Log (spreadsheet tab).\n4. Secure prerequisite inputs: Risk Register from GRC101-GRM-001 obtained, current version confirmed; Both risk owners identified and availability checked; Review Meeting Agenda and Monthly Risk Summary templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-MM-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Updated Risk Register (version 2) + Monthly Risk Summary (one-page: portfolio overview, score movements, new risks, overdue treatments) + Meeting Minutes.",
      "tab": "clarify"
    },
    {
      "id": "rua-mm-002-ref-292",
      "title": "Deliverable Specification — Updated Risk Register (version 2) + Monthly Risk Summary (one-page: portfolio overview,…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Updated Risk Register (version 2) + Monthly Risk Summary (one-page: portfolio overview, score movements, new risks, overdue treatments)…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nUpdated Risk Register (version 2) + Monthly Risk Summary (one-page: portfolio overview, score movements, new risks, overdue treatments) + Meeting Minutes.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-mm-002-ref-293",
      "title": "Study note / primer — Risk registers as live artefacts: re-scoring triggers and treatment progress",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Risk registers as live artefacts: re-scoring triggers and treatment progress",
      "body": "A study primer that enables you to explain, in your own words: Risk registers as live artefacts: re-scoring triggers and treatment progress.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-002-ref-294",
      "title": "Study note / primer — Residual risk movement and portfolio-level interpretation",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Residual risk movement and portfolio-level interpretation",
      "body": "A study primer that enables you to explain, in your own words: Residual risk movement and portfolio-level interpretation.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-002-ref-295",
      "title": "Study note / primer — Meeting facilitation: agenda discipline, pre-reading, real-time capture",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Meeting facilitation: agenda discipline, pre-reading, real-time capture",
      "body": "A study primer that enables you to explain, in your own words: Meeting facilitation: agenda discipline, pre-reading, real-time capture.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-002-ref-296",
      "title": "Study note / primer — Consistent entry format for newly identified risks",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Consistent entry format for newly identified risks",
      "body": "A study primer that enables you to explain, in your own words: Consistent entry format for newly identified risks.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-mm-002-ref-297",
      "title": "Study note / primer — Version control of the register and evidence filing",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Version control of the register and evidence filing",
      "body": "A study primer that enables you to explain, in your own words: Version control of the register and evidence filing.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "CA-001": [
    {
      "id": "rua-ca-001-ref-298",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 6.3 — Information security awareness, education and training; Annex A 6.6 — Confidentiality or non-disclosure agreements; Annex…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 6.3 | Information security awareness, education and training |\n| Annex A 6.6 | Confidentiality or non-disclosure agreements |\n| Annex A 5.1 | Policies for information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-ca-001-ref-299",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — PR.AT-01 (Personnel provided awareness and training); CIS Controls v8 — Control 14.2 (Training for all roles with…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | PR.AT-01 (Personnel provided awareness and training) |\n| CIS Controls v8 | Control 14.2 (Training for all roles with security responsibilities) and 14.7 (Training for all users on identifying social engineering). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-ca-001-ref-300",
      "title": "Pre-Session Communication Template",
      "kind": "Template / Working Document",
      "summary": "email — 3-paragraph format",
      "body": "Working template you obtain and review: Pre-Session Communication Template. email — 3-paragraph format\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-001-ref-301",
      "title": "Training Attendance Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet",
      "body": "Working template you obtain and review: Training Attendance Register Template. spreadsheet\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-001-ref-302",
      "title": "Knowledge Check Answer Sheet",
      "kind": "Template / Working Document",
      "summary": "Word — participant copy",
      "body": "Working template you obtain and review: Knowledge Check Answer Sheet. Word — participant copy\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-001-ref-303",
      "title": "Knowledge Check Marking Sheet",
      "kind": "Template / Working Document",
      "summary": "mentor copy with answers",
      "body": "Working template you obtain and review: Knowledge Check Marking Sheet. mentor copy with answers\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-001-ref-304",
      "title": "Training Completion Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page: date, attendees, pass rate, findings, recommendations",
      "body": "Working template you obtain and review: Training Completion Report Template. Word — one-page: date, attendees, pass rate, findings, recommendations\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-001-ref-305",
      "title": "Finalised training module from GRC101-DD-002 obtained and rehearsed at least once",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Finalised training module from GRC101-DD-002 obtained and rehearsed at least once",
      "body": "Finalised training module from GRC101-DD-002 obtained and rehearsed at least once\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-001-ref-306",
      "title": "HR/Operations scheduling contact confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "HR/Operations scheduling contact confirmed",
      "body": "HR/Operations scheduling contact confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-001-ref-307",
      "title": "Attendance Register, Answer/Marking Sheets and Completion Report templates reviewed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Attendance Register, Answer/Marking Sheets and Completion Report templates reviewed",
      "body": "Attendance Register, Answer/Marking Sheets and Completion Report templates reviewed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-001-ref-308",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-CA-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-CA-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you know the DD-002 material thoroughly, understands delivery logistics and knowledge-check administration, and why completion records matter, before booking the session.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 6.3 — Information security awareness, education and training; Annex A 6.6 — Confidentiality or non-disclosure agreements; Annex A 5.1 — Policies for information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.AT-01 (Personnel provided awareness and training); Control 14.2 (Training for all roles with security responsibilities); and 14.7 (Training for all users on identifying social engineering).\n3. Obtain and review every provided template and document: Pre-Session Communication Template (email — 3-paragraph format); Training Attendance Register Template (spreadsheet); Knowledge Check Answer Sheet (Word — participant copy); Knowledge Check Marking Sheet (mentor copy with answers); Training Completion Report Template (Word — one-page: date, attendees, pass rate, findings, recommendations).\n4. Secure prerequisite inputs: Finalised training module from GRC101-DD-002 obtained and rehearsed at least once; HR/Operations scheduling contact confirmed; Attendance Register, Answer/Marking Sheets and Completion Report templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-CA-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Training Completion Report — attendance list, knowledge-check score summary, pass rate, qualitative observations, and recommendations for any staff requiring remedial guidance.",
      "tab": "clarify"
    },
    {
      "id": "rua-ca-001-ref-309",
      "title": "Deliverable Specification — Training Completion Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Training Completion Report — attendance list, knowledge-check score summary, pass rate, qualitative observations, and recommendations…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nTraining Completion Report — attendance list, knowledge-check score summary, pass rate, qualitative observations, and recommendations for any staff requiring remedial guidance.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-ca-001-ref-310",
      "title": "Study note / primer — Presenting technical content to a non-technical audience",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Presenting technical content to a non-technical audience",
      "body": "A study primer that enables you to explain, in your own words: Presenting technical content to a non-technical audience.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-001-ref-311",
      "title": "Study note / primer — Session logistics: room/video setup, equipment testing, timing to 30 minutes",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Session logistics: room/video setup, equipment testing, timing to 30 minutes",
      "body": "A study primer that enables you to explain, in your own words: Session logistics: room/video setup, equipment testing, timing to 30 minutes.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-001-ref-312",
      "title": "Study note / primer — Administering and scoring the five-question knowledge check (target ≥80% pass)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Administering and scoring the five-question knowledge check (target ≥80%…",
      "body": "A study primer that enables you to explain, in your own words: Administering and scoring the five-question knowledge check (target ≥80% pass).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-001-ref-313",
      "title": "Study note / primer — Attendance registers and training completion records as audit evidence under Annex A 6.3",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Attendance registers and training completion records as audit evidence…",
      "body": "A study primer that enables you to explain, in your own words: Attendance registers and training completion records as audit evidence under Annex A 6.3.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-001-ref-314",
      "title": "Study note / primer — Handling questions and unexpected disruptions gracefully",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Handling questions and unexpected disruptions gracefully",
      "body": "A study primer that enables you to explain, in your own words: Handling questions and unexpected disruptions gracefully.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "CA-002": [
    {
      "id": "rua-ca-002-ref-315",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 9.3 — Management review; Clause 9.1 — Monitoring, measurement, analysis and evaluation; Annex A 5.35 — Independent review of…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 9.3 | Management review |\n| Clause 9.1 | Monitoring, measurement, analysis and evaluation |\n| Annex A 5.35 | Independent review of information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-ca-002-ref-316",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.RM-06 (Risk management outcomes communicated); GV.OC-04 (Responsibilities are understood); ID.RA-09 (Third-party risk…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.RM-06 (Risk management outcomes communicated) |\n| — | GV.OC-04 (Responsibilities are understood) |\n| — | ID.RA-09 (Third-party risk assessed — referenced in reporting). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-ca-002-ref-317",
      "title": "Executive Compliance Status Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page with: header RAG indicator, top-3 risks table, top-3 achievements, open decisions table, 30-day outlook text box",
      "body": "Working template you obtain and review: Executive Compliance Status Report Template. Word — one-page with: header RAG indicator, top-3 risks table, top-3 achievements, open decisions table, 30-day outlook text box\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-002-ref-318",
      "title": "Plain-English GRC Writing Guide",
      "kind": "Template / Working Document",
      "summary": "reference card — 10 rules for writing for non-technical audiences",
      "body": "Working template you obtain and review: Plain-English GRC Writing Guide. reference card — 10 rules for writing for non-technical audiences\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-002-ref-319",
      "title": "Outputs from all completed tasks for the organisation gathered (gap analysis, risk register, maturity, metrics)",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Outputs from all completed tasks for the organisation gathered (gap analysis, risk register, maturity, metrics)",
      "body": "Outputs from all completed tasks for the organisation gathered (gap analysis, risk register, maturity, metrics)\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-002-ref-320",
      "title": "Executive Report Template and Plain-English GRC Writing Guide reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Executive Report Template and Plain-English GRC Writing Guide reviewed",
      "body": "Executive Report Template and Plain-English GRC Writing Guide reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-002-ref-321",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-CA-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-CA-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you have synthesised all completed task outputs for the organisation and understands executive communication principles before drafting the one-pager.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 9.3 — Management review; Clause 9.1 — Monitoring, measurement, analysis and evaluation; Annex A 5.35 — Independent review of information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.RM-06 (Risk management outcomes communicated); GV.OC-04 (Responsibilities are understood); ID.RA-09 (Third-party risk assessed — referenced in reporting).\n3. Obtain and review every provided template and document: Executive Compliance Status Report Template (Word — one-page with: header RAG indicator, top-3 risks table, top-3 achievements, open decisions table, 30-day outlook text box); Plain-English GRC Writing Guide (reference card — 10 rules for writing for non-technical audiences).\n4. Secure prerequisite inputs: Outputs from all completed tasks for the organisation gathered (gap analysis, risk register, maturity, metrics); Executive Report Template and Plain-English GRC Writing Guide reviewed.\n5. Re-read the task description and all activity steps of GRC101-CA-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Executive Compliance Status Report (one-page, management-ready) covering: RAG status, top risks, achievements, open decisions, and 30-day outlook.",
      "tab": "clarify"
    },
    {
      "id": "rua-ca-002-ref-322",
      "title": "Deliverable Specification — Executive Compliance Status Report (one-page, management-ready) covering: RAG status,…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Executive Compliance Status Report (one-page, management-ready) covering: RAG status, top risks, achievements, open decisions, and…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nExecutive Compliance Status Report (one-page, management-ready) covering: RAG status, top risks, achievements, open decisions, and 30-day outlook.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-ca-002-ref-323",
      "title": "Study note / primer — Synthesis versus detail: choosing the five messages that matter to management",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Synthesis versus detail: choosing the five messages that matter to…",
      "body": "A study primer that enables you to explain, in your own words: Synthesis versus detail: choosing the five messages that matter to management.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-002-ref-324",
      "title": "Study note / primer — Overall RAG status and how it is justified",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Overall RAG status and how it is justified",
      "body": "A study primer that enables you to explain, in your own words: Overall RAG status and how it is justified.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-002-ref-325",
      "title": "Study note / primer — Plain-English writing: concrete numbers, no jargon",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Plain-English writing: concrete numbers, no jargon",
      "body": "A study primer that enables you to explain, in your own words: Plain-English writing: concrete numbers, no jargon.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-002-ref-326",
      "title": "Study note / primer — Structure of the one-page report: risks, achievements, open decisions, 30-day outlook",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Structure of the one-page report: risks, achievements, open decisions,…",
      "body": "A study primer that enables you to explain, in your own words: Structure of the one-page report: risks, achievements, open decisions, 30-day outlook.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-002-ref-327",
      "title": "Study note / primer — ISO 27001 Clause 9.3 management review inputs",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001 Clause 9.3 management review inputs",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001 Clause 9.3 management review inputs.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "CA-003": [
    {
      "id": "rua-ca-003-ref-328",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 4.2 — Understanding the needs and expectations of interested parties; Clause 5.3 — Organisational roles, responsibilities and…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 4.2 | Understanding the needs and expectations of interested parties |\n| Clause 5.3 | Organisational roles, responsibilities and authorities |\n| Annex A 5.1 | Policies for information security |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-ca-003-ref-329",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.OC-02 (Internal and external stakeholders identified); GV.OC-03 (Legal, regulatory and contractual requirements…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.OC-02 (Internal and external stakeholders identified) |\n| — | GV.OC-03 (Legal, regulatory and contractual requirements understood). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-ca-003-ref-330",
      "title": "Stakeholder Interview Guide Template",
      "kind": "Template / Working Document",
      "summary": "Word — with interview purpose, rapport-building opener, 8–10 structured questions per role type, and closing prompt",
      "body": "Working template you obtain and review: Stakeholder Interview Guide Template. Word — with interview purpose, rapport-building opener, 8–10 structured questions per role type, and closing prompt\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-003-ref-331",
      "title": "Stakeholder Interview Summary Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page per interview: key quotes, concerns, knowledge gaps, priorities",
      "body": "Working template you obtain and review: Stakeholder Interview Summary Template. Word — one-page per interview: key quotes, concerns, knowledge gaps, priorities\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-003-ref-332",
      "title": "Stakeholder Needs Discovery Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — themes table, implications, recommendations",
      "body": "Working template you obtain and review: Stakeholder Needs Discovery Report Template. Word — themes table, implications, recommendations\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-ca-003-ref-333",
      "title": "Three stakeholders identified: IT Manager, HR Manager, business-unit lead",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Three stakeholders identified: IT Manager, HR Manager, business-unit lead",
      "body": "Three stakeholders identified: IT Manager, HR Manager, business-unit lead\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-003-ref-334",
      "title": "Stakeholder Interview Guide, Summary and Discovery Report templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Stakeholder Interview Guide, Summary and Discovery Report templates reviewed",
      "body": "Stakeholder Interview Guide, Summary and Discovery Report templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-003-ref-335",
      "title": "Advance briefing note for interviewees drafted",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Advance briefing note for interviewees drafted",
      "body": "Advance briefing note for interviewees drafted\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-ca-003-ref-336",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-CA-003",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-CA-003. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand structured interviewing — open questions, probing, active listening and thematic analysis — before approaching any stakeholder.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 4.2 — Understanding the needs and expectations of interested parties; Clause 5.3 — Organisational roles, responsibilities and authorities; Annex A 5.1 — Policies for information security.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.OC-02 (Internal and external stakeholders identified); GV.OC-03 (Legal, regulatory and contractual requirements understood).\n3. Obtain and review every provided template and document: Stakeholder Interview Guide Template (Word — with interview purpose, rapport-building opener, 8–10 structured questions per role type, and closing prompt); Stakeholder Interview Summary Template (Word — one-page per interview: key quotes, concerns, knowledge gaps, priorities); Stakeholder Needs Discovery Report Template (Word — themes table, implications, recommendations).\n4. Secure prerequisite inputs: Three stakeholders identified: IT Manager, HR Manager, business-unit lead; Stakeholder Interview Guide, Summary and Discovery Report templates reviewed; Advance briefing note for interviewees drafted.\n5. Re-read the task description and all activity steps of GRC101-CA-003; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Stakeholder Needs Discovery Report — cross-interview theme analysis, key quotes, stakeholder-specific recommendations, and implications for GRC programme design.",
      "tab": "clarify"
    },
    {
      "id": "rua-ca-003-ref-337",
      "title": "Deliverable Specification — Stakeholder Needs Discovery Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Stakeholder Needs Discovery Report — cross-interview theme analysis, key quotes, stakeholder-specific recommendations, and implications…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nStakeholder Needs Discovery Report — cross-interview theme analysis, key quotes, stakeholder-specific recommendations, and implications for GRC programme design.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-ca-003-ref-338",
      "title": "Study note / primer — Structured versus unstructured interviews and why structure aids comparison",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Structured versus unstructured interviews and why structure aids comparison",
      "body": "A study primer that enables you to explain, in your own words: Structured versus unstructured interviews and why structure aids comparison.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-003-ref-339",
      "title": "Study note / primer — Open questions, follow-up probes and avoiding leading questions",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Open questions, follow-up probes and avoiding leading questions",
      "body": "A study primer that enables you to explain, in your own words: Open questions, follow-up probes and avoiding leading questions.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-003-ref-340",
      "title": "Study note / primer — Active listening and structured note-taking",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Active listening and structured note-taking",
      "body": "A study primer that enables you to explain, in your own words: Active listening and structured note-taking.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-003-ref-341",
      "title": "Study note / primer — Thematic analysis across multiple interviews: concerns, gaps, priorities",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Thematic analysis across multiple interviews: concerns, gaps, priorities",
      "body": "A study primer that enables you to explain, in your own words: Thematic analysis across multiple interviews: concerns, gaps, priorities.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-ca-003-ref-342",
      "title": "Study note / primer — Interviewer neutrality and building rapport",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Interviewer neutrality and building rapport",
      "body": "A study primer that enables you to explain, in your own words: Interviewer neutrality and building rapport.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "RR-001": [
    {
      "id": "rua-rr-001-ref-343",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.26 — Response to information security incidents; Annex A 5.27 — Learning from information security incidents; Annex A 5.28 —…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.26 | Response to information security incidents |\n| Annex A 5.27 | Learning from information security incidents |\n| Annex A 5.28 | Collection of evidence |\n| Annex A 6.8 | Information security event reporting |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-rr-001-ref-344",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — RS.MA-01 (Incident response activities aligned with plan); RS.CO-02 (Incidents reported); RC.RP-01 (Recovery plan…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | RS.MA-01 (Incident response activities aligned with plan) |\n| — | RS.CO-02 (Incidents reported) |\n| — | RC.RP-01 (Recovery plan executed) |\n| CIS Controls v8 | Control 17 (Incident Response Management). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-rr-001-ref-345",
      "title": "Tabletop Observation Sheet",
      "kind": "Template / Working Document",
      "summary": "Word — with sections: timeline log, decision log, escalation log, communication gaps, resource gaps, deviations from procedure",
      "body": "Working template you obtain and review: Tabletop Observation Sheet. Word — with sections: timeline log, decision log, escalation log, communication gaps, resource gaps, deviations from procedure\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-rr-001-ref-346",
      "title": "Post-Exercise Lessons Learned Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — exercise summary, observations, top-3 improvements, procedure amendment proposals, sign-off",
      "body": "Working template you obtain and review: Post-Exercise Lessons Learned Report Template. Word — exercise summary, observations, top-3 improvements, procedure amendment proposals, sign-off\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-rr-001-ref-347",
      "title": "Tabletop Scenario Brief Template",
      "kind": "Template / Working Document",
      "summary": "provided by Incident Response & Crisis Manager mentor",
      "body": "Working template you obtain and review: Tabletop Scenario Brief Template. provided by Incident Response & Crisis Manager mentor\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-rr-001-ref-348",
      "title": "Incident Reporting Procedure from GRC101-DD-001 read and understood",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Incident Reporting Procedure from GRC101-DD-001 read and understood",
      "body": "Incident Reporting Procedure from GRC101-DD-001 read and understood\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-rr-001-ref-349",
      "title": "Tabletop scenario brief read before exercise day",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Tabletop scenario brief read before exercise day",
      "body": "Tabletop scenario brief read before exercise day\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-rr-001-ref-350",
      "title": "Observation Sheet and Lessons Learned Report templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Observation Sheet and Lessons Learned Report templates reviewed",
      "body": "Observation Sheet and Lessons Learned Report templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-rr-001-ref-351",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-RR-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-RR-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you have studied the incident reporting procedure and scenario brief and understands the observer's discipline before exercise day.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.26 — Response to information security incidents; Annex A 5.27 — Learning from information security incidents; Annex A 5.28 — Collection of evidence; Annex A 6.8 — Information security event reporting.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — RS.MA-01 (Incident response activities aligned with plan); RS.CO-02 (Incidents reported); RC.RP-01 (Recovery plan executed); Control 17 (Incident Response Management).\n3. Obtain and review every provided template and document: Tabletop Observation Sheet (Word — with sections: timeline log, decision log, escalation log, communication gaps, resource gaps, deviations from procedure); Post-Exercise Lessons Learned Report Template (Word — exercise summary, observations, top-3 improvements, procedure amendment proposals, sign-off); Tabletop Scenario Brief Template (provided by Incident Response & Crisis Manager mentor).\n4. Secure prerequisite inputs: Incident Reporting Procedure from GRC101-DD-001 read and understood; Tabletop scenario brief read before exercise day; Observation Sheet and Lessons Learned Report templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-RR-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Post-Exercise Lessons Learned Report — timeline of the exercise, structured observations, top-three improvement recommendations with proposed procedure amendments.",
      "tab": "clarify"
    },
    {
      "id": "rua-rr-001-ref-352",
      "title": "Deliverable Specification — Post-Exercise Lessons Learned Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Post-Exercise Lessons Learned Report — timeline of the exercise, structured observations, top-three improvement recommendations with…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nPost-Exercise Lessons Learned Report — timeline of the exercise, structured observations, top-three improvement recommendations with proposed procedure amendments.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-rr-001-ref-353",
      "title": "Study note / primer — Purpose of tabletop exercises: testing decisions and communication, not technology",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Purpose of tabletop exercises: testing decisions and communication, not…",
      "body": "A study primer that enables you to explain, in your own words: Purpose of tabletop exercises: testing decisions and communication, not technology.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-rr-001-ref-354",
      "title": "Study note / primer — The observer role: capture, do not participate in decisions",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The observer role: capture, do not participate in decisions",
      "body": "A study primer that enables you to explain, in your own words: The observer role: capture, do not participate in decisions.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-rr-001-ref-355",
      "title": "Study note / primer — Structured observation: timeline, decision, escalation and communication logs",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Structured observation: timeline, decision, escalation and communication…",
      "body": "A study primer that enables you to explain, in your own words: Structured observation: timeline, decision, escalation and communication logs.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-rr-001-ref-356",
      "title": "Study note / primer — Lessons-learned discipline under Annex A 5.27 and the 48-hour write-up window",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Lessons-learned discipline under Annex A 5.27 and the 48-hour write-up…",
      "body": "A study primer that enables you to explain, in your own words: Lessons-learned discipline under Annex A 5.27 and the 48-hour write-up window.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-rr-001-ref-357",
      "title": "Study note / primer — Turning observations into procedure amendment proposals",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Turning observations into procedure amendment proposals",
      "body": "A study primer that enables you to explain, in your own words: Turning observations into procedure amendment proposals.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "BCRP-001": [
    {
      "id": "rua-bcrp-001-ref-358",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.29 — Information security during disruption; Annex A 5.30 — ICT readiness for business continuity.",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.29 | Information security during disruption |\n| Annex A 5.30 | ICT readiness for business continuity |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-bcrp-001-ref-359",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — RC.RP-01 (Recovery plan executed); RC.RP-03 (Recovery activities and progress communicated); CIS Controls v8 — Control 11…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | RC.RP-01 (Recovery plan executed) |\n| — | RC.RP-03 (Recovery activities and progress communicated) |\n| CIS Controls v8 | Control 11 (Data Recovery). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-bcrp-001-ref-360",
      "title": "BIA Questionnaire Template",
      "kind": "Template / Working Document",
      "summary": "Word — structured questions: function identification, dependencies, financial impact, operational impact, RTO/RPO estimation,…",
      "body": "Working template you obtain and review: BIA Questionnaire Template. Word — structured questions: function identification, dependencies, financial impact, operational impact, RTO/RPO estimation, workarounds, IT systems required\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-bcrp-001-ref-361",
      "title": "BIA Summary Table Template",
      "kind": "Template / Working Document",
      "summary": "Excel — function, impact score, RTO, RPO, dependency, single point of failure, workaround",
      "body": "Working template you obtain and review: BIA Summary Table Template. Excel — function, impact score, RTO, RPO, dependency, single point of failure, workaround\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-bcrp-001-ref-362",
      "title": "BIA Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — standard BC report format",
      "body": "Working template you obtain and review: BIA Report Template. Word — standard BC report format\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-bcrp-001-ref-363",
      "title": "RTO/RPO Definition Reference Card",
      "kind": "Template / Working Document",
      "summary": "RTO/RPO Definition Reference Card",
      "body": "Working template you obtain and review: RTO/RPO Definition Reference Card.\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-bcrp-001-ref-364",
      "title": "Department selected with the mentor",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Department selected with the mentor",
      "body": "Department selected with the mentor\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-bcrp-001-ref-365",
      "title": "BIA Questionnaire, Summary Table and Report templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "BIA Questionnaire, Summary Table and Report templates reviewed",
      "body": "BIA Questionnaire, Summary Table and Report templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-bcrp-001-ref-366",
      "title": "60-minute interview with the department manager scheduled",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "60-minute interview with the department manager scheduled",
      "body": "60-minute interview with the department manager scheduled\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-bcrp-001-ref-367",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-BCRP-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-BCRP-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand critical functions, dependency mapping and the RTO/RPO vocabulary before conducting the BIA interview.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.29 — Information security during disruption; Annex A 5.30 — ICT readiness for business continuity.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — RC.RP-01 (Recovery plan executed); RC.RP-03 (Recovery activities and progress communicated); Control 11 (Data Recovery).\n3. Obtain and review every provided template and document: BIA Questionnaire Template (Word — structured questions: function identification, dependencies, financial impact, operational impact, RTO/RPO estimation, workarounds, IT systems required); BIA Summary Table Template (Excel — function, impact score, RTO, RPO, dependency, single point of failure, workaround); BIA Report Template (Word — standard BC report format); RTO/RPO Definition Reference Card.\n4. Secure prerequisite inputs: Department selected with the mentor; BIA Questionnaire, Summary Table and Report templates reviewed; 60-minute interview with the department manager scheduled.\n5. Re-read the task description and all activity steps of GRC101-BCRP-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: BIA Report (for one department) — critical functions list, impact scores, RTO/RPO table, single points of failure analysis, and recommended continuity measures.",
      "tab": "clarify"
    },
    {
      "id": "rua-bcrp-001-ref-368",
      "title": "Deliverable Specification — BIA Report (for one department)",
      "kind": "Deliverable Acceptance Specification",
      "summary": "BIA Report (for one department) — critical functions list, impact scores, RTO/RPO table, single points of failure analysis, and…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nBIA Report (for one department) — critical functions list, impact scores, RTO/RPO table, single points of failure analysis, and recommended continuity measures.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-bcrp-001-ref-369",
      "title": "Study note / primer — Critical functions and how criticality is determined",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Critical functions and how criticality is determined",
      "body": "A study primer that enables you to explain, in your own words: Critical functions and how criticality is determined.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-001-ref-370",
      "title": "Study note / primer — Dependency mapping: people, systems, data, suppliers",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Dependency mapping: people, systems, data, suppliers",
      "body": "A study primer that enables you to explain, in your own words: Dependency mapping: people, systems, data, suppliers.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-001-ref-371",
      "title": "Study note / primer — RTO (Recovery Time Objective) versus RPO (Recovery Point Objective) versus maximum tolerable…",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: RTO (Recovery Time Objective) versus RPO (Recovery Point Objective)…",
      "body": "A study primer that enables you to explain, in your own words: RTO (Recovery Time Objective) versus RPO (Recovery Point Objective) versus maximum tolerable downtime.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-001-ref-372",
      "title": "Study note / primer — How impact escalates over time (hours versus days)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: How impact escalates over time (hours versus days)",
      "body": "A study primer that enables you to explain, in your own words: How impact escalates over time (hours versus days).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-001-ref-373",
      "title": "Study note / primer — Single points of failure and credible workarounds (Annex A 5.29, 5.30)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Single points of failure and credible workarounds (Annex A 5.29, 5.30)",
      "body": "A study primer that enables you to explain, in your own words: Single points of failure and credible workarounds (Annex A 5.29, 5.30).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "BCRP-002": [
    {
      "id": "rua-bcrp-002-ref-374",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.30 — ICT readiness for business continuity; Annex A 8.13 — Information backup; Annex A 8.14 — Redundancy of information…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.30 | ICT readiness for business continuity |\n| Annex A 8.13 | Information backup |\n| Annex A 8.14 | Redundancy of information processing facilities |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-bcrp-002-ref-375",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — RC.RP-02 (Recovery plan updated); PR.DS-11 (Data backups created); CIS Controls v8 — Control 11.1 (Establish and maintain…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | RC.RP-02 (Recovery plan updated) |\n| — | PR.DS-11 (Data backups created) |\n| CIS Controls v8 | Control 11.1 (Establish and maintain a data recovery process) and 11.4 (Establish and maintain an isolated instance of recovery data). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-bcrp-002-ref-376",
      "title": "ICT DR Checklist Template",
      "kind": "Template / Working Document",
      "summary": "Word — four sections: Preparation, Incident Declaration, Restoration Steps, Return to Normal; each step has: step number, action,…",
      "body": "Working template you obtain and review: ICT DR Checklist Template. Word — four sections: Preparation, Incident Declaration, Restoration Steps, Return to Normal; each step has: step number, action, responsible person, expected outcome, actual outcome, sign-off\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-bcrp-002-ref-377",
      "title": "DR Documentation Library Filing Guide",
      "kind": "Template / Working Document",
      "summary": "Word — where to store and version DR artefacts",
      "body": "Working template you obtain and review: DR Documentation Library Filing Guide. Word — where to store and version DR artefacts\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-bcrp-002-ref-378",
      "title": "RTO/RPO figures from GRC101-BCRP-001 obtained",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "RTO/RPO figures from GRC101-BCRP-001 obtained",
      "body": "RTO/RPO figures from GRC101-BCRP-001 obtained\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-bcrp-002-ref-379",
      "title": "Target system selected with the IT Manager and mentor",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Target system selected with the IT Manager and mentor",
      "body": "Target system selected with the IT Manager and mentor\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-bcrp-002-ref-380",
      "title": "ICT DR Checklist Template and Filing Guide reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "ICT DR Checklist Template and Filing Guide reviewed",
      "body": "ICT DR Checklist Template and Filing Guide reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-bcrp-002-ref-381",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-BCRP-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-BCRP-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand backup and restoration concepts and how BIA-derived RTO/RPO figures become checklist success criteria, before drafting.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.30 — ICT readiness for business continuity; Annex A 8.13 — Information backup; Annex A 8.14 — Redundancy of information processing facilities.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — RC.RP-02 (Recovery plan updated); PR.DS-11 (Data backups created); Control 11.1 (Establish and maintain a data recovery process); and 11.4 (Establish and maintain an isolated instance of recovery data).\n3. Obtain and review every provided template and document: ICT DR Checklist Template (Word — four sections: Preparation, Incident Declaration, Restoration Steps, Return to Norma); each step has: step number, action, responsible person, expected outcome, actual outcome, sign-off); DR Documentation Library Filing Guide (Word — where to store and version DR artefacts).\n4. Secure prerequisite inputs: RTO/RPO figures from GRC101-BCRP-001 obtained; Target system selected with the IT Manager and mentor; ICT DR Checklist Template and Filing Guide reviewed.\n5. Re-read the task description and all activity steps of GRC101-BCRP-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: ICT DR Checklist (for one system) — step-by-step pre-incident, incident, restoration, and return-to-normal sections, with RTO/RPO success criteria and sign-off blocks.",
      "tab": "clarify"
    },
    {
      "id": "rua-bcrp-002-ref-382",
      "title": "Deliverable Specification — ICT DR Checklist (for one system)",
      "kind": "Deliverable Acceptance Specification",
      "summary": "ICT DR Checklist (for one system) — step-by-step pre-incident, incident, restoration, and return-to-normal sections, with RTO/RPO…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nICT DR Checklist (for one system) — step-by-step pre-incident, incident, restoration, and return-to-normal sections, with RTO/RPO success criteria and sign-off blocks.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-bcrp-002-ref-383",
      "title": "Study note / primer — Backup types, schedules and verification — why an untested backup is a hope, not a control",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Backup types, schedules and verification — why an untested backup is a…",
      "body": "A study primer that enables you to explain, in your own words: Backup types, schedules and verification — why an untested backup is a hope, not a control.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-002-ref-384",
      "title": "Study note / primer — Failover versus restoration",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Failover versus restoration",
      "body": "A study primer that enables you to explain, in your own words: Failover versus restoration.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-002-ref-385",
      "title": "Study note / primer — DR checklist structure: Preparation, Incident Declaration, Restoration, Return to Normal",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: DR checklist structure: Preparation, Incident Declaration, Restoration,…",
      "body": "A study primer that enables you to explain, in your own words: DR checklist structure: Preparation, Incident Declaration, Restoration, Return to Normal.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-002-ref-386",
      "title": "Study note / primer — RTO/RPO from the BIA as measurable success criteria (Annex A 5.30, 8.13, 8.14)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: RTO/RPO from the BIA as measurable success criteria (Annex A 5.30, 8.13,…",
      "body": "A study primer that enables you to explain, in your own words: RTO/RPO from the BIA as measurable success criteria (Annex A 5.30, 8.13, 8.14).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-bcrp-002-ref-387",
      "title": "Study note / primer — Talk-through testing versus live restoration testing",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Talk-through testing versus live restoration testing",
      "body": "A study primer that enables you to explain, in your own words: Talk-through testing versus live restoration testing.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "TPRM-001": [
    {
      "id": "rua-tprm-001-ref-388",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.19 — Information security in supplier relationships; Annex A 5.20 — Addressing information security within supplier…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.19 | Information security in supplier relationships |\n| Annex A 5.20 | Addressing information security within supplier agreements |\n| Annex A 5.22 | Monitoring, review and change management of supplier services |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-tprm-001-ref-389",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.SC-04 (Suppliers and third parties informed of their roles); GV.SC-06 (Planning and due diligence performed); CIS…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.SC-04 (Suppliers and third parties informed of their roles) |\n| — | GV.SC-06 (Planning and due diligence performed) |\n| CIS Controls v8 | Control 15 (Service Provider Management). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-tprm-001-ref-390",
      "title": "Supplier Register Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Vendor ID, Vendor Name, Service, Data Access Type, System Access, Criticality Score, Location, Certification Held,…",
      "body": "Working template you obtain and review: Supplier Register Template. spreadsheet: Vendor ID, Vendor Name, Service, Data Access Type, System Access, Criticality Score, Location, Certification Held, Composite Risk Rating, DPA Status, Contract Expiry, Primary Contact, Notes\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tprm-001-ref-391",
      "title": "Five-Criterion Risk Rating Guide",
      "kind": "Template / Working Document",
      "summary": "Word — criteria definitions and scoring anchors",
      "body": "Working template you obtain and review: Five-Criterion Risk Rating Guide. Word — criteria definitions and scoring anchors\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tprm-001-ref-392",
      "title": "High-Risk Vendor Summary Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page alert format",
      "body": "Working template you obtain and review: High-Risk Vendor Summary Template. Word — one-page alert format\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tprm-001-ref-393",
      "title": "Access to contract management, accounts payable and IT vendor records confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Access to contract management, accounts payable and IT vendor records confirmed",
      "body": "Access to contract management, accounts payable and IT vendor records confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tprm-001-ref-394",
      "title": "Supplier Register Template and Five-Criterion Rating Guide reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Supplier Register Template and Five-Criterion Rating Guide reviewed",
      "body": "Supplier Register Template and Five-Criterion Rating Guide reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tprm-001-ref-395",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-TPRM-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-TPRM-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand third-party risk drivers, the five-criterion rating model and DPA obligations before gathering the vendor list.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.19 — Information security in supplier relationships; Annex A 5.20 — Addressing information security within supplier agreements; Annex A 5.22 — Monitoring, review and change management of supplier services.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.SC-04 (Suppliers and third parties informed of their roles); GV.SC-06 (Planning and due diligence performed); Control 15 (Service Provider Management).\n3. Obtain and review every provided template and document: Supplier Register Template (spreadsheet: Vendor ID, Vendor Name, Service, Data Access Type, System Access, Criticality Score, Location, Certification Held, Composite Risk Rating, DPA Status, Contract Expiry, Primary Contact, Notes); Five-Criterion Risk Rating Guide (Word — criteria definitions and scoring anchors); High-Risk Vendor Summary Template (Word — one-page alert format).\n4. Secure prerequisite inputs: Access to contract management, accounts payable and IT vendor records confirmed; Supplier Register Template and Five-Criterion Rating Guide reviewed.\n5. Re-read the task description and all activity steps of GRC101-TPRM-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Supplier Register — full vendor inventory with risk ratings, data-access type, contract status, and DPA gap flags; plus a High-Risk Vendor Summary.",
      "tab": "clarify"
    },
    {
      "id": "rua-tprm-001-ref-396",
      "title": "Deliverable Specification — Supplier Register",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Supplier Register — full vendor inventory with risk ratings, data-access type, contract status, and DPA gap flags; plus a High-Risk…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nSupplier Register — full vendor inventory with risk ratings, data-access type, contract status, and DPA gap flags; plus a High-Risk Vendor Summary.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-tprm-001-ref-397",
      "title": "Study note / primer — Why third parties are a risk channel: data access, system access, criticality",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Why third parties are a risk channel: data access, system access,…",
      "body": "A study primer that enables you to explain, in your own words: Why third parties are a risk channel: data access, system access, criticality.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-001-ref-398",
      "title": "Study note / primer — The five-criterion risk rating model and composite Low/Medium/High scoring",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The five-criterion risk rating model and composite Low/Medium/High scoring",
      "body": "A study primer that enables you to explain, in your own words: The five-criterion risk rating model and composite Low/Medium/High scoring.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-001-ref-399",
      "title": "Study note / primer — Data access levels: none / view / process / store",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Data access levels: none / view / process / store",
      "body": "A study primer that enables you to explain, in your own words: Data access levels: none / view / process / store.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-001-ref-400",
      "title": "Study note / primer — Data-processing agreements under GDPR Article 28 — when they are required",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Data-processing agreements under GDPR Article 28 — when they are required",
      "body": "A study primer that enables you to explain, in your own words: Data-processing agreements under GDPR Article 28 — when they are required.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-001-ref-401",
      "title": "Study note / primer — Vendor discovery sources: contracts, accounts payable, IT records (Annex A 5.19–5.22)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Vendor discovery sources: contracts, accounts payable, IT records (Annex…",
      "body": "A study primer that enables you to explain, in your own words: Vendor discovery sources: contracts, accounts payable, IT records (Annex A 5.19–5.22).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "TPRM-002": [
    {
      "id": "rua-tprm-002-ref-402",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 5.20 — Addressing information security within supplier agreements; Annex A 5.21 — Managing information security in the ICT…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 5.20 | Addressing information security within supplier agreements |\n| Annex A 5.21 | Managing information security in the ICT supply chain |\n| Annex A 5.19 | Information security in supplier relationships |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-tprm-002-ref-403",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.SC-06 (Planning and due diligence performed); GV.SC-07 (Risks posed by suppliers assessed); CIS Controls v8 — Control…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.SC-06 (Planning and due diligence performed) |\n| — | GV.SC-07 (Risks posed by suppliers assessed) |\n| CIS Controls v8 | Control 15.2 (Establish and maintain a process to address weaknesses in third-party service provider security). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-tprm-002-ref-404",
      "title": "Vendor Security Questionnaire Template",
      "kind": "Template / Working Document",
      "summary": "Word — 25 questions covering: information security policy, access management, incident response, business continuity, subprocessors,…",
      "body": "Working template you obtain and review: Vendor Security Questionnaire Template. Word — 25 questions covering: information security policy, access management, incident response, business continuity, subprocessors, certifications, physical security, network security, encryption, data deletion\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tprm-002-ref-405",
      "title": "Due-Diligence Assessment Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — vendor summary, questionnaire score, gap table, risk rating, recommended mitigations, sign-off",
      "body": "Working template you obtain and review: Due-Diligence Assessment Report Template. Word — vendor summary, questionnaire score, gap table, risk rating, recommended mitigations, sign-off\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tprm-002-ref-406",
      "title": "Due-Diligence Scoring Guide",
      "kind": "Template / Working Document",
      "summary": "reference card",
      "body": "Working template you obtain and review: Due-Diligence Scoring Guide. reference card\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-tprm-002-ref-407",
      "title": "Supplier Register from GRC101-TPRM-001 obtained and a Medium-risk vendor selected with the mentor",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Supplier Register from GRC101-TPRM-001 obtained and a Medium-risk vendor selected with the mentor",
      "body": "Supplier Register from GRC101-TPRM-001 obtained and a Medium-risk vendor selected with the mentor\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tprm-002-ref-408",
      "title": "Vendor Security Questionnaire and Assessment Report templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Vendor Security Questionnaire and Assessment Report templates reviewed",
      "body": "Vendor Security Questionnaire and Assessment Report templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tprm-002-ref-409",
      "title": "Vendor security/compliance contact identified",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Vendor security/compliance contact identified",
      "body": "Vendor security/compliance contact identified\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-tprm-002-ref-410",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-TPRM-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-TPRM-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand questionnaire-based due diligence — customisation, credibility assessment and scoring — before contacting the vendor.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 5.20 — Addressing information security within supplier agreements; Annex A 5.21 — Managing information security in the ICT supply chain; Annex A 5.19 — Information security in supplier relationships.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.SC-06 (Planning and due diligence performed); GV.SC-07 (Risks posed by suppliers assessed); Control 15.2 (Establish and maintain a process to address weaknesses in third-party service provider security).\n3. Obtain and review every provided template and document: Vendor Security Questionnaire Template (Word — 25 questions covering: information security policy, access management, incident response, business continuity, subprocessors, certifications, physical security, network security, encryption, data deletion); Due-Diligence Assessment Report Template (Word — vendor summary, questionnaire score, gap table, risk rating, recommended mitigations, sign-off); Due-Diligence Scoring Guide (reference card).\n4. Secure prerequisite inputs: Supplier Register from GRC101-TPRM-001 obtained and a Medium-risk vendor selected with the mentor; Vendor Security Questionnaire and Assessment Report templates reviewed; Vendor security/compliance contact identified.\n5. Re-read the task description and all activity steps of GRC101-TPRM-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Vendor Due-Diligence Assessment Report — completed questionnaire (with assessment annotations), Due-Diligence Score, gap list, risk rating confirmation, and recommended mitigations.",
      "tab": "clarify"
    },
    {
      "id": "rua-tprm-002-ref-411",
      "title": "Deliverable Specification — Vendor Due-Diligence Assessment Report",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Vendor Due-Diligence Assessment Report — completed questionnaire (with assessment annotations), Due-Diligence Score, gap list, risk…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nVendor Due-Diligence Assessment Report — completed questionnaire (with assessment annotations), Due-Diligence Score, gap list, risk rating confirmation, and recommended mitigations.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-tprm-002-ref-412",
      "title": "Study note / primer — Customising a standard questionnaire to the vendor's service and data footprint",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Customising a standard questionnaire to the vendor's service and data…",
      "body": "A study primer that enables you to explain, in your own words: Customising a standard questionnaire to the vendor's service and data footprint.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-002-ref-413",
      "title": "Study note / primer — Assessing response credibility: specific, evidenced answers versus vague assurances",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Assessing response credibility: specific, evidenced answers versus vague…",
      "body": "A study primer that enables you to explain, in your own words: Assessing response credibility: specific, evidenced answers versus vague assurances.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-002-ref-414",
      "title": "Study note / primer — Reliance on certifications (ISO 27001, SOC 2) and its limits",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Reliance on certifications (ISO 27001, SOC 2) and its limits",
      "body": "A study primer that enables you to explain, in your own words: Reliance on certifications (ISO 27001, SOC 2) and its limits.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-002-ref-415",
      "title": "Study note / primer — Mapping responses to Annex A controls and flagging gaps",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Mapping responses to Annex A controls and flagging gaps",
      "body": "A study primer that enables you to explain, in your own words: Mapping responses to Annex A controls and flagging gaps.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-tprm-002-ref-416",
      "title": "Study note / primer — Due-diligence scoring and professional vendor communication",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Due-diligence scoring and professional vendor communication",
      "body": "A study primer that enables you to explain, in your own words: Due-diligence scoring and professional vendor communication.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "LRC-001": [
    {
      "id": "rua-lrc-001-ref-417",
      "title": "GDPR (EU) 2016/679 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Article 13 — Information to be provided where personal data are collected from the data subject; Article 14 — Information to be provided…",
      "body": "The governing control references you must study before work begins, drawn from GDPR (EU) 2016/679 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Article 13 | Information to be provided where personal data are collected from the data subject |\n| Article 14 | Information to be provided where personal data have not been obtained from the data subject |\n| Recital 39 | Principle of transparency |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-lrc-001-ref-418",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.OC-05 (Legal, regulatory and contractual requirements understood); PR.DS-01 (Data at rest protected — contextual); CIS…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.OC-05 (Legal, regulatory and contractual requirements understood) |\n| — | PR.DS-01 (Data at rest protected — contextual) |\n| CIS Controls v8 | Control 3.14 (Log sensitive data access — contextual). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-lrc-001-ref-419",
      "title": "Privacy Notice Gap-Check Checklist",
      "kind": "Template / Working Document",
      "summary": "Word — 14 mandatory elements with checklist column, notes column, and gap flag",
      "body": "Working template you obtain and review: Privacy Notice Gap-Check Checklist. Word — 14 mandatory elements with checklist column, notes column, and gap flag\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-lrc-001-ref-420",
      "title": "Privacy Notice Template",
      "kind": "Template / Working Document",
      "summary": "Word — GDPR-compliant structure covering all Article 13/14 elements in plain language",
      "body": "Working template you obtain and review: Privacy Notice Template. Word — GDPR-compliant structure covering all Article 13/14 elements in plain language\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-lrc-001-ref-421",
      "title": "Plain Language Writing Guide",
      "kind": "Template / Working Document",
      "summary": "reference card — 10 rules for accessible legal drafting",
      "body": "Working template you obtain and review: Plain Language Writing Guide. reference card — 10 rules for accessible legal drafting\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-lrc-001-ref-422",
      "title": "Sector Benchmark Privacy Notice",
      "kind": "Template / Working Document",
      "summary": "anonymised example — provided by mentor",
      "body": "Working template you obtain and review: Sector Benchmark Privacy Notice. anonymised example — provided by mentor\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-lrc-001-ref-423",
      "title": "Current public privacy notice obtained (website version)",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Current public privacy notice obtained (website version)",
      "body": "Current public privacy notice obtained (website version)\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-lrc-001-ref-424",
      "title": "Gap-Check Checklist, Privacy Notice Template and Plain Language Guide reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Gap-Check Checklist, Privacy Notice Template and Plain Language Guide reviewed",
      "body": "Gap-Check Checklist, Privacy Notice Template and Plain Language Guide reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-lrc-001-ref-425",
      "title": "Legal/DPO contact confirmed for review",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "Legal/DPO contact confirmed for review",
      "body": "Legal/DPO contact confirmed for review\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-lrc-001-ref-426",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-LRC-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-LRC-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you know the mandatory content of GDPR Articles 13 and 14 and plain-language drafting standards before reviewing the live notice.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Article 13 — Information to be provided where personal data are collected from the data subject; Article 14 — Information to be provided where personal data have not been obtained from the data subject; Recital 39 — Principle of transparency.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.OC-05 (Legal, regulatory and contractual requirements understood); PR.DS-01 (Data at rest protected — contextual); Control 3.14 (Log sensitive data access — contextual).\n3. Obtain and review every provided template and document: Privacy Notice Gap-Check Checklist (Word — 14 mandatory elements with checklist column, notes column, and gap flag); Privacy Notice Template (Word — GDPR-compliant structure covering all Article 13/14 elements in plain language); Plain Language Writing Guide (reference card — 10 rules for accessible legal drafting); Sector Benchmark Privacy Notice (anonymised example — provided by mentor).\n4. Secure prerequisite inputs: Current public privacy notice obtained (website version); Gap-Check Checklist, Privacy Notice Template and Plain Language Guide reviewed; Legal/DPO contact confirmed for review.\n5. Re-read the task description and all activity steps of GRC101-LRC-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Privacy Notice Gap-Check Report (checklist with gap findings) + Revised Privacy Notice Draft (ready for DPO/Legal sign-off).",
      "tab": "clarify"
    },
    {
      "id": "rua-lrc-001-ref-427",
      "title": "Deliverable Specification — Privacy Notice Gap-Check Report (checklist with gap findings) + Revised Privacy Notice…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Privacy Notice Gap-Check Report (checklist with gap findings) + Revised Privacy Notice Draft (ready for DPO/Legal sign-off).",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nPrivacy Notice Gap-Check Report (checklist with gap findings) + Revised Privacy Notice Draft (ready for DPO/Legal sign-off).\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to GDPR (EU) 2016/679 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-lrc-001-ref-428",
      "title": "Study note / primer — Article 13 (data collected from the subject) versus Article 14 (data obtained indirectly)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Article 13 (data collected from the subject) versus Article 14 (data…",
      "body": "A study primer that enables you to explain, in your own words: Article 13 (data collected from the subject) versus Article 14 (data obtained indirectly).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-lrc-001-ref-429",
      "title": "Study note / primer — The 14 mandatory privacy notice elements in the gap-check checklist",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The 14 mandatory privacy notice elements in the gap-check checklist",
      "body": "A study primer that enables you to explain, in your own words: The 14 mandatory privacy notice elements in the gap-check checklist.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-lrc-001-ref-430",
      "title": "Study note / primer — Plain language and readability: Flesch-Kincaid Grade 8 target",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Plain language and readability: Flesch-Kincaid Grade 8 target",
      "body": "A study primer that enables you to explain, in your own words: Plain language and readability: Flesch-Kincaid Grade 8 target.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-lrc-001-ref-431",
      "title": "Study note / primer — Layered notice design and sector good practice",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Layered notice design and sector good practice",
      "body": "A study primer that enables you to explain, in your own words: Layered notice design and sector good practice.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-lrc-001-ref-432",
      "title": "Study note / primer — The Legal/DPO review and sign-off role",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The Legal/DPO review and sign-off role",
      "body": "A study primer that enables you to explain, in your own words: The Legal/DPO review and sign-off role.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "PE-001": [
    {
      "id": "rua-pe-001-ref-433",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 6.2 — Information security objectives and planning to achieve them; Clause 5.3 — Organisational roles, responsibilities and…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 6.2 | Information security objectives and planning to achieve them |\n| Clause 5.3 | Organisational roles, responsibilities and authorities |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-pe-001-ref-434",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.OC (Organisational Context); GV.RM-01 (Risk management objectives established).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.OC (Organisational Context) |\n| — | GV.RM-01 (Risk management objectives established). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-pe-001-ref-435",
      "title": "Project Charter Template",
      "kind": "Template / Working Document",
      "summary": "Word — background, objectives, success criteria, scope, out-of-scope, deliverables, team, governance, risks/assumptions, sign-off block",
      "body": "Working template you obtain and review: Project Charter Template. Word — background, objectives, success criteria, scope, out-of-scope, deliverables, team, governance, risks/assumptions, sign-off block\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-001-ref-436",
      "title": "Milestone Gantt Template",
      "kind": "Template / Working Document",
      "summary": "Excel — 6-month view with milestone diamonds, owner, and status",
      "body": "Working template you obtain and review: Milestone Gantt Template. Excel — 6-month view with milestone diamonds, owner, and status\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-001-ref-437",
      "title": "Kick-Off Meeting Agenda Template",
      "kind": "Template / Working Document",
      "summary": "Word — standard agenda with attendees, objectives, roles, questions, next steps",
      "body": "Working template you obtain and review: Kick-Off Meeting Agenda Template. Word — standard agenda with attendees, objectives, roles, questions, next steps\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-001-ref-438",
      "title": "RACI Matrix Template",
      "kind": "Template / Working Document",
      "summary": "Excel",
      "body": "Working template you obtain and review: RACI Matrix Template. Excel\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-001-ref-439",
      "title": "Initiative scope agreed with the mentor (e.g. the AA-002 gap-closure programme)",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Initiative scope agreed with the mentor (e.g. the AA-002 gap-closure programme)",
      "body": "Initiative scope agreed with the mentor (e.g. the AA-002 gap-closure programme)\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-pe-001-ref-440",
      "title": "Project Charter, Milestone Gantt and Kick-Off Agenda templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Project Charter, Milestone Gantt and Kick-Off Agenda templates reviewed",
      "body": "Project Charter, Milestone Gantt and Kick-Off Agenda templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-pe-001-ref-441",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-PE-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-PE-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand what a charter locks in — scope, success criteria, governance — and the sponsor's role before drafting or convening a kick-off.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 6.2 — Information security objectives and planning to achieve them; Clause 5.3 — Organisational roles, responsibilities and authorities.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.OC (Organisational Context); GV.RM-01 (Risk management objectives established).\n3. Obtain and review every provided template and document: Project Charter Template (Word — background, objectives, success criteria, scope, out-of-scope, deliverables, team, governance, risks/assumptions, sign-off block); Milestone Gantt Template (Excel — 6-month view with milestone diamonds, owner, and status); Kick-Off Meeting Agenda Template (Word — standard agenda with attendees, objectives, roles, questions, next steps); RACI Matrix Template (Excel).\n4. Secure prerequisite inputs: Initiative scope agreed with the mentor (e.g. the AA-002 gap-closure programme); Project Charter, Milestone Gantt and Kick-Off Agenda templates reviewed.\n5. Re-read the task description and all activity steps of GRC101-PE-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Signed Project Charter + Milestone Gantt (high-level) + Kick-Off Meeting Minutes.",
      "tab": "clarify"
    },
    {
      "id": "rua-pe-001-ref-442",
      "title": "Deliverable Specification — Signed Project Charter + Milestone Gantt (high-level) + Kick-Off Meeting Minutes.",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Signed Project Charter + Milestone Gantt (high-level) + Kick-Off Meeting Minutes.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nSigned Project Charter + Milestone Gantt (high-level) + Kick-Off Meeting Minutes.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-pe-001-ref-443",
      "title": "Study note / primer — The project charter as the initiative's authorising document",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The project charter as the initiative's authorising document",
      "body": "A study primer that enables you to explain, in your own words: The project charter as the initiative's authorising document.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-001-ref-444",
      "title": "Study note / primer — Scope and out-of-scope discipline — preventing scope creep at day one",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Scope and out-of-scope discipline — preventing scope creep at day one",
      "body": "A study primer that enables you to explain, in your own words: Scope and out-of-scope discipline — preventing scope creep at day one.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-001-ref-445",
      "title": "Study note / primer — Success criteria versus deliverables",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Success criteria versus deliverables",
      "body": "A study primer that enables you to explain, in your own words: Success criteria versus deliverables.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-001-ref-446",
      "title": "Study note / primer — Governance roles: sponsor, project lead, workstream owners (Clause 5.3)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Governance roles: sponsor, project lead, workstream owners (Clause 5.3)",
      "body": "A study primer that enables you to explain, in your own words: Governance roles: sponsor, project lead, workstream owners (Clause 5.3).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-001-ref-447",
      "title": "Study note / primer — Milestone-level planning versus task-level planning, and initial risk identification",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Milestone-level planning versus task-level planning, and initial risk…",
      "body": "A study primer that enables you to explain, in your own words: Milestone-level planning versus task-level planning, and initial risk identification.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "PE-002": [
    {
      "id": "rua-pe-002-ref-448",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 7.5 — Documented information; Annex A 5.35 — Independent review of information security; Annex A 5.36 — Compliance with policies,…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 7.5 | Documented information |\n| Annex A 5.35 | Independent review of information security |\n| Annex A 5.36 | Compliance with policies, rules and standards |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-pe-002-ref-449",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.PO-02 (Policy reviewed, updated, communicated and enforced); ID.RA-01 (Vulnerabilities in assets identified); DE.CM-09…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.PO-02 (Policy reviewed, updated, communicated and enforced) |\n| — | ID.RA-01 (Vulnerabilities in assets identified) |\n| — | DE.CM-09 (Computing hardware and software monitored). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-pe-002-ref-450",
      "title": "Audit Evidence Requirements List",
      "kind": "Template / Working Document",
      "summary": "Word — per ISO 27001 clause: control objective, expected evidence types, evidence quality criteria",
      "body": "Working template you obtain and review: Audit Evidence Requirements List. Word — per ISO 27001 clause: control objective, expected evidence types, evidence quality criteria\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-002-ref-451",
      "title": "Evidence Labelling Convention Guide",
      "kind": "Template / Working Document",
      "summary": "Word — naming syntax and folder structure",
      "body": "Working template you obtain and review: Evidence Labelling Convention Guide. Word — naming syntax and folder structure\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-002-ref-452",
      "title": "Evidence Index Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Evidence ID, Control Reference, Evidence Description, Source, Date, Collected By, Quality Check Status, Location",
      "body": "Working template you obtain and review: Evidence Index Template. spreadsheet: Evidence ID, Control Reference, Evidence Description, Source, Date, Collected By, Quality Check Status, Location\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-002-ref-453",
      "title": "Audit Evidence Checklist",
      "kind": "Template / Working Document",
      "summary": "Word — quality-check criteria per evidence item",
      "body": "Working template you obtain and review: Audit Evidence Checklist. Word — quality-check criteria per evidence item\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-pe-002-ref-454",
      "title": "ISO 27001 clause or Annex A control set selected with the mentor",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "ISO 27001 clause or Annex A control set selected with the mentor",
      "body": "ISO 27001 clause or Annex A control set selected with the mentor\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-pe-002-ref-455",
      "title": "Audit Evidence Requirements List, Labelling Convention Guide and Evidence Index Template reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Audit Evidence Requirements List, Labelling Convention Guide and Evidence Index Template reviewed",
      "body": "Audit Evidence Requirements List, Labelling Convention Guide and Evidence Index Template reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-pe-002-ref-456",
      "title": "System owners holding the evidence identified",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "System owners holding the evidence identified",
      "body": "System owners holding the evidence identified\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-pe-002-ref-457",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-PE-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-PE-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand audit evidence quality, labelling conventions and what an auditor looks for, before requesting any evidence items.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 7.5 — Documented information; Annex A 5.35 — Independent review of information security; Annex A 5.36 — Compliance with policies, rules and standards.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.PO-02 (Policy reviewed, updated, communicated and enforced); ID.RA-01 (Vulnerabilities in assets identified); DE.CM-09 (Computing hardware and software monitored).\n3. Obtain and review every provided template and document: Audit Evidence Requirements List (Word — per ISO 27001 clause: control objective, expected evidence types, evidence quality criteria); Evidence Labelling Convention Guide (Word — naming syntax and folder structure); Evidence Index Template (spreadsheet: Evidence ID, Control Reference, Evidence Description, Source, Date, Collected By, Quality Check Status, Location); Audit Evidence Checklist (Word — quality-check criteria per evidence item).\n4. Secure prerequisite inputs: ISO 27001 clause or Annex A control set selected with the mentor; Audit Evidence Requirements List, Labelling Convention Guide and Evidence Index Template reviewed; System owners holding the evidence identified.\n5. Re-read the task description and all activity steps of GRC101-PE-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Audit Evidence Pack — labelled evidence files, Evidence Index (spreadsheet), and a completed self-review Audit Evidence Checklist.",
      "tab": "clarify"
    },
    {
      "id": "rua-pe-002-ref-458",
      "title": "Deliverable Specification — Audit Evidence Pack",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Audit Evidence Pack — labelled evidence files, Evidence Index (spreadsheet), and a completed self-review Audit Evidence Checklist.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nAudit Evidence Pack — labelled evidence files, Evidence Index (spreadsheet), and a completed self-review Audit Evidence Checklist.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-pe-002-ref-459",
      "title": "Study note / primer — Evidence quality: relevance, sufficiency, reliability, currency",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Evidence quality: relevance, sufficiency, reliability, currency",
      "body": "A study primer that enables you to explain, in your own words: Evidence quality: relevance, sufficiency, reliability, currency.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-002-ref-460",
      "title": "Study note / primer — Evidence types: records, configuration exports, meeting minutes, logs, approvals",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Evidence types: records, configuration exports, meeting minutes, logs,…",
      "body": "A study primer that enables you to explain, in your own words: Evidence types: records, configuration exports, meeting minutes, logs, approvals.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-002-ref-461",
      "title": "Study note / primer — The Evidence Labelling Convention and folder structure",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The Evidence Labelling Convention and folder structure",
      "body": "A study primer that enables you to explain, in your own words: The Evidence Labelling Convention and folder structure.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-002-ref-462",
      "title": "Study note / primer — The Evidence Index as the auditor's entry point",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The Evidence Index as the auditor's entry point",
      "body": "A study primer that enables you to explain, in your own words: The Evidence Index as the auditor's entry point.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-pe-002-ref-463",
      "title": "Study note / primer — Mock-audit thinking: what will the auditor ask about each item? (Clause 7.5, Annex A 5.35, 5.36)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Mock-audit thinking: what will the auditor ask about each item? (Clause…",
      "body": "A study primer that enables you to explain, in your own words: Mock-audit thinking: what will the auditor ask about each item? (Clause 7.5, Annex A 5.35, 5.36).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "QA-001": [
    {
      "id": "rua-qa-001-ref-464",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 7.5.2 — Creating and updating documented information; Clause 7.5.3 — Control of documented information; Annex A 5.36 — Compliance…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 7.5.2 | Creating and updating documented information |\n| Clause 7.5.3 | Control of documented information |\n| Annex A 5.36 | Compliance with policies, rules and standards |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-qa-001-ref-465",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.PO-02 (Policy reviewed, updated, communicated); GV.OC (Organisational context maintained).",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.PO-02 (Policy reviewed, updated, communicated) |\n| — | GV.OC (Organisational context maintained). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-qa-001-ref-466",
      "title": "Document Quality Review Checklist",
      "kind": "Template / Working Document",
      "summary": "Word — criteria: document control completeness, version number, approval signatures, scope accuracy, policy statement completeness,…",
      "body": "Working template you obtain and review: Document Quality Review Checklist. Word — criteria: document control completeness, version number, approval signatures, scope accuracy, policy statement completeness, control references, plain language, review date currency\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-001-ref-467",
      "title": "Correction Request Form",
      "kind": "Template / Working Document",
      "summary": "Word — Correction ID, Document, Section, Deficiency Description, Severity, Recommended Action, Due Date, Resolved Y/N",
      "body": "Working template you obtain and review: Correction Request Form. Word — Correction ID, Document, Section, Deficiency Description, Severity, Recommended Action, Due Date, Resolved Y/N\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-001-ref-468",
      "title": "Correction Tracking Log",
      "kind": "Template / Working Document",
      "summary": "Excel — Correction ID, status, document owner, resolution date",
      "body": "Working template you obtain and review: Correction Tracking Log. Excel — Correction ID, status, document owner, resolution date\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-001-ref-469",
      "title": "Quality Review Closure Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — one-page summary",
      "body": "Working template you obtain and review: Quality Review Closure Report Template. Word — one-page summary\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-001-ref-470",
      "title": "Three GRC documents selected with the mentor (e.g. outputs of GRM-002 or DD-001)",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "Three GRC documents selected with the mentor (e.g. outputs of GRM-002 or DD-001)",
      "body": "Three GRC documents selected with the mentor (e.g. outputs of GRM-002 or DD-001)\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-qa-001-ref-471",
      "title": "Quality Review Checklist, Correction Request Form and Tracking Log reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Quality Review Checklist, Correction Request Form and Tracking Log reviewed",
      "body": "Quality Review Checklist, Correction Request Form and Tracking Log reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-qa-001-ref-472",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-QA-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-QA-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand document quality criteria, deficiency severity and the correction workflow before reviewing any document or approaching its owner.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 7.5.2 — Creating and updating documented information; Clause 7.5.3 — Control of documented information; Annex A 5.36 — Compliance with policies, rules and standards.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.PO-02 (Policy reviewed, updated, communicated); GV.OC (Organisational context maintained).\n3. Obtain and review every provided template and document: Document Quality Review Checklist (Word — criteria: document control completeness, version number, approval signatures, scope accuracy, policy statement completeness, control references, plain language, review date currency); Correction Request Form (Word — Correction ID, Document, Section, Deficiency Description, Severity, Recommended Action, Due Date, Resolved Y/N); Correction Tracking Log (Excel — Correction ID, status, document owner, resolution date); Quality Review Closure Report Template (Word — one-page summary).\n4. Secure prerequisite inputs: Three GRC documents selected with the mentor (e.g. outputs of GRM-002 or DD-001); Quality Review Checklist, Correction Request Form and Tracking Log reviewed.\n5. Re-read the task description and all activity steps of GRC101-QA-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Quality Review Report (deficiency list with severities and correction requests) + Correction Tracking Log + Quality Review Closure Report.",
      "tab": "clarify"
    },
    {
      "id": "rua-qa-001-ref-473",
      "title": "Deliverable Specification — Quality Review Report (deficiency list with severities and correction requests) +…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Quality Review Report (deficiency list with severities and correction requests) + Correction Tracking Log + Quality Review Closure Report.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nQuality Review Report (deficiency list with severities and correction requests) + Correction Tracking Log + Quality Review Closure Report.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-qa-001-ref-474",
      "title": "Study note / primer — Document quality criteria: document control completeness, versioning, approvals, scope…",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Document quality criteria: document control completeness, versioning,…",
      "body": "A study primer that enables you to explain, in your own words: Document quality criteria: document control completeness, versioning, approvals, scope accuracy, control references, plain language, review currency.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-001-ref-475",
      "title": "Study note / primer — Major versus Minor deficiency classification",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Major versus Minor deficiency classification",
      "body": "A study primer that enables you to explain, in your own words: Major versus Minor deficiency classification.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-001-ref-476",
      "title": "Study note / primer — The Correction Request workflow: raise, discuss, track, re-check, close",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The Correction Request workflow: raise, discuss, track, re-check, close",
      "body": "A study primer that enables you to explain, in your own words: The Correction Request workflow: raise, discuss, track, re-check, close.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-001-ref-477",
      "title": "Study note / primer — Reviewer objectivity and constructive feedback to document owners",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Reviewer objectivity and constructive feedback to document owners",
      "body": "A study primer that enables you to explain, in your own words: Reviewer objectivity and constructive feedback to document owners.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-001-ref-478",
      "title": "Study note / primer — Clauses 7.5.2 / 7.5.3 as the quality baseline",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Clauses 7.5.2 / 7.5.3 as the quality baseline",
      "body": "A study primer that enables you to explain, in your own words: Clauses 7.5.2 / 7.5.3 as the quality baseline.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "QA-002": [
    {
      "id": "rua-qa-002-ref-479",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 9.1 — Monitoring, measurement, analysis and evaluation; Annex A 5.35 — Independent review of information security; Annex A 5.36 —…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 9.1 | Monitoring, measurement, analysis and evaluation |\n| Annex A 5.35 | Independent review of information security |\n| Annex A 5.36 | Compliance with policies, rules and standards |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-qa-002-ref-480",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — DE.CM-09 (Computing hardware and software monitored); GV.PO-02 (Policy reviewed and enforced); CIS Controls v8 — Control…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | DE.CM-09 (Computing hardware and software monitored) |\n| — | GV.PO-02 (Policy reviewed and enforced) |\n| CIS Controls v8 | Control 18 (Penetration Testing — awareness only at GRC 101 level). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-qa-002-ref-481",
      "title": "Control Testing Methodology Sheet Template",
      "kind": "Template / Working Document",
      "summary": "Word — Control ID, Control Objective, Test Approach, Test Steps (numbered), Evidence Required, Evidence Quality Criteria, Pass/Fail…",
      "body": "Working template you obtain and review: Control Testing Methodology Sheet Template. Word — Control ID, Control Objective, Test Approach, Test Steps (numbered), Evidence Required, Evidence Quality Criteria, Pass/Fail Criteria, Frequency, Testing Owner\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-002-ref-482",
      "title": "Testing Methodology Overview Template",
      "kind": "Template / Working Document",
      "summary": "Word — sampling rationale, frequency schedule, documentation standards, escalation path",
      "body": "Working template you obtain and review: Testing Methodology Overview Template. Word — sampling rationale, frequency schedule, documentation standards, escalation path\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-002-ref-483",
      "title": "Audit Standard Reference Extract",
      "kind": "Template / Working Document",
      "summary": "excerpts from ISAE 3000, IIA Standards — provided by mentor",
      "body": "Working template you obtain and review: Audit Standard Reference Extract. excerpts from ISAE 3000, IIA Standards — provided by mentor\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-qa-002-ref-484",
      "title": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained and three controls shortlisted",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained and three controls shortlisted",
      "body": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained and three controls shortlisted\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-qa-002-ref-485",
      "title": "Methodology Sheet and Overview templates plus audit-standard reference materials reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Methodology Sheet and Overview templates plus audit-standard reference materials reviewed",
      "body": "Methodology Sheet and Overview templates plus audit-standard reference materials reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-qa-002-ref-486",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-QA-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-QA-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand audit test approaches, sampling and pass/fail definition before selecting controls or writing methodology sheets.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 9.1 — Monitoring, measurement, analysis and evaluation; Annex A 5.35 — Independent review of information security; Annex A 5.36 — Compliance with policies, rules and standards.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — DE.CM-09 (Computing hardware and software monitored); GV.PO-02 (Policy reviewed and enforced); Control 18 (Penetration Testing — awareness only at GRC 101 level).\n3. Obtain and review every provided template and document: Control Testing Methodology Sheet Template (Word — Control ID, Control Objective, Test Approach, Test Steps (numbered), Evidence Required, Evidence Quality Criteria, Pass/Fail Criteria, Frequency, Testing Owner); Testing Methodology Overview Template (Word — sampling rationale, frequency schedule, documentation standards, escalation path); Audit Standard Reference Extract (excerpts from ISAE 3000, IIA Standards — provided by mentor).\n4. Secure prerequisite inputs: ISO 27001 Control Matrix from GRC101-CRM-002 obtained and three controls shortlisted; Methodology Sheet and Overview templates plus audit-standard reference materials reviewed.\n5. Re-read the task description and all activity steps of GRC101-QA-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Three Control Testing Methodology Sheets + Testing Methodology Overview (one page) filed in the GRC QA Library.",
      "tab": "clarify"
    },
    {
      "id": "rua-qa-002-ref-487",
      "title": "Deliverable Specification — Three Control Testing Methodology Sheets + Testing Methodology Overview (one page) filed…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Three Control Testing Methodology Sheets + Testing Methodology Overview (one page) filed in the GRC QA Library.",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nThree Control Testing Methodology Sheets + Testing Methodology Overview (one page) filed in the GRC QA Library.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-qa-002-ref-488",
      "title": "Study note / primer — Test approaches: inquiry, observation, inspection, re-performance — and when each suffices",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Test approaches: inquiry, observation, inspection, re-performance — and…",
      "body": "A study primer that enables you to explain, in your own words: Test approaches: inquiry, observation, inspection, re-performance — and when each suffices.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-002-ref-489",
      "title": "Study note / primer — Sampling: rationale, size and period",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Sampling: rationale, size and period",
      "body": "A study primer that enables you to explain, in your own words: Sampling: rationale, size and period.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-002-ref-490",
      "title": "Study note / primer — Unambiguous pass/fail criteria",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Unambiguous pass/fail criteria",
      "body": "A study primer that enables you to explain, in your own words: Unambiguous pass/fail criteria.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-002-ref-491",
      "title": "Study note / primer — Repeatability and defensibility — another tester must reach the same result",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Repeatability and defensibility — another tester must reach the same result",
      "body": "A study primer that enables you to explain, in your own words: Repeatability and defensibility — another tester must reach the same result.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-qa-002-ref-492",
      "title": "Study note / primer — How professional audit firms document comparable tests (Clause 9.1, Annex A 5.35, 5.36)",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: How professional audit firms document comparable tests (Clause 9.1,…",
      "body": "A study primer that enables you to explain, in your own words: How professional audit firms document comparable tests (Clause 9.1, Annex A 5.35, 5.36).\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "KT-001": [
    {
      "id": "rua-kt-001-ref-493",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Annex A 6.1 — Screening; Annex A 6.2 — Terms and conditions of employment; Annex A 6.3 — Information security awareness, education and…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Annex A 6.1 | Screening |\n| Annex A 6.2 | Terms and conditions of employment |\n| Annex A 6.3 | Information security awareness, education and training |\n| Annex A 6.6 | Confidentiality or non-disclosure agreements |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-kt-001-ref-494",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — PR.AT-01 (Personnel provided awareness and training); GV.PO-02 (Policy communicated); CIS Controls v8 — Control 14.1…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | PR.AT-01 (Personnel provided awareness and training) |\n| — | GV.PO-02 (Policy communicated) |\n| CIS Controls v8 | Control 14.1 (Establish and maintain a security awareness programme). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-kt-001-ref-495",
      "title": "New Joiner GRC Reference Guide Template",
      "kind": "Template / Working Document",
      "summary": "Word — 4-page, with visual icons, colour-coded sections, and plain language",
      "body": "Working template you obtain and review: New Joiner GRC Reference Guide Template. Word — 4-page, with visual icons, colour-coded sections, and plain language\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-kt-001-ref-496",
      "title": "New Joiner GRC Checklist Template",
      "kind": "Template / Working Document",
      "summary": "Word — Day 1/7/30 table format, with manager and employee columns",
      "body": "Working template you obtain and review: New Joiner GRC Checklist Template. Word — Day 1/7/30 table format, with manager and employee columns\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-kt-001-ref-497",
      "title": "Day-1 Security Briefing Slide Deck Template",
      "kind": "Template / Working Document",
      "summary": "PowerPoint — 5-slide structure: welcome, key policies, how to report, data rules, who to call",
      "body": "Working template you obtain and review: Day-1 Security Briefing Slide Deck Template. PowerPoint — 5-slide structure: welcome, key policies, how to report, data rules, who to call\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-kt-001-ref-498",
      "title": "Organisation's key policies and procedures inventoried as source material",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Organisation's key policies and procedures inventoried as source material",
      "body": "Organisation's key policies and procedures inventoried as source material\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-kt-001-ref-499",
      "title": "Reference Guide, Checklist and Day-1 Slide Deck templates reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Reference Guide, Checklist and Day-1 Slide Deck templates reviewed",
      "body": "Reference Guide, Checklist and Day-1 Slide Deck templates reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-kt-001-ref-500",
      "title": "HR contact for the onboarding handover confirmed",
      "kind": "Prerequisite Input — Access / Scheduling",
      "summary": "HR contact for the onboarding handover confirmed",
      "body": "HR contact for the onboarding handover confirmed\n\n## Why this is required\nConfirms the people, access and time you need are secured, so the task is not blocked mid-way.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-kt-001-ref-501",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-KT-001",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-KT-001. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand what a new joiner actually needs in week one, and the design constraints of the pack, before curating any content.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Annex A 6.1 — Screening; Annex A 6.2 — Terms and conditions of employment; Annex A 6.3 — Information security awareness, education and training; Annex A 6.6 — Confidentiality or non-disclosure agreements.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — PR.AT-01 (Personnel provided awareness and training); GV.PO-02 (Policy communicated); Control 14.1 (Establish and maintain a security awareness programme).\n3. Obtain and review every provided template and document: New Joiner GRC Reference Guide Template (Word — 4-page, with visual icons, colour-coded sections, and plain language); New Joiner GRC Checklist Template (Word — Day 1/7/30 table format, with manager and employee columns); Day-1 Security Briefing Slide Deck Template (PowerPoint — 5-slide structure: welcome, key policies, how to report, data rules, who to call).\n4. Secure prerequisite inputs: Organisation's key policies and procedures inventoried as source material; Reference Guide, Checklist and Day-1 Slide Deck templates reviewed; HR contact for the onboarding handover confirmed.\n5. Re-read the task description and all activity steps of GRC101-KT-001; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: GRC Onboarding Pack — New Joiner GRC Reference Guide (4 pages), New Joiner GRC Checklist (Day 1/7/30), and Day-1 Security Briefing Slide Deck (5 slides); all handed over to HR.",
      "tab": "clarify"
    },
    {
      "id": "rua-kt-001-ref-502",
      "title": "Deliverable Specification — GRC Onboarding Pack",
      "kind": "Deliverable Acceptance Specification",
      "summary": "GRC Onboarding Pack — New Joiner GRC Reference Guide (4 pages), New Joiner GRC Checklist (Day 1/7/30), and Day-1 Security Briefing Slide…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nGRC Onboarding Pack — New Joiner GRC Reference Guide (4 pages), New Joiner GRC Checklist (Day 1/7/30), and Day-1 Security Briefing Slide Deck (5 slides); all handed over to HR.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-kt-001-ref-503",
      "title": "Study note / primer — Knowledge curation: the ten things every joiner must know",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Knowledge curation: the ten things every joiner must know",
      "body": "A study primer that enables you to explain, in your own words: Knowledge curation: the ten things every joiner must know.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-001-ref-504",
      "title": "Study note / primer — Day-1 / Day-7 / Day-30 sequencing of GRC actions",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Day-1 / Day-7 / Day-30 sequencing of GRC actions",
      "body": "A study primer that enables you to explain, in your own words: Day-1 / Day-7 / Day-30 sequencing of GRC actions.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-001-ref-505",
      "title": "Study note / primer — Visual, plain-language design within a four-page limit",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Visual, plain-language design within a four-page limit",
      "body": "A study primer that enables you to explain, in your own words: Visual, plain-language design within a four-page limit.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-001-ref-506",
      "title": "Study note / primer — Employment-lifecycle controls: Annex A 6.1, 6.2, 6.3, 6.6",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Employment-lifecycle controls: Annex A 6.1, 6.2, 6.3, 6.6",
      "body": "A study primer that enables you to explain, in your own words: Employment-lifecycle controls: Annex A 6.1, 6.2, 6.3, 6.6.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-001-ref-507",
      "title": "Study note / primer — Designing for handover: HR must be able to maintain the pack",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Designing for handover: HR must be able to maintain the pack",
      "body": "A study primer that enables you to explain, in your own words: Designing for handover: HR must be able to maintain the pack.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ],
  "KT-002": [
    {
      "id": "rua-kt-002-ref-508",
      "title": "ISO/IEC 27001:2022 — Governing Control References",
      "kind": "Control Reference Extract",
      "summary": "Clause 10.1 — Continual improvement; Clause 10.2 — Nonconformity and corrective action; Annex A 5.27 — Learning from information…",
      "body": "The governing control references you must study before work begins, drawn from ISO/IEC 27001:2022 — Governing Control References. Each is shown with its intent.\n\n| Reference | Intent |\n| Clause 10.1 | Continual improvement |\n| Clause 10.2 | Nonconformity and corrective action |\n| Annex A 5.27 | Learning from information security incidents |\n\n## Reading for you\nUnderstand not just what each reference says but why it applies to this organisation and its regulatory footprint.",
      "tab": "study"
    },
    {
      "id": "rua-kt-002-ref-509",
      "title": "Cross-Referenced Framework Mapping Sheet",
      "kind": "Framework Cross-Reference Mapping",
      "summary": "NIST CSF 2.0 — GV.RM-07 (Risk responses managed and outcomes communicated); RC.IM-01 (Recovery plan incorporates lessons learned); CIS…",
      "body": "How the governing controls for this task cross-reference to NIST CSF 2.0, so you can speak to both frameworks with one body of evidence.\n\n| Mapped reference | Meaning |\n| NIST CSF 2.0 | GV.RM-07 (Risk responses managed and outcomes communicated) |\n| — | RC.IM-01 (Recovery plan incorporates lessons learned) |\n| CIS Controls v8 | Control 17.8 (Conduct post-incident reviews). |\n\n## Why it matters\nA single artifact can answer both the governing standard and this framework — you should be able to show one deliverable satisfying both columns.",
      "tab": "study"
    },
    {
      "id": "rua-kt-002-ref-510",
      "title": "Lessons Learned Worksheet",
      "kind": "Template / Working Document",
      "summary": "Word — structured reflection questions: learning, successes, challenges, recommendations",
      "body": "Working template you obtain and review: Lessons Learned Worksheet. Word — structured reflection questions: learning, successes, challenges, recommendations\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-kt-002-ref-511",
      "title": "Lessons Learned Report Template",
      "kind": "Template / Working Document",
      "summary": "Word — introduction, key learnings table, programme improvement recommendations, portfolio index page",
      "body": "Working template you obtain and review: Lessons Learned Report Template. Word — introduction, key learnings table, programme improvement recommendations, portfolio index page\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-kt-002-ref-512",
      "title": "Mentee Portfolio Index Template",
      "kind": "Template / Working Document",
      "summary": "spreadsheet: Task ID, Task Name, Deliverable, File Location, Date Completed, Badge Earned",
      "body": "Working template you obtain and review: Mentee Portfolio Index Template. spreadsheet: Task ID, Task Name, Deliverable, File Location, Date Completed, Badge Earned\n\n## Typical structure\n- Purpose & scope — what the document is for and its boundary\n- Structured content — the fields / sections completed during the task\n- Owner & review — who maintains it and the review cadence",
      "tab": "inspect"
    },
    {
      "id": "rua-kt-002-ref-513",
      "title": "All completed task deliverables and working documents from the rotation gathered",
      "kind": "Prerequisite Input — Prior Task Output",
      "summary": "All completed task deliverables and working documents from the rotation gathered",
      "body": "All completed task deliverables and working documents from the rotation gathered\n\n## Why this is required\nBrings forward the output of an earlier RUA task as an input, so work builds on what already exists.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-kt-002-ref-514",
      "title": "Lessons Learned Worksheet, Report Template and Portfolio Index Template reviewed",
      "kind": "Prerequisite Input — Document / Tool Review",
      "summary": "Lessons Learned Worksheet, Report Template and Portfolio Index Template reviewed",
      "body": "Lessons Learned Worksheet, Report Template and Portfolio Index Template reviewed\n\n## Why this is required\nEnsures you have read and understood the supplied templates/tools end to end before using them.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-kt-002-ref-515",
      "title": "Peer mentee identified for the second-perspective interview (if in a cohort)",
      "kind": "Prerequisite Input — Organisational Context",
      "summary": "Peer mentee identified for the second-perspective interview (if in a cohort)",
      "body": "Peer mentee identified for the second-perspective interview (if in a cohort)\n\n## Why this is required\nGrounds the task in the organisation's real business, systems and regulatory footprint before any gathering begins.\n\n## Gate check\nIf this input is not secured, mark Provided (Y/N) = N and escalate to the mentor — the task cannot pass the RUA gate.",
      "tab": "acquire"
    },
    {
      "id": "rua-kt-002-ref-516",
      "title": "GRC101_Tasks_Activities.docx — section GRC101-KT-002",
      "kind": "Task Description & Activity Steps",
      "summary": "Full task description and all eight activity steps; unclear steps to be raised with the mentor.",
      "body": "Full task description and activity steps for GRC101_Tasks_Activities.docx — section GRC101-KT-002. You re-reads these and raises any unclear step before the gate.\n\n## Objective\nConfirm you understand retrospective method and continual improvement, and has the full portfolio of rotation deliverables assembled, before writing any reflection.\n\n## Part A — what you must gather & confirm\n1. Study the governing control references: Clause 10.1 — Continual improvement; Clause 10.2 — Nonconformity and corrective action; Annex A 5.27 — Learning from information security incidents.\n2. Read the cross-referenced framework mapping: NIST CSF 2.0 — GV.RM-07 (Risk responses managed and outcomes communicated); RC.IM-01 (Recovery plan incorporates lessons learned); Control 17.8 (Conduct post-incident reviews).\n3. Obtain and review every provided template and document: Lessons Learned Worksheet (Word — structured reflection questions: learning, successes, challenges, recommendations); Lessons Learned Report Template (Word — introduction, key learnings table, programme improvement recommendations, portfolio index page); Mentee Portfolio Index Template (spreadsheet: Task ID, Task Name, Deliverable, File Location, Date Completed, Badge Earned).\n4. Secure prerequisite inputs: All completed task deliverables and working documents from the rotation gathered; Lessons Learned Worksheet, Report Template and Portfolio Index Template reviewed; Peer mentee identified for the second-perspective interview (if in a cohort).\n5. Re-read the task description and all activity steps of GRC101-KT-002; note any step whose purpose or method is unclear and raise it before the gate.\n6. Confirm the expected final deliverable and its acceptance standard: Lessons Learned Report (2–3 pages) + Mentee Portfolio Index (complete list of all GRC 101 deliverables produced) + Three Programme Improvement Recommendations.",
      "tab": "clarify"
    },
    {
      "id": "rua-kt-002-ref-517",
      "title": "Deliverable Specification — Lessons Learned Report (2–3 pages) + Mentee Portfolio Index (complete list of all GRC…",
      "kind": "Deliverable Acceptance Specification",
      "summary": "Lessons Learned Report (2–3 pages) + Mentee Portfolio Index (complete list of all GRC 101 deliverables produced) + Three Programme…",
      "body": "The final deliverable and the acceptance standard it is graded against.\n\n## Deliverable\nLessons Learned Report (2–3 pages) + Mentee Portfolio Index (complete list of all GRC 101 deliverables produced) + Three Programme Improvement Recommendations.\n\n## Acceptance criteria\n| # | Criterion | Met when… |\n| 1 | Completeness | the full agreed scope is covered with no known item omitted |\n| 2 | Traceable ownership | every element carries a named, accountable owner |\n| 3 | Standard alignment | content maps cleanly to ISO/IEC 27001:2022 |\n| 4 | Evidence & residual gaps | assertions are evidenced and any residual gaps are explicitly flagged, not hidden |\n| 5 | Sign-off | the deliverable is formally reviewed and signed off by the accountable owner |",
      "tab": "confirm"
    },
    {
      "id": "rua-kt-002-ref-518",
      "title": "Study note / primer — Retrospective structure: what was learned, what worked, what did not, what to recommend",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Retrospective structure: what was learned, what worked, what did not,…",
      "body": "A study primer that enables you to explain, in your own words: Retrospective structure: what was learned, what worked, what did not, what to recommend.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-002-ref-519",
      "title": "Study note / primer — Lessons versus complaints — actionable, evidence-based reflection",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Lessons versus complaints — actionable, evidence-based reflection",
      "body": "A study primer that enables you to explain, in your own words: Lessons versus complaints — actionable, evidence-based reflection.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-002-ref-520",
      "title": "Study note / primer — ISO 27001 Clause 10.1 continual improvement applied to the programme itself",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: ISO 27001 Clause 10.1 continual improvement applied to the programme itself",
      "body": "A study primer that enables you to explain, in your own words: ISO 27001 Clause 10.1 continual improvement applied to the programme itself.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-002-ref-521",
      "title": "Study note / primer — The Mentee Portfolio Index as evidence of capability",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: The Mentee Portfolio Index as evidence of capability",
      "body": "A study primer that enables you to explain, in your own words: The Mentee Portfolio Index as evidence of capability.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    },
    {
      "id": "rua-kt-002-ref-522",
      "title": "Study note / primer — Writing for the next cohort as the audience",
      "kind": "Concept Study Material",
      "summary": "Reading that enables you to explain, in your own words: Writing for the next cohort as the audience",
      "body": "A study primer that enables you to explain, in your own words: Writing for the next cohort as the audience.\n\n## In plain terms\nYou should be able to state what this concept means, why it matters to the task, and give a concrete example — rather than reciting a definition. Being able to teach it back in plain language is the test of understanding.\n\n## Watch out for\nReciting a textbook definition without being able to give a concrete, organisation-specific example.",
      "tab": "explain"
    }
  ]
};
