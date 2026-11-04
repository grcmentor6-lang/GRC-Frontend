// Run: npx tsx src/lib/desk-plan.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planOf, nextStep, dueText } from "./desk-plan";
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
console.log("desk-plan ok");
