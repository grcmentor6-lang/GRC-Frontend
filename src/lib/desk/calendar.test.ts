// The programme calendar follows the learner's start (names.ts + model.ts onCalendar). Run: npx tsx src/lib/desk/calendar.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CANONICAL, CANONICAL_START, calIso, calMonths, swapper } from "./names";
import { onCalendar, type Desk } from "./model";

const ME = { ...CANONICAL, start: "2026-11-04" }; // a Wednesday: the tester's start, week 12 opens Wed 20 Jan 2027
const show = swapper(CANONICAL, ME);
const back = swapper(ME, CANONICAL);

// The canonical start writes exactly what the content says, so the swap finds every string it is meant to.
assert.equal(swapper(CANONICAL, { ...CANONICAL, start: CANONICAL_START })("W1 · Mon 05 Oct"), "W1 · Mon 05 Oct", "canonical is a no-op");
// The week labels the content writes (they were T11.1's week options before GRC 101 was rebuilt, docs/li101).
const WEEKS = ["05 Oct", "12 Oct", "19 Oct", "26 Oct", "02 Nov", "09 Nov", "16 Nov", "23 Nov", "30 Nov", "07 Dec", "14 Dec", "21 Dec"].map((d, i) => `W${i + 1} · Mon ${d}`);
assert.deepEqual(WEEKS.map(show), Array.from({ length: 12 }, (_, i) => `W${i + 1} · ${["Wed 04 Nov", "Wed 11 Nov", "Wed 18 Nov", "Wed 25 Nov", "Wed 02 Dec", "Wed 09 Dec", "Wed 16 Dec", "Wed 23 Dec", "Wed 30 Dec", "Wed 06 Jan", "Wed 13 Jan", "Wed 20 Jan"][i]}`));
assert.equal(show("95 % of leavers are de-provisioned within 4 hours by 2027-06-21"), "95 % of leavers are de-provisioned within 4 hours by 2027-07-20");
assert.equal(show("95 % of leavers are de-provisioned within 4 hours by 2027-01-21"), "95 % of leavers are de-provisioned within 4 hours by 2027-02-20");
assert.equal(back(show("by 2027-06-21")), "by 2027-06-21", "a pick goes back to the server's key unchanged");
assert.equal(show("week 12 opens on 2026-12-21 (Home › Calendar), so 2027-06-21."), "week 12 opens on 2027-01-20 (Home › Calendar), so 2027-07-20.");
// Scenario dates and answers are never touched: a bare date, T12.1's test date, a date a learner types.
for (const s of ["2026-12-21", "Due 2026-12-21", "23 December 2026", "2027-06-21", "Mon 14 Dec", "W11 Mon 14 Dec"]) assert.equal(show(s), s, s);

assert.equal(calIso(calMonths(new Date("2027-03-31T00:00:00Z"), 1)), "2027-04-30", "held to the month's last day");

// Home › Calendar and Knowledge Checks: the content's own dates for Mon 05 Oct, the learner's for theirs.
const sample = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;
const col = (d: Desk, k: string, c: number) => (d.tp[k].pl as { r: string[][] }).r.map((r) => r[c]);
const canon = onCalendar(structuredClone(sample), CANONICAL_START);
assert.deepEqual(col(canon, "home|Calendar", 1), col(sample, "home|Calendar", 1));
assert.deepEqual(col(canon, "learn|Knowledge Checks", 2), col(sample, "learn|Knowledge Checks", 2));
const mine = onCalendar(structuredClone(sample), ME.start);
assert.equal(col(mine, "home|Calendar", 1)[11], "Wed 20 Jan");
assert.equal(col(mine, "learn|Knowledge Checks", 2)[0], "Tue 10 Nov");
console.log("calendar ok");
