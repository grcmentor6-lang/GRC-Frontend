/**
 * LI101 (fix round 3): nothing of the old programme may sit in sample.json where a learner can open it: no SOC 2, no
 * Lumen, no PBC term, no old rule "Instrument type", no old task title, no capability map. The greyed-standards data
 * (an organisation's own standards list, the SITL document outlines) is the only place a standard may be named; and
 * T12.2's toolbar screen is called "Audit Requests (PBC)". Run: npx tsx src/lib/desk/li-no-old.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("../../..", import.meta.url));
const d = JSON.parse(readFileSync(`${web}/public/desk/sample.json`, "utf8"));
const OLD = /SOC ?2|Zendesk|Review module|Learn › Lead Implementer|Lumen|\bPBC\b|Instrument type|Capability map|Prepared-by-client|Top-5 risk summary|User access review \(UAR\)|SOP skeleton|Control crosswalk/;

// Mentor review of HC1-HC6 is not built: no screen may say a person assesses, scores or signs off the work.
const HUMAN = /human assessor|certified assessor|Human composite|Moderation|mentor-graded|under mentor review|Human checkpoint|Reviewed by an assessor|human scores|Assessor Notes|feed-forward|Human attested|reviewed (at|with) (checkpoint|the task|HC\d)|assessors? samples?|by the assessor|assessor reviews/i;
// retired rules and counts (release fixes)
const STALE = /\(R23\)|D1.D10|0 \/ 26|22 of 25|R01.R36|L01.L25/;

const found: string[] = [];
const walk = (o: unknown, path: string): void => {
  if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${path}[${i}]`));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, `${path}/${k}`);
  else if (typeof o === "string" && (OLD.test(o.replace(/Audit Requests \(PBC\)/g, "")) || HUMAN.test(o) || STALE.test(o))) found.push(`${path}: ${o.slice(0, 60)}`);
};
for (const [k, v] of Object.entries(d)) {
  if (k === "library") continue; // the shared SITL documents' outlines
  if (k === "orgs") { // greyed-standards lists only: each organisation's own text is checked
    for (const [ok, org] of Object.entries(d.orgs as Record<string, Record<string, unknown>>)) for (const [f, x] of Object.entries(org)) if (f !== "standards") walk(x, `orgs/${ok}/${f}`);
    continue;
  }
  walk(v, k);
}
walk(d.library.cited_by_task, "library/cited_by_task");
assert.deepEqual(found, [], "old-programme text is back in sample.json");

// every rule shown is cited by something, and the retired ones are gone
for (const r of ["R01", "R16", "R28"]) assert.ok(!(r in d.rules), `${r} is retired`);
assert.equal(d.tp["learn|Rule tables"].pl.r.length, Object.keys(d.rules).length);
assert.ok(!("Ref-Capability map" in d.pages));

// the Standards Library citations of a rebuilt task are ISO/IEC 27001 only
for (const t of d.order) {
  if (t === "F1.1") continue;
  for (const x of d.library.cited_by_task[t]) assert.ok(x.startsWith("ISO/IEC 27001:2022"), `${t} cites ${x}`);
}
// the certificate's counts are the programme's: every task and every lab (backend desk_record.certificate_eligible)
const labs = Number(/^(\d+) required labs/.exec(d.tp["systems|*"].stamp)![1]);
assert.equal(d.gates[0], `All ${d.order.length} tasks submitted, every step complete (each step is checked against its key before it can be marked complete).`);
assert.match(d.gates[1], new RegExp(`^All ${labs} Tech Labs`));
assert.deepEqual(d.gates, d.tests.gates);
assert.equal(d.tp["home|My Scores"].pl.k[0][1], `0 / ${d.order.length}`);
assert.match(d.sections.learn.tools[4].d, new RegExp(`\(${Object.keys(d.rules).length} rules\)`));

// the organisations describe this programme: GlobalConnect everywhere, LearnTech only where tasks[*].org says so
for (const k of ["A", "B"]) {
  const mine = d.order.filter((t: string) => d.tasks[t].org.includes(k));
  assert.deepEqual(d.orgs[k].tasks, mine);
  assert.deepEqual(d.orgs[k].records.map((r: string[]) => r[0]), mine);
}
assert.match(d.orgs.A.audit, /Initial ISO\/IEC 27001:2022 certification/);
assert.ok(!/surveillance/i.test(JSON.stringify([d.orgs.A.obj, d.orgs.A.audit, d.tp["home|My Organisation"]])));
assert.match(d.tasks["T5.2"].steps[10].t, /four objectives/); // OBJ-01 ... OBJ-04
console.log("li-no-old: ok");
