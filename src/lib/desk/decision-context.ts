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
    "Files in your 01_Inputs folder are read-only: they stay as you received them, so to work on a dataset you make a working copy. This one holds customer names and e-mail addresses, made up for you alone. In BKB-STD-001 (Policies › Policy Library) customer data is Tier 3, Confidential, and its Section 6 handling matrix says how Tier 3 data is kept.",
  "F1.2-D2":
    "GlobalConnect has four offices: Manila, the head office, and regional offices in Warsaw, Phoenix and Cape Town. BKB-ADD-16 Section 2 gives each office one row: its data-protection law, its authority and its sector laws. Column E of your map records the offices each standard applies to, and later tasks decide applicability from it.",
  "F1.2-D3":
    "Column G, Evidence ref, records where a row's values came from. This map is the first page of the obligations register: the register and the crosswalk are built on it in week 3, and its review is automated, with assessors checking a sample. The Group's definition of an evidence ref is in Learn & Grow › Glossary.",
  "F1.3-D1":
    "Section 4 of the context brief is headed “Mission Critical assets”. The asset register rates every asset of an office; for Manila, BKB-ADD-16 Section 8 counts 10 Mission Critical, 41 Business Critical, 29 Standard / Operational and 1 Non-Critical. A colleague notes that some of the Business Critical assets hold customer data.",
  "F1.3-D2":
    "CTX-IP records who has an interest in GlobalConnect and what each of them needs, one party per row: a Party column, and a Requirement column next to it (rule R04). Its rows become obligations in the register in week 3. A draft from a colleague lists three entries, all in the Party column.",
  "F1.3-D3":
    "Template T-CTX has four fixed sections on one page, labelled “Internal”: it is what a new team member, an auditor or a board member reads first about the office. Your draft runs to one and a half pages. A human assessor reads it at checkpoint HC1.",
  "F2.1-D2":
    "Facilities keeps an office seating plan: a floor map with the name of each member of staff at their desk. It is for use inside the office and has not been approved for public release. Facilities wants to give it the lowest tier the Group's rules allow, and asks you which that is.",
  "F2.1-D3":
    "A partner organisation working with GlobalConnect needs a file classified Tier 3, Confidential. The file has to leave GlobalConnect to reach them, and you are the one sending it. How information may travel depends on its tier.",
  "F2.2-D2":
    "You are checking evidence items for the Information Security Auditor, who will rely on your results file in the audit. Halfway through one item you see that it shows a password in plain text. The auditor still needs a decision on the item, and your results file is open beside it.",
  "T3.1-D1":
    "Your two rows copy each office's breach-notification cell from BKB-ADD-16 Section 2, as written. Every row of the obligations register must be one thing someone must do, with its own owner, evidence and deadline. Before the rows get owners, you read what each sentence asks for, starting with a line of addendum text.",
  "T3.1-D2":
    "So far every row of your register comes from a law or a regulator: BKB-ADD-16 Section 2, Section 2.1 and Section 6. GlobalConnect also works under customer contracts, and Organization_Profiles lists what its customers and partners require of it. One customer's contract requires an ISO/IEC 27001 certificate.",
  "T3.1-D3":
    "Every row of the register needs an owner role: the role accountable for meeting the duty, which is who an auditor or a regulator will ask. You are filling it in for the breach-notification rows.",
  "T3.2-D3":
    "Your crosswalk has rated each requirement Full, Partial or None. A row rated Partial or None gets a gap sentence in its own column. MAP-XW goes on to T4.1, where the gaps are tested, and checkpoint HC2 scores it; whoever reads it next has to act on each gap without coming back to you. You have three drafts for one of the Partial rows.",
  "T3.2-D7":
    "In the Statement of Applicability every Annex A control is marked Applicable or Not applicable, with a justification. LearnTech's risk treatment plan names, for each risk, the Annex A controls that treat it. Running a consistency check on a draft SoA, you see A.8.28 Secure coding marked Not applicable, while a treatment in the risk register uses A.8.28.",
  "T4.1-D5":
    "LI-POL's last sheet is a RACI of GlobalConnect's ten ISMS processes, with exactly one Accountable (A) role on each row. One row is the Statement of Applicability: every Annex A control, whether it applies and why, which the certification auditor tests against the risk treatments. The BKB Group GRC Charter (Policies › Policy Library) sets out the three lines in Section 5.2 and who may approve what in Section 17.",
  "T3.1-D4":
    "Your register's clocks come from BKB-ADD-16 Section 2. The Group's statutory notification matrix, BKB-ERM-001 Annex A, gives a clock for each of 51 countries too, and the addendum notes that its own entries were compiled from public sources and must be validated by local counsel. For one country, the addendum says 72 hours and Annex A says 48 hours.",
  "T4.2-D1":
    "You are writing LearnTech's SOP for approving a new cloud service, and every time limit in it must come from a source document: BKB-POL-021, the Group policy whose procedure it carries out, or BKB-ADD-36, LearnTech's addendum. A reviewer will trace each time limit in your SOP back to one of the two. BKB-POL-000 Section 5 (Policies › Policy Library) says how an addendum stands against a Group policy.",
  "T4.2-D3":
    "By rule R14 the sixth step of every SOP is its exception path: what staff do when the normal steps cannot be followed. A reviewer tests your SOP with a case: the cloud posture tool (CSPM) flags a critical misconfiguration in an approved service, the vendor's access to LearnTech's tenant must be removed now, and the business owner who approved the service is on leave.",
  "T4.2-D4":
    "Before your SOP is published on the policy portal, its document-control block needs a classification label. The SOP names roles, time limits and where approvals are recorded; it holds no personal data, no client information and no keys or credentials. BKB-STD-001 gives the tier (Section 3, and the decision tree in Section 5), and BKB-ADD-36 Section 7 LearnTech's label for each tier.",
  "T5.1-D3":
    "You are preparing the evidence request list for GlobalConnect's ISO/IEC 27001:2022 surveillance audit, and every request needs a due date. Before you date your own, the Compliance Manager gives you a practice case: an audit whose fieldwork starts on Tuesday 3 March. Rule R16 dates each request from the fieldwork start, in working days, Monday to Friday.",
  "T5.1-D4":
    "Control owners send their evidence to you, and the auditor tests each file against the acceptance criteria written on its request. The owner of C15, security incident logging, asks what they can send to show the control worked through the audit period. What you accept now is what the auditor sees on day one of fieldwork.",
  "T5.1-D6":
    "You are drafting a briefing for GlobalConnect's management on how ISO/IEC 27001 certification works. They want to budget audit days for each year of a certificate's life, starting from the initial certification. The Ref-Certification card (Learn › Reference pages) sets out the cycle.",
  "T5.1-D7":
    "Management will choose the certification body for the next certification cycle from three candidates, and asks you which point to compare first. The Ref-Certification card (Learn › Reference pages) lists the criteria for choosing one.",  "T6.1-D3":
    "You are writing the test memo for the user access review of Mitratech TeamConnect. Each exception in it carries the action the IAM team and the control owner will take. The Information Security Auditor asks how your memo would treat the case the programme rates most serious, should a test find it: a leaver's account still active, with a login after the termination date.",
  "T6.2-D3":
    "You are reconciling LearnTech's leavers against the disable logs of its systems. One leaver's account was not disabled on time, and the system's sign-in history shows it was used two days after the leaver left. LVR-REC records what is done about each such account. BKB-POL-006 Section 6.3 (Policies › Policy Library) is the Group's leaver procedure.",
  "T7.1-D5":
    "You keep the Manila office register up to date: every change is applied with the same method, rule R07 (Learn › Rule tables), and recorded field by field in the change log. Before you apply events C1 and C2, the Cyber Risk Manager tests you on a simpler one: the identity team reports that phishing-resistant MFA is now rolled out to 100 % of staff, with the identity provider's report as evidence.",
  "T7.1-D6":
    "RR-NOTE goes to the Regional Managing Director, who owns the office register. Besides the new and changed risks, it has a part for the risks above appetite: the ones that need a decision from the Director and the authorities above. BKB-ERM-001 Section 4 (Policies › Policy Library) sets the appetite for each criticality band; GlobalConnect is a LOW-criticality organisation.",
  "T7.1-D8":
    "Each chain in LI-CHAIN ends in a control, and each new risk has a treatment option under rule L12. The owner of a data-breach risk proposes to treat it only by buying cyber insurance, and asks you to record the risk as treated.",
  "T7.2-D1":
    "You are preparing the semi-annual board report for the Manila office: five risks from the updated register, ranked, for a board that has minutes for them. Ranking by residual score leaves ties. Before you rank your own register, the Cyber Risk Manager gives you two risks at the same residual score, 12, one with an inherent score of 16 and the other of 20. Rule R23 (Learn › Rule tables) is the Group's ranking rule.",
  "T7.2-D3":
    "Each of the five risks in the board table gets one line saying why it matters. The Regional Managing Director presents the table to the board, which uses it to decide which risks need its attention.",
  "T7.2-D4":
    "One risk of the register will be carried knowingly: an acceptance request goes to the authority who may approve it, with the date its acceptance ends. Before you fill your own, the Cyber Risk Manager asks you to date one that starts on 1 November 2026. Rule R23 (Learn › Rule tables) sets how acceptances are dated.",
  "T7.2-D6":
    "Your Lead Implementer card records how GlobalConnect assesses risk, and the plan you draft later sets ISMS objectives for clause 6.2 of ISO/IEC 27001. Top management will review the objectives at each management review. The CISO shows you three objectives proposed by department heads.",
  "T8.1-D5":
    "Your test memo for LearnTech's Amsterdam office ends with three recommendations, and management will act on the first one first. Before you write yours, the Vulnerability Management Governance Analyst asks how you would order them after a test in which most breaches were Critical or KEV-listed findings on internet-facing assets: the policy's 7-day class.",
  "T8.1-D6":
    "LI-KPI, the measure card, turns your SLA compliance figure into a measure taken every month. The vulnerability team collects the scanner data, and the GRC team analyses it into the per-class figures. The card must also name who evaluates the result: who judges it against the target, as ISO/IEC 27001 clause 9.1 asks each organisation to decide.",
  "T8.2-D4":
    "Your test memo for LearnTech's Amsterdam office ends with a recommendation, and the control owner will act on it. Before you write yours, the Information Security Auditor gives you a case from another control test, of change management: two changes in the sample were implemented before they were approved, where the policy requires approval first.",
  "T8.2-D6":
    "LI-NCR records two kinds of action, as ISO/IEC 27001 clause 10.2 asks: a correction and a corrective action (its fields in step 8). Before you fill your own, the Information Security Auditor gives you an example from a change-management test: a change was implemented without approval.",
  "T9.1-D2":
    "You have tiered Lumen Learner Analytics with rule R35 in step 2. VEN-Q, the security questionnaire LearnTech will send Lumen, is drawn from the 17 questions of Ref-Questions (Learn › Reference pages), each marked with the tier it is included from, Low to Critical. Lumen has to answer every question you send, and you have to review every answer.",
  "T9.1-D3":
    "Lumen Learner Analytics would receive data on learners served by LearnTech's Amsterdam office, where GDPR applies (BKB-ADD-36 Section 2). Its intake form (Vendors › Vendor Intake) gives the hosting location as the United States. VEN-CL, the checklist LearnTech's contract with Lumen is drafted from, starts from the clauses Ref-Clauses lists by tier.",
  "T10.1-D1":
    "You are starting LearnTech's RoPA entry for its corporate LMS, which companies buy to train their own employees. Under each client's LMS service agreement and its data processing agreement, LearnTech enrols the employees the client names, runs the courses the client assigns and erases the records when the contract ends. BKB-POL-017 Section 3.2 (Policies › Policy Library) says what each data-protection role means.",
  "T10.2-D4":
    "It is the morning after INC-2610-3001 was discovered. Marketing has drafted the notice to the schools and families whose students' records were taken, and wants it sent this afternoon so that they hear it from LearnTech first. BKB-POL-014 Section 6.1 (Policies › Policy Library) sets out how notifications are made.",
  "T11.1-D1":
    "You are assembling the four-week awareness campaign on “MFA fatigue and push-bombing” for Regional Compliance & Legal at LearnTech's Amsterdam office. The micro-lesson opens with a scenario card: a short situation staff recognise from their own day, which the lesson's behaviours and quiz then build on. The Group's cards are in its content bank, Awareness › Content Templates.",
  "T11.1-D2":
    "AWR-SIM, the phishing simulation plan, is ready to send: in week 3 the team receives a fictional sign-in alert, and the platform records, for each person, whether they clicked it or reported it. Nothing may be sent before the approvals are on file. Rule R31 (Learn › Rule tables) says who approves a simulation; BKB-ADD-36 Section 2.2 (Policies › Policy Library) lists the employee bodies of each LearnTech office.",
  "T11.1-D3":
    "AWR-SIM ends with the metrics the campaign will be judged on, and the results are reported to all staff in the campaign's last week. The Security Awareness & Training Specialist asks which single measure would show that the Amsterdam team is actually learning, rather than that the campaign was busy.",
  "T11.1-D4":
    "The Cyber Risk Manager reports that the Amsterdam risk owners rate the same risk differently: one scores a phishing risk 4 × 4, another 2 × 3, on the same facts. Clause 7.2 of ISO/IEC 27001 asks the organisation to make sure the people in its ISMS roles are competent, and LI-COMM's competence matrix records how.",
  "T11.1-D5":
    "LearnTech's information security policy has been re-issued, and every member of staff must read it and attest. LI-COMM's communication plan names, for each ISMS communication, who sends it. The CISO's team has drafted the announcement and asks who should put their name to it.",
  "T11.2-D1":
    "The Compliance Manager has asked you for a regulatory change brief on the EU Digital Services Act guidelines on the protection of minors online (2025). This month's monitoring has turned up several items on the topic. The brief records where each of its facts comes from, and LearnTech's policies and obligations register will be changed on the strength of it.",
  "T11.2-D2":
    "The Commission's full guidelines are a long document: why they were written and whom they cover, the risks children face online, the measures for platforms, and what the Commission will do next. The brief has two pages, and its “What we must do” section holds at most eight lines, each of which becomes an obligation in LearnTech's register.",
  "T11.2-D5":
    "Once a change is logged, the Compliance Manager assesses its impact: which obligations, policies and controls it touches. BKB-POL-016 (Policies › Policy Library) sets how long that may take, and rule R32 (Learn › Rule tables) dates the brief's actions the same way. Take a rule published on 1 October.",
  "T12.1-D4":
    "ACT-MRI, the management-review input, goes to the CISO's management review on Thursday. The HR learning lead calls about A-12, the awareness module for new joiners: it is two days past its due date, the fix goes live next week, and they ask you to keep it off the page. “It is almost done.”",
  "T12.1-D5":
    "Reading down ACT-UPD's Issue column, you notice the same words on several actions: raised weeks apart, from different tests, some of them closed and verified, some still open. The tracker goes to the management review with the action status.",
  "T12.1-D6":
    "LI-MR's three-year programme (clause 9.2) names, for each process, who checks it; the certification auditor will read it. Access control is run day to day by the IAM team under the IAM manager, on a system an outside vendor supplies and supports. You are filling in the auditor for the access-control process.",
  "T12.2-D1":
    "The certification body's surveillance audit of GlobalConnect has begun in Manila. Request R-1 asks for supplier security assessments for new suppliers, under control A.5.19. The repository holds two files for it, both system exports with the same description: one is dated inside the audit period, the other before it, and it is the fuller of the two.",
  "T12.2-D3":
    "Request R-3 asks for awareness training completion records over the audit period, and no file in the repository qualifies. You tell the control's owner. Within minutes they reply that they can “create the record now” and send it before the auditor's afternoon session.",
  "T12.2-D5":
    "NC-1 is in the auditor's findings: “Control A.8.32 did not operate during the period.” The Information Security Auditor asks you to draft LI-NCR-R, the clause-based finding response GlobalConnect files against NC-1. The certification body keeps the response with the finding, and reads the two together.",
  "T12.2-D6":
    "Not NC-1, which you have answered: suppose GlobalConnect challenges a finding with its evidence row, and at the closing meeting the auditor keeps the finding in the report as written. The Compliance Manager still holds that the evidence answers it, and asks what GlobalConnect does next.",
};
