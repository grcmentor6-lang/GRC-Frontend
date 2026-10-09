"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { VERB_LIST, GATE_VERBS } from "@/lib/verbs";
import { VERB_TONES } from "@/lib/tones";
import { startWelcomeTour } from "@/components/app/welcome-tour";
import { AccessChip } from "@/components/app/access-chip";
import { Gloss } from "@/components/app/glossary";

/** The five rubric dimensions, derived from the verb metadata so the guide can't drift from it. */
const RUBRIC = [...new Set(VERB_LIST.flatMap((v) => v.layer2))].filter((d) => d !== "All five rubric dimensions");

type Section = { id: string; title: string; icon: IconName };

const SECTIONS: Section[] = [
  { id: "what", title: "What grcmentor is", icon: "sparkle" },
  { id: "shape", title: "How the programme is shaped", icon: "layers" },
  { id: "org", title: "The organisation you work for", icon: "briefcase" },
  { id: "task", title: "Anatomy of a task", icon: "clipboard" },
  { id: "desk", title: "Doing the work: the Working Desk", icon: "desk" },
  { id: "example", title: "A worked example", icon: "play" },
  { id: "method", title: "Vocabulary", icon: "grid" },
  { id: "grading", title: "How you are graded", icon: "bullseye" },
  { id: "answers", title: "What a good answer looks like", icon: "edit" },
  { id: "outputs", title: "What your work turns into", icon: "trophy" },
  { id: "access", title: "How long you have access", icon: "calendar" },
  { id: "around", title: "Finding your way around", icon: "home" },
  { id: "first", title: "Your first session", icon: "rocket" },
  { id: "tips", title: "Getting a good grade", icon: "lightbulb" },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <span className="grid place-items-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70 text-[12px] font-semibold">
          {n}
        </span>
        <span className="flex-1 w-px bg-slate-200/80 mt-1.5" />
      </div>
      <div className="pb-6 min-w-0">
        <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">{title}</h4>
        <div className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1 space-y-2" style={{ textWrap: "pretty" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Sec({ id, title, icon, lead, children }: Section & { lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_4px_14px_-4px_rgba(139,92,246,0.7)]">
          <Icon name={icon} size={16} />
        </span>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-slate-900">{title}</h2>
      </div>
      {lead && (
        <p className="text-[13px] text-slate-600 leading-relaxed tracking-tight mt-2.5" style={{ textWrap: "pretty" }}>
          {lead}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-amber-50/70 ring-1 ring-amber-200/70 px-3.5 py-3">
      <Icon name="info" size={15} className="shrink-0 mt-px text-amber-600" />
      <p className="text-[12.5px] text-amber-900/90 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
        {children}
      </p>
    </div>
  );
}

function Bullets({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2 text-[12.5px] text-slate-600 tracking-tight leading-relaxed">
          <span className="mt-[7px] w-1 h-1 rounded-full bg-indigo-300 shrink-0" />
          <span style={{ textWrap: "pretty" }}>{s}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GuidePage() {
  const [active, setActive] = useState(SECTIONS[0].id);

  // Contents-rail highlight. ponytail: plain IntersectionObserver, no scroll-spy library.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="page-shell">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-6 py-7 md:px-8 md:py-8 shadow-[0_20px_50px_-25px_rgba(99,102,241,0.8)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">User guide</p>
        <h1 className="text-[26px] md:text-[30px] font-semibold tracking-[-0.02em] mt-1.5">How grcmentor works</h1>
        <p className="text-[13.5px] text-white/85 leading-relaxed tracking-tight mt-2 max-w-[62ch]" style={{ textWrap: "pretty" }}>
          You are about to work as a GRC practitioner inside simulated companies — real standards, real
          deliverables, real deadlines, graded by an AI mentor. Read this once, end to end. It covers who you
          work for, what you will produce, how it is marked, and what you walk away with.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <button
            onClick={startWelcomeTour}
            className="guide-blink focus-ring cursor-pointer inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight hover:bg-white/90 transition-colors"
          >
            <Icon name="play" size={14} /> Take the 2-minute tour
          </button>
          <Link
            href="/app/desk"
            className="focus-ring inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white/15 ring-1 ring-white/30 text-white text-[13px] font-medium tracking-tight no-underline hover:bg-white/25 transition-colors"
          >
            Go to the Working Desk <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>

      <div className="flex gap-8 mt-7">
        {/* Contents rail */}
        <nav aria-label="Guide contents" className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400 px-2.5 mb-2">On this page</p>
            <div className="flex flex-col gap-0.5">
              {SECTIONS.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`focus-ring px-2.5 h-9 rounded-lg flex items-center gap-2 text-[12.5px] tracking-tight no-underline transition-colors ${
                    active === s.id ? "bg-indigo-50/80 text-indigo-700 font-medium" : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  <span className="w-4 shrink-0 text-[11px] tabular-nums text-slate-400">{i + 1}</span>
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex-1 min-w-0 space-y-10">
          <Sec
            id="what"
            title="What grcmentor is"
            icon="sparkle"
            lead="Not a course you watch. A job you do. Every screen in this app exists to move one engagement forward and turn the evidence of that work into something an employer will recognise."
          >
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: "briefcase" as IconName, t: "You are hired", d: "Assigned to a simulated company as its GRC practitioner, with a real org profile: industry, regulators, assets, standards in scope." },
                { icon: "clipboard" as IconName, t: "You do the work", d: "Structured engagements broken into projects, tasks and activities — registers, policies, assessments, briefings, sign-offs." },
                { icon: "trophy" as IconName, t: "You get credit", d: "Graded submissions compile automatically into a CV, badges, a verifiable certificate and matched jobs." },
              ].map((c) => (
                <div key={c.t} className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                  <Icon name={c.icon} size={17} className="text-indigo-500" />
                  <h4 className="text-[13px] font-semibold tracking-tight text-slate-900 mt-2.5">{c.t}</h4>
                  <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight mt-1" style={{ textWrap: "pretty" }}>{c.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Note>
                Your mentor is an AI. It reviews and grades every submission, asks Socratic follow-ups and
                decides whether the work passes. There is no human queue to wait on — feedback arrives when you submit.
              </Note>
            </div>
          </Sec>

          <Sec
            id="shape"
            title="How the programme is shaped"
            icon="layers"
            lead="Five levels, nesting inwards. Learn these names — the whole app is organised by them."
          >
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              {[
                { k: "Track", d: "GRC 101 → 301 → 501, taken in order. 101 is foundations; each track unlocks when the one before it is complete." },
                { k: "Organisation", d: "The simulated company you are assigned to inside a track. You work its real context, not generic examples." },
                { k: "Project", d: "A named engagement for that organisation — e.g. standing up an ISMS, or running a risk assessment cycle." },
                { k: "Task", d: "A deliverable-sized chunk of the project, mapped to a standard. This is the unit that gets graded as a whole." },
                { k: "Activity", d: "A single action inside the task, driven by one of the 22 method verbs. This is what you actually fill in and submit." },
              ].map((r, i, arr) => (
                <div key={r.k} className="flex gap-3" style={{ paddingLeft: i * 14 }}>
                  <div className="shrink-0 flex flex-col items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                    {i < arr.length - 1 && <span className="flex-1 w-px bg-slate-200 my-1" />}
                  </div>
                  <div className="pb-4 min-w-0">
                    <div className="text-[13px] font-semibold tracking-tight text-slate-900">{r.k}</div>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-0.5" style={{ textWrap: "pretty" }}>{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-3">
              Progress is sequential and gated: an activity opens when the one before it is complete, and a
              task opens when the previous task closes. You cannot skip ahead — the point is that the later
              work depends on artefacts you produced earlier, exactly like a real engagement.
            </p>
          </Sec>

          <Sec
            id="org"
            title="The organisation you work for"
            icon="briefcase"
            lead="Every task is answered in the context of one specific company. Generic answers score badly; answers that use this company's facts score well. Open the Organisation Context panel on the desk before you write anything."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { t: "Profile & footprint", d: "Sub-industry, head office city and country, regional offices — this drives which laws and regulators apply." },
                { t: "Regulator & rationale", d: "The primary regulator and why it applies. Cite it when a task asks about legal or regulatory drivers." },
                { t: "Services & processes", d: "What the company sells and its customer-facing processes — your scope statements should name these." },
                { t: "Interested parties", d: "Internal and external parties plus their key requirements. Use these as your named stakeholders and owners." },
                { t: "Information assets", d: "On-premises and cloud assets, and the client data handled. Your registers and classifications are built from these." },
                { t: "Standards in scope", d: "Mandatory and optional standards plus regulatory requirements — what your work is assessed against." },
              ].map((c) => (
                <div key={c.t} className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                  <h4 className="text-[13px] font-semibold tracking-tight text-slate-900">{c.t}</h4>
                  <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight mt-1" style={{ textWrap: "pretty" }}>{c.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Note>
                The single biggest score difference between mentees: naming this organisation&apos;s actual
                systems, roles, regulators and processes instead of writing &ldquo;the company&rdquo; and
                &ldquo;relevant stakeholders&rdquo;. Specificity is a graded rubric dimension.
              </Note>
            </div>
          </Sec>

          <Sec
            id="task"
            title="Anatomy of a task"
            icon="clipboard"
            lead="Every task runs the same shape: a readiness gate to open it, the activities in the middle, and a research submission to close it."
          >
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title={`Readiness gate (${GATE_VERBS.rua.label})`}>
                <p>{GATE_VERBS.rua.when}</p>
                <p>
                  You work through the controls in scope, inspect every template you are about to fill in,
                  explain each step&apos;s concepts in your own words, and pass a short verification session.
                  Only then do the task&apos;s activities unlock. It feels like a hurdle — it is the thing that
                  stops you filling in a register you do not understand.
                </p>
              </Step>
              <Step n={2} title="The activities">
                <p>
                  The body of the task: typically five to twelve activities, each driven by one method verb and
                  each producing a piece of the deliverable. Complete them in order; each is graded on submit.
                </p>
              </Step>
              <Step n={3} title={`Research submission (${GATE_VERBS.research.label})`}>
                <p>{GATE_VERBS.research.when}</p>
                <p>
                  You evidence the research behind the deliverable: work the required methods, cite a real
                  source and name the organisation for each, then sign the declaration. This closes the task
                  and unlocks the next one.
                </p>
              </Step>
              <div className="flex gap-4">
                <div className="shrink-0 w-7 grid place-items-center">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">Task complete</h4>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1">
                    The deliverable lands in My Learnings, the standard&apos;s coverage ticks up, and any badge
                    or CV entry it earns appears automatically.
                  </p>
                </div>
              </div>
            </div>
          </Sec>

          <Sec
            id="desk"
            title="Doing the work: the Working Desk"
            icon="desk"
            lead="The Working Desk is where you execute. Everything you need for the current activity is on that one screen — you should not need to hunt."
          >
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title="Pick up where you left off">
                <p>
                  The dashboard&apos;s Continue card and the desk&apos;s step rail both point at your next open
                  activity. The rail on the left shows the whole task: done, current, and locked steps.
                </p>
              </Step>
              <Step n={2} title="Read the brief and the organisation context">
                <p>
                  Each activity states its objective, the standard and controls it maps to, and what a
                  complete answer must contain. Read the deliverable contract before you start typing — it is
                  literally the checklist you will be graded against.
                </p>
              </Step>
              <Step n={3} title="Open the reference material">
                <p>
                  Templates, prior artefacts, standard extracts and stakeholder documents are attached to the
                  activity and open in their own windows, so you can keep a template beside your answer. Work
                  produced in earlier activities is available here too — later tasks build on it.
                </p>
              </Step>
              <Step n={4} title="Look up any term you don't know">
                <p>
                  Technical terms carry a <span className="underline decoration-dotted decoration-slate-400 underline-offset-[3px]">dotted underline</span> wherever
                  they appear — the brief, the organisation context, the reference material, the acceptance
                  criteria. Click one and its definition opens beside the word; click away, or press Esc, to
                  dismiss it. Nothing is hidden behind a hover, so it works on a touchscreen too.
                </p>
                <p>
                  Every term is explained where you meet it, so you never have to break off and look
                  one up. Try it now:{" "}
                  <Gloss>the asset owner signs the asset register, and a DPIA covers personal data.</Gloss>
                </p>
              </Step>
              <Step n={5} title="Fill in the workspace">
                <p>
                  Every verb has its own purpose-built workspace: a register grid for Record, a mapping matrix
                  for Map, a request form for Request, a scoring rubric for Score, and so on. Tabs across the
                  top break longer activities into parts — complete them all before submitting.
                </p>
                <p>
                  Interaction activities (request, interview, conduct, present, sign-off, schedule) are
                  structured forms addressed to a named stakeholder role. There is no chat to negotiate with;
                  what is graded is the quality of what you wrote.
                </p>
              </Step>
              <Step n={6} title="Submit and read the feedback">
                <p>
                  Submitting runs the grading immediately. If a deterministic check fails you get told exactly
                  which one, you fix it, and you resubmit. If it passes, the rubric feedback tells you where
                  the answer was thin.
                </p>
              </Step>
              <div className="flex gap-4">
                <div className="shrink-0 w-7 grid place-items-center">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-200/70">
                    <Icon name="bot" size={14} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">The AI mentor grades on submit</h4>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1">
                    There is no chat to negotiate with — you submit, it grades, and its written feedback is
                    where the guidance lives. Read it in full and act on it before you resubmit.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-3">
              Tip: collapse the main menu with the button at the top-left when you are on the desk. The
              workspace column wants the width.
            </p>
          </Sec>

          <Sec
            id="example"
            title="A worked example"
            icon="play"
            lead="Abstract descriptions only get you so far. Here is your actual first task, start to finish, so you know exactly what the work feels like before you open it."
          >
            <div className="rounded-xl bg-slate-900 text-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 h-7 rounded-md bg-white/10 ring-1 ring-white/20 text-[12px] font-mono font-semibold">AA-001</span>
                <h4 className="text-[15px] font-semibold tracking-tight">Information Asset Inventory &amp; Classification</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["CloudTech", "ISO/IEC 27001:2022", "Controls A.5.9 & A.5.12", "Badge: Process Mapping Specialist"].map((c) => (
                  <span key={c} className="inline-flex items-center px-2.5 h-7 rounded-lg bg-white/10 ring-1 ring-white/15 text-[11.5px] font-medium tracking-tight text-white/85">{c}</span>
                ))}
              </div>
              <p className="text-[12.5px] text-white/75 leading-relaxed tracking-tight mt-3" style={{ textWrap: "pretty" }}>
                <span className="font-semibold text-white">The deliverable:</span> a signed-off Information Asset
                Register for CloudTech&apos;s Customer Platform team — every asset listed with its classification,
                storage location, named owner and any remediation gaps. Later tasks read from this register, so
                errors here follow you.
              </p>
            </div>

            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5 mt-3">
              <Step n={1} title="Clear the readiness gate">
                <p>
                  Before a single field opens you work through the controls in scope (A.5.9 asset inventory,
                  A.5.12 classification), inspect the register template you are about to fill in, and explain
                  in your own words what an &ldquo;information asset&rdquo; actually is. Then a short
                  verification session checks you meant it. Only now do the activities unlock.
                </p>
              </Step>
              <Step n={2} title="Read the source material — properly">
                <p>
                  The task hands you the Customer Platform team&apos;s raw intake notes and CloudTech&apos;s
                  classification scheme. The notes are deliberately messy, exactly like real intake: eight
                  assets described in passing, one with no owner at all, one nobody can account for.
                </p>
                <p>
                  <span className="font-medium text-slate-700">This is where the task is won or lost.</span> The
                  facts you need are only in these documents — you cannot produce a correct register from
                  general knowledge, and the mentor can tell when you tried.
                </p>
              </Step>
              <Step n={3} title="Gather the information (Request, then Conduct)">
                <p>
                  First you write to IT/Operations asking for their initial asset list — a named role in the
                  To-field, at least three specific items requested, a subject line under 80 characters. Then you
                  run structured interviews with the process owners and record what they tell you.
                </p>
                <p>
                  These are forms, not chats. What gets graded is whether you asked the right things of the
                  right role, and whether your notes are specific enough to build a register from.
                </p>
              </Step>
              <Step n={4} title="Record each asset (Record)">
                <p>
                  A register grid opens. One row per asset: name, the data it holds, where it is stored, and an
                  owner. The owner must be a <span className="font-medium text-slate-700">role</span> — &ldquo;Platform
                  Engineering Lead&rdquo;, not &ldquo;Engineering&rdquo; and not a person&apos;s name. That is a
                  Layer 1 check; it fails the submission outright rather than quietly costing you marks.
                </p>
              </Step>
              <Step n={5} title="Classify, then cross-check (Apply, then Cross-reference)">
                <p>
                  Public, Internal or Confidential — decided by CloudTech&apos;s published rules, not your
                  instinct. Anything holding customer or staff personal data is at minimum Confidential, as is
                  anything holding credentials or proprietary source code. Every row needs a one-line rationale
                  naming the rule you applied.
                </p>
                <p>
                  Then you cross-reference the register against the network diagrams. Two sources, one truth —
                  you are looking for what the interviews missed and what the diagrams reveal.
                </p>
              </Step>
              <Step n={6} title="Flag the gaps (Identify)">
                <p>
                  Now the judgement. The marketing email list has no owner. The stray database backup on an
                  engineer&apos;s laptop — nobody knows who made it or what is in it. Both are remediation gaps,
                  and each flag needs a proposed action and a named accountable role. Catching these is the
                  actual skill the task is testing.
                </p>
              </Step>
              <Step n={7} title="Review, then present for sign-off (Review, then Present)">
                <p>
                  You submit the near-final register with a cover note for a quality check, address the feedback,
                  and then present it to the department head: the deck, at least three anticipated questions
                  answered, and the sign-off decision recorded with its date.
                </p>
              </Step>
              <Step n={8} title="Evidence your research and close the task">
                <p>
                  The research submission gate: work the required methods, cite real sources, name the
                  organisation, sign the declaration. The register lands in My Learnings, A.5.9 and A.5.12 tick
                  up on your standards coverage, and the Process Mapping Specialist badge unlocks.
                </p>
              </Step>
              <div className="flex gap-4">
                <div className="shrink-0 w-7 grid place-items-center">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">Ten activities, a couple of sittings</h4>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1">
                    Most of it reading and deciding, not typing. Gather → record → classify → verify → flag →
                    review → sign off is the shape of nearly every task in every track. Once you have worked one,
                    you know how to work all of them.
                  </p>
                </div>
              </div>
            </div>
          </Sec>

          <Sec
            id="method"
            title="Vocabulary"
            icon="grid"
            lead="Every activity in every track is one of these 22 actions. They are the vocabulary of the profession — by the end you will have practised all of them, and your CV shows which."
          >
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {VERB_LIST.map((v) => {
                const tone = VERB_TONES[v.color] ?? VERB_TONES.indigo;
                return (
                  <div key={v.id} className="rounded-xl bg-white ring-1 ring-slate-200 p-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ring-1 text-[10px] font-semibold ${tone.bg} ${tone.text} ${tone.ring}`}>
                        {v.code}
                      </span>
                      <span className="text-[13px] font-semibold tracking-tight text-slate-900">{v.label}</span>
                      <span className="ml-auto text-[11px] tabular-nums text-slate-300">{v.num}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight mt-1.5" style={{ textWrap: "pretty" }}>{v.when}</p>
                  </div>
                );
              })}
            </div>
          </Sec>

          <Sec
            id="grading"
            title="How you are graded"
            icon="bullseye"
            lead="Two layers, in order. Layer 1 is pass/fail and mechanical. Layer 2 is judgement, and it is where your score comes from."
          >
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600"><Icon name="checkSquare" size={15} /></span>
                  <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">Layer 1 — deterministic checks</h4>
                </div>
                <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-2">
                  Automatic, objective and unarguable: mandatory fields populated, schema conformance, owners
                  named as roles rather than departments, arithmetic that re-computes, citations present.
                  Failing one blocks the submission and tells you exactly what to fix. These are free marks —
                  never lose them.
                </p>
                <p className="text-[12px] text-slate-500 leading-relaxed tracking-tight mt-2">
                  Each verb card in the workspace lists its own Layer 1 checks. Read them before you submit.
                </p>
              </div>
              <div className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-violet-50 text-violet-600"><Icon name="sliders" size={15} /></span>
                  <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">Layer 2 — rubric scoring</h4>
                </div>
                <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-2">
                  Your AI mentor reads the substance of the answer and scores it against the dimensions the
                  verb calls for, with written justification for each:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {RUBRIC.map((d) => (
                    <span key={d} className="inline-flex items-center px-2.5 h-7 rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-200/70 text-[11.5px] font-medium tracking-tight">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Bullets
                items={[
                  "Feedback is Socratic — expect questions that push you to justify a decision rather than a corrected answer handed to you.",
                  "Resubmission is allowed and expected. Review activities cap revisions at three, so address the feedback properly the first time.",
                  "Your rolling rubric averages appear on the dashboard and in Reports, so you can see which dimension is dragging you down.",
                ]}
              />
            </div>
          </Sec>

          <Sec
            id="answers"
            title="What a good answer looks like"
            icon="edit"
            lead="The same asset, entered two ways. Both are legible English; only one passes. Read these three pairs and you will understand the grading better than any description of it."
          >
            <div className="space-y-3">
              {[
                {
                  q: "Owner of the customer accounts database",
                  bad: "Engineering team",
                  good: "Platform Engineering Lead",
                  why: "A department cannot be held accountable and cannot sign anything. Layer 1 rejects departmental owners outright — this is a hard fail, not a deduction.",
                },
                {
                  q: "Classification of the support ticket system",
                  bad: "Confidential — it's sensitive.",
                  good: "Confidential — customers attach documents containing personal data, and rule 1 of CloudTech's scheme puts any asset holding customer personal data at minimum Confidential.",
                  why: "Same verdict, but the second one shows the rule was applied rather than guessed. Reasoning Quality and Standards Alignment are both graded here; \"it's sensitive\" earns neither.",
                },
                {
                  q: "The unaccounted-for database backup on an engineer's laptop",
                  bad: "Unknown — needs investigation.",
                  good: "Flagged as a remediation gap: unmanaged .sql dump on an unencrypted endpoint, contents and provenance unknown. Proposed action — Platform Engineering Lead to identify contents within 5 working days, then either bring it under the register with a classification or securely destroy it.",
                  why: "Noticing the problem is half a mark. Naming what is wrong, who owns fixing it and what \"fixed\" means is the whole one — and it is exactly what the Identify verb's Layer 1 checks demand.",
                },
              ].map((r) => (
                <div key={r.q} className="rounded-xl bg-white ring-1 ring-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">{r.q}</p>
                  </div>
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-rose-600">
                        <Icon name="xCircle" size={14} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.09em]">Weak</span>
                      </div>
                      <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1.5" style={{ textWrap: "pretty" }}>{r.bad}</p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <Icon name="checkCircle" size={14} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.09em]">Strong</span>
                      </div>
                      <p className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight mt-1.5" style={{ textWrap: "pretty" }}>{r.good}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-indigo-50/50 border-t border-indigo-100/70 flex gap-2.5">
                    <Icon name="lightbulb" size={14} className="shrink-0 mt-px text-indigo-500" />
                    <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{r.why}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Note>
                The pattern across all three: <span className="font-semibold">decision + the rule you applied + who owns what happens next</span>.
                Almost every rubric point in this platform comes from writing those three things instead of just the first.
              </Note>
            </div>
          </Sec>

          <Sec
            id="outputs"
            title="What your work turns into"
            icon="trophy"
            lead="Nothing you submit is thrown away. Completed, graded work compiles itself into the artefacts you will actually show an employer — you never write any of this by hand."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: "layers" as IconName, t: "My Learnings", d: "Every organisation, project, task and deliverable you have completed, with its status and score.", href: "/app/learnings" },
                { icon: "star" as IconName, t: "Badges", d: "Earned for milestones — verbs practised, standards covered, tasks and tracks completed.", href: "/app/badges" },
                { icon: "ribbon" as IconName, t: "Certificate", d: "Issued on track completion and independently verifiable by a third party from its code.", href: "/app/certificate" },
                { icon: "file" as IconName, t: "My CV", d: "Auto-compiled from graded work: engagements, deliverables, standards and the verbs you have practised.", href: "/app/cv" },
              ].map((c) => (
                <Link key={c.t} href={c.href} className="group rounded-xl bg-white ring-1 ring-slate-200 p-4 no-underline hover:ring-indigo-300 hover:shadow-[0_10px_30px_-18px_rgba(15,23,42,0.4)] transition-all">
                  <div className="flex items-center gap-2">
                    <Icon name={c.icon} size={16} className="text-indigo-500" />
                    <h4 className="text-[13px] font-semibold tracking-tight text-slate-900">{c.t}</h4>
                    <Icon name="arrowUpRight" size={14} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight mt-1.5" style={{ textWrap: "pretty" }}>{c.d}</p>
                </Link>
              ))}
            </div>
          </Sec>

          <Sec
            id="access"
            title="How long you have access"
            icon="calendar"
            lead="The programme is 16 weeks of work, but your access stays open for 24 weeks from the start date you pick — an 8-week cushion for leave, revisions, and life. It's self-paced within that window."
          >
            <div className="mb-3"><AccessChip variant="light" /></div>
            <Bullets
              items={[
                <><strong>24 weeks from day one.</strong> Your access runs until the date shown above (and on your dashboard and Billing page). Only <em>submitting new work</em> is time-boxed.</>,
                <><strong>Your finished work never expires.</strong> Your certificate, CV, badges and completed deliverables stay viewable and shareable for life — even after the work window closes.</>,
                <><strong>Need more time? Share your progress.</strong> Post a badge or certificate on LinkedIn, then paste the link on the <Link href="/app/badges" className="text-indigo-600 no-underline hover:underline">Badges</Link> or <Link href="/app/certificate" className="text-indigo-600 no-underline hover:underline">Certificate</Link> page to add <strong>4 weeks</strong>. One-time.</>,
              ]}
            />
            <Note>
              If your window closes before you finish, you can still open and read everything — you just can&apos;t submit until you extend it by sharing on LinkedIn.
            </Note>
          </Sec>

          <Sec id="around" title="Finding your way around" icon="home" lead="What each item in the left-hand menu is for.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 divide-y divide-slate-100">
              {[
                { icon: "home" as IconName, t: "Dashboard", d: "Your progress at a glance and the Continue card that jumps straight to your next activity." },
                { icon: "desk" as IconName, t: "Working Desk", d: "Where you execute activities. You will spend most of your time here." },
                { icon: "calendar" as IconName, t: "Calendar", d: "Scheduled stakeholder sessions and task deadlines from your engagements." },
                { icon: "layers" as IconName, t: "My Learnings", d: "The full tree of organisations, projects, tasks and completed deliverables." },
                { icon: "shield" as IconName, t: "Standards", d: "The same work viewed by standard instead of by project — useful for seeing your coverage of a framework." },
                { icon: "settings" as IconName, t: "Account Settings", d: "In the avatar menu, top-right — profile, password and billing." },
                { icon: "help" as IconName, t: "User Guide", d: "This page. It stays in the menu — come back whenever something is unclear." },
              ].map((r) => (
                <div key={r.t} className="flex items-start gap-3 px-4 py-3">
                  <Icon name={r.icon} size={16} className="shrink-0 mt-0.5 text-slate-400" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold tracking-tight text-slate-900">{r.t}</div>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-0.5">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-3">
              Individual task and activity screens have their own short walkthrough — look for the guide
              button in the header when you land on one for the first time.
            </p>
          </Sec>

          <Sec
            id="first"
            title="Your first session"
            icon="rocket"
            lead="Do these five things, in this order, and you will have your first graded deliverable behind you."
          >
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title="Open the Working Desk and read the task brief">
                <p>
                  Do not start filling anything in. Read the objective, the deliverable description and the
                  controls it maps to. Ten minutes here saves an hour of rework.
                </p>
              </Step>
              <Step n={2} title="Open the Organisation Context panel">
                <p>
                  Learn who CloudTech is — industry, regulator, what they sell, what data they hold. Every answer
                  you write should be recognisably about this company and no other.
                </p>
              </Step>
              <Step n={3} title="Read every reference document before you type">
                <p>
                  The intake notes and the classification scheme contain the facts and the rules. They are not
                  optional background; the task is not answerable without them.
                </p>
              </Step>
              <Step n={4} title="Work one activity, checklist visible">
                <p>
                  The acceptance criteria tick off live as you type. Aim for all green before you submit — a
                  submission with red checks is a submission you already know will come back.
                </p>
              </Step>
              <Step n={5} title="Submit, read the feedback properly, resubmit">
                <p>
                  Feedback arrives immediately. Expect questions rather than corrections — that is the point.
                  Answer what was actually asked; resubmitting the same reasoning in new words is the most
                  common way people burn their three revisions.
                </p>
              </Step>
              <div className="flex gap-4">
                <div className="shrink-0 w-7 grid place-items-center">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/70">
                    <Icon name="clock" size={14} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13.5px] font-semibold tracking-tight text-slate-900">Work in task-sized sittings</h4>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1">
                    Tasks are designed to be finished in one or two sessions. Drafts save as you go, but
                    stopping halfway through a register means re-reading the source material to pick it back up.
                  </p>
                </div>
              </div>
            </div>
          </Sec>

          <Sec id="tips" title="Getting a good grade" icon="lightbulb" lead="The habits that separate a pass from a distinction. None of them take longer — they just take intent.">
            <Bullets
              items={[
                "Name names. A real system, a real role, this organisation's real regulator. \"Relevant stakeholders\" scores nothing; \"the Head of IT Operations\" scores.",
                "Assign owners as roles, never departments. \"IT\" is not accountable; \"IT Service Manager\" is.",
                "Justify every judgement. Any rating, ranking, classification or score needs a one-line rationale — several Layer 1 checks fail without one.",
                "Cite the standard, clause or control you are relying on. Standards Alignment is graded on every technical verb.",
                "Reuse your own earlier artefacts. Later tasks expect consistency with the register you built three activities ago — contradicting yourself is caught.",
                "Do the readiness gate properly. Rushing it is why people then produce a register they cannot defend.",
                "Write for the audience the verb names. A Brief for a non-technical board is not the same document as an Assess for an auditor.",
                "Read the Layer 1 checklist before submitting. It is published up front — failing it is an unforced error.",
              ]}
            />
          </Sec>

          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">That is everything you need to start</h3>
              <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1" style={{ textWrap: "pretty" }}>
                Your first organisation is waiting. Open the Working Desk and clear the readiness gate on task one.
              </p>
            </div>
            <Link
              href="/app/desk"
              className="focus-ring shrink-0 inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white text-[13.5px] font-semibold tracking-tight no-underline shadow-[0_8px_24px_-10px_rgba(217,70,239,0.8)] transition-colors"
            >
              Start working <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
