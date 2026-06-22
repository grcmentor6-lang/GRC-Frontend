"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  type WorkspaceProps, useLift, seed, SectionLabel, WTextArea,
  GivenNote, ScriptedExchange,
} from "./kit";

/* ============================ DRAFT ============================ */
type Section = { id: string; title: string; content: string };
export function DraftWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [docTitle] = useState(() => seed(value, "docTitle", "Information Classification Policy"));
  const [sections, setSections] = useState<Section[]>(() => seed(value, "sectionList", [
    { id: "purpose", title: "1 · Purpose", content: "Establish how the organisation classifies information assets so consistent protective controls apply across all in-scope systems." },
    { id: "scope", title: "2 · Scope", content: "Applies to all information assets within the ISMS scope, all employees and contractors, and all third parties processing in-scope data." },
    { id: "defs", title: "3 · Definitions", content: "Personal Data, Confidential Information, Owner (Role), Custodian (Role), Information Asset." },
    { id: "policy", title: "4 · Policy Statements", content: "" },
    { id: "roles", title: "5 · Roles & Responsibilities", content: "" },
    { id: "rev", title: "6 · Review Cadence", content: "" },
  ]));
  const [standards, setStandards] = useState<string[]>(() => seed(value, "standardsCited", ["ISO/IEC 27001:2022 §5.12", "ISO/IEC 27002:2022 §5.13", "NIST SP 800-60"]));
  const filled = sections.filter((s) => s.content.trim()).length;
  useLift({ docTitle, sections: sections.map((s) => `${s.title}: ${s.content}`).join("\n"), sectionList: sections, standardsCited: standards }, onChange);
  const set = (id: string, v: string) => setSections((ss) => ss.map((s) => (s.id === id ? { ...s, content: v } : s)));

  return (
    <div className="space-y-4">
      <GivenNote>Every required heading must be present and non-empty; cite the standard for each claim. <button onClick={() => openRef("ws-policy-scaffold")} className="text-indigo-600 hover:underline font-medium">Open the scaffold →</button></GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/40 flex items-center gap-2"><Icon name="file" size={14} className="text-emerald-700" /><span className="text-[12.5px] font-medium text-slate-900 tracking-tight">{docTitle}</span><span className="ml-auto text-[10.5px] font-mono text-slate-500">{filled} / {sections.length} sections</span></div>
          <div className="px-5 py-4 space-y-4 max-h-[520px] overflow-y-auto">
            {sections.map((s) => (
              <div key={s.id}>
                <div className="flex items-center gap-2 mb-1.5"><h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900">{s.title}</h3>{s.content.trim() ? <span className="text-[10px] font-medium text-emerald-700">complete</span> : <span className="text-[10px] font-medium text-amber-700">empty</span>}</div>
                <textarea value={s.content} onChange={(e) => set(s.id, e.target.value)} rows={s.content ? 3 : 2} placeholder="Draft this section…" className="w-full px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px] resize-none leading-relaxed" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 self-start">
          <div className="flex items-center justify-between mb-2"><h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Standards cited</h4><button onClick={() => setStandards([...standards, ""])} className="text-indigo-700 hover:bg-indigo-50 rounded w-6 h-6 flex items-center justify-center"><Icon name="plus" size={13} /></button></div>
          <div className="space-y-1.5">
            {standards.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input value={c} onChange={(e) => { const n = [...standards]; n[i] = e.target.value; setStandards(n); }} placeholder="ISO 27001 §x.x" className="flex-1 h-8 px-2 rounded-md bg-slate-50 ring-1 ring-slate-200/80 outline-none text-[11.5px] font-mono focus:ring-2 focus:ring-indigo-500/30" />
                {standards.length > 1 && <button onClick={() => setStandards(standards.filter((_, j) => j !== i))} className="text-slate-300 hover:text-rose-600"><Icon name="x" size={13} /></button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ MAP ============================ */
export function MapWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const rowsA = ["EU GDPR", "UK GDPR", "PCI-DSS v4.0", "SOC 2 (existing)", "ISO 27701"];
  const colsB = ["orders-db", "K8s prod", "Stripe Connect", "Snowflake", "Marketing CMS"];
  const [cells, setCells] = useState<Record<string, string>>(() => seed(value, "cells", {
    "EU GDPR|orders-db": "Personal data of EU customers; Art. 30 record applies.",
    "EU GDPR|Stripe Connect": "Processor under Art. 28; DPA in place.",
    "UK GDPR|orders-db": "UK customers; mirror of EU obligations.",
    "PCI-DSS v4.0|Stripe Connect": "SAQ-A scope (no PAN stored locally).",
    "SOC 2 (existing)|K8s prod": "In scope per Sec. III.A.",
    "SOC 2 (existing)|orders-db": "In scope per Sec. III.A.",
    "SOC 2 (existing)|Snowflake": "In scope per Sec. III.A.",
    "ISO 27701|orders-db": "PII processing — Annex B controls.",
  }));
  const mappings = Object.entries(cells).filter(([, v]) => v.trim()).map(([k, v]) => { const [itemA, itemB] = k.split("|"); return { itemA, itemB, rationale: v }; });
  useLift({ cells, mappings }, onChange);

  return (
    <div className="space-y-4">
      <GivenNote>Map each regulatory driver to the assets it touches. A blank cell means no obligation (valid). A populated link needs a one-line rationale. <button onClick={() => openRef("ws-driver-map")} className="text-indigo-600 hover:underline font-medium">Open drivers →</button></GivenNote>
      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `150px repeat(${colsB.length}, 1fr)` }}>
          <div className="bg-slate-50/60 border-b border-slate-100" />
          {colsB.map((c) => <div key={c} className="bg-slate-50/60 border-b border-l border-slate-100 px-2 py-2 text-[11px] font-medium text-slate-700 tracking-tight">{c}</div>)}
          {rowsA.map((r) => (
            <div key={r} className="contents">
              <div className="bg-slate-50/30 px-2 py-2.5 border-b border-slate-100 text-[11.5px] font-semibold text-slate-800 tracking-tight">{r}</div>
              {colsB.map((c) => {
                const key = `${r}|${c}`;
                const v = cells[key] || "";
                return (
                  <div key={key} className="border-l border-b border-slate-100 p-1">
                    <textarea value={v} onChange={(e) => setCells({ ...cells, [key]: e.target.value })} rows={2} placeholder="—" className={`w-full h-full min-h-[52px] rounded-md px-2 py-1.5 text-[11px] leading-snug outline-none resize-none transition-colors ${v ? "bg-indigo-50/40 text-slate-800 ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-400" : "bg-transparent text-slate-400 placeholder:text-slate-300 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"}`} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ CALCULATE ============================ */
export function CalculateWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [inputs, setInputs] = useState(() => seed(value, "inputValues", { likelihood: 3, impact: 4, controlEff: 2 }));
  const [citations, setCitations] = useState(() => seed(value, "citations", {
    likelihood: "Sec Ops 2025 Incident Report §4.2", impact: "Org profile · ~2.4M customers", controlEff: "Internal audit ISMS-AUD-2026-01",
  }));
  const [working, setWorking] = useState(() => seed(value, "working", "Likelihood 3 (Moderate) per the 2025 incident frequency report. Impact 4 (High) — orders-db handles PII for ~2.4M customers. Control effectiveness 2 (Partial) — encryption at rest but no per-record audit log yet."));
  const inherent = inputs.likelihood * inputs.impact;
  const residual = inherent * (1 - inputs.controlEff / 4);
  useLift({ formula: "Residual = L × I × (1 − ControlEff/4)", inputs: `L=${inputs.likelihood}; I=${inputs.impact}; ControlEff=${inputs.controlEff}`, inputValues: inputs, citations, working, result: residual.toFixed(1) }, onChange);
  const rows: { k: "likelihood" | "impact" | "controlEff"; label: string; scale: string }[] = [
    { k: "likelihood", label: "Likelihood", scale: "0 None — 4 Almost certain" },
    { k: "impact", label: "Impact", scale: "0 Negligible — 4 Catastrophic" },
    { k: "controlEff", label: "Control effectiveness", scale: "0 None — 4 Optimised" },
  ];

  return (
    <div className="space-y-4">
      <GivenNote>Score each input on the 0–4 scale and cite its source. The result re-computes server-side; drift &gt; ±0 fails. <button onClick={() => openRef("ws-risk-formula")} className="text-indigo-600 hover:underline font-medium">Open formula →</button></GivenNote>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50/60 border-b border-slate-100"><tr>{["Variable", "Value", "Source citation *"].map((h) => <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.k} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-3"><div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{row.label}</div><div className="text-[10.5px] font-mono text-slate-500">{row.scale}</div></td>
                  <td className="px-3 py-3"><input type="number" min={0} max={4} value={inputs[row.k]} onChange={(e) => setInputs({ ...inputs, [row.k]: Math.max(0, Math.min(4, parseInt(e.target.value) || 0)) })} className="w-16 h-9 px-2 rounded-md ring-1 ring-slate-200/80 outline-none text-[14px] font-semibold text-slate-900 text-center bg-white focus:ring-2 focus:ring-amber-400/40" /></td>
                  <td className="px-3 py-3"><input value={citations[row.k]} onChange={(e) => setCitations({ ...citations, [row.k]: e.target.value })} className="w-full h-9 px-2 rounded-md bg-slate-50 ring-1 ring-slate-200/80 outline-none text-[12px] focus:ring-2 focus:ring-amber-400/40" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white self-start">
          <div className="text-[10.5px] font-medium tracking-[0.12em] uppercase text-slate-400">Inherent risk</div>
          <div className="mt-1 text-[26px] font-semibold tabular-nums leading-none">{inherent}</div>
          <div className="text-[11px] text-slate-400">= {inputs.likelihood} × {inputs.impact}</div>
          <div className="mt-4 pt-3 border-t border-slate-700/60"><div className="text-[10.5px] font-medium tracking-[0.12em] uppercase text-slate-400">Residual risk</div><div className="mt-1 flex items-baseline gap-1"><div className="text-[36px] font-semibold tabular-nums leading-none">{residual.toFixed(1)}</div><div className="text-[15px] text-slate-400">/ 16</div></div></div>
        </div>
      </div>
      <div><SectionLabel hint={`${working.length} chars · min 30`}>Working narrative</SectionLabel><WTextArea value={working} onChange={setWorking} rows={3} /></div>
    </div>
  );
}

/* ============================ PRIORITISE ============================ */
type PRow = { id: number; name: string; lik: number; imp: number; vel: number; exp: number };
export function PrioritiseWorkspace({ value, onChange }: WorkspaceProps) {
  const crit: { id: "lik" | "imp" | "vel" | "exp"; label: string; weight: number }[] = [
    { id: "lik", label: "Likelihood", weight: 0.3 }, { id: "imp", label: "Impact", weight: 0.4 }, { id: "vel", label: "Velocity", weight: 0.15 }, { id: "exp", label: "Exposure", weight: 0.15 },
  ];
  const [rows, setRows] = useState<PRow[]>(() => seed(value, "rows", [
    { id: 1, name: "Missing audit log on orders-db", lik: 3, imp: 4, vel: 3, exp: 3 },
    { id: 2, name: "Snowflake joinability risk", lik: 2, imp: 4, vel: 2, exp: 4 },
    { id: 3, name: "Stripe sub-processor disclosure", lik: 3, imp: 3, vel: 2, exp: 3 },
    { id: 4, name: "Vendor cert lapse workflow", lik: 4, imp: 2, vel: 4, exp: 2 },
    { id: 5, name: "R&D sandbox isolation drift", lik: 2, imp: 2, vel: 3, exp: 2 },
  ]));
  const [tieRationale, setTieRationale] = useState(() => seed(value, "tieRationale", ""));
  const score = (r: PRow) => crit.reduce((s, c) => s + r[c.id] * c.weight, 0);
  const sorted = [...rows].sort((a, b) => score(b) - score(a));
  const ties = new Set<number>();
  sorted.forEach((r, i) => { if (i > 0 && Math.abs(score(r) - score(sorted[i - 1])) < 0.01) { ties.add(r.id); ties.add(sorted[i - 1].id); } });
  const ranked = sorted.map((r, i) => ({ item: r.name, criterion: score(r).toFixed(2), rank: i + 1 }));
  useLift({ rows, ranked, tieRationale }, onChange);
  const setS = (id: number, k: "lik" | "imp" | "vel" | "exp", v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: Math.max(0, Math.min(4, parseInt(v) || 0)) } : r)));

  return (
    <div className="space-y-4">
      <GivenNote>Rank by weighted criterion (L 30 · I 40 · Velocity 15 · Exposure 15). The aggregate re-computes server-side; resolve ties with a written rationale.</GivenNote>
      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50/60 border-b border-slate-100"><tr>
            <th className="px-3 py-2 text-left text-[10.5px] font-medium uppercase text-slate-500 w-10">#</th>
            <th className="px-3 py-2 text-left text-[10.5px] font-medium uppercase text-slate-500">Risk item</th>
            {crit.map((c) => <th key={c.id} className="px-2 py-2 text-center text-[10.5px] font-medium uppercase text-slate-500 w-16">{c.label.slice(0, 4)}<br /><span className="font-mono normal-case text-slate-400">{Math.round(c.weight * 100)}%</span></th>)}
            <th className="px-3 py-2 text-right text-[10.5px] font-medium uppercase text-slate-500 w-20">Agg.</th>
          </tr></thead>
          <tbody>
            {sorted.map((r, i) => {
              const inTie = ties.has(r.id);
              return (
                <tr key={r.id} className={`border-b border-slate-50 last:border-0 ${inTie ? "bg-rose-50/30" : ""}`}>
                  <td className="px-3 py-2.5 text-[14px] font-semibold tabular-nums text-slate-900">{i + 1}</td>
                  <td className="px-3 py-2.5"><div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{r.name}</div>{inTie && <div className="text-[10px] text-rose-600 font-medium mt-0.5">⚠ tied — needs tiebreaker</div>}</td>
                  {crit.map((c) => <td key={c.id} className="px-2 py-2.5 text-center"><input type="number" min={0} max={4} value={r[c.id]} onChange={(e) => setS(r.id, c.id, e.target.value)} className="w-11 h-8 rounded-md ring-1 ring-slate-200/80 outline-none text-center text-[12.5px] font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-rose-400/40" /></td>)}
                  <td className="px-3 py-2.5 text-right text-[14px] font-semibold tabular-nums text-slate-900">{score(r).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {ties.size > 0 && (
        <div className="rounded-xl bg-rose-50/40 ring-1 ring-rose-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Icon name="info" size={13} className="text-rose-700" /><h4 className="text-[12px] font-semibold tracking-tight text-rose-800">Tiebreaker rationale required</h4></div>
          <textarea value={tieRationale} onChange={(e) => setTieRationale(e.target.value)} rows={2} placeholder="Why does one tied risk rank above the other? Reference blast radius / regulated data." className="w-full rounded-lg bg-white ring-1 ring-rose-200/80 outline-none px-3 py-2 text-[12.5px] resize-none focus:ring-2 focus:ring-rose-400/40 placeholder:text-slate-400" />
        </div>
      )}
    </div>
  );
}

/* ============================ RECOMMEND ============================ */
type Rec = { id: number; gap: string; action: string; owner: string; date: string; control: string; rationale: string };
export function RecommendWorkspace({ value, onChange }: WorkspaceProps) {
  const [recs, setRecs] = useState<Rec[]>(() => seed(value, "recommendations", [
    { id: 1, gap: "Missing per-record audit log on orders-db", action: "Enable RDS audit-log streaming to CloudTrail; 90 days hot, 1 year cold.", owner: "Data Platform Lead", date: "2026-07-15", control: "ISO 27001 A.8.15", rationale: "Closes the residual-risk gap from RR-2026.1. Audit logs are required for incident response and forensic review." },
    { id: 2, gap: "Snowflake personal-data joinability", action: "Apply data-masking to PII columns; restrict joinable identifiers to a dedicated role.", owner: "Data Platform Lead", date: "2026-08-01", control: "ISO 27001 A.5.34", rationale: "Joinable hashed IDs effectively reconstitute PII; masking + role isolation aligns with Annex A PII guidance." },
    { id: 3, gap: "Stripe sub-processor disclosure cadence", action: "", owner: "", date: "", control: "", rationale: "" },
  ]));
  useLift({ recommendations: recs }, onChange);
  const set = (id: number, k: keyof Rec, v: string) => setRecs((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const owners = ["Data Platform Lead", "Head of Platform", "Security Eng. Lead", "Compliance Lead", "DPO"];
  const valid = (r: Rec) => r.action.length > 10 && r.owner && r.date && r.control && r.rationale.length >= 30;

  return (
    <div className="space-y-3">
      <GivenNote>Propose a remediation for each open gap. Every recommendation must cite a control, name an owner role, and have a target date.</GivenNote>
      {recs.map((r) => {
        const ok = valid(r);
        return (
          <div key={r.id} className={`rounded-2xl bg-white ring-1 p-4 ${ok ? "ring-emerald-200/70" : "ring-slate-200/70"}`}>
            <div className="flex items-start gap-2.5 mb-3"><div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex items-center justify-center text-[11px] font-mono font-semibold">G{r.id}</div><div><div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500">Gap</div><div className="text-[13px] font-semibold text-slate-900 tracking-tight">{r.gap}</div></div>{ok && <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/70"><Icon name="check" size={10} strokeWidth={3} />valid</span>}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><L>Action *</L><textarea value={r.action} onChange={(e) => set(r.id, "action", e.target.value)} rows={2} placeholder="Concrete, action-specific…" className="w-full px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px] resize-none" /></div>
              <div><L>Owner role *</L><select value={r.owner} onChange={(e) => set(r.id, "owner", e.target.value)} className="w-full h-9 px-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px]"><option value="">Pick a role…</option>{owners.map((o) => <option key={o}>{o}</option>)}</select></div>
              <div><L>Target date *</L><input type="date" value={r.date} onChange={(e) => set(r.id, "date", e.target.value)} className="w-full h-9 px-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px]" /></div>
              <div className="col-span-2"><L>Control reference *</L><input value={r.control} onChange={(e) => set(r.id, "control", e.target.value)} placeholder="ISO 27001 A.x.x or NIST SP 800-…" className="w-full h-9 px-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px] font-mono" /></div>
              <div className="col-span-2"><div className="flex items-baseline justify-between"><L>Rationale *</L><span className={`text-[10.5px] tabular-nums ${r.rationale.length >= 30 ? "text-emerald-600" : "text-slate-400"}`}>{r.rationale.length} / 30</span></div><textarea value={r.rationale} onChange={(e) => set(r.id, "rationale", e.target.value)} rows={2} placeholder="Why this action closes the gap; reference the cited control." className="w-full px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px] resize-none" /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function L({ children }: { children: React.ReactNode }) { return <div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-1.5">{children}</div>; }

/* ============================ VALIDATE ============================ */
type Finding = { id: number; text: string; citation: string; verified: boolean | null; followup: string };
export function ValidateWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [findings, setFindings] = useState<Finding[]>(() => seed(value, "findings", [
    { id: 1, text: "orders-db lacks per-record audit log", citation: "ISO 27001 A.8.15", verified: true, followup: "" },
    { id: 2, text: "Snowflake personal-data joinability risk", citation: "ISO 27001 A.5.34", verified: true, followup: "" },
    { id: 3, text: "Vendor cert-tracker follow-through is weak", citation: "", verified: null, followup: "" },
    { id: 4, text: "R&D sandbox lacks isolation testing cadence", citation: "NIST SP 800-53 SC-7", verified: false, followup: "Schedule penetration test for sandbox tier; results due 2026-08-15." },
    { id: 5, text: "Sub-processor disclosure cadence undocumented", citation: "GDPR Art. 28(2)", verified: false, followup: "" },
  ]));
  useLift({ findings }, onChange);
  const set = (id: number, k: keyof Finding, v: string | boolean | null) => setFindings((fs) => fs.map((f) => (f.id === id ? ({ ...f, [k]: v } as Finding) : f)));

  return (
    <div className="space-y-4">
      <GivenNote>Attach a control citation to each finding; toggle Verified / Unverified. No finding may sit indeterminate; unverified ones need a follow-up. <button onClick={() => openRef("ws-control-library")} className="text-indigo-600 hover:underline font-medium">Open controls →</button></GivenNote>
      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-hidden">
        {findings.map((f) => (
          <div key={f.id} className="px-4 py-3.5 border-b border-slate-100 last:border-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100 flex items-center justify-center text-[11px] font-mono font-semibold">F{f.id}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-900 tracking-tight">{f.text}</div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 h-8 pl-2 pr-3 rounded-lg ring-1 ${f.citation ? "bg-indigo-50 ring-indigo-200 text-indigo-700" : "bg-slate-50 ring-slate-200/80 text-slate-500"}`}><Icon name="link" size={12} /><input value={f.citation} onChange={(e) => set(f.id, "citation", e.target.value)} placeholder="Cite a control…" className="bg-transparent outline-none text-[11.5px] font-mono w-44 placeholder:text-slate-400" /></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="inline-flex rounded-lg bg-slate-100/80 p-0.5">
                  <button onClick={() => set(f.id, "verified", true)} className={`h-7 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${f.verified === true ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${f.verified === true ? "bg-emerald-500" : "bg-slate-300"}`} />Verified</button>
                  <button onClick={() => set(f.id, "verified", false)} className={`h-7 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${f.verified === false ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${f.verified === false ? "bg-amber-500" : "bg-slate-300"}`} />Unverified</button>
                </div>
                {f.verified === null && <span className="text-[10px] text-rose-600 font-medium">⚠ indeterminate</span>}
              </div>
            </div>
            {f.verified === false && (
              <div className="mt-3 pl-10"><div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-amber-700 mb-1">Follow-up action *</div><textarea value={f.followup} onChange={(e) => set(f.id, "followup", e.target.value)} rows={2} placeholder="What investigation closes this? Owner, date, source." className="w-full px-3 py-2 rounded-lg bg-amber-50/40 ring-1 ring-amber-200/80 focus:ring-2 focus:ring-amber-400/40 outline-none text-[12.5px] resize-none" /></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ SCHEDULE ============================ */
export function ScheduleWorkspace({ value, onChange }: WorkspaceProps) {
  const [purpose, setPurpose] = useState(() => seed(value, "purpose", "Walk through the Q3 access-review approach and confirm RBAC role definitions for the new ISMS scope."));
  const [agenda, setAgenda] = useState(() => seed(value, "agenda", "1. Current access-review cadence (10 min)\n2. RBAC role catalogue review (15 min)\n3. Privileged-access workflow gaps (15 min)\n4. Decision on Q3 ownership (10 min)"));
  const [slots, setSlots] = useState(() => seed(value, "slots", [
    { time: "Tue 2026-07-02 · 10:00", agreed: false }, { time: "Wed 2026-07-03 · 14:00", agreed: true }, { time: "Fri 2026-07-05 · 11:00", agreed: false },
  ]));
  const agreed = slots.filter((s) => s.agreed).map((s) => s.time);
  useLift({ purpose, agenda, proposedTimes: slots.map((s) => s.time), confirmation: agreed.join(", ") }, onChange);
  const toggle = (i: number) => setSlots((ss) => ss.map((s, j) => ({ ...s, agreed: j === i ? !s.agreed : s.agreed })));

  return (
    <div className="space-y-4">
      <GivenNote>Provide purpose, agenda, and time options, then mark the slot the stakeholder confirmed (their reply is pre-scripted below).</GivenNote>
      <div><SectionLabel>Purpose</SectionLabel><WTextArea value={purpose} onChange={setPurpose} rows={2} hint={`${purpose.length} chars`} /></div>
      <div><SectionLabel>Agenda</SectionLabel><WTextArea value={agenda} onChange={setAgenda} rows={5} /></div>
      <div>
        <SectionLabel>Proposed time slots — tap the confirmed one</SectionLabel>
        <div className="space-y-2">
          {slots.map((s, i) => (
            <button key={i} onClick={() => toggle(i)} className={`w-full flex items-center gap-3 rounded-xl bg-white ring-1 transition-all p-3 text-left ${s.agreed ? "ring-emerald-300 bg-emerald-50/20" : "ring-slate-200/80 hover:ring-slate-300"}`}>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.agreed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><Icon name="calendar" size={14} /></span>
              <span className="flex-1 text-[13px] text-slate-900 font-medium tracking-tight">{s.time}</span>
              {s.agreed && <span className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-emerald-700">Confirmed</span>}
            </button>
          ))}
        </div>
      </div>
      <ScriptedExchange title="Stakeholder reply (pre-scripted)" turns={[
        { who: "stakeholder", initials: "IL", text: "Wed 14:00 works for me. Can you share the RBAC role catalogue ahead so I can pull current state? I'll bring the access-review report from May." },
      ]} />
    </div>
  );
}
