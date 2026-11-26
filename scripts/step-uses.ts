// Reads a desk (JSON on stdin) and prints, for every toolbar screen a step works in or reads, the earliest week of any
// step using it ({"section|Tool": week}). build-li101.py derives screen unlock weeks from this; the reads lists live in TS.
import { readFileSync } from "node:fs";
import { stepUses } from "../src/lib/desk/tools";
import { LABS } from "../src/lib/desk/labs";

const desk = JSON.parse(readFileSync(0, "utf8"));
const first: Record<string, number> = {};
for (const id of desk.order) {
  const task = { ...desk.tasks[id], id };
  for (const s of task.steps) for (const k of stepUses(task, s.n)) first[k] = Math.min(first[k] ?? 99, task.week);
}
// A required lab counts as a use of its Systems screen: it opens in the week of its task.
for (const l of LABS) first[l.tool] = Math.min(first[l.tool] ?? 99, desk.tasks[l.task].week);
console.log(JSON.stringify(Object.fromEntries(Object.entries(first).sort())));
