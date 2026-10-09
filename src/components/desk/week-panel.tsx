"use client";

import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { currentWeek, dayIndex, dueDate, fmtDay, type Desk, type Task } from "@/lib/desk/model";
import { stepKey, taskStatus, type Progress } from "@/lib/desk/progress";

/*
 * The desk's grid language (GRC 101 Working Desk — Redesign): square cells divided by 1px
 * hairlines (#DDE1E8), section bands on #F7F8FA, muted text #5B6474, indigo #4338CA for "here".
 * Regions are separated by rules, not by gaps.
 */

const doneSteps = (p: Progress, t: Task) => t.steps.filter((s) => p.done[stepKey(t.id, s.n)]).length;
const weekTasks = (desk: Desk, n: number) => desk.order.map((id) => desk.tasks[id]).filter((t) => t.week === n);
const band = "border-b border-[#DDE1E8] bg-[#F7F8FA] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]";

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
export function WeekTimeline({ week, onWeek }: { week: number; onWeek: (n: number) => void }) {
  const { desk, progress, isOpen, start } = useDesk();
  const today = currentWeek(start);
  return (
    <nav role="tablist" aria-label="Weeks" className="flex h-full min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
      {desk.weeks.map((w) => {
        const ts = weekTasks(desk, w.n);
        const total = ts.reduce((n, t) => n + t.steps.length, 0);
        const got = ts.reduce((n, t) => n + doneSteps(progress, t), 0);
        const allIn = ts.every((t) => progress.submitted[t.id]);
        const open = isOpen(w.n);
        const here = w.n === week;
        const hc = w.hc?.split(" ")[0];
        const notes = [w.gate, hc && `checkpoint ${hc}`].filter(Boolean).join(", ");
        return (
          <button
            key={w.n}
            type="button"
            role="tab"
            aria-selected={here}
            onClick={() => onWeek(w.n)}
            title={`Week ${w.n}, ${w.ph}: ${w.th}${notes ? `. ${notes}` : ""}. ${open ? `${got} of ${total} steps done` : `Opens ${fmtDay(dueDate(start, (w.n - 1) * 7))}`}`}
            className={`relative flex min-w-[64px] flex-[1_0_64px] flex-col justify-center gap-1.5 border-r border-[#DDE1E8] px-2.5 text-left focus-ring ${
              here ? "bg-white" : "bg-[#F7F8FA] hover:bg-[#F3F4F7]"
            }`}
          >
            <span className="flex w-full items-center gap-1 leading-none">
              <span className={`font-mono text-[12px] font-semibold ${here ? "text-[#111827]" : "text-[#6B7280]"}`}>W{w.n}</span>
              {w.n === today && <span className="h-1.5 w-1.5 rounded-full bg-[#4338CA]" aria-label="this week" />}
              <span className="flex-1" />
              {w.gate && <span className="h-1.5 w-1.5 rotate-45 bg-[#D97706]" aria-label="exam week" />}
              {hc && <span className="h-1.5 w-1.5 rounded-full bg-[#111827]" aria-label="checkpoint week" />}
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

/** The left column: the week and its tasks first, then the long view. Sections are bands, not gaps. */
export function WeekPanel({ week, taskId, overview, onOverview, onCollapse }: { week: number; taskId: string | null; overview: boolean; onOverview: () => void; onCollapse: () => void }) {
  const { desk, progress, start, openTask, isOpen } = useDesk();
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#DDE1E8] bg-[#F7F8FA] pl-4 pr-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#3F4757]">Week {week}</h2>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Hide the week panel"
          title="Hide the week panel"
          className="grid h-[30px] w-[30px] place-items-center rounded text-[#5B6474] hover:bg-[#F3F4F7] focus-ring"
        >
          <Icon name="chevronLeft" size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <button
          type="button"
          onClick={onOverview}
          aria-current={overview ? "page" : undefined}
          className={`flex w-full items-center gap-2.5 border-b border-[#DDE1E8] px-4 py-3 text-left focus-ring ${
            overview ? "bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA]" : "bg-white hover:bg-[#FAFAFC]"
          }`}
        >
          <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded border ${overview ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#DDE1E8] text-[#3F4757]"}`}>
            <Icon name="layers" size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-[#111827]">Week {week} overview</span>
            <span className="block truncate text-[12px] text-[#5B6474]" title={w.th}>{w.th.replace(/^Foundation \w+: /, "")}</span>
          </span>
          <Icon name="chevronRight" size={14} className="text-[#8A91A3]" />
        </button>

        <div className={band}>Tasks</div>
        <ul>
          {tasks.map((t) => {
            const here = t.id === taskId;
            const st = taskStatus(progress, t);
            const n = doneSteps(progress, t);
            const d = isOpen(t.week) ? due(start, t.dueDay, st === "submitted") : null;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    openTask(t.id);
                    onCollapse();
                  }}
                  aria-current={here ? "page" : undefined}
                  className={`flex w-full gap-2.5 border-b border-[#DDE1E8] px-4 py-3 text-left focus-ring ${
                    here ? "bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA]" : "bg-white hover:bg-[#FAFAFC]"
                  }`}
                >
                  <span className="pt-0.5"><Ring value={n / t.steps.length} done={st === "submitted"} size={18} /></span>
                  <span className="min-w-0">
                    <span className={`block text-[13px] leading-[1.4] text-[#111827] ${here ? "font-semibold" : "font-medium"}`}>
                      <span className={`mr-1 font-mono text-[12px] ${here ? "text-[#4338CA]" : "text-[#5B6474]"}`}>{t.id}</span>
                      {t.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-[12px] tabular-nums">
                      {d ? (
                        <span className={ON_LIGHT[d.level]} title={d.title}>{d.text}</span>
                      ) : (
                        <span className="text-[#8A91A3]">Opens {fmtDay(dueDate(start, (t.week - 1) * 7))}</span>
                      )}
                      <span className="text-[#5B6474]">{n}/{t.steps.length} steps</span>
                      {t.hc && <span className="rounded-[3px] bg-[#111827] px-[5px] py-px font-mono text-[10px] font-semibold text-white">{t.hc}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={band}>Before the week closes</div>
        <ul className="text-[13px] text-[#111827]">
          <li className="flex items-center gap-2.5 border-b border-[#DDE1E8] px-4 py-3">
            <Icon name="checkSquare" size={15} className="shrink-0 text-[#8A91A3]" />
            Knowledge check <span className="font-mono text-[12px] text-[#5B6474]">{w.kc?.split(" ")[0]}</span>
          </li>
          {w.gate && (
            <li className="flex items-center gap-2.5 border-b border-[#DDE1E8] px-4 py-3">
              <span className="grid w-[15px] shrink-0 place-items-center"><span className="h-2 w-2 rotate-45 bg-[#D97706]" /></span>
              {w.gate}
            </li>
          )}
          {hc && (
            <li className="flex items-center gap-2.5 border-b border-[#DDE1E8] px-4 py-3">
              <span className="grid w-[15px] shrink-0 place-items-center"><span className="h-2 w-2 rounded-full bg-[#111827]" /></span>
              Assessor checkpoint {w.hc}
            </li>
          )}
        </ul>
      </div>

      <section aria-labelledby="programme" className="flex shrink-0 flex-col gap-2 border-t border-[#DDE1E8] bg-[#F7F8FA] px-4 py-3">
        <div className="flex justify-between text-[13px] font-semibold text-[#111827]">
          <h2 id="programme">Your programme</h2>
          <span className="font-mono tabular-nums">{pct}%</span>
        </div>
        <div className="h-1 bg-[#E3E6EC]">
          <div className="h-1 bg-[#4338CA] transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[12px] text-[#5B6474] tabular-nums">
          {stepsDone} of {steps} steps · {submitted} of {all.length} tasks · {weeksDone} of {desk.weeks.length} weeks
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
  const { desk, progress, openTask } = useDesk();
  const tasks = weekTasks(desk, week);
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
            title={`${t.id} ${t.title}`}
            className={`${cell} gap-1 py-2 ${here ? "bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA]" : "hover:bg-[#F3F4F7]"}`}
          >
            <Ring value={doneSteps(progress, t) / t.steps.length} done={st === "submitted"} size={18} />
            <span className={`font-mono text-[9.5px] ${here ? "text-[#4338CA]" : "text-[#5B6474]"}`}>{t.id}</span>
          </button>
        );
      })}
    </div>
  );
}
