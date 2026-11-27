// Run: npx tsx src/lib/desk/glossary.test.ts
// Every code and acronym in the desk's learner-facing text has a glossary entry (UX101 W5, G-03 L-09 C-09 R-07).
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { lookup, isSkipped, allEntries, glossParts, setGlossaryDesk, isRowId } from "./glossary";
import { setDeskIdentity } from "./names";
import G from "./glossary.json";
import { REGISTERS } from "./registers";
import { STEP_GUIDES } from "../../components/desk/step-guides";

const desk = JSON.parse(readFileSync("public/desk/sample.json", "utf8"));
setGlossaryDesk(desk);

// What a learner reads: the pack's content without dataset rows and without ids/keys the screen never prints.
const HIDDEN = new Set(["ds", "k", "id", "did", "key", "kind", "type", "sim_notice", "code"]);
const texts: string[] = [];
const walk = (o: unknown, top = false): void => {
  if (typeof o === "string") texts.push(o);
  else if (Array.isArray(o)) o.forEach((x) => walk(x));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!(top && k === "ds") && !HIDDEN.has(k)) walk(v);
};
walk(desk, true);
for (const f of readdirSync("src/lib/desk").filter((f) => /^li-.*\.json$/.test(f))) walk(JSON.parse(readFileSync(`src/lib/desk/${f}`, "utf8")));
walk(REGISTERS);
walk(STEP_GUIDES);
// Each step's Why and hints (UX101 W9): a hint that names a code the glossary cannot explain sends a stuck learner nowhere.
walk(JSON.parse(readFileSync("src/lib/desk/step-help.json", "utf8")));
// The documents the platform wrote itself (UX101 W3): their codes must resolve like any other desk text. The pack's own
// documents are verbatim and cite bodies of law and frameworks the programme does not teach; they are not walked.
for (const d of ["SITL-POL-022", "SITL-POL-024"]) texts.push(readFileSync(`public/desk/docs/${d}.md`, "utf8"));

// A code shape: hyphen/dot-joined capitals, a task or step code, or an all-capitals word.
const SHAPE = /(?<![\w.-])(?:[A-Z][A-Z0-9]*(?:[-.][A-Z0-9]+)+|[FT]\d+\.\d+(?:-[JD]?\d+)?|[A-Z]{2,8}\d?|[A-Z]\d{1,3})(?![A-Za-z0-9_+]|-[A-Z0-9])/g;
const missing = new Map<string, number>();
for (const t of texts.filter((t) => !/data-guide|\[data-|^\[/.test(t))) for (const m of t.matchAll(SHAPE)) {
  const tok = m[0];
  if (isSkipped(tok) || lookup(tok)) continue;
  missing.set(tok, (missing.get(tok) ?? 0) + 1);
}
const list = [...missing].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}×${n}`);
assert.equal(list.length, 0, `codes with no glossary entry (add to glossary.json, or to "skip" if not a term of art): ${list.join(" ")}`);

// The concept codes the reports name are explained by their own entry, not the row-ID catch-all.
for (const c of ["KR1", "KR4", "R10", "R29", "L01", "L20", "LI-Q1", "LI-Q8", "SPR-01", "SPR-13", "SEV1", "SEV4", "TTX", "PDCA", "SoA", "ISMS", "KC-01", "FGE", "FEX", "LI-FAM", "LI-SOA", "CIT-S8", "IR-TTX", "DEC-LOG", "T-LI-FAM", "T-LI-CIT", "SIEM", "DLP", "RTO", "RPO", "BIA", "RACI", "NC", "OFI", "UTC", "UTC+8", "Stage 1", "Stage 2", "maturity level", "evidence pack", "Tech Lab", "sprint", "A.5.24", "T8.1", "SITL-POL-014", "SITL-ADD-16",
  // Phase B's words: the cards, the two hand-in buttons, the locks, the score breakdown, the new documents and profiles.
  "Read first", "Sources for this step", "Save to 02_Working", "Submit task", "Check my answer", "Office entry", "score breakdown", "written cell", "marking guide", "hazard profile", "Framework Quick Reference", "SITL-POL-022", "SITL-POL-024"]) {
  const e = lookup(c);
  assert.ok(e && !isRowId(e), `${c} has no specific entry`);
}
// Data-derived names are the pack's own.
assert.ok(lookup("R19")!.name.includes(desk.rules.R19[0]));
assert.ok(lookup("T8.1")!.name.includes(desk.tasks["T8.1"].title));
assert.ok(lookup("A.5.24")!.name.includes(desk.iso["A.5.24"]));
assert.ok(lookup("LI-Q3")!.def.includes(desk.pages["LI-Q fixed questions"].r[2][1]));

// Shape of the file: every entry has a definition of one or two sentences, a group and a unique id.
const ids = new Set<string>();
for (const e of G.entries) {
  assert.ok(!ids.has(e.id), `duplicate id ${e.id}`); ids.add(e.id);
  assert.ok(e.def.length > 20 && e.group, e.id);
  assert.ok((e.def.match(/[.!?](?:\s|$)/g) ?? []).length <= 4, `${e.id}: definition too long`);
}
assert.ok(allEntries().length >= 80, "the glossary lists 80+ entries");
assert.ok(G.entries.length >= 80, "authored entries");

// Hover parts keep the text whole.
const s = "Apply R19 in sprint 8: KR2, SoA and the SIEM, then LI-A.5.24-01.";
assert.equal(glossParts(s, true).map((p) => p.text).join(""), s);
assert.ok(glossParts(s, true).filter((p) => p.entry).length >= 5);

// A learner's own organisation names reach the definitions (like the other content: names.ts localizable).
const ab = lookup("Org A")!;
assert.ok(ab.def.includes("GlobalConnect"));
setDeskIdentity({ menteeId: "M2611-00042", orgs: [
  { key: "A", name: "Corvane Customer Solutions", short: "Corvane", domain: "corvane.example" },
  { key: "B", name: "Brightwell Educational Solutions", short: "Brightwell", domain: "brightwell.example" }] });
const swapped = JSON.stringify(G.entries);
for (const n of ["GlobalConnect", "LearnTech", "M2610-00001"]) assert.ok(!swapped.includes(n), `${n} still shown to a learner`);
assert.ok(lookup("Org A")!.def.includes("Corvane"));
setDeskIdentity(null);

console.log(`glossary: ok (${G.entries.length} authored, ${allEntries().length} listed)`);
