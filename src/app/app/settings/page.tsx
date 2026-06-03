"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi, passwordRules, type MePatchRequest } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Icon, type IconName } from "@/components/ui/icon";
import { Field, TextInput, PrimaryBtn, GhostBtn } from "@/components/ui/forms";

const TABS: { id: string; label: string; icon: IconName; desc: string }[] = [
  { id: "profile", label: "My Profile", icon: "user", desc: "Name, contact & public details" },
  { id: "password", label: "Change Password", icon: "lock", desc: "Password & security" },
  { id: "notify", label: "Notifications", icon: "bell", desc: "Email, push & SMS alerts" },
  { id: "billing", label: "Billing", icon: "creditCard", desc: "Plan, payment & invoices" },
];

function SettingsCard({
  title,
  desc,
  children,
  footer,
}: {
  title?: string;
  desc?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] overflow-hidden">
      {(title || desc) && (
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          {title && <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>}
          {desc && <p className="text-[12.5px] text-slate-500 mt-0.5">{desc}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  );
}

function Banner({ kind, text }: { kind: "ok" | "err"; text: string }) {
  return (
    <div
      className={`text-[12.5px] rounded-lg px-3 py-2 ring-1 ${
        kind === "ok" ? "text-emerald-700 bg-emerald-50 ring-emerald-100" : "text-rose-700 bg-rose-50 ring-rose-100"
      }`}
    >
      {text}
    </div>
  );
}

function ProfilePanel() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState<MePatchRequest>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    headline: user?.headline ?? "",
    phoneCountryCode: user?.phoneCountryCode ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    country: user?.country ?? "",
    city: user?.city ?? "",
    linkedin: user?.linkedin ?? "",
    university: user?.university ?? "",
    qualification: user?.qualification ?? "",
    bio: user?.bio ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const set = (k: keyof MePatchRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const updated = await authApi.updateMe(form);
      setUser(updated);
      setMsg({ kind: "ok", text: "Profile saved." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof ApiError ? err.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5">
      {msg && <Banner kind={msg.kind} text={msg.text} />}
      <SettingsCard
        title="Personal information"
        desc="Your name and how mentors and recruiters reach you."
        footer={<PrimaryBtn type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</PrimaryBtn>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name"><TextInput value={form.firstName ?? ""} onChange={set("firstName")} /></Field>
          <Field label="Last name"><TextInput value={form.lastName ?? ""} onChange={set("lastName")} /></Field>
          <Field label="Professional headline" className="sm:col-span-2"><TextInput value={form.headline ?? ""} onChange={set("headline")} /></Field>
          <Field label="Email address" hint="Verified">
            <div className="relative">
              <TextInput icon="mail" value={user?.email ?? ""} disabled />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"><Icon name="check" size={16} /></span>
            </div>
          </Field>
          <Field label="LinkedIn"><TextInput icon="linkedin" value={form.linkedin ?? ""} onChange={set("linkedin")} /></Field>
          <Field label="Phone code"><TextInput value={form.phoneCountryCode ?? ""} onChange={set("phoneCountryCode")} placeholder="+1" /></Field>
          <Field label="Phone number"><TextInput icon="phone" value={form.phoneNumber ?? ""} onChange={set("phoneNumber")} /></Field>
          <Field label="Country"><TextInput icon="globe" value={form.country ?? ""} onChange={set("country")} /></Field>
          <Field label="City"><TextInput icon="mapPin" value={form.city ?? ""} onChange={set("city")} /></Field>
          <Field label="University"><TextInput icon="book" value={form.university ?? ""} onChange={set("university")} /></Field>
          <Field label="Qualification"><TextInput value={form.qualification ?? ""} onChange={set("qualification")} /></Field>
          <Field label="Short bio" className="sm:col-span-2"><TextInput value={form.bio ?? ""} onChange={set("bio")} /></Field>
        </div>
      </SettingsCard>
    </form>
  );
}

function PasswordPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const rules = passwordRules(next);
  const passOk = rules.every((r) => r.ok);
  const match = next.length > 0 && next === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOk || !match) return;
    setBusy(true);
    setMsg(null);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      setMsg({ kind: "ok", text: "Password updated." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof ApiError ? err.message : "Could not update password." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {msg && <Banner kind={msg.kind} text={msg.text} />}
      <SettingsCard
        title="Change password"
        desc="Use a strong, unique password you don't use elsewhere."
        footer={<PrimaryBtn type="submit" disabled={busy || !passOk || !match}>{busy ? "Updating…" : "Update password"}</PrimaryBtn>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Current password" className="sm:col-span-2 max-w-[420px]">
            <TextInput icon="lock" type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••••" />
          </Field>
          <Field label="New password">
            <div className="relative">
              <TextInput icon="lock" type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} placeholder="Enter new password" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Icon name="eye" size={16} />
              </button>
            </div>
          </Field>
          <Field label="Confirm new password">
            <TextInput icon="lock" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" />
          </Field>
        </div>
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {rules.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-[12px]">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"}`}>
                <Icon name="check" size={11} strokeWidth={2.5} />
              </span>
              <span className={r.ok ? "text-slate-600" : "text-slate-400"}>{r.label}</span>
            </li>
          ))}
          {confirm.length > 0 && !match && (
            <li className="text-[12px] text-rose-600">Passwords don&apos;t match</li>
          )}
        </ul>
      </SettingsCard>
    </form>
  );
}

function StubPanel({ title }: { title: string }) {
  return (
    <SettingsCard title={title} desc="Coming in a later phase.">
      <div className="flex items-center gap-3 text-slate-500">
        <Icon name="history" size={16} />
        <span className="text-[13px]">This section isn&apos;t wired up yet.</span>
      </div>
    </SettingsCard>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-7">
      <div className="mb-6">
        <Link href="/app" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 no-underline mb-2">
          <Icon name="chevronLeft" size={14} />Back to dashboard
        </Link>
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage your profile, security, notifications and billing in one place.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[232px_1fr] gap-7 items-start">
        <nav className="flex flex-col gap-1">
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`group text-left w-full px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                  on ? "bg-white ring-1 ring-slate-200/80 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)]" : "hover:bg-white/60"
                }`}
              >
                <span className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${on ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:text-slate-700"}`}>
                  <Icon name={t.icon} size={16} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[13.5px] tracking-tight ${on ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>{t.label}</span>
                  <span className="block text-[11.5px] text-slate-400 mt-0.5 leading-snug">{t.desc}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {tab === "profile" && <ProfilePanel />}
          {tab === "password" && <PasswordPanel />}
          {tab === "notify" && <StubPanel title="Notification preferences" />}
          {tab === "billing" && <StubPanel title="Billing" />}
        </div>
      </div>
    </div>
  );
}
