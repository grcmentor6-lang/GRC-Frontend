// Run: npx tsx src/lib/desk/org-tone.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ORG_TONE, orgKeys } from "./org-tone";
import type { Desk } from "./model";

const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8")) as Desk;

// The label and the task's own field agree on every task, so either can drive the colour.
for (const t of Object.values(desk.tasks)) assert.deepEqual(orgKeys(t.orglbl), orgKeys(t.org), t.id);
assert.deepEqual(orgKeys("AB"), ["A", "B"]);
assert.deepEqual(orgKeys("Org A + B · GlobalConnect + LearnTech"), ["A", "B"]);
assert.deepEqual(orgKeys("Org B · Atlas, Berlin"), ["B"]); // an "A" in the name never counts

// WCAG AA for the text pairs the marks and chips draw.
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
for (const t of Object.values(ORG_TONE)) {
  assert.ok(ratio(t.text, t.tint) >= 4.5, `${t.text} on ${t.tint}: ${ratio(t.text, t.tint).toFixed(2)}`);
  assert.ok(ratio(t.text, "#FFFFFF") >= 4.5, `white on ${t.text}`);
}
console.log("org-tone: ok", Object.values(ORG_TONE).map((t) => ratio(t.text, t.tint).toFixed(2)).join(", "));
