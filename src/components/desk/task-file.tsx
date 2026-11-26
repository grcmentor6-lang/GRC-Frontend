"use client";

import { useEffect, useRef, useState } from "react";
import { StepBar } from "@/components/app/step-bar";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { HowTo } from "./how-to";
import { press } from "./ui";
import { dayIndex, dueDate, fmtDay, krActivities, splitKr, type Task } from "@/lib/desk/model";
import { stepKey, taskStatus } from "@/lib/desk/progress";
import { badgeOfTask, standing as badgeStanding } from "@/lib/desk/badges";
import { lockedWhy } from "@/lib/desk/work";
import { labWhy } from "@/lib/desk/labs";
import { OrgName } from "@/lib/desk/org-tone";
import { MethodMedal } from "@/components/badges/method-medal";
import Link from "next/link";

/** Where an outside link asks the task file to land. The file itself has no tabs any more. */
export type Tab = "task" | "how" | "refs" | "deliver" | "msgs";

/**
 * The task file: who, when and what "done" means on top, the objective and key results
 * highlighted, then the steps. Messages and submission follow the steps, because the task is not
 * finished without them.
 */
export function TaskFile({ task, focus, onFocus, tab }: { task: Task; focus: number; onFocus: (n: number) => void; tab: Tab; setTab: (t: Tab) => void }) {
  const { desk, progress, start, isOpen } = useDesk();
  const locked = !isOpen(task.week);
  const isDone = (n: number) => !!progress.done[stepKey(task.id, n)];
  const doneCount = task.steps.filter((s) => isDone(s.n)).length;
  const st = taskStatus(progress, task);
  const due = dueText(start, task.dueDay, st === "submitted");
  const badge = badgeOfTask(task.id);
  const badgeState = badge ? badgeStanding(badge, progress).state : "not-started";
  // Watched by StepBar: while the task's own heading is on screen the condensed bar stays away.
  const headingRef = useRef<HTMLDivElement>(null);
  // The key results box: open by default on a desktop-width sheet once the page has scrolled to the steps (owner,
  // 16 Nov 2026); the bar's button or the box's own × closes it and it then stays closed. null = not yet chosen,
  // which reads as open from `lg` up and closed below, where the box would cover most of a phone.
  const [krOpen, setKrOpen] = useState<boolean | null>(null);
  const [barOn, setBarOn] = useState(false);
  const wide = () => window.matchMedia("(min-width: 64rem)").matches;

  useEffect(() => {
    document.getElementById(`act-${focus}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focus, tab]);

  return (
    // Full bleed: the task fills the work area edge to edge, no card around it, so a wider screen
    // gives the table more room instead of more margin. 10px top = StepBar's -24px top and -28px
    // bottom margins over its 42px, so the sheet starts flush with the column.
    <div className="w-full pt-[10px]">
      <StepBar
        label="Task"
        code={task.id}
        eyebrow={task.title}
        title={task.obj}
        watch={headingRef}
        done={st === "submitted"}
        onShow={setBarOn}
        // The key results open from the bar, at every width: a box or handle floating over the steps covered the very
        // step being read (a handle on a narrow sheet; the box itself on a wide one, over T6.1 step 6's situation).
        action={
          <button
            type="button"
            data-kr-toggle
            onClick={() => setKrOpen(!(krOpen ?? wide()))}
            aria-label="Key results"
            aria-expanded={krOpen ?? undefined}
            title="Key results"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] transition-colors focus-ring ${krOpen ? "bg-[#E0F2FE] text-sky-800" : krOpen === null ? "text-sky-700 hover:bg-[#E0F2FE] lg:bg-[#E0F2FE] lg:text-sky-800" : "text-sky-700 hover:bg-[#E0F2FE]"}`}
          >
            <Icon name="checkSquare" size={16} />
          </button>
        }
      />
      <FloatingChecklist task={task} focus={focus} onFocus={onFocus} open={krOpen} shown={barOn} setOpen={setKrOpen} />

      {/* One task sheet, as the redesign draws it: the heading, a strip of facts, the objective row,
          then the steps as a table, all cells of one object divided by 1px rules. */}
      <article className="border-b border-[#DDE1E8] bg-white">
        <header ref={headingRef} className="flex items-center gap-3 border-b border-[#DDE1E8] px-4 py-3.5">
          <span className="shrink-0 rounded bg-[#111827] px-2 py-[5px] font-mono text-[13px] font-semibold leading-none text-white">{task.id}</span>
          <h1 className="min-w-0 text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-[#111827] text-balance max-md:text-[19px]">{task.title}</h1>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            {/* The method badge this task earns towards (pack v1.9.0; F1.1 earns none). */}
            {badge && (
              <Link
                href={`/app/badges#${badge.code}`}
                title={`This task earns towards the ${badge.name} badge`}
                className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#DDE1E8] bg-white py-0.5 pl-1 pr-2 text-[12px] font-semibold text-[#3F4757] no-underline hover:border-[#C9CED8] focus-ring max-sm:hidden"
              >
                <MethodMedal badge={badge} state={badgeState} size={20} />
                {badge.name}
              </Link>
            )}
            {task.hc && (
              <span className="rounded-[3px] bg-[#111827] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white" title={`Checkpoint ${task.hc}`}>
                {task.hc}
              </span>
            )}
          </span>
        </header>

        {/* The facts strip: five cells, the due date first and tinted when it presses. */}
        <dl className="grid grid-cols-2 border-b border-[#DDE1E8] md:grid-cols-5">
          <Fact label="Due" tone={st === "submitted" ? "done" : locked ? "plain" : due.level === "later" ? "plain" : "due"}>
            {st === "submitted" ? "Submitted" : locked ? `Opens ${fmtDay(dueDate(start, (task.week - 1) * 7))}` : due.level === "later" ? fmtDay(dueDate(start, task.dueDay)) : `${due.text.replace(/^Due /, "").replace(/^./, (c) => c.toUpperCase())} · ${fmtDay(dueDate(start, task.dueDay))}`}
          </Fact>
          <Fact label="Organisation">
            {/* "Org A · Manila": which client slot, and the office, the name does not say. On the name's line, so the
                strip is two rows tall like its other cells (owner, 16 Nov 2026); it drops under the name only where the
                cell is too narrow for both. */}
            <span className="flex flex-wrap items-center gap-x-2">
              <OrgName org={task.org} orgs={desk.orgs} />
              <span className="whitespace-nowrap text-[12px] text-[#5B6474]">
                {[task.orglbl.split("·")[0].trim(), task.orglbl.split(",").slice(1).join(",").trim()].filter(Boolean).join(" · ")}
              </span>
            </span>
          </Fact>
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

        {/* The objective is the one line the whole task answers to, so it is the loudest thing on the sheet after the title
            (owner, 16 Nov 2026): the row is tinted end to end, ruled in indigo on its left, and set a size up in semibold.
            A tint and a rule, not a solid band: the band is the sealed decision's. */}
        <section aria-labelledby="objective-h" className="flex items-stretch border-b border-[#C7CBF5] bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA] max-sm:flex-col">
          <h2
            id="objective-h"
            className="flex w-[120px] shrink-0 items-center gap-2 border-r border-[#C7CBF5] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#4338CA] max-sm:w-auto max-sm:border-r-0 max-sm:pb-0 max-sm:pt-2.5"
          >
            <Icon name="bullseye" size={15} /> Objective
          </h2>
          <p className="m-0 px-4 py-3.5 text-[16px] font-semibold leading-[1.45] tracking-[-0.005em] text-[#1E1B4B] text-pretty max-sm:pt-1.5 max-sm:text-[15px]">
            <Objective text={task.obj} />
          </p>
        </section>

        <section aria-label="Steps" className="@container">
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
  // The space before "(R30)" stays in the text part, so the chip never glues to the word before it.
  return text.split(/\((R\d+)\)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="inline-block translate-y-[-1px] rounded-[3px] border border-[#C7CBF5] bg-white px-1.5 py-px align-middle font-mono text-[11px] font-semibold text-[#3730A3]">
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
                      aria-label={`Open step ${a}`}
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
 * It shows with the step bar, once the task's heading has scrolled away, and closes with ×, Escape or the bar's
 * button. A click elsewhere does not close it: it is open by default, and a box that left on the first click would
 * never be read.
 */
function FloatingChecklist({ task, focus, onFocus, open, shown, setOpen }: {
  task: Task;
  focus: number;
  onFocus: (n: number) => void;
  open: boolean | null;
  shown: boolean;
  setOpen: (v: boolean) => void;
}) {
  useEffect(() => {
    if (open === false || !shown) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, shown, setOpen]);

  return (
    <div className="pointer-events-none sticky top-[64px] z-20 flex h-0 justify-end pr-[52px]">
      {/* It used to wait for the steps to reach the bar as well, so for the first stretch of scroll the bar's button
          showed and did nothing. */}
      <div className={`pointer-events-auto w-[300px] max-w-full ${!shown || open === false ? "hidden" : open ? "block" : "hidden lg:block"}`}>
        <div>
          <KrChecklist task={task} focus={focus} onFocus={onFocus} onClose={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}

/** Submitting seals the task. It opens once every activity is complete. */
function Submit({ task, locked }: { task: Task; locked: boolean }) {
  const { desk, progress, update, start } = useDesk();
  const submitted = progress.submitted[task.id];
  const open = task.steps.filter((s) => !progress.done[stepKey(task.id, s.n)]);
  const left = open.length;
  // A locked button says why, naming the next thing to do (owner, 2 Nov 2026): the first open step, and what it waits on.
  const first = open[0];
  const why = first ? lockedWhy(desk, progress, task, first, start) : null;
  // A Tech Lab of the task is required: with every step done, Submit task still waits for it, and says which one.
  const labMsg = labWhy(task.id, progress);
  return (
    <footer aria-label="Submit" className="flex flex-wrap items-stretch justify-between gap-4 bg-[#F7F8FA] pl-4">
      <div className="grid gap-1.5 py-3">
        <p className="text-[13.5px] font-semibold text-[#111827]">
          {submitted
            ? `Submitted ${new Date(submitted).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
            : left
              ? `${left} ${left === 1 ? "step" : "steps"} left before you can submit`
              : "Every step is complete."}
        </p>
        {!submitted && !locked && !first && labMsg && (
          <p data-guide="submit-task-why" data-lab-left className="inline-flex items-start gap-1.5 text-[12.5px] font-medium text-[#78350F]">
            <Icon name="info" size={14} className="mt-px shrink-0" />
            {labMsg}
          </p>
        )}
        {!submitted && !locked && first && (
          <p data-guide="submit-task-why" className="inline-flex items-start gap-1.5 text-[12.5px] font-medium text-[#78350F]">
            <Icon name="info" size={14} className="mt-px shrink-0" />
            Next: step {first.n}. {why ?? "Mark it complete."}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {task.subs.map((x) => (
            <span key={x.code} className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#DDE1E8] bg-white px-2 py-0.5 text-[12px] text-[#3F4757]">
              <span className="font-mono text-[11px] font-semibold text-[#111827]">{x.code}</span>
              {x.name}
            </span>
          ))}
        </div>
        {/* Not task.rev: the pack's "Automated review within 24 h (assessors sample 10 %)" describes a review the platform does not run. */}
        <p className="text-[12px] text-[#5B6474]">
          {submitted ? "This task is sealed. Your work is on My Submissions, Reports and your CV." : "Submitting seals this task. Your submitted work appears on My Submissions, Reports and your CV."}
        </p>
      </div>
      {!submitted && (
        <button
          type="button"
          disabled={locked || left > 0 || !!labMsg}
          onClick={() => update((p) => ({ ...p, submitted: { ...p.submitted, [task.id]: new Date().toISOString() } }))}
          className="min-h-12 border-l border-[#DDE1E8] bg-[#4338CA] px-5 text-[14px] font-semibold text-white hover:brightness-90 focus-ring disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] disabled:hover:brightness-100"
        >
          Submit task
        </button>
      )}
    </footer>
  );
}
