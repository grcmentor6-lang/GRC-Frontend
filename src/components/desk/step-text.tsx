"use client";

import { Fragment, useMemo, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { ORG_TONE, type OrgKey } from "@/lib/desk/org-tone";
import { deskIdentityNow } from "@/lib/desk/names";

/**
 * How a step's words are set on the desk (owner, 4–5 Nov 2026): say what to do, once, plainly.
 *
 * - A toolbar path is drawn as a chip in ONE place per view — the step's "where" (the Where column, the tool
 *   window's top bar) — and stays plain text everywhere else, so the eye is sent to one place, not four.
 * - An instruction is split into its sentences. Sentences that tell you to do something are numbered and
 *   set dark; sentences that only explain sit between them in quiet type, so the actions read as a list.
 */

/** One toolbar path, set as a chip: section › tool. */
export function PathChip({ path, wrap = false }: { path: string; wrap?: boolean }) {
  const parts = path.split(/\s*›\s*/);
  return (
    <span className={`mx-0.5 inline-flex max-w-full items-center gap-1 ${wrap ? "flex-wrap" : "whitespace-nowrap"} rounded border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-px align-baseline text-[0.92em] font-semibold leading-[1.45] text-[#3730A3]`}>
      <Icon name="grid" size={11} className="shrink-0 opacity-70" />
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <Icon name="chevronRight" size={11} className="shrink-0 opacity-60" />}
          <span className={wrap ? "" : "truncate"}>{p}</span>
        </Fragment>
      ))}
    </span>
  );
}

// The pack's instructions open each action with its verb ("Check each value…", "Open the file…"), or with a
// short lead before it ("For each rejected item, choose…"). Anything else explains rather than instructs.
const VERBS =
  "add|answer|apply|bring|change|check|choose|click|compare|complete|copy|correct|count|decide|do|fill|find|give|list|mark|match|name|open|pick|place|put|read|record|repeat|save|select|start|submit|test|tick|type|use|walk|work|write";
export const ACTION = new RegExp(`^(?:(?:${VERBS})\\b|(?:for each|for every|in|with|before|then|if|once|when|after)\\b[^.]*?,\\s*(?:then\\s+)?(?:${VERBS})\\b|then\\s+(?:${VERBS})\\b)`, "i");

/** Sentences, kept whole across "e.g." and "i.e.". */
export function sentences(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(/(?<=[.!?]["”’]?)\s+(?=[A-Z0-9"“(<*▶])/)) {
    if (out.length && /\b(e\.g|i\.e)\.$/i.test(out[out.length - 1])) out[out.length - 1] += ` ${part}`;
    else out.push(part);
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * A step's instruction: actions numbered and dark, explanations quiet between them. `opened`: the step is
 * shown inside its tool window, where the file or screen it says to open is already in front of the learner
 * and the window's top bar names whatever opens beside it, so "Open …" sentences are dropped.
 */
export function StepInstruction({ text, opened = false, className = "" }: { text: string; opened?: boolean; className?: string }) {
  const lines = useMemo(() => {
    const ls = sentences(text).filter((s) => !(opened && /^open\b/i.test(s))).map((s) => ({ s, act: ACTION.test(s) }));
    // Every step reads as a list (owner, 11 Nov 2026): an instruction with no verb-led sentence still leads with its first.
    if (ls.length && !ls.some((l) => l.act)) ls[0].act = true;
    return ls;
  }, [text, opened]);
  if (!lines.length) return null;
  const acts = lines.filter((l) => l.act).length;
  let n = 0;
  return (
    <ol className={`flex flex-col gap-1.5 ${className}`}>
      {lines.map(({ s, act }, i) =>
        act ? (
          <li key={i} className="flex gap-2.5 text-[14px] leading-[1.6] text-[#111827]">
            {/* Numbered when there is an order to follow; one action alone gets a bullet. */}
            {acts > 1 ? (
              <span className="mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#4338CA] text-[10.5px] font-bold text-white tabular-nums">{++n}</span>
            ) : (
              <span aria-hidden className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#4338CA]" />
            )}
            <span className="min-w-0"><Marked text={s} /></span>
          </li>
        ) : (
          <li key={i} className="pl-[28px] text-[12.5px] leading-[1.55] text-[#6B7280]"><Marked text={s} /></li>
        ),
      )}
    </ol>
  );
}

// What to look at and what to press, picked out of the instruction and the guide cards alike (owner, 11 Nov 2026):
// documents and their sections in amber, the platform's buttons drawn as buttons, toolbar sections and tools as
// indigo-tinted text (the path's chip stays in its one place per view), columns, rows, fields and values in a quiet
// tint, codes as mono chips, the orange "Step N" tag as the tag, the learner's organisations in their own colour.
// Bold in a guide means "look at this": `**x**` is classified the same way, and only a whole emphasised sentence
// ("**The two dates are yours.**", "**Never share MFA codes**") stays plain bold.

/** The toolbar's sections and their tools, as `desk.sections` names them (step-text.test.ts holds them to sample.json). */
export const SECTIONS = ["Home", "Evidence", "Frameworks", "Access Reviews", "Risk Register", "Vendors", "Control Testing", "Policies", "Awareness", "Regulatory Watch", "Learn", "Inbox", "Systems"];
export const TOOLS = [
  "My plan", "My Tasks", "Waiting On", "Assessor Notes", "Calendar", "My Organisation", "My Scores",
  "Capture Screenshot", "Import Log / Report", "Upload Config File", "Link to Control", "Request Evidence", "Evidence Library", "Audit Requests (PBC)", "Defect Codes",
  "Framework Library", "Map Control", "Crosswalk View", "Gap Finder", "Export Mapping",
  "Start Review", "Generate Sample", "Privilege Check", "Terminated User Check", "Reviewer Sign-off", "Track Remediation",
  "New Risk", "Score Risk", "Assign Owner", "Mitigation Tracker", "Heat Map with KRIs", "Asset Register",
  "Vendor Intake", "Set Risk Tier", "Send Questionnaire", "SOC Report Review", "Contract & DPA Check", "Flag Risk", "Reassessment Reminder",
  "Test Plan", "Patch Timeline Check", "Vulnerability Remediation Check", "Configuration Check", "Restore Test Review", "Record Result", "Raise Finding",
  "Policy Library", "New from Template", "Review & Redline", "Map to Framework", "Send for Approval", "Version History", "Policy Exceptions",
  "Content Templates", "Newsletter Builder", "Phishing Campaign Planner", "Campaign Results",
  "Regulation Tracker", "Add Update", "Briefing Builder", "Impact Log", "Obligations Register", "RoPA & Data Flows", "Breach Clock Calculator",
  "Framework Quick Reference", "Glossary", "Business Risk Translator", "Stakeholder Directory", "Skills Tracker", "Working time", "Rule tables", "Sentence frames", "Knowledge Checks", "Reference pages",
  "AppAdmin", "NetShield", "LedgerSim", "DataSentry", "LogLens",
];
/** Learn › Reference pages, by name (`desk.pages`), and the documents named by a word rather than a code. */
export const PAGES = [
  "Ref-Rules", "Ref-Actions", "Ref-Frames", "Ref-Questions", "Ref-Clauses", "Ref-SOC checks", "Ref-Conditions", "Ref-Content", "Ref-Keywords", "Ref-SoA exclusions", "Ref-Sampling",
  "Ref-Defect codes", "Ref-Test rules", "Ref-Work log fields", "Ref-Chain", "Ref-27002 attributes", "Ref-27000 family", "Ref-Certification card", "Ref-Clause map", "Ref-Locations",
  "Ref-ISMS processes", "Ref-Leadership", "Ref-Competence", "Ref-Communications", "Ref-Cloud", "Ref-UAR codes", "Ref-Objectives", "Ref-Milestones", "Ref-Change types",
  "Ref-Review inputs", "Ref-Measure card", "Ref-5-Whys", "Ref-Templates", "Ref-Capability map", "RA-36 Risk register (HQ Istanbul)", "TSA-36 Control_Mapping", "TSA-36 Roadmap",
  "Ref-UAR test plan", "TSA-36 Technology_Stack",
];
const DOC_WORDS = ["Charter", "Defect Codes"];

/** The platform's buttons, as the desk components label them. Marked wherever they appear. */
const BUTTONS = [
  "Check my answers", "Check my answer", "Mark step complete", "Mark complete", "Submit task", "Submit attempt", "Submit again", "Next step",
  "▶ Show me how", "Show me how", "Report a problem", "Report data issue", "Check consistency again", "Check consistency", "Check this capture",
  "Put back a row", "Record Tier [N\\d]", "Record (?:Pass|Accept|Reject|Fails?)", "Try again", "Answer again", "Start the check", "Close tool",
  "Type instead", "Draw instead", "Clear filters", "Capture evidence", "Open and sign", "Back to step", "Open Inbox", "Show the \\d+ worked rows?",
  "None of my items shows unmasked data",
];
/** Labels that are also ordinary words: a button only when bold, quoted, or after "click"/"press"/… */
const SHORT_BUTTONS = "Save|Sign|Submit|Upload|Send|Reply|Edit|View|Open|Next|Back|Record|Accept|Reject|Fails|Skip|Keep|Close|Clear|Got it|Show me";
const VERB = "(?:[Cc]lick|[Pp]ress|[Tt]ap|[Ss]elect)\\s+(?:the\\s+|on\\s+)?";
const alt = (xs: string[]) => [...xs].sort((a, b) => b.length - a.length).map(esc).join("|");
function esc(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

const NUM = "\\d+(?:\\.\\d+)*";
const RANGE = `${NUM}(?:\\s*(?:[–-]|to|and|,)\\s*${NUM})*`;
const DOC = [
  `\\bBKB-[A-Z]+-\\d+[A-Z]?(?:\\s+Sections?\\s+${RANGE})?`,
  `\\bSections?\\s+${RANGE}(?:, step \\d+)?`,
  `\\bSheets?\\s+\\d+(?:\\s*(?:[–-]|to|and)\\s*\\d+)?`,
  `\\b[Cc]lauses?\\s+${RANGE}`,
  `\\bAnnex [A-Z]\\b`,
  `\\bA\\.\\d+(?:\\.\\d+)+(?:\\s*(?:[–-]|to|and)\\s*A\\.\\d+(?:\\.\\d+)+)?\\b`,
  `\\bArticles?\\s+${RANGE}`,
  `(?<![\\w-])(?:${alt(PAGES)})(?![\\w-])`,
  `\\bRef-[A-Z0-9][\\w-]*`,
  `\\b[A-Z][a-z]+_[A-Z][\\w]*\\b`,
].join("|");
const BTN = [
  `(?<![\\w-])(?:${BUTTONS.join("|")})(?![\\w-])`,
  `(?<=${VERB}["“]?)(?:${SHORT_BUTTONS})\\b`,
  `(?<=\\b(?:[Aa]nswer|[Cc]lick|[Pp]ress|[Cc]hoose|[Pp]ick|Yes or|No or)\\s+)(?:Yes|No)\\b`,
  `\\bOpen [\\w' ]{1,40} →`,
  // The guide's own Next: "Next unlocks once it is right".
  `\\bNext(?= (?:unlocks|opens|is|stays|turns|becomes|→))`,
  `\\bSubmit(?= (?:opens|is|hands|stays|unlocks|does))`,
  // "click its Accept/Reject" is the cell's toggle. A bare "Accept or Reject" is a value (FIELD).
  `(?<=\\bits )Accept\\/Reject\\b`,
].join("|");
// A section, then "› Tool" (the tool's own name, or capitalised words for a deeper level).
const PATH = `\\b(?:${alt(SECTIONS)})(?: › (?:${alt(TOOLS)}|[A-Z][\\w&'-]*(?: (?:&|[A-Z][\\w&'-]*))*))+`;
// A tool by name anywhere; a section where it is clicked or opened ("Click Policies", "from the Inbox").
const TOOL = `(?<![\\w-])(?:${alt(TOOLS)})(?![\\w-])|(?<=${VERB}|\\b(?:[Oo]pen|in|from) the )(?:${alt(SECTIONS)})\\b(?! [a-z]+ frame\\b)`;
// "One A4 page" is paper, not a code; a hash name (SHA-256) is a value, shaded as one.
const CODE = `\\b(?!SHA-)(?:[A-Z](?:-[A-Z0-9]{2,}){2,}|[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+|T-[A-Z]{2,}|[FT]\\d{1,2}\\.\\d|[A-Z]{1,3}\\d{1,3}(?! pages?\\b))\\b`;
const FIELD = `\\bSHA-\\d+\\b|\\b(?:Accept|Reject)(?= or (?:Accept|Reject)\\b)|(?<=\\b(?:Accept|Reject) or )(?:Accept|Reject)\\b|(?<=\\bthe )[A-Z][\\w-]*(?: [a-z]+)* frame\\b|(?<![\\w.])\\.(?:xlsx|docx|pdf|csv)\\b|\\bOrg [AB]\\b|\\b[A-Z]-\\d{2,3}\\b|\\bcolumns?\\s+[A-Z](?:\\s*(?:to|and|[–-])\\s*[A-Z])?\\b|\\b[Rr]ows?\\s+\\d+(?:\\s*(?:to|and|[–-])\\s*\\d+)?\\b`;
const TAG = `(?<=\\btagged )Step \\d+`;
const whole = (re: string) => new RegExp(`^(?:${re})$`);
const [IS_BUTTON, IS_DOC, IS_CODE, IS_FIELD, IS_PATH, IS_TOOL] = [
  whole(`${BUTTONS.join("|")}|${SHORT_BUTTONS}|Open [^.]{1,40}`), whole(`${DOC}|${alt(DOC_WORDS)}`), whole(CODE), whole(FIELD), whole(PATH), whole(`${alt(TOOLS)}|${alt(SECTIONS)}|Learn & Grow`),
];

const SHORT = whole(SHORT_BUTTONS);
/** A phrase that opens with a document or its part: "BKB-POL-006 Section 3.1 bullet 5", "A.5.18 Access rights". */
const DOC_LED = new RegExp(`^(?:${DOC})\\b`);

export type MarkKind = "text" | "doc" | "btn" | "path" | "field" | "code" | "tag" | "bold" | "org";
export type MarkPart = { kind: MarkKind; text: string; org?: OrgKey };

/** What a bold or quoted phrase is, as a whole. `before`: the text just ahead of it ("click **X**", "**Yes** or **No**"). */
function classify(inner: string, before: string, quoted: boolean): MarkKind {
  // No bare Accept/Reject button exists (it is "Record Accept"); "marked **Reject**" is a column value.
  if (/^(?:Accept|Reject)$/.test(inner) && !new RegExp(`${VERB}["“]?$`).test(before)) return "field";
  // "Choose **Document** or **Record**": an option to pick, not the button of the same name.
  if (IS_BUTTON.test(inner) && !(SHORT.test(inner) && /\b(?:choose|pick|gets?|or|is|as)\s+(?:\*\*)?["“]?$/i.test(before))) return "btn";
  if (/^(?:Yes|No)$/.test(inner) && /\b(?:answer|click|choose|press|tap|pick|or)\s+(?:\*\*)?["“]?$/i.test(before)) return "btn";
  if (IS_DOC.test(inner) || DOC_LED.test(inner)) return "doc";
  if (IS_PATH.test(inner) || IS_TOOL.test(inner)) return "path";
  if (IS_CODE.test(inner)) return "code";
  if (IS_FIELD.test(inner)) return "field";
  // Whatever else is clicked is a button: "click **Show the 2 worked rows**".
  if (new RegExp(`\\b${VERB}["“]?$`).test(before)) return "btn";
  if (quoted) return "field";
  // A whole sentence set bold is emphasis, not a thing to find.
  return (/[.!?]$/.test(inner) && inner.split(" ").length > 2) || /^(?:Never|Always|Do not|Don't|Don’t)\b/.test(inner) ? "bold" : "field";
}

const reCache = new Map<string, RegExp>();
function markRe(orgs: string[]): RegExp {
  const key = orgs.join("|");
  let re = reCache.get(key);
  if (!re) {
    re = new RegExp(
      [
        `\\*\\*(?<bold>.+?)\\*\\*`,
        `(?<quote>"[^"]{2,60}"|“[^”]{2,60}”)`,
        ...(orgs.length ? [`(?<org>\\b(?:${orgs.map(esc).join("|")})\\b)`] : []),
        `(?<path>${PATH})`,
        `(?<doc>${DOC})`,
        `(?<btn>${BTN})`,
        `(?<tool>${TOOL})`,
        `(?<tag>${TAG})`,
        `(?<code>${CODE})`,
        `(?<field>${FIELD})`,
      ].join("|"),
      "g",
    );
    reCache.set(key, re);
  }
  return re;
}

/** The learner's organisations, longest name first. */
const orgNames = (): { name: string; k: OrgKey }[] =>
  (deskIdentityNow().orgs ?? []).flatMap((o) => [{ name: o.name, k: o.key }, { name: o.short, k: o.key }]).sort((a, b) => b.name.length - a.name.length);

/** A string cut into what to look at, what to press and plain text. Pure, so it can be checked without a browser. */
export function markParts(text: string): MarkPart[] {
  // A rail lead that is only a button's name ("Reply", "Record").
  if (SHORT.test(text)) return [{ kind: "btn", text }];
  const orgs = orgNames();
  const out: MarkPart[] = [];
  let last = 0;
  for (const m of text.matchAll(markRe(orgs.map((o) => o.name)))) {
    const g = m.groups ?? {};
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "text", text: text.slice(last, at) });
    if (g.bold !== undefined) out.push({ kind: classify(g.bold, text.slice(0, at), false), text: g.bold });
    else if (g.quote) {
      const k = classify(g.quote.slice(1, -1), text.slice(0, at), true);
      // A quoted button reads as the button; a quoted value keeps its quotes inside the tint.
      out.push({ kind: k, text: k === "btn" ? g.quote.slice(1, -1) : g.quote });
    } else if (g.org) out.push({ kind: "org", text: g.org, org: orgs.find((o) => o.name === g.org)?.k });
    else out.push({ kind: g.doc ? "doc" : g.btn ? "btn" : g.path || g.tool ? "path" : g.tag ? "tag" : g.code ? "code" : "field", text: m[0] });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

const MARK_CLASS: Record<Exclude<MarkKind, "text" | "org" | "bold">, string> = {
  tag: "whitespace-nowrap rounded-[3px] bg-[#FDE7B8] px-1.5 py-px text-[0.92em] font-semibold text-[#78350F]",
  doc: "whitespace-nowrap rounded-[3px] bg-[#FEF3C7] px-1 font-semibold text-[#111827]",
  btn: "whitespace-nowrap rounded-[5px] border border-[#C7CBF5] bg-white px-1.5 py-px text-[0.92em] font-semibold text-[#3730A3] shadow-[0_1px_0_#DDE1E8]",
  path: "rounded-[3px] bg-[#EEF0FF] px-1 font-semibold text-[#3730A3] [box-decoration-break:clone]",
  field: "rounded-[3px] bg-[#EDF1F6] px-1 font-semibold text-[#1F2937] [box-decoration-break:clone]",
  code: "whitespace-nowrap rounded-[3px] border border-[#DDE1E8] bg-[#F7F8FA] px-1 py-px font-mono text-[0.86em] font-semibold text-[#3F4757]",
};

/** An instruction's or a guide card's text with what to look at and what to press set apart. */
export function Marked({ text }: { text: string }) {
  return (
    <>
      {markParts(text).map((p, i) =>
        p.kind === "text" ? <Fragment key={i}>{p.text}</Fragment>
        : p.kind === "bold" ? <strong key={i} className="font-semibold text-[#111827]"><Marked text={p.text} /></strong>
        : p.kind === "org" ? (
          <mark key={i} className="rounded-[3px] px-1 font-semibold [box-decoration-break:clone]" style={p.org ? { color: ORG_TONE[p.org].text, background: ORG_TONE[p.org].tint } : undefined}>{p.text}</mark>
        ) : p.kind === "btn" ? <span key={i} className={MARK_CLASS.btn}>{p.text}</span>
        : p.kind === "code" ? <code key={i} className={MARK_CLASS.code}>{p.text}</code>
        : <mark key={i} className={MARK_CLASS[p.kind]}>{p.text}</mark>,
      )}
    </>
  );
}

/** A step's "where": its toolbar path as a chip, or the plain place when it is not one. `wrap` for a narrow
 *  column, where a one-line chip would cut both names to "Frame… › Framework…". */
export function Where({ tool, wrap = false }: { tool: string; wrap?: boolean }): ReactNode {
  return /›/.test(tool) ? <PathChip path={tool} wrap={wrap} /> : tool;
}
