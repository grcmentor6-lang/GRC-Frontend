"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { startWelcomeTour } from "@/components/app/welcome-tour";
import { AccessChip } from "@/components/app/access-chip";
import { DASH_NAV } from "@/components/app/nav";

type Section = { id: string; title: string; icon: IconName };

const SECTIONS: Section[] = [
  { id: "what", title: "What grcmentor is", icon: "sparkle" },
  { id: "shape", title: "How the programme is shaped", icon: "layers" },
  { id: "org", title: "The organisations you work for", icon: "briefcase" },
  { id: "task", title: "Anatomy of a task", icon: "clipboard" },
  { id: "desk", title: "Doing the work: the Working Desk", icon: "desk" },
  { id: "lab", title: "Tech Lab", icon: "bolt" },
  { id: "saving", title: "Your work is saved to your account", icon: "checkCircle" },
  { id: "example", title: "Your first task, step by step", icon: "play" },
  { id: "checking", title: "How your work is checked", icon: "bullseye" },
  { id: "outputs", title: "What your work turns into", icon: "trophy" },
  { id: "access", title: "How long you have access", icon: "calendar" },
  { id: "around", title: "Finding your way around", icon: "home" },
  { id: "first", title: "Your first session", icon: "rocket" },
  { id: "tips", title: "Doing it well", icon: "lightbulb" },
];

/** What each menu item is for. Keyed by nav id, so an item added to the menu without a line here is skipped, not invented. */
const MENU_HELP: Record<string, string> = {
  dashboard: "Your next desk step, your due dates and how far through the desk you are.",
  desk: "Where you do the work. You will spend most of your time here.",
  calendar: "The due date of every desk task, counted from your start date, with what is overdue.",
  submissions: "Every task and step you have completed on the desk, week by week.",
  library: "Every clause and control of the standards the programme uses, in plain terms, as graphics you can save and share.",
  badges: "The method badges your desk tasks earn.",
  certificate: "Your GRC 101 certificate and its verification link.",
  cv: "A CV compiled from your work.",
  career: "Career paths and what to work on next.",
  certification: "Professional certifications and how your work maps to them.",
  reports: "Your record as a report you can read or download.",
  jobs: "Job openings matched to your work.",
  guide: "This page. Come back whenever something is unclear.",
};

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

function Cards({ items }: { items: { t: string; d: string; icon?: IconName }[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((c) => (
        <div key={c.t} className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
          {c.icon && <Icon name={c.icon} size={17} className="text-indigo-500 mb-2.5" />}
          <h4 className="text-[13px] font-semibold tracking-tight text-slate-900">{c.t}</h4>
          <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight mt-1" style={{ textWrap: "pretty" }}>{c.d}</p>
        </div>
      ))}
    </div>
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
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-6 py-7 md:px-8 md:py-8 shadow-[0_20px_50px_-25px_rgba(99,102,241,0.8)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">User guide</p>
        <h1 className="text-[26px] md:text-[30px] font-semibold tracking-[-0.02em] mt-1.5">How grcmentor works</h1>
        <p className="text-[13.5px] text-white/85 leading-relaxed tracking-tight mt-2 max-w-[62ch]" style={{ textWrap: "pretty" }}>
          For twelve weeks you work in a simulated Group GRC Office, for two organisations, on real
          standards and real deliverables. Read this once, end to end: who you work for, how the Working
          Desk works, how your work is checked, and what to do on day one.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <button
            onClick={startWelcomeTour}
            className="focus-ring cursor-pointer inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight hover:bg-white/90 transition-colors"
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
          <Sec id="what" title="What grcmentor is" icon="sparkle" lead="Not a course you watch. A job you do. You join a Group GRC Office as a mentee, take tasks from named owners, and hand in the files a GRC team really produces.">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: "briefcase" as IconName, t: "You join a team", d: "Two simulated organisations, each with offices, regulators, policies, registers and people, and the standards that bind them." },
                { icon: "clipboard" as IconName, t: "You do the work", d: "Each week brings tasks: fill a register, map a framework, test a control, review access, write a procedure, decide what to do." },
                { icon: "trophy" as IconName, t: "It builds your record", d: "What you complete on the desk feeds My Submissions, your badges, your certificate and your CV." },
              ].map((c) => (
                <div key={c.t} className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                  <Icon name={c.icon} size={17} className="text-indigo-500" />
                  <h4 className="text-[13px] font-semibold tracking-tight text-slate-900 mt-2.5">{c.t}</h4>
                  <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight mt-1" style={{ textWrap: "pretty" }}>{c.d}</p>
                </div>
              ))}
            </div>
          </Sec>

          <Sec id="shape" title="How the programme is shaped" icon="layers" lead="GRC 101 is twelve weeks. Learn these four names: the desk and every page around it use them.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              {[
                { k: "Week", d: "Weeks 1 and 2 are Foundation (your rules, your organisation, classification and evidence). Weeks 3 to 12 are Practice, one GRC area each: obligations, policies, audit evidence, access reviews, risk, control testing, vendors, privacy, awareness, follow-up." },
                { k: "Task", d: "Two or three per week, coded by week: F1.1, F1.2, F1.3 in week 1, T3.1 and T3.2 in week 3. Each has an owner, an objective, key results, a due date and the files you hand in." },
                { k: "Step", d: "A task is a list of steps, done in order. Each step says what to do, which screen to do it in, and when it is done." },
                { k: "Submit", d: "When every step of a task is complete, Submit task seals it with the time. A sealed task cannot be changed." },
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
              You choose your start date the first time you open the desk. Every task&apos;s due date counts from
              it: week 1&apos;s tasks fall due in the first seven days, week 2&apos;s in the next seven, and so on. The
              desk, the Calendar and the bell all show the same dates.
            </p>
          </Sec>

          <Sec id="org" title="The organisations you work for" icon="briefcase" lead="Every task is answered for one specific organisation, sometimes both. Answers come from that organisation's facts, not from general knowledge.">
            <Cards
              items={[
                { t: "Where to read about them", d: "The organisation buttons in the header, the cards on your Dashboard, and Home › My Organisation on the desk." },
                { t: "What you will find", d: "Offices and where they are, what the organisation sells, its departments and systems, its regulators, and which standards are mandatory or optional for it." },
                { t: "Policies and records", d: "Policies › Policy Library holds the organisation's policies and standards; registers, evidence and risk screens hold its records. Steps tell you which ones to read." },
                { t: "People", d: "Every task has a named owner and supporters. Messages from them arrive in the Inbox at the step they belong to." },
              ]}
            />
          </Sec>

          <Sec id="task" title="Anatomy of a task" icon="clipboard" lead="Open a task on the desk and it reads top to bottom: why it matters, what done looks like, the steps, and submitting.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title="Objective and key results">
                <p>What the task is for, and the key results that say when it is done well (KR1, KR2 …). Each key result names the steps that deliver it.</p>
              </Step>
              <Step n={2} title="The steps">
                <p>Steps open one after another. A step tells you what to do, where (the screen to open from the toolbar) and when it is done. The kinds you will meet:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><span className="font-medium text-slate-700">Work in a file or screen</span>: copy values from a screen, fill a register&apos;s cells, write a short entry, name a file.</li>
                  <li><span className="font-medium text-slate-700">A decision</span>: a situation with options. Pick one and press Check my answer; the pick locks and you see the best option, why, and what happens with each.</li>
                  <li><span className="font-medium text-slate-700">A decision per row</span>: the same, for every row of a table, checked with Check my answers.</li>
                  <li><span className="font-medium text-slate-700">Reading</span>: read the screen and confirm each part you read.</li>
                </ul>
                <p>When a step is done, press Mark step complete and the next step opens.</p>
              </Step>
              <Step n={3} title="Submit the task">
                <p>The task&apos;s footer lists the files you hand in and counts the steps left. Once none are left, Submit task seals the task with the date and time.</p>
              </Step>
            </div>
          </Sec>

          <Sec id="desk" title="Doing the work: the Working Desk" icon="desk" lead="One screen holds the whole engagement: the weeks, the task in hand, and the organisation's systems.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title="The week panel">
                <p>On the left: the twelve weeks, each task with its steps done and its due date (&ldquo;Due in 3 days&rdquo;, &ldquo;Overdue by 1 day&rdquo;, &ldquo;Submitted&rdquo;). Arriving on the desk opens this week&apos;s overview.</p>
              </Step>
              <Step n={2} title="The toolbar">
                <p>Along the bottom: the organisation&apos;s systems, grouped as Home, Frameworks, Risk, Policies, Reg Watch, Learn, Evidence, and later Access, Testing, Vendors and Awareness, plus your Inbox. A section opens as you reach the tasks that use it.</p>
                <p>An <span className="font-medium text-slate-700">orange dot</span> marks where your current step needs you: the screen it is done in, and the screens it reads from. Inside a section, the screen for your step is tagged with the step number.</p>
              </Step>
              <Step n={3} title="Work and reading side by side">
                <p>Your step&apos;s own screen opens as the working window. Anything else you open, such as a policy or a register to read, opens as a window beside it that you can move and resize.</p>
              </Step>
              <Step n={4} title="Help on every step">
                <p>Each step has a short walk-through that runs the first time you open it; Show me how runs it again. Help with this step gives the plain-English note and the references the step relies on. Learn holds the rule tables, reference pages and a glossary.</p>
              </Step>
              <Step n={5} title="The Inbox">
                <p>Messages from the people in the task arrive at the step they belong to. When one is waiting for the task in hand, the Inbox carries the orange dot. Some ask you to choose a reply.</p>
              </Step>
            </div>
          </Sec>

          <Sec id="lab" title="Tech Lab" icon="bolt" lead="From week 6, five steps open a Tech Lab: a practice console of a simulated system, where you query the system yourself and record what you find.">
            <Cards
              items={[
                { t: "AppAdmin", d: "Admin and SSO review of a legal-matters system. Week 6, task T6.1." },
                { t: "NetShield", d: "Remote-admin exposure on a firewall. Week 8, task T8.2." },
                { t: "LedgerSim", d: "Vendor set-up and payments in finance. Week 9, task T9.2." },
                { t: "DataSentry", d: "Label and data-map coverage. Week 10, task T10.1." },
                { t: "LogLens", d: "Log-source coverage before a breach plan. Week 10, task T10.2." },
              ]}
            />
            <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-3">
              Each lab has parts to work through, findings to record and evidence captures (E1, E2 …) you can
              see under Evidence. Finish a lab before you submit its task and its findings go into that
              task&apos;s file. A lab does not stop you submitting.
            </p>
          </Sec>

          <Sec id="saving" title="Your work is saved to your account" icon="checkCircle" lead="Everything you do on the desk is saved to your account on our server as you work, not in your browser.">
            <Bullets
              items={[
                <>The desk header says <span className="font-medium text-slate-700">Saving…</span> while a change goes up and <span className="font-medium text-slate-700">Saved</span> once it has landed.</>,
                <>Sign in on any computer and your work is there. Clearing your browser does not lose it.</>,
                <>If the connection drops, a red note says <span className="font-medium text-slate-700">Not saved yet. Retrying, keep this tab open.</span> Leave the tab open until it clears; closing the tab asks first.</>,
                <>If your saved work cannot be loaded, the desk says so and offers Try again. It never opens an empty desk over your work.</>,
              ]}
            />
          </Sec>

          <Sec id="example" title="Your first task, step by step" icon="play" lead="Week 1 opens with F1.1, “Onboarding to the Group GRC Office”. Here is what it asks, so you know what the work feels like before you start.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title="Check the Assignment table of Onboarding record">
                <p>The programme office has filled in six values: each organisation&apos;s name and home office, the owner of task F1.2, and your start date. Check each against Home › My Organisation, correct any that differ, then press Check my answers.</p>
              </Step>
              <Step n={2} title="Two decisions about conduct">
                <p>A colleague asks for your login; you do not understand a rule. Pick what you would do and press Check my answer. The feedback tells you the best option and why for every option.</p>
              </Step>
              <Step n={3} title="The data rules and your undertaking">
                <p>Tick and save the four data and AI rules, then open and sign the undertaking with your full name, your mentee ID and a signature. Nothing touches data until you have signed.</p>
              </Step>
              <Step n={4} title="Folders and Week 1 dates">
                <p>After one more decision about a dataset, fill the Folders table with your four folder paths, then check the Week 1 dates table, the due dates of F1.2, F1.3 and the week 1 knowledge check, against Home › My plan.</p>
              </Step>
              <Step n={5} title="Name the file and hand it in">
                <p>Type the file name from its four parts, then Submit. You get a receipt with the time; the task is sealed and F1.2 is next.</p>
              </Step>
            </div>
          </Sec>

          <Sec id="checking" title="How your work is checked" icon="bullseye" lead="Most checking happens as you work, so you find out while you can still put it right.">
            <Bullets
              items={[
                <><span className="font-medium text-slate-700">Values you copy</span> are compared with the screen they come from, and a mismatch is flagged under its row.</>,
                <><span className="font-medium text-slate-700">Decisions</span> are checked the moment you press Check my answer. The pick then locks: read the feedback, it is the lesson.</>,
                <><span className="font-medium text-slate-700">Tables of decisions</span> are checked row by row with Check my answers, each row showing the right answer and the rule behind it.</>,
                <><span className="font-medium text-slate-700">Mark step complete</span> stays grey until a step&apos;s work is there, and says what is left.</>,
                <><span className="font-medium text-slate-700">Submitting</span> seals the task with the date and time. Scores for whole tasks are not shown in the app yet.</>,
              ]}
            />
            <div className="mt-3">
              <Note>Some options in a decision are reasonable and still not the best. Read why each option is right or wrong, not only whether you picked the best one.</Note>
            </div>
          </Sec>

          <Sec id="outputs" title="What your work turns into" icon="trophy" lead="You never write these by hand. They are built from what you complete on the desk.">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: "inbox" as IconName, t: "My Submissions", d: "Every task and step you have completed on the desk, week by week.", href: "/app/submissions" },
                { icon: "star" as IconName, t: "Badges", d: "Method badges earned by completing the desk tasks behind each one.", href: "/app/badges" },
                { icon: "ribbon" as IconName, t: "Certificate", d: "Your GRC 101 certificate, verifiable by anyone from its link.", href: "/app/certificate" },
                { icon: "file" as IconName, t: "My CV", d: "A CV compiled from the work you have done.", href: "/app/cv" },
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

          <Sec id="access" title="How long you have access" icon="calendar" lead="The programme is 12 weeks of work. Your access stays open for 24 weeks from the start date you pick, so there is room for catching up.">
            <div className="mb-3"><AccessChip variant="light" /></div>
            <Bullets
              items={[
                <><strong>24 weeks from your start date.</strong> Your access runs until the date shown above, which also appears on your Dashboard.</>,
                <><strong>Your finished work stays yours.</strong> Your certificate, CV and badges stay viewable and shareable after the window closes.</>,
                <><strong>Need more time? Share your progress.</strong> Post a badge or certificate on LinkedIn, then paste the link on the <Link href="/app/badges" className="text-indigo-600 no-underline hover:underline">Badges</Link> or <Link href="/app/certificate" className="text-indigo-600 no-underline hover:underline">Certificate</Link> page to add <strong>4 weeks</strong>. One time only.</>,
              ]}
            />
          </Sec>

          <Sec id="around" title="Finding your way around" icon="home" lead="What each item in the left-hand menu is for.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 divide-y divide-slate-100">
              {DASH_NAV.filter((n) => MENU_HELP[n.id]).map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3">
                  <Icon name={n.icon} size={16} className="shrink-0 mt-0.5 text-slate-400" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold tracking-tight text-slate-900">{n.label}</div>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-0.5">{MENU_HELP[n.id]}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 px-4 py-3">
                <Icon name="settings" size={16} className="shrink-0 mt-0.5 text-slate-400" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight text-slate-900">Account Settings</div>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-0.5">In the avatar menu, top right: your profile and password.</p>
                </div>
              </div>
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-3">
              The bell in the header lists desk tasks due in the next seven days and any that are overdue. Found
              a problem? The button at the bottom right sends us a note, the page and a screenshot.
            </p>
          </Sec>

          <Sec id="first" title="Your first session" icon="rocket" lead="Do these in order and you will have your first task submitted.">
            <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <Step n={1} title="Open the Working Desk and pick your start date">
                <p>The first time you open the desk it asks when your twelve weeks begin. Week 1 opens that day and every due date counts from it, so pick the day you will actually start.</p>
              </Step>
              <Step n={2} title="Let the desk walk you through">
                <p>The desk&apos;s own walk-through runs once. Then read week 1&apos;s overview: what the week is for and what you hand in.</p>
              </Step>
              <Step n={3} title="Read your organisation">
                <p>Open Home › My Organisation and read both organisations before you type anything. Step 1 of F1.1 copies from it.</p>
              </Step>
              <Step n={4} title="Work F1.1 step by step">
                <p>Follow the orange dot. Read each decision&apos;s feedback in full. Mark each step complete as you finish it.</p>
              </Step>
              <Step n={5} title="Submit, then check your Dashboard">
                <p>Submit task seals F1.1. Your Dashboard then points at F1.2, and the Calendar shows what is due next.</p>
              </Step>
            </div>
          </Sec>

          <Sec id="tips" title="Doing it well" icon="lightbulb" lead="The habits that separate careful work from guesswork.">
            <Bullets
              items={[
                "Read the screen the step names before you type. The facts are there, and copied values are checked against it.",
                "Use this organisation's names: its offices, systems, roles and regulators. \"Relevant stakeholders\" says nothing; \"the Compliance Manager\" does.",
                "Before a decision, find the policy or rule it rests on. The feedback will cite it.",
                "Watch your due dates on the week panel or the Calendar. Overdue tasks show in red.",
                "Work a task in one or two sittings. Your work is saved, but a register half done means re-reading its sources.",
                "Stuck? Use Show me how, then Help with this step. Still stuck? Report it with the button at the bottom right, naming the step (for example F1.1-4).",
              ]}
            />
          </Sec>

          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">That is everything you need to start</h3>
              <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-1" style={{ textWrap: "pretty" }}>
                Open the Working Desk, pick your start date, and begin F1.1.
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
