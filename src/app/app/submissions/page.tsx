"use client";

import { ALL_WEEKS_OPEN } from "@/lib/flags";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Icon } from "@/components/ui/icon";
import { submissionText } from "@/lib/desk/work";
import { dueDate, fmtDay, loadDesk, startOf, weekOpen, type Desk, type Task } from "@/lib/desk/model";
import { stepKey, taskStatus, useProgress, type Progress } from "@/lib/desk/progress";

/**
 * My Submissions — everything the mentee has handed in, week by week and task by task: each step's
 * typed work, the option taken, the rows decided, the parts read, and where each task stands. It
 * replaces My Learnings in the menu. Desk progress is per browser for now (lib/desk/progress.ts),
 * so this page reads the same store the Working Desk writes.
 */
export default function SubmissionsPage() {
  const { user } = useAuth();
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    loadDesk().then(setDesk, () => setDesk(null));
  }, []);
  if (!desk || !user) return <div className="page-shell"><div className="h-40 animate-pulse rounded-md bg-slate-100" aria-busy="true" /></div>;
  return <Submissions desk={desk} who={user.email} startIso={user.startDate} preview={ALL_WEEKS_OPEN || user.role === "admin"} />;
}

function Submissions({ desk, who, startIso, preview }: { desk: Desk; who: string; startIso: string | null; preview?: boolean }) {
  const { progress } = useProgress(who);
  const start = useMemo(() => startOf(startIso), [startIso]);
  const tasks = desk.order.map((id) => desk.tasks[id]);
  const steps = tasks.flatMap((t) => t.steps.map((s) => ({ t, s })));
  const done = steps.filter(({ t, s }) => progress.done[stepKey(t.id, s.n)]).length;
  const decisions = steps.filter(({ t, s }) => s.kind !== "do" && progress.done[stepKey(t.id, s.n)]).length;
  const submitted = tasks.filter((t) => progress.submitted[t.id]).length;
  // Only weeks that have opened, newest first: what is not open yet has nothing to show.
  const weeks = desk.weeks.filter((w) => preview || weekOpen(w.n, start)).reverse();

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
          ["Steps done", `${done} / ${steps.length}`],
          ["Decisions made", String(decisions)],
          ["Tasks submitted", `${submitted} / ${tasks.length}`],
          ["Weeks open", `${weeks.length} / ${desk.weeks.length}`],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-3 ${i < 3 ? "md:border-r" : ""} ${i % 2 === 0 ? "max-md:border-r" : ""} ${i < 2 ? "max-md:border-b" : ""} border-[#DDE1E8]`}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{k}</dt>
            <dd className="mt-0.5 font-mono text-[18px] font-semibold text-[#111827] tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {weeks.map((w) => (
        <section key={w.n} aria-labelledby={`wk-${w.n}`} className="space-y-2">
          <h2 id={`wk-${w.n}`} className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#3F4757]">
            Week {w.n} · <span className="normal-case tracking-normal text-[#5B6474]">{w.th}</span>
          </h2>
          {tasks.filter((t) => t.week === w.n).map((t) => (
            <TaskRecord key={t.id} task={t} progress={progress} desk={desk} start={start} />
          ))}
        </section>
      ))}
    </div>
  );
}

function TaskRecord({ task, progress, desk, start }: { task: Task; progress: Progress; desk: Desk; start: Date }) {
  const st = taskStatus(progress, task);
  const n = task.steps.filter((s) => progress.done[stepKey(task.id, s.n)]).length;
  const chip =
    st === "submitted" ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : st === "started" ? "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3]" : "border-[#DDE1E8] bg-[#F7F8FA] text-[#3F4757]";
  const label = st === "submitted" ? `Submitted ${new Date(progress.submitted[task.id]).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : st === "started" ? "In progress" : "Not started";
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
      {n === 0 && !Object.keys(progress.answers).some((k) => k.startsWith(`${task.id}-`)) ? (
        <p className="px-4 py-3 text-[13px] text-[#8A91A3]">Nothing handed in yet.</p>
      ) : (
        <ol>
          {task.steps.map((s) => {
            const isDone = !!progress.done[stepKey(task.id, s.n)];
            const text = submissionText(desk, progress, task, s);
            return (
              <li key={s.n} className="grid grid-cols-[40px_minmax(0,2fr)_minmax(0,3fr)] items-start gap-3 border-b border-[#E9ECF1] px-4 py-2.5 text-[13px] last:border-b-0 max-md:grid-cols-[32px_minmax(0,1fr)]">
                <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-[12px] font-bold tabular-nums ${isDone ? "bg-[#16A34A] text-white" : "bg-[#EEF0F4] text-[#5B6474]"}`}>{s.n}</span>
                <span className="text-[#111827]">{s.kind === "do" ? s.t : s.t.replace(/^decide( for each row)?:\s*/i, "")}</span>
                <span className={`max-md:col-start-2 ${text ? "text-[#3F4757]" : "text-[#8A91A3]"}`}>{text || (isDone ? "Done" : "—")}</span>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
