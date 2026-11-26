// Run: npx tsx src/lib/jobs.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JOBS, deriveJobs } from "./jobs";
import type { Desk } from "./desk/model";
import type { Progress } from "./desk/progress";

const desk = JSON.parse(readFileSync(new URL("../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;

for (const j of JOBS) {
  // GRC 101 works on ISO/IEC 27001 only: no role claims another framework.
  assert.deepEqual(j.standards, ["ISO/IEC 27001:2022"], j.id);
  for (const r of j.responsibilities) {
    assert.ok(desk.tasks[r.task], `${j.id}: ${r.task} is not a task`);
    assert.ok(!/SOC 2|GDPR|vendor questionnaire|awareness campaign pack/i.test(r.duty), `${j.id}: old duty "${r.duty}"`);
  }
}
// Every task but F1.1 backs at least one duty, so the jobs page moves with all of the programme.
const backed = new Set(JOBS.flatMap((j) => j.responsibilities.map((r) => r.task)));
assert.deepEqual(desk.order.filter((t) => t !== "F1.1" && !backed.has(t)), []);

const empty: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {} };
const vendor = (p: Progress) => deriveJobs(p).find((j) => j.id === "vendor-risk-analyst")!;
assert.equal(vendor(empty).match, 0);
assert.equal(vendor({ ...empty, done: { "T7.2-1": true } as Progress["done"] }).match, 50);
assert.equal(vendor({ ...empty, submitted: { "T7.2": "x" } }).match, 100);
console.log("jobs ok");
