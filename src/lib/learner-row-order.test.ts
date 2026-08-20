// Per-learner row order: the answer key must survive the shuffle, and the shuffle must actually
// differ between learners. Run: npx tsx src/lib/learner-row-order.test.ts
import assert from "node:assert";
import { learnerRowOrder } from "./rua-engine";

type Row = { id: number; cells: string[]; shouldFlag: boolean };
const ROWS: Row[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  cells: [`item-${i + 1}`],
  // mirrors CRM-003/9.4: rows 5, 7, 11, 12, 15, 17 are the key
  shouldFlag: [5, 7, 11, 12, 15, 17].includes(i + 1),
}));

const A = learnerRowOrder(ROWS, "user-a", "CRM-003", "9.4");
const B = learnerRowOrder(ROWS, "user-b", "CRM-003", "9.4");

// --- the key travels with the row ---------------------------------------------------------
// Validation everywhere is `rows.filter(r => r.shouldFlag)`, so the SET of correct rows must be
// identical no matter the order — otherwise the shuffle would change what counts as a correct
// answer, which would be a far worse bug than the one being fixed.
const keyOf = (rows: Row[]) => rows.filter((r) => r.shouldFlag).map((r) => r.id).sort((x, y) => x - y);
assert.deepEqual(keyOf(A), [5, 7, 11, 12, 15, 17]);
assert.deepEqual(keyOf(B), [5, 7, 11, 12, 15, 17]);
assert.deepEqual(keyOf(A), keyOf(ROWS), "shuffling must not change the answer key");

// no row is lost or duplicated
assert.equal(A.length, ROWS.length);
assert.deepEqual(A.map((r) => r.id).sort((x, y) => x - y), ROWS.map((r) => r.id));

// --- the order actually differs between learners --------------------------------------------
// This is the whole point: "flag the 5th, 7th and 11th rows" must not transfer, because the
// learner never sees row ids — only position.
const posOf = (rows: Row[]) => rows.map((r, i) => (r.shouldFlag ? i : -1)).filter((i) => i >= 0);
assert.notDeepEqual(posOf(A), posOf(B), "two learners must not share the same flag positions");
assert.notDeepEqual(A.map((r) => r.id), B.map((r) => r.id));

// --- stable for one learner ------------------------------------------------------------------
// A moving table would make a revision harder than the first attempt.
assert.deepEqual(
  learnerRowOrder(ROWS, "user-a", "CRM-003", "9.4").map((r) => r.id),
  A.map((r) => r.id),
  "same learner, same step, same order across visits",
);

// different step, same learner -> different order, so one task's layout leaks nothing about another
assert.notDeepEqual(
  learnerRowOrder(ROWS, "user-a", "CRM-003", "9.5").map((r) => r.id),
  A.map((r) => r.id),
);

// --- degenerate inputs -------------------------------------------------------------------------
assert.deepEqual(learnerRowOrder([], "u", "T", "1"), []);
assert.deepEqual(learnerRowOrder([ROWS[0]], "u", "T", "1"), [ROWS[0]]);
// signed-out ("anon") still returns a valid permutation rather than throwing
assert.equal(learnerRowOrder(ROWS, "anon", "T", "1").length, ROWS.length);

console.log("OK learner-row-order");
