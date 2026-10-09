"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { DVerb } from "@/components/ui/dverb";
import { VERB_TONES } from "@/lib/tones";
import { TASK_META } from "@/lib/taskmeta";
import { isGateVerb } from "@/lib/verbs";
import type { LearningOrg, LearningTask } from "@/lib/learnings";
import { useDeskBase, useDeskLearnings, useDeskRoute, useDeskStepFilter } from "./desk-context";
import { dueChip } from "@/lib/schedule";
import { prefetchStep } from "@/lib/desk";
import { prefetchTaskBundle } from "@/lib/task-bundle";

type TaskState = "complete" | "current" | "locked";
type StepState = "complete" | "current" | "locked";

/** Map the backend's authoritative step status to a display state. */
function stepState(status?: string): StepState {
  if (status === "complete") return "complete";
  if (status === "current" || status === "in-progress") return "current";
  return "locked";
}

/** Derive task state from its steps' authoritative statuses. */
function taskState(t: LearningTask): TaskState {
  const states = t.steps.map((s) => stepState(s.status));
  if (states.length > 0 && states.every((s) => s === "complete")) return "complete";
  if (states.some((s) => s === "current")) return "current";
  return "locked";
}

const dotCls = (s: StepState) => (s === "complete" ? "bg-emerald-500" : s === "current" ? "bg-amber-500" : "bg-slate-300");

function TaskNode({ task, state, activeId, activeTaskCode }: { task: LearningTask; state: TaskState; activeId?: string; activeTaskCode?: string }) {
  const base = useDeskBase();
  // `/me/activities/...` is the signed-in learner's own step. On a mentor's desk the tree is
  // somebody else's, so nothing there may be warmed from those endpoints.
  const warmable = base === "/app/desk";
  // On a mentor's desk only the reviewable steps are listed — see useDeskStepFilter. The learner's
  // own desk passes null and sees every step, unchanged.
  const stepFilter = useDeskStepFilter();
  const steps = stepFilter ? task.steps.filter((s) => stepFilter.has(s.id)) : task.steps;
  const meta = TASK_META[task.code];
  const { scheduleByActivity } = useDeskLearnings();
  const onThisTask = task.code === activeTaskCode || task.steps.some((s) => s.id === activeId);
  // Next actionable deadline for the current task: the earliest not-yet-done step's planned day.
  const nextDue = state === "current"
    ? task.steps.filter((s) => stepState(s.status) !== "complete").map((s) => scheduleByActivity.get(s.id)).find(Boolean)
    : undefined;
  // Only the active/current task is expanded by default; reactively open it as progress moves here.
  const shouldOpen = onThisTask || state === "current";
  const [open, setOpen] = useState(shouldOpen);
  useEffect(() => { if (shouldOpen) setOpen(true); }, [shouldOpen]);
  const tone = meta ? VERB_TONES[meta.standardTone] ?? VERB_TONES.indigo : VERB_TONES.indigo;
  const locked = state === "locked";

  // Two-shade highlight: a directly-selected task gets the strong "you are here" treatment;
  // a task that merely *contains* the active verb gets a softer ambient tint so the verb row
  // stays the visually primary selection.
  const taskRowCls =
    activeTaskCode === task.code
      ? "bg-indigo-50 ring-1 ring-indigo-100"
      : onThisTask
        ? "bg-indigo-50/50"
        : "";

  return (
    <div>
      <div data-tour={onThisTask ? "desk-task" : undefined} className={`flex items-center gap-1 rounded-lg ${taskRowCls}`}>
        <button onClick={() => setOpen((o) => !o)} className="w-6 h-7 flex items-center justify-center shrink-0 text-slate-400 hover:text-slate-600" aria-label="Toggle actions">
          <Icon name="chevronRight" size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <Link href={`${base}/task/${task.code}`} onMouseEnter={warmable ? () => prefetchTaskBundle(task.code) : undefined} data-desk-active={activeTaskCode === task.code || undefined} className="flex-1 min-w-0 py-1.5 pr-2 no-underline">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center h-[16px] px-1.5 rounded text-[9.5px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>{meta?.standardLabel ?? task.standards}</span>
            {state === "complete" && <Icon name="check" size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />}
            {locked && <Icon name="lock" size={11} className="text-slate-300 shrink-0" />}
            <span className="text-[10px] text-slate-400 tabular-nums ml-auto shrink-0">{task.done}/{task.total}</span>
          </div>
          <div className={`text-[12px] tracking-tight truncate mt-0.5 ${onThisTask ? "text-indigo-700 font-medium" : locked ? "text-slate-400" : "text-slate-800"}`}>
            {meta?.name ?? task.title}
          </div>
          {nextDue && (() => { const c = dueChip(nextDue); return (
            <span className={`inline-flex items-center gap-1 h-[15px] px-1.5 mt-1 rounded text-[9px] font-medium ring-1 ${c.cls}`}>
              <Icon name="calendar" size={9} /> {c.text}
            </span>
          ); })()}
        </Link>
      </div>

      {open && (
        <div data-tour={onThisTask ? "desk-steps" : undefined} className="ml-6 pl-2 border-l border-slate-200 py-0.5">
          {steps.map((s) => {
            const ss = stepState(s.status);
            const active = s.id === activeId;
            // Task-boundary gates (RUA readiness / Research Submission) get a distinct shield node
            // instead of the plain step dot — they gate the task, they aren't one of its actions.
            const gate = isGateVerb(s.verb);
            const inner = (
              <>
                {gate ? (
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${ss === "complete" ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600"}`}>
                    <Icon name={s.verb === "rua" ? "shield" : "globe"} size={9} />
                  </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(ss)}`} />
                )}
                {/* The step number is the learner's way of finding their place in a run of ten.
                    A mentor sees only the two they review, so "4" and "7" name positions in a
                    sequence that is not on their screen. */}
                {!stepFilter && (
                  <span className="font-mono text-[9.5px] text-slate-400 shrink-0 w-6">{s.code}</span>
                )}
                <DVerb verbId={s.verb} />
                <span className={`text-[11.5px] tracking-tight truncate flex-1 ${active ? "text-indigo-700 font-medium" : ss === "locked" ? "text-slate-400" : gate ? "text-violet-700" : "text-slate-600"}`}>{s.title}</span>
                {gate && ss !== "locked" && <span className="inline-flex items-center h-[15px] px-1 rounded bg-violet-50 ring-1 ring-violet-200 text-violet-600 text-[8.5px] font-semibold tracking-[0.08em] shrink-0">{s.verb === "rua" ? "RUA" : "RESEARCH"}</span>}
                {ss === "locked" && <Icon name="lock" size={10} className="text-slate-300 shrink-0" />}
                {ss === "current" && !active && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />}
              </>
            );
            return ss === "locked" ? (
              <div key={s.id} data-desk-active={active || undefined} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-not-allowed opacity-70" title="Complete the previous step first">{inner}</div>
            ) : (
              // Hover starts the step's two reads early (see lib/desk.prefetchStep). Only on the
              // learner's own desk: the mentor's tree points at another learner, whose steps those
              // endpoints do not serve. Locked steps aren't links, so none is ever warmed.
              <Link key={s.id} href={`${base}/${s.id}`} onMouseEnter={warmable ? () => prefetchStep(s.id) : undefined} onFocus={warmable ? () => prefetchStep(s.id) : undefined} data-desk-active={active || undefined} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg no-underline transition-colors ${active ? "bg-indigo-50 ring-1 ring-indigo-100" : gate ? "bg-violet-50/40 hover:bg-violet-50" : "hover:bg-slate-100/70"}`}>{inner}</Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryNode({ category, tasks, taskStates, activeId, activeTaskCode }: { category: string; tasks: LearningTask[]; taskStates: Map<string, TaskState>; activeId?: string; activeTaskCode?: string }) {
  // Open only the category that holds the active/current task; others stay collapsed (still toggle-able).
  const hasActive = tasks.some(
    (t) => t.code === activeTaskCode || t.steps.some((s) => s.id === activeId) || taskStates.get(t.code) === "current",
  );
  const [open, setOpen] = useState(hasActive);
  useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-100/70 text-left">
        <Icon name="chevronDown" size={13} className={`text-slate-400 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
        <Icon name="layers" size={13} className="text-indigo-500 shrink-0" />
        <span className="text-[11.5px] font-semibold tracking-tight text-slate-700 uppercase">{category}</span>
        <span className="ml-auto text-[10px] text-slate-400 tabular-nums">{tasks.length}</span>
      </button>
      {open && (
        <div className="ml-3 pl-1 border-l border-slate-200 space-y-0.5">
          {tasks.map((t) => <TaskNode key={t.id} task={t} state={taskStates.get(t.code) ?? "locked"} activeId={activeId} activeTaskCode={activeTaskCode} />)}
        </div>
      )}
    </div>
  );
}

type OrgState = "complete" | "active" | "locked";

/** Map a placement's backend status to a display state. Anything not complete or accessible is locked. */
function orgDisplayState(org: LearningOrg): OrgState {
  if (org.status === "complete") return "complete";
  if (org.status === "locked" || org.status === "upcoming") return "locked";
  return "active";
}

/**
 * One placement's tasks: its method categories, and nothing above them.
 *
 * The organisation level used to live here as a node per placement. It is a band across the top of
 * the desk now (`DeskOrgStrip`) — eight placement headers stacked above the tree spent the rail's
 * height on rows that are not work, and pushed the tasks of the one being worked below the fold.
 */
function OrgTree({ org, activeId, activeTaskCode }: {
  org: LearningOrg;
  activeId?: string;
  activeTaskCode?: string;
}) {
  const stepFilter = useDeskStepFilter();

  // Flatten this placement's tasks + derive per-task state and method-category grouping.
  // On a mentor's desk a task with no reviewable step is noise, so it is dropped here rather than
  // rendered as an empty node — and a category whose tasks all drop goes with it, since `byCat` is
  // built from this list. The learner's desk has no filter and keeps every task.
  const all: LearningTask[] = [];
  org.projects.forEach((p) => p.tasks.forEach((t) => all.push(t)));
  const tasks = stepFilter ? all.filter((t) => t.steps.some((s) => stepFilter.has(s.id))) : all;
  const taskStates = new Map<string, TaskState>();
  tasks.forEach((t) => taskStates.set(t.code, taskState(t)));

  const byCat = new Map<string, LearningTask[]>();
  tasks.forEach((t) => {
    const cat = TASK_META[t.code]?.methodCategory ?? "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(t);
  });
  // Categories are emitted in the order their first task appears, NOT in taxonomy order — the same
  // rule `regroup_orgs` applies to organisations, and for the same reason. Progression unlocks
  // tasks in tree order, so sorting the groups by METHOD_CATEGORY_ORDER silently reordered the
  // programme on screen: a learner whose first unlocked task sat in a late category (Project
  // Execution is 14th of 16) saw three locked categories stacked above the one task they could
  // actually start. Map preserves insertion order, and `tasks` is already in unlock order.
  const cats = [...byCat.keys()];

  if (tasks.length === 0) {
    return <div className="px-2 py-6 text-center text-[12px] text-slate-500">No tasks in this placement yet.</div>;
  }

  return (
    <div className="space-y-0.5">
      {cats.map((c) => (
        <CategoryNode key={c} category={c} tasks={byCat.get(c)!} taskStates={taskStates} activeId={activeId} activeTaskCode={activeTaskCode} />
      ))}
    </div>
  );
}


function SidebarShell({ children, footer, scrollRef }: { children: React.ReactNode; footer?: React.ReactNode; scrollRef?: React.Ref<HTMLDivElement> }) {
  return (
    <aside data-tour="desk-tree" className="w-[288px] 2xl:w-[344px] 3xl:w-[380px] shrink-0 h-full border-r border-slate-200 bg-white/50 flex flex-col">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">{children}</div>
      {footer}
    </aside>
  );
}

export function DeskSidebar() {
  const { learnings, loading } = useDeskLearnings();
  // Route-derived, and shared with the organisation band above the desk so the two can never
  // disagree about which placement is on screen.
  const { activeTaskCode, activeId, orgId } = useDeskRoute();

  // Opening a step or task by link (Up next, calendar, a mentor's worklist) has to *show* it: the
  // tree is ~350 rows tall, so the highlighted row is usually below the fold on arrival. The nodes
  // holding it are already open on their first render, so the marked row exists by the time this runs.
  const railRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    railRef.current?.querySelector("[data-desk-active]")?.scrollIntoView({ block: "center" });
  }, [activeId, activeTaskCode, learnings]);

  if (loading && !learnings) {
    return (
      <SidebarShell>
        <div className="px-2 py-3 space-y-3 animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-200" />
              <div className="h-3 rounded bg-slate-200" style={{ width: `${70 - i * 8}%` }} />
            </div>
          ))}
        </div>
      </SidebarShell>
    );
  }

  const orgs = learnings?.orgs ?? [];
  const org = orgs.find((o) => o.id === orgId);

  // Overall program progress — pinned to the rail's footer so the lower area always reads as
  // intentional chrome rather than blank space, regardless of how short the tree is.
  let done = 0, total = 0;
  orgs.forEach((o) => o.projects.forEach((p) => p.tasks.forEach((t) => { done += t.done; total += t.total; })));
  const pct = total ? Math.round((done / total) * 100) : 0;
  const progressFooter = total > 0 ? (
    <div data-tour="desk-progress" className="shrink-0 border-t border-slate-200 px-3.5 py-3 bg-white/40">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold tracking-tight text-slate-700">GRC 101 · Foundations</span>
        <span className="text-[10.5px] text-slate-400 tabular-nums">{done}/{total}</span>
      </div>
      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  ) : undefined;

  return (
    <SidebarShell footer={progressFooter} scrollRef={railRef}>
      {!org ? (
        <div className="px-2 py-6 text-center text-[12px] text-slate-500">No placements yet.</div>
      ) : orgDisplayState(org) === "locked" ? (
        // Reachable by typing the URL of a placement that has not opened yet. The band above still
        // shows every one of them, so this says why the tree is empty rather than leaving it blank.
        <div className="px-3 py-6 text-center text-[12px] text-slate-500">
          {org.name} has not started yet. Finish the placement before it to open these tasks.
        </div>
      ) : (
        <OrgTree org={org} activeId={activeId} activeTaskCode={activeTaskCode} />
      )}
    </SidebarShell>
  );
}
