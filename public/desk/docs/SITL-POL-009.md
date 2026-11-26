Operations Security Policy

SITL-POL-009 | Operations Security Policy

SITL Group Policy — including associated procedures and guidelines

|  |  |
| :-: | :-: |
| Document ID | SITL-POL-009 |
| Version | 2.0 |
| Status | Approved |
| Document owner | Group CIO |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-02-09 |
| Next review | 2027-02-08 |
| Classification | Internal |

1\. Purpose

Ensures that the Group's information systems are operated securely and predictably: changes are controlled, systems are protected from malware, information can be restored from backup, security events are logged and watched, and capacity keeps pace with demand.

2\. Scope and applicability

All operational systems, applications, infrastructure, cloud services and endpoints of Group organisations, whether run by the organisation's own IT teams or by a third party for it, and every change made to them.

This policy applies to every SITL organisation. Organisation addenda (SITL-ADD-01 … 42) record local legal requirements that are stricter than, or additional to, this policy. Where law and this policy conflict, the stricter requirement applies.

3\. Policy statements

3.1 Change and configuration

• Every change to an operational system (application, infrastructure, configuration or data fix) is recorded as a request for change (RFC) in the IT service management (ITSM) tool before it is made.

• A change is assessed for its impact and approved before it is implemented: by the Change Advisory Board (CAB), or, for an emergency change, by the emergency approver and then the CAB (Section 6.1).

• Each change is tested before it reaches production, has a rollback plan that covers every component it alters, and is reviewed after it is made. The evidence of each is kept in the RFC.

• Changes reach production only through the approved release path. Development, test and production are separate environments, and nobody holds standing write access to production systems or data for development work.

• Systems are built and kept to the configuration baselines of the Group hardening standards; a change to a baseline is itself a change.

• The production release log is reconciled each month with the approved RFCs, so that a change made outside this procedure is found and investigated.

3.2 Malware and endpoint protection

• Every endpoint and server runs the Group's centrally managed anti-malware protection, which users cannot switch off. Its definitions are updated at least daily, and its alerts go to the security monitoring team.

• Files arriving by e-mail, download or removable media are scanned before they are opened.

3.3 Backup

• Information, software and system images are backed up to the schedule of each system's criticality: Mission Critical systems at least daily.

• Backups are encrypted, and at least one copy is kept offline or immutable, in a location separate from the system it protects.

• Restores are tested at the frequency of Section 4, by the procedure of Section 6.2, and each test's result is recorded.

3.4 Logging and monitoring

• Systems within the SIEM coverage of Section 4 send their security event logs to the Group security monitoring platform.

• Security event logs are kept for at least 12 months (365 days). The hot, searchable period may be shorter.

• Logs are protected from alteration and deletion: administrators cannot delete or change the logs of their own activity.

• System clocks are synchronised to the Group time source, so that events from different systems can be put on one timeline.

• Alerts are watched at the level of monitoring of Section 4.

3.5 Capacity

• The use of processing, storage and network capacity is monitored for Mission Critical and Business Critical systems, with alert thresholds set before capacity runs out.

• Capacity needs are forecast at least once a year, and the forecast is taken into the budget cycle.

4\. Criticality-band requirements

Minimum requirements scale with organisation criticality as defined in Organization\_Criticality\_Segregation (13 HIGH, 21 MEDIUM, 8 LOW organisations).

| Requirement | HIGH (GRC 501 orgs) | MEDIUM (GRC 301 orgs) | LOW (GRC 101 orgs) |
| :-: | :-: | :-: | :-: |
| Backup restore test | Quarterly | Quarterly | Semi-annual |
| SIEM coverage | All systems | Mission Critical + Business Critical + internet-facing | Mission Critical + internet-facing |
| 24×7 monitoring | 24×7 security operations centre | 24×7 (may be outsourced) | Business hours + on-call alerting |
| Capacity review | Quarterly | Semi-annual | Annual |

5\. Roles and responsibilities

| Role | Responsibility |
| :-: | :-: |
| Policy owner — Group CIO | Maintains the policy and the change procedure, reports the KPIs |
| Org CEO | Ensures the policy is implemented and resourced within the organisation |
| Org CIO / IT management | Operates the policy: runs the change procedure, backups, logging and capacity management |
| Change Advisory Board (CAB) | Meets weekly; approves or rejects each normal change before it is implemented, and reviews each emergency change |
| Emergency approver | The on-call IT manager: authorises an emergency change that cannot wait for the CAB |
| System owners | Raise and own the changes to their systems and their post-implementation reviews |
| Developers and engineers | Make changes only through the release path; never hold standing write access to production for development work |
| Internal Audit | Provides independent assurance over compliance with this policy |
| All workforce | Comply with the policy and report violations or weaknesses |

6\. Procedures

6.1 Procedure: Standard change

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Raise an RFC in the ITSM tool: what changes and why, the systems and assets it affects, its risk and its impact | Requester (system owner or change owner) | RFC |
| 2 | Attach the test evidence from the test environment, and a rollback plan that covers every component the change alters (application, database, configuration) | Change owner | Test evidence and rollback plan in the RFC |
| 3 | Approve or reject the change, and record the decision and the approver in the RFC | Change Advisory Board (weekly) | Approval in the RFC, before implementation |
| 4 | Implement the approved change through the release path, in the agreed window | Release engineer | Release log entry |
| 5 | Review the change: did it work, did it cause an incident, was the rollback needed; record the review in the RFC | Change owner | Post-implementation review within 5 working days of implementation |
| E1 | Emergency change: where a change cannot wait for the CAB because an outage or an active security threat needs it now, the emergency approver authorises it before it is made, by phone or chat if need be, and it is raised as an emergency RFC with the approver and the time | Emergency approver | Emergency RFC |
| E2 | The CAB reviews the emergency change and approves it retrospectively; steps 2 and 5 still apply | Change Advisory Board | Retrospective approval within 2 working days of implementation |

A change made without the approval of step 3 or step E1 is an unauthorised change: it is raised as an incident, and the CAB decides whether it stays or is rolled back.

6.2 Procedure: Backup restore test

| Step | Action | Responsible | Output / SLA |
| :-: | :-: | :-: | :-: |
| 1 | Choose the system and backup set to test, Mission Critical systems first, so that each is tested at the frequency of Section 4 | IT operations | Test plan |
| 2 | Restore the backup into an isolated environment | IT operations | Restored copy |
| 3 | Check that the restored information is complete and readable against the source, and record how long the restore took against the system's recovery time objective | System owner | Restore test record |
| 4 | Record the result; raise a ticket for every failure and test again once it is fixed | IT operations | Restore test result (each test) |

7\. Guidelines

7.1 Guideline: Log sources to prioritise

Bring in first the sources an investigation needs: identity and access management, firewalls and the remote-access VPN, endpoint protection, the Mission Critical applications, the cloud control plane, and databases that hold Restricted information.

A source counts as covered only when its events arrive at the monitoring platform and an alert would fire on them; a source that has gone silent is not covered.

8\. Compliance, exceptions and enforcement

Compliance is measured through the KPIs below, control testing, internal audit and the GRC Operational Task Libraries.

Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date and approval by the system owner and the Org CISO.

Violations may result in disciplinary action in accordance with local employment law, contract termination for third parties, and reporting to authorities where legally required.

9\. Framework mapping

| Framework | References |
| :-: | :-: |
| ISO/IEC 27001:2022 | A.8.6, A.8.7, A.8.13, A.8.15, A.8.16, A.8.17, A.8.31, A.8.32 |
| NIST CSF 2.0 | PR.PS, PR.DS, DE.CM |
| SOC 2 | CC7.2, CC8.1, A1.2 |
| CIS Controls v8 | 8, 10, 11 |

10\. Key performance indicators

| KPI | Target |
| :-: | :-: |
| Changes approved before implementation (emergency changes: by the emergency approver) | 100% |
| Emergency changes approved by the CAB within 2 working days | 100% |
| Backup restore tests done to the Section 4 frequency | 100% |
| Systems in SIEM coverage sending logs | 100% |

11\. Document control

| Field | Value |
| :-: | :-: |
| Document ID | SITL-POL-009 |
| Version | 2.0 |
| Status | Approved |
| Document owner | Group CIO |
| Approved by | Group GRC Steering Committee |
| Effective date | 2026-02-09 |
| Next review | 2027-02-08 |
| Classification | Internal |

| Version | Date | Author | Change |
| :-: | :-: | :-: | :-: |
| 1.0 | 2024-02-12 | Group IT Operations | Initial Group issue |
| 2.0 | 2026-02-09 | Group IT Operations — reviewed by Group CIO | Emergency change path and monthly release-log reconciliation added; log retention set to 12 months |
