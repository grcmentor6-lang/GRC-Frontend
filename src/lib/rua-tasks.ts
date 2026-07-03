// Per-task content for the RUA (Requirement & Understanding Analysis) readiness gate — the
// mandatory preparation step that opens every task. Ported verbatim (entities unescaped) from the
// 35-task RUA catalog (GRC101_Requirement_Understanding_Analysis_Tasks.docx via the design
// mockup); org names come from the seed engagement each task belongs to. Keyed by task code.
// Generated — regenerate rather than hand-editing bulk content.

export interface RuaControl { ref: string; name: string }
export interface RuaCrosswalk { code: string; desc: string }
export interface RuaTemplate { name: string; purpose: string; fmt: "sheet" | "doc" | "deck" | "diagram"; fields: string[] }
export interface RuaAcquireItem { type: "context" | "template" | "access" | "artefact"; label: string }
export interface RuaStep { verb: string; text: string }

export interface RuaTask {
  /** Organisation this engagement runs in (used in copy). */
  org: string;
  standard: string;
  objective: string;
  /** Governing controls to study, each needing a short "what it requires" note. */
  controls: RuaControl[];
  /** NIST CSF cross-walk shown alongside the controls. */
  crosswalk: RuaCrosswalk[];
  /** Every provided template to inspect. */
  templates: RuaTemplate[];
  /** Prerequisite inputs/access to confirm before starting. */
  acquire: RuaAcquireItem[];
  /** The task's activity steps, walked and acknowledged one by one. */
  steps: RuaStep[];
  /** The deliverable contract locked in the Confirm step. */
  deliverable: string;
  acceptance: string;
  /** Key concepts the mentee explains in their own words. */
  concepts: string[];
  /** Readiness verification questions. */
  questions: string[];
}

export const RUA_TASKS: Record<string, RuaTask> = {
  "AA-001": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands what an information asset is, why classification matters, and how the register will be built and signed off, before any interviews or data gathering begin.",
    "controls": [
      {
        "ref": "Annex A 5.9",
        "name": "Inventory of information and other associated assets"
      },
      {
        "ref": "Annex A 5.12",
        "name": "Classification of information"
      },
      {
        "ref": "Annex A 8.1",
        "name": "User endpoint devices"
      }
    ],
    "crosswalk": [
      {
        "code": "ID.AM-01",
        "desc": "Inventories of hardware maintained"
      },
      {
        "code": "ID.AM-02",
        "desc": "Inventories of software maintained"
      },
      {
        "code": "ID.AM-05",
        "desc": "Assets are prioritised"
      }
    ],
    "templates": [
      {
        "name": "Information Asset Register Template",
        "purpose": "spreadsheet with columns: Asset ID, Asset Name, Asset Type, Owner, Location, Format, CIA Classification, Custodian, Review Date, Notes",
        "fmt": "sheet",
        "fields": [
          "Asset ID",
          "Asset Name",
          "Asset Type",
          "Owner",
          "Location",
          "Format",
          "CIA Classification",
          "Custodian",
          "Review Date",
          "Notes"
        ]
      },
      {
        "name": "Asset Discovery Interview Guide",
        "purpose": "structured question set",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Organisation and business-unit context for CloudTech Solutions Enterprise or Apex Software Development Group"
      },
      {
        "type": "access",
        "label": "Confirmed IT/Operations contact for the initial systems list"
      },
      {
        "type": "artefact",
        "label": "No prior GRC 101 task outputs required — this is a foundation task"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Information Asset Inventory & Classification with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Information Asset Register."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Information Asset Register in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Information Asset Register and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Information Asset Register",
    "acceptance": "Information Asset Register — a signed-off spreadsheet listing all identified assets with classification, owner, location, and residual gaps.",
    "concepts": [
      "Information asset types: data, software, hardware, services, people and intangibles",
      "The CIA triad (Confidentiality, Integrity, Availability) as the basis for classification",
      "Asset ownership versus custodianship — why every asset needs a named owner",
      "The three-tier classification scheme (Public / Internal / Confidential) under ISO/IEC 27001:2022 Annex A 5.12",
      "Intent of Annex A 5.9 (asset inventory) and A 8.1 (user endpoint devices)"
    ],
    "questions": [
      "What qualifies as an information asset in this organisation, and what does not?",
      "Why must every asset have a named owner, and what happens when one cannot be identified?",
      "How would you decide between an Internal and a Confidential classification for a given asset?",
      "What makes the asset register complete enough for department-head sign-off?"
    ]
  },
  "AA-002": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "CIS Controls v8",
    "objective": "Confirm the mentee understands the CIS Controls v8 structure, the meaning of Implementation Group 1, and evidence-based gap assessment before scheduling any walkthroughs.",
    "controls": [
      {
        "ref": "",
        "name": "Controls 1–6: Inventory of Enterprise Assets"
      },
      {
        "ref": "",
        "name": "Inventory of Software Assets"
      },
      {
        "ref": "",
        "name": "Data Protection"
      },
      {
        "ref": "",
        "name": "Secure Configuration"
      },
      {
        "ref": "",
        "name": "Account Management"
      },
      {
        "ref": "",
        "name": "Access Control Management (Implementation Group 1 sub-controls only)"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.DS",
        "desc": "Protect: Identity Management; Data Security"
      }
    ],
    "templates": [
      {
        "name": "CIS Controls v8 IG1 Assessment Worksheet",
        "purpose": "pre-built spreadsheet with all 56 IG1 Safeguards, status dropdowns, evidence columns, and auto-scoring",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "Gap Analysis Report Template",
        "purpose": "Word with executive summary, findings table, and remediation roadmap sections",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "template",
        "label": "CIS Controls v8 IG1 Assessment Worksheet reviewed end to end"
      },
      {
        "type": "context",
        "label": "Evidence-request list understood before approaching IT/operations staff"
      },
      {
        "type": "access",
        "label": "Walkthrough access to IT and operations staff confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Security Controls Gap Analysis — CIS Controls v8 IG1 with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing CIS Controls v8 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate CIS Controls v8 IG1 Gap Analysis Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft CIS Controls v8 IG1 Gap Analysis Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise CIS Controls v8 IG1 Gap Analysis Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "CIS Controls v8 IG1 Gap Analysis Report",
    "acceptance": "CIS Controls v8 IG1 Gap Analysis Report — scored assessment per Control group, gap list with remediation priorities, and an executive summary.",
    "concepts": [
      "CIS Controls v8 structure: 18 Controls, safeguards, and Implementation Groups (IG1/IG2/IG3)",
      "Why IG1's 56 Safeguards represent essential cyber hygiene",
      "Assessment statuses: Implemented / Partial / Not Implemented / Not Applicable",
      "Evidence-based assessment versus self-attestation",
      "Compliance percentage scoring per Control group and gap prioritisation by risk exposure"
    ],
    "questions": [
      "What is the difference between a Control and a Safeguard in CIS v8?",
      "What evidence would distinguish an Implemented status from a Partial status?",
      "How is the compliance percentage per Control group calculated in the worksheet?",
      "How would you rank two gaps against each other by risk exposure?"
    ]
  },
  "AA-003": {
    "org": "LearnTech Educational Solutions",
    "standard": "GDPR (EU) 2016/679",
    "objective": "Confirm the mentee understands core GDPR definitions, lawful bases, and the purpose of RoPA and DPIA screening before selecting a process or interviewing its owner.",
    "controls": [
      {
        "ref": "Article 4 (Definitions",
        "name": "personal data, processing, controller, processor)"
      },
      {
        "ref": "",
        "name": "Article 13 & 14 (Information to be provided)"
      },
      {
        "ref": "Article 30 (Records of processing activities",
        "name": "RoPA)"
      },
      {
        "ref": "",
        "name": "Article 35 (Data protection impact assessment screening)"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-05",
        "desc": "Legal, regulatory and contractual requirements are understood"
      },
      {
        "code": "ID.AM-08",
        "desc": "Systems/services involving external parties are inventoried"
      }
    ],
    "templates": [
      {
        "name": "RoPA Template",
        "purpose": "Article 30-compliant spreadsheet: processing activity, purposes, legal basis, data categories, data subjects, recipients, retention, transfers, security measures",
        "fmt": "sheet",
        "fields": [
          "processing activity",
          "purposes",
          "legal basis",
          "data categories",
          "data subjects",
          "recipients",
          "retention",
          "transfers",
          "security measures"
        ]
      },
      {
        "name": "DPIA Screening Checklist",
        "purpose": "nine-criteria Word form",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Data Flow Diagram Template",
        "purpose": "Visio/draw.io swimlane template",
        "fmt": "diagram",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "access",
        "label": "Candidate data-heavy processes identified (e.g. student registration, account sign-up)"
      },
      {
        "type": "template",
        "label": "RoPA Template, DPIA Screening Checklist and Data Flow Diagram Template reviewed"
      },
      {
        "type": "access",
        "label": "Process-owner access confirmed via the mentor"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Privacy Data-Flow Mapping & GDPR Applicability Assessment with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing GDPR (EU) 2016/679 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Completed RoPA Entry  + DPIA Screening Form with disposition  and supporting data-flow diagram.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Completed RoPA Entry  + DPIA Screening Form with disposition  and supporting data-flow diagram. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Completed RoPA Entry  + DPIA Screening Form with disposition  and supporting data-flow diagram. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Completed RoPA Entry (for one process) + DPIA Screening Form with disposition (full DPIA required / not required) and supporting data-flow diagram.",
    "acceptance": "Completed RoPA Entry (for one process) + DPIA Screening Form with disposition (full DPIA required / not required) and supporting data-flow diagram.",
    "concepts": [
      "GDPR Article 4 definitions: personal data, processing, controller, processor",
      "The six lawful bases for processing under Article 6",
      "Records of Processing Activities (RoPA) under Article 30 — purpose and mandatory fields",
      "DPIA screening: the nine-criteria test per EDPB guidelines (Article 35)",
      "Cross-border transfer basics and third-party recipients"
    ],
    "questions": [
      "What makes data personal data, and can you give three examples from this organisation?",
      "For the candidate process, is the organisation acting as controller or processor, and why?",
      "Which lawful basis most likely applies to the selected process, and how would you verify it?",
      "Which of the nine EDPB criteria would trigger a full DPIA for this process?"
    ]
  },
  "BCRP-001": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands critical functions, dependency mapping and the RTO/RPO vocabulary before conducting the BIA interview.",
    "controls": [
      {
        "ref": "Annex A 5.29",
        "name": "Information security during disruption"
      },
      {
        "ref": "Annex A 5.30",
        "name": "ICT readiness for business continuity"
      }
    ],
    "crosswalk": [
      {
        "code": "RC.RP-01",
        "desc": "Recovery plan executed"
      },
      {
        "code": "RC.RP-03",
        "desc": "Recovery activities and progress communicated"
      },
      {
        "code": "Control 11",
        "desc": "Data Recovery"
      }
    ],
    "templates": [
      {
        "name": "BIA Questionnaire Template",
        "purpose": "Word — structured questions: function identification, dependencies, financial impact, operational impact, RTO/RPO estimation, workarounds, IT systems required",
        "fmt": "doc",
        "fields": [
          "function identification",
          "dependencies",
          "financial impact",
          "operational impact",
          "RTO/RPO estimation",
          "workarounds",
          "IT systems required"
        ]
      },
      {
        "name": "BIA Summary Table Template",
        "purpose": "Excel — function, impact score, RTO, RPO, dependency, single point of failure, workaround",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "BIA Report Template",
        "purpose": "Word — standard BC report format",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "RTO/RPO Definition Reference Card",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Department selected with the mentor"
      },
      {
        "type": "template",
        "label": "BIA Questionnaire, Summary Table and Report templates reviewed"
      },
      {
        "type": "access",
        "label": "60-minute interview with the department manager scheduled"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Business Impact Analysis (BIA) — Single Department with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate BIA Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft BIA Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise BIA Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "BIA Report (for one department)",
    "acceptance": "BIA Report (for one department) — critical functions list, impact scores, RTO/RPO table, single points of failure analysis, and recommended continuity measures.",
    "concepts": [
      "Critical functions and how criticality is determined",
      "Dependency mapping: people, systems, data, suppliers",
      "RTO (Recovery Time Objective) versus RPO (Recovery Point Objective) versus maximum tolerable downtime",
      "How impact escalates over time (hours versus days)",
      "Single points of failure and credible workarounds (Annex A 5.29, 5.30)"
    ],
    "questions": [
      "What is the difference between RTO and RPO, with a concrete example?",
      "How is a function judged critical rather than merely important?",
      "Why does business impact typically grow non-linearly over time?",
      "What makes a manual workaround credible rather than theoretical?"
    ]
  },
  "BCRP-002": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands backup and restoration concepts and how BIA-derived RTO/RPO figures become checklist success criteria, before drafting.",
    "controls": [
      {
        "ref": "Annex A 5.30",
        "name": "ICT readiness for business continuity"
      },
      {
        "ref": "Annex A 8.13",
        "name": "Information backup"
      },
      {
        "ref": "Annex A 8.14",
        "name": "Redundancy of information processing facilities"
      }
    ],
    "crosswalk": [
      {
        "code": "RC.RP-02",
        "desc": "Recovery plan updated"
      },
      {
        "code": "PR.DS-11",
        "desc": "Data backups created"
      },
      {
        "code": "Control 11.1",
        "desc": "Establish and maintain a data recovery process"
      },
      {
        "code": "and 11.4",
        "desc": "Establish and maintain an isolated instance of recovery data"
      }
    ],
    "templates": [
      {
        "name": "ICT DR Checklist Template",
        "purpose": "Word — four sections: Preparation, Incident Declaration, Restoration Steps, Return to Norma",
        "fmt": "doc",
        "fields": [
          "Preparation",
          "Incident Declaration",
          "Restoration Steps",
          "Return to Norma"
        ]
      },
      {
        "name": "each step has: step number, action, responsible person, expected outcome, actual outcome, sign-off)",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "DR Documentation Library Filing Guide",
        "purpose": "Word — where to store and version DR artefacts",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "RTO/RPO figures from GRC101-BCRP-001 obtained"
      },
      {
        "type": "context",
        "label": "Target system selected with the IT Manager and mentor"
      },
      {
        "type": "template",
        "label": "ICT DR Checklist Template and Filing Guide reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for ICT Disaster Recovery Checklist Development with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate ICT DR Checklist."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft ICT DR Checklist in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise ICT DR Checklist and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "ICT DR Checklist (for one system)",
    "acceptance": "ICT DR Checklist (for one system) — step-by-step pre-incident, incident, restoration, and return-to-normal sections, with RTO/RPO success criteria and sign-off blocks.",
    "concepts": [
      "Backup types, schedules and verification — why an untested backup is a hope, not a control",
      "Failover versus restoration",
      "DR checklist structure: Preparation, Incident Declaration, Restoration, Return to Normal",
      "RTO/RPO from the BIA as measurable success criteria (Annex A 5.30, 8.13, 8.14)",
      "Talk-through testing versus live restoration testing"
    ],
    "questions": [
      "How do the RTO and RPO from BCRP-001 constrain this checklist?",
      "Why does a backup existing not mean the system is recoverable?",
      "What are the four phases of the DR checklist and the purpose of each?",
      "What does a talk-through validate, and what can only a live test validate?"
    ]
  },
  "CA-001": {
    "org": "LearnTech Educational Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee knows the DD-002 material thoroughly, understands delivery logistics and knowledge-check administration, and why completion records matter, before booking the session.",
    "controls": [
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 6.6",
        "name": "Confidentiality or non-disclosure agreements"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AT-01",
        "desc": "Personnel provided awareness and training"
      },
      {
        "code": "Control 14.2",
        "desc": "Training for all roles with security responsibilities"
      },
      {
        "code": "and 14.7",
        "desc": "Training for all users on identifying social engineering"
      }
    ],
    "templates": [
      {
        "name": "Pre-Session Communication Template",
        "purpose": "email — 3-paragraph format",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Training Attendance Register Template",
        "purpose": "spreadsheet",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "Knowledge Check Answer Sheet",
        "purpose": "Word — participant copy",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Knowledge Check Marking Sheet",
        "purpose": "mentor copy with answers",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Training Completion Report Template",
        "purpose": "Word — one-page: date, attendees, pass rate, findings, recommendations",
        "fmt": "doc",
        "fields": [
          "date",
          "attendees",
          "pass rate",
          "findings",
          "recommendations"
        ]
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Finalised training module from GRC101-DD-002 obtained and rehearsed at least once"
      },
      {
        "type": "access",
        "label": "HR/Operations scheduling contact confirmed"
      },
      {
        "type": "artefact",
        "label": "Attendance Register, Answer/Marking Sheets and Completion Report templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Security Awareness Briefing — Staff Presentation Delivery with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Training Completion Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Training Completion Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Training Completion Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Training Completion Report",
    "acceptance": "Training Completion Report — attendance list, knowledge-check score summary, pass rate, qualitative observations, and recommendations for any staff requiring remedial guidance.",
    "concepts": [
      "Presenting technical content to a non-technical audience",
      "Session logistics: room/video setup, equipment testing, timing to 30 minutes",
      "Administering and scoring the five-question knowledge check (target ≥80% pass)",
      "Attendance registers and training completion records as audit evidence under Annex A 6.3",
      "Handling questions and unexpected disruptions gracefully"
    ],
    "questions": [
      "Which parts of the DD-002 module need language adapted for this audience?",
      "What logistics must be tested before the session starts?",
      "What is the pass-rate target, and what happens if the group misses it?",
      "Why are attendance and completion records treated as audit evidence?"
    ]
  },
  "CA-002": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee has synthesised all completed task outputs for the organisation and understands executive communication principles before drafting the one-pager.",
    "controls": [
      {
        "ref": "Clause 9.3",
        "name": "Management review"
      },
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-06",
        "desc": "Risk management outcomes communicated"
      },
      {
        "code": "GV.OC-04",
        "desc": "Responsibilities are understood"
      },
      {
        "code": "ID.RA-09",
        "desc": "Third-party risk assessed — referenced in reporting"
      }
    ],
    "templates": [
      {
        "name": "Executive Compliance Status Report Template",
        "purpose": "Word — one-page with: header RAG indicator, top-3 risks table, top-3 achievements, open decisions table, 30-day outlook text box",
        "fmt": "doc",
        "fields": [
          "header RAG indicator",
          "top-3 risks table",
          "top-3 achievements",
          "open decisions table",
          "30-day outlook text box"
        ]
      },
      {
        "name": "Plain-English GRC Writing Guide",
        "purpose": "reference card — 10 rules for writing for non-technical audiences",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Outputs from all completed tasks for the organisation gathered (gap analysis, risk register, maturity, metrics)"
      },
      {
        "type": "template",
        "label": "Executive Report Template and Plain-English GRC Writing Guide reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Management Compliance Status Report with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Executive Compliance Status Report  covering: RAG status, top risks, achievements, open decisions, and 30-day outlook.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Executive Compliance Status Report  covering: RAG status, top risks, achievements, open decisions, and 30-day outlook. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Executive Compliance Status Report  covering: RAG status, top risks, achievements, open decisions, and 30-day outlook. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Executive Compliance Status Report (one-page, management-ready) covering: RAG status, top risks, achievements, open decisions, and 30-day outlook.",
    "acceptance": "Executive Compliance Status Report (one-page, management-ready) covering: RAG status, top risks, achievements, open decisions, and 30-day outlook.",
    "concepts": [
      "Synthesis versus detail: choosing the five messages that matter to management",
      "Overall RAG status and how it is justified",
      "Plain-English writing: concrete numbers, no jargon",
      "Structure of the one-page report: risks, achievements, open decisions, 30-day outlook",
      "ISO 27001 Clause 9.3 management review inputs"
    ],
    "questions": [
      "What are the five most important messages from this organisation's completed tasks?",
      "How would you state a technical risk in business terms a manager can act on?",
      "What belongs on the one page and what gets left out?",
      "What decisions should the report prompt management to take?"
    ]
  },
  "CA-003": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands structured interviewing — open questions, probing, active listening and thematic analysis — before approaching any stakeholder.",
    "controls": [
      {
        "ref": "Clause 4.2",
        "name": "Understanding the needs and expectations of interested parties"
      },
      {
        "ref": "Clause 5.3",
        "name": "Organisational roles, responsibilities and authorities"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-02",
        "desc": "Internal and external stakeholders identified"
      },
      {
        "code": "GV.OC-03",
        "desc": "Legal, regulatory and contractual requirements understood"
      }
    ],
    "templates": [
      {
        "name": "Stakeholder Interview Guide Template",
        "purpose": "Word — with interview purpose, rapport-building opener, 8–10 structured questions per role type, and closing prompt",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Stakeholder Interview Summary Template",
        "purpose": "Word — one-page per interview: key quotes, concerns, knowledge gaps, priorities",
        "fmt": "doc",
        "fields": [
          "key quotes",
          "concerns",
          "knowledge gaps",
          "priorities"
        ]
      },
      {
        "name": "Stakeholder Needs Discovery Report Template",
        "purpose": "Word — themes table, implications, recommendations",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "access",
        "label": "Three stakeholders identified: IT Manager, HR Manager, business-unit lead"
      },
      {
        "type": "template",
        "label": "Stakeholder Interview Guide, Summary and Discovery Report templates reviewed"
      },
      {
        "type": "access",
        "label": "Advance briefing note for interviewees drafted"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Stakeholder Interview — GRC Needs Discovery with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Stakeholder Needs Discovery Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Stakeholder Needs Discovery Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Stakeholder Needs Discovery Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Stakeholder Needs Discovery Report",
    "acceptance": "Stakeholder Needs Discovery Report — cross-interview theme analysis, key quotes, stakeholder-specific recommendations, and implications for GRC programme design.",
    "concepts": [
      "Structured versus unstructured interviews and why structure aids comparison",
      "Open questions, follow-up probes and avoiding leading questions",
      "Active listening and structured note-taking",
      "Thematic analysis across multiple interviews: concerns, gaps, priorities",
      "Interviewer neutrality and building rapport"
    ],
    "questions": [
      "What makes a question open rather than closed, with two examples from the guide?",
      "How would you probe a vague answer without leading the interviewee?",
      "How will you identify themes across the three interviews?",
      "Where do the findings flow after this task (SPA-001, SPA-002)?"
    ]
  },
  "CRM-001": {
    "org": "LearnTech Educational Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands the four categories of obligations, how applicability is determined, and why the register anchors all later compliance work, before any scoping interviews.",
    "controls": [
      {
        "ref": "Clause 4.1",
        "name": "Understanding the organisation and its context"
      },
      {
        "ref": "Clause 4.2",
        "name": "Understanding the needs and expectations of interested parties"
      },
      {
        "ref": "Annex A 5.31",
        "name": "Legal, statutory, regulatory and contractual requirements"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-03",
        "desc": "Legal, regulatory, and contractual requirements understood and managed"
      },
      {
        "code": "GV.OC-05",
        "desc": "Outcomes, capabilities, and services that the organisation depends on are understood"
      }
    ],
    "templates": [
      {
        "name": "Regulatory Obligations Register Template",
        "purpose": "spreadsheet: Obligation ID, Source/Regulation, Specific Requirement, Jurisdiction, Applicability Rationale, ISO 27001 Mapping, Control Owner, Compliance Status, Evidence Reference, Gap Flag, Next Review Date",
        "fmt": "sheet",
        "fields": [
          "Obligation ID",
          "Source/Regulation",
          "Specific Requirement",
          "Jurisdiction",
          "Applicability Rationale",
          "ISO 27001 Mapping",
          "Control Owner",
          "Compliance Status",
          "Evidence Reference",
          "Gap Flag",
          "Next Review Date"
        ]
      },
      {
        "name": "Regulatory Scoping Interview Guide",
        "purpose": "Word",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Organisation's jurisdiction(s) and sector regulatory landscape researched at a high level"
      },
      {
        "type": "template",
        "label": "Regulatory Scoping Interview Guide reviewed"
      },
      {
        "type": "access",
        "label": "Legal/Compliance contact and IT Manager interview slots confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Regulatory Requirements Inventory & Obligations Register with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Regulatory Obligations Register."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Regulatory Obligations Register in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Regulatory Obligations Register and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Regulatory Obligations Register",
    "acceptance": "Regulatory Obligations Register — a signed-off spreadsheet listing all applicable requirements with control mapping, compliance status, owner, and gap flags.",
    "concepts": [
      "Four obligation categories: legislation, sector-specific regulation, contractual obligations, voluntary standards",
      "ISO 27001 Clauses 4.1 and 4.2 — organisational context and interested parties",
      "Annex A 5.31 — legal, statutory, regulatory and contractual requirements",
      "Applicability rationale — documenting why an obligation applies",
      "Compliance status ratings (Met / Partial / Gap) and review scheduling"
    ],
    "questions": [
      "Can you name one obligation in each of the four categories for this organisation's sector?",
      "How do you determine whether a regulation actually applies to this organisation?",
      "What evidence would demonstrate that an obligation is Met rather than Partial?",
      "Why is each obligation mapped to an ISO 27001 clause or Annex A control?"
    ]
  },
  "CRM-002": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee knows the Annex A control structure and can reason about control applicability per business process before selecting processes or building the matrix.",
    "controls": [
      {
        "ref": "Annex A",
        "name": "All 93 controls across 4 Themes: Organisational (37), People (8), Physical (14), Technological (34)"
      }
    ],
    "crosswalk": [
      {
        "code": "Functions",
        "desc": "cross-walk between ISO 27001 Annex A and NIST CSF Categories/Subcategories"
      }
    ],
    "templates": [
      {
        "name": "ISO 27001 Control Applicability Matrix Template",
        "purpose": "Excel — 93 Annex A controls as rows, business processes as columns, with status dropdowns and auto-gap count",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "Control Applicability Worksheet",
        "purpose": "Word — per-process question prompts",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Candidate business processes discussed with the mentor (onboarding, release, backup, vendor contracting, incident logging)"
      },
      {
        "type": "template",
        "label": "Control Applicability Matrix Template and per-process Worksheet reviewed"
      },
      {
        "type": "template",
        "label": "NIST CSF to ISO 27001 Cross-Walk Reference Sheet skimmed for orientation"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for ISO 27001 Control Framework Mapping to Business Processes with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate ISO 27001 Control Matrix."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft ISO 27001 Control Matrix in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise ISO 27001 Control Matrix and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "ISO 27001 Control Matrix (Process-to-Control Mapping)",
    "acceptance": "ISO 27001 Control Matrix (Process-to-Control Mapping) — a spreadsheet mapping 5 business processes × 93 Annex A controls with applicability, implementation status, control owner, and gap summary.",
    "concepts": [
      "ISO 27001:2022 Annex A structure: 93 controls across Organisational (37), People (8), Physical (14), Technological (34) themes",
      "Control applicability rationale: applicable / not applicable / partially applicable",
      "Process view versus control view of an organisation",
      "The control matrix as a process × control grid and its relationship to the Statement of Applicability",
      "Implementation status evidence and control ownership"
    ],
    "questions": [
      "What are the four Annex A themes and roughly how many controls sit in each?",
      "How would you justify marking a control not applicable for a given process?",
      "Why validate control applicability in a walk-through with the process owner?",
      "How does the finished matrix reveal uncontrolled risks?"
    ]
  },
  "CRM-003": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "SOC 2 Type II (AICPA Trust Services Criteria)",
    "objective": "Confirm the mentee understands what a SOC 2 Type II report is, how the Trust Services Criteria are organised, and how audit evidence works before annotating the sample report.",
    "controls": [
      {
        "ref": "CC1–CC9 (Common Criteria",
        "name": "Security)"
      },
      {
        "ref": "A1 (Availability",
        "name": "awareness)"
      },
      {
        "ref": "C1 (Confidentiality",
        "name": "awareness)"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.DS",
        "desc": "Policy; Identity Management; Data Security"
      }
    ],
    "templates": [
      {
        "name": "SOC 2 Common Criteria Mapping Template",
        "purpose": "spreadsheet: CC ID, Criterion Description, Example Audit Test, Internal Control Reference, Evidence Type, Gap Flag, RAG Status",
        "fmt": "sheet",
        "fields": [
          "CC ID",
          "Criterion Description",
          "Example Audit Test",
          "Internal Control Reference",
          "Evidence Type",
          "Gap Flag",
          "RAG Status"
        ]
      },
      {
        "name": "SOC 2 Awareness Briefing Template",
        "purpose": "Word, 2-page format",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Sample anonymised SOC 2 Type II report",
        "purpose": "provided by mentor for learning purposes",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Sample anonymised SOC 2 Type II report obtained from the mentor"
      },
      {
        "type": "template",
        "label": "CC Mapping worksheet template reviewed"
      },
      {
        "type": "artefact",
        "label": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained where available for cross-reference"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for SOC 2 Awareness — Trust Services Criteria Mapping with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing SOC 2 Type II (AICPA Trust Services Criteria) control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate SOC 2 Control Awareness Summary."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft SOC 2 Control Awareness Summary in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise SOC 2 Control Awareness Summary and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "SOC 2 Control Awareness Summary",
    "acceptance": "SOC 2 Control Awareness Summary — traffic-light dashboard per Common Criteria cluster, control-gap list, and a two-page IT-team briefing document.",
    "concepts": [
      "SOC 1 versus SOC 2 versus SOC 3, and Type I versus Type II",
      "Trust Services Criteria categories; Security (Common Criteria) as the mandatory category",
      "Common Criteria CC1–CC9 and their COSO Framework foundation",
      "Auditor opinions, exceptions and what they signal",
      "Mapping criteria to internal controls and RAG readiness summaries"
    ],
    "questions": [
      "What is the difference between a Type I and a Type II report?",
      "Which Trust Services category is mandatory in every SOC 2 report, and why?",
      "How does a Common Criteria control point map to an internal policy or control?",
      "What does an exception in an auditor's test result mean for readiness?"
    ]
  },
  "DD-001": {
    "org": "LearnTech Educational Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands the difference between events and incidents, what Annex A 6.8 requires of staff reporting, and how a usable procedure is structured, before drafting.",
    "controls": [
      {
        "ref": "Annex A 6.8",
        "name": "Information security event reporting"
      },
      {
        "ref": "Annex A 5.26",
        "name": "Response to information security incidents"
      },
      {
        "ref": "Annex A 5.28",
        "name": "Collection of evidence"
      }
    ],
    "crosswalk": [
      {
        "code": "RS.CO-02",
        "desc": "Incidents reported"
      },
      {
        "code": "RS.MA-01",
        "desc": "Incident response activities aligned with plans"
      },
      {
        "code": "DE.AE-06",
        "desc": "Information on adverse events communicated"
      }
    ],
    "templates": [
      {
        "name": "Procedure Template",
        "purpose": "Word — with standard headers: Purpose, Scope, Definitions, Procedure Steps, Responsibilities, Related Documents, Document Control",
        "fmt": "doc",
        "fields": [
          "Purpose",
          "Scope",
          "Definitions",
          "Procedure Steps",
          "Responsibilities",
          "Related Documents",
          "Document Control"
        ]
      },
      {
        "name": "Incident Reporting Quick Reference Card Template",
        "purpose": "A5 Word layout",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Staff Communication Template",
        "purpose": "50-word email announcement",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Existing incident-related documentation gathered (helpdesk tickets, email chains, informal guidance)"
      },
      {
        "type": "template",
        "label": "Procedure Template and Quick Reference Card Template reviewed"
      },
      {
        "type": "access",
        "label": "Interview slots with the IT Manager and one front-line staff member confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Procedure Development — Incident Reporting Procedure with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Incident Reporting Procedure  + Incident Reporting Quick Reference Card  + Staff Communication Draft.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Incident Reporting Procedure  + Incident Reporting Quick Reference Card  + Staff Communication Draft. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Incident Reporting Procedure  + Incident Reporting Quick Reference Card  + Staff Communication Draft. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Incident Reporting Procedure (full document) + Incident Reporting Quick Reference Card (one-page PDF-ready) + Staff Communication Draft.",
    "acceptance": "Incident Reporting Procedure (full document) + Incident Reporting Quick Reference Card (one-page PDF-ready) + Staff Communication Draft.",
    "concepts": [
      "Security event versus security incident — definitions and examples",
      "Annex A 6.8 (event reporting), A 5.26 (incident response) and A 5.28 (evidence collection) intent",
      "Procedure structure: purpose, scope, definitions, steps, responsibilities, document control",
      "Reporting channels and escalation timelines",
      "Writing for all staff: plain language and the one-page quick reference discipline"
    ],
    "questions": [
      "What is the difference between a security event and a security incident, with two examples of each?",
      "What must every member of staff be able to do after reading this procedure?",
      "What reporting channels will the procedure define, and what escalation timeline applies?",
      "Why is the quick reference card limited to one page?"
    ]
  },
  "DD-002": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands learning-objective design, the three core topics, and how knowledge checks measure learning, before outlining any content.",
    "controls": [
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 6.6",
        "name": "Confidentiality or non-disclosure agreements"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AT-01",
        "desc": "Personnel are provided awareness and training"
      },
      {
        "code": "PR.AT-02",
        "desc": "Individuals with elevated privileges are provided awareness and training"
      },
      {
        "code": "Control 14",
        "desc": "Security Awareness and Skills Training"
      }
    ],
    "templates": [
      {
        "name": "Training Content Outline Template",
        "purpose": "Word — with topic, learning objective, key messages, and timing per section",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Security Awareness Slide Deck Template",
        "purpose": "PowerPoint — branded, 12-slide structure",
        "fmt": "deck",
        "fields": []
      },
      {
        "name": "Knowledge Check Template",
        "purpose": "Word — 5-question MCQ with answer key",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Facilitator Guide Template",
        "purpose": "Word — A4 one-pager",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Training Attendance Register Template",
        "purpose": "spreadsheet",
        "fmt": "sheet",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "template",
        "label": "Existing HR onboarding materials and current security guidance reviewed"
      },
      {
        "type": "template",
        "label": "Training Content Outline, Slide Deck, Knowledge Check and Facilitator Guide templates reviewed"
      },
      {
        "type": "access",
        "label": "Two colleagues identified for the pilot session"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Security Awareness Training Content Development with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Security Awareness Training Module."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Security Awareness Training Module in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Security Awareness Training Module and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Security Awareness Training Module",
    "acceptance": "Security Awareness Training Module — 10–12 slide deck, five-question knowledge check, one-page Facilitator Guide, and a training attendance register template.",
    "concepts": [
      "Measurable learning objectives and how they drive content design",
      "Adult-learning basics: relevance, brevity, plain language, engagement",
      "Core messages for phishing recognition, password hygiene and data handling",
      "Knowledge-check design: aligned questions, plausible distractors, answer keys",
      "Annex A 6.3 awareness and training obligations"
    ],
    "questions": [
      "What makes a learning objective measurable, with an example for the phishing topic?",
      "What are the top three phishing indicators the module must teach?",
      "How do plausible distractors make a multiple-choice check meaningful?",
      "How will the organisation know the training worked?"
    ]
  },
  "DD-003": {
    "org": "Strategic Advisory Consultants",
    "standard": "GDPR (EU) 2016/679",
    "objective": "Confirm the mentee understands the storage-limitation principle, retention triggers versus periods, and disposal methods before researching legal requirements or interviewing data owners.",
    "controls": [
      {
        "ref": "Article 5(1)(e)",
        "name": "Storage limitation principle"
      },
      {
        "ref": "Article 17",
        "name": "Right to erasure"
      },
      {
        "ref": "Recital 39",
        "name": "Data kept no longer than necessary"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.DS-01",
        "desc": "Data at rest protected"
      },
      {
        "code": "PR.DS-10",
        "desc": "Data in use protected"
      },
      {
        "code": "Control 3.11",
        "desc": "Encrypt Sensitive Data at Rest"
      }
    ],
    "templates": [
      {
        "name": "Data Retention Schedule Template",
        "purpose": "spreadsheet: Data Element, Data Category, System/Location, Retention Trigger, Retention Period, Legal Basis, Disposal Method, Disposal Responsible, Last Review, Next Review, Notes",
        "fmt": "sheet",
        "fields": [
          "Data Element",
          "Data Category",
          "System/Location",
          "Retention Trigger",
          "Retention Period",
          "Legal Basis",
          "Disposal Method",
          "Disposal Responsible",
          "Last Review",
          "Next Review",
          "Notes"
        ]
      },
      {
        "name": "Data Disposal Instruction Template",
        "purpose": "Word — one-pager per disposal method",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Legal Retention Reference Sheet",
        "purpose": "jurisdiction-specific summary — provided by mentor",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "access",
        "label": "Target data category agreed with the mentor (e.g. employee records, client contacts)"
      },
      {
        "type": "template",
        "label": "Data Retention Schedule Template and Disposal Instruction Template reviewed"
      },
      {
        "type": "access",
        "label": "Data owner and IT/system owner interview slots confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Data Retention Schedule Development with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing GDPR (EU) 2016/679 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Data Retention Schedule."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Data Retention Schedule in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Data Retention Schedule and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Data Retention Schedule (for one data category)",
    "acceptance": "Data Retention Schedule (for one data category) — approved spreadsheet with retention triggers, periods, legal basis, disposal method, and responsible owner; plus a Data Disposal Instruction document.",
    "concepts": [
      "GDPR Article 5(1)(e) storage limitation and Recital 39",
      "Retention trigger versus retention period (e.g. end of employment + 6 years)",
      "Sources of legal retention minimums: employment, tax and sector-specific law",
      "Disposal methods per medium and documented disposal instructions",
      "Interplay with Article 17 right to erasure and its exemptions"
    ],
    "questions": [
      "What is the difference between a retention trigger and a retention period?",
      "Where would you find the legal retention minimums for the chosen data category?",
      "What disposal method fits each storage medium involved?",
      "When does the right to erasure not override a retention requirement?"
    ]
  },
  "GRM-001": {
    "org": "Strategic Advisory Consultants",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee can think in risk terms — threat, likelihood, impact, inherent versus residual — and understands the 5×5 matrix and treatment options before facilitating any workshop.",
    "controls": [
      {
        "ref": "Clause 6.1.2",
        "name": "Information security risk assessment"
      },
      {
        "ref": "Clause 6.1.3",
        "name": "Information security risk treatment"
      },
      {
        "ref": "Annex A 5.9",
        "name": "Inventory of information and other associated assets"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-01",
        "desc": "Risk management objectives established"
      },
      {
        "code": "ID.RA-01",
        "desc": "Vulnerabilities identified"
      },
      {
        "code": "ID.RA-04",
        "desc": "Potential impacts and likelihoods determined"
      }
    ],
    "templates": [
      {
        "name": "Risk Register Template",
        "purpose": "spreadsheet: Risk ID, Description, Threat Source, Asset Affected, Existing Controls, Likelihood, Impact, Inherent Score, Risk Category, Treatment Option, Risk Owner, Target Residual Score, Review Date",
        "fmt": "sheet",
        "fields": [
          "Risk ID",
          "Description",
          "Threat Source",
          "Asset Affected",
          "Existing Controls",
          "Likelihood",
          "Impact",
          "Inherent Score",
          "Risk Category",
          "Treatment Option",
          "Risk Owner",
          "Target Residual Score",
          "Review Date"
        ]
      },
      {
        "name": "5×5 Risk Matrix Reference Card",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Risk Identification Workshop Guide",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Asset register from GRC101-AA-001 (or the provided equivalent) reviewed to understand the risk surface"
      },
      {
        "type": "template",
        "label": "Risk Identification Workshop Guide and 5×5 Risk Matrix Reference Card studied"
      },
      {
        "type": "access",
        "label": "Workshop access to two business-unit managers confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Operational Risk Identification & Basic Risk Register with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Basic Risk Register."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Basic Risk Register in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Basic Risk Register and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Basic Risk Register",
    "acceptance": "Basic Risk Register — spreadsheet with all identified risks scored on a 5×5 matrix, ISO 27001 control domain mapping, risk treatment options, and a one-page management summary.",
    "concepts": [
      "Threat, vulnerability, likelihood and impact, and how they combine into a risk score",
      "Inherent versus residual risk and the effect of existing controls",
      "The 5×5 risk matrix and Critical / High / Medium / Low categorisation",
      "STRIDE-lite prompt categories for structured risk identification",
      "Risk treatment options: accept, mitigate, transfer, avoid (ISO 27001 Clauses 6.1.2 and 6.1.3)"
    ],
    "questions": [
      "What is the difference between inherent and residual risk, with a concrete example?",
      "How do existing controls change a likelihood or impact score?",
      "When would you recommend accepting a risk rather than mitigating it?",
      "How does an identified risk map to an ISO 27001 Annex A control domain?"
    ]
  },
  "GRM-002": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands what a policy is (and is not), what ISO 27001 Clause 5.2 requires of it, and how the review-and-approval cycle works before drafting begins.",
    "controls": [
      {
        "ref": "Clause 5.2",
        "name": "Policy"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      },
      {
        "ref": "Annex A 6.7",
        "name": "Remote working"
      },
      {
        "ref": "Annex A 8.1",
        "name": "User endpoint devices"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-01",
        "desc": "Policy for managing cybersecurity risks established"
      },
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, and communicated"
      }
    ],
    "templates": [
      {
        "name": "Policy Template",
        "purpose": "Word document with standard headers: Document Control, Purpose, Scope, Definitions, Policy Statements, Roles and Responsibilities, Exceptions, Related Documents, Review History",
        "fmt": "doc",
        "fields": [
          "Document Control",
          "Purpose",
          "Scope",
          "Definitions",
          "Policy Statements",
          "Roles  Responsibilities",
          "Exceptions",
          "Related Documents",
          "Review History"
        ]
      },
      {
        "name": "Policy Review Comment Sheet",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Policy Approval and Sign-Off Form",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Policy Register",
        "purpose": "spreadsheet",
        "fmt": "sheet",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Two existing policies from the organisation's document library read for tone and structure"
      },
      {
        "type": "artefact",
        "label": "Policy Template, Policy Review Comment Sheet, Approval Form and Policy Register reviewed"
      },
      {
        "type": "context",
        "label": "Policy type shortlist (AUP or Remote Working) discussed with the mentor"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Information Security Policy Drafting with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Approved Information Security Policy."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Approved Information Security Policy in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Approved Information Security Policy and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Approved Information Security Policy (AUP or Remote Working Policy)",
    "acceptance": "Approved Information Security Policy (AUP or Remote Working Policy) — final version with ISO 27001 control references, management signature, and Policy Register entry.",
    "concepts": [
      "Policy versus procedure versus standard versus guideline",
      "ISO 27001:2022 Clause 5.2 requirements for an information security policy",
      "Mapping policy statements to Annex A controls (A 5.1, A 6.7, A 8.1)",
      "Document control basics: versioning, review cycles, the Policy Register",
      "The structured review cycle: reviewer roles, comment sheets, approval and sign-off"
    ],
    "questions": [
      "What distinguishes a policy statement from a procedure step?",
      "What must a Clause 5.2-compliant policy contain as a minimum?",
      "Why must each policy statement map to a specific Annex A control?",
      "Who must review the draft, and what is each reviewer looking for?"
    ]
  },
  "GRM-003": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "NIST CSF 2.0",
    "objective": "Confirm the mentee understands the NIST CSF 2.0 Functions and Tier model, and the difference between maturity and compliance, before adapting the questionnaire or booking interviews.",
    "controls": [
      {
        "ref": "",
        "name": "Tier Definitions (Tier 1 Partial → Tier 4 Adaptive)"
      },
      {
        "ref": "GV.OC",
        "name": "Organizational Context"
      },
      {
        "ref": "GV.RM",
        "name": "Risk Management Strategy"
      },
      {
        "ref": "GV.PO",
        "name": "Policy"
      }
    ],
    "crosswalk": [
      {
        "code": "Functions",
        "desc": "Govern, Identify, Protect, Detect, Respond, Recover"
      },
      {
        "code": "Clause 9.1",
        "desc": "Monitoring, measurement, analysis and evaluation"
      }
    ],
    "templates": [
      {
        "name": "NIST CSF 2.0 Maturity Assessment Questionnaire",
        "purpose": "Word — 6 Function tabs, 10–15 questions each with Tier anchors",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "CSF Maturity Spider Diagram",
        "purpose": "Excel — auto-plots from scores",
        "fmt": "diagram",
        "fields": []
      },
      {
        "name": "Maturity Assessment Report Template",
        "purpose": "Word with cover page, scoring table, diagram placeholder, and roadmap section",
        "fmt": "diagram",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "template",
        "label": "NIST CSF 2.0 Maturity Assessment Questionnaire reviewed across all six Function tabs"
      },
      {
        "type": "template",
        "label": "CSF Maturity Spider Diagram tool tested with dummy scores"
      },
      {
        "type": "access",
        "label": "90-minute interview slot with the department head and IT lead confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for GRC Maturity Assessment — Departmental Level with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing NIST CSF 2.0 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate GRC Maturity Assessment Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft GRC Maturity Assessment Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise GRC Maturity Assessment Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "GRC Maturity Assessment Report",
    "acceptance": "GRC Maturity Assessment Report — CSF Tier scoring per Function, spider diagram (current vs. target state), top-three gap narrative, and a prioritised improvement roadmap.",
    "concepts": [
      "The six NIST CSF 2.0 Functions: Govern, Identify, Protect, Detect, Respond, Recover",
      "Tier definitions: 1 Partial, 2 Risk-Informed, 3 Repeatable, 4 Adaptive",
      "Maturity versus compliance — why they are different measurements",
      "Interview-based scoring with Tier anchors and justification notes",
      "Current-state versus target-state profiling and the spider diagram"
    ],
    "questions": [
      "What behaviours distinguish a Tier 1 organisation from a Tier 2 organisation?",
      "Why was Govern introduced as a separate Function in CSF 2.0?",
      "How is maturity different from compliance, with an example?",
      "How would you justify a Function score to a sceptical department head?"
    ]
  },
  "IE-001": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "CIS Controls v8",
    "objective": "Confirm the mentee understands the remediation lifecycle, acceptance criteria and evidence expectations for the five selected safeguards before creating task cards or tracking anything.",
    "controls": [
      {
        "ref": "",
        "name": "Control 1.1 (Establish and maintain detailed enterprise asset inventory)"
      },
      {
        "ref": "",
        "name": "Control 3.3 (Configure data access control lists)"
      },
      {
        "ref": "",
        "name": "Control 5.2 (Use unique passwords)"
      },
      {
        "ref": "",
        "name": "Control 5.3 (Disable dormant accounts)"
      },
      {
        "ref": "",
        "name": "Control 6.1 (Establish access-granting process)"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AA-01",
        "desc": "Identities managed"
      },
      {
        "code": "PR.DS-01",
        "desc": "Data at rest protected"
      },
      {
        "code": "PR.DS-02",
        "desc": "Data in transit protected"
      }
    ],
    "templates": [
      {
        "name": "Control Implementation Tracker Template",
        "purpose": "spreadsheet: Safeguard ID, Description, IT Owner, Target Date, Status, Evidence Reference, Acceptance Criteria, Pass/Fail, Notes",
        "fmt": "sheet",
        "fields": [
          "Safeguard ID",
          "Description",
          "IT Owner",
          "Target Date",
          "Status",
          "Evidence Reference",
          "Acceptance Criteria",
          "Pass/Fail",
          "Notes"
        ]
      },
      {
        "name": "Implementation Task Card Template",
        "purpose": "Word — one card per control",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Evidence Repository Folder Structure Guide",
        "purpose": "naming conventions and filing instructions",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "CIS gap analysis from GRC101-AA-002 obtained and the candidate safeguards reviewed"
      },
      {
        "type": "template",
        "label": "Implementation Tracker and Task Card templates reviewed"
      },
      {
        "type": "access",
        "label": "IT Manager commitment to the implementation window confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for CIS Controls IG1 Remediation — Basic Implementation Tracking with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing CIS Controls v8 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Control Implementation Tracker  + Evidence Repository  + Implementation Progress Report.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Control Implementation Tracker  + Evidence Repository  + Implementation Progress Report. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Control Implementation Tracker  + Evidence Repository  + Implementation Progress Report. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Control Implementation Tracker (updated with evidence references) + Evidence Repository (filed artefacts) + Implementation Progress Report.",
    "acceptance": "Control Implementation Tracker (updated with evidence references) + Evidence Repository (filed artefacts) + Implementation Progress Report.",
    "concepts": [
      "The remediation lifecycle: select, plan, implement, evidence, verify, close",
      "Acceptance criteria — defining done before work starts",
      "Implementation evidence types: screenshots, configuration exports, policy documents",
      "Raising and escalating remediation issues when acceptance fails",
      "Keeping the tracker current and updating the AA-002 gap analysis on completion"
    ],
    "questions": [
      "For each of the five chosen safeguards, what is the acceptance criterion?",
      "What evidence will prove each safeguard is genuinely implemented?",
      "What happens when an implementation fails acceptance testing?",
      "How does a completed safeguard change the AA-002 compliance score?"
    ]
  },
  "IE-002": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands ISO 27001 Clause 7.5 documented-information requirements, version numbering and document lifecycles before auditing the current state or designing the structure.",
    "controls": [
      {
        "ref": "Clause 7.5",
        "name": "Documented information"
      },
      {
        "ref": "Clause 7.5.3",
        "name": "Control of documented information"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, communicated"
      },
      {
        "code": "GV.OC",
        "desc": "Organisational context maintained through documented information"
      }
    ],
    "templates": [
      {
        "name": "Document Control Policy Template",
        "purpose": "Word",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Document Register Template",
        "purpose": "spreadsheet: Doc ID, Title, Version, Status, Owner, Approver, Date Approved, Next Review Date, Location Link",
        "fmt": "sheet",
        "fields": [
          "Doc ID",
          "Title",
          "Version",
          "Status",
          "Owner",
          "Approver",
          "Date Approved",
          "Next Review Date",
          "Location Link"
        ]
      },
      {
        "name": "GRC Folder Structure Guide",
        "purpose": "Word — recommended hierarchy and naming conventions",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Version Numbering Guide",
        "purpose": "reference card",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Inventory of existing GRC documents and their current storage locations gathered"
      },
      {
        "type": "artefact",
        "label": "Document Control Policy, Document Register, Folder Structure and Version Numbering templates reviewed"
      },
      {
        "type": "artefact",
        "label": "Approved policy artefacts from GRC101-GRM-002 identified for migration where available"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Policy Roll-Out — Version Control and Document Control Setup with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Document Control Policy  + Document Register  + Implemented folder structure on the shared drive + Training summary note.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Document Control Policy  + Document Register  + Implemented folder structure on the shared drive + Training summary note. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Document Control Policy  + Document Register  + Implemented folder structure on the shared drive + Training summary note. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Document Control Policy (approved) + Document Register (populated) + Implemented folder structure on the shared drive + Training summary note.",
    "acceptance": "Document Control Policy (approved) + Document Register (populated) + Implemented folder structure on the shared drive + Training summary note.",
    "concepts": [
      "Clause 7.5 / 7.5.3 — creating, updating and controlling documented information",
      "Version numbering schemes: major versus minor versions",
      "Naming conventions and folder hierarchy design",
      "Document lifecycle: draft, review, approved, published, retired",
      "The Document Register as the master index with owners and review dates"
    ],
    "questions": [
      "What outcomes must document control achieve under Clause 7.5.3?",
      "When does a change warrant a major version rather than a minor one?",
      "What metadata must the Document Register hold for each document?",
      "How will review dates be enforced after handover?"
    ]
  },
  "KT-001": {
    "org": "LearnTech Educational Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands what a new joiner actually needs in week one, and the design constraints of the pack, before curating any content.",
    "controls": [
      {
        "ref": "Annex A 6.1",
        "name": "Screening"
      },
      {
        "ref": "Annex A 6.2",
        "name": "Terms and conditions of employment"
      },
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 6.6",
        "name": "Confidentiality or non-disclosure agreements"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AT-01",
        "desc": "Personnel provided awareness and training"
      },
      {
        "code": "GV.PO-02",
        "desc": "Policy communicated"
      },
      {
        "code": "Control 14.1",
        "desc": "Establish and maintain a security awareness programme"
      }
    ],
    "templates": [
      {
        "name": "New Joiner GRC Reference Guide Template",
        "purpose": "Word — 4-page, with visual icons, colour-coded sections, and plain language",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "New Joiner GRC Checklist Template",
        "purpose": "Word — Day 1/7/30 table format, with manager and employee columns",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Day-1 Security Briefing Slide Deck Template",
        "purpose": "PowerPoint — 5-slide structure: welcome, key policies, how to report, data rules, who to call",
        "fmt": "deck",
        "fields": [
          "welcome",
          "key policies",
          "how to report",
          "data rules",
          "who to call"
        ]
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Organisation's key policies and procedures inventoried as source material"
      },
      {
        "type": "template",
        "label": "Reference Guide, Checklist and Day-1 Slide Deck templates reviewed"
      },
      {
        "type": "access",
        "label": "HR contact for the onboarding handover confirmed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for GRC Onboarding Pack — New Joiner Reference Guide with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate GRC Onboarding Pack."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft GRC Onboarding Pack in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise GRC Onboarding Pack and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "GRC Onboarding Pack",
    "acceptance": "GRC Onboarding Pack — New Joiner GRC Reference Guide (4 pages), New Joiner GRC Checklist (Day 1/7/30), and Day-1 Security Briefing Slide Deck (5 slides); all handed over to HR.",
    "concepts": [
      "Knowledge curation: the ten things every joiner must know",
      "Day-1 / Day-7 / Day-30 sequencing of GRC actions",
      "Visual, plain-language design within a four-page limit",
      "Employment-lifecycle controls: Annex A 6.1, 6.2, 6.3, 6.6",
      "Designing for handover: HR must be able to maintain the pack"
    ],
    "questions": [
      "What must a joiner know on day one versus by day 30?",
      "How will you keep the reference guide to four pages without losing substance?",
      "What makes the pack maintainable by HR after handover?",
      "Why pilot with a recent joiner rather than a long-tenured colleague?"
    ]
  },
  "KT-002": {
    "org": "Strategic Advisory Consultants",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands retrospective method and continual improvement, and has the full portfolio of rotation deliverables assembled, before writing any reflection.",
    "controls": [
      {
        "ref": "Clause 10.1",
        "name": "Continual improvement"
      },
      {
        "ref": "Clause 10.2",
        "name": "Nonconformity and corrective action"
      },
      {
        "ref": "Annex A 5.27",
        "name": "Learning from information security incidents"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-07",
        "desc": "Risk responses managed and outcomes communicated"
      },
      {
        "code": "RC.IM-01",
        "desc": "Recovery plan incorporates lessons learned"
      },
      {
        "code": "Control 17.8",
        "desc": "Conduct post-incident reviews"
      }
    ],
    "templates": [
      {
        "name": "Lessons Learned Worksheet",
        "purpose": "Word — structured reflection questions: learning, successes, challenges, recommendations",
        "fmt": "doc",
        "fields": [
          "learning",
          "successes",
          "challenges",
          "recommendations"
        ]
      },
      {
        "name": "Lessons Learned Report Template",
        "purpose": "Word — introduction, key learnings table, programme improvement recommendations, portfolio index page",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Mentee Portfolio Index Template",
        "purpose": "spreadsheet: Task ID, Task Name, Deliverable, File Location, Date Completed, Badge Earned",
        "fmt": "sheet",
        "fields": [
          "Task ID",
          "Task Name",
          "Deliverable",
          "File Location",
          "Date Completed",
          "Badge Earned"
        ]
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "All completed task deliverables and working documents from the rotation gathered"
      },
      {
        "type": "template",
        "label": "Lessons Learned Worksheet, Report Template and Portfolio Index Template reviewed"
      },
      {
        "type": "access",
        "label": "Peer mentee identified for the second-perspective interview (if in a cohort)"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Lessons Learned Documentation — End-of-Rotation Retrospective with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Lessons Learned Report  + Mentee Portfolio Index  + Three Programme Improvement Recommendations.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Lessons Learned Report  + Mentee Portfolio Index  + Three Programme Improvement Recommendations. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Lessons Learned Report  + Mentee Portfolio Index  + Three Programme Improvement Recommendations. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Lessons Learned Report (2–3 pages) + Mentee Portfolio Index (complete list of all GRC 101 deliverables produced) + Three Programme Improvement Recommendations.",
    "acceptance": "Lessons Learned Report (2–3 pages) + Mentee Portfolio Index (complete list of all GRC 101 deliverables produced) + Three Programme Improvement Recommendations.",
    "concepts": [
      "Retrospective structure: what was learned, what worked, what did not, what to recommend",
      "Lessons versus complaints — actionable, evidence-based reflection",
      "ISO 27001 Clause 10.1 continual improvement applied to the programme itself",
      "The Mentee Portfolio Index as evidence of capability",
      "Writing for the next cohort as the audience"
    ],
    "questions": [
      "What distinguishes an actionable lesson from a complaint?",
      "Which portfolio artefacts best evidence your three biggest learnings?",
      "What are your top three programme improvements and their justification?",
      "Who consumes this report, and what should they do differently because of it?"
    ]
  },
  "LRC-001": {
    "org": "LearnTech Educational Solutions",
    "standard": "GDPR (EU) 2016/679",
    "objective": "Confirm the mentee knows the mandatory content of GDPR Articles 13 and 14 and plain-language drafting standards before reviewing the live notice.",
    "controls": [
      {
        "ref": "Article 13",
        "name": "Information to be provided where personal data are collected from the data subject"
      },
      {
        "ref": "Article 14",
        "name": "Information to be provided where personal data have not been obtained from the data subject"
      },
      {
        "ref": "Recital 39",
        "name": "Principle of transparency"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-05",
        "desc": "Legal, regulatory and contractual requirements understood"
      },
      {
        "code": "PR.DS-01",
        "desc": "Data at rest protected — contextual"
      },
      {
        "code": "Control 3.14",
        "desc": "Log sensitive data access — contextual"
      }
    ],
    "templates": [
      {
        "name": "Privacy Notice Gap-Check Checklist",
        "purpose": "Word — 14 mandatory elements with checklist column, notes column, and gap flag",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Privacy Notice Template",
        "purpose": "Word — GDPR-compliant structure covering all Article 13/14 elements in plain language",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Plain Language Writing Guide",
        "purpose": "reference card — 10 rules for accessible legal drafting",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Sector Benchmark Privacy Notice",
        "purpose": "anonymised example — provided by mentor",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Current public privacy notice obtained (website version)"
      },
      {
        "type": "template",
        "label": "Gap-Check Checklist, Privacy Notice Template and Plain Language Guide reviewed"
      },
      {
        "type": "access",
        "label": "Legal/DPO contact confirmed for review"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Privacy Notice Review and Gap Assessment with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing GDPR (EU) 2016/679 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Privacy Notice Gap-Check Report  + Revised Privacy Notice Draft .."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Privacy Notice Gap-Check Report  + Revised Privacy Notice Draft . in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Privacy Notice Gap-Check Report  + Revised Privacy Notice Draft . and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Privacy Notice Gap-Check Report (checklist with gap findings) + Revised Privacy Notice Draft (ready for DPO/Legal sign-off).",
    "acceptance": "Privacy Notice Gap-Check Report (checklist with gap findings) + Revised Privacy Notice Draft (ready for DPO/Legal sign-off).",
    "concepts": [
      "Article 13 (data collected from the subject) versus Article 14 (data obtained indirectly)",
      "The 14 mandatory privacy notice elements in the gap-check checklist",
      "Plain language and readability: Flesch-Kincaid Grade 8 target",
      "Layered notice design and sector good practice",
      "The Legal/DPO review and sign-off role"
    ],
    "questions": [
      "When does Article 14 apply instead of Article 13?",
      "Can you name at least five mandatory elements of a privacy notice?",
      "How is readability measured and improved in practice?",
      "Why does final sign-off sit with Legal/DPO rather than the mentee?"
    ]
  },
  "MM-001": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands what makes a good GRC KPI, how RAG thresholds work, and what Clause 9.1 requires, before defining any metric or building the tracker.",
    "controls": [
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Clause 9.3",
        "name": "Management review"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-06",
        "desc": "Risk management outcomes communicated"
      },
      {
        "code": "DE.CM-09",
        "desc": "Computing hardware and software monitored"
      },
      {
        "code": "PR.PS-04",
        "desc": "Logs of events created"
      }
    ],
    "templates": [
      {
        "name": "KPI Definition Card Template",
        "purpose": "Word — one card per KPI: name, formula, data source, frequency, owner, target, RAG thresholds, chart type",
        "fmt": "doc",
        "fields": [
          "name",
          "formula",
          "data source",
          "frequency",
          "owner",
          "target",
          "RAG thresholds",
          "chart type"
        ]
      },
      {
        "name": "Monthly GRC Metrics Tracking Spreadsheet Template",
        "purpose": "Excel — auto-RAG, 12-month rolling, trend sparklines",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "GRC Metrics Report Template",
        "purpose": "Word — one-page: RAG dashboard, commentary, actions required",
        "fmt": "doc",
        "fields": [
          "RAG dashboard",
          "commentary",
          "actions required"
        ]
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Compliance status outputs from earlier tasks for this organisation reviewed as the baseline"
      },
      {
        "type": "template",
        "label": "KPI Definition Card, Tracking Spreadsheet and Metrics Report templates reviewed"
      },
      {
        "type": "access",
        "label": "IT and HR data owners identified for month-1 collection"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for GRC KPI Definition and Basic Metrics Tracking Setup with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate GRC KPI Definition Pack  + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report .."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft GRC KPI Definition Pack  + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report . in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise GRC KPI Definition Pack  + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report . and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "GRC KPI Definition Pack (five KPI Definition Cards) + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report (one-page).",
    "acceptance": "GRC KPI Definition Pack (five KPI Definition Cards) + Monthly GRC Metrics Tracking Spreadsheet + Month 1 GRC Metrics Report (one-page).",
    "concepts": [
      "KPI versus KRI, and leading versus lagging indicators",
      "KPI anatomy: name, formula, data source, frequency, owner, target, RAG thresholds",
      "Data source reliability and collection effort",
      "ISO 27001 Clause 9.1 monitoring and measurement requirements",
      "Interpreting RAG status into management commentary"
    ],
    "questions": [
      "What five elements must every KPI definition card contain?",
      "Can you give one leading and one lagging GRC indicator for this organisation?",
      "How are sensible RAG thresholds set for a new metric with no history?",
      "What does Clause 9.1 require the organisation to determine?"
    ]
  },
  "MM-002": {
    "org": "Strategic Advisory Consultants",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands the risk register as a living document and can facilitate a structured review meeting before scheduling it with the risk owners.",
    "controls": [
      {
        "ref": "Clause 6.1.2",
        "name": "Information security risk assessment (ongoing)"
      },
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Annex A 5.9",
        "name": "Inventory of information and other associated assets (maintained)"
      }
    ],
    "crosswalk": [
      {
        "code": "ID.RA-06",
        "desc": "Risks identified"
      },
      {
        "code": "GV.RM-07",
        "desc": "Risk responses managed"
      },
      {
        "code": "DE.CM",
        "desc": "Adverse events monitored"
      }
    ],
    "templates": [
      {
        "name": "Risk Register Review Meeting Agenda Template",
        "purpose": "Word",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Risk Register",
        "purpose": "reuse from GRM-001 template — version controlled",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Monthly Risk Summary Template",
        "purpose": "Word — one-page: portfolio table, RAG movement arrows, narrative commentary",
        "fmt": "doc",
        "fields": [
          "portfolio table",
          "RAG movement arrows",
          "narrative commentary"
        ]
      },
      {
        "name": "Risk Register Version Control Log",
        "purpose": "spreadsheet tab",
        "fmt": "sheet",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Risk Register from GRC101-GRM-001 obtained, current version confirmed"
      },
      {
        "type": "access",
        "label": "Both risk owners identified and availability checked"
      },
      {
        "type": "template",
        "label": "Review Meeting Agenda and Monthly Risk Summary templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Risk Register Maintenance — Monthly Review Cycle with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Updated Risk Register  + Monthly Risk Summary  + Meeting Minutes.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Updated Risk Register  + Monthly Risk Summary  + Meeting Minutes. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Updated Risk Register  + Monthly Risk Summary  + Meeting Minutes. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Updated Risk Register (version 2) + Monthly Risk Summary (one-page: portfolio overview, score movements, new risks, overdue treatments) + Meeting Minutes.",
    "acceptance": "Updated Risk Register (version 2) + Monthly Risk Summary (one-page: portfolio overview, score movements, new risks, overdue treatments) + Meeting Minutes.",
    "concepts": [
      "Risk registers as live artefacts: re-scoring triggers and treatment progress",
      "Residual risk movement and portfolio-level interpretation",
      "Meeting facilitation: agenda discipline, pre-reading, real-time capture",
      "Consistent entry format for newly identified risks",
      "Version control of the register and evidence filing"
    ],
    "questions": [
      "What events or information would trigger a risk re-score?",
      "How will you keep a 60-minute meeting on agenda across all risks?",
      "What does it mean for the residual risk portfolio to improve or worsen?",
      "How is a new risk added so it is consistent with GRM-001 entries?"
    ]
  },
  "PE-001": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands what a charter locks in — scope, success criteria, governance — and the sponsor's role before drafting or convening a kick-off.",
    "controls": [
      {
        "ref": "Clause 6.2",
        "name": "Information security objectives and planning to achieve them"
      },
      {
        "ref": "Clause 5.3",
        "name": "Organisational roles, responsibilities and authorities"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC",
        "desc": "Organisational Context"
      },
      {
        "code": "GV.RM-01",
        "desc": "Risk management objectives established"
      }
    ],
    "templates": [
      {
        "name": "Project Charter Template",
        "purpose": "Word — background, objectives, success criteria, scope, out-of-scope, deliverables, team, governance, risks/assumptions, sign-off block",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Milestone Gantt Template",
        "purpose": "Excel — 6-month view with milestone diamonds, owner, and status",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "Kick-Off Meeting Agenda Template",
        "purpose": "Word — standard agenda with attendees, objectives, roles, questions, next steps",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "RACI Matrix Template",
        "purpose": "Excel",
        "fmt": "sheet",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "Initiative scope agreed with the mentor (e.g. the AA-002 gap-closure programme)"
      },
      {
        "type": "template",
        "label": "Project Charter, Milestone Gantt and Kick-Off Agenda templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for GRC Project Charter — Compliance Initiative Kick-Off with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Signed Project Charter + Milestone Gantt  + Kick-Off Meeting Minutes.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Signed Project Charter + Milestone Gantt  + Kick-Off Meeting Minutes. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Signed Project Charter + Milestone Gantt  + Kick-Off Meeting Minutes. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Signed Project Charter + Milestone Gantt (high-level) + Kick-Off Meeting Minutes.",
    "acceptance": "Signed Project Charter + Milestone Gantt (high-level) + Kick-Off Meeting Minutes.",
    "concepts": [
      "The project charter as the initiative's authorising document",
      "Scope and out-of-scope discipline — preventing scope creep at day one",
      "Success criteria versus deliverables",
      "Governance roles: sponsor, project lead, workstream owners (Clause 5.3)",
      "Milestone-level planning versus task-level planning, and initial risk identification"
    ],
    "questions": [
      "What decisions does the charter lock in, and who is bound by them?",
      "What is the difference between a success criterion and a deliverable?",
      "Why must the sponsor — not the project lead — sign the charter?",
      "What are the top three risks to this initiative and their initial mitigations?"
    ]
  },
  "PE-002": {
    "org": "Strategic Advisory Consultants",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands audit evidence quality, labelling conventions and what an auditor looks for, before requesting any evidence items.",
    "controls": [
      {
        "ref": "Clause 7.5",
        "name": "Documented information"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      },
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, communicated and enforced"
      },
      {
        "code": "ID.RA-01",
        "desc": "Vulnerabilities in assets identified"
      },
      {
        "code": "DE.CM-09",
        "desc": "Computing hardware and software monitored"
      }
    ],
    "templates": [
      {
        "name": "Audit Evidence Requirements List",
        "purpose": "Word — per ISO 27001 clause: control objective, expected evidence types, evidence quality criteria",
        "fmt": "doc",
        "fields": [
          "control objective",
          "expected evidence types",
          "evidence quality criteria"
        ]
      },
      {
        "name": "Evidence Labelling Convention Guide",
        "purpose": "Word — naming syntax and folder structure",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Evidence Index Template",
        "purpose": "spreadsheet: Evidence ID, Control Reference, Evidence Description, Source, Date, Collected By, Quality Check Status, Location",
        "fmt": "sheet",
        "fields": [
          "Evidence ID",
          "Control Reference",
          "Evidence Description",
          "Source",
          "Date",
          "Collected By",
          "Quality Check Status",
          "Location"
        ]
      },
      {
        "name": "Audit Evidence Checklist",
        "purpose": "Word — quality-check criteria per evidence item",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "ISO 27001 clause or Annex A control set selected with the mentor"
      },
      {
        "type": "template",
        "label": "Audit Evidence Requirements List, Labelling Convention Guide and Evidence Index Template reviewed"
      },
      {
        "type": "access",
        "label": "System owners holding the evidence identified"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Audit Evidence Preparation and Filing with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Audit Evidence Pack."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Audit Evidence Pack in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Audit Evidence Pack and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Audit Evidence Pack",
    "acceptance": "Audit Evidence Pack — labelled evidence files, Evidence Index (spreadsheet), and a completed self-review Audit Evidence Checklist.",
    "concepts": [
      "Evidence quality: relevance, sufficiency, reliability, currency",
      "Evidence types: records, configuration exports, meeting minutes, logs, approvals",
      "The Evidence Labelling Convention and folder structure",
      "The Evidence Index as the auditor's entry point",
      "Mock-audit thinking: what will the auditor ask about each item? (Clause 7.5, Annex A 5.35, 5.36)"
    ],
    "questions": [
      "What four qualities make an evidence item auditable?",
      "Why must outdated or incomplete items be rejected rather than included?",
      "How does the labelling convention link evidence to controls?",
      "For one sample item, what questions would an auditor ask you about it?"
    ]
  },
  "QA-001": {
    "org": "Strategic Advisory Consultants",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands document quality criteria, deficiency severity and the correction workflow before reviewing any document or approaching its owner.",
    "controls": [
      {
        "ref": "Clause 7.5.2",
        "name": "Creating and updating documented information"
      },
      {
        "ref": "Clause 7.5.3",
        "name": "Control of documented information"
      },
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, communicated"
      },
      {
        "code": "GV.OC",
        "desc": "Organisational context maintained"
      }
    ],
    "templates": [
      {
        "name": "Document Quality Review Checklist",
        "purpose": "Word — criteria: document control completeness, version number, approval signatures, scope accuracy, policy statement completeness, control references, plain language, review date currency",
        "fmt": "doc",
        "fields": [
          "document control completeness",
          "version number",
          "approval signatures",
          "scope accuracy",
          "policy statement completeness",
          "control references",
          "plain language",
          "review date currency"
        ]
      },
      {
        "name": "Correction Request Form",
        "purpose": "Word — Correction ID, Document, Section, Deficiency Description, Severity, Recommended Action, Due Date, Resolved Y/N",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Correction Tracking Log",
        "purpose": "Excel — Correction ID, status, document owner, resolution date",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "Quality Review Closure Report Template",
        "purpose": "Word — one-page summary",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Three GRC documents selected with the mentor (e.g. outputs of GRM-002 or DD-001)"
      },
      {
        "type": "template",
        "label": "Quality Review Checklist, Correction Request Form and Tracking Log reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for GRC Document Quality Review with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Quality Review Report  + Correction Tracking Log + Quality Review Closure Report.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Quality Review Report  + Correction Tracking Log + Quality Review Closure Report. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Quality Review Report  + Correction Tracking Log + Quality Review Closure Report. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Quality Review Report (deficiency list with severities and correction requests) + Correction Tracking Log + Quality Review Closure Report.",
    "acceptance": "Quality Review Report (deficiency list with severities and correction requests) + Correction Tracking Log + Quality Review Closure Report.",
    "concepts": [
      "Document quality criteria: document control completeness, versioning, approvals, scope accuracy, control references, plain language, review currency",
      "Major versus Minor deficiency classification",
      "The Correction Request workflow: raise, discuss, track, re-check, close",
      "Reviewer objectivity and constructive feedback to document owners",
      "Clauses 7.5.2 / 7.5.3 as the quality baseline"
    ],
    "questions": [
      "What criteria define a quality GRC document under the checklist?",
      "Where is the line between a Major and a Minor deficiency?",
      "How would you raise a Major deficiency with its owner constructively?",
      "When is a Correction Request formally closed?"
    ]
  },
  "QA-002": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands audit test approaches, sampling and pass/fail definition before selecting controls or writing methodology sheets.",
    "controls": [
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      },
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards"
      }
    ],
    "crosswalk": [
      {
        "code": "DE.CM-09",
        "desc": "Computing hardware and software monitored"
      },
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed and enforced"
      },
      {
        "code": "Control 18",
        "desc": "Penetration Testing — awareness only at GRC 101 level"
      }
    ],
    "templates": [
      {
        "name": "Control Testing Methodology Sheet Template",
        "purpose": "Word — Control ID, Control Objective, Test Approach, Test Steps (numbered), Evidence Required, Evidence Quality Criteria, Pass/Fail Criteria, Frequency, Testing Owner",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Testing Methodology Overview Template",
        "purpose": "Word — sampling rationale, frequency schedule, documentation standards, escalation path",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Audit Standard Reference Extract",
        "purpose": "excerpts from ISAE 3000, IIA Standards — provided by mentor",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "ISO 27001 Control Matrix from GRC101-CRM-002 obtained and three controls shortlisted"
      },
      {
        "type": "template",
        "label": "Methodology Sheet and Overview templates plus audit-standard reference materials reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Control Testing Methodology Development with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Three Control Testing Methodology Sheets + Testing Methodology Overview  filed in the GRC QA Library.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Three Control Testing Methodology Sheets + Testing Methodology Overview  filed in the GRC QA Library. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Three Control Testing Methodology Sheets + Testing Methodology Overview  filed in the GRC QA Library. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Three Control Testing Methodology Sheets + Testing Methodology Overview (one page) filed in the GRC QA Library.",
    "acceptance": "Three Control Testing Methodology Sheets + Testing Methodology Overview (one page) filed in the GRC QA Library.",
    "concepts": [
      "Test approaches: inquiry, observation, inspection, re-performance — and when each suffices",
      "Sampling: rationale, size and period",
      "Unambiguous pass/fail criteria",
      "Repeatability and defensibility — another tester must reach the same result",
      "How professional audit firms document comparable tests (Clause 9.1, Annex A 5.35, 5.36)"
    ],
    "questions": [
      "When is inquiry alone insufficient as a test approach?",
      "How do you write a pass/fail criterion that two testers would apply identically?",
      "What sampling approach fits each of the three chosen controls?",
      "Why must the methodology be usable by someone who did not write it?"
    ]
  },
  "RR-001": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee has studied the incident reporting procedure and scenario brief and understands the observer's discipline before exercise day.",
    "controls": [
      {
        "ref": "Annex A 5.26",
        "name": "Response to information security incidents"
      },
      {
        "ref": "Annex A 5.27",
        "name": "Learning from information security incidents"
      },
      {
        "ref": "Annex A 5.28",
        "name": "Collection of evidence"
      },
      {
        "ref": "Annex A 6.8",
        "name": "Information security event reporting"
      }
    ],
    "crosswalk": [
      {
        "code": "RS.MA-01",
        "desc": "Incident response activities aligned with plan"
      },
      {
        "code": "RS.CO-02",
        "desc": "Incidents reported"
      },
      {
        "code": "RC.RP-01",
        "desc": "Recovery plan executed"
      },
      {
        "code": "Control 17",
        "desc": "Incident Response Management"
      }
    ],
    "templates": [
      {
        "name": "Tabletop Observation Sheet",
        "purpose": "Word — with sections: timeline log, decision log, escalation log, communication gaps, resource gaps, deviations from procedure",
        "fmt": "doc",
        "fields": [
          "timeline log",
          "decision log",
          "escalation log",
          "communication gaps",
          "resource gaps",
          "deviations from procedure"
        ]
      },
      {
        "name": "Post-Exercise Lessons Learned Report Template",
        "purpose": "Word — exercise summary, observations, top-3 improvements, procedure amendment proposals, sign-off",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Tabletop Scenario Brief Template",
        "purpose": "provided by Incident Response & Crisis Manager mentor",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Incident Reporting Procedure from GRC101-DD-001 read and understood"
      },
      {
        "type": "context",
        "label": "Tabletop scenario brief read before exercise day"
      },
      {
        "type": "template",
        "label": "Observation Sheet and Lessons Learned Report templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Tabletop Incident Simulation — Observer and Note-Taker Role with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Post-Exercise Lessons Learned Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Post-Exercise Lessons Learned Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Post-Exercise Lessons Learned Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Post-Exercise Lessons Learned Report",
    "acceptance": "Post-Exercise Lessons Learned Report — timeline of the exercise, structured observations, top-three improvement recommendations with proposed procedure amendments.",
    "concepts": [
      "Purpose of tabletop exercises: testing decisions and communication, not technology",
      "The observer role: capture, do not participate in decisions",
      "Structured observation: timeline, decision, escalation and communication logs",
      "Lessons-learned discipline under Annex A 5.27 and the 48-hour write-up window",
      "Turning observations into procedure amendment proposals"
    ],
    "questions": [
      "What does an observer capture that participants cannot capture themselves?",
      "What are the sections of the Tabletop Observation Sheet and what goes in each?",
      "Why must the lessons-learned report be written within 48 hours?",
      "How does an observation become a concrete procedure amendment?"
    ]
  },
  "SPA-001": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee has absorbed the gap, risk and maturity findings that feed the roadmap, and understands phased planning and prioritisation, before consolidating anything.",
    "controls": [
      {
        "ref": "Clause 6.2",
        "name": "Information security objectives and planning to achieve them"
      },
      {
        "ref": "Clause 9.3",
        "name": "Management review"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-06",
        "desc": "Risk tolerance determined and communicated"
      },
      {
        "code": "GV.OC",
        "desc": "Organisational Context understood and used to prioritise cybersecurity risk"
      }
    ],
    "templates": [
      {
        "name": "GRC Roadmap Template",
        "purpose": "Excel — Gantt chart with action IDs, descriptions, phase, owner, control reference, start/end dates, status, and estimated effort",
        "fmt": "sheet",
        "fields": []
      },
      {
        "name": "Management Briefing Template",
        "purpose": "Word — one-page format: context, priorities, investment summary, next steps",
        "fmt": "doc",
        "fields": [
          "context",
          "priorities",
          "investment summary",
          "next steps"
        ]
      },
      {
        "name": "GRC Action Detail Sheet",
        "purpose": "spreadsheet supporting the Gantt",
        "fmt": "sheet",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Gap Analysis (GRC101-AA-002), Risk Register (GRC101-GRM-001) and Maturity Assessment (GRC101-GRM-003) outputs obtained and read"
      },
      {
        "type": "template",
        "label": "GRC Roadmap Gantt Template and Management Briefing Template reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for GRC Programme Roadmap — 12-Month Plan for One Organisation with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate 12-Month GRC Improvement Roadmap."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft 12-Month GRC Improvement Roadmap in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise 12-Month GRC Improvement Roadmap and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "12-Month GRC Improvement Roadmap",
    "acceptance": "12-Month GRC Improvement Roadmap — phased action plan (Gantt chart), per-action detail spreadsheet, and a one-page Management Briefing.",
    "concepts": [
      "Phased planning: Quick Wins (0–3 months), Medium-Term (3–6), Longer-Term (6–12)",
      "ISO 27001 Clause 6.2 — objectives and planning to achieve them",
      "Effort-versus-impact prioritisation and dependency sequencing",
      "Gantt basics: milestones, owners, phases, status",
      "Estimating compliance uplift and writing an investment rationale for management"
    ],
    "questions": [
      "What are the headline findings of AA-002, GRM-001 and GRM-003 for this organisation?",
      "What makes an action a Quick Win rather than a Medium-Term action?",
      "How would you sequence two actions where one depends on the other?",
      "What exactly is management being asked to endorse?"
    ]
  },
  "SPA-002": {
    "org": "LearnTech Educational Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands stakeholder analysis mechanics — influence, interest, quadrants and engagement strategies — and has a confirmed initiative in scope, before brainstorming stakeholders.",
    "controls": [
      {
        "ref": "Clause 4.2",
        "name": "Understanding the needs and expectations of interested parties"
      },
      {
        "ref": "Clause 5.3",
        "name": "Organisational roles, responsibilities and authorities"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-02",
        "desc": "Internal and external stakeholders identified"
      },
      {
        "code": "GV.SC-04",
        "desc": "Suppliers and third parties are informed of their roles"
      }
    ],
    "templates": [
      {
        "name": "Stakeholder Register Template",
        "purpose": "spreadsheet: Stakeholder ID, Name/Group, Role, Interest Area, Influence Level 1–5, Interest Level 1–5, Quadrant, Engagement Strategy, Communication Channel, Frequency, Owner",
        "fmt": "sheet",
        "fields": [
          "Stakeholder ID",
          "Name/Group",
          "Role",
          "Interest Area",
          "Influence Level 1–5",
          "Interest Level 1–5",
          "Quadrant",
          "Engagement Strategy",
          "Communication Channel",
          "Frequency",
          "Owner"
        ]
      },
      {
        "name": "Influence-Interest Matrix Template",
        "purpose": "PowerPoint 2×2 diagram",
        "fmt": "diagram",
        "fields": []
      },
      {
        "name": "Stakeholder Communication Plan Template",
        "purpose": "Word table format",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "context",
        "label": "A GRC initiative selected from the 12-month roadmap (GRC101-SPA-001)"
      },
      {
        "type": "artefact",
        "label": "Stakeholder Register, Influence-Interest Matrix and Communication Plan templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Stakeholder Mapping for a GRC Initiative with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative.."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative. in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative. and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative.",
    "acceptance": "Stakeholder Register + Influence-Interest Matrix + Stakeholder Communication Plan for the selected GRC initiative.",
    "concepts": [
      "Interested parties under ISO 27001 Clause 4.2 and roles under Clause 5.3",
      "Influence versus interest and the 2×2 Influence-Interest Matrix",
      "Quadrant strategies: Manage Closely / Keep Satisfied / Keep Informed / Monitor",
      "Stakeholder registers and communication planning (what, how often, which channel)",
      "Internal versus external stakeholder identification"
    ],
    "questions": [
      "What is the difference between a stakeholder's influence and their interest?",
      "What engagement strategy applies to each quadrant of the matrix?",
      "Who are the likely high-influence stakeholders for the chosen initiative?",
      "How and when should the stakeholder map be re-validated?"
    ]
  },
  "TPRM-001": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands third-party risk drivers, the five-criterion rating model and DPA obligations before gathering the vendor list.",
    "controls": [
      {
        "ref": "Annex A 5.19",
        "name": "Information security in supplier relationships"
      },
      {
        "ref": "Annex A 5.20",
        "name": "Addressing information security within supplier agreements"
      },
      {
        "ref": "Annex A 5.22",
        "name": "Monitoring, review and change management of supplier services"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.SC-04",
        "desc": "Suppliers and third parties informed of their roles"
      },
      {
        "code": "GV.SC-06",
        "desc": "Planning and due diligence performed"
      },
      {
        "code": "Control 15",
        "desc": "Service Provider Management"
      }
    ],
    "templates": [
      {
        "name": "Supplier Register Template",
        "purpose": "spreadsheet: Vendor ID, Vendor Name, Service, Data Access Type, System Access, Criticality Score, Location, Certification Held, Composite Risk Rating, DPA Status, Contract Expiry, Primary Contact, Notes",
        "fmt": "sheet",
        "fields": [
          "Vendor ID",
          "Vendor Name",
          "Service",
          "Data Access Type",
          "System Access",
          "Criticality Score",
          "Location",
          "Certification Held",
          "Composite Risk Rating",
          "DPA Status",
          "Contract Expiry",
          "Primary Contact",
          "Notes"
        ]
      },
      {
        "name": "Five-Criterion Risk Rating Guide",
        "purpose": "Word — criteria definitions and scoring anchors",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "High-Risk Vendor Summary Template",
        "purpose": "Word — one-page alert format",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "access",
        "label": "Access to contract management, accounts payable and IT vendor records confirmed"
      },
      {
        "type": "artefact",
        "label": "Supplier Register Template and Five-Criterion Rating Guide reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Supplier / Vendor Inventory and Basic Security Risk Rating with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Supplier Register."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Supplier Register in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Supplier Register and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Supplier Register",
    "acceptance": "Supplier Register — full vendor inventory with risk ratings, data-access type, contract status, and DPA gap flags; plus a High-Risk Vendor Summary.",
    "concepts": [
      "Why third parties are a risk channel: data access, system access, criticality",
      "The five-criterion risk rating model and composite Low/Medium/High scoring",
      "Data access levels: none / view / process / store",
      "Data-processing agreements under GDPR Article 28 — when they are required",
      "Vendor discovery sources: contracts, accounts payable, IT records (Annex A 5.19–5.22)"
    ],
    "questions": [
      "Why is a vendor's data-access level usually the dominant risk driver?",
      "What sources will reveal vendors that IT does not know about?",
      "When is a DPA legally required with a vendor?",
      "What action follows a High composite rating?"
    ]
  },
  "TPRM-002": {
    "org": "GlobalConnect Customer Solutions",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands questionnaire-based due diligence — customisation, credibility assessment and scoring — before contacting the vendor.",
    "controls": [
      {
        "ref": "Annex A 5.20",
        "name": "Addressing information security within supplier agreements"
      },
      {
        "ref": "Annex A 5.21",
        "name": "Managing information security in the ICT supply chain"
      },
      {
        "ref": "Annex A 5.19",
        "name": "Information security in supplier relationships"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.SC-06",
        "desc": "Planning and due diligence performed"
      },
      {
        "code": "GV.SC-07",
        "desc": "Risks posed by suppliers assessed"
      },
      {
        "code": "Control 15.2",
        "desc": "Establish and maintain a process to address weaknesses in third-party service provider security"
      }
    ],
    "templates": [
      {
        "name": "Vendor Security Questionnaire Template",
        "purpose": "Word — 25 questions covering: information security policy, access management, incident response, business continuity, subprocessors, certifications, physical security, network security, encryption, data deletion",
        "fmt": "doc",
        "fields": [
          "information security policy",
          "access management",
          "incident response",
          "business continuity",
          "subprocessors",
          "certifications",
          "physical security",
          "network security",
          "encryption",
          "data deletion"
        ]
      },
      {
        "name": "Due-Diligence Assessment Report Template",
        "purpose": "Word — vendor summary, questionnaire score, gap table, risk rating, recommended mitigations, sign-off",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Due-Diligence Scoring Guide",
        "purpose": "reference card",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Supplier Register from GRC101-TPRM-001 obtained and a Medium-risk vendor selected with the mentor"
      },
      {
        "type": "template",
        "label": "Vendor Security Questionnaire and Assessment Report templates reviewed"
      },
      {
        "type": "access",
        "label": "Vendor security/compliance contact identified"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Vendor Due-Diligence Questionnaire — Completion and Review with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Vendor Due-Diligence Assessment Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Vendor Due-Diligence Assessment Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Vendor Due-Diligence Assessment Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Vendor Due-Diligence Assessment Report",
    "acceptance": "Vendor Due-Diligence Assessment Report — completed questionnaire (with assessment annotations), Due-Diligence Score, gap list, risk rating confirmation, and recommended mitigations.",
    "concepts": [
      "Customising a standard questionnaire to the vendor's service and data footprint",
      "Assessing response credibility: specific, evidenced answers versus vague assurances",
      "Reliance on certifications (ISO 27001, SOC 2) and its limits",
      "Mapping responses to Annex A controls and flagging gaps",
      "Due-diligence scoring and professional vendor communication"
    ],
    "questions": [
      "Which questionnaire sections need customising for this vendor's service?",
      "What distinguishes a credible answer from a vague one, with an example?",
      "How does a vendor's ISO 27001 certificate change what evidence you need?",
      "How is the due-diligence score computed and what threshold matters?"
    ]
  },
  "TV-001": {
    "org": "CloudTech Solutions Enterprise",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee understands least privilege, account states and finding types — and the sensitivity of the data being handled — before requesting any account extract.",
    "controls": [
      {
        "ref": "Annex A 8.2",
        "name": "Privileged access rights"
      },
      {
        "ref": "Annex A 8.3",
        "name": "Information access restriction"
      },
      {
        "ref": "Annex A 8.5",
        "name": "Secure authentication"
      },
      {
        "ref": "Annex A 5.18",
        "name": "Access rights"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AA-01",
        "desc": "Identities and credentials managed"
      },
      {
        "code": "PR.AA-02",
        "desc": "Identities are proofed and bound to credentials"
      },
      {
        "code": "Control 5",
        "desc": "Account Management"
      },
      {
        "code": "Control 6",
        "desc": "Access Control Management"
      }
    ],
    "templates": [
      {
        "name": "Access Review Worksheet",
        "purpose": "spreadsheet: Account ID, Username, System, Role/Permission Level, Last Login Date, HR Status, Finding Type, Recommended Action, Priority, IT Owner Action",
        "fmt": "sheet",
        "fields": [
          "Account ID",
          "Username",
          "System",
          "Role/Permission Level",
          "Last Login Date",
          "HR Status",
          "Finding Type",
          "Recommended Action",
          "Priority",
          "IT Owner Action"
        ]
      },
      {
        "name": "Access Control Testing Report Template",
        "purpose": "Word — executive summary, findings table, remediation recommendations, sign-off block",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Cross-Reference Methodology Guide",
        "purpose": "",
        "fmt": "doc",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "access",
        "label": "System owner and HR contact identified and extract requests understood"
      },
      {
        "type": "template",
        "label": "Access Review Worksheet and Testing Report templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Access Control Review — User Account Validation with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Access Control Testing Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Access Control Testing Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Access Control Testing Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Access Control Testing Report",
    "acceptance": "Access Control Testing Report — findings table (account status, issue type, recommendation), executive summary with remediation priority, and a signed remediation acknowledgement from the IT Manager.",
    "concepts": [
      "Least privilege and role-based access (Annex A 5.18, 8.2, 8.3, 8.5)",
      "Joiner–mover–leaver lifecycle and where access errors creep in",
      "Orphaned versus dormant versus mismatched accounts",
      "Independent data sources: system extract cross-referenced against HR records",
      "Finding types, priorities and remediation deadlines"
    ],
    "questions": [
      "What is the difference between an orphaned and a dormant account?",
      "Why must the HR list come from a source independent of the system extract?",
      "What finding types will the worksheet use, and how is priority assigned?",
      "What care does the account extract itself require as sensitive data?"
    ]
  },
  "TV-002": {
    "org": "Strategic Advisory Consultants",
    "standard": "ISO/IEC 27001:2022",
    "objective": "Confirm the mentee can turn a policy clause into a testable control statement and understands evidence sampling before selecting policies or requesting evidence.",
    "controls": [
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards for information security"
      },
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 8.1",
        "name": "User endpoint devices"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed and communicated"
      },
      {
        "code": "PR.AT-01",
        "desc": "Personnel provided awareness and training"
      },
      {
        "code": "DE.CM",
        "desc": "Monitoring performed"
      }
    ],
    "templates": [
      {
        "name": "Control Testing Workpaper Template",
        "purpose": "Word — Control ID, Control Statement, Test Procedure, Evidence Requested, Evidence Received, Result, Finding Narrative, Recommendation",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Spot-Check Report Template",
        "purpose": "Word — cover page, scope, methodology, findings summary table, recommendations, appendix",
        "fmt": "doc",
        "fields": []
      },
      {
        "name": "Compliance Rate Calculator",
        "purpose": "Excel formula sheet",
        "fmt": "sheet",
        "fields": []
      }
    ],
    "acquire": [
      {
        "type": "artefact",
        "label": "Three candidate policies identified (e.g. from GRC101-GRM-002 or the document library)"
      },
      {
        "type": "template",
        "label": "Control Testing Workpaper and Spot-Check Report templates reviewed"
      }
    ],
    "steps": [
      {
        "verb": "Confirm",
        "text": "Confirm scope and objectives for Policy Compliance Spot-Check — Desk-Based Control Testing with the reviewing role."
      },
      {
        "verb": "Acquire",
        "text": "Gather the prerequisite inputs, organisation context and templates the task depends on."
      },
      {
        "verb": "Study",
        "text": "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk."
      },
      {
        "verb": "Collect",
        "text": "Collect the raw material — records, extracts, interviews or evidence — needed to populate Policy Compliance Spot-Check Report."
      },
      {
        "verb": "Analyse",
        "text": "Analyse and structure the material against the template, applying the task's scoring or classification method."
      },
      {
        "verb": "Draft",
        "text": "Draft Policy Compliance Spot-Check Report in the provided template to the acceptance standard."
      },
      {
        "verb": "Review",
        "text": "Review the draft with the process owner and reconcile gaps or corrections."
      },
      {
        "verb": "Sign-off",
        "text": "Finalise Policy Compliance Spot-Check Report and obtain the required sign-off, filing it to the portfolio."
      }
    ],
    "deliverable": "Policy Compliance Spot-Check Report",
    "acceptance": "Policy Compliance Spot-Check Report — control testing workpapers (one per policy), compliance rate summary, findings table, and remediation recommendations.",
    "concepts": [
      "Control statements: specific, observable, testable assertions derived from policy text",
      "Evidence sampling: what to request, sample size, and period covered",
      "Test techniques: inquiry versus inspection of evidence",
      "Result categories: compliant / partially compliant / non-compliant",
      "Compliance rate calculation and remediation recommendations (Annex A 5.36)"
    ],
    "questions": [
      "What makes a control statement testable, with an example from an Acceptable Use Policy?",
      "How would you choose an evidence sample that is fair and sufficient?",
      "Where is the boundary between compliant and partially compliant?",
      "Why record both evidence requested and evidence received?"
    ]
  }
};

export const getRuaTask = (taskCode?: string) => (taskCode ? RUA_TASKS[taskCode] : undefined);
