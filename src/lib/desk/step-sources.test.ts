// Every one of the 216 steps names where its answer can be found, and every place it names exists on the desk
// (UX101 W4, R-02: "any step without one is a content bug"). The audit behind the list, with what answers each step and
// its rating, is docs/ux101/step-sources.json in the root repo (checked by docs/ux101/build_step_sources.py).
// Run: npx tsx src/lib/desk/step-sources.test.ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDoc } from "./docs";
import { QUICK_REF, auditedSources, stepSourceList } from "./step-sources";

const pub = join(import.meta.dirname, "../../../public/desk");
const desk = JSON.parse(readFileSync(join(pub, "sample.json"), "utf8"));
const quick = new Set((desk.tp[QUICK_REF].pl.p as string[]).map((p) => p.match(/^<b>(.*?)<\/b>/)![1]));
const secsOf = new Map<string, string[] | null>();
const sections = (id: string) => {
  if (!secsOf.has(id)) {
    const f = join(pub, "docs", `${id}.md`);
    secsOf.set(id, existsSync(f) ? parseDoc(readFileSync(f, "utf8")).map((s) => s.num) : null);
  }
  return secsOf.get(id)!;
};

let steps = 0, sources = 0;
for (const id of desk.order) {
  const task = { ...desk.tasks[id], id };
  for (const s of task.steps) {
    const at = `${id} step ${s.n}`;
    steps++;
    assert.ok(auditedSources(id, s.n).length > 0, `${at}: not in the audit (docs/ux101/step-sources.json)`);
    const list = stepSourceList(task, s.n);
    // "sheet" alone is a step read wholly off its own screen (the worked rows of a finding step).
    assert.ok(list.length > 0, `${at}: names no source`);
    for (const x of list) {
      sources++;
      if (x.k === "doc") {
        assert.ok(desk.docs[x.id] || desk.library.docs.some((d: [string]) => d[0] === x.id), `${at}: ${x.id} is not in the Policy Library`);
        const have = sections(x.id);
        // "6.2–6.4" cites a range: its first section is what must exist.
        for (const sec of x.secs) assert.ok(!have || have.some((n) => n === sec.split(/[–-]/)[0] || n.startsWith(`${sec}.`)), `${at}: ${x.id} has no Section ${sec}`);
      } else if (x.k === "rule") assert.ok(desk.rules[x.id], `${at}: rule ${x.id}`);
      else if (x.k === "page") assert.ok(desk.pages[x.id], `${at}: page ${x.id}`);
      else if (x.k === "ds") assert.ok(desk.ds[x.id], `${at}: dataset ${x.id}`);
      else if (x.k === "tool") {
        assert.ok(desk.tp[x.id], `${at}: screen ${x.id}`);
        if (x.find) assert.ok(x.id === QUICK_REF && quick.has(x.find), `${at}: ${x.id} has no entry "${x.find}"`);
      } else if (x.k === "own") assert.ok(desk.tasks[x.task]?.steps[x.step - 1] && desk.order.indexOf(x.task) <= desk.order.indexOf(id), `${at}: own work ${x.task} step ${x.step} is not earlier work`);
    }
    // What the step itself cites is in its list (the card must not show less than the step's text names).
    for (const r of s.refs.rules) assert.ok(list.some((x) => x.k === "rule" && x.id === r), `${at}: cited rule ${r} missing`);
    for (const p of s.refs.pages) assert.ok(list.some((x) => x.k === "page" && x.id === p), `${at}: cited page ${p} missing`);
    for (const [d] of s.refs.docs) assert.ok(list.some((x) => x.k === "doc" && x.id === d), `${at}: cited document ${d} missing`);
  }
}
assert.equal(steps, 216, "every step of the programme");
// The Quick Reference covers every clause 4 to 10 (C-04: it had no Clause 8).
for (const c of ["4.1", "5.1", "6.1.1", "6.1.2", "6.1.3", "6.2", "6.3", "7.1", "7.5", "9.1", "9.2", "9.3", "10.1", "10.2"]) assert.ok(quick.has(`ISO/IEC 27001 Clause ${c}`), `Quick Reference: Clause ${c}`);
assert.ok(quick.has("ISO/IEC 27001 Clause 8"), "Quick Reference: Clause 8");
// C-02: each organisation's addendum holds its offices' hazard profile, with the head office's country score as Annex B has it.
const annexB = readFileSync(join(pub, "docs", "SITL-ERM-001.md"), "utf8");
for (const [doc, office, country] of [["SITL-ADD-16", "Manila, Philippines", "Philippines"], ["SITL-ADD-36", "Istanbul, Turkey", "Turkey"]]) {
  const sec1 = parseDoc(readFileSync(join(pub, "docs", `${doc}.md`), "utf8")).find((s) => s.num === "1")!.body;
  const row = sec1.split("\n").find((l) => l.startsWith(`| ${office}`));
  assert.ok(row, `${doc} Section 1: hazard profile row for ${office}`);
  const nat = annexB.slice(annexB.indexOf("Annex B — Country risk profile scores")).split("\n").find((l) => l.startsWith(`| ${country} |`))!.split("|")[5].trim();
  assert.equal(row.split("|")[2].trim(), nat, `${doc}: ${country}'s natural-hazard score is Annex B's`);
}
console.log(`ok step-sources: ${steps} steps, ${sources} sources, all found on the desk`);
