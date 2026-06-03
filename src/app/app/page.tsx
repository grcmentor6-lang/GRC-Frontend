"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { DVerb } from "@/components/ui/dverb";
import { learningsApi, type Learnings, type LearningTask, type Progress } from "@/lib/learnings";
import { catalog, type RubricDimension } from "@/lib/catalog";
import { deskApi, type ActivityFeedItem } from "@/lib/desk";
import { BADGES } from "@/lib/badges";
import { SOFT_TONES } from "@/lib/tones";

const PROGRAM = "grc101";

interface Continue { activityId: string; taskCode: string; taskTitle: string; stepCode: string; verb: string; stepTitle: string }

/** Pick the task to surface: first in-progress, else first not-started. */
function deriveContinue(l: Learnings): { cont: Continue | null; activeProject: { code: string; title: string; tasks: LearningTask[] } | null } {
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
        return {
          cont: step ? { activityId: step.id, taskCode: target.code, taskTitle: target.title, stepCode: step.code, verb: step.verb, stepTitle: step.title } : null,
          activeProject: { code: proj.code, title: proj.title, tasks: proj.tasks },
        };
      }
    }
  }
  return { cont: null, activeProject: null };
}

function Stat({ icon, tone, value, sub, label }: { icon: IconName; tone: string; value: string; sub?: string; label: string }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100", emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100", amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${tones[tone]}`}><Icon name={icon} size={19} /></div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900">{value}</span>
          {sub && <span className="text-[12px] text-slate-400 font-medium">{sub}</span>}
        </div>
        <div className="text-[12px] text-slate-500 tracking-tight truncate">{label}</div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [learnings, setLearnings] = useState<Learnings | null>(null);
  const [rubric, setRubric] = useState<RubricDimension[]>([]);
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([learningsApi.progress(PROGRAM), learningsApi.get(PROGRAM), catalog.rubric(), deskApi.activityFeed(PROGRAM)]).then(
      ([p, l, r, f]) => {
        if (cancelled) return;
        if (p.status === "fulfilled") setProgress(p.value);
        if (l.status === "fulfilled") setLearnings(l.value);
        if (r.status === "fulfilled") setRubric(r.value);
        if (f.status === "fulfilled") setFeed(f.value);
        setLoading(false);
      },
    );
    return () => { cancelled = true; };
  }, []);

  const first = user?.firstName || "there";
  const { cont, activeProject } = learnings ? deriveContinue(learnings) : { cont: null, activeProject: null };

  const rubricScoreMap = new Map<string, number>();
  progress?.rubricScores.forEach((s) => { rubricScoreMap.set(s.id, s.value); rubricScoreMap.set(s.label.toLowerCase(), s.value); });
  const scoreFor = (r: RubricDimension) => rubricScoreMap.get(r.id) ?? rubricScoreMap.get(r.label.toLowerCase());
  const anyRubricScored = (progress?.rubricScores.length ?? 0) > 0;
  const rubricTone = (v: number) => (v >= 4.3 ? "emerald" : v >= 4.0 ? "indigo" : "amber");

  const completedTaskCodes = new Set<string>();
  learnings?.orgs.forEach((o) => o.projects.forEach((p) => p.tasks.forEach((t) => { if (t.status === "complete") completedTaskCodes.add(t.code); })));
  const earnedBadges = BADGES.filter((b) => b.taskCodes.length > 0 && b.taskCodes.every((c) => completedTaskCodes.has(c)));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-6 space-y-5">
      {/* Hero / continue */}
      <div className="relative overflow-hidden rounded-2xl text-white p-6 md:p-7 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.55)]" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #5b53e8 45%, #7c3aed 100%)" }}>
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
              <Link href={cont ? `/app/desk/${cont.activityId}` : "/app/desk"} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
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
          {progress && (
            <div className="shrink-0 md:w-[200px]">
              <div className="rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-4 flex items-center gap-3">
                <Ring pct={progress.overallPct} size={64} stroke={8}>
                  <span className="text-[13px] font-semibold text-white">{progress.overallPct}%</span>
                </Ring>
                <div>
                  <div className="text-[12px] font-medium tracking-tight">Program completion</div>
                  <div className="text-[11px] text-indigo-100/85 mt-0.5">Phase {progress.currentPhase} of {progress.totalPhases}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat strip */}
      {progress && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon="checkSquare" tone="indigo" value={`${progress.activitiesDone}`} sub={`/ ${progress.activitiesTotal}`} label="Activities completed" />
          <Stat icon="star" tone="amber" value={progress.reviewsCount ? progress.avgScore.toFixed(1) : "—"} sub={progress.reviewsCount ? `/ ${progress.scoreOutOf}` : undefined} label={`Avg mentor score · ${progress.reviewsCount} reviews`} />
          <Stat icon="bolt" tone="violet" value={`${progress.verbsPracticed}`} sub={`/ ${progress.verbsTotal}`} label="Method verbs practised" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Active engagement</h2>
              <Link href="/app/learnings" className="text-[11.5px] text-slate-400 hover:text-indigo-600 font-medium no-underline">View all</Link>
            </div>
            {activeProject ? (
              <div className="space-y-2.5">
                {activeProject.tasks.map((t) => {
                  const active = t.status === "in-progress";
                  const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
                  return (
                    <Link key={t.id} href="/app/learnings" className="group block rounded-xl p-3.5 ring-1 transition-all no-underline bg-slate-50/60 ring-slate-200/60 hover:bg-slate-50">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className={`shrink-0 inline-flex items-center justify-center px-1.5 h-5 rounded-md text-[10.5px] font-mono font-medium ${active ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>{t.code}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium tracking-tight text-slate-900 truncate">{t.title}</div>
                          <div className="text-[11px] text-slate-400 tracking-tight">{t.standards}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Bar pct={pct || 2} tone={active ? "indigo" : "slate"} className="flex-1" />
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{t.done}/{t.total}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500">No active engagement yet.</p>
            )}
          </Card>

          {/* Recent activity */}
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">Recent activity</h2>
            {feed.length === 0 ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-11 h-11 rounded-xl bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-400 mb-3"><Icon name="history" size={20} /></div>
                <div className="text-[13px] font-medium text-slate-700">No activity yet</div>
                <div className="text-[12px] text-slate-400 mt-0.5 max-w-xs">Mentor feedback and completed steps will appear here as you work through tasks.</div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-100" />
                <div className="space-y-4">
                  {feed.map((a, i) => {
                    const pass = a.decision === "pass";
                    return (
                      <div key={`${a.activityId}-${i}`} className="relative flex gap-3">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ring-1 shrink-0 bg-white ${pass ? "text-emerald-600 ring-emerald-100" : "text-amber-600 ring-amber-100"}`}>
                          <Icon name={pass ? "check" : "refresh"} size={14} strokeWidth={pass ? 3 : 1.9} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <DVerb verbId={a.verb} />
                            <span className="font-mono text-[10.5px] text-slate-400">{a.taskCode}·{a.activityCode}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-md bg-amber-50 ring-1 ring-amber-100">
                              <Icon name="star" size={10} className="text-amber-500" fill="currentColor" />
                              <span className="text-[10.5px] font-semibold text-amber-700 tabular-nums">{a.overallScore.toFixed(1)}</span>
                            </span>
                            <span className="text-[10.5px] text-slate-400 ml-auto">{new Date(a.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                          </div>
                          <p className="text-[12px] text-slate-600 tracking-tight mt-0.5 line-clamp-2" style={{ textWrap: "pretty" }}>{a.feedback}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Rubric */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Skill rubric</h2>
              <span className="text-[11px] text-slate-400">/ 5</span>
            </div>
            <div className="space-y-3">
              {rubric.map((r) => {
                const v = scoreFor(r);
                return (
                  <div key={r.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-slate-500 tracking-tight">{r.label}</span>
                      {v !== undefined
                        ? <span className="text-[11.5px] font-semibold text-slate-900 tabular-nums">{v.toFixed(1)}</span>
                        : <Icon name="history" size={12} className="text-slate-300" />}
                    </div>
                    <Bar pct={v !== undefined ? (v / 5) * 100 : 0} tone={v !== undefined ? rubricTone(v) : "slate"} />
                  </div>
                );
              })}
            </div>
            {!anyRubricScored && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <Icon name="info" size={13} className="text-slate-400 shrink-0" /> Scores appear after your first mentor-graded activity.
              </div>
            )}
          </Card>

          {/* Due soon — empty */}
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">Due soon</h2>
            <div className="flex items-center gap-3 text-slate-500">
              <Icon name="calendar" size={16} className="text-slate-400" />
              <span className="text-[12.5px]">Nothing due — set your own pace.</span>
            </div>
          </Card>

          {/* Badges */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Badges</h2>
              <Link href="/app/badges" className="text-[11px] text-indigo-600 font-medium no-underline hover:underline">{earnedBadges.length} of {BADGES.length} earned</Link>
            </div>
            {earnedBadges.length === 0 ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-300 mb-2"><Icon name="ribbon" size={22} /></div>
                <div className="text-[12.5px] text-slate-500 max-w-[200px]">Complete tasks to earn credential badges toward your certificate.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {earnedBadges.slice(0, 4).map((b) => (
                  <Link key={b.id} href="/app/badges" className="flex items-center gap-2.5 no-underline group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 shrink-0 ${SOFT_TONES[b.tone] ?? SOFT_TONES.indigo}`}><Icon name={b.icon} size={15} /></div>
                    <span className="text-[12.5px] text-slate-700 tracking-tight group-hover:text-slate-900 truncate">{b.name}</span>
                    <Icon name="check" size={13} strokeWidth={3} className="text-emerald-500 ml-auto shrink-0" />
                  </Link>
                ))}
                {earnedBadges.length > 4 && (
                  <Link href="/app/badges" className="block text-[11.5px] text-indigo-600 font-medium no-underline hover:underline pt-1">+{earnedBadges.length - 4} more →</Link>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · GRC 101 · Foundations</div>
    </div>
  );
}
