"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi } from "@/lib/auth";
import { getCaptchaToken } from "@/lib/recaptcha";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icon";

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await getCaptchaToken("signin");
      const { accessToken } = await authApi.signin({ email, password, captchaToken });
      const me = await signIn(accessToken);
      router.replace(me.isProfileComplete ? "/app" : "/complete-profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Welcome back</h1>
      <p className="text-[13px] text-slate-500 mt-1">Sign in to continue your GRC 101 work.</p>

      {error && (
        <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Field label="Email address">
          <TextInput icon="mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint={<Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">Forgot?</Link>}>
          <div className="relative">
            <TextInput icon="lock" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <Icon name="eye" size={16} />
            </button>
          </div>
        </Field>
        <PrimaryBtn type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </PrimaryBtn>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-slate-500">
        New to grcmentor?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
