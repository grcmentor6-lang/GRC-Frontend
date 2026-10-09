"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { DVerb } from "@/components/ui/dverb";
import { useCachedQuery } from "@/lib/use-query";
import { userKey } from "@/lib/token";
import { learningsApi } from "@/lib/learnings";
import {
  deriveJobs,
  matchMeta,
  JOB_SOURCES,
  type DerivedJob,
  type JobSource,
  type RespState,
} from "@/lib/jobs";

const SRC_META: Record<JobSource, { icon: IconName; cls: string }> = {
  LinkedIn: { icon: "linkedin", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  "We Work Remotely": { icon: "briefcase", cls: "bg-amber-50 text-amber-800 ring-amber-100" },
  "Remote.co": { icon: "link", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  Indeed: { icon: "search", cls: "bg-violet-50 text-violet-700 ring-violet-100" },
};
const AVA: Record<string, string> = {
  indigo: "from-indigo-400 to-violet-500",
  violet: "from-violet-400 to-indigo-500",
  emerald: "from-emerald-400 to-teal-500",
  amber: "from-amber-400 to-orange-500",
  rose: "from-rose-400 to-pink-500",
};
const RESP: Record<RespState, { icon: IconName; cls: string; sw: number; tag: string; tagcls: string }> = {
  matched: { icon: "check", cls: "bg-emerald-50 text-emerald-600 ring-emerald-100", sw: 3, tag: "Matched", tagcls: "text-emerald-600" },
  partial: { icon: "play", cls: "bg-indigo-50 text-indigo-600 ring-indigo-100", sw: 1.8, tag: "Developing", tagcls: "text-indigo-600" },
  gap: { icon: "plus", cls: "bg-slate-50 text-slate-300 ring-slate-200", sw: 2, tag: "Growth area", tagcls: "text-slate-500" },
};
const STD_STATE: Record<RespState, string> = {
  matched: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  partial: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  gap: "bg-slate-50 text-slate-500 ring-slate-200",
};

// ---- saved jobs (local, per-browser; backend persistence is a later phase) ----
// Modelled as an external store so SSR + hydration stay consistent and we never
// setState synchronously inside an effect.
// Scoped per account: without the suffix the next person signing in on this browser inherits
// the previous one's saved jobs.
const savedKey = () => `grcmentor:saved-jobs:${userKey()}`;
const EMPTY_SAVED: ReadonlySet<string> = new Set();
const savedListeners = new Set<() => void>();
let savedCache: ReadonlySet<string> = EMPTY_SAVED;
let savedCacheJson: string | null = null;
let savedCacheKey: string | null = null;

function readSavedSnapshot(): ReadonlySet<string> {
  const key = savedKey();
  let raw = "";
  try {
    raw = localStorage.getItem(key) ?? "";
  } catch {
    raw = "";
  }
  // Re-parse only when the underlying string changes, so the snapshot reference is stable.
  if (raw !== savedCacheJson || key !== savedCacheKey) {
    savedCacheJson = raw;
    savedCacheKey = key;
    try {
      savedCache = raw ? new Set(JSON.parse(raw) as string[]) : EMPTY_SAVED;
    } catch {
      savedCache = EMPTY_SAVED;
    }
  }
  return savedCache;
}

function subscribeSaved(cb: () => void) {
  savedListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === savedKey()) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    savedListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function toggleSavedJob(id: string) {
  const next = new Set(readSavedSnapshot());
  if (next.has(id)) next.delete(id);
  else next.add(id);
  try {
    localStorage.setItem(savedKey(), JSON.stringify([...next]));
  } catch {
    /* ignore quota/availability errors */
  }
  savedCacheJson = null; // force re-parse on next snapshot
  savedListeners.forEach((cb) => cb());
}

function useSavedJobs() {
  const saved = useSyncExternalStore(subscribeSaved, readSavedSnapshot, () => EMPTY_SAVED);
  return { saved, toggle: toggleSavedJob };
}

// ---- match ring ----
function MatchRing({ pct, size = 58 }: { pct: number; size?: number }) {
  const m = matchMeta(pct);
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F7" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={m.ring}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[14px] font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">{pct}</span>
      </div>
    </div>
  );
}

// ---- summary KPIs ----
function JobsSummary({ jobs }: { jobs: DerivedJob[] }) {
  const strong = jobs.filter((j) => j.match >= 80).length;
  const avg = jobs.length ? Math.round(jobs.reduce((n, j) => n + j.match, 0) / jobs.length) : 0;
  const sources = new Set(jobs.map((j) => j.source)).size;
  const items: { icon: IconName; tone: string; value: number | string; label: string }[] = [
    { icon: "briefcase", tone: "indigo", value: jobs.length, label: "Matched roles" },
    { icon: "star", tone: "emerald", value: strong, label: "Strong matches" },
    { icon: "target", tone: "violet", value: avg + "%", label: "Avg match" },
    { icon: "grid", tone: "amber", value: sources, label: "Platforms" },
  ];
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((s) => (
        <Card key={s.label} className="flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${tones[s.tone]}`}>
            <Icon name={s.icon} size={17} />
          </div>
          <div>
            <div className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900 leading-none tabular-nums">{s.value}</div>
            <div className="text-[11.5px] text-slate-500 tracking-tight mt-1">{s.label}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SourceChip({ source }: { source: JobSource }) {
  const m = SRC_META[source];
  return (
    <span className={`inline-flex items-center gap-1 h-[20px] px-1.5 rounded-md text-[10.5px] font-medium tracking-tight ring-1 ${m.cls}`}>
      <Icon name={m.icon} size={11} /> {source}
    </span>
  );
}

// ---- job card ----
function JobCard({ job, saved, onToggleSave }: { job: DerivedJob; saved: boolean; onToggleSave: () => void }) {
  const [open, setOpen] = useState(false);
  const m = matchMeta(job.match);
  const matchedCount = job.derivedResponsibilities.filter((r) => r.state !== "gap").length;
  return (
    <Card pad={false} className="transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AVA[job.tone]} flex items-center justify-center text-white text-[15px] font-semibold shrink-0`}>
            {job.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15.5px] font-semibold tracking-tight text-slate-900">{job.title}</h3>
              <SourceChip source={job.source} />
            </div>
            <div className="text-[12.5px] text-slate-600 tracking-tight mt-0.5">{job.company}</div>
            <div className="flex items-center gap-2 mt-1.5 text-[11.5px] text-slate-500 tracking-tight flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Icon name="user" size={11} /> {job.location}
              </span>
              <span className="text-slate-300">·</span>
              <span>{job.type}</span>
              <span className="text-slate-300">·</span>
              <span>{job.level}</span>
              <span className="text-slate-300">·</span>
              <span className="font-medium text-slate-600">{job.salary}</span>
            </div>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <MatchRing pct={job.match} />
            <span className={`text-[10.5px] font-medium mt-1 ${m.txt}`}>{m.label}</span>
          </div>
        </div>

        {/* function match + standards */}
        <div className="mt-4 flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-600 tracking-tight bg-slate-50 ring-1 ring-slate-200 rounded-lg px-2.5 h-7">
            <Icon name="layers" size={12} className="text-slate-400" />
            <span className="font-medium text-slate-700">{job.jobFunction}</span>
            <Icon name="arrowRight" size={11} className="text-slate-300" />
            <span className="font-mono text-[10.5px] text-indigo-600">{job.project.code}</span>
          </span>
          {job.derivedStandards.map((s) => (
            <span
              key={s.label}
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-lg text-[11px] font-medium tracking-tight ring-1 ${STD_STATE[s.state]}`}
            >
              {s.state === "matched" && <Icon name="check" size={10} strokeWidth={3} />}
              {s.label}
            </span>
          ))}
        </div>

        {/* actions */}
        <div className="mt-4 flex items-center gap-2">
          <a
            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-600 text-white text-[12.5px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]"
          >
            Apply <Icon name="arrowUpRight" size={13} />
          </a>
          <button
            onClick={onToggleSave}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg ring-1 text-[12.5px] font-medium tracking-tight transition-colors ${saved ? "bg-amber-50 ring-amber-200 text-amber-700" : "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <Icon name="star" size={13} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12.5px] font-medium tracking-tight text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {open ? "Hide match" : "Why you match"}
            <Icon name="chevronDown" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 -mt-1">
          <div className="rounded-xl bg-slate-50/60 ring-1 ring-slate-200 p-4">
            <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-200">
              <span className="w-8 h-8 rounded-lg bg-white ring-1 ring-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Icon name="layers" size={15} />
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] tracking-tight text-slate-700">
                  <span className="font-semibold text-slate-900">{job.jobFunction}</span> maps to your method work
                </div>
                <div className="text-[11.5px] text-slate-500 tracking-tight">
                  <span className="font-mono text-[10.5px] text-indigo-600">{job.project.code}</span> · {job.project.title}
                </div>
              </div>
            </div>
            <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2.5">
              Responsibilities matched to your work
            </div>
            <div className="space-y-2.5">
              {job.derivedResponsibilities.map((r, i) => {
                const rs = RESP[r.state];
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-1 shrink-0 ${rs.cls}`}>
                      <Icon name={rs.icon} size={11} strokeWidth={rs.sw} fill={rs.icon === "play" ? "currentColor" : "none"} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-slate-700 tracking-tight">{r.duty}</div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {r.verb && <DVerb verbId={r.verb} />}
                        <span className="font-mono text-[10px] text-slate-500">{r.task}</span>
                        <span className={`text-[10.5px] font-medium ${rs.tagcls}`}>· {rs.tag}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-[11.5px] text-slate-500">
              <Icon name="info" size={13} className="text-slate-400" />
              {matchedCount} of {job.derivedResponsibilities.length} responsibilities backed by work you&apos;ve executed.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function JobsPage() {
  const { data: learnings, loading } = useCachedQuery("learnings:grc101", () => learningsApi.get("grc101"));
  const { saved, toggle } = useSavedJobs();

  const [q, setQ] = useState("");
  const [source, setSource] = useState<(typeof JOB_SOURCES)[number]>("All sources");
  const [sort, setSort] = useState<"match" | "recent" | "saved">("match");

  const allJobs = useMemo(() => deriveJobs(learnings ?? null), [learnings]);

  const jobs = useMemo(() => {
    let list = allJobs.filter((j) => {
      const srcOk = source === "All sources" || j.source === source;
      const s = q.toLowerCase();
      const qOk =
        !q ||
        [j.title, j.company, j.jobFunction, j.location, ...j.responsibilities.map((r) => r.duty)]
          .join(" ")
          .toLowerCase()
          .includes(s);
      return srcOk && qOk;
    });
    if (sort === "match") list = [...list].sort((a, b) => b.match - a.match);
    else if (sort === "saved") list = [...list].filter((j) => saved.has(j.id)).sort((a, b) => b.match - a.match);
    return list;
  }, [allJobs, q, source, sort, saved]);

  return (
    <div className="page-shell space-y-4">
      <div className="flex items-start gap-3.5">
        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(79,70,229,0.6)] shrink-0">
          <Icon name="briefcase" size={20} />
        </span>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Matching jobs</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-2xl" style={{ textWrap: "pretty" }}>
            Roles from LinkedIn and remote-work platforms, matched to the projects, tasks and activities you&apos;ve executed in
            GRC 101. Matches rise as you complete more tasks.
          </p>
        </div>
      </div>

      {loading && !learnings ? (
        <SkeletonCardGrid cards={6} />
      ) : (
        <>
          <JobsSummary jobs={allJobs} />

          {/* filter / sort bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200 flex-1 min-w-[200px]">
              <Icon name="search" size={15} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search titles, companies, duties…"
                className="flex-1 bg-transparent outline-none text-[12.5px] text-slate-700 placeholder:text-slate-400"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-700">
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as (typeof JOB_SOURCES)[number])}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-white ring-1 ring-slate-200 text-[12.5px] text-slate-700 outline-none cursor-pointer"
              >
                {JOB_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100/80 ring-1 ring-slate-200">
              {(
                [
                  ["match", "Best match"],
                  ["saved", "Saved"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`px-2.5 h-7 rounded-md text-[11.5px] font-medium tracking-tight transition-all ${sort === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {label}
                  {k === "saved" && saved.size > 0 && <span className="ml-1 text-slate-500 tabular-nums">{saved.size}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* listing: two columns once a card has room for its chips and match ring */}
          <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
            {jobs.length === 0 ? (
              <Card className="text-center py-12 xl:col-span-2">
                <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <Icon name={sort === "saved" ? "star" : "search"} size={20} />
                </div>
                <div className="text-[13px] font-medium text-slate-700">
                  {sort === "saved" ? "No saved roles yet" : "No matching roles"}
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5">
                  {sort === "saved" ? "Star a role to keep it here." : "Try a different search or source."}
                </div>
              </Card>
            ) : (
              jobs.map((j) => <JobCard key={j.id} job={j} saved={saved.has(j.id)} onToggleSave={() => toggle(j.id)} />)
            )}
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-2 pb-4">
            grcmentor · matches refresh as you complete more tasks · {allJobs.length} roles tracked
          </div>
        </>
      )}
    </div>
  );
}
