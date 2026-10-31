Vulnerability and Patch Management Policy

BKB-POL-010 | Vulnerability and Patch Management Policy

BKB Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | BKB-POL-010 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Vulnerability Management Governance Analyst |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose

Ensures that technical vulnerabilities in Group systems are found, prioritised by how exploitable and exposed they are, fixed within set timescales, and verified as fixed, so that known weaknesses are not left open to attackers.

2\. Scope and applicability

All systems, applications, network devices, cloud services and endpoints of Group organisations that store, process or transmit Group information, on premises and in the cloud, and the third parties that operate them for the Group.

This policy applies to every BKB organisation. Organisation addenda (BKB-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Policy statements

• Every asset in scope is scanned for vulnerabilities with authenticated scans at least monthly, and internet-facing assets at least weekly.

• Findings are prioritised by exploitation status and exposure as well as by severity: a vulnerability listed in the CISA Known Exploited Vulnerabilities (KEV) catalogue, or a Critical one on an internet-facing asset, is fixed first.

• A vulnerability that cannot be fixed within its timescale is covered by an exception (Section 7.1) with a compensating control and an expiry date, or the asset is isolated.

• Vulnerabilities are remediated within the timescales of Section 4 for the organisation's criticality band, counted from the date the finding was first detected.

• Where the organisation ships software, a coordinated vulnerability disclosure channel is published.

4\. Criticality-band requirements

Minimum requirements scale with organisation criticality as defined in Organization\_Criticality\_Segregation (13 HIGH, 21 MEDIUM, 8 LOW organisations).

| Requirement | HIGH (GRC 501 orgs) | MEDIUM (GRC 301 orgs) | LOW (GRC 101 orgs) |
| :-: | :-: | :-: | :-: |
| Remediation — KEV-listed, or Critical, on an internet-facing asset | 3 days | 5 days | 7 days |
| Remediation — Critical, or KEV-listed, on an internal asset | 7 days | 10 days | 14 days |
| Remediation — High (CVSS 7.0–8.9) | 14 days | 21 days | 30 days |
| Remediation — Medium (CVSS 4.0–6.9) | 30 days | 60 days | 90 days |
| Penetration test | Annual (external and internal) | Annual (external) | Annual (external) / biennial (internal) |

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Vulnerability Management Governance Analyst | Maintains the policy, tracks remediation against the timescales, reports KPIs |
| Org CEO | Ensures the policy is implemented and resourced within the organisation |
| Org CISO / CRCO / DPO | Operationalises the policy; approves exceptions with the system owner; evaluates the KPIs |
| Regional Managing Director & Compliance Officer | Implements the policy at the regional office and records local deviations |
| System owners | Remediate the findings on their systems, or request an exception |
| Vulnerability team | Runs the scans, classifies the findings and verifies each fix by re-scan |
| Group GRC AI agents | Execute monitoring, testing and reporting activities from the GRC Task Libraries under human supervision |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Comply with the policy and report violations or weaknesses |

6\. Procedures

6.1 Procedure: Vulnerability triage

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Collect the scan and advisory results, and record each finding with the date it was first detected | Vulnerability team | Finding record (weekly) |
| 2 | Classify each finding into its policy class (Section 4) and set its due date: first detected + the class's timescale | Vulnerability team | Class and due date |
| 3 | Remediate the finding, or request an exception (Section 7.1) before the due date | System owner | Fix, or exception request (by the due date) |
| 4 | Verify the fix: the finding is closed only when a scan after the fix no longer finds it. A closure that no later scan confirms, or that a later scan still finds, is reopened as an open finding with its original due date | Vulnerability team | Verified closure (≤ 7 days after the fix) |
| 5 | Report remediation against the timescales and the KPIs of Section 10 | GRC team | Monthly SLA report |

7\. Guidelines

7.1 Guideline: When patching is not possible

Isolate the asset, disable the vulnerable feature, or put a virtual patch (for example a web application firewall rule) in front of it while the fix is prepared.

Record an exception in the exception register before the due date. An exception is valid only while all of these hold: it is approved by the system owner and the CISO; a compensating control is recorded; and it has not expired at the date it is relied on.

An exception lasts at most six months. When it expires, the finding is past its due date again unless a new exception is approved.

A compensating control reduces the risk; it never closes the finding. The finding stays open until it is fixed and verified (Section 6.1, step 4).

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date and approval as Section 7.1 sets out.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | A.8.8, A.8.9 |
| NIST CSF 2.0 | ID.RA, PR.PS |
| SOC 2 | CC7.1 |
| CIS Controls v8 | 7 |

10\. Key performance indicators

Remediation SLA compliance is measured for each policy class at the measurement date: the findings within SLA ÷ all findings of the class × 100, to one decimal. A finding is within SLA when it was closed on or before its due date and verified by re-scan; when it is open (or reopened, Section 6.1 step 4) and its due date has not passed; or when it is past its due date under a valid exception (Section 7.1). Every other finding is a breach.

| KPI | Target |
| :-: | :-: |
| Remediation SLA compliance — classes 1–2 | 90% or more (red below 80%) |
| Remediation SLA compliance — classes 3–4 | 95% or more |
| Internet-facing assets scanned weekly | 100% |

11\. Document control

| Field | Value |
| :-: | :-: |
| Document ID | BKB-POL-010 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Vulnerability Management Governance Analyst |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

| Version | Date | Author | Change |
| :-: | :-: | :-: | :-: |
| 1.0 | 2026-10-01 | Policy & Governance Analyst (AI agent) — reviewed by Vulnerability Management Governance Analyst | Initial Group issue |
