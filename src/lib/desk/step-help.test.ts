// Every one of the 216 steps has its own Why and hints 1 and 3 (UX101 W9); hint 2 is the step's Sources, which
// step-sources.test.ts holds. That no hint states a key is backend/tests/test_step_hints_no_answers.py.
// Run: npx tsx src/lib/desk/step-help.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hintsOpened, stepHelp } from "./step-help";
import { EMPTY } from "./progress";
import { setDeskIdentity } from "./names";

const desk = JSON.parse(readFileSync(join(import.meta.dirname, "../../../public/desk/sample.json"), "utf8"));
let n = 0;
for (const t of desk.order) for (const s of desk.tasks[t].steps) {
  const h = stepHelp(t, s.n);
  assert.ok(h && h.why.length > 30 && h.h1.length > 20 && h.h3.length > 60, `${t}-${s.n}: help missing or too short`);
  assert.ok(!/§|mentor review|reply within/i.test(h.why + h.h1 + h.h3), `${t}-${s.n}: wording`);
  assert.notEqual(h.why, desk.tasks[t].obj, `${t}-${s.n}: why repeats the objective`);
  n++;
}
assert.equal(n, 216);
assert.equal(hintsOpened(EMPTY, "F1.1", 2), 0);
assert.equal(hintsOpened({ ...EMPTY, hints: { "F1.1-2": 2 } }, "F1.1", 2), 2);
// A learner reads their own organisation names in a hint, never the canonical ones (names.ts).
setDeskIdentity({ menteeId: "M2611-00042", orgs: [
  { key: "A", name: "Corvane Customer Solutions", short: "Corvane", domain: "corvane.example" },
  { key: "B", name: "Brightwell Educational Solutions", short: "Brightwell", domain: "brightwell.example" },
] });
for (const t of desk.order) for (const s of desk.tasks[t].steps) {
  const h = stepHelp(t, s.n)!;
  assert.ok(!/GlobalConnect|LearnTech/.test(h.why + h.h1 + h.h3), `${t}-${s.n}: canonical organisation name shown to a learner`);
}
console.log("ok", n);
