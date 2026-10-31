"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import type { Task } from "@/lib/desk/model";
import { INJ_AT, released, waitingAt } from "@/lib/desk/inbox";
import { api } from "@/lib/api";
import type { DecisionFeedback } from "@/lib/desk/progress";

/*
 * The task messages, read and answered in Toolbar › Inbox. Each says what kind of message it is,
 * because the three kinds ask for different things:
 *   DECISION - a colleague needs your call (A/B/C);
 *   DRILL    - a security test: an unsafe offer to refuse and report (A/B/C, or Report);
 *   DATA     - new information to fold into the work: its steps, then "Rows added".
 * A message plays in the previous version's chat language (Avatar / Bubble / TypingBubble, from
 * workspaces/set-a.tsx). Content is the pack's message only; the learning point comes with review.
 */

function Avatar({ who, label }: { who: "you" | "them"; label?: string }) {
  const grad = who === "you" ? "from-indigo-500 to-sky-400" : "from-violet-500 to-fuchsia-500";
  return (
    <div title={label} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-white shadow-sm ring-2 ring-white`}>
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
        <circle cx="12" cy="8.5" r="3.6" />
        <path d="M5 19.5c0-3.4 3.1-5.3 7-5.3s7 1.9 7 5.3v.5H5z" />
      </svg>
    </div>
  );
}

function Bubble({ who, label, text }: { who: "you" | "them"; label: string; text: string }) {
  const mine = who === "you";
  return (
    <div className={`flex items-start gap-2.5 ${mine ? "justify-end" : ""}`}>
      {!mine && <Avatar who="them" label={label} />}
      <div
        className={`max-w-[82%] whitespace-pre-line rounded-2xl border border-[#d3dbe6] px-3.5 py-2 text-[13.5px] leading-relaxed tracking-tight text-slate-800 ${
          mine ? "bg-indigo-50" : "bg-white"
        }`}
      >
        {text}
      </div>
      {mine && <Avatar who="you" label={label} />}
    </div>
  );
}

/** The sender's message, after a beat of "typing…" — only the first time; an answered thread opens settled. */
function TypingBubble({ label, text, onDone }: { label: string; text: string; onDone: () => void }) {
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setTyping(false);
      onDone();
    }, 1100);
    return () => clearTimeout(t);
    // Once on mount; onDone is a fresh arrow each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!typing) return <Bubble who="them" label={label} text={text} />;
  return (
    <div className="flex items-start gap-2.5" aria-label={`${label} is typing`}>
      <Avatar who="them" label={label} />
      <div className="flex items-center gap-1 rounded-2xl bg-white px-3.5 py-3 ring-1 ring-slate-200">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}

const KIND: Record<string, { label: string; hint: string; chip: string; icon: "alertTriangle" | "flag" | "inbox" }> = {
  DRILL: {
    label: "Security drill",
    hint: "A test of how you handle data. Choose what a careful intern would do.",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: "alertTriangle",
  },
  DECISION: {
    label: "Quick decision",
    hint: "A colleague needs your call. Read the guidance named below, then choose.",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
    icon: "flag",
  },
  DATA: {
    label: "New information",
    hint: "Something new to fold into your work. Do the steps, then confirm.",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
    icon: "inbox",
  },
};

function Thread({ id, task, locked }: { id: string; task: Task; locked: boolean }) {
  const { desk, progress, update, here, closeTool } = useDesk();
  const m = desk.inj[id];
  const picked = progress.msgs[id];
  // Played from the start only if it has not been answered; a settled thread just shows itself.
  const [arrived, setArrived] = useState(!!picked);
  const notice = !m?.options?.length;
  // Once answered, the reply is checked against the message's key (POST /me/desk/message), as a decision is.
  // A message with no key yet (404) stays answered without feedback, and says when its learning point comes.
  const fb = progress.decisions?.[id];
  const [nokey, setNokey] = useState(false);
  useEffect(() => {
    if (!m || !picked || notice || fb || nokey) return;
    let live = true;
    api
      .post<DecisionFeedback>("/me/desk/message", { id, pick: picked })
      .then((r) => { if (live) update((p) => ({ ...p, decisions: { ...p.decisions, [id]: r } })); })
      .catch(() => { if (live) setNokey(true); });
    return () => { live = false; };
  }, [m, picked, notice, fb, nokey, id, update]);
  if (!m) return null;
  const kind = KIND[m.type] ?? KIND.DECISION;
  // What the mentee's own bubble says: the option they took, or the pack's button label.
  const answer = !picked ? undefined : notice ? "Rows added" : picked === "report" ? "Report" : m.options[picked.charCodeAt(0) - 65];
  const reply = (v: string) => update((p) => ({ ...p, msgs: { ...p.msgs, [id]: v } }));
  const bestText = fb?.best === "report" ? "Report" : fb?.best ? m.options[fb.best.charCodeAt(0) - 65] : undefined;

  return (
    <article id={`msg-${id}`} aria-label={`${kind.label} from ${m.sender}`} className="grid scroll-mt-16 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="grid min-w-0 gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-semibold ring-1 ${kind.chip}`}>
              <Icon name={kind.icon} size={12} /> {kind.label}
            </span>
            <span className="text-[12.5px] text-slate-500">
              from <span className="font-medium text-slate-800">{m.sender}</span>
            </span>
          </span>
          <span className="text-[12.5px] text-slate-500">{kind.hint}</span>
        </div>
        {picked && (
          <span className="inline-flex h-6 items-center gap-1 rounded-md bg-emerald-50 px-2 text-[11.5px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            <Icon name="check" size={11} strokeWidth={3} /> {notice ? "Done" : "Answered"}
          </span>
        )}
      </header>

      <div className="grid gap-3 rounded-xl bg-[#f6f7fb] p-3.5 ring-1 ring-inset ring-slate-200 sm:p-4">
        {picked ? <Bubble who="them" label={m.sender} text={m.notice} /> : <TypingBubble label={m.sender} text={m.notice} onDone={() => setArrived(true)} />}

        {notice && m.steps?.length > 0 && (
          <ol className="ml-[38px] grid list-decimal gap-1 rounded-xl bg-white/70 py-2.5 pl-8 pr-3.5 text-[13px] leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
            {m.steps.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        )}

        {answer && <Bubble who="you" label="You" text={answer} />}

        {!picked && arrived && !notice && (
          <div className="pt-1">
            <p className="mb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Choose your reply</p>
            <div className="grid gap-2">
              {m.options.map((o, i) => (
                <button
                  key={o}
                  type="button"
                  disabled={locked}
                  onClick={() => reply(String.fromCharCode(65 + i))}
                  className="flex w-full gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-left text-[13px] leading-relaxed tracking-tight text-slate-800 ring-1 ring-slate-200 transition-colors hover:bg-indigo-50/40 hover:ring-indigo-400 focus-ring active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500">{"ABCDEF"[i]}</span>
                  <span>{o}</span>
                </button>
              ))}
            </div>
            {/* A drill can also be escalated rather than answered, as in the pack's desk. */}
            {m.type === "DRILL" && (
              <button
                type="button"
                disabled={locked}
                onClick={() => reply("report")}
                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[12.5px] font-semibold text-amber-800 ring-1 ring-amber-300 transition-colors hover:bg-amber-50 focus-ring active:scale-[0.98] disabled:opacity-60"
              >
                <Icon name="flag" size={13} /> Report
              </button>
            )}
          </div>
        )}

        {!picked && arrived && notice && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={locked}
              onClick={() => reply("OK")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-ring active:scale-[0.98] disabled:opacity-60"
            >
              <Icon name="check" size={14} strokeWidth={2.5} /> Rows added
            </button>
          </div>
        )}

        {picked && fb && (
          <div data-guide="message-result" className={`grid gap-1 rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ring-1 ring-inset ${fb.correct ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-amber-50 text-amber-900 ring-amber-200"}`}>
            <p className="font-semibold">{fb.correct ? "That was the best reply." : `Not the best reply. The best is: ${bestText}`}</p>
            {fb.why && <p>{fb.why}</p>}
          </div>
        )}
        {picked && here?.task === m.task && INJ_AT[id] === here.n && (
          <div className="flex justify-end">
            <button type="button" data-guide="message-back" onClick={() => closeTool("inbox|*")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-ring active:scale-[0.98]">
              Back to step {here.n} <Icon name="arrowRight" size={14} />
            </button>
          </div>
        )}
        {picked && !fb && !notice && <p className="text-center text-[11.5px] text-slate-500">The learning point appears after you submit {task.id}.</p>}
      </div>

      <footer className="text-[11.5px] text-slate-500">
        {m.sim_notice} · Guidance: {m.ref}
      </footer>
    </article>
  );
}

/** On a step with a message waiting: who it is from, why it matters now, and the way to it. */
export function MessageNotice({ task, n }: { task: Task; n: number }) {
  const { desk, progress, openTool } = useDesk();
  const id = waitingAt(desk, progress, task.id, n)[0];
  if (!id) return null;
  return (
    <div data-guide="message-notice" role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-[#F3D08A] bg-[#FFFBF2] px-4 py-2.5">
      <Icon name="inbox" size={16} className="shrink-0 text-[#92400E]" />
      <p className="min-w-[180px] flex-1 text-[13px] leading-snug text-[#78350F]">
        <strong className="font-semibold">New message from {desk.inj[id].sender}.</strong> Reply in the Inbox before you complete this step.
      </p>
      <button type="button" data-guide="message-open" onClick={() => openTool("inbox|*")} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded bg-[#4338CA] px-3.5 text-[13px] font-semibold text-white hover:brightness-90 focus-ring">
        Open Inbox
      </button>
    </div>
  );
}

/**
 * Toolbar › Inbox: every task message of the weeks that are open, newest week first, each played in
 * the chat language above. Unanswered ones are what the Inbox badge counts.
 */
export function Inbox() {
  const { desk, isOpen, progress, here } = useDesk();
  // Opens on the message the step in hand is waiting for: older weeks' threads sit around it.
  useEffect(() => {
    const id = here && waitingAt(desk, progress, here.task, here.n)[0];
    if (id) document.getElementById(`msg-${id}`)?.scrollIntoView({ block: "start" });
    // Once on opening; a reply must not move the thread being read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const weeks = desk.weeks
    .map((w, i) => ({ n: i + 1, ids: desk.order.filter((t) => desk.tasks[t].week === i + 1).flatMap((t) => desk.tasks[t].inj).filter((id) => released(desk, progress, here, id)) }))
    .filter((w) => w.ids.length && isOpen(w.n))
    .reverse();
  if (!weeks.length) return <p className="text-[13.5px] text-slate-500">Messages arrive as you start each task.</p>;
  return (
    <div className="grid gap-6">
      {weeks.map((w) => (
        <section key={w.n} aria-label={`Week ${w.n}`} className="grid gap-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-500">Week {w.n}</h3>
          {w.ids.map((id) => (
            <Thread key={id} id={id} task={desk.tasks[desk.inj[id].task]} locked={false} />
          ))}
        </section>
      ))}
    </div>
  );
}

/**
 * Messages still waiting for an answer. A task's messages arrive once the learner reaches the task (the one in
 * hand, or one with work done), not when its week opens (owner, 30 Oct: things open task by task).
 */
export function useUnread(task?: string): number {
  const { desk, progress, isOpen, here } = useDesk();
  return Object.values(desk.inj).filter(
    (m) => desk.tasks[m.task] && (!task || m.task === task) && isOpen(desk.tasks[m.task].week) && released(desk, progress, here, m.id) && !progress.msgs[m.id],
  ).length;
}
