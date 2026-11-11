/**
 * One colour per client organisation, so a mentee can tell at a glance which one a task is for.
 * Keyed by A/B, never by name: the names are swapped per learner (names.ts), and every component
 * here takes the learner's own `desk.orgs` for the names it shows.
 *
 * Teal and orange because the desk's other hues are taken (indigo = here, amber = Decision and
 * warnings, green = done, red = overdue, violet = machine). Colour is never the only cue: the mark is
 * the organisation's own logo, and its name rides beside it or in its title. `text` clears WCAG AA
 * on white and on `tint`; `solid` is for fills and rules only, never behind body text.
 */
import type { ReactNode } from "react";
import { OrgLogo, logoFor } from "@/components/app/org-logo";

export type OrgKey = "A" | "B";
type Orgs = Record<OrgKey, { short: string; name: string }>;

export const ORG_TONE: Record<OrgKey, { text: string; tint: string; ring: string; solid: string }> = {
  A: { text: "#0F766E", tint: "#F0FDFA", ring: "#99F6E4", solid: "#14B8A6" },
  B: { text: "#C2410C", tint: "#FFF7ED", ring: "#FED7AA", solid: "#F97316" },
};

/** The organisations a task is for: its `org` ("A" | "B" | "AB"), or a label like "Org A + B · …". */
export function orgKeys(org: string): OrgKey[] {
  const head = org.startsWith("Org ") ? org.split("·")[0] : org;
  return (["A", "B"] as const).filter((k) => head.includes(k));
}

/** The organisation's logo in its colour; its full name in the tooltip. */
export function OrgMark({ k, orgs, size = 16 }: { k: OrgKey; orgs: Orgs; size?: number }) {
  return (
    <span title={orgs[k].name} className="inline-flex shrink-0">
      <OrgLogo org={logoFor(orgs[k].name)} orgKey={k} className="" iconSize={size} />
    </span>
  );
}

/** Logos alone, for tight spots (sidebar rows, phone chips); both when the task is for A + B. */
export function OrgMarks({ org, orgs, size }: { org: string; orgs: Orgs; size?: number }) {
  const ks = orgKeys(org);
  return (
    <span role="img" aria-label={ks.map((k) => orgs[k].name).join(" and ")} className="inline-flex shrink-0 items-center gap-0.5 align-[-3px]">
      {ks.map((k) => <OrgMark key={k} k={k} orgs={orgs} size={size} />)}
    </span>
  );
}

/** Logo and short name in the organisation's colour: "[logo] GlobalConnect", or both for A + B. */
export function OrgName({ org, orgs, size = 16, children }: { org: string; orgs: Orgs; size?: number; children?: ReactNode }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 align-middle">
      {orgKeys(org).map((k) => (
        <span key={k} title={orgs[k].name} className="inline-flex items-center gap-1.5 font-semibold" style={{ color: ORG_TONE[k].text }}>
          <OrgMark k={k} orgs={orgs} size={size} />
          {orgs[k].short}
        </span>
      ))}
      {children}
    </span>
  );
}
