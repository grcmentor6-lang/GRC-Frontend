"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { Label, press } from "./ui";
import { QUESTIONS, qTitle, krActivities, krFor, splitKr, stepRefs, type QuestionKey, type Step, type Task } from "@/lib/desk/model";
import { stepKey, type Progress } from "@/lib/desk/progress";
import { stepAnswered, submissionText } from "@/lib/desk/work";

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
  const cols = "grid grid-cols-[44px_minmax(0,1fr)_40px] @[760px]:grid-cols-[52px_minmax(0,1.25fr)_96px_minmax(0,1fr)_minmax(140px,200px)_44px]";
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
          return (
            <Fragment key={s.n}>
            {ext && (
              <li aria-label={`Lead Implementer extension ${ext.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#C7CBF5] bg-[#EEF0FF] px-4 py-2.5">
                <Icon name="shield" size={15} className="shrink-0 text-[#4338CA]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3730A3]">Lead Implementer · {ext.id}</span>
                <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-[#111827]">{ext.title}</span>
                <span className="text-[12px] text-[#3F4757]">ISO/IEC 27001 {ext.clauses} · {ext.hours} h</span>
                <Link href="/app/career" className="text-[12px] font-semibold text-[#3730A3] no-underline hover:underline focus-ring">Your career path</Link>
              </li>
            )}
            <li id={`act-${s.n}`} className="min-w-0 scroll-mt-16 border-b border-[#E9ECF1] last:border-b-[#DDE1E8]">
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
                <span className={`flex items-center justify-center ${isNext && !open ? "text-[#4338CA]" : "text-[#8A91A3]"}`}>
                  <Icon name={isNext && !open ? "chevronRight" : "chevronDown"} size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                </span>
              </button>
              {open && <Activity task={task} s={s} locked={locked} onNext={() => onFocus(s.n < task.steps.length ? s.n + 1 : 0)} />}
            </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * A step's full wording, split for the open row. The pack writes a title (sometimes cut with "…")
 * and an instruction that repeats the title, then adds detail and, for decisions, the options. The
 * options are shown as the answer choices, so they are dropped here; what is left is either the
 * whole question (when the title was cut) or the detail after the title.
 */
function stepCopy(s: Step): { short: string; title: string; detail: string } {
  // "Decide:" / "Decide for each row:" is what the Type column already says, so the table drops it.
  const lead = /^decide( for each row)?:\s*/i;
  const short = s.kind === "do" ? s.t : s.t.replace(lead, "");
  const body = s.w.split(/\s*Options:/)[0].replace(lead, "").trim();
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
  const { desk, progress, update, view, openTool } = useDesk();
  // Help is folded until asked for, then shown as tabs under the step's own bar: no row of its own.
  const [q, setQ] = useState<QuestionKey | null>(null);
  useEffect(() => {
    if (!q) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "Escape") setQ(null);
      const i = QUESTIONS.findIndex((x) => x.key === q);
      if (e.key === "ArrowRight" && i < QUESTIONS.length - 1) setQ(QUESTIONS[i + 1].key);
      if (e.key === "ArrowLeft" && i > 0) setQ(QUESTIONS[i - 1].key);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [q]);
  const key = stepKey(task.id, s.n);
  const done = !!progress.done[key];
  // Editable until the task is submitted, even once the step is marked complete.
  const sealed = !!progress.submitted[task.id];
  const readOnly = locked || sealed;
  // Steps naming a tool with a screen are worked in that tool's modal; the two that name none stay here.
  const inTool = !!s.key && !!desk.tp[s.key];
  const note = desk.notes[task.id]?.find(([n]) => n === s.n)?.[2] ?? s.help;
  const refs = stepRefs(s);

  const refName = (kind: string, id: string): string => {
    if (kind === "rule") return desk.rules[id]?.[0] ?? "Rule";
    if (kind === "tpl") return desk.tpls[id]?.[2] ?? "Template";
    if (kind === "doc") {
      const [doc, secs] = id.split("#");
      return `${desk.docs[doc] ?? "Library document"}${secs ? ` · §${secs.split(",").join(", §")}` : ""}`;
    }
    if (kind === "clause") return desk.iso[id] ? `ISO/IEC 27001 · ${desk.iso[id]}` : "ISO/IEC 27001 clause";
    if (kind === "page") return "Reference page";
    return "Your data file";
  };
  const initials = task.owner.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");

  // Short, plain answers built only from what the pack says. NOTE: a step's own `why` is the answer
  // explanation of a decision (the pack reveals it after review), so it is never shown here.
  const taskWhy = typeof task.card["Why am I doing this"] === "string" ? firstSentence(task.card["Why am I doing this"] as string) : "";

  const answer: Record<QuestionKey, ReactNode> = {
    // The open row already shows the instruction; Do adds only the owner's note, in simpler words.
    do: (
      <figure className="grid gap-2">
        <blockquote className="border-l-2 border-[#C7CBF5] pl-3 text-[14px] leading-relaxed text-[#111827]">{note || s.w}</blockquote>
        {note && (
          <figcaption className="flex items-center gap-2 text-[12px] text-[#5B6474]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#EEF0FF] text-[9.5px] font-semibold text-[#3730A3]">{initials}</span>
            In simpler words, from the {task.owner}
          </figcaption>
        )}
      </figure>
    ),
    // Why the work matters, in one plain line from the task's own "Why am I doing this". The key
    // result is not repeated here: the table's Key result column already shows it.
    why: <p className="text-[14px] leading-relaxed text-[#111827]">{taskWhy || task.obj}</p>,
    read: refs.length ? (
      <ul className="grid gap-px overflow-hidden rounded border border-[#DDE1E8] bg-[#E9ECF1] sm:grid-cols-2">
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

  const markDone = () => {
    update((p) => ({ ...p, done: { ...p.done, [key]: true } }));
    onNext();
  };

  // The Help toggle rides inside the bar the step already has, beside its main action.
  const helpButton = (
    <button
      type="button"
      onClick={() => setQ(q ? null : "do")}
      aria-expanded={!!q}
      aria-label="Help with this step"
      title="Do, Why and References for this step"
      className={`inline-flex h-9 items-center gap-1.5 rounded border px-3 text-[13px] font-medium ${press} ${
        q ? "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3]" : "border-[#DDE1E8] bg-white text-[#3F4757] hover:border-[#C9CED8] hover:text-[#111827]"
      }`}
    >
      <Icon name="help" size={15} />
      Help
    </button>
  );

  // Do · Why · Reference as tabs, in place, directly under the bar that opened them.
  const helpPanel = q && (
    <section aria-label="Help with this step" className="desk-pop mt-2 rounded border border-[#DDE1E8] bg-white">
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
        <button type="button" onClick={() => setQ(null)} aria-label="Close help" className="grid w-9 shrink-0 place-items-center border-l border-[#E9ECF1] text-[#8A91A3] hover:bg-white hover:text-[#3F4757] focus-ring">
          <Icon name="x" size={15} />
        </button>
      </div>
      <div role="tabpanel" aria-label={qTitle(QUESTIONS.find((x) => x.key === q)!)} className="px-4 py-3.5">
        {answer[q]}
      </div>
    </section>
  );

  return (
    <div className="border-t border-[#E9ECF1] bg-white px-4 pb-4 pt-3">
      {inTool ? (
        <>
          {/* The work happens in the platform tool the step names: the step guides, the tool is where. */}
          <div className="flex flex-wrap items-center gap-3 rounded border border-[#DDE1E8] bg-[#F7F8FA] p-3">
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded border border-[#E3E6EC] bg-white text-[#3F4757]">
              <Icon name="grid" size={15} />
            </span>
            <span className="min-w-[11rem] flex-1">
              <span className="block text-[12px] text-indigo-700">{done ? "Done in" : "Do this step in"}</span>
              <span className="block text-[14px] font-semibold text-slate-900">{s.tool}</span>
              <span className="block text-[12px] text-slate-500">Done when: {s.o}</span>
            </span>
            <span className="flex items-center gap-2">
              {helpButton}
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
                  disabled={locked}
                  onClick={() => openTool(s.key)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
                >
                  Open {s.tool.split("›").pop()?.trim()} <Icon name="arrowUpRight" size={14} />
                </button>
              )}
            </span>
          </div>
          <Submitted task={task} s={s} />
          {helpPanel}
        </>
      ) : (
        <>
          {/* Help sits on the heading line, above the choices, where it is seen before deciding. */}
          <div className="flex items-center justify-between gap-3">
            <Label>{s.kind === "each" ? "Your decision for each row" : s.kind === "pick" ? "Your decision" : "Your work"}</Label>
            {helpButton}
          </div>
          {helpPanel}
          <Work task={task} s={s} readOnly={readOnly} bare />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-slate-500">
              <span className="font-medium text-slate-700">Done when:</span> {s.o}
            </p>
            <span className="flex items-center gap-2">
              {done ? (
                <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium text-emerald-700"><Icon name="checkCircle" size={16} />Complete</span>
              ) : (
                <button
                  type="button"
                  disabled={readOnly || !stepAnswered(desk, progress, task, s)}
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
    </div>
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

  if (s.kind === "pick" && s.opt)
    return (
      <fieldset className={`${bare ? "mt-2" : "mt-4"} grid gap-2`} disabled={readOnly}>
        {!bare && <legend className="mb-2"><Label>Your decision</Label></legend>}
        {s.opt.map((o, i) => {
          const letter = String.fromCharCode(65 + i);
          const on = pick === letter;
          return (
            <label key={o} className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 text-[14px] ${on ? "border-[#4338CA] bg-[#F3F4FF]" : "border-[#DDE1E8] hover:border-[#C9CED8] hover:bg-[#FAFAFC]"}`}>
              <input type="radio" name={key} checked={on} onChange={() => setPick(letter)} className="mt-0.5 accent-indigo-600" />
              <span><span className="mr-1.5 font-semibold text-slate-500">{letter}</span>{o}</span>
            </label>
          );
        })}
        <p className="text-[12px] text-slate-500">The best option and its reason appear after the task is reviewed.</p>
      </fieldset>
    );

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
