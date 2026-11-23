// Every table column says what it holds, and no description names a column that is not there. Run: npx tsx src/lib/desk/col-what.test.ts
import assert from "node:assert";
import { COL_WHAT } from "./col-what";
import { REGISTERS } from "./registers";

const bare: string[] = [];
for (const [k, r] of Object.entries(REGISTERS)) for (const c of r.cols) if (!c.auto && !c.what) bare.push(`${k} · ${c.h}`);
assert.deepStrictEqual(bare, [], "columns with no description");

const stray: string[] = [];
for (const [k, m] of Object.entries(COL_WHAT)) {
  if (k === "*") continue;
  const r = REGISTERS[k];
  for (const h of Object.keys(m)) if (!r?.cols.some((c) => c.h === h)) stray.push(`${k} · ${h}`);
}
assert.deepStrictEqual(stray, [], "descriptions for columns that do not exist");
const all = Object.values(REGISTERS).flatMap((r) => r.cols.map((c) => c.h));
assert.deepStrictEqual(Object.keys(COL_WHAT["*"]).filter((h) => !all.includes(h)), [], "shared descriptions for headings no table has");
for (const r of Object.values(REGISTERS)) for (const c of r.cols) assert.ok(!c.what || c.what.length <= 80, `too long: ${c.h}: ${c.what}`);
console.log("col-what ok");
