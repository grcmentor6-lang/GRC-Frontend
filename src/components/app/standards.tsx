import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { DVerb } from "@/components/ui/dverb";
import { VERB_TONES } from "@/lib/tones";
import { TASK_META } from "@/lib/taskmeta";
import type { LearningTask } from "@/lib/learnings";
import {
  type StandardMeta, STANDARD_BY_ID, tasksForStandard, standardForTaskCode, nistCrossRefTaskCodes,
} from "@/lib/standards";

// Static tone maps (Tailwind v4 purges dynamic `bg-${tone}` classes).
const SOLID: Record<string, string> = {
  indigo: "bg-indigo-600", violet: "bg-violet-600", emerald: "bg-emerald-600", amber: "bg-amber-500", rose: "bg-rose-600",
};
const HERO: Record<string, string> = {
  indigo: "from-indigo-50/70", violet: "from-violet-50/70", emerald: "from-emerald-50/70", amber: "from-amber-50/70", rose: "from-rose-50/70",
};
const HERO_RING: Record<string, string> = {
  indigo: "ring-indigo-100/70", violet: "ring-violet-100/70", emerald: "ring-emerald-100/70", amber: "ring-amber-100/70", rose: "ring-rose-100/70",
};
const tone = (t: string) => VERB_TONES[t] ?? VERB_TONES.indigo;

const stepDot = (status?: string) =>
  status === "complete"
    ? <span className="w-4 h-4 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center"><Icon name="check" size={10} strokeWidth={3} className="text-white" /></span>
    : status === "current" || status === "in-progress"
      ? <span className="w-4 h-4 shrink-0 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-indigo-500" /></span>
      : <span className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-200" />;

/** Index card — one per standard, linking to its overview. */
export function StandardCard({ standard, taskByCode }: { standard: StandardMeta; taskByCode: Map<string, LearningTask> }) {
  const t = tone(standard.tone);
  const codes = tasksForStandard(standard.id);
  const tasks = codes.map((c) => taskByCode.get(c)).filter(Boolean) as LearningTask[];
  const done = tasks.reduce((a, x) => a + x.done, 0);
  const total = tasks.reduce((a, x) => a + x.total, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <Link href={`/app/standards/${standard.id}`} className="group block rounded-2xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)] transition-all overflow-hidden no-underline">
      <div className={`px-5 pt-5 pb-4 bg-gradient-to-br ${HERO[standard.tone]} via-white to-white`}>
        <div className="flex items-start gap-3">
          <span className={`shrink-0 w-11 h-11 rounded-xl ${SOLID[standard.tone]} text-white flex flex-col items-center justify-center leading-none`}>
            <span className="text-[11px] font-mono font-semibold tracking-[0.04em]">{standard.short}</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono tracking-tight ${t.bg} ${t.text} ring-1 ${t.ring}`}>{standard.code}</span>
              {standard.crossCutting && <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-[0.06em] ${t.bg} ${t.text}`}>cross-cut</span>}
            </div>
            <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-slate-900 truncate">{standard.fullName}</h3>
            <div className={`text-[11.5px] font-medium tracking-tight ${t.text}`}>{standard.domain}</div>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-[12.5px] leading-relaxed text-slate-600 tracking-tight line-clamp-2" style={{ textWrap: "pretty" }}>{standard.description}</p>
        <div className="mt-3.5 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${SOLID[standard.tone]}`} style={{ width: `${pct}%` }} /></div>
          <span className="text-[10.5px] font-mono text-slate-500 shrink-0">{codes.length} task{codes.length === 1 ? "" : "s"} · {pct}%</span>
          <Icon name="arrowRight" size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/** Compact task card on the standard landing: progress + per-activity list with verb chips. */
export function TaskRowCard({ code, task, standard }: { code: string; task?: LearningTask; standard: StandardMeta }) {
  const meta = TASK_META[code];
  if (!meta) return null;
  const t = tone(standard.tone);
  const done = task?.done ?? 0;
  const total = task?.total ?? task?.steps.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 transition-all overflow-hidden">
      <Link href={`/app/desk/task/${code}`} className="block px-5 py-4 hover:bg-slate-50/40 transition-colors no-underline">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-medium tracking-tight ${t.bg} ${t.text} ring-1 ${t.ring}`}>{code}</span>
              <span className="text-[10.5px] font-mono text-slate-400">{meta.duration}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10.5px] font-mono text-slate-500">{total} activit{total === 1 ? "y" : "ies"}</span>
            </div>
            <h3 className="mt-1.5 text-[16px] font-semibold tracking-[-0.015em] text-slate-900">{meta.name}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600 tracking-tight line-clamp-2" style={{ textWrap: "pretty" }}>{meta.description}</p>
          </div>
          <div className="shrink-0 w-40 flex flex-col items-end gap-2">
            <div className="text-[10.5px] font-mono text-slate-500">{done}/{total} · {pct}%</div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${SOLID[standard.tone]}`} style={{ width: `${pct}%` }} /></div>
            {meta.badge && <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-slate-500"><Icon name="ribbon" size={11} /><span className="tracking-tight truncate max-w-[150px]">{meta.badge}</span></div>}
          </div>
        </div>
      </Link>
      {task && task.steps.length > 0 && (
        <div className="px-5 pb-4">
          <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Activities · method applied per step</div>
          <div className="space-y-0.5">
            {task.steps.map((s) => {
              const locked = !s.status || s.status === "locked" || s.status === "pending";
              const inner = (
                <>
                  <span className="shrink-0 text-[10.5px] font-mono text-slate-400 w-7">{s.code}</span>
                  {stepDot(s.status)}
                  <span className={`flex-1 min-w-0 text-[12.5px] tracking-tight truncate ${locked ? "text-slate-400" : "text-slate-700 group-hover:text-slate-900"}`}>{s.title}</span>
                  <DVerb verbId={s.verb} />
                  {locked && <Icon name="lock" size={10} className="text-slate-300 shrink-0" />}
                </>
              );
              return locked ? (
                <div key={s.id} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg opacity-70 cursor-not-allowed">{inner}</div>
              ) : (
                <Link key={s.id} href={`/app/desk/${s.id}`} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 group no-underline">{inner}</Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** The standard overview page body. */
export function StandardLanding({ standard, taskByCode }: { standard: StandardMeta; taskByCode: Map<string, LearningTask> }) {
  const t = tone(standard.tone);
  const codes = tasksForStandard(standard.id);
  const tasks = codes.map((c) => taskByCode.get(c)).filter(Boolean) as LearningTask[];
  const activities = tasks.reduce((a, x) => a + (x.total || x.steps.length), 0);
  const methods = new Set<string>();
  tasks.forEach((x) => x.steps.forEach((s) => methods.add(s.verb)));
  const crossCodes = standard.crossCutting ? nistCrossRefTaskCodes() : [];

  const stats = [
    { label: "Tasks owned", value: codes.length || "—", hint: "Live in GRC 101" },
    { label: "Activities", value: activities || "—", hint: "Across all tasks" },
    { label: "Cross-refs", value: crossCodes.length || (standard.crossCutting ? "—" : "0"), hint: standard.crossCutting ? "Cross-cutting tasks" : "None" },
    { label: "Methods used", value: methods.size || "—", hint: "Action verbs" },
  ];

  return (
    <div className="max-w-[920px] mx-auto px-6 py-6">
      <Link href="/app/standards" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 no-underline mb-3"><Icon name="chevronLeft" size={14} /> All standards</Link>

      {/* Hero */}
      <div className={`rounded-3xl ring-1 ring-slate-200/70 overflow-hidden bg-gradient-to-br ${HERO[standard.tone]} via-white to-white`}>
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-start gap-5">
            <div className={`shrink-0 w-16 h-16 rounded-2xl ${SOLID[standard.tone]} text-white flex flex-col items-center justify-center leading-none ring-4 ${HERO_RING[standard.tone]}`}>
              <span className="text-[14px] font-mono font-semibold tracking-[0.04em]">{standard.short}</span>
              <span className="text-[8px] font-mono opacity-75 mt-1">STANDARD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-tight">
                <span className={`px-1.5 py-0.5 rounded font-mono tracking-tight ${t.bg} ${t.text} ring-1 ${t.ring}`}>{standard.code}</span>
                {standard.crossCutting && <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-[0.06em] ${t.bg} ${t.text}`}>cross-cutting</span>}
              </div>
              <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.025em] text-slate-900 leading-tight">{standard.fullName}</h1>
              <div className={`mt-1 text-[14px] font-medium tracking-tight ${t.text}`}>{standard.domain}</div>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}>{standard.description}</p>
              <p className={`mt-2 text-[12.5px] italic tracking-tight ${t.text}`}>{standard.tagline}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((m) => (
              <div key={m.label} className="rounded-xl bg-white ring-1 ring-slate-200/70 px-4 py-3">
                <div className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-slate-500">{m.label}</div>
                <div className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-slate-900 leading-none">{m.value}</div>
                <div className="mt-1.5 text-[10.5px] font-mono text-slate-400">{m.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks owned */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Tasks owned by this standard</h2>
          <span className="text-[11px] font-mono text-slate-400">{codes.length} · click to open the playbook</span>
        </div>
        {codes.length === 0 ? (
          <div className="rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/60 px-6 py-10 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white ring-1 ring-slate-200/70 mb-3"><Icon name="info" size={18} className="text-slate-400" /></div>
            <div className="text-[14px] font-semibold tracking-tight text-slate-900">No live tasks in this module yet</div>
            <p className="mt-1 text-[12.5px] text-slate-500 tracking-tight">Tasks for this standard unlock later in the programme.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((c) => <TaskRowCard key={c} code={c} task={taskByCode.get(c)} standard={standard} />)}
          </div>
        )}
      </div>

      {/* Cross-references (NIST) */}
      {crossCodes.length > 0 && (
        <div className="mt-7">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">Where this standard appears as a cross-reference</h2>
            <span className="text-[11px] font-mono text-slate-400">{crossCodes.length} task(s)</span>
          </div>
          <div className="space-y-2">
            {crossCodes.map((c) => {
              const owner = standardForTaskCode(c);
              const ot = owner ? tone(owner.tone) : t;
              return (
                <Link key={c} href={`/app/desk/task/${c}`} className="w-full flex items-center gap-3 rounded-xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 px-4 py-3 text-left transition-all no-underline">
                  <span className={`shrink-0 w-7 h-7 rounded-lg ${SOLID[owner?.tone ?? standard.tone]} text-white flex items-center justify-center text-[9.5px] font-mono font-semibold`}>{owner?.short}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-900 tracking-tight truncate">{TASK_META[c]?.name}</div>
                    <div className="text-[10.5px] font-mono text-slate-500 truncate">{TASK_META[c]?.nistCrossRef}</div>
                  </div>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono ${ot.bg} ${ot.text} ring-1 ${ot.ring}`}>{owner?.code}</span>
                  <Icon name="arrowRight" size={13} className="text-slate-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** The standard banner that rides above the activity workspace. */
export function StandardBanner({ taskCode }: { taskCode: string }) {
  const standard = standardForTaskCode(taskCode);
  if (!standard) return null;
  const t = tone(standard.tone);
  const nistRef = TASK_META[taskCode]?.nistCrossRef?.trim();
  const alsoNist = standard.id !== "nistcsf" && !!nistRef ? STANDARD_BY_ID["nistcsf"] : null;

  return (
    <div className="mb-4 rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.02),0_2px_8px_-2px_rgba(15,23,42,0.04)]">
      <div className="flex items-stretch">
        <div className={`w-1.5 ${SOLID[standard.tone]}`} />
        <div className="flex-1 flex items-center gap-4 px-4 py-3 flex-wrap">
          <Link href={`/app/standards/${standard.id}`} className="flex items-center gap-3 min-w-0 no-underline group">
            <span className={`shrink-0 w-10 h-10 rounded-xl ${SOLID[standard.tone]} text-white flex flex-col items-center justify-center leading-none`}>
              <span className="text-[10px] font-mono font-semibold tracking-[0.06em]">{standard.short}</span>
              <span className="text-[8px] font-mono opacity-70 mt-0.5">STD</span>
            </span>
            <span className="min-w-0">
              <span className={`block text-[9.5px] font-semibold tracking-[0.14em] uppercase ${t.text}`}>Standard / Framework</span>
              <span className="block text-[14px] font-semibold tracking-[-0.01em] text-slate-900 truncate group-hover:text-indigo-700">{standard.fullName}</span>
            </span>
          </Link>
          <div className="hidden md:block h-9 w-px bg-slate-200/80" />
          <div className="hidden md:block min-w-0">
            <span className="block text-[9.5px] font-semibold tracking-[0.14em] uppercase text-slate-500">Domain</span>
            <span className="block text-[13px] font-medium tracking-tight text-slate-800 truncate">{standard.domain}</span>
          </div>
          {alsoNist && (
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-[9.5px] font-semibold tracking-[0.14em] uppercase text-slate-400">Also applies</span>
              <Link href={`/app/standards/${alsoNist.id}`} className={`inline-flex items-center gap-1 h-6 px-2 rounded-md ${tone(alsoNist.tone).bg} ${tone(alsoNist.tone).text} ring-1 ${tone(alsoNist.tone).ring} text-[10.5px] font-medium no-underline hover:opacity-80`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tone(alsoNist.tone).dot}`} />{alsoNist.code}
              </Link>
            </div>
          )}
          <Link href={`/app/standards/${standard.id}`} className={`ml-auto shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-medium tracking-tight ${t.text} hover:${t.bg} transition-colors no-underline`}>
            Standard overview <Icon name="arrowUpRight" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
