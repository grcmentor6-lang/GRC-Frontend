"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useProgress, type Progress } from "@/lib/desk/progress";
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

/** The signed-in mentee's method badges, read from the shared copy of their desk progress. */
export function useMethodBadges(): MethodBadgeSummary {
  const { user } = useAuth();
  const { progress } = useProgress(user?.email ?? "");
  return useMemo(() => summarise(progress), [progress]);
}
