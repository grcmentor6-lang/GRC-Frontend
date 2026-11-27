import { ACCESS_WEEKS, COUNTS, EXAMS, GLOSSARY_LINE, RETAKE_DAYS, SHARE_BONUS_WEEKS, SUPPORT_LINES } from "./programme";
import { LATE_RULE } from "./desk-plan";

/**
 * The AI mentor's "Common questions" tab: questions learners actually ask, answered once, from the programme's facts
 * (lib/programme.ts) so a number is never typed twice. Add an entry here as each new learner issue comes in.
 */
export interface Faq { q: string; a: string }

const [gate, final] = EXAMS;

export const FAQ: Faq[] = [
  {
    q: "How long do I have access?",
    a: `${ACCESS_WEEKS} weeks from your start date: the ${COUNTS.weeks}-week programme plus two weeks to finish. You are warned after week ${COUNTS.weeks}. After your access ends the desk is read-only: you can still read everything, and your record, CV and certificate stay. Sharing on LinkedIn adds ${SHARE_BONUS_WEEKS} weeks, once.`,
  },
  { q: "What happens if I hand in a task late?", a: LATE_RULE },
  {
    q: "How do the exams work?",
    a: `${gate.title}: week ${gate.week}, ${gate.questions} questions in ${gate.minutes} minutes, pass mark ${gate.passMark}%. ${final.title}: week ${final.week}, ${final.questions} questions in ${final.minutes} minutes, pass mark ${final.passMark}%. Each has ${gate.attempts} attempts, and the clock starts only when you press Start.`,
  },
  { q: "I failed an exam. What now?", a: `Your next attempt opens ${RETAKE_DAYS} days after the last one. Use the time to reread the weeks the questions came from.` },
  { q: "Does a person review my work?", a: SUPPORT_LINES.live },
  { q: "What does a code like KR, SoA or PDCA mean?", a: GLOSSARY_LINE },
  {
    q: "I'm stuck on a step. What should I do?",
    a: "Open the ? on the step for three hints (a nudge, where to look, how to reason it out). Then ask the AI mentor here: tap the \"Ask about …\" bar above the question box so it reads that step with you. If something is broken or missing, use Report a problem at the bottom of this panel and tick \"I'm stuck\": you get an email reply within 24 hours.",
  },
  {
    q: "Can the AI mentor give me the answers?",
    a: "Not before a step is done: it shows you where to look and how to reason, with examples. Once the step is done it explains the full answer and why. It is closed while a knowledge check or an exam is open.",
  },
];
