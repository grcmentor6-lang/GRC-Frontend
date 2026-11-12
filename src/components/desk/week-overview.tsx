"use client";

import { Fragment, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { KcChip, openKc } from "./knowledge-check";
import { useDesk } from "./desk-context";
import { dueDate, fmtDay } from "@/lib/desk/model";
import { dueText, planOf } from "@/lib/desk-plan";
import { OrgMarks, OrgName } from "@/lib/desk/org-tone";

// Task · what you do · organisation and owner · due · progress; the last three fold under the text on a narrow sheet.
const cols = "grid grid-cols-1 gap-x-4 gap-y-1 @[480px]:grid-cols-[minmax(120px,170px)_1fr] @[640px]:grid-cols-[minmax(130px,190px)_1fr_120px_96px] @[860px]:grid-cols-[minmax(140px,200px)_1fr_200px_120px_96px]";

/** Rule ids ("R01") in a line, drawn as chips; a bracket that only held rules goes with them. */
function WithRules({ text, rules }: { text: string; rules: Record<string, [string, string]> }) {
  const clean = text.replace(/\(([^()]*\bR\d{2}\b[^()]*)\)/g, "$1");
  return clean.split(/\b(R\d{2})\b/).map((part, i) =>
    i % 2 ? (
      <code key={i} title={rules[part]?.[0]} className="ml-0.5 rounded-[3px] border border-[#DDE1E8] bg-[#F7F8FA] px-1 py-px font-mono text-[11px] font-semibold text-[#3F4757]">{part}</code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * The week's objective split per task. Week 1's objective is written "F1.1: … F1.2: … <remark>", so
 * each task gets its own clause and the remark becomes the note; the other weeks' objective is one
 * summary, so each task says its own objective and the summary is the note.
 */
function linesOf(obj: string, ids: string[]): { lines: Record<string, string>; note: string } {
  const parts = obj.split(/\b([A-Z]\d+\.\d+): /);
  if (parts.length < 3 || !ids.every((id) => parts.includes(id))) return { lines: {}, note: obj };
  const lines: Record<string, string> = {};
  let note = "";
  for (let i = 1; i < parts.length; i += 2) {
    let body = parts[i + 1].trim();
    if (i + 2 >= parts.length) {
      // The last clause ends at its first sentence; whatever follows is about the week, not the task.
      const m = body.match(/^(.*?\.)\s+(?=[A-Z])(.*)$/);
      if (m) [, body, note] = m;
    }
    lines[parts[i]] = body.charAt(0).toUpperCase() + body.slice(1);
  }
  return { lines, note };
}

/**
 * The week, before its tasks: what each task asks for, the rules it applies, and the skills the week
 * practises. The tasks themselves open from the left panel.
 */
export function WeekOverview({ week }: { week: number }) {
  const { desk, start, isOpen, progress, openTask, taskLock } = useDesk();
  const w = desk.weeks[week - 1];
  const plan = planOf(desk, progress, start);
  const ids = desk.order.filter((id) => desk.tasks[id].week === week);
  const { lines, note } = linesOf(w.obj, ids);
  // Open at the top, whatever the task view had scrolled to. Runs on mount, after the cross-fade.
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    root.current?.closest("main")?.scrollTo({ top: 0 });
  }, [week]);

  return (
    // Drawn as the task sheet is (task-file.tsx): one white article, a header bar with a dark code chip and a 22px
    // title, a strip of facts, then rows divided by 1px rules, in the desk's 14px text (owner, 11 Nov 2026: the
    // design's own sizes and its centred column did not sit with the rest of the desk).
    <article ref={root} className="desk-rise w-full border-b border-[#DDE1E8] bg-white pb-24">
      <header className="flex items-center gap-3 border-b border-[#DDE1E8] px-4 py-3.5">
        <span className="shrink-0 rounded bg-[#111827] px-2 py-[5px] font-mono text-[13px] font-semibold leading-none text-white">W{week}</span>
        <h1 className="min-w-0 text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-[#111827] text-balance max-md:text-[19px]">
          {w.th.replace(/^Foundation \w+: /, "")}
        </h1>
      </header>
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-[#DDE1E8] px-4 py-2.5 text-[13px] text-[#3F4757]">
        <div className="flex gap-1.5"><dt className="text-[#5B6474]">Week</dt><dd className="font-semibold text-[#111827]">{week} of {desk.weeks.length}</dd></div>
        <div className="flex gap-1.5"><dt className="text-[#5B6474]">Phase</dt><dd className="font-semibold text-[#111827]">{w.ph}</dd></div>
        <div className="flex gap-1.5"><dt className="text-[#5B6474]">{isOpen(week) ? "Opened" : "Opens"}</dt><dd className="font-semibold text-[#111827]">{fmtDay(dueDate(start, (week - 1) * 7))}</dd></div>
      </dl>
      {/* The week's tasks as the step list draws its steps: a table whose rows open the task. The width the old
          one-column list left empty carries what a learner plans by: where, for whom, by when, how far. */}
      <div className="@container">
        <div className={`${cols} border-b border-[#DDE1E8] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]`}>
          <span className="py-2 pl-4">Task</span>
          <span className="hidden py-2 @[480px]:block">What you do</span>
          <span className="hidden py-2 @[860px]:block">Organisation · owner</span>
          <span className="hidden py-2 @[640px]:block">Due</span>
          <span className="hidden py-2 pr-4 @[640px]:block">Progress</span>
        </div>
        <ol>
          {ids.map((id) => {
            const t = desk.tasks[id];
            const p = plan.find((x) => x.id === id)!;
            const late = p.state === "overdue";
            return (
              <li key={id} className="border-b border-[#E9ECF1]">
                <button type="button" onClick={() => openTask(id)} className={`${cols} w-full items-start py-3 text-left hover:bg-[#FAFAFC] focus-ring`}>
                  <span className="pl-4">
                    <span className="flex items-center gap-1.5 font-mono text-[13px] font-semibold text-[#3730A3]">
                      {id}
                      {taskLock(id) && <span title={`Opens once you submit ${taskLock(id)}`} className="text-[#8A91A3]"><Icon name="lock" size={12} strokeWidth={2.5} aria-label="not open yet" /></span>}
                      {/* Narrow: the organisation column is folded away, so its marks ride beside the code. */}
                      <span className="@[860px]:hidden"><OrgMarks org={t.org} orgs={desk.orgs} /></span>
                    </span>
                    <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-[#111827]">{t.title}</span>
                  </span>
                  <span className="pl-4 pr-4 text-[14px] leading-[1.55] text-[#111827] @[480px]:pl-0 @[640px]:pr-0">
                    <WithRules text={lines[id] ?? t.obj} rules={desk.rules} />
                    {/* Narrow: the folded columns ride along under the text. */}
                    <span className="mt-1 flex flex-wrap gap-x-3 text-[12px] text-[#5B6474] @[640px]:hidden">
                      <span className={late ? "font-semibold text-[#B91C1C]" : ""}>{dueText(p)}</span>
                      <span>{p.stepsDone} of {p.steps} steps</span>
                    </span>
                  </span>
                  <span className="hidden text-[13px] leading-snug text-[#3F4757] @[860px]:block">
                    <span className="block"><OrgName org={t.org} orgs={desk.orgs} /></span>
                    <span className="block text-[12px] text-[#5B6474]">{t.owner} · <span className="whitespace-nowrap">{t.hrs} h</span></span>
                  </span>
                  <span className="hidden text-[13px] leading-snug @[640px]:block">
                    <span className="block font-semibold text-[#111827]">{fmtDay(p.due)}</span>
                    <span className={`block text-[12px] ${late ? "font-semibold text-[#B91C1C]" : p.state === "submitted" ? "text-[#15803D]" : "text-[#5B6474]"}`}>{dueText(p)}</span>
                  </span>
                  <span className="hidden pr-4 @[640px]:block">
                    <span className="block text-[13px] font-semibold tabular-nums text-[#111827]">{p.stepsDone}/{p.steps}</span>
                    <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-[#E9ECF1]">
                      <span className={`block h-full rounded-full ${p.state === "submitted" ? "bg-[#16A34A]" : "bg-[#4338CA]"}`} style={{ width: `${(100 * p.stepsDone) / Math.max(1, p.steps)}%` }} />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid gap-x-8 gap-y-3 px-4 pt-4 md:grid-cols-2">
        {/* Before the week closes: the week's test and checkpoint, as the left panel lists them. */}
        {(w.kc || w.hc) && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Before the week closes</h2>
            <ul className="mt-1.5 grid gap-1 text-[13px] text-[#3F4757]">
              {w.kc && (
                <li className="flex flex-wrap items-center gap-2">
                  <button type="button" data-test-open={w.kc.split(" ")[0]} onClick={() => openKc(w.kc!.split(" ")[0])} className="font-semibold text-[#3730A3] underline-offset-2 hover:underline focus-ring">
                    {w.gate || "Knowledge check"} {w.kc.split(" ")[0]}
                  </button>
                  <KcChip id={w.kc.split(" ")[0]} />
                </li>
              )}
              {w.hc && <li>Assessor checkpoint {w.hc}</li>}
            </ul>
          </section>
        )}
        {w.resp.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Skills this week</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {w.resp.map(([, r]) => (
                <span key={r} className="rounded-[3px] border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-0.5 text-[12px] font-semibold text-[#3730A3]">{r}</span>
              ))}
            </div>
          </section>
        )}
        {note && <p className="text-[13px] italic leading-[1.5] text-[#5B6474] md:col-span-2"><WithRules text={note} rules={desk.rules} /></p>}
      </div>
    </article>
  );
}
