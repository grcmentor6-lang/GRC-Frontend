/**
 * Self-check: work saved under the group's old name reads as today's. Run: npx tsx src/lib/desk/old-names.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readOldNames } from "./old-names";

const saved = {
  grids: { "T3.2|frameworks|Crosswalk View": { "2,5": "BKB-POL-017 Section 6", "3,5": "bkb-pol-006, sec. 6.2", "4,2": "Yes" } },
  picks: { "T11.2-8": { "BKB-POL-002": "Amend", "No BKB policy (gap)": "Draft" }, "T3.1-5": "A" },
  rowChecks: { "T3.2-1": { rows: { "GDPR Art.32": { pick: "BKB-POL-017 Data Protection and Privacy Policy", best: "BKB-POL-017 Data Protection and Privacy Policy", correct: true, why: "BKB policy index" } } } },
  answers: { "F1.1-3": "data:image/png;base64,AAA+BKB/BKB+AA", "T4.1-9": "The BKB Group policy (BKB-POL-006) sets it." },
  acks: { "F1.3-1": ["BKB-ADD-16", "read"] },
  done: { "T3.2-1": true },
  savedAt: 1764000000000,
};
const read = readOldNames(saved);

assert.equal(read.grids["T3.2|frameworks|Crosswalk View"]["2,5"], "SITL-POL-017 Section 6");
assert.equal(read.grids["T3.2|frameworks|Crosswalk View"]["3,5"], "sitl-pol-006, sec. 6.2", "a code typed in small letters stays in small letters");
assert.equal(read.grids["T3.2|frameworks|Crosswalk View"]["4,2"], "Yes");
assert.deepEqual(Object.keys(read.picks["T11.2-8"]), ["SITL-POL-002", "No SITL policy (gap)"], "row labels are keys: renamed too");
assert.equal(read.rowChecks["T3.2-1"].rows["GDPR Art.32"].best, "SITL-POL-017 Data Protection and Privacy Policy");
assert.equal(read.rowChecks["T3.2-1"].rows["GDPR Art.32"].correct, true);
assert.equal(read.answers["F1.1-3"], saved.answers["F1.1-3"], "a picture is left as it is");
assert.equal(read.answers["T4.1-9"], "The SITL Group policy (SITL-POL-006) sets it.");
assert.deepEqual(read.acks["F1.3-1"], ["SITL-ADD-16", "read"]);
assert.equal(read.done["T3.2-1"], true);
assert.equal(read.savedAt, saved.savedAt);
assert.ok(!JSON.stringify({ ...read, answers: {} }).includes("BKB"));
assert.deepEqual(readOldNames(read), read, "reading twice changes nothing");
assert.equal(readOldNames("ABKBA"), "ABKBA", "only the whole word");

// Every saved document passes through it: the server's copy, and a browser's old copy on its way up.
const sync = readFileSync(new URL("./progress-sync.ts", import.meta.url), "utf8");
assert.equal(sync.match(/readOldNames\(JSON\.parse\(/g)?.length, 2, "progress-sync.ts reads both copies through readOldNames");

console.log("old-names: ok");
