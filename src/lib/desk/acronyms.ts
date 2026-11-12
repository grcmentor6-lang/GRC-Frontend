import TABLE from "./acronyms.json";
import { PAGES, SECTIONS, TOOLS } from "@/components/desk/step-text";

/**
 * Spell an acronym out the first time a view uses it (owner, 12 Nov 2026: "What is PBC?"). Corrections item 119.
 * The same rules as scripts/acronyms.py, which expands task, step, help and knowledge-check text at build time; this
 * copy expands the guide cards, which are written here rather than generated. Keep the two in step: both have the
 * same self-check cases (acronyms.test.ts, `python scripts/acronyms.py`). The table is acronyms.json.
 */
type Entry = { a: string[]; full: string; plural?: string; alt?: string[] };
const FORMS = new Map<string, Entry>((TABLE.acronyms as Entry[]).flatMap((e) => e.a.map((f) => [f, e] as const)));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TOKEN = `(?:${[...FORMS.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})s?`;
// "UTC+1" is a zone, not UTC.
const RE = new RegExp(`(?<![\\w-])(${TOKEN}(?:/${TOKEN})*)(?![\\w+-])`, "g");
const NAMES = [...TABLE.keep, ...SECTIONS, ...TOOLS, ...PAGES].filter((n) => new RegExp(RE.source).test(n)).sort((a, b) => b.length - a.length);
const PROTECT = new RegExp(
  [
    "^\\[LI-\\d+ — [^\\]]+\\]\\s*",
    "Options:.*?(?= Guidance:| Then:|$)",
    "\\*\\*.+?\\*\\*", '"[^"]*"', "“[^”]*”",
    "›\\s*[^,;.›]+",
    ...NAMES.map((n) => `(?<![\\w-])${esc(n)}(?![\\w-])`),
  ].join("|"),
  "g",
);

const norm = (s: string) => s.toLowerCase().replace(/[-‐–]/g, " ").replace(/\s+/g, " ");
const explained = (text: string, start: number, end: number, e: Entry) => {
  const seen = norm(`${text.slice(0, start)} ${text.slice(end, end + 12 + e.full.length)}`);
  return [e.full, ...(e.alt ?? [])].some((x) => seen.includes(norm(x)));
};

/** `text` with each acronym not yet in `seen` spelled out once; `seen` carries a view's acronyms across its strings. */
export function expandAcronyms(text: string, seen: Set<string> = new Set()): string {
  if (!text) return text;
  const guard = [...text.matchAll(PROTECT)].map((m) => [m.index!, m.index! + m[0].length]);
  let out = "", last = 0;
  for (const m of text.matchAll(RE)) {
    const s = m.index!, e = s + m[0].length;
    if (guard.some(([a, b]) => a <= s && s < b)) continue;
    const fulls: string[] = [];
    for (const tok of m[1].split("/")) {
      const plural = !FORMS.has(tok);
      const ent = FORMS.get(plural ? tok.slice(0, -1) : tok)!;
      if (seen.has(ent.a[0])) continue;
      seen.add(ent.a[0]);
      if (!explained(text, s, e, ent)) fulls.push(plural ? (ent.plural ?? `${ent.full}s`) : ent.full);
    }
    if (!fulls.length) continue;
    const end = e + (/^(?:\/[\w-]+)*(?:['’]s(?!\w))?/.exec(text.slice(e))?.[0].length ?? 0);
    const full = fulls.join(" / ");
    if (text[s - 1] === "(" && text[end] === ")") { out += `${text.slice(last, end)}, ${full}`; last = end; }
    else if (text.startsWith(" (", end)) { out += `${text.slice(last, end)} (${full}; `; last = end + 2; }
    else { out += `${text.slice(last, end)} (${full})`; last = end; }
  }
  return out + text.slice(last);
}

type GuideCard = { body: string; steps?: { lead: string; text?: string; fork?: { when: string; then: string }[] }[]; tips?: { text: string }[] };

/** Each guide card set is one view: its cards' text, in reading order, expanded in place. Titles are names the walks key on. */
export function expandGuides(guides: Record<string, GuideCard[]>): void {
  for (const cards of Object.values(guides)) {
    const seen = new Set<string>();
    for (const c of cards) {
      c.body = expandAcronyms(c.body, seen);
      for (const s of c.steps ?? []) {
        s.lead = expandAcronyms(s.lead, seen);
        if (s.text) s.text = expandAcronyms(s.text, seen);
        for (const f of s.fork ?? []) f.then = expandAcronyms(f.then, seen);
      }
      for (const t of c.tips ?? []) t.text = expandAcronyms(t.text, seen);
    }
  }
}
