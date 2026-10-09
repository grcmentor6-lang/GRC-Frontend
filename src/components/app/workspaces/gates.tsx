"use client";

// Shared tab chrome for the task-boundary gate workspaces — the left tab rail + Back/Continue
// footer used by both the RUA readiness gate (./rua-gate.tsx) and the Research Submission gate
// (./research-gate.tsx).

import { Icon, type IconName } from "@/components/ui/icon";

export interface TabDef {
  key: string;
  label: string;
  icon: IconName;
  blurb: string;
  done: boolean;
  /** Group heading shown above this tab in the rail (md+ only). */
  group?: string;
  /** Not reachable yet — an earlier step is unfinished. Sequential gates set this; the research
   *  gate's method tabs are deliberately pickable in any order and leave it undefined. */
  locked?: boolean;
}

/** Which tab a gate opens on when the mentee hasn't picked one: the first unfinished step — or,
 *  once every step is done, the LAST one. A submitted gate reads back where it ended (the
 *  sign-off, with the decision on it); landing back on step 1 with the work behind it made a
 *  finished gate look like it had been restarted. A resubmit blanks the progress, so the same
 *  rule then lands on step 1 with the rest locked, which is what a fresh attempt should do. */
export const resumeTab = (tabs: TabDef[]): string =>
  (tabs.find((t) => !t.done) ?? tabs[tabs.length - 1]).key;

/** Left tab rail (md+) / horizontal chip row (mobile) + progress header. */
export function TabRail({ tabs, active, onSelect, progressLabel }: {
  tabs: TabDef[]; active: string; onSelect: (k: string) => void; progressLabel: string;
}) {
  const done = tabs.filter((t) => t.done).length;
  return (
    // Sticky on desktop so the eight steps stay reachable while a long pane scrolls past. Capped
    // and scrollable in its own right, so a short viewport can still reach Attest at the bottom.
    // Phone layout is a horizontal strip above the pane, where sticking would eat the screen.
    // Pins 60px down, clear of the step's 52px StepBar; capped at the column less the header, that
    // bar and a margin.
    <nav className="md:w-[196px] shrink-0 md:self-start md:sticky md:top-[60px] md:max-h-[calc(100dvh/var(--app-zoom)_-_var(--hdr-h,64px)_-_76px)] md:overflow-y-auto [scrollbar-width:thin]">
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
            <button data-guide={`tab:${t.key}`} onClick={() => onSelect(t.key)} disabled={t.locked} aria-current={active === t.key ? "step" : undefined}
              title={t.locked ? "Finish the previous step first" : undefined}
              className={`w-auto md:w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left cursor-pointer focus-ring transition-colors disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-transparent ${
                active === t.key ? "bg-violet-50 ring-1 ring-violet-200 text-violet-800" : "text-slate-600 hover:bg-slate-100/70"}`}>
              <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                t.done ? "bg-emerald-100 text-emerald-600" : t.locked ? "bg-slate-100 text-slate-300" : active === t.key ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"}`}>
                <Icon name={t.done ? "check" : t.locked ? "lock" : t.icon} size={13} strokeWidth={t.done ? 3 : 2} />
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
        <button onClick={() => onSelect(next.key)} disabled={next.locked}
          title={next.locked ? "Finish this step first" : undefined}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-ring transition-colors shadow-[0_4px_14px_-4px_rgba(124,58,237,0.5)]">
          {next.locked && <Icon name="lock" size={13} />} Continue · {next.label} <Icon name="chevronRight" size={14} />
        </button>
      )}
    </div>
  );
}
