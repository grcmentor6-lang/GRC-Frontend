// Run: npx tsx src/lib/criterion-map.test.ts
//
// The R-marks on the working sheet claim "this box fills R2". A wrong claim is worse than none —
// the mentee fills the box, watches R2 stay open, and stops trusting both — and every way of
// getting it wrong is silent: a mark with an unknown key renders nothing, a number past the end
// renders a criterion that does not exist, a criterion nothing maps to is simply never pointed at.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CRITERION_OF, criteriaAt } from "./criterion-map";
import { acceptanceTexts } from "./acceptance";
import { VERBS, GATE_VERBS } from "./verbs";
import { RESEARCH_METHODS } from "./research-methods";

const ALL = { ...VERBS, ...GATE_VERBS };
const dir = join(import.meta.dirname, "../components/app/workspaces");
const source = readdirSync(dir)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .join("\n");
const anchors = new Set([...source.matchAll(/data-guide="([^"]+)"/g)].map((m) => m[1]));
const marked = new Set([...source.matchAll(/<CriterionMark guide="([^"]+)"/g)].map((m) => m[1]));

// Tabs are anchored by the shared rail (`data-guide={`tab:${t.key}`}`) but never marked in it: RUA
// already numbers its eight screens R1–R8, and a criterion chip there is a second, different R.
// A tab key is real when the gate defines a tab by that name.
const tabKeys = new Set([
  ...[...readFileSync(join(dir, "rua-gate.tsx"), "utf8").matchAll(/\{ key: "([a-z]+)", label:/g)].map((m) => m[1]),
  ...RESEARCH_METHODS.map((m) => m.key),
  "review",
]);
assert.ok(source.includes("data-guide={`tab:${t.key}`}"), "the tab rail no longer anchors its tabs");
assert.ok(
  !readFileSync(join(dir, "gates.tsx"), "utf8").includes("CriterionMark"),
  "the gate tab rail carries a criterion chip again — RUA's panes already number themselves R1–R8, "
    + "so a chip there is a second R-numbering on the same screen",
);

// Parts that carry a share mark with an explicit criterion, because the map alone cannot say how
// much of the criterion they are: a form entry is one of n, a method's sources are one method's.
const MARKED_EXPLICITLY = new Set(["item", "rs:sources"]);
// Criteria whose chip is placed by hand, away from the part the map names, because the map cannot
// express it: R1 and R2 of the research gate are mapped to the method tabs (pairing) and marked on
// the method's own header, since a method is cleared by its whole quality bar; R4 is mapped to the
// Review tab and marked on the declaration, which is what the criterion actually reads. Each one
// is verified to exist below, so this is a pointer, not a licence.
const MARKED_ELSEWHERE: Record<string, number[]> = { research: [1, 2, 4] };
for (const [id, list] of Object.entries(MARKED_ELSEWHERE)) {
  const file = readFileSync(join(dir, `${id}-gate.tsx`), "utf8");
  for (const r of list)
    assert.ok(file.includes(`rs={[${r}]}`), `verb "${id}": R${r} is listed as marked by hand, but no <CriterionMark rs={[${r}]}> is there`);
}

for (const [id, verb] of Object.entries(ALL)) {
  const table = CRITERION_OF[id];
  const n = acceptanceTexts(id).length;
  assert.ok(table, `verb "${id}" (${verb.label}) has no criterion map — its deliverable would carry no marks`);

  const reached = new Set<number>();
  for (const [key, rs] of Object.entries(table)) {
    if (key.startsWith("tab:")) {
      assert.ok(tabKeys.has(key.slice(4)), `verb "${id}": no gate defines a tab "${key.slice(4)}"`);
      // Pairing-only, so the chip for these criteria has to be somewhere else — or nowhere, which
      // is the deliberate answer for RUA.
      if (id !== "rua")
        for (const r of rs)
          assert.ok(
            (MARKED_ELSEWHERE[id] ?? []).includes(r) || Object.entries(table).some(([k, v]) => !k.startsWith("tab:") && v.includes(r)),
            `verb "${id}": R${r} is only on a tab, and tabs carry no chip — nothing on screen names it`,
          );
    } else {
      assert.ok(anchors.has(key), `verb "${id}": no data-guide="${key}" in any workspace`);
      assert.ok(
        marked.has(key) || MARKED_EXPLICITLY.has(key),
        `verb "${id}": "${key}" is mapped but no <CriterionMark guide="${key}"> is placed`,
      );
    }
    for (const r of rs) {
      assert.ok(Number.isInteger(r) && r >= 1 && r <= n, `verb "${id}": "${key}" points at R${r}, but there are ${n} criteria`);
      reached.add(r);
    }
  }
  for (let r = 1; r <= n; r++)
    assert.ok(reached.has(r), `verb "${id}": nothing on the deliverable fills R${r} ("${acceptanceTexts(id)[r - 1]}")`);
}

// criteriaAt walks up to the nearest *mapped* anchor, stops at the workspace, and ignores unmapped ones.
type Fake = { attr: string | null; parentElement: Fake | null; getAttribute: (k: string) => string | null };
const node = (attr: string | null, parent: Fake | null): Fake => ({
  attr, parentElement: parent, getAttribute: (k) => (k === "data-guide" ? attr : null),
});
const root = node(null, null);
const workspace = node(null, root);
const entry = node("item", workspace);
const field = node("f:content", entry);
const input = node(null, field);
const at = (verb: string, el: Fake, stop?: Fake) => criteriaAt(verb, el as unknown as Element, stop as unknown as Element);

assert.deepEqual(at("draft", input, workspace), [1], "a form field should pair with its entry's R1");
assert.deepEqual(at("request", input, workspace), [], "an anchor another verb maps must not pair here");
assert.deepEqual(at("unknown-verb", input, workspace), []);
// A mapped anchor *above* the workspace: found without a boundary, ignored with one.
const page = node("to", null);
const sheet = node(null, page);
const leaf = node(null, node(null, sheet));
assert.deepEqual(at("request", leaf), [1]);
assert.deepEqual(at("request", leaf, sheet), [], "the walk must stop at the workspace boundary");

console.log(
  `criterion-map: ok — ${Object.keys(ALL).length} verbs, ` +
    `${Object.values(CRITERION_OF).reduce((k, t) => k + Object.keys(t).length, 0)} parts mapped, every criterion reached`,
);
