import type { TourStep } from "@/components/app/guided-tour";
import { docTable } from "@/lib/desk/docs";

/**
 * Walk-throughs for steps, shown in the step's modal the first time it opens (and again from
 * "Show me how"). A card earns its place only by showing something the screen does not already
 * say: where a value lives, which control to press. The "do it" cards wait for the mentee's own
 * action (a cursor taps the control) rather than a Next button.
 *
 * Keyed "<task>-<step>". Targets are found by data-guide attributes (the READ-ME-FIRST table, a
 * toolbar section, its open menu, the complete button), so a guide never depends on class names.
 */
const $ = (sel: string) => document.querySelector<HTMLElement>(sel);
const ORG_WINDOW = 'section[role="dialog"][aria-label="Home › My Organisation"]';
const TASKS_WINDOW = 'section[role="dialog"][aria-label="Home › My Tasks"]';
const PLAN_WINDOW = 'section[role="dialog"][aria-label^="Home › My plan"]';
const QR_WINDOW = 'section[role="dialog"][aria-label*="Framework Quick Reference"]';
const firstCell = () => $('[data-guide="rmf-table"] input');
/** The first row's value is in and matches its screen (the row is not flagged). */
const firstRowRight = () => {
  const el = firstCell() as HTMLInputElement | null;
  return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true";
};

/**
 * A decision answered in its own step row (F1.1 steps 2 and 3): the question, Check my answer, the
 * feedback, then the step's second part, which opens only once the answer is checked.
 */
const decideInRow = (n: number, question: string, partTwo: TourStep[], finish: string, first = true): TourStep[] => {
  const row = (sel: string) => $(`#act-${n} ${sel}`);
  if (!first)
    return [
      {
        title: "The question first",
        icon: "help",
        body: `This step has two parts. First, ${question} Answer it as in step 2: pick an option and click Check my answer. Part 2 opens then.`,
        getEl: () => row('[data-guide="decision"]'),
        pointAt: () => row('[data-guide="decision-context"]'),
        nextWhen: () => !!row('[data-guide="decision-result"]'),
        doIt: "Pick an option and click Check my answer",
      },
      ...partTwo,
      { title: "Finish here", icon: "check", body: finish, getEl: () => row('[data-guide="step-complete"]') },
    ];
  return [
    {
      title: "A question first",
      icon: "help",
      body: `${partTwo.length ? "This step has two parts. First, " : "This step is "}${question} Read the situation in the box, then the three options.`,
      getEl: () => row('[data-guide="decision"]'),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => row('[data-guide="decision"]'),
      // At the situation, never at an option: the cursor must not suggest an answer.
      pointAt: () => row('[data-guide="decision-context"]'),
      nextWhen: () => !!row('[data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it. If your pick was not the best, read why before you go on.",
      getEl: () => row('[data-guide="decision"]'),
    },
    ...partTwo,
    {
      title: "Finish here",
      icon: "check",
      body: finish,
      getEl: () => row('[data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how.",
      getEl: () => row('[data-guide="show-me-how"]'),
    },
  ];
};

/** "Click Home", then the screen in its menu the step tags: the same two clicks on every step. */
const openFromHome = (screen: string, window: string, tagged: string): TourStep[] => [
  {
    title: "Open Home",
    icon: "home",
    body: "Platform screens open from the toolbar at the bottom of the page.",
    getEl: () => $('[data-guide-section="home"]'),
    waitFor: () => !!$('[data-guide-menu="home"]'),
    doIt: "Click Home",
  },
  {
    title: `Open ${screen}`,
    icon: "grid",
    body: `The screen this step needs is tagged ${tagged}.`,
    getEl: () => $('[data-guide-menu="home"] li[data-target] button'),
    waitFor: () => !!$(window),
    doIt: `Click ${screen}`,
  },
];

/** Naming the file by the convention, Submit, the receipt: the hand-in every task's last step makes. */
const nameAndSubmit = (ext: string, steps: string): TourStep[] => [
  {
    title: "Name the file",
    icon: "edit",
    body: `Type the four parts listed under the box, in order, joined by underscores, then .${ext}.`,
    getEl: () => $('[data-guide="file-name"]'),
    pointAt: () => $('[data-guide="file-name-input"]'),
    nextWhen: () => {
      const el = $('[data-guide="file-name-input"]') as HTMLInputElement | null;
      return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true";
    },
    doIt: "Type the file name",
  },
  {
    title: "Submit it",
    icon: "upload",
    body: `Submit hands the file in; it opens once steps ${steps} are complete. The receipt shows a hash (a fingerprint of the file) and a UTC time. If either is missing, use Report a problem, at the bottom right.`,
    getEl: () => $('[data-guide="submit"]'),
  },
  {
    title: "Finish here",
    icon: "check",
    body: "With the receipt in, mark the step complete. That is the \"Done\" the step asks for.",
    getEl: () => $('[data-guide="mark-complete"]'),
  },
];

const LIBRARY_WINDOW = 'section[role="dialog"][aria-label="Policies › Policy Library"]';
const ADD16_WINDOW = 'section[role="dialog"][aria-label^="BKB-ADD-16"]';
/** A cell of the T-FAM register by its column header and row number ("E Offices (R02)", 2). */
const famCell = (col: string, row: number) => $(`[data-guide="register"] [aria-label="${col}, row ${row}"]`);
/** The cell is filled and in a form the step allows (not flagged). */
const cellIn = (el: HTMLElement | null) => !!(el as HTMLInputElement | null)?.value.trim() && el!.getAttribute("aria-invalid") !== "true";

/** Policies › Policy Library › the addendum: the three clicks to a document a step reads. */
const openAddendum = (n: number): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: "Policies carries the dot: BKB-ADD-16 is in its Policy Library.",
    getEl: () => $('[data-guide-section="policies"]'),
    waitFor: () => !!$('[data-guide-menu="policies"]'),
    doIt: "Click Policies",
  },
  {
    title: "Open the Policy Library",
    icon: "grid",
    body: `The screen this step reads is tagged Step ${n}.`,
    getEl: () => $('[data-guide-menu="policies"] li[data-target] button'),
    waitFor: () => !!$(LIBRARY_WINDOW),
    doIt: "Click Policy Library",
  },
  {
    title: "Open BKB-ADD-16",
    icon: "book",
    body: `Your organisation's addendum is tagged Step ${n}. It opens beside the brief.`,
    getEl: () => $(`${LIBRARY_WINDOW} [data-doc="BKB-ADD-16"]`),
    waitFor: () => !!$(ADD16_WINDOW),
    doIt: "Click BKB-ADD-16",
  },
];
/** The addendum's section, scrolled to its top in its window. */
const addSec = (sec: string) => ({
  getEl: () => $(`${ADD16_WINDOW} [data-sec="${sec}"]`),
  onEnter: () => $(`${ADD16_WINDOW} [data-sec="${sec}"]`)?.scrollIntoView({ block: "start" }),
});
const briefSec = () => $('[data-guide="brief-section"]');
/** The list being copied has its first line in and matching the source. */
const firstLineRight = () => !!$('[data-guide="brief-section"] textarea[data-first-ok="true"]');
/** A cell of CTX-IP by column and row number. */
const ipCell = (col: string, row: number) => $(`[data-guide="register"] [aria-label="${col}, row ${row}"]`);

const STD_WINDOW = 'section[role="dialog"][aria-label^="BKB-STD-001"]';
/** Policies › Policy Library › a Group document: the three clicks to a document a step reads. */
const openGroupDoc = (n: number, code: string, what: string, win: string): TourStep[] => [
  ...openAddendum(n).slice(0, 2),
  {
    title: `Open ${code}`,
    icon: "book",
    body: `${what} is tagged Step ${n}.`,
    getEl: () => $(`${LIBRARY_WINDOW} [data-doc="${code}"]`),
    waitFor: () => !!$(win),
    doIt: `Click ${code}`,
  },
];
/** The addendum, opened beside CLS-RES rather than the brief. */
const openAddendumBeside = (n: number): TourStep[] => [
  ...openAddendum(n).slice(0, 2),
  { ...openAddendum(n)[2], body: `Your organisation's addendum is tagged Step ${n}. It opens beside the worksheet.` },
];
const stdSec = (sec: string) => ({
  getEl: () => $(`${STD_WINDOW} [data-sec="${sec}"]`),
  onEnter: () => $(`${STD_WINDOW} [data-sec="${sec}"]`)?.scrollIntoView({ block: "start" }),
});
/** A field of CLS-RES's two tables by its label ("Tier 1 (Public)"). */
const clsField = (label: string) => $(`[data-guide="brief-section"] input[aria-label="${label}"]`);
/** The R05 check of a CLS-RES row (A-03 is row 3). */
const r05 = (row: number) => famCell("Personal data or credentials? (R05)", row) as HTMLSelectElement | null;

const DC_WINDOW = 'section[role="dialog"][aria-label="Evidence › Defect Codes"]';
/** Evidence › Defect Codes, opened beside EVQ-RES: the two clicks from the toolbar. */
const openDefectCodes = (n: number): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: "Evidence carries the dot: Defect Codes is in its menu, tagged with this step.",
    getEl: () => $('[data-guide-section="evidence"]'),
    waitFor: () => !!$('[data-guide-menu="evidence"]'),
    doIt: "Click Evidence",
  },
  {
    title: "Open Defect Codes",
    icon: "grid",
    body: `The list of the ten checks, D1 to D10, is tagged Step ${n}. It opens beside the results file.`,
    getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="evidence"] li[data-target] button')].find((b) => /Defect Codes/.test(b.innerText)) ?? null,
    waitFor: () => !!$(DC_WINDOW),
    doIt: "Click Defect Codes",
  },
];
/** EVQ-RES's decision cell of an item ("E-003"). */
const evqWalk = (item: string) => $(`[data-guide="register"] [aria-label="Check ${item} against the checklist"]`);
const evqSelect = () => $('[data-guide="register"] select') as HTMLSelectElement | null;

/** T3.1: a cell of the register in hand by column and row number ("Office(s)", 1). */
const oblCell = (col: string, row: number) => $(`[data-guide="register"] [aria-label="${col}, row ${row}"]`);
const oblAdd = () => [...document.querySelectorAll<HTMLElement>('[data-guide="register"] button')].find((b) => /Add a row/.test(b.innerText)) ?? null;
const oblRows = () => document.querySelectorAll('[data-guide="register"] tbody tr').length;
const POL000_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-000"]';
const ERM_WINDOW = 'section[role="dialog"][aria-label^="BKB-ERM-001"]';
const OP_WINDOW = 'section[role="dialog"][aria-label^="Organization_Profiles"]';
const PAGE_WINDOW = (id: string) => `section[role="dialog"][aria-label="${id}"]`;
/** Learn › a screen of its menu, by name: the two clicks from the toolbar. */
const openLearn = (screen: string, what: string, win: string): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: `Learn carries the dot: ${screen} is in its menu, tagged with this step.`,
    getEl: () => $('[data-guide-section="learn"]'),
    waitFor: () => !!$('[data-guide-menu="learn"]'),
    doIt: "Click Learn",
  },
  {
    title: `Open ${screen}`,
    icon: "grid",
    body: what,
    getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="learn"] li button')].find((b) => b.innerText.includes(screen)) ?? null,
    waitFor: () => !!$(win),
    doIt: `Click ${screen}`,
  },
];
/** Learn › Reference pages › a page: three clicks. */
const openPage = (n: number, id: string): TourStep[] => [
  ...openLearn("Reference pages", "The pack's reference sheets, one window each.", 'section[role="dialog"][aria-label="Learn › Reference pages"]'),
  {
    title: `Open ${id}`,
    icon: "table",
    body: `The page this step reads is tagged Step ${n}. Drag its window aside if it covers the table.`,
    getEl: () => $(`[data-guide="reference-pages"] [data-page="${id}"]`),
    // The list is long (Ref-Rules is far down it): the page's line is brought into view.
    onEnter: () => $(`[data-guide="reference-pages"] [data-page="${id}"]`)?.scrollIntoView({ block: "nearest" }),
    waitFor: () => !!$(PAGE_WINDOW(id)),
    doIt: `Click ${id}`,
  },
];
/** A select of the register in hand holds a value it accepts (filled, not flagged). */
const selIn = (col: string, row: number) => {
  const el = oblCell(col, row) as HTMLSelectElement | null;
  return !!el?.value && el.getAttribute("aria-invalid") !== "true";
};
/** A line of the brief section in hand by its label ("covers"). */
const briefIn = (label: string) => $(`[data-guide="brief-section"] input[aria-label="${label}"]`);
const finish = (body: string): TourStep => ({ title: "Finish here", icon: "check", body, getEl: () => $('[data-guide="mark-complete"]') });

/** T3.2: a toolbar section's screen, by name: the two clicks from the toolbar. */
const openScreen = (sec: string, label: string, screen: string, what: string, win: string): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: `${label} carries the dot: ${screen} is in its menu, tagged with this step.`,
    getEl: () => $(`[data-guide-section="${sec}"]`),
    waitFor: () => !!$(`[data-guide-menu="${sec}"]`),
    doIt: `Click ${label}`,
  },
  {
    title: `Open ${screen}`,
    icon: "grid",
    body: what,
    getEl: () => [...document.querySelectorAll<HTMLElement>(`[data-guide-menu="${sec}"] li button`)].find((b) => b.innerText.includes(screen)) ?? null,
    waitFor: () => !!$(win),
    doIt: `Click ${screen}`,
  },
];
const XW_WINDOW = 'section[role="dialog"][aria-label^="Frameworks › Crosswalk"]';
const openCrosswalk = (what: string) => openScreen("frameworks", "Frameworks", "Crosswalk View", what, XW_WINDOW);
/** Policies › Policy Library › a document: the dot, the library, the document. */
const openLib = (n: number, code: string, what: string, win: string): TourStep[] => [
  ...openScreen("policies", "Policies", "Policy Library", `The library is tagged Step ${n}.`, LIBRARY_WINDOW),
  {
    title: `Open ${code}`,
    icon: "book",
    body: `${what} is tagged Step ${n}.`,
    getEl: () => $(`${LIBRARY_WINDOW} [data-doc="${code}"]`),
    waitFor: () => !!$(win),
    doIt: `Click ${code}`,
  },
];
const POLICY_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-0"]';
/** The first input of a register column that is still open on this step. */
/** Rule L06's row in Learn › Reference pages › Ref-Rules (Rule tables shortens it). */
const l06Row = () => [...document.querySelectorAll<HTMLElement>(`${PAGE_WINDOW("Ref-Rules")} tr`)].find((tr) => /^\s*L06/.test(tr.innerText)) ?? null;
const firstInput = (col: string) => $(`[data-guide="register"] [aria-label^="${col}, row "]`);

const POL006_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-006"]';
const POL001_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-001"]';
const CHARTER_WINDOW = 'section[role="dialog"][aria-label^="Charter"]';
const POL021_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-021"]';
const ADD36_WINDOW = 'section[role="dialog"][aria-label^="BKB-ADD-36"]';
/** T9.1: Vendors › Vendor Intake (Lumen's form) and the supplier policy. */
const VEN_INTAKE_WINDOW = 'section[role="dialog"][aria-label^="Vendors › Vendor Intake"]';
const POL013_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-013"]';
/** T9.2: Vendors › SOC Report Review (Lumen's SOC 2 report summary). */
const SOC_WINDOW = 'section[role="dialog"][aria-label^="Vendors › SOC Report Review"]';
/** T10.1: the data-protection policy, the processing description and LearnTech's asset register. */
const POL017_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-017"]';
const ROPA_WINDOW = 'section[role="dialog"][aria-label^="Regulatory Watch › RoPA & Data Flows"]';
const ASSET_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Asset Register"]';
/** T10.2: the incident record of INC-2610-3001 and the incident policy. */
const BRC_WINDOW = 'section[role="dialog"][aria-label^="Regulatory Watch › Breach Clock Calculator"]';
const POL014_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-014"]';
/** T11.1: the content bank (Awareness › Content Templates) and the awareness policy. */
const CT_WINDOW = 'section[role="dialog"][aria-label^="Awareness › Content Templates"]';
const POL020_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-020"]';
/** A select of the register in hand holds the value the source gives (the learner's first item, worked out). */
const selIs = (col: string, row: number, want: string) => !!want && (oblCell(col, row) as HTMLSelectElement | null)?.value === want;
/** BKB-POL-021 Section 6.1, line `row`, column `col` ("" until the document is loaded). */
const pol021At = (row: number, col: number) => docTable("BKB-POL-021", "6.1")?.[row - 1]?.[col] ?? "";
/** The time limit of Section 6.1 line `row`: after the dash, capitalised as the SOP writes it. */
const limitAt = (row: number) => { const x = (pol021At(row, 3).split(" — ")[1] ?? "").trim(); return x.charAt(0).toUpperCase() + x.slice(1); };

/** T5.1: the windows its steps read, and a few of their parts. */
const PBC_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Audit Requests"]';
const POL016_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-016"]';
const RULES_WINDOW = 'section[role="dialog"][aria-label*="› Rule tables"]';
const GLOSSARY_WINDOW = 'section[role="dialog"][aria-label*="› Glossary"]';
const CARD_WINDOW = PAGE_WINDOW("Ref-Certification card");
/** T6.1: the windows its steps read. */
const START_WINDOW = 'section[role="dialog"][aria-label^="Access Reviews › Start Review"]';
const UARPLAN_WINDOW = PAGE_WINDOW("Ref-UAR test plan");
const UCODES_WINDOW = PAGE_WINDOW("Ref-UAR codes");
/** T6.1 step 3: the account's Result and Attributes failed cells, as recorded. */
const uarResult = (id: string) => {
  const td = evqWalk(id)?.closest("td");
  return [evqWalk(id)?.innerText.trim() ?? "", (td?.nextElementSibling as HTMLElement | null)?.innerText.trim() ?? ""];
};
/** T6.2: the leavers' disable logs, on the screen the task shares with T6.1. */
const TUC_WINDOW = 'section[role="dialog"][aria-label^="Access Reviews › Terminated User Check"]';
/** T7.1: RRU-EVENTS and the office register, the task's own screens of Risk Register › New Risk and Score Risk. */
const NEWRISK_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › New Risk"]';
const SCORE_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Score Risk"]';
const POL010_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-010"]';
const HEAT_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Heat Map"]';
const WAIT_WINDOW = 'section[role="dialog"][aria-label^="Home › Waiting On"]';
const CAL_WINDOW = 'section[role="dialog"][aria-label^="Home › Calendar"]';
/** T6.2 step 4: a leaver's Timeliness and Disabled late in cells, as recorded. */
const lvrResult = (id: string) => uarResult(id);
/** T5.2: Evidence › Evidence Library, opened from the toolbar (dataset EVP-REPO). */
const LIB_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Evidence Library"]';
/** A row of a window's table, by the start of its first cell ("R16", "3-year cycle"). */
const rowIn = (win: string, first: string) => [...document.querySelectorAll<HTMLElement>(`${win} tr`)].find((tr) => tr.querySelector("td")?.innerText.trim().startsWith(first)) ?? null;
/** A typed cell of the register in hand holds this value, accepted (not flagged). */
const valIs = (col: string, row: number, want: string) => (oblCell(col, row) as HTMLInputElement | null)?.value.trim() === want && oblCell(col, row)?.getAttribute("aria-invalid") !== "true";
const checkAnswers = (body: string): TourStep => ({ title: "Then check your answers", icon: "check", body, getEl: () => $('[data-guide="check-rows"]') });
/** A T5.1 decision answered in its row, with the card to read first (steps 10 and 11): the question is the step. */
const cardQuestion = (n: number, what: string, read: TourStep): TourStep[] => [
  {
    title: "A question first",
    icon: "help",
    body: `This step is ${what} Read the situation in the box, then the three options.`,
    getEl: () => $(`#act-${n} [data-guide="decision"]`),
  },
  ...openPage(n, "Ref-Certification card"),
  read,
  {
    title: "Pick and check",
    icon: "edit",
    body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
    getEl: () => $(`#act-${n} [data-guide="decision"]`),
    pointAt: () => $(`#act-${n} [data-guide="decision-context"]`),
    nextWhen: () => !!$(`#act-${n} [data-guide="decision-result"]`),
    doIt: "Pick an option and click Check my answer",
  },
  {
    title: "Read the feedback",
    icon: "info",
    body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
    getEl: () => $(`#act-${n} [data-guide="decision"]`),
  },
  {
    title: "Finish here",
    icon: "check",
    body: "With the feedback read, mark the step complete. LI-CERT records the card's answer by itself.",
    getEl: () => $(`#act-${n} [data-guide="step-complete"]`),
  },
  {
    title: "Replay any time",
    icon: "play",
    body: "Replay any time with ▶ Show me how.",
    getEl: () => $(`#act-${n} [data-guide="show-me-how"]`),
  },
];
/** The first item of a T5.1 register step, done by the learner: the cursor at the field, Next once it is right. */
const firstItem = (title: string, body: string, col: string, row: number, right: () => boolean, doIt: string, beside?: string): TourStep => ({
  title,
  icon: "edit",
  body,
  getEl: () => oblCell(col, row)?.closest("td") ?? null,
  onEnter: () => oblCell(col, row)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
  pointAt: () => oblCell(col, row),
  alsoShow: beside ? () => (innerWidth > 700 ? $(beside) : null) : undefined,
  nextWhen: right,
  doIt,
});

/** T11.2: the two saved official sources and the reference architecture, each in its own window. */
const SRC1_WINDOW = 'section[role="dialog"][aria-label^="SRC-EC-MINORS-2025"]';
const SRC2_WINDOW = 'section[role="dialog"][aria-label^="SRC-EU-2022-2065"]';
const TECH_WINDOW = 'section[role="dialog"][aria-label^="BKB-TECH-000"]';
/** T12.1: ACT-TRACKER, on Risk Register › Mitigation Tracker. */
const MT_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Mitigation Tracker"]';
/** T12.2: the repository's index and the mentee's hand-ins. */
const EVLIB_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Evidence Library"]';
const VH_WINDOW = 'section[role="dialog"][aria-label^="Policies › Version History"]';

export const STEP_GUIDES: Record<string, TourStep[]> = {
  "F1.1-1": [
    {
      title: "Six values to check",
      icon: "table",
      body: "Table 1 of READ-ME-FIRST was filled in for you by the programme office. Before you rely on a record someone else filled in, you check it against its source: here, Home › My Organisation. Open it first.",
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My Organisation", ORG_WINDOW, "Step 1"),
    {
      title: "Where each value is",
      icon: "user",
      body: "Your start date is at the top left, and the task owner of each task is in the task table beside it. Each organisation's name is on its tab. Its home office is on the tab's Overview, under Home office: scroll down to it.",
      getEl: () => $(ORG_WINDOW),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take the first row: read the name on the Org A tab and compare it with the file, word for word. Where a value differs, type the one the screen shows. Where it matches, leave it.",
      getEl: () => firstCell()?.closest("tr") ?? null,
      alsoShow: () => $(ORG_WINDOW),
    },
    {
      title: "Check the other five",
      icon: "edit",
      body: "Do the same for every row: compare it with My Organisation and correct it where it differs. Click Next when you have checked all six.",
      getEl: () => $('[data-guide="rmf-table"]'),
      alsoShow: () => $(ORG_WINDOW),
    },
    {
      title: "Check your answers",
      icon: "check",
      body: "Click Check my answers. Each row then says whether it was right; a row still wrong is flagged with where to read it.",
      getEl: () => $('[data-guide="rmf-check"]') ?? $('[data-guide="rmf-result"]'),
      nextWhen: () => !!$('[data-guide="rmf-result"]'),
      doIt: "Click Check my answers",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Correct any row still flagged. This button unlocks once all six match My Organisation.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // A question about your account; the undertaking is signed at the end of step 3.
  "F1.1-2": decideInRow(2, "a question about your account.", [], "This button unlocks once you have checked your answer."),

  // The data rules: a question, then the four rules ticked and saved.
  "F1.1-3": decideInRow(
    3,
    "what you use when you do not understand a rule.",
    [
      {
        title: "Then the data rules",
        icon: "shield",
        body: "Part 2 is open now: the four data rules you agree to keep in every task. Tick each one, then click Save. Saving is final.",
        getEl: () => $('#act-3 [data-guide="part-two"]'),
        nextWhen: () => !!$('#act-3 [data-guide="part-two"] [data-saved]'),
        doIt: "Tick all four rules and click Save",
      },
      {
        title: "Last, sign the undertaking",
        icon: "file",
        body: "With every rule read and saved, you sign. Open and sign shows the undertaking as a letter. Read it, type your full name and your mentee ID (it is in the letter's address), sign in the box, and click Sign. From step 4 you work with data.",
        getEl: () => $('#act-3 [data-guide="part-two"]'),
      },
    ],
    "This button unlocks once the rules are saved and the undertaking is signed.",
    false,
  ),

  // The question was answered in the step's row (the file opens only then); here, table 2.
  "F1.1-4": [
    {
      title: "Now four paths",
      icon: "table",
      body: "Your answer is in. Part 2 is table 2 of READ-ME-FIRST: the full path of each of your four task folders. They are on Home › My Tasks.",
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My Tasks", TASKS_WINDOW, "Step 4"),
    {
      title: "Where the paths are",
      icon: "grid",
      body: "Under \"F1.1 · your folders\", each folder's name is followed by its full path, which starts with your mentee ID.",
      getEl: () => $(`${TASKS_WINDOW} [data-guide="folders"]`) ?? $(TASKS_WINDOW),
    },
    {
      title: "Fill the first row",
      icon: "edit",
      body: "Type the 00_Admin path exactly as written, slashes included. Next unlocks once it matches.",
      getEl: () => firstCell()?.closest("td") ?? null,
      alsoShow: () => $(TASKS_WINDOW),
      nextWhen: firstRowRight,
      doIt: "Type the 00_Admin path in the first row",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Fill the other three paths the same way. This button unlocks once all four match My Tasks.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.1-5": [
    {
      title: "Three dates to check",
      icon: "calendar",
      body: "Table 3 holds the due dates of F1.2, F1.3 and the knowledge check KC-01, filled in for you. The programme sets every due date, and Home › My plan is where they are. Check the file against it.",
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My plan", PLAN_WINDOW, "Step 5"),
    {
      title: "Where the dates are",
      icon: "calendar",
      body: "Every task and test has a row. Find F1.2, F1.3 and KC-01; the date is in the Due column.",
      getEl: () => $(`${PLAN_WINDOW} [data-guide="plan"]`) ?? $(PLAN_WINDOW),
    },
    {
      title: "Check all three",
      icon: "edit",
      body: "Compare each date in the file with the Due column of its row. The file records dates as DD-MMM-YYYY: Mon 05 Oct 2026 is 05-OCT-2026. Where a date differs, pick the one My plan shows. Click Next when you have checked all three.",
      getEl: () => $('[data-guide="rmf-table"]'),
      alsoShow: () => $(PLAN_WINDOW),
    },
    {
      title: "Check your answers",
      icon: "check",
      body: "Click Check my answers. Each date then says whether it was right; one still wrong is flagged with where to read it.",
      getEl: () => $('[data-guide="rmf-check"]') ?? $('[data-guide="rmf-result"]'),
      nextWhen: () => !!$('[data-guide="rmf-result"]'),
      doIt: "Click Check my answers",
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message like this lands in your Inbox on the toolbar, at the step it belongs to. Open it and reply, and you see whether your reply was the best one and why. The step cannot be completed until you have replied.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Correct any date still flagged and reply to the message. This button unlocks once all three dates match My plan and the message is answered.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // Handing the file in.
  "F1.1-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is your READ-ME-FIRST, with the three tables you filled in steps 1, 4 and 5. This step saves it in 02_Working under its own name and submits it.",
      getEl: () => $('[data-guide="rmf-file"]'),
    },
    ...nameAndSubmit("docx", "1 to 5"),
  ],

  // Finding in the worked rows: what a finished row looks like, before you fill your own.
  "F1.2-1": [
    {
      title: "Finished rows",
      icon: "table",
      body: "These are LearnTech's rows, filled in for you. Your own rows, for GlobalConnect, must end up looking like these. The tinted columns D to G are the ones still empty on yours.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question here is answered by one cell in the rows on the left. You answer by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "GDPR (EU) has a row. Its instrument type is in column D. Click that cell.",
      // On a narrow screen the table scrolls sideways: scroll just enough for the cell to show in full.
      onEnter: () => $('button[aria-label^="D Instrument type (R01), GDPR (EU)"]')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => $('button[aria-label^="D Instrument type (R01), GDPR (EU)"]')?.closest("tr") ?? null,
      pointAt: () => $('button[aria-label^="D Instrument type (R01), GDPR (EU)"]'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="D"]'),
      doIt: "Click the GDPR (EU) instrument type in column D",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find the rule in column F and the source in column G the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all three are found.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // Applying rule R01 to one worked row, the way step 3 applies it to every row of yours.
  "F1.2-2": [
    {
      title: "One worked row",
      icon: "table",
      body: "The lit row is ISO/IEC 27001:2022. Its type in column D is Certifiable standard. This step shows how that type was reached.",
      getEl: () => $('[data-guide="ladder-row"]'),
    },
    {
      title: "Rule R01",
      icon: "help",
      body: "R01 decides an instrument type. Ask its questions in order and stop at the first yes: that question's answer is the type.",
      getEl: () => $('[data-guide="ladder"]'),
    },
    {
      title: "Answer question 1",
      icon: "edit",
      body: "Answer it for ISO/IEC 27001. If you are not sure, answer anyway: a wrong answer explains itself.",
      getEl: () => $('[data-guide="ladder"] li[data-q="0"]'),
      // At the question, never at Yes or No: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="ladder"] li[data-q="0"] p'),
      nextWhen: () => !!$('[data-guide="ladder"] li[data-q="1"]'),
      doIt: "Answer question 1",
    },
    {
      title: "Answer question 2",
      icon: "edit",
      body: "Same again. Once you answer yes, you stop: that is R01's rule.",
      getEl: () => $('[data-guide="ladder"] li[data-q="1"]'),
      // At the question, never at Yes or No: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="ladder"] li[data-q="1"] p'),
      nextWhen: () => !!$('[data-guide="ladder-done"]'),
      doIt: "Answer question 2",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "The row's type now has a reason. Mark the step complete; step 3 asks the same questions for each of your own rows.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The per-row decision, made once, in the table, with rule R01 on hand.
  "F1.2-3": [
    {
      title: "Your nine rows",
      icon: "table",
      body: "These are GlobalConnect's standards. For each one you choose its instrument type in column D. That is all this step asks.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Follow the orange dot",
      icon: "info",
      body: "An orange dot in the toolbar marks a place this step uses. Learn has one: it holds the Framework Quick Reference, which says what kind of instrument each standard is.",
      getEl: () => $('[data-guide-section="learn"]'),
      waitFor: () => !!$('[data-guide-menu="learn"]'),
      doIt: "Click Learn",
    },
    {
      title: "Open Framework Quick Reference",
      icon: "grid",
      body: "The screen this step reads is tagged Step 3.",
      getEl: () => $('[data-guide-menu="learn"] li[data-target] button'),
      waitFor: () => !!$(QR_WINDOW),
      doIt: "Click Framework Quick Reference",
    },
    {
      title: "An example",
      icon: "book",
      body: "Your first row is ISO/IEC 27001. Here it is \"a certifiable management-system standard\". Rule R01, question 2: can an organisation get a certificate? Yes, so its type is Certifiable standard.",
      getEl: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001"]`),
      // The list is long: bring the entry into its own window's view first.
      onEnter: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001"]`)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "Pick it for row 1",
      icon: "edit",
      body: "Choose Certifiable standard in column D of the ISO/IEC 27001 row. Column F then records R01, the rule you used, by itself.",
      getEl: () => $('[data-guide="register"] tbody select')?.closest("td") ?? null,
      alsoShow: () => $(QR_WINDOW),
      // On a narrow screen column D is scrolled off to the side: bring the cell into view.
      onEnter: () => $('[data-guide="register"] tbody select')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => !!($('[data-guide="register"] tbody select') as HTMLSelectElement | null)?.value,
      doIt: "Choose the type for ISO/IEC 27001",
    },
    {
      title: "Now the other eight",
      icon: "edit",
      body: "Find each standard in the Quick Reference the same way, ask R01's questions in order, and choose its type in column D.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row has a type, Check my answers shows each row's answer and why. Your rows lock then, so check them first. Replay this guide any time with ▶ Show me how.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row (the register opens only then); here, column E.
  "F1.2-4": [
    {
      title: "Now column E",
      icon: "table",
      body: "Your answer is in. Part 2: for each of your rows, the offices the standard applies to. They are in BKB-ADD-16 Section 2, one row per office. Open it first.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Follow the orange dot",
      icon: "info",
      body: "Policies carries the dot: BKB-ADD-16 is in its Policy Library.",
      getEl: () => $('[data-guide-section="policies"]'),
      waitFor: () => !!$('[data-guide-menu="policies"]'),
      doIt: "Click Policies",
    },
    {
      title: "Open the Policy Library",
      icon: "grid",
      body: "The screen this step reads is tagged Step 4.",
      getEl: () => $('[data-guide-menu="policies"] li[data-target] button'),
      waitFor: () => !!$(LIBRARY_WINDOW),
      doIt: "Click Policy Library",
    },
    {
      title: "Open BKB-ADD-16",
      icon: "book",
      body: "Your organisation's addendum is tagged Step 4.",
      getEl: () => $(`${LIBRARY_WINDOW} [data-doc="BKB-ADD-16"]`),
      waitFor: () => !!$(ADD16_WINDOW),
      doIt: "Click BKB-ADD-16",
    },
    {
      title: "An example",
      icon: "book",
      body: "Section 2 has one row per office. The Manila row names the Data Privacy Act 2012: that is your DPA 2012. No other office's row names it, so DPA 2012 applies to Manila only, and its column E reads Manila.",
      getEl: () => $(`${ADD16_WINDOW} [data-sec="2"]`),
      onEnter: () => $(`${ADD16_WINDOW} [data-sec="2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Fill the DPA 2012 row",
      icon: "edit",
      body: "Type Manila in column E of the DPA 2012 row. City names only; Next unlocks once it is one.",
      getEl: () => famCell("E Offices (R02)", 2)?.closest("td") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      onEnter: () => famCell("E Offices (R02)", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => cellIn(famCell("E Offices (R02)", 2)) && (famCell("E Offices (R02)", 2) as HTMLInputElement).value.trim().toLowerCase() === "manila",
      doIt: "Type Manila for DPA 2012",
    },
    {
      title: "Where Section 2 names no office",
      icon: "book",
      body: "Some Mandatory standards are in no office's row of Section 2. For those, Section 3 lists every standard with an Applies to column: it says where each one holds. Section 3 is further down; the Section 2 and Section 3 buttons at the top of the document jump to each.",
      getEl: () => $(`${ADD16_WINDOW} [data-sec="3"]`),
      onEnter: () => $(`${ADD16_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Now the others",
      icon: "check",
      body: "Find each Mandatory standard in Section 2 the same way, or in Section 3 where Section 2 names no office; more than one office means cities separated by \"; \". The Optional rows are filled for you.",
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => $(ADD16_WINDOW),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Column F records R02 by itself as you fill each row. Once every row has its offices, Check my answers shows each row's answer and why; your rows lock then. Replay this guide any time with ▶ Show me how.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],


  // Step 5 is its question only, answered in its row from the Group's definition in Learn & Grow › Glossary.
  "F1.2-5": [
    {
      title: "A question",
      icon: "help",
      body: "This step is a question: which evidence ref another person could rely on. Read the situation in the box, then the three options. The Group's definition is in Learn & Grow › Glossary.",
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    ...openLearn("Glossary", "The Group's working terms, one line each.", GLOSSARY_WINDOW),
    {
      title: "Evidence ref",
      icon: "book",
      body: "Read what an evidence ref must hold. Then hold each of the three options against it.",
      getEl: () => $(`${GLOSSARY_WINDOW} [data-term="Evidence ref"]`) ?? $(GLOSSARY_WINDOW),
      onEnter: () => $(`${GLOSSARY_WINDOW} [data-term="Evidence ref"]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-5 [data-guide="decision"]'),
      // On a phone the Glossary window sits over the options: it has been read, so it closes here.
      onEnter: () => { if (innerWidth <= 700) $(`${GLOSSARY_WINDOW} button[aria-label^="Close"]`)?.click(); },
      pointAt: () => $('#act-5 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-5 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Mark the step complete. Column G of every row is then written for you: the section of BKB-ADD-16 that row's offices were read from.",
      getEl: () => $('#act-5 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how.",
      getEl: () => $('#act-5 [data-guide="show-me-how"]'),
    },
  ],

  // Checking the map, then handing it in.
  "F1.2-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is your FAM-MAP: columns D to G of your nine rows, as you filled them in steps 3 to 5. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review, so any empty cell is marked amber here and this line counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5"),
  ],

  // Checking the worked section against its source: order, exact words, the Source line.
  "F1.3-1": [
    {
      title: "Section 1 is done for you",
      icon: "file",
      body: "This is your context brief. Section 1, Services, was copied for you from BKB-ADD-16 Section 1.1: it shows how you copy sections 2 to 4. Check it against the addendum.",
      getEl: () => $('[data-guide="brief-worked"]'),
    },
    ...openAddendum(1),
    {
      title: "Side by side",
      icon: "book",
      body: "Section 1.1 lists the services. Section 1 must have the same lines, in the same order, word for word.",
      ...addSec("1.1"),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Count down Section 1.1 to its fifth service, then click that service in section 1. A wrong line turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="brief-worked"]'),
      alsoShow: () => $('[data-guide="study"]'),
      // At the question, never at a line: the cursor must not suggest the answer.
      pointAt: () => $('[data-guide="study"] li p'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="order"]'),
      doIt: "Click the service Section 1.1 lists fifth",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way, by clicking a line of section 1.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all three are found. Sections 2 to 4 follow the same standard.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.3-2": [
    {
      title: "Section 2: data handled",
      icon: "file",
      body: "Section 2 lists the client data your organisation handles, copied from BKB-ADD-16 Section 9. Open the addendum first.",
      getEl: briefSec,
    },
    ...openAddendum(2),
    {
      title: "Where the list is",
      icon: "book",
      body: "Section 9 opens with a table of two columns. The list you copy is the right-hand one, Client data handled: one item per bullet.",
      ...addSec("9"),
    },
    {
      title: "Copy the first item",
      icon: "edit",
      body: "Type the first item exactly as written, brackets included. Next unlocks once line 1 matches Section 9.",
      getEl: () => $('[data-guide="brief-section"] textarea'),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: firstLineRight,
      doIt: "Type the first item of the list",
    },
    {
      title: "The rest, then the source",
      icon: "check",
      body: "Press Enter and copy the other items, one per line, in the same order. A line that differs from Section 9 is flagged under the box. Then type BKB-ADD-16 Section 9 in the Source line.",
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once the list and its Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.3-3": [
    {
      title: "Section 3: legal environment",
      icon: "file",
      body: "Section 3 holds five values about your home office's law. They are in one row of BKB-ADD-16 Section 2. Open the addendum first.",
      getEl: briefSec,
    },
    ...openAddendum(3),
    {
      title: "Your office's row",
      icon: "book",
      body: "Section 2 has one row per office. Yours is Manila, Philippines, the first row. Under each line of section 3 is the Section 2 column it comes from: Law is Data-protection law, Breach clock is Breach notification, and so on.",
      ...addSec("2"),
    },
    {
      title: "Fill the Law line",
      icon: "edit",
      body: "Type the Manila row's Data-protection law exactly as written. Next unlocks once it matches Section 2.",
      getEl: () => $('[data-guide="brief-section"] input[aria-label="Law"]')?.closest("div") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => cellIn($('[data-guide="brief-section"] input[aria-label="Law"]')),
      doIt: "Type the Manila row's law",
    },
    {
      title: "The other four, then the source",
      icon: "check",
      body: "Fill the other four lines from the same row, then type BKB-ADD-16 Section 2 in the Source line. These values come back in week 3 (obligations) and week 10 (breach clocks).",
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all five lines and the Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, section 4.
  "F1.3-4": [
    {
      title: "Now section 4",
      icon: "file",
      body: "Your answer is in. Part 2: your office's Mission Critical assets. BKB-ADD-16 Section 8.1 lists the asset register's Mission Critical assets, each with its office.",
      getEl: briefSec,
    },
    ...openAddendum(4),
    {
      title: "Where the assets are",
      icon: "book",
      body: "Each row of Section 8.1 is one asset, with its Office. Copy the Asset of every row whose Office is Manila, Philippines; the other offices' rows are not yours.",
      ...addSec("8.1"),
    },
    {
      title: "Copy the first one",
      icon: "edit",
      body: "Type the first Manila asset exactly as written. Next unlocks once it is one of them.",
      getEl: () => $('[data-guide="brief-section"] textarea'),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: firstLineRight,
      doIt: "Type the first Manila asset",
    },
    {
      title: "The rest, then the source",
      icon: "check",
      body: "Copy every other Manila row's asset, one per line. A line that is not a Manila asset of Section 8.1, or is listed twice, is flagged. Then type BKB-ADD-16 Section 8.1 in the Source line.",
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once the list and its Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, CTX-IP.
  "F1.3-5": [
    {
      title: "Now CTX-IP",
      icon: "table",
      body: "Your answer is in. Part 2: the interested parties, each with what it requires, copied from BKB-ADD-16 Section 4 (rule R04).",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openAddendum(5),
    {
      title: "Parties and requirements",
      icon: "book",
      body: "Section 4's table has one row per party, its requirements beside it. Row 1 of CTX-IP takes the first party, row 2 the second, and so on.",
      ...addSec("4"),
    },
    {
      title: "Fill the first party",
      icon: "edit",
      body: "Type the first party of Section 4 in Party, row 1, exactly as written. Next unlocks once it matches.",
      getEl: () => ipCell("Party", 1)?.closest("td") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      onEnter: () => ipCell("Party", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => cellIn(ipCell("Party", 1)),
      doIt: "Type the first party",
    },
    {
      title: "Its requirements",
      icon: "edit",
      body: "Copy that party's requirements from the same row of Section 4 into Requirement, word for word, separated by “; ”. Rule records R04 by itself.",
      getEl: () => ipCell("Requirement", 1)?.closest("td") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      onEnter: () => ipCell("Requirement", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => cellIn(ipCell("Requirement", 1)),
      doIt: "Copy the first party's requirements",
    },
    {
      title: "Now the others",
      icon: "check",
      body: "Fill Internal/External and Standard/law from the same row of Section 4, then rows 2 to 5 the same way. Rule and Evidence ref record themselves: every row comes from Section 4.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all five rows match Section 4.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // Finding in the worked rows: the parts every finished row has, before you walk your own.
  "F2.1-1": [
    {
      title: "Two finished rows",
      icon: "table",
      body: "These are the worked rows of CLS-6, A-01 and A-02, filled in for you. Your six rows, A-03 to A-08, must end up with the same parts. The tinted columns are the ones still empty on yours.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question here is answered by one cell in the rows on the left. You answer by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "A-02 is the second row. Its path ends in a tier, and the tier has a column of its own. Click that cell.",
      onEnter: () => $('button[aria-label^="Group tier, Regional performance dashboard"]')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => $('button[aria-label^="Group tier, Regional performance dashboard"]')?.closest("tr") ?? null,
      // At the question, never at a cell: the cursor must not suggest the answer.
      pointAt: () => $('[data-guide="study"] li p'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="tier"]'),
      doIt: "Click A-02's tier",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find the path and the fact the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all three are found. In step 2 you fill the same parts for your own rows.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The per-row decision: the Section 5 tree walked for each row, beside the table.
  "F2.1-2": [
    {
      title: "Your six rows",
      icon: "table",
      body: "These are your assets, A-03 to A-08, with the facts the tree is answered from. For each one you walk the decision tree. The path you take and the tier it gives fill the two tinted columns.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The tree, beside the table",
      icon: "help",
      body: "These are the questions of BKB-STD-001 Section 5, in order, one at a time. Answer each from the lit row's facts. The first yes gives the tier; if every answer is no, the tier is Tier 2, the default.",
      getEl: () => $('[data-guide="tree"]'),
    },
    {
      title: "An example",
      icon: "book",
      body: "The pack's own example: a press release published on the website has been approved for release, so question 1 is yes. Its path is Q1 Yes → Tier 1, and nothing more is asked.",
      getEl: () => $('[data-guide="tree"] li[data-q="0"]'),
    },
    {
      title: "Walk A-03",
      icon: "edit",
      body: "A-03 is lit in the table: Regional contracts repository, local contracts and legal documents. Answer the questions for it. Next unlocks once its path and tier are recorded.",
      getEl: () => $('[data-guide="tree-row"]'),
      // At the question, never at Yes or No: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="tree-row"] li[data-q="0"] p'),
      nextWhen: () => !!$('[data-guide="register"] [aria-label="Walk the tree for A-03"][data-walked]'),
      doIt: "Answer the questions for A-03",
    },
    ...openGroupDoc(2, "BKB-STD-001", "The classification standard", STD_WINDOW),
    {
      title: "What question 4 asks",
      icon: "book",
      body: "Question 4 asks about harm “per Section 3.1”. Section 3.1 sets the thresholds: financial loss, individuals affected, regulatory, safety and reputation. Section 3 above it gives examples of each tier. Drag the window aside to keep it open while you walk.",
      ...stdSec("3.1"),
    },
    {
      title: "Now the other five",
      icon: "check",
      body: "Walk A-04 to A-08 the same way; the walk moves on to the next row by itself. A-07 and A-08 say “See description”: their facts are in their names. Click a row's path to walk it again.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all six rows have a tier, Check my answers shows each row's answer and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, the R05 floor checked on every row.
  "F2.1-3": [
    {
      title: "Now the R05 check",
      icon: "table",
      body: "Your answer is in. Part 2: rule R05 sets a floor. Personal data or credentials are never below Tier 3, whatever the tree said. For each of your rows, say whether it holds either.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Check A-03",
      icon: "edit",
      body: "A-03's facts are in its row: Description and Personal / regulated data. Choose Yes or No. Rule records R05 by itself.",
      getEl: () => r05(3)?.closest("tr") ?? null,
      pointAt: () => r05(3),
      onEnter: () => r05(3)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => !!r05(3)?.value && r05(3)!.getAttribute("aria-invalid") !== "true",
      doIt: "Choose Yes or No for A-03",
    },
    {
      title: "Now the other five",
      icon: "check",
      body: "Answer A-04 to A-08 the same way.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row has Yes or No, Check my answers shows each row's answer and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F2.1-4": [
    {
      title: "Four labels",
      icon: "file",
      body: "Besides its asset rows, CLS-RES has two small tables. Table 1 holds GlobalConnect's own label for each of the four Group tiers, copied from BKB-ADD-16 Section 7. Open the addendum first.",
      getEl: briefSec,
    },
    ...openAddendumBeside(4),
    {
      title: "Where the labels are",
      icon: "book",
      body: "Section 7's first table has one row per Group tier, with GlobalConnect's label beside it.",
      ...addSec("7"),
    },
    {
      title: "Copy the Tier 1 label",
      icon: "edit",
      body: "Type the label of the Tier 1 (Public) row exactly as written. Next unlocks once it matches Section 7.",
      getEl: () => clsField("Tier 1 (Public)")?.closest("div") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => cellIn(clsField("Tier 1 (Public)")),
      doIt: "Type the Tier 1 label",
    },
    {
      title: "The other three, then the source",
      icon: "check",
      body: "Copy the labels of Tiers 2 to 4 the same way, then type BKB-ADD-16 Section 7 in the Source line.",
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all four labels and the Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, table 2 of CLS-RES.
  "F2.1-5": [
    {
      title: "Now the transmission rule",
      icon: "file",
      body: "Your answer is in. Part 2: how Tier 3 and Tier 4 may be sent outside GlobalConnect, copied from the handling matrix, BKB-STD-001 Section 6. Open it first.",
      getEl: briefSec,
    },
    ...openGroupDoc(5, "BKB-STD-001", "The classification standard", STD_WINDOW),
    {
      title: "Where the values are",
      icon: "book",
      body: "Section 6 has one row per activity and one column per tier. Find the row External transmission: a file sent to a partner leaves GlobalConnect.",
      ...stdSec("6"),
    },
    {
      title: "Copy the Tier 3 value",
      icon: "edit",
      body: "Type the External transmission value in the Tier 3 column exactly as written. Next unlocks once it matches Section 6.",
      getEl: () => clsField("Tier 3")?.closest("div") ?? null,
      alsoShow: () => $(STD_WINDOW),
      nextWhen: () => cellIn(clsField("Tier 3")),
      doIt: "Type the Tier 3 value",
    },
    {
      title: "Tier 4, then the source",
      icon: "check",
      body: "Copy the Tier 4 value from the same row, then type BKB-STD-001 Section 6 in the Source line.",
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once both values and the Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F2.1-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is CLS-RES: your six rows as you filled them in steps 2 and 3, with the tables of steps 4 and 5 below. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the review, so any empty cell is marked amber here and this line counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5"),
  ],

  // Real work: an analyst learns from worked items what made one pass and one fail before checking a batch.
  "F2.2-1": [
    {
      title: "Two worked items",
      icon: "table",
      body: "Auditors do not accept “trust me”: evidence is accepted only when it is dated, attributable, complete for the period and unaltered. These are the worked items of EVQ-6: E-001 accepted, E-002 rejected with its defect code. Your six, E-003 to E-008, get the same.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question here is answered by one cell of the two rows on the left. You answer by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "E-002 is the second row. Its decision has a column of its own, near the right end of the table: scroll it sideways if you need to. Click that cell.",
      onEnter: () => $('button[aria-label^="Accept/Reject, Visitor log sample"]')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => $('button[aria-label^="Accept/Reject, Visitor log sample"]')?.closest("tr") ?? null,
      // At the question, never at a cell: the cursor must not suggest the answer.
      pointAt: () => $('[data-guide="study"] li p'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="decision"]'),
      doIt: "Click E-002's decision",
    },
    ...openDefectCodes(1),
    {
      title: "What the codes say",
      icon: "book",
      body: "Each code is one check. Read D1 here: the third question asks for the cell of E-002 that fails it. Drag this window aside if it covers the table.",
      getEl: () => $(DC_WINDOW),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find E-002's code and its failing cell the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once all three are found. In step 2 you decide Accept or Reject for your own six items.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The per-row decision: rule R09's checks walked for each item, beside the table.
  "F2.2-2": [
    {
      title: "Your six items",
      icon: "table",
      body: "These are your six items, E-003 to E-008. At work this is evidence a control owner has sent: you accept or reject each item before the auditor relies on it. Each decision fills Accept/Reject here.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The checklist, beside the table",
      icon: "help",
      body: "Rule R09: check D1 to D10 in order. Each check shows the cell of the lit item it reads. If one fails, click Fails on it: the item is a Reject. If none fails, record Accept.",
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates and the period",
      icon: "book",
      body: "D3 and D4 compare the item with the audit period. The worked item E-001 was accepted, so the Period covered it shows is the whole audit period.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="D3"]'),
    },
    {
      title: "Check E-003",
      icon: "edit",
      body: "E-003 is lit in the table. Read its checks in order and decide. Next unlocks once E-003 has Accept or Reject.",
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the item's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => !!evqWalk("E-003")?.hasAttribute("data-walked"),
      doIt: "Check E-003",
    },
    {
      title: "Now the other five",
      icon: "check",
      body: "Check E-004 to E-008 the same way; the checklist moves on by itself. Click an item's Accept/Reject in the table to check it again. Rule records R09 by itself.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all six items are decided, Check my answers shows each row's answer and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how.",
      getEl: () => $('[data-guide="show-me-how"]'),
    },
  ],

  "F2.2-3": [
    {
      title: "Codes for the rejects",
      icon: "table",
      body: "A rejected item goes back to its owner with the check it failed, so they know what to send instead. Each item you rejected in step 2 now gets its defect code; an accepted one records “none” by itself.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openDefectCodes(3),
    {
      title: "Record the first code",
      icon: "edit",
      body: "Find the check your rejected item fails: its cells are in its row, the checks in Defect Codes. Choose that code in Defect code. Next unlocks once it is in.",
      getEl: () => evqSelect()?.closest("td") ?? null,
      onEnter: () => evqSelect()?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => evqSelect(),
      alsoShow: () => $(DC_WINDOW),
      nextWhen: () => !!evqSelect()?.value && evqSelect()!.getAttribute("aria-invalid") !== "true",
      doIt: "Choose the defect code",
    },
    {
      title: "Then its fix",
      icon: "edit",
      body: "Defect Codes gives each code's Fix: what the owner must send instead. Copy the Fix of the code you chose into the row's Fix cell, word for word.",
      getEl: () => $('[data-guide="register"] [aria-label^="Fix, row "]')?.closest("td") ?? $('[data-guide="register"]'),
      onEnter: () => $('[data-guide="register"] [aria-label^="Fix, row "]')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      alsoShow: () => $(DC_WINDOW),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every rejected item has a code, Check my answers shows each row's answer and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, the D9 check on every item.
  "F2.2-4": [
    {
      title: "Now look for exposed data",
      icon: "table",
      body: "Your answer is in. Part 2: read the Content note of each of your items. An item that shows unmasked personal data or a secret is never copied: it is reported, on its row, with Report data issue.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Read each Content note",
      icon: "edit",
      body: "If an item's Content note is not “Masked content”, click Report data issue on its row. Do not copy what it shows.",
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => $('[data-guide="register"] thead th:last-child'),
    },
    {
      title: "Record what you found",
      icon: "check",
      body: "The count of reported items is here. If none of your items shows unmasked data, record that with the button. Next unlocks once the check is recorded.",
      getEl: () => $('[data-guide="report"]'),
      nextWhen: () => !!$('[data-guide="report-none"]') || !!$("[data-reported]"),
      doIt: "Report an item, or record none",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "This button unlocks once every item with unmasked data is reported, or none is recorded.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F2.2-5": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is EVQ-RES: your six items as you decided them in steps 2 to 4. In week 5 you use the same checklist on a whole evidence repository. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the review, so any empty cell is marked amber here and this line counts them. The Fix cells wait for content and are not counted.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 4"),
  ],

  // Checking the brief as it prints, then handing in both files.
  "F1.3-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "This is CTX-BRIEF as it prints, sections 1 to 4, with CTX-IP below it. This step checks the page, names both files and submits them.",
      getEl: () => $('[data-guide="page-fit"]'),
    },
    {
      title: "One page, labelled Internal",
      icon: "check",
      body: "The line above the page says whether the brief fits on one A4 page. Its footer carries the label “Internal”, which every document must show (BKB-POL-004 Section 3.1).",
      getEl: () => $('[data-guide="brief-label"]'),
      onEnter: () => $('[data-guide="brief-label"]')?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Name both files",
      icon: "edit",
      body: "Each file has its own name: the four parts listed under its box, in order, joined by underscores. The brief ends .docx, CTX-IP .xlsx.",
      getEl: () => $('[data-guide="file-name"]')?.parentElement ?? null,
      pointAt: () => $('[data-guide="file-name-input"]'),
      nextWhen: () => {
        const els = [...document.querySelectorAll<HTMLInputElement>('[data-guide="file-name-input"]')];
        return els.length === 2 && els.every((el) => el.value.trim() && el.getAttribute("aria-invalid") !== "true");
      },
      doIt: "Type both file names",
    },
    {
      title: "Submit them",
      icon: "upload",
      body: "Submit hands both files in; it opens once steps 1 to 5 are complete. The receipt shows a hash (a fingerprint of the files) and a UTC time. If either is missing, use Report a problem, at the bottom right.",
      getEl: () => $('[data-guide="submit"]'),
    },
    nameAndSubmit("docx", "1 to 5")[2],
  ],
  // T3.1: the obligations register (steps 1–8), then the Lead Implementer files LI-FAM (9–14) and LI-SCOPE (15–19).
  "T3.1-1": [
    {
      title: "Your obligations register",
      icon: "table",
      body: "At work, this register is how GlobalConnect knows what it must do, for whom, by when, and who owns it; regulators ask for it and auditors test against it. You start it with your two offices' rows of BKB-ADD-16 Section 2.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openAddendum(1),
    {
      title: "An example",
      icon: "book",
      ...addSec("2"),
      body: "Section 2 has one row per office. Manila's Breach notification cell reads “72h to NPC and data subjects”: copied as written, that is Manila's obligation. Its Data-protection law, the Data Privacy Act 2012, is the source instrument.",
    },
    {
      title: "Add Manila's row",
      icon: "edit",
      body: "Click Add a row. Choose Manila in Office(s), then copy Manila's Breach notification cell into Obligation, word for word. Next unlocks once it matches Section 2.",
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => oblAdd() ?? oblCell("Obligation (plain English)", 1),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => cellIn(oblCell("Obligation (plain English)", 1)) && (oblCell("Office(s)", 1) as HTMLSelectElement | null)?.value === "Manila",
      doIt: "Add Manila's row and copy its obligation",
    },
    {
      title: "Now the rest",
      icon: "check",
      body: "Fill Source instrument, Type and Evidence ref, then add Warsaw's row the same way. Type: law for an act of parliament, reg for a regulator's own requirement, standard for an industry standard, contract for a customer's requirement. Article/clause is in Section 2.2 of the addendum, on the obligation's row.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once both rows are filled and match Section 2, Check my answers shows each row's answer and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your Types are checked."),
  ],

  // The question was answered in the step's row; here, R10 applied to the two rows.
  "T3.1-2": [
    {
      title: "Now split the rows",
      icon: "table",
      body: "Your answer is in. Part 2: rule R10. Where “and” or “;” joins two duties in a row, each duty gets its own row, so that each can have its own owner and deadline.",
      getEl: () => $('[data-guide="split"]'),
    },
    {
      title: "Split OBL-01",
      icon: "edit",
      body: "OBL-01 has a joint, framed as a button. If it joins two duties, click it: the second duty moves to a new row below. Next unlocks once the row is split.",
      getEl: () => $('[data-guide="split"] li'),
      // At the row, never at the joint: whether to split is the mentee's call.
      pointAt: () => $('[data-guide="split"] li'),
      nextWhen: () => document.querySelectorAll('[data-guide="split"] li').length >= 3,
      doIt: "Split OBL-01",
    },
    {
      title: "Reword the new row",
      icon: "edit",
      body: "The new row OBL-02 holds only the words after the joint. Reword it in the table so that it reads as a whole duty, with its clock.",
      getEl: () => oblCell("Obligation (plain English)", 2)?.closest("td") ?? null,
    },
    {
      title: "Now Warsaw's row",
      icon: "check",
      body: "Split the Warsaw row the same way. The step is done when no row holds two duties.",
      getEl: () => $('[data-guide="split"]'),
    },
    finish("This button unlocks once every row holds one duty."),
  ],

  "T3.1-3": [
    {
      title: "Ten more rows",
      icon: "table",
      body: "The lead regulator's requirements (Section 2.1) and the sector overlays (Section 6) bind GlobalConnect as well. One row per line: the count is above the work.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openAddendum(3),
    {
      title: "An example",
      icon: "book",
      ...addSec("2.1"),
      body: "Section 2.1 lists what NPC, the lead regulator, requires. The first line, “Registration of Data Processing Systems with NPC”, is one row, with Evidence ref BKB-ADD-16 Section 2.1.",
    },
    {
      title: "Add the first row",
      icon: "edit",
      body: "Click Add a row and copy Section 2.1's first line into Obligation, word for word. Next unlocks once it matches.",
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => oblAdd(),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => [...document.querySelectorAll<HTMLTextAreaElement>('[data-guide="register"] textarea[aria-label^="Obligation (plain English)"]')].some((el) => cellIn(el) && /Registration of Data Processing/.test(el.value)),
      doIt: "Add the row and copy the line",
    },
    {
      title: "Then Section 6",
      icon: "book",
      ...addSec("6"),
      body: "Section 6 has four overlays. Each Additional mandatory requirement is one row, with Evidence ref BKB-ADD-16 Section 6. Choose the office or offices it binds.",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all ten rows are in and filled, Check my answers shows each row's answer and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your Types are checked."),
  ],

  "T3.1-4": [
    {
      title: "Now the contract rows",
      icon: "table",
      body: "Your answer is in. Part 2: three rows from what GlobalConnect's customers and partners require of it, each of Type contract.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openAddendum(4).slice(0, 2),
    {
      title: "Open Organization_Profiles",
      icon: "book",
      body: "The organisation profile workbook is tagged Step 4. Its Key Requirements table lists them by group.",
      getEl: () => $(`${LIBRARY_WINDOW} [data-doc="Organization_Profiles"]`),
      waitFor: () => !!$(OP_WINDOW),
      doIt: "Click Organization_Profiles",
    },
    {
      title: "Add the first contract row",
      icon: "edit",
      body: "Add a row and copy the first Key Requirement of GlobalConnect Customer Solutions, word for word, with Type contract. Next unlocks once it matches.",
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => oblAdd(),
      alsoShow: () => $(OP_WINDOW),
      nextWhen: () => [...document.querySelectorAll<HTMLTextAreaElement>('[data-guide="register"] textarea[aria-label^="Obligation (plain English)"]')].some((el) => cellIn(el)),
      doIt: "Add the row and copy the requirement",
    },
    finish("Add the next two the same way. This button unlocks once all three are in and filled."),
  ],

  "T3.1-5": [
    {
      title: "Link every row",
      icon: "table",
      body: "Your answer is in. Part 2: for each row, the BKB policy that implements it. The owner role then fills itself from the BKB-POL-000 index, as rule R10 says.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openGroupDoc(5, "BKB-POL-000", "The Policy Framework and Library Index", POL000_WINDOW),
    {
      title: "An example",
      icon: "book",
      getEl: () => $(`${POL000_WINDOW} [data-sec="3"]`),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
      body: "Section 3 lists every policy with its owner. BKB-POL-014, Incident Management and Breach Notification Policy, is owned by the Incident Response & Crisis Manager.",
    },
    {
      title: "Link OBL-01",
      icon: "edit",
      body: "Choose the policy that implements OBL-01 in Linked BKB policy. Next unlocks once it is chosen.",
      getEl: () => oblCell("Linked BKB policy", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Linked BKB policy", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Linked BKB policy", 1),
      nextWhen: () => selIn("Linked BKB policy", 1),
      doIt: "Choose OBL-01's policy",
    },
    {
      title: "Then Section 2.2",
      icon: "book",
      body: "Frequency / deadline, Process and Evidence of compliance: BKB-ADD-16 Section 2.2 gives them, one row per obligation. Copy each from the obligation's row there.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row is filled, Check my answers shows whether each row's policy is the one that implements it, and why. Your rows lock then, so look them over first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T3.1-6": [
    {
      title: "17 rows, 15 places",
      icon: "info",
      body: "Steps 1 to 4 gave 17 rows; the register holds 15. The 3 contract rows stay, because KR2 needs them.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "Remove two",
      icon: "edit",
      body: "Remove the two rows that bind neither Manila nor Warsaw, with the × at the end of each: Section 2 of the addendum names each office's laws. Next unlocks at 15 rows; the line beside the table then says whether you chose right.",
      getEl: () => $('[data-guide="register"]'),
      nextWhen: () => oblRows() === 15,
      doIt: "Remove two rows",
    },
    finish("This button unlocks at 15 rows, with the 3 contract rows among them and the two right rows removed."),
  ],

  "T3.1-7": [
    {
      title: "Now compare the clocks",
      icon: "table",
      body: "Your answer is in. Part 2: the Group's notification matrix gives a clock for every country. Compare each office's clock in your register with it.",
      getEl: () => $('[data-guide="compare"]'),
    },
    ...openGroupDoc(7, "BKB-ERM-001", "The Enterprise Risk Management Framework, with its Annex A", ERM_WINDOW),
    {
      title: "Annex A",
      icon: "book",
      getEl: () => $(`${ERM_WINDOW} [data-sec="Annex A"]`),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="Annex A"]`)?.scrollIntoView({ block: "start" }),
      body: "Annex A is at the end: one row per country, its breach-notification clock in the third column. Manila is in the Philippines.",
    },
    {
      title: "Compare Manila",
      icon: "edit",
      body: "Read the Philippines row and choose. Next unlocks once your call matches what the two sources say.",
      getEl: () => $('[data-guide="compare"] [data-compare="Manila"]'),
      alsoShow: () => $(ERM_WINDOW),
      nextWhen: () => !!$('[data-guide="compare"] [data-compare="Manila"] [aria-pressed="true"]') && !/Look again/.test($('[data-guide="compare"] [data-compare="Manila"]')?.innerText ?? ""),
      doIt: "Compare Manila",
    },
    finish("Compare Warsaw (Poland) the same way. This button unlocks once both are compared."),
  ],

  "T3.1-8": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is OBL-REG: your 15 rows as you built them in steps 1 to 7. T4.1, T10.2 and T11.2 work from it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review, so any empty cell is marked amber here and this line counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7"),
  ],

  "T3.1-9": [
    {
      title: "Your 27000-family map",
      icon: "table",
      body: "An implementer must know which ISO/IEC 27000-family document does what: only some can be certified against, and some bind certification bodies, not organisations. T-LI-FAM lists the ten.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-27000 family"),
    {
      title: "Fill the first row",
      icon: "edit",
      body: "Find ISO/IEC 27000 in Ref-27000 family. Choose its Certifiable? and Who uses it. Next unlocks once both match the page.",
      getEl: () => oblCell("Certifiable?", 1)?.closest("tr") ?? null,
      pointAt: () => oblCell("Certifiable?", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
      nextWhen: () => selIn("Certifiable?", 1) && selIn("Who uses it", 1),
      doIt: "Fill ISO/IEC 27000's row",
    },
    finish("Fill the other nine the same way. This button unlocks once all ten match the page."),
  ],

  "T3.1-10": [
    {
      title: "What each one is for",
      icon: "table",
      body: "Each document's purpose, in one sentence: the line you would give a colleague who asks which standard to open.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-27000 family"),
    {
      title: "Match the first one",
      icon: "edit",
      body: "Choose the sentence Ref-27000 family gives ISO/IEC 27000. Next unlocks once it matches.",
      getEl: () => oblCell("Purpose in one sentence", 1)?.closest("td") ?? null,
      pointAt: () => oblCell("Purpose in one sentence", 1),
      nextWhen: () => selIn("Purpose in one sentence", 1),
      doIt: "Choose ISO/IEC 27000's purpose",
    },
    finish("Match the other nine. This button unlocks once all ten match the page."),
  ],

  "T3.1-11": [
    {
      title: "Requirements or guidance",
      icon: "table",
      body: "A requirements document uses “shall” and can be audited against; guidance only advises. An audit finding can only cite a requirement.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule L02 is in the rule tables, tagged with this step.", 'section[role="dialog"][aria-label*="› Rule tables"]'),
    {
      title: "Choose for the first one",
      icon: "edit",
      body: "Apply rule L02 to ISO/IEC 27000. Next unlocks once your choice follows the rule.",
      getEl: () => oblCell("Requirements or guidance", 1)?.closest("td") ?? null,
      pointAt: () => oblCell("Requirements or guidance", 1),
      nextWhen: () => selIn("Requirements or guidance", 1),
      doIt: "Choose for ISO/IEC 27000",
    },
    finish("Choose for the other nine. This button unlocks once all ten follow rule L02."),
  ],

  "T3.1-12": [
    {
      title: "Plan, Do, Check, Act",
      icon: "table",
      body: "Clauses 4 to 10 of ISO/IEC 27001 form one management system. Rule L01 places each in the Plan-Do-Check-Act cycle; the 2022 standard does not name PDCA, so this is the conventional mapping.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openLearn("Rule tables", "Rule L01 is in the rule tables, tagged with this step.", 'section[role="dialog"][aria-label*="› Rule tables"]'),
    {
      title: "Place clause 4",
      icon: "edit",
      body: "Type the phase rule L01 gives clause 4: Plan, Do, Check or Act. Next unlocks once it follows the rule.",
      getEl: () => briefIn("Clause 4 Context of the organisation"),
      pointAt: () => briefIn("Clause 4 Context of the organisation"),
      nextWhen: () => cellIn(briefIn("Clause 4 Context of the organisation")),
      doIt: "Place clause 4",
    },
    finish("Place clauses 5 to 10, then write Rule L01 in the Source line. This button unlocks once all are in."),
  ],

  "T3.1-13": [
    {
      title: "The 2024 amendment",
      icon: "table",
      body: "Amendment 1:2024 added climate change to clauses 4.1 and 4.2. Your map carries the note, so a reader knows which version it describes.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openPage(13, "Ref-27000 family"),
    {
      title: "Copy the note",
      icon: "edit",
      body: "The note is the second half of the ISO/IEC 27001 row's purpose, after the “;”. Copy it word for word. Next unlocks once it matches.",
      getEl: () => briefIn("Note"),
      pointAt: () => briefIn("Note"),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
      nextWhen: () => cellIn(briefIn("Note")),
      doIt: "Copy the note",
    },
    finish("Name the page in the Source line. This button unlocks once both are in."),
  ],

  "T3.1-14": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is LI-FAM: the ten documents as you described them in steps 9 to 11, and the PDCA diagram of steps 12 and 13 below it. T5.1 builds on it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber here and this line counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 13"),
  ],

  "T3.1-15": [
    {
      title: "The ISMS scope",
      icon: "table",
      body: "The ISMS scope (clause 4.3) is the first document a certification auditor reads: it says what the management system covers. Rule L03: in scope = your office and its departments in the asset register.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openAddendum(15),
    {
      title: "Where the departments are",
      icon: "book",
      ...addSec("8.1"),
      body: "Section 8.1 lists the registered Mission Critical assets, each with its office and department. The departments on your office's rows are what the ISMS covers.",
    },
    {
      title: "Fill “covers”",
      icon: "edit",
      body: "Type each department of your office's rows once, separated by “; ”. Next unlocks once the list matches Section 8.1.",
      getEl: () => briefIn("covers"),
      pointAt: () => briefIn("covers"),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => cellIn(briefIn("covers")),
      doIt: "Fill covers",
    },
    finish("Fill “at” with your office and the Source line. This button unlocks once all three are in."),
  ],

  "T3.1-16": [
    {
      title: "What is outside",
      icon: "table",
      body: "Rule L03: out of scope is only what the addendum lists as excluded, with its reason. An exclusion with no reason is a Stage 1 blocker for the auditor.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    {
      title: "Out of scope",
      icon: "edit",
      body: "Search BKB-ADD-16 for anything it lists as excluded. Type what you find, or None if it lists nothing. Next unlocks once it matches the addendum.",
      getEl: () => briefIn("Out of scope"),
      pointAt: () => briefIn("Out of scope"),
      nextWhen: () => cellIn(briefIn("Out of scope")),
      doIt: "Fill Out of scope",
    },
    {
      title: "Interfaces",
      icon: "edit",
      body: "L03 takes the interfaces from the TSA Integrations sheet: BKB-ADD-16 Section 9.1 is its extract. Copy the Integration of its first 3 External rows, in order, separated by “; ”.",
      getEl: () => briefIn("Interfaces"),
      pointAt: () => briefIn("Interfaces"),
      nextWhen: () => cellIn(briefIn("Interfaces")),
      doIt: "Fill Interfaces",
    },
    finish("Name the addendum in the Source line. This button unlocks once it is in."),
  ],

  "T3.1-17": [
    {
      title: "Climate change",
      icon: "table",
      body: "Amendment 1:2024 asks whether climate change is a relevant issue (4.1) and what interested parties require about it (4.2). The Group has decided; your scope records its reason.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openPage(17, "Ref-ISMS processes"),
    {
      title: "Copy the row",
      icon: "edit",
      body: "The climate-change row is the last of Ref-ISMS processes. Copy its second cell word for word. Next unlocks once it matches.",
      getEl: () => briefIn("Relevant?"),
      pointAt: () => briefIn("Relevant?"),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-ISMS processes")) : null),
      nextWhen: () => cellIn(briefIn("Relevant?")),
      doIt: "Copy the climate-change row",
    },
    finish("Name the page in the Source line. This button unlocks once both are in."),
  ],

  "T3.1-18": [
    {
      title: "Ten processes, ten owners",
      icon: "table",
      body: "Clause 4.4: the ISMS is a set of processes, each with an owner who answers for it. Rule L04 takes them from the Group RACI.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openPage(18, "Ref-ISMS processes"),
    {
      title: "The first owner",
      icon: "edit",
      body: "Copy the owner of Risk assessment and treatment, word for word. Next unlocks once it matches.",
      getEl: () => briefIn("Risk assessment and treatment"),
      pointAt: () => briefIn("Risk assessment and treatment"),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-ISMS processes")) : null),
      nextWhen: () => cellIn(briefIn("Risk assessment and treatment")),
      doIt: "Copy the first owner",
    },
    finish("Copy the other nine and the Source line. This button unlocks once all are in."),
  ],

  "T3.1-19": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is LI-SCOPE as it prints. The Statement of Applicability in T3.2 and the audit programme in T12.1 are both bounded by it. This step checks the page, names the file and submits it.",
      getEl: () => $('[data-guide="page-fit"]'),
    },
    ...nameAndSubmit("docx", "1 to 18"),
  ],
  "T3.2-1": [
    {
      title: "Your crosswalk",
      icon: "table",
      body: "At work, a crosswalk shows which Group policy and which ISO/IEC 27001 control answer each outside requirement, so one set of controls serves many standards. MAP-XW holds your 8 requirements from dataset MAP-8. First, the policy that covers each.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openCrosswalk("Key words, the BKB policy that covers them, and its Annex A controls."),
    {
      title: "An example",
      icon: "book",
      body: "A requirement about access rights uses the key word “access”: Crosswalk View's first row leads to BKB-POL-006. A key word is a lead, not an answer: read the requirement to see what it is really about.",
      getEl: () => $(XW_WINDOW),
    },
    ...openLib(1, "BKB-POL-000", "The Policy Framework and Index", POL000_WINDOW),
    {
      title: "Index and sector overlays",
      icon: "book",
      getEl: () => $(`${POL000_WINDOW} [data-sec="8"]`),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
      body: "Section 8 names the policy that implements each kind of standard: start there. Section 3, above it, lists every policy by title. A key word in the requirement moves it to a narrower policy only where that policy's title is about what the requirement asks.",
    },
    {
      title: "Choose for the first row",
      icon: "edit",
      body: "Read row 1's requirement and choose the BKB policy that covers it. Next unlocks once one is chosen.",
      getEl: () => oblCell("BKB policy", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("BKB policy", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("BKB policy", 1),
      nextWhen: () => selIn("BKB policy", 1),
      doIt: "Choose row 1's policy",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Choose for the other seven. Once every row has a policy, Check my answers shows each row's verdict. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T3.2-2": [
    {
      title: "The control for each one",
      icon: "table",
      body: "Now the Annex A control that implements each requirement. Each row offers three candidates, with their titles.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openCrosswalk("Each row lists the Annex A controls of its policy."),
    {
      title: "An example",
      icon: "book",
      body: "BKB-POL-006's row lists A.5.15–A.5.18 and A.8.5: an access-rights requirement mapped to BKB-POL-006 would take one of those, such as A.5.18 Access rights.",
      getEl: () => $(XW_WINDOW),
    },
    {
      title: "Choose for the first row",
      icon: "edit",
      body: "Find row 1's policy in Crosswalk View, then choose the candidate that implements row 1's requirement. Next unlocks once one is chosen.",
      getEl: () => oblCell("ISO/IEC 27001 control", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("ISO/IEC 27001 control", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("ISO/IEC 27001 control", 1),
      nextWhen: () => selIn("ISO/IEC 27001 control", 1),
      doIt: "Choose row 1's control",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row has a control, Check my answers shows each row's answer and why. Your rows lock then, so check them first." ,
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T3.2-3": [
    {
      title: "Is there a procedure?",
      icon: "table",
      body: "A policy says what must happen; a procedure says who does it, step by step. Rule R11 counts both. Each policy's Section 6 lists its procedures by name.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("policies", "Policies", "Policy Library", "Every BKB policy is in it.", LIBRARY_WINDOW),
    {
      title: "Open row 1's policy",
      icon: "book",
      body: "Click the policy you chose for row 1. A policy with no text on the platform shows its headings, which name its procedures.",
      getEl: () => $(LIBRARY_WINDOW),
      waitFor: () => !!$(POLICY_WINDOW),
      doIt: "Click row 1's policy",
    },
    {
      title: "Its procedures",
      icon: "book",
      body: "The headings “Procedure: …” under Section 6 are its procedures, each named after what it does. Does one of them carry out row 1's requirement?",
      getEl: () => $(POLICY_WINDOW),
    },
    {
      title: "Row 1",
      icon: "edit",
      body: "Type that procedure's number, such as 6.1, or none. Next unlocks once it is a procedure of the row's policy, or none.",
      getEl: () => oblCell("Procedure section", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Procedure section", 1)?.scrollIntoView({ block: "center", inline: "nearest" }),
      pointAt: () => oblCell("Procedure section", 1),
      alsoShow: () => (innerWidth > 700 ? $(POLICY_WINDOW) : null),
      nextWhen: () => cellIn(oblCell("Procedure section", 1)),
      doIt: "Fill row 1",
    },
    finish("Do the other seven the same way. This button unlocks once all eight are filled."),
  ],

  "T3.2-4": [
    {
      title: "Rate coverage",
      icon: "table",
      body: "The note above the work quotes rule R11. Each row shows the three things R11 counts: its control, its policy and its procedure.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "How to read a row",
      icon: "info",
      body: "Count what the row has: a control, a policy, and a procedure unless it says none. Then read R11 for that count.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Rate row 1",
      icon: "edit",
      body: "Choose row 1's coverage. Next unlocks once one is chosen.",
      getEl: () => oblCell("Coverage (R11)", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Coverage (R11)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Coverage (R11)", 1),
      nextWhen: () => selIn("Coverage (R11)", 1),
      doIt: "Rate row 1",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Rate the other seven. Once every row has a rating, Check my answers shows each row's answer and why. Your rows lock then, so check them first." ,
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T3.2-5": [
    {
      title: "Now the gap sentences",
      icon: "table",
      body: "Your answer is in. Part 2: every row you rated Partial or None gets its gap sentence, in rule R12's frame. A Full row has none.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-000", "The Policy Framework and Index", POL000_WINDOW),
    {
      title: "Who owns each policy",
      icon: "book",
      getEl: () => $(`${POL000_WINDOW} [data-sec="3"]`),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
      body: "Section 3 gives each policy's owner. BKB-POL-006, for example, is owned by the Group CISO.",
    },
    {
      title: "Write the first one",
      icon: "edit",
      body: "Write the first open row's sentence: what the row lacks, then its policy's owner as Section 3 names it. Next unlocks once it follows R12.",
      getEl: () => firstInput("Gap sentence (R12)")?.closest("td") ?? $('[data-guide="register"]'),
      onEnter: () => firstInput("Gap sentence (R12)")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => firstInput("Gap sentence (R12)"),
      alsoShow: () => (innerWidth > 700 ? $(POL000_WINDOW) : null),
      nextWhen: () => !firstInput("Gap sentence (R12)") || cellIn(firstInput("Gap sentence (R12)")),
      doIt: "Write the first gap sentence",
    },
    finish("Write the rest the same way. This button unlocks once every Partial or None row has its sentence."),
  ],

  "T3.2-6": [
    {
      title: "Where it can be checked",
      icon: "table",
      body: "An assessor checks a mapping by opening its source. Evidence ref names the row's policy and the section you read in it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "Fill row 1",
      icon: "edit",
      body: "Type row 1's policy, then the section you read, such as its procedure section: BKB-POL-… Section …. Next unlocks once it names the row's policy and one of its sections.",
      getEl: () => oblCell("Evidence ref", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Evidence ref", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Evidence ref", 1),
      nextWhen: () => cellIn(oblCell("Evidence ref", 1)),
      doIt: "Fill row 1",
    },
    finish("Fill the other seven. This button unlocks once all eight are in."),
  ],

  "T3.2-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is MAP-XW: your 8 requirements mapped to a policy, a control and a procedure, rated, with their gaps. T4.1, T7.1 and T8.2 work from it, and the Statement of Applicability builds on it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review, so any empty cell is marked amber here and this line counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6"),
  ],

  "T3.2-8": [
    {
      title: "Your Statement of Applicability",
      icon: "table",
      body: "The Statement of Applicability (clause 6.1.3 d) is the auditor's map of the ISMS: every Annex A control, with a decision and a justification. T-LI-SOA comes pre-filled. Before you fill it, check it is complete.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Scroll the Control column to where the A.5 rows end, and click the last A.5 control. Next unlocks once it is found.",
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => $('[data-guide="register"] tbody'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="org"]'),
      doIt: "Click the last A.5 control",
    },
    finish("Find the other two the same way. This button unlocks once all three are found."),
  ],

  "T3.2-9": [
    {
      title: "Applicable or not",
      icon: "table",
      body: "Every control gets a decision. Rule L06 says when a control may be Not applicable, and it starts from Ref-SoA exclusions: the Group's decision for your organisation.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-SoA exclusions"),
    {
      title: "Decide for A.5.1",
      icon: "edit",
      body: "Find LearnTech's row in Ref-SoA exclusions, read rule L06 in Ref-Rules if you need it, and decide for A.5.1. Next unlocks once it is chosen.",
      getEl: () => oblCell("Applicable (L06)", 1)?.closest("td") ?? null,
      pointAt: () => oblCell("Applicable (L06)", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-SoA exclusions")) : null),
      nextWhen: () => selIn("Applicable (L06)", 1),
      doIt: "Decide for A.5.1",
    },
    {
      title: "The other 92",
      icon: "info",
      body: "Decide each of the other 92 the same way: is it in LearnTech's row of Ref-SoA exclusions? Each control is its own decision.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Now the justification",
      icon: "table",
      body: "Every row also says why. Rule L06 takes the first source in its order, starting with LearnTech's risk register: a risk whose treatment uses the control.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(9, "RA-36 Risk register (HQ Istanbul)"),
    {
      title: "An example",
      icon: "book",
      body: "A.8.7 Protection against malware: read the controls column from the top. R-36-HQ-01 lists A.8.7, the first risk to do so, so A.8.7's justification is R-36-HQ-01. A range such as A.7.1–A.7.7 includes every control between.",
      getEl: () => $(PAGE_WINDOW("RA-36 Risk register (HQ Istanbul)")),
    },
    {
      title: "Justify A.5.1",
      icon: "edit",
      body: "Look for A.5.1 in the register's controls column and choose its justification by L06's order. Next unlocks once it is right.",
      getEl: () => oblCell("Justification (L06)", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Justification (L06)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Justification (L06)", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("RA-36 Risk register (HQ Istanbul)")) : null),
      nextWhen: () => selIn("Justification (L06)", 1),
      doIt: "Choose A.5.1's justification",
    },
    {
      title: "The other justifications",
      icon: "info",
      body: "Do the same for every row. A justification that is not L06's first source is marked; its hint says where to look.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row has a decision, Check my answers shows each row's answer and why. Your rows lock then, so check them first." ,
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T3.2-10": [
    {
      title: "Implementation status",
      icon: "table",
      body: "For your 12 deep-dive controls the SoA says whether each is in place. Rule L07 reads it from two sheets of LearnTech's technology-stack workbook, TSA-36: Control_Mapping, then Roadmap.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(10, "TSA-36 Control_Mapping"),
    {
      title: "An example",
      icon: "book",
      body: "A.8.15 Logging has a row here with its products, so under L07 its status would be Yes. A control with no row here is looked for in TSA-36 Roadmap, also tagged Step 10 in Reference pages.",
      getEl: () => $(PAGE_WINDOW("TSA-36 Control_Mapping")),
    },
    {
      title: "A.5.16",
      icon: "edit",
      body: "Look for A.5.16 in Control_Mapping and choose its status by L07. Next unlocks once one is chosen.",
      getEl: () => oblCell("Implemented (L07)", 16)?.closest("td") ?? null,
      pointAt: () => oblCell("Implemented (L07)", 16),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("TSA-36 Control_Mapping")) : null),
      nextWhen: () => selIn("Implemented (L07)", 16),
      doIt: "Choose A.5.16's status",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other eleven, opening TSA-36 Roadmap for any control Control_Mapping does not list. Once every row has a status, Check my answers shows each row's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T3.2-11": [
    {
      title: "Each control's concept",
      icon: "table",
      body: "ISO/IEC 27002 tags every control with attributes. Its cybersecurity concept (Identify, Protect, Detect, Respond, Recover) lets a control set be read against NIST CSF's functions. Rule L05: copy it for your 12 deep-dive controls.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(11, "Ref-27002 attributes"),
    {
      title: "An example",
      icon: "book",
      body: "A.5.24, Information security incident management planning and preparation, reads “Respond, Recover” under Cybersecurity concepts: both are copied, as written.",
      getEl: () => $(PAGE_WINDOW("Ref-27002 attributes")),
    },
    {
      title: "A.5.16",
      icon: "edit",
      body: "Find A.5.16 in Ref-27002 attributes and choose what its Cybersecurity concepts column says. Next unlocks once one is chosen.",
      getEl: () => oblCell("Cybersecurity concept (L05)", 16)?.closest("td") ?? null,
      pointAt: () => oblCell("Cybersecurity concept (L05)", 16),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27002 attributes")) : null),
      nextWhen: () => selIn("Cybersecurity concept (L05)", 16),
      doIt: "Choose A.5.16's concept",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other eleven the same way. Once every row has a concept, Check my answers shows each row's answer and why. Your rows lock then, so check them first." ,
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  // The question of step 12, in its row (its second part is done in Frameworks › Export Mapping).
  "T3.2-12q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, a question about the Statement of Applicability. Read the situation in the box, then the three options.",
      getEl: () => $('#act-12 [data-guide="decision"]'),
    },
    ...openPage(12, "Ref-Rules"),
    {
      title: "Rule L06",
      icon: "book",
      body: "Read rule L06: when a control may be Not applicable, and where an applicable control's justification comes from, in order. Hold it against the situation.",
      getEl: () => l06Row() ?? $(PAGE_WINDOW("Ref-Rules")),
      onEnter: () => l06Row()?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-12 [data-guide="decision"]'),
      pointAt: () => $('#act-12 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-12 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-12 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2 opens from Open Export Mapping, below the question.",
      getEl: () => $('#act-12 [data-guide="show-me-how"]'),
    },
  ],

  "T3.2-12": [
    {
      title: "Now check consistency",
      icon: "table",
      body: "Your answer is in. Part 2: the check compares every control's decision with rule L06 and lists any row that breaks it.",
      getEl: () => $('[data-guide="consistency"]'),
    },
    {
      title: "Run the check",
      icon: "edit",
      body: "Click Check consistency. Next unlocks once it has run.",
      getEl: () => $('[data-guide="consistency"]'),
      pointAt: () => $('[data-guide="consistency"] button'),
      nextWhen: () => !!$('[data-guide="consistency-result"]'),
      doIt: "Click Check consistency",
    },
    {
      title: "Fix, then check again",
      icon: "info",
      body: "A row it lists appears in the table: re-apply L06 there, then check again. It also lists a Not applicable control that a risk in RA-36 Risk register uses as a treatment.",
      getEl: () => $('[data-guide="consistency-result"]'),
    },
    finish("This button unlocks once a check has run and no row breaks L06."),
  ],

  "T3.2-13": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is LI-SOA: the 93 controls with your decisions. The risk treatment plan in T7.1, the gap analysis in T7.2 and the management review in T12.1 read it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber here and this line counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 12"),
  ],

  "T4.1-1": [
    {
      title: "Your currency checklist",
      icon: "table",
      body: "At work, before you test what a policy says, you check that it is current: owned, approved, in date and made known to the people it binds. POL-CUR lists six such checks for BKB-POL-006. For each, copy the value from the policy, then decide Yes or No.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The document-control table",
      icon: "book",
      body: "Section 11 lists the policy's fields, one per row: who owns it, who approved it, its dates, its status. The bar at the top of the window jumps to Section 11.",
      getEl: () => $(`${POL006_WINDOW} [data-sec="11"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="11"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A check “Classification is set” would copy the Classification row, Internal, and decide Yes. A field left empty, or a value the rule does not allow, is a No.",
      getEl: () => $(`${POL006_WINDOW} [data-sec="11"]`) ?? $(POL006_WINDOW),
    },
    {
      title: "Copy the first value",
      icon: "edit",
      body: "The first check names the field to copy. Type its value as Section 11 writes it. Next unlocks once it matches.",
      getEl: () => famCell("Value copied", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Value copied", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Value copied", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL006_WINDOW) : null),
      nextWhen: () => cellIn(famCell("Value copied", 1)),
      doIt: "Copy the first value",
    },
    {
      title: "Decide the first line",
      icon: "edit",
      body: "Does the value meet the check? Choose Yes or No. Next unlocks once one is chosen.",
      getEl: () => famCell("Yes/No", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Yes/No", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Yes/No", 1),
      nextWhen: () => selIn("Yes/No", 1),
      doIt: "Choose Yes or No",
    },
    {
      title: "The other five",
      icon: "info",
      body: "Some checks hold the value against BKB-POL-000: Section 2 says who approves a policy, Section 7 how its lifecycle runs. BKB-POL-000 is tagged Step 1 in the Policy Library too.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every line has a value and a Yes or No, Check my answers shows each line's answer and why. Your lines lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.1-2": [
    {
      title: "Your gap table",
      icon: "table",
      body: "At work, a policy review tests each requirement the policy must meet against what the policy actually says. POL-GAP holds your six requirements from dataset POL-GAP. First, find the clause that holds each one's action words, or none.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "An example",
      icon: "book",
      body: "“Leavers' access must be removed within a defined time”: its action words are remove, leavers, access. Section 3.1's fifth bullet holds them, so its clause is BKB-POL-006 Section 3.1 bullet 5. Bullets are counted from the top of Section 3.1.",
      getEl: () => $(`${POL006_WINDOW} [data-sec="3.1"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Q1 yourself",
      icon: "edit",
      body: "Read Q1, pick out its action words, and look for them in the policy and in BKB-ADD-16 Section 5 and Section 6. Choose the clause that holds them, or none. Next unlocks once one is chosen.",
      getEl: () => famCell("Policy clause", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Policy clause", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Policy clause", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL006_WINDOW) : null),
      nextWhen: () => selIn("Policy clause", 1),
      doIt: "Choose Q1's clause",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do Q2 to Q6 the same way. Once every row has a clause or none, Check my answers shows each row's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.1-3": [
    {
      title: "Rate coverage",
      icon: "table",
      body: "A clause found is not yet a requirement met. The note above the work quotes rule R13; each row shows the clause you found in step 2.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openLib(3, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "How to read a row",
      icon: "info",
      body: "Hold the requirement against its clause: is it the same action? Does the requirement ask for a time limit or an owner, and does the clause give one? “Leavers' access must be removed within a defined time” against Section 3.1 bullet 5, “within 4 hours”: same action, a time limit given, so Covered.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Rate Q1",
      icon: "edit",
      body: "Choose Q1's coverage by R13. Next unlocks once one is chosen.",
      getEl: () => famCell("Coverage (R13)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Coverage (R13)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Coverage (R13)", 1),
      nextWhen: () => selIn("Coverage (R13)", 1),
      doIt: "Rate Q1",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Rate Q2 to Q6. Once every row has a rating, Check my answers shows each row's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.1-4": [
    {
      title: "Where each fix belongs",
      icon: "table",
      body: "A gap is fixed in one of two places: the Group policy, for every organisation, or GlobalConnect's addendum, for local rules. The note quotes R13's test. A covered row has no gap and shows —.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "Your first gap",
      icon: "edit",
      body: "Read the first open row's requirement and source. Does it name a country or an office? Choose by R13. Next unlocks once one is chosen.",
      getEl: () => firstInput("Fix location (R13)")?.closest("td") ?? $('[data-guide="register"]'),
      onEnter: () => firstInput("Fix location (R13)")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => firstInput("Fix location (R13)"),
      nextWhen: () => !!(firstInput("Fix location (R13)") as HTMLSelectElement | null)?.value,
      doIt: "Choose where the first fix belongs",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other gaps. Check my answers then shows each row's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.1-5": [
    {
      title: "Now the redlines",
      icon: "table",
      body: "A redline is the wording you propose to close a gap, in policy language. The policy owner reads it, and if approved it becomes a corrective action in T12.1. R13's frame: “<Role> shall <action> within <time limit>.”",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "Who acts",
      icon: "book",
      body: "Section 6's procedures name who does each step in their Responsible column, and Section 5 lists the policy's roles. A redline names one of them.",
      getEl: () => $(`${POL006_WINDOW} [data-sec="6.1"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "Had the leavers rule no time limit, its redline could read: “IAM team shall disable every account of a leaver within 4 hours.” Role, action, time limit. A redline that would loosen a Group value is “Exception needed” instead.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Write the first one",
      icon: "edit",
      body: "Write the first open row's redline in the frame. Next unlocks once it has a role the policy names, “shall”, an action and a time limit.",
      getEl: () => firstInput("Redline (R13 frame)")?.closest("td") ?? $('[data-guide="register"]'),
      onEnter: () => firstInput("Redline (R13 frame)")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => firstInput("Redline (R13 frame)"),
      nextWhen: () => !firstInput("Redline (R13 frame)") || cellIn(firstInput("Redline (R13 frame)")),
      doIt: "Write the first redline",
    },
    finish("Write the rest the same way. This button unlocks once every gap has its redline. An assessor reads what they say at checkpoint HC2."),
  ],

  "T4.1-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "POL-CUR and POL-GAP are the two sheets of the policy review record. Your redlines become actions in ACT-TRACKER (T12.1), and T4.2 turns a policy statement into a procedure. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review: any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: `${c.body} Name both: one box for POL-CUR, one for POL-GAP.` } : c)),
  ],

  "T4.1-7": [
    {
      title: "Clause 5.2 checklist",
      icon: "table",
      body: "At work, an ISO/IEC 27001 implementer checks the top-level information security policy against clause 5.2 before the certification audit, which reads it first. The template lists the seven things 5.2 asks for, each with a key word. Rule L08: search BKB-POL-001 for it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-POL-001", "The Information Security Policy", POL001_WINDOW),
    {
      title: "An example",
      icon: "book",
      body: "Searching for “risk”: Section 3.1 has it (“Risks to information are assessed …”), so an item with that key word would be Found, section 3.1. A word in no section is a Gap.",
      getEl: () => $(`${POL001_WINDOW} [data-sec="3.1"]`) ?? $(POL001_WINDOW),
      onEnter: () => $(`${POL001_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Item a) yourself",
      icon: "edit",
      body: "Search the policy for item a)'s key word. Choose Found or Gap; if Found, type the section it is in. Next unlocks once the row is complete.",
      getEl: () => famCell("Found/Gap (L08)", 1)?.closest("tr") ?? null,
      onEnter: () => famCell("Found/Gap (L08)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Found/Gap (L08)", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL001_WINDOW) : null),
      // A Gap needs no section (it shows —); Found needs one the policy has.
      nextWhen: () => selIn("Found/Gap (L08)", 1) && ((famCell("Found/Gap (L08)", 1) as HTMLSelectElement).value === "Gap" || cellIn(famCell("Section", 1))),
      doIt: "Decide item a)",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other six. Once every item is decided, Check my answers shows each one's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.1-8": [
    {
      title: "Leadership evidence",
      icon: "table",
      body: "Clause 5.1 asks top management to show commitment to the ISMS. At work, an implementer keeps a list of that evidence and where each piece is stored, so the auditor can be taken straight to it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(8, "Ref-Leadership"),
    {
      title: "Row 1",
      icon: "edit",
      body: "Copy the page's first item and where it is stored, as written. Next unlocks once both match.",
      getEl: () => famCell("Leadership evidence item (5.1)", 1)?.closest("tr") ?? null,
      onEnter: () => famCell("Leadership evidence item (5.1)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Leadership evidence item (5.1)", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Leadership")) : null),
      nextWhen: () => cellIn(famCell("Leadership evidence item (5.1)", 1)) && cellIn(famCell("Where it is stored", 1)),
      doIt: "Copy row 1",
    },
    finish("Copy the other four in the page's order. This button unlocks once all five match the page."),
  ],

  // The question of step 9, in its row (its second part, the RACI, is done in Review & Redline).
  "T4.1-9q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, a question about the RACI: who answers for the Statement of Applicability. Read the situation in the box, then the three options.",
      getEl: () => $('#act-9 [data-guide="decision"]'),
    },
    ...openScreen("policies", "Policies", "Policy Library", "The library is tagged Step 9.", LIBRARY_WINDOW),
    {
      title: "Open Charter",
      icon: "book",
      body: "The BKB Group GRC Charter is tagged Step 9.",
      getEl: () => $(`${LIBRARY_WINDOW} [data-doc="Charter"]`),
      waitFor: () => !!$(CHARTER_WINDOW),
      doIt: "Click Charter",
    },
    {
      title: "Three lines, and independence",
      icon: "book",
      body: "Section 5.2 says which line each function sits in; Section 17 who may approve what. The bar at the top jumps to each. Hold them against the three options.",
      getEl: () => $(`${CHARTER_WINDOW} [data-sec="5.2"]`) ?? $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="5.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-9 [data-guide="decision"]'),
      pointAt: () => $('#act-9 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-9 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-9 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2 opens from Open Review & Redline, below the question.",
      getEl: () => $('#act-9 [data-guide="show-me-how"]'),
    },
  ],

  "T4.1-9": [
    {
      title: "Now the RACI",
      icon: "table",
      body: "Your answer is in. Part 2: the Accountable role of each of the ten ISMS processes. A RACI with exactly one A per row tells everyone who answers for each process; LI-15 and T7.2 reuse these roles.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-ISMS processes"),
    {
      title: "How to read it",
      icon: "book",
      body: "Its Owner (Accountable) column names one role per process. Where it adds a note, as in “Role (who else decides)”, the A is the role named first.",
      getEl: () => $(PAGE_WINDOW("Ref-ISMS processes")),
    },
    {
      title: "The first process",
      icon: "edit",
      body: "Find the first process in the page and choose its Accountable role. Next unlocks once one is chosen.",
      getEl: () => famCell("Accountable (A)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Accountable (A)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Accountable (A)", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-ISMS processes")) : null),
      nextWhen: () => selIn("Accountable (A)", 1),
      doIt: "Choose the first process's A",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other nine. Once every process has a role, Check my answers shows each row's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.1-10": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-POL is one file with three sheets: the clause 5.2 checklist, the leadership evidence and the RACI. T11.1 builds its competence matrix on the RACI's roles, and T7.2 makes the A owners milestone owners. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "7 to 9"),
  ],

  "T4.2-1": [
    {
      title: "Your SOP's step table",
      icon: "table",
      body: "At work, a policy says what must happen; a standard operating procedure (SOP) says who does what, in which order and by when, so a new joiner can follow it without asking. Rule R14 fixes the six steps of every BKB SOP. Your SOP carries out BKB-POL-021's procedure for approving a new cloud service.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "The procedure",
      icon: "book",
      body: "Section 6.1 lists the procedure's lines in order: each has an action, the role responsible and its output with a time limit. The bar at the top of the window jumps to Section 6.1.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "Another procedure, BKB-POL-000 Section 6 (exceptions): its trigger is “Submit exception …”, the line that starts it, and its record is “Register exception …”, the line that writes it down. Match each SOP step to the Section 6.1 line that does what the step's name says.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Step 1 is Trigger received: which Section 6.1 line starts the procedure? Choose its action. Next unlocks once it is right.",
      getEl: () => famCell("Action (BKB-POL-021 Section 6.1)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Action (BKB-POL-021 Section 6.1)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Action (BKB-POL-021 Section 6.1)", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      nextWhen: () => selIs("Action (BKB-POL-021 Section 6.1)", 1, pol021At(1, 1)),
      doIt: "Choose step 1's action",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do steps 2 to 6. Section 6.1 has one line more than the SOP has steps: one line has no step of its own. Once every step has an action, Check my answers shows each one's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.2-2": [
    {
      title: "Now the time limits",
      icon: "table",
      body: "Your answer is in. Part 2: each SOP step's time limit. Each step shows the action you chose in step 1; its Section 6.1 line gives a time limit, and BKB-ADD-36 Section 5 may give LearnTech's own.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "The policy's time limits",
      icon: "book",
      body: "In Section 6.1 the Output / SLA column gives each line's output, a dash, then its time limit.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    ...openLib(2, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "LearnTech's own values",
      icon: "book",
      body: "Section 5 lists the values that apply to LearnTech. Its last rows name BKB-POL-021 and a Section 6.1 output. The bar at the top of the window jumps to Section 5.",
      getEl: () => $(`${ADD36_WINDOW} [data-sec="5"]`) ?? $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="5"] tr:last-child`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Step 1's line is the request. Does Section 5 set a value for its output? Choose step 1's time limit. Next unlocks once it is right.",
      getEl: () => famCell("Time limit", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Time limit", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Time limit", 1),
      nextWhen: () => selIs("Time limit", 1, limitAt(1)),
      doIt: "Choose step 1's time limit",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do steps 2 to 6. Once every step has a time limit, Check my answers shows each one's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.2-3": [
    {
      title: "Who does each step",
      icon: "table",
      body: "A step nobody owns is a step nobody does. Each SOP step shows the action you chose; its Section 6.1 line names the role responsible for it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(3, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "The Responsible column",
      icon: "book",
      body: "Section 6.1's third column names the role for each line, as the SOP must write it.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Find step 1's action in Section 6.1 and choose the role it names. Next unlocks once it is right.",
      getEl: () => famCell("Responsible", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Responsible", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Responsible", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      nextWhen: () => selIs("Responsible", 1, pol021At(1, 2)),
      doIt: "Choose step 1's role",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do steps 2 to 6. Once every step has a role, Check my answers shows each one's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.2-4": [
    {
      title: "The SOP's RACI",
      icon: "table",
      body: "An SOP repeats the roles of the policy it carries out, so a reader sees who answers for what. BKB-POL-021 Section 5 is that table: one role per row, with its responsibility.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "Roles and responsibilities",
      icon: "book",
      body: "Section 5 gives each role's responsibility in its second column. The bar at the top of the window jumps to Section 5.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="5"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="5"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The first role yourself",
      icon: "edit",
      body: "Find the first role in Section 5 and choose its responsibility. Next unlocks once it is right.",
      getEl: () => famCell("Responsibility (BKB-POL-021 Section 5)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Responsibility (BKB-POL-021 Section 5)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Responsibility (BKB-POL-021 Section 5)", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      nextWhen: () => selIs("Responsibility (BKB-POL-021 Section 5)", 1, docTable("BKB-POL-021", "5")?.[0]?.[1] ?? ""),
      doIt: "Choose the first responsibility",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other seven. Once every role has one, Check my answers shows each row's answer. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T4.2-5": [
    {
      title: "What each step leaves",
      icon: "table",
      body: "Your answer is in. Part 2: each SOP step's output, the record an auditor later asks for, and the escalation contact of the exception step.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "Outputs",
      icon: "book",
      body: "In Section 6.1 the Output / SLA column starts with the output, before the dash.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Find step 1's line in Section 6.1 and choose its output. Next unlocks once it is right.",
      getEl: () => famCell("Output", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Output", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Output", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      nextWhen: () => selIs("Output", 1, (pol021At(1, 3) ?? "").split(" — ")[0]),
      doIt: "Choose step 1's output",
    },
    {
      title: "The escalation contact",
      icon: "book",
      body: "Section 8 names the escalation contact of the policy's procedures. Type it in the exception step's row, as Section 8 writes it.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="8"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other outputs and the contact. Once every step has an output, Check my answers shows each one's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked and the contact is filled."),
  ],

  "T4.2-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "SOP-DOC is one document: the step table and the RACI. T6.2 and T8.2 test against its steps, so every cell counts. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each part counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "1 to 5"),
  ],

  "T4.2-7q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, the label your SOP carries. Read the situation in the box, then the three options.",
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    ...openLib(7, "BKB-STD-001", "The Information Classification Standard", STD_WINDOW),
    {
      title: "The tree",
      icon: "book",
      body: "Section 5 asks its questions in order: stop at the first yes. Section 3 describes each tier, with examples. The bar at the top jumps to each. LearnTech's name for each tier is in BKB-ADD-36 Section 7, also tagged Step 7.",
      // The whole window: Section 5 sits below the long Section 3 table and may still be loading when the card opens.
      getEl: () => $(STD_WINDOW),
      onEnter: () => $(`${STD_WINDOW} [data-sec="5"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-7 [data-guide="decision"]'),
      pointAt: () => $('#act-7 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-7 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2 opens from Open New from Template, below the question.",
      getEl: () => $('#act-7 [data-guide="show-me-how"]'),
    },
  ],

  "T4.2-7": [
    {
      title: "The document-control block",
      icon: "table",
      body: "At work, an implementer puts every controlled document under document control (ISO/IEC 27001 clause 7.5): an ID, a version, an owner, an approver and dates, so the right version is the one in use. The label is your answer to the question; the block records it by itself.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-POL-000", "The Policy Framework", POL000_WINDOW),
    {
      title: "The rules for each field",
      icon: "book",
      body: "Section 7.1's first table gives the rule for each field. Some point to Section 2 (who approves what) or Section 3 (who owns each policy). The bar at the top jumps to each.",
      getEl: () => $(`${POL000_WINDOW} [data-sec="7.1"]`) ?? $(POL000_WINDOW),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The ID yourself",
      icon: "edit",
      body: "Apply Section 7.1's ID rule to the procedure your SOP carries out, BKB-POL-021 Section 6.1, and choose the ID it gives. Next unlocks once it is right.",
      getEl: () => famCell("Value", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Value", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Value", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL000_WINDOW) : null),
      nextWhen: () => selIs("Value", 1, "BKB-POL-021-PR-6.1"),
      doIt: "Choose the Document ID",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Fill the other fields. Once every one has a value, Check my answers shows each field's answer and why. Your values lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.2-8": [
    {
      title: "The SOP's life-cycle",
      icon: "table",
      body: "Clause 7.5.3 asks that documented information is controlled from creation to disposal. LI-DOC records who does each of the seven stages for your SOP.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(8, "BKB-POL-000", "The Policy Framework", POL000_WINDOW),
    {
      title: "Who does what",
      icon: "book",
      body: "Section 7.1's second table names a role for each stage. Where it says Policy owner, Section 3 tells you which role owns BKB-POL-021.",
      getEl: () => $(`${POL000_WINDOW} [data-sec="7.1"]`) ?? $(POL000_WINDOW),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="7.1"] table:last-of-type`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Create yourself",
      icon: "edit",
      body: "Read the Create row of Section 7.1's second table and choose who does it. Next unlocks once it is right.",
      getEl: () => famCell("Who", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Who", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Who", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL000_WINDOW) : null),
      nextWhen: () => selIs("Who", 1, "Policy & Governance Analyst"),
      doIt: "Choose who creates it",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other six stages. Once each has a role, Check my answers shows each one's answer and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.2-9": [
    {
      title: "The mandatory-documents register",
      icon: "table",
      body: "ISO/IEC 27001 requires certain documented information to exist; a certification auditor asks for each at Stage 1. For each row decide whether the standard wants a document or a record, then record where BKB keeps it. Row 7.5.1 b is a worked example.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLearn("Framework Quick Reference", "The entry ISO/IEC 27001 documented information says what maintain and retain mean.", QR_WINDOW),
    {
      title: "Maintain or retain",
      icon: "book",
      body: "A document is kept current; a record is kept unchanged, as proof of what was done or found. Read each row's documented information with that in mind.",
      getEl: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 documented information"]`),
      onEnter: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 documented information"]`)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "4.3 yourself",
      icon: "edit",
      body: "The first row is the ISMS scope. Is it kept current, or kept as proof? Choose Document or Record. Next unlocks once it is right.",
      getEl: () => famCell("Document or record", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Document or record", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Document or record", 1),
      nextWhen: () => selIs("Document or record", 1, "Document (maintained)"),
      doIt: "Choose for 4.3",
    },
    ...openPage(9, "Ref-Locations"),
    {
      title: "Where BKB keeps it",
      icon: "edit",
      body: "Find clause 4.3 in Ref-Locations and choose the location it gives. Next unlocks once it is right.",
      getEl: () => famCell("BKB library location", 1)?.closest("td") ?? null,
      onEnter: () => famCell("BKB library location", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("BKB library location", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Locations")) : null),
      nextWhen: () => selIn("BKB library location", 1),
      doIt: "Choose 4.3's location",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other twelve rows. A location that is not the clause's is flagged at once. Once every row is filled, Check my answers shows each row's Document or Record and why. Your rows lock then, so check them first.",
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("This button unlocks once your answers are checked."),
  ],

  "T4.2-10": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-DOC is one file with three sheets: the SOP's document-control block, its life-cycle and the mandatory-documents register. T12.1 decides Stage 1 readiness from the register. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "7 to 9"),
  ],
  "T5.1-1": [
    {
      title: "Your evidence request list",
      icon: "table",
      body: "At work, before an external audit the Compliance Manager sends control owners a PBC list: exactly what evidence to send, for which population and period, by when. A vague request wastes the owner's time and leaves the auditor without evidence on day one. Each row here is one request, for one control of dataset PBC-6.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-POL-016", "The Compliance and Regulatory Management Policy", POL016_WINDOW),
    {
      title: "What a request asks for",
      icon: "book",
      body: "Section 6.2's second table says how each field of a request is set. Evidence requested is its first line. The bar at the top of the window jumps to Section 6.2.",
      getEl: () => $(`${POL016_WINDOW} [data-sec="6.2"]`) ?? $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="6.2"] table:last-of-type`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A control from another list: “Asset register review”, done once a year in the CMDB. Each review leaves a new version of the register, so its evidence is the register's version history, not the policy that asks for the review.",
      getEl: () => $(`${POL016_WINDOW} [data-sec="6.2"]`) ?? $(POL016_WINDOW),
    },
    firstItem("The first control yourself", "C11 is security awareness training completion. What does the training system record each time someone completes it? Choose that evidence. Next unlocks once it is right.", "Evidence requested", 1, () => selIs("Evidence requested", 1, "Awareness training completion report"), "Choose C11's evidence"),
    checkAnswers("Do the other five. Once every request has its evidence, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.1-2": [
    {
      title: "Where each population lives",
      icon: "table",
      body: "An auditor samples from a population: every occurrence of the control in the system it runs in. Copy each control's system from the dataset; the platform writes the population and the audit period beside it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Audit Requests (PBC)", "Dataset PBC-6 is tagged with this step. It opens beside your list.", PBC_WINDOW),
    {
      title: "The dataset",
      icon: "table",
      body: "Each row of PBC-6 is one control of the audit: its description, system, frequency and office.",
      getEl: () => $(`${PBC_WINDOW} table`) ?? $(PBC_WINDOW),
    },
    firstItem("The first control yourself", "Find C11 in the dataset and type its System as written there. Next unlocks once it is right.", "System", 1, () => cellIn(oblCell("System", 1)), "Type C11's system", PBC_WINDOW),
    {
      title: "Then the rest",
      icon: "edit",
      body: "Do the other five. A value that is not the dataset's is flagged at once, with where to read it.",
      getEl: () => $('[data-guide="register"]'),
    },
    finish("This button unlocks once every system is in."),
  ],

  "T5.1-3": [
    {
      title: "How many to test",
      icon: "table",
      body: "An auditor tests a sample, not every occurrence: too few and the test proves nothing. Rule R15 sets the minimum for each control from how often it runs.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Audit Requests (PBC)", "Dataset PBC-6 gives each control's frequency. It opens beside your list.", PBC_WINDOW),
    ...openPage(3, "Ref-Sampling"),
    {
      title: "The sampling table",
      icon: "table",
      body: "One row per frequency, with its minimum sample. Find the row that matches each control's frequency in the dataset.",
      getEl: () => $(PAGE_WINDOW("Ref-Sampling")),
    },
    firstItem("The first control yourself", "Read C11's frequency in the dataset, find that frequency in Ref-Sampling and choose its minimum sample. Next unlocks once it is right.", "Sample (R15)", 1, () => selIs("Sample (R15)", 1, "1"), "Choose C11's sample", PAGE_WINDOW("Ref-Sampling")),
    checkAnswers("Do the other five. Once every request has a sample, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.1-4": [
    {
      title: "Who gets each request",
      icon: "table",
      body: "A request sent to the wrong person comes back late, or not at all. BKB-POL-016 Section 6.2 says who gets it: the role Responsible (R) for the control's process in the GRC Charter's RACI. Each row shortlists three roles.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(4, "Charter", "The BKB Group GRC Charter", CHARTER_WINDOW),
    {
      title: "The RACI",
      icon: "book",
      body: "Section 16 has a row per process and a column per role; the legend under the table gives each column's full role. Section 7.1 says what each role does, if a process name does not tell you where a control belongs. The bar at the top of the window jumps to each.",
      // The whole window: Section 16's table and legend run taller than the window.
      getEl: () => $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="16"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The first control yourself", "C11 is training completion: find its process in Section 16, then the role marked R in that row. Choose that role from C11's three. Next unlocks once it is right.", "Owner", 1, () => selIs("Owner", 1, "Security Awareness & Training Specialist"), "Choose C11's owner", CHARTER_WINDOW),
    checkAnswers("Do the other five. Once every request has an owner, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T5.1-5": [
    {
      title: "Now the request timeline",
      icon: "table",
      body: "Your answer is in. Part 2: the dates of your own list. Rule R16 works in two steps from the end of the audit period: when fieldwork starts, then when the requests are due. The due date then goes on every request.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R16 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R16",
      icon: "book",
      body: "First, how long after the period's end fieldwork starts; then how far before fieldwork the requests are due.",
      getEl: () => rowIn(RULES_WINDOW, "R16") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R16")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first line yourself", "When does your audit period end? The note above the table gives the period. Type its end date. Next unlocks once it is right.", "Date", 1, () => valIs("Date", 1, "2026-09-04"), "Type the period's end"),
    checkAnswers("Work out the other two lines by R16. Check my answers then shows each date and how R16 gives it. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T5.1-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "PBC-LIST is the index T5.2 fills with evidence and T12.2 answers the auditor from, so every cell counts. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the list counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6"),
  ],

  "T5.1-8": [
    {
      title: "Stage 1 and Stage 2",
      icon: "table",
      body: "At work, management must know how certification works before they buy it. LI-CERT is that briefing; its first table says what each stage of the certification audit does.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(8, "Ref-Certification card"),
    {
      title: "The two stages",
      icon: "table",
      body: "Each stage's row says what the auditor does (before the colon), where, and what the stage produces (after Output).",
      getEl: () => rowIn(CARD_WINDOW, "Stage 1") ?? $(CARD_WINDOW),
    },
    firstItem("The first line yourself", "Stage 1, what the auditor does: the words before the colon in the card's Stage 1 row. Choose them. Next unlocks once it is right.", "From the card", 1, () => selIs("From the card", 1, "Reviews documented information and readiness"), "Choose Stage 1's line", CARD_WINDOW),
    checkAnswers("Do the other five lines. Once each has a value, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.1-9": [
    {
      title: "Which stage does what",
      icon: "table",
      body: "At work, a team prepares differently for each stage: documents for one, people and records for the other. Decide which stage each audit activity belongs to.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-Certification card"),
    firstItem("The first activity yourself", "Checking evidence that controls operated over the whole period: which stage's row of the card says that? Choose it. Next unlocks once it is right.", "Stage (L11)", 1, () => selIs("Stage (L11)", 1, "Stage 2"), "Choose its stage", CARD_WINDOW),
    checkAnswers("Do the other seven. Once each has a stage, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T5.1-10": cardQuestion(10, "a question about the 3-year certification cycle.", {
    title: "The cycle",
    icon: "table",
    body: "The card's 3-year cycle row names the audits in order, from the initial certification.",
    getEl: () => rowIn(CARD_WINDOW, "3-year cycle") ?? $(CARD_WINDOW),
    onEnter: () => rowIn(CARD_WINDOW, "3-year cycle")?.scrollIntoView({ block: "center" }),
  }),

  "T5.1-11": cardQuestion(11, "a question about choosing a certification body.", {
    title: "The criteria",
    icon: "table",
    body: "The card lists the certification-body criteria, numbered 1 to 5.",
    getEl: () => rowIn(CARD_WINDOW, "Certification-body criterion 1") ?? $(CARD_WINDOW),
    onEnter: () => rowIn(CARD_WINDOW, "Certification-body criterion 1")?.scrollIntoView({ block: "center" }),
  }),

  "T5.1-12": [
    {
      title: "Brief the control owners",
      icon: "table",
      body: "At work, a control owner facing an auditor for the first time needs a short list of what to do and what never to do. Sort each behaviour as the card does.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(12, "Ref-Certification card"),
    {
      title: "Do, and do not",
      icon: "table",
      body: "The card's last two rows list what an auditee does, and does not do.",
      getEl: () => rowIn(CARD_WINDOW, "Auditee: do") ?? $(CARD_WINDOW),
      onEnter: () => rowIn(CARD_WINDOW, "Auditee: do")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first behaviour yourself", "Answer only what is asked: which of the two rows lists it? Choose Do or Do not. Next unlocks once it is right.", "Do or do not", 1, () => selIs("Do or do not", 1, "Do"), "Choose for the first behaviour", CARD_WINDOW),
    checkAnswers("Do the other nine. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.1-13": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-CERT is one briefing: the two stages, the activities of each, the 3-year cycle, the criteria for choosing a certification body and the auditee briefing. It goes with PBC-LIST, and prepares the week-12 audit. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each part counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "8 to 12"),
  ],

  // T5.2 (desk-step-builder, 29 Oct 2026): EVP-GAP in Evidence › Link to Control (steps 1, 4, 5), EVP-IDX in Evidence ›
  // Evidence Library (steps 2, 3), both handed in at step 6.
  "T5.2-1": [
    {
      title: "Count what arrived",
      icon: "table",
      body: "At work, before checking any evidence, you first count what each control owner sent against the PBC list, so an owner who sent nothing is chased at once. EVP-GAP has one row for each request of your PBC list.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "Dataset EVP-REPO is tagged with this step. It opens beside EVP-GAP.", LIB_WINDOW),
    {
      title: "Sorted by control",
      icon: "table",
      body: "Each row is one file the owners sent. The files are listed by their Control, so each control's files sit together: three rows with C99 would mean its owner sent 3 files.",
      getEl: () => $(`${LIB_WINDOW} table`) ?? $(LIB_WINDOW),
    },
    firstItem("The first control yourself", "C11 is the first row of EVP-GAP. Count the files with Control C11 and type the number. Next unlocks once it is right.", "Files received", 1, () => valIs("Files received", 1, "7"), "Type C11's count", LIB_WINDOW),
    checkAnswers("Count the other five. Once every row has a number, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.2-2": [
    {
      title: "Every file, checked",
      icon: "table",
      body: "At work, an auditor rejects any file that is undated, unattributable, incomplete, altered, out of scope or unsafe, and you must say why. Each of the 42 files gets Accept or Reject here, with the code of every check that fails.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The checklist, beside the table",
      icon: "help",
      body: "Rule R09: read D1 to D10 in order. Each check shows the cell of the lit file it reads. Mark every check that fails, then record Reject. If none fails, record Accept.",
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates and the period",
      icon: "book",
      body: "D3 and D4 compare the file with the audit period, given in the note above the checks. A file dated 2024-12-01, for example, would fail D4.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="D4"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Check the first file",
      icon: "edit",
      body: "The first file is lit in the table. Read its ten checks in order and record your decision. Next unlocks once it is right.",
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the file's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => evqWalk("E-015")?.innerText.trim() === "Accept",
      doIt: "Check the first file",
    },
    {
      title: "Then the other 41",
      icon: "check",
      body: "The checklist moves on to the next file by itself. To look at a file again, click its Accept/Reject in the table.",
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 42 files are decided, Check my answers shows each file's answer and why. Your rows lock then, so look them over first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.2-3": [
    {
      title: "Index the accepted files",
      icon: "table",
      body: "At work, every accepted file is indexed to the one request it answers, so the auditor goes from a request to its evidence in one step. Only the files accepted in step 2 are listed.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Audit Requests (PBC)", "Dataset PBC-6 is tagged with this step: each control with its request in PBC-LIST. It opens beside the index.", PBC_WINDOW),
    {
      title: "Requests by control",
      icon: "table",
      body: "The last column gives each control's request in your PBC list. Every accepted file covers the whole audit period, so its control decides its request.",
      getEl: () => $(`${PBC_WINDOW} table`) ?? $(PBC_WINDOW),
    },
    firstItem("The first file yourself", "The first file is evidence for C07. Find C07's request in the dataset and choose it. Next unlocks once it is right.", "PBC req.", 1, () => selIs("PBC req.", 1, "PBC-02"), "Choose its request", PBC_WINDOW),
    checkAnswers("Do the other files. Once each has a request, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.2-4": [
    {
      title: "Find the gaps",
      icon: "table",
      body: "An auditor needs enough accepted evidence for every control: a control without it is reported as “no evidence”. Rule R18, in the note beside the table, decides it per control.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The files of each control",
      icon: "info",
      body: "Each row lists its control's files with the decision step 2 checked: count the ones marked Accept.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first control yourself", "Count C11's accepted files and apply R18: choose Gap or No gap. Next unlocks once it is right.", "Gap (R18)", 1, () => selIs("Gap (R18)", 1, "No gap"), "Choose for C11"),
    checkAnswers("Do the other five. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T5.2-5": [
    {
      title: "Write the follow-up",
      icon: "table",
      body: "A gap left open is “no evidence” at the audit. At work, its owner gets a follow-up at once, saying exactly what to send, for which period and by when. Rule R18 gives the sentence.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-016", "The Compliance and Regulatory Management Policy", POL016_WINDOW),
    {
      title: "When it is due",
      icon: "book",
      body: "Section 6.2's paragraph under the request table says by when the missing files are due. The bar at the top of the window jumps to Section 6.2.",
      getEl: () => $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    ...openLearn("Rule tables", "Rule R16, when fieldwork starts, is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R16",
      icon: "book",
      body: "How long after the audit period's end fieldwork starts. Count from there to the due date.",
      getEl: () => rowIn(RULES_WINDOW, "R16") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R16")?.scrollIntoView({ block: "center" }),
    },
    firstItem("Your follow-up", "Write R18's sentence for the control with a gap: its control, the audit period and the due date. Type dates as 2026-01-31 or 31 January 2026. Next unlocks once it is right.", "Follow-up request (R18)", 2, () => valIs("Follow-up request (R18)", 2, "Please send 2 more files for C07 covering 2025-09-05 to 2026-09-04 by 2026-10-02."), "Write the sentence"),
    checkAnswers("Check my answers then shows the sentence R18 gives and why. Your row locks then, so read it over first."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T5.2-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "EVP-IDX is the evidence index T12.2 answers the certification body from; EVP-GAP goes to the owners, and its gaps become actions in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each file counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: EVP-IDX ends .xlsx (a spreadsheet), EVP-GAP .docx (a memo)." } : c)),
  ],

  // T6.1 (desk-step-builder, 29 Oct 2026): UAR-TEST's three sheets and UAR-MEMO in Access Reviews › Generate Sample. Step 6
  // is a plain question answered in its row: no guide.
  "T6.1-1": [
    {
      title: "The test plan",
      icon: "table",
      body: "At work, before testing a control, an auditor reads its fixed test plan: what each attribute checks and which columns show it. Sheet 1 is that plan, A1 to A6. You do not change it: every account in steps 3 and 4 is tested against it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "An account with no approval ticket: A1 passes only when the account has one, so that account fails A1. Each question here is a case like that.",
      getEl: () => rowIn('[data-guide="register"]', "A1") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: an account's review decision is blank. Read the Passes when column and click the attribute that fails. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      // At the column the answer is clicked in, never at its cell.
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="blank"]'),
      doIt: "Click the attribute a blank decision fails",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T6.1-2": [
    {
      title: "How many accounts to test",
      icon: "table",
      body: "At work, an auditor tests a sample of the review's decisions, not all of them, and must show the sample is big enough for the population. Rule R15, in the note, sets the minimum.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Start Review", "The review's facts are tagged with this step. They open beside your sheet.", START_WINDOW),
    {
      title: "The review",
      icon: "book",
      body: "The form gives the system, how often it is reviewed, and how many accounts the review covered.",
      getEl: () => $(START_WINDOW),
    },
    firstItem("The first line yourself", "Type the number of accounts the review covered, as the form gives it. Next unlocks once it is right.", "Value", 1, () => valIs("Value", 1, "216"), "Type the population", START_WINDOW),
    ...openPage(2, "Ref-Sampling"),
    {
      title: "The sampling table",
      icon: "table",
      body: "The rows by frequency are for a control tested occurrence by occurrence; the last two are for a population of records. A review of 300 accounts, for example, is a population of records of 250 or more: a minimum sample of 40.",
      getEl: () => $(PAGE_WINDOW("Ref-Sampling")),
    },
    checkAnswers("Choose your row and its minimum sample. Check my answers then shows each line's answer and why, and the platform draws the sample. Your lines lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T6.1-3": [
    {
      title: "Test each sampled account",
      icon: "table",
      body: "At work, an auditor re-performs the review on a sample: for each account, did the review get it right? Sheet 2 lists the 25 accounts the platform drew. Each is tested against A1 to A6.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The test plan, beside the table",
      icon: "help",
      body: "Read A1 to A6 in order: each shows the cells of the lit account it reads. Mark every attribute that fails, then record Fail. If none fails, record Pass.",
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates",
      icon: "book",
      body: "A2 and A5 count from the review date, given in the note above the checks. An account last used 120 days before the review, and kept by the reviewer, would fail A2.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="A2"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Check the first account",
      icon: "edit",
      body: "The first account is lit in the table. Read its six attributes in order and record your result. Next unlocks once it is right.",
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the account's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => {
        const [r, c] = uarResult("U-0007");
        return r === "Fail" && c === "A6";
      },
      doIt: "Check the first account",
    },
    {
      title: "Then the other 24",
      icon: "check",
      body: "The checklist moves on to the next account by itself. To look at one again, click its Result in the table.",
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 25 are recorded, Check my answers shows each account's answer and why. Your rows lock then, so look them over first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T6.1-4": [
    {
      title: "Leads, not yet exceptions",
      icon: "table",
      body: "At work, analytics run on every account, not only the sample, and list anything that looks wrong. An auditor confirms each lead before reporting it: a false exception sends the owner chasing nothing. The task allows at most 10 % false positives.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(4, "Ref-UAR test plan"),
    {
      title: "The test plan",
      icon: "table",
      body: "The same A1 to A6 as Sheet 1. A lead is an exception only if it fails one of them. A privileged account with no approval ticket, for example, fails A1: an exception.",
      getEl: () => $(UARPLAN_WINDOW),
    },
    firstItem("The first lead yourself", "U-0007 is listed for a role change date in the HR roster. Read its cells against the test plan and choose. Next unlocks once it is right.", "Exception?", 1, () => selIs("Exception?", 1, "Exception"), "Decide U-0007", UARPLAN_WINDOW),
    checkAnswers("Decide the other eight. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T6.1-5": [
    {
      title: "Name each exception",
      icon: "table",
      body: "At work, every exception is reported with its type: the type sets its severity, the action and who owns it. Only the accounts step 4 confirmed are listed.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(5, "Ref-UAR codes"),
    {
      title: "The ten types",
      icon: "table",
      body: "Each code names one kind of exception and its severity. Some look alike: read each one to the end.",
      getEl: () => $(UCODES_WINDOW),
    },
    firstItem("The first exception yourself", "U-0007's HR roster shows a role change date. Which type is that? Choose it. Next unlocks once it is right.", "Type (U1–U10)", 1, () => selIs("Type (U1–U10)", 1, "U9"), "Choose U-0007's type", UCODES_WINDOW),
    ...openScreen("access", "Access Reviews", "Start Review", "The review's facts are tagged with this step: they say which break-glass accounts are registered.", START_WINDOW),
    {
      title: "Break-glass accounts",
      icon: "book",
      body: "The form lists the break-glass accounts registered for this system. Read it before you type a generic account.",
      getEl: () => $(START_WINDOW),
    },
    checkAnswers("Type the other exceptions. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T6.1-7": [
    {
      title: "Conclude the test",
      icon: "table",
      body: "At work, a control test ends in one of three conclusions, and the control owner, the auditor and management act on it. Rule R19, in the note, decides it from the exceptions: how many, and how severe.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The first line yourself", "Count the exceptions the note lists, as steps 4 and 5 checked them, and type the number. Next unlocks once it is right.", "Your answer", 1, () => valIs("Your answer", 1, "6"), "Type the count"),
    checkAnswers("Then the highest severity, their share of the 216 accounts, and R19's conclusion. Check my answers then shows each line's answer and why. Your lines lock then, so check them first."),
    finish("This button unlocks once your answers are checked. UAR-MEMO's conclusion is then written from them."),
  ],

  "T6.1-8": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "UAR-TEST is the workpaper an auditor re-reads; its exceptions become actions in T12.1, and the same test is the final exam's practical station. UAR-MEMO states the conclusion. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: UAR-TEST ends .xlsx (a workbook), UAR-MEMO .docx (a memo)." } : c)),
  ],
  // T6.2 (desk-step-builder, 29 Oct 2026): LVR-REC's two sheets and LVR-KPI, worked in Access Reviews › Terminated User
  // Check, whose screen shows T6.2 its own disable logs. Step 5 is a question in its row, answered from BKB-POL-006
  // Section 6.3: its guide opens the procedure.
  "T6.2-1": [
    {
      title: "Put the logs in UTC",
      icon: "table",
      body: "At work, before comparing HR's termination times with system logs, an analyst puts every time in one zone, UTC: a time read in the wrong zone makes an account look late, or on time, when it is not. Sheet 1 has one row per system log.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Terminated User Check", "The five systems' disable logs are tagged with this step. They open beside your sheet.", TUC_WINDOW),
    {
      title: "Read how each log writes the time",
      icon: "book",
      body: "Every time ends with its zone. An example: a log ending its times in EDT, New York summer time, four hours behind UTC, would need 4 hours added to reach UTC.",
      getEl: () => $(TUC_WINDOW),
    },
    firstItem("The VPN log yourself", "VPN / ZTNA: read how its log writes the time, and what the step's note says CEST is, then choose what turns it into UTC. Next unlocks once it is right.", "Time in the log → UTC", 3, () => selIs("Time in the log → UTC", 3, "Subtract 2 hours"), "Choose VPN / ZTNA's conversion", TUC_WINDOW),
    checkAnswers("Choose the other four. Check my answers then shows each row's answer and why, and the platform converts the times. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T6.2-2": [
    {
      title: "Match the leavers",
      icon: "table",
      body: "At work, the weekly reconciliation matches HR's leavers to every system's log by Employee ID. A leaver missing from a log was never disabled there: the account is still active, and non-SSO systems are where leavers hide.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Terminated User Check", "The five systems' disable logs are tagged with this step. They open beside your sheet.", TUC_WINDOW),
    {
      title: "One log at a time",
      icon: "book",
      body: "Each system's lines are together, sorted by Employee ID. Read down one system's IDs: a number skipped, say E0007 between E0006 and E0008, is a leaver with no line in that log.",
      getEl: () => $(TUC_WINDOW),
    },
    firstItem("The first log yourself", "SSO / IdP: type the Employee IDs its log has no line for, separated by ;, or none if every leaver has one. Next unlocks once it is right.", "Leavers with no disable line", 1, () => valIs("Leavers with no disable line", 1, "none"), "Type SSO / IdP's missing leavers", TUC_WINDOW),
    checkAnswers("Do the other four logs. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T6.2-3": [
    {
      title: "Each leaver's SLA",
      icon: "table",
      body: "At work, a disable is measured against the SLA for how the person left: when someone is dismissed, their access must go faster than when they resign. Rule R21 sets each.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R21 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R21",
      icon: "book",
      body: "The SLA for each leaver type, and the KPI you work out in step 6.",
      getEl: () => rowIn(RULES_WINDOW, "R21") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R21")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first leaver yourself", "E0001: read its leaver type and choose its SLA. Next unlocks once it is right.", "SLA (R21)", 1, () => selIs("SLA (R21)", 1, "4 hours"), "Choose E0001's SLA", RULES_WINDOW),
    checkAnswers("Choose the other 28. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T6.2-4": [
    {
      title: "Disabled in time?",
      icon: "table",
      body: "At work, every account a leaver held is measured against the SLA: a late disable is a breach the KPI counts, even if the account is closed now. The checklist beside the table shows the leaver in hand: each system's disable time in UTC and how long after termination it came.",
      getEl: () => $('[data-guide="checklist"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A voluntary leaver, SLA 4 hours: an account disabled 5 h 10 min after termination is late; one disabled after 3 h 50 min is in time. A system shown Still active was found in step 2, not late.",
      getEl: () => $('[data-guide="checklist-row"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Check the first leaver",
      icon: "edit",
      body: "E0001 is lit in the table. Read each system against its SLA, mark every one disabled late, and record. Next unlocks once it is right.",
      // The whole checklist, so "Check E0001 again" under it stays in reach after a wrong record.
      getEl: () => $('[data-guide="checklist"]'),
      // At the leaver's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => {
        const [r, c] = lvrResult("E0001");
        return r === "Late" && c === "SSO / IdP; Atlassian Jira + Confluence Cloud Enterprise";
      },
      doIt: "Check E0001",
    },
    {
      title: "Then the other 28",
      icon: "check",
      body: "The checklist moves on to the next leaver by itself. To look at one again, click its Timeliness in the table.",
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 29 are recorded, Check my answers shows each leaver's answer and why. Your rows lock then, so look them over first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T6.2-5": [
    {
      title: "A question first",
      icon: "help",
      body: "This step is a question: what is done about a leaver's account used after termination. Read the situation in the box, then the three options.",
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    ...openLib(5, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The leaver procedure",
      icon: "book",
      body: "Section 6.3 is the leaver procedure: each step, who does it and what it produces. The bar at the top of the window jumps to it.",
      getEl: () => $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-5 [data-guide="decision"]'),
      pointAt: () => $('#act-5 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-5 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the feedback read, mark the step complete. LVR-REC Sheet 2 then records rule R20's action for each account still active.",
      getEl: () => $('#act-5 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how.",
      getEl: () => $('#act-5 [data-guide="show-me-how"]'),
    },
  ],

  "T6.2-6": [
    {
      title: "The leaver KPI",
      icon: "table",
      body: "At work, this KPI is what management watches: the share of leavers whose every account was disabled within the SLA. It feeds the ISMS objectives (T7.2). Rule R21's formula is in the note; LVR-REC Sheet 2, below LVR-KPI, has each leaver's result.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The numerator yourself", "Count the leavers marked Yes in Sheet 2's Fully disabled within SLA column and type the number. Next unlocks once it is right.", "Your answer", 1, () => valIs("Your answer", 1, "18"), "Type the numerator"),
    ...openLib(6, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The target",
      icon: "book",
      body: "Section 10 lists the policy's KPIs and their targets. The bar at the top of the window jumps to it.",
      getEl: () => $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="10"]`)?.scrollIntoView({ block: "start" }),
    },
    checkAnswers("Then the denominator, the KPI and the target line. Check my answers then shows each line's answer and why. Your lines lock then, so check them first."),
    finish("This button unlocks once your answers are checked and LVR-REC is submitted. The file box appears under your checked answers, with the four parts of the file's name; LVR-KPI is a platform form, handed in with it."),
  ],

  // T7.1 (desk-step-builder, 29 Oct 2026): RR-UPD and its working sheets in Risk Register › Score Risk; RRU-EVENTS on Risk
  // Register › New Risk, the office register on Score Risk (both T7.1's own screens). Steps 7 and 8 ask their question in the
  // row (guides "7q", "8q": R07 in Rule tables, BKB-ERM-001 Section 4), then work part 2 in the modal. Step 13's question needs
  // no guide; its part 2 does.
  "T7.1-1": [
    {
      title: "Read the new events",
      icon: "table",
      body: "At work, an analyst reads each incoming event before logging it: what it is, what it would harm, how often it happens and what already protects against it. RRU-EVENTS has five: three new risks, N1 to N3, and two changes to rows already in the register, C1 and C2.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Take a made-up event: “Laptops are lost about once a year.” Its likelihood is read from that fact: BKB-ERM-001 Section 6.2 calls “about once a year” Likely. Each question here asks where a part like that sits in RRU-EVENTS.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: which asset N1 affects. Read N1's row across and click the cell. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      // At the table's first column, never at the answer's cell.
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="asset"]'),
      doIt: "Click the asset N1 affects",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint. The wide sheet scrolls sideways.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T7.1-2": [
    {
      title: "One statement per new risk",
      icon: "table",
      body: "At work, every risk is written in one frame, cause, event, consequence, asset, so risks can be compared and nobody reads a cause as the risk. Rule R06 is in the note. Each new event has three drafts; one fills the frame right.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "New Risk", "RRU-EVENTS is tagged with this step. It opens beside your sheet.", NEWRISK_WINDOW),
    {
      title: "The facts",
      icon: "book",
      body: "Each new event's Facts name its cause, what may happen and the consequence; Asset names the asset. A draft that puts a fact in the wrong place, or ends with something that is not the asset, does not follow R06.",
      getEl: () => $(NEWRISK_WINDOW),
    },
    firstItem("N1 yourself", "Read N1's three drafts, under its row, against its facts, and choose the one that follows R06. Next unlocks once it is right.", "Best draft (R06)", 1, () => selIs("Best draft (R06)", 1, "Draft 2"), "Choose N1's best draft", NEWRISK_WINDOW),
    checkAnswers("Then N2 and N3. Check my answers then shows each row's answer and why, and RR-UPD records the statements. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-3": [
    {
      title: "Rate each new risk",
      icon: "table",
      body: "At work, ratings are only comparable when every analyst reads the same scale the same way. Rule R07, in the note, takes the descriptor whose words the fact uses. Each new risk has three lines: inherent likelihood, inherent impact, residual likelihood.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(3, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "The scales",
      icon: "book",
      body: "Section 6.2 gives the likelihood descriptors, Section 6.3 the impact ones. The bar at the top of the window jumps to each.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A fact saying “once in 5–20 years” uses the words of Section 6.2's Unlikely: score 2. On a residual line, start from your inherent likelihood and count the controls marked working.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first line yourself", "N1 · Likelihood (inherent): read its fact and find the descriptor of Section 6.2 with the same words. Next unlocks once it is right.", "Score (R07)", 1, () => selIs("Score (R07)", 1, "4"), "Score N1's likelihood", ERM_WINDOW),
    checkAnswers("Then the other eight lines. Check my answers then shows each line's answer and why, and RR-UPD works out the scores and ratings. Your lines lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-4": [
    {
      title: "Who may accept each risk",
      icon: "table",
      body: "At work, a risk is accepted only by someone with the authority to: the Charter's delegation table, Section 6.1, which rule R36 copies. The register's own rows show authorities too, but R36 is used even where they differ.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R36 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R36",
      icon: "book",
      body: "One authority for each residual rating. Your three rows show their residual rating beside the choice.",
      getEl: () => rowIn(RULES_WINDOW, "R36") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R36")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: read its residual rating and choose the authority R36 gives. Next unlocks once it is right.", "Acceptance authority (R36)", 26, () => selIs("Acceptance authority (R36)", 26, "Org CRCO"), "Choose R-16-HQ-26's authority", RULES_WINDOW),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-5": [
    {
      title: "Controls for each new risk",
      icon: "table",
      body: "At work, every risk is linked to the controls that treat it, so the Statement of Applicability and the control tests can be traced back to it. Ref-Keywords maps key words to a BKB policy and its Annex A controls.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(5, "Ref-Keywords"),
    {
      title: "Key words",
      icon: "book",
      body: "Find the row whose key words the risk's category uses. An example: a category “Cyber — misuse of access” uses “access”, so its row's controls are A.5.15–A.5.18, A.8.5.",
      getEl: () => $(PAGE_WINDOW("Ref-Keywords")),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: read its category and choose the controls of the Ref-Keywords row it matches. Next unlocks once it is right.", "ISO/IEC 27001:2022 controls", 26, () => selIs("ISO/IEC 27001:2022 controls", 26, "A.8.15, A.8.16, A.8.32"), "Choose R-16-HQ-26's controls", PAGE_WINDOW("Ref-Keywords")),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-6": [
    {
      title: "Decide each new risk",
      icon: "table",
      body: "At work, a risk above appetite needs a treatment with a due date; one within it is accepted and monitored. Rule R08, in the note, gives the appetite and BKB-ERM-001 Section 7 the days for each rating.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A residual score of 10 is within the appetite: Accept and monitor. A residual of 14 is above it: Treat, with the days Section 7 gives a High risk.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: read its residual score and rating and choose its decision. Next unlocks once it is right.", "Decision and due (R08)", 26, () => selIs("Decision and due (R08)", 26, "Accept and monitor"), "Choose R-16-HQ-26's decision"),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.1-7q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, which field of a risk a new control changes. Read the situation in the box, then the three options.",
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R07 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R07",
      icon: "book",
      body: "R07 says how each part of a rating is set, and what an existing control does to it.",
      getEl: () => rowIn(RULES_WINDOW, "R07") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R07")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-7 [data-guide="decision"]'),
      pointAt: () => $('#act-7 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-7 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2, the change log, opens from the Open button below the question.",
      getEl: () => $('#act-7 [data-guide="show-me-how"]'),
    },
  ],

  "T7.1-7": [
    {
      title: "Now apply C1 and C2",
      icon: "table",
      body: "Your answer is in. Part 2: the two change events. At work, every change to a register row is logged field by field, with old and new value and its evidence (rule R22), so a reviewer sees what moved and why.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The office register is tagged with this step. It opens beside the change log.", SCORE_WINDOW),
    {
      title: "The rows they change",
      icon: "book",
      body: "Find R-16-HQ-21 and R-16-HQ-12 in the register: their residual scores, ratings and authorities as they stand.",
      getEl: () => $(SCORE_WINDOW),
    },
    firstItem("C1 yourself", "Read what C1 says, then choose the change it makes to R-16-HQ-21. Next unlocks once it is right.", "Change (R22)", 1, () => selIs("Change (R22)", 1, "Likelihood (residual): 1 → 2"), "Choose C1's change", SCORE_WINDOW),
    checkAnswers("Then C2. Check my answers then shows each change's answer and why, and the platform writes its fields and the rows that follow from it. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.1-8q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, which risks the note lists as above appetite. Read the situation in the box, then the three options.",
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    ...openLib(8, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "Appetite",
      icon: "book",
      body: "Section 4 sets the appetite for each criticality band. Read what kind of score it is the maximum of. The bar at the top of the window jumps to it.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="4"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-8 [data-guide="decision"]'),
      pointAt: () => $('#act-8 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-8 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2, RR-NOTE, opens from the Open button below the question.",
      getEl: () => $('#act-8 [data-guide="show-me-how"]'),
    },
  ],

  "T7.1-8": [
    {
      title: "Now complete RR-NOTE",
      icon: "table",
      body: "Your answer is in. Part 2: the note to the Regional Managing Director. The new and changed risks are listed for you. List the risks above appetite, and flag the rows whose acceptance authority is not the one rule R36 gives: their owners correct them, not this update.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The office register is tagged with this step. It opens beside the note.", SCORE_WINDOW),
    {
      title: "Read down the register",
      icon: "book",
      body: "Residual score, rating and acceptance authority are side by side. Your own three rows, and R-16-HQ-21 after C1, are in the note above the sheet.",
      getEl: () => $(SCORE_WINDOW),
    },
    firstItem("The first list yourself", "Risks above appetite: type the Risk IDs of the register and of your own rows, separated by ;. Next unlocks once it is right.", "Content", 3, () => valIs("Content", 3, "R-16-HQ-02; R-16-HQ-27; R-16-HQ-28"), "Type the risks above appetite", SCORE_WINDOW),
    checkAnswers("Then the rows to correct. Check my answers then shows each list's answer and why, and the note writes the decisions needed. Your lists lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-9": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "RR-UPD is the office register with your three new rows and its change log; RR-NOTE goes to the Regional Managing Director. T7.2's Top-5 table and the acceptance request are built from them. This step checks them, names RR-UPD and submits both.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 8").map((c) => (c.title === "Name the file" ? { ...c, body: "Type the four parts listed under the box, in order, joined by underscores, then .xlsx. RR-NOTE is a platform form, handed in with it." } : c)),
  ],

  "T7.1-10": [
    {
      title: "Asset, threat, control",
      icon: "table",
      body: "At work (ISO/IEC 27005), a risk is traced through an asset: the threat to it, the weakness it exploits, the harm and the control. Each new risk has its asset here, from the asset register.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-Chain"),
    {
      title: "Asset types",
      icon: "book",
      body: "Each row is an asset type, information or supporting. Match each asset by what the asset register says it is. An example: an HR file of staff records is a “Personal-data set”, information.",
      getEl: () => $(PAGE_WINDOW("Ref-Chain")),
    },
    firstItem("The first asset yourself", "SIEM & log analytics platform: read its line and choose its asset type. Next unlocks once it is right.", "Asset type (Ref-Chain)", 1, () => selIs("Asset type (Ref-Chain)", 1, "Log / SIEM platform"), "Choose the SIEM's asset type", PAGE_WINDOW("Ref-Chain")),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why, and the platform copies each type's threat, vulnerability and impact. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-11": [
    {
      title: "A treatment option per risk",
      icon: "table",
      body: "At work, ISO/IEC 27001 clause 6.1.3 asks for a treatment option for every risk: modify it, retain it, avoid it or share it. Rule L12, in the note, sets it from the residual score shown beside each risk.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule L12 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule L12",
      icon: "book",
      body: "One option for a residual score above 11, another for 11 or less.",
      getEl: () => rowIn(RULES_WINDOW, "L12") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "L12")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first risk yourself", "SIEM & log analytics platform's risk: read its residual score and choose L12's option. Next unlocks once it is right.", "Treatment option (L12)", 1, () => selIs("Treatment option (L12)", 1, "Retain"), "Choose the first option", RULES_WINDOW),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-12": [
    {
      title: "The control for each threat",
      icon: "table",
      body: "At work, each chain ends in the control that stops its threat. Ref-Chain lists one for each asset type, on the same row as the threat now shown beside each asset.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(12, "Ref-Chain"),
    firstItem("The first chain yourself", "SIEM & log analytics platform: find its type's row in Ref-Chain and type the control's ID. Next unlocks once it is right.", "Annex A control", 1, () => valIs("Annex A control", 1, "A.8.15 Logging"), "Type the first control", PAGE_WINDOW("Ref-Chain")),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.1-13": [
    {
      title: "Now tag each control (L05)",
      icon: "table",
      body: "Your answer is in. Part 2: ISO/IEC 27002 tags every control with attributes, so controls can be sorted by what they do. Rule L05, in the note, copies three of them from Ref-27002 attributes.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(13, "Ref-27002 attributes"),
    firstItem("The first control yourself", "A.8.15 Logging: find its row and choose its control type. Next unlocks once it is right.", "Control type", 1, () => selIs("Control type", 1, "Detective"), "Choose A.8.15's control type", PAGE_WINDOW("Ref-27002 attributes")),
    {
      title: "Then the rest",
      icon: "check",
      body: "Choose the other attributes of each control. A value that is not the page's is flagged at once, with where to read it.",
      getEl: () => $('[data-guide="register"]'),
    },
    finish("This button unlocks once every attribute is the page's."),
  ],

  "T7.1-14": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-CHAIN shows, for each new risk's asset, its threat, vulnerability, impact and control, tagged with its attributes. T7.2's acceptance request cites it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "10 to 13"),
  ],

  "T7.1-15": [
    {
      title: "Treat each risk",
      icon: "table",
      body: "At work, a treatment plan (ISO/IEC 27001 clause 6.1.3) says what is done about each risk. An action that does not reach the risk's cause leaves it as likely as before.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "New Risk", "RRU-EVENTS is tagged with this step. It opens beside the plan.", NEWRISK_WINDOW),
    firstItem("The first risk yourself", "R-16-HQ-26: read its option and its event's facts, and choose the action that carries out the option. Next unlocks once it is right.", "Action", 1, () => selIs("Action", 1, "Retain and monitor: record the decision, review the KRI quarterly and re-rate if it moves"), "Choose R-16-HQ-26's action", NEWRISK_WINDOW),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-16": [
    {
      title: "Link each action to a control",
      icon: "table",
      body: "At work, a plan names the Annex A control each action puts in place, so the Statement of Applicability and the control tests can find it. Each row offers the controls of its risk's category in Ref-Keywords.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: read its option and action, and choose the control the action puts in place. Next unlocks once it is right.", "Control (SoA ID)", 1, () => selIs("Control (SoA ID)", 1, "None: the risk is retained"), "Choose R-16-HQ-26's control"),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-17": [
    {
      title: "A due date per action",
      icon: "table",
      body: "At work, every action has an owner and a due date it is tracked against: in T12.1 they become rows of the action tracker. Rule R08, in the note, gives the days by residual rating; count them from the plan's date.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A plan dated 2026-01-10 with 30 days to go: 21 days take it to 31 January, 9 more to 2026-02-09.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: read its option and residual, and type its due date, or none. Next unlocks once it is right.", "Due (R08)", 1, () => valIs("Due (R08)", 1, "none"), "Type R-16-HQ-26's due date"),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-18": [
    {
      title: "The residual after treatment",
      icon: "table",
      body: "At work, the plan says what the risk will be once the action is done, so the owner knows what is left to accept. Rule R07, in the note, rates it again with the action's control working.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A risk at likelihood 3 and impact 5, residual 15, whose action's control starts working: likelihood 2, impact 5, expected residual 10.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: read its residual, option and control, and type the score expected after treatment. Next unlocks once it is right.", "Expected residual", 1, () => valIs("Expected residual", 1, "9"), "Type R-16-HQ-26's expected residual"),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-19": [
    {
      title: "Who accepts the residual",
      icon: "table",
      body: "At work, ISO/IEC 27001 clause 6.1.3 f: the risk owners approve the plan and accept the residual risk it leaves, within the authority the Charter gives them. Rule R36, in the note, names it by rating.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The first risk yourself", "R-16-HQ-26: rate its expected residual and choose who must accept it. Next unlocks once it is right.", "Residual accepted by (R36)", 1, () => selIs("Residual accepted by (R36)", 1, "Org CRCO"), "Choose who accepts R-16-HQ-26"),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why, and the plan goes to the owners: their approval is recorded. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.1-20": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-RTP is the risk treatment plan of ISO/IEC 27001 clause 6.1.3: option, action, control, owner, due date, expected residual and approval for each new risk. T12.1 tracks its actions. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "15 to 19"),
  ],
  "T7.2-1q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, how two risks with the same residual score are ranked. Read the situation in the box, then the three options.",
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R23 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R23",
      icon: "book",
      body: "R23's first sentence says how risks are ranked for the board, and what happens on equal scores.",
      getEl: () => rowIn(RULES_WINDOW, "R23") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R23")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-1 [data-guide="decision"]'),
      pointAt: () => $('#act-1 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-1 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2, the Top-5 ranking, opens from the Open button below the question.",
      getEl: () => $('#act-1 [data-guide="show-me-how"]'),
    },
  ],

  "T7.2-1": [
    {
      title: "Rank the Top-5",
      icon: "table",
      body: "Your answer is in. Part 2: at work, the board sees the five residual risks that most need its attention, ranked by one rule so anyone checking the table reaches the same order. Rule R23 is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The updated register is tagged with this step. It opens beside RSK-TOP5.", SCORE_WINDOW),
    {
      title: "The register",
      icon: "book",
      body: "28 risks, with your three from T7.1. Read down Residual score for the highest; on a tie, Inherent score; on both equal, the lower Risk ID.",
      getEl: () => $(SCORE_WINDOW),
    },
    firstItem("Rank 1 yourself", "Rank 1: the risk with the highest residual score. Choose its Risk ID. Next unlocks once it is right.", "Risk ID (R23)", 1, () => selIs("Risk ID (R23)", 1, "R-16-HQ-27"), "Choose rank 1's Risk ID", SCORE_WINDOW),
    checkAnswers("Then ranks 2 to 5. Check my answers then shows each rank's answer and why, and RSK-TOP5 copies each risk's row. Your ranks lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-2": [
    {
      title: "Which way each risk moved",
      icon: "table",
      body: "At work, a board reads a risk's trend as much as its score: is it getting better or worse since it last looked? Rule R23's arrows compare each risk's residual score now with the score at the last board report.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Heat Map with KRIs", "What moved since the last board report is tagged with this step. It opens beside RSK-TOP5.", HEAT_WINDOW),
    {
      title: "The change log",
      icon: "book",
      body: "One row for each changed field, with its old and new value. An example: a risk whose residual score went 6 → 8 and later 8 → 6 is where it was: no change.",
      getEl: () => $(HEAT_WINDOW),
    },
    firstItem("Rank 1 yourself", "Rank 1: find its Risk ID in the change log and compare its residual score then and now. Next unlocks once it is right.", "Trend (R23)", 1, () => selIs("Trend (R23)", 1, "↑"), "Choose rank 1's trend", HEAT_WINDOW),
    checkAnswers("Then the other four. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.2-3": [
    {
      title: "One line for the board",
      icon: "table",
      body: "Your answer is in. Part 2: each Top-5 risk gets its “so what” line, rule R23's frame completed from the risk's statement. Each statement is on its row; each row offers three lines.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Take “Because laptops are not encrypted, a lost laptop may expose files, leading to a fine.” Its cause is the missing encryption, its event the lost laptop, its consequence the fine.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("Rank 1 yourself", "Rank 1: read its statement and choose the line that completes R23's frame. Next unlocks once it is right.", "“So what” (R23)", 1, () => selIs("“So what” (R23)", 1, "If this happens, customers suffer large-scale harm from the exposure of their personal data."), "Choose rank 1's line"),
    checkAnswers("Then the other four. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.2-4q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, how long an acceptance may last. Read the situation in the box, then the three options.",
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R23 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R23",
      icon: "book",
      body: "R23's last sentences say how a risk acceptance is dated.",
      getEl: () => rowIn(RULES_WINDOW, "R23") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R23")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-4 [data-guide="decision"]'),
      pointAt: () => $('#act-4 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-4 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2, RSK-ACC, opens from the Open button below the question.",
      getEl: () => $('#act-4 [data-guide="show-me-how"]'),
    },
  ],

  "T7.2-4": [
    {
      title: "The acceptance request",
      icon: "table",
      body: "Your answer is in. Part 2: at work, a risk carried knowingly is accepted in writing, by someone with the authority to, until a date when it is decided again. Rules R23 and R36 are in the note; the request's date is on the form.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The updated register is tagged with this step. It opens beside RSK-ACC.", SCORE_WINDOW),
    {
      title: "The register",
      icon: "book",
      body: "Residual score, rating and acceptance authority are side by side. R36 decides the approver, even where the register shows another.",
      getEl: () => $(SCORE_WINDOW),
    },
    firstItem("The risk yourself", "Risk ID: the Medium risk with the highest residual score, by R23. Next unlocks once it is right.", "Value", 2, () => selIs("Value", 2, "R-16-HQ-19"), "Choose the risk for acceptance", SCORE_WINDOW),
    checkAnswers("Then the expiry, the re-assessment date and the approver. Check my answers then shows each field's answer and why, and the risk's existing controls are copied. The form locks then, so check it first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-5": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "RSK-TOP5 goes to the board in the semi-annual report; RSK-ACC to the approver. T12.1's management review reads both. This step checks them and submits both.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "1 to 4").slice(1).map((c) => (c.title === "Submit it" ? { ...c, body: "Both are platform forms, so there is no file to name. Submit hands them in; the receipt shows a hash (a fingerprint of the files) and a UTC time." } : c)),
  ],

  "T7.2-6": [
    {
      title: "Rate each clause",
      icon: "table",
      body: "At work, a gap analysis rates every clause of ISO/IEC 27001 against the evidence the organisation already has, so the plan works on what is missing. Rule L13 is in the note; each clause's row lists the deliverables that evidence it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step. They open beside the Gap sheet." } : c)),
    {
      title: "Your review records",
      icon: "book",
      body: "One line for each deliverable you have handed in, with its automated review. A deliverable not in the list has no record yet.",
      getEl: () => $(WAIT_WINDOW),
    },
    firstItem("Clause 4.1 yourself", "Clause 4.1: look up each of its deliverables in your records, and choose its status by L13. Next unlocks once it is right.", "Status (L13)", 1, () => selIs("Status (L13)", 1, "Conforms"), "Choose clause 4.1's status", WAIT_WINDOW),
    checkAnswers("Then the other 24. Check my answers then shows each clause's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.2-7": [
    {
      title: "The scales in the method card",
      icon: "table",
      body: "Your answer is in. Part 2: at work, a method card (ISO/IEC 27001 clause 6.1.2) names the scales every assessor uses, so two people rate the same risk the same way. Copy them from BKB-ERM-001.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "The scales",
      icon: "book",
      body: "Section 6.2 gives the likelihood scale, Section 6.3 the impact scale. The bar at the top of the window jumps to each.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The likelihood scale yourself", "Type the five likelihood names from score 1 up to score 5, separated by ;. A name not in the document is flagged at once. Next unlocks once it is right.", "What the card says", 1, () => cellIn(oblCell("What the card says", 1)), "Type the likelihood names", ERM_WINDOW),
    {
      title: "Then the impact scale",
      icon: "check",
      body: "The same for the impact scale. Once both are in, the step can be completed.",
      getEl: () => $('[data-guide="register"]'),
    },
    finish("This button unlocks once both scales are the document's."),
  ],

  "T7.2-8": [
    {
      title: "Appetite and due days",
      icon: "table",
      body: "At work, the method card states the criteria that decide what happens to a risk: the appetite it is compared with (clause 6.1.2 a) and how fast a risk above it must be treated.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(8, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "Section 4",
      icon: "book",
      body: "Section 4 gives each criticality band's appetite; GlobalConnect is LOW. Section 7 gives the due days. The bar at the top of the window jumps to each.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="4"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The appetite yourself", "Type the LOW band's appetite as Section 4 gives it: the number only. Next unlocks once it is right.", "What the card says", 6, () => cellIn(oblCell("What the card says", 6)), "Type the appetite", ERM_WINDOW),
    {
      title: "Then the due days",
      icon: "check",
      body: "Type each rating with its days from Section 7, for example “Critical 10; High 20; Medium 30” with the document's numbers.",
      getEl: () => $('[data-guide="register"]'),
    },
    finish("This button unlocks once both values are the document's."),
  ],

  "T7.2-9": [
    {
      title: "Who accepts what",
      icon: "table",
      body: "At work, the method card names who may accept each level of residual risk (clause 6.1.2 a), so an acceptance is never signed by the wrong person. Rule R36, in the note, is the Charter's delegation table.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R36 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R36",
      icon: "book",
      body: "One authority for each residual rating.",
      getEl: () => rowIn(RULES_WINDOW, "R36") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R36")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first rating yourself", "Low: choose who may accept a Low residual risk. Next unlocks once it is right.", "What the card says", 9, () => selIs("What the card says", 9, "Risk owner"), "Choose who accepts a Low risk", RULES_WINDOW),
    checkAnswers("Then the other three. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-10": [
    {
      title: "Where the results live",
      icon: "table",
      body: "At work, an auditor asks where the results of risk assessments are kept: clause 8.2 makes them documented information. The method card names the record.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-Clause map"),
    {
      title: "Clause 8.2",
      icon: "book",
      body: "Row 8.2: the documented information it requires, and your deliverables that evidence it. Choose the record that holds every risk's results.",
      getEl: () => rowIn(PAGE_WINDOW("Ref-Clause map"), "8.2") ?? $(PAGE_WINDOW("Ref-Clause map")),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-Clause map"), "8.2")?.scrollIntoView({ block: "center" }),
    },
    checkAnswers("Choose it, then Check my answers: you see the answer and why. The row locks then."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T7.2-11": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-RAM is the risk assessment method card: part of the ISMS's documented information a certification auditor reads. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "7 to 10"),
  ],

  "T7.2-12": [
    {
      title: "What each gap needs",
      icon: "table",
      body: "At work, every Partial or Gap clause gets an action, and the action is the evidence still missing. Your statuses are checked; the Conforms rows are filled for you.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step. They open beside the Gap sheet." } : c)),
    firstItem("Clause 4.2 yourself", "Clause 4.2: type its deliverables that are not accepted yet, as its row writes them. Next unlocks once it is right.", "Not yet accepted (action)", 2, () => valIs("Not yet accepted (action)", 2, "LI-FAM"), "Type clause 4.2's missing deliverables", WAIT_WINDOW),
    checkAnswers("Then the other Partial and Gap clauses. Check my answers then shows each clause's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-13": [
    {
      title: "Objectives you can measure",
      icon: "table",
      body: "At work, an ISMS objective (clause 6.2) is written so that the management review can say whether it was met: a number, a unit and a date. Rule L14, in the note, gives each target.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Calendar", CAL_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Calendar")) ?? null, body: "The calendar is tagged with this step: it gives the day week 12 opens." } : c)),
    {
      title: "An example",
      icon: "info",
      body: "A date of “week 3 + 2 months”, with week 3 opening on 19 October 2026, is 2026-12-19.",
      getEl: () => $(CAL_WINDOW),
    },
    firstItem("The first objective yourself", "Leavers: choose the objective with L14's target and the right date. Next unlocks once it is right.", "Objective as measured (L14)", 1, () => selIs("Objective as measured (L14)", 1, "95 % of leavers are de-provisioned within 4 hours by 2027-06-21"), "Choose the leavers objective", CAL_WINDOW),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-14": [
    {
      title: "An owner for each milestone",
      icon: "table",
      body: "At work, every milestone of an implementation plan has one accountable owner (clause 7.1, resources), taken from the RACI so nobody owns work they are not accountable for. Rule L15 is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(14, "Ref-ISMS processes"),
    {
      title: "The Accountable roles",
      icon: "book",
      body: "Each ISMS process with its Accountable role: take the role it names first. Match each milestone to the process its work belongs to.",
      getEl: () => $(PAGE_WINDOW("Ref-ISMS processes")),
    },
    firstItem("M2 yourself", "M2, Statement of Applicability approved: find its process and choose its Accountable role. Next unlocks once it is right.", "Owner (L15)", 2, () => selIs("Owner (L15)", 2, "CISO"), "Choose M2's owner", PAGE_WINDOW("Ref-ISMS processes")),
    checkAnswers("Then the other five. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-15": [
    {
      title: "Risks to the ISMS itself",
      icon: "table",
      body: "At work, clause 6.1.1 asks what could stop the ISMS working, and puts each action that addresses it into the plan, so it is done and tracked like the rest.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The first one yourself", "ISMS risk 1: read its risk and opportunity, and choose the milestone whose work it belongs to. Next unlocks once it is right.", "Milestone (clause 6.1.1)", 1, () => selIs("Milestone (clause 6.1.1)", 1, "M2 Statement of Applicability approved"), "Choose its milestone"),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T7.2-16": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-PLAN is the gap analysis, the objectives and the implementation plan, in four sheets. T12.1's management review checks each objective. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "6 and 12 to 15"),
  ],

  // T8.1 (desk-step-builder, 29 Oct 2026): VUL-TEST's sheets and VUL-MEMO in Control Testing › Vulnerability Remediation
  // Check, then LI-KPI. Steps 7 and 10 ask their question in the row and need no question guide: the situation and the
  // options say everything. Step 10 has no part 2.
  "T8.1-1": [
    {
      title: "A class for each kind of finding",
      icon: "table",
      body: "At work, a vulnerability SLA test starts by putting every finding in the policy class that sets its deadline. The class depends on three things the scanner gives: exposure, KEV listing and severity. Each row here is one kind of finding; your class goes to every finding of that kind. Rule R24 is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R24 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R24",
      icon: "book",
      body: "Read its classes in order and stop at the first that fits. An example: a KEV-listed Medium finding on an internet-facing asset would be class 1: KEV on an internet-facing asset comes first, whatever the severity.",
      getEl: () => rowIn(RULES_WINDOW, "R24") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R24")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first kind yourself", "Row 1: read its exposure, KEV listing and severity, and choose its class by R24. Next unlocks once it is right.", "Class (R24)", 1, () => selIs("Class (R24)", 1, "Class 2 (14 days)"), "Choose row 1's class", RULES_WINDOW),
    checkAnswers("Then the other eight. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-2": [
    {
      title: "Check the formula by hand",
      icon: "table",
      body: "At work, before an analyst relies on a spreadsheet formula for 172 rows, they work a few rows out by hand and compare. Here: one finding of each class. Its class is the one your step 1 gave it; due = first detected + the class's days.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A class 3 finding (30 days) first detected on 2026-01-20: 11 days take it to 31 January, 19 more to 2026-02-19.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first finding yourself", "Row 1: add its class's days to its first detected date and type the due date. Next unlocks once it is right.", "Due date", 1, () => valIs("Due date", 1, "2026-07-07"), "Type row 1's due date"),
    checkAnswers("Then the other three. Check my answers then shows each answer and why, and the workbook's formula fills every finding's due date. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-3": [
    {
      title: "Each finding's status",
      icon: "table",
      body: "At work, this is the test itself: for every finding, was it fixed in time, fixed late, still open within its deadline, or open past it? The test date and how to compare are in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A finding due 2026-10-10, closed 2026-10-12: closed late. One due 2026-12-01 with no closed date, tested on 2026-11-19: open, and its due date has not passed.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first finding yourself", "V-0001: compare its closed date with its due date and choose its status. Next unlocks once it is right.", "Status at the test date", 1, () => selIs("Status at the test date", 1, "Closed in SLA"), "Choose V-0001's status"),
    checkAnswers("Then the other 171. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-4": [
    {
      title: "Test each exception",
      icon: "table",
      body: "At work, an exception lets a finding stay open past its deadline only while it is properly approved and controlled. An auditor tests each one: an invalid exception leaves the finding overdue. R24's validity test and the test date are in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R24 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "The validity test",
      icon: "book",
      body: "R24's last sentence: three conditions, and every one must hold. An example: an exception approved by the system owner and the CISO, with a compensating control, that expired last week is invalid.",
      getEl: () => rowIn(RULES_WINDOW, "R24") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R24")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first exception yourself", "EX-001: read who approved it, its compensating control and its expiry, and decide. Next unlocks once it is right.", "Valid at the test date (R24)", 1, () => selIs("Valid at the test date (R24)", 1, "Invalid"), "Decide EX-001", RULES_WINDOW),
    checkAnswers("Then the other eleven. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-5": [
    {
      title: "Was each fix verified?",
      icon: "table",
      body: "At work, a finding marked closed is not trusted until the scanner confirms the fix. This sheet shows the closed findings only, with the scanner's latest scan of each. BKB-POL-010 says when a fix counts as verified.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-010", "The Vulnerability and Patch Management Policy", POL010_WINDOW),
    {
      title: "Section 6.1, step 4",
      icon: "book",
      body: "Step 4 of the triage procedure says what a verification needs: read it to the end. The bar at the top of the window jumps to Section 6.1.",
      getEl: () => $(POL010_WINDOW),
      onEnter: () => $(`${POL010_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The first finding yourself", "V-0001: compare its closed date with its last scan, and read what that scan found. Next unlocks once it is right.", "Re-scan verified", 1, () => selIs("Re-scan verified", 1, "Verified by re-scan"), "Decide V-0001", POL010_WINDOW),
    checkAnswers("Then the other closed findings. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-6": [
    {
      title: "Compliance per class",
      icon: "table",
      body: "At work, the result of the test is one figure per class with its numerator and denominator, so management can see where the policy is kept and where it is not. Under each class, its findings are counted by what you found in steps 3 to 5.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(6, "BKB-POL-010", "The Vulnerability and Patch Management Policy", POL010_WINDOW),
    {
      title: "Section 10",
      icon: "book",
      body: "Its first paragraph says which findings count as within SLA, and how the figure is worked out. The bar at the top of the window jumps to Section 10.",
      getEl: () => $(POL010_WINDOW),
      onEnter: () => $(`${POL010_WINDOW} [data-sec="10"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A class with 20 findings, 12 of them within SLA: 12 / 20 = 60.0 %.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("Class 1 yourself", "Class 1: add up the findings that are within SLA by Section 10, and type within / all = %. Next unlocks once it is right.", "Compliance (within SLA / all findings = %)", 1, () => valIs("Compliance (within SLA / all findings = %)", 1, "11 / 17 = 64.7 %"), "Type class 1's compliance", POL010_WINDOW),
    checkAnswers("Then the other three. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.1-7": [
    {
      title: "The memo's recommendations",
      icon: "table",
      body: "Your answer is in. Part 2: VUL-MEMO's lines are written from your checked sheets; its three recommendations become actions in T12.1. Rule R25, in the note, orders them by the number of breaches of each deviation type.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(7, "Ref-Actions"),
    {
      title: "The deviation types",
      icon: "book",
      body: "V1 to V4: the vulnerability deviations, each with its action. Count each one's breaches from the memo's lines.",
      getEl: () => rowIn(PAGE_WINDOW("Ref-Actions"), "V1") ?? $(PAGE_WINDOW("Ref-Actions")),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-Actions"), "V1")?.scrollIntoView({ block: "center" }),
    },
    firstItem("Recommendation 1 yourself", "Recommendation 1: the action of the deviation type with the most breaches. Next unlocks once it is right.", "What the memo says", 6, () => selIs("What the memo says", 6, "V2: Schedule the patch in the next maintenance window"), "Choose recommendation 1", PAGE_WINDOW("Ref-Actions")),
    checkAnswers("Then recommendations 2 and 3. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-8": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "VUL-TEST is the workpaper an assessor re-performs at checkpoint HC4; VUL-MEMO's recommendations become actions in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: VUL-TEST ends .xlsx (a workbook), VUL-MEMO .docx (a memo)." } : c)),
  ],

  "T8.1-9": [
    {
      title: "The measure card",
      icon: "table",
      body: "At work, a KPI reported every month needs a card that fixes how it is measured, so next month's figure means the same as this one's. ISO/IEC 27001 clause 9.1 lists what must be decided for each measure. LI-KPI carries the card's fixed values; you do not change them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Clause 9.1 a) asks what is measured. The card's Information need answers it: whether critical and high vulnerabilities are fixed within the SLA. Each question here is a clause 9.1 item like that.",
      getEl: () => rowIn('[data-guide="register"]', "Information need") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: clause 9.1 c) asks when the measuring is done. Read down the Field column and click the value that answers it. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="when"]'),
      doIt: "Click the value that says when",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.1-11": [
    {
      title: "Against the target",
      icon: "table",
      body: "At work, a measure is only useful once its result is judged against its target: that is what the evaluator acts on. Each class's result is the card's formula applied to VUL-TEST; the target and thresholds are in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A class with a target of 90 % or more and red below 80 %, at 85.0 %: below the target, but not red.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("Class 1 yourself", "Class 1: read its result and the target for classes 1–2, and choose where it stands. Next unlocks once it is right.", "Against the target", 1, () => selIs("Against the target", 1, "Below the red threshold"), "Choose class 1's standing"),
    checkAnswers("Then the other three. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.1-12": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-KPI is the measure card: in T12.1 its result is an input to the management review (clause 9.3.2 c). This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "9 to 11"),
  ],

  // T8.2 (desk-step-builder, 29 Oct 2026): CT-SCRIPT and CT-MEMO in Control Testing › Test Plan, then LI-NCR. Steps 6 and
  // 11 ask their question in the row and need no question guide: the situation and the options say everything (step 8 has
  // shown the two kinds of action D6 asks about). Both keep a part 2 that is real work: R25 and the 5-Whys form.
  "T8.2-1": [
    {
      title: "The test script",
      icon: "table",
      body: "At work, a control test is run from a script written before the evidence is opened, so it cannot be bent to pass. Sheet 1 is that script: what is tested, the six attributes A1 to A6 and when a record passes. You do not change it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A record whose MFA is No fails A3: A3 passes only when MFA is Yes. Each question here is a case like that.",
      getEl: () => rowIn('[data-guide="register"]', "A3") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: a review done five weeks after its quarter ended. Read the What the script says column and click the attribute that fails. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="late"]'),
      doIt: "Click the attribute a late review fails",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T8.2-2": [
    {
      title: "How many quarters to test",
      icon: "table",
      body: "At work, an auditor tests a sample of a control's occurrences and shows the sample is big enough. A review run every quarter is tested quarter by quarter. Rule R15, in the note, takes the minimum from the control's frequency.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 5",
      icon: "book",
      body: "The values LearnTech applies from each Group policy's criticality table. The bar at the top of the window jumps to Section 5.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="5"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The frequency yourself", "Find the privileged access review in Section 5 and choose its frequency. Next unlocks once it is right.", "Value", 1, () => selIs("Value", 1, "Quarterly"), "Choose the control's frequency", ADD36_WINDOW),
    ...openPage(2, "Ref-Sampling"),
    {
      title: "The sampling table",
      icon: "table",
      body: "One row per frequency, then two for a population of records. A control run every week, for example, is the Weekly row: a minimum sample of 5.",
      getEl: () => $(PAGE_WINDOW("Ref-Sampling")),
    },
    checkAnswers("Choose the minimum sample. Check my answers then shows each line's answer and why, and the platform selects the quarters. Your lines lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.2-3": [
    {
      title: "Test each record",
      icon: "table",
      body: "At work, this is the test itself: every record of the sampled quarters is checked against the script's six attributes. Sheet 2 lists the records of the two quarters the platform selected.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The script, beside the table",
      icon: "help",
      body: "Read A1 to A6 in order: each shows the cells of the lit record it reads. Mark every attribute that fails, then record Fail. If none fails, record Pass.",
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates",
      icon: "book",
      body: "A2 counts from the end of the record's quarter; the note gives the quarters. A Q3 record (April to June) reviewed on 2026-07-20 is 20 days after the quarter ended: it would fail A2.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="A2"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Check the first record",
      icon: "edit",
      body: "The first record is lit in the table. Read its six attributes in order and record your result. Next unlocks once it is right.",
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the record's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => {
        const [r, c] = uarResult("PR-011");
        return r === "Pass" && c === "none";
      },
      doIt: "Check the first record",
    },
    {
      title: "Then the other 25",
      icon: "check",
      body: "The checklist moves on to the next record by itself. To look at one again, click its Result in the table.",
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 26 are recorded, Check my answers shows each record's answer and why. Your rows lock then, so look them over first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.2-4": [
    {
      title: "Rate the deviation",
      icon: "table",
      body: "At work, every deviation is rated, because the rating decides the test's conclusion and how fast the owner must act. Rule R26, in the note, rates it by what it affects and what went wrong.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 8",
      icon: "book",
      body: "LearnTech's assets by office and criticality. An example: a deviation on an account of a Mission Critical system would be High, whatever went wrong. The bar at the top of the window jumps to Section 8.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("PR-022 yourself", "PR-022: read R26's ratings in order against the record and Section 8, and choose. Next unlocks once it is right.", "Rating (R26)", 1, () => selIs("Rating (R26)", 1, "Medium"), "Choose PR-022's rating", ADD36_WINDOW),
    checkAnswers("Check my answers then shows the answer and why. Your row locks then."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T8.2-5": [
    {
      title: "Conclude the test",
      icon: "table",
      body: "At work, a control test ends in one of three conclusions, and the control owner, the auditor and management act on it. Rule R19, in the note, decides it from the deviations: how many, and how they are rated.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The first line yourself", "Count the deviations the note lists, as steps 3 and 4 checked them, and type the number. Next unlocks once it is right.", "Your answer", 1, () => valIs("Your answer", 1, "1"), "Type the count"),
    checkAnswers("Then the highest rating and R19's conclusion. Check my answers then shows each line's answer and why. Your lines lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.2-6": [
    {
      title: "The memo's recommendation",
      icon: "table",
      body: "Your answer is in. Part 2: CT-MEMO's lines are written from your checked sheets; its recommendation becomes an action in T12.1. Rule R25, in the note, takes the Ref-Actions action for each deviation type your test found.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(6, "Ref-Actions"),
    {
      title: "The deviation types",
      icon: "book",
      body: "Each row is a type of deviation with its action. U1 to U10 are user-access review exceptions and V1 to V4 vulnerability ones: read the last row too.",
      getEl: () => $(PAGE_WINDOW("Ref-Actions")),
    },
    firstItem("The recommendation yourself", "Choose the action for the type of deviation your test found. Next unlocks once it is right.", "What the memo says", 4, () => selIs("What the memo says", 4, "CT: Correct the instance and add the missing step to the procedure"), "Choose the recommendation", PAGE_WINDOW("Ref-Actions")),
    checkAnswers("Check my answers then shows the answer and why. Your row locks then."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T8.2-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "CT-SCRIPT is the workpaper an assessor re-performs at checkpoint HC4 and an auditor may ask for in T12.2; CT-MEMO's recommendation becomes an action in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: CT-SCRIPT ends .xlsx (a workbook), CT-MEMO .docx (a memo)." } : c)),
  ],

  "T8.2-8": [
    {
      title: "The nonconformity report",
      icon: "table",
      body: "At work, a deviation found in a control test becomes a nonconformity: ISO/IEC 27001 clause 10.2 says what the organisation must then do, and LI-NCR records each part. Its entries come in steps 9 to 11.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Clause 10.2 asks for documented information on the nature of the nonconformity. The Nonconformity and Evidence fields hold it. Each question here is a clause 10.2 requirement like that.",
      getEl: () => rowIn('[data-guide="register"]', "Evidence") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: clause 10.2 a), react to the nonconformity and correct it. Read the What it holds column and click the field that records it. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="react"]'),
      doIt: "Click the field that corrects it",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T8.2-9": [
    {
      title: "Requirement and gap",
      icon: "table",
      body: "At work, a nonconformity is written in three parts: the requirement, the evidence, and the gap between them, so the owner sees exactly what was required and what was found. The evidence is copied for you.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(9, "BKB-POL-006", "The Access Control policy", POL006_WINDOW),
    {
      title: "The requirements",
      icon: "book",
      body: "Section 3.1 holds the policy statements, Section 4 the frequencies for each criticality band, Section 6.2 the review procedure. The bar at the top of the window jumps to each. Choose the one the deviation's attribute is about.",
      getEl: () => $(POL006_WINDOW),
    },
    firstItem("The requirement yourself", "Choose the requirement PR-022's deviation breaks. Next unlocks once it is right.", "Entry", 2, () => selIs("Entry", 2, "BKB-POL-006 Section 4 (LOW): Privileged access review — Quarterly"), "Choose the requirement", POL006_WINDOW),
    {
      title: "An example of a gap",
      icon: "info",
      body: "A Q3 review (April to June) dated 2026-07-20 is 20 days after the quarter ended.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    checkAnswers("Type the gap in days. Check my answers then shows each answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.2-10": [
    {
      title: "Grade it",
      icon: "table",
      body: "At work, a nonconformity is graded Major or Minor: a Major one can stop a certification until it is fixed. Rule L17, in the note, asks two questions.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A quarterly review that was never done in one of the quarters would be Major: the activity was not done in the period.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The grade yourself", "Answer L17's two questions for your nonconformity and choose its grade. Next unlocks once it is right.", "Entry", 5, () => selIs("Entry", 5, "Minor"), "Choose the grade"),
    checkAnswers("Check my answers then shows the answer and why. Your row locks then."),
    finish("This button unlocks once your answer is checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.2-11": [
    {
      title: "The 5-Whys form",
      icon: "table",
      body: "Your answer is in. Part 2: at work, the root cause is found by asking why, five times, each answer a fact from the evidence, never a guess or a person to blame. The note gives rule L18 and the IAM team's answer on PR-022.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "For a change implemented without approval, Why 4 might be: the change tool has no approval gate. Each answer explains the one before it.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("Why 1 yourself", "Why 1 copies the deviation itself: choose the fact that states it. Next unlocks once it is right.", "Answer (a fact from the evidence)", 1, () => ((oblCell("Answer (a fact from the evidence)", 1) as HTMLSelectElement | null)?.value ?? "").startsWith("PR-022"), "Choose Why 1's answer"),
    checkAnswers("Then Why 2 to Why 5. Check my answers then shows each answer and why, and the three action fields are written. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T8.2-12": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-NCR is the nonconformity report: its corrective action becomes an action in T12.1, and its re-test checks it worked. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "8 to 11"),
  ],

  // T9.1 (desk-step-builder, 29 Oct 2026): VEN-TIER, VEN-Q and VEN-CL in Vendors, then VEN-Q's cloud section (LI-13). Step 3
  // asks its question in the row, has no part 2 and no guide: the situation and the options say everything. Step 4's
  // question is as plain; its guide is for part 2, the clause checklist.
  "T9.1-1": [
    {
      title: "Six facts to record",
      icon: "table",
      body: "At work, a vendor is tiered from facts, not impressions: the business owner's intake form says what the vendor will receive and do, and the supplier policy says what each of rule R35's terms means. VEN-TIER records each fact; step 2 tiers the vendor from them.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Vendor Intake", "Lumen's intake form, completed by the business owner.", VEN_INTAKE_WINDOW),
    {
      title: "The intake form",
      icon: "book",
      body: "Each line is a fact about Lumen and its service. Drag the window aside if it covers the table, and keep it open.",
      getEl: () => $(VEN_INTAKE_WINDOW),
    },
    ...openLib(1, "BKB-POL-013", "The supplier policy", POL013_WINDOW),
    {
      title: "Section 3.1",
      icon: "book",
      body: "Its table gives each of R35's terms its meaning, and the line of the intake form to read it from. For example, a payments provider whose Business criticality says Revenue is revenue-critical. The bar at the top of the window jumps to Section 3.1.",
      getEl: () => $(POL013_WINDOW),
      onEnter: () => $(`${POL013_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The data tier yourself", "The highest data tier: read what Lumen receives and how it is identified, then Section 3.1's rows on Tier 4 and Tier 3 data, and choose. Next unlocks once it is right.", "Your answer", 1, () => selIs("Your answer", 1, "Tier 3 — Confidential"), "Choose the highest data tier", POL013_WINDOW),
    checkAnswers("Then the five Yes or No facts, each by its row of Section 3.1. Check my answers then shows each fact's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T9.1-2": [
    {
      title: "Tier the vendor",
      icon: "table",
      body: "At work, the tier decides how deep the assessment goes: the questions sent, the contract clauses and how often the vendor is reassessed. Rule R35 is in the note, with your facts as step 1 checked them.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "From Critical down",
      icon: "help",
      body: "Read Critical's conditions first. Only if none of them holds, go on to High, then Medium, then Low, and stop at the first tier that matches. A condition joined by OR needs one of its parts; one that says \"that is hard to replace\" needs that too. For example, a vendor that receives Tier 4 data is Critical, whatever else is true.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The tier yourself", "Walk R35 on your facts and choose Lumen's tier. Next unlocks once it is right.", "Tier (R35)", 1, () => selIs("Tier (R35)", 1, "High"), "Choose the tier"),
    checkAnswers("Check my answers then shows the answer and why. Your row locks then."),
    finish("This button unlocks once your answer is checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T9.1-4": [
    {
      title: "The clause checklist",
      icon: "table",
      body: "Your answer is in. Part 2: VEN-CL is the checklist Legal drafts Lumen's contract from. Each clause of Ref-Clauses carries the tier it is included from; rule R27, in the note, says which clauses a vendor's tier takes. The last row is written from your answer.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A Low-tier vendor's contract takes the clauses included from Low, and no other.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first clause yourself", "Security obligations and standards: read the tier it is included from against Lumen's tier, and choose. Next unlocks once it is right.", "In VEN-CL (R27)", 1, () => selIs("In VEN-CL (R27)", 1, "Yes"), "Choose for the first clause"),
    checkAnswers("Then the other seven. Check my answers then shows each clause's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T9.1-5": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "VEN-TIER is the vendor register's entry: T9.2 decides against its tier. VEN-Q goes to Lumen, and VEN-CL to Legal. This step checks all three, names the two workbooks and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 4").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then .xlsx. VEN-TIER is a platform form: it goes in with them, with no file name." } : c)),
  ],

  "T9.1-6": [
    {
      title: "Who secures what",
      icon: "table",
      body: "At work, a cloud supplier's questions must go to the party that actually secures each part, or the answers are useless: under each service model the provider secures some layers and the customer the rest. Rule L19, in the note: the model first, then Ref-Cloud's split for it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Vendor Intake", "Lumen's intake form: its Delivery line says who runs what.", VEN_INTAKE_WINDOW),
    {
      title: "The Delivery line",
      icon: "book",
      body: "It says what Lumen runs and what LearnTech sets up. Keep the window open beside the table.",
      getEl: () => $(VEN_INTAKE_WINDOW),
    },
    ...openPage(6, "Ref-Cloud"),
    {
      title: "The three models",
      icon: "table",
      body: "One row per model: what the provider secures, and what the customer secures. For example, under IaaS the customer patches the operating system.",
      getEl: () => $(PAGE_WINDOW("Ref-Cloud")),
    },
    firstItem("The model yourself", "Match the Delivery line to a model's Provider secures column, and choose the model. Next unlocks once it is right.", "Your answer", 1, () => selIs("Your answer", 1, "SaaS"), "Choose the service model", PAGE_WINDOW("Ref-Cloud")),
    checkAnswers("Then who secures each part, from Ref-Cloud's row for your model. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T9.1-7": [
    {
      title: "Each question's control",
      icon: "table",
      body: "At work, each question in a questionnaire is tied to the control it gives evidence for, so its answer can be filed against that control. L19's five fixed questions are copied in from Ref-Cloud; you choose each one's control: A.5.23 for the use of cloud services, or A.5.21 for the ICT supply chain.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "Sections 3.1 and 9",
      icon: "book",
      body: "Section 3.1 says what BKB-POL-021 requires of every cloud service; Section 9 maps the policy to its Annex A control. The bar at the top of the window jumps to each.",
      getEl: () => $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("Question 1 yourself", "Fixed question 1: is its subject one of Section 3.1's requirements of a cloud service? Choose its control. Next unlocks once it is right.", "Control it gives evidence for", 1, () => selIs("Control it gives evidence for", 1, "A.5.23 Information security for use of cloud services"), "Choose question 1's control", POL021_WINDOW),
    checkAnswers("Then the other four. Check my answers then shows each question's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T9.1-8": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "VEN-Q now carries its cloud and supply-chain section, LI-CLD: the service model, who secures what, and the five fixed questions with their controls. This step checks the section, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "6 and 7"),
  ],

  // T9.2 (desk-step-builder, 30 Oct 2026): SOC-REV and SOC-DEC in Vendors › SOC Report Review. Step 1 is a STUDY on SOC-REV's
  // checklist, 2–4 are checked per row, 5 hands in. No step is a question of its own (no pick), so no question guide.
  "T9.2-1": [
    {
      title: "A report and its checks",
      icon: "table",
      body: "At work, a vendor's SOC 2 report is its main proof of security, but only for a reader who knows what each part of it says. SOC-REV's checklist gives the team's nine checks, S1 to S9. Here you find which check reads which line of Lumen's report; step 2 then makes the checks.",
      getEl: () => $('[data-guide="study"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "SOC Report Review", "Lumen's SOC 2 report summary.", SOC_WINDOW),
    {
      title: "The report",
      icon: "book",
      body: "Each line is one part of the report: the auditor, its type and period, the opinion, what it covers, and what it asks of LearnTech. Drag the window aside if it covers the checklist, and keep it open.",
      getEl: () => $(SOC_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "The Opinion line is read by S4, Qualified opinion: S4 is the check whose words are about the auditor's opinion. Each question here names another line.",
      getEl: () => rowIn('[data-guide="register"]', "S4") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: the Subservice line. Read the Fails when column and click the code of the check that reads it. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="sub"]'),
      doIt: "Click the check that reads the Subservice line",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong click turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T9.2-2": [
    {
      title: "Nine checks",
      icon: "table",
      body: "At work, the review worksheet records each check's result, so the decision can be traced to the report. SOC-REV takes Pass or Fail for each check S1 to S9, read from Lumen's report on your review date.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "SOC Report Review", "Lumen's SOC 2 report summary, with your review date under it.", SOC_WINDOW),
    {
      title: "The review date",
      icon: "book",
      body: "The line under the report gives your review date: check S3 counts the months to it. Keep the window open beside the table.",
      getEl: () => $(SOC_WINDOW),
    },
    ...openLib(2, "BKB-POL-013", "The supplier policy", POL013_WINDOW),
    {
      title: "Section 7.1",
      icon: "book",
      body: "Its table says how each check is read and which line of the report it reads. For example, a report whose Exceptions line lists a CC6 exception with the response \"process being improved\" fails S6: the response does not show it fixed. The bar at the top of the window jumps to Section 7.1.",
      getEl: () => $(POL013_WINDOW),
      onEnter: () => $(`${POL013_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("S1 yourself", "S1: read the report's Type line with Section 7.1's row for S1, and choose. Next unlocks once it is right.", "Result", 1, () => selIs("Result", 1, "Pass"), "Choose S1's result", POL013_WINDOW),
    checkAnswers("Then S2 to S9, each by its row of Section 7.1. S7 and S9 also read Lumen's intake form (Vendors › Vendor Intake). Check my answers then shows each check's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T9.2-3": [
    {
      title: "Controls LearnTech runs",
      icon: "table",
      body: "At work, a CUEC is a control the vendor's report counts on its customer to run. Nobody runs one that has no owner, and then the report's assurance has a hole in it. Each row is a CUEC from Lumen's report; you give it its internal owner.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(3, "Ref-Conditions"),
    {
      title: "The CUEC owners",
      icon: "table",
      body: "The rows that start \"CUEC owner\" name the internal owner of each kind of CUEC. For example, a CUEC that asks for user access reviews goes to the system owner.",
      getEl: () => $(PAGE_WINDOW("Ref-Conditions")),
    },
    firstItem("The CUEC yourself", "Read what the CUEC asks LearnTech to do, find its kind among Ref-Conditions' CUEC owner rows, and choose its owner. Next unlocks once it is right.", "Internal owner", 1, () => selIs("Internal owner", 1, "IAM team"), "Choose the CUEC's owner", PAGE_WINDOW("Ref-Conditions")),
    checkAnswers("Check my answers then shows the answer and why. Your row locks then."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T9.2-4": [
    {
      title: "The onboarding decision",
      icon: "table",
      body: "At work, the analyst recommends and the approver decides: BKB-POL-013 Section 6.1 has the Org CISO approve a High-tier vendor. SOC-DEC gives them the decision with its grounds. Rule R28, in the note, turns the failed checks into the decision.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "R28 in order",
      icon: "help",
      body: "Each row is a check step 2 found failing: say whether, under R28, it rejects the vendor on its own or needs a condition. The last row is the decision. For example, a failed S3 needs a condition: a bridge letter, from Ref-Conditions.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("S2 yourself", "S2 failed: read R28 in the note, and choose what it does. Next unlocks once it is right.", "Under R28", 2, () => selIs("Under R28", 2, "Needs a condition"), "Choose S2's effect"),
    checkAnswers("Then the other failed checks and the decision. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T9.2-5": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "SOC-REV is the review worksheet: a failed check at a relied-on vendor becomes a new risk in T7.1. SOC-DEC goes to the approver, and its conditions and CUEC owners become actions in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 4").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names: .xlsx for SOC-REV, .docx for SOC-DEC." } : c)),
  ],

  // T10.1 (desk-step-builder, 30 Oct 2026): the corporate LMS's RoPA entry and data-flow map in Regulatory Watch › RoPA &
  // Data Flows. Step 1 is D1 alone, answered in its row (no part 2); its guide opens BKB-POL-017 Section 3.2, which the
  // question is worked out from. Steps 2–5 are checked per row; 6 hands in.
  "T10.1-1": [
    {
      title: "A question first",
      icon: "help",
      body: "At work, a RoPA entry starts with the organisation's role: a controller and a processor keep different records and answer for different duties. This step is the question alone. Read the situation in the box, then the three options.",
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    ...openLib(1, "BKB-POL-017", "The Data Protection and Privacy Policy", POL017_WINDOW),
    {
      title: "Section 3.2",
      icon: "book",
      body: "Its table says what each role means. For example, two companies that together decide why and how they use a shared customer list are joint controllers. The bar at the top of the window jumps to Section 3.2. Drag the window aside to see the question.",
      getEl: () => $(POL017_WINDOW),
      onEnter: () => $(`${POL017_WINDOW} [data-sec="3.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Match the situation to a role's meaning, choose that option, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-1 [data-guide="decision"]'),
      onEnter: () => { $(`${POL017_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-1 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-1 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-1 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it. ROPA records the role from the contract register.",
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the feedback read, mark the step complete.",
      getEl: () => $('#act-1 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how.",
      getEl: () => $('#act-1 [data-guide="show-me-how"]'),
    },
  ],

  "T10.1-2": [
    {
      title: "A basis for each purpose",
      icon: "table",
      body: "At work, every purpose in a RoPA entry names the lawful basis it rests on (GDPR Art.6), and the DPO checks it before the entry is approved. Each row of ROPA is one purpose from the client's instructions; you choose its basis.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-POL-017", "The Data Protection and Privacy Policy", POL017_WINDOW),
    {
      title: "Section 3.1",
      icon: "book",
      body: "Its lawful-basis table asks four questions in order; the first yes gives the basis. For example, payroll tax records an employer must keep by law: question 1, Legal obligation. The bar at the top of the window jumps to Section 3.1.",
      getEl: () => $(POL017_WINDOW),
      onEnter: () => $(`${POL017_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The first purpose yourself", "Ask the table's questions in order about the first purpose, and choose its basis. Next unlocks once it is right.", "Lawful basis", 1, () => selIs("Lawful basis", 1, "Contract"), "Choose the first purpose's basis", POL017_WINDOW),
    checkAnswers("Then the other three. Check my answers then shows each purpose's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.1-3": [
    {
      title: "Map the data",
      icon: "table",
      body: "At work, a data-flow map shows where personal data comes in, which systems hold it, where it crosses a border and where it is erased, named as the asset register names the systems. A breach assessment (T10.2) starts from it. Each row of DFM is one flow: give it its shape and its system.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Asset Register", "LearnTech's Amsterdam and Mumbai assets.", ASSET_WINDOW),
    {
      title: "The asset register",
      icon: "book",
      body: "Each asset has its office and a description of what it holds. A flow happens in the asset whose description fits it. Drag the window aside if it covers the table, and keep it open.",
      getEl: () => $(ASSET_WINDOW),
    },
    {
      title: "The four shapes",
      icon: "info",
      body: "The note above the table says what each shape means. For example, a paper form a visitor fills in at reception and staff type into a system is Collect. Whether a flow crosses a border is read with BKB-POL-017 Section 3.1.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("F1's shape yourself", "Read flow F1 and choose its shape. Next unlocks once it is right.", "Shape", 1, () => selIs("Shape", 1, "Collect"), "Choose F1's shape"),
    firstItem("F1's system yourself", "Copy the name of the asset F1 happens in, as the asset register writes it. Next unlocks once it is right.", "System (asset register)", 1, () => valIs("System (asset register)", 1, "Learning platform & content"), "Type F1's system", ASSET_WINDOW),
    checkAnswers("Then F2 to F6. A system name that is not the right asset is flagged at once. Check my answers then shows each flow's shape and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.1-4": [
    {
      title: "Each transfer's mechanism",
      icon: "table",
      body: "At work, a RoPA entry names the legal mechanism each cross-border transfer rests on (GDPR Art.30(1)(e)), taken from the organisation's register of the laws of each office. The rows are the flows step 3 found to be transfers.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 2",
      icon: "book",
      body: "One row per office; the last column is its Cross-border transfer rule. The note above the table says whose row to read: the office the data leaves. For example, data leaving Istanbul is read in the Istanbul row. The bar at the top of the window jumps to Section 2.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="2"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("F4 yourself", "Read where F4's data is held, and copy that office's Cross-border transfer cell word for word. Next unlocks once it is right.", "Transfer mechanism (BKB-ADD-36 Section 2)", 4, () => valIs("Transfer mechanism (BKB-ADD-36 Section 2)", 4, "GDPR Ch.V"), "Type F4's mechanism", ADD36_WINDOW),
    checkAnswers("Then F5. The evidence ref is written for you. Check my answers then shows each transfer's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.1-5": [
    {
      title: "Screen for a DPIA",
      icon: "table",
      body: "At work, every processing activity is screened for a DPIA before it starts, and the result is recorded even when it is No: the DPO and a supervisory authority ask for the screening, not only for DPIAs. Rule R29 is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "RoPA & Data Flows", "The processing description, from the business owner.", ROPA_WINDOW),
    {
      title: "The description",
      icon: "book",
      body: "It says whose data is processed, what data, how people sign in and how the courses and quizzes work. Drag the window aside if it covers the table, and keep it open.",
      getEl: () => $(ROPA_WINDOW),
    },
    ...openLib(5, "BKB-POL-017", "The Data Protection and Privacy Policy", POL017_WINDOW),
    {
      title: "Section 6.2",
      icon: "book",
      body: "Its second table defines each of R29's triggers. For example, an exam taken with the webcam on and watched by a proctor is monitoring or recording. The bar at the top of the window jumps to Section 6.2.",
      getEl: () => $(POL017_WINDOW),
      onEnter: () => $(`${POL017_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The first trigger yourself", "Children or students: read the description's Data subjects line with Section 6.2's definition, and choose. Next unlocks once it is right.", "Your answer", 1, () => selIs("Your answer", 1, "No"), "Choose for the first trigger", POL017_WINDOW),
    checkAnswers("Then the other triggers, and last whether a DPIA is required. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.1-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "ROPA is the RoPA entry: the record, each purpose's lawful basis and the DPIA screening. DFM is the data-flow map. A breach assessment (T10.2) starts from both: the data, the people and where it goes. This step checks them, names the two files and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names: .xlsx for ROPA, .png or .pdf for DFM." } : c)),
  ],

  // T10.2 (desk-step-builder, 30 Oct 2026): the notification assessment of INC-2610-3001 in Regulatory Watch › Breach Clock
  // Calculator. Steps 1–5 fill BRC-ASSESS (copies checked against the record; 2–5 checked per row); step 6 is D4 alone,
  // answered in its row (no part 2), its guide opening BKB-POL-014 Section 6.1; 7 hands in. LI-14: 8 reads LI-IRBC's phase
  // sheet (STUDY), 9 and 10 are checked per row, 11 hands in.
  "T10.2-1": [
    {
      title: "The facts first",
      icon: "table",
      body: "At work, a breach assessment starts from the incident's facts, and every statutory clock counts from one moment: when the breach was discovered, in UTC. BRC-ASSESS's Facts sheet takes it from the incident record.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    {
      title: "The incident record",
      icon: "book",
      body: "Each line is one fact: when the breach was discovered, whose systems, where the people live, what data. Drag the window aside if it covers the table, and keep it open.",
      getEl: () => $(BRC_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "A record whose Discovered (UTC) line reads 2026-03-02 08:15 UTC is copied as 2026-03-02 08:15 UTC: the date, the time and UTC.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The discovery time yourself", "Copy the record's Discovered (UTC) line into the Value cell. Next unlocks once it is right.", "Value (incident record)", 1, () => valIs("Value (incident record)", 1, "2026-12-08 13:20 UTC"), "Type the discovery time", BRC_WINDOW),
    finish("This button unlocks once the time is copied."),
  ],

  "T10.2-2": [
    {
      title: "Offices and countries",
      icon: "table",
      body: "At work, rule R30 finds the regimes from two lists: the offices whose systems are affected, and the countries where the affected people live. Both go into BRC-ASSESS's Facts sheet, copied from the incident record.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    firstItem("The offices yourself", "Copy the record's line Offices whose systems are affected. Next unlocks once it is right.", "Value (incident record)", 2, () => valIs("Value (incident record)", 2, "Amsterdam, Netherlands"), "Type the offices", BRC_WINDOW),
    checkAnswers("Then the countries, every one, separated by \";\". Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.2-3": [
    {
      title: "Which regimes apply",
      icon: "table",
      body: "At work, the DPO must know every regime a breach engages, the ones that apply only if a condition is met, and why the others do not. Each row is a regime of BKB-ADD-36 Section 2, with its office and the words of its cell.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(3, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.3",
      icon: "book",
      body: "Its steps say which offices an incident engages and which of their regimes apply. For example, had only Istanbul's systems been hit, with every affected person in Turkey, only the Istanbul row would be read. The bar at the top of the window jumps to Section 6.3.",
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The incident's lists",
      icon: "info",
      body: "The offices and countries you copied in step 2 are in the incident record, Regulatory Watch › Breach Clock Calculator. Open it from the toolbar if you need it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("KVKK yourself", "KVKK is in the Istanbul office's row. Is that office engaged by this incident? Read Section 6.3 with the incident's lists, and choose. Next unlocks once it is right.", "Applies?", 1, () => selIs("Applies?", 1, "Applies"), "Choose for KVKK", POL014_WINDOW),
    checkAnswers("Then the other five. Check my answers then shows each regime's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.2-4": [
    {
      title: "Each deadline",
      icon: "table",
      body: "At work, each regime's clock is turned into a date and a time in UTC, so that offices in four time zones work to the same moment, and the plan works to the earliest firm one. The rows are the regimes step 3 found to apply.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.3, step 6",
      icon: "book",
      body: "It says how to count. For example, 72 hours from Friday 2026-03-06 18:00 UTC ends on Monday 2026-03-09 18:00 UTC: weekends count. Step 7 says which deadline governs. The bar at the top of the window jumps to Section 6.3.",
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("KVKK yourself", "The discovery time is in the note above the table. Add KVKK's clock, and type the deadline as date, time, UTC. Next unlocks once it is right.", "Deadline (UTC)", 1, () => valIs("Deadline (UTC)", 1, "2026-12-11 13:20 UTC"), "Type KVKK's deadline", POL014_WINDOW),
    checkAnswers("Then the other regimes, and last the earliest firm deadline. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.2-5": [
    {
      title: "Tell the people?",
      icon: "table",
      body: "At work, telling the people whose data was taken is a decision of its own, and the record shows why it was made. Rule R30, in the note, makes it from the data: each of its conditions, then the result.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    {
      title: "What the record says",
      icon: "book",
      body: "The Data categories, Approx. records and Children's data lines are the ones R30's conditions ask about. Drag the window aside if it covers the table, and keep it open.",
      getEl: () => $(BRC_WINDOW),
    },
    firstItem("The first condition yourself", "Children's data: read the record and choose. Next unlocks once it is right.", "Your answer", 1, () => selIs("Your answer", 1, "Yes"), "Choose for children's data", BRC_WINDOW),
    checkAnswers("Then the other conditions, and last whether the data subjects must be told. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.2-6": [
    {
      title: "A question first",
      icon: "help",
      body: "At work, a notice about a breach is a statement the organisation is held to, by the people affected and by the authorities. This step is the question alone. Read the situation in the box, then the three options.",
      getEl: () => $('#act-6 [data-guide="decision"]'),
    },
    ...openLib(6, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.1",
      icon: "book",
      body: "Its table gives each step of the response: what is done, who does it and what comes out. For example, step 2, Triage, is the Incident Response & Crisis Manager's, within an hour. The bar at the top of the window jumps to Section 6.1. Drag the window aside to see the question.",
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option Section 6.1 supports, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-6 [data-guide="decision"]'),
      onEnter: () => { $(`${POL014_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-6 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-6 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-6 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it. BRC-PLAN records your answer with the rest of the plan.",
      getEl: () => $('#act-6 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the feedback read, mark the step complete.",
      getEl: () => $('#act-6 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how.",
      getEl: () => $('#act-6 [data-guide="show-me-how"]'),
    },
  ],

  "T10.2-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "BRC-ASSESS is the notification assessment: the facts, each regime with its deadline, and the data-subject test. BRC-PLAN is the notification plan and breach-register entry, written by the platform from your steps 2 to 6. T11.1 and T12.1 build on the plan. This step checks them, names the two files and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names: .xlsx for BRC-ASSESS, .docx for BRC-PLAN." } : c)),
  ],

  "T10.2-8": [
    {
      title: "Five phases",
      icon: "table",
      body: "At work, an auditor asks how ISO/IEC 27001's incident controls, A.5.24 to A.5.28, worked in a real incident. LI-IRBC answers it: its Phases sheet gives rule L20's five phases, the control of each and the part of BKB-POL-014 it covers. Here you find three things in it.",
      getEl: () => $('[data-guide="study"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Logging an event in the incident tool and giving it a severity is Section 6.1 step 1: the Detect and report phase, control A.6.8.",
      getEl: () => rowIn('[data-guide="register"]', "Detect") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: the notification assessment. Read the What it covers column and click the control it asks for. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="assess"]'),
      doIt: "Click the control of the notification assessment's phase",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong click turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T10.2-9": [
    {
      title: "The incident, phase by phase",
      icon: "table",
      body: "At work, the incident's timeline is read against the process, to show each phase happened and to see what was missed. Each row of LI-IRBC's Timeline is one event of INC-2610-3001, in UTC; you give it its phase.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "The phases",
      icon: "info",
      body: "The note gives each phase and the part of BKB-POL-014 it covers, as the Phases sheet of step 8 does. For example, a member of staff forwarding a phishing e-mail to the service desk, which logs it, is Detect and report.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(9, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.1",
      icon: "book",
      body: "Its table says what each step of the response does: an event that matches a step's action belongs to that step's phase. Section 4 names the exercises that prepare for an incident. The bar at the top of the window jumps to each section.",
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("E1 yourself", "Read E1 and its date, and choose its phase. Next unlocks once it is right.", "Phase (L20)", 1, () => selIs("Phase (L20)", 1, "Plan"), "Choose E1's phase", POL014_WINDOW),
    checkAnswers("Then E2 to E9. Check my answers then shows each event's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.2-10": [
    {
      title: "BC or DR",
      icon: "table",
      body: "At work, an outage raises two separate questions: does the business need its continuity plan to keep running (BC), and do the ICT systems need the disaster-recovery plan to be restored (DR)? Rule L20, in the note, decides each from the RTO.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    {
      title: "What was down",
      icon: "book",
      body: "The System affected and Service disruption lines say which system was down, and for how long. Close the window or drag it aside before you open the next one.",
      getEl: () => $(BRC_WINDOW),
    },
    ...openLib(10, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Sections 8 to 8.2",
      icon: "book",
      body: "Section 8 counts each office's Mission Critical assets and 8.1 lists them. Section 8.2 gives each critical process of the Amsterdam office, the system it runs on and its RTO. For example, a process that stopped for 2 hours, with an RTO of 4 hours, needs no BC plan. The bar at the top of the window jumps to Section 8; 8.1 and 8.2 follow it.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The DR plan yourself", "Was a Mission Critical system down? Read Sections 8 and 8.1 with the incident record, and choose. Next unlocks once it is right.", "Your decision", 1, () => selIs("Your decision", 1, "Do not invoke"), "Choose for the DR plan", ADD36_WINDOW),
    checkAnswers("Then the BC plan, with Section 8.2. Check my answers then shows each plan's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T10.2-11": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-IRBC shows the incident against ISO/IEC 27001's incident controls: each event's phase, and whether the BC and DR plans were invoked, with why. An auditor reads it with BRC-PLAN. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "8 to 10"),
  ],
  "T11.1-1": [
    {
      title: "Four weeks",
      icon: "table",
      body: "At work, every office's awareness campaign follows the Group's 4-week template, so campaigns can be compared and each week has a known output. AWR-PLAN, the campaign plan, has one row per week; you give each week its activity.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R31 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R31",
      icon: "book",
      body: "Its first sentence sets each week's activity, in order. For example, a template that read “Week 1 kick-off, Week 2 lesson” would give Week 2 the lesson. Drag the window aside if it covers the table.",
      getEl: () => rowIn(RULES_WINDOW, "R31") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R31")?.scrollIntoView({ block: "center" }),
    },
    firstItem("Week 1 yourself", "Read R31 and choose Week 1's activity. Next unlocks once it is right.", "Activity (R31)", 1, () => selIs("Activity (R31)", 1, "Lesson"), "Choose Week 1's activity", RULES_WINDOW),
    checkAnswers("Then weeks 2 to 4. Check my answers then shows each week's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-2": [
    {
      title: "A question first",
      icon: "help",
      body: "At work, the scenario card is the first thing staff read in the lesson, so it must be the situation the theme is about. This step is the question alone. Read the situation in the box, then the three cards.",
      getEl: () => $('#act-2 [data-guide="decision"]'),
    },
    ...openScreen("awareness", "Awareness", "Content Templates", "The content bank, tagged with this step.", CT_WINDOW),
    {
      title: "The content bank",
      icon: "book",
      body: "One row for each theme, with its scenario card. For example, the theme Secure remote and travel working opens with a stranger reading your screen in a café. Drag the window aside to see the question.",
      getEl: () => $(CT_WINDOW),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the card the content bank gives your theme, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-2 [data-guide="decision"]'),
      onEnter: () => { $(`${CT_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-2 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-2 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-2 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it. AWR-LESSON records the card and the theme's three behaviours.",
      getEl: () => $('#act-2 [data-guide="decision"]'),
    },
    { title: "Finish here", icon: "check", body: "With the feedback read, mark the step complete.", getEl: () => $('#act-2 [data-guide="step-complete"]') },
    { title: "Replay any time", icon: "play", body: "Replay any time with ▶ Show me how.", getEl: () => $('#act-2 [data-guide="show-me-how"]') },
  ],

  "T11.1-3": [
    {
      title: "Three check questions",
      icon: "table",
      body: "At work, each check question of a micro-lesson tests one of the behaviours it teaches, so the quiz shows whether the lesson landed. Each row is a question of your theme; its choices are the theme's three behaviours.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(3, "Ref-Content"),
    {
      title: "Ref-Content",
      icon: "book",
      body: "Your theme's row gives each question with its answer in brackets. For example, the vishing theme's question “Will IT ask for your code? (Never)” checks its behaviour “Never share MFA codes”.",
      getEl: () => $(PAGE_WINDOW("Ref-Content")),
    },
    firstItem("The first question yourself", "Approve a request you did not start? Read its answer in Ref-Content and choose the behaviour it checks. Next unlocks once it is right.", "Behaviour it checks", 1, () => selIs("Behaviour it checks", 1, "Never approve a request you did not start"), "Choose its behaviour", PAGE_WINDOW("Ref-Content")),
    checkAnswers("Then the other two. Check my answers then shows each question's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-4": [
    {
      title: "A question first",
      icon: "help",
      body: "At work, a phishing simulation records what each person does, so it is cleared before anything is sent. This step is the question alone. Read the situation in the box, then the three options.",
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R31 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R31",
      icon: "book",
      body: "Its last sentence says who approves a simulation, and when one more approval is added. Close the window or drag it aside before you open the next one.",
      getEl: () => rowIn(RULES_WINDOW, "R31") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R31")?.scrollIntoView({ block: "center" }),
    },
    ...openLib(4, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 2.2",
      icon: "book",
      body: "It lists each office's employee bodies. For example, for a simulation in New York, Section 2.2 lists no employee body, so R31 adds nothing to its first part there. The bar at the top of the window jumps to Section 2.2.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="2.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option R31 and Section 2.2 give for Amsterdam, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-4 [data-guide="decision"]'),
      onEnter: () => { $(`${ADD36_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-4 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-4 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-4 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it. AWR-SIM records the approvals.",
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    { title: "Finish here", icon: "check", body: "With the feedback read, mark the step complete. The next step is a question too, so the desk takes you back to the step list.", getEl: () => $('#act-4 [data-guide="step-complete"]') },
    { title: "Replay any time", icon: "play", body: "Replay any time with ▶ Show me how.", getEl: () => $('#act-4 [data-guide="show-me-how"]') },
  ],

  "T11.1-5": [
    {
      title: "Each metric's target",
      icon: "table",
      body: "Your answer is in. Part 2: at work, a campaign is judged against targets the organisation has already set, each read from the place that sets it. AWR-SIM's two metrics are in the table; their formulas are written for you.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Heat Map with KRIs", "The Amsterdam office register's KRIs, tagged with this step.", HEAT_WINDOW),
    {
      title: "The office register",
      icon: "book",
      body: "Each risk with the KRI that tracks it and its target. For example, R-36-RO1-13's KRI is regulatory changes assessed within 30 days, with a target of 100%.",
      getEl: () => $(HEAT_WINDOW),
    },
    firstItem("Click rate yourself", "Find the phishing risk's KRI and type its target as it is written: “≤”, the number and “%” (you may type <=). Next unlocks once it is right.", "Target", 1, () => valIs("Target", 1, "≤ 5 %"), "Type the click-rate target", HEAT_WINDOW),
    ...openLib(5, "BKB-POL-020", "The awareness policy", POL020_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${HEAT_WINDOW} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Section 7.1",
      icon: "book",
      body: "Its table gives the target of each measure. The bar at the top of the window jumps to Section 7.1.",
      getEl: () => $(POL020_WINDOW),
      onEnter: () => $(`${POL020_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    checkAnswers("Then the report rate's target. Check my answers then shows each metric's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.1-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "AWR-PLAN is the campaign plan, AWR-LESSON the micro-lesson with its quiz, AWR-SIM the simulation plan, all from your steps 1 to 5. The Regional Compliance & Legal team's campaign runs from them. This step checks them, names the two files and submits them; AWR-SIM is a platform form, with no file to name.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then an extension the box names: .xlsx or .docx for AWR-PLAN, .docx or .pptx for AWR-LESSON." } : c)),
  ],

  "T11.1-7": [
    {
      title: "What LI-COMM evidences",
      icon: "table",
      body: "At work, before filling a template, an implementer checks which clauses of the standard it is evidence for, so an auditor finds what they look for. These are Ref-Clause map's rows for clauses 5.1 and 7.2 to 7.4. Here you find three things in them.",
      getEl: () => $('[data-guide="study"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Clause 5.1, Leadership and commitment, is evidenced by ACT-UPD, ACT-MRI and LI-POL, and makes no documented information mandatory.",
      getEl: () => rowIn('[data-guide="register"]', "5.1") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: the clause LI-COMM alone evidences. Read the deliverables column and click its clause. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="comm"]'),
      doIt: "Click the clause LI-COMM alone evidences",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong click turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-8": [
    {
      title: "Competence on file",
      icon: "table",
      body: "Your answer is in. Part 2: at work, clause 7.2 is audited by asking for each role holder's evidence of competence. Each row is a role of Ref-Competence, copied for you, with its Amsterdam holder and the record on file.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A control owner whose record shows the briefing but no accepted evidence pack is not yet shown competent: one item of Evidence retained is missing.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The risk owner yourself", "Compare the risk owner's Record on file with its Evidence retained, and choose. Next unlocks once it is right.", "Competence shown? (clause 7.2)", 1, () => selIs("Competence shown? (clause 7.2)", 1, "Action needed"), "Choose for the risk owner"),
    checkAnswers("Then the other two. Check my answers then shows each role's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-9": [
    {
      title: "When each message goes",
      icon: "table",
      body: "Your answer is in. Part 2: at work, the ISMS communication plan is dated against the programme calendar, so each message goes out when its event happens. Each row is a communication of Ref-Communications, copied for you, with the event that triggers it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("home", "Home", "Calendar", "The programme calendar, tagged with this step.", CAL_WINDOW),
    {
      title: "The calendar",
      icon: "book",
      body: "Each week with the day it opens and its tasks. For example, an event of T6.2 falls in W6, which opens Mon 09 Nov.",
      getEl: () => $(CAL_WINDOW),
    },
    firstItem("The policy launch yourself", "Its event is in T4.1. Find T4.1's week in the calendar and choose it. Next unlocks once it is right.", "Week (Home › Calendar)", 1, () => selIs("Week (Home › Calendar)", 1, "W4 · Mon 26 Oct"), "Choose its week", CAL_WINDOW),
    checkAnswers("Then the other five. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.1-10": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-COMM is the competence matrix and the ISMS communication plan: evidence for clauses 7.2 and 7.4, and an input to the management review in T12.1. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "7 to 9"),
  ],

  "T11.2-1": [
    {
      title: "Four offices, one source",
      icon: "table",
      body: "At work, a brief names who supervises each office, and the Regulation Tracker is only a copy that drifts: it is checked against the addendum before anyone relies on it. Each row is one of LearnTech's offices, with the authority the tracker gives it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 2",
      icon: "book",
      body: "One row per office; its Authority column names who supervises it. For example, GlobalConnect's addendum gives Manila the NPC: a tracker entry “NPC” for Manila would agree with it. The bar at the top of the window jumps to Section 2.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="2"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("Istanbul yourself", "Compare Istanbul's tracker entry with its row of Section 2, and choose. Next unlocks once it is right.", "Against BKB-ADD-36 Section 2", 1, () => selIs("Against BKB-ADD-36 Section 2", 1, "Agrees with Section 2"), "Choose for Istanbul", ADD36_WINDOW),
    checkAnswers("Then the other three. Check my answers then shows each office's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.2-2": [
    {
      title: "Official or not",
      icon: "table",
      body: "Your answer is in. Part 2: at work, a month's monitoring turns up the rule itself and plenty written about it, and only the first may be cited in a brief. Each row is one of this month's results for your topic.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A page of the European Data Protection Board publishing its own guidelines is an official source; a consultancy's newsletter about those guidelines is not. Read each result's publisher and web address.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first result yourself", "Read the first result's publisher and web address, and choose. Next unlocks once it is right.", "Official source?", 1, () => selIs("Official source?", 1, "Official source"), "Choose for the first result"),
    checkAnswers("Then the other five. Check my answers then shows each result's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-3": [
    {
      title: "Each source's dates",
      icon: "table",
      body: "At work, a brief cites each source with when it was published, when its duties apply and when you read it, so anyone can check the text as you saw it. Titles and addresses are written for you; the dates are yours.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(3, "SRC-EC-MINORS-2025", "Source 1's saved copy", SRC1_WINDOW),
    {
      title: "Section 1",
      icon: "book",
      body: "Its table gives the publisher, the address and the date published, and a Status line on when the duty applies. Drag the window aside if it covers the table.",
      getEl: () => $(SRC1_WINDOW),
    },
    firstItem("Source 1's publication yourself", "Type the date source 1 was published, as 1 March 2024 or 2024-03-01. Next unlocks once it is right.", "Source 1 (European Commission)", 3, () => valIs("Source 1 (European Commission)", 3, "14 July 2025"), "Type the date", SRC1_WINDOW),
    {
      title: "Then the other dates",
      icon: "edit",
      body: "Source 1's date of application, then source 2's: its saved copy is tagged too (Section 1, and Article 93 in Section 4). Accessed is today's date for each. A wrong date is flagged with where to read it.",
      getEl: () => $('[data-guide="register"]'),
    },
    finish("This button unlocks once every date is in. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.2-4": [
    {
      title: "Duty or background",
      icon: "table",
      body: "Your answer is in. Part 2: at work, a brief lists what the organisation must do and leaves the rest to the source. Each row is one of source 1's key points, as its saved copy gives it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "“Answer each complaint within 14 days” is a duty; “The authority received 2,000 complaints last year” is background.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("Point 1 yourself", "Read point 1 and choose. Next unlocks once it is right.", "Duty or background?", 1, () => selIs("Duty or background?", 1, "Background"), "Choose for point 1"),
    checkAnswers("Then the other nine. Check my answers then shows each point's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-5": [
    {
      title: "The Regulation's own words",
      icon: "table",
      body: "At work, the duties a brief relies on are read in the law itself, not only in a summary of it. Each row is a paragraph of source 2, Regulation (EU) 2022/2065.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "SRC-EU-2022-2065", "Source 2's saved copy", SRC2_WINDOW),
    {
      title: "Articles 19 and 28",
      icon: "book",
      body: "The bar at the top of the window jumps to each. For each paragraph, read who it asks to do what. Drag the window aside if it covers the table.",
      getEl: () => $(SRC2_WINDOW),
      onEnter: () => $(`${SRC2_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("Article 19(1) yourself", "Does it ask the provider to do something? Choose. Next unlocks once it is right.", "Duty or background?", 1, () => selIs("Duty or background?", 1, "Background"), "Choose for Article 19(1)", SRC2_WINDOW),
    checkAnswers("Then the four paragraphs of Article 28. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-6": [
    {
      title: "Office by office",
      icon: "table",
      body: "At work, a new rule is applied to each office in turn: one office's answer is never assumed for the others. Each row is a LearnTech office with what it runs, from REG-EXTRA; the note above gives LearnTech's size.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(6, "BKB-POL-016", "The compliance policy", POL016_WINDOW),
    {
      title: "Section 7.2",
      icon: "book",
      body: "Three tests in order: reach, activity, threshold. The guidelines apply to an office only when all three are met. The bar at the top of the window jumps to Section 7.2; source 1's key point 2 says whom they cover.",
      getEl: () => $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="7.2"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("Istanbul yourself", "Apply the three tests to Istanbul's line, and choose. Next unlocks once it is right.", "Do the guidelines apply?", 1, () => selIs("Do the guidelines apply?", 1, "Does not apply"), "Choose for Istanbul", POL016_WINDOW),
    checkAnswers("Then the other three. Check my answers then shows each office's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-7": [
    {
      title: "Duty to policy",
      icon: "table",
      body: "At work, each new duty is mapped to the Group policy that must carry it, and a duty no policy carries is raised as a gap. Each row is a duty of steps 4 and 5.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(7, "Ref-Keywords"),
    {
      title: "Ref-Keywords",
      icon: "book",
      body: "Key words, the BKB policy they point to, and its Annex A controls. For example, a duty to “patch internet-facing servers within 7 days” uses “patch”, which points to BKB-POL-010.",
      getEl: () => $(PAGE_WINDOW("Ref-Keywords")),
    },
    firstItem("Point 4 yourself", "Find the key word point 4 uses, and choose its policy. Next unlocks once it is right.", "BKB policy (Ref-Keywords)", 1, () => selIs("BKB policy (Ref-Keywords)", 1, "BKB-POL-002"), "Choose point 4's policy", PAGE_WINDOW("Ref-Keywords")),
    checkAnswers("Then the other seven. Check my answers then shows each duty's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.2-8q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. First, a question on the deadline BKB-POL-016 sets for an impact assessment. Read the situation in the box, then the three options.",
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    ...openLib(8, "BKB-POL-016", "The compliance policy", POL016_WINDOW),
    {
      title: "Section 3.1",
      icon: "book",
      body: "Its second statement says how long the impact assessment of a change may take, and counted from when. The procedure in Section 6.1 says the same. The bar at the top of the window jumps to each.",
      getEl: () => $(`${POL016_WINDOW} [data-sec="3.1"]`) ?? $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option the policy gives, then click Check my answer. Your pick is locked then, so choose with care.",
      getEl: () => $('#act-8 [data-guide="decision"]'),
      onEnter: () => { $(`${POL016_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-8 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-8 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-8 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "Green marks the best option. Under every option you see why, and what happens if you take it.",
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Replay any time with ▶ Show me how. Part 2 opens from the Open button below the question.",
      getEl: () => $('#act-8 [data-guide="show-me-how"]'),
    },
  ],

  "T11.2-8": [
    {
      title: "Who owns each action",
      icon: "table",
      body: "Your answer is in. Part 2: at work, each action of a brief goes to the owner of the policy it changes, so it is done and tracked. Each row is a policy the Impact Log found; the action and its date are written for you.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(8, "BKB-POL-000", "The policy index", POL000_WINDOW),
    {
      title: "Sections 3 and 7",
      icon: "book",
      body: "Section 3 gives each policy's owner; Section 7 says who drafts a new statement. For example, an action on BKB-POL-010 goes to the Vulnerability Management Governance Analyst. The bar at the top of the window jumps to each.",
      getEl: () => $(POL000_WINDOW),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("BKB-POL-002 yourself", "Find BKB-POL-002's owner in Section 3, and choose. Next unlocks once it is right.", "Owner (BKB-POL-000)", 1, () => selIs("Owner (BKB-POL-000)", 1, "Group Chief Risk Officer"), "Choose its owner", POL000_WINDOW),
    checkAnswers("Then the other four. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-9": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "REG-BRIEF is the regulatory change brief from your steps 3 to 8: its sources, what each asks, where it applies, the policies it touches and the actions. It updates the obligations register and starts the actions. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "1 to 8"),
  ],

  "T11.2-10": [
    {
      title: "The type of the change",
      icon: "table",
      body: "At work, clause 6.3 of ISO/IEC 27001 asks for changes to the ISMS to be planned, and a change's type says which parts of the ISMS it touches. The row is your change.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-Change types"),
    {
      title: "Ref-Change types",
      icon: "book",
      body: "Its first five rows are the topic types, each with the ISMS elements it touches and a new-technology note. For example, a new national incident-reporting law is a cyber / resilience law. Close the window or drag it aside before you open the next one.",
      getEl: () => $(PAGE_WINDOW("Ref-Change types")),
    },
    ...openLib(10, "SRC-EU-2022-2065", "Source 2's saved copy", SRC2_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${PAGE_WINDOW("Ref-Change types")} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Section 1",
      icon: "book",
      body: "Its Title line gives the full name of the law the guidelines come from.",
      getEl: () => $(SRC2_WINDOW),
    },
    firstItem("The type yourself", "Choose the topic type of the change. Next unlocks once it is right.", "Topic type (Ref-Change types)", 1, () => selIs("Topic type (Ref-Change types)", 1, "Sector or market rule (media, finance, education, health)"), "Choose its topic type", SRC2_WINDOW),
    checkAnswers("Check my answers then shows the answer and why. The row locks then."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T11.2-11": [
    {
      title: "What the change touches",
      icon: "table",
      body: "At work, the change plan lists each part of the ISMS a change touches, so none is left out of date until the next audit. Each row is an ISMS element; the note names your topic type.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(11, "Ref-Change types"),
    {
      title: "The type's row",
      icon: "book",
      body: "Its second column lists the elements a change of that type affects. For example, a standard revision affects SoA, Documents, Objectives and Resources, not Scope or Risks.",
      getEl: () => $(PAGE_WINDOW("Ref-Change types")),
    },
    firstItem("Scope yourself", "Find your topic type's row and choose for Scope. Next unlocks once it is right.", "Affected by the change?", 1, () => selIs("Affected by the change?", 1, "Affected"), "Choose for Scope", PAGE_WINDOW("Ref-Change types")),
    checkAnswers("Then the other five. Check my answers then shows each element's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-12": [
    {
      title: "Systems on layers",
      icon: "table",
      body: "At work, the change plan places each affected system on the reference architecture, so the people who run that layer are brought in. Each row is a LearnTech system that carries a new duty.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(12, "TSA-36 Technology_Stack"),
    {
      title: "Technology_Stack",
      icon: "book",
      body: "One row per capability, by Cap ID, with its Domain. For example, SOC-01, the SIEM, is in the Domain Security operations. Close the window or drag it aside before you open the next one.",
      getEl: () => $(PAGE_WINDOW("TSA-36 Technology_Stack")),
    },
    ...openLib(12, "BKB-TECH-000", "The reference architecture", TECH_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${PAGE_WINDOW("TSA-36 Technology_Stack")} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Section 3",
      icon: "book",
      body: "Its table gives the layer each Technology_Stack Domain sits on, in the last column. The bar at the top of the window jumps to Section 3.",
      getEl: () => $(TECH_WINDOW),
      onEnter: () => $(`${TECH_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("SEC-50 yourself", "SEC-50's Domain is in Technology_Stack; find its layer in Section 3, and choose. Next unlocks once it is right.", "Layer (BKB-TECH-000)", 1, () => selIs("Layer (BKB-TECH-000)", 1, "Application"), "Choose SEC-50's layer", TECH_WINDOW),
    checkAnswers("Then the other four. Check my answers then shows each system's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T11.2-13": [
    {
      title: "The new-technology note",
      icon: "table",
      body: "At work, the change-impact note records what new technology in a change of this type raises, so the risk owners look at it. The row is your change, with its topic type from step 10.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(13, "Ref-Change types"),
    {
      title: "The type's row",
      icon: "book",
      body: "The note is in its last column, New-technology note.",
      getEl: () => $(PAGE_WINDOW("Ref-Change types")),
    },
    firstItem("The note yourself", "Choose the note of your topic type's row. Next unlocks once it is right.", "New-technology note (Ref-Change types)", 1, () => selIs("New-technology note (Ref-Change types)", 1, "Large data sets (volume, variety, velocity) raise retention and access questions"), "Choose the note", PAGE_WINDOW("Ref-Change types")),
    checkAnswers("Check my answers then shows the answer and why. The row locks then."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T11.2-14": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-CHG is the ISMS change impact note from your steps 10 to 13: the change's type, the ISMS elements it touches, the systems on their layers and the new-technology note. It goes with REG-BRIEF. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "10 to 13"),
  ],

  // T12.1 (desk-step-builder, 30 Oct 2026): ACT-TRACKER followed up in Risk Register › Mitigation Tracker. Steps 8 and 11 are
  // plain questions in their rows (no part 2, no guide); step 9's guide is its part 2.
  "T12.1-1": [
    {
      title: "Read the tracker first",
      icon: "table",
      body: "At work, a corrective-action tracker is read column by column before any closure is tested, so each test reads the right cell. This step reads ACT-TRACKER and the read-me of its template, T-ACT.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Mitigation Tracker", "ACT-TRACKER, tagged with this step.", MT_WINDOW),
    {
      title: "ACT-TRACKER",
      icon: "book",
      body: "One row per action, with what its owner reports and the evidence attached. A-20 to A-22 came in late, with ACT-EXTRA (Inbox). Use only this dataset.",
      getEl: () => $(MT_WINDOW),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: R33's third test. Read the read-me's What it records column and click the column it asks for. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => { $(`${MT_WINDOW} button[aria-label^="Close"]`)?.click(); $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="sys"]'),
      doIt: "Click the column the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered."),
  ],

  "T12.1-2": [
    {
      title: "Test each closure",
      icon: "table",
      body: "At work, an owner's “Closed” is a claim: before the management review, the Compliance Manager's team tests the evidence of every closure. Each row is an action its owner reports Closed.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R33 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R33",
      icon: "book",
      body: "Four tests, in order, each with a code, K1 to K4. An action is verified only if all four pass. Drag the window aside if it covers the checklist.",
      getEl: () => rowIn(RULES_WINDOW, "R33") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R33")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "The tests, beside the table",
      icon: "help",
      body: "Each test shows the cells of the lit action it reads. Read them in order. If one fails, click Fails on it; if all four pass, record Pass.",
      getEl: () => $('[data-guide="checklist"]'),
      onEnter: () => $(`${RULES_WINDOW} button[aria-label^="Close"]`)?.click(),
    },
    {
      title: "Test the first action",
      icon: "edit",
      body: "The first action is lit in the table. Read its four tests in order and record your result. Next unlocks once it is right.",
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the action's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => uarResult("A-02")[0] === "Fail",
      doIt: "Test the first action",
    },
    {
      title: "Then the other 14",
      icon: "check",
      body: "The checklist moves on to the next action by itself. To test one again, click its Closure tests cell in the table.",
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 15 are recorded, Check my answers shows each action's answer and why. Your rows lock then, so look them over first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-3": [
    {
      title: "Why each one reopened",
      icon: "table",
      body: "At work, a reopened action carries the code of the test it failed, so its owner knows what is missing and the review can count the reasons. Each row is an action that failed a closure test in step 2.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "An action closed on a screenshot that carries no date has nothing to show the fix came after the action was raised: it would fail the second test, K2.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("A-02 yourself", "Read A-02's cells against R33's tests in order, and choose its status. Next unlocks once it is right.", "Status after your tests (R33)", 1, () => selIs("Status after your tests (R33)", 1, "Open — K2"), "Choose A-02's status"),
    checkAnswers("Then the other six. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-4": [
    {
      title: "Escalate or not",
      icon: "table",
      body: "At work, an action that has slipped well past its date goes to the owner's manager, so someone with authority can unblock it. Each row is an action still open after your tests.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "An action due on 1 December is 22 days past due on 23 December: more than 14. Read each row's Due and Escalated columns.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("A-01 yourself", "Count A-01's days from its due date to 23 December 2026, and choose. Next unlocks once it is right.", "Escalate? (R33)", 1, () => selIs("Escalate? (R33)", 1, "No escalation yet"), "Choose for A-01"),
    checkAnswers("Then the other 13. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-5": [
    {
      title: "How late each one is",
      icon: "table",
      body: "At work, the tracker records how far past its due date each open action is: the owner, their manager and the review read it. Each row is an action still open after your tests.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Due on 1 December: 22 days past due on 23 December. Due on 5 January: not past due yet, so 0.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("A-01 yourself", "Type A-01's days past due at 23 December 2026. Next unlocks once it is in.", "Days past due at 23 Dec 2026", 1, () => valIs("Days past due at 23 Dec 2026", 1, "0"), "Type A-01's days"),
    checkAnswers("Then the other 13. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-6": [
    {
      title: "Tell each owner",
      icon: "table",
      body: "At work, a reopened action goes back to its owner with exactly what will close it, and a date. Each row is an action your tests reopened, with its code.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("A-02 yourself", "A-02 failed K2. Choose what its owner must send. Next unlocks once it is right.", "Ask the owner for", 2, () => selIs("Ask the owner for", 2, "Evidence dated after the action was raised"), "Choose for A-02"),
    {
      title: "The request is written",
      icon: "info",
      body: "Request to the owner fills itself in the Evidence request frame: what to send, for which action, by the next check date.",
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Then the other six. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-7": [
    {
      title: "The counts",
      icon: "table",
      body: "At work, the counts are the first thing top management reads on the review input, so each must say what the review needs: the tracker as your tests found it, not as the owners report it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: of the closures the owners reported, how many your tests confirmed. Click the count that answers it. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="conf"]'),
      doIt: "Click the count the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.1-9": [
    {
      title: "Issues that come back",
      icon: "table",
      body: "Your answer is in. Part 2: at work, the tracker is read for patterns before it goes to the review. Each row is one of ACT-UPD's 22 actions.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "If “Badge not returned” were on A-30 and on A-41, both would be a repeat issue, whatever their status. An issue on one action alone is a single action.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("A-01 yourself", "Read A-01's issue, then look for it on the other rows. Choose. Next unlocks once it is right.", "Repeat issue?", 1, () => selIs("Repeat issue?", 1, "Repeat issue"), "Choose for A-01"),
    checkAnswers("Then the other 21. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "ACT-UPD is the updated tracker from your steps 2 to 9; T12.2 shows its verified closures to the surveillance auditor. ACT-MRI is the management-review input: the counts, the overdue actions and the repeat issues. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 9").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names." } : c)),
  ],

  "T12.1-12": [
    {
      title: "The review's inputs",
      icon: "table",
      body: "At work, the management review pack is built from inputs that must be ready before the meeting: clause 9.3.2 lists them. Each row is one input; you decide whether it is available.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(12, "Ref-Review inputs"),
    {
      title: "What feeds each input",
      icon: "book",
      body: "Each row names the deliverables that feed one input, by their codes. Drag the window aside if it covers your table.",
      getEl: () => $(PAGE_WINDOW("Ref-Review inputs")),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step." } : c)),
    {
      title: "Your review records",
      icon: "book",
      body: "One row per deliverable you handed in, with its automated review: accepted, or accepted with review comments. A deliverable that is not listed is not in the records yet.",
      getEl: () => $(WAIT_WINDOW),
    },
    firstItem("Input a yourself", "Input a: look up its deliverables in Ref-Review inputs, then in your records, and choose. Next unlocks once it is right.", "Status", 1, () => selIs("Status", 1, "Available"), "Choose input a's status", WAIT_WINDOW),
    checkAnswers("Then the other nine. Check my answers then shows each input's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-13": [
    {
      title: "The objectives",
      icon: "table",
      body: "At work, the review checks each information security objective against its measure (clause 9.3.2 c). Each row is one of your LI-PLAN objectives, with its target and the latest result.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "An objective with a target of 90 % and a latest result of 93 % is met; one with no result yet is too early to judge.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first objective yourself", "Compare its latest result with its target, and choose. Next unlocks once it is right.", "Status", 1, () => selIs("Status", 1, "Not met"), "Choose its status"),
    checkAnswers("Then the other two. Check my answers then shows each objective's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-14": [
    {
      title: "Ready for Stage 1?",
      icon: "table",
      body: "At work, before the certification body's Stage 1 audit the ISMS's mandatory documented information is checked item by item: the auditor reviews it first. Each row is one item of your LI-DOC register, with the artefacts that hold it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step." } : c)),
    {
      title: "Your review records",
      icon: "book",
      body: "Find each artefact here by its code. Drag the window aside if it covers your table.",
      getEl: () => $(WAIT_WINDOW),
    },
    firstItem("Clause 4.3 yourself", "Look up 4.3's artefact in your records, and choose. Next unlocks once it is right.", "Present?", 1, () => selIs("Present?", 1, "Present"), "Choose for 4.3", WAIT_WINDOW),
    checkAnswers("Then the other 13, and the verdict in the last row by rule L24. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.1-15": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-MR is the audit programme, the management review pack and the readiness verdict: the audit programme written from your answer in step 11 and this task's tracker, the review pack, the objectives and the readiness from your steps 12 to 14. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "11 to 14"),
  ],
  // T12.2 (desk-step-builder, 31 Oct 2026): the surveillance audit answered in Evidence › Audit Requests (PBC). Steps 2, 9 and 11
  // are plain questions in their rows (no part 2, no guide); step 6's guide is its part 2.
  "T12.2-1": [
    {
      title: "Read the index first",
      icon: "table",
      body: "At work, the repository's index is read column by column before the first auditor request is answered, so each answer is checked in the right cell. This step reads EVIDENCE-INDEX and its read-me.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "EVIDENCE-INDEX, tagged with this step.", EVLIB_WINDOW),
    {
      title: "EVIDENCE-INDEX",
      icon: "book",
      body: "One row per file the repository holds for this audit, sorted by control. Use only this dataset.",
      getEl: () => $(EVLIB_WINDOW),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: how a file was produced. Read the read-me's What it records column and click the column it asks for. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => { $(`${EVLIB_WINDOW} button[aria-label^="Close"]`)?.click(); $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="src"]'),
      doIt: "Click the column the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.2-3": [
    {
      title: "Answer each request",
      icon: "table",
      body: "At work, each auditor request is answered with one file from the evidence repository, and the auditor concludes from what is sent. Each row is one of the auditor's requests R-1 to R-8.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "The repository's index, tagged with this step.", EVLIB_WINDOW),
    {
      title: "Look up by control",
      icon: "book",
      body: "The index is sorted by control: a request's files sit together under its control. Read each one's description, date and source. Drag the window aside if it covers your table.",
      getEl: () => $(EVLIB_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "Say a request asked for the incident log under A.5.24, and the index held an undated screenshot of the log and a system export of it dated inside the period: the export is the file to send.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("R-1 yourself", "Find R-1's control in the index, apply R34 to its files, and choose. Next unlocks once it is right.", "File to send (R34)", 1, () => selIs("File to send (R34)", 1, "EV-5508"), "Choose R-1's file", EVLIB_WINDOW),
    checkAnswers("Then R-2 to R-8. Check my answers then shows each request's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.2-4": [
    {
      title: "Log each fingerprint",
      icon: "table",
      body: "At work, the log of what was sent to the auditor records each file's SHA-256, so the file the auditor holds can be proved to be the one sent. Each row is a request answered with a file in step 3.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "The repository's index, tagged with this step.", EVLIB_WINDOW),
    {
      title: "The SHA-256 column",
      icon: "book",
      body: "Each file's fingerprint is in its own row. Two files of the same control have different fingerprints, so find the row of the file sent.",
      getEl: () => $(EVLIB_WINDOW),
    },
    firstItem("R-1 yourself", "Find R-1's file sent in the index and copy its SHA-256. Next unlocks once it is right.", "SHA-256 of the file sent", 1, () => valIs("SHA-256 of the file sent", 1, "1f0ecb464b826d95"), "Type R-1's SHA-256", EVLIB_WINDOW),
    checkAnswers("Then the other six. Check my answers then shows each answer and why, and records the time sent. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.2-5": [
    {
      title: "The follow-up requests",
      icon: "table",
      body: "At work, the auditor's follow-up requests ask for the ISMS's own records, and the analyst knows which record answers which clause. Each row is one follow-up request.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("policies", "Policies", "Version History", "Your hand-ins, tagged with this step.", VH_WINDOW),
    {
      title: "Your hand-ins",
      icon: "book",
      body: "One row per deliverable you handed in, by code and name, with its task. Drag the window aside if it covers your table.",
      getEl: () => $(VH_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "Say a request asked for the record of each personal-data processing activity: the RoPA entry of T10.1 would be that record.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("R-9 yourself", "Read what R-9 asks for, find the deliverable that is that record, and choose it. Next unlocks once it is right.", "Answer with (your deliverable)", 1, () => selIs("Answer with (your deliverable)", 1, "LI-RAM"), "Choose R-9's deliverable", VH_WINDOW),
    checkAnswers("Then R-10 to R-12. Check my answers then shows each request's answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.2-6": [
    {
      title: "R-3's owner",
      icon: "table",
      body: "Your answer is in. Part 2: at work, an action goes to the role that runs the control, because that role holds its records. The row is the action raised for R-3.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(6, "Charter", "The BKB Group GRC Charter", CHARTER_WINDOW),
    {
      title: "The RACI",
      icon: "book",
      body: "Section 16 has a row per process and a column per role; the legend under the table gives each column's full role. R marks the role that does the work.",
      getEl: () => $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="16"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("A-23 yourself", "Find the process R-3's control belongs to in Section 16, then the role marked R in that row, and choose it. Next unlocks once it is right.", "Owner (GRC Charter Section 16)", 1, () => selIs("Owner (GRC Charter Section 16)", 1, "Security Awareness & Training Specialist"), "Choose A-23's owner", CHARTER_WINDOW),
    checkAnswers("Check my answers then shows the answer and why. The row locks then, so check it first."),
    finish("This button unlocks once your answer is checked."),
  ],

  "T12.2-7": [
    {
      title: "Answer the finding",
      icon: "table",
      body: "At work, a finding is answered from the evidence it names: the auditee reads that file before deciding to accept or challenge. The note gives NC-1 and its file.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "The repository's index, tagged with this step.", EVLIB_WINDOW),
    {
      title: "The file NC-1 names",
      icon: "book",
      body: "Find the file the note names in the File column, and read its row to the last column. Drag the window aside if it covers your table.",
      getEl: () => $(EVLIB_WINDOW),
    },
    firstItem("The response yourself", "Apply R34 to what the file shows, and choose the response. Next unlocks once it is right.", "Entry", 5, () => selIs("Entry", 5, "Accept and commit to corrective action"), "Choose the response", EVLIB_WINDOW),
    ...openPage(7, "Ref-Actions"),
    {
      title: "Ref-Actions",
      icon: "book",
      body: "Exception / deviation names what went wrong; Action, Owner and Due say what fixes it. Find the row that fits what the file shows.",
      getEl: () => $(PAGE_WINDOW("Ref-Actions")),
    },
    checkAnswers("Choose the corrective action. Check my answers then shows each answer and why. Your rows lock then, so check them first."),
    finish("This button unlocks once your answers are checked."),
  ],

  "T12.2-8": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "AUD-LOG is the auditor request log: what each request was answered with, its SHA-256, when it was sent, and the action raised. AUD-NCR is GlobalConnect's response to NC-1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names." } : c)),
  ],

  "T12.2-10": [
    {
      title: "The evidence row",
      icon: "table",
      body: "At work, the auditee reads the auditor's evidence before the response cites it: is it the period's record, from a system, and what does it show? The step names the file; the table is the index.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: find the file in the File column, then click the cell in its row that shows the problem. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="shows"]'),
      doIt: "Click the cell the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way, in the same row. A wrong cell turns amber and the question gives a hint.",
      getEl: () => $('[data-guide="study"]'),
    },
    finish("This button unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.2-12": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "LI-NCR-R is the clause-based response to NC-1, written from your steps 7, 9, 10 and 11: the requirement, the evidence row, the response and the route if it is disputed. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "9 to 11"),
  ],
};
