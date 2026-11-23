"use client";

import { useEffect, useState } from "react";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { getCaptchaToken } from "@/lib/recaptcha";
import { useLinkedInVerify } from "@/lib/linkedin-verify";
import { LinkedInGate } from "@/components/waitlist/linkedin-gate";
import { useEmailVerify } from "@/lib/email-verify";
import { EmailVerify } from "@/components/waitlist/email-verify";

// Assessment Board applications ride the waitlist endpoint as a third audience: years of
// experience land in `stage`, the reviewer position in `designation`.

// A mentor may hold several reviewer seats, so the application takes a set. Capped to match
// MAX_REVIEWER_ROLES in backend/app/api/waitlist.py — applying for most of the board is a claim
// nobody can verify.
const MAX_ROLES = 3;

export function ApplyForm({ roles }: { roles: { title: string; code: string }[] }) {
  const [form, setForm] = useState({ name: "", email: "", linkedin: "", years: "" });
  const [positions, setPositions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ alreadyRegistered: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const li = useLinkedInVerify<typeof form>("wl_reviewer");
  // Restore the form after the LinkedIn round-trip, then lock name/email to the verified identity.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- puts the form back after the LinkedIn round-trip
    if (li.restored) setForm((f) => ({ ...f, ...li.restored }));
  }, [li.restored]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- puts the form back after the LinkedIn round-trip
    if (li.identity) setForm((f) => ({ ...f, name: li.identity!.name, email: li.identity!.email }));
  }, [li.identity]);

  // LinkedIn verifies identity (and email) when configured; otherwise fall back to email OTP.
  const em = useEmailVerify();

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  // Editing the email invalidates a prior verification.
  const setEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, email: e.target.value }));
    if (em.sent || em.verified) em.reset();
  };

  const verified = !!li.identity;
  const needsLinkedIn = li.enabled && !verified;
  const needsEmail = !li.enabled && !em.verified;
  const needsVerify = needsLinkedIn || needsEmail;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsVerify) return;
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await getCaptchaToken("waitlist_join");
      const res = await api.post<{ alreadyRegistered: boolean }>(
        "/waitlist",
        {
          audience: "reviewer",
          email: form.email,
          name: form.name,
          linkedin: form.linkedin,
          stage: form.years,
          reviewerRoles: positions,
          captchaToken,
          linkedinToken: li.token,
          emailToken: em.token,
        },
        { noAuth: true, noRefresh: true },
      );
      setDone(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      {done ? (
        <div className="text-center py-10">
          <div className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600">
            <Icon name="check" size={22} strokeWidth={2.5} />
          </div>
          <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">
            {done.alreadyRegistered ? "You've already applied" : "Application received"}
          </h3>
          <p className="mt-2 text-[13.5px] text-slate-500 leading-relaxed max-w-sm mx-auto">
            {done.alreadyRegistered ? (
              <>
                We already have an application from{" "}
                <span className="font-medium text-slate-700">{form.email}</span> — no need to submit
                again. We&apos;ll be in touch.
              </>
            ) : (
              <>
                We review board applications weekly. Expect a reply at{" "}
                <span className="font-medium text-slate-700">{form.email}</span> within five working
                days.
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          {(error || li.error) && (
            <div className="mb-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
              {error || li.error}
            </div>
          )}
          {li.enabled && (
            <div className="mb-5">
              <LinkedInGate identity={li.identity} onStart={() => li.begin(form)} />
              {!verified && (
                <p className="mt-2 text-[11.5px] text-slate-400 text-center">
                  Verify your identity with LinkedIn to apply.
                </p>
              )}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name">
              <TextInput icon="user" required readOnly={verified} value={form.name} onChange={set("name")} placeholder="Jane Okafor" />
            </Field>
            <Field label="Email address">
              <TextInput icon="mail" type="email" required readOnly={verified} value={form.email} onChange={setEmail} placeholder="jane@company.com" />
            </Field>
            {!li.enabled && (
              <EmailVerify email={form.email} hook={em} />
            )}
            <Field label="LinkedIn profile">
              <TextInput icon="linkedin" required value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/…" />
            </Field>
            <Field label="Total years of experience">
              <TextInput icon="history" type="number" min={0} max={60} required value={form.years} onChange={set("years")} placeholder="8" />
            </Field>
            <Field label={`Reviewer positions applied for — choose up to ${MAX_ROLES}`}>
              <div className="rounded-xl ring-1 ring-slate-200/70 bg-white divide-y divide-slate-100 overflow-hidden">
                {roles.map((r) => {
                  const on = positions.includes(r.title);
                  const full = positions.length >= MAX_ROLES && !on;
                  return (
                    <label
                      key={r.code}
                      className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                        full ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={full}
                        onChange={() =>
                          setPositions((p) => (on ? p.filter((t) => t !== r.title) : [...p, r.title]))
                        }
                        className="w-4 h-4 shrink-0 accent-indigo-600"
                      />
                      <span className="text-[13px] text-slate-800 tracking-tight flex-1 leading-snug">
                        {r.title}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">{r.code}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11.5px] text-slate-400">
                {positions.length === 0
                  ? "Apply only for seats your day job qualifies you to judge."
                  : `${positions.length} of ${MAX_ROLES} selected.`}
              </p>
            </Field>
            <PrimaryBtn type="submit" disabled={busy || needsVerify || positions.length === 0} className="w-full">
              {busy ? "Submitting…" : "Submit application"}
            </PrimaryBtn>
          </form>
          <p className="mt-4 text-center text-[11.5px] text-slate-400">
            We use these details only to assess your board application.
          </p>
        </>
      )}
    </div>
  );
}
