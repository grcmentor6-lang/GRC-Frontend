Enterprise Risk Management Policy

SITL-POL-002 | Enterprise Risk Management Policy

SITL Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | SITL-POL-002 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Group Chief Risk Officer |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose

Sets how risk is identified, assessed, treated, accepted and monitored across the Group, so that every risk has an owner and is kept within the appetite the Board has approved. The method itself (scales, matrix, appetite and response by rating) is the Enterprise Risk Management Framework, SITL-ERM-001.

2\. Scope and applicability

All risks to the Group's organisations, offices, information, services and people, including information security, privacy, compliance, third-party and resilience risks, and the risks of the mentorship programme.

This policy applies to every SITL organisation. Organisation addenda (SITL-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Policy statements

• Risks are assessed with the method of SITL-ERM-001: the likelihood and impact scales of its Sections 6.2 and 6.3 and the 5×5 matrix of its Section 6.4, in every office.

• Every risk has a named risk owner: the manager accountable for the asset or process the risk affects, with the authority to decide how it is treated.

• Risk acceptance criteria: a risk whose residual score is within the appetite of the organisation's criticality band (Section 4) may be retained and monitored; a risk above the appetite is treated. A Critical risk is never retained.

• Each risk above the appetite has one treatment option, an owner and a due date set by its residual rating (SITL-ERM-001 Section 7), recorded in the risk treatment plan.

• The risk owner approves the treatment plan for their risks and accepts the residual risk. A risk is retained only by the acceptance authority of the GRC Charter Section 6.1 for its residual rating, in writing, with an expiry date and a re-assessment date.

• Office risk registers are kept in the Group GRC platform. Every change to a register is recorded in its change log.

4\. Criticality-band requirements

Minimum requirements scale with organisation criticality as defined in Organization\_Criticality\_Segregation (13 HIGH, 21 MEDIUM, 8 LOW organisations).

| Requirement | HIGH (GRC 501 orgs) | MEDIUM (GRC 301 orgs) | LOW (GRC 101 orgs) |
| :-: | :-: | :-: | :-: |
| Risk appetite: maximum residual score (SITL-ERM-001 Section 4) | 8 | 10 | 11 |
| Office risk-assessment refresh | Quarterly | Semi-annual | Annual |
| Board-level risk reporting | Quarterly, named risks | Quarterly, aggregated | Semi-annual, aggregated |
| Risk quantification | FAIR for the top risks (SITL-ERM-001 Section 6.6) | FAIR for the top risks (SITL-ERM-001 Section 6.6) | Top-5 risks (qualitative acceptable) |

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Group Chief Risk Officer | Maintains the policy and SITL-ERM-001, challenges ratings, consolidates the Group risk profile, reports KPIs |
| Org CEO | Ensures the policy is implemented and resourced within the organisation; accepts risks within the delegation of the GRC Charter Section 6.1 |
| Org CRCO / CISO | Operationalise the policy in the organisation; the Org CRCO accepts risks within the delegation of the GRC Charter Section 6.1 |
| Risk owners | Decide and approve the treatment of their risks, accept residual risk within their authority, implement the treatment by its due date and report changes |
| Cyber Risk Manager (AI agent) | Runs the office risk assessments, maintains the registers and treatment plans, checks each acceptance against the delegation, computes KRIs and prepares reports |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Report risks, incidents and control weaknesses |

6\. Procedures

6.1 Procedure: Office risk assessment

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Establish the context: the office, its assets and processes, its obligations and its country profile | Cyber Risk Manager | Context notes |
| 2 | Identify risks from the scenario library, the asset register and a workshop with the office; write each as a risk statement (Section 7.1) | Cyber Risk Manager with the office | Risk statements |
| 3 | Rate likelihood and impact on the scales of SITL-ERM-001 Sections 6.2–6.4 (inherent), then the residual score with the existing controls that work | Cyber Risk Manager | Inherent and residual ratings |
| 4 | Evaluate each residual score against the appetite of the organisation's band (Section 4) | Cyber Risk Manager | Within or above appetite |
| 5 | Choose one treatment option per risk (rule L12): retain a risk within the appetite; for a risk above it, avoid, modify or share. Determine the controls a modified risk needs, from any source, and compare them with ISO/IEC 27001 Annex A | Risk owner, advised by the Cyber Risk Manager | Risk treatment plan |
| 6 | Set each treated risk's due date by its residual rating, counted in calendar days from the date of the plan: Critical 30, High 90, Medium 180 (SITL-ERM-001 Section 7). A retained risk has no due date | Cyber Risk Manager | Due dates in the plan |
| 7 | Approve the plan and accept the residual risk; raise an acceptance request for each retained risk (Section 6.2) | Risk owner | Approved plan |
| 8 | Record the ratings, owners, options and due dates in the office risk register, one change-log row per changed field | Cyber Risk Manager | Updated register (≤ 5 working days) |

6.2 Procedure: Risk acceptance

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Raise an acceptance request (form T-ACC) naming the risk, its residual rating and the reason it is retained rather than treated | Risk owner | Acceptance request |
| 2 | Check the residual rating against the acceptance authority of the GRC Charter Section 6.1 (rule R36). For a LOW-criticality organisation: Low, the risk owner; Medium, the Org CRCO; High, the Org CEO with the Group CISO; Critical, not acceptable (Board decision) | Cyber Risk Manager | Approver named |
| 3 | Set the expiry date, at most 12 months after the request, and the re-assessment date, at the review frequency SITL-ERM-001 Section 7 sets for the residual rating (Medium quarterly, Low annual), both counted from the date of the request | Cyber Risk Manager | Dates on the request |
| 4 | Approve or refuse the request. A refused request returns the risk to treatment | Acceptance authority | Signed decision |
| 5 | Record the acceptance in the register; re-assess the risk by its re-assessment date, and on expiry treat it or raise a new request | Cyber Risk Manager | Register entry |

7\. Guidelines

7.1 Guideline: Writing a good risk statement

Name a cause, an event and a consequence, and the asset they affect: "Because of <cause>, <event> may occur, leading to <consequence> for <asset>."

Use the facts of the case, not general fears: the cause is something true today.

One event per statement. Two events are two risks.

Write the consequence in business terms the risk owner can weigh: client data exposed, service stopped, fine, contract lost.

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | Clauses 6.1.2, 6.1.3, 8.2, 8.3 |
| ISO/IEC 27005:2022 | Risk assessment and treatment |
| ISO 31000:2018 | Principles and process |
| NIST CSF 2.0 | GV.RM, ID.RA |

10\. Key performance indicators

| KPI | Target |
| :-: | :-: |
| Risks above appetite without a treatment plan | 0 |
| Treatment actions completed by their due date | ≥ 90% |
| Retained risks with an approved, unexpired acceptance | 100% |

11\. Document control

| Field | Value |
| :-: | :-: |
| Document ID | SITL-POL-002 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Group Chief Risk Officer |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |
| Workforce communication and attestation | No record attached |

| Version | Date | Author | Change |
| :-: | :-: | :-: | :-: |
| 1.0 | 2026-10-01 | Policy & Governance Analyst (AI agent) — reviewed by Group Chief Risk Officer | Initial Group issue |
