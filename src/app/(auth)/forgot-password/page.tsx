"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi, passwordRules } from "@/lib/auth";
import { getCaptchaToken } from "@/lib/recaptcha";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";

export default function ForgotPasswordPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rules = passwordRules(newPassword);
  const passOk = rules.every((r) => r.ok);

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

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const captchaToken = await getCaptchaToken("password_forgot");
      await authApi.passwordForgot({ email, captchaToken });
      setStage("reset");
    });
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOk) return;
    run(async () => {
      const { accessToken } = await authApi.passwordReset({ email, otp, newPassword });
      await signIn(accessToken);
      router.replace("/app");
    });
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Reset your password</h1>
      <p className="text-[13px] text-slate-500 mt-1">
        {stage === "request"
          ? "Enter your email and we'll send a reset code."
          : `Enter the code sent to ${email} and a new password.`}
      </p>

      {error && (
        <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {stage === "request" ? (
        <form onSubmit={submitRequest} className="mt-5 space-y-4">
          <Field label="Email address">
            <TextInput icon="mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <PrimaryBtn type="submit" disabled={busy} className="w-full">
            {busy ? "Sending…" : "Send reset code"}
          </PrimaryBtn>
        </form>
      ) : (
        <form onSubmit={submitReset} className="mt-5 space-y-4">
          <Field label="Reset code">
            <TextInput inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
          </Field>
          <Field label="New password">
            <TextInput icon="lock" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
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
          <PrimaryBtn type="submit" disabled={busy || !passOk} className="w-full">
            {busy ? "Resetting…" : "Reset password & sign in"}
          </PrimaryBtn>
        </form>
      )}

      <p className="mt-5 text-center text-[12.5px] text-slate-500">
        <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">Back to sign in</Link>
      </p>
    </div>
  );
}
