"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi } from "@/lib/auth";
import { isoDmy } from "@/lib/dates";
import { deskOpenFor } from "@/lib/flags";
import { catchUp, dueText, isoDay, LATE_RULE } from "@/lib/desk-plan";
import type { Desk } from "@/lib/desk/model";
import type { Progress } from "@/lib/desk/progress";
import { useDesk } from "./desk-context";

/**
 * The catch-up offer (UX101 W1, strategy 8): a learner two or more weeks behind the calendar gets a new plan, not a
 * page of red. "Move my due dates" moves the one start date so the week they are in begins today (PATCH
 * /me/start-date; every due date follows, the access end stays). When twelve weeks no longer fit before the access
 * end there is nothing to move, and the offer is the focus list: the next tasks, in order.
 * A plain desk notice: neutral ground, one rule, no red. Not one of the fourteen forms (docs/FORM_LANGUAGE.md); it
 * carries no authority and nothing in it is editable, so it wears no band, tab or folded corner.
 * ponytail: "Not now" is remembered in this browser, per calendar week, so the offer returns next week.
 */
export function CatchUpCard({ desk, progress, start, accessEnd, onOpenTask, fold }: { desk: Desk; progress: Progress; start: Date; accessEnd: string | null | undefined; /** On the desk: open the task in place. Elsewhere the tasks are links. */ onOpenTask?: (id: string) => void; /** On the desk: one line that opens, already open where there is room (it sits above the work, and a phone has none to spare). */ fold?: boolean }) {
  const { user, refreshUser } = useAuth();
  const offer = catchUp(desk, progress, start, accessEnd);
  const laterKey = `desk-catchup-later:${user?.email ?? ""}`;
  const stamp = offer ? `${isoDay(start)}|${offer.calendar}` : "";
  const [later, setLater] = useState(() => {
    try { return localStorage.getItem(laterKey); } catch { return null; }
  });
  const [open, setOpen] = useState(() => !fold || (typeof window !== "undefined" && window.innerWidth >= 768 && window.innerHeight >= 700));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!offer || !user || deskOpenFor(user.email) || later === stamp) return null;

  const move = async () => {
    if (!offer.newStart) return;
    setBusy(true);
    setError(null);
    try {
      await authApi.setStartDate(offer.newStart);
      await refreshUser(); // the desk remounts on the new start date; this card has nothing left to offer
    } catch (e) {
      setError(e instanceof Error ? e.message : "Your due dates could not be moved. Try again.");
      setBusy(false);
    }
  };
  const notNow = () => {
    try { localStorage.setItem(laterKey, stamp); } catch { /* shown again next visit */ }
    setLater(stamp);
  };
  const btn = "h-9 rounded-lg px-3.5 text-[13px] font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section data-catch-up={offer.newStart ? "move" : "focus"} aria-label="Catch up" className="max-h-[60dvh] shrink-0 overflow-y-auto border-b border-[#DDE1E8] bg-[#F7F8FA] px-4 py-3 text-[13.5px] leading-[1.55] text-[#3F4757]">
      <h2 className="flex items-start justify-between gap-3 text-[14px] font-semibold text-[#111827]">
        <span>
        You are working on week {offer.week}. {offer.calendar > desk.weeks.length ? `By your start date, the ${desk.weeks.length} planned weeks have passed.` : `By your start date, today is in week ${offer.calendar}.`}
        </span>
        {fold && (
          <button type="button" data-catch-up-toggle aria-expanded={open} onClick={() => setOpen((v) => !v)} className="shrink-0 rounded-md border border-[#C9CED8] bg-white px-2.5 py-1 text-[12.5px] font-semibold text-[#3730A3] focus-ring">
            {open ? "Hide" : "Catch-up options"}
          </button>
        )}
      </h2>
      {open && (<>
      <p className="mt-0.5 max-w-[70ch] [text-wrap:pretty]">
        Nothing is lost. {LATE_RULE}
        {accessEnd ? <> Yours ends on <strong className="font-semibold text-[#111827]">{isoDmy(accessEnd)}</strong>{offer.daysLeft !== null && offer.daysLeft >= 0 ? ` (${offer.daysLeft} days from today)` : ""}.</> : null}
      </p>
      {offer.newStart ? (
        <p className="mt-2 max-w-[70ch] [text-wrap:pretty]">
          You can move your due dates so that <strong className="font-semibold text-[#111827]">week {offer.week} starts today</strong>. Every due date and the Calendar follow; your work, your scores and the end of your access stay as they are.
        </p>
      ) : (
        <p className="mt-2 max-w-[70ch] [text-wrap:pretty]">
          Twelve weeks no longer fit before your access ends, so the due dates cannot be moved. Work the tasks in order and hand in as many as you can; these come first.
        </p>
      )}
      <ol className="mt-2 grid gap-1">
        {offer.focus.map((t, i) => {
          const label = <><span className="font-mono text-[12.5px] font-semibold text-[#3730A3]">{t.id}</span> {t.title} <span className="text-[12.5px] text-[#5B6474]">· {t.stepsDone} of {t.steps} steps{t.state === "overdue" ? ` · ${dueText(t).toLowerCase()}` : ""}</span></>;
          return (
            <li key={t.id} className="flex gap-2">
              <span className="w-4 shrink-0 text-right tabular-nums text-[#5B6474]">{i + 1}.</span>
              {i > 0 ? <span>{label}</span> : onOpenTask ? (
                <button type="button" onClick={() => onOpenTask(t.id)} className="text-left underline decoration-[#C7CBF5] underline-offset-2 hover:decoration-[#4338CA] focus-ring">{label}</button>
              ) : (
                <Link href={`/app/desk#${t.id}`} className="text-inherit underline decoration-[#C7CBF5] underline-offset-2 hover:decoration-[#4338CA]">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
      {error && <p role="alert" className="mt-2 text-[13px] font-medium text-[#B42318]">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {offer.newStart && (
          <button type="button" data-catch-up-move onClick={move} disabled={busy} className={`${btn} bg-[#4338CA] text-white hover:brightness-110`}>
            {busy ? "Moving…" : `Move my due dates: week ${offer.week} starts today`}
          </button>
        )}
        <button type="button" data-catch-up-later onClick={notNow} disabled={busy} className={`${btn} border border-[#C9CED8] bg-white text-[#3F4757] hover:bg-[#F3F4F7]`}>
          {offer.newStart ? "Keep my dates for now" : "Hide until next week"}
        </button>
      </div>
      </>)}
    </section>
  );
}

/** The offer on the desk, above the task or week in view. */
export function CatchUpOffer({ accessEnd }: { accessEnd: string | null }) {
  const { desk, progress, start, openTask } = useDesk();
  return <CatchUpCard desk={desk} progress={progress} start={start} accessEnd={accessEnd} onOpenTask={openTask} fold />;
}
