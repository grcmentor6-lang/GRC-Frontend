// Run: npx tsx src/lib/desk/cell-tone.test.ts
import assert from "node:assert/strict";
import { cellTone, tierTone } from "./cell-tone";

const chip = (v: string, h?: string) => { const t = cellTone(v, h); return t?.kind === "chip" ? t.cls : null; };

assert.match(chip("Business Critical")!, /FDECC0/);
assert.equal(chip("Standard / Operational"), chip("Standard/Operational"));
assert.equal(chip("Tier 3 — Confidential"), tierTone("Tier 3")); // the same chip as the decision tree's outcome
assert.equal(chip("tier 4"), tierTone("Tier 4"));
assert.notEqual(chip("Tier 1 — Public"), chip("Tier 4 — Restricted"));
assert.equal(chip("High", "Impact"), chip("Fail"));
assert.equal(chip("High", "Notes"), null); // a rating word outside a rating column stays plain
assert.ok(chip("Closed") && chip("Accept.") && chip("Not met"));
assert.deepEqual(cellTone("Yes"), { kind: "strong" });
assert.deepEqual(cellTone("See description"), { kind: "muted" });
assert.equal(cellTone(""), null);
assert.equal(cellTone("Closed after the vendor replied"), null); // free text is never toned
console.log("cell-tone ok");
