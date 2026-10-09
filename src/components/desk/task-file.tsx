"use client";

import { useEffect, useRef, useState } from "react";
import { StepBar } from "@/components/app/step-bar";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { HowTo } from "./how-to";
import { press } from "./ui";
import { dayIndex, dueDate, fmtDay, krActivities, splitKr, type Task } from "@/lib/desk/model";
import { stepKey, taskStatus } from "@/lib/desk/progress";

/** Where an outside link asks the task file to land. The file itself has no tabs any more. */
export type Tab = "task" | "how" | "refs" | "deliver" | "msgs";

/**
 * The task file: who, when and what "done" means on top, the objective and key results
 * highlighted, then the steps. Messages and submission follow the steps, because the task is not
 * finished without them.
 */
export function TaskFile({ task, focus, onFocus, tab }: { task: Task; focus: number; onFocus: (n: number) => void; tab: Tab; setTab: (t: Tab) => void }) {
  const { progress, start, isOpen } = useDesk();
  const locked = !isOpen(task.week);
  const isDone = (n: number) => !!progress.done[stepKey(task.id, n)];
  const doneCount = task.steps.filter((s) => isDone(s.n)).length;
  const st = taskStatus(progress, task);
  const due = dueText(start, task.dueDay, st === "submitted");
  // Watched by StepBar: while the task's own heading is on screen the condensed bar stays away.
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.getElementById(`act-${focus}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focus, tab]);

  return (
    <div className="mx-auto w-full max-w-[1440px] py-4">
      <StepBar label="Task" code={task.id} eyebrow={task.title} title={task.obj} watch={headingRef} done={st === "submitted"} />
      <FloatingChecklist task={task} focus={focus} onFocus={onFocus} watch={stepsRef} />

      {/* One task sheet, as the redesign draws it: the heading, a strip of facts, the objective row,
          then the steps as a table, all cells of one object divided by 1px rules. */}
      <article className="rounded-md border border-[#DDE1E8] bg-white">
        <header ref={headingRef} className="flex items-center gap-3 border-b border-[#DDE1E8] px-4 py-3.5">
          <span className="shrink-0 rounded bg-[#111827] px-2 py-[5px] font-mono text-[13px] font-semibold leading-none text-white">{task.id}</span>
          <h1 className="min-w-0 text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-[#111827] text-balance max-md:text-[19px]">{task.title}</h1>
          {task.hc && (
            <span className="ml-auto shrink-0 rounded-[3px] bg-[#111827] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white" title={`Assessor checkpoint ${task.hc}`}>
              {task.hc}
            </span>
          )}
        </header>

        {/* The facts strip: five cells, the due date first and tinted when it presses. */}
        <dl className="grid grid-cols-2 border-b border-[#DDE1E8] md:grid-cols-5">
          <Fact label="Due" tone={st === "submitted" ? "done" : locked ? "plain" : due.level === "later" ? "plain" : "due"}>
            {st === "submitted" ? "Submitted" : locked ? `Opens ${fmtDay(dueDate(start, (task.week - 1) * 7))}` : `${due.text.replace(/^Due /, "").replace(/^./, (c) => c.toUpperCase())} · ${fmtDay(dueDate(start, task.dueDay))}`}
          </Fact>
          <Fact label="Organisation">{task.orglbl}</Fact>
          <Fact label="Assigned by">{task.owner}</Fact>
          <Fact label="Time">{task.hrs} h</Fact>
          <Fact label="Progress" last>
            <span className="mt-0.5 flex items-center gap-2">
              <span className="font-semibold tabular-nums">{doneCount}/{task.steps.length}</span>
              <span className="h-1 flex-1 bg-[#E3E6EC]">
                <span className="block h-1 bg-[#16A34A] transition-[width] duration-500 ease-out" style={{ width: `${(doneCount / task.steps.length) * 100}%` }} />
              </span>
            </span>
          </Fact>
        </dl>

        <section aria-labelledby="objective-h" className="flex items-stretch border-b border-[#DDE1E8] max-sm:flex-col">
          <h2
            id="objective-h"
            className="flex w-[120px] shrink-0 items-center gap-2 border-r border-[#DDE1E8] bg-[#F3F4FF] px-4 py-3 text-[13px] font-semibold text-[#4338CA] max-sm:w-auto max-sm:border-b max-sm:border-r-0 max-sm:py-2"
          >
            <Icon name="bullseye" size={15} /> Objective
          </h2>
          <p className="m-0 px-4 py-3 text-[14px] leading-[1.5] text-[#111827] text-pretty">
            <Objective text={task.obj} />
          </p>
        </section>

        <section ref={stepsRef} aria-label="Steps" className="@container">
          <HowTo task={task} focus={focus} onFocus={onFocus} locked={locked} />
        </section>

        <Submit task={task} locked={locked} />
      </article>
    </div>
  );
}

/** One cell of the facts strip: a small caps label over its value. */
function Fact({ label, children, tone = "plain", last }: { label: string; children: React.ReactNode; tone?: "plain" | "due" | "done"; last?: boolean }) {
  const t = tone === "due" ? "bg-[#FFFBF2] text-[#92400E]" : tone === "done" ? "bg-[#F0FDF4] text-[#14532D]" : "text-[#111827]";
  return (
    <div className={`min-w-0 border-[#DDE1E8] px-4 py-2.5 max-md:border-b max-md:odd:border-r ${last ? "" : "md:border-r"} ${t}`}>
      <dt className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${tone === "plain" ? "text-[#5B6474]" : ""}`}>{label}</dt>
      <dd className={`m-0 mt-0.5 text-[14px] ${tone === "plain" ? "" : "font-semibold"}`}>{children}</dd>
    </div>
  );
}

/** The objective with its record codes, "(R15)", set as small chips rather than bracketed text. */
function Objective({ text }: { text: string }) {
  return text.split(/\s*\((R\d+)\)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="ml-1 inline-block translate-y-[-1px] rounded-[3px] border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-px align-middle font-mono text-[11px] font-semibold text-[#3730A3]">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

type Urgency = "done" | "late" | "today" | "soon" | "later";
function dueText(start: Date, dueDay: number, submitted: boolean): { text: string; level: Urgency; title: string } {
  const title = `Due ${fmtDay(dueDate(start, dueDay))}`;
  if (submitted) return { text: "Submitted", level: "done", title };
  const left = dueDay - dayIndex(start);
  if (left < 0) return { text: `Overdue by ${-left} day${left === -1 ? "" : "s"}`, level: "late", title };
  if (left === 0) return { text: "Due today", level: "today", title };
  if (left === 1) return { text: "Due tomorrow", level: "soon", title };
  return { text: `Due ${fmtDay(dueDate(start, dueDay))}`, level: "later", title };
}

/**
 * The key results as the task's checklist, in the desk's rule strip: double sky rules top and
 * bottom, no fill, no tick circles, no progress bar. A key result is met or open and the word says
 * which; it is met once every activity it names is complete. The row the open step serves carries
 * a steel rule in its margin, as the old checklist marked the row the focused field served.
 */
function KrChecklist({ task, focus, onFocus, onClose }: { task: Task; focus: number; onFocus: (n: number) => void; onClose: () => void }) {
  // Rows the learner opened to read, besides the one the open step serves. Several may be open.
  const [peek, setPeek] = useState<Set<string>>(() => new Set());
  const togglePeek = (tag: string) => setPeek((p) => { const n = new Set(p); if (n.has(tag)) n.delete(tag); else n.add(tag); return n; });
  const { progress } = useDesk();
  const isDone = (n: number) => !!progress.done[stepKey(task.id, n)];
  const rows = task.krs.map((kr) => {
    const acts = krActivities(kr);
    return { ...splitKr(kr), acts, met: acts.length > 0 && acts.every(isDone) };
  });
  const met = rows.filter((r) => r.met).length;
  return (
    <div className="max-h-[calc(100dvh/var(--app-zoom)-var(--hdr-h,64px)-140px)] overflow-y-auto border-x border-x-slate-200 border-y-4 border-y-sky-700 bg-white/95 px-4 py-3 shadow-[0_16px_44px_-14px_rgba(15,23,42,0.28)] backdrop-blur-xl [border-bottom-style:double] [border-top-style:double]">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-slate-500">
          {rows.length} key results · {met} met
          {met === rows.length && <span className="text-emerald-600"> · all hold</span>}
          <span className="text-slate-400"> · live</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide key results"
          className="focus-ring -mr-1 ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-900/5 hover:text-slate-700"
        >
          <Icon name="x" size={13} />
        </button>
      </div>
      {/* The key result the open step serves is drawn in full and carries the steel rule: that is
          where you are. Any other can be opened to read (several at once) without moving you;
          a met one folds to a struck line, so what is left reads as the to-do list. */}
      <ol className="m-0 mt-1 list-none p-0">
        {rows.map((r) => {
          const here = r.acts.includes(focus);
          const full = here || peek.has(r.tag);
          return (
            <li
              key={r.tag}
              className={`-mx-2 border-b border-dashed border-slate-200 px-2 last:border-b-0 ${here ? "shadow-[inset_2px_0_0_#0369a1]" : ""}`}
            >
              <button
                type="button"
                onClick={() => !here && togglePeek(r.tag)}
                aria-expanded={full}
                disabled={here}
                title={full ? undefined : r.text}
                className={`grid w-full grid-cols-[34px_minmax(0,1fr)_32px_14px] items-baseline gap-2 text-left focus-ring ${full ? "pt-2" : "py-1.5"} ${here ? "cursor-default" : "rounded hover:bg-slate-50"}`}
              >
                <span className={`font-mono text-[10.5px] tabular-nums ${here ? "font-semibold text-sky-700" : r.met ? "text-emerald-600" : "text-slate-400"}`}>{r.tag.replace(" KR", "")}</span>
                <span
                  className={`tracking-tight ${full ? "text-[13px] leading-snug" : "truncate text-[12.5px]"} ${
                    here ? "text-slate-900" : r.met ? "text-slate-400 line-through decoration-slate-300" : full ? "text-slate-800" : "text-slate-600"
                  }`}
                >
                  {r.text}
                </span>
                <i className={`text-right font-mono text-[10px] not-italic ${r.met ? "text-emerald-600" : "text-slate-400"}`}>{r.met ? "met" : "open"}</i>
                {here ? <span /> : <Icon name="chevronDown" size={12} className={`self-center text-slate-400 transition-transform duration-200 ${full ? "rotate-180" : ""}`} />}
              </button>
              {full && r.acts.length > 0 && (
                <span className="flex flex-wrap gap-1 pb-2 pl-[42px] pt-1">
                  {r.acts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => onFocus(a)}
                      aria-label={`Open activity ${a}`}
                      className={`h-[17px] min-w-[17px] rounded-[4px] px-1 font-mono text-[10px] tabular-nums ${press} ${
                        isDone(a) ? "bg-emerald-50 text-emerald-700" : a === focus ? "bg-sky-100 text-sky-800 ring-1 ring-sky-300" : "bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * The checklist floats over the work and takes no space: a zero-height sticky row at the top of the
 * task column, so it rides the column's right edge (not the window's) and follows a folded tree.
 * It surfaces once the steps reach the top, so the heading and objective are never covered.
 * × leaves a small handle in its place. On a narrow column it starts as the handle, since a 300px
 * box would cover most of the work.
 */
function FloatingChecklist({ task, focus, onFocus, watch }: { task: Task; focus: number; onFocus: (n: number) => void; watch: React.RefObject<HTMLElement | null> }) {
  // null = automatic: open on a wide column, handle on a narrow one (decided in CSS, no measuring).
  const [open, setOpen] = useState<boolean | null>(null);
  const [atSteps, setAtSteps] = useState(false);

  useEffect(() => {
    const el = watch.current;
    const main = el?.closest("main");
    if (!el || !main || typeof IntersectionObserver === "undefined") return;
    // The steps are "at work" once their top passes just under the step bar (52px) and while the
    // list still overlaps that band.
    const band = Math.round(main.getBoundingClientRect().top) + 52;
    const io = new IntersectionObserver(([e]) => setAtSteps(e.isIntersecting), { rootMargin: `-${band}px 0px -85% 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [watch, task.id]);

  // Hidden means gone: invisible and click-through. (A child marked pointer-events-auto would still
  // take clicks under an invisible parent, which is how this box once swallowed step 1's chevron.)
  const fade = (on: boolean) => (on ? "visible pointer-events-auto translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0");
  const boxOn = open === true ? "block" : open === false ? "hidden" : "hidden @[760px]:block";
  const handleOn = open === false ? "inline-flex" : open === true ? "hidden" : "inline-flex @[760px]:hidden";
  return (
    <div className="pointer-events-none sticky top-[64px] z-20 flex h-0 justify-end pr-[52px]">
      <div className={`w-[300px] max-w-full transition-all duration-200 ease-out motion-reduce:transition-none ${boxOn} ${fade(atSteps)}`} aria-hidden={!atSteps}>
        <div>
          <KrChecklist task={task} focus={focus} onFocus={onFocus} onClose={() => setOpen(false)} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        tabIndex={atSteps ? 0 : -1}
        // The handle in the strip's own language: square, steel, mono.
        className={`focus-ring h-9 items-center gap-1.5 bg-white/95 pl-2.5 pr-3.5 font-mono text-[10.5px] uppercase tracking-[0.09em] text-sky-800 shadow-[0_12px_40px_-14px_rgba(15,23,42,0.3)] ring-1 ring-slate-200 backdrop-blur-xl transition-all duration-200 ease-out hover:bg-white motion-reduce:transition-none ${handleOn} ${fade(atSteps)}`}
      >
        <Icon name="checkSquare" size={14} className="text-sky-700" /> Key results
      </button>
    </div>
  );
}

/** Submitting seals the task. It opens once every activity is complete. */
function Submit({ task, locked }: { task: Task; locked: boolean }) {
  const { progress, update } = useDesk();
  const submitted = progress.submitted[task.id];
  const left = task.steps.filter((s) => !progress.done[stepKey(task.id, s.n)]).length;
  return (
    <footer aria-label="Submit" className="flex flex-wrap items-stretch justify-between gap-4 rounded-b-md bg-[#F7F8FA] pl-4">
      <div className="grid gap-1.5 py-3">
        <p className="text-[13.5px] font-semibold text-[#111827]">
          {submitted
            ? `Submitted ${new Date(submitted).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
            : left
              ? `${left} ${left === 1 ? "activity" : "activities"} left before you can submit`
              : "Every activity is complete. Submitting seals the task."}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {task.subs.map((x) => (
            <span key={x.code} className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#DDE1E8] bg-white px-2 py-0.5 text-[12px] text-[#3F4757]">
              <span className="font-mono text-[11px] font-semibold text-[#111827]">{x.code}</span>
              {x.name}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-[#5B6474]">{task.rev}</p>
      </div>
      {!submitted && (
        <button
          type="button"
          disabled={locked || left > 0}
          onClick={() => update((p) => ({ ...p, submitted: { ...p.submitted, [task.id]: new Date().toISOString() } }))}
          className="min-h-12 rounded-br-md border-l border-[#DDE1E8] bg-[#4338CA] px-5 text-[14px] font-semibold text-white hover:brightness-90 focus-ring disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] disabled:hover:brightness-100"
        >
          Submit task
        </button>
      )}
    </footer>
  );
}
