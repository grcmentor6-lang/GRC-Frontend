"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Ctx, type DeskCtx, type ViewItem } from "./desk-context";
import { TaskFile, type Tab } from "./task-file";
import { Ring, WeekPanel, WeekRail, WeekTimeline } from "./week-panel";
import { WeekOverview } from "./week-overview";
import { Toolbar } from "./toolbar";
import { Viewer } from "./viewer";
import { ToolModal } from "./tool-modal";
import { press } from "./ui";
import { currentWeek, loadDesk, weekOpen, type Desk } from "@/lib/desk/model";
import { stepKey, taskStatus, useProgress, type Progress } from "@/lib/desk/progress";

/** Midnight of the mentee's start date. They may start any day; until they choose, today. */
function startOf(iso: string | null | undefined): Date {
  const d = iso ? new Date(`${iso.slice(0, 10)}T00:00:00`) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "#T5.1-4" → { task: "T5.1", step: 4 }. */
function parseHash(desk: Desk): { task: string; step: number } | null {
  const m = location.hash.slice(1).match(/^([FT]\d+\.\d+)(?:-(\d+))?$/);
  return m && desk.tasks[m[1]] ? { task: m[1], step: Number(m[2] ?? 0) } : null;
}

export function DeskApp() {
  const { user } = useAuth();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDesk().then(setDesk, (e: Error) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="grid h-desk place-items-center bg-[#FAFAF7] px-4 text-center">
        <div className="grid gap-2">
          <p className="text-[14px] font-medium text-slate-800">Your desk did not load.</p>
          <p className="text-[13px] text-slate-500">{error}. Check your connection, then reload the page.</p>
        </div>
      </div>
    );
  if (!desk || !user) return <DeskSkeleton />;
  return (
    <MotionConfig reducedMotion="user">
      <DeskLoaded key={user.startDate ?? ""} desk={desk} who={user.email} startIso={user.startDate} />
    </MotionConfig>
  );
}

/** Shaped like the desk, so nothing jumps when the content lands. */
function DeskSkeleton() {
  const bar = "animate-pulse rounded-md bg-slate-200/70";
  return (
    <div className="flex h-desk flex-col bg-[#FAFAF7]" aria-busy="true" aria-label="Opening your desk">
      <div className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4">
        <div className={`h-7 w-28 ${bar}`} />
        <div className={`mx-auto h-8 w-[420px] max-w-[50vw] ${bar}`} />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[76px] border-r border-slate-200 bg-white md:block" />
        <div className="mx-auto mt-6 grid w-full max-w-[1000px] content-start gap-4 px-6">
          <div className={`h-48 ${bar}`} />
          <div className={`h-10 w-2/3 ${bar}`} />
          <div className={`h-24 ${bar}`} />
          <div className={`h-24 ${bar}`} />
        </div>
      </div>
      <div className="h-14 border-t border-slate-200 bg-white" />
    </div>
  );
}

function DeskLoaded({ desk, who, startIso }: { desk: Desk; who: string; startIso: string | null }) {
  const { progress, update } = useProgress(who);
  const start = useMemo(() => startOf(startIso), [startIso]);
  const now = currentWeek(start);
  const isOpen = useCallback((w: number) => weekOpen(w, start), [start]);

  const [taskId, setTaskId] = useState<string>(
    () => desk.order.find((id) => desk.tasks[id].week === now && !progress.submitted[id]) ?? desk.order.find((id) => desk.tasks[id].week === now) ?? desk.order[0],
  );
  const [focus, setFocus] = useState(1);
  const [tab, setTab] = useState<Tab>("how");
  // A week's overview, when one is open instead of a task.
  // Arriving on the desk opens this week's overview; a #T… link replaces it with the task.
  const [weekView, setWeekView] = useState<number | null>(now);
  const [viewing, setViewing] = useState<ViewItem | null>(null);
  // The platform tool open in the modal ("evidence|Audit Requests (PBC)").
  const [toolKey, setToolKey] = useState<string | null>(null);
  // The week panel folds to a rail. It opens every time you arrive on the desk, and folds itself
  // when you pick a task from it, so the work gets the room.
  const [panelOpen, setPanel] = useState(true);

  const openTask = useCallback((id: string, step?: number, t: Tab = "how") => {
    setTaskId(id);
    setFocus(step ?? 1);
    setTab(t);
    setViewing(null);
    setWeekView(null);
    history.replaceState(null, "", `#${id}${step ? `-${step}` : ""}`);
  }, []);

  // Deep links: #T5.1 opens a task, #T5.1-4 its fourth activity.
  useEffect(() => {
    const go = () => {
      const wk = location.hash.match(/^#W(\d{1,2})$/);
      if (wk && desk.weeks[Number(wk[1]) - 1]) {
        setWeekView(Number(wk[1]));
        return;
      }
      const h = parseHash(desk);
      if (!h) return;
      setWeekView(null);
      setTaskId(h.task);
      setFocus(h.step || 1);
      setTab("how");
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [desk]);


  // The step in hand: the open one, or — with every row closed — the next one still to do, so the
  // tool that step is done in stays unlocked in the toolbar either way.
  const nextUp = desk.tasks[taskId].steps.find((x) => !progress.done[stepKey(taskId, x.n)])?.n ?? 0;
  const here = weekView ? null : focus || nextUp ? { task: taskId, n: focus || nextUp } : null;
  // A tool asked for through the viewer opens in the tool modal; references still open in the sheet.
  const view = (item: ViewItem) => (item.kind === "tool" ? setToolKey(item.id) : setViewing(item));
  const ctx: DeskCtx = { desk, progress, update, start, isOpen, openTask, view, here, openTool: setToolKey };
  // A week opens on its overview; its first task still to submit becomes the task in hand.
  const openWeek = (n: number) => {
    setTaskId(desk.order.find((x) => desk.tasks[x].week === n && !progress.submitted[x]) ?? desk.order.find((x) => desk.tasks[x].week === n)!);
    setWeekView(n);
    setViewing(null);
    history.replaceState(null, "", `#W${n}`);
  };
  const week = weekView ?? desk.tasks[taskId].week;

  const task = desk.tasks[taskId];

  return (
    <Ctx.Provider value={ctx}>
      <div className="flex h-desk flex-col bg-[#F7F8FA] text-[#111827]">
        {/* The desk's header band: what this is, then the twelve weeks as cells. */}
        <header className="flex h-[52px] shrink-0 items-stretch border-b border-[#DDE1E8] bg-[#F7F8FA] max-md:h-auto max-md:flex-col">
          <div className="flex shrink-0 flex-col justify-center border-r border-[#DDE1E8] bg-white px-4 max-md:border-b max-md:border-r-0 max-md:py-2 lg:w-[300px]">
            <p className="text-[14px] font-bold leading-tight text-[#111827]">Working Desk</p>
            <p className="truncate text-[12px] text-[#5B6474] tabular-nums">
              GRC 101 · Week {currentWeek(start)} of {desk.weeks.length} · {desk.weeks[currentWeek(start) - 1].ph}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 max-md:h-[48px]">
            <WeekTimeline week={week} onWeek={openWeek} />
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1">
          <aside
            aria-label="This week"
            className={`desk-panel hidden shrink-0 border-r border-[#DDE1E8] bg-white transition-[width] duration-200 ease-out lg:block ${
              panelOpen ? "w-[300px]" : "w-[60px] overflow-y-auto"
            }`}
          >
            {panelOpen ? (
              <WeekPanel week={week} taskId={weekView ? null : task.id} overview={weekView !== null} onOverview={() => openWeek(week)} onCollapse={() => setPanel(false)} />
            ) : (
              <WeekRail week={week} taskId={weekView ? null : task.id} overview={weekView !== null} onOverview={() => openWeek(week)} onExpand={() => setPanel(true)} />
            )}
          </aside>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="border-b border-[#DDE1E8] bg-white px-3 py-2 lg:hidden">
              <TaskPills week={week} taskId={weekView ? "" : task.id} desk={desk} progress={progress} openTask={openTask} />
            </div>
            <main className="desk-panel min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#F7F8FA] px-3 pb-28 sm:px-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  // @container: the task file's step bar bleeds to the column's width (see StepBar).
                  className="@container"
                  key={weekView ? `W${weekView}` : task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                >
                  {weekView ? (
                    <WeekOverview week={weekView} />
                  ) : (
                    <TaskFile task={task} focus={focus} onFocus={setFocus} tab={tab} setTab={setTab} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
            <Toolbar />
          </div>
        </div>

      </div>
      <Viewer item={viewing} onClose={() => setViewing(null)} />
      <ToolModal toolKey={toolKey} onClose={() => setToolKey(null)} />
    </Ctx.Provider>
  );
}

/** The chosen week's tasks, each with its own progress ring, so the week reads at a glance. */
function TaskPills({ week, taskId, desk, progress, openTask }: { week: number; taskId: string; desk: Desk; progress: Progress; openTask: (id: string) => void }) {
  const tasks = desk.order.map((id) => desk.tasks[id]).filter((t) => t.week === week);
  return (
    <nav aria-label={`Week ${week} tasks`} className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {tasks.map((t) => {
        const here = t.id === taskId;
        const st = taskStatus(progress, t);
        const done = t.steps.filter((x) => progress.done[stepKey(t.id, x.n)]).length;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => openTask(t.id)}
            aria-current={here ? "page" : undefined}
            title={`${t.id} ${t.title}`}
            className={`relative flex h-8 min-w-0 flex-1 basis-0 items-center gap-2 rounded-lg px-2.5 text-left max-sm:flex-none max-sm:basis-auto ${press} ${here ? "" : "hover:bg-slate-100"}`}
          >
            {here && <motion.span layoutId="task-active" className="absolute inset-0 rounded-lg bg-indigo-50 ring-1 ring-indigo-200" transition={{ type: "spring", duration: 0.3, bounce: 0.12 }} />}
            <span className="relative"><Ring value={done / t.steps.length} done={st === "submitted"} /></span>
            <span className={`relative shrink-0 font-mono text-[11.5px] ${here ? "text-indigo-700" : "text-slate-500"}`}>{t.id}</span>
            <span className={`relative min-w-0 truncate text-[12.5px] max-sm:hidden ${here ? "font-semibold text-slate-900" : "text-slate-700"}`}>{t.title}</span>
            {t.hc ? <span className="relative shrink-0 text-[10.5px] font-semibold text-amber-700">{t.hc}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
