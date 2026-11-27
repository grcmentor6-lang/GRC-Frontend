import type { Desk, Task } from "./model";
import { COL_WHAT } from "./col-what";
import { bullets, docLines, docTable } from "./docs";
import type { Progress } from "./progress";
import { localizable } from "./names";
import { plain, same } from "./plain";
import SPRINT_DATA from "./li-sprints.json";
import KPI_DATA from "./li-kpi.json";
import T102_DATA from "./li-t102.json";
import T122_DATA from "./li-t122.json";
import SOA_DATA from "./li-soa.json";
import T61_DATA from "./li-t61.json";
import PHY_DATA from "./li-phy.json";
import CFG_DATA from "./li-cfg.json";
import TTX_DATA from "./li-ttx.json";
import T92_DATA from "./li-t92.json";

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
  /** What the header says this table holds, where the task panel stamp describes another table. */
  stamp?: string;
  /** Steps that show it in place of their tool: the ones that fill it and the ones that read it. */
  on: number[];
  cols: {
    h: string;
    /** What the column expects, in a few words, printed under its heading (tester review, 18 Nov 2026: "Source
     *  instrument" is a new term to a learner, and no column said what it wanted). */
    what?: string;
    /** A drop-down: "step" takes the options of the step that fills it, a list is the template's own, a
     *  function reads them from a document (T3.1: the policies of the SITL-POL-000 index). */
    opts?: "step" | string[] | ((desk: Desk, row: string[], by: number, p: Progress) => string[] | undefined);
    /** Numbered by the platform, never typed: "OBL" → OBL-01, OBL-02 … */
    auto?: string;
    /** A long heading over short values: it wraps rather than widen the table. */
    wrap?: boolean;
    /** The cell holds a date: a date picker, not a text box (stored as YYYY-MM-DD, as typed dates were). "none": the
     *  picker with a "none" tick beside it (T7.1: a retained risk has no due date). "time": a date and time picker,
     *  stored as "YYYY-MM-DD HH:MM UTC" (T10.2: the discovery time and each deadline). A function: only on some rows. */
    date?: true | "none" | "time" | ((row: string[]) => boolean | "time");
    /** The column's least width in px, for long values (T3.1: an obligation's text). */
    w?: number;
    /** A list of IDs ("E-015 Accept, E-019 Reject"): each item kept on one line, and on a phone the column becomes a
     *  full-width line under its row, so it reads without a sideways scroll (T5.2 EVP-GAP). */
    list?: boolean;
    /** A sentence (a draft, a fact): on a phone it becomes a full-width line under its row, as written; "always" at every
     *  width (T7.1's three drafts of a risk statement, read one under the other). */
    prose?: boolean | "always";
    /** The column a step decides on a wide sheet: kept in view at the table's right edge while its row is read
     *  (T6.1 UAR-EXTRA's Type, after twelve columns of facts). */
    pin?: boolean;
    /** A list of deliverable codes ("CTX-BRIEF, CTX-IP"): each shown on its own line with its name and the task that
     *  produces it (tester, 23 Nov 2026: "the codes are not explained"). The stored value stays the codes. */
    named?: boolean;
  }[];
  /** A register worked at its hand-in step (an extra sheet a message brings): its line in that step's list of jobs. */
  job?: string;
  /** Shown above the other sheets of its hand-in (T6.1's Sheet 4); otherwise sheets keep their order, Sheet 2 below. */
  first?: boolean;
  /** Given rows; empty for a register the mentee builds row by row (see `grow`). */
  rows: string[][];
  /**
   * A register built from nothing, up to `target` rows. `adds` is step → the rows that step's source
   * holds: the platform puts them in place, empty, when the step opens (`seedRows`), and the mentee
   * fills them in; nobody is asked to add a row. A step not listed fills its columns on every row,
   * and a step with no columns is done when the register has exactly `target` rows.
   */
  grow?: {
    target: number;
    adds: Record<number, number>;
    /** The step that brings the register down to `target`, with a remove button on every row. */
    trim?: number;
    /** Rows that must stay among the `target` (T3.1: at least 3 contract rows, KR2). */
    keep?: { col: number; value: string; min: number };
    /** Rows the trimming step must remove (T3.1: the overlays that bind neither office), and why. */
    drop?: { bad: (row: string[], desk: Desk) => boolean; why: (desk: Desk) => string };
  };
  /** Step → a column that arrives as a colleague's first draft (T3.1 step 10): written once, into empty cells only.
   *  Such a column has no `cells` check: a live flag would point at the slips; `checkRows` judges it. */
  draft?: Record<number, (d: Desk, p: Progress) => { col: number; v: string[] } | undefined>;
  /** Step → who produced the draft, said above the table in place of "A colleague filled" (T8.1: a formula did). */
  draftBy?: Record<number, string>;
  /** Step → cells a finding step shows as a colleague's slip, by the row's first cell, until found (T3.2 step 8). The
   *  register's rows stay right: nothing reaches a later step. */
  slips?: Record<number, { col: number; at: Record<string, string> }>;
  /** Step → columns shown read-only beside the ones it fills (T3.1 step 6: what each row is). */
  view?: Record<number, number[]>;
  /** Step → a line said above the step's work: where its rows come from and how many there are. */
  note?: Record<number, (desk: Desk, p: Progress) => string>;
  /** Step → what the step reads on its own tool's screen (T9.2: Lumen's report on Vendors › SOC Report Review). The modal shows
   *  the register in its place, so a banner over the table names the screen and how it opens beside the table: the
   *  toolbar again. Nothing opens by itself. */
  screen?: Record<number, string>;
  /** Step → how to read the cited sources, said in the "Read from" banner above the table (which
   *  stays in view while a document window covers the step panel). Where to look, never the answer. */
  readHow?: Record<number, string>;
  /** Step → the row of a cited document's table it reads (its first cell): marked and scrolled into view on opening (T5.1 step 1: the row sits below a long table). */
  spot?: Record<number, string>;
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
  /** Step → the column whose cells name the documents its rows are read in: the Policy Library tags them. */
  docsCol?: Record<number, number>;
  /** What the line beside the step says of the grey rows, where they are not a pattern to copy (T7.1: the register's
   *  existing risks, some of whose acceptance authorities break rule R36). */
  worked?: string;
  /** Step → a drawing shown above the table (T9.1: "phy", the floor plan of dataset PHY, components/desk/phy-plan.tsx). */
  figure?: Record<number, "phy">;
  /** Finding steps (STUDY) that show every row, not only the worked ones (T3.2 step 3: the sprint's controls located in
   *  the tracker beside its worked row). */
  studyAll?: number[];
  /** Finding steps (STUDY) that show the register's note for the step above their questions (T8.1 step 1: the tabletop's
   *  scenario, which the six injects need). Without it a finding step shows no note. */
  studyNote?: number[];
  /** Rows the mentee fills; the others are worked examples, read-only. */
  mine: (row: string[], desk: Desk) => boolean;
  /** Step number → the columns it fills. */
  steps: Record<number, number[]>;
  /** Column → a value the platform writes from other cells of the row, never typed (F1.2 F: the rules
   *  that filled the row). Shown beside a step that fills one of its inputs, unless a step fills the
   *  column itself: there `value` gives null on the rows the mentee fills (F2.2: an accepted item's
   *  defect code is "none" by itself, a rejected item's is chosen). */
  derived?: Record<number, { from: number[]; value: (v: (ci: number) => string, p: Progress) => string | null; /** Not shown beside the step that fills its source (no part of that step's work); seen in the hand-in. */ quiet?: boolean;
    /** While the value is still empty: what writes it and when, shown in the cell instead of an empty mark (the
     *  learner never types a derived cell). */
    waits?: (v: (ci: number) => string) => string }>;
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
   * Step number → a decision tree walked one row at a time (F2.1: SITL-STD-001 Section 5). Its questions are the
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
  /** A line under a check's cells that is not a cell of the row (T5.2's D7: what the file's request asks for). */
  aside?: Record<string, (row: string[], desk: Desk) => string>;
};
export type RowCheckSpec = {
  label: number;
  col: number;
  rule?: (row: string[], desk: Desk) => { best: string; why: string };
  /** The column the key is looked up by, where it is not `label` (T3.1 step 5: a policy per Process). */
  ask?: number;
  /** A second column judged with `col` (T10.1 step 3, shape and system): the pick sent is "<col> · <with>". Several, in
   *  order (T5.1 step 6: the due date and a retained risk's four acceptance fields): "<col> · <with 1> · <with 2> …". */
  with?: number | number[];
};
/** The columns judged with a check's `col`, in the order the pick joins them. */
export const withCols = (rc: RowCheckSpec): number[] => (rc.with === undefined ? [] : Array.isArray(rc.with) ? rc.with : [rc.with]);


// Never empty: notes say "… is in <addendum> Section 2.2", which must always name a place.
const addendum = (desk: Desk) => (desk.orgs.A as { addendum?: string }).addendum || "Org A's addendum";
/** A document reference typed with or without the word "section", a pasted section sign, dashes and spaces. */
const norm = (x: string) => x.toLowerCase().replace(/^source:\s*/, "").replace(/sections?/g, "").replace(/[\s\u00a7—–,;:"'“”‘’_-]/g, "").replace(/organis/g, "organiz");
/** Same parts in any order and case ("DPA 2012; GDPR" = "gdpr; DPA 2012"). */
const sameParts = (a: string, b: string) => {
  const parts = (x: string) => x.split(";").map(plain).filter(Boolean).sort().join(";");
  return parts(a) === parts(b);
};
const office = (desk: Desk) => desk.orgs.A.office;

// GRC 101 was rebuilt to the Lead Implementer workbook (docs/li101/LI101_REBUILD_PLAN.md): the registers, briefs and
// study prompts of the old F1.2 … T12.2 are gone. Phase 2 adds each task's back, one task at a time.

/** A rule's own text as a step's note (NoteList lifts "Rule L01:" into a heading, one sentence a line). */
const ruleNote = (id: string) => (desk: Desk) => `Rule ${id}: ${desk.rules[id]?.[1] ?? ""}`;

// F1.2 · LI-FAM, the ISO/IEC 27000-family map (template T-LI-FAM). His workbook names the ten documents, the columns
// A–E, the two LearnTech worked rows (ISO/IEC 27000, ISO/IEC 27002:2022), the four types (rule L01) and sheet PDCA
// (rule L02). Platform-written, logged in docs/GRC101_Content_Corrections.md (F1.2): columns C and D on every row
// (each document's purpose and users, in our own words), the worked rows' E, and E's six choices.
const LT = "LearnTech Educational Solutions", GC = "GlobalConnect Customer Solutions";
const FAM_DOCS: [string, string, string][] = [
  ["ISO/IEC 27000", "Overview of information security management systems, with the terms and definitions the family uses", "Anyone writing or reading ISMS documents"],
  ["ISO/IEC 27001:2022 + Amd 1:2024", "Requirements to establish, implement, maintain and continually improve an ISMS: Clauses 4–10 and the Annex A controls", "The organisation running the ISMS, and the certification body that audits it"],
  ["ISO/IEC 27002:2022", "Reference set of 93 information security controls, with guidance on implementing each", "Control owners and the ISMS team choosing and implementing controls"],
  ["ISO/IEC 27003", "Explains each of Clauses 4–10 of ISO/IEC 27001 and how to meet it", "The ISMS team putting the requirements in place"],
  ["ISO/IEC 27004", "How to monitor, measure, analyse and evaluate how the ISMS performs (Clause 9.1)", "The ISMS team and the process owners who report measures"],
  ["ISO/IEC 27005:2022", "How to run information security risk assessment and risk treatment", "Risk owners and the ISMS team"],
  ["ISO/IEC 27006-1", "What a body that audits and certifies ISMSs must meet, on top of ISO/IEC 17021-1", "Certification bodies, and the accreditation bodies that assess them"],
  ["ISO/IEC 27007", "How to plan and carry out ISMS audits: ISO 19011 applied to ISO/IEC 27001", "Internal and external ISMS auditors"],
  ["ISO/IEC 17021-1", "What any body that audits and certifies management systems must meet", "Certification bodies, and the accreditation bodies that assess them"],
  ["ISO 19011", "How to manage an audit programme and audit any management system", "Auditors, and those who manage audit programmes"],
];
const famRow = (org: string, doc: string, b = "", e = ""): string[] => { const [, c, d] = FAM_DOCS.find((x) => x[0] === doc)!; return [org, doc, b, c, d, e]; };
// Where the programme uses each document: his tasks, by code and title (Home › My plan). Key server-side (F1.2-6).
const FAM_USE = [
  "Every task (Weeks 1–12)",
  "T3.1–T10.2 · policy set and control sprints",
  "T4.1–T5.1 · risk method, assessment and treatment",
  "T11.1 · Monitoring, measurement and Level 4 measures",
  "T11.2 · Internal audit programme and maturity review",
  "T12.2 · Certification readiness: Stage 1, Stage 2 and the auditor's requests",
];

// F1.3 · CTX-ISS (template T-LI-CTX) and CTX-IP. His workbook names the columns, the three LearnTech worked rows, the four
// external issues (legal, regulatory, technological, market) read from SITL-ADD-16 Sections 1–2, dataset CTX-ISS-6, the
// climate-change row and the five parties of SITL-ADD-16 Section 4 (rule R04). Platform-written, logged in
// docs/GRC101_Content_Corrections.md (F1.3): the worked rows, the six issue statements step 2 chooses from, the dataset's
// statements and effects, the climate row's source, and the per-party choices of step 6. Keys server-side.
const CTX_CATS = ["Legal", "Regulatory", "Technological", "Market"];
const CLIMATE = "Climate (Clause 4.1, Amd 1:2024)";
// Step 2's issues: one per category for Manila, from Sections 1 and 2, among issues of the other offices of Section 2.
const CTX_EXT = [
  "GDPR and the 2018 Act apply to EU customers' data, with 72 hours to the supervisory authority UODO",
  "Fortune 500 clients buy customer support, technical support, telemarketing and back-office services from providers with call centres in many regions",
  "The Data Privacy Act 2012 and the Cybercrime Prevention Act 2012 apply to the client data and systems of the Manila office",
  "POPIA 2013 applies, and breaches go to the Information Regulator through its eServices portal",
  "End-customers reach the clients through voice, chat, email and social channels, and every channel must be served",
  "The National Privacy Commission must be told of a personal data breach within 72 hours, and so must the data subjects",
];
const CTX_SRC = ["SITL-ADD-16 Section 1", "SITL-ADD-16 Section 2"];
const CTX_CLIMATE = ["Climate change is a relevant issue for the ISMS", "Climate change is not a relevant issue for the ISMS"];
// Dataset CTX-ISS-6 (build-li101.py DATASETS holds the same statements and asserts it): issue, topic, effect.
const CTX_ISS_6: [string, string, string][] = [
  ["Agents on some client accounts share CRM log-ins to keep call-handling times down", "People", "Actions on client data cannot be traced to one agent, which weakens accountability and any breach investigation"],
  ["Phishing and pretext calls aimed at call-centre agents are rising across the BPO sector", "Threat", "Agents may be talked into disclosing client customer data, a threat to its confidentiality"],
  ["Clients send security questionnaires and audit the data-protection controls once a year", "Clients", "A finding in a client audit can cost a contract, so controls must be evidenced all year round"],
  ["Security awareness training for new agents is given once, at induction, with no refresher", "People", "Agents forget what they learned, so phishing and data-handling mistakes become more likely"],
  ["The telecom carriers set the connectivity service levels of the Manila centres", "Suppliers", "An outage at a carrier stops calls, a threat to the availability of client services"],
  ["Day-to-day ownership of the ISMS at the Manila office is not assigned to any role", "Governance", "Nobody drives the ISMS between audits, so actions stall and evidence goes out of date"],
];
const words = (v: string) => v.trim().split(/\s+/).filter(Boolean).length;
/** A copy compared with its source: case, spaces and the punctuation no keyboard has do not count. */
const squash = (x: string) => plain(x).replace(/\s+/g, "");
/** Row `ri` of the table under the addendum's Section 4 (Stakeholder requirements), once loaded. */
const partyRow = (desk: Desk, ri: number) => docTable(addendum(desk), "4")?.[ri];
/** A copied cell while its source is not loaded (the hand-in step reads no document): kept as typed, since it was checked
 *  against the source when it was typed (step 5), rather than counted as empty. */
const unread = (v: string) => v.trim() || null;
/** A list typed with semicolons (or one item a line) against the source's list: same items, any order. */
const sameItems = (v: string, want: string[]) => {
  const got = v.split(/[;\n•]/).map(squash).filter(Boolean).sort();
  return got.length === want.length && got.join("|") === want.map(squash).sort().join("|");
};
/** Step 6's choices for a party: "No", or "Yes:" with any of its requirements, read from Section 4 (singles first). */
const addressedOpts = (desk: Desk, row: string[]): string[] => {
  const src = docTable(addendum(desk), "4")?.find((r) => squash(r[0]) === squash(row[0]));
  if (!src) return [];
  const reqs = bullets(src[1]);
  const sets = Array.from({ length: (1 << reqs.length) - 1 }, (_, i) => reqs.filter((_, j) => ((i + 1) >> j) & 1));
  return [...sets.sort((a, b) => a.length - b.length).map((s) => `Yes: ${s.join("; ")}`), "No"];
};

// F2.1 · LI-SCOPE, the ISMS scope statement and process list (template T-LI-SCOPE). His workbook names the sections (1–4
// units, location, services, technology; 5 exclusions; 6 the ten ISMS processes; 7 interfaces and dependencies), the
// LearnTech worked scope, the sources of steps 3 and 6 and the owner choices of step 5. Platform-written, logged in
// docs/GRC101_Content_Corrections.md (F2.1): the worked scope (Amsterdam, SITL-ADD-36), the statements each line offers,
// the inputs → outputs of step 5, and the rows and choices of section 7. Keys server-side (F2.1-3 … F2.1-6).
const SCOPE_PARTS = ["1 Organisational units", "2 Location", "3 Services", "4 Technology", "Requirements addressed (Clause 4.3 b)"];
const EXCL = "5 Exclusions", IFACE_PART = "7 Interfaces and dependencies";
// Per line, the statements three sources give (the right one is the line's own source; the key is server-side).
const SCOPE_STATEMENTS: Record<string, string[]> = {
  "1 Organisational units": [
    "Finance & Treasury (Group), Information Security (CISO Office), Corporate IT & Technology, Information Security & Privacy, Service Delivery Operations",
    "Group Treasurer, CFO, CISO, CIO, Head of Infrastructure, Head of Security & Privacy, Chief Delivery Officer",
    "Service Delivery Operations only, the department that runs the customer-support floor",
  ],
  "2 Location": ["Manila, Philippines (head office)", "Warsaw, Poland (regional office)", "Phoenix, United States (regional office)"],
  "3 Services": [
    "Customer service, technical support, collections, healthcare claims support, financial services support (KYC, fraud), back-office processing, omnichannel support",
    "Call handling, escalation management, quality monitoring and call recording, CRM data entry, KYC and identity verification, complaint logging",
  ],
  "4 Technology": [
    "On premises: data centre, network, telephony, call recording, workstations, PKI. Hybrid: SIEM, IAM, email. SaaS: CRM, WFM, QA, VoIP, delivery, HR and payroll",
    "On premises: workstations and telephony. SaaS: CRM and the production delivery platform. Cloud: the client transaction data store",
    "Treasury system, banking and payment files, SIEM, IAM, PKI, directory and email, core network, delivery platform, client transaction data",
  ],
  "Requirements addressed (Clause 4.3 b)": [
    "Data security for client customer data, DPA 2012 awareness, clean desk and call recording, NPC registration, client data laws, client DPAs, end-customer privacy",
    "Every requirement of the five parties, quality scores, uptime, staffing and labour law included",
    "The lead regulator's six: NPC registration, a DPO, 72-hour breach notice, annual training, PIAs, NPC sector audits",
  ],
};
const SCOPE_SOURCES = [
  "SITL-ADD-16 Section 1", "SITL-ADD-16 Section 1.1", "SITL-ADD-16 Section 2", "SITL-ADD-16 Section 2.1", "SITL-ADD-16 Section 4",
  "SITL-ADD-16 Section 8.1", "SITL-ADD-16 Section 9", "TSA-16 Office_Deployment", "CTX-IP (F1.3)",
];
const SCOPE_EXCLUSIONS = [
  "None: no part of the Manila office's own activities is left out",
  "The customer-support floor, until it is added next year, to make certification quicker",
  "Payroll, because an outside provider runs it",
];
// Section 6: his ten processes, in his order, with the clause each serves; the inputs → outputs offered on every row.
const PROCESSES: [string, string][] = [
  ["Context and scope review", "Clauses 4.1–4.3"],
  ["Risk assessment and treatment", "Clauses 6.1.2, 6.1.3, 8.2, 8.3"],
  ["Policy management", "Clause 5.2; Annex A 5.1"],
  ["Document control", "Clause 7.5"],
  ["Competence and awareness", "Clauses 7.2, 7.3"],
  ["Incident management", "Annex A 5.24–5.28"],
  ["Supplier security", "Annex A 5.19–5.22"],
  ["Internal audit", "Clause 9.2"],
  ["Management review", "Clause 9.3"],
  ["Corrective action", "Clause 10.2"],
];
const PROC_IO = [
  "Issues (CTX-ISS) and interested-party requirements (CTX-IP) → ISMS scope statement (LI-SCOPE)",
  "Risk method, asset inventory and threats → risk register, risk treatment plan and Statement of Applicability",
  "Requirements, risks and management direction → approved information security and topic-specific policies",
  "Draft documents and records → documents approved, versioned, distributed and retained",
  "Role requirements and training records → competence matrix and awareness plan",
  "Security events and breach reports → incident records, notifications and lessons learned",
  "Supplier intake and contracts → supplier tiers, contract security clauses and reviews",
  "Audit programme, criteria and evidence → audit reports and nonconformities",
  "Audit results, risk status, objectives, incidents and nonconformities → decisions on improvements, resources and risk acceptance",
  "Nonconformities and audit findings → root causes, corrective actions and their closure",
];
// Section 7: the six integrations of SITL-ADD-16 Section 9.1, in its order, and the payroll provider of step 2.
const IFACES: [string, string, string][] = [
  ["Workforce management system ↔ HR and payroll systems", "HR & Workforce Management", "Schedules, hours worked"],
  ["CRM platforms (Salesforce, HelpLoop) ↔ client CRM tenants", "Client companies", "End-customer PII, CRM interaction history"],
  ["QA monitoring tools ↔ call recording servers", "Quality Assurance", "Call recordings, QA scores"],
  ["VoIP and UCaaS platforms ↔ telecom carriers", "Telecom providers", "Call audio, call detail records"],
  ["KYC verification service ↔ identity-check provider", "IT vendors", "Identity documents (for KYC processes)"],
  ["Collections platform ↔ client payment gateways", "Client companies", "Payment and financial data"],
  ["Payroll ↔ outside payroll provider", "Payroll provider (step 2)", "Employees' pay, tax and bank details"],
];
const CROSSES = ["Information", "A service", "Information and a service", "People", "Nothing: both ends in scope"];
const IF_CONTROLS = ["A.5.14 Information transfer", "A.5.19 Information security in supplier relationships", "A.5.20 Addressing information security within supplier agreements", "None: inside the boundary"];

// F2.2 · LI-GAP, the clause gap analysis (template T-LI-PLAN, sheets Gap and Plan). His workbook gives the 25 requirements
// of clauses 4.1–10.2, the status options (rule L13), the four maturity levels, rows 4.1 and 4.2 as worked examples, and
// sheet Plan's top three gaps with owner role and target date. Platform-written, logged in docs/GRC101_Content_Corrections.md
// (F2.2): what each clause requires (the Task Library's Requirements sheet, in our own words), dataset GAP-25 (what was found
// at Manila), the worked rows' status, level and reason, and sheet Plan's columns. Keys server-side (F2.2-2, -3, -5).
const GAP_25: string[][] = [
  ["4.1 Understanding the organization and its context", "Determine the external and internal issues relevant to the organisation's purpose that affect the ISMS's intended outcomes, and whether climate change is a relevant issue.", "The issues are recorded in CTX-ISS on the Group template T-LI-CTX, the way every GlobalConnect office records them, climate change included. The Compliance Manager reviews the list every six months, and the record of each review is kept.", "Fully met", "Level 3 Defined", "Fully met: the issues, climate change included, are determined and recorded. Level 3 Defined: the Group's way, used in every office, with records and a review every six months; nothing is measured against a target."],
  ["4.2 Understanding the needs and expectations of interested parties", "Determine the interested parties relevant to the ISMS, their relevant requirements, and which of those requirements the ISMS will address.", "The interested parties are recorded in CTX-IP, copied from the Group table in SITL-ADD-16 Section 4. The client contracts and data-protection agreements, which hold most of Manila's requirements, have not been read into it. The Manila team keeps the register its own way, and it has never been reviewed.", "Partially met", "Level 2 Managed", "Partially met: the parties are determined, but not all their requirements, since the contracts and agreements were never read in. Level 2 Managed: documented and kept at Manila, but its own way and never reviewed."],
  ["4.3 Determining the scope of the information security management system", "Set the ISMS's boundaries and applicability, considering the issues (4.1), the requirements (4.2) and the interfaces with activities others perform; keep the scope as documented information.", "A scope statement for Manila is drafted in LI-SCOPE: units, location, services, technology, interfaces and exclusions. It is a draft: neither the Org CEO nor the Group CISO has approved it, and nothing yet records it as the ISMS's scope.", "", "", ""],
  ["4.4 Information security management system", "Establish, implement, maintain and continually improve the ISMS, including the processes it needs and how they interact.", "Manila runs seven of the ten ISMS processes of the Group's process model, with records. Internal audit, management review and corrective action have never run there. Nobody has reviewed the set of processes at Manila.", "", "", ""],
  ["5.1 Leadership and commitment", "Top management leads the ISMS: policy and objectives fit the strategy, the ISMS is part of the business processes, resources are there, its importance is communicated, and people are directed and supported to make it work.", "The Org CEO approved SITL-ADD-16 with the Group CISO, effective 1 October 2026, and signs a yearly ISMS commitment statement, as every Group organisation's CEO does. The ISMS budget is in the approved plan, and the minutes of the CEO's quarterly security briefings to Manila managers are kept. The Group reviews the commitment each year.", "", "", ""],
  ["5.2 Policy", "Top management sets an information security policy that fits the organisation's purpose, gives objectives or a frame for them, commits to meet requirements and to improve; it is documented, communicated and available to interested parties.", "SITL-POL-001, the Group information security policy, applies at Manila through SITL-ADD-16, the same policy in every office. It is approved by the Group GRC Steering Committee and kept under document control, with a yearly review. Two things the clause asks for are missing: nothing records that it was communicated to the workforce (its document control shows no communication record attached), and it is classified Internal, with no way set for clients or other interested parties to obtain it. Nobody measures how well staff know it.", "", "", ""],
  ["5.3 Organizational roles, responsibilities and authorities", "Top management assigns and communicates the responsibilities and authorities for information security roles, including who makes sure the ISMS conforms and who reports on its performance.", "The GRC Charter Section 16 sets the Group's roles, but at Manila day-to-day ownership of the ISMS is not assigned to any role, and the Manila job descriptions say nothing about security responsibilities. No record shows the roles were communicated at Manila.", "", "", ""],
  ["6.1.1 Actions to address risks and opportunities: general", "From the issues and requirements, determine the risks and opportunities to address, plan actions for them, build the actions into the ISMS processes and evaluate whether they worked.", "Manila's own risk-planning sheet turns the issues of CTX-ISS and the requirements of CTX-IP into risks, approved by the Org CISO. It records no opportunities and no way of evaluating whether the actions worked. It has not been reviewed since it was written.", "", "", ""],
  ["6.1.2 Information security risk assessment", "Define and apply a risk assessment process: risk acceptance and assessment criteria, consistent and comparable results, risks identified with their owners, analysed and evaluated; keep it as documented information.", "Risk assessments use the Group method in every office and are reviewed each year; no measures or targets.", "", "", ""],
  ["6.1.3 Information security risk treatment", "Define and apply a risk treatment process: choose the treatment, determine the controls, compare them with Annex A, produce a Statement of Applicability, write a treatment plan and get the risk owners' approval.", "A risk treatment plan for Manila names an owner and a date for each risk, and the risk owners' approval is recorded. The Statement of Applicability is the Group's generic one, not yet worked out from Manila's own risks. The plan is Manila's own sheet and has not been reviewed.", "", "", ""],
  ["6.2 Information security objectives and planning to achieve them", "Set information security objectives that fit the policy, are measurable where practicable, monitored, communicated and updated; plan what will be done, with what, by whom, by when and how results are evaluated.", "Manila's four information security objectives for 2026 were set from the risk assessment and approved by the Org CEO with targets, owners and dates, by the Group procedure in SITL-POL-001 Section 6.2, as in every organisation. Progress is measured each quarter on the objectives dashboard against the Group's target of 80% on track, and an objective that falls behind gets a corrective plan: two did in the second quarter. The objectives themselves are reviewed each year.", "", "", ""],
  ["6.3 Planning of changes", "When the ISMS needs to change, carry the change out in a planned way.", "Changes to the ISMS are made as they come, decided by whoever asks for them, with no documented way of planning them and no record of most. Only one change, the SIEM's move to a hybrid set-up, was planned with a written impact note.", "", "", ""],
  ["7.1 Resources", "Determine and provide the resources the ISMS needs.", "The ISMS's resources for Manila (the CISO office, three GRC analysts, tools and a training budget) are approved in the Group's yearly budget cycle, the same way for every organisation, and the needs are reviewed each year. Nothing is measured against a target.", "", "", ""],
  ["7.2 Competence", "Determine the competence the roles need, make sure people have it through education, training or experience, act where they do not and evaluate whether that worked; keep evidence of competence.", "Manila keeps its own list of the skills each security role needs, approved by the Org CISO, and records of the training each person attended. Nobody checks whether the training made people competent, and the list has never been reviewed.", "", "", ""],
  ["7.3 Awareness", "People who work for the organisation are aware of the policy, of how they contribute to the ISMS, and of what happens if they do not conform.", "New agents get security awareness training once, at induction, from Manila's own slide deck, with attendance recorded; there is no refresher. In a spot check, four of ten agents could not say where to report a suspicious call. The deck has never been reviewed.", "", "", ""],
  ["7.4 Communication", "Determine what to communicate about the ISMS, when, with whom and how, inside and outside the organisation.", "What to communicate about the ISMS, when, to whom and how is set in the Group communication plan, which every office follows. Manila sends the monthly security bulletin and the quarterly client updates, with records, and the plan is reviewed each year.", "", "", ""],
  ["7.5 Documented information", "Keep the documented information the standard requires and the organisation needs, created and updated with identification, review and approval, and controlled so it is available, protected, distributed, retained and disposed of properly.", "The ISMS documents sampled in the Group library follow the Group document-control procedure (SITL-POL-000 Section 7): each has an ID, version, approver and review date. Retention and disposal are reviewed each year. The Manila IT team also keeps its own operating procedures on the office wiki, outside the library: the pages the analysis opened carry no version, owner or approval date.", "", "", ""],
  ["8.1 Operational planning and control", "Plan, run and control the processes needed to meet the requirements and carry out the planned actions; keep records showing they were carried out as planned; control changes and outsourced processes.", "The Group procedures say how the ISMS processes are run, but Manila keeps no record that they were carried out as planned. The payroll that the outside provider runs is not controlled: nobody checks the provider's work against the agreement.", "", "", ""],
  ["8.2 Information security risk assessment", "Perform risk assessments at planned intervals, and when significant changes are proposed or happen; keep the results.", "The Manila risk assessment was performed in March 2026 on the Group method, the same way as in every office, with the results in the risk register and the next yearly run booked for March 2027. It was not performed again when the office took on healthcare-claims clients in August 2026, a significant change, so no health-data risks are on the register.", "", "", ""],
  ["8.3 Information security risk treatment", "Carry out the risk treatment plan; keep the results.", "Manila tracks its treatment actions on its own tracker: 14 of 22 are done with evidence, and eight are overdue with no new date. The tracker has never been reviewed.", "", "", ""],
  ["9.1 Monitoring, measurement, analysis and evaluation", "Determine what to monitor and measure, how, when, and who analyses and evaluates the results and when; keep evidence of the results; evaluate the ISMS's performance and effectiveness.", "Manila reports the Group's KPIs each quarter, with records, but has not set what else it monitors, by which methods, or who analyses and evaluates the results and when. The reports are filed; nobody reviews them or acts on them.", "", "", ""],
  ["9.2 Internal audit", "Run internal audits at planned intervals to an audit programme (frequency, methods, responsibilities, reporting), with criteria and scope for each audit and objective auditors; report the results to management; keep evidence.", "No internal audit of the Manila ISMS has been held and none is planned: there is no audit programme, no auditor named and no audit report.", "", "", ""],
  ["9.3 Management review", "Top management reviews the ISMS at planned intervals, taking in the inputs Clause 9.3.2 lists (among them audit results and the status of nonconformities and corrective actions), and records its decisions.", "No management review has covered the Manila ISMS, and none is scheduled. There are no minutes and no decisions on record.", "", "", ""],
  ["10.1 Continual improvement", "Continually improve the suitability, adequacy and effectiveness of the ISMS.", "Improvements are made one at a time, when a client asks or after an incident. Nothing records that the ISMS as a whole is being made more suitable, adequate or effective, and nobody is asked to look for improvements.", "", "", ""],
  ["10.2 Nonconformity and corrective action", "When a nonconformity occurs, react and correct it, evaluate the need to remove its causes, act, review whether the action worked, and change the ISMS if needed; keep evidence of the nonconformities, actions and results.", "No nonconformity is identified or recorded at Manila: there is no log, no corrective-action procedure in use and nobody assigned to deal with nonconformities.", "", "", ""],
];
const GAP_LABELS = GAP_25.map((r) => r[0]);
const at612 = (r: string[]) => r[0].startsWith("6.1.2 ");
// Step 4 decides 6.1.2's level (his D3: A Level 2, B Level 3, C Level 4): written into column D from the checked answer.
const D3_LEVEL: Record<string, string> = { A: "Level 2 Managed", B: "Level 3 Defined", C: "Level 4 Quantitatively Managed" };

// T3.1 · LI-POL, the ISMS policy check, and POL-SET, the topic-specific policy register (template T-LI-POL). His workbook
// gives the seven Clause 5.2 items, the columns (item · Found/Gap · Section · Note), rule L08, the five leadership evidence
// items with their source, and POL-SET's twelve topics with ID, owner, approver, last review date and status. Platform-
// written, logged in docs/GRC101_Content_Corrections.md (T3.1): the notes of what to look for, sheet Leadership's eight
// statements and their sources, and the policy portal extract the owners' dates come from (Learn › Reference pages,
// Ref-Policy portal). Keys server-side (T3.1-2, -5, -6).
const POL_ITEMS: [string, string][] = [
  ["a) Appropriate to the purpose of the organisation", "A statement that the policy fits what the organisation does."],
  ["b) Includes information security objectives, or a framework for setting them", "Objectives, or how they are set and followed up."],
  ["c) A commitment to satisfy applicable requirements", "A commitment, and the kinds of requirement it covers."],
  ["d) A commitment to continual improvement of the ISMS", "A commitment to improve the ISMS, and how."],
  ["e) Available as documented information", "That the policy is kept under document control."],
  ["f) Communicated within the organisation", "How the workforce is told of the policy, and the record of it."],
  ["g) Available to interested parties, as appropriate", "How clients, regulators and other parties can obtain the policy."],
];
const POL_SECTIONS = ["Section 1", "Section 2", "Section 3.1", "Section 3.2", "Section 4", "Section 5", "Section 6.1", "Section 6.2", "Section 7.1", "Section 8", "Section 9", "Section 10", "Section 11"];
const NO_SECTION = "None: no section meets it";
const LEAD_ROWS = [
  "The information security policy, version 1.0, was approved by the Group GRC Steering Committee.",
  "The Org CEO makes sure the policy is put in place and resourced within the organisation.",
  "Department and asset owners run the first-line controls and keep the evidence.",
  "Top management chairs the ISMS management review, and its minutes record decisions on improvements, resources and risk acceptance.",
  "The Org CEO approves the security objectives, with their targets, owners and dates.",
  "The first issue of the policy was written by the Policy & Governance Analyst and reviewed by the Group CISO.",
  "The Group GRC Steering Committee approves the GRC roadmap and budget.",
  "Internal Audit gives independent assurance that the policy is complied with.",
];
const LEAD_SOURCES = ["SITL-POL-001 Section 5", "SITL-POL-001 Section 6.1", "SITL-POL-001 Section 6.2", "SITL-POL-001 Section 11", "SITL-POL-000 Section 2", "SITL-POL-000 Section 7", "GRC Charter Section 6", "GRC Charter Section 7.3"];
// ISO/IEC 27002:2022 Section 5.1's example topics, in its order (his step 6 lists them).
const POL_TOPICS = ["Access control", "Physical and environmental security", "Asset management", "Information transfer", "Secure configuration and handling of endpoints", "Networking security", "Incident management", "Backup", "Cryptography and key management", "Information classification and handling", "Management of technical vulnerabilities", "Secure development"];
// The 24 policies of SITL-POL-000 Section 3: ID, owner (Section 3) and last approval (Ref-Policy portal). build-li101.py
// asserts both against their sources.
const POL_INDEX: [string, string, string][] = [
  ["SITL-POL-001", "Group CISO", "2026-10-01"], ["SITL-POL-002", "Group Chief Risk Officer", "2026-10-01"],
  ["SITL-POL-003", "Group CIO", "2026-03-16"], ["SITL-POL-004", "Group CISO", "2026-10-01"],
  ["SITL-POL-005", "Group CISO", "2026-05-04"], ["SITL-POL-006", "Group CISO", "2026-10-01"],
  ["SITL-POL-007", "Security Architecture & Standards Manager", "2025-11-10"], ["SITL-POL-008", "Group Head of Facilities", "2024-08-14"],
  ["SITL-POL-009", "Group CIO", "2026-02-09"], ["SITL-POL-010", "Vulnerability Management Governance Analyst", "2026-10-01"],
  ["SITL-POL-011", "Security Architecture & Standards Manager", "2025-09-29"], ["SITL-POL-012", "Security Architecture & Standards Manager", "2026-06-22"],
  ["SITL-POL-013", "Vendor / Third-Party Risk Analyst", "2026-10-01"], ["SITL-POL-014", "Incident Response & Crisis Manager", "2026-10-01"],
  ["SITL-POL-015", "Business Continuity & Resilience Analyst", "2026-04-13"], ["SITL-POL-016", "Group Compliance Manager", "2026-10-01"],
  ["SITL-POL-017", "Group Data Protection Officer", "2026-10-01"], ["SITL-POL-018", "Group General Counsel", "2026-01-12"],
  ["SITL-POL-019", "Group CHRO", "2025-12-01"], ["SITL-POL-020", "Security Awareness & Training Specialist", "2026-10-01"],
  ["SITL-POL-021", "Security Architecture & Standards Manager", "2026-10-01"], ["SITL-POL-022", "Group CISO (with Group DPO)", "2026-10-01"],
  ["SITL-POL-023", "Group CISO (OT Security Lead)", "2026-07-06"], ["SITL-POL-024", "Cybersecurity Program Manager", "2026-10-01"],
];
const NO_POLICY = "None in the library";
const polOf = (id: string) => POL_INDEX.find((x) => x[0] === id);

// ---- The control sprints (T3.2, T4.1, T4.2, T6.1 … T10.2): his "Lead Implementer task library", tracker T-LI-CIT and
// datasets SPR-01 … SPR-13, none of which the platform held. li-sprints.json is the one source: per control its title,
// owner role, what it requires, and its sub-tasks with the evidence item each produces; per sprint its controls, its deep
// dives and its dataset's observations. build-li101.py builds Learn › Reference pages (LI-A.<control>, LI-Q fixed
// questions) and the datasets from the same file. A sprint task calls citRegister (its rows of the one tracker) and
// packRegister (its deep dives' evidence packs) with its own step numbers. Platform-written, logged in
// docs/GRC101_Content_Corrections.md (T3.2). Keys server-side (li101_written.json: status, level, evidence refs, next actions).
type LiControl = { title: string; guide: string; owner: string; requires: string[]; focus: string; subs: string[][] };
/** `n` orders the sprints; `label` is the sprint's own number where it is not `n` (T5.2's sprint 4a, between 3 and 4). */
type Sprint = { task: string; n: number; label?: string; ds: string; controls: string[]; deep: string[]; observed: Record<string, string>; next?: Record<string, string[]> };
const LI_CONTROLS = SPRINT_DATA.controls as Record<string, LiControl>;
// ponytail: through unknown, since JSON sprints with different control keys no longer overlap as a union (T5.2).
export const SPRINTS = SPRINT_DATA.sprints as unknown as Sprint[];
const sprintOf = (control: string) => SPRINTS.find((s) => s.controls.includes(control));
const NO_EVIDENCE = "None: nothing at the office shows it yet";
const extOf = (fmt: string) => fmt.match(/^([A-Z]{3,4})\b/)?.[1].toLowerCase();
/** A sub-task's evidence ref ("A.5.3-01"): every file handed in up to this task (its tracker aside), then the sub-task's
 *  own new item, then None. Choosing among them is the judgment: reuse, prepare from the dataset, or record a gap. */
const evidenceOpts = (desk: Desk, task: string, sub: string) => {
  const [c, i] = sub.split("-");
  const files = desk.order.slice(0, desk.order.indexOf(task) + 1).flatMap((t) => desk.tasks[t].subs.filter((s) => extOf(s.fmt) && !s.code.startsWith("CIT-")).map((s) => `${desk.mentee}_${t}_${s.code}_v1.${extOf(s.fmt)}`));
  return [...files, `${desk.mentee}_${task}_LI-${sub}_v1.${LI_CONTROLS[c].subs[Number(i) - 1][2]}`, NO_EVIDENCE];
};
// The tracker's worked row: LearnTech Educational Solutions, Amsterdam, the Maturity Model's Level 2 example.
const CIT_WORKED = [LT, "A.8.13", "Information backup", "Group CIO",
  "1) Backup copies of information, software and systems are kept, as the topic-specific policy on backup says. 2) They are tested regularly by restoring them. 3) The backup procedure is approved and the backups are logged.",
  "Amsterdam keeps its own backup procedure, approved by its IT lead; backups run every night with logs, and a restore is tested each month. No other office uses the procedure, and it has never been reviewed.",
  "Implemented", "Level 2 Managed", "AMS_Backup-Procedure_v3.pdf; AMS_Backup-Log_2026-Q3.csv",
  "Next: move to the Group backup procedure under SITL-POL-009, used in every office and reviewed yearly. Level 4 measure: % of monthly restore tests passed, target 100%, each quarter."];
/** One sprint's view of the tracker T-LI-CIT: the worked row, every earlier sprint's rows as their own tracker stands
 *  (read-only), and this sprint's controls, which its steps fill. Steps: `find` (open it, read the LI tasks), `status`,
 *  `level`, `first` (sub-task 01 of the controls that are not deep dives), `pack` (the evidence packs, whose refs and gaps
 *  fill F and G of the deep dives), `handIn`. Columns 4 and 5 are read-only: the LI task's requirements and the dataset. */
const citRegister = (task: string, at: { find: number; status: number; level: number; pack: number; first?: number; handIn: number }): Register => {
  // `first` is absent where every sprint control is a deep dive (T6.1: A.6.3 alone): no first-evidence step.
  const fx = <T,>(v: T): Record<number, T> => (at.first ? { [at.first]: v } : {});
  const sp = SPRINTS.find((s) => s.task === task)!;
  const ours = (c: string) => sp.controls.includes(c);
  const first = (c: string) => ours(c) && !sp.deep.includes(c);
  const row = (s: Sprint, c: string) => [GC, c, LI_CONTROLS[c].title, LI_CONTROLS[c].owner, LI_CONTROLS[c].requires.map((x, i) => `${i + 1}) ${x}`).join(" "), s.observed[c], "", "", "", ""];
  const earlier = (c: string, ci: number, p: Progress) => {
    const s = sprintOf(c);
    if (!s || s.task === task) return null;
    const reg = REGISTERS[`${s.task} CIT`];
    if (!reg) return null; // an earlier sprint whose tracker is not built yet: its rows show as given
    // Not the worked row: it is A.8.13 too, which sprint 11 (T9.2) rates for Manila.
    return standing(reg, p, s.task, reg.rows.findIndex((r) => r !== CIT_WORKED && r[1] === c), ci);
  };
  // A deep dive's F and G, from its evidence pack: the refs chosen, and the gaps written where the ref is None.
  const fromPack = (c: string, p: Progress, ci: 8 | 9) => {
    const pack = REGISTERS[`${task} PACK`];
    const ris = pack.rows.map((r, ri) => (r[0] === c ? ri : -1)).filter((ri) => ri >= 0);
    const refs = ris.map((ri) => standing(pack, p, task, ri, 5));
    if (refs.some((x) => !x)) return "";
    if (ci === 8) return refs.filter((x) => x !== NO_EVIDENCE).join("; ") || NO_EVIDENCE;
    return ris.filter((ri) => standing(pack, p, task, ri, 5) === NO_EVIDENCE).map((ri) => standing(pack, p, task, ri, 6)).join(" ") || "—";
  };
  return {
    code: `CIT-S${sp.label ?? sp.n}`,
    title: `CIT-S${sp.label ?? sp.n} · Control implementation tracker, sprint ${sp.label ?? sp.n} (template T-LI-CIT)`,
    stamp: `Sprint ${sp.label ?? sp.n}: ${sp.controls.join(", ")}`,
    on: [at.find, at.status, at.level, ...(at.first ? [at.first] : [])],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "A Control", w: 70, what: "The Annex A control of ISO/IEC 27001:2022." },
      { h: "B Title", w: 100, what: "The control's title in the standard." },
      { h: "C Owner role", w: 110, what: "The role that owns the control at the office." },
      { h: "What it requires (LI task)", prose: true, w: 190, what: "The requirements on the control's LI task page, numbered." },
      { h: "Observed at Manila (sprint dataset)", prose: true, w: 210, what: `What dataset ${sp.ds} found at the office: the facts you decide from.` },
      { h: "D Status", opts: "step", w: 130, what: "Implemented, Partially implemented or Not implemented." },
      { h: "E Maturity level", opts: "step", w: 140, what: "Level 1 to 3, by the Maturity Model's questions." },
      { h: "F Evidence ref", opts: (desk, r) => (first(r[1]) ? evidenceOpts(desk, task, `${r[1]}-01`) : undefined), wrap: true, w: 230, what: "The file in 02_Working that holds the evidence." },
      { h: "G Gap / next action", opts: (_d, r) => sp.next?.[r[1]], prose: true, w: 260, what: "The gap, or the next action to Level 3 and the Level 4 measure." },
    ],
    rows: [CIT_WORKED, ...[...SPRINTS].sort((a, b) => a.n - b.n).filter((s) => s.n <= sp.n).flatMap((s) => s.controls.map((c) => row(s, c)))],
    mine: (r) => r !== CIT_WORKED && ours(r[1]),
    studyAll: [at.find],
    steps: { [at.status]: [6], [at.level]: [7], ...fx([8, 9]) },
    only: fx((r: string[]) => first(r[1])),
    ident: [1, 2],
    // The status is decided from what the control requires against what was observed; the level from what was observed,
    // with the status beside it; the next action from the level.
    view: { [at.status]: [4, 5], [at.level]: [5, 6], ...fx([5, 7]) },
    derived: {
      6: { from: [1], value: (v, p) => earlier(v(1), 6, p) },
      7: { from: [1], value: (v, p) => earlier(v(1), 7, p) },
      8: { from: [1], value: (v, p) => earlier(v(1), 8, p) ?? (sp.deep.includes(v(1)) ? fromPack(v(1), p, 8) : null), waits: () => `From the evidence pack (step ${at.pack})` },
      9: { from: [1], value: (v, p) => earlier(v(1), 9, p) ?? (sp.deep.includes(v(1)) ? fromPack(v(1), p, 9) : null), waits: () => `From the evidence pack (step ${at.pack})` },
    },
    note: {
      [at.status]: () => `Compare each control's observations with What it requires, one requirement at a time (fixed question LI-Q4; the eight fixed questions are on the page LI-Q fixed questions, in Learn › Reference pages). Implemented: every requirement is met at the office. Partially implemented: some are met. Not implemented: none is met, or what exists does not operate. Each control's LI task page (LI-${sp.controls[0]} …, in Learn › Reference pages) names the ISO/IEC 27002:2022 section of its guidance.`,
      [at.level]: () => "Decide each control's level from what was observed at the office, with the Maturity Model (Ref-Maturity Model, in Learn › Reference pages). Ask its questions in order and stop at the first No. 1) Is there a documented, approved way of doing it, and records that it is done? No → Level 1. 2) Is it the Group's standard way, done the same in every office, and reviewed at least once a year? No → Level 2. 3) Is it measured against targets, with the results tracked and acted on? No → Level 3. Status and level are separate questions: the level rates how what is in place at the office is done.",
      ...fx(() => `For ${sp.controls.filter(first).join(", ").replace(/, ([^,]+)$/, " and $1")}, record sub-task 01 of the LI task (its first evidence item) in column F. Choose a file you already handed in where it holds the item (LI-Q7: reuse before writing new); else the item's own new file, where the dataset holds the records it is prepared from; else None. In column G choose the next action that takes the control to Level 3 (or keeps it there, where it is at Level 3 already) and the Level 4 measure you would track (LI-Q2, Ref-Maturity Model). F and G are checked together. The deep dives' F and G fill from your evidence pack (step ${at.pack}).`),
    },
    reads: { [at.find]: ["learn|Reference pages"], [at.status]: ["learn|Reference pages"], [at.level]: ["learn|Reference pages"], ...fx(["learn|Reference pages"]) },
    checkRows: { [at.status]: { label: 1, col: 6 }, [at.level]: { label: 1, col: 7 }, ...fx({ label: 1, col: 8, with: 9 }) },
    handIn: { step: at.handIn, cols: [6, 7, 8, 9], ident: [1] },
  };
};
/** One sprint's evidence packs (his "LI-A evidence packs"): every sub-task of each deep-dive control's LI task, its
 *  evidence ref chosen (a file handed in, the item's own new file, or None) and, where None, the gap and next action
 *  written. */
const packRegister = (task: string, step: number, handIn: number, hc: string, also: string[] = []): Register => {
  const sp = SPRINTS.find((s) => s.task === task)!;
  // who: what happens to the gaps, in words (nothing but a format check; no person reads them).
  const who = hc;
  return {
    code: "LI-A",
    title: `LI-A · Evidence packs for ${sp.deep.join(" and ")} (Lead Implementer task library)`,
    stamp: "Evidence packs",
    on: [step],
    cols: [
      { h: "Control", w: 70, what: "The deep-dive control the sub-task belongs to." },
      { h: "Sub-task", w: 100, what: "The sub-task, numbered as on the control's LI task page." },
      { h: "What you do", prose: true, w: 230, what: "What the sub-task asks, from the LI task page." },
      { h: "Evidence item it produces", prose: true, w: 200, what: "The evidence the sub-task produces, from the LI task page." },
      { h: "Observed at Manila (sprint dataset)", prose: true, w: 260, what: "What the sprint's dataset saw at the office for the control." },
      { h: "Evidence ref (file in 02_Working)", opts: (desk, r) => evidenceOpts(desk, task, r[1].slice(3)), wrap: true, w: 240, what: "The file that holds the evidence item, or None." },
      { h: "Gap and next action", prose: true, w: 240, what: "Where the ref is None: what is missing, and the next action." },
    ],
    rows: sp.deep.flatMap((c) => LI_CONTROLS[c].subs.map(([what, item], i) => [c, `LI-${c}-${String(i + 1).padStart(2, "0")}`, what, item, sp.observed[c], "", ""])),
    mine: () => true,
    steps: { [step]: [5, 6] },
    ident: [1],
    view: { [step]: [3, 4] },
    // A ref that is a file needs no gap: "—" by itself. A gap is written only where the ref is None.
    derived: { 6: { from: [5], value: (v) => (v(5) === NO_EVIDENCE ? null : v(5) ? "—" : ""), waits: () => "Written where the ref is None" } },
    cells: {
      6: {
        fix: (v) => (words(v) >= 8 ? v.trim() : null),
        hint: () => `Write what is missing and the next action, with its owner, in eight words or more, as in "No restore test records at Amsterdam. Next: run and record a monthly restore test, owner the IT lead." ${who[0].toUpperCase()}${who.slice(1)}.`,
      },
    },
    note: {
      [step]: () => `Each row is a sub-task of the LI task of ${sp.deep.join(" or ")} (its page is in Learn › Reference pages). For each, choose the evidence ref: a file you already handed in, where it holds the evidence item (LI-Q7: reuse before writing new); else the item's own new file (${task}_LI-…), where the dataset holds the records it is prepared from; else None, where nothing at the office shows it yet. The Observed column is what dataset ${sp.ds} saw at the office for the row's control. Where you choose None, write the gap and the next action in the last column: ${who}. The refs are checked; they fill column F of the tracker, and the gaps column G.`,
    },
    reads: { [step]: ["learn|Reference pages", ...also] },
    checkRows: { [step]: { label: 1, col: 5 } },
    handIn: { step: handIn, cols: [5, 6], ident: [1] },
  };
};

// T8.1 · IR-TTX, the tabletop exercise record (his new item TTX / T-LI-TTX): the six injects of dataset TTX (li-ttx.json), each
// with its incident phase (step 2), the decision taken (steps 3 and 4 for INJ-3 and INJ-5), its owner and its control; and sheet
// Notification, the deadline of step 4 (rule R30, SITL-POL-014 Section 6.3). Platform-written, logged in
// docs/GRC101_Content_Corrections.md (T8.1). Keys server-side (li101_written_T8.1.json: T8.1-2, T8.1-4 and the sprint's).
const TTX = TTX_DATA as { scenario: string; injects: string[][]; clock: string[] };
// His step 3 options, as the record writes the decision taken (the key's, once checked).
const TTX_D2: Record<string, string> = {
  A: "Evidence preserved with a chain-of-custody record, then contained",
  B: "Laptop reimaged at once to stop the spread",
  C: "User asked to delete their personal files first",
};
const ttxControl = (phase: string) => { const c = phase.match(/\((A\.\d+\.\d+)\)/)?.[1]; return c ? `${c} ${LI_CONTROLS[c]?.title ?? ""}`.trim() : ""; };
const T81_FIRST = "For A.5.5, A.5.25, A.5.26, A.5.27 and A.6.8, record sub-task 01 of the LI task (its first evidence item) in column F. Choose a file you already handed in where it holds the item (LI-Q7: reuse before writing new); else the item's own new file, where the dataset holds the records it is prepared from; else None. In column G choose the next action and the Level 4 measure you would track (LI-Q2, Ref-Maturity Model): for a control below Level 3, the step that takes it to Level 3; for one at Level 3 already, the step that closes its gap at the office. Each control's level is in column E, as step 7 checked it. F and G are checked together. The deep dives' F and G fill from your evidence pack (step 8).";

// T9.1 · PHY-WALK, the walkthrough checklist and findings (his new item PHY / T-LI-PHY): sheet Floor plan (the plan's points,
// each marked by who may be there, step 1) and sheet Photos (the 20 photos, each matched to an A.7 control and judged good
// practice or a gap, step 2). Dataset PHY is li-phy.json, drawn by components/desk/phy-plan.tsx. Platform-written, logged in
// docs/GRC101_Content_Corrections.md (T9.1). Keys server-side (li101_written_T9.1.json: T9.1-1, T9.1-2).
const PHY = PHY_DATA as { rule: string; markings: string[]; points: string[][]; photos: string[][] };
const A7 = Object.entries(LI_CONTROLS).filter(([c]) => c.startsWith("A.7.")).map(([c, x]) => `${c} ${x.title}`);
const GAP_OR_GOOD = ["Good practice", "Gap"];

// T8.2 · BIA-RTO, the business impact extract (his new item T-LI-BIA) and dataset BIA-5 (his "five Manila services with
// RTO/RPO and the last DR test results"): each service's objectives from Manila's business impact analysis and what the full
// DR failover test of 13 June 2026 logged. The learner works out the time to recover and the data lost from the test's
// times, and Met / Not met. build-li101.py asserts the dataset's rows are these. Platform-written, logged in
// docs/GRC101_Content_Corrections.md (T8.2). Keys server-side (li101_written_T8.2.json).
const BIA_5 = [
  ["Customer service (inbound and outbound)", "CRM platforms (Salesforce, HelpLoop)", "4 h", "1 h", "2026-06-13 06:00", "2026-06-13 15:00", "2026-06-13 05:30"],
  ["Voice calls", "PBX/telephony and VoIP/UCaaS platforms", "2 h", "15 min", "2026-06-13 06:00", "2026-06-13 07:30", "2026-06-13 05:50"],
  ["Back-office data processing", "Production delivery platform", "8 h", "4 h", "2026-06-13 06:00", "2026-06-13 13:00", "2026-06-13 02:00"],
  ["Quality monitoring and call recording", "Call recording servers", "24 h", "24 h", "2026-06-13 06:00", "2026-06-14 05:00", "2026-06-12 03:00"],
  ["Agent scheduling", "Workforce management system", "12 h", "8 h", "2026-06-13 06:00", "2026-06-13 14:00", "2026-06-13 00:00"],
];
/** A typed duration ("9", "9h", "1 h 30 min", "90 minutes", "1.5 hours", "1:30") in one form, "1 h 30 min", or null. */
export const duration = (v: string): string | null => {
  const s = v.trim().toLowerCase().replace(",", ".");
  let mins: number;
  const clock = s.match(/^(\d+):([0-5]\d)$/);
  // A bare number is hours; otherwise each part carries its unit ("30 min" is never "3 h 0 min").
  const hm = /^\d+(?:\.\d+)?$/.test(s) ? [s, s] : s.match(/^(?:(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?))?\s*(?:(\d+)\s*(?:m|mins?|minutes?))?$/);
  if (clock) mins = Number(clock[1]) * 60 + Number(clock[2]);
  else if (hm && (hm[1] || hm[2])) mins = Math.round(Number(hm[1] ?? 0) * 60) + Number(hm[2] ?? 0);
  else return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};
const DURATION_HINT = 'Write a duration in hours and minutes, as in "2 h 15 min" or "45 min".';
// T8.2 · OBL-REG (template T-OBL) and the RoPA entry (template T-ROPA), step 3: one sheet for the two, since the step fills
// both. The obligations: Manila's, from SITL-ADD-16 Sections 2, 2.1 and 6, split by rule R10, a duty listed twice kept once,
// each with its type (Section 2.2's Article column) and the SITL policy it links to; the owner fills from that policy
// (R10). The RoPA entry: the customer-support activity described on Regulatory Watch › RoPA & Data Flows. Platform-written,
// logged (T8.2).
const OBL_CHOICES = [
  "Appoint a Data Protection Officer",
  "Carry out a Privacy Impact Assessment for each new BPO contract",
  "Comply with the NPC's BPO sector audits",
  "Document and validate the PCI DSS scope every year (Req. 12.5)",
  "Give all staff privacy awareness training every year",
  "Keep the card-data environment segmented",
  "Meet the PCI DSS scope, segmentation and ASV scan duties",
  "Notify affected data subjects of a breach within 72 hours",
  "Notify the NPC and data subjects of a breach within 72 hours",
  "Notify the NPC of a breach within 72 hours",
  "Notify the supervisory authority of a breach within 72 hours (GDPR Art.33)",
  "Register the data processing systems with the NPC",
  "Run a crisis tabletop exercise every year",
  "Run quarterly ASV scans",
  "Sign BAAs and apply the HIPAA Security Rule safeguards",
];
const OBL_TYPES = ["Statutory", "Regulatory", "Contractual"];
const OBL_READ: [string, string][] = [
  ["OBL-01", "SITL-ADD-16 Section 2, the Manila row's breach notification"],
  ["OBL-02", "SITL-ADD-16 Section 2, the Manila row's breach notification"],
  ...["OBL-03", "OBL-04", "OBL-05", "OBL-06", "OBL-07"].map((id): [string, string] => [id, "SITL-ADD-16 Section 2.1"]),
  ...["OBL-08", "OBL-09", "OBL-10"].map((id): [string, string] => [id, "SITL-ADD-16 Section 6, the overlays whose Applies to includes Manila"]),
];
const ROPA_FIELDS: [string, string, string[]][] = [
  ["Role (R29)", "RoPA & Data Flows: Clients and Who decides, held against SITL-POL-017 Section 3.2", ["Controller", "Joint controller", "Processor", "Sub-processor"]],
  ["Lawful basis", "RoPA & Data Flows: Why it is needed, through the questions of SITL-POL-017 Section 3.1", ["Legal obligation (GDPR Art.6(1)(c))", "Contract (GDPR Art.6(1)(b))", "Consent (GDPR Art.6(1)(a))", "Legitimate interests (GDPR Art.6(1)(f))"]],
  ["DPIA screening: triggers involved (R29)", "RoPA & Data Flows, every field, held against the five triggers of SITL-POL-017 Section 6.2", ["None", "Monitoring or recording", "Health data", "Identity checks (KYC/AML)", "AI, analytics or profiling"]],
  ["DPIA required (R29)", "SITL-POL-017 Section 6.2, with the role and the screening above", ["No: no trigger is involved", "Yes: GlobalConnect carries out the DPIA before the processing starts", "Yes: the client carries it out; GlobalConnect records the screening and tells the client"]],
];

// T3.2 · LI-RACI, the ISMS RACI (template T-LI-POL, sheet RACI), and its header: the two Clause 5.3 assignments. His
// workbook gives the ten processes (LI-SCOPE, F2.1), the GRC Charter Section 16 RACI and "only one Accountable".
// Platform-written, logged in docs/GRC101_Content_Corrections.md (T3.2): Consulted and Informed per process, read from the
// process's Charter row (or written from SITL-POL-001 where it has none), the Org CEO among the roles, the header's rows.
const RACI_ROLES = (desk: Desk) => [...(desk.tasks["F2.1"]?.steps[4]?.opt ?? []), "Org CEO"];
const RACI_CI: Record<string, [string, string]> = {
  "Context and scope review": ["Pol, Risk, Comp, DPO", "PgM, Aud"],
  "Risk assessment and treatment": ["PgM, TPRM, Comp, DPO, Priv, BCM, IR, CTI, Arch, VM", "Pol, Aud, Awr"],
  "Policy management": ["PgM, Risk, TPRM, Comp, DPO, Priv, BCM, Awr, IR, Arch, VM", "Aud, CTI"],
  "Document control": ["PgM, Risk, TPRM, Comp, DPO, Priv, BCM, Awr, IR, Arch, VM", "Aud, CTI"],
  "Competence and awareness": ["PgM, Pol, Comp, DPO, Priv, IR, CTI", "Risk, TPRM, Aud, BCM, Arch, VM"],
  "Incident management": ["DPO (R for personal-data breaches), Risk, TPRM, Comp, Priv, BCM, Awr, CTI, Arch, VM", "PgM, Pol, Aud"],
  "Supplier security": ["Pol, Risk, Comp, DPO, Priv, BCM, CTI, Arch", "PgM, Aud, Awr, IR, VM"],
  "Internal audit": ["Risk, Comp, DPO", "CISO, PgM, Pol, TPRM, Priv, BCM, Awr, IR, CTI, Arch, VM"],
  "Management review": ["Comp (collects the inputs), Risk, Aud", "Pol, Awr, IR, TPRM"],
  "Corrective action": ["PgM, Pol, Risk, TPRM, Aud, DPO, Priv, BCM, IR, Arch, VM", "Awr, CTI"],
};
const HEAD_ROWS = ["a) Making sure the ISMS conforms to ISO/IEC 27001", "b) Reporting on the performance of the ISMS to top management"];
const HEAD_SOURCES = ["SITL-POL-001 Section 5", "SITL-POL-001 Section 6.2", "GRC Charter Section 13", "GRC Charter Section 15.1"];

// T4.2 · LI-CHAIN, the asset–threat–control chains (template T-LI-CHAIN), RR-UPD, the Manila register's three new risks, and
// its sheet Change log. His workbook gives the chain's links, three assets (one information, two supporting), R06, R07, R36,
// R22 and THR-5's VPN item. Platform-written, logged in docs/GRC101_Content_Corrections.md (T4.2): the chains' facts (from
// THR-5, the September spot check and the October firewall rule review), the three drafts per chain, the LearnTech worked
// chain (T5.1's R-36-AMS-07), the IDs R-16-HQ-16 … 18 (the register on Risk Register › Score Risk ends at 15) and the choices.
// T5.1 treats exactly these risks. Keys server-side (T4.2-2, -3, -5).
const LIKE = ["1 Rare", "2 Unlikely", "3 Possible", "4 Likely", "5 Almost certain"];
const IMPACT = ["1 Minimal", "2 Minor", "3 Moderate", "4 Major", "5 Severe"];
const DRAFT_OPTS = ["Draft 1", "Draft 2", "Draft 3"];
const CHAIN_DRAFTS: Record<string, string[]> = {
  "Learning management platform": [
    "Because phishing attacks are common, an attacker may phish an administrator, leading to a security incident, for the learning management platform.",
    "Because the learning platform's administrator accounts sign in with a password alone, an attacker who phishes one may take over the platform, leading to students' records being exposed, for the learning management platform.",
    "Because the learning platform's administrator accounts sign in with a password alone, an attacker who phishes one may take over the platform and change students' grades, leading to students' records being exposed and grades altered, for the learning management platform.",
  ],
  "Remote-access VPN gateway": [
    "Because the remote-access VPN gateway runs a version with a flaw that attackers are actively exploiting, an attacker may get into the Manila network and encrypt the call recording servers, leading to client customer data being exposed and calls being stopped, for the remote-access VPN gateway.",
    "Because the remote-access VPN gateway runs a version with a flaw that attackers are actively exploiting, an attacker may get into the Manila network without valid credentials, leading to client customer data on the delivery platform being exposed, for the remote-access VPN gateway.",
    "Because the vendor has issued a fix for the VPN product, the fix may not be applied in time, leading to a vulnerability remaining on the gateway, for the remote-access VPN gateway.",
  ],
  "Client transaction data": [
    "Because attackers intercept file transfers to BPO providers about once a year in the region, an interception may occur, leading to a data breach, for client transaction data.",
    "Because one client still sends its weekly transaction file to a legacy FTP server at Manila without encryption, the file may be intercepted in transit, leading to the client's customer data being disclosed, for the legacy FTP server.",
    "Because one client still sends its weekly transaction file to a legacy FTP server at Manila without encryption, the file may be intercepted in transit, leading to the client's customer data being disclosed, for client transaction data.",
  ],
  "Call-centre workstations": [
    "Because agents leave their workstations unattended during breaks, a colleague or visitor on the call floor may see client records on screen, leading to client customer data being disclosed, for the call-centre workstations.",
    "Because visitors may not be escorted, someone may walk onto the call floor, leading to a breach of the visitor procedure, for the call-centre workstations.",
    "Because agents leave their workstations unattended during breaks, a visitor may see client records on screen or take a headset, leading to client customer data being disclosed and equipment lost, for the call-centre workstations.",
  ],
};
const draftsText = (asset: string) => CHAIN_DRAFTS[asset].map((d, i) => `Draft ${i + 1}: ${d}`).join(" ");
/** The chain's chosen draft ("Draft 2") as its text. */
const draftOf = (asset: string, pick: string) => (pick ? CHAIN_DRAFTS[asset]?.[Number(pick.replace("Draft ", "")) - 1] ?? "" : "");
// Organisation · Asset · Asset type (asset register) · Threat · Vulnerability · Consequence · Existing controls · Annex A control ·
// Risk statement (from sheet Drafts) · Likelihood · Impact · Inherent.
const CHAIN_ROWS: string[][] = [
  [LT, "Learning management platform", "Supporting asset (Amsterdam office), owner the Head of Learning Platforms",
    "Phishing of the platform's administrators: several times a year at Amsterdam.",
    "Administrator accounts sign in with a password alone.",
    "Students' records on the platform exposed: large-scale personal-data harm.",
    "Phishing awareness at induction: working.", "A.8.5 Secure authentication", CHAIN_DRAFTS["Learning management platform"][1], "5 Almost certain", "4 Major", ""],
  [GC, "Remote-access VPN gateway", "Supporting asset: part of A-HQ-07 Core network & infrastructure",
    "Attackers exploiting the flaw in the office's VPN product (THR-5 item 2): reported several times a year across the sector.",
    "The gateway runs the version with the flaw; the vendor's fix is not applied. Night-shift supervisors and IT on-call staff reach the network only through it.",
    "Client customer data on the production delivery platform exposed: large-scale personal-data harm, and client loss.",
    "Firewall rules that limit VPN users to the agent desktop network: not working (the October rule review found an any-to-any rule left from a migration).",
    "A.8.8 Management of technical vulnerabilities", "", "", "", ""],
  [GC, "Client transaction data", "Information asset: A-HQ-10",
    "Interception of files sent to BPO providers over plain FTP (THR-5 item 4): reported about once a year in the region.",
    "One client still sends its weekly transaction file to a legacy FTP server at Manila without encryption; its other files go through the delivery platform's encrypted upload.",
    "The client's customer data disclosed: large-scale personal-data harm, and fines or formal enforcement under the Data Privacy Act 2012.",
    "The FTP server accepts connections only from the client's IP addresses: working.",
    "A.5.14 Information transfer", "", "", "", ""],
  [GC, "Call-centre workstations", "Supporting asset: A-HQ-18 Call-centre workstations and headsets",
    "A colleague or an unescorted visitor reading client records on a screen left unattended: about once a year on the call floor (September call-floor spot check).",
    "Agents leave their workstations unattended during breaks.",
    "A few client records seen by someone not entitled to them: moderate data harm, and a reportable breach.",
    "1) Screens lock after 5 minutes idle: working. 2) Visitors are escorted on the call floor: not working (two unescorted visitors in the September spot check).",
    "A.7.7 Clear desk and clear screen", "", "", "", ""],
];
const RR_IDS = ["R-16-HQ-16", "R-16-HQ-17", "R-16-HQ-18"];
/** Per new risk: which of the chain's existing controls may count (rule R07: each working one takes one off the likelihood). */
const WORKING: string[][] = [
  ["None of them works", "Firewall rules limiting VPN users"],
  ["None of them works", "IP allow-list on the FTP server"],
  ["None of them works", "Screen lock after 5 minutes", "Visitor escort on the call floor", "Screen lock and visitor escort"],
];
const RR_OWNERS = ["Chief Information Officer", "Chief Delivery Officer", "Head of Infrastructure", "Chief Information Security Officer (CISO)", "Cyber Risk Manager", "Cyber Threat Intelligence Analyst"];
const RR_EVENTS = ["THR-5 item 2 (brief of 26 October 2026)", "THR-5 item 4 (brief of 26 October 2026)", "Call-floor spot check (September 2026)"];
const band = (s: number) => (s <= 5 ? "Low" : s <= 11 ? "Medium" : s <= 19 ? "High" : "Critical");
const lead = (v: string) => Number(v.split(" ")[0]) || 0;
/** "5 × 4 = 20 Critical" from a likelihood and an impact ("5 Almost certain", "4 Major"). */
const scoreOf = (l: number, i: number) => (l && i ? `${l} × ${i} = ${l * i} ${band(l * i)}` : "");
const chainAt = (p: Progress, ri: number, ci: number) => standing(REGISTERS["T4.2"], p, "T4.2", ri + 1, ci);
/** The draft chosen on sheet Drafts for the i-th Manila chain ("Draft 2"). */
const draftAt = (p: Progress, i: number) => standing(REGISTERS["T4.2 DRAFTS"], p, "T4.2", i, 3);
const ASSET_ROW = (asset: string) => CHAIN_ROWS.slice(1).findIndex((r) => r[1] === asset);
const workingCount = (v: string) => (!v ? -1 : v.startsWith("None") ? 0 : v.includes(" and ") ? 2 : 1);

// T4.1 · LI-RAM, the risk assessment method card (template T-LI-RAM, one page). His step 1 lists its seven lines; the
// statements and sources offered on each line are platform-written (logged, T4.1), each read in a different place (the
// other criticality bands' values, a nearby section), so the line is chosen by reading. Key server-side (T4.1-1).
const RAM_PARTS = ["1 Risk acceptance criteria", "2 Criteria for performing risk assessments", "3 Likelihood and impact scales (5×5 matrix)", "4 Risk appetite", "5 Who owns a risk", "6 Who may accept a risk (R36)", "7 Where the records are kept"];
const RAM_STATEMENTS: Record<string, string[]> = {
  "1 Risk acceptance criteria": [
    "A risk may be retained whenever its owner signs an acceptance, whatever its score",
    "A risk within the appetite may be retained and monitored; above it, it is treated; a Critical risk is never retained",
    "Only a Low risk (score 1–5) may be retained; every Medium, High or Critical risk is treated",
  ],
  "2 Criteria for performing risk assessments": [
    "Every office assessed on the same SITL-ERM-001 scales and matrix, refreshed each year",
    "Every office assessed on the same scales, refreshed each quarter, with FAIR for the top risks",
    "Each office chooses its own scales and refreshes its assessment when it sees fit",
  ],
  "3 Likelihood and impact scales (5×5 matrix)": [
    "Likelihood 1 to 5 from the asset's tier, impact 1 to 5 from its criticality. Score L + I: Low 2–4, Medium 5–6, High 7–8, Critical 9–10",
    "Likelihood 1 Rare to 5 Almost certain, impact 1 Minimal to 5 Severe. Score L × I: Low 1–4, Medium 5–9, High 10–16, Critical 20–25",
    "Likelihood 1 Rare to 5 Almost certain, impact 1 Minimal to 5 Severe. Score L × I: Low 1–5, Medium 6–11, High 12–19, Critical 20–25",
  ],
  "4 Risk appetite": [
    "Maximum residual score 8 (Medium-low): averse",
    "Maximum residual score 10 (Medium): cautious",
    "Maximum residual score 11 (upper Medium): balanced",
  ],
  "5 Who owns a risk": [
    "The Cyber Risk Manager, who runs the office assessments and keeps the registers",
    "The manager accountable for the asset or process the risk affects, with the authority to decide its treatment",
    "The Org CISO, for every information security risk of the office",
  ],
  "6 Who may accept a risk (R36)": [
    "Low: the risk owner. Medium: the Org CRCO. High: the Org CEO with the Group CISO. Critical: not acceptable (Board)",
    "Low: the Org CRCO. Medium: the Org CEO. High: the Group GRC Steering Committee. Critical: not acceptable (Board)",
    "Low: the Org CEO. Medium: the Group GRC Steering Committee. High: the BRAC. Critical: not acceptable (Board)",
  ],
  "7 Where the records are kept": [
    "In Manila's own risk spreadsheet, kept by the Org CISO",
    "In the office risk register on the Group GRC platform, with a change-log row for every change",
    "In each risk owner's own files, sent to the Group once a year",
  ],
};
const RAM_SOURCES: Record<string, string[]> = {
  "1 Risk acceptance criteria": ["SITL-POL-002 Section 6.1", "SITL-POL-002 Section 3.1", "SITL-ERM-001 Section 6.4"],
  "2 Criteria for performing risk assessments": ["SITL-POL-002 Sections 3.1 and 4", "SITL-ERM-001 Section 6.6", "SITL-ERM-001 Section 8"],
  "3 Likelihood and impact scales (5×5 matrix)": ["SITL-ERM-001 Section 6.5", "SITL-STD-001 Section 3.1", "SITL-ERM-001 Sections 6.2–6.4"],
  "4 Risk appetite": ["SITL-ERM-001 Section 7", "SITL-ERM-001 Section 4", "SITL-ADD-16 Section 5"],
  "5 Who owns a risk": ["SITL-POL-002 Section 3.1", "SITL-POL-002 Section 6.2", "SITL-ERM-001 Section 3"],
  "6 Who may accept a risk (R36)": ["SITL-ERM-001 Section 3", "GRC Charter Section 6.1", "SITL-POL-002 Section 5"],
  "7 Where the records are kept": ["SITL-ERM-001 Section 8", "SITL-POL-002 Section 6.1", "SITL-POL-002 Section 3.1"],
};

// T7.2 · VEN-TIER, the tiering record (template T-VEN), VEN-CL, the contract clause checklist, and LI-CLD, the cloud &
// supply-chain addendum (his new item T-LI-CLD). His workbook gives rules R35, R27 and L19, the seven clauses of step 2, the
// SaaS ticketing tool and the options of steps 8 and 9. Platform-written, logged in docs/GRC101_Content_Corrections.md (T7.2):
// SPR-07's three Manila suppliers (fictional names; the KYC identity-check provider of SITL-ADD-16 Section 9.1, the payroll
// provider of F2.1 step 2, and the service desk's SaaS ticketing tool), their intake forms and contract clauses, the clause
// checklist's tier marks, the matrix rows and Deskline's answers to the fixed questions. Keys server-side
// (li101_written_T7.2.json: T7.2-1, -2, -8).
const VEN_TIERS = ["Critical", "High", "Medium", "Low"];
const VEN_TERMS = ["Tier 4 data", "Children's data at scale", "Customer-facing or regulatory-critical service, hard to replace", "Tier 3 personal or confidential data at volume", "Revenue-critical service", "Limited personal or pseudonymous data, easy to replace", "Only public or anonymous data"];
// Supplier · service · data received · volume · users · business criticality · substitutability · delivery and hosting (the
// last is LI-CLD's service-model line, step 8).
const VEN_ROWS: string[][] = [
  ["Deskline Cloud Pte. Ltd.", "SaaS ticketing tool of the Manila service desk: agents log and answer client customers' tickets by e-mail and chat, beside the CRM platforms", "End-customers' names, e-mail addresses, phone numbers, ticket text and CRM interaction history. Card numbers and health details are masked before a ticket is saved.", "About 1.2 million tickets a year from about 400,000 end-customers, a continuous feed", "Manila agents; client end-customers receive the replies", "Customer service operations", "Moderate: about three months to move to another tool", "Deskline runs the application, its database and the servers under them in its own cloud; Manila sets up who may sign in (through Manila single sign-on), roles, ticket fields and retention. Hosted in Singapore."],
  ["VeriPass Identity Services Inc.", "Identity checks for the KYC processes of financial-services clients (SITL-ADD-16 Section 9.1: KYC verification service and identity-check provider). A new supplier: its contract is a draft", "Images of end-customers' passports and national ID cards, with their ID numbers, and a selfie matched to the ID photo: biometric data used to identify each person (special-category personal data)", "About 30,000 checks a year", "Manila KYC agents; each result goes into the client's customer onboarding", "Client KYC onboarding, a contracted service", "Hard: about eight months, since two financial clients' contracts name the provider", "VeriPass runs its own check service; Manila sends the images through its API. Hosted in the Philippines."],
  ["PayWise Payroll Services Inc.", "Runs payroll on its own systems for GlobalConnect's employees in the Philippines, managed from the Manila head office (the outside payroll provider of F2.1)", "Employees' names, employee numbers, pay, tax withheld and bank account numbers", "About 12,000 employees, one file a fortnight", "Manila Finance & Payroll team; Finance e-mails the payslips to employees", "Internal support: pays staff (Finance files the tax returns itself)", "Easy: another payroll provider can take over within two pay cycles", "PayWise runs its payroll software on its own systems; Finance uploads one file a fortnight. Hosted in the Philippines."],
];
const VEN_SHORT = ["Deskline Cloud", "VeriPass", "PayWise"];
/** A supplier's tier as step 1 stands (the key's tier once checked). */
const venTier = (p: Progress, sup: string) => { const reg = REGISTERS["T7.2"]; const ri = VEN_SHORT.indexOf(sup); return ri < 0 ? "" : standing(reg, p, "T7.2", ri, 7); };
// The clause checklist of SITL-POL-013 Section 6.1 step 4 (rule R27: every clause marked for the tier or a lower one; the
// transfer mechanism where the data leaves the country). His seven clauses; what each must say from Section 6.3, termination
// written; the marks written (for review).
const CL_CLAUSES: [string, string, string][] = [
  ["Confidentiality", "Low", "Binds both parties, and lasts after the contract ends (SITL-POL-013 Section 6.3)"],
  ["Security requirements", "Low", "A named security standard or programme, kept for the whole contract (Section 6.3)"],
  ["Incident notification", "Medium", "The supplier notifies us within 24 hours of becoming aware (Section 6.3)"],
  ["Right to audit", "High", "We may audit the supplier, or receive an independent report, at least once a year (Section 6.3)"],
  ["Sub-contracting", "High", "A new sub-processor receives our data only after our written approval (Section 6.3)"],
  ["Return and deletion of data", "Medium", "The supplier returns our data, then certifies its deletion, within 30 days of the end date (Section 6.3)"],
  ["Termination", "Medium", "We may end the contract early if the supplier breaches its security or data-protection terms (Group checklist)"],
  ["Transfer mechanism", "Where the data leaves the Philippines", "The mechanism for each country the data leaves to (Section 6.3): for Manila, the one SITL-ADD-16 Section 2 names"],
];
// What each contract says, clause by clause (dataset SPR-07), in CL_CLAUSES' order.
const CL_SAYS: string[][] = [
  ["Each party keeps the other's confidential information confidential during the term and for five years after it ends.",
    "Deskline keeps an information security programme certified to ISO/IEC 27001 for the whole term.",
    "Deskline notifies the customer of a security incident affecting customer data without undue delay, and in any case within 72 hours.",
    "No clause on audits or independent reports.",
    "Deskline may use the sub-processors listed on its website, and posts any change there 30 days before it takes effect.",
    "The customer may export its data for 30 days after the contract ends; Deskline then deletes it within 60 days and confirms the deletion on request.",
    "Either party may end the contract for a material breach not put right within 30 days, a breach of the security or confidentiality terms included.",
    "Customer data is hosted in Singapore. No clause on transfers."],
  ["VeriPass keeps GlobalConnect's information confidential during the term.",
    "VeriPass keeps a security programme in line with ISO/IEC 27001 for the whole contract.",
    "VeriPass notifies GlobalConnect within 24 hours of becoming aware of a security incident affecting its data.",
    "GlobalConnect may audit VeriPass once a year on 30 days' notice, or accept the report of an independent auditor instead.",
    "VeriPass engages no new sub-processor for GlobalConnect's data without GlobalConnect's prior written approval. Annex 2 names its one sub-processor, a hosting provider in the Philippines.",
    "When the contract ends VeriPass returns all GlobalConnect data and certifies its deletion within 30 days.",
    "No clause lets GlobalConnect end the contract early: it runs for a fixed three years.",
    "All processing takes place in the Philippines."],
  ["Both parties keep each other's information confidential, during the contract and after it ends.",
    "PayWise protects the payroll data with reasonable security measures.",
    "PayWise notifies GlobalConnect of a personal data breach within 72 hours, so that GlobalConnect can meet its NPC deadline.",
    "No clause on audits.",
    "PayWise may use subcontractors.",
    "When the contract ends PayWise returns the payroll records and deletes its copies within 30 days, with a deletion certificate.",
    "Either party may end the contract on 60 days' notice, or at once for a breach of the data-protection terms.",
    "All processing takes place in the Philippines."],
];
const CL_HOSTED = ["Singapore", "Philippines", "Philippines"];
const CL_LABEL = (si: number, clause: string) => `${VEN_SHORT[si]}: ${clause}`;
const CL_OPTS = ["Covered", "Falls short", "Missing", "Not required for this supplier"];
// LI-CLD, sheet Matrix: the service model (rule L19, from the intake form) and who secures each part of the SaaS ticketing
// tool (Ref-Cloud). Sheet Questions: the five fixed cloud and supply-chain questions with Deskline's answers (SPR-07).
const CLD_MODELS = ["IaaS", "PaaS", "SaaS"];
const CLD_WHO = ["Deskline (provider)", "Manila office (customer)"];
const CLD_ROWS: [string, string][] = [
  ["Service model", "Deskline's intake form, on delivery"],
  ["Data centres and hardware", "The buildings, servers and storage the service runs on"],
  ["Network and hosting", "The network inside the provider's cloud and the hosting under the service"],
  ["Operating systems and platform", "The operating systems, databases and runtime under the application"],
  ["The ticketing application and its patches", "The application's code, its updates and its security patches"],
  ["User accounts and access", "Who may sign in through Manila single sign-on, their roles, MFA, and removing leavers"],
  ["Manila's data in the tool", "What agents put in tickets, how it is classified, and the masking of card and health details"],
  ["Configuration and retention", "Ticket fields, sharing settings and how long tickets are kept"],
  ["Integrations and API keys", "The link to the CRM platforms and the keys it uses"],
  ["Audit log", "Exporting the tool's audit log to the SIEM, and reviewing it"],
];
const CLD_QUESTIONS: [string, string][] = [
  ["1. In which countries is our data stored and processed, and can we choose the region?", "Stored and processed in Singapore, with backups in a second Singapore data centre. The region is set for each customer at sign-up and cannot be changed later."],
  ["2. Who holds the encryption keys, and can we bring or manage our own?", "Deskline holds and rotates the keys. Customer-managed keys come with the Enterprise plan only; Manila is on the Business plan."],
  ["3. How will you return and delete our data at exit, and in what format?", "Export as CSV files from the admin console for 30 days after the contract ends; deletion within 60 days after that, confirmed in writing on request."],
  ["4. Which sub-processors and software components can access or handle our data?", "The sub-processors listed on our website: our cloud hosting provider, an e-mail delivery service and, since October 2026, a support-chat provider. We do not share a software component list (SBOM)."],
  ["5. How do you check the provenance and security of the software and updates you deliver to us?", "Every release is built in our own pipeline, code-reviewed and scanned before it goes live. We do not sign releases or publish what each update contains."],
];

// T5.1 · LI-RTP, the risk treatment plan (template T-LI-RTP), its sheet Controls, and RSK-ACC, the acceptance request (template
// T-ACC). His workbook gives the columns, the four options (rule L12), Clause 6.1.3 c), rules R08 and R36, and RSK-ACC's fields.
// Platform-written, logged in docs/GRC101_Content_Corrections.md (T5.1): the three Manila risks R-16-HQ-16 … 18 with what
// LI-CHAIN and RR-UPD record (T4.2 is not built; it follows these), the two LearnTech worked rows, the six controls proposed
// for the modified risk, the plan's date (2 November 2026) and the choices. Keys server-side (T5.1-2, -3, -6).
const RTP_LT = ["R-36-AMS-07", "R-36-AMS-12"];
const RTP_ROWS: string[][] = [
  [LT, "R-36-AMS-07", "Because the learning platform's administrator accounts sign in with a password alone, an attacker who phishes one may take over the platform, leading to students' records being exposed, for the learning management platform.", "Supporting asset (Amsterdam office). Existing control: phishing awareness at induction, working. Inherent 5 × 4 = 20. Plan dated 14 September 2026.", "Modify (reduce)", "Multi-factor authentication for every administrator account; a quarterly review of administrator access", "A.8.5, A.5.18", "Head of Learning Platforms", "2026-12-13", "16 High", "", "—", "—", "—", "—"],
  [LT, "R-36-AMS-12", "Because the staff-room printer keeps scanned files in its memory for a day, a member of staff may open another's scan, leading to internal course notes being seen, for the staff-room printer.", "Supporting asset (Amsterdam office). Existing control: printing and scans are released by a personal PIN, working. Inherent 3 × 2 = 6. Plan dated 14 September 2026.", "Retain (accept)", "None: retained as it is", "—", "Office Manager, Amsterdam", "None: retained", "4 Low", "", "The residual score is within the appetite for a LOW-criticality organisation (SITL-ERM-001 Section 4)", "2027-09-14", "2027-09-14", "Risk owner"],
  [GC, "R-16-HQ-16", "Because the remote-access VPN gateway runs a version with a flaw that attackers are actively exploiting, an attacker may get into the Manila network without valid credentials, leading to client customer data on the delivery platform being exposed, for the remote-access VPN gateway.", "Supporting asset, part of the core network and infrastructure. THR-5 item 2: this VPN product's flaw is being actively exploited, and the vendor has issued a fix. Night-shift supervisors and IT on-call staff reach the network only through the VPN. Existing control: firewall rules that limit VPN users to the agent desktop network, not working (the October rule review found an any-to-any rule left from a migration). Inherent 5 × 4 = 20.", "", "", "", "Head of Infrastructure", "", "20 Critical", "", "", "", "", ""],
  [GC, "R-16-HQ-17", "Because one client still sends its weekly transaction file to a legacy FTP server at Manila without encryption, the file may be intercepted in transit, leading to the client's customer data being disclosed, for client transaction data.", "Information asset. The client sends all its other files through the production delivery platform's encrypted upload; the Chief Delivery Officer confirms this file can go the same way, and nothing else uses the FTP server. Existing control: the server accepts connections only from the client's IP addresses, working. Inherent 4 × 4 = 16.", "", "", "", "Chief Delivery Officer", "", "12 High", "", "", "", "", ""],
  [GC, "R-16-HQ-18", "Because agents leave their workstations unattended during breaks, a colleague or visitor on the call floor may see client records on screen, leading to client customer data being disclosed, for the call-centre workstations.", "Supporting asset. Existing controls: screens lock after 5 minutes idle, working; visitors are escorted on the call floor, not working (two unescorted visitors in the September spot check). Inherent 4 × 3 = 12.", "", "", "", "Chief Information Officer", "", "9 Medium", "", "", "", "", ""],
];
const RETAIN = "Retain (accept)", MODIFY = "Modify (reduce)";
const RTP_DUE = ["2026-12-02", "2027-01-31", "2027-05-01", "None: retained"];
const ACC_REASONS = ["The residual score is within the appetite for a LOW-criticality organisation (SITL-ERM-001 Section 4)", "The residual rating is one the Org CRCO may accept (rule R36)", "An existing control works, so the risk is closed"];
const ACC_EXPIRY = ["2027-02-02", "2027-05-02", "2027-11-02", "2028-11-02"];
const ACC_REVIEW = ["2026-12-02", "2027-02-02", "2027-11-02"];
const ACC_APPROVERS = ["Risk owner", "Org CRCO", "Org CEO + Group CISO", "Not acceptable — Board decision"];
const D3_APPROVER: Record<string, string> = { B: "The ISMS manager", C: "The internal auditor" };
// Sheet Controls: what the Head of Infrastructure's treatment workshop proposed for R-16-HQ-16, from several sources; two of
// the six treat the other risks.
const CTRL_ROWS: [string, string][] = [
  ["Apply the vendor's fix for the exploited flaw to the VPN gateway, within the patching deadline of SITL-POL-010", "THR-5 item 2: the vendor's advisory"],
  ["Remind agents each quarter to lock their screens when they step away", "IT team's list"],
  ["Remove the any-to-any rule, so that VPN users reach only the agent desktop network, kept apart from the client data systems", "October firewall rule review"],
  ["Send the VPN gateway's logs to the SIEM, and alert on log-ins at unusual times or from unusual countries", "NIST CSF 2.0, DE.CM-01"],
  ["Encrypt the weekly transaction file a client sends to the FTP server", "IT team's list"],
  ["Take each new advisory on the VPN product, from the vendor and the sector ISAC, into the risk assessment", "NIST CSF 2.0, ID.RA-02"],
];
const ANNEX_OPTS = ["A.5.7 Threat intelligence", "A.5.14 Information transfer", "A.6.3 Information security awareness, education and training", "A.7.7 Clear desk and clear screen", "A.8.5 Secure authentication", "A.8.8 Management of technical vulnerabilities", "A.8.16 Monitoring activities", "A.8.22 Segregation of networks", "A.8.24 Use of cryptography"];
const NOT_NEEDED = "— Not needed for this risk";
/** The controls a modified risk needs, as sheet Controls stands (the key's values once checked): their text, or their IDs. */
const neededCtrls = (p: Progress, part: 0 | 1) => {
  const reg = REGISTERS["T5.1 CTRL"];
  const vals = reg.rows.map((_, ri) => [standing(reg, p, "T5.1", ri, 3), standing(reg, p, "T5.1", ri, part ? 4 : 1)]);
  if (vals.some(([need]) => !need)) return "";
  return vals.filter(([need]) => need === "Yes").map(([, v]) => (part ? v.split(" ")[0] : v)).join(part ? ", " : "; ");
};
/** The row of LI-RTP whose option stands at Retain: the one RSK-ACC is raised for. */
const retained = (p: Progress) => {
  const reg = REGISTERS["T5.1"];
  const ri = reg.rows.findIndex((r, i) => r[0] === GC && standing(reg, p, "T5.1", i, 4) === RETAIN);
  return ri < 0 ? null : (ci: number) => standing(reg, p, "T5.1", ri, ci);
};

// T5.2 · LI-SOA, the Statement of Applicability (template T-LI-SOA, in Frameworks › Export Mapping); sprint 4a (A.5.8) in the
// tracker and its evidence pack; LI-OBJ, sheet Objectives of T-LI-PLAN (Frameworks › Gap Finder). His workbook gives the SoA's
// columns, the 93 controls and their sprints (ISO coverage), rules L06, L07, L14, L15 and Clause 6.1.3 d). Platform-written,
// logged in docs/GRC101_Content_Corrections.md (T5.2): dataset SOA-93 (li-soa.json, facts only), the worked row, the four
// sources, the carried-over Implemented? and Evidence ref, the three gaps of sheet Objectives and their choices. Keys
// server-side (backend/scripts/li101_written_T5.2.json: T5.2-2, -7, -8, -9, -11).
type SoaControl = { c: string; title: string; week: number; task: string; sprint: string; fact: string };
const SOA = SOA_DATA as unknown as { sources: string[]; worked: Record<string, string>; controls: SoaControl[] };
const SOA_NA = "None: not applicable";
const SOA_WHY: Record<string, string> = { Risk: "a risk the office treats with it", "Legal requirement": "a legal requirement", "Contractual requirement": "a contractual requirement", "Business need": "a business need" };
const SOA_ROWS = [
  [LT, SOA.worked.c, SOA.worked.title, SOA.worked.fact, SOA.worked.applicable, SOA.worked.source, SOA.worked.inclusion, "—", SOA.worked.implemented, SOA.worked.evidence],
  ...SOA.controls.map((x) => [GC, x.c, x.title, x.fact, "", "", "", "", "", ""]),
];
const at830 = (c: string) => c === "A.8.30";
/** Step 3's checked answer on the A.8.30 row: A (his best) is Not applicable, B Applicable; C deletes nothing here. */
const D2_SOA: Record<string, string> = { A: "Not applicable", B: "Applicable" };
/** Implemented? (D of the tracker, ci 6) or Evidence ref (F, ci 8) for a control, by rule L07: a sprint still to come is
 *  Planned; a sprint done is its tracker's value as it stands; a sprint whose task is not built yet names its tracker. */
const soaCarry = (c: string, ci: 6 | 8, p: Progress) => {
  const x = SOA.controls.find((r) => r.c === c);
  if (!x) return "";
  if (x.week > 5) return ci === 6 ? `Planned: sprint ${x.sprint}, week ${x.week} (${x.task})` : "—";
  const s = sprintOf(c), reg = s && REGISTERS[`${s.task} CIT`];
  if (!s || !reg) return `From CIT-S${x.sprint} (${x.task})`;
  return standing(reg, p, s.task, reg.rows.findIndex((r) => r[1] === c), ci);
};
const OBJ_ROWS: [string, string[]][] = [
  // T11.1's OBJ-01 … OBJ-04 (li-kpi.json "objectives"), each with two plausible lines that are not objectives.
  ["Vulnerabilities: your LI-RTP treats R-16-HQ-16, a flaw on the VPN gateway that attackers are exploiting; SITL-ADD-16 Section 5 sets Manila's remediation deadlines", ["Patch vulnerabilities faster than last year", "Close class 1–2 vulnerabilities on time: remediation SLA compliance 90% or more, by 30 June 2027", "Buy a second vulnerability scanner, by 30 June 2027"]],
  ["Leavers: agent turnover is high, and the Manila risk register treats the risk of leavers keeping access to their accounts after they go (SOA-93, A.5.18)", ["Every leaver disabled within the SLA, by 31 March 2027", "Remind team leaders to report leavers promptly", "Review leavers' access when time allows, by 31 March 2027"]],
  ["ISMS roles: day-to-day ownership of the ISMS at Manila is not assigned to any role (GAP-25, 5.3; your CIT-S1: A.5.2 Partially implemented)", ["Hold an ISMS roles workshop for Manila managers", "Make ISMS roles clearer at Manila, by 31 March 2027", "Every ISMS role held and accepted, by 31 March 2027"]],
  ["Suppliers: nobody checks the outside payroll provider's work against its agreement (GAP-25, 8.1); the Group requires critical suppliers to be reassessed every year (SITL-ADD-16 Section 5)", ["Every Critical and High supplier reassessed on time, by 30 June 2027", "Strengthen supplier oversight at Manila", "Send each supplier a security questionnaire, by 30 June 2027"]],
];
const OBJ_ROLES = (desk: Desk) => [...RACI_ROLES(desk), "Vulnerability Management Governance Analyst"];
const MONTH_DATE = /\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d\b|\b20\d\d-\d\d-\d\d\b/g;

// T11.1 · LI-KPI, the measure cards, and KPI-DASH, the ISMS measurement dashboard (template T-LI-KPI). His workbook gives
// the card's fields (what, method, when, who measures, when and who analyses and evaluates, formula, target, threshold), the
// five lowest-level controls of CIT-S1 to CIT-S13, the Control Maturity Matrix's Level 4 measures, and the dashboard's value
// against target and threshold with one line for management. Platform-written, logged in docs/GRC101_Content_Corrections.md
// (T11.1): li-kpi.json (the trackers' levels, the matrix extract CMM-L4, the baseline data KPI-BASE, the LI-OBJ objectives,
// the choices), the LearnTech worked card and row, the threshold rule. Keys server-side (li101_written.json T11.1-4, -6).
const KPI = KPI_DATA as unknown as {
  titles: Record<string, string>; rollup: [string, string[]][];
  matrix: string[][]; base: Record<string, string>; values: Record<string, string[]>; actions: Record<string, string[]>;
  objectives: Record<string, string>; targets: string[];
};
/** A control's maturity level as the learner's own tracker stands (column E): their pick, or the key once its sprint's
 *  check found the pick wrong. Never a level from the bundle: the levels are the sprints' answers (integration fixes, 26 Nov). */
const trackerLevel = (c: string, p: Progress) => {
  const s = sprintOf(c), reg = s && REGISTERS[`${s.task} CIT`];
  return reg ? standing(reg, p, s.task, reg.rows.findIndex((r) => r !== CIT_WORKED && r[1] === c), 7) : "";
};
/** The Control list: every control of the trackers, in tracker order, with the level its tracker records and the tracker. */
const kpiControls = (p: Progress) => KPI.rollup.flatMap(([s, cs]) => cs.map((c) => `${c} ${KPI.titles[c]} — ${trackerLevel(c, p) || "Level not rated yet"} (${s})`));
const kpiCode = (v: string) => v.split(" ")[0] ?? "";
const kpiMatrix = (v: string) => KPI.matrix.find((r) => r[0] === kpiCode(v));
const KPI_ANALYSED = "Each month at the dashboard review, after each measurement; reported to each management review (Clause 9.3)";
const KPI_ANALYST = "Compliance Manager, with the Org CISO";
const KPI_WORKED = [LT, "Worked card", "A.6.3 Information security awareness, education and training — Level 3 Defined (Amsterdam tracker)",
  "Phishing simulation report rate", "SITL-POL-020 Section 7.1", "Target 60%, threshold below 50%",
  "Staff who reported the simulated message ÷ staff it was sent to × 100", "The results of each simulation campaign",
  "After each quarterly campaign", "Security Awareness & Training Specialist", KPI_ANALYSED, KPI_ANALYST];
/** "Target 90%, threshold below 80%" → [90, 80]. */
const kpiBounds = (v: string) => { const m = v.match(/Target (\d+(?:\.\d+)?)%, threshold below (\d+(?:\.\d+)?)%/); return m ? [Number(m[1]), Number(m[2])] : null; };
const kpiStatus = (value: string, tt: string) => {
  const b = kpiBounds(tt), x = parseFloat(value);
  if (!b || Number.isNaN(x)) return "";
  return x >= b[0] ? "Green" : x >= b[1] ? "Amber" : "Red";
};
const KPI_CARD = (p: Progress, ri: number, ci: number) => (ri < 0 ? "" : standing(REGISTERS["T11.1"], p, "T11.1", ri, ci));
/** A dashboard row's card ("Card 3") → its row on sheet Cards. */
const KPI_CARD_ROW = (card: string) => REGISTERS["T11.1"].rows.findIndex((r) => r[1] === card);

// T12.1 · ACT-UPD, the updated action tracker (template T-ACT, in Risk Register › Mitigation Tracker), LI-MR, the
// management-review pack and Stage 1 readiness, and L4-ROAD, the Level 3 → Level 4 roadmap (the L4-ROAD frame), both in
// Policies › New from Template. His workbook gives the three options per action, the Clause 9.3.2 inputs with Available /
// Missing and a source, the readiness question (L23, L24) and the roadmap's quarter, measures, targets, owners and route to
// management review. Platform-written, logged in docs/GRC101_Content_Corrections.md (T12.1): ACT-TRACKER's nine actions
// (from F2.2, T3.1, T3.2 and T11.1's facts) and the reasons, the pack index (Ref-Review pack), the readiness reasons, each
// measure's "what has to be ready first" and the routes. Keys server-side (li101_written.json T12.1-1, -3, -4, -5).
const ACT_AT = "2026-12-21";
const ACT_STATUS = ["Closed — verified effective", "Open — evidence insufficient", "Overdue — escalate"];
const ACT_REASONS = [
  "The record shows the fix in place and a check that it worked",
  "The evidence does not show the fix: a statement, a draft or an undated screenshot",
  "The fix is in place, but nothing checks that it worked",
  "Not due yet, and the record shows the work under way",
  "Past its due date, not done, and no new date",
];
// ID · from · action · owner · due · owner-reported status · closure evidence (ACT-TRACKER, extract of 21 December 2026).
const ACT_ROWS: string[][] = [
  ["ACT-01", "CIT-S1 A.5.3 (T3.2)", "Separate supplier creation from payment approval in the Manila finance team", "Compliance Manager", "2026-11-30", "Closed",
    "ERP role export, 30 November 2026: since 12 October 2026 the procurement team creates suppliers and the finance clerk only approves payments. The Compliance Manager reviewed every supplier-master change from 12 October to 30 November on 4 December 2026: none was made by a payment approver."],
  ["ACT-02", "CIT-S1 A.5.3 (T3.2)", "Stop network administrators approving their own firewall changes", "Manila IT manager", "2026-11-30", "Closed",
    "Change-tool configuration export, 2 November 2026: self-approval is switched off, and a second network administrator now approves each firewall change. No firewall change made since has been reviewed."],
  ["ACT-03", "LI-GAP 5.3 (F2.2); CIT-S1 A.5.2 (T3.2)", "Name a holder for every ISMS role at Manila, and have each holder sign the role's responsibilities", "Org CISO", "2026-11-30", "Open",
    "Manila HR file, 30 November 2026: 7 of the 10 roles in LI-RACI have a named holder, and 4 of them have signed. No new date has been set."],
  ["ACT-04", "KPI-DASH A.5.22 (T11.1)", "Reassess the two overdue suppliers: the outside payroll provider and a telecom carrier", "Vendor / Third-Party Risk Analyst", "2027-01-31", "Open",
    "Vendor register, 18 December 2026: reassessment questionnaires sent to both on 10 December 2026; replies due 15 January 2027."],
  ["ACT-05", "LI-GAP 7.3 (F2.2)", "Give every Manila agent a yearly security awareness refresher", "Security Awareness & Training Specialist", "2026-11-30", "Closed",
    "Learning-system completion export, 30 November 2026: every agent on the Manila roster completed the refresher. The spot check was repeated on 10 December 2026: 10 of 10 agents could say where to report a suspicious call (4 of 10 could not in the baseline)."],
  ["ACT-06", "LI-GAP 8.2 (F2.2)", "Assess the risks of the healthcare-claims service taken on in August 2026", "Cyber Risk Manager", "2026-12-31", "Closed",
    "E-mail from the Cyber Risk Manager, 2 December 2026: \"Health-data risks assessed, register updated.\" No register export or assessment record is attached."],
  ["ACT-07", "LI-GAP 8.3 (F2.2)", "Give the eight overdue risk treatment actions new dates, approved by their risk owners", "Cyber Risk Manager", "2026-10-31", "Open",
    "Treatment tracker, 18 December 2026: the eight actions still have no new date. The owner reports \"in progress\"."],
  ["ACT-08", "POL-SET (T3.1)", "Review SITL-POL-008 Physical and Environmental Security and have it approved again", "Group Head of Facilities", "2026-12-31", "Closed",
    "Undated screenshot of a draft version 1.2 with tracked changes. The policy portal still shows version 1.1, last approved 2024-08-14."],
  ["ACT-09", "Client feedback log, 4 November 2026", "End shared CRM log-ins on client accounts", "Head of Service Delivery Operations", "2026-12-15", "Closed",
    "CRM user export, 9 December 2026: a named account for every agent on the client accounts. The Org CISO reviewed the CRM access log for 1–18 December 2026: no account was signed in from two workstations at once."],
];
// LI-MR: the Clause 9.3.2 inputs, his list, a) worked. The pack's files are on Ref-Review pack (build-li101.py PAGES).
const MR_INPUTS = [
  "b) Changes in external and internal issues relevant to the ISMS",
  "c) Changes in needs and expectations of interested parties relevant to the ISMS",
  "d) 1 Feedback on performance: nonconformities and corrective actions",
  "d) 2 Feedback on performance: monitoring and measurement results",
  "d) 3 Feedback on performance: audit results",
  "d) 4 Feedback on performance: fulfilment of information security objectives",
  "e) Feedback from interested parties",
  "f) Results of risk assessment and status of the risk treatment plan",
  "g) Opportunities for continual improvement",
];
const MR_NONE = "None: not in the pack";
const MR_ROWS = [
  ["a) Status of actions from previous management reviews", "Available", "First review: no earlier actions, recorded as such (LI-GAP, clause 9.3)"],
  ...MR_INPUTS.map((x) => [x, "", ""]),
];
const MR_SOURCES = ["CTX-ISS (F1.3)", "CTX-IP (F1.3)", "LI-GAP (F2.2)", "RR-UPD (T4.2)", "LI-OBJ (T5.2)", "LI-KPI (T11.1)", "KPI-DASH (T11.1)", "LI-AUD (T11.2)", "LI-NCR (T11.2)", "ACT-UPD (T12.1 step 1)", "CLI-FB (client feedback log)"];
const READY_REASONS = [
  "No internal audit of the ISMS has been held, and the management review has not yet met with every input",
  "Some corrective actions are still open or overdue",
  "The pack is assembled and the documents exist",
  "The missing inputs can be added after Stage 1",
];
// L4-ROAD: the five measures of LI-KPI (T11.1's five lowest-level controls), the matrix's measure, frequency and owner
// (li-kpi.json), and what has to be ready before each measure can be produced the same way every time (written).
const ROAD_Q = ["Q1 2027 (January–March)", "Q2 2027 (April–June)", "Q3 2027 (July–September)", "Q4 2027 (October–December)"];
const ROAD_ROUTE = [
  "Each month to the Org CISO at the dashboard review; each quarter to the Org Risk & Compliance Committee; the year's trend to the management review",
  "Each quarter to the Org Risk & Compliance Committee; the year's trend to the management review",
  "Once a year, at the management review only",
  "Kept on KPI-DASH, and reported to management only when a threshold is breached",
];
const ROAD_BREACH = "A breach of the threshold raises a corrective action in ACT-TRACKER (Clause 10.2); the management review decides on the improvements the trend calls for (Clauses 9.3.3, 10.1)";
const ROAD_READY: Record<string, string> = {
  "A.5.2": "Nothing: LI-RACI and the Manila HR file give both numbers today, and they change only when a role changes hands.",
  "A.5.3": "The A.5.3 list holds only the two conflicts found in October 2026; nothing finds new ones. The Group's segregation rule set for the ERP and the change tool, which lists conflicts each quarter, reaches Manila in October 2027.",
  "A.5.18": "The baseline was counted by hand from two systems. The HR-to-IAM feed that time-stamps every leaver's disable goes live in May 2027.",
  "A.8.8": "Nothing: VUL-TEST exports every finding's class and SLA status each month.",
  "A.5.22": "The Manila vendor register holds no reassessment due dates. The Vendor / Third-Party Risk Analyst adds them by the end of August 2027.",
};
const ROAD_CONTROLS = ["A.5.2", "A.5.3", "A.5.18", "A.5.22", "A.8.8"];
/** The target and threshold on the learner's LI-KPI card for a control (T11.1 step 4), as it stands after its check. */
const roadTarget = (p: Progress, code: string) => {
  const reg = REGISTERS["T11.1"];
  // By heading, not position: T11.1's columns may be reordered.
  const at = (h: string) => reg?.cols.findIndex((c) => c.h === h) ?? -1;
  const cc = at("Control"), tc = at("Target and threshold");
  const ri = reg && cc >= 0 && tc >= 0 ? reg.rows.findIndex((_, i) => kpiCode(standing(reg, p, "T11.1", i, cc)) === code && reg.rows[i][0] !== LT) : -1;
  return ri < 0 ? "" : standing(reg, p, "T11.1", ri, tc);
};

// T11.2 · LI-AUD, the internal audit programme and plan (template T-LI-AUD), RV-SET, the maturity review set (his "Review
// Deck, one set of 9 cards", built here as a sheet: the Review module does not exist), and LI-NCR, the nonconformity report
// (template T-LI-NCR). His workbook gives the programme's fields (scope, criteria, method, auditor, month), the rule to audit
// Level 1–2 and poorly rated areas more often, the card options (Level 1–3; Major NC, Minor NC, OFI, Conforming), the
// training convention and rule L17. Platform-written, logged in docs/GRC101_Content_Corrections.md (T11.2): the 23 audits,
// their scope and criteria, the auditor, method and month choices, the nine cards and the fixed questions RV-Q1–RV-Q8, the
// ISO reference choices, LI-NCR's columns, and the LearnTech worked rows. Keys server-side (li101_written.json T11.2-1,
// -3, -4, -5). The trackers column reads the learner's own LI-GAP (F2.2, as checked) and the tracker levels of li-kpi.json.
const AUD_AREAS: [string, string, string, string[]][] = [
  ["IA-01", "Context and scope: Clauses 4.1–4.4", "ISO/IEC 27001:2022 Clauses 4.1–4.4; LI-SCOPE; SITL-ADD-16", ["4.1", "4.2", "4.3", "4.4"]],
  ["IA-02", "Leadership, policy and roles: Clauses 5.1–5.3", "ISO/IEC 27001:2022 Clauses 5.1–5.3; SITL-POL-001; GRC Charter Section 16", ["5.1", "5.2", "5.3"]],
  ["IA-03", "Risk assessment: Clauses 6.1.2 and 8.2", "ISO/IEC 27001:2022 Clauses 6.1.2 and 8.2; SITL-POL-002; the Group risk method", ["6.1.2", "8.2"]],
  ["IA-04", "Risk planning and treatment: Clauses 6.1.1, 6.1.3 and 8.3", "ISO/IEC 27001:2022 Clauses 6.1.1, 6.1.3 and 8.3; LI-RTP; LI-SOA", ["6.1.1", "6.1.3", "8.3"]],
  ["IA-05", "Objectives and resources: Clauses 6.2 and 7.1", "ISO/IEC 27001:2022 Clauses 6.2 and 7.1; SITL-POL-001 Section 6.2; LI-OBJ", ["6.2", "7.1"]],
  ["IA-06", "Changes and operational control: Clauses 6.3 and 8.1", "ISO/IEC 27001:2022 Clauses 6.3 and 8.1; the Group procedures; the payroll provider's agreement", ["6.3", "8.1"]],
  ["IA-07", "Competence and awareness: Clauses 7.2 and 7.3", "ISO/IEC 27001:2022 Clauses 7.2 and 7.3; SITL-POL-020; LI-COMM", ["7.2", "7.3"]],
  ["IA-08", "Communication and documented information: Clauses 7.4 and 7.5", "ISO/IEC 27001:2022 Clauses 7.4 and 7.5; SITL-POL-000 Section 7; the Group communication plan", ["7.4", "7.5"]],
  ["IA-09", "Monitoring, management review and improvement: Clauses 9.1, 9.3, 10.1 and 10.2", "ISO/IEC 27001:2022 Clauses 9.1, 9.3, 10.1 and 10.2; KPI-DASH; SITL-POL-001 Section 6.1", ["9.1", "9.3", "10.1", "10.2"]],
  ["IA-10", "Internal audit: Clause 9.2", "ISO/IEC 27001:2022 Clause 9.2; ISO 19011; this programme (LI-AUD)", ["9.2"]],
  ["IA-11", "Control sprint 1: A.5.1–A.5.4 (CIT-S1)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S1"]],
  ["IA-12", "Control sprint 2: A.5.9–A.5.14 (CIT-S2)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S2"]],
  ["IA-13", "Control sprints 3 and 4a: A.5.6–A.5.8 (CIT-S3; A.5.8 from T5.2)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S3", "T5.2"]],
  ["IA-14", "Control sprint 4: A.6.3 (CIT-S4)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S4"]],
  ["IA-15", "Control sprint 5: A.5.37, A.6.1, A.6.2, A.6.4–A.6.7 (CIT-S5)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S5"]],
  ["IA-16", "Control sprint 6: A.5.15–A.5.18 (CIT-S6)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S6"]],
  ["IA-17", "Control sprint 7: A.5.19–A.5.23 (CIT-S7)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S7"]],
  ["IA-18", "Control sprint 8: A.5.5, A.5.24–A.5.28, A.6.8 (CIT-S8)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S8"]],
  ["IA-19", "Control sprint 9: A.5.29–A.5.36 (CIT-S9)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S9"]],
  ["IA-20", "Control sprint 10: A.7.1–A.7.14 (CIT-S10)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S10"]],
  ["IA-21", "Control sprint 11: A.8.1–A.8.8, A.8.13–A.8.17 (CIT-S11)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S11"]],
  ["IA-22", "Control sprint 12: A.8.9–A.8.12, A.8.18–A.8.24 (CIT-S12)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S12"]],
  ["IA-23", "Control sprint 13: A.8.25–A.8.29, A.8.31–A.8.34 (CIT-S13; A.8.30 is Not applicable in LI-SOA)", "ISO/IEC 27001:2022 Annex A, as in LI-SOA; ISO/IEC 27002:2022; the controls' LI tasks", ["CIT-S13"]],
];
const AUD_FREQ = ["Once", "Twice"];
const AUD_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const AUD_WHEN = [...AUD_MONTHS.map((m) => `${m} 2027`), ...AUD_MONTHS.slice(0, 6).map((m, i) => `${m} and ${AUD_MONTHS[i + 6]} 2027`)];
const AUD_METHODS = ["Document review and interviews", "Document review, interviews and sampling of records", "Observation on site, interviews and sampling of records", "Technical checks of system settings, and sampling of records"];
const AUD_AUDITORS = ["Information Security Auditor", "Group Internal Audit", "Compliance Manager", "Cyber Risk Manager", "Policy & Governance Analyst", "Org CISO"];
/** What the learner's own trackers show for an audit's scope: each clause's status and level in LI-GAP as checked (F2.2), or
 *  each control's level as CIT-S1 to CIT-S13 stand (li-kpi.json, the roll-up T11.1 reads). */
const audTrackers = (keys: string[], p: Progress) => keys.map((k) => {
  const ctl = KPI.rollup.find(([s]) => s === k);
  if (ctl) return ctl[1].map((c) => `${c} ${trackerLevel(c, p) || "not rated yet"}`).join(" · ");
  const gap = REGISTERS["F2.2"], ri = gap.rows.findIndex((r) => r[0].startsWith(`${k} `));
  return `${k} ${standing(gap, p, "F2.2", ri, 3) || "—"}, ${standing(gap, p, "F2.2", ri, 4) || "—"}`;
}).join(" · ") + (keys[0].startsWith("CIT") || keys[0] === "T5.2" ? "" : " (LI-GAP)");
const AUD_WORKED = [LT, "Worked audit", "Documented information at Amsterdam: Clause 7.5", "ISO/IEC 27001:2022 Clause 7.5; the Group document-control procedure", "7.5 Fully met, Level 3 Defined (Amsterdam's gap analysis)", "Once", "March 2027", "Document review, interviews and sampling of records", "Information Security Auditor"];
// The nine cards: what a reviewer found at Manila, never the level or the clause. Levels and clauses are server-side.
const RV_CARDS: [string, string, string][] = [
  ["RV-01", "Document control", "The reviewer sampled 15 ISMS documents that Manila works under in the Group library. Each has an ID, a version, an approver and a next review date, as the Group document-control procedure (SITL-POL-000 Section 7) sets for every office, and all 15 are within their review date. The Group reviews the retention and disposal rules each year. Nobody counts how many documents pass their review date, and no target is set for it."],
  ["RV-02", "Changes to the ISMS", "Three changes were made to the Manila ISMS in 2026: it was extended to the healthcare-claims clients taken on in August, the SIEM moved to a hybrid set-up, and the incident contact list was replaced. Only the SIEM move was planned, with a written impact note. The other two were decided by whoever asked for them, and nothing records what was considered. There is no documented way of planning a change to the ISMS."],
  ["RV-03", "Managers' security duties", "Every Manila manager signs Manila's own manager security checklist when appointed and again each January; the Org CEO approved the checklist in 2025. The reviewer sampled 10 managers: 9 signed this January, and one appointed in September signed only in November. Team leaders brief each new agent on their security role before access is given, and all 20 briefing records sampled are signed. No other office uses the checklist, and it has never been reviewed."],
  ["RV-04", "The outside payroll provider", "An outside provider runs Manila's payroll on its own systems, under an agreement that sets its data-protection and reporting duties. In 2026 nobody at Manila has checked the provider's work against the agreement: its monthly reports are filed unread, and no check of any kind is recorded. Nothing documents how the provider should be overseen."],
  ["RV-05", "ISMS communication", "What is communicated about the ISMS, when, to whom and how is set in the Group communication plan, which every office follows, and the Group reviews the plan each year. The reviewer found all 12 monthly security bulletins of the past year sent at Manila, with their distribution records, and the four quarterly client updates. Nobody measures whether staff read the bulletins, and no target is set."],
  ["RV-06", "Security awareness of agents", "New agents get security awareness training once, at induction, from Manila's own slide deck, and attendance is recorded. The reviewer sampled 20 agents: all 20 attended. Asked where to report a suspicious call, 6 of them could not say. There is no refresher, no other office uses the deck, and it has never been reviewed."],
  ["RV-07", "Improving the ISMS", "Improvements at Manila are made one at a time, when a client asks or after an incident. In 2026 two client audits and five incidents ended with fixes to the matter in hand, but nothing records that the ISMS as a whole was looked at or improved, and nobody is asked to look for improvements. There is no documented way of doing it."],
  ["RV-08", "ISMS resources", "The ISMS's resources for Manila (the Org CISO's office, three GRC analysts, tools and a training budget) are approved in the Group's yearly budget cycle, the same way for every organisation. The 2027 budget was approved in October 2026, and the needs behind it are reviewed each year. Nothing about the resources is measured against a target."],
  ["RV-09", "The list of policies in force", "Manila keeps its own list of the Group policies in force there, a spreadsheet approved by the Org CISO in March 2026, with each policy's owner and last approval. The reviewer held the list against the policy portal: 2 of the 24 policies are past their yearly review. No other office uses the list, and it has never been reviewed."],
];
const RV_WORKED = [LT, "Worked card", "Backups at Amsterdam", "Amsterdam keeps its own backup procedure, approved by its IT lead, with nightly backup logs, and a restore is tested each month. No other office uses the procedure, and it has never been reviewed. Of the 12 monthly restore tests of the past year, 11 are recorded.", "Level 2", "", "Minor NC", "A.8.13 Information backup", "One monthly restore test of twelve has no record, and the procedure is Amsterdam's own and has never been reviewed.", "Move to the Group backup procedure under SITL-POL-009, reviewed each year; owner the IT lead."];
const RV_ISO = ["5.3 Organizational roles, responsibilities and authorities", "6.3 Planning of changes", "7.1 Resources", "7.2 Competence", "7.3 Awareness", "7.4 Communication", "7.5 Documented information", "8.1 Operational planning and control", "9.1 Monitoring, measurement, analysis and evaluation", "10.1 Continual improvement", "A.5.1 Policies for information security", "A.5.4 Management responsibilities"];
/** The Maturity Model's questions as far as a level answers them (Ref-Maturity Model): the card's indicators. */
const RV_INDICATORS: Record<string, string> = {
  "Level 1": "Q1 No: no documented, approved way, or no records that it is done",
  "Level 2": "Q1 Yes; Q2 No: the office's own way, or not reviewed each year",
  "Level 3": "Q1 Yes; Q2 Yes; Q3 No: not measured against targets",
};
const rvRow = (card: string) => REGISTERS["T11.2 RV"].rows.findIndex((r) => r[1] === card);
const NCR_WORKED = [LT, "Worked NC", "Worked card", "Level 2", "A.8.13 Information backup", "Of the 12 monthly restore tests of the past year, one has no record; the procedure is Amsterdam's own and has never been reviewed.", "The backups of Amsterdam are not tested by restore as A.8.13 requires: one monthly test of twelve has no record.", "Minor"];

// T12.2 · certification readiness: LI-CERT's sheet Facts, AUD-LOG (template T-AUD) and LI-NCR-R, all in Evidence › Audit
// Requests (PBC). His AUD-REQUESTS, EVIDENCE-INDEX and AUD-FINDING, and the portal receipts step 4 reads (AUD-PORTAL), are
// li-t122.json, which build-li101.py also reads for the datasets. Platform-written, logged in docs/GRC101_Content_Corrections.md
// (T12.2). Keys server-side (li101_written.json T12.2-2 … -5).
type AudData = { index: string[][]; requests: string[][]; portal: string[][]; finding: string[][]; cert: string[]; stages: string[]; ncr: Record<string, string[]>; none: string };
const AUD = T122_DATA as AudData;
const audFile = (f: string) => AUD.index.find((r) => r[0] === f);
/** A request's reply as it stands after step 3's check: a file, or No evidence available. */
const audReply = (p: Progress, req: string) => standing(REGISTERS["T12.2"], p, "T12.2", AUD.requests.findIndex((r) => r[0] === req), 3);

// T6.1 · LI-COMM (template T-LI-COMM). Sheet Competence: the ten role holders of dataset COMP-10 (his new item) with the
// competence their role needs (what it runs in the learner's LI-RACI, T3.2), a status and an action per Clause 7.2. Sheet
// Communication: five messages of the Manila ISMS with when, with whom and how (Clause 7.4), from the Group ISMS communication
// plan (Learn › Reference pages, Ref-Communications). li-t61.json is the one source; build-li101.py reads it for COMP-10 and
// the page. Platform-written, logged (T6.1). Keys server-side (li101_written_T6.1.json: T6.1-2, T6.1-5).
type T61 = { statuses: string[]; noAction: string; worked: string[][]; holders: string[][]; actions: Record<string, string[]>; plan: { note: string; h: string[]; r: string[][] }; whom: string[]; messages: string[] };
const T61D = T61_DATA as T61;
const COMP_ROWS = [...T61D.worked.map((r) => [LT, ...r]), ...T61D.holders.map((r) => [GC, ...r, "", ""])];
const planCol = (i: number) => [...new Set(T61D.plan.r.map((r) => r[i]))];

// T6.2 · LI-DOC (template T-LI-DOC): sheet Register, the mandatory-documents register (his ten items, each a maintained
// document or a retained record, Clause 7.5.1), and sheet Block, the document-control block his step 2 adds to an operating
// procedure on the IT wiki (A.5.37), by the fields of SITL-POL-000 Section 7.1. Platform-written, logged in
// docs/GRC101_Content_Corrections.md (T6.2): what each clause asks for (our summary of ISO/IEC 27001:2022), where each item is
// held at Manila, the wiki page and its approval (Ref-Wiki backup page), the block's choices. Keys server-side
// (li101_written_T6.2.json: T6.2-1, T6.2-2).
const DOC_ITEMS: [string, string, string, string][] = [
  ["ISMS scope", "4.3", "The scope is to be available as documented information.", "Your LI-SCOPE (F2.1), a draft awaiting approval"],
  ["Information security policy", "5.2 e)", "The policy is to be available as documented information.", "SITL-POL-001 in the Group library, applied at Manila through SITL-ADD-16"],
  ["Statement of Applicability", "6.1.3 d)", "Produce a Statement of Applicability: the necessary controls, why each is included, whether each is implemented, and why any Annex A control is left out.", "Your LI-SOA (T5.2)"],
  ["ISMS objectives", "6.2", "Retain documented information on the information security objectives.", "Your LI-OBJ (T5.2): Manila's objectives with targets, owners and dates"],
  ["Evidence of competence", "7.2 d)", "Retain appropriate documented information as evidence of competence.", "Manila's training records, and your LI-COMM (T6.1)"],
  ["Results of risk assessments", "8.2", "Retain documented information of the results of the information security risk assessments.", "The March 2026 assessment in the risk register, and your RR-UPD (T4.2)"],
  ["Monitoring and measurement results", "9.1", "Documented information is to be available as evidence of the monitoring and measurement results.", "The Group KPI reports Manila files each quarter"],
  ["Audit programme and results", "9.2.2", "Documented information is to be available as evidence of the implementation of the audit programme and of the audit results.", "None yet: no internal audit has been held or planned"],
  ["Management review results", "9.3.3", "Documented information is to be available as evidence of the results of management reviews.", "None yet: no management review has been held"],
  ["Nonconformities and corrective action results", "10.2", "Documented information is to be available as evidence of the nonconformities, the actions taken, and the results of any corrective action.", "None yet: there is no nonconformity log"],
];
// The block's seven fields, his order (ID, version, owner, approver, approval date, classification, next review), named as
// SITL-POL-000 Section 7.1 names them, each with four values to choose from.
const BLOCK_ROWS: [string, string[]][] = [
  ["Document ID", ["SITL-POL-009-6.2", "SITL-POL-009-PR-6.2", "SITL-POL-006-PR-6.3", "MNL-IT-WIKI-BACKUP"]],
  ["Version", ["0.1", "1.0", "1.4", "14.0"]],
  ["Document owner", ["Manila data-centre team lead", "Chief Information Officer (CIO)", "Group CIO", "Group CISO"]],
  ["Approved by", ["Group GRC Steering Committee", "Group CISO", "Org CEO + Group CISO", "Group CIO"]],
  ["Effective date (the approval date)", ["2024-03-11", "2026-10-02", "2026-11-10", "2027-11-10"]],
  ["Classification", ["Public", "Internal", "Client-Confidential", "Client-Restricted"]],
  ["Next review", ["2027-02-09", "2027-05-10", "2027-11-10", "2028-11-10"]],
];

// T7.1 · ACC-RULES, the access rules matrix (his template T-LI-ACC, "access rules matrix by system and role"): one line per
// role on each of SPR-06's three systems, with the role list's duties and the account extract's access given, and the
// level, approver and "more than the job needs" chosen. Data in li-sprints.json (`acc` of the T7.1 sprint), which
// build-li101.py also prints in dataset SPR-06. Platform-written, logged in docs/GRC101_Content_Corrections.md (T7.1).
type AccData = { systems: Record<string, [string, string, string, string[]]>; roles: Record<string, [string, string]>; rows: string[][] };
const ACC = (SPRINT_DATA.sprints as unknown as { task: string; acc?: AccData }[]).find((s) => s.task === "T7.1")!.acc!;
const ACC_MORE = ["Yes: more than the job needs", "No"];
const ACC_MANAGERS = ["Team leader", "Operations manager", "QA manager", "IT manager", "Workforce manager", "HR systems manager"];
const accSysLabel = (code: string) => `${ACC.systems[code][0]}. Asset owner: ${ACC.systems[code][1]}`;
const accSys = (r: string[]) => Object.values(ACC.systems).find((s) => r[1].startsWith(s[0]))!;
const accApprovers = (r: string[]) => { const [, owner, admin] = accSys(r); return [...ACC_MANAGERS.map((m) => `${m}, then the ${owner}`), `The ${admin} alone`, "The IAM team alone"]; };

// T10.2 · CHG-TEST (template T-CT, script pre-filled: sheet Sample, then the test of the sampled changes) and SDLC-MAP (his new
// item T-LI-SDLC, the gate map). One source, li-t102.json: dataset CT-B (the 64 RFCs of the customer portal, 1 October to 4
// December 2026), the 25 drawn with seed 4471, dataset SDLC (the portal's pipeline) and the gate-map rows; build-li101.py builds
// the datasets from it. Platform-written, logged in docs/GRC101_Content_Corrections.md (T10.2). Keys server-side
// (li101_written_T10.2.json: T10.2-1, -2, -3).
const T102 = T102_DATA as unknown as { ct: { cols: string[]; rows: string[][]; sample: string[] }; script: string[]; stages: string[]; gateOpts: string[]; gates: string[][]; sampling: [string, string[]][]; seedRow: string[] };
const CT_CONCL = "Conclusion (R19)";
const CT_PASS = "None: the change passes";
const CT_ROWS = T102.ct.rows.filter((r) => T102.ct.sample.includes(r[0])).map((r) =>
  [r[0], `${r[2]} · ${r[3]} · Affects: ${r[4]} · ${r[5]} · Implemented ${r[7]}`, r[6], r[8], r[9], r[10], "", ""]);

// T10.1 · CFG-BASE and CRY-REG (template T-LI-CFG, sheets CFG-BASE and Crypto), from his new items CFG / NET / T-LI-CFG. One
// source, li-cfg.json (build-li101.py builds datasets CFG and NET and the page TSA-16 Asset_System_Map from it). The baselines
// cite SITL-STD-001 Section 6 by tier. Platform-written, logged in docs/GRC101_Content_Corrections.md (T10.1). Keys server-side
// (li101_written.json T10.1-1, T10.1-2).
const CFG = CFG_DATA as { cfg: string[][]; fix: Record<string, string[]>; cry: string[][]; cryOpts: Record<"alg" | "store" | "owner" | "rot", string[]> };
const FIX_NONE = "None: matches the baseline";

// T9.2: dataset VUL-40 (li-t92.json), the findings, the class and status choices; no key.
const VUL40 = T92_DATA as { test: string; classes: string[]; statuses: string[]; h: string[]; r: string[][] };
export const REGISTERS: Record<string, Register> = {
  "T12.2 CERT": {
    code: "LI-CERT",
    title: "LI-CERT · Certification briefing for management, sheet Facts",
    stamp: "Sheet Facts",
    on: [2],
    cols: [
      { h: "Statement for the briefing", prose: true, w: 320, what: "A fact management will hear about the certification audits." },
      { h: "When the auditor checks it", opts: AUD.stages, w: 160, what: "Stage 1, Stage 2, Surveillance or Recertification." },
    ],
    rows: AUD.cert.map((x) => [x, ""]),
    mine: () => true,
    steps: { 2: [1] },
    ident: [0],
    then: { 2: "LI-CERT, the facts of your briefing" },
    note: {
      2: () => "Each row is a statement for your briefing to management. Decide when the certification body checks it: at Stage 1, at Stage 2, in a surveillance audit or at recertification. Read what each audit covers on Ref-Certification card (Learn › Reference pages). Your two pages are written from these facts, with what the Manila office must have ready; they are format-checked and kept with your hand-in. The stages are checked.",
    },
    reads: { 2: ["learn|Reference pages"] },
    checkRows: { 2: { label: 0, col: 1 } },
    handIn: { step: 6, cols: [1], ident: [0] },
  },
  "T12.2": {
    code: "AUD-LOG",
    title: "AUD-LOG · Auditor request log (template T-AUD)",
    stamp: "AUD-REQUESTS: the Stage 1 audit",
    on: [3, 4],
    cols: [
      { h: "Request", w: 80, what: "The request's number in AUD-REQUESTS." },
      { h: "Clause or control", w: 110, what: "The clause or Annex A control the request falls under." },
      { h: "What the auditor asks for", prose: true, w: 240, what: "The request, as the lead auditor wrote it." },
      { h: "Evidence file (EVIDENCE-INDEX)", opts: [...AUD.index.map((r) => r[0]), AUD.none], wrap: true, w: 260, what: "The one file that answers it, or No evidence available." },
      { h: "Action where no evidence", prose: true, w: 230, what: "The action you raise, with its owner and a date." },
      { h: "SHA-256", prose: true, w: 230, what: "The file's hash, as EVIDENCE-INDEX gives it." },
      { h: "Portal receipt (Manila time, UTC+8)", w: 190, what: "The audit portal's receipt for the upload, in Manila time." },
      { h: "Time sent (UTC)", date: "time", w: 200, what: "When the reply was uploaded, in UTC." },
    ],
    rows: AUD.requests.map((r) => { const [, no, at] = AUD.portal.find((x) => x[0] === r[0])!; return [...r, "", "", "", `${no} · ${at}`, ""]; }),
    mine: () => true,
    steps: { 3: [3, 4], 4: [7] },
    // Step 4 logs the files sent: a request answered No evidence available sent none.
    only: { 4: (r, p) => audReply(p, r[0]) !== AUD.none },
    ident: [0],
    view: { 3: [1, 2], 4: [3, 5, 6] },
    derived: {
      4: { from: [3], value: (v) => (v(3) === AUD.none ? null : v(3) ? "—" : ""), waits: () => "Written where there is no evidence" },
      5: { from: [3], quiet: true, value: (v) => (v(3) === AUD.none ? "—" : audFile(v(3))?.[4] ?? ""), waits: () => "Fills from the file" },
      7: { from: [3], value: (v) => (v(3) === AUD.none ? "Not sent: no evidence" : null) },
    },
    cells: {
      4: {
        fix: (v) => (words(v) >= 8 ? v.trim() : null),
        hint: () => "Write the action you raise, with its owner and a date, in eight words or more, as in \"Raise an action: keep a record of each weekly backup check from now on, owner the IT lead, by 15 March.\" It is format-checked and kept with your hand-in.",
      },
    },
    note: {
      3: () => "Each row is a request from the certification body's lead auditor for the Stage 1 audit of 8 and 9 February 2027, which follows the first internal audits (January) and the management review of 14 January (dataset AUD-REQUESTS). Answer it now, with what exists at 27 December 2026. The files you can send are in EVIDENCE-INDEX (Evidence › Evidence Library): read what each one holds, its clause or control and its date. Rule R34: send the one file that is the record the auditor asks for, for this office, dated inside the audit period, from a system or a controlled document. The period runs from 1 October 2026, when SITL-ADD-16 took effect, to 27 December 2026. Where no file holds what is asked, choose No evidence available and write the action you raise. The files are checked; the actions are format-checked and kept with your hand-in.",
      4: () => "Each row is a file you sent in step 3; a request answered No evidence available sent no file and is not listed. The SHA-256 fills from EVIDENCE-INDEX. Record the time each file was sent, in UTC. The Portal receipt column gives each upload as the audit portal recorded it, in Manila time, which is UTC+8: take eight hours off, and watch the date where that crosses midnight. The times are checked.",
    },
    reads: { 3: ["evidence|Evidence Library"] },
    checkRows: { 3: { label: 0, col: 3 }, 4: { label: 0, col: 7 } },
    handIn: { step: 6, cols: [3, 4, 7], ident: [0] },
  },
  "T12.2 NCR": {
    code: "LI-NCR-R",
    title: "LI-NCR-R · Response to finding NC-1 (the LI-NCR-R frame)",
    stamp: "NC-1, minor",
    on: [5],
    cols: [
      { h: "Part (Clause 10.2)", w: 130, what: "Correction, root cause or corrective action." },
      { h: "Response", opts: (_d, r) => AUD.ncr[r[0]], wrap: true, w: 320, what: "What you do or found, for this part." },
      { h: "Owner", opts: RACI_ROLES, w: 180, what: "The role that carries this part out." },
      { h: "Date", date: true, w: 150, what: "When this part is done." },
    ],
    rows: Object.keys(AUD.ncr).map((k) => [k, "", "", ""]),
    mine: () => true,
    steps: { 5: [1, 2, 3] },
    ident: [0],
    then: { 5: "LI-NCR-R, your response to NC-1" },
    cells: {
      3: {
        fix: (v) => (v > "2027-02-12" ? v : null),
        hint: () => "Choose a date after the Stage 1 report of 12 February 2027, when the finding was raised (for example 2027-03-15).",
      },
    },
    note: {
      5: () => "NC-1 (dataset AUD-FINDING), graded minor in the Stage 1 report of 12 February 2027: LI-AUD covers A.8.32 Change management, but no internal audit held before Stage 1 did, though CHG-TEST found the change process not effective. The Information Security Auditor told the auditor that the rounds were put in order clause by clause and then sprint by sprint, without looking at the change test's result. Rule L25: for each part, choose the response that fits it. The correction fixes this nonconformity now; the root cause says why the process let it happen; the corrective action changes the process so that it does not happen again. Give each an owner and a date; Stage 2 is booked for 12 April 2027. The responses are checked; owners and dates are format-checked and kept with your hand-in.",
    },
    checkRows: { 5: { label: 0, col: 1 } },
    handIn: { step: 6, cols: [1, 2, 3], ident: [0] },
  },
  "F1.2": {
    code: "LI-FAM",
    title: "LI-FAM · ISO/IEC 27000-family map (template T-LI-FAM)",
    stamp: "Sheet Documents",
    on: [1, 2, 6],
    cols: [
      { h: "Organisation" },
      { h: "A Document" },
      { h: "B Type (L01)", opts: "step", what: "One of rule L01's four types" },
      { h: "C What it is for", prose: true, w: 240 },
      { h: "D Who uses it", prose: true, w: 180 },
      { h: "E Where this programme uses it", opts: FAM_USE, wrap: true, w: 220, what: "The tasks of this programme that use the document" },
    ],
    rows: [
      famRow(LT, "ISO/IEC 27000", "Vocabulary", FAM_USE[0]),
      famRow(LT, "ISO/IEC 27002:2022", "Guidance standard", FAM_USE[1]),
      ...FAM_DOCS.map(([doc]) => famRow(GC, doc)),
    ],
    mine: (r, desk) => r[0] === desk.orgs.A.name,
    // 2: B, the type · 6 (part 2): E, where the programme uses it. C and D come with the template.
    steps: { 2: [2], 6: [5] },
    ident: [1],
    // The type is decided from what the document is for and who uses it: both beside the column decided.
    view: { 2: [3, 4], 6: [3] },
    note: {
      2: ruleNote("L01"),
      6: () => "For each document, choose the tasks of this programme that use it. Read what it is for in column C, then find the task whose title is about that in Home › My plan.",
    },
    checkRows: { 2: { label: 1, col: 2 }, 6: { label: 1, col: 5 } },
    handIn: { step: 7, cols: [2, 5], ident: [1] },
    reads: { 2: ["learn|Rule tables"], 6: ["learn|Framework Quick Reference", "home|My plan"] },
  },
  "F1.2 PDCA": {
    code: "PDCA",
    title: "PDCA · Sheet PDCA of LI-FAM (template T-LI-FAM)",
    stamp: "Sheet PDCA",
    job: "Fill sheet PDCA of LI-FAM.",
    on: [4],
    cols: [
      { h: "Clause" },
      { h: "Title" },
      { h: "PDCA phase (L02)", opts: "step", what: "Plan, Do, Check or Act" },
      // UX101 W4 (C-04): a title alone does not say what a clause asks. Our summary, never the standard's text; last, so
      // the phase column keeps its place in saved work and in the key.
      { h: "What the clause requires (our summary)", prose: true, w: 340, what: "What the clause asks, in our words. Read the standard itself before citing it." },
    ],
    // ISO/IEC 27001:2022's clause titles; what each requires in our own words (logged, UX101 — W4).
    rows: [
      ["Clause 4", "Context of the organization", "", "Work out the internal and external issues that affect the ISMS, the interested parties and their requirements, and where the ISMS begins and ends (its scope)."],
      ["Clause 5", "Leadership", "", "Top management commits to the ISMS, sets the information security policy, and assigns the roles, responsibilities and authorities."],
      ["Clause 6", "Planning", "", "Assess the information security risks and decide how to treat them, set the objectives and how to reach them, and plan any change to the ISMS."],
      ["Clause 7", "Support", "", "Determine and provide what the ISMS needs in order to work: resources, competent and aware people, communication and controlled documents."],
      ["Clause 8", "Operation", "", "Carry out the processes and the risk treatment plan as Clause 6 set them out, and repeat the risk assessment at planned intervals."],
      ["Clause 9", "Performance evaluation", "", "Monitor and measure the ISMS, audit it internally, and have top management review it."],
      ["Clause 10", "Improvement", "", "Deal with nonconformities and their causes, and keep making the ISMS more suitable, adequate and effective."],
    ],
    mine: () => true,
    steps: { 4: [2] },
    ident: [0, 1],
    view: { 4: [3] },
    note: { 4: (desk) => `${ruleNote("L02")(desk)} Column "What the clause requires" says what each clause asks, in our words; each clause's entry in Learn › Framework Quick Reference says more.` },
    checkRows: { 4: { label: 0, col: 2 } },
    handIn: { step: 7, cols: [2], ident: [0, 1] },
    reads: { 4: ["learn|Rule tables", "learn|Framework Quick Reference"] },
  },
  "F1.3": {
    code: "CTX-ISS",
    title: "CTX-ISS · Internal and external issues (template T-LI-CTX)",
    on: [1, 2, 3, 4],
    cols: [
      { h: "Organisation" },
      { h: "A Issue", w: 260, opts: (_d, r) => (r[3] === CLIMATE ? CTX_CLIMATE : CTX_CATS.includes(r[3]) ? CTX_EXT : undefined) },
      { h: "B Internal/External", opts: "step" },
      { h: "C Category" },
      { h: "D Effect on the ISMS's intended outcomes", prose: true, w: 260 },
      { h: "E Source", opts: (_d, r) => (CTX_CATS.includes(r[3]) ? CTX_SRC : undefined) },
    ],
    rows: [
      [LT, "GDPR and the UAVG apply to the student and staff data of the Amsterdam office", "External", "Legal", "Student data must be processed lawfully and a breach reported within 72 hours, so the ISMS must protect it and detect breaches in time", "SITL-ADD-36 Section 2"],
      [LT, "The Netherlands' NIS2 law, the Cyberbeveiligingswet, is delayed, so the duties it will bring are not yet fixed", "External", "Regulatory", "Security measures may have to change when the law arrives, so the ISMS must follow it and plan for it", "SITL-ADD-36 Section 2"],
      [LT, "Schools, universities and corporate training programmes in 50 countries choose online learning platforms", "External", "Market", "Customers in many countries expect their learners' data protected to their own rules, so the ISMS must show that it is", "SITL-ADD-36 Section 1"],
      ...CTX_CATS.map((c) => [GC, "", "External", c, "", ""]),
      ...CTX_ISS_6.map(([issue, topic, effect]) => [GC, issue, "", topic, effect, "Dataset CTX-ISS-6"]),
      [GC, "", "External", CLIMATE, "", "SITL-ADD-16 Section 1"],
    ],
    mine: (r, desk) => r[0] === desk.orgs.A.name,
    // 2: the four external issues (A, D, E) · 3: B for the six of CTX-ISS-6 · 4 (part 2): the climate row's A and D.
    steps: { 2: [1, 4, 5], 3: [2], 4: [1, 4] },
    only: {
      2: (r) => CTX_CATS.includes(r[3]),
      3: (r) => r[5] === "Dataset CTX-ISS-6",
      4: (r) => r[3] === CLIMATE,
    },
    ident: [1],
    view: { 2: [2, 3], 4: [3, 5] },
    // The effect and the reason are written, not chosen: format-checked and kept with your hand-in. What is checked here
    // is that one is there, as a sentence.
    cells: {
      4: {
        fix: (v) => (words(v) >= 6 ? v.trim() : null),
        hint: (r) => (r[3] === CLIMATE
          ? "Write the reason in one sentence of six words or more: what the hazard profile in SITL-ADD-16 Section 1 says that leads to your conclusion, as in \"Section 1 scores Poland 2 of 5 for natural hazards, with flooding, and Warsaw lost no working day to weather\" for the Warsaw office."
          : "Write the effect in one sentence of six words or more: what the issue does to what the ISMS must achieve, as the worked rows do, for example \"Student data must be processed lawfully, so the ISMS must protect it\"."),
      },
    },
    note: {
      2: (desk) => `Each of your four rows names its category in column C. In ${addendum(desk)} Section 1 and Section 2 (the Manila, Philippines row), find the issue of that category that applies to ${office(desk)}. Choose it in column A, write in column D what it does to the ISMS's intended outcomes, and choose in column E the section you read it in. Columns A and E are checked; column D is format-checked and kept with your hand-in.`,
      4: (desk) => `Whether climate change is relevant to ${office(desk)} depends on what the climate can do there. Read the Manila row of the natural-hazard and climate profile in ${addendum(desk)} Section 1: the score (1 to 5), the principal hazards and what the office has recorded. The scores come from SITL-ERM-001 Annex B. Record your conclusion in column A and the reason in column D. Column A is checked; the reason is format-checked and kept with your hand-in.`,
    },
    extra: { 4: [["SITL-ADD-16", ["1"]], ["SITL-ERM-001", ["Annex B"]]] },
    load: ["SITL-ERM-001"],
    checkRows: { 2: { label: 3, col: 1, with: 5 }, 3: { label: 1, col: 2 }, 4: { label: 3, col: 1 } },
    handIn: { step: 7, cols: [1, 2, 3, 4, 5], ident: [1] },
  },
  "F1.3 CTX-IP": {
    code: "CTX-IP",
    title: "CTX-IP · Interested parties",
    stamp: "Interested parties",
    on: [5, 6],
    cols: [
      { h: "Party", w: 150 },
      { h: "Internal/External", opts: ["Internal", "External"] },
      { h: "Requirement", prose: true, w: 260 },
      { h: "Standard/law", prose: true, w: 200 },
      { h: "Rule" },
      { h: "Addressed through the ISMS?", opts: (d, r) => addressedOpts(d, r), wrap: true, w: 260 },
      { h: "Evidence ref" },
    ],
    rows: Array.from({ length: 5 }, () => ["", "", "", "", "", "", ""]),
    mine: () => true,
    // 5 (part 2): the copy of Section 4 · 6 (part 2): which requirements the ISMS addresses. Rule and Evidence ref are the
    // same on every row (his step gives both): the platform writes them.
    steps: { 5: [0, 1, 2, 3], 6: [5] },
    ident: [0],
    view: { 6: [2] },
    derived: {
      4: { from: [0], value: () => "R04" },
      6: { from: [0], value: () => "SITL-ADD-16 Section 4" },
    },
    cells: {
      0: {
        fix: (v, _r, desk, ri) => { const s = partyRow(desk, ri); return !s ? unread(v) : squash(v) === squash(s[0]) ? s[0] : null; },
        hint: (_r, desk, ri) => `Not the party in row ${ri + 1} of the table under ${addendum(desk)} Section 4. Copy its Interested party group as written, in the table's order, as in "Suppliers" for a row that reads Suppliers.`,
      },
      1: {
        fix: (v, _r, desk, ri) => { const s = partyRow(desk, ri); return !s ? unread(v) : v === s[2] ? v : null; },
        hint: (_r, desk, ri) => `Not what row ${ri + 1} of the table under ${addendum(desk)} Section 4 gives in its Internal / External column.`,
      },
      2: {
        fix: (v, _r, desk, ri) => { const s = partyRow(desk, ri); return !s ? unread(v) : sameItems(v, bullets(s[1])) ? bullets(s[1]).join("; ") : null; },
        hint: (_r, desk, ri) => `Not the Requirements of row ${ri + 1} of the table under ${addendum(desk)} Section 4. Copy every item of that cell, separated by semicolons, as in "First requirement; Second requirement; Third requirement".`,
      },
      3: {
        fix: (v, _r, desk, ri) => { const s = partyRow(desk, ri); return !s ? unread(v) : sameItems(v, s[3].split(";")) ? s[3] : null; },
        hint: (_r, desk, ri) => `Not the Standard / law of row ${ri + 1} of the table under ${addendum(desk)} Section 4. Copy it as written, with a semicolon between two or more, as in "Labour law; Privacy law".`,
      },
    },
    note: {
      5: ruleNote("R04"),
      6: () => "Clause 4.2 c): for each party, record which of its requirements the ISMS will address. A requirement is addressed through the ISMS when it asks for information or personal data to be protected, or handled as a data-protection law or agreement requires. Requirements about service levels (quality scores, uptime, staffing, connectivity), labour law, HR outsourcing or performance management are met by other parts of the business. Choose Yes with every requirement of the party the ISMS addresses, or No.",
    },
    checkRows: { 6: { label: 0, col: 5 } },
    handIn: { step: 7, cols: [0, 1, 2, 3, 5], ident: [0] },
  },
  "F2.1": {
    code: "LI-SCOPE",
    title: "LI-SCOPE · ISMS scope statement (template T-LI-SCOPE)",
    stamp: "Sections 1–5",
    on: [1, 3, 4],
    cols: [
      { h: "Organisation" },
      { h: "Part", w: 150 },
      { h: "Statement", prose: true, w: 320, opts: (_d, r) => (r[1] === EXCL ? SCOPE_EXCLUSIONS : SCOPE_STATEMENTS[r[1]]) },
      { h: "Source", w: 190, opts: (_d, r) => (SCOPE_PARTS.includes(r[1]) ? SCOPE_SOURCES : undefined) },
    ],
    rows: [
      [LT, "1 Organisational units", "EdTech & Learning Platforms, Student Services, Customer Operations & Support, Regional Finance", "SITL-ADD-36 Section 8.2"],
      [LT, "2 Location", "Amsterdam, Netherlands (regional office)", "SITL-ADD-36 Section 2"],
      [LT, "3 Services", "AI-powered personalised learning, virtual classroom, assessment and quiz builder, performance analytics, corporate e-learning, content authoring, digital credentials", "SITL-ADD-36 Section 1.1"],
      [LT, "4 Technology", "Cloud-native, no significant on-premises assets: learning platform (SaaS), video conferencing, student data warehouse, AI/ML model serving, CDN, LMS backend", "SITL-ADD-36 Section 9"],
      [LT, "Requirements addressed (Clause 4.3 b)", "Child data protection (under-18 users), parental consent management, KVKK consent for minors' data, GDPR for EU students, school data processing agreements", "LearnTech's CTX-IP"],
      [LT, EXCL, "Content authoring: done by the content team at the Istanbul head office, and covered by the head office's scope", "SITL-ADD-36 Section 8.2"],
      [LT, IFACE_PART, "Learning platform ↔ its cloud hosting provider: information and a service cross the boundary, governed by A.5.23 Information security for use of cloud services", "SITL-ADD-36 Section 9"],
      ...SCOPE_PARTS.map((part) => [GC, part, "", ""]),
      [GC, EXCL, "", "Steps 2 and 4"],
    ],
    mine: (r, desk) => r[0] === desk.orgs.A.name,
    // 3: statement and source of sections 1–4 and the requirements line · 4 (part 2): the exclusions statement.
    steps: { 3: [2, 3], 4: [2] },
    only: { 3: (r) => SCOPE_PARTS.includes(r[1]), 4: (r) => r[1] === EXCL },
    ident: [1],
    then: { 4: "Section 5, Exclusions" },
    note: {
      3: (desk) => `Each of your five lines names its part. Choose the statement its source gives for ${office(desk)}, and the source you read it in. Organisational units: the Department column of the Manila rows in ${addendum(desk)} Section 8.1. Location: Section 2. Services: Section 1.1. Technology: the Manila rows of TSA-16 Office_Deployment (Learn › Reference pages). Requirements: the ones you marked Addressed through the ISMS in CTX-IP (F1.3 step 6). Statement and source are checked together.`,
      4: () => "Section 5 records each part of the office's own activities that the scope leaves out, with its justification, or None. Hold each choice against your answer to part 1 and your answer to step 2.",
    },
    extra: { 3: [["SITL-ADD-16", ["1.1", "2", "8.1"]]] },
    // The toolbar dot on Learn: TSA-16 Office_Deployment is in Learn › Reference pages.
    reads: { 3: ["learn|Reference pages"] },
    checkRows: { 3: { label: 1, col: 2, with: 3 }, 4: { label: 1, col: 2 } },
    handIn: { step: 7, cols: [2, 3], ident: [1] },
  },
  "F2.1 PROC": {
    code: "PROC",
    title: "Section 6 · ISMS processes (LI-SCOPE, template T-LI-SCOPE)",
    stamp: "Section 6",
    job: "Fill section 6 of LI-SCOPE, the ISMS processes.",
    on: [5],
    cols: [
      { h: "ISMS process", w: 150 },
      { h: "ISO/IEC 27001:2022", w: 110 },
      { h: "Owner (L04)", opts: "step", w: 180, what: "The role that runs the process" },
      { h: "Inputs → outputs", opts: PROC_IO, wrap: true, w: 240, what: "What the process works from, and what it hands on" },
    ],
    rows: PROCESSES.map(([p, c]) => [p, c, "", ""]),
    mine: () => true,
    steps: { 5: [2, 3] },
    ident: [0, 1],
    note: { 5: ruleNote("L04") },
    extra: { 5: [["Charter", ["16"]], ["SITL-POL-001", ["5", "6.1"]], ["SITL-POL-000", ["7"]]] },
    reads: { 5: ["learn|Reference pages"] },
    checkRows: { 5: { label: 0, col: 2, with: 3 } },
    handIn: { step: 7, cols: [2, 3], ident: [0] },
  },
  "F2.1 IFACE": {
    code: "IFACE",
    title: "Section 7 · Interfaces and dependencies (LI-SCOPE, template T-LI-SCOPE)",
    stamp: "Section 7",
    job: "Fill section 7 of LI-SCOPE, the interfaces and dependencies.",
    on: [6],
    cols: [
      { h: "Interface or dependency", w: 160 },
      { h: "Counterparty", w: 110 },
      { h: "Exchanged", prose: true, w: 140 },
      { h: "What crosses the boundary", opts: CROSSES, wrap: true, w: 160 },
      { h: "Annex A control", opts: IF_CONTROLS, wrap: true, w: 180 },
    ],
    rows: IFACES.map(([i, c, x]) => [i, c, x, "", ""]),
    mine: () => true,
    steps: { 6: [3, 4] },
    ident: [0],
    // Who is at the other end and what passes are what the step decides from: shown beside the two columns it fills.
    view: { 6: [1, 2] },
    note: {
      6: (desk) => `Rows 1–6 are the integrations of ${addendum(desk)} Section 9.1, in its order; row 7 is the payroll provider of step 2. Read each row's Internal / External column in Section 9.1: an integration whose two ends are both ${desk.orgs.A.name}'s sits inside the scope, and nothing crosses its boundary. For the others, choose what crosses: information, a service the office depends on, or both. Then choose the Annex A control that governs that crossing: A.5.20 where the other party is a supplier working under an agreement with ${desk.orgs.A.name}, A.5.14 where information is transferred to or from a party that is not a supplier.`,
    },
    checkRows: { 6: { label: 0, col: 3, with: 4 } },
    handIn: { step: 7, cols: [3, 4], ident: [0] },
  },
  "F2.2": {
    code: "LI-GAP",
    title: "LI-GAP · Clause gap analysis (template T-LI-PLAN, sheet Gap)",
    stamp: "Sheet Gap",
    on: [1, 2, 3],
    cols: [
      { h: "A Clause", w: 170 },
      { h: "What the clause requires", prose: true, w: 230 },
      { h: "B What was found at Manila (GAP-25)", prose: true, w: 260 },
      { h: "C Status (L13)", opts: "step", w: 130 },
      { h: "D Maturity level", opts: "step", w: 150 },
      { h: "E Reason", prose: true, w: 240 },
    ],
    rows: GAP_25,
    // Rows 4.1 and 4.2 are the worked examples: status, level and reason given.
    mine: (r) => !r[3],
    // 2: C, the status · 3: D, the level (6.1.2's is step 4's question, written from its answer).
    steps: { 2: [3], 3: [4] },
    only: { 3: (r) => !at612(r) },
    ident: [0],
    // The status is decided from what the clause requires against what was found; the level from what was found, with
    // the status beside it.
    view: { 2: [1, 2], 3: [2, 3] },
    derived: {
      4: {
        from: [0],
        quiet: true,
        value: (v, p) => { if (!at612([v(0)])) return null; const d = p.decisions?.["F2.2-D3"]; return d ? D3_LEVEL[d.best ?? d.pick] ?? "" : ""; },
        waits: () => "Decided in step 4",
      },
    },
    note: {
      2: ruleNote("L13"),
      3: () => "Decide each clause's level from what was found, with the Maturity Model (Ref-Maturity Model, in Learn › Reference pages). Ask its questions in order and stop at the first No. 1) Is there a documented, approved way of doing it, and records that it is done? No → Level 1. 2) Is it the Group's standard way, done the same in every office, and reviewed at least once a year? No → Level 2. 3) Is it measured against targets, with the results tracked and acted on? No → Level 3; Yes → Level 4. 6.1.2 is step 4's question.",
    },
    reads: { 1: ["learn|Reference pages"], 3: ["learn|Reference pages"] },
    checkRows: { 2: { label: 0, col: 3 }, 3: { label: 0, col: 4 } },
    handIn: { step: 6, cols: [3, 4], ident: [0] },
  },
  "F2.2 PLAN": {
    code: "PLAN",
    title: "Sheet Plan · Top three gaps (LI-GAP, template T-LI-PLAN)",
    stamp: "Sheet Plan",
    job: "Fill sheet Plan of LI-GAP.",
    on: [5],
    cols: [
      { h: "Priority", w: 80 },
      { h: "Gap (clause)", opts: GAP_LABELS, wrap: true, w: 240, what: "A requirement of clauses 4.1–10.2 that is not fully met" },
      { h: "Owner role", opts: (desk) => desk.tasks["F2.1"]?.steps[4]?.opt ?? [], wrap: true, w: 190, what: "The owner of the ISMS process that closes the gap" },
      { h: "Target date", date: true, what: "When the owner closes the gap" },
      { h: "Status in sheet Gap", w: 120 },
    ],
    rows: ["Priority 1", "Priority 2", "Priority 3"].map((x) => [x, "", "", "", ""]),
    mine: () => true,
    steps: { 5: [1, 2, 3] },
    ident: [0],
    then: { 5: "Sheet Plan, your top three gaps" },
    // The chosen gap's status as sheet Gap stands after step 2's check: the learner sees what they picked.
    derived: {
      4: {
        from: [1],
        value: (v, p) => { const g = REGISTERS["F2.2"], ri = GAP_LABELS.indexOf(v(1)); return ri < 0 ? "" : standing(g, p, "F2.2", ri, 3); },
        waits: () => "Shows once a gap is chosen",
      },
    },
    note: {
      5: () => "List the three gaps you close first, in order. The status of every clause is in sheet Gap, as step 2 checked it (its View button in the step list opens it). Order them so that each one's output is ready when the next needs it: an internal audit raises nonconformities, and Clause 9.3.2 lists what the management review takes in, among them audit results and the status of nonconformities and corrective actions. The owner role is the owner of the ISMS process that closes the gap: read it where Ref-ISMS processes (Learn › Reference pages) says, as in LI-SCOPE section 6. Gap and owner are checked together; the target date is yours to set.",
    },
    extra: { 5: [["Charter", ["16"]], ["SITL-POL-001", ["6.1"]]] },
    reads: { 5: ["learn|Reference pages"] },
    checkRows: { 5: { label: 0, col: 1, with: 2 } },
    handIn: { step: 6, cols: [1, 2, 3], ident: [0] },
  },
  "T3.1": {
    code: "LI-POL",
    title: "LI-POL · ISMS policy check (template T-LI-POL)",
    stamp: "Sheet Policy check",
    on: [1, 2],
    cols: [
      { h: "Clause 5.2 item", w: 230 },
      { h: "Found/Gap (L08)", opts: "step", w: 110, what: "Found, or Gap where no section meets the item" },
      { h: "Section", opts: POL_SECTIONS, w: 130, what: "The section of SITL-POL-001 you cite" },
      { h: "Note", prose: true, w: 230, what: "What to look for in the policy: given with the template" },
    ],
    rows: POL_ITEMS.map(([item, note]) => [item, "", "", note]),
    mine: () => true,
    steps: { 2: [1, 2] },
    ident: [0],
    view: { 2: [3] },
    // A Gap has no section to cite (rule L08): written by itself, so only a Found row asks for one.
    derived: { 2: { from: [1], value: (v) => (v(1) === "Gap" ? NO_SECTION : null) } },
    note: { 2: ruleNote("L08") },
    checkRows: { 2: { label: 0, col: 1, with: 2 } },
    handIn: { step: 7, cols: [1, 2], ident: [0] },
  },
  "T3.1 LEAD": {
    code: "LEAD",
    title: "Sheet Leadership · Evidence of top management commitment (LI-POL, template T-LI-POL)",
    stamp: "Sheet Leadership",
    on: [5],
    cols: [
      { h: "Statement read in your inputs", prose: true, w: 300 },
      { h: "Top management commitment (Clause 5.1)?", opts: ["Yes", "No"], wrap: true, w: 140, what: "Yes where top management itself acts" },
      { h: "Source", opts: LEAD_SOURCES, w: 190, what: "The document and section the statement is read in" },
    ],
    rows: LEAD_ROWS.map((x) => [x, "", ""]),
    mine: () => true,
    steps: { 5: [1, 2] },
    ident: [0],
    then: { 5: "Sheet Leadership, the evidence of top management's commitment" },
    note: {
      5: () => "Each row is a statement found in your inputs: SITL-POL-001, SITL-POL-000 and the GRC Charter (Policies › Policy Library). Locate the five that show top management's commitment to the ISMS (Clause 5.1: top management itself sets the direction, provides the resources, builds the ISMS into the business, or drives its improvement) and mark them Yes; mark the others No. For every row, choose the document and section you read it in. Both columns are checked together.",
    },
    extra: { 5: [["SITL-POL-001", ["5", "6.1", "6.2", "11"]], ["SITL-POL-000", ["2", "7"]], ["Charter", ["6", "7.3"]]] },
    reads: { 5: ["learn|Framework Quick Reference"] },
    checkRows: { 5: { label: 0, col: 1, with: 2 } },
    handIn: { step: 7, cols: [1, 2], ident: [0] },
  },
  "T3.1 SET": {
    code: "POL-SET",
    title: "POL-SET · Topic-specific policy register (template T-LI-POL, sheet Policy set)",
    stamp: "Sheet Policy set",
    on: [6],
    cols: [
      { h: "Topic (ISO/IEC 27002:2022 Section 5.1)", w: 200 },
      { h: "SITL policy", opts: [...POL_INDEX.map((x) => x[0]), NO_POLICY], w: 150, what: "The ID of the SITL policy that covers the topic" },
      { h: "Owner", w: 170 },
      { h: "Approver", w: 150 },
      { h: "Last review date", w: 110 },
      { h: "Status", opts: ["Current", "Overdue", "Missing"], w: 110, what: "On 19 October 2026, the date of the portal extract" },
    ],
    rows: POL_TOPICS.map((t) => [t, "", "", "", "", ""]),
    mine: () => true,
    steps: { 6: [1, 5] },
    ident: [0],
    // Looked up from the policy chosen: its owner (SITL-POL-000 Section 3), the approver Section 2 gives a policy, and its
    // last approval (Ref-Policy portal). Copying them is no judgment; choosing the policy and the status is.
    derived: {
      2: { from: [1], value: (v) => (v(1) === NO_POLICY ? "—" : polOf(v(1))?.[1] ?? ""), waits: () => "Fills from the policy" },
      3: { from: [1], value: (v) => (v(1) === NO_POLICY ? "—" : polOf(v(1)) ? "Group GRC Steering Committee" : ""), waits: () => "Fills from the policy" },
      4: { from: [1], value: (v) => (v(1) === NO_POLICY ? "—" : polOf(v(1))?.[2] ?? ""), waits: () => "Fills from the policy" },
    },
    note: {
      6: () => "The twelve topics in column A are the example topics ISO/IEC 27002:2022 Section 5.1 gives for topic-specific policies (the list is in Learn › Framework Quick Reference, entry ISO/IEC 27001 A.5.1). For each topic, find the SITL policy that covers it: its title in SITL-POL-000 Section 3, what it covers in Ref-Policy portal (Learn › Reference pages). Choose None in the library where no policy covers the topic. The owner, the approver and the last review date then fill themselves. Status, on 19 October 2026 (the date of the portal extract): SITL-POL-000 Section 7 reviews every policy each year, so a policy last approved within the 12 months before that date is Current, and one approved earlier is Overdue. A topic no policy covers is Missing. Policy and status are checked together.",
    },
    extra: { 6: [["SITL-POL-000", ["2", "3", "7"]]] },
    reads: { 6: ["learn|Reference pages", "learn|Framework Quick Reference"] },
    checkRows: { 6: { label: 0, col: 1, with: 5 } },
    handIn: { step: 7, cols: [1, 5], ident: [0] },
  },
  "T3.2": {
    code: "LI-RACI",
    title: "LI-RACI · ISMS RACI (template T-LI-POL, sheet RACI)",
    stamp: "Sheet RACI",
    on: [1],
    cols: [
      { h: "ISMS process", w: 150, what: "One of the ten processes of your LI-SCOPE section 6." },
      { h: "ISO/IEC 27001:2022", w: 110, what: "The clause or controls the process serves." },
      { h: "R Responsible", opts: RACI_ROLES, w: 180, what: "The role that runs the process." },
      { h: "A Accountable", opts: RACI_ROLES, w: 160, what: "The one role that answers for the process." },
      { h: "C Consulted", prose: true, w: 200, what: "Asked before it is done; Charter role abbreviations." },
      { h: "I Informed", prose: true, w: 170, what: "Told once it is done; Charter role abbreviations." },
    ],
    rows: PROCESSES.map(([p, c]) => [p, c, "", "", ...RACI_CI[p]]),
    mine: () => true,
    steps: { 1: [2, 3] },
    ident: [0, 1],
    view: { 1: [4, 5] },
    note: {
      1: () => "Sheet RACI lists the ten ISMS processes of your LI-SCOPE section 6 (F2.1). For each, choose R, the role that runs it: its owner, read where Ref-ISMS processes (Learn › Reference pages) says. Then choose A, the one role that answers for it. Where Ref-ISMS processes points to a row of the GRC Charter Section 16 RACI, A is the role marked A on that row (A/R: the same role is both). Where it points to SITL-POL-001, A is the role the Responsible role answers to in that section. Only one Accountable per process. Consulted and Informed are filled from the same rows, in the Charter's abbreviations (spelled out under its table). R and A are checked together.",
    },
    extra: { 1: [["Charter", ["16"]], ["SITL-POL-001", ["5", "6.1"]]] },
    reads: { 1: ["learn|Reference pages"] },
    checkRows: { 1: { label: 0, col: 2, with: 3 } },
    handIn: { step: 9, cols: [2, 3], ident: [0] },
  },
  "T3.2 HEAD": {
    code: "RACI-HEAD",
    title: "Sheet RACI · Header: the Clause 5.3 assignments (LI-RACI, template T-LI-POL)",
    stamp: "RACI header",
    on: [2],
    cols: [
      { h: "Clause 5.3 assignment", w: 260, what: "What top management must assign by name." },
      { h: "Role assigned", opts: RACI_ROLES, w: 200, what: "The role that holds the assignment at Manila." },
      { h: "Source", opts: HEAD_SOURCES, w: 190, what: "The document and section the assignment is read in." },
    ],
    rows: HEAD_ROWS.map((x) => [x, "", ""]),
    mine: () => true,
    steps: { 2: [1, 2] },
    ident: [0],
    then: { 2: "The RACI header: who holds each Clause 5.3 assignment" },
    note: {
      2: () => "Record the role that holds each assignment at GlobalConnect Manila, and where you read it. SITL-POL-001 (Policies › Policy Library) gives the roles that run the ISMS in each organisation: Section 5 their responsibilities, Section 6.2 who reports the objectives' results to the management review. The GRC Charter gives the Group's: Section 13 compliance and audit, Section 15.1 the Group's reporting calendar. Role and source are checked together.",
    },
    extra: { 2: [["SITL-POL-001", ["5", "6.1", "6.2"]], ["Charter", ["13", "15.1"]]] },
    reads: { 2: ["learn|Framework Quick Reference"] },
    checkRows: { 2: { label: 0, col: 1, with: 2 } },
    handIn: { step: 9, cols: [1, 2], ident: [0] },
  },
  "T3.2 CIT": citRegister("T3.2", { find: 3, status: 4, level: 5, pack: 6, first: 7, handIn: 9 }),
  "T3.2 PACK": packRegister("T3.2", 6, 6, "it is format-checked and kept with your hand-in"),
  "T8.1": {
    code: "IR-TTX",
    title: "IR-TTX · Tabletop exercise record (template T-LI-TTX)",
    stamp: "Six injects",
    on: [1, 2],
    studyNote: [1],
    cols: [
      { h: "Inject", w: 70, what: "The inject's number in the scenario." },
      { h: "UTC time", w: 150, what: "When it happens, in UTC (Manila is UTC+8)." },
      { h: "What happens", prose: true, w: 320, what: "The inject as the facilitator reads it out." },
      { h: "Phase", opts: "step", w: 210, what: "The stage of the incident life cycle the inject belongs to." },
      { h: "Decision", prose: true, w: 260, what: "What the team decided at the inject." },
      { h: "Owner", w: 190, what: "Who acts on the inject." },
      { h: "Control", w: 230, what: "The Annex A control of the phase." },
    ],
    rows: TTX.injects.map(([id, time, what, owner, decision]) => [id, time, what, "", decision, owner, ""]),
    mine: () => true,
    steps: { 2: [3] },
    ident: [0, 1],
    view: { 2: [2] },
    derived: {
      4: {
        from: [0],
        value: (v, p) => {
          if (v(0) === "INJ-3") { const d = p.decisions?.["T8.1-D2"]; return d ? TTX_D2[d.best ?? d.pick] ?? "" : ""; }
          if (v(0) === "INJ-5") { const at = standing(REGISTERS["T8.1 CLOCK"], p, "T8.1", 0, 3); return at ? `Notify the NPC and the customers by ${at}; tell the bank at once (R30)` : ""; }
          return null;
        },
        waits: (v) => `Decided in step ${v(0) === "INJ-3" ? 3 : 4}`,
      },
      6: { from: [3], quiet: true, value: (v) => ttxControl(v(3)), waits: () => "From the phase (step 2)" },
    },
    note: {
      1: () => `${TTX.scenario} Read the six injects in order, as the team plays them.`,
      2: () => "Decide what each inject is about, from what happens in it. Planning and preparation (A.5.24): getting ready before an incident, such as the plan, the roles, the contacts and rehearsing them. Assessment and decision (A.5.25): an event is assessed to decide whether it is an incident, and how severe. Response (A.5.26): acting on an incident: containing it, escalating it, telling those who must know, recovering. Learning (A.5.27): after the incident, finding its root cause and the lessons. Collection of evidence (A.5.28): identifying and preserving what an investigation, a court or a regulator will need. SITL-POL-014 Section 6.1 (Policies › Policy Library) gives the life cycle step by step. The control fills itself from the phase.",
    },
    extra: { 2: [["SITL-POL-014", ["6.1", "7.1"]]] },
    checkRows: { 2: { label: 0, col: 3 } },
    handIn: { step: 11, cols: [3, 4, 6], ident: [0] },
  },
  "T8.1 CLOCK": {
    code: "IR-NOTICE",
    title: "Sheet Notification · The authority's deadline (IR-TTX, template T-LI-TTX)",
    stamp: "Sheet Notification",
    on: [4],
    cols: [
      { h: "Regime", w: 230, what: "The breach-notification regime of the engaged office." },
      { h: "Clock", w: 230, what: "The regime's clock, as the addendum's Section 2 gives it." },
      { h: "Discovery time (UTC)", date: "time", w: 200, what: "When the clock starts (SITL-POL-014 Section 6.3, step 6)." },
      { h: "Deadline (UTC)", date: "time", w: 200, what: "Discovery time plus the clock." },
    ],
    rows: [[...TTX.clock, "", ""]],
    mine: () => true,
    steps: { 4: [2, 3] },
    ident: [0],
    view: { 4: [1] },
    then: { 4: "Sheet Notification: the discovery time and the deadline, in UTC" },
    note: {
      4: () => `Record when the authority must be told. SITL-POL-014 Section 6.3 (Policies › Policy Library) is rule R30 step by step: step 1 says which offices are engaged, step 2 where their regime is read (the addendum's Section 2: the clock is given here), step 6 what counts as the discovery time and how a deadline is counted and written, step 7 which deadline governs. The injects of IR-TTX that bear on it: ${TTX.injects.filter((r) => ["INJ-2", "INJ-4", "INJ-5"].includes(r[0])).map((r) => `${r[0]}, ${r[1]}: ${r[2]}`).join(" ")} Both times are in UTC and are checked together.`,
    },
    extra: { 4: [["SITL-POL-014", ["3.1", "6.3"]], ["SITL-ADD-16", ["2"]]] },
    checkRows: { 4: { label: 0, col: 2, with: 3 } },
    handIn: { step: 11, cols: [2, 3], ident: [0] },
  },
  "T8.1 CIT": (() => {
    const r = citRegister("T8.1", { find: 5, status: 6, level: 7, pack: 8, first: 9, handIn: 11 });
    return { ...r, note: { ...r.note, 9: () => T81_FIRST } };
  })(),
  "T8.1 PACK": packRegister("T8.1", 8, 8, "it is format-checked and kept with your hand-in"),
  "T10.1": {
    code: "CFG-BASE",
    title: "CFG-BASE · Configuration baseline check (template T-LI-CFG)",
    stamp: "Sheet CFG-BASE",
    on: [1],
    cols: [
      { h: "Setting", w: 80, what: "The setting's ID in dataset CFG." },
      { h: "System", w: 170, what: "The Manila system the setting is on." },
      { h: "Classification", w: 130, what: "The system's label and its Group tier." },
      { h: "Setting checked", w: 130, what: "What is configured." },
      { h: "Baseline", prose: true, w: 250, what: "What Manila's hardening checklist requires, and the rule it carries out." },
      { h: "Configured value", prose: true, w: 250, what: "What the extract of 30 November 2026 shows." },
      { h: "Compliant or Drift", opts: "step", w: 120, what: "Compliant where the configured value meets the baseline." },
      { h: "Fix", opts: (_d, r) => CFG.fix[r[0]], wrap: true, w: 250, what: "For a drift: the change that brings it back to the baseline." },
    ],
    rows: CFG.cfg.map((r) => [...r, "", ""]),
    mine: () => true,
    steps: { 1: [6, 7] },
    ident: [0, 1, 3],
    view: { 1: [2, 4, 5] },
    // A compliant setting needs no fix: written by itself. A fix is chosen only for a drift.
    derived: { 7: { from: [6], value: (v) => (v(6) === "Drift" ? null : v(6) ? FIX_NONE : ""), waits: () => "Chosen once you decide Drift" } },
    note: {
      1: () => "Each row is one setting of dataset CFG. Hold the configured value against the baseline, part by part: Compliant only where it meets every part of the baseline (a stronger value meets it too); Drift where any part is missing, weaker or extra. A baseline's rule depends on the system's tier, so read the Classification: SITL-STD-001 Section 6 (Policies › Policy Library) asks more of Tier 4, Client-Restricted, than of Tier 3, Client-Confidential. For every drift, choose the fix that brings the setting back to its baseline, not one that only narrows the gap. The decision and the fix are checked together.",
    },
    extra: { 1: [["SITL-STD-001", ["6"]], ["SITL-TECH-000", ["2"]], ["SITL-ADD-16", ["5"]]] },
    checkRows: { 1: { label: 0, col: 6, with: 7 } },
    handIn: { step: 11, cols: [6, 7], ident: [0] },
  },
  "T10.1 CRY": {
    code: "CRY-REG",
    title: "CRY-REG · Cryptography and key register (template T-LI-CFG, sheet Crypto)",
    stamp: "Sheet Crypto",
    on: [2],
    cols: [
      { h: "Key", w: 60, what: "The key's number in the register." },
      { h: "System", w: 170, what: "The system the key protects." },
      { h: "Purpose", w: 170, what: "What the key or certificate is used for." },
      { h: "Found in (extract line)", prose: true, w: 280, what: "The line of dataset CFG or NET it was found in." },
      { h: "Algorithm and key length", opts: CFG.cryOpts.alg, w: 130, what: "As the extract line gives it." },
      { h: "Where the key is stored", opts: CFG.cryOpts.store, wrap: true, w: 200, what: "Where the key itself is held." },
      { h: "Owner", opts: CFG.cryOpts.owner, wrap: true, w: 190, what: "The system's owner on TSA-16 Asset_System_Map." },
      { h: "Rotation period", opts: CFG.cryOpts.rot, w: 110, what: "How often the key or certificate is renewed." },
      { h: "Next rotation", date: "none", w: 150, what: "The last renewal plus the period; none where no period is set." },
    ],
    rows: CFG.cry.map((r) => [...r, "", "", "", "", ""]),
    mine: () => true,
    steps: { 2: [4, 5, 6, 7, 8] },
    ident: [0, 1, 2],
    view: { 2: [3] },
    note: {
      2: () => "Each row is an encryption use found in dataset CFG or NET, with the extract line it was found in. From that line, record the algorithm and key length, and where the key itself is stored. The owner is the system's owner on TSA-16 Asset_System_Map (Learn › Reference pages): whoever answers for a system answers for the keys that protect it (SITL-TECH-000 Section 2). The rotation period is how often the line says the key or certificate is renewed or changed; the next rotation is the last renewal's date plus that period. Where the line sets no period, choose None set and tick none for the date. The five values of a row are checked together.",
    },
    reads: { 2: ["learn|Reference pages"] },
    checkRows: { 2: { label: 0, col: 4, with: [5, 6, 7, 8] } },
    handIn: { step: 11, cols: [4, 5, 6, 7, 8], ident: [0] },
  },
  "T10.1 CIT": citRegister("T10.1", { find: 3, status: 4, level: 5, pack: 6, first: 7, handIn: 11 }),
  "T10.1 PACK": packRegister("T10.1", 6, 6, "it is format-checked and kept with your hand-in"),
  "T10.2 SAMPLE": {
    code: "CHG-SAMPLE",
    title: "CHG-TEST · Sheet Sample: the change sample drawn with rule R15 (template T-CT)",
    stamp: "Sheet Sample",
    on: [1],
    cols: [
      { h: "Sampling item", w: 230, what: "What the sheet records about the sample." },
      { h: "Value", w: 300, opts: (_d, r) => T102.sampling.find((x) => x[0] === r[0])?.[1], what: "Read from dataset CT-B and Ref-Sampling." },
    ],
    rows: [...T102.sampling.map(([x]) => [x, ""]), [T102.seedRow[0], ""]],
    mine: () => true,
    steps: { 1: [1] },
    ident: [0],
    // The seed is the platform's draw: written, never chosen.
    derived: { 1: { from: [0], value: (v) => (v(0) === T102.seedRow[0] ? T102.seedRow[1] : null) } },
    note: {
      1: () => "Dataset CT-B (on this step's Reference tab) is the export of every change made to the customer portal's production environment in the period: the population you sample from. Rule R15: look up the minimum sample in Ref-Sampling (Learn › Reference pages). A recurring control is sampled by how often it runs; a population of records, by its size. Choose the Ref-Sampling row that fits what you test, the population and the minimum sample. The platform draws the RFCs at random and records the seed, so anyone can draw the same sample again. Do not change the test script: its four attributes are the columns of step 2.",
    },
    reads: { 1: ["learn|Reference pages"] },
    checkRows: { 1: { label: 0, col: 1 } },
    handIn: { step: 11, cols: [1], ident: [0] },
  },
  "T10.2": {
    code: "CHG-TEST",
    title: "CHG-TEST · Change sample test (template T-CT, script pre-filled)",
    stamp: "25 changes sampled",
    on: [2],
    cols: [
      { h: "RFC", w: 90, what: "A change drawn into the sample (seed 4471)." },
      { h: "The change", prose: true, w: 280, what: "Type, component, what it affects, what it did and when it was implemented." },
      { h: "A1 Approved before implementation", prose: true, w: 220, what: "The approval the RFC records, and when." },
      { h: "A2 Tested", prose: true, w: 170, what: "The test evidence the RFC holds." },
      { h: "A3 Rollback plan", prose: true, w: 190, what: "The rollback plan the RFC holds." },
      { h: "A4 Post-implementation review", prose: true, w: 190, what: "The review the RFC records, and when." },
      { h: "Result", w: 150, opts: (_d, r) => (r[0] === CT_CONCL ? ["Effective", "Effective with exceptions", "Not effective"] : ["Pass", "Deviation"]), what: "Pass or Deviation; on the last row, the conclusion (R19)." },
      { h: "Rating (R26)", w: 150, opts: ["High", "Medium", "Low"], what: "A deviation's rating, by rule R26." },
    ],
    rows: [...CT_ROWS, [CT_CONCL, "Your conclusion on the change procedure, from the results and ratings of the 25 changes above, drawn from a population of 64.", "—", "—", "—", "—", "", ""]],
    mine: () => true,
    steps: { 2: [6, 7] },
    ident: [0],
    // The ticket's record for each attribute is what the step decides from.
    view: { 2: [1, 2, 3, 4, 5] },
    // A change that passes has no rating; the conclusion row has none either. Only a deviation's rating is chosen.
    derived: { 7: { from: [0, 6], value: (v) => (v(0) === CT_CONCL ? "—" : v(6) === "Pass" ? CT_PASS : null), waits: () => "Rated once the result is Deviation" } },
    note: {
      2: () => `The test script (do not change it) has four attributes, one column each: ${T102.script.join("; ")}. For each sampled RFC, hold the ticket's record against each attribute, using SITL-POL-009 Section 6.1 (Policies › Policy Library). Every attribute met: Pass. Any attribute not met: Deviation, rated with rule R26: High = affects a Mission Critical system (SITL-ADD-16 Section 8.1 lists the Mission Critical assets) or no evidence exists; Medium = done late or partly; Low = record-keeping only. On the last row, conclude with rule R19: Effective = no exceptions; Effective with exceptions = only Low or Medium ones, and no more than 5 % of the population; Not effective = any High exception, or more than 5 %. Result and rating are checked together.`,
    },
    extra: { 2: [["SITL-POL-009", ["6.1"]], ["SITL-ADD-16", ["8.1"]]] },
    checkRows: { 2: { label: 0, col: 6, with: 7 } },
    handIn: { step: 11, cols: [6, 7], ident: [0] },
  },
  "T10.2 SDLC": {
    code: "SDLC-MAP",
    title: "SDLC-MAP · Secure development gate map of the customer portal (template T-LI-SDLC)",
    stamp: "Gate map",
    on: [3],
    cols: [
      { h: "Control", w: 70, what: "The Annex A control of the row." },
      { h: "Title", w: 160, what: "The control's title in the standard." },
      { h: "What the control asks of the pipeline", prose: true, w: 280, what: "The gate the control needs somewhere in the pipeline." },
      { h: "Pipeline stage", w: 220, opts: T102.stages, what: "The stage of dataset SDLC where the control is applied." },
      { h: "Gate in place?", w: 230, opts: T102.gateOpts, what: "Whether that stage does what the control asks." },
    ],
    rows: T102.gates.map((g) => [...g, "", ""]),
    mine: () => true,
    steps: { 3: [3, 4] },
    ident: [0, 1],
    view: { 3: [2] },
    note: {
      3: () => "Dataset SDLC (on this step's Reference tab) describes the customer portal's pipeline stage by stage: what happens, the record it leaves and who does it. For each control, find the stage where what the control asks is applied, then judge whether that stage does it: Yes, all of it with a record; Partly, some of it or not every time; No, nothing at the stage does it. Stage and gate are checked together.",
    },
    checkRows: { 3: { label: 0, col: 3, with: 4 } },
    handIn: { step: 11, cols: [3, 4], ident: [0] },
  },
  "T10.2 CIT": citRegister("T10.2", { find: 4, status: 5, level: 6, pack: 7, first: 8, handIn: 11 }),
  "T10.2 PACK": packRegister("T10.2", 7, 7, "it is format-checked and kept with your hand-in"),
  "T8.2": {
    code: "BIA-RTO",
    title: "BIA-RTO · Business impact extract (template T-LI-BIA)",
    stamp: "Business impact extract",
    on: [1],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "Service", w: 170, what: "A service of the office, from the business impact analysis." },
      { h: "Runs on", w: 170, what: "The system the service runs on." },
      { h: "RTO", w: 60, what: "The longest the service may stay stopped." },
      { h: "RPO", w: 60, what: "The most data, counted in time, that may be lost." },
      { h: "DR test: outage declared", w: 120, what: "When the test declared the outage (Manila time)." },
      { h: "DR test: service back for users", w: 120, what: "When users could work on the service again." },
      { h: "DR test: data recovered up to", w: 120, what: "The last moment the restored data reaches." },
      { h: "Time to recover", w: 110, what: "From the outage declared to the service back." },
      { h: "Data lost", w: 100, what: "From the data recovered up to, to the outage declared." },
      { h: "Met / Not met", opts: ["Met", "Not met"], w: 110, what: "Met only if both are within the objectives." },
    ],
    rows: [
      [LT, "Learning session delivery", "Learning platform & content", "8 h", "1 h", "2026-05-16 08:00", "2026-05-16 14:00", "2026-05-16 07:40", "6 h", "20 min", "Met"],
      ...BIA_5.map((r) => [GC, ...r, "", "", ""]),
    ],
    mine: (r) => r[0] === GC,
    steps: { 1: [8, 9, 10] },
    ident: [1],
    view: { 1: [3, 4, 5, 6, 7] },
    cells: {
      8: { fix: (v) => duration(v), hint: () => DURATION_HINT },
      9: { fix: (v) => duration(v), hint: () => DURATION_HINT },
    },
    note: {
      1: () => "Each of your rows is one of the five Manila services of dataset BIA-5: its RTO and RPO from the office's business impact analysis, and the times the full DR failover test of 13 June 2026 logged. For each, work out the time to recover, from the outage declared to the service back for users, and the data lost, from the moment the restored data reaches to the outage declared. Then Met where the time to recover is at most the RTO and the data lost at most the RPO; Not met where either is over. The first row is a LearnTech Educational Solutions worked example. The three values are checked together.",
    },
    checkRows: { 1: { label: 1, col: 8, with: [9, 10] } },
    handIn: { step: 10, cols: [8, 9, 10], ident: [1] },
  },
  "T8.2 OBL": {
    code: "OBL-REG",
    title: "OBL-REG · Obligations register extract (template T-OBL), with the RoPA entry ROPA (template T-ROPA)",
    stamp: "Obligations register and RoPA entry",
    on: [3],
    cols: [
      { h: "Sheet", w: 80, what: "OBL-REG, the obligations; ROPA, the RoPA entry." },
      { h: "Row", w: 130, what: "The obligation's ID, or the RoPA field." },
      { h: "Read in", prose: true, w: 230, what: "Where the row is read." },
      { h: "Obligation, or the RoPA field's value", opts: (_d, r) => (r[0] === "ROPA" ? ROPA_FIELDS.find((f) => f[0] === r[1])?.[2] : OBL_CHOICES), wrap: true, w: 290, what: "One duty per row (R10); for ROPA, the field's value." },
      { h: "Type", opts: (_d, r) => (r[0] === "ROPA" ? undefined : OBL_TYPES), w: 120, what: "Statutory, Regulatory or Contractual." },
      { h: "Linked SITL policy (R10)", opts: (_d, r) => (r[0] === "ROPA" ? undefined : POL_INDEX.map((x) => x[0])), w: 140, what: "The SITL policy the obligation is met under." },
      { h: "Owner role (R10)", w: 190, what: "The linked policy's owner (SITL-POL-000 Section 3)." },
    ],
    rows: [
      ...OBL_READ.map(([id, read]) => ["OBL-REG", id, read, "", "", "", ""]),
      ...ROPA_FIELDS.map(([f, read]) => ["ROPA", f, read, "", "", "", ""]),
    ],
    mine: () => true,
    steps: { 3: [3, 4, 5] },
    ident: [0, 1, 2],
    derived: {
      4: { from: [0], value: (v) => (v(0) === "ROPA" ? "—" : null) },
      5: { from: [0], value: (v) => (v(0) === "ROPA" ? "—" : null) },
      6: { from: [0, 5], value: (v) => (v(0) === "ROPA" ? "—" : v(5) ? polOf(v(5))?.[1] ?? "" : ""), waits: () => "Fills from the policy" },
    },
    note: {
      3: () => "OBL-REG: the ten obligations of the Manila office, in the order SITL-ADD-16 gives them: Section 2 (the Manila row's breach notification), Section 2.1, then the Section 6 overlays whose Applies to includes Manila. One duty per row (R10): a duty joined to another by \"and\" or \";\" is split, and a duty listed twice is recorded once. Type, from the duty's Article / clause in Section 2.2: Statutory where an Act sets it (an Act's section, even beside a regulator's rule); Regulatory where only a regulator's rule sets it (an NPC circular or advisory, or the implementing rules, IRR); Contractual where a contract, or a standard a contract binds the office to, sets it (PCI DSS). Then the SITL policy the duty is met under (SITL-POL-000 Section 3, Ref-Policy portal); its owner fills in (R10). ROPA: the customer-support activity described on Regulatory Watch › RoPA & Data Flows, field by field: the role and the DPIA screening by rule R29, the lawful basis by SITL-POL-017 Section 3.1. Each row is checked whole.",
    },
    extra: { 3: [["SITL-ADD-16", ["2", "2.1", "2.2", "6"]], ["SITL-POL-000", ["3"]], ["SITL-POL-017", ["3.1", "3.2", "6.2"]]] },
    reads: { 3: ["regwatch|RoPA & Data Flows", "learn|Reference pages"] },
    checkRows: { 3: { label: 1, col: 3, with: [4, 5] } },
    handIn: { step: 10, cols: [3, 4, 5], ident: [1] },
  },
  "T8.2 CIT": citRegister("T8.2", { find: 4, status: 5, level: 6, pack: 7, first: 8, handIn: 10 }),
  "T8.2 PACK": packRegister("T8.2", 7, 7, "it is format-checked and kept with your hand-in"),
  "T7.1": {
    code: "ACC-RULES",
    title: "ACC-RULES · Access rules matrix (template T-LI-ACC)",
    stamp: "Three systems, by role",
    on: [1],
    cols: [
      { h: "Rule", w: 70, what: "The line's ID: one role on one system." },
      { h: "System", w: 180, what: "The system, and its asset owner (SPR-06)." },
      { h: "Role", w: 130, what: "The role, as the SPR-06 role list names it." },
      { h: "What the role does (SPR-06 role list)", prose: true, w: 260, what: "The role's work, and whom it reports to." },
      { h: "Access held today (SPR-06 account extract)", w: 180, what: "The access the role's accounts hold now." },
      { h: "Access level (least privilege)", opts: (_d, r) => accSys(r)[3], wrap: true, w: 210, what: "The least access the role's work needs." },
      { h: "Approved by (SITL-POL-006 Section 6.1)", opts: (_d, r) => accApprovers(r), wrap: true, w: 230, what: "Who approves a request for it." },
      { h: "More than the job needs?", opts: ACC_MORE, w: 150, what: "Is the access held today more than that level?" },
    ],
    rows: ACC.rows.map(([rule, sys, role, held]) => [rule, accSysLabel(sys), role, `${ACC.roles[role][0]} Reports to: ${ACC.roles[role][1]}.`, held, "", "", ""]),
    mine: () => true,
    steps: { 1: [5, 6, 7] },
    ident: [0, 1, 2],
    view: { 1: [3, 4] },
    note: {
      1: () => "Each line is one role on one of the three systems of dataset SPR-06, with what the role does (role list) and the access its accounts hold today (account extract). Choose three things. The access level: the least the role's work needs (SITL-POL-006 Section 3.1: least privilege and need-to-know). Who approves it: the role's line manager (Reports to), then the system's asset owner (Section 6.1, step 2). And whether the access held today is more than the job needs. The three are checked together.",
    },
    extra: { 1: [["SITL-POL-006", ["3.1", "6.1"]]] },
    checkRows: { 1: { label: 0, col: 5, with: [6, 7] } },
    handIn: { step: 9, cols: [5, 6, 7], ident: [0] },
  },
  "T7.1 CIT": citRegister("T7.1", { find: 2, status: 3, level: 4, pack: 5, first: 6, handIn: 9 }),
  "T7.1 PACK": packRegister("T7.1", 5, 5, "it is format-checked and kept with your hand-in"),
  "T9.1": {
    code: "PHY-PLAN",
    title: "PHY-WALK · Sheet Floor plan: the perimeter and the secure areas (template T-LI-PHY)",
    stamp: "Floor plan",
    on: [1],
    cols: [
      { h: "Point", w: 60, what: "The point's label on the floor plan." },
      { h: "Name", w: 140, what: "What the plan calls it." },
      { h: "What it is", prose: true, w: 320, what: "What the point holds and who goes there (dataset PHY)." },
      { h: "Marking", opts: PHY.markings, w: 190, what: "Public area, Perimeter entry point, Office area or Secure area." },
    ],
    rows: PHY.points.map((r) => [...r, ""]),
    mine: () => true,
    steps: { 1: [3] },
    ident: [0, 1],
    view: { 1: [2] },
    figure: { 1: "phy" },
    note: { 1: () => `The floor plan above is dataset PHY: the Manila head office, floor 12. Mark each of its points by who may be there. ${PHY.rule.replace(/^Mark each point of the floor plan by who may be there\. /, "")} Markings are checked.` },
    checkRows: { 1: { label: 0, col: 3 } },
    handIn: { step: 10, cols: [3], ident: [0] },
  },
  "T9.1 PHY": {
    code: "PHY-WALK",
    title: "PHY-WALK · Sheet Photos: walkthrough checklist and findings (template T-LI-PHY)",
    stamp: "Walkthrough photos",
    on: [2],
    cols: [
      { h: "Photo", w: 56, what: "The photo's number, as on the floor plan." },
      { h: "Where", w: 130, what: "The point of the floor plan it was taken at." },
      { h: "What it shows", prose: true, w: 320, what: "The photo's caption (dataset PHY)." },
      { h: "Control", opts: A7, w: 230, what: "The A.7 control the photo is evidence for." },
      { h: "Good practice or gap", opts: GAP_OR_GOOD, w: 130, what: "A requirement met, or one not met." },
      { h: "Action", prose: true, w: 240, what: "Where it is a gap: the action and its owner." },
    ],
    rows: PHY.photos.map((r) => [...r, "", "", ""]),
    mine: () => true,
    steps: { 2: [3, 4, 5] },
    ident: [0, 1],
    view: { 2: [2] },
    figure: { 2: "phy" },
    // A good practice needs no action: "—" by itself. An action is written only where the photo shows a gap.
    derived: { 5: { from: [4], value: (v) => (v(4) === "Gap" ? null : v(4) ? "—" : ""), waits: () => "Written where the photo shows a gap" } },
    cells: {
      5: {
        fix: (v) => (words(v) >= 6 ? v.trim() : null),
        hint: () => "Write the action and its owner, in six words or more, as in \"Fit a lock to the Amsterdam comms cabinet, owner the IT lead.\" It is read in the task's review.",
      },
    },
    note: {
      2: () => "For each photo, read what it shows (its number is on the floor plan above) and choose the A.7 control it is evidence for: each control's LI task page, LI-A.7.1 to LI-A.7.14 in Learn › Reference pages, lists what the control requires. Then judge it: Good practice where the photo shows a requirement met, Gap where it shows one not met. For a gap, write the action and its owner; it is read in the task's review. Control and good practice or gap are checked together.",
    },
    reads: { 2: ["learn|Reference pages"] },
    checkRows: { 2: { label: 0, col: 3, with: 4 } },
    handIn: { step: 10, cols: [3, 4, 5], ident: [0] },
  },
  "T9.1 CIT": citRegister("T9.1", { find: 5, status: 6, level: 7, pack: 8, first: 9, handIn: 10 }),
  "T9.1 PACK": packRegister("T9.1", 8, 8, "it is format-checked and kept with your hand-in"),
  // T9.2 · VUL-TEST, the SLA test workbook (template T-VUL), worked in Control Testing › Vulnerability Remediation Check: the
  // 40 findings of dataset VUL-40 (li-t92.json), each classified, dated and given its status at 30 November 2026 by rule R24
  // and SITL-POL-010. Then sprint 11 (steps 3–7). Platform-written, logged (T9.2); keys server-side (li101_written_T9.2.json).
  "T9.2": {
    code: "VUL-TEST",
    title: "VUL-TEST · SLA test workbook (template T-VUL)",
    stamp: "40 sampled findings · test date 30 November 2026",
    on: [1],
    cols: [
      { h: "Finding", w: 80, what: "The finding's ID in dataset VUL." },
      { h: "Asset", w: 150, what: "The Manila asset it was found on." },
      { h: "Exposure", w: 100, what: "Internet-facing or internal." },
      { h: "Vulnerability", prose: true, w: 200, what: "What the scanner found." },
      { h: "CVSS", w: 60, what: "The base score: 9.0 or more Critical, 7.0–8.9 High, 4.0–6.9 Medium." },
      { h: "KEV", w: 60, what: "In the CISA Known Exploited Vulnerabilities catalogue?" },
      { h: "First detected", w: 100, what: "The day a scan first found it: the SLA counts from here." },
      { h: "Closed", w: 100, what: "The day it was marked fixed; — while open." },
      { h: "Last scan", w: 100, what: "The latest scan of the asset." },
      { h: "Found in last scan", w: 90, what: "Did that scan still find it?" },
      { h: "Exception (register entry)", prose: true, w: 240, what: "The exception that covers it, or None." },
      { h: "Class (R24)", opts: VUL40.classes, w: 150, what: "Policy class 1 to 4, with its days." },
      { h: "Due date", date: true, w: 140, what: "First detected + the class's days." },
      { h: "Status at 30 November 2026", opts: VUL40.statuses, w: 250, what: "Within SLA, or a breach, and why." },
    ],
    rows: VUL40.r.map((r) => [...r, "", "", ""]),
    mine: () => true,
    steps: { 1: [11, 12, 13] },
    ident: [0],
    // Every fact the rule reads, beside the three columns the step fills.
    view: { 1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    note: {
      1: () => "Test date: 30 November 2026. For each of the 40 findings of dataset VUL-40 decide three things, by rule R24 (Ref-Test rules, in Learn › Reference pages) and SITL-POL-010 (Policies › Policy Library). Class: on an internet-facing asset, KEV-listed or Critical → class 1, 7 days; on an internal asset, Critical or KEV-listed → class 2, 14 days; otherwise High → class 3, 30 days; Medium → class 4, 90 days (Critical is CVSS 9.0 or more, High 7.0–8.9, Medium 4.0–6.9). Due date: first detected + the class's days. Status: within SLA when it was closed on or before its due date and a later scan no longer finds it; when it is open and its due date has not passed; or when it is past its due date under a valid exception (approved by the system owner and the CISO, a compensating control, not expired on 30 November). A closure that a later scan still finds is open again, with its original due date (SITL-POL-010 Section 6.1, step 4). Anything else is a breach. Class, due date and status are checked together.",
    },
    extra: { 1: [["SITL-POL-010", ["4", "6.1", "7.1", "10"]]] },
    reads: { 1: ["learn|Reference pages"] },
    checkRows: { 1: { label: 0, col: 11, with: [12, 13] } },
    handIn: { step: 10, cols: [11, 12, 13], ident: [0] },
  },
  "T9.2 CIT": citRegister("T9.2", { find: 3, status: 4, level: 5, pack: 6, first: 7, handIn: 10 }),
  "T9.2 PACK": packRegister("T9.2", 6, 6, "it is format-checked and kept with your hand-in"),
  // T7.2: VEN-TIER (step 1, Vendors › Set Risk Tier), VEN-CL (step 2, Vendors › Contract & DPA Check), sprint 7 (steps 3–7),
  // LI-CLD and its fixed questions (step 8 part 2, Policies › New from Template).
  "T7.2": {
    code: "VEN-TIER",
    title: "VEN-TIER · Tiering record (template T-VEN)",
    stamp: "Tiering record",
    on: [1],
    cols: [
      { h: "Supplier", w: 150, what: "The supplier, as its business owner named it on the intake form." },
      // The intake answers read as lines under the supplier's row, as the form reads; the row keeps the two choices.
      { h: "Service", prose: "always", what: "What the supplier does for the Manila office." },
      { h: "Data the supplier receives", prose: "always", what: "From the intake form: what the supplier gets of Manila's information." },
      { h: "Volume", prose: "always", what: "How many people's data, and how often." },
      { h: "Users", prose: "always", what: "Who uses the service, or sees what it produces." },
      { h: "Business criticality", prose: "always", what: "What the business owner says the service is for." },
      { h: "Substitutability", prose: "always", what: "How hard the supplier would be to replace." },
      { h: "Tier (R35)", opts: VEN_TIERS, w: 110, what: "Critical, High, Medium or Low, by rule R35." },
      { h: "Deciding term (R35)", opts: VEN_TERMS, wrap: true, w: 230, what: "The R35 term that set the tier: the first that matches, from Critical down." },
    ],
    rows: VEN_ROWS.map((r) => [...r.slice(0, 7), "", ""]),
    mine: () => true,
    steps: { 1: [7, 8] },
    ident: [0],
    view: { 1: [1, 2, 3, 4, 5, 6] },
    note: {
      1: (desk) => `${ruleNote("R35")(desk)} Read each term as the table under SITL-POL-013 Section 3.1 (Policies › Policy Library) defines it, and where on the intake form to read it: data received, volume, users, business criticality, substitutability. Check from Critical down and stop at the first term that matches; record the tier and that term. Tier and term are checked together.`,
    },
    extra: { 1: [["SITL-POL-013", ["3.1"]]] },
    checkRows: { 1: { label: 0, col: 7, with: 8 } },
  },
  "T7.2 CL": {
    code: "VEN-CL",
    title: "VEN-CL · Contract clause checklist",
    stamp: "Clause checklist",
    on: [2],
    cols: [
      { h: "Supplier: clause", w: 190, what: "One clause of the checklist, for one supplier." },
      { h: "Tier (step 1)", w: 90, what: "The supplier's tier, as step 1 stands." },
      { h: "Hosted in", w: 100, what: "Where the supplier holds the data." },
      { h: "Required from tier", w: 130, what: "The lowest tier the clause is required for (rule R27)." },
      // The two texts compared read as lines under the row, one beneath the other.
      { h: "The contract must say", prose: "always", what: "What the clause must say to be Covered." },
      { h: "What the contract says (SPR-07)", prose: "always", what: "The supplier's contract, on this clause." },
      { h: "In the contract", opts: CL_OPTS, w: 170, what: "Covered, Falls short, Missing, or Not required for this supplier." },
    ],
    rows: VEN_SHORT.flatMap((_, si) => CL_CLAUSES.map(([c, from, must], ci) => [CL_LABEL(si, c), "", CL_HOSTED[si], from, must, CL_SAYS[si][ci], ""])),
    mine: () => true,
    steps: { 2: [6] },
    ident: [0, 1],
    view: { 2: [2, 3, 4, 5] },
    derived: { 1: { from: [0], value: (v, p) => venTier(p, v(0).split(":")[0]) || null, waits: () => "From step 1" } },
    note: {
      2: () => `Rule R27, for the clause checklist: include every clause marked for the tier; add the transfer mechanism if data leaves the country. The checklist holds the seven clauses, each with the lowest tier it is required for, and the transfer mechanism, required where the data leaves the Philippines. A clause marked Medium is required for Medium, High and Critical suppliers. For each line: if the clause is not required for the supplier's tier or hosting, choose Not required for this supplier. Otherwise read SITL-POL-013 Section 6.3 (Policies › Policy Library): Covered if the contract says everything the clause must say, Falls short if it has the clause but says less, Missing if it has no such clause. For the transfer mechanism, SITL-ADD-16 Section 2 names Manila's in its Cross-border transfer column.`,
    },
    extra: { 2: [["SITL-POL-013", ["6.1", "6.3"]], ["SITL-ADD-16", ["2"]]] },
    checkRows: { 2: { label: 0, col: 6 } },
    handIn: { step: 10, cols: [6], ident: [0] },
  },
  "T7.2 CIT": citRegister("T7.2", { find: 3, status: 4, level: 5, pack: 6, first: 7, handIn: 10 }),
  "T7.2 PACK": packRegister("T7.2", 6, 6, "it is format-checked and kept with your hand-in"),
  "T7.2 CLD": {
    code: "LI-CLD",
    title: "LI-CLD · Cloud & supply-chain addendum (template T-LI-CLD), sheet Matrix: Deskline Cloud",
    stamp: "Shared-responsibility matrix",
    on: [8],
    cols: [
      { h: "Part of the service", w: 190, what: "A part of the SaaS ticketing tool someone must secure." },
      { h: "What it covers", prose: true, w: 280, what: "What that part is, at Deskline and at Manila." },
      { h: "Who secures it", opts: (_d, r) => (r[0] === "Service model" ? CLD_MODELS : CLD_WHO), w: 190, what: "The service model; then the provider or the Manila office, by Ref-Cloud." },
    ],
    // The service model row quotes the intake form's delivery line (rule L19: copy the model from the intake form).
    rows: CLD_ROWS.map(([part, what]) => [part, part === "Service model" ? `${what}: "${VEN_ROWS[0][7]}"` : what, ""]),
    mine: () => true,
    steps: { 8: [2] },
    ident: [0],
    view: { 8: [1] },
    then: { 8: "The shared-responsibility matrix of LI-CLD" },
    note: {
      8: (desk) => `${ruleNote("L19")(desk)} First the service model: read the intake form's delivery line on the Service model row: who runs the application, the platform and the servers. Then open Ref-Cloud (Learn › Reference pages) and, for each part of the service, choose who secures it under that model: Deskline, the provider, or the Manila office, the customer. The five fixed questions are on sheet Questions, with Deskline's answers. Each row is checked.`,
    },
    reads: { 8: ["learn|Reference pages"] },
    checkRows: { 8: { label: 0, col: 2 } },
    handIn: { step: 10, cols: [2], ident: [0] },
  },
  "T7.2 CLDQ": {
    code: "LI-CLD-Q",
    title: "LI-CLD · Sheet Questions: the five fixed cloud and supply-chain questions (rule L19), with Deskline's answers of 12 November 2026",
    stamp: "Fixed questions",
    on: [],
    cols: [
      { h: "Fixed question (Ref-Cloud)", prose: true, w: 280, what: "One of the five questions rule L19 adds for every cloud service." },
      { h: "Deskline's answer (SPR-07)", prose: true, w: 340, what: "What Deskline answered, in writing." },
    ],
    rows: CLD_QUESTIONS.map(([q, a]) => [q, a]),
    mine: () => true,
    steps: {},
    ident: [0],
    handIn: { step: 10, cols: [1], ident: [0] },
  },
  "T4.2": {
    code: "LI-CHAIN",
    title: "LI-CHAIN · Asset–threat–control chains (template T-LI-CHAIN)",
    stamp: "Asset–threat–control chains",
    on: [1, 3],
    cols: [
      { h: "Organisation", w: 120, what: "Whose row it is: yours, or the worked example's." },
      { h: "Asset", w: 150, what: "The asset the chain starts from, named as in the asset register." },
      { h: "Asset type (asset register)", prose: true, w: 190, what: "Information or supporting asset, and its asset register entry." },
      { h: "Threat (and its source)", prose: true, w: 230, what: "What could happen, how often, and where that was read." },
      { h: "Vulnerability", prose: true, w: 210, what: "The weakness the threat would use, true today." },
      { h: "Consequence", prose: true, w: 210, what: "What the business would lose, in the impact scale's words." },
      { h: "Existing controls", prose: true, w: 230, what: "The controls in place today, each working or not working." },
      { h: "Annex A control", w: 170, what: "The Annex A control the chain ends at." },
      { h: "Risk statement (R06)", prose: true, w: 280, what: "The draft chosen on sheet Drafts in step 2. Filled by itself." },
      { h: "Likelihood (R07)", opts: LIKE, w: 140, what: "The SITL-ERM-001 Section 6.2 score whose words the threat uses." },
      { h: "Impact (R07)", opts: IMPACT, w: 120, what: "The SITL-ERM-001 Section 6.3 score whose words the consequence uses." },
      { h: "Inherent score", w: 130, what: "Likelihood × impact and its rating (Section 6.4). Filled by itself." },
    ],
    rows: CHAIN_ROWS,
    mine: (r) => r[0] === GC,
    studyAll: [1],
    steps: { 3: [9, 10] },
    ident: [1],
    view: { 3: [3, 5] },
    derived: {
      8: { from: [1], value: (v, p) => (v(0) === GC ? draftOf(v(1), draftAt(p, ASSET_ROW(v(1)))) : null), waits: () => "From sheet Drafts (step 2)" },
      11: { from: [9, 10], value: (v) => scoreOf(lead(v(9)), lead(v(10))), waits: () => "From likelihood and impact (step 3)" },
    },
    note: {
      3: () => "Rate each chain on the scales of SITL-ERM-001 (Policies › Policy Library), as rule R07 says: the likelihood whose frequency words the threat column uses (Section 6.2), and the impact whose words the consequence column uses (Section 6.3). Rate before any control: the inherent risk. Your method card, LI-RAM (T4.1), records the same scales. Likelihood and impact are checked together.",
    },
    extra: { 3: [["SITL-ERM-001", ["6.2", "6.3", "6.4"]]] },
    checkRows: { 3: { label: 1, col: 9, with: 10 } },
    handIn: { step: 11, cols: [8, 9, 10], ident: [1] },
  },
  // Step 2's three drafts per chain, a sheet of their own: shown in LI-CHAIN they made the worked row too tall to see the
  // learner's rows under it (25 Nov probe). The chosen draft fills LI-CHAIN's Risk statement.
  "T4.2 DRAFTS": {
    code: "DRAFTS",
    title: "Sheet Drafts · three draft risk statements per chain (LI-CHAIN, template T-LI-CHAIN)",
    stamp: "Sheet Drafts",
    on: [2],
    cols: [
      { h: "Asset", w: 150, what: "The chain's asset, named as in the asset register." },
      { h: "Vulnerability", prose: true, w: 220, what: "The chain's weakness, true today (from LI-CHAIN)." },
      { h: "Three draft statements", prose: "always", w: 520, what: "Three drafts of the chain's risk statement." },
      { h: "Risk statement (R06)", opts: DRAFT_OPTS, w: 110, what: "The draft that follows rule R06 and SITL-POL-002 Section 7.1." },
    ],
    rows: CHAIN_ROWS.slice(1).map((r) => [r[1], r[4], draftsText(r[1]), ""]),
    mine: () => true,
    steps: { 2: [3] },
    ident: [0],
    view: { 2: [1, 2] },
    note: {
      2: () => "Each chain has three draft risk statements. Choose the one that follows rule R06 and SITL-POL-002 Section 7.1 (Policies › Policy Library): a cause that is true today (the chain's vulnerability), one event, a consequence in business terms the risk owner can weigh, and the asset named as in column Asset. One event per statement: two events are two risks. The draft you choose fills LI-CHAIN's Risk statement.",
    },
    extra: { 2: [["SITL-POL-002", ["7.1"]]] },
    checkRows: { 2: { label: 0, col: 3 } },
  },
  "T4.2 RR": {
    code: "RR-UPD",
    title: "RR-UPD · Updated office risk register, Manila (RA-16, sheet Manila, Philippines)",
    stamp: "Three new risks",
    on: [5],
    cols: [
      { h: "Risk ID", w: 100, what: "The next IDs after the register's R-16-HQ-15." },
      { h: "Asset", w: 150, what: "The chain's asset, from LI-CHAIN." },
      { h: "Risk statement (R06)", prose: true, w: 280, what: "The draft you chose in step 2. Filled by itself." },
      { h: "Inherent", w: 130, what: "Your step 3 rating. Filled by itself." },
      { h: "Existing controls (LI-CHAIN)", prose: true, w: 230, what: "The chain's controls, each working or not working." },
      { h: "Existing controls that work", opts: (_d, r) => WORKING[RR_IDS.indexOf(r[0])], wrap: true, w: 200, what: "The controls marked working: each takes 1 off the likelihood (R07)." },
      { h: "Residual", w: 130, what: "Likelihood less the working controls × impact. Filled by itself." },
      { h: "Risk owner", opts: RR_OWNERS, w: 190, what: "The manager accountable for the asset (SITL-POL-002 Section 3.1)." },
      { h: "Acceptance authority (R36)", opts: ACC_APPROVERS, wrap: true, w: 170, what: "Who may accept the risk at its residual rating (rule R36)." },
    ],
    rows: RR_IDS.map((id, i) => [id, CHAIN_ROWS[i + 1][1], "", "", CHAIN_ROWS[i + 1][6], "", "", "", ""]),
    mine: () => true,
    steps: { 5: [5, 7, 8] },
    ident: [0],
    view: { 5: [1, 3, 4] },
    then: { 5: "RR-UPD: the three new risks with owner, acceptance authority and existing controls" },
    derived: {
      2: { from: [0], value: (v, p) => { const i = RR_IDS.indexOf(v(0)); return draftOf(CHAIN_ROWS[i + 1][1], draftAt(p, i)); }, waits: () => "From LI-CHAIN (step 2)" },
      3: { from: [0], value: (v, p) => { const i = RR_IDS.indexOf(v(0)); return scoreOf(lead(chainAt(p, i, 9)), lead(chainAt(p, i, 10))); }, waits: () => "From LI-CHAIN (step 3)" },
      6: {
        from: [5],
        value: (v, p) => {
          const i = RR_IDS.indexOf(v(0)), n = workingCount(v(5)), l = lead(chainAt(p, i, 9)), im = lead(chainAt(p, i, 10));
          return n < 0 || !l || !im ? "" : scoreOf(Math.max(1, l - n), im);
        },
        waits: () => "From the working controls",
      },
    },
    note: {
      5: () => "RR-UPD is the Manila sheet of RA-16 (its 15 risks, R-16-HQ-01 to R-16-HQ-15, are on Risk Register › Score Risk) with your three chains added as R-16-HQ-16 to R-16-HQ-18. For each, choose the existing controls that work: under rule R07 each one marked working takes 1 off the inherent likelihood, never below 1, and the impact stays. The residual fills itself. Choose the risk owner: the manager accountable for the asset the risk affects (SITL-POL-002 Section 3.1), read in Risk Register › Asset Register under the chain's asset register entry. Choose the acceptance authority that rule R36 sets for the residual rating (Learn › Rule tables). The three are checked together. Each new risk gets one change-log row on sheet Change log (rule R22), written from the row; it is handed in with the register in step 11.",
    },
    extra: { 5: [["SITL-POL-002", ["3.1"]], ["Charter", ["6.1"]]] },
    reads: { 5: ["risk|Asset Register"] },
    checkRows: { 5: { label: 0, col: 5, with: [7, 8] } },
    handIn: { step: 11, cols: [5, 7, 8], ident: [0] },
  },
  "T4.2 CHG": {
    code: "RR-CHG",
    title: "Sheet Change log · RR-UPD (rule R22)",
    stamp: "Change log",
    on: [],
    cols: [
      { h: "Row ID", w: 100, what: "The register row that changed." },
      { h: "Field", w: 130, what: "What changed: here, the whole row, added." },
      { h: "Old value", w: 80, what: "Before the change; — for a new row." },
      { h: "New value", prose: true, w: 280, what: "The row as added: residual, owner and acceptance authority." },
      { h: "Event ID", w: 200, what: "What brought the change: the source of the chain's threat." },
      { h: "Evidence", w: 200, what: "Where the change is shown." },
    ],
    rows: RR_IDS.map((id, i) => [id, "New risk added", "—", "", RR_EVENTS[i], `LI-CHAIN (T4.2): ${CHAIN_ROWS[i + 1][1]}`]),
    mine: () => true,
    steps: {},
    ident: [0],
    // Written from RR-UPD's row (R22): typing it again would be a copy.
    derived: {
      3: {
        from: [0],
        value: (v, p) => {
          const reg = REGISTERS["T4.2 RR"], ri = RR_IDS.indexOf(v(0));
          const [res, owner, auth] = [6, 7, 8].map((ci) => standing(reg, p, "T4.2", ri, ci));
          return res && owner && auth ? `Residual ${res}; owner ${owner}; acceptance ${auth}` : "";
        },
        waits: () => "From RR-UPD (step 5)",
      },
    },
    handIn: { step: 11, cols: [3], ident: [0] },
  },
  "T4.2 CIT": citRegister("T4.2", { find: 6, status: 7, level: 8, pack: 9, first: 10, handIn: 11 }),
  "T4.2 PACK": packRegister("T4.2", 9, 9, "it is format-checked and kept with your hand-in"),
  "T6.2": {
    code: "LI-DOC",
    title: "LI-DOC · Mandatory-documents register (template T-LI-DOC, sheet Register)",
    stamp: "Sheet Register",
    on: [1],
    cols: [
      { h: "Item", w: 170, what: "The documented information ISO/IEC 27001:2022 asks the ISMS to have." },
      { h: "ISO/IEC 27001:2022", w: 90, what: "The clause that asks for it." },
      { h: "What the clause asks for (our summary)", prose: true, w: 280, what: "The clause's words on it, summarised: read how it asks for it." },
      { h: "Held at Manila", prose: true, w: 200, what: "Where the office keeps it today, or that it has none yet." },
      { h: "Kind (Clause 7.5.1)", opts: "step", w: 170, what: "A maintained document, or a retained record." },
    ],
    rows: DOC_ITEMS.map((r) => [...r, ""]),
    mine: () => true,
    steps: { 1: [4] },
    ident: [0],
    view: { 1: [1, 2] },
    note: {
      1: () => "Clause 7.5.1 asks for two kinds of documented information (Learn › Framework Quick Reference, ISO/IEC 27001 Clause 7.5). Maintained, a document: it says what is to be done or how things stand, and is kept current, each change a new version. Retained, a record: evidence of what was done or achieved, kept as it is for its retention period (SITL-POL-018). Read what the clause asks for, in the third column. Where it asks for documented information to be retained, or to be available as evidence of results, it is a record. Where it asks for the thing itself to be available as documented information, or to be produced, it is a document.",
    },
    reads: { 1: ["learn|Framework Quick Reference"] },
    checkRows: { 1: { label: 0, col: 4 } },
    handIn: { step: 9, cols: [4], ident: [0] },
  },
  "T6.2 BLOCK": {
    code: "DOC-BLOCK",
    title: "Sheet Block · Document-control block of the wiki backup procedure (LI-DOC, template T-LI-DOC)",
    stamp: "Sheet Block",
    on: [2],
    cols: [
      { h: "Field (SITL-POL-000 Section 7.1)", w: 140, what: "A field of the document-control block, as Section 7.1 names it." },
      { h: "Value", opts: (_d, r) => BLOCK_ROWS.find((x) => x[0] === r[0])?.[1], w: 190, what: "The field's value for the backup and restore page." },
    ],
    rows: BLOCK_ROWS.map(([f]) => [f, ""]),
    mine: () => true,
    steps: { 2: [1] },
    ident: [0],
    then: { 2: "Sheet Block, the document-control block of the backup and restore page" },
    note: {
      2: () => "The Manila IT wiki's backup and restore page is now approved (Ref-Wiki backup page, in Learn › Reference pages: the page and the e-mail that approved it). Give it the document-control block a procedure carries above its first step: SITL-POL-000 Section 7.1 (Policies › Policy Library) gives the rule for each field. The owner is read in Section 3, the approver in Section 2, and the classification in SITL-STD-001 Section 3 and SITL-ADD-16 Section 7. Each field is checked.",
    },
    extra: { 2: [["SITL-POL-000", ["2", "3", "7.1"]], ["SITL-STD-001", ["3"]], ["SITL-ADD-16", ["7"]]] },
    reads: { 2: ["learn|Framework Quick Reference", "learn|Reference pages"] },
    checkRows: { 2: { label: 0, col: 1 } },
    handIn: { step: 9, cols: [1], ident: [0] },
  },
  "T6.2 CIT": citRegister("T6.2", { find: 3, status: 4, level: 5, pack: 6, first: 7, handIn: 9 }),
  "T6.2 PACK": packRegister("T6.2", 6, 6, "it is format-checked and kept with your hand-in"),
  "T6.1": {
    code: "LI-COMM",
    title: "LI-COMM · Competence matrix (template T-LI-COMM, sheet Competence)",
    stamp: "Sheet Competence",
    on: [1, 2],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "Role holder", w: 120, what: "The person, from dataset COMP-10." },
      { h: "ISMS role", w: 170, what: "The role the person holds in your LI-RACI." },
      { h: "Competence the role needs", prose: true, w: 260, what: "What the role runs in your LI-RACI, and what that takes." },
      { h: "Qualifications and experience (CV)", prose: true, w: 230, what: "What the person holds or has done, from COMP-10." },
      { h: "Records on file (HR)", prose: true, w: 220, what: "The training and certificate records HR holds, from COMP-10." },
      { h: "Status (Clause 7.2)", opts: "step", w: 190, what: "Competent with evidence, a gap, or competent with no evidence." },
      { h: "Action", opts: (_d, r) => T61D.actions[r[1]], wrap: true, w: 260, what: "For a gap or a missing record: what is done about it." },
    ],
    rows: COMP_ROWS,
    mine: (r) => r[0] === GC,
    studyAll: [1],
    steps: { 2: [6, 7] },
    ident: [1],
    view: { 2: [3, 4, 5] },
    // Someone competent with the record on file needs no action: written by itself.
    derived: { 7: { from: [6], value: (v) => (v(6) === T61D.statuses[0] ? T61D.noAction : null) } },
    note: {
      1: () => "Sheet Competence lists the ten role holders of dataset COMP-10 at GlobalConnect Manila. Each comes with the competence their role needs, taken from what the role runs or answers for in your LI-RACI (T3.2), with the person's qualifications and the records Manila HR holds. The first two rows are LearnTech Educational Solutions worked examples, filled in to the action.",
      2: () => "Hold each person's qualifications and records against the competence their role needs. Clause 7.2: a) the competence each role needs is determined; b) the person is competent through education, training or experience; c) where not, action is taken to get it, and its effect is evaluated; d) documented information is kept as evidence of competence. Competent — evidence held: the person has what the role needs, and HR holds the record that proves it. Competent, but no documented evidence: the CV shows what the role needs, but HR holds no record of it. Gap — action needed: the person does not have what the role needs; an induction session is not the competence of a role. For every gap or missing record, choose the action that gets what is missing and, for a gap, checks that it worked. Status and action are checked together.",
    },
    extra: { 2: [["SITL-POL-020", ["3.1"]]] },
    checkRows: { 2: { label: 1, col: 6, with: 7 } },
    handIn: { step: 10, cols: [6, 7], ident: [1] },
  },
  "T6.1 COMM": {
    code: "COMM",
    title: "Sheet Communication · ISMS communication plan (LI-COMM, template T-LI-COMM)",
    stamp: "Sheet Communication",
    job: "Fill sheet Communication of LI-COMM.",
    on: [5],
    cols: [
      { h: "A On what (the message)", prose: true, w: 280, what: "A message the Manila ISMS sends: given." },
      { h: "B When", opts: planCol(1), wrap: true, w: 200, what: "When it is sent, from the plan's row for its kind." },
      { h: "C With whom", opts: T61D.whom, wrap: true, w: 200, what: "Who receives it, from the plan's row for its kind." },
      { h: "D How", opts: planCol(3), wrap: true, w: 230, what: "How it is sent, from the plan's row for its kind." },
    ],
    rows: T61D.messages.map((m) => [m, "", "", ""]),
    mine: () => true,
    steps: { 5: [1, 2, 3] },
    ident: [0],
    note: {
      5: () => "Each row is a message the Manila ISMS sends: Clause 7.4 a), on what to communicate. For each, record b) when, c) with whom and d) how it is communicated. Manila follows the Group ISMS communication plan (Ref-Communications, in Learn › Reference pages): find the plan's row for the message's kind and read its When, With whom and How. Where the row names a condition, apply it to the message. When, with whom and how are checked together.",
    },
    reads: { 5: ["learn|Reference pages"] },
    checkRows: { 5: { label: 0, col: 1, with: [2, 3] } },
    handIn: { step: 10, cols: [1, 2, 3], ident: [0] },
  },
  "T6.1 CIT": citRegister("T6.1", { find: 6, status: 7, level: 8, pack: 9, handIn: 10 }),
  "T6.1 PACK": packRegister("T6.1", 9, 9, "it is format-checked and kept with your hand-in"),
  "T5.2": {
    code: "LI-SOA",
    title: "LI-SOA · Statement of Applicability (template T-LI-SOA)",
    stamp: "93 Annex A controls",
    on: [1, 2],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "Control", w: 70, what: "The Annex A control of ISO/IEC 27001:2022." },
      { h: "Title", w: 170, what: "The control's title in the standard." },
      { h: "Facts at Manila (SOA-93)", prose: true, w: 300, what: "What dataset SOA-93 records about the office." },
      { h: "Applicable", opts: "step", w: 130, what: "Applicable or Not applicable, by rule L06." },
      { h: "Source: risk / legal / contractual / business", opts: SOA.sources, wrap: true, w: 170, what: "What calls for the control, read in its facts." },
      { h: "Justification for inclusion", prose: true, w: 220, what: "Why the control is in: written from its source." },
      { h: "Justification for exclusion", prose: true, w: 220, what: "Why the control is out: on an excluded row only." },
      { h: "Implemented? (L07)", w: 170, what: "From your tracker, or when its sprint is planned." },
      { h: "Evidence ref", wrap: true, w: 200, what: "From your tracker's column F." },
    ],
    rows: SOA_ROWS,
    mine: (r) => r[0] === GC,
    studyAll: [1],
    // 2: applicability and source of 92 controls; A.8.30's applicability is step 3's question, written from its answer.
    steps: { 2: [4, 5] },
    only: { 2: (r) => !at830(r[1]) },
    ident: [1, 2],
    view: { 2: [3] },
    derived: {
      4: { from: [1], quiet: true, value: (v, p) => (at830(v(1)) ? D2_SOA[p.decisions?.["T5.2-D2"]?.best ?? ""] ?? "" : null), waits: () => "Decided in step 3" },
      // Rule L06: an excluded control has no source; only an applicable one asks for it.
      5: { from: [4], value: (v) => (v(4) === "Not applicable" ? SOA_NA : null) },
      6: { from: [4, 5], quiet: true, value: (v) => (v(4) === "Applicable" ? (v(5) ? `Called for by ${SOA_WHY[v(5)] ?? v(5)} (rule L06), as its facts in SOA-93 record.` : "") : v(4) ? "—" : ""), waits: () => "Written from Applicable and Source" },
      7: { from: [1, 4], quiet: true, value: (v) => (v(4) === "Not applicable" ? (at830(v(1)) ? "No development is outsourced: Manila builds its customer portal in-house with its own developers (SOA-93). Review it if a supplier is ever engaged to write code." : "The office does nothing the control governs (SOA-93). Review it if that changes.") : v(4) ? "—" : ""), waits: () => "Written from Applicable" },
      8: { from: [1, 4], quiet: true, value: (v, p) => (v(4) === "Not applicable" ? "Not applicable" : soaCarry(v(1), 6, p)), waits: (v) => (v(1) === "A.5.8" ? "From your tracker (step 7)" : "From your tracker") },
      9: { from: [1, 4], quiet: true, value: (v, p) => (v(4) === "Not applicable" ? "—" : soaCarry(v(1), 8, p)), waits: (v) => (v(1) === "A.5.8" ? "From your evidence pack (step 9)" : "From your tracker") },
    },
    note: {
      1: () => "Your Statement of Applicability: one row for each of the 93 Annex A controls, with its facts at the Manila office (dataset SOA-93). The first row is LearnTech Educational Solutions' worked example. Implemented? and Evidence ref are carried over from your tracker T-LI-CIT for the controls already sprinted, and say when the others are planned (rule L07).",
      2: (desk) => `${ruleNote("L06")(desk)} Read each control's facts and ask what calls for it. Applicable and Source are checked together. A.8.30 is step 3's question.`,
    },
    checkRows: { 2: { label: 1, col: 4, with: 5 } },
    handIn: { step: 12, cols: [4, 5, 6, 7, 8, 9], ident: [1] },
  },
  "T5.2 CIT": citRegister("T5.2", { find: 6, status: 7, level: 8, pack: 9, handIn: 12 }),
  "T5.2 PACK": packRegister("T5.2", 9, 9, "it is format-checked and kept with your hand-in"),
  "T5.2 OBJ": {
    code: "LI-OBJ",
    title: "LI-OBJ · ISMS objectives and plan (template T-LI-PLAN, sheet Objectives)",
    stamp: "Sheet Objectives",
    on: [11],
    cols: [
      { h: "What it addresses", prose: true, w: 230, what: "The gap or risk the objective answers." },
      { h: "Objective (L14)", opts: (_d, r) => OBJ_ROWS.find((x) => x[0] === r[0])?.[1], wrap: true, w: 260, what: "Measurable: what is counted, a target and a date." },
      { h: "What will be done", prose: true, w: 220, what: "The actions that achieve the objective." },
      { h: "Resources", prose: true, w: 160, what: "The people, budget and tools it needs." },
      { h: "Who is responsible", opts: (desk) => OBJ_ROLES(desk), wrap: true, w: 180, what: "The role that owns the process or the control." },
      { h: "When", w: 120, what: "The objective's own date." },
      { h: "How results are evaluated", prose: true, w: 220, what: "The measure, who measures it and how often." },
      { h: "Milestones (L15)", prose: true, w: 240, what: "Two or more, each with what is delivered and a date." },
    ],
    rows: OBJ_ROWS.map(([a]) => [a, "", "", "", "", "", "", ""]),
    mine: () => true,
    steps: { 11: [1, 2, 3, 4, 6, 7] },
    ident: [0],
    derived: { 5: { from: [1], value: (v) => (v(1) ? v(1).match(/by (\d{1,2} \w+ 20\d\d)$/)?.[1] ?? "No date in the objective" : ""), waits: () => "From the objective's date" } },
    cells: {
      2: { fix: (v) => (words(v) >= 6 ? v.trim() : null), hint: () => "Write the actions in six words or more, as in \"Run a monthly restore test at Amsterdam and record each result.\" It is format-checked and kept with your hand-in." },
      3: { fix: (v) => (words(v) >= 3 ? v.trim() : null), hint: () => "Name the people, budget or tools it needs, in three words or more, as in \"IT lead, two hours a month, the backup console.\"" },
      6: { fix: (v) => (words(v) >= 6 ? v.trim() : null), hint: () => "Say what is measured, by whom and how often, in six words or more, as in \"Share of monthly restore tests passed, counted by the IT lead each quarter.\"" },
      7: { fix: (v) => ((v.match(MONTH_DATE) ?? []).length >= 2 ? v.trim() : null), hint: () => "List two or more milestones, each with what is delivered and its date (as 31 January 2027 or 2027-01-31), separated by semicolons, as in \"Restore procedure approved, 31 January 2027; first quarterly result reported, 30 April 2027.\"" },
    },
    note: {
      11: () => "Each row is a gap or a risk your work so far found at Manila (GAP-25, LI-RTP, SOA-93): objectives are proposed from the risk assessment and last year's results (SITL-POL-001 Section 6.2). For each, choose the objective that is measurable (rule L14: what is counted, a target and a date) and the role responsible: the role marked R for its process in the GRC Charter Section 16, or, where no Charter row covers it, the owner role on the control's LI task page (Learn › Reference pages). The date it will be completed comes from the objective. Then write what will be done, the resources it needs and how its results will be evaluated, and its milestones (rule L15). The objective and the role are checked together; the rest is format-checked and kept with your hand-in.",
    },
    extra: { 11: [["SITL-POL-001", ["3.1", "6.2"]], ["Charter", ["16"]]] },
    reads: { 11: ["learn|Framework Quick Reference", "learn|Reference pages"] },
    checkRows: { 11: { label: 0, col: 1, with: 4 } },
    handIn: { step: 12, cols: [1, 2, 3, 4, 6, 7], ident: [0] },
  },
  "T4.1": {
    code: "LI-RAM",
    title: "LI-RAM · Risk assessment method card (template T-LI-RAM)",
    stamp: "Method card",
    on: [1],
    cols: [
      { h: "Part", w: 190, what: "What this line of the card records." },
      { h: "Statement", prose: true, w: 360, opts: (_d, r) => RAM_STATEMENTS[r[0]], what: "What the Group's documents set for it, for GlobalConnect." },
      { h: "Source", w: 200, opts: (_d, r) => RAM_SOURCES[r[0]], what: "The document and section the statement is read in." },
    ],
    rows: RAM_PARTS.map((x) => [x, "", ""]),
    mine: () => true,
    steps: { 1: [1, 2] },
    ident: [0],
    note: {
      1: () => "The method card records the risk criteria the Manila assessment will use (Clause 6.1.2 a). For each line, choose the statement the Group's documents set for GlobalConnect, and the section you read it in. SITL-POL-002 (Policies › Policy Library) gives the acceptance criteria, who owns a risk and where the records are kept (Section 3.1), and the requirements of each criticality band (Section 4). SITL-ERM-001 gives the appetite of each band (Section 4) and the scales and matrix (Sections 6.2–6.4). The GRC Charter Section 6.1 gives who may accept a risk (rule R36). GlobalConnect is a LOW-criticality organisation (SITL-ADD-16, its cover table). Statement and source are checked together.",
    },
    extra: { 1: [["SITL-POL-002", ["3.1", "4"]], ["SITL-ERM-001", ["4", "6.2", "6.3", "6.4"]], ["Charter", ["6.1"]]] },
    checkRows: { 1: { label: 0, col: 1, with: 2 } },
    handIn: { step: 11, cols: [1, 2], ident: [0] },
  },
  "T4.1 CIT": citRegister("T4.1", { find: 4, status: 5, level: 6, pack: 7, first: 8, handIn: 11 }),
  "T4.1 PACK": packRegister("T4.1", 7, 7, "it is format-checked and kept with your hand-in", ["risk|Asset Register"]),
  "T5.1": {
    code: "LI-RTP",
    title: "LI-RTP · Risk treatment plan (template T-LI-RTP)",
    stamp: "Risk treatment plan",
    on: [1, 2, 6],
    cols: [
      { h: "Organisation", w: 120, what: "Whose row it is: yours, or the worked example's." },
      { h: "Risk ID", w: 100, what: "The risk's ID in the office risk register (RR-UPD)." },
      { h: "Risk", prose: true, w: 280, what: "The risk statement from RR-UPD (rule R06)." },
      { h: "What LI-CHAIN and RR-UPD record", prose: true, w: 280, what: "The asset, the facts, the existing controls and the inherent score." },
      { h: "Option (L12)", opts: "step", w: 140, what: "Modify, Retain, Avoid or Share, by rule L12." },
      { h: "Controls", prose: true, w: 240, what: "The controls the risk needs: from sheet Controls (step 3)." },
      { h: "Annex A IDs", w: 120, what: "The Annex A controls those controls match, by ID." },
      { h: "Owner", w: 150, what: "The risk owner, from RR-UPD." },
      { h: "Due date (R08)", opts: RTP_DUE, w: 130, what: "When the treatment is done; none for a retained risk." },
      { h: "Residual", w: 100, what: "The residual score and rating, from RR-UPD." },
      { h: "Approved by", w: 190, what: "Who approves the plan and accepts the residual risk." },
      { h: "RSK-ACC reason", opts: ACC_REASONS, wrap: true, w: 230, what: "Why the risk is retained rather than treated." },
      { h: "RSK-ACC expiry", opts: ACC_EXPIRY, w: 120, what: "When the acceptance lapses (SITL-POL-002 Section 6.2)." },
      { h: "RSK-ACC re-assessment", opts: ACC_REVIEW, w: 130, what: "When the retained risk is assessed again." },
      { h: "RSK-ACC approver (R36)", opts: ACC_APPROVERS, w: 170, what: "Who may accept the risk at its residual rating." },
    ],
    rows: RTP_ROWS,
    mine: (r) => r[0] === GC,
    studyAll: [1],
    // 2: the option · 6: the due date, and the acceptance of the retained risk.
    steps: { 2: [4], 6: [8, 11, 12, 13, 14] },
    ident: [1],
    view: { 2: [2, 3, 9], 6: [4, 7, 9, 10] },
    derived: {
      // From sheet Controls for a modified risk; nothing to list for the others.
      5: { from: [4], value: (v, p) => (v(4) === MODIFY ? neededCtrls(p, 0) : v(4) === RETAIN ? "None: retained as it is" : v(4) === "Avoid" ? "None: the activity is stopped" : v(4) ? "—" : ""), waits: () => "From sheet Controls (step 3)", quiet: true },
      6: { from: [4], value: (v, p) => (v(4) === MODIFY ? neededCtrls(p, 1) : v(4) ? "—" : ""), waits: () => "From sheet Controls (step 3)", quiet: true },
      // Clause 6.1.3 f), as step 5's checked answer: the row's own owner where it is the risk owners.
      10: { from: [7], value: (v, p) => { const d = p.decisions?.["T5.1-D3"]; const k = d ? d.best ?? d.pick : ""; return k === "A" ? `Risk owner (${v(7)})` : D3_APPROVER[k] ?? ""; }, waits: () => "Decided in step 5" },
      // The acceptance is raised for the retained risk only.
      11: { from: [4], value: (v) => (v(4) === RETAIN ? null : "—"), quiet: true },
      12: { from: [4], value: (v) => (v(4) === RETAIN ? null : "—"), quiet: true },
      13: { from: [4], value: (v) => (v(4) === RETAIN ? null : "—"), quiet: true },
      14: { from: [4], value: (v) => (v(4) === RETAIN ? null : "—"), quiet: true },
    },
    note: {
      2: (desk) => `${ruleNote("L12")(desk)} Each row's residual score is in column Residual, and its facts and existing controls in What LI-CHAIN and RR-UPD record. Rule L12 is step 5 of the procedure in SITL-POL-002 Section 6.1 (Policies › Policy Library).`,
      6: () => "The plan is dated 2 November 2026. Due date: rule R08 and SITL-POL-002 Section 6.1 step 6 give the days for each residual rating (SITL-ERM-001 Section 7), counted from the plan's date; a retained risk has none. For the retained risk, fill the four RSK-ACC columns from SITL-POL-002 Section 6.2: the reason it is retained rather than treated; the expiry date; the re-assessment date, at the review frequency of SITL-ERM-001 Section 7 for its rating; and the approver the GRC Charter Section 6.1 names for its rating (rule R36). The other rows show — there. Owner and Residual come from RR-UPD, Approved by from your answer in step 5. The due date and the four RSK-ACC columns are checked together.",
    },
    extra: { 6: [["SITL-POL-002", ["6.1", "6.2"]], ["Charter", ["6.1"]]] },
    checkRows: { 2: { label: 1, col: 4 }, 6: { label: 1, col: 8, with: [11, 12, 13, 14] } },
    handIn: { step: 7, cols: [4, 5, 6, 8, 10, 11, 12, 13, 14], ident: [1] },
  },
  "T5.1 CTRL": {
    code: "CTRL",
    title: "Sheet Controls · Controls for the modified risk, compared with Annex A (LI-RTP, template T-LI-RTP)",
    stamp: "Sheet Controls",
    on: [3],
    cols: [
      { h: "Risk", w: 100, what: "The modified risk the control is proposed for." },
      { h: "Control proposed", prose: true, w: 300, what: "A control the treatment workshop proposed." },
      { h: "Source", w: 170, what: "Where the control was taken from." },
      { h: "Needed for this risk?", opts: ["Yes", "No"], w: 120, what: "Yes where it acts on this risk's cause, event or consequence." },
      { h: "Annex A ID", opts: ANNEX_OPTS, wrap: true, w: 220, what: "The Annex A control whose title covers what it does." },
    ],
    rows: CTRL_ROWS.map(([c, src]) => ["R-16-HQ-16", c, src, "", ""]),
    mine: () => true,
    steps: { 3: [3, 4] },
    ident: [1],
    view: { 3: [2] },
    // A control the risk does not need is not compared: written by itself.
    derived: { 4: { from: [3], value: (v) => (v(3) === "No" ? NOT_NEEDED : null) } },
    note: {
      3: () => "R-16-HQ-16 is the risk you modify: \"Because the remote-access VPN gateway runs a version with a flaw that attackers are actively exploiting, an attacker may get into the Manila network without valid credentials, leading to client customer data on the delivery platform being exposed.\" The treatment workshop proposed these six controls, from any source. For each, decide whether this risk needs it: does it act on the risk's cause, its event or its consequence? Two of them treat your other risks. Then compare each needed control with Annex A (Clause 6.1.3 c): choose the Annex A control whose title covers what it does. A control not needed shows — by itself. Needed and Annex A ID are checked together.",
    },
    reads: { 3: ["learn|Framework Quick Reference"] },
    checkRows: { 3: { label: 1, col: 3, with: 4 } },
    handIn: { step: 7, cols: [3, 4], ident: [1] },
  },
  "T5.1 ACC": {
    code: "RSK-ACC",
    title: "RSK-ACC · Risk acceptance request (template T-ACC)",
    stamp: "Risk acceptance request",
    on: [],
    cols: [
      { h: "Field", w: 170, what: "A field of the request, as SITL-POL-002 Section 6.2 lists it." },
      { h: "Value", prose: true, w: 340, what: "From the retained risk's row of LI-RTP." },
    ],
    rows: ["Risk", "Residual rating", "Reason", "Expiry date", "Re-assessment date", "Approver (R36)", "Raised by"].map((f) => [f, ""]),
    mine: () => true,
    steps: {},
    ident: [0],
    // The form as the approver receives it, from the retained row (step 6). Typing it twice would be a copy.
    derived: {
      1: {
        from: [0],
        value: (v, p) => {
          const r = retained(p);
          if (!r) return "";
          const at: Record<string, string> = { Risk: `${r(1)}: ${r(2)}`, "Residual rating": r(9), Reason: r(11), "Expiry date": r(12), "Re-assessment date": r(13), "Approver (R36)": r(14), "Raised by": `${r(7)}, risk owner, 2 November 2026` };
          return at[v(0)] ?? "";
        },
        waits: () => "From the retained risk's row (step 6)",
      },
    },
    handIn: { step: 7, cols: [1], ident: [0] },
  },
  "T11.1": {
    code: "LI-KPI",
    title: "LI-KPI · Measure cards (template T-LI-KPI, sheet Cards)",
    stamp: "Sheet Cards",
    on: [1, 4],
    cols: [
      { h: "Organisation", what: "Whose card it is: yours, or the worked example's." },
      { h: "Card", w: 90, what: "The card's number." },
      { h: "Control", opts: (_d, _r, _b, p) => kpiControls(p), wrap: true, w: 260, what: "A control of your trackers, with its maturity level." },
      { h: "What is measured", prose: true, w: 190, what: "The Level 4 measure, from the Control Maturity Matrix." },
      { h: "Target set in", w: 190, what: "Where the measure's target is read." },
      { h: "Target and threshold", opts: () => KPI.targets, wrap: true, w: 200, what: "The value aimed for, and the value past which management acts." },
      { h: "Method: numerator ÷ denominator", prose: true, w: 260, what: "How the value is calculated, from the matrix." },
      { h: "Data source", prose: true, w: 180, what: "The records the numbers are counted from." },
      { h: "When measured", w: 120, what: "How often the value is measured." },
      { h: "Who measures", w: 170, what: "The role that counts the numbers." },
      { h: "When analysed and evaluated", prose: true, w: 220, what: "When the result is looked at and judged." },
      { h: "Who analyses and evaluates", w: 170, what: "The role that judges the result and reports it." },
    ],
    rows: [KPI_WORKED, ...[1, 2, 3, 4, 5].map((n) => [GC, `Card ${n}`, "", "", "", "", "", "", "", "", "", ""])],
    mine: (r, desk) => r[0] === desk.orgs.A.name,
    // 4: the control (the five lowest levels) and the target and threshold, read where Target set in says (beside it).
    // The rest of the card fills from the matrix.
    steps: { 4: [2, 5] },
    ident: [1],
    derived: {
      3: { from: [2], value: (v) => (v(2) ? kpiMatrix(v(2))?.[1] ?? "Not in the matrix extract: choose another control" : null), waits: () => "Fills from the control" },
      4: { from: [2], value: (v) => (v(2) ? kpiMatrix(v(2))?.[6] ?? "—" : null), waits: () => "Fills from the control" },
      6: { from: [2], value: (v) => (v(2) ? kpiMatrix(v(2))?.[2] ?? "—" : null), waits: () => "Fills from the control" },
      7: { from: [2], value: (v) => (v(2) ? kpiMatrix(v(2))?.[3] ?? "—" : null), waits: () => "Fills from the control" },
      8: { from: [2], value: (v) => (v(2) ? kpiMatrix(v(2))?.[4] ?? "—" : null), waits: () => "Fills from the control" },
      9: { from: [2], value: (v) => (v(2) ? kpiMatrix(v(2))?.[5] ?? "—" : null), waits: () => "Fills from the control" },
      10: { from: [2], quiet: true, value: () => KPI_ANALYSED },
      11: { from: [2], quiet: true, value: () => KPI_ANALYST },
    },
    note: {
      4: () => "Sort your trackers by maturity level: the Control list gives every control of CIT-S1 to CIT-S13 with the level its tracker records. Pick the five with the lowest level, one card each, in any order. The card then fills from the control's Level 4 measure in the Control Maturity Matrix (dataset CMM-L4): what is measured, the numerator and denominator, the data source, when and by whom. Choose the target and threshold. Target: read it where the card's Target set in names; for a Group policy, its Section 10, Key performance indicators (Policies › Policy Library). Threshold: the value past which management must act. Where the source sets a red line, it is the threshold; where it sets none, the threshold is 10 percentage points below the target. Control and target are checked together.",
    },
    // Every policy the matrix extract names a target in, not only the five cards' (the bar must not point at the answer).
    extra: { 4: ["SITL-POL-006", "SITL-POL-010", "SITL-POL-013", "SITL-POL-014", "SITL-POL-017", "SITL-POL-020"].map((id) => [id, ["10"]] as [string, string[]]) },
    checkRows: { 4: { label: 1, col: 2, with: 5 } },
    handIn: { step: 7, cols: [2, 5], ident: [1] },
  },
  "T11.1 DASH": {
    code: "KPI-DASH",
    title: "KPI-DASH · ISMS measurement dashboard (template T-LI-KPI, sheet Dashboard)",
    stamp: "Sheet Dashboard",
    on: [6],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "Card", w: 80, what: "Your measure card (LI-KPI) the row reports." },
      { h: "Control", w: 80, what: "The control of that card." },
      { h: "What is measured", w: 190, what: "The measure on the card." },
      { h: "Data at 30 November 2026 (KPI-BASE)", prose: true, w: 300, what: "Your data for the measure, from dataset KPI-BASE." },
      { h: "Current value", opts: (_d, r) => KPI.values[r[2]], w: 110, what: "Numerator ÷ denominator × 100, to one decimal." },
      { h: "Target and threshold", w: 190, what: "From the card." },
      { h: "Status", w: 90, what: "Green, Amber or Red: the value against target and threshold." },
      { h: "ISMS objective (LI-OBJ)", prose: true, w: 220, what: "The objective of LI-OBJ the measure reports on." },
      { h: "What management should do", opts: (_d, r) => KPI.actions[r[2]], prose: true, w: 300, what: "One line: the action the result calls for." },
    ],
    rows: [
      [LT, "Worked row", "A.6.3", "Phishing simulation report rate", "Q3 2026 campaign at Amsterdam: sent to 240 staff; 132 reported the simulated message, and 19 clicked it.", "55.0%", "Target 60%, threshold below 50%", "Amber", "OBJ-02 Grow reporting: report rate 60% or more by 30 June 2027",
        "Ask the Security Awareness & Training Specialist why reporting fell short, and give the next campaign's micro-lesson to reporting; measure again after it."],
      ...[1, 2, 3, 4, 5].map((n) => [GC, `Card ${n}`, "", "", "", "", "", "", "", ""]),
    ],
    mine: (r, desk) => r[0] === desk.orgs.A.name,
    // 6: the current value and the line for management. The row's control and target are its card's, as step 4 checked them.
    steps: { 6: [5, 9] },
    ident: [1, 2],
    // The measure, the data the value is counted from, the target and the objective: read beside the two columns chosen.
    view: { 6: [3, 4, 6, 8] },
    derived: {
      2: { from: [1], value: (v, p) => kpiCode(KPI_CARD(p, KPI_CARD_ROW(v(1)), 2)), waits: () => "From your card (step 4)" },
      3: { from: [2], value: (v) => kpiMatrix(v(2))?.[1] ?? "" },
      4: { from: [2], value: (v) => KPI.base[v(2)] ?? "" },
      6: { from: [1], value: (v, p) => KPI_CARD(p, KPI_CARD_ROW(v(1)), 5) },
      7: { from: [5, 6], value: (v) => kpiStatus(v(5), v(6)), waits: () => "Fills from the value" },
      8: { from: [2], value: (v) => KPI.objectives[v(2)] ?? "" },
    },
    note: {
      6: () => "Each row is one of your measure cards (step 4). For each, calculate the current value from your data in the Data column (dataset KPI-BASE): the card's numerator ÷ its denominator × 100, to one decimal, counting only what the card's method counts. The status fills itself: Green at or above the target, Amber below the target but not past the threshold, Red past the threshold. Then choose the one line on what management should do: the action the status and the data call for, with an owner where it needs one. Value and line are checked together.",
    },
    checkRows: { 6: { label: 2, col: 5, with: 9 } },
    handIn: { step: 7, cols: [5, 9], ident: [1, 2] },
  },
  "T12.1": {
    code: "ACT-UPD",
    title: "ACT-UPD · Updated action tracker (template T-ACT)",
    stamp: "ACT-TRACKER, 21 December 2026",
    on: [1],
    cols: [
      { h: "Action", w: 80, what: "The action's ID in ACT-TRACKER." },
      { h: "From", w: 150, what: "The gap or finding the action was raised for, and its task." },
      { h: "What was to be done", prose: true, w: 230, what: "The correction or corrective action agreed." },
      { h: "Owner", w: 140, what: "The role that agreed to do it." },
      { h: "Due", w: 100, what: "The date it was due." },
      { h: "Status (owner)", w: 90, what: "What the owner reports." },
      { h: "Closure evidence", prose: true, w: 300, what: "What the owner sent to show where it stands." },
      { h: "Status (verified)", opts: ACT_STATUS, w: 170, what: "Your status, from the evidence, not the owner's word." },
      { h: "Reason", opts: ACT_REASONS, wrap: true, w: 250, what: "What the evidence shows, or fails to show." },
      { h: "Next check date", date: true, w: 140, what: "When you check the action again: after 21 December 2026." },
    ],
    rows: ACT_ROWS.map((r) => [...r, "", "", ""]),
    mine: () => true,
    steps: { 1: [7, 8, 9] },
    ident: [0],
    view: { 1: [1, 2, 3, 4, 5, 6] },
    cells: {
      9: {
        fix: (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v.trim()) && v.trim() > ACT_AT ? v.trim() : null),
        hint: () => "A date after the tracker's extract date, 21 December 2026: the day you will look at this action again, for example 2027-02-15.",
      },
    },
    note: {
      1: () => "ACT-TRACKER as at 21 December 2026: the gaps and nonconformities raised in weeks 2–11, each with what its owner reports and the evidence sent. Test the evidence, not the owner's word. Closed — verified effective: a record from the system shows the fix in place, and a check since shows it worked (Clause 10.2 d: review the effectiveness of the action taken; the GRC Charter Section 13: findings are tracked to closure with validation). The evidence must be a dated, attributable record, not a statement or a draft (SITL-POL-016 Section 7.1). Open — evidence insufficient: not yet shown closed, but not past its due date, or done with no check that it worked. Overdue — escalate: past its due date, not done, and no new date (SITL-POL-016 Section 6.2 step 7: each action is tracked to closure). Choose the reason that says why, and set the next check date. Status and reason are checked together; the date is yours.",
    },
    extra: { 1: [["SITL-POL-016", ["6.2", "7.1"]], ["Charter", ["13"]]] },
    reads: { 1: ["learn|Framework Quick Reference"] },
    checkRows: { 1: { label: 0, col: 7, with: 8 } },
    handIn: { step: 6, cols: [7, 8, 9], ident: [0] },
  },
  "T12.1 MR": {
    code: "LI-MR",
    title: "LI-MR · Management-review pack: the Clause 9.3.2 inputs",
    stamp: "Sheet Inputs",
    on: [3],
    cols: [
      { h: "Clause 9.3.2 input", w: 280, what: "What the management review must consider, item a) to g)." },
      { h: "Available/Missing", opts: ["Available", "Missing"], w: 120, what: "Available where a file of the pack holds it." },
      { h: "Source file", opts: [...MR_SOURCES, MR_NONE], w: 220, what: "The file of the pack that holds it (Ref-Review pack)." },
    ],
    rows: MR_ROWS,
    mine: (r) => !r[1],
    steps: { 3: [1, 2] },
    ident: [0],
    // A missing input has no file to name (rule L24): written by itself, so only an Available row asks for one. Read from the
    // learner's own pick, not the cell as it stands after the check: a row wrongly marked Missing would otherwise turn
    // Available once checked and leave its locked source cell empty, holding Mark complete for good.
    derived: { 2: { from: [1], value: (v) => (v(1) === "Missing" ? MR_NONE : null) } },
    worked: "Row a) is worked: no management review has covered the Manila ISMS (LI-GAP, clause 9.3), so the pack records that there are no earlier actions.",
    note: { 3: (desk) => `${ruleNote("L24")(desk)} The files the Compliance Manager has collected for the first Manila management review are listed, with what each holds, on Ref-Review pack (Learn › Reference pages). Available/Missing and the source are checked together.` },
    reads: { 3: ["learn|Reference pages", "learn|Framework Quick Reference"] },
    checkRows: { 3: { label: 0, col: 1, with: 2 } },
    handIn: { step: 6, cols: [1, 2], ident: [0] },
  },
  "T12.1 READY": {
    code: "LI-MR-READY",
    title: "LI-MR · Stage 1 readiness",
    stamp: "Sheet Readiness",
    on: [4],
    cols: [
      { h: "Question", w: 220, what: "What the pack must answer for the certification body." },
      { h: "Ready for Stage 1?", opts: ["Yes", "No"], w: 110, what: "Yes or No, by rule L24." },
      { h: "Reason", opts: READY_REASONS, wrap: true, w: 320, what: "Why: what must happen first, or why nothing must." },
    ],
    rows: [["Is the Manila ISMS ready for the Stage 1 audit (rules L23, L24)?", "", ""]],
    mine: () => true,
    steps: { 4: [1, 2] },
    ident: [0],
    then: { 4: "LI-MR readiness: is the Manila ISMS ready for Stage 1?" },
    note: { 4: (desk) => `${ruleNote("L24")(desk)} ${ruleNote("L23")(desk)} What the pack holds is in your sheet Inputs (step 3), and the state of the internal audit on Ref-Review pack (Learn › Reference pages). The answer and the reason are checked together.` },
    reads: { 4: ["learn|Reference pages"] },
    checkRows: { 4: { label: 0, col: 1, with: 2 } },
    handIn: { step: 6, cols: [1, 2], ident: [0] },
  },
  "T12.1 ROAD": {
    code: "L4-ROAD",
    title: "L4-ROAD · Level 3 → Level 4 roadmap, next 12 months (the L4-ROAD frame)",
    stamp: "One page, by quarter",
    on: [5],
    cols: [
      { h: "Organisation", w: 120, what: "Whose row it is: yours, or the worked example's." },
      { h: "Control", w: 200, what: "The control of one of your LI-KPI measure cards." },
      { h: "Measure", prose: true, w: 200, what: "The Level 4 measure on the card (Control Maturity Matrix)." },
      { h: "Measured", w: 100, what: "How often the value is measured." },
      { h: "Owner", w: 160, what: "The role that measures it, from the card." },
      { h: "Target and threshold", w: 170, what: "From your LI-KPI card (T11.1)." },
      { h: "What has to be ready first", prose: true, w: 280, what: "What the measure needs before it can run the same way each time." },
      { h: "Quarter it goes live", opts: ROAD_Q, w: 170, what: "The first quarter it can be measured the same way each time." },
      { h: "Route to management review (Clause 9.3)", opts: ROAD_ROUTE, wrap: true, w: 280, what: "How its results reach the management review, by how often it is measured." },
      { h: "How results drive improvement (Clause 10.1)", prose: true, w: 260, what: "The same for every measure: written with the frame." },
    ],
    rows: [
      [LT, "A.6.3 Information security awareness, education and training (Amsterdam)", "Phishing simulation report rate", "After each quarterly campaign", "Security Awareness & Training Specialist", "Target 60%, threshold below 50%",
        "Nothing: the campaign tool exports who reported each simulated message.", ROAD_Q[0], ROAD_ROUTE[1], ROAD_BREACH],
      ...ROAD_CONTROLS.map((c) => { const m = KPI.matrix.find((r) => r[0] === c)!; return [GC, `${c} ${KPI.titles[c]}`, m[1], m[4], m[5], "", ROAD_READY[c], "", "", ""]; }),
    ],
    mine: (r) => r[0] === GC,
    steps: { 5: [7, 8] },
    ident: [1],
    view: { 5: [2, 3, 4, 5, 6] },
    derived: {
      5: { from: [1], value: (v, p) => roadTarget(p, kpiCode(v(1))), waits: () => "From your LI-KPI card (T11.1)" },
      9: { from: [1], value: () => ROAD_BREACH },
    },
    note: {
      5: () => "L4-ROAD is the one-page plan for the next 12 months: each of your five LI-KPI measures, the quarter it goes live, and how its results reach management. Quarter: a measure goes live when its results can be produced the same way every time (Clause 9.1: comparable and reproducible). Where nothing has to be ready first, that is Q1 2027; otherwise it is the quarter in which what has to be ready first is in place. Route: a measure taken each month is looked at each month by the Org CISO at the dashboard review; every measure goes each quarter to the Org Risk & Compliance Committee, which holds the ISMS management review for a LOW-criticality organisation (GRC Charter Section 6), and its year's trend goes to the yearly management review (SITL-POL-001 Section 4). The last column is written with the frame. The Group aims for Level 4 as the GRC Charter Section 3.3 sets out. Quarter and route are checked together.",
    },
    extra: { 5: [["Charter", ["3.3", "6"]], ["SITL-POL-001", ["4", "6.1"]]] },
    checkRows: { 5: { label: 1, col: 7, with: 8 } },
    handIn: { step: 6, cols: [7, 8], ident: [1] },
  },
  "T11.2": {
    code: "LI-AUD",
    title: "LI-AUD · Internal audit programme and plan, January–December 2027 (template T-LI-AUD)",
    stamp: "Sheet Programme",
    on: [1],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "Audit", w: 90, what: "The audit's number in the programme." },
      { h: "Scope", prose: true, w: 230, what: "The clauses or controls the audit covers." },
      { h: "Criteria", prose: true, w: 220, what: "What the audit holds the office against." },
      { h: "What your trackers show", prose: true, w: 280, what: "Each line's status and level in LI-GAP, or level in its tracker." },
      { h: "Audits in the 12 months", opts: AUD_FREQ, w: 110, what: "Once, or twice where the trackers call for it." },
      { h: "Month(s)", opts: AUD_WHEN, w: 170, what: "One month for Once; two, six months apart, for Twice." },
      { h: "Method", opts: AUD_METHODS, wrap: true, w: 230, what: "How the auditor gathers evidence (ISO 19011)." },
      { h: "Auditor", opts: AUD_AUDITORS, w: 190, what: "Who audits it, keeping the audit objective." },
    ],
    rows: [AUD_WORKED, ...AUD_AREAS.map(([id, scope, crit]) => [GC, id, scope, crit, "", "", "", "", ""])],
    mine: (r) => r[0] === GC,
    steps: { 1: [5, 6, 7, 8] },
    ident: [1],
    view: { 1: [2, 3, 4] },
    derived: { 4: { from: [1], value: (v, p) => { const a = AUD_AREAS.find((x) => x[0] === v(1)); return a ? audTrackers(a[3], p) : null; } } },
    cells: {
      6: {
        fix: (v, row) => (AUD_WHEN.includes(v) && (row[5] !== "Once" || !v.includes(" and ")) && (row[5] !== "Twice" || v.includes(" and ")) ? v : null),
        hint: () => "Once takes one month, as in \"May 2027\"; Twice takes two months six months apart, as in \"February and August 2027\". Choose how often first.",
      },
    },
    note: {
      1: () => "Each row is one audit of the programme, January to December 2027: together they cover clauses 4–10 and every applicable Annex A control of your LI-SOA (A.8.30 is Not applicable). What your trackers show comes from your LI-GAP (F2.2: each clause's status and level, as checked) and your control trackers CIT-S1 to CIT-S13 (each control's level). How often: Clause 9.2.2 asks the programme to weigh how important each process is and the results of earlier audits. Audit twice in the 12 months where any line shows Level 1 or Level 2, or a status Partially met or Not met (a poor earlier result); once where every line is Level 3 or above and Fully met. Month(s): one month for Once; for Twice, two months six months apart. Method: yours to choose for what the audit looks at; it is checked with the task. Auditor: Clause 9.2.2 asks for auditors, and audits, that keep the audit process objective and impartial. The GRC Charter says who performs the internal audits (Section 13), who runs each process (Section 16), that GRC staff may not audit what they designed or operate (Section 17), and who gives independent assurance (Section 5.2). How often and the auditor are checked together.",
    },
    extra: { 1: [["Charter", ["5.2", "13", "16", "17"]]] },
    checkRows: { 1: { label: 1, col: 5, with: 8 } },
    handIn: { step: 6, cols: [5, 6, 7, 8], ident: [1] },
  },
  "T11.2 RV": {
    code: "RV-SET",
    title: "RV-SET · Maturity review set: your nine RV cards (Review Deck)",
    stamp: "Review Deck",
    on: [3, 4],
    cols: [
      { h: "Organisation", what: "Whose card it is: yours, or the worked example's." },
      { h: "Card", w: 80, what: "The RV card's number in your set." },
      { h: "Topic", w: 150, what: "What the card is about." },
      { h: "Scenario", prose: true, w: 320, what: "What the reviewer found at the office." },
      { h: "Maturity level", opts: "step", w: 110, what: "Level 1 to 3, by the Maturity Model's questions." },
      { h: "Indicators", prose: true, w: 220, what: "The Maturity Model's questions, as far as the level answers them." },
      { h: "Classification", opts: "step", w: 130, what: "Major NC, Minor NC, OFI or Conforming." },
      { h: "ISO reference", opts: RV_ISO, wrap: true, w: 230, what: "The clause or Annex A control the card answers to." },
      { h: "Gap", prose: true, w: 230, what: "What is missing against the requirement." },
      { h: "Recommendation", prose: true, w: 230, what: "The next action that takes it a level up, with its owner." },
    ],
    rows: [RV_WORKED, ...RV_CARDS.map(([id, topic, sc]) => [GC, id, topic, sc, "", "", "", "", "", ""])],
    mine: (r) => r[0] === GC,
    steps: { 3: [4], 4: [6, 7, 8, 9] },
    ident: [1],
    view: { 3: [2, 3], 4: [2, 3, 4, 5] },
    derived: { 5: { from: [4], quiet: true, value: (v) => RV_INDICATORS[v(4)] ?? "", waits: () => "From your level (step 3)" } },
    cells: {
      8: { fix: (v) => (words(v) >= 6 ? v.trim() : null), hint: () => "Write what is missing against the requirement, in six words or more, as in \"No restore test of the Amsterdam backups since March.\" It is reviewed." },
      9: { fix: (v) => (words(v) >= 6 ? v.trim() : null), hint: () => "Write the next action and its owner, in six words or more, as in \"Adopt the Group backup procedure; owner the IT lead.\" It is reviewed." },
    },
    note: {
      3: () => "Each row is one RV card of your set: what a reviewer found at the Manila office. Decide each card's level with the Maturity Model (Ref-Maturity Model) and the fixed questions RV-Q1 to RV-Q8 (RV-Q fixed questions), both in Learn › Reference pages. Ask the model's questions in order and stop at the first No. 1) Is there a documented, approved way of doing it, and records that it is done? No → Level 1. 2) Is it the Group's standard way, done the same in every office, and reviewed at least once a year? No → Level 2. 3) Is it measured against targets, with the results tracked and acted on? No → Level 3. Levels are checked exactly.",
      4: () => "Classify each card's finding by the training convention: a Level 1 card is a Major NC (nonconformity), a Level 2 card a Minor NC, a Level 3 card an OFI (opportunity for improvement: the requirement is met, and it can go further). Conforming is for a card with nothing to improve. Then choose the ISO/IEC 27001:2022 clause or Annex A control the card answers to (RV-Q6): what each one on the list requires is on Ref-Review references (Learn › Reference pages). Write the gap and your recommendation: the next action that takes the card a level up, with its owner (RV-Q8). The indicators fill themselves from your level. Classification and ISO reference are checked together; the gap and the recommendation are reviewed.",
    },
    reads: { 3: ["learn|Reference pages"], 4: ["learn|Reference pages"] },
    checkRows: { 3: { label: 1, col: 4 }, 4: { label: 1, col: 6, with: 7 } },
    handIn: { step: 6, cols: [4, 6, 7, 8, 9], ident: [1] },
  },
  "T11.2 NCR": {
    code: "LI-NCR",
    title: "LI-NCR · Nonconformity report (template T-LI-NCR)",
    stamp: "Nonconformity report",
    on: [5],
    cols: [
      { h: "Organisation", what: "Whose row it is: yours, or the worked example's." },
      { h: "NC", w: 70, what: "The nonconformity's number." },
      { h: "Card", opts: RV_CARDS.map((c) => c[0]), w: 100, what: "NC-1: a Level 1 card of your set; NC-2: a Level 2 card." },
      { h: "Level in your review", w: 110, what: "The card's level, as your step 3 stands." },
      { h: "Requirement", w: 200, what: "The clause or control, as your step 4 stands." },
      { h: "Evidence", prose: true, w: 260, what: "What the scenario shows, in facts and numbers." },
      { h: "Statement of the gap", prose: true, w: 260, what: "What the requirement asks and what is not done." },
      { h: "Grade (L17)", opts: ["Major", "Minor"], w: 100, what: "Major or Minor, by rule L17." },
    ],
    rows: [NCR_WORKED, [GC, "NC-1", "", "", "", "", "", ""], [GC, "NC-2", "", "", "", "", "", ""]],
    mine: (r) => r[0] === GC,
    steps: { 5: [2, 5, 6, 7] },
    ident: [1],
    derived: {
      3: { from: [2], value: (v, p) => (v(2) ? standing(REGISTERS["T11.2 RV"], p, "T11.2", rvRow(v(2)), 4) || "—" : ""), waits: () => "Shows once a card is chosen" },
      4: { from: [2], value: (v, p) => (v(2) ? standing(REGISTERS["T11.2 RV"], p, "T11.2", rvRow(v(2)), 7) || "—" : ""), waits: () => "Shows once a card is chosen" },
    },
    cells: {
      2: {
        fix: (v, row) => (row[3] === (row[1] === "NC-1" ? "Level 1" : "Level 2") ? v : null),
        hint: (row) => `${row[1]} takes a card your review rated ${row[1] === "NC-1" ? "Level 1" : "Level 2"} in step 3: its level shows in the next column once the card is chosen.`,
      },
      5: { fix: (v) => (words(v) >= 8 ? v.trim() : null), hint: () => "Write what the scenario shows, with its facts and numbers, in eight words or more, as in \"Of 12 monthly restore tests, one has no record.\" It is reviewed." },
      6: { fix: (v) => (words(v) >= 8 ? v.trim() : null), hint: () => "Write what the requirement asks and what is not done, in eight words or more, as in \"Backups are not tested by restore as A.8.13 requires.\" It is reviewed." },
    },
    note: {
      5: () => "Choose one Level 1 card of your set for NC-1 and one Level 2 card for NC-2: the level and the requirement fill themselves, as your steps 3 and 4 stand. Write the evidence (what the scenario shows: the facts and numbers the reviewer found) and the statement of the gap (what the requirement asks for, and what is not done). Grade each by rule L17: Major when the required activity was never done in the period, or failed in more than half of the sample; Minor for any other failure. The grade is checked; the evidence and the statement are reviewed.",
    },
    checkRows: { 5: { label: 2, col: 7 } },
    handIn: { step: 6, cols: [2, 5, 6, 7], ident: [1] },
  },
};

export const regKey = (taskId: string, code: string) => `${taskId}|${code}`;

/**
 * A step's register or brief. A task may hand in more than one file (T3.1: OBL-REG, then the Lead
 * Implementer extensions' LI-FAM and LI-SCOPE): each is keyed "<task>" or "<task> <code>" and owns the
 * steps it is `on` and the step that hands it in. With no step, the task's first.
 */
const owns = (k: string, id: string) => k === id || k.startsWith(`${id} `);
// Every column's description (col-what.ts), where the column does not carry its own.
for (const [k, r] of Object.entries(REGISTERS)) for (const c of r.cols) if (!c.auto) c.what ??= COL_WHAT[k]?.[c.h] ?? COL_WHAT["*"][c.h];

export function regOf(taskId: string, n?: number): Register | undefined {
  if (n === undefined) return REGISTERS[taskId];
  return Object.entries(REGISTERS).find(([k, r]) => owns(k, taskId) && (r.on.includes(n) || r.handIn?.step === n))?.[1];
}
/** Every register a step hands in (T11.1 step 7: LI-KPI and KPI-DASH, two sheets of T-LI-KPI). */
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

/** The documents a step's rows name (Register.docsCol), by code. */
export function rowDocs(taskId: string, n: number, p: Progress): string[] {
  const reg = regOf(taskId, n);
  const ci = reg?.docsCol?.[n];
  if (!reg || ci === undefined) return [];
  return [...new Set(regRows(reg, p, taskId).map((_, ri) => cellValue(reg, p, taskId, ri, ci).split(" ")[0]).filter(Boolean))];
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
  if (!d || reg.rows[ri]?.[ci]) return null;
  // A derived cell checked as one answer with its source (T3.1: Gap writes "None: no section meets it"; T5.1, T5.2,
  // T12.1 the same) reads the learner's own picks in that answer, not the key: after a wrong pick the key would turn the
  // derived cell back into an empty one the check has already locked, and the step could never complete (T12.1's probe,
  // integration fixes 26 Nov 2026). Everything after the step still reads the key, through `standing` on this cell.
  const group = Object.values(reg.checkRows ?? {}).flatMap((rc) => { const g = [rc.col, ...withCols(rc)]; return g.includes(ci) ? g : []; });
  return d.value((c) => (group.includes(c) ? cellValue(reg, p, taskId, ri, c) : standing(reg, p, taskId, ri, c)), p);
}

/**
 * What a cell stands at for everything that reads it afterwards: the key's value once a check found the learner's
 * wrong, else the cell. A later step, a derived column or a list of choices must not be built on a value the
 * platform has already told the learner is wrong (owner, 17 Nov 2026: F2.2 step 3 offered no right code for an
 * item step 2 had wrongly rejected, and marked it wrong a second time). The cell itself keeps the pick: it is what
 * was scored, and its own step shows it beside the answer.
 */
export const standing = (reg: Register, p: Progress, taskId: string, ri: number, ci: number): string =>
  checkedAnswer(reg, p, taskId, ri, ci) ?? cellValue(reg, p, taskId, ri, ci);

/**
 * The key's value for a cell an earlier step checked and found wrong, where it differs from what the cell holds; else
 * null. The hand-in shows it beside the learner's pick, as a checked row does in its own step: the pick stays (it is
 * what was scored), and the file no longer reads as if the wrong value stood unchallenged (tester, 4 Nov: T10.1's DFM
 * still said Collect for F5 after step 3 gave Transfer). A `with` column takes its half of "<col> · <with>".
 */
export function checkedAnswer(reg: Register, p: Progress, taskId: string, ri: number, ci: number): string | null {
  // A given cell was never a pick (T9.2: the tracker's worked row shares its label, A.8.13, with a row the learner rates).
  if (reg.rows[ri]?.[ci]) return null;
  for (const [n, rc] of Object.entries(reg.checkRows ?? {})) {
    const ws = withCols(rc);
    const part = ci === rc.col ? 0 : ws.includes(ci) ? ws.indexOf(ci) + 1 : -1;
    if (part < 0) continue;
    const fb = p.rowChecks?.[`${taskId}-${n}`]?.rows[cellValue(reg, p, taskId, ri, rc.label)];
    if (fb?.correct !== false || !fb.best) continue;
    const want = (ws.length ? fb.best.split(" · ")[part] : fb.best)?.trim();
    if (want && !same(want, cellValue(reg, p, taskId, ri, ci))) return want;
  }
  return null;
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
export const liveRow = (reg: Register, p: Progress, taskId: string, ri: number) => reg.cols.map((_, ci) => standing(reg, p, taskId, ri, ci));

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
  return rows.flatMap((r, ri) => (reg.mine(r, desk) && (!reg.only?.[n] || reg.only[n](r.map(String), p)) ? reg.handIn!.cols.filter((ci) => !reg.awaiting?.[ci]?.(liveRow(reg, p, task.id, ri), ri, addedBy(reg, p, task.id, ri)) && !cellOk(reg, desk, p, task.id, rows, ri, ci)).map((ci) => `${ri},${ci}`) : []));
}

/** A grid's own keys ("#rows", "#seeded"), which moving its rows about must not lose. */
const own = (cells: Record<string, string>) => Object.fromEntries(Object.entries(cells).filter(([k]) => k.startsWith("#")));
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
  const out: Record<string, string> = { ...own(cells), "#rows": String(count + 1) };
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
/** Two Group sources disagree on a clock: both are recorded, and the shorter one is worked to until the owners resolve it. */
const DIFFERS = "Differs: work to the shorter until the owners resolve it";
export function compareOffices(reg: Register, desk: Desk, p: Progress, taskId: string) {
  const rows = regRows(reg, p, taskId).map((_, ri) => ri).filter((ri) => [1, 2].includes(addedBy(reg, p, taskId, ri)));
  const offices = [...new Set(rows.map((ri) => cellValue(reg, p, taskId, ri, 5)).filter(Boolean))];
  const annex = docTable("SITL-ERM-001", "Annex A");
  if (!annex || !docTable(addendum(desk), "2")) return null;
  return offices.map((city) => {
    const full = desk.orgs.A.offices.find((o) => o.startsWith(city)) ?? city;
    const country = full.split(",")[1]?.trim() ?? "";
    const ours = docTable(addendum(desk), "2")?.find((r) => r[0].startsWith(city))?.[3] ?? "";
    const theirs = annex.find((r) => r[0] === country)?.[2] ?? "";
    const got = p.grids?.[regKey(taskId, reg.code)]?.[`cmp:${city}`] ?? "";
    // Where the office's clock differs, the row it differs on: the Annex A part with the same party and another clock.
    const parts = theirs.split(";").map((x) => x.trim());
    const party = (x: string) => x.toLowerCase().replace(/^\d+h to /, "").trim();
    const details = rows.filter((ri) => cellValue(reg, p, taskId, ri, 5) === city).map((ri) => {
      const ob = cellValue(reg, p, taskId, ri, 1);
      const was = cellValue(reg, p, taskId, ri, 9);
      const clock = parts.find((x) => party(x) === party(ob))?.split(" ")[0];
      const differs = !!clock && clock !== ours.split(" ")[0];
      return { ri, ob, differs, note: was.endsWith(DIFFERS) ? was : `${was} (${addendum(desk)}); ${clock} (SITL-ERM-001 Annex A). ${DIFFERS}` };
    });
    const row = p.grids?.[regKey(taskId, reg.code)]?.[`cmp:${city}:row`] ?? "";
    return { city, country, ours, theirs, differs: !same(ours, theirs), got, rows: details.map((d) => d.ri), details, row };
  });
}
export const compareDone = (reg: Register, desk: Desk, p: Progress, taskId: string) => {
  const c = compareOffices(reg, desk, p, taskId);
  return !!c?.length && c.every((o) => o.got === (o.differs ? "differs" : "same") && (!o.differs || !!o.details.find((d) => String(d.ri) === o.row)?.differs));
};

/** The steps whose rows the platform has put in place ("#seeded": "1,3"). */
const seeded = (cells: Record<string, string>) => (cells["#seeded"] ?? "").split(",").filter(Boolean).map(Number);
export const isSeeded = (cells: Record<string, string>, n: number) => seeded(cells).includes(n);
/**
 * Grid cells with the rows step `n` answers for in place, so that nobody is asked to add one (owner, 12 Nov 2026).
 * Its empty surplus rows go first, last one first: an older build let a step add any number, and the empty ones
 * could never be filled. A row with anything typed in it is never dropped. Then the step is topped up to `need`,
 * once: after that a missing row is one the trimming step removed, and it stays removed (`held`: the trimming
 * step is already done on a copy saved before rows were seeded). Returns `cells` itself when nothing changes.
 */
export function seedRows(cells: Record<string, string>, n: number, need: number, held = false): Record<string, string> {
  let out = cells;
  const mine = () => Array.from({ length: Number(out["#rows"] ?? 0) }, (_, ri) => ri).filter((ri) => Number(out[`${ri},by`] ?? 0) === n);
  const blank = (ri: number) => !Object.keys(out).some((k) => { const [r, c] = k.split(","); return Number(r) === ri && /^\d+$/.test(c ?? "") && !!out[k].trim(); });
  for (let spare = mine().filter(blank); mine().length > need && spare.length; spare = mine().filter(blank)) out = removeRow(out, spare[spare.length - 1]);
  if (isSeeded(out, n)) return out;
  if (!held) for (let i = mine().length; i < need; i++) out = addRow(out, n);
  return { ...out, "#seeded": [...seeded(out), n].join(",") };
}
/** Grid cells with a row added (stamped with the step that added it) or one removed and the rest moved up.
 *  The register's own keys ("#seeded") are kept. */
export function addRow(cells: Record<string, string>, n: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  return { ...cells, "#rows": String(count + 1), [`${count},by`]: String(n) };
}
export function removeRow(cells: Record<string, string>, ri: number): Record<string, string> {
  const count = Number(cells["#rows"] ?? 0);
  const out: Record<string, string> = { ...own(cells), "#rows": String(Math.max(0, count - 1)) };
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
 *   F1.1-4 (where may a working copy of customer data live): customer data is Tier 3 (SITL-STD-001 Section 3)
 *   and Section 6's Storage and Cloud / SaaS rows say where Tier 3 may be kept. The task card cites Section 6.
 */
export const DECIDE_FROM: Record<string, Record<number, [string, string[]][]>> = {
  "F1.1": { 4: [["SITL-STD-001", ["3", "6"]]] },
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
  /** A one-line section whose answer is its first word (Yes or No): the rest of the source line is not retyped. */
  lead?: boolean;
  /** The section arrives as a colleague's first draft to check against its source (F1.3 steps 2 and 3): the
   *  drafted values, and per value why it is wrong (null when right). Nothing is flagged until Check my answers. */
  draft?: (desk: Desk) => { v: string[]; why: (string | null)[] } | null;
}
export interface Brief {
  code: string;
  title: string;
  /** Printed in the footer, as the pack requires (SITL-POL-004 Section 3.1), where the template has one. */
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

export const BRIEFS: Record<string, Brief> = {};

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
  // "None" is what a line takes when its source lists nothing; a learner may say so in other words. Where a section
  // is `lead`, the answer's first word (Yes or No) is the decision and the rest is the source's reason, not retyped.
  const none = (a: string) => /^(none|nothing|no exclusions?|not applicable|n\/a)( (is |are )?(listed|excluded))?\.?$/.test(plain(a));
  const eq = (a: string, b: string) => same(a, b) || (b.includes(";") && sameParts(a, b)) || (plain(b) === "none" && none(a)) || (!!sec.lead && plain(a).replace(/[.,;:]$/, "") === plain(b).split(/[ ,.;:]/)[0]);
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
// "L01" for "Rule L01" and "Sec 9" for "Section 9" are the same citation, with or without a full stop after it: a learner is never held on its spelling.
const cite = (x: string) => norm(x.trim().replace(/\.$/, "").replace(/\bSec\.?(?=\s*\d)/gi, "Section")).replace(/^rule/, "");
/** What kind of source a section names, for the format its hint gives: a rule, a reference page, a document's section,
 *  or a whole document (T3.1 LI-SCOPE's Boundaries, worked from two places of the addendum). */
export const srcKind = (src: string): "rule" | "page" | "section" | "document" => (/^Rule\b/.test(src) ? "rule" : /^Ref-/.test(src) ? "page" : /\bSection\b/.test(src) ? "section" : "document");
export const briefSrcOk = (desk: Desk, sec: BriefSection, v: string) => {
  if (!sec.src) return true;
  const want = cite(sec.src(desk)), got = cite(v);
  if (got === want) return true;
  // A whole document: the document with one of the sections its own lines read is the same source, said more exactly.
  if (srcKind(sec.src(desk)) !== "document" || !got.startsWith(want)) return false;
  const secs = (sec.lines ?? []).flatMap((l) => [...(l.at ?? "").matchAll(/Section (\d+(?:\.\d+)*)/g)].map((m) => m[1]));
  return secs.includes(got.slice(want.length));
};

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
  const checked = !S.draft || !!v[`${sec},at`];
  return { ok: filled === keys.length && (!desk || right) && checked, filled, cells: keys.length, right, items: list.length, want };
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
  // F1.2 step 1: "find the three things every finished row has: a type from rule L01, a one-line purpose and a user".
  "F1.2": {
    1: [
      {
        id: "B",
        ask: "One worked row is for a reference set of controls with guidance on implementing each. Click the type its row gives it in column B.",
        why: "Column B records the document's type under rule L01. The type says what the document is for in an ISMS: to be certified against, to guide, to bind certification bodies, or to define terms.",
        hint: "Find the row by what it is for, in column C, then read column B on that row.",
        col: 2,
        row: (r) => r[1] === "ISO/IEC 27002:2022",
      },
      {
        id: "C",
        ask: "Click the one-line purpose of the worked row whose type is Vocabulary.",
        why: "Column C says in one line what the document is for. You decide each type from it in step 2.",
        hint: "Find the row by its type, in column B, then read column C on that row.",
        col: 3,
        row: (r) => r[1] === "ISO/IEC 27000",
      },
      {
        id: "D",
        ask: "Click who uses the worked row that gives an overview of ISMSs with their terms and definitions.",
        why: "Column D says who uses the document. It tells a standard an organisation works to from one written for the bodies that certify it.",
        hint: "Find the row by what it is for, in column C, then read column D on that row.",
        col: 4,
        row: (r) => r[1] === "ISO/IEC 27000",
      },
    ],
  },
  // F1.3 step 1: "Find in them the three parts every finished row has": a category, the effect, the source.
  "F1.3": {
    1: [
      {
        id: "C",
        ask: "Click the category the worked rows give the GDPR and UAVG issue.",
        why: "Column C names the kind of issue: legal, regulatory, technological, market and so on. In step 2 you record one external issue of each of four kinds.",
        hint: "Look in column C, on the row whose issue starts \"GDPR and the UAVG\".",
        col: 3,
        row: (r) => r[1].startsWith("GDPR and the UAVG"),
      },
      {
        id: "D",
        ask: "Click the effect on the ISMS's intended outcomes the worked rows give the NIS2 issue.",
        why: "Column D says what the issue does to what the ISMS must achieve. It is why the issue is on the list at all: Clause 4.1 asks for the issues that affect those outcomes.",
        hint: "Look in column D, on the row whose issue names the Cyberbeveiligingswet.",
        col: 4,
        row: (r) => r[1].includes("Cyberbeveiligingswet"),
      },
      {
        id: "E",
        ask: "Click the source the worked rows give the market issue.",
        why: "Column E names the document and section the issue was read from, so a reviewer can check it. In step 2 you name the section of SITL-ADD-16 you read each issue in.",
        hint: "Look in column E, on the row whose category is Market.",
        col: 5,
        row: (r) => r[3] === "Market",
      },
    ],
  },
  // F2.1 step 1: "find its six parts" in the LearnTech worked scope. Each question names what the part says, not its label.
  "F2.1": {
    1: [
      { id: "units", ask: "Click the statement that says which departments of the office the ISMS covers.", why: "The organisational units: the parts of the organisation whose work is inside the scope. In step 3 you choose Manila's.", hint: "Look in the Statement column, on the row whose part is 1 Organisational units.", col: 2, row: (r) => r[1] === "1 Organisational units" },
      { id: "loc", ask: "Click the statement that says where the ISMS applies.", why: "The location: the office, or offices, the scope covers. A certificate names it.", hint: "Look in the Statement column, on the row whose part is 2 Location.", col: 2, row: (r) => r[1] === "2 Location" },
      { id: "svc", ask: "Click the statement that says what the office delivers to its customers.", why: "The services: what the ISMS protects the delivery of. Clients read this line to see whether their service is covered.", hint: "Look in the Statement column, on the row whose part is 3 Services.", col: 2, row: (r) => r[1] === "3 Services" },
      { id: "tech", ask: "Click the statement that names the systems the office runs on.", why: "The technology: the systems inside the boundary, where the controls will be put in place and tested.", hint: "Look in the Statement column, on the row whose part is 4 Technology.", col: 2, row: (r) => r[1] === "4 Technology" },
      { id: "if", ask: "Click the statement that says what crosses the scope's boundary, and which control governs it.", why: "The interfaces and dependencies (Clause 4.3 c): where the office's work meets work other organisations do, each governed by an Annex A control.", hint: "Look in the Statement column, on the row whose part is 7 Interfaces and dependencies.", col: 2, row: (r) => r[1] === IFACE_PART },
      { id: "excl", ask: "Click the statement that says what is left out of the scope, and why.", why: "The exclusions: each part of the organisation's own activities the scope leaves out, with its justification. A certification body asks for the justification.", hint: "Look in the Statement column, on the row whose part is 5 Exclusions.", col: 2, row: (r) => r[1] === EXCL },
    ],
  },
  // F2.2 step 1: "Rows 4.1 and 4.2 are worked examples with status, level and reason. Read them and the Maturity Model."
  "F2.2": {
    1: [
      { id: "C", ask: "Click the status the worked rows give clause 4.2.", why: "Column C records the status under rule L13: Fully met, Partially met or Not met. 4.2 is Partially met: the parties are recorded, but not all their requirements. In step 2 you rate the other 23 clauses.", hint: "Look in column C, on the 4.2 row.", col: 3, row: (r) => r[0].startsWith("4.2 ") },
      { id: "D", ask: "Click the maturity level the worked rows give clause 4.1.", why: "Column D records the level from the Maturity Model (Ref-Maturity Model, in Learn › Reference pages). 4.1 is done the Group's way in every office and reviewed, but nothing is measured against a target.", hint: "Look in column D, on the 4.1 row.", col: 4, row: (r) => r[0].startsWith("4.1 ") },
      { id: "E", ask: "Click the reason that says why clause 4.2 is not at Level 3.", why: "Level 3 needs the Group's standard way, done in every office and reviewed. The 4.2 register is kept Manila's own way and has never been reviewed, so the Maturity Model's second question is No: Level 2.", hint: "Look in column E, on the 4.2 row: the part about the level.", col: 5, row: (r) => r[0].startsWith("4.2 ") },
    ],
  },
  // T3.1 step 1: "The items are: …". The template has no worked rows: each question is a situation, and its answer is the
  // Clause 5.2 item it tests.
  "T3.1": {
    1: [
      { id: "g", ask: "A client asks for a copy of the information security policy before it signs a contract. Click the item that request tests.", why: "Item g): the policy is available to interested parties, as appropriate. A client is an interested party; the item asks whether, and how, it can obtain the policy.", hint: "A client is outside the organisation. Look for the item about people outside it.", col: 0, row: (r) => r[0].startsWith("g)") },
      { id: "f", ask: "New agents sign at induction that they have read the policy. Click the item that signature is evidence for.", why: "Item f): the policy is communicated within the organisation. A signed acknowledgement is the record that a person was told of it.", hint: "Agents work for the organisation. Look for the item about the people inside it.", col: 0, row: (r) => r[0].startsWith("f)") },
      { id: "a", ask: "A reviewer finds a policy that reads as if copied from another company, with nothing about what this business does. Click the item it fails.", why: "Item a): the policy is appropriate to the purpose of the organisation. A policy written for another business does not fit this one's purpose.", hint: "The question is whether the policy fits the organisation. Look among a) to d), what the policy says.", col: 0, row: (r) => r[0].startsWith("a)") },
    ],
  },
  // T8.2 step 4: "Sprint controls (8) located in T-LI-CIT": T3.2's two worked-row questions, and one sprint 9 control found
  // from what its LI task page asks.
  "T8.2": {
    4: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 7 and 8 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). In step 8 you choose them for six of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "RTO", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.29 to LI-A.5.36). Click the owner role of the control whose page asks for recovery objectives set from the business impact analysis.", why: "Column C holds the control's owner. The page that asks for an RTO and an RPO for each ICT service, set from the business impact analysis, is LI-A.5.30, ICT readiness for business continuity, owned by the Business Continuity & Resilience Analyst.", hint: "Read the first requirement on the LI task pages of the continuity controls, then look in column C.", col: 3, row: (r) => r[1] === "A.5.30" },
    ],
  },
  // T3.2 step 3: "Sprint controls (4) located in T-LI-CIT": the tracker's columns read on its worked row (LearnTech,
  // Amsterdam), and one sprint control found from what its LI task page asks.
  "T3.2": {
    3: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 6 and 7 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). In step 7 you choose them for two of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "SoD", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.1 to LI-A.5.4). Click the owner role of the control whose page asks for a compensating control where duties cannot be split.", why: "Column C holds the control's owner. The page that asks for a compensating control where a small team cannot split its duties is LI-A.5.3, Segregation of duties, owned by the Compliance Manager.", hint: "Read the third requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.5.3" },
    ],
  },
  // T7.1 step 2: "Sprint controls (4) located in T-LI-CIT; dataset SPR-06 open": the worked row's level, the Observed cell
  // of the control that covers leavers, and the owner of the control whose page sets the rule on shared identities.
  "T7.1": {
    2: [
      { id: "E", ask: "Click the maturity level the worked row gives.", why: "Column E holds the level from the Maturity Model's questions. Amsterdam's backups run, are logged and are tested, so the control is Implemented; but they follow Amsterdam's own procedure, never reviewed: Level 2 Managed. In step 4 you set the level of your four controls.", hint: "Look in column E, on the LearnTech row.", col: 7, row: (r) => r[0] === LT },
      { id: "obs", ask: "Click what dataset SPR-06 observed at Manila for the sprint control that covers removing a leaver's access.", why: "The Observed column is the sprint's dataset. Removing a leaver's access is A.5.18 Access rights (its third requirement): its observation says how access is granted, reviewed and removed at Manila. In step 3 you rate each control from its observation.", hint: "Read What it requires on each of your four rows, then click the Observed cell of the row whose requirements mention leavers.", col: 5, row: (r) => r[1] === "A.5.18" },
      { id: "own", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.15 to LI-A.5.18). Click the owner role of the control whose page allows a shared identity only where it is necessary, approved and documented.", why: "Column C holds the control's owner. The page that sets the rule on shared identities is LI-A.5.16, Identity management, owned by the CISO, who also owns the Group IAM at Manila (SITL-ADD-16 Section 8.1).", hint: "Read the second requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.5.16" },
    ],
  },
  // T9.1 step 5: "Sprint controls (14) located in T-LI-CIT": the worked row read, and one sprint control found from what its
  // LI task page asks.
  "T9.1": {
    5: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 8 and 9 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action, and the measure that would show Level 4 (LI-Q2): what is counted, a target and how often. In step 9 you choose them for twelve of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "wipe", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.7.1 to LI-A.7.14). Click the owner role of the control whose page asks for a record for each device whose storage was cleared.", why: "Column C holds the control's owner. The page that asks for a record per device, of what was done to its storage, by whom and when, is LI-A.7.14, Secure disposal or re-use of equipment, owned by the Chief Information Officer.", hint: "Read the third requirement on the LI task pages of the IT controls near the end of the list, then look in column C.", col: 3, row: (r) => r[1] === "A.7.14" },
    ],
  },
  // T9.2 step 3: "Sprint controls (13) located in T-LI-CIT; dataset SPR-11 open": two controls found from what their LI task
  // pages ask, and the row the worked example shares a control with.
  "T9.2": {
    3: [
      { id: "sla", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.8.1 to LI-A.8.17). Click the owner role of the control whose page asks for an SLA test of a sample of findings, the work of step 1.", why: "Column C holds the control's owner. The page whose first sub-task is an SLA test of sampled findings (rule R24) is LI-A.8.8, Management of technical vulnerabilities, owned by the Vulnerability Management Governance Analyst: your VUL-TEST is its evidence.", hint: "Read the sub-tasks on the LI task pages, then look in column C.", col: 3, row: (r) => r[1] === "A.8.8" },
      { id: "obs", ask: "The worked row is A.8.13 at Amsterdam, and one of your rows is the same control. Click what was observed at Manila for it.", why: "Column Observed holds what dataset SPR-11 saw at the office. You will hold it against what A.8.13 requires in step 4, as the worked row did for Amsterdam.", hint: "Find the A.8.13 row that is not the LearnTech one, then look in its Observed column.", col: 5, row: (r) => r[0] !== LT && r[1] === "A.8.13" },
      { id: "oncall", ask: "Click the owner role of the control whose LI task page asks for on-call alerting at Manila.", why: "The page that asks for alerts to be reviewed in business hours with on-call alerting, as SITL-ADD-16 Section 5 sets for Manila, is LI-A.8.16, Monitoring activities, owned by the Chief Information Security Officer.", hint: "Read the third requirement on the LI task pages of the logging and monitoring controls, then look in column C.", col: 3, row: (r) => r[1] === "A.8.16" },
    ],
  },
  "T4.2": {
    // Step 1: "Worked chain read; 3 assets located": the worked chain's links, and one of the learner's three assets.
    1: [
      { id: "vuln", ask: "Click the vulnerability the worked chain records.", why: "The vulnerability is the weakness a threat would use, and it is true today: administrator accounts that sign in with a password alone. In step 2 the best risk statement names it as the cause (rule R06).", hint: "Look in column Vulnerability, on the LearnTech row.", col: 4, row: (r) => r[0] === LT },
      { id: "annex", ask: "Click the Annex A control the worked chain ends at.", why: "Each chain ends at the Annex A control that would treat it: A.8.5 Secure authentication, for accounts that sign in with a password alone. Ref-27002 attributes (Learn › Reference pages) gives every Annex A control's title and attributes.", hint: "Look in column Annex A control, on the LearnTech row.", col: 7, row: (r) => r[0] === LT },
      { id: "info", ask: "Of your three Manila assets, click the one that is an information asset.", why: "An information asset is the information itself: the client's transaction data. The VPN gateway and the workstations are supporting assets, the systems and equipment the information depends on.", hint: "Read column Asset type on your three rows, then click that row's asset.", col: 1, row: (r) => r[1] === "Client transaction data" },
    ],
    // Step 6: "Sprint controls (2) located in T-LI-CIT": as T3.2 step 3, on sprint 3's controls.
    6: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 9 and 10 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). In step 10 you choose them for A.5.6.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "TI", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.6 and LI-A.5.7). Click the owner role of the control whose page asks for threat information to feed the risk assessment.", why: "Column C holds the control's owner. The page that asks for threat intelligence to feed the risk assessment is LI-A.5.7, Threat intelligence, owned by the Cyber Threat Intelligence Analyst (the GRC Charter Section 16 makes that role Responsible for threat intelligence).", hint: "Read the third requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.5.7" },
    ],
  },
  // T6.2 step 3: the tracker located (sprint 5), the LI task pages read; T3.2's prompts, the third on A.6.5's page.
  "T6.2": {
    3: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 6 and 7 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). In step 7 you choose them for five of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "after", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.37 to LI-A.6.7). Click the owner role of the control whose page asks for the responsibilities that stay valid after someone leaves to be defined.", why: "Column C holds the control's owner. The page that asks for the responsibilities that stay valid after someone leaves or changes role is LI-A.6.5, Responsibilities after termination or change of employment, owned by the HR & Workforce Management lead.", hint: "Read the first requirement on each LI task page, then look in column C on that control's row.", col: 3, row: (r) => r[1] === "A.6.5" },
    ],
  },
  // T6.1 step 1: "10 role holders listed": sheet Competence read on its two worked rows, and one of the learner's rows found
  // from the RACI. Step 6: "Sprint controls (1) located in T-LI-CIT; dataset SPR-04 open": the worked row's F and G, and
  // A.6.3's observation.
  "T6.1": {
    1: [
      { id: "proof", ask: "The first worked row's role holder has the competence, but HR holds no proof of it. Click the cell that shows the proof is missing.", why: "Clause 7.2 d) asks for documented information as evidence of competence: what HR holds on file, not what a CV says. In step 2 you hold the two against each other for each of your ten.", hint: "Look along the Sanne Bakker row, in the column of what HR holds.", col: 5, row: (r) => r[1] === "Sanne Bakker" },
      { id: "action", ask: "Click the action the second worked row records for its gap.", why: "Clause 7.2 c): where someone lacks a competence, action is taken and its effect is checked. Here the training is followed by a review of the first campaign. In step 2 you choose an action for every gap or missing record.", hint: "Look in column Action, on the Daan Visser row.", col: 7, row: (r) => r[1] === "Daan Visser" },
      { id: "ceo", ask: "Your LI-RACI makes one role Accountable for the management review. Click that role in your rows.", why: "The competence a role needs follows from what it runs or answers for in your RACI: the Org CEO chairs the management review, so a briefing for top management is what the role needs.", hint: "Read the column Competence the role needs: it says what each role is Responsible (R) or Accountable (A) for.", col: 2, row: (r) => r[0] === GC && r[2] === "Org CEO" },
    ],
    6: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. Your evidence pack (step 9) fills it for A.6.3.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). For A.6.3 the gaps you write in step 9 fill it.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "SPR", ask: "Click what dataset SPR-04 observed at the Manila office for this sprint's control, A.6.3.", why: "The Observed column is dataset SPR-04: what the office does today. In steps 7 and 8 you hold it against what A.6.3 requires and against the Maturity Model.", hint: "Look in the column of what was observed, on the row of this sprint's control.", col: 5, row: (r) => r[1] === "A.6.3" },
    ],
  },
  // T4.1 step 4: "Sprint controls (6) located in T-LI-CIT": the worked row's F and G again (a new sprint, the same columns),
  // and one sprint-2 control found from what its LI task page asks.
  "T4.1": {
    4: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence. In steps 7 and 8 you record yours for A.5.9 to A.5.14.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). In step 8 you choose them for four of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "handover", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.9 to LI-A.5.14). Click the owner role of the control whose page asks that a leaver's knowledge be handed over before they go.", why: "Column C holds the control's owner. The page that asks for a handover of a leaver's knowledge is LI-A.5.11, Return of assets, owned by the HR & Workforce Management lead.", hint: "Read the third requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.5.11" },
    ],
  },
  // T7.2 step 3: "Sprint controls (5) located in T-LI-CIT": the worked row's F and G, and the owner of the control whose LI
  // task page asks for delivered software to be checked (A.5.21), read on the pages.
  "T7.2": {
    3: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 6 and 7 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action: the step that takes the control to Level 3, and the measure that would show Level 4 (LI-Q2). In step 7 you choose them for three of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "Prov", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.19 to LI-A.5.23). Click the owner role of the control whose page asks for the provenance of the software and updates suppliers deliver to be checked.", why: "Column C holds the control's owner. The page that asks for delivered software and updates to be checked is LI-A.5.21, Managing information security in the ICT supply chain, owned by the Security Architecture & Standards Manager.", hint: "Read the third requirement on each sprint control's LI task page, then look in column C of that control's row.", col: 3, row: (r) => r[1] === "A.5.21" },
    ],
  },
  // T10.2 step 4: "Sprint controls (10) located in T-LI-CIT; dataset SPR-13 open": the worked row's F and G, and one sprint-13
  // control found from what its LI task page asks.
  "T10.2": {
    4: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence. In steps 7 and 8 you record yours for A.8.25 to A.8.34.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action and the measure that would show Level 4 (LI-Q2). In step 8 you choose them for eight of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "testdata", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.8.25 to LI-A.8.34). Click the owner role of the control whose page asks that test information be deleted once testing ends.", why: "Column C holds the control's owner. The page that asks for test information to be deleted after testing is LI-A.8.33, Test information, owned by the Data Protection Officer (DPO): test copies often hold personal data.", hint: "Read the third requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.8.33" },
    ],
  },
  // T10.1 step 3: "Sprint controls (11) located in T-LI-CIT; dataset SPR-12 open": three cells of the learner's own rows, each
  // found by reading the LI task pages or the tracker's columns.
  "T10.1": {
    3: [
      { id: "guest", ask: "Click the title of the control whose requirements keep guest and wireless networks apart from the internal zones.", why: "The What it requires column numbers each control's requirements from its LI task page. A.8.22, Segregation of networks, asks for zones, traffic between them only where needed, and guest networks kept apart.", hint: "Read the What it requires column on your sprint's rows, then look in column B.", col: 2, row: (r) => r[1] === "A.8.22" },
      { id: "keys", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.8.9 to LI-A.8.24). Click the owner role of the control whose page asks for keys to be rotated, and destroyed when retired.", why: "Column C holds the control's owner. The page that asks for keys to be managed through their life, rotation and destruction included, is LI-A.8.24, Use of cryptography, owned by the CISO.", hint: "Read the second requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.8.24" },
      { id: "masking", ask: "Click what SPR-12 observed for the control whose LI task page asks for the logs of the masking runs.", why: "The Observed column is dataset SPR-12, what was seen at the Manila office. LI-A.8.11, Data masking, lists the masking-run logs as its sub-task 03. Steps 4 and 5 rate each control from this column.", hint: "Read the sub-tasks in the table of each LI task page, then look in the Observed column.", col: 5, row: (r) => r[1] === "A.8.11" },
    ],
  },
  // T8.1 step 1: "Scenario and 6 injects read": three facts found in the injects (a Manila time read as UTC, an owner, the
  // data taken). Step 5: the sprint's tracker located, as T3.2 step 3.
  "T8.1": {
    1: [
      { id: "utc", ask: "The record keeps every time in UTC. Manila is UTC+8. Click the UTC time of the inject that happened at 11:20 Manila time.", why: "11:20 at UTC+8 is 03:20 UTC: eight hours earlier. SITL-POL-014 Section 7.1 asks for times in UTC, and the notification deadlines of rule R30 are counted in UTC.", hint: "Take eight hours off 11:20, then look in the UTC time column.", col: 1, row: (r) => r[0] === "INJ-3" },
      { id: "owner", ask: "Click the owner of the inject in which the laptop is cut off from the network.", why: "The Owner column says who acts on each inject. Cutting the laptop off is done by the incident response team, with Manila IT.", hint: "Find the inject that says the laptop is cut off, then look in its Owner cell.", col: 5, row: (r) => r[0] === "INJ-4" },
      { id: "data", ask: "Click the cell that says how many people's personal data the file held.", why: "INJ-5 gives what was taken: 2,400 customers in the Philippines, with their names, mobile numbers and account numbers. Who they are and where they live decide which notification regimes apply (step 4).", hint: "Read the What happens column for the inject about what the file held.", col: 2, row: (r) => r[0] === "INJ-5" },
    ],
    5: [
      { id: "F", ask: "Click the evidence ref the worked row gives.", why: "Column F names the files in 02_Working that hold the control's evidence, so they can be handed to an auditor. In steps 8 and 9 you record yours.", hint: "Look in column F, on the LearnTech row.", col: 8, row: (r) => r[0] === LT },
      { id: "G", ask: "Click the cell where the worked row says what it would measure at Level 4.", why: "Column G holds the gap or the next action, and the measure that would show Level 4 (LI-Q2). In step 9 you choose them for five of your controls.", hint: "Look in column G, on the LearnTech row.", col: 9, row: (r) => r[0] === LT },
      { id: "auth", ask: "Each sprint control has an LI task page in Learn › Reference pages (LI-A.5.5 to LI-A.6.8). Click the owner role of the control whose page asks for the contacts at the authorities to be kept current.", why: "Column C holds the control's owner. The page that asks for the authorities' contact details, and the people who contact them, to be kept current is LI-A.5.5, Contact with authorities, owned by the DPO.", hint: "Read the second requirement on each LI task page, then look in column C.", col: 3, row: (r) => r[1] === "A.5.5" },
    ],
  },
  // T5.1 step 1: "Read the two worked rows; 3 risks listed": what a finished row holds, read on the LearnTech rows, and one of
  // the learner's own risks located.
  "T5.1": {
    1: [
      { id: "ids", ask: "Click the Annex A IDs the worked rows give the risk that is modified.", why: "Column Annex A IDs records, by ID, the Annex A controls that the chosen controls match (Clause 6.1.3 c). In step 3 you compare the controls your modified risk needs with Annex A.", hint: "Look in column Annex A IDs, on the LearnTech row whose option is Modify.", col: 6, row: (r) => r[1] === RTP_LT[0] },
      { id: "due", ask: "Click the due date the worked rows give the risk that is retained.", why: "A retained risk is kept as it is and monitored: there is no treatment to finish, so it has no due date (rule R08). Its acceptance request has an expiry and a re-assessment date instead. In step 6 you set your due dates.", hint: "Look in column Due date (R08), on the LearnTech row whose option is Retain.", col: 8, row: (r) => r[1] === RTP_LT[1] },
      { id: "res", ask: "Click the residual rating of your Manila risk on the remote-access VPN gateway.", why: "Column Residual holds the score and rating from RR-UPD, after the existing controls that work. The option (rule L12) and the due date (rule R08) are decided from it.", hint: "Look in column Residual, on the R-16-HQ-16 row.", col: 9, row: (r) => r[1] === "R-16-HQ-16" },
    ],
  },
  // T5.2 step 1: the SoA opened, its worked row's source and inclusion found, one carried-over status; step 6: the tracker's
  // sprint 4a row and an earlier sprint's row found.
  "T5.2": {
    1: [
      { id: "src", ask: "Click the source the worked row records for its control.", why: "The Source column says what calls for the control: a risk, a legal or contractual requirement, or a business need (rule L06). The worked row's facts name the school data processing agreements, a contract: Contractual requirement. In step 2 you choose the source for each of Manila's controls.", hint: "Look in the Source column, on the LearnTech row.", col: 5, row: (r) => r[0] === LT },
      { id: "inc", ask: "Click the cell that says why the worked row's control is included.", why: "Clause 6.1.3 d) asks the SoA for the justification of every control it includes, and of every Annex A control it excludes. Yours are written from the applicability and source you choose in step 2.", hint: "Look along the LearnTech row: there are two justification columns, one for inclusion and one for exclusion.", col: 6, row: (r) => r[0] === LT },
      { id: "carry", ask: "Your sprint 1 tracker (T3.2) found one control Not implemented. Click its Implemented? cell in the SoA.", why: "Implemented? is carried over from your tracker's column D for the controls already sprinted (rule L07): A.5.3 Segregation of duties, Not implemented. A control whose sprint is still to come says when it is planned.", hint: "Look in the Implemented? column, on the rows A.5.1 to A.5.4.", col: 8, row: (r) => r[0] === GC && r[1] === "A.5.3" },
    ],
    6: [
      { id: "own", ask: "Click the owner role of this sprint's control, A.5.8.", why: "Column C holds the control's owner: for A.5.8 the Cybersecurity Program Manager, as its LI task page, LI-A.5.8, says.", hint: "Look in column C, on the A.5.8 row.", col: 3, row: (r) => r[1] === "A.5.8" },
      { id: "obs", ask: "Click the cell that holds what dataset SOA-93 observed at Manila for A.5.8.", why: "The Observed column is the sprint's dataset: here SOA-93's facts about A.5.8. Steps 7 and 8 rate it against what LI-A.5.8 requires.", hint: "Look in the Observed at Manila column, on the A.5.8 row.", col: 5, row: (r) => r[1] === "A.5.8" },
      { id: "s1", ask: "The tracker keeps every earlier sprint's rows. Click the status sprint 1 gave A.5.4.", why: "Earlier sprints' rows show, read-only, as their own tracker stands: A.5.4 Management responsibilities, Implemented, from T3.2. The SoA carries the same values over.", hint: "Look in column D, on the A.5.4 row.", col: 6, row: (r) => r[1] === "A.5.4" },
    ],
  },
  // T11.1 step 1: "read the LearnTech worked measure card": three of its fields found by what they are for.
  "T11.1": {
    1: [
      { id: "who", ask: "Click the cell that says who analyses and evaluates the results.", why: "Clause 9.1 asks for who measures (d) and who analyses and evaluates (f), each named. Here the Security Awareness & Training Specialist measures, and the Compliance Manager, with the Org CISO, judges the result and reports it: the one who runs the campaign does not mark it alone.", hint: "Look along the worked card's row for the column about analysing and evaluating, not the one about measuring.", col: 11, row: (r) => r[0] === LT },
      { id: "how", ask: "Click the cell that says how the value is calculated.", why: "The method gives the numerator and the denominator. Written down, it lets anyone count the same records and get the same value: the result is comparable from one campaign to the next and reproducible by someone else.", hint: "Look for the cell with a ÷ in it.", col: 6, row: (r) => r[0] === LT },
      { id: "act", ask: "Click the cell that says when management must act on the result.", why: "The threshold is the value past which management acts: below 50% the report rate is red. Between the threshold and the target it is amber, a warning; at the target or above, green.", hint: "Look for the cell that names a threshold.", col: 5, row: (r) => r[0] === LT },
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
export const LADDER: Record<string, Record<number, Ladder>> = {};
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
/** A question answered in its row, with no register of its own to carry `reads`. */
const ROW_READS: Record<string, string[]> = {
  // F1.2 step 5 is answered from Clause 6.1.3's summary (step 3 from the map, through step 2's View).
  "F1.2-5": ["learn|Framework Quick Reference"],
  // F1.3 steps 4–6: each question is answered from the Clause 4.1, Amd 1:2024 and Clause 4.2 summaries.
  "F1.3-4": ["learn|Framework Quick Reference"],
  "F1.3-5": ["learn|Framework Quick Reference"],
  "F1.3-6": ["learn|Framework Quick Reference"],
  // F2.1 steps 2 and 4: both questions are answered from the Clause 4.3 summary.
  "F2.1-2": ["learn|Framework Quick Reference"],
  "F2.1-4": ["learn|Framework Quick Reference"],
  // F2.2 step 4: 6.1.2's level, from the Maturity Model (Learn › Reference pages, Ref-Maturity Model).
  "F2.2-4": ["learn|Reference pages"],
  // T3.1 step 4: who approves the policy, from the Clause 5.2 summary (step 3 reads SITL-POL-000 Section 7, a cited document).
  "T3.1-4": ["learn|Framework Quick Reference"],
  // T3.2 step 8: the small finance team, from what A.5.3 requires (its LI task page, Learn › Reference pages).
  "T3.2-8": ["learn|Reference pages"],
  // T10.2 step 10: the developers' access, held against what each control requires (its LI task page, Learn › Reference pages).
  "T10.2-10": ["learn|Reference pages"],
  // T8.1 step 10: the unreported e-mail, answered from what A.6.8 requires (its LI task page).
  "T8.1-10": ["learn|Reference pages"],
  // T8.2 steps 2 and 9: the CRM's DR result and the independent review, from what A.5.30 and A.5.35 require (their LI task pages).
  "T8.2-2": ["learn|Reference pages"],
  "T8.2-9": ["learn|Reference pages"],
  // T7.1 step 8: the shared support account, from what A.5.16 requires (its LI task page, Learn › Reference pages).
  "T7.1-8": ["learn|Reference pages"],
  // T9.1 step 3: the water threat, from what A.7.5 requires (its LI task page). Step 4 reads SITL-STD-001 Section 6, a cited document.
  "T9.1-3": ["learn|Reference pages"],
  // T9.2 step 2: the class and its days, from rule R24 on Ref-Test rules; step 9: what A.8.15 requires (its LI task page).
  // Step 8 reads SITL-POL-009 Section 4, a cited document (its dot is on the Policy Library).
  "T9.2-2": ["learn|Reference pages"],
  "T9.2-9": ["learn|Reference pages"],
  // T6.1 steps 3 and 4: what Clause 7.2 retains, and what Clause 7.3 makes people aware of, from their summaries.
  "T6.1-3": ["learn|Framework Quick Reference"],
  "T6.1-4": ["learn|Framework Quick Reference"],
  // T6.2 step 8: the contractor who started before screening, from what A.6.1 requires (LI-A.6.1, Learn › Reference pages).
  "T6.2-8": ["learn|Reference pages"],
  // T4.1 steps 2 and 3: Clause 6.1.2's summary; step 9: what A.5.9 requires (LI-A.5.9) and the Manila asset extract; step 10
  // reads SITL-STD-001 Sections 2 and 5 (a cited document, its own dot).
  "T4.1-2": ["learn|Framework Quick Reference"],
  "T4.1-3": ["learn|Framework Quick Reference"],
  "T4.1-9": ["learn|Reference pages", "risk|Asset Register"],
  // T5.1 steps 4 and 5: a control from outside Annex A, and who approves the plan, from the Clause 6.1.3 summary.
  "T5.1-4": ["learn|Framework Quick Reference"],
  "T5.1-5": ["learn|Framework Quick Reference"],
  // T11.1 steps 2 and 3: Clause 9.1's summary; step 5: Level 4 against Level 3, from the Maturity Model.
  "T11.1-2": ["learn|Framework Quick Reference"],
  "T11.1-3": ["learn|Framework Quick Reference"],
  "T11.1-5": ["learn|Reference pages"],
};
export const stepReads = (taskId: string, n: number): string[] => regOf(taskId, n)?.reads?.[n] ?? briefOf(taskId, n)?.reads?.[n] ?? ROW_READS[`${taskId}-${n}`] ?? [];

// The learner's organisation names and mentee ID (lib/desk/names.ts): the content above, rewritten in place.
localizable(REGISTERS, BRIEFS, STUDY, LADDER, DECIDE_FROM, ROW_READS);
// The LI101 task data files (rows, observations, datasets) name the canonical organisations too: same swap.
localizable(SPRINT_DATA, KPI_DATA, T102_DATA, T122_DATA, SOA_DATA, T61_DATA, PHY_DATA, CFG_DATA, TTX_DATA, T92_DATA);
