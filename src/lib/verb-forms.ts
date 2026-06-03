// Tailored deliverable field-specs per verb — drives the bespoke Working Desk workspaces.
// Each spec maps to the verb's Layer-1 acceptance criteria; values become the submission payload.fields.

export type Column = { key: string; label: string; type?: "text" | "select"; options?: string[] };
export type FieldSpec =
  | { key: string; label: string; type: "text" | "textarea" | "date" | "number"; placeholder?: string; hint?: string }
  | { key: string; label: string; type: "select"; options: string[]; hint?: string }
  | { key: string; label: string; type: "list"; placeholder?: string; hint?: string }
  | { key: string; label: string; type: "table"; columns: Column[]; hint?: string };

const CLASS = ["Public", "Internal", "Confidential"];

export const VERB_FORMS: Record<string, FieldSpec[]> = {
  request: [
    { key: "to", label: "To (named role)", type: "text", placeholder: "e.g. IT Operations Lead" },
    { key: "subject", label: "Subject (≤ 80 chars)", type: "text" },
    { key: "items", label: "Requested items (≥ 3)", type: "list", placeholder: "An item you're requesting" },
    { key: "deadline", label: "Deadline", type: "date" },
  ],
  conduct: [
    { key: "stakeholder", label: "Stakeholder / role interviewed", type: "text", placeholder: "e.g. Process Owner" },
    { key: "questionsAnswered", label: "Guide questions answered", type: "text", placeholder: "e.g. 9 / 10" },
    { key: "findings", label: "Key findings", type: "textarea" },
  ],
  record: [
    { key: "register", label: "Register entries", type: "table", columns: [
      { key: "name", label: "Asset / item" }, { key: "type", label: "Type" }, { key: "owner", label: "Owner (role)" },
      { key: "location", label: "Location" }, { key: "classification", label: "Classification", type: "select", options: CLASS },
    ] },
  ],
  apply: [
    { key: "items", label: "Classified items", type: "table", columns: [
      { key: "item", label: "Item" }, { key: "classification", label: "Classification", type: "select", options: CLASS }, { key: "rationale", label: "Rationale" },
    ] },
  ],
  crossref: [
    { key: "method", label: "Comparison method", type: "text" },
    { key: "discrepancies", label: "Discrepancies", type: "table", columns: [
      { key: "item", label: "Item" }, { key: "sourceA", label: "Source A" }, { key: "sourceB", label: "Source B" }, { key: "discrepancyClass", label: "Discrepancy class" },
    ] },
  ],
  identify: [
    { key: "flags", label: "Flagged items", type: "table", columns: [
      { key: "item", label: "Item" }, { key: "proposedAction", label: "Proposed action" }, { key: "accountableRole", label: "Accountable role" },
    ] },
  ],
  review: [
    { key: "coverNote", label: "Cover note", type: "textarea" },
    { key: "priorFeedbackAddressed", label: "Prior feedback addressed?", type: "select", options: ["Yes", "No", "N/A — first review"] },
    { key: "revisionNo", label: "Revision number", type: "number" },
  ],
  present: [
    { key: "deckLink", label: "Deck / artefact link", type: "text" },
    { key: "anticipatedQuestions", label: "Anticipated questions (≥ 3)", type: "list" },
    { key: "signoffDecision", label: "Sign-off decision", type: "select", options: ["Approved", "Approved with conditions", "Rejected"] },
    { key: "decisionDate", label: "Decision date", type: "date" },
  ],
  draft: [
    { key: "docTitle", label: "Document title", type: "text" },
    { key: "sections", label: "Body / sections", type: "textarea" },
    { key: "standardsCited", label: "Standards cited", type: "list", placeholder: "e.g. ISO 27001 A.5.9" },
  ],
  map: [
    { key: "mappings", label: "Mappings", type: "table", columns: [
      { key: "itemA", label: "Item (domain A)" }, { key: "itemB", label: "Item (domain B)" }, { key: "rationale", label: "Rationale" },
    ] },
  ],
  calculate: [
    { key: "formula", label: "Formula / metric", type: "text" },
    { key: "inputs", label: "Source data / inputs", type: "textarea" },
    { key: "result", label: "Result", type: "text" },
  ],
  prioritise: [
    { key: "ranked", label: "Ranked items", type: "table", columns: [
      { key: "item", label: "Item" }, { key: "criterion", label: "Criterion score" }, { key: "rank", label: "Rank" },
    ] },
  ],
  recommend: [
    { key: "recommendations", label: "Recommendations", type: "table", columns: [
      { key: "action", label: "Action" }, { key: "control", label: "Control ref" }, { key: "owner", label: "Owner (role)" }, { key: "targetDate", label: "Target date" },
    ] },
  ],
  validate: [
    { key: "findings", label: "Validated findings", type: "table", columns: [
      { key: "finding", label: "Finding" }, { key: "citation", label: "Citation / source" }, { key: "status", label: "Status", type: "select", options: ["Verified", "Follow-up needed"] },
    ] },
  ],
  schedule: [
    { key: "purpose", label: "Purpose", type: "text" },
    { key: "agenda", label: "Agenda", type: "textarea" },
    { key: "proposedTimes", label: "Proposed times", type: "list" },
    { key: "confirmation", label: "Confirmation received", type: "text" },
  ],
  assess: [
    { key: "items", label: "Assessment", type: "table", columns: [
      { key: "item", label: "Item" }, { key: "evidence", label: "Evidence" }, { key: "rating", label: "Rating" },
    ] },
  ],
  score: [
    { key: "dimensions", label: "Scored dimensions", type: "table", columns: [
      { key: "dimension", label: "Dimension" }, { key: "score", label: "Score (/5)" }, { key: "justification", label: "Justification" },
    ] },
    { key: "aggregate", label: "Aggregate score", type: "number" },
  ],
  compile: [
    { key: "sections", label: "Included sections", type: "list" },
    { key: "executiveSummary", label: "Executive summary", type: "textarea" },
  ],
  brief: [
    { key: "audience", label: "Audience", type: "text" },
    { key: "keyMessage", label: "Key message (plain language)", type: "textarea" },
    { key: "ask", label: "Explicit ask", type: "text" },
  ],
  signoff: [
    { key: "decision", label: "Decision", type: "select", options: ["Approved", "Approved with conditions", "Rejected"] },
    { key: "conditions", label: "Conditions (if any)", type: "textarea" },
    { key: "date", label: "Decision date", type: "date" },
  ],
  interview: [
    { key: "questions", label: "Open questions (≥ 5)", type: "list" },
    { key: "notesPerQuestion", label: "Structured notes", type: "textarea" },
  ],
  document: [
    { key: "sections", label: "Write-up", type: "textarea" },
    { key: "crossReferences", label: "Cross-references", type: "list" },
  ],
};

/** Fallback when a verb has no tailored spec. */
export const GENERIC_FORM: FieldSpec[] = [];
