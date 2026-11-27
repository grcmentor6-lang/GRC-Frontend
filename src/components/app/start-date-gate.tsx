"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { isoDmy } from "@/lib/dates";
import { DateField } from "@/components/app/date-field";
import { authApi } from "@/lib/auth";
import { Field, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";
import { requestTour } from "@/components/app/guided-tour";
import { DESK_TOUR_SEEN_KEY } from "@/components/app/nav";
import { accessEndFor, addDays, isoDay, LATE_RULE } from "@/lib/desk-plan";
import { ACCESS_WEEKS, COUNTS } from "@/lib/programme";

const day = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);
const plus = (iso: string, n: number) => isoDay(addDays(day(iso), n));

/** "Keep this date" on the second kind of visit below is remembered here, per account and start date. */
const keptKey = (email: string) => `desk-start-kept:${email}`;
export function startKept(email: string, startIso: string): boolean {
  try {
    return localStorage.getItem(keptKey(email)) === startIso.slice(0, 10);
  } catch {
    return false;
  }
}

/**
 * The start-date screen: the learner says when their twelve weeks begin, before the desk opens. One date; every due
 * date, the Calendar, the Onboarding record in F1.1 and (on a first choice) the end of access are counted from it.
 *
 * Shown on the first desk visit in either of two cases (app/desk/layout.tsx):
 *  - no start date yet: a first choice, inside the learner's first week (the backend's window);
 *  - a start date that has passed with no desk work at all: the backend gives a start date to anyone who has not
 *    chosen one within a week of joining, so a learner who first opens the desk later arrived already "behind"
 *    without ever being asked (tester, L-01, S-01). They choose again, or keep the date. The end of access does not
 *    move when the start does (backend services/schedule.py moved_bonus).
 */
export function StartDateGate({ onKeep }: { /** Chosen "keep" on a start date that has passed: the layout opens the desk. */ onKeep?: () => void }) {
  const { user, refreshUser } = useAuth();
  const today = isoDay(new Date());
  const current = user?.startDate?.slice(0, 10) ?? null;
  // A first choice may be any day of the first week; a second, any day of the coming week.
  const windowEnd = user?.startWindowEndsOn?.slice(0, 10) ?? null;
  const max = current ? plus(today, 7) : windowEnd && windowEnd >= today ? windowEnd : today;
  const monday = plus(today, (8 - new Date().getDay()) % 7 || 7);
  const [date, setDate] = useState(today);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessEnd = current ? (user?.accessExpiresOn?.slice(0, 10) ?? null) : date ? accessEndFor(date) : null;
  const valid = !!date && date >= today && date <= max;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await authApi.setStartDate(date);
      // The desk unlocks on the next render — queue its walkthrough now, before DeskTour exists to
      // hear an event. This is the moment the engagement actually begins.
      requestTour(DESK_TOUR_SEEN_KEY);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your start date could not be set. Try again.");
      setBusy(false);
    }
  };
  const keep = () => {
    try {
      if (user && current) localStorage.setItem(keptKey(user.email), current);
    } catch {
      /* asked again next visit */
    }
    onKeep?.();
  };
  const choice = (iso: string, label: string) => (
    <button
      type="button"
      aria-pressed={date === iso}
      onClick={() => setDate(iso)}
      className={`focus-ring h-11 min-w-0 flex-1 rounded-lg px-3 text-left text-[13px] ring-1 transition-colors ${date === iso ? "bg-indigo-50 text-indigo-800 ring-indigo-300" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
    >
      <span className="block font-semibold leading-tight">{label}</span>
      <span className="block text-[11.5px] tabular-nums leading-tight opacity-80">{isoDmy(iso)}</span>
    </button>
  );

  return (
    <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
      <div data-start-date-gate={current ? "again" : "first"} className="w-full max-w-md bg-white rounded-2xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-5 sm:p-7">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-indigo-600">
          <Icon name="calendar" size={20} />
        </div>
        <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-slate-900">When do your {COUNTS.weeks} weeks start?</h1>
        <p className="text-[14px] text-slate-600 mt-1 leading-[1.5]" style={{ textWrap: "pretty" }}>
          {current ? (
            <>Your plan was set to start on <span className="font-semibold text-slate-900">{isoDmy(current)}</span> and you have not begun yet. Choose the day you really start, so that nothing is late before you begin.</>
          ) : (
            <>Pick the day you begin. Week 1 starts on it, and every due date, your Calendar and the dates in your first task are counted from this one date.</>
          )}
        </p>

        {error && (
          <div role="alert" className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="flex gap-2">
            {choice(today, "Today")}
            {monday <= max && choice(monday, "Next Monday")}
          </div>
          <Field label="Or another day">
            <DateField
              required
              min={today}
              max={max}
              value={date}
              onChange={setDate}
              aria-label="Start date"
              aria-invalid={!!date && !valid}
              className="w-full h-11 px-3.5 rounded-lg bg-white ring-1 ring-slate-200 text-[13.5px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
          </Field>
          <p className="text-[12px] text-slate-500 -mt-2">
            {date && !valid ? <span className="font-medium text-rose-700">Choose a day from {isoDmy(today)} to {isoDmy(max)}.</span> : <>Any day from {isoDmy(today)} to {isoDmy(max)}.</>}
          </p>

          {valid && (
            <dl data-start-preview className="rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3.5 py-3 text-[12.5px] text-slate-600 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 tabular-nums">
              <dt>Week 1</dt>
              <dd className="font-medium text-slate-900">{isoDmy(date)} to {isoDmy(plus(date, 6))}</dd>
              <dt>Week {COUNTS.weeks} ends</dt>
              <dd className="font-medium text-slate-900">{isoDmy(plus(date, COUNTS.weeks * 7 - 1))}</dd>
              {accessEnd && (
                <>
                  <dt>Access until</dt>
                  <dd className="font-medium text-slate-900">{isoDmy(accessEnd)}{current ? " (does not change)" : ` (${ACCESS_WEEKS} weeks from your start)`}</dd>
                </>
              )}
            </dl>
          )}
          <p className="text-[14px] text-slate-500 leading-[1.5]" style={{ textWrap: "pretty" }}>{LATE_RULE}</p>

          <PrimaryBtn type="submit" disabled={busy || !valid} className="w-full">
            {busy ? "Setting up…" : valid ? `Start on ${isoDmy(date)} and open the desk` : "Choose a start date"}
          </PrimaryBtn>
          {current && (
            <button type="button" data-start-keep onClick={keep} disabled={busy} className="focus-ring w-full h-10 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50">
              Keep {isoDmy(current)} and open the desk
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
