// UX101 W10: minutes for all 216 steps, pauses, next action = nextTask, the interview card claims nothing but the task's own fields.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { aboutMin, firstAction, inFirstWeek, interviewCard, lastDone, pauseAfter, stepMinutes } from "./first-week";
import { nextTask } from "../desk-plan";
import { EMPTY } from "./progress-sync";

const desk = JSON.parse(readFileSync(join(import.meta.dirname, "../../../public/desk/sample.json"), "utf8"));
for (const id of desk.order) desk.tasks[id].id = id;

let steps = 0;
for (const id of desk.order) {
  const t = desk.tasks[id];
  const m = stepMinutes(t);
  assert.ok(Number.isInteger(m) && m >= 5 && m % 5 === 0, `${id}: ${m} min`);
  steps += t.steps.length;
  // A pause is never after the last step, and every task of 40+ minutes has at most (steps-1) of them.
  assert.equal(pauseAfter(t, t.steps[t.steps.length - 1].n), false, `${id} pauses after its last step`);
}
assert.equal(steps, 216, "minutes exist for all 216 steps");
// F1.1: 1.5 h over 6 steps = 15 min each; the first stop is after step 3 ("next session starts with step 4").
const f11 = desk.tasks["F1.1"];
assert.equal(stepMinutes(f11), 15);
assert.deepEqual(f11.steps.map((s: { n: number }) => pauseAfter(f11, s.n)), [false, false, true, false, false, false]);
assert.equal(aboutMin(15), "about 15 min");
assert.equal(aboutMin(90), "about 1 h 30 min");

// Next action is nextTask's first undone step.
const fresh = { ...EMPTY, done: {}, submitted: {} };
let a = firstAction(desk, fresh)!;
assert.equal(a.task.id, nextTask(desk, fresh));
assert.equal(a.task.id, "F1.1");
assert.equal(a.n, 1);
assert.equal(a.label, "Start F1.1 step 1 · about 15 min");
assert.ok(inFirstWeek(desk, fresh));
assert.equal(lastDone(desk, fresh), null);
const mid = { ...EMPTY, done: { "F1.1-1": true, "F1.1-2": true }, submitted: {} };
a = firstAction(desk, mid)!;
assert.equal(a.n, 3);
assert.match(a.label, /^Continue F1\.1 step 3/);
assert.deepEqual([lastDone(desk, mid)!.task.id, lastDone(desk, mid)!.n], ["F1.1", 2]);
const all = { ...EMPTY, done: {}, submitted: Object.fromEntries(desk.order.map((id: string) => [id, "x"])) };
assert.equal(firstAction(desk, all), null);
const wk2 = { ...EMPTY, done: {}, submitted: Object.fromEntries(desk.weeks[0].tasks.map((id: string) => [id, "x"])) };
assert.equal(inFirstWeek(desk, wk2), false);

// The interview card: every claim is one of the task's own method, responsibility or hand-in names.
for (const id of desk.order) {
  const t = desk.tasks[id];
  const c = interviewCard(t);
  assert.ok(c.handIns.length > 0 && c.method && c.skill, `${id}: card has content`);
  assert.deepEqual(c.handIns, t.subs.map((x: { name: string }) => x.name));
  assert.ok(t.method.includes(c.method) && t.resp.startsWith(c.skill.slice(0, 20)), `${id}: method/responsibility are the task's`);
  for (const h of c.handIns) assert.ok(c.line.includes(h), `${id}: line names ${h}`);
  // Take out the task's own words: what is left is the template alone, which says nothing about scores, review or level.
  const rest = [t.id, t.title, c.method, ...c.handIns].reduce((x: string, w: string) => x.replace(w, ""), c.line);
  assert.equal(rest.replace(/[“”,.]/g, " ").replace(/\s+/g, " ").trim(), `In I practised and handed in:${c.handIns.length > 1 ? " and" : ""}`, `${id}: template only`);
}
console.log(`first-week ok: ${steps} steps timed`);
