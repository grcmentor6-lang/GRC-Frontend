import type { Desk } from "./model";
import type { Progress } from "./progress";

/**
 * GRC 101 method badges. The families are the pack's (GRC work-method catalogue A–Q, colours and icons from
 * GRC101_Badges.html); which task earns which is his Tasks sheet's "GRC method practised" (docs/li101/LI101_source.xlsx):
 * a task earns towards the badge of its method's family. Every task except F1.1 earns towards exactly one badge, and no
 * task names M, so the pack's Privacy & Data Protection badge is not offered (see NO_BADGE).
 *
 * Award rule (the programme rule; no document of that name is on the platform): earned when every earning task is submitted with a released task
 * score ≥ 65; with distinction when their average is ≥ 85 and none is below 75. The capstone is
 * awarded when every method badge is earned.
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
  /** The catalogue methods his tasks practise for this family, as he names them, joined by " · ". */
  methods: string;
  /** What the holder can do. */
  can: string;
  colour: string;
  icon: keyof typeof ICONS;
  earn: string[];
}

export const BADGES: MethodBadge[] = [
  { code: "BDG-A", label: "A", name: "Assessment & Analysis", family: "Assessment and Analysis", methods: "A.iv Identify and discover risks, threats, and assets · A.ii Assess and audit systems, processes, and policies", can: "Assesses an ISMS and its setting against ISO/IEC 27001: the organisation's context, the baseline gap and maturity of clauses 4–10, the information security policy, the asset inventory and a physical walkthrough, with a source for every finding.", colour: "1F6FB2", icon: "search", earn: ["F1.3", "F2.2", "T3.1", "T4.1", "T9.1"] },
  { code: "BDG-B", label: "B", name: "Governance & Risk", family: "Governance and Risk Management", methods: "B.vi Develop risk registers and tracking mechanisms · B.vii Establish board-level cybersecurity reporting", can: "Keeps the risk register current: asset–threat–control chains, the risk treatment plan and an acceptance request, and the measures that report ISMS performance to management.", colour: "B23A48", icon: "shield", earn: ["T4.2", "T5.1", "T11.1"] },
  { code: "BDG-C1", label: "C1", name: "Regulatory Requirements", family: "Compliance and Regulatory Management", methods: "C.i Assess regulatory compliance requirements", can: "Identifies what an ISMS must meet: the ISO/IEC 27000 family of standards, and an office's legal, privacy and continuity obligations, recorded in an obligations register and a record of processing.", colour: "7A4FB0", icon: "scales", earn: ["F1.2", "T8.2"] },
  { code: "BDG-C2", label: "C2", name: "Compliance Mapping & Audit", family: "Compliance and Regulatory Management", methods: "C.ii Map controls to compliance frameworks · C.v Perform compliance audits and assessments", can: "Maps risks to the 93 ISO/IEC 27001 Annex A controls in a Statement of Applicability, plans an internal audit programme and raises nonconformities, and answers a certification body's requests and findings.", colour: "5B3E96", icon: "clipboard", earn: ["T5.2", "T11.2", "T12.2"] },
  { code: "BDG-D", label: "D", name: "Process Documentation", family: "Design and Development", methods: "D.ii Develop and create security tools, processes, and documentation", can: "Writes the ISMS documents others work from: the scope statement and process list, the RACI of ISMS roles, and the document-control block and mandatory-documents register.", colour: "2E8B57", icon: "doc", earn: ["F2.1", "T3.2", "T6.2"] },
  { code: "BDG-G", label: "G", name: "Control Testing", family: "Testing and Validation", methods: "G.viii Validate security configurations · G.i Test and validate security controls and processes · G.v Execute security control testing", can: "Tests controls and records each exception with its evidence: access rules, an incident tabletop, vulnerability-remediation SLAs, configuration baselines and a sample of changes.", colour: "C76A12", icon: "flask", earn: ["T7.1", "T8.1", "T9.2", "T10.1", "T10.2"] },
  { code: "BDG-I", label: "I", name: "Security Communication", family: "Communication and Advisory", methods: "I.vi Create cybersecurity awareness campaigns", can: "Sets out the competence the ISMS needs, plans its communication and builds an awareness campaign for a named audience, with timing, channels and measures.", colour: "D04F8A", icon: "megaphone", earn: ["T6.1"] },
  { code: "BDG-L", label: "L", name: "Third-Party Risk", family: "Third-Party Risk Management", methods: "L.iii Create third-party risk assessment frameworks", can: "Tiers suppliers, checks their contracts against a clause checklist and sets out who is responsible for what in cloud and supply-chain services.", colour: "0E8A8A", icon: "link", earn: ["T7.2"] },
  { code: "BDG-O", label: "O", name: "Quality Assurance", family: "Quality Assurance", methods: "O.ii Review deliverables for compliance", can: "Verifies that corrective actions are really closed, prepares the management-review pack and sets the roadmap to the next maturity level.", colour: "4A6B1F", icon: "check", earn: ["T12.1"] },
];

export const CAPSTONE: MethodBadge = {
  code: "BDG-CAP",
  label: "CAP",
  name: "GRC 101 Method Portfolio",
  family: "All GRC 101 method families",
  methods: "",
  can: "Holds every GRC 101 method badge: has practised assessment, risk, regulatory and audit work, documentation, control testing, communication, third-party risk and quality assurance on graded deliverables of an ISO/IEC 27001 implementation.",
  colour: "1F3864",
  icon: "star",
  earn: [],
};

/** Method families with no badge in GRC 101, and why. */
export const NO_BADGE: [string, string][] = [
  ["N — Project Execution", "F1.1 (onboarding) is the only task whose method is Project Execution. It is the prerequisite for every task, so it earns no badge."],
  ["M — Legal and Regulatory Coordination", "No task's method is M. The record of processing is worked in T8.2, whose method is C.i, so it counts towards Regulatory Requirements."],
  ["E, F, H, J, K, P, Q", "Not the method of any GRC 101 task."],
];

/** The badge a task earns towards (none for F1.1). */
export const badgeOfTask = (taskId: string) => BADGES.find((b) => b.earn.includes(taskId)) ?? null;

/** Released task scores, taskId → 0–100, or null for a submitted task the server released no score for. */
export type Scores = Record<string, number | null>;

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
 * Where a badge stands, from the released task scores (taskId → 0–100, GET /me/record: released at
 * submission, each pick re-checked against its key on the server). Without scores a badge is at most
 * "in progress".
 */
export function standing(b: MethodBadge, p: Progress, scores: Scores = {}): BadgeStanding {
  const total = b.earn.length;
  const submitted = b.earn.filter((t) => p.submitted[t]).length;
  const got = b.earn.map((t) => scores[t]).filter((s): s is number => typeof s === "number");
  const average = got.length ? got.reduce((x, y) => x + y, 0) / got.length : null;
  const earned = total > 0 && got.length === total && submitted === total && got.every((s) => s >= PASS);
  const distinction = earned && average !== null && average >= DIST_AVG && got.every((s) => s >= DIST_MIN);
  const begun = submitted > 0 || b.earn.some((t) => Object.keys(p.done).some((k) => k.startsWith(`${t}-`)));
  return { state: distinction ? "distinction" : earned ? "earned" : begun ? "in-progress" : "not-started", submitted, scored: got.length, total, average };
}

export function capstoneStanding(p: Progress, scores: Scores = {}): BadgeStanding {
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

export interface MethodBadgeSummary {
  rows: { b: MethodBadge; g: BadgeStanding }[];
  earned: number;
  total: number;
  capstone: BadgeStanding;
}

export const isEarned = (g: BadgeStanding) => g.state === "earned" || g.state === "distinction";

/** The one badge count: the Badges page, the Dashboard and the CV all read it, from progress and the released scores. */
export function summarise(p: Progress, scores: Scores = {}): MethodBadgeSummary {
  const rows = BADGES.map((b) => ({ b, g: standing(b, p, scores) }));
  return { rows, earned: rows.filter((r) => isEarned(r.g)).length, total: BADGES.length, capstone: capstoneStanding(p, scores) };
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

/** Tasks that count towards badges, for checks: every task but F1.1, each in exactly one badge, the one whose
 *  methods name the task's own "GRC method practised". */
export function checkMapping(desk: Desk): string[] {
  const problems: string[] = [];
  for (const id of desk.order) {
    const bs = BADGES.filter((b) => b.earn.includes(id));
    if (id === "F1.1" ? bs.length !== 0 : bs.length !== 1) problems.push(`${id} earns towards ${bs.length} badges`);
    else if (bs[0] && !bs[0].methods.split(" · ").includes(desk.tasks[id].method)) problems.push(`${id} practises ${desk.tasks[id].method}, not ${bs[0].code}`);
  }
  return problems;
}
