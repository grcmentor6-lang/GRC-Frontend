"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { ProfileForm } from "@/components/auth/profile-form";
import { authApi, passwordRules } from "@/lib/auth";
import { setAccessToken } from "@/lib/token";
import { getCaptchaToken } from "@/lib/recaptcha";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";

type Step = "account" | "verify" | "profile";

export default function SignUpPage() {
  const { user, loading } = useAuth();
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

  // verify
  const [otp, setOtp] = useState("");

  // Restore wizard position across reloads (survives a refresh on the verify/profile steps).
  useEffect(() => {
    const savedStep = sessionStorage.getItem("grc_signup_step");
    const savedEmail = sessionStorage.getItem("grc_signup_email");
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
      setAccessToken(accessToken);
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
        <div className="mb-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
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
                <TextInput icon="lock" type={show ? "text" : "password"} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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

      {step === "profile" && <ProfileForm />}
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
