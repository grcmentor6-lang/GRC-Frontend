/**
 * How a register cell's value is drawn (redesign, register.html): a register's controlled vocabulary —
 * criticality, tiers, ratings, statuses — reads as a coloured chip, as in a real register; Yes/No in bold;
 * "See description" quiet. Only an exact vocabulary value is toned: free text, however it reads, stays plain.
 * One scale everywhere: grey = routine, blue = noted, green = settled, amber = watch, red = act.
 */
export type CellTone = { kind: "chip"; cls: string } | { kind: "strong" } | { kind: "muted" } | null;

const GREY = "bg-[#F1F2F5] text-[#4B5563]";
const BLUE = "bg-[#E8EAFD] text-[#3730A3]";
const GREEN = "bg-[#DCF5E5] text-[#166534]";
const AMBER = "bg-[#FDECC0] text-[#92400E]";
const RED = "bg-[#FDE4E4] text-[#991B1B]";
const DEEP = "bg-[#FBD0D0] text-[#7F1D1D]";

const WORDS: Record<string, string> = {
  // criticality
  "mission critical": DEEP, "business critical": AMBER, "standard / operational": GREY, standard: GREY, operational: GREY,
  // status
  open: BLUE, "in progress": AMBER, overdue: RED, closed: GREEN, done: GREEN, pending: GREY,
  accept: GREEN, accepted: GREEN, approved: GREEN, reject: RED, rejected: RED,
  pass: GREEN, passed: GREEN, fail: RED, failed: RED,
  met: GREEN, "not met": RED, "partially met": AMBER, partial: AMBER,
  mandatory: BLUE, optional: GREY, covered: GREEN, gap: RED,
  "not applicable": GREY, "n/a": GREY,
};
// Ratings only where the column is a rating: "High" in a notes column is a word, not a level.
const LEVELS: Record<string, string> = { low: GREEN, medium: AMBER, moderate: AMBER, high: RED, "very high": DEEP, critical: DEEP };
const RATING = /sever|likel|impact|rating|priority|level|risk|score|rank|exposure|critical|class/i;
/** A Group tier's chip, the same in a table and in the decision tree's outcome (Tier 1 public … Tier 4 restricted); anything else gets the plain chip. */
const TIER_TONE: Record<string, string> = {
  "1": "border-[#C8ECD5] bg-[#EFFBF3] text-[#166534]",
  "2": "border-[#D0DCF7] bg-[#EFF4FF] text-[#1E40AF]",
  "3": "border-[#F5E3B0] bg-[#FFFAEB] text-[#92400E]",
  "4": "border-[#F7CFCF] bg-[#FEF2F2] text-[#991B1B]",
};
export const tierTone = (v: string) => TIER_TONE[v.match(/Tier (\d)/)?.[1] ?? ""] ?? "border-[#E3E5EA] bg-[#F3F4F6] text-[#374151]";

export function cellTone(value: string, header?: string): CellTone {
  const v = value.trim().replace(/\s*\/\s*/g, " / ").replace(/\.$/, "").toLowerCase();
  if (!v) return null;
  if (v === "yes" || v === "no") return { kind: "strong" };
  if (v === "see description") return { kind: "muted" };
  if (/^tier [1-4]\b/.test(v)) return { kind: "chip", cls: tierTone(value.trim().replace(/^tier/i, "Tier")) };
  if (WORDS[v]) return { kind: "chip", cls: WORDS[v] };
  if (LEVELS[v] && (!header || RATING.test(header))) return { kind: "chip", cls: LEVELS[v] };
  return null;
}
