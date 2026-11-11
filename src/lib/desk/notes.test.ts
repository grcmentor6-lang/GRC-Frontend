// Every place a note names is there (tester, 5 Nov: "Rule R26 is in  :"). A note or message built from a value that came
// out empty reads "is in :", "read on ." or "Section  2"; this renders every register's step notes and the desk's
// message texts and fails on that shape.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTERS } from "./registers";
import { EMPTY } from "./progress";

const desk = JSON.parse(readFileSync(join(import.meta.dirname, "../../../public/desk/sample.json"), "utf8"));
const empty = / (?:in|on|at|from|of) [.:;,]|[^\s] {2,}[^\s]|\(\s*\)/;
const bad: string[] = [];
let n = 0;
for (const [k, r] of Object.entries(REGISTERS)) {
  for (const [st, f] of Object.entries(r.note ?? {})) {
    n++;
    const s = f(desk, EMPTY);
    if (empty.test(s)) bad.push(`${k} note ${st}: ${s.match(new RegExp(`.{0,40}${empty.source}.{0,20}`))?.[0]}`);
  }
  for (const [st, s] of Object.entries({ ...r.readHow, ...r.screen })) if ((n++, empty.test(s))) bad.push(`${k} ${st}: ${s}`);
}
for (const [id, m] of Object.entries(desk.inj as Record<string, { notice?: string }>)) if (m.notice && (n++, / is in:/.test(m.notice) || empty.test(m.notice))) bad.push(`${id}: ${m.notice.slice(0, 80)}`);
assert.deepEqual(bad, [], bad.join("\n"));
console.log(`notes.test: ${n} notes and messages name every place`);
