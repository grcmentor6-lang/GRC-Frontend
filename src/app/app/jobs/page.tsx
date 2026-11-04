"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { userKey } from "@/lib/token";
import { useAuth } from "@/components/auth/auth-provider";
import { useProgress } from "@/lib/desk/progress";
import { loadDesk, type Desk } from "@/lib/desk/model";
import { recordCounts } from "@/lib/desk-record";
import { deriveJobs, matchMeta, type DerivedJob, type RespState } from "@/lib/jobs";

const RESP: Record<RespState, { icon: IconName; cls: string; sw: number; tag: string; tagcls: string }> = {
  matched: { icon: "check", cls: "bg-emerald-50 text-emerald-600 ring-emerald-100", sw: 3, tag: "Submitted", tagcls: "text-emerald-600" },
  partial: { icon: "play", cls: "bg-indigo-50 text-indigo-600 ring-indigo-100", sw: 1.8, tag: "In progress", tagcls: "text-indigo-600" },
  gap: { icon: "plus", cls: "bg-slate-50 text-slate-300 ring-slate-200", sw: 2, tag: "Not started", tagcls: "text-slate-500" },
};

// ---- saved roles (local, per-browser; backend persistence is a later phase) ----
// Modelled as an external store so SSR + hydration stay consistent and we never
// setState synchronously inside an effect.
// Scoped per account: without the suffix the next person signing in on this browser inherits
// the previous one's saved roles.
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
function JobsSummary({ jobs, submitted, totalTasks }: { jobs: DerivedJob[]; submitted: number; totalTasks: number }) {
  const items: { icon: IconName; tone: string; value: string; label: string }[] = [
    { icon: "checkSquare", tone: "indigo", value: `${submitted} / ${totalTasks}`, label: "Desk tasks submitted" },
    { icon: "briefcase", tone: "emerald", value: `${jobs.filter((j) => j.match > 0).length} / ${jobs.length}`, label: "Roles your work backs" },
    { icon: "star", tone: "amber", value: String(jobs.filter((j) => j.match >= 80).length), label: "Strong matches (80+)" },
  ];
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((s) => (
        <Card key={s.label} className="flex items-center gap-3">
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

const search = (site: "linkedin" | "indeed", title: string) =>
  site === "linkedin"
    ? `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}`
    : `https://www.indeed.com/jobs?q=${encodeURIComponent(title)}`;

// ---- role card ----
function JobCard({ job, desk, saved, onToggleSave }: { job: DerivedJob; desk: Desk; saved: boolean; onToggleSave: () => void }) {
  const [open, setOpen] = useState(false);
  const m = matchMeta(job.match);
  const backed = job.derivedResponsibilities.filter((r) => r.state === "matched").length;
  return (
    <Card pad={false}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <Icon name="briefcase" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15.5px] font-semibold tracking-tight text-slate-900">{job.title}</h3>
            <div className="text-[12.5px] text-slate-600 tracking-tight mt-0.5">
              {job.jobFunction} · {job.level}
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 tracking-tight">Posts often ask for</span>
              {job.standards.map((s) => (
                <span key={s} className="inline-flex items-center h-6 px-2 rounded-md text-[11px] font-medium tracking-tight ring-1 bg-slate-50 text-slate-600 ring-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <MatchRing pct={job.match} />
            <span className={`text-[10.5px] font-medium mt-1 ${m.txt}`}>{m.label}</span>
          </div>
        </div>

        {/* actions */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <a
            href={search("linkedin", job.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-600 text-white text-[12.5px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors"
          >
            Find openings on LinkedIn <Icon name="arrowUpRight" size={13} />
          </a>
          <a
            href={search("indeed", job.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200 text-slate-600 text-[12.5px] font-medium tracking-tight no-underline hover:bg-slate-50 transition-colors"
          >
            Indeed <Icon name="arrowUpRight" size={13} />
          </a>
          <button
            onClick={onToggleSave}
            title="Saved on this browser only"
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg ring-1 text-[12.5px] font-medium tracking-tight transition-colors ${saved ? "bg-amber-50 ring-amber-200 text-amber-700" : "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <Icon name="star" size={13} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12.5px] font-medium tracking-tight text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {open ? "Hide match" : "Why this match"}
            <Icon name="chevronDown" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 -mt-1">
          <div className="rounded-xl bg-slate-50/60 ring-1 ring-slate-200 p-4">
            <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2.5">Typical duties, and the desk task that practises each</div>
            <div className="space-y-2.5">
              {job.derivedResponsibilities.map((r, i) => {
                const rs = RESP[r.state];
                const t = desk.tasks[r.task];
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-1 shrink-0 ${rs.cls}`}>
                      <Icon name={rs.icon} size={11} strokeWidth={rs.sw} fill={rs.icon === "play" ? "currentColor" : "none"} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-slate-700 tracking-tight">{r.duty}</div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[11px]">
                        <Link href={`/app/desk#${r.task}`} className="font-mono text-[10.5px] text-indigo-600 hover:underline">{r.task}</Link>
                        {t && <span className="text-slate-500 truncate">{t.title}</span>}
                        <span className={`font-medium ${rs.tagcls}`}>· {rs.tag}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-[11.5px] text-slate-500">
              <Icon name="info" size={13} className="text-slate-400" />
              {backed} of {job.derivedResponsibilities.length} duties backed by a task you have submitted.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const { progress, status } = useProgress(user?.email ?? "");
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    loadDesk().then(setDesk, () => {});
  }, []);
  const { saved, toggle } = useSavedJobs();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"match" | "saved">("match");

  const allJobs = useMemo(() => deriveJobs(progress), [progress]);
  const c = desk ? recordCounts(desk, progress) : null;
  const totalTasks = c?.tasks ?? 0;
  const submitted = c?.tasksSubmitted ?? 0;

  const jobs = useMemo(() => {
    const s = q.toLowerCase();
    let list = allJobs.filter(
      (j) => !q || [j.title, j.jobFunction, ...j.responsibilities.map((r) => r.duty)].join(" ").toLowerCase().includes(s),
    );
    if (sort === "saved") list = list.filter((j) => saved.has(j.id));
    return [...list].sort((a, b) => b.match - a.match);
  }, [allJobs, q, sort, saved]);

  return (
    <div className="page-shell space-y-4">
      <div className="flex items-start gap-3.5">
        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(79,70,229,0.6)] shrink-0">
          <Icon name="briefcase" size={20} />
        </span>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Matching jobs</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-2xl" style={{ textWrap: "pretty" }}>
            Common entry-level GRC roles, with the duties their job posts usually list, matched to the Working Desk tasks you have submitted.
            These are role profiles, not vacancies: use the links on each to search live openings.
          </p>
        </div>
      </div>

      {status !== "ready" || !desk ? (
        status === "failed" ? (
          <Card className="text-center py-12 text-[13px] text-slate-500">Couldn&apos;t load your desk work. Please try again.</Card>
        ) : (
          <SkeletonCardGrid cards={6} />
        )
      ) : (
        <>
          <JobsSummary jobs={allJobs} submitted={submitted} totalTasks={totalTasks} />

          {submitted === 0 && (
            <p className="flex items-start gap-2 rounded-xl bg-indigo-50/50 ring-1 ring-indigo-100 px-4 py-3 text-[12.5px] text-slate-600">
              <Icon name="info" size={15} className="mt-0.5 shrink-0 text-indigo-500" />
              <span>
                Nothing submitted yet, so every match starts at 0. Open <strong className="text-slate-800">Why this match</strong> on a role to see which desk
                tasks back its duties; each one you submit moves the match.{" "}
                <Link href="/app/desk" className="font-medium text-indigo-600 hover:underline">Open the Working Desk</Link>
              </span>
            </p>
          )}

          {/* filter / sort bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200 flex-1 min-w-[200px]">
              <Icon name="search" size={15} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search roles and duties…"
                className="flex-1 bg-transparent outline-none text-[12.5px] text-slate-700 placeholder:text-slate-400"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-700">
                  <Icon name="x" size={14} />
                </button>
              )}
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
                <div className="text-[13px] font-medium text-slate-700">{sort === "saved" ? "No saved roles yet" : "No matching roles"}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">
                  {sort === "saved" ? "Star a role to keep it here. Saved roles stay on this browser only." : "Try a different search."}
                </div>
              </Card>
            ) : (
              jobs.map((j) => <JobCard key={j.id} job={j} desk={desk} saved={saved.has(j.id)} onToggleSave={() => toggle(j.id)} />)
            )}
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-2 pb-4">
            grcmentor · {allJobs.length} role profiles · matches move as you submit desk tasks · saved roles are kept on this browser only
          </div>
        </>
      )}
    </div>
  );
}
