/**
 * The source documents a step tells the mentee to copy from (BKB-ADD-16 §7, BKB-STD-001 §5, …),
 * as text: public/desk/docs/<ID>.md, taken verbatim from the v1.8.8 pack's .docx files. Only the
 * documents steps cite are here; anything else shows its headings from `desk.library`.
 */

export interface DocSection {
  num: string; // "7", "2.1"
  title: string;
  body: string;
}

/** Documents with text on file. */
export const DOC_TEXT = new Set(["BKB-ADD-16", "BKB-ADD-36", "BKB-STD-001", "BKB-ERM-001", "BKB-POL-000", "BKB-POL-014", "BKB-POL-021", "Charter", "Organization_Profiles"]);

const cache = new Map<string, Promise<DocSection[]>>();

export function loadDoc(id: string): Promise<DocSection[]> {
  if (!DOC_TEXT.has(id)) return Promise.resolve([]);
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/desk/docs/${id}.md`).then((r) => (r.ok ? r.text() : "")).then(parseDoc);
    cache.set(id, p);
  }
  return p;
}

/** "7\. Information classification labels" and "2.1 Lead regulator requirements" open a section. */
const HEADING = /^(\d+)\\\.\s+(.+)$|^(\d+\.\d+)\s+(\D.+)$|^(Annex [A-Z]) — (.+)$/;

export function parseDoc(md: string): DocSection[] {
  const out: DocSection[] = [];
  let cur: DocSection | null = null;
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(HEADING);
    if (m) {
      cur = { num: m[1] ?? m[3] ?? m[5], title: (m[2] ?? m[4] ?? m[6]).trim(), body: "" };
      out.push(cur);
    } else if (cur) cur.body += line + "\n";
  }
  return out;
}

const key = (n: string) => n.split(".").map(Number);
const cmp = (a: string, b: string) => {
  const [x, y] = [key(a), key(b)];
  return x[0] - y[0] || (x[1] ?? 0) - (y[1] ?? 0);
};

/**
 * The sections a citation names: "7" is §7 with its sub-sections, "2.1" just that one, and a range
 * "6.2–6.4" everything from 6.2 to 6.4.
 */
export function pick(sections: DocSection[], cite: string): DocSection[] {
  const c = cite.replace(/[.\s]+$/, "");
  const [from, to] = c.split(/[–-]/);
  if (to) return sections.filter((s) => cmp(s.num, from) >= 0 && cmp(s.num, to) <= 0);
  return sections.filter((s) => s.num === c || s.num.startsWith(`${c}.`));
}
