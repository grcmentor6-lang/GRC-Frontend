// No step may send the learner to a toolbar screen that is still locked in the step's own week.
// A screen opens in max(section u, tool u) (tools.ts weekOf); stepUses = the step's key plus every screen it reads.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stepSourceList } from "./step-sources";
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

// The "Read first" / "Sources for this step" card (UX101 W3, W4) opens its sources with one click, past the toolbar.
// So a source's screen must be one the toolbar has open at that step too: its week has come, and it is either on the
// reference shelf (Home, Learn: the week gate only, tools.ts SHELF) or a screen this step or an earlier one uses.
const LIST: Record<string, string> = { doc: "policies|Policy Library", rule: "learn|Rule tables", page: "learn|Reference pages" };
const used = new Set<string>();
const shut: string[] = [];
let links = 0;
for (const id of desk.order) {
  const task = { ...desk.tasks[id], id };
  for (const s of task.steps) {
    for (const k of stepUses(task, s.n)) used.add(k);
    for (const x of stepSourceList(task, s.n)) {
      const key = x.k === "tool" ? x.id : LIST[x.k];
      if (!key) continue; // a dataset, the Standards Library, the learner's own file, this screen: no toolbar screen
      links++;
      if (weekOf(key) > task.week) shut.push(`${id}-${s.n} (week ${task.week}) links ${key}, which opens in week ${weekOf(key)}`);
      else if (!["home", "learn"].includes(key.split("|")[0]) && !used.has(key)) shut.push(`${id}-${s.n} links ${key}, which no step so far uses: the toolbar still shows it locked`);
    }
  }
}
assert.ok(links > 400, "the check ran over the source links");
assert.deepEqual(shut, [], shut.join("\n"));
console.log(`unlock-weeks ok: ${checked} screen uses, ${links} source links`);
