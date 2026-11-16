import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionHead } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Nav, SiteFooter } from "@/components/landing/chrome";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Work with us — grcmentor Assessment Board",
  description:
    "Join the grcmentor Assessment Board: practitioners who decide mentee submissions at the 70 review gates for their NICE work role. Remote, asynchronous, around ten minutes a decision.",
};

// Reviewer positions, each mapped to the NICE work role it reviews against, with the review load
// one mentee generates for it across a full 35-task rotation.
//
// This list mirrors ROLES in backend/app/seed/build_gates.py, which is the canonical vocabulary a
// mentor account is validated against — keep the titles and NICE codes identical or an approved
// applicant cannot be given the role they applied for. Load figures are derived from the gate
// register (backend/_seed/grc101_gates.json); see docs/MENTOR_REVIEW.md.
export const ROLES: { title: string; code: string; niceTitle: string; duty: string; gates: string; reviewed: string }[] = [
  { title: "GRC Programme Manager", code: "OG-PMA-001", niceTitle: "Cybersecurity Program Manager", gates: "18 gates · 9 tasks", reviewed: "11", duty: "Owns programme roadmaps, charters, resourcing and delivery governance." },
  { title: "Compliance Manager", code: "OG-AUD-001", niceTitle: "Compliance Manager", gates: "10 gates · 5 tasks", reviewed: "6", duty: "Owns regulatory obligations, control mapping and compliance status reporting; runs internal compliance assessments." },
  { title: "Internal Audit Lead", code: "OG-AUD-002", niceTitle: "Information Security Auditor", gates: "10 gates · 5 tasks", reviewed: "5", duty: "Plans and performs control testing; owns workpaper standards, evidence quality and audit readiness." },
  { title: "Policy & Governance Analyst", code: "OG-PLA-001", niceTitle: "Policy & Governance Analyst", gates: "8 gates · 4 tasks", reviewed: "5", duty: "Drafts, reviews and publishes cybersecurity and data-privacy policy; owns the policy register and the governance document set." },
  { title: "Privacy Compliance Analyst", code: "OG-PRI-002", niceTitle: "Privacy Compliance Analyst", gates: "6 gates · 3 tasks", reviewed: "3", duty: "Owns the record of processing, DPIA screening, lawful basis and the privacy notice — the gates where a wrong call is a statutory one." },
  { title: "Cyber Risk Manager", code: "OG-RIS-001", niceTitle: "Cyber Risk Manager", gates: "6 gates · 3 tasks", reviewed: "3", duty: "Owns the risk framework, scoring anchors, treatment decisions and the risk register review cycle." },
  { title: "Business Continuity Coordinator", code: "OG-MAP-001", niceTitle: "Business Continuity & Resilience Analyst", gates: "4 gates · 2 tasks", reviewed: "3", duty: "Owns business impact analysis, RTO/RPO determination and ICT continuity documentation." },
  { title: "Security Awareness Lead", code: "OG-CUR-001", niceTitle: "Security Awareness & Training Specialist", gates: "4 gates · 2 tasks", reviewed: "2", duty: "Owns awareness content, delivery quality, knowledge assessment and training evidence." },
  { title: "Third-Party Risk Analyst", code: "OG-SCRM-001", niceTitle: "Vendor / Third-Party Risk Analyst", gates: "4 gates · 2 tasks", reviewed: "2", duty: "Owns supplier assessment, sub-processor governance and third-party contractual security terms." },
];

const DUTIES: { icon: IconName; title: string; body: string }[] = [
  { icon: "file", title: "Read the artefact", body: "Registers, policies, procedures, DPIAs, audit workpapers and continuity plans — the real deliverable, rendered in full on one screen." },
  { icon: "checkSquare", title: "Decide, don't write an essay", body: "Approve or disapprove and pick from reason codes written for that specific gate. A free-text note is available and never required." },
  { icon: "gauge", title: "Judge what an agent cannot", body: "The AI grader has already checked the work is complete, consistent and cited. You judge whether the determination is one you would defend to a regulator or a board." },
];

const CHIPS = ["Remote & asynchronous", "~10 minutes per decision", "Two working days to respond"];

const REQUIREMENTS = [
  "Minimum three years in the discipline you apply to review.",
  "A LinkedIn profile we can match to your stated experience.",
  "Capacity for roughly five decisions a month, carrying no more than two mentees at a time.",
  "Independence: you will not review anyone you line-manage, and you disclose any work of your own that a submission touches.",
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)" }} />
        <div className="absolute -top-24 left-1/3 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)" }} />
        <div className="absolute top-10 right-10 w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.14), transparent 70%)" }} />
      </div>
      <div className="relative max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white ring-1 ring-slate-200/70 text-[12px] font-medium text-slate-600 tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Now recruiting reviewers
        </div>
        <h1 className="mt-5 text-[36px] md:text-[52px] font-semibold tracking-[-0.035em] text-slate-900 leading-[1.06] max-w-3xl mx-auto" style={{ textWrap: "balance" }}>
          Join the <span className="text-indigo-600">Assessment Board</span> and grade the next generation of GRC.
        </h1>
        <p className="mt-5 text-[16px] md:text-[17px] text-slate-500 leading-relaxed tracking-tight max-w-2xl mx-auto" style={{ textWrap: "pretty" }}>
          An agent can check that an artefact is complete, consistent and correctly cited. It cannot judge whether a determination is one a competent professional would defend in front of a regulator. That judgement is what the board is for — and it is a decision with a reason code, not a report to write.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
          <a href="#apply" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_8px_24px_-8px_rgba(79,70,229,0.7)]">
            Apply to review <Icon name="arrowRight" size={15} />
          </a>
          <a href="#positions" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white ring-1 ring-slate-200/70 text-slate-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-slate-50 transition-colors">
            See open positions
          </a>
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {CHIPS.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200/70 text-[13px] font-medium text-slate-700 tracking-tight shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatTheBoardDoes() {
  return (
    <section className="relative overflow-hidden border-y border-white/5" style={{ background: "linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #0b1120 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }} />
      <div className="relative max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
        <SectionHead dark eyebrow="What the board does" icon="clipboard" sub="Mentees complete simulated enterprise engagements inside our application, and an AI grader scores every step. You are pulled in at the 70 steps out of 280 where a determination is inherited by everything after it, or where the artefact stops being an exercise and goes out as real.">
          Review real submissions, <span className="text-indigo-400">not exam papers</span>
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {DUTIES.map((d, i) => (
            <StaggerItem key={d.title} className="relative rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-400/30">
              <span className="absolute top-5 right-6 font-mono text-[13px] font-semibold tabular-nums text-white/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-white/15 bg-white/10 text-indigo-200">
                <Icon name={d.icon} size={20} />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-white">{d.title}</h3>
              <p className="mt-2 text-[13px] text-slate-400 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{d.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Positions() {
  return (
    <section id="positions" className="scroll-mt-16 bg-white">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
        <SectionHead eyebrow="Open positions" icon="briefcase" sub="Each reviewer role maps to a NICE work role. Apply for the one your day job qualifies you to judge — the load shown is what a single mentee generates for that seat across a full 35-task rotation.">
          Reviewer <span className="text-indigo-600">roles</span>
        </SectionHead>
        <div className="mt-10 rounded-2xl ring-1 ring-slate-200/70 overflow-hidden shadow-card">
          <div className="hidden md:grid grid-cols-[1.1fr_0.5fr_0.7fr_1.6fr] gap-6 px-6 py-3.5 bg-slate-900 text-white text-[11px] font-semibold tracking-[0.08em] uppercase">
            <div>Reviewer role</div>
            <div>NICE work role</div>
            <div>Gates per rotation</div>
            <div>Responsibility that qualifies them</div>
          </div>
          {ROLES.map((r) => (
            <div key={r.code} className="grid md:grid-cols-[1.1fr_0.5fr_0.7fr_1.6fr] gap-1.5 md:gap-6 px-6 py-4 bg-white border-t border-slate-100 first:border-t-0 md:first:border-t md:items-start hover:bg-slate-50/70 transition-colors">
              <div className="text-[14px] font-semibold tracking-tight text-slate-900 leading-snug">{r.title}</div>
              <div className="font-mono text-[12px] text-indigo-600 md:pt-0.5">{r.code}</div>
              <div className="md:pt-0.5">
                <div className="text-[12.5px] font-medium text-slate-700 tracking-tight">{r.gates}</div>
                <div className="text-[11.5px] text-slate-400 tracking-tight">{r.reviewed} reach a reviewer</div>
              </div>
              <div className="text-[13px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{r.duty}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-slate-500 tracking-tight">
          All positions are voluntary board appointments, reviewed every 12 months. Every gate has a
          single reviewer — the role best placed to judge that particular determination — so a DPIA,
          a retention decision or an incident procedure goes to the specialist rather than to the
          analyst who owns the rest of the task. You may hold more than one seat.
        </p>
      </div>
    </section>
  );
}

function Apply() {
  return (
    <section id="apply" className="scroll-mt-16 bg-[#F4F5F8] border-t border-slate-200/60">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
        <div>
          <SectionHead center={false} eyebrow="Application" icon="send" sub="Tell us who you are and which reviewer position you want. We verify your background against the work role, then you decide five archived submissions with known outcomes as a calibration set before your first live card.">
            Apply to join the <span className="text-indigo-600">board</span>
          </SectionHead>
          <div className="mt-7 flex flex-col gap-3">
            {REQUIREMENTS.map((req) => (
              <div key={req} className="flex gap-2.5 items-start">
                <span className="mt-0.5 text-emerald-500 shrink-0"><Icon name="checkCircle" size={16} /></span>
                <span className="text-[13.5px] text-slate-600 leading-relaxed tracking-tight">{req}</span>
              </div>
            ))}
          </div>
        </div>
        <ApplyForm roles={ROLES.map((r) => ({ title: r.title, code: r.code }))} />
      </div>
    </section>
  );
}

export default function WorkWithUsPage() {
  return (
    <div className="site-zoom min-h-screen bg-[#FAFAF7]">
      <Nav active="/work-with-us" />
      <Hero />
      <WhatTheBoardDoes />
      <Positions />
      <Apply />
      <SiteFooter />
    </div>
  );
}
