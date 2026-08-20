// Conduct-verb interview flows (no role-agent LLM; static scripted). Source:
// Conduct_Verb_Task_Register.xlsx. Mentee picks 1 of 3 opening approaches → sets the interviewee's
// disposition (cooperative/vague/defensive) → role-agent answers → mentee picks a probe (1 of 3; one
// correct) → follow-up → END. Objective met only via the correct probe.

export interface ConductOption { id: string; text: string; correct: boolean; coaching?: string; }
export interface ConductRound { options: ConductOption[]; stakeholderNext?: string; }
export type ConductMood = "cooperative" | "vague" | "defensive";
export interface ConductThread { mood: ConductMood; opener: string; speaker: string; initials: string; rounds: ConductRound[]; }
export interface ConductOpening { id: string; text: string; routesTo: ConductMood; correct: boolean; coaching?: string; }
export interface ConductTask {
  roleAgent: string; interview: string;
  /** Present-verb only: deck summary + anticipated Q&A shown before the opening. */
  prep?: { deck: string; qa: string[] };
  openings: ConductOpening[];
  threads: Record<ConductMood, ConductThread>;
  metEnd: string; missEnd: string;
}

const MET = "Objective met — you captured specific answers. The interview notes feed the next step (Record / Map / Identify).";
const MISS = "Objective not met — the answers stayed thin or guarded. Review the coaching and re-run the interview.";

export const CONDUCT_TASKS: Record<string, ConductTask> = {
  "MM-002/3": {
    roleAgent: "Risk Owners (review meeting)", interview: "Facilitate the Monthly Risk Review",
    openings: [
      { id: "A", text: "I have circulated the register — for each of your risks I want to know whether likelihood or impact has moved, whether treatment is on track, and anything new.", routesTo: "cooperative", correct: true, coaching: "States the three questions up front; owners can prepare answers." },
      { id: "B", text: "Let us go through the register and see where we are.", routesTo: "vague", correct: false, coaching: "No stated questions — the meeting becomes a status ramble." },
      { id: "C", text: "Several of your treatment actions are overdue, so let us start there.", routesTo: "defensive", correct: false, coaching: "Opens on blame; owners defend rather than disclose." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Risk Owners", initials: "RO", opener: "Mine has not really changed. Still the same as last month.", rounds: [{ options: [
        { id: "A", text: "Nothing changed in the environment either? No new systems, no staff moves, no incidents touching it?", correct: true, coaching: "Tests a claim of no change against events rather than accepting it." },
        { id: "B", text: "Fine, I will mark it unchanged.", correct: false, coaching: "An unchallenged no-change is how a register goes stale." },
        { id: "C", text: "Are you sure? It looks like it should have gone up.", correct: false, coaching: "Leads the owner to your answer instead of testing theirs." },
      ] }] },
      vague: { mood: "vague", speaker: "Risk Owners", initials: "RO", opener: "I am not really sure what you need from me here.", rounds: [{ options: [
        { id: "A", text: "Three things per risk: has likelihood or impact moved, is treatment on track, and is there anything new. Let us take your first risk.", correct: true, coaching: "Re-anchors on the three questions and starts concretely." },
        { id: "B", text: "Just whatever you think is relevant.", correct: false, coaching: "Leaves the owner guessing; you get nothing usable." },
        { id: "C", text: "It is all in the pre-read I sent.", correct: false, coaching: "Dismissive; they did not read it and now will not ask." },
      ] }] },
      defensive: { mood: "defensive", speaker: "Risk Owners", initials: "RO", opener: "We have been flat out. I do not have time for this every month.", rounds: [{ options: [
        { id: "A", text: "Understood — that is worth recording too. If the treatment is not resourced, the score should reflect that rather than assume the action is happening.", correct: true, coaching: "Turns the objection into register data instead of arguing with it." },
        { id: "B", text: "It is only fifteen minutes.", correct: false, coaching: "Minimises their constraint; they disengage." },
        { id: "C", text: "The register has to be updated regardless.", correct: false, coaching: "Process over substance; you get compliance, not information." },
      ] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "IE-002/6": {
    roleAgent: "Document Owners", interview: "Train Document Owners on Version Control",
    openings: [
      { id: "A", text: "Fifteen minutes: where your documents now live, how to name a new version, and who approves. Then you try it once with your own document.", routesTo: "cooperative", correct: true, coaching: "Scoped, timed, and ends in them doing it rather than watching." },
      { id: "B", text: "I will walk you through the new document control policy.", routesTo: "vague", correct: false, coaching: "Walking through a policy is not training; nothing is practised." },
      { id: "C", text: "The old way of saving documents was causing problems, so we are changing it.", routesTo: "defensive", correct: false, coaching: "Opens on their fault; they hear criticism, not instruction." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Document Owners", initials: "DO", opener: "That sounds fine. What happens to the copies I already have on my drive?", rounds: [{ options: [
        { id: "A", text: "Delete them once yours is migrated — an old copy someone can still open is the problem we are fixing.", correct: true, coaching: "Names the actual failure mode: two versions, no way to tell which is current." },
        { id: "B", text: "Keep them as a backup just in case.", correct: false, coaching: "Recreates the duplicate-version problem on day one." },
        { id: "C", text: "That is up to you.", correct: false, coaching: "Leaves the control optional, so it will not hold." },
      ] }] },
      vague: { mood: "vague", speaker: "Document Owners", initials: "DO", opener: "Is this going to change how I actually work day to day?", rounds: [{ options: [
        { id: "A", text: "Two things change: where you save, and adding a version number when you revise. Everything else stays as it is.", correct: true, coaching: "Bounds the change precisely, which is what defuses resistance." },
        { id: "B", text: "There will be a few adjustments here and there.", correct: false, coaching: "Vagueness reads as more than they are being told." },
        { id: "C", text: "It is mostly the same really.", correct: false, coaching: "Understating it means the change is discovered later, badly." },
      ] }] },
      defensive: { mood: "defensive", speaker: "Document Owners", initials: "DO", opener: "My documents were fine. This feels like bureaucracy for its own sake.", rounds: [{ options: [
        { id: "A", text: "Fair challenge. The specific problem: we found the same policy in two versions and could not tell which was current. That is what this stops.", correct: true, coaching: "Answers with the evidenced failure rather than the principle." },
        { id: "B", text: "It is an ISO requirement.", correct: false, coaching: "Compliance framing; they comply minimally and resent it." },
        { id: "C", text: "Everyone has to do it, not just you.", correct: false, coaching: "Deflects instead of answering the objection." },
      ] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "PE-001/1": {
    roleAgent: "Cybersecurity Program Manager", interview: "Agree the Initiative Scope",
    openings: [
      { id: "A", text: "I want to agree scope before I draft the charter: what is in, what is explicitly out, and what success looks like at the end.", routesTo: "cooperative", correct: true, coaching: "Puts exclusions on the table early, where they are cheap." },
      { id: "B", text: "I was going to start drafting the charter and wanted your thoughts.", routesTo: "vague", correct: false, coaching: "No specific ask; you get general encouragement, not decisions." },
      { id: "C", text: "There is a lot that needs fixing, so I think we should cover as much as possible.", routesTo: "defensive", correct: false, coaching: "Unbounded scope; the sponsor sees a project that cannot land." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Cybersecurity Program Manager", initials: "PM", opener: "Good. What are you proposing to leave out?", rounds: [{ options: [
        { id: "A", text: "Group-managed payroll and finance, because the parent programme covers them, and broadcast playout, because it holds no in-scope data. Both need your agreement.", correct: true, coaching: "Exclusions with reasons, offered for agreement rather than announced." },
        { id: "B", text: "Nothing really — I would rather keep options open.", correct: false, coaching: "A charter with no exclusions has no boundary to defend later." },
        { id: "C", text: "Whatever turns out to be too hard.", correct: false, coaching: "Scope by convenience; the first difficulty becomes an exclusion." },
      ] }] },
      vague: { mood: "vague", speaker: "Cybersecurity Program Manager", initials: "PM", opener: "Thoughts on what? Be specific about what you need from me.", rounds: [{ options: [
        { id: "A", text: "Three decisions: the scope boundary, who the accountable sponsor is, and whether month six or month twelve is the success date.", correct: true, coaching: "Converts a vague ask into three answerable questions." },
        { id: "B", text: "Just whether the general direction seems right.", correct: false, coaching: "You get a yes that commits nobody to anything." },
        { id: "C", text: "I will send you the draft when it is ready.", correct: false, coaching: "Defers the decisions to a point where changing them is expensive." },
      ] }] },
      defensive: { mood: "defensive", speaker: "Cybersecurity Program Manager", initials: "PM", opener: "We have tried boiling the ocean before. It failed. Why is this different?", rounds: [{ options: [
        { id: "A", text: "It is not everything — it is four workstreams with named owners and a stated exclusion list. If any of those looks undeliverable, I would rather cut it now than at month six.", correct: true, coaching: "Answers the real objection with bounded scope and an invitation to cut." },
        { id: "B", text: "This time we have management support.", correct: false, coaching: "Asserts a difference without evidencing it." },
        { id: "C", text: "The scope is smaller than it looks.", correct: false, coaching: "Reassurance with nothing behind it." },
      ] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "AA-001/1.2": {
    roleAgent: "Operations Team Lead", interview: "Asset-Discovery Interview",
    openings: [
      { id: "A", text: "Thanks for your time — I'm building the asset register for your unit; no wrong answers. Could you walk me through the main systems and data your team uses day to day?", routesTo: "cooperative", correct: true, coaching: "Sets a cooperative interviewee." },
      { id: "B", text: "Quick ones: do you use a CRM? Do you store customer data? Is it backed up?", routesTo: "vague", correct: false, coaching: "Closed yes/no questions yield thin answers — ask 'walk me through…'." },
      { id: "C", text: "I need to document the shadow IT and unmanaged data in your team — what aren't you supposed to be using?", routesTo: "defensive", correct: false, coaching: "Accusatory framing makes people defensive; lead with purpose, not blame." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Operations Team Lead", initials: "OT",
        opener: "Sure — day to day we live in the CRM and the shared 'Ops' drive; plus a couple of SaaS reporting tools and a ticketing system.",
        rounds: [
          { options: [{ id: "A", text: "For each of those, who's the owner and roughly what kind of data sits in them?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, that's probably everything, thanks.", correct: false, coaching: "You closed before capturing owners and data types — the register will have gaps." }, { id: "C", text: "So you've got unmanaged tools then?", correct: false, coaching: "Turning it into an accusation; you'll lose the candour you just had." }], stakeholderNext: "The CRM owner is me; the Ops drive is shared (no single owner, honestly); the reporting SaaS belongs to Finance. CRM holds customer contacts and contracts." },
        ] },
      vague: { mood: "vague", speaker: "Operations Team Lead", initials: "OT",
        opener: "Erm, we use a few systems… the CRM I think, and some shared folders. You'd probably have to ask IT for the full list.",
        rounds: [
          { options: [{ id: "A", text: "No problem — just for your team: which CRM exactly, and what's the one folder you couldn't work without?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, I'll just put 'CRM and folders' then.", correct: false, coaching: "Recording vague placeholders fails the specificity check." }, { id: "C", text: "So you don't actually know what your team uses?", correct: false, coaching: "Belittling them hardens the vagueness." }], stakeholderNext: "It's the Salesforce one, and the 'Ops 2024' folder — that's the critical one, it's got all our client trackers." },
        ] },
      defensive: { mood: "defensive", speaker: "Operations Team Lead", initials: "OT",
        opener: "Why do you need all this? Is this about the audit? I don't want my team blamed for anything.",
        rounds: [
          { options: [{ id: "A", text: "Totally fair — this isn't about blame; it's the ISO asset register my mentor is supervising, just to know what exists. Could you share at a high level?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "I just need the list, can you give it to me?", correct: false, coaching: "Pushing without reassurance keeps them closed." }, { id: "C", text: "If you won't tell me I'll note your team as non-cooperative.", correct: false, coaching: "Threats are never the mentee's call and destroy the relationship." }], stakeholderNext: "Alright — high level: the CRM and the Ops shared drive are the main things; I'd rather not get into the SaaS tools until I've checked with my manager." },
        ] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "GRM-001/4.2": {
    roleAgent: "Business-Unit Manager", interview: "Risk-Identification Workshop",
    openings: [
      { id: "A", text: "This is a no-blame session to surface risks in your unit — could you walk me through what could realistically go wrong with your client data and delivery?", routesTo: "cooperative", correct: true, coaching: "Sets a cooperative interviewee." },
      { id: "B", text: "Do you have any risks? Any incidents? Anything to report?", routesTo: "vague", correct: false, coaching: "Vague closed questions get 'no, we're fine'." },
      { id: "C", text: "I need to list your unit's failings for the risk register — what have you done badly?", routesTo: "defensive", correct: false, coaching: "Framing risks as 'failings' guarantees defensiveness." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Business-Unit Manager", initials: "BU",
        opener: "Biggest worry is a consultant emailing a client report to the wrong recipient; also laptops with client files getting lost.",
        rounds: [
          { options: [{ id: "A", text: "For each, how often could it happen, how bad would it be, and what controls are in place today?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Right, I'll note those two then.", correct: false, coaching: "Bare risk names can't be scored on the 5×5 — you need L/I/controls." }, { id: "C", text: "So your team is careless with client data?", correct: false, coaching: "Insulting; you'll get nothing more." }], stakeholderNext: "Mis-sent email — maybe monthly, high impact; we have no DLP. Lost laptop — rare, but the disks aren't encrypted." },
        ] },
      vague: { mood: "vague", speaker: "Business-Unit Manager", initials: "BU",
        opener: "I mean… the usual stuff could go wrong I suppose. Nothing major springs to mind.",
        rounds: [
          { options: [{ id: "A", text: "Let's make it concrete — think about last quarter: what nearly went wrong, even a small thing?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, 'usual stuff', I'll note that.", correct: false, coaching: "Un-actionable — fails specificity." }, { id: "C", text: "So you're saying your unit has no risks at all?", correct: false, coaching: "Confrontation closes them down." }], stakeholderNext: "Now you mention it — a consultant did send a draft to the wrong client last month. That happens more than I'd like." },
        ] },
      defensive: { mood: "defensive", speaker: "Business-Unit Manager", initials: "BU",
        opener: "Are these risks going to be pinned on me? I don't want this used against my team in reviews.",
        rounds: [
          { options: [{ id: "A", text: "Not at all — the register is anonymised at unit level and my mentor oversees it; the point is to get support/controls, not blame.", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Just tell me the risks please.", correct: false, coaching: "Pressure without reassurance keeps them guarded." }, { id: "C", text: "If you hide risks that's worse for you later.", correct: false, coaching: "A veiled threat — not your role." }], stakeholderNext: "Alright. Honestly, mis-sent client emails are our real exposure, and we've no tooling to catch them." },
        ] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "CRM-002/8.5": {
    roleAgent: "Process Owner", interview: "Process Control Walk-through",
    openings: [
      { id: "A", text: "I'm validating which security controls apply to your release process — could you walk me through the steps from a code change to production?", routesTo: "cooperative", correct: true, coaching: "Sets a cooperative interviewee." },
      { id: "B", text: "Do you have change control? Code review? Approvals?", routesTo: "vague", correct: false, coaching: "Yes/no control checklist misses how it actually works." },
      { id: "C", text: "I'm checking which controls your process is missing — what's not compliant?", routesTo: "defensive", correct: false, coaching: "'What's missing/non-compliant' framing makes the owner defensive." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Process Owner", initials: "PO",
        opener: "A developer raises a PR, it gets reviewed, then it's merged and deployed via the pipeline; we release a few times a week.",
        rounds: [
          { options: [{ id: "A", text: "Who approves the merge and the production deploy, and is that approval recorded for each release?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Great, so you have change control — thanks.", correct: false, coaching: "'Has change control' without evidence can't be marked Implemented." }, { id: "C", text: "So anyone can just push to production?", correct: false, coaching: "Loaded question; you'll get a defensive non-answer." }], stakeholderNext: "A senior dev approves the PR; the deploy is automated after merge — there's a Git record, but no separate prod-deploy sign-off." },
        ] },
      vague: { mood: "vague", speaker: "Process Owner", initials: "PO",
        opener: "We follow our normal process… code gets reviewed and then it goes out. It's all pretty standard.",
        rounds: [
          { options: [{ id: "A", text: "Walk me through the last release specifically — who reviewed it and how did it reach production?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, 'standard process', noted.", correct: false, coaching: "Generic — can't validate applicability or status." }, { id: "C", text: "'Standard' meaning no real controls then?", correct: false, coaching: "Sarcastic; closes them down." }], stakeholderNext: "Last release — Sam reviewed it, merged it Friday, and the pipeline pushed it live. No, there wasn't a separate approval step." },
        ] },
      defensive: { mood: "defensive", speaker: "Process Owner", initials: "PO",
        opener: "Is this going to slow my team down with new bureaucracy? We ship fast for a reason.",
        rounds: [
          { options: [{ id: "A", text: "No — I'm just documenting what you already do to map it to ISO; I'm not adding steps, my mentor reviews the mapping.", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "I just need to know your controls.", correct: false, coaching: "No reassurance → terse answers." }, { id: "C", text: "If it's not controlled, that's a finding against you.", correct: false, coaching: "Threatening a finding mid-interview backfires." }], stakeholderNext: "Fine — PRs are reviewed by a senior dev, deploys are automated. There's no separate prod sign-off, if that's what you're after." },
        ] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "BCRP-001/2": {
    roleAgent: "Department Manager", interview: "BIA Interview",
    openings: [
      { id: "A", text: "I'm doing a business impact analysis for your department — could you walk me through your most critical functions and what they depend on?", routesTo: "cooperative", correct: true, coaching: "Sets a cooperative interviewee." },
      { id: "B", text: "Are you critical? Do you have dependencies? A backup?", routesTo: "vague", correct: false, coaching: "Abstract yes/no questions miss tolerable-downtime detail." },
      { id: "C", text: "I need to expose your department's continuity gaps — what would collapse first?", routesTo: "defensive", correct: false, coaching: "'Expose gaps/collapse' framing makes the manager defensive." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Department Manager", initials: "DM",
        opener: "Inbound call handling is everything for us; it depends on the telephony platform, the CRM, and network connectivity.",
        rounds: [
          { options: [{ id: "A", text: "If call handling went down, how long before it really hurts, and is there any backup or manual workaround?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, so calls are critical — got it, thanks.", correct: false, coaching: "Without downtime/dependency detail the BIA can't set RTO." }, { id: "C", text: "So you'd be completely dead in the water?", correct: false, coaching: "Exaggeration; you'll lose nuance." }], stakeholderNext: "We can limp for ~30 minutes; after an hour we breach client SLAs. Telephony has no failover — that's our weak point." },
        ] },
      vague: { mood: "vague", speaker: "Department Manager", initials: "DM",
        opener: "Everything we do is important really, hard to pick. We just need to keep running.",
        rounds: [
          { options: [{ id: "A", text: "If you could only restore ONE system first after an outage, which would it be — and why?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, 'everything important', noted.", correct: false, coaching: "Un-prioritised — the BIA can't rank functions." }, { id: "C", text: "You can't say everything is critical, that's not how it works.", correct: false, coaching: "Lecturing; they disengage." }], stakeholderNext: "If I had to choose — the phone system. Without it the agents literally can't work; everything else can wait an hour or two." },
        ] },
      defensive: { mood: "defensive", speaker: "Department Manager", initials: "DM",
        opener: "Is this about cutting my budget or outsourcing us? I've seen 'impact analysis' used that way before.",
        rounds: [
          { options: [{ id: "A", text: "No — it's purely continuity planning, supervised by my mentor; the output actually justifies investment in resilience for your team.", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "It's just standard process, please answer.", correct: false, coaching: "Dismissing the concern keeps them guarded." }, { id: "C", text: "If you won't cooperate I'll just estimate it myself.", correct: false, coaching: "Coercive; you'll get bad data and a damaged relationship." }], stakeholderNext: "Okay, if it's for resilience — call handling is the function that can't stop, and the telephony platform is the single thing it all hangs on." },
        ] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "PE-001/8": {
    roleAgent: "Project Sponsor", interview: "Project Kick-Off Meeting",
    openings: [
      { id: "A", text: "Thanks all for joining — today's aim is to confirm scope, roles and top risks for the gap-closure programme. Sponsor, could you confirm the outcome you expect by quarter-end?", routesTo: "cooperative", correct: true, coaching: "Sets a cooperative interviewee." },
      { id: "B", text: "So… everyone clear? Any questions? Shall we start?", routesTo: "vague", correct: false, coaching: "No agenda or direction; the meeting drifts." },
      { id: "C", text: "Before we begin — who's going to be responsible when this slips?", routesTo: "defensive", correct: false, coaching: "Opening on blame poisons the kick-off." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Project Sponsor", initials: "PS",
        opener: "Yes — by quarter-end I want the top-5 CIS gaps closed and a clean follow-up assessment; the budget's approved.",
        rounds: [
          { options: [{ id: "A", text: "Understood — who owns each workstream, and what's the single biggest risk to that quarter-end date?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Great, let's get going then.", correct: false, coaching: "You skipped roles and risks — the charter won't be confirmed." }, { id: "C", text: "And whose fault will it be if we miss it?", correct: false, coaching: "Hunting for blame derails alignment." }], stakeholderNext: "IT owns remediation, Compliance owns the evidence; the biggest risk is staff availability during month-end close." },
        ] },
      vague: { mood: "vague", speaker: "Project Sponsor", initials: "PS",
        opener: "I just want us to, you know, improve our security posture generally. See how it goes.",
        rounds: [
          { options: [{ id: "A", text: "To scope it — what would 'done' look like to you by quarter-end, in one concrete measure?", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "Okay, 'improve posture', noted as the goal.", correct: false, coaching: "An un-measurable goal can't anchor a charter." }, { id: "C", text: "So you don't really know what you want?", correct: false, coaching: "Embarrassing the sponsor; bad move." }], stakeholderNext: "Fair — let's say: the five critical CIS gaps from the assessment are closed and re-tested. That's 'done'." },
        ] },
      defensive: { mood: "defensive", speaker: "Project Sponsor", initials: "PS",
        opener: "Is this meeting going to create a load of extra work and reporting for my team?",
        rounds: [
          { options: [{ id: "A", text: "No — the charter is one page and sets clear ownership so work doesn't fall through the cracks; my mentor's helping keep it lightweight.", correct: true, coaching: "Good probe — extracts the needed detail." }, { id: "B", text: "We still need to lock scope today.", correct: false, coaching: "Ignoring the concern keeps them resistant." }, { id: "C", text: "Without your team's effort this will fail and that's on you.", correct: false, coaching: "Threatening the sponsor in a kick-off is self-defeating." }], stakeholderNext: "Alright, if it's genuinely one page — then yes, scope is the top-5 CIS gaps, and I'll back the team's time for it." },
        ] },
    },
    metEnd: MET, missEnd: MISS,
  },
};

export function getConductTask(taskCode?: string, activityCode?: string): ConductTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return CONDUCT_TASKS[`${taskCode}/${activityCode}`];
}
