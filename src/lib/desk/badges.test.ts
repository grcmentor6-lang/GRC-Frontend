// Run: npx tsx src/lib/desk/badges.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BADGES, CAPSTONE, PASS, capstoneStanding, checkMapping, shade, standing } from "./badges";
import type { Desk } from "./model";
import type { Progress } from "./progress";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;

// The pack's build rule: every task except F1.1 earns towards exactly one badge.
assert.deepEqual(checkMapping(desk), []);
assert.equal(BADGES.length, 10);
// Every task a badge names is a real task.
for (const b of BADGES) for (const t of [...b.earn, ...b.support]) assert.ok(desk.tasks[t], `${b.code} names ${t}`);
// The pack's darker edge colour: A's 1F6FB2 → 164F80.
assert.equal(shade("1F6FB2"), "164F80");

const empty: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {} };
const b = BADGES.find((x) => x.code === "BDG-B")!; // T7.1, T7.2
const sub = { ...empty, submitted: { "T7.1": "x", "T7.2": "x" } };
assert.equal(standing(b, empty).state, "not-started");
// Submitted without released scores: never earned.
assert.equal(standing(b, sub).state, "in-progress");
assert.equal(standing(b, sub, { "T7.1": PASS, "T7.2": 70 }).state, "earned");
assert.equal(standing(b, sub, { "T7.1": PASS - 1, "T7.2": 99 }).state, "in-progress");
// Distinction: average ≥ 85 and none below 75.
assert.equal(standing(b, sub, { "T7.1": 90, "T7.2": 80 }).state, "distinction");
assert.equal(standing(b, sub, { "T7.1": 100, "T7.2": 74 }).state, "earned");
assert.equal(capstoneStanding(empty).state, "not-started");
assert.equal(CAPSTONE.label, "CAP");
console.log("badges ok");
