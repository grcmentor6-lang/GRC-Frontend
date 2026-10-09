"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, Bar } from "@/components/ui/primitives";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { SOFT_TONES } from "@/lib/tones";
import { BADGES, type BadgeDef } from "@/lib/badges";
import { BadgeMedal, type MedalState } from "@/components/app/badge-medal";
import { learningsApi, type Learnings } from "@/lib/learnings";
import { ExtendAccessCard } from "@/components/app/extend-access-card";

interface BadgeProgress extends BadgeDef { done: number; total: number; state: MedalState; pct: number }

function compute(badge: BadgeDef, status: Record<string, string>): BadgeProgress {
  const total = badge.taskCodes.length;
  const done = badge.taskCodes.filter((c) => status[c] === "complete").length;
  const state: MedalState = total > 0 && done === total ? "earned" : done > 0 ? "in-progress" : "locked";
  return { ...badge, done, total, state, pct: total ? Math.round((done / total) * 100) : 0 };
}

const STATE_CHIP: Record<MedalState, { label: string; cls: string }> = {
  earned: { label: "Earned", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  "in-progress": { label: "In progress", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  locked: { label: "Locked", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export default function BadgesPage() {
  const [learnings, setLearnings] = useState<Learnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    learningsApi.get("grc101").then((l) => !cancelled && setLearnings(l)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const { badges, earned, inProgress, tasksDone, tasksTotal } = useMemo(() => {
    const status: Record<string, string> = {};
    learnings?.orgs.forEach((o) => o.projects.forEach((p) => p.tasks.forEach((t) => { status[t.code] = t.status; })));
    const badges = BADGES.map((b) => compute(b, status));
    return {
      badges,
      earned: badges.filter((b) => b.state === "earned").length,
      inProgress: badges.filter((b) => b.state === "in-progress").length,
      tasksDone: badges.reduce((n, b) => n + b.done, 0),
      tasksTotal: badges.reduce((n, b) => n + b.total, 0),
    };
  }, [learnings]);

  const kpis: { icon: IconName; tone: string; value: string | number; label: string }[] = [
    { icon: "ribbon", tone: "emerald", value: earned, label: "Badges earned" },
    { icon: "history", tone: "indigo", value: inProgress, label: "In progress" },
    { icon: "star", tone: "amber", value: BADGES.length, label: "Available" },
    { icon: "checkSquare", tone: "violet", value: `${tasksDone}/${tasksTotal}`, label: "Tasks completed" },
  ];

  return (
    <div className="page-shell space-y-4">
      <div className="flex items-start gap-3.5">
        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(245,158,11,0.6)] shrink-0">
          <Icon name="ribbon" size={20} />
        </span>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Badges</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-xl" style={{ textWrap: "pretty" }}>
            Credential badges you earn by completing mentor-graded tasks — they compile onto your CV and certificate.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCardGrid cards={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((s) => (
              <Card key={s.label} className="flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${SOFT_TONES[s.tone] ?? SOFT_TONES.indigo}`}><Icon name={s.icon} size={17} /></div>
                <div>
                  <div className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900 leading-none tabular-nums">{s.value}</div>
                  <div className="text-[11.5px] text-slate-500 tracking-tight mt-1">{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3">
            {badges.map((b) => (
              <Card key={b.id} className="flex flex-col items-center gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
                <BadgeMedal badge={b} state={b.state} className="w-full max-w-[148px]" />
                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h3 className={`text-[13.5px] font-semibold tracking-tight ${b.state === "locked" ? "text-slate-500" : "text-slate-900"}`}>{b.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${STATE_CHIP[b.state].cls}`}>{STATE_CHIP[b.state].label}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mt-1">{b.code}</div>
                  <p className="text-[12px] text-slate-500 tracking-tight mt-2 leading-relaxed" style={{ textWrap: "pretty" }}>{b.blurb}</p>
                  {/* What the badge says about their judgment, not their throughput. Task count
                      is what earns it; this is what it means. */}
                  <p className="text-[11.5px] text-slate-600 tracking-tight mt-2 leading-relaxed" style={{ textWrap: "pretty" }}>
                    <span className="font-medium text-slate-700">Certifies:</span> {b.certifies}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {b.competences.map((c) => (
                      <span key={c} className="inline-flex items-center h-[19px] px-2 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200/70 text-[10.5px] font-medium tracking-tight">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Bar pct={b.pct || 2} tone={b.state === "earned" ? "emerald" : b.state === "in-progress" ? "indigo" : "slate"} className="flex-1" />
                    <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{b.done}/{b.total} tasks</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {!loading && earned > 0 && <ExtendAccessCard kind="badge" />}

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · badges update automatically as you complete tasks</div>
    </div>
  );
}
