// T8.2 step 1: a typed duration in any common form reads as one form, so the per-row check compares like with like.
import assert from "node:assert/strict";
import { duration } from "./registers";

const cases: [string, string | null][] = [
  ["9", "9 h"], ["9 h", "9 h"], ["9h", "9 h"], ["9 hours", "9 h"], ["30 min", "30 min"], ["30m", "30 min"], ["10 minutes", "10 min"],
  ["90 minutes", "1 h 30 min"], ["1.5 hours", "1 h 30 min"], ["1:30", "1 h 30 min"], ["1 h 30 min", "1 h 30 min"], ["27 h", "27 h"],
  ["0", "0 min"], ["about two", null], ["", null], ["h", null],
];
for (const [v, want] of cases) assert.equal(duration(v), want, v);
