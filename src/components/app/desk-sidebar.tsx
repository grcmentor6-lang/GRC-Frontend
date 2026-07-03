"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { DVerb } from "@/components/ui/dverb";
import { VERB_TONES } from "@/lib/tones";
import { OrgLogo } from "@/components/app/org-logo";
import { TASK_META, METHOD_CATEGORY_ORDER } from "@/lib/taskmeta";
import { isGateVerb } from "@/lib/verbs";
import type { LearningOrg, LearningTask } from "@/lib/learnings";
import { useDeskLearnings } from "./desk-context";

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

const taskComplete = (t: LearningTask) => taskState(t) === "complete";

const dotCls = (s: StepState) => (s === "complete" ? "bg-emerald-500" : s === "current" ? "bg-amber-500" : "bg-slate-300");

function TaskNode({ task, state, activeId, activeTaskCode }: { task: LearningTask; state: TaskState; activeId?: string; activeTaskCode?: string }) {
  const meta = TASK_META[task.code];
  const onThisTask = task.code === activeTaskCode || task.steps.some((s) => s.id === activeId);
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
      <div className={`flex items-center gap-1 rounded-lg ${taskRowCls}`}>
        <button onClick={() => setOpen((o) => !o)} className="w-6 h-7 flex items-center justify-center shrink-0 text-slate-400 hover:text-slate-600" aria-label="Toggle actions">
          <Icon name="chevronRight" size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <Link href={`/app/desk/task/${task.code}`} className="flex-1 min-w-0 py-1.5 pr-2 no-underline">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center h-[16px] px-1.5 rounded text-[9.5px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>{meta?.standardLabel ?? task.standards}</span>
            {state === "complete" && <Icon name="check" size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />}
            {locked && <Icon name="lock" size={11} className="text-slate-300 shrink-0" />}
            <span className="text-[10px] text-slate-400 tabular-nums ml-auto shrink-0">{task.done}/{task.total}</span>
          </div>
          <div className={`text-[12px] tracking-tight truncate mt-0.5 ${onThisTask ? "text-indigo-700 font-medium" : locked ? "text-slate-400" : "text-slate-800"}`}>
            <span className="font-mono text-[10px] text-slate-400 mr-1">{task.code}</span>{meta?.name ?? task.title}
          </div>
        </Link>
      </div>

      {open && (
        <div className="ml-6 pl-2 border-l border-slate-200/70 py-0.5">
          {task.steps.map((s) => {
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
                <span className="font-mono text-[9.5px] text-slate-400 shrink-0 w-6">{s.code}</span>
                <DVerb verbId={s.verb} />
                <span className={`text-[11.5px] tracking-tight truncate flex-1 ${active ? "text-indigo-700 font-medium" : ss === "locked" ? "text-slate-400" : gate ? "text-violet-700" : "text-slate-600"}`}>{s.title}</span>
                {gate && ss !== "locked" && <span className="inline-flex items-center h-[15px] px-1 rounded bg-violet-50 ring-1 ring-violet-200 text-violet-600 text-[8.5px] font-semibold tracking-[0.08em] shrink-0">GATE</span>}
                {ss === "locked" && <Icon name="lock" size={10} className="text-slate-300 shrink-0" />}
                {ss === "current" && !active && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />}
              </>
            );
            return ss === "locked" ? (
              <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-not-allowed opacity-70" title="Complete the previous step first">{inner}</div>
            ) : (
              <Link key={s.id} href={`/app/desk/${s.id}`} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg no-underline transition-colors ${active ? "bg-indigo-50 ring-1 ring-indigo-100" : gate ? "bg-violet-50/40 hover:bg-violet-50" : "hover:bg-slate-100/70"}`}>{inner}</Link>
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
        <div className="ml-3 pl-1 border-l border-slate-200/70 space-y-0.5">
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

/** A whole placement (organisation): a rich header + its category→task→step tree. Locked placements
 *  are disabled until the previous one is complete; completed ones collapse but stay open-able.
 *  Clicking the header (non-locked) opens the org-context page; the chevron toggles the tree. */
function OrgNode({ org, defaultOpen, activeId, activeTaskCode, contextActive, lockedHint }: {
  org: LearningOrg;
  defaultOpen: boolean;
  activeId?: string;
  activeTaskCode?: string;
  contextActive: boolean;
  lockedHint: string;
}) {
  const state = orgDisplayState(org);
  const locked = state === "locked";
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => { if (defaultOpen) setOpen(true); }, [defaultOpen]);

  // Flatten this placement's tasks + derive per-task state and method-category grouping.
  const tasks: LearningTask[] = [];
  org.projects.forEach((p) => p.tasks.forEach((t) => tasks.push(t)));
  const taskStates = new Map<string, TaskState>();
  tasks.forEach((t) => taskStates.set(t.code, taskState(t)));
  const doneTasks = tasks.filter(taskComplete).length;

  const byCat = new Map<string, LearningTask[]>();
  tasks.forEach((t) => {
    const cat = TASK_META[t.code]?.methodCategory ?? "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(t);
  });
  const cats = [...byCat.keys()].sort((a, b) => {
    const ia = METHOD_CATEGORY_ORDER.indexOf(a), ib = METHOD_CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const pct = tasks.length ? (doneTasks / tasks.length) * 100 : 0;
  const expandable = !locked && tasks.length > 0;

  const header = (
    <>
      <OrgLogo org={org} className="w-8 h-8 rounded-lg text-[11px]" iconSize={16} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[12.5px] font-semibold tracking-tight truncate ${locked ? "text-slate-400" : contextActive ? "text-indigo-700" : "text-slate-900"}`}>{org.name}</span>
          {state === "complete" && <Icon name="check" size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />}
          {locked && <Icon name="lock" size={11} className="text-slate-300 shrink-0" />}
        </div>
        <div className={`text-[10.5px] tracking-tight truncate ${locked ? "text-slate-400" : "text-slate-500"}`}>{org.industry}</div>
      </div>
    </>
  );

  return (
    <div className={`rounded-xl ${contextActive ? "ring-1 ring-indigo-200 bg-indigo-50/60" : state === "active" ? "ring-1 ring-indigo-100 bg-indigo-50/30" : ""}`}>
      <div className="flex items-center gap-1 pr-1.5">
        {locked ? (
          <div title={lockedHint} className="flex-1 flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-not-allowed">{header}</div>
        ) : (
          <Link href={`/app/desk/org/${org.id}`} className="flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl no-underline hover:bg-slate-100/50 transition-colors">{header}</Link>
        )}
        {expandable && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle tasks"
            className="shrink-0 w-6 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100/50"
          >
            <Icon name="chevronDown" size={13} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
          </button>
        )}
      </div>

      {!locked && tasks.length > 0 && (
        <div className="px-2.5 pb-2 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full transition-all ${state === "complete" ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} /></div>
          <span className="text-[9.5px] text-slate-400 tabular-nums shrink-0">{doneTasks}/{tasks.length}</span>
        </div>
      )}

      {open && expandable && (
        <div className="px-1 pb-1.5 space-y-0.5">
          {cats.map((c) => <CategoryNode key={c} category={c} tasks={byCat.get(c)!} taskStates={taskStates} activeId={activeId} activeTaskCode={activeTaskCode} />)}
        </div>
      )}

      {locked && <p className="px-2.5 pb-2.5 text-[10.5px] text-slate-400 tracking-tight">{lockedHint}</p>}
    </div>
  );
}

function SidebarShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <aside className="w-[288px] shrink-0 h-full border-r border-slate-200/70 bg-white/50 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">{children}</div>
      {footer}
    </aside>
  );
}

export function DeskSidebar() {
  const { learnings, loading } = useDeskLearnings();
  const pathname = usePathname();
  const taskM = pathname.match(/^\/app\/desk\/task\/([^/]+)/);
  const activeTaskCode = taskM ? decodeURIComponent(taskM[1]) : undefined;
  const orgM = pathname.match(/^\/app\/desk\/org\/([^/]+)/);
  const activeOrgPageId = orgM ? decodeURIComponent(orgM[1]) : undefined;
  const actM = !taskM && !orgM ? pathname.match(/^\/app\/desk\/([^/]+)/) : null;
  const activeId = actM ? actM[1] : undefined;

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
  // The current placement: the first one that's accessible (not complete, not locked).
  const activeOrgId = (orgs.find((o) => o.status === "active") ?? orgs.find((o) => orgDisplayState(o) === "active"))?.id;

  // Overall program progress — pinned to the rail's footer so the lower area always reads as
  // intentional chrome rather than blank space, regardless of how short the tree is.
  let done = 0, total = 0;
  orgs.forEach((o) => o.projects.forEach((p) => p.tasks.forEach((t) => { done += t.done; total += t.total; })));
  const pct = total ? Math.round((done / total) * 100) : 0;
  const progressFooter = total > 0 ? (
    <div className="shrink-0 border-t border-slate-200/60 px-3.5 py-3 bg-white/40">
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
    <SidebarShell footer={progressFooter}>
      {orgs.length === 0 ? (
        <div className="px-2 py-6 text-center text-[12px] text-slate-500">No placements yet.</div>
      ) : (
        orgs.map((org, i) => (
          <OrgNode
            key={org.id}
            org={org}
            defaultOpen={org.id === activeOrgId}
            activeId={activeId}
            activeTaskCode={activeTaskCode}
            contextActive={org.id === activeOrgPageId}
            lockedHint={i > 0 ? `Complete ${orgs[i - 1].name} to unlock` : "Locked"}
          />
        ))
      )}
    </SidebarShell>
  );
}
