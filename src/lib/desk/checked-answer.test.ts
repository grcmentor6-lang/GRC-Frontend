// checkedAnswer: the key's value shown beside a pick an earlier step checked wrong (T10.1 DFM, F5: Collect → Transfer).
import assert from "node:assert/strict";
import { cellValue, checkedAnswer, standing, type Register } from "./registers";
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

// A derived cell checked as one answer with its source (T3.1 LI-POL: Gap writes "None: no section meets it"). A wrong Gap
// keeps its "None" in the locked cell, so the step still completes; what reads the cell afterwards gets the key's section.
const pol = {
  code: "LI-POL", title: "LI-POL", cols: [{ h: "Item" }, { h: "Status" }, { h: "Section" }], rows: [["a)", "", ""]],
  mine: () => true, steps: { 2: [1, 2] }, checkRows: { 2: { label: 0, col: 1, with: 2 } },
  derived: { 2: { from: [1], value: (v: (c: number) => string) => (v(1) === "Gap" ? "None" : null) } },
} as unknown as Register;
const wrongGap = { ...p, grids: { "T3.1|LI-POL": { "0,1": "Gap" } },
  rowChecks: { "T3.1-2": { rows: { "a)": { pick: "Gap · None", best: "Met · Section 4", correct: false, why: "" } } } } } as unknown as Progress;
assert.equal(cellValue(pol, wrongGap, "T3.1", 0, 2), "None", "the locked derived cell keeps the learner's own answer");
assert.equal(standing(pol, wrongGap, "T3.1", 0, 2), "Section 4", "later steps read the key's section");
assert.equal(standing(pol, wrongGap, "T3.1", 0, 1), "Met", "and the key's status");
// A row recorded without the check ("Record without the check": correct null, no key's value) is neither right nor wrong:
// nothing replaces the learner's own pick anywhere downstream.
const unchecked = { ...wrongGap, rowChecks: { "T3.1-2": { rows: { "a)": { pick: "Gap · None", best: "", correct: null, why: "" } } } } } as unknown as Progress;
assert.equal(checkedAnswer(pol, unchecked, "T3.1", 0, 1), null, "no key's value to show");
assert.equal(standing(pol, unchecked, "T3.1", 0, 1), "Gap", "later steps read the learner's own pick");
assert.equal(standing(pol, unchecked, "T3.1", 0, 2), "None");
console.log("checked-answer: ok");
