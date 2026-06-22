"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  type WorkspaceProps, useLift, seed, SectionLabel, WTextArea, WTextInput,
  GivenNote, RefBox, ScriptedExchange, SOFT, DOT, type Tone,
} from "./kit";

/* ── shared radar/spider chart ── */
function RadarChart({ values, labels, max, tone }: { values: number[]; labels: string[]; max: number; tone: string }) {
  const size = 200, cx = size / 2, cy = size / 2, R = 72, n = values.length;
  const pt = (v: number, i: number) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; const r = (v / max) * R; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const poly = values.map((v, i) => pt(v, i).join(",")).join(" ");
  const ring = (f: number) => labels.map((_, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)].join(","); }).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block mx-auto">
      {[0.25, 0.5, 0.75, 1].map((f, i) => <polygon key={i} points={ring(f)} fill="none" stroke="#E2E8F0" strokeWidth="1" />)}
      {labels.map((_, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="#E2E8F0" />; })}
      <polygon points={poly} fill={`${tone}2e`} stroke={tone} strokeWidth="1.5" />
      {values.map((v, i) => { const [x, y] = pt(v, i); return <circle key={i} cx={x} cy={y} r="3" fill={tone} />; })}
      {labels.map((l, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return <text key={i} x={cx + (R + 14) * Math.cos(a)} y={cy + (R + 14) * Math.sin(a)} fontSize="8" fill="#64748B" textAnchor="middle" dominantBaseline="middle">{l}</text>; })}
    </svg>
  );
}

/* ============================ ASSESS ============================ */
type Domain = { id: string; name: string; score: number; evidence: string; outlier: boolean };
export function AssessWorkspace({ value, onChange }: WorkspaceProps) {
  const scale = ["Initial", "Repeatable", "Defined", "Managed", "Optimising"];
  const [items, setItems] = useState<Domain[]>(() => seed(value, "domains", [
    { id: "ac", name: "Access Control", score: 3, evidence: "RBAC documented; access reviews quarterly with audit trail.", outlier: false },
    { id: "ir", name: "Incident Response", score: 3, evidence: "Runbook v2.1 exercised in Q1 tabletop; comms templates ready.", outlier: false },
    { id: "rm", name: "Risk Management", score: 2, evidence: "Annual risk register; no formal treatment workflow yet.", outlier: false },
    { id: "vm", name: "Vendor Management", score: 4, evidence: "Procurement gate, DPA library, cert tracking automation.", outlier: true },
    { id: "cm", name: "Change Management", score: 3, evidence: "PR-driven changes with two reviewers; emergency runbook exists.", outlier: false },
    { id: "bc", name: "Business Continuity", score: 1, evidence: "", outlier: true },
    { id: "tr", name: "Training & Awareness", score: 2, evidence: "Annual training; phishing sim quarterly.", outlier: false },
    { id: "lg", name: "Logging & Monitoring", score: 3, evidence: "CloudTrail + observability; orders-db audit logs pending.", outlier: false },
  ]));
  useLift({ items: items.map((i) => ({ item: i.name, evidence: i.evidence, rating: `${i.score} ${scale[i.score - 1]}` })), domains: items }, onChange);
  const set = (id: string, k: keyof Domain, v: string | number) => setItems((is) => is.map((i) => (i.id === id ? ({ ...i, [k]: v } as Domain) : i)));

  return (
    <div className="space-y-4">
      <GivenNote>Assess maturity against the CMMI 1–5 scale across 8 domains. Every level needs cited evidence; outliers (flagged ⚠) need explanation.</GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
          {items.map((i) => (
            <div key={i.id} className="px-4 py-3 border-b border-slate-50 last:border-0">
              <div className="flex items-center justify-between mb-2"><div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{i.name}{i.outlier && <span className="ml-2 text-[10px] text-amber-700 font-medium">⚠ outlier</span>}</div></div>
              <div className="flex items-center gap-1 mb-2">
                {scale.map((s, si) => { const active = i.score === si + 1; return <button key={s} onClick={() => set(i.id, "score", si + 1)} className={`flex-1 h-8 rounded-md text-[10px] font-medium transition-all ${active ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-500 hover:bg-amber-50"}`}>{si + 1}<span className="hidden sm:inline"> {s}</span></button>; })}
              </div>
              <input value={i.evidence} onChange={(e) => set(i.id, "evidence", e.target.value)} placeholder="Cite the evidence…" className={`w-full h-9 px-3 rounded-md text-[12px] outline-none ring-1 ${i.evidence.trim().length > 10 ? "bg-emerald-50/20 ring-emerald-200/70" : "bg-slate-50 ring-slate-200/80"} focus:ring-2 focus:ring-amber-400/40`} />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start"><h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Maturity profile</h4><RadarChart values={items.map((i) => i.score)} labels={items.map((i) => i.id.toUpperCase())} max={5} tone="#f59e0b" /></div>
      </div>
    </div>
  );
}

/* ============================ SCORE ============================ */
type Dim = { id: string; label: string; weight: number; anchor0: string; anchor4: string };
export function ScoreWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const dims: Dim[] = [
    { id: "spec", label: "Specificity", weight: 0.25, anchor0: "Vague", anchor4: "Names assets, owners, dates" },
    { id: "stand", label: "Standards Alignment", weight: 0.25, anchor0: "No citations", anchor4: "All claims cite a control" },
    { id: "reas", label: "Reasoning Quality", weight: 0.2, anchor0: "Assertions only", anchor4: "Conclusions follow evidence" },
    { id: "risk", label: "Risk Awareness", weight: 0.15, anchor0: "Misses obvious", anchor4: "Surfaces non-obvious risks" },
    { id: "comm", label: "Communication Quality", weight: 0.15, anchor0: "Hard to follow", anchor4: "Crisp, audience-aware" },
  ];
  const [scores, setScores] = useState<Record<string, number>>(() => seed(value, "scores", { spec: 3, stand: 2, reas: 3, risk: 2, comm: 3 }));
  const [notes, setNotes] = useState<Record<string, string>>(() => seed(value, "notes", { spec: "Names each in-scope asset and its owner.", stand: "Cites SOC 2 sections but no ISO control references yet.", reas: "Inferences from the system description are clearly drawn.", risk: "", comm: "" }));
  const aggregate = dims.reduce((s, d) => s + scores[d.id] * d.weight, 0);
  useLift({ dimensions: dims.map((d) => ({ dimension: d.label, score: scores[d.id], justification: notes[d.id] })), aggregate: aggregate.toFixed(2), scores, notes }, onChange);

  return (
    <div className="space-y-4">
      <GivenNote>Score the draft against the 5-dimension rubric. The aggregate auto-computes; each justification must reference its anchor (≥ 15 chars). <button onClick={() => openRef("ws-rubric")} className="text-indigo-600 hover:underline font-medium">Open rubric →</button></GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="space-y-3">
          {dims.map((d) => {
            const v = scores[d.id]; const len = (notes[d.id] || "").length;
            return (
              <div key={d.id} className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
                <div className="flex items-baseline justify-between"><div><h4 className="text-[13.5px] font-semibold text-slate-900 tracking-tight">{d.label}</h4><p className="text-[11px] text-slate-500 mt-0.5">Weight {Math.round(d.weight * 100)}%</p></div><div className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">{v}<span className="text-slate-300 text-[13px]"> / 4</span></div></div>
                <input type="range" min={0} max={4} step={1} value={v} onChange={(e) => setScores({ ...scores, [d.id]: parseInt(e.target.value) })} className="w-full accent-indigo-600 cursor-pointer mt-3" />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1"><span>0 · {d.anchor0}</span><span>{d.anchor4} · 4</span></div>
                <div className="mt-3 flex items-center gap-2"><input value={notes[d.id] || ""} onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })} placeholder="One-line justification…" className={`flex-1 h-9 px-3 rounded-lg bg-slate-50 ring-1 outline-none text-[12.5px] focus:ring-2 focus:ring-indigo-500/30 ${len === 0 ? "ring-slate-200/80" : len >= 15 ? "ring-emerald-200/80" : "ring-amber-200"}`} /><span className={`text-[10.5px] tabular-nums w-12 text-right ${len >= 15 ? "text-emerald-600" : "text-slate-400"}`}>{len} / 15</span></div>
              </div>
            );
          })}
        </div>
        <div className="space-y-3 self-start">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white"><div className="text-[10.5px] font-medium tracking-[0.12em] uppercase text-indigo-100">Weighted aggregate</div><div className="mt-1 flex items-baseline gap-1"><div className="text-[34px] font-semibold tabular-nums leading-none">{aggregate.toFixed(2)}</div><div className="text-[16px] text-indigo-200">/ 4.00</div></div><div className="mt-3 h-1.5 rounded-full bg-indigo-700/40 overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${(aggregate / 4) * 100}%` }} /></div></div>
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4"><RadarChart values={dims.map((d) => scores[d.id])} labels={dims.map((d) => d.label.split(" ")[0])} max={4} tone="#6366f1" /></div>
        </div>
      </div>
    </div>
  );
}

/* ============================ COMPILE ============================ */
export function CompileWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const sources = [
    { id: "s1", title: "Asset Register v2", code: "A.iv" }, { id: "s2", title: "Classification Outcomes", code: "C.ii" },
    { id: "s3", title: "Regulatory Driver Map", code: "C.i" }, { id: "s4", title: "Scope Statement v0.4", code: "N.i" },
    { id: "s6", title: "Residual Risk Calculation", code: "RR-1" },
  ];
  type Sec = { id: string; title: string; required: boolean; refs: string[] };
  const [secs, setSecs] = useState<Sec[]>(() => seed(value, "sectionList", [
    { id: "scope", title: "2 · Scope statement", required: true, refs: ["s4"] },
    { id: "assets", title: "3 · Asset inventory", required: true, refs: ["s1"] },
    { id: "classification", title: "4 · Classification outcomes", required: true, refs: ["s2"] },
    { id: "regulatory", title: "5 · Regulatory driver map", required: true, refs: ["s3"] },
    { id: "risk", title: "6 · Residual risk summary", required: true, refs: ["s6"] },
  ]));
  const [exec, setExec] = useState(() => seed(value, "executiveSummary", "The ISMS scope covers 4 core systems (orders-db, K8s prod, Snowflake DW, Stripe Connect); 2 are excluded with documented rationale. Regulatory drivers: GDPR, UK GDPR, PCI-DSS, SOC 2, ISO 27701. Highest residual risk: orders-db audit-log gap (Residual 6.0 / 16)."));
  useLift({ sections: ["1 · Executive summary", ...secs.map((s) => s.title)], executiveSummary: exec, sectionList: secs }, onChange);
  const toggle = (secId: string, srcId: string) => setSecs((ss) => ss.map((s) => (s.id === secId ? { ...s, refs: s.refs.includes(srcId) ? s.refs.filter((r) => r !== srcId) : [...s.refs, srcId] } : s)));

  return (
    <div className="space-y-4">
      <GivenNote>Assemble the final report: link ≥ 1 source artefact to each required section and write the executive summary. <button onClick={() => openRef("ws-source-index")} className="text-indigo-600 hover:underline font-medium">Open sources →</button></GivenNote>
      <div><SectionLabel>1 · Executive summary <span className="text-rose-500">*</span></SectionLabel><WTextArea value={exec} onChange={setExec} rows={4} hint={`${exec.length} chars`} /></div>
      <div className="space-y-2">
        {secs.map((s) => (
          <div key={s.id} className="rounded-xl bg-white ring-1 ring-slate-200/70 p-3">
            <div className="flex items-center justify-between mb-2"><h3 className="text-[12.5px] font-semibold tracking-tight text-slate-900">{s.title}<span className="text-rose-500">*</span></h3><span className={`text-[10px] font-medium ${s.refs.length ? "text-emerald-700" : "text-slate-400"}`}>{s.refs.length ? "✓ linked" : "link a source"}</span></div>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((src) => { const on = s.refs.includes(src.id); return <button key={src.id} onClick={() => toggle(s.id, src.id)} className={`inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-1 rounded ring-1 transition-all ${on ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200/70 hover:ring-slate-300"}`}><Icon name="link" size={10} />{src.title}</button>; })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ BRIEF ============================ */
export function BriefWorkspace({ value, onChange }: WorkspaceProps) {
  const [format, setFormat] = useState(() => seed(value, "format", "page"));
  const [audience, setAudience] = useState(() => seed(value, "audience", "All engineering staff (~180 ICs + EMs)"));
  const [keyMessage, setKeyMessage] = useState(() => seed(value, "keyMessage", "From June 15, every in-scope repository requires a CODEOWNERS file and a Security review tag on PRs touching listed paths. The two-reviewer rule already applies — this makes ownership explicit.\n\nWhy: auditors flagged that PR approvals don't trace to a named owner role. ISO 27001 §A.8.2 requires named ownership of information assets."));
  const [ask, setAsk] = useState(() => seed(value, "ask", "Add a CODEOWNERS file to your repo by June 12. Template + questions thread in #isms-rollout."));
  useLift({ audience, keyMessage, ask, format }, onChange);
  const mcq = [
    { q: "When does the new rule take effect?", a: "June 15" }, { q: "Does this apply to repos outside the ISMS scope?", a: "No" }, { q: "Where do you ask questions?", a: "#isms-rollout" },
  ];

  return (
    <div className="space-y-4">
      <GivenNote>Brief the audience in plain language with one explicit ask. The comprehension check (right) is auto-generated and read-only.</GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        <div className="space-y-4">
          <div>
            <SectionLabel>Format</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {[{ id: "page", label: "One-page document", hint: "≤ 1 page", icon: "file" as const }, { id: "deck", label: "Short slide deck", hint: "≤ 5 slides", icon: "layers" as const }].map((f) => (
                <button key={f.id} onClick={() => setFormat(f.id)} className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ring-1 ${format === f.id ? "bg-indigo-50 ring-indigo-300" : "bg-white ring-slate-200/80 hover:ring-slate-300"}`}><span className={`w-8 h-8 rounded-lg flex items-center justify-center ${format === f.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}><Icon name={f.icon} size={14} /></span><div><div className="text-[12.5px] font-medium tracking-tight text-slate-900">{f.label}</div><div className="text-[10.5px] font-mono text-slate-500">{f.hint}</div></div></button>
              ))}
            </div>
          </div>
          <div><SectionLabel>Audience <span className="text-rose-500">*</span></SectionLabel><WTextInput value={audience} onChange={setAudience} placeholder="Be specific: who is reading this?" /></div>
          <div><SectionLabel hint={`${keyMessage.split(/\s+/).filter(Boolean).length} words`}>Brief body (plain language)</SectionLabel><WTextArea value={keyMessage} onChange={setKeyMessage} rows={7} /></div>
          <div><SectionLabel>Ask of audience <span className="text-rose-500">*</span></SectionLabel><WTextArea value={ask} onChange={setAsk} rows={2} /></div>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start">
          <h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Comprehension check</h4>
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">Auto-generated from the brief — a reader should answer all three.</p>
          <div className="space-y-2">{mcq.map((m, i) => <div key={i} className="rounded-lg ring-1 ring-slate-200/70 p-2.5 bg-slate-50/40"><div className="text-[11.5px] font-medium text-slate-800 tracking-tight">{i + 1}. {m.q}</div><span className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-mono bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 px-2 py-0.5 rounded"><Icon name="check" size={10} strokeWidth={3} />{m.a}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SIGN-OFF ============================ */
export function SignoffWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [decision, setDecision] = useState(() => seed(value, "decision", "Approved with conditions"));
  const [conditions, setConditions] = useState(() => seed(value, "conditions", "Add a line on data-residency commitments; circulate to the DPO before publishing."));
  const [revisionPlan, setRevisionPlan] = useState(() => seed(value, "revisionPlan", ""));
  const [date, setDate] = useState(() => seed(value, "date", "2026-07-10"));
  useLift({ decision, conditions, revisionPlan, date }, onChange);
  const opts: { id: string; tone: Tone }[] = [{ id: "Approved", tone: "emerald" }, { id: "Approved with conditions", tone: "amber" }, { id: "Rejected", tone: "rose" }];

  return (
    <div className="space-y-4">
      <GivenNote>Obtain formal sign-off on the artefact. The stakeholder Q&amp;A is pre-scripted; record the decision with date. Conditions/revision plan apply per outcome.</GivenNote>
      <RefBox title="ISMS Scope Statement v0.4" meta="Last updated 2 hrs ago · 4 pages" refId="ws-scope-statement" openRef={openRef} />
      <ScriptedExchange title="Q&A with the Head of Engineering (pre-scripted)" turns={[
        { who: "stakeholder", initials: "HE", text: "Why is the data warehouse in scope but the marketing CMS isn't? Walk me through." },
        { who: "you", initials: "AS", text: "Snowflake holds derived order data — personal-data lineage runs through it. The CMS is fully decoupled from production data and lives on a separate account." },
        { who: "stakeholder", initials: "HE", text: "Good. What's missing — and what would block me from signing today?" },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
          <h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-3">Decision</h4>
          <div className="space-y-2">
            {opts.map((o) => (
              <button key={o.id} onClick={() => setDecision(o.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ring-1 ${decision === o.id ? `${SOFT[o.tone]} ring-inset` : "ring-slate-200/70 hover:bg-slate-50"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${decision === o.id ? DOT[o.tone] : "ring-2 ring-slate-300"}`}>{decision === o.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}</span>
                <span className="text-[12.5px] font-medium tracking-tight text-slate-700">{o.id}</span>
              </button>
            ))}
          </div>
          {decision === "Approved with conditions" && <div className="mt-4"><div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-1.5">Conditions <span className="text-rose-500">*</span></div><textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-amber-400/40 outline-none text-[12.5px] resize-none" /></div>}
          {decision === "Rejected" && <div className="mt-4"><div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-1.5">Revision plan <span className="text-rose-500">*</span></div><textarea value={revisionPlan} onChange={(e) => setRevisionPlan(e.target.value)} rows={3} placeholder="What changes before resubmission?" className="w-full px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-rose-400/40 outline-none text-[12.5px] resize-none" /></div>}
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start space-y-3">
          <div><div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-1.5">Decision date</div><WTextInput type="date" value={date} onChange={setDate} /></div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1"><div className="flex justify-between"><span>Decided by</span><span className="text-slate-800 font-medium">Head of Engineering</span></div><div className="flex justify-between"><span>Audit record</span><span className="text-slate-800 font-mono">SO-2026-0142</span></div></div>
        </div>
      </div>
    </div>
  );
}

/* ============================ INTERVIEW ============================ */
export function InterviewWorkspace({ value, onChange }: WorkspaceProps) {
  const [questions, setQuestions] = useState<string[]>(() => seed(value, "questions", [
    "What does a 'good day' look like for your team?",
    "Where do you spend the most time on compliance work?",
    "What ISMS process most often breaks in practice?",
    "Tell me about the last time you escalated a security concern.",
    "Who do you wish was involved earlier in your work?",
  ]));
  const [summary, setSummary] = useState(() => seed(value, "notesPerQuestion", "Procurement-security duplication is the highest-friction process. Escalation paths are too long for incident-grade decisions — a bypass mechanism is needed. Probe next: ownership boundaries between DPO and Security Eng. Lead."));
  const prepared = questions.filter((q) => q.trim()).length;
  useLift({ questions, notesPerQuestion: summary }, onChange);

  return (
    <div className="space-y-4">
      <GivenNote>Prepare ≥ 5 open questions, then read the pre-scripted DPO dialogue and write a closing summary. There is no live chat — the exchange is fixed.</GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start">
          <div className="flex items-center justify-between mb-3"><h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Prepared questions</h4><span className={`text-[10.5px] font-mono ${prepared >= 5 ? "text-emerald-600" : "text-amber-700"}`}>{prepared} / 5</span></div>
          <div className="space-y-1.5">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2"><span className="mt-2 text-[10.5px] font-mono text-slate-400 w-4">{i + 1}</span><textarea value={q} onChange={(e) => { const n = [...questions]; n[i] = e.target.value; setQuestions(n); }} rows={2} placeholder="Open-ended question…" className="flex-1 px-2 py-1.5 rounded-md bg-slate-50 ring-1 ring-slate-200/60 focus:ring-2 focus:ring-violet-400/40 outline-none text-[11.5px] resize-none leading-snug" /></div>
            ))}
            <button onClick={() => setQuestions([...questions, ""])} className="w-full mt-1 h-8 rounded-md text-[11px] font-medium text-violet-700 hover:bg-violet-50 flex items-center justify-center gap-1"><Icon name="plus" size={11} />Add question</button>
          </div>
        </div>
        <div>
          <ScriptedExchange title="Interview dialogue · Data Protection Officer (pre-scripted)" turns={[
            { who: "you", initials: "AS", text: "Tell me about the last time you escalated a security concern." },
            { who: "stakeholder", initials: "DPO", text: "Two weeks ago — a vendor reported a possible breach in their dev environment. We had to decide within hours whether to suspend the integration. The hardest part was reaching the right decision-maker." },
            { who: "you", initials: "AS", text: "Who were the three people, and which one finally acted?" },
            { who: "stakeholder", initials: "DPO", text: "Compliance lead first, then VP Engineering, then me as DPO. I made the call to suspend pending the postmortem." },
          ]} />
        </div>
      </div>
      <div><SectionLabel hint={`${summary.length} chars · min 30`}>Closing summary <span className="text-rose-500">*</span></SectionLabel><WTextArea value={summary} onChange={setSummary} rows={3} placeholder="Most important insight, biggest open question, what to probe next." /></div>
    </div>
  );
}

/* ============================ DOCUMENT ============================ */
type DocSec = { id: string; title: string; done: boolean; content: string };
export function DocumentWorkspace({ value, onChange }: WorkspaceProps) {
  const [secs, setSecs] = useState<DocSec[]>(() => seed(value, "sectionList", [
    { id: "context", title: "1 · Context", done: true, content: "Following the May 2026 ISMS sprint, a written process was needed for how scope changes are proposed, reviewed, and recorded once the baseline is signed off." },
    { id: "decision", title: "2 · Decision", done: true, content: "Scope changes are proposed via a dated change request linked to the asset register. Reviewer is the Compliance Lead; final approver is the Department Head. Changes apply prospectively." },
    { id: "rationale", title: "3 · Rationale", done: true, content: "An annual cadence was rejected (too slow) and continuous edits were rejected (no audit trail). The change-request approach gives auditability without blocking minor additions." },
    { id: "lessons", title: "4 · Lessons learned", done: true, content: "Asset-owner role names should have been agreed in week 1 — rework cost ~3 days. The next sprint will start with role-catalogue confirmation." },
    { id: "links", title: "5 · Cross-references", done: false, content: "" },
  ]));
  const xrefs = [
    { artefact: "Asset Register v2", resolved: true }, { artefact: "Scope Statement v0.4", resolved: true },
    { artefact: "Risk Calculation RR-2026.1", resolved: true }, { artefact: "Maturity Assessment Q2-26", resolved: false },
  ];
  const [crossRefs, setCrossRefs] = useState<string[]>(() => seed(value, "crossReferences", ["Asset Register v2", "Scope Statement v0.4", "Risk Calculation RR-2026.1"]));
  useLift({ sections: secs.map((s) => `${s.title}: ${s.content}`).join("\n"), sectionList: secs, crossReferences: crossRefs }, onChange);
  const set = (id: string, k: keyof DocSec, v: string | boolean) => setSecs((ss) => ss.map((s) => (s.id === id ? ({ ...s, [k]: v } as DocSec) : s)));
  const toggleRef = (a: string) => setCrossRefs((c) => (c.includes(a) ? c.filter((x) => x !== a) : [...c, a]));

  return (
    <div className="space-y-4">
      <GivenNote>Write up the process and lessons-learned, then link upstream artefacts. Broken cross-references (unresolved artefacts) block submission.</GivenNote>
      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden">
        <div className="px-4 py-4 space-y-4">
          {secs.map((s) => (
            <div key={s.id}>
              <div className="flex items-center gap-2 mb-1.5"><button onClick={() => set(s.id, "done", !s.done)} className={`w-4 h-4 rounded flex items-center justify-center transition-all ${s.done ? "bg-emerald-500 text-white" : "ring-2 ring-slate-300 hover:ring-emerald-400"}`}>{s.done && <Icon name="check" size={11} strokeWidth={3} />}</button><h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900">{s.title}</h3></div>
              {s.id === "links" ? (
                <div className="ml-6 rounded-lg ring-1 ring-slate-200/70 p-3 bg-slate-50/30">
                  <div className="text-[11px] text-slate-600 mb-2">Tap to link an artefact (greyed = broken, blocks submission)</div>
                  <div className="space-y-1.5">{xrefs.map((x) => { const on = crossRefs.includes(x.artefact); return <button key={x.artefact} disabled={!x.resolved} onClick={() => toggleRef(x.artefact)} className={`w-full flex items-center gap-2 text-[12px] px-2 py-1.5 rounded ring-1 transition-all ${!x.resolved ? "bg-rose-50/40 ring-rose-200 text-rose-700 cursor-not-allowed" : on ? "bg-emerald-50/40 ring-emerald-200 text-slate-700" : "bg-white ring-slate-200/70 text-slate-500 hover:ring-slate-300"}`}><Icon name="link" size={11} /><span className="flex-1 text-left tracking-tight">{x.artefact}</span>{!x.resolved && <span className="text-[10px] font-medium">broken</span>}{on && x.resolved && <Icon name="check" size={11} strokeWidth={3} className="text-emerald-600" />}</button>; })}</div>
                </div>
              ) : (
                <textarea value={s.content} onChange={(e) => set(s.id, "content", e.target.value)} rows={2} className="ml-6 w-[calc(100%-1.5rem)] px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px] resize-none leading-relaxed" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
