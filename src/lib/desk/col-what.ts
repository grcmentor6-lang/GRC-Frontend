/**
 * What each column of a desk table holds, printed under its heading (tester review, 23 Nov 2026: "the tables do not
 * say what each column is about ... we often did not know what to enter"). A column the learner fills says what to
 * enter; a given column says what it shows. Never the answer. Keyed by register key, then by the heading as written;
 * "*" holds headings that mean the same in every table. A `what` written on the column itself wins (registers.ts).
 * col-what.test.ts fails when a column has no line here or a line here names no column.
 */
export const COL_WHAT: Record<string, Record<string, string>> = {
  "*": {
    Rule: "The rule the row was worked by. Filled by the platform.",
    "Evidence ref": "The document and section the row's values come from.",
    Field: "The field of the form.",
    Part: "The part of the document.",
    Item: "The evidence file's ID.",
    Name: "The account's holder.",
    // The old programme's shared headings (evidence-file and account facts, form lines) went once every rebuilt task had
    // its tables and none used them (T12.2, 26 Nov 2026; col-what.test.ts).
  },
  // The tables of F1.2 … T12.2 went with their old content (GRC 101 rebuilt, docs/li101); Phase 2 adds each task's back.
  "F1.2": {
    Organisation: "Whose row it is: yours, or the worked example's.",
    "A Document": "The document of the ISO/IEC 27000 family the row describes.",
    "C What it is for": "What the document is for, in one line.",
    "D Who uses it": "Who works with the document.",
  },
  "F1.2 PDCA": {
    Clause: "The clause of ISO/IEC 27001:2022.",
    Title: "The clause's title in the standard.",
  },
  "F1.3": {
    Organisation: "Whose row it is: yours, or the worked example's.",
    "A Issue": "The issue, in one statement.",
    "B Internal/External": "Internal: within the organisation's control. External: from its environment.",
    "C Category": "The kind of issue.",
    "D Effect on the ISMS's intended outcomes": "What the issue does to what the ISMS must achieve, in one sentence.",
    "E Source": "The document and section the issue was read from.",
  },
  "F1.3 CTX-IP": {
    Party: "The interested party, as the source table names it.",
    "Internal/External": "As the source table gives it for the party.",
    Requirement: "Every requirement the table lists for the party, separated by semicolons.",
    "Standard/law": "The standard, law or contract the table gives for the party.",
    "Addressed through the ISMS?": "Which of the party's requirements the ISMS addresses.",
  },
  "F2.1": {
    Organisation: "Whose row it is: yours, or the worked example's.",
    Part: "The part of the scope statement the line fills.",
    Statement: "What the scope says for this part.",
    Source: "The document and section the statement was read from.",
  },
  "F2.1 PROC": {
    "ISMS process": "One of the ten processes the ISMS runs.",
    "ISO/IEC 27001:2022": "The clause or controls the process serves.",
  },
  "F2.1 IFACE": {
    "Interface or dependency": "Where the office's systems or work meet another party's.",
    Counterparty: "Who is at the other end, as SITL-ADD-16 Section 9.1 names it.",
    Exchanged: "What passes between the two ends.",
    "What crosses the boundary": "What leaves or enters the scope here, or nothing.",
    "Annex A control": "The control of ISO/IEC 27001:2022 Annex A that governs the crossing.",
  },
  "F2.2": {
    "A Clause": "The requirement of ISO/IEC 27001:2022, by clause number and title.",
    "What the clause requires": "What it asks for (Task Library, Requirements sheet), in our own words.",
    "B What was found at Manila (GAP-25)": "What the baseline found at the Manila office for the clause.",
    "C Status (L13)": "Fully met, Partially met or Not met, by rule L13.",
    "D Maturity level": "Level 1 to 4, by the Maturity Model's questions.",
    "E Reason": "Why the status and level: given on the worked rows.",
  },
  "F2.2 PLAN": {
    Priority: "The order in which the gaps are closed.",
    "Status in sheet Gap": "The chosen gap's status, as step 2 checked it. Filled by the platform.",
  },
  "T3.1": {
    "Clause 5.2 item": "What Clause 5.2 asks of the policy, item a) to g).",
  },
  "T3.1 LEAD": {
    "Statement read in your inputs": "A statement found in SITL-POL-001, SITL-POL-000 or the GRC Charter.",
  },
  "T3.1 SET": {
    "Topic (ISO/IEC 27002:2022 Section 5.1)": "A topic-specific policy ISO/IEC 27002 lists.",
    Owner: "The policy's owner, from SITL-POL-000 Section 3. Filled by the platform.",
    Approver: "Who approves a policy, from SITL-POL-000 Section 2. Filled by the platform.",
    "Last review date": "The policy's last approval, from Ref-Policy portal. Filled by the platform.",
  },
};
