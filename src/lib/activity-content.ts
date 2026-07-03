// Per-ACTION content for the activity workspace: Objective, What to do, and Reference material
// (required reading) for each individual verb action. Keyed by `${taskCode}/${activityCode}`,
// e.g. "AA-001/1.1". References carry the facts/rules you need for THAT step. Second person ("You will …").
import type { TaskReference } from "./taskmeta";

export interface ActivityContent {
  objective: string;
  whatToDo: string[];
  references?: TaskReference[];
}

export const ACTIVITY_CONTENT: Record<string, ActivityContent> = {
  // ───────────── AA-001 · Information Asset Inventory & Classification (CloudTech) ─────────────
  "AA-001/1.0": {
    objective:
      "You will prove you understand this task — the governing controls, the templates, the key concepts and the deliverable contract — before any real work begins. No passed gate, no step 1.1.",
    whatToDo: [
      "Study each governing control and note in a line what it requires of this task.",
      "Inspect the provided templates and confirm the prerequisites are in hand.",
      "Explain every key concept in your own words — the mentor grades these, not copied definitions.",
      "Answer the readiness questions, accept the deliverable contract, and attest your readiness.",
    ],
  },
  "AA-001/1.1": {
    objective: "You will request the starting list of information assets from the people who run CloudTech's systems, so you have a base to build the register from.",
    whatToDo: [
      "Address the request to a named role (IT / Operations Lead), not 'the team'.",
      "Ask for at least three specific things (systems list, what data each holds, who owns each).",
      "State a clear deadline and why you need it.",
    ],
    references: [
      {
        id: "aa001-1-1-what",
        title: "What IT/Operations Can Give You",
        kind: "Source document", group: "task",
        summary: "What to actually ask for — and what they'll hand back.",
        body: `## Who to ask
The IT/Operations Lead at CloudTech maintains the day-to-day systems list.

## What they can provide (ask for these by name)
- A list of production systems and the cloud services in use (the "estate list").
- For each system, roughly what data it holds and the team that runs it.
- Network/architecture diagrams (you'll need these for step 1.5).

## What a good request looks like
Named recipient · 3+ specific items · a deadline · a one-line reason. A vague "please send me everything about our systems" gets ignored — be specific.`,
      },
    ],
  },
  "AA-001/1.2": {
    objective: "You will interview the process owners to find the assets IT doesn't know about — the spreadsheets, exports and shadow systems teams use day to day.",
    whatToDo: [
      "Use the interview guide to ask each owner what data they create, receive, store and share.",
      "Record the named owner for each asset you uncover.",
      "Probe for the 'unofficial' assets — local files, personal drives, exports.",
    ],
    references: [
      {
        id: "aa001-1-2-guide",
        title: "Process-Owner Interview Guide",
        kind: "Interview guide",
        summary: "The questions that surface hidden assets.",
        body: `## Ask each process owner
- What information do you create or collect to do your job?
- Where do you keep it — system, shared drive, your own laptop?
- Who else receives it, inside or outside CloudTech?
- Do you keep any spreadsheets or exports the official systems don't cover?
- Who would you say "owns" this data?

## What you'll uncover at CloudTech
The marketing email-list spreadsheet and the old database backup on an engineer's laptop only show up in interviews — IT's list won't have them. Capturing these is the point of this step.`,
      },
    ],
  },
  "AA-001/1.3": {
    objective: "You will turn everything you've gathered into structured rows in the Asset Register — one row per asset, with the mandatory fields populated.",
    whatToDo: [
      "Create one row per distinct asset from the intake notes and interviews.",
      "Populate every mandatory field: asset name, data held, location, and a named owner (a role, not a person).",
      "Leave classification blank for now — that's the next step.",
    ],
    references: [
      {
        id: "aa001-1-3-intake",
        title: "CloudTech — Asset Intake Notes",
        kind: "Source document", group: "task",
        summary: "The assets to record (from IT + the interviews).",
        body: `## Assets gathered so far
- Customer accounts database (Postgres, AWS eu-west-1): names, emails, hashed passwords, billing addresses. Owner: Platform Engineering Lead.
- Support tickets (Zendesk): customer attachments, personal data. Owner: Head of Customer Success.
- Marketing email list (Mailchimp export, shared drive): prospect names + emails. Owner: none (intern keeps it) → record "owner: UNASSIGNED".
- Runbooks/process docs (Confluence). Owner: Engineering.
- Platform source code (private GitHub). Owner: CTO.
- HR & payroll (BambooHR). Owner: People Ops.
- Public website/blog (WordPress). Owner: Marketing.
- Old database backup (.sql on a laptop): unknown contents. Owner: UNASSIGNED.

## Register fields (mandatory)
Asset name · Data held · Storage location · Owner (role) · [Classification — next step].`,
      },
      {
        id: "aa001-1-3-rules",
        title: "Register Field Rules",
        kind: "Standard rules",
        summary: "How to fill the fields correctly.",
        body: `## Rules
- Owner must be a role/role-holder, not a department ("Platform Engineering Lead", not "Engineering").
- If there's genuinely no owner, record "UNASSIGNED" — don't leave it blank (it becomes a finding in step 1.6).
- "Data held" should name the data types, not just "customer data" — e.g. "names, emails, hashed passwords".
- One asset per row; don't merge the accounts DB and its backup into one row.`,
      },
    ],
  },
  "AA-001/1.4": {
    objective: "You will classify every asset in the register as Public, Internal or Confidential by applying CloudTech's scheme — consistently, with a rationale, never by gut feel.",
    whatToDo: [
      "For each asset, apply the classification rules from the scheme.",
      "Give every classification a one-line rationale.",
      "Where personal data, credentials, source code or financials are involved, classify Confidential — these are mandatory.",
    ],
    references: [
      {
        id: "aa001-1-4-scheme",
        title: "CloudTech Data Classification Scheme",
        kind: "Classification scheme",
        summary: "The rules you must apply.",
        body: `## Levels
- Public — for public release; harmless if seen by anyone (website, blog).
- Internal — operational, not public, low harm if leaked (runbooks, process docs).
- Confidential — material harm to CloudTech, customers or staff if disclosed.

## Mandatory rules (override intuition)
- Customer or staff personal data → at least Confidential.
- Credentials / secrets / at-rest passwords → Confidential.
- Source code / proprietary IP → Confidential.
- Financial / payroll data → Confidential.
- Unsure between two levels → pick the higher, note why.

## Watch-outs
Support tickets feel "Internal" but hold personal-data attachments → Confidential. The unknown backup could hold customer data → treat as Confidential until proven otherwise.`,
      },
    ],
  },
  "AA-001/1.5": {
    objective: "You will cross-reference your register against CloudTech's network diagrams to catch assets that exist on the network but never made it onto anyone's list.",
    whatToDo: [
      "Compare every system shown on the network diagram against your register.",
      "Flag at least one discrepancy class (on diagram but not in register, or vice-versa).",
      "Add any newly-found assets to the register and note the discovery method.",
    ],
    references: [
      {
        id: "aa001-1-5-diagram",
        title: "CloudTech — Network Diagram (annotated)",
        kind: "Source document", group: "task",
        summary: "Systems on the network — some are missing from your register.",
        body: `## What the diagram shows
- App servers → Customer accounts DB (in your register ✓).
- A reporting/analytics database replicating customer data nightly → NOT in your register or the intake notes. (Discrepancy — add it; it holds a copy of personal data, so Confidential.)
- A staging environment with a copy of production data → NOT in your register. (Discrepancy — staging data is a classic blind spot.)
- The Zendesk and Mailchimp integrations (already captured ✓).
- A legacy SFTP server still receiving partner files → NOT captured. (Discrepancy.)

## The point of this step
The diagram reveals real assets that people forget to mention. Cross-referencing two sources is how you find them — you cannot complete this step without reading the diagram.`,
      },
    ],
  },
  "AA-001/1.6": {
    objective: "You will scan the completed register for assets with no owner and flag each for remediation with a proposed action and an accountable role.",
    whatToDo: [
      "Find every asset marked UNASSIGNED or with an unclear owner.",
      "For each flag, propose a specific action (e.g. 'assign owner', 'delete the backup', 'sign a DPA').",
      "Name the accountable role who should action it — every flag needs an owner of the fix.",
    ],
    references: [
      {
        id: "aa001-1-6-rules",
        title: "Flagging Rules (Identify)",
        kind: "Standard rules",
        summary: "What makes a valid flag.",
        body: `## A valid flag has both
- A proposed action (what should happen), and
- A named accountable role (who should do it).

## What to flag in this register
- The marketing email list — no owner + personal data. Action: assign an owner and sign a DPA with Mailchimp. Accountable: Head of Marketing.
- The old .sql backup — unknown owner/contents. Action: identify contents, then securely delete or bring under control. Accountable: Platform Engineering Lead.
- The reporting DB / staging copy (found in 1.5) — confirm owner and that personal data there is justified.

## Standard
ISO 27001 A.5.9 — every asset must have an owner; an ownerless asset is itself the finding.`,
      },
    ],
  },
  "AA-001/1.7": {
    objective: "You will submit the near-final register to your mentor for a quality check, with a cover note that makes it easy to review.",
    whatToDo: [
      "Write a short cover note: what the register covers, what you found, and what you're unsure about.",
      "Confirm you've addressed any earlier feedback.",
      "Submit for review (this is a quality gate, not the final sign-off).",
    ],
    references: [
      {
        id: "aa001-1-7-checklist",
        title: "Pre-Review Checklist",
        kind: "Checklist",
        summary: "What 'review-ready' means before you submit.",
        body: `## Before you submit, confirm
- Every asset has an owner (or an explicit UNASSIGNED + a flag).
- Every asset has a classification with a rationale.
- The discrepancies from the network diagram (step 1.5) are included.
- Your flags (step 1.6) each have an action and an accountable role.

## Cover note (keep it short)
1–2 sentences on scope, your top 2–3 findings, and any open questions for the mentor. A reviewer should know in 30 seconds what to look at.`,
      },
    ],
  },
  "AA-001/1.8": {
    objective: "You will present the finished register to the department head and obtain their acknowledgement/sign-off, anticipating the questions a busy manager will ask.",
    whatToDo: [
      "Prepare a short summary: how many assets, how many Confidential, the key gaps to fix.",
      "Anticipate at least three questions the department head will ask and have answers ready.",
      "Record the sign-off decision and date.",
    ],
    references: [
      {
        id: "aa001-1-8-questions",
        title: "What the Department Head Will Ask",
        kind: "Briefing notes",
        summary: "Anticipate these — and the sign-off you need.",
        body: `## Likely questions
- "What's our most sensitive data and is it protected?" → the customer accounts DB + its copies (reporting/staging) — all Confidential.
- "What's the biggest risk you found?" → the ownerless backup with unknown contents, and personal data flowing to Mailchimp with no DPA.
- "What do you need from me?" → owners assigned to the unassigned assets, and approval to deal with the backup.

## Sign-off
Record the decision (approved / approved with conditions), any conditions, and the date. A presentation with no recorded decision isn't finished.`,
      },
    ],
  },
  "AA-001/1.9": {
    objective:
      "You will evidence the research behind your Information Asset Register — the contextual, gap and horizon-scanning work that makes it CloudTech's register rather than a template — before the task closes.",
    whatToDo: [
      "Work each of the three research methods and capture your findings as notes.",
      "Cite at least one source per method — clause, report, advisory or internal document.",
      "Summarise how the research changed or confirmed the register you built.",
    ],
  },

  // ───────────── CRM-002 · ISO 27001 Control Mapping to Business Processes (CloudTech) ─────────────
  "CRM-002/8.1": {
    objective: "You will agree the five CloudTech business processes that the control-mapping exercise will cover, so the scope is clear and risk-relevant.",
    whatToDo: [
      "Pick five processes that actually create information-security risk (not trivial ones).",
      "Record why each is in scope in one line.",
    ],
    references: [
      {
        id: "crm002-8-1", title: "CloudTech — Candidate Processes", kind: "Source document", group: "task",
        summary: "The processes available and the risk each carries.",
        body: `## Pick five from these
- User onboarding — creates accounts, stores personal data, sends credentials.
- Software release — weekly deploys, no formal change approval today.
- Customer data backup — nightly backups, restores never tested.
- Vendor contracting — informal security review.
- Incident logging — tracked in a chat channel, no severity/escalation.

## Rule
Choose processes where a control failure would actually hurt CloudTech — each carries a distinct risk above, which is why these five are the standard scope.`,
      },
    ],
  },
  "CRM-002/8.2": {
    objective: "You will identify, for each in-scope process, which ISO 27001 Annex A controls apply across all four control themes.",
    whatToDo: [
      "Go through each process and list the Annex A controls that address its risks.",
      "Cover all four themes (Organisational, People, Physical, Technological) — don't stop at technical controls.",
    ],
    references: [
      {
        id: "crm002-8-2", title: "Annex A — themes & likely controls", kind: "Standard extract",
        summary: "The control library and the controls these processes usually need.",
        body: `## The four themes
A.5 Organisational · A.6 People · A.7 Physical · A.8 Technological.

## Controls these processes usually need
- User onboarding → A.5.16 Identity mgmt, A.8.2 Privileged access, A.5.18 Access rights.
- Software release → A.8.32 Change management, A.8.28 Secure coding.
- Backup → A.8.13 Information backup.
- Vendor contracting → A.5.19/5.20 Supplier relationships.
- Incident logging → A.5.24–5.26 Incident management, A.8.15 Logging.

## Rule
A control is applicable only if the process creates the risk it addresses.`,
      },
    ],
  },
  "CRM-002/8.3": {
    objective: "You will document, for each control, whether it is applicable, partially applicable, or not applicable — with a rationale, so the judgement is defensible.",
    whatToDo: [
      "For every control you considered, mark Applicable / Partial / Not applicable.",
      "Give a one-line rationale for each call — especially the 'Not applicable' ones.",
    ],
    references: [
      {
        id: "crm002-8-3", title: "Applicability — how to decide", kind: "Standard rules",
        summary: "What 'applicable' really means.",
        body: `## Definitions
- Applicable — the process creates the risk and the control should operate.
- Partial — the control applies but only some elements are relevant.
- Not applicable — the risk genuinely doesn't exist for this process (must be justified).

## Rule
"Not applicable" is the riskiest call — an auditor scrutinises it most. Never mark a control N/A just because it isn't implemented; that's a gap, not an exclusion.`,
      },
    ],
  },
  "CRM-002/8.4": {
    objective: "You will record, for each applicable control, its current implementation status, the evidence you'd expect, and who owns it.",
    whatToDo: [
      "For each applicable control, record status: Implemented / Partial / Not implemented.",
      "Name the evidence type that would prove it operates, and the control owner (a role).",
    ],
    references: [
      {
        id: "crm002-8-4", title: "CloudTech — Implementation Snapshot", kind: "Source document", group: "task",
        summary: "What's actually in place — record from this.",
        body: `## Current state
- A.8.2 Privileged access — partial; admin list exists, no quarterly review. Owner: Platform Eng Lead.
- A.8.32 Change management — not implemented; deploys auto, no approval record. Owner: CTO.
- A.8.13 Backup — partial; backups run, never restore-tested. Owner: Platform Eng Lead.
- A.5.19 Supplier relationships — not implemented; vendor review informal. Owner: COO.

## Rule
Status must be evidence-based: "Implemented" needs the evidence type named (e.g. "quarterly access review record"). No evidence = at best Partial.`,
      },
    ],
  },
  "CRM-002/8.5": {
    objective: "You will validate your control applicability for one process by walking it through with the actual process owner, catching anything the paper exercise missed.",
    whatToDo: [
      "Pick one process and walk each step with its owner.",
      "Confirm the controls you mapped really apply, and capture any control or risk you missed.",
    ],
    references: [
      {
        id: "crm002-8-5", title: "Process Walk-through Guide", kind: "Interview guide",
        summary: "What to confirm with the owner.",
        body: `## Ask the owner, step by step
- What actually happens here, in order?
- Where is the data, and who can access it at each step?
- What could go wrong, and what stops it today?
- Are there manual workarounds or exceptions I won't see on paper?

## Why
Owners reveal real gaps (a shared password, a manual export) that the control library never shows. Validation is what makes your matrix credible.`,
      },
    ],
  },
  "CRM-002/8.6": {
    objective: "You will build the Control Matrix — a process × control grid that shows, at a glance, applicability and implementation status for the whole scope.",
    whatToDo: [
      "Lay out processes as rows and controls as columns (or vice versa).",
      "Fill each cell with applicability + status; make gaps visually obvious.",
    ],
    references: [
      {
        id: "crm002-8-6", title: "Control Matrix — format rules", kind: "Template",
        summary: "How to structure the grid.",
        body: `## Matrix rules
- Every populated cell must trace to your applicability + status work — no blank "applicable" cells.
- Use a clear status key (e.g. Implemented / Partial / Not implemented / N/A).
- No orphan rows/columns: every process and every applicable control appears.

## Purpose
The matrix is the at-a-glance evidence; management should see the red (not-implemented, applicable) cells instantly.`,
      },
    ],
  },
  "CRM-002/8.7": {
    objective: "You will surface the top five uncontrolled risks — the applicable controls that aren't implemented — and explain the exposure each creates.",
    whatToDo: [
      "Scan the matrix for applicable-but-not-implemented controls.",
      "Pick the five highest-exposure gaps and name the risk each creates for CloudTech.",
    ],
    references: [
      {
        id: "crm002-8-7", title: "Prioritising the gaps", kind: "Standard rules",
        summary: "How to rank the uncontrolled risks.",
        body: `## Rank by exposure
A missing control on a process handling customer personal data (onboarding, backup) outranks one on an internal process.

## Likely top gaps at CloudTech
- No change management on weekly production deploys (A.8.32).
- Backups never restore-tested (A.8.13).
- No supplier security review (A.5.19).

## Rule
Each flagged gap needs a proposed action and an owner — a risk with no owner of the fix is just a complaint.`,
      },
    ],
  },
  "CRM-002/8.8": {
    objective: "You will review the completed matrix with your mentor and refine it, so it's accurate and defensible before it informs the roadmap.",
    whatToDo: [
      "Write a short cover note: scope, top gaps, and anything you're unsure about.",
      "Address the mentor's feedback and finalise the matrix.",
    ],
    references: [
      {
        id: "crm002-8-8", title: "Review Checklist", kind: "Checklist",
        summary: "What 'review-ready' means here.",
        body: `## Before review, confirm
- Every applicability and N/A call has a rationale.
- Status reflects real evidence, not optimism.
- The top-five gaps each have an action + owner.
- The walk-through findings (8.5) are reflected.

## Cover note
Scope + your top 2–3 gaps + open questions. Keep it to a few lines so the mentor reviews the right things.`,
      },
    ],
  },

  // ───────────── CRM-003 · SOC 2 Awareness — Trust Services Criteria Mapping (CloudTech) ─────────────
  "CRM-003/9.1": {
    objective: "You will read and annotate a sample SOC 2 Type II report so you understand what a SOC 2 control and audit test actually look like before mapping CloudTech to them.",
    whatToDo: ["Read the sample report and annotate the control descriptions and test results.", "Note the structure: criterion, control, test performed, result."],
    references: [{ id: "crm003-9-1", title: "Sample SOC 2 Report — what to look for", kind: "Source document", group: "task", summary: "How a SOC 2 report is structured.", body: `## A SOC 2 Type II report contains
- The Trust Services Criteria (here: Security / Common Criteria).
- For each: the service organisation's control, the auditor's test, and the result (no exceptions / exceptions noted).

## What to notice
"Exceptions noted" = a control that failed testing. The report is evidence the control operated over a period (Type II), not just at a point in time.` }],
  },
  "CRM-003/9.2": {
    objective: "You will list the SOC 2 Common Criteria control points relevant to the Security category, so you have the checklist to map CloudTech against.",
    whatToDo: ["List the CC1–CC9 criteria.", "Focus on CC6 (access) and CC8 (change) — the heaviest for CloudTech."],
    references: [{ id: "crm003-9-2", title: "Common Criteria CC1–CC9", kind: "Standard extract", summary: "The criteria you must list and map.", body: `## Common Criteria (Security)
CC1 Control environment · CC2 Communication & information · CC3 Risk assessment · CC4 Monitoring · CC5 Control activities · CC6 Logical & physical access · CC7 System operations · CC8 Change management · CC9 Risk mitigation.

## Note
CC6 and CC8 overlap directly with your ISO work (access control, change management) — reuse that evidence.` }],
  },
  "CRM-003/9.3": {
    objective: "You will document, for each criterion, an example audit test, the evidence expected, and which CloudTech control or policy addresses it.",
    whatToDo: ["For each criterion record: example test, expected evidence, mapped CloudTech control.", "Be specific about evidence (the actual artefact an auditor would request)."],
    references: [{ id: "crm003-9-3", title: "CloudTech controls to map", kind: "Source document", group: "task", summary: "What CloudTech has, to map against each criterion.", body: `## CloudTech controls
- MFA on admin + AWS; SSO for staff (CC6).
- Joiner/leaver process, but deprovisioning manual & delayed (CC6 partial).
- Code review before merge; automated deploys, no approval record (CC8 partial).
- No documented risk assessment (CC3 gap).
- No central deficiency monitoring (CC4 gap).

## Rule
Map each criterion to one of these; name the evidence (e.g. "MFA policy screenshot", "access-review record").` }],
  },
  "CRM-003/9.4": {
    objective: "You will identify the criteria where CloudTech has no internal control mapped — the gaps.",
    whatToDo: ["Flag every criterion with no mapped control.", "Note whether it's a full gap or a partial."],
    references: [{ id: "crm003-9-4", title: "Spotting gaps", kind: "Standard rules", summary: "What counts as a gap.", body: `## Gap rules
- No control mapped to a criterion = a Red gap.
- Control exists but fails testing or is informal = Amber/partial.

## CloudTech's likely gaps
CC3 (risk assessment) and CC4 (deficiency monitoring) have nothing mapped → Red. CC6 deprovisioning is partial → Amber.` }],
  },
  "CRM-003/9.5": {
    objective: "You will cross-reference your SOC 2 findings against the ISO 27001 Control Matrix (CRM-002) to reuse evidence and spot inconsistencies.",
    whatToDo: ["Match each SOC 2 criterion to the equivalent ISO control.", "Flag anywhere the two assessments disagree."],
    references: [{ id: "crm003-9-5", title: "SOC 2 ↔ ISO 27001 overlap", kind: "Standard extract", summary: "Where the frameworks line up.", body: `## Common overlaps
- CC6 Access ↔ ISO A.8.2/A.5.18.
- CC8 Change ↔ ISO A.8.32.
- CC7 Operations ↔ ISO A.5.24–5.26 incident mgmt + A.8.15 logging.

## Why
If your ISO matrix says A.8.32 is "not implemented" but your SOC 2 mapping says CC8 is fine, one of them is wrong — cross-referencing catches it.` }],
  },
  "CRM-003/9.6": {
    objective: "You will summarise CloudTech's SOC 2 readiness on a simple Green/Amber/Red dashboard per criteria cluster.",
    whatToDo: ["Rate each CC cluster Green/Amber/Red from your mapping.", "Make the Reds (real gaps) unmissable."],
    references: [{ id: "crm003-9-6", title: "Readiness RAG rules", kind: "Standard rules", summary: "How to rate each cluster.", body: `## RAG
- Green — control mapped and operating with evidence.
- Amber — control exists but partial/informal/untested.
- Red — no control mapped.

## Rule
Be honest. A dashboard that's all Green to look good is worse than useless — the point is to show management where the work is.` }],
  },
  "CRM-003/9.7": {
    objective: "You will review your readiness summary with the Information Security Auditor mentor and refine it.",
    whatToDo: ["Share the dashboard + mapping with a short cover note.", "Address feedback and finalise."],
    references: [{ id: "crm003-9-7", title: "Review checklist", kind: "Checklist", summary: "Before you submit.", body: `## Confirm
- Every criterion mapped or flagged.
- RAG ratings backed by evidence.
- ISO cross-reference done (9.5).

## Cover note
Scope + top gaps + open questions, kept short.` }],
  },
  "CRM-003/9.8": {
    objective: "You will write a two-page SOC 2 Awareness Briefing that explains, in plain language, what SOC 2 means for the IT team and where CloudTech stands.",
    whatToDo: ["Explain SOC 2 in plain terms and why a customer wants it.", "State the top gaps and what the team needs to do."],
    references: [{ id: "crm003-9-8", title: "Briefing rules", kind: "Template", summary: "How to write for a non-audit audience.", body: `## Two-page briefing
- What SOC 2 is, in one paragraph (no jargon).
- Why it matters to CloudTech (the enterprise customer).
- Where we are (the RAG summary).
- The 3 things the IT team must do next.

## Rule
Audience is engineers, not auditors. Concrete actions beat criteria numbers.` }],
  },

  // ───────────── SPA-001 · GRC Programme Roadmap — 12-Month Plan (CloudTech) ─────────────
  "SPA-001/1": {
    objective: "You will consolidate the findings from the gap analysis, risk register and maturity assessment into one place, so the roadmap is built from real evidence.",
    whatToDo: ["Pull the open gaps and risks from the three prior deliverables.", "De-duplicate overlapping items."],
    references: [{ id: "spa001-1", title: "CloudTech — Consolidated Findings", kind: "Source document", group: "task", summary: "The items your roadmap schedules.", body: `## Rolled up from earlier work
- CIS IG1 at 41%; gaps: MFA everywhere, asset inventory, backup testing.
- Top risks: delayed deprovisioning (High), untested backups (High), informal vendor reviews (Medium).
- Maturity: Identify/Protect Tier 1; Detect/Respond weak.

## Rule
Every roadmap line must trace to one of these — don't invent new work.` }],
  },
  "SPA-001/2": {
    objective: "You will categorise every gap into Quick Wins, Medium-Term, or Strategic horizons using defined rules.",
    whatToDo: ["Assign each item a horizon (0–3m / 3–6m / 6–12m).", "Sequence so quick wins build momentum for strategic items."],
    references: [{ id: "spa001-2", title: "Horizon rules", kind: "Planning rules", summary: "How to bucket each item.", body: `## Horizons
- Quick Win (0–3m) — low effort, high risk-reduction; config/docs (enable MFA, turn on logging).
- Medium-Term (3–6m) — small project/budget (backup testing, deprovisioning automation).
- Strategic (6–12m) — org change/programme (risk framework, vendor-risk programme).

## Rule
Categorise by effort + risk-reduction, not by how interesting it is.` }],
  },
  "SPA-001/3": {
    objective: "You will specify each planned action in full: what, which control it addresses, effort, owner, success metric, and target date.",
    whatToDo: ["For each action capture all six fields.", "Make the success metric measurable."],
    references: [{ id: "spa001-3", title: "Action record fields", kind: "Template", summary: "What every roadmap action needs.", body: `## Per action
Description · ISO clause/control addressed · effort (hours estimate) · owner (role) · success metric · target date.

## Rule
A success metric must be measurable ("MFA on 100% of systems"), not vague ("improve security"). An action with no owner or metric is incomplete.` }],
  },
  "SPA-001/4": {
    objective: "You will lay the actions onto a 12-month Gantt so the sequence and dependencies are visible.",
    whatToDo: ["Place each action in its month(s) on the Gantt.", "Show dependencies (what must finish before what starts)."],
    references: [{ id: "spa001-4", title: "Gantt layout rules", kind: "Template", summary: "How to lay it out.", body: `## Rules
- Quick wins in months 1–3, strategic items later.
- Show dependencies (e.g. "risk framework" before "vendor-risk programme").
- Don't overload month 1 — a roadmap that front-loads everything isn't realistic.` }],
  },
  "SPA-001/5": {
    objective: "You will estimate the overall compliance uplift the roadmap will deliver, to show the return on the investment.",
    whatToDo: ["Estimate the end-state compliance (e.g. CIS IG1 %) after the roadmap.", "Show the before → after figure."],
    references: [{ id: "spa001-5", title: "Estimating uplift", kind: "Standard rules", summary: "How to compute the figure.", body: `## Method
Start from the current measured baseline (CIS IG1 41%). Estimate the % each planned action adds (e.g. MFA everywhere +8%, backup testing +5%). Sum to an end state (e.g. 70%).

## Rule
Tie the uplift to the specific actions — "40% to 70%" must be the sum of named items, not a guess.` }],
  },
  "SPA-001/6": {
    objective: "You will draft a one-page Management Briefing that sells the roadmap: the priorities and why they're worth funding.",
    whatToDo: ["Summarise the horizons, the uplift, and the investment ask.", "Lead with the business benefit, not the controls."],
    references: [{ id: "spa001-6", title: "Management briefing rules", kind: "Template", summary: "How to pitch it.", body: `## One page
- The goal (e.g. SOC 2 readiness in 9 months).
- The three horizons at a glance.
- The uplift (41% → 70%) and the cost.
- The decision you need.

## Rule
Executives fund outcomes and risk reduction, not control lists — lead with those.` }],
  },
  "SPA-001/7": {
    objective: "You will review the roadmap with the Cybersecurity Program Manager mentor and refine it before presenting.",
    whatToDo: ["Share with a short cover note.", "Address feedback."],
    references: [{ id: "spa001-7", title: "Review checklist", kind: "Checklist", summary: "Before review.", body: `## Confirm
- Every action traces to a finding.
- Each has an owner, metric, date.
- The uplift is built from named actions.
- The sequence is realistic.` }],
  },
  "SPA-001/8": {
    objective: "You will present the roadmap to CloudTech's IT/management team for input and endorsement, and capture their decision.",
    whatToDo: ["Present the priorities and the ask.", "Anticipate the cost/resourcing questions and record the endorsement."],
    references: [{ id: "spa001-8", title: "What management will ask", kind: "Briefing notes", summary: "Anticipate these.", body: `## Likely questions
- "Why this order?" → quick wins reduce the most risk fastest and fund credibility.
- "Can the team absorb this?" → the Gantt is paced; strategic items are later.
- "What do you need from us?" → budget + owners.

## Capture
Record endorsement (full / with conditions) and date.` }],
  },

  // ───────────── TV-001 · Access Control Review — User Account Validation (CloudTech) ─────────────
  "TV-001/1": {
    objective: "You will obtain the current list of active system accounts from the system owner — one side of the reconciliation.",
    whatToDo: ["Request the account extract (accounts, roles, last-login dates) from a named owner.", "Specify the format and a deadline."],
    references: [{ id: "tv001-1", title: "System Account Extract", kind: "Source document", group: "task", summary: "What you're requesting (and will receive).", body: `## You will receive
| Account | Role | Last login |
| a.shah | Platform Admin | 2 days ago |
| r.kapoor | Developer | 96 days ago |
| j.lee | Finance (read) | yesterday |
| svc-deploy | Service/CI | n/a |
| m.osei | Developer (also has Admin) | 5 days ago |
| t.brown | Support Agent | 210 days ago |

## Note
You need last-login dates to spot dormant accounts — ask for them explicitly.` }],
  },
  "TV-001/2": {
    objective: "You will obtain the current HR list of active staff — the other side of the reconciliation.",
    whatToDo: ["Request the active-staff list (names, start dates, department) from HR.", "Make sure it shows who has left."],
    references: [{ id: "tv001-2", title: "HR Active-Staff List", kind: "Source document", group: "task", summary: "The authoritative list of who actually works here.", body: `## HR active staff
- a.shah — Platform Engineering (active)
- j.lee — Finance (active)
- m.osei — Engineering (active)
- r.kapoor — LEFT 3 months ago
- t.brown — LEFT 7 months ago

## Why this matters
HR is the source of truth for who should have access. Anyone with an account but not on this list is an orphaned account.` }],
  },
  "TV-001/3": {
    objective: "You will cross-reference the two lists to find orphaned, dormant, and role-mismatched accounts — the actual findings.",
    whatToDo: ["Compare accounts vs HR: flag leavers still active (orphaned).", "Flag no-login-90-days (dormant) and excess privilege (mismatch)."],
    references: [{ id: "tv001-3", title: "Finding definitions", kind: "Testing rules", summary: "How to label each account.", body: `## Findings
- Orphaned — account for someone no longer employed (r.kapoor, t.brown). Disable now.
- Dormant — no login in 90 days. Confirm need or disable.
- Mismatch/excess privilege — more rights than the job needs (m.osei has Admin + Developer). Remove excess.
- Service account — svc-deploy: identify, assign an owner, don't treat as a person.

## Standard
ISO A.5.18 / A.8.2 — access to need, reviewed regularly.` }],
  },
  "TV-001/4": {
    objective: "You will record every account in the Access Review Worksheet with its finding type and recommended action.",
    whatToDo: ["One row per account: finding + recommended action.", "Don't omit the 'clean' accounts — they're evidence the review was complete."],
    references: [{ id: "tv001-4", title: "Worksheet fields", kind: "Template", summary: "What each row needs.", body: `## Per account
Account · owner/employee · role · last login · finding (clean/orphaned/dormant/mismatch) · recommended action.

## Rule
Every account is reviewed, not just the bad ones — completeness is the point of an access review.` }],
  },
  "TV-001/5": {
    objective: "You will calculate the percentage of accounts that are clean vs orphaned/dormant/mismatched — the headline metric.",
    whatToDo: ["Count each finding type and compute percentages.", "Re-check the arithmetic."],
    references: [{ id: "tv001-5", title: "The metric", kind: "Standard rules", summary: "What to report.", body: `## Calculate
% clean, % orphaned, % dormant, % mismatched (of total accounts).

## Why
Management understands "33% of accounts had a problem" far better than a list. The number drives the remediation urgency.` }],
  },
  "TV-001/6": {
    objective: "You will write the Access Control Testing Report with findings and remediation recommendations.",
    whatToDo: ["Summarise findings, the metric, and the worst cases.", "Recommend specific remediation with owners."],
    references: [{ id: "tv001-6", title: "Report rules", kind: "Template", summary: "What to include.", body: `## Report
- Scope + method (reconciled accounts vs HR).
- The metric + finding breakdown.
- Specific cases (orphaned leavers, excess privilege).
- Remediation recommendations with owners and a deadline.` }],
  },
  "TV-001/7": {
    objective: "You will review the findings with the Information Security Auditor mentor before issuing the report.",
    whatToDo: ["Share with a short cover note.", "Address feedback."],
    references: [{ id: "tv001-7", title: "Review checklist", kind: "Checklist", summary: "Before issuing.", body: `## Confirm
- Every account reviewed.
- Orphaned accounts correctly identified vs HR.
- The metric arithmetic is right.
- Recommendations have owners + a deadline.` }],
  },
  "TV-001/8": {
    objective: "You will submit the report to the IT Manager with a recommended remediation deadline.",
    whatToDo: ["Deliver the report and the metric.", "Recommend a specific deadline for disabling orphaned accounts."],
    references: [{ id: "tv001-8", title: "Remediation timing", kind: "Briefing notes", summary: "What to recommend.", body: `## Recommend
- Orphaned accounts (leavers) → disable within 24–48 hours (active risk).
- Excess privilege → remove within a week.
- Set a quarterly access-review cadence so this doesn't recur.

## Note
Frame the leaver accounts as the urgent item — an ex-employee with live access is an immediate risk.` }],
  },

  // ───────────── CA-002 · Management Compliance Status Report (CloudTech) ─────────────
  "CA-002/1": {
    objective: "You will gather the outputs from all completed CloudTech tasks into one data pack, so the report is built from facts not impressions.",
    whatToDo: ["Collect the headline numbers from each prior deliverable.", "Note the source of each figure."],
    references: [{ id: "ca002-1", title: "CloudTech — Prior Task Outputs", kind: "Source document", group: "task", summary: "The numbers your report draws on.", body: `## Available data
- CIS IG1: 41% → 58% after quick wins.
- Risk register: 14 open; 2 High (untested backups, delayed deprovisioning).
- Access review: 2 orphaned accounts disabled, 1 excess-privilege fixed.
- Awareness training: 82% complete.
- Decisions needed: fund deprovisioning automation (~£8k); approve quarterly access reviews.

## Rule
Every statement in the report must trace to a figure here.` }],
  },
  "CA-002/2": {
    objective: "You will identify the five most important messages for management — the things they actually need to know and decide.",
    whatToDo: ["Pick the top risks, gaps, improvements, and decisions.", "Cut anything that isn't decision-relevant."],
    references: [{ id: "ca002-2", title: "What management cares about", kind: "Standard rules", summary: "How to choose the five.", body: `## Prioritise
- Top risks (what could hurt us).
- Decisions you need from them (with the cost).
- Improvements made (credibility).

## Rule
Five messages, not fifty. If it doesn't change a decision, it doesn't go on the page.` }],
  },
  "CA-002/3": {
    objective: "You will draft the report on the one-page executive template.",
    whatToDo: ["Fill the template: RAG, top risks, achievements, decisions, outlook.", "Keep it to one page."],
    references: [{ id: "ca002-3", title: "Executive report template", kind: "Template", summary: "The structure.", body: `## One page
1. Overall RAG + one-line summary.
2. Top 3 risks + treatment.
3. Top 3 achievements.
4. Decisions needed (ask + cost).
5. 30-day outlook.` }],
  },
  "CA-002/4": {
    objective: "You will populate the report content: RAG status, top risks, achievements, open decisions, and outlook.",
    whatToDo: ["Fill each section with concrete figures.", "Name the open decisions and their cost."],
    references: [{ id: "ca002-4", title: "Content rules", kind: "Standard rules", summary: "What goes in each box.", body: `## Use numbers
- RAG: Amber (improving but key risks open).
- Top risks: untested backups, delayed deprovisioning.
- Achievements: IG1 41%→58%, orphaned accounts closed.
- Decision: fund deprovisioning automation (£8k).` }],
  },
  "CA-002/5": {
    objective: "You will apply plain-English principles so a non-technical executive can act on it in two minutes.",
    whatToDo: ["Remove jargon; expand acronyms on first use.", "Replace vague words with numbers."],
    references: [{ id: "ca002-5", title: "Plain-English rules", kind: "Standard rules", summary: "How to write for executives.", body: `## Rules
- Lead with the decision, not the detail.
- Percentages and counts, never "several/many".
- No acronym without expansion on first use.
- One page max.` }],
  },
  "CA-002/6": {
    objective: "You will review the draft with the Compliance Manager mentor for accuracy and messaging.",
    whatToDo: ["Share with a short cover note.", "Address feedback."],
    references: [{ id: "ca002-6", title: "Review checklist", kind: "Checklist", summary: "Before finalising.", body: `## Confirm
- Every figure is correct and sourced.
- The decisions are clear with costs.
- It fits on one page.
- No jargon.` }],
  },
  "CA-002/7": {
    objective: "You will incorporate the feedback and finalise the report.",
    whatToDo: ["Apply the changes.", "Final proof for numbers and tone."],
    references: [{ id: "ca002-7", title: "Finalising", kind: "Checklist", summary: "Last checks.", body: `## Final pass
- Numbers reconcile with the data pack.
- One page.
- Decisions and costs explicit.` }],
  },
  "CA-002/8": {
    objective: "You will deliver the report to management and offer to answer questions.",
    whatToDo: ["Send the report with a one-line summary.", "Offer a short walkthrough."],
    references: [{ id: "ca002-8", title: "Delivery", kind: "Briefing notes", summary: "How to hand it over.", body: `## Delivery
- A two-sentence email: the headline + the decision you need.
- Offer 15 minutes to walk through it.
- Make the ask unmissable.` }],
  },

  // ───────────── RR-001 · Tabletop Incident Simulation — Observer (CloudTech) ─────────────
  "RR-001/1": {
    objective: "You will study the incident procedure and the scenario brief before the exercise, so you know what 'good' looks like to observe against.",
    whatToDo: ["Read the IR procedure (DD-001) and the scenario.", "Note the required timings and escalation steps."],
    references: [{ id: "rr001-1", title: "Scenario + procedure", kind: "Source document", group: "task", summary: "What you're observing against.", body: `## Scenario: ransomware on the build server
09:14 — CI/CD server encrypted, deploys blocked, ransom note also on a shared drive.

## Procedure requires
- Declare an incident within 15 min, assign an Incident Lead.
- Classify severity (Sev-1).
- Isolate before investigating.
- Notify management + DPO (if personal data) within 1 hour.
- Keep a timestamped decision log.` }],
  },
  "RR-001/2": {
    objective: "You will attend the full simulation and observe how the team responds in real time.",
    whatToDo: ["Watch the whole exercise without intervening.", "Track who does what and when."],
    references: [{ id: "rr001-2", title: "Observer role", kind: "Briefing notes", summary: "How to observe.", body: `## As observer
- Stay silent; you record, you don't help.
- Note times, decisions, and who made them.
- Watch for what the procedure says vs what actually happens.` }],
  },
  "RR-001/3": {
    objective: "You will take structured notes on the observation sheet — decisions, timings, escalation, gaps, deviations.",
    whatToDo: ["Capture each phase with timestamps and quotes.", "Record every deviation from the procedure."],
    references: [{ id: "rr001-3", title: "Observation sheet", kind: "Template", summary: "The fields to fill.", body: `## Capture per phase
- Decision + who + timestamp.
- Time-to-detect / declare / contain.
- Escalation path used vs documented.
- Communication and tool gaps.
- Deviations (and whether they helped or hurt).

## Rule
An observation without a timestamp or quote isn't usable.` }],
  },
  "RR-001/4": {
    objective: "You will raise one observation point during the debrief, based on your notes.",
    whatToDo: ["Pick the single most useful observation.", "State it factually, tied to a timestamp."],
    references: [{ id: "rr001-4", title: "Debrief contribution", kind: "Briefing notes", summary: "How to raise it.", body: `## Make it count
- One concrete, evidenced point (e.g. "containment started 22 min after detection vs the 15-min target").
- Factual, not blaming.
- Tied to the procedure step it relates to.` }],
  },
  "RR-001/5": {
    objective: "You will write up the Post-Exercise Lessons Learned Report within 48 hours, while it's fresh.",
    whatToDo: ["Summarise what happened vs the procedure.", "Draw out the lessons, with evidence."],
    references: [{ id: "rr001-5", title: "Lessons-learned report", kind: "Template", summary: "Structure.", body: `## Sections
- What happened (timeline).
- What went well.
- Gaps between procedure and reality (with timestamps).
- Lessons + recommended changes.

## Rule
Write within 48 hours — memory and notes fade fast.` }],
  },
  "RR-001/6": {
    objective: "You will identify the top three process improvements and map each to the incident procedure as a proposed amendment.",
    whatToDo: ["Pick the three highest-value fixes.", "Map each to a specific procedure clause to amend."],
    references: [{ id: "rr001-6", title: "From lesson to amendment", kind: "Standard rules", summary: "How to propose changes.", body: `## Each improvement
- Names the gap observed.
- Maps to the procedure clause it fixes.
- States the specific wording/step change.

## Example
"Containment was delayed because no one was sure who could isolate systems → amend the procedure to pre-authorise the Incident Lead to isolate."` }],
  },
  "RR-001/7": {
    objective: "You will review the report with the Incident Response & Crisis Manager mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "rr001-7", title: "Review checklist", kind: "Checklist", summary: "Before filing.", body: `## Confirm
- Timeline is evidenced.
- Each lesson maps to a procedure change.
- Tone is no-blame and factual.` }],
  },
  "RR-001/8": {
    objective: "You will file the report and proposed amendments in the evidence repository.",
    whatToDo: ["File the final report and the procedure amendments.", "Note the review date for the procedure."],
    references: [{ id: "rr001-8", title: "Filing", kind: "Briefing notes", summary: "Where it goes.", body: `## File
- The lessons-learned report (dated).
- The proposed procedure amendments, linked to DD-001.

## Why
Post-incident review evidence (CIS 17.8 / ISO A.5.27) shows the organisation learns from incidents — a real audit ask.` }],
  },

  // ───────────── BCRP-002 · ICT Disaster Recovery Checklist (CloudTech) ─────────────
  "BCRP-002/1": {
    objective: "You will agree the one system the DR checklist will cover, with the IT Manager and mentor.",
    whatToDo: ["Pick the most business-critical system in scope.", "Confirm why it's the priority."],
    references: [{ id: "bcrp002-1", title: "System selection", kind: "Source document", group: "task", summary: "The candidate and why.", body: `## Recommended: Customer accounts database
Postgres, AWS eu-west-1 — the most business-critical store; a customer audit is coming. Its recovery objectives (BCRP-001): RTO 4h, RPO 1h.

## Rule
Pick the system whose loss hurts most — recovery effort follows business impact.` }],
  },
  "BCRP-002/2": {
    objective: "You will review the system's existing backup configuration to ground the checklist in reality.",
    whatToDo: ["Capture the backup schedule, media, retention, and off-site copy.", "Note what's never been tested."],
    references: [{ id: "bcrp002-2", title: "Backup configuration", kind: "Source document", group: "task", summary: "The real config your checklist must match.", body: `## Customer accounts DB
- Nightly snapshot 02:00 UTC, retained 14 days.
- Cross-region copy to eu-central-1 (off-site).
- Point-in-time recovery (5-min granularity) — this is what makes RPO 1h achievable.
- Restores have NEVER been tested (the key gap).` }],
  },
  "BCRP-002/3": {
    objective: "You will request the manual recovery steps and any runbooks from the system owner.",
    whatToDo: ["Address the request to the system owner.", "Ask for the step-by-step restore process, who holds the credentials/access, and any runbooks.", "Set a deadline for the response."],
    references: [{ id: "bcrp002-3", title: "What to request", kind: "Request guide", summary: "What to ask for.", body: `## Request
- The step-by-step restore process, from scratch.
- Who holds the credentials/access needed to do it.
- Any runbooks or documentation that exist.
- What is only in someone's head (undocumented).

## Why
The undocumented steps are the ones that fail under pressure — surface them.` }],
  },
  "BCRP-002/4": {
    objective: "You will draft the DR checklist covering preparation through return-to-normal sign-off.",
    whatToDo: ["Write each phase as ordered, verifiable steps.", "Include who does each step."],
    references: [{ id: "bcrp002-4", title: "DR checklist sections", kind: "Template", summary: "The phases to cover.", body: `## Sections
1. Pre-incident prep (access, credentials, contacts, backup locations).
2. Detection & declaration.
3. Backup retrieval (which backup, which region, integrity check).
4. Restoration sequence (ordered, dependencies).
5. Validation testing.
6. Return-to-normal & sign-off.

## Rule
Each step needs an owner and a verification.` }],
  },
  "BCRP-002/5": {
    objective: "You will embed the RTO and RPO from the BIA as explicit success criteria in the checklist.",
    whatToDo: ["State the RTO (4h) and RPO (1h) as pass/fail criteria.", "Show how point-in-time recovery meets the 1h RPO."],
    references: [{ id: "bcrp002-5", title: "RTO/RPO as criteria", kind: "Standard rules", summary: "How to use them.", body: `## Success criteria
- Restore complete within RTO (4 hours).
- Data loss ≤ RPO (1 hour) — use point-in-time recovery to the last 5-minute point.

## Rule
A DR checklist without measurable success criteria can't tell you if recovery actually worked.` }],
  },
  "BCRP-002/6": {
    objective: "You will validate the checklist with a talk-through (not a real restore) and find what wouldn't work.",
    whatToDo: ["Walk each step aloud with the owner.", "Note any step that can't be done as written."],
    references: [{ id: "bcrp002-6", title: "Talk-through validation", kind: "Testing rules", summary: "How to test on paper.", body: `## Talk-through
Read each step and ask "could we actually do this, now, with the access we have?" Common failures: no one has the restore credentials, the off-site copy location is unknown, no way to verify the restore is good.

## Rule
Validation finds the gaps before a real disaster does.` }],
  },
  "BCRP-002/7": {
    objective: "You will incorporate the corrections found during the talk-through.",
    whatToDo: ["Fix each step that failed validation.", "Re-check the sequence still holds."],
    references: [{ id: "bcrp002-7", title: "Applying corrections", kind: "Checklist", summary: "What to fix.", body: `## Typical fixes
- Add a pre-step to confirm who holds credentials.
- Add an integrity check on the retrieved backup.
- Add an explicit validation test (query a known record).` }],
  },
  "BCRP-002/8": {
    objective: "You will file the finalised checklist and advise the IT Manager to schedule a live restoration test.",
    whatToDo: ["File the checklist in the DR library.", "Recommend a date for the first real restore test."],
    references: [{ id: "bcrp002-8", title: "Filing + next step", kind: "Briefing notes", summary: "Close the gap.", body: `## Advise
The biggest remaining risk is that restores have never been tested. Recommend a live restore test (in a safe environment) within 30 days — a checklist that's never executed is unproven.

## File
Store the checklist in the DR documentation library with a review date.` }],
  },

  // ───────────── TPRM-001 · Supplier Inventory & Basic Risk Rating (CloudTech) ─────────────
  "TPRM-001/1": {
    objective: "You will gather a complete list of CloudTech's vendors from every source, so no third party is missed.",
    whatToDo: ["Pull vendor names from contracts, accounts payable, IT procurement, and dept heads.", "Cross-check sources — shadow vendors hide between them."],
    references: [{ id: "tprm001-1", title: "Where vendors hide", kind: "Source document", group: "task", summary: "The sources to pull from.", body: `## Sources
- Contract management system (the official ones).
- Accounts payable (anyone you pay — catches the freelancers).
- IT procurement / SaaS subscriptions (Mailchimp, Slack, etc.).
- Department heads (the offshore QA contractor only shows up here).

## Watch for
The offshore QA contractor with a copy of production data appears only in interviews — that's the one that matters most.` }],
  },
  "TPRM-001/2": {
    objective: "You will record each vendor's key facts: what they do, what data they access, what they connect to, contract status, and contact.",
    whatToDo: ["One row per vendor with all fields.", "Be precise about data access (none/view/process/store)."],
    references: [{ id: "tprm001-2", title: "Vendor register fields", kind: "Template", summary: "What to capture per vendor.", body: `## Per vendor
Name · service · data access (none/view/process/store) · systems connected · contract status · DPA in place? · primary contact.

## Why data access matters
"Stores customer personal data" drives the risk score far more than "views the website" — capture it accurately.` }],
  },
  "TPRM-001/3": {
    objective: "You will apply the five-criterion risk rating to each vendor, consistently.",
    whatToDo: ["Score each vendor 1–3 on the five criteria.", "Don't rate from gut feel — use the criteria."],
    references: [{ id: "tprm001-3", title: "The five criteria", kind: "Rating rules", summary: "How to score.", body: `## Score each 1 (low) – 3 (high)
1. Data access level. 2. System access level. 3. Service criticality. 4. Geographic location (outside UK/EU raises it). 5. Certification (ISO/SOC 2 lowers; none raises).

## Apply
Stripe (certified, DPA) scores low; the offshore QA contractor (stores prod data, no cert, no DPA) scores high.` }],
  },
  "TPRM-001/4": {
    objective: "You will calculate a composite Low/Medium/High score for each vendor.",
    whatToDo: ["Average the five criteria to a composite.", "Map to Low/Medium/High bands."],
    references: [{ id: "tprm001-4", title: "Composite scoring", kind: "Rating rules", summary: "How to band.", body: `## Composite
Average the five → Low (<1.7) / Medium (1.7–2.3) / High (>2.3).

## Override
Any vendor storing personal data with no DPA is escalated regardless of score (GDPR Art. 28).` }],
  },
  "TPRM-001/5": {
    objective: "You will flag every High-rated vendor for escalation to the mentor.",
    whatToDo: ["List the High vendors with the reason.", "Recommend the next step for each."],
    references: [{ id: "tprm001-5", title: "Escalation", kind: "Standard rules", summary: "What to escalate.", body: `## Escalate
- The offshore QA contractor (prod data, no DPA, no cert) — highest risk.
- Any High vendor with privileged system access.

## Each flag needs
The reason + a proposed action (e.g. "stop sharing prod data; require a DPA + ISO cert").` }],
  },
  "TPRM-001/6": {
    objective: "You will identify vendors with no data-processing agreement in place — a GDPR gap.",
    whatToDo: ["Check each vendor that processes personal data for a DPA.", "Flag every missing DPA."],
    references: [{ id: "tprm001-6", title: "DPA requirement", kind: "Standard extract", summary: "Why missing DPAs matter.", body: `## GDPR Article 28
Where a processor handles personal data on your behalf, a written contract (DPA) is mandatory.

## CloudTech gaps
- Mailchimp — processes prospect personal data, no DPA.
- The offshore QA contractor — has prod personal data, no DPA.
Both are legal gaps, not just risks.` }],
  },
  "TPRM-001/7": {
    objective: "You will produce the Supplier Register and a summary highlighting high-risk vendors and missing DPAs.",
    whatToDo: ["Finalise the register.", "Write a short summary of the High vendors and DPA gaps."],
    references: [{ id: "tprm001-7", title: "Register + summary", kind: "Template", summary: "What to produce.", body: `## Deliverable
- The full supplier register (all vendors, scored).
- A one-page summary: the High vendors, the missing DPAs, and recommended actions.

## Rule
Lead the summary with the offshore contractor + the DPA gaps — those are the actionable risks.` }],
  },
  "TPRM-001/8": {
    objective: "You will review the register with the Vendor/Third-Party Risk Analyst mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "tprm001-8", title: "Review checklist", kind: "Checklist", summary: "Before sign-off.", body: `## Confirm
- No vendor missed (all sources cross-checked).
- Scores applied consistently from the criteria.
- DPA gaps flagged.
- High vendors have actions.` }],
  },

  // ───────────── PE-001 · GRC Project Charter — Kick-Off (CloudTech) ─────────────
  "PE-001/1": {
    objective: "You will meet the Programme Manager to agree the scope of the compliance initiative before writing anything.",
    whatToDo: ["Confirm the goal, deadline, budget, and what's in/out of scope.", "Write down what was agreed."],
    references: [{ id: "pe001-1", title: "Initiative brief", kind: "Source document", group: "task", summary: "The scope facts from the sponsor.", body: `## From the CTO (sponsor)
- Goal: SOC 2 readiness in 9 months to win an enterprise customer.
- Budget: £60k; one part-time security hire.
- In scope: the customer platform + cloud infra.
- OUT of scope: marketing website; the billing system (Finance owns it).
- Hard deadline: customer audit in 9 months.` }],
  },
  "PE-001/2": {
    objective: "You will define the project objectives, success criteria, and explicit out-of-scope items.",
    whatToDo: ["Write measurable objectives and success criteria.", "List out-of-scope items explicitly."],
    references: [{ id: "pe001-2", title: "Objectives & scope rules", kind: "Standard rules", summary: "How to write them.", body: `## Rules
- Objectives measurable ("achieve SOC 2 Type I by month 6").
- Success criteria tied to the audit outcome.
- Out-of-scope written down (marketing site, billing) — most project conflict comes from assumed inclusions.` }],
  },
  "PE-001/3": {
    objective: "You will identify the project team: sponsor, lead, workstream owners, and stakeholders.",
    whatToDo: ["Name each role and who fills it.", "Confirm each person knows they're on the team."],
    references: [{ id: "pe001-3", title: "Team roles", kind: "Template", summary: "Who you need.", body: `## Roles
- Sponsor (the CTO — funds and unblocks).
- Project lead (you / the GRC lead).
- Workstream owners (access, change, backup, vendor).
- Stakeholders (the customer, Finance for budget).` }],
  },
  "PE-001/4": {
    objective: "You will draft the Project Charter to the template.",
    whatToDo: ["Fill every section of the charter.", "Make scope and governance explicit."],
    references: [{ id: "pe001-4", title: "Charter sections", kind: "Template", summary: "What it must contain.", body: `## Sections
Background · objectives & success criteria · scope (in) and out-of-scope · deliverables & milestones · timeline · resources & budget · risks/assumptions/dependencies · governance.

## Rule
Out-of-scope must be explicit.` }],
  },
  "PE-001/5": {
    objective: "You will build a high-level milestone timeline (not task-level).",
    whatToDo: ["Place the major milestones across the 9 months.", "Keep it milestones-only at this stage."],
    references: [{ id: "pe001-5", title: "Milestone timeline", kind: "Template", summary: "Level of detail.", body: `## Milestones only
e.g. M2 gap analysis done · M4 quick wins implemented · M6 SOC 2 Type I · M9 customer audit.

## Rule
A charter timeline shows milestones, not every task — detail comes later.` }],
  },
  "PE-001/6": {
    objective: "You will identify the top three project risks and initial mitigations.",
    whatToDo: ["Name the three biggest risks to delivery.", "State an initial mitigation for each."],
    references: [{ id: "pe001-6", title: "Project risks", kind: "Standard rules", summary: "The likely risks here.", body: `## Likely risks
- Small, stretched team (mitigation: the part-time hire + ruthless scope).
- The 9-month deadline (mitigation: front-load quick wins).
- Dependence on engineering availability (mitigation: sponsor commitment).

## Rule
A project risk needs an owner and a mitigation, not just a worry.` }],
  },
  "PE-001/7": {
    objective: "You will circulate the Charter for review and obtain the sponsor's sign-off.",
    whatToDo: ["Send to the sponsor and stakeholders.", "Capture the sign-off decision and date."],
    references: [{ id: "pe001-7", title: "Sign-off", kind: "Standard rules", summary: "What sign-off means.", body: `## Sign-off
The sponsor formally approves scope, budget, and timeline. Record the decision and date. Without sign-off the project has no mandate — work that starts before it is at risk.` }],
  },
  "PE-001/8": {
    objective: "You will run the kick-off meeting and distribute the signed Charter to the team.",
    whatToDo: ["Run the kick-off to the agenda.", "Distribute the signed charter and confirm everyone's role."],
    references: [{ id: "pe001-8", title: "Kick-off agenda", kind: "Template", summary: "What to cover.", body: `## Kick-off
- Why we're doing this (the customer + deadline).
- Scope and out-of-scope.
- Roles and who owns what.
- The milestones and the first actions.
- How we'll govern (cadence, decisions).` }],
  },

  // ───────────── QA-002 · Control Testing Methodology Development (CloudTech) ─────────────
  "QA-002/1": {
    objective: "You will select three controls to build test methodologies for, with the auditor mentor.",
    whatToDo: ["Pick three controls of different types from the ISO matrix.", "Confirm what 'working' means for each."],
    references: [{ id: "qa002-1", title: "Three controls", kind: "Source document", group: "task", summary: "The controls and what 'working' looks like.", body: `## Selected
1. A.8.2 Privileged access — only approved admins, reviewed quarterly.
2. A.8.13 Backup — backups run + periodically restore-tested.
3. A.8.32 Change management — production changes reviewed and approved.

## Rule
Choose different control types so you practise different test approaches.` }],
  },
  "QA-002/2": {
    objective: "You will define, for each control, its objective, the test approach, the steps, the evidence, and pass/fail criteria.",
    whatToDo: ["For each control, design the test fully.", "State explicit pass/fail criteria."],
    references: [{ id: "qa002-2", title: "Test approaches", kind: "Testing rules", summary: "The four ways to test.", body: `## Approaches (weakest → strongest)
Inquiry → Observation → Inspection → Re-performance.

## Pick the strongest feasible
- A.8.2 → Inspection of the admin list + review records.
- A.8.13 → Re-performance (attempt a restore yourself).
- A.8.32 → Inspection of change records vs deploys.

## Rule
Define pass/fail before testing.` }],
  },
  "QA-002/3": {
    objective: "You will research how professional audit firms test comparable controls, to lift your methodology to a professional standard.",
    whatToDo: ["Read the provided audit-standard extracts.", "Note the sampling and evidence expectations."],
    references: [{ id: "qa002-3", title: "Professional testing norms", kind: "Standard extract", summary: "How real auditors test these.", body: `## Norms
- Auditors sample (e.g. a sample of deploys, not all) and state how the sample was chosen.
- They require independent evidence (logs, records), not management assertions.
- They re-perform where feasible (e.g. independently confirm a restore).

## Apply
Bring these norms into your methodology so it would survive a real audit.` }],
  },
  "QA-002/4": {
    objective: "You will complete a Control Testing Methodology Sheet for each of the three controls.",
    whatToDo: ["Fill the sheet per control.", "Make it repeatable by someone else."],
    references: [{ id: "qa002-4", title: "Methodology sheet", kind: "Template", summary: "Fields per control.", body: `## Per control
Control objective · test approach · test steps · evidence required · sample size + selection · pass/fail criteria.

## Rule
Another person should be able to run your test and get the same result — that's the point of a methodology.` }],
  },
  "QA-002/5": {
    objective: "You will write a one-page methodology overview covering sampling, frequency, and documentation standards.",
    whatToDo: ["Explain the overall approach (sampling, frequency).", "State how test evidence is documented."],
    references: [{ id: "qa002-5", title: "Overview content", kind: "Template", summary: "What the overview covers.", body: `## Overview
- Sampling approach and rationale.
- Testing frequency (e.g. quarterly for access, annually for DR).
- How results and evidence are recorded.

## Rule
Consistency is the goal — the overview makes every control test follow the same standard.` }],
  },
  "QA-002/6": {
    objective: "You will review the methodology sheets with the auditor mentor for professional adequacy.",
    whatToDo: ["Share with a cover note.", "Address feedback on rigour."],
    references: [{ id: "qa002-6", title: "Review checklist", kind: "Checklist", summary: "Before finalising.", body: `## Confirm
- Each test has explicit pass/fail criteria.
- The strongest feasible approach is used.
- Sampling is defined.
- Evidence is independent, not assertion-based.` }],
  },
  "QA-002/7": {
    objective: "You will incorporate the feedback and add the methodology to the GRC Quality Assurance library.",
    whatToDo: ["Apply the changes.", "File it so future audits can reuse it."],
    references: [{ id: "qa002-7", title: "Filing", kind: "Briefing notes", summary: "Where it goes.", body: `## File
Add the methodology sheets + overview to the QA library, with a version and review date so they're reused, not reinvented each audit.` }],
  },
  "QA-002/8": {
    objective: "You will brief the Compliance Manager on the methodology so it can be reused in future audits.",
    whatToDo: ["Explain the methodology in plain terms.", "Show how it makes future testing consistent and faster."],
    references: [{ id: "qa002-8", title: "Briefing", kind: "Briefing notes", summary: "How to present it.", body: `## Brief
- What the methodology is and why it matters (repeatable, audit-grade testing).
- How to use it for the three controls now and others later.
- Keep it short and practical.` }],
  },

  // ═════════════ LearnTech Educational Solutions · Education & Research ═════════════
  // ───────────── AA-003 · Privacy Data-Flow Mapping & GDPR Applicability ─────────────
  "AA-003/3.1": {
    objective: "You will choose one data-heavy LearnTech process to map, with the mentor — ideally one involving children's data, where GDPR risk is highest.",
    whatToDo: ["Pick a process that processes a lot of personal data.", "Confirm why it's the right one to assess."],
    references: [{ id: "aa003-3-1", title: "Candidate processes", kind: "Source document", group: "task", summary: "Which process to pick and why.", body: `## Recommended: student enrolment
Schools sign up, teachers create student accounts, students (many under 16) use the platform. It involves children's data, behavioural analytics, and a US analytics transfer — the highest-risk, most instructive choice.` }],
  },
  "AA-003/3.2": {
    objective: "You will request the data-flow details from the process owner — exactly what personal data flows where.",
    whatToDo: ["Address the request to the process owner.", "Ask what data is collected, from whom, stored where, shared with whom, kept how long.", "Call out special-category and children's data specifically."],
    references: [{ id: "aa003-3-2", title: "What to request", kind: "Request guide", summary: "What to ask for.", body: `## Request
- What personal data we collect, and from whom (student? school?).
- Where it is stored, and who can access it.
- Who we share it with (third parties, other countries).
- How long we keep it.
- Any health/accessibility data (special category).

## At LearnTech
You'll uncover: student DOB/email/progress + behavioural analytics, accessibility flags (special category), and a US analytics tool (Mixpanel).` }],
  },
  "AA-003/3.3": {
    objective: "You will draw the data-flow diagram showing each step, purpose, lawful basis, and any cross-border transfer.",
    whatToDo: ["Diagram the flow from collection to deletion.", "Mark the lawful basis and the US transfer."],
    references: [{ id: "aa003-3-3", title: "Data-flow facts", kind: "Source document", group: "task", summary: "The flow you must draw.", body: `## The flow
School → student accounts (AWS eu-west-1) → behavioural analytics via Mixpanel (US) → retained "indefinitely" (a gap).

## Mark on the diagram
- Purpose at each step.
- Lawful basis (likely contract with the school; consent issues for children).
- The US transfer (a DPIA trigger).` }],
  },
  "AA-003/3.4": {
    objective: "You will complete the Record of Processing Activities (RoPA) entry to GDPR Article 30.",
    whatToDo: ["Fill every Article 30 field.", "Be specific about data categories and recipients."],
    references: [{ id: "aa003-3-4", title: "RoPA (Article 30) fields", kind: "Standard extract", summary: "What the entry must record.", body: `## Article 30 fields
Purpose · categories of data subjects · categories of personal data · recipients · international transfers · retention period · security measures · lawful basis.

## Rule
"Children (under 16)" is a data-subject category that matters — record it; it drives the DPIA.` }],
  },
  "AA-003/3.5": {
    objective: "You will run the 9-criterion DPIA screening and decide whether a full DPIA is required.",
    whatToDo: ["Check the processing against all 9 criteria.", "Record the disposition with the reason."],
    references: [{ id: "aa003-3-5", title: "DPIA screening (9 criteria)", kind: "Standard extract", summary: "The triggers — count them.", body: `## A DPIA is required if ≥2 apply
1. Profiling/scoring. 2. Large-scale. 3. Special-category/highly personal. 4. Vulnerable subjects (children). 5. Innovative tech. 6. Matching datasets. 7. Prevents a right. 8. Systematic monitoring. 9. Transfer outside UK/EU without adequacy.

## At LearnTech
Children + behavioural profiling + US transfer = three triggers → a full DPIA is required.` }],
  },
  "AA-003/3.6": {
    objective: "You will document the findings, the gaps, and the lawful-basis evidence.",
    whatToDo: ["Write up the screening outcome and gaps (e.g. indefinite retention, US transfer safeguard).", "Record the lawful-basis reasoning."],
    references: [{ id: "aa003-3-6", title: "What to document", kind: "Template", summary: "The write-up.", body: `## Document
- DPIA disposition (required) + the triggers.
- Gaps: indefinite retention; US transfer without a documented safeguard; consent for children's analytics.
- Lawful basis per purpose, with reasoning.` }],
  },
  "AA-003/3.7": {
    objective: "You will review the RoPA and screening with the mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "aa003-3-7", title: "Review checklist", kind: "Checklist", summary: "Before sign-off.", body: `## Confirm
- RoPA complete to Article 30.
- DPIA decision justified by the criteria.
- Children's data + US transfer flagged.
- Gaps captured.` }],
  },
  "AA-003/3.8": {
    objective: "You will obtain the process owner's sign-off on the RoPA and screening outcome.",
    whatToDo: ["Walk the owner through the findings.", "Record the sign-off and any agreed actions."],
    references: [{ id: "aa003-3-8", title: "Sign-off", kind: "Briefing notes", summary: "What to capture.", body: `## Sign-off
The process owner confirms the RoPA is accurate and accepts the DPIA finding. Record the decision, date, and the agreed next actions (e.g. set a retention period, document the transfer safeguard).` }],
  },

  // ───────────── CRM-001 · Regulatory Requirements Inventory & Obligations Register ─────────────
  "CRM-001/7.1": {
    objective: "You will review the regulatory landscape for LearnTech's jurisdictions and sector, so you know which laws to inventory.",
    whatToDo: ["Identify the laws that apply to a UK EdTech selling to UK + US schools.", "Note children's-data rules specifically."],
    references: [{ id: "crm001-7-1", title: "LearnTech regulatory context", kind: "Source document", group: "task", summary: "What applies and why.", body: `## Triggers
- UK GDPR + DPA 2018; ICO Children's Code (children's data).
- EU GDPR (some EU schools).
- US FERPA + COPPA (US districts, under-13 users).
- PECR (teacher marketing emails).
- Contractual DPAs from schools; ISO 27001 (a customer asks).

## Rule
Children's-data rules (Children's Code, COPPA) are the easy ones to miss — capture them.` }],
  },
  "CRM-001/7.2": {
    objective: "You will request confirmation from the Legal/Compliance contact and IT Manager of which obligations actually apply.",
    whatToDo: ["Address the request to the Legal/Compliance contact and the IT Manager.", "Ask them to confirm applicability and who owns each area.", "Set a deadline."],
    references: [{ id: "crm001-7-2", title: "What to request", kind: "Request guide", summary: "What to confirm.", body: `## Request confirmation of
- Which jurisdictions our customers sit in.
- Whether we process data of under-13s / under-16s.
- What contractual security/privacy terms schools impose.
- Who owns privacy, security, and contracts internally.` }],
  },
  "CRM-001/7.3": {
    objective: "You will list all applicable obligations across legislation, sector rules, contracts, and voluntary standards.",
    whatToDo: ["List obligations in the four categories.", "Don't merge distinct obligations into one line."],
    references: [{ id: "crm001-7-3", title: "Obligation categories", kind: "Standard rules", summary: "The four buckets.", body: `## Categories
1. Legislation (UK GDPR, FERPA, COPPA, PECR).
2. Sector-specific (ICO Children's Code).
3. Contractual (school DPAs).
4. Voluntary standards (ISO 27001, Cyber Essentials).

## Rule
One obligation per row — "GDPR" isn't one obligation; breach notification, RoPA, and DSAR are separate.` }],
  },
  "CRM-001/7.4": {
    objective: "You will document each obligation in full: source, requirement, owner, status, and review date.",
    whatToDo: ["Capture all fields per obligation.", "Mark status Met / Partial / Gap with evidence."],
    references: [{ id: "crm001-7-4", title: "Register fields", kind: "Template", summary: "Per-obligation fields.", body: `## Per obligation
Source · specific requirement · applicability rationale · owner (role) · status (Met/Partial/Gap) · evidence · next review.

## Rule
"Met" with no evidence is really a Gap — flag it.` }],
  },
  "CRM-001/7.5": {
    objective: "You will map each obligation to the relevant ISO 27001 clause or control, linking law to control.",
    whatToDo: ["Map each obligation to the ISO control that delivers it.", "Note obligations with no controlling clause."],
    references: [{ id: "crm001-7-5", title: "Obligation → ISO mapping", kind: "Standard extract", summary: "How law maps to controls.", body: `## Examples
- Breach notification (GDPR) → A.5.24–5.26 incident management.
- RoPA (GDPR) → A.5.34 privacy & PII protection.
- Access to school data → A.5.18 access rights.

## Why
Mapping shows which controls evidence which legal duty — the basis of a defensible compliance position.` }],
  },
  "CRM-001/7.6": {
    objective: "You will highlight the gaps — obligations with no owner or no evidence of compliance.",
    whatToDo: ["Flag every obligation with no owner or no evidence.", "Note the exposure each gap creates."],
    references: [{ id: "crm001-7-6", title: "Gap rules", kind: "Standard rules", summary: "What's a gap.", body: `## Flag as a gap
- No named owner.
- Status Met/Partial but no evidence.
- A legal duty with no control mapped.

## Likely LearnTech gaps
COPPA (under-13 consent) and the Children's Code are often unowned in a young EdTech.` }],
  },
  "CRM-001/7.7": {
    objective: "You will review the obligations register with the Compliance Manager mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "crm001-7-7", title: "Review checklist", kind: "Checklist", summary: "Before registering.", body: `## Confirm
- All four categories covered.
- Children's-data obligations included.
- Each obligation has an owner + status.
- Gaps flagged.` }],
  },
  "CRM-001/7.8": {
    objective: "You will register the document in the policy register and schedule a quarterly review.",
    whatToDo: ["Add it to the register with a version and owner.", "Set the next review date."],
    references: [{ id: "crm001-7-8", title: "Registering", kind: "Briefing notes", summary: "Keeping it live.", body: `## Register
An obligations register is only useful if maintained — laws change. Set a quarterly review, name the owner, and version it.` }],
  },

  // ───────────── DD-001 · Incident Reporting Procedure Development ─────────────
  "DD-001/1": {
    objective: "You will review any existing incident-related documentation to understand the current (informal) state.",
    whatToDo: ["Read helpdesk tickets, email chains, and informal guidance.", "Note how incidents are handled today and the gaps."],
    references: [{ id: "dd001-1", title: "Current state", kind: "Source document", group: "task", summary: "How LearnTech handles incidents now.", body: `## Today
- Staff "mention it in Slack" if they notice something.
- No definition of an incident → phishing goes unreported.
- No triage owner; the CTO sometimes sees it days later.
- No severity, timing, or record.
- Staff fear blame, so stay quiet.` }],
  },
  "DD-001/2": {
    objective: "You will request, from the IT Manager and a front-line staff member, details of the real reporting path.",
    whatToDo: ["Address the request to the IT Manager and a front-line staff member.", "Ask how reporting actually happens, where it breaks, and what stops people reporting.", "Set a deadline."],
    references: [{ id: "dd001-2", title: "What to request", kind: "Request guide", summary: "What to ask for.", body: `## Request
- What someone would actually do on seeing something suspicious.
- Anything that has stopped people reporting before.
- Who deals with a report once it's made.

## Why
The "I didn't want to look stupid" answers reveal why a no-blame statement must be in the procedure.` }],
  },
  "DD-001/3": {
    objective: "You will draft the incident reporting procedure to the template.",
    whatToDo: ["Cover scope, definitions, how to recognise/report, escalation, confidentiality.", "Make reporting easy and blame-free."],
    references: [{ id: "dd001-3", title: "Procedure sections", kind: "Template", summary: "What it must contain.", body: `## Sections
Scope · what is an incident (with examples) · how to report (channel, timing, info) · escalation path · roles · confidentiality / no-blame · review cycle.

## Rule
Name one clear channel and an "if in doubt, report it" rule.` }],
  },
  "DD-001/4": {
    objective: "You will create a one-page Incident Reporting Quick Reference Card for staff.",
    whatToDo: ["Distil the procedure to a pocket card.", "Make the channel and 'report it' message unmissable."],
    references: [{ id: "dd001-4", title: "Quick-reference card", kind: "Template", summary: "What goes on one page.", body: `## On the card
- 3 examples of what to report (phishing, lost device, odd account activity).
- The one channel + who to contact.
- "If in doubt, report it — you won't be blamed."` }],
  },
  "DD-001/5": {
    objective: "You will map each procedure step to ISO 27001 A.6.8 (event reporting).",
    whatToDo: ["Map the procedure to A.6.8.", "Confirm the channel and timing satisfy the control."],
    references: [{ id: "dd001-5", title: "ISO A.6.8", kind: "Standard extract", summary: "The control your procedure evidences.", body: `## A.6.8 — Information security event reporting
"Personnel shall report observed or suspected information security events through appropriate channels in a timely manner."

## Map
Your named channel + timing is the evidence for A.6.8.` }],
  },
  "DD-001/6": {
    objective: "You will circulate the draft for review to the IT Manager and a sample end-user for readability.",
    whatToDo: ["Send for review.", "Specifically test that a non-technical user understands it."],
    references: [{ id: "dd001-6", title: "Readability review", kind: "Checklist", summary: "What to test.", body: `## Test with a real user
- Can they say, after reading, exactly what to do and who to tell?
- Any jargon they didn't get?
- Would they actually use it?` }],
  },
  "DD-001/7": {
    objective: "You will incorporate the feedback and finalise the procedure.",
    whatToDo: ["Apply changes.", "Confirm it's plain and actionable."],
    references: [{ id: "dd001-7", title: "Finalising", kind: "Checklist", summary: "Last checks.", body: `## Confirm
- One clear channel + timing.
- No-blame statement present.
- A.6.8 mapped.
- A non-technical user understood it.` }],
  },
  "DD-001/8": {
    objective: "You will register the procedure and draft a staff communication announcing it.",
    whatToDo: ["Add it to the policy library.", "Write a one-paragraph staff announcement."],
    references: [{ id: "dd001-8", title: "Roll-out", kind: "Briefing notes", summary: "Announcing it.", body: `## Announcement
One short paragraph: we now have a simple way to report security concerns, here's the channel, and you won't be blamed for reporting. A procedure no one knows about doesn't work.` }],
  },

  // ───────────── SPA-002 · Stakeholder Mapping for a GRC Initiative ─────────────
  "SPA-002/1": {
    objective: "You will choose the GRC initiative whose stakeholders you'll map (e.g. ISO 27001 certification).",
    whatToDo: ["Pick an initiative from the roadmap.", "Confirm its scope so you know who's affected."],
    references: [{ id: "spa002-1", title: "The initiative", kind: "Source document", group: "task", summary: "What you're mapping stakeholders for.", body: `## Initiative
LearnTech's ISO 27001 certification, driven by a major school-district customer. It touches engineering (process change), the customer, and the regulator.` }],
  },
  "SPA-002/2": {
    objective: "You will brainstorm every potential stakeholder, internal and external.",
    whatToDo: ["List internal (IT, HR, Legal, Finance, Board) and external (customer, regulator, vendors) stakeholders.", "Don't miss the affected-but-quiet groups (end users)."],
    references: [{ id: "spa002-2", title: "Stakeholder list", kind: "Source document", group: "task", summary: "Who's involved.", body: `## Stakeholders
- CEO (sponsor), CTO (delivery), Engineering (must change).
- The school-district customer (can walk away).
- ICO / regulator.
- Teachers/students (affected end users).
- Finance (budget).` }],
  },
  "SPA-002/3": {
    objective: "You will complete the Stakeholder Register: role, interest, influence, and communication needs for each.",
    whatToDo: ["Fill the register per stakeholder.", "Rate influence and interest honestly."],
    references: [{ id: "spa002-3", title: "Register fields", kind: "Template", summary: "Per-stakeholder fields.", body: `## Per stakeholder
Name/group · role · interest in the initiative · influence (High/Low) · interest (High/Low) · communication needs · preferred channel.` }],
  },
  "SPA-002/4": {
    objective: "You will plot every stakeholder on the Influence–Interest matrix.",
    whatToDo: ["Place each stakeholder in a quadrant from their ratings.", "Sanity-check placements against reality."],
    references: [{ id: "spa002-4", title: "The matrix", kind: "Template", summary: "The 2×2 grid.", body: `## Quadrants (Influence × Interest)
- High/High: CEO, CTO, customer.
- High/Low: regulator, Finance.
- Low/High: nobody much here.
- Low/Low: teachers/students.

## Rule
Placement must match the register ratings, not convenience.` }],
  },
  "SPA-002/5": {
    objective: "You will determine the engagement strategy for each quadrant.",
    whatToDo: ["Assign a strategy per quadrant.", "Match effort to the quadrant."],
    references: [{ id: "spa002-5", title: "Quadrant strategies", kind: "Standard rules", summary: "How to engage each.", body: `## Strategies
- High/High → Manage Closely (involve in decisions).
- High/Low → Keep Satisfied (high-level updates).
- Low/High → Keep Informed.
- Low/Low → Monitor.

## Rule
Over-engaging "Monitor" wastes effort; under-engaging "Manage Closely" sinks the initiative.` }],
  },
  "SPA-002/6": {
    objective: "You will draft a Stakeholder Communication Plan: what, how often, which channel.",
    whatToDo: ["For each group, define message, frequency, and channel.", "Align with the quadrant strategy."],
    references: [{ id: "spa002-6", title: "Communication plan", kind: "Template", summary: "What it covers.", body: `## Per stakeholder group
What to communicate · how often · channel · owner.

## Example
Customer (Manage Closely) → monthly progress + audit-readiness update, by call. Regulator (Keep Satisfied) → only when required.` }],
  },
  "SPA-002/7": {
    objective: "You will review the mapping with the Policy & Governance Analyst mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "spa002-7", title: "Review checklist", kind: "Checklist", summary: "Before presenting.", body: `## Confirm
- No stakeholder missed.
- Placements match ratings.
- Strategies match quadrants.
- The comms plan is realistic.` }],
  },
  "SPA-002/8": {
    objective: "You will present the Influence–Interest matrix to the project sponsor for validation.",
    whatToDo: ["Walk the sponsor through the matrix and strategies.", "Capture their agreement or corrections."],
    references: [{ id: "spa002-8", title: "Presenting to the sponsor", kind: "Briefing notes", summary: "What to confirm.", body: `## Confirm with the sponsor
- Are the High/High players right (they'll be involved in decisions)?
- Is anyone mis-placed?
- Record their validation — the sponsor knows the politics you don't.` }],
  },

  // ───────────── CA-001 · Security Awareness Briefing — Delivery ─────────────
  "CA-001/1": {
    objective: "You will schedule a 30-minute all-staff awareness session with HR/Operations.",
    whatToDo: ["Find a slot that maximises attendance.", "Confirm the room/video setup."],
    references: [{ id: "ca001-1", title: "Scheduling", kind: "Briefing notes", summary: "Practicalities.", body: `## Schedule
- Coordinate with HR/Ops for a time most staff can attend.
- 30 minutes; book the room or video call.
- Audience: ~40 mostly non-technical staff (teachers, support).` }],
  },
  "CA-001/2": {
    objective: "You will send the invite and a pre-session communication explaining the purpose.",
    whatToDo: ["Send a calendar invite.", "Add a short note on why it matters (the recent phishing incident)."],
    references: [{ id: "ca001-2", title: "Pre-session comms", kind: "Template", summary: "What to send.", body: `## Pre-session note
- Why: two colleagues were recently phished — this protects you and our students.
- What: a quick 30-minute session, no prep needed.
- A short knowledge check at the end.` }],
  },
  "CA-001/3": {
    objective: "You will set up the room/call and test all the equipment beforehand.",
    whatToDo: ["Test AV, slides, and the poll tool.", "Have a backup plan for tech failure."],
    references: [{ id: "ca001-3", title: "Setup checklist", kind: "Checklist", summary: "Before staff arrive.", body: `## Test
- Slides display and advance.
- Audio/screen-share works on the call.
- The knowledge-check poll tool works.
- Attendance register ready.` }],
  },
  "CA-001/4": {
    objective: "You will deliver the 30-minute module, adapting the language for a non-technical audience.",
    whatToDo: ["Deliver the content with real examples.", "Use the recent phishing incident as the hook."],
    references: [{ id: "ca001-4", title: "Delivery tips", kind: "Briefing notes", summary: "How to land it.", body: `## Deliver
- Open with the real phishing incident (relatable).
- No jargon; concrete "what to do" for each topic.
- Invite questions — engagement beats lecturing.` }],
  },
  "CA-001/5": {
    objective: "You will administer the five-question knowledge check.",
    whatToDo: ["Run the check (poll or written).", "Make sure everyone present completes it."],
    references: [{ id: "ca001-5", title: "The knowledge check", kind: "Source document", group: "task", summary: "The questions + pass rule.", body: `## 5 questions
1. Suspicious email — what do you do? 2. Why never reuse your work password? 3. What is student personal data? 4. Where do you report an incident? 5. Public Wi-Fi without a VPN — the risk?

## Pass rule
Target ≥ 80% correct across attendees. Below → recommend a follow-up.` }],
  },
  "CA-001/6": {
    objective: "You will record attendance on the Training Attendance Register.",
    whatToDo: ["Record who attended and who didn't.", "Note absentees for follow-up."],
    references: [{ id: "ca001-6", title: "Attendance", kind: "Template", summary: "Why it's evidence.", body: `## Record
Attendance is the evidence the control operated (CIS 14 / ISO A.6.3). Capture attendees + absentees; absentees need a follow-up session.` }],
  },
  "CA-001/7": {
    objective: "You will score the knowledge-check results and calculate the pass rate.",
    whatToDo: ["Score the responses.", "Calculate the pass rate against the 80% target."],
    references: [{ id: "ca001-7", title: "Scoring", kind: "Standard rules", summary: "What to report.", body: `## Calculate
- % correct across all attendees.
- The weakest question (the topic to reinforce).

## Rule
Report the actual rate, not "it went well" — measurement is what makes it evidence.` }],
  },
  "CA-001/8": {
    objective: "You will produce a Training Completion Report with attendance, results, and follow-up recommendations.",
    whatToDo: ["Summarise attendance and pass rate.", "Recommend follow-up for absentees and the weakest topic."],
    references: [{ id: "ca001-8", title: "Completion report", kind: "Template", summary: "What to include.", body: `## Report
- Attendance % (and who missed it).
- Pass rate vs target.
- Weakest topic.
- Follow-up recommendation.

## Why
This report is the audit evidence that awareness training operated effectively.` }],
  },

  // ───────────── LRC-001 · Privacy Notice Review & Gap Assessment ─────────────
  "LRC-001/1": {
    objective: "You will obtain LearnTech's current published privacy notice.",
    whatToDo: ["Get the live website version.", "Read it once before assessing."],
    references: [{ id: "lrc001-1", title: "Current privacy notice", kind: "Source document", group: "task", summary: "The notice you're assessing — it's thin.", body: `## Current notice (published)
"LearnTech cares about your privacy. We collect some information to provide our services and may share it with partners. We keep your data secure. For questions, contact us. We may update this policy from time to time."

## First impression
Almost nothing required by law is actually here — the checklist (next step) will prove it.` }],
  },
  "LRC-001/2": {
    objective: "You will apply the 14-element gap-check (GDPR Articles 13/14) to the current notice.",
    whatToDo: ["Mark each of the 14 elements present / partial / absent.", "Be strict — vague mentions aren't 'present'."],
    references: [{ id: "lrc001-2", title: "14 mandatory elements", kind: "Standard extract", summary: "The checklist.", body: `## Must be present
1. Controller identity & contact. 2. DPO contact. 3. Purposes. 4. Lawful basis. 5. Legitimate interests. 6. Recipients. 7. International transfers + safeguards. 8. Retention. 9. Rights. 10. Withdraw consent. 11. Complain to ICO. 12. Statutory/contractual. 13. Automated decisions/profiling. 14. Source of data.

## Children's rule
Must be in clear, age-appropriate language (ICO Children's Code).` }],
  },
  "LRC-001/3": {
    objective: "You will note any elements that are present but unclear or written in non-plain language.",
    whatToDo: ["Flag vague or jargon-y wording.", "Note where children wouldn't understand it."],
    references: [{ id: "lrc001-3", title: "Clarity check", kind: "Standard rules", summary: "What 'unclear' means.", body: `## Flag
- "Partners" / "some information" — too vague to be valid.
- Legal jargon a 12-year-old couldn't follow.
- Anything that technically appears but doesn't actually inform.` }],
  },
  "LRC-001/4": {
    objective: "You will research one well-drafted privacy notice in the same sector as a model.",
    whatToDo: ["Study the example the mentor provides.", "Note how it handles children and plain language."],
    references: [{ id: "lrc001-4", title: "Model notice features", kind: "Source document", group: "task", summary: "What good looks like.", body: `## A good EdTech notice
- Names the controller + DPO.
- Lists each purpose with its lawful basis.
- Has a child-friendly summary alongside the full notice.
- States retention, rights, and the ICO complaint route.` }],
  },
  "LRC-001/5": {
    objective: "You will draft an improved privacy notice addressing every identified gap.",
    whatToDo: ["Write a notice covering all 14 elements.", "Include a child-friendly version."],
    references: [{ id: "lrc001-5", title: "Notice template", kind: "Template", summary: "Structure to follow.", body: `## Sections
Who we are + DPO · what we collect + why (purpose + lawful basis) · who we share with · transfers + safeguards · retention · your rights · how to complain · the child-friendly summary.

## Rule
Every one of the 14 elements must appear.` }],
  },
  "LRC-001/6": {
    objective: "You will ensure the draft uses plain language to a Grade-8 readability target.",
    whatToDo: ["Check readability against the target.", "Simplify anything too complex, especially for children."],
    references: [{ id: "lrc001-6", title: "Plain-language target", kind: "Standard rules", summary: "The bar to hit.", body: `## Target
Flesch-Kincaid Grade 8 or below. For the children's summary, simpler still.

## Why
The ICO Children's Code requires age-appropriate clarity — a legally-complete but unreadable notice still fails.` }],
  },
  "LRC-001/7": {
    objective: "You will submit the draft to the mentor and the Legal/DPO contact for review.",
    whatToDo: ["Send for review with the gap list attached.", "Address legal feedback."],
    references: [{ id: "lrc001-7", title: "Review", kind: "Checklist", summary: "Before sign-off.", body: `## Confirm
- All 14 elements present.
- Plain language target met.
- Child-friendly version included.
- Legal/DPO comments addressed.` }],
  },
  "LRC-001/8": {
    objective: "You will incorporate the review feedback and produce the final notice for DPO/Legal sign-off.",
    whatToDo: ["Apply changes and finalise.", "Record the sign-off."],
    references: [{ id: "lrc001-8", title: "Sign-off", kind: "Briefing notes", summary: "Closing it out.", body: `## Sign-off
DPO/Legal formally approve the notice before it's published. Record the decision and date — a privacy notice is a legal document, so its approval must be evidenced.` }],
  },

  // ───────────── KT-001 · GRC Onboarding Pack — New Joiner Reference Guide ─────────────
  "KT-001/1": {
    objective: "You will identify the top ten things every LearnTech new joiner must know about security and privacy.",
    whatToDo: ["List the ten most important, actionable items.", "Base them on real LearnTech facts, not theory."],
    references: [{ id: "kt001-1", title: "LearnTech essentials", kind: "Source document", group: "task", summary: "The facts a joiner needs.", body: `## Key facts
- Policies in Confluence under "GRC"; AUP + Data Protection are mandatory reading.
- Report incidents via #security and the IT Manager (DD-001).
- Student data is always Confidential.
- MFA mandatory; password manager provided.
- DPO = Head of Legal; GRC questions → Compliance Manager.
- Top threat: phishing impersonating school customers.` }],
  },
  "KT-001/2": {
    objective: "You will compile a four-page New Joiner GRC Reference Guide.",
    whatToDo: ["Cover policies, incident reporting, classification, acceptable use, phishing signs, contacts.", "Keep it to four pages."],
    references: [{ id: "kt001-2", title: "Guide sections", kind: "Template", summary: "What the guide contains.", body: `## Sections
1. Key policies + where to find them. 2. How to report an incident. 3. Data classification (with examples). 4. Acceptable use. 5. Top phishing signs. 6. Who to contact.

## Rule
Four pages max — a pack no one finishes protects no one.` }],
  },
  "KT-001/3": {
    objective: "You will create a day-by-day New Joiner GRC Checklist (Days 1, 7, 30).",
    whatToDo: ["List the GRC actions for the joiner and their manager at each milestone.", "Make each item a concrete action."],
    references: [{ id: "kt001-3", title: "Checklist content", kind: "Template", summary: "What goes at each day.", body: `## Example
- Day 1: set up MFA, read the AUP, know how to report an incident.
- Day 7: complete awareness training, understand data classification.
- Day 30: confirm access is appropriate to role.

## Rule
Each item is a verifiable action with an owner (joiner or manager).` }],
  },
  "KT-001/4": {
    objective: "You will develop a five-slide Day-1 Security Briefing for the manager to present.",
    whatToDo: ["Build five slides covering the must-knows.", "Make it deliverable by a non-specialist manager."],
    references: [{ id: "kt001-4", title: "Day-1 briefing", kind: "Template", summary: "Five slides.", body: `## Slides
1. Welcome + why security matters here (students). 2. How to report a problem. 3. Data classification. 4. Phishing signs. 5. Who to ask.

## Rule
A manager with no security background must be able to present it.` }],
  },
  "KT-001/5": {
    objective: "You will review all materials with the Security Awareness & Training Specialist mentor.",
    whatToDo: ["Share the pack.", "Address feedback on clarity and accuracy."],
    references: [{ id: "kt001-5", title: "Review checklist", kind: "Checklist", summary: "Before piloting.", body: `## Confirm
- Every item is a real, findable LearnTech fact.
- Four pages max.
- Actionable, not theoretical.
- A new joiner could act on it.` }],
  },
  "KT-001/6": {
    objective: "You will pilot the materials with one recent new joiner acting as a feedback reviewer.",
    whatToDo: ["Have a recent joiner read it and try to act on it.", "Capture what was unclear or missing."],
    references: [{ id: "kt001-6", title: "Pilot feedback", kind: "Checklist", summary: "What to test.", body: `## Ask the pilot
- Could you find the policies?
- Did you know how to report an incident?
- Anything confusing or missing?

## Why
A recent joiner spots gaps an expert misses.` }],
  },
  "KT-001/7": {
    objective: "You will incorporate the feedback and produce the final versions.",
    whatToDo: ["Apply the pilot feedback.", "Finalise the guide, checklist, and slides."],
    references: [{ id: "kt001-7", title: "Finalising", kind: "Checklist", summary: "Last checks.", body: `## Confirm
- Pilot's confusions fixed.
- All three artefacts consistent.
- Contacts and links correct.` }],
  },
  "KT-001/8": {
    objective: "You will hand the complete pack over to HR for the standard onboarding process.",
    whatToDo: ["Deliver the pack to HR.", "Explain how to use it for every new joiner."],
    references: [{ id: "kt001-8", title: "Handover", kind: "Briefing notes", summary: "Embedding it.", body: `## Handover
Give HR the guide, checklist, and slides, and agree they're issued to every new joiner on day one. A pack that isn't in the standard process gets forgotten.` }],
  },

  // ═════════════ GlobalConnect Customer Solutions · BPO & KPO (Call Centres) ═════════════
  // ───────────── AA-002 · CIS Controls v8 IG1 Gap Analysis ─────────────
  "AA-002/2.1": {
    objective: "You will work through the CIS IG1 worksheet so you know exactly which 56 safeguards you're assessing GlobalConnect against.",
    whatToDo: ["Read the IG1 safeguards and group them by Control.", "Note what evidence each safeguard needs."],
    references: [{ id: "aa002-2-1", title: "CIS IG1 overview", kind: "Standard extract", summary: "What IG1 covers.", body: `## IG1 — essential cyber hygiene (56 safeguards, 18 Controls)
Key groups: C1 Asset inventory · C2 Software · C4 Secure config · C5 Account mgmt · C6 Access/MFA · C7 Vulnerability mgmt · C8 Audit logs · C11 Data recovery · C14 Awareness.

## Per safeguard
You'll record Implemented / Partial / Not, with evidence.` }],
  },
  "AA-002/2.2": {
    objective: "You will schedule walkthroughs with IT and ops staff to gather the evidence for each safeguard.",
    whatToDo: ["Arrange short walkthroughs with the right people.", "Confirm a purpose (which safeguards) per session."],
    references: [{ id: "aa002-2-2", title: "Who to walk through with", kind: "Briefing notes", summary: "Whom to schedule.", body: `## Schedule
- IT lead → access, MFA, patching, logging.
- Ops manager → asset/device handling (BYOD), training.
- Each session has an agenda (the safeguards it covers).` }],
  },
  "AA-002/2.3": {
    objective: "You will record the current state of each safeguard with supporting evidence.",
    whatToDo: ["Mark each safeguard Implemented / Partial / Not.", "Cite the evidence (or note its absence)."],
    references: [{ id: "aa002-2-3", title: "GlobalConnect current state", kind: "Source document", group: "task", summary: "The facts to score against.", body: `## Walkthrough findings
- No central asset/software inventory; agents on BYOD.
- MFA on email, not on the customer CRM.
- Local admin common on agent machines.
- No vuln scanning/patch tracking.
- CRM backups run, never restore-tested.
- Awareness training only at induction.
- Logs exist but unreviewed.

## Rule
Score from this evidence — "Implemented" needs the artefact named.` }],
  },
  "AA-002/2.4": {
    objective: "You will calculate the compliance percentage per CIS Control group.",
    whatToDo: ["Compute implemented ÷ applicable safeguards per Control.", "Re-check the arithmetic."],
    references: [{ id: "aa002-2-4", title: "Scoring", kind: "Standard rules", summary: "How to compute.", body: `## Per Control
Compliance % = implemented ÷ applicable safeguards. Partial counts as half if you state the rule.

## Overall
Roll up to one figure (e.g. IG1 41%) — the headline management remembers.` }],
  },
  "AA-002/2.5": {
    objective: "You will prioritise the top five gaps by risk exposure.",
    whatToDo: ["Rank gaps by the risk each creates.", "Weight gaps on systems holding client data higher."],
    references: [{ id: "aa002-2-5", title: "Prioritisation", kind: "Standard rules", summary: "How to rank.", body: `## Rank by exposure
A missing safeguard on the CRM (client personal data) outranks one on the marketing site.

## Likely top gaps
No MFA on the CRM; local admin rights; no patch management; untested backups; BYOD with no controls.` }],
  },
  "AA-002/2.6": {
    objective: "You will draft remediation recommendations for each prioritised gap.",
    whatToDo: ["For each gap propose a specific fix, owner, and effort.", "Make recommendations concrete."],
    references: [{ id: "aa002-2-6", title: "Recommendation rules", kind: "Standard rules", summary: "What a good rec looks like.", body: `## Each recommendation
- The specific action (e.g. "enforce MFA on the CRM").
- The owner (a role).
- Rough effort/cost.

## Rule
"Improve access control" is not a recommendation; "enable MFA on the CRM for all 120 agents" is.` }],
  },
  "AA-002/2.7": {
    objective: "You will validate your findings with the Compliance Manager mentor before reporting.",
    whatToDo: ["Share findings with a cover note.", "Correct anything the mentor flags."],
    references: [{ id: "aa002-2-7", title: "Validation checklist", kind: "Checklist", summary: "Before the report.", body: `## Confirm
- Each safeguard scored with evidence.
- Percentages correct.
- Top-five gaps ranked by exposure.
- Recommendations have owners.` }],
  },
  "AA-002/2.8": {
    objective: "You will compile the Gap Analysis Report and present it to management.",
    whatToDo: ["Write the report: scores, gaps, recommendations, executive summary.", "Present the headline and the asks."],
    references: [{ id: "aa002-2-8", title: "Report structure", kind: "Template", summary: "What it contains.", body: `## Report
- Executive summary (the headline %).
- Compliance per Control group.
- Top-five gaps + remediation.
- Recommended next steps.

## Present
Lead with the overall figure and the client-data risks.` }],
  },

  // ───────────── GRM-002 · Information Security Policy Drafting ─────────────
  "GRM-002/5.1": {
    objective: "You will review two existing GlobalConnect policies to learn the house style before drafting.",
    whatToDo: ["Read two policies for tone, structure, and referencing.", "Note the document-control conventions."],
    references: [{ id: "grm002-5-1", title: "House style", kind: "Source document", group: "task", summary: "The conventions to match.", body: `## Existing style
- Numbered statements ("3.1 Staff must…").
- A control block: owner, version, approval & review dates.
- Plain, directive language; ISO references in a side column.

## Rule
Your policy must fit this style or it won't pass review.` }],
  },
  "GRM-002/5.2": {
    objective: "You will select the policy type to draft (AUP or Remote Working) with the mentor.",
    whatToDo: ["Pick the policy that addresses GlobalConnect's biggest real risk.", "Confirm the scope."],
    references: [{ id: "grm002-5-2", title: "The real risks to govern", kind: "Source document", group: "task", summary: "What the policy must address.", body: `## GlobalConnect reality
- Agents work home + office on a mix of devices (BYOD).
- They handle clients' customer data on screen.
- Shared workstations; tailgating happens.
- Staff use WhatsApp for shift coordination (shadow IT).

## Pick
A Remote Working or Acceptable Use policy that actually addresses these — not a generic template.` }],
  },
  "GRM-002/5.3": {
    objective: "You will draft the policy body to the template.",
    whatToDo: ["Write purpose, scope, roles, statements, exceptions, review cycle.", "Make statements address the real risks."],
    references: [{ id: "grm002-5-3", title: "Policy template", kind: "Template", summary: "The sections.", body: `## Sections
Purpose · scope · roles & responsibilities · policy statements · exceptions process · review cycle · control block.

## Rule
Statements must address BYOD, shared screens, and shadow IT — the specific risks, not platitudes.` }],
  },
  "GRM-002/5.4": {
    objective: "You will map each policy statement to a specific ISO 27001 Annex A control.",
    whatToDo: ["Map every statement to a control.", "Flag any statement with no control (likely redundant)."],
    references: [{ id: "grm002-5-4", title: "Statement → control mapping", kind: "Standard extract", summary: "The likely controls.", body: `## Likely mappings
A.5.10 Acceptable use · A.6.7 Remote working · A.8.1 Endpoint devices · A.5.14 Information transfer · A.8.5 Secure authentication.

## Rule
A statement that maps to no control is either redundant or you've missed the control it implements.` }],
  },
  "GRM-002/5.5": {
    objective: "You will circulate the draft for review to IT, HR, and Legal.",
    whatToDo: ["Send with the comment sheet.", "Collect and log all feedback."],
    references: [{ id: "grm002-5-5", title: "Review circulation", kind: "Checklist", summary: "Who reviews and why.", body: `## Reviewers
- IT Manager (feasibility).
- HR (people implications, disciplinary link).
- Legal (enforceability).

## Capture
Use the comment sheet so every comment is tracked and resolved.` }],
  },
  "GRM-002/5.6": {
    objective: "You will incorporate the review feedback and track the changes.",
    whatToDo: ["Apply feedback with tracked changes.", "Resolve every comment."],
    references: [{ id: "grm002-5-6", title: "Incorporating feedback", kind: "Checklist", summary: "How to do it cleanly.", body: `## Rules
- Track changes so reviewers see what moved.
- Every comment resolved or explicitly declined with a reason.
- Re-check the ISO mappings still hold.` }],
  },
  "GRM-002/5.7": {
    objective: "You will submit the policy for management approval.",
    whatToDo: ["Submit on the approval form.", "Capture the approval and date."],
    references: [{ id: "grm002-5-7", title: "Approval", kind: "Standard rules", summary: "Why it matters.", body: `## Approval
A policy has no authority until management approves it. Use the sign-off form; record the approver, decision, and date. The control block is updated to "approved".` }],
  },
  "GRM-002/5.8": {
    objective: "You will register the approved policy and set its next review date.",
    whatToDo: ["Add it to the Policy Register.", "Set a review date (e.g. annual)."],
    references: [{ id: "grm002-5-8", title: "Registering", kind: "Briefing notes", summary: "Keeping it controlled.", body: `## Register
Add the approved policy (version, owner, approval date) to the Policy Register and set the next review. An unregistered policy isn't a controlled document (ISO A.5.1/A.5.37).` }],
  },

  // ───────────── GRM-003 · GRC Maturity Assessment — Departmental ─────────────
  "GRM-003/6.1": {
    objective: "You will familiarise yourself with the NIST CSF 2.0 tier definitions before assessing.",
    whatToDo: ["Learn the four tiers and six functions.", "Be clear what evidence each tier needs."],
    references: [{ id: "grm003-6-1", title: "CSF tiers", kind: "Standard extract", summary: "The 1–4 scale.", body: `## Tiers
1 Partial (ad hoc) · 2 Risk-Informed (aware, not org-wide) · 3 Repeatable (formal, consistent) · 4 Adaptive (continuous improvement).

## Functions
Govern · Identify · Protect · Detect · Respond · Recover.

## Rule
A tier score needs evidence, not impression.` }],
  },
  "GRM-003/6.2": {
    objective: "You will adapt the maturity questionnaire to the department's context.",
    whatToDo: ["Tailor 10–15 questions per CSF function to the department.", "Make questions evidence-seeking, not yes/no."],
    references: [{ id: "grm003-6-2", title: "Questionnaire design", kind: "Template", summary: "How to write the questions.", body: `## Per function
Ask for evidence: "How do you decide what to patch first, and where's that documented?" not "Do you patch?"

## Rule
Tailor to the department's reality — generic questions get generic, unscorable answers.` }],
  },
  "GRM-003/6.3": {
    objective: "You will request maturity evidence from the department head and IT lead to score each CSF function.",
    whatToDo: ["Address the request to the department head and IT lead.", "Ask for evidence against each CSF function (Govern/Identify/Protect/Detect/Respond/Recover).", "Ask for specifics, not opinions."],
    references: [{ id: "grm003-6-3", title: "Department current state", kind: "Source document", group: "task", summary: "What the responses reveal (and score).", body: `## Operations dept
- Govern: no documented risk appetite → Tier 1.
- Identify: partial asset list, no risk register → Tier 1/2.
- Protect: MFA on email, induction-only training → Tier 2.
- Detect: logs unmonitored → Tier 1.
- Respond: no procedure → Tier 1.
- Recover: backups untested → Tier 1.` }],
  },
  "GRM-003/6.4": {
    objective: "You will score each CSF function on the 1–4 scale with justification.",
    whatToDo: ["Assign a tier per function.", "Justify each score with interview evidence."],
    references: [{ id: "grm003-6-4", title: "Scoring rules", kind: "Standard rules", summary: "How to score defensibly.", body: `## Rule
Each score cites evidence: "Detect = Tier 1 — logs exist but no one reviews them (confirmed in interview)." A score without justification isn't defensible.` }],
  },
  "GRM-003/6.5": {
    objective: "You will plot current vs target state on the CSF spider diagram.",
    whatToDo: ["Plot the six function scores.", "Add a realistic target (e.g. Tier 2 minimum)."],
    references: [{ id: "grm003-6-5", title: "Spider diagram", kind: "Template", summary: "What it shows.", body: `## The diagram
Six axes (the functions), current score plotted, target overlaid. The gap between the two lines is the visual story for management.` }],
  },
  "GRM-003/6.6": {
    objective: "You will identify the three most critical gaps to reach at least Tier 2.",
    whatToDo: ["Pick the three functions furthest below Tier 2.", "Name the exposure each creates."],
    references: [{ id: "grm003-6-6", title: "Gap selection", kind: "Standard rules", summary: "Which gaps to pick.", body: `## Likely top gaps
Detect (no monitoring), Respond (no procedure), Recover (untested backups) — all Tier 1, all high-exposure for a call centre handling client data.` }],
  },
  "GRM-003/6.7": {
    objective: "You will draft a one-page improvement roadmap for the top three gaps.",
    whatToDo: ["For each gap, state the action, owner, and target tier.", "Sequence the quick wins first."],
    references: [{ id: "grm003-6-7", title: "Roadmap rules", kind: "Template", summary: "What each item needs.", body: `## Per item
Gap · action to close it · owner · target tier · rough timeline.

## Rule
A roadmap item with no owner or target is a wish, not a plan.` }],
  },
  "GRM-003/6.8": {
    objective: "You will present findings to the department head and refine based on feedback.",
    whatToDo: ["Present the spider diagram and the top-three gaps.", "Capture agreement and adjust."],
    references: [{ id: "grm003-6-8", title: "Presenting maturity", kind: "Briefing notes", summary: "How to land it.", body: `## Present
- The spider diagram (current vs Tier 2).
- The three gaps and what closing them takes.
- Frame as a starting point, not a judgement — buy-in matters.` }],
  },

  // ───────────── DD-002 · Security Awareness Training Content Development ─────────────
  "DD-002/1": {
    objective: "You will review existing materials so the new module doesn't duplicate or contradict them.",
    whatToDo: ["Read the current onboarding/security guidance.", "Note gaps and the real incident history."],
    references: [{ id: "dd002-1", title: "Why these topics", kind: "Source document", group: "task", summary: "The incident data behind the content.", body: `## Last 6 months
- 4 phishing emails clicked (one credential theft).
- 3 password-reuse cases found.
- 2 agents emailed client customer lists to personal accounts.

## Audience
High-turnover, non-technical agents — content must be concrete and scenario-based.` }],
  },
  "DD-002/2": {
    objective: "You will define three learning objectives, one per topic (phishing, passwords, data handling).",
    whatToDo: ["Write one observable objective per topic.", "Start each with an action verb."],
    references: [{ id: "dd002-2", title: "Learning objectives", kind: "Template", summary: "How to write them.", body: `## Good objective
"After this module you will be able to identify three signs of a phishing email." (observable, action verb) — not "understand phishing".` }],
  },
  "DD-002/3": {
    objective: "You will draft the module content outline (10 minutes per topic).",
    whatToDo: ["Outline each topic to its objective.", "Build in real examples from the incident history."],
    references: [{ id: "dd002-3", title: "Outline template", kind: "Template", summary: "Structure per topic.", body: `## Per topic (10 min)
- The risk (with a real GlobalConnect example).
- What to do / not do.
- A quick check of understanding.

## Rule
Tie every topic to a real incident — it changes behaviour, theory doesn't.` }],
  },
  "DD-002/4": {
    objective: "You will develop the slide content (10–12 slides).",
    whatToDo: ["Build slides to the outline.", "Keep them visual and concrete."],
    references: [{ id: "dd002-4", title: "Slide rules", kind: "Template", summary: "How to build them.", body: `## Rules
- 10–12 slides total, not per topic.
- One idea per slide, minimal text.
- Show a real phishing email as an example.` }],
  },
  "DD-002/5": {
    objective: "You will write a five-question knowledge check aligned to the objectives.",
    whatToDo: ["One question per objective + two scenarios.", "One clearly correct answer each."],
    references: [{ id: "dd002-5", title: "Knowledge check", kind: "Template", summary: "How to align it.", body: `## Rules
- Each question maps to a stated objective.
- Multiple choice, plausible distractors, one correct.
- If a question maps to no objective, fix one of them.` }],
  },
  "DD-002/6": {
    objective: "You will develop a one-page Facilitator Guide for whoever delivers the training.",
    whatToDo: ["Write delivery notes per slide.", "Make it usable by a non-specialist."],
    references: [{ id: "dd002-6", title: "Facilitator guide", kind: "Template", summary: "What it contains.", body: `## Per slide
- The key point to make.
- The example to use.
- A prompt question for the room.

## Rule
A manager with no security background must be able to deliver it from this guide.` }],
  },
  "DD-002/7": {
    objective: "You will pilot the module with two colleagues and collect feedback.",
    whatToDo: ["Run a pilot.", "Capture what was unclear or too long."],
    references: [{ id: "dd002-7", title: "Pilot feedback", kind: "Checklist", summary: "What to test.", body: `## Ask the pilots
- Was anything confusing?
- Did the examples land?
- Was the length right (30 min)?
- Did the knowledge check make sense?` }],
  },
  "DD-002/8": {
    objective: "You will revise and finalise all the materials.",
    whatToDo: ["Apply pilot feedback.", "Finalise slides, check, and facilitator guide."],
    references: [{ id: "dd002-8", title: "Finalising", kind: "Checklist", summary: "Last checks.", body: `## Confirm
- Objectives, content, and check all aligned.
- Real examples included.
- Facilitator guide complete.
- 30-minute runtime.` }],
  },

  // ───────────── IE-001 · CIS IG1 Remediation — Implementation Tracking ─────────────
  "IE-001/1": {
    objective: "You will select five IG1 safeguards to implement, with the Compliance and IT managers.",
    whatToDo: ["Pick five high-impact, feasible safeguards.", "Confirm what 'done' means for each."],
    references: [{ id: "ie001-1", title: "Five safeguards", kind: "Source document", group: "task", summary: "The safeguards + acceptance criteria.", body: `## Selected (from AA-002)
1. 6.3 MFA on the CRM. 2. 5.3 Disable dormant accounts (>45d). 3. 4.1 Secure laptop baseline. 4. 1.1 Asset inventory. 5. 14.1 Awareness programme.

## Rule
"Done" = the acceptance criterion met + evidence, not "started".` }],
  },
  "IE-001/2": {
    objective: "You will create an Implementation Task Card for each safeguard.",
    whatToDo: ["Specify what, who, tools, acceptance criteria, evidence.", "Make each card actionable by IT."],
    references: [{ id: "ie001-2", title: "Task card fields", kind: "Template", summary: "Per-safeguard card.", body: `## Card
What must be done · owner (IT) · tools/systems · acceptance criteria · evidence required.

## Example
6.3 MFA on CRM → owner: IT lead → enforce MFA policy → evidence: policy screenshot + 100% enrolled.` }],
  },
  "IE-001/3": {
    objective: "You will track implementation progress weekly.",
    whatToDo: ["Update each card's status weekly.", "Flag blockers early."],
    references: [{ id: "ie001-3", title: "Tracker", kind: "Template", summary: "How to track.", body: `## Tracker
Per safeguard: status (Not started / In progress / Done) · % complete · blockers · next action. Update weekly so slippage is visible.` }],
  },
  "IE-001/4": {
    objective: "You will collect evidence for each completed safeguard.",
    whatToDo: ["Gather screenshots, exports, or documents per safeguard.", "File them in the evidence repository."],
    references: [{ id: "ie001-4", title: "Evidence rules", kind: "Standard rules", summary: "What counts.", body: `## Evidence
- MFA → policy screenshot + enrolment export.
- Dormant accounts → the disabled-accounts list.
- Baseline → the documented config + applied-device list.

## Rule
No evidence = not done, regardless of what the owner says.` }],
  },
  "IE-001/5": {
    objective: "You will verify each implementation against its acceptance criteria — pass or fail.",
    whatToDo: ["Independently check evidence vs criteria.", "Record pass/fail honestly."],
    references: [{ id: "ie001-5", title: "Verification", kind: "Testing rules", summary: "How to verify.", body: `## Verify
Check the evidence meets the acceptance criterion. "MFA enrolled for 100%" but the export shows 85% = fail. Don't pass on the owner's say-so.` }],
  },
  "IE-001/6": {
    objective: "You will raise a Remediation Issue for any implementation that fails verification.",
    whatToDo: ["Log a clear issue for each failure.", "Assign it back with a target date."],
    references: [{ id: "ie001-6", title: "Remediation issue", kind: "Template", summary: "What to log.", body: `## Issue
The safeguard · what failed (criterion not met) · the gap · owner · target date.

## Rule
A failure with no logged issue and owner just gets forgotten.` }],
  },
  "IE-001/7": {
    objective: "You will update the CIS Gap Analysis (AA-002) to reflect the newly implemented controls.",
    whatToDo: ["Re-score the implemented safeguards.", "Recalculate the compliance %."],
    references: [{ id: "ie001-7", title: "Updating the baseline", kind: "Standard rules", summary: "Show the progress.", body: `## Update
Move the verified safeguards to Implemented and recompute the % (e.g. IG1 41% → 50%). Only count verified ones — not "in progress".` }],
  },
  "IE-001/8": {
    objective: "You will prepare an Implementation Progress Report for the IT Manager.",
    whatToDo: ["Summarise what's done, what failed, and the new compliance %.", "Name the next actions."],
    references: [{ id: "ie001-8", title: "Progress report", kind: "Template", summary: "What it shows.", body: `## Report
- Safeguards done vs planned.
- Verification pass/fail.
- New compliance % (before → after).
- Open remediation issues + dates.` }],
  },

  // ───────────── IE-002 · Policy Roll-Out — Document Control Setup ─────────────
  "IE-002/1": {
    objective: "You will audit the current state of GlobalConnect's document storage.",
    whatToDo: ["Find where documents live and how they're named/versioned.", "Document the specific problems."],
    references: [{ id: "ie002-1", title: "Current storage audit", kind: "Source document", group: "task", summary: "The mess to fix.", body: `## Found
- Policies in three places (shared drive, email, a laptop).
- Multiple "Security Policy" versions; unclear which is current.
- Files named "policy_final_v2_FINAL.docx".
- No owners, no review dates; some 4 years old.
- Everyone can edit everything.` }],
  },
  "IE-002/2": {
    objective: "You will define the Document Control Policy.",
    whatToDo: ["Set the versioning scheme, naming, location, access, and review frequency.", "Solve each problem from the audit."],
    references: [{ id: "ie002-2", title: "Document control standard", kind: "Template", summary: "What to define.", body: `## Define
- Versioning (v1.0 approved, v1.1 minor, v0.x draft).
- Naming (ISMS-POL-AccUse-v1.0).
- Single location + access rights.
- Review frequency (annual).

## Rule
The policy must explicitly fix each audit problem.` }],
  },
  "IE-002/3": {
    objective: "You will create the Document Register — the master index of all GRC documents.",
    whatToDo: ["List every policy/procedure with version, status, owner, review date.", "Mark the current version of each."],
    references: [{ id: "ie002-3", title: "Document register", kind: "Template", summary: "The fields.", body: `## Per document
Title · version · status (draft/approved) · owner · approval date · review date.

## Why
The register is the single source of truth for what's current — it's also the ISO evidence that documents are controlled.` }],
  },
  "IE-002/4": {
    objective: "You will implement the folder structure on the shared drive.",
    whatToDo: ["Build the agreed folder structure.", "Set the access rights (read vs edit)."],
    references: [{ id: "ie002-4", title: "Folder structure", kind: "Template", summary: "How to set it up.", body: `## Structure
Logical folders (Policies, Procedures, Evidence, Drafts) with access: most staff read-only, owners edit. Fix the "everyone can edit" problem.` }],
  },
  "IE-002/5": {
    objective: "You will migrate the existing documents into the new structure with correct naming.",
    whatToDo: ["Move each document, applying the naming convention.", "Archive superseded versions."],
    references: [{ id: "ie002-5", title: "Migration rules", kind: "Standard rules", summary: "How to migrate cleanly.", body: `## Migrate
- Rename to the convention.
- Keep one current version; archive the rest clearly.
- Update the register as you go.` }],
  },
  "IE-002/6": {
    objective: "You will train the document owners on the version-control process.",
    whatToDo: ["Run a 15-minute walkthrough.", "Show how to version, name, and review."],
    references: [{ id: "ie002-6", title: "Owner training", kind: "Briefing notes", summary: "What to cover.", body: `## Walkthrough
- How to create a new version.
- The naming convention.
- Where things live and who can edit.
- When to review.` }],
  },
  "IE-002/7": {
    objective: "You will publish the Document Control Policy and brief all GRC stakeholders.",
    whatToDo: ["Publish the approved policy.", "Brief stakeholders on the new way of working."],
    references: [{ id: "ie002-7", title: "Roll-out", kind: "Briefing notes", summary: "Announcing it.", body: `## Brief
Tell stakeholders: documents now live in one place, here's how to find the current version, here's how to make changes. A control process no one knows about won't be followed.` }],
  },
  "IE-002/8": {
    objective: "You will set calendar reminders for all policy review dates.",
    whatToDo: ["Create recurring reminders per document.", "Assign each to its owner."],
    references: [{ id: "ie002-8", title: "Review reminders", kind: "Briefing notes", summary: "Keeping it alive.", body: `## Reminders
Set a calendar reminder for each document's review date, owned by its owner. Document control fails when reviews lapse — automate the prompt.` }],
  },

  // ───────────── MM-001 · GRC KPI Definition & Metrics Tracking ─────────────
  "MM-001/1": {
    objective: "You will identify five measurable GRC indicators from GlobalConnect's current status.",
    whatToDo: ["Pick five KPIs that are measurable and meaningful.", "Avoid vanity metrics."],
    references: [{ id: "mm001-1", title: "Candidate KPIs", kind: "Source document", group: "task", summary: "The indicators + targets.", body: `## Five KPIs (month-1 data)
1. % staff trained — 68% (target ≥95%). 2. % policies reviewed in 12m — 40% (≥90%). 3. Open risk items — 14 (<10). 4. % systems patched — 72% (≥90%). 5. Mean time to close findings — 38d (<30d).

## Rule
A KPI needs a data source and a target — or it's an opinion.` }],
  },
  "MM-001/2": {
    objective: "You will complete a KPI Definition Card for each KPI.",
    whatToDo: ["Define formula, source, frequency, owner, target, RAG thresholds.", "Make the formula unambiguous."],
    references: [{ id: "mm001-2", title: "KPI card", kind: "Template", summary: "The fields.", body: `## Per KPI
Name · formula · data source · frequency · owner · target · RAG thresholds (Green=target, Amber=within 10%, Red=worse).` }],
  },
  "MM-001/3": {
    objective: "You will build the Monthly GRC Metrics Tracking Spreadsheet with auto-RAG colouring.",
    whatToDo: ["Build the tracker from the cards.", "Set up the RAG conditional formatting."],
    references: [{ id: "mm001-3", title: "Tracker build", kind: "Template", summary: "How to structure it.", body: `## Tracker
A row per KPI, columns per month, auto-RAG against the thresholds. Should update with new data and recolour automatically.` }],
  },
  "MM-001/4": {
    objective: "You will collect the first month's data by requesting inputs from IT and HR.",
    whatToDo: ["Request each KPI's source data.", "Verify the numbers before using them."],
    references: [{ id: "mm001-4", title: "Data collection", kind: "Briefing notes", summary: "Who provides what.", body: `## Sources
- Training % → HR.
- Patching % → IT.
- Open risks → the risk register.
- Findings closure → audit log.

## Rule
Verify each figure against its source — a wrong number colours the wrong RAG.` }],
  },
  "MM-001/5": {
    objective: "You will populate the tracker and generate the Month 1 report.",
    whatToDo: ["Enter the data; let the RAG compute.", "Generate the month-1 snapshot."],
    references: [{ id: "mm001-5", title: "Month 1 report", kind: "Template", summary: "What it shows.", body: `## Report
The five KPIs, their values, RAG status, and trend (n/a in month 1). Three likely Reds: training, policy review, patching.` }],
  },
  "MM-001/6": {
    objective: "You will draft a three-sentence management commentary interpreting the RAG status.",
    whatToDo: ["Write three sentences: where we are, the worst gap, the action.", "No jargon."],
    references: [{ id: "mm001-6", title: "Commentary rules", kind: "Standard rules", summary: "How to interpret RAG.", body: `## Three sentences
1. Overall position. 2. The most important Red and why it matters. 3. The action being taken.

## Rule
Numbers without interpretation don't help managers decide.` }],
  },
  "MM-001/7": {
    objective: "You will present the metrics and commentary to the Compliance Manager mentor for review.",
    whatToDo: ["Walk through the tracker and commentary.", "Address feedback."],
    references: [{ id: "mm001-7", title: "Review checklist", kind: "Checklist", summary: "Before going live.", body: `## Confirm
- Each KPI has a source and target.
- RAG thresholds are objective.
- Commentary interprets, doesn't just restate.` }],
  },
  "MM-001/8": {
    objective: "You will schedule recurring monthly data-collection invites with each data owner.",
    whatToDo: ["Set a recurring invite per data owner.", "Make ongoing collection effortless."],
    references: [{ id: "mm001-8", title: "Sustaining it", kind: "Briefing notes", summary: "Keeping it monthly.", body: `## Schedule
A recurring monthly reminder to each owner (HR, IT, risk) to submit their figure by a set date. KPIs die when collection is ad hoc — automate the prompt.` }],
  },

  // ───────────── CA-003 · Stakeholder Interview — GRC Needs Discovery ─────────────
  "CA-003/1": {
    objective: "You will prepare a structured Interview Guide for the needs-discovery interviews.",
    whatToDo: ["Write 8–10 open questions per stakeholder type.", "Make them surface real concerns, not yes/no."],
    references: [{ id: "ca003-1", title: "Interview guide design", kind: "Template", summary: "How to write the questions.", body: `## Open questions
"What worries you most about how we handle client data today?" — not "Are we secure?".

## Per stakeholder type
Tailor to their angle (ops wants practicality; account lead wants to keep the contract).` }],
  },
  "CA-003/2": {
    objective: "You will brief each stakeholder in advance on the purpose and duration.",
    whatToDo: ["Send a short brief before each interview.", "Set expectations (30 minutes, honest input)."],
    references: [{ id: "ca003-2", title: "The three interviewees", kind: "Source document", group: "task", summary: "Who they are.", body: `## Stakeholders
- Operations Manager — wants practical rules, not paperwork.
- Client Account Lead — clients demand ISO/SOC 2; fears losing deals.
- IT Lead — overstretched; fears controls slow agents down.

## Note
Their priorities conflict — that tension is the real finding.` }],
  },
  "CA-003/3": {
    objective: "You will request input from the three stakeholders and capture their responses.",
    whatToDo: ["Send the request to each of the three stakeholders.", "Ask for concrete examples and specifics, not generalities.", "Capture their responses in their own words."],
    references: [{ id: "ca003-3", title: "Getting good responses", kind: "Briefing notes", summary: "How to get signal.", body: `## When you request
- Ask open questions and capture the answers verbatim.
- Probe for examples: "Can you give a specific instance?"
- Record their words (quote them) and specific incidents.` }],
  },
  "CA-003/4": {
    objective: "You will write up a Stakeholder Interview Summary within 24 hours of each.",
    whatToDo: ["Summarise each interview while fresh.", "Capture concerns, examples, and what 'good' looks like to them."],
    references: [{ id: "ca003-4", title: "Summary structure", kind: "Template", summary: "Per interview.", body: `## Capture
- The concern (their words).
- A specific example they gave.
- What they think good looks like.
- What they fear about change.

## Rule
Write within 24 hours — detail fades.` }],
  },
  "CA-003/5": {
    objective: "You will identify the themes across all three interviews.",
    whatToDo: ["Group recurring concerns and conflicts.", "Surface the tension between control and speed."],
    references: [{ id: "ca003-5", title: "Theme analysis", kind: "Standard rules", summary: "How to synthesise.", body: `## Themes
Group across the three: common concerns, knowledge gaps, conflicting priorities.

## The key theme here
"More control" (account lead) vs "don't slow us down" (IT/ops) — naming this tension is the deliverable's value.` }],
  },
  "CA-003/6": {
    objective: "You will compile a Stakeholder Needs Discovery Report.",
    whatToDo: ["Summarise the themes, key quotes, and implications for the GRC programme.", "Make it decision-useful."],
    references: [{ id: "ca003-6", title: "Report structure", kind: "Template", summary: "What it contains.", body: `## Report
- Themes (not a transcript).
- Key quotes as evidence.
- Implications for the GRC programme (what to prioritise given the tension).` }],
  },
  "CA-003/7": {
    objective: "You will review the findings with the Policy & Governance Analyst mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "ca003-7", title: "Review checklist", kind: "Checklist", summary: "Before feeding in.", body: `## Confirm
- Themes (not raw notes) are the output.
- Quotes support each theme.
- The control-vs-speed tension is surfaced.` }],
  },
  "CA-003/8": {
    objective: "You will feed the insights into the Stakeholder Register (SPA-002) and GRC Roadmap (SPA-001).",
    whatToDo: ["Update the register with what you learned.", "Reflect the priorities in the roadmap."],
    references: [{ id: "ca003-8", title: "Feeding insights forward", kind: "Briefing notes", summary: "Closing the loop.", body: `## Update
- Register: refine each stakeholder's interest/influence from what they said.
- Roadmap: re-prioritise based on the real needs (e.g. practical controls that don't kill handle time).` }],
  },

  // ───────────── BCRP-001 · Business Impact Analysis — Single Department ─────────────
  "BCRP-001/1": {
    objective: "You will select the department for the BIA, with the Business Continuity mentor.",
    whatToDo: ["Pick the department whose downtime hurts most.", "Confirm its scope."],
    references: [{ id: "bcrp001-1", title: "The department", kind: "Source document", group: "task", summary: "Which to pick and why.", body: `## Recommended: Customer Operations
Agents answer calls/chats for three client brands, 24/7, under SLAs with penalties. Its downtime has direct financial impact — the most instructive BIA.` }],
  },
  "BCRP-001/2": {
    objective: "You will conduct a 60-minute BIA interview with the department manager.",
    whatToDo: ["Use the BIA questionnaire.", "Capture functions, dependencies, and impacts."],
    references: [{ id: "bcrp001-2", title: "BIA interview facts", kind: "Source document", group: "task", summary: "What you'll learn.", body: `## Customer Operations
- Live call/chat → depends on telephony (Genesys) + CRM + internet.
- SLA reporting → depends on CRM data + reporting tool.
- Each contract has penalties for downtime > 2 hours.
- Telephony down: ~£4k/hour + reputational damage.
- CRM data >1h stale → mis-routing + compliance issues.` }],
  },
  "BCRP-001/3": {
    objective: "You will identify the department's top five critical functions and their dependencies.",
    whatToDo: ["List the critical functions.", "For each, capture the people/systems/data it needs and the impact if it's down."],
    references: [{ id: "bcrp001-3", title: "Function/dependency mapping", kind: "Template", summary: "What to capture.", body: `## Per function
Function · depends on (people/systems/data) · impact if unavailable (financial/operational/reputational).

## Rule
The dependency chain is what DR/BC plans protect — capture it precisely.` }],
  },
  "BCRP-001/4": {
    objective: "You will define the RTO and RPO for each critical function.",
    whatToDo: ["Set RTO from when impact becomes unacceptable.", "Set RPO from how stale data can be."],
    references: [{ id: "bcrp001-4", title: "RTO/RPO rules", kind: "Standard extract", summary: "How to set them.", body: `## Drive from impact
- Telephony: SLA penalty at 2h → RTO < 2h.
- CRM: data >1h stale causes harm → RPO ≤ 1h.

## Rule
RTO/RPO come from business impact, not from what IT finds convenient.` }],
  },
  "BCRP-001/5": {
    objective: "You will identify single points of failure and workarounds for each function.",
    whatToDo: ["Find where one failure stops a function.", "Note any manual/alternative workaround."],
    references: [{ id: "bcrp001-5", title: "SPOF analysis", kind: "Standard rules", summary: "What to look for.", body: `## Single points of failure
- One telephony provider with no failover.
- One internet line at the main site.
- One person who knows the SLA reporting process.

## Rule
A SPOF with no workaround is the highest-priority resilience gap.` }],
  },
  "BCRP-001/6": {
    objective: "You will complete the BIA Summary Table and rank functions by impact.",
    whatToDo: ["Fill the table with functions, RTO/RPO, SPOFs, impact scores.", "Rank by impact."],
    references: [{ id: "bcrp001-6", title: "BIA summary table", kind: "Template", summary: "The fields.", body: `## Per function
Function · RTO · RPO · dependencies · SPOFs · impact score (financial + operational + reputational).

## Rank
Telephony top (highest financial + SLA impact).` }],
  },
  "BCRP-001/7": {
    objective: "You will draft the BIA Report.",
    whatToDo: ["Write methodology, findings, RTO/RPO table, SPOFs, recommendations.", "Recommend continuity measures for the top risks."],
    references: [{ id: "bcrp001-7", title: "BIA report structure", kind: "Template", summary: "What it contains.", body: `## Report
- Methodology + scope.
- Critical functions + dependencies.
- RTO/RPO table.
- SPOFs.
- Recommended continuity measures (e.g. telephony failover).` }],
  },
  "BCRP-001/8": {
    objective: "You will review the report with the mentor and present to the department manager.",
    whatToDo: ["Review with the mentor.", "Present the top risks and recovery objectives to the manager."],
    references: [{ id: "bcrp001-8", title: "Presenting the BIA", kind: "Briefing notes", summary: "What to land.", body: `## Present
- The critical functions and their RTO/RPO.
- The SPOFs (especially telephony).
- The recommended measures and their cost vs the £4k/hour exposure.` }],
  },

  // ───────────── TPRM-002 · Vendor Due-Diligence Questionnaire ─────────────
  "TPRM-002/1": {
    objective: "You will select one Medium-risk vendor from the supplier register to assess in depth.",
    whatToDo: ["Pick a Medium-risk vendor worth deeper review.", "Confirm its service and data access."],
    references: [{ id: "tprm002-1", title: "Vendor selection", kind: "Source document", group: "task", summary: "The vendor in focus.", body: `## Vendor: DataDial Ltd
A Medium-risk vendor that processes some client customer data. Worth a deeper questionnaire because of the data access.` }],
  },
  "TPRM-002/2": {
    objective: "You will customise the standard security questionnaire for the vendor's service type.",
    whatToDo: ["Tailor the 20–25 questions to what this vendor does.", "Focus questions on its actual data access."],
    references: [{ id: "tprm002-2", title: "Questionnaire areas", kind: "Template", summary: "What to cover.", body: `## Cover
Encryption · certifications · sub-processors · incident response · data location/transfers · staff screening · access control.

## Rule
Tailor to the vendor — generic questions get generic answers.` }],
  },
  "TPRM-002/3": {
    objective: "You will send the questionnaire to the vendor with a response deadline.",
    whatToDo: ["Send to the vendor's security/compliance contact.", "Set a two-week deadline."],
    references: [{ id: "tprm002-3", title: "Sending it", kind: "Briefing notes", summary: "How to send.", body: `## Send
- To a named security/compliance contact, not a generic inbox.
- A clear two-week deadline.
- Note that vague answers will be followed up.` }],
  },
  "TPRM-002/4": {
    objective: "You will review the returned responses for completeness and credibility.",
    whatToDo: ["Rate each answer satisfactory/partial/unsatisfactory.", "Spot the weak and unsupported claims."],
    references: [{ id: "tprm002-4", title: "DataDial responses", kind: "Source document", group: "task", summary: "The actual answers to judge.", body: `## Selected responses
- Encrypt at rest? → "Yes." (no detail — weak).
- ISO 27001 / SOC 2? → "We follow ISO 27001 principles." (NOT certified — red flag).
- Sub-processors? → blank.
- Incident plan? → "Yes, tested annually." (credible).
- Data location? → "AWS, various regions." (vague — possible non-UK transfer).
- Staff background checks? → "No."` }],
  },
  "TPRM-002/5": {
    objective: "You will request clarification for any vague or unsupported answers.",
    whatToDo: ["List the answers needing clarification.", "Send specific follow-up questions."],
    references: [{ id: "tprm002-5", title: "What to chase", kind: "Standard rules", summary: "The gaps to close.", body: `## Chase
- Encryption: which standard, key management?
- Certification: are you actually certified, or just "following principles"?
- Sub-processors: who are they, where?
- Data location: which regions exactly (UK/EU)?

## Rule
"Follows principles" ≠ certified — never accept it as satisfactory.` }],
  },
  "TPRM-002/6": {
    objective: "You will map each response to the corresponding ISO control and flag the gaps.",
    whatToDo: ["Map answers to ISO controls.", "Flag where the control fails."],
    references: [{ id: "tprm002-6", title: "Response → control mapping", kind: "Standard extract", summary: "Map the gaps.", body: `## Mappings
- Encryption → A.8.24.
- Sub-processors → A.5.19/A.5.21 supplier chain.
- Staff screening → A.6.1.
- Incident plan → A.5.24–5.26.

## Flag
"No staff screening" fails A.6.1 — a defensible, control-mapped finding.` }],
  },
  "TPRM-002/7": {
    objective: "You will calculate a Due-Diligence Score (% satisfactory).",
    whatToDo: ["Rate each answer and compute % satisfactory.", "Decide the residual risk level."],
    references: [{ id: "tprm002-7", title: "Scoring", kind: "Rating rules", summary: "How to score and decide.", body: `## Score
% satisfactory of all questions. "Follows principles" / blank / "No" on a key control = Unsatisfactory.

## Decide
A vendor handling client personal data with a low score needs contractual mitigations (DPA clauses, right to audit) before approval.` }],
  },
  "TPRM-002/8": {
    objective: "You will produce the Due-Diligence Assessment Report with findings and recommended mitigations.",
    whatToDo: ["Write findings, the score, and the risk decision.", "Recommend contractual/operational mitigations."],
    references: [{ id: "tprm002-8", title: "Report structure", kind: "Template", summary: "What it contains.", body: `## Report
- The score + key findings (weak answers, the no-screening gap).
- Control mappings.
- Risk rating confirmation.
- Recommended mitigations (DPA clauses, evidence of certification, region commitment) before approval.` }],
  },

  // ═════════════ Strategic Advisory Consultants · Legal, Accounting & Consulting ═════════════
  // ───────────── GRM-001 · Operational Risk Identification & Risk Register ─────────────
  "GRM-001/4.1": {
    objective: "You will review the firm's asset register to understand the risk surface before identifying risks.",
    whatToDo: ["Read the asset register (from AA-001 or provided).", "Note where the sensitive client data lives."],
    references: [{ id: "grm001-4-1", title: "The risk surface", kind: "Source document", group: "task", summary: "What's at stake.", body: `## The firm
A consultancy holding highly sensitive client data (financials, legal docs, M&A info). Reputation is everything — a single leak can lose clients.

## Focus
The crown jewels: client document stores, email, and any place consultants keep local copies.` }],
  },
  "GRM-001/4.2": {
    objective: "You will run risk-identification workshops with two business-unit managers.",
    whatToDo: ["Facilitate brainstorming with STRIDE-lite prompts.", "Capture risks in the managers' own words."],
    references: [{ id: "grm001-4-2", title: "Workshop inputs", kind: "Source document", group: "task", summary: "Risks raised (with L/I).", body: `## Risks raised
- Consultants email client docs to personal accounts (L4, I5).
- Lost unencrypted laptop with client files last year (L3, I5).
- No NDA tracking — unclear who's covered (L3, I4).
- Over-reliance on one partner (L2, I4).
- Finance phishing for fraudulent payments (L4, I4).

## Rule
Score from these workshop figures — build the register from real input.` }],
  },
  "GRM-001/4.3": {
    objective: "You will document each identified risk with full detail.",
    whatToDo: ["Record ID, description, threat source, existing controls, likelihood, impact, inherent score.", "Be specific, not generic."],
    references: [{ id: "grm001-4-3", title: "Risk record fields", kind: "Template", summary: "Per-risk fields.", body: `## Per risk
Risk ID · description · threat source · existing controls · likelihood (1–5) · impact (1–5) · inherent score (L×I).

## Rule
"Cyber risk" is not a risk; "consultants email client documents to personal Gmail, risking a confidentiality breach" is.` }],
  },
  "GRM-001/4.4": {
    objective: "You will map each risk to an ISO 27001 Annex A control domain.",
    whatToDo: ["Map each risk to a control domain.", "This shows which controls would treat it."],
    references: [{ id: "grm001-4-4", title: "Risk → control domain", kind: "Standard extract", summary: "The domains.", body: `## Domains
Governance/organisational · people · physical · technological.

## Examples
- Emailing docs out → technological (A.5.14 transfer, A.8.1 endpoint) + people (A.6.3 awareness).
- Lost laptop → technological (A.8.24 encryption) + physical.` }],
  },
  "GRM-001/4.5": {
    objective: "You will apply the 5×5 matrix to categorise each risk Critical/High/Medium/Low.",
    whatToDo: ["Compute L×I and band each risk.", "Sense-check the bands against intuition."],
    references: [{ id: "grm001-4-5", title: "5×5 matrix", kind: "Standard extract", summary: "The bands.", body: `## Inherent score = L × I (1–25)
1–4 Low · 5–9 Medium · 10–15 High · 16–25 Critical.

## Here
Emailing docs (4×5=20) = Critical; finance phishing (4×4=16) = Critical; lost laptop (3×5=15) = High.` }],
  },
  "GRM-001/4.6": {
    objective: "You will recommend a risk treatment option for each risk.",
    whatToDo: ["Choose accept/mitigate/transfer/avoid for each.", "Justify, and name an owner."],
    references: [{ id: "grm001-4-6", title: "Treatment options", kind: "Standard rules", summary: "How to choose.", body: `## Options
Mitigate (add control) · Transfer (insurance/contract) · Avoid (stop the activity) · Accept (Low only, with sign-off).

## Rule
A Critical/High risk marked "accept" without leadership sign-off is itself a finding. Every risk needs an owner.` }],
  },
  "GRM-001/4.7": {
    objective: "You will review the register with the Cyber Risk Manager mentor before presenting.",
    whatToDo: ["Share with a cover note.", "Address feedback on scoring and treatments."],
    references: [{ id: "grm001-4-7", title: "Review checklist", kind: "Checklist", summary: "Before presenting.", body: `## Confirm
- Risks specific, scored from workshop input.
- Bands correct (L×I).
- Each risk has a treatment + owner.
- No High/Critical "accepted" without sign-off.` }],
  },
  "GRM-001/4.8": {
    objective: "You will present the top five risks and treatment recommendations to management.",
    whatToDo: ["Present the five most serious risks and their treatments.", "Capture the decisions."],
    references: [{ id: "grm001-4-8", title: "Presenting risk", kind: "Briefing notes", summary: "What to land.", body: `## Present
- The five Critical/High risks (emailing docs, finance phishing, lost-laptop).
- The recommended treatment + cost for each.
- The decisions you need (e.g. approve DLP, mandate encryption).` }],
  },

  // ───────────── DD-003 · Data Retention Schedule Development ─────────────
  "DD-003/1": {
    objective: "You will identify the target data category for the retention schedule, with the mentor.",
    whatToDo: ["Pick one data category to schedule.", "Confirm why it's the priority."],
    references: [{ id: "dd003-1", title: "Target category", kind: "Source document", group: "task", summary: "Which category and why.", body: `## Recommended: HR & payroll records
A well-defined category with clear legal retention rules and a real GDPR-vs-tax-law tension — the most instructive to schedule.` }],
  },
  "DD-003/2": {
    objective: "You will research the applicable legal retention requirements for the category.",
    whatToDo: ["Find the statutory retention periods.", "Note where laws conflict with data minimisation."],
    references: [{ id: "dd003-2", title: "Legal retention (HR/payroll, UK)", kind: "Standard extract", summary: "The periods you must apply.", body: `## Statutory periods
- Payroll/tax → HMRC 6 years (current + 5).
- Statutory maternity/paternity pay → 3 years.
- Right-to-work checks → 2 years after employment ends.
- Unsuccessful recruitment → 6–12 months (minimise).
- General HR file → ~6 years after leaving (claims limitation).

## The tension
GDPR says don't over-retain; tax law says keep 6 years. Reconcile: keep the legal minimum, then dispose securely.` }],
  },
  "DD-003/3": {
    objective: "You will request the storage, backup, and archive details for this data category from the data owner and IT/system owner.",
    whatToDo: ["Address the request to the data owner and the IT/system owner.", "Ask for every storage location, all backup copies and their schedule, and any archives or exports.", "Set a clear deadline for the response."],
    references: [{ id: "dd003-3", title: "What to request", kind: "Request guide", summary: "What to ask for.", body: `## Request
- Every place this data is stored (primary systems, databases).
- All backup copies, and the backup schedule/retention.
- Any archives, exports, or spreadsheet copies.
- Who can access each copy.

## Why
You can't dispose of data you don't know about — backups and exports are where retention rules quietly fail.` }],
  },
  "DD-003/4": {
    objective: "You will complete the retention schedule row by row for each data element.",
    whatToDo: ["One row per data element.", "Apply the legal minimum period from your research."],
    references: [{ id: "dd003-4", title: "Schedule fields", kind: "Template", summary: "Per-element fields.", body: `## Per element
Data element · retention trigger · retention period (legal minimum) · review point · disposal method.

## Rule
The period must be the legal minimum you researched — not "keep forever" or a guess.` }],
  },
  "DD-003/5": {
    objective: "You will specify the trigger, period, review point, and disposal method for each element.",
    whatToDo: ["State the trigger (e.g. end of employment) and the disposal method.", "Make disposal concrete."],
    references: [{ id: "dd003-5", title: "Triggers & disposal", kind: "Standard rules", summary: "How to specify.", body: `## Triggers
e.g. "end of employment", "end of tax year".

## Disposal methods
Secure deletion / anonymisation / archive. Personal data must be securely deleted or anonymised at end of life — not just left in the system.` }],
  },
  "DD-003/6": {
    objective: "You will draft a Data Disposal Instruction aligned to each disposal method.",
    whatToDo: ["Write how each disposal method is actually performed.", "Make it executable by IT."],
    references: [{ id: "dd003-6", title: "Disposal instruction", kind: "Template", summary: "What it covers.", body: `## Per method
- Secure deletion: how (tool, verification).
- Anonymisation: what's removed so it's truly anonymous.
- Archive: where, with what access.

## Rule
"Delete it" isn't an instruction — say how, and how you verify it's gone.` }],
  },
  "DD-003/7": {
    objective: "You will map each schedule entry to the relevant ISO 27001 control.",
    whatToDo: ["Map entries to A.8.10, A.5.33, etc.", "Confirm the controls cover deletion and record protection."],
    references: [{ id: "dd003-7", title: "ISO mapping", kind: "Standard extract", summary: "The controls.", body: `## Controls
- A.8.10 Information deletion.
- A.5.33 Protection of records.
- A.5.34 Privacy & PII protection.

## Why
The schedule is the evidence these controls operate — retention is governed, not ad hoc.` }],
  },
  "DD-003/8": {
    objective: "You will obtain sign-off from the Legal/Compliance contact and data owner.",
    whatToDo: ["Walk Legal and the owner through the schedule.", "Record the sign-off."],
    references: [{ id: "dd003-8", title: "Sign-off", kind: "Briefing notes", summary: "Why it's needed.", body: `## Sign-off
Retention decisions have legal consequences (delete too early = lose evidence; too late = GDPR breach). Legal must approve. Record the decision and date.` }],
  },

  // ───────────── TV-002 · Policy Compliance Spot-Check ─────────────
  "TV-002/1": {
    objective: "You will select three policies to spot-check, with the Compliance Manager.",
    whatToDo: ["Pick three policies that are testable and matter.", "Confirm what compliance looks like for each."],
    references: [{ id: "tv002-1", title: "Policies to test", kind: "Source document", group: "task", summary: "The three + their claims.", body: `## Policies
1. Security Awareness — "all staff trained annually".
2. Access Control — "access reviewed quarterly".
3. Encryption — "all laptops encrypted".

## Rule
Pick policies where compliance can be evidenced — these three can.` }],
  },
  "TV-002/2": {
    objective: "You will define testable control statements and the evidence that would prove compliance.",
    whatToDo: ["For each policy, write 2–3 testable statements.", "Name the evidence that proves each."],
    references: [{ id: "tv002-2", title: "Testable statements", kind: "Template", summary: "How to make a policy testable.", body: `## Example
Policy: "all laptops encrypted" → testable statement: "100% of managed laptops show encryption enabled" → evidence: endpoint management console export.

## Rule
A statement you can't gather evidence for isn't testable — rewrite it.` }],
  },
  "TV-002/3": {
    objective: "You will request the evidence samples from IT and HR.",
    whatToDo: ["Request the specific evidence per statement.", "Set a deadline."],
    references: [{ id: "tv002-3", title: "Evidence to request", kind: "Briefing notes", summary: "What to ask for.", body: `## Request
- Training: the completion log.
- Access: the last access-review record.
- Encryption: the endpoint encryption report.

## Note
"No evidence available" is itself a finding — record it.` }],
  },
  "TV-002/4": {
    objective: "You will evaluate each evidence sample against its control statement.",
    whatToDo: ["Rate each compliant / partial / non-compliant.", "Judge from the evidence, not impression."],
    references: [{ id: "tv002-4", title: "Evidence samples", kind: "Source document", group: "task", summary: "The actual evidence.", body: `## Samples
- Training: 22 of 30 trained → 73% → partial.
- Access review: last one was 14 months ago → non-compliant.
- Encryption: 28 of 30 encrypted; 2 personal laptops not → partial.

## Rule
Findings come from these numbers — "mostly fine" is not a finding.` }],
  },
  "TV-002/5": {
    objective: "You will document the findings in the Control Testing Workpaper.",
    whatToDo: ["Record each test, the evidence, and the rating.", "Make it audit-quality."],
    references: [{ id: "tv002-5", title: "Workpaper", kind: "Template", summary: "What to record.", body: `## Per test
Statement · evidence examined · result (compliant/partial/non-compliant) · note.

## Rule
A workpaper must let someone re-perform your test and reach the same conclusion.` }],
  },
  "TV-002/6": {
    objective: "You will calculate a compliance rate per policy.",
    whatToDo: ["Compute the rate per policy from the statement results.", "Re-check the arithmetic."],
    references: [{ id: "tv002-6", title: "Compliance rate", kind: "Standard rules", summary: "How to compute.", body: `## Rate
(# compliant statements ÷ total statements) per policy, or weight by importance.

## Rule
"No evidence" = non-compliant, not "unknown" — absence of evidence is the finding.` }],
  },
  "TV-002/7": {
    objective: "You will draft remediation recommendations for each non-compliant finding.",
    whatToDo: ["Recommend a specific fix per finding.", "Name an owner and timeframe."],
    references: [{ id: "tv002-7", title: "Remediation", kind: "Standard rules", summary: "What a good rec looks like.", body: `## Per finding
- The gap (e.g. "access review 14 months overdue").
- The fix (run the review; set a quarterly cadence).
- Owner + date.` }],
  },
  "TV-002/8": {
    objective: "You will compile the Spot-Check Report and review it with the Information Security Auditor mentor.",
    whatToDo: ["Write the report: scope, findings, rates, remediation.", "Review with the mentor."],
    references: [{ id: "tv002-8", title: "Report structure", kind: "Template", summary: "What it contains.", body: `## Report
- Scope + method.
- Per-policy compliance rate.
- Findings (with evidence).
- Remediation recommendations + owners.` }],
  },

  // ───────────── MM-002 · Risk Register Maintenance — Monthly Cycle ─────────────
  "MM-002/1": {
    objective: "You will schedule the monthly Risk Register Review with the risk owners.",
    whatToDo: ["Book a 60-minute review with the two risk owners.", "Set a clear purpose."],
    references: [{ id: "mm002-1", title: "Scheduling the review", kind: "Briefing notes", summary: "Who and why.", body: `## Schedule
A 60-minute monthly review with the risk owners from GRM-001. Purpose: re-score risks, check treatments, capture new risks.` }],
  },
  "MM-002/2": {
    objective: "You will prepare the agenda and circulate the current register for pre-reading.",
    whatToDo: ["Build the agenda (per-risk review).", "Circulate the register in advance."],
    references: [{ id: "mm002-2", title: "Agenda + pre-read", kind: "Template", summary: "What to send.", body: `## Agenda
Per risk: has likelihood/impact changed? Are treatments on track? Any new risks?

## Pre-read
Send the current register so the meeting reviews, not reads.` }],
  },
  "MM-002/3": {
    objective: "You will facilitate the review meeting.",
    whatToDo: ["Walk each risk: change in L/I, treatment progress, new risks.", "Keep it moving and decisive."],
    references: [{ id: "mm002-3", title: "Current register", kind: "Source document", group: "task", summary: "The starting position.", body: `## Open risks (last month)
- R1 Client data on personal devices — High (12); MDM rollout 40%.
- R2 Lost-laptop/unencrypted — High (15); encryption project now COMPLETE → re-score down.
- R3 No NDA tracking — Medium (9); not started.
- R4 Finance phishing — High (16); verification process being introduced.

## New
A consultant clicked a phishing link → raises R4's likelihood.` }],
  },
  "MM-002/4": {
    objective: "You will update risk scores and treatment status in real time during the meeting.",
    whatToDo: ["Re-score risks as decisions are made.", "Record the reason for each change."],
    references: [{ id: "mm002-4", title: "Re-scoring rules", kind: "Standard rules", summary: "How to update.", body: `## Re-score
- A completed mitigation reduces residual risk (R2 encryption done → drop impact/likelihood; record why).
- A new event raises likelihood (R4 phishing click).

## Rule
Every score change needs a recorded reason.` }],
  },
  "MM-002/5": {
    objective: "You will add any newly identified risks in the standard format.",
    whatToDo: ["Give each new risk an ID and full scoring.", "Use the same format as the register."],
    references: [{ id: "mm002-5", title: "Adding new risks", kind: "Template", summary: "The format.", body: `## New risk
Risk ID · description · threat source · existing controls · likelihood · impact · inherent score · treatment · owner.

## Rule
New risks get the same rigour as old ones — no shortcuts.` }],
  },
  "MM-002/6": {
    objective: "You will calculate whether the overall residual risk portfolio improved, worsened, or held.",
    whatToDo: ["Compare total/average residual risk vs last month.", "State the trend."],
    references: [{ id: "mm002-6", title: "Portfolio direction", kind: "Standard rules", summary: "How to judge it.", body: `## Compute
Compare this month's total/average residual score to last month's. R2 dropping (encryption done) improves the portfolio; R4 rising offsets it.

## Output
A one-line trend (improved / worsened / stable) backed by the numbers.` }],
  },
  "MM-002/7": {
    objective: "You will produce the Updated Risk Register and a one-page Risk Summary for management.",
    whatToDo: ["Finalise the register.", "Write a one-page summary with the trend and top risks."],
    references: [{ id: "mm002-7", title: "Summary", kind: "Template", summary: "What management sees.", body: `## One-page summary
- The trend (improved/worsened).
- Top risks now.
- What changed and why (R2 closed, R4 up).
- Any decision needed.` }],
  },
  "MM-002/8": {
    objective: "You will distribute the updated register to risk owners and file it.",
    whatToDo: ["Send the updated register to all owners.", "File it in the evidence repository."],
    references: [{ id: "mm002-8", title: "Distribution", kind: "Briefing notes", summary: "Closing the cycle.", body: `## Distribute + file
- Send to every risk owner so they know their actions.
- File the dated register as evidence the risk-management process operates (ISO Clause 6/8).` }],
  },

  // ───────────── PE-002 · Audit Evidence Preparation & Filing ─────────────
  "PE-002/1": {
    objective: "You will select the ISO clause or controls to prepare evidence for, with the auditor mentor.",
    whatToDo: ["Pick a clause / small control set.", "Confirm scope so the evidence pack is focused."],
    references: [{ id: "pe002-1", title: "Scope", kind: "Source document", group: "task", summary: "What to prepare for.", body: `## Recommended: A.8.2 Privileged access
A control with clear, checkable evidence — and known gaps at this firm — making it a realistic audit-prep exercise.` }],
  },
  "PE-002/2": {
    objective: "You will identify every evidence item an auditor would expect for the selected controls.",
    whatToDo: ["List the expected evidence using the requirements list.", "Be exhaustive — auditors test completeness."],
    references: [{ id: "pe002-2", title: "Expected evidence (A.8.2)", kind: "Source document", group: "task", summary: "What the auditor will ask for.", body: `## An auditor expects
- The approved privileged-user list.
- Approval records for each grant.
- The last quarterly access-review (dated, signed).
- Evidence leavers' access was removed.
- The governing policy.

## Known gaps
Two grants have no approval record; the last review is undated — flag, don't hide.` }],
  },
  "PE-002/3": {
    objective: "You will collect each evidence item from the relevant owners.",
    whatToDo: ["Gather each item from its system/department owner.", "Note anything that can't be produced."],
    references: [{ id: "pe002-3", title: "Collection", kind: "Briefing notes", summary: "How to collect.", body: `## Collect
Request each item from its owner with a deadline. Where an item doesn't exist (e.g. a missing approval record), record the gap — it's a finding, not something to fabricate.` }],
  },
  "PE-002/4": {
    objective: "You will label each evidence item to the labelling convention.",
    whatToDo: ["Apply the Evidence ID / Control Ref / Date / Version / Source label.", "Make each item traceable."],
    references: [{ id: "pe002-4", title: "Labelling convention", kind: "Template", summary: "The label fields.", body: `## Label
Evidence ID · Control reference (A.8.2) · Date · Version · Source.

## Why
An auditor must trace each item to a control and a source — unlabelled evidence is hard to rely on.` }],
  },
  "PE-002/5": {
    objective: "You will review each item for completeness and accuracy, rejecting weak evidence.",
    whatToDo: ["Check each item is current, complete, and relevant.", "Reject outdated or context-free items."],
    references: [{ id: "pe002-5", title: "Quality rules", kind: "Standard rules", summary: "What to reject.", body: `## Reject
- Out of date (a 14-month-old review doesn't evidence "quarterly").
- Unsigned/undated where approval is the point.
- A screenshot with no date or system shown.` }],
  },
  "PE-002/6": {
    objective: "You will compile the evidence into a structured pack with an index.",
    whatToDo: ["Organise the pack logically.", "Build an evidence index mapping items to controls."],
    references: [{ id: "pe002-6", title: "Evidence pack", kind: "Template", summary: "How to structure it.", body: `## Pack
- An index (Evidence ID → control → location).
- Items organised by control.
- Gaps noted in the index, not hidden.

## Rule
A clear index is what makes a pack auditable.` }],
  },
  "PE-002/7": {
    objective: "You will self-review the evidence pack against the Audit Evidence Checklist.",
    whatToDo: ["Check the pack against the checklist.", "Confirm gaps are honestly recorded."],
    references: [{ id: "pe002-7", title: "Self-review", kind: "Checklist", summary: "Before the mock audit.", body: `## Confirm
- Every expected item present or its gap recorded.
- All items labelled + indexed.
- No weak evidence left in.
- Gaps honestly flagged.` }],
  },
  "PE-002/8": {
    objective: "You will present the evidence pack to the mentor for a mock-audit quality check.",
    whatToDo: ["Walk the mentor through the pack.", "Note where a real auditor would push back."],
    references: [{ id: "pe002-8", title: "Mock audit", kind: "Briefing notes", summary: "What to expect.", body: `## In the mock audit
The mentor tests completeness and challenges weak items. An honestly-indexed pack with known gaps beats one that hides them — auditors test completeness, and a hidden gap becomes a finding plus a trust problem.` }],
  },

  // ───────────── QA-001 · GRC Document Quality Review ─────────────
  "QA-001/1": {
    objective: "You will select three GRC documents to quality-review, with the Compliance Manager.",
    whatToDo: ["Pick three documents that matter.", "Confirm they're current versions."],
    references: [{ id: "qa001-1", title: "Documents under review", kind: "Source document", group: "task", summary: "The three + their planted defects.", body: `## Documents
1. Information Security Policy — no version/approval date; references "ISO 27001:2013" (outdated).
2. Incident Response Procedure — inconsistent: §2 says report in 1 hour, §5 says 24 hours.
3. Access Control Policy — jargon-heavy, no plain-language; no review date.

## Rule
The defects above are real — your checklist must catch each.` }],
  },
  "QA-001/2": {
    objective: "You will apply the Document Quality Review checklist to each document.",
    whatToDo: ["Run the checklist on every document.", "Note each deficiency precisely."],
    references: [{ id: "qa001-2", title: "Quality checklist", kind: "Template", summary: "What to check.", body: `## Per document
- Document control block correct (owner, version, dates)?
- Internally consistent?
- Plain-language compliant?
- ISO references correct + current?
- Approval signatures present?
- Review date current?` }],
  },
  "QA-001/3": {
    objective: "You will complete a Correction Request for each deficiency found.",
    whatToDo: ["Log each deficiency with severity and a recommended fix.", "Be specific about location."],
    references: [{ id: "qa001-3", title: "Correction request", kind: "Template", summary: "The fields + severity.", body: `## Per deficiency
Description · document + section · severity (Minor/Major) · recommended correction.

## Severity
Major = affects correctness/compliance (outdated standard, contradiction, no approval). Minor = cosmetic.

## Rule
"Improve this" is not actionable — say what, where, and the fix.` }],
  },
  "QA-001/4": {
    objective: "You will compile all Correction Requests into a Quality Review Report.",
    whatToDo: ["Aggregate the requests by document and severity.", "Summarise the overall quality."],
    references: [{ id: "qa001-4", title: "Quality report", kind: "Template", summary: "What it contains.", body: `## Report
- Per document: deficiencies found, by severity.
- The Major issues highlighted.
- Overall quality verdict.` }],
  },
  "QA-001/5": {
    objective: "You will discuss each Major deficiency with the document owner.",
    whatToDo: ["Walk each owner through their Major issues.", "Agree the corrections and a date."],
    references: [{ id: "qa001-5", title: "Owner discussion", kind: "Briefing notes", summary: "How to handle it.", body: `## Discuss
- Be factual, not critical — the goal is a better document.
- Agree the correction and who does it by when.
- Log the agreement.` }],
  },
  "QA-001/6": {
    objective: "You will track the corrections the owners make.",
    whatToDo: ["Log each correction's status.", "Chase overdue ones."],
    references: [{ id: "qa001-6", title: "Correction tracking", kind: "Template", summary: "How to track.", body: `## Tracking log
Per correction: deficiency · owner · agreed date · status (open/done) · date closed.

## Rule
A deficiency isn't closed until re-checked (next step).` }],
  },
  "QA-001/7": {
    objective: "You will re-check the corrected documents and confirm closure of each request.",
    whatToDo: ["Re-review each corrected document.", "Close requests only when the fix is verified."],
    references: [{ id: "qa001-7", title: "Re-check rules", kind: "Testing rules", summary: "How to verify.", body: `## Re-check
Confirm the correction actually fixed the deficiency. The "ISO 27001:2013" reference is now "2022"; the §2/§5 contradiction is resolved. Close only on verification.` }],
  },
  "QA-001/8": {
    objective: "You will produce a Quality Review Closure Report confirming all deficiencies are resolved.",
    whatToDo: ["Confirm every request is closed.", "Write the closure report."],
    references: [{ id: "qa001-8", title: "Closure report", kind: "Template", summary: "What it confirms.", body: `## Closure report
- Every deficiency raised and its resolution.
- Confirmation all are re-checked and closed.
- Any that couldn't be closed (with reason).` }],
  },

  // ───────────── KT-002 · Lessons Learned — End-of-Rotation Retrospective ─────────────
  "KT-002/1": {
    objective: "You will review all your completed deliverables from the full GRC 101 rotation.",
    whatToDo: ["Gather every deliverable you produced.", "Re-read them to ground your reflection."],
    references: [{ id: "kt002-1", title: "Your deliverables", kind: "Source document", group: "task", summary: "What you produced.", body: `## Across four placements
- Asset register, CIS gap analysis, GDPR RoPA/DPIA.
- Risk register, policies, maturity assessment.
- Incident procedure, BIA & DR checklist, evidence pack.
- Roadmap, KPIs, management report.

## Rule
Reflect on specific tasks, not generalities.` }],
  },
  "KT-002/2": {
    objective: "You will complete a personal Lessons Learned Worksheet, honestly.",
    whatToDo: ["Answer the reflection questions.", "Tie each answer to a specific task."],
    references: [{ id: "kt002-2", title: "Worksheet questions", kind: "Template", summary: "What to answer.", body: `## Answer
- What did I learn (tied to specific tasks)?
- What went well?
- What was difficult, and why?
- What would I do differently?
- What gaps do I still have?

## Rule
"It was good" helps no one; "I underestimated how much evidence an auditor wants" does.` }],
  },
  "KT-002/3": {
    objective: "You will identify the top three improvements to the GRC 101 programme itself.",
    whatToDo: ["Name three concrete programme improvements.", "Be specific (a missing template, an unclear task)."],
    references: [{ id: "kt002-3", title: "Programme improvements", kind: "Standard rules", summary: "What's useful feedback.", body: `## Useful feedback
- A template that was missing.
- A task that needed more guidance.
- An instruction that was unclear.

## Rule
Specific, actionable improvements — not "make it easier".` }],
  },
  "KT-002/4": {
    objective: "You will request a second perspective from one peer mentee.",
    whatToDo: ["Address the request to a peer mentee.", "Ask about their experience, lessons, and what they'd change.", "Capture where your views differ."],
    references: [{ id: "kt002-4", title: "What to request", kind: "Request guide", summary: "What to ask for.", body: `## Request from a peer
- What they found hardest.
- What they would change about the programme.
- What surprised them.

## Why
A second perspective reveals patterns (and blind spots) yours alone won't.` }],
  },
  "KT-002/5": {
    objective: "You will write a Lessons Learned Report a future mentee could use to prepare.",
    whatToDo: ["Write 2–3 pages of transferable, specific lessons.", "Make it genuinely useful to a newcomer."],
    references: [{ id: "kt002-5", title: "Report rules", kind: "Template", summary: "How to write it.", body: `## Report (2–3 pages)
- Your key lessons (specific, tied to tasks).
- What you'd tell a new mentee on day one.
- The hardest parts and how to approach them.

## Rule
Specific and transferable beats vague and reassuring.` }],
  },
  "KT-002/6": {
    objective: "You will compile a Mentee Portfolio Index of everything you produced.",
    whatToDo: ["List every deliverable with where it lives.", "Make it a complete reference."],
    references: [{ id: "kt002-6", title: "Portfolio index", kind: "Template", summary: "What it lists.", body: `## Index
Every deliverable · the task it belongs to · where it's stored/linked.

## Why
The index is the evidence of your whole rotation — and the basis of your CV.` }],
  },
  "KT-002/7": {
    objective: "You will present the report and portfolio index to the GRC 101 Programme Manager.",
    whatToDo: ["Walk through your lessons and portfolio.", "Share the programme improvements."],
    references: [{ id: "kt002-7", title: "Presenting", kind: "Briefing notes", summary: "What to cover.", body: `## Present
- Your top lessons.
- The portfolio (what you can now do).
- Your three programme improvements.` }],
  },
  "KT-002/8": {
    objective: "You will contribute your top-three improvement recommendations to the programme backlog.",
    whatToDo: ["Submit the three improvements formally.", "Frame each as an actionable change."],
    references: [{ id: "kt002-8", title: "Closing the loop", kind: "Briefing notes", summary: "Why it matters.", body: `## Contribute
Add your three improvements to the programme backlog so the next cohort benefits. A retrospective whose lessons go nowhere is wasted — closing the loop is the point.` }],
  },
};
