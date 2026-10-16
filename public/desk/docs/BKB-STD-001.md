Information Classification Standard

BKB-STD-001 | Information Classification Standard

Group-wide classification scheme, sector label mapping, handling rules and asset classification register for all 42 organisations

|  |  |
| :-: | :-: |
| Document ID | BKB-STD-001 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | Group CISO |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Internal |

1\. Purpose and scope

This standard implements the Information Classification and Handling Policy (BKB-POL-004). It defines a single four-tier Group classification model, maps it to the sector-specific labels used by each organisation in the Information Asset Register, and specifies the minimum handling controls for each tier across the information lifecycle. It applies to all information, in all formats, created or received by the 42 BKB organisations across 168 offices.

2\. Principles

One model, many labels — every organisation keeps the labels its sector and regulators recognise, but each label maps to exactly one Group tier so that information can be exchanged safely between organisations and with the Group.

Owner classifies — the asset owner recorded in the Information Asset Register is accountable for classification.

Classify by impact — tier reflects the harm from unauthorised disclosure; integrity and availability are rated separately (CIA rating).

Floors for regulated data — personal data, special-category data, cardholder data, PHI, CEII/OT data, subscriber/lawful-interception data and trade secrets are never below Tier 3.

National security schemes prevail — government and defence organisations apply national protective markings and accredited systems; the Group model is only an interchange reference.

Least classification necessary — over-classification wastes resources and weakens protection of truly sensitive data.

3\. Group classification tiers

| Tier | Definition | Impact of unauthorised disclosure | Examples |
| :-: | :-: | :-: | :-: |
| Tier 1 — Public | Approved for public release | None | Published reports, marketing material, public web content, open research data |
| Tier 2 — Internal | For workforce and authorised partners; default tier | Minor: limited embarrassment or inconvenience | Intranet content, internal procedures, org charts, training material |
| Tier 3 — Confidential | Restricted to specific groups with business need | Significant: financial loss, regulatory breach, contractual breach, reputational damage | Customer data, contracts, financial reports, source code, HR records, strategy papers |
| Tier 4 — Restricted | Strict need-to-know; named individuals | Severe: major regulatory sanctions, harm to individuals, safety impact, systemic or national impact | Special-category personal data, PHI, cardholder data, CEII/OT designs, M\&A files, cryptographic keys, lawful-interception data, privileged legal matters |

3.1 Impact criteria used to select the tier

| Criterion | Tier 2 | Tier 3 | Tier 4 |
| :-: | :-: | :-: | :-: |
| Financial loss | \< USD 50k | USD 50k – 5m | \> USD 5m |
| Individuals affected (personal data) | — | \< 10,000 or non-sensitive | ≥ 10,000 or any special-category / children / financial data |
| Regulatory | None | Reportable breach / warning | Fines, licence action, prior consultation |
| Safety / critical services | None | Degraded service | Risk to life, environment or essential services |
| Reputation | Internal only | Local media | International media / loss of major clients |

4\. Sector label mapping

Source: Information\_Asset\_Register\_by\_Department.xlsx (classification scheme tailored to industry criticality). The Group tier is the position of the label in the organisation's four-level scheme.

| Industry | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Orgs |
| :-: | :-: | :-: | :-: | :-: | :-: |
| Technology & IT Services | Public | Internal | Confidential | Restricted | 5 |
| Banking & Financial Services | Public | Internal | Confidential | Restricted (Regulated) | 5 |
| Healthcare & Life Sciences | Public | Internal | Sensitive | Restricted (PHI/Clinical) | 5 |
| Business Process Outsourcing (BPO) & KPO | Public | Internal | Client-Confidential | Client-Restricted | 4 |
| Legal, Accounting, & Consulting Services | Public | Internal | Privileged | Client-Restricted | 3 |
| E-Commerce & Retail | Public | Internal | Confidential | Restricted (PCI/PII) | 3 |
| Manufacturing & Industrial (Industry 4.0) | Public | Internal | Proprietary | Restricted (Controlled/IP) | 2 |
| Government & Public Sector; Manufacturing & Industrial (Industry 4.0) (defence/government) | Official | Official-Sensitive | Secret | Top Secret | 4 |
| Transportation & Logistics | Public | Internal | Confidential | Restricted (Safety/Security) | 3 |
| Education & Research | Public | Internal | Confidential | Restricted (Research/PII) | 2 |
| Media & Telecommunications | Public | Internal | Confidential | Restricted (Subscriber/LI) | 3 |
| Energy & Utilities | Public | Internal | Confidential | Restricted (CEII/OT) | 3 |

4.1 Government and defence interchange equivalence

Four organisations (Department of Digital Services, National Security Intelligence Agency, CitizenConnect Digital Platform and AeroDefense Systems International) use a national protective-marking scheme. For exchange with other Group organisations only the following equivalence applies; SECRET and TOP SECRET information is never exchanged through Group systems.

| National marking | Positional tier in source data | Group interchange equivalent | Handling authority |
| :-: | :-: | :-: | :-: |
| Official | Tier 1 | Tier 2 — Internal (not public unless release-approved) | Group standard |
| Official-Sensitive | Tier 2 | Tier 3 — Confidential (minimum) | Group standard + national guidance |
| Secret | Tier 3 | Outside Group model — national accredited systems only | National security authority |
| Top Secret | Tier 4 | Outside Group model — national accredited systems only | National security authority |

5\. Classification decision tree

Is the information approved for public release by an authorised owner? → Tier 1.

Is it subject to a national-security marking? → apply the national scheme (§4.1).

Does it contain special-category personal data, PHI, cardholder data (PAN/SAD), children's data at scale, CEII/OT designs or configurations, lawful-interception or subscriber traffic data, cryptographic keys/credentials, or privileged legal matters? → Tier 4.

Would unauthorised disclosure breach law, contract or cause significant financial, regulatory or reputational harm (per §3.1)? → Tier 3 (or Tier 4 if severe).

Does it contain any personal data, client information or commercially sensitive data? → Tier 3.

Otherwise → Tier 2 (default).

Rate integrity (1–4) and availability (1–4, from asset criticality) separately and record the CIA rating in the register.

6\. Handling matrix

| Activity | Tier 1 Public | Tier 2 Internal | Tier 3 Confidential | Tier 4 Restricted |
| :-: | :-: | :-: | :-: | :-: |
| Labelling | Optional | Label in footer / metadata; auto-label by default | Visible label (header+footer+metadata); MIP/DLP label mandatory | Visible label on every page/screen; watermark with user ID; DLP block rules |
| Storage | Any approved platform | Group-managed platforms only | Encrypted at rest; access-controlled repositories; no personal devices unless BYOD-enrolled | Encrypted with org-managed keys (HSM/KMS); dedicated restricted repositories; data residency enforced |
| Access | Anyone | Authenticated workforce & approved partners | Role-based, owner-approved; MFA | Named individuals; owner-approved; phishing-resistant MFA; PAM for admins; quarterly review |
| Internal transmission | No restriction | Corporate network / approved collaboration tools | Encrypted channels (TLS 1.2+) | End-to-end or TLS 1.3 + DLP; no bulk email; secure file transfer |
| External transmission | No restriction | With NDA / business need | Encrypted; NDA/contract/DPA in place; approved channel | Encrypted + owner approval per transfer; transfer mechanism for cross-border personal data; logged |
| Email | Allowed | Allowed internally | Allowed with encryption when external | Not by standard email — use secure portal / encrypted mail with expiry |
| Printing & paper | Allowed | Collect promptly | Secure print release; locked storage | Only when essential; secure print; numbered copies; locked cabinet / safe |
| Removable media | Allowed | Encrypted, Group-issued | Encrypted, Group-issued, logged | Prohibited unless approved by CISO; hardware-encrypted, logged, tracked |
| Cloud / SaaS | Allowed | Approved services | Approved services with DPA; region controls | Approved services with customer-managed keys; residency controls; CSPM monitoring |
| AI tools | Allowed | Enterprise AI tools only | Enterprise AI with no-training guarantee and approved scope | Prohibited unless specifically approved AI environment (on-prem / sovereign) |
| Verbal & meetings | No restriction | Internal meetings | Participants verified; no public places | Closed meetings; no recording unless approved; secure rooms |
| Mentee use | Allowed | Sanitised copies | Synthetic / anonymised only | Never — synthetic scenarios only |
| Retention review | — | Per schedule | Per schedule; annual review | Per schedule; annual review; legal-hold check |
| Disposal | Normal | Recycling / delete | Secure deletion; cross-cut shredding | Crypto-erase or certified destruction (NIST SP 800-88 Purge/Destroy) with certificate |
| Incident on loss | None | Report to service desk | Report immediately; breach assessment | Report immediately; SEV2+ incident; notification assessment within 1h |

7\. Integrity and availability ratings

| Rating | Integrity | Availability (from asset criticality) |
| :-: | :-: | :-: |
| 4 — Very high | Errors cause safety, legal or financial-reporting impact (ledgers, clinical, OT, keys, identity) | Mission Critical — near-100% availability; 24×7 monitoring, HA and DR |
| 3 — High | Errors cause significant operational or client impact | Business Critical — short outages tolerable; recovery within RTO |
| 2 — Medium | Errors correctable with moderate effort | Standard / Operational — manual workaround available |
| 1 — Low | Negligible impact | Non-Critical — test, dev or legacy |

8\. Reclassification, aggregation and declassification

Owners review classification at least annually and when purpose, content or legal context changes.

Aggregated data sets take the highest tier of their components; large aggregations of Tier 3 personal data may warrant Tier 4.

Declassification to Tier 1 requires owner approval and, for regulated data, Legal/DPO confirmation.

Copies, extracts, screenshots and reports inherit the classification of the source.

9\. Roles

| Role | Responsibility |
| :-: | :-: |
| Asset owner | Classifies, approves access, reviews annually |
| Custodian (IT / cloud) | Implements technical handling controls |
| Users | Handle information per its label; report mislabelling |
| Compliance Manager | Monitors classification coverage and quality |
| DPO | Confirms tier for personal-data sets |
| Group CISO | Owns this standard; approves exceptions |

11\. Findings from applying the standard to the asset register

| \# | Finding | Assets affected | Required action |
| :-: | :-: | :-: | :-: |
| F1 | No asset in the register is classified Tier 1 (Public). Public content (websites, published reports) is either missing from the register or over-classified. | 0 Tier 1 of 7,663 | Owners to register public-facing content and confirm release approval. |
| F2 | SECRET / TOP SECRET assets of government/defence organisations are recorded as hosted on vendor SaaS or multi-region commercial cloud. | 508 | Migrate to nationally accredited sovereign environments or re-validate the classification (likely over-classification). Treat as HIGH risk until resolved. |
| F3 | Tier 4 personal-data assets recorded as hosted in multi-region cloud — data-residency and transfer mechanisms must be verified. | 560 | Confirm region pinning and transfer mechanism (SCCs, PDPL, PIPL, DPDP) per asset. |
| F4 | Share of Top Secret in the four national-marking orgs (314 of 723 assets) is far above typical national baselines. | 314 | Classification quality review with national security officers. |
| F6 | 20 assets flagged as containing personal/regulated data are classified below the Tier 3 floor. | see register | Reclassify to Tier 3 minimum. |
| F5 | Owners are role titles; named individuals are not yet assigned. | 7,663 | Assign named owners on adoption (register cover note). |
