// GRC 101 was rebuilt to the manager's Lead Implementer workbook (docs/li101/LI101_REBUILD_PLAN.md, 25 Nov 2026): every
// task but F1.1 kept its code and got new steps, so work saved on the old steps would sit on the new ones looking like
// answers. A learner's saved work carries a mark once it holds only new work; work without it has every key of the
// rebuilt tasks put aside when it is read (progress-sync.ts, the one place saved work is read), and the deletion goes
// up with the next save. backend/app/services/desk_li101.py matches the same keys (the server reads every document
// that way until the desk has cleared it, and guards the clearing save); its `goes` and this one must agree.
//
// Kept: F1.1, the knowledge-check attempts (kc), the Tech Lab (labs, labCaptures). This replaces the T3.2-only reset of
// the focus plan: its mark "T3.2#v" is an old T3.2 key and goes with the rest. Run: npx tsx src/lib/desk/li-reset.test.ts
import type { Progress } from "./progress";

/** `answers` key of the mark. "li1": this is the rebuilt programme's work. "li1:reset": and old work was put aside. */
export const LI_MARK = "GRC101#v";
/** Sent as "v" with every save (progress-sync.ts). A save without it comes from a tab still running the desk from before
 *  the rebuild: the server drops its keys of the rebuilt tasks (desk_li101.py SAVE_VERSION, api/desk.parse_delta). */
export const SAVE_VERSION = "li1";
export const REBUILT = ["F1.2", "F1.3", "F2.1", "F2.2", "T3.1", "T3.2", "T4.1", "T4.2", "T5.1", "T5.2", "T6.1", "T6.2",
  "T7.1", "T7.2", "T8.1", "T8.2", "T9.1", "T9.2", "T10.1", "T10.2", "T11.1", "T11.2", "T12.1", "T12.2"];
const SECTIONS = ["done", "picks", "answers", "grids", "msgs", "logs", "acks", "rowChecks", "decisions", "submitted", "hints"];
// A key's task: "T3.2", "T3.2-4", "T3.2-4#hash", "T3.2|T-MAP", "T3.2:MAP-XW", "T3.2#v", "T3.2-J1", "T3.2-D3".
const TASK = /^([FT]\d+\.\d+)(?=$|[-|:#])/;

/** Is `key` of `section` work on a rebuilt task's old content? (desk_li101.py `goes`.) */
export function goes(section: string, key: string): boolean {
  const m = SECTIONS.includes(section) ? key.match(TASK) : null;
  return !!m && REBUILT.includes(m[1]);
}

/** Saved work as the rebuilt desk reads it: unchanged once marked; otherwise marked, with the old work gone. */
export function resetOldWork(p: Progress): Progress {
  if (p.answers?.[LI_MARK]) return p;
  const out = { ...p } as Record<string, unknown>;
  let removed = false;
  for (const [section, held] of Object.entries(p)) {
    if (!held || typeof held !== "object" || Array.isArray(held)) continue;
    const keep = Object.entries(held as Record<string, unknown>).filter(([k]) => !goes(section, k));
    if (keep.length === Object.keys(held).length) continue;
    removed = true;
    out[section] = Object.fromEntries(keep);
  }
  out.answers = { ...((out.answers as Record<string, string>) ?? {}), [LI_MARK]: removed ? "li1:reset" : "li1" };
  return out as unknown as Progress;
}
