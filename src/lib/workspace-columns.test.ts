/**
 * The mentor reads a register through this. If it reorders wrongly, every cell lands under the
 * wrong heading and the whole review is against the wrong facts — silently, because the table
 * still looks like a table.
 *
 *   npx tsx src/lib/workspace-columns.test.ts
 */
import assert from "node:assert/strict";
import { alignColumns, columnsFor, humaniseKey, rowLabel } from "./workspace-columns";
import { RECORD_TASKS } from "./record-tasks";

// ── the reported case ────────────────────────────────────────────────────────
// BCRP-002/8 as the payload actually stores it, against the form's own order.
const spec = columnsFor("BCRP-002", "8");
assert.ok(spec, "BCRP-002/8 should resolve to a register spec");
assert.deepEqual(
  spec.map((c) => c.key),
  ["item", "kind", "assurance", "cost", "routedTo", "acceptedBy"],
);

const head = ["cost", "item", "kind", "routedTo", "assurance", "acceptedBy"];
const rows = [["", "ICT DR Checklist v1.0", "Checklist filed", "", "Proves the document", ""]];
const out = alignColumns(head, rows, spec);

assert.equal(out.reordered, true);
// In the form's order, and without the three conditional columns this delivery never filled.
assert.deepEqual(out.head, [
  "Item Filed Or Recommended",
  "Type",
  "What It Proves (talk-through = document, live test = capability)",
]);
// The load-bearing assertion: every value must still be under its own key.
assert.deepEqual(out.rows[0], [
  "ICT DR Checklist v1.0",
  "Checklist filed",
  "Proves the document",
]);
for (const [i, label] of out.head.entries()) {
  const key: string = spec.find((c) => c.label === label)!.key;
  assert.equal(out.rows[0][i], rows[0][head.indexOf(key)], `${key} moved to the wrong column`);
}

// A conditional column that one row DOES fill is kept — for every row, blank cells included.
const mixed = alignColumns(
  head,
  [
    ["", "ICT DR Checklist v1.0", "Checklist filed", "", "Proves the document", ""],
    ["STAGE 1: ~2 hours", "Staged live restoration", "Test recommendation", "", "Proves capability", ""],
  ],
  spec,
);
assert.deepEqual(mixed.head, [
  "Item Filed Or Recommended",
  "Type",
  "What It Proves (talk-through = document, live test = capability)",
  "Cost / Disruption",
]);
assert.deepEqual(mixed.rows[0], ["ICT DR Checklist v1.0", "Checklist filed", "Proves the document", ""]);
assert.deepEqual(mixed.rows[1], [
  "Staged live restoration",
  "Test recommendation",
  "Proves capability",
  "STAGE 1: ~2 hours",
]);

// A delivery that is empty everywhere keeps its headers: a table with no columns reads as a bug,
// not as an empty delivery.
const nothing = alignColumns(head, [["", "", "", "", "", ""]], spec);
assert.equal(nothing.head.length, 6, "an empty delivery must still show what was asked for");

// Same rule without a spec.
const bare = alignColumns(["a", "b", "c"], [["x", "", "z"]], null);
assert.deepEqual(bare.head, ["A", "C"]);
assert.deepEqual(bare.rows[0], ["x", "z"]);

// ── row naming ───────────────────────────────────────────────────────────────
// The reported symptom: three rows called "" and one called by a paragraph.
assert.equal(rowLabel(["", "ICT DR Checklist v1.0", "Checklist filed"], 0), "ICT DR Checklist v1.0");
assert.equal(rowLabel(["", "", ""], 2), "Row 3");
assert.equal(rowLabel(["x".repeat(200)], 0).length, 80);
assert.ok(rowLabel(["x".repeat(200)], 0).endsWith("…"));

// ── no spec: still readable, never reordered ─────────────────────────────────
const plain = alignColumns(["routedTo", "data_held", "asset"], [["a", "b", "c"]], null);
assert.deepEqual(plain.head, ["Routed to", "Data held", "Asset"]);
assert.deepEqual(plain.rows, [["a", "b", "c"]], "a spec-less table must not be reordered");
assert.equal(plain.reordered, false);

assert.equal(humaniseKey("acceptedBy"), "Accepted by");
// An acronym keeps its case rather than becoming "Iso27001".
assert.equal(humaniseKey("ISO27001Ref"), "ISO27001 ref");
assert.equal(humaniseKey(""), "");

// ── keys the spec does not know are kept, not dropped ────────────────────────
const extra = alignColumns(
  ["surprise", "item", "kind"],
  [["s", "i", "k"]],
  columnsFor("BCRP-002", "8"),
);
assert.deepEqual(extra.head, ["Item Filed Or Recommended", "Type", "Surprise"]);
assert.deepEqual(extra.rows[0], ["i", "k", "s"]);

// ── every register in the programme survives its own round trip ──────────────
// A payload key order is arbitrary, so reverse each spec's own order and assert the values come
// back where they started. This is what would catch a spec whose keys collide or repeat.
let checked = 0;
for (const [key, task] of Object.entries(RECORD_TASKS)) {
  const keys = task.columns.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length, `${key}: duplicate column keys`);
  const shuffled = [...keys].reverse();
  const row = shuffled.map((k) => `v:${k}`);
  const r = alignColumns(shuffled, [row], task.columns);
  assert.deepEqual(
    r.rows[0],
    keys.map((k) => `v:${k}`),
    `${key}: values landed under the wrong columns`,
  );
  assert.deepEqual(r.head, task.columns.map((c) => c.label), `${key}: wrong labels`);
  checked += 1;
}

console.log(`workspace-columns: ok — ${checked} registers realign without moving a value`);
