// Run: npx tsx src/lib/desk/acronyms.test.ts
// The first-occurrence acronym expander: the same cases as `python scripts/acronyms.py`, plus every toolbar name untouched.
import assert from "node:assert/strict";
import { expandAcronyms } from "./acronyms";
import { PAGES, SECTIONS, TOOLS, markParts } from "../../components/desk/step-text";

const x = (t: string) => expandAcronyms(t, new Set());
const eq = (t: string, want: string) => assert.equal(x(t), want, t);

eq("Fill the evidence request list (PBC) with the PBC rules.", "Fill the evidence request list (PBC, Prepared By Client) with the PBC rules.");
eq("Write the SOP. Then the SOP again.", "Write the SOP (standard operating procedure). Then the SOP again.");
eq("Open Evidence › Audit Requests (PBC): dataset PBC-6 and PBC-LIST, SOA-GCS, T-PBC.", "Open Evidence › Audit Requests (PBC): dataset PBC-6 and PBC-LIST, SOA-GCS, T-PBC.");
eq("the Statement of Applicability (SoA) lists", "the Statement of Applicability (SoA) lists");
eq("Apply the SLA (R23) to KRIs.", "Apply the SLA (service level agreement; R23) to KRIs (key risk indicators).");
eq('Type "SOP" in column B. Options: A) The CISO  B) The DPO. Guidance: see the CISO.', 'Type "SOP" in column B. Options: A) The CISO  B) The DPO. Guidance: see the CISO (Chief Information Security Officer).');
eq("[LI-05 — ISMS scope] Scope the ISMS.", "[LI-05 — ISMS scope] Scope the ISMS (information security management system).");
eq("systems that cannot use MFA/SSO.", "systems that cannot use MFA/SSO (multi-factor authentication / single sign-on).");
eq("the GRC Charter Section 16 and the Group GRC Office", "the GRC Charter Section 16 and the Group GRC Office");
eq("in UTC+1, then in UTC.", "in UTC+1, then in UTC (Coordinated Universal Time).");
eq("in CISA's catalogue", "in CISA's (US Cybersecurity and Infrastructure Security Agency) catalogue");
eq("scope statements and SoAs.", "scope statements and SoAs (Statements of Applicability).");
eq("Click **Contract & DPA Check** and **PBC-LIST**.", "Click **Contract & DPA Check** and **PBC-LIST**.");
const seen = new Set<string>();
assert.deepEqual([expandAcronyms("The DPIA.", seen), expandAcronyms("A DPIA.", seen)], ["The DPIA (data protection impact assessment).", "A DPIA."]);
const once = x("Build the PBC list and the SOP.");
assert.equal(x(once), once, "expanding twice adds nothing");

// Toolbar sections, tools and reference pages are labels that must match the screen: never expanded.
for (const n of [...SECTIONS, ...TOOLS, ...PAGES]) assert.equal(x(n), n, n);

// The expansion is plain text to the highlighter: the acronym and its meaning are not chips.
assert.deepEqual(markParts(x("Build the PBC list for Evidence › Audit Requests (PBC).")).filter((p) => p.kind !== "text").map((p) => `${p.kind}:${p.text}`), ["path:Evidence › Audit Requests (PBC)"]);

console.log("acronyms: ok");
