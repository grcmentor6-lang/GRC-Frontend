import type { Desk } from "./model";
import type { Progress } from "./progress";

/**
 * GRC 101 method badges (pack v1.9.0: GRC101_Engine/p_badges.py, Badges/GRC101_Badges.html).
 *
 * Each badge stands for one family of the GRC work-method catalogue (A–Q) that GRC 101 practises
 * through a task's primary method. Every task except F1.1 earns towards exactly one badge; other
 * tasks that practise the family as a supporting method are shown, not required.
 *
 * Award rule (BKB-MEN-101 Section 13a): earned when every earning task is submitted with a released task
 * score ≥ 65; with distinction when their average is ≥ 85 and none is below 75. The capstone is
 * awarded when all ten method badges are earned.
 */
export const PASS = 65;
export const DIST_AVG = 85;
export const DIST_MIN = 75;

export interface MethodBadge {
  code: string;
  /** The ribbon label: "A", "C1", "CAP". */
  label: string;
  name: string;
  family: string;
  /** The catalogue methods counted, as the pack names them. */
  methods: string;
  /** What the holder can do. */
  can: string;
  colour: string;
  icon: keyof typeof ICONS;
  earn: string[];
  support: string[];
}

export const BADGES: MethodBadge[] = [
  { code: "BDG-A", label: "A", name: "Assessment & Analysis", family: "Assessment and Analysis", methods: "A.iv Identify and discover risks, threats, and assets · A.ii Assess and audit systems, processes, and policies", can: "Reads an organisation's context, assets and policies against a rule and records what is there and what is missing, with a source for every value.", colour: "1F6FB2", icon: "search", earn: ["F1.3", "F2.1", "T4.1"], support: ["T6.1", "T6.2", "T8.1", "T8.2"] },
  { code: "BDG-B", label: "B", name: "Governance & Risk", family: "Governance and Risk Management", methods: "B.vi Develop risk registers and tracking mechanisms · B.vii Establish board-level cybersecurity reporting", can: "Keeps a risk register current with the rating rules and turns it into a Top-5 summary and an acceptance request for the board.", colour: "B23A48", icon: "shield", earn: ["T7.1", "T7.2"], support: ["T12.1"] },
  { code: "BDG-C1", label: "C1", name: "Regulatory Requirements", family: "Compliance and Regulatory Management", methods: "C.i Assess regulatory compliance requirements · C.vi Manage regulatory reporting and documentation · C.vii Monitor regulatory changes and updates", can: "Identifies what binds an organisation — laws, standards and contracts — builds an obligations register, works breach-notification deadlines and briefs on regulatory change.", colour: "7A4FB0", icon: "scales", earn: ["F1.2", "T3.1", "T10.2", "T11.2"], support: ["F1.3", "T10.1"] },
  { code: "BDG-C2", label: "C2", name: "Compliance Mapping & Audit", family: "Compliance and Regulatory Management", methods: "C.ii Map controls to compliance frameworks · C.v Perform compliance audits and assessments", can: "Maps requirements to ISO/IEC 27001 controls and policy, rates coverage, prepares audit evidence requests and supports an external audit.", colour: "5B3E96", icon: "clipboard", earn: ["T3.2", "T5.1", "T12.2"], support: ["T10.1", "T12.1"] },
  { code: "BDG-D", label: "D", name: "Process Documentation", family: "Design and Development", methods: "D.ii Develop and create security tools, processes, and documentation", can: "Turns a policy statement into a standard operating procedure that another person can follow step by step.", colour: "2E8B57", icon: "doc", earn: ["T4.2"], support: [] },
  { code: "BDG-G", label: "G", name: "Control Testing", family: "Testing and Validation", methods: "G.v Execute security control testing · G.viii Validate security configurations · G.i Test and validate security controls and processes", can: "Runs a fixed control-test script on a sample, matches records against logs, calculates SLA status and records each exception with its evidence.", colour: "C76A12", icon: "flask", earn: ["T5.2", "T6.1", "T6.2", "T8.1", "T8.2"], support: ["T5.1"] },
  { code: "BDG-I", label: "I", name: "Security Communication", family: "Communication and Advisory", methods: "I.vi Create cybersecurity awareness campaigns", can: "Assembles an awareness campaign from approved content for a named audience, with timing, channels and measures.", colour: "D04F8A", icon: "megaphone", earn: ["T11.1"], support: ["F1.3", "T5.2", "T7.2", "T10.2"] },
  { code: "BDG-L", label: "L", name: "Third-Party Risk", family: "Third-Party Risk Management", methods: "L.iii Create third-party risk assessment frameworks · L.i Assess vendor security postures", can: "Tiers a vendor, builds its security questionnaire from the question bank and reviews its assurance report before onboarding.", colour: "0E8A8A", icon: "link", earn: ["T9.1", "T9.2"], support: [] },
  { code: "BDG-M", label: "M", name: "Privacy & Data Protection", family: "Legal and Regulatory Coordination", methods: "M.iii Establish data protection protocols", can: "Records a processing activity with its legal basis, data flow and transfers, as required by data-protection law.", colour: "3D5A80", icon: "lock", earn: ["T10.1"], support: ["T10.2"] },
  { code: "BDG-O", label: "O", name: "Quality Assurance", family: "Quality Assurance", methods: "O.ii Review deliverables for compliance", can: "Checks evidence and deliverables against a fixed checklist, rejects what fails with a defect code, and verifies that corrective actions are really closed.", colour: "4A6B1F", icon: "check", earn: ["F2.2", "T12.1"], support: ["T4.1", "T5.1", "T5.2", "T12.2"] },
];

export const CAPSTONE: MethodBadge = {
  code: "BDG-CAP",
  label: "CAP",
  name: "GRC 101 Method Portfolio",
  family: "All GRC 101 method families",
  methods: "",
  can: "Holds every GRC 101 method badge: has practised assessment, risk, regulatory and audit work, documentation, testing, communication, third-party risk, privacy and quality assurance on graded deliverables.",
  colour: "1F3864",
  icon: "star",
  earn: [],
  support: [],
};

/** Method families with no badge in GRC 101, and why (p_badges.BADGE_NOTES). */
export const NO_BADGE: [string, string][] = [
  ["N — Project Execution", "F1.1 (onboarding) is the only task whose primary method is Project Execution. It is the prerequisite for every task, so it earns no badge."],
  ["H — Monitoring and Management", "Practised as a supporting method inside T6.2 and T8.1, which earn the Control Testing badge."],
  ["J — Response and Recovery", "Practised as a supporting method inside T10.2, which earns the Regulatory Requirements badge."],
  ["Q — Knowledge Transfer", "Practised as a supporting method inside T4.2 and T11.1, which earn the Process Documentation and Security Communication badges."],
  ["P — Track and resolve defects", "Counted with O on the Quality Assurance badge (F2.2 defect codes; T4.1 policy alignment)."],
  ["E, F, K", "Strategic planning and architecture, implementation, and business continuity are not practised in GRC 101."],
];

/** The badge a task earns towards (none for F1.1). */
export const badgeOfTask = (taskId: string) => BADGES.find((b) => b.earn.includes(taskId)) ?? null;

export type BadgeState = "distinction" | "earned" | "in-progress" | "not-started";
export interface BadgeStanding {
  state: BadgeState;
  submitted: number;
  /** Earning tasks with a released score. */
  scored: number;
  total: number;
  average: number | null;
}

/**
 * Where a badge stands. Earning needs released task scores; the desk does not score tasks yet, so
 * `scores` is empty and a badge can at most be "in progress" — its tasks submitted, awaiting scores.
 * ponytail: pass the released scores once grading returns them (taskId → 0–100); nothing else changes.
 */
export function standing(b: MethodBadge, p: Progress, scores: Record<string, number> = {}): BadgeStanding {
  const total = b.earn.length;
  const submitted = b.earn.filter((t) => p.submitted[t]).length;
  const got = b.earn.map((t) => scores[t]).filter((s): s is number => typeof s === "number");
  const average = got.length ? got.reduce((x, y) => x + y, 0) / got.length : null;
  const earned = total > 0 && got.length === total && submitted === total && got.every((s) => s >= PASS);
  const distinction = earned && average !== null && average >= DIST_AVG && got.every((s) => s >= DIST_MIN);
  const begun = submitted > 0 || b.earn.some((t) => Object.keys(p.done).some((k) => k.startsWith(`${t}-`)));
  return { state: distinction ? "distinction" : earned ? "earned" : begun ? "in-progress" : "not-started", submitted, scored: got.length, total, average };
}

export function capstoneStanding(p: Progress, scores: Record<string, number> = {}): BadgeStanding {
  const all = BADGES.map((b) => standing(b, p, scores));
  const earned = all.filter((s) => s.state === "earned" || s.state === "distinction").length;
  return {
    state: earned === BADGES.length ? "earned" : all.some((s) => s.state !== "not-started") ? "in-progress" : "not-started",
    submitted: earned,
    scored: earned,
    total: BADGES.length,
    average: null,
  };
}

export const criteriaText = (b: MethodBadge) =>
  b.code === CAPSTONE.code
    ? `Awarded automatically when all ${BADGES.length} method badges are earned.`
    : `Earned: ${b.earn.length === 1 ? "the task" : b.earn.length === 2 ? "both tasks" : `all ${b.earn.length} tasks`} (${b.earn.join(", ")}) submitted with a released task score ≥ ${PASS}. With distinction: average ≥ ${DIST_AVG} and no task below ${DIST_MIN}.`;

/** Line icons drawn in white on the hexagon (viewBox 0 0 120 132), as the pack draws them. */
export const ICONS = {
  search: '<circle cx="56" cy="54" r="15"/><path d="M67 65l12 12"/>',
  shield: '<path d="M60 36l20 7v14c0 13-9 22-20 27-11-5-20-14-20-27V43z"/><path d="M60 50v14M60 70v1"/>',
  scales: '<path d="M60 38v42M46 80h28M42 46h36"/><path d="M42 46l-8 16h16zM78 46l-8 16h16z"/><path d="M34 62a8 4 0 0 0 16 0M70 62a8 4 0 0 0 16 0"/>',
  clipboard: '<path d="M48 40h24v6H48z"/><path d="M44 43h-4v41h40V43h-4"/><path d="M48 62l8 7 16-14"/>',
  doc: '<path d="M46 36h20l10 10v38H46z"/><path d="M66 36v10h10M52 58h18M52 66h18M52 74h12"/>',
  flask: '<path d="M53 36h14M56 36v16L42 78a4 4 0 0 0 4 6h28a4 4 0 0 0 4-6L64 52V36"/><path d="M48 68h24"/>',
  megaphone: '<path d="M40 54v12h8l20 12V42L48 54z"/><path d="M76 52c4 3 4 13 0 16M50 66l4 14h6l-3-13"/>',
  link: '<path d="M54 64a8 8 0 0 0 11 0l9-9a8 8 0 0 0-11-11l-3 3"/><path d="M66 56a8 8 0 0 0-11 0l-9 9a8 8 0 0 0 11 11l3-3"/>',
  lock: '<rect x="44" y="56" width="32" height="26" rx="3"/><path d="M50 56v-7a10 10 0 0 1 20 0v7M60 66v6"/>',
  check: '<circle cx="60" cy="59" r="21"/><path d="M50 59l7 7 14-14"/>',
  star: '<path d="M60 36l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z"/>',
};

/** The pack's darker edge: each channel × 0.72. */
export function shade(hex: string, f = 0.72) {
  return [0, 2, 4]
    .map((i) => Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** Tasks that count towards badges, for checks: every task but F1.1, each in exactly one badge. */
export function checkMapping(desk: Desk): string[] {
  const problems: string[] = [];
  for (const id of desk.order) {
    const n = BADGES.filter((b) => b.earn.includes(id)).length;
    if (id === "F1.1" ? n !== 0 : n !== 1) problems.push(`${id} earns towards ${n} badges`);
  }
  return problems;
}
