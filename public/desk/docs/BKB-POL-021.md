Cloud Security Policy

BKB-POL-021 | Cloud Security Policy

BKB Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | BKB-POL-021 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Security Architecture & Standards Manager |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose

Ensures the secure acquisition, configuration, use and exit of cloud services (IaaS, PaaS, SaaS).

2\. Scope and applicability

All cloud services used or provided by Group organisations, including cloud services offered to customers.

This policy applies to every BKB organisation. Organisation addenda (BKB-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Policy statements

Cloud services require a security and privacy assessment before use; a shared-responsibility matrix is documented per service.

Cloud tenants use Group landing-zone baselines (identity federation, logging, guardrails, encryption with managed keys).

Cloud Security Posture Management (CSPM) monitors misconfigurations continuously.

Data residency requirements (e.g., health data localisation in UAE, CII data in China, Saudi government data) are enforced by region selection and policy.

Exit plans and data portability are documented for Critical cloud services.

Cloud providers offering services to customers shall align to ISO/IEC 27017/27018 and, where required, BSI C5, CSA STAR or SecNumCloud.

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Security Architecture & Standards Manager | Maintains the policy, monitors compliance, approves procedures and guidelines, reports KPIs |
| Org CEO | Ensures the policy is implemented and resourced within the organisation |
| Org CISO / CRCO / DPO | Operationalises the policy, integrates it into the ISMS/PIMS and org addendum |
| Regional Managing Director & Compliance Officer | Implements the policy at the regional office and records local deviations |
| Department / asset owners | Operate first-line controls and retain evidence |
| Group GRC AI agents | Execute monitoring, testing and reporting activities from the GRC Task Libraries under human supervision |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Comply with the policy and report violations or weaknesses |

6\. Procedures

6.1 Procedure: New cloud service approval

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Submit request with data classification and business case | Business owner | Request — at least 15 working days before planned use |
| 2 | Vendor assessment (see BKB-POL-013) | Vendor / Third-Party Risk Analyst | Assessment — within 10 working days of the request |
| 3 | Architecture review and shared-responsibility matrix | Security Architect | Approved design — within 5 working days of the assessment |
| 4 | Onboard to SSO, logging and CSPM | Cloud operations | Onboarding evidence — before first use |
| 5 | Record the service, its assessment and its shared-responsibility matrix in the cloud service register | Cloud operations | Register entry — within 2 working days of the approved design |
| 6 | Tell the business owner the decision and the conditions of use | Security Architect | Decision notice — within 3 working days of the approved design |
| 7 | Escalate a request that cannot meet this policy to the escalation contact for an exception (Section 8) | Security Architect | Exception request — within 1 working day of the finding |

7\. Guidelines

7.1 Guideline: Top cloud misconfigurations to avoid

Public storage buckets

Over-privileged IAM roles

Disabled logging

Unrestricted security groups (0.0.0.0/0 on admin ports)

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1.

The escalation contact for the procedures of this policy is the policy owner, the Security Architecture & Standards Manager. An escalated request becomes an exception request under BKB-POL-000 Section 6.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | A.5.23 |
| ISO/IEC 27017 | CLD.6.3.1–CLD.13.1.4 |
| CSA CCM v4 | All domains |
| BSI C5 | All areas |

10\. Key performance indicators

| KPI | Target |
| :-: | :-: |
| Critical CSPM findings open \> 7 days | 0 |
| Cloud services with shared-responsibility matrix | 100% |
