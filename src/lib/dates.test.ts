import assert from "node:assert";
import { isoDmy, parseDate, whenDmy } from "./dates";

assert.equal(isoDmy("2026-10-05"), "05-OCT-2026");
assert.equal(isoDmy("2026-10-05T09:00:00Z"), "05-OCT-2026");
assert.equal(isoDmy(""), "");
assert.equal(parseDate("05-OCT-2026"), "2026-10-05");
assert.equal(parseDate("5 oct 2026"), "2026-10-05");
assert.equal(parseDate("10/09/2026"), "2026-09-10"); // day first
assert.equal(parseDate("2026-10-05"), "2026-10-05");
assert.equal(parseDate("31-NOV-2026"), null);
assert.equal(parseDate("hello"), null);
assert.equal(whenDmy("2026-11-27T14:05:00"), "27-NOV-2026, 14:05"); // local time, as the learner saw it
assert.equal(whenDmy("nope"), "");
console.log("dates ok");
