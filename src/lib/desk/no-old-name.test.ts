/**
 * The group's old name must not come back (owner, 24 Nov 2026): no file a learner, mentor or grader can be shown
 * may spell it, in any case, and no file may be named with it. Run: npx tsx src/lib/desk/no-old-name.test.ts
 *
 * Two files may: the reader of old saved work and its test. The build scripts (web/scripts) may too, because the
 * pack still uses the old name and they rename it as they read (scripts/group_name.py); they are not under src/.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("../../..", import.meta.url));
const ALLOWED = new Set(["src/lib/desk/old-names.ts", "src/lib/desk/old-names.test.ts"]);
const old = new RegExp("bk" + "b", "i");

const found: string[] = [];
let read = 0;
for (const root of ["src", "public/desk"]) {
  for (const e of readdirSync(join(web, root), { recursive: true, withFileTypes: true })) {
    const path = join(e.parentPath, e.name);
    const rel = relative(web, path).split(sep).join("/");
    if (old.test(e.name)) found.push(`${rel} (its name)`);
    if (!e.isFile() || ALLOWED.has(rel)) continue;
    read++;
    const at = readFileSync(path, "latin1").split("\n").findIndex((l) => old.test(l));
    if (at >= 0) found.push(`${rel}:${at + 1}`);
  }
}
assert.ok(read > 300, `only ${read} files read: the folders have moved`);
assert.deepEqual(found, [], "the group's old name is back; it is SITL now");
assert.ok(readFileSync(join(web, "public/desk/sample.json"), "utf8").includes("SITL-POL-006"), "sample.json carries the new codes");

console.log(`no-old-name: ok (${read} files)`);
