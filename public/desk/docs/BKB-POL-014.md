Incident Management and Breach Notification Policy

BKB-POL-014 | Incident Management and Breach Notification Policy

BKB Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | BKB-POL-014 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Incident Response & Crisis Manager |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose

Ensures security and privacy incidents are detected, reported, contained, eradicated and recovered from quickly, with statutory notifications made on time.

2\. Scope and applicability

All security events, incidents and personal-data breaches affecting Group organisations, their customers or third parties acting for them.

This policy applies to every BKB organisation. Organisation addenda (BKB-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Policy statements

All staff must report suspected incidents immediately via the service desk or security hotline.

Incidents are classified by severity (SEV1 Critical – SEV4 Low) using impact on safety, service, data, finance and reputation.

A notification assessment is performed for every incident involving personal data or essential services; the shortest applicable statutory clock governs (see Notification Matrix in BKB-ERM-001).

SEV1/SEV2 incidents activate the Crisis Management Team and notify the Group CISO within 1 hour.

Evidence is collected and preserved forensically; chain of custody maintained.

Post-incident reviews are held for SEV1–SEV2 within 10 working days; lessons feed risk, controls and training.

Customers are notified in line with contractual commitments (typically ≤ 24–72h).

4\. Criticality-band requirements

Minimum requirements scale with organisation criticality as defined in Organization\_Criticality\_Segregation (13 HIGH, 21 MEDIUM, 8 LOW organisations).

| Requirement | HIGH (GRC 501 orgs) | MEDIUM (GRC 301 orgs) | LOW (GRC 101 orgs) |
| :-: | :-: | :-: | :-: |
| Playbook tabletop exercises | Quarterly | Semi-annual | Annual |
| Retainer with IR firm | Mandatory | Mandatory | Recommended |

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Incident Response & Crisis Manager | Maintains the policy, monitors compliance, approves procedures and guidelines, reports KPIs |
| Org CEO | Ensures the policy is implemented and resourced within the organisation |
| Org CISO / CRCO / DPO | Operationalises the policy, integrates it into the ISMS/PIMS and org addendum |
| Regional Managing Director & Compliance Officer | Implements the policy at the regional office and records local deviations |
| Department / asset owners | Operate first-line controls and retain evidence |
| Group GRC AI agents | Execute monitoring, testing and reporting activities from the GRC Task Libraries under human supervision |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Comply with the policy and report violations or weaknesses |

6\. Procedures

6.1 Procedure: Incident response lifecycle

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Detect & report — log in incident tool; assign severity | SOC / service desk | Incident ticket (≤ 15 min) |
| 2 | Triage — confirm, scope, start notification assessment clock | Incident Response & Crisis Manager | Triage record (≤ 1 h) |
| 3 | Contain — isolate, block, reset credentials | IR team | Containment actions |
| 4 | Notify — regulators/customers/data subjects per matrix; legal sign-off | DPO + General Counsel | Notifications |
| 5 | Eradicate & recover — remove cause, restore from clean backups, monitor | IR + IT | Recovery record |
| 6 | Post-incident review — root cause, lessons, actions | Incident Response & Crisis Manager | PIR report |

6.2 Procedure: Personal-data breach notification assessment

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Identify data categories, volume, data subjects' countries | Privacy Compliance Analyst | Breach facts |
| 2 | Assess risk to rights and freedoms | DPO | Risk rating |
| 3 | Determine all applicable laws (by data-subject location and office) and deadlines | DPO | Notification plan |
| 4 | Draft and submit notifications; record even if not notifiable | DPO | Breach register entry |

7\. Guidelines

7.1 Guideline: First-hour checklist

Do not power off affected machines — isolate from network.

Preserve logs; note times in UTC.

Start a single incident timeline.

Use out-of-band communication if email may be compromised.

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter §6.1.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | A.5.24–A.5.28, A.6.8 |
| ISO/IEC 27035 | Parts 1–3 |
| NIST CSF 2.0 | RS, RC |
| GDPR | Art.33–34 |
| NIS2 | Art.23 |
| SOC 2 | CC7.3–CC7.5 |

10\. Key performance indicators

| KPI | Target |
| :-: | :-: |
| Statutory notifications on time | 100% |
| Mean time to contain SEV1 | \< 4 h |
| PIRs completed within 10 days | 100% |

11\. Document control

| Version | Date | Author | Change |
| :-: | :-: | :-: | :-: |
| 1.0 | 2026-10-01 | Policy & Governance Analyst (AI agent) — reviewed by Incident Response & Crisis Manager | Initial Group issue |
