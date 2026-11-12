// seedRows: a step's rows are in place when it opens. Nobody adds a row (owner, 12 Nov 2026: T3.1 step 1 let a
// learner add 17 empty rows where its source holds 2, and the step could then never complete).
import assert from "node:assert/strict";
import { REGISTERS, addRow, isSeeded, removeRow, seedRows, splitRow } from "./registers";

const by = (c: Record<string, string>, n: number) => Array.from({ length: Number(c["#rows"] ?? 0) }, (_, ri) => ri).filter((ri) => c[`${ri},by`] === String(n));

// A fresh learner: the rows are there without any add, stamped with the step, in order.
const adds = REGISTERS["T3.1"].grow!.adds;
assert.deepEqual(adds, { 1: 2, 3: 10, 4: 3 }, "T3.1's sources: 2 offices, 6 + 4 lines, 3 key requirements");
let c = seedRows({}, 1, adds[1]);
assert.equal(c["#rows"], "2");
assert.deepEqual(by(c, 1), [0, 1]);
assert.equal(seedRows(c, 1, adds[1]), c, "opening the step again changes nothing");
c = seedRows(seedRows(c, 3, adds[3]), 4, adds[4]);
assert.deepEqual([c["#rows"], by(c, 3).length, by(c, 4)], ["15", 10, [12, 13, 14]]);

// Saved with fewer rows than the step needs (an older build: the learner had added one): topped up, the typed row kept.
c = seedRows({ "#rows": "1", "0,by": "1", "0,5": "Manila" }, 1, 2);
assert.deepEqual([c["#rows"], c["0,5"], by(c, 1)], ["2", "Manila", [0, 1]]);

// The owner's copy: 17 step-1 rows, 2 of them filled (not the first two), 15 empty. The empty ones go, the typed stay.
let old: Record<string, string> = {};
for (let i = 0; i < 17; i++) old = addRow(old, 1);
old = { ...old, "3,5": "Manila", "3,1": "72h to NPC", "9,5": "Warsaw" };
c = seedRows(old, 1, 2);
assert.deepEqual([c["#rows"], c["0,5"], c["0,1"], c["1,5"]], ["2", "Manila", "72h to NPC", "Warsaw"]);
assert.ok(!Object.keys(c).some((k) => /^(\d+),/.test(k) && Number(k.split(",")[0]) > 1), "nothing left of the dropped rows");

// A typed row is never dropped, even beyond the step's count; other steps' rows are not touched.
old = { "#rows": "4", "0,by": "1", "0,1": "a", "1,by": "1", "1,1": "b", "2,by": "1", "2,1": "c", "3,by": "3" };
c = seedRows(old, 1, 2);
assert.deepEqual([c["#rows"], by(c, 1), by(c, 3)], ["4", [0, 1, 2], [3]]);

// A row the trimming step removed stays removed: the step is topped up once, and the mark survives a split and a removal.
c = seedRows({}, 3, 10);
c = removeRow(splitRow(c, 0, 1, "one and two", { at: 3, len: 5 }, 2, 12), 5);
assert.ok(isSeeded(c, 3));
assert.equal(seedRows(c, 3, 10), c);
assert.equal(by(c, 3).length, 9);
// A copy saved before rows were seeded, with the trimming step already done: never topped up either.
c = seedRows({ "#rows": "8", ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`${i},by`, "3"])) }, 3, 10, true);
assert.equal(c["#rows"], "8");

console.log("seed-rows: ok");
