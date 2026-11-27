"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";
import { MachineNote } from "./machine-note";
import { ReportProblem } from "./feedback-widget";
import { useAuth } from "@/components/auth/auth-provider";
import { loadDesk, type Desk } from "@/lib/desk/model";
import { stepKey, useProgress } from "@/lib/desk/progress";
import { useWhere } from "@/lib/desk/where";
import { nextTask } from "@/lib/desk-plan";
import { FAQ } from "@/lib/mentor-faq";
import { askTutor, FOLLOW_UPS, readingFor, starters, tutorUsage, type TutorReply, type TutorUsage } from "@/lib/tutor";

/**
 * The AI mentor: the one corner button on every signed-in page, opening a panel beside the work with two tabs —
 * "Ask mentor" (the chat) and "Common questions" (lib/mentor-faq.ts) — and Report a problem inside it.
 *
 * It is software, and says so: every answer wears the machine-note tag and the avatar is drawn, not a face. What it
 * may say about a step is decided on the server (teach before the step is done, the full answer after; closed while a
 * knowledge check or exam is open). A step is only read once the learner chooses "Ask about this step" (owner,
 * 27 Nov 2026: start simple, offer the step, never attach it unasked).
 *
 * On a desktop it docks on the right and the page makes room for it (`--ask-w`, read by AppShell and the desk's step
 * window), so it never covers a step's controls; on a phone it is a full-screen sheet.
 * ponytail: the conversation lives in sessionStorage (this browser, this tab); a server-side history only if learners
 * ask for one. No streaming: the model answers in a few seconds, shown with a typing indicator.
 */
interface Msg { role: "learner" | "assistant"; text: string; sources?: string[]; mode?: TutorReply["mode"]; reason?: string | null; steps?: TutorReply["steps"] }
type View = "ask" | "faq" | "report";
const STORE = "grcm.ask.v1";
const MIN_W = 360, MAX_W = 640;

const saved = (): Msg[] => {
  try {
    const v = JSON.parse(sessionStorage.getItem(STORE) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const keep = (m: Msg[]) => {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(m.slice(-40)));
  } catch {
    /* private mode or full: the chat still works for this visit */
  }
};

export function StudyAssistant({ placement = "bottom-5 right-5" }: { placement?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && (
        <div className={`fixed ${placement} z-[72] print:hidden`}>
          <button
            onClick={() => setOpen(true)}
            aria-label="Ask your AI mentor, or report a problem"
            title="Ask your AI mentor, or report a problem"
            data-ask="open"
            className="focus-ring flex h-12 items-center gap-2 rounded-full bg-white pl-2 pr-4 text-[13.5px] font-semibold tracking-tight text-slate-900 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.45)] ring-1 ring-slate-300 transition-[background-color,transform] hover:bg-slate-50 active:scale-[0.97]"
          >
            <MentorAvatar size={32} ring={false} />
            <span>Ask your mentor</span>
          </button>
        </div>
      )}
      {open && <Panel onClose={() => setOpen(false)} />}
    </>
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const where = useWhere();
  const { progress } = useProgress(user?.email ?? "");
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => { loadDesk().then(setDesk, () => setDesk(null)); }, []);

  const [view, setView] = useState<View>("ask");
  const [msgs, setMsgs] = useState<Msg[]>(saved);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<TutorUsage | null>(null);
  const [copied, setCopied] = useState(-1);
  // The step the learner chose to ask about. Nothing is read until they choose; opening another step un-chooses it.
  const [pinned, setPinned] = useState<string | null>(null);
  const [width, setWidth] = useState(420);
  const box = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);

  // The step on offer: the one open on the desk, else the first step not yet done of the next task.
  const next = (() => {
    const id = desk ? nextTask(desk, progress) : null;
    const n = id ? desk!.tasks[id].steps.find((s) => !progress.done[stepKey(id, s.n)])?.n : undefined;
    return id && n ? { task: id, step: n } : null;
  })();
  const isOpenStep = !!where?.step;
  const at = isOpenStep ? where : next;
  const key = at ? stepKey(at.task, at.step) : "";
  const step = at && pinned === key ? at : null;
  const done = !!step && (!!progress.done[stepKey(step.task, step.step)] || !!progress.submitted[step.task]);

  useEffect(() => { tutorUsage().then(setUsage, () => {}); }, []);
  useEffect(() => { if (view === "ask") box.current?.focus(); }, [view]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, busy]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  // The page makes room on a desktop (AppShell, the desk's step window); a phone gets the full-screen sheet.
  useEffect(() => {
    const root = document.documentElement;
    const set = () => (window.innerWidth >= 1024 ? root.style.setProperty("--ask-w", `${width}px`) : root.style.removeProperty("--ask-w"));
    set();
    window.addEventListener("resize", set);
    return () => { window.removeEventListener("resize", set); root.style.removeProperty("--ask-w"); };
  }, [width]);

  const send = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    setView("ask");
    const history = msgs.slice(-6).map((m) => ({ role: m.role, text: m.text.slice(0, 3500) }));
    const mine: Msg[] = [...msgs, { role: "learner", text: q }];
    setMsgs(mine);
    setText("");
    setError("");
    setBusy(true);
    try {
      const r = await askTutor({ question: q.slice(0, 600), task: step?.task, step: step?.step, page: pathname, history });
      const all: Msg[] = [...mine, { role: "assistant", text: r.answer, sources: r.sources, mode: r.mode, reason: r.reason, steps: r.steps }];
      setMsgs(all);
      keep(all);
      setUsage(r.usage);
    } catch (e) {
      setMsgs(msgs);
      setText(q);
      setError(e instanceof ApiError && e.status === 429 ? "You have asked a lot in the last hour. Take a short break, then ask again." : e instanceof Error && e.message ? e.message : "The AI mentor did not answer. Please try again.");
    } finally {
      setBusy(false);
      box.current?.focus();
    }
  };

  const drag = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const zoom = el.getBoundingClientRect().height / el.offsetHeight || 1; // the app is scaled with CSS zoom
    const x0 = e.clientX, w0 = width;
    const move = (ev: PointerEvent) => setWidth(Math.max(MIN_W, Math.min(MAX_W, w0 + (x0 - ev.clientX) / zoom)));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const last = msgs.length - 1;
  const left = usage ? usage.allowance - usage.used : null;
  const newChat = () => { setMsgs([]); keep([]); setError(""); box.current?.focus(); };
  const label = at ? `${at.task} step ${at.step}` : "";

  return (
    <aside
      role="complementary"
      aria-label="AI mentor"
      data-ask="panel"
      style={{ ["--w" as string]: `${width}px` }}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#ECEEFB] print:hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:z-[62] lg:w-[var(--w)] lg:border-l lg:border-[#1E1B4B]/30 lg:shadow-[-20px_0_48px_-28px_rgba(30,27,75,0.55)]"
    >
      <div onPointerDown={drag} role="separator" aria-orientation="vertical" aria-label="Resize the AI mentor" className="absolute inset-y-0 left-0 z-10 hidden w-1.5 cursor-col-resize transition-colors hover:bg-violet-400/60 lg:block" />

      {/* Header: who you are talking to, and the two tabs */}
      <header className="shrink-0 bg-[radial-gradient(120%_140%_at_0%_0%,#3B3486_0%,#1E1B4B_55%,#17153B_100%)] text-white">
        <div className="flex items-center gap-3 px-4 pb-3 pt-3.5">
          <MentorAvatar size={42} />
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-tight text-white">
              AI mentor
              <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C7D2FE] ring-1 ring-white/20">AI</span>
            </h2>
            <p className="truncate text-[12px] text-[#C7D2FE]">Help with the programme, ISO 27001 and GRC</p>
          </div>
          {view === "ask" && msgs.length > 0 && (
            <button onClick={newChat} aria-label="New chat" title="New chat" className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20">
              <Icon name="plus" size={15} />
            </button>
          )}
          <button onClick={onClose} aria-label="Close the AI mentor" className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#C7D2FE] transition-colors hover:bg-white/10 hover:text-white">
            <Icon name="x" size={16} />
          </button>
        </div>
        {view !== "report" ? (
          <div role="tablist" aria-label="AI mentor" className="mx-4 mb-3.5 grid grid-cols-2 gap-1 rounded-xl bg-black/20 p-1 ring-1 ring-white/10">
            {([["ask", "Ask mentor", "chat"], ["faq", "Common questions", "help"]] as const).map(([v, t, ic]) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`focus-ring flex h-8 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${view === v ? "bg-white text-[#1E1B4B] shadow-[0_2px_8px_rgba(0,0,0,0.25)]" : "text-[#C7D2FE] hover:bg-white/10 hover:text-white"}`}
              >
                <Icon name={ic} size={14} />
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-4 mb-3.5 flex items-center gap-2">
            <button onClick={() => setView("ask")} className="focus-ring flex h-8 items-center gap-1 rounded-lg px-2 text-[12.5px] font-medium text-[#C7D2FE] hover:bg-white/10 hover:text-white">
              <Icon name="arrowLeft" size={14} /> Back
            </button>
            <span className="text-[13px] font-semibold text-white">Report a problem</span>
          </div>
        )}
      </header>

      {view === "report" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="mb-3 text-[12.5px] leading-snug text-slate-600">For something broken or missing on the desk, or when you cannot go on. Questions about the work are quicker to ask the mentor.</p>
            <ReportProblem />
          </div>
        </div>
      )}

      {view === "faq" && (
        <div role="tabpanel" aria-label="Common questions" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ul data-ask="faq" className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {FAQ.map((f, i) => (
              <li key={f.q} className={i ? "border-t border-slate-100" : ""}>
                <details className="group">
                  <summary className="focus-ring flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-[13.5px] font-medium text-slate-900 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{f.q}</span>
                    <Icon name="chevronDown" size={15} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-3.5 text-[13px] leading-relaxed text-slate-600">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[13px] font-semibold text-slate-900">Not here?</p>
            <p className="mt-0.5 text-[12.5px] text-slate-600">Ask the mentor anything about the work, or tell the programme office something is wrong.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setView("ask")} className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[12.5px] font-semibold text-white hover:bg-slate-700">
                <Icon name="chat" size={14} /> Ask mentor
              </button>
              <button onClick={() => setView("report")} className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[12.5px] font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">
                <Icon name="flag" size={14} /> Report a problem
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "ask" && (
        <>
          {/* Shown only after the learner chose a step: what is read, and what the mentor may say about it */}
          {step && (
            <section data-ask="context" aria-label="The step the mentor is reading" className="mx-4 mt-3 flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-[#1E1B4B]/10">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                <Icon name={done ? "checkCircle" : "lightbulb"} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">Reading with you · {done ? "Explaining" : "Teaching"}</p>
                <p className="truncate text-[13px] font-medium text-slate-900" title={readingFor(step.task, step.step, done)}>
                  {step.task} · step {step.step}
                  <span className="font-normal text-slate-500"> · {done ? "done, so you get the full answer" : "hints and reasoning, no answers yet"}</span>
                </p>
              </div>
              <button onClick={() => setPinned(null)} className="focus-ring shrink-0 rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={`Stop reading ${step.task} step ${step.step}`}>
                Clear
              </button>
            </section>
          )}

          <div role="tabpanel" aria-live="polite" aria-label="Conversation" className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {msgs.length === 0 && !busy ? (
              <div data-ask="empty" className="mx-auto max-w-[440px]">
                <div className="flex flex-col items-center text-center">
                  <MentorAvatar size={64} />
                  <p className="mt-3 text-[17px] font-semibold tracking-tight text-slate-900">Hi{user?.firstName ? `, ${user.firstName}` : ""}. How can I help?</p>
                  <p className="mt-1 max-w-[320px] text-[13px] leading-snug text-slate-500">Ask about ISO/IEC 27001, GRC work or the programme. No question is too small.</p>
                </div>
                <p className="mb-2 mt-6 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#4B4F7A]">{step ? "About this step" : "Try asking"}</p>
                <ul className="grid gap-2">
                  {starters(!!step).map((q) => (
                    <li key={q}>
                      <button onClick={() => send(q)} className="focus-ring group flex w-full items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 text-left text-[13.5px] text-slate-800 ring-1 ring-[#1E1B4B]/10 transition-[box-shadow,transform] hover:shadow-[0_4px_14px_-8px_rgba(15,23,42,0.25)] hover:ring-slate-300 active:scale-[0.99]">
                        <span className="flex-1">{q}</span>
                        <Icon name="arrowRight" size={14} className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700" />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-500">
                  <Icon name="info" size={13} className="mt-px shrink-0" />
                  Software, not a person. Before a step is done it shows where to look and how to reason; once it is done it explains the full answer. Closed during a knowledge check or an exam.
                </p>
              </div>
            ) : (
              <ol className="grid gap-5">
                {msgs.map((m, i) =>
                  m.role === "learner" ? (
                    <li key={i} className="ml-10 justify-self-end rounded-2xl rounded-br-md bg-[#1E1B4B] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white shadow-[0_6px_16px_-10px_rgba(30,27,75,0.7)]">
                      <span className="sr-only">You asked: </span>
                      <span className="whitespace-pre-wrap break-words">{m.text}</span>
                    </li>
                  ) : (
                    <li key={i} data-ask="answer" data-mode={m.mode} className="flex gap-2.5">
                      <MentorAvatar size={30} className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <MachineNote label="Generated · AI mentor · not a person" className="!bg-white !p-0 [&>div:first-child]:!mb-2 [&>div:first-child]:px-3.5 [&>div:first-child]:pt-3">
                          <div className="px-3.5 pb-3">
                            {m.steps && m.steps.length > 0 && (
                              <div className="mb-2.5 flex flex-wrap gap-1.5">
                                {m.steps.map((s) => (
                                  <span key={`${s.task}-${s.step}`} className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                    <Icon name={s.mode === "teach" ? "lightbulb" : "checkCircle"} size={11} />
                                    {s.task} step {s.step} · {s.mode === "teach" ? "teaching" : "explaining"}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="whitespace-pre-wrap break-words text-[13.5px] leading-[1.65] text-slate-800">{m.text}</div>
                          </div>
                          {m.sources && m.sources.length > 0 && (
                            <div className="border-t border-dotted border-violet-200 px-3.5 py-2.5">
                              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">Where this comes from</p>
                              <ul className="flex flex-wrap gap-1.5">
                                {m.sources.map((s) => (
                                  <li key={s} className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11.5px] leading-snug text-slate-700 ring-1 ring-slate-200">
                                    <Icon name="file" size={11} className="shrink-0 text-slate-400" />
                                    <span className="break-words">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex justify-end border-t border-dotted border-violet-200 px-2 py-1">
                            <button
                              onClick={() => { void navigator.clipboard?.writeText(m.text).then(() => { setCopied(i); setTimeout(() => setCopied(-1), 1500); }, () => {}); }}
                              className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Icon name={copied === i ? "check" : "clipboard"} size={12} />
                              {copied === i ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </MachineNote>
                        {i === last && !busy && m.mode === "refused" && m.reason === "busy" && (
                          <button onClick={() => setView("report")} className="focus-ring mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-600 underline decoration-dotted underline-offset-2 hover:text-slate-900">
                            <Icon name="flag" size={13} /> Stuck and cannot wait? Report a problem
                          </button>
                        )}
                        {i === last && !busy && m.mode !== "refused" && (
                          <div data-ask="follow-ups" className="mt-2.5 flex flex-wrap gap-1.5">
                            {FOLLOW_UPS.map((q) => (
                              <button key={q} onClick={() => send(q)} className="focus-ring rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 active:scale-[0.97]">
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ),
                )}
                {busy && (
                  <li data-ask="typing" className="flex items-center gap-2.5">
                    <MentorAvatar size={30} />
                    <span className="flex items-center gap-2 rounded-xl border-2 border-dotted border-violet-300 bg-white px-3 py-2 text-[12.5px] text-slate-500">
                      <span className="sr-only">The AI mentor is writing</span>
                      <span aria-hidden className="flex gap-1">
                        {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 motion-reduce:animate-none" style={{ animationDelay: `${d * 120}ms` }} />)}
                      </span>
                      <span aria-hidden>Reading the material…</span>
                    </span>
                  </li>
                )}
              </ol>
            )}
            <div ref={end} />
          </div>

          <footer className="shrink-0 border-t border-[#1E1B4B]/10 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
            {/* The step is offered, never attached unasked */}
            {at && !step && (
              <button
                data-ask="offer-step"
                onClick={() => { setPinned(key); box.current?.focus(); }}
                className="focus-ring mb-2.5 flex w-full items-center gap-2.5 rounded-xl bg-violet-50/60 px-3 py-2 text-left ring-1 ring-violet-200 transition-colors hover:bg-violet-50"
              >
                <Icon name="target" size={15} className="shrink-0 text-violet-700" />
                <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-slate-700">
                  <strong className="font-semibold text-slate-900">Ask about {label}</strong>
                  <span className="text-slate-500"> · {isOpenStep ? "the step you have open" : "your next step"}</span>
                </span>
                <Icon name="plus" size={14} className="shrink-0 text-violet-700" />
              </button>
            )}
            {error && <p role="alert" className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700 ring-1 ring-rose-200">{error}</p>}
            <form
              onSubmit={(e) => { e.preventDefault(); void send(text); }}
              className="flex items-end gap-2 rounded-2xl bg-white p-1.5 pl-3 ring-1 ring-slate-300 transition-shadow focus-within:ring-2 focus-within:ring-violet-500/60"
            >
              <label htmlFor="ask-box" className="sr-only">Your question</label>
              <textarea
                id="ask-box"
                ref={box}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(text); } }}
                rows={2}
                maxLength={600}
                placeholder={step ? `Ask about ${step.task} step ${step.step}…` : "Ask your AI mentor…"}
                className="min-h-[44px] flex-1 resize-none bg-transparent py-1.5 text-[14px] leading-snug text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button type="submit" disabled={busy || !text.trim() || left === 0} aria-label="Send" className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E1B4B] text-white transition-[background-color,transform] hover:bg-[#2E2A6B] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35">
                <Icon name="send" size={16} />
              </button>
            </form>
            <div data-ask="usage" className="mt-2.5 flex items-center gap-2.5 text-[11.5px] text-slate-500">
              {usage && (
                <>
                  <span aria-hidden className="h-1 w-12 overflow-hidden rounded-full bg-slate-200">
                    <span className="block h-full rounded-full bg-slate-500" style={{ width: `${Math.min(100, (usage.used / Math.max(1, usage.allowance)) * 100)}%` }} />
                  </span>
                  <span className="whitespace-nowrap">{usage.used} of {usage.allowance} questions used</span>
                </>
              )}
              <button onClick={() => setView("report")} data-ask="report" className="focus-ring ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <Icon name="flag" size={12} /> Report a problem
              </button>
            </div>
          </footer>
        </>
      )}
    </aside>
  );
}

/**
 * The AI mentor's face. It is software, so it wears the machine signal (violet, dotted ring) and is drawn, never a
 * photo or a human name: an avatar that looked like a person would promise a human review the programme does not have.
 */
export function MentorAvatar({ size = 32, className = "", ring = true }: { size?: number; className?: string; ring?: boolean }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-white text-violet-700 ring-1 ring-violet-200 ${ring ? "outline-dotted outline-2 outline-offset-2 outline-violet-300" : ""} ${className}`}
    >
      <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} fill="none">
        {/* a mortarboard over a friendly robot face: a tutor, plainly not a person */}
        <path d="M16 4 4 9.5l12 5.5 12-5.5L16 4Z" fill="currentColor" />
        <path d="M26 10.5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="8.5" y="14.5" width="15" height="12" rx="5" fill="white" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="13" cy="20" r="1.6" fill="currentColor" />
        <circle cx="19" cy="20" r="1.6" fill="currentColor" />
        <path d="M13.5 23.4c1.4.9 3.6.9 5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
