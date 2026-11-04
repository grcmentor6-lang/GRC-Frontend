"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { submissionText } from "@/lib/desk/work";
import { useDeskIdentity } from "@/lib/desk/identity";
import { dueDate, fmtDay, type Desk, type Task } from "@/lib/desk/model";
import { stepKey, taskStatus, type Progress } from "@/lib/desk/progress";
import { fmtWhen, recordCounts, recordEmpty, useDeskRecord } from "@/lib/desk-record";

/**
 * My Submissions — everything the mentee has handed in, week by week and task by task: each step's
 * typed work, the option taken, the rows decided, the parts read, and where each task stands. It reads
 * this account's saved desk work (desk_progress, via lib/desk-record), the same store the Working Desk
 * writes; Reports reads the same counts.
 */
export default function SubmissionsPage() {
  const { state, desk, progress, start, weeks, retry } = useDeskRecord();
  if (state === "failed")
    return (
      <div className="page-shell grid justify-items-center gap-2 py-16 text-center">
        <p className="text-[14px] font-medium text-[#111827]">Your submissions did not load.</p>
        <p className="text-[13px] text-[#5B6474]">Your work is safe on the server. Check your connection, then try again.</p>
        <button type="button" onClick={retry} className="mt-1 rounded bg-[#111827] px-3 py-1.5 text-[13px] font-medium text-white">Try again</button>
      </div>
    );
  if (state === "loading" || !desk) return <div className="page-shell"><div className="h-40 animate-pulse rounded-md bg-slate-100" aria-busy="true" /></div>;

  const c = recordCounts(desk, progress);
  const empty = recordEmpty(progress);
  return (
    <div className="page-shell space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-[#111827]">My Submissions</h1>
          <p className="text-[13.5px] text-[#5B6474]">Everything you have handed in on the Working Desk, step by step. Change a step from the desk until its task is submitted.</p>
        </div>
        <Link href="/app/desk" className="inline-flex h-9 items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white no-underline hover:brightness-90 focus-ring">
          Open the Working Desk <Icon name="arrowRight" size={14} />
        </Link>
      </header>

      <dl className="grid grid-cols-2 border border-[#DDE1E8] bg-white md:grid-cols-4">
        {[
          ["Tasks submitted", `${c.tasksSubmitted} / ${c.tasks}`],
          ["Steps done", `${c.stepsDone} / ${c.steps}`],
          ["Decisions made", `${c.decisionsDone} / ${c.decisions}`],
          ["Weeks open", `${weeks.length} / ${desk.weeks.length}`],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-3 ${i < 3 ? "md:border-r" : ""} ${i % 2 === 0 ? "max-md:border-r" : ""} ${i < 2 ? "max-md:border-b" : ""} border-[#DDE1E8]`}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{k}</dt>
            <dd className="mt-0.5 font-mono text-[18px] font-semibold text-[#111827] tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {empty && (
        <p className="border border-dashed border-[#C9CFD9] bg-white px-4 py-3 text-[13px] text-[#3F4757]">
          You have not handed anything in yet. Each step you complete on the Working Desk appears here, under its task, as you do it.
        </p>
      )}

      {weeks.map((w) => (
        <section key={w.n} aria-labelledby={`wk-${w.n}`} className="space-y-2">
          <h2 id={`wk-${w.n}`} className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#3F4757]">
            Week {w.n} · <span className="normal-case tracking-normal text-[#5B6474]">{w.th}</span>
          </h2>
          {(() => {
            const wk = desk.order.map((id) => desk.tasks[id]).filter((t) => t.week === w.n);
            const todo = wk.filter((t) => !handedIn(desk, progress, t));
            return (
              <>
                {wk.filter((t) => !todo.includes(t)).map((t) => <TaskRecord key={t.id} task={t} progress={progress} desk={desk} start={start} />)}
                {todo.length > 0 && (
                  <p className="border border-[#E9ECF1] bg-white px-4 py-2.5 text-[13px] text-[#5B6474]">
                    Nothing handed in yet for{" "}
                    {todo.map((t, i) => (
                      <span key={t.id}>
                        {i > 0 && (i === todo.length - 1 ? " and " : ", ")}
                        <Link href={`/app/desk#${t.id}`} className="font-mono font-semibold text-[#4338CA] no-underline hover:underline">{t.id}</Link>
                        <span className="text-[#8A91A3]"> (due {fmtDay(dueDate(start, t.dueDay))})</span>
                      </span>
                    ))}
                    .
                  </p>
                )}
              </>
            );
          })()}
        </section>
      ))}
    </div>
  );
}

/** Keys this learner has saved under a step ("T5.1-3", "T5.1-3#ref") — their own work, not what the screen pre-fills. */
const savedUnder = (p: Progress, prefix: string) =>
  [p.done, p.picks, p.answers, p.acks, p.logs, p.rowChecks ?? {}].some((m) => Object.keys(m).some((k) => k === prefix || k.startsWith(`${prefix}#`)));
/**
 * A step's line, only from what the learner saved: a step that is neither done nor holds keys of its own
 * shows nothing. submissionText now skips a register nobody typed in; this keeps any other pre-filled
 * screen from reading as handed in.
 */
const lineOf = (desk: Desk, p: Progress, task: Task, menteeId?: string) =>
  task.steps.map((s) => {
    const k = stepKey(task.id, s.n);
    const isDone = !!p.done[k];
    return { s, isDone, text: isDone || savedUnder(p, k) ? submissionText(desk, p, task, s, menteeId) : "" };
  });
/** Anything of this task's on record: a step done, work saved under a step, or the task submitted. */
const handedIn = (desk: Desk, p: Progress, task: Task) => !!p.submitted[task.id] || lineOf(desk, p, task).some((l) => l.isDone || l.text);

function TaskRecord({ task, progress, desk, start }: { task: Task; progress: Progress; desk: Desk; start: Date }) {
  const st = taskStatus(progress, task);
  const n = task.steps.filter((s) => progress.done[stepKey(task.id, s.n)]).length;
  const lines = lineOf(desk, progress, task, useDeskIdentity().menteeId); // a pick in the learner's letter
  const chip =
    st === "submitted" ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : st === "started" ? "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3]" : "border-[#DDE1E8] bg-[#F7F8FA] text-[#3F4757]";
  const label = st === "submitted" ? `Submitted ${fmtWhen(progress.submitted[task.id])}` : st === "started" ? "In progress" : "Not started";
  return (
    <article className="border border-[#DDE1E8] bg-white">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#DDE1E8] px-4 py-2.5">
        <span className="rounded bg-[#111827] px-1.5 py-0.5 font-mono text-[12px] font-semibold text-white">{task.id}</span>
        <h3 className="min-w-0 flex-1 text-[14.5px] font-semibold text-[#111827]">{task.title}</h3>
        <span className="text-[12px] text-[#5B6474] tabular-nums">
          {n}/{task.steps.length} steps · due {fmtDay(dueDate(start, task.dueDay))}
        </span>
        <span className={`whitespace-nowrap rounded-[3px] border px-[7px] py-0.5 text-[12px] font-semibold ${chip}`}>{label}</span>
        <Link href={`/app/desk#${task.id}`} className="text-[12.5px] font-medium text-[#4338CA] no-underline hover:underline">Open in desk</Link>
      </header>
      {lines.every((l) => !l.isDone && !l.text) ? (
        <p className="px-4 py-3 text-[13px] text-[#8A91A3]">Nothing handed in yet.</p>
      ) : (
        <ol>
          {lines.map(({ s, isDone, text }) => (
            <li key={s.n} className="grid grid-cols-[40px_minmax(0,2fr)_minmax(0,3fr)] items-start gap-3 border-b border-[#E9ECF1] px-4 py-2.5 text-[13px] last:border-b-0 max-md:grid-cols-[32px_minmax(0,1fr)]">
              <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-[12px] font-bold tabular-nums ${isDone ? "bg-[#16A34A] text-white" : "bg-[#EEF0F4] text-[#5B6474]"}`}>{s.n}</span>
              <span className="text-[#111827]">{s.kind === "do" ? s.t : s.t.replace(/^decide( for each row)?:\s*/i, "")}</span>
              <span className={`max-md:col-start-2 ${text ? "text-[#3F4757]" : "text-[#8A91A3]"}`}>
                {/* Typed but not marked complete is a draft, not a hand-in: say so. */}
                {text && !isDone && <span className="mr-1.5 rounded-[3px] border border-dashed border-[#C9CFD9] px-1 text-[11px] font-semibold text-[#5B6474]">Draft</span>}
                {text || (isDone ? "Done" : "—")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
