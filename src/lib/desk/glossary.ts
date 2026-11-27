import G from "./glossary.json";
import SPRINT_DATA from "./li-sprints.json";
import { localizable } from "./names";

/**
 * The desk's glossary (UX101 W5): one data file (glossary.json) plus a few families whose names come from the pack's own
 * data (rules, tasks, documents, controls, deliverables, templates, datasets, roles), so a rule's title is never typed twice.
 * `lookup(token)` is what the hover definitions, the Glossary page and glossary.test.ts all use.
 */
export type GLink = { tool?: string; page?: string; doc?: string; label: string };
export type GEntry = {
  id: string; name: string; group: string; def: string;
  forms?: string[]; pattern?: string; derive?: string; inline?: boolean; where?: string; link?: GLink;
};

type Loose = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const DATA = G as unknown as { skip: string[]; entries: GEntry[] };
localizable(DATA);

let DESK: Loose | null = null;
/** The learner's desk content, set once loaded: the derived families read their titles from it. */
export function setGlossaryDesk(d: unknown): void { DESK = d as Loose; }

const THEME: Record<string, string> = { "5": "organisational", "6": "people", "7": "physical", "8": "technological" };
const ROLE_TXT = (x: string) => x.replace(/\.$/, "");

type Derive = (tok: string, d: Loose) => Partial<GEntry> | null;
const DERIVE: Record<string, Derive> = {
  rule: (t, d) => {
    const r = d.rules?.[t];
    return r ? { name: `Rule ${t}: ${ROLE_TXT(r[0])}`, def: `${t[0] === "R" ? "A core GRC rule" : "A Lead Implementer rule"} from the rule tables: ${ROLE_TXT(r[0])}. Open the rule card for its exact wording.` } : null;
  },
  task: (t, d) => {
    const k = d.tasks?.[t];
    return k ? { name: `Task ${t}: ${k.title}`, def: `Task ${t} is in week ${k.week}: ${ROLE_TXT(k.title)}. Open it from Home › My Tasks.` } : null;
  },
  step: (t, d) => {
    const [task, n] = t.split("-");
    const s = d.tasks?.[task]?.steps?.[Number(n) - 1];
    return s ? { name: `Step ${n} of ${task}`, def: `Step ${n} of task ${task}: ${ROLE_TXT(s.t)}.` } : null;
  },
  decision: (t, d) => {
    const task = t.split("-")[0];
    const s = d.tasks?.[task]?.steps?.find((x: Loose) => x.did === t);
    return s ? { name: `Decision ${t}`, def: `A decision point of task ${task}, at step ${s.n}: you choose one of the options you are given.` } : null;
  },
  message: (t, d) => {
    const m = d.inj?.[t];
    return m ? { name: `Task message ${t}`, def: `A message in your Inbox for task ${m.task}, due ${m.due}: a situation you have to decide.` } : null;
  },
  sprint: (t, d) => {
    const n = Number(t.slice(4));
    const s = (SPRINT_DATA as Loose).sprints?.find((x: Loose) => x.n === n);
    return s && d.ds?.[t] ? { name: `${t}: sprint ${n} dataset`, def: `The dataset for control sprint ${n} (task ${s.task}): what the office was found to be doing for ${s.controls.length > 1 ? `${s.controls[0]} to ${s.controls[s.controls.length - 1]}` : s.controls[0]}. It is synthetic data.` } : null;
  },
  lia: (t, d) => {
    const c = t.slice(5);
    const title = d.iso?.[c];
    return d.pages?.[t] ? { name: `${t}: ${title ?? "control task page"}`, def: `The Lead Implementer task page for control ${c}${title ? `, ${title}` : ""}: what it requires, its owner role and the sub-tasks that produce its evidence.` } : null;
  },
  lias: (t, d) => {
    const page = d.pages?.[t.replace(/-\d+$/, "")];
    const row = page?.r?.find((r: string[]) => r[0] === t);
    return row ? { name: t, def: `Sub-task of ${t.replace(/-\d+$/, "")}: ${ROLE_TXT(row[1])}` } : null;
  },
  liq: (t, d) => {
    const pg = d.pages?.[t.startsWith("RV") ? "RV-Q fixed questions" : "LI-Q fixed questions"];
    const row = pg?.r?.find((r: string[]) => r[0] === t);
    return row ? { name: `${t}: ${ROLE_TXT(row[1])}`, def: `Fixed question ${t.slice(-1)}: ${row[1]} Where to look: ${row[2]}` } : null;
  },
  control: (t, d) => {
    const title = d.iso?.[t];
    return title ? { name: `${t} ${title}`, def: `ISO/IEC 27001:2022 Annex A control ${t}, ${title}. It is one of the ${THEME[t.split(".")[1]] ?? ""} controls (A.${t.split(".")[1]}).`, link: d.pages?.[`LI-${t}`] ? { page: `LI-${t}`, label: `LI-${t}` } : undefined } : null;
  },
  clause: (t, d) => {
    const title = d.iso?.[t];
    return title ? { name: `Clause ${t}: ${title}`, def: `Clause ${t} of ISO/IEC 27001:2022, ${title}.` } : null;
  },
  deliverable: (t, d) => {
    const r = (d.deliverables as string[][] | undefined)?.find((x) => x[1] === t);
    return r ? { name: `${t}: ${r[2]}`, def: `${r[2]}, handed in with task ${r[0]}. Format: ${r[3]}.` } : null;
  },
  template: (t, d) => {
    const r = d.tpls?.[t] ?? d.tpls?.[`${t} frame`];
    return r ? { name: t, def: `A ready-made template for ${r[1]} (task ${r[0]}): ${String(r[2]).split(":")[0].replace(/\.$/, "")}.` } : null;
  },
  tplfile: (t, d) => {
    const hit = Object.entries((d.tpls ?? {}) as Record<string, string[]>).find(([, v]) => v[1] === t);
    return hit ? { name: t, def: `The working file that template ${hit[0]} opens for task ${hit[1][0]}.` } : null;
  },
  dataset: (t, d) => (d.ds?.[t] ? { name: `Dataset ${t}`, def: `Dataset ${t}: a table of synthetic (made-up) records that a task gives you. Cite its row IDs as evidence.` } : null),
  role: (t, d) => (d.roles?.[t] ? { name: `${t}: ${d.roles[t]}`, def: `${d.roles[t]}: a GRC role of the Group.` } : null),
  doc: (t, d) => {
    const k = t === "Charter" ? t : t.match(/^SITL-[A-Z]+-\d+[A-Z]?/)![0];
    const title = d.docs?.[k];
    return title ? { name: `${k}: ${title}`, def: `${title}, a document of the Group. Open it in Policies › Policy Library.`, link: { doc: k, label: k } } : null;
  },
};

const ENTRIES = DATA.entries;
const BY_FORM = new Map<string, GEntry>();
for (const e of ENTRIES) for (const f of e.forms ?? []) if (!BY_FORM.has(f)) BY_FORM.set(f, e);
const PATTERNED = ENTRIES.filter((e) => e.pattern).map((e) => [new RegExp(e.pattern!), e] as const);
const SKIP = new Set(DATA.skip);
export const isSkipped = (t: string) => SKIP.has(t);

const isRowId = (e: GEntry) => e.id === "row-id";
const resolved = (e: GEntry, tok: string): GEntry => {
  const p = e.derive && DESK ? DERIVE[e.derive]?.(tok, DESK) : null;
  return p ? { ...e, ...p } : e;
};

/** The entry that explains `token` (a code or a term as written), or null. */
export function lookup(token: string): GEntry | null {
  const f = BY_FORM.get(token);
  if (f) return resolved(f, token);
  // Derived families first (a rule's own title beats a generic line), then plain patterns, the row-ID catch-all last.
  for (const [re, e] of PATTERNED) if (e.derive && re.test(token)) { const r = resolved(e, token); return r; }
  for (const [re, e] of PATTERNED) if (!e.derive && !isRowId(e) && re.test(token)) return e;
  if (DESK) for (const e of ENTRIES) if (e.derive && !e.pattern) { const p = DERIVE[e.derive]?.(token, DESK); if (p) return { ...e, ...p }; }
  for (const [re, e] of PATTERNED) if (isRowId(e) && re.test(token)) return e;
  return null;
}
/** A row ID matches only the catch-all pattern: hover for it, but never required of a code shape in the test. */
export { isRowId };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const INLINE = ENTRIES.flatMap((e) => (e.inline === false ? [] : e.forms ?? [])).filter((f) => f.length > 1).sort((a, b) => b.length - a.length);
/** A code-shaped token, or an inline term/phrase of the data file. */
export const TOKEN_RE = new RegExp(
  `(?<![\\w.-])(?:[A-Z][A-Z0-9]*(?:[-.][A-Z0-9]+)+|[FT]\\d+\\.\\d+(?:-[JD]?\\d+)?|[A-Z]{2,8}\\d?|[A-Z]\\d{1,3})(?![A-Za-z0-9_+]|-[A-Z0-9])|(?<![\\w.-])(?:${INLINE.map(esc).join("|")})(?![\\w-])`,
  "g",
);

export type GPart = { text: string; entry?: GEntry };
/** `text` cut into plain runs and the codes and terms that have a definition. `rowIds`: also mark row IDs (a code chip does). */
export function glossParts(text: string, rowIds = false): GPart[] {
  const out: GPart[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const e = lookup(m[0]);
    if (!e || (isRowId(e) && !rowIds)) continue;
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at) });
    out.push({ text: m[0], entry: e });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

const EXPANDED = new Set(["rule", "task", "doc", "control", "template", "dataset", "role", "sprint", "deliverable"]);
/** Every entry as the Glossary page lists it: the data file's, then each derived family expanded from the pack. */
export function allEntries(): GEntry[] {
  const out = ENTRIES.filter((e) => e.id !== "row-id" && !(e.derive && EXPANDED.has(e.derive) && DESK));
  if (!DESK) return out;
  const fam = (derive: string, toks: string[], keep?: (t: string) => boolean) => {
    const base = ENTRIES.find((e) => e.derive === derive)!;
    for (const t of toks) {
      if (keep && !keep(t)) continue;
      const p = DERIVE[derive](t, DESK!);
      if (p) out.push({ ...base, ...p, id: `${derive}:${t}`, forms: [t] });
    }
  };
  fam("rule", Object.keys(DESK.rules ?? {}));
  fam("task", Object.keys(DESK.tasks ?? {}));
  fam("doc", Object.keys(DESK.docs ?? {}));
  fam("control", Object.keys(DESK.iso ?? {}).filter((k) => k.startsWith("A.")));
  fam("deliverable", [...new Set<string>((DESK.deliverables ?? []).map((r: string[]) => r[1]))]);
  fam("template", Object.keys(DESK.tpls ?? {}));
  fam("dataset", Object.keys(DESK.ds ?? {}).filter((k) => !/^SPR-\d\d$/.test(k)));
  fam("sprint", Object.keys(DESK.ds ?? {}).filter((k) => /^SPR-\d\d$/.test(k)));
  fam("role", Object.keys(DESK.roles ?? {}));
  return out;
}
export const GLOSSARY_GROUPS: string[] = [...new Set(ENTRIES.map((e) => e.group))];
