// F1.1's Onboarding record steps find their table by name (model.ts rmfTable reads "Onboarding record · <table>"
// from the step's output line): steps 1, 4 and 5 fill Assignment, Folders and Week 1 dates; step 6 hands the file in.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RMF } from "./forms";
import { RMF_TABLES, rmfTable, type Step } from "./model";

const desk = JSON.parse(readFileSync(join(__dirname, "../../../public/desk/sample.json"), "utf8"));
const step = (n: number): Step => desk.tasks["F1.1"].steps.find((s: Step) => s.n === n);
assert.deepEqual([1, 4, 5, 6].map((n) => rmfTable(step(n))), [0, 1, 2, null]);
assert.deepEqual(RMF.tables.map((t) => t.title), [...RMF_TABLES]);
console.log("rmf: ok");
