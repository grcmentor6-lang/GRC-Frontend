"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useProgress } from "@/lib/desk/progress";
import { useTaskScores } from "@/lib/desk-record";
import { summarise, type MethodBadgeSummary } from "@/lib/desk/badges";

export { summarise, type MethodBadgeSummary };

/**
 * The signed-in mentee's method badges: the shared copy of their desk progress plus the scores released at
 * submission, counted by the same summarise() the Badges page uses. Null until both are read, so a page never
 * shows "0 earned" for work it has not loaded yet.
 */
export function useMethodBadges(): MethodBadgeSummary | null {
  const { user } = useAuth();
  const { progress, status } = useProgress(user?.email ?? "");
  const scores = useTaskScores();
  return useMemo(() => (status === "ready" && scores ? summarise(progress, scores) : null), [progress, status, scores]);
}
