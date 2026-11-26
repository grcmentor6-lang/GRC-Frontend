// Old work on F1.2 … T12.2 is never shown against the rebuilt steps (li-reset.ts). Run: npx tsx src/lib/desk/li-reset.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Progress } from "./progress";
import { LI_MARK, SAVE_VERSION, REBUILT, goes, resetOldWork } from "./li-reset";

const old = {
  done: { "F1.1-1": true, "F1.2-1": true, "T3.2-9": true, "T12.2-6": true },
  picks: { "F1.1-2": "C", "T5.1-4": "A", "T3.2-2": { "A.11": "A.5.34" } },
  answers: { "F1.1-6#hash": "ab", "T3.2-7#hash": "cd", "T3.2:MAP-XW": "x", "T3.2#v": "2" },
  submitted: { "F1.1": "a", "F1.2": "b", "T11.2": "c" },
  msgs: { "F1.1-J2": "A", "T6.2-J4": "B" },
  acks: { "F2.1-3": ["checked"] }, logs: { "F1.1-6": "t", "T7.2-13": "t" },
  grids: { "F1.1|ADM-RULES": { 0: "1" }, "T6.1|UAR-MEMO": { "0,1": "x" } },
  decisions: { "F1.1-D1": { pick: "C" }, "F1.2-D2": { pick: "B" } },
  rowChecks: { "T12.2-3": { rows: {} } },
  kc: { "KC-03": { attempts: [{ n: 1, score: 80 }] } },
  labs: { "TL-36-INF-07-NET02-C": { done: true } },
  savedAt: 5,
} as unknown as Progress;
const before = JSON.stringify(old);
const r = resetOldWork(old);
assert.equal(JSON.stringify(old), before, "the input is not changed");
assert.deepEqual(r.done, { "F1.1-1": true });
assert.deepEqual(r.picks, { "F1.1-2": "C" });
assert.deepEqual(r.answers, { "F1.1-6#hash": "ab", [LI_MARK]: "li1:reset" });
assert.deepEqual(r.submitted, { "F1.1": "a" });
assert.deepEqual(r.msgs, { "F1.1-J2": "A" });
assert.deepEqual(r.acks, {});
assert.deepEqual(r.logs, { "F1.1-6": "t" });
assert.deepEqual(Object.keys(r.grids), ["F1.1|ADM-RULES"]);
assert.deepEqual(r.decisions, { "F1.1-D1": { pick: "C" } });
assert.deepEqual(r.rowChecks, {});
assert.deepEqual(r.kc, old.kc);
assert.deepEqual(r.labs, old.labs);
// Once marked it is new work: read as it is, however often.
assert.equal(resetOldWork(r), r);
const redone = { ...r, done: { ...r.done, "F1.2-1": true } } as Progress;
assert.equal(resetOldWork(redone), redone);
// A learner with no old work is marked and nothing else.
const fresh = resetOldWork({ done: { "F1.1-1": true }, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {} } as Progress);
assert.deepEqual(fresh.answers, { [LI_MARK]: "li1" });
assert.deepEqual(fresh.done, { "F1.1-1": true });
// The mark, F1.1, look-alike keys and sections the reset does not own are never part of it.
for (const [s, k] of [["answers", LI_MARK], ["done", "F1.1-1"], ["done", "F1.10-1"], ["done", "T13.2-1"], ["done", "T3.20-1"], ["done", "XT3.2-1"], ["kc", "KC-03"], ["labs", "T3.2-1"], ["savedAt", "T3.2-1"]])
  assert.equal(goes(s, k), false, `${s} ${k}`);
for (const [s, k] of [["answers", "T3.2#v"], ["grids", "F1.2|frameworks|Framework Library"], ["decisions", "T9.1-D3"], ["msgs", "T6.2-J4"]]) assert.equal(goes(s, k), true, `${s} ${k}`);

// The server matches the same keys (another repository, present on a developer's machine): same tasks, sections, mark.
try {
  const py = readFileSync(join(import.meta.dirname, "../../../../backend/app/services/desk_li101.py"), "utf8");
  const parts = [`MARK = "${LI_MARK}"`, `SAVE_VERSION = "${SAVE_VERSION}"`, 'r"^([FT]\\d+\\.\\d+)(?=$|[-|:#])"', '"done", "picks", "answers", "grids", "msgs", "logs", "acks", "rowChecks", "decisions", "submitted"', '"li1:reset"'];
  for (const part of parts) assert.ok(py.includes(part), `desk_li101.py no longer holds ${part}`);
  const tasks = py.match(/REBUILT = \(([^)]*)\)/)![1].match(/"[^"]+"/g)!.map((x) => x.slice(1, -1));
  assert.deepEqual(tasks, REBUILT, "desk_li101.py REBUILT differs");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
console.log("li-reset ok");
