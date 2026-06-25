// Branching, pre-scripted Request-verb conversations (no role-agent / no LLM).
//
// Each entry is keyed by `${taskCode}/${activityCode}` and drives the RequestWorkspace:
//   1. the mentee composes a request (compose-with-assists),
//   2. a deterministic Layer-1 quality scorer (routeMood) picks a stakeholder MOOD,
//   3. the matching scripted thread runs as a multi-turn pick-1-of-3 conversation.
//
// Stakeholder replies are STATIC scripts (no AI). Exactly one option per round "meets the
// objective" and advances; the other two are "garbage out" → coaching + retry.
//
// Source of truth for the first three: Request_Verb_Task_Register_v5.xlsx (AA-001, TV-002,
// TPRM-002). The remaining ~13 Request activities are authored in the same shape.

export type MoodId = "cooperative" | "vague" | "defensive";

export interface ConvOption {
  id: "A" | "B" | "C";
  /** The mentee's selectable reply. */
  text: string;
  /** Exactly one option per round is correct (advances the thread). */
  correct: boolean;
  /** RA-MENTOR coaching shown when a wrong option is picked. */
  coaching?: string;
}

export interface ConvRound {
  /** The 3 mentee replies for this decision point (one correct). */
  options: ConvOption[];
  /** Stakeholder reply revealed after the correct pick. Omit on the final round. */
  stakeholderNext?: string;
}

export interface ConvThread {
  mood: MoodId;
  /** Why a composed request lands in this mood — shown to the mentee for transparency. */
  routedBecause: string;
  /** S1 — the stakeholder's first reply to the opening request. */
  opener: string;
  /** Speaker label for the stakeholder bubbles in this thread. */
  speaker: string;
  initials: string;
  rounds: ConvRound[];
  /** ✓ Objective met (final correct pick). */
  metEnd: string;
  /** ✗ Garbage out — coaching + retry. */
  missEnd: string;
}

export interface RequestConversation {
  /** Default recipient for the "To" field (pre-set per engagement). */
  recipient: string;
  /** Default subject seeded into the composer. */
  subject: string;
  /** Default purpose seeded into the composer. */
  purpose: string;
  /** The correct items to request — these are what a scoped request should include. */
  suggestedItems: string[];
  /** Plausible-but-wrong distractor items, mixed into the picker. Selecting these is a mistake. */
  wrongItems: string[];
  threads: Record<MoodId, ConvThread>;
}

/* ───────────────────────── Mood routing (deterministic, no AI) ───────────────────────── */

const VAGUE_WORDS = [
  "everything", "anything", "whatever", "all your", "all of your", "full export",
  "asap", "urgent", "as much as", "whatever you have", "some evidence", "whatever you can",
  "all the", "every server", "all device", "all your internal",
];

export interface MoodResult {
  mood: MoodId;
  reason: string;
  /** Wrong/distractor items the mentee included (shown back to them as a mistake). */
  wrongSelected: string[];
  /** Correct items the mentee left out (shown back to them as a miss). */
  missed: string[];
}

/**
 * Decide the stakeholder's mood from the selected items, deterministically (no AI).
 * - Any wrong item included, or over-broad phrasing → defensive
 * - All the correct items requested, nothing wrong   → cooperative
 * - Some correct items missing (but nothing wrong)   → vague
 */
export function routeMood(input: {
  subject: string; purpose: string; items: string[];
  correctItems: string[]; wrongItems: string[];
}): MoodResult {
  const text = `${input.subject} ${input.purpose} ${input.items.join(" ")}`.toLowerCase();
  const hasVague = VAGUE_WORDS.some((w) => text.includes(w));
  const selected = input.items.map((i) => i.trim()).filter(Boolean);
  const wrongSelected = input.wrongItems.filter((w) => selected.includes(w));
  const correctSelected = input.correctItems.filter((c) => selected.includes(c));
  const missed = input.correctItems.filter((c) => !selected.includes(c));

  if (wrongSelected.length > 0) {
    return { mood: "defensive", reason: "You asked for items that are out of scope or irrelevant — the stakeholder gets guarded and pushes back.", wrongSelected, missed };
  }
  if (hasVague) {
    return { mood: "defensive", reason: "Over-broad phrasing (e.g. “everything / full export”) reads as an unscoped demand — the stakeholder gatekeeps.", wrongSelected, missed };
  }
  if (missed.length === 0 && correctSelected.length >= 3) {
    return { mood: "cooperative", reason: "Clear, complete request — every key item, nothing extraneous. The stakeholder engages cooperatively.", wrongSelected, missed };
  }
  return { mood: "vague", reason: "Your request leaves out some of the key items, so the stakeholder's reply is hesitant and partial.", wrongSelected, missed };
}

/* ─────────────────────────────── Authored conversations ─────────────────────────────── */

export const REQUEST_CONVERSATIONS: Record<string, RequestConversation> = {
  /* ════════════ AA-001 · Information Asset Inventory — Step 1.1 ════════════ */
  "AA-001/1.1": {
    recipient: "IT / Operations Manager",
    subject: "Request: System & Application Inventory for Asset Register (ISO 27001 A.5.9)",
    purpose:
      "To build the Information Asset Register for the assigned business unit, I need the current inventory of systems, applications and data repositories so each asset can be identified, owned and classified under ISO 27001 Annex A 5.9 / 5.12.",
    suggestedItems: [
      "Current list of business applications & SaaS platforms used by the assigned business unit",
      "Inventory of servers, databases and data repositories (on-premises and cloud)",
      "List of end-user device types and shared network / file stores",
      "Most recent network or application architecture diagram (if available)",
    ],
    wrongItems: [
      "Every employee's individual login passwords and credentials",
      "The full HR payroll file for the business unit",
      "Source code for all internally-developed applications",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "IT / Operations Manager",
        initials: "IT",
        opener:
          "Hi — thanks for the clear request, happy to help with the asset register. Here's what I can get to you today:\n• Application & SaaS list: I'll export our current app catalogue from the service desk — about 40 active apps for your business unit.\n• Server & database inventory: I'll pull the CMDB extract (on-prem hosts plus our AWS/Azure resources).\n• End-user devices & shared stores: standard Windows laptops, a few macOS for the design team, plus the shared 'Finance' and 'Projects' network drives.\nI've also got a network diagram from our last audit — slightly dated but useful. I'll drop everything in the shared folder by end of day. Anything you want me to prioritise?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks, this is really helpful. Could you flag which apps have no listed owner so I can record them as ownership gaps, and confirm whether the AWS export includes data classifications? I'll prioritise the customer-facing systems." },
              { id: "B", correct: false, text: "Great, that's everything I need, thanks.", coaching: "They flagged unowned assets — that's a finding to chase, not wave past." },
              { id: "C", correct: false, text: "Can you also send me the whole company's inventory while you're at it?", coaching: "Stay scoped to your assigned unit." },
            ],
            stakeholderNext:
              "Good question. On ownership — most apps map to a business owner in the catalogue, but a handful of the smaller SaaS tools don't, so flag those when you spot them. The AWS inventory is tagged by environment (prod/dev) so you can filter it. Want me to add the SaaS contract owners too? I can pull those from Procurement.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Perfect — please share the Procurement contact for the SaaS owners. I'll record the unowned apps as remediation items and bring the draft register to my mentor for review before sign-off." },
              { id: "B", correct: false, text: "I'll just leave the unowned apps blank for now.", coaching: "Unowned assets are exactly what the register must surface." },
              { id: "C", correct: false, text: "Don't worry about owners, classification doesn't really matter at this stage.", coaching: "Classification is the whole point of the task." },
            ],
          },
        ],
        metEnd: "Objective met. The reply (system/asset list + flagged ownership gaps) is captured to your asset-discovery working file and feeds Step 3 (Record).",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "IT / Operations Manager",
        initials: "IT",
        opener:
          "Hi. Yeah, we have most of that somewhere. The app list is probably in the service desk, though I'm not sure it's fully up to date. Servers — some are on-prem, a lot moved to cloud, you'd have to check with the infra team for the exact list. I can try to dig out a diagram but no promises it's current. When did you need this by?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "No problem — let's pin it down. Could you send the service-desk app export as-is, and give me the name of the infra contact for the server list? I need it by Friday; I'll verify currency myself and flag anything stale." },
              { id: "B", correct: false, text: "Okay, whenever you get a chance is fine.", coaching: "No deadline or specifics means you'll keep getting nothing usable." },
              { id: "C", correct: false, text: "If you're not sure, just send me whatever and I'll figure it out.", coaching: "'Whatever' is garbage in — define what you need." },
            ],
            stakeholderNext:
              "I mean… I can ask around. There are a few shared drives floating about that aren't really documented, so the 'official' list might be missing some. I'll send what I have and you can chase the rest with the team. Was there a specific system you were worried about?",
          },
          {
            options: [
              { id: "A", correct: true, text: "That works — please send what you have plus the infra contact, and I'll record the undocumented shared drives as a gap to follow up. My priority is the customer data stores." },
              { id: "B", correct: false, text: "Sure, I'll chase the rest myself somehow.", coaching: "Vague follow-through means the gaps never close." },
              { id: "C", correct: false, text: "Never mind, I'll just put down what I can guess.", coaching: "Guessing the inventory defeats the entire exercise." },
            ],
          },
        ],
        metEnd: "Objective met — partial data plus documented gaps captured. Feeds Step 3 (Record). Next time, lead with named items and a deadline to get a cleaner reply first time.",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Poor / over-broad request → Defensive thread.",
        speaker: "IT / Operations Manager",
        initials: "IT",
        opener:
          "Before I send anything — can you confirm who authorised this and what it's for? A full inventory of our systems and data stores is sensitive and I'd want sign-off from the department head before sharing it. I can give you high-level categories now, but the detailed server and repository list will need approval. What's the deadline, and who's sponsoring this?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — this is for the ISO 27001 asset register for [business unit], supervised by my mentor [name]. I only need that unit's assets, not the whole estate. Happy for them to confirm in writing; could you share the high-level categories now while that's arranged?" },
              { id: "B", correct: false, text: "It's fine, you can trust me, I'm part of the GRC programme.", coaching: "Assertions of trust don't satisfy a need-to-know control." },
              { id: "C", correct: false, text: "I'll just tell my manager you're refusing to cooperate.", coaching: "Escalation goes through your mentor, not as a threat." },
            ],
            stakeholderNext:
              "I hear you, but I'm not comfortable handing the architecture diagram to someone on a rotation without a confirmed need-to-know. If your mentor or the department head confirms in writing, I'll release it. Until then I can only describe the environment at a high level.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Completely fair. I'll get my mentor to confirm the need in writing and copy the department head. In the meantime the high-level categories are useful — thank you. I'll follow up once sign-off is through." },
              { id: "B", correct: false, text: "Forget the diagram then, I'll manage without it.", coaching: "Don't abandon required evidence — pursue the approval." },
              { id: "C", correct: false, text: "This is ridiculous, it's just an asset list.", coaching: "Dismissing a control gets you nowhere and burns the relationship." },
            ],
          },
        ],
        metEnd: "Objective met — evidence released via the correct channel (need-to-know + written sign-off). Feeds Step 3 (Record). A scoped opening request would have avoided the gatekeeping.",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ TV-002 · Policy Compliance Spot-Check — Step 3 ════════════ */
  "TV-002/3": {
    recipient: "IT Manager + HR Business Partner",
    subject: "Request: Evidence Samples for Policy Compliance Spot-Check",
    purpose:
      "To complete a desk-based compliance spot-check against the Acceptable Use, Remote Working and Clean Desk policies, I need evidence samples to test whether the controls are operating in practice (ISO 27001 Annex A 5.36).",
    suggestedItems: [
      "Latest security awareness training completion report (last 12 months)",
      "Policy acknowledgement log showing staff sign-off for the AUP, Remote Working and Clean Desk policies",
      "Endpoint management console export showing device encryption / patch compliance",
    ],
    wrongItems: [
      "A named list of every employee who has ever breached a policy, for disciplinary use",
      "Copies of staff personal emails so you can check their behaviour",
      "The complete HR file (salary, performance reviews) for all staff",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "HR Business Partner / IT Manager",
        initials: "HR",
        opener:
          "HR Business Partner: Hi — glad to help with the spot-check. On the two HR items:\n• Training completion: I'll export the last 12 months from the LMS — current completion is around 88% for the news-desk team.\n• Policy acknowledgement log: AUP and Clean Desk sign-offs are in the HR system; Remote Working acknowledgements are a separate form, I'll send both. A few contractors may be missing from the Remote Working log. You'll have these tomorrow morning.\n\nIT Manager: Hi — for the endpoint item I'll pull the console export showing encryption and patch status for the in-scope machines. Heads up: about 6% of devices are behind on patches this cycle, so you'll see those flagged. Sending the CSV shortly.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks both. HR — since contractors onboard via the agency, can you confirm whether their Remote Working acknowledgements sit with the vendor? I'll log it as a finding either way. IT — could you also send last month's export so I can show a patch trend?" },
              { id: "B", correct: false, text: "Great, I've got what I need from both of you, thanks.", coaching: "The contractor gap is the kind of thing a spot-check exists to find." },
              { id: "C", correct: false, text: "Can you just tell me who's failing so I can name them in the report?", coaching: "A control spot-check tests the control, not individuals." },
            ],
            stakeholderNext:
              "HR Business Partner: Good catch. The contractor gap is because they onboard through the agency, not our HR system, so their acknowledgements sit with the vendor — I'd note that as a finding. I can request the agency's records if you want them included.\n\nIT Manager: Sure — the export is point-in-time. If you want a trend I can send last month's too, so you can see whether patching is improving or slipping.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Please do request the agency records — I'll mark the contractors as an open gap pending that. I'll calculate the compliance rate per policy from the samples and review with my mentor before reporting." },
              { id: "B", correct: false, text: "I'll just mark the contractors as compliant to keep it simple.", coaching: "Marking unverified staff compliant is fabricating evidence." },
              { id: "C", correct: false, text: "Actually, let's skip the agency records, it's too much effort.", coaching: "The biggest gap is the one worth chasing." },
            ],
          },
        ],
        metEnd: "Objective met — evidence samples plus a documented contractor gap captured to the control-testing folder. Feeds Step 4 (Evaluate).",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "HR Business Partner / IT Manager",
        initials: "HR",
        opener:
          "HR Business Partner: Hi. Training records… we do have them in the LMS but I'm not the system owner, so I can give you a rough completion number rather than a clean export. The acknowledgement logs — some are digital, some were paper at induction, so it might not be complete. I'll see what I can put together.\n\nIT Manager: The endpoint console can export something, yeah. Patch status is a bit messy right now because we're mid-migration, so the numbers might not be fully reliable. I'll send it but take it with a pinch of salt.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood. HR — could you point me to the LMS owner for a clean export, and confirm which acknowledgements are digital vs paper so I can scope the sample? IT — please send both the old and new tool exports so I can combine them; I'll note the migration as a coverage caveat." },
              { id: "B", correct: false, text: "Okay, just send whatever you can and I'll work with it.", coaching: "Untested 'whatever' can't support a compliance conclusion." },
              { id: "C", correct: false, text: "If the data's messy, I'll just estimate the compliance rates.", coaching: "Estimating rates with no evidence invalidates the test." },
            ],
            stakeholderNext:
              "HR Business Partner: I'm not sure the paper ones were ever scanned in, to be honest. You might just have to note that as a gap — I don't want to give you a number I can't stand behind.\n\nIT Manager: The migration's the problem — half the fleet is on the new tool, half on the old, so a single export won't cover everyone. You'd have to combine two reports and I'm not sure I'll get to that this week.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's fair — I'll record the paper acknowledgements and the split fleet as scope limitations, test the sample we do have, and recommend the LMS/endpoint data be consolidated. Could you each send what's reliably available by Friday?" },
              { id: "B", correct: false, text: "No worries, I'll just base it on the digital records only and not mention the rest.", coaching: "Undisclosed scope gaps make the report misleading." },
              { id: "C", correct: false, text: "Then I'll just say everything's compliant since we can't prove otherwise.", coaching: "Absence of evidence is not evidence of compliance." },
            ],
          },
        ],
        metEnd: "Objective met — sample tested with scope limitations disclosed. Feeds Step 4 (Evaluate). A request that named the artefact, recipient and sample up front would have got cleaner evidence first time.",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-collecting / over-broad request → Defensive thread.",
        speaker: "HR Business Partner / IT Manager",
        initials: "HR",
        opener:
          "HR Business Partner: Before I share training and acknowledgement records — these contain staff names and completion data, i.e. personal data. What's the lawful basis, and who approved this spot-check? I can provide aggregate completion percentages without names, but the per-employee log needs HR manager sign-off.\n\nIT Manager: I'm not going to export the endpoint console for a trainee without a ticket and manager approval — that data shows our patch gaps, which is security-sensitive. Raise a request through the service desk and reference your sponsor, then I'll action it.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood. HR — aggregate, anonymised figures are exactly what I need; my mentor [name] is supervising and can confirm the purpose. IT — I'll raise a service-desk ticket referencing my mentor as sponsor. Could we proceed on that basis?" },
              { id: "B", correct: false, text: "It's just for training, you don't need to make this so formal.", coaching: "Minimising someone's data/security control is a poor look for a GRC mentee." },
              { id: "C", correct: false, text: "Fine, I'll get the named records some other way.", coaching: "Seeking a back door around controls is a serious red flag." },
            ],
            stakeholderNext:
              "HR Business Partner: Anonymised is fine; named records are not, unless your mentor confirms the need in writing. That's our data-minimisation policy — I'd expect a GRC programme to respect it.\n\nIT Manager: Same answer — get the ticket approved. I'm happy to help once it's logged properly; I'm not bypassing change control for a manual ask.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Perfect. I'll work from the anonymised data and have my mentor confirm in writing if any named detail is ever needed. IT — ticket is raised and references the sponsor; I'll await approval. Thank you both." },
              { id: "B", correct: false, text: "This is taking too long, I'll just report what little I have.", coaching: "Patience through the approval is part of the job." },
              { id: "C", correct: false, text: "I'll note in my report that HR and IT refused to cooperate.", coaching: "They followed policy — that's not non-cooperation." },
            ],
          },
        ],
        metEnd: "Objective met — evidence obtained via the correct channels (data-minimised + ticketed). Feeds Step 4 (Evaluate). A scoped, proportionate request avoids this friction.",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ TPRM-002 · Vendor Due-Diligence — Step 5 ════════════ */
  "TPRM-002/5": {
    recipient: "Vendor Security / Compliance Contact (external)",
    subject: "Request: Clarifications on Vendor Security Questionnaire Responses",
    purpose:
      "Reviewing your completed security due-diligence questionnaire, several responses need supporting evidence or clarification before I can finalise the assessment (ISO 27001 Annex A 5.20 / 5.21).",
    suggestedItems: [
      "Evidence of the claimed ISO 27001 certification — certificate and Statement of Applicability / scope",
      "Clarification of access-management controls where answers were vague (MFA coverage, privileged access handling)",
      "The documented incident-response / breach-notification procedure referenced but not attached",
    ],
    wrongItems: [
      "The vendor's full internal source code and system architecture",
      "A list of the vendor's other customers and their contract terms",
      "Personal data and background checks of the vendor's employees",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Vendor Security / Compliance Contact",
        initials: "VS",
        opener:
          "Thanks for following up — happy to provide the additional evidence:\n• ISO 27001: attached is our current certificate plus the Statement of Applicability cover page showing scope (covers our SaaS platform and supporting infrastructure; expires next March).\n• Access management: MFA is enforced for all employees and customers; privileged access runs through a PAM tool with just-in-time elevation and quarterly access reviews.\n• Incident response: our IR and breach-notification procedure is attached — we commit to notifying customers within 72 hours of a confirmed breach.\nLet me know if you need anything else for your assessment.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thank you — this covers most of it. Could you also share the executive summary of your latest penetration test, and confirm the SoA scope explicitly lists the service we use? I'll arrange an NDA via procurement for anything confidential." },
              { id: "B", correct: false, text: "Great, that's everything, I'll close the assessment.", coaching: "You haven't confirmed the cert scope covers your service." },
              { id: "C", correct: false, text: "Send me your full internal audit reports and source code too.", coaching: "That's disproportionate for a due-diligence review." },
            ],
            stakeholderNext:
              "Of course. The full SoA is available under NDA — I can arrange that with your procurement contact. We also run annual third-party penetration tests; I can share the latest executive summary (the full report stays confidential). Would the summary be sufficient for your review?",
          },
          {
            options: [
              { id: "A", correct: true, text: "The executive summary is sufficient, thank you. I'll have procurement set up the NDA for the full SoA, then finalise the due-diligence score and risk rating with my mentor." },
              { id: "B", correct: false, text: "Don't bother with the NDA, the summary's probably fine on its own.", coaching: "The SoA scope is what confirms the cert actually covers your service." },
              { id: "C", correct: false, text: "I'll just rate them low-risk, they seem responsive.", coaching: "Friendly ≠ secure; rate on evidence." },
            ],
          },
        ],
        metEnd: "Objective met — clarifications and evidence captured to the questionnaire working file. Feeds Step 6 (Map to controls / flag gaps).",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Vendor Security / Compliance Contact",
        initials: "VS",
        opener:
          "Thanks for reaching out. We are ISO 27001 certified — I'd have to check with our compliance team for the actual certificate, they handle that. On access management, yes, we use MFA where appropriate and follow best practice for admin accounts. We do have an incident process. I'll try to get you documents, but our team is quite stretched this quarter.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks. Could you give me a date by which compliance can send the certificate and SoA, and clarify specifically whether MFA is enforced for all privileged accounts? Without those two points I'll have to record them as unverified." },
              { id: "B", correct: false, text: "Okay, no rush, send it whenever compliance is free.", coaching: "No date means the evidence never arrives." },
              { id: "C", correct: false, text: "A general statement that you follow best practice is fine for me.", coaching: "'Best practice' with no evidence is garbage in." },
            ],
            stakeholderNext:
              "I'll chase compliance for the certificate but can't promise a date. The SoA isn't something we usually share. For access controls I'd say we're 'aligned with industry standards' — I don't have the specifics to hand. Is a general statement enough for what you need?",
          },
          {
            options: [
              { id: "A", correct: true, text: "I understand. I'll record the certificate and SoA as 'evidence pending' and the access-control answer as 'unverified', flag both as gaps with a follow-up date, and ask that the certificate be sent as soon as compliance can." },
              { id: "B", correct: false, text: "Alright, I'll just take your word that it's all in place.", coaching: "Due diligence verifies; it doesn't take it on trust." },
              { id: "C", correct: false, text: "Fine, I'll mark everything as satisfactory to close it out.", coaching: "Marking unevidenced items satisfactory is falsifying the assessment." },
            ],
          },
        ],
        metEnd: "Objective met — gaps recorded honestly with follow-up dates. Feeds Step 6 (Map to controls / flag gaps). Naming the exact evidence and a date up front gets firmer answers sooner.",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Accusatory / over-broad request → Defensive thread.",
        speaker: "Vendor Security / Compliance Contact",
        initials: "VS",
        opener:
          "We've already completed your questionnaire, which should be sufficient for your due diligence. Our ISO 27001 certificate, SoA, and internal incident-response procedures are confidential and shared only under a signed NDA with a legitimate contractual basis. What is your role, and is this request coming through our agreed account contact? We don't usually respond to ad-hoc requests from individual reviewers.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood. I'm the analyst reviewing your assessment for [org]; happy to route this through your account/procurement channel under NDA. Could you confirm the right contact? The completed questionnaire alone doesn't meet our evidence requirements." },
              { id: "B", correct: false, text: "You don't need to know my role, just send the documents.", coaching: "Refusing to identify yourself hardens a defensive vendor." },
              { id: "C", correct: false, text: "If the questionnaire is all you'll give, I'll just accept it.", coaching: "Don't drop due-diligence evidence at the first resistance." },
            ],
            stakeholderNext:
              "I understand you'd like more, but our position stands: detailed security documentation is released through the formal vendor-assessment channel, under NDA only. If your organisation escalates through procurement we'll engage. I can't send the SoA or IR runbook directly.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's reasonable. I'll ask our procurement team to initiate the NDA and formal assessment so you can share the SoA and IR procedure through the proper channel. I'll keep the assessment open pending that evidence." },
              { id: "B", correct: false, text: "Never mind then, I'll close the assessment as-is.", coaching: "Closing with no assurance leaves the risk unmanaged." },
              { id: "C", correct: false, text: "I'll recommend we terminate the contract since you won't cooperate.", coaching: "A risk decision like that isn't the mentee's to make or threaten." },
            ],
          },
        ],
        metEnd: "Objective met — evidence path secured through procurement / NDA, assessment kept open pending evidence. Feeds Step 6 (Map to controls / flag gaps). A specific, non-accusatory request avoids the stand-off.",
        missEnd: "Objective not met — no usable evidence captured. Review the coaching and try the request again.",
      },
    },
  },
  /* ════════════ TV-001 · Access Control Review — Step 1 (user-account extract) ════════════ */
  "TV-001/1": {
    recipient: "System Owner / IT Administrator",
    subject: "Request: Active user-account extract for access review (ISO 27001 A.5.16)",
    purpose:
      "To run the access-control review I need the current list of active user accounts so I can validate that access matches authorised, active staff (ISO 27001 Annex A 5.15 / 5.16 / 5.18).",
    suggestedItems: [
      "Full export of active user accounts with the role / group assigned to each",
      "Last-login (or last-activity) date for every account",
      "List of privileged / administrator accounts called out separately",
      "Any generic, shared or service accounts in use",
    ],
    wrongItems: [
      "The actual passwords or password hashes for every account",
      "Each user's browsing history and personal file contents",
      "The full network firewall and router configuration",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "System Owner / IT Administrator",
        initials: "SO",
        opener:
          "Sure — I can pull the user export from the IAM console. It'll show username, role/group and last-login. Heads up: there are a few service accounts and two shared mailboxes in there, and a handful of accounts haven't logged in for 90+ days. I'll send the CSV this afternoon.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks. Could you flag the service and shared accounts separately, and include the privileged-group membership? The 90-day-dormant accounts are exactly what I want to review — please leave them in." },
              { id: "B", correct: false, text: "Great, just the normal user accounts is fine — you can drop the dormant and service ones.", coaching: "Dormant, shared and service accounts are the highest-risk ones — never exclude them from an access review." },
              { id: "C", correct: false, text: "Can you also send accounts for every other system in the company?", coaching: "Stay scoped to the system under review." },
            ],
            stakeholderNext:
              "Good call. I'll tag the service/shared accounts and add the admin-group column. The dormant ones are still enabled — I wasn't sure if anyone owned them, so flag whatever you find. Do you want the leaver accounts too, or only currently-active ones?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Please include disabled/leaver accounts as well so I can confirm they were de-provisioned on time. I'll reconcile the whole extract against the HR active-staff list and flag any mismatches with my mentor." },
              { id: "B", correct: false, text: "Only active accounts — I'll assume the leavers were all removed properly.", coaching: "Whether leavers were de-provisioned on time is a core finding — verify, don't assume." },
              { id: "C", correct: false, text: "Don't worry about roles, I'll just count how many accounts there are.", coaching: "A headcount isn't an access review — you need role and status to judge appropriateness." },
            ],
          },
        ],
        metEnd: "Objective met — the account extract (with privileged/service accounts flagged) is captured for reconciliation against the HR list in the next step.",
        missEnd: "Objective not met — no usable extract captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "System Owner / IT Administrator",
        initials: "SO",
        opener:
          "Accounts… yeah, I can probably get you something. The IAM console export is a bit of a mess and I'm not sure last-login is reliable on the older accounts. What exactly do you need — just names, or roles too? And by when?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let's pin it down: I need username, role/group and last-login for all active accounts, plus admin accounts flagged — by Friday. If last-login is unreliable on some, just note which ones and I'll treat those as a data-quality gap." },
              { id: "B", correct: false, text: "Whatever the console gives you is fine, send it over.", coaching: "'Whatever the console gives' may omit the fields the review depends on — specify them." },
              { id: "C", correct: false, text: "Just the names will do, I don't really need roles.", coaching: "Without roles you can't judge whether access is appropriate." },
            ],
            stakeholderNext:
              "Okay, that's clearer. The active-account export I can do; the last-login field is blank for some legacy accounts though. I'll send it with a note on which ones are unreliable. Anything else?",
          },
          {
            options: [
              { id: "A", correct: true, text: "That works — send it with the reliability note. I'll record the legacy accounts with missing last-login as a data-quality finding and still reconcile the rest against HR." },
              { id: "B", correct: false, text: "Fine, I'll just ignore the accounts where the data's missing.", coaching: "Ignoring incomplete records hides exactly the stale accounts a review should catch." },
              { id: "C", correct: false, text: "No need for the note, I'll assume the blanks mean the account is unused.", coaching: "Assuming a blank means 'unused' could wrongly clear an active risky account." },
            ],
          },
        ],
        metEnd: "Objective met — extract captured with data-quality gaps documented. Naming the exact fields up front gets a cleaner export first time.",
        missEnd: "Objective not met — no usable extract captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad request → Defensive thread.",
        speaker: "System Owner / IT Administrator",
        initials: "SO",
        opener:
          "A full account export is sensitive — it effectively maps who can access what. Before I share it, who authorised this review and what's the scope? I'm not comfortable handing the whole IAM extract to a trainee without sign-off from the system owner or your sponsor.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — this is the scheduled access-control review for [system], supervised by my mentor [name], who can confirm in writing. I only need this one system's accounts. Happy to proceed once that's confirmed." },
              { id: "B", correct: false, text: "It's just a list of usernames, you're overthinking it — send it.", coaching: "Dismissing the sensitivity of an access map is a poor look for a GRC mentee." },
              { id: "C", correct: false, text: "I'll just get it from someone else then.", coaching: "Going around the system owner to obtain access data is a serious red flag." },
            ],
            stakeholderNext:
              "Fair enough — if your mentor confirms the scope and need in writing, I'll release the extract for this system only. I'd rather keep the privileged-account detail tightly held until that's through. Sound right?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Completely fair. I'll get my mentor to confirm the scope and need in writing, then you can send the extract including the admin-account flags. Thank you for handling it carefully." },
              { id: "B", correct: false, text: "This is way too much process for a simple list.", coaching: "Respecting need-to-know on access data is the job, not an obstacle." },
              { id: "C", correct: false, text: "Forget the admin accounts then, just send the basic ones.", coaching: "Privileged accounts are the most important part of an access review — don't drop them to avoid friction." },
            ],
          },
        ],
        metEnd: "Objective met — extract released through the correct channel with privileged accounts intact. A scoped, authorised request avoids the gatekeeping.",
        missEnd: "Objective not met — no usable extract captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ TV-001 · Access Control Review — Step 2 (HR employee list) ════════════ */
  "TV-001/2": {
    recipient: "HR Business Partner",
    subject: "Request: Current active-employee list for access reconciliation",
    purpose:
      "To validate user accounts against authorised staff I need the current active-employee list so I can reconcile accounts to real, active people and surface joiner/mover/leaver gaps (ISO 27001 Annex A 5.16 / 5.18).",
    suggestedItems: [
      "List of currently active employees with department and job title",
      "Start date for each employee (to check joiner provisioning)",
      "Recent leavers in the last 3 months with their leaving date (to check de-provisioning)",
    ],
    wrongItems: [
      "Each employee's salary and bank account details",
      "Staff medical records and disciplinary history",
      "Home addresses and next-of-kin details for all staff",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "HR Business Partner",
        initials: "HR",
        opener:
          "Happy to help with the access review. I can export the active-staff list from the HR system with department and start date. I can also give you leavers from the last quarter with their last working day. Contractors aren't in our HR system though — they're managed through the agency. You'll have it tomorrow.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks. The contractor gap is useful to know — I'll note that their accounts can't be reconciled against HR and treat it as a finding. Please do include the last-quarter leavers so I can check their accounts were disabled." },
              { id: "B", correct: false, text: "Great, just the permanent staff is enough, skip the leavers.", coaching: "Leavers are how you test de-provisioning — they're the point of the reconciliation." },
              { id: "C", correct: false, text: "Can you send everyone's home address and salary too?", coaching: "Requesting personal data you don't need for the task breaches data minimisation." },
            ],
            stakeholderNext:
              "Will do — leavers included. On contractors, I'd suggest you ask the agency for their roster separately. One thing: a couple of recent joiners started this week so their records are still being set up. Want me to flag those?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Yes please flag the in-progress joiners — I'll check whether their accounts were created before HR onboarding completed, which would be a provisioning-sequence gap. I'll reconcile the full list with the account extract and review with my mentor." },
              { id: "B", correct: false, text: "No need, I'll just treat the new joiners as if they don't exist yet.", coaching: "Accounts created ahead of HR records are a real control gap — don't skip them." },
              { id: "C", correct: false, text: "I'll just mark any account without an HR match as fine.", coaching: "An account with no matching active employee is exactly what to investigate, not clear." },
            ],
          },
        ],
        metEnd: "Objective met — active-staff and leaver lists captured, contractor gap noted. Ready to reconcile against the account extract.",
        missEnd: "Objective not met — no usable list captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "HR Business Partner",
        initials: "HR",
        opener:
          "A staff list? I can probably pull something, but our HR system reports are a bit clunky. Do you want everyone, or just one department? And the leaver data isn't always kept up to date — managers don't always tell us promptly when someone goes.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let's scope it: active staff for the in-scope department with start dates, plus any leavers from the last 3 months. If the leaver data lags, note that — a delay in recording leavers is itself a finding I'd want to capture." },
              { id: "B", correct: false, text: "Just send the whole thing however it comes out.", coaching: "An unscoped, unverified dump won't reconcile cleanly — define department and dates." },
              { id: "C", correct: false, text: "If leaver data is unreliable, let's just skip leavers.", coaching: "Skipping leavers removes the main test of de-provisioning." },
            ],
            stakeholderNext:
              "Okay. I'll get you the department's active list with start dates. For leavers I'll send what's recorded but I genuinely can't promise it's complete — some managers are slow to notify us. Is that workable?",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's workable — I'll record 'delayed leaver notification' as a process gap and reconcile against the accounts anyway; any active account for an unrecorded leaver will surface in the comparison." },
              { id: "B", correct: false, text: "Sure, I'll just assume the leaver list is complete.", coaching: "Assuming completeness defeats the reconciliation — the gaps are the finding." },
              { id: "C", correct: false, text: "Then I'll just report there are no leaver issues.", coaching: "You can't conclude 'no issues' from data you've been told is incomplete." },
            ],
          },
        ],
        metEnd: "Objective met — staff list captured with the leaver-notification gap documented. A scoped request (department + date range) would sharpen it.",
        missEnd: "Objective not met — no usable list captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad personal-data request → Defensive thread.",
        speaker: "HR Business Partner",
        initials: "HR",
        opener:
          "Employee data is personal data, so I need to be careful here. What's the lawful basis and who approved the review? I can share department, title and start date for the access reconciliation, but I won't hand over a broad employee dump, and anything beyond what the review needs is off the table.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Agreed — I only need name, department, title and start date for reconciliation, nothing more. The review is supervised by my mentor [name], who can confirm the purpose in writing. That's data-minimised on purpose." },
              { id: "B", correct: false, text: "Just give me the full HR record, it's easier than picking fields.", coaching: "Convenience never justifies collecting more personal data than the task needs." },
              { id: "C", correct: false, text: "You're being difficult — it's only an internal review.", coaching: "Treating a data-protection control as obstruction is the wrong instinct for GRC." },
            ],
            stakeholderNext:
              "Thank you — minimised fields and a confirmed purpose is exactly the right approach. Once your mentor confirms, I'll send name, department, title and start date, plus last-quarter leaver dates for the de-provisioning check. That work?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Perfect — that's everything I need and nothing I don't. I'll have my mentor confirm in writing and keep the extract restricted to the review. Appreciate you handling it properly." },
              { id: "B", correct: false, text: "Can you slip in salaries too while you're at it?", coaching: "Adding salary to an access review is textbook over-collection." },
              { id: "C", correct: false, text: "This is taking forever, I'll just work without HR data.", coaching: "Without the HR list there's nothing to reconcile accounts against — see the approval through." },
            ],
          },
        ],
        metEnd: "Objective met — minimised employee data obtained with a confirmed basis. The right call on personal data is itself good GRC practice.",
        missEnd: "Objective not met — no usable list captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ BCRP-002 · ICT DR Checklist — Step 3 (recovery runbooks) ════════════ */
  "BCRP-002/3": {
    recipient: "System Owner / IT Operations",
    subject: "Request: Recovery runbooks & manual failover steps for DR checklist",
    purpose:
      "To build the ICT disaster-recovery checklist I need the documented manual recovery steps and runbooks for the in-scope systems so I can confirm each system has a tested, followable recovery path (ISO 27001 Annex A 5.30 / 8.13 / 8.14).",
    suggestedItems: [
      "Documented recovery runbook(s) / manual failover steps for the in-scope systems",
      "Latest backup schedule and most recent successful restore-test evidence",
      "Defined RTO / RPO targets for each system",
      "Named recovery owner / on-call contact per system",
    ],
    wrongItems: [
      "Live production database credentials and admin passwords",
      "A full copy of the production data to test recovery yourself",
      "The personal mobile numbers of all on-call engineers",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "System Owner / IT Operations",
        initials: "SO",
        opener:
          "Glad someone's pulling this together. We've got runbooks for the two core platforms — fairly detailed — and a backup schedule. I'll be honest: the runbook for the billing system is older and I'm not sure it's been tested since the last migration. RTO/RPO targets exist for the core systems but not all of them. I'll send what we have.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks — please send all three. The untested billing runbook is important: I'll flag it as 'recovery procedure not validated since migration' and note the systems missing RTO/RPO. Could you confirm when the last successful restore test ran?" },
              { id: "B", correct: false, text: "Just the two good runbooks is fine, skip the billing one.", coaching: "An untested recovery runbook is a key DR gap — capture it, don't omit it." },
              { id: "C", correct: false, text: "Don't bother with backups or RTOs, the runbooks are enough.", coaching: "A runbook without tested backups and RTO/RPO can't prove recoverability." },
            ],
            stakeholderNext:
              "Last full restore test was about eight months ago, and only for the core systems — billing wasn't included. I'll dig out the result. The missing RTO/RPO is mostly the secondary systems nobody's formally classified yet. Want me to list those?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Yes please list them — unclassified systems with no RTO/RPO and no recent restore test are exactly the gaps the checklist should expose. I'll record them as recovery-readiness findings and review the draft checklist with my mentor." },
              { id: "B", correct: false, text: "No need, I'll just assume the secondary systems recover fine.", coaching: "Assuming recoverability with no test or target is how DR fails for real." },
              { id: "C", correct: false, text: "I'll just copy the RTO from the core systems for everything.", coaching: "Inventing RTOs you haven't agreed with the business misrepresents the position." },
            ],
          },
        ],
        metEnd: "Objective met — runbooks, backup/restore evidence and recovery gaps captured for the DR checklist.",
        missEnd: "Objective not met — no usable recovery evidence captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "System Owner / IT Operations",
        initials: "SO",
        opener:
          "Recovery docs… there's stuff scattered around. Some of it's in the team wiki, some in people's heads honestly. I can point you at a couple of runbooks but I'm not sure how current they are. What systems are you actually focused on, and when do you need this?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let's narrow it: the in-scope systems are [X, Y, Z], and I need it by next week. Send the runbooks you have, and where recovery 'lives in people's heads', tell me that too — undocumented recovery is itself a finding I'll record." },
              { id: "B", correct: false, text: "Just send me whatever's in the wiki and I'll sort it out.", coaching: "An undefined scope and 'whatever's in the wiki' won't give you a checklist you can trust." },
              { id: "C", correct: false, text: "If it's in people's heads that's fine, no need to write it down.", coaching: "Tribal-knowledge recovery is precisely the risk a DR checklist exists to flag." },
            ],
            stakeholderNext:
              "Right, for those three: two have wiki runbooks, the third is mostly the senior engineer's knowledge. Backups run nightly but I can't remember the last time we actually tested a restore. I'll send the runbooks — is the missing restore test something you need from me?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Yes — please confirm in writing when restores were last tested, even if the answer is 'not recently'. I'll record the head-knowledge runbook and the untested restores as DR gaps and recommend they're documented and tested." },
              { id: "B", correct: false, text: "Don't worry about restore tests, nightly backups are good enough.", coaching: "Backups you've never restored aren't proven recovery." },
              { id: "C", correct: false, text: "I'll just write the checklist as if everything recovers fine.", coaching: "Documenting an untested state as 'fine' makes the checklist misleading." },
            ],
          },
        ],
        metEnd: "Objective met — partial runbooks captured with undocumented/untested recovery flagged. A scoped request (named systems + deadline) gets there faster.",
        missEnd: "Objective not met — no usable recovery evidence captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad request → Defensive thread.",
        speaker: "System Owner / IT Operations",
        initials: "SO",
        opener:
          "Recovery runbooks include infrastructure detail, credentials references and failover procedures — that's sensitive operational security material. Who's sponsoring this DR work and what's the scope? I'm not sending full runbooks to a trainee without the system owner's sign-off; I can share a redacted summary in the meantime.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — this is the DR-checklist task for [systems], supervised by my mentor [name], who can confirm in writing. A redacted summary is genuinely useful to start; I don't need credentials, just the recovery steps and targets." },
              { id: "B", correct: false, text: "Just send the full runbooks, I'll handle the sensitive bits.", coaching: "There's no need-to-know for credentials in a DR-checklist exercise — don't ask for them." },
              { id: "C", correct: false, text: "I'll find the runbooks on the wiki myself then.", coaching: "Bypassing the owner to pull sensitive operational docs is a red flag." },
            ],
            stakeholderNext:
              "Sensible — redacted recovery steps and targets, no credentials, is fine to share now. Once your mentor confirms the scope I'll release the fuller runbooks. I'd still keep the failover credential references out entirely. Agreed?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Agreed — keep credentials out entirely, they're not needed for the checklist. I'll get my mentor to confirm scope in writing for the fuller runbooks. The redacted version lets me start now; thank you." },
              { id: "B", correct: false, text: "Fine, but I still think you're overcomplicating a simple ask.", coaching: "Protecting operational recovery detail isn't overcomplication — it's the control working." },
              { id: "C", correct: false, text: "Skip it, I'll just write the checklist from memory of similar systems.", coaching: "Writing a DR checklist from guesswork rather than the real runbooks is worthless." },
            ],
          },
        ],
        metEnd: "Objective met — recovery detail obtained appropriately (redacted now, fuller runbooks via sign-off; no credentials). A scoped request avoids the stand-off.",
        missEnd: "Objective not met — no usable recovery evidence captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ TPRM-001 · Supplier Inventory — Step 1 (gather vendor list) ════════════ */
  "TPRM-001/1": {
    recipient: "Procurement Manager",
    subject: "Request: Consolidated vendor / supplier list for security risk rating",
    purpose:
      "To build the supplier inventory and risk-rate vendors, I need a consolidated list of all suppliers from the systems that hold them, so no vendor is missed before rating (ISO 27001 Annex A 5.19 / 5.21).",
    suggestedItems: [
      "Vendor list from the contract-management system (with contract owner)",
      "Active-supplier list from accounts payable (who we actually pay)",
      "IT / SaaS vendor list from procurement or expense records",
      "Names of any department-level suppliers not centrally procured",
    ],
    wrongItems: [
      "Full contract values and pricing for every supplier",
      "The bank account details used to pay each vendor",
      "Internal email threads negotiating each contract",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Procurement Manager",
        initials: "PM",
        opener:
          "Good timing — happy to help. The contract-management system has the formally onboarded vendors with owners. Accounts Payable will have anyone we're actually paying, which is usually broader. Fair warning: there's always a tail of 'shadow' SaaS that teams expense directly and never route through us. I'll send the CMS and AP exports today.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks — both exports are exactly right. The shadow-SaaS tail is important: could you point me to who in Finance handles expense approvals so I can chase those? I'll de-duplicate across all three sources before rating." },
              { id: "B", correct: false, text: "Great, the contract-system list alone is plenty.", coaching: "Vendors paid but not in the contract system are exactly what an inventory must catch." },
              { id: "C", correct: false, text: "Can you also send me every contract document in full?", coaching: "You need the vendor list to build the inventory, not every contract — that's disproportionate at this stage." },
            ],
            stakeholderNext:
              "Finance expense approvals go through [Finance contact]. One thing to watch: AP and the CMS use different vendor names for the same supplier sometimes, so you'll get duplicates. And a few one-off vendors won't be security-relevant. Want me to indicate which are data-processing vendors?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Yes please flag the data-processing vendors — those are my priority for risk rating. I'll reconcile the name mismatches into a single de-duplicated inventory and confirm the consolidated list with my mentor before rating." },
              { id: "B", correct: false, text: "No need, I'll just rate every vendor the same to save time.", coaching: "Rating every vendor identically ignores risk — data processors carry far more." },
              { id: "C", correct: false, text: "I'll just keep the duplicates, it doesn't really matter.", coaching: "Duplicate entries inflate and distort the inventory — reconcile them." },
            ],
          },
        ],
        metEnd: "Objective met — a consolidated, de-duplicated supplier list (with data-processors flagged) is captured, ready for risk rating.",
        missEnd: "Objective not met — no usable supplier list captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Procurement Manager",
        initials: "PM",
        opener:
          "A vendor list… we don't really have one single tidy list, that's the honest answer. There's the contract system, but it's not complete, and Finance has their own view. Depends what you mean by 'all vendors' — every coffee supplier, or the IT ones? Let me know and I'll see what I can get.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let's define it: all suppliers we have an active contract with or are actively paying, with the contract/relationship owner. I'll pull from the CMS and AP and reconcile. If there's no single list, that fragmentation is itself worth noting." },
              { id: "B", correct: false, text: "Just send whichever list is easiest to grab.", coaching: "The 'easiest' single list is the one guaranteed to miss vendors — pull from multiple sources." },
              { id: "C", correct: false, text: "Everyone you've ever dealt with, send it all.", coaching: "'Everyone ever' is unscoped and unusable — define active suppliers." },
            ],
            stakeholderNext:
              "Okay, active suppliers with an owner — that I can work towards. The CMS export I'll send now. For AP you'll need to ask Finance directly, I only see part of it. Be aware some owners listed have since left the company. Does that matter for you?",
          },
          {
            options: [
              { id: "A", correct: true, text: "It does — a supplier whose internal owner has left is an ownership gap I'll flag. Please send the CMS list and the Finance contact for AP; I'll consolidate and mark vendors with no current owner for follow-up." },
              { id: "B", correct: false, text: "Doesn't matter, I'll just leave the owner blank and move on.", coaching: "Unowned suppliers are a governance gap — record them, don't blank them." },
              { id: "C", correct: false, text: "Just the CMS list then, I won't bother chasing Finance.", coaching: "Skipping AP means paid-but-uncontracted vendors stay invisible." },
            ],
          },
        ],
        metEnd: "Objective met — supplier list assembled from multiple sources with ownership gaps flagged. Defining 'active supplier + owner' up front speeds this up.",
        missEnd: "Objective not met — no usable supplier list captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad request → Defensive thread.",
        speaker: "Procurement Manager",
        initials: "PM",
        opener:
          "Our full supplier list includes commercial terms and pricing, which is commercially sensitive. Who's asked for this and for what? I'm not exporting the whole contract database with values to a trainee. If you only need vendor names and categories for a security inventory, that's different — but confirm the scope and sponsor first.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — I only need vendor names, category and the relationship owner, not contract values or pricing. It's for the supplier security-risk inventory, supervised by my mentor [name], who can confirm. Names and categories is genuinely all I need." },
              { id: "B", correct: false, text: "Just send the whole database, I'll ignore the pricing.", coaching: "Don't request commercially sensitive data you don't need — ask only for the fields the task requires." },
              { id: "C", correct: false, text: "Pricing might be useful actually, include it.", coaching: "Contract values have no place in a security-risk inventory — that's scope creep." },
            ],
            stakeholderNext:
              "That's reasonable — names, categories and owners, no commercial terms. Once your mentor confirms the purpose I'll prepare that view. I'll strip pricing and contract values entirely. Anything else, or is that the scope?",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's the scope exactly — names, categories, owners, no commercials. I'll have my mentor confirm in writing. Thanks for protecting the sensitive parts; that's the right call." },
              { id: "B", correct: false, text: "Fine, though this is a lot of fuss for a vendor list.", coaching: "Guarding commercially sensitive data is the control working, not fuss." },
              { id: "C", correct: false, text: "Forget it, I'll estimate the vendor list from memory.", coaching: "An inventory built from memory will miss vendors and undermines the whole task." },
            ],
          },
        ],
        metEnd: "Objective met — a minimised vendor view (names, categories, owners) obtained with a confirmed purpose. Asking only for what the task needs avoids the friction.",
        missEnd: "Objective not met — no usable supplier list captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ AA-003 · Privacy Data-Flow Mapping — Step 3.1 (agree scope with mentor) ════════════ */
  "AA-003/3.1": {
    recipient: "Mentor (engagement supervisor)",
    subject: "Request: Agreement on the data-heavy process to map for GDPR scoping",
    purpose:
      "Before mapping a data flow I need to agree with my mentor which data-heavy process to focus on, so the mapping is scoped to a process with real personal-data volume and GDPR relevance (ISO 27001 Annex A 5.34; GDPR Art 30).",
    suggestedItems: [
      "Confirmation of which business process to map (e.g. student admissions / enrolment)",
      "Why it's in scope — the categories of personal data it handles",
      "Who the process owner is, so I can request the flow detail next",
    ],
    wrongItems: [
      "The mentor to do the data-flow mapping for you",
      "Approval to map every process in the organisation at once",
      "Direct access to the live student records to start mapping",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Mentor",
        initials: "MT",
        opener:
          "Good that you're scoping this deliberately. For an EdTech platform, the obvious candidates are student admissions, the learning platform's behavioural data, and payments. Admissions handles a lot of identity and sometimes special-category data. Which were you leaning towards, and why?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "I'd pick admissions/enrolment — it ingests identity documents, dates of birth and sometimes special-category data, and feeds several downstream systems, so the flow is rich and GDPR-relevant. Does that fit, and who's the process owner I should approach?" },
              { id: "B", correct: false, text: "I'll just map whichever process is smallest so it's quick.", coaching: "Picking the thinnest process defeats the exercise — choose one with real personal-data volume." },
              { id: "C", correct: false, text: "Let's map all of them at once to be thorough.", coaching: "Mapping everything at once loses the depth a single rich flow gives you — scope to one." },
            ],
            stakeholderNext:
              "Admissions is a strong choice for exactly those reasons. The process owner is the Admissions / Student Records Lead. Before you go to them, what's your hypothesis on where the GDPR risk concentrates — collection, sharing, or retention?",
          },
          {
            options: [
              { id: "A", correct: true, text: "My hypothesis is collection and onward sharing — identity data captured at enrolment then passed to the LMS and a third-party verification service, with retention likely longer than needed. I'll confirm that by requesting the actual flow from the Records Lead." },
              { id: "B", correct: false, text: "I don't really have a hypothesis, I'll just draw whatever they tell me.", coaching: "Going in with no hypothesis means you won't know which answers to probe." },
              { id: "C", correct: false, text: "The risk is wherever the most data is, I'll figure it out later.", coaching: "Vague framing now leads to a shallow map later — sharpen the focus." },
            ],
          },
        ],
        metEnd: "Objective met — scope agreed (admissions process) with a clear GDPR-risk hypothesis and the process owner to approach next.",
        missEnd: "Objective not met — scope not properly agreed. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Mentor",
        initials: "MT",
        opener:
          "You're asking me to just pick one for you? I'd rather you came with a proposal and reasoning — that's the skill here. Have a think: what makes a process worth mapping for GDPR? Then tell me which one and why.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Fair — a process is worth mapping if it handles a high volume or sensitivity of personal data and crosses system or organisational boundaries. On that basis I propose admissions, because it captures identity and special-category data and shares it onward. Agree?" },
              { id: "B", correct: false, text: "Can you just tell me which one to do?", coaching: "Deciding scope with reasoning is the point of the step — don't outsource the judgement." },
              { id: "C", correct: false, text: "Any process is fine really, they all have some data.", coaching: "'They all have some data' isn't a scoping rationale — pick on volume and sensitivity." },
            ],
            stakeholderNext:
              "Better — that's a real rationale. Admissions works. Now, do you know who actually owns that process day to day, or are you assuming? Getting the right owner matters for the next step.",
          },
          {
            options: [
              { id: "A", correct: true, text: "I'll confirm rather than assume — I believe it's the Admissions / Student Records Lead, but I'll verify that's who handles the live process before I request the flow detail from them." },
              { id: "B", correct: false, text: "I'll just send the request to whoever and they'll forward it.", coaching: "Addressing the wrong owner gets you vague second-hand answers — confirm first." },
              { id: "C", correct: false, text: "Doesn't matter who owns it, anyone can describe the flow.", coaching: "Only the real process owner knows the actual data flow — identify them." },
            ],
          },
        ],
        metEnd: "Objective met — scope agreed with reasoning and the correct owner identified. Leading with a proposal next time shows stronger judgement.",
        missEnd: "Objective not met — scope not properly agreed. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Unfocused / over-broad request → Defensive thread.",
        speaker: "Mentor",
        initials: "MT",
        opener:
          "Hold on — 'map a data-heavy process' is too loose to sign off. I'm not going to approve an open-ended mapping exercise that could sprawl across the whole platform. Come back with a single, justified process and the boundary you'll hold. What's in, and what's explicitly out?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood. I propose mapping admissions/enrolment only: in scope is data from application through to enrolment and its handoffs to the LMS and verification vendor; out of scope is post-enrolment academic records. That's the boundary I'll hold." },
              { id: "B", correct: false, text: "Let's just start broad and narrow it down as we go.", coaching: "Starting broad with no boundary is exactly what your mentor is refusing — define it first." },
              { id: "C", correct: false, text: "I'll map the whole platform's data, it's all connected anyway.", coaching: "'It's all connected' is how scope explodes — hold a defined boundary." },
            ],
            stakeholderNext:
              "That's a boundary I can approve. Keeping post-enrolment out is sensible for a first map. One check: if you discover the admissions flow leaks into a system you'd called out of scope, what will you do?",
          },
          {
            options: [
              { id: "A", correct: true, text: "I'll note it as a boundary exception — record that the flow crosses into the out-of-scope system as a finding, but not expand the map there without agreeing it with you first." },
              { id: "B", correct: false, text: "I'll just quietly expand the map to cover it.", coaching: "Silently expanding scope undoes the discipline you just agreed — flag it instead." },
              { id: "C", correct: false, text: "I'll ignore it since it's out of scope.", coaching: "An unexpected data leak across the boundary is a finding, not something to ignore." },
            ],
          },
        ],
        metEnd: "Objective met — a single justified process and a held boundary agreed with the mentor. Bringing a defined scope first avoids the push-back.",
        missEnd: "Objective not met — scope not properly agreed. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ AA-003 · Privacy Data-Flow Mapping — Step 3.2 (flow detail from owner) ════════════ */
  "AA-003/3.2": {
    recipient: "Admissions / Student Records Lead",
    subject: "Request: Data-flow detail for the admissions process (GDPR mapping)",
    purpose:
      "To map the admissions data flow I need to understand exactly what personal data is collected, where it goes and how long it's kept, so I can assess GDPR applicability (Annex A 5.34; GDPR Art 30 / 5(1)(e)).",
    suggestedItems: [
      "What personal data is collected at application/enrolment, and from whom",
      "Which systems and third parties the data is passed to (and why)",
      "Where the data is stored and how long it's retained",
      "Any special-category data involved (e.g. health, safeguarding)",
    ],
    wrongItems: [
      "Copies of actual students' ID documents and records",
      "The admissions team's internal performance reviews",
      "Your own login access to the admissions system",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Admissions / Student Records Lead",
        initials: "AR",
        opener:
          "Happy to walk you through it. We collect name, date of birth, contact details, prior-school records and ID documents at application. It goes into the admissions system, then into the LMS once enrolled, and we use a third-party identity-verification service. We do occasionally get safeguarding notes, which are sensitive. We keep most of it… honestly, indefinitely — nobody's ever told us to delete it.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "That's really useful, thank you. The indefinite retention and the safeguarding notes are exactly what I need to flag. Can you confirm whether the identity-verification vendor is in the EU or transfers data abroad, and whether there's a contract covering it?" },
              { id: "B", correct: false, text: "Great, that's enough detail, thanks.", coaching: "Indefinite retention and a third-party transfer are unresolved GDPR risks — don't stop short of them." },
              { id: "C", correct: false, text: "Can you also give me the actual student records themselves?", coaching: "You're mapping the flow, not collecting the live personal data — that's over-collection." },
            ],
            stakeholderNext:
              "The verification vendor is US-based, I think — and I'm honestly not sure there's a data-processing agreement in place, that'd be a question for procurement. The safeguarding notes are stored in the same system as everything else, no separate restriction. Does that raise a flag?",
          },
          {
            options: [
              { id: "A", correct: true, text: "It does — a US transfer with no confirmed DPA, plus special-category safeguarding data held with no extra access restriction and indefinite retention. I'll record all three as GDPR findings and verify the DPA position with procurement. Thank you." },
              { id: "B", correct: false, text: "I'm sure it's fine, I'll just note the data flows and move on.", coaching: "An unconfirmed international transfer of special-category data is a serious flag, not a footnote." },
              { id: "C", correct: false, text: "Let's just assume there's a DPA and retention is compliant.", coaching: "Assuming compliance is the opposite of a data-flow assessment." },
            ],
          },
        ],
        metEnd: "Objective met — the admissions data flow is captured with retention, special-category and transfer risks flagged for the GDPR applicability assessment.",
        missEnd: "Objective not met — no usable flow detail captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Admissions / Student Records Lead",
        initials: "AR",
        opener:
          "The data flow? I mean, students apply and we process them. It all goes into the system. I'm not totally sure where it ends up after that — IT handles the technical side. What specifically do you want to know? I don't want to give you wrong information.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let's take it step by step: at application, which exact fields do you collect, and do you capture any ID or health/safeguarding information? Just the parts you handle directly — I'll get the downstream systems from IT separately." },
              { id: "B", correct: false, text: "Just describe the whole thing however you like.", coaching: "An open 'describe it however' from an unsure owner yields vague, unusable detail — structure the questions." },
              { id: "C", correct: false, text: "If you're not sure, just guess where the data goes.", coaching: "Encouraging guesses gives you a flow map you can't rely on." },
            ],
            stakeholderNext:
              "Okay, at application: name, DOB, address, previous school, and we upload a copy of ID. Sometimes a safeguarding note comes through, yes. After that it's in the admissions system and I think it syncs to the learning platform but I couldn't tell you how. Is that the kind of thing?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Exactly that, thank you. I'll record the fields and the safeguarding data you've confirmed, mark the sync to the learning platform as 'to verify with IT', and flag anything unconfirmed rather than guessing." },
              { id: "B", correct: false, text: "Perfect, I'll just write that it all syncs fine to everything.", coaching: "Writing 'syncs fine to everything' as fact when the owner was unsure fabricates the map." },
              { id: "C", correct: false, text: "Good enough, I'll fill in the rest from how these usually work.", coaching: "Filling gaps with assumptions defeats a real data-flow map." },
            ],
          },
        ],
        metEnd: "Objective met — the owner-confirmed parts captured, unconfirmed handoffs marked for verification. Structured questions get usable detail from an unsure owner.",
        missEnd: "Objective not met — no usable flow detail captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad / intrusive request → Defensive thread.",
        speaker: "Admissions / Student Records Lead",
        initials: "AR",
        opener:
          "I have to be careful here — this is student personal data, some of it about minors and safeguarding. I'm not comfortable sharing the detail without knowing this is authorised. Who's overseeing this, and are you asking me to describe the process, or to hand over actual records? Those are very different things.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Completely understood — I only need you to describe the process and categories of data, not any actual student records. It's the GDPR data-flow mapping supervised by my mentor [name], who can confirm. No real personal data needs to leave your system." },
              { id: "B", correct: false, text: "Just send me a sample of real records so I can see the fields.", coaching: "You never need live student records — especially minors' — to map a flow. Ask about categories, not records." },
              { id: "C", correct: false, text: "It's an internal review, you don't need to worry about authorisation.", coaching: "Brushing off authorisation when minors' data is involved is a serious misstep." },
            ],
            stakeholderNext:
              "Thank you — describing the process and data categories I can do, once your mentor confirms. I'd want to keep the safeguarding specifics high-level. Is a categorised description, rather than anything case-level, enough for your map?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Yes — categorised and high-level is exactly right, no case-level detail at all. I'll have my mentor confirm the purpose in writing. The fact that safeguarding data sits here at all is what I need to note, not its contents." },
              { id: "B", correct: false, text: "Actually the case-level detail would help me be thorough.", coaching: "Case-level safeguarding detail is never needed for a flow map — that's intrusive over-collection." },
              { id: "C", correct: false, text: "This is overkill, I'll just map it from the public prospectus.", coaching: "A prospectus won't show the real internal data flow — see the authorisation through instead." },
            ],
          },
        ],
        metEnd: "Objective met — a categorised, minimised description obtained with proper authorisation. Respecting minors' data is exactly the right instinct here.",
        missEnd: "Objective not met — no usable flow detail captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ CRM-001 · Regulatory Requirements Inventory — Step 7.2 (scope confirmation) ════════════ */
  "CRM-001/7.2": {
    recipient: "Legal / Compliance Officer + IT Manager",
    subject: "Request: Confirmation of regulatory scope for the obligations register",
    purpose:
      "To finalise the regulatory requirements inventory I need Legal/Compliance and IT to confirm which regulations actually apply to us, so the obligations register reflects our real scope (ISO 27001 Annex A 5.31 / 5.36).",
    suggestedItems: [
      "Confirmed list of regulations/standards that apply to the organisation (e.g. GDPR, sector rules)",
      "Which jurisdictions / territories we operate or hold data in",
      "Any contractual or customer-driven compliance obligations to include",
    ],
    wrongItems: [
      "A binding legal opinion you can hold the organisation to",
      "Every law in every country mentioned online, just in case",
      "Legal's confidential advice on past compliance breaches",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Legal / Compliance + IT Manager",
        initials: "LC",
        opener:
          "Legal/Compliance: Glad you're confirming this rather than assuming. Definitely in scope: UK/EU GDPR (we have EU students), the e-Privacy rules for our marketing, and our sector's safeguarding obligations.\n\nIT Manager: From the data side, we host in the EU but use a couple of US-based SaaS tools, so international-transfer rules are relevant. We also have a big customer who contractually requires ISO 27001 alignment.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thank you both. So GDPR, e-Privacy, safeguarding, transfer rules and the contractual ISO 27001 requirement. Can you confirm whether any US state privacy laws apply given the US SaaS tools, or is processing genuinely EU-only?" },
              { id: "B", correct: false, text: "Great, GDPR is the main one — I'll just build the register around that.", coaching: "They named several obligations beyond GDPR — a register that drops them is incomplete." },
              { id: "C", correct: false, text: "Can you confirm every law in every country just in case?", coaching: "'Every law everywhere' isn't a scope — confirm what actually applies to your operations." },
            ],
            stakeholderNext:
              "Legal/Compliance: Processing is EU-only — the US tools are just sub-processors, so US state laws don't bite directly, but the transfer mechanism for those tools does need to be in the register.\n\nIT Manager: Agreed. And note the contractual ISO 27001 obligation has an audit-evidence requirement attached, so it's not just 'alignment' — there's a deadline.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Clear — I'll record GDPR, e-Privacy, safeguarding, the transfer mechanism for the US sub-processors, and the contractual ISO 27001 obligation with its audit deadline. I'll have you both confirm the final register before it's signed off." },
              { id: "B", correct: false, text: "I'll leave the contractual ISO obligation out, it's not a law.", coaching: "Contractual compliance obligations belong in the register — they bind you just as much." },
              { id: "C", correct: false, text: "I'll just note 'GDPR and others' to keep it short.", coaching: "'And others' is useless in an obligations register — name each one." },
            ],
          },
        ],
        metEnd: "Objective met — confirmed regulatory and contractual scope captured for the obligations register, ready for sign-off.",
        missEnd: "Objective not met — scope not confirmed. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Legal / Compliance + IT Manager",
        initials: "LC",
        opener:
          "Legal/Compliance: Which regulations apply? Quite a few, probably. GDPR obviously. Beyond that I'd have to think — it's not something we've got written down in one place, which is partly why you're doing this.\n\nIT Manager: Yeah, I know we have some US tools and an EU hosting setup but I'm not the person to say what's legally in scope. You'd want Legal to confirm.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — let me make it concrete. Legal: can you confirm yes/no on GDPR, e-Privacy for marketing, and our sector's safeguarding rules? IT: just tell me the jurisdictions we host in and the third-party tools, and I'll bring those back to Legal to confirm scope." },
              { id: "B", correct: false, text: "Okay, I'll just go with GDPR and whatever else seems likely.", coaching: "'Whatever seems likely' isn't a confirmed scope — get explicit confirmation." },
              { id: "C", correct: false, text: "If it's not written down, I'll just leave the register mostly blank.", coaching: "The whole point of the task is to create that missing record — don't leave it blank." },
            ],
            stakeholderNext:
              "Legal/Compliance: Put like that — yes to GDPR, yes to e-Privacy, yes to the safeguarding rules. There may be one or two sector-specific items I'd need to check properly.\n\nIT Manager: We host in the EU, and the third-party tools are [vendor A, vendor B], both US-based.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Great — I'll record those as confirmed, list the sector-specific items as 'pending Legal confirmation' with a follow-up date, and add the US tools as a transfer consideration. I won't mark anything confirmed that hasn't been." },
              { id: "B", correct: false, text: "I'll just mark all of it confirmed to finish the register.", coaching: "Marking unconfirmed items as confirmed makes the register unreliable." },
              { id: "C", correct: false, text: "The pending items can be dropped, they're probably not relevant.", coaching: "Dropping items you haven't checked risks missing a real obligation." },
            ],
          },
        ],
        metEnd: "Objective met — confirmed items recorded and unconfirmed ones flagged for follow-up. Asking for yes/no confirmation per item gets you firm answers.",
        missEnd: "Objective not met — scope not confirmed. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad / unsponsored request → Defensive thread.",
        speaker: "Legal / Compliance + IT Manager",
        initials: "LC",
        opener:
          "Legal/Compliance: Confirming our regulatory scope is effectively a legal position the organisation could be held to — I'm cautious about signing that off for a trainee project without knowing it's sanctioned. Who's the sponsor, and is this going into something formal?\n\nIT Manager: Same — I don't want my off-hand list of tools treated as a definitive compliance statement.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — this is a draft obligations register for the GRC engagement, supervised by my mentor [name]; nothing is a binding legal position and I'll mark your input as 'to be formally validated'. I just need your steer on what's clearly in scope. Does that ease it?" },
              { id: "B", correct: false, text: "Just give me your definitive legal position, that's what I need.", coaching: "Demanding a binding legal position for a trainee exercise is the wrong ask — frame it as draft input." },
              { id: "C", correct: false, text: "It's only an internal exercise, your input won't matter anyway.", coaching: "Telling stakeholders their input doesn't matter guarantees they won't engage." },
            ],
            stakeholderNext:
              "Legal/Compliance: If it's clearly framed as draft and to-be-validated, I'm comfortable confirming the obvious ones — GDPR, e-Privacy, safeguarding — and noting the rest needs proper legal review.\n\nIT Manager: And I'm fine listing the tools as factual, as long as the compliance conclusion is Legal's, not mine.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Perfect — I'll attribute the compliance conclusions to Legal's validation, list IT's tools as factual inputs, and clearly mark the register as draft pending formal review. Thank you both for the careful framing." },
              { id: "B", correct: false, text: "I'll just present it as the final confirmed scope to save time.", coaching: "Presenting draft input as final confirmed scope misrepresents their position." },
              { id: "C", correct: false, text: "Forget it, I'll decide the scope myself from online research.", coaching: "Guessing legal scope from the internet, against their caution, is exactly what to avoid." },
            ],
          },
        ],
        metEnd: "Objective met — a properly-framed draft scope confirmed, with formal validation flagged. Framing the ask as draft input unlocks cautious stakeholders.",
        missEnd: "Objective not met — scope not confirmed. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ DD-001 · Incident Reporting Procedure — Step 2 (current reporting path) ════════════ */
  "DD-001/2": {
    recipient: "IT Manager + front-line staff member",
    subject: "Request: How incidents are reported today (current informal path)",
    purpose:
      "Before drafting the incident-reporting procedure I need to understand how staff actually report incidents today, so the new procedure fits reality rather than an idealised flow (ISO 27001 Annex A 5.24 / 5.25 / 5.26).",
    suggestedItems: [
      "The current route a staff member uses to report a suspected incident",
      "Who receives it and what happens next (triage, escalation)",
      "Where it's recorded, if anywhere",
      "Known pain points or cases that fell through the cracks",
    ],
    wrongItems: [
      "A list of every past incident naming who caused each one",
      "Five years of all IT support tickets in full",
      "Disciplinary records for staff who didn't report incidents",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "IT Manager / Front-line staff",
        initials: "IT",
        opener:
          "IT Manager: Honestly there's no formal route. People mostly message me on Teams or grab me in the corridor. I log the bigger ones in a spreadsheet; the smaller ones I just deal with and forget.\n\nFront-line staff: Yeah, if I saw something odd I'd probably email IT or ask my team lead. I wouldn't really know what counts as an 'incident' to be honest.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "That's exactly the reality I need. Two things stand out: there's no single intake point, and staff aren't sure what qualifies as an incident. Can you give me an example of one that fell through the cracks, and roughly how many you log a month?" },
              { id: "B", correct: false, text: "Okay, so IT handles it — that's enough, I'll write the procedure now.", coaching: "The gaps they just described — no intake point, unclear definitions — are what the procedure must fix. Dig in." },
              { id: "C", correct: false, text: "Can you pull every IT ticket from the last five years?", coaching: "Five years of all tickets is disproportionate — you need the reporting path, not the full history." },
            ],
            stakeholderNext:
              "IT Manager: A month? Maybe five or six I'd call real incidents, but I bet there are more I never hear about. One that slipped: a phishing email a few people clicked — I only found out a week later because no one knew to report it.\n\nFront-line staff: That's the thing, I wouldn't have reported that — I'd have just deleted it.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That phishing example is perfect for the draft — delayed detection because there's no clear 'report it here' route or definition. I'll design a single intake channel, simple criteria for what to report, and a basic log, then bring the draft back to you both to sanity-check." },
              { id: "B", correct: false, text: "I'll just write a formal multi-tier escalation policy, that'll fix it.", coaching: "A heavy policy that ignores how staff actually behave will be ignored too — fit it to reality." },
              { id: "C", correct: false, text: "I'll note that everything works fine and just needs writing down.", coaching: "They told you incidents go unreported — that's not 'working fine'." },
            ],
          },
        ],
        metEnd: "Objective met — the real current reporting path and its gaps are captured to inform a procedure that fits how staff actually work.",
        missEnd: "Objective not met — current path not understood. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "IT Manager / Front-line staff",
        initials: "IT",
        opener:
          "IT Manager: How do incidents get reported… I suppose people just tell us. It varies. I don't think we've ever written it down properly. What are you actually after?\n\nFront-line staff: I'm not sure I've ever reported one, so I don't really know the process either.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let me make it concrete. IT: think of the last incident someone raised — how did it reach you, and what did you do? Front-line: if you spotted a suspicious email right now, what's the first thing you'd do? Just walk me through those two." },
              { id: "B", correct: false, text: "Never mind the detail, just tell me it goes to IT.", coaching: "'It goes to IT' is too thin to base a procedure on — get the actual steps." },
              { id: "C", correct: false, text: "If you don't know, I'll just invent a process that sounds right.", coaching: "Inventing a process detached from reality is exactly what to avoid here." },
            ],
            stakeholderNext:
              "IT Manager: Last one — someone phoned me to say a laptop was stolen. I told them to change their passwords and I noted it somewhere. No formal record really.\n\nFront-line staff: A suspicious email? I'd probably just ignore it, or maybe ask a colleague if they got it too.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's enough to work with: reports arrive ad-hoc by phone/chat, recording is inconsistent, and front-line staff default to ignoring things. I'll capture that as the current state and design the procedure to close those specific gaps." },
              { id: "B", correct: false, text: "Great, sounds like it basically works — I'll just formalise it as-is.", coaching: "Formalising an ad-hoc, inconsistent process without fixing it misses the point." },
              { id: "C", correct: false, text: "I'll write that staff always report promptly to IT.", coaching: "That directly contradicts what they told you — don't document a fiction." },
            ],
          },
        ],
        metEnd: "Objective met — the current ad-hoc path captured by walking through real examples. Concrete 'what did you actually do' questions beat abstract ones.",
        missEnd: "Objective not met — current path not understood. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Poorly-framed / blame-toned request → Defensive thread.",
        speaker: "IT Manager / Front-line staff",
        initials: "IT",
        opener:
          "IT Manager: Are you asking because something's gone wrong? I'm a bit wary of documenting 'how bad our current process is' if it's going to be used to point fingers. What's this feeding into, and who sees it?\n\nFront-line staff: Yeah, I don't want to get anyone in trouble by saying we don't really report things.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Not at all — this isn't about blame. I'm building a better reporting procedure, supervised by my mentor [name], and the honest current picture just helps me design something that works. Gaps are expected and won't be attributed to anyone." },
              { id: "B", correct: false, text: "I just need to record where the current process is failing, names included.", coaching: "Framing it as cataloguing failures with names will shut people down — focus on the process, not individuals." },
              { id: "C", correct: false, text: "Don't worry about who sees it, just answer the questions.", coaching: "Dismissing a fair confidentiality concern hardens the resistance." },
            ],
            stakeholderNext:
              "IT Manager: Okay, if it's about improving things rather than auditing us, I'm happy to be candid. The real answer is there's no defined process and I rely on people knowing to come to me.\n\nFront-line staff: Same — I'd be honest if I knew it wasn't going to land on anyone.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Exactly — process-focused, no attribution. So: no defined route, reliance on people knowing to contact IT, inconsistent recording. I'll capture that as the baseline to improve and share the draft procedure with you, not a report on you." },
              { id: "B", correct: false, text: "Thanks — I'll still note in my report which staff don't report incidents.", coaching: "Naming individuals after promising not to breaks trust and is poor practice." },
              { id: "C", correct: false, text: "Good enough, I'll just assume the rest works properly.", coaching: "Don't paper over the gaps you were just told about." },
            ],
          },
        ],
        metEnd: "Objective met — candid current-state captured by framing it as improvement, not audit. Reassuring stakeholders on attribution unlocks honesty.",
        missEnd: "Objective not met — current path not understood. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ LRC-001 · Privacy Notice Review — Step 1 (obtain current notice) ════════════ */
  "LRC-001/1": {
    recipient: "Marketing / Website Owner",
    subject: "Request: Current published privacy notice for review",
    purpose:
      "To run the privacy-notice gap assessment I need the exact version currently published on the website, so I review what data subjects actually see (GDPR Art 13 / 14; ISO 27001 Annex A 5.34).",
    suggestedItems: [
      "The privacy notice exactly as published on the live website (link or copy)",
      "When it was last reviewed or updated, and by whom",
      "Whether different notices exist for different audiences (e.g. students vs staff)",
    ],
    wrongItems: [
      "All internal data-processing agreements and vendor contracts",
      "The website's full source code and CMS admin access",
      "Internal staff data-handling policies and procedures",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Marketing / Website Owner",
        initials: "MK",
        opener:
          "Sure — here's the link to the live privacy notice. I'll be honest, I think it was last updated a couple of years ago and I'm not certain it reflects the new student platform we launched. There's also a separate, older one buried on the careers page. I can send both.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thank you — please send both. The two-year-old date and the possibility it predates the new platform are exactly what I'll assess. Do you know who's the actual owner of the notice — Marketing, Legal, or the DPO?" },
              { id: "B", correct: false, text: "Great, the main one is fine — ignore the careers-page version.", coaching: "A second, inconsistent notice in production is itself a gap — don't ignore it." },
              { id: "C", correct: false, text: "Can you also send all internal HR and staff data policies?", coaching: "Scope is the published privacy notice — internal HR policies are a different task." },
            ],
            stakeholderNext:
              "Ownership is a bit grey, honestly — Marketing publishes it but the wording came from a template Legal gave us ages ago, and I'm not sure the DPO has ever reviewed the current text. The careers one I'd forgotten about until you asked.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's useful — unclear ownership and no recent DPO review are findings in themselves. I'll assess both notices against the Art 13/14 requirements and the new platform's processing, and flag the ownership gap. I'll review my findings with my mentor before reporting." },
              { id: "B", correct: false, text: "I'll just check the main notice has a privacy policy heading and call it compliant.", coaching: "A heading isn't compliance — assess it against the actual Art 13/14 content requirements." },
              { id: "C", correct: false, text: "Ownership doesn't matter, I'll just review the words.", coaching: "Unclear ownership is exactly why notices go stale — it belongs in the assessment." },
            ],
          },
        ],
        metEnd: "Objective met — both published notices and the ownership/review gaps captured for the Art 13/14 assessment.",
        missEnd: "Objective not met — no usable notice captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Marketing / Website Owner",
        initials: "MK",
        opener:
          "The privacy notice? It's on the website somewhere — footer, I think. I didn't write it so I'm not sure of the details. Did you want me to find it, or can you just grab it off the site yourself? Not sure what else you need from me.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "I can pull it from the footer, thanks — but could you confirm that's the only published version, and tell me when it was last changed and who signed it off? Those facts aren't visible on the page itself but matter for the review." },
              { id: "B", correct: false, text: "Never mind, I'll just use whatever I find on the site.", coaching: "Without confirming it's the current, sole version you may review the wrong text." },
              { id: "C", correct: false, text: "Just paste me the whole website content and I'll find it.", coaching: "Asking for the whole site instead of the specific notice is unscoped." },
            ],
            stakeholderNext:
              "Let me check… okay, the footer one is the main version. There might be an older one linked from an old campaign page, I'm not 100% sure. Last changed — I genuinely don't know, it was before my time. Sorry that's not very helpful.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's actually helpful — 'no known review date' and a possible stray older version are findings. I'll record the footer notice as the primary, search for the campaign-page version, and flag the unknown review history rather than guessing a date." },
              { id: "B", correct: false, text: "I'll just assume it was reviewed recently and move on.", coaching: "Assuming a recent review when nobody can confirm one undermines the assessment." },
              { id: "C", correct: false, text: "Forget the older version, one notice is enough to review.", coaching: "A stray outdated notice in production is a real inconsistency to surface." },
            ],
          },
        ],
        metEnd: "Objective met — the current notice located and review-history gaps documented. Confirming version, date and ownership turns a casual reply into usable facts.",
        missEnd: "Objective not met — no usable notice captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad / off-scope request → Defensive thread.",
        speaker: "Marketing / Website Owner",
        initials: "MK",
        opener:
          "Hang on — you're asking for the privacy notice but you also mentioned internal data handling and our processor contracts. Those aren't mine to share and some are confidential. What exactly is this review, and who authorised it? The published notice is public, but the rest I can't just hand over.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "You're right to separate those — for this step I only need the published privacy notice, which is already public. The internal and contract pieces aren't in scope here. It's the privacy-notice gap assessment supervised by my mentor [name]." },
              { id: "B", correct: false, text: "While you're here, send the processor contracts too, it'll save time.", coaching: "Pulling confidential contracts into a public-notice review is scope creep — keep them separate." },
              { id: "C", correct: false, text: "Just send me everything privacy-related and I'll sort what I need.", coaching: "'Everything privacy-related' is the over-broad ask that triggered the push-back." },
            ],
            stakeholderNext:
              "Okay, if it's just the published notice then that's no problem at all — it's public anyway. I'll send the live link and the careers-page one. I'd rather keep the contract and internal-handling questions for whoever owns those, if that's alright.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Absolutely — just the published notices, and I'll route any contract or internal-handling questions to the right owners separately. Thanks for keeping the confidential material properly held; that's the correct call." },
              { id: "B", correct: false, text: "Fine, but I might still need those contracts later so keep them ready.", coaching: "Pre-loading an out-of-scope confidential request keeps the friction alive unnecessarily." },
              { id: "C", correct: false, text: "This is a lot of caution for a public document.", coaching: "Their caution was about the confidential extras you raised, not the notice — acknowledge it." },
            ],
          },
        ],
        metEnd: "Objective met — the published notices obtained, confidential material left with its owners. Scoping the request to the public notice avoids the stand-off.",
        missEnd: "Objective not met — no usable notice captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ GRM-003 · GRC Maturity Assessment — Step 6.3 (maturity evidence) ════════════ */
  "GRM-003/6.3": {
    recipient: "Department Head + IT Lead",
    subject: "Request: Evidence to support the departmental GRC maturity rating",
    purpose:
      "To score the department's GRC maturity objectively I need evidence behind the self-assessment, so ratings are based on artefacts rather than opinion (ISO 27001 Annex A 5.1 / 5.35 / 5.36).",
    suggestedItems: [
      "Documented policies/procedures the department actually follows",
      "Evidence a control operates (e.g. records, logs, sign-offs from the last quarter)",
      "Any prior audit, review or risk-assessment outputs for the department",
    ],
    wrongItems: [
      "Each team member's individual performance ratings",
      "Confidential board minutes discussing the department",
      "A signed admission of every control failure for the record",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Department Head / IT Lead",
        initials: "DH",
        opener:
          "Department Head: Happy to back up the self-assessment. We rated ourselves 'managed' on most areas. I can share our documented procedures and the last team-meeting minutes where we review issues.\n\nIT Lead: I can give you access logs and the change-approval records. I'll be straight with you though — we rated 'managed' on access reviews but I'm not sure we've actually done one in the last six months.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Thanks both — the documents and logs are exactly what I need. The access-review point is important: if there's no evidence of one in six months, the honest rating may be lower than 'managed'. Can you send whatever access-review records do exist, even if partial?" },
              { id: "B", correct: false, text: "Great, I'll just accept the 'managed' self-ratings and attach the docs.", coaching: "If the evidence contradicts the self-rating, the rating must change — that's the point of evidencing it." },
              { id: "C", correct: false, text: "Don't worry about evidence, your self-assessment is good enough.", coaching: "A maturity assessment without evidence is just an opinion — collect the artefacts." },
            ],
            stakeholderNext:
              "IT Lead: Looking… the last documented access review was about ten months ago, not six. So there's a gap. The change-approval records are solid though — those are well kept.\n\nDepartment Head: That's fair. I'd rather the assessment be accurate than flattering, so reflect what the evidence actually shows.",
          },
          {
            options: [
              { id: "A", correct: true, text: "I appreciate that. I'll evidence the change-management area at 'managed' from the strong records, but lower access reviews to reflect the ten-month gap, and note it as an improvement action. I'll review the scored assessment with you and my mentor before it's final." },
              { id: "B", correct: false, text: "I'll keep everything at 'managed' so the department looks consistent.", coaching: "Adjusting evidence to protect appearances is falsifying the assessment." },
              { id: "C", correct: false, text: "I'll just drop the access-review area entirely to avoid the awkwardness.", coaching: "Dropping a weak area hides exactly what the maturity assessment should reveal." },
            ],
          },
        ],
        metEnd: "Objective met — evidence collected and ratings reconciled to what the artefacts actually show, with gaps flagged as improvement actions.",
        missEnd: "Objective not met — ratings not evidenced. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Department Head / IT Lead",
        initials: "DH",
        opener:
          "Department Head: Evidence of our maturity? We feel we're in pretty good shape. I'm not sure what 'evidence' you mean exactly — we don't have a big folder of compliance artefacts, we just get on with the work.\n\nIT Lead: Yeah, things mostly run fine. What kind of thing are you after?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let me make it specific: for each area you rated, I need one artefact that proves the control runs — for access, a recent review record; for change, an approval log; for incidents, a logged example. Even one concrete item per area is enough to start." },
              { id: "B", correct: false, text: "Just tell me your scores and I'll write them up.", coaching: "Self-scores without artefacts aren't a maturity assessment — anchor each to evidence." },
              { id: "C", correct: false, text: "If you feel you're in good shape, I'll just rate you highly.", coaching: "Rating on feelings rather than evidence is precisely what to avoid." },
            ],
            stakeholderNext:
              "IT Lead: Okay, concrete examples — I can find an approval log and probably an incident ticket. Access reviews… I'm not sure we have a record of one, now you mention it.\n\nDepartment Head: And our 'policies' are mostly informal, in people's heads rather than written down. Does that count?",
          },
          {
            options: [
              { id: "A", correct: true, text: "It counts as a finding — informal, undocumented policy is lower maturity, not higher. I'll evidence what you can produce, rate areas with no artefact more conservatively, and note 'document the informal policies' as an action rather than inflating the score." },
              { id: "B", correct: false, text: "Undocumented is fine, I'll rate those areas as 'managed' anyway.", coaching: "'In people's heads' is the definition of low documentation maturity — don't rate it as managed." },
              { id: "C", correct: false, text: "No evidence for an area? I'll just leave that area unrated.", coaching: "A control you can't evidence should be rated low, not skipped." },
            ],
          },
        ],
        metEnd: "Objective met — concrete artefacts gathered and unevidenced areas rated conservatively. Asking for one artefact per area turns vague confidence into a real score.",
        missEnd: "Objective not met — ratings not evidenced. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Threatening / audit-toned request → Defensive thread.",
        speaker: "Department Head / IT Lead",
        initials: "DH",
        opener:
          "Department Head: Is this going to be used to rank departments against each other? I'm not keen on handing over 'evidence' that could be used to make us look bad to senior management. Who sees this maturity score, and what happens with it?\n\nIT Lead: Same concern — I don't want our gaps written up as failings.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — this is a developmental maturity baseline for the GRC engagement, supervised by my mentor [name], to identify improvement actions, not to rank or blame. Gaps become a roadmap, not a scoreboard. I'll share the draft with you before anyone else sees it." },
              { id: "B", correct: false, text: "It's going to senior management as-is, so I need your gaps documented.", coaching: "Leading with 'this goes up the chain and I'm documenting your gaps' guarantees defensiveness." },
              { id: "C", correct: false, text: "Don't worry about what happens to it, just send the evidence.", coaching: "Dismissing a legitimate concern about how findings are used hardens it." },
            ],
            stakeholderNext:
              "Department Head: If it's developmental and we see it first, I'm much more comfortable — I'd actually welcome a roadmap. Here are our procedures and meeting records.\n\nIT Lead: Likewise. I'll share the logs, and I'll be honest that access reviews are a weak spot for us.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Thank you — that candour makes the assessment genuinely useful. I'll evidence the strong areas, record access reviews as a known gap with a recommended action, and walk you both through the draft before it goes anywhere." },
              { id: "B", correct: false, text: "Great — I'll highlight the access-review weakness to management straight away.", coaching: "Fast-tracking their disclosed weakness to management breaks the trust you just built." },
              { id: "C", correct: false, text: "Now I have the evidence I'll just score it however looks cleanest.", coaching: "Scoring for a clean look rather than the evidence defeats the assessment." },
            ],
          },
        ],
        metEnd: "Objective met — evidence shared candidly once framed as developmental. Positioning maturity work as a roadmap, not a scoreboard, unlocks honesty.",
        missEnd: "Objective not met — ratings not evidenced. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ CA-003 · Stakeholder Interview — Step 3 (request input from three stakeholders) ════════════ */
  "CA-003/3": {
    recipient: "Three stakeholders (Ops, Quality, IT)",
    subject: "Request: Input on GRC needs for the discovery assessment",
    purpose:
      "To run the GRC needs-discovery I need structured input from key stakeholders on their compliance pain points and priorities, so the assessment reflects real needs across functions (ISO 27001 Annex A 5.2 / 5.4).",
    suggestedItems: [
      "Each stakeholder's top compliance/risk pain points in their area",
      "Controls or processes they feel are missing or weak",
      "Their priorities for the next 6–12 months",
    ],
    wrongItems: [
      "A ranking of which team is the worst performer",
      "Confidential complaints staff have made about each other",
      "Each stakeholder's personal opinion of their colleagues",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Operations / Quality / IT stakeholders",
        initials: "OP",
        opener:
          "Operations: Happy to contribute. My biggest pain is we get audit requests last-minute and scramble for evidence — there's no central place for it.\n\nQuality: For me it's that policies exist but staff don't follow them consistently, and we've no real way to check.\n\nIT: Mine's access management — joiners and leavers aren't handled cleanly, and I worry about who still has access.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "This is really useful — three distinct but related themes: evidence readiness, policy adherence, and access lifecycle. Can each of you give me one concrete recent example, and rank how urgent it feels versus the others' issues?" },
              { id: "B", correct: false, text: "Thanks, Operations' point is the main one — I'll focus the assessment there.", coaching: "A needs discovery captures all stakeholders' needs, not just the first one — don't narrow prematurely." },
              { id: "C", correct: false, text: "Can each of you send me all your team's documents to review?", coaching: "You're gathering needs, not auditing every document — that's a different, over-broad ask." },
            ],
            stakeholderNext:
              "Operations: Concrete example — last month's client audit, we spent three days hunting for evidence we should've had ready. Urgency: high.\n\nQuality: We found staff using an outdated procedure version because there's no version control. Medium-high.\n\nIT: A contractor kept access two months after leaving. That genuinely worries me — high.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Thank you — I'll capture all three with their examples and urgency: evidence management (high), document/version control (medium-high), and access lifecycle (high). I'll synthesise these into prioritised GRC needs and validate the priorities back with you before reporting." },
              { id: "B", correct: false, text: "I'll just pick the one that's easiest to fix and write that up.", coaching: "Cherry-picking the easy issue misrepresents the discovery — report the real priorities." },
              { id: "C", correct: false, text: "I'll merge them into one vague 'needs better compliance' statement.", coaching: "Collapsing distinct needs into a vague statement loses the value of the input." },
            ],
          },
        ],
        metEnd: "Objective met — structured input from all three stakeholders captured with examples and priorities, ready to synthesise into GRC needs.",
        missEnd: "Objective not met — stakeholder input not properly captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Operations / Quality / IT stakeholders",
        initials: "OP",
        opener:
          "Operations: Input on… GRC? Not sure what you want from me exactly. Things are mostly okay I guess.\n\nQuality: Yeah, what kind of input? I don't want to waste your time with the wrong stuff.\n\nIT: Same — give me a steer on what you're looking for.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Of course — three quick questions each: what's the one compliance or risk thing that causes you the most hassle, what control do you wish you had, and what's your top priority this year? Just a sentence on each is perfect." },
              { id: "B", correct: false, text: "Just tell me anything that comes to mind about compliance.", coaching: "An open 'anything' prompt to unsure stakeholders yields little — give them structure." },
              { id: "C", correct: false, text: "Never mind, I'll just write the needs assessment myself.", coaching: "Writing a needs discovery without the stakeholders' input defeats its purpose." },
            ],
            stakeholderNext:
              "Operations: Okay — biggest hassle is finding evidence when auditors ask. Wish I had a shared evidence library. Priority: get through the next audit smoothly.\n\nQuality: Hassle is people not following current procedures. Wish: a way to confirm they've read them. Priority: consistency.\n\nIT: Hassle: messy access changes. Wish: an automated joiner/leaver process. Priority: tighten access.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's exactly what I needed — clear, comparable answers from each of you. I'll record these as the discovered needs (evidence library, procedure assurance, access automation) and bring a prioritised summary back to confirm I've understood your priorities correctly." },
              { id: "B", correct: false, text: "Good enough — I'll just list 'general compliance improvements'.", coaching: "Flattening specific, useful answers into 'general improvements' wastes the input." },
              { id: "C", correct: false, text: "I'll just go with whichever sounds most impressive in the report.", coaching: "Reporting on impressiveness rather than the actual needs is dishonest discovery." },
            ],
          },
        ],
        metEnd: "Objective met — comparable input drawn from each stakeholder via structured questions. Three concrete prompts beat an open 'tell me anything'.",
        missEnd: "Objective not met — stakeholder input not properly captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Unfocused / unsponsored request → Defensive thread.",
        speaker: "Operations / Quality / IT stakeholders",
        initials: "OP",
        opener:
          "Operations: Before I share our problems — is this going to come back as a list of things my team is doing wrong? Who asked for this?\n\nQuality: I'm cautious too; airing our gaps to a reviewer I don't know feels risky.\n\nIT: What's the assessment actually for, and where does it go?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Fair questions — this is a GRC needs-discovery for the engagement, supervised by my mentor [name]. The aim is to identify where support and investment would help you, not to grade your teams. Your input shapes recommendations, and I'll share the summary with you first." },
              { id: "B", correct: false, text: "I need to document each team's weaknesses, so let's get into them.", coaching: "Opening with 'document your weaknesses' to wary stakeholders shuts the conversation down." },
              { id: "C", correct: false, text: "It doesn't concern you where it goes, just give me your issues.", coaching: "Refusing to explain the purpose deepens the distrust." },
            ],
            stakeholderNext:
              "Operations: If it's about getting us support rather than catching us out, I'm in. My real need is evidence readiness.\n\nQuality: Okay — mine's procedure adherence, and I'd welcome help fixing it.\n\nIT: Then I'll say it plainly: access lifecycle is a mess and I'd love it prioritised.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Thank you — that's exactly the candour that makes this useful. I'll capture evidence readiness, procedure adherence and access lifecycle as prioritised needs framed as opportunities for support, and review the summary with the three of you before it goes further." },
              { id: "B", correct: false, text: "Great — I'll report these straight up as departmental failings.", coaching: "Reframing their candid needs as 'failings' to leadership betrays the trust you built." },
              { id: "C", correct: false, text: "Now I'll just rank which team looks worst.", coaching: "Ranking teams is the blame exercise you promised this wasn't." },
            ],
          },
        ],
        metEnd: "Objective met — honest needs gathered once framed as support, not judgement. Explaining purpose and sharing the draft first unlocks cautious stakeholders.",
        missEnd: "Objective not met — stakeholder input not properly captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ DD-003 · Data Retention Schedule — Step 3 (storage/backup/archive detail) ════════════ */
  "DD-003/3": {
    recipient: "Data Owner + IT / System Owner",
    subject: "Request: Storage, backup and archive detail for the retention schedule",
    purpose:
      "To build the data-retention schedule I need to know where each data set lives, how it's backed up and how long it's archived, so retention periods are defined against reality (ISO 27001 Annex A 5.33 / 5.34 / 8.13).",
    suggestedItems: [
      "Where each key data set is stored (system / location, prod and backup)",
      "Backup frequency and how long backups/snapshots are retained",
      "Any archive tiers and how long data sits there before deletion",
      "Current deletion practice — is anything actually deleted, and when?",
    ],
    wrongItems: [
      "A full export of the actual client files themselves",
      "Detailed backup and network architecture diagrams",
      "Admin credentials to the storage and archive systems",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Data Owner / IT System Owner",
        initials: "DO",
        opener:
          "Data Owner: Glad you're formalising this. Client files live in the main case-management system; I treat them as 'keep while the client's active, plus a bit'.\n\nIT System Owner: Technically, the case system backs up nightly and we keep backups for 35 days. Older data moves to a cold archive — but honestly, nothing's ever deleted from the archive. It just accumulates.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Really helpful. The 'nothing's ever deleted from archive' point is the key one — indefinite retention with no deletion is a retention-schedule gap. Can you confirm roughly how far the archive goes back, and whether any data type has a legal minimum or maximum retention?" },
              { id: "B", correct: false, text: "Great, 35-day backups — I'll just put 35 days as the retention period.", coaching: "Backup retention isn't the same as data-retention policy — don't conflate them." },
              { id: "C", correct: false, text: "Don't worry about the archive, just the live system matters.", coaching: "The never-deleted archive is the biggest retention risk — it can't be ignored." },
            ],
            stakeholderNext:
              "IT System Owner: The archive goes back at least eight years, maybe more — predates me.\n\nData Owner: Some client data we're contractually required to keep for six years after the engagement ends, but I'm not aware of anything that says we must delete after — which I suppose is the problem you're pointing at.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Exactly — so I'll set retention at the six-year contractual minimum after engagement end, then a defined deletion step, and flag the eight-year-plus undeleted archive as data held beyond any justified need. I'll confirm the schedule with you and my mentor before it's adopted." },
              { id: "B", correct: false, text: "I'll just write 'keep everything for eight years' to match what happens now.", coaching: "Codifying the current over-retention as policy entrenches the problem instead of fixing it." },
              { id: "C", correct: false, text: "Since deletion is hard, I'll just say retention is 'indefinite'.", coaching: "'Indefinite' retention is a GDPR storage-limitation failure, not a valid schedule." },
            ],
          },
        ],
        metEnd: "Objective met — storage, backup and archive reality captured, with the over-retention gap and contractual minimums informing a real schedule.",
        missEnd: "Objective not met — retention detail not captured. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Data Owner / IT System Owner",
        initials: "DO",
        opener:
          "Data Owner: Retention? We keep things as long as we need them, basically. I couldn't give you exact periods.\n\nIT System Owner: Storage-wise it's all in the usual systems and they get backed up. I'd have to dig for specifics on how long. What level of detail do you actually need?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Let's get concrete for the main data types. For client files: which system holds them, how long do backups stay, and is there an archive? Even ballpark figures help — I'll mark anything you're unsure of as 'to confirm' rather than treating estimates as fact." },
              { id: "B", correct: false, text: "Just give me a rough number and I'll use it as the policy.", coaching: "Turning a rough guess into a fixed policy figure is unsafe — confirm the real periods." },
              { id: "C", correct: false, text: "If it's hard to pin down, I'll just leave retention undefined.", coaching: "Leaving retention undefined is the gap the whole task exists to close." },
            ],
            stakeholderNext:
              "IT System Owner: Okay, client files are in the case system, backups roughly a month, and yes there's an archive but I don't know the cut-off — I don't think there is one.\n\nData Owner: And I know we have to keep some things for years contractually, but I'd have to check which.",
          },
          {
            options: [
              { id: "A", correct: true, text: "Good — I'll record the case system and ~month backups as confirmed, flag the archive with 'no known cut-off' as a finding, and list the contractual periods as 'to verify with you'. I won't publish a schedule with invented numbers in it." },
              { id: "B", correct: false, text: "Fine, I'll just fill the unknowns with sensible-sounding periods.", coaching: "Inventing retention periods to fill gaps creates a schedule nobody can defend." },
              { id: "C", correct: false, text: "I'll drop the data types we're unsure about from the schedule.", coaching: "The uncertain data types are exactly the ones needing a defined period." },
            ],
          },
        ],
        metEnd: "Objective met — known detail captured and unknowns flagged for verification. Asking system-by-system turns vague 'as long as we need' into a workable draft.",
        missEnd: "Objective not met — retention detail not captured. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Over-broad / sensitive request → Defensive thread.",
        speaker: "Data Owner / IT System Owner",
        initials: "DO",
        opener:
          "Data Owner: This is sensitive client data — some of it under confidentiality obligations. I can't have it copied or exported just to build a schedule. What exactly are you asking for?\n\nIT System Owner: And our backup/archive architecture is security-relevant detail. Who authorised this, and how much technical detail do you actually need?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Understood — I don't need any client data itself, only metadata: where data types live, backup duration and archive periods. It's the retention-schedule task, supervised by my mentor [name]. Descriptions of the setup, not exports or architecture diagrams, are all I need." },
              { id: "B", correct: false, text: "Just export me a sample of the client files so I understand the data.", coaching: "You never need actual client data to set retention periods — that's needless exposure." },
              { id: "C", correct: false, text: "Send me the full backup architecture too while we're at it.", coaching: "Detailed backup architecture isn't required for a retention schedule — don't over-ask." },
            ],
            stakeholderNext:
              "IT System Owner: Metadata and durations, not architecture — that I'm fine sharing once your mentor confirms. Backups ~35 days, archive is long-term with no fixed cut-off.\n\nData Owner: And I can describe the data categories and contractual keep-periods without exposing any actual client content. That work?",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's exactly the right boundary — categories, durations and contractual periods, no client content or architecture. I'll have my mentor confirm in writing. Thanks for protecting the confidential material; that itself tells me the controls are taken seriously." },
              { id: "B", correct: false, text: "Could you slip in a few real records so I can sanity-check?", coaching: "Asking for real records after agreeing metadata-only reopens the exact risk they raised." },
              { id: "C", correct: false, text: "This is a lot of gatekeeping for a retention project.", coaching: "Protecting confidential client data is the control working, not gatekeeping." },
            ],
          },
        ],
        metEnd: "Objective met — retention metadata obtained without exposing client data or sensitive architecture. Asking for descriptions, not exports, is the right call.",
        missEnd: "Objective not met — retention detail not captured. Review the coaching and try the request again.",
      },
    },
  },

  /* ════════════ KT-002 · Lessons Learned — Step 4 (peer second perspective) ════════════ */
  "KT-002/4": {
    recipient: "Peer mentee",
    subject: "Request: A second perspective on my rotation lessons-learned",
    purpose:
      "To strengthen my end-of-rotation retrospective I want a peer's perspective on my draft lessons-learned, so blind spots are challenged before I finalise (ISO 27001 Annex A 5.1 continual improvement).",
    suggestedItems: [
      "Their honest reaction to my top 3 lessons — do they ring true?",
      "Anything I've over-claimed or framed too positively",
      "A lesson from their rotation that I might be missing",
    ],
    wrongItems: [
      "Them to rewrite your retrospective for you",
      "A copy of their retrospective to submit as your own",
      "Confirmation that everything you wrote is already perfect",
    ],
    threads: {
      cooperative: {
        mood: "cooperative",
        routedBecause: "Clear, scoped request → Cooperative thread.",
        speaker: "Peer mentee",
        initials: "PM",
        opener:
          "Yeah, happy to read it. Quick first reaction: your lessons are solid but they're nearly all positive — 'I learned to scope requests well', 'I built good stakeholder rapport'. It reads a bit like a highlight reel. Did nothing actually go wrong? Mine had a couple of proper stumbles in it.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "That's a fair hit — it is a bit polished. Honestly, my weakest moment was a defensive stakeholder I handled badly at first by pushing too hard. Should I add that as a lesson, even though it's less flattering?" },
              { id: "B", correct: false, text: "No, everything genuinely went well, I'll keep it positive.", coaching: "A retrospective with no failures isn't credible — your peer just flagged that. Reflect honestly." },
              { id: "C", correct: false, text: "Good point, I'll just delete the lessons and keep it vague.", coaching: "Removing specifics to dodge the critique loses the value of the reflection." },
            ],
            stakeholderNext:
              "Definitely add it — 'pushed too hard with a defensive stakeholder, learned to establish authority and need-to-know first' is a way stronger lesson than another success. That's the kind of thing interviewers actually probe. What did you take away from how you recovered?",
          },
          {
            options: [
              { id: "A", correct: true, text: "Good prompt — I recovered by stepping back, framing the purpose and routing approval through my mentor, and it worked. I'll rewrite that as a concrete lesson with the mistake, the fix and the result. Thanks — anything from your rotation I should consider that I've missed?" },
              { id: "B", correct: false, text: "I'll just add the mistake but leave out how I fixed it.", coaching: "A lesson without the recovery and takeaway is half a lesson — include what you'd do differently." },
              { id: "C", correct: false, text: "That's enough feedback, I'll stop there.", coaching: "You asked for a second perspective — capture their missed-lesson before closing." },
            ],
          },
        ],
        metEnd: "Objective met — peer perspective captured and a more honest, credible lesson added with the mistake, fix and takeaway.",
        missEnd: "Objective not met — peer input not used. Review the coaching and try the request again.",
      },
      vague: {
        mood: "vague",
        routedBecause: "Vague request → Vague thread.",
        speaker: "Peer mentee",
        initials: "PM",
        opener:
          "Sure, I can look. Um… it seems fine? Looks good to me. I'm not totally sure what kind of feedback you want — do you want me to just say if it's okay, or something more?",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "Something more, please — be a critical friend. Specifically: which of my three lessons feels weakest or most generic, and is there anything I've claimed that you'd push back on if you were an interviewer? Don't be gentle." },
              { id: "B", correct: false, text: "Just confirming it's okay is fine, thanks.", coaching: "A rubber-stamp isn't a second perspective — ask for specific, critical input." },
              { id: "C", correct: false, text: "Actually never mind, I'll just submit it as is.", coaching: "Abandoning the peer review wastes the chance to catch blind spots." },
            ],
            stakeholderNext:
              "Okay, if you want it straight — lesson two, 'improved my communication', is really generic; it could be anyone's. And you say you 'mastered' risk rating after one task, which an interviewer might find a stretch. The others are fine.",
          },
          {
            options: [
              { id: "A", correct: true, text: "That's genuinely helpful — I'll make lesson two specific with an actual example, and soften 'mastered' to something honest like 'built a working method for risk rating'. Much better than what I had. Thank you for being straight." },
              { id: "B", correct: false, text: "I'll keep 'mastered', it sounds more impressive.", coaching: "Over-claiming you 'mastered' something after one task is exactly the credibility risk they flagged." },
              { id: "C", correct: false, text: "I'll just remove lesson two entirely to avoid the hassle.", coaching: "Deleting a weak lesson rather than improving it loses a real learning point." },
            ],
          },
        ],
        metEnd: "Objective met — specific critique drawn out and used to sharpen the lessons. Asking for the weakest point gets more than 'looks fine'.",
        missEnd: "Objective not met — peer input not used. Review the coaching and try the request again.",
      },
      defensive: {
        mood: "defensive",
        routedBecause: "Defensive / closed framing → Defensive thread.",
        speaker: "Peer mentee",
        initials: "PM",
        opener:
          "Honestly? You've sent this as 'tell me it's good', and last time I gave you real feedback you got a bit prickly about it. I'm happy to help, but only if you actually want the critical version — otherwise I'll just say it's fine and we both move on.",
        rounds: [
          {
            options: [
              { id: "A", correct: true, text: "That's fair, and I'm sorry I was prickly before — I do want the critical version this time. Please be honest; I'd rather hear it from you now than from an interviewer later. What would you challenge?" },
              { id: "B", correct: false, text: "Just give me the positive version, the critical stuff isn't necessary.", coaching: "Asking only for praise defeats the entire purpose of a second perspective." },
              { id: "C", correct: false, text: "You're being oversensitive, just tell me what you think.", coaching: "Dismissing their concern after they flagged your past reaction guarantees shallow feedback." },
            ],
            stakeholderNext:
              "Okay, appreciate that — here it is straight: the retrospective doesn't show much growth, it shows a list of wins. The strongest reflections come from what you got wrong. Right now there's nothing an interviewer can dig into. Can you handle adding a real failure?",
          },
          {
            options: [
              { id: "A", correct: true, text: "I can, and you're right. I'll add the stakeholder situation I handled badly, what I changed, and what I'd do differently next time. That's a more honest and frankly stronger story. Thanks for holding me to it." },
              { id: "B", correct: false, text: "I'll add a 'failure' but make it a humble-brag that's secretly a strength.", coaching: "A fake weakness fools no one — give a genuine lesson." },
              { id: "C", correct: false, text: "On reflection I'll keep it all positive, it's my retrospective.", coaching: "Rejecting the candid feedback you asked for wastes it — and your peer's time." },
            ],
          },
        ],
        metEnd: "Objective met — honest critique invited and acted on, producing a more credible retrospective. Genuinely wanting the critical version is what makes peer review work.",
        missEnd: "Objective not met — peer input not used. Review the coaching and try the request again.",
      },
    },
  },

};

/** Look up an authored conversation by task + activity code. */
export function getRequestConversation(taskCode?: string, activityCode?: string): RequestConversation | undefined {
  if (!taskCode || !activityCode) return undefined;
  return REQUEST_CONVERSATIONS[`${taskCode}/${activityCode}`];
}
