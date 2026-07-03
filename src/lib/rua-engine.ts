// Deterministic engine behind the RUA readiness gate — ported from the design mockup's
// window.RUAEngine / window.RUAText. No network: every check, exercise and grade is reproducible
// from the task's RUA catalog entry. The AI mentor (Layer 2) still grades the submitted payload;
// this engine drives the in-workspace exercises and the readiness ledger.

import { RUA_TASKS, type RuaTask } from "./rua-tasks";

/* ── text utilities ── */

const STOP = new Set(
  "a an the of to and or for in on at by with from into as is are be been being this that these those it its their our your his her they them we you i he she which who whom whose what when where why how not no nor only own same so than too very can will just should now then also each every both few more most other some such any all one two per e.g eg ie within before after any given its it's must may might would could each also using use used via across against under over about between".split(/\s+/),
);
export function tokenize(s: string): string[] {
  return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && w.length > 2 && !STOP.has(w));
}
export function keywordSet(s: string): Set<string> {
  return new Set(tokenize(s).filter((w) => w.length > 3));
}
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((x) => { if (b.has(x)) inter++; });
  return inter / (a.size + b.size - inter);
}
/** How much of `pool` vocabulary the answer covers. */
export function coverage(answer: string, pool: Set<string>): number {
  const a = new Set(tokenize(answer));
  if (!pool.size) return 0;
  let hit = 0;
  pool.forEach((x) => { if (a.has(x)) hit++; });
  return hit / pool.size;
}
export function wordCount(s: string): number {
  return (s || "").trim().split(/\s+/).filter(Boolean).length;
}
/** Seeded shuffle so option order is stable per item across renders and sessions. */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = arr.slice();
  let s = 0;
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Similarity above which text counts as "copied" from the source. */
export const PARROT = 0.62;

/* ── exercise generators (deterministic from catalog data) ── */

export interface MicroCheckItem { q: string; options: string[]; answer: string }

/** R1 Study — one comprehension MCQ per control; decoys borrowed across the catalog when short. */
export function microCheck(task: RuaTask, taskCode: string, ctrlIdx: number): MicroCheckItem {
  const c = task.controls[ctrlIdx];
  const others = task.controls.filter((_, i) => i !== ctrlIdx);
  const pool = others.length >= 3
    ? others
    : others.concat(Object.values(RUA_TASKS).flatMap((t) => t.controls).filter((x) => x.name !== c.name));
  const distract = [...new Set(pool.map((x) => x.name))].filter((n) => n !== c.name).slice(0, 3);
  return {
    q: `Which outcome does ${c.ref || "this reference"} actually require?`,
    options: seededShuffle([c.name, ...distract], taskCode + ctrlIdx),
    answer: c.name,
  };
}

export type InspectExerciseItem =
  | { kind: "columns"; prompt: string; picks: { label: string; belongs: boolean }[] }
  | { kind: "purpose"; prompt: string; options: string[]; answer: string };

/** R2 Inspect — tick the fields that belong to THIS template (with decoys), or match its purpose. */
export function inspectExercise(task: RuaTask, taskCode: string, tplIdx: number): InspectExerciseItem {
  const tpl = task.templates[tplIdx];
  if (tpl.fields.length >= 3) {
    const own = tpl.fields;
    const decoyPool = task.templates.filter((_, i) => i !== tplIdx).flatMap((t) => t.fields)
      .concat(Object.values(RUA_TASKS).flatMap((t) => t.templates).flatMap((t) => t.fields));
    const decoys = [...new Set(decoyPool)].filter((f) => !own.includes(f));
    const picks = seededShuffle(
      [
        ...own.map((f) => ({ label: f, belongs: true })),
        ...seededShuffle(decoys, taskCode + tplIdx).slice(0, Math.min(4, Math.max(2, own.length - 2))).map((f) => ({ label: f, belongs: false })),
      ],
      tpl.name,
    );
    return { kind: "columns", prompt: `Tick every field that belongs in the ${tpl.name}.`, picks };
  }
  const purposes = seededShuffle(task.templates.map((t) => t.purpose || t.name), taskCode + tplIdx);
  return { kind: "purpose", prompt: `Which purpose matches the ${tpl.name}?`, options: purposes, answer: tpl.purpose || tpl.name };
}

export interface BoundaryItem { text: string; answer: "in" | "out" }

/** R5 Confirm — borderline scope items, deterministic in/out. */
export function boundaryItems(task: RuaTask, taskCode: string): BoundaryItem[] {
  const noun = task.deliverable;
  const base: BoundaryItem[] = [
    { text: `Producing ${noun.toLowerCase()} to the stated acceptance standard`, answer: "in" },
    { text: "Re-designing the underlying template or grading rubric", answer: "out" },
    { text: "Confirming the control references and cross-walk that govern the task", answer: "in" },
    { text: "Completing a downstream task that merely consumes this deliverable", answer: "out" },
    { text: "Recording residual gaps and owners inside the deliverable", answer: "in" },
  ];
  return seededShuffle(base, taskCode).slice(0, 4);
}

/** R7 Answer — one adaptive follow-up probe per question (deterministic pattern bank). */
export function followUp(qIdx: number): string {
  const bank = [
    "You've given the principle — now apply it to one named system or process in this organisation.",
    "What single piece of evidence would prove that, and who holds it?",
    "Where would that reasoning break down, and how would you catch it?",
    "How would you defend that answer to a sceptical process owner?",
  ];
  return bank[qIdx % bank.length];
}

function taskPool(task: RuaTask): Set<string> {
  return keywordSet([...task.concepts, ...task.controls.map((c) => c.name), task.deliverable, task.objective].join(" "));
}

/* ── graders ── */

export interface ParaphraseGrade { pass: boolean; sim: number; wc: number; reasons: string[] }

export function gradeParaphrase(text: string, source: string): ParaphraseGrade {
  const wc = wordCount(text);
  const sim = jaccard(new Set(tokenize(text)), new Set(tokenize(source)));
  const reasons: string[] = [];
  if (wc < 12) reasons.push("Needs at least ~12 words in your own words.");
  if (sim > PARROT) reasons.push("Too close to the original wording — restate it your way.");
  return { pass: wc >= 12 && sim <= PARROT, sim, wc, reasons };
}

export interface ExplainGrade { pass: boolean; avg: number; dims: number[]; reasons: string[] }

/** Scores 0–4 on accuracy, own-words, depth, example specificity. Pass = avg ≥ 3, no dim < 2. */
export function gradeExplain(explain: string, example: string, concept: string, org: string): ExplainGrade {
  const cov = coverage(explain, keywordSet(concept));
  const sim = jaccard(new Set(tokenize(explain)), new Set(tokenize(concept)));
  const wc = wordCount(explain);
  const orgHit = new RegExp(org.split(/\s+/)[0], "i").test(example || "") || wordCount(example) >= 8;
  const dAcc = cov >= 0.34 ? 4 : cov >= 0.22 ? 3 : cov >= 0.12 ? 2 : cov > 0 ? 1 : 0;
  const dOwn = sim <= 0.45 ? 4 : sim <= PARROT ? 3 : sim <= 0.75 ? 2 : 1;
  const dLen = wc >= 45 ? 4 : wc >= 28 ? 3 : wc >= 16 ? 2 : wc > 0 ? 1 : 0;
  const dEx = orgHit && wordCount(example) >= 14 ? 4 : orgHit ? 3 : wordCount(example) >= 6 ? 2 : wordCount(example) > 0 ? 1 : 0;
  const dims = [dAcc, dOwn, dLen, dEx];
  const avg = dims.reduce((a, b) => a + b, 0) / 4;
  const pass = avg >= 3 && Math.min(...dims) >= 2;
  const reasons: string[] = [];
  if (dAcc < 2) reasons.push("Bring in the concept's core ideas and vocabulary.");
  if (dOwn < 2) reasons.push("Use your own words — this reads as copied.");
  if (dLen < 2) reasons.push("Go a little deeper — one line isn't enough.");
  if (dEx < 2) reasons.push("Ground the example in this organisation.");
  return { pass, avg: Math.round(avg * 10) / 10, dims, reasons };
}

export type AnswerOutcome = "pass" | "partial" | "fail";
export interface AnswerGrade { outcome: AnswerOutcome; score: number; cov: number; reasons: string[] }

export function gradeAnswer(answer: string, followupAnswer: string, task: RuaTask): AnswerGrade {
  const combined = `${answer || ""} ${followupAnswer || ""}`;
  const cov = coverage(combined, taskPool(task));
  const wc = wordCount(answer);
  const fu = wordCount(followupAnswer);
  const orgHit = new RegExp(task.org.split(/\s+/)[0], "i").test(combined);
  let score = 0;
  if (wc >= 18) score++;
  if (cov >= 0.10) score++;
  if (cov >= 0.20) score++;
  if (orgHit || fu >= 10) score++;
  const outcome: AnswerOutcome = score >= 3 ? "pass" : score === 2 ? "partial" : "fail";
  const reasons: string[] = [];
  if (wc < 18) reasons.push("Fuller answer needed — reason it through.");
  if (cov < 0.10) reasons.push("Use the task's real concepts and control language.");
  if (!(orgHit || fu >= 10)) reasons.push("Tie it back to this organisation in your follow-up.");
  return { outcome, score, cov: Math.round(cov * 100) / 100, reasons };
}

/* ── progress model + readiness ledger ── */

export interface StudyRec { passed: boolean; attempts: number }
export interface ClarifyRec { state: "understood" | "query"; paraphrase?: string; query?: { unclear: string; think: string; checked: string[] }; resolution?: string; wasQueried?: boolean }
export interface ConfirmRec { produce: string; acceptWhen: string; boundaries: Record<number, "in" | "out">; accepted: boolean }
export interface ExplainRec { passed: boolean; attempts: number; score: number; explain: string; example: string }
export interface AnswerRec { outcome: AnswerOutcome; answer: string; fu: string }
export interface AttestRec { signature: string; decision: GateDecision; at: string }

export interface RuaProgress {
  study: (StudyRec | null)[];
  inspect: boolean[];
  acquire: boolean[];
  contextAck: boolean;
  clarify: (ClarifyRec | null)[];
  confirm: ConfirmRec | null;
  explain: (ExplainRec | null)[];
  answer: (AnswerRec | null)[];
  answerDone: boolean;
  attest: AttestRec | null;
}

export function emptyProgress(task: RuaTask): RuaProgress {
  return {
    study: task.controls.map(() => null),
    inspect: task.templates.map(() => false),
    acquire: task.acquire.map(() => false),
    contextAck: false,
    clarify: task.steps.map(() => null),
    confirm: null,
    explain: task.concepts.map(() => null),
    answer: task.questions.map(() => null),
    answerDone: false,
    attest: null,
  };
}

export type Rag = "green" | "amber" | "red";
export type GateDecision = "READY" | "CONDITIONAL" | "NOT_READY";
export interface LedgerCriterion { key: string; label: string; state: Rag; critical: boolean; ev: string }
export interface Ledger { criteria: LedgerCriterion[]; decision: GateDecision; watch: string[]; openQueries: boolean }

/** Five readiness criteria + the gate decision (balanced strictness, as in the mockup). */
export function computeLedger(task: RuaTask, p: RuaProgress): Ledger {
  const studyPassed = task.controls.every((_, i) => p.study[i]?.passed);
  const studyCount = task.controls.filter((_, i) => p.study[i]?.passed).length;
  const inspectPassed = task.templates.every((_, i) => p.inspect[i]);
  const inspectCount = task.templates.filter((_, i) => p.inspect[i]).length;
  const acquireAccIdx = task.acquire.map((a, i) => (a.type === "access" ? i : -1)).filter((i) => i >= 0);
  const acquireTplIdx = task.acquire.map((a, i) => (a.type !== "access" ? i : -1)).filter((i) => i >= 0);
  const acquireTplDone = acquireTplIdx.every((i) => p.acquire[i]);
  const acquireAccDone = acquireAccIdx.every((i) => p.acquire[i]);
  const anyAcquire = p.acquire.some(Boolean);
  const stepsUnderstood = task.steps.every((_, i) => p.clarify[i]?.state === "understood");
  const stepsCount = task.steps.filter((_, i) => p.clarify[i]?.state === "understood").length;
  const openQueries = task.steps.some((_, i) => p.clarify[i]?.state === "query");
  const confirmAccepted = !!p.confirm?.accepted;
  const explainPassed = task.concepts.every((_, i) => p.explain[i]?.passed);
  const explainCount = task.concepts.filter((_, i) => p.explain[i]?.passed).length;
  const answerFails = task.questions.filter((_, i) => p.answer[i]?.outcome === "fail").length;
  const answerPartials = task.questions.filter((_, i) => p.answer[i]?.outcome === "partial").length;
  const answerPass = p.answerDone && answerFails === 0;

  const c1: Rag = studyPassed && explainPassed ? "green" : studyPassed && explainCount >= Math.ceil(task.concepts.length * 0.6) ? "amber" : studyPassed ? "amber" : "red";
  const c2: Rag = inspectPassed && acquireTplDone && !openQueries ? "green" : inspectPassed && acquireTplDone ? "amber" : "red";
  const c3: Rag = acquireAccIdx.length === 0 ? (acquireTplDone ? "green" : "red") : acquireAccDone ? "green" : anyAcquire ? "amber" : "red";
  const c4: Rag = answerPass && answerPartials === 0 ? "green" : answerPass ? "amber" : "red";
  const c5: Rag = confirmAccepted && stepsUnderstood ? "green" : confirmAccepted || stepsUnderstood ? "amber" : "red";

  const criteria: LedgerCriterion[] = [
    { key: "c1", label: "Control references studied and their intent explained in own words", state: c1, critical: true, ev: `${studyCount}/${task.controls.length} controls · ${explainCount}/${task.concepts.length} concepts mastered` },
    { key: "c2", label: "Prerequisite inputs and templates obtained, read and questions resolved", state: c2, critical: false, ev: `${inspectCount}/${task.templates.length} templates · ${openQueries ? "open query" : "no open queries"}` },
    { key: "c3", label: "Stakeholders, access and scheduling identified and requested", state: c3, critical: false, ev: acquireAccIdx.length ? `${acquireAccIdx.filter((i) => p.acquire[i]).length}/${acquireAccIdx.length} access items confirmed` : "no external access required" },
    { key: "c4", label: "Understanding-verification questions answered to standard", state: c4, critical: true, ev: p.answerDone ? `${task.questions.length - answerFails - answerPartials}/${task.questions.length} passed${answerPartials ? ` · ${answerPartials} partial` : ""}${answerFails ? ` · ${answerFails} fail` : ""}` : "session not sat" },
    { key: "c5", label: "Scope, deliverable and quality expectations confirmed", state: c5, critical: false, ev: `${confirmAccepted ? "contract accepted" : "contract open"} · ${stepsCount}/${task.steps.length} steps` },
  ];

  const anyRed = criteria.some((c) => c.state === "red");
  const criticalAmber = criteria.some((c) => c.critical && c.state === "amber");
  let decision: GateDecision;
  if (criteria.every((c) => c.state === "green")) decision = "READY";
  else if (anyRed || openQueries || criticalAmber) decision = "NOT_READY";
  else decision = "CONDITIONAL";

  return { criteria, decision, watch: criteria.filter((c) => c.state !== "green").map((c) => c.label), openQueries };
}
