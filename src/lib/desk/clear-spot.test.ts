import assert from "node:assert/strict";
import { clearBelow, menuLeft, pickSpot } from "./clear-spot";

const panel = { l: 880, t: 130, r: 1184, b: 680 };
// F2.1 step 5 at 1366: the menu wanted x=845 (over the panel); it moves left of the panel.
assert.equal(menuLeft(845, 400, 12, 954, panel), 472);
assert.equal(menuLeft(300, 400, 12, 954, panel), 300); // already clear
assert.equal(menuLeft(845, 400, 12, 954, null), 845);
assert.equal(menuLeft(845, 400, 600, 954, panel), 1192 > 954 ? 845 : 1192); // no room either side: stays
assert.equal(menuLeft(845, 400, 600, 1300, panel), 1192); // room on the right only

const btn = { l: 1050, t: 600, r: 1180, b: 640 };
const c = [{ x: 1000, y: 72 }, { x: 12, y: 72 }];
assert.deepEqual(pickSpot(c, 300, 560, [btn], []), { x: 12, y: 72 }); // default covers the button
assert.deepEqual(pickSpot(c, 300, 560, [], []), c[0]); // nothing covered: default kept
// A window pushed under the panel button it would cover (F2.1 step 5: "Show me how" at the panel's top).
const top = { l: 1050, t: 92, r: 1170, b: 118 };
assert.equal(clearBelow(1000, 72, 300, 400, [top], 800), 126);
assert.equal(clearBelow(100, 72, 300, 400, [top], 800), 72); // nothing under it: unchanged
assert.equal(clearBelow(1000, 72, 300, 600, [top], 800), null); // would run past the bottom edge
console.log("clear-spot ok");
