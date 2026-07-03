"use client";

// Task-boundary gate workspaces. RuaWorkspace opens every task (Requirement & Understanding
// Analysis — prove you understand the work before starting); ResearchWorkspace closes it
// (Research Submission — evidence the research behind the deliverable). Both ride the normal
// activity pipeline: graded fields lift into the payload, `objectiveMet` blocks submission
// until the gate criteria are met.
//
// Visual language: two shared patterns keep everything on one grid — NoteCard (header row with a
// fixed status slot + an input well) for anything typed, CheckRow (identical leading checkbox)
// for anything toggled. The RUA's four parts hang off a vertical gate rail (A→D beads, violet
// while open, emerald when complete) since the parts are a real sequence.

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { type WorkspaceProps, useLift, seed, SectionLabel, WTextArea, GivenNote } from "./kit";
import { getRuaTask } from "@/lib/rua-tasks";
import { RESEARCH_METHODS, RESEARCH_SOURCE_TYPES, fillMethod } from "@/lib/research-methods";
import { TASK_META } from "@/lib/taskmeta";

const filled = (s: string, min = 20) => s.trim().length >= min;

/** Fixed-width status slot — a tick appears without shifting the row. */
function StatusTick({ on }: { on: boolean }) {
  return (
    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${on ? "bg-emerald-500 text-white" : "bg-slate-100 text-transparent"}`}>
      <Icon name="check" size={10} strokeWidth={3} />
    </span>
  );
}

/** Shared toggle row — one identical checkbox affordance for Inspect / Acquire / Clarify. */
function CheckRow({ on, onToggle, children }: { on: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onToggle} aria-pressed={on}
      className={`w-full text-left flex items-start gap-2.5 rounded-xl px-3 py-2.5 ring-1 transition-colors ${on ? "bg-emerald-50/50 ring-emerald-200/80" : "bg-white ring-slate-200/80 hover:bg-slate-50"}`}>
      <span className={`mt-px shrink-0 w-4 h-4 rounded flex items-center justify-center ring-1 transition-colors ${on ? "bg-emerald-500 ring-emerald-500 text-white" : "bg-white ring-slate-300 text-transparent"}`}>
        <Icon name="check" size={10} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

/** Shared typed-answer card — header row (leading chip + label + fixed status slot), input well below. */
function NoteCard({ lead, label, done, children }: { lead?: React.ReactNode; label: React.ReactNode; done: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-200/80 p-3">
      <div className="flex items-start gap-2 mb-2">
        {lead}
        <span className="min-w-0 flex-1 text-[12.5px] text-slate-800 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{label}</span>
        <StatusTick on={done} />
      </div>
      {children}
    </div>
  );
}

/** Borderless input on a quiet well — lives inside a NoteCard. */
function WellInput({ value, onChange, placeholder, rows }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const cls = "w-full px-3 py-2 rounded-lg bg-slate-50/80 ring-1 ring-slate-200/60 focus:ring-2 focus:ring-indigo-500/30 focus:bg-white outline-none text-[12.5px] text-slate-900 placeholder:text-slate-400 leading-relaxed transition-colors";
  return rows ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${cls} resize-none`} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} h-9 py-0`} />
  );
}

/** Small index bead used as a NoteCard lead for numbered items. */
function IndexBead({ n }: { n: number }) {
  return <span className="shrink-0 w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[9.5px] font-semibold flex items-center justify-center tabular-nums mt-px">{n}</span>;
}

/* ================= RUA — Requirement & Understanding Analysis ================= */

/** A part of the gate sequence: bead on the rail, header row, content column. */
function GatePart({ id, label, done, total, last, children }: {
  id: string; label: string; done: number; total: number; last?: boolean; children: React.ReactNode;
}) {
  const complete = done >= total;
  return (
    <section className="relative pl-9">
      {/* rail segment + bead */}
      {!last && <span aria-hidden className="absolute left-[11px] top-7 bottom-[-8px] w-px bg-slate-200" />}
      <span className={`absolute left-0 top-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-semibold ring-1 ${complete ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-violet-100 text-violet-700 ring-violet-200"}`}>
        {complete ? <Icon name="check" size={13} strokeWidth={3} /> : id}
      </span>
      <div className="flex items-baseline gap-2 min-h-6">
        <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight">{label}</h3>
        <span className="ml-auto text-[11px] text-slate-400 tabular-nums">{done}/{total}</span>
      </div>
      <div className="mt-3 space-y-5 pb-8">{children}</div>
    </section>
  );
}

export function RuaWorkspace({ taskCode, value, onChange }: WorkspaceProps) {
  const task = getRuaTask(taskCode);

  const [controlNotes, setControlNotes] = useState<string[]>(() => seed(value, "controlNotes", (task?.controls ?? []).map(() => "")));
  const [templatesReviewed, setTemplatesReviewed] = useState<boolean[]>(() => seed(value, "templatesReviewed", (task?.templates ?? []).map(() => false)));
  const [acquired, setAcquired] = useState<boolean[]>(() => seed(value, "acquired", (task?.acquire ?? []).map(() => false)));
  const [stepsUnderstood, setStepsUnderstood] = useState<boolean[]>(() => seed(value, "stepsUnderstood", (task?.steps ?? []).map(() => false)));
  const [contractAccepted, setContractAccepted] = useState<boolean>(() => seed(value, "contractAccepted", false));
  const [conceptExplanations, setConceptExplanations] = useState<string[]>(() => seed(value, "conceptExplanations", (task?.concepts ?? []).map(() => "")));
  const [answers, setAnswers] = useState<string[]>(() => seed(value, "answers", (task?.questions ?? []).map(() => "")));
  const [attested, setAttested] = useState<boolean>(() => seed(value, "attested", false));

  const setAt = <T,>(set: (f: (xs: T[]) => T[]) => void) => (i: number, v: T) => set((xs) => xs.map((x, j) => (j === i ? v : x)));
  const setControlNote = setAt<string>(setControlNotes);
  const setConcept = setAt<string>(setConceptExplanations);
  const setAnswer = setAt<string>(setAnswers);
  const toggle = (set: (f: (xs: boolean[]) => boolean[]) => void) => (i: number) => set((xs) => xs.map((x, j) => (j === i ? !x : x)));

  const aDone =
    controlNotes.filter((n) => filled(n)).length + templatesReviewed.filter(Boolean).length +
    acquired.filter(Boolean).length + stepsUnderstood.filter(Boolean).length + (contractAccepted ? 1 : 0);
  const aTotal = controlNotes.length + templatesReviewed.length + acquired.length + stepsUnderstood.length + 1;
  const bDone = conceptExplanations.filter((c) => filled(c)).length;
  const cDone = answers.filter((a) => filled(a)).length;
  const ready = aDone >= aTotal && bDone >= conceptExplanations.length && cDone >= answers.length;
  const objectiveMet = ready && attested;

  useLift({ controlNotes, templatesReviewed, acquired, stepsUnderstood, contractAccepted, conceptExplanations, answers, attested, objectiveMet }, onChange);

  if (!task) {
    return <GivenNote>The readiness-gate content for this task hasn&apos;t been published yet.</GivenNote>;
  }

  return (
    <div>
      <div className="mb-6">
        <GivenNote>
          A mandatory preparation gate before the task starts. Work the four parts — Requirement Analysis,
          Key Concepts, Understanding Verification, Readiness Sign-off. Nothing in this task unlocks until
          the AI mentor passes this gate.
        </GivenNote>
      </div>

      <GatePart id="A" label="Requirement Analysis" done={aDone} total={aTotal}>
        <div>
          <SectionLabel hint="one or two lines each">Study — what each control requires of this task</SectionLabel>
          <div className="space-y-2">
            {task.controls.map((c, i) => (
              <NoteCard key={c.ref} done={filled(controlNotes[i] ?? "")}
                lead={<span className="inline-flex items-center h-[18px] px-1.5 rounded bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-[10px] font-mono font-medium shrink-0">{c.ref}</span>}
                label={c.name}>
                <WellInput value={controlNotes[i] ?? ""} onChange={(v) => setControlNote(i, v)} placeholder="What does this control require here?" />
              </NoteCard>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] text-slate-400">NIST CSF cross-walk</span>
            {task.crosswalk.map((x) => (
              <span key={x.code} title={x.desc} className="inline-flex items-center h-[18px] px-1.5 rounded bg-slate-100 text-slate-600 ring-1 ring-slate-200 text-[10px] font-mono">{x.code}</span>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel hint="tick each once inspected">Inspect — the provided templates</SectionLabel>
          <div className="space-y-2">
            {task.templates.map((t, i) => (
              <CheckRow key={t.name} on={!!templatesReviewed[i]} onToggle={() => toggle(setTemplatesReviewed)(i)}>
                <span className="flex items-center gap-1.5">
                  <Icon name={t.fmt === "sheet" ? "table" : "file"} size={12} className="text-slate-400 shrink-0" />
                  <span className="text-[12.5px] font-medium text-slate-800 tracking-tight">{t.name}</span>
                </span>
                <span className="block text-[11.5px] text-slate-500 mt-0.5 tracking-tight leading-snug">{t.purpose}</span>
                {t.fields.length > 0 && (
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {t.fields.map((f) => <span key={f} className="inline-flex h-[17px] items-center px-1.5 rounded bg-slate-100 text-slate-500 text-[9.5px]">{f}</span>)}
                  </span>
                )}
              </CheckRow>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel hint="tick each once in hand">Acquire — prerequisite inputs</SectionLabel>
          <div className="space-y-2">
            {task.acquire.map((a, i) => (
              <CheckRow key={i} on={!!acquired[i]} onToggle={() => toggle(setAcquired)(i)}>
                <span className="text-[12px] text-slate-700 tracking-tight leading-snug">{a.label}</span>
              </CheckRow>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel hint="tick each step you understand">Clarify — the activity steps ahead</SectionLabel>
          <div className="space-y-2">
            {task.steps.map((s, i) => (
              <CheckRow key={i} on={!!stepsUnderstood[i]} onToggle={() => toggle(setStepsUnderstood)(i)}>
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.06em]">{i + 1} · {s.verb}</span>
                <span className="block text-[12px] text-slate-600 tracking-tight leading-snug mt-0.5">{s.text}</span>
              </CheckRow>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Confirm — the deliverable contract</SectionLabel>
          <div className={`rounded-xl p-4 ring-1 transition-colors ${contractAccepted ? "bg-emerald-50/50 ring-emerald-200/80" : "bg-violet-50/40 ring-violet-200/70"}`}>
            <div className="text-[12.5px] font-semibold text-slate-900 tracking-tight">{task.deliverable}</div>
            <p className="text-[12px] text-slate-600 mt-1 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{task.acceptance}</p>
            <button onClick={() => setContractAccepted(!contractAccepted)}
              className={`mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-medium ring-1 transition-colors ${contractAccepted ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-violet-700 ring-violet-200 hover:bg-violet-50"}`}>
              <Icon name={contractAccepted ? "check" : "handshake"} size={13} strokeWidth={contractAccepted ? 3 : 2} />
              {contractAccepted ? "Contract accepted" : "I accept this deliverable contract"}
            </button>
          </div>
        </div>
      </GatePart>

      <GatePart id="B" label="Key Concepts" done={bDone} total={task.concepts.length}>
        <div>
          <SectionLabel hint="graded — not copied definitions">Explain each in your own words</SectionLabel>
          <div className="space-y-2">
            {task.concepts.map((c, i) => (
              <NoteCard key={i} done={filled(conceptExplanations[i] ?? "")} lead={<IndexBead n={i + 1} />} label={c}>
                <WellInput value={conceptExplanations[i] ?? ""} onChange={(v) => setConcept(i, v)} placeholder="In your own words…" rows={2} />
              </NoteCard>
            ))}
          </div>
        </div>
      </GatePart>

      <GatePart id="C" label="Understanding Verification" done={cDone} total={task.questions.length}>
        <div>
          <SectionLabel hint="the mentor probes these at the gate">Answer the readiness questions</SectionLabel>
          <div className="space-y-2">
            {task.questions.map((q, i) => (
              <NoteCard key={i} done={filled(answers[i] ?? "")} lead={<IndexBead n={i + 1} />} label={q}>
                <WellInput value={answers[i] ?? ""} onChange={(v) => setAnswer(i, v)} placeholder="Your answer…" rows={2} />
              </NoteCard>
            ))}
          </div>
        </div>
      </GatePart>

      <GatePart id="D" label="Readiness Sign-off" done={attested ? 1 : 0} total={1} last>
        <div className={`rounded-xl p-4 ring-1 transition-colors ${objectiveMet ? "bg-emerald-50/60 ring-emerald-200" : "bg-slate-50 ring-slate-200/70"}`}>
          <p className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
            I have studied the governing controls, inspected the templates, confirmed the prerequisites,
            walked the activity steps, and explained the key concepts in my own words. I am ready to start{" "}
            <span className="font-medium">{task.deliverable}</span> for {task.org}.
          </p>
          <button onClick={() => setAttested(!attested)} disabled={!ready && !attested}
            className={`mt-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-medium ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${attested ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-100"}`}>
            <Icon name="shield" size={14} /> {attested ? "Readiness attested — submit for the gate decision" : ready ? "Attest readiness" : "Complete parts A–C to attest"}
          </button>
        </div>
      </GatePart>
    </div>
  );
}

/* ================= Research Submission ================= */

type SourceRow = { type: string; ref: string };
type MethodWork = { notes: string; sources: SourceRow[] };

const NOTES_MIN = 40;
const methodDone = (m: MethodWork | undefined) =>
  !!m && m.notes.trim().length >= NOTES_MIN && m.sources.some((s) => s.ref.trim() !== "");

export function ResearchWorkspace({ taskCode, value, onChange }: WorkspaceProps) {
  const rua = getRuaTask(taskCode);
  const meta = taskCode ? TASK_META[taskCode] : undefined;
  const ctx = {
    org: rua?.org ?? "the organisation",
    standard: rua?.standard ?? meta?.standardLabel ?? "the governing standard",
    deliverable: rua?.deliverable ?? meta?.deliverable ?? "the deliverable",
    title: meta?.name ?? "this task",
  };

  const [methods, setMethods] = useState<Record<string, MethodWork>>(() => seed(value, "methods", {}));
  const [summary, setSummary] = useState<string>(() => seed(value, "summary", ""));
  const [openKey, setOpenKey] = useState<string | null>(RESEARCH_METHODS[0].key);

  const doneCount = RESEARCH_METHODS.filter((m) => methodDone(methods[m.key])).length;
  const objectiveMet = doneCount >= RESEARCH_METHODS.length && filled(summary, NOTES_MIN);

  useLift({ methods, summary, objectiveMet }, onChange);

  const patch = (key: string, mut: (m: MethodWork) => MethodWork) =>
    setMethods((prev) => ({ ...prev, [key]: mut(prev[key] ?? { notes: "", sources: [{ type: RESEARCH_SOURCE_TYPES[0], ref: "" }] }) }));

  return (
    <div className="space-y-5">
      <GivenNote>
        The closing gate of this task: evidence the research behind your {ctx.deliverable}. Work all{" "}
        {RESEARCH_METHODS.length} research methods — notes plus at least one cited source each — then
        summarise how the research shaped your deliverable.
      </GivenNote>

      {/* segmented completion meter — one segment per method, in card order */}
      <div>
        <div className="flex gap-1.5">
          {RESEARCH_METHODS.map((m) => (
            <span key={m.key} className={`h-1.5 flex-1 rounded-full transition-colors ${methodDone(methods[m.key]) ? "bg-emerald-500" : "bg-slate-200"}`} />
          ))}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-500 tracking-tight tabular-nums">{doneCount} of {RESEARCH_METHODS.length} methods evidenced</div>
      </div>

      <div className="space-y-2.5">
        {RESEARCH_METHODS.map((m) => {
          const work = methods[m.key];
          const done = methodDone(work);
          const open = openKey === m.key;
          const sources = work?.sources ?? [{ type: RESEARCH_SOURCE_TYPES[0], ref: "" }];
          return (
            <div key={m.key} className={`rounded-2xl ring-1 overflow-hidden transition-colors ${done ? "ring-emerald-200 bg-emerald-50/30" : "ring-slate-200/80 bg-white"}`}>
              <button onClick={() => setOpenKey(open ? null : m.key)} aria-expanded={open} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  <Icon name={done ? "check" : m.icon} size={14} strokeWidth={done ? 3 : 2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-slate-900 tracking-tight">{m.name}</span>
                  <span className="block text-[11px] text-slate-500 tracking-tight">{m.tag}</span>
                </span>
                <Icon name="chevronDown" size={14} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-3.5 border-t border-slate-100 pt-3.5">
                  <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
                    {m.definition} <span className="text-slate-700 font-medium">{fillMethod(m.why, ctx)}</span>
                  </p>
                  <div className="rounded-xl bg-slate-50/70 ring-1 ring-slate-200/60 p-3">
                    <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-1.5">Work these prompts into your notes</div>
                    <ul className="space-y-1.5">
                      {m.prompts.map((p, i) => (
                        <li key={i} className="flex gap-2 text-[12px] text-slate-600 leading-snug tracking-tight">
                          <span className="text-slate-300 shrink-0 select-none">–</span>
                          <span style={{ textWrap: "pretty" }}>{fillMethod(p, ctx)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500 mb-1.5">Findings</div>
                    <WTextArea
                      value={work?.notes ?? ""}
                      onChange={(v) => patch(m.key, (mw) => ({ ...mw, notes: v }))}
                      rows={4}
                      placeholder={`Your ${m.name.toLowerCase()} findings for this task…`}
                      hint={`${(work?.notes ?? "").trim().length}/${NOTES_MIN}+ chars`}
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-0.5">
                      <div className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500">Sources</div>
                      <button onClick={() => patch(m.key, (mw) => ({ ...mw, sources: [...mw.sources, { type: RESEARCH_SOURCE_TYPES[0], ref: "" }] }))}
                        className="h-7 px-2 rounded-md text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 shrink-0"><Icon name="plus" size={12} />Add source</button>
                    </div>
                    <p className="text-[10.5px] text-slate-400 tracking-tight mb-1.5">{m.sourceHint}</p>
                    <div className="space-y-1.5">
                      {sources.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <select value={s.type} onChange={(e) => patch(m.key, (mw) => ({ ...mw, sources: mw.sources.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)) }))}
                            className="h-9 w-40 px-2 rounded-lg bg-white ring-1 ring-slate-200/80 text-[11.5px] text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 shrink-0">
                            {RESEARCH_SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                          </select>
                          <input value={s.ref} onChange={(e) => patch(m.key, (mw) => ({ ...mw, sources: mw.sources.map((x, j) => (j === i ? { ...x, ref: e.target.value } : x)) }))}
                            placeholder="Title, clause or link of the source…"
                            className="flex-1 min-w-0 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px] placeholder:text-slate-400" />
                          <button onClick={() => patch(m.key, (mw) => ({ ...mw, sources: mw.sources.filter((_, j) => j !== i) }))}
                            disabled={sources.length <= 1} aria-label="Remove source"
                            className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center shrink-0"><Icon name="x" size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <SectionLabel hint="what the research changed or confirmed">Research summary</SectionLabel>
        <WTextArea value={summary} onChange={setSummary} rows={3}
          placeholder={`What your research changed or confirmed in the ${ctx.deliverable}…`}
          hint={`${summary.trim().length}/${NOTES_MIN}+ chars`} />
      </div>

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} strokeWidth={3} /> Research evidenced</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">All three methods worked, sources cited, summary written — submit for the gate decision.</p>
        </div>
      )}
    </div>
  );
}
