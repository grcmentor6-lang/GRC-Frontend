// Controls register per task code — fixed product reference data (extracted from the Reports mockup).
// Joined onto the live /me/learnings tree by task code. Activities come from learnings steps.

export interface Control { standard: string; tone: string; domain: string; num: string; name: string; purpose: string; }
export interface TaskControls { category: string; controls: Control[]; }

export const CONTROLS_BY_TASK: Record<string, TaskControls> = {
  "AA-001": {
    "category": "Assessment & Analysis",
    "controls": [
      {
        "standard": "ISO/IEC 27001:2022",
        "tone": "indigo",
        "domain": "Organizational controls",
        "num": "Annex A 5.9",
        "name": "Inventory of information & associated assets",
        "purpose": "Establish and maintain a complete inventory of information assets and their owners."
      },
      {
        "standard": "ISO/IEC 27001:2022",
        "tone": "indigo",
        "domain": "Organizational controls",
        "num": "Annex A 5.12",
        "name": "Classification of information",
        "purpose": "Classify information by confidentiality, integrity and availability needs."
      },
      {
        "standard": "ISO/IEC 27001:2022",
        "tone": "indigo",
        "domain": "Technological controls",
        "num": "Annex A 8.1",
        "name": "User endpoint devices",
        "purpose": "Protect information on user endpoint devices in scope of the inventory."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Identify · Asset Management",
        "num": "ID.AM-01",
        "name": "Hardware inventories maintained",
        "purpose": "Maintain inventories of hardware managed by the organisation."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Identify · Asset Management",
        "num": "ID.AM-02",
        "name": "Software inventories maintained",
        "purpose": "Maintain inventories of software, services and systems."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Identify · Asset Management",
        "num": "ID.AM-05",
        "name": "Assets are prioritised",
        "purpose": "Prioritise assets by criticality and business value."
      }
    ]
  },
  "AA-002": {
    "category": "Assessment & Analysis",
    "controls": [
      {
        "standard": "CIS Controls v8",
        "tone": "rose",
        "domain": "Basic Cyber Hygiene (IG1)",
        "num": "CIS 1",
        "name": "Inventory & Control of Enterprise Assets",
        "purpose": "Actively manage all enterprise assets connected to the infrastructure."
      },
      {
        "standard": "CIS Controls v8",
        "tone": "rose",
        "domain": "Basic Cyber Hygiene (IG1)",
        "num": "CIS 2",
        "name": "Inventory & Control of Software Assets",
        "purpose": "Actively manage all software so only authorised software is installed."
      },
      {
        "standard": "CIS Controls v8",
        "tone": "rose",
        "domain": "Basic Cyber Hygiene (IG1)",
        "num": "CIS 3",
        "name": "Data Protection",
        "purpose": "Identify, classify and securely handle and dispose of data."
      },
      {
        "standard": "CIS Controls v8",
        "tone": "rose",
        "domain": "Basic Cyber Hygiene (IG1)",
        "num": "CIS 4",
        "name": "Secure Configuration of Assets",
        "purpose": "Establish and maintain secure configurations for hardware and software."
      },
      {
        "standard": "CIS Controls v8",
        "tone": "rose",
        "domain": "Basic Cyber Hygiene (IG1)",
        "num": "CIS 5",
        "name": "Account Management",
        "purpose": "Manage the lifecycle of system and application accounts."
      },
      {
        "standard": "CIS Controls v8",
        "tone": "rose",
        "domain": "Basic Cyber Hygiene (IG1)",
        "num": "CIS 6",
        "name": "Access Control Management",
        "purpose": "Grant, manage and revoke access based on least privilege."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Protect · Identity Management",
        "num": "PR.AA",
        "name": "Identity Management & Access Control",
        "purpose": "Limit access to assets to authorised users, processes and devices."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Protect · Data Security",
        "num": "PR.DS",
        "name": "Data Security",
        "purpose": "Manage data consistent with the organisation's risk strategy."
      }
    ]
  },
  "AA-003": {
    "category": "Assessment & Analysis",
    "controls": [
      {
        "standard": "GDPR (EU) 2016/679",
        "tone": "amber",
        "domain": "Scope & Definitions",
        "num": "Art. 4",
        "name": "Definitions",
        "purpose": "Establish what counts as personal data, processing, controller and processor."
      },
      {
        "standard": "GDPR (EU) 2016/679",
        "tone": "amber",
        "domain": "Transparency",
        "num": "Art. 13 & 14",
        "name": "Information to be provided",
        "purpose": "Ensure data subjects are informed about processing of their data."
      },
      {
        "standard": "GDPR (EU) 2016/679",
        "tone": "amber",
        "domain": "Accountability",
        "num": "Art. 30",
        "name": "Records of Processing Activities (RoPA)",
        "purpose": "Maintain a record of processing activities for each process."
      },
      {
        "standard": "GDPR (EU) 2016/679",
        "tone": "amber",
        "domain": "Risk / DPIA",
        "num": "Art. 35",
        "name": "DPIA screening",
        "purpose": "Determine whether a Data Protection Impact Assessment is required."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Govern · Oversight",
        "num": "GV.OC-05",
        "name": "Legal & regulatory requirements understood",
        "purpose": "Understand legal, regulatory and contractual obligations."
      },
      {
        "standard": "NIST CSF 2.0",
        "tone": "violet",
        "domain": "Identify · Asset Management",
        "num": "ID.AM-08",
        "name": "External-party systems inventoried",
        "purpose": "Inventory systems and services that involve external parties."
      }
    ]
  }
};
