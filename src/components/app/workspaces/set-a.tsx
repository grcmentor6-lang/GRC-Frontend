"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  type WorkspaceProps, useLift, seed, SectionLabel, WTextInput, WTextArea,
  GivenNote, RefBox, ScriptedExchange, SOFT, DOT, CLASS_TONE, type Tone,
} from "./kit";
import {
  getRequestConversation, routeMood, shuffleOptions,
  type RequestConversation, type ConvOption, type MoodResult,
} from "@/lib/request-conversations";
import { learnerRowOrder } from "@/lib/rua-engine";
import { userKey } from "@/lib/token";
import { getIdentifyTask, type IdentifyTask } from "@/lib/identify-tasks";
import { getXRefTask, type XRefTask } from "@/lib/xref-tasks";
import { getApplyTask, type ApplyTask } from "@/lib/apply-tasks";
import { getReviewTask, type ReviewTask } from "@/lib/review-tasks";
import { getConductTask, type ConductTask, type ConductOption, type ConductOpening } from "@/lib/conduct-tasks";
import { getPresentTask } from "@/lib/present-tasks";
import { getRecordTask, type RecordTask, type RecCol } from "@/lib/record-tasks";

const CLASS = ["Public", "Internal", "Confidential"];

/* Mirrors ai_grader.scripted_score — a guided step is scored on how cleanly you got there, so the
   mentee sees what a wrong turn cost instead of finding out from an unexplained 4.0. */
const SCRIPTED_MAX = 5, SCRIPTED_SLIP_PENALTY = 0.5, SCRIPTED_FLOOR = 3.6;
export const scriptedScore = (slips: number) =>
  Math.max(SCRIPTED_FLOOR, SCRIPTED_MAX - Math.max(0, slips) * SCRIPTED_SLIP_PENALTY);

export function RunQuality({ slips }: { slips: number }) {
  const score = scriptedScore(slips);
  const clean = slips === 0;
  return (
    <div className={`mt-3 pt-3 border-t flex items-start gap-2 ${clean ? "border-emerald-200/70" : "border-amber-200/70"}`}>
      <Icon name={clean ? "check" : "info"} size={13} className={`shrink-0 mt-px ${clean ? "text-emerald-600" : "text-amber-600"}`} />
      <p className={`text-[12px] leading-relaxed ${clean ? "text-emerald-900/80" : "text-amber-900/80"}`}>
        <strong className="font-semibold">{score.toFixed(1)} / 5</strong>{" "}
        {clean
          ? "— flawless run. Every choice right first time, so this step scores full marks."
          : `— ${slips} wrong turn${slips === 1 ? "" : "s"} along the way, ${(slips * SCRIPTED_SLIP_PENALTY).toFixed(1)} off. A run with no retries scores the full 5.`}
      </p>
    </div>
  );
}

/* ============================ REQUEST ============================ */
// Two modes: when the activity has an authored branching conversation, run the compose →
// mood-route → multi-turn flow (ScriptedRequestFlow). Otherwise fall back to the legacy
// single-shot composer so not-yet-authored Request activities keep working.
export function RequestWorkspace({ value, onChange, taskCode, activityCode }: WorkspaceProps) {
  const conv = useMemo(() => getRequestConversation(taskCode, activityCode), [taskCode, activityCode]);
  if (conv) return <ScriptedRequestFlow conv={conv} value={value} onChange={onChange} />;
  return <LegacyRequestWorkspace value={value} onChange={onChange} />;
}

/* A small mood pill for the routing banner. */
function MoodPill({ mood }: { mood: MoodResult["mood"] }) {
  const tone: Tone = mood === "cooperative" ? "emerald" : mood === "vague" ? "amber" : "rose";
  const label = mood.charAt(0).toUpperCase() + mood.slice(1);
  return <span className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11px] font-medium ring-1 ${SOFT[tone]}`}><span className={`w-1.5 h-1.5 rounded-full ${DOT[tone]}`} />{label}</span>;
}

/* A chat avatar: vivid gradient disc with a filled silhouette. Distinct look per speaker. */
function Avatar({ who, label }: { who: "you" | "stakeholder"; label?: string }) {
  const grad = who === "you" ? "from-indigo-500 to-sky-400" : "from-violet-500 to-fuchsia-500";
  return (
    <div title={label} className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} text-white flex items-center justify-center mt-0.5 shrink-0 ring-2 ring-white shadow-sm`}>
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden><circle cx="12" cy="8.5" r="3.6" /><path d="M5 19.5c0-3.4 3.1-5.3 7-5.3s7 1.9 7 5.3v.5H5z" /></svg>
    </div>
  );
}

/* A read-only stakeholder/mentee chat bubble (supports multi-paragraph text). */
function Bubble({ who, initials, text }: { who: "you" | "stakeholder"; initials: string; text: string }) {
  const mine = who === "you";
  return (
    <div className={`flex items-start gap-2.5 ${mine ? "justify-end" : ""}`}>
      {!mine && <Avatar who="stakeholder" label={initials} />}
      <div className={`rounded-2xl px-3.5 py-2 text-[12.5px] tracking-tight max-w-[82%] leading-relaxed ring-1 whitespace-pre-line ${mine ? "bg-indigo-50 ring-indigo-100 text-slate-800" : "bg-white ring-slate-200/70 text-slate-800"}`}>{text}</div>
      {mine && <Avatar who="you" label={initials} />}
    </div>
  );
}

/* A stakeholder reply that shows a "typing…" indicator for a beat before revealing the text,
   so replies feel like a live conversation. Animates once on mount. */
function TypingBubble({ initials, text, delay = 1400, onDone }: { initials: string; text: string; delay?: number; onDone?: () => void }) {
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setTyping(false); onDone?.(); }, delay);
    return () => clearTimeout(t);
    // Fire once on mount; onDone intentionally excluded so a new inline arrow prop doesn't re-run it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
  if (!typing) return <Bubble who="stakeholder" initials={initials} text={text} />;
  return (
    <div className="flex items-start gap-2.5">
      <Avatar who="stakeholder" label={initials} />
      <div className="rounded-2xl px-3.5 py-3 bg-white ring-1 ring-slate-200/70 flex items-center gap-1">
        {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
      </div>
    </div>
  );
}

function ScriptedRequestFlow({ conv, value, onChange }: { conv: RequestConversation } & Pick<WorkspaceProps, "value" | "onChange">) {
  // Graded inputs start blank — the scripted values are hints (placeholders), never pre-typed answers.
  const [to, setTo] = useState(() => seed(value, "to", ""));
  const [subject, setSubject] = useState(() => seed(value, "subject", ""));
  const [purpose, setPurpose] = useState(() => seed(value, "purpose", ""));
  const [items, setItems] = useState<string[]>(() => seed(value, "items", [] as string[]));

  // If a saved draft/submission already reached the objective, reconstruct the completed
  // conversation so the activity opens already filled in. The "met" path is deterministic per
  // mood (one correct option per round), so the mood + saved items fully restore it.
  const restored = useMemo(() => {
    if (seed<boolean>(value, "objectiveMet", false) !== true) return null;
    const savedItems = seed(value, "items", [] as string[]).filter((i) => i.trim());
    if (savedItems.length < 3) return null;
    const r = routeMood({
      subject: seed(value, "subject", ""),
      purpose: seed(value, "purpose", ""),
      items: savedItems, correctItems: conv.suggestedItems, wrongItems: conv.wrongItems,
    });
    const picks = conv.threads[r.mood].rounds.map((rd) => rd.options.find((o) => o.correct)!);
    return { routed: r, picks };
    // Restore once on mount from the initial saved value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Conversation state (post-send).
  const [routed, setRouted] = useState<MoodResult | null>(() => restored?.routed ?? null);
  const [correctPicks, setCorrectPicks] = useState<ConvOption[]>(() => restored?.picks ?? []);
  const [terminal, setTerminal] = useState<"met" | "miss" | null>(() => restored ? "met" : null);
  const [missOption, setMissOption] = useState<ConvOption | null>(null);
  const [waiting, setWaiting] = useState(false); // stakeholder reply is still "typing" — hold the next picker until it lands
  const [tried, setTried] = useState(false); // a send attempt with an incorrect item selection

  // The picker mixes correct items with plausible-but-wrong distractors, in a stable order.
  const options = useMemo(
    () => [...conv.suggestedItems, ...conv.wrongItems].sort((a, b) => a.localeCompare(b)),
    [conv],
  );
  const selected = (s: string) => items.includes(s);
  const toggle = (s: string) => setItems(selected(s) ? items.filter((i) => i !== s) : [...items, s]);

  const subjectOk = subject.length > 0 && subject.length <= 80;
  const subjectBad = subject.length > 80; // empty is "not yet filled", not an error — only over-length turns the field red
  const sel = items.filter((i) => i.trim());
  const itemsN = sel.length;
  const toOk = to.trim().length > 0;
  // Item selection must be exactly right before the conversation can start.
  const wrongSelected = conv.wrongItems.filter((w) => sel.includes(w));
  const missed = conv.suggestedItems.filter((c) => !sel.includes(c));
  const itemsCorrect = wrongSelected.length === 0 && missed.length === 0;
  const canSend = toOk && subjectOk && itemsN >= 3;

  const thread = routed ? conv.threads[routed.mood] : null;

  // The information actually gathered from the stakeholder once the objective is met — the
  // stakeholder's opener plus each reply that followed a correct decision. This is the tangible
  // deliverable that also feeds the parent task's next step.
  const capturedReply = terminal === "met" && thread
    ? [thread.opener, ...correctPicks.map((_, i) => thread.rounds[i].stakeholderNext).filter((x): x is string => !!x)]
    : [];

  useLift({ to, subject, purpose, items, mood: routed?.mood, objectiveMet: terminal === "met", captured: capturedReply.join("\n\n") || undefined }, onChange);

  const send = () => {
    if (!canSend) return;
    if (!itemsCorrect) { setTried(true); return; } // force a correct selection before continuing
    setTried(false);
    setRouted(routeMood({ subject, purpose, items: sel, correctItems: conv.suggestedItems, wrongItems: conv.wrongItems }));
    setCorrectPicks([]);
    setTerminal(null);
    setMissOption(null);
    setWaiting(true); // opener types before the first picker appears
  };

  const reset = () => {
    setRouted(null);
    setCorrectPicks([]);
    setTerminal(null);
    setMissOption(null);
    setWaiting(false);
  };

  const pick = (o: ConvOption, roundIdx: number) => {
    if (terminal || !thread) return;
    if (!o.correct) { setMissOption(o); return; } // soft miss — coach inline, keep this round open to retry
    setMissOption(null);
    const next = [...correctPicks, o];
    setCorrectPicks(next);
    if (roundIdx >= thread.rounds.length - 1) setTerminal("met");
    else if (thread.rounds[roundIdx].stakeholderNext) setWaiting(true); // hold next picker while the reply types
  };

  // ── Conversation view ──
  if (routed && thread) {
    const activeRound = terminal ? -1 : correctPicks.length; // index of the round awaiting a pick
    const cleanRequest = routed.wrongSelected.length === 0 && routed.missed.length === 0;

    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 px-3 py-2">
          <div className="flex items-start gap-2 text-[11.5px] text-slate-600 min-w-0">
            <Icon name="info" size={13} className="text-slate-400 shrink-0 mt-px" />
            <span><strong className="font-medium text-slate-700">Stakeholder mood:</strong> {routed.reason}</span>
          </div>
          <MoodPill mood={routed.mood} />
        </div>

        <div>
          <SectionLabel action={
            <button onClick={reset} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1"><Icon name="chevronLeft" size={12} />Edit request</button>
          }>Conversation · {thread.speaker}</SectionLabel>

          <div className="rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/70 p-4 space-y-2.5">
            {/* Your opening request */}
            <Bubble who="you" initials="ME" text={`${subject}\n\n${purpose}\n\nRequested:\n${items.filter((i) => i.trim()).map((i) => `• ${i}`).join("\n")}`} />

            {/* Item-selection check on the request you just sent */}
            <div className={`rounded-xl ring-1 p-3 text-[12px] space-y-2 ${cleanRequest ? "bg-emerald-50/60 ring-emerald-200" : "bg-white ring-slate-200/70"}`}>
              {cleanRequest && (
                <div className="flex items-center gap-1.5 font-medium text-emerald-800"><Icon name="check" size={13} /> You requested all the key items, and nothing out of scope.</div>
              )}
              {routed.wrongSelected.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-rose-700"><Icon name="x" size={13} /> You requested items you shouldn&apos;t have:</div>
                  <ul className="mt-1 ml-5 list-disc space-y-0.5 text-rose-900/80">{routed.wrongSelected.map((w) => <li key={w}>{w}</li>)}</ul>
                </div>
              )}
              {routed.missed.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-amber-700"><Icon name="info" size={13} /> You missed key items you should have asked for:</div>
                  <ul className="mt-1 ml-5 list-disc space-y-0.5 text-amber-900/80">{routed.missed.map((m) => <li key={m}>{m}</li>)}</ul>
                </div>
              )}
            </div>

            {/* Stakeholder opener */}
            <TypingBubble initials={thread.initials} text={thread.opener} onDone={() => setWaiting(false)} />

            {/* Resolved rounds */}
            {correctPicks.map((p, i) => (
              <div key={`r${i}`} className="space-y-2.5">
                <Bubble who="you" initials="ME" text={p.text} />
                {thread.rounds[i].stakeholderNext && <TypingBubble initials={thread.initials} text={thread.rounds[i].stakeholderNext!} onDone={() => setWaiting(false)} />}
              </div>
            ))}

            {/* A wrong pick — coached inline so the mentee retries this step, not the whole conversation */}
            {missOption && (
              <>
                <Bubble who="you" initials="ME" text={missOption.text} />
                <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 p-3 text-[12px] text-rose-900/80 leading-relaxed flex items-start gap-2">
                  <Icon name="x" size={14} className="text-rose-600 shrink-0 mt-px" />
                  <span>{missOption.coaching} <span className="font-medium text-rose-700">Choose a different reply below.</span></span>
                </div>
              </>
            )}

            {/* Active decision: choose one reply — held until the stakeholder's reply finishes typing */}
            {activeRound >= 0 && !waiting && thread.rounds[activeRound] && (
              <div className="pt-1.5">
                <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-2 text-center">{missOption ? "Try a different reply" : "Choose your reply"}</div>
                <div className="space-y-2">
                  {shuffleOptions(thread.rounds[activeRound].options).map((o, i) => (
                    <button key={o.id} onClick={() => pick(o, activeRound)}
                      className="w-full text-left rounded-xl bg-white ring-1 ring-slate-200/80 hover:ring-indigo-400 hover:bg-indigo-50/40 px-3.5 py-2.5 text-[12.5px] text-slate-800 leading-relaxed tracking-tight transition-colors flex gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-px">{"ABC"[i]}</span>
                      <span>{o.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success — show the captured deliverable, then confirm it feeds the next step */}
        {terminal === "met" && (
          <>
            <div>
              <SectionLabel hint="captured to this step">Information gathered</SectionLabel>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><Icon name="file" size={13} /></span>
                  <div className="text-[12px] font-medium text-slate-800 tracking-tight">Reply captured from {to}</div>
                </div>
                <div className="p-4 space-y-3 text-[12.5px] text-slate-800 leading-relaxed">
                  {capturedReply.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Objective met</div>
              <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">{thread.metEnd}</p>
              <p className="text-[12px] text-emerald-900/70 leading-relaxed mt-2 flex items-start gap-1.5"><Icon name="arrowRight" size={13} className="shrink-0 mt-px" /> Captured to this step and carried into the next step.</p>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Compose view (compose-with-assists) ──
  return (
    <div className="space-y-5">
      <GivenNote>Address this to <strong>{conv.recipient}</strong>. Compose a specific, well-scoped request and pick the items that belong in it — not every suggestion is appropriate. A vague or over-broad ask changes how the stakeholder responds.</GivenNote>

      <div>
        <SectionLabel>To · stakeholder (named role)</SectionLabel>
        <WTextInput value={to} onChange={setTo} placeholder={conv.recipient} />
      </div>

      <div>
        <SectionLabel hint={`${subject.length} / 80`}>Subject</SectionLabel>
        <div className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-white ring-1 ${subjectBad ? "ring-rose-300" : "ring-slate-200/80 focus-within:ring-2 focus-within:ring-indigo-500/30"}`}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A specific, scoped subject line…" className="flex-1 bg-transparent outline-none text-[13px] text-slate-900 placeholder:text-slate-400" />
          <span className={`text-[11px] tabular-nums ${subject.length > 80 ? "text-rose-600 font-medium" : "text-slate-400"}`}>{80 - subject.length}</span>
        </div>
      </div>

      <div>
        <SectionLabel>Purpose</SectionLabel>
        <WTextArea value={purpose} onChange={setPurpose} rows={3} placeholder="Why you need this and what you'll do with it…" hint={`${purpose.length} chars`} />
      </div>

      <div>
        <SectionLabel hint={`${itemsN} selected · min 3`}>Requested items</SectionLabel>
        <p className="text-[10.5px] text-slate-400 tracking-tight mb-2">Select the items that belong in this request. Some options are out of scope or inappropriate — choose carefully.</p>

        <div className="space-y-1.5">
          {options.map((s) => {
            const sel = selected(s);
            return (
              <button key={s} onClick={() => toggle(s)}
                className={`w-full text-left rounded-lg px-3 py-2 text-[12.5px] leading-relaxed flex items-start gap-2.5 ring-1 transition-colors ${sel ? "bg-indigo-50 ring-indigo-300 text-slate-900" : "bg-white ring-slate-200/80 text-slate-700 hover:ring-indigo-300 hover:bg-indigo-50/30"}`}>
                <span className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center ring-1 ${sel ? "bg-indigo-600 ring-indigo-600 text-white" : "bg-white ring-slate-300"}`}>{sel && <Icon name="check" size={11} />}</span>
                <span>{s}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Re-select prompt: a send attempt with a wrong/missing selection — must be fixed to continue */}
      {tried && !itemsCorrect && (
        <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4 text-[12px] space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-rose-800"><Icon name="x" size={13} /> Fix your selection before sending</div>
          {wrongSelected.length > 0 && (
            <div>
              <div className="font-medium text-rose-700">Remove these — they don&apos;t belong in this request:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-rose-900/80">{wrongSelected.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}
          {missed.length > 0 && (
            <div>
              <div className="font-medium text-amber-700">Add these — they&apos;re needed:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-amber-900/80">{missed.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-slate-400 tracking-tight">
          {canSend ? "Select the right items, then send — the stakeholder won't engage with a wrong or incomplete request." : "Complete the request: named recipient · subject ≤ 80 · ≥ 3 items."}
        </p>
        <button onClick={send} disabled={!canSend}
          className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0">
          <Icon name="arrowUpRight" size={14} /> Send request
        </button>
      </div>
    </div>
  );
}

/* Legacy single-shot composer — fallback for Request activities not yet authored as a branching flow. */
function LegacyRequestWorkspace({ value, onChange }: Pick<WorkspaceProps, "value" | "onChange">) {
  const [to, setTo] = useState(() => seed(value, "to", ""));
  const [subject, setSubject] = useState(() => seed(value, "subject", ""));
  const [purpose, setPurpose] = useState(() => seed(value, "purpose", ""));
  const [items, setItems] = useState<string[]>(() => seed(value, "items", ["", "", ""]));

  const subjectBad = subject.length > 80; // empty is "not yet filled", not an error — only over-length turns the field red
  const itemsN = items.filter((i) => i.trim()).length;
  // The verb's own acceptance criteria: named recipient · subject ≤ 80 · ≥ 3 requested items.
  const ready = !!to.trim() && !!subject.trim() && !subjectBad && !!purpose.trim() && itemsN >= 3;
  useLift({ to, subject, purpose, items, ready }, onChange);

  return (
    <div className="space-y-5">
      <GivenNote>The reference documents are pre-set for this engagement. Write a specific, well-scoped request — a vague ask gets ignored.</GivenNote>

      <div>
        <SectionLabel>To · stakeholder (named role) <span className="text-rose-500">*</span></SectionLabel>
        <WTextInput value={to} onChange={setTo} placeholder="e.g. IT Operations Lead" />
      </div>

      <div>
        <SectionLabel hint={`${subject.length} / 80`}>Subject <span className="text-rose-500">*</span></SectionLabel>
        <div className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-white ring-1 ${subjectBad ? "ring-rose-300" : "ring-slate-200/80 focus-within:ring-2 focus-within:ring-indigo-500/30"}`}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A specific, scoped subject line…" className="flex-1 bg-transparent outline-none text-[13px] text-slate-900 placeholder:text-slate-400" />
          <span className={`text-[11px] tabular-nums ${subject.length > 80 ? "text-rose-600 font-medium" : "text-slate-400"}`}>{80 - subject.length}</span>
        </div>
      </div>

      <div>
        <SectionLabel>Purpose <span className="text-rose-500">*</span></SectionLabel>
        <WTextArea value={purpose} onChange={setPurpose} rows={3} placeholder="Why you need this and what you'll do with it…" hint={`${purpose.length} chars`} />
      </div>

      <div>
        <SectionLabel hint={`${itemsN} of min 3`} action={
          <button onClick={() => setItems([...items, ""])} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="plus" size={12} />Add item</button>
        }>Requested items</SectionLabel>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-6 h-9 flex items-center justify-center text-[11.5px] font-mono text-slate-400">{i + 1}.</span>
              <input value={it} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }} placeholder="An item you need from them…"
                className="flex-1 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[13px] text-slate-900 placeholder:text-slate-400" />
              {items.length > 3 && (
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"><Icon name="x" size={14} /></button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ScriptedExchange title="Stakeholder response (pre-scripted)" turns={[
        { who: "you", initials: "AS", text: subject || "(your request subject)" },
        { who: "stakeholder", initials: "LC", text: "Happy to help. Active EU presence in DE, FR, IE, NL. We also process payments in CH but don't store data there. Schrems II remains live — I'll send the latest TIA template separately. DSA Article 28 obligations land for us in Q3." },
      ]} />
    </div>
  );
}

/* ============================ CONDUCT ============================ */
// Data-driven Conduct: pick an opening approach (sets the interviewee's disposition) → run the scripted
// interview, probing with 1-of-3 choices. Objective met only via the correct probe.
export function ConductWorkspace({ value, onChange, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getConductTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedConductFlow task={task} value={value} onChange={onChange} />;
  return <LegacyConductWorkspace value={value} onChange={onChange} />;
}

export function ScriptedConductFlow({ task, value, onChange }: { task: ConductTask } & Pick<WorkspaceProps, "value" | "onChange">) {
  const restored = useMemo(() => {
    if (seed<boolean>(value, "objectiveMet", false) !== true) return null;
    const op = task.openings.find((o) => o.id === seed(value, "openingId", ""));
    if (!op) return null;
    const picks = task.threads[op.routesTo].rounds.map((rd) => rd.options.find((o) => o.correct)!);
    return { opening: op, picks };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [opening, setOpening] = useState<ConductOpening | null>(() => restored?.opening ?? null);
  const [correctPicks, setCorrectPicks] = useState<ConductOption[]>(() => restored?.picks ?? []);
  const [terminal, setTerminal] = useState<"met" | "miss" | null>(() => restored ? "met" : null);
  const [missOption, setMissOption] = useState<ConductOption | null>(null);
  const [waiting, setWaiting] = useState(false); // interviewee reply is still "typing" — hold the next picker until it lands
  // Every wrong turn the flow coached them through. Since each choice is retried until correct, this
  // is the only thing that varies between two completed runs — and so the only thing the
  // deterministic grade can score. Reaching the objective with 0 slips is full marks.
  const [slips, setSlips] = useState(() => seed(value, "slips", 0));

  const thread = opening ? task.threads[opening.routesTo] : null;
  const captured = terminal === "met" && thread
    ? [thread.opener, ...correctPicks.map((_, i) => thread.rounds[i].stakeholderNext).filter((x): x is string => !!x)]
    : [];
  // `scripted` tells the backend there is no mentee-authored prose here — every choice is forced
  // correct and `captured` is the stakeholder's scripted reply — so it grades this deterministically
  // instead of asking an LLM to score its own script. See layer1_checks / ai_grader.
  useLift({ scripted: true, roleAgent: task.roleAgent, openingId: opening?.id, disposition: opening?.routesTo, objectiveMet: terminal === "met", slips, captured: captured.join("\n\n") || undefined }, onChange);

  // Re-opening keeps the slip count: starting over is a legitimate way to explore, not a way to
  // erase a wrong turn you were already coached on.
  const reset = () => { setOpening(null); setCorrectPicks([]); setTerminal(null); setMissOption(null); setWaiting(false); };
  const pickOpening = (o: ConductOpening) => {
    if (!o.correct) setSlips((n) => n + 1); // a weak opening sets a worse disposition — that's a wrong turn
    setOpening(o); setCorrectPicks([]); setTerminal(null); setMissOption(null); setWaiting(true);
  };
  const pick = (o: ConductOption, roundIdx: number) => {
    if (terminal || !thread) return;
    if (!o.correct) { setMissOption(o); setSlips((n) => n + 1); return; } // soft miss — coach inline, keep this round open to retry
    setMissOption(null);
    const next = [...correctPicks, o];
    setCorrectPicks(next);
    if (roundIdx >= thread.rounds.length - 1) setTerminal("met");
    else if (thread.rounds[roundIdx].stakeholderNext) setWaiting(true); // hold next picker while the reply types
  };

  // ── Opening view ──
  if (!opening) {
    return (
      <div className="space-y-5">
        {task.prep ? (
          <>
            <GivenNote>Presenting <strong>{task.interview}</strong> to the <strong>{task.roleAgent}</strong> for sign-off. Your deck and anticipated Q&A are prepared below — choose how to open the pitch; your framing sets the senior&apos;s disposition.</GivenNote>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 space-y-3">
              <div>
                <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-1">Deck summary</div>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">{task.prep.deck}</p>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-1">Anticipated Q&amp;A (prepared)</div>
                <ul className="space-y-1.5">{task.prep.qa.map((q, i) => <li key={i} className="text-[12px] text-slate-600 whitespace-pre-line border-l-2 border-slate-200 pl-2.5">{q}</li>)}</ul>
              </div>
            </div>
          </>
        ) : (
          <GivenNote>You&apos;re interviewing the <strong>{task.roleAgent}</strong> ({task.interview}). Choose how to open — your approach sets how forthcoming they are.</GivenNote>
        )}
        <div>
          <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-2 text-center">Choose your opening</div>
          <div className="space-y-2">
            {shuffleOptions(task.openings).map((o, i) => (
              <button key={o.id} onClick={() => pickOpening(o)}
                className="w-full text-left rounded-xl bg-white ring-1 ring-slate-200/80 hover:ring-indigo-400 hover:bg-indigo-50/40 px-3.5 py-2.5 text-[12.5px] text-slate-800 leading-relaxed tracking-tight transition-colors flex gap-2.5">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-px">{"ABC"[i]}</span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Interview view ──
  const activeRound = terminal ? -1 : correctPicks.length;
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 px-3 py-2">
        <div className="flex items-start gap-2 text-[11.5px] text-slate-600 min-w-0">
          <Icon name="info" size={13} className="text-slate-400 shrink-0 mt-px" />
          <span><strong className="font-medium text-slate-700">Interviewee disposition:</strong> your opening set a {opening.routesTo} interviewee.{!opening.correct && opening.coaching ? ` ${opening.coaching}` : ""}</span>
        </div>
        <MoodPill mood={opening.routesTo} />
      </div>

      <div>
        <SectionLabel action={
          <button onClick={reset} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1"><Icon name="chevronLeft" size={12} />Re-open</button>
        }>Interview · {thread!.speaker}</SectionLabel>
        <div className="rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/70 p-4 space-y-2.5">
          <Bubble who="you" initials="ME" text={opening.text} />
          <TypingBubble initials={thread!.initials} text={thread!.opener} onDone={() => setWaiting(false)} />
          {correctPicks.map((p, i) => (
            <div key={`r${i}`} className="space-y-2.5">
              <Bubble who="you" initials="ME" text={p.text} />
              {thread!.rounds[i].stakeholderNext && <TypingBubble initials={thread!.initials} text={thread!.rounds[i].stakeholderNext!} onDone={() => setWaiting(false)} />}
            </div>
          ))}
          {missOption && (
            <>
              <Bubble who="you" initials="ME" text={missOption.text} />
              <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 p-3 text-[12px] text-rose-900/80 leading-relaxed flex items-start gap-2">
                <Icon name="x" size={14} className="text-rose-600 shrink-0 mt-px" />
                <span>{missOption.coaching} <span className="font-medium text-rose-700">Choose a different probe below.</span></span>
              </div>
            </>
          )}
          {activeRound >= 0 && !waiting && thread!.rounds[activeRound] && (
            <div className="pt-1.5">
              <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-2 text-center">{missOption ? "Try a different probe" : "Choose your probe"}</div>
              <div className="space-y-2">
                {shuffleOptions(thread!.rounds[activeRound].options).map((o, i) => (
                  <button key={o.id} onClick={() => pick(o, activeRound)}
                    className="w-full text-left rounded-xl bg-white ring-1 ring-slate-200/80 hover:ring-indigo-400 hover:bg-indigo-50/40 px-3.5 py-2.5 text-[12.5px] text-slate-800 leading-relaxed tracking-tight transition-colors flex gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-px">{"ABC"[i]}</span>
                    <span>{o.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {terminal === "met" && (
        <>
          <div>
            <SectionLabel hint="captured to this step">Interview notes</SectionLabel>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 space-y-3 text-[12.5px] text-slate-800 leading-relaxed">
              {captured.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Objective met</div>
            <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">{task.metEnd}</p>
            <RunQuality slips={slips} />
          </div>
        </>
      )}
    </div>
  );
}

function LegacyConductWorkspace({ value, onChange }: Pick<WorkspaceProps, "value" | "onChange">) {
  const script = [
    { q: "Walk me through how new vendors are added to the procurement list.", a: "We use the Vendor Intake form in ServiceNow. Procurement triages within 2 days; Security gets a copy if the vendor processes data." },
    { q: "Who approves vendors classified as 'data processor'?", a: "Depends on data class. Internal: VP Procurement. Confidential / personal data: DPO + Security Eng. Lead." },
    { q: "How often is the vendor inventory reviewed?", a: "Quarterly by Procurement. Security re-attests the security-relevant fields annually." },
    { q: "What happens when a vendor's certifications lapse?", a: "Honestly the workflow isn't great — we get an alert from the cert-tracker, but follow-through is inconsistent." },
    { q: "How is sub-processor disclosure handled?", a: "Contractually required, but we don't have a routine cadence to re-check the published list." },
  ];
  const stakeholder = "Compliance Lead";
  const [activeQ, setActiveQ] = useState(0);
  const [findings, setFindings] = useState(() => seed(value, "findings", ""));
  // The walkthrough is pre-scripted; the key findings are the only mentee-authored field.
  useLift({ stakeholder, questionsAnswered: `${script.length} / ${script.length}`, findings, ready: findings.trim().length >= 30 }, onChange);

  return (
    <div className="space-y-5">
      <GivenNote>The structured walkthrough with the <strong>{stakeholder}</strong> has been run — the transcript below is pre-scripted. Read it, then capture your key findings.</GivenNote>

      <div>
        <SectionLabel hint={`${script.length} / ${script.length} answered`}>Walkthrough · {stakeholder}</SectionLabel>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden grid grid-cols-1 sm:grid-cols-[240px_1fr]">
          {/* Interview guide */}
          <div className="border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/40">
            <div className="px-4 py-2.5 border-b border-slate-100 text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500">Interview Guide</div>
            {script.map((s, i) => (
              <button key={i} onClick={() => setActiveQ(i)} className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left border-b border-slate-100 last:border-0 transition-colors ${activeQ === i ? "bg-white" : "hover:bg-white/60"}`}>
                <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-0.5"><Icon name="check" size={11} strokeWidth={3} /></span>
                <span className={`text-[12px] leading-snug tracking-tight ${activeQ === i ? "text-slate-900 font-medium" : "text-slate-600"}`}>{s.q}</span>
              </button>
            ))}
          </div>
          {/* Dialogue (read-only — scripted) */}
          <div className="flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10.5px] font-semibold">CL</div>
              <div>
                <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{stakeholder}</div>
                <div className="text-[10.5px] text-slate-500 font-mono">structured walkthrough · pre-scripted</div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10.5px] font-semibold mt-0.5 shrink-0">AS</div>
                <div className="rounded-2xl bg-indigo-50 px-3.5 py-2 text-[12.5px] text-slate-800 tracking-tight max-w-[85%]">{script[activeQ].q}</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10.5px] font-semibold mt-0.5 shrink-0">CL</div>
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 px-3.5 py-2 text-[12.5px] text-slate-800 tracking-tight max-w-[85%] leading-relaxed">{script[activeQ].a}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel hint={`${findings.length} chars · min 30`}>Key findings <span className="text-rose-500">*</span></SectionLabel>
        <WTextArea value={findings} onChange={setFindings} rows={4} placeholder="Summarise the most important findings, the biggest gap, and a recommended follow-up." />
      </div>
    </div>
  );
}

/* ============================ RECORD ============================ */
type RegRow = { name: string; type: string; owner: string; c: string; i: string; a: string; loc: string; rationale: string };
// Data-driven Record: enter rows into an authoritative register, gated on Layer-1 deterministic
// validation (mandatory · ID format · controlled vocab · owner-is-a-role · no dup IDs · pass↔score).
export function RecordWorkspace({ value, onChange, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getRecordTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedRecordFlow task={task} value={value} onChange={onChange} />;
  return <LegacyRecordWorkspace value={value} onChange={onChange} />;
}

type RecRow = Record<string, string>;
function ScriptedRecordFlow({ task, value, onChange }: { task: RecordTask } & Pick<WorkspaceProps, "value" | "onChange">) {
  const blank = (): RecRow => Object.fromEntries(task.columns.map((c) => [c.key, ""]));
  const [rows, setRows] = useState<RecRow[]>(() => seed(value, "rows", Array.from({ length: task.requiredRows }, blank)));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const started = (r: RecRow) => task.columns.some((c) => (r[c.key] ?? "").trim());
  const DEPT = /\b(department|dept|team|division|unit|group|function)\b/i;
  const colError = (r: RecRow, c: RecCol): string | null => {
    const v = (r[c.key] ?? "").trim();
    const req = c.required || (c.condReq && r[c.condReq.key] === c.condReq.equals);
    if (req && !v) return "required";
    if (!v) return null;
    if (c.idFormat && !new RegExp(c.idFormat.pattern).test(v)) return `format ${c.idFormat.example}`;
    if (c.notDepartment && DEPT.test(v)) return "must be a role, not a department/team";
    return null;
  };
  const rowErrors = (r: RecRow): string[] => {
    const errs = task.columns.map((c) => { const e = colError(r, c); return e ? `${c.label}: ${e}` : null; }).filter(Boolean) as string[];
    if (task.passRule) {
      const p = r[task.passRule.passKey], s = r[task.passRule.scoreKey];
      if (p && s !== "" && s != null) {
        const ok = (p === "Pass") === (Number(s) >= task.passRule.threshold);
        if (!ok) errs.push(`Pass/Fail must match score (${task.passRule.threshold}%+ = Pass)`);
      }
    }
    return errs;
  };
  const startedRows = rows.filter(started);
  const dupCols = task.columns.filter((c) => c.unique);
  const dupValues = (key: string) => { const counts: Record<string, number> = {}; startedRows.forEach((r) => { const v = (r[key] ?? "").trim(); if (v) counts[v] = (counts[v] ?? 0) + 1; }); return new Set(Object.entries(counts).filter(([, n]) => n > 1).map(([v]) => v)); };
  const dupSets = Object.fromEntries(dupCols.map((c) => [c.key, dupValues(c.key)]));
  const rowDup = (r: RecRow) => dupCols.some((c) => dupSets[c.key].has((r[c.key] ?? "").trim()));
  const rowOk = (r: RecRow) => rowErrors(r).length === 0 && !rowDup(r);
  const objectiveMet = startedRows.length >= task.requiredRows && startedRows.every(rowOk);
  useLift({ register: task.registerName, rows, objectiveMet }, onChange);

  const set = (i: number, k: string, v: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, blank()]);
  const delRow = (i: number) => setRows((rs) => rs.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <GivenNote>
        {task.source ? (
          <>Transcribe the entries from <strong>{task.source}</strong> — open it from the document card above this deliverable — into the <strong>{task.registerName}</strong>, one row per distinct item.{" "}</>
        ) : (
          <>Record each entry into the <strong>{task.registerName}</strong>.{" "}</>
        )}
        Mandatory fields are marked *; IDs must match the format, owners must be a role (not a department), and no IDs may repeat. Submission unlocks at {task.requiredRows}+ valid rows.
      </GivenNote>
      <SectionLabel hint={task.standard} action={
        <button onClick={addRow} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="plus" size={12} />Add row</button>
      }>{task.title} · {startedRows.filter(rowOk).length}/{task.requiredRows} valid</SectionLabel>

      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/60 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
              {task.columns.map((c) => <th key={c.key} className="px-2 py-2 font-semibold">{c.label}{c.required ? <span className="text-rose-500"> *</span> : null}</th>)}
              <th className="px-2 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const bad = checked && started(r) && !rowOk(r);
              return (
                <tr key={i} className={`border-t border-slate-100 align-top ${bad ? "bg-rose-50/60" : ""}`}>
                  {task.columns.map((c) => {
                    const condHide = c.condReq && r[c.condReq.key] !== c.condReq.equals;
                    return (
                      <td key={c.key} className="px-2 py-1.5">
                        {condHide ? <span className="text-[11px] text-slate-300 italic">—</span> : c.type === "select" ? (
                          <select value={r[c.key] ?? ""} onChange={(e) => set(i, c.key, e.target.value)} className="w-full h-8 px-1.5 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[11.5px]"><option value="">—</option>{c.options!.map((o) => <option key={o}>{o}</option>)}</select>
                        ) : (
                          <input type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"} value={r[c.key] ?? ""} onChange={(e) => set(i, c.key, e.target.value)} placeholder={c.idFormat?.example ?? ""}
                            className="w-full h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[11.5px] min-w-[90px]" />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5">{rows.length > task.requiredRows && <button onClick={() => delRow(i)} className="w-7 h-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"><Icon name="x" size={13} /></button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">{objectiveMet ? "Register valid — ready to submit." : "Fill the mandatory fields; IDs/owners must follow the rules."}</p>
        <button onClick={() => setChecked(true)} className="h-8 px-3 rounded-lg text-[12px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"><Icon name="check" size={13} />Check register</button>
      </div>

      {checked && !objectiveMet && (
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 text-[12px] space-y-1.5">
          {startedRows.length < task.requiredRows && <div className="text-amber-700 font-medium flex items-center gap-1.5"><Icon name="info" size={13} /> Record at least {task.requiredRows} rows ({startedRows.length} so far).</div>}
          {rows.map((r, i) => { if (!started(r) || rowOk(r)) return null; const errs = [...rowErrors(r), ...(rowDup(r) ? ["duplicate value"] : [])]; return (
            <div key={i} className="flex items-start gap-1.5 text-rose-700"><Icon name="x" size={12} className="mt-0.5 shrink-0" /><span>Row {i + 1}: {errs.join(" · ")}</span></div>
          ); })}
        </div>
      )}

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Register valid</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">{startedRows.length} rows recorded, all schema-valid with no duplicates. {task.feedsNext}</p>
        </div>
      )}
    </div>
  );
}

function LegacyRecordWorkspace({ value, onChange }: Pick<WorkspaceProps, "value" | "onChange">) {
  // Asset name / type / location are the given intake data; owner, C-I-A and rationale are the
  // mentee's to fill in.
  const [rows, setRows] = useState<RegRow[]>(() => seed(value, "register", [
    { name: "orders-db (RDS)", type: "Database", owner: "", c: "", i: "", a: "", loc: "AWS us-east-1", rationale: "" },
    { name: "Production K8s", type: "Infra", owner: "", c: "", i: "", a: "", loc: "AWS us-east-1", rationale: "" },
    { name: "Snowflake warehouse", type: "Data store", owner: "", c: "", i: "", a: "", loc: "AWS us-west-2", rationale: "" },
    { name: "Stripe Connect", type: "Third party", owner: "", c: "", i: "", a: "", loc: "External", rationale: "" },
  ]));
  const needsRationale = (r: RegRow) => r.c === "High" || r.c === "Confidential";
  // Asset name / type / location are given; the owner, C-I-A and rationale are the mentee's.
  const ready = rows.every((r) => r.owner && r.c && r.i && r.a && (!needsRationale(r) || r.rationale.trim()));
  useLift({ register: rows, ready }, onChange);
  const set = (ri: number, k: keyof RegRow, v: string) => setRows((rs) => rs.map((r, i) => (i === ri ? { ...r, [k]: v } : r)));
  const owners = ["Data Platform Lead", "Head of Platform", "Security Eng. Lead", "Security Ops", "Compliance Lead"];

  return (
    <div className="space-y-4">
      <GivenNote>The register is pre-populated from intake. Every row needs an owner and all three C-I-A values; the owner must be a <strong>role</strong> (not a department), and High/Confidential assets need a rationale.</GivenNote>
      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
          <thead className="bg-slate-50/60 border-b border-slate-100">
            <tr className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500">
              {["Asset", "Type", "Owner (role)", "C", "I", "A", "Location", "Rationale"].map((h) => <th key={h} className="px-3 py-2 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-slate-50 last:border-0 align-top">
                <td className="px-3 py-2.5 text-[12.5px] font-medium text-slate-900">{r.name}</td>
                <td className="px-3 py-2.5 text-[12px] text-slate-600">{r.type}</td>
                <td className="px-3 py-2.5">
                  <select value={r.owner} onChange={(e) => set(ri, "owner", e.target.value)} className="h-8 px-2 rounded-md text-[12px] outline-none ring-1 ring-slate-200/80 bg-white focus:ring-2 focus:ring-indigo-500/40">
                    <option value="">Required…</option>
                    {owners.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </td>
                {(["c", "i", "a"] as const).map((k) => (
                  <td key={k} className="px-2 py-2.5">
                    <select value={r[k]} onChange={(e) => set(ri, k, e.target.value)} className={`h-8 px-1.5 rounded-md text-[11px] font-medium outline-none ring-1 ring-inset focus:ring-2 focus:ring-indigo-500/40 ${CLASS_TONE[r[k]] ?? "bg-white ring-slate-200/80"}`}>
                      <option value="">—</option>
                      {["Low", "Medium", "High", "Confidential"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                ))}
                <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">{r.loc}</td>
                <td className="px-2 py-2.5 max-w-[220px]">
                  {needsRationale(r) ? (
                    <input value={r.rationale} onChange={(e) => set(ri, "rationale", e.target.value)} placeholder={`Required for ${r.c}`}
                      className={`w-full h-8 px-2 rounded-md text-[12px] outline-none ring-1 ${r.rationale ? "ring-slate-200/80 bg-white" : "ring-rose-300 bg-rose-50/40 placeholder:text-rose-400"} focus:ring-2 focus:ring-indigo-500/40`} />
                  ) : <span className="text-[12px] text-slate-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================ APPLY ============================ */
type ApplyItem = { name: string; contains: string; classification: string; rationale: string };
// Data-driven Apply: apply the task's scheme to each item — pick an outcome from the vocabulary and
// add the required note. Submission is gated on every outcome matching the answer key.
export function ApplyWorkspace({ value, onChange, openRef, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getApplyTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedApplyFlow task={task} value={value} onChange={onChange} taskCode={taskCode!} activityCode={activityCode!} />;
  return <LegacyApplyWorkspace value={value} onChange={onChange} openRef={openRef} />;
}

export function ScriptedApplyFlow({ task, value, onChange, taskCode, activityCode }: { task: ApplyTask; taskCode: string; activityCode: string } & Pick<WorkspaceProps, "value" | "onChange">) {
  // Shared by Apply and Map. Learner-specific row order; the outcome key rides on each row.
  const rows = useMemo(() => learnerRowOrder(task.rows, userKey(), taskCode, activityCode), [task.rows, taskCode, activityCode]);
  const [outcomeByRow, setOutcomeByRow] = useState<Record<number, string>>(() => seed(value, "outcomes", {} as Record<number, string>));
  const [noteByRow, setNoteByRow] = useState<Record<number, string>>(() => seed(value, "notes", {} as Record<number, string>));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const showNoteCol = task.noteMode !== "none";
  const noteRequired = (id: number) => {
    if (task.noteMode === "all") return true;
    if (task.noteMode === "nonClean") { const o = outcomeByRow[id]; return !!o && o !== task.clean; }
    return false;
  };
  const noteShown = (id: number) => task.noteMode === "all" || (task.noteMode === "nonClean" && !!outcomeByRow[id] && outcomeByRow[id] !== task.clean);

  const unsetIds = rows.filter((r) => !outcomeByRow[r.id]).map((r) => r.id);
  const wrongIds = rows.filter((r) => outcomeByRow[r.id] && outcomeByRow[r.id] !== r.outcome).map((r) => r.id);
  const missingNoteIds = rows.filter((r) => noteRequired(r.id) && !(noteByRow[r.id] ?? "").trim()).map((r) => r.id);
  const outcomesAllCorrect = rows.every((r) => outcomeByRow[r.id] === r.outcome);
  const objectiveMet = outcomesAllCorrect && missingNoteIds.length === 0;

  const results = rows.map((r) => ({ item: r.cells[0], outcome: outcomeByRow[r.id] ?? "", note: noteByRow[r.id] ?? "" }));
  useLift({ outcomes: outcomeByRow, notes: noteByRow, results, objectiveMet }, onChange);

  const setOutcome = (id: number, v: string) => setOutcomeByRow((o) => ({ ...o, [id]: v }));
  const setNote = (id: number, v: string) => setNoteByRow((n) => ({ ...n, [id]: v }));
  const label = (id: number) => { const r = rows.find((x) => x.id === id); return r ? r.cells[r.cells.length > 1 ? 1 : 0] : `#${id}`; };
  const correct = (id: number) => rows.find((r) => r.id === id)?.outcome ?? "";

  return (
    <div className="space-y-4">
      <GivenNote>Apply the scheme to <strong>every</strong> item — pick the outcome from the dropdown{showNoteCol ? <> and add the {task.noteLabel?.toLowerCase()} where needed</> : null}. Submission unlocks once every outcome matches the scheme.</GivenNote>

      <div>
        <SectionLabel hint={task.standard}>{task.title}</SectionLabel>
        <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
                {task.columns.map((c) => <th key={c} className="px-3 py-2 font-semibold">{c}</th>)}
                <th className="px-3 py-2 font-semibold w-[160px]">Outcome</th>
                {showNoteCol && <th className="px-3 py-2 font-semibold w-[32%]">{task.noteLabel}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const chosen = outcomeByRow[r.id] ?? "";
                const wrong = checked && chosen && chosen !== r.outcome;
                const unset = checked && !chosen;
                const rowTone = wrong ? "bg-rose-50/70" : unset ? "bg-amber-50/70" : "";
                return (
                  <tr key={r.id} className={`border-t border-slate-100 align-top ${rowTone}`}>
                    {r.cells.map((c, ci) => <td key={ci} className={`px-3 py-2 text-[12px] ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"}`}>{c || <span className="text-slate-300 italic">—</span>}</td>)}
                    <td className="px-3 py-2">
                      <select value={chosen} onChange={(e) => setOutcome(r.id, e.target.value)} className="w-full h-8 px-1.5 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[11.5px]">
                        <option value="">— pick —</option>
                        {task.outcomes.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    {showNoteCol && (
                      <td className="px-3 py-2">
                        {noteShown(r.id) ? <input value={noteByRow[r.id] ?? ""} onChange={(e) => setNote(r.id, e.target.value)} placeholder={`${task.noteLabel}…`} className="w-full h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px]" /> : <span className="text-[11px] text-slate-300 italic">—</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex justify-end">
          <button onClick={() => setChecked(true)} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="check" size={12} />Check answers</button>
        </div>
      </div>

      {checked && !objectiveMet && (
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 text-[12px] space-y-2">
          {wrongIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-rose-700"><Icon name="x" size={13} /> Wrong outcome on these — reconsider:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-rose-900/80">{wrongIds.map((id) => <li key={id}>{label(id)} — should be <strong>{correct(id)}</strong></li>)}</ul>
            </div>
          )}
          {unsetIds.length > 0 && (
            <div className="text-amber-700 font-medium flex items-center gap-1.5"><Icon name="info" size={13} /> {unsetIds.length} item{unsetIds.length > 1 ? "s" : ""} still need an outcome.</div>
          )}
          {missingNoteIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700"><Icon name="info" size={13} /> Add the {task.noteLabel?.toLowerCase()} to:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-slate-600">{missingNoteIds.map((id) => <li key={id}>{label(id)}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Scheme applied correctly</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">All {rows.length} items match the scheme{showNoteCol ? `, each with ${task.noteMode === "all" ? "a" : "its"} ${task.noteLabel?.toLowerCase()}` : ""}. {task.feedsNext}</p>
        </div>
      )}
    </div>
  );
}

function LegacyApplyWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  // Asset name + contents are given; the classification and its rationale are the mentee's call.
  const [items, setItems] = useState<ApplyItem[]>(() => seed(value, "items", [
    { name: "orders-db (RDS)", contains: "Order PII + email", classification: "", rationale: "" },
    { name: "Production K8s", contains: "App workloads", classification: "", rationale: "" },
    { name: "Marketing CMS", contains: "Public copy", classification: "", rationale: "" },
    { name: "Snowflake warehouse", contains: "Derived analytics", classification: "", rationale: "" },
    { name: "Internal R&D sandbox", contains: "Synthetic data", classification: "", rationale: "" },
  ]));
  const [step, setStep] = useState(0);
  // Asset name + contents are given; the classification and its rationale are the mentee's call.
  useLift({ items, ready: items.every((it) => !!it.classification && !!it.rationale.trim()) }, onChange);
  const cur = items[step];
  const set = (k: keyof ApplyItem, v: string) => setItems((is) => is.map((it, i) => (i === step ? { ...it, [k]: v } : it)));
  const tone = (c: string): Tone => (!c ? "slate" : c === "Public" ? "emerald" : c === "Internal" ? "amber" : "rose");

  return (
    <div className="space-y-4">
      <GivenNote>Apply the three-tier scheme to <strong>every</strong> asset — use the list on the right to move between them. Each needs a classification and a rationale. Personal-data items must never be Public. <button onClick={() => openRef("ws-classification-scheme")} className="text-indigo-600 hover:underline font-medium">Open the scheme →</button></GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-slate-500">Item {step + 1} of {items.length}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Icon name="chevronLeft" size={14} /></button>
              <button onClick={() => setStep(Math.min(items.length - 1, step + 1))} disabled={step === items.length - 1} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Icon name="chevronRight" size={14} /></button>
            </div>
          </div>
          <div className="px-5 py-5">
            <div className="text-[10.5px] tracking-[0.12em] uppercase text-slate-400">Asset</div>
            <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-slate-900">{cur.name}</h3>
            <div className="mt-1 text-[12.5px] text-slate-500">Contains: <span className="text-slate-700">{cur.contains}</span></div>
            <div className="mt-4">
              <div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-2">Classification</div>
              <div className="flex gap-2">
                {CLASS.map((o) => {
                  const active = cur.classification === o;
                  return (
                    <button key={o} onClick={() => set("classification", o)} className={`flex-1 h-11 rounded-xl text-[13px] font-medium tracking-tight transition-all ring-1 ${active ? `${SOFT[tone(o)]} ring-inset` : "bg-white ring-slate-200/80 text-slate-600 hover:ring-slate-300"}`}>{o}</button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-1.5">Rationale <span className="text-rose-500">*</span></div>
              <textarea value={cur.rationale} onChange={(e) => set("rationale", e.target.value)} rows={2} placeholder="Why this tier, for this asset…" className="w-full px-3 py-2 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px] resize-none placeholder:text-slate-400" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
          <h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-3">Items</h4>
          <div className="space-y-1.5">
            {items.map((it, i) => (
              <button key={i} onClick={() => setStep(i)} className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${i === step ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                <span className="text-[12px] text-slate-700 tracking-tight truncate flex-1">{it.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${DOT[tone(it.classification)]}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ CROSS-REFERENCE ============================ */
// Data-driven Cross-Reference: assign a status to every row from the task's vocabulary and give
// each discrepancy a corrective action. Submission is gated on matching the answer-key statuses.
export function CrossRefWorkspace({ value, onChange, openRef, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getXRefTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedXRefFlow task={task} value={value} onChange={onChange} taskCode={taskCode!} activityCode={activityCode!} />;
  return <LegacyCrossRefWorkspace value={value} onChange={onChange} openRef={openRef} />;
}

function ScriptedXRefFlow({ task, value, onChange, taskCode, activityCode }: { task: XRefTask; taskCode: string; activityCode: string } & Pick<WorkspaceProps, "value" | "onChange">) {
  // Learner-specific row order — the status key rides on each row, so validation is unchanged.
  const rows = useMemo(() => learnerRowOrder(task.rows, userKey(), taskCode, activityCode), [task.rows, taskCode, activityCode]);
  const [method, setMethod] = useState(() => seed(value, "method", ""));
  const [statusByRow, setStatusByRow] = useState<Record<number, string>>(() => seed(value, "statuses", {} as Record<number, string>));
  const [actionByRow, setActionByRow] = useState<Record<number, string>>(() => seed(value, "actions", {} as Record<number, string>));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const statusOf = (id: number) => statusByRow[id] ?? task.clean;
  const wrongIds = rows.filter((r) => statusOf(r.id) !== r.status).map((r) => r.id);
  const discrepancyRows = rows.filter((r) => statusOf(r.id) !== task.clean);
  const missingActionIds = discrepancyRows.filter((r) => !(actionByRow[r.id] ?? "").trim()).map((r) => r.id);
  const methodOk = method.trim().length > 0;
  const objectiveMet = wrongIds.length === 0 && missingActionIds.length === 0 && methodOk && discrepancyRows.length > 0;

  const discrepancies = discrepancyRows.map((r) => ({ item: r.cells[0], status: statusOf(r.id), action: actionByRow[r.id] ?? "" }));
  useLift({ method, statuses: statusByRow, actions: actionByRow, discrepancies, objectiveMet }, onChange);

  const setStatus = (id: number, v: string) => setStatusByRow((s) => ({ ...s, [id]: v }));
  const setAction = (id: number, v: string) => setActionByRow((a) => ({ ...a, [id]: v }));
  const label = (id: number) => rows.find((r) => r.id === id)?.cells[0] ?? `#${id}`;
  const correctStatus = (id: number) => rows.find((r) => r.id === id)?.status ?? "";

  return (
    <div className="space-y-4">
      <GivenNote>Reconcile <strong>Source A ↔ Source B</strong>. Set each row&apos;s status; every row that isn&apos;t <em>{task.clean}</em> needs a corrective action. State your comparison method. Submission unlocks once your statuses match the reconciliation exactly.</GivenNote>

      <div>
        <SectionLabel hint={task.sources}>Comparison method <span className="text-rose-500">*</span></SectionLabel>
        <WTextArea value={method} onChange={setMethod} rows={2} placeholder={task.method} hint={`${method.length} chars`} />
      </div>

      <div>
        <SectionLabel hint={`${discrepancyRows.length} discrepancies of ${rows.length}`} action={
          <button onClick={() => setChecked(true)} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="check" size={12} />Check reconciliation</button>
        }>{task.title}</SectionLabel>

        <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
                {task.columns.map((c) => <th key={c} className="px-3 py-2 font-semibold">{c}</th>)}
                <th className="px-3 py-2 font-semibold w-[150px]">Status</th>
                <th className="px-3 py-2 font-semibold w-[30%]">Corrective action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = statusOf(r.id);
                const isDisc = st !== task.clean;
                const wrong = checked && st !== r.status;
                const rowTone = wrong ? "bg-rose-50/70" : isDisc ? "bg-indigo-50/40" : "";
                return (
                  <tr key={r.id} className={`border-t border-slate-100 align-top ${rowTone}`}>
                    {r.cells.map((c, ci) => <td key={ci} className={`px-3 py-2 text-[12px] ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"}`}>{c || <span className="text-slate-300 italic">—</span>}</td>)}
                    <td className="px-3 py-2">
                      <select value={st} onChange={(e) => setStatus(r.id, e.target.value)} className="w-full h-8 px-1.5 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[11.5px]">{task.statuses.map((s) => <option key={s}>{s}</option>)}</select>
                    </td>
                    <td className="px-3 py-2">
                      {isDisc ? <input value={actionByRow[r.id] ?? ""} onChange={(e) => setAction(r.id, e.target.value)} placeholder="Corrective action…" className="w-full h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px]" /> : <span className="text-[11px] text-slate-300 italic">— no action needed —</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {checked && !objectiveMet && (
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 text-[12px] space-y-2">
          {wrongIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-rose-700"><Icon name="x" size={13} /> These rows have the wrong status:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-rose-900/80">{wrongIds.map((id) => <li key={id}>{label(id)} — should be <strong>{correctStatus(id)}</strong></li>)}</ul>
            </div>
          )}
          {missingActionIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-amber-700"><Icon name="info" size={13} /> Add a corrective action to every discrepancy:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-amber-900/80">{missingActionIds.map((id) => <li key={id}>{label(id)}</li>)}</ul>
            </div>
          )}
          {!methodOk && <div className="text-rose-700 font-medium">State your comparison method above.</div>}
        </div>
      )}

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Reconciliation matches</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">You correctly classified all {rows.length} rows and gave every discrepancy a corrective action. {task.feedsNext}</p>
        </div>
      )}
    </div>
  );
}

function LegacyCrossRefWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const sourceA = [
    { id: "a1", name: "orders-db (RDS)", meta: "Data Platform · prod" }, { id: "a2", name: "Production K8s", meta: "Platform · 16 nodes" },
    { id: "a3", name: "Snowflake DW", meta: "Analytics · us-west-2" }, { id: "a4", name: "Stripe Connect", meta: "Security Eng. · external" },
    { id: "a5", name: "PagerDuty", meta: "Sec Ops · external" }, { id: "a6", name: "Marketing CMS", meta: "Marketing · wp-blue" },
  ];
  const sourceB = [
    { id: "b1", name: "orders-db (RDS)", meta: "Data Platform Lead · PII" }, { id: "b2", name: "Production K8s", meta: "Head of Platform" },
    { id: "b3", name: "Snowflake DW", meta: "— · no owner" }, { id: "b4", name: "Stripe Connect", meta: "Security Eng. Lead · PCI" },
    { id: "b5", name: "Snowflake DW (dev)", meta: "Analytics · duplicate?" }, { id: "b6", name: "Datadog", meta: "Sec Ops · extra item" },
  ];
  const [decisions, setDecisions] = useState<Record<string, string>>(() => seed(value, "decisions", {} as Record<string, string>));
  const [method, setMethod] = useState(() => seed(value, "method", ""));
  const [gapNote, setGapNote] = useState(() => seed(value, "gapNote", ""));
  const [discrepancyClass, setDiscrepancyClass] = useState(() => seed(value, "discrepancyClass", ""));
  const discrepancies = Object.entries(decisions).filter(([, v]) => v !== "match").map(([id, v]) => ({ item: id, discrepancyClass: v }));
  // Every row on both sides needs a tag, plus the method, gap note and discrepancy class.
  const ready = [...sourceA, ...sourceB].every((r) => !!decisions[r.id])
    && !!method.trim() && !!gapNote.trim() && !!discrepancyClass;
  useLift({ method, gapNote, discrepancyClass, discrepancies, ready }, onChange);

  const setD = (id: string, v: string) => setDecisions((d) => ({ ...d, [id]: v }));
  const opts: { k: string; label: string; tone: Tone }[] = [{ k: "match", label: "Match", tone: "emerald" }, { k: "miss", label: "Miss", tone: "amber" }, { k: "duplicate", label: "Dup", tone: "rose" }];
  const bgFor = (v?: string) => (v === "match" ? "bg-emerald-50/40" : v === "miss" ? "bg-amber-50/40" : v === "duplicate" ? "bg-rose-50/40" : "");

  return (
    <div className="space-y-4">
      <GivenNote>Reconcile the two registers. Tag <strong>every</strong> row on both sides Match / Miss / Dup, then write the gap note, pick a discrepancy class, and state your method. <button onClick={() => openRef("ws-cmdb-export")} className="text-indigo-600 hover:underline font-medium">Open sources →</button></GivenNote>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[{ title: "A · IT asset CMDB", rows: sourceA }, { title: "B · Vendor register", rows: sourceB }].map((src) => (
          <div key={src.title} className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 text-[12px] font-semibold text-slate-800 tracking-tight flex items-center justify-between">{src.title}<span className="text-[10.5px] text-slate-400 font-mono">read-only</span></div>
            {src.rows.map((r) => (
              <div key={r.id} className={`px-4 py-2.5 border-b border-slate-50 last:border-0 flex items-center gap-3 ${bgFor(decisions[r.id])}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-slate-900 tracking-tight font-medium truncate">{r.name}</div>
                  <div className="text-[10.5px] text-slate-500 font-mono truncate">{r.meta}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {opts.map((o) => (
                    <button key={o.k} onClick={() => setD(r.id, o.k)} className={`px-2 h-6 rounded text-[10.5px] font-medium tracking-tight transition-all ring-1 ${decisions[r.id] === o.k ? `${SOFT[o.tone]} ring-inset` : "ring-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}>{o.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div>
          <SectionLabel>Gap note <span className="text-rose-500">*</span></SectionLabel>
          <WTextArea value={gapNote} onChange={setGapNote} rows={3} placeholder="What differs between the two registers, and why…" hint={`${gapNote.length} chars`} />
        </div>
        <div>
          <SectionLabel>Discrepancy class <span className="text-rose-500">*</span></SectionLabel>
          <select value={discrepancyClass} onChange={(e) => setDiscrepancyClass(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="">Pick a class…</option>
            {["Owner-data mismatch", "Missing item in B", "Missing item in A", "Duplicate entry", "Schema drift"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div>
        <SectionLabel>Method <span className="text-rose-500">*</span></SectionLabel>
        <WTextArea value={method} onChange={setMethod} rows={2} placeholder="How you compared the two sources…" hint={`${method.length} chars`} />
      </div>
    </div>
  );
}

/* ============================ IDENTIFY ============================ */
type FlagRow = { id: number; asset: string; type: string; source: string; flagged: boolean; action: string; owner: string };
// Data-driven Identify: scan a worked dataset, flag rows meeting the criterion, give each flag an
// action + owner. Submission is gated on flagging exactly the answer-key rows (Check + gate).
export function IdentifyWorkspace({ value, onChange, openRef, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getIdentifyTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedIdentifyFlow task={task} value={value} onChange={onChange} taskCode={taskCode!} activityCode={activityCode!} />;
  return <LegacyIdentifyWorkspace value={value} onChange={onChange} openRef={openRef} />;
}

type IdMark = { flagged: boolean; action: string; owner: string };

function ScriptedIdentifyFlow({ task, value, onChange, taskCode, activityCode }: { task: IdentifyTask; taskCode: string; activityCode: string } & Pick<WorkspaceProps, "value" | "onChange">) {
  // Same rows, learner-specific order — see learnerRowOrder. Keeps a shared answer key from
  // being shareable as "flag rows 5, 7, 11".
  const rows = useMemo(() => learnerRowOrder(task.rows, userKey(), taskCode, activityCode), [task.rows, taskCode, activityCode]);
  const [criterion, setCriterion] = useState(() => seed(value, "criterion", "")); // the mentee states the rule, it isn't handed to them
  const [marks, setMarks] = useState<Record<number, IdMark>>(() => seed(value, "marks", {} as Record<number, IdMark>));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const mark = (id: number): IdMark => marks[id] ?? { flagged: false, action: "", owner: "" };
  const flaggedRows = rows.filter((r) => mark(r.id).flagged);
  const flaggedIds = flaggedRows.map((r) => r.id);
  const shouldIds = rows.filter((r) => r.shouldFlag).map((r) => r.id);
  const wrongIds = flaggedIds.filter((id) => !shouldIds.includes(id));
  const missedIds = shouldIds.filter((id) => !flaggedIds.includes(id));
  const incompleteIds = flaggedRows.filter((r) => !mark(r.id).action.trim() || !mark(r.id).owner.trim()).map((r) => r.id);

  const flagsCorrect = wrongIds.length === 0 && missedIds.length === 0 && flaggedIds.length > 0;
  const layer1ok = incompleteIds.length === 0 && flaggedRows.length > 0;
  const objectiveMet = !!criterion.trim() && flagsCorrect && layer1ok;

  const flags = flaggedRows.map((r) => ({ item: r.cells[0], proposedAction: mark(r.id).action, accountableRole: mark(r.id).owner }));
  useLift({ criterion, flags, marks, objectiveMet }, onChange);

  const toggle = (id: number) => { setMarks((m) => ({ ...m, [id]: { ...mark(id), flagged: !mark(id).flagged } })); };
  const setField = (id: number, k: "action" | "owner", v: string) => setMarks((m) => ({ ...m, [id]: { ...mark(id), [k]: v } }));
  const label = (id: number) => rows.find((r) => r.id === id)?.cells[0] ?? `#${id}`;

  return (
    <div className="space-y-4">
      <GivenNote>Scan the dataset and <strong>flag</strong> every row that meets the criterion. Give each flag a proposed action and a named accountable role. Submission unlocks once your flags match the criterion exactly.</GivenNote>

      <div>
        <SectionLabel hint={task.standard}>Flagging criterion <span className="text-rose-500">*</span></SectionLabel>
        <WTextInput value={criterion} onChange={setCriterion} placeholder="State the rule you'll flag by…" />
      </div>

      <div>
        <SectionLabel hint={`${flaggedIds.length} flagged of ${rows.length}`} action={
          <button onClick={() => setChecked(true)} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="check" size={12} />Check flags</button>
        }>Dataset</SectionLabel>

        <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
                <th className="px-3 py-2 w-9">Flag</th>
                {task.columns.map((c) => <th key={c} className="px-3 py-2 font-semibold">{c}</th>)}
                <th className="px-3 py-2 font-semibold w-[34%]">Proposed action</th>
                <th className="px-3 py-2 font-semibold w-[180px]">Accountable role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const m = mark(r.id);
                const wrong = checked && m.flagged && !r.shouldFlag;
                const missed = checked && !m.flagged && r.shouldFlag;
                const rowTone = wrong ? "bg-rose-50/70" : missed ? "bg-amber-50/70" : m.flagged ? "bg-indigo-50/40" : "";
                return (
                  <tr key={r.id} className={`border-t border-slate-100 align-top ${rowTone}`}>
                    <td className="px-3 py-2">
                      <button onClick={() => toggle(r.id)} className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${m.flagged ? "bg-indigo-600 text-white" : "ring-1 ring-slate-300 hover:ring-indigo-400"}`}>{m.flagged && <Icon name="check" size={13} strokeWidth={3} />}</button>
                    </td>
                    {r.cells.map((c, ci) => <td key={ci} className={`px-3 py-2 text-[12px] ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"}`}>{c || <span className="text-slate-300 italic">(blank)</span>}</td>)}
                    <td className="px-3 py-2">
                      {m.flagged ? <input value={m.action} onChange={(e) => setField(r.id, "action", e.target.value)} placeholder="One-line action…" className="w-full h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px]" /> : <span className="text-[11px] text-slate-300 italic">— not flagged —</span>}
                    </td>
                    <td className="px-3 py-2">
                      {m.flagged ? (
                        <select value={m.owner} onChange={(e) => setField(r.id, "owner", e.target.value)} className="w-full h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px]"><option value="">Pick a role…</option>{task.owners.map((o) => <option key={o}>{o}</option>)}</select>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer-key check */}
      {checked && !objectiveMet && (
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 text-[12px] space-y-2">
          {wrongIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-rose-700"><Icon name="x" size={13} /> These don&apos;t meet the criterion — unflag them:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-rose-900/80">{wrongIds.map((id) => <li key={id}>{label(id)}</li>)}</ul>
            </div>
          )}
          {missedIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-amber-700"><Icon name="info" size={13} /> You missed these — they meet the criterion:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-amber-900/80">{missedIds.map((id) => <li key={id}>{label(id)}</li>)}</ul>
            </div>
          )}
          {incompleteIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700"><Icon name="info" size={13} /> Add an action and an owner to every flag:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-slate-600">{incompleteIds.map((id) => <li key={id}>{label(id)}</li>)}</ul>
            </div>
          )}
          {!criterion.trim() && <div className="text-rose-700 font-medium">State the flagging criterion above.</div>}
        </div>
      )}

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Flags match the criterion</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">You flagged all {shouldIds.length} matching rows, each with an action and owner. {task.feedsNext}</p>
        </div>
      )}
    </div>
  );
}

function LegacyIdentifyWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  // The dataset is given; which rows to flag — and each flag's action + owner — is the mentee's work.
  const [rows, setRows] = useState<FlagRow[]>(() => seed(value, "rows", [
    { id: 1, asset: "Production K8s cluster (us-east-1)", type: "Compute", source: "SOC 2 §III.A", flagged: false, action: "", owner: "" },
    { id: 2, asset: "orders-db (Amazon RDS)", type: "Data store", source: "SOC 2 §III.A", flagged: false, action: "", owner: "" },
    { id: 3, asset: "Stripe Connect integration", type: "Third party", source: "SOC 2 §III.B", flagged: false, action: "", owner: "" },
    { id: 4, asset: "Marketing CMS (WordPress)", type: "App", source: "SOC 2 §III.D", flagged: false, action: "", owner: "" },
    { id: 5, asset: "Snowflake analytics warehouse", type: "Data store", source: "SOC 2 §III.A", flagged: false, action: "", owner: "" },
    { id: 6, asset: "PagerDuty (incident tooling)", type: "Third party", source: "SOC 2 §III.B", flagged: false, action: "", owner: "" },
  ]));
  const flags = rows.filter((r) => r.flagged).map((r) => ({ item: r.asset, proposedAction: r.action, accountableRole: r.owner }));
  // Verb criteria: every flag needs a proposed action and a named accountable role.
  const ready = flags.length > 0 && flags.every((f) => f.proposedAction.trim() && f.accountableRole);
  useLift({ flags, ready }, onChange);
  const toggle = (id: number) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, flagged: !r.flagged, action: !r.flagged ? r.action : "", owner: !r.flagged ? r.owner : "" } : r)));
  const set = (id: number, k: "action" | "owner", v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const owners = ["Head of Platform", "Data Platform Lead", "Security Eng. Lead", "Security Ops", "Compliance Lead"];

  return (
    <div className="space-y-4">
      <GivenNote>Tick the assets the SOC 2 description names as in-scope, then give each flag an action and a named owner. <button onClick={() => openRef("ws-soc2-sysdesc")} className="text-indigo-600 hover:underline font-medium">Open the System Description →</button></GivenNote>
      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
        <div className="grid grid-cols-[36px_1fr_110px_1.4fr_170px] gap-2 px-4 py-2.5 border-b border-slate-100 text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500 bg-slate-50/60">
          <div /><div>Asset</div><div>Source</div><div>Proposed action</div><div>Accountable role</div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className={`grid grid-cols-[36px_1fr_110px_1.4fr_170px] gap-2 px-4 py-2.5 border-b border-slate-50 last:border-0 items-center ${r.flagged ? "bg-indigo-50/30" : ""}`}>
            <button onClick={() => toggle(r.id)} className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${r.flagged ? "bg-indigo-600 text-white" : "ring-1 ring-slate-300 hover:ring-indigo-400"}`}>{r.flagged && <Icon name="check" size={13} strokeWidth={3} />}</button>
            <div className="min-w-0"><div className="text-[12.5px] text-slate-900 tracking-tight font-medium truncate">{r.asset}</div><div className="text-[10.5px] text-slate-500">{r.type}</div></div>
            <div className="text-[11px] font-mono text-slate-500">{r.source}</div>
            {r.flagged ? <input value={r.action} onChange={(e) => set(r.id, "action", e.target.value)} placeholder="One-line action…" className="h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px]" /> : <div className="text-[11px] text-slate-300 italic">— not flagged —</div>}
            {r.flagged ? (
              <select value={r.owner} onChange={(e) => set(r.id, "owner", e.target.value)} className="h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px]"><option value="">Pick a role…</option>{owners.map((o) => <option key={o}>{o}</option>)}</select>
            ) : <div />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ REVIEW ============================ */
// Data-driven Review: mentor quality-gate. Mentee confirms prior feedback addressed + writes a cover
// note (Layer 1, the submit gate); submitting for review reveals the 5-dim rubric, outcome, coaching.
export function ReviewWorkspace({ value, onChange, openRef, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getReviewTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedReviewFlow task={task} value={value} onChange={onChange} />;
  return <LegacyReviewWorkspace value={value} onChange={onChange} openRef={openRef} />;
}

function ScriptedReviewFlow({ task, value, onChange }: { task: ReviewTask } & Pick<WorkspaceProps, "value" | "onChange">) {
  const [cover, setCover] = useState(() => seed(value, "coverNote", ""));
  const [addressed, setAddressed] = useState<Record<number, boolean>>(() => seed(value, "addressed", {} as Record<number, boolean>));
  const [submitted, setSubmitted] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const allAddressed = task.feedback.every((_, i) => addressed[i]);
  const objectiveMet = cover.trim().length > 0 && allAddressed;
  useLift({ coverNote: cover, addressed, objectiveMet, reviewOutcome: task.outcome }, onChange);

  const signoff = task.outcome.toUpperCase().includes("SIGN");
  const dimTone = (s: string): Tone => { const n = Number(s); return n >= 3 ? "emerald" : n === 2 ? "amber" : "rose"; };

  return (
    <div className="space-y-4">
      <GivenNote>Submit the near-final artefact to your mentor for review. Confirm every prior-feedback item is addressed and write a cover note summarising your changes — then submit for review.</GivenNote>

      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0"><Icon name="file" size={14} /></span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{task.artefact}</div>
            <div className="text-[10.5px] text-slate-500">Reviewer: {task.reviewer} · Attempt {task.attempt}</div>
          </div>
        </div>
      </div>

      {task.feedback.length > 0 ? (
        <div>
          <SectionLabel hint={`${task.feedback.filter((_, i) => addressed[i]).length} / ${task.feedback.length}`}>Prior feedback — confirm addressed</SectionLabel>
          <div className="space-y-2">
            {task.feedback.map((f, i) => (
              <button key={i} onClick={() => setAddressed((a) => ({ ...a, [i]: !a[i] }))} className="w-full flex items-start gap-2.5 text-left group">
                <span className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center transition-all ${addressed[i] ? "bg-emerald-500 text-white" : "ring-2 ring-slate-300 group-hover:ring-indigo-300"}`}>{addressed[i] && <Icon name="check" size={11} strokeWidth={3} />}</span>
                <span className={`text-[12.5px] leading-snug tracking-tight ${addressed[i] ? "text-slate-500 line-through" : "text-slate-700"}`}>{f}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[11.5px] text-slate-400 italic px-1">First submission — no prior feedback to address.</p>
      )}

      <div>
        <SectionLabel hint={`${cover.length} chars`}>Cover note <span className="text-rose-500">*</span></SectionLabel>
        <WTextArea value={cover} onChange={setCover} rows={3} placeholder={task.coverExample} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400 tracking-tight">{objectiveMet ? "Ready — submit for the mentor's review." : "Write a cover note and confirm all prior feedback to submit."}</p>
        <button onClick={() => setSubmitted(true)} disabled={!objectiveMet} className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"><Icon name="send" size={14} />Submit for review</button>
      </div>

      {submitted && objectiveMet && (
        <div className="space-y-3">
          <div>
            <SectionLabel hint={`avg ${task.aggregate} · lowest ${task.lowest}`}>Mentor rubric — all five dimensions</SectionLabel>
            <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
              {task.rubric.map((d) => (
                <div key={d.dim} className="px-4 py-2.5 border-b border-slate-50 last:border-0 flex items-start gap-3">
                  <span className={`mt-0.5 w-6 h-6 rounded-md text-[11px] font-semibold flex items-center justify-center shrink-0 ring-1 ${SOFT[dimTone(d.score)]}`}>{d.score}</span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-slate-800">{d.dim}</div>
                    <div className="text-[11.5px] text-slate-500 leading-snug">{d.anchor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl ring-1 p-4 ${signoff ? "bg-emerald-50 ring-emerald-200" : "bg-amber-50 ring-amber-200"}`}>
            <div className={`flex items-center gap-2 text-[12px] font-semibold mb-1 ${signoff ? "text-emerald-800" : "text-amber-800"}`}>
              <Icon name={signoff ? "check" : "refresh"} size={14} /> {task.outcome}
            </div>
            <p className={`text-[12.5px] leading-relaxed ${signoff ? "text-emerald-900/80" : "text-amber-900/80"}`}><strong>RA-MENTOR:</strong> {task.coaching}</p>
            {signoff && <p className="text-[12px] text-emerald-900/70 mt-2">{task.feedsNext}</p>}
            {!signoff && <p className="text-[12px] text-amber-900/70 mt-2">In the live programme this loops back for revision (attempt +1, max 3). Worked demo — the gate is met, so you can still submit.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function LegacyReviewWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  // The feedback list is given; ticking each item off is the mentee's confirmation.
  const [fb, setFb] = useState(() => seed(value, "priorFeedback", [
    { id: 1, text: "Scope statement needs a line on excluded systems with rationale.", done: false },
    { id: 2, text: "Standards Alignment: cite ISO §4.3 explicitly.", done: false },
    { id: 3, text: "Risk Awareness: address Snowflake personal-data joinability.", done: false },
    { id: 4, text: "Communication: tighten executive summary (currently 240 words).", done: false },
    { id: 5, text: "Specificity: list named systems, not 'production environment'.", done: false },
  ]));
  const [cover, setCover] = useState(() => seed(value, "coverNote", ""));
  const [revisionNo, setRevisionNo] = useState(() => seed(value, "revisionNo", "2"));
  const addressed = fb.filter((f) => f.done).length;
  // Verb criteria: cover note present and every prior-feedback item confirmed addressed.
  const ready = cover.trim().length >= 30 && addressed === fb.length;
  useLift({ coverNote: cover, revisionNo, priorFeedbackAddressed: `${addressed} / ${fb.length}`, priorFeedback: fb, ready }, onChange);
  const toggle = (id: number) => setFb((x) => x.map((f) => (f.id === id ? { ...f, done: !f.done } : f)));

  return (
    <div className="space-y-4">
      <GivenNote>Confirm each item of prior mentor feedback was actioned, then write a cover note. Revision limit: 3 per artefact.</GivenNote>
      <RefBox title="ISMS Scope Statement v0.4" meta="v0.3 → v0.4 · 12 changes" refId="ws-scope-statement" openRef={openRef} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div>
          <SectionLabel hint={`${cover.length} chars · min 30`}>Cover note <span className="text-rose-500">*</span></SectionLabel>
          <WTextArea value={cover} onChange={setCover} rows={5} placeholder="Summarise what changed since the last revision and any open questions for the mentor." />
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start">
          <div className="flex items-center justify-between mb-3"><h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Prior feedback</h4><span className="text-[10.5px] font-mono text-slate-500">{addressed} / {fb.length}</span></div>
          <div className="space-y-2">
            {fb.map((f) => (
              <button key={f.id} onClick={() => toggle(f.id)} className="w-full flex items-start gap-2.5 text-left group">
                <span className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center transition-all ${f.done ? "bg-emerald-500 text-white" : "ring-2 ring-slate-300 group-hover:ring-indigo-300"}`}>{f.done && <Icon name="check" size={11} strokeWidth={3} />}</span>
                <span className={`text-[12px] leading-snug tracking-tight ${f.done ? "text-slate-500 line-through" : "text-slate-700"}`}>{f.text}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Revision</span>
            <select value={revisionNo} onChange={(e) => setRevisionNo(e.target.value)} className="h-7 px-2 rounded-md ring-1 ring-slate-200/80 text-[11.5px] outline-none">{["1", "2", "3"].map((n) => <option key={n}>{n}</option>)}</select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ PRESENT ============================ */
// Data-driven Present: deck + anticipated Q&A prep → senior sign-off Q&A (reuses the Conduct engine).
export function PresentWorkspace({ value, onChange, openRef, taskCode, activityCode }: WorkspaceProps) {
  const task = getPresentTask(taskCode, activityCode);
  if (task) return <ScriptedConductFlow task={task} value={value} onChange={onChange} />;
  return <LegacyPresentWorkspace value={value} onChange={onChange} openRef={openRef} />;
}
function LegacyPresentWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [qa, setQa] = useState(() => seed(value, "anticipatedQuestions", [{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }]));
  const [decision, setDecision] = useState(() => seed(value, "signoffDecision", ""));
  const [decisionDate, setDecisionDate] = useState(() => seed(value, "decisionDate", ""));
  // Verb criteria: ≥ 3 anticipated questions answered + a sign-off decision with its date.
  // The deck is given, so it must not on its own make this look like a finished deliverable.
  const ready = qa.filter((x) => x.q.trim() && x.a.trim()).length >= 3 && !!decision && !!decisionDate;
  useLift({ deckLink: "ISMS Scope (May 2026).pptx · 8 slides", anticipatedQuestions: qa, signoffDecision: decision, decisionDate, ready }, onChange);
  const setQ = (i: number, k: "q" | "a", v: string) => setQa((x) => x.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const decisions: { id: string; label: string; tone: Tone }[] = [{ id: "Approved", label: "Approved", tone: "emerald" }, { id: "Approved with conditions", label: "Approved w/ conditions", tone: "amber" }, { id: "Rejected", label: "Rejected", tone: "rose" }];

  return (
    <div className="space-y-4">
      <GivenNote>Confirm the deck, prepare ≥ 3 anticipated questions with answers, then capture the sign-off decision.</GivenNote>
      <RefBox title="ISMS Scope — presentation deck" meta="8 slides · 2.1 MB" icon="upload" refId="ws-deck" openRef={openRef} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div>
          <SectionLabel hint={`${qa.filter((x) => x.q.trim() && x.a.trim()).length} / 3 prepared`} action={<button onClick={() => setQa([...qa, { q: "", a: "" }])} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="plus" size={12} />Add</button>}>Anticipated Q&amp;A</SectionLabel>
          <div className="space-y-2">
            {qa.map((x, i) => (
              <div key={i} className="rounded-xl bg-white ring-1 ring-slate-200/70 p-3">
                <div className="flex items-start gap-2"><span className="mt-2 w-6 text-[11px] font-mono text-slate-400">Q{i + 1}</span><input value={x.q} onChange={(e) => setQ(i, "q", e.target.value)} placeholder="Expected question…" className="flex-1 h-9 px-2 rounded-md bg-slate-50 ring-1 ring-slate-200/60 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px]" /></div>
                <div className="mt-1.5 flex items-start gap-2"><span className="mt-2 w-6 text-[11px] font-mono text-slate-400">A</span><textarea value={x.a} onChange={(e) => setQ(i, "a", e.target.value)} placeholder="Prepared answer…" rows={2} className="flex-1 px-2 py-1.5 rounded-md bg-slate-50 ring-1 ring-slate-200/60 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px] resize-none leading-relaxed" /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start">
          <h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-3">Sign-off decision</h4>
          <div className="space-y-2">
            {decisions.map((d) => (
              <button key={d.id} onClick={() => setDecision(d.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ring-1 ${decision === d.id ? `${SOFT[d.tone]} ring-inset` : "ring-slate-200/70 hover:bg-slate-50"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${decision === d.id ? DOT[d.tone] : "ring-2 ring-slate-300"}`}>{decision === d.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}</span>
                <span className="text-[12.5px] font-medium tracking-tight text-slate-700">{d.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-1.5">Decision date</div>
            <WTextInput type="date" value={decisionDate} onChange={setDecisionDate} />
          </div>
        </div>
      </div>
    </div>
  );
}
