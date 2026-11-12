// The menu each step opens by itself (tools.ts stepMenu): the first toolbar menu its guide sends the learner to,
// else the section of the step's own tool. Read from the guides by stubbing the DOM: each card's getEl/waitFor
// names the menus it looks for (the guides only touch the DOM when a card runs, so the stub can follow the import).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STEP_GUIDES } from "../../components/desk/step-guides";
import { reached, stepMenu, stepUses, toolOpen } from "./tools";

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

// toolOpen reads the tasks that use a tool from an index built once per desk. It must answer as the rule itself does,
// walked step by step: a tool opens once the learner has reached a task with a step that uses it.
{
  const order: string[] = desk.order;
  const keys: string[] = desk.secs.flatMap((s: { k: string } | null) => (s ? desk.sections[s.k].tools.map((t: { n: string }) => `${s.k}|${t.n}`) : []));
  const used = new Set(order.flatMap((id) => desk.tasks[id].steps.flatMap((s: { n: number }) => stepUses(desk.tasks[id], s.n))));
  const gated = keys.filter((k) => used.has(k) && !/^(home|learn)\|/.test(k));
  assert.ok(gated.length > 30, "tools that wait for a task");
  let checks = 0, open = 0;
  for (const k of [0, 1, 5, 12, 20, order.length]) {
    const p = { done: {} as Record<string, boolean>, submitted: {} as Record<string, string> };
    for (const id of order.slice(0, k)) p.submitted[id] = "x";
    if (k < order.length) p.done[`${order[k]}-1`] = true; // the next task, begun
    for (const here of [null, { task: order[Math.min(k + 2, order.length - 1)], n: 1 }]) {
      for (const key of gated) {
        const want = order.some((id) => reached(desk, p as never, here, id) && desk.tasks[id].steps.some((s: { n: number }) => stepUses(desk.tasks[id], s.n).includes(key)));
        assert.equal(toolOpen(desk, () => true, key, p as never, here), want, `${key} with ${k} tasks submitted`);
        checks++;
        open += +want;
      }
    }
  }
  assert.ok(open > 0 && open < checks, "some tools open and some not");
}
console.log(`tools ok: ${steps} steps, ${overrides} open another section than their own`);
