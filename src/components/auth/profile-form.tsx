"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { authApi } from "@/lib/auth";
import { Field, TextInput, PrimaryBtn } from "@/components/ui/forms";

const defaultTimezone =
  typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

/**
 * Profile setup form — the single source of truth for completing a profile.
 * Used by signup step 3 and the /complete-profile gate. On success it refreshes the
 * user and lands on the dashboard. Required fields mirror the backend's mandatory set.
 */
export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    country: user?.country ?? "",
    city: user?.city ?? "",
    phoneCountryCode: user?.phoneCountryCode ?? "+1",
    phoneNumber: user?.phoneNumber ?? "",
    university: user?.university ?? "",
    qualification: user?.qualification ?? "",
    headline: user?.headline ?? "",
    linkedin: user?.linkedin ?? "",
    bio: user?.bio ?? "",
  });
  const setP = (k: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.signupProfile({ ...profile, timezone: defaultTimezone, language: "en" });
      sessionStorage.removeItem("grc_signup_step");
      sessionStorage.removeItem("grc_signup_email");
      await refreshUser();
      router.replace("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Complete your profile</h1>
      <p className="text-[13px] text-slate-500 mt-1">This appears on your CV, badges and certificate.</p>

      {error && (
        <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">{error}</div>
      )}

      <form onSubmit={submit} className="mt-5 grid grid-cols-2 gap-4">
        <Field label="First name"><TextInput required value={profile.firstName} onChange={setP("firstName")} /></Field>
        <Field label="Last name"><TextInput required value={profile.lastName} onChange={setP("lastName")} /></Field>
        <Field label="Country"><TextInput icon="globe" required value={profile.country} onChange={setP("country")} /></Field>
        <Field label="City"><TextInput icon="mapPin" value={profile.city} onChange={setP("city")} /></Field>
        <Field label="Phone code"><TextInput required value={profile.phoneCountryCode} onChange={setP("phoneCountryCode")} placeholder="+1" /></Field>
        <Field label="Phone number"><TextInput icon="phone" required value={profile.phoneNumber} onChange={setP("phoneNumber")} /></Field>
        <Field label="University" className="col-span-2"><TextInput icon="book" required value={profile.university} onChange={setP("university")} /></Field>
        <Field label="Qualification" className="col-span-2"><TextInput required value={profile.qualification} onChange={setP("qualification")} placeholder="e.g. BSc Computer Science" /></Field>
        <Field label="Professional headline" className="col-span-2"><TextInput value={profile.headline} onChange={setP("headline")} placeholder="Aspiring GRC Analyst" /></Field>
        <Field label="LinkedIn" className="col-span-2"><TextInput icon="linkedin" value={profile.linkedin} onChange={setP("linkedin")} placeholder="https://linkedin.com/in/…" /></Field>
        <Field label="Short bio" className="col-span-2"><TextInput required value={profile.bio} onChange={setP("bio")} placeholder="A sentence about you" /></Field>
        <div className="col-span-2">
          <PrimaryBtn type="submit" disabled={busy} className="w-full">
            {busy ? "Finishing…" : "Finish & go to dashboard"}
          </PrimaryBtn>
        </div>
      </form>
    </>
  );
}
