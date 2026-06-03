"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { VERB_TONES } from "@/lib/tones";
import { TASK_META } from "@/lib/taskmeta";
import { CONTROLS_BY_TASK } from "@/lib/controls";
import type { LearningTask } from "@/lib/learnings";
import { useDeskLearnings } from "@/components/app/desk-context";

function MetaItem({ icon, label, value }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-8 h-8 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-500 shrink-0"><Icon name={icon} size={15} /></span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-400">{label}</div>
        <div className="text-[12.5px] text-slate-800 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

export default function TaskOverview() {
  const { taskCode } = useParams<{ taskCode: string }>();
  const meta = TASK_META[taskCode];
  const reg = CONTROLS_BY_TASK[taskCode];
  const { learnings, loading } = useDeskLearnings();
  const task: LearningTask | null = useMemo(() => {
    if (!learnings) return null;
    for (const o of learnings.orgs) for (const p of o.projects) {
      const t = p.tasks.find((x) => x.code === taskCode);
      if (t) return t;
    }
    return null;
  }, [learnings, taskCode]);

  const tone = meta ? VERB_TONES[meta.standardTone] ?? VERB_TONES.indigo : VERB_TONES.indigo;
  const nextStep = task?.steps.find((s) => s.status !== "complete") ?? task?.steps[0];

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" /></div>;

  return (
    <div className="max-w-[920px] mx-auto px-8 py-7 space-y-5">
      {/* header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {meta && <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-indigo-50 text-indigo-600 ring-indigo-100"><Icon name="layers" size={12} /> {meta.methodCategory}</span>}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center justify-center px-2 h-7 rounded-md bg-slate-900 text-white text-[12px] font-mono font-semibold">{taskCode}</span>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-slate-900">{meta?.name ?? task?.title ?? taskCode}</h1>
          {meta && <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}><Icon name="shield" size={12} /> {meta.standardLabel}</span>}
        </div>
      </div>

      {/* description */}
      {meta?.description && (
        <Card>
          <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Task description</h2>
          <p className="text-[13.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{meta.description}</p>
          {meta.deliverable && (
            <div className="mt-4 rounded-xl bg-indigo-50/40 ring-1 ring-indigo-100 p-3.5">
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-indigo-600 mb-1">Final deliverable</div>
              <p className="text-[12.5px] text-slate-700 tracking-tight" style={{ textWrap: "pretty" }}>{meta.deliverable}</p>
            </div>
          )}
        </Card>
      )}

      {/* meta grid */}
      {meta && (
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetaItem icon="bot" label="Mentor" value={meta.mentorRole + (meta.persona ? ` · ${meta.persona}` : "")} />
            <MetaItem icon="calendar" label="Duration" value={meta.duration} />
            <MetaItem icon="ribbon" label="Badge on completion" value={meta.badge} />
            <MetaItem icon="target" label="NIST CSF cross-reference" value={meta.nistCrossRef} />
          </div>
        </Card>
      )}

      {/* actions / verbs */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Actions</h2>
          {nextStep && (
            <Link href={`/app/desk/${nextStep.id}`} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium hover:bg-indigo-700 transition-colors no-underline">
              <Icon name="play" size={13} /> {task?.done ? "Continue" : "Start task"}
            </Link>
          )}
        </div>
        <div className="space-y-1.5">
          {task?.steps.map((s) => {
            const done = s.status === "complete";
            return (
              <Link key={s.id} href={`/app/desk/${s.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl ring-1 ring-slate-200/60 bg-white hover:bg-slate-50 no-underline transition-colors group">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ring-1 shrink-0 ${done ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : s.status === "in-progress" ? "bg-indigo-50 text-indigo-600 ring-indigo-100" : "bg-slate-50 text-slate-300 ring-slate-200/60"}`}>
                  <Icon name={done ? "check" : "minus"} size={11} strokeWidth={done ? 3 : 2} />
                </span>
                <span className="font-mono text-[10.5px] text-slate-400 w-7 shrink-0">{s.code}</span>
                <DVerb verbId={s.verb} />
                <span className="text-[12.5px] text-slate-700 tracking-tight truncate flex-1">{s.title}</span>
                <Icon name="arrowRight" size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
              </Link>
            );
          })}
        </div>
      </Card>

      {/* controls register */}
      {reg && reg.controls.length > 0 && (
        <Card>
          <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-3">Control references</h2>
          <div className="space-y-2">
            {reg.controls.map((c, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/50 p-3">
                <span className="font-mono text-[10.5px] text-slate-600 bg-white ring-1 ring-slate-200/70 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">{c.num}</span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{c.name}</div>
                  <div className="text-[11.5px] text-slate-500 tracking-tight" style={{ textWrap: "pretty" }}>{c.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
