// Every Inbox message sits on a real task and step, is in its week, has three replies, never states a step's answer, and
// arrives after the step before it and not earlier. Run: npx tsx src/lib/desk/inbox.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { holdStep, INJ_AT, released, waitingAt } from "./inbox";
import type { Desk } from "./model";
import { EMPTY, type Progress } from "./progress";

const desk = JSON.parse(readFileSync(join(import.meta.dirname, "../../../public/desk/sample.json"), "utf8")) as Desk;
const ids = Object.keys(desk.inj);
assert.ok(ids.length >= 9);
const norm = (t: string) => t.toLowerCase().replace(/\W+/g, " ").trim();
// F1.1-J2 is the one old message; the others are LI101's, each with a step of its own.
for (const id of ids) {
  const m = desk.inj[id], t = desk.tasks[m.task];
  assert.ok(t && t.inj.includes(id), id);
  assert.ok((desk.weeks[t.week - 1] as unknown as { inj: string[] }).inj.includes(id), `${id} is in its week`);
  const n = INJ_AT[id];
  assert.ok(n >= 1 && n <= t.steps.length, `${id} waits at a step of ${m.task}`);
  assert.equal(m.options.length, 3, id);
  assert.ok(m.sender.trim() && m.notice.trim() && m.ref.trim(), id);
  assert.ok(!/§/.test(JSON.stringify(m)), id);
  assert.ok(!("best" in m), `${id}: no answer in the browser's copy`);
  if (id === "F1.1-J2") continue;
  assert.ok(n > 1, `${id} arrives after the work it tests`);
  // The text never holds one of a step's long answer options (a short one, a standard's name, may be quoted).
  for (const s of t.steps) for (const o of (s.opt ?? []).filter((x) => x.length > 40)) assert.ok(!norm(m.notice).includes(norm(o)), `${id} states an option of step ${s.n}`);
  // Not before the learner is at the step, nor before the step before it is done; it then holds that step.
  const p: Progress = { ...EMPTY, done: {}, submitted: {}, msgs: {} };
  assert.equal(released(desk, p, { task: m.task, n: n - 1 }, id), false, `${id} too early`);
  assert.equal(released(desk, p, { task: m.task, n }, id), true, `${id} arrives at step ${n}`);
  // It holds the next step (the hand-in, for a message that arrives there), never the step it arrives at.
  const h = holdStep(desk, id);
  assert.equal(h, Math.min(n + 1, t.steps.length), id);
  assert.ok(h > n || n === t.steps.length, `${id} holds its own step`);
  assert.deepEqual(waitingAt(desk, p, m.task, h), t.inj.filter((x) => holdStep(desk, x) === h));
  assert.equal(waitingAt(desk, { ...p, msgs: { [id]: "A" } }, m.task, h).includes(id), false);
  if (h !== n) assert.equal(waitingAt(desk, p, m.task, n).includes(id), false, `${id} holds the step it arrives at`);
}
for (const id of Object.keys(INJ_AT)) assert.ok(desk.inj[id], `${id} in INJ_AT has no message`);
console.log("ok");
