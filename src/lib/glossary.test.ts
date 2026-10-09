// Run: npx tsx src/lib/glossary.test.ts
// The glossary must not silently drop or duplicate deliverable text: splitting a paragraph and
// re-joining it has to reproduce the original exactly, or the mentee reads a mangled brief.
import assert from "node:assert/strict";
import { GLOSSARY, splitTerms } from "./glossary";

const join = (parts: (string | { text: string })[]) => parts.map((p) => (typeof p === "string" ? p : p.text)).join("");

const SAMPLE =
  "You will build the Information Asset Register: every information asset with a named asset owner, " +
  "a custodian, and a classification. Confidentiality drives the tier. Record any residual gap.";

// Lossless round-trip, terms and all.
assert.equal(join(splitTerms(SAMPLE)), SAMPLE);
assert.equal(join(splitTerms("no jargon here at all")), "no jargon here at all");
assert.equal(join(splitTerms("")), "");

// Longest match wins — "Information Asset Register", not "information asset" + " Register".
const first = splitTerms(SAMPLE).find((p) => typeof p !== "string");
assert.deepEqual(first && typeof first !== "string" && first.text, "Information Asset Register");

// Only the first occurrence of a term is interactive; the rest stay plain text.
const twice = splitTerms("A custodian is not an asset owner; a custodian holds it for the asset owner.");
assert.equal(twice.filter((p) => typeof p !== "string").length, 2, "custodian + asset owner, once each");

// Casing preserved on the way out, canonical key on the way in.
const hits = splitTerms("Confidentiality and CONFIDENTIALITY").filter((p) => typeof p !== "string");
assert.equal(hits.length, 1);
assert.equal(hits[0].text, "Confidentiality");
assert.equal(hits[0].key, "confidentiality");

// Word boundaries: "scope" must not fire inside "scoped" or "telescope".
assert.equal(splitTerms("a scoped telescope").filter((p) => typeof p !== "string").length, 0);
assert.equal(splitTerms("the scope of work").filter((p) => typeof p !== "string").length, 1);

// Every hit resolves to a real definition (guards a key/lookup drift).
for (const h of splitTerms(Object.keys(GLOSSARY).join(". ")))
  if (typeof h !== "string") assert.ok(h.definition, `no definition for ${h.key}`);

console.log("glossary: ok");
