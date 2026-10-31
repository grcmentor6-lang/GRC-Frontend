Supplier and Third-Party Risk Management Policy

BKB-POL-013 | Supplier and Third-Party Risk Management Policy

BKB Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | BKB-POL-013 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Vendor / Third-Party Risk Analyst |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose

Ensures that every supplier that handles Group information, or delivers a service the Group depends on, is assessed before it is engaged, contracted with the right security and privacy clauses, and reassessed while it is used.

2\. Scope and applicability

All suppliers, service providers, cloud services, contractors and their sub-processors used by Group organisations.

This policy applies to every BKB organisation. Organisation addenda (BKB-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Policy statements

Every new supplier is assessed before a contract is signed and before any Group information is shared with it (procedure Section 6.1).

Each supplier is tiered Critical, High, Medium or Low with rule R35, from the intake form its business owner completes. The tier sets the security questionnaire and the contract clauses (rule R27) and how often the supplier is reassessed (Section 4).

R35's terms are read as the table below defines them. Check the tiers from Critical down and stop at the first that matches.

| Term in rule R35 | What it means in this policy | Read it on the intake form |
| :-: | :-: | :-: |
| Tier 4 data | Data that BKB-STD-001 classifies Tier 4 — Restricted: special-category personal data, PHI, cardholder data, cryptographic keys and credentials, and the other Tier 4 examples of BKB-STD-001 Section 3. | Data the vendor receives |
| Tier 3 personal or confidential data | Personal data or client information that is not Tier 4. BKB-STD-001 never classifies personal data below Tier 3. Pseudonymised data (a random ID stands in for the person, and the key that links the ID to the person stays with the BKB organisation) is still personal data: Tier 3. | Data the vendor receives; Identifiers sent |
| Children's data at scale | Data that identifies a child (name, contact details, age, school, image, voice or video, or biometric data) for 10,000 children or more. Data the vendor holds only under pseudonymous IDs that it cannot link to a child counts as Tier 3 personal data, not as children's data at scale. | Data the vendor receives; Identifiers sent |
| At volume | Data about 10,000 people or more, or a continuous feed of their data. | Volume |
| Customer-facing service | Customers (schools, learners, parents, client organisations) use the service, or see what it produces. | Users |
| Regulatory-critical service | The organisation needs the service to meet a legal obligation, for example verifiable parental consent or regulatory reporting. | Business criticality |
| Hard to replace | The intake form's substitutability is Hard: replacing the supplier would take six months or more. Easy and Moderate are not hard to replace. | Substitutability |
| Revenue-critical service | The service bills customers, takes payments or sells: the intake form's business criticality says Revenue. | Business criticality |

A supplier that processes personal data signs a data processing agreement (GDPR Art.28 or equivalent) before processing starts.

Personal data leaves the country of the office that holds it only under the transfer mechanism that the organisation addendum's Section 2 names for that office.

Cloud services are also assessed under BKB-POL-021: the service model and the shared-responsibility split are recorded with the questionnaire.

4\. Criticality-band requirements

Minimum requirements scale with organisation criticality as defined in Organization\_Criticality\_Segregation (13 HIGH, 21 MEDIUM, 8 LOW organisations).

| Requirement | HIGH (GRC 501 orgs) | MEDIUM (GRC 301 orgs) | LOW (GRC 101 orgs) |
| :-: | :-: | :-: | :-: |
| Critical supplier reassessment | Every 6 months | Annual | Annual |
| High supplier reassessment | Annual | Annual | Every 2 years |
| On-site / remote audit of Critical suppliers | Annual | Every 2 years | Risk-based |

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Vendor / Third-Party Risk Analyst | Maintains the policy, tiers suppliers, runs the assessments, reports KPIs |
| Business owner | Completes the intake form for the supplier they want to engage, and owns the relationship |
| Org CISO / CRCO / DPO | Approves Critical and High suppliers; the DPO approves processors of personal data and transfer mechanisms |
| Procurement / Legal | Puts the clause checklist into the contract |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Engage no supplier outside this policy, and report a supplier incident at once |

6\. Procedures

6.1 Procedure: Supplier onboarding

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Complete the intake form: the service, the data the supplier will receive, its identifiers and volume, its users, where it is hosted, how it is delivered, and how hard it would be to replace | Business owner | Intake form — before any data is shared |
| 2 | Tier the supplier with rule R35 and record it in the tiering record | Vendor / Third-Party Risk Analyst | Tiering record — within 5 working days of the intake form |
| 3 | Send the security questionnaire for the tier (rule R27) and review the answers | Vendor / Third-Party Risk Analyst | Questionnaire review — within 15 working days of sending |
| 4 | Draft the contract from the clause checklist for the tier (rule R27), with a transfer mechanism where the data leaves the country | Procurement / Legal | Contract — before signature |
| 5 | Approve, approve with conditions, or reject | Org CISO (Critical and High); Vendor / Third-Party Risk Analyst (Medium and Low) | Decision — recorded in the vendor register |

6.2 Procedure: Supplier offboarding

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Revoke the supplier's access, accounts and API keys | IAM team | Access removed — on the contract's end date |
| 2 | Obtain the return of the Group's data, then certified deletion | Business owner | Deletion certificate — within 30 days of the end date |
| 3 | Close the supplier in the vendor register | Vendor / Third-Party Risk Analyst | Register entry closed — within 5 working days of the certificate |

7\. Guidelines

7.1 Guideline: Reading a SOC 2 report

Check the report type and its period, the auditor's opinion, the services in scope, the subservice organisations and how they are treated, the exceptions found, and the complementary user entity controls (CUECs) that the Group must run itself. Rule R28 (Learn › Rule tables) gives the checks.

Each check S1–S9 (Ref-SOC checks) is read as the table below says, on the date of the review. A check that fails is recorded Fail in the SOC 2 review worksheet; rule R28 then sets the decision.

| Check | How this policy reads it | Read it on the report's line |
| :-: | :-: | :-: |
| S1 | A Type I report tests only how the controls were designed, on one date. A Type II report also tests that they operated over a period. A Type I report fails. | Type |
| S2 | A Type II period runs from its first date to its last. A period shorter than 6 months fails. | Period |
| S3 | Count from the last date of the period to the date of the review. More than 3 months fails: a bridge (gap) letter from the vendor must cover the months since. | Period; the review date (Vendors › SOC Report Review) |
| S4 | The auditor's opinion is Unmodified (clean) or Qualified (some controls did not meet the criteria). A qualified opinion fails. | Opinion |
| S5 | A subservice organisation, such as the hosting provider, is either included in the report (inclusive method) or carved out (carve-out method), and then its controls are not tested in it. Carve-out fails. | Subservice |
| S6 | An exception is a control the auditor found not working. An exception in CC6 (logical access) or CC7 (system operations) whose management response does not show it fixed fails. No exception passes. | Exceptions |
| S7 | Where the vendor receives personal data (Section 3.1: pseudonymised data included), Confidentiality or Privacy must be among the criteria tested. If neither is, S7 fails. | TSC; Data the vendor receives (Vendors › Vendor Intake) |
| S8 | A CUEC that needs the Group to set up a control for this service (for example MFA for its administrators, user access reviews, data-retention settings) fails S8, and each gets an internal owner who implements it. A CUEC the report marks Standard, one every customer of a cloud service already runs through its own processes, does not fail S8; it still gets an internal owner. | CUECs |
| S9 | The service being purchased is the Service line of the vendor's intake form. A system description (Scope) that leaves it out fails. | Scope; Service (Vendors › Vendor Intake) |

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | A.5.19–A.5.22 |
| SOC 2 | CC9.2 |
| GDPR | Art.28; Chapter V |

10\. Key performance indicators

| KPI | Target |
| :-: | :-: |
| Suppliers tiered before contract signature | 100% |
| Critical and High suppliers reassessed on time | 100% |

11\. Document control

| Version | Date | Change | Approved by |
| :-: | :-: | :-: | :-: |
| 1.0 | 2026-10-01 | First issue | Group GRC Steering Committee |
