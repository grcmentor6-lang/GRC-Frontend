"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card, Bar } from "@/components/ui/primitives";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import type { Desk, Task } from "@/lib/desk/model";
import { stepKey, taskStatus, type Progress, type TaskStatus } from "@/lib/desk/progress";
import { fmtWhen, recordCounts, recordEmpty, useDeskRecord } from "@/lib/desk-record";

/**
 * Reports — the learner's GRC 101 record as a register: each opened task with its organisation, the
 * domains it practises, the ISO/IEC 27001 clauses its steps cite, its deliverables, and where the
 * learner's own work on it stands. Everything comes from the desk catalogue and this account's saved
 * desk work (lib/desk-record), the same source and the same counts as My Submissions.
 */

const STATUS: Record<TaskStatus, { label: string; cls: string }> = {
  submitted: { label: "Submitted", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  started: { label: "In progress", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  todo: { label: "Not started", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

interface Row {
  task: Task; org: string; industry: string; domains: string[]; clauses: string[];
  status: TaskStatus; done: number; total: number; submittedAt: string | null;
}

function toRow(desk: Desk, p: Progress, t: Task): Row {
  const orgs = t.org === "AB" ? [desk.orgs.A, desk.orgs.B] : [desk.orgs[t.org]];
  return {
    task: t,
    org: orgs.map((o) => o.name).join(" · "),
    industry: orgs.map((o) => o.industry).join(" · "),
    domains: t.meta.domains,
    clauses: Array.from(new Set(t.steps.flatMap((s) => s.refs.clauses))),
    status: taskStatus(p, t),
    done: t.steps.filter((s) => p.done[stepKey(t.id, s.n)]).length,
    total: t.steps.length,
    submittedAt: p.submitted[t.id] ?? null,
  };
}

function Kpis({ desk, p }: { desk: Desk; p: Progress }) {
  const c = recordCounts(desk, p);
  const items: { icon: Parameters<typeof Icon>[0]["name"]; value: string; label: string }[] = [
    { icon: "checkSquare", value: `${c.tasksSubmitted} / ${c.tasks}`, label: "Tasks submitted" },
    { icon: "list", value: `${c.stepsDone} / ${c.steps}`, label: "Steps done" },
    { icon: "layers", value: `${c.decisionsDone} / ${c.decisions}`, label: "Decisions made" },
    { icon: "chart", value: `${c.steps ? Math.round((c.stepsDone / c.steps) * 100) : 0}%`, label: "Of GRC 101 done" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((s) => (
        <Card key={s.label} pad={false}>
          <div className="flex items-center gap-3 p-3.5 w-full">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center ring-1 shrink-0 bg-indigo-50 text-indigo-600 ring-indigo-100"><Icon name={s.icon} size={16} /></div>
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

const TH = "px-3 py-2.5";
const HEAD = "bg-slate-50/80 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-500";

function ReportTask({ row, desk, p, defaultOpen }: { row: Row; desk: Desk; p: Progress; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [view, setView] = useState<"steps" | "deliverables" | "clauses">("steps");
  const t = row.task;
  const pct = row.total ? Math.round((row.done / row.total) * 100) : 0;
  const st = STATUS[row.status];
  const tabs = [["steps", `Steps · ${row.total}`], ["deliverables", `Deliverables · ${t.subs.length}`], ["clauses", `ISO clauses · ${row.clauses.length}`]] as const;
  return (
    <Card pad={false}>
      <button onClick={() => setOpen((o) => !o)} className="focus-ring w-full text-left p-4 flex items-center gap-3 rounded-2xl">
        <span className="shrink-0 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11.5px] font-semibold text-white">{t.id}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold tracking-tight text-slate-900">{t.title}</div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 tracking-tight flex-wrap">
            <span>Week {t.week}</span>
            <span className="text-slate-300">·</span><span className="inline-flex items-center gap-1"><Icon name="briefcase" size={11} /> {row.org}</span>
            {row.domains.length > 0 && <><span className="text-slate-300">·</span><span>{row.domains.join(" · ")}</span></>}
            {row.submittedAt && <><span className="text-slate-300">·</span><span>Submitted {fmtWhen(row.submittedAt)}</span></>}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 w-[150px] shrink-0">
          <Bar pct={pct} tone={row.status === "todo" ? "slate" : "indigo"} className="flex-1" />
          <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{row.done}/{row.total}</span>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${st.cls}`}>{st.label}</span>
        <Icon name="chevronDown" size={16} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1 space-y-3">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100/80 ring-1 ring-slate-200 w-fit">
            {tabs.map(([k, label]) => (
              <button key={k} onClick={() => setView(k)} className={`px-3 h-7 rounded-md text-[11.5px] font-medium tracking-tight transition-all ${view === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{label}</button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
            {view === "steps" ? (
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead><tr className={HEAD}><th className={`${TH} w-12`}>Step</th><th className={TH}>Activity</th><th className={`${TH} w-28`}>Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {t.steps.map((s) => {
                    const done = !!p.done[stepKey(t.id, s.n)];
                    return (
                      <tr key={s.n}>
                        <td className={TH}><span className="font-mono text-[11px] text-slate-500">{s.n}</span></td>
                        <td className={`${TH} text-[12px] text-slate-700 tracking-tight`}>{s.t}{s.kind !== "do" && <span className="ml-1.5 text-[10.5px] font-medium text-slate-400">decision</span>}</td>
                        <td className={TH}><span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${done ? "text-emerald-600" : "text-slate-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-emerald-500" : "bg-slate-300"}`} />{done ? "Done" : "Open"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : view === "deliverables" ? (
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead><tr className={HEAD}><th className={`${TH} w-28`}>Code</th><th className={TH}>Deliverable</th><th className={TH}>Format</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {t.subs.map((d) => (
                    <tr key={d.code}>
                      <td className={TH}><span className="font-mono text-[11px] text-slate-700">{d.code}</span></td>
                      <td className={`${TH} text-[12px] text-slate-900`}>{d.name}</td>
                      <td className={`${TH} text-[12px] text-slate-500`}>{d.fmt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : row.clauses.length ? (
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead><tr className={HEAD}><th className={`${TH} w-24`}>Clause</th><th className={TH}>Title <span className="font-normal normal-case text-slate-400">(ISO/IEC 27001:2022 clause title)</span></th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {row.clauses.map((c) => (
                    <tr key={c}>
                      <td className={TH}><span className="font-mono text-[11px] text-slate-700">{c}</span></td>
                      <td className={`${TH} text-[12px] text-slate-900`}>{desk.iso[c] ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-3 py-3 text-[12px] text-slate-500">This task&apos;s steps cite no ISO/IEC 27001 clause.</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  const { state, desk, progress, weeks, retry } = useDeskRecord();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All domains");

  const open = useMemo(() => new Set(weeks.map((w) => w.n)), [weeks]);
  const allRows = useMemo(
    () => (desk ? desk.order.map((id) => desk.tasks[id]).filter((t) => open.has(t.week)).map((t) => toRow(desk, progress, t)) : []),
    [desk, progress, open],
  );
  const domains = useMemo(() => ["All domains", ...Array.from(new Set(allRows.flatMap((r) => r.domains)))], [allRows]);
  const rows = useMemo(() => allRows.filter((r) => {
    if (domain !== "All domains" && !r.domains.includes(domain)) return false;
    if (!q) return true;
    const hay = [r.task.id, r.task.title, r.org, r.industry, ...r.domains, ...r.clauses, ...r.task.subs.flatMap((d) => [d.code, d.name]), ...r.task.steps.map((s) => s.t)].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  }), [allRows, q, domain]);

  const exportCsv = () => {
    const head = ["Task", "Title", "Week", "Organisation", "Industry", "Domains", "ISO/IEC 27001 clauses cited", "Deliverables", "Status", "Steps done", "Steps", "Submitted at"];
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [head.map(esc).join(",")];
    rows.forEach((r) => lines.push([r.task.id, r.task.title, r.task.week, r.org, r.industry, r.domains.join("; "), r.clauses.join("; "), r.task.subs.map((d) => d.code).join("; "), STATUS[r.status].label, r.done, r.total, r.submittedAt ?? ""].map(esc).join(",")));
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = "grcmentor-report-grc101.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell space-y-4">
      <div className="flex items-start gap-3.5">
        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0">
          <Icon name="chart" size={20} />
        </span>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Reports</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-2xl" style={{ textWrap: "pretty" }}>
            Your GRC 101 record as a register: every task open to you, the organisation and domains it covers, the ISO/IEC 27001 clauses it cites, its deliverables, and how far your own work on the Working Desk has got.
          </p>
        </div>
      </div>

      {state === "loading" || !desk ? (
        <SkeletonCardGrid cards={4} />
      ) : state === "failed" ? (
        <Card className="text-center py-12">
          <div className="text-[13px] font-medium text-slate-700">Your record did not load. Your work is safe on the server.</div>
          <button type="button" onClick={retry} className="mt-3 rounded bg-slate-900 px-3 py-1.5 text-[12.5px] font-medium text-white">Try again</button>
        </Card>
      ) : (
        <>
          <Kpis desk={desk} p={progress} />
          {recordEmpty(progress) && (
            <Card className="text-[13px] text-slate-600">
              Nothing on your record yet. These numbers move as you complete steps and submit tasks on the{" "}
              <Link href="/app/desk" className="font-medium text-indigo-700">Working Desk</Link>.
            </Card>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200 flex-1 min-w-[200px]">
              <Icon name="search" size={15} className="text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, steps, deliverables, clauses…" className="flex-1 bg-transparent outline-none text-[12.5px] text-slate-700 placeholder:text-slate-400" />
              {q && <button onClick={() => setQ("")} aria-label="Clear search" className="text-slate-400 hover:text-slate-700"><Icon name="x" size={14} /></button>}
            </div>
            <div className="relative">
              <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Domain" className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-white ring-1 ring-slate-200 text-[12.5px] text-slate-700 outline-none cursor-pointer">
                {domains.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevronDown" size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200 text-slate-600 text-[12.5px] font-medium tracking-tight hover:bg-slate-50"><Icon name="download" size={14} /> Print</button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium tracking-tight hover:bg-indigo-700"><Icon name="table" size={14} /> Export CSV</button>
          </div>

          <div className="space-y-3">
            {rows.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-[13px] font-medium text-slate-700">No results</div>
                <div className="text-[12px] text-slate-500 mt-0.5">Try a different search or domain.</div>
              </Card>
            ) : rows.map((r) => (
              <ReportTask key={r.task.id} row={r} desk={desk} p={progress} defaultOpen={r.status === "started" || q !== "" || domain !== "All domains"} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
