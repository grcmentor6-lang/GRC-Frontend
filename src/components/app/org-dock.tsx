"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { TOPBAR_NAV_ID } from "@/components/app/app-shell";
import { OrgLogo } from "@/components/app/org-logo";
import { OrgWindow } from "@/components/app/org-window";
import { useDeskBase, useDeskLearnings, useDeskRoute } from "@/components/app/desk-context";
import type { LearningOrg } from "@/lib/learnings";

/**
 * The learner's organisations, as a dock of logos in the top bar.
 *
 * They replace the organisation level of the tree: the tree lists one organisation's tasks, and
 * this is how you change which one and what says which it is. Each logo sits in a thin ring that
 * fills as that organisation's tasks are completed — green when all are — and only the current one
 * spells out its name. Hover or focus any other for its details.
 *
 * Eight at a time, because that is what a learner is assigned. The dock is sized for exactly eight;
 * should an assignment ever run past it, the rest move behind a "+N" list rather than squeezing
 * the bar. On a phone only the current organisation shows, with the list one tap away.
 *
 * A logo is a link to that organisation's context page, so the choice lives in the URL and nothing
 * has to be kept in step with it (see `useDeskRoute`). The `i` on the current one opens the same
 * briefing as that page, in a window over the work — the case for reading it is usually mid-step.
 *
 * Drawn into the header through a portal rather than by AppShell holding desk state: the header
 * belongs to every page, the organisations belong to the desk, and the slot is simply empty
 * everywhere else.
 */

const MAX_VISIBLE = 8;

type Row = { org: LearningOrg; done: number; total: number; locked: boolean; complete: boolean; hint: string };

const status = (r: Row) =>
  r.locked ? "Locked" : r.complete ? "Completed" : r.done > 0 ? "In progress" : "Not started";

export function OrgDock() {
  const { learnings } = useDeskLearnings();
  const base = useDeskBase();
  const { orgId } = useDeskRoute();

  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [brief, setBrief] = useState<LearningOrg | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [tip, setTip] = useState<{ row: Row; x: number; y: number } | null>(null);
  const dock = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // The slot belongs to another subtree, so it does not exist until after the first commit. There
  // is nothing to subscribe to.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSlot(document.getElementById(TOPBAR_NAV_ID)), []);

  // The list closes on a click anywhere else and on Escape, like every other menu in the bar.
  useEffect(() => {
    if (!listOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setListOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setListOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [listOpen]);

  const orgs = learnings?.orgs ?? [];
  if (!slot || orgs.length === 0) return null;

  const rows: Row[] = orgs.map((org, i) => {
    const tasks = org.projects.flatMap((p) => p.tasks);
    const done = tasks.filter((t) => t.total > 0 && t.done === t.total).length;
    return {
      org,
      done,
      total: tasks.length,
      locked: org.status === "locked" || org.status === "upcoming",
      complete: tasks.length > 0 && done === tasks.length,
      hint: i > 0 ? `Finish ${orgs[i - 1].name} to unlock` : "Locked",
    };
  });

  // Eight in the dock. If the current one is past the eighth, it takes the last seat so the dock
  // always shows where you are.
  const cur = rows.findIndex((r) => r.org.id === orgId);
  const shown = cur >= MAX_VISIBLE ? [...rows.slice(0, MAX_VISIBLE - 1), rows[cur]] : rows.slice(0, MAX_VISIBLE);
  const hidden = rows.length - shown.length;
  const completeCount = rows.filter((r) => r.complete).length;

  const showTip = (row: Row, el: HTMLElement) => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const r = el.getBoundingClientRect();
    // The tooltip is portalled to <body>, inside the zoomed page, so viewport pixels from the rect
    // are divided back into the page's own before they are used as a position.
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-zoom")) || 1;
    setTip({ row, x: (r.left + r.width / 2) / zoom, y: (r.bottom + 10) / zoom });
  };

  // Left and right walk the dock, wrapping; Home and End jump to its ends.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const items = [...(dock.current?.querySelectorAll<HTMLElement>("[data-org-item]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    const to =
      e.key === "ArrowRight" ? (i + 1) % items.length
      : e.key === "ArrowLeft" ? (i - 1 + items.length) % items.length
      : e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : -1;
    if (to < 0) return;
    e.preventDefault();
    items[to].focus();
  };

  return (
    <>
      {createPortal(
        <div ref={listRef} className="relative flex min-w-0 max-md:flex-1">
          <div
            ref={dock}
            role="tablist"
            aria-label="Organisations"
            data-tour="desk-org"
            onKeyDown={onKeyDown}
            className="flex min-w-0 items-center gap-0.5 rounded-full border max-md:flex-1 border-[#e7e7f0] bg-[#f3f3f9] p-[3px]"
          >
            {shown.map((row) => (
              <DockItem
                key={row.org.id}
                row={row}
                current={row.org.id === orgId}
                href={`${base}/org/${row.org.id}`}
                onBrief={() => {
                  setTip(null);
                  setBrief(row.org);
                }}
                onList={() => setListOpen((v) => !v)}
                onTip={showTip}
                onTipEnd={() => setTip(null)}
              />
            ))}
            {hidden > 0 && (
              <button
                onClick={() => setListOpen((v) => !v)}
                aria-expanded={listOpen}
                aria-label="All organisations"
                className="focus-ring ml-0.5 hidden h-8 min-w-8 place-items-center rounded-full px-2 text-[12px] font-semibold text-slate-400 transition-colors hover:bg-white hover:text-indigo-600 md:grid"
              >
                +{hidden}
              </button>
            )}
          </div>

          {listOpen && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[70] w-[320px] rounded-2xl border border-[#e7e7f0] bg-white p-2 shadow-[0_20px_44px_-18px_rgba(25,26,44,.32),0_2px_6px_rgba(25,26,44,.05)]">
              <div className="flex items-center justify-between px-2.5 pb-2.5 pt-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Organisations</span>
                <span className="text-[12.5px] tabular-nums text-slate-400">{completeCount} of {rows.length} complete</span>
              </div>
              {rows.map((row) => {
                const inner = (
                  <>
                    <OrgLogo org={row.org} className="h-[30px] w-[30px]" iconSize={30} />
                    <span className="min-w-0 flex-1">
                      <b className={`block truncate text-[13px] font-semibold ${row.locked ? "text-slate-400" : "text-slate-900"}`}>{row.org.name}</b>
                      <MiniBar row={row} />
                    </span>
                    <small className="text-[11.5px] tabular-nums text-slate-400">
                      {row.locked ? <Icon name="lock" size={11} /> : `${row.done}/${row.total}`}
                    </small>
                  </>
                );
                const cls = `flex w-full items-center gap-3 rounded-[10px] px-2.5 py-[9px] text-left no-underline ${
                  row.org.id === orgId ? "bg-[#efedff]" : "hover:bg-[#f3f3f9]"
                }`;
                return row.locked ? (
                  <div key={row.org.id} title={row.hint} className={`${cls} cursor-not-allowed`}>{inner}</div>
                ) : (
                  <Link
                    key={row.org.id}
                    href={`${base}/org/${row.org.id}`}
                    onClick={() => setListOpen(false)}
                    aria-current={row.org.id === orgId ? "true" : undefined}
                    className={cls}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          )}
        </div>,
        slot,
      )}

      {tip && typeof document !== "undefined" &&
        createPortal(<DockTip {...tip} />, document.body)}

      {brief && (
        <OrgWindow org={brief} href={`${base}/org/${brief.id}`} onClose={() => setBrief(null)} />
      )}
    </>
  );
}

function DockItem({ row, current, href, onBrief, onList, onTip, onTipEnd }: {
  row: Row;
  current: boolean;
  href: string;
  onBrief: () => void;
  onList: () => void;
  onTip: (row: Row, el: HTMLElement) => void;
  onTipEnd: () => void;
}) {
  const { org } = row;
  const label = `${org.name}, ${row.done} of ${row.total} tasks, ${status(row)}`;

  const face = (
    <>
      <Ring row={row} />
      {/* Only the current organisation spells itself out; the rest are read by their logo and
          named on hover. The width animates so switching slides the name across. */}
      <span
        className={`flex flex-col items-start overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
          current ? "ml-[9px] max-w-[150px] opacity-100 min-[1320px]:max-w-[200px] max-md:max-w-none max-md:min-w-0 max-md:flex-1" : "max-w-0 opacity-0"
        }`}
      >
        <b className="block max-w-full truncate text-[13px] font-semibold leading-[1.1] text-slate-900">{org.name}</b>
        <small className="text-[11px] leading-[1.2] tabular-nums text-slate-400">{row.done} of {row.total} tasks</small>
      </span>
    </>
  );

  const shell = `flex h-[38px] items-center rounded-full transition-[background,box-shadow,padding] duration-200 ${
    current
      ? "bg-white pl-[3px] pr-[38px] shadow-[0_1px_2px_rgba(25,26,44,.06),0_0_0_1px_#e7e7f0] max-md:min-w-0 max-md:flex-1"
      : "px-[3px] hover:bg-white/70"
  }`;

  return (
    <span className={`relative items-center motion-safe:animate-[popIn_.32s_cubic-bezier(.2,.7,.2,1)_both] ${current ? "flex max-md:min-w-0 max-md:flex-1" : "hidden md:flex"}`}>
      {row.locked ? (
        <span
          data-org-item
          tabIndex={-1}
          role="tab"
          aria-disabled
          aria-label={`${label}. ${row.hint}`}
          onMouseEnter={(e) => onTip(row, e.currentTarget)}
          onMouseLeave={onTipEnd}
          onFocus={(e) => onTip(row, e.currentTarget)}
          onBlur={onTipEnd}
          className={`${shell} cursor-not-allowed`}
        >
          {face}
        </span>
      ) : (
        <Link
          href={href}
          data-org-item
          role="tab"
          aria-selected={current}
          aria-current={current ? "true" : undefined}
          aria-label={label}
          tabIndex={current ? 0 : -1}
          onMouseEnter={(e) => !current && onTip(row, e.currentTarget)}
          onMouseLeave={onTipEnd}
          onFocus={(e) => !current && onTip(row, e.currentTarget)}
          onBlur={onTipEnd}
          onClick={(e) => {
            // A phone shows only the current organisation, so tapping it is the way to the others.
            if (current && window.matchMedia("(max-width: 767px)").matches) {
              e.preventDefault();
              onList();
            }
          }}
          className={`${shell} no-underline`}
        >
          {face}
          {current && <Icon name="chevronDown" size={15} className="ml-1.5 shrink-0 text-slate-400 md:hidden" />}
        </Link>
      )}

      {current && !row.locked && (
        // The mockup's "quiet" i: grey on white, turning indigo on hover. Its amber version marks
        // an organisation with reviewer notes waiting, which the tree does not carry yet. It sits
        // outside the link because a button inside one leaves the click belonging to whichever won.
        <button
          onClick={onBrief}
          aria-label={`About ${org.name}`}
          title="Organisation briefing"
          className="focus-ring absolute right-[7px] top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-[#d9d9e7] bg-white text-[#8a8ba3] transition-colors hover:border-[#d2ccff] hover:bg-[#efedff] hover:text-[#5b4fe9]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
            <path d="M12 11v6" />
            <circle cx="12" cy="7.2" r=".6" fill="currentColor" />
          </svg>
        </button>
      )}
    </span>
  );
}

/** The logo, inside a thin ring of that organisation's task progress. 2πr with r=14.5 is 91.1.
 *
 *  The ring's outer edge sits half a unit inside its 32-unit box, and at the app's `zoom: 0.9`
 *  (lg and up) rounding shaved that half-unit off the SVG viewport — a finished organisation's
 *  full green circle came out sliced flat top and bottom. `overflow-visible` lets the stroke draw
 *  past the box instead of being cut by it. */
function Ring({ row }: { row: Row }) {
  const C = 2 * Math.PI * 14.5;
  const f = row.total ? row.done / row.total : 0;
  return (
    <span className="relative h-8 w-8 shrink-0">
      <svg className="absolute inset-0 overflow-visible" width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="#dedee9" strokeWidth="2" />
        {f > 0 && (
          <circle
            cx="16" cy="16" r="14.5" fill="none"
            stroke={row.complete ? "#22c55e" : "#5b4fe9"}
            strokeWidth="2" strokeLinecap="round"
            strokeDasharray={`${(C * f).toFixed(2)} ${C.toFixed(2)}`}
            transform="rotate(-90 16 16)"
          />
        )}
      </svg>
      <span className="absolute inset-[3.5px] grid place-items-center">
        <OrgLogo org={row.org} className="h-full w-full" iconSize={25} />
      </span>
      {row.locked && (
        <span className="absolute -bottom-px -right-px grid h-[13px] w-[13px] place-items-center rounded-full border-2 border-white bg-slate-400 text-white box-content">
          <Icon name="lock" size={7} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

function MiniBar({ row }: { row: Row }) {
  const pct = row.total ? (row.done / row.total) * 100 : 0;
  return (
    <span className="mt-[5px] block h-1 overflow-hidden rounded-full bg-[#ececf5]">
      <span
        className={`block h-full rounded-full ${row.complete ? "bg-[#22c55e]" : "bg-[#5b4fe9]"}`}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

/** Hover card under a logo. Pointer-transparent, so it never gets in the way of the next hover. */
function DockTip({ row, x, y }: { row: Row; x: number; y: number }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[80] w-[250px] rounded-[14px] border border-[#e7e7f0] bg-white px-3.5 py-3 shadow-[0_20px_44px_-18px_rgba(25,26,44,.32),0_2px_6px_rgba(25,26,44,.05)] motion-safe:animate-[popIn_.12s_ease-out]"
      style={{ left: `clamp(12px, ${x - 125}px, calc(100% - 262px))`, top: y }}
    >
      <b className="block text-[13.5px] font-semibold text-slate-900">{row.org.name}</b>
      <div className="mb-1.5 mt-2 flex items-center justify-between text-[12px] text-slate-600">
        <span className={`font-semibold ${row.complete ? "text-[#15a04a]" : row.locked ? "text-slate-400" : "text-slate-600"}`}>
          {status(row)}
        </span>
        <span className="tabular-nums">{row.done} / {row.total} tasks</span>
      </div>
      <MiniBar row={row} />
      {row.locked && <div className="mt-2 text-[12px] text-slate-400">{row.hint}</div>}
    </div>
  );
}
