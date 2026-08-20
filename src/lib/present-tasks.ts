// Present-verb sign-off Q&A flows. Source: Present_Verb_Task_Register.xlsx. Reuses the Conduct engine:
// prep (deck + anticipated Q&A) then opening sets disposition, senior asks, pick an answer
// (A strong -> APPROVED; B/C -> conditions/rejected -> re-present).

import type { ConductTask } from "./conduct-tasks";

const MET = "APPROVED - the senior signs off; the approved artefact proceeds to the next step.";
const MISS = "Not approved (conditions or rejected). Strengthen your answer and re-present.";

export const PRESENT_TASKS: Record<string, ConductTask> = {
  "DD-001/6": {
    roleAgent: "IT Manager and a sample end-user", interview: "Circulate the Incident Procedure for Review",
    prep: { deck: "Incident Reporting Procedure v0.2 plus the one-page quick reference card — scope, what counts as an incident, the reporting route, and the out-of-hours path.", qa: ["Q1: How long will this take to review? Prepared A: Twenty minutes — the procedure plus the one-page card.", "Q2: What do you want from me specifically? Prepared A: From IT, whether the escalation path works; from the end-user, whether the card is understandable cold.", "Q3: What happens to my comments? Prepared A: Consolidated into v0.3, and I will tell you what I did with each."] },
    openings: [
      { id: "A", text: "Two different reviews: could you check the escalation path is right, and could you tell me whether the card makes sense to someone who has never reported an incident?", routesTo: "cooperative", correct: true, coaching: "Asks each reviewer for what only they can judge." },
      { id: "B", text: "Could you both take a look and let me know what you think?", routesTo: "vague", correct: false, coaching: "Undirected review; you get proofreading, not the answers you need." },
      { id: "C", text: "This needs to be approved this week, so please review it quickly.", routesTo: "defensive", correct: false, coaching: "Deadline first; the review becomes a formality." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "IT Manager", initials: "IT", opener: "Happy to. The escalation path — who is on it out of hours?", rounds: [{ options: [
        { id: "A", text: "That is the gap I most want your view on. Today it is one person known by memory, which is exactly what I think we should fix.", correct: true, coaching: "Surfaces the known weakness instead of hoping the reviewer misses it." },
        { id: "B", text: "It follows the existing process.", correct: false, coaching: "There is no documented existing process — this is not accurate." },
        { id: "C", text: "I was hoping you could tell me.", correct: false, coaching: "Offloads the drafting decision rather than proposing something to react to." },
      ] }] },
      vague: { mood: "vague", speaker: "IT Manager", initials: "IT", opener: "It looks fine to me. Nothing jumps out.", rounds: [{ options: [
        { id: "A", text: "Can I push once? Take a real ticket from last month and walk it through the procedure — does it survive?", correct: true, coaching: "Converts a general approval into a concrete test." },
        { id: "B", text: "Great, I will treat that as approved.", correct: false, coaching: "A glance is not a review; the first real incident will find what it missed." },
        { id: "C", text: "Are you sure there is nothing?", correct: false, coaching: "Invites reassurance rather than a test." },
      ] }] },
      defensive: { mood: "defensive", speaker: "IT Manager", initials: "IT", opener: "We already handle incidents. Writing it down will not change anything.", rounds: [{ options: [
        { id: "A", text: "You do handle them — the procedure is so it still works when you are on leave. Does it capture how you actually do it, or have I got it wrong?", correct: true, coaching: "Validates the practice, names the real risk, and asks them to correct the draft." },
        { id: "B", text: "It is required for the certification.", correct: false, coaching: "Compliance framing; the review becomes a signature." },
        { id: "C", text: "Everyone writes these down.", correct: false, coaching: "Appeal to convention answers nothing." },
      ] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "CA-001/4": {
    roleAgent: "Staff audience (non-technical)", interview: "Deliver the 30-Minute Awareness Module",
    prep: { deck: "Three segments of ten minutes — phishing, passwords, data handling — each with a worked example from this organisation and a short exercise.", qa: ["Q1: Is this being recorded or scored? Prepared A: The knowledge check is anonymous at individual level; only the group result is reported.", "Q2: What if I have already clicked something? Prepared A: Tell us — reporting late is far better than not reporting.", "Q3: Why us, why now? Prepared A: Partners are asking how we protect their data, and most of that answer is what people here do daily."] },
    openings: [
      { id: "A", text: "Thirty minutes, three things that actually come up in your job here, and one real example of each from this organisation. No jargon, and stop me if I use any.", routesTo: "cooperative", correct: true, coaching: "Sets relevance and gives permission to interrupt." },
      { id: "B", text: "Today we are covering the mandatory annual security awareness training.", routesTo: "vague", correct: false, coaching: "Compliance framing in the first sentence; the room switches off." },
      { id: "C", text: "There have been some worrying behaviours recently, so we need to go over the basics.", routesTo: "defensive", correct: false, coaching: "Opens on blame; people stop volunteering anything." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Staff audience", initials: "SA", opener: "Some of us barely touch the systems you are describing. Does this apply to us?", rounds: [{ options: [
        { id: "A", text: "The phishing part does — that arrives by email regardless of what systems you use. Let us start there and I will tell you which parts you can ignore.", correct: true, coaching: "Segments the relevance honestly instead of insisting everything applies." },
        { id: "B", text: "It applies to everyone equally.", correct: false, coaching: "Not true, and the room knows it; credibility gone." },
        { id: "C", text: "Just sit through it and take what is useful.", correct: false, coaching: "Concedes the session is partly a waste of their time." },
      ] }] },
      vague: { mood: "vague", speaker: "Staff audience", initials: "SA", opener: "We did something like this last year. Is it the same content?", rounds: [{ options: [
        { id: "A", text: "Mostly new — the examples are real attempts against this organisation in the last six months, which the generic version could not give you.", correct: true, coaching: "Differentiates concretely rather than asserting freshness." },
        { id: "B", text: "It is refreshed annually.", correct: false, coaching: "Bureaucratic answer; confirms their suspicion it is a repeat." },
        { id: "C", text: "Some of it will be familiar.", correct: false, coaching: "Hedged; no reason given to pay attention." },
      ] }] },
      defensive: { mood: "defensive", speaker: "Staff audience", initials: "SA", opener: "Is this because someone did something wrong?", rounds: [{ options: [
        { id: "A", text: "No. It is scheduled, and nothing here is about any individual. If anything, I want it easier to tell us when something goes wrong, not harder.", correct: true, coaching: "Answers directly and reframes toward reporting." },
        { id: "B", text: "I cannot really go into that.", correct: false, coaching: "Implies there was an incident and someone is in trouble." },
        { id: "C", text: "There have been a few issues generally.", correct: false, coaching: "Vague accusation; the room becomes guarded for the whole session." },
      ] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "MM-001/7": {
    roleAgent: "Compliance Manager", interview: "Present the Month 1 Metrics and Commentary",
    prep: { deck: "Month 1 GRC metrics — five KPIs with RAG, three-sentence commentary, and the coverage limitations shown on the face of the report.", qa: ["Q1: Can we trust these numbers? Prepared A: Three are complete; two are partial and flagged as partial rather than estimated.", "Q2: What does the RAG actually mean? Prepared A: Thresholds are on each KPI card, agreed before the first collection.", "Q3: What do you need? Prepared A: Confirmation the thresholds are right before they become the baseline."] },
    openings: [
      { id: "A", text: "First month, so no trend yet. Three KPIs are complete, two are partial and shown as partial. I mainly want your view on whether the thresholds are set right before they become the baseline.", routesTo: "cooperative", correct: true, coaching: "States limitations first and asks for the decision that matters now." },
      { id: "B", text: "Here are the first month metrics for you to look over.", routesTo: "vague", correct: false, coaching: "No ask; the review produces nothing actionable." },
      { id: "C", text: "The numbers are worse than I expected, but the data is not great either.", routesTo: "defensive", correct: false, coaching: "Undermines your own report before anyone has read it." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Compliance Manager", initials: "CM", opener: "Why are two partial? Could you not estimate the rest?", rounds: [{ options: [
        { id: "A", text: "I could, but an estimate in month one becomes the baseline everything is measured against. I would rather show a gap than bake in a guess.", correct: true, coaching: "Defends the discipline with the consequence, not the principle." },
        { id: "B", text: "I can go back and estimate them if you prefer.", correct: false, coaching: "Abandons the discipline at the first push." },
        { id: "C", text: "The data owners did not respond in time.", correct: false, coaching: "Blames upstream rather than answering the question." },
      ] }] },
      vague: { mood: "vague", speaker: "Compliance Manager", initials: "CM", opener: "Fine. What am I supposed to do with this?", rounds: [{ options: [
        { id: "A", text: "One decision: confirm the RAG thresholds. Once month two lands they become a trend, and moving them after that rewrites history.", correct: true, coaching: "Gives a single decision and explains why it is time-critical." },
        { id: "B", text: "Just for your awareness really.", correct: false, coaching: "Wastes the review slot; nothing is decided." },
        { id: "C", text: "Whatever you think is most useful.", correct: false, coaching: "Hands back the agenda you were meant to set." },
      ] }] },
      defensive: { mood: "defensive", speaker: "Compliance Manager", initials: "CM", opener: "Two amber and a red in month one. That is not a good look upward.", rounds: [{ options: [
        { id: "A", text: "It is the honest baseline, and it is the only month where a red costs nothing to report. If we soften it now, every improvement afterwards looks smaller than it was.", correct: true, coaching: "Reframes the first month as the cheapest time to be accurate." },
        { id: "B", text: "I can present them more positively.", correct: false, coaching: "Agrees to distort the baseline; every later trend is then wrong." },
        { id: "C", text: "The thresholds might be too strict.", correct: false, coaching: "Moves the goalposts rather than defending the measurement." },
      ] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "AA-001/1.8": {
    roleAgent: "Department Head", interview: "Present Asset Register for Sign-off",
    prep: { deck: "Information Asset Register — 185 assets classified Public/Internal/Confidential, owners assigned, 8 ownerless flagged.", qa: ["Q1: Are all assets owned? Prepared A: All but 8; those are flagged with proposed owners for your confirmation.", "Q2: How did you classify them? Prepared A: ISO 27001 A.5.12 three-tier; personal-data items are never Public.", "Q3: What do you need from me? Prepared A: Your sign-off, and confirmation of the 8 proposed owners."] },
    openings: [
      { id: "A", text: "Thanks for your time. I've completed the asset register — 185 assets, classified and owned. I need your sign-off and confirmation of owners for 8 assets. May I walk you through it?", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "So I went through everything and there's a spreadsheet with lots of assets and classifications and some gaps and stuff…", routesTo: "vague", correct: false, coaching: "Burying the ask in vague detail invites scepticism — lead with the decision." },
      { id: "C", text: "Your department's asset management is a mess — loads of unowned and misclassified assets.", routesTo: "defensive", correct: false, coaching: "Blaming the audience makes them hostile; present facts neutrally." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Department Head", initials: "DH", opener: "This looks thorough. What's the one thing you most need me to decide today?", rounds: [{ options: [{ id: "A", text: "Two things: your sign-off, and confirmation of owners for these 8 assets — here's my proposed owner for each.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Mostly just to look at it and tell me if it's okay?", correct: false, coaching: "Vague ask → conditions." }, { id: "C", text: "Whatever you think, I'm not sure it's right.", correct: false, coaching: "No confidence → rejected." }] }] },
      vague: { mood: "vague", speaker: "Department Head", initials: "DH", opener: "How do I know this list is complete? What did you miss?", rounds: [{ options: [{ id: "A", text: "I reconciled it against the network and app inventory — 9 discrepancies resolved; residual gaps are the 8 ownerless assets, all listed.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "I think it's mostly complete, I covered the main systems.", correct: false, coaching: "Hedged → conditions." }, { id: "C", text: "It's complete, trust me.", correct: false, coaching: "Unevidenced → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "Department Head", initials: "DH", opener: "This feels like box-ticking. Why spend my time signing a spreadsheet?", rounds: [{ options: [{ id: "A", text: "Because these 8 ownerless 'Confidential' stores are an unmanaged risk we can close today — you can't protect what you haven't owned and classified.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "It's a compliance requirement, we have to.", correct: false, coaching: "Weak case → conditions." }, { id: "C", text: "Fine, if you're too busy I'll just sign it myself.", correct: false, coaching: "Oversteps → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "GRM-001/4.8": {
    roleAgent: "Business-Unit Management", interview: "Present Top Risks to Management",
    prep: { deck: "Top 5 operational risks (5×5 scored) — 1 Critical, 3 High; recommended treatments (mitigate/transfer).", qa: ["Q1: What's the top risk? Prepared A: Mis-sent client emails — scored 16 (High); no DLP control today.", "Q2: What will treatment cost? Prepared A: DLP ~€X/yr; laptop encryption is free via existing MDM.", "Q3: What do you need? Prepared A: Acceptance of the risks and approval of two treatments."] },
    openings: [
      { id: "A", text: "I've identified your unit's top 5 risks on a 5×5. One High risk is untreated — mis-sent client emails. I'd like you to accept the risks and approve two treatments.", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "So there are some risks, I scored them, a couple are high, and there's a register…", routesTo: "vague", correct: false, coaching: "Buries the point → scepticism." },
      { id: "C", text: "Your team is leaking client data and has no controls.", routesTo: "defensive", correct: false, coaching: "Blame → hostility." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Business-Unit Management", initials: "BU", opener: "Helpful. Which one keeps you up at night?", rounds: [{ options: [{ id: "A", text: "Mis-sent client emails — monthly near-misses, high impact, no DLP; the fix is proportionate.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "They're all a bit concerning really.", correct: false, coaching: "Unfocused → conditions." }, { id: "C", text: "I'm not sure, you tell me.", correct: false, coaching: "No ownership → rejected." }] }] },
      vague: { mood: "vague", speaker: "Business-Unit Management", initials: "BU", opener: "A 16 out of 25 — how did you get that? Feels arbitrary.", rounds: [{ options: [{ id: "A", text: "Likelihood 4 (monthly near-misses) × Impact 4 (client-confidentiality breach), both anchored to your team's actual examples.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "It just felt high so I put 16.", correct: false, coaching: "Arbitrary → conditions." }, { id: "C", text: "That's just how the matrix works.", correct: false, coaching: "Dodges → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "Business-Unit Management", initials: "BU", opener: "You want me to spend money on a risk that's never caused a problem.", rounds: [{ options: [{ id: "A", text: "Two near-misses last quarter — we've been lucky, not safe; the DLP cost is far below a single breach's client and regulatory cost.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Well, it could happen…", correct: false, coaching: "Weak → conditions." }, { id: "C", text: "If you won't fund it, the breach is your decision.", correct: false, coaching: "Threat → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "GRM-003/6.8": {
    roleAgent: "Department Head", interview: "Present Maturity Findings to Dept Head",
    prep: { deck: "NIST CSF current-state profile — strong Identify/Protect, weak Detect/Respond; ~Tier 1-2; proposed target Tier 2.", qa: ["Q1: Where are we weakest? Prepared A: Detect and Respond — no monitoring, no incident plan.", "Q2: What's realistic? Prepared A: Tier 2 (Risk-Informed) within 6-12 months.", "Q3: What do you need? Prepared A: Acceptance of the profile and agreement on the Tier 2 target."] },
    openings: [
      { id: "A", text: "I've profiled your department against NIST CSF — solid on Identify and Protect, weak on Detect and Respond. I'd like you to accept the profile and agree a Tier 2 target.", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "I scored the functions, some higher some lower, here's roughly where you are…", routesTo: "vague", correct: false, coaching: "Vague → scepticism." },
      { id: "C", text: "Your department basically can't detect or respond to incidents.", routesTo: "defensive", correct: false, coaching: "Blunt blame → hostility." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Department Head", initials: "DH", opener: "Fair assessment. What would move us up fastest?", rounds: [{ options: [{ id: "A", text: "Basic log monitoring and a one-page incident plan with named roles — both achievable this quarter.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Lots of small improvements, generally.", correct: false, coaching: "Vague → conditions." }, { id: "C", text: "You'd need to overhaul everything.", correct: false, coaching: "Overstates → rejected." }] }] },
      vague: { mood: "vague", speaker: "Department Head", initials: "DH", opener: "A 90-minute interview — how is that enough to score us?", rounds: [{ options: [{ id: "A", text: "It's a lightweight self-assessment, evidenced by your own examples per function; I've noted it's indicative and where deeper review is warranted.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "I think it's about right.", correct: false, coaching: "Hedged → conditions." }, { id: "C", text: "It's definitely accurate.", correct: false, coaching: "Overclaim → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "Department Head", initials: "DH", opener: "Low maturity makes me look bad to the board. Why accept it?", rounds: [{ options: [{ id: "A", text: "The opposite — an honest current-state with a credible Tier 2 plan is exactly what justifies the resources you've been asking for.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "It's just the framework, not personal.", correct: false, coaching: "Weak → conditions." }, { id: "C", text: "It's the truth whether you like it or not.", correct: false, coaching: "Tactless → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "SPA-001/8": {
    roleAgent: "IT / Management Team", interview: "Present 12-Month Roadmap for Endorsement",
    prep: { deck: "12-month GRC roadmap — phased (Foundation/Build/Optimise); per-quarter actions, owners, dependencies.", qa: ["Q1: Is this realistic with our resources? Prepared A: Phased — ~2-3 actions per quarter; front-loaded quick wins.", "Q2: What's first? Prepared A: Q1: close the CIS top-5 gaps and stand up the asset register.", "Q3: What do you need? Prepared A: Your input on priorities and endorsement to proceed."] },
    openings: [
      { id: "A", text: "I've drafted a phased 12-month roadmap that front-loads quick wins and spreads the load. I'd value your input on priorities and endorsement to start Q1.", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "Here's a big plan with lots of actions across the year and a Gantt chart…", routesTo: "vague", correct: false, coaching: "Overwhelming → scepticism." },
      { id: "C", text: "We're miles behind, so I've planned a year of work for your team.", routesTo: "defensive", correct: false, coaching: "Negative framing → hostility." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "IT / Management Team", initials: "IM", opener: "I like the phasing. What's the very first thing?", rounds: [{ options: [{ id: "A", text: "Q1 closes the top-5 CIS gaps and stands up the asset register — the foundation everything else needs.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "We'd start somewhere in Q1 probably.", correct: false, coaching: "Vague → conditions." }, { id: "C", text: "Everything needs doing at once really.", correct: false, coaching: "No phasing → rejected." }] }] },
      vague: { mood: "vague", speaker: "IT / Management Team", initials: "IM", opener: "My team is stretched. How does this not derail BAU?", rounds: [{ options: [{ id: "A", text: "Each quarter is only 2-3 actions with named owners; I've flagged the two that need extra hands so you can resource them deliberately.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "It should be manageable I think.", correct: false, coaching: "Hedged → conditions." }, { id: "C", text: "You'll just have to find the time.", correct: false, coaching: "Dismissive → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "IT / Management Team", initials: "IM", opener: "This is overambitious for a team our size. Why bother?", rounds: [{ options: [{ id: "A", text: "It's deliberately minimal and Tier-appropriate; skipping it just defers the same work into a crisis. Endorse Q1 and we re-plan each quarter.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Other companies do this.", correct: false, coaching: "Weak → conditions." }, { id: "C", text: "If you don't endorse it, don't blame me later.", correct: false, coaching: "Threat → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "SPA-002/8": {
    roleAgent: "Project Sponsor", interview: "Present Stakeholder Matrix to Sponsor",
    prep: { deck: "Stakeholder Influence-Interest matrix — 12 stakeholders mapped; key players (high/high) and a comms plan.", qa: ["Q1: Who are the key players? Prepared A: The CISO and Ops Director — high influence, high interest; manage closely.", "Q2: Anyone missing? Prepared A: Possibly Legal — flagged for your view.", "Q3: What do you need? Prepared A: Validation of the placements and the key-player list."] },
    openings: [
      { id: "A", text: "I've mapped the initiative's stakeholders on an influence-interest grid; the CISO and Ops Director are your key players. Could you validate the placements?", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "I put everyone on a grid based on how influential and interested they are…", routesTo: "vague", correct: false, coaching: "Vague → scepticism." },
      { id: "C", text: "Half your stakeholders don't care about this project, here's proof.", routesTo: "defensive", correct: false, coaching: "Blunt → hostility." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Project Sponsor", initials: "PS", opener: "Useful. Did I miss anyone important?", rounds: [{ options: [{ id: "A", text: "I flagged Legal as a possible high-influence party for your call; everyone else I validated against the project charter.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Maybe, I'm not sure I got everyone.", correct: false, coaching: "Unsure → conditions." }, { id: "C", text: "No, it's definitely complete.", correct: false, coaching: "Overconfident on a judgement call → rejected." }] }] },
      vague: { mood: "vague", speaker: "Project Sponsor", initials: "PS", opener: "How did you decide who's 'high influence'? Seems subjective.", rounds: [{ options: [{ id: "A", text: "I used decision authority and budget control as the influence criteria, plus stated interest from the needs interviews — documented per stakeholder.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Just my sense of it really.", correct: false, coaching: "Subjective → conditions." }, { id: "C", text: "It's obvious who's important.", correct: false, coaching: "Dodges → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "Project Sponsor", initials: "PS", opener: "You've put me in 'manage closely' — are you saying I'm difficult?", rounds: [{ options: [{ id: "A", text: "Not at all — 'manage closely' is high influence and high interest; that's where I place our most important supporters, including you.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "It's just a category, don't read into it.", correct: false, coaching: "Dismissive → conditions." }, { id: "C", text: "Well, that's where the data put you.", correct: false, coaching: "Cold → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "PE-002/8": {
    roleAgent: "Information Security Auditor", interview: "Present Evidence Pack (mock audit)",
    prep: { deck: "Audit Evidence Pack — labelled evidence per control; Evidence Index; self-review complete (3 stale items removed).", qa: ["Q1: Is every control evidenced? Prepared A: Yes — each control maps to at least one labelled item in the index.", "Q2: Anything outdated? Prepared A: I rejected 3 stale items in self-review; all current now.", "Q3: What do you need? Prepared A: Your mock-audit sign-off that the pack is audit-ready."] },
    openings: [
      { id: "A", text: "I've assembled the evidence pack with an index mapping each control to its evidence, and self-reviewed to remove stale items. Could you run your mock-audit check?", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "I gathered a load of evidence files and put them in folders with an index sheet…", routesTo: "vague", correct: false, coaching: "Vague → scepticism." },
      { id: "C", text: "This pack is perfect — you won't find anything wrong.", routesTo: "defensive", correct: false, coaching: "Overclaim → hostility." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "Information Security Auditor", initials: "IS", opener: "Looks organised. Walk me to the evidence for access control.", rounds: [{ options: [{ id: "A", text: "Index row 6 → the quarterly access-review export and the joiner/leaver log, both dated this quarter.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "It's in there somewhere, let me look…", correct: false, coaching: "Disorganised → conditions." }, { id: "C", text: "That one might be missing actually.", correct: false, coaching: "Gap on the spot → rejected." }] }] },
      vague: { mood: "vague", speaker: "Information Security Auditor", initials: "IS", opener: "An auditor pulls a sample. Show me evidence is current, not just present.", rounds: [{ options: [{ id: "A", text: "Every item carries a date and version in the index; my self-review log shows the 3 stale items I replaced.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "Most of it is recent I believe.", correct: false, coaching: "Hedged → conditions." }, { id: "C", text: "It's all fine, I checked.", correct: false, coaching: "Unevidenced → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "Information Security Auditor", initials: "IS", opener: "I'll find a gap in two minutes. Why waste my time with a half-done pack?", rounds: [{ options: [{ id: "A", text: "Then please do — I'd rather you find it now than a real auditor; the index makes any gap visible at a glance.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "I tried to make it complete.", correct: false, coaching: "Defensive → conditions." }, { id: "C", text: "There are no gaps, I promise.", correct: false, coaching: "Overclaim → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
  "KT-002/7": {
    roleAgent: "GRC 101 Programme Manager", interview: "Present Lessons Learned to Programme Manager",
    prep: { deck: "Lessons Learned Report — top 3 programme improvements; Mentee Portfolio Index of all rotation deliverables.", qa: ["Q1: Your top recommendation? Prepared A: A missing RoPA template slowed AA-003 — add it to the toolkit.", "Q2: Is your portfolio complete? Prepared A: Yes — every task deliverable indexed and linked.", "Q3: What do you need? Prepared A: Acceptance of the lessons and confirmation of programme completion."] },
    openings: [
      { id: "A", text: "I've completed my retrospective with three concrete programme improvements and indexed my full portfolio. I'd like your acceptance and sign-off on completion.", routesTo: "cooperative", correct: true, coaching: "Sets a supportive audience." },
      { id: "B", text: "I wrote up some thoughts on how it went and collected my work together…", routesTo: "vague", correct: false, coaching: "Vague → scepticism." },
      { id: "C", text: "The GRC 101 programme has a lot of problems and here's my list.", routesTo: "defensive", correct: false, coaching: "Complaint framing → hostility." },
    ],
    threads: {
      cooperative: { mood: "cooperative", speaker: "GRC 101 Programme Manager", initials: "GP", opener: "Great rotation. What's the single best improvement we could make?", rounds: [{ options: [{ id: "A", text: "Add a RoPA template to the toolkit — its absence cost me two days on AA-003; a small fix with broad benefit.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "There were a few little things.", correct: false, coaching: "Vague → conditions." }, { id: "C", text: "Everything could be better really.", correct: false, coaching: "Unfocused → rejected." }] }] },
      vague: { mood: "vague", speaker: "GRC 101 Programme Manager", initials: "GP", opener: "Lessons are easy to list. Which is actually evidenced by your experience?", rounds: [{ options: [{ id: "A", text: "Each of my three points cites the specific task and where I lost time or got stuck — from my own rotation, not generic.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "They're based on how it felt overall.", correct: false, coaching: "Vague → conditions." }, { id: "C", text: "They're just good practice.", correct: false, coaching: "Generic → rejected." }] }] },
      defensive: { mood: "defensive", speaker: "GRC 101 Programme Manager", initials: "GP", opener: "Criticising the programme on your way out is easy. Why act on it?", rounds: [{ options: [{ id: "A", text: "Because they're specific, low-cost fixes that would help the next cohort — each framed as a concrete change, not a complaint.", correct: true, coaching: "Strong, evidenced answer." }, { id: "B", text: "You don't have to act on them.", correct: false, coaching: "Passive → conditions." }, { id: "C", text: "That's your problem to fix, not mine.", correct: false, coaching: "Dismissive → rejected." }] }] },
    },
    metEnd: MET, missEnd: MISS,
  },
};

export function getPresentTask(taskCode?: string, activityCode?: string): ConductTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return PRESENT_TASKS[`${taskCode}/${activityCode}`];
}
