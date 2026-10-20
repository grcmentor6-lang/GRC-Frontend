"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { readProgress, type Progress } from "@/lib/desk/progress";
import { BADGES, capstoneStanding, standing, type BadgeStanding, type MethodBadge } from "@/lib/desk/badges";

export interface MethodBadgeSummary {
  rows: { b: MethodBadge; g: BadgeStanding }[];
  earned: number;
  total: number;
  capstone: BadgeStanding;
}

const isEarned = (g: BadgeStanding) => g.state === "earned" || g.state === "distinction";

/** The method badges from a given progress (no scores released yet: the desk does not score tasks). */
export function summarise(p: Progress): MethodBadgeSummary {
  const rows = BADGES.map((b) => ({ b, g: standing(b, p) }));
  return { rows, earned: rows.filter((r) => isEarned(r.g)).length, total: BADGES.length, capstone: capstoneStanding(p) };
}

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/**
 * The signed-in mentee's method badges, read from their desk progress. The stored string is the
 * snapshot (stable between renders); the server renders it empty, so hydration never disagrees.
 */
export function useMethodBadges(): MethodBadgeSummary {
  const { user } = useAuth();
  const who = user?.email ?? "";
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return who ? localStorage.getItem(`grc101.desk.v4.${who}`) : null;
      } catch {
        return null;
      }
    },
    () => null,
  );
  return useMemo(() => summarise(raw ? readProgress(who) : readProgress(null)), [raw, who]);
}
