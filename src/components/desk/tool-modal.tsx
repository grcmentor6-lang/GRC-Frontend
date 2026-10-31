"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { DecisionSummary, LI_TAG, PartHead, Work, thenLabel, thenOf } from "./how-to";
import { BriefProgress, BriefWork, CopyWork, GridProgress, GridWork, LogWork, RegisterProgress, RegisterWork, LadderWork, RmfFile, RmfProgress, RuleHelper, StudyWork, SubmitWork, TreeWork, ChecklistWork, ReportWork, SplitWork, CompareWork, ConsistencyWork } from "./work-kinds";
import { DECIDE_FROM, LADDER, STUDY, briefOf, deliverableFor, handedIn, regOf, stepSources } from "@/lib/desk/registers";
import { gridKey, stepAnswered } from "@/lib/desk/work";
import { Inbox, MessageNotice } from "./chat";
import { ToolScreen } from "./viewer";
import { FloatWindow } from "./float-window";
import { TableView } from "./ui";
import { DocCitation } from "./doc-text";
import { DOC_TEXT } from "@/lib/desk/docs";
import { OrgDetails, type OrgFull } from "./org-drawer";
import { dmy, dueDate, fmtDay, rmfTable, screenOf, testDue, workKind, type Desk, type Step, type Task } from "@/lib/desk/model";
import { RMF, folders, submitCodes } from "@/lib/desk/forms";
import { decisionChecked, stepKey, type Progress } from "@/lib/desk/progress";
import { appZoom } from "@/lib/zoom";
import { useAuth } from "@/components/auth/auth-provider";
import { GuidedTour, markTourSeen, useTourOnce } from "@/components/app/guided-tour";
import { STEP_GUIDES } from "./step-guides";

/**
 * The step being worked, as a centred modal: the tool's screen on the left, the step's work on the
 * right. The toolbar stays above it (see Toolbar's z-index), so the mentee can open any other tool
 * mid-step; those open as floating windows, never as a second modal. Completing walks on to the next
 * step, staying in the tool when the next step is done here too.
 */
export function ToolModal({ toolKey, onClose }: { toolKey: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!toolKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector('[aria-label^="Guide:"]') && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toolKey, onClose]);

  return <AnimatePresence>{toolKey && <Dialog key="tool" toolKey={toolKey} onClose={onClose} />}</AnimatePresence>;
}

/** Section numbers in reading order: "2" before "2.1" before "3" before "10". */
const bySec = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

/** A tool opened for reading: a floating, resizable window with just its screen. */
/** A document from Policies › Policy Library, in its own window: the text where the platform has it
 *  (the sections the step in hand cites marked), its headings otherwise. */
function DocWindow({ id, index, onClose, beside }: { id: string; index: number; onClose: () => void; beside?: boolean }) {
  const { desk, here } = useDesk();
  const step = here ? desk.tasks[here.task].steps[here.n - 1] : undefined;
  const task = here ? desk.tasks[here.task] : undefined;
  const cites = [...((task && step ? stepSources(task, step.n, step.refs.docs) : []).find(([d]) => d === id)?.[1] ?? [])].sort(bySec);
  const lib = desk.library.docs.find(([code]) => code === id);
  const place = useBeside(index);
  return (
    <FloatWindow
      title={`${id}${lib ? ` · ${lib[1]}` : ""}`}
      eyebrow="Policies › Policy Library"
      leading={<span className="grid h-7 w-7 place-items-center rounded bg-[#92400E] text-white"><Icon name="book" size={14} /></span>}
      onClose={onClose}
      index={index}
      width={beside ? place.width : 720}
      left={beside ? place.left : undefined}
      fit={beside}
    >
      {DOC_TEXT.has(id) && cites.length > 0 && (
        // The sections this step reads, one click each: a cited section can sit below long tables, and
        // nothing else tells the learner it is further down. Stays in view while the text scrolls.
        <nav data-guide="doc-jump" aria-label="Sections this step reads" className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 border-b border-[#E9ECF1] bg-white/95 px-4 py-2 text-[12.5px] text-[#5B6474] backdrop-blur">
          <span>This step reads</span>
          {cites.map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                const sec = e.currentTarget.closest("section")?.querySelector<HTMLElement>(`[data-sec="${c}"]`);
                if (!sec) return;
                // The bar wraps to two lines in a narrow window (three sections): the heading lands below it, not under it.
                sec.style.scrollMarginTop = `${(e.currentTarget.closest("nav")?.offsetHeight ?? 40) + 8}px`;
                sec.scrollIntoView({ block: "start", behavior: "smooth" });
              }}
              className="focus-ring rounded border border-[#C7CBF5] bg-[#F7F8FF] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#4338CA] hover:bg-[#EEF0FF] active:scale-[0.97]"
            >
              Section {c}
            </button>
          ))}
        </nav>
      )}
      <div className="px-4 py-3">
        {DOC_TEXT.has(id) ? (
          <DocCitation id={id} cites={cites} />
        ) : (
          <ol className="grid gap-1 text-[13px] text-slate-700">
            {(lib?.[2] ?? []).map(([n, h]) => <li key={n}><span className="inline-block w-12 text-slate-400 tabular-nums">Section {n}</span>{h}</li>)}
          </ol>
        )}
      </div>
    </FloatWindow>
  );
}

type ToolWindowProps = { toolKey: string; index: number; onClose: () => void; beside?: boolean; plain?: boolean };
/** A window opened from the toolbar: a document from the Policy Library ("doc|BKB-ADD-16"), or a tool's screen. */
export function ToolWindow(props: ToolWindowProps) {
  if (props.toolKey.startsWith("page|")) return <PageWindow id={props.toolKey.slice(5)} index={props.index} onClose={props.onClose} beside={props.beside} />;
  return props.toolKey.startsWith("doc|") ? <DocWindow id={props.toolKey.slice(4)} index={props.index} onClose={props.onClose} beside={props.beside} /> : <ScreenWindow {...props} />;
}

/** A reference page from Learn › Reference pages, in its own window, as the pack's sheet has it. */
function PageWindow({ id, index, onClose, beside }: { id: string; index: number; onClose: () => void; beside?: boolean }) {
  const { desk } = useDesk();
  const place = useBeside(index);
  const t = desk.pages[id];
  return (
    <FloatWindow
      title={id}
      eyebrow="Learn › Reference pages"
      leading={<span className="grid h-7 w-7 place-items-center rounded bg-[#111827] text-white"><Icon name="table" size={14} /></span>}
      onClose={onClose}
      index={index}
      width={beside ? place.width : 760}
      left={beside ? place.left : undefined}
    >
      <div className="bg-white">{t ? <TableView t={t} /> : <p className="p-4 text-[13.5px] text-[#5B6474]">This page is not in this release.</p>}</div>
    </FloatWindow>
  );
}

function ScreenWindow({ toolKey, index, onClose, beside, plain }: {
  toolKey: string;
  index: number;
  onClose: () => void;
  /** Opened while a step's modal is up: narrower, and placed beside the work rather than over it. */
  beside?: boolean;
  /** The modal's own tool, opened as its source screen: show the screen, not the step's work. */
  plain?: boolean;
}) {
  const { desk, progress, here } = useDesk();
  // A register this task has started is shown with the mentee's entries, read-only.
  const mine = here && progress.grids?.[gridKey(here.task, toolKey)] ? here.task : null;
  // The step in hand works on the task's register or brief: the window shows that, as filled.
  const step = here ? desk.tasks[here.task].steps[here.n - 1] : undefined;
  // Not on a hand-in step: its tool (Home › My Tasks) is a screen of its own, opened from the toolbar. Nor on a decision
  // not yet checked: its part 2 can record the answer by itself (T5.1 step 10: year 2 of the cycle), which would give
  // the question away; the screen is shown instead.
  // Nor where the task has its own data on this screen (T6.2's disable logs on Terminated User Check): opened from the
  // toolbar, the screen is what the learner reads; the register is worked in the step's modal.
  // Nor on a question-only step (no part 2) whose screen is not the task's own (F1.2 step 5: Learn & Grow › Glossary):
  // the screen is what the question is read from, and the step's work is not done there.
  const sec = toolKey.split("|")[0];
  const mock = screenOf(desk, toolKey, here?.task);
  const own = !!step && (step.kind !== "pick" || !!thenOf(step) || ownView(desk.tasks[here!.task], mock?.tool));
  const deliverable = here && step?.key === toolKey && !plain && own && !desk.tp[`${toolKey}#${here.task}`] && regOf(here.task, here.n)?.handIn?.step !== here.n && (step.kind !== "pick" || decisionChecked(progress, here.task, here.n)) ? deliverableFor(desk.tasks[here.task], here.n) : null;
  const place = useBeside(index);
  return (
    <FloatWindow
      title={deliverable && here && ownView(desk.tasks[here.task], mock?.tool) ? desk.tasks[here.task].panel.tool : (mock?.tool ?? toolKey.replace("|", " › "))}
      eyebrow={`${desk.sections[sec]?.t ?? sec}${toolKey === "policies|Policy Library" ? ` · ${libraryDocs(desk, progress).length} documents` : deliverable && here && ownView(desk.tasks[here.task], mock?.tool) ? ` · ${desk.tasks[here.task].panel.stamp}` : mock?.stamp ? ` · ${mock.stamp}` : ""}`}
      leading={<span className="grid h-7 w-7 place-items-center rounded bg-[#111827] text-white"><Icon name="grid" size={14} /></span>}
      onClose={onClose}
      index={index}
      width={beside ? place.width : 720}
      left={beside ? place.left : undefined}
    >
      <div className="flex min-h-full flex-col bg-[#F7F8FA]">
        {toolKey === "home|My Organisation" ? <BothOrgs /> : plain ? <Screen toolKey={toolKey} /> : deliverable === "register" ? <RegisterWork task={desk.tasks[here!.task]} readOnly /> : deliverable === "brief" ? <BriefWork task={desk.tasks[here!.task]} readOnly /> : mine ? <GridWork taskId={mine} toolKey={toolKey} readOnly /> : <Screen toolKey={toolKey} />}
        {desk.guard[sec] && <Guard text={desk.guard[sec]} />}
      </div>
    </FloatWindow>
  );
}

/**
 * Where a window opened beside the step's modal starts: in the gap to its left when there is one;
 * otherwise at the right edge, over the instruction panel the mentee has already read, never over the
 * table or page they are filling in. The gap is used down to 320px wide, the window narrowed to fit.
 */
/**
 * The task's own view of a tool (its panel: "Evidence › Evidence Library (EVQ-6)", "2 worked + 6"),
 * where it describes the same tool as the generic screen ("Evidence › Evidence Library (EVP-REPO)").
 */
const ownView = (task: Task | null, tool?: string) => !!task && !!tool && task.panel.tool.split(" (")[0] === tool.split(" (")[0];

function useBeside(index: number) {
  const [place] = useState(() => {
    const m = typeof document === "undefined" ? null : document.querySelector("[data-desk-modal]")?.getBoundingClientRect();
    const off = 12 + index * 28;
    const gap = m ? m.left / appZoom() - off - 12 : Infinity;
    return gap >= 320 ? { left: `${off}px`, width: Math.min(420, gap) } : { left: `calc(100vw / var(--app-zoom) - ${420 + off}px)`, width: 420 };
  });
  return place;
}

function Guard({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 px-3.5 py-2.5 text-[12px] leading-relaxed text-[#5B6474]">
      <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-[#8A91A3]" />
      {text}
    </p>
  );
}

function Dialog({ toolKey, onClose }: { toolKey: string; onClose: () => void }) {
  const { desk, here, progress } = useDesk();
  const sec = toolKey.split("|")[0];
  const mock = screenOf(desk, toolKey, here?.task);
  const section = desk.sections[sec];
  const task = here ? desk.tasks[here.task] : null;
  const s = task && here ? task.steps[here.n - 1] : undefined;
  const s0 = task && here ? task.steps[here.n - 1] : undefined;
  // A task's own view of the tool is titled as the task's panel names it (F2.2: "… (EVQ-6)").
  const title = s0 && deliverableFor(task!, s0.n) && ownView(task, mock?.tool) ? task!.panel.tool : (mock?.tool ?? toolKey.replace("|", " › "));
  // The documents the step says to copy from, when their text is on the platform. The step opens on
  // its source, beside the work, so the mentee reads the value where it is written.
  // A document that only answers the step's decision (answered in its row) is not read for this part.
  const sources = (task && s ? stepSources(task, s.n, s.refs.docs) : []).filter(([id]) => DOC_TEXT.has(id) && !(task && s && DECIDE_FROM[task.id]?.[s.n]?.some(([x]) => x === id)));
  const deliverable = task && s ? deliverableFor(task, s.n) : null;
  // While the modal fades out, completing a step has already moved on: opening that step's sources
  // then would leave windows behind and hold the exit open.
  const present = useIsPresent();
  // A step that fills READ-ME-FIRST works in the file; the screen it copies from (My Organisation,
  // My Tasks, My plan) is the source, open in its own window beside it.
  const rmf = s ? rmfTable(s) : null;
  // The step that hands READ-ME-FIRST in (F1.1 step 6): the file is what the modal shows, as on the
  // steps that fill it; My Tasks, where the folders are, opens from the toolbar like any screen.
  const handIn = !!task && !!s && submitCodes(task, s).includes("ONB-RMF");
  // A register handed in (F1.2 step 6, FAM-MAP): the file is what the modal shows, as above.
  const regHandIn = !!task && !!s && regOf(task.id, s.n)?.handIn?.step === s.n;
  // A brief handed in (F1.3 step 6, CTX-BRIEF with CTX-IP): both files, the brief at A4.
  const briefHandIn = !!task && !!s && briefOf(task.id, s.n)?.handIn === s.n;
  // Several registers handed in at once (T4.1 step 6: POL-CUR and POL-GAP): each, one under the other.
  const regsIn = task && s ? handedIn(task.id, s.n) : [];
  const heading = rmf !== null || handIn ? RMF.file : briefHandIn && task && s ? briefOf(task.id, s.n)!.title : regsIn.length > 1 ? [...new Set(regsIn.map((r) => r.title.split(" · ")[0]))].map((c) => `${c} · ${task!.subs.find((x) => x.code === c)?.name ?? ""}`).join(" and ") : regHandIn && task && s ? regOf(task.id, s.n)!.title : title;
  // The task's own view of this tool, where it has one (F2.1: "Risk Register › Asset Register (CLS-6)",
  // "2 worked + 6"): its stamp describes what the modal shows, the tool's generic one does not.
  const stamp = task && deliverable && ownView(task, mock?.tool) ? task.panel.stamp : mock?.stamp;
  // A walk-through of the step, where one is written: it runs the first time the mentee opens the
  // step, and again from "Show me how".
  const { user } = useAuth();
  const guideKey = task && s ? `${task.id}-${s.n}` : "";
  const guide = STEP_GUIDES[guideKey];
  const [guideAt, setGuideAt] = useState(-1);
  const startGuide = () => setGuideAt(0);
  useTourOnce(`grc101.guide.${guideKey}`, user?.email, !!guide && present, startGuide, 700);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-3 pb-[88px] sm:p-6 sm:pb-[92px]" role="dialog" aria-modal="true" aria-label={heading}>
      <motion.button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(17,24,39,0.5)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        data-desk-modal
        className={`relative flex max-h-full w-full max-w-[1240px] flex-col min-[981px]:h-full overflow-hidden rounded-lg border border-[#C9CED8] bg-white shadow-[0_24px_64px_rgba(17,24,39,0.35)]`}
      >
        <header className="flex shrink-0 items-stretch border-b border-[#DDE1E8]">
          <span className="grid w-14 shrink-0 place-items-center bg-[#111827] text-white">
            <Icon name="grid" size={18} />
          </span>
          <div className="min-w-0 flex-1 px-4 py-2.5">
            <p className="text-[12px] text-[#5B6474]">
              {(handIn || regHandIn || briefHandIn) && task ? `File${briefHandIn || regsIn.length > 1 ? "s" : ""} · ${task.id} · 02_Working` : rmf !== null && task ? `File · ${task.id} · 01_Inputs` : `${section?.t ?? sec}${stamp ? ` · ${stamp}` : ""}`}
            </p>
            <h2 className="truncate text-[17px] font-bold text-[#111827]">{heading}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close tool" className="grid w-14 shrink-0 place-items-center border-l border-[#DDE1E8] text-[#3F4757] hover:bg-[#F3F4F7] focus-ring">
            <Icon name="x" size={18} />
          </button>
        </header>

        {/* Side by side (wide), the work and the step scroll apart, so the step's button stays in view
            however long the work is; stacked (narrow), the whole body scrolls. */}
        <div className="flex min-h-0 flex-1 flex-wrap overflow-y-auto min-[981px]:flex-nowrap min-[981px]:overflow-hidden">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col bg-[#F7F8FA] min-[981px]:max-h-full min-[981px]:overflow-y-auto">
            {rmf !== null && (
              // The file is open; the values are on a platform screen the mentee opens from the toolbar.
              <p className="flex shrink-0 items-start gap-2 border-b border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2 text-[12.5px] leading-relaxed text-[#78350F]">
                <Icon name="chevronDown" size={14} className="mt-[3px] shrink-0" />
                <span>
                  {/* Named exactly as the toolbar names them: the section, then the tool. */}
                  <strong className="font-semibold">Next:</strong> open <strong className="font-semibold">{section?.t ?? sec} › {toolKey.split("|")[1]}</strong> from the toolbar at
                  the bottom of the screen (<strong className="font-semibold">{section?.t ?? sec}</strong>, then <strong className="font-semibold">{toolKey.split("|")[1]}</strong>). It
                  opens beside this file.
                </span>
              </p>
            )}
            {sources.length > 0 && (
              // Where to read: named, not opened. The mentee opens it from the toolbar (Policies ›
              // Policy Library, which carries the step's dot), the way the work is done.
              <p data-guide="read-from" className="flex shrink-0 items-start gap-2 border-b border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2 text-[12.5px] leading-relaxed text-[#78350F]">
                <Icon name="book" size={14} className="mt-[3px] shrink-0" />
                <span>
                  <span className="font-semibold">Read from </span>
                  {sources.map(([id, secs]) => `${id}${secs.length ? ` Section ${[...secs].sort(bySec).join(", Section ")}` : ""}`).join(" and ")}
                  <span className="text-[#92400E]">: open it from Policies › Policy Library.</span>
                  {/* The document's "This step reads" bar jumps to each cited section: say so, by name. */}
                  {(() => {
                    const secs = [...new Set(sources.filter(([id]) => DOC_TEXT.has(id)).flatMap(([, x]) => x))].sort(bySec);
                    return secs.length > 0 ? (
                      <span data-guide="jump-hint" className="text-[#92400E]">
                        {" "}In the document, click {secs.map((x) => `Section ${x}`).join(secs.length > 2 ? ", " : " or ").replace(/, (?=[^,]*$)/, " or ")} at the top to jump to {secs.length > 1 ? "each" : "it"}.
                      </span>
                    ) : null;
                  })()}
                  {task && s && regOf(task.id, s.n)?.readHow?.[s.n] && <span data-guide="read-how" className="mt-1 block text-[#78350F]">{regOf(task.id, s.n)!.readHow![s.n]}</span>}
                </span>
              </p>
            )}
            {task && s && briefHandIn ? (
              <>
                <BriefWork task={task} s={s} readOnly handIn />
                {regOf(task.id, s.n) && <RegisterWork task={task} s={s} readOnly />}
              </>
            ) : task && s && handIn ? (
              <RmfFile task={task} t={0} readOnly handIn={{ name: (progress.answers[`${stepKey(task.id, s.n)}#ONB-RMF`] ?? "").trim() }} />
            ) : task && rmf !== null ? (
              <RmfFile task={task} t={rmf} readOnly={!!progress.submitted[task.id]} />
            ) : task && deliverable === "register" ? (
              <>
                {/* A compare step's calls sit over the table, so a document window opened beside the modal
                    (at the right edge on a laptop) covers the instructions, never the calls. */}
                {s && regOf(task.id, s.n)?.compare?.step === s.n && (
                  <div className="shrink-0 border-b border-[#DDE1E8] bg-white px-4 pb-3">
                    <CompareWork task={task} s={s} />
                  </div>
                )}
                {regHandIn && regsIn.length > 1 ? (
                  regsIn.map((r) => (
                    <div key={r.code} className="shrink-0">
                      <RegisterWork task={task} s={s} of={r} readOnly={!!progress.submitted[task.id]} />
                    </div>
                  ))
                ) : (
                  <div className="shrink-0">
                    <RegisterWork task={task} s={s} readOnly={!!progress.submitted[task.id]} />
                  </div>
                )}
                {/* A register handed in with its file's other tables (F2.1 CLS-RES: tier labels, transmission). */}
                {regHandIn && s && briefOf(task.id, s.n) && <BriefWork task={task} s={s} readOnly />}
              </>
            ) : task && deliverable === "brief" ? (
              <BriefWork task={task} s={s} readOnly={!!progress.submitted[task.id]} />
            ) : toolKey === "home|My Organisation" ? (
              <BothOrgs />
            ) : task && s && (workKind(s, desk) === "grid" || progress.grids?.[gridKey(task.id, toolKey)]) ? (
              // The task's register as filled so far; only a fill-in step may edit it.
              <GridWork taskId={task.id} toolKey={toolKey} readOnly={!!progress.submitted[task.id] || workKind(s, desk) !== "grid"} />
            ) : (
              <Screen toolKey={toolKey} />
            )}
            {desk.guard[sec] && !deliverable && <Guard text={desk.guard[sec]} />}
          </div>
          {task && s && <WorkPanel task={task} s={s} toolKey={toolKey} onClose={onClose} onGuide={guide ? startGuide : undefined} />}
          {guide && present && (
            <GuidedTour
              steps={guide}
              step={guideAt}
              onStep={setGuideAt}
              onClose={() => {
                setGuideAt(-1);
                markTourSeen(`grc101.guide.${guideKey}`, user?.email);
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Both organisations, one at a time, each in the same tabbed record the header windows show. */
function BothOrgs() {
  const { desk } = useDesk();
  const [k, setK] = useState<"A" | "B">("A");
  const org = desk.orgs[k] as OrgFull;
  return (
    <div className="flex min-h-[420px] flex-1 flex-col bg-white">
      <Assignment />
      <div className="flex shrink-0 border-b border-[#DDE1E8]">
        {(["A", "B"] as const).map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setK(x)}
            className={`relative flex-1 border-r border-[#DDE1E8] px-4 py-2.5 text-left last:border-r-0 focus-ring ${k === x ? "bg-white" : "bg-[#F7F8FA] hover:bg-[#F3F4F7]"}`}
          >
            <span className="block text-[11.5px] text-[#5B6474]">Org {x} · {x === "A" ? "your main organisation" : "your second organisation"}</span>
            <span className={`block text-[14px] leading-snug ${k === x ? "font-bold text-[#111827]" : "font-semibold text-[#3F4757]"}`}>{desk.orgs[x].name}</span>
            {k === x && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#4338CA]" aria-hidden />}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <OrgDetails key={k} org={org} />
      </div>
    </div>
  );
}

/** The tool's own screen: the pack's mock-up, or one of the two built live. */
function Screen({ toolKey }: { toolKey: string }) {
  const { desk, progress, here, start } = useDesk();
  const sec = toolKey.split("|")[0];
  const mock = screenOf(desk, toolKey, here?.task);

  if (sec === "help")
    return (
      <dl className="grid gap-3 p-4">
        {desk.help.map(([t, d]) => (
          <div key={t} className="rounded border border-[#DDE1E8] bg-white px-4 py-3">
            <dt className="text-[13.5px] font-semibold text-slate-900">{t}</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{d}</dd>
          </div>
        ))}
      </dl>
    );
  if (mock?.dyn === "inbox") return <div className="p-4"><Inbox /></div>;
  if (toolKey === "policies|Policy Library") return <PolicyLibrary />;
  if (toolKey === "learn|Reference pages") return <ReferencePages />;
  if (toolKey === "home|My plan") return <Plan />;
  if (mock?.dyn === "tasks") {
    const week = here ? desk.tasks[here.task].week : 1;
    const ids = desk.order.filter((t) => desk.tasks[t].week === week);
    const th = "border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3.5 py-[9px] font-semibold last:border-r-0";
    const td = "border-b border-r border-[#E9ECF1] px-3.5 py-[11px] align-top last:border-r-0";
    return (
      <>
        <div className="overflow-x-auto border-b border-[#DDE1E8] bg-white">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead className="bg-[#F7F8FA] text-left text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
              <tr>{["Task", "Title", "Org", "Due", "Activities", "Status"].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {ids.map((t) => {
                const x = desk.tasks[t];
                const n = x.steps.filter((st) => progress.done[stepKey(t, st.n)]).length;
                const cur = here?.task === t;
                const status = progress.submitted[t] ? "Submitted" : n ? "In progress" : "Open";
                const chip = status === "Submitted" ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : status === "In progress" ? "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3]" : "border-[#DDE1E8] bg-[#F7F8FA] text-[#3F4757]";
                const bg = cur ? "bg-[#F3F4FF]" : "";
                return (
                  <tr key={t} className="hover:[&>td]:bg-[#FAFAFC]">
                    <td className={`${td} ${bg} font-mono text-[12px] font-semibold ${cur ? "text-[#3730A3] shadow-[inset_3px_0_0_#4338CA]" : "text-[#111827]"}`}>{t}</td>
                    <td className={`${td} ${bg} ${cur ? "font-semibold" : "font-medium"} text-[#111827]`}>{x.title}</td>
                    <td className={`${td} ${bg} text-[#3F4757]`}>{x.orglbl}</td>
                    <td className={`${td} ${bg} whitespace-nowrap ${cur ? "font-semibold text-[#92400E]" : "text-[#111827]"}`}>{fmtDay(dueDate(start, x.dueDay))}</td>
                    <td className={`${td} ${bg} whitespace-nowrap font-mono`}>{n} / {x.steps.length}</td>
                    <td className={`${td} ${bg}`}>
                      <span className={`inline-block whitespace-nowrap rounded-[3px] border px-[7px] py-0.5 text-[12px] font-semibold ${chip}`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {here && <Folders taskId={here.task} />}
        {(mock.pl as { note?: string }).note && <Guard text={(mock.pl as { note?: string }).note!} />}
      </>
    );
  }
  if (!mock) return <p className="p-4 text-[13.5px] text-[#5B6474]">This tool has no screen in this release.</p>;
  return <ToolScreen mock={mock} flush />;
}

/** A reading step's work: confirm the screen has been read. */
function ReadConfirm({ task, s, readOnly }: { task: Task; s: Step; readOnly: boolean }) {
  const { progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const on = (progress.acks[key] ?? []).includes("read");
  const toggle = () => update((p) => ({ ...p, acks: { ...p.acks, [key]: on ? [] : ["read"] } }));
  return (
    <label className={`mt-3 flex items-start gap-3 rounded border px-3 py-2.5 text-[14px] ${on ? "border-[#BBF7D0] bg-[#F0FDF4]" : "cursor-pointer border-[#DDE1E8] hover:border-[#C9CED8]"}`}>
      <input type="checkbox" checked={on} disabled={readOnly} onChange={toggle} className="mt-0.5 h-4 w-4 accent-[#16A34A]" />
      <span className="font-medium text-[#111827]">I have read the worked example on this screen</span>
    </label>
  );
}

/** The step in hand, worked inside its tool. Editable until the task is submitted. */
function WorkPanel({ task, s, toolKey, onClose, onGuide }: { task: Task; s: Step; toolKey: string; onClose: () => void; /** Replays the step's walk-through. */ onGuide?: () => void }) {
  const { desk, progress, update, openTask, start } = useDesk();
  const n = s.n;
  const key = stepKey(task.id, n);
  const done = !!progress.done[key];
  const sealed = !!progress.submitted[task.id];
  const next = task.steps[n];
  const kind = workKind(s, desk);
  const reading = kind === "read";

  const goNext = () => {
    if (!next) {
      openTask(task.id, 0);
      onClose();
      return;
    }
    openTask(task.id, next.n);
    // The next step is done elsewhere, or is a decision: back to the steps. A decision's question is
    // answered in its row first; only then is its "Then" work opened.
    if (next.key !== toolKey || next.kind === "pick") onClose();
  };
  const complete = () => {
    update((p) => ({ ...p, done: { ...p.done, [key]: true } }));
    goNext(); // a decision's feedback was read when its pick was checked
  };

  return (
    <aside aria-label={`Your work for step ${n}`} className="flex min-w-0 flex-[1_1_380px] flex-col border-l border-[#DDE1E8] bg-white max-[980px]:border-l-0 max-[980px]:border-t min-[981px]:max-h-full min-[981px]:overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-[#DDE1E8] bg-[#F7F8FA] px-4 py-2.5">
        <span className={`grid h-[26px] w-[26px] place-items-center rounded-full text-[13px] font-bold text-white tabular-nums ${done ? "bg-[#16A34A]" : "bg-[#4338CA]"}`}>{n}</span>
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-[#3F4757]">
          {task.id} · Step {n} of {task.steps.length}
        </span>
        {done && !sealed && <span className="ml-auto text-[12px] text-[#15803D]">{s.kind === "pick" ? "Done · decision locked" : "Done · you can still change it"}</span>}
        {onGuide && (
          <button
            data-guide="show-me-how"
            type="button"
            onClick={onGuide}
            className={`${done && !sealed ? "" : "ml-auto"} inline-flex items-center gap-1 rounded border border-[#DDE1E8] bg-white px-2 py-1 text-[12px] font-semibold text-[#3730A3] hover:border-[#C7CBF5] hover:bg-[#EEF0FF] focus-ring`}
          >
            <Icon name="play" size={12} /> Show me how
          </button>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8, transition: { duration: 0.1 } }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div data-guide="step-text" className="border-b border-[#DDE1E8] px-4 py-3.5">
            {/* One statement of the step: the full instruction when the title is only its start. */}
            {(() => {
              const stem = s.t.replace(/(…|\.\.\.)$/, "").trim();
              // A Lead Implementer step's text opens with its extension's name, which the header's step line carries.
              const w = s.w.replace(LI_TAG, "");
              const repeats = !w || w === s.t || w.startsWith(stem);
              // A per-row decision: the question and its guidance; the options are the drop-downs themselves.
              if (s.kind === "each") {
                const [head, rest = ""] = s.w.replace(LI_TAG, "").replace(/^decide \(for each item\):\s*/i, "").split(/\s*Options:/);
                const guidance = rest.split(/(?<=\.)\s+(?=Guidance:)/)[1] ?? "";
                return (
                  <>
                    <h3 className="text-[15.5px] font-bold leading-[1.4] text-[#111827]">{head}</h3>
                    {guidance && <p className="mt-2 text-[14px] leading-[1.55] text-[#3F4757]">{guidance.replace(/^Guidance:\s*(\w)/, (_, c: string) => c.toUpperCase())}</p>}
                  </>
                );
              }
              if (s.kind === "pick") {
                const question = s.w.split(/\s*Options:/)[0].replace(LI_TAG, "").replace(/^decide:\s*/i, "").trim();
                return <h3 className="text-[15.5px] font-bold leading-[1.4] text-[#111827]">{question}</h3>;
              }
              return repeats ? (
                <h3 className="text-[15.5px] font-bold leading-[1.4] text-[#111827]">{w || s.t}</h3>
              ) : (
                <>
                  <h3 className="text-[16px] font-bold leading-[1.35] text-[#111827]">{s.t}</h3>
                  <p className="mt-2 text-[14px] leading-[1.55] text-[#3F4757]">{w}</p>
                </>
              );
            })()}
          </div>
          <div className="flex-1 border-b border-[#DDE1E8] px-4 pb-3.5 [&>*:first-child]:mt-3">
            {/* A decision first; then the work the pack puts after it, in the shape that work takes. */}
            {s.kind === "pick" ? (
              <>
                {/* The question was answered and checked in the step's row (the modal opens only then):
                    here it is one line, and the step's own work is part 2. */}
                <PartHead n={1} label="Decided" />
                <DecisionSummary task={task} s={s} />
                <PartHead n={2} label={thenLabel(task, s)} />
                {rmfTable(s) === null && !regOf(task.id, n)?.steps[n] && briefOf(task.id, n)?.steps[n] === undefined && (
                  <p className="text-[14px] leading-snug text-[#111827]">{thenOf(s)}</p>
                )}
              </>
            ) : (
              // A per-row decision made in its register is made there, once: no second list here.
              s.kind !== "do" && !regOf(task.id, n)?.steps[n] && <Work task={task} s={s} readOnly={sealed} />
            )}
            {LADDER[task.id]?.[n] ? (
              <LadderWork task={task} s={s} ladder={LADDER[task.id][n]} />
            ) : STUDY[task.id]?.[n] ? (
              <StudyWork task={task} s={s} prompts={STUDY[task.id][n]} />
            ) : regOf(task.id, n)?.helper?.[n] ? (
              <RuleHelper task={task} s={s} helper={regOf(task.id, n)!.helper![n]} />
            ) : regOf(task.id, n)?.tree?.[n] ? (
              <TreeWork task={task} s={s} tree={regOf(task.id, n)!.tree![n]} />
            ) : regOf(task.id, n)?.checklist?.[n] ? (
              <ChecklistWork task={task} s={s} chk={regOf(task.id, n)!.checklist![n]} />
            ) : regOf(task.id, n)?.consistency?.step === n ? (
              <ConsistencyWork task={task} s={s} />
            ) : regOf(task.id, n)?.split?.[n] ? (
              <SplitWork task={task} s={s} />
            ) : regOf(task.id, n)?.compare?.step === n ? (
              <p className="mt-3 text-[13.5px] leading-snug text-[#111827]">Compare each office on the left, above the register.</p>
            ) : regOf(task.id, n)?.report?.step === n ? (
              <ReportWork task={task} s={s} />
            ) : regOf(task.id, n)?.steps[n] ? (
              <>
                <RegisterProgress task={task} s={s} />
                {/* A step that fills a register and hands the files in (T6.2 step 6: the KPI, then LVR-REC and LVR-KPI):
                    the files are named and submitted once its answers are checked. */}
                {kind === "submit" && (!regOf(task.id, n)?.checkRows?.[n] || progress.rowChecks?.[`${task.id}-${n}`]) && <SubmitWork task={task} s={s} readOnly={sealed} />}
              </>
            ) : briefOf(task.id, n)?.steps[n] !== undefined ? (
              <BriefProgress task={task} s={s} />
            ) : rmfTable(s) !== null ? (
              <RmfProgress task={task} t={rmfTable(s)!} />
            ) : kind === "submit" ? (
              <SubmitWork task={task} s={s} readOnly={sealed} />
            ) : s.kind !== "do" ? null : kind === "read" ? (
              <ReadConfirm task={task} s={s} readOnly={sealed} />
            ) : kind === "grid" ? (
              <GridProgress task={task} s={s} />
            ) : kind === "copy" ? (
              <CopyWork task={task} s={s} readOnly={sealed} />
            ) : kind === "log" ? (
              <LogWork task={task} s={s} readOnly={sealed} />
            ) : (
              <Work task={task} s={s} readOnly={sealed} />
            )}
          </div>
          <p className="flex items-center gap-2 border-b border-[#DDE1E8] bg-[#F0FDF4] px-4 py-2.5 text-[13px] text-[#14532D]">
            <Icon name="checkCircle" size={15} className="shrink-0" />
            <span>
              <strong className="font-bold">Done when</strong> {LADDER[task.id]?.[n] ? `you reach rule ${LADDER[task.id][n].rule}'s first yes for the lit row` : STUDY[task.id]?.[n] ? `you have found all ${STUDY[task.id][n].length} in ${STUDY[task.id][n][0]?.col === -1 ? "the worked section" : regOf(task.id, n)?.rows.every((r) => !regOf(task.id, n)!.mine(r, desk)) ? regOf(task.id, n)!.code : regOf(task.id, n)?.rows.some((r) => !regOf(task.id, n)!.mine(r, desk)) ? "the worked rows" : "the template"}` : reading ? "you have read the screen and confirmed it" : s.o}
            </span>
          </p>
        </motion.div>
      </AnimatePresence>
      {!sealed && !done && <MessageNotice task={task} n={s.n} />}
      <footer className="flex shrink-0 items-stretch bg-[#F7F8FA]">
        <span className="flex flex-1 items-center px-4 py-3 text-[12px] text-[#5B6474]">
          {done ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#15803D]">
              <Icon name="checkCircle" size={15} /> Complete
            </span>
          ) : next?.kind === "pick" ? (
            // A question is answered in its row of the step list, whatever tool its second part uses.
            `Step ${next.n} is a question, in the step list.`
          ) : next && next.key === toolKey ? (
            `Step ${next.n} is also done here.`
          ) : next ? (
            next.key ? `Step ${next.n} is done in ${next.tool}.` : `Step ${next.n} is done in the step list.`
          ) : (
            "This is the last step."
          )}
        </span>
        {done ? (
          s.kind === "pick" ? (
            <button type="button" onClick={goNext} className="inline-flex min-h-12 items-center gap-1.5 border-l border-[#DDE1E8] bg-[#4338CA] px-5 text-[14px] font-semibold text-white hover:brightness-90 focus-ring">
              Next step <Icon name="arrowRight" size={14} />
            </button>
          ) : (
            <button type="button" onClick={onClose} className="inline-flex min-h-12 items-center gap-1.5 border-l border-[#DDE1E8] bg-[#111827] px-5 text-[14px] font-semibold text-white hover:brightness-110 focus-ring">
              Done <Icon name="check" size={14} />
            </button>
          )
        ) : (
          <button
            type="button"
            data-guide="mark-complete"
            disabled={sealed || !stepAnswered(desk, progress, task, s, start)}
            onClick={complete}
            className="min-h-12 border-l border-[#DDE1E8] bg-[#4338CA] px-5 text-[14px] font-semibold text-white hover:brightness-90 focus-ring disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] disabled:hover:brightness-100"
          >
            Mark activity complete
          </button>
        )}
      </footer>
    </aside>
  );
}

const th = "border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3.5 py-[9px] text-left font-semibold last:border-r-0";
const td = "border-b border-r border-[#E9ECF1] px-3.5 py-[9px] align-top last:border-r-0";

/** The mentee's assignment, as Home › My Organisation states it: ID, start date, each task's owner. */
function Assignment() {
  const { desk, start, here } = useDesk();
  const week = here ? desk.tasks[here.task].week : 1;
  const ids = desk.order.filter((t) => desk.tasks[t].week === week);
  return (
    <div className="grid border-b border-[#DDE1E8] bg-[#F7F8FA] text-[13px] sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
      <dl className="grid content-start gap-2 border-[#DDE1E8] px-4 py-3 max-sm:border-b sm:border-r">
        <div><dt className="text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">Mentee ID</dt><dd className="font-mono font-semibold text-[#111827]">{desk.mentee}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">Start date</dt><dd className="font-mono font-semibold text-[#111827]">{dmy(start)}</dd></div>
      </dl>
      <table className="w-full border-collapse">
        <thead className="text-[11px] uppercase tracking-[0.06em] text-[#5B6474]"><tr><th className={th}>Task</th><th className={th}>Task owner</th></tr></thead>
        <tbody>
          {ids.map((t) => (
            <tr key={t}><td className={`${td} font-mono text-[12px] font-semibold text-[#111827]`}>{t}</td><td className={`${td} text-[#111827]`}>{desk.tasks[t].owner}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The task's four platform folders, under My Tasks. */
function Folders({ taskId }: { taskId: string }) {
  const { desk } = useDesk();
  const names = ["00_Admin — signed forms", "01_Inputs — what you receive (read-only)", "02_Working — your drafts", "03_Submission — final files"];
  return (
    <div data-guide="folders" className="@container border-b border-[#DDE1E8] bg-white">
      <p className="border-b border-[#E9ECF1] bg-[#F7F8FA] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{taskId} · your folders</p>
      {/* The paths are copied character for character, so one is never broken across lines: in a
          narrow window (the side window beside READ-ME-FIRST) each label sits above its path. */}
      <dl className="text-[13px]">
        {folders(desk, desk.tasks[taskId]).map((f, i) => (
          <div key={f} className="grid gap-0.5 border-b border-[#E9ECF1] px-3.5 py-2 last:border-b-0 @[520px]:grid-cols-[45%_1fr] @[520px]:gap-3">
            <dt className="text-[12.5px] text-[#3F4757]">{names[i]}</dt>
            <dd className="whitespace-nowrap font-mono text-[12.5px] text-[#111827]">{f}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Home › My plan: every due date of the 12 weeks from the mentee's own start, tests included. */
function Plan() {
  const { desk, start, here } = useDesk();
  const date = (d: Date) => `${fmtDay(d)} ${d.getFullYear()}`;
  const rows = desk.weeks.flatMap((w) => {
    // "KC-01", or "FGE (Foundation Gate Exam)"
    const m = (w.kc ?? "").match(/^(\S+)(?: \((.+)\))?$/);
    return [
      ...desk.order.filter((t) => desk.tasks[t].week === w.n).map((t) => ({ wk: w.n, id: t, org: desk.tasks[t].orglbl, title: desk.tasks[t].title, due: date(dueDate(start, desk.tasks[t].dueDay)) })),
      ...(m ? [{ wk: w.n, id: m[1], org: "", title: m[2] ?? "Knowledge check", due: date(testDue(start, w.n)) }] : []),
    ];
  });
  return (
    <div data-guide="plan" className="overflow-x-auto border-b border-[#DDE1E8] bg-white">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead className="bg-[#F7F8FA] text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
          <tr>{["Wk", "Task / test", "Due", "Title", "Org"].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={here?.task === r.id ? "bg-[#F3F4FF]" : ""}>
              <td className={`${td} font-mono text-[12px] text-[#5B6474]`}>{r.wk}</td>
              <td className={`${td} font-mono text-[12px] font-semibold text-[#111827]`}>{r.id}</td>
              <td className={`${td} whitespace-nowrap font-semibold text-[#111827]`}>{r.due}</td>
              <td className={`${td} text-[#111827]`}>{r.title}</td>
              <td className={`${td} text-[#3F4757]`}>{r.org}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The first item the step in hand tags, scrolled into view when a list opens: BKB-POL-016 sits some twenty rows
 * down the library, and the owner had to scroll to find it (T5.1 step 1).
 */
function useCitedInView() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.querySelector<HTMLElement>("[data-cited]")?.scrollIntoView({ block: "center" });
  }, []);
  return box;
}

/** The Policy Library's documents: the group's, and the addenda of the mentee's own two organisations. */
function libraryDocs(desk: Desk, p: Progress) {
  const own = new Set(Object.values(desk.orgs).map((o) => (o as { addendum?: string }).addendum));
  // A saved copy of an official source is filed once the learner has sorted the monitoring results (T11.2 step 2): listed
  // earlier, the two copies would say which results are official. ponytail: the one task with saved sources, by name.
  const saved = !!p.done[stepKey("T11.2", 2)] || !!p.submitted["T11.2"];
  return desk.library.docs.filter(([code]) => (!code.startsWith("BKB-ADD-") || own.has(code)) && (saved || !code.startsWith("SRC-")));
}

/**
 * Policies › Policy Library: the group's documents and the addenda of the mentee's two organisations,
 * each opening in its own window. The pack's mock-up listed codes only, with nothing behind them, so
 * a step that said "open BKB-ADD-16 Section 2" had no way in from the toolbar. A document the step in hand
 * cites carries the step's tag, as a tool does in its menu.
 */
function PolicyLibrary() {
  const { desk, here, openTool, progress } = useDesk();
  const step = here ? desk.tasks[here.task].steps[here.n - 1] : undefined;
  const task = here ? desk.tasks[here.task] : undefined;
  const cited = new Set((task && step ? stepSources(task, step.n, step.refs.docs) : []).map(([id]) => id));
  const docs = libraryDocs(desk, progress);
  const box = useCitedInView();
  const groups: [string, typeof docs][] = [
    ["Your organisations' addenda", docs.filter(([c]) => c.startsWith("BKB-ADD-"))],
    ["Group documents", docs.filter(([c]) => !c.startsWith("BKB-ADD-") && !c.startsWith("SRC-"))],
    // Copies of official sources saved for a regulatory brief (T11.2): kept with the brief, as evidence of the text as read.
    ["Saved regulatory sources", docs.filter(([c]) => c.startsWith("SRC-"))],
  ];
  return (
    <div ref={box} data-guide="policy-library" className="grid gap-4 bg-white p-4">
      {groups.map(([h, list]) => (
        <section key={h}>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{h}</h3>
          <ul className="divide-y divide-[#E9ECF1] rounded border border-[#DDE1E8]">
            {list.map(([code, title]) => (
              <li key={code}>
                <button
                  type="button"
                  data-doc={code}
                  data-cited={cited.has(code) || undefined}
                  onClick={() => openTool(`doc|${code}`)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-[#F7F8FA] focus-ring ${cited.has(code) ? "bg-[#FFFBF2] shadow-[inset_3px_0_0_#D97706]" : ""}`}
                >
                  <span className="w-[104px] shrink-0 font-mono text-[12px] font-semibold text-[#111827]">{code}</span>
                  <span className="min-w-0 flex-1 text-[#3F4757]">{title}</span>
                  {cited.has(code) && <span className="shrink-0 rounded-[3px] bg-[#FDE7B8] px-1.5 py-0.5 text-[11px] font-semibold text-[#78350F]">Step {here?.n}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * Learn › Reference pages: the pack's reference sheets ("Ref-27000 family", "Ref-ISMS processes" …), each
 * opening in its own window. The pages the step in hand cites carry its tag, as a cited document does in
 * the Policy Library.
 */
function ReferencePages() {
  const { desk, here, openTool } = useDesk();
  const step = here ? desk.tasks[here.task].steps[here.n - 1] : undefined;
  const cited = new Set(step?.refs.pages ?? []);
  const box = useCitedInView();
  return (
    <div ref={box} data-guide="reference-pages" className="bg-white p-4">
      <ul className="divide-y divide-[#E9ECF1] rounded border border-[#DDE1E8]">
        {Object.keys(desk.pages).sort().map((id) => (
          <li key={id}>
            <button
              type="button"
              data-page={id}
              data-cited={cited.has(id) || undefined}
              onClick={() => openTool(`page|${id}`)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-[#F7F8FA] focus-ring ${cited.has(id) ? "bg-[#FFFBF2] shadow-[inset_3px_0_0_#D97706]" : ""}`}
            >
              <span className="min-w-0 flex-1 font-medium text-[#111827]">{id}</span>
              {cited.has(id) && <span className="shrink-0 rounded-[3px] bg-[#FDE7B8] px-1.5 py-0.5 text-[11px] font-semibold text-[#78350F]">Step {here?.n}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
