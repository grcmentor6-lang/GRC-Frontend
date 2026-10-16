Organisation Addendum — LearnTech Educational Solutions

BKB-ADD-36 | Organisation Addendum — LearnTech Educational Solutions

Local, regulatory and sector tailoring of the BKB Group policy library for LearnTech Educational Solutions (Education & Research)

|  |  |
| :-: | :-: |
| Document ID | BKB-ADD-36 |
| Version | 1.0 |
| Status | Approved for adoption — draft for Board ratification |
| Document owner | LearnTech Educational Solutions CEO (prepared by Policy & Governance Analyst) |
| Approved by | Org CEO and Group CISO |
| Effective date | 2026-10-01 |
| Next review | 2027-09-30 |
| Classification | Confidential |

1\. Organisation profile

|  |  |
| :-: | :-: |
| Organisation | LearnTech Educational Solutions |
| Industry / sub-industry | Education & Research / EdTech Platforms (Especially Those Handling Student Data) |
| Criticality (governing) | LOW — mentorship programme GRC 101 |
| Criticality rationale | EdTech platform handling student data; regulated under FERPA/GDPR but low societal disruption on breach. |
| Head office | Istanbul, Turkey |
| Regional offices | Amsterdam, Netherlands (Europe); New York, United States (North America); Mumbai, India (Asia-Pacific) |
| Organisational context | A global EdTech platform delivering AI-powered personalised learning, virtual classrooms, assessment tools, and student progress analytics to K-12 schools, universities, and corporate training programmes across 50 countries. |
| Why this head-office location | Turkey's KVKK (Personal Data Protection Authority) is one of the world's most actively enforced data protection laws; KVKK explicitly regulates student data with strict consent requirements and the Education Ministry imposes tight controls on EdTech platforms serving Turkish students. |
| Lead regulator(s) | KVKK — Kişisel Verileri Koruma Kurumu (Turkey) & MEB |
| Registered information assets | 173 across 4 offices |
| Classification scheme | Public ‣ Internal ‣ Confidential ‣ Restricted (Research/PII) |

1.1 Services and products

AI-powered personalised learning platform

Virtual classroom and live instruction

Assessment and quiz builder

Student performance analytics and reporting

Corporate e-learning (LMS)

Content authoring tools

Digital credentials and micro-certifications

2\. Legal and regulatory environment by office

| Office | Data-protection law | Authority | Breach notification | Cyber / sector law | Cross-border transfer |
| :-: | :-: | :-: | :-: | :-: | :-: |
| Istanbul, Turkey(Head office) | KVKK Law 6698 (amended 2024 — transfer rules) | KVKK Authority | 72h to Board | Cybersecurity Law 7545 (2025); USOM | Adequacy / standard contracts registered with KVKK within 5 days |
| Amsterdam, Netherlands(Regional office) | GDPR + UAVG | Autoriteit Persoonsgegevens | 72h to supervisory authority (GDPR Art.33); without undue delay to data subjects if high risk | Cyberbeveiligingswet (NIS2) — transposition delayed, referred to CJEU 2026; NCSC-NL, RDI | GDPR Ch.V |
| New York, United States(Regional office) | Sectoral (HIPAA, GLBA, FERPA, COPPA, FCRA) + \~20 state comprehensive privacy laws (e.g., CCPA/CPRA) | FTC, HHS-OCR, SEC, state AGs, CPPA | All 50 states have breach laws (typically 30–60 days); SEC 8-K within 4 business days of materiality; CIRCIA rules pending; HIPAA 60 days | CISA; NERC CIP; TSA directives; NYDFS 23 NYCRR 500; FedRAMP/FISMA | Few export limits on personal data; DOJ bulk sensitive data rule (2025) restricts transfers to countries of concern; ITAR/EAR for controlled tech |
| Mumbai, India(Regional office) | DPDP Act 2023 + DPDP Rules 2025 (phased; most obligations from \~May 2027) | Data Protection Board of India | Notify Board and affected principals without delay; detailed report within 72h | CERT-In Directions 2022 — 6h incident reporting; IT Act 2000 | Permitted except to notified restricted countries; sectoral localisation (RBI payments) |

Note. Country entries were compiled in September 2026 from public sources and must be validated by local counsel before reliance. The shortest applicable notification clock governs any incident affecting multiple jurisdictions.

2.1 Lead regulator requirements

KVKK: explicit written consent from parents for processing data of minors under 18

KVKK: breach notification within 72 hours; registration of data processing activities

MEB: approval for EdTech platforms used in Turkish public schools

Explicit consent for any cross-border data transfer of student data

Right of erasure: upon student account deletion, all PII must be purged within 30 days

3\. Standards and regulations in scope

| Standard / regulation | Type | Decomposition unit | Requirements | Operational tasks (library) |
| :-: | :-: | :-: | :-: | :-: |
| ISO/IEC 27001:2022 | Mandatory | Clause + Annex A control | 118 | 23600 |
| KVKK (Turkey) | Mandatory | Article | 11 | 2200 |
| GDPR (EU) | Mandatory | Article | 42 | 8400 |
| COPPA (US) | Mandatory | Section | 9 | 1800 |
| FERPA (US) | Mandatory | Section | 10 | 2000 |
| ISO/IEC 29151 (PII Protection) | Mandatory | PII-protection control area | 12 | 2400 |
| iNACOL standards | Optional | Standard | 9 | 1800 |
| ISO/IEC 27701 | Optional | PIMS clause / Annex A-B control | 55 | 11000 |
| NIST Privacy Framework | Optional | Category | 18 | 3600 |
| Student Data Privacy Consortium (SDPC) standards | Optional | Agreement clause area | 11 | 2200 |

4\. Stakeholder requirements

| Interested party group | Requirements |
| :-: | :-: |
| Stakeholders / customers | • Child data protection (under-18 users)• AI transparency in learning recommendations• Parental consent management |
| Employees | • Child safety and KVKK training• Ethical AI development practices• Secure coding (OWASP) |
| Regulators | • KVKK: explicit consent for minors' data; parental consent mandatory• GDPR (for EU students)• COPPA (for US under-13)• FERPA (for US student records) |
| Partners | • School data processing agreements• Content provider licensing• AI tool ethical review |

4.1 Interested parties

| Internal | External |
| :-: | :-: |
| • Product and Engineering• AI/ML and Data Science• Content and Curriculum teams• CISO & Privacy• DPO• Sales and Partnerships• Customer Success• HR• Finance• Legal | • Students (minors and adults)• Parents and guardians• School administrators• KVKK (Turkey DPA)• Turkish Ministry of National Education (MEB)• University partners• Corporate clients• COPPA/FERPA regulators (for US clients) |

5\. Policy parameters that apply to this organisation

The following values are selected from the criticality-band tables of the Group policies for a LOW organisation. They are mandatory minimums.

| Policy | Title | Requirement | LOW value |
| :-: | :-: | :-: | :-: |
| BKB-POL-001 | Information Security Policy | Management review frequency | Annual |
| BKB-POL-001 | Information Security Policy | Internal ISMS audit coverage | 100% over 24 months |
| BKB-POL-001 | Information Security Policy | External certification / attestation | Mandatory where listed; otherwise recommended |
| BKB-POL-002 | Enterprise Risk Management Policy | Office risk-assessment refresh | Annual |
| BKB-POL-002 | Enterprise Risk Management Policy | Board-level risk reporting | Semi-annual, aggregated |
| BKB-POL-002 | Enterprise Risk Management Policy | Risk quantification | Top-5 risks (qualitative acceptable) |
| BKB-POL-003 | Asset Management Policy | Register review | Annual |
| BKB-POL-003 | Asset Management Policy | Automated discovery reconciliation | Semi-annual |
| BKB-POL-006 | Access Control and Identity Management Policy | User access review — Mission/Business Critical assets | Semi-annual |
| BKB-POL-006 | Access Control and Identity Management Policy | User access review — other assets | Annual |
| BKB-POL-006 | Access Control and Identity Management Policy | Privileged access review | Quarterly |
| BKB-POL-006 | Access Control and Identity Management Policy | Session recording for privileged access | Mission Critical systems |
| BKB-POL-008 | Physical and Environmental Security Policy | Secure-area access review | Semi-annual |
| BKB-POL-008 | Physical and Environmental Security Policy | Physical security assessment of office | Every 3 years |
| BKB-POL-009 | Operations Security Policy | Backup restore test | Semi-annual |
| BKB-POL-009 | Operations Security Policy | SIEM coverage | Mission Critical + internet-facing |
| BKB-POL-009 | Operations Security Policy | 24×7 monitoring | Business hours + on-call alerting |
| BKB-POL-010 | Vulnerability and Patch Management Policy | Critical / KEV-listed — internet-facing | 7 days |
| BKB-POL-010 | Vulnerability and Patch Management Policy | Critical — internal | 14 days |
| BKB-POL-010 | Vulnerability and Patch Management Policy | High | 30 days |
| BKB-POL-010 | Vulnerability and Patch Management Policy | Medium | 90 days |
| BKB-POL-010 | Vulnerability and Patch Management Policy | Penetration test | Annual (external) / biennial (internal) |
| BKB-POL-013 | Supplier and Third-Party Risk Management Policy | Critical supplier reassessment | Annual |
| BKB-POL-013 | Supplier and Third-Party Risk Management Policy | High supplier reassessment | Every 2 years |
| BKB-POL-013 | Supplier and Third-Party Risk Management Policy | On-site / remote audit of Critical suppliers | Risk-based |
| BKB-POL-014 | Incident Management and Breach Notification Policy | Playbook tabletop exercises | Annual |
| BKB-POL-014 | Incident Management and Breach Notification Policy | Retainer with IR firm | Recommended |
| BKB-POL-015 | Business Continuity and ICT Resilience Policy | BIA refresh | Every 2 years |
| BKB-POL-015 | Business Continuity and ICT Resilience Policy | Full DR failover test | Every 2 years |
| BKB-POL-015 | Business Continuity and ICT Resilience Policy | Crisis tabletop | Annual |

6\. Sector and jurisdiction overlays

| Overlay | Additional mandatory requirement |
| :-: | :-: |
| GDPR | RoPA, DPIAs, Art.28 contracts, 72h breach notification to lead supervisory authority, SCCs/adequacy for transfers out of the EEA. |
| India (CERT-In / DPDP) | Report cyber incidents to CERT-In within 6h; retain ICT logs 180 days in India; DPDP Rules 2025 phased obligations (breach report to Board within 72h). |
| United States | State breach-notification laws for affected residents; SEC 8-K Item 1.05 within 4 business days if SEC registrant; sector rules (NYDFS 500 for NY financial services). |
| Children and students | Verifiable parental consent (COPPA), FERPA school-official controls and written agreements; age-appropriate design. |

7\. Information classification labels

| Group tier | LearnTech Educational Solutions label |
| :-: | :-: |
| Tier 1 (Public) | Public |
| Tier 2 (Internal) | Internal |
| Tier 3 (Confidential) | Confidential |
| Tier 4 (Restricted) | Restricted (Research/PII) |

| Classification of registered assets | Count |
| :-: | :-: |
| Restricted (Research/PII) | 80 |
| Confidential | 73 |
| Internal | 20 |

8\. Asset and criticality profile

| Office | Mission Critical | Business Critical | Standard / Operational | Non-Critical | Total |
| :-: | :-: | :-: | :-: | :-: | :-: |
| Istanbul, Turkey | 8 | 42 | 26 | 1 | 77 |
| Amsterdam, Netherlands | 0 | 21 | 11 | 0 | 32 |
| New York, United States | 0 | 21 | 11 | 0 | 32 |
| Mumbai, India | 0 | 21 | 11 | 0 | 32 |

8.1 Mission Critical assets

| Asset | Office | Department | Owner | Classification | Location |
| :-: | :-: | :-: | :-: | :-: | :-: |
| Treasury management system | Istanbul, Turkey | Finance & Treasury (Group) | Group Treasurer | Restricted (Research/PII) | SaaS (vendor-hosted) |
| Banking & payment files | Istanbul, Turkey | Finance & Treasury (Group) | Chief Financial Officer | Restricted (Research/PII) | SaaS (vendor-hosted) |
| SIEM & log analytics platform | Istanbul, Turkey | Information Security (CISO Office) | Chief Information Security Officer | Restricted (Research/PII) | Hybrid — on-prem Istanbul + cloud |
| Identity & access management (IAM) | Istanbul, Turkey | Information Security (CISO Office) | Chief Information Security Officer | Restricted (Research/PII) | Hybrid — on-prem Istanbul + cloud |
| PKI & secrets / key management | Istanbul, Turkey | Information Security (CISO Office) | Chief Information Security Officer | Restricted (Research/PII) | On-premises data centre — Istanbul |
| Enterprise directory & email | Istanbul, Turkey | Corporate IT & Technology | Chief Information Officer | Confidential | Hybrid — on-prem Istanbul + cloud |
| Core network & infrastructure | Istanbul, Turkey | Corporate IT & Technology | Head of Infrastructure | Confidential | On-premises data centre — Istanbul |
| Student information system (SIS) | Istanbul, Turkey | Admissions & Registrar | Registrar | Restricted (Research/PII) | SaaS (vendor-hosted) |

9\. Processing activities and data

| Customer-facing processes | Client data handled |
| :-: | :-: |
| • School/institution onboarding• Student account creation (with parental consent for minors)• Learning session delivery• Assessment and grading• Progress reporting to teachers and parents• Content library access and licensing | • Student PII (names, age, school)• Learning activity and progress data• Assessment scores and responses• Parental contact information• Behavioural and engagement analytics• Video session recordings (if applicable) |

| On-premises assets | Cloud assets |
| :-: | :-: |
| • (Cloud-native — no significant on-premises assets) | • Learning platform (cloud-native SaaS)• Video conferencing infrastructure• Student data warehouse• AI/ML model serving infrastructure• Content delivery network (CDN)• LMS backend |

10\. Mentorship programme mode

GRC 101 active — mentees may execute Tier-1 tasks from the task libraries on sanitised data.

11\. Approval

| Role | Name | Signature / date |
| :-: | :-: | :-: |
| Org CEO |  |  |
| Org Chief Risk & Compliance Officer |  |  |
| Group CISO |  |  |
