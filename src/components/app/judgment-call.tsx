"use client";

// The judgment call — one step in each task stops and makes the mentee decide something.
//
// Every other input on the Working Desk has a right answer: the workspace loads real enterprise
// data, they analyse it, and the acceptance checklist ticks green. This one does not. Two or
// three of the four options are genuinely defensible and the panel says so out loud, because a
// mentee who thinks they are hunting for the correct answer stops reasoning and starts
// eliminating — which is the exact habit this exists to break.
//
// The panel therefore never renders which options are defensible: the API does not send it
// (backend/app/services/judgment.py withholds the answer key) and there is nothing here to leak.
// After grading, it shows what their pick was, what the reasoning scored, and where it was thin.

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Gloss } from "@/components/app/glossary";
import { MachineTag } from "@/components/app/machine-note";
import type { DecisionAnswer, JudgmentPrompt, JudgmentResult } from "@/lib/desk";

/** Below this the reasoning is not a defence and the server's floor will fail it anyway. Telling
 *  them here, before they submit, is cheaper than telling them after it cost an attempt. */
export const MIN_JUSTIFICATION_WORDS = 15;

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Whether this answer is complete enough to submit. Exported so the page can gate Submit on it. */
export function decisionReady(prompt: JudgmentPrompt | null, answer: DecisionAnswer): boolean {
  if (!prompt) return true;
  return !!answer.option && wordCount(answer.justification) >= MIN_JUSTIFICATION_WORDS;
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 4) * 100));
  const tone = value >= 3 ? "bg-emerald-500" : value >= 2 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** The graded verdict, shown once they have submitted an answer to this dilemma. Rendered both
 *  under the panel and in the Submission-feedback drawer — one block, so the two cannot drift. */
export function JudgmentVerdict({ result }: { result: JudgmentResult }) {
  const tone = result.passed
    ? "bg-emerald-50 ring-emerald-200/70"
    : "bg-amber-50 ring-amber-200/70";
  return (
    <div className={`mt-4 rounded-xl ring-1 p-4 ${tone}`}>
      {/* The pass/fail tint stays — a learner needs to read the outcome at a glance — but the
          provenance tag says who produced it. A mentor reading the same reasoning at the gate can
          still return the step, and this is what keeps the two from looking like one verdict. */}
      <MachineTag
        className="mb-2.5"
        label={result.gradedBy === "fallback" ? "Generated · fallback grade" : "Generated · not a mentor decision"}
      />
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon
            name={result.passed ? "check" : "info"}
            size={14}
            strokeWidth={result.passed ? 3 : 2}
            className={result.passed ? "text-emerald-600" : "text-amber-600"}
          />
          <span className="text-[12.5px] font-semibold tracking-tight text-slate-900">
            {result.passed ? "Reasoning holds" : "Reasoning needs more behind it"}
          </span>
          <span className="text-[11.5px] text-slate-500 tabular-nums">
            {result.score.toFixed(1)} / 4
          </span>
        </div>
        <span className="text-[11px] text-slate-500 tracking-tight">
          You chose ({result.option}) —{" "}
          {/* Said plainly, and said after the fact. Choosing an option the library does not
              consider defensible is not automatically a fail: the reasoning is the grade, and a
              hard case argued well beats the safe option asserted. */}
          {result.defensible
            ? "one of the defensible positions"
            : "a position the reference material argues against"}
        </span>
      </div>

      <p className="mt-2.5 text-[12.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
        <Gloss>{result.feedback}</Gloss>
      </p>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {result.dimensions.map((d) => (
          <div key={d.label}>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-[11px] font-medium text-slate-600 tracking-tight">{d.label}</span>
              <span className="text-[11px] font-semibold text-slate-800 tabular-nums">{d.score.toFixed(0)}</span>
            </div>
            <ScoreBar value={d.score} />
            {d.hint && <p className="mt-1 text-[10.5px] text-slate-500 leading-snug tracking-tight">{d.hint}</p>}
          </div>
        ))}
      </div>

      {result.gradedBy === "fallback" && (
        <p className="mt-3 text-[10.5px] text-slate-500 tracking-tight">
          Graded provisionally — the mentor model was unreachable, so your reviewer will read this
          reasoning at the gate.
        </p>
      )}
    </div>
  );
}

export function JudgmentCall({
  prompt,
  value,
  onChange,
  result,
  locked = false,
}: {
  prompt: JudgmentPrompt;
  value: DecisionAnswer;
  onChange: (next: DecisionAnswer) => void;
  /** The last graded answer, if there is one. */
  result: JudgmentResult | null;
  locked?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const words = wordCount(value.justification);
  const short = touched && !!value.option && words > 0 && words < MIN_JUSTIFICATION_WORDS;

  return (
    // The prompt well (form 10): recessed, not raised — a hole in the page rather than an object
    // on it, and the only form below the surface. Everything else on the desk is something you
    // are given; this is the one place the page stops and waits for you.
    //
    // Steel, not violet. Violet now means machine-generated and nothing else (machine-note.tsx),
    // and a dilemma the programme authored is the opposite of machine output.
    <section className="mt-6 min-w-0 rounded-[10px_10px_3px_3px] border border-slate-200 border-b-[3px] border-b-sky-700 bg-transparent shadow-[inset_0_3px_10px_rgba(19,28,40,0.09)]">
      <header className="px-4 sm:px-5 pt-4">
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0 mt-px">
            <Icon name="bullseye" size={14} />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">Judgment call</h3>
              <span className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-sky-700">
                {prompt.competenceLabel}
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 tracking-tight mt-0.5">{prompt.name}</p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-5 py-4">
        <p className="text-[13.5px] text-slate-800 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
          <Gloss>{prompt.situation}</Gloss>
        </p>

        <p className="mt-3.5 text-[13.5px] font-semibold text-slate-900 tracking-tight">
          <Gloss>{prompt.question}</Gloss>
        </p>

        {/* Said before they choose, deliberately. It reframes the panel from a quiz into a
            decision, and it is simply true. */}
        <p className="mt-1.5 text-[11.5px] text-slate-500 tracking-tight" style={{ textWrap: "pretty" }}>
          More than one of these is defensible. You are graded on the reasoning, not the pick.
        </p>

        {/* Buttons, not a <label> around a visually-hidden <input type="radio">, which is what
            this was and which broke twice over: clicking the label focused the hidden input, and
            the browser scroll-into-viewed it under the page's `scroll-behavior: smooth` — so
            every pick slid the page away from the question. Every choice UI in the 22 verb
            workspaces is a button; this now matches them. `role="radio"` keeps the semantics the
            native input was there for. */}
        <div
          role="radiogroup"
          aria-label={prompt.question}
          className="mt-3.5 min-w-0 space-y-2"
        >
          {prompt.options.map((o) => {
            const picked = value.option === o.key;
            return (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={picked}
                disabled={locked}
                onClick={() => onChange({ ...value, option: o.key })}
                className={`w-full min-w-0 text-left flex items-start gap-3 rounded-xl p-3 transition-all ring-1 ${
                  picked
                    ? "bg-white ring-sky-600 shadow-[0_2px_10px_-4px_rgba(3,105,161,0.45)]"
                    : "bg-white/70 ring-slate-200 hover:bg-white hover:ring-slate-300"
                } ${locked ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  aria-hidden
                  className={`shrink-0 mt-px w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-semibold uppercase ring-1 ${
                    picked ? "bg-sky-700 text-white ring-sky-700" : "bg-slate-50 text-slate-500 ring-slate-200"
                  }`}
                >
                  {o.key}
                </span>
                {/* Plain text, NOT <Gloss>. A glossed term renders its own <button> plus a
                    popover, and glossary.tsx keeps "button" and "label" in its SKIP set for
                    exactly this reason: nesting one inside a clickable option is invalid HTML,
                    and clicking the row toggled the popover, which the browser then scrolled
                    into view. */}
                <span className="min-w-0 text-[12.5px] text-slate-800 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
                  {o.text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label
            htmlFor={`why-${prompt.slot}`}
            className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-1.5"
          >
            Why this one
          </label>
          <div className="rounded-xl bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-sky-600/40 transition-all">
            <textarea
              id={`why-${prompt.slot}`}
              disabled={locked}
              value={value.justification}
              onChange={(e) => onChange({ ...value, justification: e.target.value })}
              onBlur={() => setTouched(true)}
              rows={5}
              placeholder="What made this the right call here, what the alternative would have bought you, and what your choice commits the organisation to once this task closes."
              className="w-full px-4 py-3 bg-transparent outline-none resize-y text-[13px] text-slate-900 placeholder:text-slate-400 leading-relaxed tracking-tight disabled:opacity-70"
            />
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-100">
              <span className={`text-[11px] tracking-tight ${short ? "text-amber-600" : "text-slate-400"}`}>
                {short
                  ? `A defence needs more than ${words} word${words === 1 ? "" : "s"}.`
                  : "Name the trade-off you accepted."}
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {words}/{MIN_JUSTIFICATION_WORDS}
              </span>
            </div>
          </div>
        </div>

        {result && <JudgmentVerdict result={result} />}
      </div>
    </section>
  );
}


/**
 * What they answered on one attempt: the option they took and the reasoning they gave.
 *
 * The drawer needs this because `decision` is in CONTROL_KEYS — the generic field renderers skip
 * it so it does not appear as a raw `{option, justification}` object, which means without this it
 * appeared nowhere at all and a learner could not read back the argument they made.
 *
 * `option` is stored as the bare key ("c"); the text lives in the prompt, which is stable for a
 * given learner and task, so the current prompt renders any past attempt correctly.
 */
export function JudgmentAnswer({
  decision,
  prompt,
}: {
  decision: DecisionAnswer;
  prompt: JudgmentPrompt | null;
}) {
  if (!decision?.option && !decision?.justification) return null;
  const chosen = prompt?.options.find((o) => o.key === decision.option);
  return (
    <div className="min-w-0">
      <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-sky-700 mb-1.5">
        Judgment call
      </div>
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 mt-px w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10.5px] font-semibold uppercase">
          {decision.option || "—"}
        </span>
        <span className="min-w-0 text-[12.5px] text-slate-800 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
          {chosen?.text ?? "(option no longer available)"}
        </span>
      </div>
      {decision.justification && (
        <p className="mt-2 text-[12px] text-slate-600 leading-relaxed tracking-tight whitespace-pre-wrap break-words">
          {decision.justification}
        </p>
      )}
    </div>
  );
}
