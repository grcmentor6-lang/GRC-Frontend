"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { decided, Work } from "./how-to";
import { Inbox } from "./chat";
import { ToolScreen } from "./viewer";
import { dueDate, fmtDay } from "@/lib/desk/model";
import { stepKey } from "@/lib/desk/progress";

/**
 * A platform tool, opened from the toolbar or from a step, as a centred modal: the work happens in
 * the tool, not in a drawer beside the task. The screen is the pack's mock-up of the tool. When the
 * step in hand is done in this tool, its work sits beside the screen — the instruction, the inputs,
 * "Done when" and Mark complete — and completing it walks on to the next step, staying in the tool
 * when the next step is done here too. Opened at any other time the tool is for reading.
 */
export function ToolModal({ toolKey, onClose }: { toolKey: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!toolKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toolKey, onClose]);

  return <AnimatePresence>{toolKey && <Dialog key="tool" toolKey={toolKey} onClose={onClose} />}</AnimatePresence>;
}

function Dialog({ toolKey, onClose }: { toolKey: string; onClose: () => void }) {
  const { desk, here, isOpen, progress } = useDesk();
  const sec = toolKey.split("|")[0];
  const mock = desk.tp[toolKey] ?? desk.tp[`${sec}|*`];
  const section = desk.sections[sec];
  const task = here ? desk.tasks[here.task] : null;
  const s = task && here ? task.steps[here.n - 1] : undefined;
  const working = !!task && !!s && s.key === toolKey && isOpen(task.week) && !progress.submitted[task.id];
  const title = mock?.tool ?? toolKey.replace("|", " › ");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
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
        className={`relative flex max-h-[calc(100dvh/var(--app-zoom)-48px)] w-full flex-col overflow-hidden rounded-lg border border-[#C9CED8] bg-white shadow-[0_24px_64px_rgba(17,24,39,0.35)] ${working ? "max-w-[1240px]" : "max-w-[960px]"}`}
      >
        {/* Header: a dark tool block, where it sits and what it is, and a close cell. */}
        <header className="flex shrink-0 items-stretch border-b border-[#DDE1E8]">
          <span className="grid w-14 shrink-0 place-items-center bg-[#111827] text-white">
            <Icon name="grid" size={18} />
          </span>
          <div className="min-w-0 flex-1 px-4 py-2.5">
            <p className="text-[12px] text-[#5B6474]">
              {section?.t ?? sec}
              {mock?.stamp ? ` · ${mock.stamp}` : ""}
            </p>
            <h2 className="truncate text-[17px] font-bold text-[#111827]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close tool" className="grid w-14 shrink-0 place-items-center border-l border-[#DDE1E8] text-[#3F4757] hover:bg-[#F3F4F7] focus-ring">
            <Icon name="x" size={18} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-wrap overflow-y-auto">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col bg-[#F7F8FA]">
            <Screen toolKey={toolKey} />
            {desk.guard[sec] && (
              <p className="flex items-start gap-2 px-3.5 py-2.5 text-[12px] leading-relaxed text-[#5B6474]">
                <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-[#8A91A3]" />
                {desk.guard[sec]}
              </p>
            )}
          </div>
          {working && task && s && <WorkPanel taskId={task.id} n={s.n} toolKey={toolKey} onClose={onClose} />}
        </div>
      </motion.div>
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
          <div key={t} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-[13.5px] font-semibold text-slate-900">{t}</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{d}</dd>
          </div>
        ))}
      </dl>
    );
  if (mock?.dyn === "inbox") return <div className="p-4"><Inbox /></div>;
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
        {(mock.pl as { note?: string }).note && (
          <p className="flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-[#5B6474]">
            <Icon name="shield" size={13} className="shrink-0 text-[#8A91A3]" />
            {(mock.pl as { note?: string }).note}
          </p>
        )}
      </>
    );
  }
  if (!mock) return <p className="p-4 text-[13.5px] text-[#5B6474]">This tool has no screen in this release.</p>;
  return <ToolScreen mock={mock} flush />;
}

/** The step in hand, worked inside its tool. */
function WorkPanel({ taskId, n, toolKey, onClose }: { taskId: string; n: number; toolKey: string; onClose: () => void }) {
  const { desk, progress, update, openTask } = useDesk();
  const task = desk.tasks[taskId];
  const s = task.steps[n - 1];
  const key = stepKey(task.id, n);
  const done = !!progress.done[key];
  const next = task.steps[n];

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
    goNext();
  };

  return (
    <aside aria-label={`Your work for step ${n}`} className="flex min-w-0 flex-[1_1_380px] flex-col border-l border-[#DDE1E8] bg-white max-[980px]:border-l-0 max-[980px]:border-t">
      <div className="flex items-center gap-2.5 border-b border-[#DDE1E8] bg-[#F7F8FA] px-4 py-2.5">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-[#4338CA] text-[13px] font-bold text-white tabular-nums">{n}</span>
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-[#3F4757]">
          {task.id} · Step {n} of {task.steps.length}
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8, transition: { duration: 0.1 } }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-[#DDE1E8] px-4 py-3.5">
            <h3 className="text-[16px] font-bold leading-[1.35] text-[#111827]">{s.t}</h3>
            {s.w && s.w !== s.t && <p className="mt-2 text-[14px] leading-[1.55] text-[#3F4757]">{s.w}</p>}
          </div>
          <div className="flex-1 border-b border-[#DDE1E8] px-4 pb-3.5 [&>*:first-child]:mt-3">
            <Work task={task} s={s} readOnly={done} />
          </div>
          <p className="flex items-center gap-2 border-b border-[#DDE1E8] bg-[#F0FDF4] px-4 py-2.5 text-[13px] text-[#14532D]">
            <Icon name="checkCircle" size={15} className="shrink-0" />
            <span>
              <strong className="font-bold">Done when</strong> {s.o}
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
          <button type="button" onClick={goNext} className="inline-flex min-h-12 items-center gap-1.5 border-l border-[#DDE1E8] bg-[#111827] px-5 text-[14px] font-semibold text-white hover:brightness-110 focus-ring">
            {next ? `Step ${next.n}` : "Back to the task"} <Icon name="arrowRight" size={14} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!decided(progress, task, s)}
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
