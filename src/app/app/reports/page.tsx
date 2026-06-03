"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Card, Bar } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { catalog, type Program } from "@/lib/catalog";
import { learningsApi, type Learnings } from "@/lib/learnings";
import { CONTROLS_BY_TASK, type Control } from "@/lib/controls";
import { ApiError } from "@/lib/api";

interface ReportActivity { step: string; verb: string; activity: string; status?: string }
interface ReportRow {
  code: string; title: string; category: string; industry: string; orgs: string[];
  standards: string[]; status: string; done: number; total: number;
  controls: Control[]; activities: ReportActivity[];
}

const RPT_STD: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100", violet: "bg-violet-50 text-violet-700 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100", amber: "bg-amber-50 text-amber-800 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100", slate: "bg-slate-100 text-slate-600 ring-slate-200/70",
};
const RPT_DOT: Record<string, string> = {
  indigo: "bg-indigo-500", violet: "bg-violet-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", slate: "bg-slate-400",
};
const RPT_STATUS: Record<string, { label: string; cls: string }> = {
  "in-progress": { label: "In progress", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  "not-started": { label: "Not started", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
  complete: { label: "Complete", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  locked: { label: "Locked", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
};
const stat = (s: string) => RPT_STATUS[s] ?? RPT_STATUS["not-started"];

/** Flatten the learnings tree into per-task report rows, enriched with the controls register. */
function toRows(learnings: Learnings): ReportRow[] {
  const rows: ReportRow[] = [];
  for (const org of learnings.orgs) {
    for (const proj of org.projects) {
      for (const t of proj.tasks) {
        const reg = CONTROLS_BY_TASK[t.code];
        const controls = reg?.controls ?? [];
        const standards = Array.from(new Set(controls.map((c) => c.standard)));
        rows.push({
          code: t.code, title: t.title, category: reg?.category ?? proj.title,
          industry: org.industry, orgs: [org.name], standards, status: t.status,
          done: t.done, total: t.total, controls,
          activities: t.steps.map((s) => ({ step: s.code, verb: s.verb, activity: s.title, status: s.status })),
        });
      }
    }
  }
  return rows;
}

function ReportKpis({ rows }: { rows: ReportRow[] }) {
  const controls = rows.reduce((n, r) => n + r.controls.length, 0);
  const activities = rows.reduce((n, r) => n + r.activities.length, 0);
  const standards = new Set(rows.flatMap((r) => r.standards)).size;
  const industries = new Set(rows.map((r) => r.industry)).size;
  const tot = rows.reduce((n, r) => n + r.total, 0);
  const done = rows.reduce((n, r) => n + r.done, 0);
  const completion = tot ? Math.round((done / tot) * 100) : 0;
  const items: { icon: Parameters<typeof Icon>[0]["name"]; tone: string; value: number | string; label: string }[] = [
    { icon: "checkSquare", tone: "indigo", value: rows.length, label: "Tasks" },
    { icon: "list", tone: "violet", value: activities, label: "Activities" },
    { icon: "shield", tone: "emerald", value: controls, label: "Controls" },
    { icon: "layers", tone: "amber", value: standards, label: "Standards" },
    { icon: "briefcase", tone: "rose", value: industries, label: "Industries" },
    { icon: "chart", tone: "indigo", value: completion + "%", label: "Completion" },
  ];
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100", violet: "bg-violet-50 text-violet-600 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100", amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  };
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((s) => (
        <Card key={s.label} pad={false}>
          <div className="flex items-center gap-3 p-3.5 w-full">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 shrink-0 ${tones[s.tone]}`}><Icon name={s.icon} size={16} /></div>
            <div className="min-w-0">
              <div className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900 leading-none tabular-nums">{s.value}</div>
              <div className="text-[11px] text-slate-500 tracking-tight mt-1 truncate">{s.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ControlsTable({ row }: { row: ReportRow }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/70">
      <table className="w-full text-left border-collapse min-w-[760px]">
        <thead>
          <tr className="bg-slate-50/80 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-500">
            <th className="px-3 py-2.5">Standard</th><th className="px-3 py-2.5">Domain</th><th className="px-3 py-2.5">Control #</th><th className="px-3 py-2.5">Control name</th><th className="px-3 py-2.5">Purpose</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {row.controls.map((c, i) => (
            <tr key={i} className="hover:bg-slate-50/50 align-top">
              <td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1.5 h-[20px] px-1.5 rounded-md text-[10.5px] font-medium ring-1 whitespace-nowrap ${RPT_STD[c.tone] ?? RPT_STD.slate}`}><span className={`w-1 h-1 rounded-full ${RPT_DOT[c.tone] ?? RPT_DOT.slate}`} />{c.standard}</span></td>
              <td className="px-3 py-2.5 text-[12px] text-slate-600 tracking-tight whitespace-nowrap">{c.domain}</td>
              <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-slate-700 bg-slate-100 ring-1 ring-slate-200/70 rounded px-1.5 py-0.5 whitespace-nowrap">{c.num}</span></td>
              <td className="px-3 py-2.5 text-[12px] font-medium text-slate-900 tracking-tight">{c.name}</td>
              <td className="px-3 py-2.5 text-[11.5px] text-slate-500 tracking-tight max-w-[280px]" style={{ textWrap: "pretty" }}>{c.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivitiesTable({ row }: { row: ReportRow }) {
  const stepStatus: Record<string, { dot: string; txt: string; label: string }> = {
    complete: { dot: "bg-emerald-500", txt: "text-emerald-600", label: "Complete" },
    "in-progress": { dot: "bg-indigo-500", txt: "text-indigo-600", label: "In progress" },
    pending: { dot: "bg-slate-300", txt: "text-slate-400", label: "Pending" },
  };
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/70">
      <table className="w-full text-left border-collapse min-w-[620px]">
        <thead>
          <tr className="bg-slate-50/80 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-500">
            <th className="px-3 py-2.5 w-12">Step</th><th className="px-3 py-2.5 w-28">Verb</th><th className="px-3 py-2.5">Activity</th><th className="px-3 py-2.5 w-28">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {row.activities.map((a, i) => {
            const st = stepStatus[a.status ?? "pending"] ?? stepStatus.pending;
            return (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-slate-400">{a.step}</span></td>
                <td className="px-3 py-2.5"><DVerb verbId={a.verb} /></td>
                <td className="px-3 py-2.5 text-[12px] text-slate-700 tracking-tight">{a.activity}</td>
                <td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${st.txt}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReportTask({ row, defaultOpen }: { row: ReportRow; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [view, setView] = useState<"controls" | "activities">("controls");
  const pct = row.total ? Math.round((row.done / row.total) * 100) : 0;
  const active = row.status === "in-progress";
  return (
    <Card pad={false}>
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4 flex items-center gap-3">
        <span className={`shrink-0 inline-flex items-center justify-center px-1.5 h-6 rounded-md text-[11px] font-mono font-medium ${active ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>{row.code}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold tracking-tight text-slate-900">{row.title}</span>
            <span className="inline-flex items-center gap-1 h-[19px] px-1.5 rounded-md bg-slate-100 ring-1 ring-slate-200/70 text-[10px] font-medium text-slate-500">{row.category}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 tracking-tight flex-wrap">
            <span className="inline-flex items-center gap-1"><Icon name="briefcase" size={11} /> {row.industry}</span>
            <span className="text-slate-300">·</span><span className="truncate">{row.orgs.join(" · ")}</span>
            <span className="text-slate-300">·</span><span>{row.controls.length} controls · {row.activities.length} activities</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 w-[150px] shrink-0">
          <Bar pct={pct || 2} tone={active ? "indigo" : "slate"} className="flex-1" />
          <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{row.done}/{row.total}</span>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${stat(row.status).cls}`}>{stat(row.status).label}</span>
        <Icon name="chevronDown" size={16} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100/80 ring-1 ring-slate-200/60 w-fit mb-3">
            {([["controls", `Controls · ${row.controls.length}`], ["activities", `Activities · ${row.activities.length}`]] as const).map(([k, label]) => (
              <button key={k} onClick={() => setView(k)} className={`px-3 h-7 rounded-md text-[11.5px] font-medium tracking-tight transition-all ${view === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{label}</button>
            ))}
          </div>
          {view === "controls" ? <ControlsTable row={row} /> : <ActivitiesTable row={row} />}
        </div>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("grc101");
  const [learnings, setLearnings] = useState<Learnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [std, setStd] = useState("All standards");

  useEffect(() => {
    catalog.programs().then((p) => setPrograms(p.sort((a, b) => a.order - b.order))).catch(() => {});
  }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setQ(""); setStd("All standards");
    learningsApi.get(programId)
      .then((l) => !cancelled && setLearnings(l))
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Couldn't load reports."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [programId]);

  const program = programs.find((p) => p.id === programId);
  const allRows = useMemo(() => (learnings ? toRows(learnings) : []), [learnings]);
  const standards = useMemo(() => ["All standards", ...Array.from(new Set(allRows.flatMap((r) => r.standards)))], [allRows]);
  const rows = useMemo(() => allRows.filter((r) => {
    const stdOk = std === "All standards" || r.standards.includes(std);
    if (!stdOk) return false;
    if (!q) return true;
    const hay = [r.code, r.title, r.category, r.industry, ...r.orgs, ...r.controls.flatMap((c) => [c.standard, c.domain, c.num, c.name, c.purpose]), ...r.activities.flatMap((a) => [a.step, a.verb, a.activity])].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  }), [allRows, q, std]);

  const exportCsv = () => {
    const head = ["Program", "Task", "Title", "Category", "Industry", "Organisations", "Standard", "Domain", "Control #", "Control Name", "Purpose", "Status", "Completion"];
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [head.map(esc).join(",")];
    rows.forEach((r) => {
      const pct = r.total ? Math.round((r.done / r.total) * 100) + "%" : "0%";
      (r.controls.length ? r.controls : [null]).forEach((c) => {
        lines.push([program?.code ?? programId, r.code, r.title, r.category, r.industry, r.orgs.join("; "), c?.standard ?? "", c?.domain ?? "", c?.num ?? "", c?.name ?? "", c?.purpose ?? "", stat(r.status).label, pct].map(esc).join(","));
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `grcmentor-report-${(program?.code ?? programId).replace(/\s+/g, "-").toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Reports</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-2xl" style={{ textWrap: "pretty" }}>
            A detailed register of every learning, task and activity — mapped to its industry, standard, domain, control and purpose, with live completion.
          </p>
        </div>
        {programs.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 ring-1 ring-slate-200/60 w-fit">
            {programs.map((p) => {
              const sel = p.id === programId;
              return (
                <button key={p.id} onClick={() => setProgramId(p.id)} className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium tracking-tight transition-all ${sel ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70" : "text-slate-500 hover:text-slate-700"}`}>
                  {p.status === "locked" && <Icon name="history" size={13} className={sel ? "text-slate-400" : "text-slate-300"} />}
                  {p.code}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" /></div>
      ) : error ? (
        <Card className="text-center py-12"><div className="text-[13px] font-medium text-slate-700">{error}</div></Card>
      ) : (
        <>
          <ReportKpis rows={allRows} />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200/70 flex-1 min-w-[200px]">
              <Icon name="search" size={15} className="text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search controls, activities, domains…" className="flex-1 bg-transparent outline-none text-[12.5px] text-slate-700 placeholder:text-slate-400" />
              {q && <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-700"><Icon name="x" size={14} /></button>}
            </div>
            <div className="relative">
              <select value={std} onChange={(e) => setStd(e.target.value)} className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-white ring-1 ring-slate-200/70 text-[12.5px] text-slate-700 outline-none cursor-pointer">
                {standards.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevronDown" size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200/70 text-slate-600 text-[12.5px] font-medium tracking-tight hover:bg-slate-50 transition-colors"><Icon name="download" size={14} /> Print</button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium tracking-tight hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]"><Icon name="table" size={14} /> Export CSV</button>
          </div>

          <div className="space-y-3">
            {rows.length === 0 ? (
              <Card className="text-center py-12">
                <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-400 mb-3"><Icon name="search" size={20} /></div>
                <div className="text-[13px] font-medium text-slate-700">No results</div>
                <div className="text-[12px] text-slate-400 mt-0.5">Try a different search or standard filter.</div>
              </Card>
            ) : rows.map((r) => (
              <ReportTask key={r.code} row={r} defaultOpen={r.status === "in-progress" || q !== "" || std !== "All standards"} />
            ))}
          </div>
        </>
      )}

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · {program?.code ?? programId}</div>
    </div>
  );
}
