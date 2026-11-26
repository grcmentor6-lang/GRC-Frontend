// Run: npx tsx src/lib/desk/badges.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BADGES, CAPSTONE, PASS, capstoneStanding, checkMapping, shade, standing, summarise } from "./badges";
import type { Desk } from "./model";
import type { Progress } from "./progress";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;

// Every task except F1.1 earns towards exactly one badge: the family of his "GRC method practised".
assert.deepEqual(checkMapping(desk), []);
// No task's method is M, so nine families have a badge.
assert.equal(BADGES.length, 9);
assert.ok(!BADGES.some((b) => b.code === "BDG-M"));
// Every task a badge names is a real task; every method he names is on a badge (or F1.1's N).
for (const b of BADGES) for (const t of b.earn) assert.ok(desk.tasks[t], `${b.code} names ${t}`);
for (const id of desk.order) if (id !== "F1.1") assert.ok(BADGES.some((b) => b.methods.includes(desk.tasks[id].method)), `${id}: ${desk.tasks[id].method}`);
// No old-programme claim on a badge.
for (const b of [...BADGES, CAPSTONE]) assert.ok(!/SOC 2|Top-5|questionnaire|breach-notification/.test(b.can), b.code);
// The pack's darker edge colour: A's 1F6FB2 → 164F80.
assert.equal(shade("1F6FB2"), "164F80");

const empty: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {} };
const b = BADGES.find((x) => x.code === "BDG-C1")!; // F1.2, T8.2
assert.deepEqual(b.earn, ["F1.2", "T8.2"]);
const sub = { ...empty, submitted: { "F1.2": "x", "T8.2": "x" } };
assert.equal(standing(b, empty).state, "not-started");
// Submitted without released scores: never earned.
assert.equal(standing(b, sub).state, "in-progress");
assert.equal(standing(b, sub, { "F1.2": PASS, "T8.2": 70 }).state, "earned");
assert.equal(standing(b, sub, { "F1.2": PASS - 1, "T8.2": 99 }).state, "in-progress");
// Distinction: average ≥ 85 and none below 75.
assert.equal(standing(b, sub, { "F1.2": 90, "T8.2": 80 }).state, "distinction");
assert.equal(standing(b, sub, { "F1.2": 100, "T8.2": 74 }).state, "earned");
assert.equal(capstoneStanding(empty).state, "not-started");
assert.equal(CAPSTONE.label, "CAP");
// A submitted task the server released no score for (null) counts as unscored, never as earned.
assert.equal(standing(b, sub, { "F1.2": 90, "T8.2": null }).state, "in-progress");
// The one count every page shows: all submitted at 100 → 9 / 9 and the capstone. Without the scores it is 0,
// which is what the Dashboard and the CV showed while they counted from progress alone.
const all = { ...empty, submitted: Object.fromEntries(desk.order.map((t) => [t, "x"])) };
const full = summarise(all, Object.fromEntries(desk.order.map((t) => [t, 100])));
assert.equal(full.earned, 9);
assert.equal(full.capstone.state, "earned");
assert.equal(summarise(all).earned, 0);
console.log("badges ok");
