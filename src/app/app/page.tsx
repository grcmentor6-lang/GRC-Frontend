"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, useMotionValue, animate } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { DVerb } from "@/components/ui/dverb";
import { learningsApi, type Learnings } from "@/lib/learnings";
import { catalog, type Program, type RubricDimension, type Standard } from "@/lib/catalog";
import { useCachedQuery } from "@/lib/use-query";
import { BADGES } from "@/lib/badges";
import { OrgLogo } from "@/components/app/org-logo";
import { ProgramTabs } from "@/components/app/program-tabs";
import { VERB_TONES, LRN_CHIP } from "@/lib/tones";
import { STANDARDS, buildTaskIndex, tasksForStandard, nistCrossRefTaskCodes } from "@/lib/standards";
import { TRACK_PREVIEWS, type TrackPreview } from "@/lib/track-previews";
import { startWelcomeTour } from "@/components/app/welcome-tour";
import { AccessChip } from "@/components/app/access-chip";
import { DashboardOrgs } from "@/components/desk/org-drawer";


interface Continue { activityId: string; taskCode: string; taskTitle: string; stepCode: string; verb: string; stepTitle: string }

/** Pick the task to surface: first in-progress, else first not-started. */
function deriveContinue(l: Learnings): Continue | null {
  for (const org of l.orgs) {
    if (org.status === "locked") continue;
    for (const proj of org.projects) {
      const ip = proj.tasks.find((t) => t.status === "in-progress");
      const target = ip ?? proj.tasks.find((t) => t.status === "not-started") ?? proj.tasks[0];
      if (target) {
        const step =
          target.steps.find((s) => s.status === "current" || s.status === "in-progress") ??
          target.steps.find((s) => s.status !== "complete" && s.status !== "locked") ??
          target.steps[0];
        return step ? { activityId: step.id, taskCode: target.code, taskTitle: target.title, stepCode: step.code, verb: step.verb, stepTitle: step.title } : null;
      }
    }
  }
  return null;
}

/**
 * True once any activity has been passed. Task status can't be used: the backend marks task 1
 * "in-progress" from day one because it always has a `current` step.
 */
function hasStarted(l: Learnings): boolean {
  return l.orgs.some((o) => o.projects.some((p) => p.tasks.some((t) => t.done > 0)));
}


/** Counts a number up from 0 on mount (respects reduced motion). */
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    // setState only happens inside animate's onUpdate callback (not synchronously in the
    // effect body); a 0-duration tween snaps straight to the value when motion is reduced.
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [value, decimals, reduce, mv]);
  return <>{display}</>;
}

function Stat({ icon, tone, value, decimals, sub, label }: { icon: IconName; tone: string; value: string | number; decimals?: number; sub?: string; label: string }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100", emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100", amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <Card className="flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${tones[tone]}`}><Icon name={icon} size={19} /></div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">{typeof value === "number" ? <CountUp value={value} decimals={decimals} /> : value}</span>
          {sub && <span className="text-[12px] text-slate-500 font-medium">{sub}</span>}
        </div>
        <div className="text-[12px] text-slate-500 tracking-tight truncate">{label}</div>
      </div>
    </Card>
  );
}

/** Pentagon-style radar of the five rubric dimensions (values out of 5). */
function RubricRadar({ dims }: { dims: { label: string; value?: number }[] }) {
  const N = dims.length;
  const size = 232, cx = size / 2, cy = size / 2, R = 74, MAX = 5;
  const angle = (i: number) => (-90 + (360 / N) * i) * (Math.PI / 180);
  const pt = (i: number, radius: number): [number, number] => [cx + radius * Math.cos(angle(i)), cy + radius * Math.sin(angle(i))];
  const poly = (radius: (i: number) => number) => dims.map((_, i) => pt(i, radius(i)).join(",")).join(" ");
  const reduce = useReducedMotion();
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {[1, 2, 3, 4, 5].map((lvl) => (
        <polygon key={lvl} points={poly(() => (R * lvl) / MAX)} fill="none" stroke="#EEF2F7" strokeWidth={1} />
      ))}
      {dims.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#EEF2F7" strokeWidth={1} />;
      })}
      <motion.polygon
        points={poly((i) => R * ((dims[i].value ?? 0) / MAX))}
        fill="rgba(99,102,241,0.16)" stroke="#6366F1" strokeWidth={2} strokeLinejoin="round"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={reduce ? false : { scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.12 }}
      />
      {dims.map((d, i) => {
        const [x, y] = pt(i, R * ((d.value ?? 0) / MAX));
        return d.value !== undefined ? (
          <motion.circle key={i} cx={x} cy={y} r={2.6} fill="#6366F1"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05, duration: 0.25 }}
          />
        ) : null;
      })}
      {dims.map((d, i) => {
        const [x, y] = pt(i, R + 15);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-slate-500" style={{ fontSize: 9.5, fontWeight: 500 }}>
            {d.label.split(" ")[0]}
          </text>
        );
      })}
    </svg>
  );
}

/**
 * Glass-styled standards coverage for the hero band. Which GRC frameworks the
 * mentee has worked across, out of the full catalogue — adapted to read on the
 * dark brand gradient (white-on-glass chips rather than the light card pills).
 */
function HeroStandards({ standards, engaged }: { standards: Standard[]; engaged: { label: string; tone: string }[] }) {
  const engagedSet = new Set(engaged.map((s) => s.label));
  const total = standards.length;
  if (total === 0) return null;
  const covered = standards.filter((s) => engagedSet.has(s.label)).length;
  const pct = total ? Math.round((covered / total) * 100) : 0;
  return (
    <div className="relative mt-4 pt-4 border-t border-white/15">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="shield" size={14} className="text-indigo-100 shrink-0" />
          <h2 className="text-[13px] font-semibold tracking-tight text-white">Standards coverage</h2>
        </div>
        <span className="text-[11px] text-indigo-100/85 tabular-nums shrink-0">
          {covered} / {total} framework{total === 1 ? "" : "s"}
          {covered >= total ? " · all engaged" : covered === 0 ? " · none yet" : ""}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-3.5">
        <div className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-300 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-semibold text-white tabular-nums shrink-0">{pct}%</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {standards.map((s) => {
          const on = engagedSet.has(s.label);
          return (
            <span
              key={s.id}
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11.5px] font-medium tracking-tight ring-1 transition-colors ${on ? "bg-white/[0.16] text-white ring-white/25" : "bg-white/[0.04] text-indigo-100/45 ring-white/10"}`}
            >
              <Icon name={on ? "check" : "shield"} size={11} strokeWidth={on ? 3 : 2} className={on ? "text-emerald-300" : "opacity-60"} />
              {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Full-colour tone maps for the standard badge tile + hero gradient (Tailwind purges dynamic classes).
const STD_SOLID: Record<string, string> = {
  indigo: "bg-indigo-600", violet: "bg-violet-600", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500",
};
const STD_GRAD: Record<string, string> = {
  indigo: "from-indigo-50/70", violet: "from-violet-50/70", emerald: "from-emerald-50/70", amber: "from-amber-50/70", rose: "from-rose-50/70",
};

/**
 * Standards card — segmented selector across the track's frameworks + an integrated detail panel.
 * Ported from the v2 dashboard mockup; stats (tasks owned / activities / cross-refs) are computed
 * live from the learnings tree so they always reflect real progress.
 */
function StandardsSection({ learnings }: { learnings: Learnings | null | undefined }) {
  const [activeId, setActiveId] = useState(STANDARDS[0]?.id);
  const taskIndex = useMemo(() => buildTaskIndex(learnings), [learnings]);
  const active = STANDARDS.find((s) => s.id === activeId) ?? STANDARDS[0];
  if (!active) return null;
  const t = VERB_TONES[active.tone] ?? VERB_TONES.indigo;

  const codes = tasksForStandard(active.id);
  const activities = codes.reduce((a, c) => a + (taskIndex.get(c)?.total ?? 0), 0);
  const crossRefs = active.crossCutting ? nistCrossRefTaskCodes().length : 0;
  const stats = [
    { label: "Tasks owned", value: codes.length, hint: "Live in this track" },
    { label: "Activities", value: activities, hint: "Across all tasks" },
    { label: "Cross-refs", value: crossRefs, hint: crossRefs > 0 ? "Cross-cutting tasks" : "None" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Standards</h2>
          <span className="px-1.5 h-5 rounded-md bg-slate-100 ring-1 ring-slate-200 text-[10.5px] font-medium text-slate-600 flex items-center">{STANDARDS.length}</span>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 ring-1 ring-slate-200 flex-wrap">
          {STANDARDS.map((s) => {
            const sel = s.id === active.id;
            const st = VERB_TONES[s.tone] ?? VERB_TONES.indigo;
            return (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-medium tracking-tight transition-all ${sel ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sel ? st.dot : "bg-slate-300"}`} />
                {s.code}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`rounded-2xl ring-1 ring-slate-200 overflow-hidden bg-gradient-to-br ${STD_GRAD[active.tone] ?? STD_GRAD.indigo} via-white to-white`}>
        <div className="p-6 md:p-7">
          <div className="flex items-start gap-5">
            <div className={`shrink-0 w-20 h-20 rounded-2xl ${STD_SOLID[active.tone] ?? STD_SOLID.indigo} text-white flex flex-col items-center justify-center leading-none shadow-lg`}>
              <span className="text-[17px] font-mono font-semibold tracking-[0.04em]">{active.short}</span>
              <span className="text-[8px] font-mono opacity-75 mt-1.5 tracking-[0.08em]">STANDARD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] tracking-tight ${t.bg} ${t.text} ring-1 ${t.ring}`}>{active.code}</span>
                {active.crossCutting && <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase tracking-[0.08em] ${t.bg} ${t.text} ring-1 ${t.ring}`}>cross-cutting</span>}
              </div>
              <h3 className="mt-2 text-[24px] md:text-[27px] font-semibold tracking-[-0.025em] text-slate-900 leading-tight">{active.fullName}</h3>
              <div className={`mt-1.5 text-[15px] font-semibold tracking-tight ${t.text}`}>{active.domain}</div>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}>{active.description}</p>
              <p className={`mt-2.5 text-[12.5px] italic tracking-tight ${t.text}`}>{active.tagline}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((m) => (
              <div key={m.label} className="rounded-xl bg-white/70 ring-1 ring-slate-200 px-4 py-3">
                <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">{m.label}</div>
                <div className="mt-1 text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-slate-900 leading-none">{m.value}</div>
                <div className="mt-1.5 text-[10.5px] font-mono text-slate-400">{m.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
      {/* Frameworks introduced — trust signal for what the track teaches */}
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

      {/* Industries preview */}
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [programId, setProgramId] = useState("grc101");
  const { data: programsRaw } = useCachedQuery("programs", () => catalog.programs());
  const programs: Program[] = useMemo(() => (programsRaw ? [...programsRaw].sort((a, b) => a.order - b.order) : []), [programsRaw]);
  // Shared, cached fetches — learnings/progress are reused across pages, so repeat visits are instant.
  const { data: progress, loading: pLoad } = useCachedQuery(`progress:${programId}`, () => learningsApi.progress(programId));
  const { data: learnings, loading: lLoad } = useCachedQuery(`learnings:${programId}`, () => learningsApi.get(programId));
  const { data: rubricData } = useCachedQuery("rubric", () => catalog.rubric());
  const rubric = rubricData ?? [];
  const { data: standardsData } = useCachedQuery("standards", () => catalog.standards());
  const standards = standardsData ?? [];
  const loading = (pLoad || lLoad) && !progress && !learnings;

  const program = programs.find((p) => p.id === programId);
  const locked = learnings?.status === "locked" || program?.status === "locked";
  const preview = locked ? TRACK_PREVIEWS[programId] : undefined;
  const first = user?.firstName || "there";
  const cont = !locked && learnings ? deriveContinue(learnings) : null;
  const started = !!learnings && hasStarted(learnings);

  const rubricScoreMap = new Map<string, number>();
  progress?.rubricScores.forEach((s) => { rubricScoreMap.set(s.id, s.value); rubricScoreMap.set(s.label.toLowerCase(), s.value); });
  const scoreFor = (r: RubricDimension) => rubricScoreMap.get(r.id) ?? rubricScoreMap.get(r.label.toLowerCase());
  const anyRubricScored = (progress?.rubricScores.length ?? 0) > 0;

  const completedTaskCodes = new Set<string>();
  let totalTasks = 0;
  learnings?.orgs.forEach((o) => o.projects.forEach((p) => { totalTasks += p.tasks.length; p.tasks.forEach((t) => { if (t.status === "complete") completedTaskCodes.add(t.code); }); }));
  const completedTasks = completedTaskCodes.size;
  const certPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const earnedBadges = BADGES.filter((b) => b.taskCodes.length > 0 && b.taskCodes.every((c) => completedTaskCodes.has(c)));



  if (loading) {
    return (
      <div className="page-shell space-y-4 animate-pulse">
        <div className="h-[290px] rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
        </div>
        <Skeleton className="h-[230px] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-[260px] rounded-2xl" />
          <Skeleton className="h-[260px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-4">
      {/* Hero / continue — the track switcher lives in the header strip so there's no empty band up top */}
      <Reveal>
      <div data-tour="dash-hero" className="bg-brand-gradient relative overflow-hidden rounded-2xl text-white p-5 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.55)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

        {/* Header strip: status eyebrow (left) + track switcher (right) */}
        <div className="relative flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${locked ? "bg-amber-300" : "bg-emerald-300 animate-pulse"}`} />
              <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-indigo-100">{locked ? `${program?.code ?? "Track"} · locked` : cont && started ? "Pick up where you left off" : "Welcome aboard"}</span>
            </span>
            <AccessChip variant="dark" />
          </div>
          <div className="flex items-center gap-2">
            {/* guide trigger — mirrors the Working Desk; blinks thrice on load to hint the walkthrough */}
            <button
              onClick={startWelcomeTour}
              className="guide-blink focus-ring inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm text-white hover:bg-white/20 text-[12.5px] font-medium tracking-tight transition-colors cursor-pointer"
            >
              <Icon name="help" size={14} /> Guide
            </button>
            {programs.length > 0 && <ProgramTabs programs={programs} value={programId} onChange={setProgramId} variant="dark" />}
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] md:text-[27px] font-semibold tracking-[-0.02em] leading-tight">Good to see you, {first}.</h1>
            <p className="text-[13.5px] text-indigo-100/90 mt-1 mb-3 tracking-tight max-w-xl">
              {locked ? <>{program?.code} unlocks after you finish the previous track. Preview its engagements below.</> : cont ? <>{started ? "Your next move is" : "Your first task is"} <span className="font-medium text-white">{cont.taskCode}</span> — step {cont.stepCode}.</> : <>You&apos;re enrolled in {program?.code ?? "GRC 101"}. Open your first engagement to begin.</>}
            </p>
            {!locked && (
            <div className="flex flex-wrap items-center gap-3">
              <Link href={cont ? `/app/desk/${cont.activityId}` : "/app/desk"} className="focus-ring inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
                <Icon name="play" size={13} /> {cont && started ? "Continue task" : cont ? "Start task" : `Start ${program?.code ?? "GRC 101"}`}
              </Link>
              {cont && (
                <div className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                  <span className="font-mono text-[11px] text-indigo-100">{cont.taskCode}·{cont.stepCode}</span>
                  <DVerb verbId={cont.verb} />
                  <span className="text-[12.5px] font-medium tracking-tight truncate max-w-[240px]">{cont.stepTitle}</span>
                </div>
              )}
            </div>
            )}
          </div>
          {learnings && !locked && (
            <div className="shrink-0 md:w-[210px]">
              <div className="rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-4 flex items-center gap-3">
                <Ring pct={certPct} size={64} stroke={8}>
                  <span className="text-[13px] font-semibold text-white">{certPct}%</span>
                </Ring>
                <div>
                  <div className="text-[12px] font-medium tracking-tight">Certificate progress</div>
                  <div className="text-[11px] text-indigo-100/85 mt-0.5 tabular-nums">{completedTasks} of {totalTasks} tasks complete</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Standards coverage — frameworks engaged across the track */}
        {!locked && <HeroStandards standards={standards} engaged={progress?.standardsEngaged ?? []} />}
      </div>
      </Reveal>

      {/* Stat strip */}
      {!locked && progress && (
        <Reveal delay={0.08}>
        <div data-tour="dash-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Stat icon="checkSquare" tone="indigo" value={progress.activitiesDone} sub={`/ ${progress.activitiesTotal}`} label="Activities completed" />
          <Stat icon="star" tone="amber" value={progress.reviewsCount ? progress.avgScore : "—"} decimals={1} sub={progress.reviewsCount ? `/ ${progress.scoreOutOf}` : undefined} label={`Avg mentor score · ${progress.reviewsCount} reviews`} />
          <Stat icon="calendar" tone="violet" value="None" label="Due soon · self-paced" />
        </div>
        </Reveal>
      )}

      {/* Locked track (GRC 301 / 501): preview industries + frameworks instead of live engagements.
          Keyed by program so switching 301↔501 remounts cleanly — otherwise the Stagger's whileInView
          (once) doesn't re-run for the swapped cards and they stay stuck at opacity:0 (blank white). */}
      {locked && preview && <TrackPreviewSection key={programId} preview={preview} code={program?.code} />}

      {!locked && (
      <Reveal delay={0.16}>
      <div className="space-y-5">
        {/* Your organisations — click a card for the full engagement breakdown */}
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

        {/* Standards — segmented selector + integrated detail (active track only) */}
        {!locked && <div data-tour="dash-standards"><StandardsSection learnings={learnings} /></div>}

        {!locked && (
        <div data-tour="dash-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Skill rubric — radar */}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Skill rubric</h2>
              <span className="text-[11px] text-slate-400">/ 5</span>
            </div>
            {rubric.length > 0 ? (
              <RubricRadar dims={rubric.map((r) => ({ label: r.label, value: scoreFor(r) }))} />
            ) : (
              <div className="py-10 text-center text-[12.5px] text-slate-400">No rubric data.</div>
            )}
            {!anyRubricScored && (
              <div className="mt-1 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <Icon name="info" size={13} className="text-slate-400 shrink-0" /> Scores appear after your first mentor-graded activity.
              </div>
            )}
          </Card>

          {/* Progress overview */}
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3.5">Progress overview</h2>
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-slate-600 tracking-tight">Badges earned</span>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{earnedBadges.length} / {BADGES.length}</span>
                </div>
                <Bar pct={BADGES.length ? (earnedBadges.length / BADGES.length) * 100 : 0} tone="amber" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-slate-600 tracking-tight">Tasks completed</span>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{completedTasks} / {totalTasks}</span>
                </div>
                <Bar pct={certPct} tone="indigo" />
              </div>
              {progress && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] text-slate-600 tracking-tight">Activities completed</span>
                    <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{progress.activitiesDone} / {progress.activitiesTotal}</span>
                  </div>
                  <Bar pct={progress.activitiesTotal ? (progress.activitiesDone / progress.activitiesTotal) * 100 : 0} tone="emerald" />
                </div>
              )}
            </div>
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
