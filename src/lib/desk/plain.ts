/**
 * Typed text, as a copy check reads it: spacing and case aside, and with the characters no keyboard has taken as
 * what a learner types for them (owner, 17 Nov 2026: T3.1 step 16's "↔", step 17's long dash, T11.1's "≤").
 * "a <-> b" = "a ↔ b", "-" = "—", "<=" = "≤", straight quotes = curly ones.
 */
export const plain = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/×/g, "x")
    .replace(/\s*(?:↔|<-+>|<=>)\s*/g, " <-> ")
    .replace(/\s*(?:→|-+>)\s*/g, " -> ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Copy checks: the same words. */
export const same = (a: string, b: string) => plain(a) === plain(b);
