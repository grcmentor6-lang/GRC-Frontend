"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  type WorkspaceProps, useLift, seed, SectionLabel, WTextArea, WTextInput,
  GivenNote, ScriptedExchange,
} from "./kit";
import { getCalcTask, type CalcTask } from "@/lib/calc-tasks";
import { getFormTask, type FormTask, type FormKind } from "@/lib/form-tasks";
import { getMapTask } from "@/lib/map-tasks";
import { getPrioTask, type PrioTask } from "@/lib/prioritise-tasks";
import { RunQuality, ScriptedApplyFlow } from "./set-a";

/* ===== Prioritise: score items per criterion → live aggregate + rank → ties need a tiebreaker ===== */
function ScriptedPrioritiseFlow({ task, value, onChange }: { task: PrioTask } & Pick<WorkspaceProps, "value" | "onChange">) {
  const [scores, setScores] = useState<Record<number, Record<string, string>>>(() => seed(value, "scores", {} as Record<number, Record<string, string>>));
  const [tiebreak, setTiebreak] = useState<Record<number, string>>(() => seed(value, "tiebreak", {} as Record<number, string>));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const scoreOf = (id: number, cr: string) => scores[id]?.[cr] ?? "";
  const scored = (id: number) => task.criteria.every((cr) => { const v = scoreOf(id, cr).trim(); const n = Number(v); return v !== "" && n >= 1 && n <= task.scaleMax; });
  const agg = (id: number): number | null => { if (!scored(id)) return null; const ns = task.criteria.map((cr) => Number(scoreOf(id, cr))); return task.aggregate === "sum" ? ns.reduce((a, b) => a + b, 0) : ns.reduce((a, b) => a * b, 1); };
  const aggs = task.items.map((it) => agg(it.id));
  const rankOf = (id: number): number | null => { const a = agg(id); if (a == null) return null; return 1 + aggs.filter((x) => x != null && x > a).length; };
  const isTied = (id: number) => { const a = agg(id); return a != null && aggs.filter((x) => x === a).length > 1; };
  const tiedIds = task.items.filter((it) => isTied(it.id)).map((it) => it.id);
  const allScored = task.items.every((it) => scored(it.id));
  const tiesResolved = tiedIds.every((id) => (tiebreak[id] ?? "").trim().length > 0);
  const objectiveMet = allScored && tiesResolved;
  useLift({ scores, tiebreak, objectiveMet }, onChange);

  const setScore = (id: number, cr: string, v: string) => setScores((s) => ({ ...s, [id]: { ...s[id], [cr]: v } }));

  return (
    <div className="space-y-4">
      <GivenNote>Score each item from 1–{task.scaleMax} on every criterion. The aggregate ({task.aggregate}) and rank compute automatically — any tie needs a documented tiebreaker before you can submit.</GivenNote>
      <SectionLabel hint={task.standard}>{task.title}</SectionLabel>
      <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/60 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
              <th className="px-3 py-2 font-semibold">Item</th>
              {task.criteria.map((cr) => <th key={cr} className="px-3 py-2 font-semibold text-center w-[90px]">{cr}</th>)}
              <th className="px-3 py-2 font-semibold text-center w-[70px]">Aggregate</th>
              <th className="px-3 py-2 font-semibold text-center w-[60px]">Rank</th>
            </tr>
          </thead>
          <tbody>
            {task.items.map((it) => {
              const tied = isTied(it.id);
              const bad = checked && (!scored(it.id) || (tied && !(tiebreak[it.id] ?? "").trim()));
              return (
                <tr key={it.id} className={`border-t border-slate-100 align-top ${bad ? "bg-rose-50/60" : tied ? "bg-amber-50/40" : ""}`}>
                  <td className="px-3 py-2 text-[12px] font-medium text-slate-900">{it.label}
                    {tied && (
                      <input value={tiebreak[it.id] ?? ""} onChange={(e) => setTiebreak((t) => ({ ...t, [it.id]: e.target.value }))} placeholder="Tiebreaker rationale (required)…"
                        className="mt-1.5 w-full h-8 px-2 rounded-md bg-white ring-1 ring-amber-300 focus:ring-2 focus:ring-amber-400/50 outline-none text-[11.5px]" />
                    )}
                  </td>
                  {task.criteria.map((cr) => (
                    <td key={cr} className="px-3 py-2 text-center">
                      <input value={scoreOf(it.id, cr)} onChange={(e) => setScore(it.id, cr, e.target.value)} inputMode="numeric" placeholder="—"
                        className="w-12 h-8 px-1 text-center rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px] tabular-nums" />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-[13px] font-semibold text-slate-900 tabular-nums">{agg(it.id) ?? "—"}</td>
                  <td className="px-3 py-2 text-center text-[13px] font-semibold text-indigo-700 tabular-nums">{rankOf(it.id) ?? "—"}{tied ? " *" : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">{objectiveMet ? "Ranked and ties resolved — ready to submit." : tiedIds.length > 0 && allScored ? `${tiedIds.length} tied items need a tiebreaker.` : "Score every item on all criteria."}</p>
        <button onClick={() => setChecked(true)} className="h-8 px-3 rounded-lg text-[12px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"><Icon name="check" size={13} />Check ranking</button>
      </div>
      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Ranked</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">All items scored and ties resolved with a documented tiebreaker. {task.feedsNext}</p>
        </div>
      )}
    </div>
  );
}

/* ===== Generic completeness-form flow: Recommend / Validate / Draft / Schedule ===== */
type FF = { key: string; label: string; type: "text" | "textarea" | "date" | "select"; required?: boolean; minLen?: number; placeholder?: string; options?: string[]; optionsFrom?: "owners" | "item" | "scale"; condOn?: { key: string; equals: string }; condOutlier?: boolean };
const FORM_FIELDS: Record<FormKind, FF[]> = {
  recommend: [
    { key: "action", label: "Action", type: "textarea", required: true, placeholder: "A specific, actionable remediation…" },
    { key: "control", label: "Control reference", type: "text", required: true, placeholder: "e.g. ISO A.5.17 / CIS 4.7" },
    { key: "owner", label: "Owner role", type: "select", required: true, optionsFrom: "owners" },
    { key: "date", label: "Target date", type: "date", required: true },
    { key: "rationale", label: "Rationale", type: "textarea", required: true, minLen: 30, placeholder: "Why this matters / the risk it closes (≥ 30 chars)…" },
  ],
  validate: [
    { key: "citation", label: "Citation / source", type: "textarea", required: true, placeholder: "Standard control + how it was confirmed…" },
    { key: "status", label: "Status", type: "select", required: true, options: ["Verified", "Unverified"] },
    { key: "followup", label: "Follow-up action", type: "textarea", required: true, condOn: { key: "status", equals: "Unverified" }, placeholder: "Required for unverified findings…" },
  ],
  draft: [
    { key: "content", label: "Section content", type: "textarea", required: true, placeholder: "Write this section in plain language…" },
    { key: "citation", label: "Standards cited (if applicable)", type: "text", placeholder: "e.g. ISO 27001 A.5.26" },
  ],
  schedule: [
    { key: "purpose", label: "Purpose", type: "text", required: true, placeholder: "Why you're meeting…" },
    { key: "agenda", label: "Agenda", type: "textarea", required: true, placeholder: "What you'll cover…" },
    { key: "time", label: "Agreed time", type: "select", required: true, optionsFrom: "item" },
  ],
  compile: [
    { key: "source", label: "Source artefact", type: "text", required: true, placeholder: "Which prior step this comes from…" },
    { key: "content", label: "Section content / key figure", type: "textarea", required: true, placeholder: "Summarise the section; keep figures consistent with the detail…" },
  ],
  document: [
    { key: "content", label: "Section content", type: "textarea", required: true, placeholder: "Write in a professional tone (no first-person/contractions)…" },
    { key: "crossref", label: "Cross-reference", type: "text", required: true, placeholder: "Link to a prior-step artefact, e.g. 'See AA-003 RoPA'…" },
  ],
  signoff: [
    { key: "decision", label: "Decision", type: "select", required: true, options: ["Approved", "Approved with Conditions", "Rejected"] },
    { key: "date", label: "Decision date", type: "date", required: true },
    { key: "conditions", label: "Conditions", type: "textarea", required: true, condOn: { key: "decision", equals: "Approved with Conditions" }, placeholder: "What must be done…" },
    { key: "revision", label: "Revision plan", type: "textarea", required: true, condOn: { key: "decision", equals: "Rejected" }, placeholder: "What to fix and re-present…" },
  ],
  score: [
    { key: "score", label: "Score (0–4)", type: "select", required: true, options: ["0", "1", "2", "3", "4"] },
    { key: "justification", label: "Justification", type: "textarea", required: true, minLen: 15, placeholder: "Why this score, against the anchor (≥ 15 chars)…" },
  ],
  assess: [
    { key: "level", label: "Assigned level", type: "select", required: true, optionsFrom: "scale" },
    { key: "evidence", label: "Cited evidence", type: "textarea", required: true, placeholder: "The specific evidence supporting this level…" },
    { key: "outlier", label: "Outlier justification", type: "textarea", required: true, condOutlier: true, placeholder: "This level is far from the cluster — justify it…" },
  ],
};

export function FormFlow({ task, value, onChange }: { task: FormTask } & Pick<WorkspaceProps, "value" | "onChange">) {
  const fields = FORM_FIELDS[task.kind];
  const [entries, setEntries] = useState<Record<number, Record<string, string>>>(() => seed(value, "entries", {} as Record<number, Record<string, string>>));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));

  const val = (id: number, k: string) => entries[id]?.[k] ?? "";

  // Assess: flag items whose assigned level is ≥2 steps from the median of the assigned cluster.
  const scaleVal = (label: string) => task.scale?.find((s) => s.label === label)?.value;
  const outlierSet = (() => {
    if (task.kind !== "assess") return new Set<number>();
    const vs = task.items.map((it) => ({ id: it.id, v: scaleVal(val(it.id, "level")) })).filter((x) => x.v != null) as { id: number; v: number }[];
    if (vs.length < 3) return new Set<number>();
    const sorted = vs.map((x) => x.v).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return new Set(vs.filter((x) => Math.abs(x.v - median) >= 2).map((x) => x.id));
  })();

  const active = (id: number, f: FF) => !!f.required && (!f.condOn || val(id, f.condOn.key) === f.condOn.equals) && (!f.condOutlier || outlierSet.has(id));
  const fieldOk = (id: number, f: FF) => !active(id, f) || (val(id, f.key).trim().length > 0 && (!f.minLen || val(id, f.key).trim().length >= f.minLen));
  const itemOk = (id: number) => fields.every((f) => fieldOk(id, f));
  const objectiveMet = task.items.every((it) => itemOk(it.id));
  useLift({ kind: task.kind, entries, objectiveMet }, onChange);

  const set = (id: number, k: string, v: string) => setEntries((e) => ({ ...e, [id]: { ...e[id], [k]: v } }));
  const incomplete = task.items.filter((it) => !itemOk(it.id));

  // Score: live weighted aggregate (Σ score×weight ÷ Σ weight) on a 0–4 scale.
  const allScored = task.kind === "score" && task.items.every((it) => val(it.id, "score") !== "");
  const aggregate = (() => {
    if (task.kind !== "score") return null;
    const totW = task.items.reduce((a, it) => a + (it.weight ?? 1), 0);
    const wsum = task.items.reduce((a, it) => a + Number(val(it.id, "score") || 0) * (it.weight ?? 1), 0);
    return totW ? wsum / totW : 0;
  })();

  const optionsFor = (it: FormTask["items"][number], f: FF) => f.options ?? (f.optionsFrom === "owners" ? task.owners ?? [] : f.optionsFrom === "item" ? it.options?.time ?? [] : f.optionsFrom === "scale" ? task.scale?.map((s) => s.label) ?? [] : []);

  return (
    <div className="space-y-4">
      <GivenNote>Complete every {task.itemLabel} below. Submission unlocks once each has its required fields filled in.</GivenNote>
      <SectionLabel hint={task.standard}>{task.title}</SectionLabel>
      <div className="space-y-3">
        {task.items.map((it) => {
          const bad = checked && !itemOk(it.id);
          const outlier = outlierSet.has(it.id);
          return (
            <div key={it.id} className={`rounded-2xl ring-1 p-4 ${bad ? "ring-rose-300 bg-rose-50/40" : outlier ? "ring-amber-300 bg-amber-50/30" : "ring-slate-200/70 bg-white"}`}>
              <div className="text-[12.5px] font-medium text-slate-900 mb-2.5 flex items-start gap-2"><span className="text-[11px] font-mono text-slate-400 mt-0.5">{it.id}.</span><span>{it.label}</span>{outlier && <span className="ml-auto text-[10px] font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">OUTLIER</span>}{task.kind === "score" && it.weight ? <span className="ml-auto text-[10px] text-slate-400">weight ×{it.weight}</span> : null}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {fields.map((f) => {
                  if (f.condOn && val(it.id, f.condOn.key) !== f.condOn.equals) return null;
                  if (f.condOutlier && !outlier) return null;
                  const wide = f.type === "textarea";
                  return (
                    <div key={f.key} className={wide ? "sm:col-span-2" : ""}>
                      <div className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500 mb-1">{f.label}{f.required ? <span className="text-rose-500"> *</span> : null}</div>
                      {f.type === "textarea" ? (
                        <textarea value={val(it.id, f.key)} onChange={(e) => set(it.id, f.key, e.target.value)} rows={2} placeholder={f.placeholder}
                          className="w-full px-2.5 py-2 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px] resize-none" />
                      ) : f.type === "select" ? (
                        <select value={val(it.id, f.key)} onChange={(e) => set(it.id, f.key, e.target.value)} className="w-full h-9 px-2 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px]">
                          <option value="">— pick —</option>
                          {optionsFor(it, f).map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={f.type} value={val(it.id, f.key)} onChange={(e) => set(it.id, f.key, e.target.value)} placeholder={f.placeholder}
                          className="w-full h-9 px-2.5 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px]" />
                      )}
                    </div>
                  );
                })}
              </div>
              {task.kind === "schedule" && val(it.id, "time") && <div className="mt-2 text-[11.5px] text-emerald-700 flex items-center gap-1.5"><Icon name="check" size={12} /> Confirmation captured — accepted: {val(it.id, "time")}</div>}
            </div>
          );
        })}
      </div>

      {task.kind === "score" && (
        <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white px-4 py-3">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400">Weighted aggregate (0–4)</span>
          <span className="text-[18px] font-semibold tabular-nums">{allScored && aggregate != null ? aggregate.toFixed(2) : "—"}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">{objectiveMet ? "All complete — ready to submit." : `${incomplete.length} ${task.itemLabel}${incomplete.length === 1 ? "" : "s"} still need attention.`}</p>
        <button onClick={() => setChecked(true)} className="h-8 px-3 rounded-lg text-[12px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"><Icon name="check" size={13} />Check completeness</button>
      </div>

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> Complete</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">Every {task.itemLabel} is complete. {task.feedsNext}</p>
        </div>
      )}
    </div>
  );
}

/* ============================ DRAFT ============================ */
type Section = { id: string; title: string; content: string };
export function DraftWorkspace(props: WorkspaceProps) {
  const t = getFormTask(props.taskCode, props.activityCode);
  return t ? <FormFlow task={t} value={props.value} onChange={props.onChange} /> : <LegacyDraftWorkspace {...props} />;
}
function LegacyDraftWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [docTitle] = useState(() => seed(value, "docTitle", "Information Classification Policy"));
  // Section headings are the given scaffold; every section body and citation is drafted by the mentee.
  const [sections, setSections] = useState<Section[]>(() => seed(value, "sectionList", [
    { id: "purpose", title: "1 · Purpose", content: "" },
    { id: "scope", title: "2 · Scope", content: "" },
    { id: "defs", title: "3 · Definitions", content: "" },
    { id: "policy", title: "4 · Policy Statements", content: "" },
    { id: "roles", title: "5 · Roles & Responsibilities", content: "" },
    { id: "rev", title: "6 · Review Cadence", content: "" },
  ]));
  const [standards, setStandards] = useState<string[]>(() => seed(value, "standardsCited", [""]));
  const filled = sections.filter((s) => s.content.trim()).length;
  // Headings and the doc title are the given scaffold; the bodies and citations are the work.
  const ready = filled === sections.length && standards.some((s) => s.trim());
  useLift({ docTitle, sections: sections.map((s) => `${s.title}: ${s.content}`).join("\n"), sectionList: sections, standardsCited: standards, ready }, onChange);
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
export function MapWorkspace(props: WorkspaceProps) {
  const t = getMapTask(props.taskCode, props.activityCode);
  return t ? <ScriptedApplyFlow task={t} value={props.value} onChange={props.onChange} taskCode={props.taskCode!} activityCode={props.activityCode!} /> : <LegacyMapWorkspace {...props} />;
}
function LegacyMapWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const rowsA = ["EU GDPR", "UK GDPR", "PCI-DSS v4.0", "SOC 2 (existing)", "ISO 27701"];
  const colsB = ["orders-db", "K8s prod", "Stripe Connect", "Snowflake", "Marketing CMS"];
  const [cells, setCells] = useState<Record<string, string>>(() => seed(value, "cells", {} as Record<string, string>));
  const mappings = Object.entries(cells).filter(([, v]) => v.trim()).map(([k, v]) => { const [itemA, itemB] = k.split("|"); return { itemA, itemB, rationale: v }; });
  // A blank cell is a valid answer ("no obligation"), but every driver needs at least one link,
  // otherwise an empty grid would submit as a finished mapping.
  const ready = rowsA.every((r) => mappings.some((m) => m.itemA === r));
  useLift({ cells, mappings, ready }, onChange);

  return (
    <div className="space-y-4">
      <GivenNote>Map each regulatory driver to the assets it touches. A blank cell means no obligation (valid), but every driver needs at least one mapped asset. A populated link needs a one-line rationale. <button onClick={() => openRef("ws-driver-map")} className="text-indigo-600 hover:underline font-medium">Open drivers →</button></GivenNote>
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
// Data-driven Calculate: enter a computed result per row (must match the engine recompute ±0) and
// cite the formula ID. Submission is gated on all results matching + the formula cited.
export function CalculateWorkspace({ value, onChange, openRef, taskCode, activityCode }: WorkspaceProps) {
  const task = useMemo(() => getCalcTask(taskCode, activityCode), [taskCode, activityCode]);
  if (task) return <ScriptedCalcFlow task={task} value={value} onChange={onChange} />;
  return <LegacyCalculateWorkspace value={value} onChange={onChange} openRef={openRef} />;
}

function ScriptedCalcFlow({ task, value, onChange }: { task: CalcTask } & Pick<WorkspaceProps, "value" | "onChange">) {
  const [results, setResults] = useState<Record<number, string>>(() => seed(value, "results", {} as Record<number, string>));
  const [cite, setCite] = useState(() => seed(value, "formulaCite", ""));
  const [checked, setChecked] = useState(() => seed<boolean>(value, "objectiveMet", false));
  // Rows the mentee has had to correct. Every passing submission is otherwise identical, so this is
  // what the deterministic grade scores — get every figure right first time and it's full marks.
  const [slipRows, setSlipRows] = useState<number[]>(() => seed(value, "slipRows", [] as number[]));

  const matchOf = (r: { id: number; expected: number }) => {
    const v = results[r.id];
    return v != null && v.trim() !== "" && Math.abs(Number(v) - r.expected) < 0.05;
  };
  const wrongIds = task.rows.filter((r) => (results[r.id] ?? "").trim() !== "" && !matchOf(r)).map((r) => r.id);
  const unsetIds = task.rows.filter((r) => (results[r.id] ?? "").trim() === "").map((r) => r.id);
  const citeOk = cite.trim().toUpperCase() === task.formulaId.toUpperCase();
  const allMatch = task.rows.every(matchOf);
  const objectiveMet = allMatch && citeOk;
  // Every result is checked against the engine and the formula ID must match exactly, so a passing
  // submission is identical for every mentee — graded deterministically, no LLM. See ai_grader.
  useLift({ scripted: true, formulaCite: cite, results, objectiveMet, slips: slipRows.length, slipRows }, onChange);

  // Checking is how you find out you were wrong, so a check that surfaces a bad figure is the slip.
  // Recorded per row, so re-checking the same mistake doesn't compound it.
  const check = () => {
    setChecked(true);
    setSlipRows((prev) => [...new Set([...prev, ...wrongIds])]);
  };

  const setResult = (id: number, v: string) => setResults((s) => ({ ...s, [id]: v }));
  const label = (id: number) => task.rows.find((r) => r.id === id)?.instance ?? `#${id}`;

  return (
    <div className="space-y-4">
      <GivenNote>Compute the metric for each row using the formula below, then enter your result. The engine re-runs the formula — your result must match exactly (±0). Cite the formula ID to submit.</GivenNote>

      <div className="rounded-2xl bg-slate-900 text-white p-4">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-1.5">Formula · {task.formulaId}</div>
        <div className="font-mono text-[13px] text-slate-100">{task.formula}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 items-start">
        <div>
          <SectionLabel hint={cite && !citeOk ? "must match the formula ID" : undefined}>Cite the formula ID <span className="text-rose-500">*</span></SectionLabel>
          <WTextInput value={cite} onChange={setCite} placeholder={task.formulaId} />
        </div>
        <div className="text-[11.5px] text-slate-500 sm:pt-7">{task.metric}{task.unit ? ` · result in ${task.unit}` : ""}</div>
      </div>

      <div>
        <SectionLabel hint={`${task.rows.filter(matchOf).length} / ${task.rows.length} correct`} action={
          <button onClick={check} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="check" size={12} />Check results</button>
        }>{task.title}</SectionLabel>
        <div className="rounded-xl ring-1 ring-slate-200/80 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
                <th className="px-3 py-2 font-semibold">Instance</th>
                {task.inputCols.map((c) => <th key={c} className="px-3 py-2 font-semibold text-right">{c}</th>)}
                <th className="px-3 py-2 font-semibold w-[150px]">Your result{task.unit ? ` (${task.unit})` : ""}</th>
              </tr>
            </thead>
            <tbody>
              {task.rows.map((r) => {
                const wrong = checked && (results[r.id] ?? "").trim() !== "" && !matchOf(r);
                const unset = checked && (results[r.id] ?? "").trim() === "";
                return (
                  <tr key={r.id} className={`border-t border-slate-100 ${wrong ? "bg-rose-50/70" : unset ? "bg-amber-50/70" : ""}`}>
                    <td className="px-3 py-2 text-[12px] font-medium text-slate-900">{r.instance}</td>
                    {r.inputs.map((inp, i) => <td key={i} className="px-3 py-2 text-[12px] text-slate-600 text-right tabular-nums">{inp.value}</td>)}
                    <td className="px-3 py-2">
                      <input value={results[r.id] ?? ""} onChange={(e) => setResult(r.id, e.target.value)} inputMode="decimal" placeholder="—"
                        className="w-full h-8 px-2 rounded-md bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/40 outline-none text-[12px] tabular-nums" />
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
              <div className="flex items-center gap-1.5 font-medium text-rose-700"><Icon name="x" size={13} /> Recompute these — they don&apos;t match the engine:</div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-rose-900/80">{wrongIds.map((id) => <li key={id}>{label(id)}</li>)}</ul>
            </div>
          )}
          {unsetIds.length > 0 && <div className="text-amber-700 font-medium flex items-center gap-1.5"><Icon name="info" size={13} /> {unsetIds.length} row{unsetIds.length > 1 ? "s" : ""} still need a result.</div>}
          {!citeOk && <div className="text-rose-700 font-medium">Cite the formula ID ({task.formulaId}) to submit.</div>}
        </div>
      )}

      {objectiveMet && (
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} /> All results match the engine</div>
          <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">Every value recomputes to ±0 and the formula is cited. {task.feedsNext}</p>
          <RunQuality slips={slipRows.length} />
        </div>
      )}
    </div>
  );
}

function LegacyCalculateWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [inputs, setInputs] = useState(() => seed(value, "inputValues", { likelihood: 0, impact: 0, controlEff: 0 }));
  const [citations, setCitations] = useState(() => seed(value, "citations", { likelihood: "", impact: "", controlEff: "" }));
  const [working, setWorking] = useState(() => seed(value, "working", ""));
  const inherent = inputs.likelihood * inputs.impact;
  const residual = inherent * (1 - inputs.controlEff / 4);
  // Every input needs its source cited (the stated acceptance criterion) plus the working narrative.
  const ready = (["likelihood", "impact", "controlEff"] as const).every((k) => citations[k].trim()) && working.trim().length >= 30;
  useLift({ formula: "Residual = L × I × (1 − ControlEff/4)", inputs: `L=${inputs.likelihood}; I=${inputs.impact}; ControlEff=${inputs.controlEff}`, inputValues: inputs, citations, working, result: residual.toFixed(1), ready }, onChange);
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
                  <td className="px-3 py-3"><input value={citations[row.k]} onChange={(e) => setCitations({ ...citations, [row.k]: e.target.value })} placeholder="Where this number comes from…" className="w-full h-9 px-2 rounded-md bg-slate-50 ring-1 ring-slate-200/80 outline-none text-[12px] focus:ring-2 focus:ring-amber-400/40 placeholder:text-slate-400" /></td>
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
      <div><SectionLabel hint={`${working.length} chars · min 30`}>Working narrative</SectionLabel><WTextArea value={working} onChange={setWorking} rows={3} placeholder="Justify each score against its cited source…" /></div>
    </div>
  );
}

/* ============================ PRIORITISE ============================ */
type PRow = { id: number; name: string; lik: number; imp: number; vel: number; exp: number };
export function PrioritiseWorkspace(props: WorkspaceProps) {
  const t = getPrioTask(props.taskCode, props.activityCode);
  return t ? <ScriptedPrioritiseFlow task={t} value={props.value} onChange={props.onChange} /> : <LegacyPrioritiseWorkspace {...props} />;
}
function LegacyPrioritiseWorkspace({ value, onChange }: WorkspaceProps) {
  const crit: { id: "lik" | "imp" | "vel" | "exp"; label: string; weight: number }[] = [
    { id: "lik", label: "Likelihood", weight: 0.3 }, { id: "imp", label: "Impact", weight: 0.4 }, { id: "vel", label: "Velocity", weight: 0.15 }, { id: "exp", label: "Exposure", weight: 0.15 },
  ];
  // Risk items are given; every criterion score is the mentee's.
  const [rows, setRows] = useState<PRow[]>(() => seed(value, "rows", [
    { id: 1, name: "Missing audit log on orders-db", lik: 0, imp: 0, vel: 0, exp: 0 },
    { id: 2, name: "Snowflake joinability risk", lik: 0, imp: 0, vel: 0, exp: 0 },
    { id: 3, name: "Stripe sub-processor disclosure", lik: 0, imp: 0, vel: 0, exp: 0 },
    { id: 4, name: "Vendor cert lapse workflow", lik: 0, imp: 0, vel: 0, exp: 0 },
    { id: 5, name: "R&D sandbox isolation drift", lik: 0, imp: 0, vel: 0, exp: 0 },
  ]));
  const [tieRationale, setTieRationale] = useState(() => seed(value, "tieRationale", ""));
  const score = (r: PRow) => crit.reduce((s, c) => s + r[c.id] * c.weight, 0);
  const sorted = [...rows].sort((a, b) => score(b) - score(a));
  const ties = new Set<number>();
  // Unscored rows all sit at 0 — that's not a tie to resolve, so only compare scored ones.
  sorted.forEach((r, i) => { if (i > 0 && score(r) > 0 && Math.abs(score(r) - score(sorted[i - 1])) < 0.01) { ties.add(r.id); ties.add(sorted[i - 1].id); } });
  const ranked = sorted.map((r, i) => ({ item: r.name, criterion: score(r).toFixed(2), rank: i + 1 }));
  // Every item scored on every criterion (0 = unscored here), and any tie documented.
  const ready = rows.every((r) => crit.every((c) => r[c.id] > 0)) && (ties.size === 0 || tieRationale.trim().length > 0);
  useLift({ rows, ranked, tieRationale, ready }, onChange);
  const setS = (id: number, k: "lik" | "imp" | "vel" | "exp", v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: Math.max(0, Math.min(4, parseInt(v) || 0)) } : r)));

  return (
    <div className="space-y-4">
      <GivenNote>Score every item on all four criteria (1–4) — 0 counts as unscored. Ranking is by weighted criterion (L 30 · I 40 · Velocity 15 · Exposure 15); the aggregate re-computes server-side, and any tie needs a written rationale.</GivenNote>
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
type Rec = { id: number; gap: string; action: string; owner: string; control: string; rationale: string };
export function RecommendWorkspace(props: WorkspaceProps) {
  const t = getFormTask(props.taskCode, props.activityCode);
  return t ? <FormFlow task={t} value={props.value} onChange={props.onChange} /> : <LegacyRecommendWorkspace {...props} />;
}
function LegacyRecommendWorkspace({ value, onChange }: WorkspaceProps) {
  // The gaps are given; the remediation, owner, control and rationale are the mentee's.
  const [recs, setRecs] = useState<Rec[]>(() => seed(value, "recommendations", [
    { id: 1, gap: "Missing per-record audit log on orders-db", action: "", owner: "", control: "", rationale: "" },
    { id: 2, gap: "Snowflake personal-data joinability", action: "", owner: "", control: "", rationale: "" },
    { id: 3, gap: "Stripe sub-processor disclosure cadence", action: "", owner: "", control: "", rationale: "" },
  ]));
  // Same rule the per-card "valid" badge shows — every gap needs a complete recommendation.
  const valid = (r: Rec) => r.action.length > 10 && !!r.owner && !!r.control && r.rationale.length >= 30;
  useLift({ recommendations: recs, ready: recs.every(valid) }, onChange);
  const set = (id: number, k: keyof Rec, v: string) => setRecs((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const owners = ["Data Platform Lead", "Head of Platform", "Security Eng. Lead", "Compliance Lead", "DPO"];

  return (
    <div className="space-y-3">
      <GivenNote>Propose a remediation for each open gap. Every recommendation must cite a control and name an owner role.</GivenNote>
      {recs.map((r) => {
        const ok = valid(r);
        return (
          <div key={r.id} className={`rounded-2xl bg-white ring-1 p-4 ${ok ? "ring-emerald-200/70" : "ring-slate-200/70"}`}>
            <div className="flex items-start gap-2.5 mb-3"><div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex items-center justify-center text-[11px] font-mono font-semibold">G{r.id}</div><div><div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500">Gap</div><div className="text-[13px] font-semibold text-slate-900 tracking-tight">{r.gap}</div></div>{ok && <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/70"><Icon name="check" size={10} strokeWidth={3} />valid</span>}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><L>Action *</L><textarea value={r.action} onChange={(e) => set(r.id, "action", e.target.value)} rows={2} placeholder="Concrete, action-specific…" className="w-full px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px] resize-none" /></div>
              <div className="col-span-2"><L>Owner role *</L><select value={r.owner} onChange={(e) => set(r.id, "owner", e.target.value)} className="w-full h-9 px-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 focus:ring-2 focus:ring-emerald-400/40 outline-none text-[12.5px]"><option value="">Pick a role…</option>{owners.map((o) => <option key={o}>{o}</option>)}</select></div>
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
export function ValidateWorkspace(props: WorkspaceProps) {
  const t = getFormTask(props.taskCode, props.activityCode);
  return t ? <FormFlow task={t} value={props.value} onChange={props.onChange} /> : <LegacyValidateWorkspace {...props} />;
}
function LegacyValidateWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  // The findings are given; each citation, verdict and follow-up is the mentee's.
  const [findings, setFindings] = useState<Finding[]>(() => seed(value, "findings", [
    { id: 1, text: "orders-db lacks per-record audit log", citation: "", verified: null, followup: "" },
    { id: 2, text: "Snowflake personal-data joinability risk", citation: "", verified: null, followup: "" },
    { id: 3, text: "Vendor cert-tracker follow-through is weak", citation: "", verified: null, followup: "" },
    { id: 4, text: "R&D sandbox lacks isolation testing cadence", citation: "", verified: null, followup: "" },
    { id: 5, text: "Sub-processor disclosure cadence undocumented", citation: "", verified: null, followup: "" },
  ]));
  // Stated rules: every finding cited, none left indeterminate, unverified ones need a follow-up.
  const ready = findings.every((f) => f.citation.trim() && f.verified !== null && (f.verified || f.followup.trim()));
  useLift({ findings, ready }, onChange);
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
export function ScheduleWorkspace(props: WorkspaceProps) {
  const t = getFormTask(props.taskCode, props.activityCode);
  return t ? <FormFlow task={t} value={props.value} onChange={props.onChange} /> : <LegacyScheduleWorkspace {...props} />;
}
function LegacyScheduleWorkspace({ value, onChange }: WorkspaceProps) {
  const [purpose, setPurpose] = useState(() => seed(value, "purpose", ""));
  const [agenda, setAgenda] = useState(() => seed(value, "agenda", ""));
  const [slots, setSlots] = useState(() => seed(value, "slots", [
    { time: "Tue 2026-07-02 · 10:00", agreed: false }, { time: "Wed 2026-07-03 · 14:00", agreed: false }, { time: "Fri 2026-07-05 · 11:00", agreed: false },
  ]));
  const agreed = slots.filter((s) => s.agreed).map((s) => s.time);
  // The slots are given; purpose, agenda and the confirmed time are the mentee's.
  const ready = !!purpose.trim() && !!agenda.trim() && agreed.length > 0;
  useLift({ purpose, agenda, proposedTimes: slots.map((s) => s.time), confirmation: agreed.join(", "), ready }, onChange);
  const toggle = (i: number) => setSlots((ss) => ss.map((s, j) => ({ ...s, agreed: j === i ? !s.agreed : s.agreed })));

  return (
    <div className="space-y-4">
      <GivenNote>Provide purpose, agenda, and time options, then mark the slot the stakeholder confirmed (their reply is pre-scripted below).</GivenNote>
      <div><SectionLabel>Purpose <span className="text-rose-500">*</span></SectionLabel><WTextArea value={purpose} onChange={setPurpose} rows={2} placeholder="What this meeting is for…" hint={`${purpose.length} chars`} /></div>
      <div><SectionLabel>Agenda <span className="text-rose-500">*</span></SectionLabel><WTextArea value={agenda} onChange={setAgenda} rows={5} placeholder={"1. Item (10 min)\n2. Item (15 min)…"} /></div>
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
