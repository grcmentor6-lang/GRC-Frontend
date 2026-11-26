/**
 * The group was called BKB until 24 Nov 2026 and is SITL now, in its name and in every document code
 * (BKB-POL-006 is SITL-POL-006). Work saved before then still says BKB: typed cells, picked options, the row
 * labels a check was stored under. The database is not rewritten. A saved document is read through
 * `readOldNames` once, where it is loaded (progress-sync.ts), so finished work matches today's keys, and each
 * part goes back up in the new spelling the next time it changes. The server reads the same way
 * (backend app/services/desk_identity.py `read_old_names`).
 *
 * This file and its test are the only places under src/ that may spell the old name (no-old-name.test.ts).
 * ponytail: keys are renamed with their values, and no old key is deleted on the server. Only the keys of the
 * document's sections are saved one by one, and those are step, task and screen ids, which never held the name.
 */
const OLD = /\bbkb\b/gi;

const text = (s: string) =>
  // A picture (the signed undertaking, a screenshot) is a data URL: letters there are not words.
  s.startsWith("data:") ? s : s.replace(OLD, (m) => (m === m.toLowerCase() ? "sitl" : "SITL"));

export function readOldNames<T>(v: T): T {
  if (typeof v === "string") return text(v) as T;
  if (Array.isArray(v)) return v.map(readOldNames) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [text(k), readOldNames(x)])) as T;
  return v;
}
