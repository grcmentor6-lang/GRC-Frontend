import { localizable } from "./names";
/**
 * The situation a decision step's question sits in: two or three sentences before the options, so a
 * learner has something to reason with. The pack's questions are one line ("Where does it apply?").
 *
 * Built from the step's own help note, its rule and the documents it cites. A line must never give the
 * answer away. Platform-written, so each is listed for review in docs/GRC101_Decision_Context.md;
 * keyed by decision id ("F1.1-D1"). A decision with no entry shows its question alone.
 */
export const DECISION_CONTEXT: Record<string, string> = {
  "F1.1-D1":
    "It is your first day in the Group GRC Office. Your platform account is in your name: every step, file and decision made in it is recorded as your work, and auditors rely on those records. This evening you will be offline, and a colleague messages you.",
  "F1.1-D2":
    "You are partway through a step and one of its rules does not make sense to you. You want to understand it before you go on: a guess would end up in your work, under your name.",
  "F1.1-D3":
    "Files in your 01_Inputs folder are read-only: they stay as you received them, so to work on a dataset you make a working copy. This one holds customer names and e-mail addresses, made up for you alone. In SITL-STD-001 (Policies › Policy Library) customer data is Tier 3, Confidential, and its Section 6 handling matrix says how Tier 3 data is kept.",
  // The other tasks' situations went with their old decisions (GRC 101 rebuilt, docs/li101); Phase 2 writes the new ones.
  // F1.2: the Policy & Governance Analyst owns the task, the Compliance Manager supports it (his Tasks sheet).
  "F1.2-D2":
    "A client of GlobalConnect Customer Solutions sends a security questionnaire. One question asks which standard the Manila office's information security management system will be certified against. The Compliance Manager asks you to answer it from your LI-FAM map: step 2 gave each document its type, and its View button opens the map again.",
  "F1.2-D4":
    "The IT manager at the Manila office has read that ISO/IEC 27001:2022 Annex A lists 93 controls, and asks whether all 93 must be in place before certification. The Policy & Governance Analyst asks you to answer from what Clause 6.1.3 requires. Its summary is in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "F1.2-D5":
    "A colleague in the Group GRC Office lists the standard as ISO/IEC 27001:2022 + Amd 1:2024 and asks what the amendment changed, so the map says it correctly before it goes out. The amendment is summarised in the Framework Quick Reference (Learn › Framework Quick Reference), next to the clause you read in step 5.",
  // F1.3: the Compliance Manager owns the task, the CISO supports it (his Tasks sheet).
  "F1.3-D2":
    "You are recording the issues of GlobalConnect Customer Solutions at Manila in CTX-ISS. A colleague says climate change is a matter for the facilities team, not for the ISMS. The Compliance Manager asks you what ISO/IEC 27001:2022 + Amd 1:2024 requires of GlobalConnect before anyone decides. The amendment and Clause 4.1 are summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "F1.3-D3":
    "Next comes CTX-IP, the register of Manila's interested parties: each row names a party and what it needs from GlobalConnect. A new analyst has drafted three entries for the Requirement column and asks which one belongs there. Clause 4.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "F1.3-D4":
    "CTX-IP now lists five parties with their requirements. Clients write data security for their customer data into their contracts, and the Org CISO intends the ISMS to meet it. The Org CISO asks what the register should record for such a requirement. Clause 4.2 is summarised in the Framework Quick Reference, which you read in step 5.",
  // F2.1: the Cybersecurity Program Manager owns the task, the Compliance Manager supports it (his Tasks sheet).
  "F2.1-D1":
    "You are drafting the ISMS scope for GlobalConnect Customer Solutions at Manila. The Finance & Payroll team tells you that the office's payroll, with employees' pay, tax and bank details, is run by an outside provider on the provider's own systems. The Cybersecurity Program Manager asks how the provider should appear in the scope. Clause 4.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "F2.1-D2":
    "Sections 1–4 of your scope are filled, and the requirements line carries the clients' data-security requirement in from CTX-IP. A Manila operations manager now asks for the customer-support floor, where agents handle client customer data, to be left out of the scope so that certification comes sooner. The Cybersecurity Program Manager asks what you advise. Clause 4.3 is summarised in the Framework Quick Reference, which you read in step 2.",
  // F2.2: the Compliance Manager owns the task, the Cyber Risk Manager supports it (his Tasks sheet).
  "F2.2-D3":
    "Step 3 left one row of sheet Gap for this step: 6.1.2, information security risk assessment. The Cyber Risk Manager, who runs the Group's risk method, asks you to rate it yourself from its notes in dataset GAP-25 and the Maturity Model, before the baseline goes to the Compliance Manager. The Maturity Model is Ref-Maturity Model, in Learn › Reference pages.",
  "F2.2-D4":
    "Sheet Gap now rates all 25 requirements of clauses 4.1–10.2 for Manila, and every one not fully met is a gap. The Compliance Manager can start work on three of them this quarter and asks which kind of gap goes first. The Group ISMS is at Level 3 and aims for Level 4, and a colleague has suggested tidying the documents too.",
  // T3.1: the Policy & Governance Analyst owns the task, the CISO supports it (his Tasks sheet).
  "T3.1-D2":
    "The Org CISO forwards an extract of the SITL policy portal, taken on 19 October 2026 (Ref-Policy portal, in Learn › Reference pages). One of the topic-specific policies GlobalConnect works under, SITL-POL-008 Physical and Environmental Security, was last approved on 14 August 2024. The Policy & Governance Analyst asks what you record before the register is built. SITL-POL-000 Section 7 sets out the policy lifecycle (Policies › Policy Library).",
  "T3.1-D3":
    "While you check SITL-POL-001, the Manila IT manager says he signs off the office's IT policies, and offers to approve the information security policy as well so the ISMS can move on. SITL-POL-001 is the Group's top-level information security policy. Clause 5.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T3.1-D4":
    "At the certification audit the auditor will ask how top management shows its commitment to the ISMS. A colleague has collected three items from around the Manila office and asks which one goes in the evidence file. Clause 5.1 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  // T3.2: the Policy & Governance Analyst owns the task, the Compliance Manager supports it (his Tasks sheet).
  "T3.2-D1":
    "Your RACI for the Manila ISMS is filled for its ten processes. The Compliance Manager says the certification auditor will ask which two responsibilities Clause 5.3 requires top management to assign by name, and wants them at the top of sheet RACI, each with the role that holds it. Clause 5.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  // T6.2: the Policy & Governance Analyst owns the task, the Compliance Manager supports it (his Tasks sheet).
  "T6.2-D2":
    "In this sprint's walk-through you found that the Manila data-centre team works from operating procedures kept as pages on the IT wiki. The backup and restore page is followed every night, but it shows no version, no owner and no approval date. The Compliance Manager asks which Clause 7.5.2 requirements it misses. Clause 7.5 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T6.2-D5":
    "Manila HR tells you that in October an IT contractor joined the data-centre team eleven days before his agency's screening report arrived, with the same access as the rest of the team. The data-centre lead says the agency screens its own people, so it is the agency's matter. You are recording A.6.1 in the tracker. What A.6.1 requires is on its LI task page, LI-A.6.1 (Learn › Reference pages).",
  // T10.1: the Security Architecture & Standards Manager owns the task, the Privacy Compliance Analyst supports it.
  // T10.2: the Cybersecurity Program Manager owns the task, the Information Security Auditor supports it (his Tasks sheet).
  "T10.2-D4":
    "On a Saturday at 02:00 the payment page of the customer portal stopped taking cards. The on-call engineer fixed it in production at once, without reaching anyone to approve the change. On Monday the Cybersecurity Program Manager asks you what change management expects of a change like this. The Group change procedure is SITL-POL-009 Section 6.1 (Policies › Policy Library).",
  "T10.2-D5":
    "SPR-13 records that the portal's nine developers still hold write access to the production database, granted in 2025 for hotfixes, and sign in to it with their development accounts. The Information Security Auditor asks you which control to raise the gap against in CIT-S13. Each control's LI task page (Learn › Reference pages) says what it requires.",
  "T10.1-D4":
    "Rule R-04 of the Manila core firewall (dataset NET) was added in November 2025 for a client demonstration, with no change ticket and no end date. It lets any device on the guest Wi-Fi reach the server zone, where the file server FS-MNL-01 sits. The Security Architecture & Standards Manager asks you to log the gap against the right control in CIT-S12.",
  "T10.1-D5":
    "In CFG-BASE, the call recording archive database is encrypted with AES-256, but the key that unlocks it sits in a plain-text file on the same server. The server is fully patched, and its administrator points that out. The recordings are Client-Restricted, and the Org CISO asks what you record in CIT-S12.",
  "T10.1-D6":
    "SPR-12 records that in September 2026 the delivery team copied a production extract of client transaction data, with end-customers' names and account numbers, to the test system without masking it. The Privacy Compliance Analyst asks which Annex A controls the gap falls under, so the right owners act on it.",
  "T3.2-D4":
    "In this sprint's walk-through of the Manila office, the Compliance Manager found that in the finance team of three, one person both creates suppliers in the supplier master and approves their payments. The finance lead says the team is too small to split the work. You are recording A.5.3 in the tracker. What A.5.3 requires is on its LI task page, LI-A.5.3 (Learn › Reference pages).",
  // T8.1: the Incident Response & Crisis Manager (GRC) owns the task, the Information Security Auditor supports it (his Tasks
  // sheet). D2 and D3 are injects INJ-3 and INJ-5 of the tabletop (dataset TTX); D6 follows its post-incident review.
  "T8.1-D2":
    "The tabletop has reached INJ-3. Laptop MNL-LT-0142 sent a CRM export to a personal cloud-storage site, and it may still hold malware. A Manila IT engineer wants to reimage it straight away, to be sure the malware is gone. The Incident Response & Crisis Manager asks what the team does first. SITL-POL-014 (Policies › Policy Library) sets the first-hour checklist in Section 7.1 and how evidence is handled in Section 3.1.",
  "T8.1-D3":
    "INJ-5: the file held the names, mobile numbers and account numbers of 2,400 customers in the Philippines of a Manila bank client, unencrypted. GlobalConnect holds the data for the bank, as its processor. The investigation will take days. The DPO asks you when the authority must be told. SITL-POL-014 Section 6.3 (Policies › Policy Library) is rule R30 step by step.",
  "T8.1-D6":
    "An agent at Manila tells their team leader that they saw a suspicious e-mail yesterday and did not report it, because they did not know how, as the team leader of the tabletop's INJ-6 did. The Information Security Auditor is updating your tracker and asks which control's evidence the case shows to be weak. Each control's LI task page (Learn › Reference pages) says what it requires.",
  // T7.2: the Vendor / Third-Party Risk Analyst owns the task, the Privacy Compliance Analyst supports it (his Tasks sheet).
  "T7.2-D4":
    "Deskline Cloud, the SaaS ticketing tool of the Manila service desk, holds client customers' tickets. The Manila IT manager says his team patches every system the office uses; Service Delivery, which bought the tool, says Deskline looks after it. You are writing the cloud addendum, LI-CLD, for Deskline. Who secures what under each cloud service model is on Ref-Cloud (Learn › Reference pages).",
  "T7.2-D5":
    "Procurement is renegotiating an agreement with a supplier that will hold Manila's client customer data, and asks you, the Vendor / Third-Party Risk Analyst, which clauses it must not give up. The Group's clause checklist and what each clause must say are in SITL-POL-013 Section 6.3 (Policies › Policy Library).",
  // T9.1: the Security Architecture & Standards Manager owns the task, the Business Continuity & Resilience Analyst supports it.
  "T9.1-D2":
    "Photo P11 of your walkthrough shows a water stain on a ceiling tile above rack 3 of the Manila server room. The Business Continuity & Resilience Analyst confirms that the floor 13 staff kitchen is directly above, and that no water sensor is fitted in the room. You are recording the finding against one A.7 control in the tracker. What each control requires is on its LI task page (Learn › Reference pages).",
  "T9.1-D3":
    "IT's disposal log in SPR-10 shows that in March 2026 twelve old team-leader laptops, which had held client data, were given to staff to keep after a quick format. The Security Architecture & Standards Manager asks what A.7.14 would have needed before they left. The handling matrix of SITL-STD-001 Section 6 (Policies › Policy Library) sets how storage is cleared for each tier.",
  // T9.2: the Vulnerability Management Governance Analyst owns the task, the Security Architecture & Standards Manager supports it.
  "T9.2-D1":
    "On 30 November, while you test the SLAs, the Vulnerability Management Governance Analyst forwards a finding from outside your sample: a flaw on GlobalConnect's internet-facing customer portal that is listed in the CISA Known Exploited Vulnerabilities (KEV) catalogue, first detected on 20 November. It is not fixed and nobody has asked for an exception. She wants its status today, by the programme classification rule (rule R24, Ref-Test rules in Learn › Reference pages).",
  "T9.2-D4":
    "SPR-11 says Manila's backups run every night and every job completed, but no backup copy has been restored in a test in the last 12 months. The Manila IT manager says that since the backups run, A.8.13 can go in as done. SITL-POL-009 (Policies › Policy Library) sets how often a restore is tested in Section 4, and how in Section 6.2.",
  "T9.2-D5":
    "On the walk-through a Manila server administrator shows you that each server keeps its security logs for 7 days before they are overwritten, and that he can delete them himself. The Manila IT manager asks which control the finding belongs to, so that it goes on the right row of your tracker. What each control requires is on its LI task page (Learn › Reference pages).",
  // T5.2: the Compliance Manager owns the task, the CISO supports it (his Tasks sheet).
  "T5.2-D2":
    "Your Statement of Applicability for Manila lists all 93 Annex A controls. For A.8.30 Outsourced development, dataset SOA-93 records that Manila builds its customer portal in-house with its own developers and that no supplier writes code for it. The Compliance Manager asks what you record on the A.8.30 row before the SoA goes to the Org CISO. Rule L06 is in the step's note and in Learn › Rule tables.",
  "T5.2-D3":
    "The Org CISO will sign the Manila SoA, and the certification auditor reads it at Stage 1. Before you hand it in, the Compliance Manager asks which four things the SoA must hold to meet Clause 6.1.3 d). Clause 6.1.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T5.2-D4":
    "Your SoA's applicable controls and their sources are set. Before the SoA goes for approval, the Compliance Manager asks which other ISMS output the auditor will hold it against, control by control. Clause 6.1.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T5.2-D7":
    "Manila's information security objectives for 2027 are being drafted. The Org CISO's first list has three lines on it, and the Compliance Manager, who measures progress each quarter on the objectives dashboard (SITL-POL-001 Section 6.2), asks which one can be tracked as it is written. Clause 6.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  // T4.1: the Cyber Risk Manager owns the task, the Policy & Governance Analyst supports it (his Tasks sheet).
  "T4.1-D1":
    "Your method card is filled. Manila was last assessed in March 2026, and the next yearly run is booked for March 2027. Before the card goes to the Org CISO, the Cyber Risk Manager asks what Clause 6.1.2 b) requires repeated risk assessments to produce. Clause 6.1.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T4.1-D2":
    "The Manila risk register will give each risk its ID, statement, ratings and treatment. The Cyber Risk Manager is drafting its columns and asks who Clause 6.1.2 requires to be identified for each information security risk. Clause 6.1.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T4.1-D5":
    "In this sprint's walk-through, the Policy & Governance Analyst found that Sales, the client relationship managers at Manila, keep their pipeline of prospective clients in a cloud CRM subscription bought on a company card. It holds the names and e-mail addresses of contacts at client companies, and it is not in the Group Information Asset Register (Risk Register › Asset Register shows the Manila extract). What A.5.9 requires is on its LI task page, LI-A.5.9 (Learn › Reference pages).",
  "T4.1-D6":
    "The Quality Assurance team has exported the e-mail addresses of 4,000 end-customers from the CRM to send a satisfaction survey. The export's owner wants to label it Internal, because \"it is only e-mail addresses\". You check its tier against SITL-STD-001 (Policies › Policy Library): Section 2 sets the floors for regulated data, and Section 5 is the decision tree.",
  // T4.2: the Cyber Risk Manager owns the task, the Cyber Threat Intelligence Analyst supports it (his Tasks sheet).
  "T4.2-D3":
    "THR-5, this week's threat-intelligence brief from the Group's Cyber Threat Intelligence Analyst, reached the Org CISO on 26 October 2026 (dataset THR-5, on the step's Reference tab). Its item 2 reports that a flaw in the remote-access VPN product the Manila office runs is being actively exploited, and that the vendor has issued a fix. Manila's gateway runs the affected version, and nothing has happened there so far. The Cyber Risk Manager asks what the brief changes in your risk assessment. What A.5.7 requires is on its LI task page, LI-A.5.7 (Learn › Reference pages).",
  "T4.2-D4":
    "R-16-HQ-17, the client's weekly file on the legacy FTP server, scores above GlobalConnect's appetite of 11 (SITL-ERM-001 Section 4). The Chief Delivery Officer says moving the file onto the delivery platform must wait for the client's next release, due in January 2027, and asks for the risk to be accepted until then. The client account's team leader offers to sign the acceptance today, and you rated the risk yourself.",
  // T8.2: the Business Continuity & Resilience Analyst owns the task, the Privacy Compliance Analyst supports it (his Tasks sheet).
  "T8.2-D1":
    "Your BIA-RTO holds the full DR failover test of 13 June 2026: the CRM was back for agents 9 hours after the outage was declared, and the business impact analysis sets its RTO at 4 hours. Corporate IT's test report says the CRM was recovered and marks the test passed. The Business Continuity & Resilience Analyst asks what you record for A.5.30 in the tracker. What A.5.30 requires is on its LI task page, LI-A.5.30 (Learn › Reference pages).",
  "T8.2-D4":
    "The Org CISO wants an independent review of the Manila IT controls before the year end, for A.5.35. The Manila IT manager offers to do it, since he already checks those controls every quarter, and says a system administrator who knows the servers could do it instead. What A.5.35 requires is on its LI task page, LI-A.5.35 (Learn › Reference pages).",
  // T7.1: the Security Architecture & Standards Manager owns the task, the Information Security Auditor supports it.
  "T7.1-D3":
    "On Monday 16 November 2026 you hold SPR-06's leaver records against its account extract. An agent who resigned left on Friday 13 November at 17:00 UTC. The Group IAM disabled her directory account 40 minutes later, but her account on the WFM, which has its own sign-in and can be reached from home, is still active. Her team leader says it is harmless now that she has gone, and that the WFM administrator tidies up leavers' accounts every week. SITL-POL-006 is in Policies › Policy Library.",
  "T7.1-D4":
    "On one client's account, five after-hours agents sign in to a single CRM account named \"support\" to work the overnight queue. The CRM administrator created it in 2025 so that the night shift could pick up the queue without signing in and out at handovers. The operations manager asks whether A.5.16 lets the team keep it. What A.5.16 requires is on its LI task page, LI-A.5.16 (Learn › Reference pages).",
  "T11.1-D1":
    "The Org CISO wants Manila's measurement set up before the certification audit. Your gap analysis (GAP-25) rated Clause 9.1 short: the office files the Group's quarterly KPI reports, and nobody reviews them or acts on them. The Compliance Manager asks what Clause 9.1 requires the office to decide before a single measure card is written. Clause 9.1 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T11.1-D2":
    "The Manila IT team offers its own patch figure as the A.8.8 measure: each month one of them looks at the patch console and estimates the share of critical patches that look done. For October two team members gave 85% and 70%. The Compliance Manager asks what a measurement method must produce before its results can go on the dashboard. Clause 9.1 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T11.1-D3":
    "Your five measure cards are written. The Org CISO will tell the management review which Manila controls have reached Level 4, and asks what she can show as evidence of Level 4 rather than Level 3. The Maturity Model is in Learn › Reference pages (Ref-Maturity Model).",
  // T5.1: the Cyber Risk Manager owns the task, the CISO supports it (his Tasks sheet).
  "T5.1-D2":
    "In sheet Controls, the Head of Infrastructure's treatment workshop proposed controls for R-16-HQ-16, the exploited VPN gateway. One of those you need is taken from the NIST Cybersecurity Framework, and when you compare it with Annex A you find no Annex A control that covers it. The Cyber Risk Manager asks whether it can stay in the plan. Clause 6.1.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T5.1-D3":
    "LI-RTP is nearly ready: each of your three risks has its option, its controls and a named owner. Before it goes to the Org CISO, the Cyber Risk Manager asks you who must sign it off, and who accepts the risk that is left once the treatment is done. Clause 6.1.3 is summarised in the Framework Quick Reference, which you read in step 4.",
  // T12.1: the Compliance Manager owns the task, the CISO supports it (his Tasks sheet).
  "T12.1-D2":
    "Your check of ACT-TRACKER is done. One of the action owners asks why an action whose fix is in place is still Open in ACT-UPD, and says closing actions fast is what management wants to see. The Compliance Manager asks you to say, before the corrective-action procedure goes into the management-review pack, what corrective action must do besides the fix. Clause 10.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T12.1-D4":
    "The Org CISO is drafting the agenda and the minutes template for the first management review of the Manila ISMS, which top management will chair. Sheet Inputs of LI-MR lists what goes in. The Org CISO asks you what the minutes must record coming out, so that the certification auditor finds it. Clause 9.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  // T12.2: the Information Security Auditor owns the task, the CISO supports it (his Tasks sheet).
  "T12.2-D1":
    "GlobalConnect Customer Solutions has booked its certification body for the Stage 1 audit of the Manila ISMS on 8 and 9 February 2027: after the first internal audits, in January, and the management review of 14 January, as the readiness check (T12.1) asked. Before you brief management, the Org CEO asks what the auditor will mainly look at in Stage 1, so that the office prepares the right things. The Information Security Auditor wants your answer to match Ref-Certification card (Learn › Reference pages).",
  "T12.2-D2":
    "The Org CEO has to put the certification audits into the budget, and asks how long the certificate lasts and what is audited after the first certificate is issued. Your answer opens LI-CERT, your briefing for management. Read it on Ref-Certification card (Learn › Reference pages).",
  "T12.2-D4":
    "The first internal audits ran in January 2027 and the management review met on 14 January; the Stage 1 audit followed on 8 and 9 February. Its report of 12 February records NC-1, graded minor (dataset AUD-FINDING): no internal audit held before Stage 1 covered A.8.32 Change management, though CHG-TEST found the change process not effective. Stage 2 is booked for 12 April 2027. The Information Security Auditor, who owns the programme, asks how you will respond. Rule L25 sets how an audit finding is answered.",
  // T11.2: the Information Security Auditor owns the task, the Compliance Manager supports it (his Tasks sheet).
  "T11.2-D1":
    "Your draft audit programme for the Manila ISMS is on the Information Security Auditor's desk. The Cyber Risk Manager, who runs the Manila risk assessment and keeps its risk register, has seen it and offers to audit the risk rows next spring: they know the Group method best, and the auditor's diary is full. The Information Security Auditor asks who may audit the risk management process before the programme goes to the Compliance Manager. Clause 9.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  // T6.1: the Security Awareness & Training Specialist owns the task, the Policy & Governance Analyst supports it (his Tasks sheet).
  "T6.1-D2":
    "Sheet Competence shows several Manila role holders whose qualifications are on their CVs but not on file. Manila HR is drafting the list of what it keeps for the people in ISMS roles, and the HR lead asks you what ISO/IEC 27001 requires the organisation to retain under Clause 7.2 before the list is signed off. Clause 7.2 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
  "T6.1-D3":
    "Manila's induction session for new agents covers badge access and the ticketing tool. In the Org CISO's spot check, four of ten agents could not say where to report a suspicious call. The Security Awareness & Training Specialist is rewriting the session and asks you what Clause 7.3 says people working for GlobalConnect must be aware of. Clause 7.3 is summarised in the Framework Quick Reference (Learn › Framework Quick Reference).",
};

// In the learner's organisation names (lib/desk/names.ts).
localizable(DECISION_CONTEXT);
