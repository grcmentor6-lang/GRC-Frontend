"use client";

import { Fragment, useCallback, useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { Label, press } from "./ui";
import { QUESTIONS, qTitle, krActivities, krFor, rmfTable, splitKr, stepRefs, type QuestionKey, type Step, type Task } from "@/lib/desk/model";
import { decisionChecked, stepKey, type DecisionFeedback, type Progress } from "@/lib/desk/progress";
import { api } from "@/lib/api";
import { ATTEST, RMF, attestDone, attestKey, type Attest } from "@/lib/desk/forms";
import { briefOf, regOf } from "@/lib/desk/registers";
import { GuidedTour, markTourSeen, useTourOnce } from "@/components/app/guided-tour";
import { useAuth } from "@/components/auth/auth-provider";
import { STEP_GUIDES } from "./step-guides";
import { DECISION_CONTEXT } from "@/lib/desk/decision-context";
import { FloatWindow } from "./float-window";
import { UndertakingCard } from "./undertaking";
import { stepAnswered, submissionText } from "@/lib/desk/work";
import { MessageNotice } from "./chat";

const REF_ICON: Record<string, IconName> = { rule: "shield", page: "table", tpl: "file", ds: "grid", doc: "book", clause: "pin" };

export function isStepComplete(p: Progress, task: Task, s: Step): boolean {
  return !!p.done[stepKey(task.id, s.n)];
}

/**
 * The How-to tab: every activity as a numbered step, the current one open, the others a click
 * away. One step is open at a time: opening another closes it, and the key results follow.
 */
export function HowTo({ task, focus, onFocus, locked }: { task: Task; focus: number; onFocus: (n: number) => void; locked: boolean }) {
  const { desk, progress } = useDesk();
  const doneCount = task.steps.filter((x) => isStepComplete(progress, task, x)).length;
  // The first step not yet done is the one to do next; it carries the UP NEXT tag.
  const next = locked ? 0 : (task.steps.find((x) => !isStepComplete(progress, task, x))?.n ?? 0);
  // Grid of the redesign: # · step · type · KR · where · chevron. Below 760px of sheet the three
  // middle columns fold into the step cell rather than scrolling sideways.
  // Step and key result share the room (step a little more); where it happens is capped. Long text
  // stays on one line and the full wording is on hover.
  // The Help column before the chevron holds each step's ?, drawn over the row button (a button
  // cannot hold another). Its width is set here and on the ? itself, so the two stay matched.
  const cols = "grid grid-cols-[44px_minmax(0,1fr)_52px_40px] @[760px]:grid-cols-[52px_minmax(0,1.25fr)_96px_minmax(0,1fr)_minmax(140px,200px)_60px_44px]";
  // Which step's help is open, and on which tab. Lives here so the ? in a closed row can open it.
  // Which step's help window is open, and on which tab. Lit on that step's ? while it is open.
  const [help, setHelp] = useState<{ n: number; q: QuestionKey } | null>(null);
  // A help window belongs to its task: moving to another task closes it. Adjusted during render
  // rather than in an effect, so a ? from the old task never paints lit.
  const [helpTask, setHelpTask] = useState(task.id);
  if (task.id !== helpTask) {
    setHelpTask(task.id);
    setHelp(null);
  }
  const helpStep = help ? task.steps.find((x) => x.n === help.n) : undefined;
  const cell = "border-r border-[#E9ECF1]";
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-2.5 border-b border-[#DDE1E8] px-4 py-2.5">
        <h2 className="text-[14px] font-bold text-[#111827]">Step by step</h2>
        <span className="text-[13px] text-[#5B6474] tabular-nums">
          {task.steps.length} activities · {task.ndec} decisions · {doneCount}/{task.steps.length} complete
        </span>
      </div>
      <div
        role="row"
        className={`${cols} border-b border-[#DDE1E8] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]`}
      >
        <span className={`${cell} py-2 text-center`}>#</span>
        <span className={`${cell} px-3.5 py-2 @[760px]:border-r`}>Step</span>
        <span className={`${cell} hidden px-3 py-2 @[760px]:block`}>Type</span>
        <span className={`${cell} hidden px-3 py-2 @[760px]:block`}>Key result</span>
        <span className={`${cell} hidden px-3 py-2 @[760px]:block`}>Where</span>
        <span className={`${cell} py-2 text-center`}>Help</span>
        <span className="py-2" />
      </div>
      <ol>
        {task.steps.map((s, i) => {
          const open = s.n === focus;
          // A Lead Implementer extension's steps run together; a band heads the run.
          const ext = s.li && task.steps[i - 1]?.li !== s.li ? desk.li[s.li] : null;
          const done = isStepComplete(progress, task, s);
          const isNext = s.n === next;
          const kr = krFor(task, s.n);
          const tag = kr ? splitKr(kr.kr).tag.replace(" KR", "") : "";
          const decision = s.kind !== "do";
          const copy = stepCopy(s);
          const helpOpen = help?.n === s.n;
          return (
            <Fragment key={s.n}>
            {ext && (
              <li aria-label={`Lead Implementer extension ${ext.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#C7CBF5] bg-[#EEF0FF] px-4 py-2.5">
                <Icon name="shield" size={15} className="shrink-0 text-[#4338CA]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3730A3]">Lead Implementer · {ext.id}</span>
                <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-[#111827]">{ext.title}</span>
                <span className="text-[12px] text-[#3F4757]">ISO/IEC 27001 {ext.clauses} · {ext.hours} h</span>
                {/* The pack lists the extension's key result among the task's own (T3.1: "LI-01 KR — …"), and
                    the task's time includes it: it is part of the task, handed in as its own file. */}
                {task.krs.some((k) => k.startsWith(`${ext.id} KR`)) && <span data-li-part className="w-full text-[12.5px] text-[#3F4757]">Part of this task: its key result {ext.id} is one of {task.id}&apos;s, and its own file is handed in at the end of these steps.</span>}
                <Link href="/app/certification" className="text-[12px] font-semibold text-[#3730A3] no-underline hover:underline focus-ring">Certification path</Link>
              </li>
            )}
            <li id={`act-${s.n}`} className="min-w-0 scroll-mt-16 border-b border-[#E9ECF1] last:border-b-[#DDE1E8]">
              <div className="relative">
              <button
                type="button"
                onClick={() => onFocus(open ? 0 : s.n)}
                aria-expanded={open}
                className={`${cols} w-full items-stretch text-left focus-ring ${
                  open || isNext ? "bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA]" : "bg-white hover:bg-[#FAFAFC]"
                }`}
              >
                <span className={`${cell} flex items-center justify-center`}>
                  {done ? (
                    // Done keeps its number, so the step is still findable by it: a green pill, tick and number.
                    <span className="inline-flex h-6 items-center gap-0.5 rounded-full bg-[#16A34A] pl-1.5 pr-2 text-[12px] font-bold text-white tabular-nums" aria-label={`Step ${s.n}, done`}>
                      <Icon name="check" size={11} strokeWidth={3.5} />
                      {s.n}
                    </span>
                  ) : locked ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EEF0F4] text-[#8A91A3]"><Icon name="lock" size={12} /></span>
                  ) : isNext || open ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-[#4338CA] bg-white text-[12px] font-bold text-[#4338CA] tabular-nums">{s.n}</span>
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EEF0F4] text-[12px] font-semibold text-[#5B6474] tabular-nums">{s.n}</span>
                  )}
                </span>
                <span className={`${cell} flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 px-3.5 py-3 ${open ? "" : "@[760px]:flex-nowrap"} ${locked ? "text-[#6B7280]" : "text-[#111827]"}`}>
                  {/* Closed: one line, full wording on hover. Open: the step in full — the whole question
                      for a decision, and whatever the instruction adds beyond the title, in small type. */}
                  <span className={`min-w-0 text-[14px] leading-snug ${open ? "" : "@[760px]:truncate"}`} title={open ? undefined : copy.title === copy.short ? (copy.detail ? `${copy.short}. ${copy.detail}` : copy.short) : copy.title}>
                    {open ? copy.title : copy.short}
                  </span>
                  {isNext && <span className="shrink-0 rounded-[3px] bg-[#4338CA] px-1.5 py-0.5 text-[11px] font-semibold text-white">UP NEXT</span>}
                  {s.li && <span title={`Lead Implementer extension: ${desk.li[s.li]?.title ?? s.li}`} className="shrink-0 rounded-[3px] border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#3730A3]">{s.li}</span>}
                  {open && copy.detail && <span className="block w-full text-[13px] leading-snug text-[#5B6474]">{copy.detail}</span>}
                  {/* Narrow sheet: the folded columns ride along under the step. */}
                  <span className="flex w-full flex-wrap items-center gap-2 text-[12px] text-[#5B6474] @[760px]:hidden">
                    {decision && <TypeChip each={s.kind === "each"} />}
                    {tag && <span className="font-mono font-semibold text-[#3730A3]">{tag}</span>}
                    <span>{s.tool}</span>
                  </span>
                </span>
                <span className={`${cell} hidden items-center px-3 text-[13px] text-[#3F4757] @[760px]:flex`}>{decision ? <TypeChip each={s.kind === "each"} /> : "Activity"}</span>
                <span className={`${cell} hidden min-w-0 items-center gap-2 px-3 @[760px]:flex`} title={kr ? `${splitKr(kr.kr).tag}: ${splitKr(kr.kr).text}` : undefined}>
                  {kr ? (
                    <>
                      <span className="shrink-0 font-mono text-[12px] font-semibold text-[#3730A3]">{tag}</span>
                      <span className="truncate text-[13px] text-[#3F4757]">{splitKr(kr.kr).text}</span>
                    </>
                  ) : (
                    <span className="font-mono text-[12px] text-[#8A91A3]">—</span>
                  )}
                </span>
                <span className={`${cell} hidden min-w-0 items-center px-3 text-[13px] text-[#3F4757] @[760px]:flex`} title={s.tool}>
                  <span className="truncate">{s.tool}</span>
                </span>
                <span aria-hidden className={cell} />
                <span className={`flex items-center justify-center ${isNext && !open ? "text-[#4338CA]" : "text-[#8A91A3]"}`}>
                  <Icon name={isNext && !open ? "chevronRight" : "chevronDown"} size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                </span>
              </button>
              {/* The step's help, in its own column of the row: a sibling of the row button, since a
                  button cannot hold another. It opens a floating window and leaves the step as it is. */}
              <button
                type="button"
                onClick={() => {
                  setHelp(helpOpen ? null : { n: s.n, q: "do" });
                }}
                aria-expanded={helpOpen}
                aria-label={`Help with step ${s.n}`}
                title="Help: what to do, why, and what to read"
                className="group absolute inset-y-0 right-10 grid w-[51px] place-items-center outline-none @[760px]:right-11 @[760px]:w-[59px]"
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full border transition-colors group-focus-visible:ring-2 group-focus-visible:ring-[#4338CA] group-focus-visible:ring-offset-2 ${helpOpen ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#DDE1E8] bg-white text-[#3F4757] hover:border-[#C7CBF5] hover:bg-[#EEF0FF] hover:text-[#3730A3]"}`}>
                  <Icon name="help" size={15} />
                </span>
              </button>
              </div>
              {open && (
                <Activity
                  task={task}
                  s={s}
                  locked={locked}
                  onNext={() => onFocus(s.n < task.steps.length ? s.n + 1 : 0)}
                />
              )}
            </li>
            </Fragment>
          );
        })}
      </ol>
      {help && helpStep && (
        <StepHelp key={help.n} task={task} s={helpStep} q={help.q} setQ={(q) => setHelp({ n: help.n, q })} onClose={() => setHelp(null)} />
      )}
    </div>
  );
}

/**
 * A step's full wording, split for the open row. The pack writes a title (sometimes cut with "…")
 * and an instruction that repeats the title, then adds detail and, for decisions, the options. The
 * options are shown as the answer choices, so they are dropped here; what is left is either the
 * whole question (when the title was cut) or the detail after the title.
 */
/** A decision's second half: the pack writes every one as "DECIDE … Options … Then: <the work>". */
export const thenOf = (s: Step) => {
  const t = s.kind === "pick" ? (s.w.split(/\bThen:\s*/)[1] ?? "").trim() : "";
  return t.charAt(0).toUpperCase() + t.slice(1); // cut from mid-sentence, so it starts lowercase
};

/** The heading of a decision's second part, naming it as its own task ("Sign the undertaking"). */
export function thenLabel(task: Task, s: Step): string {
  const att = ATTEST[task.id]?.[s.n];
  if (att) return att.map((a) => a.then).join(", then ");
  const t = rmfTable(s);
  if (t !== null) return `Fill table ${t + 1}, “${RMF.tables[t].title}”`;
  // A register's column: "Fill column E, “Offices (R02)”".
  const reg = regOf(task.id, s.n);
  // A report on the register's rows (F2.2 step 4): "Report data issue" on each item that needs it.
  if (reg?.report?.step === s.n) return "Report any item with unmasked data (D9)";
  if (reg?.then?.[s.n]) return reg.then[s.n];
  const cols = reg?.steps[s.n] ?? [];
  if (cols.length === 1) {
    const [letter, ...name] = reg!.cols[cols[0]].h.split(" ");
    // A template whose columns carry no letter (F2.1 CLS-RES): the column by its name.
    return /^[A-Z]$/.test(letter) ? `Fill column ${letter}, “${name.join(" ")}”` : `Fill column “${reg!.cols[cols[0]].h}”`;
  }
  if (cols.length) return `Fill ${reg!.code}, “${reg!.title.split(" · ")[1] ?? reg!.title}”`;
  // A brief's section: "Fill section 4, “Mission Critical assets”"; its hand-in names both files.
  const b = briefOf(task.id, s.n);
  if (b?.steps[s.n] !== undefined) {
    const [num, ...name] = b.sections[b.steps[s.n]].h.split(" ");
    return `Fill section ${num}, “${name.join(" ")}”`;
  }
  if (b?.handIn === s.n) return `Check the brief and hand in ${reg ? "both files" : "the file"}`;
  return "Then";
}

export const LI_TAG = /^\[LI-\d+ — [^\]]+\]\s*/;
function stepCopy(s: Step): { short: string; title: string; detail: string } {
  // "Decide:" / "Decide for each row:" is what the Type column already says, so the table drops it.
  // The pack writes a per-row decision "DECIDE (for each item): …"; neither form is shown twice.
  const lead = /^decide( for each row| \(for each (item|row)\))?:\s*/i;
  const short = s.kind === "do" ? s.t : s.t.replace(lead, "");
  // A Lead Implementer step's text opens with its extension ("[LI-05 — Statement of Applicability (SoA)] "),
  // which the row's LI chip already names.
  const body = s.w.split(/\s*Options:/)[0].replace(LI_TAG, "").replace(lead, "").trim();
  if (/(…|\.\.\.)$/.test(s.t)) return { short, title: body, detail: "" };
  const rest = body.startsWith(short) ? body.slice(short.length).replace(/^[\s.?:]+/, "").trim() : body === short ? "" : body;
  return { short, title: short, detail: rest };
}

/** The first sentence of a paragraph — enough to say why, without a block to read. */
function firstSentence(t: string): string {
  const m = t.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : t).trim();
}

/** "Decision" in the redesign's amber chip; a per-row decision says so. */
function TypeChip({ each }: { each: boolean }) {
  return (
    <span className="whitespace-nowrap rounded-[3px] border border-[#F2D29B] bg-[#FFF4DE] px-[7px] py-0.5 text-[12px] font-semibold text-[#92400E]" title={each ? "A decision for each row" : "A decision"}>
      Decision
    </span>
  );
}

function Activity({ task, s, locked, onNext }: { task: Task; s: Step; locked: boolean; onNext: () => void }) {
  const { desk, progress, update, openTool, start } = useDesk();
  const key = stepKey(task.id, s.n);
  const done = !!progress.done[key];
  // Editable until the task is submitted, even once the step is marked complete.
  const sealed = !!progress.submitted[task.id];
  const readOnly = locked || sealed;
  // Steps naming a tool with a screen are worked in that tool's modal; the two that name none stay here.
  // A decision with no second part (its question is the whole activity, e.g. F1.2 step 5) is answered
  // and completed here: there is nothing to do in the tool.
  const inTool = !!s.key && !!desk.tp[s.key] && !(s.kind === "pick" && !thenOf(s) && !ATTEST[task.id]?.[s.n]);
  // A decision's second part waits for its pick to be checked: the feedback comes first, and the
  // forms of part 2 restate the rules the question tests.
  const checked = s.kind !== "pick" || decisionChecked(progress, task.id, s.n);
  // A step worked here, in its row, carries its own walk-through (a step worked in a tool runs its
  // guide in the tool's modal). It runs the first time the step is open, and again from "Show me how".
  const { user } = useAuth();
  // A decision whose second part is done in a tool may carry a guide for its question, run here in the
  // row: keyed "<task>-<n>q", since "<task>-<n>" is the tool's guide for part 2 (T3.2 step 12).
  const guideKey = inTool ? `${task.id}-${s.n}q` : `${task.id}-${s.n}`;
  const guide = inTool && s.kind !== "pick" ? undefined : STEP_GUIDES[guideKey];
  const [guideAt, setGuideAt] = useState(-1);
  // Never over another walk-through (the desk's own tour on a first visit): wait for it to close.
  const startGuide = useCallback(() => {
    const go = () => (document.querySelector('[aria-label^="Guide:"]') ? setTimeout(go, 800) : setGuideAt(0));
    go();
  }, []);
  useTourOnce(`grc101.guide.${guideKey}`, user?.email, !!guide && !readOnly && !done, startGuide, 1600);
  // A decision stays open once marked: completing it reveals why each option is right or wrong,
  // and moving on there and then would fold that away unread. The mentee moves on with Next step.
  const markDone = () => {
    update((p) => ({ ...p, done: { ...p.done, [key]: true } }));
    onNext();
  };

  return (
    <div className="border-t border-[#E9ECF1] bg-white px-4 pb-4 pt-3">
      {inTool ? (
        <>
          {/* A decision that continues in a tool (F1.1 step 4: decide, then fill table 2): the
              decision is made here, in the step, and the tool is part two. */}
          {s.kind === "pick" && (
            <>
              <div className="flex items-start justify-between gap-3">
                <PartHead n={1} label="Decide" />
                {guide && (
                  <button data-guide="show-me-how" type="button" onClick={() => setGuideAt(0)} className="mt-1 inline-flex shrink-0 items-center gap-1 rounded border border-[#DDE1E8] bg-white px-2 py-1 text-[12px] font-semibold text-[#3730A3] hover:border-[#C7CBF5] hover:bg-[#EEF0FF] focus-ring">
                    <Icon name="play" size={12} /> Show me how
                  </button>
                )}
              </div>
              <Work task={task} s={s} readOnly={readOnly} bare />
              <PartHead n={2} label={thenLabel(task, s)} />
              <p className="mb-2 text-[14px] leading-snug text-[#111827]">{thenOf(s)}</p>
            </>
          )}
          {/* The work happens in the platform tool the step names: the step guides, the tool is where. */}
          <div className="flex flex-wrap items-center gap-3 rounded border border-[#DDE1E8] bg-[#F7F8FA] p-3">
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded border border-[#E3E6EC] bg-white text-[#3F4757]">
              <Icon name="grid" size={15} />
            </span>
            <span className="min-w-[11rem] flex-1">
              <span className="block text-[12px] text-indigo-700">{done ? "Done in" : checked ? "Do this step in" : "Opens once you check your answer"}</span>
              <span className="block text-[14px] font-semibold text-slate-900">{rmfTable(s) !== null ? `READ-ME-FIRST (01_Inputs), ${/checked against/.test(s.o) ? "checking against" : "copying from"} ${s.tool}` : s.tool}</span>
              <span className="block text-[12px] text-slate-500">Done when: {s.o}</span>
            </span>
            <span className="flex items-center gap-2">
              {done ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium text-emerald-700"><Icon name="checkCircle" size={16} />Complete</span>
                  {/* Done: the tool reopens as a read-only window; Edit brings the work back until submission. */}
                  <button type="button" onClick={() => openTool(s.key)} className={`h-9 rounded border border-[#DDE1E8] bg-white px-3 text-[13px] font-medium text-[#3F4757] hover:border-[#C9CED8] ${press}`}>
                    View
                  </button>
                  {!sealed && (
                    <button type="button" onClick={() => openTool(s.key, "work")} className={`h-9 rounded border border-[#C7CBF5] bg-white px-3 text-[13px] font-medium text-[#3730A3] hover:bg-[#EEF0FF] ${press}`}>
                      Edit
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  disabled={locked || !checked}
                  onClick={() => openTool(s.key)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
                >
                  Open {rmfTable(s) !== null ? "READ-ME-FIRST" : s.tool.split("›").pop()?.trim()} <Icon name="arrowUpRight" size={14} />
                </button>
              )}
            </span>
          </div>
          <Submitted task={task} s={s} />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            {s.kind === "pick" ? <PartHead n={1} label="Decide" /> : <Label>{s.kind === "each" ? "Your decision for each row" : "Your work"}</Label>}
            {guide && (
              <button
                data-guide="show-me-how"
                type="button"
                onClick={() => setGuideAt(0)}
                className="inline-flex shrink-0 items-center gap-1 rounded border border-[#DDE1E8] bg-white px-2 py-1 text-[12px] font-semibold text-[#3730A3] hover:border-[#C7CBF5] hover:bg-[#EEF0FF] focus-ring"
              >
                <Icon name="play" size={12} /> Show me how
              </button>
            )}
          </div>
          <Work task={task} s={s} readOnly={readOnly} bare />
          {thenOf(s) && (
            <div data-guide="part-two">
              <PartHead n={2} label={thenLabel(task, s)} />
              {checked ? (
                <>
                  <p className="text-[14px] leading-snug text-[#111827]">{thenOf(s)}</p>
                  {/* The undertaking is a document, signed as a new joiner signs one; the rules are ticked here. */}
                  {/* In order: a form opens once the one before it is saved (the rules before the undertaking). */}
                  {(ATTEST[task.id]?.[s.n] ?? []).map((a, i, all) => {
                    const waiting = i > 0 && !attestDone(progress, task.id, all[i - 1].code);
                    return a.sign ? (
                      <UndertakingCard key={a.code} task={task} a={a} readOnly={readOnly} waiting={waiting ? `Opens once you save the ${all[i - 1].title} above.` : undefined} />
                    ) : (
                      <Attestation key={a.code} task={task} a={a} readOnly={readOnly || waiting} />
                    );
                  })}
                </>
              ) : (
                <p className="rounded border border-dashed border-[#C9CED8] bg-[#F7F8FA] px-3 py-2.5 text-[13px] text-[#5B6474]">Opens once you check your answer above.</p>
              )}
            </div>
          )}
          {!readOnly && !done && <div className="mt-4"><MessageNotice task={task} n={s.n} /></div>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-slate-500">
              <span className="font-medium text-slate-700">Done when:</span> {s.o}
            </p>
            <span className="flex items-center gap-2">
              {done && s.kind === "pick" ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium text-emerald-700"><Icon name="checkCircle" size={16} />Complete</span>
                  <button type="button" onClick={onNext} className={`inline-flex h-9 items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90 ${press}`}>
                    Next step <Icon name="arrowRight" size={14} />
                  </button>
                </>
              ) : done ? (
                <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium text-emerald-700"><Icon name="checkCircle" size={16} />Complete</span>
              ) : (
                <button
                  type="button"
                  data-guide="step-complete"
                  disabled={readOnly || !stepAnswered(desk, progress, task, s, start)}
                  onClick={markDone}
                  className={`h-9 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
                >
                  Mark activity complete
                </button>
              )}
            </span>
          </div>
        </>
      )}
      {guide && (
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
  );
}

/**
 * A decision already checked in its step row, as one line in the tool where the step's second part is
 * done: the question is answered once, in the row, and is not asked again here.
 */
export function DecisionSummary({ task, s }: { task: Task; s: Step }) {
  const { progress } = useDesk();
  const pick = progress.picks[stepKey(task.id, s.n)];
  const fb = s.did ? progress.decisions?.[s.did] : undefined;
  if (typeof pick !== "string" || !s.opt) return null;
  return (
    <p data-guide="decision-summary" className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded border border-[#DDE1E8] bg-[#F7F8FA] px-3 py-2 text-[13.5px] text-[#111827]">
      <span className="text-[12px] text-[#5B6474]">Your answer</span>
      <span><span className="mr-1 font-semibold text-slate-500">{pick}</span>{s.opt[pick.charCodeAt(0) - 65]}</span>
      {fb?.best && (
        <span className={`rounded-[3px] px-1.5 py-0.5 text-[11.5px] font-semibold ${fb.correct ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
          {fb.correct ? "Best" : `Best was ${fb.best}`}
        </span>
      )}
    </p>
  );
}

/**
 * A step's help, Do · Why · Reference, in a floating window: opened from the ? in the step's row,
 * dragged wherever it does not cover the work, and left open while the mentee works in the step.
 */
function StepHelp({ task, s, q, setQ, onClose }: { task: Task; s: Step; q: QuestionKey; setQ: (q: QuestionKey) => void; onClose: () => void }) {
  const { desk, view } = useDesk();
  useEffect(() => {
    if (!q) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "Escape") onClose();
      const i = QUESTIONS.findIndex((x) => x.key === q);
      if (e.key === "ArrowRight" && i < QUESTIONS.length - 1) setQ(QUESTIONS[i + 1].key);
      if (e.key === "ArrowLeft" && i > 0) setQ(QUESTIONS[i - 1].key);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [q, setQ, onClose]);
  const note = desk.notes[task.id]?.find(([n]) => n === s.n)?.[2] ?? s.help;
  const refs = stepRefs(s);

  const refName = (kind: string, id: string): string => {
    if (kind === "rule") return desk.rules[id]?.[0] ?? "Rule";
    if (kind === "tpl") return desk.tpls[id]?.[2] ?? "Template";
    if (kind === "doc") {
      const [doc, secs] = id.split("#");
      return `${desk.docs[doc] ?? "Library document"}${secs ? ` · Section ${secs.split(",").join(", Section ")}` : ""}`;
    }
    if (kind === "clause") return desk.iso[id] ? `ISO/IEC 27001 · ${desk.iso[id]}` : "ISO/IEC 27001 clause";
    if (kind === "page") return "Reference page";
    return "Your data file";
  };
  const initials = task.owner.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");

  // Short, plain answers built only from what the pack says. NOTE: a step's own `why` is the answer
  // explanation of a decision (the pack reveals it after review), so it is never shown here.
  const liWhy = s.li ? (desk.li[s.li] as { card?: { why?: string } } | undefined)?.card?.why : undefined;
  const taskWhy = liWhy ?? (typeof task.card["Why am I doing this"] === "string" ? firstSentence(task.card["Why am I doing this"] as string) : "");

  const answer: Record<QuestionKey, ReactNode> = {
    // The open row already shows the instruction; Do adds only the owner's note, in simpler words.
    do: (
      <figure className="grid gap-2">
        <blockquote className="border-l-2 border-[#C7CBF5] pl-3 text-[14px] leading-relaxed text-[#111827]">{note || s.w}</blockquote>
        {note && (
          <figcaption className="flex items-center gap-2 text-[12px] text-[#5B6474]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#EEF0FF] text-[9.5px] font-semibold text-[#3730A3]">{initials}</span>
            Help note from the {task.owner}
          </figcaption>
        )}
      </figure>
    ),
    // Why the work matters, in one plain line from the task's own "Why am I doing this". The key
    // result is not repeated here: the table's Key result column already shows it.
    why: <p className="text-[14px] leading-relaxed text-[#111827]">{taskWhy || task.obj}</p>,
    read: refs.length ? (
      <ul className="grid gap-px overflow-hidden rounded border border-[#DDE1E8] bg-[#E9ECF1]">
        {refs.map((r) => (
          <li key={r.kind + r.id}>
            <button type="button" onClick={() => view(r)} className="group flex w-full items-center gap-3 bg-white px-3 py-2.5 text-left hover:bg-[#FAFAFC] focus-ring">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-[#E3E6EC] text-[#3F4757]"><Icon name={REF_ICON[r.kind]} size={14} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12px] font-semibold text-[#111827]">{r.id.split("#")[0]}</span>
                <span className="block truncate text-[12.5px] text-[#5B6474]">{refName(r.kind, r.id)}</span>
              </span>
              <Icon name="chevronRight" size={14} className="text-[#8A91A3] group-hover:text-[#3F4757]" />
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[14px] text-[#5B6474]">Nothing extra to read. The instruction is complete on its own.</p>
    ),
  };

  return (
    <FloatWindow
      title={`Help with step ${s.n}`}
      eyebrow={`${task.id} · ${s.kind === "do" ? "Activity" : "Decision"}`}
      leading={<span className="grid h-7 w-7 place-items-center rounded-full bg-[#4338CA] text-white"><Icon name="help" size={15} /></span>}
      onClose={onClose}
      width={460}
      fit
      // Opens at the right edge, clear of the step and its options, which sit to the left.
      left="calc(100vw / var(--app-zoom) - 484px)"
    >
    <section aria-label="Help with this step" className="bg-white">
      <div className="flex items-stretch border-b border-[#DDE1E8] bg-[#F7F8FA]">
        <div role="tablist" aria-label="About this step" className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
          {QUESTIONS.map((x) => {
            const on = q === x.key;
            return (
              <button
                key={x.key}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => setQ(x.key)}
                title={qTitle(x)}
                className={`relative flex h-9 shrink-0 items-center gap-1.5 border-r border-[#E9ECF1] px-4 text-[13px] font-medium focus-ring ${
                  on ? "bg-white text-[#111827]" : "text-[#5B6474] hover:bg-white/70 hover:text-[#111827]"
                }`}
              >
                <Icon name={x.icon} size={15} strokeWidth={1.7} className={on ? "text-[#4338CA]" : "text-[#8A91A3]"} />
                {x.label}
                {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#4338CA]" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
      <div role="tabpanel" aria-label={qTitle(QUESTIONS.find((x) => x.key === q)!)} className="px-4 py-3.5">
        {answer[q]}
      </div>
    </section>
    </FloatWindow>
  );
}

/** The numbered halves of a decision step: 1 Decide, 2 Then. */
export function PartHead({ n, label }: { n: number; label: string }) {
  return (
    <p className={`flex items-center gap-2 ${n > 1 ? "mt-5" : ""} mb-1.5`}>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#111827] text-[11px] font-bold text-white tabular-nums">{n}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">{label}</span>
    </p>
  );
}

/**
 * The data rules, done on their step: each ticked, then saved. Saving is final: it is the record that
 * the mentee knows the rules. (The undertaking is signed as a document: undertaking.tsx.)
 */
function Attestation({ task, a, readOnly }: { task: Task; a: Attest; readOnly: boolean }) {
  const { progress, update } = useDesk();
  const k = attestKey(task.id, a.code);
  const g = progress.grids?.[k] ?? {};
  const set = (patch: Record<string, string>) => update((p) => ({ ...p, grids: { ...p.grids, [k]: { ...(p.grids?.[k] ?? {}), ...patch } } }));
  const done = !!g.at;
  const lock = readOnly || done;
  const ready = a.items.every((_, i) => g[i] === "1");
  const when = g.at ? new Date(g.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <section aria-label={`${a.title} (${a.code})`} className="mt-2.5 rounded border border-[#DDE1E8] bg-white">
      <header className="flex items-center gap-2 border-b border-[#DDE1E8] bg-[#F7F8FA] px-3.5 py-2">
        <span className="font-mono text-[12px] font-semibold text-[#111827]">{a.code}</span>
        <span className="text-[13px] font-semibold text-[#3F4757]">{a.title}</span>
        {done && (
          <span data-saved className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-emerald-700">
            <Icon name="checkCircle" size={14} /> Saved {when}
          </span>
        )}
      </header>
      <ul className="grid gap-px bg-[#E9ECF1]">
        {a.items.map((t, i) => (
          <li key={t}>
            <label className={`flex items-start gap-3 bg-white px-3.5 py-2.5 text-[14px] text-[#111827] ${lock ? "" : "cursor-pointer hover:bg-[#FAFAFC]"}`}>
              <input type="checkbox" checked={g[i] === "1"} disabled={lock} onChange={(e) => set({ [i]: e.target.checked ? "1" : "" })} className="mt-0.5 h-4 w-4 accent-indigo-600" />
              {t}
            </label>
          </li>
        ))}
      </ul>
      {!done && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DDE1E8] px-3.5 py-2.5">
          <span className="text-[12.5px] text-[#5B6474]">Tick all four, then save. Saving is final.</span>
          <button
            type="button"
            disabled={lock || !ready}
            onClick={() => set({ at: new Date().toISOString() })}
            className={`h-9 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
          >
            Save
          </button>
        </footer>
      )}
    </section>
  );
}

/** What the mentee handed in for a step done in a tool, in one line under its bar. */
function Submitted({ task, s }: { task: Task; s: Step }) {
  const { desk, progress } = useDesk();
  const text = submissionText(desk, progress, task, s);
  if (!text) return null;
  return (
    <p className="mt-2 flex items-start gap-2 text-[13px] text-[#3F4757]">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">You submitted</span>
      <span className="line-clamp-2 min-w-0">{text}</span>
    </p>
  );
}

/** Where the mentee does the activity. File uploads replace the typed box in Phase 3. */
export function Work({ task, s, readOnly, bare }: { task: Task; s: Step; readOnly: boolean; /** The caller draws the heading (and its own controls beside it). */ bare?: boolean }) {
  const { progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const pick = progress.picks[key];
  const setPick = (v: string | Record<string, string>) => update((p) => ({ ...p, picks: { ...p.picks, [key]: v } }));

  if (s.kind === "pick" && s.opt) return <Decision task={task} s={s} readOnly={readOnly} bare={bare} />;

  if (s.kind === "each" && s.opt) {
    const rows = task.panel.pl.r ?? [];
    const picks = typeof pick === "object" ? pick : {};
    return (
      <fieldset className={`${bare ? "mt-2" : "mt-4"} grid gap-2`} disabled={readOnly}>
        {!bare && <legend className="mb-2"><Label>Your decision for each row</Label></legend>}
        {(rows.length ? rows : [["All rows"]]).map((r, i) => (
          <label key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(140px,220px)] items-center gap-3 rounded border border-[#DDE1E8] px-3 py-2 text-[13px]">
            <span className="min-w-0 truncate text-slate-700"><span className="font-medium">{r[0]}</span>{r[1] ? ` · ${r[1]}` : ""}</span>
            <select
              value={picks[i] ?? ""}
              onChange={(e) => setPick({ ...picks, [i]: e.target.value })}
              className="rounded border border-[#C9CED8] bg-white px-2 py-1.5 text-[13px] focus-ring"
            >
              <option value="" disabled>Choose…</option>
              {s.opt!.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div className={`${bare ? "mt-2" : "mt-4"} grid gap-1.5`}>
      {!bare && <label htmlFor={`w-${key}`}><Label>Your work</Label></label>}
      <textarea
        id={`w-${key}`}
        rows={3}
        readOnly={readOnly}
        value={progress.answers[key] ?? ""}
        onChange={(e) => update((p) => ({ ...p, answers: { ...p.answers, [key]: e.target.value } }))}
        placeholder="Type what you found or did: the values you copied, the row you used, the reference you followed."
        className="w-full resize-y rounded border border-[#C9CED8] bg-white px-3 py-2.5 text-[14px] leading-[1.5] text-[#111827] placeholder:text-[#8A91A3] focus:border-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4338CA]/15"
      />
    </div>
  );
}

/**
 * A decision from three options. Marking the step complete locks the pick and reveals the feedback:
 * the best option, and for each option why it is right or wrong and what happens if you take it.
 * The key is fetched from the backend only then, so it is never in the browser before the choice.
 */
function Decision({ task, s, readOnly, bare }: { task: Task; s: Step; readOnly: boolean; bare?: boolean }) {
  const { progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const raw = progress.picks[key];
  const pick = typeof raw === "string" ? raw : undefined;
  const done = !!progress.done[key];
  // Checked: the pick is locked and its feedback shown, before the step's second part is done.
  const checked = done || (progress.acks[key] ?? []).includes("checked");
  const did = s.did;
  const fb = did ? progress.decisions?.[did] : undefined;
  const context = did ? DECISION_CONTEXT[did] : undefined;
  const [failed, setFailed] = useState(false);
  const [tries, setTries] = useState(0);
  // One radio group per copy: the same decision is drawn in the step row and in the step's window,
  // and radios sharing a name are one group to the browser, so ticking one copy unticked the other.
  const group = `${key}-${useId()}`;

  // Fetched once the pick is checked, from whichever surface checked it; kept with the progress.
  useEffect(() => {
    if (!checked || fb || !pick || !did) return;
    let live = true;
    api
      .post<DecisionFeedback>("/me/desk/decision", { id: did, pick })
      .then((r) => { if (live) update((p) => ({ ...p, decisions: { ...p.decisions, [did]: r } })); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [checked, fb, pick, did, update, tries]);
  const check = () => update((p) => ({ ...p, acks: { ...p.acks, [key]: [...(p.acks[key] ?? []).filter((x) => x !== "checked"), "checked"] } }));

  const best = fb?.best;
  return (
    <fieldset data-guide="decision" className={`${bare ? "mt-2" : "mt-4"} grid gap-2`} disabled={readOnly || checked}>
      {!bare && <legend className="mb-2"><Label>Your decision</Label></legend>}
      {context && (
        // The situation the question sits in: something to reason with before choosing.
        <p data-guide="decision-context" className="rounded border-l-2 border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2 text-[13.5px] leading-relaxed text-[#111827]">{context}</p>
      )}
      {fb && (
        <p data-guide="decision-result" className={`flex items-center gap-2 rounded px-3 py-2 text-[13.5px] font-semibold ${fb.correct === false ? "bg-[#FFFBEB] text-[#78350F]" : "bg-[#F0FDF4] text-[#14532D]"}`}>
          <Icon name={fb.correct === false ? "info" : "checkCircle"} size={16} className="shrink-0" />
          {fb.correct === true ? "You chose the best option." : fb.correct === false ? `Not the best option. The best is ${best}.` : "Your choice is recorded. The reviewer checks it against your material."}
        </p>
      )}
      {s.opt!.map((o, i) => {
        const letter = String.fromCharCode(65 + i);
        const on = pick === letter;
        const isBest = !!fb && best === letter;
        const why = fb?.options?.[i];
        const tone = fb
          ? isBest ? "border-[#86EFAC] bg-[#F0FDF4]" : on ? "border-[#FCD34D] bg-[#FFFBEB]" : "border-[#DDE1E8] bg-white"
          : on ? "border-[#4338CA] bg-[#F3F4FF]" : "border-[#DDE1E8] hover:border-[#C9CED8] hover:bg-[#FAFAFC]";
        return (
          <label key={o} className={`grid gap-1.5 rounded border px-3 py-2.5 text-[14px] ${done ? "" : "cursor-pointer"} ${tone}`}>
            <span className="flex items-start gap-3">
              <input type="radio" name={group} checked={on} onChange={() => update((p) => ({ ...p, picks: { ...p.picks, [key]: letter } }))} className="mt-0.5 accent-indigo-600" />
              <span className="min-w-0 flex-1">
                <span className="mr-1.5 font-semibold text-slate-500">{letter}</span>{o}
                {fb && (isBest || on) && (
                  <span className={`ml-2 inline-block whitespace-nowrap rounded-[3px] px-1.5 py-0.5 align-[1px] text-[11.5px] font-semibold ${isBest ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                    {isBest && on ? "Your choice · best" : isBest ? "Best" : "Your choice"}
                  </span>
                )}
              </span>
            </span>
            {why && (
              <span className="ml-7 grid gap-x-6 gap-y-0.5 text-[13px] leading-snug text-[#3F4757] md:grid-cols-2">
                <span><strong className="font-semibold text-[#111827]">Why: </strong>{why.reason}</span>
                <span><strong className="font-semibold text-[#111827]">If you do this: </strong>{why.consequence}</span>
              </span>
            )}
          </label>
        );
      })}
      {fb?.why && <p className="text-[12.5px] leading-snug text-[#5B6474]"><strong className="font-semibold text-[#3F4757]">The rule: </strong>{fb.why}</p>}
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-guide="check-answer"
            disabled={readOnly || !pick}
            onClick={check}
            className={`h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
          >
            Check my answer
          </button>
          <span className="text-[12px] text-slate-500">You see the best option and why straight away. Your choice is locked then.</span>
        </div>
      )}
      {checked && !fb && pick && (failed ? (
        <p className="flex items-center gap-2 text-[12.5px] text-[#92400E]">
          Could not load the explanation.
          <button type="button" onClick={() => { setFailed(false); setTries((t) => t + 1); }} className="font-semibold underline underline-offset-2 focus-ring">Try again</button>
        </p>
      ) : (
        <p className="text-[12.5px] text-slate-500">Loading the explanation…</p>
      ))}
    </fieldset>
  );
}

export function KrProgress({ task, kr }: { task: Task; kr: string }) {
  const { progress } = useDesk();
  const acts = krActivities(kr);
  const n = acts.filter((a) => progress.done[stepKey(task.id, a)]).length;
  const { tag, text } = splitKr(kr);
  return (
    <div className="grid gap-2">
      <p><span className="font-medium">{tag}.</span> {text}</p>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out" style={{ width: `${acts.length ? (n / acts.length) * 100 : 0}%` }} />
        </div>
        <span className="text-[12px] text-slate-500 tabular-nums">{n} / {acts.length} activities</span>
      </div>
    </div>
  );
}
