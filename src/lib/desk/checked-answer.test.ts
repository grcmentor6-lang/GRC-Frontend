// checkedAnswer: the key's value shown beside a pick an earlier step checked wrong (T10.1 DFM, F5: Collect → Transfer).
import assert from "node:assert/strict";
import { checkedAnswer, type Register } from "./registers";
import type { Progress } from "./progress";

const reg = {
  code: "DFM",
  title: "DFM",
  cols: [{ h: "Flow" }, { h: "Shape" }, { h: "System" }, { h: "Safeguard" }],
  rows: [["F1", "", "", ""], ["F5", "", "", ""]],
  mine: () => true,
  steps: { 3: [1, 2], 4: [3] },
  checkRows: { 3: { label: 0, col: 1, with: 2 }, 4: { label: 0, col: 3 } },
} as unknown as Register;

const p = {
  done: {}, picks: {}, answers: {}, acks: {}, submitted: {}, msgs: {},
  grids: { "T10.1|DFM": { "0,1": "System", "0,2": "LMS", "1,1": "Collect", "1,2": "LMS", "1,3": "SCCs" } },
  rowChecks: {
    "T10.1-3": { rows: { F1: { pick: "System · LMS", best: "System · LMS", correct: true, why: "" }, F5: { pick: "Collect · LMS", best: "Transfer · LMS", correct: false, why: "" } } },
    "T10.1-4": { rows: { F5: { pick: "SCCs", best: "SCCs", correct: true, why: "" } } },
  },
} as unknown as Progress;

assert.equal(checkedAnswer(reg, p, "T10.1", 1, 1), "Transfer", "wrong shape: the key's half shown");
assert.equal(checkedAnswer(reg, p, "T10.1", 1, 2), null, "the system half was right: nothing shown");
assert.equal(checkedAnswer(reg, p, "T10.1", 0, 1), null, "a right row: nothing shown");
assert.equal(checkedAnswer(reg, p, "T10.1", 1, 3), null, "a right single-column check: nothing shown");
assert.equal(checkedAnswer(reg, p, "T10.1", 1, 0), null, "an unchecked column: nothing shown");
// Corrected after the check: the cell now holds the answer, so there is nothing to add.
const fixed = { ...p, grids: { "T10.1|DFM": { ...p.grids!["T10.1|DFM"], "1,1": "transfer" } } } as Progress;
assert.equal(checkedAnswer(reg, fixed, "T10.1", 1, 1), null, "corrected cell: nothing shown");
console.log("checked-answer: ok");
