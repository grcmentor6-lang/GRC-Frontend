import type { Desk, Week } from "./model";
import type { Progress } from "./progress";
import { KC_ALL_OPEN } from "@/lib/flags";

/**
 * The weekly knowledge checks (KC-01, KC-03…KC-11), the Foundation Gate Exam (FGE) and the Final Exam (FEX).
 * The server builds each learner's form and grades it (backend services/desk_kc.py, GET/POST /me/desk/kc/{id}); this
 * file only says, from the desk's own data, which check a week has and whether it is open yet, so the week panel,
 * the week overview and Learn › Knowledge Checks can say so without a request each. The server checks the same rule.
 */

/** "KC-01", or "FGE" from "FGE (Foundation Gate Exam)". */
export const checkOf = (w: Week) => (w.kc ? w.kc.split(" ")[0] : null);

/** The tasks a check waits for: its own week's, both foundation weeks' for the gate exam. */
export function opensAfter(desk: Desk, id: string): string[] {
  const w = desk.weeks.find((x) => checkOf(x) === id);
  if (!w) return [];
  const weeks = id === "FGE" ? [1, 2] : [w.n];
  return desk.order.filter((t) => weeks.includes(desk.tasks[t].week));
}

/** Null when open; otherwise why not, e.g. "Opens once you submit F1.1–F1.3." (services/desk_kc.why_closed). */
export function whyClosed(desk: Desk, p: Progress, id: string): string | null {
  const all = opensAfter(desk, id);
  const missing = all.filter((t) => !p.submitted[t]);
  if (!missing.length) return null;
  const names =
    missing.length === all.length && missing.length > 2
      ? `${missing[0]}–${missing[missing.length - 1]}`
      : missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;
  return `Opens once you submit ${names}.`;
}

export interface KcAttemptStored { n: number; at?: string; score?: number | null; passed?: boolean | null }

/** The stored attempts of a check, as the last load (or the last submission) left them. Display only: the record
 *  re-checks every score on the server. */
export function attemptsOf(p: Progress, id: string): KcAttemptStored[] {
  const e = (p.kc ?? {})[id];
  return Array.isArray(e?.attempts) ? e.attempts : [];
}

export function bestScore(p: Progress, id: string): number | null {
  const s = attemptsOf(p, id).map((a) => a.score).filter((x): x is number => typeof x === "number");
  return s.length ? Math.max(...s) : null;
}

/** What one line of the week panel or the test list says about a check. */
export function kcStatus(desk: Desk, p: Progress, id: string, free = false): { label: string; tone: "closed" | "open" | "done"; why: string | null } {
  // `free`: an account for whom the desk's order is lifted (flags.ts OPEN_DESK_FOR).
  const why = KC_ALL_OPEN || free ? null : whyClosed(desk, p, id);
  const best = bestScore(p, id);
  if (best !== null) return { label: `Best ${best}%`, tone: "done", why };
  if (why) return { label: "Not open yet", tone: "closed", why };
  return { label: "Open", tone: "open", why };
}

/** The address that opens a check on the desk (desk-app.tsx reads it). */
export const kcHash = (id: string) => `#${id}`;
export const KC_HASH = /^#(KC-\d{2}|FGE|FEX)$/;

// What GET and POST /me/desk/kc/{id} return (camelCase after lib/api.ts).
export interface KcQuestion { qid: string; stem: string; options: string[] }
export interface KcResultQuestion extends KcQuestion { reasons: string[]; best: number; pick: number | null; correct: boolean }
export interface KcAttempt { n: number; at: string | null; score: number | null; passed: boolean | null; late: boolean; questions: KcResultQuestion[] }
export interface KcState {
  id: string; title: string; kind: "kc" | "gate" | "final"; week: number; weeks: number[];
  size: number; minutes: number; attemptsAllowed: number; passMark: number | null; opensAfter: string[];
  open: boolean; whyClosed: string | null; attempts: KcAttempt[]; bestScore: number | null; passed: boolean | null;
  /** The next attempt. Its questions are served only once it is started: the clock is the server's. */
  form: { attempt: number; started: boolean; secondsLeft: number; questions: KcQuestion[]; picks: [string, number][] } | null;
}
