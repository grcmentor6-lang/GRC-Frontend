/**
 * GRC 101 has no human mentor review (owner, 26 Nov 2026): the public pages, the plan text, the step guides and the
 * register hints must not claim a person grades, samples or reviews the work, and must not list standards GRC 101
 * does not teach. Run: npx tsx src/lib/no-mentor-review.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("../..", import.meta.url));
const read = (p: string) => readFileSync(`${web}/${p}`, "utf8");

const HUMAN = /mentor-graded|human attested|AI[- ]graded|AI mentor grading|graded by an AI mentor|scored against a reviewed|assessors? samples?|by the assessor|reviewed (at|with) (checkpoint|the task|HC\d)|Assessor Notes/i;
const files = [
  "src/app/page.tsx", "src/app/waitlist/page.tsx", "src/app/tracks/[slug]/page.tsx", "src/lib/billing.ts",
  "src/components/landing/desk-demo.tsx", "src/components/landing/chrome.tsx",
  "src/components/desk/step-guides.ts", "src/components/desk/tool-modal.tsx", "src/components/desk/step-text.tsx", "src/lib/desk/registers.ts",
  "../backend/scripts/li101_written.json",
];
for (const f of files) assert.ok(!HUMAN.test(read(f)), `${f} claims a person reviews or grades the work`);

// the programme as it is: one engagement at GlobalConnect Manila, 25 tasks, 12 weeks; ISO/IEC 27001 only
const landing = read("src/app/page.tsx");
assert.ok(!/most of all|"SOC 2", "GDPR"/.test(landing), "landing lists standards GRC 101 does not teach");
assert.match(landing, /GRC 301 and GRC 501/);
const tracks = read("src/app/tracks/[slug]/page.tsx");
assert.ok(!/three simulated|AA-00\d|CIS Controls v8|NIST CSF/.test(tracks), "tracks page still describes the old engagements");
assert.match(tracks, /GlobalConnect/);
assert.match(read("src/lib/billing.ts"), /25 tasks/);
console.log("no-mentor-review: ok");
