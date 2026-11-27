"use client";

import { useEffect, useRef } from "react";

/**
 * "This locks your answers — continue?" (UX101 W3, S-04/U-02). Weeks 1–3 are the weeks of learning to read a check, so
 * every lock asks first there; sealing a task always asks. `lockWeeks` is the one place that says which weeks.
 */
export const asksBeforeLock = (week: number) => week <= 3;

export function ConfirmBar({ message, yes, onYes, onNo, className = "" }: { message: string; yes: string; onYes: () => void; onNo: () => void; className?: string }) {
  // It takes the place of the button just pressed, which is often at the foot of the page, under the toolbar dock
  // (review B: the bar opened half hidden at 1366 and on a phone). Brought to the middle of its scroller once, as it opens.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "center" }); }, []); // braces: Chrome returns a promise from scrollIntoView
  return (
    <div ref={ref} data-guide="confirm-lock" role="alertdialog" aria-label={message} className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[13px] text-[#78350F] ${className}`}>
      <span className="min-w-0 flex-1 basis-full font-medium sm:basis-0">{message}</span>
      <button type="button" autoFocus onClick={onYes} className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 focus-ring">{yes}</button>
      <button type="button" onClick={onNo} className="h-9 rounded border border-[#D1D5DB] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:bg-[#F7F8FA] focus-ring">Not yet</button>
    </div>
  );
}
