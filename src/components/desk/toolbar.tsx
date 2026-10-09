"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { useUnread } from "./chat";
import { sectionOpen, toolOpen, unlockHint } from "@/lib/desk/tools";

const SEC_ICON: Record<string, IconName> = {
  home: "home", evidence: "paperclip", frameworks: "layers", access: "users", risk: "alertTriangle", vendors: "handshake",
  testing: "checkSquare", policies: "file", awareness: "messageSquare", regwatch: "globe", learn: "book",
};
const UT_ICON: Record<string, IconName> = { search: "search", add: "plus", inbox: "inbox", systems: "grid", alerts: "bell", filter: "filter", help: "help" };
/** Utilities that open straight into their screen, as in the pack's desk; the rest open a menu. */
const DIRECT = new Set(["inbox", "help"]);
const MENU_W = 400;

/**
 * The platform toolbar (GRC 101 Working Desk — Redesign): a dark, square dock of cells with group
 * rules between them. Each section opens a menu of its tools above its own cell; a tool opens in the
 * tool modal, where the steps are worked. A tool unlocks when a step sends the mentee to it and stays
 * open for reading after (lib/desk/tools.ts). The section the step in hand is done in carries an
 * amber dot, and its tool is the amber row of the menu.
 */
export function Toolbar() {
  const { desk, isOpen, progress, here, openTool } = useDesk();
  const unread = useUnread();
  const [pop, setPop] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setPop(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPop(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const step = here ? desk.tasks[here.task].steps[here.n - 1] : undefined;
  const target = step?.key ?? ""; // the tool the step in hand is done in
  const targetSec = target.split("|")[0];
  const sec = pop ? desk.sections[pop] : undefined;
  const open = (key: string) => toolOpen(desk, progress, isOpen, here, key);

  const toggle = (k: string, el: HTMLButtonElement) => {
    if (pop === k) return setPop(null);
    // The menu sits over its own cell, kept inside the dock's width.
    const nav = dock.current;
    const x = el.offsetLeft - (nav?.scrollLeft ?? 0);
    setLeft(Math.max(0, Math.min(x, (nav?.clientWidth ?? MENU_W) - MENU_W)));
    setPop(k);
  };

  const cell = (k: string, l: string, icon: IconName, unlocked: boolean, opts: { badge?: number; end?: boolean } = {}) => {
    const on = pop === k;
    const due = unlocked && k === targetSec && !on;
    return (
      <button
        key={k}
        type="button"
        aria-disabled={!unlocked}
        aria-expanded={DIRECT.has(k) ? undefined : on}
        onClick={(e) => {
          if (!unlocked) return;
          if (DIRECT.has(k)) {
            setPop(null);
            openTool(`${k}|*`);
          } else toggle(k, e.currentTarget);
        }}
        title={unlocked ? (due ? `${l} · your current step is done here` : l) : `${l} opens when a step sends you here`}
        className={`relative flex h-[54px] min-w-[60px] shrink-0 flex-col items-center justify-center gap-[3px] px-2 text-[11px] focus-ring ${
          opts.end ? "border-r border-[#2A2E3B]" : ""
        } ${on ? "bg-white text-[#111827]" : unlocked ? "text-[#F1F2F6] hover:bg-[#1F2330]" : "cursor-not-allowed text-[#7C8399]"}`}
      >
        <span className="relative">
          <Icon name={icon} size={18} strokeWidth={1.7} />
          {!unlocked && <Icon name="lock" size={9} strokeWidth={2.5} className="absolute -right-2 -top-1" />}
        </span>
        <span className="whitespace-nowrap">{l}</span>
        {due && <span className="absolute right-[17px] top-[7px] h-[7px] w-[7px] rounded-full bg-[#F59E0B]" aria-hidden />}
        {!!opts.badge && (
          <span className="absolute right-[11px] top-1 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-[#4338CA] px-1 text-[10px] font-bold text-white tabular-nums">{opts.badge}</span>
        )}
      </button>
    );
  };

  // A section closes its group when the next entry is a divider, or when the utilities follow.
  const ends = new Set(desk.secs.map((s, i) => (s && (desk.secs[i + 1] === null || i === desk.secs.length - 1) ? s.k : null)).filter(Boolean) as string[]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex justify-center sm:inset-x-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="pointer-events-auto relative min-w-0 max-w-full">
        {pop && sec && (
          <div
            className="desk-pop absolute bottom-[calc(100%+8px)] z-40 w-[400px] max-w-[calc(100vw-24px)] overflow-hidden rounded-md border border-[#C9CED8] bg-white shadow-[0_12px_32px_rgba(17,24,39,0.16)]"
            style={{ left, transformOrigin: "bottom left" }}
          >
            <div className="border-b border-[#DDE1E8] bg-[#F7F8FA] px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">{sec.t}</p>
              <p className="text-[13px] text-[#5B6474]">{sec.sub}</p>
            </div>
            <ul className="max-h-[320px] overflow-y-auto">
              {sec.tools.map((t, i) => {
                const key = `${pop}|${t.n}`;
                const unlocked = open(key);
                const isTarget = key === target;
                return (
                  <li key={`${t.n}-${i}`}>
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => {
                        setPop(null);
                        openTool(key);
                      }}
                      className={`flex w-full items-center gap-3 border-b border-[#E9ECF1] px-3.5 py-2.5 text-left text-[14px] focus-ring disabled:cursor-not-allowed ${
                        isTarget ? "bg-[#FFFBF2] shadow-[inset_3px_0_0_#D97706]" : unlocked ? "bg-white hover:bg-[#F7F8FA]" : "bg-[#FAFAFB]"
                      }`}
                    >
                      <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded border border-[#E3E6EC] ${unlocked ? "bg-white text-[#3F4757]" : "text-[#8A91A3]"}`}>
                        <Icon name={unlocked ? (SEC_ICON[pop] ?? UT_ICON[pop] ?? "grid") : "lock"} size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block font-semibold ${unlocked ? "text-[#111827]" : "text-[#6B7280]"}`}>{t.n}</span>
                        <span className={`block text-[12px] ${unlocked ? "text-[#5B6474]" : "text-[#6B7280]"}`}>{t.d}</span>
                      </span>
                      {isTarget ? (
                        <span className="shrink-0 rounded-[3px] bg-[#FDE7B8] px-1.5 py-0.5 text-[11px] font-semibold text-[#78350F]">Step {here?.n}</span>
                      ) : !unlocked ? (
                        <span className="shrink-0 rounded-[3px] border border-[#E3E6EC] px-1.5 py-0.5 text-[11px] text-[#6B7280]">{unlockHint(desk, key)}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <nav
          ref={dock}
          aria-label="Platform tools"
          className="flex max-w-full items-stretch overflow-x-auto rounded-lg border border-[#12141C] bg-[#12141C] shadow-[0_10px_28px_rgba(17,24,39,0.25)] [scrollbar-width:none]"
        >
          {desk.secs.map((s) => (s === null ? null : cell(s.k, s.l, SEC_ICON[s.k] ?? "grid", sectionOpen(desk, progress, isOpen, here, s.k), { end: ends.has(s.k) })))}
          {desk.ut.map((u) => cell(u.k, u.l, UT_ICON[u.k] ?? "grid", true, { badge: u.k === "inbox" ? unread : undefined }))}
        </nav>
      </div>
    </div>
  );
}
