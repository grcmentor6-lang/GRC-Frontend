// The desk's order (locks.ts). Run: npx tsx src/lib/desk/locks.test.ts
import assert from "node:assert/strict";
import { stepGate, taskGate } from "./locks";
import type { Desk, Task } from "./model";
import type { Progress } from "./progress";
import { stepKey } from "./progress";

const order = ["F1.1", "F1.2", "F1.3", "F2.1", "F2.2"];
const desk = { order, tasks: Object.fromEntries(order.map((id) => [id, { id, steps: [1, 2, 3, 4].map((n) => ({ n })) }])) } as unknown as Desk;
const task = desk.tasks["F1.2"] as Task;
const P = (submitted: string[], done: number[] = [], of = "F1.2") =>
  ({ submitted: Object.fromEntries(submitted.map((t) => [t, "x"])), done: Object.fromEntries(done.map((n) => [stepKey(of, n), true])) }) as unknown as Progress;

// Tasks: the first is always open; each next one waits for every task before it.
assert.equal(taskGate(desk, P([]), "F1.1"), null);
assert.equal(taskGate(desk, P([]), "F1.2"), "F1.1");
assert.equal(taskGate(desk, P(["F1.1"]), "F1.2"), null);
assert.equal(taskGate(desk, P(["F1.1"]), "F2.1"), "F1.2"); // names the next one to do, not the one just before
assert.equal(taskGate(desk, P(["F1.3"]), "F1.3"), null); // work already submitted stays open
assert.equal(taskGate(desk, P(["F1.1"], [1]), "F1.3"), "F1.2"); // a step done in the task in hand opens nothing after it

// What was reached never locks again: an earlier task that is no longer submitted (rebuilt, its steps reopened).
const gap = P(["F1.1", "F1.3"]); // F1.2 was submitted once, and is open again
assert.equal(taskGate(desk, gap, "F1.2"), null); // the reopened task itself
assert.equal(taskGate(desk, gap, "F1.3"), null); // handed in: stays open
assert.equal(taskGate(desk, gap, "F2.1"), null); // the task in hand, open since F1.3 went in, with no step done yet
assert.equal(taskGate(desk, gap, "F2.2"), "F1.2"); // never reached: waits, and names the reopened task first
assert.equal(taskGate(desk, P(["F1.1"], [2], "F2.1"), "F2.1"), null); // a step done in a task keeps that task open
assert.equal(taskGate(desk, P(["F1.1"], [2], "F2.1"), "F2.2"), "F1.2"); // …and opens nothing beyond it

// Steps: the first is open; each next one waits for the steps before it; a done step stays open.
assert.equal(stepGate(P([]), task, 1), null);
assert.equal(stepGate(P([]), task, 3), 1);
assert.equal(stepGate(P([], [1]), task, 2), null);
assert.equal(stepGate(P([], [1]), task, 4), 2);
assert.equal(stepGate(P([], [3]), task, 3), null);
console.log("locks ok");
