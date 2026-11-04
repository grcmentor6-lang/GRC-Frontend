"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { userKey } from "@/lib/token";
import { SOFT_TONES } from "@/lib/tones";
import { DropdownPanel } from "@/components/ui/motion";
import { useAuth } from "@/components/auth/auth-provider";
import { useDeskRecord } from "@/lib/desk-record";
import { ALL_WEEKS_OPEN } from "@/lib/flags";
import { planOf, dueText } from "@/lib/desk-plan";
import { fmtDay } from "@/lib/desk/model";

/** Only look this far ahead; beyond it is the Calendar page's job. */
const HORIZON_DAYS = 7;
interface Item { id: string; icon: string; tone: "rose" | "amber" | "indigo"; title: string; detail: string; when: string; href: string; blocking: boolean }
// Scoped per account — an unscoped key lets one learner's dismissals silence the next learner's
// bell on the same browser, including a blocking mentor note.
const seenKey = () => `grcmentor:upnext-seen:${userKey()}`;

/** IDs the mentee has already seen in the dropdown. Storing IDs (not a timestamp) means a
 *  brand-new overdue item or revision still lights the badge even if you opened it earlier. */
function readSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(seenKey()) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function UpNext() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(readSeen);
  const ref = useRef<HTMLDivElement>(null);

  // The desk's own hand-in dates for this account (lib/desk-plan), the same as the Calendar page.
  // ponytail: the old /me/calendar deadlines and /me/mentor-feedback gate decisions belong to the
  // retired activity table and linked to desk routes that no longer exist; add desk review news here
  // when the desk has a reviewer.
  const { user } = useAuth();
  const { desk, progress, start } = useDeskRecord();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const items: Item[] = useMemo(() => {
    if (!desk || !user?.startDate) return [];
    return planOf(desk, progress, start, ALL_WEEKS_OPEN || user.role === "admin")
      .filter((t) => (t.state === "overdue" || t.state === "today" || t.state === "upcoming") && t.left <= HORIZON_DAYS)
      .map((t) => ({
        id: `due-${t.id}-${t.state}`,
        icon: t.state === "overdue" ? "alertTriangle" : "clock",
        tone: t.state === "overdue" ? "rose" : t.state === "today" ? "amber" : "indigo",
        // The title is the task; the right-hand line already says "Overdue by 2 days" / "Due tomorrow".
        title: `${t.id} · ${t.title}`,
        detail: `Due ${fmtDay(t.due)} · ${t.stepsDone} of ${t.steps} steps done`,
        when: dueText(t),
        href: `/app/desk#${t.id}`,
        blocking: t.state !== "upcoming",
      }));
  }, [desk, progress, start, user]);
  const blocking = items.reduce((n, x) => n + (x.blocking && !seen.has(x.id) ? 1 : 0), 0);
  const late = items.some((x) => x.tone === "rose" && !seen.has(x.id));

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        // Mark everything currently shown as seen; overwrite (not merge) so storage stays
        // bounded to the live list — resolved items drop out on their own.
        const ids = items.map((x) => x.id);
        if (typeof window !== "undefined") localStorage.setItem(seenKey(), JSON.stringify(ids));
        setSeen(new Set(ids));
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Up next"
        className="focus-ring w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
      >
        <Icon name="bell" size={17} />
        {blocking > 0 && (
          <span
            className={`absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-white text-[9px] font-semibold flex items-center justify-center ring-2 ring-white tabular-nums ${late ? "bg-rose-500" : "bg-indigo-500"}`}
          >
            {blocking > 9 ? "9+" : blocking}
          </span>
        )}
      </button>

      <DropdownPanel open={open} className="absolute right-0 mt-2 w-[330px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-[13px] font-semibold text-slate-900 tracking-tight">Up next</span>
          <Link href="/app/calendar" onClick={() => setOpen(false)} className="text-[11px] text-slate-400 hover:text-slate-600 no-underline">
            Calendar
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8 px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-300 mb-2.5">
              <Icon name="checkCircle" size={18} />
            </div>
            <div className="text-[12.5px] font-medium text-slate-600">Nothing due</div>
            <div className="text-[11.5px] text-slate-400 mt-0.5 max-w-[220px]">
              {user?.startDate ? "Desk tasks due in the next 7 days, and any overdue, show up here." : "Pick your start date on the Working Desk; your due dates show up here."}
            </div>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto py-1.5">
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex gap-3 px-3 py-2.5 hover:bg-slate-50 no-underline transition-colors"
              >
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${SOFT_TONES[n.tone]}`}>
                  <Icon name={n.icon as IconName} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-slate-800 tracking-tight leading-snug line-clamp-2">{n.title}</div>
                  <div className="text-[11.5px] text-slate-500 tracking-tight truncate">{n.detail}</div>
                </div>
                <span className={`text-[10.5px] shrink-0 mt-0.5 whitespace-nowrap ${n.tone === "rose" ? "text-rose-500 font-medium" : "text-slate-400"}`}>
                  {n.when}
                </span>
              </Link>
            ))}
          </div>
        )}
      </DropdownPanel>
    </div>
  );
}
