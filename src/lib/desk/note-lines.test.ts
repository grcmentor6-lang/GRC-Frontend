// A note's words are only re-broken, never changed (step-text.tsx noteLines). Run: npx tsx src/lib/desk/note-lines.test.ts
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { noteLines } from "../../components/desk/step-text";

const r08 = 'Rule R08 (Learn › Rule tables): LOW-criticality appetite = 11. Residual score ≤ 11 → Decision "Accept and monitor". Residual score > 11 → Decision "Treat"; due days from SITL-ERM-001 Section 7: Critical 30, High 90, Medium 180. The plan is dated 2026-11-19: count calendar days from it. The owner is the risk\'s owner in RR-UPD.';
const n = noteLines(r08);
assert.strictEqual(n.rule, "R08");
assert.strictEqual(n.lines.length, 6, JSON.stringify(n.lines));
assert.ok(n.lines[3].text.includes("**Critical 30**") && n.lines[3].text.includes("**Medium 180**"));
assert.ok(n.lines[4].text.includes("**2026-11-19**"));
// A head with three items becomes a head and its items.
const cats = noteLines("Only the listed controls count. The categories: R-26, Cyber; R-27, Privacy; R-28, Third party.");
assert.deepStrictEqual(cats.lines[1], { text: "The categories:", sub: ["R-26, Cyber.", "R-27, Privacy.", "R-28, Third party."] });
// One sentence stays one line, and a note with no rule has none.
assert.deepStrictEqual(noteLines("Fill each row."), { rule: undefined, lines: [{ text: "Fill each row." }] });
// Every word of a note survives: letters and digits in order, whatever the breaks, marks and added full stops.
const bare = (s: string) => s.replace(/\*\*/g, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8"));
const texts: string[] = [r08, ...Object.values(desk.rules as Record<string, string[]>).map((r) => `Rule X: ${r[1]}`), ...Object.values(desk.pages as Record<string, { note?: string }>).flatMap((p) => (p.note ? [p.note] : []))];
for (const t of texts) {
  const out = noteLines(t);
  const joined = out.lines.map((l) => [l.text, ...(l.sub ?? [])].join(" ")).join(" ");
  const want = bare(t.replace(/^Rule ([RL]\d+)(?: \(Learn › Rule tables\))?:\s+/, ""));
  assert.strictEqual(bare(joined), want, t.slice(0, 80));
}
console.log(`note-lines: ok (${texts.length} texts)`);
