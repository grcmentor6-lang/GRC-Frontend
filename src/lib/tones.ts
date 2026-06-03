/** Shared colour tone tables, ported from the mockups. Used across cards, chips and icons. */

export const GLOW: Record<string, string> = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
};

/** Soft icon-badge tones (bg + text + ring). */
export const SOFT_TONES: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
};

export const BAR_TONES: Record<string, string> = {
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-300",
};

/** Verb-chip tones (bg + text + ring) keyed by verb color. */
export const VERB_TONES: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200/70", dot: "bg-indigo-500" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200/70", dot: "bg-violet-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200/70", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200/70", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200/70", dot: "bg-rose-500" },
};

/** Industry/org accent gradients + chips keyed by tone. */
export const LRN_AVATAR: Record<string, string> = {
  indigo: "from-indigo-400 to-violet-500",
  violet: "from-violet-400 to-indigo-500",
  emerald: "from-emerald-400 to-teal-500",
  amber: "from-amber-400 to-orange-500",
  rose: "from-rose-400 to-pink-500",
};
export const LRN_CHIP: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

export type Tone = keyof typeof GLOW;
