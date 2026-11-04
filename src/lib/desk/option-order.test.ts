// Run: npx tsx src/lib/desk/option-order.test.ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CANONICAL_ID, canonAt, optionOrder, relabel, reorderStep, shown } from "./option-order";
import type { Desk } from "./model";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;
const ME = "M2611-00042";

// The canonical learner always sees the pack's order (539 desk tests pick by position).
assert.equal(CANONICAL_ID, "M2610-00001");
const picks = desk.order.flatMap((t) => desk.tasks[t].steps.filter((s) => s.kind === "pick").map((s) => ({ id: s.did ?? `${t}-${s.n}`, s })));
const msgs = Object.values(desk.inj).filter((m) => m.options?.length);
for (const { id, s } of picks) assert.deepEqual(optionOrder(CANONICAL_ID, id, s.opt!.length), [0, 1, 2]);

// Another learner: a permutation, stable, and not the identity everywhere.
let moved = 0;
for (const { id, s } of [...picks, ...msgs.map((m) => ({ id: m.id, s: { opt: m.options } }))]) {
  const o = optionOrder(ME, id, s.opt!.length);
  assert.deepEqual([...o].sort(), [0, 1, 2], id);
  assert.deepEqual(optionOrder(ME, id, s.opt!.length), o, `${id} stable`);
  if (o.some((ci, d) => ci !== d)) moved++;
}
assert.ok(moved > (picks.length + msgs.length) / 2, `only ${moved} reordered`);
assert.notDeepEqual(picks.map((p) => optionOrder(ME, p.id, 3)), picks.map((p) => optionOrder("M2611-00043", p.id, 3)));

// What is stored is canonical: the option shown at d is canonical letter canonAt(d), and shown() maps it back to d.
const o = [2, 0, 1];
assert.deepEqual([0, 1, 2].map((d) => canonAt(o, d)), ["C", "A", "B"]);
assert.deepEqual(["A", "B", "C"].map((c) => shown(o, c)), ["B", "C", "A"]);
assert.equal(shown(o, "report"), "report");
assert.equal(shown(o, "OK"), "OK");

// Feedback prose: option letters follow, Annex A and an article do not.
assert.equal(relabel("Same as A: the work. Only option B gives both. The same reply as C.", o), "Same as B: the work. Only option C gives both. The same reply as A.");
assert.equal(relabel("Compare with Annex A. A High rating. A.5.9 and option A.5.", o), "Compare with Annex A. A High rating. A.5.9 and option A.5.");

// Every pick step's inline options parse, and come out in the learner's order (T6.1-6 has none inline).
for (const { id, s } of picks) {
  if (!s.w.includes("Options:")) continue;
  const ord = optionOrder(ME, id, 3);
  const w = reorderStep(s.w, s.opt!, ord);
  assert.ok(w.includes(`A) ${s.opt![ord[0]]}  B) ${s.opt![ord[1]]}  C) ${s.opt![ord[2]]}`), `${id}: ${w}`);
  assert.equal(w.length, s.w.length, id); // same text, moved
  assert.equal(reorderStep(s.w, s.opt!, [0, 1, 2]), s.w, id);
}

// The server's feedback names options only in phrasings relabel() covers (when the backend checkout is beside us).
const seed = (f: string) => new URL(`../../../../backend/_seed/${f}`, import.meta.url);
for (const f of ["grc101_decisions.json", "grc101_inbox_keys.json"]) {
  if (!existsSync(seed(f))) continue;
  const keys = JSON.parse(readFileSync(seed(f), "utf8")) as Record<string, { why?: string; options?: { reason: string; consequence: string }[] }>;
  for (const [id, k] of Object.entries(keys))
    for (const t of [k.why ?? "", ...(k.options ?? []).flatMap((x) => [x.reason, x.consequence])]) {
      // Blank out what relabel handles and the known non-option capitals; any lone A–D left is an unmapped letter.
      const rest = t
        .replace(/\b(same as|same reply as|option) [A-F](?![\w\-/]|\.\d)/gi, "")
        .replace(/\bAnnex [A-D]\b/g, "")
        .replace(/(^|[.!?]\s+|")A (?=["\w])/g, "");
      assert.doesNotMatch(rest, /(?<![\w.\-/§])[A-D](?![\w\-/]|\.\d)/, `${f} ${id}: ${t}`);
    }
}

console.log("option-order: ok");
