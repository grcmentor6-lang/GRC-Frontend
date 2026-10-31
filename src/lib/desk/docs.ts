/**
 * The source documents a step tells the mentee to copy from (BKB-ADD-16 Section 7, BKB-STD-001 Section 5, …),
 * as text: public/desk/docs/<ID>.md, taken verbatim from the v1.8.8 pack's .docx files. Only the
 * documents steps cite are here; anything else shows its headings from `desk.library`.
 */

export interface DocSection {
  num: string; // "7", "2.1"
  title: string;
  body: string;
}

/** Documents with text on file. */
export const DOC_TEXT = new Set(["SRC-EC-MINORS-2025", "SRC-EU-2022-2065", "BKB-TECH-000", "BKB-ADD-16", "BKB-ADD-36", "BKB-STD-001", "BKB-ERM-001", "BKB-POL-000", "BKB-POL-001", "BKB-POL-006", "BKB-POL-010", "BKB-POL-014", "BKB-POL-016", "BKB-POL-013", "BKB-POL-017", "BKB-POL-020", "BKB-POL-021", "Charter", "Organization_Profiles"]);

const cache = new Map<string, Promise<DocSection[]>>();
const ready = new Map<string, DocSection[]>();

/** A document already loaded, for checks that compare a copy with its source (null until then). */
export const docNow = (id: string): DocSection[] | null => ready.get(id) ?? null;

export function loadDoc(id: string): Promise<DocSection[]> {
  if (!DOC_TEXT.has(id)) return Promise.resolve([]);
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/desk/docs/${id}.md`, { cache: "no-cache" }).then((r) => (r.ok ? r.text() : "")).then(parseDoc).then((d) => (ready.set(id, d), d));
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
 * The sections a citation names: "7" is Section 7 with its sub-sections, "2.1" just that one, and a range
 * "6.2–6.4" everything from 6.2 to 6.4.
 */
export function pick(sections: DocSection[], cite: string): DocSection[] {
  const c = cite.replace(/[.\s]+$/, "");
  const [from, to] = c.split(/[–-]/);
  if (to) return sections.filter((s) => cmp(s.num, from) >= 0 && cmp(s.num, to) <= 0);
  return sections.filter((s) => s.num === c || s.num.startsWith(`${c}.`));
}

/** Markdown escapes and the pack's inline bullets ("• a• b") as lines. */
export const clean = (t: string) => t.replace(/\\([~.<>&#_*-])/g, "$1").replace(/\s*•\s*/g, "\n• ").trim();
/** A cell's bullet items, as written: "• a• b" → ["a", "b"]. */
export const bullets = (cell: string) => clean(cell).split("\n").map((x) => x.replace(/^•\s*/, "").trim()).filter(Boolean);

export type Block = { t: "p"; text: string } | { t: "table"; rows: string[][] };
/** A section body as paragraphs and tables (header row first; the |:-:| rule dropped). */
export function blocks(md: string): Block[] {
  const out: Block[] = [];
  let open = false; // inside a table
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) {
      open = false; // a blank line ends a table, so two tables never merge
      continue;
    }
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      const last = out[out.length - 1];
      if (open && last?.t === "table") last.rows.push(cells);
      else out.push({ t: "table", rows: [cells] });
      open = true;
    } else {
      open = false;
      out.push({ t: "p", text: line });
    }
  }
  return out;
}

/** Table `t` of a loaded document's section, body rows only, escapes removed (bullets kept). */
export function docTable(id: string, num: string, t = 0): string[][] | null {
  const sec = docNow(id)?.find((x) => x.num === num);
  if (!sec) return null;
  const tab = blocks(sec.body).filter((b): b is Extract<Block, { t: "table" }> => b.t === "table")[t];
  return tab ? tab.rows.slice(1).map((r) => r.map((c) => c.replace(/\\([~.<>&#_*-])/g, "$1").trim())) : null;
}

/** A loaded section's paragraphs, one per line (Section 1.1's list of services). */
export const docLines = (id: string, num: string): string[] | null => {
  const sec = docNow(id)?.find((x) => x.num === num);
  return sec ? blocks(sec.body).flatMap((b) => (b.t === "p" ? [clean(b.text)] : [])) : null;
};
