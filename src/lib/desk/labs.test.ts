// The five Tech Labs are required parts of their tasks (owner, 26 Nov 2026; docs/li101/labs.md): where each opens, that
// Submit waits for it, that the toolbar unlocks it in its task's week, and that no lab shows a canonical name to a learner.
// Run: npx tsx src/lib/desk/labs.test.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { LABS, LAB_SHOW_AFTER, labDone, labFindings, labOpen, labWhy, labsLeft } from "./labs";
import { EMPTY } from "./progress-sync";
import { deepMap, setDeskIdentity, toLearner } from "./names";
import { stepKey, type Progress } from "./progress";
import { submitWhy } from "./work";
import { toolOpen } from "./tools";
import type { Desk } from "./model";

const root = join(import.meta.dirname, "../../../public/desk");
const desk = JSON.parse(readFileSync(join(root, "sample.json"), "utf8")) as Desk;
const P = (over: Partial<Progress> = {}): Progress => ({ ...EMPTY, ...over });
const task = (id: string) => ({ ...desk.tasks[id], id });

// Placement: one lab per sprint named by the owner, two on T10.1, each opening before the task's hand-in step.
assert.deepEqual(
  LABS.map((l) => [l.tool.split("|")[1].replace(" (business SaaS)", ""), l.task, l.after]),
  [["LedgerSim", "T3.2", "T3.2-5"], ["AppAdmin", "T7.1", "T7.1-4"], ["LogLens", "T9.2", "T9.2-5"], ["NetShield", "T10.1", "T10.1-5"], ["DataSentry", "T10.1", "T10.1-5"]],
);
for (const l of LABS) {
  const t = desk.tasks[l.task];
  const n = Number(l.after!.split("-")[1]);
  assert.ok(n < t.steps.length && t.steps[t.steps.length - 1].t.startsWith("Save"), `${l.id} opens before ${l.task}'s hand-in`);
  assert.ok(desk.sections.systems.tools.some((x) => `systems|${x.n}` === l.tool), `${l.tool} is on the Systems menu`);
}

// Opening: after the step it follows, or once the task is submitted.
const al = LABS[3];
assert.ok(!labOpen(al, P()) && labOpen(al, P({ done: { "T10.1-5": true } })));
assert.ok(labsLeft("T10.1", P()).length === 0, "a lab not open yet is not left");
assert.deepEqual(labsLeft("T10.1", P({ done: { "T10.1-5": true } })).map((l) => l.id), ["TL-36-INF-07-NET02-C", "TL-36-SOC-08-DLP02-C"]);

// Submit waits for the lab, names which one is left, and opens once its findings are recorded.
const opened = P({ done: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [stepKey("T10.1", i + 1), true])) });
const t101 = task("T10.1");
const submit = t101.steps[t101.steps.length - 1];
assert.match(submitWhy(desk, opened, t101, submit) ?? "", /Tech Lab NetShield and DataSentry first/);
const net = { "TL-36-INF-07-NET02-C": { parts: {}, findings: ["a"], done: "2026-11-30T10:00:00Z" } };
assert.match(labWhy("T10.1", P({ ...opened, labs: net })) ?? "", /Tech Lab DataSentry first/);
assert.ok(!labDone(LABS[3], P({ labs: { "TL-36-INF-07-NET02-C": { parts: {}, done: "2026-11-30T10:00:00Z" } } })), "marked complete with no findings is not complete");
const both = { ...net, "TL-36-SOC-08-DLP02-C": { parts: {}, findings: ["b"], done: "2026-11-30T10:05:00Z" } };
assert.ok(!labWhy("T10.1", P({ ...opened, labs: both })));
assert.ok(!(submitWhy(desk, P({ ...opened, labs: both }), t101, submit) ?? "").includes("Tech Lab"));

// An earlier step's own Submit (an evidence pack's receipt) never waits for a lab: only the task's final hand-in does.
const pack = t101.steps.findIndex((x, i) => i < t101.steps.length - 1 && /^Build the full evidence pack/.test(x.t));
assert.ok(pack >= 0 && !(submitWhy(desk, opened, t101, t101.steps[pack]) ?? "").includes("Tech Lab"), "step 6's Submit does not wait for a lab");

// Unlock: a lab's dock entry opens in its task's week, never earlier (the build derives `u` from first use).
for (const l of LABS) {
  const wk = desk.tasks[l.task].week;
  const u = desk.sections.systems.tools.find((x) => `systems|${x.n}` === l.tool)!.u;
  assert.equal(u, wk, `${l.tool} unlocks in week ${wk}`);
  const done = P({ done: { [l.after!]: true } });
  assert.ok(!toolOpen(desk, (w) => w < wk, l.tool, done), `${l.tool} stays shut before week ${wk}`);
  assert.ok(toolOpen(desk, (w) => w <= wk, l.tool, done), `${l.tool} opens in week ${wk}`);
  assert.ok(!toolOpen(desk, () => true, l.tool, P()), `${l.tool} waits for step ${l.after}`);
}

// Labs are rewritten per learner like other content: no canonical organisation, learner or old hand-in name shows.
setDeskIdentity({
  menteeId: "M2611-00042",
  orgs: [
    { key: "A" as const, name: "Corvane Customer Solutions", short: "Corvane", domain: "corvane.example" },
    { key: "B" as const, name: "Brightwell Educational Solutions", short: "Brightwell", domain: "brightwell.example" },
  ],
});
const files = readdirSync(join(root, "labs")).filter((f) => f.endsWith(".json"));
assert.equal(files.length, 5);
for (const f of files) {
  const raw = JSON.parse(readFileSync(join(root, "labs", f), "utf8"));
  const s = JSON.stringify(deepMap(raw, toLearner));
  for (const name of ["GlobalConnect", "LearnTech", "M2610-00001", "globalconnect.example"]) assert.ok(!s.includes(name), `${f} still shows ${name} to a learner`);
  for (const old of ["Lumen", "SOC 2", "RoPA", "UAR-MEMO", "CT-MEMO", "SOC-DEC", "BRC-PLAN", "Amsterdam", "Istanbul", "LearnTech"]) assert.ok(!JSON.stringify(raw).includes(old), `${f} names ${old}`);
  for (const w of ['"best"', '"why"', '"findings"']) assert.ok(!JSON.stringify(raw).includes(w), `${f} carries ${w}`);
  assert.ok(JSON.stringify(raw).includes("GlobalConnect"), `${f} is GlobalConnect Manila's data`);
}
setDeskIdentity(null);
// A capture part answered with the answer shown (three wrong checks, then "Show me the answer") still lets the lab complete,
// so nobody is stuck, but its finding does not cite the learner's own evidence: it says the filter was given.
assert.equal(LAB_SHOW_AFTER, 3);
{
  const lab = LABS[1];
  const shown = P({
    submitted: {},
    done: { [lab.after!]: true },
    labCaptures: [{ ref: "E1", lab: lab.id, view: "users", viewTitle: "Users", filter: "x", ids: ["U-1"], utc: "2026-11-26 10:00 UTC", sha: "" }],
    labs: { [lab.id]: { parts: { admins: { ref: "E1", correct: true, released: true, misses: 3 }, signin: { ref: "E1", correct: true } }, findings: ["Admins: {admins}.", "Sign-in: {signin}."], done: "2026-11-26T10:05:00Z" } },
  });
  assert.ok(labDone(lab, shown) && labWhy(lab.task, shown) === null, "a lab with an answer shown can still complete");
  const [a, b] = labFindings(shown, lab.id);
  assert.ok(/shown to you after 3 tries/.test(a) && !a.includes("E1"), a);
  assert.ok(b.includes("E1 (2026-11-26 10:00 UTC)"), "a part found without help cites its capture");
}
console.log("labs ok");
