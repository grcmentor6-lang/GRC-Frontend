import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionHead } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Faq, type FaqEntry } from "@/components/landing/faq";
import { DeskDemo } from "@/components/landing/desk-demo";
import { CTA_HREF, Nav, SiteFooter } from "@/components/landing/chrome";
import { GLOW, SOFT_TONES } from "@/lib/tones";
import { WAITLIST_MODE } from "@/lib/flags";
import { FOUNDATION_PRICE } from "@/lib/billing";
import { INCEPTION_BADGE, PARENT_COMPANY } from "@/lib/inception";

// ============ CONTENT (ported from the mockup) ============
// Industry photos served straight from the Unsplash CDN (sized + cropped via query params).
const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`;
// `grc101`: the two sectors GRC 101's client organisations come from (desk catalogue `orgs`).
const INDUSTRIES: { label: string; icon: IconName; tone: string; image: string; grc101?: boolean }[] = [
  { label: "Technology & IT Services", icon: "cube", tone: "sky", image: UNSPLASH("photo-1518770660439-4636190af475") },
  { label: "Banking & Financial Services", icon: "briefcase", tone: "indigo", image: UNSPLASH("photo-1554224155-6726b3ff858f") },
  { label: "Healthcare & Life Sciences", icon: "shield", tone: "emerald", image: UNSPLASH("photo-1576091160550-2173dba999ef") },
  { label: "Business Process Outsourcing", icon: "refresh", tone: "violet", image: UNSPLASH("photo-1556761175-5973dc0f32e7"), grc101: true },
  { label: "Legal & Consulting Services", icon: "book", tone: "amber", image: UNSPLASH("photo-1589829545856-d10d557cf95f") },
  { label: "E-commerce & Retail", icon: "grid", tone: "rose", image: UNSPLASH("photo-1556742049-0cfed4f6a45d") },
  { label: "Manufacturing & Industrial", icon: "layers", tone: "sky", image: UNSPLASH("photo-1581091226825-a6a2a5aee158") },
  { label: "Government & Public Sector", icon: "flag", tone: "indigo", image: UNSPLASH("photo-1529107386315-e1a2ed48a620") },
  { label: "Transportation & Logistics", icon: "send", tone: "emerald", image: UNSPLASH("photo-1519003722824-194d4455a60c") },
  { label: "Education", icon: "book", tone: "violet", image: UNSPLASH("photo-1523240795612-9a054b0db644"), grc101: true },
  { label: "Media & Telecommunications", icon: "chat", tone: "amber", image: UNSPLASH("photo-1522071820081-009f0129c71c") },
  { label: "Energy & Utilities", icon: "bolt", tone: "rose", image: UNSPLASH("photo-1466611653911-95081537e5b7") },
];

// Every line here is a claim about the product as it ships: the Working Desk, 25 tasks / 255 steps over
// 12 weeks, scored against the answer key (backend/app/services/desk_record.py). Keep it that way.
const PROGRAM: { title: string; icon: IconName; tone: string; body: string }[] = [
  { title: "Real-world task experience", icon: "desk", tone: "indigo", body: "Join a Group GRC Office and work 25 tasks for two client organisations — real files, inboxes, registers and policies, not slides." },
  { title: "A 12-week working rhythm", icon: "calendar", tone: "violet", body: "Pick your start date and your plan sets a due date for every task, week by week, like a real engagement." },
  { title: "Decisions with no clean answer", icon: "target", tone: "emerald", body: "Make 120 practitioner calls on access, privacy, risk and evidence — and see which option a professional would back, and why." },
  { title: "Feedback on every step", icon: "history", tone: "amber", body: "Each check tells you what you got right and what you missed, and every submitted task is scored against a reviewed answer key." },
  { title: "Real, measurable impact", icon: "chart", tone: "rose", body: "Completed work compiles into a CV, credential badges and a verifiable certificate that proves capability." },
];

const TRACKS = [
  { code: "GRC 101", title: "Foundations", years: "GRC Analyst · 0–2 years", price: FOUNDATION_PRICE, body: "Maps control frameworks (e.g. NIST, ISO 27001) to business processes, conducts risk and compliance assessments, and helps prepare audit evidence." },
  { code: "GRC 301", title: "Advanced", years: "GRC Specialist · 2–4 years", price: null, body: "Leads risk assessments and assurance engagements across frameworks, manages third-party risk, and drives remediation to closure." },
  { code: "GRC 501", title: "Leadership", years: "GRC Leader · 5+ years", price: null, body: "Sets GRC strategy, designs the operating model, and reports risk posture to the board and executive leadership." },
];

const FAQS: FaqEntry[] = [
  { q: "Who is the GRC mentorship programme for?", a: "Anyone starting or growing a career in governance, risk and compliance — students, career-changers and early-career analysts who want hands-on, job-ready experience." },
  { q: "Do I need prior experience?", a: "No. GRC 101 starts from the foundations and assumes no background; the advanced tracks build on the work you complete." },
  { q: "How does the programme actually work?", a: "You join the Group GRC Office of a simulated company and work for two client organisations. Each task is a short set of steps — check a file, make a decision, fill in a register, answer an inbox message — and every step gives you feedback. Submitted tasks are scored against a reviewed answer key." },
  { q: "Which standards and frameworks will I learn?", a: "ISO/IEC 27001:2022, SOC 2 and GDPR most of all, with NIS2, PCI DSS and HIPAA where a client's business brings them in — applied across 25 hands-on tasks." },
  { q: "Will this help me get hired?", a: "Yes. Your completed work compiles into a CV, credential badges and a verifiable certificate, and the Career page shows how much of each typical entry-level GRC role your work already covers, with a live search for openings." },
  { q: "How long does each track take?", a: "GRC 101 is 25 tasks on a 12-week plan that starts on the date you choose." },
];

// ============ SECTIONS ============
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        {/* faint grid texture for subtle depth */}
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 75%)" }} />
        <div className="absolute -top-24 left-1/3 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)" }} />
        <div className="absolute top-10 right-10 w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.14), transparent 70%)" }} />
        <div className="absolute -bottom-10 left-10 w-[320px] h-[320px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)" }} />
      </div>
      <div className="relative max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 pt-14 md:pt-20 pb-12 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
        <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white ring-1 ring-slate-200/70 text-[12px] font-medium text-slate-600 tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hands-on GRC experience
        </div>
        <h1 className="mt-5 text-[40px] md:text-[56px] font-semibold tracking-[-0.035em] text-slate-900 leading-[1.04]" style={{ textWrap: "balance" }}>
          Become a job-ready <span className="text-indigo-600">GRC professional</span> through real work.
        </h1>
        <p className="mt-5 text-[16px] md:text-[17px] text-slate-500 leading-relaxed tracking-tight max-w-xl" style={{ textWrap: "pretty" }}>
          Work 25 tasks over 12 weeks for two simulated client organisations — scored against a reviewed answer key, aligned to the standards employers ask for, and mapped straight to the roles you want.
        </p>
        <div className="mt-7 flex items-center gap-3 flex-wrap">
          <Link href={CTA_HREF} className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_8px_24px_-8px_rgba(79,70,229,0.7)]">
            {WAITLIST_MODE ? "Enrol now" : "Start GRC 101"} <Icon name="arrowRight" size={15} />
          </Link>
          <a href="#tracks" className="focus-ring inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white ring-1 ring-slate-200/70 text-slate-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-slate-50 transition-colors">
            Explore tracks
          </a>
        </div>
        <dl className="mt-10 grid grid-cols-4 max-w-md divide-x divide-slate-200">
          {STATS.map(([n, l]) => (
            <div key={l} className="px-3 first:pl-0">
              <dt className="sr-only">{l}</dt>
              <dd className="text-[24px] md:text-[26px] font-semibold tracking-[-0.03em] text-slate-900 tabular-nums leading-none">{n}</dd>
              <div className="mt-1.5 text-[11.5px] text-slate-500 tracking-tight">{l}</div>
            </div>
          ))}
        </dl>
        </div>
        <DeskDemo />
      </div>
    </section>
  );
}

// GRC 101 at a glance — counts from the desk catalogue (backend/_seed/grc101_desk_catalog.json).
const STATS: [string, string][] = [["25", "tasks"], ["255", "steps"], ["120", "decisions"], ["12", "weeks"]];

function Frameworks() {
  // The standards GRC 101's tasks actually cite, most-cited first (public/desk/sample.json).
  const items = ["ISO/IEC 27001", "SOC 2", "GDPR", "NIS2", "PCI DSS", "HIPAA"];
  return (
    <section className="bg-[#FAFAF7]">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 pt-4 pb-10">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.14em] uppercase text-slate-500">
            <Icon name="shield" size={13} className="text-emerald-500" /> Aligned with industry standards
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {items.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200/70 text-[13px] font-medium text-slate-700 tracking-tight shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:ring-slate-300 hover:-translate-y-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="relative overflow-hidden border-y border-white/5" style={{ background: "linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #0b1120 100%)" }}>
      {/* depth: faint grid + indigo/violet glows so the dark band isn't flat */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" }} />
      <div className="relative max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
        <SectionHead dark eyebrow="Where you'll work" icon="grid" sub="GRC 101 puts you inside two of them — a customer-operations BPO and an EdTech platform holding student data. The rest are where the same skills take you.">
          Industries that hire <span className="text-indigo-400">GRC</span> talent
        </SectionHead>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {INDUSTRIES.map((i) => {
            const g = GLOW[i.tone];
            return (
              <div key={i.label} className={`group relative h-32 rounded-2xl overflow-hidden ${i.grc101 ? "ring-2 ring-emerald-400/80" : "ring-1 ring-white/10"} cursor-default shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-0.5`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {/* dark gradient keeps the label legible over any photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/15" />
                {/* tone tint emanating from the icon corner, brightening on hover */}
                <div className="absolute inset-0 opacity-35 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-60" style={{ background: `linear-gradient(150deg, ${g}, transparent 60%)` }} />
                {i.grc101 && (
                  <span className="absolute top-3 right-3 inline-flex items-center h-6 px-2 rounded-full bg-emerald-500 text-[10.5px] font-semibold text-white tracking-tight shadow-sm">In GRC 101</span>
                )}
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center ring-1 ring-white/25 text-white backdrop-blur-sm bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]">
                    <Icon name={i.icon} size={18} />
                  </span>
                  <span className="text-[12.5px] font-semibold text-white tracking-tight leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" style={{ textWrap: "balance" }}>{i.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Program() {
  return (
    <section id="program" className="relative" style={{ background: "linear-gradient(180deg, #ffffff, #f3f4fb)" }}>
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
        <SectionHead eyebrow="How it works" icon="sparkle" sub="A programme built around doing the work — not watching lectures.">
          How <span className="text-indigo-600">GRC 101</span> works
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROGRAM.map((p, i) => (
            // The first card spans two columns, so five cards tile with no hole (2+1 / 1+1+1, or 2 / 2+2 on md).
            <StaggerItem key={p.title} className={`group relative bg-white rounded-2xl ring-1 ring-slate-200/70 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-200/80 ${i === 0 ? "md:col-span-2" : ""}`}>
              <span className="absolute top-5 right-6 font-mono text-[13px] font-semibold tabular-nums text-slate-300 transition-colors group-hover:text-indigo-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 transition-transform duration-300 group-hover:scale-105 ${SOFT_TONES[p.tone]}`}>
                <Icon name={p.icon} size={20} />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-slate-900">{p.title}</h3>
              <p className="mt-2 text-[13px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{p.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Tracks() {
  return (
    <section id="tracks" className="bg-white">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-20">
        <SectionHead eyebrow="Career tracks" icon="rocket" sub="A progression from practitioner to leader — start where you are and build a portfolio of graded work.">
          Choose your <span className="text-indigo-600">track</span>
        </SectionHead>
        <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRACKS.map((t) => (
            <StaggerItem key={t.code} className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 p-6 flex flex-col text-white transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-400/30 hover:shadow-[0_24px_50px_-24px_rgba(79,70,229,0.6)]" style={{ background: "linear-gradient(160deg, #312e81 0%, #1e1b3a 60%, #0f172a 100%)" }}>
              <div className="pointer-events-none absolute -top-8 -right-6 w-40 h-40 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.5), transparent 70%)" }} />
              <div className="pointer-events-none absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
              <div className="relative flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] tracking-wide text-indigo-200 bg-white/10 ring-1 ring-white/15 rounded px-1.5 py-0.5">{t.title}</span>
                </div>
                <h3 className="mt-3 text-[26px] font-semibold tracking-tight">{t.code}</h3>
                <div className="text-[11.5px] text-indigo-200/90 tracking-tight mt-0.5">{t.years}</div>
                <p className="mt-3 text-[13px] text-indigo-50/85 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{t.body}</p>
              </div>
              {t.price && (
                <div className="relative mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[34px] font-semibold tracking-[-0.03em] tabular-nums leading-none">{t.price}</span>
                    <span className="text-[13px] font-semibold text-indigo-200/80">USD</span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-indigo-200/80 tracking-tight">
                    One-time payment · full track access
                  </p>
                </div>
              )}
              {t.code === "GRC 101" ? (
                <Link href={`/tracks/${t.code.toLowerCase().replace(/\s+/g, "-")}`} className="focus-ring relative mt-5 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-[13px] font-semibold tracking-tight no-underline transition-colors">
                  Know more <Icon name="arrowRight" size={14} />
                </Link>
              ) : (
                <div className="relative mt-5 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 text-indigo-100/80 text-[13px] font-semibold tracking-tight">
                  Coming soon
                </div>
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Inception() {
  return (
    // Right under the hero (owner, 5 Nov 2026); a statement, with no page of its own to link to.
    <section className="bg-[#FAFAF7]">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 pt-2 pb-8">
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
          <div className="shrink-0 rounded-xl bg-white ring-1 ring-slate-200/70 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={INCEPTION_BADGE} alt="NVIDIA Inception Program" width={180} height={67} className="block w-[160px] md:w-[180px] h-auto" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[19px] md:text-[21px] font-semibold tracking-[-0.02em] text-slate-900">NVIDIA Inception Program Member</h2>
            <p className="mt-1.5 text-[13.5px] text-slate-500 leading-relaxed tracking-tight max-w-2xl" style={{ textWrap: "pretty" }}>
              grcmentor is a product of {PARENT_COMPANY}, a member of the NVIDIA Inception program, which supports the
              AI-assisted grading and feedback we are bringing to GRC learners.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaFooter() {
  return (
    <>
      <section className="bg-white">
        <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-16">
          <div className="bg-brand-gradient relative overflow-hidden rounded-3xl text-white px-8 py-12 md:px-14 md:py-14 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-[28px] md:text-[36px] font-semibold tracking-[-0.03em] leading-tight">Ready to build a GRC career?</h2>
            <p className="relative mt-3 text-[15px] text-indigo-100/90 tracking-tight max-w-xl mx-auto" style={{ textWrap: "pretty" }}>
              {WAITLIST_MODE
                ? "We're onboarding in batches. Enrol now and we'll let you know the moment your place opens."
                : "Start GRC 101 today — your first task takes minutes to begin."}
            </p>
            <Link href={CTA_HREF} className="focus-ring relative mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-indigo-700 text-[14px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
              {WAITLIST_MODE ? "Enrol now" : "Get started free"} <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Nav />
      <Hero />
      <Inception />
      <Frameworks />
      <Industries />
      <Program />
      <Tracks />
      <section id="faq" className="bg-[#F4F5F8] border-t border-slate-200/60">
        <div className="max-w-[760px] mx-auto px-6 py-20">
          <SectionHead eyebrow="FAQs" icon="info" sub="Everything you need to know before you start.">
            Frequently asked <span className="text-indigo-600">questions</span>
          </SectionHead>
          <Faq items={FAQS} />
        </div>
      </section>
      <CtaFooter />
    </div>
  );
}
