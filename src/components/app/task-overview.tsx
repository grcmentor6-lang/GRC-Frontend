"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { DraggablePanel } from "@/components/ui/draggable-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { DVerb } from "@/components/ui/dverb";
import { TASK_META } from "@/lib/taskmeta";
import { isGateVerb } from "@/lib/verbs";
import { CONTROLS_BY_TASK } from "@/lib/controls";
import type { LearningTask } from "@/lib/learnings";
import { useDeskBase, useDeskLearnings, useDeskStepFilter } from "@/components/app/desk-context";
import { LockedNotice } from "@/components/app/locked-notice";
import { useTaskBundle } from "@/lib/task-bundle";
import { StandardBanner } from "@/components/app/standards";
import { ControlReferences } from "@/components/app/control-references";
import { gloss } from "@/components/app/glossary";
import { dueChip, fmtDue, type ScheduleItem } from "@/lib/schedule";

/**
 * A task's brief: what the engagement asks for, the controls behind it, and its steps.
 *
 * Shared by the learner's Working Desk and the mentor's Review Desk. The mentor mounts it against
 * the mentee's own tree and the mentee's own curriculum bundle, so the brief a reviewer reads is
 * the brief that was worked to — every learner rotates through a different organisation, and
 * judging Manila's answer against Berlin's brief is how correct work gets marked down.
 */
export function TaskOverview() {
  const { taskCode } = useParams<{ taskCode: string }>();
  // Where step links point, and which steps are listed. The learner sees all of them at
  // /app/desk; a mentor sees only the ones they review, under /mentor/desk/<menteeId>.
  const base = useDeskBase();
  const stepFilter = useDeskStepFilter();
  // A reviewer reads this brief; they never work the task. "Start task" is the learner's verb and
  // would be a lie on their desk — the step it points at is somebody else's to do.
  const reviewing = base.startsWith("/mentor");
  const meta = TASK_META[taskCode];
  const reg = CONTROLS_BY_TASK[taskCode];
  const { learnings, loading, scheduleByActivity } = useDeskLearnings();
  // The task objective is proprietary curriculum content, fetched per-task from the gated
  // endpoint rather than bundled. Name/description/deliverable stay in TASK_META (public catalogue).
  const { bundle } = useTaskBundle(taskCode);
  const objective = bundle?.overview?.objective;
  const [controlsOpen, setControlsOpen] = useState(false);
  const task: LearningTask | null = useMemo(() => {
    if (!learnings) return null;
    for (const o of learnings.orgs) for (const p of o.projects) {
      const t = p.tasks.find((x) => x.code === taskCode);
      if (t) return t;
    }
    return null;
  }, [learnings, taskCode]);

  // Task target = the latest planned day among its steps; status rolls up from the steps.
  const taskDue = useMemo(() => {
    const sched = (task?.steps ?? [])
      .map((s) => scheduleByActivity.get(s.id))
      .filter((x): x is ScheduleItem => !!x);
    if (!sched.length) return null;
    const latest = sched.reduce((a, b) => (a.date >= b.date ? a : b));
    const status = sched.every((s) => s.status === "done")
      ? "done"
      : sched.some((s) => s.status === "overdue")
        ? "overdue"
        : "upcoming";
    return { date: latest.date, status } as const;
  }, [task, scheduleByActivity]);


  const nextStep = task?.steps.find((s) => s.status !== "complete") ?? task?.steps[0];

  // Glossary: objective + final deliverable share one "seen" set, so each term is underlined
  // once on the card rather than at every mention.
  const uid = useId();
  const seen = new Set<string>();

  if (loading) {
    return (
      <div className="max-w-[920px] 2xl:max-w-[1280px] 3xl:max-w-[1440px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5 animate-pulse">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-2/3 max-w-md" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Same rule as the step screen: a task reached by URL before it opens says so, rather than
  // handing out its brief and a step list where every row is a dead link. A reviewer is exempt —
  // they read the brief of a task their mentee has not started yet.
  if (!reviewing && task?.status === "locked") {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-10">
        <LockedNotice what="task" />
      </div>
    );
  }

  return (
    <div className="max-w-[920px] 2xl:max-w-[1280px] 3xl:max-w-[1440px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5">
      {/* standard banner — one per task: framework, domain, task description; controls chip opens the drawer */}
      <div data-tour="task-banner">
        <StandardBanner taskCode={taskCode} onControls={reg && reg.controls.length > 0 ? () => setControlsOpen(true) : undefined} />
      </div>

      {/* header */}
      <div>
        {meta && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-indigo-50 text-indigo-600 ring-indigo-100"><Icon name="layers" size={12} /> {meta.methodCategory}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-slate-900">{meta?.name ?? task?.title ?? taskCode}</h1>
          {meta?.badge && (
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-amber-50 text-amber-700 ring-amber-100" title="Badge earned on completion">
              <Icon name="ribbon" size={12} /> {meta.badge}
            </span>
          )}
          {taskDue && (() => { const c = dueChip(taskDue); return (
            <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 ${c.cls}`} title={`Target completion — ${fmtDue(taskDue.date)}`}>
              <Icon name="calendar" size={12} /> {c.text}
            </span>
          ); })()}
        </div>
      </div>

      {/* objective — the task description now heads the banner above; keep only a distinct
          objective line (when one exists) plus the final deliverable here to avoid repeating it */}
      {(objective || meta?.deliverable) && (
        <div data-tour="task-objective">
        <Card>
          <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Objective</h2>
          {objective && <p className="text-[13.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{gloss(objective, seen, `${uid}o`)}</p>}
          {meta?.deliverable && (
            <div className="mt-4 rounded-xl bg-indigo-50/40 ring-1 ring-indigo-100 p-3.5">
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-indigo-600 mb-1">Final deliverable</div>
              <p className="text-[12.5px] text-slate-700 tracking-tight" style={{ textWrap: "pretty" }}>{gloss(meta.deliverable, seen, `${uid}d`)}</p>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* controls register — opens in a drawer */}
      {reg && reg.controls.length > 0 && (
        <button
          data-tour="task-controls"
          onClick={() => setControlsOpen(true)}
          className="focus-ring w-full flex items-center gap-3 text-left rounded-xl ring-1 ring-slate-200 bg-white hover:bg-slate-50 px-3.5 py-3 transition-colors group"
        >
          <span className="w-9 h-9 rounded-lg bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Icon name="shield" size={16} /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-900 tracking-tight">Control references</span>
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold tabular-nums">{reg.controls.length}</span>
            </span>
            <span className="block text-[12px] text-slate-500 tracking-tight mt-0.5" style={{ textWrap: "pretty" }}>The clauses and controls this task is graded against — read them before you start.</span>
          </span>
          <Icon name="arrowRight" size={15} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
        </button>
      )}
      <DraggablePanel open={controlsOpen} onClose={() => setControlsOpen(false)} title="Control references" eyebrow={meta?.standardLabel}>
        <ControlReferences taskCode={taskCode} linkToLibrary={!reviewing} />
      </DraggablePanel>

      {/* actions / verbs */}
      <div data-tour="task-actions">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">
            {reviewing ? "Steps you review" : "Actions"}
          </h2>
          {nextStep && !reviewing && (
            <Link data-tour="task-start" href={`${base}/${nextStep.id}`} className="focus-ring inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium hover:bg-indigo-700 transition-colors no-underline shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
              <Icon name="play" size={13} /> {task?.done ? "Continue" : "Start task"}
            </Link>
          )}
        </div>
        {/* Step markers (form 05). The silhouette is a left rail plus a pin that hangs off the
            edge, and it never changes — only elevation and colour do. Exactly one step is on
            stage: the one in progress carries the shadow and the steel rail, done steps keep the
            shape and give up both, and steps not yet reached stay flat. */}
        <div className="space-y-1.5 pl-4">
          {(stepFilter ? (task?.steps ?? []).filter((s) => stepFilter.has(s.id)) : task?.steps ?? []).map((s) => {
            const done = s.status === "complete";
            const current = s.status === "in-progress";
            const gate = isGateVerb(s.verb);
            const sd = scheduleByActivity.get(s.id);
            return (
              <Link
                key={s.id}
                href={`${base}/${s.id}`}
                className={`focus-ring relative flex items-center gap-3 pl-5 pr-3 py-2.5 rounded-r-xl border border-l-0 no-underline transition-all duration-200 group ${
                  current
                    ? "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_6px_18px_-6px_rgba(15,23,42,0.25)]"
                    : done
                      ? "border-slate-200 bg-white opacity-[0.66] hover:opacity-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 bottom-0 w-[3px] ${current ? "bg-sky-700" : done ? "bg-emerald-500" : "bg-slate-200"}`}
                />
                <span
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-[11px] font-semibold tabular-nums ${
                    current
                      ? "bg-sky-700 text-white shadow-[0_4px_12px_-4px_rgba(3,105,161,0.7)]"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                  }`}
                >
                  {/* The code stays in the pin in every state. Swapping it for a tick on done
                      steps cost the learner the one place the `0`–`9` numbering is visible on
                      this page — colour already says the step is finished. */}
                  {s.code}
                </span>
                <DVerb verbId={s.verb} />
                <span className="text-[12.5px] text-slate-700 tracking-tight truncate flex-1">{s.title}</span>
                {gate && <span className="inline-flex items-center h-[16px] px-1.5 rounded bg-violet-50 ring-1 ring-violet-200 text-violet-600 text-[9px] font-semibold tracking-[0.08em] shrink-0">{s.verb === "rua" ? "RUA" : "RESEARCH"}</span>}
                {sd && !done && (() => { const c = dueChip(sd); return (
                  <span className={`hidden sm:inline-flex items-center h-[16px] px-1.5 rounded text-[9.5px] font-medium ring-1 shrink-0 ${c.cls}`} title={fmtDue(sd.date)}>{c.text}</span>
                ); })()}
                <Icon name="arrowRight" size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
              </Link>
            );
          })}
        </div>
      </Card>
      </div>
    </div>
  );
}
