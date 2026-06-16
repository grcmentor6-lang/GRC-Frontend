"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useMotionValue, animate } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer } from "@/components/ui/drawer";
import { DVerb } from "@/components/ui/dverb";
import { learningsApi, type Learnings, type LearningOrg } from "@/lib/learnings";
import { catalog, type RubricDimension, type Standard } from "@/lib/catalog";
import { useCachedQuery } from "@/lib/use-query";
import { BADGES } from "@/lib/badges";
import { LRN_AVATAR, LRN_CHIP } from "@/lib/tones";

const PROGRAM = "grc101";

/** Next openable step in an org — drives the card "Next up" line and the panel "Continue" CTA. */
function nextStepOf(o: LearningOrg): { id: string; taskCode: string; stepCode: string; verb: string; title: string } | null {
  for (const proj of o.projects) {
    const ip = proj.tasks.find((t) => t.status === "in-progress");
    const target = ip ?? proj.tasks.find((t) => t.status === "not-started") ?? proj.tasks[0];
    if (target) {
      const step =
        target.steps.find((s) => s.status === "current" || s.status === "in-progress") ??
        target.steps.find((s) => s.status !== "complete" && s.status !== "locked") ??
        target.steps[0];
      if (step) return { id: step.id, taskCode: target.code, stepCode: step.code, verb: step.verb, title: step.title };
    }
  }
  return null;
}

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

/** Roll up per-org engagement stats for the dashboard cards. */
function orgStats(o: LearningOrg): { total: number; done: number; pct: number } {
  let total = 0, done = 0;
  o.projects.forEach((p) => p.tasks.forEach((t) => { total++; if (t.status === "complete") done++; }));
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
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

/** Soft chip tones for the standards-coverage pills (includes slate, which SOFT_TONES omits). */
const STD_TONE: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/70",
  sky: "bg-sky-50 text-sky-700 ring-sky-200/70",
  slate: "bg-slate-100 text-slate-700 ring-slate-200/70",
};

/** Which GRC frameworks the mentee has worked across, out of the full catalogue. */
function StandardsCoverage({ standards, engaged }: { standards: Standard[]; engaged: { label: string; tone: string }[] }) {
  const engagedSet = new Set(engaged.map((s) => s.label));
  const total = standards.length;
  const covered = standards.filter((s) => engagedSet.has(s.label)).length;
  const pct = total ? Math.round((covered / total) * 100) : 0;
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Standards coverage</h2>
        <span className="text-[11px] text-slate-400 tabular-nums">{covered} / {total}</span>
      </div>
      {total === 0 ? (
        <div className="py-8 text-center text-[12.5px] text-slate-400">No standards catalogue.</div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3.5">
            <Bar pct={pct} tone={pct >= 100 ? "emerald" : "violet"} className="flex-1" />
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums shrink-0">{pct}%</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {standards.map((s) => {
              const on = engagedSet.has(s.label);
              return (
                <span key={s.id} className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11.5px] font-medium tracking-tight ring-1 transition-colors ${on ? (STD_TONE[s.tone] ?? STD_TONE.indigo) : "bg-slate-50 text-slate-400 ring-slate-200/60"}`}>
                  <Icon name={on ? "check" : "shield"} size={11} strokeWidth={on ? 3 : 2} className={on ? "" : "opacity-60"} />
                  {s.label}
                </span>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {covered === 0
              ? "Frameworks light up as you complete graded tasks."
              : covered >= total
                ? "You've worked across every framework in GRC 101."
                : `${total - covered} framework${total - covered === 1 ? "" : "s"} still to engage.`}
          </div>
        </>
      )}
    </Card>
  );
}

/** A titled block in the org-context drawer. */
function CtxSection({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon name={icon} size={14} className="text-indigo-500 shrink-0" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">{title}</h3>
      </div>
      {children}
    </section>
  );
}

/** Pills for a flat string list. */
function Chips({ items, tone = "slate" }: { items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <span key={i} className={`inline-flex items-center px-2.5 h-7 rounded-lg text-[11.5px] font-medium tracking-tight ring-1 ${STD_TONE[tone] ?? STD_TONE.slate}`}>{s}</span>
      ))}
    </div>
  );
}

/** Bulleted list of strings (for longer, sentence-like context). */
function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
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

/** Labeled sub-group (e.g. Internal / External) rendered as chips. */
function CtxGroup({ label, items, tone }: { label: string; items?: string[]; tone?: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-1.5">{label}</div>
      <Chips items={items} tone={tone} />
    </div>
  );
}

/** Right-side detail panel: the organisation's full context only — no engagement/progress data. */
function OrgDetail({ org }: { org: LearningOrg }) {
  const p = org.profile;
  const locked = org.status === "locked";
  const headOffice = p?.officeLocations?.headOffice || p?.headOffice || "";
  const regional = p?.officeLocations?.regionalOffices ?? [];
  const kr = p?.keyRequirements;
  const hasReqs = !!kr && [kr.stakeholder, kr.employee, kr.regulator, kr.partner].some((v) => v?.length);

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="flex items-start gap-3.5">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${LRN_AVATAR[org.tone] ?? LRN_AVATAR.indigo} flex items-center justify-center text-white text-[15px] font-semibold shrink-0 ${locked ? "opacity-50 grayscale" : ""}`}>
          {org.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 h-[20px] px-2 rounded-md text-[10.5px] font-medium tracking-tight ring-1 ${LRN_CHIP[org.tone] ?? LRN_CHIP.indigo}`}>
              <Icon name="briefcase" size={11} /> {org.industry}
            </span>
            {p?.subIndustry && (
              <span className="inline-flex items-center h-[20px] px-2 rounded-md text-[10.5px] font-medium tracking-tight ring-1 bg-slate-100 text-slate-600 ring-slate-200/70">{p.subIndustry}</span>
            )}
          </div>
          {headOffice && (
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 tracking-tight mt-2">
              <Icon name="mapPin" size={12} className="text-slate-400 shrink-0" /> {headOffice}
            </div>
          )}
          {p?.primaryRegulator && (
            <div className="flex items-start gap-1.5 text-[12px] text-slate-500 tracking-tight mt-1">
              <Icon name="shield" size={12} className="text-slate-400 shrink-0 mt-0.5" /> <span style={{ textWrap: "pretty" }}>{p.primaryRegulator}</span>
            </div>
          )}
        </div>
      </div>

      {(p?.organisationalContext || org.context) && (
        <CtxSection icon="book" title="Overview">
          <p className="text-[12.5px] text-slate-600 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{p?.organisationalContext || org.context}</p>
        </CtxSection>
      )}

      {p?.hqRegulatoryRationale && (
        <CtxSection icon="flag" title="HQ regulatory rationale">
          <p className="text-[12.5px] text-slate-600 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{p.hqRegulatoryRationale}</p>
        </CtxSection>
      )}

      {(headOffice || regional.length > 0) && (
        <CtxSection icon="globe" title="Office locations">
          <div className="space-y-2.5">
            <CtxGroup label="Head office" items={headOffice ? [headOffice] : undefined} tone="indigo" />
            <CtxGroup label="Regional offices" items={regional} />
          </div>
        </CtxSection>
      )}

      {p?.servicesAndProducts?.length ? (
        <CtxSection icon="cube" title="Services & products">
          <Chips items={p.servicesAndProducts} tone="violet" />
        </CtxSection>
      ) : null}

      {(p?.interestedParties?.internal?.length || p?.interestedParties?.external?.length) ? (
        <CtxSection icon="users" title="Interested parties">
          <div className="space-y-2.5">
            <CtxGroup label="Internal" items={p?.interestedParties?.internal} tone="sky" />
            <CtxGroup label="External" items={p?.interestedParties?.external} tone="amber" />
          </div>
        </CtxSection>
      ) : null}

      {hasReqs ? (
        <CtxSection icon="checkSquare" title="Key requirements">
          <div className="space-y-3">
            <CtxGroup label="Stakeholder" items={kr?.stakeholder} />
            <CtxGroup label="Employee" items={kr?.employee} />
            <CtxGroup label="Regulator" items={kr?.regulator} />
            <CtxGroup label="Partner" items={kr?.partner} />
          </div>
        </CtxSection>
      ) : null}

      {p?.customerFacingProcesses?.length ? (
        <CtxSection icon="refresh" title="Customer-facing processes">
          <Bullets items={p.customerFacingProcesses} />
        </CtxSection>
      ) : null}

      {p?.clientDataHandled?.length ? (
        <CtxSection icon="lock" title="Client data handled">
          <Bullets items={p.clientDataHandled} />
        </CtxSection>
      ) : null}

      {(p?.informationAssets?.onPremises?.length || p?.informationAssets?.cloud?.length) ? (
        <CtxSection icon="layers" title="Information assets">
          <div className="space-y-2.5">
            <CtxGroup label="On-premises" items={p?.informationAssets?.onPremises} />
            <CtxGroup label="Cloud" items={p?.informationAssets?.cloud} tone="sky" />
          </div>
        </CtxSection>
      ) : null}

      {(p?.mandatoryStandards?.length || p?.optionalStandards?.length) ? (
        <CtxSection icon="shield" title="Standards & regulations">
          <div className="space-y-2.5">
            <CtxGroup label="Mandatory" items={p?.mandatoryStandards} tone="emerald" />
            <CtxGroup label="Optional / recommended" items={p?.optionalStandards} />
          </div>
        </CtxSection>
      ) : null}

      {p?.regulatoryRequirements?.length ? (
        <CtxSection icon="bullseye" title="Regulatory requirements">
          <Bullets items={p.regulatoryRequirements} />
        </CtxSection>
      ) : null}

      {!p && (
        <p className="text-[12.5px] text-slate-400 tracking-tight">No organisation context available yet.</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  // Shared, cached fetches — learnings/progress are reused across pages, so repeat visits are instant.
  const { data: progress, loading: pLoad } = useCachedQuery(`progress:${PROGRAM}`, () => learningsApi.progress(PROGRAM));
  const { data: learnings, loading: lLoad } = useCachedQuery(`learnings:${PROGRAM}`, () => learningsApi.get(PROGRAM));
  const { data: rubricData } = useCachedQuery("rubric", () => catalog.rubric());
  const rubric = rubricData ?? [];
  const { data: standardsData } = useCachedQuery("standards", () => catalog.standards());
  const standards = standardsData ?? [];
  const loading = (pLoad || lLoad) && !progress && !learnings;

  const first = user?.firstName || "there";
  const cont = learnings ? deriveContinue(learnings) : null;
  const orgs = learnings?.orgs ?? [];
  const [activeOrg, setActiveOrg] = useState<LearningOrg | null>(null);

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
      <div className="max-w-[1180px] mx-auto px-6 py-6 space-y-5 animate-pulse">
        <div className="h-[168px] rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
        </div>
        <Skeleton className="h-[230px] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-[260px] rounded-2xl" />
          <Skeleton className="h-[260px] rounded-2xl" />
          <Skeleton className="h-[260px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-6 space-y-5">
      {/* Hero / continue */}
      <Reveal>
      <div className="bg-brand-gradient relative overflow-hidden rounded-2xl text-white p-6 md:p-7 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.55)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-indigo-100">{cont ? "Pick up where you left off" : "Welcome aboard"}</span>
            </div>
            <h1 className="text-[24px] md:text-[27px] font-semibold tracking-[-0.02em] leading-tight">Good to see you, {first}.</h1>
            <p className="text-[13.5px] text-indigo-100/90 mt-1 mb-4 tracking-tight max-w-xl">
              {cont ? <>Your next move is <span className="font-medium text-white">{cont.taskCode}</span> — step {cont.stepCode}.</> : <>You&apos;re enrolled in GRC 101. Open your first engagement to begin.</>}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={cont ? `/app/desk/${cont.activityId}` : "/app/desk"} className="focus-ring inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
                <Icon name="play" size={13} /> {cont ? "Continue task" : "Start GRC 101"}
              </Link>
              {cont && (
                <div className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                  <span className="font-mono text-[11px] text-indigo-100">{cont.taskCode}·{cont.stepCode}</span>
                  <DVerb verbId={cont.verb} />
                  <span className="text-[12.5px] font-medium tracking-tight truncate max-w-[240px]">{cont.stepTitle}</span>
                </div>
              )}
            </div>
          </div>
          {learnings && (
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
      </div>
      </Reveal>

      {/* Stat strip */}
      {progress && (
        <Reveal delay={0.08}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat icon="checkSquare" tone="indigo" value={progress.activitiesDone} sub={`/ ${progress.activitiesTotal}`} label="Activities completed" />
          <Stat icon="star" tone="amber" value={progress.reviewsCount ? progress.avgScore : "—"} decimals={1} sub={progress.reviewsCount ? `/ ${progress.scoreOutOf}` : undefined} label={`Avg mentor score · ${progress.reviewsCount} reviews`} />
          <Stat icon="calendar" tone="violet" value="None" label="Due soon · self-paced" />
        </div>
        </Reveal>
      )}

      <Reveal delay={0.16}>
      <div className="space-y-5">
        {/* Your organisations — click a card for the full engagement breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Your organisations</h2>
            <span className="text-[11.5px] text-slate-500 font-medium">{orgs.length} engagement{orgs.length === 1 ? "" : "s"}</span>
          </div>
          {orgs.length === 0 ? (
            <p className="text-[13px] text-slate-500">No organisations assigned yet.</p>
          ) : (
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orgs.map((o) => {
                const s = orgStats(o);
                const locked = o.status === "locked";
                const done = s.total > 0 && s.done === s.total;
                const next = locked ? null : nextStepOf(o);
                return (
                  <StaggerItem key={o.id} className="h-full">
                    <button
                      type="button"
                      onClick={() => setActiveOrg(o)}
                      aria-label={`Open ${o.name} engagement details`}
                      className={`focus-ring group flex h-full w-full flex-col gap-3 text-left rounded-xl p-4 ring-1 bg-slate-50/60 ring-slate-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-card hover:ring-indigo-200/70 ${locked ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${LRN_AVATAR[o.tone] ?? LRN_AVATAR.indigo} flex items-center justify-center text-white text-[14px] font-semibold shrink-0`}>{o.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13.5px] font-semibold tracking-tight text-slate-900 truncate">{o.name}</div>
                          <div className="text-[11px] text-slate-500 tracking-tight truncate">{o.industry}</div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-semibold tracking-tight ring-1 ${
                          locked ? "bg-slate-100 text-slate-500 ring-slate-200" : done ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-indigo-50 text-indigo-700 ring-indigo-100"
                        }`}>
                          {locked && <Icon name="lock" size={9} />}
                          {locked ? "Locked" : done ? "Complete" : "Active"}
                        </span>
                      </div>

                      {o.context && (
                        <p className="text-[12px] text-slate-500 tracking-tight leading-relaxed line-clamp-2" style={{ textWrap: "pretty" }}>{o.context}</p>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Projects", value: o.projects.length },
                          { label: "Tasks", value: s.total },
                          { label: "Done", value: s.done },
                        ].map((m) => (
                          <div key={m.label} className="rounded-lg bg-white ring-1 ring-slate-200/60 px-2 py-1.5 text-center">
                            <div className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">{m.value}</div>
                            <div className="text-[10px] text-slate-500 tracking-tight">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <Bar pct={s.pct || (locked ? 0 : 2)} tone={done ? "emerald" : locked ? "slate" : "indigo"} className="flex-1" />
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{s.pct}%</span>
                      </div>

                      <div className="flex items-center gap-2 pt-3 mt-auto border-t border-slate-200/60">
                        {locked ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><Icon name="lock" size={11} /> Unlocks later in the track</span>
                        ) : done ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600"><Icon name="check" size={12} strokeWidth={3} /> Engagement complete</span>
                        ) : next ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400 shrink-0">Next</span>
                            <DVerb verbId={next.verb} />
                            <span className="text-[11.5px] text-slate-600 tracking-tight truncate">{next.title}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No open steps</span>
                        )}
                        <Icon name="arrowRight" size={14} className="text-slate-300 shrink-0 ml-auto transition-colors group-hover:text-indigo-500" />
                      </div>
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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

          {/* Standards coverage */}
          <StandardsCoverage standards={standards} engaged={progress?.standardsEngaged ?? []} />
        </div>
      </div>
      </Reveal>

      {/* Org detail panel */}
      <Drawer open={!!activeOrg} onClose={() => setActiveOrg(null)} eyebrow="Organisation context" title={activeOrg?.name}>
        {activeOrg && <OrgDetail org={activeOrg} />}
      </Drawer>

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · GRC 101 · Foundations</div>
    </div>
  );
}
