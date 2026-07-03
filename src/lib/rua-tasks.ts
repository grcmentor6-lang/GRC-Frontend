// Per-task content for the RUA (Requirement & Understanding Analysis) readiness gate — the
// mandatory preparation step (code x.0) that opens every task. Ported from the RUA catalog
// (GRC101_Requirement_Understanding_Analysis_Tasks.docx via the design mockup). Keyed by task code.
// ponytail: AA-001 only for the pilot; the remaining 34 GRC101 entries port the same way.

export interface RuaControl { ref: string; name: string }
export interface RuaCrosswalk { code: string; desc: string }
export interface RuaTemplate { name: string; purpose: string; fmt: "sheet" | "doc"; fields: string[] }
export interface RuaAcquireItem { type: "context" | "template" | "access" | "artefact"; label: string }
export interface RuaStep { verb: string; text: string }

export interface RuaTask {
  /** Organisation this engagement runs in (used in copy). */
  org: string;
  standard: string;
  objective: string;
  /** Part A — governing controls to study, each needing a short "what it requires" note. */
  controls: RuaControl[];
  /** NIST CSF cross-walk shown alongside the controls. */
  crosswalk: RuaCrosswalk[];
  /** Part A — every provided template to inspect. */
  templates: RuaTemplate[];
  /** Part A — prerequisite inputs/access to confirm before starting. */
  acquire: RuaAcquireItem[];
  /** Part A — the task's activity steps, walked and acknowledged one by one. */
  steps: RuaStep[];
  /** The deliverable contract locked in the Confirm section. */
  deliverable: string;
  acceptance: string;
  /** Part B — key concepts the mentee explains in their own words. */
  concepts: string[];
  /** Part C — readiness verification questions. */
  questions: string[];
}

export const RUA_TASKS: Record<string, RuaTask> = {
  "AA-001": {
    org: "CloudTech Solutions Enterprise",
    standard: "ISO/IEC 27001:2022",
    objective:
      "Confirm you understand what an information asset is, why classification matters, and how the register will be built and signed off — before any interviews or data gathering begin.",
    controls: [
      { ref: "Annex A 5.9", name: "Inventory of information and other associated assets" },
      { ref: "Annex A 5.12", name: "Classification of information" },
      { ref: "Annex A 8.1", name: "User endpoint devices" },
    ],
    crosswalk: [
      { code: "ID.AM-01", desc: "Inventories of hardware maintained" },
      { code: "ID.AM-02", desc: "Inventories of software maintained" },
      { code: "ID.AM-05", desc: "Assets are prioritised" },
    ],
    templates: [
      {
        name: "Information Asset Register Template",
        purpose: "Spreadsheet you will populate — one row per asset.",
        fmt: "sheet",
        fields: ["Asset ID", "Asset Name", "Asset Type", "Owner", "Location", "Format", "CIA Classification", "Custodian", "Review Date", "Notes"],
      },
      { name: "Asset Discovery Interview Guide", purpose: "Structured question set for the process-owner interviews.", fmt: "doc", fields: [] },
    ],
    acquire: [
      { type: "context", label: "Organisation and business-unit context for CloudTech Solutions Enterprise" },
      { type: "access", label: "Confirmed IT/Operations contact for the initial systems list" },
      { type: "artefact", label: "No prior GRC 101 task outputs required — this is a foundation task" },
    ],
    steps: [
      { verb: "Confirm", text: "Confirm scope and objectives for Information Asset Inventory & Classification with the reviewing role." },
      { verb: "Acquire", text: "Gather the prerequisite inputs, organisation context and templates the task depends on." },
      { verb: "Study", text: "Study the governing ISO/IEC 27001:2022 control references and the NIST CSF cross-walk." },
      { verb: "Collect", text: "Collect the raw material — records, extracts, interviews or evidence — needed to populate the Information Asset Register." },
      { verb: "Analyse", text: "Analyse and structure the material against the template, applying the task's classification method." },
      { verb: "Draft", text: "Draft the Information Asset Register in the provided template to the acceptance standard." },
      { verb: "Review", text: "Review the draft with the process owner and reconcile gaps or corrections." },
      { verb: "Sign-off", text: "Finalise the Information Asset Register and obtain the required sign-off, filing it to the portfolio." },
    ],
    deliverable: "Information Asset Register",
    acceptance:
      "Information Asset Register — a signed-off spreadsheet listing all identified assets with classification, owner, location, and residual gaps.",
    concepts: [
      "Information asset types: data, software, hardware, services, people and intangibles",
      "The CIA triad (Confidentiality, Integrity, Availability) as the basis for classification",
      "Asset ownership versus custodianship — why every asset needs a named owner",
      "The three-tier classification scheme (Public / Internal / Confidential) under ISO/IEC 27001:2022 Annex A 5.12",
      "Intent of Annex A 5.9 (asset inventory) and A 8.1 (user endpoint devices)",
    ],
    questions: [
      "What qualifies as an information asset in this organisation, and what does not?",
      "Why must every asset have a named owner, and what happens when one cannot be identified?",
      "How would you decide between an Internal and a Confidential classification for a given asset?",
      "What makes the asset register complete enough for department-head sign-off?",
    ],
  },
};

export const getRuaTask = (taskCode?: string) => (taskCode ? RUA_TASKS[taskCode] : undefined);
