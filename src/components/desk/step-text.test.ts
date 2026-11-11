// Run: npx tsx src/components/desk/step-text.test.ts
// The guide's and the step text's highlighter on real card strings: what it marks, and that plain prose stays plain.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGES, SECTIONS, TOOLS, markParts, sentences } from "./step-text";

const marks = (s: string) => markParts(s).filter((p) => p.kind !== "text").map((p) => `${p.kind}:${p.text}`);
const eq = (s: string, want: string[]) => assert.deepEqual(marks(s), want, s);

// The toolbar and reference-page names are the desk's own.
const desk = JSON.parse(readFileSync(new URL("../../../public/desk/sample.json", import.meta.url), "utf8"));
const secs = ["home", "evidence", "frameworks", "access", "risk", "vendors", "testing", "policies", "awareness", "regwatch", "learn", "inbox", "systems"];
assert.deepEqual(SECTIONS, secs.map((k) => desk.sections[k].t));
assert.deepEqual(TOOLS, secs.filter((k) => k !== "inbox").flatMap((k) => desk.sections[k].tools.map((t: { n: string }) => t.n.replace(/ \(business SaaS\)$/, ""))));
assert.deepEqual(PAGES, Object.keys(desk.pages));

// Documents, their sections, clauses, controls and reference pages: amber, without the full stop.
eq("This card asks the questions of BKB-STD-001 Section 5 **one at a time, in order**.", ["doc:BKB-STD-001 Section 5", "field:one at a time, in order"]);
eq("Read **Section 6.3, step 6** of the addendum.", ["doc:Section 6.3, step 6"]);
eq("Read BKB-POL-013 Section 3.1.", ["doc:BKB-POL-013 Section 3.1"]);
eq("Sheet 1 is that plan, A1 to A6.", ["doc:Sheet 1", "code:A1", "code:A6"]);
eq("Clause 5.1 asks for it; clauses 4.1 and 4.2 say so. Annex A's A.5.18 too.", ["doc:Clause 5.1", "doc:clauses 4.1 and 4.2", "doc:Annex A", "doc:A.5.18"]);
eq("Click **Ref-27000 family**, then Ref-UAR test plan and **Charter** and **Organization_Profiles**.", ["doc:Ref-27000 family", "doc:Ref-UAR test plan", "doc:Charter", "doc:Organization_Profiles"]);
// Platform buttons: bold, quoted, after a verb, or a label that is nothing else.
eq("Once every row is filled, click **Check my answers**. It shows why.", ["btn:Check my answers"]);
eq("Click **▶ Show me how** on the step.", ["btn:▶ Show me how"]);
eq("All answers No? Record Tier 2", ["btn:Record Tier 2"]);
eq("None failed? Record Accept", ["btn:Record Accept"]);
eq("Then Mark step complete.", ["btn:Mark step complete"]);
eq('Press "Save" when done.', ["btn:Save"]);
eq("Answer Yes or No from the row's facts", ["btn:Yes", "btn:No"]);
eq("Choose **Yes** or **No**.", ["btn:Yes", "btn:No"]);
eq("Stop. Click the **Record** button that appears.", ["btn:Record"]);
eq("Click **Show the 2 worked rows** under the table, then **Got it**.", ["btn:Show the 2 worked rows", "btn:Got it"]);
eq("Click **Open Export Mapping**.", ["btn:Open Export Mapping"]);
eq("Next unlocks once it is right.", ["btn:Next"]);
// A one-word label in prose is a word.
eq("Save the file and open the next one. No row is skipped.", []);
// Toolbar sections, tools and paths: tinted, whole, leading verb and trailing prose left out.
eq("Open Risk Register › Mitigation Tracker and read it.", ["path:Risk Register › Mitigation Tracker"]);
eq("See Learn › Sentence frames for help.", ["path:Learn › Sentence frames"]);
eq("Home › My plan: check the file.", ["path:Home › My plan"]);
eq("Policies › Map to Framework", ["path:Policies › Map to Framework"]);
eq("Open it from the **Inbox** on the toolbar and reply.", ["path:Inbox"]);
eq("Click **Policy Library**, or click Policies.", ["path:Policy Library", "path:Policies"]);
eq("Business Risk Translator is in its menu.", ["path:Business Risk Translator"]);
eq("Policies › Policy Library › a document", ["path:Policies › Policy Library"]);
// Rows, columns, fields, values; codes; the step tag.
eq("Type **Manila** in column E of the DPA 2012 row.", ["field:Manila", "field:column E"]);
eq('Is it "Masked content"? Check E-004 to E-008 in row 1, then rows 2 to 5.', ['field:"Masked content"', "field:E-004", "field:E-008", "field:row 1", "field:rows 2 to 5"]);
eq("Choose **law**, **reg**, **none** or **.docx**.", ["field:law", "field:reg", "field:none", "field:.docx"]);
eq("Find **R-16-HQ-21** and R-16-HQ-12 in CTX-BRIEF by R23.", ["code:R-16-HQ-21", "code:R-16-HQ-12", "code:CTX-BRIEF", "code:R23"]);
eq("Dataset PBC-6, NC-1, EVQ-6, MAP-8 and VEN-Q; checks C11, D1 to D10, S1 and Q2 to Q7; task T12.1.", ["code:PBC-6", "code:NC-1", "code:EVQ-6", "code:MAP-8", "code:VEN-Q", "code:C11", "code:D1", "code:D10", "code:S1", "code:Q2", "code:Q7", "code:T12.1"]);
eq("The library is tagged Step 7.", ["tag:Step 7"]);
// A whole sentence set bold is emphasis.
eq("**The two dates are yours.** **Never share MFA codes**", ["bold:The two dates are yours.", "bold:Never share MFA codes"]);
// The learner's organisations (canonical identity here).
eq("GlobalConnect and LearnTech Educational Solutions", ["org:GlobalConnect", "org:LearnTech Educational Solutions"]);
// Plain prose stays plain.
for (const s of [
  "Take the first row.",
  "The checklist moves on to the next action by itself.",
  "Answer the other two the same way.",
  "More than one can sound reasonable. Hold each one against the situation's facts.",
]) eq(s, []);
// Nothing is lost: the parts put back together are the string, less the bold markers.
const s = "Click **Check my answers**: it reads BKB-ADD-16 Section 9, A-03 and Home › My Organisation.";
assert.equal(markParts(s).map((p) => p.text).join(""), s.replace(/\*\*/g, ""));
// Round 3: Submit as the button it names; sections opened from; the checklist's pair and lone button leads.
eq("Submit opens once steps 1 to 5 are complete. If Submit is grey, read the line.", ["btn:Submit", "btn:Submit"]);
eq("Submit hands both files in.", ["btn:Submit"]);
eq("Reply from the Inbox, or open the Inbox; it is in the Inbox.", ["path:Inbox", "path:Inbox", "path:Inbox"]);
eq("Use the Evidence request frame of Learn › Sentence frames.", ["field:Evidence request frame", "path:Learn › Sentence frames"]);
eq("Each item gets Accept or Reject; click its Accept/Reject.", ["field:Accept", "field:Reject", "btn:Accept/Reject"]);
eq("Any check marked: **Reject**. None: **Accept**.", ["field:Reject", "field:Accept"]);
eq("Click **Record Accept** when none failed.", ["btn:Record Accept"]);
eq("Reply", ["btn:Reply"]);
eq("Record", ["btn:Record"]);
// Paper sizes are not codes; a hash name is a value.
eq("One A4 page, with its SHA-256 hash and **SHA-256**.", ["field:SHA-256", "field:SHA-256"]);
// Sentences that start with a digit, or follow a closing quote.
assert.deepEqual(sentences("Not on weekends. 72 hours from discovery."), ["Not on weekends.", "72 hours from discovery."]);
assert.deepEqual(sentences("“Removed within 4 hours.” Role, action, time limit."), ["“Removed within 4 hours.”", "Role, action, time limit."]);
// Bold runs split into sentences.
assert.deepEqual(sentences("**law**: an act. **reg**: a rule."), ["**law**: an act.", "**reg**: a rule."]);

console.log("step-text highlighter: ok");
