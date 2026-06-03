// 8 GRC 101 credential badges — fixed defs (from mockup) + task mapping (from catalogue).
// Earned-state is derived on the frontend from /me/learnings task completion (no backend needed).

import type { IconName } from "@/components/ui/icon";

export interface BadgeDef { id: string; name: string; icon: IconName; tone: string; blurb: string; taskCodes: string[]; }

export const BADGES: BadgeDef[] = [
  {
    "id": "process-mapping",
    "name": "Process Mapping Specialist",
    "icon": "layers",
    "tone": "emerald",
    "blurb": "Catalogue and classify an organisation's information assets end to end.",
    "taskCodes": [
      "AA-001"
    ]
  },
  {
    "id": "control-framework",
    "name": "Control Framework Understanding",
    "icon": "grid",
    "tone": "violet",
    "blurb": "Map and assess security controls against ISO 27001, CIS v8 and SOC 2.",
    "taskCodes": [
      "AA-002",
      "CRM-002",
      "CRM-003",
      "IE-001",
      "BCRP-002"
    ]
  },
  {
    "id": "compliance-readiness",
    "name": "Compliance Readiness",
    "icon": "checkSquare",
    "tone": "amber",
    "blurb": "Demonstrate regulatory and privacy compliance fundamentals.",
    "taskCodes": [
      "AA-003",
      "CRM-001",
      "LRC-001"
    ]
  },
  {
    "id": "risk-assessment",
    "name": "Risk Assessment Specialist",
    "icon": "target",
    "tone": "rose",
    "blurb": "Identify, register and rate operational and third-party risk.",
    "taskCodes": [
      "GRM-001",
      "MM-002",
      "BCRP-001",
      "TPRM-001",
      "TPRM-002"
    ]
  },
  {
    "id": "documentation-excellence",
    "name": "Documentation Excellence",
    "icon": "edit",
    "tone": "indigo",
    "blurb": "Produce clear, standard-aligned GRC policies, procedures and guides.",
    "taskCodes": [
      "GRM-002",
      "DD-001",
      "DD-002",
      "DD-003",
      "IE-002",
      "QA-001",
      "KT-001"
    ]
  },
  {
    "id": "foundation-grc-discovery",
    "name": "Foundation GRC Discovery",
    "icon": "sparkle",
    "tone": "violet",
    "blurb": "Discover GRC maturity, metrics and stakeholder needs across a function.",
    "taskCodes": [
      "GRM-003",
      "MM-001",
      "CA-001",
      "CA-002",
      "CA-003",
      "KT-002"
    ]
  },
  {
    "id": "foundation-discovery",
    "name": "Foundation Discovery",
    "icon": "flag",
    "tone": "indigo",
    "blurb": "Plan and charter a GRC initiative from the ground up.",
    "taskCodes": [
      "SPA-001",
      "SPA-002",
      "PE-001"
    ]
  },
  {
    "id": "audit-prep",
    "name": "Audit Preparation Support",
    "icon": "clipboard",
    "tone": "emerald",
    "blurb": "Support control testing, audit evidence and incident drills.",
    "taskCodes": [
      "TV-001",
      "TV-002",
      "RR-001",
      "PE-002",
      "QA-002"
    ]
  }
];
