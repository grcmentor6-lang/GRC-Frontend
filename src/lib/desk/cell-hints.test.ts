// A rejected box says the format wanted and one example that is not the answer (owner, 24 Nov 2026). This pins the two
// halves that can break without an error: a check loosened for spelling must still refuse a wrong value, and an example
// must be one its own row's check refuses.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { docLines, docNow, docTable, loadDoc } from "./docs";
import { BRIEFS, REGISTERS, briefSrcOk, srcKind, type BriefSection } from "./registers";

const pub = join(import.meta.dirname, "../../../public");
(globalThis as { fetch: unknown }).fetch = async (u: string) => {
  const f = join(pub, u);
  return { ok: existsSync(f), text: async () => (existsSync(f) ? readFileSync(f, "utf8") : "") };
};
const desk = JSON.parse(readFileSync(join(pub, "desk/sample.json"), "utf8"));

const cell = (reg: string, ci: number) => REGISTERS[reg].cells![ci];
const example = (hint: string) => hint.match(/For example: (.+)\.$/)?.[1];
const SHAPE = /^(Not quite|The document is right)\. The format is: .+\. For example: .+\.$/;
const P6 = "BKB-POL-006 Access Control and Identity Management Policy";
const row = (o: Record<number, string>, n = 12) => Array.from({ length: n }, (_, i) => o[i] ?? "");

async function main() {
  await Promise.all(["BKB-ADD-16", "BKB-POL-000", "BKB-POL-001", "Organization_Profiles"].map(loadDoc));
  let n = 0;
  /** `ok` values are taken, `bad` ones refused, and the hint's own example is among the refused. */
  const check = (what: string, c: ReturnType<typeof cell>, r: string[], by: number, ok: string[], bad: string[], exampleRefused = true) => {
    for (const v of ok) assert.notEqual(c.fix(v, r, desk, 0, by), null, `${what}: "${v}" should be taken`);
    for (const v of bad) assert.equal(c.fix(v, r, desk, 0, by), null, `${what}: "${v}" should be refused`);
    const h = c.hint(r, desk, 0, by);
    assert.match(h, SHAPE, `${what}: ${h}`);
    if (exampleRefused) assert.equal(c.fix(example(h)!, r, desk, 0, by), null, `${what}: the example "${example(h)}" is a value this row takes`);
    n++;
  };

  // T3.1 Evidence ref: the document, the word Section (or Sec), the number.
  check("T3.1 evidence ref", cell("T3.1", 11), row({ 5: "Manila", 11: "x" }), 1,
    ["BKB-ADD-16 Section 2", "BKB-ADD-16 Sec 2", "bkb-add-16, sec. 2", "BKB-ADD-16 Section 2."],
    ["BKB-ADD-16 Section 1", "BKB-ADD-16", "BKB-ADD-36 Section 2", "Section 2"]);

  // T3.1 Source instrument at step 3: every Section 2.1 line and every overlay gets an example from another row.
  for (const ob of [...(docLines("BKB-ADD-16", "2.1") ?? []), ...(docTable("BKB-ADD-16", "6") ?? []).map((x) => x[1])]) check(`T3.1 source, ${ob.slice(0, 30)}`, cell("T3.1", 2), row({ 1: ob }), 3, [], ["zzzz"]);
  assert.equal(n, 11, "the addendum's six Section 2.1 lines and four overlays were read");

  // T3.2: a Procedure section, the gap sentence, the evidence ref.
  check("T3.2 procedure", cell("T3.2", 5), row({ 4: P6 }), 3, ["6.2", "Section 6.2", "Sec. 6.2", "sec 6.2", "6.2.", "none"], ["6", "7.1", "6.9", "Procedure"]);
  check("T3.2 gap sentence", cell("T3.2", 7), row({ 4: P6, 5: "none", 6: "Partial" }), 5,
    ["Missing: procedure. Owner: Group CISO.", "Missing - a procedure; Owner - Group CISO", "missing: procedure, owner: group ciso"],
    ["Missing: procedure. Owner: Group CIO.", "Missing: policy clause. Owner: Group CISO.", "procedure. Group CISO", "Missing: procedure."]);
  check("T3.2 evidence ref", cell("T3.2", 9), row({ 4: P6 }), 6,
    ["BKB-POL-006 Section 4", "BKB-POL-006 Sec. 4", "bkb-pol-006, section 6.2.", "BKB-POL-006 - Section 4"],
    ["BKB-POL-001 Section 3", "BKB-POL-006 Section 99", "BKB-POL-006", "Section 4"]);
  check("T3.2 X procedure", cell("T3.2 X", 5), row({ 4: "BKB-POL-014 Incident Management and Breach Notification Policy" }), 7, [], ["6", "9.9"]);

  // T4.1 LI-POL: each key word's section, typed with or without the word.
  for (const r of REGISTERS["T4.1 LI-POL"].rows) {
    const c = cell("T4.1 LI-POL", 3);
    const num = (docNow("BKB-POL-001") ?? []).map((x) => x.num).find((x) => c.fix(x, r, desk, 0, 7));
    check(`LI-POL ${r[0]}`, c, r, 7, num ? [num, `Sec. ${num}`, `Section ${num}.`] : [], ["99", "Section"]);
  }

  // T5.2 follow-up: R18's words, "two" for 2 and "until" or a dash for "to".
  check("T5.2 follow-up", cell("T5.2 EVP-GAP", 6), row({ 1: "C11" }), 5,
    ["Please send 2 more files for C11 covering 2025-09-05 to 2026-09-04 by 2026-10-02.", "please send two more files for c11 covering 5 September 2025 until 4 September 2026 by 2 October 2026", "Please send 2 more files for C11 covering 2025-09-05 – 2026-09-04 by 2026-10-02"],
    ["Please send files for C11", "Please send 2 more files for C11 covering 2025-09-05 by 2026-10-02", "Please send 3 more files for C11 covering 2025-09-05 to 2026-09-04 by 2026-10-02", "Please send 2 more files for C11 covering last year to now by soon"], false);
  assert.ok(!example(cell("T5.2 EVP-GAP", 6).hint(row({ 1: "C03" }), desk, 0, 5))!.includes("C03"), "the follow-up's example names another control");

  // T12.1 days past due: a whole number, with or without the word.
  check("T12.1 days", cell("T12.1 OPEN", 7), row({}), 5, ["12", "012", "12 days", "1 day", "0"], ["twelve", "12 weeks", "-3", "1234", "3.5"], false);

  // T7.2 gap actions: the example's codes are another clause's.
  for (const r of REGISTERS["T7.2 GAP"].rows) check(`T7.2 gap ${r[0]}`, cell("T7.2 GAP", 4), r, 12, [r[2].split(",")[0].trim().toLowerCase()], ["LI-ZZZ"]);

  // A brief's Source line: a full stop after the citation is not a different citation.
  const sec = { src: () => "Rule L01" } as unknown as BriefSection;
  for (const v of ["Rule L01", "L01", "rule l01.", "Rule L01 "]) assert.ok(briefSrcOk(desk, sec, v), `brief source: "${v}"`);
  for (const v of ["Rule L02", "Rule", "L1", "Rule L01 Section 2"]) assert.ok(!briefSrcOk(desk, sec, v), `brief source: "${v}" refused`);

  // A section worked from a whole document (T3.1 LI-SCOPE, Boundaries): the document alone, or with the section one of
  // its lines reads; never another section, another document or a reference page (owner, 24 Nov 2026).
  const whole = BRIEFS["T3.1 LI-SCOPE"].sections[1];
  for (const v of ["BKB-ADD-16", "BKB-ADD-16 Section 9.1", "bkb-add-16, sec 9.1"]) assert.ok(briefSrcOk(desk, whole, v), `whole document: "${v}" taken`);
  for (const v of ["BKB-ADD-16 Section 2", "Ref-ISMS processes", "BKB-ADD-36", "Section 9.1"]) assert.ok(!briefSrcOk(desk, whole, v), `whole document: "${v}" refused`);
  assert.deepEqual(["Rule L01", "Ref-Sampling", "BKB-ADD-16 Section 9", "BKB-ADD-16"].map(srcKind), ["rule", "page", "section", "document"]);

  console.log(`cell-hints: ok (${n} boxes: variants taken, wrong values refused, examples never the answer)`);
}
main();
