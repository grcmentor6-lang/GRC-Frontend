// Run: npx tsx src/lib/desk/checkpoints.test.ts
// HC1–HC6, the record's area lines and the Certification page's map all come from his workbook (LI101 rebuild).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { areasOf, checkpoints, type Desk } from "./model";
import { liMap, standing, workIn } from "./li";
import type { Progress } from "./progress";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;

// His Weeks sheet, "Human checkpoint".
const HC: Record<string, string[]> = {
  HC1: ["F1.3", "F2.1"], HC2: ["T3.2", "T4.2"], HC3: ["T5.2", "T6.2"],
  HC4: ["T7.1", "T8.1"], HC5: ["T9.2", "T10.2"], HC6: ["T12.1", "T12.2"],
};
const cps = checkpoints(desk.weeks);
assert.deepEqual(Object.fromEntries(cps.map((c) => [c.hc, c.tasks])), HC);
assert.deepEqual(cps.map((c) => c.week), [2, 4, 6, 8, 10, 12]);
// Every task shows the checkpoint that covers it, and no other task shows one.
for (const id of desk.order) assert.equal(desk.tasks[id].hc, Object.keys(HC).find((h) => HC[h].includes(id)) ?? "", id);

// A packRegister naming a checkpoint names the one its task is in (a task in none says who reviews it, in words).
const regs = readFileSync(new URL("./registers.ts", import.meta.url), "utf8");
for (const m of regs.matchAll(/packRegister\("([FT][\d.]+)",[^"]*"(HC\d)"/g)) assert.ok(HC[m[2]].includes(m[1]), `${m[1]} says ${m[2]}`);
// The row keys' notes too.
const rk = JSON.parse(readFileSync(new URL("../../../../backend/_seed/grc101_row_keys.json", import.meta.url), "utf8")) as Record<string, unknown>;
for (const [k, v] of Object.entries(rk))
  for (const h of JSON.stringify(v).match(/\bHC\d\b/g) ?? []) assert.ok(HC[h].includes(k.split("-")[0]), `${k} says ${h}`);

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
