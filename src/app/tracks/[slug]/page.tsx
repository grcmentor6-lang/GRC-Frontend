import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo, SectionHead } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { LRN_CHIP } from "@/lib/tones";

// ============ COURSE CONTENT ============
interface Engagement { code: string; title: string; org: string; standard: string; tone: string; body: string }
interface Outcome { icon: IconName; title: string; body: string }
interface Course {
  slug: string;
  code: string;
  title: string;
  role: string;
  available: boolean;
  tagline: string;
  /** Short teaser shown on the "coming soon" screen for unreleased tracks. */
  teaser: string;
  overview?: string;
  level?: string;
  learn?: string[];
  engagements?: Engagement[];
  standards?: string[];
  outcomes?: Outcome[];
  forWho?: string;
}

const COURSES: Record<string, Course> = {
  "grc-101": {
    slug: "grc-101",
    code: "GRC 101",
    title: "Foundations",
    role: "GRC Analyst · 0–2 years",
    available: true,
    tagline: "Learn governance, risk and compliance by doing the actual work: one simulated ISO/IEC 27001 engagement, checked automatically against answer keys, with no human mentor review.",
    teaser: "",
    overview:
      "GRC 101 takes you from zero to job-ready through one simulated enterprise engagement: you join the GRC team at GlobalConnect Customer Solutions in Manila, a call-centre operator, for 12 weeks and 25 tasks, with worked examples from LearnTech Amsterdam. You don't watch lectures. You do the work of an ISO/IEC 27001 implementation team: scope and gap analysis, risk assessment and treatment, the Statement of Applicability, control testing, internal audit and certification readiness. Every step is checked automatically against answer keys held on the server, and six checkpoints (HC1 to HC6) check a fortnight's work the same way. No person grades or reviews your work.",
    level: "Beginner · no prior experience",
    learn: [
      "Write the ISMS scope and rate the requirements of ISO/IEC 27001 clauses 4 to 10 against what an office actually does.",
      "Assess risks, choose treatments and complete the Statement of Applicability for all 93 Annex A controls.",
      "Run control sprints: test evidence for individual controls and record gaps with a next action and an owner.",
      "Make practitioner decisions where more than one answer is defensible, and see the reasoning for each option.",
      "Plan an internal audit, write nonconformity reports and prepare a management review.",
      "Get ready for the Stage 1 and Stage 2 certification audits and answer the auditor's requests.",
    ],
    engagements: [
      {
        code: "Weeks 1–2",
        title: "Foundation: the ISMS, its context and the baseline gap",
        org: "GlobalConnect Manila · 5 tasks",
        standard: "ISO/IEC 27001",
        tone: "indigo",
        body: "Onboard to the programme, learn the ISO/IEC 27000 family and the ISMS cycle, write the scope and process list, and rate clauses 4 to 10 in a baseline gap analysis.",
      },
      {
        code: "Weeks 3–6",
        title: "Policy, roles, risk, the SoA and support",
        org: "GlobalConnect Manila · 8 tasks",
        standard: "Clauses 5 to 7",
        tone: "emerald",
        body: "Check the information security policy, assign roles, set the risk method and treat the risks, complete the Statement of Applicability, and cover competence, awareness and documented information.",
      },
      {
        code: "Weeks 7–12",
        title: "Controls, audit and certification readiness",
        org: "GlobalConnect Manila, with LearnTech worked examples · 12 tasks",
        standard: "Clauses 8 to 10",
        tone: "amber",
        body: "Test access, supplier, incident, physical, technical and change controls in control sprints, measure performance, run the internal audit, hold the management review and prepare for the certification audit.",
      },
    ],
    standards: ["ISO/IEC 27001:2022 (the whole of GRC 101)", "Other standards come in GRC 301 and GRC 501"],
    outcomes: [
      { icon: "file", title: "A real CV", body: "Every completed task compiles into a structured, evidence-backed CV section recruiters can verify." },
      { icon: "ribbon", title: "Credential badges", body: "Earn credential badges as you complete each method category of the track." },
      { icon: "shield", title: "Verifiable certificate", body: "Finish the track to unlock a GRC 101 certificate with a verifiable public link." },
      { icon: "briefcase", title: "Job matches", body: "Completed work maps to real GRC role requirements and surfaces matching jobs." },
    ],
    forWho:
      "Career changers and early-career professionals (0–2 years) targeting a GRC Analyst role. No prior experience or certifications required — the track starts from the foundations.",
  },
  "grc-301": {
    slug: "grc-301",
    code: "GRC 301",
    title: "Advanced",
    role: "GRC Specialist · 2–4 years",
    available: false,
    tagline: "",
    teaser:
      "Lead risk assessments and assurance engagements across frameworks, manage third-party risk, and drive remediation to closure. GRC 301 builds directly on the work you complete in GRC 101.",
  },
  "grc-501": {
    slug: "grc-501",
    code: "GRC 501",
    title: "Leadership",
    role: "GRC Leader · 5+ years",
    available: false,
    tagline: "",
    teaser:
      "Set GRC strategy, design the operating model, and report risk posture to the board and executive leadership. GRC 501 is the capstone leadership track of the programme.",
  },
};

export function generateStaticParams() {
  return Object.keys(COURSES).map((slug) => ({ slug }));
}

function CourseHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF7]/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2.5">
          <Link href="/#tracks" className="hidden sm:inline-flex items-center gap-1.5 text-[13.5px] font-medium text-slate-600 hover:text-slate-900 tracking-tight no-underline">
            <Icon name="chevronLeft" size={15} /> All tracks
          </Link>
          <Link href="/signin" className="hidden sm:inline text-[13.5px] font-medium text-slate-600 hover:text-slate-900 tracking-tight no-underline">
            Sign in
          </Link>
          <Link href="/signup" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
            Get started <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function ComingSoon({ course }: { course: Course }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #0b1120 100%)" }}>
      <div className="pointer-events-none absolute -top-24 left-1/3 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" }} />
      <div className="relative max-w-[760px] mx-auto px-6 py-28 text-center">
        <span className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white/10 ring-1 ring-white/15 text-[12px] font-medium text-indigo-100 tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Coming soon
        </span>
        <div className="mt-6 font-mono text-[12px] tracking-wide text-indigo-200">{course.title} · {course.role}</div>
        <h1 className="mt-2 text-[44px] md:text-[56px] font-semibold tracking-[-0.035em] text-white leading-[1.02]">{course.code}</h1>
        <p className="mt-5 text-[16px] text-indigo-100/85 leading-relaxed tracking-tight max-w-xl mx-auto" style={{ textWrap: "pretty" }}>{course.teaser}</p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/tracks/grc-101" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-indigo-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors">
            Start with GRC 101 <Icon name="arrowRight" size={15} />
          </Link>
          <Link href="/#tracks" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white/10 ring-1 ring-white/15 text-white text-[14px] font-semibold tracking-tight no-underline hover:bg-white/15 transition-colors">
            Back to tracks
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = COURSES[slug];
  if (!course) notFound();

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <CourseHeader />

      {!course.available ? (
        <ComingSoon course={course} />
      ) : (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden" style={{ background: "linear-gradient(165deg, #312e81 0%, #1e1b3a 55%, #0f172a 100%)" }}>
            <div className="pointer-events-none absolute -top-16 -right-10 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)" }} />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="relative max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 pt-16 pb-20">
              <span className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white/10 ring-1 ring-white/15 text-[12px] font-medium text-indigo-100 tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available now · {course.role}
              </span>
              <h1 className="mt-5 text-[42px] md:text-[58px] font-semibold tracking-[-0.035em] text-white leading-[1.02]">
                {course.code} <span className="text-indigo-300">{course.title}</span>
              </h1>
              <p className="mt-5 text-[16px] md:text-[17px] text-indigo-100/85 leading-relaxed tracking-tight max-w-2xl" style={{ textWrap: "pretty" }}>{course.tagline}</p>
              <div className="mt-7 flex items-center gap-3 flex-wrap">
                <Link href="/signup" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-indigo-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
                  Start {course.code} <Icon name="arrowRight" size={15} />
                </Link>
                {course.level && (
                  <span className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white/10 ring-1 ring-white/15 text-indigo-100 text-[13px] font-medium tracking-tight">
                    <Icon name="user" size={15} /> {course.level}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Overview + what you'll learn */}
          <section className="bg-white border-b border-slate-200/60">
            <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-2">
                <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase text-indigo-600"><Icon name="info" size={14} /> About this course</div>
                <p className="mt-3 text-[15px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{course.overview}</p>
              </div>
              <div className="lg:col-span-3">
                <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase text-indigo-600"><Icon name="target" size={14} /> What you&apos;ll learn</div>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {course.learn?.map((l) => (
                    <li key={l} className="flex gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-50 ring-1 ring-emerald-100 text-emerald-600 flex items-center justify-center mt-0.5"><Icon name="check" size={12} strokeWidth={3} /></span>
                      <span className="text-[13.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Inside the course — engagements */}
          <section className="bg-[#FAFAF7]">
            <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
              <SectionHead eyebrow="Curriculum" icon="layers" sub="One simulated engagement in three stages, 25 tasks in all, every step checked automatically against answer keys.">
                Inside the <span className="text-indigo-600">course</span>
              </SectionHead>
              <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {course.engagements?.map((e, idx) => (
                  <StaggerItem key={e.code} className="bg-white rounded-2xl ring-1 ring-slate-200/70 p-6 flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_30px_-18px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold tracking-wide text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{e.code}</span>
                      <span className="text-[11px] font-semibold text-slate-300 tabular-nums">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-3 text-[15.5px] font-semibold tracking-tight text-slate-900 leading-snug">{e.title}</h3>
                    <div className="text-[11.5px] text-slate-400 tracking-tight mt-1">{e.org}</div>
                    <p className="mt-3 text-[13px] text-slate-600 leading-relaxed tracking-tight flex-1" style={{ textWrap: "pretty" }}>{e.body}</p>
                    <span className={`self-start mt-4 inline-flex items-center px-2 h-6 rounded-full text-[11px] font-semibold tracking-tight ring-1 ${LRN_CHIP[e.tone] ?? LRN_CHIP.indigo}`}>{e.standard}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>

          {/* What you'll get */}
          <section className="bg-white border-y border-slate-200/60">
            <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
              <SectionHead eyebrow="Outcomes" icon="rocket" sub="Everything you complete turns into proof of capability you can show employers.">
                What you&apos;ll <span className="text-indigo-600">walk away with</span>
              </SectionHead>
              <Stagger className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {course.outcomes?.map((o) => (
                  <StaggerItem key={o.title} className="rounded-2xl ring-1 ring-slate-200/70 p-6 bg-gradient-to-br from-indigo-50/50 to-transparent">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center ring-1 bg-white text-indigo-600 ring-indigo-100"><Icon name={o.icon} size={20} /></span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-slate-900">{o.title}</h3>
                    <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{o.body}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>

          {/* Standards + who it's for */}
          <section className="bg-[#FAFAF7]">
            <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase text-indigo-600"><Icon name="shield" size={14} /> Standards you&apos;ll work with</div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {course.standards?.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white ring-1 ring-slate-200/70 text-[13px] font-medium text-slate-700 tracking-tight">
                      <Icon name="check" size={13} className="text-emerald-500" strokeWidth={3} /> {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase text-indigo-600"><Icon name="user" size={14} /> Who it&apos;s for</div>
                <p className="mt-4 text-[14.5px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{course.forWho}</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white border-t border-slate-200/60">
            <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-16">
              <div className="relative overflow-hidden rounded-3xl px-8 py-12 text-center text-white" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #5b53e8 45%, #7c3aed 100%)" }}>
                <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                <h2 className="relative text-[26px] md:text-[32px] font-semibold tracking-[-0.02em]">Ready to start {course.code}?</h2>
                <p className="relative mt-2 text-[14.5px] text-indigo-100/90 max-w-lg mx-auto tracking-tight">Your first task takes minutes to begin — no prior experience needed.</p>
                <Link href="/signup" className="relative mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-indigo-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors">
                  Start {course.code} <Icon name="arrowRight" size={15} />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="bg-[#0b1120] text-slate-400">
        <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[12px]">grcmentor · GRC 101 → 301 → 501</span>
          <Link href="/#tracks" className="text-[12px] no-underline hover:text-slate-200">← Back to all tracks</Link>
        </div>
      </footer>
    </div>
  );
}
