"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/primitives";
import { Field, TextInput, Select, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { getCaptchaToken } from "@/lib/recaptcha";
import { useLinkedInVerify } from "@/lib/linkedin-verify";
import { LinkedInGate } from "@/components/waitlist/linkedin-gate";
import { useEmailVerify } from "@/lib/email-verify";
import { EmailVerify } from "@/components/waitlist/email-verify";
import { FOUNDATION_PRICE } from "@/lib/billing";

// Standalone early-access waitlist. Not linked from anywhere — reachable by /waitlist only.
// One page, two audiences (student / university) sharing a shell and one submit.

type Audience = "student" | "university";

const STAGES = [
  "Student",
  "Career changer",
  "0–2 years in GRC / security",
  "2–5 years in GRC / security",
  "5+ years in GRC / security",
];

const COPY: Record<Audience, { eyebrow: string; title: string; body: string }> = {
  student: {
    eyebrow: "Early access",
    title: "Enrol now with grcmentor",
    body: "Hands-on GRC engagements, checked automatically against answer keys, that compile into a CV, badges and a verifiable certificate. We're onboarding in batches — leave your details and we'll be in touch.",
  },
  university: {
    eyebrow: "University partnership programme",
    title: "Give your students the edge of real-world GRC experience.",
    body: "Hands-on governance, risk and compliance practice on a simulated enterprise engagement — checked automatically against answer keys, with no human review to wait for, standards-aligned, and mapped straight to the roles your graduates want.",
  },
};

export default function WaitlistPage() {
  const [audience, setAudience] = useState<Audience>("student");
  const [form, setForm] = useState({
    // student
    name: "",
    stage: "",
    linkedin: "",
    why: "",
    // university
    institution: "",
    contactName: "",
    designation: "",
    // shared
    email: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ alreadyRegistered: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // LinkedIn verification gates the individual audience only. Universities register a contact
  // person who may not be the one on LinkedIn, so they stay on captcha.
  const li = useLinkedInVerify<typeof form>("wl_student");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- puts the form back after the LinkedIn round-trip
    if (li.restored) setForm((f) => ({ ...f, ...li.restored }));
  }, [li.restored]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- puts the form back after the LinkedIn round-trip
    if (li.identity) setForm((f) => ({ ...f, name: li.identity!.name, email: li.identity!.email }));
  }, [li.identity]);
  // Coming back from LinkedIn is always the individual flow — land on that tab.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- puts the form back after the LinkedIn round-trip
    if (li.identity || li.error) setAudience("student");
  }, [li.identity, li.error]);

  // Individuals verify via LinkedIn when it's on; universities (and the LinkedIn-off fallback)
  // verify by email OTP. Either way, no unverified email is submitted.
  const em = useEmailVerify();

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const setEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, email: e.target.value }));
    if (em.sent || em.verified) em.reset();
  };

  const verified = !!li.identity;
  const studentNeedsLinkedIn = li.enabled && audience === "student" && !verified;
  const emailRequired = audience === "university" || (audience === "student" && !li.enabled);
  const needsEmail = emailRequired && !em.verified;
  const blocked = studentNeedsLinkedIn || needsEmail;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await getCaptchaToken("waitlist_join");
      // Only send the fields this audience actually filled in — the rest stay NULL.
      const res = await api.post<{ alreadyRegistered: boolean }>(
        "/waitlist",
        audience === "university"
          ? {
              audience,
              email: form.email,
              name: form.contactName,
              institution: form.institution,
              designation: form.designation,
              captchaToken,
              emailToken: em.token,
            }
          : {
              audience,
              email: form.email,
              name: form.name,
              stage: form.stage,
              linkedin: form.linkedin,
              why: form.why,
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

  const copy = COPY[audience];
  const firstName = (audience === "university" ? form.contactName : form.name).split(" ")[0];

  return (
    <main className="min-h-screen bg-[#FAFAF7] flex flex-col items-center px-6 py-14">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600">
                <Icon name="check" size={22} strokeWidth={2.5} />
              </div>
              <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
                {done.alreadyRegistered
                  ? "You're already registered"
                  : audience === "university"
                    ? "Thanks — we've got it"
                    : "You're enrolled"}
              </h1>
              <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
                {done.alreadyRegistered ? (
                  <>
                    <span className="font-medium text-slate-700">{form.email}</span>{" "}
                    is already enrolled — no need to submit again. We&apos;ll be in touch.
                  </>
                ) : (
                  <>
                    Thanks{firstName ? `, ${firstName}` : ""}.{" "}
                    {audience === "university" ? "Our partnerships team will reach out to " : "We'll email "}
                    <span className="font-medium text-slate-700">{form.email}</span>
                    {audience === "university"
                      ? " to walk you through the programme."
                      : " the moment early access opens."}
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Audience switch */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 mb-6">
                {(["student", "university"] as Audience[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAudience(a)}
                    aria-pressed={audience === a}
                    className={`flex-1 h-8 rounded-lg text-[12.5px] font-medium tracking-tight transition-colors ${
                      audience === a
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {a === "student" ? "Individual" : "University"}
                  </button>
                ))}
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 ring-1 ring-indigo-100 rounded-full px-2.5 py-1 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {copy.eyebrow}
              </span>
              <h1 className="mt-3 text-[21px] font-semibold tracking-tight text-slate-900 leading-snug">
                {copy.title}
              </h1>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{copy.body}</p>
              {audience === "student" && (
                <div className="mt-5 rounded-xl bg-slate-50/80 ring-1 ring-slate-200/70 px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[30px] font-semibold tracking-[-0.03em] tabular-nums leading-none text-slate-900">{FOUNDATION_PRICE}</span>
                      <span className="text-[12.5px] font-semibold text-slate-400">USD</span>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 bg-white ring-1 ring-slate-200/70 rounded-full px-2 py-1">
                      GRC 101
                    </span>
                  </div>
                  <p className="mt-2 text-[11.5px] text-slate-500 tracking-tight">
                    One-time payment · full track access · no subscription
                  </p>
                </div>
              )}

              {(error || li.error) && (
                <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
                  {error || li.error}
                </div>
              )}

              {audience === "student" && li.enabled && (
                <div className="mt-5">
                  <LinkedInGate identity={li.identity} onStart={() => li.begin(form)} />
                  {!verified && (
                    <p className="mt-2 text-[11.5px] text-slate-400 text-center">
                      Verify your identity with LinkedIn to join.
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                {audience === "student" ? (
                  <>
                    <Field label="Full name">
                      <TextInput icon="user" required readOnly={verified} value={form.name} onChange={set("name")} placeholder="Jane Doe" />
                    </Field>
                    <Field label="Email address">
                      <TextInput
                        icon="mail"
                        type="email"
                        required
                        readOnly={verified}
                        value={form.email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                      />
                    </Field>
                    {!li.enabled && <EmailVerify email={form.email} hook={em} />}
                    <Field label="Where are you in your GRC journey?">
                      <Select icon="target" required value={form.stage} onChange={set("stage")}>
                        <option value="" disabled>
                          Select one
                        </option>
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="LinkedIn">
                      <TextInput
                        icon="linkedin"
                        required
                        value={form.linkedin}
                        onChange={set("linkedin")}
                        placeholder="https://linkedin.com/in/…"
                      />
                    </Field>
                    <Field label="Why do you want in?" hint="optional">
                      <TextInput
                        value={form.why}
                        onChange={set("why")}
                        placeholder="A sentence on what you're hoping to get out of it"
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="University / institution">
                      <TextInput
                        icon="book"
                        required
                        value={form.institution}
                        onChange={set("institution")}
                        placeholder="e.g. University of Manchester"
                      />
                    </Field>
                    <Field label="Contact name">
                      <TextInput
                        icon="user"
                        required
                        value={form.contactName}
                        onChange={set("contactName")}
                        placeholder="Jane Doe"
                      />
                    </Field>
                    <Field label="Designation">
                      <TextInput
                        icon="briefcase"
                        required
                        value={form.designation}
                        onChange={set("designation")}
                        placeholder="e.g. Head of Careers Service"
                      />
                    </Field>
                    <Field label="Email">
                      <TextInput
                        icon="mail"
                        type="email"
                        required
                        value={form.email}
                        onChange={setEmail}
                        placeholder="you@university.ac.uk"
                      />
                    </Field>
                    <EmailVerify email={form.email} hook={em} />
                  </>
                )}

                <PrimaryBtn type="submit" disabled={busy || blocked} className="w-full">
                  {busy
                    ? "Submitting…"
                    : audience === "university"
                      ? "Request partnership details"
                      : "Enrol now"}
                </PrimaryBtn>
              </form>
              <p className="mt-4 text-center text-[11.5px] text-slate-400">
                {audience === "university"
                  ? "We'll only use your details to discuss the partnership programme."
                  : "We'll only use your details to invite you to early access."}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
