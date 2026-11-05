"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { CANONICAL, CANONICAL_START, setDeskIdentity, type DeskIdentity } from "./names";

/**
 * A learner's own face on the shared desk (owner, 3 Nov 2026): their mentee ID and their two organisations' names.
 * Everyone works the same tasks, offices, data and answers; only these names differ, so the desk is theirs and a
 * copied answer sheet shows whose it was. Decided by the backend (services/desk_identity.py) and served on GET /me
 * as `deskIdentity`. Absent (a stubbed /me, an older backend) means the canonical sample identity, so every
 * desk test written against M2610-00001, GlobalConnect and LearnTech runs unchanged.
 *
 * The content (public/desk/sample.json, docs, labs, lib/desk/*.json, registers, guides) and the server's answer keys
 * keep the canonical names. The swap itself is in names.ts (no imports, so content modules and lib/api.ts can use
 * it): loadDesk, loadDoc and the lab loader copy what they fetch through `toLearner`; static content modules register
 * with `localizable` and are rewritten in place; lib/api.ts sends /me/desk/decision|rows|message|lab through
 * `toCanon` and reads their replies through `toLearner`.
 */
export { CANONICAL, toLearner, toCanon, type DeskIdentity, type DeskOrg } from "./names";

/**
 * The learner's identity, or the canonical one while /me has none. Calling it also makes that identity the desk's
 * current one (idempotent), so anything that shows desk content calls it before the content loads.
 */
export function useDeskIdentity(): DeskIdentity {
  const { user } = useAuth();
  const base = user?.deskIdentity ?? CANONICAL;
  // Their start date too: the programme-calendar dates the content writes from week 1 = Mon 05 Oct follow it (names.ts).
  const start = user?.startDate?.slice(0, 10);
  const id = useMemo(() => (start && start !== CANONICAL_START ? { ...base, start } : base), [base, start]);
  setDeskIdentity(id);
  return id;
}
