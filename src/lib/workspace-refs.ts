// Scripted artefact documents surfaced by the bespoke verb workspaces. Each verb's working area
// shows labelled "Open" boxes (Scope Statement, Asset Register, SOC 2 System Description, …);
// clicking Open opens the matching doc here in the Reference-material panel. Keyed by verb id and
// merged with the per-activity ACTIVITY_CONTENT.references on the workspace page.
import type { TaskReference } from "./taskmeta";

export const WORKSPACE_REFS: Record<string, TaskReference[]> = {
  identify: [
    {
      id: "ws-soc2-sysdesc",
      title: "SOC 2 System Description (extract)",
      kind: "Source document",
      summary: "The system boundary the report names as in-scope.",
      body: `## §III.A — Core production systems (in scope)
- Production Kubernetes cluster (us-east-1)
- orders-db (Amazon RDS) — order + customer PII
- Snowflake analytics warehouse

## §III.B — Sub-service organisations (in scope)
- Stripe Connect (payment processing)
- PagerDuty (incident tooling)
- Datadog (observability)

## §III.D — Excluded from the report
- Marketing CMS (WordPress)
- Internal R&D sandbox

## How to read this
The in-scope perimeter is named directly in §III.A and §III.B. Anything in §III.D is out of scope unless you can justify otherwise.`,
    },
  ],
  record: [
    {
      id: "ws-asset-register",
      title: "Asset Register schema & vocabulary",
      kind: "Standard rules",
      summary: "Mandatory fields and the controlled CIA vocabulary.",
      body: `## Mandatory fields
- Asset · Type · Owner (role) · Confidentiality · Integrity · Availability

## Controlled vocabulary (no free text)
- CIA values: Low · Medium · High
- Classification: Public · Internal · Confidential

## Rules
- Owner must be a role title (e.g. "Head of Platform"), never a department or a person's name.
- A High or Confidential value requires a one-line rationale.`,
    },
  ],
  apply: [
    {
      id: "ws-classification-scheme",
      title: "Classification Scheme — Annex A 5.12",
      kind: "Classification scheme",
      summary: "The three-tier decision tree you must apply.",
      body: `## Decision tree
- Q1 — Does the asset hold personal data? → if yes, minimum Confidential.
- Q2 — Is it externally accessible / customer-facing only? → Public.
- Otherwise → Internal.

## Levels
- Public — harmless if seen by anyone (website copy).
- Internal — operational, low harm if leaked (runbooks).
- Confidential — material harm if disclosed (PII, credentials, source).

## Rule
Personal-data items must never be classified Public. Any override of the suggested outcome needs a written rationale.`,
    },
  ],
  crossref: [
    {
      id: "ws-cmdb-export",
      title: "IT Asset CMDB export (Source A)",
      kind: "Source document",
      summary: "The authoritative system inventory to reconcile against.",
      body: `## CMDB export — 2026-05-20
| Asset | Owner | Note |
| orders-db (RDS) | Data Platform | prod, us-east-1 |
| Production K8s | Platform | 16 nodes |
| Snowflake DW | Analytics | us-west-2 |
| Stripe Connect | Security Eng. | external |
| PagerDuty | Sec Ops | external |
| Marketing CMS | Marketing | wp-blue |`,
    },
    {
      id: "ws-vendor-register",
      title: "Vendor register (Source B)",
      kind: "Source document",
      summary: "Procurement's vendor list — compare owners and coverage.",
      body: `## Vendor register — 2026-05-22
| Asset | Owner (role) | Note |
| orders-db (RDS) | Data Platform Lead | PII |
| Production K8s | Head of Platform | prod cluster |
| Snowflake DW | — | — |
| Stripe Connect | Security Eng. Lead | PCI scope |
| Snowflake DW (dev) | Analytics | possible duplicate |
| Datadog | Sec Ops | extra item |`,
    },
  ],
  draft: [
    {
      id: "ws-policy-scaffold",
      title: "Information Classification Policy — scaffold",
      kind: "Template",
      summary: "Required section headings and the standards to cite.",
      body: `## Required sections
- 1 Purpose · 2 Scope · 3 Definitions · 4 Policy Statements · 5 Roles & Responsibilities · 6 Standards Referenced · 7 Review Cadence

## Standards to cite
- ISO/IEC 27001:2022 §5.12 — Classification of information
- ISO/IEC 27002:2022 §5.12, §5.13 — Labelling of information
- NIST SP 800-60 — Mapping information types

## Rule
Every required heading must be present and non-empty. Undefined acronyms (MFA, RBAC) must be expanded on first use.`,
    },
  ],
  calculate: [
    {
      id: "ws-risk-formula",
      title: "Residual-risk formula RR-2026.1",
      kind: "Standard extract",
      summary: "The read-only formula re-executed server-side.",
      body: `## Formula
Residual = Likelihood × Impact × (1 − ControlEff / 4)

## Scales (0–4)
- Likelihood: 0 None — 4 Almost certain
- Impact: 0 Negligible — 4 Catastrophic
- Control effectiveness: 0 None — 4 Optimised

## Rule
Cite the source for every input variable. Layer 1 re-computes the result; any drift > ±0 fails.`,
    },
  ],
  review: [
    {
      id: "ws-scope-statement",
      title: "ISMS Scope Statement v0.4",
      kind: "Work product",
      summary: "The near-final artefact under review.",
      body: `## In scope
- orders-db, Production K8s, Snowflake DW, Stripe Connect

## Excluded (with rationale)
- Marketing CMS — holds no in-scope data (see §2.3)
- R&D sandbox — synthetic data only (see §2.3)

## Notes
Snowflake holds joinable user identifiers (see §4.1) and is classified Confidential.`,
    },
  ],
  score: [
    {
      id: "ws-rubric",
      title: "Scoring rubric (5 dimensions)",
      kind: "Standard rules",
      summary: "Weights and anchor descriptions per dimension.",
      body: `## Dimensions & weights
| Dimension | Weight | 0 anchor | 4 anchor |
| Specificity | 25% | Vague, generic | Names assets, owners, dates |
| Standards Alignment | 25% | No citations | All claims cite a control |
| Reasoning Quality | 20% | Assertions only | Conclusions follow evidence |
| Risk Awareness | 15% | Misses obvious | Surfaces non-obvious risks |
| Communication Quality | 15% | Hard to follow | Crisp, audience-aware |

## Rule
The aggregate is the weighted total. Every justification must reference its anchor and be ≥ 15 chars.`,
    },
  ],
  present: [
    {
      id: "ws-deck",
      title: "ISMS Scope — presentation deck",
      kind: "Work product",
      summary: "The 8-slide deck presented for sign-off.",
      body: `## Slides
- 1 Title · 2 Why an ISMS now · 3 In-scope systems · 4 Exclusions & rationale
- 5 Regulatory drivers · 6 Top residual risks · 7 Timeline · 8 The ask

## Anticipated questions
Prepare answers on phasing, Snowflake joinability, and SOC 2 timeline impact before presenting.`,
    },
  ],
  signoff: [
    {
      id: "ws-scope-statement",
      title: "ISMS Scope Statement v0.4",
      kind: "Work product",
      summary: "The artefact awaiting formal sign-off.",
      body: `## In scope
- orders-db, Production K8s, Snowflake DW, Stripe Connect

## Excluded (with rationale)
- Marketing CMS — holds no in-scope data (see §2.3)
- R&D sandbox — synthetic data only (see §2.3)

## Open point raised in Q&A
Add a line on data-residency commitments and circulate to the DPO before publishing.`,
    },
  ],
  compile: [
    {
      id: "ws-source-index",
      title: "Source artefact index",
      kind: "Source document",
      summary: "The upstream artefacts assembled into the final report.",
      body: `## Available sources
| Code | Artefact | Date |
| A.iv | Asset Register v2 | 2026-05-22 |
| C.ii | Classification Outcomes | 2026-05-23 |
| C.i | Regulatory Driver Map | 2026-05-24 |
| N.i | Scope Statement v0.4 | 2026-05-24 |
| RR-1 | Residual Risk Calculation | 2026-05-25 |

## Rule
Every required section must link to ≥ 1 source. Submission is blocked while numeric conflicts > 0.`,
    },
  ],
  map: [
    {
      id: "ws-driver-map",
      title: "Regulatory drivers & assets",
      kind: "Source document",
      summary: "The drivers and assets to map for obligations.",
      body: `## Regulatory drivers
- EU GDPR · UK GDPR · PCI-DSS v4.0 · SOC 2 (existing) · ISO 27701

## Assets
- orders-db · K8s prod · Stripe Connect · Snowflake · Marketing CMS

## Rule
A blank cell means "no obligation" — that is valid. A populated link needs a one-line rationale (e.g. "processor agreement, Art. 28"). No orphan rows or columns.`,
    },
  ],
  validate: [
    {
      id: "ws-control-library",
      title: "Control library (citation source)",
      kind: "Standard extract",
      summary: "Controls available to cite against each finding.",
      body: `## ISO/IEC 27001:2022 Annex A
- A.8.15 — Logging
- A.5.34 — Privacy & protection of PII

## NIST SP 800-53
- SC-7 — Boundary protection

## GDPR
- Art. 28(2) — Sub-processor disclosure

## Rule
Each finding needs ≥ 1 citation. Unverified findings need a follow-up action. No finding may sit indeterminate.`,
    },
  ],
};
