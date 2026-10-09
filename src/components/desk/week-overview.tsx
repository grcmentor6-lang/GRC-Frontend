"use client";

import { useEffect, useRef } from "react";
import { useDesk } from "./desk-context";
import { Chip } from "./ui";
import { dueDate, fmtDay } from "@/lib/desk/model";

/**
 * The week, before its tasks: what it is for and the skills it practises. The tasks themselves
 * are in the left panel.
 */
export function WeekOverview({ week }: { week: number }) {
  const { desk, start, isOpen } = useDesk();
  const w = desk.weeks[week - 1];
  // Open at the top, whatever the task view had scrolled to. Runs on mount, after the cross-fade.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    root.current?.closest("main")?.scrollTo({ top: 0 });
  }, [week]);

  return (
    <div ref={root} className="desk-rise mx-auto grid w-full max-w-[1200px] gap-6 pt-6">
      <header className="grid gap-3">
        <p className="text-[12.5px] text-slate-500">
          Week {week} of {desk.weeks.length} · {w.ph} · {isOpen(week) ? "opened" : "opens"} {fmtDay(dueDate(start, (week - 1) * 7))}
        </p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.015em] text-slate-900 text-balance">{w.th.replace(/^Foundation \w+: /, "")}</h1>
        <p className="max-w-[78ch] text-[14.5px] leading-relaxed text-slate-700">{w.obj}</p>
        <div className="flex flex-wrap gap-1.5">
          {w.resp.map(([, r]) => <Chip key={r} tone="indigo">{r}</Chip>)}
        </div>
      </header>
    </div>
  );
}
