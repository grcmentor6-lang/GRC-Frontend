"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi } from "@/lib/auth";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";
import { requestTour } from "@/components/app/guided-tour";
import { DESK_TOUR_SEEN_KEY } from "@/components/app/nav";

const todayISO = () => new Date().toISOString().slice(0, 10);

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

/**
 * First-visit gate: the learner picks when their GRC 101 timeline begins (day 0).
 * Shown once, over the dimmed app, until they choose — the whole schedule anchors on it.
 *
 * The choice has to land inside their first week. If they never make it, the backend anchors them
 * to the last day of that window on their next request, so this gate simply stops appearing.
 */
export function StartDateGate() {
  const { user, refreshUser } = useAuth();
  const today = todayISO();
  const deadline = user?.startWindowEndsOn ?? null;
  const [date, setDate] = useState(today);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.setStartDate(date);
      // The desk unlocks on the next render — queue its walkthrough now, before DeskTour exists to
      // hear an event. This is the moment the engagement actually begins.
      requestTour(DESK_TOUR_SEEN_KEY);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't set your start date. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-indigo-600">
          <Icon name="calendar" size={20} />
        </div>
        <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-slate-900">
          Choose your start date to open the Working Desk
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Explore the platform first — then, when you&apos;re ready to begin, pick the day your GRC 101
          engagement starts. Your task deadlines, calendar and progress all count from here.
        </p>

        {deadline && (
          <p className="mt-3 flex items-start gap-2 text-[12.5px] text-amber-900 bg-amber-50 ring-1 ring-amber-100 rounded-lg px-3 py-2">
            <Icon name="clock" size={14} className="text-amber-600 shrink-0 mt-[2px]" />
            <span style={{ textWrap: "pretty" }}>
              Choose any day up to <span className="font-semibold">{longDate(deadline)}</span> — the end of your
              first week. Leave it past then and that date becomes your start date automatically.
            </span>
          </p>
        )}

        {error && (
          <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Start date">
            <TextInput
              type="date"
              required
              min={today}
              max={deadline ?? undefined}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <PrimaryBtn type="submit" disabled={busy} className="w-full">
            {busy ? "Setting up…" : "Set date & open the desk"}
          </PrimaryBtn>
        </form>
      </div>
    </div>
  );
}
