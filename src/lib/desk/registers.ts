import type { Desk, Task } from "./model";
import { bullets, docLines, docNow, docTable } from "./docs";
import type { Progress } from "./progress";
import UAR from "./uar-t61.json";
import LVR from "./lvr-t62.json";
import RRU from "./rru-t71.json";
import TOP from "./top-t72.json";
import VUL from "./vul-t81.json";
import CT from "./ct-t82.json";
import VEN from "./ven-t91.json";
import SOC from "./soc-t92.json";
import ROPA from "./ropa-t101.json";
import BRC from "./brc-t102.json";
import AWRD from "./awr-t111.json";
import REGD from "./reg-t112.json";
import ACTD from "./act-t121.json";
import AUDD from "./aud-t122.json";

/**
 * A task's deliverable as a template register the steps fill column by column (T-FAM, T-OBL …).
 * Columns and step wording are the engine's (GRC101_Engine/p_tasks.py); given rows are the mentee's
 * dataset (Sample_Packs/mentee/<id>/Datasets_*.xlsx). Cells left "" are the mentee's to fill.
 *
 * ponytail: rows are the sample mentee's (M2610-00001), like public/desk/sample.json. Phase 1 serves
 * them per mentee from /me/desk with the rest of the content.
 */
export interface Register {
  /** Template code, as the step names it. */
  code: string;
  title: string;
  /** Steps that show it in place of their tool: the ones that fill it and the ones that read it. */
  on: number[];
  cols: {
    h: string;
    /** A drop-down: "step" takes the options of the step that fills it, a list is the template's own, a
     *  function reads them from a document (T3.1: the policies of the BKB-POL-000 index). */
    opts?: "step" | string[] | ((desk: Desk, row: string[]) => string[] | undefined);
    /** Numbered by the platform, never typed: "OBL" → OBL-01, OBL-02 … */
    auto?: string;
    /** A long heading over short values: it wraps rather than widen the table. */
    wrap?: boolean;
    /** The column's least width in px, for long values (T3.1: an obligation's text). */
    w?: number;
    /** A list of IDs ("E-015 Accept, E-019 Reject"): each item kept on one line, and on a phone the column becomes a
     *  full-width line under its row, so it reads without a sideways scroll (T5.2 EVP-GAP). */
    list?: boolean;
    /** A sentence (a draft, a fact): on a phone it becomes a full-width line under its row, as written; "always" at every
     *  width (T7.1's three drafts of a risk statement, read one under the other). */
    prose?: boolean | "always";
  }[];
  /** Given rows; empty for a register the mentee builds row by row (see `grow`). */
  rows: string[][];
  /**
   * A register built from nothing: the mentee adds rows, up to `target`. `adds` is step → the
   * fewest rows that step must add (0: it may add some); a step not listed fills its columns on
   * every row, and a step with no columns is done when the register has exactly `target` rows.
   */
  grow?: {
    target: number;
    adds: Record<number, number>;
    /** Rows the adding steps may reach before the trimming step (T3.1: 17 candidates, then 15). */
    cap?: number;
    /** The step that brings the register down to `target`, with a remove button on every row. */
    trim?: number;
    /** Rows that must stay among the `target` (T3.1: at least 3 contract rows, KR2). */
    keep?: { col: number; value: string; min: number };
    /** Rows the trimming step must remove (T3.1: the overlays that bind neither office), and why. */
    drop?: { bad: (row: string[], desk: Desk) => boolean; why: (desk: Desk) => string };
  };
  /** Step → columns shown read-only beside the ones it fills (T3.1 step 6: what each row is). */
  view?: Record<number, number[]>;
  /** Step → a line said above the step's work: where its rows come from and how many there are. */
  note?: Record<number, (desk: Desk, p: Progress) => string>;
  /** Step → how to read the cited sources, said in the "Read from" banner above the table (which
   *  stays in view while a document window covers the step panel). Where to look, never the answer. */
  readHow?: Record<number, string>;
  /** Documents the register's checks read; loaded when it is shown. */
  load?: string[];
  /** Step → rows split at rule R10's joints ("and", ";"): the rows added by `from`, in column `col`. */
  split?: Record<number, { col: number; from: number }>;
  /** Step → the name of a decision's second part, where the column it fills does not name it. */
  then?: Record<number, string>;
  /** The step whose second part compares each office's clock with a second source (T3.1 step 7). */
  compare?: { step: number; col: number };
  /** Sources a step reads from that its own refs do not name (or name only as a whole document). */
  extra?: Record<number, [string, string[]][]>;
  /** What the line beside the step says of the grey rows, where they are not a pattern to copy (T7.1: the register's
   *  existing risks, some of whose acceptance authorities break rule R36). */
  worked?: string;
  /** Rows the mentee fills; the others are worked examples, read-only. */
  mine: (row: string[], desk: Desk) => boolean;
  /** Step number → the columns it fills. */
  steps: Record<number, number[]>;
  /** Column → a value the platform writes from other cells of the row, never typed (F1.2 F: the rules
   *  that filled the row). Shown beside a step that fills one of its inputs, unless a step fills the
   *  column itself: there `value` gives null on the rows the mentee fills (F2.2: an accepted item's
   *  defect code is "none" by itself, a rejected item's is chosen). */
  derived?: Record<number, { from: number[]; value: (v: (ci: number) => string, p: Progress) => string | null; /** Not shown beside the step that fills its source (no part of that step's work); seen in the hand-in. */ quiet?: boolean }>;
  /** Column → how a typed value is read: the value as recorded, or null when it is not one the step's
   *  own instruction allows (a format check, never an answer key), and what to say then. `row` is the
   *  row as filled so far (given cells and the mentee's). */
  cells?: Record<number, { fix: (v: string, row: string[], desk: Desk, ri: number, by: number) => string | null; hint: (row: string[], desk: Desk, ri: number, by: number) => string }>;
  /** Column → rows the pack gives no content for: shown "Awaiting content", not filled, not counted.
   *  `row` is the row as filled so far. */
  awaiting?: Record<number, (row: string[], ri: number, by: number) => boolean>;
  /** What the note above the table says about the awaiting cells (default: F1.2's office rows). */
  awaitingNote?: (desk: Desk, n?: number) => string;
  /** Step → the rows that step works on, where it is not every row (T3.2 steps 10–11: the 12 deep-dive
   *  controls of the 93). The others are not shown and not counted. */
  only?: Record<number, (row: string[], p: Progress) => boolean>;
  /** The step whose second part runs a consistency check (T3.2 step 12, "Check consistency"): the rows
   *  `bad` flags are listed, and fixed in column `col`. `why` says what breaks the rule on a row. */
  consistency?: { step: number; col: number; bad: (row: string[], desk: Desk) => boolean; why: (row: string[], desk: Desk) => string; also?: string };
  /** Step → the column whose value is the same on every row: once the first row is right, "Copy to every row". */
  fillDown?: Record<number, number>;
  /** The step that hands the register in, the columns in which no cell may be empty, and the columns
   *  that name the row there (default: `ident`). */
  handIn?: { step: number; cols: number[]; ident?: number[] };
  /** The columns that say which row it is, shown beside the columns a step fills (default: every
   *  column before the first one it fills). The first stays in view when the table scrolls sideways. */
  ident?: number[];
  /** Step number → a per-row decision checked against the key once every row is decided
   *  (POST /me/desk/rows, key "<task>-<step>"): `label` is the column naming the row, `col` the decided one. */
  checkRows?: Record<number, RowCheckSpec>;
  /** Step number → a question-in-order rule that helps choose the value of a column, one row at a time. */
  helper?: Record<number, { rule: string; col: number }>;
  /** Step number → the platform screens the step reads from, beyond the one it is done in. The toolbar
   *  marks each with the step's dot, as it marks the step's own tool. */
  reads?: Record<number, string[]>;
  /**
   * Step number → a decision tree walked one row at a time (F2.1: BKB-STD-001 Section 5). Its questions are the
   * document's own lines ("question? → outcome"); the walk writes the row's path and tier, which are
   * never typed. The tier is the mentee's decision: nothing here says whether it is right.
   */
  tree?: Record<number, { doc: string; sec: string; path: number; tier: number }>;
  /**
   * Step number → a checklist walked one row at a time (F2.2: rule R09, the checks D1–D10 of a reference
   * page in order). `reads` is the column each check reads. Any check marked as failing records `fail`
   * in column `col`; none failing records `pass`. The mentee's decision: nothing here says which fails.
   */
  checklist?: Record<number, ChecklistSpec>;
  /** The step whose second part reports items whose column `col` shows unmasked data (F2.2 step 4, D9):
   *  "Report data issue" on the row, never a copy of it. `clean` is the column's value when nothing shows. */
  report?: { step: number; col: number; clean: string };
}

const A = (row: string[], desk: Desk) => row[0] === desk.orgs.A.name;
const addendum = (desk: Desk) => (desk.orgs.A as { addendum?: string }).addendum ?? "";
/** Copy checks: spacing and case aside, the same words. */
const same = (a: string, b: string) => a.trim().replace(/\s+/g, " ").toLowerCase() === b.trim().replace(/\s+/g, " ").toLowerCase();
/** A document reference typed with or without the word "section", a pasted section sign, dashes and spaces. */
const norm = (x: string) => x.toLowerCase().replace(/^source:\s*/, "").replace(/sections?/g, "").replace(/[\s\u00a7—–-]/g, "");
const ordinal = (i: number) => ["the first", "the second", "the third", "the fourth", "the fifth"][i] ?? `number ${i + 1}`;
/** BKB-ADD-16 Section 4: each interested party with its requirements (null until the addendum is loaded). */
const parties = (desk: Desk) => docTable(addendum(desk), "4")?.map((r) => [r[0], bullets(r[1]), r[2] ?? "", r[3] ?? ""] as [string, string[], string, string]) ?? null;
/** Same parts in any order and case ("DPA 2012; GDPR" = "gdpr; DPA 2012"). */
const sameParts = (a: string, b: string) => {
  const parts = (x: string) => x.split(";").map((y) => y.trim().replace(/\s+/g, " ").toLowerCase()).filter(Boolean).sort().join(";");
  return parts(a) === parts(b);
};

/** "Manila, Philippines" → "Manila". */
const city = (o: string) => o.split(",")[0].trim();
/** T3.1's sources, as the documents on screen have them (empty until loaded). */
const obl = {
  /** The task's two offices: the home office and the second office its objective names. */
  offices: (d: Desk) => d.orgs.A.offices.filter((o) => d.tasks["T3.1"]?.obj.includes(o)),
  /** An office's Section 2 row: [office, law, authority, breach notification, cyber law, transfer]. */
  row: (d: Desk, office: string) => (office ? docTable(addendum(d), "2")?.find((r) => r[0].startsWith(office)) : undefined),
  lines21: (d: Desk) => docLines(addendum(d), "2.1"),
  rows6: (d: Desk) => docTable(addendum(d), "6"),
  listed3: (d: Desk) => [...(obl.lines21(d) ?? []), ...(obl.rows6(d)?.map((r) => r[1]) ?? [])],
  keyReqs: () => docTable("Organization_Profiles", "1")?.flatMap((r) => bullets(r[1])) ?? [],
  /** BKB-ADD-16 Section 2.2: [from, obligation, article, deadline, process, evidence] for each obligation. */
  details: (d: Desk) => docTable(addendum(d), "2.2") ?? [],
  /** The Section 2.2 rows a register row can take its details from: a Section 2 row (or a duty split from it) any of
   *  its office's; any other row the one with its own obligation. */
  detailRows: (d: Desk, r: string[], by: number) =>
    obl.details(d).filter((x) => (by === 1 || by === 2 ? x[0] === `Section 2 ${r[5]}` : same(x[1], r[1]))),
  /** BKB-POL-000 Section 3: [id, title, owner] of each policy (not the separate documents). */
  policies: () => docTable("BKB-POL-000", "3")?.filter((r) => r[0].startsWith("BKB-POL-")).map((r) => [r[0], r[1], r[2]] as [string, string, string]) ?? [],
  /** Where a row was copied from, by the step that added it. */
  ref: (d: Desk, ob: string, by: number) => {
    if (by === 1 || by === 2) return `${addendum(d)} Section 2`;
    if (by === 4) return "Organization_Profiles — Key Requirements";
    if (by === 3) return obl.lines21(d)?.some((x) => same(x, ob)) ? `${addendum(d)} Section 2.1` : obl.rows6(d)?.some((r) => same(r[1], ob)) ? `${addendum(d)} Section 6` : null;
    return null;
  },
};

/** Learn › Reference pages › Ref-27000 family: its ten document rows. */
const fam = (d: Desk) => (d.pages["Ref-27000 family"]?.r ?? []).filter((r) => !String(r[0]).startsWith("PDCA")) as string[][];
const famRow = (d: Desk, doc: string) => fam(d).find((r) => r[0] === doc);
/** Rule L02's requirement documents: "Requirements = ISO/IEC 27001, ISO/IEC 27006-1, ISO/IEC 17021-1." */
const l02 = (d: Desk) => (d.rules.L02?.[1].match(/Requirements = ([^.]+)\./)?.[1] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
/** Rule L01's PDCA phase for a clause ("Clauses 4, 5, 6, 7 → Plan; clause 8 → Do; …"). */
const l01 = (d: Desk, clause: number) =>
  [...(d.rules.L01?.[1] ?? "").matchAll(/[Cc]lauses? ([\d, ]+) → (\w+)/g)].find((m) => m[1].split(",").map((x) => +x.trim()).includes(clause))?.[2] ?? "";
/** Learn › Reference pages › Ref-ISMS processes: [process, owner] rows. */
const isms = (d: Desk) => (d.pages["Ref-ISMS processes"]?.r ?? []) as string[][];
/** The Manila departments of BKB-ADD-16 Section 8.1, in the order they first appear. */
const depts = (d: Desk) => {
  const t = docTable(addendum(d), "8.1");
  return t ? [...new Set(t.filter((r) => r[1] === office(d)).map((r) => r[2]))] : null;
};

/** ISO/IEC 27001:2022 Annex A: the 93 controls, as Learn › Reference pages › Ref-27002 attributes lists
 *  them (control, title). The LI-05 template is "pre-filled with the 93 control IDs and titles". */
const ANNEX_A: [string, string][] = [["A.5.1","Policies for information security"],["A.5.2","Information security roles and responsibilities"],["A.5.3","Segregation of duties"],["A.5.4","Management responsibilities"],["A.5.5","Contact with authorities"],["A.5.6","Contact with special interest groups"],["A.5.7","Threat intelligence"],["A.5.8","Information security in project management"],["A.5.9","Inventory of information and other associated assets"],["A.5.10","Acceptable use of information and other associated assets"],["A.5.11","Return of assets"],["A.5.12","Classification of information"],["A.5.13","Labelling of information"],["A.5.14","Information transfer"],["A.5.15","Access control"],["A.5.16","Identity management"],["A.5.17","Authentication information"],["A.5.18","Access rights"],["A.5.19","Information security in supplier relationships"],["A.5.20","Addressing information security within supplier agreements"],["A.5.21","Managing information security in the ICT supply chain"],["A.5.22","Monitoring, review and change management of supplier services"],["A.5.23","Information security for use of cloud services"],["A.5.24","Information security incident management planning and preparation"],["A.5.25","Assessment and decision on information security events"],["A.5.26","Response to information security incidents"],["A.5.27","Learning from information security incidents"],["A.5.28","Collection of evidence"],["A.5.29","Information security during disruption"],["A.5.30","ICT readiness for business continuity"],["A.5.31","Legal, statutory, regulatory and contractual requirements"],["A.5.32","Intellectual property rights"],["A.5.33","Protection of records"],["A.5.34","Privacy and protection of PII"],["A.5.35","Independent review of information security"],["A.5.36","Compliance with policies, rules and standards for information security"],["A.5.37","Documented operating procedures"],["A.6.1","Screening"],["A.6.2","Terms and conditions of employment"],["A.6.3","Information security awareness, education and training"],["A.6.4","Disciplinary process"],["A.6.5","Responsibilities after termination or change of employment"],["A.6.6","Confidentiality or non-disclosure agreements"],["A.6.7","Remote working"],["A.6.8","Information security event reporting"],["A.7.1","Physical security perimeters"],["A.7.2","Physical entry"],["A.7.3","Securing offices, rooms and facilities"],["A.7.4","Physical security monitoring"],["A.7.5","Protecting against physical and environmental threats"],["A.7.6","Working in secure areas"],["A.7.7","Clear desk and clear screen"],["A.7.8","Equipment siting and protection"],["A.7.9","Security of assets off-premises"],["A.7.10","Storage media"],["A.7.11","Supporting utilities"],["A.7.12","Cabling security"],["A.7.13","Equipment maintenance"],["A.7.14","Secure disposal or re-use of equipment"],["A.8.1","User endpoint devices"],["A.8.2","Privileged access rights"],["A.8.3","Information access restriction"],["A.8.4","Access to source code"],["A.8.5","Secure authentication"],["A.8.6","Capacity management"],["A.8.7","Protection against malware"],["A.8.8","Management of technical vulnerabilities"],["A.8.9","Configuration management"],["A.8.10","Information deletion"],["A.8.11","Data masking"],["A.8.12","Data leakage prevention"],["A.8.13","Information backup"],["A.8.14","Redundancy of information processing facilities"],["A.8.15","Logging"],["A.8.16","Monitoring activities"],["A.8.17","Clock synchronisation"],["A.8.18","Use of privileged utility programs"],["A.8.19","Installation of software on operational systems"],["A.8.20","Networks security"],["A.8.21","Security of network services"],["A.8.22","Segregation of networks"],["A.8.23","Web filtering"],["A.8.24","Use of cryptography"],["A.8.25","Secure development life cycle"],["A.8.26","Application security requirements"],["A.8.27","Secure system architecture and engineering principles"],["A.8.28","Secure coding"],["A.8.29","Security testing in development and acceptance"],["A.8.30","Outsourced development"],["A.8.31","Separation of development, test and production environments"],["A.8.32","Change management"],["A.8.33","Test information"],["A.8.34","Protection of information systems during audit testing"]];

/** A per-row decision checked before Mark complete: the column naming the row, the decided column, and,
 *  where the answer follows from the learner's own row by the step's rule (T3.2 step 4, R11 on the row's
 *  control, policy and procedure), that rule: checked on the desk, with no key from the backend. */
/** `rule`: the answer follows from the row's own cells by the step's rule (checked on the desk, no key);
 *  an empty `best` means the rule gives none for that row, which is then not scored. */
/** See `Register.checklist`. `codes`: the column that records the code of every check marked failing ("D4; D6"), or
 *  "none" (T5.2: rule R09's "write every failed code"); without it the first failing check records the decision. */
export type ChecklistSpec = {
  page: string; col: number; reads: Record<string, number | number[]>; pass: string; fail: string; codes?: number;
  /** The checks, where they are not a reference page's rows (T6.2 step 4: the five systems of the leaver in hand). A
   *  check with no text is named by its code alone. */
  checks?: () => string[][];
  /** The word on a check's button (default "Fails"; T6.2: "Late"). */
  mark?: string;
  /** The columns that name the row in hand above its checks (default the first two; T6.2: the leaver's SLA too). */
  head?: number[];
  /** The line above the checks, where "Check each of your items against <first> to <last>" does not fit. */
  line?: string;
};
export type RowCheckSpec = {
  label: number;
  col: number;
  rule?: (row: string[], desk: Desk) => { best: string; why: string };
  /** The column the key is looked up by, where it is not `label` (T3.1 step 5: a policy per Process). */
  ask?: number;
};

/** T4.1 POL-CUR's six checks and the field of BKB-POL-006 Section 11 each copies (platform-written, item 57). */
const CURRENCY: [string, string][] = [
  ["Document owner is named", "Document owner"],
  ["Approved by the approver BKB-POL-000 Section 2 sets for a policy", "Approved by"],
  ["Effective date is set", "Effective date"],
  ["Next review is no more than 12 months after the effective date (BKB-POL-000 Section 7)", "Next review"],
  ["Status is final: ratified, not a draft", "Status"],
  ["Communication and attestation by the workforce is recorded (BKB-POL-000 Section 7)", "Workforce communication and attestation"],
];
/** T4.1 LI-06: the seven items of ISO/IEC 27001:2022 clause 5.2 a)–g), in our words, and L08's key word for each. */
const CL52: [string, string][] = [
  ["5.2 a) Appropriate to the purpose of the organisation", "purpose"],
  ["5.2 b) Includes information security objectives, or a framework for setting them", "objectives"],
  ["5.2 c) A commitment to satisfy applicable requirements", "requirements"],
  ["5.2 d) A commitment to continual improvement of the ISMS", "continual improvement"],
  ["5.2 e) Available as documented information", "documented information"],
  ["5.2 f) Communicated within the organisation", "communicated"],
  ["5.2 g) Available to interested parties, as appropriate", "interested parties"],
];

/** Distinct values, sorted: a drop-down's options never give away the order of the source. */
const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b));
/** T4.2: rule R14's six fixed SOP steps, and the line of BKB-POL-021 Section 6.1 each carries out. Section 6.1 step 4 (onboarding)
 *  follows the approval and has no SOP step of its own. */
const R14_STEPS = ["1 Trigger received", "2 Check input", "3 Do the action", "4 Record", "5 Tell the owner", "6 Exception: escalate"];
const R14_LINE = [1, 2, 3, 5, 6, 7];
const R14_WHY = [
  "the procedure starts when the business owner submits the request",
  "the request is checked by the vendor assessment before anything is agreed",
  "the action this SOP exists for is the approval, which the architecture review gives as the approved design; onboarding (Section 6.1 step 4) follows once the service is approved",
  "the service is recorded in the cloud service register",
  "the business owner is told the decision",
  "a request that cannot meet the policy is escalated",
];
/** BKB-POL-021 Section 6.1: [step, action, responsible, "output — time limit"] ([] until loaded). */
const pol021 = () => docTable("BKB-POL-021", "6.1") ?? [];
const outOf = (cell: string) => cell.split(" — ")[0].trim();
const limitOf = (cell: string) => { const x = (cell.split(" — ")[1] ?? "").trim(); return x.charAt(0).toUpperCase() + x.slice(1); };
const sopLine = (r: string[]) => { const i = R14_STEPS.indexOf(r[0]); return i < 0 ? undefined : { i, n: R14_LINE[i], line: pol021().find((x) => x[0] === String(R14_LINE[i])) }; };
/** BKB-ADD-36 Section 5's BKB-POL-021 rows: [policy, title, "New cloud service approval (Section 6.1): <output>", value]. */
const add36 = () => (docTable("BKB-ADD-36", "5") ?? []).filter((r) => r[0] === "BKB-POL-021");
/** BKB-POL-021 Section 8: the escalation contact of the policy's procedures ("" until loaded). */
const escalationContact = () => (docLines("BKB-POL-021", "8") ?? []).join(" ").match(/escalation contact for the procedures of this policy is the policy owner, the ([^.]+)\./)?.[1] ?? "";
function sopAction(r: string[]): { best: string; why: string } {
  const at = sopLine(r);
  if (!at?.line) return { best: "", why: "" };
  return { best: at.line[1], why: `R14's ${r[0].slice(2)} is Section 6.1 step ${at.n}: ${R14_WHY[at.i]}.` };
}
function sopLimit(r: string[]): { best: string; why: string } {
  const at = sopLine(r);
  if (!at?.line) return { best: "", why: "" };
  const pol = limitOf(at.line[3]);
  const add = add36().find((x) => x[2].endsWith(`: ${outOf(at.line![3])}`))?.[3];
  return add
    ? { best: add, why: `Section 6.1 step ${at.n} gives “${pol}”; BKB-ADD-36 Section 5 gives “${add}”. An addendum may only tighten a Group value (BKB-POL-000 Section 5), so LearnTech's applies.` }
    : { best: pol, why: `Section 6.1 step ${at.n} gives “${pol}”, and BKB-ADD-36 Section 5 sets no value of its own for it.` };
}
function sopRole(r: string[]): { best: string; why: string } {
  const at = sopLine(r);
  return at?.line ? { best: at.line[2], why: `Section 6.1 step ${at.n} names ${at.line[2]} as Responsible.` } : { best: "", why: "" };
}
function sopOutput(r: string[]): { best: string; why: string } {
  const at = sopLine(r);
  return at?.line ? { best: outOf(at.line[3]), why: `Section 6.1 step ${at.n}'s output is ${outOf(at.line[3])}.` } : { best: "", why: "" };
}
/** BKB-POL-021 Section 5, Roles and responsibilities: [role, responsibility] ([] until loaded). */
const pol021Roles = () => docTable("BKB-POL-021", "5") ?? [];
const POL021_ROLES = ["Policy owner — Security Architecture & Standards Manager", "Org CEO", "Org CISO / CRCO / DPO", "Regional Managing Director & Compliance Officer", "Department / asset owners", "Group GRC AI agents", "Internal Audit", "All workforce"];
function sopResp(r: string[]): { best: string; why: string } {
  const x = pol021Roles().find((y) => y[0] === r[0]);
  return x ? { best: x[1], why: `BKB-POL-021 Section 5 gives ${r[0]}: “${x[1]}”.` } : { best: "", why: "" };
}
/** BKB-POL-000 Section 3: the owner of BKB-POL-021, the "policy owner" its procedures answer to ("" until loaded). */
const pol021Owner = () => docTable("BKB-POL-000", "3")?.find((r) => r[0] === "BKB-POL-021")?.[2] ?? "";
/** T4.2 LI-07's document-control block: each field, the value BKB-POL-000 Section 7.1 gives it for this SOP, and why. */
const META: [string, (o: string) => string, (o: string) => string][] = [
  ["Document ID", () => "BKB-POL-021-PR-6.1", () => "Section 7.1: the policy's ID, then -PR-, then the procedure's section: the SOP carries out BKB-POL-021 Section 6.1."],
  ["Version", () => "1.0", () => "Section 7.1: a procedure is 1.0 at its first approval."],
  ["Document owner", (o) => o, (o) => `Section 7.1: the owner of the policy it implements. BKB-POL-000 Section 3 lists ${o} as BKB-POL-021's owner.`],
  ["Approved by", (o) => o, (o) => `Section 7.1 points to Section 2, where a procedure (level 4) is approved by the policy owner: for BKB-POL-021, ${o} (Section 3).`],
  ["Effective date", () => "The date of approval", () => "Section 7.1: a procedure takes effect on the date it is approved."],
  ["Next review", () => "12 months after the effective date", () => "Section 7.1: 12 months after the effective date, or earlier on a trigger (Section 7)."],
];
const ROLES_T42 = ["Group CISO", "Group GRC Steering Committee", "Org CISO", "Policy & Governance Analyst", "Security Architect", "Security Architecture & Standards Manager"];
const META_OPTS: Record<string, string[]> = {
  "Document ID": ["BKB-ADD-36-PR-6.1", "BKB-POL-006-PR-6.3", "BKB-POL-021-6.1", "BKB-POL-021-PR-6.1"],
  Version: ["0.1", "1.0", "1.1", "2.0"],
  "Document owner": ROLES_T42,
  "Approved by": ROLES_T42,
  "Effective date": ["2026-10-01", "The date of approval", "The date of submission"],
  "Next review": ["12 months after the effective date", "24 months after the effective date", "2027-09-30"],
};
function metaValue(r: string[]): { best: string; why: string } {
  const m = META.find(([f]) => f === r[0]);
  const o = pol021Owner();
  return m && o ? { best: m[1](o), why: m[2](o) } : { best: "", why: "" };
}
const LIFE_ROLES = ["Business owner", "Group CISO", "Group General Counsel", "Policy & Governance Analyst", "Security Architect", "Security Architecture & Standards Manager"];
function lifeWho(r: string[]): { best: string; why: string } {
  const row = docTable("BKB-POL-000", "7.1", 1)?.find((x) => x[0] === r[0]);
  const o = pol021Owner();
  if (!row || !o) return { best: "", why: "" };
  const owner = row[1].startsWith("Policy owner");
  const best = owner ? o : row[1].split(/[,(]/)[0].trim();
  return { best, why: `BKB-POL-000 Section 7.1: ${r[0]}, “${row[1]}”.${owner ? ` BKB-POL-021's policy owner is the ${o} (Section 3).` : ""}` };
}
/** Learn › Reference pages › Ref-Locations: [clause, documented information, BKB library location, artefact]. */
const locations = (d: Desk) => (d.pages["Ref-Locations"]?.r ?? []) as string[][];
/** ISO/IEC 27001's mandatory documented information, as Ref-Locations lists it (rule L10's 14 rows). */
const MANDATORY: [string, string][] = [
  ["4.3", "ISMS scope"], ["5.2", "Information security policy"], ["6.1.2", "Risk assessment process (method and criteria)"],
  ["6.1.3", "Risk treatment process and Statement of Applicability"], ["6.2", "Information security objectives"], ["7.2", "Evidence of competence"],
  ["7.5.1 b", "Documented information the organisation decides is necessary"], ["8.1", "Evidence that processes were carried out as planned"],
  ["8.2", "Results of risk assessments"], ["8.3", "Results of risk treatment"], ["9.1", "Monitoring and measurement results"],
  ["9.2", "Audit programme(s) and audit results"], ["9.3", "Results of management reviews"], ["10.2", "Nonconformities, actions taken and results of corrective action"],
];

// T5.1: the sample mentee's dataset PBC-6 (Datasets_M2610-00001_W05.xlsx) and audit period, as the task gives them.
const PBC_CONTROLS: [string, string][] = [
  ["C11", "Security awareness training completion"], ["C07", "Critical vulnerability remediation within SLA"], ["C22", "Data-subject request handling within deadline"],
  ["C14", "Annual reassessment of Critical suppliers"], ["C12", "Phishing simulation"], ["C15", "Security incident logging and severity assignment"],
];
const PBC_PERIOD = "2025-09-05 to 2026-09-04";
const PBC_END = "2026-09-04";
/** Dataset PBC-6 as the desk shows it: [control, description, system, frequency, office]. */
const pbc6 = (d: Desk) => (d.ds["PBC-6"]?.r ?? []) as string[][];
/** The evidence a request may ask for: the engine's evidence types (p_pools.py), C07's platform-written (item 60). */
const PBC_EVIDENCE = uniq(["Awareness training completion report", "Critical-vulnerability remediation export (detected and closed dates)", "Data-subject request log", "Exception register extract", "Incident register extract", "Management review minutes", "Phishing campaign results", "Policy approval minutes", "Risk register approval e-mail", "Supplier assessment record", "Vulnerability scan summary export"]);
const CISO_FULL = "Chief Information Security Officer (CISO)", AWR = "Security Awareness & Training Specialist";
/** Step 4's shortlist of three roles per control (platform-written, item 60): the key is on the server (T5.1-4). */
const PBC_OWNERS: Record<string, string[]> = {
  C11: [AWR, CISO_FULL, "Compliance Manager"],
  C07: ["Vulnerability Management Governance Analyst", CISO_FULL, "Cyber Risk Manager"],
  C22: ["Privacy Compliance Analyst", "Data Protection Officer (DPO)", "Compliance Manager"],
  C14: ["Vendor / Third-Party Risk Analyst", CISO_FULL, "Compliance Manager"],
  C12: [AWR, CISO_FULL, "Cyber Threat Intelligence Analyst"],
  C15: ["Incident Response & Crisis Manager", CISO_FULL, "Information Security Auditor"],
};
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
/** A typed date as YYYY-MM-DD ("2026-09-28", "28 September 2026", "Mon 28 Sep 2026"), or null: a format check only. */
function isoDate(v: string): string | null {
  const t = v.trim().replace(/^[a-z]+day,?\s+|^(mon|tue|wed|thu|fri|sat|sun)\.?,?\s+/i, "");
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  let ymd: number[];
  if (m) ymd = [+m[1], +m[2], +m[3]];
  else if ((m = t.match(/^(\d{1,2})\s+([a-z]+)\.?,?\s+(\d{4})$/i))) {
    const i = MONTHS.findIndex((x) => x.startsWith(m![2].toLowerCase().slice(0, 3)));
    if (i < 0) return null;
    ymd = [+m[3], i + 1, +m[1]];
  } else return null;
  const dt = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2]));
  return dt.getUTCMonth() === ymd[1] - 1 && dt.getUTCDate() === ymd[2] ? dt.toISOString().slice(0, 10) : null;
}
const dayName = (dt: Date) => dt.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
/** Rule R16 on the audit period: fieldwork 30 days after its end; due 5 working days (Monday to Friday) before. */
function pbcDue(): { best: string; why: string } {
  const fw = new Date(`${PBC_END}T00:00:00Z`);
  fw.setUTCDate(fw.getUTCDate() + 30);
  const due = new Date(fw);
  for (let n = 0; n < 5; ) {
    due.setUTCDate(due.getUTCDate() - 1);
    if (due.getUTCDay() % 6) n++;
  }
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return { best: iso(due), why: `R16: the period ends ${PBC_END}, so fieldwork starts 30 days later, ${dayName(fw)} ${iso(fw)}. Five working days before it, Monday to Friday, is ${dayName(due)} ${iso(due)}.` };
}
/** Rule R15: the row's frequency in dataset PBC-6, then its minimum sample in Learn › Reference pages › Ref-Sampling. */
function pbcSample(r: string[], d: Desk): { best: string; why: string } {
  const freq = pbc6(d).find((x) => x[0] === r[1])?.[3] ?? "";
  const rows = (d.pages["Ref-Sampling"]?.r ?? []) as string[][];
  const row = rows.find((x) => same(x[0], freq)) ?? rows.find((x) => freq.toLowerCase().endsWith(String(x[0]).toLowerCase()));
  return row && freq ? { best: String(row[2]), why: `Dataset PBC-6 gives ${r[1]} the frequency “${freq}”; Ref-Sampling's row “${row[0]}” sets a minimum sample of ${row[2]}.` } : { best: "", why: "" };
}
/** Rule R17's sentence as the list writes it on every request (the pack's rule text, without its quotation marks). */
const R17_TEXT = "The evidence must be dated, show who produced it, cover the whole period and be an unchanged system export.";
const TIMELINE = ["Audit period ends", "Fieldwork starts (R16)", "Requests due (R16)"];
function pbcTimeline(r: string[]): { best: string; why: string } {
  const due = pbcDue();
  const fw = new Date(`${PBC_END}T00:00:00Z`);
  fw.setUTCDate(fw.getUTCDate() + 30);
  const f = fw.toISOString().slice(0, 10);
  if (r[0] === TIMELINE[0]) return { best: PBC_END, why: `The audit period is ${PBC_PERIOD}: it ends on its second date.` };
  if (r[0] === TIMELINE[1]) return { best: f, why: `R16: fieldwork starts 30 days after the period ends: ${PBC_END} + 30 days is ${dayName(fw)} ${f}.` };
  return r[0] === TIMELINE[2] ? due : { best: "", why: "" };
}
/** Learn › Reference pages › Ref-Certification card: an item's text ("Stage 1 audit" …), "" if missing. */
const card = (d: Desk, item: string) => String(((d.pages["Ref-Certification card"]?.r ?? []) as string[][]).find((x) => x[0] === item)?.[1] ?? "");
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const STAGE_LINES = ["Stage 1 · What the auditor does", "Stage 1 · Where", "Stage 1 · What it produces", "Stage 2 · What the auditor does", "Stage 2 · Where", "Stage 2 · What it produces"];
/** A line of LI-CERT's stage table, in the card's own words: [value, the card's sentence it comes from]. */
function stageAt(d: Desk, line: string): [string, string] {
  const [stage, what] = line.split(" · ");
  const t = card(d, `${stage} audit`);
  if (!t) return ["", ""];
  if (what === "What the auditor does") { const x = t.match(/^The auditor ([^:]+):/)?.[1] ?? ""; return [cap(x), `The auditor ${x}`]; }
  if (what === "What it produces") { const x = t.match(/Output: ([^.]+)\./)?.[1] ?? ""; return [cap(x), `Output: ${x}`]; }
  const remote = t.match(/(Mostly remote[^.]*)\./)?.[1];
  return remote ? [remote, remote] : /on site/.test(t) ? ["On site", t.match(/^The auditor ([^:]+):/)?.[0] ?? t] : ["", ""];
}
function stageLine(r: string[], d: Desk): { best: string; why: string } {
  const [best, src] = stageAt(d, r[0]);
  return best ? { best, why: `Ref-Certification card, ${r[0].split(" · ")[0]} audit: “${src}”.` } : { best: "", why: "" };
}
/** LI-CERT's 3-year cycle and selection criteria, as the Ref-Certification card gives them (the sample pack's card):
 *  written by the platform once steps 10 and 11 have asked their questions (owner, 28 Oct: part 2 only where real). */
const CYCLE: [string, string][] = [["Year 1", "Initial certification (Stage 1 + Stage 2)"], ["Year 2", "Surveillance audit"], ["Year 3", "Surveillance audit"], ["End of year 3, before the certificate expires", "Recertification audit"]];
const CRITERIA = ["Accreditation by an IAF-member accreditation body to ISO/IEC 17021-1 and ISO/IEC 27006-1", "Sector experience with organisations like yours", "Auditor competence", "Languages and offices covering every site in scope", "Cost and audit-day plan"];
/** LI-CERT's auditee briefing: the behaviours of the card's "Auditee: do" and "Auditee: do not" rows, in A–Z order. */
const AUDITEE = ["Answer only what is asked", "Argue", "Create evidence after the request", "Escalate disagreements to the ISMS manager", "Guess", "Name the rule or clause", "Say \"I will check\" when unsure", "Share other clients' or other mentees' data", "Show the evidence file", "Sign anything you have not read"];
const auditeeList = (d: Desk, item: string) => card(d, item).replace(/\.$/, "").split(";").map((x) => x.trim());
function auditeeRow(r: string[], d: Desk): { best: string; why: string } {
  for (const [item, best] of [["Auditee: do", "Do"], ["Auditee: do not", "Do not"]] as const)
    if (auditeeList(d, item).some((x) => same(x, r[0]))) return { best, why: `The card lists it under “${item}”: ${card(d, item)}` };
  return { best: "", why: "" };
}

// T5.2: dataset EVP-REPO (Datasets_M2610-00001_W05.xlsx), the 42 files, sorted by control as Evidence › Evidence Library
// lists them: [item, evidence type, control, system, timestamp, generated by, period, query, integrity, approval,
// content, legibility].
const EVP_REPO: string[][] = [
  ["E-015", "User access review campaign export", "C07", "In-scope system", "2025-09-20 00:00 UTC", "rohan.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-019", "User access review campaign export", "C07", "In-scope system", "2026-05-16 00:00 UTC", "hiro.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Shows unmasked customer e-mail addresses / a plain-text password", "Legible"],
  ["E-021", "Supplier assessment record", "C07", "In-scope system", "2026-07-05 00:00 UTC", "mei.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Shows unmasked customer e-mail addresses / a plain-text password", "Legible"],
  ["E-033", "Incident register extract", "C07", "In-scope system", "2025-06-09 00:00 UTC", "olivia.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-001", "Backup restore test record", "C11", "In-scope system", "2025-07-24 00:00 UTC", "ana.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Hand annotations and re-typed values present", "Approver name + date visible", "Masked content", "Legible"],
  ["E-012", "Encryption certificate inventory", "C11", "In-scope system", "2026-06-24 00:00 UTC", "elif.svc", "2025-09-05 to 2026-09-04", "", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-014", "Encryption certificate inventory", "C11", "In-scope system", "2026-05-04 00:00 UTC", "ethan.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-022", "Security objectives tracker", "C11", "In-scope system", "2025-08-17 00:00 UTC", "arjun.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-027", "Policy approval minutes", "C11", "In-scope system", "2026-03-31 00:00 UTC", "mariana.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-038", "CSPM critical-findings dashboard export", "C11", "Different entity / out-of-scope system", "2026-03-23 00:00 UTC", "mariana.svc", "2025-09-05 to 2026-09-04", "", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-041", "Firewall rule review minutes", "C11", "Different entity / out-of-scope system", "2026-07-24 00:00 UTC", "bianca.svc", "2025-09-05 to 2026-01-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-002", "Asset register version history", "C12", "In-scope system", "2025-08-02 00:00 UTC", "lukas.svc", "2025-09-05 to 2026-01-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-017", "Quarterly privileged-access review sign-off sheet", "C12", "In-scope system", "2026-08-08 00:00 UTC", "fatima.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-020", "Encryption certificate inventory", "C12", "In-scope system", "", "", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-023", "EDR coverage report", "C12", "In-scope system", "2026-06-09 00:00 UTC", "diego.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-028", "Policy approval minutes", "C12", "In-scope system", "2025-12-10 00:00 UTC", "fatima.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-029", "KMS encryption configuration export", "C12", "In-scope system", "2025-09-13 00:00 UTC", "priya.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "None visible", "Masked content", "Legible"],
  ["E-035", "Policy approval minutes", "C12", "In-scope system", "2025-12-28 00:00 UTC", "emma.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-036", "Data-subject request log", "C12", "In-scope system", "2026-01-02 00:00 UTC", "daniel.svc", "2025-09-05 to 2026-01-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-039", "SIEM log-retention configuration screenshot", "C12", "In-scope system", "2026-02-11 00:00 UTC", "aylin.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-005", "New-starter access request ticket", "C14", "In-scope system", "2026-03-16 00:00 UTC", "rafael.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-006", "Awareness training completion report", "C14", "In-scope system", "2025-07-29 00:00 UTC", "rafael.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-011", "Management review minutes", "C14", "In-scope system", "2026-04-12 00:00 UTC", "lars.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-018", "Incident register extract", "C14", "In-scope system", "2026-05-03 00:00 UTC", "ethan.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-037", "Visitor log sample", "C14", "In-scope system", "2026-03-03 00:00 UTC", "emre.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Hand annotations and re-typed values present", "Approver name + date visible", "Masked content", "Legible"],
  ["E-003", "Risk register approval e-mail", "C15", "In-scope system", "", "lucía.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-007", "Supplier assessment record", "C15", "Different entity / out-of-scope system", "2025-08-10 00:00 UTC", "lars.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-008", "EDR coverage report", "C15", "In-scope system", "", "daniel.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-009", "Incident register extract", "C15", "In-scope system", "2026-07-28 00:00 UTC", "mehmet.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-010", "Business impact analysis sign-off", "C15", "Different entity / out-of-scope system", "2025-12-31 00:00 UTC", "sofia.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-013", "Leaver disable log", "C15", "In-scope system", "2025-07-16 00:00 UTC", "ana.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-016", "Visitor log sample", "C15", "In-scope system", "2026-09-02 00:00 UTC", "lucía.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-031", "Exception register extract", "C15", "In-scope system", "2025-10-08 00:00 UTC", "mariana.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-032", "Management review minutes", "C15", "In-scope system", "2025-12-23 00:00 UTC", "nora.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-040", "KMS encryption configuration export", "C15", "In-scope system", "2025-12-09 00:00 UTC", "can.svc", "2025-09-05 to 2026-09-04", "", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-042", "IdP admin-console screenshot of the MFA enforcement policy", "C15", "In-scope system", "2025-06-13 00:00 UTC", "emma.svc", "2025-09-05 to 2026-01-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-004", "Security objectives tracker", "C22", "In-scope system", "2025-10-19 00:00 UTC", "", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-024", "Management review minutes", "C22", "In-scope system", "2025-10-31 00:00 UTC", "aylin.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-025", "Awareness training completion report", "C22", "In-scope system", "2025-12-30 00:00 UTC", "amara.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-026", "Visitor log sample", "C22", "In-scope system", "2025-10-25 00:00 UTC", "ananya.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-030", "Incident register extract", "C22", "In-scope system", "2026-02-09 00:00 UTC", "bianca.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
  ["E-034", "Leaver disable log", "C22", "In-scope system", "2025-09-21 00:00 UTC", "mehmet.svc", "2025-09-05 to 2026-09-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible"],
];
/** A file's step-2 codes: the checked answer ("none" = accepted, "D4; D6" = rejected), else the learner's own. */
const evpCodes = (p: Progress, id: string) =>
  p.rowChecks?.["T5.2-2"]?.rows[id]?.best ?? p.grids?.["T5.2|EVP-IDX"]?.[`${EVP_REPO.findIndex((r) => r[0] === id)},13`] ?? "";
/** Rule R16 on the audit period, then BKB-POL-016 Section 6.2: a gap's files are due the last working day before fieldwork. */
const FIELDWORK = (() => { const x = new Date(`${PBC_END}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 30); return x; })();
const FOLLOW_DUE = (() => { const x = new Date(FIELDWORK); do x.setUTCDate(x.getUTCDate() - 1); while (!(x.getUTCDay() % 6)); return x; })();
const iso = (x: Date) => x.toISOString().slice(0, 10);
/** Step 1: how many files EVP-REPO lists for the row's control. */
function evpReceived(r: string[]): { best: string; why: string } {
  const f = EVP_REPO.filter((x) => x[2] === r[1]).map((x) => x[0]);
  return { best: String(f.length), why: `Evidence › Evidence Library lists ${f.length} files for ${r[1]}: ${f.join(", ")}.` };
}
/** Step 3: the PBC-LIST request of the file's control. */
function evpRequest(r: string[]): { best: string; why: string } {
  const i = PBC_CONTROLS.findIndex(([c]) => c === r[2]);
  if (i < 0) return { best: "", why: "" };
  const best = `PBC-${String(i + 1).padStart(2, "0")}`;
  return { best, why: `${r[0]} is evidence for ${r[2]} and covers the whole audit period: PBC-LIST's request for ${r[2]} is ${best}.` };
}
/** Step 4: rule R18 on the row's files as step 2 decided them. */
function evpGap(r: string[]): { best: string; why: string } {
  const acc = [...r[4].matchAll(/(E-\d+) Accept/g)].map((m) => m[1]);
  const n = acc.length;
  return { best: n < 2 ? "Gap" : "No gap", why: `${r[1]} has ${n} accepted file${n === 1 ? "" : "s"}${n ? ` (${acc.join(", ")})` : ""}. R18: a control with fewer than 2 accepted files has a gap.` };
}
/** Step 5: a follow-up typed in R18's words, recorded with its control's ID and its dates as YYYY-MM-DD (a format check). */
function evpFollowFix(v: string): string | null {
  const m = v.trim().replace(/\s+/g, " ").match(/^please send 2 more files for (c\d{2})\b.*? covering (.+?) to (.+?) by (.+?)\.?$/i);
  if (!m) return null;
  const a = isoDate(m[2]), b = isoDate(m[3]), due = isoDate(m[4]);
  return a && b && due ? `Please send 2 more files for ${m[1].toUpperCase()} covering ${a} to ${b} by ${due}.` : null;
}
function evpFollow(r: string[]): { best: string; why: string } {
  return {
    best: `Please send 2 more files for ${r[1]} covering ${PBC_PERIOD} by ${iso(FOLLOW_DUE)}.`,
    why: `R18's sentence for ${r[1]}, over the audit period ${PBC_PERIOD}. Due: fieldwork starts 30 days after the period ends (R16), ${dayName(FIELDWORK)} ${iso(FIELDWORK)}; BKB-POL-016 Section 6.2 sets the last working day before it, ${dayName(FOLLOW_DUE)} ${iso(FOLLOW_DUE)}.`,
  };
}
/** Step 4's checked answer for a control, else the learner's own. */
const evpGapOf = (p: Progress, ctrl: string, own: string) => p.rowChecks?.["T5.2-4"]?.rows[ctrl]?.best ?? own;

// T6.1 (desk-step-builder, 29 Oct 2026): the UAR extract of Mitratech TeamConnect, all 216 accounts (the pack ships the
// first 60; rows 61-216 are platform-written by the engine's rules around the pack's planted exceptions, item 62), the
// fixed test plan A1-A6, and the systematic sample the platform draws with the seed.
const UAR_X = UAR.extract.r as string[][];
const UAR_HR = UAR.hr.r as string[][];
const UAR_PLAN = UAR.plan as string[][];
const UAR_REVIEW = UAR.review;
/** The sample: every 8th account (216 / 25, rounded down) from a random start the seed gives (64822 mod 8 = 6). */
const UAR_SAMPLE = Array.from({ length: 25 }, (_, n) => 6 + 8 * n);
const hrOf = (id: string) => UAR_HR.find((r) => r[0] === id) ?? ["", "", "", "", ""];
/** Learn › Reference pages › Ref-UAR codes, as the pack gives it: [code, exception type, severity, action, owner, due]. */
const U_CODES: string[][] = [
  ["U1", "Active account for a terminated employee", "High", "Disable the account; check the log for use after termination", "IAM team", "1 working day"],
  ["U2", "Orphan account — no HR match", "High", "Disable the account; ask the system owner to confirm", "System owner", "5 working days"],
  ["U3", "Generic/shared account not registered as break-glass", "Medium", "Register as break-glass or disable", "System owner", "5 working days"],
  ["U4", "Privileged role without approval ticket", "High", "Remove the role until an approval ticket exists", "IAM team", "1 working day"],
  ["U5", "Segregation-of-duties conflict (toxic combination)", "High", "Remove one of the two roles", "System owner", "5 working days"],
  ["U6", "Dormant > 90 days and not flagged by reviewer", "Low", "Disable the account", "IAM team", "5 working days"],
  ["U7", "Self-review — reviewer is the account holder", "Medium", "Repeat the review with an independent reviewer", "Control owner", "Next review"],
  ["U8", "\"Revoke\" decision not executed within 5 days", "Medium", "Execute the revocation", "IAM team", "1 working day"],
  ["U9", "Mover not re-validated within 5 days", "Medium", "Re-validate access for the new role", "Line manager", "5 working days"],
  ["U10", "Review decision blank / not completed", "Low", "Complete the decision", "Reviewer", "5 working days"],
];
const uCode = (c: string) => U_CODES.find((r) => r[0] === c);
/** The accounts the full-population analytics list ("Run analytics"), each with the queries that listed it. */
const UAR_LISTED: [string, string][] = [
  ["U-0007", "HR roster: role change date"], ["U-0025", "Review decisions: decision blank"], ["U-0072", "HR roster: role change date"],
  ["temp-user-99", "HR roster: not found"], ["U-0117", "HR roster: role change date"], ["U-0135", "Privileged accounts"],
  ["admin01-141", "HR roster: not found"], ["U-0167", "Dormant: no login in the 90 days before the review; Review decisions: Revoke"], ["U-0190", "Privileged accounts"],
];
const uarRow = (id: string) => UAR_X.find((r) => r[0] === id)!;
/** Step 4's checked answer for an account, else the learner's own. */
const uarExc = (p: Progress, id: string) =>
  p.rowChecks?.["T6.1-4"]?.rows[id]?.best ?? p.grids?.["T6.1|UAR-TEST Sheet 3"]?.[`${UAR_LISTED.findIndex(([x]) => x === id)},13`] ?? "";
/** Step 5's checked type for an exception, else the learner's own. */
const uarType = (p: Progress, id: string) =>
  p.rowChecks?.["T6.1-5"]?.rows[id]?.best ?? p.grids?.["T6.1|UAR-TEST Sheet 3"]?.[`${UAR_LISTED.findIndex(([x]) => x === id)},14`] ?? "";
const UAR_CONC = ["Exceptions in Sheet 3", "Highest severity", "Exceptions as a share of the 216 accounts", "Test conclusion (R19)"];
/** Step 7's checked line, else the learner's own. */
const uarConc = (p: Progress, line: number) => p.rowChecks?.["T6.1-7"]?.rows[UAR_CONC[line]]?.best ?? p.grids?.["T6.1|UAR-MEMO Conclusion"]?.[`${line},1`] ?? "";
const UAR_SHARE = ["5 % or less", "More than 5 %"];
/** Step 2, rule R15 on the review: its population is the accounts it decided on, a population of records. */
const SAMP_LINES = ["Population (accounts the review covered)", "Ref-Sampling row", "Minimum sample (R15)"];
function uarSampling(r: string[], d: Desk): { best: string; why: string } {
  const rows = (d.pages["Ref-Sampling"]?.r ?? []) as string[][];
  const row = rows.find((x) => /population of records < 250/i.test(String(x[0])));
  if (!row) return { best: "", why: "" };
  if (r[0] === SAMP_LINES[0]) return { best: String(UAR_X.length), why: `Access Reviews › Start Review: the review decided on ${UAR_X.length} accounts, one decision each. Those decisions are what you test.` };
  if (r[0] === SAMP_LINES[1]) return { best: String(row[0]), why: `The test samples the review's decisions, one per account: a population of records, ${UAR_X.length}, fewer than 250. The rows by frequency are for a control tested occurrence by occurrence; this review ran once.` };
  return r[0] === SAMP_LINES[2] ? { best: String(row[2]), why: `Ref-Sampling's row “${row[0]}” sets a minimum sample of ${row[2]}.` } : { best: "", why: "" };
}

// T6.2 (desk-step-builder, 29 Oct 2026): the leavers of LearnTech (Org B) and their five systems' disable logs. The pack
// ships 12 of the 29 leavers; E0013-E0029 are platform-written around the pack's answer key (lvr-t62.json, scratchpad
// build/T6.2/gen_lvr.py; Content Corrections item 63). VPN / ZTNA and Jira write Amsterdam summer time (CEST).
const LVR_SYS = LVR.systems as string[];
const LVR_LEAVERS = LVR.leavers as string[][];
const LVR_LOG = LVR.log as string[][];
/** The disable line of a leaver in a system's log, [id, system, as logged, UTC], or undefined. */
const lvrLine = (id: string, sys: string) => LVR_LOG.find((r) => r[0] === id && r[1] === sys);
/** Steps 1 and 2 checked: the logs are in UTC and matched, so Sheet 2's system cells can be written. */
const lvrMatched = (p: Progress) => !!p.rowChecks?.["T6.2-1"] && !!p.rowChecks?.["T6.2-2"];
/** "3 h 03 min" between two "YYYY-MM-DD HH:MM UTC" times. */
const lvrSpan = (a: string, b: string) => {
  const m = Math.round((Date.parse(`${b.slice(0, 16).replace(" ", "T")}:00Z`) - Date.parse(`${a.slice(0, 16).replace(" ", "T")}:00Z`)) / 60000);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
};
/** A leaver's account in a system, as Sheet 2 records it once matched: still active, or disabled (UTC) and how long after. */
const lvrCell = (id: string, sys: string) => {
  const l = lvrLine(id, sys), term = LVR_LEAVERS.find((r) => r[0] === id)?.[2] ?? "";
  return l ? `${l[3]}, ${lvrSpan(term, l[3])} after termination` : "Still active";
};
/** Step 4's checked systems disabled late for a leaver, else the learner's own ("" while undecided). */
const lvrLate = (p: Progress, id: string, own: string) => p.rowChecks?.["T6.2-4"]?.rows[id]?.best ?? own;
const LVR_TZ = ["Already UTC", "Subtract 1 hour", "Subtract 2 hours", "Add 1 hour", "Add 2 hours"];
const LVR_KPI = ["Numerator: leavers fully disabled within the SLA", "Denominator: all leavers", "KPI (% of leavers, one decimal)", "Meets the target of BKB-POL-006 Section 10"];
/** Employee IDs typed as a list: each one of the leavers' IDs, joined "; ", or "none"; null for anything else. */
const lvrIds = (v: string) => {
  const t = v.trim();
  if (/^none$/i.test(t)) return "none";
  const ids = t.split(/[\s,;]+/).filter(Boolean).map((x) => x.toUpperCase());
  return ids.length && ids.every((x) => LVR_LEAVERS.some((r) => r[0] === x)) ? [...new Set(ids)].join("; ") : null;
};

// T7.1 (desk-step-builder, 29 Oct 2026): the Manila office register update. rru-t71.json holds the pack's 25 rows with all their
// columns and the platform-written facts of the five events (Content Corrections item 64).
type RruNew = { ev: string; id: string; desc: string; cat: string; title: string; asset: string; facts: string; often: string; impact: string; controls: string; kri: string; owner: string; drafts: string[] };
const RRU_NEW = RRU.new as RruNew[];
const RRU_REG = RRU.register as string[][];
const RRU_CHG = RRU.changes as { ev: string; row: string; desc: string; facts: string; evidence: string }[];
const RRU_CHAIN = RRU.chain as { asset: string; risk: string; type: string; line: string; ref: string[] }[];
const RRU_ACTIONS = RRU.actions as Record<string, string[]>;
const rruNew = (id: string) => RRU_NEW.find((n) => n.id === id || n.ev === id);
const rruBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T7.1-${step}`]?.rows[label]?.best ?? "";
const rruRating = (s: number) => (s <= 5 ? "Low" : s <= 11 ? "Medium" : s <= 19 ? "High" : "Critical");
/** A new risk's ratings once step 3 is checked (the key's values: what the register records), else null. */
const rruScores = (p: Progress, ev: string) => {
  const [L, I, Lr] = ["Likelihood (inherent)", "Impact (inherent)", "Likelihood (residual)"].map((x) => +rruBest(p, 3, `${ev} · ${x}`));
  return L && I && Lr ? { L, I, Lr, s: L * I, rs: Lr * I } : null;
};
const R36_OPTS = ["Risk owner", "Org CRCO", "Org CEO + Group CISO", "Not acceptable"];
const RRU_DEC = ["Accept and monitor", "Treat — due 30 days", "Treat — due 90 days", "Treat — due 180 days"];
const RRU_C: Record<string, string[]> = {
  C1: ["Likelihood (residual): 1 → 2", "Likelihood (inherent): 2 → 3", "Impact (residual): 3 → 4", "No field changes: the KRI breach goes in the note only"],
  C2: ["Treatment plan: no status → overdue, 50 % complete (ratings unchanged)", "Likelihood (residual): 1 → 2", "Impact (residual): 4 → 5", "Likelihood (inherent): 2 → 3"],
};
/** C1 applied (step 7 checked): R-16-HQ-21's residual likelihood 1 → 2, so its score, rating and authority follow. */
const rruC1 = (p: Progress) => !!p.rowChecks?.["T7.1-7"];
const C1_FOLLOW: Record<string, [string, string]> = { "Residual score": ["3", "6"], "Residual rating": ["Low", "Medium"], "Acceptance authority": ["Risk owner", "Org CRCO"] };
/** "Likelihood (residual): 1 → 2" → field, old, new. */
const rruChange = (x: string) => { const m = x.match(/^(.+?): (.+?) → (.+?)(?: \((.+)\))?$/); return m ? { field: m[1], old: m[2], new: m[4] ? `${m[3]} (${m[4]})` : m[3] } : x ? { field: "—", old: "—", new: "—" } : null; };
const NOTE_LINES = ["New risks", "Changed risks", "Risks above appetite", "Rows whose acceptance authority is not R36's", "Decisions needed"];
/** Risk IDs typed as a list ("R-16-HQ-02; HQ-27; 28"): each the register's form, joined "; ", or "none"; null for anything else. */
const rruIds = (v: string) => {
  const t = v.trim();
  if (/^none$/i.test(t)) return "none";
  const ids = t.split(/[\s,;]+/).filter(Boolean).map((x) => x.match(/^(?:R-?16-?)?(?:HQ-?)?(\d{1,2})$/i)?.[1]);
  return ids.length && ids.every((x) => x && +x >= 1 && +x <= 28) ? [...new Set(ids.map((x) => `R-16-HQ-${x!.padStart(2, "0")}`))].join("; ") : null;
};
/** The Annex A controls of a Ref-Keywords cell ("A.5.19–A.5.23", "A.8.15, A.8.16"), each with its title. */
const annexIn = (cell: string) =>
  cell.split(/,\s*/).flatMap((x) => {
    const m = x.trim().match(/^A\.(\d+)\.(\d+)(?:–A\.\d+\.(\d+))?$/);
    if (!m) return [];
    const hi = m[3] ? +m[3] : +m[2];
    return Array.from({ length: hi - +m[2] + 1 }, (_, i) => `A.${m[1]}.${+m[2] + i}`);
  }).map((id) => `${id} ${ANNEX_A.find(([a]) => a === id)?.[1] ?? ""}`.trim());
const keywordsOf = (d: Desk, cat: string) => ((d.pages["Ref-Keywords"]?.r ?? []) as string[][]).find((r) => r[0].split(",").some((k) => cat.toLowerCase().includes(k.trim())))?.[2] ?? "";
const RTP_NONE = "None: the risk is retained";
const attrs27002 = (d: Desk) => (d.pages["Ref-27002 attributes"]?.r ?? []) as string[][];
const ATTR_COLS: Record<number, [number, string]> = { 11: [3, "Control type"], 12: [4, "Security properties"], 13: [5, "Cybersecurity concepts"] };
const chainOf = (id: string) => RRU_CHAIN.find((c) => c.risk === id);

// T7.2 (desk-step-builder, 29 Oct 2026): the board Top-5, the acceptance request, LI-RAM and LI-PLAN. top-t72.json holds the
// register as T7.1's key leaves it and the content the pack does not give (Content Corrections item 65).
const TOP_REG = TOP.register as string[][];
const topRow = (id: string) => TOP_REG.find((r) => r[0] === id);
const topBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T7.2-${step}`]?.rows[label]?.best ?? "";
const TOP_IDS = TOP_REG.map((r) => r[0]).sort();
const SOWHAT = TOP.sowhat as Record<string, string[]>;
/** RSK-TOP5's columns written from the ranked risk's register row (-1: "ID · title"). */
const TOP_COL: Record<number, number> = { 2: -1, 3: 2, 4: 3, 5: 4, 7: 6, 8: 5, 9: 9 };
const RAM_REC = ["Office risk register (RR-UPD)", "Board Top-5 risk table (RSK-TOP5)", "Risk acceptance request (RSK-ACC)", "Risk assessment method card (LI-RAM)"];
/** LI-RAM: the rows each step fills; the others are written by the platform. */
const RAM_ONLY: Record<number, string[]> = {
  7: ["Likelihood scale, score 1 to 5", "Impact scale, score 1 to 5"],
  8: ["Risk appetite, LOW-criticality organisation", "Treatment due days by residual rating"],
  9: ["Low", "Medium", "High", "Critical"].map((x) => `Accepts a ${x} residual risk`),
  10: ["Where the results are kept (clause 8.2)"],
};
const RAM_ROWS: string[][] = [
  [RAM_ONLY[7][0], "", "BKB-ERM-001 Section 6.2"],
  [RAM_ONLY[7][1], "", "BKB-ERM-001 Section 6.3"],
  ["Risk matrix and ratings", "5 × 5 matrix: score = likelihood × impact. Ratings: Low 1–5 · Medium 6–11 · High 12–19 · Critical 20–25.", "BKB-ERM-001 Section 6.4"],
  ["Rating method (R07)", TOP.r07, "Rule R07; BKB-ERM-001 Section 6"],
  ["Evaluation against appetite (R08)", TOP.r08, "Rule R08; BKB-ERM-001 Sections 4 and 7"],
  [RAM_ONLY[8][0], "", "BKB-ERM-001 Section 4"],
  [RAM_ONLY[8][1], "", "BKB-ERM-001 Section 7"],
  ["Risk owner", "Every risk has a named owner from management (the first line), who implements its treatment, monitors its KRIs and reports changes.", "BKB-ERM-001 Sections 2 and 3"],
  ...RAM_ONLY[9].map((x) => [x, "", "Charter Section 6.1 (rule R36)"]),
  [RAM_ONLY[10][0], "", "ISO/IEC 27001:2022 clause 8.2"],
];
/** A scale's five names as BKB-ERM-001 writes them, score 1 to 5 ("5 Severe" → "Severe"); [] until it is loaded. */
const ermScale = (sec: "6.2" | "6.3") => {
  const t = docTable("BKB-ERM-001", sec) ?? [];
  return t.map((r) => (sec === "6.2" ? r[1] : r[0].replace(/^\d+\s*/, ""))).filter(Boolean).reverse();
};
/** A typed LI-RAM value as recorded, or null when it is not BKB-ERM-001's (a copy: only the source's value is in). */
const ramFix = (v: string, r: string[]): string | null => {
  const at = r[0];
  if (at === RAM_ONLY[7][0] || at === RAM_ONLY[7][1]) {
    const want = ermScale(at === RAM_ONLY[7][0] ? "6.2" : "6.3");
    const got = v.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    return want.length === 5 && got.length === 5 && got.every((x, i) => same(x, want[i])) ? want.join("; ") : null;
  }
  if (at === RAM_ONLY[8][0]) {
    const n = parseInt((docTable("BKB-ERM-001", "4") ?? []).find((x) => x[0] === "LOW")?.[2] ?? "", 10);
    return n && v.trim() === String(n) ? String(n) : null;
  }
  if (at === RAM_ONLY[8][1]) {
    const due = Object.fromEntries((docTable("BKB-ERM-001", "7") ?? []).map((x) => [x[0].split(" ")[0], parseInt(x[2], 10)] as [string, number]).filter(([, d]) => d));
    const got = Object.fromEntries([...v.matchAll(/(critical|high|medium)\D*?(\d+)/gi)].map((m) => [cap(m[1].toLowerCase()), +m[2]]));
    const keys = Object.keys(due);
    return keys.length === 3 && Object.keys(got).length === 3 && keys.every((k) => got[k] === due[k]) ? keys.map((k) => `${k} ${due[k]} days`).join("; ") : null;
  }
  return v.trim() || null;
};
const RAM_HINT: Record<string, string> = {
  [RAM_ONLY[7][0]]: "Read BKB-ERM-001 Section 6.2's Descriptor column, from score 1 up to score 5, and type the five names separated by ;.",
  [RAM_ONLY[7][1]]: "Read the names in BKB-ERM-001 Section 6.3's Score column, from score 1 up to score 5, and type them separated by ;.",
  [RAM_ONLY[8][0]]: "Read BKB-ERM-001 Section 4: the LOW band's Max. residual score. Type the number only.",
  [RAM_ONLY[8][1]]: "Read BKB-ERM-001 Section 7's Due column for Critical, High and Medium, and type each rating with its days.",
};
/** L15's owners to choose from: each ISMS process's Accountable role (Ref-ISMS processes) and Ref-Milestones' owners. */
const ROLES_T72 = (d: Desk) => uniq([...isms(d).filter((r) => !r[0].startsWith("Climate")).map((r) => r[1].split(" (")[0].split(";")[0].trim()), ...(TOP.plan as string[][]).map((m) => m[4])]);
const MILES = (TOP.plan as string[][]).map((m) => `${m[0]} ${m[1]}`);
/** Deliverable codes typed as a list ("LI-FAM; act-upd"): each one the clause's row lists, in its order, joined "; ". */
const codesIn = (v: string, dels: string) => {
  const allowed = dels.split(",").map((x) => x.trim());
  const got = v.split(/[;,\s]+/).filter(Boolean).map((x) => x.toUpperCase());
  return got.length && got.every((x) => allowed.includes(x)) ? allowed.filter((x) => got.includes(x)).join("; ") : null;
};

// T8.1 (desk-step-builder, 29 Oct 2026): the vulnerability SLA test of LearnTech's Amsterdam office. vul-t81.json holds the
// scanner export in full (rows 61-172 and the Last scan / Found in last scan columns platform-written around the pack's key,
// Content Corrections item 66). Each value a later sheet shows is the checked answer of the step that decided it.
const VUL_F = VUL.findings as string[][];
const VUL_EX = VUL.exceptions as string[][];
const VUL_TEST = VUL.test;
const VUL_CL = ["Class 1 (7 days)", "Class 2 (14 days)", "Class 3 (30 days)", "Class 4 (90 days)"];
const VUL_DAYS = [7, 14, 30, 90];
/** A kind of finding: exposure, KEV listing and scanner severity, the three things rule R24 reads. */
const vulKind = (r: string[]) => `${r[2]} · ${r[5] === "Yes" ? "KEV-listed" : "not KEV-listed"} · ${r[7]}`;
const VUL_KINDS = uniq(VUL_F.map(vulKind));
/** Step 2's four findings, the first of each class in the export (written by scratchpad build/T8.1/keys.py). */
const VUL_DUE = ["V-0007", "V-0004", "V-0009", "V-0001"];
const vulBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T8.1-${step}`]?.rows[label]?.best ?? "";
const vulRow = (id: string) => VUL_F.find((r) => r[0] === id);
/** A finding's class (0-3) once step 1 is checked, else -1. */
const vulClass = (p: Progress, id: string) => { const r = vulRow(id); return r ? VUL_CL.indexOf(vulBest(p, 1, vulKind(r))) : -1; };
const plusDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const daysFrom = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);
/** A finding's due date once steps 1 and 2 are checked (the workbook's formula), else "". */
const vulDue = (p: Progress, id: string) => { const c = vulClass(p, id), r = vulRow(id); return c < 0 || !r || !p.rowChecks?.["T8.1-2"] ? "" : plusDays(r[8], VUL_DAYS[c]); };
const VUL_GROUPS = ["closed in SLA and verified", "closed late and verified", "closed but not verified, not yet due (reopened)", "closed but not verified, past due (reopened)", "open, not yet due", "open, past due, under a valid exception", "open, past due, no valid exception"];
/** Each class's findings counted by what steps 3 to 5 found (their checked answers), or null until all three are checked. */
const vulTotals = (p: Progress) => {
  if (![1, 2, 3, 4, 5].every((n) => p.rowChecks?.[`T8.1-${n}`])) return null;
  const t = VUL_CL.map(() => VUL_GROUPS.map(() => 0));
  for (const r of VUL_F) {
    const c = vulClass(p, r[0]), due = vulDue(p, r[0]);
    const g = r[9]
      ? vulBest(p, 5, r[0]) === "Verified by re-scan" ? (vulBest(p, 3, r[0]) === "Closed in SLA" ? 0 : 1) : due >= VUL_TEST ? 2 : 3
      : due >= VUL_TEST ? 4 : r[12] && vulBest(p, 4, r[12]) === "Valid" ? 5 : 6;
    if (c >= 0) t[c][g]++;
  }
  return t;
};
/** "50/61 = 82 %" → "50 / 61 = 82.0 %", or null. */
const vulPct = (v: string) => {
  const m = v.trim().replace(",", ".").match(/^(\d+)\s*\/\s*(\d+)\s*=\s*(\d+(?:\.\d+)?)\s*%?$/);
  return m ? `${+m[1]} / ${+m[2]} = ${(+m[3]).toFixed(1)} %` : null;
};
const VUL_REC = ["Recommendation 1 (R25)", "Recommendation 2 (R25)", "Recommendation 3 (R25)"];
/** Ref-Actions' vulnerability actions, V1 to V4, as the memo writes them ("V1: Patch or isolate …"). */
const vulActions = (d: Desk) => ((d.pages["Ref-Actions"]?.r ?? []) as string[][]).filter((r) => /^V\d$/.test(r[0])).map((r) => `${r[0]}: ${r[2]}`).sort();
/** VUL-MEMO's lines written from the checked sheets ("" until their step is checked). */
const vulMemo = (p: Progress, part: string): string | null => {
  const comp = VUL_CL.map((c) => vulBest(p, 6, c));
  const n = (c: number) => { const m = comp[c].match(/^(\d+) \/ (\d+)/); return m ? +m[2] - +m[1] : 0; };
  if (part === "Compliance by class (BKB-POL-010 Section 10)") return comp.every(Boolean) ? VUL_CL.map((c, i) => `${c.split(" (")[0]}: ${comp[i]}`).join(" · ") : "";
  if (part === "Breaches by class") return comp.every(Boolean) ? VUL_CL.map((c, i) => `${c.split(" (")[0]}: ${n(i)}`).join(" · ") : "";
  if (part === "Exception issues") {
    if (!p.rowChecks?.["T8.1-4"]) return "";
    const bad = VUL_EX.filter((e) => vulBest(p, 4, e[0]) === "Invalid").map((e) => e[0]);
    return `${bad.length} of the ${VUL_EX.length} exceptions are invalid: ${bad.join(", ")}.`;
  }
  if (part === "Closures not verified by re-scan") {
    if (!p.rowChecks?.["T8.1-5"]) return "";
    const bad = VUL_F.filter((r) => r[9] && vulBest(p, 5, r[0]) === "Not verified").map((r) => r[0]);
    return `${bad.length} of the ${VUL_F.filter((r) => r[9]).length} closed findings: ${bad.join(", ")}.`;
  }
  return null;
};
const VUL_MEMO = ["Scope", "Compliance by class (BKB-POL-010 Section 10)", "Breaches by class", "Exception issues", "Closures not verified by re-scan", ...VUL_REC];
/** LI-KPI's fields, the fixed values of Learn › Reference pages › Ref-Measure card (Who evaluates: step 10's question). */
const KPI_FIELDS: string[][] = [
  ["Name", "Vulnerability remediation SLA compliance"],
  ["Information need", "Are critical and high vulnerabilities fixed within the policy SLA?"],
  ["Formula", "Findings within SLA at the measurement date ÷ all findings of the class × 100, per policy class (BKB-POL-010 Section 10)"],
  ["Data source", "Vulnerability tool export (VulnBoard) — VUL-TEST"],
  ["Frequency", "Monthly"],
  ["Who collects", "Vulnerability team"],
  ["Who analyses", "GRC team"],
  ["Who evaluates", ""],
  ["Target and thresholds", "Class 1–2 ≥ 90 % (red < 80 %); class 3–4 ≥ 95 %"],
  ["Report to", "Management review (9.3.2 c)"],
];

// T8.2 (desk-step-builder, 29 Oct 2026): the quarterly privileged-access review of LearnTech's Amsterdam office, dataset
// CT-DATA (the pack's 48 records, variant C), with the platform-written test script, review quarters, sample of quarters,
// IAM team's answer and 5-Whys facts (ct-t82.json, scratchpad build/T8.2/gen.py; Content Corrections item 67).
const CT_R = CT.records as string[][];
const CT_SAMPLE = CT_R.filter((r) => CT.sample.includes(r[1]));
/** Sheet 3's deviations: the sampled records the test script fails (the pack's key: one). */
const CT_DEV = ["PR-022"];
const ctBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T8.2-${step}`]?.rows[label]?.best ?? "";
const ctRow = (id: string) => CT_R.find((r) => r[0] === id) ?? [];
/** T9.1: the vendor, its tier as step 2 checked it, the facts as step 1 checked them, and whether D2 and D3 are checked. */
const VEN_NAME = VEN.intake[0][1];
const VEN_RANK = ["Low", "Medium", "High", "Critical"];
const venBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T9.1-${step}`]?.rows[label]?.best ?? "";
const venAsked = (p: Progress, n: number) => !!p.done[`T9.1-${n}`] || (p.acks[`T9.1-${n}`] ?? []).includes("checked");
/** VEN-CL's row for rule R27's transfer clause: named once D3 is checked, so the checklist never shows D3's answer first. */
const VEN_TRANSFER = "Where data leaves the country (R27)";
/** T9.2: Lumen's SOC 2 report, the checks S1–S9 (Ref-SOC checks), each check's result as step 2 checked it. */
const SOC_CHECKS = SOC.checks as string[][];
const socBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T9.2-${step}`]?.rows[label]?.best ?? "";
const SOC_DEC = SOC.decision[0];
/** T10.1: the corporate LMS's data-flow lines, each flow's shape as step 3 checked it, and BKB-ADD-36 Section 2's rows. */
const DFM_FLOWS = ROPA.flows as string[][];
const dfmShape = (p: Progress, f: string) => p.rowChecks?.["T10.1-3"]?.rows[f]?.best ?? "";
const NOT_TRANSFER = "Not a transfer";
/** Section 2 of LearnTech's addendum: [office, …, cross-border transfer] ([] until loaded). */
const add36Sec2 = () => docTable("BKB-ADD-36", "2") ?? [];
const officeOf = (cell: string) => cell.split("(")[0].trim();
/** An asset name as typed: case, spaces and "and" for "&" do not matter. */
const assetKey = (x: string) => x.toLowerCase().replace(/\s+and\s+/g, " & ").replace(/\s+/g, " ").trim();
const ASSET_NAMES = [...new Set((ROPA.assets as string[][]).map((a) => a[0]))];
/** T10.2: INC-2610-3001's incident record, the regimes, R30's conditions, LI-IRBC's phases, timeline and BC/DR rows; each
 *  regime, deadline and condition as its step checked it. */
const BRC_REC = Object.fromEntries(BRC.record as string[][]) as Record<string, string>;
const brcBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T10.2-${step}`]?.rows[label]?.best ?? "";
const BRC_NOT = "Does not apply";
const BRC_COND = "Applies if condition met";
const BRC_DISC = "Discovered (UTC)";
/** A time as typed ("2026-01-31 09:00", with or without "UTC", a "T" or a "Z") → "2026-01-31 09:00 UTC"; otherwise null. A
 *  format check: it says nothing of which time is right. */
const utcTime = (v: string) => {
  const m = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+|T)(\d{1,2}):(\d{2})\s*(?:UTC|Z)?$/i);
  return m && +m[4] < 24 && +m[5] < 60 ? `${m[1]}-${m[2]}-${m[3]} ${m[4].padStart(2, "0")}:${m[5]} UTC` : null;
};
/** BRC-PLAN's entries the platform writes from the checked steps 3–6 ("" until they are checked). */
function brcPlan(field: string, p: Progress): string {
  const dl = (l: string) => brcBest(p, 4, l);
  const regs = (want: string) => (BRC.regimes as string[][]).filter((r) => brcBest(p, 3, r[0]) === want);
  const d4 = p.decisions?.["T10.2-D4"];
  switch (field) {
    case "Regimes that apply, with deadlines (UTC)":
      return dl(BRC.early) ? regs("Applies").map((r) => `${r[0]}: ${dl(r[0])}`).join("; ") : "";
    case "Listed with a condition":
      return dl(BRC.early) ? regs(BRC_COND).map((r) => `${r[0]}: ${dl(r[0])}, only if its condition is met`).join("; ") || "None" : "";
    case "Earliest firm deadline (BKB-POL-014 Section 3.1)":
      return dl(BRC.early);
    case "Tell data subjects (R30)":
      return brcBest(p, 5, "Tell data subjects (R30)");
    case "Notice to schools and families (step 6)":
      return d4 ? ((BRC.d4 as string[])["ABC".indexOf(d4.best ?? "")] ?? "") : "";
    case "Legal sign-off required":
      return d4 ? `Ticked. ${d4.why}` : "";
    default:
      return "";
  }
}
const CT_SAMP = ["Control frequency (LearnTech)", "Minimum sample (R15)", "Sample selected"];
const CT_CONC = ["Deviations in Sheet 3", "Highest rating (R26)", "Test conclusion (R19)"];
const CT_MEMO = ["Scope", "Conclusion (R19)", "Deviation", "Recommendation (R25)"];
/** A deviation as CT-MEMO states it, once steps 3 and 4 are checked ("" before). */
const ctDev = (p: Progress, id: string) => {
  const r = ctRow(id), a = ctBest(p, 3, id), g = ctBest(p, 4, id);
  if (!a || !g) return "";
  const name = (CT.checks as string[][]).filter(([c]) => a.split("; ").includes(c)).map(([c, t]) => `${c} ${t.split(":")[0]}`).join(", ");
  return `${id} (${r[1]}, ${r[2]}): ${name} failed, review dated ${r[3]}; rated ${g} (R26).`;
};
const NCR_FIELDS: string[][] = [
  ["Nonconformity", "The first deviation of CT-MEMO, copied by the platform."],
  ["Requirement", "The requirement the deviation breaks, as its source writes it."],
  ["Evidence", "The record that shows the deviation."],
  ["Gap (days after the quarter ended)", `How many days after its quarter ended the review was done; the script allows ${CT.tolerance}.`],
  ["Grade (L17)", "Major or Minor, by rule L17."],
  ["Root cause (Why 5)", "Why it happened: the last answer of the 5-Whys form."],
  ["Correction", "What fixes this one case."],
  ["Corrective action", "What removes the cause, so that it does not happen again."],
  ["Effectiveness check", "How and when the corrective action is shown to work."],
];
/** Ref-5-Whys' five questions (Learn › Reference pages), as the pack writes them. */
const WHYS: string[][] = [
  ["Why 1", "What exactly failed? (copy the deviation: row, attribute, date)"],
  ["Why 2", "Which step of the procedure should have prevented it? (copy the SOP step)"],
  ["Why 3", "Why was that step not done or not effective? (copy the fact from the evidence: no approval gate, no reminder, no owner)"],
  ["Why 4", "Why does the process allow that? (missing control in the tool, missing role, missing check)"],
  ["Why 5", "What in the process must change so it cannot recur? (this is the root cause; the corrective action addresses it)"],
];

/** T11.1: the Amsterdam office's awareness campaign: R31's weeks, the content bank row of the theme, the Amsterdam KRIs, and
 *  LI-COMM's competence and communication rows (awr-t111.json); each value as its step or decision checked it. */
const awrBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T11.1-${step}`]?.rows[label]?.best ?? "";
const awrPick = (p: Progress, d: string, opts: string[]) => { const x = p.decisions?.[d]; return x?.best ? (opts["ABC".indexOf(x.best)] ?? "") : ""; };
/** A target as typed ("<= 5%", "≥60 %") → "≤ 5 %"; otherwise null. A format check: it says nothing of which target is right. */
const pctTarget = (v: string) => {
  const m = v.trim().replace("<=", "≤").replace(">=", "≥").match(/^(≤|≥)\s*(\d+(?:[.,]\d+)?)\s*%?$/);
  return m ? `${m[1]} ${m[2].replace(",", ".")} %` : null;
};
/** AWR-SIM's entries the platform writes from the checked steps 1, 2 and 4 ("" until they are checked). */
function awrSim(field: string, p: Progress): string {
  if (field === "Scenario card (step 2)") return awrPick(p, "T11.1-D1", AWRD.cards);
  if (field === "Approvals (R31, step 4)") return awrPick(p, "T11.1-D2", AWRD.d2);
  if (field === "Week of the campaign (R31, step 1)") {
    const wk = (AWRD.weeks as string[][]).find(([x]) => awrBest(p, 1, x) === "Phishing simulation")?.[0];
    return wk ? `${wk}: phishing simulation` : "";
  }
  return "";
}

/** T11.2: the regulatory change brief on the mentee's topic (reg-t112.json): the tracker, the monitoring results, the two official
 *  sources, REG-EXTRA, the duties, the affected systems; each value as its step checked it. */
const regBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T11.2-${step}`]?.rows[label]?.best ?? "";
const pad2 = (n: number) => String(n).padStart(2, "0");
/** "2025-07-14" → "14 July 2025". */
const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
const daysApart = (a: string, b: string) => Math.abs(Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 864e5;
/** Step 3: a source's date, accepted only as its saved copy gives it (Accessed: today), and recorded as "14 July 2025". */
const srcDate = (s: "s1" | "s2") => ({
  fix: (v: string, row: string[]) => {
    const iso = isoDate(v);
    if (!iso) return null;
    const src = REGD.src[s];
    const ok = row[0] === "Published" ? iso === src.published : row[0] === "Applies from" ? iso === src.applies : daysApart(iso, todayIso()) <= 1;
    return ok ? longDate(iso) : null;
  },
  hint: (row: string[]) => {
    const n = s === "s1" ? "source 1's" : "source 2's";
    if (row[0] === "Published") return `Read the Published line of Section 1 of ${n} saved copy (Policies › Policy Library). Type it as 1 March 2024 or 2024-03-01.`;
    if (row[0] === "Applies from") return s === "s1" ? "Read the Status line of Section 1 of source 1's saved copy: the date its duty applies from." : "Read Article 93 (Section 4 of source 2's saved copy): the date the Regulation applies from.";
    return "The date you read the source: today's date.";
  },
});
const GAP = REGD.gap;

/** T12.1: the mentee's ACT-TRACKER with ACT-EXTRA's three actions, and LI-17's inputs (act-t121.json); each value as its step
 *  checked it. A column a later step fills is "" until that step's answers are checked. */
const actBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T12.1-${step}`]?.rows[label]?.best ?? "";
const ACT_T = ACTD.tracker as string[][];
const ACT_CLOSED = ACT_T.filter((r) => r[6] === "Closed");
const actRow = (id: string) => ACT_T.find((x) => x[0] === id) ?? [];
/** An action's status after the closure tests: "" until step 2 (and, for a reopened one, step 3) is checked. */
const actStatus = (p: Progress, r: string[]) => (r[6] === "Open" ? "Open" : actBest(p, 2, r[0]) === "Pass" ? "Closed — verified" : actBest(p, 2, r[0]) === "Fail" ? actBest(p, 3, r[0]) : "");
const actOpen = (p: Progress, r: string[]) => !!p.rowChecks?.["T12.1-3"] && (actRow(r[0])[6] === "Open" || actBest(p, 2, r[0]) === "Fail");
const actReopened = (p: Progress, r: string[]) => !!p.rowChecks?.["T12.1-3"] && actBest(p, 2, r[0]) === "Fail";
const actNext = longDate(ACTD.next);
const actRequest = (id: string, issue: string, ask: string) => (ask ? `Please send ${ask.charAt(0).toLowerCase()}${ask.slice(1)} for ${id} covering “${issue}” by ${actNext}.` : "");
/** Step 5: days past due as a whole number ("012" → "12"); null for anything else. A format check, not the answer. */
const actDays = { fix: (v: string) => (/^\d{1,3}$/.test(v.trim()) ? String(Number(v.trim())) : null), hint: () => "Type a whole number of days: 0 where the due date has not passed." };
const actChecked = (p: Progress, ...ns: number[]) => ns.every((n) => !!p.rowChecks?.[`T12.1-${n}`]);
/** The counts of ACT-MRI, from the checked steps 2 to 5 ("" until all four are checked). */
function actCount(label: string, p: Progress): string {
  if (!actChecked(p, 2, 3, 4, 5)) return "";
  const rows = (n: number) => Object.values(p.rowChecks![`T12.1-${n}`].rows);
  const fails = rows(2).filter((x) => x.best === "Fail").length;
  if (label === "Closed — verified") return String(rows(2).length - fails);
  if (label === "Reopened by your closure tests") return String(fails);
  if (label === "Open") return String(ACT_T.filter((r) => r[6] === "Open").length + fails);
  if (label.startsWith("Past their due date")) return String(rows(5).filter((x) => Number(x.best) > 0).length);
  if (label.startsWith("Escalated")) return String(rows(4).filter((x) => x.best.startsWith("Escalate")).length);
  return "";
}
/** ACT-MRI's overdue actions, most days first ("" until steps 4 and 5 are checked). */
function actOverdue(i: number, p: Progress): string {
  if (!actChecked(p, 4, 5)) return "";
  const late = ACT_T.filter((r) => Number(actBest(p, 5, r[0])) > 0).sort((a, b) => Number(actBest(p, 5, b[0])) - Number(actBest(p, 5, a[0])));
  const r = late[i];
  return r ? `${r[0]} · ${r[2]} · ${r[3]} · ${actBest(p, 5, r[0])} days past due${actBest(p, 4, r[0]).startsWith("Escalate") ? " · escalated to the owner's manager (K5)" : ""}` : "—";
}
const ACT_ISSUES = [...new Set(ACT_T.map((r) => r[2]))];
const D6_OPTS = ["The IAM manager", "Internal Audit", "The system vendor"];

/** T12.2: the mentee's AUD-REQUESTS, EVIDENCE-INDEX (each file with its own SHA-256) and AUD-FINDING, the auditor's follow-up
 *  requests and the Version History of their hand-ins (aud-t122.json); each value as its step checked it. */
const AUD = AUDD as unknown as {
  period: string; requests: string[][]; followups: string[][]; index: string[][]; readme: string[][]; finding: string[]; versions: string[][];
  action: string[]; owners: string[]; actOpts: string[]; respOpts: string[]; fupOpts: string[]; ct: string[];
};
const audBest = (p: Progress, step: number, label: string) => p.rowChecks?.[`T12.2-${step}`]?.rows[label]?.best ?? "";
const audFile = (id: string) => AUD.index.find((r) => r[0] === id);
/** The time a step's answers were checked, as the log records it ("2026-12-14 09:30 UTC"); "" before. */
const audAt = (p: Progress, step: number) => { const at = p.rowChecks?.[`T12.2-${step}`]?.at; return at ? `${at.slice(0, 16).replace("T", " ")} UTC` : ""; };
const AUD_NOEV = "No evidence available";
const isFollowUp = (id: string) => AUD.followups.some((r) => r[0] === id);
/** Step 4: a SHA-256 as the index shows it, 16 characters; null for anything else. A format check, not the answer. */
const audHash = { fix: (v: string) => (/^[0-9a-f]{16}$/i.test(v.trim()) ? v.trim().toLowerCase() : null), hint: () => "Type the SHA-256 exactly as Evidence › Evidence Library shows it: 16 letters and digits, from the row of the file sent." };
/** LI-NCR-R's lines, written from the checked steps 7, 9, 10 and 11 ("" until each is done). */
function audFrame(line: string, p: Progress): string {
  if (line.startsWith("Requirement")) return p.decisions?.["T12.2-D5"]?.best ? `${AUD.finding[1]} Change management (ISO/IEC 27001:2022 Annex A), as AUD-FINDING gives it` : "";
  if (line.startsWith("Evidence row")) {
    const f = audFile(AUD.finding[3]);
    return f && ["shows", "period", "system"].every((x) => p.acks?.["T12.2-10"]?.includes(x)) ? `${f[0]} · ${f[1]} · ${f[3]} · ${f[4]} · Result: ${f[6]}` : "";
  }
  if (line.startsWith("Response")) {
    const r = audBest(p, 7, "Response (R34)");
    if (!r) return "";
    return r === AUD.respOpts[0] ? `I accept. Corrective action: ${audBest(p, 7, "Corrective action (Ref-Actions)")} (${AUD.ct[3]}, ${AUD.ct[4]}).` : `The evidence shows: ${audFile(AUD.finding[3])?.[6] ?? ""}.`;
  }
  if (line.startsWith("Route")) return p.decisions?.["T12.2-D6"]?.best ? "Closing meeting, then the certification body's appeal process (rule L25)" : "";
  return "";
}

export const REGISTERS: Record<string, Register> = {
  "F1.2": {
    code: "T-FAM",
    title: "FAM-MAP · Framework map (template T-FAM)",
    on: [1, 2, 3, 4, 5, 6],
    cols: [
      { h: "A Organisation" },
      { h: "B Standard" },
      { h: "C Mandatory/Optional" },
      { h: "D Instrument type (R01)", opts: "step" },
      { h: "E Offices (R02)" },
      { h: "F Rule" },
      { h: "G Evidence ref" },
    ],
    // FAM-LIST, W01. ponytail: the dataset gives the worked rows' D and E only; F and G are filled by
    // the pack's own step rule ("R01", "; R02", "<addendum> Sections 2–3"), which is what step 1 says they hold.
    rows: [
      ["GlobalConnect Customer Solutions", "ISO/IEC 27001:2022", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "DPA 2012 (Philippines)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "PCI DSS v4.0.1 (for financial clients)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "HIPAA (for US healthcare clients)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "GDPR (for EU client data)", "Mandatory", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "ISO 18295 (Customer Contact Centres)", "Optional", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "COPC CX Standard", "Optional", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "ISO 9001", "Optional", "", "", "", ""],
      ["GlobalConnect Customer Solutions", "SOC 2 Type II", "Optional", "", "", "", ""],
      // Column E by rule R02: the office row of BKB-ADD-36 Section 2 that names the standard, else Section 3's Applies to
      // (platform-written, Content Corrections item 2); Optional rows are not mapped.
      ...[
        ["ISO/IEC 27001:2022", "Mandatory", "Certifiable standard", "All offices"],
        ["KVKK (Turkey) — Law 6698", "Mandatory", "Law / regulation", "Istanbul"],
        ["GDPR (EU)", "Mandatory", "Law / regulation", "Amsterdam"],
        ["COPPA Rule (16 CFR 312)", "Mandatory", "Law / regulation", "New York"],
        ["FERPA (34 CFR 99)", "Mandatory", "Law / regulation", "New York"],
        ["ISO/IEC 29151", "Mandatory", "Code of practice", "All offices"],
        ["ISO/IEC 27701", "Optional", "Certifiable standard (extension to ISO/IEC 27001)", "Optional — not mapped"],
        ["NIST Privacy Framework 1.0", "Optional", "Voluntary framework", "Optional — not mapped"],
        ["SDPC National Data Privacy Agreement", "Optional", "Model contract", "Optional — not mapped"],
        ["iNACOL / NSQOL standards", "Optional", "Voluntary framework", "Optional — not mapped"],
        // Column G cites the section column E was read from: an office row of Section 2, else Section 3.
      ].map(([b, c, d, e]) => ["LearnTech Educational Solutions", b, c, d, e, "R01; R02", /^(All offices|Optional)/.test(e) ? "BKB-ADD-36 Section 3" : "BKB-ADD-36 Section 2"]),
    ],
    mine: A,
    // 3: D · 4: E · 5: G. F is never typed: it records the rules that filled the row.
    // Step 5 is a question only: its column G is written by the platform (below).
    steps: { 3: [3], 4: [4] },
    // Typing the same "R01" (and then "; R02") into F on every row is no decision: picking D records
    // the rule that decided it, filling E the rule that decided that. Derived, so a row picked before
    // this rule existed shows the same F as one picked after.
    derived: {
      // An Optional row is not mapped to offices: a fixed phrase, not a reading, so the platform writes it.
      4: { from: [2], value: (v) => (v(2) === "Optional" ? "Optional — not mapped" : null) },
      5: { from: [3, 4], value: (v) => (v(3) ? (v(4) ? "R01; R02" : "R01") : "") },
      // G cites the section E was read from: an office row of Section 2 (a city), else Section 3 (All offices, or an
      // Optional row). Once step 5's question is answered, typing it added no judgment (owner, 2026-10-28).
      6: { from: [4], quiet: true, value: (v) => (v(4) ? (/^(All offices|Optional)/.test(v(4)) ? "BKB-ADD-16 Section 3" : "BKB-ADD-16 Section 2") : "") },
    },
    readHow: {
      4: "Section 2 has one row per office: a standard applies to an office whose row names it. A Mandatory standard that no Section 2 row names: Section 3's Applies to column says where it holds. Optional rows are filled for you.",
    },
    ident: [1, 2],
    cells: {
      // Step 4's own instruction: office cities separated by "; ", "All offices", or "Optional — not
      // mapped" on an Optional row. Which cities is the mentee's to read from BKB-ADD-16 Section 2.
      4: {
        fix: (v, r, desk) => {
          const t = v.trim();
          if (r[2] === "Optional") return /^optional\s*[—–-]+\s*not\s+mapped$/i.test(t) ? "Optional — not mapped" : null;
          if (/^all offices$/i.test(t)) return "All offices";
          const cities = desk.orgs.A.offices.map((o) => o.split(",")[0].trim());
          const got = t.split(";").map((x) => cities.find((c) => c.toLowerCase() === x.trim().toLowerCase()));
          return t && got.every(Boolean) && new Set(got).size === got.length ? got.join("; ") : null;
        },
        hint: (r) => (r[2] === "Optional" ? "Optional rows take “Optional — not mapped”." : "Type office cities only (e.g. Berlin; Singapore), separated by “; ”."),
      },
    },
    // ISO/IEC 27001 and PCI DSS are named in no office row of Section 2; BKB-ADD-16 Section 3's "Applies to"
    // column (platform-written, Content Corrections item 1) says "All offices" for both.
    handIn: { step: 6, cols: [3, 4, 5, 6] },
    // Step 3's choice is made with rule R01; the helper walks its questions for one row at a time.
    // Step 3 is checked row by row against the pack's key once every row has a type: the learner
    // sees which were right and why before completing the step. (The R01 Yes/No helper is gone: it
    // asked again what the drop-down already asks.)
    // Step 4's typed offices are checked the same way, against BKB-ADD-16 Section 2 and Section 3.
    checkRows: { 3: { label: 1, col: 3 }, 4: { label: 1, col: 4 } },
    // Learn › Framework Quick Reference says what kind of instrument each standard is; Learn › Rule
    // tables holds R02, which step 4's question and its column E are decided by.
    reads: { 3: ["learn|Framework Quick Reference"], 4: ["learn|Rule tables"] },
  },
  "F1.3": {
    code: "CTX-IP",
    title: "CTX-IP · Interested parties",
    on: [5],
    cols: [{ h: "Party" }, { h: "Internal/External", opts: ["Internal", "External"] }, { h: "Requirement", w: 260 }, { h: "Standard/law", w: 220 }, { h: "Rule" }, { h: "Evidence ref" }],
    // Five rows: the first five parties of the addendum Section 4 (rule R04).
    rows: Array.from({ length: 5 }, () => ["", "", "", "", "", ""]),
    mine: () => true,
    steps: { 5: [0, 1, 2, 3] },
    ident: [],
    // Rule is R04 on every row, and every row is copied from the addendum's Section 4: typing either is no decision (owner,
    // 28 Oct: no "Copy to every row"), so both record themselves once the party is in. The sample mentee's addendum.
    derived: { 4: { from: [0], value: (v) => (v(0) ? "R04" : "") }, 5: { from: [0], value: (v) => (v(0) ? "BKB-ADD-16 Section 4" : "") } },
    // Copied from BKB-ADD-16 Section 4 (on screen beside the file): the party of the same row, in order, and
    // one or more of that party's requirements as listed there. Not an answer key: the source's text.
    cells: {
      0: {
        fix: (v, _r, desk, ri) => {
          const want = parties(desk)?.[ri]?.[0];
          return want && same(v, want) ? want : null;
        },
        hint: (_r, desk, ri) => `Row ${ri + 1} takes the party ${ordinal(ri)} in ${addendum(desk)} Section 4, as written there.`,
      },
      2: {
        fix: (v, _r, desk, ri) => {
          const reqs = parties(desk)?.[ri]?.[1] ?? [];
          const typed = v.split(/;|\n/).filter((x) => x.trim());
          const got = typed.map((x) => reqs.find((q) => same(q, x)));
          return typed.length && got.every(Boolean) && new Set(got).size === got.length ? got.join("; ") : null;
        },
        hint: (_r, desk, ri) => `Copy ${ordinal(ri)} party's requirements from ${addendum(desk)} Section 4, word for word, separated by “; ”.`,
      },
      // Section 4's Internal / External and Standard / law columns (platform-written, Content Corrections item 55).
      1: {
        fix: (v, _r, desk, ri) => (v && v === parties(desk)?.[ri]?.[2] ? v : null),
        hint: (_r, desk, ri) => `Read the Internal / External column of ${ordinal(ri)} party in ${addendum(desk)} Section 4.`,
      },
      3: {
        fix: (v, _r, desk, ri) => {
          const want = parties(desk)?.[ri]?.[3];
          return want && sameParts(v, want) ? want : null;
        },
        hint: (_r, desk, ri) => `Copy the Standard / law cell of ${ordinal(ri)} party in ${addendum(desk)} Section 4, every part of it, separated by “; ”.`,
      },
    },
    handIn: { step: 6, cols: [0, 1, 2, 3, 5] },
  },
  "F2.1": {
    code: "CLS-RES",
    title: "CLS-RES · Classification worksheet (template T-CLS)",
    on: [1, 2, 3, 6],
    cols: [
      { h: "Asset ID" },
      { h: "Asset" },
      { h: "Description" },
      { h: "Personal / regulated data", wrap: true },
      { h: "Asset criticality", wrap: true },
      { h: "Decision-tree path" },
      { h: "Group tier" },
      { h: "Personal data or credentials? (R05)", wrap: true, opts: ["Yes", "No"] },
      { h: "Rule" },
    ],
    // Dataset CLS-6 (Datasets_M2610-00001_W02.xlsx): the facts step 2's help names (what the asset is,
    // personal or regulated data, criticality); Department, Office and Location answer no question of
    // the tree and are left out. A-01 and A-02 are the worked rows, path and tier as the pack gives them.
    // Each description of A-03…A-08 ends with what disclosure would do, in Section 3.1's words (platform-written,
    // Content Corrections item 55): question 4 asks for harm "per Section 3.1" and whether it is severe, which
    // the pack's facts did not say (item 30). Written from the register's own tier for each asset.
    rows: [
      ["A-01", "Sales analytics & forecasts", "Pipeline analytics and revenue forecasts.", "No", "Standard / Operational", "Q1 No → Q2 harm if disclosed? Low → Tier 2", "Tier 2 — Internal", "", ""],
      ["A-02", "Regional performance dashboard", "Regional P&L, KPIs and management reporting.", "No", "Business Critical", "Q1 No → Q2 harm? Yes → Q3 personal data or restricted by law/contract? Yes → Tier 3", "Tier 3 — Confidential", "", ""],
      ["A-03", "Regional contracts repository", "Local contracts and legal documents. Disclosure would breach client contracts.", "No", "Standard / Operational", "", "", "", ""],
      ["A-04", "Sales contracts & order records", "Signed orders and commercial terms. Disclosure would mean the loss of major clients.", "No", "Business Critical", "", "", "", ""],
      ["A-05", "Learning management system", "Training records and L&D content. Disclosure would stay internal only.", "No", "Standard / Operational", "", "", "", ""],
      ["A-06", "Local regulatory compliance records", "Regional regulator filings and attestations. Disclosure would bring regulator fines.", "No", "Business Critical", "", "", "", ""],
      ["A-07", "Draft product brochure (not yet approved)", "Draft product brochure (not yet approved). Disclosure would stay internal only.", "See description", "Standard / Operational", "", "", "", ""],
      ["A-08", "Unlabelled internal wiki page on meeting-room booking", "Unlabelled internal wiki page on meeting-room booking. Disclosure would stay internal only.", "See description", "Standard / Operational", "", "", "", ""],
    ],
    mine: (r) => !r[5],
    // 2: path and tier, by walking the tree · 3: the R05 floor check. 4 and 5 fill the sheet's two
    // tables (BRIEFS["F2.1"]); 6 hands it in.
    steps: { 2: [5, 6], 3: [7] },
    tree: { 2: { doc: "BKB-STD-001", sec: "5", path: 5, tier: 6 } },
    // Every tier was reached with R05 (its first sentence is "walk the Section 5 tree"); the column records it
    // once the row's floor check is made, rather than having "R05" typed six times.
    derived: { 8: { from: [7], value: (v) => (v(7) ? "R05" : "") } },
    // Step 2's tiers and step 3's R05 answers are checked against the key (POST /me/desk/rows, keys
    // "F2.1-2" and "F2.1-3") once every row is in: the learner sees each row's answer and why before
    // completing. The old "a Yes below Tier 3 is flagged" check is gone: once step 2 is checked its tiers
    // are locked, so it sent the learner to a walk they could no longer do.
    checkRows: { 2: { label: 0, col: 6 }, 3: { label: 0, col: 7 } },
    ident: [0, 1, 2, 3, 4, 6],
    handIn: { step: 6, cols: [5, 6, 7], ident: [0, 1] },
    // Rule R05 (Learn › Rule tables) is what step 3's question tests.
    reads: { 3: ["learn|Rule tables"] },
    // Step 2's walk shows Section 5's questions beside the table; what is left to read is Section 3, the tiers and
    // their impact criteria (Section 3.1), which question 4 decides by ("per Section 3.1").
    extra: { 2: [["BKB-STD-001", ["3"]]] },
  },
  "F2.2": {
    code: "EVQ-RES",
    title: "EVQ-RES · Evidence check results (template T-EVQ)",
    on: [1, 2, 3, 4, 5],
    cols: [
      { h: "Item" },
      { h: "Evidence type", wrap: true },
      { h: "System" },
      { h: "Timestamp shown", wrap: true },
      { h: "Generated by", wrap: true },
      { h: "Period covered", wrap: true },
      { h: "Query / parameters", wrap: true },
      { h: "Integrity note", wrap: true },
      { h: "Approval evidence", wrap: true },
      { h: "Content note", wrap: true },
      { h: "Legibility" },
      { h: "Accept/Reject" },
      { h: "Defect code", opts: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"] },
      { h: "Fix", wrap: true, w: 240 },
      { h: "Rule" },
    ],
    // Dataset EVQ-6 (Datasets_M2610-00001_W02.xlsx): the columns the checks D1–D10 read (GRC101_Engine
    // datasets.py evidence_rows), then T-EVQ's own (p_tasks.py F2.2: Item | Accept/Reject | Defect code |
    // Fix | Rule). Control is "—" on every row and no check reads it. E-001 and E-002 are worked, their
    // decision and code as the pack gives them.
    rows: [
      ["E-001", "Quarterly privileged-access review sign-off sheet", "In-scope system", "2025-11-04 00:00 UTC", "tomás.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "Accept", "none", "", ""],
      ["E-002", "Visitor log sample", "In-scope system", "", "ananya.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "Reject", "D1", "", ""],
      ["E-003", "CSPM critical-findings dashboard export", "In-scope system", "2026-02-20 00:00 UTC", "hiro.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "", "", "", ""],
      ["E-004", "Backup restore test record", "In-scope system", "2026-04-26 00:00 UTC", "bianca.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "", "", "", ""],
      ["E-005", "Business impact analysis sign-off", "In-scope system", "2025-11-08 00:00 UTC", "lars.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Hand annotations and re-typed values present", "Approver name + date visible", "Masked content", "Legible", "", "", "", ""],
      ["E-006", "Supplier assessment record", "In-scope system", "2026-05-20 00:00 UTC", "lea.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "", "", "", ""],
      ["E-007", "Business impact analysis sign-off", "In-scope system", "2026-04-22 00:00 UTC", "nora.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "", "", "", ""],
      ["E-008", "New-starter access request ticket", "In-scope system", "2026-08-06 00:00 UTC", "grace.svc", "2025-10-05 to 2026-10-04", "Filter and date range shown in export header", "Unmodified system export", "Approver name + date visible", "Masked content", "Legible", "", "", "", ""],
    ],
    mine: (r) => !r[11],
    // 2: Accept/Reject, by walking R09's checks · 3: a rejected item's code (and its fix, which the pack
    // does not give) · 4: D9 items reported (`report`) · 5: handed in.
    steps: { 2: [11], 3: [12, 13] },
    checklist: { 2: { page: "Ref-Defect codes", col: 11, reads: { D1: 3, D2: 4, D3: 5, D4: 3, D5: 6, D6: 7, D7: 2, D8: 8, D9: 9, D10: 10 }, pass: "Accept", fail: "Reject" } },
    report: { step: 4, col: 9, clean: "Masked content" },
    derived: {
      // R09 decided the row once it has a decision; typing "R09" on every row is no decision.
      14: { from: [11], value: (v) => (v(11) ? "R09" : "") },
      // An accepted item has no defect: "none", as the worked E-001 shows. A rejected one's is chosen.
      12: { from: [11], value: (v) => (v(11) === "Accept" ? "none" : null) },
      // No fix for an accepted item; a rejected item's fix is copied from Ref-Defect codes (below).
      13: { from: [11], value: (v) => (v(11) === "Accept" ? "—" : null) },
    },
    cells: {
      12: {
        // Only a rejected item is typed here (an accepted one records "none"): it needs its decision first.
        fix: (v, r) => (r[11] ? v : null),
        hint: () => "Decide Accept or Reject for this item in step 2 first.",
      },
      // The Fix of the row's own code, as Ref-Defect codes gives it (Fix column platform-written, item 55).
      13: {
        fix: (v, r, d) => {
          const want = (d.pages["Ref-Defect codes"]?.r as string[][] | undefined)?.find((x) => x[0] === r[12])?.[2];
          return want && same(v, want) ? want : null;
        },
        hint: (r) => (r[12] && r[12] !== "none" ? `Copy the Fix of ${r[12]} from Evidence › Defect Codes, word for word.` : "Choose the item's defect code first."),
      },
    },
    ident: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    handIn: { step: 5, cols: [11, 12, 13, 14], ident: [0, 1] },
    // Evidence › Defect Codes says what each code means and its fix: step 1 finds E-002's, step 3 chooses the rest.
    reads: { 1: ["evidence|Defect Codes"], 3: ["evidence|Defect Codes"] },
    // Accept/Reject (step 2) and the defect code (step 3) are checked against the key once every item is
    // in (keys "F2.2-2", "F2.2-3"). An accepted item's "none" is checked too: it says the item has no defect.
    checkRows: { 2: { label: 0, col: 11 }, 3: { label: 0, col: 12 } },
  },
  "T3.1": {
    code: "T-OBL",
    title: "OBL-REG · Obligations register extract (template T-OBL)",
    on: [1, 2, 3, 4, 5, 6, 7, 8],
    // The 12 columns of T-OBL (GRC101_Engine/p_tasks.py T3.1; MenteePack Ref-Templates: "12 columns").
    cols: [
      { h: "Obl. ID", auto: "OBL" },
      { h: "Obligation (plain English)", wrap: true, w: 260 },
      { h: "Source instrument", wrap: true },
      { h: "Article/clause", wrap: true, w: 200 },
      { h: "Type", opts: ["law", "reg", "standard", "contract"] },
      { h: "Office(s)", opts: (d) => [...obl.offices(d).map(city), obl.offices(d).map(city).join("; ")] },
      { h: "Process", w: 200 },
      { h: "Owner role", wrap: true, w: 150 },
      { h: "Evidence of compliance", wrap: true, w: 240 },
      { h: "Frequency / deadline", wrap: true },
      { h: "Linked BKB policy", wrap: true, w: 240, opts: () => obl.policies().map(([id, t]) => `${id} ${t}`) },
      { h: "Evidence ref" },
    ],
    rows: [],
    mine: () => true,
    // 1 copies each office's Section 2 row · 2 splits them with R10 · 3 adds Section 2.1 and Section 6 · 4 the contract rows ·
    // 5 links each row to its policy (the owner follows from the BKB-POL-000 index) · 6 stops at 15 ·
    // 7 compares the clocks with BKB-ERM-001 Annex A · 8 hands it in.
    steps: { 1: [1, 2, 3, 4, 5, 11], 2: [1], 3: [1, 2, 3, 4, 5, 11], 4: [1, 2, 3, 4, 5, 11], 5: [6, 8, 9, 10], 6: [] },
    grow: {
      target: 15, adds: { 1: 2, 3: 10, 4: 3 }, cap: 17, trim: 6, keep: { col: 4, value: "contract", min: 3 },
      // Section 6's US health and United States overlays bind the Phoenix office (Section 2's Phoenix row), not Manila or Warsaw.
      drop: {
        bad: (r, d) => { const o = obl.rows6(d)?.find((x) => same(x[1], r[1])); return !!o && overlayOffices(d, r[1]) === ""; },
        why: (d) => `The HIPAA and United States overlays of ${addendum(d)} Section 6 are US laws: Section 2 names them in the Phoenix row only, so they bind neither Manila nor Warsaw.`,
      },
    },
    split: { 2: { col: 1, from: 1 } },
    compare: { step: 7, col: 9 },
    then: { 2: "Split the rows with rule R10", 4: "Add the 3 contract rows", 5: "Link each row to its BKB policy", 7: "Compare the clocks with BKB-ERM-001 Annex A" },
    // Type is checked where a document says what kind of instrument the row comes from: a Section 2 row's
    // source is the office's Data-protection law; a Section 2.1 line is a requirement of the lead regulator.
    // Section 6's overlays mix laws, regulators' rules and standards, and the pack says nothing: not scored.
    // Step 5's policy is checked against the key by the row's Process (key "T3.1-5"): which policy
    // implements a process is the BKB-POL-000 index's, never typed per row.
    checkRows: { 1: { label: 5, col: 4, rule: typeOfRow }, 3: { label: 1, col: 4, rule: typeOfRow }, 5: { label: 1, col: 10, ask: 6 } },
    ident: [0, 1, 5],
    view: { 2: [5, 11], 6: [4, 5, 11], 7: [5, 9, 11] },
    load: ["BKB-POL-000", "Organization_Profiles", "BKB-ERM-001"],
    // Owner role = the owner of the linked BKB policy in the BKB-POL-000 index (rule R10): a lookup, so
    // the platform writes it once the policy is chosen.
    derived: { 7: { from: [10], value: (v) => (v(10) ? (obl.policies().find(([id]) => v(10).startsWith(id))?.[2] ?? "") : "") } },
    cells: {
      1: {
        fix: (v, r, d, _ri, by) => {
          if (by === 1) {
            // As Section 2 writes it, or, once split with R10 (step 2), the part of it this row kept.
            const want = obl.row(d, r[5])?.[3];
            if (!want) return null;
            if (same(v, want)) return want;
            return v.trim().length > 3 && joints(want).length && want.toLowerCase().includes(v.trim().toLowerCase()) ? v.trim() : null;
          }
          if (by === 3) return obl.listed3(d).find((x) => same(x, v)) ?? null;
          if (by === 4) return obl.keyReqs().find((x) => same(x, v)) ?? null;
          return v.trim() || null;
        },
        hint: (r, d, _ri, by) =>
          by === 1
            ? r[5] && !r[5].includes(";")
              ? `Copy the Breach notification cell of the ${r[5]} row of ${addendum(d)} Section 2, word for word.`
              : "Choose the row's office first: one row for each office."
            : by === 3
              ? `Copy one line of ${addendum(d)} Section 2.1, or one requirement of Section 6, word for word.`
              : "Copy one Key Requirement of GlobalConnect Customer Solutions, word for word.",
      },
      2: {
        fix: (v, r, d, _ri, by) => {
          if (by !== 1) return v.trim() || null;
          const want = obl.row(d, r[5])?.[1];
          return want && same(v, want) ? want : null;
        },
        hint: (r, d) => `Copy the Data-protection law cell of the ${r[5] || "office's"} row of ${addendum(d)} Section 2.`,
      },
      // As BKB-ADD-16 Section 2.2 gives it for the row's obligation.
      3: {
        fix: (v, r, d, _ri, by) => obl.detailRows(d, r, by).find((x) => same(x[2], v))?.[2] ?? null,
        hint: (r) => (r[1].trim() ? `Copy the Article / clause of this obligation's row in BKB-ADD-16 Section 2.2.` : "Copy the obligation first."),
      },
      4: { fix: (v, _r, _d, _ri, by) => (by === 4 && v !== "contract" ? null : v), hint: () => "A customer's Key Requirement is a contract obligation." },
      5: {
        fix: (v, r, d, _ri, by) => {
          if (by === 1 && v.includes(";")) return null;
          // A line of Section 2.1 is a requirement of the head office's lead regulator (Section 1, Lead regulator(s)).
          if (by === 3 && obl.lines21(d)?.some((x) => same(x, r[1])) && v !== city(d.orgs.A.office)) return null;
          // A Section 6 overlay binds the offices whose law it is: Section 2 (GDPR) or Section 3's Applies to (PCI DSS).
          const want = by === 3 ? overlayOffices(d, r[1]) : null;
          if (want && v !== want) return null;
          return v;
        },
        hint: (r, d, _ri, by) =>
          by === 1
            ? "Each office has its own Section 2 row: one office per row."
            : obl.lines21(d)?.some((x) => same(x, r[1]))
              ? `Section 2.1 lists the lead regulator's requirements: ${addendum(d)} Section 1, Lead regulator(s), says whose regulator that is.`
              : `Which of your two offices does this overlay bind? ${addendum(d)} Section 2 names each office's laws, and Section 3's Applies to column says where a standard applies.`,
      },
      6: {
        fix: (v, r, d, _ri, by) => obl.detailRows(d, r, by).find((x) => same(x[4], v))?.[4] ?? null,
        hint: () => "Copy the Process of this obligation's row in BKB-ADD-16 Section 2.2.",
      },
      8: {
        fix: (v, r, d, _ri, by) => obl.detailRows(d, r, by).find((x) => same(x[5], v))?.[5] ?? null,
        hint: () => "Copy the Evidence of compliance of this obligation's row in BKB-ADD-16 Section 2.2.",
      },
      9: {
        fix: (v, r, d, _ri, by) => obl.detailRows(d, r, by).find((x) => same(x[3], v))?.[3] ?? null,
        hint: () => "Copy the Frequency / deadline of this obligation's row in BKB-ADD-16 Section 2.2.",
      },
      11: {
        fix: (v, r, d, _ri, by) => {
          const want = obl.ref(d, r[1], by);
          return want && norm(v) === norm(want) ? want : null;
        },
        hint: (r, d, _ri, by) =>
          obl.ref(d, r[1], by) ? `Name where the obligation was copied from: ${by === 4 ? "the workbook, then its sheet" : "the document, then the section"}.` : "Copy the obligation first.",
      },
    },
    // Nothing on the platform gives these (Content Corrections item 41): Process and Evidence of
    // compliance on any row, an article where the obligation names none, a deadline where it states none.
    handIn: { step: 8, cols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], ident: [0, 1] },
    note: {
      1: (d) => `${addendum(d)} Section 2 has one row for each office. Add 2 rows, one for ${obl.offices(d).map(city).join(" and one for ")}. Each office's Breach notification cell is its obligation. Article/clause is in ${addendum(d)} Section 2.2.`,
      3: (d) => {
        const [a, b] = [obl.lines21(d)?.length, obl.rows6(d)?.length];
        return `${addendum(d)} Section 2.1 lists ${a ?? "its"} lead-regulator requirements and Section 6 has ${b ?? "its"} overlays. Add one row for each${a && b ? `: ${a + b} rows` : ""}. Article/clause is in Section 2.2. Type: law for an act of parliament, reg for a regulator's own requirement, standard for an industry standard; Learn › Framework Quick Reference says which a named standard or law is.`;
      },
      4: (d) => `Add 3 rows, one for each of the first three Key Requirements of GlobalConnect Customer Solutions. Article/clause is in ${addendum(d)} Section 2.2.`,
      5: (d) => `Frequency / deadline, Process and Evidence of compliance are in ${addendum(d)} Section 2.2, one row per obligation. The policy that implements each row is in the BKB-POL-000 Section 3 index: Check my answers then shows each row's answer.`,
      6: () =>
        "Steps 1 to 4 give 17 rows; the register holds 15. Keep the 3 contract rows, which KR2 needs, and remove the two rows that bind neither of your two offices.",
    },
    reads: { 3: ["learn|Framework Quick Reference"], 4: ["policies|Policy Library"] },
    extra: {
      // Section 1 names the head office and its lead regulator, Section 2 each office's laws (with Section 2.1 and Section 2.2), Section 3 where a standard applies.
      3: [["BKB-ADD-16", ["1", "2", "3", "6"]]],
      4: [["Organization_Profiles", ["1"]], ["BKB-ADD-16", ["2.2"]]],
      5: [["BKB-POL-000", ["3"]], ["BKB-ADD-16", ["2.2"]]],
      7: [["BKB-ERM-001", ["Annex A"]]],
    },
  },
  // T3.1's Lead Implementer extension LI-01: template T-LI-FAM, its 10 documents listed (MenteePack
  // Ref-Templates: "10 documents pre-listed; Requirements/Guidance drop-down; PDCA diagram"). Every value
  // is on Learn › Reference pages › Ref-27000 family, or follows from rule L02; a cell is checked against
  // that page, which is open beside it, never against a key. The PDCA diagram is BRIEFS["T3.1 LI-FAM"].
  "T3.1 LI-FAM": {
    code: "T-LI-FAM",
    title: "LI-FAM · ISO/IEC 27000-family map (template T-LI-FAM)",
    on: [9, 10, 11, 14],
    cols: [
      { h: "Document" },
      { h: "Purpose in one sentence", wrap: true, w: 300, opts: (d) => fam(d).map((r) => r[1]).sort() },
      { h: "Requirements or guidance", wrap: true, opts: ["Requirements", "Guidance"] },
      { h: "Certifiable?", opts: ["Yes", "No"] },
      { h: "Who uses it", wrap: true, w: 220, opts: (d) => [...new Set(fam(d).map((r) => r[4]))].sort() },
    ],
    rows: ["ISO/IEC 27000", "ISO/IEC 27001:2022 + Amd 1:2024", "ISO/IEC 27002:2022", "ISO/IEC 27003", "ISO/IEC 27004", "ISO/IEC 27005:2022", "ISO/IEC 27006-1", "ISO/IEC 27007", "ISO/IEC 17021-1", "ISO 19011"].map((x) => [x, "", "", "", ""]),
    mine: () => true,
    // 9: whether each can be certified against, and who uses it · 10: its purpose · 11: rule L02.
    steps: { 9: [3, 4], 10: [1], 11: [2] },
    ident: [0],
    cells: {
      1: { fix: (v, r, d) => (same(v, famRow(d, r[0])?.[1] ?? " ") ? v : null), hint: (r) => `Not the purpose Ref-27000 family gives ${r[0]}.` },
      2: {
        // Rule L02 names the three requirement documents; every other listed document is guidance.
        fix: (v, r, d) => (v === (l02(d).some((x) => r[0].startsWith(x)) ? "Requirements" : "Guidance") ? v : null),
        hint: () => "Read rule L02 again: it names the three requirement documents; all the others are guidance.",
      },
      3: { fix: (v, r, d) => ((famRow(d, r[0])?.[3] ?? "").startsWith(v) ? v : null), hint: (r) => `Not what Ref-27000 family says for ${r[0]}.` },
      4: { fix: (v, r, d) => (same(v, famRow(d, r[0])?.[4] ?? " ") ? v : null), hint: (r) => `Not who Ref-27000 family says uses ${r[0]}.` },
    },
    handIn: { step: 14, cols: [1, 2, 3, 4], ident: [0] },
    note: {
      9: () => "Learn › Reference pages › Ref-27000 family describes all 10 documents. For each one, record whether an organisation can be certified against it, and who uses it.",
      10: () => "Match each document with its purpose, as Ref-27000 family states it.",
      11: () => "Rule L02 (Learn › Rule tables) names the requirement documents. Choose for each document.",
    },
    reads: { 9: ["learn|Reference pages"], 10: ["learn|Reference pages"], 11: ["learn|Rule tables"] },
  },
  // T3.2 MAP-XW, template T-MAP (GRC101_Engine/p_guided.py T3.2: "Req. ID | Standard | Requirement title |
  // ISO/IEC 27001 control(s) | BKB policy + clause | Procedure section or "none" | Coverage (R11) | Gap
  // sentence (R12) | Rule | Evidence ref"). Rows: dataset MAP-8 (Datasets_M2610-00001_W03.xlsx), given.
  // The policy is found first (step 1), so that the control (2) and the procedure (3) are looked up in it.
  // Nothing here is a key: the policy, control and coverage are the mentee's decisions; the checks read
  // the policy the row names (its outline in the library, its owner in BKB-POL-000 Section 3). The three candidate
  // controls per requirement are platform-written (Content Corrections item 47); the key is the backend's.
  "T3.2": {
    code: "T-MAP",
    title: "MAP-XW · Crosswalk (template T-MAP)",
    on: [1, 2, 3, 4, 5, 6, 7],
    cols: [
      { h: "Req. ID" },
      { h: "Standard", wrap: true, w: 120 },
      { h: "Requirement", wrap: true, w: 220 },
      { h: "ISO/IEC 27001 control", wrap: true, w: 260, opts: (_d, r) => ANNEX_A.filter(([id]) => CANDIDATES[r[0]]?.includes(id)).map(([id, t]) => `${id} ${t}`) },
      { h: "BKB policy", wrap: true, w: 260, opts: () => obl.policies().map(([id, t]) => `${id} ${t}`) },
      { h: "Procedure section", wrap: true },
      { h: "Coverage (R11)", wrap: true, opts: "step" },
      { h: "Gap sentence (R12)", wrap: true, w: 280 },
      { h: "Rule" },
      { h: "Evidence ref", w: 170 },
    ],
    rows: [
      ["A.11", "ISO/IEC 29151", "Information security of PII"],
      ["Art.12", "GDPR", "Transparent information and modalities for data-subject rights"],
      ["A.8", "ISO/IEC 29151", "Openness, transparency and notice"],
      ["A.10", "ISO/IEC 29151", "Accountability"],
      ["312.10", "COPPA Rule (16 CFR 312)", "Data retention and deletion — written retention policy"],
      ["Art.16", "KVKK (Turkey)", "Data Controllers' Registry (VERBİS)"],
      ["99.37", "FERPA (34 CFR 99)", "Directory information"],
      ["Art.19", "GDPR", "Notification obligation regarding rectification, erasure or restriction"],
    ].map((r) => [...r, "", "", "", "", "", "", ""]),
    mine: () => true,
    // 1: the policy · 2: the control (D1) · 3: the procedure · 4: coverage (D2) · 5: the gap sentence ·
    // 6: the evidence ref · 7: handed in.
    steps: { 1: [4], 2: [3], 3: [5], 4: [6], 5: [7], 6: [9] },
    ident: [0, 1, 2],
    // R11 reads the row's control, policy and procedure: shown beside the rating.
    // The gap sentence reads the row's policy (its owner), procedure and rating; the evidence ref its policy.
    view: { 2: [0, 1, 2, 3, 4], 3: [0, 1, 2, 4, 5], 4: [0, 3, 4, 5, 6], 5: [0, 2, 4, 5, 6, 7, 8], 6: [0, 2, 4, 5, 9] },
    load: ["BKB-POL-000"],
    derived: {
      // R12 asks for a gap sentence on a Partial or None row only: a Full row has no gap.
      7: { from: [6], value: (v) => (v(6) === "Full" ? "—" : null) },
      8: { from: [6, 7], value: (v) => (v(6) ? (v(7) && v(7) !== "—" ? "R11; R12" : "R11") : "") },
    },
    cells: {
      // A section of the row's own policy whose heading is "Procedure: …", or "none".
      5: {
        fix: (v, r, d) => {
          const t = v.trim();
          if (/^none$/i.test(t)) return "none";
          const n = t.replace(/^(\u00a7|sections?)\s*/i, "");
          return procedures(d, polId(r)).includes(n) ? `Section ${n}` : null;
        },
        hint: (r) => (polId(r) ? `Type the number of a “Procedure:” section of ${polId(r)} (Policies › Policy Library), or none.` : "Choose the row's BKB policy in step 1 first."),
      },
      // R12: "Missing: <policy clause / procedure / control>. Owner: <policy owner>." The owner is read in
      // BKB-POL-000 Section 3 for the row's policy; a row with no procedure is missing one.
      7: {
        fix: (v, r) => {
          if (!r[6]) return null;
          const m = v.trim().match(/^Missing:\s*(.+?)\.\s*Owner:\s*(.+?)\.?$/i);
          const owner = obl.policies().find(([id]) => id === polId(r))?.[2];
          if (!m || !owner || !same(m[2], owner)) return null;
          if (r[5] === "none" && !/procedure/i.test(m[1])) return null;
          return `Missing: ${m[1].trim()}. Owner: ${owner}.`;
        },
        hint: (r) =>
          !r[6]
            ? "Rate this row's coverage in step 4 first."
            : `Write it in R12's frame: “Missing: <what the row lacks>. Owner: <the owner of ${polId(r) || "the row's policy"} in BKB-POL-000 Section 3>.” Check both parts.`,
      },
      // Where the row's mapping can be checked: its policy, then a section of it.
      9: {
        fix: (v, r, d) => {
          const m = v.trim().match(/^(BKB-POL-\d{3})\s*(?:\u00a7|sections?)?\s*([\d.]+)$/i);
          return m && m[1].toUpperCase() === polId(r) && outline(d, polId(r)).includes(m[2]) ? `${polId(r)} Section ${m[2]}` : null;
        },
        hint: (r) => (polId(r) ? `Name the row's policy, ${polId(r)}, then the section you read in it (Section and its number).` : "Choose the row's BKB policy in step 1 first."),
      },
    },
    handIn: { step: 7, cols: [3, 4, 5, 6, 7, 8, 9], ident: [0, 1] },
    // D1 is checked against the backend key (T3.2-2); D2 is R11 applied to the row's own cells.
    checkRows: { 1: { label: 0, col: 4 }, 2: { label: 0, col: 3 }, 4: { label: 0, col: 6, rule: r11 } },
    then: { 5: "Write the gap sentence of every Partial or None row (R12)" },
    note: {
      1: () => "Start with BKB-POL-000 Section 8, then read the requirement: a Crosswalk View key word points to a narrower policy only where that policy's title (Section 3) is about what the requirement asks.",
      2: () => "Each requirement offers three candidate controls. Frameworks › Crosswalk View gives the controls of the policy you chose in step 1; read the requirement to choose among them.",
      3: () => "Each policy's Section 6 lists its procedures by name. Open the row's policy in Policies › Policy Library. A number that is not one of its procedures is flagged; which procedure fits is your call, and an assessor reviews it at checkpoint HC2.",
      5: () => "Each owner is checked against BKB-POL-000 Section 3 as you type. What you name as missing is reviewed by an assessor at checkpoint HC2.",
      4: (d) => `Rule R11: ${d.rules.R11?.[1] ?? ""}`,
      6: () => "Evidence ref says where a reader can check the row: its BKB policy and the section you read. A policy other than the row's, or a section it does not have, is flagged; the section you cite is reviewed at checkpoint HC2.",
    },
    reads: {
      1: ["frameworks|Crosswalk View", "policies|Policy Library"],
      2: ["frameworks|Crosswalk View"],
      3: ["policies|Policy Library"],
      6: ["policies|Policy Library"],
    },
    // BKB-POL-000: Section 3 lists every policy by title, Section 8 which policy carries each sector obligation (COPPA,
    // FERPA …); Section 3 gives each policy's owner, whom the gap sentence names.
    extra: { 1: [["BKB-POL-000", ["3", "8"]]], 5: [["BKB-POL-000", ["3"]]] },
  },
  // T3.2's Lead Implementer extension LI-05: template T-LI-SOA, "pre-filled with the 93 control IDs and
  // titles" (LI-05 inputs), with applicability (L06), justification (L06), implementation status (L07) and
  // the deep-dive controls' cybersecurity concept (L05).
  "T3.2 LI-SOA": {
    code: "T-LI-SOA",
    title: "LI-SOA · Statement of Applicability (template T-LI-SOA)",
    on: [8, 9, 10, 11, 12, 13],
    cols: [
      { h: "Control" },
      { h: "Title", wrap: true, w: 240 },
      { h: "Applicable (L06)", wrap: true, opts: ["Applicable", "Not applicable"] },
      { h: "Justification (L06)", wrap: true, w: 240, opts: (d) => [...riskRows(d).map((r) => r[0]), BASELINE] },
      { h: "Implemented (L07)", wrap: true, opts: ["Yes", "Planned", "No"] },
      { h: "Cybersecurity concept (L05)", wrap: true, opts: (d) => [...new Set(attrs(d).map((r) => r[5]))].sort() },
    ],
    rows: ANNEX_A.map(([id, t]) => [id, t, "", "", "", ""]),
    mine: () => true,
    // 8: the template checked against Annex A's themes (STUDY) · 9: applicability · 10: status of the deep-dive
    // controls · 11: their concept · 12: the consistency check · 13: handed in.
    steps: { 9: [2, 3], 10: [4], 11: [5], 12: [2] },
    ident: [0, 1],
    only: { 10: (r) => DEEP_DIVE.includes(r[0]), 11: (r) => DEEP_DIVE.includes(r[0]) },
    derived: {
      // L07 and L05 are asked for the 12 deep-dive controls only.
      4: { from: [0], value: (v) => (DEEP_DIVE.includes(v(0)) ? null : "—") },
      5: { from: [0], value: (v) => (DEEP_DIVE.includes(v(0)) ? null : "—") },
    },
    // L06's justification is the first source found: a risk-register treatment (RA-36, HQ Istanbul sheet), a
    // law in the addendum, a contract, else the Group baseline. No law or contract names an Annex A control,
    // so it is a risk ID or the baseline. A copy from the page on screen, checked as one (`cells`).
    // L07 reads TSA-36's Control_Mapping and Roadmap sheets (Learn › Reference pages): checked by key T3.2-10.
    cells: {
      3: {
        fix: (v, r, d) => (v && v === justification(d, r[0]) ? v : null),
        hint: (r) => `Rule L06: look for ${r[0]} in the controls column of RA-36 Risk register (HQ Istanbul), top down; a range such as A.7.1–A.7.7 includes the controls between. If no risk lists it, go on down L06's order.`,
      },
    },
    consistency: {
      step: 12,
      col: 2,
      // L06: Not applicable only where Ref-SoA exclusions lists the control, and never for a control a
      // risk treatment uses (ISO/IEC 27001 clause 6.1.3).
      bad: (r, d) => r[2] === "Not applicable" && (!soaExcluded(d).includes(r[0]) || !!usedBy(d, r[0])),
      why: (r, d) =>
        usedBy(d, r[0])
          ? `Marked Not applicable, but risk ${usedBy(d, r[0])} in RA-36 Risk register (HQ Istanbul) uses it as a treatment.`
          : "Marked Not applicable, but Ref-SoA exclusions does not list it.",
    },
    checkRows: { 9: { label: 0, col: 2 }, 10: { label: 0, col: 4 }, 11: { label: 0, col: 5 } },
    then: { 12: "Check consistency (L06)" },
    handIn: { step: 13, cols: [2, 3, 4, 5], ident: [0, 1] },
    note: {
      9: () =>
        "Rule L06 starts from Ref-SoA exclusions (Learn › Reference pages): decide each control against it, row by row. " +
        "Justification: the first source in L06's order. RA-36 Risk register (HQ Istanbul), in Learn › Reference pages, lists the controls each risk's treatment uses (the regional sheets repeat these risks). " +
        "A law in BKB-ADD-36 Section 2 or a contract in Organization_Profiles would come next, but neither names an Annex A control; otherwise “Group baseline (BKB-POL-001)”.",
      10: (d) => `Rule L07: ${d.rules.L07?.[1] ?? ""} Both sheets are in Learn › Reference pages: TSA-36 Control_Mapping and TSA-36 Roadmap.`,
      11: () => `Your 12 deep-dive controls: ${DEEP_DIVE.join(", ")}. Rule L05: copy each one's cybersecurity concept from Ref-27002 attributes (Learn › Reference pages).`,
    },
    reads: {
      9: ["learn|Reference pages"],
      10: ["learn|Reference pages"],
      11: ["learn|Reference pages"],
      12: ["learn|Reference pages"],
    },
  },
  // T4.1 POL-CUR, template T-POL sheet 1 (GRC101_Engine/p_guided.py T4.1: "Check | Yes/No | Value copied | Evidence
  // ref"). The six checks are platform-written from the engine's KR1 ("owner, approval, effective date, next review
  // < 12 months, communication/attestation evidence") and its verdict's observation (the "draft for Board
  // ratification" status): Content Corrections item 57. Each value is copied from BKB-POL-006 Section 11; Yes/No is checked
  // against the key (T4.1-1).
  "T4.1": {
    code: "POL-CUR",
    title: "POL-CUR · Currency checklist (template T-POL, sheet 1)",
    on: [1, 6],
    cols: [{ h: "Check", wrap: true }, { h: "Value copied", wrap: true, w: 240 }, { h: "Yes/No", opts: "step", w: 220 }, { h: "Evidence ref" }],
    rows: CURRENCY.map(([c]) => [c, "", "", ""]),
    mine: () => true,
    steps: { 1: [1, 2] },
    ident: [0],
    load: ["BKB-POL-006"],
    // Every value is copied from the same table: the platform records where.
    derived: { 3: { from: [1], value: (v) => (v(1) ? "BKB-POL-006 Section 11" : "") } },
    cells: {
      1: {
        fix: (v, _r, _d, ri) => {
          const want = pol006Field(CURRENCY[ri]?.[1] ?? "");
          return want && same(v, want) ? want : null;
        },
        hint: (_r, _d, ri) => `Copy the ${CURRENCY[ri]?.[1]} row of the document-control table, BKB-POL-006 Section 11, as written.`,
      },
    },
    checkRows: { 1: { label: 0, col: 2 } },
    handIn: { step: 6, cols: [1, 2, 3], ident: [0] },
    note: {
      1: () => "BKB-POL-006 Section 11 is the policy's document-control table: copy each line's value from it, then decide whether the value meets the line. BKB-POL-000 Section 2 says who approves a policy; Section 7 sets its lifecycle, from approval to communication and annual review.",
    },
  },
  // T4.1 POL-GAP, template T-POL sheet 2 ("Req. | Covered/Partly/Not covered (R13) | Policy clause | Redline (R13
  // frame) | Fix location (R13) | Rule"). Rows: dataset POL-GAP (Datasets_M2610-00001_W04.xlsx), BKB-POL-006's
  // probes. The clause (step 2) and the coverage (step 3) are checked against the key, from the engine's probe key
  // (p_probes.py; Platform_M2610-00001.json answer_key); the fix location (step 4) is R13's own test on the row.
  "T4.1 POL-GAP": {
    code: "POL-GAP",
    title: "POL-GAP · Gap table and redlines (template T-POL, sheet 2)",
    on: [2, 3, 4, 5, 6],
    cols: [
      { h: "Q" },
      { h: "Requirement statement", wrap: true, w: 260 },
      { h: "Source", wrap: true, w: 150 },
      { h: "Policy clause", wrap: true, opts: () => CLAUSES },
      { h: "Coverage (R13)", wrap: true, opts: "step" },
      { h: "Fix location (R13)", wrap: true, opts: "step" },
      { h: "Redline (R13 frame)", wrap: true, w: 300 },
      { h: "Rule" },
    ],
    rows: [
      ["Q1", "Access to source code must be restricted.", "ISO/IEC 27001 A.8.4"],
      ["Q2", "Password complexity, rotation and storage rules must be defined for systems that cannot use MFA/SSO.", "ISO/IEC 27001 A.5.17"],
      ["Q3", "Third-party access should be time-bound.", "ISO/IEC 27001 A.5.18"],
      ["Q4", "Access must be granted on least privilege and approved by the asset owner.", "ISO/IEC 27001 A.5.15 / SOC 2 CC6.3"],
      ["Q5", "AI agents must have dedicated identities with scoped permissions.", "BKB-POL-022"],
      ["Q6", "Shared accounts are prohibited except controlled break-glass accounts.", "ISO/IEC 27001 A.5.16"],
    ].map((r) => [...r, "", "", "", "", ""]),
    mine: () => true,
    // 2: the clause · 3: coverage (R13) · 4: where the fix belongs (R13) · 5: the redline · 6: handed in.
    steps: { 2: [3], 3: [4], 4: [5], 5: [6] },
    ident: [0, 1],
    view: { 3: [3], 4: [2, 4], 5: [3, 4, 5] },
    load: ["BKB-POL-006"],
    derived: {
      // A covered requirement has no gap: no fix location and no redline.
      5: { from: [4], value: (v) => (v(4) === "Covered" ? "—" : null) },
      6: { from: [4], value: (v) => (v(4) === "Covered" ? "—" : null) },
      7: { from: [4], value: (v) => (v(4) ? "R13" : "") },
    },
    cells: {
      // R13's redline frame, "<Role> shall <action> within <time limit>.", with a role BKB-POL-006 Section 5 or Section 6 names;
      // or "Exception needed" where the redline would weaken a Group value. What it says is reviewed at HC2.
      6: {
        fix: (v) => {
          const t = v.trim().replace(/\s+/g, " ");
          if (/^exception needed\.?$/i.test(t)) return "Exception needed";
          const m = t.match(/^(.+?) shall (.+) within (.+?)\.?$/i);
          if (!m || m[2].trim().length < 4 || !/\d|immediately|hour|day|week|month|year/i.test(m[3])) return null;
          return POL006_ROLES.some((x) => same(x, m[1])) ? `${t.replace(/\.?$/, "")}.` : null;
        },
        hint: () => "Write it in R13's frame: “<Role> shall <action> within <time limit>.”, with a role as BKB-POL-006 Section 5 or Section 6 names it (such as IAM team), and a time limit. Or “Exception needed”.",
      },
    },
    // Step 4 is R13's "where to fix" on the row's own requirement: checked on the desk, no key.
    checkRows: { 2: { label: 0, col: 3 }, 3: { label: 0, col: 4 }, 4: { label: 0, col: 5, rule: fixWhere } },
    handIn: { step: 6, cols: [3, 4, 5, 6, 7], ident: [0, 1] },
    note: {
      2: () => "Search BKB-POL-006 and BKB-ADD-16 for each requirement's action words, and choose the clause that holds them, or none. A bullet of Section 3.1 is counted from the top: the first is bullet 1.",
      3: (d) => `Rule R13: ${(d.rules.R13?.[1] ?? "").split(" Where to fix")[0]} Your clause from step 2 is beside each row.`,
      4: (d) => `Rule R13: ${(d.rules.R13?.[1] ?? "").match(/Where to fix:[^.]*\./)?.[0] ?? ""} Addenda may only add or tighten (BKB-POL-000 Section 5). A covered row has no gap: it shows —.`,
      5: () => "Write a redline for each row you rated Partly or Not covered: “<Role> shall <action> within <time limit>.” The role is one BKB-POL-006 Section 5 or Section 6 names. A redline that would make a Group value weaker is “Exception needed” (BKB-POL-000 Section 6). The frame and the role are checked as you type; what each redline says is reviewed at checkpoint HC2.",
    },
    reads: { 3: ["learn|Rule tables"], 4: ["learn|Rule tables"], 5: ["learn|Rule tables"] },
    extra: {
      3: [["BKB-POL-006", ["3", "4", "6", "7"]], ["BKB-ADD-16", ["5", "6"]]],
      4: [["BKB-POL-000", ["5"]]],
      5: [["BKB-POL-006", ["5", "6"]], ["BKB-POL-000", ["2", "6"]]],
    },
  },
  // T4.1's Lead Implementer extension LI-06, template T-LI-POL: "5.2 checklist (…) with evidence | leadership evidence
  // list | RACI" (GRC101_Engine/p_li.py), one register per sheet, handed in together at step 10.
  // Sheet 1: the seven items of ISO/IEC 27001 clause 5.2 a)–g), in our words, each with the key word rule L08 searches
  // BKB-POL-001 for (platform-written, item 57). Found/Gap follows from the policy on screen (L08), so it is checked here.
  "T4.1 LI-POL": {
    code: "LI-POL 5.2 check",
    title: "LI-POL · Clause 5.2 checklist (template T-LI-POL)",
    on: [7, 10],
    // The key word names the row: it stays in view when the table scrolls sideways (on a phone, the long item would
    // cover the rest).
    cols: [{ h: "Key word", wrap: true }, { h: "Item (clause 5.2)", wrap: true, w: 220 }, { h: "Found/Gap (L08)", wrap: true, opts: "step" }, { h: "Section" }],
    rows: CL52.map(([item, kw]) => [kw, item, "", ""]),
    mine: () => true,
    steps: { 7: [2, 3] },
    ident: [0, 1],
    load: ["BKB-POL-001"],
    derived: { 3: { from: [2], value: (v) => (v(2) === "Gap" ? "—" : null) } },
    cells: {
      3: {
        fix: (v, r) => {
          const n = v.trim().replace(/^(\u00a7|sections?)\s*/i, "");
          return pol001Has(r[0]).includes(n) ? `Section ${n}` : null;
        },
        hint: (r) => `Type the number of a section of BKB-POL-001 whose heading or text has “${r[0]}”: its number only.`,
      },
    },
    checkRows: { 7: { label: 0, col: 2, rule: l08 } },
    handIn: { step: 10, cols: [2, 3], ident: [0, 1] },
    note: { 7: () => "Rule L08: search BKB-POL-001 (Policies › Policy Library) for each item's key word. Found: type the number of the section it is in. Not found: Gap." },
  },
  // Sheet 2: the leadership evidence list, copied from Learn › Reference pages › Ref-Leadership, row for row.
  "T4.1 LI-POL-L": {
    code: "LI-POL Leadership",
    title: "LI-POL · Leadership evidence, clause 5.1 (template T-LI-POL)",
    on: [8, 10],
    cols: [{ h: "Leadership evidence item (5.1)", wrap: true, w: 280 }, { h: "Where it is stored", wrap: true, w: 300 }],
    rows: Array.from({ length: 5 }, () => ["", ""]),
    mine: () => true,
    steps: { 8: [0, 1] },
    ident: [],
    cells: {
      0: {
        fix: (v, _r, d, ri) => { const want = leadership(d)[ri]?.[0]; return want && same(v, want) ? want : null; },
        hint: (_r, _d, ri) => `Row ${ri + 1} takes ${ordinal(ri)} item of Ref-Leadership, as written there.`,
      },
      1: {
        fix: (v, _r, d, ri) => { const want = leadership(d)[ri]?.[1]; return want && same(v, want) ? want : null; },
        hint: (_r, _d, ri) => `Copy where ${ordinal(ri)} item of Ref-Leadership is stored, as written there.`,
      },
    },
    handIn: { step: 10, cols: [0, 1] },
    note: { 8: () => "Learn › Reference pages › Ref-Leadership lists five items that show top management's commitment (clause 5.1), and where each is stored. Copy them in its order, one row each, as written." },
    reads: { 8: ["learn|Reference pages"] },
  },
  // Sheet 3: the RACI. Rule L09 copies it "from the Charter table for the 10 ISMS processes (rule L04)"; L04 names
  // that table Ref-ISMS processes, whose "Owner (Accountable)" column gives each process's A. Charter Section 16 lists the
  // Group's 16 core GRC processes, not these ten, and no source gives their R, C and I (Content Corrections item 57).
  "T4.1 LI-POL-R": {
    code: "LI-POL RACI",
    title: "LI-POL · RACI of the 10 ISMS processes (template T-LI-POL)",
    on: [9, 10],
    cols: [{ h: "ISMS process", wrap: true }, { h: "Accountable (A)", wrap: true, opts: (d) => raciRoles(d) }],
    rows: ["Risk assessment and treatment", "Statement of Applicability", "Document control", "Competence and training", "Awareness and communication", "Incident management and breach notification", "Supplier and third-party risk", "Internal audit", "Management review", "Nonconformity and corrective action"].map((x) => [x, ""]),
    mine: () => true,
    steps: { 9: [1] },
    ident: [0],
    checkRows: { 9: { label: 0, col: 1, rule: raciA } },
    then: { 9: "Record the Accountable role of each ISMS process (L09)" },
    handIn: { step: 10, cols: [1], ident: [0] },
    note: { 9: () => "Rule L09, read with L04: the Accountable role of each of the 10 ISMS processes is in Learn › Reference pages › Ref-ISMS processes, column Owner (Accountable). Choose the role it names first, without changing a letter: exactly one A per process." },
    reads: { 9: ["learn|Reference pages"] },
  },
  // T4.2 SOP-DOC, template T-SOP ("Step | Action | Responsible | Output / SLA", GRC101_Engine/p_tasks.py KR1): rule R14's
  // six fixed steps, each carrying out a line of BKB-POL-021 Section 6.1, the procedure the SOP topic names. Section 6.1's time limits,
  // its lines 5–7 and BKB-ADD-36 Section 5's two POL-021 rows are platform-written (Content Corrections item 58). Every column
  // follows from the documents on screen by the step's rule, so it is checked here.
  "T4.2": {
    code: "SOP-DOC",
    title: "SOP-DOC · Step table (template T-SOP)",
    on: [1, 2, 3, 5, 6],
    cols: [
      { h: "Step (R14)", wrap: true },
      { h: "Action (BKB-POL-021 Section 6.1)", wrap: true, w: 260, opts: () => uniq(pol021().map((r) => r[1])) },
      { h: "Time limit", wrap: true, w: 230, opts: () => uniq([...pol021().map((r) => limitOf(r[3])), ...add36().map((r) => r[3])]) },
      { h: "Responsible", wrap: true, opts: "step" },
      { h: "Output", wrap: true, opts: () => uniq(pol021().map((r) => outOf(r[3]))) },
      { h: "Escalation contact", wrap: true, w: 200 },
    ],
    rows: R14_STEPS.map((x) => [x, "", "", "", "", ""]),
    mine: () => true,
    steps: { 1: [1], 2: [2], 3: [3], 5: [4, 5] },
    ident: [0],
    // Each later step shows the action the row carries out, which its answer is read against.
    view: { 2: [1], 3: [1], 5: [1] },
    load: ["BKB-POL-021", "BKB-ADD-36"],
    // Only the exception step names an escalation contact.
    derived: { 5: { from: [4], value: (v) => (v(0).startsWith("6 ") ? null : "—") } },
    cells: {
      5: {
        fix: (v) => { const want = escalationContact(); return want && same(v, want) ? want : null; },
        hint: () => "BKB-POL-021 Section 8 names the escalation contact of the policy's procedures: copy the role as written there.",
      },
    },
    checkRows: { 1: { label: 0, col: 1, rule: sopAction }, 2: { label: 0, col: 2, rule: sopLimit }, 3: { label: 0, col: 3, rule: sopRole }, 5: { label: 0, col: 4, rule: sopOutput } },
    then: { 2: "Record each SOP step's time limit", 5: "Record what each SOP step produces" },
    handIn: { step: 6, cols: [1, 2, 3, 4, 5], ident: [0] },
    note: {
      1: () => "Rule R14 fixes the six steps every SOP has, in this order. BKB-POL-021 Section 6.1 is the procedure this SOP carries out: for each step, choose the Section 6.1 action that does what the step's name says. Section 6.1 has seven lines and the SOP six steps, so one line has no step of its own.",
      2: () => "Each SOP step takes the time limit of its Section 6.1 line (in Output / SLA, after the dash). BKB-ADD-36 Section 5 sets LearnTech's own value for two Section 6.1 outputs: where it sets one, it is the one that applies (decision T4.2-D1).",
      3: () => "The Responsible role is the one BKB-POL-021 Section 6.1 names for the line each step carries out. Each step shows the action you chose in step 1.",
      5: () => "A step's output is the record it leaves: the first part of its Section 6.1 line's Output / SLA, before the dash. The exception step also names the escalation contact, as BKB-POL-021 Section 8 writes it.",
    },
    reads: { 1: ["learn|Rule tables"] },
    extra: { 5: [["BKB-POL-021", ["6.1", "8"]]] },
  },
  // The SOP's RACI: "Copy the RACI roles from the policy RACI table", BKB-POL-021 Section 5 (Roles and responsibilities).
  "T4.2 RACI": {
    code: "SOP-DOC RACI",
    title: "SOP-DOC · RACI from the policy (template T-SOP)",
    on: [4, 6],
    cols: [{ h: "Role", wrap: true, w: 220 }, { h: "Responsibility (BKB-POL-021 Section 5)", wrap: true, w: 320, opts: () => uniq(pol021Roles().map((r) => r[1])) }],
    rows: POL021_ROLES.map((x) => [x, ""]),
    mine: () => true,
    steps: { 4: [1] },
    ident: [0],
    load: ["BKB-POL-021"],
    checkRows: { 4: { label: 0, col: 1, rule: sopResp } },
    handIn: { step: 6, cols: [1], ident: [0] },
    note: { 4: () => "BKB-POL-021 Section 5 is the policy's roles table: one row per role. For each role, choose its responsibility as Section 5 writes it." },
  },
  // T4.2's Lead Implementer extension LI-07, template T-LI-DOC: "SOP metadata block | life-cycle (create, review, approve,
  // publish, change, retain, dispose) | register: clause | documented information | document vs record | BKB location"
  // (GRC101_Engine/p_li.py). The block's and life-cycle's rules are BKB-POL-000 Section 7.1 (platform-written, item 58).
  "T4.2 LI-DOC-M": {
    code: "LI-DOC Block",
    title: "LI-DOC · Document-control block of the SOP (template T-LI-DOC)",
    on: [7, 10],
    cols: [{ h: "Field", wrap: true }, { h: "Value", wrap: true, w: 280, opts: (_d, r) => META_OPTS[r[0]] ?? [] }],
    rows: [...META.map(([f]) => [f, ""]), ["Classification (decision T4.2-D4)", ""]],
    mine: () => true,
    steps: { 7: [1] },
    // The classification is decision T4.2-D4, answered above the step: the block records its answer by itself, so
    // it is not asked twice.
    derived: { 1: { from: [], value: (v) => (v(0).startsWith("Classification") ? "Internal" : null) } },
    ident: [0],
    load: ["BKB-POL-000"],
    checkRows: { 7: { label: 0, col: 1, rule: metaValue } },
    then: { 7: "Fill the SOP's document-control block" },
    handIn: { step: 10, cols: [1], ident: [0] },
    note: { 7: () => "BKB-POL-000 Section 7.1 sets each field of the block. Where it points to Section 2 or Section 3, read the role there. The classification records your answer to the question above." },
  },
  "T4.2 LI-DOC-L": {
    code: "LI-DOC Life-cycle",
    title: "LI-DOC · Life-cycle of the SOP (template T-LI-DOC)",
    on: [8, 10],
    cols: [{ h: "Stage" }, { h: "Who", wrap: true, w: 280, opts: () => LIFE_ROLES }],
    rows: ["Create", "Review", "Approve", "Publish", "Change", "Retain", "Dispose"].map((x) => [x, ""]),
    mine: () => true,
    steps: { 8: [1] },
    ident: [0],
    load: ["BKB-POL-000"],
    checkRows: { 8: { label: 0, col: 1, rule: lifeWho } },
    handIn: { step: 10, cols: [1], ident: [0] },
    note: { 8: () => "BKB-POL-000 Section 7.1's second table names who does each stage. Where it says Policy owner, choose the role that owns BKB-POL-021: BKB-POL-000 Section 3 lists it." },
  },
  // The 14 rows of Ref-Locations (rule L10), clause and documented information given. Document or record is checked
  // against the key (T4.2-9), which Ref-Locations no longer shows; 7.5.1 b, either by the standard, is a worked row.
  "T4.2 LI-DOC-R": {
    code: "LI-DOC Register",
    title: "LI-DOC · Mandatory-documents register (template T-LI-DOC)",
    on: [9, 10],
    cols: [
      { h: "Clause" },
      { h: "Documented information", wrap: true, w: 220 },
      { h: "Document or record", wrap: true, w: 200, opts: "step" },
      { h: "BKB library location", wrap: true, w: 300, opts: (d) => uniq(locations(d).map((r) => r[2])) },
    ],
    rows: MANDATORY.map(([c, what]) => (c === "7.5.1 b" ? [c, what, "Document or record", "04_Policies — procedures and guidelines (Level 4) with document-control blocks"] : [c, what, "", ""])),
    mine: (r) => r[0] !== "7.5.1 b",
    steps: { 9: [2, 3] },
    ident: [0, 1],
    cells: {
      3: {
        fix: (v, r, d) => { const want = locations(d).find((x) => x[0] === r[0])?.[2]; return want && same(v, want) ? want : null; },
        hint: (r) => `Find clause ${r[0]} in Ref-Locations (Learn › Reference pages) and choose the location it gives.`,
      },
    },
    checkRows: { 9: { label: 0, col: 2 } },
    handIn: { step: 10, cols: [2, 3], ident: [0, 1] },
    note: { 9: () => "Decide each row by the standard's own word: Learn › Framework Quick Reference › ISO/IEC 27001 documented information. Then choose where BKB keeps it, from Learn › Reference pages › Ref-Locations, by clause. Row 7.5.1 b is a worked example: the standard leaves it to the organisation." },
    reads: { 9: ["learn|Framework Quick Reference", "learn|Reference pages"] },
  },
  // T5.1 PBC-LIST, template T-PBC ("Req. no. | Control | Evidence requested | Population / query | Period | Sample basis | Owner |
  // Due | Acceptance criteria | Status", GRC101_Engine/p_tasks.py). One request per control of dataset PBC-6, copied in by the
  // platform. BKB-POL-016 Section 6.2 says how each field is set (platform-written, Content Corrections item 60). Evidence (step 1)
  // and owner (step 4) are checked against the server's keys; the system, sample, due date and criteria by their sources.
  "T5.1": {
    code: "PBC-LIST",
    title: "PBC-LIST · Evidence request list (template T-PBC)",
    on: [1, 2, 3, 4, 7],
    cols: [
      { h: "Req. no.", auto: "PBC" },
      { h: "Control" },
      { h: "Description", wrap: true, w: 190 },
      { h: "Evidence requested", wrap: true, w: 220, opts: PBC_EVIDENCE },
      { h: "System" },
      { h: "Population / query", wrap: true, w: 170 },
      { h: "Period", wrap: true },
      { h: "Sample (R15)", wrap: true, opts: "step" },
      { h: "Owner", wrap: true, w: 220, opts: (_d, r) => [...(PBC_OWNERS[r[1]] ?? [])].sort() },
      { h: "Due (R16)", wrap: true },
      { h: "Acceptance criteria (R17)", wrap: true, w: 320 },
      { h: "Request", wrap: true, w: 340 },
    ],
    rows: PBC_CONTROLS.map(([c, d]) => ["", c, d, "", "", "", "", "", "", "", "", ""]),
    mine: () => true,
    steps: { 1: [3], 2: [4], 3: [7], 4: [8] },
    // T5.1 step 1 gave no way in: the owner, trying it, did not know what to read or what to look for (30 Oct).
    readHow: {
      1: "For each control, read its Description and ask: what record does this control leave in its system each time it runs? That record is its evidence. BKB-POL-016 Section 6.2, the table under the procedure, row Evidence requested, is the test: a policy, a report about a different activity, or a statement that the control works is not evidence of it.",
    },
    // The description names the row and stays in view when the table scrolls sideways (on a phone the evidence and
    // the owner are chosen against it); the control's ID beside it.
    ident: [2, 1],
    derived: {
      5: { from: [4], value: (v) => (v(4) ? `Every occurrence in ${v(4)}` : "") },
      6: { from: [4], value: (v) => (v(4) ? PBC_PERIOD : "") },
      // One due date for the whole list: the one the learner worked out in step 5's timeline (rule R16).
      9: { from: [], value: (_v, p) => p.grids?.[regKey("T5.1", "PBC-LIST Timeline")]?.["2,1"] ?? "" },
      // R17 is the same sentence on every request (step 6 asks only its question): the platform writes it.
      10: { from: [], value: () => R17_TEXT },
      // The evidence-request frame of Evidence › Request Evidence, "Please send ___ for ___ covering ___ by ___.", from the row.
      11: { from: [10], value: (v) => (v(10) && v(9) && v(3) ? `Please send the ${v(3).charAt(0).toLowerCase()}${v(3).slice(1)} for ${v(1)} ${v(2)}, covering ${v(6)}, by ${v(9)}.` : "") },
    },
    cells: {
      4: {
        fix: (v, r, d) => { const want = pbc6(d).find((x) => x[0] === r[1])?.[2]; return want && same(v, want) ? want : null; },
        hint: (r) => `Find ${r[1]} in dataset PBC-6 (Evidence › Audit Requests (PBC)) and copy its System as written.`,
      },
    },
    checkRows: { 1: { label: 1, col: 3 }, 3: { label: 1, col: 7, rule: pbcSample }, 4: { label: 1, col: 8 } },
    handIn: { step: 7, cols: [3, 4, 5, 6, 7, 8, 9, 10, 11], ident: [0, 1] },
    note: {
      1: () => "BKB-POL-016 Section 6.2 (Policies › Policy Library) says what a request asks for: the record the control produces each time it operates, exported from its system. Read each control's description, then choose its evidence.",
      2: () => `Copy each control's System from dataset PBC-6: open Evidence › Audit Requests (PBC) from the toolbar. Population and Period are written for you: every occurrence in that system, over the audit period ${PBC_PERIOD}.`,
      3: (d) => `Rule R15: ${(d.rules.R15?.[1] ?? "").split(". ")[0]}. Each control's frequency is in dataset PBC-6 (Evidence › Audit Requests (PBC)); Ref-Sampling is in Learn › Reference pages.`,
      4: () => "BKB-POL-016 Section 6.2: a request goes to the role Responsible (R) for the control's process in the RACI of the GRC Charter, Section 16 (Policies › Policy Library). The legend under the RACI gives each column's full role. Each row shortlists three roles.",
    },
    reads: { 3: ["learn|Reference pages"] },
  },
  // Step 5's second part: rule R16 worked out in its two calculations, from the audit period's end. The list's Due
  // column takes the learner's own due date (one date for the whole list, so it is not typed six times).
  "T5.1 PBC-T": {
    code: "PBC-LIST Timeline",
    title: "PBC-LIST · Request timeline (rule R16)",
    on: [5, 7],
    cols: [{ h: "Line", wrap: true }, { h: "Date", wrap: true }],
    rows: TIMELINE.map((x) => [x, ""]),
    mine: () => true,
    steps: { 5: [1] },
    ident: [0],
    cells: { 1: { fix: (v) => isoDate(v), hint: () => "Type a date, as 2026-01-31 or 31 January 2026." } },
    checkRows: { 5: { label: 0, col: 1, rule: pbcTimeline } },
    then: { 5: "Work out the request timeline (R16)" },
    handIn: { step: 7, cols: [1], ident: [0] },
    note: { 5: (d) => `Rule R16 (Learn › Rule tables): ${d.rules.R16?.[1] ?? ""} The audit period of your list is ${PBC_PERIOD}. Working days are Monday to Friday. The due date goes on every request of the list.` },
    reads: { 5: ["learn|Rule tables"] },
  },
  // T5.1's Lead Implementer extension LI-08, template T-LI-CERT: "Stage 1 vs Stage 2 table | 3-year cycle | certification-body
  // selection criteria | auditee briefing (do/don't)" (GRC101_Engine/p_li.py), one register per part, handed in at step 13.
  // Every value is the Ref-Certification card's (rule L11); step 9's activities and key are platform-written (item 60).
  "T5.1 LI-CERT-S": {
    code: "LI-CERT Stages",
    title: "LI-CERT · Stage 1 and Stage 2 (template T-LI-CERT)",
    on: [8, 13],
    cols: [{ h: "Line", wrap: true }, { h: "From the card", wrap: true, w: 220, opts: (d) => uniq(STAGE_LINES.map((x) => stageAt(d, x)[0])) }],
    rows: STAGE_LINES.map((x) => [x, ""]),
    mine: () => true,
    steps: { 8: [1] },
    ident: [0],
    checkRows: { 8: { label: 0, col: 1, rule: stageLine } },
    handIn: { step: 13, cols: [1], ident: [0] },
    note: { 8: () => "Learn › Reference pages › Ref-Certification card has a row for each stage: what the auditor does (before the colon), where, and the stage's output. Choose the card's words for each line." },
    reads: { 8: ["learn|Reference pages"] },
  },
  "T5.1 LI-CERT-A": {
    code: "LI-CERT Activities",
    title: "LI-CERT · Audit activities by stage (template T-LI-CERT)",
    on: [9, 13],
    cols: [{ h: "Audit activity", wrap: true, w: 200 }, { h: "Stage (L11)", opts: "step" }],
    rows: ["Check evidence that controls operated over the whole period", "Check the risk assessment method and the Statement of Applicability", "Confirm that an internal audit and a management review have been done", "Grade nonconformities as major or minor", "Interview control owners about how they run their controls", "Report areas of concern before the next stage", "Review the ISMS scope and the information security policy", "Test a sample of controls against their records"].map((x) => [x, ""]),
    mine: () => true,
    steps: { 9: [1] },
    ident: [0],
    checkRows: { 9: { label: 0, col: 1 } },
    handIn: { step: 13, cols: [1], ident: [0] },
    note: { 9: () => "Rule L11: read each activity against the Ref-Certification card's Stage 1 and Stage 2 rows (Learn › Reference pages): which stage does it belong to?" },
    reads: { 9: ["learn|Reference pages"] },
  },
  "T5.1 LI-CERT-C": {
    code: "LI-CERT Cycle",
    title: "LI-CERT · The 3-year certification cycle (template T-LI-CERT)",
    on: [13],
    cols: [{ h: "When", wrap: true }, { h: "Audit", wrap: true, w: 220 }],
    rows: CYCLE.map(([w]) => [w, ""]),
    mine: () => true,
    steps: {},
    derived: { 1: { from: [], value: (v) => CYCLE.find(([w]) => w === v(0))?.[1] ?? "" } },
    ident: [0],
    handIn: { step: 13, cols: [1], ident: [0] },
  },
  "T5.1 LI-CERT-B": {
    code: "LI-CERT Criteria",
    title: "LI-CERT · Certification-body selection criteria (template T-LI-CERT)",
    on: [13],
    cols: [{ h: "Order" }, { h: "Criterion", wrap: true, w: 220 }],
    rows: CRITERIA.map((_, i) => [String(i + 1), ""]),
    mine: () => true,
    steps: {},
    derived: { 1: { from: [], value: (v) => CRITERIA[+v(0) - 1] ?? "" } },
    ident: [0],
    handIn: { step: 13, cols: [1], ident: [0] },
  },
  "T5.1 LI-CERT-D": {
    code: "LI-CERT Briefing",
    title: "LI-CERT · Auditee briefing for control owners (template T-LI-CERT)",
    on: [12, 13],
    cols: [{ h: "Behaviour", wrap: true, w: 200 }, { h: "Do or do not", opts: ["Do", "Do not"] }],
    rows: AUDITEE.map((x) => [x, ""]),
    mine: () => true,
    steps: { 12: [1] },
    ident: [0],
    checkRows: { 12: { label: 0, col: 1, rule: auditeeRow } },
    handIn: { step: 13, cols: [1], ident: [0] },
    note: { 12: () => "The Ref-Certification card's last two rows (Learn › Reference pages) list what an auditee does, and does not do, when an auditor asks. Record each behaviour of the briefing as one or the other." },
    reads: { 12: ["learn|Reference pages"] },
  },
  // T5.2 (desk-step-builder, 29 Oct 2026). EVP-IDX, template T-EVP ("Evidence ID | File | PBC req. | Control | Date | Source
  // system | Generated by | Period covered | SHA-256 | Accept/Reject | Defect code | Note", GRC101_Engine/p_tasks.py): the
  // dataset's columns as Evidence › Evidence Library names them, then the three the steps decide. SHA-256 and Note are not
  // kept (corrections item 61). Step 2 walks rule R09 on every file; step 3 indexes each accepted file to its request.
  "T5.2": {
    code: "EVP-IDX",
    title: "EVP-IDX · Evidence index (template T-EVP)",
    on: [2, 3, 6],
    cols: [
      { h: "Item" },
      { h: "Evidence type", wrap: true, w: 170 },
      { h: "Control" },
      { h: "System", wrap: true },
      { h: "Timestamp shown", wrap: true },
      { h: "Generated by", wrap: true },
      { h: "Period covered", wrap: true },
      { h: "Query / parameters", wrap: true },
      { h: "Integrity note", wrap: true },
      { h: "Approval evidence", wrap: true },
      { h: "Content note", wrap: true },
      { h: "Legibility" },
      { h: "Accept/Reject" },
      { h: "Defect code" },
      { h: "PBC req.", opts: "step" },
    ],
    rows: EVP_REPO.map((r) => [...r, "", "", ""]),
    mine: () => true,
    steps: { 2: [12, 13], 3: [14] },
    checklist: { 2: { page: "Ref-Defect codes", col: 12, codes: 13, reads: { D1: 4, D2: 5, D3: 6, D4: 4, D5: 7, D6: 8, D7: 3, D8: 9, D9: 10, D10: 11 }, pass: "Accept", fail: "Reject" } },
    // Only accepted files are indexed (step 3 shows those); a rejected file's request is "—".
    only: { 3: (r, p) => evpCodes(p, r[0]) === "none" },
    derived: { 14: { from: [], value: (v, p) => { const c = evpCodes(p, v(0)); return c && c !== "none" ? "—" : null; } } },
    ident: [0, 1, 2],
    view: { 3: [6] },
    // Step 2 is checked on the codes: "none" is Accept, any code is Reject, so the codes carry the decision too.
    checkRows: { 2: { label: 0, col: 13 }, 3: { label: 0, col: 14, rule: evpRequest } },
    note: {
      2: () => `The audit period of your PBC list is ${PBC_PERIOD}: checks D3 and D4 compare each file with it. Rule R09: walk D1 to D10 for each file and mark every check that fails.`,
      3: () => "PBC-LIST has one request per control, PBC-01 to PBC-06: Evidence › Audit Requests (PBC) gives each control's request. Only the files accepted in step 2 are indexed, so only they are listed here.",
    },
    reads: { 3: ["evidence|Audit Requests (PBC)"] },
    handIn: { step: 6, cols: [12, 13, 14], ident: [0, 1, 2] },
  },
  // EVP-GAP, the coverage gap memo ("Controls with gaps, follow-up requests, owner, due date"): one row per PBC-LIST request.
  "T5.2 EVP-GAP": {
    code: "EVP-GAP",
    title: "EVP-GAP · Coverage gap memo",
    on: [1, 4, 5, 6],
    cols: [
      { h: "Req. no.", auto: "PBC" },
      { h: "Control" },
      { h: "Description", wrap: true, w: 170 },
      { h: "Files received", wrap: true },
      { h: "Files and step 2 decisions", wrap: true, w: 260, list: true },
      { h: "Gap (R18)", opts: "step" },
      { h: "Follow-up request (R18)", wrap: true, w: 340 },
      { h: "Owner", wrap: true, w: 180 },
    ],
    rows: PBC_CONTROLS.map(([c, d]) => ["", c, d, "", "", "", "", ""]),
    mine: () => true,
    steps: { 1: [3], 4: [5], 5: [6] },
    derived: {
      4: { from: [], value: (v, p) => EVP_REPO.filter((x) => x[2] === v(1)).map((x) => { const c = evpCodes(p, x[0]); return `${x[0]} ${c === "none" ? "Accept" : c ? "Reject" : "not decided"}`; }).join(", ") },
      6: { from: [5], quiet: true, value: (v, p) => (evpGapOf(p, v(1), v(5)) === "No gap" ? "—" : null) },
      // The owner each request went to in T5.1 (its checked answer, else the learner's own), for the controls with a gap.
      7: { from: [], value: (v, p) => (evpGapOf(p, v(1), v(5)) === "No gap" ? "—" : p.rowChecks?.["T5.1-4"]?.rows[v(1)]?.best ?? p.grids?.[regKey("T5.1", "PBC-LIST")]?.[`${PBC_CONTROLS.findIndex(([c]) => c === v(1))},8`] ?? "") },
    },
    cells: {
      3: { fix: (v) => (/^\s*\d+\s*$/.test(v) ? String(+v) : null), hint: () => "Type the number of files, as a number (for example 3)." },
      6: { fix: (v) => evpFollowFix(v), hint: () => "Write it in rule R18's words: Please send 2 more files for <control> covering <period> by <due date>. Type dates as 2026-01-31 or 31 January 2026." },
    },
    ident: [1, 2],
    view: { 4: [4], 5: [5, 7] },
    checkRows: { 1: { label: 1, col: 3, rule: evpReceived }, 4: { label: 1, col: 5, rule: evpGap }, 5: { label: 1, col: 6, rule: evpFollow } },
    note: {
      1: () => "Open Evidence › Evidence Library from the toolbar: dataset EVP-REPO lists the files the control owners sent, sorted by control. Count each control's files.",
      4: (d) => `Rule R18 (Learn › Rule tables): ${(d.rules.R18?.[1] ?? "").split(". For")[0]}. Each row lists its control's files with the decision step 2 checked.`,
      5: (d) => `Rule R18: ${(d.rules.R18?.[1] ?? "").split(". ").slice(1).join(". ")} The audit period is ${PBC_PERIOD}. BKB-POL-016 Section 6.2 says by when the missing files are due; rule R16 (Learn › Rule tables) says when fieldwork starts. Controls without a gap need no request.`,
    },
    reads: { 1: ["evidence|Evidence Library"], 5: ["learn|Rule tables"] },
    handIn: { step: 6, cols: [3, 5, 6], ident: [0, 1, 7] },
  },
  // T6.1 (desk-step-builder, 29 Oct 2026). UAR-TEST, template T-UAR: "Sheet 1 fixed test plan; Sheet 2 sample + A1–A6
  // results; Sheet 3 exceptions (ID, type code, row, severity, R20 action, owner, due)" (GRC101_Engine/p_guided.py), and
  // UAR-MEMO, the memo frame (R19), exception counts by type and the R20 actions. Sheet 1's test plan is read in step 1
  // (STUDY); its sample size is worked out in step 2 (R15); Sheet 2 is walked attribute by attribute in step 3; Sheet 3
  // lists the accounts the full-population analytics flag, decided in step 4 and typed in step 5; step 7 concludes (R19).
  "T6.1": {
    code: "UAR-TEST Sheet 1",
    title: "UAR-TEST · Sheet 1 · Test plan (fixed)",
    on: [1],
    // Narrow least widths: on a phone the three columns fit the screen, so a row is read without scrolling sideways.
    cols: [{ h: "Attribute", wrap: true, w: 96 }, { h: "Passes when", wrap: true, w: 150 }, { h: "Read from", wrap: true, w: 100 }],
    rows: UAR_PLAN.map(([c, n, t, f]) => [`${c} ${n}`, t, f]),
    mine: () => false,
    steps: {},
    // The attribute names the row and stays in view when the table scrolls sideways (a phone).
    ident: [0],
  },
  "T6.1 SAMP": {
    code: "UAR-TEST Sampling",
    title: "UAR-TEST · Sheet 1 · Sample size (R15)",
    on: [2, 8],
    cols: [
      { h: "Line", wrap: true, w: 170 },
      { h: "Value", wrap: true, w: 230, opts: (d, r) => (r[0] === SAMP_LINES[1] ? ((d.pages["Ref-Sampling"]?.r ?? []) as string[][]).map((x) => String(x[0])) : r[0] === SAMP_LINES[2] ? uniq(((d.pages["Ref-Sampling"]?.r ?? []) as string[][]).map((x) => String(x[2]))).sort((a, b) => +a - +b) : undefined) },
    ],
    rows: [...SAMP_LINES, "Sample selected"].map((x) => [x, ""]),
    mine: () => true,
    steps: { 2: [1] },
    // The sample the platform draws shows once the answers are checked (R15: "the platform records the seed").
    only: { 2: (r, p) => r[0] !== "Sample selected" || !!p.rowChecks?.["T6.1-2"] },
    derived: { 1: { from: [], value: (v, p) => (v(0) === "Sample selected" ? (p.rowChecks?.["T6.1-2"] ? `${UAR_SAMPLE.length} accounts by systematic selection: every 8th of the ${UAR_X.length}, from account 7 (seed ${UAR.seed}). Listed in Sheet 2.` : "") : null) } },
    cells: { 1: { fix: (v, r) => (r[0] !== SAMP_LINES[0] ? v : /^\s*\d+\s*$/.test(v) ? String(+v) : null), hint: () => "Type the number of accounts, as a number (for example 120)." } },
    ident: [0],
    checkRows: { 2: { label: 0, col: 1, rule: uarSampling } },
    note: { 2: (d) => `Rule R15 (Learn › Rule tables): ${(d.rules.R15?.[1] ?? "").split(". ")[0]}. A user access review is tested on its decisions, one per account, so what you sample is accounts. The review's facts are on Access Reviews › Start Review; Ref-Sampling is in Learn › Reference pages.` },
    reads: { 2: ["access|Start Review", "learn|Reference pages"] },
    handIn: { step: 8, cols: [1], ident: [0] },
  },
  "T6.1 S2": {
    code: "UAR-TEST Sheet 2",
    title: "UAR-TEST · Sheet 2 · Sample and A1–A6 results",
    on: [3, 8],
    cols: [
      { h: "User ID" }, { h: "Name", wrap: true }, { h: "Role / entitlement", wrap: true }, { h: "Privileged" }, { h: "Approval ticket" }, { h: "Last login" },
      { h: "Review decision", wrap: true }, { h: "Reviewer", wrap: true }, { h: "Revocation executed", wrap: true }, { h: "HR status" }, { h: "Termination date", wrap: true },
      { h: "Role change date", wrap: true }, { h: "Result (A1–A6)", wrap: true }, { h: "Attributes failed", wrap: true },
    ],
    rows: UAR_SAMPLE.map((j) => { const x = UAR_X[j], h = hrOf(x[0]); return [x[0], x[1], x[4], x[5], x[9], x[8], x[10], x[11], x[13], h[2], h[3], h[4], "", ""]; }),
    mine: () => true,
    steps: { 3: [12, 13] },
    checklist: { 3: { page: "Ref-UAR test plan", col: 12, codes: 13, reads: { A1: 4, A2: [1, 9, 5, 6], A3: 2, A4: [1, 7], A5: [6, 8], A6: [9, 10, 11] }, pass: "Pass", fail: "Fail" } },
    checkRows: { 3: { label: 0, col: 13 } },
    note: {
      3: (d) => { const sod = ((d.ds["SOD-MATRIX"]?.r ?? []) as string[][])[0] ?? ["", ""]; return `The review date is ${UAR_REVIEW}: A2 counts 90 days back from it, A5 5 working days on. The SoD matrix's toxic combination: ${sod[0]} (${sod[1].toLowerCase()}). HR status and its two dates are looked up from the HR roster by User ID. The platform drew these ${UAR_SAMPLE.length} accounts: every 8th of the ${UAR_X.length}, from account 7 (seed ${UAR.seed}).`; },
    },
    handIn: { step: 8, cols: [12, 13], ident: [0, 1] },
  },
  "T6.1 S3": {
    code: "UAR-TEST Sheet 3",
    title: "UAR-TEST · Sheet 3 · Exceptions",
    on: [4, 5, 8],
    cols: [
      // Listed by and Name read as lines under the row on a phone (`list`), so the row is read without scrolling sideways.
      { h: "User ID" }, { h: "Listed by", wrap: true, w: 190, list: true }, { h: "Name", wrap: true, list: true }, { h: "Role / entitlement", wrap: true }, { h: "Privileged" }, { h: "Approval ticket" },
      { h: "Last login" }, { h: "Review decision", wrap: true }, { h: "Reviewer", wrap: true }, { h: "Revocation executed", wrap: true }, { h: "HR status" },
      { h: "Termination date", wrap: true }, { h: "Role change date", wrap: true }, { h: "Exception?", opts: ["Exception", "Not an exception"] },
      { h: "Type (U1–U10)", opts: U_CODES.map(([c]) => c) }, { h: "Severity" }, { h: "Action (R20)", wrap: true, w: 240 }, { h: "Owner", wrap: true }, { h: "Due", wrap: true },
    ],
    rows: UAR_LISTED.map(([id, by]) => { const x = uarRow(id), h = hrOf(id); return [id, by, x[1], x[4], x[5], x[9], x[8], x[10], x[11], x[13], h[2], h[3], h[4], "", "", "", "", "", ""]; }),
    mine: () => true,
    steps: { 4: [13], 5: [14] },
    // Only the exceptions are typed (step 5): an account step 4 found to be no exception is "—" from then on.
    only: { 5: (r, p) => uarExc(p, r[0]) === "Exception" },
    derived: {
      14: { from: [], value: (v, p) => (uarExc(p, v(0)) === "Not an exception" ? "—" : null) },
      // Copied from Ref-UAR codes by the type (step 5); the R20 action, owner and due date once step 6 is answered.
      15: { from: [14], value: (v) => (v(14) === "—" ? "—" : uCode(v(14))?.[2] ?? "") },
      16: { from: [14], quiet: true, value: (v) => (v(14) === "—" ? "—" : uCode(v(14))?.[3] ?? "") },
      17: { from: [14], quiet: true, value: (v) => (v(14) === "—" ? "—" : uCode(v(14))?.[4] ?? "") },
      18: { from: [14], quiet: true, value: (v) => (v(14) === "—" ? "—" : uCode(v(14))?.[5] ?? "") },
    },
    ident: [0],
    view: { 4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 5: [1, 2] },
    checkRows: { 4: { label: 0, col: 13 }, 5: { label: 0, col: 14 } },
    note: {
      4: () => `The platform ran the analytics on all ${UAR_X.length} accounts of the review of ${UAR_REVIEW} and listed these ${UAR_LISTED.length}. A listed account is a lead, not yet an exception: it is an exception only if it fails an attribute of the test plan (Learn › Reference pages › Ref-UAR test plan).`,
      5: () => "Ref-UAR codes (Learn › Reference pages) names each exception type. Choose the type of each exception; its severity is copied from the same page. Access Reviews › Start Review says which break-glass accounts are registered for this system.",
    },
    reads: { 4: ["learn|Reference pages"], 5: ["learn|Reference pages", "access|Start Review"] },
    handIn: { step: 8, cols: [13, 14, 15, 16, 17, 18], ident: [0, 1] },
  },
  "T6.1 CONC": {
    code: "UAR-MEMO Conclusion",
    title: "UAR-MEMO · Test memo · Conclusion (R19)",
    on: [7, 8],
    cols: [
      { h: "Line", wrap: true, w: 200 },
      { h: "Your answer", wrap: true, w: 220, opts: (_d, r) => (r[0] === UAR_CONC[1] ? ["High", "Medium", "Low"] : r[0] === UAR_CONC[2] ? UAR_SHARE : r[0] === UAR_CONC[3] ? ["Effective", "Effective with exceptions", "Not effective"] : undefined) },
    ],
    rows: UAR_CONC.map((x) => [x, ""]),
    mine: () => true,
    steps: { 7: [1] },
    cells: { 1: { fix: (v, r) => (r[0] !== UAR_CONC[0] ? v : /^\s*\d+\s*$/.test(v) ? String(+v) : null), hint: () => "Type the number of exceptions, as a number (for example 3)." } },
    ident: [0],
    checkRows: { 7: { label: 0, col: 1 } },
    note: {
      7: (d, p) => {
        const ex = UAR_LISTED.filter(([id]) => uarExc(p, id) === "Exception").map(([id]) => { const t = uarType(p, id); return `${id} ${t} (${uCode(t)?.[2] ?? "?"})`; });
        return `Rule R19 (Learn › Rule tables): ${d.rules.R19?.[1] ?? ""} Sheet 3's exceptions, as steps 4 and 5 checked them: ${ex.join("; ") || "none yet"}. The population is the ${UAR_X.length} accounts of the review.`;
      },
    },
    reads: { 7: ["learn|Rule tables"] },
    handIn: { step: 8, cols: [1], ident: [0] },
  },
  // The memo's three parts, written by the platform from the checked answers: the R19 frame, the counts by type, and the
  // R20 actions (step 6's part 2, the same copy from Ref-Actions for every exception of a type).
  "T6.1 MEMO": {
    code: "UAR-MEMO",
    title: "UAR-MEMO · Test memo",
    on: [8],
    cols: [{ h: "Part", wrap: true, w: 150 }, { h: "Text", wrap: true, w: 460 }],
    rows: ["Conclusion (memo frame, R19)", "Exceptions by type", "Actions (R20)"].map((x) => [x, ""]),
    mine: () => true,
    steps: {},
    derived: {
      1: {
        from: [],
        value: (v, p) => {
          const types = UAR_LISTED.filter(([id]) => uarExc(p, id) === "Exception").map(([id]) => uarType(p, id)).filter(Boolean);
          const by = U_CODES.filter(([c]) => types.includes(c)).map(([c, , sev, act, own, due]) => ({ c, n: types.filter((t) => t === c).length, sev, act, own, due }));
          if (v(0).startsWith("Conclusion")) return uarConc(p, 3) ? `The control “User access review of Mitratech TeamConnect” is ${uarConc(p, 3).toLowerCase()} (rule R19). We found ${uarConc(p, 0)} exceptions in ${UAR_X.length} items tested.` : "";
          if (v(0).startsWith("Exceptions")) return by.map((x) => `${x.c} × ${x.n} (${x.sev})`).join("; ");
          return by.map((x) => `${x.c}: ${x.act} — ${x.own}, ${x.due}`).join(". ");
        },
      },
    },
    ident: [0],
    handIn: { step: 8, cols: [1], ident: [0] },
  },
  // T6.2 (desk-step-builder, 29 Oct 2026). LVR-REC, template T-LVR ("leaver × system rows; UTC times; hours; SLA met
  // (R21); action (R20)"), as a workbook of two sheets: Sheet 1, one row per system log (its time zone, step 1; the leavers
  // it has no line for, step 2); Sheet 2, one row per leaver of HR's file with a column per system (SLA, step 3; the
  // systems disabled late, step 4; the R20 action once step 5 is answered). LVR-KPI is the KPI statement (step 6), handed
  // in with them. Listed first: step 6 works on it, and a step's register is the first that names it.
  "T6.2 KPI": {
    code: "LVR-KPI",
    title: "LVR-KPI · KPI statement (R21)",
    on: [6],
    cols: [{ h: "Line", wrap: true, w: 200 }, { h: "Your answer", wrap: true, w: 200, opts: (_d, r) => (r[0] === LVR_KPI[3] ? ["Yes", "No"] : undefined) }],
    rows: LVR_KPI.map((x) => [x, ""]),
    mine: () => true,
    steps: { 6: [1] },
    cells: {
      1: {
        fix: (v, r) => {
          if (r[0] === LVR_KPI[3]) return v;
          const t = v.trim().replace(/\s*%$/, "").replace(",", ".");
          if (r[0] === LVR_KPI[2]) return /^\d{1,3}(\.\d+)?$/.test(t) ? (+t).toFixed(1) : null;
          return /^\d+$/.test(t) ? String(+t) : null;
        },
        hint: (r) => (r[0] === LVR_KPI[2] ? "Type the percentage with one decimal, for example 75.0." : "Type a number of leavers, for example 12."),
      },
    },
    ident: [0],
    checkRows: { 6: { label: 0, col: 1 } },
    note: { 6: (d) => `Rule R21 (Learn › Rule tables): ${(d.rules.R21?.[1] ?? "").split(". ").slice(-1)[0]} LVR-REC Sheet 2, below, says for each leaver whether every account was disabled within the SLA, as steps 2 to 4 checked it. BKB-POL-006 Section 10 (Policies › Policy Library) sets the target.` },
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T6.2 LOGS": {
    code: "LVR-REC Sheet 1",
    title: "LVR-REC · Sheet 1 · System logs",
    on: [1, 2],
    cols: [{ h: "System", wrap: true, w: 150 }, { h: "Time in the log → UTC", wrap: true, w: 150, opts: LVR_TZ }, { h: "Leavers with no disable line", wrap: true, w: 170 }],
    rows: LVR_SYS.map((x) => [x, "", ""]),
    mine: () => true,
    steps: { 1: [1], 2: [2] },
    cells: { 2: { fix: (v) => lvrIds(v), hint: () => "Type Employee IDs as Sheet 2 writes them (E0001), separated by ;, or none." } },
    ident: [0],
    checkRows: { 1: { label: 0, col: 1 }, 2: { label: 0, col: 2 } },
    note: {
      1: () => "The five systems' disable logs are on Access Reviews › Terminated User Check, one line per account disabled. Each time ends with the zone its system writes: UTC, or CEST, Central European Summer Time (Amsterdam in summer), which is two hours ahead of UTC. HR's termination times are in UTC, so every disable time must be in UTC too before the two are compared.",
      2: () => `HR's leaver file lists ${LVR_LEAVERS.length} leavers, ${LVR_LEAVERS[0][0]} to ${LVR_LEAVERS[LVR_LEAVERS.length - 1][0]} (LVR-REC Sheet 2). Each log on Access Reviews › Terminated User Check is sorted by Employee ID. A leaver with no line in a system's log was never disabled there: the account is still active. For each system, type the Employee IDs it has no line for, separated by ;, or none.`,
    },
    handIn: { step: 6, cols: [1, 2], ident: [0] },
  },
  "T6.2": {
    code: "LVR-REC Sheet 2",
    title: "LVR-REC · Sheet 2 · Reconciliation by leaver",
    on: [3, 4],
    cols: [
      { h: "Employee ID" }, { h: "Leaver type" }, { h: "Termination (UTC)", wrap: true }, { h: "SLA (R21)", opts: "step" },
      ...LVR_SYS.map((x) => ({ h: x, wrap: true, w: 170 })),
      { h: "Timeliness (R21)", wrap: true }, { h: "Disabled late in", wrap: true, w: 190 }, { h: "Fully disabled within SLA", wrap: true }, { h: "Action (R20)", wrap: true, w: 260 },
    ],
    rows: LVR_LEAVERS.map(([id, type, term]) => [id, type, term, "", ...LVR_SYS.map(() => ""), "", "", "", ""]),
    mine: () => true,
    steps: { 3: [3], 4: [9, 10] },
    derived: {
      // Written once steps 1 and 2 are checked: the log's time in UTC and the time after termination (the template's
      // "hours"); a system with no line for the leaver, "Still active".
      ...Object.fromEntries(LVR_SYS.map((x, i) => [4 + i, { from: [], quiet: true, value: (v: (ci: number) => string, p: Progress) => (lvrMatched(p) ? lvrCell(v(0), x) : "") }])),
      11: {
        from: [10],
        value: (v, p) => {
          const late = lvrLate(p, v(0), v(10));
          if (!late || !lvrMatched(p)) return "";
          return late === "none" && LVR_SYS.every((x) => lvrLine(v(0), x)) ? "Yes" : "No";
        },
      },
      // Rule R20, once step 5's question is answered: Ref-Actions U1 for an account still active. A late disable is already
      // closed and has no code in Ref-Actions (Content Corrections item 63).
      12: {
        from: [],
        quiet: true,
        value: (v, p) => {
          if (!(p.acks?.["T6.2-5"] ?? []).includes("checked") || !lvrMatched(p)) return "";
          const active = LVR_SYS.filter((x) => !lvrLine(v(0), x));
          if (active.length) return `U1 (${active.join(", ")}): ${U_CODES[0][3]}. ${U_CODES[0][4]}, ${U_CODES[0][5]}.`;
          const late = lvrLate(p, v(0), v(10));
          return late && late !== "none" ? "No R20 action: every account is disabled. The late disable is counted in LVR-KPI." : "—";
        },
      },
    },
    ident: [0],
    view: { 3: [1], 4: [3] },
    checklist: {
      4: {
        page: "",
        checks: () => LVR_SYS.map((x) => [x, ""]),
        col: 9,
        codes: 10,
        reads: Object.fromEntries(LVR_SYS.map((x, i) => [x, 4 + i])),
        pass: "In time",
        fail: "Late",
        mark: "Late",
        head: [0, 1, 3],
        line: "For each leaver, read each system's disable time against the leaver's SLA and mark every one disabled late.",
      },
    },
    checkRows: { 3: { label: 0, col: 3 }, 4: { label: 0, col: 10 } },
    note: {
      3: () => "Rule R21 (Learn › Rule tables) sets each leaver's SLA from the leaver type HR recorded.",
      4: () => "The disable times are in UTC, converted with your step 1 answers, and the time after termination is worked out for you. A system shown Still active was found in step 2: mark only the systems disabled after the leaver's SLA.",
    },
    reads: { 3: ["learn|Rule tables"] },
    handIn: { step: 6, cols: [3, 4, 5, 6, 7, 8, 10, 11, 12], ident: [0, 1, 2] },
  },
  // T7.1 (desk-step-builder, 29 Oct 2026). RR-UPD is the office register (the pack's 25 rows, worked, and the three new rows)
  // with its change log, filled through two working sheets (the R06 drafts, the R07 ratings); RR-NOTE goes with it. LI-CHAIN
  // (LI-03) and LI-RTP (LI-09) follow. Listed in step order: a step's register is the first that names it.
  "T7.1 EVENTS": {
    code: "RRU-EVENTS",
    title: "RRU-EVENTS · New-risk and change events",
    on: [1],
    cols: [
      { h: "Event" }, { h: "Type" }, { h: "Description", wrap: true, w: 200 }, { h: "Category", wrap: true, w: 150 }, { h: "Facts", wrap: true, w: 260 },
      { h: "Asset", wrap: true, w: 140 }, { h: "How often", wrap: true, w: 200 }, { h: "Impact if it happens", wrap: true, w: 200 },
      { h: "Existing controls", wrap: true, w: 240 }, { h: "Applies to", wrap: true },
    ],
    rows: [
      ...RRU_NEW.map((n) => [n.ev, "New risk", n.desc, n.cat, n.facts, n.asset, n.often, n.impact, n.controls, "—"]),
      ...RRU_CHG.map((c) => [c.ev, "Change", c.desc, "—", c.facts, "—", "—", "—", "—", c.row]),
    ],
    mine: () => false,
    steps: {},
    ident: [0],
  },
  "T7.1 STMT": {
    code: "RR-UPD Statements",
    title: "RR-UPD · Working sheet · Risk statements (R06)",
    on: [2],
    cols: [{ h: "Event" }, { h: "Draft 1", wrap: true, w: 240, prose: "always" }, { h: "Draft 2", wrap: true, w: 240, prose: "always" }, { h: "Draft 3", wrap: true, w: 240, prose: "always" }, { h: "Best draft (R06)", wrap: true, opts: "step" }],
    rows: RRU_NEW.map((n) => [n.ev, ...n.drafts, ""]),
    mine: () => true,
    steps: { 2: [4] },
    ident: [0],
    view: { 2: [1, 2, 3] },
    checkRows: { 2: { label: 0, col: 4 } },
    note: { 2: (d) => `Rule R06 (Learn › Rule tables): ${d.rules.R06?.[1] ?? ""} Each event's facts and asset are in RRU-EVENTS, on Risk Register › New Risk.` },
    reads: { 2: ["risk|New Risk", "learn|Rule tables"] },
  },
  "T7.1 RATE": {
    code: "RR-UPD Ratings",
    title: "RR-UPD · Working sheet · Ratings (R07)",
    on: [3],
    cols: [{ h: "Line", wrap: true, w: 170 }, { h: "Fact", wrap: true, w: 320, prose: true }, { h: "Score (R07)", wrap: true, opts: "step" }],
    rows: RRU_NEW.flatMap((n) => [[`${n.ev} · Likelihood (inherent)`, n.often, ""], [`${n.ev} · Impact (inherent)`, n.impact, ""], [`${n.ev} · Likelihood (residual)`, `Existing controls: ${n.controls}.`, ""]]),
    mine: () => true,
    steps: { 3: [2] },
    ident: [0],
    view: { 3: [1] },
    checkRows: { 3: { label: 0, col: 2 } },
    note: { 3: (d) => `Rule R07 (Learn › Rule tables): ${(d.rules.R07?.[1] ?? "").split(" Score = ")[0]} The scales are BKB-ERM-001 Section 6.2 (likelihood) and Section 6.3 (impact), in Policies › Policy Library. Once checked, the platform works out each score and rating in RR-UPD.` },
    reads: { 3: ["learn|Rule tables"] },
  },
  "T7.1": {
    code: "RR-UPD",
    title: "RR-UPD · Office risk register (Manila, Philippines)",
    on: [4, 5, 6, 9],
    cols: [
      { h: "Risk ID" }, { h: "Category", wrap: true, w: 150, prose: true }, { h: "Risk title", wrap: true, w: 200, prose: true }, { h: "Risk statement (R06)", wrap: true, w: 280 },
      { h: "Likelihood (inherent)", wrap: true }, { h: "Impact (inherent)", wrap: true }, { h: "Inherent score", wrap: true }, { h: "Inherent rating", wrap: true },
      { h: "Existing controls", wrap: true, w: 240 }, { h: "Likelihood (residual)", wrap: true }, { h: "Impact (residual)", wrap: true }, { h: "Residual score", wrap: true },
      { h: "Residual rating", wrap: true }, { h: "Decision and due (R08)", wrap: true, w: 180, opts: RRU_DEC }, { h: "Risk owner", wrap: true, w: 160 },
      { h: "Acceptance authority (R36)", wrap: true, w: 170, opts: "step" }, { h: "KRI", wrap: true, w: 220 },
      { h: "ISO/IEC 27001:2022 controls", wrap: true, w: 180, opts: (d) => ((d.pages["Ref-Keywords"]?.r ?? []) as string[][]).map((r) => String(r[2])) },
      { h: "Treatment plan", wrap: true, w: 260 },
    ],
    // The pack's rows, worked. R-16-HQ-21's residual cells and R-16-HQ-12's treatment plan are written from them, so the
    // change events of step 7 show in the register once applied.
    rows: [
      ...RRU_REG.map((r) => r.map((x, ci) => ((r[0] === "R-16-HQ-21" && [9, 11, 12, 15].includes(ci)) || (r[0] === "R-16-HQ-12" && ci === 18) ? "" : x))),
      ...RRU_NEW.map((n) => [n.id, n.cat, n.title, "", "", "", "", "", n.controls, "", "", "", "", "", "", "", "", "", ""]),
    ],
    mine: (r) => !!rruNew(r[0]),
    worked: "The grey rows are the register's existing risks: the rules decide your rows, not the values in theirs.",
    steps: { 4: [15], 5: [17], 6: [13] },
    derived: Object.fromEntries([3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 18].map((ci) => [ci, {
      from: [], quiet: true,
      value: (v: (c: number) => string, p: Progress) => {
        const id = v(0), base = RRU_REG.find((r) => r[0] === id);
        if (id === "R-16-HQ-21" && base) { const k = ({ 9: ["1", "2"], 11: ["3", "6"], 12: ["Low", "Medium"], 15: ["Risk owner", "Org CRCO"] } as Record<number, string[]>)[ci]; return k ? k[rruC1(p) ? 1 : 0] : null; }
        if (id === "R-16-HQ-12" && base && ci === 18) return base[18] + (rruC1(p) ? " Status: overdue, 50 % complete on 2026-10-31 (C2)." : "");
        const n = rruNew(id);
        if (!n || ci === 15) return null;
        if (ci === 3) { const b = rruBest(p, 2, n.ev); return b ? n.drafts[+b.slice(-1) - 1] : ""; }
        if (ci === 14) return n.owner;
        if (ci === 16) return n.kri;
        if (ci === 18) return rruBest(p, 15, n.id);
        const x = rruScores(p, n.ev);
        if (!x) return "";
        return String(({ 4: x.L, 5: x.I, 6: x.s, 7: rruRating(x.s), 9: x.Lr, 10: x.I, 11: x.rs, 12: rruRating(x.rs) } as Record<number, string | number>)[ci]);
      },
    }])),
    ident: [0],
    view: { 4: [2, 11, 12], 5: [1, 2], 6: [2, 11, 12] },
    checkRows: { 4: { label: 0, col: 15 }, 5: { label: 0, col: 17 }, 6: { label: 0, col: 13 } },
    note: {
      4: (d) => `Rule R36 (Learn › Rule tables): ${d.rules.R36?.[1] ?? ""} Your three rows' residual ratings are worked out from step 3.`,
      5: () => "Ref-Keywords (Learn › Reference pages) gives, for each group of key words, the BKB policy and the Annex A controls. Find the row whose key words the risk's category uses.",
      6: (d) => `Rule R08 (Learn › Rule tables): ${d.rules.R08?.[1] ?? ""}`,
    },
    reads: { 4: ["learn|Rule tables"], 5: ["learn|Reference pages"], 6: ["learn|Rule tables"] },
    handIn: { step: 9, cols: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17], ident: [0, 2] },
  },
  "T7.1 LOG": {
    code: "RR-UPD Change log",
    title: "RR-UPD · Change log (R22)",
    on: [7],
    cols: [
      { h: "Event" }, { h: "Row ID" }, { h: "What the event says", wrap: true, w: 300, prose: true },
      { h: "Change (R22)", wrap: true, w: 250, opts: (_d, r) => RRU_C[r[0]] }, { h: "Field", wrap: true }, { h: "Old value", wrap: true }, { h: "New value", wrap: true, w: 160 }, { h: "Evidence", wrap: true, w: 160 },
    ],
    rows: [
      ["C1", "R-16-HQ-21", RRU_CHG[0].facts, "", "", "", "", ""],
      ...Object.keys(C1_FOLLOW).map((f) => ["C1", "R-16-HQ-21", "", "Follows from C1's change", f, "", "", ""]),
      ["C2", "R-16-HQ-12", RRU_CHG[1].facts, "", "", "", "", ""],
    ],
    mine: () => true,
    steps: { 7: [3] },
    only: { 7: (r) => !!r[2] },
    derived: Object.fromEntries([4, 5, 6, 7].map((ci) => [ci, {
      from: [3], quiet: true,
      value: (v: (c: number) => string, p: Progress) => {
        if (!rruC1(p)) return "";
        // A row that follows from C1 has no facts of its own (and its Field given): never read v(4) on a decided row.
        const follow = v(2) ? undefined : C1_FOLLOW[v(4)];
        if (follow) return ci === 5 ? follow[0] : ci === 6 ? follow[1] : ci === 7 ? "Rules R07 and R36, from C1's change" : null;
        const c = rruChange(rruBest(p, 7, v(0)));
        return !c ? "" : ci === 4 ? c.field : ci === 5 ? c.old : ci === 6 ? c.new : RRU_CHG.find((x) => x.ev === v(0))?.evidence ?? "";
      },
    }])),
    ident: [0, 1],
    view: { 7: [2] },
    checkRows: { 7: { label: 0, col: 3 } },
    then: { 7: "Apply C1 and C2 (change log, R22)" },
    note: { 7: (d) => `Rule R22 (Learn › Rule tables): ${d.rules.R22?.[1] ?? ""} Rule R07 says what a control's state changes. Each row's current values are on Risk Register › Score Risk. Choose the change each event makes; once checked, the platform writes its fields, and the rows that follow from it.` },
    reads: { 7: ["risk|Score Risk", "learn|Rule tables"] },
    handIn: { step: 9, cols: [3, 4, 5, 6, 7], ident: [0, 1] },
  },
  "T7.1 NOTE": {
    code: "RR-NOTE",
    title: "RR-NOTE · Register note to the Regional Managing Director",
    on: [8],
    cols: [{ h: "Part", wrap: true, w: 190 }, { h: "Content", wrap: true, w: 380 }],
    rows: NOTE_LINES.map((x) => [x, ""]),
    mine: () => true,
    steps: { 8: [1] },
    derived: {
      1: {
        from: [], quiet: true,
        value: (v, p) => {
          const at = NOTE_LINES.indexOf(v(0));
          if (at === 0) return `${RRU_NEW.map((n) => n.id).join(", ")} (events N1 to N3)`;
          if (at === 1) return rruC1(p) ? "R-16-HQ-21 (C1): residual likelihood 1 → 2, so residual 6 (Medium) and acceptance by the Org CRCO. R-16-HQ-12 (C2): treatment action overdue, 50 % complete; ratings unchanged." : "";
          if (at === 4) {
            if (!p.rowChecks?.["T7.1-8"]) return "Written once your two lists are checked.";
            return rruBest(p, 8, NOTE_LINES[2]).split("; ").map((id) => {
              const n = rruNew(id), x = n && rruScores(p, n.ev), base = RRU_REG.find((r) => r[0] === id);
              const s = x ? x.rs : +(base?.[11] ?? 0), r = rruRating(s);
              return `${id} (residual ${s}, ${r}): ${r === "Critical" ? "not acceptable; treat within 30 days" : `treat within ${r === "High" ? 90 : 180} days, or acceptance by the ${R36_OPTS[r === "High" ? 2 : 1]}`}`;
            }).join(". ") + ".";
          }
          return null;
        },
      },
    },
    cells: { 1: { fix: (v) => rruIds(v), hint: () => "Type Risk IDs as the register writes them (R-16-HQ-02), separated by ;, or none." } },
    ident: [0],
    checkRows: { 8: { label: 0, col: 1 } },
    then: { 8: "Complete RR-NOTE" },
    note: {
      8: (d, p) => {
        const mine = RRU_NEW.map((n) => { const x = rruScores(p, n.ev); return x ? `${n.id} ${x.rs} (${rruRating(x.rs)}), ${rruBest(p, 4, n.id)}` : n.id; }).join("; ");
        return `Your three rows after steps 2 to 6, with residual score, rating and acceptance authority: ${mine}. After C1, R-16-HQ-21 is 6 (Medium) and the change log gives it the Org CRCO. The register's other 24 rows, with their residual score, rating and acceptance authority, are on Risk Register › Score Risk. Rule R36 (Learn › Rule tables): ${d.rules.R36?.[1] ?? ""}`;
      },
    },
    reads: { 8: ["risk|Score Risk", "learn|Rule tables"] },
    handIn: { step: 9, cols: [1], ident: [0] },
  },
  "T7.1 CHAIN": {
    code: "LI-CHAIN",
    title: "LI-CHAIN · Asset–threat–control chains (template T-LI-CHAIN)",
    on: [10, 11, 12, 13, 14],
    cols: [
      { h: "Asset", wrap: true, w: 150 }, { h: "From the asset register", wrap: true, w: 240, prose: true }, { h: "New risk" },
      { h: "Asset type (Ref-Chain)", wrap: true, w: 210, opts: (d) => ((d.pages["Ref-Chain"]?.r ?? []) as string[][]).map((r) => String(r[0])) },
      { h: "Information or supporting", wrap: true }, { h: "Threat", wrap: true, w: 180 }, { h: "Vulnerability", wrap: true, w: 180 }, { h: "Impact (C/I/A)", wrap: true, w: 160 },
      { h: "Residual score (RR-UPD)", wrap: true }, { h: "Treatment option (L12)", wrap: true, opts: "step" }, { h: "Annex A control", wrap: true, w: 180 },
      { h: "Control type", wrap: true, w: 150, opts: (d) => uniq(attrs27002(d).map((r) => r[3])) },
      { h: "Security property", wrap: true, w: 120, opts: (d) => uniq(attrs27002(d).map((r) => r[4])) },
      { h: "Cybersecurity concept", wrap: true, w: 170, opts: (d) => uniq(attrs27002(d).map((r) => r[5])) },
    ],
    rows: RRU_CHAIN.map((c) => [c.asset, c.line, c.risk, "", "", "", "", "", "", "", "", "", "", ""]),
    mine: () => true,
    steps: { 10: [3], 11: [9], 12: [10], 13: [11, 12, 13] },
    derived: {
      ...Object.fromEntries([4, 5, 6, 7].map((ci) => [ci, { from: [], quiet: true, value: (v: (c: number) => string, p: Progress) => { const c = RRU_CHAIN.find((x) => x.asset === v(0)); return c && rruBest(p, 10, c.asset) ? c.ref[ci - 3] : ""; } }])),
      8: { from: [], quiet: true, value: (v, p) => { const n = rruNew(v(2)), x = n && rruScores(p, n.ev); return x ? String(x.rs) : ""; } },
    },
    cells: {
      10: {
        fix: (v) => { const id = v.trim().match(/^A\s*\.?\s*(\d+)\s*\.\s*(\d+)\b/i); const a = id && ANNEX_A.find(([x]) => x === `A.${+id[1]}.${+id[2]}`); return a ? `${a[0]} ${a[1]}` : null; },
        hint: () => "Type the control's ID as Ref-Chain writes it, for example A.5.1.",
      },
      ...Object.fromEntries(Object.entries(ATTR_COLS).map(([ci, [pc, name]]) => [ci, {
        fix: (v: string, r: string[], d: Desk) => { const id = r[10].split(" ")[0]; return attrs27002(d).find((x) => x[0] === id)?.[pc] === v ? v : null; },
        hint: (r: string[]) => `Read ${r[10].split(" ")[0]}'s row in Ref-27002 attributes (Learn › Reference pages), column ${name}.`,
      }])),
    },
    ident: [0],
    view: { 10: [1], 11: [2, 8], 12: [3, 5], 13: [10] },
    checkRows: { 10: { label: 0, col: 3 }, 11: { label: 0, col: 9 }, 12: { label: 0, col: 10 } },
    then: { 13: "Tag each control with its ISO/IEC 27002 attributes (L05)" },
    note: {
      10: () => "Ref-Chain (Learn › Reference pages) lists asset types, each information or a supporting asset, with its typical threat, vulnerability, impact and Annex A control. Each asset's line here is from the asset register. Choose each asset's type; once checked, the platform copies the type's threat, vulnerability and impact.",
      11: (d) => `Rule L12 (Learn › Rule tables): ${(d.rules.L12?.[1] ?? "").split(" Controls = ")[0]} Each risk's residual score is from RR-UPD.`,
      12: () => "Ref-Chain (Learn › Reference pages): the Annex A control is on the row of each asset's type, beside its threat. Type its ID; its title is added for you.",
      13: (d) => `Rule L05 (Learn › Rule tables): ${d.rules.L05?.[1] ?? ""}`,
    },
    reads: { 10: ["learn|Reference pages"], 11: ["learn|Rule tables"], 12: ["learn|Reference pages"], 13: ["learn|Reference pages"] },
    handIn: { step: 14, cols: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13], ident: [0, 2] },
  },
  "T7.1 RTP": {
    code: "LI-RTP",
    title: "LI-RTP · Risk treatment plan (template T-LI-RTP)",
    on: [15, 16, 17, 18, 19, 20],
    cols: [
      { h: "Risk ID" }, { h: "Risk statement", wrap: true, w: 280, prose: true }, { h: "Residual (now)", wrap: true }, { h: "Option (L12)", wrap: true },
      { h: "Action", wrap: true, w: 300, opts: (_d, r) => [...(RRU_ACTIONS[r[0]] ?? [])].sort() },
      { h: "Control (SoA ID)", wrap: true, w: 250, opts: (d, r) => { const n = rruNew(r[0]); return n ? [...annexIn(keywordsOf(d, n.cat)), RTP_NONE] : undefined; } },
      { h: "Owner", wrap: true, w: 160 }, { h: "Due (R08)", wrap: true }, { h: "Expected residual", wrap: true }, { h: "Residual accepted by (R36)", wrap: true, w: 170, opts: R36_OPTS },
      { h: "Owner approval", wrap: true, w: 220 },
    ],
    rows: RRU_NEW.map((n) => [n.id, "", "", "", "", "", "", "", "", "", ""]),
    mine: () => true,
    steps: { 15: [4], 16: [5], 17: [7], 18: [8], 19: [9] },
    derived: {
      1: { from: [], quiet: true, value: (v, p) => { const n = rruNew(v(0)), b = n && rruBest(p, 2, n.ev); return n && b ? n.drafts[+b.slice(-1) - 1] : ""; } },
      2: { from: [], quiet: true, value: (v, p) => { const n = rruNew(v(0)), x = n && rruScores(p, n.ev); return x ? `${x.rs} (${x.Lr} × ${x.I}, ${rruRating(x.rs)})` : ""; } },
      3: { from: [], quiet: true, value: (v, p) => { const c = chainOf(v(0)); return c ? rruBest(p, 11, c.asset) : ""; } },
      6: { from: [], quiet: true, value: (v) => rruNew(v(0))?.owner ?? "" },
      10: { from: [], quiet: true, value: (v, p) => (p.rowChecks?.["T7.1-19"] ? `Approved by the ${rruNew(v(0))?.owner ?? "risk owner"}, ${RRU.plan} (simulated)` : "") },
    },
    cells: {
      7: { fix: (v) => (/^\s*none\s*$/i.test(v) ? "none" : isoDate(v)), hint: () => "Type a date, as 2027-01-31 or 31 January 2027, or none." },
      8: { fix: (v) => (/^\s*\d{1,2}\s*$/.test(v) ? String(+v) : null), hint: () => "Type the score as a number, for example 6." },
    },
    ident: [0],
    view: { 15: [1, 3], 16: [3, 4], 17: [2, 3, 6], 18: [2, 4, 5], 19: [8, 10] },
    checkRows: { 15: { label: 0, col: 4 }, 16: { label: 0, col: 5 }, 17: { label: 0, col: 7 }, 18: { label: 0, col: 8 }, 19: { label: 0, col: 9 } },
    note: {
      15: () => "Each risk's statement and option are copied from RR-UPD and step 11. Its event's facts, cause first, are in RRU-EVENTS on Risk Register › New Risk. Choose the action that carries out the option at the risk's cause.",
      16: (d) => `Rule L12 (Learn › Rule tables): ${(d.rules.L12?.[1] ?? "").split(". ").slice(-1)[0]} Each row offers the controls of its category's row in Ref-Keywords (Learn › Reference pages), with their titles. Choose the one the action puts in place.`,
      17: (d) => `Rule R08 (Learn › Rule tables): ${d.rules.R08?.[1] ?? ""} The plan is dated ${RRU.plan}: count calendar days from it. The owner is the risk's owner in RR-UPD.`,
      18: (d) => `Rule R07 (Learn › Rule tables): ${(d.rules.R07?.[1] ?? "").split(" Rating: ")[0]} Count the action's control as working; a retained risk has no new control.`,
      19: (d) => `Rule R36 (Learn › Rule tables): ${d.rules.R36?.[1] ?? ""} Rate the expected residual with R07's bands: 1–5 Low, 6–11 Medium, 12–19 High, 20–25 Critical.`,
    },
    reads: { 15: ["risk|New Risk"], 16: ["learn|Rule tables"], 17: ["learn|Rule tables"], 18: ["learn|Rule tables"], 19: ["learn|Rule tables"] },
    handIn: { step: 20, cols: [3, 4, 5, 6, 7, 8, 9, 10], ident: [0] },
  },
  "T7.2": {
    code: "RSK-TOP5",
    title: "RSK-TOP5 · Top-5 risk table for the board (Manila office)",
    on: [1, 2, 3, 5],
    cols: [
      { h: "Rank" }, { h: "Risk ID (R23)", opts: TOP_IDS }, { h: "Risk", wrap: true, w: 220 }, { h: "Inherent score", wrap: true }, { h: "Residual score", wrap: true },
      { h: "Residual rating", wrap: true }, { h: "Trend (R23)", wrap: true, opts: "step" }, { h: "Risk owner", wrap: true, w: 160 }, { h: "Decision", wrap: true, w: 150 },
      { h: "Risk statement", wrap: true, w: 320, prose: "always" },
      { h: "“So what” (R23)", wrap: true, w: 320, opts: (_d, r) => { const id = r[2].split(" · ")[0]; return SOWHAT[id] ? [...SOWHAT[id]].sort() : undefined; } },
    ],
    rows: [1, 2, 3, 4, 5].map((n) => [`Rank ${n}`, "", "", "", "", "", "", "", "", "", ""]),
    mine: () => true,
    steps: { 1: [1], 2: [6], 3: [10] },
    derived: Object.fromEntries(Object.entries(TOP_COL).map(([ci, at]) => [ci, {
      from: [], quiet: true,
      value: (v: (c: number) => string, p: Progress) => { const r = topRow(topBest(p, 1, v(0))); return !r ? "" : at < 0 ? `${r[0]} · ${r[1]}` : r[at]; },
    }])),
    ident: [0],
    view: { 2: [2, 4], 3: [2, 9] },
    checkRows: { 1: { label: 0, col: 1 }, 2: { label: 0, col: 6 }, 3: { label: 0, col: 10 } },
    then: { 1: "Rank the Top-5 (R23)", 3: "Choose each risk's “so what” line (R23)" },
    note: {
      1: (d) => `Rule R23 (Learn › Rule tables): ${(d.rules.R23?.[1] ?? "").split(" Trend:")[0]} Where the residual and the inherent scores are both equal, R23's own tie-break for the acceptance applies: the lower Risk ID first. The updated register, 28 risks, is on Risk Register › Score Risk.`,
      2: () => `Rule R23: score went up ↑, down ↓, no change →. Compare each risk's residual score now with its score at the last board report, ${TOP.board}; Risk Register › Heat Map with KRIs lists what moved since then. A risk added since that report had no score then: its score went up.`,
      3: (d) => `Rule R23 (Learn › Rule tables): ${(d.rules.R23?.[1] ?? "").match(/"So what" frame: "[^"]+"/)?.[0] ?? ""} Each risk's statement is under its row.`,
    },
    reads: { 1: ["risk|Score Risk", "learn|Rule tables"], 3: ["learn|Rule tables"] },
    handIn: { step: 5, cols: [1, 6, 10], ident: [0, 2] },
  },
  "T7.2 ACC": {
    code: "RSK-ACC",
    title: "RSK-ACC · Risk acceptance request (template T-ACC)",
    on: [4],
    cols: [{ h: "Field", wrap: true }, { h: "Value", wrap: true, w: 200, opts: (_d, r) => (r[0] === "Risk ID (R23)" ? TOP_IDS : r[0] === "Approver (R36)" ? R36_OPTS : undefined) }],
    rows: [["Request date", TOP.request], ["Risk ID (R23)", ""], ["Existing controls", ""], ["Expiry", ""], ["Re-assessment date", ""], ["Approver (R36)", ""]],
    mine: () => true,
    steps: { 4: [1] },
    only: { 4: (r) => r[0] !== "Existing controls" },
    derived: { 1: { from: [], quiet: true, value: (v, p) => (v(0) === "Existing controls" ? (topRow(topBest(p, 4, "Risk ID (R23)"))?.[8] ?? "") : null) } },
    cells: { 1: { fix: (v, r) => (/date|Expiry/.test(r[0]) ? isoDate(v) : v.trim() || null), hint: () => "Type a date, as 2027-01-31 or 31 January 2027." } },
    ident: [0],
    checkRows: { 4: { label: 0, col: 1 } },
    then: { 4: "Fill RSK-ACC (R23, R36)" },
    note: { 4: (d) => `Rule R23 (Learn › Rule tables): ${(d.rules.R23?.[1] ?? "").slice((d.rules.R23?.[1] ?? "").indexOf("Risk for acceptance"))} Rule R36: ${d.rules.R36?.[1] ?? ""} The request is dated ${TOP.request}: the acceptance starts that day. The updated register is on Risk Register › Score Risk; the risk's existing controls are copied once your answers are checked.` },
    reads: { 4: ["risk|Score Risk", "learn|Rule tables"] },
    handIn: { step: 5, cols: [1], ident: [0] },
  },
  "T7.2 GAP": {
    code: "LI-PLAN Gap",
    title: "LI-PLAN · Gap sheet, clauses 4–10 (template T-LI-PLAN)",
    on: [6, 12, 16],
    cols: [{ h: "Clause" }, { h: "Title", wrap: true, w: 200 }, { h: "Your deliverables (Ref-Clause map)", wrap: true, w: 220, prose: true }, { h: "Status (L13)", wrap: true, opts: "step" }, { h: "Not yet accepted (action)", wrap: true, w: 200 }],
    rows: (TOP.clauses as string[][]).map((c) => [...c, "", ""]),
    mine: () => true,
    steps: { 6: [3], 12: [4] },
    only: { 12: (r, p) => !!topBest(p, 6, r[0]) && topBest(p, 6, r[0]) !== "Conforms" },
    derived: { 4: { from: [], quiet: true, value: (v, p) => (topBest(p, 6, v(0)) === "Conforms" ? "—" : null) } },
    cells: { 4: { fix: (v, r) => codesIn(v, r[2]), hint: () => "Type codes of this clause's deliverables, as its row writes them, separated by ;." } },
    ident: [0],
    view: { 6: [1, 2], 12: [1, 2, 3] },
    checkRows: { 6: { label: 0, col: 3 }, 12: { label: 0, col: 4 } },
    note: {
      6: (d) => `Rule L13 (Learn › Rule tables): ${d.rules.L13?.[1] ?? ""} Each row lists the clause's deliverables. Where it lists several: Conforms when every one is accepted; Gap when none is in your review records; Partial for anything between, or when one was accepted with review comments. Your review records are on Home › Waiting On.`,
      12: () => "For each clause you rated Partial or Gap: the deliverables of its row that are not accepted yet, those not in your review records (Home › Waiting On) and those accepted with review comments. Type their codes separated by ;.",
    },
    reads: { 6: ["home|Waiting On"], 12: ["home|Waiting On"] },
    handIn: { step: 16, cols: [3, 4], ident: [0, 1] },
  },
  "T7.2 RAM": {
    code: "LI-RAM",
    title: "LI-RAM · Risk assessment method card (template T-LI-RAM)",
    on: [7, 8, 9, 10, 11],
    cols: [{ h: "Element", wrap: true, w: 190 }, { h: "What the card says", wrap: true, w: 320, opts: (_d, r) => (RAM_ONLY[9].includes(r[0]) ? R36_OPTS : r[0] === RAM_ONLY[10][0] ? RAM_REC : undefined) }, { h: "BKB source", wrap: true, w: 170 }],
    rows: RAM_ROWS,
    mine: () => true,
    steps: { 7: [1], 8: [1], 9: [1], 10: [1] },
    only: Object.fromEntries(Object.entries(RAM_ONLY).map(([n, xs]) => [n, (r: string[]) => xs.includes(r[0])])),
    load: ["BKB-ERM-001"],
    cells: { 1: { fix: (v, r) => ramFix(v, r), hint: (r) => RAM_HINT[r[0]] ?? "" } },
    ident: [0],
    view: { 7: [2], 8: [2], 9: [2], 10: [2] },
    checkRows: { 9: { label: 0, col: 1 }, 10: { label: 0, col: 1 } },
    then: { 7: "Copy the scale names into LI-RAM" },
    note: {
      7: () => "LI-RAM is the method card another assessor follows to reach comparable results. Copy the names of each scale from BKB-ERM-001 (Policies › Policy Library), from score 1 up to score 5, separated by ;.",
      8: () => "BKB-ERM-001 (Policies › Policy Library): Section 4 gives the appetite of each criticality band; GlobalConnect is a LOW-criticality organisation. Section 7 gives the due days of each residual rating.",
      9: (d) => `Rule R36 (Learn › Rule tables): ${d.rules.R36?.[1] ?? ""}`,
      10: () => "Ref-Clause map (Learn › Reference pages), row 8.2: the documented information clause 8.2 requires, and the deliverables that evidence it.",
    },
    reads: { 9: ["learn|Rule tables"], 10: ["learn|Reference pages"] },
    handIn: { step: 11, cols: [1], ident: [0] },
  },
  "T7.2 OBJ": {
    code: "LI-PLAN Objectives",
    title: "LI-PLAN · Objectives sheet (template T-LI-PLAN)",
    on: [13],
    cols: [
      { h: "Objective (template)", wrap: true, w: 200 }, { h: "Measure", wrap: true, w: 240 }, { h: "Owner", wrap: true, w: 170 }, { h: "When evaluated", wrap: true },
      { h: "Objective as measured (L14)", wrap: true, w: 300, opts: (_d, r) => (TOP.obj_opts as string[][])[(TOP.objectives as string[][]).findIndex((o) => o[0] === r[0])] },
    ],
    rows: (TOP.objectives as string[][]).map((o) => [...o, ""]),
    mine: () => true,
    steps: { 13: [4] },
    ident: [0],
    view: { 13: [1] },
    checkRows: { 13: { label: 0, col: 4 } },
    note: { 13: (d) => `Rule L14 (Learn › Rule tables): ${d.rules.L14?.[1] ?? ""} Ref-Objectives dates all three "Programme week 12 + 6 months": count from the day week 12 opens, on Home › Calendar (the programme runs from October 2026 to January 2027).` },
    reads: { 13: ["learn|Rule tables", "home|Calendar"] },
    handIn: { step: 16, cols: [4], ident: [0] },
  },
  "T7.2 PLAN": {
    code: "LI-PLAN Plan",
    title: "LI-PLAN · Plan sheet (template T-LI-PLAN)",
    on: [14],
    cols: [{ h: "ID" }, { h: "Milestone", wrap: true, w: 220 }, { h: "Start" }, { h: "End" }, { h: "Owner (L15)", wrap: true, w: 200, opts: (d) => ROLES_T72(d) }],
    rows: (TOP.plan as string[][]).map((m) => [m[0], m[1], m[2], m[3], ""]),
    mine: () => true,
    steps: { 14: [4] },
    ident: [0],
    view: { 14: [1, 2, 3] },
    checkRows: { 14: { label: 0, col: 4 } },
    note: { 14: (d) => `Rule L15 (Learn › Rule tables): ${d.rules.L15?.[1] ?? ""} The Accountable role of each ISMS process is in Ref-ISMS processes (Learn › Reference pages), column Owner (Accountable): the role it names first. A milestone no ISMS process covers keeps the owner Ref-Milestones gives; the Stage 1 audit is the certification body's (T5.1), not an internal audit. Start and end are worked out for you from week 12 (${TOP.week12}, Home › Calendar).` },
    reads: { 14: ["learn|Rule tables", "learn|Reference pages"] },
    handIn: { step: 16, cols: [4], ident: [0] },
  },
  "T7.2 RISKS": {
    code: "LI-PLAN ISMS risks",
    title: "LI-PLAN · ISMS risks and opportunities, clause 6.1.1 (template T-LI-PLAN)",
    on: [15],
    cols: [{ h: "ID", wrap: true, w: 120 }, { h: "ISMS risk", wrap: true, w: 240, prose: true }, { h: "Opportunity (the action)", wrap: true, w: 200, prose: true }, { h: "Milestone (clause 6.1.1)", wrap: true, w: 240, opts: MILES }],
    rows: (TOP.isms as string[][]).map((x) => [...x, ""]),
    mine: () => true,
    steps: { 15: [3] },
    ident: [0],
    view: { 15: [1, 2] },
    checkRows: { 15: { label: 0, col: 3 } },
    note: { 15: () => "Copied from Ref-Milestones (Learn › Reference pages). Clause 6.1.1 asks for every action that addresses an ISMS risk or opportunity to be part of the plan: choose the milestone whose work it belongs to." },
    reads: { 15: ["learn|Reference pages"] },
    handIn: { step: 16, cols: [3], ident: [0] },
  },
  // T8.1 (desk-step-builder, 29 Oct 2026). VUL-TEST is a workbook of five sheets: the class rules (step 1), the findings (3,
  // 5), the exceptions (4), the compliance per class (6), and the due-date check (2), a working that is not handed in. VUL-MEMO
  // (7) goes with it at step 8. LI-KPI: the card's fields (9, read) and its results against the target (11), handed in at 12.
  "T8.1 CLASS": {
    code: "VUL-TEST Class rules",
    title: "VUL-TEST · Class rules (R24)",
    on: [1, 8],
    cols: [{ h: "Kind of finding (exposure · KEV · scanner severity)", wrap: true, w: 230 }, { h: "Findings", wrap: true }, { h: "Class (R24)", wrap: true, opts: "step" }],
    rows: VUL_KINDS.map((k) => [k, String(VUL_F.filter((r) => vulKind(r) === k).length), ""]),
    mine: () => true,
    steps: { 1: [2] },
    ident: [0],
    view: { 1: [1] },
    checkRows: { 1: { label: 0, col: 2 } },
    note: { 1: (d) => `Rule R24 (Learn › Rule tables): ${(d.rules.R24?.[1] ?? "").split(" Due =")[0]} KEV-listed: the vulnerability is in CISA's Known Exploited Vulnerabilities catalogue. Each row is one kind of finding in the scanner export, with the number of its findings; the class you choose is given to every one of them.` },
    reads: { 1: ["learn|Rule tables"] },
    handIn: { step: 8, cols: [2], ident: [0] },
  },
  "T8.1 DUE": {
    code: "VUL-TEST Due-date check",
    title: "VUL-TEST · Due-date check, one finding of each class",
    on: [2],
    cols: [{ h: "Finding" }, { h: "Class (R24)", wrap: true }, { h: "First detected", wrap: true }, { h: "Due date", wrap: true }],
    rows: VUL_DUE.map((id) => [id, "", vulRow(id)![8], ""]),
    mine: () => true,
    steps: { 2: [3] },
    derived: { 1: { from: [], quiet: true, value: (v, p) => VUL_CL[vulClass(p, v(0))] ?? "" } },
    cells: { 3: { fix: (v) => isoDate(v), hint: () => "Type a date, as 2026-12-31 or 31 December 2026." } },
    ident: [0],
    view: { 2: [1, 2] },
    checkRows: { 2: { label: 0, col: 3 } },
    note: { 2: () => "Rule R24: due = first detected + the class's SLA in days. Each finding's class is the one your step 1 gave its kind. Count calendar days, across the end of a month." },
  },
  "T8.1": {
    code: "VUL-TEST Findings",
    title: "VUL-TEST · Findings (template T-VUL)",
    on: [3, 5],
    cols: [
      { h: "Finding" }, { h: "Exposure", wrap: true }, { h: "KEV" }, { h: "Scanner severity", wrap: true }, { h: "Class (R24)", wrap: true }, { h: "SLA days", wrap: true },
      { h: "First detected", wrap: true }, { h: "Due", wrap: true }, { h: "Closed", wrap: true }, { h: "Status at the test date", wrap: true, opts: "step" }, { h: "Exception ID", wrap: true },
      { h: "Exception valid (R24)", wrap: true }, { h: "Last scan", wrap: true, prose: true }, { h: "Found in last scan", wrap: true, prose: true }, { h: "Re-scan verified", wrap: true, opts: ["Verified by re-scan", "Not verified"] }, { h: "Days open", wrap: true },
    ],
    rows: VUL_F.map((r) => [r[0], r[2], r[5], r[7], "", "", r[8], "", r[9], "", r[12], "", r[10], r[11], "", ""]),
    mine: () => true,
    steps: { 3: [9], 5: [14] },
    only: { 5: (r) => !!r[8] },
    derived: {
      4: { from: [], quiet: true, value: (v, p) => VUL_CL[vulClass(p, v(0))] ?? "" },
      5: { from: [], quiet: true, value: (v, p) => String(VUL_DAYS[vulClass(p, v(0))] ?? "") },
      7: { from: [], quiet: true, value: (v, p) => vulDue(p, v(0)) },
      11: { from: [], quiet: true, value: (v, p) => (v(10) ? vulBest(p, 4, v(10)) : "—") },
      14: { from: [], value: (v) => (v(8) ? null : "—") },
      15: { from: [], quiet: true, value: (v) => String(daysFrom(v(6), v(8) || VUL_TEST)) },
    },
    ident: [0],
    view: { 3: [4, 7, 8], 5: [8, 12, 13] },
    checkRows: { 3: { label: 0, col: 9 }, 5: { label: 0, col: 14 } },
    note: {
      3: () => `The test date is ${VUL_TEST}. Each finding's due date is the workbook's formula from your steps 1 and 2: first detected + its class's SLA. A finding with no closed date is still open. Use the dates only: whether an exception holds is step 4, whether a fix was verified is step 5.`,
      5: () => "The closed findings only. Each row gives the date the finding was marked closed, and the scanner's latest scan of its asset with whether that scan still found the vulnerability. BKB-POL-010 Section 6.1 step 4 (Policies › Policy Library) says when a fix counts as verified.",
    },
    handIn: { step: 8, cols: [9, 14], ident: [0, 4, 7] },
  },
  "T8.1 EX": {
    code: "VUL-TEST Exceptions",
    title: "VUL-TEST · Exceptions (exception register extract)",
    on: [4],
    cols: [{ h: "Exception ID", wrap: true }, { h: "Finding" }, { h: "Approved by", wrap: true, prose: true }, { h: "Compensating control", wrap: true, prose: true }, { h: "Expiry", wrap: true }, { h: "Valid at the test date (R24)", wrap: true, opts: "step" }],
    rows: VUL_EX.map((e) => [e[0], e[1], e[2], e[3] || "None recorded", e[4], ""]),
    mine: () => true,
    steps: { 4: [5] },
    ident: [0],
    view: { 4: [1, 2, 3, 4] },
    checkRows: { 4: { label: 0, col: 5 } },
    note: { 4: (d) => `Rule R24 (Learn › Rule tables): ${(d.rules.R24?.[1] ?? "").match(/Exception valid.*$/)?.[0] ?? ""} The test date is ${VUL_TEST}.` },
    reads: { 4: ["learn|Rule tables"] },
    handIn: { step: 8, cols: [5], ident: [0] },
  },
  "T8.1 COMP": {
    code: "VUL-TEST Compliance",
    title: "VUL-TEST · Compliance per class",
    on: [6],
    cols: [{ h: "Class", wrap: true }, { h: "Its findings, by what steps 3 to 5 found", wrap: true, w: 300, prose: "always" }, { h: "Compliance (within SLA / all findings = %)", wrap: true, w: 190 }],
    rows: VUL_CL.map((c) => [c, "", ""]),
    mine: () => true,
    steps: { 6: [2] },
    derived: {
      1: {
        from: [], quiet: true,
        value: (v, p) => {
          const t = vulTotals(p), c = VUL_CL.indexOf(v(0));
          if (!t || c < 0) return "";
          const all = t[c].reduce((a, b) => a + b, 0);
          return `${all} findings: ${VUL_GROUPS.map((g, i) => (t[c][i] ? `${t[c][i]} ${g}` : "")).filter(Boolean).join(" · ")}.`;
        },
      },
    },
    cells: { 2: { fix: (v) => vulPct(v), hint: () => "Type it as within SLA / all findings = %, for example 12 / 20 = 60.0 %." } },
    ident: [0],
    view: { 6: [1] },
    checkRows: { 6: { label: 0, col: 2 } },
    note: { 6: () => "BKB-POL-010 Section 10 (Policies › Policy Library) says which findings are within SLA. Under each class, its findings are counted by what your steps 3 to 5 found: type the class's compliance, to one decimal." },
    handIn: { step: 8, cols: [2], ident: [0] },
  },
  "T8.1 MEMO": {
    code: "VUL-MEMO",
    title: "VUL-MEMO · Test memo (one page)",
    on: [7],
    cols: [{ h: "Part", wrap: true, w: 110 }, { h: "What the memo says", wrap: true, w: 230, opts: (d, r) => (VUL_REC.includes(r[0]) ? vulActions(d) : undefined) }],
    rows: VUL_MEMO.map((x) => [x, x === "Scope" ? `The ${VUL_F.length} vulnerabilities of LearnTech's Amsterdam office first detected in the six months to ${VUL_TEST}, tested on ${VUL_TEST} against BKB-POL-010 Section 4 (LOW) with rule R24.` : ""]),
    mine: () => true,
    steps: { 7: [1] },
    derived: { 1: { from: [], quiet: true, value: (v, p) => vulMemo(p, v(0)) } },
    ident: [0],
    checkRows: { 7: { label: 0, col: 1 } },
    then: { 7: "Write the memo's three recommendations (R25)" },
    note: { 7: (d) => `Rule R25 (Learn › Rule tables): ${d.rules.R25?.[1] ?? ""} Ref-Actions (Learn › Reference pages) names each deviation type, V1 to V4, and its action. The memo's lines above the recommendations give the counts, written from your checked sheets.` },
    reads: { 7: ["learn|Rule tables", "learn|Reference pages"] },
    handIn: { step: 8, cols: [1], ident: [0] },
  },
  "T8.1 KPI": {
    code: "LI-KPI",
    title: "LI-KPI · Measure card (template T-LI-KPI)",
    on: [9, 12],
    cols: [{ h: "Field", wrap: true, w: 150 }, { h: "What the card says", wrap: true, w: 320 }],
    rows: KPI_FIELDS,
    mine: () => true,
    steps: {},
    derived: { 1: { from: [], quiet: true, value: (v, p) => (v(0) === "Who evaluates" ? ((p.acks?.["T8.1-10"] ?? []).includes("checked") ? "CISO" : "") : null) } },
    ident: [0],
    handIn: { step: 12, cols: [1], ident: [0] },
  },
  "T8.1 RES": {
    code: "LI-KPI Results",
    title: "LI-KPI · Results against the target",
    on: [11],
    cols: [{ h: "Class", wrap: true }, { h: "Result (the card's formula on VUL-TEST)", wrap: true, w: 200 }, { h: "Against the target", wrap: true, opts: "step" }],
    rows: VUL_CL.map((c) => [`Result: ${c}`, "", ""]),
    mine: () => true,
    steps: { 11: [2] },
    derived: { 1: { from: [], quiet: true, value: (v, p) => vulBest(p, 6, v(0).replace("Result: ", "")) } },
    ident: [0],
    view: { 11: [1] },
    checkRows: { 11: { label: 0, col: 2 } },
    note: { 11: () => `The card's target and thresholds (Ref-Measure card): ${KPI_FIELDS[8][1]}. Each result is the card's formula applied to VUL-TEST: your step 6.` },
    handIn: { step: 12, cols: [2], ident: [0, 1] },
  },
  // T8.2 (desk-step-builder, 29 Oct 2026). CT-SCRIPT, template T-CT: "Script pre-filled (objective, attributes, pass
  // criteria); sample; results; deviations (R26)" (GRC101_Engine), and CT-MEMO, the memo frame of Control Testing › Raise
  // Finding. Sheet 1 is read in step 1 (STUDY), the sample worked out in 2 (R15), Sheet 2 walked in 3, Sheet 3 rated in 4;
  // CT-MEMO concludes in 5 (R19) and recommends in 6 (R25). LI-NCR: read in 8, written in 9, graded in 10, 5-Whys in 11.
  "T8.2": {
    code: "CT-SCRIPT Sheet 1",
    title: "CT-SCRIPT · Sheet 1 · Test script (fixed)",
    on: [1],
    // Narrow least widths: on a phone the three columns fit the screen.
    cols: [{ h: "Item", wrap: true, w: 96 }, { h: "What the script says", wrap: true, w: 170 }, { h: "Read from", wrap: true, w: 96 }],
    rows: CT.script as string[][],
    mine: () => false,
    steps: {},
    ident: [0],
  },
  "T8.2 SAMP": {
    code: "CT-SCRIPT Sampling",
    title: "CT-SCRIPT · Sheet 1 · Sample (R15)",
    on: [2, 7],
    cols: [
      { h: "Line", wrap: true, w: 170 },
      { h: "Value", wrap: true, w: 230, opts: (d, r) => (r[0] === CT_SAMP[0] ? ((d.pages["Ref-Sampling"]?.r ?? []) as string[][]).map((x) => String(x[0])) : r[0] === CT_SAMP[1] ? uniq(((d.pages["Ref-Sampling"]?.r ?? []) as string[][]).map((x) => String(x[2]))).sort((a, b) => +a - +b) : undefined) },
    ],
    rows: CT_SAMP.map((x) => [x, ""]),
    mine: () => true,
    steps: { 2: [1] },
    // The quarters the platform selects show once the answers are checked (R15: "the platform does the selection").
    only: { 2: (r, p) => r[0] !== CT_SAMP[2] || !!p.rowChecks?.["T8.2-2"] },
    derived: { 1: { from: [], value: (v, p) => (v(0) === CT_SAMP[2] ? (p.rowChecks?.["T8.2-2"] ? `${CT.sample.join(" and ")}: systematic, every 2nd quarter from quarter ${CT.sample[0].slice(1)} (seed ${CT.seed}, mod 4 = ${CT.seed % 4}). Their ${CT_SAMPLE.length} records are all tested, in Sheet 2.` : "") : null) } },
    ident: [0],
    checkRows: { 2: { label: 0, col: 1 } },
    note: { 2: (d) => `Rule R15 (Learn › Rule tables): ${(d.rules.R15?.[1] ?? "").split(". ")[0]}. The control is LearnTech's privileged-access review: its frequency for LearnTech is in BKB-ADD-36 Section 5 (Policies › Policy Library). Ref-Sampling is in Learn › Reference pages.` },
    reads: { 2: ["learn|Reference pages"] },
    handIn: { step: 7, cols: [1], ident: [0] },
  },
  "T8.2 S2": {
    code: "CT-SCRIPT Sheet 2",
    title: "CT-SCRIPT · Sheet 2 · Sample and A1–A6 results",
    on: [3, 7],
    cols: [
      { h: "Record" }, { h: "Quarter" }, { h: "Privileged account", wrap: true }, { h: "Review date", wrap: true }, { h: "Reviewer", wrap: true },
      { h: "Decision" }, { h: "MFA" }, { h: "Session recording", wrap: true }, { h: "Revocation executed", wrap: true }, { h: "Result (A1–A6)", wrap: true }, { h: "Attributes failed", wrap: true },
    ],
    rows: CT_SAMPLE.map((r) => [...r, "", ""]),
    mine: () => true,
    steps: { 3: [9, 10] },
    checklist: { 3: { page: "", checks: () => CT.checks as string[][], col: 9, codes: 10, reads: { A1: [3, 5], A2: [1, 3], A3: 6, A4: 7, A5: [2, 4], A6: [5, 8] }, pass: "Pass", fail: "Fail" } },
    checkRows: { 3: { label: 0, col: 10 } },
    note: { 3: () => `The script's quarters (Sheet 1): ${(CT.quarters as string[][]).filter(([q]) => CT.sample.includes(q)).map(([q, m]) => `${q} ${m}`).join(", ")}. A2 allows ${CT.tolerance} days after a quarter ends. The platform selected ${CT.sample.join(" and ")} (seed ${CT.seed}): every record of both quarters is tested.` },
    ident: [0],
    handIn: { step: 7, cols: [9, 10], ident: [0, 1] },
  },
  "T8.2 DEV": {
    code: "CT-SCRIPT Sheet 3",
    title: "CT-SCRIPT · Sheet 3 · Deviations (R26)",
    on: [4, 7],
    cols: [{ h: "Record" }, { h: "Quarter" }, { h: "Privileged account", wrap: true }, { h: "Review date", wrap: true }, { h: "Attributes failed", wrap: true }, { h: "Rating (R26)", wrap: true, opts: "step" }],
    rows: CT_DEV.map((id) => { const r = ctRow(id); return [id, r[1], r[2], r[3], "", ""]; }),
    mine: () => true,
    steps: { 4: [5] },
    derived: { 4: { from: [], quiet: true, value: (v, p) => ctBest(p, 3, v(0)) } },
    ident: [0],
    view: { 4: [1, 2, 3, 4] },
    checkRows: { 4: { label: 0, col: 5 } },
    note: { 4: (d) => `Rule R26 (Learn › Rule tables): ${d.rules.R26?.[1] ?? ""} Read its ratings in order and take the first that fits. The records are of the privileged accounts of LearnTech's Amsterdam office; BKB-ADD-36 Section 8 (Policies › Policy Library) gives each office's Mission Critical assets.` },
    reads: { 4: ["learn|Rule tables"] },
    handIn: { step: 7, cols: [5], ident: [0] },
  },
  "T8.2 CONC": {
    code: "CT-MEMO Conclusion",
    title: "CT-MEMO · Test memo · Conclusion (R19)",
    on: [5, 7],
    cols: [
      { h: "Line", wrap: true, w: 200 },
      { h: "Your answer", wrap: true, w: 220, opts: (_d, r) => (r[0] === CT_CONC[1] ? ["High", "Medium", "Low"] : r[0] === CT_CONC[2] ? ["Effective", "Effective with exceptions", "Not effective"] : undefined) },
    ],
    rows: CT_CONC.map((x) => [x, ""]),
    mine: () => true,
    steps: { 5: [1] },
    cells: { 1: { fix: (v, r) => (r[0] !== CT_CONC[0] ? v : /^\s*\d+\s*$/.test(v) ? String(+v) : null), hint: () => "Type the number of deviations, as a number (for example 3)." } },
    ident: [0],
    checkRows: { 5: { label: 0, col: 1 } },
    note: {
      5: (d, p) => {
        const dev = CT_DEV.map((id) => `${id} ${ctBest(p, 3, id)} (${ctBest(p, 4, id) || "?"})`);
        return `Rule R19 (Learn › Rule tables): ${d.rules.R19?.[1] ?? ""} Sheet 3's deviations, as steps 3 and 4 checked them: ${dev.join("; ")}. ${CT_SAMPLE.length} records were tested.`;
      },
    },
    handIn: { step: 7, cols: [1], ident: [0] },
  },
  "T8.2 MEMO": {
    code: "CT-MEMO",
    title: "CT-MEMO · Test memo",
    on: [6, 7],
    cols: [{ h: "Part", wrap: true, w: 110 }, { h: "What the memo says", wrap: true, w: 230, opts: (d, r) => (r[0] === CT_MEMO[3] ? ((d.pages["Ref-Actions"]?.r ?? []) as string[][]).map((x) => `${x[0]}: ${x[2]}`) : undefined) }],
    rows: CT_MEMO.map((x) => [x, x === "Scope" ? `The quarterly privileged-access review of LearnTech's Amsterdam office, October 2025 to September 2026: the ${CT_SAMPLE.length} review records of ${CT.sample.join(" and ")}, tested against CT-SCRIPT A1 to A6.` : ""]),
    mine: () => true,
    steps: { 6: [1] },
    derived: {
      1: {
        from: [], quiet: true,
        value: (v, p) => {
          if (v(0) === CT_MEMO[1]) { const c = CT_CONC.map((x) => ctBest(p, 5, x)); return c[2] ? `The control privileged-access review is ${c[2]} (rule R19). We found ${c[0]} deviation${c[0] === "1" ? "" : "s"} in ${CT_SAMPLE.length} items tested.` : ""; }
          if (v(0) === CT_MEMO[2]) return CT_DEV.map((id) => ctDev(p, id)).join(" ");
          return null;
        },
      },
    },
    ident: [0],
    checkRows: { 6: { label: 0, col: 1 } },
    then: { 6: "Write the memo's recommendation (R25)" },
    note: { 6: (d) => `Rule R25 (Learn › Rule tables): ${d.rules.R25?.[1] ?? ""} Ref-Actions (Learn › Reference pages) names each deviation type and its action. Your test found one deviation type, so the memo has one recommendation.` },
    reads: { 6: ["learn|Reference pages"] },
    handIn: { step: 7, cols: [1], ident: [0] },
  },
  "T8.2 NCR": {
    code: "LI-NCR",
    title: "LI-NCR · Nonconformity report (template T-LI-NCR)",
    on: [8, 9, 10, 12],
    cols: [
      { h: "Field", wrap: true, w: 130 },
      { h: "What it holds", wrap: true, w: 200 },
      { h: "Entry", wrap: true, w: 240, opts: (_d, r) => (r[0] === "Requirement" ? (CT.reqs as string[]) : r[0] === "Grade (L17)" ? ["Major", "Minor"] : undefined) },
    ],
    rows: NCR_FIELDS.map((f) => [...f, ""]),
    mine: () => true,
    steps: { 9: [2], 10: [2] },
    only: {
      9: (r) => ["Nonconformity", "Requirement", "Evidence", "Gap (days after the quarter ended)"].includes(r[0]),
      10: (r) => ["Nonconformity", "Grade (L17)"].includes(r[0]),
    },
    derived: {
      2: {
        from: [], quiet: true,
        value: (v, p) => {
          const f = v(0);
          if (f === "Requirement" || f.startsWith("Gap") || f === "Grade (L17)") return null;
          if (f === "Nonconformity") return ctDev(p, CT_DEV[0]);
          if (f === "Evidence") { const r = ctRow(CT_DEV[0]); return p.rowChecks?.["T8.2-3"] ? `CT-DATA record ${r[0]} (CT-SCRIPT Sheet 2): ${r[1]} review of ${r[2]}, dated ${r[3]}.` : ""; }
          if (f === "Root cause (Why 5)") return ctBest(p, 11, "Why 5");
          const a = (CT.actions as string[][]).find(([x]) => x === f);
          return a && p.rowChecks?.["T8.2-11"] ? a[1] : "";
        },
      },
    },
    cells: { 2: { fix: (v, r) => (!r[0].startsWith("Gap") ? v : /^\s*\d+\s*$/.test(v) ? String(+v) : null), hint: () => "Type the number of days, as a number (for example 12)." } },
    ident: [0],
    view: { 9: [1], 10: [1] },
    checkRows: { 9: { label: 0, col: 2 }, 10: { label: 0, col: 2 } },
    note: {
      9: () => `The requirement is one of BKB-POL-006's (Policies › Policy Library); the quarters are in CT-SCRIPT Sheet 1: ${(CT.quarters as string[][]).map(([q, m]) => `${q} ${m}`).join(", ")}.`,
      10: (d) => `Rule L17 (Learn › Rule tables): ${d.rules.L17?.[1] ?? ""} Your test: ${CT_SAMPLE.length} records of ${CT.sample.join(" and ")} tested, ${CT_DEV.length} deviation (Sheet 3).`,
    },
    handIn: { step: 12, cols: [2], ident: [0] },
  },
  "T8.2 WHY": {
    code: "LI-NCR 5-Whys",
    title: "LI-NCR · 5-Whys form (L18)",
    on: [11, 12],
    cols: [{ h: "Why", w: 60 }, { h: "Question (Ref-5-Whys)", wrap: true, w: 200, prose: true }, { h: "Answer (a fact from the evidence)", wrap: true, w: 260, opts: CT.facts as string[] }],
    rows: WHYS.map((r) => [...r, ""]),
    mine: () => true,
    steps: { 11: [2] },
    ident: [0],
    view: { 11: [1] },
    checkRows: { 11: { label: 0, col: 2 } },
    then: { 11: "Fill the 5-Whys form (L18)" },
    note: { 11: (d) => `Rule L18 (Learn › Rule tables): ${(d.rules.L18?.[1] ?? "").split(" Correction =")[0]} ${CT.iam} The procedure step is in BKB-POL-006 Section 6.2 (Policies › Policy Library).` },
    handIn: { step: 12, cols: [2], ident: [0] },
  },
  // T9.1 (desk-step-builder, 29 Oct 2026). VEN-TIER, template T-VEN: the facts rule R35 reads, as BKB-POL-013 Section 3.1
  // defines them (1), then the tier (2); VEN-Q, written from Ref-Questions once D2 is checked (3); VEN-CL, Ref-Clauses
  // marked for the tier (4, after D3). LI-13: VEN-Q's cloud and supply-chain section, the service model and its split (6),
  // the fixed questions mapped to their controls (7).
  "T9.1": {
    code: "VEN-TIER",
    title: "VEN-TIER · Tiering record (template T-VEN) · Facts (R35)",
    on: [1, 5],
    cols: [{ h: "Fact (rule R35)", wrap: true, w: 200 }, { h: "Your answer", wrap: true, w: 170, opts: (_d, r) => (r[0] === VEN.facts[0][0] ? VEN.tiers : ["Yes", "No"]) }],
    rows: VEN.facts.map(([f]) => [f, ""]),
    mine: () => true,
    steps: { 1: [1] },
    ident: [0],
    checkRows: { 1: { label: 0, col: 1 } },
    note: { 1: () => `Lumen's intake form is in Vendors › Vendor Intake. BKB-POL-013 Section 3.1 (Policies › Policy Library) says what each fact means and which line of the form it is read from.` },
    reads: { 1: ["vendors|Vendor Intake"] },
    handIn: { step: 5, cols: [1], ident: [0] },
  },
  "T9.1 TIER": {
    code: "VEN-TIER Tier",
    title: "VEN-TIER · Tiering record · Vendor tier (R35)",
    on: [2, 5],
    cols: [{ h: "Vendor", wrap: true, w: 180 }, { h: "Tier (R35)", wrap: true, w: 140, opts: "step" }],
    rows: [[VEN_NAME, ""]],
    mine: () => true,
    steps: { 2: [1] },
    ident: [0],
    checkRows: { 2: { label: 0, col: 1 } },
    note: { 2: (d, p) => `Rule R35 (Learn › Rule tables): ${d.rules.R35?.[1] ?? ""} Your facts, as step 1 checked them: ${VEN.facts.map(([f]) => `${f}: ${venBest(p, 1, f) || "not checked yet"}`).join("; ")}.` },
    handIn: { step: 5, cols: [1], ident: [0] },
  },
  "T9.1 Q": {
    code: "VEN-Q",
    title: "VEN-Q · Security questionnaire (Ref-Questions, rule R27)",
    on: [5],
    cols: [{ h: "No", w: 44 }, { h: "Domain" }, { h: "Question", wrap: true, w: 260, prose: true }, { h: "Include from tier", wrap: true }, { h: "In VEN-Q (R27)", wrap: true }],
    rows: VEN.questions.map((r) => [...r, ""]),
    mine: () => true,
    steps: {},
    // Written once D2 is checked, from the tier step 2 checked: R27 includes every question up to the vendor's tier.
    derived: { 4: { from: [3], quiet: true, value: (v, p) => { const t = venBest(p, 2, VEN_NAME); return t && venAsked(p, 3) ? (VEN_RANK.indexOf(v(3)) <= VEN_RANK.indexOf(t) ? "Yes" : "No") : ""; } } },
    ident: [0, 2],
    handIn: { step: 5, cols: [4], ident: [0, 2] },
  },
  "T9.1 CL": {
    code: "VEN-CL",
    title: "VEN-CL · Contract clause checklist (Ref-Clauses, rule R27)",
    on: [4, 5],
    cols: [{ h: "Clause", wrap: true, w: 220 }, { h: "Include from tier", wrap: true }, { h: "In VEN-CL (R27)", wrap: true, w: 120, opts: ["Yes", "No"] }],
    rows: [...VEN.clauses.map(([c, t]) => [c, t, ""]), ["", VEN_TRANSFER, ""]],
    mine: () => true,
    steps: { 4: [2] },
    derived: {
      0: { from: [], value: (v, p) => (v(1) === VEN_TRANSFER ? (venAsked(p, 4) ? "Transfer mechanism" : "") : null) },
      2: { from: [], value: (v, p) => (v(1) === VEN_TRANSFER ? (venAsked(p, 4) ? "Yes" : "") : null) },
    },
    ident: [0, 1],
    checkRows: { 4: { label: 0, col: 2 } },
    then: { 4: "Mark VEN-CL's clauses for the tier (R27)" },
    note: { 4: (d, p) => `Rule R27 (Learn › Rule tables): ${d.rules.R27?.[1] ?? ""} Ref-Clauses' clauses are listed with the tier each is included from. Lumen's tier, as step 2 checked it: ${venBest(p, 2, VEN_NAME) || "not checked yet"}. The transfer clause is added by your answer.` },
    handIn: { step: 5, cols: [0, 2], ident: [0] },
  },
  "T9.1 CLD": {
    code: "VEN-Q LI-CLD",
    title: "VEN-Q · Cloud and supply-chain section (LI-CLD) · Service model and split (L19)",
    on: [6, 8],
    cols: [{ h: "Item", wrap: true, w: 240 }, { h: "Your answer", wrap: true, w: 170, opts: (_d, r) => (r[0] === VEN.cloud[0][0] ? ["IaaS", "PaaS", "SaaS"] : ["Lumen (provider)", "LearnTech (customer)"]) }],
    rows: VEN.cloud.map(([x]) => [x, ""]),
    mine: () => true,
    steps: { 6: [1] },
    ident: [0],
    checkRows: { 6: { label: 0, col: 1 } },
    note: { 6: (d) => `Rule L19 (Learn › Rule tables): ${d.rules.L19?.[1] ?? ""} Lumen's intake form, with its Delivery line, is in Vendors › Vendor Intake; Ref-Cloud is in Learn › Reference pages.` },
    reads: { 6: ["vendors|Vendor Intake", "learn|Reference pages"] },
    handIn: { step: 8, cols: [1], ident: [0] },
  },
  "T9.1 FIX": {
    code: "VEN-Q LI-CLD questions",
    title: "VEN-Q · Cloud and supply-chain section (LI-CLD) · Fixed questions (L19)",
    on: [7, 8],
    cols: [{ h: "Fixed question", wrap: true, w: 100 }, { h: "Question (Ref-Cloud)", wrap: true, w: 260, prose: true }, { h: "Control it gives evidence for", wrap: true, w: 220, opts: VEN.controls }],
    rows: VEN.fixed.map(([a, b]) => [a, b, ""]),
    mine: () => true,
    steps: { 7: [2] },
    ident: [0, 1],
    checkRows: { 7: { label: 0, col: 2 } },
    note: { 7: () => "BKB-POL-021 (Policies › Policy Library) implements A.5.23: its Section 9 maps it, and its Section 3.1 says what it requires of every cloud service. A.5.21, the ICT supply chain, covers the sub-processors, software components and updates a supplier relies on." },
    handIn: { step: 8, cols: [2], ident: [0] },
  },
  // T9.2 (desk-step-builder, 30 Oct 2026). SOC-REV, template T-SOC: the checklist S1–S9 read against the report's lines
  // (1, STUDY), each check's result (2), the CUECs' owners (3); SOC-DEC: R28 on the failed checks, and the decision (4).
  "T9.2 CHK": {
    code: "SOC-REV Checklist",
    title: "SOC-REV · SOC 2 review worksheet · Checks S1–S9 (Ref-SOC checks)",
    on: [1],
    cols: [{ h: "Check", w: 64 }, { h: "Fails when", wrap: true, w: 280 }],
    rows: SOC_CHECKS,
    mine: () => false,
    steps: {},
    ident: [0],
    reads: { 1: ["vendors|SOC Report Review"] },
  },
  "T9.2": {
    code: "SOC-REV",
    title: "SOC-REV · SOC 2 review worksheet (template T-SOC) · Checks S1–S9",
    on: [2, 5],
    cols: [{ h: "Check", w: 64 }, { h: "Fails when", wrap: true, w: 260, prose: true }, { h: "Result", w: 110, opts: ["Pass", "Fail"] }],
    rows: SOC_CHECKS.map(([c, t]) => [c, t, ""]),
    mine: () => true,
    steps: { 2: [2] },
    ident: [0, 1],
    checkRows: { 2: { label: 0, col: 2 } },
    note: { 2: () => `Lumen's SOC 2 report summary, with your review date, is in Vendors › SOC Report Review. BKB-POL-013 Section 7.1 (Policies › Policy Library) says how each check is read and which line it reads; S7 and S9 also read Lumen's intake form (Vendors › Vendor Intake).` },
    reads: { 2: ["vendors|Vendor Intake"] },
    handIn: { step: 5, cols: [2], ident: [0] },
  },
  "T9.2 CUEC": {
    code: "SOC-REV CUECs",
    title: "SOC-REV · SOC 2 review worksheet · CUECs and their owners",
    on: [3, 5],
    cols: [{ h: "CUEC (Lumen's report)", wrap: true, w: 260 }, { h: "Internal owner", wrap: true, w: 180, opts: "step" }],
    rows: SOC.cuecs.map((c) => [c, ""]),
    mine: () => true,
    steps: { 3: [1] },
    ident: [0],
    checkRows: { 3: { label: 0, col: 1 } },
    note: { 3: () => "Each row is a CUEC from the CUECs line of Lumen's report: a control Lumen expects LearnTech to run. Ref-Conditions (Learn › Reference pages) names the internal owner of each kind of CUEC." },
    reads: { 3: ["learn|Reference pages"] },
    handIn: { step: 5, cols: [1], ident: [0] },
  },
  "T9.2 DEC": {
    code: "SOC-DEC",
    title: "SOC-DEC · Onboarding risk decision (rule R28)",
    on: [4, 5],
    cols: [
      { h: "Check", w: 64 },
      { h: "Check or decision", wrap: true, w: 240, prose: true },
      { h: "Under R28", wrap: true, w: 190, opts: (_d, r) => (r[0] === SOC_DEC ? ["Approve", "Approve with conditions", "Reject"] : ["Rejects on its own", "Needs a condition"]) },
    ],
    rows: [...SOC_CHECKS.map(([c, t]) => [c, t, ""]), [...SOC.decision, ""]],
    mine: () => true,
    steps: { 4: [2] },
    // Step 4 works on the checks step 2 found failing, and the decision; a passed check is recorded as such.
    only: { 4: (r, p) => r[0] === SOC_DEC || socBest(p, 2, r[0]) === "Fail" },
    derived: { 2: { from: [], value: (v, p) => (v(0) !== SOC_DEC && socBest(p, 2, v(0)) === "Pass" ? "Passed: no effect" : null) } },
    ident: [0, 1],
    checkRows: { 4: { label: 0, col: 2 } },
    note: { 4: (d, p) => `Rule R28 (Learn › Rule tables): ${d.rules.R28?.[1] ?? ""} The rows are the checks step 2 found failing${socBest(p, 2, "S1") ? "" : " (once step 2 is checked)"}; the last row is the decision. Ref-Conditions (Learn › Reference pages) gives each check's condition.` },
    reads: { 4: ["learn|Reference pages"] },
    handIn: { step: 5, cols: [2], ident: [0] },
  },
  // T10.1 (desk-step-builder, 30 Oct 2026). ROPA, template T-ROPA: the record (hand-in), each purpose's lawful basis (2),
  // the DPIA screening (5); DFM: each flow's shape and system (3), each transfer's mechanism (4).
  "T10.1 ENTRY": {
    code: "ROPA Record",
    title: "ROPA · RoPA entry (template T-ROPA) · Record of processing (GDPR Art.30)",
    on: [6],
    cols: [{ h: "Field", wrap: true, w: 150 }, { h: "Entry", wrap: true, w: 340 }],
    rows: ROPA.entry as string[][],
    mine: () => true,
    steps: {},
    ident: [0],
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T10.1": {
    code: "ROPA",
    title: "ROPA · RoPA entry (template T-ROPA) · Purposes and lawful basis",
    on: [2, 6],
    cols: [{ h: "Purpose (client's instructions)", wrap: true, w: 300 }, { h: "Lawful basis", wrap: true, w: 170, opts: "step" }],
    rows: ROPA.purposes.map((x) => [x, ""]),
    mine: () => true,
    steps: { 2: [1] },
    ident: [0],
    checkRows: { 2: { label: 0, col: 1 } },
    note: { 2: () => "Each row is a purpose from the client's processing instructions. BKB-POL-017 Section 3.1 (Policies › Policy Library) gives the lawful-basis questions, asked in order: the first yes gives the basis." },
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T10.1 DPIA": {
    code: "ROPA DPIA",
    title: "ROPA · RoPA entry · DPIA screening (rule R29)",
    on: [5, 6],
    cols: [{ h: "Trigger (rule R29)", wrap: true, w: 220 }, { h: "Your answer", w: 120, opts: "step" }],
    rows: ROPA.triggers.map((x) => [x, ""]),
    mine: () => true,
    steps: { 5: [1] },
    ident: [0],
    checkRows: { 5: { label: 0, col: 1 } },
    note: { 5: (d) => `Rule R29 (Learn › Rule tables): ${d.rules.R29?.[1] ?? ""} For each trigger, is it involved in the processing: Yes or No? The last row records whether a DPIA is required. The processing description is in Regulatory Watch › RoPA & Data Flows; BKB-POL-017 Section 6.2 (Policies › Policy Library) says what each trigger means.` },
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T10.1 DFM": {
    code: "DFM",
    title: "DFM · Data-flow map (T-ROPA shapes)",
    on: [3, 4, 6],
    cols: [
      { h: "Flow", w: 56 },
      { h: "What happens", wrap: true, w: 300, prose: true },
      { h: "Shape", w: 120, opts: ROPA.shapes },
      { h: "System (asset register)", wrap: true, w: 190 },
      { h: "Transfer mechanism (BKB-ADD-36 Section 2)", wrap: true, w: 240 },
      { h: "Evidence ref", wrap: true, w: 170 },
    ],
    rows: DFM_FLOWS.map(([f, x]) => [f, x, "", "", "", ""]),
    mine: () => true,
    steps: { 3: [2, 3], 4: [4] },
    // Step 4 works on the flows step 3 found to be transfers; the others record that they are not.
    only: { 4: (r, p) => dfmShape(p, r[0]) === "Transfer" },
    derived: {
      4: { from: [], value: (v, p) => { const s = dfmShape(p, v(0)); return s && s !== "Transfer" ? NOT_TRANSFER : null; } },
      // The section row the mechanism was copied from: written by the platform, never typed.
      5: { from: [4], quiet: true, value: (v) => { const m = v(4); if (!m) return ""; if (m === NOT_TRANSFER) return "—"; const r = add36Sec2().find((x) => same(x[5] ?? "", m)); return r ? `BKB-ADD-36 Section 2, ${officeOf(r[0])}` : ""; } },
    },
    cells: {
      // A copy of the asset register: only the name of the system the line describes, as the register writes it.
      3: {
        fix: (v, _r, _d, ri) => { const want = (ROPA.systems as Record<string, string>)[DFM_FLOWS[ri]?.[0]] ?? ""; return want && assetKey(v) === assetKey(want) ? want : null; },
        hint: (r) => (ASSET_NAMES.some((a) => assetKey(a) === assetKey(r[3] ?? "")) ? "That asset is not where this line happens: read the Description column of Risk Register › Asset Register again." : "Copy the Asset name as Risk Register › Asset Register writes it."),
      },
      // A copy of a Cross-border transfer cell of BKB-ADD-36 Section 2, word for word. Which office's row is checked with the rest.
      4: {
        fix: (v) => add36Sec2().find((x) => same(x[5] ?? "", v))?.[5] ?? null,
        hint: () => "Copy a Cross-border transfer cell of BKB-ADD-36 Section 2 word for word, from the row of the office the data leaves.",
      },
    },
    load: ["BKB-ADD-36"],
    ident: [0, 1],
    checkRows: { 3: { label: 0, col: 2 }, 4: { label: 0, col: 4 } },
    note: {
      3: () => "T-ROPA's four shapes: Collect, personal data comes into LearnTech from outside (a client or a person); System, it is kept or used in a LearnTech system; Transfer, it leaves the country of the office that holds it (BKB-POL-017 Section 3.1 says what counts); Delete, it is erased. The system names are in Risk Register › Asset Register, which lists LearnTech's Amsterdam and Mumbai assets.",
      4: (_d, p) => `BKB-POL-017 Section 3.1: personal data leaves the country of the office that holds it only under the mechanism BKB-ADD-36 Section 2 names for that office, the office the data leaves. The rows are the flows step 3 found to be transfers${dfmShape(p, "F1") ? "" : " (once step 3 is checked)"}. Section 2 is in Policies › Policy Library.`,
    },
    reads: { 3: ["risk|Asset Register"] },
    handIn: { step: 6, cols: [2, 3, 4, 5], ident: [0] },
  },
  // T10.2 (desk-step-builder, 30 Oct 2026). BRC-ASSESS, template T-BRC: the facts (1, 2), each regime's applicability (3) and
  // deadline with the earliest firm one (4), R30's data-subject test (5); BRC-PLAN, written by the platform from the checked
  // steps 3–6, handed in at 7. LI-IRBC: the phase sheet read (8, STUDY), the timeline's phases (9), BC and DR (10), handed in at 11.
  "T10.2 FACTS": {
    code: "BRC-ASSESS Facts",
    title: "BRC-ASSESS · Notification assessment (template T-BRC) · Facts of INC-2610-3001",
    on: [1, 2, 7],
    cols: [{ h: "Fact", wrap: true, w: 170 }, { h: "Value (incident record)", wrap: true, w: 300 }, { h: "Evidence ref", wrap: true, w: 170 }],
    rows: (BRC.facts as string[][]).map(([f]) => [f, "", ""]),
    mine: () => true,
    steps: { 1: [1], 2: [1] },
    only: { 1: (r) => r[0] === BRC_DISC, 2: (r) => r[0] !== BRC_DISC },
    // Where each value was read: the same record on every row, so written by the platform.
    derived: { 2: { from: [1], quiet: true, value: (v) => (v(1) ? "BRC-FACTS (incident record)" : "") } },
    cells: {
      // A copy of the incident record's line: only its value; a time in any of the usual forms, a list in any order.
      1: {
        fix: (v, r) => {
          const want = BRC_REC[r[0]] ?? "";
          if (r[0] === BRC_DISC) return utcTime(v) === want ? want : null;
          return want && sameParts(v, want) ? want : null;
        },
        hint: (r) => (r[0] === BRC_DISC ? "Copy the incident record's Discovered (UTC) line (Regulatory Watch › Breach Clock Calculator): its date, time and UTC." : `Copy the incident record's line ${r[0]} (Regulatory Watch › Breach Clock Calculator): every item, separated by ";".`),
      },
    },
    ident: [0],
    checkRows: { 2: { label: 0, col: 1 } },
    note: {
      1: () => "The incident record is in Regulatory Watch › Breach Clock Calculator; open it from the toolbar. Copy its discovery time as written, with the date and UTC: every deadline in step 4 counts from it.",
      2: () => "Copy the incident record's two lines (Regulatory Watch › Breach Clock Calculator): every office and every country, separated by \";\". In step 3, rule R30 looks up the regimes from them.",
    },
    handIn: { step: 7, cols: [1, 2], ident: [0] },
  },
  "T10.2": {
    code: "BRC-ASSESS",
    title: "BRC-ASSESS · Notification assessment (template T-BRC) · Regimes and deadlines (rule R30)",
    on: [3, 4, 7],
    cols: [
      { h: "Regime", wrap: true, w: 190 },
      { h: "Office (Section 2 row)", wrap: true, w: 130 },
      { h: "BKB-ADD-36 Section 2 says", wrap: true, w: 250, prose: true },
      { h: "Applies?", wrap: true, w: 170, opts: BRC.applies },
      { h: "Deadline (UTC)", wrap: true, w: 190 },
    ],
    rows: [...(BRC.regimes as string[][]).map((r) => [...r, "", ""]), [BRC.early, "Every engaged office", "BKB-POL-014 Section 3.1: the shortest applicable statutory clock governs", "", ""]],
    mine: () => true,
    steps: { 3: [3], 4: [4] },
    // Step 3 decides the regimes; step 4 dates the ones step 3 found to apply, and the earliest firm deadline.
    only: { 3: (r) => r[0] !== BRC.early, 4: (r, p) => r[0] === BRC.early || (!!brcBest(p, 3, r[0]) && brcBest(p, 3, r[0]) !== BRC_NOT) },
    derived: {
      3: { from: [], value: (v) => (v(0) === BRC.early ? "—" : null) },
      4: { from: [], value: (v, p) => (brcBest(p, 3, v(0)) === BRC_NOT ? "None: does not apply" : null) },
    },
    cells: { 4: { fix: (v) => utcTime(v), hint: () => "Write a deadline as the discovery time is written: date, time, UTC (2026-01-31 09:00 UTC)." } },
    ident: [0, 1, 2],
    checkRows: { 3: { label: 0, col: 3 }, 4: { label: 0, col: 4 } },
    note: {
      3: () => "Each row is a regime of BKB-ADD-36 Section 2: the office whose row it is in, and the column and words of its cell. BKB-POL-014 Section 6.3 (Policies › Policy Library) says which offices the incident engages and which of their regimes apply. The offices and countries are the ones you copied in step 2, from the incident record (Regulatory Watch › Breach Clock Calculator).",
      4: (_d, p) => {
        const cond = (BRC.regimes as string[][]).filter((r) => brcBest(p, 3, r[0]) === BRC_COND).map((r) => r[0]);
        return `Discovered: ${BRC_REC[BRC_DISC]}. Each deadline is the discovery time plus the clock in the row's Section 2 words; BKB-POL-014 Section 6.3, step 6 (Policies › Policy Library) says how to count. The rows are the regimes step 3 found to apply${cond.length ? `; ${cond.join(", ")} applies only if its condition is met, so its clock is not firm` : " (once step 3 is checked)"}. The last row is the earliest firm deadline.`;
      },
    },
    handIn: { step: 7, cols: [3, 4], ident: [0] },
  },
  "T10.2 TELL": {
    code: "BRC-ASSESS Data subjects",
    title: "BRC-ASSESS · Notification assessment · Tell data subjects? (rule R30)",
    on: [5, 7],
    cols: [{ h: "Condition (rule R30)", wrap: true, w: 220 }, { h: "Your answer", w: 120, opts: "step" }],
    rows: (BRC.tell as string[]).map((x) => [x, ""]),
    mine: () => true,
    steps: { 5: [1] },
    ident: [0],
    checkRows: { 5: { label: 0, col: 1 } },
    note: { 5: (d) => `Rule R30 (Learn › Rule tables): ${(d.rules.R30?.[1] ?? "").match(/Tell data subjects[^]*$/)?.[0] ?? ""} For each condition, is it met by INC-2610-3001: Yes or No? The last row records whether the data subjects must be told. The facts are in the incident record, Regulatory Watch › Breach Clock Calculator.` },
    handIn: { step: 7, cols: [1], ident: [0] },
  },
  "T10.2 PLAN": {
    code: "BRC-PLAN",
    title: "BRC-PLAN · Notification plan and breach-register entry (written from steps 2 to 6)",
    on: [7],
    cols: [{ h: "Field", wrap: true, w: 200 }, { h: "Entry", wrap: true, w: 380, prose: true }],
    rows: BRC.plan as string[][],
    mine: () => true,
    steps: {},
    derived: { 1: { from: [], value: (v, p) => brcPlan(v(0), p) } },
    ident: [0],
    handIn: { step: 7, cols: [1], ident: [0] },
  },
  "T10.2 PH": {
    code: "LI-IRBC Phases",
    title: "LI-IRBC · Incident life-cycle and continuity decision (template T-LI-IRBC) · Phases (rule L20)",
    on: [8],
    cols: [{ h: "Phase", wrap: true, w: 140 }, { h: "Annex A control", w: 110 }, { h: "What it covers (BKB-POL-014)", wrap: true, w: 360, prose: true }],
    rows: BRC.phases as string[][],
    mine: () => false,
    steps: {},
    ident: [0],
  },
  "T10.2 EVT": {
    code: "LI-IRBC Timeline",
    title: "LI-IRBC · Incident life-cycle · Timeline of INC-2610-3001 (UTC)",
    on: [9, 11],
    cols: [{ h: "Event", w: 56 }, { h: "Time (UTC)", wrap: true, w: 130 }, { h: "What happened", wrap: true, w: 320, prose: true }, { h: "Phase (L20)", wrap: true, w: 170, opts: "step" }],
    rows: (BRC.events as string[][]).map((e) => [...e, ""]),
    mine: () => true,
    steps: { 9: [3] },
    ident: [0, 1, 2],
    checkRows: { 9: { label: 0, col: 3 } },
    note: { 9: () => `Rule L20's five phases, as LI-IRBC's Phases sheet (step 8) gives them. ${(BRC.phases as string[][]).slice(0, 5).map(([ph, c, w]) => `${ph} (${c}): ${w}.`).join(" ")} BKB-POL-014 is in Policies › Policy Library.` },
    handIn: { step: 11, cols: [3], ident: [0] },
  },
  "T10.2 BCDR": {
    code: "LI-IRBC BC/DR",
    title: "LI-IRBC · Incident life-cycle and continuity decision · BC and DR (rule L20)",
    on: [10, 11],
    cols: [{ h: "Plan", w: 90 }, { h: "What it does", wrap: true, w: 260 }, { h: "Your decision", wrap: true, w: 150, opts: "step" }],
    rows: (BRC.bcdr as string[][]).map((b) => [...b, ""]),
    mine: () => true,
    steps: { 10: [2] },
    ident: [0, 1],
    checkRows: { 10: { label: 0, col: 2 } },
    note: { 10: (d) => `Rule L20 (Learn › Rule tables): ${(d.rules.L20?.[1] ?? "").match(/Invoke the DR[^]*$/)?.[0] ?? ""} The incident record (Regulatory Watch › Breach Clock Calculator) says which system was down, and for how long. BKB-ADD-36 (Policies › Policy Library) Sections 8 and 8.1 say which assets are Mission Critical; Section 8.2 gives each critical process of the Amsterdam office, the system it runs on and its RTO.` },
    handIn: { step: 11, cols: [2], ident: [0] },
  },
  // T11.1 (desk-step-builder, 30 Oct 2026). AWR-PLAN: each week's activity (1); AWR-LESSON: the card and behaviours (written
  // from D1) and each quiz question's behaviour (3); AWR-SIM: its fields (written from steps 1, 2 and 4) and each metric's
  // target (5); all handed in at 6. Ref-Clause map read (7, STUDY); LI-COMM: each role holder's competence (8) and each
  // communication's week (9), handed in at 10.
  "T11.1": {
    code: "AWR-PLAN",
    title: "AWR-PLAN · Campaign plan (template T-AWR) · Four weeks (rule R31)",
    on: [1, 6],
    cols: [{ h: "Week", w: 80 }, { h: "Activity (R31)", w: 210, opts: AWRD.activities }],
    rows: (AWRD.weeks as string[][]).map(([wk]) => [wk, ""]),
    mine: () => true,
    steps: { 1: [1] },
    ident: [0],
    checkRows: { 1: { label: 0, col: 1 } },
    note: { 1: () => `The campaign on “${AWRD.theme}” for ${AWRD.audience}, ${AWRD.office}, runs four weeks. Rule R31 (Learn › Rule tables) sets what each week carries, in order.` },
    reads: { 1: ["learn|Rule tables"] },
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T11.1 LESSON": {
    code: "AWR-LESSON",
    title: "AWR-LESSON · Micro-lesson · Scenario and behaviours (written from step 2)",
    on: [6],
    cols: [{ h: "Field", wrap: true, w: 170 }, { h: "Entry", wrap: true, w: 380, prose: true }],
    rows: AWRD.lesson as string[][],
    mine: () => true,
    steps: {},
    derived: { 1: { from: [], value: (v, p) => (v(0) === "Scenario card (step 2)" ? awrPick(p, "T11.1-D1", AWRD.cards) : "") } },
    ident: [0],
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T11.1 QUIZ": {
    code: "AWR-LESSON Quiz",
    title: "AWR-LESSON · Micro-lesson and newsletter post · Check questions (Ref-Content)",
    on: [3, 6],
    cols: [{ h: "Question", wrap: true, w: 230 }, { h: "Answer (Ref-Content)", wrap: true, w: 170 }, { h: "Behaviour it checks", wrap: true, w: 260, opts: [...(AWRD.behaviours as string[])].sort() }],
    rows: (AWRD.quiz as string[][]).map(([q, a]) => [q, a, ""]),
    mine: () => true,
    steps: { 3: [2] },
    ident: [0],
    checkRows: { 3: { label: 0, col: 2 } },
    note: { 3: (_d, p) => `Scenario card (step 2): “${awrPick(p, "T11.1-D1", AWRD.cards) || "once step 2 is checked"}”. Each question checks one of the theme's three behaviours, the choices of each row. Ref-Content (Learn › Reference pages) gives each question with its answer in brackets, in the row of “${AWRD.theme}”.` },
    reads: { 3: ["learn|Reference pages"] },
    handIn: { step: 6, cols: [1, 2], ident: [0] },
  },
  "T11.1 SIM": {
    code: "AWR-SIM",
    title: "AWR-SIM · Phishing simulation plan (platform form)",
    on: [6],
    cols: [{ h: "Field", wrap: true, w: 200 }, { h: "Entry", wrap: true, w: 380, prose: true }],
    rows: AWRD.sim as string[][],
    mine: () => true,
    steps: {},
    derived: { 1: { from: [], value: (v, p) => awrSim(v(0), p) } },
    ident: [0],
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T11.1 MET": {
    code: "AWR-SIM Metrics",
    title: "AWR-SIM · Phishing simulation plan · Metrics and targets (the campaign's measures)",
    on: [5, 6],
    cols: [{ h: "Metric", w: 110 }, { h: "Target", w: 130 }, { h: "How it is measured (BKB-POL-020 Section 7.1)", wrap: true, w: 300, prose: true }],
    rows: (AWRD.metrics as string[][]).map(([m, f]) => [m, "", f]),
    mine: () => true,
    steps: { 5: [1] },
    ident: [0],
    cells: { 1: { fix: (v) => pctTarget(v), hint: () => "Write a target as its source writes it: “≤” or “≥”, the number and “%” (you may type <= or >=)." } },
    checkRows: { 5: { label: 0, col: 1 } },
    note: { 5: () => "Click rate: its target is the KRI of the Amsterdam register's phishing risk (Risk Register › Heat Map with KRIs). Report rate: its target is in BKB-POL-020 Section 7.1 (Policies › Policy Library). Write each as its source writes it: “≤” or “≥”, the number and “%”. The formulas are written for you." },
    reads: { 5: ["risk|Heat Map with KRIs"] },
    handIn: { step: 6, cols: [1, 2], ident: [0] },
  },
  "T11.1 CL": {
    code: "Ref-Clause map",
    title: "Ref-Clause map · ISO/IEC 27001 clauses 5.1 and 7.2–7.4",
    on: [7],
    cols: [{ h: "Clause", w: 64 }, { h: "Title", wrap: true, w: 150 }, { h: "Your deliverables that evidence it", wrap: true, w: 250 }, { h: "Mandatory documented information", wrap: true, w: 170 }],
    rows: AWRD.clauses as string[][],
    mine: () => false,
    steps: {},
    ident: [0],
  },
  "T11.1 COMP": {
    code: "LI-COMM Competence",
    title: "LI-COMM · Competence matrix (template T-LI-COMM, rule L21)",
    on: [8, 10],
    cols: [
      { h: "Role", w: 110 },
      { h: "Holder (Amsterdam)", wrap: true, w: 170 },
      { h: "Required competence (Ref-Competence)", wrap: true, w: 260, prose: true },
      { h: "Evidence retained (Ref-Competence)", wrap: true, w: 240, prose: true },
      { h: "Record on file (HR training records)", wrap: true, w: 260, prose: true },
      { h: "Competence shown? (clause 7.2)", wrap: true, w: 190, opts: AWRD.status },
    ],
    rows: (AWRD.competence as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: { 8: [5] },
    ident: [0, 1, 3, 4],
    checkRows: { 8: { label: 0, col: 5 } },
    note: { 8: () => "Rule L21: the rows are Ref-Competence's three roles, copied for you, each with its Amsterdam holder and the holder's record on file in HR's training records. Clause 7.2 asks for evidence of competence to be kept: is everything Evidence retained asks for on file?" },
    handIn: { step: 10, cols: [1, 2, 3, 4, 5], ident: [0] },
  },
  "T11.1 COMMS": {
    code: "LI-COMM Communication",
    title: "LI-COMM · ISMS communication plan (rule L21)",
    on: [9, 10],
    cols: [
      { h: "Message", wrap: true, w: 210 },
      { h: "Audience", wrap: true, w: 150 },
      { h: "When", wrap: true, w: 150 },
      { h: "Channel", wrap: true, w: 170 },
      { h: "Who communicates", wrap: true, w: 170 },
      { h: "Feedback", wrap: true, w: 150 },
      { h: "Programme event", wrap: true, w: 230, prose: true },
      { h: "Week (Home › Calendar)", wrap: true, w: 170, opts: AWRD.weekOpts },
    ],
    rows: (AWRD.comms as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: { 9: [7] },
    ident: [0, 2, 6],
    checkRows: { 9: { label: 0, col: 7 } },
    note: { 9: () => "Rule L21: the six ISMS communications are copied from Ref-Communications for you. Date each by the week of its programme event: Home › Calendar gives the tasks of each week and the day it opens." },
    reads: { 9: ["home|Calendar"] },
    handIn: { step: 10, cols: [1, 2, 3, 4, 5, 6, 7], ident: [0] },
  },

  // T11.2 (desk-step-builder, 30 Oct 2026). Regulation Tracker: each office's authority checked against BKB-ADD-36 Section 2 (1).
  // Add Update: the monitoring results sorted (2, part 2 of D1); the two sources' dates logged (3). REG-BRIEF: source 1's key
  // points (4, part 2 of D2) and source 2's paragraphs (5) sorted into duties and background; applicability office by office
  // (6); the Impact Log maps each duty to its policy (7); each action's owner (8, part 2 of D5); handed in at 9. LI-CHG (LI-16):
  // topic type (10), ISMS elements (11), layers (12), new-technology note (13), handed in at 14.
  "T11.2": {
    code: "Regulation Tracker",
    title: "Regulatory Watch › Regulation Tracker · LearnTech's offices",
    on: [1],
    cols: [{ h: "Office", w: 170 }, { h: "Authority on the tracker", wrap: true, w: 200 }, { h: "Against BKB-ADD-36 Section 2", wrap: true, w: 200, opts: REGD.trkOpts }],
    rows: (REGD.tracker as string[][]).map(([o, a]) => [o, a, ""]),
    mine: () => true,
    steps: { 1: [2] },
    ident: [0, 1],
    checkRows: { 1: { label: 0, col: 2 } },
    note: { 1: () => "The Regulation Tracker's rows for LearnTech's four offices. Compare each office's authority with the Authority column of its row in BKB-ADD-36 Section 2 (Policies › Policy Library)." },
    readHow: { 1: "Find each office's row and read its Authority column." },
  },
  "T11.2 FEED": {
    code: "Add Update Results",
    title: "Regulatory Watch › Add Update · This month's monitoring results",
    on: [2],
    cols: [{ h: "Publisher", wrap: true, w: 170 }, { h: "Title", wrap: true, w: 230 }, { h: "Web address", wrap: true, w: 220, prose: "always" }, { h: "Date", w: 120 }, { h: "Official source?", wrap: true, w: 190, opts: REGD.feedOpts }],
    rows: (REGD.feed as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: { 2: [4] },
    ident: [0, 1, 2],
    checkRows: { 2: { label: 1, col: 4 } },
    then: { 2: "Sort the monitoring results" },
    note: { 2: () => `This month's monitoring results for “${REGD.topic}”. For each, decide whether it is an official source: the body that issued the rule or its guidance, or the official journal that publishes it.` },
  },
  "T11.2 SRC": {
    code: "REG-BRIEF Sources",
    title: "REG-BRIEF · Sources (logged on Regulatory Watch › Add Update)",
    on: [3, 9],
    cols: [{ h: "Field", w: 130 }, { h: "Source 1 (European Commission)", wrap: true, w: 260, prose: true }, { h: "Source 2 (EUR-Lex)", wrap: true, w: 260, prose: true }],
    rows: [
      ["Title", REGD.src.s1.title, REGD.src.s2.title],
      ["Web address", REGD.src.s1.url, REGD.src.s2.url],
      ["Published", "", ""],
      ["Applies from", "", ""],
      ["Accessed", "", ""],
    ],
    mine: () => true,
    steps: { 3: [1, 2] },
    ident: [0],
    cells: { 1: srcDate("s1"), 2: srcDate("s2") },
    note: { 3: () => "Source 1 is the European Commission's page, source 2 the Regulation on EUR-Lex; their saved copies are in Policies › Policy Library. Titles and addresses are written for you. Type each date as 1 March 2024 or 2024-03-01; Accessed is the date you read the source, today." },
    readHow: { 3: "Section 1 of each saved copy: the Published line, and the line that says when the duties apply." },
    handIn: { step: 9, cols: [1, 2], ident: [0] },
  },
  "T11.2 OB1": {
    code: "REG-BRIEF Source 1",
    title: "REG-BRIEF · What source 1 asks: its key points",
    on: [4, 9],
    cols: [{ h: "Key point", w: 90 }, { h: "Text (source 1, Section 2)", wrap: true, w: 420, prose: true }, { h: "Duty or background?", wrap: true, w: 170, opts: REGD.dutyOpts }],
    rows: (REGD.s1 as string[][]).map(([k, t]) => [k, t, ""]),
    mine: () => true,
    steps: { 4: [2] },
    ident: [0, 1],
    checkRows: { 4: { label: 0, col: 2 } },
    then: { 4: "Sort source 1's key points" },
    note: { 4: () => "Source 1's ten key points, from Section 2 of its saved copy (Policies › Policy Library). A duty says what the platform must do; background says who, when, why, or what happens next." },
    handIn: { step: 9, cols: [2], ident: [0] },
  },
  "T11.2 OB2": {
    code: "REG-BRIEF Source 2",
    title: "REG-BRIEF · What source 2 asks: Articles 19 and 28",
    on: [5, 9],
    cols: [{ h: "Paragraph", w: 110 }, { h: "Text (Regulation (EU) 2022/2065)", wrap: true, w: 420, prose: true }, { h: "Duty or background?", wrap: true, w: 170, opts: REGD.dutyOpts }],
    rows: (REGD.s2 as string[][]).map(([k, t]) => [k, t, ""]),
    mine: () => true,
    steps: { 5: [2] },
    ident: [0, 1],
    checkRows: { 5: { label: 0, col: 2 } },
    note: { 5: () => "Source 2's paragraphs, as published: Article 19(1) and Article 28 of Regulation (EU) 2022/2065 (its saved copy, Policies › Policy Library). A duty binds the provider. A paragraph that limits a duty, sets its scope or gives someone else a power is background, even when it says “shall”." },
    handIn: { step: 9, cols: [2], ident: [0] },
  },
  "T11.2 APP": {
    code: "REG-BRIEF Applicability",
    title: "REG-BRIEF · Who it affects: applicability by office (BKB-POL-016 Section 7.2)",
    on: [6, 9],
    cols: [{ h: "Office", w: 160 }, { h: "Country", wrap: true, w: 130 }, { h: "What the office runs (REG-EXTRA)", wrap: true, w: 380, prose: true }, { h: "Do the guidelines apply?", wrap: true, w: 170, opts: REGD.appOpts }],
    rows: (REGD.offices as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: { 6: [3] },
    ident: [0, 1, 2],
    checkRows: { 6: { label: 0, col: 3 } },
    note: { 6: () => `${REGD.headcount} Each office's line is from REG-EXTRA (Inbox, from the Policy & Governance Analyst). Apply the three tests of BKB-POL-016 Section 7.2 to each office: reach, activity and threshold. Source 1's key point 2 says whom the guidelines cover.` },
    readHow: { 6: "BKB-POL-016 Section 7.2: the three tests, in order. Source 1's Section 2, key point 2: whom the guidelines cover." },
    handIn: { step: 9, cols: [3], ident: [0] },
  },
  "T11.2 IMP": {
    code: "Impact Log",
    title: "REG-BRIEF · Impact Log: duty → BKB policy → control (rule R32)",
    on: [7, 9],
    cols: [
      { h: "Duty", w: 110 },
      { h: "Text", wrap: true, w: 380, prose: true },
      { h: "BKB policy (Ref-Keywords)", wrap: true, w: 200, opts: REGD.policies },
      { h: "Annex A / clause (Ref-Keywords)", wrap: true, w: 170 },
    ],
    rows: (REGD.duties as string[][]).map(([k, , t]) => [k, t, "", ""]),
    reads: { 7: ["learn|Reference pages"] },
    mine: () => true,
    steps: { 7: [2] },
    ident: [0, 1],
    checkRows: { 7: { label: 0, col: 2 } },
    derived: { 3: { from: [2], value: (v) => (v(2) ? (v(2) === GAP ? "—" : ((REGD.control as Record<string, string>)[v(2)] ?? "")) : "") } },
    note: { 7: () => "The eight duties of steps 4 and 5. For each, find a key word of Ref-Keywords (Learn › Reference pages) that the duty uses, the word or its plural, and choose that row's policy; its Annex A controls are written for you. A duty that uses none of the key words: No BKB policy (gap)." },
    handIn: { step: 9, cols: [2, 3], ident: [0] },
  },
  "T11.2 ACT": {
    code: "REG-BRIEF Actions",
    title: "REG-BRIEF · What we must do: actions (rule R32)",
    on: [8, 9],
    cols: [{ h: "Affected policy", wrap: true, w: 170 }, { h: "Owner (BKB-POL-000)", wrap: true, w: 230, opts: REGD.ownerOpts }, { h: "Action (R32)", wrap: true, w: 360, prose: true }],
    rows: (REGD.affected as string[]).map((x) => [x, "", ""]),
    mine: () => true,
    steps: { 8: [1] },
    ident: [0],
    checkRows: { 8: { label: 0, col: 1 } },
    then: { 8: "Choose each action's owner" },
    derived: { 2: { from: [1], value: (v) => (!v(1) ? "" : v(0) === GAP ? `${v(1)} drafts a policy statement for the duty no BKB policy covers, by ${longDate(REGD.due)}` : `${v(1)} updates ${v(0)} by ${longDate(REGD.due)}`) } },
    note: { 8: () => `Each policy the Impact Log found (step 7) gets one action. Rule R32 dates every action from source 1's publication date (${longDate(REGD.src.s1.published)}): ${longDate(REGD.due)}, already past, so the brief reports these actions as overdue. Choose each owner from BKB-POL-000 (Policies › Policy Library): Section 3 gives each policy's owner, Section 7 who drafts a new statement.` },
    readHow: { 8: "BKB-POL-000 Section 3: the Owner column of each policy. Section 7: who drafts." },
    handIn: { step: 9, cols: [1, 2], ident: [0] },
  },
  "T11.2 TYPE": {
    code: "LI-CHG Change",
    title: "LI-CHG · ISMS change impact note (template T-LI-CHG) · The change",
    on: [10, 14],
    cols: [{ h: "Change", wrap: true, w: 300 }, { h: "Topic type (Ref-Change types)", wrap: true, w: 300, opts: REGD.types }],
    rows: [[REGD.topic, ""]],
    reads: { 10: ["learn|Reference pages"] },
    mine: () => true,
    steps: { 10: [1] },
    ident: [0],
    checkRows: { 10: { label: 0, col: 1 } },
    note: { 10: () => "Ref-Change types (Learn › Reference pages) gives five topic types. A change takes the type of the law it comes from: Section 1 of source 2's saved copy (Policies › Policy Library) gives that law's full title." },
    handIn: { step: 14, cols: [1], ident: [0] },
  },
  "T11.2 ELEM": {
    code: "LI-CHG Elements",
    title: "LI-CHG · ISMS elements the change affects (rule L22)",
    on: [11, 14],
    cols: [{ h: "ISMS element", w: 150 }, { h: "Affected by the change?", wrap: true, w: 200, opts: REGD.elemOpts }],
    rows: (REGD.elements as string[]).map((e) => [e, ""]),
    reads: { 11: ["learn|Reference pages"] },
    mine: () => true,
    steps: { 11: [1] },
    ident: [0],
    checkRows: { 11: { label: 0, col: 1 } },
    note: { 11: (_d, p) => `Topic type (step 10): “${regBest(p, 10, REGD.topic) || "once step 10 is checked"}”. Rule L22: mark as affected each ISMS element its row of Ref-Change types (Learn › Reference pages) lists.` },
    handIn: { step: 14, cols: [1], ident: [0] },
  },
  "T11.2 LAYER": {
    code: "LI-CHG Architecture",
    title: "LI-CHG · Affected systems on the BKB-TECH-000 layers (rule L22)",
    on: [12, 14],
    cols: [{ h: "System (Cap ID)", w: 110 }, { h: "Capability", wrap: true, w: 200 }, { h: "Why it is affected", wrap: true, w: 300, prose: true }, { h: "Layer (BKB-TECH-000)", wrap: true, w: 180, opts: REGD.layers }],
    rows: (REGD.systems as string[][]).map((r) => [...r, ""]),
    reads: { 12: ["learn|Reference pages"] },
    mine: () => true,
    steps: { 12: [3] },
    ident: [0, 1, 2],
    checkRows: { 12: { label: 0, col: 3 } },
    note: { 12: () => "The five LearnTech systems that carry the new duties, and why. Rule L22: find each in TSA-36 Technology_Stack (Learn › Reference pages) by its Cap ID and read its Domain; BKB-TECH-000 Section 3 (Policies › Policy Library) gives the layer of each Domain." },
    readHow: { 12: "BKB-TECH-000 Section 3: the layer of each Technology_Stack Domain, in its last column." },
    handIn: { step: 14, cols: [3], ident: [0] },
  },
  "T11.2 NOTE": {
    code: "LI-CHG New technology",
    title: "LI-CHG · New-technology note (rule L22)",
    on: [13, 14],
    cols: [{ h: "Change", wrap: true, w: 200 }, { h: "Topic type (step 10)", wrap: true, w: 220, prose: true }, { h: "New-technology note (Ref-Change types)", wrap: true, w: 320, opts: REGD.notes }],
    rows: [[REGD.topic, "", ""]],
    reads: { 13: ["learn|Reference pages"] },
    mine: () => true,
    steps: { 13: [2] },
    ident: [0, 1],
    checkRows: { 13: { label: 0, col: 2 } },
    derived: { 1: { from: [], value: (_v, p) => regBest(p, 10, REGD.topic) } },
    note: { 13: (_d, p) => `Topic type (step 10): “${regBest(p, 10, REGD.topic) || "once step 10 is checked"}”. LI-CHG records the new-technology note Ref-Change types (Learn › Reference pages) lists in that type's row.` },
    handIn: { step: 14, cols: [1, 2], ident: [0] },
  },

  // T12.1 (desk-step-builder, 30 Oct 2026). All in Risk Register › Mitigation Tracker. T-ACT's read-me (1, STUDY); the closure
  // tests of each action reported Closed (2, R33 walked in order); the code of each reopened one (3); the open actions: escalation
  // (4), days past due (5), what each owner must send (6); ACT-MRI's counts (7, STUDY); ACT-UPD, the updated tracker, with the
  // repeat issues (9, part 2 of D5), handed in with ACT-MRI at 10. LI-MR (LI-17): the 9.3.2 inputs (12), the objectives (13),
  // Stage 1 readiness (14), the audit programme (written from D6 and the tracker), handed in at 15.
  "T12.1": {
    code: "T-ACT Read me",
    title: "ACT-UPD · How the tracker reads (template T-ACT)",
    on: [1],
    // Narrow least widths: on a phone both columns fit the screen (the third question clicks the second).
    cols: [{ h: "Column", wrap: true, w: 100 }, { h: "What it records", wrap: true, w: 220 }],
    rows: ACTD.readme as string[][],
    mine: () => false,
    steps: {},
    ident: [0],
  },
  "T12.1 CT": {
    code: "ACT-UPD Closure tests",
    title: "ACT-UPD · Closure tests (rule R33) · actions reported Closed",
    on: [2],
    cols: [
      { h: "Action", w: 70 }, { h: "Issue", wrap: true, w: 200, prose: true }, { h: "Owner", wrap: true, prose: true }, { h: "Raised" }, { h: "Closure evidence date", wrap: true },
      { h: "Evidence type", wrap: true, w: 150 }, { h: "Re-test", wrap: true }, { h: "Closure tests (R33)", wrap: true },
    ],
    rows: ACT_CLOSED.map((r) => [r[0], r[2], r[3], r[4], r[7], r[8], r[9], ""]),
    mine: () => true,
    steps: { 2: [7] },
    ident: [0],
    checklist: { 2: { page: "", checks: () => ACTD.tests as string[][], col: 7, reads: { K1: [4, 5], K2: [3, 4], K3: 5, K4: 6 }, pass: "Pass", fail: "Fail", head: [0, 1] } },
    checkRows: { 2: { label: 0, col: 7 } },
    note: { 2: () => `The ${ACT_CLOSED.length} actions their owners report Closed. Rule R33 (Learn › Rule tables) tests each in order: evidence attached, dated after raising, a system record, re-test passed. The first test that fails reopens the action. An empty cell is no evidence.` },
    reads: { 2: ["learn|Rule tables"] },
  },
  "T12.1 ST": {
    code: "ACT-UPD Status",
    title: "ACT-UPD · Status of each reopened action (rule R33)",
    on: [3],
    cols: [
      { h: "Action", w: 70 }, { h: "Issue", wrap: true, w: 180, prose: true }, { h: "Raised" }, { h: "Closure evidence date", wrap: true }, { h: "Evidence type", wrap: true, w: 150 },
      { h: "Re-test", wrap: true }, { h: "Status after your tests (R33)", wrap: true, w: 170, opts: "step" },
    ],
    rows: ACT_CLOSED.map((r) => [r[0], r[2], r[4], r[7], r[8], r[9], ""]),
    mine: () => true,
    steps: { 3: [6] },
    only: { 3: (r, p) => actBest(p, 2, r[0]) === "Fail" },
    view: { 3: [1, 2, 3, 4, 5] },
    ident: [0],
    checkRows: { 3: { label: 0, col: 6 } },
    note: { 3: (_d, p) => (p.rowChecks?.["T12.1-2"] ? "The actions that failed a closure test in step 2: each is Open again. Record the code of the test that fails: K1 evidence attached, K2 dated after raising, K3 a system record, K4 re-test passed. Rule R33 reads them in that order and records the first that fails." : "This step opens once step 2's answers are checked.") },
    reads: { 3: ["learn|Rule tables"] },
  },
  "T12.1 OPEN": {
    code: "ACT-UPD Open actions",
    title: "ACT-UPD · Open actions: escalation, days past due, what closes them",
    on: [4, 5, 6],
    cols: [
      { h: "Action", w: 70 }, { h: "Owner", wrap: true, w: 130, prose: true }, { h: "Issue", wrap: true, w: 180, prose: true }, { h: "Status after your tests", wrap: true, w: 130 }, { h: "Due" }, { h: "Escalated", wrap: true },
      { h: "Escalate? (R33)", wrap: true, w: 190, opts: "step" },
      { h: "Days past due at 23 Dec 2026", wrap: true, w: 110 },
      { h: "Next check date (R33)", wrap: true },
      { h: "Ask the owner for", wrap: true, w: 220, opts: ACTD.requests as string[] },
      { h: "Request to the owner", wrap: true, w: 320, prose: true },
    ],
    rows: ACT_T.map((r) => [r[0], r[3], r[2], "", r[5], r[10], "", "", "", "", ""]),
    mine: () => true,
    steps: { 4: [6], 5: [7], 6: [9] },
    only: { 4: (r, p) => actOpen(p, r), 5: (r, p) => actOpen(p, r), 6: (r, p) => actReopened(p, r) },
    view: { 4: [1, 3, 4, 5], 5: [4], 6: [2, 3] },
    ident: [0],
    derived: {
      3: { from: [], value: (v, p) => { const r = actRow(v(0)); return r[6] === "Open" ? "Open (owner reports)" : actStatus(p, r); } },
      8: { from: [7], value: (v) => (v(7) ? actNext : "") },
      9: { from: [], value: (v, p) => { const r = actRow(v(0)); return r[6] === "Open" || actBest(p, 2, r[0]) === "Pass" ? "—" : null; } },
      10: { from: [9], value: (v) => (v(9) === "—" ? "—" : actRequest(v(0), v(2), v(9))) },
    },
    cells: { 7: actDays },
    checkRows: { 4: { label: 0, col: 6 }, 5: { label: 0, col: 7 }, 6: { label: 0, col: 9 } },
    note: {
      4: (_d, p) => (p.rowChecks?.["T12.1-3"] ? "Every action open after your tests: those their owners report Open, and those your tests reopened. Rule R33: an open action more than 14 days past its due date at the test date, 23 December 2026, and not escalated yet, goes to the owner's manager (K5)." : "This step opens once steps 2 and 3 are checked."),
      5: (_d, p) => (p.rowChecks?.["T12.1-3"] ? `Type the days from each open action's due date to the test date, 23 December 2026: 0 where the due date has not passed. The next check date is the test date + 14 days (rule R33), ${actNext}, written for you.` : "This step opens once steps 2 and 3 are checked."),
      6: (_d, p) => (p.rowChecks?.["T12.1-3"] ? "Each action your tests reopened goes back to its owner. Choose what the owner must send: what the test it failed needs. The request is written for you in the Evidence request frame (Learn & Grow › Sentence frames), due by the next check date." : "This step opens once steps 2 and 3 are checked."),
    },
    reads: { 4: ["learn|Rule tables"], 6: ["learn|Rule tables"] },
  },
  "T12.1 ALL": {
    code: "ACT-UPD",
    title: "ACT-UPD · Updated action tracker (template T-ACT)",
    on: [9, 10],
    cols: [
      { h: "Action", w: 70 }, { h: "Source task" }, { h: "Issue", wrap: true, w: 200 }, { h: "Owner", wrap: true, w: 130 }, { h: "Due" },
      { h: "Status after your tests", wrap: true, w: 130 }, { h: "Escalation (K5)", wrap: true, w: 150 }, { h: "Days past due", wrap: true }, { h: "Next check date", wrap: true },
      { h: "Request to the owner", wrap: true, w: 300, prose: true }, { h: "Repeat issue?", wrap: true, w: 150, opts: ["Repeat issue", "Single action"] },
    ],
    rows: ACT_T.map((r) => [r[0], r[1], r[2], r[3], r[5], "", "", "", "", "", ""]),
    mine: () => true,
    steps: { 9: [10] },
    ident: [0, 2],
    derived: {
      5: { from: [], quiet: true, value: (v, p) => actStatus(p, actRow(v(0))) },
      6: { from: [], quiet: true, value: (v, p) => { const s = actStatus(p, actRow(v(0))); const e = actBest(p, 4, v(0)); return s === "Closed — verified" ? "—" : !e ? "" : e.startsWith("Escalate") ? "Escalated to the owner's manager" : "Not escalated"; } },
      7: { from: [], quiet: true, value: (v, p) => (actStatus(p, actRow(v(0))) === "Closed — verified" ? "—" : actBest(p, 5, v(0))) },
      8: { from: [], quiet: true, value: (v, p) => { const s = actStatus(p, actRow(v(0))); return s === "Closed — verified" ? "—" : s ? actNext : ""; } },
      9: { from: [], quiet: true, value: (v, p) => { const r = actRow(v(0)); return r[6] === "Open" || actBest(p, 2, r[0]) === "Pass" ? "—" : actRequest(r[0], r[2], actBest(p, 6, r[0])); } },
    },
    checkRows: { 9: { label: 0, col: 10 } },
    then: { 9: "Mark the repeat issues" },
    note: { 9: () => `ACT-UPD, the updated tracker: all ${ACT_T.length} actions. Read down the Issue column and mark each action whose issue is on another action too, whatever its status.` },
    handIn: { step: 10, cols: [5, 6, 7, 8, 9, 10], ident: [0] },
  },
  "T12.1 MRI": {
    code: "ACT-MRI Counts",
    title: "ACT-MRI · Management-review input: action status (counts)",
    on: [7],
    cols: [{ h: "Line", wrap: true, w: 260 }, { h: "Count", w: 90 }],
    rows: [["Reported closed by their owners", String(ACT_CLOSED.length)], ["Closed — verified", ""], ["Reopened by your closure tests", ""], ["Open", ""], ["Past their due date at 23 December 2026", ""], ["Escalated to the owner's manager (K5)", ""]],
    mine: () => false,
    steps: {},
    ident: [0],
    derived: { 1: { from: [], value: (v, p) => actCount(v(0), p) } },
    note: { 7: (_d, p) => (actChecked(p, 2, 3, 4, 5) ? `ACT-MRI's counts, refreshed from your checked steps 2 to 5: the tracker as your tests found it on ${longDate(ACTD.test)}, not as the owners report it.` : "The counts fill in once steps 2 to 5 are checked.") },
  },
  "T12.1 MRIH": {
    code: "ACT-MRI Counts (hand-in)",
    title: "ACT-MRI · Management-review input: action status (counts)",
    on: [],
    cols: [{ h: "Line", wrap: true, w: 260 }, { h: "Count", w: 90 }],
    rows: [["Reported closed by their owners", String(ACT_CLOSED.length)], ["Closed — verified", ""], ["Reopened by your closure tests", ""], ["Open", ""], ["Past their due date at 23 December 2026", ""], ["Escalated to the owner's manager (K5)", ""]],
    mine: () => true,
    steps: {},
    ident: [0],
    derived: { 1: { from: [], value: (v, p) => actCount(v(0), p) } },
    handIn: { step: 10, cols: [1], ident: [0] },
  },
  "T12.1 OVD": {
    code: "ACT-MRI Overdue",
    title: "ACT-MRI · Overdue actions (from steps 4 and 5)",
    on: [],
    cols: [{ h: "Line", w: 150 }, { h: "Action · issue · owner · days past due", wrap: true, w: 420, prose: true }],
    rows: [1, 2, 3, 4, 5].map((i) => [`Overdue action ${i}`, ""]),
    mine: () => true,
    steps: {},
    ident: [0],
    derived: { 1: { from: [], value: (v, p) => actOverdue(Number(v(0).slice(-1)) - 1, p) } },
    handIn: { step: 10, cols: [1], ident: [0] },
  },
  "T12.1 REP": {
    code: "ACT-MRI Repeat issues",
    title: "ACT-MRI · Issues on more than one action (from step 9)",
    on: [],
    cols: [{ h: "Issue", wrap: true, w: 260 }, { h: "Actions", wrap: true, w: 260 }],
    rows: ACT_ISSUES.map((i) => [i, ""]),
    mine: () => true,
    steps: {},
    ident: [0],
    derived: { 1: { from: [], value: (v, p) => { const ids = ACT_T.filter((r) => r[2] === v(0)).map((r) => r[0]); return !p.rowChecks?.["T12.1-9"] ? "" : actBest(p, 9, ids[0]) === "Repeat issue" ? `Repeat issue: ${ids.join(", ")}` : `Single action: ${ids[0]}`; } } },
    handIn: { step: 10, cols: [1], ident: [0] },
  },
  "T12.1 MR": {
    code: "LI-MR Review pack",
    title: "LI-MR · Management review pack: inputs of clause 9.3.2 (rule L24)",
    on: [12, 15],
    cols: [{ h: "Input (9.3.2)", w: 90 }, { h: "What it means", wrap: true, w: 320 }, { h: "Status", wrap: true, w: 160, opts: "step" }],
    rows: (ACTD.inputs as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: { 12: [2] },
    ident: [0, 1],
    checkRows: { 12: { label: 0, col: 2 } },
    note: { 12: () => "Rule L24: one row per input of clause 9.3.2. Ref-Review inputs (Learn › Reference pages) names the deliverables that feed each; Home › Waiting On holds their review records. Available: every one is accepted, or is this task's own (ACT-UPD, ACT-MRI, LI-MR). Missing: none is. Partly available: anything between, a deliverable accepted with review comments or not in the records yet included." },
    reads: { 12: ["learn|Reference pages", "home|Waiting On"] },
    handIn: { step: 15, cols: [2], ident: [0] },
  },
  "T12.1 OBJ": {
    code: "LI-MR Objectives",
    title: "LI-MR · Status of the information security objectives (LI-PLAN)",
    on: [13, 15],
    cols: [
      { h: "Objective", wrap: true, w: 200 }, { h: "Measure", wrap: true, w: 230, prose: true }, { h: "Target", w: 70 }, { h: "Latest result", wrap: true, w: 230, prose: true },
      { h: "Status", wrap: true, w: 130, opts: ["Met", "Not met", "Too early"] },
    ],
    rows: (ACTD.objectives as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: { 13: [4] },
    ident: [0],
    view: { 13: [1, 2, 3] },
    checkRows: { 13: { label: 0, col: 4 } },
    note: { 13: () => "The three objectives of your LI-PLAN (Ref-Objectives), with the latest result of each measure: your T6.2 and T8.1 results. Met: the latest result reaches the target. Not met: it is below the target. Too early: no result has been measured yet." },
    handIn: { step: 15, cols: [4], ident: [0] },
  },
  "T12.1 S1": {
    code: "LI-MR Readiness",
    title: "LI-MR · Stage 1 readiness: mandatory documented information (rule L24)",
    on: [14, 15],
    cols: [
      { h: "Clause", w: 70 }, { h: "Documented information", wrap: true, w: 230, prose: true }, { h: "Held in (Ref-Locations)", wrap: true, w: 200, prose: true },
      { h: "Present?", wrap: true, w: 150, opts: (_d, r) => (r[0] === "Ready for the Stage 1 audit (L24)" ? ["Yes", "No"] : ["Present", "Not present"]) },
    ],
    rows: [...(ACTD.mandatory as string[][]).map((r) => [...r, ""]), ["Ready for the Stage 1 audit (L24)", "All 14 items present?", "—", ""]],
    mine: () => true,
    steps: { 14: [3] },
    ident: [0, 1, 2],
    checkRows: { 14: { label: 0, col: 3 } },
    note: { 14: () => "The 14 items of your LI-DOC register, with the artefacts that hold each (Ref-Locations). Present: every one is accepted in your review records (Home › Waiting On), or is this task's own (ACT-UPD, ACT-MRI, LI-MR); accepted with review comments, or not in the records yet, is not present yet. Rule L24: ready for the Stage 1 audit only if all 14 are present." },
    reads: { 14: ["home|Waiting On"] },
    handIn: { step: 15, cols: [3], ident: [0] },
  },
  "T12.1 AP": {
    code: "LI-MR Audit programme",
    title: "LI-MR · Three-year internal audit programme (rule L23, decision T12.1-D6)",
    on: [],
    cols: [{ h: "Area", wrap: true, w: 170 }, { h: "Year (L23)" }, { h: "Frequency (L23)", wrap: true }, { h: "Open or repeat actions (ACT-UPD)", wrap: true, w: 320, prose: true }, { h: "Auditor (D6)", wrap: true }],
    rows: (ACTD.programme as string[][]).map((r) => [...r, ""]),
    mine: () => true,
    steps: {},
    ident: [0],
    derived: { 4: { from: [], value: (_v, p) => { const b = p.decisions?.["T12.1-D6"]?.best; return b ? (D6_OPTS["ABC".indexOf(b)] ?? "") : ""; } } },
    handIn: { step: 15, cols: [4], ident: [0] },
  },

  // T12.2 (desk-step-builder, 31 Oct 2026). All in Evidence › Audit Requests (PBC). The index's read-me (1, STUDY); D1 (2, no part
  // 2); each request's file by R34 (3); the SHA-256 of each file sent (4); the follow-up requests answered from the mentee's own
  // hand-ins (5, Policies › Version History); D3, then the owner of R-3's action (6, Charter RACI); NC-1's response and
  // corrective action (7, AUD-NCR); AUD-LOG and AUD-NCR handed in (8); D5 (9); NC-1's evidence row (10, L25, STUDY); D6 (11);
  // LI-NCR-R, written from 7, 9, 10 and 11, handed in (12).
  "T12.2": {
    code: "EVIDENCE-INDEX Read me",
    title: "EVIDENCE-INDEX · How the repository's index reads",
    on: [1],
    cols: [{ h: "Column", wrap: true, w: 100 }, { h: "What it records", wrap: true, w: 220 }],
    rows: AUD.readme,
    mine: () => false,
    steps: {},
    ident: [0],
    reads: { 1: ["evidence|Evidence Library"] },
  },
  "T12.2 REQ": {
    code: "AUD-LOG Requests",
    title: "AUD-LOG · The auditor's requests R-1 to R-8 (rule R34)",
    on: [3],
    cols: [{ h: "Request", w: 70 }, { h: "Control / clause", wrap: true }, { h: "Auditor asks for", wrap: true, w: 240, prose: true }, { h: "File to send (R34)", wrap: true, w: 190, opts: "step" }],
    rows: AUD.requests.map((r) => [r[0], r[1], r[2], ""]),
    mine: () => true,
    steps: { 3: [3] },
    ident: [0],
    view: { 3: [1, 2] },
    checkRows: { 3: { label: 0, col: 3 } },
    note: { 3: () => `The audit period is ${AUD.period}. Rule R34 (Learn › Rule tables): answer each request with one file of the index (Evidence › Evidence Library), under the same control or clause, dated inside the audit period, from a system. BKB-POL-016 Section 6.2: the file is the record the control produces, not a report about it. If no file qualifies, the answer is No evidence available.` },
    reads: { 3: ["evidence|Evidence Library", "learn|Rule tables"] },
  },
  "T12.2 HASH": {
    code: "AUD-LOG Sent",
    title: "AUD-LOG · Files sent: SHA-256 and time sent",
    on: [4],
    cols: [{ h: "Request", w: 70 }, { h: "Control / clause", wrap: true }, { h: "File sent" }, { h: "SHA-256 of the file sent", wrap: true, w: 190 }, { h: "Sent (UTC)", wrap: true, w: 150 }],
    rows: AUD.requests.map((r) => [r[0], r[1], "", "", ""]),
    mine: () => true,
    steps: { 4: [3] },
    only: { 4: (r, p) => !!audBest(p, 3, r[0]) && audBest(p, 3, r[0]) !== AUD_NOEV },
    ident: [0],
    view: { 4: [1, 2, 4] },
    derived: { 2: { from: [], value: (v, p) => audBest(p, 3, v(0)) }, 4: { from: [], value: (_v, p) => audAt(p, 4) } },
    cells: { 3: audHash },
    checkRows: { 4: { label: 0, col: 3 } },
    note: { 4: (_d, p) => (p.rowChecks?.["T12.2-3"] ? "Each request your step 3 answered with a file, with the file sent. Copy each file's SHA-256 from its own row of Evidence › Evidence Library: the fingerprint the repository took when it was filed, which the auditor checks the file they receive against. Sent (UTC) is recorded when your answers are checked." : "This step opens once step 3's answers are checked.") },
    reads: { 4: ["evidence|Evidence Library"] },
  },
  "T12.2 FUP": {
    code: "AUD-LOG Follow-ups",
    title: "AUD-LOG · The auditor's follow-up requests R-9 to R-12",
    on: [5],
    cols: [{ h: "Request", w: 70 }, { h: "Control / clause", wrap: true }, { h: "Auditor asks for", wrap: true, w: 260, prose: true }, { h: "Answer with (your deliverable)", wrap: true, w: 190, opts: AUD.fupOpts }],
    rows: AUD.followups.map((r) => [r[0], r[1], r[2], ""]),
    mine: () => true,
    steps: { 5: [3] },
    ident: [0],
    view: { 5: [1, 2] },
    checkRows: { 5: { label: 0, col: 3 } },
    note: { 5: () => `Follow-up requests from the first day of fieldwork. Each asks for a record the Group GRC Office produced this year: one of your own hand-ins, from F1.1 to T12.1. Policies › Version History lists them by code and name, each sealed when you submitted it, inside the audit period (${AUD.period}). Choose the deliverable that is the record asked for, or No evidence available.` },
    reads: { 5: ["policies|Version History"] },
  },
  "T12.2 ACT": {
    code: "ACT-UPD A-23",
    title: "ACT-UPD · Action raised for a request with no evidence (rule R34)",
    on: [6],
    cols: [{ h: "Action", w: 70 }, { h: "Request", w: 70 }, { h: "Issue", wrap: true, w: 280, prose: true }, { h: "Owner (GRC Charter Section 16)", wrap: true, w: 230, opts: AUD.owners }],
    rows: [AUD.action],
    mine: () => true,
    steps: { 6: [3] },
    ident: [0],
    view: { 6: [1, 2] },
    checkRows: { 6: { label: 0, col: 3 } },
    then: { 6: "Choose R-3's owner" },
    note: { 6: () => "R-3 is answered No evidence available, and an action is raised in the corrective-action tracker you updated in T12.1 (ACT-UPD, A-01 to A-22): A-23. It goes to the role Responsible (R) for the control's process in the GRC Charter's RACI (Section 16), as each request of your PBC-LIST did in T5.1: the role that runs the control holds its records." },
  },
  "T12.2 LOG": {
    code: "AUD-LOG",
    title: "AUD-LOG · Auditor request log (template T-AUD)",
    on: [8],
    cols: [
      { h: "Request", w: 70 }, { h: "Control / clause", wrap: true }, { h: "Auditor asks for", wrap: true, w: 220, prose: true }, { h: "Answer sent (R34)", wrap: true, w: 150 },
      { h: "SHA-256", wrap: true, w: 160 }, { h: "Sent (UTC)", wrap: true, w: 150 }, { h: "Action raised", wrap: true, w: 220 },
    ],
    rows: [...AUD.requests, ...AUD.followups].map((r) => [r[0], r[1], r[2], "", "", "", ""]),
    mine: () => true,
    steps: {},
    ident: [0],
    derived: {
      3: { from: [], value: (v, p) => (isFollowUp(v(0)) ? (audBest(p, 5, v(0)) ? `${audBest(p, 5, v(0))}${audBest(p, 5, v(0)) === AUD_NOEV ? "" : " v1"}` : "") : audBest(p, 3, v(0))) },
      4: { from: [], value: (v, p) => { if (isFollowUp(v(0))) return audBest(p, 5, v(0)) ? (audBest(p, 5, v(0)) === AUD_NOEV ? "—" : "Sealed in Policies › Version History") : ""; const f = audBest(p, 3, v(0)); return f === AUD_NOEV ? "—" : audBest(p, 4, v(0)); } },
      5: { from: [], value: (v, p) => audAt(p, isFollowUp(v(0)) ? 5 : 4) },
      6: { from: [], value: (v, p) => (v(0) === AUD.action[1] ? (audBest(p, 6, AUD.action[0]) ? `${AUD.action[0]} · ${audBest(p, 6, AUD.action[0])}` : "") : "—") },
    },
    handIn: { step: 8, cols: [3, 4, 5, 6], ident: [0, 1] },
  },
  "T12.2 NCR": {
    code: "AUD-NCR",
    title: "AUD-NCR · Response to the finding (rule R34)",
    on: [7, 8],
    cols: [{ h: "Line", wrap: true, w: 170 }, { h: "Entry", wrap: true, w: 400, opts: (_d, r) => (r[0] === "Response (R34)" ? AUD.respOpts : r[0] === "Corrective action (Ref-Actions)" ? AUD.actOpts : undefined) }],
    rows: [["Finding", AUD.finding[0]], ["Raised against", AUD.finding[1]], ["Auditor's statement", AUD.finding[2]], ["Evidence file to check", AUD.finding[3]], ["Response (R34)", ""], ["Corrective action (Ref-Actions)", ""], ["Owner and due (Ref-Actions)", ""]],
    mine: () => true,
    steps: { 7: [1] },
    // The finding's lines are given (they are the document's head, read in the hand-in); step 7 shows the two it decides.
    only: { 7: (r) => r[0] === "Response (R34)" || r[0] === "Corrective action (Ref-Actions)" },
    ident: [0],
    derived: { 1: { from: [], value: (v, p) => (v(0) !== "Owner and due (Ref-Actions)" ? null : !p.rowChecks?.["T12.2-7"] ? "" : audBest(p, 7, "Corrective action (Ref-Actions)") === AUD.ct[2] ? `${AUD.ct[3]} · ${AUD.ct[4]}` : "—") } },
    checkRows: { 7: { label: 0, col: 1 } },
    note: { 7: () => `NC-1, the auditor's finding (AUD-FINDING), raised against ${AUD.finding[1]}: “${AUD.finding[2]}” Evidence file to check: ${AUD.finding[3]}. Find that file in Evidence › Evidence Library. Rule R34 (Learn › Rule tables) says how that file decides the response. If you accept, the corrective action is the one Ref-Actions (Learn › Reference pages) gives for the kind of deviation; if you challenge, there is none.` },
    reads: { 7: ["evidence|Evidence Library", "learn|Rule tables", "learn|Reference pages"] },
    handIn: { step: 8, cols: [1], ident: [0] },
  },
  "T12.2 EV": {
    code: "EVIDENCE-INDEX",
    title: "EVIDENCE-INDEX · The repository's index (Evidence › Evidence Library)",
    on: [10],
    cols: [{ h: "File", w: 80 }, { h: "Control" }, { h: "Description", wrap: true, w: 200 }, { h: "Date" }, { h: "Source", wrap: true }, { h: "SHA-256", w: 150 }, { h: "Result", wrap: true, w: 140 }],
    rows: AUD.index.map((r) => r.map((c) => c || "—")),
    mine: () => false,
    steps: {},
    ident: [0],
    reads: { 10: ["learn|Rule tables"] },
  },
  "T12.2 NCRR": {
    code: "LI-NCR-R",
    title: "LI-NCR-R · Clause-based finding response (rule L25)",
    on: [12],
    cols: [{ h: "Line", wrap: true, w: 190 }, { h: "Entry", wrap: true, w: 420, prose: true }],
    rows: [["Requirement (D5)", ""], ["Evidence row (L25)", ""], ["Response (L25)", ""], ["Route if still disputed (D6)", ""]],
    mine: () => true,
    steps: {},
    ident: [0],
    derived: { 1: { from: [], value: (v, p) => audFrame(v(0), p) } },
    handIn: { step: 12, cols: [1], ident: [0] },
  },
};

/** A field of BKB-POL-006's document-control table (Section 11), as the document gives it ("" until loaded). */
const pol006Field = (f: string) => docTable("BKB-POL-006", "11")?.find((r) => r[0] === f)?.[1] ?? "";
/** The clauses a T4.1 requirement can be found in: BKB-POL-006's statements, criticality table, procedures and
 *  guideline, and the addendum's two sections step 2 searches; or none. */
const CLAUSES = [...Array.from({ length: 7 }, (_, i) => `BKB-POL-006 Section 3.1 bullet ${i + 1}`), "BKB-POL-006 Section 4", "BKB-POL-006 Section 6.1", "BKB-POL-006 Section 6.2", "BKB-POL-006 Section 6.3", "BKB-POL-006 Section 7.1", "BKB-ADD-16 Section 5", "BKB-ADD-16 Section 6", "none"];
/** The roles BKB-POL-006 names in Section 5 (Roles and responsibilities) and Section 6 (each procedure's Responsible column). */
const POL006_ROLES = ["Group CISO", "Org CEO", "Org CISO", "CRCO", "DPO", "Regional Managing Director", "Compliance Officer", "Department owners", "Asset owner", "Asset owners", "Internal Audit", "All workforce", "Requester", "Line manager", "IAM team", "HR"];
/** Rule R13's "where to fix": a requirement that names a country or office goes to the addendum, any other to the
 *  Group policy. The countries and offices are the two organisations'. */
function fixWhere(r: string[], d: Desk): { best: string; why: string } {
  const places = [d.orgs.A, d.orgs.B].flatMap((o) => o.offices.flatMap((x) => x.split(",").map((y) => y.trim())));
  const hit = places.find((x) => new RegExp(`\\b${x}\\b`, "i").test(`${r[1]} ${r[2]}`)) ?? (/\boffice\b/i.test(r[1]) ? "an office" : undefined);
  return hit
    ? { best: "Organisation addendum", why: `R13: the requirement names ${hit}, so the fix goes in the addendum, which may only add or tighten.` }
    : { best: "Group policy", why: "R13: the requirement names no country or office, so the fix goes in the Group policy, for every organisation." };
}
/** The sections of BKB-POL-001 whose heading or text has the key word ([] until loaded). */
const pol001Has = (kw: string) => (docNow("BKB-POL-001") ?? []).filter((s) => `${s.title} ${s.body}`.toLowerCase().includes(kw.toLowerCase())).map((s) => s.num);
/** Rule L08 on a 5.2 item: Found where a section of BKB-POL-001 has the key word, else Gap. */
function l08(r: string[]): { best: string; why: string } {
  if (!docNow("BKB-POL-001")) return { best: "", why: "" };
  const at = pol001Has(r[0]);
  return at.length
    ? { best: "Found", why: `L08: “${r[0]}” is in BKB-POL-001 Section ${at.join(", Section ")}.` }
    : { best: "Gap", why: `L08: “${r[0]}” is in no section of BKB-POL-001, so the item is a Gap: the policy does not yet meet it.` };
}
/** Learn › Reference pages › Ref-Leadership: [item, where it is stored]. */
const leadership = (d: Desk) => (d.pages["Ref-Leadership"]?.r ?? []) as string[][];
/** Ref-ISMS processes: a process's owner as the page writes it, and the role it names first. */
const ismsOwner = (d: Desk, process: string) => isms(d).find((x) => x[0] === process)?.[1] ?? "";
const leadRole = (owner: string) => owner.split(/\s*[(;]/)[0].trim();
/** The roles the RACI's Accountable column offers: every role Ref-ISMS processes names first, and two it does not. */
const raciRoles = (d: Desk) => [...new Set([...isms(d).filter((x) => !/^Climate/.test(x[0])).map((x) => leadRole(x[1])), "DPO", "Top management"])].sort();
function raciA(r: string[], d: Desk): { best: string; why: string } {
  const owner = ismsOwner(d, r[0]);
  const best = leadRole(owner);
  if (!best) return { best: "", why: "" };
  return { best, why: owner === best ? `Ref-ISMS processes names ${best} as the owner (Accountable) of ${r[0]}.` : `Ref-ISMS processes gives ${r[0]}: “${owner}”. The A is the role it names first, ${best}.` };
}

/** Rule R11 on a MAP-XW row: its control, its policy, and its procedure unless it reads "none". */
function r11(r: string[]): { best: string; why: string } {
  const has = [r[3] && "a control", r[4] && "a policy", r[5] && r[5] !== "none" && "a procedure"].filter(Boolean) as string[];
  const lacks = ["a control", "a policy", "a procedure"].filter((x) => !has.includes(x));
  const best = has.length === 3 ? "Full" : has.length ? "Partial" : "None";
  const why = has.length === 3 ? "R11: the row has a control, a policy and a procedure, all three." : has.length ? `R11: the row has ${has.join(" and ")}, but not ${lacks.join(" or ")}: ${has.length} of the three.` : "R11: the row has none of the three.";
  return { best, why };
}

/** T3.1: an obligation's Type, where the document it was copied from says what kind of instrument it is. */
function typeOfRow(r: string[], d: Desk): { best: string; why: string } {
  if (obl.offices(d).some((o) => obl.row(d, city(o))?.[1] === r[2]))
    return { best: "law", why: `Its source instrument is the office's Data-protection law in ${addendum(d)} Section 2: an act of parliament.` };
  if (obl.lines21(d)?.some((x) => same(x, r[1])))
    return { best: "reg", why: `${addendum(d)} Section 2.1 lists the lead regulator's own requirements: a regulator's requirement.` };
  const o = obl.rows6(d)?.find((x) => same(x[1], r[1]))?.[0] ?? "";
  if (/payment card/i.test(o)) return { best: "standard", why: "PCI DSS is an industry standard set by the card brands' council, not a law (Learn › Framework Quick Reference)." };
  if (/health/i.test(o)) return { best: "law", why: "HIPAA is a US federal law (Learn › Framework Quick Reference); the Security Rule and 45 CFR 164.410 are made under it." };
  if (/gdpr/i.test(o)) return { best: "law", why: "GDPR is EU legislation, adopted by the European Parliament and Council." };
  if (/united states/i.test(o)) return { best: "law", why: "Its first duty comes from the US states' breach-notification laws." };
  return { best: "", why: "" };
}

/** T3.1: the offices of the two a Section 6 overlay binds, as the Office(s) column writes them; "" for neither;
 *  null where the row is not a Section 6 overlay. GDPR: only Warsaw's Section 2 row names it; PCI DSS: Section 3, All offices. */
function overlayOffices(d: Desk, ob: string): string | null {
  const o = obl.rows6(d)?.find((x) => same(x[1], ob))?.[0];
  if (!o) return null;
  const mine = obl.offices(d).map(city);
  if (/payment card/i.test(o)) return mine.join("; ");
  const named = (word: RegExp) => mine.filter((c) => word.test(obl.row(d, c)?.join(" ") ?? ""));
  if (/gdpr/i.test(o)) return named(/GDPR/).join("; ");
  if (/health/i.test(o)) return named(/HIPAA/).join("; ");
  return named(/United States|CCPA|HIPAA/).join("; ");
}

/** T3.2: the row's BKB policy ID ("BKB-POL-017"), its sections, and its "Procedure:" sections, as the
 *  Policy Library lists them. */
const polId = (r: string[]) => (r[4] ?? "").split(" ")[0];
const outline = (d: Desk, id: string) => (d.library.docs.find(([c]) => c === id)?.[2] ?? []).map(([n]) => n);
const procedures = (d: Desk, id: string) => (d.library.docs.find(([c]) => c === id)?.[2] ?? []).filter(([, h]) => h.startsWith("Procedure:")).map(([n]) => n);
/** Learn › Reference pages › Ref-27002 attributes: [control, title, theme, type, properties, concepts]. */
const attrs = (d: Desk) => (d.pages["Ref-27002 attributes"]?.r ?? []) as string[][];
/** LI-05's 12 deep-dive controls (the task's inputs). */
const DEEP_DIVE = ["A.5.16", "A.5.17", "A.5.28", "A.7.1", "A.7.5", "A.7.7", "A.7.10", "A.7.11", "A.7.14", "A.8.10", "A.8.13", "A.8.27"];
/** T3.2 step 2: the three candidate controls offered for each MAP-8 requirement (platform-written, Content
 *  Corrections item 47), by Req. ID. Listed in Annex A's order. */
const CANDIDATES: Record<string, string[]> = {
  "A.11": ["A.5.1", "A.5.34", "A.8.24"],
  "Art.12": ["A.5.14", "A.5.34", "A.5.37"],
  "A.8": ["A.5.10", "A.5.13", "A.5.34"],
  "A.10": ["A.5.2", "A.5.34", "A.5.36"],
  "312.10": ["A.5.33", "A.5.34", "A.8.13"],
  "Art.16": ["A.5.5", "A.5.9", "A.5.34"],
  "99.37": ["A.5.12", "A.5.15", "A.5.34"],
  "Art.19": ["A.5.24", "A.5.26", "A.5.34"],
};
/** LearnTech's risk register, sheet HQ Istanbul (Learn › Reference pages): [Risk ID, title, decision, owner, controls]. */
const RISK_PAGE = "RA-36 Risk register (HQ Istanbul)";
const riskRows = (d: Desk) => (d.pages[RISK_PAGE]?.r ?? []) as string[][];
/** A risk's controls, ranges written out ("A.7.1–A.7.7" holds A.7.1 to A.7.7). */
const riskControls = (cell: string) =>
  cell.split(",").flatMap((x) => {
    const m = x.trim().match(/^(A\.\d+)\.(\d+)\s*[–-]\s*A\.\d+\.(\d+)$/);
    return m ? Array.from({ length: +m[3] - +m[2] + 1 }, (_, i) => `${m[1]}.${+m[2] + i}`) : [x.trim()];
  });
/** The first risk whose treatment uses the control, or undefined. */
const usedBy = (d: Desk, id: string) => riskRows(d).find((r) => riskControls(r[4] ?? "").includes(id))?.[0];
const BASELINE = "Group baseline (BKB-POL-001)";
/** Rule L06's justification for an applicable control: the first risk that uses it, else the Group baseline
 *  (no law in BKB-ADD-36 Section 2 and no contract in Organization_Profiles names an Annex A control). */
const justification = (d: Desk, id: string) => usedBy(d, id) ?? BASELINE;
/** The controls Ref-SoA exclusions lists for Org B ("None — all 93 … applicable" lists none). */
const soaExcluded = (d: Desk) => {
  const row = (d.pages["Ref-SoA exclusions"]?.r ?? []).find((r) => r[0] === d.orgs.B.name);
  const ids: string[] = String(row?.[1] ?? "").match(/A\.\d+\.\d+/g) ?? [];
  return ids;
};

export const regKey = (taskId: string, code: string) => `${taskId}|${code}`;

/**
 * A step's register or brief. A task may hand in more than one file (T3.1: OBL-REG, then the Lead
 * Implementer extensions' LI-FAM and LI-SCOPE): each is keyed "<task>" or "<task> <code>" and owns the
 * steps it is `on` and the step that hands it in. With no step, the task's first.
 */
const owns = (k: string, id: string) => k === id || k.startsWith(`${id} `);
export function regOf(taskId: string, n?: number): Register | undefined {
  if (n === undefined) return REGISTERS[taskId];
  return Object.entries(REGISTERS).find(([k, r]) => owns(k, taskId) && (r.on.includes(n) || r.handIn?.step === n))?.[1];
}
/** Every register a step hands in (T4.1 step 6: POL-CUR and POL-GAP, two sheets of T-POL). */
export const handedIn = (taskId: string, n: number): Register[] => Object.entries(REGISTERS).filter(([k, r]) => owns(k, taskId) && r.handIn?.step === n).map(([, r]) => r);
export function briefOf(taskId: string, n?: number): Brief | undefined {
  if (n === undefined) return BRIEFS[taskId];
  return Object.entries(BRIEFS).find(([k, b]) => owns(k, taskId) && (b.on.includes(n) || b.handIn === n))?.[1];
}

/** The register's rows: the given ones, or as many blank ones as the mentee has added. */
export function regRows(reg: Register, p: Progress, taskId: string): string[][] {
  if (!reg.grow) return reg.rows;
  const n = Number(p.grids?.[regKey(taskId, reg.code)]?.["#rows"] ?? 0);
  return Array.from({ length: n }, () => reg.cols.map(() => ""));
}

/** The step that added a row, for a register the mentee builds. */
export const addedBy = (reg: Register, p: Progress, taskId: string, ri: number) => Number(p.grids?.[regKey(taskId, reg.code)]?.[`${ri},by`] ?? 0);

/** A cell's value: the given value, the platform's number, or the mentee's entry. */
export function cellValue(reg: Register, p: Progress, taskId: string, ri: number, ci: number): string {
  const auto = reg.cols[ci].auto;
  if (auto) return `${auto}-${String(ri + 1).padStart(2, "0")}`;
  const d = derivedAt(reg, p, taskId, ri, ci);
  if (d !== null) return d;
  return reg.rows[ri]?.[ci] || (p.grids?.[regKey(taskId, reg.code)]?.[`${ri},${ci}`] ?? "");
}

/** The platform's value for a derived cell, or null where the cell is given or the mentee's to fill. */
export function derivedAt(reg: Register, p: Progress, taskId: string, ri: number, ci: number): string | null {
  const d = reg.derived?.[ci];
  return d && !reg.rows[ri]?.[ci] ? d.value((c) => cellValue(reg, p, taskId, ri, c), p) : null;
}

/** How far a step's columns are filled on the rows it answers for; done when every one is. */
export function regStatus(desk: Desk, p: Progress, task: Task, n: number) {
  const reg = regOf(task.id, n);
  if (!reg) return { cells: 0, filled: 0, ok: false, rows: 0 };
  const cols = reg.steps[n] ?? [];
  const rows = regRows(reg, p, task.id);
  if (reg.split?.[n]) {
    const { col } = reg.split[n];
    const rs = splitRows(reg, p, task.id, n);
    const clean = rs.filter((ri) => { const v = cellValue(reg, p, task.id, ri, col); return !!v.trim() && !joints(v).length; });
    return { cells: rs.length, filled: clean.length, ok: rs.some((ri) => addedBy(reg, p, task.id, ri) === n) && clean.length === rs.length, rows: rs.length };
  }
  if (reg.grow && !cols.length) {
    const k = reg.grow.keep;
    const kept = k ? rows.filter((_, ri) => cellValue(reg, p, task.id, ri, k.col) === k.value).length : 0;
    const dropped = !reg.grow.drop || rows.every((_, ri) => !reg.grow!.drop!.bad(liveRow(reg, p, task.id, ri), desk));
    return { cells: reg.grow.target, filled: rows.length, ok: rows.length === reg.grow.target && (!k || kept >= k.min) && dropped, rows: rows.length };
  }
  const adds = reg.grow?.adds[n];
  const mineRows = rows.map((r, ri) => ri).filter((ri) => (adds === undefined ? reg.mine(rows[ri], desk) : addedBy(reg, p, task.id, ri) === n) && (!reg.only?.[n] || reg.only[n](rows[ri], p)));
  let cells = 0, filled = 0, waiting = 0;
  for (const ri of mineRows)
    for (const ci of cols) {
      if (reg.awaiting?.[ci]?.(liveRow(reg, p, task.id, ri), ri, addedBy(reg, p, task.id, ri))) { waiting++; continue; }
      cells++;
      if (cellOk(reg, desk, p, task.id, rows, ri, ci)) filled++;
    }
  // A step whose every cell awaits content (T3.2 step 10) has nothing to fill: it may be marked complete.
  const enough = adds === undefined ? cells > 0 || waiting > 0 : mineRows.length >= adds;
  return { cells, filled, ok: enough && filled === cells, rows: mineRows.length };
}

/** A row as filled so far: given cells, the platform's and the mentee's. */
export const liveRow = (reg: Register, p: Progress, taskId: string, ri: number) => reg.cols.map((_, ci) => cellValue(reg, p, taskId, ri, ci));

/** A cell is in: filled, and, where the column reads its value (`cells`), in a form the step allows. */
export function cellOk(reg: Register, desk: Desk, p: Progress, taskId: string, _rows: string[][], ri: number, ci: number): boolean {
  const v = cellValue(reg, p, taskId, ri, ci);
  // A value the platform writes (T3.2: a Full row's gap sentence "—") is in by itself.
  if (derivedAt(reg, p, taskId, ri, ci) !== null) return !!v.trim();
  return !!v.trim() && (!reg.cells?.[ci] || !!reg.rows[ri]?.[ci] || reg.cells[ci].fix(v, liveRow(reg, p, taskId, ri), desk, ri, addedBy(reg, p, taskId, ri)) !== null);
}

/** The hand-in check: the mentee's cells still empty (or not yet in an allowed form) in the columns
 *  handed in, as "row,col"; awaiting cells are not counted. */
export function regEmpty(desk: Desk, p: Progress, task: Task, n: number, reg = regOf(task.id, n)): string[] {
  if (!reg?.handIn) return [];
  const rows = regRows(reg, p, task.id);
  return rows.flatMap((r, ri) => (reg.mine(r, desk) ? reg.handIn!.cols.filter((ci) => !reg.awaiting?.[ci]?.(liveRow(reg, p, task.id, ri), ri, addedBy(reg, p, task.id, ri)) && !cellOk(reg, desk, p, task.id, rows, ri, ci)).map((ci) => `${ri},${ci}`) : []));
}

/** Rule R10's joints in an obligation: each " and " or ";" that joins two duties. */
export const joints = (t: string) => [...t.matchAll(/;| and /g)].map((m) => ({ at: m.index!, len: m[0].length, w: m[0].trim() }));
/** The rows a split step works on: the ones the step it splits added, and the parts it made. */
export function splitRows(reg: Register, p: Progress, taskId: string, n: number): number[] {
  const from = reg.split![n].from;
  return regRows(reg, p, taskId).map((_, ri) => ri).filter((ri) => [from, n].includes(addedBy(reg, p, taskId, ri)));
}
/** Grid cells with row `ri` split at a joint: the text before it stays, the text after it becomes a new
 *  row right below (the step's own), every other column copied. */
export function splitRow(cells: Record<string, string>, ri: number, col: number, text: string, j: { at: number; len: number }, n: number, ncols: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  const out: Record<string, string> = { "#rows": String(count + 1) };
  for (const [k, v] of Object.entries(cells)) {
    const m = k.match(/^(\d+),(.+)$/);
    if (!m) continue;
    const r = Number(m[1]);
    out[r > ri ? `${r + 1},${m[2]}` : k] = v;
  }
  for (let c = 0; c < ncols; c++) if (cells[`${ri},${c}`] !== undefined) out[`${ri + 1},${c}`] = cells[`${ri},${c}`];
  out[`${ri},${col}`] = text.slice(0, j.at).trim();
  out[`${ri + 1},${col}`] = text.slice(j.at + j.len).trim();
  out[`${ri + 1},by`] = String(n);
  return out;
}
/** A compare step's offices (T3.1 step 7): each office of the rows copied from Section 2, with its clock there and
 *  the matrix's for its country, and what the mentee recorded. Null until both documents are loaded. */
export function compareOffices(reg: Register, desk: Desk, p: Progress, taskId: string) {
  const rows = regRows(reg, p, taskId).map((_, ri) => ri).filter((ri) => [1, 2].includes(addedBy(reg, p, taskId, ri)));
  const offices = [...new Set(rows.map((ri) => cellValue(reg, p, taskId, ri, 5)).filter(Boolean))];
  const annex = docTable("BKB-ERM-001", "Annex A");
  if (!annex || !docTable(addendum(desk), "2")) return null;
  return offices.map((city) => {
    const full = desk.orgs.A.offices.find((o) => o.startsWith(city)) ?? city;
    const country = full.split(",")[1]?.trim() ?? "";
    const ours = obl.row(desk, city)?.[3] ?? "";
    const theirs = annex.find((r) => r[0] === country)?.[2] ?? "";
    const got = p.grids?.[regKey(taskId, reg.code)]?.[`cmp:${city}`] ?? "";
    return { city, country, ours, theirs, differs: !same(ours, theirs), got, rows: rows.filter((ri) => cellValue(reg, p, taskId, ri, 5) === city) };
  });
}
export const compareDone = (reg: Register, desk: Desk, p: Progress, taskId: string) => {
  const c = compareOffices(reg, desk, p, taskId);
  return !!c?.length && c.every((o) => o.got === (o.differs ? "differs" : "same"));
};

/** Grid cells with a row added (stamped with the step that added it) or one removed and the rest moved up. */
export function addRow(cells: Record<string, string>, n: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  return { ...cells, "#rows": String(count + 1), [`${count},by`]: String(n) };
}
export function removeRow(cells: Record<string, string>, ri: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  const out: Record<string, string> = { "#rows": String(Math.max(0, count - 1)) };
  for (const [k, v] of Object.entries(cells)) {
    const m = k.match(/^(\d+),(.+)$/);
    if (!m) continue;
    const r = Number(m[1]);
    if (r < ri) out[k] = v;
    else if (r > ri) out[`${r - 1},${m[2]}`] = v;
  }
  return out;
}

/**
 * Documents that answer a step's decision, where the step's refs do not name them: the toolbar dot and
 * the Policy Library tag point there while the question is open. Not shown as "Read from" over the
 * step's second part, which they do not help with.
 *   F1.1-4 (where may a working copy of customer data live): customer data is Tier 3 (BKB-STD-001 Section 3)
 *   and Section 6's Storage and Cloud / SaaS rows say where Tier 3 may be kept. The task card cites Section 6.
 */
export const DECIDE_FROM: Record<string, Record<number, [string, string[]][]>> = {
  "F1.1": { 4: [["BKB-STD-001", ["3", "6"]]] },
  // T4.1-9 (who is Accountable for approving the SoA): the Charter's three lines (Section 5.2) and its independence rule
  // (Section 17, "may not audit or approve controls they designed or operate").
  "T4.1": { 9: [["Charter", ["5.2", "17"]]] },
  // T4.2-2 (the policy's time limit or the addendum's): how an addendum stands against Group policy, BKB-POL-000 Section 5.
  // T4.2-7 (the SOP's label): the tiers (BKB-STD-001 Section 3, the tree Section 5) and LearnTech's labels (BKB-ADD-36 Section 7).
  "T4.2": { 2: [["BKB-POL-000", ["5"]]], 7: [["BKB-STD-001", ["3", "5"]], ["BKB-ADD-36", ["7"]]] },
  // T6.2-5 (a leaver's account used after termination): the leaver procedure, BKB-POL-006 Section 6.3.
  "T6.2": { 5: [["BKB-POL-006", ["6.3"]]] },
  // T7.1-8 (which risks are above appetite): BKB-ERM-001 Section 4, the appetite as a maximum residual score.
  "T7.1": { 8: [["BKB-ERM-001", ["4"]]] },
  // T11.2-8 (D5: when the impact assessment is due): BKB-POL-016 Section 3.1 and the procedure, Section 6.1.
  "T11.2": { 8: [["BKB-POL-016", ["3.1", "6.1"]]] },
};

/** The sources a step reads, its own refs first; an `extra` entry replaces a ref to the same document. */
export function stepSources(task: Task, n: number, own: [string, string[]][]): [string, string[]][] {
  const extra = regOf(task.id, n)?.extra?.[n] ?? DECIDE_FROM[task.id]?.[n] ?? [];
  return [...own.filter(([id]) => !extra.some(([x]) => x === id)), ...extra];
}

/** What a step shows in place of its tool: the task's register or its brief, when the step works on it. */
export function deliverableFor(task: Task, n: number): "register" | "brief" | null {
  if (regOf(task.id, n)?.on.includes(n)) return "register";
  if (briefOf(task.id, n)?.on.includes(n)) return "brief";
  return null;
}

/**
 * A document template with fixed sections (T-CTX …): one section given as the worked example, the
 * others filled by the steps, each with its "Source:" line. Sections and their lines are the engine's.
 */
export interface BriefSection {
  h: string;
  /** The worked example: a cited document section, shown as given, one paragraph per line. */
  given?: [string, string];
  /** Labelled lines; none means a free list, one item per line. `col` is where the source has the
   *  value (its column, or row), named in a flag; `at` says so under the label while it is filled. */
  lines?: { l: string; col: string; at?: string; /** The pack gives nothing to copy: shown "Awaiting content", not counted. */ awaiting?: boolean }[];
  /** Where the section is copied from, as its Source line records it ("<addendum> Section 9"). */
  src?: (desk: Desk) => string;
  /** The values as the source has them, once the document is loaded: what a copy is compared with. */
  want?: (desk: Desk) => string[] | null;
  /** A list whose order the source does not fix (the rows of a table, filtered). */
  anyOrder?: boolean;
}
export interface Brief {
  code: string;
  title: string;
  /** Printed in the footer, as the pack requires (BKB-POL-004 Section 3.1), where the template has one. */
  label?: string;
  sections: BriefSection[];
  on: number[];
  /** Step number → the section it fills. */
  steps: Record<number, number>;
  /** The step that checks the brief on its page and hands it in. */
  handIn?: number;
  /** Step → the platform screens it reads from (see Register.reads). */
  reads?: Record<number, string[]>;
}

const office = (desk: Desk) => desk.orgs.A.office;
export const BRIEFS: Record<string, Brief> = {
  "F1.3": {
    code: "T-CTX",
    title: "CTX-BRIEF · Context brief (template T-CTX)",
    label: "Internal",
    sections: [
      { h: "1 Services", given: ["BKB-ADD-16", "1.1"] },
      // Section 9 "Processing activities and data": its "Client data handled" list (step 2 says "Data handled").
      { h: "2 Data handled", src: (d) => `${addendum(d)} Section 9`, want: (d) => { const t = docTable(addendum(d), "9"); return t ? bullets(t[0][1]) : null; } },
      // The office's row of Section 2; each line is one of its columns, in order.
      {
        h: "3 Legal environment",
        lines: [
          { l: "Law", col: "Data-protection law" },
          { l: "Authority", col: "Authority" },
          { l: "Breach clock", col: "Breach notification" },
          { l: "Cyber law", col: "Cyber / sector law" },
          { l: "Transfer rule", col: "Cross-border transfer" },
        ].map((x) => ({ ...x, at: `Section 2 column: ${x.col}` })),
        src: (d) => `${addendum(d)} Section 2`,
        want: (d) => docTable(addendum(d), "2")?.find((r) => r[0].startsWith(office(d)))?.slice(1, 6) ?? null,
      },
      // Information_Asset_Register_by_Department.xlsx is not on the platform (its Risk › Asset Register
      // screen is F2.1's 12-asset sample); BKB-ADD-16 Section 8.1 is the register's Mission Critical assets by
      // office, the filter step 4 asks for (Content Corrections item 24).
      { h: "4 Mission Critical assets", src: (d) => `${addendum(d)} Section 8.1`, want: (d) => docTable(addendum(d), "8.1")?.filter((r) => r[1] === office(d)).map((r) => r[0]) ?? null, anyOrder: true },
    ],
    on: [1, 2, 3, 4],
    steps: { 2: 1, 3: 2, 4: 3 },
    handIn: 6,
  },
  // CLS-RES's two small tables (Ref-Templates T-CLS: "… tier; organisation label; transmission rule
  // (Tier 3 and Tier 4)"): the organisation's label for each Group tier, and how Tier 3 and Tier 4 may
  // be sent. The asset rows are REGISTERS["F2.1"]; both are handed in together at step 6.
  "F2.1": {
    code: "T-CLS",
    title: "CLS-RES · Tier labels and transmission (template T-CLS)",
    sections: [
      {
        h: "1 Organisation labels",
        lines: ["Tier 1 (Public)", "Tier 2 (Internal)", "Tier 3 (Confidential)", "Tier 4 (Restricted)"].map((t) => ({ l: t, col: t })),
        src: (d) => `${addendum(d)} Section 7`,
        want: (d) => docTable(addendum(d), "7")?.slice(0, 4).map((r) => r[1]) ?? null,
      },
      // Section 6 has no "Transmission" column: its rows are Internal and External transmission. Sending a
      // file to a partner (the step's question) is external (Content Corrections item 32).
      {
        h: "2 External transmission",
        lines: [
          { l: "Tier 3", col: "Tier 3 Confidential", at: "Section 6 row: External transmission" },
          { l: "Tier 4", col: "Tier 4 Restricted", at: "Section 6 row: External transmission" },
        ],
        src: () => "BKB-STD-001 Section 6",
        want: () => docTable("BKB-STD-001", "6")?.find((r) => r[0] === "External transmission")?.slice(3, 5) ?? null,
      },
    ],
    // 6: shown, read-only, under CLS-RES when it is handed in.
    on: [4, 5, 6],
    steps: { 4: 0, 5: 1 },
  },
  // The PDCA diagram of LI-FAM: clauses 4–10 placed with rule L01, and the note on Amendment 1:2024.
  "T3.1 LI-FAM": {
    code: "T-LI-FAM-PDCA",
    title: "LI-FAM · PDCA diagram of clauses 4–10 (template T-LI-FAM)",
    sections: [
      {
        h: "1 PDCA placement (L01)",
        lines: [
          [4, "Context of the organisation"], [5, "Leadership"], [6, "Planning"], [7, "Support"], [8, "Operation"], [9, "Performance evaluation"], [10, "Improvement"],
        ].map(([n, t]) => ({ l: `Clause ${n} ${t}`, col: `clause ${n}` })),
        src: () => "Rule L01",
        want: (d) => [4, 5, 6, 7, 8, 9, 10].map((n) => l01(d, n)),
      },
      {
        h: "2 Amendment 1:2024",
        lines: [{ l: "Note", col: "the ISO/IEC 27001 row", at: "Ref-27000 family, ISO/IEC 27001 row" }],
        src: () => "Ref-27000 family",
        // The ISO/IEC 27001 row's purpose: "…; the amendment adds climate change to clauses 4.1 and 4.2."
        want: (d) => [(famRow(d, "ISO/IEC 27001:2022 + Amd 1:2024")?.[1] ?? "").split("; ").slice(1).join("; ")],
      },
    ],
    on: [12, 13, 14],
    steps: { 12: 0, 13: 1 },
    reads: { 12: ["learn|Rule tables"], 13: ["learn|Reference pages"] },
  },
  // T3.1's Lead Implementer extension LI-02: template T-LI-SCOPE ("Scope frame; in / out / interfaces;
  // climate row; 10 ISMS processes"), filled with rules L03 and L04.
  "T3.1 LI-SCOPE": {
    code: "T-LI-SCOPE",
    title: "LI-SCOPE · ISMS scope statement and process list (template T-LI-SCOPE)",
    sections: [
      {
        h: "1 Scope statement",
        // "The ISMS of GlobalConnect Customer Solutions covers ___ at ___." In scope = the office and its
        // departments in the asset register (L03); BKB-ADD-16 Section 8.1 is the register's view on the platform.
        lines: [
          { l: "covers", col: "the departments", at: "Section 8.1 column: Department, your office's rows" },
          { l: "at", col: "the office", at: "Section 8.1 column: Office" },
        ],
        src: (d) => `${addendum(d)} Section 8.1`,
        want: (d) => { const x = depts(d); return x ? [x.join("; "), office(d)] : null; },
      },
      {
        h: "2 Boundaries (L03)",
        lines: [
          { l: "Out of scope", col: "the exclusions it lists", at: "only what the addendum lists as excluded" },
          { l: "Interfaces", col: "the first 3 External rows of Section 9.1", at: "Section 9.1 System integrations: the first 3 External rows, separated by “; ”" },
        ],
        src: (d) => addendum(d),
        // BKB-ADD-16 lists no exclusions, so rule L03 leaves nothing out of scope. Interfaces: the first 3
        // External rows of Section 9.1, the TSA Integrations extract (platform-written, item 55).
        want: (d) => {
          const t = docTable(addendum(d), "9.1");
          return t ? ["None", t.filter((r) => r[1] === "External").slice(0, 3).map((r) => r[0]).join("; ")] : null;
        },
      },
      {
        h: "3 Climate change (4.1, 4.2)",
        lines: [{ l: "Relevant?", col: "the climate-change row", at: "Ref-ISMS processes, last row" }],
        src: () => "Ref-ISMS processes",
        want: (d) => { const r = isms(d).find((x) => /^Climate/.test(x[0])); return r ? [r[1]] : null; },
      },
      {
        h: "4 ISMS processes (4.4)",
        lines: ["Risk assessment and treatment", "Statement of Applicability", "Document control", "Competence and training", "Awareness and communication", "Incident management and breach notification", "Supplier and third-party risk", "Internal audit", "Management review", "Nonconformity and corrective action"].map((x) => ({ l: x, col: x })),
        src: () => "Ref-ISMS processes",
        want: (d) => { const r = isms(d).filter((x) => !/^Climate/.test(x[0])); return r.length ? r.map((x) => x[1]) : null; },
      },
    ],
    on: [15, 16, 17, 18],
    steps: { 15: 0, 16: 1, 17: 2, 18: 3 },
    handIn: 19,
    reads: { 16: ["learn|Rule tables"], 17: ["learn|Reference pages"], 18: ["learn|Reference pages"] },
  },
};

/** The worked section's lines, as its source has them (null until loaded). */
export const givenLines = (sec: BriefSection) => (sec.given ? docLines(sec.given[0], sec.given[1]) : null);

/**
 * A section's copy against its source: per typed line, the problem if any (null when it is right).
 * A list is compared line by line, or, where the source fixes no order, as members; a value with
 * parts separated by ";" may give them in any order. Null while the document is loading.
 */
export function briefFlags(desk: Desk, sec: BriefSection, typed: string[]): (string | null)[] | null {
  const want = sec.want?.(desk);
  if (!want) return null;
  const parts = (x: string) => x.split(";").map((y) => y.trim().replace(/\s+/g, " ").toLowerCase()).sort().join(";");
  const eq = (a: string, b: string) => same(a, b) || (b.includes(";") && parts(a) === parts(b));
  const where = sec.src?.(desk) ?? "the source";
  if (sec.lines) return typed.map((v, i) => (!v.trim() || eq(v, want[i] ?? "") ? null : `Not what ${where} gives for ${sec.lines![i].col}.`));
  const seen = new Set<string>();
  return typed.map((v, i) => {
    if (!v.trim()) return null;
    if (sec.anyOrder) {
      const hit = want.find((w) => eq(v, w));
      if (!hit) return `Not an asset of a ${office(desk)} row in ${where}.`;
      if (seen.has(hit)) return "Listed twice.";
      seen.add(hit);
      return null;
    }
    return eq(v, want[i] ?? "") ? null : want[i] ? `Not item ${i + 1} of ${where}.` : `${where} has no item ${i + 1}.`;
  });
}
/** The Source line names the section's source (Section and dashes optional). */
export const briefSrcOk = (desk: Desk, sec: BriefSection, v: string) => !sec.src || norm(v) === norm(sec.src(desk));

export const briefKey = (taskId: string, code: string) => `${taskId}|${code}`;

/**
 * A section is done when every line (or the list) and its Source line are filled. With `desk`, it is
 * done only once the copy matches its source: no line flagged, a list with every item of the source,
 * the Source line naming the section (`right` says so). A copy is only right as its source has it.
 */
export function briefStatus(p: Progress, task: Task, n: number, desk?: Desk) {
  const b = briefOf(task.id, n);
  const sec = b?.steps[n];
  if (!b || sec === undefined) return { ok: false, filled: 0, cells: 0, right: false, items: 0, want: 0 };
  const S = b.sections[sec];
  const v = p.grids?.[briefKey(task.id, b.code)] ?? {};
  const keys = [...(S.lines ?? [{ awaiting: false }]).flatMap((l, i) => (l.awaiting ? [] : [`${sec},${i}`])), `${sec},src`];
  const filled = keys.filter((k) => (v[k] ?? "").trim()).length;
  const list = (v[`${sec},0`] ?? "").split("\n").filter((x) => x.trim());
  const flags = desk ? (S.lines ? briefFlags(desk, S, S.lines.map((_, li) => v[`${sec},${li}`] ?? "")) : briefFlags(desk, S, list)) : null;
  const want = desk ? (S.want?.(desk)?.length ?? 0) : 0;
  const right = !!desk && !!flags && flags.every((f) => !f) && briefSrcOk(desk, S, v[`${sec},src`] ?? "") && (!!S.lines || list.length === want);
  return { ok: filled === keys.length && (!desk || right), filled, cells: keys.length, right, items: list.length, want };
}

/**
 * A reading step made into finding: the mentee answers each prompt by clicking the cell in the
 * worked rows that holds it. The answers are cells already on the screen (no key), and finding them
 * is proof of the reading the step asks for. Prompts cover the columns the mentee fills later, each
 * with the reason that column exists, in the pack's terms.
 *
 * F1.2 step 1: "Read the LearnTech Educational Solutions rows: columns D–G are filled in for you" —
 * the owner's note: "they are your worked examples … your rows must look the same."
 */
export type StudyPrompt = {
  id: string;
  ask: string;
  why: string;
  hint: string;
  /** The column that holds the answer. */
  col: number;
  /** The worked row it must be in, when only one row will do. */
  row?: (r: string[]) => boolean;
  /** In a brief's worked section (col -1): the line that answers it, given the section's lines; the
   *  index one past the last is the section's Source line. */
  line?: (lines: string[]) => number;
};
export const STUDY: Record<string, Record<number, StudyPrompt[]>> = {
  "F1.2": {
    1: [
      {
        id: "D",
        ask: "Click the instrument type the worked rows give GDPR (EU).",
        why: "Column D says what kind of instrument a standard is. That decides who can hold the organisation to account: a regulator, an auditor or a customer.",
        hint: "Look in column D, on the GDPR (EU) row.",
        col: 3,
        row: (r) => r[1] === "GDPR (EU)",
      },
      {
        id: "F",
        ask: "Click the rule a worked row records.",
        why: "Column F names the rules used to fill the row, R01 for the type and R02 for the offices, so anyone can check how each value was reached.",
        hint: "Look in column F, on any worked row.",
        col: 5,
      },
      {
        id: "G",
        ask: "Click the source the worked rows cite as evidence.",
        why: "Column G says where the values came from. A value that cannot be traced to its source cannot be checked.",
        hint: "Look in column G, on any worked row.",
        col: 6,
      },
    ],
  },
  // F2.1 step 1: "Rows A-01 and A-02 are worked examples: the decision-tree path and the tier are filled
  // in." The owner's note: "follow each path … That is exactly what you will do for the other six."
  // The worked paths do not follow Section 5's questions (Content Corrections item 29), so the step finds the
  // parts of a finished row rather than tracing a path against Section 5.
  "F2.1": {
    1: [
      {
        id: "tier",
        ask: "Click the tier A-02's path stopped at.",
        why: "Group tier is where the decision tree stops for the row. In step 2 you walk the tree for each of your six rows and it fills this column.",
        hint: "Look in Group tier, on the A-02 row.",
        col: 6,
        row: (r) => r[0] === "A-02",
      },
      {
        id: "path",
        ask: "Click the path that ended at Tier 2.",
        why: "The path records each question asked and its answer, in order, so a reader can follow how the tier was reached. The assessor looks for a path on every row (checkpoint HC1).",
        hint: "Look in Decision-tree path, and read each path to its end.",
        col: 5,
        row: (r) => r[6].startsWith("Tier 2"),
      },
      {
        id: "facts",
        ask: "Click the fact that says whether A-01 holds personal or regulated data.",
        why: "The tree's questions are answered with the row's own facts: what the asset is, whether it holds personal or regulated data, and its criticality.",
        hint: "Look in Personal / regulated data, on the A-01 row.",
        col: 3,
        row: (r) => r[0] === "A-01",
      },
    ],
  },
  // F2.2 step 1: "Items E-001 and E-002 are worked examples: the decision and the defect code are
  // filled in." The owner's note: "Open Ref-Defect codes next to them and see which column of the item
  // made the difference." Each answer is a cell of the worked rows.
  "F2.2": {
    1: [
      {
        id: "decision",
        ask: "Click the decision the worked rows give E-002.",
        why: "Every item gets Accept or Reject, by rule R09: check D1 to D10 in order; if any check fails, Reject; if none fails, Accept. In step 2 you decide this for your six items.",
        hint: "Look in Accept/Reject, on the E-002 row.",
        col: 11,
        row: (r) => r[0] === "E-002",
      },
      {
        id: "code",
        ask: "Click the defect code recorded for E-002.",
        why: "The code names the check that failed. Evidence › Defect Codes lists all ten, D1 to D10, each with what it means. In step 3 you record the code of each item you reject.",
        hint: "Look in Defect code, on the E-002 row.",
        col: 12,
        row: (r) => r[0] === "E-002",
      },
      {
        id: "cell",
        ask: "Read D1 in Evidence › Defect Codes, then click the cell of E-002 that fails it.",
        why: "D1 is “Undated — no date/time or system clock visible”, and E-002 shows no timestamp. Every other check passes. In this clinic every rejected item has exactly one defect.",
        hint: "Compare E-002 with E-001 column by column: one of E-002's cells is not like E-001's.",
        col: 3,
        row: (r) => r[0] === "E-002",
      },
    ],
  },
  // T3.2 step 8 (LI-05): "Open T-LI-SOA. The 93 controls are listed." Checked against Annex A's themes:
  // the template ends each theme where the standard does. Each answer is a control ID on screen.
  "T3.2": {
    8: [
      {
        id: "org",
        ask: "Click the last Organisational control: the last of the A.5 rows.",
        why: "Annex A of ISO/IEC 27001:2022 groups its 93 controls in four themes. The Organisational theme is A.5.1 to A.5.37: 37 controls.",
        hint: "Scroll down the Control column to where A.5 ends and A.6 begins.",
        col: 0,
        row: (r) => r[0] === "A.5.37",
      },
      {
        id: "people",
        ask: "Click the last People control: the last of the A.6 rows.",
        why: "The People theme is A.6.1 to A.6.8: 8 controls, about screening, employment terms, awareness and reporting.",
        hint: "It is just above the first A.7 row.",
        col: 0,
        row: (r) => r[0] === "A.6.8",
      },
      {
        id: "physical",
        ask: "Click the last Physical control: the last of the A.7 rows.",
        why: "The Physical theme is A.7.1 to A.7.14: 14 controls; the Technological theme is A.8.1 to A.8.34: 34. 37 + 8 + 14 + 34 = 93, so the template lists every control once. A Statement of Applicability decides every control: no row is added or removed.",
        hint: "It is just above the first A.8 row.",
        col: 0,
        row: (r) => r[0] === "A.7.14",
      },
    ],
  },
  // F1.3 step 1: "Put it next to BKB-ADD-16 Section 1 and check that every line is copied word for word."
  // The owner's note: "exact words, in the same order, with the source written under each section."
  // One prompt per part of that standard; each answer is a line of the worked section on screen.
  "F1.3": {
    1: [
      {
        id: "order",
        ask: "Click the service that BKB-ADD-16 Section 1.1 lists fifth.",
        why: "Section 1 keeps the addendum's order, so a reader can check it line against line. Your sections keep the order of their source too.",
        hint: "Count down the list in BKB-ADD-16 Section 1.1, then find that service in section 1.",
        col: -1,
        line: () => 4,
      },
      {
        id: "words",
        ask: "Click the service Section 1.1 lists last, and check that section 1 has every word of it, brackets included.",
        why: "Word for word: nothing shortened, merged or reworded. A shorter line would drop what the addendum says.",
        hint: "It is the last line of Section 1.1 and of the list in section 1.",
        col: -1,
        line: (l) => l.length - 1,
      },
      {
        id: "source",
        ask: "Click the line that says where section 1 was copied from.",
        why: "Every section ends with its source, so anyone can open it and check. You write this line under sections 2, 3 and 4.",
        hint: "It is under the list, not in it.",
        col: -1,
        line: (l) => l.length,
      },
    ],
  },
  // T6.1 step 1: "Open the UAR template. The test plan (attributes A1–A6) is already written. Do not change it." Reading
  // the plan becomes three questions an account raises in steps 3 and 4; each answer is a cell of Sheet 1 on screen.
  "T6.1": {
    1: [
      {
        id: "blank",
        ask: "An account's review decision is blank. Click the attribute it fails.",
        why: "A5 passes only when the decision is made: a blank decision means the reviewer never confirmed or removed the access.",
        hint: "Read the Passes when column: which attribute needs the review decision to be made?",
        col: 0,
        row: (r) => r[0].startsWith("A5"),
      },
      {
        id: "reads",
        ask: "Click the columns A4 reads to tell whether the reviewer was independent.",
        why: "A4 compares the account holder's name with the reviewer: someone who reviews their own access gives no independent check.",
        hint: "Find A4's row, then the column that says what to read.",
        col: 2,
        row: (r) => r[0].startsWith("A4"),
      },
      {
        id: "mover",
        ask: "The HR roster shows a role change date for an account. Click the attribute that fails.",
        why: "A6: a mover keeps the access of the old role until it is re-validated, and the extract records no re-validation.",
        hint: "Read the Passes when column: which attribute reads the HR roster's dates?",
        col: 0,
        row: (r) => r[0].startsWith("A6"),
      },
    ],
  },
  // T7.1 step 1: reading RRU-EVENTS for what a risk statement (R06) and a rating (R07) are built from. The answers are cells of
  // the sheet; the third needs every new event's controls read.
  "T7.1": {
    1: [
      {
        id: "asset",
        ask: "Rule R06 ends a risk statement with the asset, named as the register names it. Click the asset event N1 affects.",
        why: "The statement names what would be harmed, so its owner and its controls can be found in the asset register.",
        hint: "Read N1's row across: one cell names one of the office's assets.",
        col: 5,
        row: (r) => r[0] === "N1",
      },
      {
        id: "often",
        ask: "Rule R07 rates likelihood from how often the event may happen. Click the fact N1's likelihood is read from.",
        why: "R07 finds the likelihood descriptor of BKB-ERM-001 Section 6.2 that uses the same words as this fact.",
        hint: "Look for the cell of N1 that says how often something happens.",
        col: 6,
        row: (r) => r[0] === "N1",
      },
      {
        id: "noworking",
        ask: "Rule R07 lowers the residual likelihood once for each existing control marked working. Which new event has no working control? Click its existing controls.",
        why: "None of its controls is marked working, so its residual likelihood stays at its inherent likelihood.",
        hint: "Read the Existing controls of N1, N2 and N3: each control says working or not working.",
        col: 8,
        row: (r) => r[0] === "N2",
      },
    ],
  },
  // T8.1 step 9 (LI-11): the measure card read against ISO/IEC 27001 clause 9.1's questions, in our words.
  "T8.1": {
    9: [
      {
        id: "when",
        ask: "Clause 9.1 c) asks when the measuring is done. Click the value of the card that answers it.",
        why: "Monthly: the measure is taken on a fixed rhythm, so each month's result can be compared with the last and a trend seen.",
        hint: "Read down the Field column for the field about timing, then click its value.",
        col: 1,
        row: (r) => r[0] === "Frequency",
      },
      {
        id: "who",
        ask: "Clause 9.1 d) asks who measures. Click the value of the card that answers it.",
        why: "The vulnerability team, who run the scans, collect the data. Analysing and evaluating it are separate fields, given to other people.",
        hint: "Read down the Field column for the field about gathering the data, then click its value.",
        col: 1,
        row: (r) => r[0] === "Who collects",
      },
      {
        id: "how",
        ask: "Clause 9.1 b) asks for the method, so that results are valid and can be compared. Click the value of the card that says how the result is worked out.",
        why: "The formula fixes the numerator, the denominator and the unit, so two people get the same result from the same data.",
        hint: "Read down the Field column for the field that gives the calculation, then click its value.",
        col: 1,
        row: (r) => r[0] === "Formula",
      },
    ],
  },
  // T8.2: step 1 reads the fixed test script (CT-SCRIPT Sheet 1); step 8 reads LI-NCR's fields against clause 10.2.
  "T8.2": {
    1: [
      {
        id: "late",
        ask: "A record's review was done five weeks after its quarter ended. Click the attribute it fails.",
        why: "A2 counts the days from the end of the record's quarter to its review date: more than 15 is a deviation.",
        hint: "Read the What the script says column: which attribute is about when the review was done?",
        col: 0,
        row: (r) => r[0].startsWith("A2"),
      },
      {
        id: "self",
        ask: "The reviewer of a record is the privileged account's own holder. Click the attribute it fails.",
        why: "A5: someone who reviews their own privileged access gives no independent check (BKB-POL-006 Section 6.2 step 2).",
        hint: "Read the What the script says column: which attribute is about who did the review?",
        col: 0,
        row: (r) => r[0].startsWith("A5"),
      },
      {
        id: "q",
        ask: "Click the line that says which months each review quarter covers.",
        why: "The population names LearnTech's four review quarters: A2 counts from the end of each one.",
        hint: "Read the What the script says column of the lines above the attributes.",
        col: 1,
        row: (r) => r[0] === "Population",
      },
    ],
    8: [
      {
        id: "react",
        ask: "Clause 10.2 a) asks the organisation to react to the nonconformity: to control and correct it. Click the field of LI-NCR that records that.",
        why: "The correction fixes the case in front of you. It is not yet a corrective action, which removes the cause.",
        hint: "Read the What it holds column for the field that fixes this one case.",
        col: 0,
        row: (r) => r[0] === "Correction",
      },
      {
        id: "cause",
        ask: "Clause 10.2 b) asks it to find out why the nonconformity happened, so that its cause can be removed. Click the field that records that.",
        why: "The root cause is the last answer of the 5-Whys form; the corrective action is chosen to remove it.",
        hint: "Read the What it holds column for the field about why it happened.",
        col: 0,
        row: (r) => r[0] === "Root cause (Why 5)",
      },
      {
        id: "review",
        ask: "Clause 10.2 d) asks it to review whether the corrective action taken worked. Click the field that records that.",
        why: "The effectiveness check says how and when the corrective action is shown to work: a re-test, three months later (rule L18).",
        hint: "Read the What it holds column for the field about whether the action worked.",
        col: 0,
        row: (r) => r[0] === "Effectiveness check",
      },
    ],
  },
  "T9.2": {
    1: [
      {
        id: "sub",
        ask: "Lumen's report has a Subservice line. Click the code of the check that reads it.",
        why: "S5: a subservice organisation, such as the hosting provider, carved out of the report has its controls tested nowhere in it, so its own report is needed.",
        hint: "The Subservice line names an organisation Lumen relies on, its hosting provider, and how the report treats it. Which check is about such an organisation?",
        col: 0,
        row: (r) => r[0] === "S5",
      },
      {
        id: "scope",
        ask: "Its Scope line is the report's system description: what the auditor examined. Click the code of the check that reads it.",
        why: "S9: the system description sets what the report covers. A service it leaves out has no assurance from the report at all.",
        hint: "Which check is about what the system description covers?",
        col: 0,
        row: (r) => r[0] === "S9",
      },
      {
        id: "tsc",
        ask: "Its TSC line lists the Trust Services Criteria the auditor tested. Click the code of the check that reads it.",
        why: "S7: the criteria tested are Security, Availability, Processing integrity, Confidentiality and Privacy, in any mix. Where personal data is processed, Confidentiality or Privacy should be among them.",
        hint: "The five Trust Services Criteria are Security, Availability, Processing integrity, Confidentiality and Privacy. Which check names some of them?",
        col: 0,
        row: (r) => r[0] === "S7",
      },
    ],
  },
  // T10.2 step 8 (LI-14): "Open T-LI-IRBC" made into finding three things in its Phases sheet.
  "T10.2": {
    8: [
      {
        id: "assess",
        ask: "Click the Annex A control of the phase in which the notification assessment is made.",
        why: "A.5.25, Assessment and decision on information security events: the event is confirmed as an incident, its risk rated and the notifications decided. Your BRC-ASSESS is that phase's record.",
        hint: "Read the What it covers column: which phase names the notification assessment of Section 6.2? Its control is beside it.",
        col: 1,
        row: (r) => r[0] === "Assess and decide",
      },
      {
        id: "contain",
        ask: "Taking a system offline to stop data leaving is Section 6.1's Contain step. Click the phase it belongs to.",
        why: "Respond, A.5.26: containing, notifying, and eradicating and recovering are all part of the response.",
        hint: "Which row's What it covers names Contain?",
        col: 0,
        row: (r) => r[0] === "Respond",
      },
      {
        id: "evidence",
        ask: "Click the control that applies in every phase, not in one.",
        why: "A.5.28, Collection of evidence: logs and one timeline are kept from the first minute, so that what happened can be shown later.",
        hint: "Look for the row that is not one of the five phases.",
        col: 1,
        row: (r) => r[0].startsWith("Evidence"),
      },
    ],
  },
  // T11.1 step 7 (LI-15): "Open T-LI-COMM" made into finding three things in Ref-Clause map's rows.
  "T11.1": {
    7: [
      {
        id: "comm",
        ask: "Click the clause that LI-COMM alone evidences.",
        why: "Clause 7.4, Communication: what is communicated, when, to whom and by whom. LI-COMM's communication plan is its only evidence, so step 9's rows carry it.",
        hint: "Read the column of your deliverables: which row names LI-COMM and nothing else?",
        col: 0,
        row: (r) => r[0] === "7.4",
      },
      {
        id: "doc",
        ask: "Click the documented information that one of these clauses makes mandatory.",
        why: "Evidence of competence (clause 7.2): it must be kept. LI-COMM's competence sheet records, for each role holder, whether it is on file (step 8).",
        hint: "Look in the Mandatory documented information column: which row has more than a dash?",
        col: 3,
        row: (r) => r[0] === "7.2",
      },
      {
        id: "und",
        ask: "The undertaking you signed in F1.1 (ADM-UND) evidences one of these clauses. Click its title.",
        why: "Clause 7.3, Awareness: people know the policy and their part in it. Your undertaking was that evidence for you; this campaign is the same for the Amsterdam team.",
        hint: "Which row's deliverables name ADM-UND? Its title is beside it.",
        col: 1,
        row: (r) => r[0] === "7.3",
      },
    ],
  },
  // T12.1 step 1: "Open ACT-TRACKER" made into reading T-ACT's read-me; step 7: "Click Refresh counts" into reading ACT-MRI's counts.
  "T12.1": {
    1: [
      {
        id: "sys",
        ask: "R33's third test asks whether the closure evidence is a system record, not a statement. Click the column that shows it.",
        why: "Evidence type says what the evidence is: a system export passes the third test; an e-mail from the owner saying “done” is a statement, and does not.",
        hint: "Read the What it records column for the one about what the evidence is.",
        col: 0,
        row: (r) => r[0] === "Evidence type",
      },
      {
        id: "retest",
        ask: "Click the column that shows whether the fix worked when the control was tested again.",
        why: "Re-test is R33's fourth test: an action closes only once the control has been tested again and passed.",
        hint: "Read the What it records column for the one about testing the control again.",
        col: 0,
        row: (r) => r[0] === "Re-test",
      },
      {
        id: "date",
        ask: "Click the date that days past due are counted to.",
        why: "The test date: each open action's days past due are counted to it, and its next check is 14 days after it (rule R33).",
        hint: "Read the What it records column for a date the tracker's own rows do not hold.",
        col: 1,
        row: (r) => r[0] === "Test date",
      },
    ],
    7: [
      {
        id: "conf",
        ask: "Owners reported 15 actions closed. Click the count of those your closure tests confirmed.",
        why: "Closed — verified: the closures whose evidence passed all four tests of R33. The others of the 15 were reopened.",
        hint: "Read the Line column for the closures your tests confirmed.",
        col: 1,
        row: (r) => r[0] === "Closed — verified",
      },
      {
        id: "held",
        ask: "Click the count that tells the review how many owners' closures did not hold.",
        why: "Reopened by your closure tests: the owners reported them Closed, and their evidence did not support it. Top management reads it beside the owners' own count.",
        hint: "Read the Line column for the actions your tests opened again.",
        col: 1,
        row: (r) => r[0] === "Reopened by your closure tests",
      },
      {
        id: "esc",
        ask: "Click the count of actions that have gone to their owner's manager.",
        why: "Escalated (K5): an open action more than 14 days past its due date goes to the owner's manager, and the review hears of it.",
        hint: "Read the Line column for the code K5.",
        col: 1,
        row: (r) => r[0] === "Escalated to the owner's manager (K5)",
      },
    ],
  },
  // T12.2 step 1: "Open AUD-REQUESTS and EVIDENCE-INDEX" made into reading the index's read-me; step 10: "Apply rule L25 to the
  // evidence file" made into reading NC-1's evidence row in the index.
  "T12.2": {
    1: [
      {
        id: "src",
        ask: "Rule R34 accepts only a file produced by a system. Click the column that shows how a file was produced.",
        why: "Source says how the file was produced: a system export is the system's own record; a screenshot is captured by hand, and an undated one shows no time at all.",
        hint: "Read the What it records column for the one about how a file was produced.",
        col: 0,
        row: (r) => r[0] === "Source",
      },
      {
        id: "hash",
        ask: "Click the column the auditor can use to prove a file they received has not changed since it was filed.",
        why: "SHA-256 is the file's fingerprint, taken when it was filed. The log records it with each file sent, and any change to the file gives another.",
        hint: "Read the What it records column for the one that changes if the file changes.",
        col: 0,
        row: (r) => r[0] === "SHA-256",
      },
      {
        id: "res",
        ask: "The auditor's finding names a file of test results. Click the column that shows a test's outcome.",
        why: "Result holds the outcome of a test, for the files that are test results; it is empty for every other file.",
        hint: "Read the What it records column for the one about test results.",
        col: 0,
        row: (r) => r[0] === "Result",
      },
    ],
    10: [
      {
        id: "shows",
        ask: "Rule L25 first asks whether the evidence row shows the problem the finding states. Click the cell, in the row of the file NC-1 names, that shows it.",
        why: "The Result of EV-7148: 3 of 25 samples fail. The row shows the problem NC-1 states, so the response is the one rule L25 gives for that case.",
        hint: "Find the file the note names in the File column, then read its row from left to right.",
        col: 6,
        row: (r) => r[0] === "EV-7148",
      },
      {
        id: "period",
        ask: "A finding stands on evidence from the audit period. Click the cell, in the same row, that shows the file falls inside it.",
        why: "EV-7148's Date, 2026-11-11, is inside the audit period, 2025-12-21 to 2026-12-21: the evidence is from the period the audit covers.",
        hint: "Compare each cell of the row with the audit period in the note.",
        col: 3,
        row: (r) => r[0] === "EV-7148",
      },
      {
        id: "system",
        ask: "Click the cell, in the same row, that shows the evidence is a system's record, not a capture made by hand.",
        why: "EV-7148's Source: a system export. The auditor's evidence is the system's own record of the test.",
        hint: "Read the row's cells for the one that says how the file was produced.",
        col: 4,
        row: (r) => r[0] === "EV-7148",
      },
    ],
  },
};

/**
 * A reading step made into applying a rule: the mentee walks a question-in-order rule (R01) on one
 * worked row, answering yes or no until the first yes. Everything comes from the pack: the questions
 * and their outcomes are parsed from the rule's own text, and the stopping point is the question whose
 * outcome is the worked row's own value. Nothing is keyed by hand.
 *
 * F1.2 step 2: "Read the worked example in row 1: ISO/IEC 27001:2022 — Can an organisation get a
 * certificate? Yes → Certifiable standard (rule R01, question 2)."
 */
export type Ladder = { rule: string; col: number; row: (r: string[]) => boolean };
export const LADDER: Record<string, Record<number, Ladder>> = {
  "F1.2": { 2: { rule: "R01", col: 3, row: (r) => r[0] === "LearnTech Educational Solutions" && r[1] === "ISO/IEC 27001:2022" } },
};
/** "1) Made by a parliament or a regulator? → Law / regulation. … 5) Otherwise → Voluntary framework." */
export function ladderSteps(ruleText: string): { q: string; then: string }[] {
  return [...ruleText.matchAll(/(\d)\)\s*(.+?)\s*→\s*(.+?)\./g)].map((m) => ({ q: m[2], then: m[3] }));
}


/** A decision tree's questions as its document writes them: "Is it …? → Tier 1." (null until loaded). */
export function treeQuestions(doc: string, sec: string): { q: string; then: string }[] | null {
  const lines = docLines(doc, sec);
  return lines ? lines.filter((l) => l.includes("→")).map((l) => { const [q, then = ""] = l.split(/\s*→\s*/); return { q: q.trim(), then: then.trim().replace(/\.$/, "") }; }) : null;
}

/** A report step's rows whose column shows something other than clean content (F2.2: unmasked data, D9). */
export const exposedRows = (reg: Register, desk: Desk) =>
  reg.rows.map((_, ri) => ri).filter((ri) => reg.mine(reg.rows[ri], desk) && !!reg.report && reg.rows[ri][reg.report.col].trim().toLowerCase() !== reg.report.clean.toLowerCase());
/** Where a report step keeps the rows reported ("4,6"), or "none" once the mentee found none to report. */
export const reportKey = (taskId: string, n: number) => `${taskId}-${n}#report`;
/** Done when every exposed row is reported and nothing else, or none is exposed and the mentee said so. */
export function reportDone(desk: Desk, p: Progress, task: Task): boolean {
  const reg = REGISTERS[task.id];
  if (!reg?.report) return false;
  const v = p.answers[reportKey(task.id, reg.report.step)] ?? "";
  const want = exposedRows(reg, desk);
  if (!want.length) return v === "none";
  const got = v.split(",").filter(Boolean).map(Number);
  return got.length === want.length && want.every((ri) => got.includes(ri));
}

/** The screens a step reads from besides its own tool (see `reads`). */
export const stepReads = (taskId: string, n: number): string[] => regOf(taskId, n)?.reads?.[n] ?? briefOf(taskId, n)?.reads?.[n] ?? [];
