"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion, useMotionValue, animate } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { catalog, type Program } from "@/lib/catalog";
import { useCachedQuery } from "@/lib/use-query";
import { useMethodBadges } from "@/components/badges/use-method-badges";
import { OrgLogo } from "@/components/app/org-logo";
import { ProgramTabs } from "@/components/app/program-tabs";
import { LRN_CHIP } from "@/lib/tones";
import { TRACK_PREVIEWS, type TrackPreview } from "@/lib/track-previews";
import { startWelcomeTour } from "@/components/app/welcome-tour";
import { AccessChip } from "@/components/app/access-chip";
import { DashboardOrgs } from "@/components/desk/org-drawer";
import { useDeskRecord, recordCounts, recordEmpty } from "@/lib/desk-record";
import { planOf, nextStep, dueText } from "@/lib/desk-plan";
import { dueDate, fmtDay } from "@/lib/desk/model";
import { ALL_WEEKS_OPEN } from "@/lib/flags";

/** Counts a number up from 0 on mount (respects reduced motion). */
function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(0)),
    });
    return () => controls.stop();
  }, [value, reduce, mv]);
  return <>{display}</>;
}

function Stat({ icon, tone, value, sub, label }: { icon: IconName; tone: string; value: string | number; sub?: string; label: string }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100", emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100", amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${tones[tone]}`}><Icon name={icon} size={19} /></div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">{typeof value === "number" ? <CountUp value={value} /> : value}</span>
          {sub && <span className="text-[12px] text-slate-500 font-medium">{sub}</span>}
        </div>
        <div className="text-[12px] text-slate-500 tracking-tight truncate">{label}</div>
      </div>
    </Card>
  );
}

/**
 * Locked-track preview — the industries + frameworks a mentee unlocks in GRC 301 / 501, shown
 * instead of live engagements. Curated in lib/track-previews (ordered by increasing criticality).
 */
function TrackPreviewSection({ preview, code }: { preview: TrackPreview; code?: string }) {
  return (
    <Reveal delay={0.08}>
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={15} className="text-indigo-500" />
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Frameworks you&apos;ll add in {code}</h2>
          </div>
          <span className="text-[11.5px] text-slate-500 font-medium">{preview.frameworks.length} frameworks</span>
        </div>
        <p className="text-[12.5px] text-slate-500 tracking-tight leading-relaxed mb-3.5 max-w-2xl" style={{ textWrap: "pretty" }}>{preview.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {preview.frameworks.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11.5px] font-medium tracking-tight bg-slate-50 text-slate-700 ring-1 ring-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{f}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Industries in this track</h2>
          <span className="text-[11.5px] text-slate-500 font-medium">{preview.orgs.length} organisations</span>
        </div>
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {preview.orgs.map((o) => (
            <StaggerItem key={o.id} className="h-full">
              <div className="group flex h-full flex-col gap-3 rounded-xl p-4 ring-1 bg-slate-50/60 ring-slate-200">
                <div className="flex items-center gap-3">
                  <OrgLogo org={o} className="w-11 h-11 rounded-xl text-[13px]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold tracking-tight text-slate-900 truncate">{o.name}</div>
                    <div className="text-[11px] text-slate-500 tracking-tight truncate">{o.subIndustry}</div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-semibold tracking-tight ring-1 bg-slate-100 text-slate-500 ring-slate-200">
                    <Icon name="lock" size={9} /> Locked
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 h-[19px] px-1.5 rounded-md text-[10px] font-medium tracking-tight ring-1 ${LRN_CHIP[o.tone] ?? LRN_CHIP.indigo}`}>
                    <Icon name="briefcase" size={10} /> {o.industry}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-400 tracking-tight truncate">
                    <Icon name="mapPin" size={10} className="shrink-0" /> {o.hq}
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 tracking-tight leading-relaxed line-clamp-2" style={{ textWrap: "pretty" }}>{o.blurb}</p>
                <div className="flex flex-wrap gap-1 pt-3 mt-auto border-t border-slate-200">
                  {o.standards.map((s) => (
                    <span key={s} className="inline-flex items-center px-1.5 h-[18px] rounded text-[10px] font-mono tracking-tight bg-white text-slate-600 ring-1 ring-slate-200">{s}</span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Card>
    </div>
    </Reveal>
  );
}

/**
 * The dashboard reads one thing: this account's Working Desk work (desk_progress) over the desk's
 * catalogue — the same record My Submissions and Reports count from (lib/desk-record), and the same
 * dates the desk shows (lib/desk-plan). Nothing here is shared demo data or the old activity table.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const methodBadges = useMethodBadges();
  const [programId, setProgramId] = useState("grc101");
  const { data: programsRaw } = useCachedQuery("programs", () => catalog.programs());
  const programs: Program[] = useMemo(() => (programsRaw ? [...programsRaw].sort((a, b) => a.order - b.order) : []), [programsRaw]);
  const { state, desk, progress, start, retry } = useDeskRecord();
  // The desk's own rule for an open week (desk-app.tsx), so "not open yet" means the same here.
  const preview = ALL_WEEKS_OPEN || user?.role === "admin";

  const program = programs.find((p) => p.id === programId);
  const locked = programId !== "grc101" || program?.status === "locked";
  const trackPreview = locked ? TRACK_PREVIEWS[programId] : undefined;
  const first = user?.firstName || "there";
  const noStart = !user?.startDate;

  const plan = useMemo(() => (desk ? planOf(desk, progress, start, preview) : []), [desk, progress, start, preview]);
  const counts = desk ? recordCounts(desk, progress) : null;
  const next = desk ? nextStep(desk, progress, plan) : null;
  const started = !recordEmpty(progress);
  const allIn = !!counts && counts.tasksSubmitted === counts.tasks;
  // Every open task handed in, more to come: the next week's opening date.
  const waiting = !next && !allIn ? plan.find((t) => t.state === "not-open") : undefined;
  const dueNext = plan.find((t) => t.state === "overdue") ?? plan.find((t) => t.state === "today" || t.state === "upcoming");
  const pctTasks = counts?.tasks ? Math.round((counts.tasksSubmitted / counts.tasks) * 100) : 0;

  if (!locked && state === "loading") {
    return (
      <div className="page-shell space-y-4 animate-pulse">
        <div className="h-[220px] rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
        </div>
        <Skeleton className="h-[230px] rounded-2xl" />
      </div>
    );
  }

  let headline: React.ReactNode;
  let cta: { href: string; label: string } | null = { href: "/app/desk", label: "Open the Working Desk" };
  if (locked) {
    headline = <>{program?.code} unlocks after you finish the previous track. Preview its engagements below.</>;
    cta = null;
  } else if (state === "failed") {
    headline = <>Your saved desk work did not load. It is safe on the server; check your connection and try again.</>;
    cta = null;
  } else if (noStart) {
    headline = <>Your first step: open the Working Desk and pick the day your 12 weeks begin. Every due date counts from it.</>;
  } else if (next) {
    headline = <>{started ? "Your next step is" : "Your first step is"} <span className="font-medium text-white">{next.task.id} step {next.n}</span> — {next.task.title}.</>;
    cta = { href: next.href, label: started ? "Continue" : "Start step 1" };
  } else if (allIn) {
    headline = <>Every GRC 101 task is submitted.</>;
  } else if (waiting) {
    headline = <>Every open task is submitted. Week {waiting.week} opens {fmtDay(dueDate(start, (waiting.week - 1) * 7))}.</>;
  }

  return (
    <div className="page-shell space-y-4">
      <Reveal>
      <div data-tour="dash-hero" className="bg-brand-gradient relative overflow-hidden rounded-2xl text-white p-5 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.55)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${locked ? "bg-amber-300" : "bg-emerald-300"}`} />
              <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-indigo-100">{locked ? `${program?.code ?? "Track"} · locked` : started ? "Pick up where you left off" : "Welcome aboard"}</span>
            </span>
            <AccessChip variant="dark" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startWelcomeTour}
              className="focus-ring inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm text-white hover:bg-white/20 text-[12.5px] font-medium tracking-tight transition-colors cursor-pointer"
            >
              <Icon name="help" size={14} /> Guide
            </button>
            {programs.length > 0 && <ProgramTabs programs={programs} value={programId} onChange={setProgramId} variant="dark" />}
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] md:text-[27px] font-semibold tracking-[-0.02em] leading-tight">Good to see you, {first}.</h1>
            <p className="text-[13.5px] text-indigo-100/90 mt-1 mb-3 tracking-tight max-w-xl">{headline}</p>
            <div className="flex flex-wrap items-center gap-3">
              {cta && (
                <Link href={cta.href} className="focus-ring inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
                  <Icon name="play" size={13} /> {cta.label}
                </Link>
              )}
              {!locked && state === "failed" && (
                <button onClick={retry} className="focus-ring inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight">Try again</button>
              )}
              {!locked && next && !noStart && (
                <span className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-white/10 ring-1 ring-white/20 text-[12.5px] font-medium tracking-tight">
                  {next.task.stepsDone} of {next.task.steps} steps · {dueText(next.task)}
                </span>
              )}
            </div>
          </div>
          {!locked && counts && (
            <div className="shrink-0 md:w-[210px]">
              <div className="rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-4 flex items-center gap-3">
                <Ring pct={pctTasks} size={64} stroke={8}>
                  <span className="text-[13px] font-semibold text-white">{pctTasks}%</span>
                </Ring>
                <div>
                  <div className="text-[12px] font-medium tracking-tight">Tasks submitted</div>
                  <div className="text-[11px] text-indigo-100/85 mt-0.5 tabular-nums">{counts.tasksSubmitted} of {counts.tasks}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </Reveal>

      {!locked && counts && (
        <Reveal delay={0.08}>
        <div data-tour="dash-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Stat icon="checkSquare" tone="indigo" value={counts.stepsDone} sub={`/ ${counts.steps}`} label="Steps done" />
          <Stat icon="bullseye" tone="emerald" value={counts.decisionsDone} sub={`/ ${counts.decisions}`} label="Decisions made" />
          {noStart ? (
            <Stat icon="calendar" tone="amber" value="—" label="Due dates start when you pick your start date" />
          ) : dueNext ? (
            <Stat icon="calendar" tone={dueNext.state === "overdue" ? "rose" : "amber"} value={dueNext.id} sub={dueText(dueNext)} label={`Next task due · ${fmtDay(dueNext.due)}`} />
          ) : (
            <Stat icon="calendar" tone="emerald" value="—" label="Nothing open is due" />
          )}
        </div>
        </Reveal>
      )}

      {locked && trackPreview && <TrackPreviewSection key={programId} preview={trackPreview} code={program?.code} />}

      {!locked && (
      <Reveal delay={0.16}>
      <div className="space-y-5">
        <div data-tour="dash-orgs">
        <Card>
          <details open className="group/orgs">
            <summary className="focus-ring list-none cursor-pointer flex items-center justify-between mb-4 rounded-lg [&::-webkit-details-marker]:hidden">
              <h2 className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight text-slate-900">
                <Icon name="chevronDown" size={14} className="text-slate-400 transition-transform duration-200 -rotate-90 group-open/orgs:rotate-0" />
                Your organisations
              </h2>
              <span className="text-[11.5px] text-slate-500 font-medium">Click one for its full profile</span>
            </summary>
          <DashboardOrgs />
          </details>
        </Card>
        </div>

        {counts && (
          <div data-tour="dash-grid">
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3.5">Progress overview</h2>
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Link href="/app/badges" className="text-[12.5px] text-slate-600 tracking-tight no-underline hover:text-slate-900">Method badges earned</Link>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{methodBadges.earned} / {methodBadges.total}</span>
                </div>
                <Bar pct={(methodBadges.earned / methodBadges.total) * 100} tone="amber" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Link href="/app/submissions" className="text-[12.5px] text-slate-600 tracking-tight no-underline hover:text-slate-900">Tasks submitted</Link>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{counts.tasksSubmitted} / {counts.tasks}</span>
                </div>
                <Bar pct={pctTasks} tone="indigo" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-slate-600 tracking-tight">Steps done</span>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{counts.stepsDone} / {counts.steps}</span>
                </div>
                <Bar pct={counts.steps ? (counts.stepsDone / counts.steps) * 100 : 0} tone="emerald" />
              </div>
            </div>
            {!started && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11.5px] text-slate-500">
                <Icon name="info" size={13} className="text-slate-400 shrink-0" /> Nothing done on the desk yet. These fill in as you complete steps there.
              </div>
            )}
          </Card>
          </div>
        )}
      </div>
      </Reveal>
      )}

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · {program?.title ?? "GRC 101 · Foundations"}</div>
    </div>
  );
}
