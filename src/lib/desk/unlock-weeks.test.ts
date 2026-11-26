// No step may send the learner to a toolbar screen that is still locked in the step's own week.
// A screen opens in max(section u, tool u) (tools.ts weekOf); stepUses = the step's key plus every screen it reads.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stepUses } from "./tools";

const desk = JSON.parse(readFileSync(join(import.meta.dirname, "../../../public/desk/sample.json"), "utf8"));
const weekOf = (key: string) => {
  const sec = key.split("|")[0];
  return Math.max(desk.secs.find((s: { k: string } | null) => s?.k === sec)?.u ?? 1, desk.sections[sec]?.tools.find((t: { n: string }) => `${sec}|${t.n}` === key)?.u ?? 1);
};
const late: string[] = [];
let checked = 0;
for (const id of desk.order) {
  const task = { ...desk.tasks[id], id };
  for (const s of task.steps)
    for (const k of stepUses(task, s.n)) {
      checked++;
      if (weekOf(k) > task.week) late.push(`${id}-${s.n} (week ${task.week}) uses ${k}, which opens in week ${weekOf(k)}`);
    }
}
assert.ok(checked > 100, "the check ran over the steps");
assert.deepEqual(late, [], late.join("\n"));
console.log(`unlock-weeks ok: ${checked} screen uses`);
