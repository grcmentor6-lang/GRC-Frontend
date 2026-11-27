// One date format for the learner: DD-MMM-YYYY (05-OCT-2026). Stored values stay as they were (ISO or the pack's DMY).
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10-05" (or a full ISO timestamp's date part) as "05-OCT-2026"; "" when it is not a date. */
export function isoDmy(iso: string | null | undefined): string {
  const m = (iso ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m && +m[2] >= 1 && +m[2] <= 12 ? `${m[3]}-${MON[+m[2] - 1]}-${m[1]}` : "";
}

/** A moment as "27-NOV-2026, 14:05" in the learner's own time zone (hand-in and work-log times); "" when not a date. */
export function whenDmy(iso: string | null | undefined): string {
  const d = new Date(iso ?? "");
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}-${MON[d.getMonth()]}-${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * What a learner may type, to "YYYY-MM-DD" or null: 5-Oct-2026, 05 OCT 2026, 05/10/2026 (day first, never US), 2026-10-05.
 * An impossible day (31-Nov) is null, not rolled over.
 */
export function parseDate(text: string): string | null {
  const t = text.trim().toUpperCase().replace(/[\s/.]+/g, "-");
  let y: number, mo: number, d: number, m: RegExpMatchArray | null;
  if ((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) [y, mo, d] = [+m[1], +m[2], +m[3]];
  else if ((m = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/))) [d, mo, y] = [+m[1], +m[2], +m[3]];
  else if ((m = t.match(/^(\d{1,2})-([A-Z]{3})[A-Z]*-(\d{4})$/)) && MON.includes(m[2])) [d, mo, y] = [+m[1], MON.indexOf(m[2]) + 1, +m[3]];
  else return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d ? `${y}-${pad(mo)}-${pad(d)}` : null;
}
