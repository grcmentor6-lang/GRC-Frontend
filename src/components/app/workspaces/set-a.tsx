"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  type WorkspaceProps, useLift, seed, SectionLabel, WTextInput, WTextArea,
  GivenNote, RefBox, ScriptedExchange, SOFT, DOT, CLASS_TONE, type Tone,
} from "./kit";

const CLASS = ["Public", "Internal", "Confidential"];

/* ============================ REQUEST ============================ */
export function RequestWorkspace({ value, onChange }: WorkspaceProps) {
  const [to, setTo] = useState(() => seed(value, "to", "Legal Counsel"));
  const [subject, setSubject] = useState(() => seed(value, "subject", "Request: regulated jurisdictions for EU operations"));
  const [purpose, setPurpose] = useState(() => seed(value, "purpose", "To complete the interested-parties register I need your authoritative list of jurisdictions where we hold regulatory obligations."));
  const [items, setItems] = useState<string[]>(() => seed(value, "items", [
    "Confirmed list of countries with active operations and the regulator per country",
    "Any new regulations expected to take effect within 12 months",
    "Status of existing data-residency commitments to enterprise customers",
  ]));
  const [deadline, setDeadline] = useState(() => seed(value, "deadline", "2026-07-03"));

  useLift({ to, subject, purpose, items, deadline }, onChange);
  const subjectOk = subject.length > 0 && subject.length <= 80;
  const itemsN = items.filter((i) => i.trim()).length;

  return (
    <div className="space-y-5">
      <GivenNote>The recipient and reference documents are pre-set for this engagement. Write a specific, well-scoped request — a vague ask gets ignored.</GivenNote>

      <div>
        <SectionLabel>To · stakeholder (named role)</SectionLabel>
        <WTextInput value={to} onChange={setTo} placeholder="e.g. IT Operations Lead" />
      </div>

      <div>
        <SectionLabel hint={`${subject.length} / 80`}>Subject</SectionLabel>
        <div className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-white ring-1 ${subjectOk ? "ring-slate-200/80 focus-within:ring-2 focus-within:ring-indigo-500/30" : "ring-rose-300"}`}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 bg-transparent outline-none text-[13px] text-slate-900" />
          <span className={`text-[11px] tabular-nums ${subject.length > 80 ? "text-rose-600 font-medium" : "text-slate-400"}`}>{80 - subject.length}</span>
        </div>
      </div>

      <div>
        <SectionLabel>Purpose</SectionLabel>
        <WTextArea value={purpose} onChange={setPurpose} rows={3} hint={`${purpose.length} chars`} />
      </div>

      <div>
        <SectionLabel hint={`${itemsN} of min 3`} action={
          <button onClick={() => setItems([...items, ""])} className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"><Icon name="plus" size={12} />Add item</button>
        }>Requested items</SectionLabel>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-6 h-9 flex items-center justify-center text-[11.5px] font-mono text-slate-400">{i + 1}.</span>
              <input value={it} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
                className="flex-1 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[13px] text-slate-900" />
              {items.length > 3 && (
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"><Icon name="x" size={14} /></button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[220px]">
        <SectionLabel>Proposed deadline</SectionLabel>
        <WTextInput type="date" value={deadline} onChange={setDeadline} />
      </div>

      <ScriptedExchange title="Stakeholder response (pre-scripted)" turns={[
        { who: "you", initials: "AS", text: subject || "(your request subject)" },
        { who: "stakeholder", initials: "LC", text: "Happy to help. Active EU presence in DE, FR, IE, NL. We also process payments in CH but don't store data there. Schrems II remains live — I'll send the latest TIA template separately. DSA Article 28 obligations land for us in Q3." },
      ]} />
    </div>
  );
}

/* ============================ CONDUCT ============================ */
export function ConductWorkspace({ value, onChange }: WorkspaceProps) {
  const script = [
    { q: "Walk me through how new vendors are added to the procurement list.", a: "We use the Vendor Intake form in ServiceNow. Procurement triages within 2 days; Security gets a copy if the vendor processes data." },
    { q: "Who approves vendors classified as 'data processor'?", a: "Depends on data class. Internal: VP Procurement. Confidential / personal data: DPO + Security Eng. Lead." },
    { q: "How often is the vendor inventory reviewed?", a: "Quarterly by Procurement. Security re-attests the security-relevant fields annually." },
    { q: "What happens when a vendor's certifications lapse?", a: "Honestly the workflow isn't great — we get an alert from the cert-tracker, but follow-through is inconsistent." },
    { q: "How is sub-processor disclosure handled?", a: "Contractually required, but we don't have a routine cadence to re-check the published list." },
  ];
  const stakeholder = "Compliance Lead";
  const [findings, setFindings] = useState(() => seed(value, "findings", ""));
  useLift({ stakeholder, questionsAnswered: `${script.length} / ${script.length}`, findings }, onChange);

  return (
    <div className="space-y-5">
      <GivenNote>The structured walkthrough with the <strong>{stakeholder}</strong> has been run — the transcript below is pre-scripted. Read it, then capture your key findings.</GivenNote>

      <div>
        <SectionLabel hint={`${script.length} / ${script.length} answered`}>Walkthrough transcript · {stakeholder}</SectionLabel>
        <div className="rounded-2xl ring-1 ring-slate-200/70 bg-white divide-y divide-slate-100">
          {script.map((s, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-semibold mt-0.5"><Icon name="check" size={11} strokeWidth={3} /></span>
                <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{s.q}</div>
              </div>
              <p className="mt-1.5 ml-7.5 pl-0 text-[12.5px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{s.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel hint={`${findings.length} chars`}>Key findings <span className="text-rose-500">*</span></SectionLabel>
        <WTextArea value={findings} onChange={setFindings} rows={4} placeholder="Summarise the most important findings, the biggest gap, and a recommended follow-up." />
      </div>
    </div>
  );
}

/* ============================ RECORD ============================ */
type RegRow = { name: string; type: string; owner: string; c: string; i: string; a: string; loc: string; rationale: string };
export function RecordWorkspace({ value, onChange }: WorkspaceProps) {
  const [rows, setRows] = useState<RegRow[]>(() => seed(value, "register", [
    { name: "orders-db (RDS)", type: "Database", owner: "Data Platform Lead", c: "High", i: "High", a: "High", loc: "AWS us-east-1", rationale: "Primary order PII + payment refs." },
    { name: "Production K8s", type: "Infra", owner: "Head of Platform", c: "High", i: "High", a: "High", loc: "AWS us-east-1", rationale: "Runs all customer-facing services." },
    { name: "Snowflake warehouse", type: "Data store", owner: "", c: "Confidential", i: "Medium", a: "Medium", loc: "AWS us-west-2", rationale: "" },
    { name: "Stripe Connect", type: "Third party", owner: "Security Eng. Lead", c: "High", i: "High", a: "High", loc: "External", rationale: "Payment processor." },
  ]));
  useLift({ register: rows }, onChange);
  const set = (ri: number, k: keyof RegRow, v: string) => setRows((rs) => rs.map((r, i) => (i === ri ? { ...r, [k]: v } : r)));
  const needsRationale = (r: RegRow) => r.c === "High" || r.c === "Confidential";
  const owners = ["Data Platform Lead", "Head of Platform", "Security Eng. Lead", "Security Ops", "Compliance Lead"];

  return (
    <div className="space-y-4">
      <GivenNote>The register is pre-populated from intake. Every owner must be a <strong>role</strong> (not a department); High/Confidential assets need a rationale.</GivenNote>
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
                  <select value={r.owner} onChange={(e) => set(ri, "owner", e.target.value)} className={`h-8 px-2 rounded-md text-[12px] outline-none ring-1 ${r.owner ? "ring-slate-200/80 bg-white" : "ring-rose-300 bg-rose-50/40"} focus:ring-2 focus:ring-indigo-500/40`}>
                    <option value="">Required…</option>
                    {owners.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </td>
                {(["c", "i", "a"] as const).map((k) => (
                  <td key={k} className="px-2 py-2.5">
                    <select value={r[k]} onChange={(e) => set(ri, k, e.target.value)} className={`h-8 px-1.5 rounded-md text-[11px] font-medium outline-none ring-1 ring-inset focus:ring-2 focus:ring-indigo-500/40 ${CLASS_TONE[r[k]] ?? "bg-white ring-slate-200/80"}`}>
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
export function ApplyWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [items, setItems] = useState<ApplyItem[]>(() => seed(value, "items", [
    { name: "orders-db (RDS)", contains: "Order PII + email", classification: "Confidential", rationale: "Contains personal data of identifiable customers." },
    { name: "Production K8s", contains: "App workloads", classification: "Internal", rationale: "No data at rest; runs services that process Confidential data." },
    { name: "Marketing CMS", contains: "Public copy", classification: "Public", rationale: "Customer-facing site content only." },
    { name: "Snowflake warehouse", contains: "Derived analytics", classification: "Confidential", rationale: "Lineage includes hashed but joinable user IDs." },
    { name: "Internal R&D sandbox", contains: "Synthetic data", classification: "Internal", rationale: "Production data prohibited per policy." },
  ]));
  const [step, setStep] = useState(0);
  useLift({ items }, onChange);
  const cur = items[step];
  const set = (k: keyof ApplyItem, v: string) => setItems((is) => is.map((it, i) => (i === step ? { ...it, [k]: v } : it)));
  const tone = (c: string): Tone => (c === "Public" ? "emerald" : c === "Internal" ? "amber" : "rose");

  return (
    <div className="space-y-4">
      <GivenNote>Apply the three-tier scheme to each asset. Personal-data items must never be Public. <button onClick={() => openRef("ws-classification-scheme")} className="text-indigo-600 hover:underline font-medium">Open the scheme →</button></GivenNote>
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
              <textarea value={cur.rationale} onChange={(e) => set("rationale", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px] resize-none" />
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
export function CrossRefWorkspace({ value, onChange, openRef }: WorkspaceProps) {
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
  const [decisions, setDecisions] = useState<Record<string, string>>(() => seed(value, "decisions", { a1: "match", a2: "match", a3: "miss", a4: "match", a5: "miss", a6: "miss", b5: "duplicate", b6: "miss" }));
  const [method, setMethod] = useState(() => seed(value, "method", "Joined the IT asset CMDB export with the vendor register on canonical asset name; flagged owner-role and presence differences."));
  const [gapNote, setGapNote] = useState(() => seed(value, "gapNote", "Three CMDB assets are absent from the vendor register (PagerDuty, Marketing CMS, Snowflake). Snowflake appears twice in B (dev listed separately). B uses role names; A still uses departments."));
  const [discrepancyClass, setDiscrepancyClass] = useState(() => seed(value, "discrepancyClass", "Owner-data mismatch"));
  const discrepancies = Object.entries(decisions).filter(([, v]) => v !== "match").map(([id, v]) => ({ item: id, discrepancyClass: v }));
  useLift({ method, gapNote, discrepancyClass, discrepancies }, onChange);

  const setD = (id: string, v: string) => setDecisions((d) => ({ ...d, [id]: v }));
  const opts: { k: string; label: string; tone: Tone }[] = [{ k: "match", label: "Match", tone: "emerald" }, { k: "miss", label: "Miss", tone: "amber" }, { k: "duplicate", label: "Dup", tone: "rose" }];
  const bgFor = (v?: string) => (v === "match" ? "bg-emerald-50/40" : v === "miss" ? "bg-amber-50/40" : v === "duplicate" ? "bg-rose-50/40" : "");

  return (
    <div className="space-y-4">
      <GivenNote>Reconcile the two registers. Tag each row Match / Miss / Dup, then write the method and gap note. <button onClick={() => openRef("ws-cmdb-export")} className="text-indigo-600 hover:underline font-medium">Open sources →</button></GivenNote>
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
          <SectionLabel>Gap note</SectionLabel>
          <WTextArea value={gapNote} onChange={setGapNote} rows={3} hint={`${gapNote.length} chars`} />
        </div>
        <div>
          <SectionLabel>Discrepancy class</SectionLabel>
          <select value={discrepancyClass} onChange={(e) => setDiscrepancyClass(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30">
            {["Owner-data mismatch", "Missing item in B", "Missing item in A", "Duplicate entry", "Schema drift"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div>
        <SectionLabel>Method</SectionLabel>
        <WTextArea value={method} onChange={setMethod} rows={2} hint={`${method.length} chars`} />
      </div>
    </div>
  );
}

/* ============================ IDENTIFY ============================ */
type FlagRow = { id: number; asset: string; type: string; source: string; flagged: boolean; action: string; owner: string };
export function IdentifyWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [rows, setRows] = useState<FlagRow[]>(() => seed(value, "rows", [
    { id: 1, asset: "Production K8s cluster (us-east-1)", type: "Compute", source: "SOC 2 §III.A", flagged: true, action: "Add to ISMS scope; map to Annex A 8.20–8.23", owner: "Head of Platform" },
    { id: 2, asset: "orders-db (Amazon RDS)", type: "Data store", source: "SOC 2 §III.A", flagged: true, action: "Add to ISMS scope; map to A.5.12 + A.8.10", owner: "Data Platform Lead" },
    { id: 3, asset: "Stripe Connect integration", type: "Third party", source: "SOC 2 §III.B", flagged: true, action: "Add as processor; route to vendor register", owner: "Security Eng. Lead" },
    { id: 4, asset: "Marketing CMS (WordPress)", type: "App", source: "SOC 2 §III.D", flagged: false, action: "", owner: "" },
    { id: 5, asset: "Snowflake analytics warehouse", type: "Data store", source: "SOC 2 §III.A", flagged: true, action: "", owner: "" },
    { id: 6, asset: "PagerDuty (incident tooling)", type: "Third party", source: "SOC 2 §III.B", flagged: true, action: "Map to A.5.24 + A.5.25", owner: "Security Ops" },
  ]));
  const flags = rows.filter((r) => r.flagged).map((r) => ({ item: r.asset, proposedAction: r.action, accountableRole: r.owner }));
  useLift({ flags }, onChange);
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
export function ReviewWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [fb, setFb] = useState(() => seed(value, "priorFeedback", [
    { id: 1, text: "Scope statement needs a line on excluded systems with rationale.", done: true },
    { id: 2, text: "Standards Alignment: cite ISO §4.3 explicitly.", done: true },
    { id: 3, text: "Risk Awareness: address Snowflake personal-data joinability.", done: true },
    { id: 4, text: "Communication: tighten executive summary (currently 240 words).", done: false },
    { id: 5, text: "Specificity: list named systems, not 'production environment'.", done: false },
  ]));
  const [cover, setCover] = useState(() => seed(value, "coverNote", "Tightened scope language for ISO §4.3 alignment. Added explicit exclusions (Marketing CMS, R&D sandbox) with rationale. Snowflake risk paragraph rewritten — joinability now addressed."));
  const [revisionNo, setRevisionNo] = useState(() => seed(value, "revisionNo", "2"));
  const addressed = fb.filter((f) => f.done).length;
  useLift({ coverNote: cover, revisionNo, priorFeedbackAddressed: `${addressed} / ${fb.length}`, priorFeedback: fb }, onChange);
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
export function PresentWorkspace({ value, onChange, openRef }: WorkspaceProps) {
  const [qa, setQa] = useState(() => seed(value, "anticipatedQuestions", [
    { q: "Why this scope and not a phased approach?", a: "ISMS scope must be coherent — phasing risks gaps at boundaries. We sequence by maturity within the agreed scope." },
    { q: "What's our exposure on Snowflake personal-data joinability?", a: "Joinable hashed identifiers are present. We classify Snowflake Confidential and apply the same controls as orders-db." },
    { q: "How does this affect the SOC 2 timeline?", a: "ISMS work runs in parallel; first audit gate is Aug. No SOC 2 impact this quarter." },
  ]));
  const [decision, setDecision] = useState(() => seed(value, "signoffDecision", ""));
  const [decisionDate, setDecisionDate] = useState(() => seed(value, "decisionDate", "2026-07-10"));
  useLift({ deckLink: "ISMS Scope (May 2026).pptx · 8 slides", anticipatedQuestions: qa, signoffDecision: decision, decisionDate }, onChange);
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
