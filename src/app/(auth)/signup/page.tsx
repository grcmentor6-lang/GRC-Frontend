"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { ProfileForm } from "@/components/auth/profile-form";
import { authApi, passwordRules } from "@/lib/auth";
import { getCaptchaToken } from "@/lib/recaptcha";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";

type Step = "account" | "verify" | "profile";

export default function SignUpPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("account");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const rules = passwordRules(password);
  const passOk = rules.every((r) => r.ok);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // terms
  const [showTerms, setShowTerms] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // verify
  const [otp, setOtp] = useState("");

  // Restore wizard position across reloads (survives a refresh on the verify/profile steps).
  useEffect(() => {
    const savedStep = sessionStorage.getItem("grc_signup_step");
    const savedEmail = sessionStorage.getItem("grc_signup_email");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restores the signup step from sessionStorage after mount, so the first render matches the server's
    if (savedEmail) setEmail(savedEmail);
    if (savedStep === "verify" || savedStep === "profile") setStep(savedStep as Step);
  }, []);

  useEffect(() => {
    if (step === "account") return;
    sessionStorage.setItem("grc_signup_step", step);
    sessionStorage.setItem("grc_signup_email", email);
  }, [step, email]);

  // If a session already exists (e.g. reloaded after email verification), resume correctly:
  // complete profiles go to the app; incomplete ones jump straight to the profile step.
  useEffect(() => {
    if (loading || !user) return;
    if (user.isProfileComplete) {
      sessionStorage.removeItem("grc_signup_step");
      sessionStorage.removeItem("grc_signup_email");
      router.replace("/app");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- moves to the profile step once the signed-in user has loaded
      setStep("profile");
    }
  }, [loading, user, router]);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOk || !passwordsMatch) return;
    run(async () => {
      const captchaToken = await getCaptchaToken("signup_start");
      await authApi.signupStart({ email, password, captchaToken, accessCode: accessCode.trim() });
      setStep("verify");
    });
  };

  const submitVerify = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { accessToken } = await authApi.signupVerifyEmail({ email, otp });
      // signIn, not setAccessToken: the token must never get ahead of the context user, or
      // ProfileForm below seeds its fields from the *previous* account's profile.
      await signIn(accessToken);
      setStep("profile");
    });
  };

  const resendOtp = () =>
    run(async () => {
      const captchaToken = await getCaptchaToken("signup_resend_otp");
      await authApi.signupResendOtp({ email, captchaToken });
    });

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      <StepDots step={step} />

      {error && (
        <div role="alert" className="mb-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {step === "account" && (
        <>
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-[13px] text-slate-500 mt-1">Start GRC 101 — it takes a minute.</p>
          <form onSubmit={submitAccount} className="mt-5 space-y-4">
            <Field label="Email address">
              <TextInput icon="mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <TextInput icon="lock" type={show ? "text" : "password"} name="password" id="signup-password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
                <button type="button" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <Icon name="eye" size={16} />
                </button>
              </div>
            </Field>
            <ul className="grid grid-cols-2 gap-1.5">
              {rules.map((r) => (
                <li key={r.label} className="flex items-center gap-1.5 text-[11.5px]">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"}`}>
                    <Icon name="check" size={10} strokeWidth={2.5} />
                  </span>
                  <span className={r.ok ? "text-slate-600" : "text-slate-400"}>{r.label}</span>
                </li>
              ))}
            </ul>
            <Field label="Confirm password">
              <TextInput
                icon="lock"
                type={show ? "text" : "password"}
                name="confirm-password"
                id="signup-confirm-password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="mt-1.5 block text-[11.5px] text-rose-600">Passwords don&apos;t match</span>
              )}
            </Field>
            <Field label="Access code">
              <TextInput icon="lock" type="text" autoComplete="off" required value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Invite-only — enter your access code" />
              <span className="mt-1.5 block text-[11.5px] text-slate-400">grcmentor is invite-only during early access. Don&apos;t have a code? Ask whoever invited you.</span>
            </Field>
            <PrimaryBtn type="submit" disabled={busy || !passOk || !passwordsMatch || !accessCode.trim()} className="w-full">
              {busy ? "Sending code…" : "Continue"}
            </PrimaryBtn>
          </form>
          <p className="mt-5 text-center text-[12.5px] text-slate-500">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">Sign in</Link>
          </p>
        </>
      )}

      {step === "verify" && (
        <>
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Verify your email</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            We sent a code to <span className="font-medium text-slate-700">{email}</span>.
          </p>
          <form onSubmit={submitVerify} className="mt-5 space-y-4">
            <Field label="Verification code">
              <TextInput inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
            </Field>
            <PrimaryBtn type="submit" disabled={busy} className="w-full">
              {busy ? "Verifying…" : "Verify & continue"}
            </PrimaryBtn>
          </form>
          <button onClick={resendOtp} disabled={busy} className="mt-4 w-full text-center text-[12.5px] text-slate-500 hover:text-indigo-600">
            Didn&apos;t get it? Resend code
          </button>
        </>
      )}

      {step === "profile" && (
        <>
          <ProfileForm disabled={!agreedTerms} footer={
          <div className="flex items-start gap-2">
            <input
              id="agree-terms"
              type="checkbox"
              checked={agreedTerms}
              readOnly
              onClick={(e) => {
                e.preventDefault();
                if (!agreedTerms) setShowTerms(true);
                else setAgreedTerms(false);
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/60 cursor-pointer"
            />
            <label htmlFor="agree-terms" className="text-[12.5px] text-slate-600 leading-snug">
              I have read and accept the{" "}
              <button type="button" onClick={() => setShowTerms(true)} className="font-medium text-indigo-600 hover:text-indigo-700">
                Terms &amp; Conditions
              </button>
              .
            </label>
          </div>
          } />
        </>
      )}

      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setAgreedTerms(true);
            setShowTerms(false);
          }}
        />
      )}
    </div>
  );
}

const TERMS = [
  {
    title: "Training, not advice",
    body: "grcmentor is a career-readiness platform. Its simulated engagements, grades, and certificates are for learning and do not constitute professional GRC, legal, or audit advice.",
  },
  {
    title: "Your own work",
    body: "Everything I submit is my own. AI-detected plagiarism or shared answers may void my badges and certificate.",
  },
  {
    title: "AI grading",
    body: "My submissions are reviewed and scored by an automated AI mentor. There is no human grader in the loop.",
  },
  {
    title: "Personal access code",
    body: "My access code is invite-only and tied to me. I won't share it or let anyone else use my account.",
  },
  {
    title: "Data & privacy",
    body: "grcmentor stores my profile and progress to run the program and compile my CV, badges, and certificate, as described in the Privacy Policy.",
  },
  {
    title: "Fair use",
    body: "I accept the Terms of Service and understand accounts may be suspended for abuse or misuse of the platform.",
  },
];

function TermsModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => TERMS.map(() => false));
  const count = checked.filter(Boolean).length;
  const allChecked = count === TERMS.length;

  // Escape to close + lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl ring-1 ring-slate-200 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] motion-safe:animate-[popIn_.22s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 id="terms-title" className="text-[17px] font-semibold tracking-tight text-slate-900">
              Terms &amp; Conditions
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">Tick each box below to accept and continue.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-0.5 grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-3.5 pb-3">
          <div className="flex items-center justify-between text-[11.5px] font-medium">
            <span className="text-slate-500">Accepted</span>
            <span className={allChecked ? "text-emerald-600" : "text-slate-600"}>
              {count} of {TERMS.length}
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out ${allChecked ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${(count / TERMS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Clauses */}
        <div className="flex-1 overflow-y-auto px-6 pt-1 pb-4 space-y-2">
          {TERMS.map((t, i) => {
            const on = checked[i];
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                className={`group w-full text-left flex items-start gap-3 rounded-xl p-3 ring-1 transition-colors ${
                  on
                    ? "bg-indigo-50/60 ring-indigo-200"
                    : "bg-white ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
                }`}
              >
                {/* ponytail: styled span, not an <input> — the whole row is the button */}
                <span
                  className={`mt-0.5 shrink-0 grid place-items-center w-5 h-5 rounded-[5px] ring-1 transition-colors ${
                    on
                      ? "bg-indigo-600 ring-indigo-600 text-white"
                      : "bg-white ring-slate-300 group-hover:ring-indigo-400"
                  }`}
                >
                  {on && <Icon name="check" size={12} strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium tracking-tight text-slate-900">{t.title}</span>
                  <span className="block mt-0.5 text-[12.5px] leading-snug text-slate-500">{t.body}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <PrimaryBtn type="button" disabled={!allChecked} onClick={onAccept} className="w-full">
            {allChecked ? "Accept & continue" : "Accept all terms to continue"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["account", "verify", "profile"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {steps.map((s, i) => (
        <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-indigo-500" : "bg-slate-200"}`} />
      ))}
    </div>
  );
}
