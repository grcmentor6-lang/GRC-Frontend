// No item is scored that the learner could not see the rule for (UX101 integration B): every decision, Inbox reply and
// table of picks the server scores (backend/_seed keys, desk_record.score_items) has, on its "Read first" / "Sources
// for this step" card, at least one source that opens (a document, rule, page, dataset or screen), not only
// "this screen" or the learner's own earlier file. Run: npx tsx src/components/desk/score-sources.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Desk, Step, Task } from "../../lib/desk/model";
import { messageSourceItems, stepSourceItems } from "./read-first";

const root = join(import.meta.dirname, "../../..");
const raw = JSON.parse(readFileSync(join(root, "public/desk/sample.json"), "utf8"));
const desk = { ...raw, tasks: Object.fromEntries(raw.order.map((id: string) => [id, { ...raw.tasks[id], id }])) } as Desk;
const seed = (f: string) => JSON.parse(readFileSync(join(root, "../backend/_seed", f), "utf8")) as Record<string, { best: unknown }>;
const opens = (items: { open?: unknown; view?: unknown; href?: string }[]) => items.filter((i) => i.open || i.view || i.href).length;

const none: string[] = [];
let n = 0;
const step = (id: string, s: Step | undefined, task: Task) => {
  n++;
  if (!s) none.push(`${id}: no such step on the desk`);
  else if (!opens(stepSourceItems(desk, s, task))) none.push(`${id}: scored, but its card opens no source`);
};
for (const [id, k] of Object.entries(seed("grc101_decisions.json"))) {
  if (k.best == null) continue;
  const task = desk.tasks[id.split("-")[0]];
  step(id, task.steps.find((s) => s.did === id), task);
}
for (const id of Object.keys(seed("grc101_row_keys.json"))) {
  const task = desk.tasks[id.slice(0, id.lastIndexOf("-"))];
  step(id, task.steps[Number(id.slice(id.lastIndexOf("-") + 1)) - 1], task);
}
for (const id of Object.keys(seed("grc101_inbox_keys.json"))) {
  n++;
  const m = (desk as unknown as { inj: Record<string, { ref?: string }> }).inj[id];
  if (!m) none.push(`${id}: no such message on the desk`);
  else if (!opens(messageSourceItems(desk, m.ref ?? ""))) none.push(`${id}: scored, but its guidance line "${m.ref}" opens no source`);
}
assert.ok(n > 190, "the check ran over the scored items");
assert.deepEqual(none, [], none.join("\n"));
console.log(`score-sources ok: ${n} scored items, each with a source that opens`);
