"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/components/auth/auth-provider";
import { DASH_NAV, initialsOf } from "./nav";
import { WelcomeTour, startWelcomeTour } from "./welcome-tour";
import { UpNext } from "./up-next";
import { FeedbackWidget } from "./feedback-widget";
import { OrgInfoButton } from "@/components/desk/org-drawer";
import { DropdownPanel } from "@/components/ui/motion";
import { learningsApi } from "@/lib/learnings";
import { useCachedQuery } from "@/lib/use-query";

function DashSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  closeMobile,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
  // Labels/badge/brand are hidden only on desktop when collapsed; the mobile drawer is always
  // full-width, so on small screens `collapsed` must not hide them.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";

  return (
    <aside
      aria-label="Sidebar"
      className={[
        "bg-white border-r border-slate-200 flex flex-col print:hidden",
        // Mobile: fixed off-canvas drawer that slides in over the content.
        "fixed inset-y-0 left-0 z-50 w-[244px] transition-transform duration-300",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Desktop (md+): part of the flex flow, collapsible width, never translated.
        "md:static md:z-auto md:translate-x-0 md:shadow-none md:h-full md:shrink-0 md:transition-all",
        collapsed ? "md:w-[68px]" : "md:w-[244px] 2xl:w-[276px]",
      ].join(" ")}
    >
      <div className="h-16 shrink-0 flex items-center px-4 gap-3 border-b border-[#e7e7f0]">
        {/* Desktop: collapse toggle. */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="focus-ring hidden md:flex w-9 h-9 rounded-lg items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" size={18} />
        </button>
        {/* Mobile: close drawer. */}
        <button
          onClick={closeMobile}
          className="focus-ring md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <Icon name="x" size={18} />
        </button>
        <div className={`flex items-baseline gap-0 ${hideWhenCollapsed}`}>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">grc</span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 self-center mt-1" />
        </div>
      </div>
      <nav data-tour="nav" className="flex-1 min-h-0 p-3 flex flex-col gap-0.5">
        {DASH_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={closeMobile}
              data-tour={`nav-${item.id}`}
              title={item.soon ? `${item.label} — coming soon` : item.label}
              // The rail is far taller than 11 links on a big screen, so the last one is pushed to
              // the floor — the column is then anchored at both ends and the slack reads as a gap
              // between groups instead of a blank band under the buttons.
              className={`focus-ring group w-full flex-1 min-h-0 max-h-10 px-3 rounded-lg flex items-center gap-3 transition-all no-underline ${
                item.id === DASH_NAV[DASH_NAV.length - 1].id ? "mt-auto" : ""
              } ${
                active ? "bg-indigo-50/80 text-indigo-700" : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              }`}
            >
              <Icon name={item.icon} size={17} strokeWidth={active ? 2 : 1.6} className="shrink-0" />
              <span className={`flex-1 flex items-center min-w-0 ${hideWhenCollapsed}`}>
                <span className={`text-[13.5px] tracking-tight truncate ${active ? "font-medium" : ""}`}>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto shrink-0 px-1.5 h-5 rounded-md text-[11px] font-medium flex items-center ${
                      active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = initialsOf(user?.firstName, user?.lastName, user?.email);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "";

  const onSignOut = () => signOut("/");

  return (
    <div className="relative pl-3 ml-1 border-l border-slate-200" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`focus-ring flex items-center gap-2 h-11 pl-1.5 pr-2 rounded-xl transition-colors ${open ? "bg-slate-100" : "hover:bg-slate-100/70"}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[12px] font-semibold ring-2 ring-white">
          {initials}
        </div>
        <div className="hidden lg:block text-left leading-tight">
          <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{user?.firstName || "Account"}</div>
          <div className="text-[10.5px] text-slate-500 capitalize">{user?.role || "Mentee"}</div>
        </div>
        <Icon name="chevronDown" size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <DropdownPanel open={open} className="absolute right-0 mt-2 w-[284px]">
          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 border-b border-slate-100">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[15px] font-semibold ring-2 ring-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-slate-900 tracking-tight truncate">{name}</div>
              <div className="text-[11.5px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/app/guide"
              onClick={() => setOpen(false)}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors no-underline"
            >
              <Icon name="help" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">User Guide</span>
              <Icon name="chevronRight" size={14} className="ml-auto text-slate-300 group-hover:text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                startWelcomeTour();
              }}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Icon name="play" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Replay the tour</span>
            </button>
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="focus-ring group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors no-underline"
            >
              <Icon name="settings" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Account Settings</span>
              <Icon name="chevronRight" size={14} className="ml-auto text-slate-300 group-hover:text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="p-1.5 border-t border-slate-100">
            <button
              onClick={onSignOut}
              className="focus-ring w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Icon name="logout" size={16} />
              <span className="text-[13px] font-medium tracking-tight">Sign out</span>
            </button>
          </div>
      </DropdownPanel>
    </div>
  );
}

/**
 * The bar's organisation slot, filled by the Working Desk with its dock of organisation logos
 * (`OrgDock`). Empty everywhere else, and then it takes no width at all.
 */
export const TOPBAR_NAV_ID = "app-topbar-nav";

/**
 * The header's height, published as `--hdr-h` for anything that has to sit below it — the desk's
 * scroll height, the step screen's floating checklist, the briefing window's drop point. The bar
 * is one fixed row now, but it is measured rather than assumed so a change to it cannot quietly
 * leave those three a few pixels wrong; and written to the document element so a
 * `position: fixed` element in any subtree can read it.
 */
function useHeaderHeight(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      document.documentElement.style.setProperty("--hdr-h", `${el.offsetHeight}px`),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}

/** The certificate's own mark: a rosette. */
const CertIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <circle cx="12" cy="9" r="5.5" />
    <path d="m8.6 13.4-1.6 7.6 5-2.6 5 2.6-1.6-7.6" />
  </svg>
);

/**
 * A progress gauge: a ring notched at 25, 50 and 75%. 2πr with r=14 is 87.96, so the dash is the
 * fraction of that. The ring starts at twelve o'clock, so the notches sit at three, six and nine.
 */
function Gauge({ pct, size, stroke, children }: { pct: number; size: number; stroke: number; children: React.ReactNode }) {
  const id = useId();
  return (
    <span className="relative grid shrink-0 place-items-center">
      <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b7cf8" />
            <stop offset="1" stopColor="#5b4fe9" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e1ff" strokeWidth={stroke} />
        <circle
          cx="18" cy="18" r="14" fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${((pct / 100) * 87.96).toFixed(2)} 87.96`} transform="rotate(-90 18 18)"
          className="transition-[stroke-dasharray] duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)]"
        />
        <g stroke="#fff" strokeWidth="1.6">
          <path d="M32.5 18h-4.7" />
          <path d="M18 32.5v-4.7" />
          <path d="M3.5 18h4.7" />
        </g>
      </svg>
      <span className="absolute grid place-items-center">{children}</span>
    </span>
  );
}

/**
 * How far through the programme they are — one control, not two.
 *
 * Activities done and certificate progress are the same journey, so they share one capsule: the
 * gauge carries the certificate percentage (the thing the work is for, issued at 100%), the text
 * under it the activity count that percentage is made of. Click it for the milestone track and
 * what is left to go. Below `lg`, only the gauge.
 *
 * Derived from the engagement tree, not a second endpoint: `learnings:grc101` is already fetched
 * by the Dashboard and the desk, and `useCachedQuery` dedupes the key across the whole app.
 */
function ProgramProgress() {
  const { data } = useCachedQuery("learnings:grc101", () => learningsApi.get("grc101"));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tasks = (data?.orgs ?? []).flatMap((o) => o.projects.flatMap((p) => p.tasks));
  if (tasks.length === 0) return null;

  const acts = tasks.reduce((n, t) => n + t.total, 0);
  const done = tasks.reduce((n, t) => n + t.done, 0);
  const pct = acts ? Math.round((done / acts) * 100) : 0;
  // The next quarter mark still ahead, and how many activities reach it.
  const next = [25, 50, 75, 100].find((q) => q > pct);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Certificate ${pct}% complete, ${done} of ${acts} activities done. Show progress details`}
        className={`flex h-11 items-center gap-2.5 rounded-full border px-1 transition-[background,border-color,box-shadow] lg:pl-1 lg:pr-3 ${
          open
            ? "border-[#d2ccff] bg-white shadow-[0_4px_14px_-8px_rgba(91,79,233,.35)]"
            : "border-[#e7e7f0] bg-[#f3f3f9] hover:border-[#d2ccff] hover:bg-white hover:shadow-[0_4px_14px_-8px_rgba(91,79,233,.35)]"
        }`}
      >
        <Gauge pct={pct} size={34} stroke={3.2}>
          <CertIcon size={14} className="text-[#5b4fe9]" />
        </Gauge>
        <span className="hidden flex-col gap-1 whitespace-nowrap text-left lg:flex">
          <span className="text-[12.5px] leading-none text-[#4b4c63]">
            <b className="mr-0.5 text-[15px] font-semibold tracking-[-0.01em] text-[#191a2c]">{pct}%</b> to certificate
          </span>
          <span className="text-[11.5px] leading-none text-[#8a8ba3]">
            <b className="font-semibold tabular-nums text-[#4b4c63]">{done}</b> of {acts} activities
          </span>
        </span>
        <Icon name="chevronDown" size={14} className={`hidden text-[#8a8ba3] transition-transform duration-200 lg:block ${open ? "rotate-180" : ""}`} />
      </button>

      <DropdownPanel open={open} className="absolute right-0 mt-2.5 w-[330px] p-4">
        <div className="flex items-center gap-3.5">
          <Gauge pct={pct} size={72} stroke={3}>
            <span className="whitespace-nowrap text-[19px] font-semibold tracking-[-0.02em] text-[#191a2c]">
              {pct}<small className="text-[11px] font-medium text-[#8a8ba3]">%</small>
            </span>
          </Gauge>
          <span>
            <b className="block text-[15px] font-semibold text-[#191a2c]">Certificate progress</b>
            <small className="mt-0.5 block text-[12.5px] text-[#8a8ba3]">Issued automatically at 100%</small>
          </span>
        </div>

        <div className="mx-1 mb-1 mt-[18px]" aria-label="Milestones">
          <div className="relative h-1.5 rounded-full bg-[#e5e1ff]">
            <i className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#8b7cf8] to-[#5b4fe9]" style={{ width: `${pct}%` }} />
            {[25, 50, 75].map((q) => (
              <span
                key={q}
                className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                  pct >= q ? "border-white bg-[#5b4fe9] shadow-[0_0_0_1.5px_#5b4fe9]" : "border-[#cfc8ff] bg-white"
                }`}
                style={{ left: `${q}%` }}
              />
            ))}
            <span
              className={`absolute left-full top-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 ${
                pct >= 100 ? "border-white bg-[#5b4fe9] text-white" : "border-[#d2ccff] bg-white text-[#5b4fe9]"
              }`}
            >
              <CertIcon size={10} />
            </span>
          </div>
          <div className="relative mt-2.5 h-3.5 text-[11px] text-[#8a8ba3]">
            <span className="absolute left-0">0</span>
            <span className="absolute left-1/4 -translate-x-1/2">25%</span>
            <span className="absolute left-1/2 -translate-x-1/2">50%</span>
            <span className="absolute left-3/4 -translate-x-1/2">75%</span>
            <span className="absolute right-0">100%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#f3f3f9] px-3 py-2.5">
            <small className="block text-[11.5px] text-[#8a8ba3]">Activities done</small>
            <b className="my-[3px] block text-[20px] font-semibold tracking-[-0.02em] tabular-nums text-[#191a2c]">{done}</b>
            <span className="whitespace-nowrap text-[11.5px] text-[#8a8ba3]">of {acts}</span>
          </div>
          <div className="rounded-xl bg-[#f3f3f9] px-3 py-2.5">
            <small className="block text-[11.5px] text-[#8a8ba3]">Left to go</small>
            <b className="my-[3px] block text-[20px] font-semibold tracking-[-0.02em] tabular-nums text-[#191a2c]">{acts - done}</b>
            <span className="whitespace-nowrap text-[11.5px] text-[#8a8ba3]">
              {next ? `${next}% at ${Math.ceil((acts * next) / 100)}` : "Certificate ready"}
            </span>
          </div>
        </div>

      </DropdownPanel>
    </div>
  );
}

function DashTopBar({ openMobile }: { openMobile: () => void }) {
  const header = useRef<HTMLElement>(null);
  useHeaderHeight(header);

  // One row, 64px, that never changes shape: nothing in it expands, collapses or jumps.
  return (
    <header
      ref={header}
      className="relative z-30 h-16 shrink-0 border-b border-[#e7e7f0] bg-white/95 backdrop-blur-[10px] backdrop-saturate-[1.4] print:hidden"
    >
      <div className="flex h-full items-center gap-1.5 px-2.5 md:gap-3.5 md:px-4">
        {/* Mobile: open the navigation drawer. */}
        <button
          onClick={openMobile}
          className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-[11px] text-[#4b4c63] transition-colors hover:bg-[#efedff] hover:text-[#5b4fe9] md:hidden"
          aria-label="Open menu"
        >
          <Icon name="menu" size={20} />
        </button>

        <Link href="/app" aria-label="GRC 101 Foundations, home" className="hidden shrink-0 items-center gap-2.5 no-underline md:flex">
          <span className="hidden leading-tight min-[1140px]:block">
            <b className="block text-[14.5px] font-semibold tracking-[-0.005em] text-[#191a2c]">GRC 101</b>
            <small className="block text-[12px] text-[#8a8ba3]">Foundations</small>
          </span>
        </Link>

        {/* The mentee's two organisations, next to the programme they belong to. */}
        <span aria-hidden className="hidden h-7 w-px shrink-0 bg-[#e7e7f0] min-[1140px]:block" />
        <OrgInfoButton />

        {/* The desk's organisation dock, behind a rule. Off the desk the slot is empty, and the rule
            goes with it — a hairline fencing off nothing. */}
        <span aria-hidden className="hidden h-7 w-px shrink-0 bg-[#e7e7f0] md:block [&:has(+div:empty)]:hidden" />
        <div id={TOPBAR_NAV_ID} className="flex min-w-0 empty:hidden max-md:flex-1" />

        <div className="min-w-2 flex-1 max-md:hidden" />

        <div className="flex shrink-0 items-center gap-1.5">
          <ProgramProgress />
          <span data-tour="bell"><UpNext /></span>
          <span data-tour="account"><UserMenu /></span>
        </div>
      </div>
    </header>
  );
}


export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // The desk is a focus surface and wants the width: entering it folds the main menu to its icon
  // rail every time, and leaving it puts the menu back as it was. Opening the menu while on the desk
  // sticks until you leave. Desktop only in effect: on mobile the menu is a drawer anyway.
  const onDesk = pathname.startsWith("/app/desk");
  const beforeDesk = useRef<boolean | null>(null);
  useEffect(() => {
    if (onDesk && beforeDesk.current === null) {
      beforeDesk.current = collapsed;
      setCollapsed(true);
    } else if (!onDesk && beforeDesk.current !== null) {
      setCollapsed(beforeDesk.current);
      beforeDesk.current = null;
    }
    // Only crossing the desk boundary acts; toggling the menu by hand must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDesk]);

  // Close the mobile drawer on navigation and on Escape.
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="h-screen flex overflow-hidden bg-[#FAFAF7] print:h-auto print:overflow-visible print:block">
      {/* Mobile drawer backdrop. */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden print:hidden"
          aria-hidden="true"
        />
      )}
      <DashSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <DashTopBar openMobile={() => setMobileOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden print:overflow-visible print:h-auto">{children}</main>
      </div>
      {/* On the desk the corner belongs to its toolbar, so the button sits above it. */}
      <FeedbackWidget placement={pathname.startsWith("/app/desk") ? "bottom-[22px] right-5 max-lg:bottom-[84px] max-lg:right-4" : undefined} />
      <div className="print:hidden"><WelcomeTour openNav={() => setMobileOpen(true)} /></div>
    </div>
  );
}
