// Knowledge checks on the client (kc.ts): when a check opens, what its line says, and that every text a check can show
// survives the trip the browser makes (lib/api.ts DESK_CHECKS: toLearner on the way in, toCanon on the way out) for
// many learners and start dates. Run: npx tsx src/lib/desk/kc.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KC_HASH, checkOf, kcStatus, opensAfter, whyClosed } from "./kc";
import { KC_ALL_OPEN } from "@/lib/flags";
import { setDeskIdentity, toCanon, toLearner, type DeskIdentity } from "./names";
import type { Desk } from "./model";
import type { Progress } from "./progress";

const desk = JSON.parse(readFileSync(join(__dirname, "../../../public/desk/sample.json"), "utf8")) as Desk;
const P = (submitted: string[], kc?: Progress["kc"]) => ({ done: {}, picks: {}, answers: {}, submitted: Object.fromEntries(submitted.map((t) => [t, "x"])), msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {}, kc }) as Progress;

// Which check a week has, and what it waits for: the same rule as backend services/desk_kc.why_closed.
assert.deepEqual(desk.weeks.map(checkOf), ["KC-01", "FGE", "KC-03", "KC-04", "KC-05", "KC-06", "KC-07", "KC-08", "KC-09", "KC-10", "KC-11", "FEX"]);
assert.deepEqual(opensAfter(desk, "FGE"), ["F1.1", "F1.2", "F1.3", "F2.1", "F2.2"]);
assert.deepEqual(opensAfter(desk, "FEX"), ["T12.1", "T12.2"]);
assert.equal(whyClosed(desk, P([]), "KC-01"), "Opens once you submit F1.1–F1.3.");
assert.equal(whyClosed(desk, P(["F1.1"]), "KC-01"), "Opens once you submit F1.2 and F1.3.");
assert.equal(whyClosed(desk, P(["F1.1", "F1.2", "F1.3", "F2.1"]), "FGE"), "Opens once you submit F2.2.");
assert.equal(whyClosed(desk, P(["T3.1", "T3.2"]), "KC-03"), null);
// While KC_ALL_OPEN (testing) is on, every check reads open; the closed rule itself is pinned by whyClosed above.
assert.equal(kcStatus(desk, P([]), "KC-01").tone, KC_ALL_OPEN ? "open" : "closed");
assert.equal(kcStatus(desk, P(["F1.1", "F1.2", "F1.3"]), "KC-01").label, "Open");
assert.equal(kcStatus(desk, P(["F1.1", "F1.2", "F1.3"], { "KC-01": { attempts: [{ n: 1, score: 60 }, { n: 2, score: 80 }] } }), "KC-01").label, "Best 80%");
for (const h of ["#KC-01", "#KC-11", "#FGE", "#FEX"]) assert.ok(KC_HASH.test(h), h);
for (const h of ["#F1.1", "#W2", "#KC-1", "#FGEX"]) assert.ok(!KC_HASH.test(h), h);

// Every text a check can show: the hand-written bank, the decisions' options and reasons, the per-row steps' labels and
// options, and the question ids that carry those labels.
const seed = (f: string) => JSON.parse(readFileSync(join(__dirname, "../../../../backend/_seed", f), "utf8"));
const kc = seed("grc101_kc_keys.json"), rows = seed("grc101_row_keys.json"), dec = seed("grc101_decisions.json");
const texts = new Set<string>();
for (const [id, b] of Object.entries<{ stem: string; options: { text: string; why: string }[] }>(kc.bank)) {
  texts.add(`h:${id}`).add(b.stem);
  b.options.forEach((o) => texts.add(o.text).add(o.why));
}
for (const s of Object.values<{ ask: string; rows_ask: string }>(kc.steps)) texts.add(s.ask).add(s.rows_ask);
for (const d of Object.values<{ opt: string[]; options: { reason: string }[] | null }>(dec)) {
  d.opt.forEach((o) => texts.add(o));
  d.options?.forEach((o) => texts.add(o.reason));
}
for (const [sid, k] of Object.entries<{ options?: string[]; rows: Record<string, { best: string; why: string }> }>(rows)) {
  (k.options ?? []).forEach((o) => texts.add(o));
  for (const [label, r] of Object.entries(k.rows)) texts.add(`r:${sid}:${label}`).add(r.best).add(r.why);
}

const A = ["Corvane Customer Solutions", "Talvo Contact Services", "Ostrell CX Partners", "Quilmere Customer Care", "Brenvik Support Services", "Kestrava Contact Group", "Larumo Customer Solutions", "Pellacor Contact Services"];
const B = ["Scholaro Educational Solutions", "Brightquill Learning", "Tavora Education Technologies", "Edunexa Learning Solutions", "Corlio Learning Systems", "Mindrift Education", "Pavora Learning Technologies", "Velora Educational Solutions"];
const STARTS = ["2026-10-05", "2026-11-04", "2026-08-31", "2027-01-31", "2026-12-30"];
const org = (key: "A" | "B", name: string) => ({ key, name, short: name.split(" ")[0], domain: `${name.split(" ")[0].toLowerCase()}.example` });
let checked = 0, moved = 0;
for (let i = 0; i < 50; i++) {
  const me: DeskIdentity = { menteeId: `M2611-${String(i + 2).padStart(5, "0")}`, orgs: [org("A", A[i % A.length]), org("B", B[(i * 3) % B.length])], start: STARTS[i % STARTS.length] } as DeskIdentity;
  setDeskIdentity(me);
  for (const t of texts) {
    const shown = toLearner(t);
    assert.equal(toCanon(shown), t, `${me.menteeId} ${me.start}: ${t}`);
    checked++;
    if (shown !== t) moved++;
  }
}
setDeskIdentity(null);
assert.ok(moved > 1000, "names and dates really were swapped");
console.log(`kc ok: ${texts.size} texts × 50 learners round-trip (${checked} checks, ${moved} rewritten)`);
