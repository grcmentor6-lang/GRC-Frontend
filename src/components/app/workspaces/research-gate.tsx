"use client";

// Research Submission gate workspace — faithful port of the design mockup's method-rail research
// submission: a left rail of Required / Optional methods + a Review pane, per-method editors with
// guiding prompts, a Research findings + "So what" write-up, a sources editor, and a live six-point
// quality bar (depth · implication · own-words anti-parrot · task vocabulary · org-anchored ·
// sources). Optional methods carry an include toggle (pick ≥ 1). The Review pane rolls the methods
// up, takes the three-point declaration, and reports whether the gate is ready. All checks run on
// the deterministic client engine (lib/rs-engine.ts); the AI mentor still grades the payload as
// Layer 2, and the page's real "Submit for review" button fires once `objectiveMet` is true.

import { useState } from "react";
import { CriterionMark } from "@/components/app/criterion-mark";
import { Icon } from "@/components/ui/icon";
import { type WorkspaceProps, useLift, seed, GivenNote } from "./kit";
import { TabRail, PaneNav, resumeTab, type TabDef } from "./gates";
import { type RuaTask } from "@/lib/rua-tasks";
import { useTaskBundle } from "@/lib/task-bundle";
import { TASK_META } from "@/lib/taskmeta";
import { RESEARCH_METHODS, RESEARCH_SOURCE_TYPES, type ResearchMethod } from "@/lib/research-methods";
import { Gloss } from "@/components/app/glossary";
import {
  rsGateFor, rsFill,
  type RsTaskContext, type RsProgress, type RsMethodEntry, type RsSource, type RsMethodResult, type RsGate,
} from "@/lib/rs-engine";

// Fixed policy for the in-app gate (the mockup exposed these as tweaks).
const BAR = "balanced" as const;
const MIN_OPTIONAL = 1;

type Patch = (mut: (p: RsProgress) => void) => void;

/* ── sources editor ── */

function SourcesEditor({ sources, onChange, hint }: {
  sources: RsSource[]; onChange: (v: RsSource[]) => void; hint: string;
}) {
  const upd = (i: number, k: keyof RsSource, v: string) => onChange(sources.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const add = () => onChange([...sources, { type: RESEARCH_SOURCE_TYPES[0], title: "", link: "" }]);
  const del = (i: number) => onChange(sources.filter((_, j) => j !== i));
  return (
    <div>
      <div className="space-y-2">
        {sources.map((s, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2">
            <select value={s.type} aria-label="Source type" onChange={(e) => upd(i, "type", e.target.value)}
              className="shrink-0 h-10 sm:w-[168px] rounded-lg bg-slate-50 ring-1 ring-slate-200 px-2.5 text-[12px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer">
              {RESEARCH_SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input value={s.title} aria-label="Source title" onChange={(e) => upd(i, "title", e.target.value)}
              placeholder="Source title — e.g. ISO/IEC 27001:2022 Clause 6.1.2, ENISA Threat Landscape 2026"
              className="flex-1 min-w-0 h-10 rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 text-[12.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30" />
            <input value={s.link ?? ""} aria-label="Source link" onChange={(e) => upd(i, "link", e.target.value)} placeholder="Link / reference (optional)"
              className="sm:w-[190px] h-10 rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30" />
            <button onClick={() => del(i)} aria-label="Remove source" className="shrink-0 w-10 h-10 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer focus-ring flex items-center justify-center transition-colors"><Icon name="trash" size={15} /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-2 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer focus-ring transition-colors">
        <Icon name="plus" size={14} /> Add source
      </button>
      {hint && <p className="mt-2 text-[11px] text-slate-400 tracking-tight" style={{ textWrap: "pretty" }}>Where to look: {hint}</p>}
    </div>
  );
}

/* ── one check row of the live quality bar ── */

function CheckRow({ pass, label, ev }: { pass: boolean; label: string; ev: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <span className={`shrink-0 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ${pass ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300"}`}>
        <Icon name={pass ? "check" : "minus"} size={11} strokeWidth={pass ? 3 : 2} />
      </span>
      <span className={`flex-1 text-[12px] tracking-tight ${pass ? "text-slate-700" : "text-slate-500"}`}>{label}</span>
      <span className="shrink-0 text-[10.5px] font-mono text-slate-400 tabular-nums">{ev}</span>
    </div>
  );
}

/* ── method editor pane ── */

function MethodEditor({ ctx, m, prog, patch, res }: {
  ctx: RsTaskContext; m: ResearchMethod; prog: RsProgress; patch: Patch; res: RsMethodResult;
}) {
  const entry: RsMethodEntry = prog.methods?.[m.key] ?? {};
  const included = m.req || !!prog.include?.[m.key];
  const set = (k: keyof RsMethodEntry, v: RsMethodEntry[keyof RsMethodEntry]) =>
    patch((p) => { p.methods = p.methods ?? {}; p.methods[m.key] = { ...(p.methods[m.key] ?? {}), [k]: v }; });
  const toggleInclude = () => patch((p) => { p.include = p.include ?? {}; p.include[m.key] = !p.include[m.key]; });
  const dim = !m.req && !included;
  // R1 needs all three required methods to clear the bar, R2 one included optional method. The
  // method's own bar is what clears it, so the mark reports this method, not the whole criterion.
  const reqIndex = RESEARCH_METHODS.filter((x) => x.req).findIndex((x) => x.key === m.key);
  const reqTotal = RESEARCH_METHODS.filter((x) => x.req).length;
  const passCount = res.checks.filter((c) => c.pass).length;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-indigo-700 bg-indigo-50 rounded px-1.5 py-0.5"><Icon name={m.icon} size={11} />{m.tag}</span>
            {m.req
              ? <span className="inline-flex items-center h-[17px] px-1.5 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 text-[9.5px] font-semibold">REQUIRED</span>
              : <span className={`inline-flex items-center h-[17px] px-1.5 rounded-full text-[9.5px] font-semibold ring-1 ${included ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>{included ? "INCLUDED" : "OPTIONAL"}</span>}
            {m.req
              ? <CriterionMark rs={[1]} done={res.pass} part={`${reqIndex + 1} of ${reqTotal}`} />
              : <CriterionMark rs={[2]} done={included && res.pass} />}
          </div>
          <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-tight">{m.name}</h3>
          <p className="mt-1 text-[13px] text-slate-500 tracking-tight" style={{ textWrap: "pretty" }}><Gloss>{m.definition}</Gloss></p>
          <p className="mt-1 text-[12px] text-indigo-700/90 tracking-tight" style={{ textWrap: "pretty" }}>{rsFill(m.why, ctx)}</p>
        </div>
        {!m.req && (
          <button data-guide="rs:include" onClick={toggleInclude}
            className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold cursor-pointer focus-ring transition-colors ${included ? "bg-slate-100 text-slate-600 hover:bg-slate-200/70" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"}`}>
            <Icon name={included ? "minus" : "plus"} size={14} />{included ? "Remove" : "Include"}
          </button>
        )}
      </div>

      <div className={dim ? "opacity-45 pointer-events-none select-none" : ""}>
        <div data-guide="rs:prompts" className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 mb-3.5">
          <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-2.5">Guiding prompts — answer these in your findings</div>
          <ol className="space-y-2.5">
            {m.prompts.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px] font-semibold">{i + 1}</span>
                <p className="flex-1 text-[13px] text-slate-700 tracking-tight leading-snug pt-0.5" style={{ textWrap: "pretty" }}>{rsFill(p, ctx)}</p>
              </li>
            ))}
          </ol>
        </div>

        <div data-guide="rs:findings" className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 mb-3.5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">Research findings</div>
            <span className="text-[10.5px] font-mono text-slate-400 tabular-nums">{res.checks[0].ev}</span>
          </div>
          <textarea value={entry.findings ?? ""} onChange={(e) => set("findings", e.target.value)} rows={8} aria-label="Research findings"
            placeholder={`What did your research find? Write in your own words, name ${ctx.org} explicitly, and reference what you consulted…`}
            className="w-full resize-y rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/30 px-3.5 py-3 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none" />
        </div>

        <div data-guide="rs:sowhat" className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 mb-3.5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">So what — implication for the deliverable</div>
            <span className="text-[10.5px] font-mono text-slate-400 tabular-nums">{res.checks[1].ev}</span>
          </div>
          <textarea value={entry.soWhat ?? ""} onChange={(e) => set("soWhat", e.target.value)} rows={3} aria-label="Implication for the deliverable"
            placeholder={`How did this research change the ${ctx.deliverable.toLowerCase()}? One or two concrete decisions…`}
            className="w-full resize-y rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/30 px-3.5 py-3 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none" />
        </div>

        <div data-guide="rs:sources" className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 mb-3.5">
          <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-2.5">Sources consulted <CriterionMark rs={[3]} done={(entry.sources ?? []).length > 0} className="ml-1.5" /></div>
          <SourcesEditor sources={entry.sources ?? []} onChange={(v) => set("sources", v)} hint={rsFill(m.sourceHint, ctx)} />
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">Quality bar — checked live</div>
            {res.pass
              ? <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[9.5px] font-semibold"><Icon name="check" size={10} strokeWidth={3} /> MEETS THE BAR</span>
              : <span className="inline-flex items-center h-[18px] px-1.5 rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-200 text-[9.5px] font-semibold tabular-nums">{passCount}/{res.checks.length}</span>}
          </div>
          <div className="divide-y divide-slate-100">
            {res.checks.map((c) => <CheckRow key={c.key} pass={c.pass} label={c.label} ev={c.ev} />)}
          </div>
        </div>
      </div>
      {dim && <p className="mt-3 text-center text-[12px] text-slate-400">Include this method to start writing — optional methods only count once included.</p>}
    </div>
  );
}

/* ── review & submit pane ── */

function ReviewPane({ ctx, prog, patch, gate, goMethod }: {
  ctx: RsTaskContext; prog: RsProgress; patch: Patch; gate: RsGate; goMethod: (k: string) => void;
}) {
  const decl = prog.decl ?? {};
  const setDecl = (k: "own" | "org" | "probe") => patch((p) => { p.decl = p.decl ?? {}; p.decl[k] = !p.decl[k]; });
  const declItems: { k: "own" | "org" | "probe"; text: string }[] = [
    { k: "own", text: "This research and its write-up are my own work, in my own words." },
    { k: "org", text: `My findings are specific to ${ctx.org} — not generic statements that would fit any organisation.` },
    { k: "probe", text: "I understand my mentor may probe any claim or source in the review session." },
  ];
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] font-semibold text-indigo-700 bg-indigo-50 rounded px-1.5 py-0.5">FINAL STEP</span>
          {gate.ready
            ? <span className="inline-flex items-center h-[18px] px-1.5 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 text-[9.5px] font-semibold">READY</span>
            : <span className="inline-flex items-center h-[18px] px-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-[9.5px] font-semibold">IN PROGRESS</span>}
        </div>
        <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-tight">Review &amp; submit</h3>
        <p className="mt-1 text-[13px] text-slate-500 tracking-tight" style={{ textWrap: "pretty" }}>Your research submission closes the task. It is how your mentor verifies you understood the topic — not just produced the deliverable.</p>
      </div>

      {/* what you're submitting */}
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden mb-3.5">
        <div className="px-4 pt-3.5 pb-1 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">What you&apos;re submitting</div>
        <div className="divide-y divide-slate-100">
          {gate.rows.map((r) => (
            <div key={r.m.key} className={`flex items-center gap-3 px-4 py-3 ${r.included ? "" : "opacity-45"}`}>
              <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${r.included && r.res.pass ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                <Icon name={r.included && r.res.pass ? "check" : r.m.icon} size={15} strokeWidth={r.included && r.res.pass ? 2.5 : 2} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-800 tracking-tight">{r.m.name} {r.m.req && <span className="ml-1 text-[10px] font-mono text-indigo-700">REQ</span>}</div>
                <div className="text-[11px] text-slate-400 tracking-tight">
                  {r.included ? `${r.res.words} words · ${r.res.sources} source${r.res.sources === 1 ? "" : "s"} · ${r.res.checks.filter((c) => c.pass).length}/${r.res.checks.length} checks` : "not included"}
                </div>
              </div>
              {r.included && !r.res.pass && (
                <button onClick={() => goMethod(r.m.key)} className="shrink-0 inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11.5px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer focus-ring">
                  Fix <Icon name="arrowRight" size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        {gate.optChosen < MIN_OPTIONAL && (
          <div className="px-4 py-3 border-t border-amber-100 bg-amber-50/60 text-[12px] text-amber-800 tracking-tight">
            Include at least {MIN_OPTIONAL} optional method{MIN_OPTIONAL > 1 ? "s" : ""} — pick the one that best fits this task.
          </div>
        )}
      </div>

      {/* declaration */}
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 mb-4">
        <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-2.5">Declaration <CriterionMark rs={[4]} className="ml-1.5" /></div>
        <div className="space-y-2.5">
          {declItems.map((d) => (
            <label key={d.k} className={`flex items-start gap-3 p-3 rounded-xl ring-1 cursor-pointer transition-colors ${decl[d.k] ? "bg-indigo-50 ring-indigo-200" : "bg-slate-50 ring-slate-200 hover:bg-slate-100/70"}`}>
              <input type="checkbox" checked={!!decl[d.k]} onChange={() => setDecl(d.k)} className="mt-0.5 w-4 h-4 accent-indigo-600" />
              <span className="text-[12.5px] text-slate-700 tracking-tight leading-snug" style={{ textWrap: "pretty" }}>{d.text}</span>
            </label>
          ))}
        </div>
      </div>

      {gate.canSubmit ? (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12.5px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} strokeWidth={3} /> Ready to submit</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">Every included method meets the bar and the declaration is signed. Use <span className="font-semibold">Submit for review</span> below to send it to the AI mentor — {gate.totalWords} words · {gate.totalSources} sources.</p>
        </div>
      ) : (
        <p className="text-[11.5px] text-slate-400 tracking-tight" style={{ textWrap: "pretty" }}>
          {!gate.ready
            ? "Finish the methods above first — submission unlocks when every included method meets the bar."
            : "Tick all three declarations to unlock submission."}
        </p>
      )}
    </div>
  );
}

/* ── workspace shell ── */

/** Fetches the task's curriculum bundle (gated, per-task) then renders the research gate. */
export function ResearchWorkspace(props: WorkspaceProps) {
  const { bundle, loading, error } = useTaskBundle(props.taskCode);
  if (loading) {
    return <GivenNote>Loading the research-gate content…</GivenNote>;
  }
  if (error || !bundle?.rua) {
    return <GivenNote>The research-gate content for this task hasn&apos;t been published yet.</GivenNote>;
  }
  return <ResearchWorkspaceInner {...props} rua={bundle.rua} />;
}

function ResearchWorkspaceInner({ taskCode, value, onChange, rua }: WorkspaceProps & { rua: RuaTask }) {
  const meta = taskCode ? TASK_META[taskCode] : undefined;
  const ctx: RsTaskContext = {
    org: rua?.org ?? "the organisation",
    standard: rua?.standard ?? meta?.standardLabel ?? "the governing standard",
    deliverable: rua?.deliverable ?? meta?.deliverable ?? "the deliverable",
    title: meta?.name ?? "this task",
    catName: meta?.methodCategory ?? "GRC",
    poolText: [rua?.objective, rua?.deliverable, rua?.standard, ...(rua?.controls ?? []).map((c) => c.name)].filter(Boolean).join(" ") || (meta?.description ?? ""),
  };

  const [prog, setProg] = useState<RsProgress>(() => ({
    methods: seed(value, "methods", {}),
    include: seed(value, "include", {}),
    decl: seed(value, "decl", {}),
  }));
  // null = "wherever they left off", resolved from restored progress once the tabs are built below.
  const [tabPick, setTabPick] = useState<string | null>(null);

  const patch: Patch = (mut) => setProg((prev) => { const n = JSON.parse(JSON.stringify(prev)) as RsProgress; mut(n); return n; });

  const gate = rsGateFor(ctx, prog, BAR, MIN_OPTIONAL);
  const objectiveMet = gate.canSubmit;

  useLift({ methods: prog.methods, include: prog.include, decl: prog.decl, objectiveMet }, onChange);

  const resFor = (m: ResearchMethod) => gate.rows.find((r) => r.m.key === m.key)!.res;

  const tabs: TabDef[] = [
    ...RESEARCH_METHODS.filter((m) => m.req).map((m, i) => ({
      key: m.key, label: m.name, icon: m.icon, blurb: m.tag, done: resFor(m).pass,
      group: i === 0 ? "Required methods" : undefined,
    })),
    ...RESEARCH_METHODS.filter((m) => !m.req).map((m, i) => {
      const included = !!prog.include?.[m.key];
      return {
        key: m.key, label: m.name, icon: m.icon,
        blurb: included ? m.tag : "not included",
        done: included && resFor(m).pass,
        group: i === 0 ? `Optional — pick ≥ ${MIN_OPTIONAL}` : undefined,
      };
    }),
    { key: "review", label: "Review & submit", icon: "send", blurb: "declaration + sign-off", done: gate.canSubmit, group: "Sign-off" },
  ];
  // Reopening the gate resumes at the first method still outstanding, not always the first required
  // one. Landing back on method 1 every time made finished work look lost.
  const tab = tabPick ?? resumeTab(tabs);
  const goMethod = (k: string) => setTabPick(k);
  const method = RESEARCH_METHODS.find((m) => m.key === tab);

  return (
    <div>
      <div className="mb-4">
        <GivenNote>
          The closing gate of this task: evidence the research behind your {ctx.deliverable}. Work the three
          required methods, include at least {MIN_OPTIONAL} optional method, and clear each method&apos;s quality
          bar — findings in your own words, anchored in {ctx.org}, with sources cited — then sign the declaration.
        </GivenNote>
      </div>

      <div className="md:flex md:items-start md:gap-5">
        <TabRail tabs={tabs} active={tab} onSelect={setTabPick} progressLabel={`${gate.reqDone + gate.optDone}/${gate.required + gate.minOptional} methods complete`} />

        <div className="min-w-0 flex-1 md:border-l md:border-slate-100 md:pl-5 md:min-h-[300px] md:flex md:flex-col [&>*:first-child]:flex-1">
          {tab === "review"
            ? <ReviewPane ctx={ctx} prog={prog} patch={patch} gate={gate} goMethod={goMethod} />
            : method && <MethodEditor ctx={ctx} m={method} prog={prog} patch={patch} res={resFor(method)} />}
          <PaneNav tabs={tabs} active={tab} onSelect={setTabPick} />
        </div>
      </div>
    </div>
  );
}
