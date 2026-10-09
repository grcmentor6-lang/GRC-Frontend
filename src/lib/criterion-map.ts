/**
 * Which part of each workspace fills which acceptance criterion.
 *
 * The deliverable and the checklist beside it describe the same work in two vocabularies — fields
 * on one side, `R1`/`R2` on the other — and nothing connected them: a mentee looking at "R2 · open"
 * had to work out for themselves which box to fill. This table is the connection. It drives the
 * R-marks on the working sheet (`criterion-mark.tsx`) and the pairing that lights a checklist row
 * while its field has focus.
 *
 * Keys are the workspaces' `data-guide` anchors (the same ones the Guide walks), values are 1-based
 * criterion numbers in `lib/acceptance.ts` order. An empty list means the part is written by the
 * mentee but no criterion reads it — the rubric does — and the mark says so rather than leaving a
 * gap that looks like an omission.
 *
 * Written by reading each criterion's `met` predicate, not its wording, and checked by
 * `criterion-map.test.ts`: every key is anchored, every number is a real criterion, and every
 * criterion is reached by at least one part.
 *
 * Deliberately absent:
 *  - Request's `reply`: the conversation is required (the workspace withholds Submit until it is
 *    finished) but no criterion reads it, and "not on the checklist" would read as "optional".
 *  - Present's `prep`: read, not written.
 *  - Research's `rs:findings` / `rs:sowhat`: they belong to R1 on a required method and to R2 on an
 *    optional one, which only the pane knows — it marks the method as a whole instead.
 *  - RUA's Acquire and Confirm tabs: required by the gate, read by no criterion.
 *
 * The `tab:` entries are **pairing only** — the rail wears no chips. RUA has numbered its eight
 * screens R1–R8 since long before these marks existed (`ScreenHead v="R1" name="Study"` …
 * `v="R8" name="Attest"`), so a criterion chip in the rail put two different R-numberings on one
 * screen: R2 could mean "the Inspect screen" or "templates inspected". The rail is back to its
 * own numbering, and these entries only light the checklist row when a tab takes focus.
 * `criterion-map.test.ts` fails if a chip returns to the rail.
 */
export const CRITERION_OF: Record<string, Record<string, number[]>> = {
  request: { to: [1], items: [2], subject: [3], purpose: [] },
  brief: { audience: [1], ask: [2], messages: [3] },
  review: { cover: [1], feedback: [2] },
  conduct: { opening: [1], probe: [2] },
  present: { opening: [1], probe: [2] },
  interview: { questions: [1], summary: [2] },

  record: { register: [1, 2] },
  apply: { table: [1, 2] },
  map: { table: [1, 2] },
  crossref: { method: [1], table: [2, 3] },
  identify: { criterion: [1], table: [2, 3] },
  // R2 is the workspace's own verdict, which needs every row computed and the formula cited.
  calculate: { cite: [1], table: [2] },
  // R2 ("no unresolved ties") is the workspace's verdict: every score entered and every tie broken.
  prioritise: { table: [1, 2], tiebreak: [2] },

  // The nine form verbs have one criterion, "every field completed", and every entry is a share of it.
  draft: { item: [1] },
  recommend: { item: [1] },
  validate: { item: [1] },
  schedule: { item: [1] },
  assess: { item: [1] },
  score: { item: [1] },
  compile: { item: [1] },
  signoff: { item: [1] },
  document: { item: [1] },

  rua: {
    "tab:study": [1],
    "tab:inspect": [2],
    "tab:clarify": [3],
    "tab:explain": [3],
    "tab:answer": [4],
    "tab:attest": [4],
  },
  research: {
    "tab:contextual": [1],
    "tab:gap": [1],
    "tab:horizon": [1],
    "tab:benchmark": [2],
    "tab:crosswalk": [2],
    "tab:rootcause": [2],
    "rs:sources": [3],
    "tab:review": [4],
  },
};

/** The criteria a part fills, or `undefined` where the table says nothing about it. */
export const criteriaFor = (verbId: string, key: string): number[] | undefined => CRITERION_OF[verbId]?.[key];

/**
 * The criteria the focused element belongs to: the nearest ancestor whose anchor this verb maps.
 *
 * Nearest *mapped* rather than nearest anchor, so a form field (`f:content`, unmapped) resolves to
 * the entry card around it (`item` → R1). A part the table maps to nothing pairs with nothing.
 */
export function criteriaAt(verbId: string, el: Element | null, stop?: Element | null): number[] {
  const table = CRITERION_OF[verbId];
  if (!table) return [];
  for (let n: Element | null = el; n && n !== stop; n = n.parentElement) {
    const key = n.getAttribute("data-guide");
    if (key && key in table) return table[key];
  }
  return [];
}
