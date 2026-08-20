// Brief worked tasks. Source: Brief_Verb_Task_Register.xlsx. Mentee defines the audience + explicit
// ask and writes <=5 plain-language key messages. Gate = audience + ask + >=3 messages (no jargon is
// Layer-2). Answer-key audience/ask shown as placeholders.

export interface BriefTask { title: string; standard: string; format: string; audience: string; ask: string; messages: string[]; }

export const BRIEF_TASKS: Record<string, BriefTask> = {
  "CA-002/8": {
    title: "Status Report Covering Note (management)", standard: "ISO 27001 Cl 9.3 Management review",
    format: "email, <=200 words", audience: "Management team (non-technical)",
    ask: "Read the one-page report before Thursday's meeting and come with a decision on the two items marked 'decision required'.",
    messages: [
      "The attached page is our compliance position this month - one page, no appendices.",
      "Two items need a decision from you; the rest is for information only and needs nothing.",
      "Overall status is Amber: the controls we have are working, the ones we lack are governance rather than technology.",
      "The biggest single exposure is that leavers keep working access for an average of nine days.",
      "What we need: read it before Thursday, and come ready to decide on the two flagged items.",
    ],
  },
  "CA-003/2": {
    title: "Interview Pre-Brief (stakeholder)", standard: "ISO 27001 Cl 4.2 Interested parties; Cl 7.4",
    format: "email, <=150 words", audience: "Individual stakeholder before their interview",
    ask: "Confirm a 30-minute slot this fortnight, and come with one thing about GRC that currently gets in your way.",
    messages: [
      "I am spending 30 minutes with each of a few people to understand what GRC should be doing for you.",
      "This is not an audit and nothing you say is a finding against you or your team.",
      "I want to hear where our processes get in your way, not whether you follow them.",
      "I will send you my summary within a day so you can correct anything I have misheard.",
      "What I need: a 30-minute slot this fortnight, and one example of GRC getting in your way.",
    ],
  },
  "CRM-003/9.8": {
    title: "SOC 2 Awareness (IT team)", standard: "SOC 2 Type II", format: "≤2 pages",
    audience: "IT team (non-audit)", ask: "Send your team's access-review and change-tickets evidence to the GRC inbox by 31 July.",
    messages: ["SOC 2 is a customer-trust audit of how we keep their data safe — it checks our day-to-day controls.", "We are mostly ready: 16 of 20 control areas are in good shape.", "The main gap is security monitoring — we don't yet watch system logs for problems.", "To pass, we need each team to keep simple evidence: who has access, and a record of changes.", "What we need from you: send your access-review and change records to the GRC inbox by month-end."],
  },
  "IE-002/7": {
    title: "Document Control Policy (stakeholders)", standard: "ISO 27001 Cl 7.5", format: "1 page",
    audience: "All GRC stakeholders", ask: "From 1 August, save all GRC documents in the new shared library using the naming rule on the intranet.",
    messages: ["We now have one place and one naming rule for all GRC documents.", "Every document has a version number, an owner, and a review date.", "Old copies on personal drives should be deleted to avoid using out-of-date versions.", "If you need to change a document, ask the owner — they keep the master copy.", "What we need: from 1 August, save all GRC documents in the new shared library."],
  },
  "QA-002/8": {
    title: "Control-Testing Methodology (mentor)", standard: "ISO 27001 A.5.35/5.36", format: "1 page",
    audience: "Compliance Manager", ask: "Adopt this four-step testing method as the standard for future internal control checks.",
    messages: ["I built a simple, repeatable way to test whether a control actually works.", "It has four steps: pick the control, define what 'good' looks like, gather evidence, judge pass or fail.", "Each test records the evidence so the result can be checked later.", "It can be reused for any control without re-inventing the approach each time.", "What we need: adopt this four-step method as our standard for internal control checks."],
  },
};

export function getBriefTask(taskCode?: string, activityCode?: string): BriefTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return BRIEF_TASKS[`${taskCode}/${activityCode}`];
}
