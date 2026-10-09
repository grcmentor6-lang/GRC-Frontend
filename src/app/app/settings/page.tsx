"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi, passwordRules, type MePatchRequest } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Icon, type IconName } from "@/components/ui/icon";
import { Field, TextInput, Select, PrimaryBtn } from "@/components/ui/forms";
import { UniversitySelect } from "@/components/ui/university-select";
import { COUNTRIES, DIAL_CODES, findCountry } from "@/lib/countries";
import { CURRENT_PLAN, UPCOMING_PLANS, FOUNDATION_PRICE } from "@/lib/billing";
import { isEntitled } from "@/lib/entitlement";
import { formatAccessDate } from "@/components/app/access-chip";

const TABS: { id: string; label: string; icon: IconName; desc: string }[] = [
  { id: "profile", label: "My Profile", icon: "user", desc: "Name, contact & public details" },
  { id: "password", label: "Change Password", icon: "lock", desc: "Password & security" },
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
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] overflow-hidden">
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
    phoneCountryCode: user?.phoneCountryCode ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    // Normalised so a legacy free-text value ("india", "IN") still preselects.
    country: findCountry(user?.country)?.name ?? "",
    city: user?.city ?? "",
    linkedin: user?.linkedin ?? "",
    university: user?.university ?? "",
    qualification: user?.qualification ?? "",
    bio: user?.bio ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const set =
    (k: keyof MePatchRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = findCountry(e.target.value);
    setForm((f) => ({
      ...f,
      country: c?.name ?? "",
      phoneCountryCode: c?.dial ?? f.phoneCountryCode,
    }));
  };

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
          <Field label="Email address" hint="Verified">
            <div className="relative">
              <TextInput icon="mail" value={user?.email ?? ""} disabled />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"><Icon name="check" size={16} /></span>
            </div>
          </Field>
          <Field label="LinkedIn"><TextInput icon="linkedin" value={form.linkedin ?? ""} onChange={set("linkedin")} /></Field>
          <Field label="Phone code">
            <Select value={form.phoneCountryCode ?? ""} onChange={set("phoneCountryCode")}>
              <option value="">Select a code</option>
              {DIAL_CODES.map((d) => <option key={d.dial} value={d.dial}>{d.label}</option>)}
            </Select>
          </Field>
          <Field label="Phone number"><TextInput icon="phone" value={form.phoneNumber ?? ""} onChange={set("phoneNumber")} /></Field>
          <Field label="Country">
            <Select icon="globe" value={form.country ?? ""} onChange={pickCountry}>
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => <option key={c.iso} value={c.name}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="City"><TextInput icon="mapPin" value={form.city ?? ""} onChange={set("city")} /></Field>
          <Field label="University"><UniversitySelect value={form.university ?? ""} onChange={set("university")} /></Field>
          <Field label="Qualification"><TextInput value={form.qualification ?? ""} onChange={set("qualification")} /></Field>
          <Field label="Short introduction" className="sm:col-span-2"><TextInput value={form.bio ?? ""} onChange={set("bio")} /></Field>
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
            <TextInput icon="lock" type={show ? "text" : "password"} name="current-password" id="settings-current-password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••••" />
          </Field>
          <Field label="New password">
            <div className="relative">
              <TextInput icon="lock" type={show ? "text" : "password"} name="new-password" id="settings-new-password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Enter new password" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Icon name="eye" size={16} />
              </button>
            </div>
          </Field>
          <Field label="Confirm new password">
            <TextInput icon="lock" type={show ? "text" : "password"} name="confirm-new-password" id="settings-confirm-password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" />
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

function BillingPanel() {
  const { user } = useAuth();
  const plan = CURRENT_PLAN;
  const paid = isEntitled(user);
  // The "invoice" is the free seat, so it is dated from when the account was opened.
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const accessLabel = formatAccessDate(user?.accessExpiresOn ?? null);
  const accessExpired = !!user?.accessExpiresOn && new Date(user.accessExpiresOn) < new Date();
  return (
    <div className="space-y-5">
      {/* Current plan — gradient hero */}
      <div className="rounded-2xl overflow-hidden ring-1 ring-indigo-200/60 shadow-[0_8px_30px_-12px_rgba(79,70,229,0.4)]">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-indigo-200">Current plan</span>
                <span className="px-1.5 h-[18px] rounded text-[10px] font-semibold bg-emerald-400/90 text-emerald-950 flex items-center">Active</span>
              </div>
              <h3 className="text-[22px] font-semibold tracking-tight mt-1">{plan.name}</h3>
              <p className="text-[12.5px] text-indigo-100 mt-0.5">{plan.blurb}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[26px] font-semibold tracking-tight">{paid ? "Free" : plan.price}</div>
              <div className="text-[11.5px] text-indigo-200">{paid ? "Beta · full track access" : plan.cycle}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
            {plan.features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 text-[12px] text-indigo-50">
                <Icon name="check" size={13} strokeWidth={2.5} className="text-emerald-300" />
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white px-6 py-3.5 space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Icon name="check" size={14} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
            Foundations course unlocked free for the beta — your certificate and completed work
            stay yours for life.
          </div>
          {accessLabel && (
            <div className="flex items-start gap-2 text-[12px] text-slate-500">
              <Icon name="calendar" size={14} className="text-indigo-500 shrink-0 mt-px" />
              <span>
                {accessExpired ? "Active program access ended on " : "Active program access runs until "}
                <span className="font-medium text-slate-700">{accessLabel}</span> — you have 24 weeks from your start date to work through the 16-week programme.{" "}
                <Link href="/app/badges" className="text-indigo-600 no-underline hover:underline">Share a badge or certificate on LinkedIn</Link> to add 4 weeks.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade preview */}
      <SettingsCard title="Plans & upgrades" desc="Higher tracks unlock as you progress. Pricing is announced before launch.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {UPCOMING_PLANS.map((p) => (
            <div key={p.id} className="rounded-xl ring-1 ring-slate-200 p-4 flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Icon name={p.icon} size={17} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold tracking-tight text-slate-900 flex items-center gap-1.5">
                    {p.programCode}
                    <span className="font-normal text-slate-400">· {p.name}</span>
                  </div>
                  <div className="text-[11.5px] text-slate-400">{p.cycle}</div>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 mt-2.5 leading-snug">{p.blurb}</p>
              <ul className="mt-3 space-y-1.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-slate-600">
                    <Icon name="check" size={12} strokeWidth={2.5} className="text-slate-300 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-4 h-9 rounded-lg ring-1 ring-slate-200 bg-slate-50 text-slate-400 text-[12.5px] font-medium tracking-tight inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Icon name="lock" size={13} />
                {p.price}
              </button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Payment methods — empty (free plan) */}
      <SettingsCard title="Payment methods" desc="Cards on file for paid tracks.">
        <div className="flex items-center gap-3 p-4 rounded-xl ring-1 ring-dashed ring-slate-200 bg-slate-50/40">
          <span className="w-10 h-10 rounded-lg bg-white ring-1 ring-slate-200 text-slate-400 flex items-center justify-center shrink-0">
            <Icon name="creditCard" size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-slate-700">No saved card</div>
            <p className="text-[12px] text-slate-500 mt-0.5">Card details aren&apos;t stored in this preview. They&apos;ll be saved here for future tracks.</p>
          </div>
        </div>
      </SettingsCard>

      {/* Invoices */}
      <SettingsCard title="Invoice history" desc="Receipts for your records.">
        {paid ? (
          <div className="-mx-1">
            <div className="hidden sm:grid grid-cols-[1.4fr_1fr_0.8fr_0.7fr] gap-3 px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400 border-b border-slate-100">
              <span>Invoice</span><span>Date</span><span>Amount</span><span>Status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_0.8fr_0.7fr] gap-x-3 gap-y-1 items-center px-3 py-3">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-slate-800 font-mono">GRC101-FND</div>
                <div className="text-[11.5px] text-slate-500 truncate">Foundations Course — lifetime access</div>
              </div>
              <span className="text-[12.5px] text-slate-600">{joinedDate}</span>
              <span className="text-[13px] font-medium text-slate-800">{paid ? "$0.00" : FOUNDATION_PRICE}</span>
              <span>
                <span className="inline-flex items-center gap-1 px-1.5 h-[19px] rounded text-[10.5px] font-medium bg-emerald-100 text-emerald-700">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />Paid
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <Icon name="download" size={20} />
            </div>
            <div className="text-[13px] font-medium text-slate-700">No invoices yet</div>
            <div className="text-[12px] text-slate-400 mt-0.5">Your enrolment receipt will appear here.</div>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="page-shell">
      <div className="mb-6">
        <Link href="/app" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 no-underline mb-2">
          <Icon name="chevronLeft" size={14} />Back to dashboard
        </Link>
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage your profile, security and billing in one place.</p>
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
                  on ? "bg-white ring-1 ring-slate-200 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)]" : "hover:bg-white/60"
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
          {tab === "billing" && <BillingPanel />}
        </div>
      </div>
    </div>
  );
}
