// A document's outline in the library (sample.json `library.docs`) and its text on file (public/desk/docs/<id>.md) list
// the same sections. The checks read the outline, the mentee reads the text: a section in one and not the other is a
// heading on screen that the desk refuses (SITL-POL-013 Section 6.3 on T3.2, tester 25 Nov 2026).
// Run: npx tsx src/lib/desk/docs-outline.test.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseDoc } from "./docs";

const pub = join(import.meta.dirname, "../../../public/desk");
const desk = JSON.parse(readFileSync(join(pub, "sample.json"), "utf8"));
const outline = new Map<string, [string, string][]>(desk.library.docs.map((d: [string, string, [string, string][]]) => [d[0], d[2]]));

// Sections the pack's outline names whose text is not held: nothing reads them. A new entry here is a decision, not a fix.
const NO_TEXT: Record<string, string[]> = {
  // The file holds the appendices' text under Section 18: docs.ts reads no "Appendix" heading.
  Charter: ["Appendix A", "Appendix B", "Appendix C", "Appendix D", "Appendix E"],
  "SITL-POL-021": ["11"],
  "SITL-STD-001": ["10"],
};

let n = 0;
for (const f of readdirSync(join(pub, "docs")).filter((x) => x.endsWith(".md"))) {
  const id = f.slice(0, -3);
  const text = parseDoc(readFileSync(join(pub, "docs", f), "utf8"));
  const ol = outline.get(id);
  assert.ok(ol, `${id} has text on file and no outline in the library`);
  const inText = text.map((s) => s.num), inOutline = ol.map(([num]) => num);
  assert.deepEqual(inText.filter((x) => !inOutline.includes(x)), [], `${id}: sections on screen that the outline lacks`);
  assert.deepEqual(inOutline.filter((x) => !inText.includes(x)), NO_TEXT[id] ?? [], `${id}: sections in the outline with no text`);
  // The same headings too: a check that reads "Procedure: …" in the outline must find what the mentee reads.
  for (const s of text) assert.equal(ol.find(([num]) => num === s.num)![1], s.title.replace(/\\([~.<>&#_*-])/g, "$1"), `${id} Section ${s.num}: heading`);
  n++;
}
assert.ok(n >= 17, `only ${n} documents read: the folder has moved`);

// The library index (SITL-POL-000 Section 3) counts each policy's procedures and guidelines: the counts are what the
// policy's outline holds (it said 2 procedures for SITL-POL-013 and SITL-POL-014, which show 3), and its total adds up.
const index = parseDoc(readFileSync(join(pub, "docs", "SITL-POL-000.md"), "utf8")).find((s) => s.num === "3")!.body;
const rows = [...index.matchAll(/^\| (SITL-POL-\d{3}) \|[^|]+\|[^|]+\| (\d+) \| (\d+) \|$/gm)];
assert.equal(rows.length, 24, "the index lists 24 policies");
const count = (id: string, kind: string) => (outline.get(id) ?? []).filter(([, title]) => title.startsWith(`${kind}:`)).length;
for (const [, id, procs, guides] of rows) {
  assert.equal(Number(procs), count(id, "Procedure"), `${id}: procedures in the index`);
  assert.equal(Number(guides), count(id, "Guideline"), `${id}: guidelines in the index`);
}
const total = index.match(/comprises 24 policies, (\d+) procedures and (\d+) guidelines/);
assert.deepEqual(total?.slice(1).map(Number), [rows.reduce((a, r) => a + Number(r[2]), 0), rows.reduce((a, r) => a + Number(r[3]), 0)], "the index's totals");
console.log(`docs-outline ok (${n} documents)`);
