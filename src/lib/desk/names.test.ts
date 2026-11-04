// The learner's names on the desk (names.ts): full before short, file-name parts, domains, the mentee ID, round trip.
import assert from "node:assert/strict";
import { CANONICAL, deepMap, localizable, setDeskIdentity, swapper, toCanon, toLearner } from "./names";

const ME = {
  menteeId: "M2611-00042",
  orgs: [
    { key: "A" as const, name: "Corvane Customer Solutions", short: "Corvane", domain: "corvane.example" },
    { key: "B" as const, name: "Brightwell Educational Solutions", short: "Brightwell", domain: "brightwell.example" },
  ],
};
const text = "GlobalConnect Customer Solutions (GlobalConnect) and LearnTech's dpo@learntech.example; TSA-16_GlobalConnect_Customer_Solutions.xlsx in /M2610-00001/W01, M2610-00001_T3.1_OBL-REG_v1.xlsx";
const want = "Corvane Customer Solutions (Corvane) and Brightwell's dpo@brightwell.example; TSA-16_Corvane_Customer_Solutions.xlsx in /M2611-00042/W01, M2611-00042_T3.1_OBL-REG_v1.xlsx";

assert.equal(swapper(CANONICAL, CANONICAL)(text), text, "canonical is a no-op");
assert.equal(swapper(CANONICAL, ME)(text), want);
assert.equal(swapper(ME, CANONICAL)(want), text, "round trip");
assert.equal(swapper(CANONICAL, ME)("GlobalConnected M2610-000012"), "GlobalConnected M2610-000012", "never inside a longer word");

const content = { rows: [["LearnTech (customer)", 3]], fn: () => 1 };
assert.equal(toLearner("LearnTech"), "LearnTech", "canonical until set");
localizable(content);
setDeskIdentity(ME);
assert.equal(content.rows[0][0], "Brightwell (customer)", "registered content rewritten in place");
assert.equal(toLearner("LearnTech (customer)"), "Brightwell (customer)");
assert.deepEqual(deepMap({ picks: [{ label: "x", pick: "Brightwell (customer)" }] }, toCanon), { picks: [{ label: "x", pick: "LearnTech (customer)" }] });
setDeskIdentity(null);
assert.equal(content.rows[0][0], "LearnTech (customer)", "back to canonical");
console.log("names ok");
