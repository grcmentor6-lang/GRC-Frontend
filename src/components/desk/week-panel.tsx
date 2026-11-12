"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { OrgLogo, logoFor } from "@/components/app/org-logo";
import { OrgMarks } from "@/lib/desk/org-tone";
import { useDesk } from "./desk-context";
import { KcPanelItem, openKc } from "./knowledge-check";
import { checkOf } from "@/lib/desk/kc";
import { currentWeek, dayIndex, dueDate, fmtDay, type Desk, type Task } from "@/lib/desk/model";
import { stepKey, taskStatus, type Progress } from "@/lib/desk/progress";

/*
 * The desk's grid language (GRC 101 Working Desk — Redesign): square cells divided by 1px
 * hairlines (#DDE1E8), section bands on #F7F8FA, muted text #5B6474, indigo #4338CA for "here".
 * Regions are separated by rules, not by gaps.
 */

const doneSteps = (p: Progress, t: Task) => t.steps.filter((s) => p.done[stepKey(t.id, s.n)]).length;
const weekTasks = (desk: Desk, n: number) => desk.order.map((id) => desk.tasks[id]).filter((t) => t.week === n);

/** A small progress ring; full and green once the task is submitted. */
export function Ring({ value, done, size = 18, stroke = 3.5 }: { value: number; done?: boolean; size?: number; stroke?: number }) {
  const r = 14 - stroke / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 28 28" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="14" cy="14" r={r} fill="none" strokeWidth={stroke} className="stroke-[#E3E6EC]" />
        <circle
          cx="14" cy="14" r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          className={`transition-[stroke-dashoffset] duration-500 ease-out ${done ? "stroke-[#16A34A]" : "stroke-[#4338CA]"}`}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (done ? 1 : value))}
        />
      </svg>
      {done && <Icon name="check" size={Math.round(size * 0.55)} strokeWidth={3.5} className="relative text-[#16A34A]" />}
    </span>
  );
}

type Urgency = "done" | "late" | "today" | "soon" | "later";
/** "Due tomorrow" beats "Due Wed 7 Oct" for deciding what to do first; the date stays in the tooltip. */
function due(start: Date, dueDay: number, submitted: boolean): { text: string; level: Urgency; title: string } {
  const title = `Due ${fmtDay(dueDate(start, dueDay))}`;
  if (submitted) return { text: "Submitted", level: "done", title };
  const left = dueDay - dayIndex(start);
  if (left < 0) return { text: `Overdue by ${-left} day${left === -1 ? "" : "s"}`, level: "late", title };
  if (left === 0) return { text: "Due today", level: "today", title };
  if (left === 1) return { text: "Due tomorrow", level: "soon", title };
  return { text: `Due in ${left} days`, level: "later", title };
}
const ON_LIGHT: Record<Urgency, string> = {
  done: "text-[#15803D]",
  late: "font-semibold text-[#B91C1C]",
  today: "font-semibold text-[#B45309]",
  soon: "text-[#B45309]",
  later: "text-[#5B6474]",
};

/**
 * The header timeline: twelve cells in a strip, each a label over its own progress bar. The week on
 * screen is the white cell with an indigo underline; today's week carries a dot; locked weeks a lock.
 * Exam weeks (amber diamond) and checkpoint weeks (dark dot) are marked in the cell.
 */
export function WeekTimeline({ week, onWeek, fit }: { week: number; onWeek: (n: number) => void; /** All twelve weeks in the width there is, none scrolled off: the desk beside a docked test. */ fit?: boolean }) {
  const { desk, progress, isOpen, start } = useDesk();
  const today = currentWeek(start);
  // On a screen too narrow for twelve cells the strip scrolls; keep the week on screen in view.
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = nav.current;
    const cell = el?.querySelector<HTMLElement>("[aria-selected=true]");
    if (el && cell && el.scrollWidth > el.clientWidth) el.scrollTo({ left: cell.offsetLeft - (el.clientWidth - cell.offsetWidth) / 2 });
  }, [week]);
  return (
    <nav ref={nav} role="tablist" aria-label="Weeks" className="@container flex h-full min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
      {desk.weeks.map((w) => {
        const ts = weekTasks(desk, w.n);
        const total = ts.reduce((n, t) => n + t.steps.length, 0);
        const got = ts.reduce((n, t) => n + doneSteps(progress, t), 0);
        const allIn = ts.every((t) => progress.submitted[t.id]);
        const open = isOpen(w.n);
        const here = w.n === week;
        const hc = w.hc?.split(" ")[0];
        const notes = [w.gate, hc && `checkpoint ${hc}`].filter(Boolean).join(", ");
        // The organisations this week's tasks are for ("AB" is both), in A, B order.
        const orgs = (["A", "B"] as const).filter((k) => ts.some((t) => t.org.includes(k)));
        return (
          <button
            key={w.n}
            type="button"
            role="tab"
            aria-selected={here}
            onClick={() => onWeek(w.n)}
            title={`Week ${w.n}, ${w.ph}: ${w.th}. ${orgs.map((k) => desk.orgs[k].name).join(" and ")}${notes ? `. ${notes}` : ""}. ${open ? `${got} of ${total} steps done` : `Opens ${fmtDay(dueDate(start, (w.n - 1) * 7))}`}`}
            className={`relative flex ${fit ? "min-w-0 flex-[1_1_0] overflow-hidden last:border-r-0" : "min-w-[108px] flex-[1_0_108px]"} flex-col justify-center gap-1.5 border-r border-[#DDE1E8] px-2.5 text-left focus-ring ${
              here ? "bg-white" : "bg-[#F7F8FA] hover:bg-[#F3F4F7]"
            }`}
          >
            <span className="flex w-full items-center gap-1 leading-none">
              <span className={`font-mono text-[12px] font-semibold ${here ? "text-[#111827]" : "text-[#6B7280]"}`}>W{w.n}</span>
              {w.n === today && <span className="h-1.5 w-1.5 rounded-full bg-[#4338CA]" aria-label="this week" />}
              {/* Who this week's work is for: the organisations' badges, overlapped when both. */}
              <span className={`ml-1 flex shrink-0 items-center gap-0.5 ${fit ? "@max-[1080px]:hidden" : ""} ${open ? "" : "opacity-60 grayscale"}`} aria-label={`for ${orgs.map((k) => desk.orgs[k].short).join(" and ")}`}>
                {orgs.map((k) => (
                  <span key={k} title={desk.orgs[k].name}>
                    <OrgLogo org={logoFor(desk.orgs[k].name)} orgKey={k} className="h-4 w-4 text-[6.5px]" iconSize={11} />
                  </span>
                ))}
              </span>
              <span className="flex-1" />
              {w.gate && <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#D97706]" aria-label="exam week" />}
              {hc && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#111827]" aria-label="checkpoint week" />}
              {!open && <Icon name="lock" size={10} className="text-[#8A91A3]" />}
            </span>
            <span className={`block h-[3px] w-full ${open ? "bg-[#E3E6EC]" : "bg-transparent"}`}>
              {open && (
                <span
                  className={`block h-[3px] transition-[width] duration-500 ease-out ${allIn ? "bg-[#16A34A]" : "bg-[#4338CA]"}`}
                  style={{ width: `${allIn ? 100 : total ? (got / total) * 100 : 0}%` }}
                />
              )}
            </span>
            {here && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#4338CA]" aria-hidden />}
          </button>
        );
      })}
    </nav>
  );
}

/*
 * The left column, after the owner's sidebar design (docs/redesign-guide/sidebar.html): white, airy,
 * sections named by small uppercase labels rather than bands; the week overview a soft indigo card;
 * tasks as rows split by faint rules; the programme's tally at the foot.
 */
// font-sans: the design sets these labels in the sans, not the register voice's mono (globals.css).
const label = "font-sans text-[11px] font-semibold uppercase tracking-[0.09em] text-[#6B7280]";
const Dot = () => <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#C4C8D0]" aria-hidden />;

/** The left column: the week and its tasks first, then the long view. */
export function WeekPanel({ week, taskId, overview, onOverview, onCollapse }: { week: number; taskId: string | null; overview: boolean; onOverview: () => void; onCollapse: () => void }) {
  const { desk, progress, start, openTask, isOpen, taskLock } = useDesk();
  const all = desk.order.map((id) => desk.tasks[id]);
  const w = desk.weeks[week - 1];
  const tasks = weekTasks(desk, week);

  const steps = all.reduce((n, t) => n + t.steps.length, 0);
  const stepsDone = all.reduce((n, t) => n + doneSteps(progress, t), 0);
  const submitted = all.filter((t) => progress.submitted[t.id]).length;
  const weeksDone = desk.weeks.filter((x) => weekTasks(desk, x.n).every((t) => progress.submitted[t.id])).length;
  const pct = steps ? Math.round((stepsDone / steps) * 100) : 0;
  const hc = w.hc?.split(" ")[0];

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between pb-2.5 pl-5 pr-2.5 pt-3">
        <h2 className={`${label} text-[12px] text-[#111827]`}>Week {week}</h2>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Hide the week panel"
          title="Hide the week panel"
          className="grid h-[30px] w-[30px] place-items-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#4B5563] focus-ring"
        >
          <Icon name="chevronLeft" size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-3 pb-1.5">
          <button
            type="button"
            onClick={onOverview}
            aria-current={overview ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-[10px] p-3 text-left transition-colors focus-ring ${
              overview ? "bg-[#F1F2FF]" : "hover:bg-[#F7F7FB]"
            }`}
          >
            <span className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg ${overview ? "bg-[#4338CA] text-white" : "bg-[#EEF0FF] text-[#4338CA]"}`}>
              <Icon name="layers" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold tracking-[-0.005em] text-[#111827]">Week {week} overview</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-[#6B7280]" title={w.th}>{w.th.replace(/^Foundation \w+: /, "")}</span>
            </span>
            <Icon name="chevronRight" size={16} className="shrink-0 text-[#9CA3AF]" />
          </button>
        </div>

        <h3 className={`${label} px-5 pb-1 pt-5`}>Tasks</h3>
        <ul className="divide-y divide-[#F0F1F4]">
          {tasks.map((t) => {
            const here = t.id === taskId;
            const st = taskStatus(progress, t);
            const n = doneSteps(progress, t);
            const d = isOpen(t.week) ? due(start, t.dueDay, st === "submitted") : null;
            const gate = taskLock(t.id);
            return (
              <li key={t.id} data-task-gate={gate ?? undefined} title={gate ? `Opens once you submit ${gate}` : undefined}>
                <button
                  type="button"
                  onClick={() => {
                    openTask(t.id);
                    onCollapse();
                  }}
                  aria-current={here ? "page" : undefined}
                  className={`grid w-full grid-cols-[20px_1fr] gap-3 px-5 py-3.5 text-left transition-colors focus-ring ${
                    here ? "bg-[#F1F2FF] shadow-[inset_3px_0_0_#4338CA]" : "hover:bg-[#FAFAFB]"
                  }`}
                >
                  <span className="pt-px"><Ring value={n / t.steps.length} done={st === "submitted"} size={18} stroke={3} /></span>
                  <span className="min-w-0">
                    <span className="mb-0.5 flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.02em] text-[#4338CA]">
                      {t.id}
                      {gate && <Icon name="lock" size={11} strokeWidth={2.5} className="text-[#8A91A3]" aria-label="not open yet" />}
                      <OrgMarks org={t.org} orgs={desk.orgs} />
                    </span>
                    <span className="block text-balance text-[14.5px] font-semibold leading-[1.35] tracking-[-0.005em] text-[#111827]">{t.title}</span>
                    <span className="mt-[7px] flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] tabular-nums text-[#6B7280]">
                      {d ? (
                        <span className={ON_LIGHT[d.level]} title={d.title}>{d.text}</span>
                      ) : (
                        <span className="text-[#8A91A3]">Opens {fmtDay(dueDate(start, (t.week - 1) * 7))}</span>
                      )}
                      <Dot />
                      <span>{n} of {t.steps.length} steps</span>
                      {t.hc && <span className="ml-0.5 rounded bg-[#1F2937] px-1.5 py-[3px] text-[10.5px] font-bold leading-none tracking-[0.04em] text-white">{t.hc}</span>}
                      {t.li.length > 0 && <span title={`Includes Lead Implementer extension ${t.li.join(", ")}`} className="rounded border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-0.5 text-[10.5px] font-bold leading-none tracking-[0.04em] text-[#3730A3]">LI</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {(w.kc || hc) && (
          <>
            <h3 className={`${label} px-5 pb-1 pt-5`}>Before the week closes</h3>
            <ul className="pb-3.5 text-[14px] text-[#6B7280]">
              {/* The week's test: one line, the exam's name in an exam week (it was listed twice, as "Knowledge check FGE" and
                  as the exam). It opens the check as the desk's screen (#KC-01); before the week's tasks are submitted the
                  screen says which ones it waits for. */}
              {w.kc && (
                <li data-test={w.kc.split(" ")[0]}>
                  <KcPanelItem week={w} onOpen={onCollapse} />
                </li>
              )}
              {hc && (
                <li className="flex items-center gap-3 px-5 py-2.5 text-[#111827]">
                  <span className="grid w-[18px] shrink-0 place-items-center"><span className="h-2 w-2 rounded-full bg-[#111827]" /></span>
                  Assessor checkpoint {w.hc}
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      <section aria-labelledby="programme" className="shrink-0 border-t border-[#E8EAEF] bg-[#FAFAFB] px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <h2 id="programme" className="text-[13.5px] font-semibold text-[#111827]">Your programme</h2>
          <span className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-[#111827]">{pct}%</span>
        </div>
        <div className="my-2.5 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div className="h-full min-w-2 rounded-full bg-[#4338CA] transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <p className="flex justify-between text-[12px] tabular-nums text-[#6B7280]">
          <span><b className="font-semibold text-[#111827]">{stepsDone}</b>/{steps} steps</span>
          <span><b className="font-semibold text-[#111827]">{submitted}</b>/{all.length} tasks</span>
          <span><b className="font-semibold text-[#111827]">{weeksDone}</b>/{desk.weeks.length} weeks</span>
        </p>
      </section>
    </div>
  );
}

/**
 * The panel folded: a slim rail that still says where you are. The week overview and each task's
 * progress ring stay one click away; the top cell unfolds the panel.
 */
export function WeekRail({ week, taskId, overview, onOverview, onExpand }: { week: number; taskId: string | null; overview: boolean; onOverview: () => void; onExpand: () => void }) {
  const { desk, progress, openTask, taskLock } = useDesk();
  const tasks = weekTasks(desk, week);
  const w = desk.weeks[week - 1];
  const kc = w ? checkOf(w) : null;
  const cell = "grid w-full place-items-center border-b border-[#DDE1E8] focus-ring";
  return (
    <div className="flex flex-col">
      <button type="button" onClick={onExpand} aria-label="Show the week panel" title="Show the week panel" className={`${cell} h-11 bg-[#F7F8FA] text-[#5B6474] hover:bg-[#F3F4F7]`}>
        <Icon name="chevronRight" size={16} />
      </button>
      <button
        type="button"
        onClick={onOverview}
        aria-label={`Week ${week} overview`}
        title={`Week ${week} overview`}
        className={`${cell} h-12 ${overview ? "bg-[#F3F4FF] text-[#4338CA] shadow-[inset_3px_0_0_#4338CA]" : "text-[#3F4757] hover:bg-[#F3F4F7]"}`}
      >
        <Icon name="layers" size={16} />
      </button>
      {tasks.map((t) => {
        const here = t.id === taskId;
        const st = taskStatus(progress, t);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => openTask(t.id)}
            aria-label={`${t.id} ${t.title}`}
            title={taskLock(t.id) ? `${t.id} opens once you submit ${taskLock(t.id)}` : `${t.id} ${t.title}`}
            className={`${cell} gap-1 py-2 ${here ? "bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA]" : "hover:bg-[#F3F4F7]"}`}
          >
            {taskLock(t.id) ? <Icon name="lock" size={14} className="text-[#8A91A3]" /> : <Ring value={doneSteps(progress, t) / t.steps.length} done={st === "submitted"} size={18} />}
            <span className={`font-mono text-[9.5px] ${here ? "text-[#4338CA]" : "text-[#5B6474]"}`}>{t.id}</span>
          </button>
        );
      })}
      {/* The week's check, as the open panel lists it under "Before the week closes" (owner, 11 Nov 2026: the folded
          rail showed only the tasks). An exam week's gate keeps its amber diamond. */}
      {kc && (
        <button
          type="button"
          onClick={() => openKc(kc)}
          aria-label={`${w.gate || "Knowledge check"} ${kc}`}
          title={`${w.gate || "Knowledge check"} ${kc}`}
          className={`${cell} gap-1 py-2 hover:bg-[#F3F4F7]`}
        >
          {w.gate ? <span className="mt-1 h-2.5 w-2.5 rotate-45 bg-[#D97706]" /> : <Icon name="checkSquare" size={17} className="text-[#4338CA]" />}
          <span className="font-mono text-[9.5px] text-[#5B6474]">{kc}</span>
        </button>
      )}
    </div>
  );
}
