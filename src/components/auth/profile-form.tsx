"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { authApi } from "@/lib/auth";
import { requestTour } from "@/components/app/guided-tour";
import { TOUR_SEEN_KEY } from "@/components/app/nav";
import { Field, TextInput, Select, PrimaryBtn } from "@/components/ui/forms";
import { UniversitySelect } from "@/components/ui/university-select";
import { COUNTRIES, DIAL_CODES, findCountry } from "@/lib/countries";

const defaultTimezone =
  typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

/**
 * Profile setup form — the single source of truth for completing a profile.
 * Used by signup step 3 and the /complete-profile gate. On success it refreshes the
 * user and lands on the dashboard. Required fields mirror the backend's mandatory set.
 */
export function ProfileForm({
  disabled = false,
  footer,
}: { disabled?: boolean; footer?: React.ReactNode } = {}) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    // Normalised so a legacy free-text value ("india", "IN") still preselects.
    country: findCountry(user?.country)?.name ?? "",
    city: user?.city ?? "",
    phoneCountryCode: user?.phoneCountryCode ?? "+1",
    phoneNumber: user?.phoneNumber ?? "",
    university: user?.university ?? "",
    qualification: user?.qualification ?? "",
    linkedin: user?.linkedin ?? "",
  });
  const setP =
    (k: keyof typeof profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setProfile((p) => ({ ...p, [k]: e.target.value }));

  // Picking a country prefills the dial code — still editable, for people whose number
  // is registered elsewhere than where they live.
  const pickCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = findCountry(e.target.value);
    setProfile((p) => ({
      ...p,
      country: c?.name ?? "",
      phoneCountryCode: c?.dial ?? p.phoneCountryCode,
    }));
  };

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
      // Signup is done — queue the app walkthrough for whenever they first land in the app. Signup
      // ends on checkout, so the app shell can't tell "just signed up" from "signed in again".
      requestTour(TOUR_SEEN_KEY);
      await refreshUser();
      router.replace("/checkout");
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
        <Field label="Country">
          <Select icon="globe" required value={profile.country} onChange={pickCountry}>
            <option value="" disabled>Select a country</option>
            {COUNTRIES.map((c) => <option key={c.iso} value={c.name}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="City"><TextInput icon="mapPin" value={profile.city} onChange={setP("city")} /></Field>
        <Field label="Phone code">
          <Select required value={profile.phoneCountryCode} onChange={setP("phoneCountryCode")}>
            <option value="" disabled>Select a code</option>
            {DIAL_CODES.map((d) => <option key={d.dial} value={d.dial}>{d.label}</option>)}
          </Select>
        </Field>
        <Field label="Phone number"><TextInput icon="phone" required value={profile.phoneNumber} onChange={setP("phoneNumber")} /></Field>
        <Field label="University" className="col-span-2">
          <UniversitySelect required value={profile.university} onChange={setP("university")} />
        </Field>
        <Field label="Qualification" className="col-span-2"><TextInput required value={profile.qualification} onChange={setP("qualification")} placeholder="e.g. BSc Computer Science" /></Field>
        <Field label="LinkedIn" className="col-span-2"><TextInput icon="linkedin" value={profile.linkedin} onChange={setP("linkedin")} placeholder="https://linkedin.com/in/…" /></Field>
        {footer && <div className="col-span-2">{footer}</div>}
        <div className="col-span-2">
          <PrimaryBtn type="submit" disabled={busy || disabled} className="w-full">
            {busy ? "Finishing…" : "Finish & continue to enrolment"}
          </PrimaryBtn>
        </div>
      </form>
    </>
  );
}
