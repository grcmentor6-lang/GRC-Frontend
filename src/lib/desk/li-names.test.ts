// Every LI101 task data file shows the learner's own organisation names, not the canonical ones (names.ts, registers.ts).
// Run: npx tsx src/lib/desk/li-names.test.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { setDeskIdentity, toLearner } from "./names";
import "./registers";
import cfg from "./li-cfg.json";
import kpi from "./li-kpi.json";
import phy from "./li-phy.json";
import soa from "./li-soa.json";
import sprints from "./li-sprints.json";
import t102 from "./li-t102.json";
import t122 from "./li-t122.json";
import t61 from "./li-t61.json";
import t92 from "./li-t92.json";
import ttx from "./li-ttx.json";

const DATA: Record<string, unknown> = {
  "li-cfg.json": cfg, "li-kpi.json": kpi, "li-phy.json": phy, "li-soa.json": soa, "li-sprints.json": sprints,
  "li-t102.json": t102, "li-t122.json": t122, "li-t61.json": t61, "li-t92.json": t92, "li-ttx.json": ttx,
};
// A new task data file must be added here (and to localizable in registers.ts).
assert.deepEqual(readdirSync(import.meta.dirname).filter((f) => /^li-.*\.json$/.test(f)).sort(), Object.keys(DATA).sort());

const ME = {
  menteeId: "M2611-00042",
  orgs: [
    { key: "A" as const, name: "Corvane Customer Solutions", short: "Corvane", domain: "corvane.example" },
    { key: "B" as const, name: "Brightwell Educational Solutions", short: "Brightwell", domain: "brightwell.example" },
  ],
};
setDeskIdentity(ME);
for (const [f, data] of Object.entries(DATA)) {
  const s = JSON.stringify(data);
  for (const name of ["GlobalConnect", "LearnTech", "M2610-00001"]) assert.ok(!s.includes(name), `${f} still shows ${name} to a learner`);
}
// The library documents are renamed as they load (docs.ts loadDoc → toLearner): every one on file, so a new document
// (SITL-POL-022, SITL-POL-024) or a new section (the hazard profiles of SITL-ADD-16 and SITL-ADD-36) is covered.
const DOCS = join(import.meta.dirname, "../../../public/desk/docs");
const docs = readdirSync(DOCS).filter((f) => f.endsWith(".md"));
assert.ok(docs.includes("SITL-POL-022.md") && docs.includes("SITL-POL-024.md"));
for (const f of docs) {
  const s = toLearner(readFileSync(join(DOCS, f), "utf8"));
  for (const name of ["GlobalConnect", "LearnTech", "M2610-00001"]) assert.ok(!s.includes(name), `${f} still shows ${name} to a learner`);
}
assert.ok(toLearner(readFileSync(join(DOCS, "SITL-ADD-16.md"), "utf8")).includes("Natural-hazard and climate profile by office"));
setDeskIdentity(null);
assert.ok(/GlobalConnect|LearnTech|M2610-00001/.test(JSON.stringify(t122)), "back to canonical");
console.log("li-names ok");
