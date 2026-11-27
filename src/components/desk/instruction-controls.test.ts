// Run: npx tsx src/components/desk/instruction-controls.test.ts
// UX101 S-10: a guide card or step text that says "click Check my answer(s)" sits on a step that renders that button.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Desk } from "@/lib/desk/model";
import { rmfTable } from "@/lib/desk/model";
import { briefOf, regOf } from "@/lib/desk/registers";
import { STEP_GUIDES } from "./step-guides";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;
const bad: string[] = [];
for (const id of desk.order) {
  for (const s of desk.tasks[id].steps) {
    const cards = [...(STEP_GUIDES[`${id}-${s.n}`] ?? []), ...(STEP_GUIDES[`${id}-${s.n}q`] ?? [])];
    const text = [s.w, s.help ?? "", ...cards.map((c) => `${c.title ?? ""} ${c.body ?? ""} ${(c.steps ?? []).map((a) => `${a.lead ?? ""} ${a.text ?? ""}`).join(" ")}`)].join(" ");
    const rows = !!regOf(id, s.n)?.checkRows?.[s.n] || rmfTable(s) !== null || (briefOf(id, s.n)?.sections ?? []).some((x) => x.draft) || s.kind === "each";
    const pick = s.kind === "pick";
    if (/Check my answers/.test(text) && !rows) bad.push(`${id}-${s.n}: says "Check my answers", no row check`);
    if (/Check my answer\b(?!s)/.test(text) && !pick) bad.push(`${id}-${s.n}: says "Check my answer", not a decision`);
  }
}
assert.deepEqual(bad, [], bad.join("\n"));
