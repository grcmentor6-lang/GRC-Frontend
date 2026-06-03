"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { Bar } from "@/components/ui/primitives";
import { catalog, type Program } from "@/lib/catalog";
import { learningsApi, type Learnings, type LearningOrg, type LearningTask } from "@/lib/learnings";
import { ApiError } from "@/lib/api";
import { LRN_AVATAR, LRN_CHIP } from "@/lib/tones";

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  "not-started": { label: "Not started", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
  pending: { label: "Not started", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
  "in-progress": { label: "In progress", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  active: { label: "Active placement", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  complete: { label: "Complete", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  upcoming: { label: "Upcoming", cls: "bg-amber-50 text-amber-700 ring-amber-100" },
  locked: { label: "Locked", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
};
const chip = (s: string) => STATUS_CHIP[s] ?? STATUS_CHIP["not-started"];

function stepIcon(status?: string): { name: IconName; cls: string; sw: number } {
  if (status === "complete") return { name: "check", cls: "bg-emerald-50 text-emerald-600 ring-emerald-100", sw: 3 };
  if (status === "in-progress") return { name: "play", cls: "bg-indigo-50 text-indigo-600 ring-indigo-100", sw: 1.8 };
  return { name: "minus", cls: "bg-slate-50 text-slate-300 ring-slate-200/60", sw: 2 };
}

function LrnTask({ task, defaultOpen }: { task: LearningTask; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const locked = task.status === "locked";
  const active = task.status === "in-progress";
  const pct = task.total ? Math.round((task.done / task.total) * 100) : 0;
  const hasSteps = task.steps.length > 0 && !locked;
  return (
    <div className={`rounded-xl ring-1 transition-all ${active ? "bg-indigo-50/30 ring-indigo-200/70" : "bg-white ring-slate-200/70"}`}>
      <button
        onClick={() => hasSteps && setOpen((o) => !o)}
        className={`w-full text-left p-3.5 flex items-center gap-3 ${hasSteps ? "cursor-pointer" : "cursor-default"}`}
      >
        <span className={`shrink-0 inline-flex items-center justify-center px-1.5 h-5 rounded-md text-[10.5px] font-mono font-medium ${active ? "bg-indigo-600 text-white" : locked ? "bg-slate-200 text-slate-400" : "bg-slate-200 text-slate-600"}`}>
          {task.code}
        </span>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium tracking-tight truncate ${locked ? "text-slate-400" : "text-slate-900"}`}>{task.title}</div>
          <div className="text-[11px] text-slate-400 tracking-tight">{task.standards}</div>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${chip(task.status).cls}`}>{chip(task.status).label}</span>
        {!locked && (
          <div className="hidden sm:flex items-center gap-2 w-[140px] shrink-0">
            <Bar pct={pct || 2} tone={active ? "indigo" : "slate"} className="flex-1" />
            <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{task.done}/{task.total}</span>
          </div>
        )}
        {hasSteps ? (
          <Icon name="chevronDown" size={15} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        ) : (
          <Icon name={locked ? "history" : "minus"} size={15} className="text-slate-300 shrink-0" />
        )}
      </button>

      {open && hasSteps && (
        <div className="px-3.5 pb-3.5 pt-1">
          <div className="rounded-lg bg-slate-50/70 ring-1 ring-slate-200/50 divide-y divide-slate-200/50">
            {task.steps.map((s) => {
              const si = stepIcon(s.status);
              return (
                <Link key={s.id} href={`/app/desk/${s.id}`} className="flex items-center gap-2.5 px-3 py-2 no-underline hover:bg-white/70 transition-colors group">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ring-1 shrink-0 ${si.cls}`}>
                    <Icon name={si.name} size={11} strokeWidth={si.sw} fill={si.name === "play" ? "currentColor" : "none"} />
                  </span>
                  <span className="font-mono text-[10.5px] text-slate-400 shrink-0 w-7">{s.code}</span>
                  <DVerb verbId={s.verb} />
                  <span className={`text-[12px] tracking-tight truncate flex-1 ${s.status === "in-progress" ? "text-slate-700" : "text-slate-600"}`}>{s.title}</span>
                  <Icon name="arrowRight" size={13} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
                </Link>
              );
            })}
            {task.total > task.steps.length && (
              <div className="px-3 py-2 text-[11px] text-slate-400 tracking-tight">+ {task.total - task.steps.length} more steps unlock as you progress</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LrnOrg({ org }: { org: LearningOrg }) {
  const locked = org.status === "locked";
  return (
    <Card>
      <div className="flex items-start gap-3.5">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${LRN_AVATAR[org.tone] ?? LRN_AVATAR.indigo} flex items-center justify-center text-white text-[15px] font-semibold shrink-0 ${locked ? "opacity-50 grayscale" : ""}`}>
          {org.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{org.name}</h3>
            <span className={`inline-flex items-center gap-1.5 h-[20px] px-2 rounded-md text-[10.5px] font-medium tracking-tight ring-1 ${LRN_CHIP[org.tone] ?? LRN_CHIP.indigo}`}>
              <Icon name="briefcase" size={11} /> {org.industry}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${chip(org.status).cls}`}>{chip(org.status).label}</span>
          </div>
          <p className="text-[12px] text-slate-500 tracking-tight mt-1 leading-relaxed" style={{ textWrap: "pretty" }}>{org.context}</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {org.projects.map((proj) => {
          const done = proj.tasks.filter((t) => t.status === "complete").length;
          return (
            <div key={proj.id}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white text-[10.5px] font-mono font-semibold shrink-0">{proj.code}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight text-slate-900">{proj.title}</div>
                  <div className="text-[10.5px] text-slate-400 tracking-tight">{proj.standards}</div>
                </div>
                <span className="ml-auto text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{done}/{proj.tasks.length} tasks</span>
              </div>
              <div className="space-y-2">
                {proj.tasks.map((t) => (
                  <LrnTask key={t.id} task={t} defaultOpen={t.status === "in-progress"} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function LrnSummary({ learnings }: { learnings: Learnings }) {
  const orgs = learnings.orgs;
  const industries = new Set(orgs.map((o) => o.industry)).size;
  const projects = orgs.reduce((n, o) => n + o.projects.length, 0);
  const tasks = orgs.reduce((n, o) => n + o.projects.reduce((m, p) => m + p.tasks.length, 0), 0);
  const items: { icon: IconName; tone: string; value: number; label: string }[] = [
    { icon: "briefcase", tone: "indigo", value: industries, label: "Industries" },
    { icon: "grid", tone: "violet", value: orgs.length, label: "Organisations" },
    { icon: "layers", tone: "emerald", value: projects, label: "Projects" },
    { icon: "checkSquare", tone: "amber", value: tasks, label: "Tasks" },
  ];
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((s) => (
        <Card key={s.label} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${tones[s.tone]}`}>
            <Icon name={s.icon} size={17} />
          </div>
          <div>
            <div className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900 leading-none">{s.value}</div>
            <div className="text-[11.5px] text-slate-500 tracking-tight mt-1">{s.label}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProgramTabs({ programs, value, onChange }: { programs: Program[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 ring-1 ring-slate-200/60 w-fit">
      {programs.map((p) => {
        const sel = p.id === value;
        const locked = p.status === "locked";
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium tracking-tight transition-all ${sel ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70" : "text-slate-500 hover:text-slate-700"}`}
          >
            {locked && <Icon name="history" size={13} className={sel ? "text-slate-400" : "text-slate-300"} />}
            {p.code}
          </button>
        );
      })}
    </div>
  );
}

export default function LearningsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("grc101");
  const [learnings, setLearnings] = useState<Learnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalog.programs().then((p) => setPrograms(p.sort((a, b) => a.order - b.order))).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    learningsApi
      .get(programId)
      .then((l) => {
        if (!cancelled) setLearnings(l);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Couldn't load learnings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programId]);

  const program = programs.find((p) => p.id === programId);
  const locked = learnings?.status === "locked" || program?.status === "locked";

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">My Learnings</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-xl" style={{ textWrap: "pretty" }}>
            Your projects and tasks, organised by the organisation and industry you practise in — across each program track.
          </p>
        </div>
        {programs.length > 0 && <ProgramTabs programs={programs} value={programId} onChange={setProgramId} />}
      </div>

      {program && (
        <div className="flex items-center gap-3 text-[12.5px] text-slate-500 tracking-tight">
          <span className="inline-flex items-center justify-center px-2 h-6 rounded-md bg-indigo-600 text-white text-[11px] font-mono font-semibold">{program.code}</span>
          <span className="font-medium text-slate-700">{program.title}</span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="hidden sm:inline">{program.blurb}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <Card className="text-center py-12">
          <div className="w-11 h-11 mx-auto rounded-xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center text-rose-500 mb-3"><Icon name="info" size={20} /></div>
          <div className="text-[13px] font-medium text-slate-700">{error}</div>
        </Card>
      ) : learnings ? (
        <>
          {locked ? (
            <div className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-400 shrink-0">
                <Icon name="history" size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold tracking-tight text-slate-900">{program?.code} is locked</div>
                <div className="text-[12px] text-slate-500 tracking-tight">Preview the engagements you&apos;ll unlock below.</div>
              </div>
            </div>
          ) : (
            <LrnSummary learnings={learnings} />
          )}

          <div className="space-y-4">
            {learnings.orgs.map((org) => (
              <LrnOrg key={org.id} org={org} />
            ))}
          </div>
        </>
      ) : null}

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">
        grcmentor · learnings update automatically as you complete tasks
      </div>
    </div>
  );
}
