"use client";

// Task-boundary gate workspaces — shared tab chrome + the Research Submission gate that closes
// every task. (The RUA readiness gate that opens a task lives in ./rua-gate.tsx and reuses the
// chrome exported here.) Both ride the normal activity pipeline: graded fields lift into the
// payload, `objectiveMet` blocks submission until the gate criteria are met.

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { type WorkspaceProps, useLift, seed, SectionLabel, WTextArea, GivenNote } from "./kit";
import { getRuaTask } from "@/lib/rua-tasks";
import { RESEARCH_METHODS, RESEARCH_SOURCE_TYPES, fillMethod } from "@/lib/research-methods";
import { TASK_META } from "@/lib/taskmeta";

const filled = (s: string, min = 20) => s.trim().length >= min;

/* ── shared tab chrome (used by both gates) ── */

export interface TabDef {
  key: string;
  label: string;
  icon: IconName;
  blurb: string;
  done: boolean;
  /** Group heading shown above this tab in the rail (md+ only). */
  group?: string;
}

/** Left tab rail (md+) / horizontal chip row (mobile) + progress header. */
export function TabRail({ tabs, active, onSelect, progressLabel }: {
  tabs: TabDef[]; active: string; onSelect: (k: string) => void; progressLabel: string;
}) {
  const done = tabs.filter((t) => t.done).length;
  return (
    <nav className="md:w-[196px] shrink-0">
      <div className="hidden md:flex items-center gap-2 px-2 mb-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${(done / tabs.length) * 100}%` }} />
        </div>
        <span className="text-[10.5px] text-slate-400 tabular-nums shrink-0">{done}/{tabs.length}</span>
      </div>
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <div key={t.key} className="shrink-0 md:shrink">
            {t.group && (
              <div className="hidden md:block px-2 pt-3 pb-1 first:pt-0 text-[9.5px] font-semibold tracking-[0.12em] uppercase text-slate-400">{t.group}</div>
            )}
            <button onClick={() => onSelect(t.key)} aria-current={active === t.key ? "step" : undefined}
              className={`w-auto md:w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left cursor-pointer focus-ring transition-colors ${
                active === t.key ? "bg-violet-50 ring-1 ring-violet-200 text-violet-800" : "text-slate-600 hover:bg-slate-100/70"}`}>
              <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                t.done ? "bg-emerald-100 text-emerald-600" : active === t.key ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"}`}>
                <Icon name={t.done ? "check" : t.icon} size={13} strokeWidth={t.done ? 3 : 2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-medium tracking-tight whitespace-nowrap md:whitespace-normal">{t.label}</span>
                <span className="hidden md:block text-[10px] text-slate-400 tracking-tight leading-tight">{t.blurb}</span>
              </span>
            </button>
          </div>
        ))}
      </div>
      <div className="md:hidden text-[10.5px] text-slate-400 tabular-nums px-1">{progressLabel}</div>
    </nav>
  );
}

/** Back / Continue footer for the active pane. */
export function PaneNav({ tabs, active, onSelect }: { tabs: TabDef[]; active: string; onSelect: (k: string) => void }) {
  const i = tabs.findIndex((t) => t.key === active);
  const prev = i > 0 ? tabs[i - 1] : null;
  const next = i < tabs.length - 1 ? tabs[i + 1] : null;
  return (
    <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100">
      {prev ? (
        <button onClick={() => onSelect(prev.key)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-100 cursor-pointer focus-ring transition-colors">
          <Icon name="chevronLeft" size={14} /> {prev.label}
        </button>
      ) : <span />}
      {next && (
        <button onClick={() => onSelect(next.key)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-medium bg-violet-600 text-white hover:bg-violet-700 cursor-pointer focus-ring transition-colors shadow-[0_4px_14px_-4px_rgba(124,58,237,0.5)]">
          Continue · {next.label} <Icon name="chevronRight" size={14} />
        </button>
      )}
    </div>
  );
}

/* ================= Research Submission ================= */

type SourceRow = { type: string; ref: string };
type MethodWork = { notes: string; sources: SourceRow[] };

const NOTES_MIN = 40;
const methodDone = (m: MethodWork | undefined) =>
  !!m && m.notes.trim().length >= NOTES_MIN && m.sources.some((s) => s.ref.trim() !== "");

export function ResearchWorkspace({ taskCode, value, onChange }: WorkspaceProps) {
  const rua = getRuaTask(taskCode);
  const meta = taskCode ? TASK_META[taskCode] : undefined;
  const ctx = {
    org: rua?.org ?? "the organisation",
    standard: rua?.standard ?? meta?.standardLabel ?? "the governing standard",
    deliverable: rua?.deliverable ?? meta?.deliverable ?? "the deliverable",
    title: meta?.name ?? "this task",
  };

  const [methods, setMethods] = useState<Record<string, MethodWork>>(() => seed(value, "methods", {}));
  const [summary, setSummary] = useState<string>(() => seed(value, "summary", ""));
  const [tab, setTab] = useState(RESEARCH_METHODS[0].key);

  const doneCount = RESEARCH_METHODS.filter((m) => methodDone(methods[m.key])).length;
  const objectiveMet = doneCount >= RESEARCH_METHODS.length && filled(summary, NOTES_MIN);

  useLift({ methods, summary, objectiveMet }, onChange);

  const patch = (key: string, mut: (m: MethodWork) => MethodWork) =>
    setMethods((prev) => ({ ...prev, [key]: mut(prev[key] ?? { notes: "", sources: [{ type: RESEARCH_SOURCE_TYPES[0], ref: "" }] }) }));

  const tabs: TabDef[] = [
    ...RESEARCH_METHODS.map((m, i) => ({
      key: m.key, label: m.name, icon: m.icon, blurb: m.tag, done: methodDone(methods[m.key]),
      group: i === 0 ? "Research methods" : undefined,
    })),
    { key: "summary", label: "Summary", icon: "edit", blurb: "What the research changed", done: filled(summary, NOTES_MIN), group: "Wrap up" },
  ];
  const method = RESEARCH_METHODS.find((m) => m.key === tab);
  const work = method ? methods[method.key] : undefined;
  const sources = work?.sources ?? [{ type: RESEARCH_SOURCE_TYPES[0], ref: "" }];

  return (
    <div>
      <div className="mb-4">
        <GivenNote>
          The closing gate of this task: evidence the research behind your {ctx.deliverable}. Work all{" "}
          {RESEARCH_METHODS.length} research methods — notes plus at least one cited source each — then
          summarise how the research shaped your deliverable.
        </GivenNote>
      </div>

      <div className="md:flex md:items-start md:gap-5">
        <TabRail tabs={tabs} active={tab} onSelect={setTab} progressLabel={`${doneCount}/${RESEARCH_METHODS.length} methods evidenced`} />

        <div className="min-w-0 flex-1 md:border-l md:border-slate-100 md:pl-5 md:min-h-[300px] md:flex md:flex-col [&>*:first-child]:flex-1">
          {method && (
            <div className="space-y-3.5">
              <SectionLabel hint={method.tag}>{method.name}</SectionLabel>
              <p className="text-[12px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
                {method.definition} <span className="text-slate-700 font-medium">{fillMethod(method.why, ctx)}</span>
              </p>
              <div className="rounded-xl bg-slate-50/70 ring-1 ring-slate-200/60 p-3">
                <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-1.5">Work these prompts into your notes</div>
                <ul className="space-y-1.5">
                  {method.prompts.map((p, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-slate-600 leading-snug tracking-tight">
                      <span className="text-slate-300 shrink-0 select-none">–</span>
                      <span style={{ textWrap: "pretty" }}>{fillMethod(p, ctx)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500 mb-1.5">Findings</div>
                <WTextArea
                  value={work?.notes ?? ""}
                  onChange={(v) => patch(method.key, (mw) => ({ ...mw, notes: v }))}
                  rows={5}
                  placeholder={`Your ${method.name.toLowerCase()} findings for this task…`}
                  hint={`${(work?.notes ?? "").trim().length}/${NOTES_MIN}+ chars`}
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3 mb-0.5">
                  <div className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-slate-500">Sources</div>
                  <button onClick={() => patch(method.key, (mw) => ({ ...mw, sources: [...mw.sources, { type: RESEARCH_SOURCE_TYPES[0], ref: "" }] }))}
                    className="h-7 px-2 rounded-md text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 cursor-pointer focus-ring flex items-center gap-1 shrink-0"><Icon name="plus" size={12} />Add source</button>
                </div>
                <p className="text-[10.5px] text-slate-400 tracking-tight mb-1.5">{method.sourceHint}</p>
                <div className="space-y-1.5">
                  {sources.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={s.type} aria-label="Source type" onChange={(e) => patch(method.key, (mw) => ({ ...mw, sources: mw.sources.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)) }))}
                        className="h-9 w-40 px-2 rounded-lg bg-white ring-1 ring-slate-200/80 text-[11.5px] text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shrink-0">
                        {RESEARCH_SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input value={s.ref} aria-label="Source citation" onChange={(e) => patch(method.key, (mw) => ({ ...mw, sources: mw.sources.map((x, j) => (j === i ? { ...x, ref: e.target.value } : x)) }))}
                        placeholder="Title, clause or link of the source…"
                        className="flex-1 min-w-0 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500/30 outline-none text-[12.5px] placeholder:text-slate-400" />
                      <button onClick={() => patch(method.key, (mw) => ({ ...mw, sources: mw.sources.filter((_, j) => j !== i) }))}
                        disabled={sources.length <= 1} aria-label="Remove source"
                        className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-0 disabled:pointer-events-none cursor-pointer focus-ring flex items-center justify-center shrink-0"><Icon name="x" size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "summary" && (
            <div className="space-y-3.5">
              <SectionLabel hint="what the research changed or confirmed">Research summary</SectionLabel>
              <WTextArea value={summary} onChange={setSummary} rows={4}
                placeholder={`What your research changed or confirmed in the ${ctx.deliverable}…`}
                hint={`${summary.trim().length}/${NOTES_MIN}+ chars`} />
              {objectiveMet ? (
                <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-800 mb-1"><Icon name="check" size={14} strokeWidth={3} /> Research evidenced</div>
                  <p className="text-[12.5px] text-emerald-900/80 leading-relaxed">All three methods worked, sources cited, summary written — submit for the gate decision.</p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 tracking-tight">
                  Outstanding: {tabs.filter((t) => !t.done).map((t) => t.label).join(" · ")}
                </p>
              )}
            </div>
          )}

          <PaneNav tabs={tabs} active={tab} onSelect={setTab} />
        </div>
      </div>
    </div>
  );
}
