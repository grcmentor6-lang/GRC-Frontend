"use client";

import { ALL_WEEKS_OPEN, deskOpenFor } from "@/lib/flags";
import { stepGate, taskGate } from "@/lib/desk/locks";
import { Icon } from "@/components/ui/icon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { useDeskIdentity } from "@/lib/desk/identity";
import { Ctx, useDesk, type DeskCtx, type ViewItem } from "./desk-context";
import { TaskFile, type Tab } from "./task-file";
import { Ring, WeekPanel, WeekRail, WeekTimeline } from "./week-panel";
import { WeekOverview } from "./week-overview";
import { KnowledgeCheck, TestDock, liveStored, storeLive } from "./knowledge-check";
import { KC_HASH } from "@/lib/desk/kc";
import { Toolbar } from "./toolbar";
import { Viewer } from "./viewer";
import { DeskIntro, INTRO_KEY } from "./desk-intro";
import { tourDue } from "@/components/app/guided-tour";
import { ToolModal, ToolWindow } from "./tool-modal";
import { press } from "./ui";
import { thenOf } from "./how-to";
import { ATTEST } from "@/lib/desk/forms";
import { currentWeek, loadDesk, startOf, weekOpen, type Desk } from "@/lib/desk/model";
import { decisionChecked, stepKey, taskStatus, useProgress, useSaveState, type Progress } from "@/lib/desk/progress";

/** Midnight of the mentee's start date. They may start any day; until they choose, today. */

/** Windows that read the same from any task, kept open when the learner moves to another task. */
const isReference = (key: string) => /^(home|learn|doc|page)\|/.test(key) || key === "policies|Policy Library";

/**
 * A task opened before its turn: the locked slip (docs/FORM_LANGUAGE.md form 13: dashed edge, mute, and its release
 * condition stated on it), with the way to the task that opens it.
 */
function TaskLocked({ task, title, first, between, onOpen }: { task: string; title: string; first: string; /** Other tasks sit between `first` and this one. */ between: boolean; onOpen: (id: string) => void }) {
  return (
    <div data-task-locked={task} className="mx-auto mt-10 w-full max-w-[560px] px-4">
      <div className="rounded-2xl border border-dashed border-[#C9CED8] px-6 py-7 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#F3F4F7] text-[#8A91A3]"><Icon name="lock" size={20} /></span>
        <h1 className="mt-3 text-[16px] font-semibold text-[#3F4757]"><span className="font-mono text-[14px]">{task}</span> is not open yet</h1>
        <p className="mt-1 text-[13.5px] text-[#5B6474] [text-wrap:pretty]">{title}</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[#3F4757] [text-wrap:pretty]">Tasks open in order. This one opens as soon as you submit <strong className="font-semibold text-[#111827]">{first}</strong>{between ? " and the tasks between" : ""}.</p>
        <button type="button" onClick={() => onOpen(first)} className={`mt-4 h-9 rounded-lg bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-110 ${press}`}>Go to {first}</button>
      </div>
    </div>
  );
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
  // Read here, alongside the desk's content, so the wait for saved work is the longer of the two and not the sum.
  const { status, retry } = useProgress(user?.email ?? "");

  // In the learner's names: reloaded if their identity arrives after the copy of /me the tab painted from.
  const who = useDeskIdentity();
  useEffect(() => {
    loadDesk().then(setDesk, (e: Error) => setError(e.message));
  }, [who]);

  if (error)
    return (
      <div className="grid h-desk place-items-center bg-[#FAFAF7] px-4 text-center">
        <div className="grid gap-2">
          <p className="text-[14px] font-medium text-slate-800">Your desk did not load.</p>
          <p className="text-[13px] text-slate-500">{error}. Check your connection, then reload the page.</p>
        </div>
      </div>
    );
  // Never an empty desk over real work: without the saved copy, nothing here can be changed or saved.
  if (status === "failed")
    return (
      <div className="grid h-desk place-items-center bg-[#FAFAF7] px-4 text-center">
        <div className="grid justify-items-center gap-2">
          <p className="text-[14px] font-medium text-slate-800">Your saved work did not load.</p>
          <p className="text-[13px] text-slate-500">It is safe on the server. Check your connection, then try again.</p>
          <button type="button" onClick={retry} className="mt-1 rounded-md bg-[#111827] px-3 py-1.5 text-[13px] font-medium text-white">
            Try again
          </button>
        </div>
      </div>
    );
  if (!desk || !user) return <DeskSkeleton />;
  return (
    <MotionConfig reducedMotion="user">
      {/* The shell shows at once, locked; the desk mounts afresh on the saved work, as its starting task depends on it. */}
      <DeskLoaded key={`${user.startDate ?? ""}|${status}`} desk={desk} who={user.email} startIso={user.startDate} preview={ALL_WEEKS_OPEN || user.role === "admin"} locked={status === "loading"} />
    </MotionConfig>
  );
}

/** Quiet while saves land; a save that cannot leave must not be invisible, now the browser keeps no copy. */
function SaveNote({ who }: { who: string }) {
  const state = useSaveState(who);
  // Above any open window: the work is usually in a modal that covers this header.
  if (state === "unsaved")
    return createPortal(
      <span role="alert" data-save={state} className="pointer-events-none fixed left-1/2 top-2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-md border border-[#DDE1E8] bg-white px-2.5 py-1 text-[12px] font-medium text-[#B42318] shadow-sm">
        Not saved yet. Retrying, keep this tab open.
      </span>,
      document.body,
    );
  return (
    <span role="status" data-save={state} className="text-[11.5px] font-normal text-[#5B6474]">
      {state === "saved" ? "Saved" : "Saving…"}
    </span>
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

function DeskLoaded({ desk, who, startIso, preview, locked }: { desk: Desk; who: string; startIso: string | null; /** Admins see every week open, to test the programme ahead of the calendar. */ preview?: boolean; /** Saved work has not arrived: the shell shows, and nothing can be touched. */ locked: boolean }) {
  const { progress, update } = useProgress(who);
  const start = useMemo(() => startOf(startIso), [startIso]);
  const now = currentWeek(start);
  const isOpen = useCallback((w: number) => preview || weekOpen(w, start), [start, preview]);

  // A #T… link is read here, at first render, not only in the effect below: the desk mounts twice on a reload (locked,
  // then on the saved work), and starting each mount on the week overview and swapping to the task a frame later left a
  // reloaded /app/desk#F1.3 on the overview (tester, 4 Nov).
  const [linked] = useState(() => parseHash(desk));
  const [taskId, setTaskId] = useState<string>(
    () => linked?.task ?? desk.order.find((id) => desk.tasks[id].week === now && !progress.submitted[id]) ?? desk.order.find((id) => desk.tasks[id].week === now) ?? desk.order[0],
  );
  const [focus, setFocus] = useState(linked?.step || 1);
  const [tab, setTab] = useState<Tab>("how");
  // A week's overview, when one is open instead of a task.
  // Arriving on the desk opens this week's overview; a #T… link replaces it with the task.
  const [weekView, setWeekView] = useState<number | null>(linked ? null : now);
  // A knowledge check or exam open as the screen (#KC-01, #FGE, #FEX): read at first render too, so a reload stays on it.
  const [testView, setTestView] = useState<string | null>(() => location.hash.match(KC_HASH)?.[1] ?? null);
  const [viewing, setViewing] = useState<ViewItem | null>(null);
  // The platform tool open in the modal ("evidence|Audit Requests (PBC)").
  const [toolKey, setToolKey] = useState<string | null>(null);
  // Opened from a finished step's View: read-only.
  const [viewOnly, setViewOnly] = useState(false);
  // Tools open for reading, as floating windows; the last is on top.
  const [windows, setWindows] = useState<string[]>([]);
  // Moving to another task closes the windows that belong to a task: a register, a task's own screen, a Tech Lab. They
  // render against the task in hand, so left open they silently showed the next task's content under the old title. The
  // reference shelf stays open on purpose: Home, Learn & Grow (Rule tables, Reference pages), the Policy Library and its
  // documents read the same from any task.
  // The step's modal goes too: a task reached by a #T… link or the back button while it was up kept the old task's
  // tool open over the new task, its window beside it (tester, 5 Nov: T4.1's Review & Redline over T8.1). Nothing is
  // restored from storage: windows and the modal live only in this state.
  const [windowsFor, setWindowsFor] = useState(taskId);
  if (windowsFor !== taskId) {
    setWindowsFor(taskId);
    setWindows((w) => w.filter(isReference));
    setToolKey(null);
    setViewOnly(false);
  }
  // The week panel folds to a rail. It opens every time you arrive on the desk, and folds itself
  // when you pick a task from it, so the work gets the room.
  const [panelOpen, setPanel] = useState(true);
  // The first-visit guide is due or on screen: no menu opens by itself under it (Toolbar).
  const [intro, setIntro] = useState(() => tourDue(INTRO_KEY, who));

  const openTask = useCallback((id: string, step?: number, t: Tab = "how") => {
    setTaskId(id);
    setFocus(step ?? 1);
    setTab(t);
    setViewing(null);
    setWeekView(null);
    setTestView(null);
    history.replaceState(null, "", `#${id}${step ? `-${step}` : ""}`);
  }, []);

  // Deep links: #T5.1 opens a task, #T5.1-4 its fourth activity.
  useEffect(() => {
    const go = () => {
      const kc = location.hash.match(KC_HASH);
      if (kc) {
        setTestView(kc[1]);
        setViewing(null);
        return;
      }
      setTestView(null);
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
  // The desk's order: a task waits for the tasks before it, a step for the steps before it (lib/desk/locks.ts).
  const free = deskOpenFor(who);
  const taskLock = useCallback((id: string) => (free ? null : taskGate(desk, progress, id)), [free, desk, progress]);
  const stepLock = useCallback((id: string, n: number) => (free ? null : stepGate(progress, desk.tasks[id], n)), [free, desk, progress]);
  const lockedBy = taskLock(taskId);
  // A step reached before its turn (a #T5.1-4 link, the key results list) is not opened: the list shows instead.
  const shown = focus && stepLock(taskId, focus) ? 0 : focus;
  const here = weekView || testView || lockedBy ? null : shown || nextUp ? { task: taskId, n: shown || nextUp } : null;
  // Work in a modal, reading in windows: the step in hand opens its tool as the modal while it is
  // still to do (or when asked to change it); anything else — a finished step's tool, a tool opened
  // for a look mid-step — opens as a floating, resizable window beside the work.
  // "view": a finished step's View — its own window with the learner's work in it, read-only.
  const openTool = (key: string, mode?: "work" | "view") => {
    const step = here ? desk.tasks[here.task].steps[here.n - 1] : undefined;
    const t = here ? desk.tasks[here.task] : undefined;
    // A decision is answered in its row first (Check my answer); until then its tool opens only to read.
    // A question with no part 2 (F1.2 step 5) is answered and completed in its row: its tool is only read, never
    // the step's modal, which would run the row's guide a second time over the first.
    if (mode === "view" && step?.key === key) {
      setViewOnly(true);
      return setToolKey(key);
    }
    const working = !!step && !!t && step.key === key && isOpen(t.week) && !progress.submitted[t.id] && (mode === "work" || !progress.done[stepKey(t.id, step.n)])
      && (step.kind !== "pick" || (decisionChecked(progress, t.id, step.n) && (!!thenOf(step) || !!ATTEST[t.id]?.[step.n])));
    // The step's own tool, already open as the modal (Onboarding record over My Organisation, say):
    // asking for it again from the toolbar opens its screen beside the work instead.
    if (working && toolKey !== key) {
      setViewOnly(false);
      return setToolKey(key);
    }
    // A document opened from Policies › Policy Library takes the library's place: the list has done
    // its job, and left open it covered the step's own panel. It is one click away on the toolbar.
    setWindows((w) => [...w.filter((x) => x !== key && !(key.startsWith("doc|") && x === "policies|Policy Library") && !(key.startsWith("page|") && x === "learn|Reference pages")), key]);
  };
  // A tool asked for through the viewer opens like any other; references still open in the sheet.
  const view = (item: ViewItem) => (item.kind === "tool" ? openTool(item.id) : setViewing(item));
  const closeTool = (key: string) => setWindows((w) => w.filter((x) => x !== key));
  // The check in progress: its questions stay in the dock while the learner moves about the desk (owner, 12 Nov 2026:
  // "when I start the test and go back to my tasks it shows the start button again").
  const [liveTest, setLiveTest] = useState<string | null>(liveStored);
  const [testFolded, setTestFolded] = useState(false);
  // The week panel folds to its rail so the desk column keeps its width (and the whole toolbar) beside the test.
  const openTest = (id: string) => { setLiveTest(id); storeLive(id); setTestFolded(false); setPanel(false); };
  const endTest = useCallback(() => { setLiveTest(null); storeLive(null); }, []);
  const docked = !!liveTest && !testFolded;
  const ctx: DeskCtx = { desk, progress, update, start, isOpen, openTask, view, here, openTool, closeTool, free, taskLock, stepLock, liveTest, openTest, endTest };
  // A week opens on its overview; its first task still to submit becomes the task in hand.
  const openWeek = (n: number) => {
    setTaskId(desk.order.find((x) => desk.tasks[x].week === n && !progress.submitted[x]) ?? desk.order.find((x) => desk.tasks[x].week === n)!);
    setWeekView(n);
    setTestView(null);
    setViewing(null);
    history.replaceState(null, "", `#W${n}`);
  };
  const testWeek = testView ? desk.weeks.find((w) => w.kc?.split(" ")[0] === testView)?.n : undefined;
  const week = testWeek ?? weekView ?? desk.tasks[taskId].week;

  const task = desk.tasks[taskId];

  return (
    <Ctx.Provider value={ctx}>
      <div className="flex h-desk">
      {/* With the test docked, this column is the containing block of the desk's own overlays (the step modal, the
          reference sheet): they cover the desk, never the test beside it. */}
      <div className={`relative min-w-0 flex-1 ${docked ? "lg:[transform:translateZ(0)]" : ""}`}>
      <div className="flex h-desk flex-col bg-[#F7F8FA] text-[#111827]" inert={locked} aria-busy={locked}>
        {/* The desk's header band: what this is, then the twelve weeks as cells. */}
        <header className="flex h-[52px] shrink-0 items-stretch border-b border-[#DDE1E8] bg-[#F7F8FA] max-md:h-auto max-md:flex-col">
          <div className="flex shrink-0 flex-col justify-center border-r border-[#DDE1E8] bg-white px-4 max-md:border-b max-md:border-r-0 max-md:py-2 lg:w-[340px]">
            <p className="flex items-baseline justify-between gap-2 text-[14px] font-bold leading-tight text-[#111827]">
              Working Desk {locked ? <span className="text-[11.5px] font-normal text-[#5B6474]">Opening your work…</span> : <SaveNote who={who} />}
            </p>
            <p className="truncate text-[12px] text-[#5B6474] tabular-nums">
              GRC 101 · Week {currentWeek(start)} of {desk.weeks.length} · {desk.weeks[currentWeek(start) - 1].ph}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 max-md:h-[48px]">
            <WeekTimeline week={week} onWeek={openWeek} fit={docked} />
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1">
          <aside
            aria-label="This week"
            className={`desk-panel hidden shrink-0 border-r border-[#DDE1E8] bg-white transition-[width] duration-200 ease-out lg:block ${
              panelOpen ? "w-[340px]" : "w-[60px] overflow-y-auto"
            }`}
          >
            {panelOpen ? (
              <WeekPanel week={week} taskId={weekView || testView ? null : task.id} overview={weekView !== null} onOverview={() => openWeek(week)} onCollapse={() => setPanel(false)} />
            ) : (
              <WeekRail week={week} taskId={weekView || testView ? null : task.id} overview={weekView !== null} onOverview={() => openWeek(week)} onExpand={() => setPanel(true)} />
            )}
          </aside>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="border-b border-[#DDE1E8] bg-white px-3 py-2 lg:hidden">
              <TaskPills week={week} taskId={weekView || testView ? "" : task.id} desk={desk} progress={progress} openTask={openTask} />
            </div>
            <main className="desk-panel min-h-0 min-w-0 flex-1 overflow-y-auto bg-white pb-28">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  // @container: the task file's step bar bleeds to the column's width (see StepBar).
                  className="@container"
                  key={testView ?? (weekView ? `W${weekView}` : task.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                >
                  {locked ? (
                    <div className="mx-auto mt-6 grid w-full max-w-[1000px] content-start gap-4 px-6">
                      {["h-48", "h-10 w-2/3", "h-24", "h-24"].map((h, i) => (
                        <div key={i} className={`${h} animate-pulse rounded-md bg-slate-200/70`} />
                      ))}
                    </div>
                  ) : testView ? (
                    <KnowledgeCheck id={testView} />
                  ) : weekView ? (
                    <WeekOverview week={weekView} />
                  ) : (
                    lockedBy ? (
                      <TaskLocked task={task.id} title={task.title} first={lockedBy} between={desk.order.indexOf(task.id) - desk.order.indexOf(lockedBy) > 1} onOpen={openTask} />
                    ) : (
                      <TaskFile task={task} focus={shown} onFocus={(n) => (n && stepLock(taskId, n) ? undefined : setFocus(n))} tab={tab} setTab={setTab} />
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
            <Toolbar modal={toolKey} hold={locked || intro} />
          </div>
        </div>

      </div>
      <DeskIntro who={who} ready={!locked} onDone={() => setIntro(false)} />
      <Viewer item={viewing} onClose={() => setViewing(null)} />
      <ToolModal
        toolKey={toolKey}
        viewOnly={viewOnly}
        onClose={() => {
          // The modal's own screen, opened beside it from the toolbar, closes with it.
          setWindows((w) => w.filter((x) => x !== toolKey));
          setToolKey(null);
          setViewOnly(false);
        }}
      />
      <AnimatePresence>
        {windows.map((k, i) => (
          <ToolWindow key={k} toolKey={k} index={i} beside={!!toolKey} plain={k === toolKey} onClose={() => setWindows((w) => w.filter((x) => x !== k))} />
        ))}
      </AnimatePresence>
      </div>
      {liveTest && !locked && <TestDock key={liveTest} id={liveTest} folded={testFolded} onFold={setTestFolded} />}
      </div>
    </Ctx.Provider>
  );
}

/** The chosen week's tasks, each with its own progress ring, so the week reads at a glance. */
function TaskPills({ week, taskId, desk, progress, openTask }: { week: number; taskId: string; desk: Desk; progress: Progress; openTask: (id: string) => void }) {
  const tasks = desk.order.map((id) => desk.tasks[id]).filter((t) => t.week === week);
  const { taskLock } = useDesk();
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
            <span className={`relative flex shrink-0 items-center gap-1 font-mono text-[11.5px] ${here ? "text-indigo-700" : "text-slate-500"}`}>{t.id}{taskLock(t.id) && <Icon name="lock" size={10} strokeWidth={2.5} aria-label="not open yet" />}</span>
            <span className={`relative min-w-0 truncate text-[12.5px] max-sm:hidden ${here ? "font-semibold text-slate-900" : "text-slate-700"}`}>{t.title}</span>
            {t.hc ? <span className="relative shrink-0 text-[10.5px] font-semibold text-amber-700">{t.hc}</span> : null}
            {t.li.length > 0 && <span title={`Includes Lead Implementer extension ${t.li.join(", ")}`} className="relative shrink-0 rounded-[3px] border border-[#C7CBF5] bg-[#EEF0FF] px-[5px] py-px font-mono text-[10px] font-semibold text-[#3730A3]">LI</span>}
          </button>
        );
      })}
    </nav>
  );
}
