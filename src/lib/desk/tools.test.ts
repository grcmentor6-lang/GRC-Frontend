// The menu each step opens by itself (tools.ts stepMenu): the first toolbar menu its guide sends the learner to,
// else the section of the step's own tool. Read from the guides by stubbing the DOM: each card's getEl/waitFor
// names the menus it looks for (the guides only touch the DOM when a card runs, so the stub can follow the import).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STEP_GUIDES } from "../../components/desk/step-guides";
import { stepMenu } from "./tools";

let seen: string[] = [];
(globalThis as unknown as { document: unknown }).document = {
  querySelector: (s: string) => (seen.push(s), null),
  querySelectorAll: (s: string) => (seen.push(s), []),
};

const menusOf = (key: string): string[] =>
  (STEP_GUIDES[key] ?? []).flatMap((c) => {
    seen = [];
    try { c.getEl(); c.waitFor?.(); } catch { /* a card reading a missing element */ }
    return seen.flatMap((s) => s.match(/data-guide-(?:section|menu)="(\w+)"/)?.[1] ?? []);
  });

const desk = JSON.parse(readFileSync(join(import.meta.dirname, "../../../public/desk/sample.json"), "utf8"));
let steps = 0, overrides = 0;
for (const id of desk.order) {
  const task = { ...desk.tasks[id], id };
  for (const s of task.steps) {
    steps++;
    const own = s.key?.split("|")[0] ?? null;
    // The Inbox opens straight into its screen: it has no menu to open.
    const first = [...menusOf(`${id}-${s.n}q`), ...menusOf(`${id}-${s.n}`)].find((m) => m !== "inbox");
    const want = first ?? own;
    if (want !== own) overrides++;
    assert.equal(stepMenu(task, s.n), want, `${id} step ${s.n}`);
    if (want) assert.ok(desk.sections[want], `${id} step ${s.n}: ${want} is a toolbar menu`);
  }
}
assert.ok(steps > 250, "every step read");
console.log(`tools ok: ${steps} steps, ${overrides} open another section than their own`);
