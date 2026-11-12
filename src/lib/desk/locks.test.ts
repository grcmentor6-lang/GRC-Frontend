// The desk's order (locks.ts). Run: npx tsx src/lib/desk/locks.test.ts
import assert from "node:assert/strict";
import { stepGate, taskGate } from "./locks";
import type { Desk, Task } from "./model";
import type { Progress } from "./progress";
import { stepKey } from "./progress";

const desk = { order: ["F1.1", "F1.2", "F1.3", "F2.1"] } as unknown as Desk;
const task = { id: "F1.2", steps: [1, 2, 3, 4].map((n) => ({ n })) } as unknown as Task;
const P = (submitted: string[], done: number[] = []) =>
  ({ submitted: Object.fromEntries(submitted.map((t) => [t, "x"])), done: Object.fromEntries(done.map((n) => [stepKey("F1.2", n), true])) }) as unknown as Progress;

// Tasks: the first is always open; each next one waits for every task before it.
assert.equal(taskGate(desk, P([]), "F1.1"), null);
assert.equal(taskGate(desk, P([]), "F1.2"), "F1.1");
assert.equal(taskGate(desk, P(["F1.1"]), "F1.2"), null);
assert.equal(taskGate(desk, P(["F1.1"]), "F2.1"), "F1.2"); // names the next one to do, not the one just before
assert.equal(taskGate(desk, P(["F1.2"]), "F1.3"), "F1.1"); // a gap earlier on still holds it
assert.equal(taskGate(desk, P(["F1.3"]), "F1.3"), null); // work already submitted stays open
// Steps: the first is open; each next one waits for the steps before it; a done step stays open.
assert.equal(stepGate(P([]), task, 1), null);
assert.equal(stepGate(P([]), task, 3), 1);
assert.equal(stepGate(P([], [1]), task, 2), null);
assert.equal(stepGate(P([], [1]), task, 4), 2);
assert.equal(stepGate(P([], [3]), task, 3), null);
console.log("locks ok");
