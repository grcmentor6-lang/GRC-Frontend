import { CANONICAL } from "./names";

/**
 * Each learner sees a single-pick question's options in their own order (owner, 3 Nov 2026), so "just pick B"
 * passed between learners means nothing. Same options, reasons and grading: only the order and the letters shown.
 *
 * `order[d]` is the canonical index of the option shown at position d. Everything stored or sent stays canonical
 * (progress.picks / msgs, POST /me/desk/decision and /message, the server's keys); only what is drawn goes through
 * `shown` / `relabel` / `reorderStep`. The canonical learner (identity.ts CANONICAL, whom every desk test runs as)
 * always gets the identity order.
 */
export const CANONICAL_ID = CANONICAL.menteeId;
const L = "ABCDEF";

/** Display position → canonical index: a shuffle seeded by the learner and the question. */
export function optionOrder(menteeId: string, qid: string, n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  if (menteeId === CANONICAL_ID) return order;
  // FNV-1a seed, mulberry32 stream, Fisher–Yates.
  let h = 0x811c9dc5;
  for (const c of `${menteeId}|${qid}`) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** The letter the learner sees for a canonical letter. Anything else ("report", "OK") passes through. */
export function shown(order: number[], canon: string): string {
  const d = order.indexOf(L.indexOf(canon));
  return canon.length === 1 && d >= 0 ? L[d] : canon;
}

/** The canonical letter of the option shown at position d: what is stored and sent. */
export const canonAt = (order: number[], d: number) => L[order[d]];

/**
 * Server feedback that names an option by letter ("Same as A:", "Only option B gives…", "the same reply as A")
 * in the learner's letters. Only those phrasings, so "Annex A" or a sentence's "A" are left alone.
 * ponytail: phrase list, not a parser; the test scans the backend's keys for letters it misses.
 */
export const relabel = (text: string, order: number[]) =>
  text.replace(/\b(same as|same reply as|option) ([A-F])(?![\w\-/]|\.\d)/gi, (_, a: string, c: string) => `${a} ${shown(order, c)}`);

/**
 * A pick step's text with its inline "Options: A) …  B) …  C) …" in the learner's order and letters. If the
 * options cannot be found as written, the list is dropped rather than shown in the canonical order.
 */
export function reorderStep(w: string, opt: string[], order: number[]): string {
  const i = w.indexOf("Options:");
  if (i < 0) return w;
  let at = i, start = -1;
  for (let k = 0; k < opt.length; k++) {
    const j = w.indexOf(`${L[k]}) ${opt[k]}`, at);
    if (j < 0) return w.slice(0, i).trimEnd();
    if (k === 0) start = j;
    at = j + 3 + opt[k].length;
  }
  return w.slice(0, start) + order.map((ci, d) => `${L[d]}) ${opt[ci]}`).join("  ") + w.slice(at);
}
