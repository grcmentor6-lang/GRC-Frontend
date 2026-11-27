"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { isoDmy } from "@/lib/dates";
import { accessPhase } from "@/lib/desk-plan";
import { access } from "@/lib/desk/progress-sync";
import { deskOpenFor } from "@/lib/flags";
import { COUNTS } from "@/lib/programme";

/** The learner's access phase; null for admins and the open-desk accounts, who are exempt (backend desk_write_refusal). */
export function useAccessPhase() {
  const { user } = useAuth();
  if (!user || user.role === "admin" || deskOpenFor(user.email)) return null;
  return accessPhase(user.startDate, user.accessExpiresOn);
}

/**
 * After week 12: the grace weeks are counting down; after the access end the desk is read-only. A plain notice, not one
 * of the fourteen forms (docs/FORM_LANGUAGE.md): neutral ground, no band, tab or folded corner; it carries no authority
 * and nothing in it is editable. Mounted on the desk and the dashboard; the desk's copy also switches saving off.
 */
export function AccessBanner({ desk = false }: { desk?: boolean }) {
  const { user } = useAuth();
  const phase = useAccessPhase();
  const ended = phase === "ended";
  useEffect(() => {
    if (!desk) return;
    access.readOnly = ended;
    return () => { access.readOnly = false; };
  }, [desk, ended]);
  if (!user || (phase !== "grace" && !ended)) return null;
  const end = isoDmy(user.accessExpiresOn);
  return (
    <div role="status" data-access={phase} className="border-b border-[#DDE1E8] bg-[#F7F8FA] px-4 py-2 text-[13px] text-[#374151]">
      {ended
        ? <>Your access ended on {end}, so the desk is read-only. You can still open and read everything; nothing new can be saved or handed in. Your record, CV and certificate stay.</>
        : <>Your {COUNTS.weeks} weeks are over. You have until {end} to finish; after that the desk is read-only.</>}
    </div>
  );
}
