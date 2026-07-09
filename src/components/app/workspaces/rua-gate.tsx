"use client";

// RUA readiness-gate workspace — faithful port of the design mockup's eight verb screens:
// R1 Study (per-control comprehension checks, unlocking in order) · R2 Inspect (field-purpose
// exercises with decoys) · R3 Acquire (prerequisite checklist + org-context acknowledgement) ·
// R4 Clarify (graded paraphrase or query→resolution per step) · R5 Confirm (contract restatement
// with anti-parrot meter + scope-boundary sort) · R6 Explain (concept deck, failed cards
// re-queue) · R7 Answer (one-way exam session with follow-up probes) · R8 Attest (five-criterion
// RAG ledger + gate decision). All checks run on the deterministic client engine
// (lib/rua-engine.ts); the AI mentor still grades the submitted payload as Layer 2.

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { type WorkspaceProps, useLift, seed, GivenNote } from "./kit";
import { TabRail, PaneNav, type TabDef } from "./gates";
import { DocOpenStrip, FloatingDocs, useFloatingDocs } from "@/components/app/doc-windows";
import { getRuaTask, type RuaTask } from "@/lib/rua-tasks";
import { RUA_REFS, type RuaRef } from "@/lib/rua-refs";
import { TASK_META, type TaskReference } from "@/lib/taskmeta";
import {
  microCheck, inspectExercise, boundaryItems, followUp,
  gradeParaphrase, gradeExplain, gradeAnswer, computeLedger, emptyProgress,
  wordCount, tokenize, jaccard, PARROT,
  type RuaProgress, type Ledger, type Rag, type GateDecision, type AnswerOutcome, type ExplainGrade, type AnswerGrade,
} from "@/lib/rua-engine";

/* ── shared bits ── */

const RAG_CLS: Record<Rag, { chip: string; text: string; dot: string }> = {
  green: { chip: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  amber: { chip: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  red: { chip: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-500" },
};

function Ring({ value, label }: { value: number; label: string }) {
  const R = 20, C = 2 * Math.PI * R;
  return (
    <div className="hidden sm:flex flex-col items-center shrink-0">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={R} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="26" cy="26" r={R} fill="none" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${C * Math.min(1, value)} ${C}`} transform="rotate(-90 26 26)" />
        <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">{label}</text>
      </svg>
    </div>
  );
}

function ScreenHead({ v, name, title, subtitle, ring }: { v: string; name: string; title: string; subtitle?: string; ring?: { value: number; label: string } }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center h-[18px] px-1.5 rounded bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-[10px] font-mono font-semibold">{v}</span>
          <span className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-400">{name}</span>
        </div>
        <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{title}</h3>
        {subtitle && <p className="mt-1 text-[12px] text-slate-500 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{subtitle}</p>}
      </div>
      {ring && <Ring value={ring.value} label={ring.label} />}
    </div>
  );
}

/** Mockup's VerbFooter — done label / hint + a continue button gated on the screen being done. */
function VerbFooter({ done, doneLabel, nextLabel, onNext, hint }: { done: boolean; doneLabel: string; nextLabel?: string; onNext?: () => void; hint: string }) {
  return (
    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
      {done
        ? <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-600"><Icon name="checkCircle" size={15} /> {doneLabel}</span>
        : <span className="text-[12px] text-slate-400 tracking-tight">{hint}</span>}
      {nextLabel && onNext && (
        <button onClick={onNext} disabled={!done}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-ring transition-colors shadow-[0_4px_14px_-4px_rgba(124,58,237,0.5)]">
          {nextLabel} <Icon name="arrowRight" size={14} />
        </button>
      )}
    </div>
  );
}

const btnPrimary = "inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer focus-ring transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer focus-ring transition-colors";

type Patch = (mut: (p: RuaProgress) => void) => void;
interface PaneProps {
  task: RuaTask; taskCode: string; p: RuaProgress; patch: Patch; goVerb: (k: string) => void;
  /** This tab's programme-provided reference artifacts. */
  refs: RuaRef[];
  /** Opens a document in its own draggable floating window. */
  openDoc: (d: TaskReference) => void;
}

/* ================= R1 · Study ================= */

function StudyPane({ task, taskCode, p, patch, goVerb, refs, openDoc }: PaneProps) {
  const passedCount = task.controls.filter((_, i) => p.study[i]?.passed).length;
  const firstUnlocked = task.controls.findIndex((_, i) => !p.study[i]?.passed);
  const [open, setOpen] = useState(firstUnlocked === -1 ? 0 : firstUnlocked);
  const allDone = passedCount === task.controls.length;

  return (
    <div>
      <ScreenHead v="R1" name="Study" title="Study the governing controls & cross-walk"
        subtitle={`Work through each ${task.standard} reference for its intent, then pass the comprehension check. Controls unlock in order.`}
        ring={{ value: passedCount / Math.max(1, task.controls.length), label: `${passedCount}/${task.controls.length}` }} />
      <DocOpenStrip docs={refs} onOpen={openDoc} tone="violet" className="mb-4" />
      <div className="space-y-2.5">
        {task.controls.map((c, i) => {
          const done = !!p.study[i]?.passed;
          const locked = firstUnlocked !== -1 && i > firstUnlocked;
          const isOpen = open === i && !locked;
          return (
            <div key={i} className={`rounded-2xl ring-1 overflow-hidden transition-all ${done ? "ring-emerald-200 bg-emerald-50/30" : "ring-slate-200/80 bg-white"} ${locked ? "opacity-55" : ""}`}>
              <button disabled={locked} onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer focus-ring disabled:cursor-not-allowed">
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${done ? "bg-emerald-500 text-white" : locked ? "bg-slate-100 text-slate-300" : "bg-violet-50 text-violet-600"}`}>
                  <Icon name={done ? "check" : locked ? "lock" : "book"} size={15} strokeWidth={done ? 2.5 : 2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{c.ref}</span>
                    {done && <span className="inline-flex items-center gap-1 h-[17px] px-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold"><Icon name="check" size={9} strokeWidth={3} /> studied</span>}
                  </span>
                  <span className="block text-[13px] font-semibold text-slate-800 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{c.name}</span>
                </span>
                {!locked && <Icon name="chevronDown" size={16} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0.5 space-y-3">
                  <p className="text-[12.5px] leading-relaxed text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}>
                    Studied for intent, not wording: {c.ref} forces the organisation to demonstrably control “{c.name.toLowerCase()}”. Ask what risk it removes and how you&apos;d see it working.
                  </p>
                  <div className="rounded-xl bg-violet-50/70 px-3.5 py-3">
                    <div className="text-[9.5px] font-semibold tracking-[0.14em] uppercase text-violet-600 mb-1">Why this matters here</div>
                    <p className="text-[12px] leading-relaxed text-slate-700 tracking-tight" style={{ textWrap: "pretty" }}>
                      Here it becomes a line of evidence inside your {task.deliverable.toLowerCase()} — so a gap against it is a gap you must record.
                    </p>
                  </div>
                  <MicroCheckBox task={task} taskCode={taskCode} idx={i} passed={done} attempts={p.study[i]?.attempts ?? 0}
                    onPass={() => patch((n) => { n.study[i] = { passed: true, attempts: n.study[i]?.attempts ?? 0 }; })}
                    onFail={() => patch((n) => { n.study[i] = { passed: false, attempts: (n.study[i]?.attempts ?? 0) + 1 }; })} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[10.5px] text-slate-400">NIST CSF 2.0 cross-walk</span>
        {task.crosswalk.map((x) => (
          <span key={x.code} title={x.desc} className="inline-flex items-center h-[18px] px-1.5 rounded bg-slate-100 text-slate-600 ring-1 ring-slate-200 text-[10px] font-mono">{x.code}</span>
        ))}
      </div>
      <VerbFooter done={allDone} doneLabel="All controls studied" nextLabel="Continue to Inspect" onNext={() => goVerb("inspect")} hint="Pass every comprehension check to unlock the next stage." />
    </div>
  );
}

function MicroCheckBox({ task, taskCode, idx, passed, attempts, onPass, onFail }: {
  task: RuaTask; taskCode: string; idx: number; passed: boolean; attempts: number; onPass: () => void; onFail: () => void;
}) {
  const item = useMemo(() => microCheck(task, taskCode, idx), [task, taskCode, idx]);
  const [sel, setSel] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "wrong" | "correct">(passed ? "correct" : "idle");
  function submit() {
    if (sel === null) return;
    if (item.options[sel] === item.answer) { setState("correct"); onPass(); }
    else { setState("wrong"); onFail(); }
  }
  return (
    <div className={`rounded-xl ring-1 p-3.5 ${state === "correct" ? "ring-emerald-200 bg-emerald-50/40" : state === "wrong" ? "ring-rose-200 bg-rose-50/40" : "ring-slate-200 bg-slate-50"}`}>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon name="checkSquare" size={13} className="text-slate-400" />
        <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-slate-400">Comprehension check</span>
        {attempts > 0 && state !== "correct" && <span className="text-[10px] text-slate-400 ml-auto tabular-nums">attempt {attempts + 1}</span>}
      </div>
      <p className="text-[12.5px] font-medium text-slate-800 tracking-tight mb-2.5">{item.q}</p>
      <div className="space-y-1.5">
        {item.options.map((o, k) => {
          const chosen = sel === k;
          const show = state === "correct" && o === item.answer;
          return (
            <button key={k} disabled={state === "correct"} onClick={() => setSel(k)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[12px] tracking-tight ring-1 cursor-pointer focus-ring transition-colors disabled:cursor-default ${
                show ? "ring-emerald-300 bg-emerald-50 text-emerald-800"
                : chosen && state === "wrong" ? "ring-rose-300 bg-rose-50 text-rose-800"
                : chosen ? "ring-violet-300 bg-violet-50 text-slate-800" : "ring-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              <span className={`shrink-0 w-4 h-4 rounded-full ring-1 flex items-center justify-center ${chosen || show ? "bg-violet-600 ring-violet-600" : "ring-slate-300"}`}>{(chosen || show) && <span className="w-1.5 h-1.5 rounded-full bg-white" />}</span>
              <span className="flex-1">{o}</span>
              {show && <Icon name="check" size={14} className="text-emerald-600" />}
            </button>
          );
        })}
      </div>
      {state === "correct"
        ? <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-700"><Icon name="checkCircle" size={14} /> Correct — control marked studied.</div>
        : <div className="mt-2.5 flex items-center gap-2">
            <button onClick={submit} disabled={sel === null} className={`${btnPrimary} h-9 px-4 text-[12px]`}>Check answer</button>
            {state === "wrong" && <span className="text-[12px] text-rose-600 font-medium">Not quite — re-read the intent and try again.</span>}
          </div>}
    </div>
  );
}

/* ================= R2 · Inspect ================= */

const FMT_ICON = { sheet: "table", doc: "file", deck: "clipboard", diagram: "grid" } as const;
const FMT_LABEL = { sheet: "Spreadsheet", doc: "Document", deck: "Slide deck", diagram: "Diagram" } as const;

function InspectPane({ task, taskCode, p, patch, goVerb, refs, openDoc }: PaneProps) {
  const [open, setOpen] = useState<number | null>(task.templates.findIndex((_, i) => !p.inspect[i]));
  const passedCount = task.templates.filter((_, i) => p.inspect[i]).length;
  const allDone = passedCount === task.templates.length;
  return (
    <div>
      <ScreenHead v="R2" name="Inspect" title="Open every provided template"
        subtitle="Prove you know each template's structure and purpose before you use it in anger. Open a card, study its fields, then pass the field-purpose exercise."
        ring={{ value: passedCount / Math.max(1, task.templates.length), label: `${passedCount}/${task.templates.length}` }} />
      <DocOpenStrip docs={refs} onOpen={openDoc} tone="violet" label="Template reference documents" className="mb-4" />
      <div className="space-y-2.5">
        {task.templates.map((tpl, i) => {
          const done = !!p.inspect[i];
          const isOpen = open === i;
          return (
            <div key={i} className={`rounded-2xl ring-1 overflow-hidden ${done ? "ring-emerald-200 bg-emerald-50/30" : "ring-slate-200/80 bg-white"}`}>
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer focus-ring">
                <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${done ? "bg-emerald-500 text-white" : "bg-violet-50 text-violet-600"}`}><Icon name={FMT_ICON[tpl.fmt] ?? "file"} size={16} /></span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-800 tracking-tight truncate">{tpl.name}</span>
                    {done
                      ? <span className="inline-flex items-center gap-1 h-[17px] px-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold"><Icon name="check" size={9} strokeWidth={3} /> inspected</span>
                      : <span className="inline-flex items-center h-[17px] px-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">uninspected</span>}
                  </span>
                  <span className="block text-[11px] text-slate-400 tracking-tight truncate">{FMT_LABEL[tpl.fmt] ?? "Document"} · {tpl.purpose ? tpl.purpose.slice(0, 70) + (tpl.purpose.length > 70 ? "…" : "") : "template"}</span>
                </span>
                <Icon name="chevronDown" size={16} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {tpl.fields.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
                      <div className="flex min-w-max">
                        {tpl.fields.map((f, k) => (
                          <div key={k} className="shrink-0 border-r border-slate-100 last:border-0">
                            <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-600 tracking-tight border-b border-slate-100 whitespace-nowrap">{f}</div>
                            <div className="px-3 py-3 min-w-[90px]"><div className="h-2 rounded bg-slate-100" /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 px-4 py-3 text-[12.5px] text-slate-600 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{tpl.purpose || "Structured document — review its sections before use."}</div>
                  )}
                  <InspectExerciseBox task={task} taskCode={taskCode} idx={i} passed={done}
                    onPass={() => patch((n) => { n.inspect[i] = true; })} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <VerbFooter done={allDone} doneLabel="Every template inspected" nextLabel="Continue to Acquire" onNext={() => goVerb("acquire")} hint="Open and pass all templates to continue." />
    </div>
  );
}

function InspectExerciseBox({ task, taskCode, idx, passed, onPass }: { task: RuaTask; taskCode: string; idx: number; passed: boolean; onPass: () => void }) {
  const ex = useMemo(() => inspectExercise(task, taskCode, idx), [task, taskCode, idx]);
  const [ticks, setTicks] = useState<Record<number, boolean>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [result, setResult] = useState<"ok" | "bad" | null>(passed ? "ok" : null);
  const boxCls = result === "ok" ? "ring-emerald-200 bg-emerald-50/40" : result === "bad" ? "ring-rose-200 bg-rose-50/40" : "ring-slate-200 bg-slate-50";

  if (ex.kind === "columns") {
    const check = () => {
      const ok = ex.picks.every((pk, k) => !!ticks[k] === pk.belongs);
      if (ok) { setResult("ok"); onPass(); } else setResult("bad");
    };
    return (
      <div className={`rounded-xl ring-1 p-3.5 ${boxCls}`}>
        <div className="flex items-center gap-2 mb-2.5"><Icon name="checkSquare" size={13} className="text-slate-400" /><span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-slate-400">Field-purpose exercise</span></div>
        <p className="text-[12.5px] font-medium text-slate-800 tracking-tight mb-2.5">{ex.prompt}</p>
        <div className="flex flex-wrap gap-2">
          {ex.picks.map((pk, k) => {
            const on = !!ticks[k];
            const reveal = result === "ok";
            return (
              <button key={k} disabled={result === "ok"} onClick={() => setTicks((t) => ({ ...t, [k]: !on }))}
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] font-medium tracking-tight ring-1 cursor-pointer focus-ring transition-colors disabled:cursor-default ${
                  reveal && pk.belongs ? "ring-emerald-300 bg-emerald-50 text-emerald-800"
                  : on ? "ring-violet-300 bg-violet-50 text-slate-800" : "ring-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                <span className={`w-4 h-4 rounded ring-1 flex items-center justify-center ${on ? "bg-violet-600 ring-violet-600" : "ring-slate-300"}`}>{on && <Icon name="check" size={11} className="text-white" strokeWidth={3} />}</span>
                {pk.label}
              </button>
            );
          })}
        </div>
        {result === "ok"
          ? <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-700"><Icon name="checkCircle" size={14} /> Right — you&apos;ve mapped the template&apos;s real fields.</div>
          : <div className="mt-2.5 flex items-center gap-2">
              <button onClick={check} className={`${btnPrimary} h-9 px-4 text-[12px]`}>Check selection</button>
              {result === "bad" && <span className="text-[12px] text-rose-600 font-medium">Some fields don&apos;t belong here — a couple of decoys slipped in.</span>}
            </div>}
      </div>
    );
  }
  const check = () => {
    if (sel === null) return;
    if (ex.options[sel] === ex.answer) { setResult("ok"); onPass(); } else setResult("bad");
  };
  return (
    <div className={`rounded-xl ring-1 p-3.5 ${boxCls}`}>
      <div className="flex items-center gap-2 mb-2.5"><Icon name="checkSquare" size={13} className="text-slate-400" /><span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-slate-400">Purpose match</span></div>
      <p className="text-[12.5px] font-medium text-slate-800 tracking-tight mb-2.5">{ex.prompt}</p>
      <div className="space-y-1.5">
        {ex.options.map((o, k) => {
          const chosen = sel === k;
          const reveal = result === "ok" && o === ex.answer;
          return (
            <button key={k} disabled={result === "ok"} onClick={() => setSel(k)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] tracking-tight ring-1 cursor-pointer focus-ring disabled:cursor-default ${reveal ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : chosen ? "ring-violet-300 bg-violet-50" : "ring-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{o}</button>
          );
        })}
      </div>
      {result === "ok"
        ? <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-700"><Icon name="checkCircle" size={14} /> Correct.</div>
        : <div className="mt-2.5 flex items-center gap-2">
            <button onClick={check} disabled={sel === null} className={`${btnPrimary} h-9 px-4 text-[12px]`}>Check answer</button>
            {result === "bad" && <span className="text-[12px] text-rose-600 font-medium">Try again.</span>}
          </div>}
    </div>
  );
}

/* ================= R3 · Acquire ================= */

const ACQ_META = {
  artefact: { icon: "folder", label: "Prior-task artefact", chip: "bg-violet-50 text-violet-700 ring-violet-200" },
  template: { icon: "file", label: "Template pack", chip: "bg-slate-100 text-slate-600 ring-slate-200" },
  access: { icon: "users", label: "Stakeholder access", chip: "bg-amber-50 text-amber-700 ring-amber-200" },
  context: { icon: "globe", label: "Organisation context", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
} as const;

// ponytail: static org profiles from the mockup; orgs outside this map show name-only.
const ORG_PROFILES: Record<string, { ind: string; crit: string; staff: string; sys: string }> = {
  "CloudTech Solutions Enterprise": { ind: "Cloud & managed hosting", crit: "High", staff: "~1,400", sys: "AWS estate · Salesforce · Workday · GitHub Enterprise" },
  "Apex Software Development Group": { ind: "Software product engineering", crit: "High", staff: "~600", sys: "GitHub · CI/CD · Jira · on-prem build servers" },
  "GlobalConnect Customer Solutions": { ind: "Contact-centre / BPO", crit: "Medium", staff: "~2,100", sys: "Genesys · CRM · M365 · workforce mgmt" },
  "Enterprise Shared Services Group": { ind: "Corporate shared services", crit: "Medium", staff: "~900", sys: "SAP · ServiceNow · M365 · shared file store" },
  "LearnTech Educational Solutions": { ind: "EdTech / e-learning", crit: "Medium", staff: "~350", sys: "LMS · student DB · Stripe · AWS" },
  "Metropolitan Research University": { ind: "Higher education & research", crit: "Medium", staff: "~5,000", sys: "SIS · research data stores · VLE · M365" },
  "Strategic Advisory Consultants": { ind: "Management consulting", crit: "Low", staff: "~180", sys: "M365 · client project stores · Salesforce" },
  "American Media Networks Corp": { ind: "Media & broadcasting", crit: "Medium", staff: "~2,800", sys: "MAM · CMS · ad-tech · AWS + on-prem" },
};

function Fact({ k, v }: { k: string; v: string }) {
  return <div className="rounded-lg bg-slate-50 px-2.5 py-2"><div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">{k}</div><div className="text-[12px] font-medium text-slate-700 tracking-tight leading-snug">{v}</div></div>;
}

function AcquirePane({ task, p, patch, goVerb, refs, openDoc }: PaneProps) {
  const prof = ORG_PROFILES[task.org];
  const needCtx = task.acquire.some((a) => a.type === "context");
  const resolved = task.acquire.filter((_, i) => p.acquire[i]).length;
  const allResolved = task.acquire.every((_, i) => p.acquire[i]) && (!needCtx || p.contextAck);

  return (
    <div>
      <ScreenHead v="R3" name="Acquire" title="Retrieve prerequisite inputs & access"
        subtitle="Pull prior-task artefacts, acknowledge the organisation context, and confirm the access this task needs — before any work begins."
        ring={{ value: resolved / Math.max(1, task.acquire.length), label: `${resolved}/${task.acquire.length}` }} />
      <DocOpenStrip docs={refs} onOpen={openDoc} tone="violet" label="Prerequisite briefs" className="mb-4" />

      <div className="space-y-2.5">
        {task.acquire.map((a, i) => {
          const m = ACQ_META[a.type] ?? ACQ_META.context;
          const done = !!p.acquire[i];
          return (
            <div key={i} className={`rounded-2xl ring-1 px-4 py-3 flex items-start gap-3 ${done ? "ring-emerald-200 bg-emerald-50/30" : "ring-slate-200/80 bg-white"}`}>
              <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                <Icon name={done ? "check" : m.icon} size={16} strokeWidth={done ? 2.5 : 2} />
              </span>
              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center h-[17px] px-1.5 rounded-full ring-1 text-[10px] font-semibold ${m.chip}`}>{m.label}</span>
                <p className="mt-1 text-[12.5px] text-slate-700 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{a.label}</p>
              </div>
              <div className="shrink-0 self-center">
                {done
                  ? <span className="text-[11.5px] font-medium text-emerald-600 inline-flex items-center gap-1"><Icon name="check" size={13} /> {a.type === "access" ? "confirmed" : a.type === "artefact" ? "retrieved" : a.type === "context" ? "read" : "reviewed"}</span>
                  : <button onClick={() => patch((n) => { n.acquire[i] = true; })}
                      className={`h-8 px-3 rounded-lg text-[12px] font-semibold text-white cursor-pointer focus-ring transition-colors ${a.type === "access" ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-600 hover:bg-violet-700"}`}>
                      {a.type === "access" ? "Confirm availability" : a.type === "artefact" ? "Retrieve" : "Mark reviewed"}
                    </button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* organisation context brief */}
      <div className="mt-4 rounded-2xl ring-1 ring-slate-200/80 bg-white p-4">
        <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2.5">Organisation context</div>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center"><Icon name="globe" size={18} /></span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 tracking-tight leading-tight">{task.org}</div>
            {prof && <div className="text-[11px] text-slate-400">{prof.ind}</div>}
          </div>
        </div>
        {prof && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Fact k="Criticality" v={prof.crit} /><Fact k="Headcount" v={prof.staff} />
            <div className="col-span-2"><Fact k="Systems landscape" v={prof.sys} /></div>
          </div>
        )}
        {needCtx ? (
          <button onClick={() => patch((n) => { n.contextAck = true; })} disabled={p.contextAck}
            className={`w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg text-[12.5px] font-semibold cursor-pointer focus-ring transition-colors ${p.contextAck ? "bg-emerald-50 text-emerald-700 cursor-default" : "bg-violet-600 hover:bg-violet-700 text-white"}`}>
            {p.contextAck ? <><Icon name="check" size={14} /> Context acknowledged</> : <>Read &amp; acknowledge</>}
          </button>
        ) : <div className="text-[11px] text-slate-400">No explicit context acknowledgement required for this task.</div>}
      </div>

      <VerbFooter done={allResolved} doneLabel="All prerequisites resolved" nextLabel="Continue to Clarify" onNext={() => goVerb("clarify")} hint="Resolve every checklist item and acknowledge the context." />
    </div>
  );
}

/* ================= R4 · Clarify ================= */

function ClarifyPane({ task, p, patch, goVerb, refs, openDoc }: PaneProps) {
  const understood = task.steps.filter((_, i) => p.clarify[i]?.state === "understood").length;
  const openQ = task.steps.filter((_, i) => p.clarify[i]?.state === "query").length;
  const allDone = understood === task.steps.length;
  return (
    <div>
      <ScreenHead v="R4" name="Clarify" title={`Walk the ${task.steps.length} activity steps`}
        subtitle="For each step of the task, either paraphrase it in your own words or raise a query. Every open query must be resolved before the gate."
        ring={{ value: understood / Math.max(1, task.steps.length), label: `${understood}/${task.steps.length}` }} />
      <DocOpenStrip docs={refs} onOpen={openDoc} tone="violet" label="Task description & activity steps" className="mb-4" />
      {openQ > 0 && (
        <div className="rounded-xl ring-1 ring-amber-200 bg-amber-50 px-4 py-2.5 mb-4 flex items-center gap-2 text-[12.5px] text-amber-800">
          <Icon name="alertTriangle" size={15} /> {openQ} open quer{openQ > 1 ? "ies" : "y"} — resolve to clear the Part D gate.
        </div>
      )}
      <div className="space-y-2.5">
        {task.steps.map((s, i) => (
          <StepRow key={i} step={s} idx={i} rec={p.clarify[i]} patch={patch}
            prevDone={i === 0 || p.clarify[i - 1]?.state === "understood"} />
        ))}
      </div>
      <VerbFooter done={allDone} doneLabel="All steps understood" nextLabel="Continue to Confirm" onNext={() => goVerb("confirm")} hint="Mark every step understood — no open queries." />
    </div>
  );
}

function StepRow({ step, idx, rec, patch, prevDone }: {
  step: { verb: string; text: string }; idx: number; rec: RuaProgress["clarify"][number]; patch: Patch; prevDone: boolean;
}) {
  const state = rec?.state ?? "pending";
  const [mode, setMode] = useState<"para" | "query" | null>(null);
  const [para, setPara] = useState(rec?.paraphrase ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState(rec?.query ?? { unclear: "", think: "", checked: [] as string[] });
  const [resolution, setResolution] = useState(rec?.resolution ?? "");
  const scriptedReply = `This step is a “${step.verb}” action — its job is to move you toward the deliverable, not to be an artefact in itself.`;

  function submitPara() {
    const g = gradeParaphrase(para, step.text);
    if (!g.pass) { setErr(g.reasons.join(" ")); return; }
    setErr(null);
    patch((n) => { n.clarify[idx] = { state: "understood", paraphrase: para }; });
    setMode(null);
  }
  function raiseQuery() {
    patch((n) => { n.clarify[idx] = { state: "query", query: q }; });
  }
  function closeQuery() {
    const g = gradeParaphrase(resolution, step.text);
    if (!g.pass) { setErr(g.reasons.join(" ")); return; }
    setErr(null);
    patch((n) => { n.clarify[idx] = { state: "understood", resolution, wasQueried: true }; });
    setMode(null);
  }
  const done = state === "understood";
  const wellCls = "w-full resize-none rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/40 px-3 py-2.5 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400";

  return (
    <div className={`rounded-2xl ring-1 overflow-hidden ${done ? "ring-emerald-200 bg-emerald-50/30" : state === "query" ? "ring-amber-200 bg-amber-50/30" : "ring-slate-200/80 bg-white"} ${!prevDone && !done ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold ${done ? "bg-emerald-500 text-white" : state === "query" ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-500"}`}>
          {done ? <Icon name="check" size={15} strokeWidth={2.5} /> : idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[10px] font-semibold text-violet-700 bg-violet-50 rounded px-1.5 py-0.5">{step.verb}</span>
            {done && <span className="inline-flex items-center gap-1 h-[17px] px-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold"><Icon name="check" size={9} strokeWidth={3} /> understood</span>}
            {state === "query" && <span className="inline-flex items-center h-[17px] px-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">query open</span>}
          </div>
          <p className="text-[12.5px] text-slate-700 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{step.text}</p>

          {mode === null && state === "pending" && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button onClick={() => setMode("para")} className={`${btnPrimary} h-8 px-3 text-[12px]`}><Icon name="check" size={13} /> I understand this step</button>
              <button onClick={() => setMode("query")} className={`${btnGhost} h-8 px-3 text-[12px]`}><Icon name="messageSquare" size={13} /> Raise a query</button>
            </div>
          )}

          {mode === "para" && (
            <div className="mt-2.5">
              <textarea autoFocus value={para} onChange={(e) => setPara(e.target.value)} rows={2} placeholder="Restate this step in your own words (≥ 12 words, not a copy)…" className={wellCls} />
              <div className="mt-1.5 flex items-center gap-2">
                <button onClick={submitPara} className={`${btnPrimary} h-8 px-3.5 text-[12px]`}>Submit paraphrase</button>
                <button onClick={() => { setMode(null); setErr(null); }} className="text-[12px] text-slate-400 hover:text-slate-700 cursor-pointer">Cancel</button>
                <span className="text-[10.5px] text-slate-400 ml-auto tabular-nums">{wordCount(para)} words</span>
              </div>
              {err && <p className="mt-1 text-[11.5px] text-rose-600">{err}</p>}
            </div>
          )}

          {mode === "query" && state === "pending" && (
            <div className="mt-2.5 space-y-2 rounded-xl bg-white ring-1 ring-slate-200 p-3">
              {([["What is unclear?", "unclear"], ["What I think it means", "think"]] as const).map(([label, key]) => (
                <div key={key}>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-1">{label}</div>
                  <input value={q[key]} onChange={(e) => setQ({ ...q, [key]: e.target.value })} aria-label={label}
                    className="w-full rounded-lg bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/40 px-2.5 py-2 text-[12.5px] text-slate-800 outline-none" />
                </div>
              ))}
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-1">What I checked first</div>
                <div className="flex flex-wrap gap-1.5">
                  {["standard text", "template", "task description"].map((c) => {
                    const on = q.checked.includes(c);
                    return <button key={c} onClick={() => setQ({ ...q, checked: on ? q.checked.filter((x) => x !== c) : [...q.checked, c] })}
                      className={`h-7 px-2.5 rounded-full text-[11px] font-medium ring-1 cursor-pointer focus-ring ${on ? "bg-violet-600 text-white ring-violet-600" : "bg-white ring-slate-200 text-slate-500"}`}>{c}</button>;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={raiseQuery} disabled={!q.unclear.trim()} className={`${btnPrimary} h-8 px-3.5 text-[12px]`}>Raise query</button>
                <button onClick={() => setMode(null)} className="text-[12px] text-slate-400 hover:text-slate-700 cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          {state === "query" && (
            <div className="mt-2.5 space-y-2">
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 px-3 py-2.5 text-[12px] text-amber-900 leading-relaxed">
                <span className="block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-amber-500 mb-1">Mentor replied</span>
                {scriptedReply} Close the query with a one-line resolution paraphrase.
              </div>
              <textarea autoFocus value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2} placeholder="Resolution — what the step means to you now (≥ 12 words)…" className={wellCls} />
              <div className="flex items-center gap-2">
                <button onClick={closeQuery} className={`${btnPrimary} h-8 px-3.5 text-[12px]`}>Close query</button>
                <span className="text-[10.5px] text-slate-400 ml-auto tabular-nums">{wordCount(resolution)} words</span>
              </div>
              {err && <p className="text-[11.5px] text-rose-600">{err}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= R5 · Confirm ================= */

function Composer({ label, v, on, err, sim }: { label: string; v: string; on: (s: string) => void; err: string | null; sim: number }) {
  const parrot = sim > PARROT;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12.5px] font-semibold text-slate-700 tracking-tight">{label}</label>
        <span className={`text-[10px] font-medium tabular-nums ${parrot ? "text-rose-500" : "text-slate-400"}`}>{parrot ? "too close to source" : `${wordCount(v)} words`}</span>
      </div>
      <textarea value={v} onChange={(e) => on(e.target.value)} rows={2} aria-label={label}
        className={`w-full resize-none rounded-xl bg-slate-50 ring-1 px-3 py-2.5 text-[12.5px] text-slate-800 outline-none focus:ring-2 ${parrot ? "ring-rose-200 focus:ring-rose-300" : "ring-slate-200 focus:ring-violet-500/40"}`} />
      <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-200 ${parrot ? "bg-rose-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(100, Math.round(sim * 140))}%` }} />
      </div>
      {err && <p className="mt-1 text-[11.5px] text-rose-600">{err}</p>}
    </div>
  );
}

function ConfirmPane({ task, taskCode, p, patch, goVerb, refs, openDoc }: PaneProps) {
  const cf = p.confirm;
  const items = useMemo(() => boundaryItems(task, taskCode), [task, taskCode]);
  const [produce, setProduce] = useState(cf?.produce ?? "");
  const [acceptWhen, setAcceptWhen] = useState(cf?.acceptWhen ?? "");
  const [bnd, setBnd] = useState<Record<number, "in" | "out">>(cf?.boundaries ?? {});
  const [pErr, setPErr] = useState<string | null>(null);
  const [aErr, setAErr] = useState<string | null>(null);
  const [graded, setGraded] = useState<{ ok: boolean; msg?: string } | null>(cf?.accepted ? { ok: true } : null);

  const boundariesDone = items.every((_, i) => bnd[i]);
  const boundariesCorrect = items.every((it, i) => bnd[i] === it.answer);
  const simP = jaccard(new Set(tokenize(produce)), new Set(tokenize(task.acceptance)));
  const simA = jaccard(new Set(tokenize(acceptWhen)), new Set(tokenize(task.acceptance)));

  function grade() {
    const gp = gradeParaphrase(produce, task.acceptance);
    const ga = gradeParaphrase(acceptWhen, task.acceptance);
    setPErr(gp.pass ? null : gp.reasons.join(" "));
    setAErr(ga.pass ? null : ga.reasons.join(" "));
    if (gp.pass && ga.pass && boundariesDone && boundariesCorrect) setGraded({ ok: true });
    else if (gp.pass && ga.pass && boundariesDone) setGraded({ ok: false, msg: "Your scope sort has a misclassified item — does it directly produce the deliverable, or merely touch it?" });
    else setGraded({ ok: false, msg: "Restatement not yet accepted — see the notes below each field." });
  }
  function accept() {
    patch((n) => { n.confirm = { produce, acceptWhen, boundaries: bnd, accepted: true }; });
    setGraded({ ok: true });
  }

  return (
    <div>
      <ScreenHead v="R5" name="Confirm" title="Lock the deliverable contract"
        subtitle="Restate the final deliverable and its acceptance standard in your own words, then sort the scope boundary. This becomes the reference point for grading your finished work." />
      <DocOpenStrip docs={refs} onOpen={openDoc} tone="violet" label="Deliverable acceptance specification" className="mb-4" />
      <div className="space-y-4">
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Icon name="file" size={14} className="text-violet-600" />
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400">Task-defined deliverable · read-only</span>
          </div>
          <div className="px-4 py-3.5">
            <div className="text-[14px] font-semibold text-slate-900 tracking-tight mb-1">{task.deliverable}</div>
            <p className="text-[12.5px] text-slate-600 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{task.acceptance}</p>
          </div>
        </div>

        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-4 space-y-3.5">
          <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Restate it in your own words</div>
          <Composer label="In my own words, I will produce…" v={produce} on={setProduce} err={pErr} sim={simP} />
          <Composer label="It will be accepted when…" v={acceptWhen} on={setAcceptWhen} err={aErr} sim={simA} />
          <p className="text-[10.5px] text-slate-400">The similarity meter warns when your restatement copies the source. Say it your way — that&apos;s the point of the gate.</p>
        </div>

        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-4">
          <div className="flex items-baseline justify-between mb-2.5">
            <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Scope boundary — sort each item</div>
            <span className="text-[11px] text-slate-400 tabular-nums">{items.filter((_, i) => bnd[i]).length}/{items.length} sorted</span>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => {
              const choice = bnd[i];
              const reveal = graded?.ok;
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl ring-1 ring-slate-200/70 bg-slate-50/60 px-3 py-2.5">
                  <span className="flex-1 text-[12px] text-slate-700 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{it.text}</span>
                  <div className="shrink-0 flex gap-1">
                    {([["in", "In scope"], ["out", "Out"]] as const).map(([val, lab]) => {
                      const on = choice === val;
                      const correct = reveal && it.answer === val;
                      return <button key={val} onClick={() => setBnd({ ...bnd, [i]: val })} disabled={graded?.ok}
                        className={`h-8 px-2.5 rounded-lg text-[11.5px] font-semibold cursor-pointer focus-ring transition-colors disabled:cursor-default ${correct ? "bg-emerald-500 text-white" : on ? "bg-violet-600 text-white" : "bg-white ring-1 ring-slate-200 text-slate-500 hover:bg-slate-100"}`}>{lab}</button>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!graded?.ok && (
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={grade} disabled={!produce.trim() || !acceptWhen.trim() || !boundariesDone} className={`${btnPrimary} h-10 px-4 text-[12.5px]`}>Grade restatement</button>
            {graded && !graded.ok && <span className="text-[12px] text-rose-600 font-medium">{graded.msg}</span>}
          </div>
        )}
        {graded?.ok && !cf?.accepted && (
          <div className="rounded-2xl ring-1 ring-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-emerald-800"><Icon name="checkCircle" size={16} /> Restatement graded — contract ready to accept.</div>
            <button onClick={accept} className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-semibold inline-flex items-center gap-2 cursor-pointer focus-ring"><Icon name="checkSquare" size={14} /> Accept contract</button>
          </div>
        )}
        {cf?.accepted && (
          <div className="rounded-2xl ring-1 ring-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-[12.5px] font-semibold text-emerald-800"><Icon name="checkCircle" size={16} /> Deliverable contract accepted.</div>
        )}
      </div>
      <VerbFooter done={!!cf?.accepted} doneLabel="Contract accepted" nextLabel="Continue to Explain" onNext={() => goVerb("explain")} hint="Grade and accept the deliverable contract to continue." />
    </div>
  );
}

/* ================= R6 · Explain ================= */

function ExplainPane({ task, p, patch, goVerb, refs, openDoc }: PaneProps) {
  const total = task.concepts.length;
  const passedCount = task.concepts.filter((_, i) => p.explain[i]?.passed).length;
  const [queue, setQueue] = useState<number[]>(() => task.concepts.map((_, i) => i).filter((i) => !p.explain[i]?.passed));
  const idx = queue[0];
  const allDone = passedCount === total;

  const [explain, setExplain] = useState("");
  const [example, setExample] = useState("");
  const [result, setResult] = useState<ExplainGrade | null>(null);

  function submit() {
    const g = gradeExplain(explain, example, task.concepts[idx], task.org);
    setResult(g);
    patch((n) => {
      const attempts = (n.explain[idx]?.attempts ?? 0) + (g.pass ? 0 : 1);
      n.explain[idx] = { passed: g.pass, attempts, score: g.avg, explain, example };
    });
  }
  function advance() {
    setQueue((qu) => (result?.pass ? qu.slice(1) : [...qu.slice(1), qu[0]]));
    setExplain(""); setExample(""); setResult(null);
  }

  return (
    <div>
      <ScreenHead v="R6" name="Explain" title="Explain every key concept in your own words"
        subtitle="Each card shows the concept title only. Explain it, then ground it in an example from the assigned organisation. The system grades every explanation."
        ring={{ value: passedCount / Math.max(1, total), label: `${passedCount}/${total}` }} />

      {/* mastery track */}
      <div className="flex items-center gap-1.5 mb-4">
        {task.concepts.map((_, i) => {
          const done = p.explain[i]?.passed;
          return <span key={i} className={`h-1.5 flex-1 rounded-full ${done ? "bg-emerald-400" : i === idx ? "bg-violet-500" : "bg-slate-200"}`} />;
        })}
      </div>

      {allDone ? (
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white text-center py-9 px-5">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3"><Icon name="lightbulb" size={22} /></div>
          <h4 className="text-[15px] font-semibold text-slate-900 tracking-tight">All {total} concepts mastered</h4>
          <p className="mt-1 text-[12.5px] text-slate-500" style={{ textWrap: "pretty" }}>Part B is complete. Your explanations are stored for the readiness ledger.</p>
        </div>
      ) : (
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
          <div className="px-4 pt-4 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center h-[17px] px-1.5 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-[10px] font-semibold">Concept {passedCount + 1} of {total}</span>
              {(p.explain[idx]?.attempts ?? 0) > 0 && <span className="text-[11px] text-amber-600 font-medium">re-queued · attempt {(p.explain[idx]?.attempts ?? 0) + 1}</span>}
            </div>
            <h4 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{task.concepts[idx]}</h4>
          </div>
          {refs[idx] && (
            <div className="px-4 pt-3">
              <button onClick={() => openDoc(refs[idx])}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 cursor-pointer focus-ring transition-colors">
                <Icon name="book" size={12} /> Open the study primer for this concept
              </button>
            </div>
          )}

          {!result ? (
            <div className="px-4 py-3.5 space-y-3">
              {([["Explain the concept", "Define it and why it matters — in your words.", explain, setExplain, 4], [`Give an example from ${task.org.split(/\s+/).slice(0, 2).join(" ")}…`, "Anchor it in the assigned organisation.", example, setExample, 2]] as const).map(([label, hint, v, on, rows], k) => (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12.5px] font-semibold text-slate-700 tracking-tight">{label}</label>
                    <span className="text-[10px] text-slate-400 tabular-nums">{wordCount(v)} words</span>
                  </div>
                  <textarea value={v} onChange={(e) => on(e.target.value)} rows={rows} placeholder={hint} aria-label={label}
                    className="w-full resize-none rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/40 px-3 py-2.5 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400" />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={submit} disabled={!explain.trim() || !example.trim()} className={`${btnPrimary} h-9 px-4 text-[12.5px]`}><Icon name="send" size={13} /> Submit for grading</button>
                <span className="text-[11px] text-slate-400">No model answer shown first.</span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3.5 space-y-3.5">
              <div className={`rounded-xl p-3.5 ring-1 ${result.pass ? "bg-emerald-50 ring-emerald-200" : "bg-amber-50 ring-amber-200"}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[12.5px] font-semibold ${result.pass ? "text-emerald-800" : "text-amber-800"}`}>{result.pass ? "Passed" : "Below threshold — re-queued"} · avg {result.avg}/4</span>
                  <div className="flex gap-1">
                    {["Accuracy", "Own words", "Depth", "Example"].map((d, k) => (
                      <span key={k} title={d} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${result.dims[k] >= 3 ? "bg-emerald-100 text-emerald-700" : result.dims[k] >= 2 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"}`}>{result.dims[k]}</span>
                    ))}
                  </div>
                </div>
                {!result.pass && result.reasons.length > 0 && (
                  <ul className="mt-2 space-y-1">{result.reasons.map((r, k) => <li key={k} className="text-[12px] text-amber-800/90 flex items-start gap-1.5"><Icon name="arrowRight" size={12} className="mt-0.5 shrink-0" />{r}</li>)}</ul>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1.5">Model key points</div>
                  <p className="text-[12px] text-slate-700 leading-relaxed" style={{ textWrap: "pretty" }}>{task.concepts[idx]}</p>
                </div>
                <div className="rounded-xl bg-violet-50/70 p-3">
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-violet-600 mb-1.5">Your explanation</div>
                  <p className="text-[12px] text-slate-700 leading-relaxed" style={{ textWrap: "pretty" }}>{explain}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={advance} className={`${btnPrimary} h-9 px-4 text-[12.5px]`}>{result.pass ? "Next concept" : "Try this again later"} <Icon name="arrowRight" size={13} /></button>
              </div>
            </div>
          )}
        </div>
      )}
      <VerbFooter done={allDone} doneLabel="All concepts mastered" nextLabel="Continue to Answer" onNext={() => goVerb("answer")} hint="Master every concept card to continue." />
    </div>
  );
}

/* ================= R7 · Answer ================= */

function AnswerPane({ task, taskCode, p, patch, goVerb }: PaneProps) {
  const meta = TASK_META[taskCode];
  const N = task.questions.length;
  const [started, setStarted] = useState(false);
  const [qi, setQi] = useState(0);
  const [stage, setStage] = useState<"answer" | "followup" | "scored">("answer");
  const [answer, setAnswer] = useState("");
  const [fu, setFu] = useState("");
  const [conf, setConf] = useState(3);
  const [local, setLocal] = useState<Record<number, { answer: string; fu: string; outcome: AnswerOutcome; res: AnswerGrade }>>({});

  function scoreCurrent() {
    const g = gradeAnswer(answer, fu, task);
    setLocal((l) => ({ ...l, [qi]: { answer, fu, outcome: g.outcome, res: g } }));
    setStage("scored");
  }
  function nextQ() {
    if (qi + 1 < N) { setQi(qi + 1); setStage("answer"); setAnswer(""); setFu(""); setConf(3); }
    else {
      patch((n) => {
        task.questions.forEach((_, i) => { const r = local[i]; if (r) n.answer[i] = { outcome: r.outcome, answer: r.answer, fu: r.fu }; });
        n.answerDone = true;
      });
    }
  }
  function retakeFails() {
    const fails = task.questions.map((_, i) => i).filter((i) => p.answer[i]?.outcome === "fail");
    if (fails.length === 0) return;
    setLocal((l) => { const nl = { ...l }; fails.forEach((i) => delete nl[i]); return nl; });
    patch((n) => { n.answerDone = false; fails.forEach((i) => { n.answer[i] = null; }); });
    setStarted(true); setQi(fails[0]); setStage("answer"); setAnswer(""); setFu(""); setConf(3);
  }

  // completed session view
  if (p.answerDone) {
    const fails = task.questions.filter((_, i) => p.answer[i]?.outcome === "fail").length;
    const partials = task.questions.filter((_, i) => p.answer[i]?.outcome === "partial").length;
    const pass = N - fails - partials;
    return (
      <div>
        <ScreenHead v="R7" name="Answer" title="Readiness verification — session complete" />
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-4">
          <div className="flex items-center gap-3.5 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fails ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}><Icon name={fails ? "refresh" : "checkCircle"} size={24} /></div>
            <div>
              <div className="text-[15px] font-semibold text-slate-900 tracking-tight">{fails ? "Remediation required" : "Session passed"}</div>
              <div className="text-[12px] text-slate-500">{pass} passed · {partials} partial · {fails} fail</div>
            </div>
          </div>
          <div className="space-y-2">
            {task.questions.map((q, i) => {
              const o = p.answer[i]?.outcome;
              return (
                <div key={i} className="flex items-start gap-3 rounded-xl ring-1 ring-slate-200/70 px-3 py-2.5">
                  <span className={`shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center ${o === "pass" ? "bg-emerald-50 text-emerald-600" : o === "partial" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
                    <Icon name={o === "pass" ? "check" : o === "partial" ? "minus" : "x"} size={13} strokeWidth={2.5} />
                  </span>
                  <span className="flex-1 text-[12.5px] text-slate-700 tracking-tight leading-snug">{q}</span>
                  <span className={`shrink-0 text-[10.5px] font-semibold uppercase tracking-wide ${o === "pass" ? "text-emerald-600" : o === "partial" ? "text-amber-600" : "text-rose-600"}`}>{o}</span>
                </div>
              );
            })}
          </div>
          {fails > 0 && (
            <button onClick={retakeFails} className="mt-4 h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[12.5px] font-semibold inline-flex items-center gap-2 cursor-pointer focus-ring"><Icon name="refresh" size={14} /> Retake failed questions</button>
          )}
        </div>
        <VerbFooter done={fails === 0} doneLabel="Verification passed" nextLabel="Continue to Attest" onNext={() => goVerb("attest")} hint="Clear all failed questions to continue." />
      </div>
    );
  }

  // intro
  if (!started) {
    return (
      <div>
        <ScreenHead v="R7" name="Answer" title="Understanding verification session"
          subtitle="The system administers the verification questions as an adaptive, oral-style examination with follow-up probes. One question at a time · no back-navigation." />
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-4">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center"><Icon name="bot" size={20} /></div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-slate-900 tracking-tight">Examined by {meta?.mentorRole ?? "the AI mentor"}</div>
              {meta?.persona && <div className="text-[12px] text-slate-500 mb-3">Persona: {meta.persona}. Expect one probing follow-up per answer.</div>}
              <ul className="space-y-1.5 mb-4">
                {[`${N} questions, one at a time`, "Free-text answers", "No teaching mid-session — this is examination discipline", "Graded on correctness, reasoning and organisation-fit"].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-600 tracking-tight"><Icon name="check" size={14} className="text-violet-600 mt-0.5 shrink-0" />{t}</li>
                ))}
              </ul>
              <button onClick={() => setStarted(true)} className={`${btnPrimary} h-10 px-4 text-[13px]`}><Icon name="play" size={14} /> Enter the session room</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // active session
  const rec = local[qi];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center"><Icon name="bot" size={15} /></span>
          <div>
            <div className="text-[12.5px] font-semibold text-slate-900">Verification session</div>
            {meta && <div className="text-[11px] text-slate-500">{meta.mentorRole} · {meta.persona}</div>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">{task.questions.map((_, i) => (<span key={i} className={`w-2 h-2 rounded-full ${i < qi ? "bg-emerald-400" : i === qi ? "bg-violet-500" : "bg-slate-200"}`} />))}</div>
      </div>
      <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center h-[17px] px-1.5 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-[10px] font-semibold">Question {qi + 1} / {N}</span>
          <span className="text-[11px] text-slate-400">no back-navigation</span>
        </div>
        <h4 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-snug mb-4" style={{ textWrap: "pretty" }}>{task.questions[qi]}</h4>

        {stage === "answer" && (
          <div className="space-y-3">
            <textarea autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Your answer — reason it through and apply it to this organisation…" aria-label="Your answer"
              className="w-full resize-none rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/40 px-3.5 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400" />
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                <span>Confidence</span>
                <input type="range" min={1} max={5} value={conf} onChange={(e) => setConf(+e.target.value)} className="accent-violet-600" aria-label="Confidence" />
                <span className="tabular-nums w-3">{conf}</span>
              </div>
              <span className="text-[10.5px] text-slate-400 ml-auto tabular-nums">{wordCount(answer)} words</span>
              <button onClick={() => setStage("followup")} disabled={wordCount(answer) < 6} className={`${btnPrimary} h-9 px-4 text-[12.5px]`}>Submit answer <Icon name="arrowRight" size={13} /></button>
            </div>
          </div>
        )}

        {stage === "followup" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-violet-50/70 px-3.5 py-3">
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-violet-600 mb-1">Follow-up probe</div>
              <p className="text-[12.5px] text-slate-800 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{followUp(qi)}</p>
            </div>
            <textarea autoFocus value={fu} onChange={(e) => setFu(e.target.value)} rows={3} placeholder="Respond to the probe…" aria-label="Follow-up response"
              className="w-full resize-none rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/40 px-3.5 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400" />
            <div className="flex justify-end"><button onClick={scoreCurrent} className={`${btnPrimary} h-9 px-4 text-[12.5px]`}>Submit &amp; score</button></div>
          </div>
        )}

        {stage === "scored" && rec && (
          <div className="space-y-3">
            <div className={`rounded-xl p-3.5 ring-1 ${rec.outcome === "pass" ? "bg-emerald-50 ring-emerald-200" : rec.outcome === "partial" ? "bg-amber-50 ring-amber-200" : "bg-rose-50 ring-rose-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[12.5px] font-semibold ${rec.outcome === "pass" ? "text-emerald-800" : rec.outcome === "partial" ? "text-amber-800" : "text-rose-800"}`}>{rec.outcome === "pass" ? "Pass" : rec.outcome === "partial" ? "Partial" : "Fail"}</span>
                <span className="text-[11px] text-slate-500">· concept coverage {Math.round(rec.res.cov * 100)}%</span>
              </div>
              {rec.res.reasons.length > 0
                ? <ul className="space-y-1">{rec.res.reasons.map((r, k) => <li key={k} className="text-[12px] text-slate-600 flex items-start gap-1.5"><Icon name="arrowRight" size={12} className="mt-0.5 shrink-0" />{r}</li>)}</ul>
                : <p className="text-[12px] text-slate-600">Solid — you applied the principle and tied it to the organisation.</p>}
            </div>
            <div className="flex justify-end"><button onClick={nextQ} className={`${btnPrimary} h-9 px-4 text-[12.5px]`}>{qi + 1 < N ? "Next question" : "Finish session"} <Icon name="arrowRight" size={13} /></button></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= R8 · Attest ================= */

const DECISION_META: Record<GateDecision, { label: string; tone: Rag; icon: "rocket" | "flag" | "lock"; head: string; sub: string }> = {
  READY: { label: "READY", tone: "green", icon: "rocket", head: "Step 1 unlocked", sub: "All five readiness criteria are green. Submit this gate for the AI mentor's review to open the task." },
  CONDITIONAL: { label: "CONDITIONAL", tone: "amber", icon: "flag", head: "Step 1 unlocked with watch-items", sub: "Non-critical criteria are amber. The mentor will probe these during the task's Review and Sign-off." },
  NOT_READY: { label: "NOT READY", tone: "red", icon: "lock", head: "Step 1 stays locked", sub: "A critical criterion is red or a query is open. The failing parts re-open for targeted remediation." },
};

function AttestPane({ task, p, patch, ledger }: PaneProps & { ledger: Ledger }) {
  const [sig, setSig] = useState(p.attest?.signature ?? "");
  const decided = p.attest?.decision;
  const anyRed = ledger.criteria.some((c) => c.state === "red") || ledger.openQueries;
  const canRequest = sig.trim().length >= 2 && !anyRed;

  function requestDecision() {
    patch((n) => { n.attest = { signature: sig, decision: ledger.decision, at: new Date().toISOString() }; });
  }

  return (
    <div>
      <ScreenHead v="R8" name="Attest" title="Readiness sign-off gate"
        subtitle="The system evaluates the five criteria from your Parts A–C evidence. Your attestation and the decision are recorded with your submission." />

      <div className="space-y-4">
        {/* readiness ledger */}
        <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400">Readiness ledger · five criteria</span>
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums">{ledger.criteria.filter((c) => c.state === "green").length}/5 green</span>
          </div>
          <div>
            {ledger.criteria.map((c) => {
              const col = RAG_CLS[c.state];
              return (
                <div key={c.key} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                  <span className={`shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg ${col.chip}`}><span className={`w-2 h-2 rounded-full ${col.dot}`} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-semibold text-slate-800 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{c.label}</span>
                      {c.critical && <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-rose-500 bg-rose-50 rounded px-1 py-0.5">critical</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 tracking-tight mt-0.5 font-mono">{c.ev}</div>
                  </div>
                  <span className={`shrink-0 text-[10.5px] font-semibold uppercase tracking-wide self-center ${col.text}`}>{c.state}</span>
                </div>
              );
            })}
          </div>
        </div>

        {!decided ? (
          <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white p-4">
            <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Attestation</div>
            <p className="text-[12.5px] text-slate-700 tracking-tight leading-relaxed mb-3" style={{ textWrap: "pretty" }}>
              I have completed the requirement and understanding analysis for <span className="font-semibold">{task.deliverable}</span> at {task.org} and am ready to begin.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">Typed-name signature</label>
                <input value={sig} onChange={(e) => setSig(e.target.value)} placeholder="Type your full name"
                  className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/40 px-3 py-2.5 text-[13px] text-slate-800 outline-none" />
              </div>
              <button onClick={requestDecision} disabled={!canRequest} className={`${btnPrimary} h-10 px-4 text-[12.5px] shrink-0`}><Icon name="shield" size={14} /> Request gate decision</button>
            </div>
            {anyRed && <p className="mt-2.5 text-[12px] text-rose-600 flex items-center gap-1.5"><Icon name="alertTriangle" size={14} /> {ledger.openQueries ? "Resolve the open Clarify query first." : "Clear the red criterion before requesting a decision."}</p>}
            {!anyRed && ledger.decision !== "READY" && <p className="mt-2.5 text-[12px] text-amber-600 flex items-center gap-1.5"><Icon name="info" size={14} /> Current evidence points to a {ledger.decision === "CONDITIONAL" ? "CONDITIONAL" : "NOT READY"} decision — you may still request it.</p>}
          </div>
        ) : (
          <GateOutcomePanel decision={decided} ledger={ledger} onRerun={() => patch((n) => { n.attest = null; })} />
        )}
      </div>
    </div>
  );
}

function GateOutcomePanel({ decision, ledger, onRerun }: { decision: GateDecision; ledger: Ledger; onRerun: () => void }) {
  const d = DECISION_META[decision];
  const col = RAG_CLS[d.tone];
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200/80">
      <div className={`px-4 py-4 flex items-start gap-3.5 ${col.chip}`}>
        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white ${col.dot}`}><Icon name={d.icon} size={22} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10.5px] font-bold uppercase tracking-[0.14em] ${col.text}`}>Gate decision</span>
            <span className={`text-[10.5px] font-bold uppercase tracking-[0.14em] rounded px-1.5 py-0.5 text-white ${col.dot}`}>{d.label}</span>
          </div>
          <div className="text-[16px] font-semibold text-slate-900 tracking-tight mt-0.5">{d.head}</div>
          <p className="text-[12.5px] text-slate-600 tracking-tight mt-1" style={{ textWrap: "pretty" }}>{d.sub}</p>
        </div>
      </div>
      {decision !== "READY" && ledger.watch.length > 0 && (
        <div className="px-4 py-3.5 bg-white">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">{decision === "CONDITIONAL" ? "Watch-items the mentor will probe" : "Re-open for remediation"}</div>
          <ul className="space-y-1.5">{ledger.watch.map((w, i) => <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-700 tracking-tight"><Icon name={decision === "CONDITIONAL" ? "eye" : "refresh"} size={14} className="mt-0.5 shrink-0 text-slate-400" />{w}</li>)}</ul>
        </div>
      )}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[12px] text-slate-500 tracking-tight">
          {decision === "NOT_READY" ? "Remediate the failing parts, then re-run the gate." : "Now submit this gate below — the AI mentor grades your evidence and unlocks Step 1."}
        </span>
        <button onClick={onRerun} className={`${btnGhost} h-8 px-3 text-[11.5px]`}><Icon name="refresh" size={13} /> Re-run gate</button>
      </div>
    </div>
  );
}

/* ================= workspace shell ================= */

export function RuaWorkspace({ taskCode, value, onChange }: WorkspaceProps) {
  const task = getRuaTask(taskCode);
  const allRefs = (taskCode ? RUA_REFS[taskCode] : undefined) ?? [];
  const [p, setP] = useState<RuaProgress>(() => {
    const base = task ? emptyProgress(task) : ({} as RuaProgress);
    // restore any previously drafted progress field-by-field
    for (const k of Object.keys(base) as (keyof RuaProgress)[]) {
      const saved = seed<RuaProgress[typeof k] | undefined>(value, k, undefined);
      if (saved !== undefined) (base as unknown as Record<string, unknown>)[k] = saved;
    }
    return base;
  });
  const [tab, setTab] = useState("study");
  const fw = useFloatingDocs();

  const patch: Patch = (mut) => setP((prev) => { const n = JSON.parse(JSON.stringify(prev)) as RuaProgress; mut(n); return n; });

  const ledger = useMemo(() => (task ? computeLedger(task, p) : null), [task, p]);
  const decision = p.attest?.decision;
  const objectiveMet = decision === "READY" || decision === "CONDITIONAL";

  useLift({ ...p, objectiveMet } as unknown as Record<string, unknown>, onChange);

  if (!task || !ledger) {
    return <GivenNote>The readiness-gate content for this task hasn&apos;t been published yet.</GivenNote>;
  }

  const doneMap: Record<string, boolean> = {
    study: task.controls.every((_, i) => p.study[i]?.passed),
    inspect: task.templates.every((_, i) => p.inspect[i]),
    acquire: task.acquire.every((_, i) => p.acquire[i]) && (!task.acquire.some((a) => a.type === "context") || p.contextAck),
    clarify: task.steps.every((_, i) => p.clarify[i]?.state === "understood"),
    confirm: !!p.confirm?.accepted,
    explain: task.concepts.every((_, i) => p.explain[i]?.passed),
    answer: p.answerDone && !task.questions.some((_, i) => p.answer[i]?.outcome === "fail"),
    attest: !!decision,
  };

  const tabs: TabDef[] = [
    { key: "study", label: "Study", icon: "book", blurb: "Governing controls & cross-walk", done: doneMap.study, group: "A · Requirement Analysis" },
    { key: "inspect", label: "Inspect", icon: "table", blurb: "Every provided template", done: doneMap.inspect },
    { key: "acquire", label: "Acquire", icon: "download", blurb: "Prerequisite inputs & access", done: doneMap.acquire },
    { key: "clarify", label: "Clarify", icon: "messageSquare", blurb: "Walk the activity steps", done: doneMap.clarify },
    { key: "confirm", label: "Confirm", icon: "handshake", blurb: "Lock the deliverable contract", done: doneMap.confirm },
    { key: "explain", label: "Explain", icon: "lightbulb", blurb: "Every concept, in your words", done: doneMap.explain, group: "B · Key Concepts" },
    { key: "answer", label: "Answer", icon: "chat", blurb: "Adaptive readiness Q&A", done: doneMap.answer, group: "C · Understanding Verification" },
    { key: "attest", label: "Attest", icon: "shield", blurb: "Request the gate decision", done: doneMap.attest, group: "D · Readiness Sign-off" },
  ];
  const doneCount = tabs.filter((t) => t.done).length;
  const paneProps: PaneProps = {
    task, taskCode: taskCode ?? "", p, patch, goVerb: setTab,
    refs: allRefs.filter((r) => r.tab === tab), openDoc: fw.open,
  };

  return (
    <div>
      <div className="mb-4">
        <GivenNote>
          A mandatory preparation gate before the task starts. Work the eight steps across four parts —
          every control check, exercise and paraphrase is graded as you go, and the Part D gate decides
          READY / CONDITIONAL / NOT READY from your evidence.
        </GivenNote>
      </div>

      <div className="md:flex md:items-start md:gap-5">
        <TabRail tabs={tabs} active={tab} onSelect={setTab} progressLabel={`${doneCount}/${tabs.length} steps complete`} />

        <div className="min-w-0 flex-1 md:border-l md:border-slate-100 md:pl-5 md:min-h-[300px] md:flex md:flex-col [&>*:first-child]:flex-1">
          {tab === "study" && <StudyPane {...paneProps} />}
          {tab === "inspect" && <InspectPane {...paneProps} />}
          {tab === "acquire" && <AcquirePane {...paneProps} />}
          {tab === "clarify" && <ClarifyPane {...paneProps} />}
          {tab === "confirm" && <ConfirmPane {...paneProps} />}
          {tab === "explain" && <ExplainPane {...paneProps} />}
          {tab === "answer" && <AnswerPane {...paneProps} />}
          {tab === "attest" && <AttestPane {...paneProps} ledger={ledger} />}
          <PaneNav tabs={tabs} active={tab} onSelect={setTab} />
        </div>
      </div>

      {/* open reference documents float above the desk, draggable */}
      <FloatingDocs docs={fw.docs} onClose={fw.close} onFocus={fw.focus} />
    </div>
  );
}
