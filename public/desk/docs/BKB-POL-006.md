Access Control and Identity Management Policy

BKB-POL-006 | Access Control and Identity Management Policy

BKB Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | BKB-POL-006 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Group CISO |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose

Ensures that access to information, systems and premises is granted, used, reviewed and removed so that only authorised identities hold only the access their role needs.

2\. Scope and applicability

All identities (workforce, contractors, third parties, service accounts and AI agents) and all systems, applications and data of Group organisations, on premises and in the cloud.

This policy applies to every BKB organisation. Organisation addenda (BKB-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Policy statements

• Access is granted on the principle of least privilege and need-to-know, and only with the approval of the asset owner.

• Shared and generic accounts are prohibited, except break-glass accounts that are registered, sealed and monitored.

• Multi-factor authentication is required for remote, privileged and Tier 3/4 access; single sign-on is used wherever an application supports it.

• Privileged access is held in a privileged-access management (PAM) tool, granted just in time, and recorded where Section 4 requires.

• Access of leavers is removed within 4 hours of termination, and immediately for involuntary leavers.

• User and privileged access is reviewed at the frequencies in Section 4; access the review does not confirm is removed.

• AI agents have dedicated identities with permissions scoped to their tasks; an AI agent never uses a person's account.

4\. Criticality-band requirements

Minimum requirements scale with organisation criticality as defined in Organization\_Criticality\_Segregation (13 HIGH, 21 MEDIUM, 8 LOW organisations).

| Requirement | HIGH (GRC 501 orgs) | MEDIUM (GRC 301 orgs) | LOW (GRC 101 orgs) |
| :-: | :-: | :-: | :-: |
| User access review — Mission/Business Critical assets | Quarterly | Quarterly | Semi-annual |
| User access review — other assets | Semi-annual | Annual | Annual |
| Privileged access review | Monthly | Quarterly | Quarterly |
| Session recording for privileged access | All privileged sessions | Mission and Business Critical systems | Mission Critical systems |

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Group CISO | Maintains the policy, monitors compliance, approves procedures and guidelines, reports KPIs |
| Org CEO | Ensures the policy is implemented and resourced within the organisation |
| Org CISO / CRCO / DPO | Operationalises the policy, integrates it into the ISMS/PIMS and org addendum |
| Regional Managing Director & Compliance Officer | Implements the policy at the regional office and records local deviations |
| Department / asset owners | Operate first-line controls and retain evidence |
| Group GRC AI agents | Execute monitoring, testing and reporting activities from the GRC Task Libraries under human supervision |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Comply with the policy and report violations or weaknesses |

6\. Procedures

6.1 Procedure: Access request and approval

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Request access in the IAM portal, naming the system, the role and the business reason | Requester | Access request |
| 2 | Approve the request against the role design (Section 7.1) | Line manager, then asset owner | Approval record |
| 3 | Provision the approved role only | IAM team | Account (≤ 1 working day) |
| 4 | Close the ticket with the approval and provisioning evidence | IAM team | Closed ticket |

6.2 Procedure: User access review

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Extract accounts and roles for the system under review | IAM team | Access extract |
| 2 | Confirm or reject each account; the reviewer is never the account holder | Asset owner | Review decisions |
| 3 | Remove every rejected account or role | IAM team | Removal record (≤ 5 working days) |
| 4 | Retain the signed review and removal evidence | Asset owner | Review record |

6.3 Procedure: Leaver de-provisioning

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Record the leaver with termination time (UTC) and whether it is voluntary | HR | Leaver record |
| 2 | Disable every account of the leaver | IAM team | Disable log (≤ 4 h; immediately if involuntary) |
| 3 | Reconcile HR leavers against active accounts every week | IAM team | Reconciliation report |
| 4 | Raise an incident for any account used after termination | IAM team | Incident ticket |

7\. Guidelines

7.1 Guideline: Designing roles

Build roles from job functions, not from individuals.

Document toxic combinations (segregation-of-duties conflicts) and block them in the role design.

Prefer time-bound access for third parties and contractors.

Review role definitions when a system or a process changes.

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | A.5.15–A.5.18, A.8.2, A.8.3, A.8.5 |
| NIST CSF 2.0 | PR.AA |
| SOC 2 | CC6.1–CC6.3 |
| CIS Controls v8 | 5, 6 |

10\. Key performance indicators

| KPI | Target |
| :-: | :-: |
| Leavers disabled within the SLA | 100% |
| Access reviews completed on time | 100% |
| Privileged accounts held in PAM | 100% |

11\. Document control

| Field | Value |
| :-: | :-: |
| Document ID | BKB-POL-006 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Group CISO |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |
| Workforce communication and attestation | No record attached |

| Version | Date | Author | Change |
| :-: | :-: | :-: | :-: |
| 1.0 | 2026-10-01 | Policy & Governance Analyst (AI agent) — reviewed by Group CISO | Initial Group issue |
