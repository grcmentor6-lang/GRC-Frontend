"use client";

// My Learnings v2 — GRC mastery + a 16-domain / 35-task coverage explorer, each task pairing its
// technical control with why it matters. All data is real: the live /me/learnings tree (status +
// progress) and /me/progress (overall + rubric scores) joined by task code to TASK_META (the fixed
// task catalogue: method category, standard, badge, description, deliverable, NIST cross-ref) and
// the CONTROLS_BY_TASK register. No hardcoded task data.

import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/primitives";
import { useCachedQuery } from "@/lib/use-query";
import { learningsApi, type TaskStatus } from "@/lib/learnings";
import { buildTaskIndex } from "@/lib/standards";
import { TASK_META, METHOD_CATEGORY_ORDER } from "@/lib/taskmeta";
import { CONTROLS_BY_TASK } from "@/lib/controls";
import { ApiError } from "@/lib/api";

const PROGRAM = "grc101";

type Tone = "indigo" | "violet" | "emerald" | "amber" | "rose";
const LRN_TONE: Record<Tone, { soft: string; text: string; ring: string; bar: string; grad: string }> = {
  indigo:  { soft: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-200/70", bar: "bg-indigo-500",  grad: "from-indigo-500 to-violet-600" },
  violet:  { soft: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-200/70", bar: "bg-violet-500",  grad: "from-violet-500 to-fuchsia-600" },
  emerald: { soft: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200/70", bar: "bg-emerald-500", grad: "from-emerald-500 to-teal-600" },
  amber:   { soft: "bg-amber-50",   text: "text-amber-800",   ring: "ring-amber-200/70",  bar: "bg-amber-500",   grad: "from-amber-500 to-orange-600" },
  rose:    { soft: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200/70",   bar: "bg-rose-500",    grad: "from-rose-500 to-pink-600" },
};
const asTone = (s?: string): Tone => (s && s in LRN_TONE ? (s as Tone) : "indigo");

// Presentation-only icon/tone per method category (the data itself comes from TASK_META). Keyed by
// the exact METHOD_CATEGORY_ORDER strings so it never drifts from the real catalogue.
const DOMAIN_META: Record<string, { icon: IconName; tone: Tone }> = {
  "Assessment and Analysis":                    { icon: "target",        tone: "violet"  },
  "Governance and Risk Management":             { icon: "shield",        tone: "indigo"  },
  "Compliance and Regulatory Management":       { icon: "checkSquare",   tone: "emerald" },
  "Design and Development":                     { icon: "edit",          tone: "amber"   },
  "Strategic Planning and Architecture":        { icon: "layers",        tone: "indigo"  },
  "Implementation and Execution":               { icon: "bolt",          tone: "violet"  },
  "Testing and Validation":                     { icon: "checkCircle",   tone: "emerald" },
  "Monitoring and Management":                  { icon: "gauge",         tone: "indigo"  },
  "Communication and Advisory":                 { icon: "chat",          tone: "amber"   },
  "Response and Recovery":                      { icon: "alertTriangle", tone: "rose"    },
  "Business Continuity and Resilience Planning":{ icon: "refresh",       tone: "emerald" },
  "Third-Party Risk Management":                { icon: "handshake",     tone: "amber"   },
  "Legal and Regulatory Coordination":          { icon: "book",          tone: "violet"  },
  "Project Execution":                          { icon: "briefcase",     tone: "indigo"  },
  "Quality Assurance":                          { icon: "star",          tone: "emerald" },
  "Knowledge Transfer":                         { icon: "users",         tone: "amber"   },
};
const domainMeta = (cat: string) => DOMAIN_META[cat] ?? { icon: "layers" as IconName, tone: "indigo" as Tone };

// The four GRC pillars, and which pillar each task builds. This taxonomy is fixed product data
// (from the GRC 101 catalogue — its 5/14/13/3 task split is the intended mapping); the *scores*
// below are computed live from task completion, never hardcoded.
type PillarId = "risk" | "audit" | "policy" | "tprm";
const PILLAR_META: { id: PillarId; name: string; icon: IconName; tone: Tone }[] = [
  { id: "risk",   name: "Risk Assessment",       icon: "target",      tone: "violet"  },
  { id: "audit",  name: "Auditing & Assurance",  icon: "checkSquare", tone: "indigo"  },
  { id: "policy", name: "Policy Development",     icon: "edit",        tone: "emerald" },
  { id: "tprm",   name: "Third-Party Risk",      icon: "handshake",   tone: "amber"   },
];
const TASK_PILLAR: Record<string, PillarId> = {
  "AA-001": "risk", "AA-002": "audit", "AA-003": "risk",
  "GRM-001": "risk", "GRM-002": "policy", "GRM-003": "audit",
  "CRM-001": "policy", "CRM-002": "audit", "CRM-003": "audit",
  "DD-001": "policy", "DD-002": "policy", "DD-003": "policy",
  "SPA-001": "policy", "SPA-002": "policy",
  "IE-001": "audit", "IE-002": "policy",
  "TV-001": "audit", "TV-002": "audit",
  "MM-001": "audit", "MM-002": "risk",
  "CA-001": "policy", "CA-002": "audit", "CA-003": "policy",
  "RR-001": "audit",
  "BCRP-001": "risk", "BCRP-002": "policy",
  "TPRM-001": "tprm", "TPRM-002": "tprm", "LRC-001": "tprm",
  "PE-001": "policy", "PE-002": "audit",
  "QA-001": "audit", "QA-002": "audit",
  "KT-001": "policy", "KT-002": "audit",
};
const levelFor = (pct: number) => pct >= 75 ? "Advanced" : pct >= 55 ? "Practitioner" : pct >= 35 ? "Developing" : "Foundational";

type PillarStat = { id: PillarId; name: string; icon: IconName; tone: Tone; pct: number; level: string; taskCount: number; graded: number; skills: { label: string; pct: number }[] };

// Roll the joined rows up into the four pillars — every number here is derived from live done/total.
function computePillars(rows: Row[]): PillarStat[] {
  return PILLAR_META.map((p) => {
    const items = rows.filter((r) => TASK_PILLAR[r.code] === p.id);
    const done = items.reduce((n, r) => n + r.done, 0);
    const total = items.reduce((n, r) => n + r.total, 0);
    const cats = new Map<string, { done: number; total: number; count: number }>();
    for (const r of items) {
      const c = cats.get(r.category) ?? { done: 0, total: 0, count: 0 };
      c.done += r.done; c.total += r.total; c.count += 1;
      cats.set(r.category, c);
    }
    const skills = [...cats.entries()]
      .sort((a, b) => b[1].count - a[1].count || b[1].total - a[1].total)
      .slice(0, 3)
      .map(([label, v]) => ({ label, pct: v.total ? Math.round((v.done / v.total) * 100) : 0 }));
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { ...p, pct, level: levelFor(pct), taskCount: items.length, graded: done, skills };
  });
}

// A task joined from the fixed catalogue (TASK_META) with its live status/progress.
type Row = {
  code: string; name: string; category: string;
  standardLabel: string; standardTone: Tone;
  description: string; deliverable: string; badge: string; mentorRole: string;
  nistCrossRef: string; objective?: string;
  status: TaskStatus; done: number; total: number; org?: string;
};

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  "not-started": { label: "Not started", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
  "in-progress": { label: "In progress", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  complete:      { label: "Complete",    cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  locked:        { label: "Locked",      cls: "bg-slate-100 text-slate-400 ring-slate-200/70" },
};
const statusChip = (s: string) => STATUS_CHIP[s] ?? STATUS_CHIP["not-started"];
const isEngaged = (s: TaskStatus) => s === "in-progress" || s === "complete" || s === "active";

// ---------- MASTERY DASHBOARD ----------
function PillarMasteryCard({ p }: { p: PillarStat }) {
  const t = LRN_TONE[p.tone];
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 flex flex-col">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${t.soft} ${t.text} ring-1 ${t.ring} flex items-center justify-center`}>
          <Icon name={p.icon} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold tracking-tight text-slate-900 truncate">{p.name}</div>
          <div className="text-[11px] text-slate-400 tracking-tight">{p.taskCount} tasks map here · {p.graded} graded</div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[30px] font-semibold tabular-nums tracking-[-0.02em] text-slate-900 leading-none">{p.pct}</span>
          <span className="text-[13px] text-slate-400 font-medium">%</span>
        </div>
        <span className={`inline-flex items-center h-6 px-2 rounded-full text-[10.5px] font-semibold ${t.soft} ${t.text} ring-1 ${t.ring}`}>{p.level}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${t.grad}`} style={{ width: `${p.pct}%` }} />
      </div>
      {p.skills.length > 0 && (
        <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-100">
          {p.skills.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11.5px] text-slate-600 tracking-tight truncate pr-2">{s.label}</span>
                <span className="text-[10.5px] font-medium text-slate-400 tabular-nums shrink-0">{s.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${t.bar} opacity-70`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MasteryDashboard({
  overallPct, level, engaged, total, pillars,
}: {
  overallPct: number; level: string; engaged: number; total: number; pillars: PillarStat[];
}) {
  const c = 2 * Math.PI * 52;
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900">GRC pillar mastery</h2>
        <p className="text-[12.5px] text-slate-500 tracking-tight">How your graded work across the {total} tasks compounds into capability in the four core pillars.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-[132px] h-[132px]">
            <svg width="132" height="132" className="-rotate-90">
              <circle cx="66" cy="66" r="52" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="11" />
              <circle cx="66" cy="66" r="52" fill="none" stroke="url(#mg)" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - overallPct / 100)} />
              <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor="#c084fc" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[32px] font-semibold tabular-nums tracking-[-0.02em] leading-none">{overallPct}%</span>
              <span className="text-[10px] text-slate-400 tracking-[0.1em] uppercase mt-1">Overall</span>
            </div>
          </div>
          <div className="mt-4 text-[13.5px] font-semibold tracking-tight">{level}</div>
          <div className="mt-1 text-[11.5px] text-slate-400 tracking-tight">{engaged} of {total} tasks engaged</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((p) => <PillarMasteryCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}

function StdChip({ label, tone, title }: { label: string; tone: Tone; title?: string }) {
  const t = LRN_TONE[tone];
  return <span title={title} className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium tracking-tight ${t.soft} ${t.text} ring-1 ${t.ring}`}>
    <span className={`w-1 h-1 rounded-full ${t.bar}`} />{label}
  </span>;
}

// ---------- DOMAIN RAIL (left nav) ----------
function DomainRailItem({ cat, count, active, onClick }: { cat: string; count: number; active: boolean; onClick: () => void }) {
  const { icon, tone } = domainMeta(cat);
  const t = LRN_TONE[tone];
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-xl p-2.5 ring-1 transition-all flex items-center gap-2.5 ${active ? "bg-white ring-indigo-300 shadow-[0_4px_14px_-6px_rgba(99,102,241,0.3)]" : "bg-white/50 ring-slate-200/60 hover:bg-white hover:ring-slate-300"}`}>
      <div className={`w-8 h-8 rounded-lg ${t.soft} ${t.text} ring-1 ${t.ring} flex items-center justify-center shrink-0`}>
        <Icon name={icon} size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-[12px] font-medium tracking-tight leading-snug ${active ? "text-slate-900" : "text-slate-700"}`}>{cat}</div>
      </div>
      <span className={`shrink-0 inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ${active ? `${t.soft} ${t.text}` : "bg-slate-100 text-slate-500"}`}>{count}</span>
    </button>
  );
}

// ---------- TASK PILL (right-side selector) ----------
function TaskPill({ row, active, onClick }: { row: Row; active: boolean; onClick: () => void }) {
  const dot = row.status === "complete" ? "bg-emerald-500" : row.status === "in-progress" || row.status === "active" ? "bg-indigo-500" : "bg-slate-300";
  return (
    <button onClick={onClick}
      className={`text-left rounded-lg px-3 py-2 ring-1 transition-all ${active ? "bg-white ring-indigo-300 shadow-[0_4px_14px_-6px_rgba(99,102,241,0.3)]" : "bg-white/60 ring-slate-200/60 hover:bg-white hover:ring-slate-300"}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[10px] font-mono text-slate-400">{row.code}</span>
        <span className={`w-1 h-1 rounded-full ${LRN_TONE[row.standardTone].bar}`} />
        <span className={`text-[10px] font-medium ${LRN_TONE[row.standardTone].text}`}>{row.standardLabel}</span>
        <span className={`ml-auto w-1.5 h-1.5 rounded-full ${dot}`} title={statusChip(row.status).label} />
      </div>
      <div className={`text-[12px] font-medium tracking-tight leading-snug ${active ? "text-slate-900" : "text-slate-700"}`}>{row.name}</div>
    </button>
  );
}

// Control-reference chips: the structured register when we have it, else the task's standard + any
// NIST subcategory codes parsed out of its cross-reference string.
function referenceChips(row: Row): { label: string; tone: Tone; title?: string }[] {
  const reg = CONTROLS_BY_TASK[row.code];
  if (reg) return reg.controls.map((c) => ({ label: c.num, tone: asTone(c.tone), title: `${c.standard} · ${c.name}` }));
  const chips: { label: string; tone: Tone; title?: string }[] = [{ label: row.standardLabel, tone: row.standardTone }];
  const codes = [...new Set(row.nistCrossRef.match(/\b[A-Z]{2}\.[A-Z]{2}(?:-\d+)?\b/g) ?? [])];
  for (const code of codes) chips.push({ label: `NIST ${code}`, tone: "violet" });
  return chips;
}

// ---------- CONTROL DETAIL — dual pane ----------
function ControlDetail({ row }: { row: Row }) {
  const { icon, tone } = domainMeta(row.category);
  const t = LRN_TONE[tone];
  const chips = referenceChips(row);
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium ${t.soft} ${t.text} ring-1 ${t.ring}`}>
            <Icon name={icon} size={12} />{row.category}
          </span>
          <span className="font-mono text-[11px] text-slate-400">{row.code}</span>
          {row.org && <span className="text-[11px] text-slate-400 tracking-tight">· {row.org}</span>}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${statusChip(row.status).cls}`}>{statusChip(row.status).label}</span>
        </div>
        <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-slate-900 leading-tight">{row.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1"><Icon name="ribbon" size={12} className="text-slate-400" />{row.badge}</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1"><Icon name="user" size={12} className="text-slate-400" />{row.mentorRole}</span>
          {row.total > 0 && (<><span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums"><Icon name="checkSquare" size={12} className="text-slate-400" />{row.done}/{row.total} steps</span></>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT — technical control */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center"><Icon name="shield" size={12} /></div>
            <span className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Technical control</span>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700 tracking-tight">{row.description}</p>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-2">Control references</div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => <StdChip key={chip.label} label={chip.label} tone={chip.tone} title={chip.title} />)}
            </div>
            {row.nistCrossRef && (
              <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500 tracking-tight">{row.nistCrossRef}</p>
            )}
          </div>
        </div>

        {/* RIGHT — why it matters */}
        <div className="rounded-2xl ring-1 ring-indigo-200/70 p-5 flex flex-col bg-gradient-to-br from-indigo-50 via-violet-50/40 to-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center"><Icon name="target" size={12} /></div>
            <span className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-indigo-700">Why this matters</span>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700 tracking-tight">{row.objective || row.description}</p>
          <div className="mt-4 space-y-2.5">
            <div className="flex items-start gap-3 rounded-xl bg-white/70 ring-1 ring-slate-200/60 p-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 flex items-center justify-center shrink-0"><Icon name="file" size={14} /></div>
              <div>
                <div className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-slate-400">What you produce</div>
                <p className="text-[12.5px] text-slate-700 tracking-tight leading-snug mt-0.5">{row.deliverable}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/70 ring-1 ring-slate-200/60 p-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 flex items-center justify-center shrink-0"><Icon name="ribbon" size={14} /></div>
              <div>
                <div className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-slate-400">Credential earned</div>
                <p className="text-[12.5px] text-slate-700 tracking-tight leading-snug mt-0.5">{row.badge}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- FULL EXPLORER (domain rail left · results right) ----------
function LearningsExplorer({ rows }: { rows: Row[] }) {
  const byCategory = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const cat of METHOD_CATEGORY_ORDER) m.set(cat, []);
    for (const r of rows) (m.get(r.category) ?? m.set(r.category, []).get(r.category)!).push(r);
    return m;
  }, [rows]);
  const categories = METHOD_CATEGORY_ORDER.filter((c) => (byCategory.get(c)?.length ?? 0) > 0);

  const [domain, setDomain] = useState(categories[0] ?? "");
  const [sel, setSel] = useState("");

  const domainTasks = byCategory.get(domain) ?? [];
  const ctrl = domainTasks.find((r) => r.code === sel) ?? domainTasks[0];
  const { icon, tone } = domainMeta(domain);
  const dt = LRN_TONE[tone];

  const selectDomain = (cat: string) => {
    setDomain(cat);
    setSel((byCategory.get(cat) ?? [])[0]?.code ?? "");
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900">GRC 101 coverage · {METHOD_CATEGORY_ORDER.length} domains · {rows.length} tasks</h2>
        <p className="text-[12.5px] text-slate-500 tracking-tight">Pick a method category on the left — its tasks and their control ↔ business justification open on the right.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 items-start">
        {/* LEFT — domain rail */}
        <div className="space-y-1.5 lg:max-h-[760px] lg:overflow-y-auto lg:px-1.5 lg:py-1">
          {categories.map((cat) => (
            <DomainRailItem key={cat} cat={cat} count={(byCategory.get(cat) ?? []).length} active={cat === domain} onClick={() => selectDomain(cat)} />
          ))}
        </div>

        {/* RIGHT — results for the selected domain */}
        <div className="space-y-4">
          {/* domain header + task selector */}
          <div className="rounded-2xl bg-slate-50/50 ring-1 ring-slate-200/60 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-xl ${dt.soft} ${dt.text} ring-1 ${dt.ring} flex items-center justify-center shrink-0`}>
                <Icon name={icon} size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold tracking-tight text-slate-900 leading-tight">{domain}</div>
                <div className="text-[11px] text-slate-400 tracking-tight">{domainTasks.length} {domainTasks.length === 1 ? "task" : "tasks"} in this domain</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
              {domainTasks.map((r) => (
                <TaskPill key={r.code} row={r} active={r.code === ctrl?.code} onClick={() => setSel(r.code)} />
              ))}
            </div>
          </div>

          {/* dual-pane detail */}
          <div className="rounded-3xl bg-white ring-1 ring-slate-200/60 p-5">
            {ctrl && <ControlDetail row={ctrl} />}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LearningsPage() {
  const { data: learnings, loading: lLoad, error: lErr } = useCachedQuery(`learnings:${PROGRAM}`, () => learningsApi.get(PROGRAM));
  const { data: progress, loading: pLoad } = useCachedQuery(`progress:${PROGRAM}`, () => learningsApi.progress(PROGRAM));

  // Join the fixed catalogue (TASK_META) with the live tree by task code — keeping each code's
  // most-progressed placement, with its real org, status and step progress.
  const rows = useMemo<Row[]>(() => {
    const index = buildTaskIndex(learnings);
    // Org of each code's most-progressed placement (buildTaskIndex keeps that task; match on done).
    const orgByCode = new Map<string, string>();
    for (const org of learnings?.orgs ?? []) {
      for (const proj of org.projects) {
        for (const task of proj.tasks) {
          const kept = index.get(task.code);
          if (kept && kept.done === task.done && !orgByCode.has(task.code)) orgByCode.set(task.code, org.name);
        }
      }
    }
    return Object.entries(TASK_META).map(([code, m]) => {
      const live = index.get(code);
      return {
        code, name: m.name, category: m.methodCategory,
        standardLabel: m.standardLabel, standardTone: asTone(m.standardTone),
        description: m.description, deliverable: m.deliverable, badge: m.badge, mentorRole: m.mentorRole,
        nistCrossRef: m.nistCrossRef, objective: m.objective,
        status: live?.status ?? "not-started", done: live?.done ?? 0, total: live?.total ?? 0,
        org: orgByCode.get(code),
      };
    });
  }, [learnings]);

  const pillars = useMemo(() => computePillars(rows), [rows]);
  const total = rows.length;
  const engaged = rows.filter((r) => isEngaged(r.status)).length;
  const overallPct = progress?.overallPct ?? (total ? Math.round((engaged / total) * 100) : 0);
  const level = overallPct >= 75 ? "Advanced Practitioner" : overallPct >= 55 ? "Practitioner" : overallPct >= 35 ? "Developing Practitioner" : "Foundational";

  const loading = (lLoad || pLoad) && !learnings && !progress;
  const error = lErr ? (lErr instanceof ApiError ? lErr.message : "Couldn't load learnings.") : null;

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-6 space-y-7">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900">My Learnings</h1>
            <span className="inline-flex items-center h-6 px-2 rounded-md bg-indigo-600 text-white text-[11px] font-mono font-semibold">GRC 101</span>
          </div>
          <p className="text-[13px] text-slate-500 tracking-tight mt-1 max-w-xl" style={{ textWrap: "pretty" }}>
            What you&apos;ve actually learned — your mastery, and every control paired with the business reason it matters.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCardGrid cards={6} className="grid grid-cols-1 lg:grid-cols-2 gap-4" />
      ) : error ? (
        <Card className="text-center py-12">
          <div className="w-11 h-11 mx-auto rounded-xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center text-rose-500 mb-3"><Icon name="info" size={20} /></div>
          <div className="text-[13px] font-medium text-slate-700">{error}</div>
        </Card>
      ) : (
        <>
          <MasteryDashboard overallPct={overallPct} level={level} engaged={engaged} total={total} pillars={pillars} />
          <LearningsExplorer rows={rows} />
        </>
      )}

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">
        grcmentor · learnings update automatically as you complete tasks
      </div>
    </div>
  );
}
