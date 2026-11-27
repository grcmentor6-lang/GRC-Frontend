// The programme's facts live in programme.ts; this pins them to the desk and the server's own files, and fails if a page
// types a programme number that disagrees (the August report's "16-week", "0 of 9", "not shown in the app yet").
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ACCESS_WEEKS, COUNTS, EXAMS, RETAKE_DAYS, SHARE_BONUS_WEEKS, examOpensAfter, helpEntries, orgCounts, programmeFacts, toolbarByWeek } from "./programme";
import { opensAfter } from "./desk/kc";
import type { Desk } from "./desk/model";

const root = join(import.meta.dirname, "../../..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const desk = JSON.parse(read("web/public/desk/sample.json")) as Desk;

const f = programmeFacts(desk);
assert.equal(f.weeks, COUNTS.weeks);
assert.equal(f.tasks, COUNTS.tasks);
assert.equal(f.steps, COUNTS.steps);
assert.equal(f.labs, 5);

const sched = read("backend/app/services/schedule.py");
assert.equal(Number(/ACCESS_DAYS = (\d+) \* 7/.exec(sched)![1]), ACCESS_WEEKS);
assert.equal(Number(/SHARE_BONUS_DAYS = (\d+) \* 7/.exec(sched)![1]), SHARE_BONUS_WEEKS);
assert.equal(Number(/RETAKE_DAYS = (\d+)/.exec(read("backend/app/services/desk_kc.py"))![1]), RETAKE_DAYS);
const checks = JSON.parse(read("backend/_seed/grc101_kc_keys.json")).checks as { id: string; minutes: number; size: number; attempts: number; pass_mark: number | null; week: number }[];
for (const e of EXAMS) {
  const c = checks.find((x) => x.id === e.id)!;
  assert.deepEqual([e.minutes, e.questions, e.attempts, e.passMark, e.week], [c.minutes, c.size, c.attempts, c.pass_mark, c.week], e.id);
}
assert.deepEqual(checks.filter((c) => c.pass_mark !== null).map((c) => c.id), EXAMS.map((e) => e.id), "an exam is missing from EXAMS");

// The toolbar map is the desk's: every section appears once, in the week the desk opens it.
const tb = toolbarByWeek(desk);
assert.equal(tb.flatMap((g) => g.sections).length, desk.secs.filter((s) => s && s.u).length);
assert.ok(tb[0].week === 1 && tb.some((g) => g.week > 1));

// A joint task counts once: LearnTech only lends examples.
const oc = orgCounts(desk);
assert.equal(oc.find((o) => o.role === "main")!.own, COUNTS.tasks);
assert.ok(oc.find((o) => o.role === "examples")!.examplesIn < COUNTS.tasks / 2);

// Help says what is true.
const help = Object.fromEntries(helpEntries(desk));
assert.ok(!/weekly FAQ/i.test(help["Report a problem"]) && /screenshot/.test(help["Report a problem"]));
assert.ok(/every code and term/.test(help["Glossary"]) && !/yet/.test(help["Glossary"]));

// An exam's "opens once you submit …" is the server's own list (W6: the final exam waits for every task).
const seedChecks = JSON.parse(read("backend/_seed/grc101_kc_keys.json")).checks as { id: string; opens_after: string[] }[];
for (const c of seedChecks) assert.deepEqual(opensAfter(desk, c.id), c.opens_after, `${c.id} opens after`);
assert.equal(examOpensAfter(desk, EXAMS[0]), "F1.1–F2.2");
assert.equal(examOpensAfter(desk, EXAMS[1]), "all 25 tasks (F1.1–T12.2)");

// The desk content (the pack's programme rules, kept in sample.json) states the exams and deadlines as the code has them:
// Career prints desk.gates, Home › Waiting On its own lines. No late penalty, grace period, reply deadline or resit window.
const fgeGate = (desk as unknown as { gates: string[] }).gates.find((g) => g.startsWith("Foundation Gate Exam"))!;
assert.ok(fgeGate.includes(`${EXAMS[0].passMark} %`) && fgeGate.includes(`${EXAMS[0].attempts} attempts`) && fgeGate.includes(`${RETAKE_DAYS} days`), fgeGate);
const rules = JSON.stringify({ ...desk, data: undefined, ds: undefined, tasks: undefined, pages: undefined });
for (const re of [/−10 %/, /grace period/i, /within 2 working days/i, /within 24 hours of each submission/i, /23:59 on the due day/])
  assert.ok(!re.test(rules), `sample.json still states a programme rule the platform does not apply: ${re}`);

// No page types a number that disagrees with the facts.
const pages = [
  "web/src/app/app/guide/page.tsx", "web/src/app/app/settings/page.tsx", "web/src/app/app/certificate/page.tsx",
  "web/src/app/app/career/page.tsx", "web/src/app/app/page.tsx", "web/src/app/app/calendar/page.tsx",
  "web/src/components/desk/org-drawer.tsx", "web/src/components/app/exams-card.tsx", "web/src/lib/billing.ts", "web/src/lib/certificate.ts",
];
const banned: [RegExp, string][] = [
  [/16[- ]week/i, "16-week"], [/\b24 weeks\b/, "24 weeks"], [/\b(9|nine) Tech/i, "9 Tech"], [/0 of 9/, "0 of 9"], [/\b35 tasks\b/, "35 tasks"],
  [/not shown in the app yet/i, "scores not shown"], [/weekly FAQ/i, "weekly FAQ"], [/\bfive Tech Labs?\b/i, "five Tech Labs"],
  [/Two organisations|two organisations/, "two organisations"],
];
for (const p of pages) {
  const src = read(p);
  for (const [re, name] of banned) assert.ok(!re.test(src), `${p} hard-codes "${name}": read lib/programme.ts instead`);
}
console.log("programme ok");
