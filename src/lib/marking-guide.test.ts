import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The marking guide exists in the Guide and is linked from written cells and from the score breakdown.
const read = (p: string) => readFileSync(p, "utf8");
assert.match(read("src/app/app/guide/page.tsx"), /<Sec id="marking"/);
for (const f of ["src/components/desk/work-kinds.tsx", "src/components/app/score-breakdown.tsx"]) assert.match(read(f), /guide#marking/, f);
console.log("ok marking-guide");
