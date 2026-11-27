// Run: npx tsx src/lib/desk/checkpoints.test.ts
// The record's area lines and the Certification page's map all come from his workbook (LI101 rebuild).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { areasOf, type Desk } from "./model";
import { liMap, standing, workIn } from "./li";
import type { Progress } from "./progress";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;

// The pack's human checkpoints HC1-HC6 are gone (owner, 27 Nov 2026): no week, task or screen carries one.
assert.ok(!desk.weeks.some((w) => "hc" in w) && !desk.order.some((id) => "hc" in desk.tasks[id]));
assert.ok(!desk.sections.home.tools.some((t) => /checkpoint/i.test(t.n)) && !("home|Checkpoints" in desk.tp));
assert.ok(!/HC[1-6]|Checkpoints?/.test(JSON.stringify([desk.weeks, desk.tasks, desk.tp, desk.sections])));

// Area lines: his "Responsibility" head, split on ";".
assert.deepEqual(areasOf("Regulatory research; framework mapping"), ["Regulatory research", "Framework mapping"]);
assert.deepEqual(areasOf("Professional conduct and data-handling discipline (prerequisite for all intern duties)"), ["Professional conduct and data-handling discipline"]);
assert.deepEqual(areasOf("Framework mapping — the SoA as the bridge between risk and controls"), ["Framework mapping"]);
for (const id of desk.order) assert.ok(areasOf(desk.tasks[id].resp).length, id);

// The Certification page: 25 clause requirements and 93 Annex A controls, each implemented by a real task.
const li = liMap(desk);
assert.equal(li.clauses.length, 25);
assert.equal(li.controls.length, 93);
assert.deepEqual([...new Set(li.controls.map((c) => c.theme))].sort(), ["Organizational", "People", "Physical", "Technological"]);
for (const r of [...li.clauses, ...li.controls]) assert.ok(workIn(r.tasks).every((t) => desk.tasks[t]) && workIn(r.tasks).length, r.ref);
assert.equal(li.clauses.find((c) => c.ref === "6.1.3")?.docs, "Risk treatment process; Statement of Applicability");
assert.ok(!/LI-\d\d|extension|SOC 2/.test(li.intro + li.levels));
assert.deepEqual(workIn("T10.2, T3.2–T10.2 control sprints"), ["T10.2", "T3.2"]);
const empty: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {} };
assert.equal(standing(desk, empty, ["F1.3"]).state, "open");
const all = Object.fromEntries(desk.tasks["F1.3"].steps.map((s) => [`F1.3-${s.n}`, true]));
assert.equal(standing(desk, { ...empty, done: all as Progress["done"] }, ["F1.3"]).state, "done");
console.log("checkpoints ok");
