"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { PartHead, Work, thenOf } from "./how-to";
import { BriefProgress, BriefWork, CopyWork, GridProgress, GridWork, LogWork, RegisterProgress, RegisterWork, RmfFile, RmfProgress, SubmitWork } from "./work-kinds";
import { BRIEFS, REGISTERS, deliverableFor, stepSources } from "@/lib/desk/registers";
import { gridKey, stepAnswered } from "@/lib/desk/work";
import { Inbox } from "./chat";
import { ToolScreen } from "./viewer";
import { FloatWindow } from "./float-window";
import { DocCitation } from "./doc-text";
import { DOC_TEXT } from "@/lib/desk/docs";
import { OrgDetails, type OrgFull } from "./org-drawer";
import { dmy, dueDate, fmtDay, rmfTable, testDue, workKind, type Step, type Task } from "@/lib/desk/model";
import { RMF, folders, submitCodes } from "@/lib/desk/forms";
import { stepKey } from "@/lib/desk/progress";
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

/** A tool opened for reading: a floating, resizable window with just its screen. */
export function ToolWindow({ toolKey, index, onClose, beside, plain }: {
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
  const deliverable = here && step?.key === toolKey && !plain ? deliverableFor(desk.tasks[here.task], here.n) : null;
  const sec = toolKey.split("|")[0];
  const mock = desk.tp[toolKey] ?? desk.tp[`${sec}|*`];
  // Beside the modal: in the gap to its left when there is one; otherwise at the right edge, over
  // the instruction panel the mentee has already read, never over the table they are filling in.
  // The gap is used down to 320px wide, the window narrowed to fit it.
  const [place] = useState(() => {
    const m = typeof document === "undefined" ? null : document.querySelector("[data-desk-modal]")?.getBoundingClientRect();
    const off = 12 + index * 28;
    const gap = m ? m.left / appZoom() - off - 12 : Infinity;
    return gap >= 320 ? { left: `${off}px`, width: Math.min(420, gap) } : { left: `calc(100vw / var(--app-zoom) - ${420 + off}px)`, width: 420 };
  });
  return (
    <FloatWindow
      title={mock?.tool ?? toolKey.replace("|", " › ")}
      eyebrow={`${desk.sections[sec]?.t ?? sec}${mock?.stamp ? ` · ${mock.stamp}` : ""}`}
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
  const mock = desk.tp[toolKey] ?? desk.tp[`${sec}|*`];
  const section = desk.sections[sec];
  const task = here ? desk.tasks[here.task] : null;
  const s = task && here ? task.steps[here.n - 1] : undefined;
  const title = mock?.tool ?? toolKey.replace("|", " › ");
  // The documents the step says to copy from, when their text is on the platform. The step opens on
  // its source, beside the work, so the mentee reads the value where it is written.
  const sources = (task && s ? stepSources(task, s.n, s.refs.docs) : []).filter(([id]) => DOC_TEXT.has(id));
  const deliverable = task && s ? deliverableFor(task, s.n) : null;
  // While the modal fades out, completing a step has already moved on: opening that step's sources
  // then would leave windows behind and hold the exit open.
  const present = useIsPresent();
  // A step's first source opens beside the work by itself; the others, and a closed one, from the
  // "Read from" strip. Kept per step, since the modal walks on to the next step in place.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const sid = (i: number | string) => `${here?.task}-${here?.n}:${i}`;
  const isShown = (i: number | string) => toggled[sid(i)] ?? (i === 0 || i === "tool");
  const show = (i: number | string, on: boolean) => setToggled((t) => ({ ...t, [sid(i)]: on }));
  // A step that fills READ-ME-FIRST works in the file; the screen it copies from (My Organisation,
  // My Tasks, My plan) is the source, open in its own window beside it.
  const rmf = s ? rmfTable(s) : null;
  // The step that hands READ-ME-FIRST in (F1.1 step 6): the file is what the modal shows, as on the
  // steps that fill it; My Tasks, where the folders are, opens from the toolbar like any screen.
  const handIn = !!task && !!s && submitCodes(task, s).includes("ONB-RMF");
  const heading = rmf !== null || handIn ? RMF.file : title;
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
        className={`relative flex max-h-full w-full max-w-[1240px] flex-col overflow-hidden rounded-lg border border-[#C9CED8] bg-white shadow-[0_24px_64px_rgba(17,24,39,0.35)]`}
      >
        <header className="flex shrink-0 items-stretch border-b border-[#DDE1E8]">
          <span className="grid w-14 shrink-0 place-items-center bg-[#111827] text-white">
            <Icon name="grid" size={18} />
          </span>
          <div className="min-w-0 flex-1 px-4 py-2.5">
            <p className="text-[12px] text-[#5B6474]">
              {handIn && task ? `File · ${task.id} · 02_Working` : rmf !== null && task ? `File · ${task.id} · 01_Inputs` : `${section?.t ?? sec}${mock?.stamp ? ` · ${mock.stamp}` : ""}`}
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
              // Where to read: the step's source opens in its own window beside the work, so the
              // mentee copies across without switching away from the tool.
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2 text-[12.5px] text-[#78350F]">
                <Icon name="book" size={14} className="shrink-0" />
                <span className="font-semibold">Read from</span>
                {sources.map(([id, secs], i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => show(i, true)}
                    className="inline-flex items-center gap-1 rounded border border-[#FCD34D] bg-white px-2 py-0.5 font-mono text-[12px] font-semibold text-[#92400E] hover:bg-[#FEF3C7] focus-ring"
                  >
                    {id}{secs.length ? ` §${secs.join(", §")}` : ""} <Icon name="arrowUpRight" size={12} />
                  </button>
                ))}
                <span className="text-[#92400E]">opens in a window you can drag beside this one.</span>
              </div>
            )}
            {sources.map(([id, secs], i) =>
              present && isShown(i) ? (
                <FloatWindow
                  key={sid(i)}
                  title={`${id}${secs.length ? ` §${secs.join(", §")}` : ""}`}
                  eyebrow="Source · read and copy from here"
                  leading={<span className="grid h-7 w-7 place-items-center rounded bg-[#92400E] text-white"><Icon name="book" size={14} /></span>}
                  onClose={() => show(i, false)}
                  index={i}
                  width={420}
                  left={`${12 + i * 28}px`}
                >
                  <div className="px-4 py-3"><DocCitation id={id} cites={secs} /></div>
                </FloatWindow>
              ) : null,
            )}
            {task && s && handIn ? (
              <RmfFile task={task} t={0} readOnly handIn={{ name: (progress.answers[`${stepKey(task.id, s.n)}#ONB-RMF`] ?? "").trim() }} />
            ) : task && rmf !== null ? (
              <RmfFile task={task} t={rmf} readOnly={!!progress.submitted[task.id]} />
            ) : task && deliverable === "register" ? (
              <RegisterWork task={task} s={s} readOnly={!!progress.submitted[task.id]} />
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
            {desk.guard[sec] && <Guard text={desk.guard[sec]} />}
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
  const mock = desk.tp[toolKey] ?? desk.tp[`${sec}|*`];

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
  const { desk, progress, update, openTask } = useDesk();
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
    if (next.key !== toolKey) onClose(); // the next step is done elsewhere: back to the steps
  };
  const complete = () => {
    update((p) => ({ ...p, done: { ...p.done, [key]: true } }));
    if (s.kind !== "pick") goNext(); // a decision stays put so its feedback can be read
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
              const repeats = !s.w || s.w === s.t || s.w.startsWith(stem);
              if (s.kind === "pick") {
                const question = s.w.split(/\s*Options:/)[0].replace(/^decide:\s*/i, "").trim();
                return <h3 className="text-[15.5px] font-bold leading-[1.4] text-[#111827]">{question}</h3>;
              }
              return repeats ? (
                <h3 className="text-[15.5px] font-bold leading-[1.4] text-[#111827]">{s.w || s.t}</h3>
              ) : (
                <>
                  <h3 className="text-[16px] font-bold leading-[1.35] text-[#111827]">{s.t}</h3>
                  <p className="mt-2 text-[14px] leading-[1.55] text-[#3F4757]">{s.w}</p>
                </>
              );
            })()}
          </div>
          <div className="flex-1 border-b border-[#DDE1E8] px-4 pb-3.5 [&>*:first-child]:mt-3">
            {/* A decision first; then the work the pack puts after it, in the shape that work takes. */}
            {s.kind === "pick" ? (
              <>
                <PartHead n={1} label="Decide" />
                <div data-guide="decision"><Work task={task} s={s} readOnly={sealed} bare /></div>
                <PartHead n={2} label="Then" />
                {rmfTable(s) === null && !REGISTERS[task.id]?.steps[n] && BRIEFS[task.id]?.steps[n] === undefined && (
                  <p className="text-[14px] leading-snug text-[#111827]">{thenOf(s)}</p>
                )}
              </>
            ) : (
              s.kind !== "do" && <Work task={task} s={s} readOnly={sealed} />
            )}
            {REGISTERS[task.id]?.steps[n] ? (
              <RegisterProgress task={task} s={s} />
            ) : BRIEFS[task.id]?.steps[n] !== undefined ? (
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
              <strong className="font-bold">Done when</strong> {reading ? "you have read the screen and confirmed it" : s.o}
            </span>
          </p>
        </motion.div>
      </AnimatePresence>
      <footer className="flex shrink-0 items-stretch bg-[#F7F8FA]">
        <span className="flex flex-1 items-center px-4 py-3 text-[12px] text-[#5B6474]">
          {done ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#15803D]">
              <Icon name="checkCircle" size={15} /> Complete
            </span>
          ) : next && next.key === toolKey ? (
            `Step ${next.n} is also done here.`
          ) : next ? (
            `Step ${next.n} is done in ${next.tool}.`
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
            disabled={sealed || !stepAnswered(desk, progress, task, s)}
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
