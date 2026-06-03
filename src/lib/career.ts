// Canonical career content per program — fixed product reference data (mirrors the mockup).
// Per-user dynamics (progress %, which skills acquired, rubric scores) are overlaid at runtime from /me/progress.

export interface CareerLevel { rung: number; label: string; sub: string; desc: string; }
export interface CareerSkill { label: string; note: string; verb: string | null; }
export interface CareerFramework { label: string; tone: string; sub: string; }
export interface CareerExpertise { icon: string; title: string; desc: string; }
export interface CareerProgram {
  id: string; code: string; title: string; status: "active" | "locked"; tagline: string;
  level: CareerLevel; skillsMode: "acquired" | "target";
  skills: CareerSkill[]; frameworks: CareerFramework[]; expertise: CareerExpertise[];
  roles: string[]; competencyLabels: string[];
}
export interface CareerLadderRung { label: string; sub: string; }

const data: { ladder: CareerLadderRung[]; programs: CareerProgram[] } = {
  "ladder": [
    {
      "label": "Analyst",
      "sub": "Foundation"
    },
    {
      "label": "Senior Analyst",
      "sub": "Practitioner"
    },
    {
      "label": "Manager",
      "sub": "Program owner"
    },
    {
      "label": "Senior Manager",
      "sub": "Function lead"
    },
    {
      "label": "Director / Exec",
      "sub": "Strategy & board"
    }
  ],
  "programs": [
    {
      "id": "grc101",
      "code": "GRC 101",
      "title": "Foundations of Governance, Risk & Compliance",
      "status": "active",
      "tagline": "Execute structured, mentor-graded assessment work and build the practitioner fundamentals of a GRC career.",
      "level": {
        "rung": 0,
        "label": "Analyst",
        "sub": "Individual contributor",
        "desc": "Entry-level GRC contributor executing structured assessment tasks under mentor review."
      },
      "skillsMode": "acquired",
      "skills": [
        {
          "label": "Stakeholder requesting",
          "note": "Specific, deadline-bound information requests",
          "verb": "request"
        },
        {
          "label": "Structured interviewing",
          "note": "Process-owner walkthroughs to scope assets",
          "verb": "conduct"
        },
        {
          "label": "Asset registration",
          "note": "Populating an authoritative asset register",
          "verb": "record"
        },
        {
          "label": "Information classification",
          "note": "Public / Internal / Confidential schemes",
          "verb": "apply"
        },
        {
          "label": "Cross-referencing",
          "note": "Reconciling registers against network diagrams",
          "verb": "crossref"
        },
        {
          "label": "Findings presentation",
          "note": "Communicating results to senior role-owners",
          "verb": "present"
        }
      ],
      "frameworks": [
        {
          "label": "ISO/IEC 27001",
          "tone": "indigo",
          "sub": "Information security management"
        },
        {
          "label": "NIST CSF",
          "tone": "violet",
          "sub": "Cybersecurity framework"
        },
        {
          "label": "CIS Controls v8",
          "tone": "emerald",
          "sub": "Safeguard gap analysis"
        },
        {
          "label": "GDPR",
          "tone": "amber",
          "sub": "Privacy & data protection"
        }
      ],
      "expertise": [
        {
          "icon": "cube",
          "title": "Information Asset Management",
          "desc": "Inventory, ownership and CIA classification of organisational assets."
        },
        {
          "icon": "layers",
          "title": "Controls Gap Analysis",
          "desc": "Assessing implementation maturity against CIS v8 IG1 safeguards."
        },
        {
          "icon": "shield",
          "title": "Privacy & Data Protection",
          "desc": "RoPA, lawful basis and DPIA screening under GDPR Article 30."
        },
        {
          "icon": "chat",
          "title": "Stakeholder Engagement",
          "desc": "Structured interviews and information requests with role-owners."
        }
      ],
      "roles": [
        "GRC Analyst",
        "Compliance Analyst",
        "Information Security Analyst",
        "Risk & Controls Associate"
      ],
      "competencyLabels": [
        "Specificity",
        "Communication Quality",
        "Reasoning Quality",
        "Standards Alignment",
        "Risk Awareness"
      ]
    },
    {
      "id": "grc301",
      "code": "GRC 301",
      "title": "Advanced Risk Management & Assurance",
      "status": "locked",
      "tagline": "Own risk programs and assurance engagements — quantify exposure, test controls and direct third-party risk.",
      "level": {
        "rung": 2,
        "label": "Manager",
        "sub": "Program owner",
        "desc": "Owns risk programs and assurance engagements; coordinates stakeholders and makes risk-treatment calls."
      },
      "skillsMode": "target",
      "skills": [
        {
          "label": "Quantitative risk assessment",
          "note": "Likelihood × impact scoring and heat-maps",
          "verb": null
        },
        {
          "label": "Third-party / vendor risk",
          "note": "Due diligence and ongoing monitoring",
          "verb": null
        },
        {
          "label": "Control testing & assurance",
          "note": "Design and operating-effectiveness testing",
          "verb": null
        },
        {
          "label": "Risk treatment & prioritisation",
          "note": "Ranking and treatment decisions by exposure",
          "verb": null
        },
        {
          "label": "Audit evidence & sampling",
          "note": "Evidence collection and defensible sampling",
          "verb": null
        }
      ],
      "frameworks": [
        {
          "label": "ISO 31000",
          "tone": "indigo",
          "sub": "Risk management"
        },
        {
          "label": "NIST RMF",
          "tone": "violet",
          "sub": "Risk management framework"
        },
        {
          "label": "HIPAA",
          "tone": "emerald",
          "sub": "Healthcare security"
        },
        {
          "label": "SOC 2",
          "tone": "amber",
          "sub": "Trust services criteria"
        }
      ],
      "expertise": [
        {
          "icon": "target",
          "title": "Enterprise Risk Assessment",
          "desc": "Building risk registers and heat-maps with ISO 31000."
        },
        {
          "icon": "handshake",
          "title": "Third-Party Risk",
          "desc": "Vendor due diligence, tiering and continuous monitoring."
        },
        {
          "icon": "checkSquare",
          "title": "Assurance & Audit",
          "desc": "Control testing, evidence handling and audit reporting."
        }
      ],
      "roles": [
        "Risk Manager",
        "Internal Auditor",
        "Assurance Lead",
        "TPRM Manager"
      ],
      "competencyLabels": [
        "Specificity",
        "Communication Quality",
        "Reasoning Quality",
        "Standards Alignment",
        "Risk Awareness"
      ]
    },
    {
      "id": "grc501",
      "code": "GRC 501",
      "title": "Enterprise GRC Strategy & Leadership",
      "status": "locked",
      "tagline": "Set GRC strategy at enterprise scale — design the operating model, lead programs and report to the board.",
      "level": {
        "rung": 4,
        "label": "Director / Executive",
        "sub": "Strategy & board",
        "desc": "Sets GRC strategy, designs the operating model and reports risk posture to the board."
      },
      "skillsMode": "target",
      "skills": [
        {
          "label": "GRC operating-model design",
          "note": "Target operating model and governance structure",
          "verb": null
        },
        {
          "label": "Board & executive reporting",
          "note": "Dashboards and reporting cadence for leadership",
          "verb": null
        },
        {
          "label": "Integrated risk strategy",
          "note": "Converging risk, compliance and ESG",
          "verb": null
        },
        {
          "label": "Program & policy leadership",
          "note": "Standing up and leading GRC functions",
          "verb": null
        },
        {
          "label": "Regulatory & ESG strategy",
          "note": "Anticipating regulatory and ESG obligations",
          "verb": null
        }
      ],
      "frameworks": [
        {
          "label": "COSO",
          "tone": "indigo",
          "sub": "Internal control & ERM"
        },
        {
          "label": "ISO 37301",
          "tone": "violet",
          "sub": "Compliance management"
        },
        {
          "label": "ISO 27701",
          "tone": "emerald",
          "sub": "Privacy information management"
        },
        {
          "label": "ESG Reporting",
          "tone": "amber",
          "sub": "Sustainability & disclosure"
        }
      ],
      "expertise": [
        {
          "icon": "grid",
          "title": "GRC Operating Model",
          "desc": "Designing the target operating model and governance structure."
        },
        {
          "icon": "chart",
          "title": "Board Governance",
          "desc": "Executive dashboards and board-level reporting cadence."
        },
        {
          "icon": "layers",
          "title": "Integrated Strategy",
          "desc": "Converging risk, compliance and ESG at enterprise scale."
        }
      ],
      "roles": [
        "GRC Director",
        "Head of Risk",
        "Chief Compliance Officer",
        "CISO (track)"
      ],
      "competencyLabels": [
        "Specificity",
        "Communication Quality",
        "Reasoning Quality",
        "Standards Alignment",
        "Risk Awareness"
      ]
    }
  ]
};

export const CAREER_LADDER = data.ladder;
export const CAREER_PROGRAMS = data.programs;
