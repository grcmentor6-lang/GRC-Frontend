// The programme calendar follows the learner's start (names.ts + model.ts onCalendar). Run: npx tsx src/lib/desk/calendar.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CANONICAL, CANONICAL_START, calDay, calIso, calMonths, swapper } from "./names";
import { onCalendar, type Desk } from "./model";
import AWR from "./awr-t111.json";
import TOP from "./top-t72.json";

const ME = { ...CANONICAL, start: "2026-11-04" }; // a Wednesday: the tester's start, week 12 opens Wed 20 Jan 2027
const show = swapper(CANONICAL, ME);
const back = swapper(ME, CANONICAL);

// The canonical start writes exactly what the content says, so the swap finds every string it is meant to.
assert.equal(swapper(CANONICAL, { ...CANONICAL, start: CANONICAL_START })("W1 · Mon 05 Oct"), "W1 · Mon 05 Oct", "canonical is a no-op");
assert.deepEqual((AWR as { weekOpts: string[] }).weekOpts.map(show), Array.from({ length: 12 }, (_, i) => `W${i + 1} · ${["Wed 04 Nov", "Wed 11 Nov", "Wed 18 Nov", "Wed 25 Nov", "Wed 02 Dec", "Wed 09 Dec", "Wed 16 Dec", "Wed 23 Dec", "Wed 30 Dec", "Wed 06 Jan", "Wed 13 Jan", "Wed 20 Jan"][i]}`));
const opts = (TOP as { obj_opts: string[][] }).obj_opts.flat();
assert.ok(opts.every((o) => show(o) !== o), "every T7.2 objective option is dated from the calendar");
assert.equal(show("95 % of leavers are de-provisioned within 4 hours by 2027-06-21"), "95 % of leavers are de-provisioned within 4 hours by 2027-07-20");
assert.equal(show("95 % of leavers are de-provisioned within 4 hours by 2027-01-21"), "95 % of leavers are de-provisioned within 4 hours by 2027-02-20");
assert.ok(opts.every((o) => back(show(o)) === o), "a pick goes back to the server's key unchanged");
// The server's "why", read back through toLearner.
const keys = readFileSync(new URL("../../../../backend/_seed/grc101_row_keys.json", import.meta.url), "utf8");
assert.ok(keys.includes("week 12 opens on 2026-12-21 (Home › Calendar), so 2027-06-21"), "the T7.2-13 key still says what the swap looks for");
assert.equal(show("week 12 opens on 2026-12-21 (Home › Calendar), so 2027-06-21."), "week 12 opens on 2027-01-20 (Home › Calendar), so 2027-07-20.");
// Scenario dates and answers are never touched: a bare date, T12.1's test date, a date a learner types.
for (const s of ["2026-12-21", "Due 2026-12-21", "23 December 2026", "2027-06-21", "Mon 14 Dec", "W11 Mon 14 Dec"]) assert.equal(show(s), s, s);

// T7.2's plan: week 12 + 1 month onwards, as the content dates it for the canonical start.
const plan = (TOP as { plan: string[][] }).plan;
plan.forEach((m, i) => assert.deepEqual([m[2], m[3]], [1, 2].map((k) => calIso(calMonths(calDay(CANONICAL_START, 77), i + k)))));
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
