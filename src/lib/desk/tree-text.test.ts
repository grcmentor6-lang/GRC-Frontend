// Run: npx tsx src/lib/desk/tree-text.test.ts
// The decision trees drawn as the tree card: BKB-STD-001 Section 5's lines and Ref-Rules R01's ladder cell, on the pack's text.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { blocks, clean, parseDoc } from "./docs";
import { ladderCell, treeRun } from "./tree-text";

const dir = new URL("../../../public/desk/docs/", import.meta.url);
const paras = (body: string) => blocks(body).map((b) => (b.t === "p" ? clean(b.text) : ""));

// BKB-STD-001 Section 5: five questions, then "Otherwise", and the line after the tree left as a paragraph.
const std = parseDoc(readFileSync(new URL("BKB-STD-001.md", dir), "utf8")).find((s) => s.num === "5")!;
const run = treeRun(paras(std.body))!;
assert.equal(run.steps.length, 6);
assert.equal(run.steps[0].then, "Tier 1");
assert.equal(run.steps[1].then, "apply the national scheme (Section 4.1)");
assert.equal(run.steps[3].then, "Tier 3 (or Tier 4 if severe)");
assert.deepEqual(run.steps[5], { q: "Otherwise", then: "Tier 2 (default)", otherwise: true });
assert.equal(run.start, 0);
assert.ok(run.end < paras(std.body).length, "Rate integrity … stays a paragraph");

// Every "decision tree" section in the documents is found; nothing else in them is.
for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
  for (const s of parseDoc(readFileSync(new URL(f, dir), "utf8"))) {
    if (/decision tree/i.test(s.title)) assert.ok(treeRun(paras(s.body)), `${f} Section ${s.num} draws as a tree`);
  }
}
assert.equal(treeRun(["Is it? → Tier 1.", "A plain line."]), null, "no Otherwise, no tree");

// Ref-Rules R01: the words before the ladder, five steps, the last "Otherwise".
const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8"));
const r01 = (desk.pages["Ref-Rules"].r as string[][]).find((r) => r[0] === "R01")![2];
const l = ladderCell(r01)!;
assert.equal(l.lead, 'Ask in this order and stop at the first "yes":');
assert.deepEqual(l.steps.map((x) => x.then), ["Law / regulation", "Certifiable standard", "Attestation framework", "Model contract", "Voluntary framework"]);
assert.equal(l.steps[0].q, "Made by a parliament or a regulator?");
assert.ok(l.steps[4].otherwise);
assert.equal(l.tail, "");
assert.equal(ladderCell("1) Made by a parliament? → Law. 2) Otherwise → Framework. Source: Charter.")?.tail, "Source: Charter.");

// Rows that only use arrows (R14's "1 Trigger received → 2 Check input", R36's "Low → Risk owner") stay text.
for (const r of desk.pages["Ref-Rules"].r as string[][]) if (r[0] !== "R01") assert.equal(ladderCell(r[2]), null, r[0]);
assert.equal(ladderCell(desk.pages["Ref-Test rules"].r[1][1]), null, "(1) … → 7 days is a class table, not questions");

console.log("tree-text: ok");
