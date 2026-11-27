"use client";

import { isoDmy } from "@/lib/dates";
import { Icon } from "@/components/ui/icon";
import { ACCESS_WEEKS, SHARE_BONUS_WEEKS } from "@/lib/programme";
import { useAuth } from "@/components/auth/auth-provider";

/** Formats an ISO yyyy-mm-dd as e.g. "5 Jan 2027". */
export function formatAccessDate(iso: string | null): string | null {
  if (!iso) return null;
  return isoDmy(iso);
}

/**
 * Small "Access until {date}" pill reading the current user's window.
 * `dark` = on the brand-gradient hero; light = on white cards. Renders nothing until a start_date exists.
 */
export function AccessChip({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { user } = useAuth();
  const label = formatAccessDate(user?.accessExpiresOn ?? null);
  if (!label) return null;

  const expired = new Date(user!.accessExpiresOn!) < new Date();
  const dark = variant === "dark";

  const cls = expired
    ? dark
      ? "bg-rose-500/20 text-rose-100 ring-rose-300/30"
      : "bg-rose-50 text-rose-700 ring-rose-100"
    : dark
      ? "bg-white/10 text-indigo-50 ring-white/20"
      : "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <span
      // How the date is made (tester, L-02: it read as a second start date when the LinkedIn weeks were in it unsaid).
      title={`${ACCESS_WEEKS} weeks from your first start date${user?.linkedinShareClaimed ? `, plus ${SHARE_BONUS_WEEKS} weeks for your LinkedIn share` : ""}. Moving your due dates does not change it.`}
      className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11.5px] font-medium tracking-tight ring-1 ${cls}`}
    >
      <Icon name="calendar" size={12} />
      {expired ? "Access ended" : "Access until"} {label}
    </span>
  );
}
