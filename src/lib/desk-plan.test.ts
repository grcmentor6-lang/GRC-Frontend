// Run: npx tsx src/lib/desk-plan.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planOf, nextStep, dueText, nextTask, workWeek, weekReached, weekDone, calendarWeek, catchUp, urgency, accessEndFor, accessPhase, isoDay, addDays } from "./desk-plan";
import { currentWeek, dueDate, testDue, dmy } from "./desk/model";
import { rmfExpected } from "./desk/forms";
import { EMPTY } from "./desk/progress-sync";
import type { Desk } from "./desk/model";

const desk: Desk = JSON.parse(readFileSync("public/desk/sample.json", "utf8"));
const start = new Date(2026, 9, 5); // Mon 5 Oct 2026
const at = (days: number) => new Date(start.getTime() + days * 86_400_000 + 3_600_000);

// Day 0, nothing done: the first step of the first task, nothing past week 1 open.
let plan = planOf(desk, EMPTY, start, false, at(0));
const next = nextStep(desk, EMPTY, plan)!;
assert.equal(next.href, `/app/desk#${desk.order[0]}-1`);
assert.ok(plan.filter((t) => t.state === "not-open").every((t) => t.week > 1));
assert.equal(dueText(plan[0]), plan[0].left === 1 ? "Due tomorrow" : `Due in ${plan[0].left} days`);

// Steps 1-2 of the first task done: step 3 is next.
const id = desk.order[0];
const p = { ...EMPTY, done: { [`${id}-1`]: true, [`${id}-2`]: true } };
plan = planOf(desk, p, start, false, at(0));
assert.equal(nextStep(desk, p, plan)!.n, 3);
assert.equal(plan[0].stepsDone, 2);

// Past its due day and not handed in: overdue. Handed in: submitted, and the next task is next.
plan = planOf(desk, EMPTY, start, false, at(desk.tasks[id].dueDay + 2));
assert.equal(plan[0].state, "not-reached", "nothing begun: not overdue");
const one = { ...EMPTY, done: { [`${id}-1`]: true } };
plan = planOf(desk, one, start, false, at(desk.tasks[id].dueDay + 2));
assert.equal(plan[0].state, "overdue");
assert.equal(dueText(plan[0]), "Overdue by 2 days");
const sub = { ...EMPTY, submitted: { [id]: "2026-10-05T10:00:00Z" } };
plan = planOf(desk, sub, start, false, at(0));
assert.equal(plan[0].state, "submitted");
assert.equal(nextStep(desk, sub, plan)!.task.id, desk.order[1]);

// Every week-1 task in on day 0: nothing open is left, so no next step.
const wk1 = Object.fromEntries(desk.order.filter((x) => desk.tasks[x].week === 1).map((x) => [x, "x"]));
const all1 = { ...EMPTY, submitted: wk1 };
assert.equal(nextStep(desk, all1, planOf(desk, all1, start, false, at(0))), null);

// ── UX101 W1: one start date drives everything. ──
// Every date is the start plus a number: the week's first day, the task's due day, the week's check, the Onboarding
// record's rows in F1.1, and the access end. Move the start a day and every one of them moves a day.
for (const s0 of [start, new Date(2026, 10, 27), new Date(2027, 2, 27)]) {
  const pl = planOf(desk, EMPTY, s0, true, s0);
  for (const t of pl) assert.equal(t.due.getTime(), dueDate(s0, desk.tasks[t.id].dueDay).getTime());
  const rmf = rmfExpected(desk, s0, 2);
  assert.equal(rmf[0], dmy(pl.find((t) => t.id === "F1.2")!.due), "the Onboarding record's F1.2 due date is the plan's");
  assert.equal(rmf[2], dmy(testDue(s0, 1)));
  assert.equal(rmfExpected(desk, s0, 0)[5], dmy(s0), "the Onboarding record's start date is the start date");
  assert.equal(accessEndFor(isoDay(s0)), isoDay(addDays(s0, 98)), "access ends 14 weeks after a first start");
}
assert.equal(accessEndFor("2026-10-08"), "2027-01-14", "08 Oct + 14 weeks");

// Never overdue before the start: a start next Monday, looked at today, has nothing late and nothing "not reached".
const before = planOf(desk, EMPTY, start, true, at(-3));
assert.ok(before.every((t) => t.state === "upcoming"), "before the start every task is upcoming");
assert.equal(calendarWeek(start, at(-3)), 0);
assert.equal(catchUp(desk, EMPTY, start, null, at(-3)), null);

// Seven weeks in with only F1.1 handed in: the learner is on F1.2. That one task is overdue; everything else whose
// date has passed is "not reached", never red; week 8 and later are upcoming.
const f11 = { ...EMPTY, submitted: { [desk.order[0]]: "x" } };
const day49 = at(49);
assert.equal(nextTask(desk, f11), desk.order[1], "the desk opens on the next unfinished task");
assert.equal(nextTask(desk, f11), "F1.2");
assert.equal(workWeek(desk, f11), 1);
assert.equal(currentWeek(start, day49), 8);
const late = planOf(desk, f11, start, true, day49);
for (const t of late) {
  if (t.state === "overdue") assert.equal(t.id, "F1.2", `${t.id} overdue, and the learner is not on it`);
  if (t.week > 1 && t.week < 8) assert.equal(t.state, "not-reached", t.id);
  if (t.week > 8) assert.equal(t.state, "upcoming", t.id);
}
assert.equal(late.filter((t) => t.state === "overdue").length, 1);
const nr = late.find((t) => t.state === "not-reached")!;
assert.equal(dueText(nr), "Not started yet");
assert.equal(urgency(nr), "later", "a week not reached is never drawn late");
assert.equal(urgency(late[1]), "late");
assert.equal(nextStep(desk, f11, late)!.task.id, "F1.2");

// Nothing done at all, seven weeks after a start date the learner never chose: nothing is overdue, and they are offered a new start.
assert.ok(planOf(desk, EMPTY, start, true, day49).every((t) => t.state !== "overdue"), "no overdue before the learner has begun");
assert.equal(catchUp(desk, EMPTY, start, null, day49)!.newStart, isoDay(day49));

// Week reached (for the knowledge checks, W6): by the learner's own order, not the calendar.
assert.ok(weekReached(desk, f11, 1) && !weekReached(desk, f11, 2));
assert.ok(!weekDone(desk, f11, 1));
assert.ok(weekDone(desk, all1, 1) && weekReached(desk, all1, 2) && !weekDone(desk, all1, 2));
const everything = { ...EMPTY, submitted: Object.fromEntries(desk.order.map((x) => [x, "x"])) };
assert.equal(nextTask(desk, everything), null);
assert.ok(weekReached(desk, everything, 12) && weekDone(desk, everything, 12));

// Catch-up: two or more weeks behind → an offer. The new start puts the learner's week at today; the access end stays.
assert.equal(catchUp(desk, f11, start, null, at(8)), null, "one week behind: no offer");
const cu = catchUp(desk, f11, start, "2027-03-22", day49)!;
assert.equal(cu.weeksBehind, 7);
assert.equal(cu.newStart, isoDay(day49), "week 1 again: the plan starts today");
assert.deepEqual(cu.focus.map((t) => t.id), desk.order.slice(1, 4));
// In week 3 by their own order, on calendar week 8: week 3 starts today, so the start moves to 14 days ago.
const wk12 = { ...EMPTY, submitted: Object.fromEntries(desk.order.filter((x) => desk.tasks[x].week < 3).map((x) => [x, "x"])) };
const cu3 = catchUp(desk, wk12, start, "2027-03-22", day49)!;
assert.equal(cu3.week, 3);
assert.equal(cu3.newStart, isoDay(addDays(day49, -14)));
const replanned = planOf(desk, wk12, new Date(`${cu3.newStart}T00:00:00`), true, day49);
assert.ok(replanned.every((t) => t.state !== "overdue" && t.state !== "not-reached"), "after the re-plan nothing is late");
assert.equal(catchUp(desk, wk12, new Date(`${cu3.newStart}T00:00:00`), "2027-03-22", day49), null);
// Twelve weeks no longer fit before the access end: no move is offered, only the focus list.
const tight = catchUp(desk, f11, start, isoDay(addDays(day49, 60)), day49)!;
assert.equal(tight.newStart, null);
assert.equal(tight.daysLeft, 60);
assert.ok(tight.focus.length > 0);
assert.equal(catchUp(desk, everything, start, null, at(200)), null, "nothing left to catch up on");
console.log("desk-plan ok");

// Access phases: weeks 1-12 open, week 13 to the access end grace, after it read-only.
{
  const s0 = "2026-10-08", end = accessEndFor(s0);
  const on = (iso: string) => new Date(`${iso}T12:00:00`);
  assert.equal(accessPhase(s0, end, on("2026-12-30")), "open", "day 83 is still week 12");
  assert.equal(accessPhase(s0, end, on("2026-12-31")), "grace", "day 84 is the first day of week 13");
  assert.equal(accessPhase(s0, end, on(end)), "grace", "the access end is the last open day");
  assert.equal(accessPhase(s0, end, on("2027-01-15")), "ended");
  assert.equal(accessPhase(null, null), "open");
}
