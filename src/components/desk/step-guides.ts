import type { TourStep } from "@/components/app/guided-tour";
import { docTable } from "@/lib/desk/docs";
import { localizable, toLearner } from "@/lib/desk/names";
import { expandGuides } from "@/lib/desk/acronyms";
import { STUDY, regOf } from "@/lib/desk/registers";

/**
 * Walk-throughs for steps, shown in the step's modal the first time it opens (and again from
 * "Show me how"). A card earns its place only by showing something the screen does not already
 * say: where a value lives, which control to press. The "do it" cards wait for the mentee's own
 * action (a cursor taps the control) rather than a Next button.
 *
 * Keyed "<task>-<step>". Targets are found by data-guide attributes (the Onboarding record table, a
 * toolbar section, its open menu, the complete button), so a guide never depends on class names.
 */
const $ = (sel: string) => document.querySelector<HTMLElement>(sel);
const ORG_WINDOW = 'section[role="dialog"][aria-label="Home › My Organisation"]';
const TASKS_WINDOW = 'section[role="dialog"][aria-label="Home › My Tasks"]';
const PLAN_WINDOW = 'section[role="dialog"][aria-label^="Home › My plan"]';
const QR_WINDOW = 'section[role="dialog"][aria-label*="Framework Quick Reference"]';
const firstCell = () => $('[data-guide="rmf-table"] :is(input, select)');
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
        body: `This step has two parts. Part 1 is ${question}`,
        steps: [
          { lead: "Pick an option", text: "Answer it as you did in step 2: read the situation, then all three options." },
          { lead: "Click **Check my answer**", text: "Part 2 opens once your answer is checked." },
        ],
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
      body: `${partTwo.length ? "This step has two parts. Part 1 is " : "This step is "}${question}`,
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options", text: "More than one can sound reasonable. Hold each one against the situation's facts." },
      ],
      getEl: () => row('[data-guide="decision"]'),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => row('[data-guide="decision"]'),
      // At the situation, never at an option: the cursor must not suggest an answer.
      pointAt: () => row('[data-guide="decision-context"]'),
      nextWhen: () => !!row('[data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
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
      body: "Click **▶ Show me how** to run this guide again.",
      getEl: () => row('[data-guide="show-me-how"]'),
    },
  ];
};

/** "Click Home", then the screen in its menu the step tags: the same two clicks on every step. */
const openFromHome = (screen: string, window: string, tagged: string): TourStep[] => [
  {
    title: "Open Home",
    icon: "home",
    body: "Every screen opens from the toolbar at the bottom of the page. Click **Home**.",
    getEl: () => $('[data-guide-section="home"]'),
    waitFor: () => !!$('[data-guide-menu="home"]'),
    // The step opens its menu by itself (toolbar.tsx): already open, the click is done.
    skip: () => !!$('[data-guide-menu="home"]'),
    doIt: "Click Home",
  },
  {
    title: `Open ${screen}`,
    icon: "grid",
    body: `Click **${screen}**. Its tag, ${tagged}, marks the screen this step uses.`,
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
    body: "Type the file name in the box.",
    steps: [
      { lead: "Use the four parts listed under the box", text: "Keep them in the order shown, joined by underscores." },
      { lead: `End with .${ext}` },
      { lead: "Type the name as the last line under the box writes it", text: "**Put together** shows the whole name, with your own mentee ID. Next unlocks once the name is right." },
    ],
    getEl: () => $('[data-guide="file-name"]'),
    pointAt: () => $('[data-guide="file-name-input"]'),
    // Every file-name box, not the first alone: a two-file hand-in unlocked with its second name still empty.
    nextWhen: () => {
      const els = [...(document.querySelectorAll?.('[data-guide="file-name-input"]') ?? [])] as HTMLInputElement[];
      return els.length > 0 && els.every((el) => !!el.value.trim() && el.getAttribute("aria-invalid") !== "true");
    },
    doIt: "Type the file name",
  },
  {
    title: "Submit it",
    icon: "upload",
    body: `Submit opens once steps ${steps} are complete.`,
    steps: [
      { lead: "Click **Submit**", text: "It hands the file in." },
      { lead: "Check the receipt", text: "It shows a hash (a fingerprint of the file) and a UTC time." },
    ],
    tips: [
      { kind: "unsure", text: "If the hash or the time is missing, use **Report a problem** at the bottom right." },
    ],
    getEl: () => $('[data-guide="submit"]'),
  },
  {
    title: "Finish here",
    icon: "check",
    body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.",
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
    body: "**Policies** carries the dot: this step's document is in its Policy Library. Click **Policies**.",
    getEl: () => $('[data-guide-section="policies"]'),
    waitFor: () => !!$('[data-guide-menu="policies"]'),
    skip: () => !!$('[data-guide-menu="policies"]'),
    doIt: "Click Policies",
  },
  {
    title: "Open the Policy Library",
    icon: "grid",
    body: `Click **Policy Library**. It is tagged Step ${n}.`,
    getEl: () => $('[data-guide-menu="policies"] li[data-target] button'),
    waitFor: () => !!$(LIBRARY_WINDOW),
    doIt: "Click Policy Library",
  },
  {
    title: "Open BKB-ADD-16",
    icon: "book",
    body: `Click **BKB-ADD-16**, your organisation's addendum. It is tagged Step ${n} and opens beside the brief.`,
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
/** Under a drafted section: the learner presses Check my answers. */
const briefCheckCard: TourStep = {
  title: "Check your answers",
  icon: "check",
  body: "Click **Check my answers**. Each line of the draft then says whether it was right and why; a line still wrong is flagged with where to read it.",
  // On a phone the addendum sits over the page: the guide closes it, or the verdict lands under it.
  onEnter: () => { if (innerWidth <= 700) $(`${ADD16_WINDOW} button[aria-label^="Close"]`)?.click(); },
  getEl: () => $('[data-guide="brief-check"]') ?? $('[data-guide="brief-result"]'),
  nextWhen: () => !!$('[data-guide="brief-result"]'),
  doIt: "Click Check my answers",
};
/** A cell of CTX-IP by column and row number. */
const ipCell = (col: string, row: number) => $(`[data-guide="register"] [aria-label="${col}, row ${row}"]`);

const STD_WINDOW = 'section[role="dialog"][aria-label^="BKB-STD-001"]';
/** Policies › Policy Library › a Group document: the three clicks to a document a step reads. */
const openGroupDoc = (n: number, code: string, what: string, win: string): TourStep[] => [
  ...openAddendum(n).slice(0, 2),
  {
    title: `Open ${code}`,
    icon: "book",
    body: `Click **${code}**. ${what} is tagged Step ${n}.`,
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
/** A field of CLS-RES table 2 by its label ("Tier 3"). */
const clsField = (label: string) => $(`[data-guide="brief-section"] input[aria-label="${label}"]`);
/** The label chosen for a sample item of CLS-RES table 1. */
const labelCell = (row: number) => famCell(toLearner("GlobalConnect label"), row) as HTMLSelectElement | null;
/** The R05 check of a CLS-RES row (A-03 is row 3). */
const r05 = (row: number) => famCell("Personal data or credentials? (R05)", row) as HTMLSelectElement | null;

const DC_WINDOW = 'section[role="dialog"][aria-label="Evidence › Defect Codes"]';
/** Evidence › Defect Codes, opened beside EVQ-RES: the two clicks from the toolbar. */
const openDefectCodes = (n: number): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: "**Evidence** carries the dot: Defect Codes is in its menu. Click **Evidence**.",
    getEl: () => $('[data-guide-section="evidence"]'),
    waitFor: () => !!$('[data-guide-menu="evidence"]'),
    skip: () => !!$('[data-guide-menu="evidence"]'),
    doIt: "Click Evidence",
  },
  {
    title: "Open Defect Codes",
    icon: "grid",
    body: `Click **Defect Codes**: the ten checks, D1 to D10. It is tagged Step ${n} and opens beside the results file.`,
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
/** The step's own rows are in place when it opens: the first Obligation cell the learner can type in. */
/* A list where the step's lines are chosen (T3.1 steps 3 and 4), a box where they are typed: both are the cell. Naming
   the box alone left "Fill the first row" locked for good once the cell became a list (owner, 18 Nov 2026). */
const OBL_CELLS = '[data-guide="register"] :is(textarea, select)[aria-label^="Obligation (plain English)"]';
const oblCells = () => [...document.querySelectorAll<HTMLSelectElement>(OBL_CELLS)];
const oblFirst = () => $(OBL_CELLS);
const oblRows = () => document.querySelectorAll('[data-guide="register"] tbody tr').length;
/** The cell of another column in the same row as a cell. A step's rows start wherever the earlier steps left off, so a
 *  worked row is found by a cell it holds, never by its number. A list or a typed box: both are the cell. */
const sameRow = (el: Element | null | undefined, col: string) => el?.closest("tr")?.querySelector<HTMLElement>(`:is(input, textarea, select)[aria-label^="${col}, row "]`) ?? null;
/**
 * One cell of the row a guide works from start to finish (tester, 18 Nov 2026: "Show Me How should show one full row
 * being completed"): the cell is lit and pointed at, the place its value is read stays live beside it, and Next waits
 * until the cell holds a value the step accepts. `anchor` is a cell that names the worked row.
 */
const rowCell = (title: string, col: string, anchor: () => Element | null | undefined, body: string, more: Partial<TourStep> = {}): TourStep => ({
  title,
  icon: "edit",
  body,
  getEl: () => sameRow(anchor(), col)?.closest("td") ?? $('[data-guide="register"]'),
  pointAt: () => sameRow(anchor(), col),
  nextWhen: () => cellIn(sameRow(anchor(), col)),
  doIt: `Fill ${col}`,
  ...more,
  // On a phone the cell goes to the top of its pane: left mid-screen, a card of three or four lines has no room above
  // or below it and floats over the cell it is about.
  onEnter: () => { more.onEnter?.(); sameRow(anchor(), col)?.scrollIntoView({ block: innerWidth <= 700 ? "start" : "nearest", inline: "nearest" }); },
});
/** The worked row's Type is the one its source makes it (owner, 22 Nov 2026: the card unlocked on any option). The card
 *  names the answer and how the source gives it (owner, same day: a worked row's real answers are given); the other rows'
 *  Types are the learner's, scored by Check my answers. */
const typeIs = (anchor: () => Element | null | undefined, want: string) => (sameRow(anchor(), "Type") as HTMLSelectElement | null)?.value === want;
/** The worked row's cell holds the value the card gives (owner, 22 Nov 2026: the worked row's real answers are given,
 *  with how each is read), accepted by the step. For a card whose cell would otherwise unlock on any accepted value. */
const workedIs = (anchor: () => Element | null | undefined, col: string, want: string | RegExp) => {
  const el = sameRow(anchor(), col) as HTMLInputElement | null;
  const v = el?.value.trim() ?? "";
  return !!v && el!.getAttribute("aria-invalid") !== "true" && (typeof want === "string" ? v.toLowerCase() === want.toLowerCase() : want.test(v));
};
/** A section of the addendum brought to the top of its window, for a card that lights a cell and reads the section. */
const showAddSec = (sec: string) => () => $(`${ADD16_WINDOW} [data-sec="${sec}"]`)?.scrollIntoView({ block: "start" });
/** T3.1 step 1's worked row: the first, Manila's. */
const t311Row = () => oblCell("Office(s)", 1);
/** T3.1 step 5's worked row: OBL-01. */
const t315Row = () => oblCell("Process", 1);
/** T3.1 step 8's worked row: OBL-16, the first of sheet 2. */
const t318Row = () => extraCell("Evidence of compliance", 1);
const M9_POLICY_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-0"]:not([aria-label^="BKB-POL-000"])';
/** T3.2 step 7's row: M9, the only one of sheet 2. */
const t327Row = () => mapXCell("BKB policy");
/** T5.2 step 6's worked row: E-043, the first late file of sheet 2. */
const t526Row = () => $('[data-reg="EVP-EXTRA"] [aria-label="Result (R09), row 1"]');
/** T5.2 step 3's corrected row: file E-023's PBC req. cell, found by the item (the listed rows are those step 2 accepted). */
const t523Row = () => [...document.querySelectorAll<HTMLElement>('[data-guide="register"] tbody tr')].find((tr) => /\bE-023\b/.test(tr.innerText))?.querySelector<HTMLElement>('select[aria-label^="PBC req., row "]') ?? null;
/** T7.1 step 13's worked row: the first chain, whose control is A.8.15. */
const t7113Row = () => oblCell("Control type", 1);
/** T7.1 step 9's worked line: the first of Sheet N4, its statement. */
const t719Row = () => $('[data-reg="RR-UPD N4"] [aria-label="Your answer, row 1"]');
/** T11.1 step 5's worked row: the click rate, the first metric. */
const t1115Row = () => oblCell("Target", 1);
/** T11.2 step 13's row: the change, the only one. */
const t11213Row = () => oblCell("New-technology note (Ref-Change types)", 1);
/** T5.1 step 7's row: the seventh control, the only one of sheet 2. */
const t517Row = () => $('[data-reg="PBC-EXTRA"] [aria-label="Sample (R15), row 1"]');
/** T3.1 step 3's worked row: the one holding Section 2.1's first line, else the step's first row. */
const t313Row = () => oblCells().find((el) => /Registration of Data Processing/.test(el.value)) ?? oblFirst();
/** T3.1 step 4's worked row: the first contract row with its requirement chosen, else the step's first row. */
const t314Row = () => oblCells().find((el) => cellIn(el)) ?? oblFirst();
const POL000_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-000"]';
const ERM_WINDOW = 'section[role="dialog"][aria-label^="BKB-ERM-001"]';
const TRANSLATOR_WINDOW = 'section[role="dialog"][aria-label*="Business Risk Translator"]';
const OP_WINDOW = 'section[role="dialog"][aria-label^="Organization_Profiles"]';
const PAGE_WINDOW = (id: string) => `section[role="dialog"][aria-label="${id}"]`;
/** Learn › a screen of its menu, by name: the two clicks from the toolbar. */
const openLearn = (screen: string, what: string, win: string): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: `**Learn** carries the dot: ${screen} is in its menu. Click **Learn**.`,
    getEl: () => $('[data-guide-section="learn"]'),
    waitFor: () => !!$('[data-guide-menu="learn"]'),
    skip: () => !!$('[data-guide-menu="learn"]'),
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
    body: `Click **${id}**. It is tagged Step ${n}.`,
    tips: [
      { kind: "note", text: "Drag its window aside if it covers the table." },
    ],
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
/** Click Check my answers, with the reference page closed on a phone, where the verdict would land under it. */
/** "Your rows lock then, so check them first." said once, as the card's Avoid box. */
const LOCK = / Your (rows|lines|values) lock then, so (?:check|look|read) them (?:over )?first\./;
const locked = (body: string): Pick<TourStep, "body" | "tips"> => {
  const m = body.match(LOCK);
  return m ? { body: body.replace(LOCK, ""), tips: [{ kind: "avoid", text: `checking too early. Your ${m[1]} lock once checked, so look them over first.` }] } : { body };
};
const checkBeside = (win: string, body: string): TourStep => ({
  title: "Then check your answers",
  icon: "check",
  ...locked(body),
  onEnter: () => { if (innerWidth <= 700) $(`${win} button[aria-label^="Close"]`)?.click(); },
  getEl: () => $('[data-guide="check-rows"]'),
});
const extraCell = (col: string, row: number) => $(`[data-reg="OBL-EXTRA"] [aria-label="${col}, row ${row}"]`);
const mapXCell = (col: string) => $(`[data-reg="MAP-EXTRA"] [aria-label="${col}, row 1"]`);
const finish = (body: string): TourStep => ({ title: "Finish here", icon: "check", body, getEl: () => $('[data-guide="mark-complete"]') });

/** T3.2: a toolbar section's screen, by name: the two clicks from the toolbar. */
const openScreen = (sec: string, label: string, screen: string, what: string, win: string): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: `**${label}** carries the dot: ${screen} is in its menu. Click **${label}**.`,
    getEl: () => $(`[data-guide-section="${sec}"]`),
    waitFor: () => !!$(`[data-guide-menu="${sec}"]`),
    skip: () => !!$(`[data-guide-menu="${sec}"]`),
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
const MTF_WINDOW = 'section[role="dialog"][aria-label^="Policies › Map to Framework"]';
const FRAMES_WINDOW = 'section[role="dialog"][aria-label*="Sentence frames"]';
const openCrosswalk = (what: string) => openScreen("frameworks", "Frameworks", "Crosswalk View", what, XW_WINDOW);
/** Policies › Policy Library › a document: the dot, the library, the document. */
const openLib = (n: number, code: string, what: string, win: string): TourStep[] => [
  ...openScreen("policies", "Policies", "Policy Library", `The library is tagged Step ${n}.`, LIBRARY_WINDOW),
  {
    title: `Open ${code}`,
    icon: "book",
    body: `Click **${code}**. ${what} is tagged Step ${n}.`,
    getEl: () => $(`${LIBRARY_WINDOW} [data-doc="${code}"]`),
    waitFor: () => !!$(win),
    doIt: `Click ${code}`,
  },
];
const POLICY_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-0"]';
/** The first input of a register column that is still open on this step. */
/** Rule L06's row in Learn › Reference pages › Ref-Rules (Rule tables shortens it). */
const l06Row = () => [...document.querySelectorAll<HTMLElement>(`${PAGE_WINDOW("Ref-Rules")} tr`)].find((tr) => /^\s*L06\b/.test(tr.innerText)) ?? null;
const firstInput = (col: string) => $(`[data-guide="register"] [aria-label^="${col}, row "]`);

const POL006_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-006"]';
const POL001_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-001"]';
const CHARTER_WINDOW = 'section[role="dialog"][aria-label^="Charter"]';
const POL021_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-021"]';
const ADD36_WINDOW = 'section[role="dialog"][aria-label^="BKB-ADD-36"]';
/** T9.1: Vendors › Vendor Intake (Lumen's form) and the supplier policy. */
const VEN_INTAKE_WINDOW = 'section[role="dialog"][aria-label^="Vendors › Vendor Intake"]';
const BANK_WINDOW = 'section[role="dialog"][aria-label^="Vendors › Send Questionnaire"]';
const POL013_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-013"]';
/** T9.2: Vendors › SOC Report Review (Lumen's SOC 2 report summary). */
const SOC_WINDOW = 'section[role="dialog"][aria-label^="Vendors › SOC Report Review"]';
const FLAG_WINDOW = 'section[role="dialog"][aria-label^="Vendors › Flag Risk"]';
/** T10.1: the data-protection policy, the processing description and LearnTech's asset register. */
const POL017_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-017"]';
const ROPA_WINDOW = 'section[role="dialog"][aria-label^="Regulatory Watch › RoPA & Data Flows"]';
const ASSET_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Asset Register"]';
/** T10.2: the incident record of INC-2610-3001 and the incident policy. */
const BRC_WINDOW = 'section[role="dialog"][aria-label^="Regulatory Watch › Breach Clock Calculator"]';
const POL014_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-014"]';
const REGTRACK_WINDOW = 'section[role="dialog"][aria-label^="Regulatory Watch › Regulation Tracker"]';
/** T11.1: the content bank (Awareness › Content Templates) and the awareness policy. */
const CT_WINDOW = 'section[role="dialog"][aria-label^="Awareness › Content Templates"]';
const POL020_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-020"]';
const PLANNER_WINDOW = 'section[role="dialog"][aria-label^="Awareness › Phishing Campaign Planner"]';
const RESULTS_WINDOW = 'section[role="dialog"][aria-label^="Awareness › Campaign Results"]';
/** A select of the register in hand holds the value the source gives (the learner's first item, worked out). */
const selIs = (col: string, row: number, want: string) => !!want && (oblCell(col, row) as HTMLSelectElement | null)?.value === want;
/** BKB-POL-021 Section 6.1, line `row`, column `col` ("" until the document is loaded). */
const pol021At = (row: number, col: number) => docTable("BKB-POL-021", "6.1")?.[row - 1]?.[col] ?? "";
/** The time limit of Section 6.1 line `row`: after the dash, capitalised as the SOP writes it. */
const limitAt = (row: number) => { const x = (pol021At(row, 3).split(" — ")[1] ?? "").trim(); return x.charAt(0).toUpperCase() + x.slice(1); };

/** T5.1: the windows its steps read, and a few of their parts. */
const PBC_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Audit Requests"]';
const REQ_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Request Evidence"]';
const POL016_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-016"]';
/** The step's own note beside the register. Where it quotes the rule the step uses, the guide reads the rule there
 *  and opens no Rule tables window: the window covered the note and said the same thing (owner, 16 Nov 2026). */
const STEP_NOTE = '[data-guide="step-note"]';
const RULES_WINDOW = 'section[role="dialog"][aria-label*="› Rule tables"]';
const GLOSSARY_WINDOW = 'section[role="dialog"][aria-label*="› Glossary"]';
const CARD_WINDOW = PAGE_WINDOW("Ref-Certification card");
/** T6.1: the windows its steps read. */
const START_WINDOW = 'section[role="dialog"][aria-label^="Access Reviews › Start Review"]';
const UARPLAN_WINDOW = PAGE_WINDOW("Ref-UAR test plan");
const UCODES_WINDOW = PAGE_WINDOW("Ref-UAR codes");
/** T6.1 step 8: Sheet 4, a Type cell of it, the Compliance Manager's message, the Tech Lab, and the panel's jobs. */
const SHEET4 = '[data-reg="UAR-EXTRA"]';
const x4 = (row: number) => $(`${SHEET4} [aria-label="Type, or R19 on the last line, row ${row}"]`);
const J3_MSG = '[id="msg-T6.1-J3"]';
const LAB61_WINDOW = 'section[role="dialog"][aria-label^="AppAdmin"]';
const jobState = (id: string) => $(`[data-guide="jobs"] [data-job="${id}"]`)?.dataset.state;
const jobDone = (id: string) => jobState(id) === "done";
const jobNow = (id: string) => jobState(id) === "now";
/** Sheet 4 done: its reference pages are put away, so they cover neither the panel's jobs nor the file names. */
const closeRefPages = () => document.querySelectorAll<HTMLElement>('section[role="dialog"][aria-label^="Ref-UAR"] button[aria-label^="Close"]').forEach((b) => b.click());
/** T6.1 step 3: the account's Result and Attributes failed cells, as recorded. */
const uarResult = (id: string) => {
  const td = evqWalk(id)?.closest("td");
  return [evqWalk(id)?.innerText.trim() ?? "", (td?.nextElementSibling as HTMLElement | null)?.innerText.trim() ?? ""];
};
/** T6.2: the leavers' disable logs, on the screen the task shares with T6.1. */
const TUC_WINDOW = 'section[role="dialog"][aria-label^="Access Reviews › Terminated User Check"]';
const REMEDIATION_WINDOW = 'section[role="dialog"][aria-label^="Access Reviews › Track Remediation"]';
const RESULT_WINDOW = 'section[role="dialog"][aria-label^="Control Testing › Record Result"]';
const RESTORE_WINDOW = 'section[role="dialog"][aria-label^="Control Testing › Restore Test Review"]';
const FINDING_WINDOW = 'section[role="dialog"][aria-label^="Control Testing › Raise Finding"]';
/** T7.1: RRU-EVENTS and the office register, the task's own screens of Risk Register › New Risk and Score Risk. */
const NEWRISK_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › New Risk"]';
const SCORE_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Score Risk"]';
const OWNER_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Assign Owner"]';
const TRACKER_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Mitigation Tracker"]';
const POL010_WINDOW = 'section[role="dialog"][aria-label^="BKB-POL-010"]';
const EXC_WINDOW = 'section[role="dialog"][aria-label^="Policies › Policy Exceptions"]';
const HEAT_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Heat Map"]';
const WAIT_WINDOW = 'section[role="dialog"][aria-label^="Home › Waiting On"]';
const CAL_WINDOW = 'section[role="dialog"][aria-label^="Home › Calendar"]';
/** T6.2 step 4: a leaver's Timeliness and Disabled late in cells, as recorded. */
const lvrResult = (id: string) => uarResult(id);
/** T5.2: Evidence › Evidence Library, opened from the toolbar (dataset EVP-REPO). */
const LIB_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Evidence Library"]';
const IMPORT_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Import Log"]';
const UPLOAD_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Upload Config File"]';
/** A row of a window's table, by the start of its first cell ("R16", "3-year cycle"). */
const rowIn = (win: string, first: string) => [...document.querySelectorAll<HTMLElement>(`${win} tr`)].find((tr) => tr.querySelector("td")?.innerText.trim().startsWith(first)) ?? null;
/** A typed cell of the register in hand holds this value, accepted (not flagged). */
/** A date cell with a "none" tick: ticked. */
const noneIs = (col: string, row: number) => !!($(`[data-guide="register"] [data-none="${col}, row ${row}"]`) as HTMLInputElement | null)?.checked;
const listOf = (v: string) => v.split(";").map((x) => x.trim().toLowerCase()).filter(Boolean).sort().join(";");
const valIs = (col: string, row: number, want: string) => { const v = (oblCell(col, row) as HTMLInputElement | null)?.value.trim() ?? ""; return (v === want || (want.includes(";") && listOf(v) === listOf(want))) && oblCell(col, row)?.getAttribute("aria-invalid") !== "true"; };
const checkAnswers = (body: string): TourStep => ({ title: "Then check your answers", icon: "check", ...locked(body), getEl: () => $('[data-guide="check-rows"]') });
/** A T5.1 decision answered in its row, with the card to read first (steps 10 and 11): the question is the step. */
const cardQuestion = (n: number, what: string, read: TourStep, open: TourStep[] = openPage(n, "Ref-Certification card"), after = "LI-CERT records the card's answer by itself."): TourStep[] => [
  {
    title: "A question first",
    icon: "help",
    body: `${what}`,
    steps: [
      { lead: "Read the situation box first", text: "It holds the facts you decide from." },
      { lead: "Then read all three options", text: "More than one can sound reasonable. Hold each one against the situation's facts." },
    ],
    getEl: () => $(`#act-${n} [data-guide="decision"]`),
  },
  ...open,
  read,
  {
    title: "Pick and check",
    icon: "edit",
    body: "Choose the option you would take, then click **Check my answer**.",
    tips: [
      { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
    ],
    getEl: () => $(`#act-${n} [data-guide="decision"]`),
    pointAt: () => $(`#act-${n} [data-guide="decision-context"]`),
    nextWhen: () => !!$(`#act-${n} [data-guide="decision-result"]`),
    doIt: "Pick an option and click Check my answer",
  },
  {
    title: "Read the feedback",
    icon: "info",
    body: "The feedback opens under the options.",
    steps: [
      { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
      { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
    ],
    getEl: () => $(`#act-${n} [data-guide="decision"]`),
  },
  {
    title: "Finish here",
    icon: "check",
    body: `With the feedback read, click **Mark step complete**. ${after}`,
    getEl: () => $(`#act-${n} [data-guide="step-complete"]`),
  },
  {
    title: "Replay any time",
    icon: "play",
    body: "Click **▶ Show me how** to run this guide again.",
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
/**
 * One cell of a worked row with its real answer (owner, 22 Nov 2026: "guide them to fill one row by giving real answer
 * and how we reach to that answer by reading the document"). `card` is the cell's own waiting card; `steps` is the
 * reading in order, what is read where and the value it gives; `show` is the line of the source the value is read on,
 * brought into view in its window when the card opens.
 */
const rowAnswer = (card: TourStep, steps: NonNullable<TourStep["steps"]>, show?: () => Element | null | undefined, tips?: TourStep["tips"]): TourStep => ({
  ...card,
  steps,
  ...(tips ? { tips } : {}),
  onEnter: () => { card.onEnter?.(); show?.()?.scrollIntoView({ block: "center" }); },
});
/** A cell of a window's table, for `rowAnswer`'s `show`: the row whose first cell starts with `first`, under the heading
 *  that starts with `head`. A wide table in a narrow window is scrolled sideways to it. The row itself where no heading matches. */
const cellAt = (win: string, first: string, head: string): Element | null => {
  const tr = rowIn(win, first);
  const at = [...(tr?.closest("table")?.querySelectorAll<HTMLElement>("thead th") ?? [])].findIndex((th) => th.innerText.trim().toLowerCase().startsWith(head.toLowerCase()));
  return (at < 0 ? null : tr?.querySelectorAll("td")[at]) ?? tr;
};
/** A typed target ("≤ 5 %") as its cell holds it while it is typed: "<=" and ">=" are taken for the signs, and spaces
 *  do not count. The sheet writes the sign only once the box is left, and a card must not wait for that. */
const targetIs = (col: string, row: number, want: string) => {
  const el = oblCell(col, row) as HTMLInputElement | null;
  const n = (x: string) => x.replace("<=", "≤").replace(">=", "≥").replace(/\s+/g, "");
  return !!el && n(el.value) === n(want) && el.getAttribute("aria-invalid") !== "true";
};
/** The first table row of a window that holds `text` in any cell, for `rowAnswer`'s `show` (a log whose rows start with a date). */
const rowWith = (win: string, text: string): Element | null => [...document.querySelectorAll<HTMLElement>(`${win} tbody tr`)].find((tr) => tr.innerText.includes(text)) ?? null;

/** T11.2: the two saved official sources and the reference architecture, each in its own window. */
const SRC1_WINDOW = 'section[role="dialog"][aria-label^="SRC-EC-MINORS-2025"]';
const SRC2_WINDOW = 'section[role="dialog"][aria-label^="SRC-EU-2022-2065"]';
const TECH_WINDOW = 'section[role="dialog"][aria-label^="BKB-TECH-000"]';
/** T12.1: ACT-TRACKER, on Risk Register › Mitigation Tracker. */
const MT_WINDOW = 'section[role="dialog"][aria-label^="Risk Register › Mitigation Tracker"]';
/** T12.2: the repository's index and the mentee's hand-ins. */
const EVLIB_WINDOW = 'section[role="dialog"][aria-label^="Evidence › Evidence Library"]';
const VH_WINDOW = 'section[role="dialog"][aria-label^="Policies › Version History"]';

/**
 * Whether a step's guide starts by itself the first time the step is opened: an Activity step's does (owner,
 * 16 Nov 2026: "in the activity type it should open the guide by default for the first time as before"), and the
 * toolbar's menu waits until that guide has been through. A Decision's guide ("<task>-<n>" of a pick step, or its
 * question's "<task>-<n>q") and a Tech Lab's run from "Show me how" alone.
 */
export const autoGuide = (desk: { tasks: Record<string, { steps: { kind: string }[] }> }, key: string) => {
  const m = key.match(/^(.+)-(\d+)$/);
  return !!m && desk.tasks[m[1]]?.steps[Number(m[2]) - 1]?.kind === "do";
};

export const STEP_GUIDES: Record<string, TourStep[]> = {
  "F1.1-1": [
    {
      title: "Six values to check",
      icon: "table",
      body: "The programme office filled in the **Assignment** table of your Onboarding record. Before you rely on a record someone else filled in, you check it against its source: **Home › My Organisation**.",
      steps: [
        { lead: "Open My Organisation", text: "The next two cards walk you there." },
        { lead: "Compare each value with the screen", text: "Six values, one per row." },
        { lead: "Correct what differs", text: "Type the value the screen shows. Leave a matching value as it is." },
      ],
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My Organisation", ORG_WINDOW, "Step 1"),
    {
      title: "Where each value is",
      icon: "user",
      body: "Every value in the table is on this screen.",
      steps: [
        { lead: "Start date", text: "At the top left." },
        { lead: "Task owners", text: "In the task table beside the start date, one per task." },
        { lead: "Organisation names", text: "On the tabs: **Org A**, **Org B**." },
        { lead: "Your office", text: "On each tab's **Overview**, under **Your office**. Scroll down to it. Not the Legal tab's Head office: that is where the company is registered." },
      ],
      getEl: () => $(ORG_WINDOW),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take the first row.",
      steps: [
        { lead: "Read the name on the **Org A** tab" },
        { lead: "Compare it with the file, word for word", fork: [{ when: "They match", then: "Leave the cell as it is." }, { when: "They differ", then: "Type the name exactly as the screen shows it." }] },
      ],
      getEl: () => firstCell()?.closest("tr") ?? null,
      alsoShow: () => $(ORG_WINDOW),
    },
    {
      title: "Check the other five",
      icon: "edit",
      body: "Do the same for the other five rows: compare each with My Organisation and correct it where it differs. Click **Next** when all six are checked.",
      getEl: () => $('[data-guide="rmf-table"]'),
      alsoShow: () => $(ORG_WINDOW),
    },
    {
      title: "Check your answers",
      icon: "check",
      body: "Click **Check my answers**. Each row then says whether it was right; a row still wrong is flagged with where to read it.",
      getEl: () => $('[data-guide="rmf-check"]') ?? $('[data-guide="rmf-result"]'),
      nextWhen: () => !!$('[data-guide="rmf-result"]'),
      doIt: "Click Check my answers",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Correct any row still flagged. **Mark step complete** unlocks once all six match My Organisation.",
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
        body: "Part 2 is open: the four data rules you agree to keep in every task.",
        steps: [
          { lead: "Read each rule and tick it" },
          { lead: "Click **Save**", text: "Saving is final, so read all four first." },
        ],
        getEl: () => $('#act-3 [data-guide="part-two"]'),
        // waitFor, not nextWhen: Save is one click and final, so the walk moves on by itself once it lands. With nextWhen the
        // card stayed on "Tick all four rules and click Save" after the save (tester, 4 Nov).
        waitFor: () => !!$('#act-3 [data-guide="part-two"] [data-saved]'),
        pointAt: () => $('#act-3 [data-guide="attest-save"]'),
        doIt: "Tick all four rules and click Save",
      },
      {
        title: "Last, sign the undertaking",
        icon: "file",
        body: "With the rules saved, you sign the undertaking.",
        steps: [
          { lead: "Click **Open and sign**", text: "The undertaking opens as a letter. Read it." },
          { lead: "Type your full name and mentee ID", text: "Your mentee ID is in the letter's address." },
          { lead: "Sign in the box, then click **Sign**", text: "From step 4 on, you work with data." },
        ],
        getEl: () => $('#act-3 [data-guide="part-two"]'),
      },
    ],
    "This button unlocks once the rules are saved and the undertaking is signed.",
    false,
  ),

  // The question was answered in the step's row (the file opens only then); here, the Folders table.
  "F1.1-4": [
    {
      title: "Now four paths",
      icon: "table",
      body: "Your answer is in. Part 2 is the **Folders** table of your Onboarding record: the full path of each of your four task folders, as **Home › My Tasks** shows them.",
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My Tasks", TASKS_WINDOW, "Step 4"),
    {
      title: "Where the paths are",
      icon: "grid",
      body: "Under **F1.1 · your folders**, each folder's name is followed by its full path. Every path starts with your mentee ID.",
      getEl: () => $(`${TASKS_WINDOW} [data-guide="folders"]`) ?? $(TASKS_WINDOW),
    },
    {
      title: "Fill the first row",
      icon: "edit",
      body: "Find the line **00_Admin — signed forms** in My Tasks. Its path is your mentee ID and then the folder: **/your mentee ID/00_Admin**, with no week and no task in it. Choose that path in the first row.",
      tips: [{ kind: "note", text: "The other three paths are longer: they carry the week and the task, such as /W01/F1.1/." }],
      getEl: () => firstCell()?.closest("td") ?? null,
      alsoShow: () => $(TASKS_WINDOW),
      nextWhen: firstRowRight,
      doIt: "Choose the 00_Admin path in the first row",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Choose the other three paths the same way. **Mark step complete** unlocks once all four match My Tasks.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.1-5": [
    {
      title: "Three dates to check",
      icon: "calendar",
      body: "The **Week 1 dates** table holds the due dates of F1.2, F1.3 and the knowledge check KC-01, filled in for you. The programme sets every due date in **Home › My plan**: check the file against it.",
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My plan", PLAN_WINDOW, "Step 5"),
    {
      title: "Where the dates are",
      icon: "calendar",
      body: "Every task and test has a row. Find **F1.2**, **F1.3** and **KC-01**; the date is in the **Due** column.",
      getEl: () => $(`${PLAN_WINDOW} [data-guide="plan"]`) ?? $(PLAN_WINDOW),
    },
    {
      title: "Check all three",
      icon: "edit",
      body: "Compare each date with the **Due** column of its row in My plan. The file writes Mon 05 Oct 2026 as **05-OCT-2026**. Where a date differs, pick the one My plan shows, then click **Next**.",
      getEl: () => $('[data-guide="rmf-table"]'),
      alsoShow: () => $(PLAN_WINDOW),
    },
    {
      title: "Check your answers",
      icon: "check",
      body: "Click **Check my answers**. Each date then says whether it was right; one still wrong is flagged with where to read it.",
      getEl: () => $('[data-guide="rmf-check"]') ?? $('[data-guide="rmf-result"]'),
      nextWhen: () => !!$('[data-guide="rmf-result"]'),
      doIt: "Click Check my answers",
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. This message has landed in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "The step cannot be completed until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Correct any date still flagged and reply to the message. **Mark step complete** unlocks once all three dates match My plan and the message is answered.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // Handing the file in.
  "F1.1-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is your Onboarding record, with the three tables you filled in steps 1, 4 and 5. This step saves it in **02_Working** under its own name and submits it.",
      getEl: () => $('[data-guide="rmf-file"]'),
    },
    ...nameAndSubmit("docx", "1 to 5"),
  ],

  // Finding in the worked rows: what a finished row looks like, before you fill your own.
  "F1.2-1": [
    {
      title: "Finished rows",
      icon: "table",
      body: "These are LearnTech's rows, filled in for you. Your own GlobalConnect rows must end up looking like these. The tinted columns, **D to G**, are the ones still empty on yours.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right is answered by one cell in these rows. Answer by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "GDPR (EU) has a row. Its instrument type is in **column D**. Click that cell.",
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
      body: "Find the rule in **column F** and the source in **column G** the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once all three are found.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // Applying rule R01 to one worked row, the way step 3 applies it to every row of yours.
  "F1.2-2": [
    {
      title: "One worked row",
      icon: "table",
      body: "The lit row is **ISO/IEC 27001:2022**. Its type in column D is Certifiable standard. This step shows how that type was reached.",
      getEl: () => $('[data-guide="ladder-row"]'),
    },
    {
      title: "Rule R01",
      icon: "help",
      body: "Rule **R01** decides an instrument type.",
      steps: [
        { lead: "Ask its questions in order", text: "Start at question 1." },
        { lead: "Stop at the first Yes", fork: [{ when: "If Yes", then: "Stop. That question gives the type." }, { when: "If No", then: "Go on to the next question." }] },
      ],
      getEl: () => $('[data-guide="ladder"]'),
    },
    {
      title: "Answer question 1",
      icon: "edit",
      body: "Answer question 1 for ISO/IEC 27001: was it made by a parliament or a regulator? ISO is a standards body, neither of those, so click **No**. A wrong answer explains itself.",
      getEl: () => $('[data-guide="ladder"] li[data-q="0"]'),
      // At the question's number, never at Yes or No: the cursor must not suggest an answer. Not the middle of its
      // text either: the cursor's body then lay over the No button and hid the words being read.
      pointAt: () => $('[data-guide="ladder"] li[data-q="0"] > span'),
      nextWhen: () => !!$('[data-guide="ladder"] li[data-q="1"]'),
      doIt: "Answer question 1",
    },
    {
      title: "Answer question 2",
      icon: "edit",
      body: "Question 2: can an organisation get a certificate? Yes: an accredited body certifies an organisation against ISO/IEC 27001. Click **Yes**. Once you answer Yes, you stop: that is how R01 works.",
      getEl: () => $('[data-guide="ladder"] li[data-q="1"]'),
      // At the question's number, never at Yes or No: the cursor must not suggest an answer. Not the middle of its
      // text either: the cursor's body then lay over the No button and hid the words being read.
      pointAt: () => $('[data-guide="ladder"] li[data-q="1"] > span'),
      nextWhen: () => !!$('[data-guide="ladder-done"]'),
      doIt: "Answer question 2",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "The row's type now has a reason. Click **Mark step complete**; step 3 asks the same questions for each of your own rows.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The per-row decision, made once, in the table, with rule R01 on hand.
  "F1.2-3": [
    {
      title: "Your nine rows",
      icon: "table",
      body: "These are GlobalConnect's standards. For each one you choose its instrument type in **column D**. That is all this step asks.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Follow the orange dot",
      icon: "info",
      body: "An orange dot in the toolbar marks a place this step uses. **Learn** carries the dot: its **Framework Quick Reference** says what kind of instrument each standard is. Click **Learn**.",
      getEl: () => $('[data-guide-section="learn"]'),
      waitFor: () => !!$('[data-guide-menu="learn"]'),
      skip: () => !!$('[data-guide-menu="learn"]'),
      doIt: "Click Learn",
    },
    {
      title: "Open Framework Quick Reference",
      icon: "grid",
      body: "Click **Framework Quick Reference**. It is tagged Step 3.",
      getEl: () => $('[data-guide-menu="learn"] li[data-target] button'),
      waitFor: () => !!$(QR_WINDOW),
      doIt: "Click Framework Quick Reference",
    },
    {
      title: "An example",
      icon: "book",
      body: "Your first row is ISO/IEC 27001. The Quick Reference calls it \"a certifiable management-system standard\".",
      steps: [
        { lead: "Ask R01 question 1", text: "The answer is No, so go on." },
        { lead: "Ask question 2: can an organisation get a certificate?", text: "Yes. Stop there: its type is **Certifiable standard**." },
      ],
      getEl: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001"]`),
      // The list is long: bring the entry into its own window's view first.
      onEnter: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001"]`)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "Pick it for row 1",
      icon: "edit",
      body: "Choose **Certifiable standard** in column D of the ISO/IEC 27001 row. Column F then records **R01**, the rule you used, by itself.",
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
      body: "Do the same for each of the other eight rows.",
      steps: [
        { lead: "Find the standard in the Quick Reference" },
        { lead: "Ask R01's questions in order", text: "Stop at the first Yes." },
        { lead: "Choose that type in column D" },
      ],
      tips: [
        { kind: "avoid", text: "choosing from the standard's name. Read what the Quick Reference says it is." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row has a type, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row (the register opens only then); here, column E.
  "F1.2-4": [
    {
      title: "Now column E",
      icon: "table",
      body: "Your answer is in. Part 2 is **column E**: the offices each standard applies to. They are in **BKB-ADD-16 Section 2**, one row per office. Open it first.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Follow the orange dot",
      icon: "info",
      body: "**Policies** carries the dot: BKB-ADD-16 is in its Policy Library. Click **Policies**.",
      getEl: () => $('[data-guide-section="policies"]'),
      waitFor: () => !!$('[data-guide-menu="policies"]'),
      skip: () => !!$('[data-guide-menu="policies"]'),
      doIt: "Click Policies",
    },
    {
      title: "Open the Policy Library",
      icon: "grid",
      body: "Click **Policy Library**. It is tagged Step 4.",
      getEl: () => $('[data-guide-menu="policies"] li[data-target] button'),
      waitFor: () => !!$(LIBRARY_WINDOW),
      doIt: "Click Policy Library",
    },
    {
      title: "Open BKB-ADD-16",
      icon: "book",
      body: "Click **BKB-ADD-16**, your organisation's addendum. It is tagged Step 4.",
      getEl: () => $(`${LIBRARY_WINDOW} [data-doc="BKB-ADD-16"]`),
      waitFor: () => !!$(ADD16_WINDOW),
      doIt: "Click BKB-ADD-16",
    },
    {
      title: "An example",
      icon: "book",
      body: "Section 2 has one row per office. Here is how one standard is placed:",
      steps: [
        { lead: "Find the standard in an office's row", text: "The Manila row names the Data Privacy Act 2012: that is your DPA 2012." },
        { lead: "Check the other offices' rows", text: "No other row names it, so DPA 2012 applies to Manila only." },
        { lead: "Choose the office in column E", text: "DPA 2012's column E reads **Manila**." },
      ],
      getEl: () => $(`${ADD16_WINDOW} [data-sec="2"]`),
      onEnter: () => $(`${ADD16_WINDOW} [data-sec="2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Fill the DPA 2012 row",
      icon: "edit",
      body: "Choose **Manila** in column E of the DPA 2012 row. Next unlocks once it is chosen.",
      getEl: () => famCell("E Offices (R02)", 2)?.closest("td") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      onEnter: () => famCell("E Offices (R02)", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => cellIn(famCell("E Offices (R02)", 2)) && (famCell("E Offices (R02)", 2) as HTMLInputElement).value.trim().toLowerCase() === "manila",
      doIt: "Choose Manila for DPA 2012",
    },
    {
      title: "Where Section 2 names no office",
      icon: "book",
      body: "Some Mandatory standards are in no office's row of Section 2.",
      steps: [
        { lead: "Go to Section 3", text: "It lists every standard with an **Applies to** column that says where each one holds." },
        { lead: "Use the jump buttons", text: "The **Section 2** and **Section 3** buttons at the top of the document take you to each." },
      ],
      getEl: () => $(`${ADD16_WINDOW} [data-sec="3"]`),
      onEnter: () => $(`${ADD16_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Now the others",
      icon: "check",
      body: "Fill column E for the other Mandatory rows from Section 2, or from Section 3 where Section 2 names no office. Separate several cities with \"; \". The Optional rows are filled for you.",
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => $(ADD16_WINDOW),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Column F records **R02** by itself as you fill each row. Once every row has its offices, click **Check my answers**: it shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked." },
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],


  // Step 5 is its question only, answered in its row from the Group's definition in Learn › Glossary.
  "F1.2-5": [
    {
      title: "A question",
      icon: "help",
      body: "This step is a question: which **evidence ref** another person could rely on.",
      steps: [
        { lead: "Read the situation box" },
        { lead: "Then read all three options" },
      ],
      tips: [
        { kind: "unsure", text: "The Group's definition of an evidence ref is in **Learn › Glossary**." },
      ],
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    ...openLearn("Glossary", "The Group's working terms, one line each.", GLOSSARY_WINDOW),
    {
      title: "Evidence ref",
      icon: "book",
      body: "Read what an evidence ref must hold. Then hold each of the three options against it: the one that gives everything it must hold is the one another person can rely on.",
      getEl: () => $(`${GLOSSARY_WINDOW} [data-term="Evidence ref"]`) ?? $(GLOSSARY_WINDOW),
      onEnter: () => $(`${GLOSSARY_WINDOW} [data-term="Evidence ref"]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
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
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Click **Mark step complete**. Column G of every row is then written for you: the section of BKB-ADD-16 each row's offices were read from.",
      getEl: () => $('#act-5 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Click **▶ Show me how** to run this guide again.",
      getEl: () => $('#act-5 [data-guide="show-me-how"]'),
    },
  ],

  // Checking the map, then handing it in.
  "F1.2-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is your **FAM-MAP**: columns D to G of your nine rows, as you filled them in steps 3 to 5. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review. Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5"),
  ],

  // Checking the worked section against its source: order, exact words, the Source line.
  "F1.3-1": [
    {
      title: "Section 1 is done for you",
      icon: "file",
      body: "This is your context brief. **Section 1, Services**, was copied for you from BKB-ADD-16 Section 1.1. It shows how you copy sections 2 to 4: check it against the addendum.",
      getEl: () => $('[data-guide="brief-worked"]'),
    },
    ...openAddendum(1),
    {
      title: "Side by side",
      icon: "book",
      body: "Section 1.1 lists the services. Section 1 of your brief must have the same lines, in the same order, word for word.",
      ...addSec("1.1"),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Answer the first question by clicking a line of Section 1.",
      steps: [
        { lead: "Count down Section 1.1 to its fifth service", text: "Inbound and outbound customer service, Technical support and helpdesk, Collections and credit management, Healthcare claims support (US clients), then the fifth: Financial services support (KYC, fraud)." },
        { lead: "Click **Financial services support (KYC, fraud)** in Section 1 of the brief", text: "This first question is worked for you. The other two are yours: a wrong line turns amber and the question gives a hint." },
      ],
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
      body: "Answer the other two questions the same way, by clicking a line of Section 1.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once all three are found. Sections 2 to 4 are copied to the same standard.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.3-2": [
    {
      title: "Section 2: a draft to check",
      icon: "file",
      body: "A colleague started Section 2 and nobody has checked it. Before a draft goes into a brief others rely on, you check it against its source: **BKB-ADD-16 Section 9**. Open the addendum first.",
      getEl: briefSec,
    },
    ...openAddendum(2),
    {
      title: "Where the list is",
      icon: "book",
      body: "Section 9 opens with a two-column table. You check against the right-hand column, **Client data handled**: one item per bullet.",
      ...addSec("9"),
    },
    {
      title: "How to check a line",
      icon: "search",
      body: "Take line 1.",
      steps: [
        { lead: "Read the first bullet of Client data handled" },
        { lead: "Compare it with the draft, word for word", text: "Brackets included.", fork: [{ when: "They match", then: "Leave the line." }, { when: "They differ", then: "Type what Section 9 says." }] },
      ],
      getEl: () => $('[data-guide="brief-section"] textarea'),
      alsoShow: () => $(ADD16_WINDOW),
    },
    {
      title: "The rest, then the source",
      icon: "edit",
      body: "Finish the list, then say where it came from.",
      steps: [
        { lead: "Check every other line, in order" },
        { lead: "Fill the **Source** line", text: "Name the document and section you checked against." },
      ],
      tips: [
        { kind: "note", text: "Click **Next** when both are done." },
      ],
      getEl: briefSec,
      alsoShow: () => $(ADD16_WINDOW),
    },
    briefCheckCard,
    {
      title: "Finish here",
      icon: "check",
      body: "Correct any line still flagged. **Mark step complete** unlocks once the list matches Section 9 and the Source line is in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.3-3": [
    {
      title: "Section 3: a draft to check",
      icon: "file",
      body: "Section 3 holds five values about your home office's law, drafted by a colleague. Their source is one row of **BKB-ADD-16 Section 2**. Open the addendum first.",
      getEl: briefSec,
    },
    ...openAddendum(3),
    {
      title: "Your office's row",
      icon: "book",
      body: "Section 2 has one row per office. Yours is **Manila, Philippines**, the first row. Under each line of your Section 3 is the column it comes from: Law is **Data-protection law**, Breach clock is **Breach notification**, and so on.",
      ...addSec("2"),
    },
    {
      title: "How to check a line",
      icon: "search",
      body: "Take the **Law** line.",
      steps: [
        { lead: "Read your row's Data-protection law" },
        { lead: "Compare it with the draft, word for word", fork: [{ when: "They match", then: "Leave the line." }, { when: "They differ", then: "Type what your row says." }] },
      ],
      getEl: () => $('[data-guide="brief-section"] input[aria-label="Law"]')?.closest("div") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
    },
    {
      title: "The other four, then the source",
      icon: "edit",
      body: "Finish the section, then say where it came from.",
      steps: [
        { lead: "Check the other four lines", text: "Always in your own office's row." },
        { lead: "Fill the **Source** line", text: "Name the document and section you checked against." },
      ],
      tips: [
        { kind: "avoid", text: "reading across into another office's row. Every value comes from Manila's row." },
        { kind: "note", text: "These values come back in week 3 (obligations) and week 10 (breach clocks)." },
      ],
      getEl: briefSec,
      alsoShow: () => $(ADD16_WINDOW),
    },
    briefCheckCard,
    {
      title: "Finish here",
      icon: "check",
      body: "Correct any line still flagged. **Mark step complete** unlocks once all five lines match your row and the Source line is in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, section 4.
  "F1.3-4": [
    {
      title: "Now section 4",
      icon: "file",
      body: "Your answer is in. Part 2 is **Section 4**: your office's Mission Critical assets. **BKB-ADD-16 Section 8.1** lists them, each with its office.",
      getEl: briefSec,
    },
    ...openAddendum(4),
    {
      title: "Where the assets are",
      icon: "book",
      body: "Each row of Section 8.1 is one asset with its **Office**. Copy the Asset of every row whose Office is **Manila, Philippines**.",
      tips: [
        { kind: "avoid", text: "copying the other offices' rows. They are not yours." },
      ],
      ...addSec("8.1"),
    },
    {
      title: "Copy the first one",
      icon: "edit",
      body: "The first Manila asset, worked. The other Manila assets are yours.",
      steps: [
        { lead: "Read down the **Office** column of Section 8.1's table", text: "The rows that read Manila, Philippines are your office's." },
        { lead: "Take the first of them", text: "Its Asset cell reads Treasury management system." },
        { lead: "Type **Treasury management system**", text: "Exactly as written, on the first line of the box. Next unlocks once it is in." },
      ],
      getEl: () => $('[data-guide="brief-section"] textarea'),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: firstLineRight,
      doIt: "Type the first Manila asset",
    },
    {
      title: "The rest, then the source",
      icon: "check",
      body: "Finish the list, then say where it came from.",
      steps: [
        { lead: "Copy every other Manila asset, one per line", text: "A line that is not a Manila asset of Section 8.1, or is listed twice, is flagged." },
        { lead: "Fill the **Source** line", text: "Type **BKB-ADD-16 Section 8.1**." },
      ],
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once the list and its Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, CTX-IP.
  "F1.3-5": [
    {
      title: "Now CTX-IP",
      icon: "table",
      body: "Your answer is in. Part 2 is **CTX-IP**: the interested parties, each with what it requires, copied from **BKB-ADD-16 Section 4** (rule R04).",
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
      body: "Row 1 takes the first party of Section 4's table. Its first column, Interested party group, starts with **Stakeholders / customers**. Choose that in **Party**, row 1.",
      tips: [{ kind: "avoid", text: "the lists of Section 4.1 below. They name people and bodies, not the five party groups." }],
      getEl: () => ipCell("Party", 1)?.closest("td") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      onEnter: () => ipCell("Party", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => cellIn(ipCell("Party", 1)),
      doIt: "Choose the first party",
    },
    rowCell("Internal or external", "Internal/External", () => ipCell("Party", 1), "Stay on the Stakeholders / customers row of Section 4. Its Internal / External column reads **External**: customers are outside the organisation. Choose **External** in **Internal/External**.", {
      alsoShow: () => $(ADD16_WINDOW),
    }),
    {
      title: "Its requirements",
      icon: "edit",
      body: "The same row's Requirements column lists three, one per bullet. Type all three in **Requirement**, word for word, with \"; \" between them: **Quality scores (CSAT, NPS); Data security for client customer data; Operational uptime and staffing**.",
      tips: [{ kind: "note", text: "**Rule** records R04 by itself." }],
      getEl: () => ipCell("Requirement", 1)?.closest("td") ?? null,
      alsoShow: () => $(ADD16_WINDOW),
      onEnter: () => ipCell("Requirement", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => cellIn(ipCell("Requirement", 1)),
      doIt: "Copy the first party's requirements",
    },
    rowCell("Its standard or law", "Standard/law", () => ipCell("Party", 1), "Still the same row of Section 4. Its last column, Standard / law, reads **Client contracts (MSA and data-protection agreement)**: what customers require is set in their contracts, not in a law. Choose that entry in **Standard/law**.", {
      tips: [{ kind: "note", text: "That is one full row." }],
      alsoShow: () => $(ADD16_WINDOW),
    }),
    {
      title: "Now the others",
      icon: "check",
      body: "Fill rows 2 to 5 the same way: one party per row, in Section 4's order, each with the four values of its own row.",
      tips: [
        { kind: "note", text: "**Rule** and **Evidence ref** fill themselves: every row comes from Section 4." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once all five rows match Section 4.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // Finding in the worked rows: the parts every finished row has, before you walk your own.
  "F2.1-1": [
    {
      title: "Two finished rows",
      icon: "table",
      body: "These are the worked rows of **CLS-6**, A-01 and A-02, filled in for you. Your six rows, A-03 to A-08, must end up with the same parts. The tinted columns are the ones still empty on yours.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right is answered by one cell in these two rows. Answer by clicking that cell.",
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
      body: "Find the path and the fact the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once all three are found. In step 2 you fill the same parts for your own rows.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The per-row decision: the Section 5 tree walked for each row, beside the table.
  "F2.1-2": [
    {
      title: "Your six rows",
      icon: "table",
      body: "These are your assets, A-03 to A-08, with the facts the tree is answered from. For each one you walk the decision tree; the path you take and the tier it gives fill the two tinted columns.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The tree, beside the table",
      icon: "help",
      body: "This card asks the questions of BKB-STD-001 Section 5 **one at a time, in order**. Your answers decide the row's Group tier. For each row:",
      steps: [
        { lead: "Read the highlighted row first", text: "Its Description, Personal / regulated data and Asset criticality are the only facts you answer from." },
        { lead: "Read the question on this card", text: "Only one shows at a time, starting with Q1. Read all of it before answering." },
        { lead: "Answer Yes or No from the row's facts", text: "Ask: what does the row say about this?", fork: [{ when: "If Yes", then: "Stop. Click the **Record** button that appears: it fills the row's path and tier." }, { when: "If No", then: "The next question appears. Repeat this step." }] },
        { lead: "All answers No? Record Tier 2", text: "Tier 2 is the default when no question gets a Yes.", mark: "default" },
        { lead: "Move to the next row", text: "The walk moves on by itself once the row's path and tier are filled.", mark: "stop" },
      ],
      tips: [
        { kind: "avoid", text: "answering from the asset's name, your own guess, or jumping ahead. The order matters, because the first Yes decides the tier." },
        { kind: "unsure", text: "Click **Show the 2 worked rows** under the table: A-01 and A-02 show a complete walk, answer by answer." },
      ],
      getEl: () => $('[data-guide="tree"]'),
    },
    {
      title: "An example",
      icon: "book",
      body: "The pack's own example: a press release published on the website has been approved for release, so question 1 is **Yes**. Its path is **Q1 Yes → Tier 1**, and nothing more is asked.",
      getEl: () => $('[data-guide="tree"] li[data-q="0"]'),
    },
    ...openGroupDoc(2, "BKB-STD-001", "The classification standard", STD_WINDOW),
    {
      title: "What question 4 asks",
      icon: "book",
      body: "Question 4 asks about harm \"per Section 3.1\".",
      steps: [
        { lead: "Read Section 3.1", text: "It sets the thresholds: financial loss, individuals affected, regulatory, safety and reputation." },
        { lead: "Use Section 3 for examples", text: "Just above it, Section 3 gives examples of each tier." },
      ],
      tips: [
        { kind: "note", text: "Drag the window aside to keep it open while you walk." },
      ],
      ...stdSec("3.1"),
    },
    {
      title: "Walk A-03",
      icon: "edit",
      body: "**A-03** is lit: Regional contracts repository. Answer each question from its row:",
      steps: [
        { lead: "Q1, Q2 and Q3: **No**", text: "Contracts are not approved for public release. The row names no national-security marking. **Personal / regulated data** says No, and a contract is not a privileged legal matter." },
        { lead: "Q4: **Yes**", text: "The Description says \"Disclosure would breach client contracts\". That is what question 4 asks." },
        { lead: "Record **Tier 3**", text: "Not Tier 4: Section 3.1's Tier 4 column lists fines and the loss of major clients, and the row names neither." },
      ],
      tips: [{ kind: "note", text: "Next unlocks once A-03's row shows Tier 3." }],
      getEl: () => $('[data-guide="tree-row"]'),
      // At the question's number, never at Yes or No: the cursor must not suggest an answer. Not the middle of its
      // text either: the cursor's body then lay over the No button and hid the words being read.
      pointAt: () => $('[data-guide="tree-row"] li[data-q="0"] > span'),
      nextWhen: () => /Tier 3/.test($('[data-guide="register"] [aria-label="Walk the tree for A-03"][data-walked]')?.closest("tr")?.innerText ?? ""),
      doIt: "Answer the questions for A-03",
    },
    {
      title: "Now the other five",
      icon: "check",
      body: "Walk A-04 to A-08 the same way; the walk moves to the next row by itself.",
      tips: [
        { kind: "note", text: "A-07 and A-08 say \"See description\": their facts are in the Description column." },
        { kind: "unsure", text: "To walk a row again, click its path in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all six rows have a tier, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, the R05 floor checked on every row.
  "F2.1-3": [
    {
      title: "Now the R05 check",
      icon: "table",
      body: "Your answer is in. Part 2 is rule **R05**, a floor: personal data or credentials are never below Tier 3, whatever the tree said. For each row, say whether it holds either.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Check A-03",
      icon: "edit",
      body: "Read A-03's own row. Its **Personal / regulated data** cell says No, and its **Description** names contracts and legal documents: no people's data, no passwords or keys. So choose **No** for A-03.",
      tips: [
        { kind: "avoid", text: "answering from the tier the tree gave. A-03 is Tier 3 because of its contracts, and R05 asks only whether the row holds personal data or credentials." },
        { kind: "note", text: "**Rule** records R05 by itself." },
      ],
      getEl: () => r05(3)?.closest("tr") ?? null,
      pointAt: () => r05(3),
      onEnter: () => r05(3)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      nextWhen: () => r05(3)?.value === "No",
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
      body: "Once every row has Yes or No, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F2.1-4": [
    {
      title: "Four items",
      icon: "table",
      body: "At work, a file carries your organisation's **label**: it is what a client or an auditor reads on it. Each of these four items already has its Group tier from its asset owner; you choose the label GlobalConnect uses for that tier. Open the addendum first.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openAddendumBeside(4),
    {
      title: "Where the labels are",
      icon: "book",
      body: "Section 7's first table has one row per Group tier, with GlobalConnect's label beside it.",
      ...addSec("7"),
    },
    {
      title: "Label the first item",
      icon: "edit",
      body: "The first item is the monthly quality-monitoring report for a client.",
      steps: [
        { lead: "Read its **Group tier**", text: "Its row says Tier 3." },
        { lead: "Find that tier's row in Section 7", text: "The row Tier 3 (Confidential) gives the label Client-Confidential." },
        { lead: "Choose **Client-Confidential**", text: "Not Confidential: that is the Group's word for the tier, and the item carries GlobalConnect's own label." },
      ],
      getEl: () => labelCell(1)?.closest("tr") ?? null,
      pointAt: () => labelCell(1),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => !!labelCell(1)?.value && labelCell(1)!.value === docTable("BKB-ADD-16", "7")?.find((r) => r[0].startsWith("Tier 3"))?.[1],
      doIt: "Choose the first item's label",
    },
    {
      title: "Now the other three",
      icon: "check",
      body: "Label the other three the same way, each from the row of its own tier.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all four have a label, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked and any message at this step has your reply.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, table 2 of CLS-RES.
  "F2.1-5": [
    {
      title: "Now the transmission rule",
      icon: "file",
      body: "Your answer is in. Part 2 is the transmission rule: how Tier 3 and Tier 4 may be sent outside GlobalConnect. You copy it from the handling matrix, **BKB-STD-001 Section 6**. Open it first.",
      getEl: briefSec,
    },
    ...openGroupDoc(5, "BKB-STD-001", "The classification standard", STD_WINDOW),
    {
      title: "Where the values are",
      icon: "book",
      body: "Section 6 has one row per activity and one column per tier. Find the row **External transmission**: a file sent to a partner leaves GlobalConnect.",
      ...stdSec("6"),
    },
    {
      title: "Copy the Tier 3 value",
      icon: "edit",
      body: "In Section 6, find the row External transmission and read across to the Tier 3 column. It reads **Encrypted; NDA/contract/DPA in place; approved channel**. Type it in **Tier 3** exactly as written: all three conditions apply together.",
      getEl: () => clsField("Tier 3")?.closest("div") ?? null,
      alsoShow: () => $(STD_WINDOW),
      nextWhen: () => cellIn(clsField("Tier 3")),
      doIt: "Type the Tier 3 value",
    },
    {
      title: "Tier 4, then the source",
      icon: "check",
      body: "Finish the table.",
      steps: [
        { lead: "Copy the Tier 4 value", text: "From the same row." },
        { lead: "Fill the **Source** line", text: "Type **BKB-STD-001 Section 6**." },
      ],
      getEl: briefSec,
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once both values and the Source line are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F2.1-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **CLS-RES**: your six rows as you filled them in steps 2 and 3, with the tables of steps 4 and 5 below. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the review. Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5"),
  ],

  // Real work: an analyst learns from worked items what made one pass and one fail before checking a batch.
  "F2.2-1": [
    {
      title: "Two worked items",
      icon: "table",
      body: "Auditors do not accept \"trust me\": evidence is accepted only when it is **dated**, **attributable**, **complete for the period** and **unaltered**. These are the worked items of EVQ-6: E-001 accepted, E-002 rejected with its defect code. Your six, E-003 to E-008, get the same.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right is answered by one cell of these two rows. Answer by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "E-002 is the second row. Its decision has a column of its own near the right end of the table. Click that cell.",
      tips: [
        { kind: "unsure", text: "Scroll the table sideways if you cannot see it." },
      ],
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
      body: "Each code is one check. Read **D1** here: the third question asks for the cell of E-002 that fails it.",
      tips: [
        { kind: "note", text: "Drag this window aside if it covers the table." },
      ],
      getEl: () => $(DC_WINDOW),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find E-002's code and its failing cell the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once all three are found. In step 2 you decide Accept or Reject for your own six items.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The per-row decision: rule R09's checks walked for each item, beside the table.
  "F2.2-2": [
    {
      title: "Your six items",
      icon: "table",
      body: "These are your six items, E-003 to E-008. At work this is evidence a control owner has sent: you accept or reject each item before the auditor relies on it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The checklist, beside the table",
      icon: "help",
      body: "Rule **R09**: check D1 to D10 in order. Each check shows the cell of the lit item it reads.",
      steps: [
        { lead: "Read the check and the cell beside it" },
        { lead: "Decide whether the cell passes", fork: [{ when: "It fails", then: "Click **Fails** on it. The item is a Reject; the walk stops." }, { when: "It passes", then: "Go on to the next check." }] },
        { lead: "None failed? Record Accept", mark: "default" },
      ],
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates and the period",
      icon: "book",
      body: "**D3** and **D4** compare the item with the audit period. The worked item E-001 was accepted, so the Period covered it shows is the whole audit period.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="D3"]'),
    },
    {
      title: "Check E-003",
      icon: "edit",
      body: "**E-003** is lit. Each check shows the cell it reads. This is what E-003's cells say:",
      steps: [
        { lead: "D1 and D2 pass", text: "**Timestamp shown** has a date and time, and **Generated by** names an account, hiro.svc." },
        { lead: "D3 and D4 pass", text: "**Period covered** is the whole audit period, and its date, 2026-02-20, is inside it." },
        { lead: "D5 to D8 pass", text: "The export header shows the filter, the export is unmodified, the system is in scope and the approver's name and date are visible." },
        { lead: "D9 and D10 pass", text: "**Content note** says Masked content and **Legibility** says Legible." },
        { lead: "No check failed, so record **Accept**" },
      ],
      tips: [{ kind: "note", text: "Next unlocks once E-003 shows Accept. To check it again, click its Accept/Reject in the table." }],
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the item's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => !!evqWalk("E-003")?.hasAttribute("data-walked") && /Accept/.test(evqWalk("E-003")?.innerText ?? ""),
      doIt: "Check E-003",
    },
    {
      title: "Now the other five",
      icon: "check",
      body: "Check E-004 to E-008 the same way; the checklist moves on by itself. **Rule** records R09 by itself.",
      tips: [
        { kind: "unsure", text: "To check an item again, click its Accept/Reject in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all six items are decided, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Click **▶ Show me how** to run this guide again.",
      getEl: () => $('[data-guide="show-me-how"]'),
    },
  ],

  "F2.2-3": [
    {
      title: "Codes for the rejects",
      icon: "table",
      body: "A rejected item goes back to its owner with the check it failed, so they know what to send instead. Each item you rejected in step 2 now gets its **defect code**; an accepted item records \"none\" by itself.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openDefectCodes(3),
    {
      title: "Record the first code",
      icon: "edit",
      body: "Start with your first rejected item. In a correct step 2 that is **E-005**.",
      steps: [
        { lead: "Read its row for the cell that is not like the others", text: "E-005's **Integrity note** says \"Hand annotations and re-typed values present\". Every accepted item says \"Unmodified system export\"." },
        { lead: "Find that defect in Defect Codes", text: "D6 reads \"Altered: annotated, edited or re-typed\". That is what the note describes." },
        { lead: "Choose **D6** in **Defect code**" },
      ],
      tips: [{ kind: "unsure", text: "If your first rejected item is another one, find its odd cell the same way and choose the code that describes it." }],
      getEl: () => evqSelect()?.closest("td") ?? null,
      onEnter: () => evqSelect()?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => evqSelect(),
      alsoShow: () => $(DC_WINDOW),
      // E-005's own code where the first reject is E-005 (the key's first); any accepted code on another item.
      nextWhen: () => !!evqSelect()?.value && evqSelect()!.getAttribute("aria-invalid") !== "true" && (!/E-005/.test(evqSelect()!.closest("tr")?.innerText ?? "") || evqSelect()!.value === "D6"),
      doIt: "Choose the defect code",
    },
    rowCell("Then its fix", "Fix", evqSelect, "Defect Codes gives each code's **Fix**: what the owner must send instead.", {
      steps: [
        { lead: "Find D6's line in Defect Codes", text: "Its Fix column reads \"Provide the unmodified system export; put any notes in a separate file.\"" },
        { lead: "Choose that sentence in **Fix**, on the same row", text: "It tells the owner what to send: the export as the system made it, with their notes kept apart." },
      ],
      tips: [{ kind: "note", text: "That is one full row. Do the same for every other rejected item." }],
      alsoShow: () => $(DC_WINDOW),
    }),
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every rejected item has a code, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once your answers are checked.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // The question was answered in the step's row; here, the D9 check on every item.
  "F2.2-4": [
    {
      title: "Now look for exposed data",
      icon: "table",
      body: "Your answer is in. Part 2: an item that shows unmasked personal data or a secret is never copied. It is reported, on its row, with **Report data issue**.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Read each Content note",
      icon: "edit",
      body: "Read each item's **Content note**.",
      steps: [
        { lead: "Is it \"Masked content\"?", fork: [{ when: "Yes", then: "Nothing to report. Go to the next item." }, { when: "No", then: "Click **Report data issue** on its row." }] },
      ],
      tips: [
        { kind: "avoid", text: "copying what an exposed item shows, anywhere. Report it and move on." },
      ],
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => $('[data-guide="register"] thead th:last-child'),
    },
    {
      title: "Record what you found",
      icon: "check",
      body: "This line counts the items you reported. If none of your items shows unmasked data, record that with the button. Next unlocks once the check is recorded.",
      tips: [
        { kind: "unsure", text: "If the line says look again, go **Back** and read the Content note column again." },
      ],
      getEl: () => $('[data-guide="report"]'),
      nextWhen: () => !!$('[data-guide="report-none"]') || !!$("[data-reported]"),
      doIt: "Report an item, or record none",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "**Mark step complete** unlocks once every item with unmasked data is reported, or none is recorded.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F2.2-5": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **EVQ-RES**: your six items as you decided them in steps 2 to 4. In week 5 you use the same checklist on a whole evidence repository. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the review. Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 4"),
  ],

  // Checking the brief as it prints, then handing in both files.
  "F1.3-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "This is **CTX-BRIEF** as it prints, sections 1 to 4, with **CTX-IP** below it. This step checks the page, names both files and submits them.",
      getEl: () => $('[data-guide="page-fit"]'),
    },
    {
      title: "One page, labelled Internal",
      icon: "check",
      body: "Two checks before you hand in.",
      steps: [
        { lead: "One A4 page", text: "The line above the page says whether the brief fits." },
        { lead: "Labelled Internal", text: "The footer carries **Internal**, which every document must show (BKB-POL-004 Section 3.1)." },
      ],
      getEl: () => $('[data-guide="brief-label"]'),
      onEnter: () => $('[data-guide="brief-label"]')?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Name both files",
      icon: "edit",
      body: "Each file gets its own name.",
      steps: [
        { lead: "Use the four parts listed under its box", text: "In the order shown, joined by underscores." },
        { lead: "End with the right extension", text: "The brief ends **.docx**, CTX-IP **.xlsx**." },
      ],
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
      body: "Submit opens once steps 1 to 5 are complete.",
      steps: [
        { lead: "Click **Submit**", text: "It hands both files in." },
        { lead: "Check the receipt", text: "It shows a hash (a fingerprint of the files) and a UTC time." },
      ],
      tips: [
        { kind: "unsure", text: "If the hash or the time is missing, use **Report a problem** at the bottom right." },
      ],
      getEl: () => $('[data-guide="submit"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    nameAndSubmit("docx", "1 to 5")[2],
  ],
  // T3.1: the obligations register (steps 1–8), then the Lead Implementer files LI-FAM (9–14) and LI-SCOPE (15–19).
  "T3.1-1": [
    {
      title: "Your obligations register",
      icon: "table",
      body: "At work, this register is how GlobalConnect knows what it must do, for whom, by when, and who owns it. Regulators ask for it and auditors test against it. You start it with your two offices' rows of **BKB-ADD-16 Section 2**.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openAddendum(1),
    {
      title: "An example",
      icon: "book",
      ...addSec("2"),
      body: "Section 2 has one row per office. Manila's **Breach notification** cell reads \"72h to NPC and data subjects\": copied as written, that is Manila's obligation. Its **Data-protection law**, the Data Privacy Act 2012, is the source instrument.",
    },
    {
      title: "Fill Manila's row",
      icon: "edit",
      body: "Your two rows are in place, one for each office. The first is Manila's. You now fill it cell by cell.",
      steps: [
        { lead: "Choose **Manila** in **Office(s)**", text: "On the first row, OBL-01. Section 2's first row is Manila, Philippines, the head office." },
        { lead: "Type **72h to NPC and data subjects** in **Obligation (plain English)**", text: "That is the Breach notification cell of Manila's row in Section 2, word for word." },
      ],
      getEl: () => $('[data-guide="register"]'),
      pointAt: () => ((oblCell("Office(s)", 1) as HTMLSelectElement | null)?.value === "Manila" ? oblCell("Obligation (plain English)", 1) : oblCell("Office(s)", 1)),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => cellIn(oblCell("Obligation (plain English)", 1)) && (oblCell("Office(s)", 1) as HTMLSelectElement | null)?.value === "Manila",
      doIt: "Choose Manila and copy its obligation",
    },
    // The rest of Manila's row, one cell a card, each waiting on its cell.
    rowCell("Source instrument", "Source instrument", t311Row, "Stay on Manila's row of **Section 2**. Its **Data-protection law** cell reads **Data Privacy Act 2012**: that is the law the 72-hour duty comes from. Type it in **Source instrument**, word for word.", {
      onEnter: showAddSec("2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Article/clause", "Article/clause", t311Row, "**Section 2.2**, now at the top of the addendum, lists each office's duties with their clauses.", {
      steps: [
        { lead: "Find the rows whose From cell reads Section 2 Manila", text: "There are two, because the cell you copied holds two duties: 72h to NPC, and 72h to data subjects." },
        { lead: "Read the Article / clause of the first", text: "It reads DPA 2012 Sec. 20(f); NPC Circular 16-03 Sec. 17." },
        { lead: "Choose **DPA 2012 Sec. 20(f); NPC Circular 16-03 Sec. 17** in **Article/clause**", text: "The first, because step 2 splits the row and gives the second duty its own row and clause." },
      ],
      nextWhen: () => workedIs(t311Row, "Article/clause", /Sec\. 17$/),
      onEnter: showAddSec("2.2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Type", "Type", t311Row, "**Type** says what kind of instrument the row's source is. Read the **Source instrument** you typed: Data Privacy Act 2012.", {
      steps: [
        { lead: "Hold it against the four kinds", text: "law is an act of parliament. reg is a regulator's own requirement. standard is an industry standard. contract is what a customer requires." },
        { lead: "An Act is made by a parliament", text: "The Data Privacy Act is an act of the Philippine legislature, not a rule the regulator wrote." },
        { lead: "Choose **law** in **Type**" },
      ],
      tips: [{ kind: "note", text: "Check my answers scores Type on both rows. Decide Warsaw's the same way, from its own source." }],
      nextWhen: () => typeIs(t311Row, "law"),
    }),
    rowCell("Evidence ref", "Evidence ref", t311Row, "**Evidence ref** says where a reader can check the row: the document code, then the section. This row was copied from Section 2 of the addendum, so type **BKB-ADD-16 Section 2**.", {
      tips: [{ kind: "note", text: "That is one full row." }],
    }),
    {
      title: "Now Warsaw's row",
      icon: "check",
      body: "Fill the second row the same way, from Warsaw's row of Section 2 and Warsaw's rows of Section 2.2.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once both rows are filled and match Section 2, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your Types are checked."),
  ],

  // The question was answered in the step's row; here, R10 applied to the two rows.
  "T3.1-2": [
    {
      title: "Now split the rows",
      icon: "table",
      body: "Your answer is in. Part 2 is rule **R10**: where \"and\" or \";\" joins two duties in one row, each duty gets its own row, so each can have its own owner and deadline.",
      getEl: () => $('[data-guide="split"]'),
    },
    {
      title: "Split OBL-01",
      icon: "edit",
      body: "OBL-01 has a joint, framed as a button.",
      steps: [
        { lead: "Read the words on each side of it", fork: [{ when: "Two duties", then: "Click the joint: the second duty moves to a new row below." }, { when: "One duty", then: "Leave the row whole." }] },
        { lead: "OBL-01, worked", text: "It reads \"72h to NPC and data subjects\". Telling the regulator and telling the people affected are two duties, each with its own recipient and its own evidence. So click the joint, **and**." },
      ],
      tips: [
        { kind: "note", text: "Next unlocks once the row is split. The other row with a joint is yours." },
      ],
      getEl: () => $('[data-guide="split"] li'),
      // At the row, never at the joint: whether to split is the mentee's call.
      pointAt: () => $('[data-guide="split"] li'),
      nextWhen: () => document.querySelectorAll('[data-guide="split"] li').length >= 3,
      doIt: "Split OBL-01",
    },
    {
      title: "Reword the new row",
      icon: "edit",
      body: "The new row, **OBL-02**, holds only the words after the joint. Reword it in the table so it reads as a whole duty, with its clock.",
      getEl: () => oblCell("Obligation (plain English)", 2)?.closest("td") ?? null,
    },
    {
      title: "Now Warsaw's row",
      icon: "check",
      body: "Split the Warsaw row the same way. The step is done when no row holds two duties.",
      getEl: () => $('[data-guide="split"]'),
    },
    finish("**Mark step complete** unlocks once every row holds one duty."),
  ],

  "T3.1-3": [
    {
      title: "Ten more rows",
      icon: "table",
      body: "The lead regulator's requirements (**Section 2.1**) and the sector overlays (**Section 6**) bind GlobalConnect too. Each line takes one row, and the ten rows are already in place for you to fill.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openAddendum(3),
    {
      title: "An example",
      icon: "book",
      ...addSec("2.1"),
      body: "Section 2.1 lists what NPC, the lead regulator, requires. Its first line, \"Registration of Data Processing Systems with NPC\", is one row, with Evidence ref **BKB-ADD-16 Section 2.1**.",
    },
    {
      title: "Fill the first row",
      icon: "edit",
      body: "You now fill this one row from left to right. Section 2.1's first line reads **Registration of Data Processing Systems with NPC**. Choose it in **Obligation (plain English)** on the first empty row.",
      // The row in hand, not the whole register: ten rows are tall, and the card would sit on the last of them.
      getEl: () => oblFirst()?.closest("tr") ?? $('[data-guide="register"]'),
      pointAt: () => oblFirst(),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => oblCells().some((el) => cellIn(el) && /Registration of Data Processing/.test(el.value)),
      doIt: "Choose the line in the first row",
    },
    // The same row, cell by cell: where each value is read, then the cell, Next waiting on it.
    rowCell("Source instrument", "Source instrument", t313Row, "The line names no law or rule itself, so read it in **Section 2.2**, now at the top of the addendum.", {
      steps: [
        { lead: "Find the row with the same Obligation", text: "Its From cell reads Section 2.1, and its Obligation reads Registration of Data Processing Systems with NPC." },
        { lead: "Read its Article / clause", text: "It reads NPC Circular 2022-04: the regulator's rule the duty rests on." },
        { lead: "Type **NPC Circular 2022-04** in **Source instrument**", text: "A source is the rule's name. Where the clause ends in a section number, such as Sec. 26(a), leave that part out." },
      ],
      nextWhen: () => workedIs(t313Row, "Source instrument", "NPC Circular 2022-04"),
      onEnter: showAddSec("2.2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Article/clause", "Article/clause", t313Row, "Stay on the same row of **Section 2.2**. Its Article / clause reads **NPC Circular 2022-04**, with no section number: the whole circular is about registration. Choose **NPC Circular 2022-04** in **Article/clause**.", {
      onEnter: showAddSec("2.2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Type", "Type", t313Row, "**Type** says what kind of instrument the row's source is. Read the **Source instrument** you typed: NPC Circular 2022-04.", {
      steps: [
        { lead: "Ask who made it", text: "A circular is issued by NPC, the regulator, itself. Section 2.1's heading says the same: Lead regulator requirements." },
        { lead: "Hold that against the four kinds", text: "law is an act of parliament. reg is a regulator's own requirement, or a rule it issues under an act. standard is an industry standard. contract is what a customer requires." },
        { lead: "Choose **reg** in **Type**" },
      ],
      tips: [{ kind: "note", text: "Check my answers scores Type on every row. Decide each one from its own source: an act is law, a standard such as PCI DSS is standard." }],
      nextWhen: () => typeIs(t313Row, "reg"),
      onEnter: showAddSec("2.1"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Office(s)", "Office(s)", t313Row, "A lead regulator's requirement binds the office it regulates. **Section 1** of the addendum gives Head office as Manila, Philippines, and Lead regulator(s) as NPC, the Philippine privacy commission. So NPC's requirement binds Manila: choose **Manila** in **Office(s)**.", {
      onEnter: showAddSec("1"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Evidence ref", "Evidence ref", t313Row, "**Evidence ref** is the document code, then the section the line was copied from. This line is in Section 2.1 of the addendum, so type **BKB-ADD-16 Section 2.1**.", {
      tips: [{ kind: "note", text: "That is one full row. Every other row is filled the same way." }],
    }),
    {
      title: "The other Section 2.1 lines",
      icon: "table",
      ...addSec("2.1"),
      body: "Fill one row for each of the other five lines of Section 2.1, cell by cell as you just did. Each line has its own row in Section 2.2.",
    },
    {
      title: "Then Section 6",
      icon: "book",
      ...addSec("6"),
      body: "Section 6 has four overlays. Each fills one of the last four rows.",
      steps: [
        { lead: "Choose its Additional mandatory requirement in **Obligation (plain English)**", text: "The whole requirement stays in one row." },
        { lead: "Type its **Source instrument**", text: "The law or standard the requirement names." },
        { lead: "Choose its **Article/clause** and **Type**", text: "Article / clause is on the requirement's row in Section 2.2. Learn › Framework Quick Reference says whether a named law or standard is a law or a standard." },
        { lead: "Choose the office or offices it binds", text: "Section 6's **Applies to** column names the offices. All offices means both of yours. An overlay that names neither of your two takes **Neither of the two**." },
        { lead: "Type its **Evidence ref**", text: "**BKB-ADD-16 Section 6**." },
      ],
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once all ten rows are filled, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your Types are checked."),
  ],

  "T3.1-4": [
    {
      title: "Now the contract rows",
      icon: "table",
      body: "Your answer is in. Part 2: three rows from what GlobalConnect's customers and partners require of it, each of Type **contract**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openAddendum(4).slice(0, 2),
    {
      title: "Open Organization_Profiles",
      icon: "book",
      body: "Click **Organization_Profiles**, the organisation profile workbook. It is tagged Step 4; its **Key Requirements** table lists the requirements by group.",
      getEl: () => $(`${LIBRARY_WINDOW} [data-doc="Organization_Profiles"]`),
      waitFor: () => !!$(OP_WINDOW),
      doIt: "Click Organization_Profiles",
    },
    {
      title: "Fill the first contract row",
      icon: "edit",
      body: "Your three rows are in place. You now fill the first one from left to right. In Organization_Profiles, the Stakeholder Requirements row of GlobalConnect's table starts with **Quality scores (CSAT, NPS)**. Choose it in **Obligation (plain English)**.",
      getEl: () => oblFirst()?.closest("tr") ?? $('[data-guide="register"]'),
      pointAt: () => oblFirst(),
      alsoShow: () => $(OP_WINDOW),
      nextWhen: () => cellIn(oblFirst()) && /Quality scores/.test((oblFirst() as HTMLSelectElement | null)?.value ?? ""),
      doIt: "Choose the requirement in the first row",
    },
    rowCell("Source instrument", "Source instrument", t314Row, "No law sets a quality score. A customer's requirement rests on its contract with GlobalConnect, so type **Client contract** in **Source instrument**."),
    // Article/clause is read in the addendum, which this step has not opened yet.
    ...openLib(4, "BKB-ADD-16", "Your organisation's addendum, read here for Section 2.2,", ADD16_WINDOW),
    rowCell("Article/clause", "Article/clause", t314Row, "The last three rows of **Section 2.2** read Key Requirements in their From cell. The one whose Obligation is Quality scores (CSAT, NPS) has the Article / clause **Client contract: service-level schedule**: scores are agreed in the contract's service levels. Choose it in **Article/clause**.", {
      // The section's end, where the Key Requirements rows are, at the bottom of the addendum's window.
      onEnter: () => $(`${ADD16_WINDOW} [data-sec="2.2"]`)?.scrollIntoView({ block: "end" }),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Type", "Type", t314Row, "The row's source is a client contract, not an act, a regulator's rule or a standard. What a customer requires is the fourth kind: choose **contract** in **Type**.", { nextWhen: () => typeIs(t314Row, "contract") }),
    rowCell("Office(s)", "Office(s)", t314Row, "Read the Key Requirements table again: it names no office, so the requirement is the whole organisation's and binds both of your offices. Choose **Manila; Warsaw** in **Office(s)**.", {
      nextWhen: () => workedIs(t314Row, "Office(s)", "Manila; Warsaw"),
      alsoShow: () => $(OP_WINDOW),
    }),
    rowCell("Evidence ref", "Evidence ref", t314Row, "**Evidence ref** is where the requirement was copied from: the workbook, then its sheet. The window's first lines name both: the workbook is Organization_Profiles and the sheet is Key Requirements. Type **Organization_Profiles Key Requirements**.", {
      tips: [{ kind: "note", text: "That is one full row." }],
      alsoShow: () => $(OP_WINDOW),
    }),
    finish("Fill the next two rows the same way, one for each of the next two requirements under Stakeholder Requirements. **Mark step complete** unlocks once all three are filled."),
  ],

  "T3.1-5": [
    {
      title: "Link every row",
      icon: "table",
      body: "Your answer is in. Part 2 fills four cells on every row: its Process, Evidence of compliance and Frequency / deadline from the addendum, then the BKB policy that implements it. The **owner role** then fills itself from the BKB-POL-000 index, as rule R10 says. You do OBL-01 first, cell by cell.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-ADD-16", "Your organisation's addendum, read here for Section 2.2,", ADD16_WINDOW),
    rowCell("Process", "Process", t315Row, "**Section 2.2** has one row per obligation. OBL-01 came from an office's Section 2 cell, so its row there names that office in From and holds the same duty.", {
      steps: [
        { lead: "Find OBL-01's row in Section 2.2", text: "OBL-01 is Manila's duty 72h to NPC. Its row reads Section 2 Manila in From and 72h to NPC in Obligation: the first row of the table." },
        { lead: "Read that row's Process", text: "It reads Incident management and breach notification: telling the regulator of a breach is part of handling the incident." },
        { lead: "Choose **Incident management and breach notification** in **Process**" },
      ],
      tips: [{ kind: "note", text: "Process and the columns after it are on the right of the Section 2.2 table. Scroll the addendum sideways to read them, or drag its corner to make the window wider." }],
      onEnter: showAddSec("2.2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Evidence of compliance", "Evidence of compliance", t315Row, "Stay on the same row of Section 2.2. Its last column, Evidence of compliance, reads **NPC breach notification log with submission receipts**: the record that shows each notice reached NPC, and when. Choose it in **Evidence of compliance**.", {
      onEnter: showAddSec("2.2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    rowCell("Frequency / deadline", "Frequency / deadline", t315Row, "Still the same row of Section 2.2. Its Frequency / deadline reads **72h**. A notification has a deadline, not a frequency: 72 hours from the breach. Type **72h** in **Frequency / deadline**, as it is written there.", {
      onEnter: showAddSec("2.2"),
      alsoShow: () => $(ADD16_WINDOW),
    }),
    ...openLib(5, "BKB-POL-000", "The Policy Framework and Library Index", POL000_WINDOW),
    {
      title: "An example",
      icon: "book",
      getEl: () => $(`${POL000_WINDOW} [data-sec="3"]`),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
      body: "Section 3 lists every policy with its owner. For example, BKB-POL-014, Incident Management and Breach Notification Policy, is owned by the Incident Response & Crisis Manager.",
    },
    {
      title: "Link OBL-01",
      icon: "edit",
      body: "OBL-01's Process is Incident management and breach notification. In Section 3, look for the policy whose title names those words.",
      steps: [
        { lead: "Read the titles", text: "BKB-POL-014 is the Incident Management and Breach Notification Policy: the process, word for word." },
        { lead: "Take the most specific title", text: "BKB-POL-017, Data Protection and Privacy, is about privacy in general. BKB-POL-014 names breach notification itself." },
        { lead: "Choose **BKB-POL-014** in **Linked BKB policy**", text: "Owner role then fills itself from the index." },
      ],
      tips: [{ kind: "note", text: "That is one full row. Check my answers scores the policy on every row." }],
      alsoShow: () => $(POL000_WINDOW),
      getEl: () => oblCell("Linked BKB policy", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Linked BKB policy", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Linked BKB policy", 1),
      nextWhen: () => selIn("Linked BKB policy", 1) && /^BKB-POL-014/.test((oblCell("Linked BKB policy", 1) as HTMLSelectElement).value),
      doIt: "Choose OBL-01's policy",
    },
    {
      title: "Now the other rows",
      icon: "table",
      body: "Fill every other row the same way.",
      steps: [
        { lead: "Find the row's own row in Section 2.2", text: "A row from Section 2 by its office and duty. A row from Section 2.1, Section 6 or the Key Requirements by its Obligation." },
        { lead: "Choose its Process and Evidence of compliance, and type its Frequency / deadline" },
        { lead: "Choose the policy whose title covers the Process", text: "In BKB-POL-000 Section 3." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row is filled, click **Check my answers**. It shows whether each row's policy is the one that implements it, and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.1-6": [
    {
      title: "17 rows, 15 places",
      icon: "info",
      body: "Steps 1 to 4 gave **17 rows**; the register holds **15**. The 3 contract rows stay, because KR2 needs them.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "Remove two",
      icon: "edit",
      body: "Remove the two rows that bind neither Manila nor Warsaw.",
      steps: [
        { lead: "Check each row's source against Section 2", text: "Section 2 of the addendum names each office's laws." },
        { lead: "The first one, worked", text: "The row copied from Section 6's **US health information** overlay: its Applies to cell reads Phoenix, which is neither of your offices. Click the × at the end of that row." },
        { lead: "Find the second the same way", text: "One more Section 6 row applies to Phoenix alone. Next unlocks at 15 rows; the line beside the table then says whether you chose right." },
      ],
      tips: [
        { kind: "avoid", text: "removing a contract row. All three stay." },
      ],
      getEl: () => $('[data-guide="register"]'),
      nextWhen: () => oblRows() === 15,
      doIt: "Remove two rows",
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("This button unlocks at 15 rows, with the 3 contract rows among them and the two right rows removed, once the Compliance Manager's message has your reply."),
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
      body: "**Annex A** is at the end: one row per country, its breach-notification clock in the third column. Manila is in the Philippines.",
    },
    {
      title: "Compare Manila",
      icon: "edit",
      body: "Manila, worked. Warsaw is yours.",
      steps: [
        { lead: "Read your register's clock for Manila", text: "The card shows it: 72h to NPC and data subjects." },
        { lead: "Read Annex A's **Philippines** row", text: "Its breach notification cell reads 48h to NPC; 72h to data subjects." },
        { lead: "Compare", text: "Data subjects agree at 72h. The NPC does not: 72h in the addendum, 48h in Annex A." },
        { lead: "Choose **Differs from Annex A**", text: "Next unlocks once it is chosen." },
      ],
      getEl: () => $('[data-guide="compare"] [data-compare="Manila"]'),
      alsoShow: () => $(ERM_WINDOW),
      nextWhen: () => !!$('[data-guide="compare"] [data-compare="Manila"] [aria-pressed="true"]') && !/Look again/.test($('[data-guide="compare"] [data-compare="Manila"]')?.innerText ?? ""),
      doIt: "Compare Manila",
    },
    {
      title: "Record the difference",
      icon: "edit",
      body: "A difference is recorded on the row it touches, so its owners can resolve it.",
      steps: [
        { lead: "Read Annex A's clock for each party", text: "48h to NPC; 72h to data subjects." },
        { lead: "Hold each against your rows", text: "Your data-subjects row says 72h: the same. Your NPC row says 72h: Annex A says 48h." },
        { lead: "Click the row **72h to NPC**", text: "That is the row the difference touches. Next unlocks once it is clicked." },
      ],
      getEl: () => $('[data-guide="compare"] [data-compare="Manila"]'),
      alsoShow: () => $(ERM_WINDOW),
      nextWhen: () => !!$('[data-guide="compare"] [data-compare="Manila"] [data-compare-row][aria-pressed="true"]') && !/Look again/.test($('[data-guide="compare"] [data-compare="Manila"]')?.innerText ?? ""),
      doIt: "Record the difference",
    },
    finish("Compare Warsaw (Poland) the same way. **Mark step complete** unlocks once both are compared."),
  ],

  "T3.1-8": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **OBL-REG**: your 15 rows as you built them in steps 1 to 7. T4.1, T10.2 and T11.2 work from it. This step checks it, names it and submits it, once its second sheet is filled.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "New rows have arrived",
      icon: "inbox",
      body: "At work, a register is never quite closed: the Policy & Governance Analyst has a message about a new client's rows. Open it from the **Inbox** on the toolbar and confirm it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Sheet 2",
      icon: "table",
      body: "Below your 15 rows is a **second sheet**: three rows from the new client's contract. Each needs what every register row has: its evidence, its deadline and its policy.",
      onEnter: () => $('[data-reg="OBL-EXTRA"]')?.scrollIntoView({ block: "nearest" }),
      getEl: () => $('[data-reg="OBL-EXTRA"]'),
    },
    ...openLib(8, "Organization_Profiles", "OBL-EXTRA, its Section 3,", 'section[role="dialog"][aria-label^="Organization_Profiles"]'),
    // OBL-16, the sheet's first row, cell by cell: Section 3 has one row for it, found by its Obligation.
    rowCell("Evidence of compliance", "Evidence of compliance", t318Row, "**Section 3** of Organization_Profiles has one row for each row of this sheet. You fill OBL-16 first.", {
      steps: [
        { lead: "Find the Section 3 row with OBL-16's Obligation", text: "It is the first: Notify the client of any security incident affecting its data." },
        { lead: "Read its last column, Evidence of compliance", text: "It reads Client incident notices and their send log: the notices prove the client was told, the log proves when." },
        { lead: "Type **Client incident notices and their send log** in **Evidence of compliance**", text: "As it is written there." },
      ],
      tips: [{ kind: "note", text: "Evidence of compliance is the last column of Section 3. Scroll the window sideways to read it, or drag its corner to make it wider." }],
      alsoShow: () => (innerWidth > 700 ? $(OP_WINDOW) : null),
    }),
    rowCell("Frequency / deadline", "Frequency / deadline", t318Row, "Stay on the same row of Section 3. Its Frequency / deadline reads **24 hours**: the time the client's security schedule gives GlobalConnect to tell it of an incident. Type **24 hours** in **Frequency / deadline**.", {
      alsoShow: () => (innerWidth > 700 ? $(OP_WINDOW) : null),
    }),
    // The policy is read in the index, which this step has not opened yet.
    ...openLib(8, "BKB-POL-000", "The Policy Framework and Library Index", POL000_WINDOW),
    rowCell("Linked BKB policy", "Linked BKB policy", t318Row, "OBL-16's **Process**, two columns to the left of this cell, reads Incident management and breach notification. In **Section 3** of BKB-POL-000, one title names those words: BKB-POL-014, Incident Management and Breach Notification Policy. Choose **BKB-POL-014** in **Linked BKB policy**.", {
      tips: [{ kind: "note", text: "That is one full row. Owner role fills itself from the index." }],
      onEnter: () => $(`${POL000_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
      alsoShow: () => (innerWidth > 700 ? $(POL000_WINDOW) : null),
    }),
    {
      title: "The other two",
      icon: "edit",
      body: "Fill OBL-17 and OBL-18 the same way, each from the Section 3 row with its own Obligation. A value that differs from its source is flagged with where to read it.",
      getEl: () => $('[data-reg="OBL-EXTRA"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review. Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7"),
  ],

  "T3.1-9": [
    {
      title: "Your 27000-family map",
      icon: "table",
      body: "An implementer must know which ISO/IEC 27000-family document does what: only some can be **certified against**, and some bind **certification bodies**, not organisations. T-LI-FAM lists the ten.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-27000 family"),
    // The first row, one cell a card.
    rowCell("Certifiable?", "Certifiable?", () => oblCell("Certifiable?", 1), "You fill the first row, ISO/IEC 27000, from **Ref-27000 family**.", {
      steps: [
        { lead: "Find ISO/IEC 27000's row on the page", text: "It is the first." },
        { lead: "Read its Certifiable? column", text: "It reads No. ISO/IEC 27000 explains the vocabulary: it sets no requirements, so there is nothing to certify against." },
        { lead: "Choose **No** in **Certifiable?**" },
      ],
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
    }),
    rowCell("Who uses it", "Who uses it", () => oblCell("Certifiable?", 1), "Stay on the same row of the page. Its Who uses it column reads **Everyone: read it first for definitions**. A vocabulary serves every reader of the family. Choose the entry that starts with **Everyone** in **Who uses it**.", {
      tips: [{ kind: "note", text: "Who uses it is the page's last column. Scroll the page sideways to read it, or drag its corner to make it wider." }],
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
    }),
    finish("Fill the other nine the same way. **Mark step complete** unlocks once all ten match the page."),
  ],

  "T3.1-10": [
    {
      title: "A draft to check",
      icon: "table",
      body: "Each document's purpose, in one sentence: the line you would give a colleague who asks which standard to open. A colleague drafted this column from memory; you check it before anyone relies on it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-27000 family"),
    {
      title: "How to check a row",
      icon: "search",
      body: "Take ISO/IEC 27000.",
      steps: [
        { lead: "Find its row in Ref-27000 family", text: "Its Purpose reads: Explains the vocabulary and gives an overview of the whole family." },
        { lead: "Compare the sentence there with the draft, word for word", text: "The draft says the same, so this row is right. Leave it." },
      ],
      getEl: () => oblCell("Purpose in one sentence", 1)?.closest("td") ?? null,
      pointAt: () => oblCell("Purpose in one sentence", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
    },
    // A row the draft has wrong, corrected by the learner: the third, ISO/IEC 27002:2022.
    rowCell("One that differs", "Purpose in one sentence", () => oblCell("Purpose in one sentence", 3), "Now the third row, ISO/IEC 27002:2022.", {
      steps: [
        { lead: "Read the draft", text: "It says: Guides the implementation of the ISMS requirements, clause by clause." },
        { lead: "Read ISO/IEC 27002:2022's row on the page", text: "Its Purpose is about the 93 controls, not the clauses. The draft's sentence belongs to ISO/IEC 27003." },
        { lead: "Choose the page's sentence in the row's list", text: "**Explains how to implement each of the 93 controls and tags them with attributes.**" },
      ],
      nextWhen: () => /93 controls/.test((oblCell("Purpose in one sentence", 3) as HTMLSelectElement | null)?.value ?? ""),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
      doIt: "Correct ISO/IEC 27002:2022's sentence",
    }),
    {
      title: "The other nine",
      icon: "edit",
      body: "Check the other eight the same way.",
      tips: [
        { kind: "avoid", text: "trusting a sentence because it reads well. Every sentence belongs to one of the ten documents, so a good one can still sit on the wrong row." },
      ],
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
    },
    checkBeside(PAGE_WINDOW("Ref-27000 family"), "Once every row is checked, Check my answers shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.1-11": [
    {
      title: "Requirements or guidance",
      icon: "table",
      body: "A **requirements** document uses \"shall\" and can be audited against; **guidance** only advises. An audit finding can only cite a requirement.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule L02 is in the rule tables, tagged with this step.", 'section[role="dialog"][aria-label*="› Rule tables"]'),
    {
      title: "Choose for the first one",
      icon: "edit",
      body: "Rule **L02** names three requirements documents: ISO/IEC 27001, ISO/IEC 27006-1 and ISO/IEC 17021-1. Every other listed document is guidance. The first row, ISO/IEC 27000, is not one of the three, so choose **Guidance**.",
      alsoShow: () => (innerWidth > 700 ? $(RULES_WINDOW) : null),
      getEl: () => oblCell("Requirements or guidance", 1)?.closest("td") ?? null,
      pointAt: () => oblCell("Requirements or guidance", 1),
      nextWhen: () => selIn("Requirements or guidance", 1),
      doIt: "Choose for ISO/IEC 27000",
    },
    finish("Choose for the other nine. **Mark step complete** unlocks once all ten follow rule L02."),
  ],

  "T3.1-12": [
    {
      title: "Plan, Do, Check, Act",
      icon: "table",
      body: "Clauses 4 to 10 of ISO/IEC 27001 form one management system. Rule **L01** places each in the Plan-Do-Check-Act cycle. The 2022 standard does not name PDCA, so this is the conventional mapping.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openLearn("Rule tables", "Rule L01 is in the rule tables, tagged with this step.", 'section[role="dialog"][aria-label*="› Rule tables"]'),
    {
      title: "Place clause 4",
      icon: "edit",
      body: "Clause 4, worked. The other six clauses are yours.",
      steps: [
        { lead: "Find rule **L01** in the rule tables", text: "The window beside the page has moved to it. Its What to do cell gives each clause a phase: clauses 4 to 7 Plan, clause 8 Do, clause 9 Check, clause 10 Act." },
        { lead: "Read clause 4's phase", text: "Clause 4 is among 4 to 7, so its phase is Plan: the context is understood before anything is built." },
        { lead: "Type **Plan**", text: "In the box beside Clause 4 Context of the organisation. Next unlocks once it is typed." },
      ],
      getEl: () => briefIn("Clause 4 Context of the organisation"),
      pointAt: () => briefIn("Clause 4 Context of the organisation"),
      alsoShow: () => $('section[role="dialog"][aria-label*="› Rule tables"]'),
      onEnter: () => rowIn('section[role="dialog"][aria-label*="› Rule tables"]', "L01")?.scrollIntoView({ block: "center" }),
      nextWhen: () => cellIn(briefIn("Clause 4 Context of the organisation")),
      doIt: "Place clause 4",
    },
    finish("Place clauses 5 to 10, then write Rule L01 in the Source line. **Mark step complete** unlocks once all are in."),
  ],

  "T3.1-13": [
    {
      title: "Which edition?",
      icon: "table",
      body: "At work, before anyone reuses an old map, someone checks which edition of ISO/IEC 27001 it describes. These four maps carry no date, so what each one says has to tell you.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(13, "Ref-27000 family"),
    {
      title: "Where the editions are",
      icon: "book",
      body: "The last three rows of **Ref-27000 family** are the editions. Each says what its Annex A holds and what clauses 4.1 and 4.2 say.",
      onEnter: () => [...document.querySelectorAll(`${PAGE_WINDOW("Ref-27000 family")} tr`)].pop()?.scrollIntoView({ block: "nearest" }),
      getEl: () => $(PAGE_WINDOW("Ref-27000 family")),
    },
    {
      title: "The first map",
      icon: "edit",
      body: "Work out Map A from what it says.",
      steps: [
        { lead: "Read its Annex A sentence", text: "93 controls in four themes. The 2013 edition has 114 controls in 14 domains, so Map A is not 2013." },
        { lead: "Read what it says of clauses 4.1 and 4.2", text: "Issues, interested parties and their requirements. Nothing about climate change, which Amendment 1:2024 added. So it is not the amended edition." },
        { lead: "Choose **ISO/IEC 27001:2022** in **Edition it describes**", text: "The one Edition row with 93 controls and no climate change." },
      ],
      getEl: () => oblCell("Edition it describes", 1)?.closest("tr") ?? null,
      pointAt: () => oblCell("Edition it describes", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
      nextWhen: () => (oblCell("Edition it describes", 1) as HTMLSelectElement | null)?.value === "ISO/IEC 27001:2022",
      doIt: "Choose Map A's edition",
    },
    {
      title: "The other three",
      icon: "edit",
      body: "Work out Maps B, C and D the same way.",
      tips: [
        { kind: "avoid", text: "choosing from the first sentence alone. Read both sentences of each map before you choose." },
      ],
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27000 family")) : null),
    },
    checkBeside(PAGE_WINDOW("Ref-27000 family"), "Once all four are chosen, Check my answers shows each map's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.1-14": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **LI-FAM**: the ten documents as you described them in steps 9 to 11, with the edition check of step 13 and the PDCA diagram of step 12 below them. T5.1 builds on it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 13"),
  ],

  "T3.1-15": [
    {
      title: "The ISMS scope",
      icon: "table",
      body: "The **ISMS scope** (clause 4.3) is the first document a certification auditor reads: it says what the management system covers. Rule **L03**: in scope = your office and its departments in the asset register.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openAddendum(15),
    {
      title: "Where the departments are",
      icon: "book",
      ...addSec("8.1"),
      body: "**Section 8.1** lists the registered Mission Critical assets, each with its office and department. The departments on your office's rows are what the ISMS covers.",
    },
    {
      title: "Fill “covers”",
      icon: "edit",
      body: "The whole line, worked: it is one list, so there is no first row to do alone.",
      steps: [
        { lead: "Read the **Department** column of Section 8.1, on the Manila rows", text: "Finance & Treasury (Group) twice, Information Security (CISO Office) three times, Corporate IT & Technology twice, Information Security & Privacy once, Service Delivery Operations twice." },
        { lead: "Keep each department once, in the order it first appears", text: "Five departments." },
        { lead: "Type them with \"; \" between", text: "**Finance & Treasury (Group); Information Security (CISO Office); Corporate IT & Technology; Information Security & Privacy; Service Delivery Operations**. Next unlocks once the list matches Section 8.1." },
      ],
      tips: [
        { kind: "avoid", text: "listing a department twice, or one from another office's rows." },
      ],
      getEl: () => briefIn("covers"),
      pointAt: () => briefIn("covers"),
      alsoShow: () => $(ADD16_WINDOW),
      nextWhen: () => cellIn(briefIn("covers")),
      doIt: "Fill covers",
    },
    finish("Fill “at” with your office and the Source line. **Mark step complete** unlocks once all three are in."),
  ],

  "T3.1-16": [
    {
      title: "What is outside",
      icon: "table",
      body: "Rule L03: out of scope is only what the addendum lists as **excluded**, with its reason. An exclusion with no reason is a Stage 1 blocker for the auditor.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    {
      title: "Out of scope",
      icon: "edit",
      body: "Search BKB-ADD-16 for anything it lists as excluded.",
      steps: [
        { lead: "Search the addendum", fork: [{ when: "Something listed", then: "Type what you find." }, { when: "Nothing listed", then: "Type **None**." }] },
        { lead: "What the search finds", text: "BKB-ADD-16 has no section of exclusions and no line that says \"excluded\" or \"out of scope\". Rule L03 leaves nothing out, so the answer is **None**." },
      ],
      tips: [
        { kind: "note", text: "Next unlocks once it matches the addendum." },
      ],
      getEl: () => briefIn("Out of scope"),
      pointAt: () => briefIn("Out of scope"),
      nextWhen: () => cellIn(briefIn("Out of scope")),
      doIt: "Fill Out of scope",
    },
    {
      title: "Interfaces",
      icon: "edit",
      body: "L03 takes the interfaces from the TSA Integrations sheet; **BKB-ADD-16 Section 9.1** is its extract.",
      steps: [
        { lead: "Find the External rows of Section 9.1", text: "Read down its Internal / External column. The first three External rows are the CRM platforms, the VoIP and UCaaS platforms and the KYC verification service." },
        { lead: "Copy the **Integration** of the first three, in order", text: "Separated by \"; \". Type the two-way arrow as **<->**." },
        { lead: "The line, worked", text: "**CRM platforms (Salesforce, Zendesk) <-> client CRM tenants; VoIP and UCaaS platforms <-> telecom carriers; KYC verification service <-> identity-check provider**. Next unlocks once it matches." },
      ],
      getEl: () => briefIn("Interfaces"),
      pointAt: () => briefIn("Interfaces"),
      nextWhen: () => cellIn(briefIn("Interfaces")),
      doIt: "Fill Interfaces",
    },
    finish("Name the addendum in the Source line. **Mark step complete** unlocks once it is in."),
  ],

  "T3.1-17": [
    {
      title: "Climate change",
      icon: "table",
      body: "Amendment 1:2024 asks whether **climate change** is a relevant issue (4.1) and what interested parties require about it (4.2). The Group has decided; your scope records its reason.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openPage(17, "Ref-ISMS processes"),
    {
      title: "Copy the row",
      icon: "edit",
      body: "The climate-change row is the last row of **Ref-ISMS processes**. Its second cell starts \"Yes — Group decision (BKB-POL-015)\", so type **Yes**. The reason after it is the Group's and stays on the page. Next unlocks once it matches.",
      getEl: () => briefIn("Relevant?"),
      pointAt: () => briefIn("Relevant?"),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-ISMS processes")) : null),
      nextWhen: () => cellIn(briefIn("Relevant?")),
      doIt: "Write the row's Yes or No",
    },
    finish("Name the page in the Source line. **Mark step complete** unlocks once both are in."),
  ],

  "T3.1-18": [
    {
      title: "Ten processes, ten owners",
      icon: "table",
      body: "Clause 4.4: the ISMS is a set of processes, each with an **owner** who answers for it. An auditor reads this list to see who to interview. A colleague drafted Section 4; you check it against the Group RACI's own list.",
      getEl: () => $('[data-guide="brief-section"]'),
    },
    ...openPage(18, "Ref-ISMS processes"),
    {
      title: "How to check a line",
      icon: "search",
      body: "Take **Risk assessment and treatment**.",
      steps: [
        { lead: "Read its **Owner** in Ref-ISMS processes", text: "It is the page's first row. Its Owner (Accountable) cell reads: Cyber Risk Manager (risk owners decide; CRCO accepts Medium)." },
        { lead: "Compare it with the draft, word for word", fork: [{ when: "They match", then: "Leave the line." }, { when: "They differ", then: "Type what the page says." }] },
      ],
      getEl: () => briefIn("Risk assessment and treatment"),
      pointAt: () => briefIn("Risk assessment and treatment"),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-ISMS processes")) : null),
    },
    {
      title: "The other nine, then the source",
      icon: "edit",
      body: "Check the other nine the same way, then name the page in the **Source** line.",
      tips: [
        { kind: "avoid", text: "passing a role because it sounds right. It can sit on the wrong process, or be cut short." },
      ],
      getEl: () => $('[data-guide="brief-section"]'),
    },
    {
      ...briefCheckCard,
      onEnter: () => { if (innerWidth <= 700) $(`${PAGE_WINDOW("Ref-ISMS processes")} button[aria-label^="Close"]`)?.click(); },
    },
    finish("Correct any line still flagged. **Mark step complete** unlocks once all ten match the page and the Source line is in."),
  ],

  "T3.1-19": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **LI-SCOPE** as it prints. The Statement of Applicability in T3.2 and the audit programme in T12.1 are both bounded by it. This step checks the page, names the file and submits it.",
      getEl: () => $('[data-guide="page-fit"]'),
    },
    ...nameAndSubmit("docx", "1 to 18"),
  ],
  "T3.2-1": [
    {
      title: "Your crosswalk",
      icon: "table",
      body: "At work, a **crosswalk** shows which Group policy and which ISO/IEC 27001 control answer each outside requirement, so one set of controls serves many standards. MAP-XW holds your 8 requirements from dataset MAP-8. First, the policy that covers each.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("policies", "Policies", "Map to Framework", "The look-up: key words, and the BKB policy that covers them.", MTF_WINDOW),
    {
      title: "An example",
      icon: "book",
      body: "A requirement about access rights uses the key word \"access\": Map to Framework's first row leads to BKB-POL-006.",
      tips: [
        { kind: "avoid", text: "taking a key word as the answer. It is a lead: read the requirement to see what it is really about." },
      ],
      getEl: () => $(MTF_WINDOW),
    },
    ...openLib(1, "BKB-POL-000", "The Policy Framework and Index", POL000_WINDOW),
    {
      title: "Index and sector overlays",
      icon: "book",
      getEl: () => $(`${POL000_WINDOW} [data-sec="8"]`),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
      body: "Work from the BKB-POL-000 index.",
      steps: [
        { lead: "Start at Section 8", text: "It names the policy that implements each kind of standard." },
        { lead: "Check the titles in Section 3", text: "Just above, it lists every policy by title." },
        { lead: "Move to a narrower policy only if its title fits", text: "Only where that policy's title is about what the requirement asks." },
      ],
    },
    {
      title: "Choose for the first row",
      icon: "edit",
      body: "Row 1 is ISO/IEC 29151, **Information security of PII**. PII is personal data.",
      steps: [
        { lead: "Start at BKB-POL-000 Section 8", text: "Its row for data-protection laws and PII-protection standards names ISO/IEC 29151. Its last column reads Addendum + BKB-POL-017." },
        { lead: "Check the title in Section 3", text: "BKB-POL-017 is the Data Protection and Privacy Policy: it is about personal data, which is what the requirement asks." },
        { lead: "Look for a narrower policy", text: "No key word in Map to Framework leads to one for this requirement. Its personal data row gives BKB-POL-017 too." },
        { lead: "Choose **BKB-POL-017** in **BKB policy**" },
      ],
      alsoShow: () => (innerWidth > 700 ? $(POL000_WINDOW) : null),
      getEl: () => oblCell("BKB policy", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("BKB policy", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("BKB policy", 1),
      nextWhen: () => selIn("BKB policy", 1) && /^BKB-POL-017/.test((oblCell("BKB policy", 1) as HTMLSelectElement).value),
      doIt: "Choose row 1's policy",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Choose for the other seven. Once every row has a policy, click **Check my answers**: it shows each row's verdict.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.2-2": [
    {
      title: "The control for each one",
      icon: "table",
      body: "Now the **Annex A control** that implements each requirement. Each row offers three candidates, with their titles.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openCrosswalk("One row per BKB policy, with its Annex A controls."),
    {
      title: "An example",
      icon: "book",
      body: "BKB-POL-006's row lists A.5.15–A.5.18 and A.8.5. An access-rights requirement mapped to BKB-POL-006 takes one of those, such as **A.5.18 Access rights**.",
      getEl: () => $(XW_WINDOW),
    },
    {
      title: "Choose for the first row",
      icon: "edit",
      body: "Row 1 is Information security of PII. In a correct step 1 its policy is BKB-POL-017.",
      steps: [
        { lead: "Find BKB-POL-017's row in Crosswalk View", text: "Its Annex A column reads A.5.34." },
        { lead: "Read the three candidates in the row's list", text: "A.5.34 Privacy and protection of PII is one of them. A.5.1 is the policy set as a whole and A.8.24 is one technique, cryptography." },
        { lead: "Choose **A.5.34 Privacy and protection of PII**", text: "It is the policy's control, and it is about what the requirement asks: keeping personal data secure." },
      ],
      alsoShow: () => (innerWidth > 700 ? $(XW_WINDOW) : null),
      getEl: () => oblCell("ISO/IEC 27001 control", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("ISO/IEC 27001 control", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("ISO/IEC 27001 control", 1),
      nextWhen: () => selIn("ISO/IEC 27001 control", 1) && /^A\.5\.34 /.test((oblCell("ISO/IEC 27001 control", 1) as HTMLSelectElement).value),
      doIt: "Choose row 1's control",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every row has a control, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.2-3": [
    {
      title: "Is there a procedure?",
      icon: "table",
      body: "A **policy** says what must happen; a **procedure** says who does it, step by step. Rule R11 counts both. Each policy's Section 6 lists its procedures by name.",
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
      body: "The headings \"Procedure: …\" under Section 6 are its procedures, each named after what it does. Ask: does one of them carry out row 1's requirement?",
      getEl: () => $(POLICY_WINDOW),
    },
    {
      title: "Row 1",
      icon: "edit",
      body: "Row 1 asks for information security of PII. Its policy, BKB-POL-017, has two procedures under Section 6.",
      steps: [
        { lead: "Read 6.1, Data-subject request handling", text: "It answers a person's request about their data. It does not secure the data." },
        { lead: "Read 6.2, DPIA", text: "It assesses a new processing before it starts. It does not secure the data either." },
        { lead: "Neither carries out the requirement, so type **none**", text: "Where a procedure does fit a row, type its number, such as 6.1." },
      ],
      tips: [{ kind: "note", text: "Which procedure fits is your call: an assessor reviews it at checkpoint HC2. Next unlocks on a procedure of the row's policy, or none." }],
      getEl: () => oblCell("Procedure section", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Procedure section", 1)?.scrollIntoView({ block: "center", inline: "nearest" }),
      pointAt: () => oblCell("Procedure section", 1),
      alsoShow: () => (innerWidth > 700 ? $(POLICY_WINDOW) : null),
      nextWhen: () => cellIn(oblCell("Procedure section", 1)),
      doIt: "Fill row 1",
    },
    finish("Do the other seven the same way. **Mark step complete** unlocks once all eight are filled."),
  ],

  "T3.2-4": [
    {
      title: "Rate coverage",
      icon: "table",
      body: "The note above the work quotes rule **R11**. Each row shows the three things R11 counts: its control, its policy and its procedure.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "How to read a row",
      icon: "info",
      body: "For each row:",
      steps: [
        { lead: "Count what it has", text: "A control, a policy, and a procedure unless it says none." },
        { lead: "Read R11 for that count", text: "R11 gives the rating." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Rate row 1",
      icon: "edit",
      body: "Count what row 1 shows, then read R11 for that count.",
      steps: [
        { lead: "A control: yes", text: "**ISO/IEC 27001 control** holds A.5.34." },
        { lead: "A policy: yes", text: "**BKB policy** holds BKB-POL-017." },
        { lead: "A procedure: read **Procedure section**", text: "If it says none, the row has two of the three." },
        { lead: "Two of three is **Partial**", text: "R11: Partial = only one or two of the three exist. Had you typed a procedure's number, all three exist and the row is Full." },
      ],
      tips: [{ kind: "note", text: "Next unlocks once the rating follows R11 for what row 1 holds." }],
      getEl: () => oblCell("Coverage (R11)", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Coverage (R11)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Coverage (R11)", 1),
      // R11 on row 1's own cells: a control and a policy are in from steps 1 and 2, so the procedure decides.
      nextWhen: () => {
        const sel = oblCell("Coverage (R11)", 1) as HTMLSelectElement | null;
        const none = [...(sel?.closest("tr")?.querySelectorAll("td") ?? [])].some((td) => !td.querySelector("select") && /^none$/i.test((td as HTMLElement).innerText.trim()));
        return selIn("Coverage (R11)", 1) && sel!.value === (none ? "Partial" : "Full");
      },
      doIt: "Rate row 1",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Rate the other seven. Once every row has a rating, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.2-5": [
    {
      title: "Now the gap sentences",
      icon: "table",
      body: "Your answer is in. Part 2: every row you rated **Partial** or **None** gets a gap sentence, in rule R12's frame. A Full row has none.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLearn("Sentence frames", "The frames the office writes in. Yours is the Gap frame: two blanks, what is missing and who owns it.", FRAMES_WINDOW),
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
      body: "Write the first open row's sentence. If you rated row 1 Partial, it is row 1, Information security of PII.",
      steps: [
        { lead: "Say what the row lacks", text: "Row 1 has a control and a policy, and its Procedure section says none. So it lacks a procedure: \"Missing: procedure for information security of PII.\"" },
        { lead: "Then name its policy's owner", text: "Row 1's policy is BKB-POL-017. Its row in Section 3 gives the Owner as Group Data Protection Officer." },
        { lead: "Type the whole sentence", text: "**Missing: procedure for information security of PII. Owner: Group Data Protection Officer.**" },
      ],
      tips: [{ kind: "unsure", text: "If your first open row is another one, write it the same way: what that row lacks, then the owner of its own policy." }],
      getEl: () => firstInput("Gap sentence (R12)")?.closest("td") ?? $('[data-guide="register"]'),
      onEnter: () => firstInput("Gap sentence (R12)")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => firstInput("Gap sentence (R12)"),
      alsoShow: () => (innerWidth > 700 ? $(POL000_WINDOW) : null),
      nextWhen: () => !firstInput("Gap sentence (R12)") || cellIn(firstInput("Gap sentence (R12)")),
      doIt: "Write the first gap sentence",
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("Write the rest the same way. **Mark step complete** unlocks once every Partial or None row has its sentence."),
  ],

  "T3.2-6": [
    {
      title: "Where it can be checked",
      icon: "table",
      body: "An assessor checks a mapping by opening its source. **Evidence ref** names the row's policy and the section you read in it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openScreen("policies", "Policies", "Policy Library", "The policies your rows name carry this step's tag.", LIBRARY_WINDOW),
    {
      title: "Open row 1's policy",
      icon: "book",
      body: "Row 1's **BKB policy** cell names it. Click that policy in the list to see its section numbers.",
      getEl: () => $(LIBRARY_WINDOW),
      waitFor: () => !!$(POLICY_WINDOW),
      doIt: "Click row 1's policy",
    },
    {
      title: "Fill row 1",
      icon: "edit",
      body: "Row 1's policy is BKB-POL-017. In step 3 you read its Section 6, the list of procedures, and found none that fits. So a reader checks the row there: type **BKB-POL-017 Section 6**.",
      tips: [{ kind: "note", text: "A row with a procedure cites that procedure's section, such as BKB-POL-017 Section 6.1. Next unlocks once the cell names the row's policy and that section." }],
      getEl: () => oblCell("Evidence ref", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("Evidence ref", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("Evidence ref", 1),
      alsoShow: () => (innerWidth > 700 ? $(POLICY_WINDOW) : null),
      nextWhen: () => cellIn(oblCell("Evidence ref", 1)),
      doIt: "Fill row 1",
    },
    finish("Fill the other seven. **Mark step complete** unlocks once all eight are in."),
  ],

  "T3.2-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **MAP-XW**: your 8 requirements mapped to a policy, a control and a procedure, rated, with their gaps. T4.1, T7.1 and T8.2 work from it, and the Statement of Applicability builds on it. This step checks it, names it and submits it, once its second sheet is filled.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "A late requirement",
      icon: "inbox",
      body: "At work, a crosswalk is rarely closed on the first try: the Data Protection Officer has a message about one more requirement. Open it from the **Inbox** on the toolbar and confirm it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Sheet 2",
      icon: "table",
      body: "Below your 8 rows is a **second sheet**: requirement M9. You map it as you mapped the others, all in one go; the dot marks each place you used in steps 1 to 4.",
      onEnter: () => $('[data-reg="MAP-EXTRA"]')?.scrollIntoView({ block: "nearest" }),
      getEl: () => $('[data-reg="MAP-EXTRA"]'),
    },
    // M9's row from start to finish, each cell with the screen it is read from opened first (tester, 18 Nov 2026).
    ...openScreen("policies", "Policies", "Map to Framework", "The look-up: key words, and the BKB policy that covers them.", MTF_WINDOW),
    ...openLib(7, "BKB-POL-000", "The Policy Framework and Index", POL000_WINDOW),
    {
      title: "Its policy first",
      icon: "edit",
      body: "Find M9's policy first, in **BKB policy**.",
      steps: [
        { lead: "Read M9's requirement and find its key word in Map to Framework", text: "M9 is GDPR Art.33: notification of a personal data breach to the supervisory authority. The row breach, incident, notification names BKB-POL-014." },
        { lead: "Check that policy's title in BKB-POL-000 Section 3", text: "BKB-POL-014 is the Incident Management and Breach Notification Policy. That is what M9 asks." },
        { lead: "Choose **BKB-POL-014** in **BKB policy**" },
      ],
      onEnter: () => mapXCell("BKB policy")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => mapXCell("BKB policy")?.closest("td") ?? null,
      pointAt: () => mapXCell("BKB policy"),
      alsoShow: () => (innerWidth > 700 ? $(MTF_WINDOW) : null),
      nextWhen: () => !!(mapXCell("BKB policy") as HTMLSelectElement | null)?.value && mapXCell("BKB policy")!.getAttribute("aria-invalid") !== "true",
      doIt: "Choose M9's policy",
    },
    ...openCrosswalk("Crosswalk View lists each policy with its Annex A controls."),
    rowCell("Its control", "ISO/IEC 27001 control", t327Row, "Crosswalk View has one row per policy.", {
      steps: [
        { lead: "Find BKB-POL-014's row", text: "Its Annex A column reads A.5.24–A.5.28: five controls about incidents." },
        { lead: "Read their titles in the cell's list", text: "A.5.26 is Response to information security incidents. Telling the authority of a breach is part of responding to it." },
        { lead: "Choose **A.5.26** in **ISO/IEC 27001 control**" },
      ],
      alsoShow: () => (innerWidth > 700 ? $(XW_WINDOW) : null),
    }),
    ...openScreen("policies", "Policies", "Policy Library", "Every BKB policy is in it.", LIBRARY_WINDOW),
    {
      title: "Open M9's policy",
      icon: "book",
      body: "Click the policy you chose for M9. Its Section 6 holds its procedures.",
      getEl: () => $(LIBRARY_WINDOW),
      // The index is open already and is a BKB-POL window too: only another policy's window counts.
      waitFor: () => !!$(M9_POLICY_WINDOW),
      doIt: "Click M9's policy",
    },
    rowCell("Its procedure", "Procedure section", t327Row, "The headings \"Procedure: …\" under **Section 6** of the policy are its procedures, each named after what it does.", {
      steps: [
        { lead: "Read the three headings", text: "6.1 Incident response lifecycle, 6.2 Personal-data breach notification assessment, 6.3 Which regimes apply, and their deadlines." },
        { lead: "Find the one that carries out M9's requirement", text: "M9 is notifying a personal data breach. 6.2 is the procedure that decides and makes that notification." },
        { lead: "Type **6.2** in **Procedure section**" },
      ],
      onEnter: () => $(`${M9_POLICY_WINDOW} [data-sec="6"]`)?.scrollIntoView({ block: "start" }),
      alsoShow: () => (innerWidth > 700 ? $(M9_POLICY_WINDOW) : null),
    }),
    rowCell("Its coverage", "Coverage (R11)", t327Row, "Rule **R11** counts three things on the row: a control, a policy and a procedure. M9's row now holds all three: A.5.26, BKB-POL-014 and Section 6.2. All three is Full, so choose **Full** in **Coverage (R11)**."),
    {
      title: "A gap sentence, or none",
      icon: "info",
      body: "Only a row rated Partial or None takes a sentence in **Gap sentence (R12)**, written in rule R12's frame as in step 5. M9 is Full: it has no gap, and the cell records a dash by itself.",
      getEl: () => $('[data-reg="MAP-EXTRA"]'),
    },
    rowCell("Its evidence ref", "Evidence ref", t327Row, "**Evidence ref** says where a reader can check the row: M9's policy, then the section you read in it. You read the procedure in Section 6.2 of BKB-POL-014, so type **BKB-POL-014 Section 6.2**.", {
      tips: [{ kind: "note", text: "That is M9's full row." }],
    }),
    {
      title: "No empty cells",
      icon: "check",
      body: "An empty cell fails the automated review. Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6"),
  ],

  "T3.2-8": [
    {
      title: "Your Statement of Applicability",
      icon: "table",
      body: "The **Statement of Applicability** (clause 6.1.3 d) is the auditor's map of the ISMS: every Annex A control, with a decision and a justification. A colleague pre-filled T-LI-SOA, rolled forward from an older SoA. Check it before you build on it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(8, "Ref-27002 attributes"),
    {
      title: "How to compare",
      icon: "search",
      body: "This page lists the 93 controls of the current edition, with their titles. Go down the template theme by theme, with each title here beside it. The numbers will match; look for **words** that differ.",
      getEl: () => $(PAGE_WINDOW("Ref-27002 attributes")),
    },
    {
      title: "Now find them",
      icon: "edit",
      body: "Work down from A.5.1 and click the first title that is not the standard's. A wrong cell says so, and the question then moves on.",
      tips: [
        { kind: "note", text: "Drag the page aside if it covers the question." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once both are found."),
  ],

  "T3.2-9": [
    {
      title: "Applicable or not",
      icon: "table",
      body: "Every control gets a decision. Rule **L06** says when a control may be Not applicable; it starts from **Ref-SoA exclusions**, the Group's decision for your organisation.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-SoA exclusions"),
    {
      title: "Decide for A.5.1",
      icon: "edit",
      body: "Decide for A.5.1, Policies for information security.",
      steps: [
        { lead: "Find LearnTech's row in Ref-SoA exclusions", text: "Its Excluded controls cell names one control: A.8.30 Outsourced development. The other 92 are applicable." },
        { lead: "Is A.5.1 that control?", text: "No. Rule L06: a control is Not applicable only if it appears in Ref-SoA exclusions." },
        { lead: "Choose **Applicable** for A.5.1" },
      ],
      getEl: () => oblCell("Applicable (L06)", 1)?.closest("td") ?? null,
      pointAt: () => oblCell("Applicable (L06)", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-SoA exclusions")) : null),
      nextWhen: () => selIs("Applicable (L06)", 1, "Applicable"),
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
      body: "Every row also says **why**. Rule L06 takes the first source in its order, starting with LearnTech's risk register: a risk whose treatment uses the control.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(9, "RA-36 Risk register (HQ Istanbul)"),
    {
      title: "An example",
      icon: "book",
      body: "A.8.7 Protection against malware:",
      steps: [
        { lead: "Read the register's controls column from the top" },
        { lead: "Stop at the first risk that lists the control", text: "R-36-HQ-01 lists A.8.7 first, so A.8.7's justification is **R-36-HQ-01**." },
      ],
      tips: [
        { kind: "note", text: "A range such as A.7.1–A.7.7 includes every control between." },
      ],
      getEl: () => $(PAGE_WINDOW("RA-36 Risk register (HQ Istanbul)")),
    },
    {
      title: "Justify A.5.1",
      icon: "edit",
      body: "Now A.5.1's justification, by L06's order.",
      steps: [
        { lead: "First source: a risk treatment", text: "Read the register's controls column from the top for A.5.1. No risk lists it. A.5.14 and A.5.19 are other controls." },
        { lead: "Next: a law or a contract", text: "The step's note says neither names an Annex A control." },
        { lead: "So the last source applies", text: "Choose **Group baseline (BKB-POL-001)** in **Justification (L06)**." },
      ],
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
      body: "Once every row has a decision, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.2-10": [
    {
      title: "Implementation status",
      icon: "table",
      body: "For your 12 deep-dive controls the SoA says whether each is **in place**, and an auditor takes that as fact. A colleague drafted the column; you check it. Rule **L07** reads the status from two sheets of LearnTech's workbook TSA-36: **Control_Mapping**, then **Roadmap**.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(10, "TSA-36 Control_Mapping"),
    {
      title: "An example",
      icon: "book",
      body: "A.8.15 Logging has a row in Control_Mapping with its products, so under L07 its status is **Yes**. A control with no row here is looked for in **TSA-36 Roadmap**, also tagged Step 10 in Reference pages.",
      getEl: () => $(PAGE_WINDOW("TSA-36 Control_Mapping")),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take A.5.16, Identity management.",
      steps: [
        { lead: "Look for it in Control_Mapping", text: "A.5.16 has a row there, and its Implementing product(s) cell lists products." },
        { lead: "Work out its status by L07", text: "Product listed is Yes." },
        { lead: "Compare with the draft", text: "The draft says Yes too. This row is right: leave it." },
      ],
      getEl: () => oblCell("Implemented (L07)", 16)?.closest("td") ?? null,
      pointAt: () => oblCell("Implemented (L07)", 16),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("TSA-36 Control_Mapping")) : null),
    },
    ...openPage(10, "TSA-36 Roadmap"),
    // A row the draft has wrong, corrected by the learner: A.7.14 (row 59 of Annex A).
    rowCell("One that differs", "Implemented (L07)", () => oblCell("Implemented (L07)", 59), "Now A.7.14, Secure disposal or re-use of equipment. The draft says Yes.", {
      steps: [
        { lead: "Look for A.7.14 in Control_Mapping", text: "It has no row there, so no product is listed." },
        { lead: "Look for it in Roadmap", text: "It is there: a certified destruction service, target 2027 Q2. Something planned is not yet in place." },
        { lead: "Listed in the Roadmap only is **Planned**", text: "Change A.7.14's Yes to **Planned**." },
      ],
      nextWhen: () => selIs("Implemented (L07)", 59, "Planned"),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("TSA-36 Roadmap")) : null),
      doIt: "Correct A.7.14's status",
    }),
    checkBeside(PAGE_WINDOW("TSA-36 Control_Mapping"), "Check the other ten the same way: Control_Mapping first, then Roadmap for any control it does not list. Then Check my answers shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T3.2-11": [
    {
      title: "Each control's concept",
      icon: "table",
      body: "ISO/IEC 27002 tags every control with attributes. Its **cybersecurity concept** (Identify, Protect, Detect, Respond, Recover) lets a control set be read against NIST CSF's functions. A colleague drafted this column from memory; rule L05 says it comes from the page, so you check it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(11, "Ref-27002 attributes"),
    {
      title: "An example",
      icon: "book",
      body: "A.5.24, Information security incident management planning and preparation, reads \"Respond, Recover\" under **Cybersecurity concepts**: both are copied, as written.",
      getEl: () => $(PAGE_WINDOW("Ref-27002 attributes")),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take A.5.16, Identity management.",
      steps: [
        { lead: "Find its row on the page", text: "Its last column, Cybersecurity concepts, reads Protect." },
        { lead: "Compare with the draft", text: "The draft says Protect too. This row is right: leave it." },
      ],
      getEl: () => oblCell("Cybersecurity concept (L05)", 16)?.closest("td") ?? null,
      pointAt: () => oblCell("Cybersecurity concept (L05)", 16),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27002 attributes")) : null),
    },
    // A row the draft has wrong, corrected by the learner: A.7.11 (row 56 of Annex A).
    rowCell("One that differs", "Cybersecurity concept (L05)", () => oblCell("Cybersecurity concept (L05)", 56), "Now A.7.11, Supporting utilities. The draft says Protect.", {
      steps: [
        { lead: "Find A.7.11's row on the page", text: "Its Cybersecurity concepts cell reads Protect, Detect: two concepts." },
        { lead: "Compare with the draft", text: "The draft kept the first and lost the second. Rule L05 copies the cell whole." },
        { lead: "Choose **Protect, Detect** in the row's list" },
      ],
      nextWhen: () => selIs("Cybersecurity concept (L05)", 56, "Protect, Detect"),
      onEnter: () => [...document.querySelectorAll<HTMLElement>(`${PAGE_WINDOW("Ref-27002 attributes")} tr`)].find((tr) => /^\s*A\.7\.11\b/.test(tr.innerText))?.scrollIntoView({ block: "center" }),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27002 attributes")) : null),
      doIt: "Correct A.7.11's concept",
    }),
    checkBeside(PAGE_WINDOW("Ref-27002 attributes"), "Check the other ten the same way. Then Check my answers shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // The question of step 12, in its row (its second part is done in Frameworks › Export Mapping).

  "T3.2-12q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. Part 1 is a question about the Statement of Applicability.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-12 [data-guide="decision"]'),
    },
    ...openPage(12, "Ref-Rules"),
    {
      title: "Rule L06",
      icon: "book",
      body: "Read rule **L06**: when a control may be Not applicable, and where an applicable control's justification comes from, in order. Hold it against the situation.",
      getEl: () => l06Row() ?? $(PAGE_WINDOW("Ref-Rules")),
      onEnter: () => l06Row()?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-12 [data-guide="decision"]'),
      pointAt: () => $('#act-12 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-12 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-12 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from **Open Export Mapping**, below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
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
      body: "Click **Check consistency**. Next unlocks once it has run.",
      getEl: () => $('[data-guide="consistency"]'),
      pointAt: () => $('[data-guide="consistency"] button'),
      nextWhen: () => !!$('[data-guide="consistency-result"]'),
      doIt: "Click Check consistency",
    },
    {
      title: "Fix, then check again",
      icon: "info",
      body: "Each row the check lists appears in the table.",
      steps: [
        { lead: "Re-apply L06 to that row" },
        { lead: "Click **Check consistency** again" },
      ],
      tips: [
        { kind: "note", text: "It also lists a Not applicable control that a risk in RA-36 Risk register uses as a treatment." },
      ],
      getEl: () => $('[data-guide="consistency-result"]'),
    },
    finish("**Mark step complete** unlocks once a check has run and no row breaks L06."),
  ],

  "T3.2-13": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is **LI-SOA**: the 93 controls with your decisions. The risk treatment plan (T7.1), the gap analysis (T7.2) and the management review (T12.1) read it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber here, and this line counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 12"),
  ],

  "T4.1-1": [
    {
      title: "Your currency checklist",
      icon: "table",
      body: "At work, before you test what a policy says, you check that it is **current**: owned, approved, in date and made known to the people it binds. POL-CUR lists six such checks for BKB-POL-006. For each:",
      steps: [
        { lead: "Copy the value from the policy" },
        { lead: "Decide Yes or No", text: "Does the value meet the check?" },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The document-control table",
      icon: "book",
      body: "**Section 11** lists the policy's fields, one per row: who owns it, who approved it, its dates, its status. The bar at the top of the window jumps to Section 11.",
      getEl: () => $(`${POL006_WINDOW} [data-sec="11"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="11"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A check \"Classification is set\" would copy the Classification row, **Internal**, and decide **Yes**.",
      tips: [
        { kind: "note", text: "A field left empty, or a value the rule does not allow, is a **No**." },
      ],
      getEl: () => $(`${POL006_WINDOW} [data-sec="11"]`) ?? $(POL006_WINDOW),
    },
    {
      title: "Copy the first value",
      icon: "edit",
      body: "The first check reads \"Document owner is named\", so the field to copy is Document owner. In Section 11's table, the Document owner row reads **Group CISO**. Type **Group CISO** in **Value copied**.",
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
      body: "Does the value meet the check? The check asks that an owner is named. Section 11 names one, the Group CISO, so the field is not empty: choose **Yes**.",
      tips: [{ kind: "note", text: "A line that cites BKB-POL-000 is held against that section too. The dates line, for example, is read against Section 7's annual review." }],
      alsoShow: () => (innerWidth > 700 ? $(POL006_WINDOW) : null),
      getEl: () => famCell("Yes/No", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Yes/No", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Yes/No", 1),
      nextWhen: () => selIs("Yes/No", 1, "Yes"),
      doIt: "Choose Yes or No",
    },
    {
      title: "The other five",
      icon: "info",
      body: "Do the other five the same way. Some checks hold the value against **BKB-POL-000**:",
      steps: [
        { lead: "Section 2", text: "Who approves a policy." },
        { lead: "Section 7", text: "How its lifecycle runs." },
      ],
      tips: [
        { kind: "note", text: "BKB-POL-000 is tagged Step 1 in the Policy Library too." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Once every line has a value and a Yes or No, click **Check my answers**. It shows each line's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.1-2": [
    {
      title: "Your gap table",
      icon: "table",
      body: "At work, a policy review tests each requirement the policy must meet against what it actually says. POL-GAP holds seven: six from dataset POL-GAP, and Q7 from the Compliance Manager in the Inbox. You test them in **Frameworks › Gap Finder**. First, find the clause that holds each one's action words, or none.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "An example",
      icon: "book",
      body: "\"Leavers' access must be removed within a defined time\":",
      steps: [
        { lead: "Pick out its action words", text: "remove, leavers, access." },
        { lead: "Find the clause that holds them", text: "Section 3.1's fifth bullet, so the clause is **BKB-POL-006 Section 3.1 bullet 5**." },
      ],
      tips: [
        { kind: "note", text: "Bullets are counted from the top of Section 3.1." },
      ],
      getEl: () => $(`${POL006_WINDOW} [data-sec="3.1"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Q1 yourself",
      icon: "edit",
      body: "Q1 reads \"Access to source code must be restricted.\"",
      steps: [
        { lead: "Pick out its action words", text: "restrict, access, source code." },
        { lead: "Look for them in the policy", text: "Read the seven bullets of Section 3.1 and the headings of Section 6. They cover least privilege, shared accounts, MFA, privileged access, leavers, reviews and AI agents. None names source code." },
        { lead: "Look in BKB-ADD-16 Section 5 and Section 6", text: "Its BKB-POL-006 rows are about access reviews and session recording. No source code there either." },
        { lead: "No clause holds the words, so choose **none**" },
      ],
      getEl: () => famCell("Policy clause", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Policy clause", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Policy clause", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL006_WINDOW) : null),
      nextWhen: () => selIs("Policy clause", 1, "none"),
      doIt: "Choose Q1's clause",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do Q2 to Q7 the same way, and reply to the Compliance Manager in the Inbox. Once every row has a clause or none, click **Check my answers**: it shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.1-3": [
    {
      title: "Rate coverage",
      icon: "table",
      body: "A clause found is not yet a requirement met. Rule **R13** sets the three ratings; each row shows the clause you found in step 2.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openLearn("Rule tables", "Rule R13 is in the rule tables, tagged with this step.", RULES_WINDOW),
    ...openLib(3, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "How to read a row",
      icon: "info",
      body: "Hold the requirement against its clause:",
      steps: [
        { lead: "Is it the same action?" },
        { lead: "Does the requirement ask for a time limit or an owner?", text: "If so, does the clause give one?" },
      ],
      tips: [
        { kind: "note", text: "Example: \"Leavers' access must be removed within a defined time\" against Section 3.1 bullet 5, \"within 4 hours\": same action, a time limit given, so **Covered**." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "Rate Q1",
      icon: "edit",
      body: "Q1's **Policy clause**, from step 2, reads none: no clause is about source code. Rule R13 says Not covered = no clause. So choose **Not covered** for Q1.",
      tips: [{ kind: "note", text: "A row with a clause is read further: same action and same time limit is Covered. An action that is only recommended, or a missing time limit, is Partly." }],
      alsoShow: () => (innerWidth > 700 ? $(RULES_WINDOW) : null),
      getEl: () => famCell("Coverage (R13)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Coverage (R13)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Coverage (R13)", 1),
      nextWhen: () => selIs("Coverage (R13)", 1, "Not covered"),
      doIt: "Rate Q1",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Rate Q2 to Q7. Once every row has a rating, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.1-4": [
    {
      title: "Where each fix belongs",
      icon: "table",
      body: "A gap is fixed in one of two places: the **Group policy**, for every organisation, or **GlobalConnect's addendum**. Rule R13 has the test that tells them apart. A covered row has no gap and shows —.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openLearn("Rule tables", "Rule R13 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Your first gap",
      icon: "edit",
      body: "In a correct step 3 the first open row is Q1. R13's test: does the requirement name a country or an office?",
      steps: [
        { lead: "Read Q1's **Requirement statement**", text: "\"Access to source code must be restricted.\" No country, no office." },
        { lead: "Read its **Source**", text: "ISO/IEC 27001 A.8.4: an international standard, not one country's law." },
        { lead: "It names neither, so choose **Group policy**", text: "The wording is added to BKB-POL-006 and binds every organisation of the Group." },
      ],
      tips: [{ kind: "note", text: "A row that names an office, such as Phoenix, goes to **Organisation addendum** instead." }],
      getEl: () => firstInput("Fix location (R13)")?.closest("td") ?? $('[data-guide="register"]'),
      onEnter: () => firstInput("Fix location (R13)")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => firstInput("Fix location (R13)"),
      // Q1's own answer where the first open row is Q1 (it is in a correct step 3); any choice on another row.
      nextWhen: () => {
        const el = firstInput("Fix location (R13)") as HTMLSelectElement | null;
        return !!el?.value && (!/^Fix location \(R13\), row 1$/.test(el.getAttribute("aria-label") ?? "") || el.value === "Group policy");
      },
      doIt: "Choose where the first fix belongs",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Put the same test to each of the other gaps. Then click **Check my answers**: it shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "assuming every gap goes to the same place. Test each one." },
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.1-5": [
    {
      title: "Now the redlines",
      icon: "table",
      body: "A **redline** is the wording you propose to close a gap, in policy language. The policy owner reads it; if approved it becomes a corrective action in T12.1. R13's frame, also in Learn › Sentence frames: \"<Role> shall <action> within <time limit>.\"",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "First, the role",
      icon: "book",
      body: "You work one redline from start to finish: Q1, \"Access to source code must be restricted.\" Start with who must act.",
      steps: [
        { lead: "Ask who sets access in this policy", text: "Section 6's procedures name who does each step in their Responsible column." },
        { lead: "Read Section 6.1, step 3", text: "\"Provision the approved role only\" is done by the IAM team. In Section 6.2 the IAM team also removes access. Restricting access is their work." },
        { lead: "So the role is **IAM team**", text: "Written as the policy writes it. A role the policy does not name is flagged." },
      ],
      getEl: () => $(`${POL006_WINDOW} [data-sec="6.1"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Then the action",
      icon: "info",
      body: "The action is what that role must do so that the row's **Requirement statement** is met.",
      steps: [
        { lead: "Read Q1's requirement", text: "\"Access to source code must be restricted.\"" },
        { lead: "Turn it into something the role does", text: "restrict access to source code to the staff whose role needs it." },
        { lead: "Keep the policy's own principle", text: "The policy window has moved to **Section 3.1 Policy statements**. Its first bullet grants access on least privilege and need-to-know. The action says the same for source code." },
      ],
      getEl: () => firstInput("Redline (R13 frame)")?.closest("tr") ?? $('[data-guide="register"]'),
      // The requirement the card reads: where the card has no room clear of the row, it keeps off this cell.
      pointAt: () => (firstInput("Redline (R13 frame)")?.closest("tr")?.children[1] as HTMLElement | undefined) ?? null,
      alsoShow: () => $(POL006_WINDOW),
      onEnter: () => {
        $(`${POL006_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" });
        // The table back at its left edge: the Redline column the earlier look at the row scrolled to cut the requirement off.
        firstInput("Redline (R13 frame)")?.closest("tr")?.children[1]?.scrollIntoView({ block: "nearest", inline: "end" });
      },
    },
    {
      title: "Then the time limit",
      icon: "clock",
      body: "A redline says how soon. Look for a time limit a document already sets for this action.",
      steps: [
        { lead: "Is there one for source code?", text: "No. Neither BKB-POL-006 nor BKB-ADD-16 Section 5 sets one, so you propose your own. It is reviewed, not marked." },
        { lead: "Take one the policy uses for a like action", text: "Section 6.2, step 3: access a review rejects is removed within 5 working days. Restricting source code also removes access people should not hold." },
        { lead: "So the time limit is **5 working days**", text: "Never looser than a Group value for the same thing. If only a looser one would do, the redline is \"Exception needed\"." },
      ],
      getEl: () => $(`${POL006_WINDOW} [data-sec="6.2"]`) ?? $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Write the first one",
      icon: "edit",
      body: "Join the three in R13's frame, in Q1's **Redline (R13 frame)**: **IAM team shall restrict access to source code to the staff whose role needs it within 5 working days.**",
      tips: [
        { kind: "note", text: "Your own wording is fine. Next unlocks once the sentence has a role the policy names, \"shall\", an action and a time limit." },
        { kind: "unsure", text: "If your first open row is not Q1, build its sentence the same way: role, action, time limit." },
      ],
      // The whole row is lit, not the one cell, and the policy stays live beside it (tester, 22 Nov 2026: with the box
      // open nothing else could be clicked, and the redline is written from the row's requirement and the policy's roles).
      getEl: () => firstInput("Redline (R13 frame)")?.closest("tr") ?? $('[data-guide="register"]'),
      onEnter: () => firstInput("Redline (R13 frame)")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => firstInput("Redline (R13 frame)"),
      alsoShow: () => $(POL006_WINDOW),
      nextWhen: () => !firstInput("Redline (R13 frame)") || cellIn(firstInput("Redline (R13 frame)")),
      doIt: "Write the first redline",
    },
    finish("Write the rest the same way, and answer the message from the Policy & Governance Analyst in the Inbox. **Mark step complete** unlocks once every gap has its redline and the message its reply. An assessor reads what they say at checkpoint HC2."),
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
      body: "An empty cell fails the automated review. Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while either count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: `${c.body} Name both: one box for POL-CUR, one for POL-GAP.` } : c)),
  ],

  "T4.1-7": [
    {
      title: "Clause 5.2 checklist",
      icon: "table",
      body: "At work, an ISO/IEC 27001 implementer checks the top-level information security policy against **clause 5.2** before the certification audit, which reads it first. The template lists the seven things 5.2 asks for, each with a key word. Rule **L08**: search BKB-POL-001 for it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-POL-001", "The Information Security Policy", POL001_WINDOW),
    {
      title: "An example",
      icon: "book",
      body: "Searching for \"risk\": Section 3.1 has it (\"Risks to information are assessed …\"), so an item with that key word would be **Found, section 3.1**. A word in no section is a **Gap**.",
      getEl: () => $(`${POL001_WINDOW} [data-sec="3.1"]`) ?? $(POL001_WINDOW),
      onEnter: () => $(`${POL001_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Item a) yourself",
      icon: "edit",
      body: "Item a) asks that the policy is appropriate to the purpose of the organisation. Its **Key word** is \"purpose\".",
      steps: [
        { lead: "Search BKB-POL-001 for \"purpose\"", text: "Section 1 is headed Purpose, and its text says the policy fits the purpose and the business of each Group organisation." },
        { lead: "The word is there, so choose **Found**", text: "A key word in no section would be a Gap." },
        { lead: "Type **1** in **Section**", text: "The number of the section the word is in." },
      ],
      tips: [
        { kind: "note", text: "Next unlocks once the row is complete." },
      ],
      getEl: () => famCell("Found/Gap (L08)", 1)?.closest("tr") ?? null,
      onEnter: () => famCell("Found/Gap (L08)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Found/Gap (L08)", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL001_WINDOW) : null),
      // A Gap needs no section (it shows —); Found needs one the policy has.
      nextWhen: () => selIs("Found/Gap (L08)", 1, "Found") && cellIn(famCell("Section", 1)),
      doIt: "Decide item a)",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other six. Once every item is decided, click **Check my answers**. It shows each item's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.1-8": [
    {
      title: "Leadership evidence",
      icon: "table",
      body: "Clause 5.1 asks top management to show commitment to the ISMS. An implementer keeps a list of that evidence and where each piece is stored, so the auditor can go straight to it. A colleague drafted this list from memory; you check it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(8, "Ref-Leadership"),
    {
      title: "How to check a row",
      icon: "search",
      body: "Take row 1, Charter approved by the Board.",
      steps: [
        { lead: "Find its item on the page", text: "It is the first row of Ref-Leadership." },
        { lead: "Read across to where it is stored", text: "The page says 01_Charter." },
        { lead: "Compare with the draft, character by character", text: "The draft says 01_Charter too. This row is right: leave it." },
      ],
      getEl: () => famCell("Where it is stored", 1)?.closest("td") ?? null,
      pointAt: () => famCell("Where it is stored", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Leadership")) : null),
    },
    // A row the draft has wrong, corrected by the learner: the second.
    rowCell("One that differs", "Where it is stored", () => famCell("Where it is stored", 2), "Now row 2, Information security policy signed by top management.", {
      steps: [
        { lead: "Read the draft", text: "It ends with BKB-POL-006 document-control table." },
        { lead: "Read the page", text: "It ends with BKB-POL-001 document-control table. BKB-POL-001 is the Information Security Policy, the top-level one clause 5.1 is about. BKB-POL-006 is the access policy this task reviews." },
        { lead: "Choose the entry that names **BKB-POL-001**", text: "One digit differs, and it would send the auditor to the wrong document." },
      ],
      nextWhen: () => /BKB-POL-001/.test((famCell("Where it is stored", 2) as HTMLSelectElement | null)?.value ?? ""),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Leadership")) : null),
      doIt: "Correct row 2",
    }),
    checkBeside(PAGE_WINDOW("Ref-Leadership"), "Check the other three the same way. Then Check my answers shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // The question of step 9, in its row (its second part, the RACI, is done in Review & Redline).
  "T4.1-9q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. Part 1 is a question about the RACI: who answers for the Statement of Applicability.",
      steps: [
        { lead: "Read the situation box first" },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-9 [data-guide="decision"]'),
    },
    ...openScreen("policies", "Policies", "Policy Library", "The library is tagged Step 9.", LIBRARY_WINDOW),
    {
      title: "Open Charter",
      icon: "book",
      body: "Click **Charter**, the BKB Group GRC Charter. It is tagged Step 9.",
      getEl: () => $(`${LIBRARY_WINDOW} [data-doc="Charter"]`),
      waitFor: () => !!$(CHARTER_WINDOW),
      doIt: "Click Charter",
    },
    {
      title: "Three lines, and independence",
      icon: "book",
      body: "Hold the three options against the Charter:",
      steps: [
        { lead: "Section 5.2", text: "Which line each function sits in." },
        { lead: "Section 17", text: "Who may approve what." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the document jumps to each." },
      ],
      getEl: () => $(`${CHARTER_WINDOW} [data-sec="5.2"]`) ?? $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="5.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-9 [data-guide="decision"]'),
      pointAt: () => $('#act-9 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-9 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-9 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from **Open Review & Redline**, below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-9 [data-guide="show-me-how"]'),
    },
  ],

  "T4.1-9": [
    {
      title: "Now the RACI",
      icon: "table",
      body: "Your answer is in. Part 2: the **Accountable** role of each of the ten ISMS processes. A RACI with exactly one A per row tells everyone who answers for each process; LI-15 and T7.2 reuse these roles.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-ISMS processes"),
    {
      title: "How to read it",
      icon: "book",
      body: "The **Owner (Accountable)** column names one role per process. Where it adds a note, as in \"Role (who else decides)\", the A is the role named **first**.",
      getEl: () => $(PAGE_WINDOW("Ref-ISMS processes")),
    },
    {
      title: "The first process",
      icon: "edit",
      body: "The first process is Risk assessment and treatment. Its **Owner (Accountable)** cell on the page reads \"Cyber Risk Manager (risk owners decide; CRCO accepts Medium)\". The words in brackets are a note about who else decides. The A is the role named first: choose **Cyber Risk Manager**.",
      getEl: () => famCell("Accountable (A)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Accountable (A)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Accountable (A)", 1),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-ISMS processes")) : null),
      nextWhen: () => selIs("Accountable (A)", 1, "Cyber Risk Manager"),
      doIt: "Choose the first process's A",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other nine. Once every process has a role, click **Check my answers**. It shows each row's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.1-10": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "**LI-POL** is one file with three sheets: the clause 5.2 checklist, the leadership evidence and the RACI. T11.1 builds its competence matrix on the RACI's roles, and T7.2 makes the A owners milestone owners. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while either count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "7 to 9"),
  ],

  "T4.2-1": [
    {
      title: "Your SOP's step table",
      icon: "table",
      body: "A policy says what must happen; a **standard operating procedure (SOP)** says who does what, in which order and by when, so a new joiner can follow it without asking. Rule **R14** fixes the six steps of every BKB SOP. Yours carries out BKB-POL-021's procedure for approving a new cloud service.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "The procedure",
      icon: "book",
      body: "**Section 6.1** lists the procedure's lines in order: each has an action, the role responsible, and its output with a time limit. The bar at the top of the window jumps to Section 6.1.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "Another procedure, BKB-POL-000 Section 6 (exceptions): its **trigger** is \"Submit exception …\", the line that starts it; its **record** is \"Register exception …\", the line that writes it down.",
      tips: [
        { kind: "note", text: "Match each SOP step to the Section 6.1 line that does what the step's name says." },
      ],
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Step 1 is **Trigger received**: the event that starts the procedure. Nothing in Section 6.1 happens until someone asks for a new cloud service, and line 1 is that request. Choose its action: **Submit request with data classification and business case**.",
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
      body: "Do steps 2 to 6, then click **Check my answers**: it shows each one's answer and why.",
      tips: [
        { kind: "note", text: "Section 6.1 has one line more than the SOP has steps: one line has no step of its own." },
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.2-2": [
    {
      title: "Now the time limits",
      icon: "table",
      body: "Your answer is in. Part 2: each SOP step's **time limit**. Each step shows the action you chose in step 1.",
      steps: [
        { lead: "Read its Section 6.1 line", text: "It gives a time limit." },
        { lead: "Check BKB-ADD-36 Section 5", text: "It may give LearnTech's own value." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "The policy's time limits",
      icon: "book",
      body: "In Section 6.1 the **Output / SLA** column gives each line's output, a dash, then its time limit.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    ...openLib(2, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "LearnTech's own values",
      icon: "book",
      body: "**Section 5** lists the values that apply to LearnTech. Its last rows name BKB-POL-021 and a Section 6.1 output. The bar at the top of the window jumps to Section 5.",
      getEl: () => $(`${ADD36_WINDOW} [data-sec="5"]`) ?? $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="5"] tr:last-child`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Step 1's line is the request, line 1 of Section 6.1.",
      steps: [
        { lead: "Read its Output / SLA, after the dash", text: "Request: at least 15 working days before planned use." },
        { lead: "Check BKB-ADD-36 Section 5", text: "Its two BKB-POL-021 rows are for the Assessment and the Decision notice. Neither is the Request, so the policy's value stands." },
        { lead: "Choose **At least 15 working days before planned use**" },
      ],
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) ?? $(ADD36_WINDOW) : null),
      getEl: () => famCell("Time limit", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Time limit", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Time limit", 1),
      nextWhen: () => selIs("Time limit", 1, limitAt(1)),
      doIt: "Choose step 1's time limit",
    },
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do steps 2 to 6. Once every step has a time limit, click **Check my answers**. It shows each step's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
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
      body: "Section 6.1's third column, **Responsible**, names the role for each line, as the SOP must write it.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Step 1's action is the request, line 1 of Section 6.1. Read across to its third column, Responsible: it names the **Business owner**, the person who wants the service. Choose **Business owner**.",
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
      body: "Do steps 2 to 6. Once every step has a role, click **Check my answers**. It shows each step's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.2-4": [
    {
      title: "The SOP's RACI",
      icon: "table",
      body: "An SOP repeats the roles of the policy it carries out, so a reader sees who answers for what. A colleague drafted this RACI from memory, and a wrong role sends people to the wrong person. You check it against **BKB-POL-021 Section 5**.",
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
      title: "How to check a row",
      icon: "search",
      body: "Take row 1, the Policy owner.",
      steps: [
        { lead: "Find its role in Section 5 and read across", text: "It reads: Maintains the policy, monitors compliance, approves procedures and guidelines, reports KPIs." },
        { lead: "Compare with the draft, word by word", text: "The draft says the same. This row is right: leave it." },
      ],
      getEl: () => famCell("Responsibility (BKB-POL-021 Section 5)", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Responsibility (BKB-POL-021 Section 5)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Responsibility (BKB-POL-021 Section 5)", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
    },
    // A row the draft has wrong, corrected by the learner: the sixth, Group GRC AI agents.
    rowCell("One that differs", "Responsibility (BKB-POL-021 Section 5)", () => famCell("Responsibility (BKB-POL-021 Section 5)", 6), "Now row 6, Group GRC AI agents.", {
      steps: [
        { lead: "Read the draft", text: "It says: Provides independent assurance over compliance with this policy." },
        { lead: "Read the role's row in Section 5", text: "It says the agents execute monitoring, testing and reporting activities under human supervision. Independent assurance is Internal Audit's line, the next one down." },
        { lead: "Choose Section 5's words for the agents", text: "The entry that starts **Execute monitoring, testing and reporting activities**." },
      ],
      nextWhen: () => /^Execute monitoring/.test((famCell("Responsibility (BKB-POL-021 Section 5)", 6) as HTMLSelectElement | null)?.value ?? ""),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      doIt: "Correct row 6",
    }),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Policy & Governance Analyst has a question about this SOP.",
      steps: [
        { lead: "Open it from the **Inbox** on the toolbar" },
        { lead: "Read Section 10, which it cites", text: "It is in the bar at the top of the policy's window." },
        { lead: "Reply" },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    checkBeside(POL021_WINDOW, "Check the other seven the same way. Then Check my answers shows each row's answer. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked and the message has your reply. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T4.2-5": [
    {
      title: "What each step leaves",
      icon: "table",
      body: "Your answer is in. Part 2: each SOP step's **output**, the record an auditor later asks for, and the **escalation contact** of the exception step.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "Outputs",
      icon: "book",
      body: "In Section 6.1 the **Output / SLA** column starts with the output, before the dash.",
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The first step yourself",
      icon: "edit",
      body: "Step 1's line is line 1 of Section 6.1. Its Output / SLA reads \"Request\", then a dash, then the time limit. The output is the part before the dash: the record the step leaves. Choose **Request**.",
      getEl: () => famCell("Output", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Output", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Output", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      nextWhen: () => selIs("Output", 1, (pol021At(1, 3) ?? "").split(" — ")[0]),
      doIt: "Choose step 1's output",
    },
    // One row takes a second cell: the exception step's contact. Its card waits on that cell, as the output's did.
    rowCell("The escalation contact", "Escalation contact", () => $('[data-guide="register"] :is(input, textarea, select)[aria-label^="Escalation contact, row "]'), "Only the exception step's row takes an **Escalation contact**. **Section 8** of the policy, now at the top of its window, names the escalation contact of its procedures.", {
      steps: [
        { lead: "Find the sentence that starts \"The escalation contact\"", text: "It reads: the escalation contact for the procedures of this policy is the policy owner, the Security Architecture & Standards Manager." },
        { lead: "Type **Security Architecture & Standards Manager** in **Escalation contact**", text: "The role by its name, as Section 8 writes it, so the reader knows whom to call." },
      ],
      onEnter: () => $(`${POL021_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
    }),
    {
      title: "Then check your answers",
      icon: "check",
      body: "Do the other outputs and the contact. Once every step has an output, click **Check my answers**: it shows each one's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked and the contact is filled."),
  ],

  "T4.2-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "**SOP-DOC** is one document: the step table, the RACI and a Records sheet. T6.2 and T8.2 test against its steps, so every cell counts. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "A late request",
      icon: "inbox",
      body: "At work, the person who approves a procedure asks who holds its proof. The policy owner has a message for you. Open it from the **Inbox** on the toolbar and confirm it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Sheet 3",
      icon: "table",
      body: "Below the RACI is the **Records** sheet: six records this procedure leaves. For each, decide who keeps it.",
      onEnter: () => $('[data-reg="SOP-EXTRA"]')?.scrollIntoView({ block: "nearest" }),
      getEl: () => $('[data-reg="SOP-EXTRA"]'),
    },
    ...openLib(6, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "How a keeper is decided",
      icon: "book",
      body: "Work out the keeper rule first.",
      steps: [
        { lead: "Read the note under Section 6.1's table", text: "It gives the rule, and when another role keeps a record instead." },
        { lead: "Read the table's lines again", text: "With that rule in mind." },
      ],
      getEl: () => $(`${POL021_WINDOW} [data-sec="6.1"]`) ?? $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The first record yourself",
      icon: "edit",
      body: "Do the Request yourself.",
      steps: [
        { lead: "Find the Section 6.1 line that produces it", text: "Line 1: its output is the Request, and its Responsible role is the Business owner." },
        { lead: "Check whether any line places it in a register", text: "Line 5 puts the service, its assessment and its matrix in the cloud service register. The request is not among them." },
        { lead: "So the first rule applies: choose **Business owner**", text: "The role responsible for the line that produces the record keeps it." },
      ],
      getEl: () => famCell("Kept by", 1)?.closest("td") ?? null,
      onEnter: () => famCell("Kept by", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => famCell("Kept by", 1),
      alsoShow: () => (innerWidth > 700 ? $(POL021_WINDOW) : null),
      nextWhen: () => selIs("Kept by", 1, pol021At(1, 2)),
      doIt: "Choose the Request's keeper",
    },
    {
      title: "The other five",
      icon: "edit",
      body: "Do the rest the same way. A keeper that does not fit is flagged at once, with where to read.",
      tips: [
        { kind: "unsure", text: "For the last record, BKB-POL-021 Section 8 and BKB-POL-000 Section 6 are in the bars of their windows." },
      ],
      getEl: () => $('[data-reg="SOP-EXTRA"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each part counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "1 to 5 and the Records sheet"),
  ],

  "T4.2-7q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. Part 1 is the **label** your SOP carries.",
      steps: [
        { lead: "Read the situation box first" },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    ...openLib(7, "BKB-STD-001", "The Information Classification Standard", STD_WINDOW),
    {
      title: "The tree",
      icon: "book",
      body: "Work the label out from the classification standard:",
      steps: [
        { lead: "Section 5: the tree", text: "Ask its questions in order and stop at the first Yes." },
        { lead: "Section 3: the tiers", text: "It describes each tier, with examples." },
        { lead: "BKB-ADD-36 Section 7: LearnTech's names", text: "Each tier's label at LearnTech. Also tagged Step 7." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the document jumps to each section." },
      ],
      // The whole window: Section 5 sits below the long Section 3 table and may still be loading when the card opens.
      getEl: () => $(STD_WINDOW),
      onEnter: () => $(`${STD_WINDOW} [data-sec="5"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
      pointAt: () => $('#act-7 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-7 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from **Open New from Template**, below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-7 [data-guide="show-me-how"]'),
    },
  ],

  "T4.2-7": [
    {
      title: "The document-control block",
      icon: "table",
      body: "At work, every controlled document is under **document control** (ISO/IEC 27001 clause 7.5): an ID, a version, an owner, an approver and dates, so the right version is the one in use. The label is your answer to the question; the block records it by itself.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-POL-000", "The Policy Framework", POL000_WINDOW),
    {
      title: "The rules for each field",
      icon: "book",
      body: "**Section 7.1**'s first table gives the rule for each field. Some point on:",
      steps: [
        { lead: "Section 2", text: "Who approves what." },
        { lead: "Section 3", text: "Who owns each policy." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the document jumps to each." },
      ],
      getEl: () => $(`${POL000_WINDOW} [data-sec="7.1"]`) ?? $(POL000_WINDOW),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    ...openScreen("policies", "Policies", "Version History", "Version History shows what exists of this SOP so far. The Version and Effective date fields depend on it.", VH_WINDOW),
    {
      title: "The ID yourself",
      icon: "edit",
      body: "The first field is the Document ID. Section 7.1's rule: the ID of the policy it implements, then \"-PR-\", then the procedure's section number.",
      steps: [
        { lead: "The policy your SOP implements", text: "BKB-POL-021." },
        { lead: "The procedure's section number in it", text: "6.1, New cloud service approval." },
        { lead: "Join them: choose **BKB-POL-021-PR-6.1**", text: "As the rule's own example joins BKB-POL-006 Section 6.3 into BKB-POL-006-PR-6.3." },
      ],
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
      body: "Fill the other fields. Once every one has a value, click **Check my answers**: it shows each field's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your values lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.2-8": [
    {
      title: "The SOP's life-cycle",
      icon: "table",
      body: "Clause 7.5.3 asks that documented information is controlled from **creation to disposal**. Before an SOP is routed for approval, LI-DOC records who does each of its seven stages. **Send for Approval** shows the route those stages must match.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(8, "BKB-POL-000", "The Policy Framework", POL000_WINDOW),
    {
      title: "Who does what",
      icon: "book",
      body: "Section 7.1's second table names a role for each stage. Where it says **Policy owner**, Section 3 tells you which role owns BKB-POL-021.",
      getEl: () => $(`${POL000_WINDOW} [data-sec="7.1"]`) ?? $(POL000_WINDOW),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="7.1"] table:last-of-type`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Create yourself",
      icon: "edit",
      body: "The **Create** row of Section 7.1's second table reads \"Policy & Governance Analyst, from the Group template\". The role is the part before the comma, and it is not \"Policy owner\", so Section 3 is not needed here. Choose **Policy & Governance Analyst**.",
      tips: [{ kind: "note", text: "Where a stage says Policy owner, choose the role Section 3 lists as owner of BKB-POL-021." }],
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
      body: "Do the other six stages. Once each has a role, click **Check my answers**. It shows each stage's answer and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.2-9": [
    {
      title: "The mandatory-documents register",
      icon: "table",
      body: "ISO/IEC 27001 requires certain documented information to exist; a certification auditor asks for each at Stage 1. For each row:",
      steps: [
        { lead: "Decide Document or Record", text: "Which the standard wants." },
        { lead: "Record where BKB keeps it" },
      ],
      tips: [
        { kind: "note", text: "Row 7.5.1 b is a worked example." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLearn("Framework Quick Reference", "The entry ISO/IEC 27001 documented information says what maintain and retain mean.", QR_WINDOW),
    {
      title: "Maintain or retain",
      icon: "book",
      body: "A **document** is kept current; a **record** is kept unchanged, as proof of what was done or found. Read each row's documented information with that in mind.",
      getEl: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 documented information"]`),
      onEnter: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 documented information"]`)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "4.3 yourself",
      icon: "edit",
      body: "The first row is clause 4.3, the ISMS scope. Is it kept current, or kept as proof? The scope changes when the organisation changes, so it is kept current: maintained. Choose **Document (maintained)**.",
      tips: [{ kind: "note", text: "A record is proof of something done, such as training evidence. It is retained unchanged." }],
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
      body: "Find clause 4.3 in **Ref-Locations**: it is the first row. Its BKB library location reads \"04_Policies/Org_Addenda\", then the organisation addendum Section 1 and scope statement. The scope is written for one organisation, so it sits with that organisation's addendum. Choose the entry that starts **04_Policies/Org_Addenda**.",
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
      body: "Do the other twelve rows. A location that is not the clause's is flagged at once. Once every row is filled, click **Check my answers**: it shows each row's Document or Record and why.",
      tips: [
        { kind: "avoid", text: "checking too early. Your rows lock once checked, so look them over first." },
      ],
      getEl: () => $('[data-guide="check-rows"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T4.2-10": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "**LI-DOC** is one file with three sheets: the SOP's document-control block, its life-cycle and the mandatory-documents register. T12.1 decides Stage 1 readiness from the register. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while either count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "7 to 9"),
  ],
  "T5.1-1": [
    {
      title: "Your evidence request list",
      icon: "table",
      body: "Before an external audit, the Compliance Manager sends control owners a **PBC list**: exactly what evidence to send, for which population and period, by when. A vague request wastes the owner's time and leaves the auditor without evidence on day one. Each row here is one request, for one control of dataset PBC-6.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-POL-016", "The Compliance and Regulatory Management Policy", POL016_WINDOW),
    {
      title: "What a request asks for",
      icon: "book",
      body: "Section 6.2's second table says how each field of a request is set. The window opens on its first line, **Evidence requested**, marked in amber: the record the control produces each time it operates.",
      getEl: () => $(`${POL016_WINDOW} tr[data-spot]`) ?? $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} tr[data-spot]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A control from another list: \"Asset register review\", done once a year in the CMDB. Each review leaves a new version of the register, so its evidence is the **register's version history**.",
      tips: [
        { kind: "avoid", text: "requesting the policy that asks for the control. Request the record the control leaves each time it runs." },
      ],
      getEl: () => $(`${POL016_WINDOW} tr[data-spot]`) ?? $(POL016_WINDOW),
    },
    firstItem("The first control yourself", "C11 is security awareness training completion. Section 6.2 asks for the record the control produces each time it operates. Each time someone completes the training, the system records the person and the date, and its completion report lists them all. Choose **Awareness training completion report**.", "Evidence requested", 1, () => selIs("Evidence requested", 1, "Awareness training completion report"), "Choose C11's evidence"),
    checkAnswers("Do the other five. Once every request has its evidence, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.1-2": [
    {
      title: "A colleague's first pass",
      icon: "table",
      body: "An auditor samples from a **population**: every occurrence of the control in the system it runs in. A request naming the wrong system sends the owner to the wrong records. A colleague filled in **System** from memory; you check it against dataset PBC-6. The platform writes the population and the audit period beside it.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Audit Requests (PBC)", "Dataset PBC-6 is tagged with this step. It opens beside your list.", PBC_WINDOW),
    {
      title: "The dataset",
      icon: "table",
      body: "Each row of PBC-6 is one control of the audit: its description, system, frequency and office.",
      getEl: () => $(`${PBC_WINDOW} table`) ?? $(PBC_WINDOW),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take C11, security awareness training completion.",
      steps: [
        { lead: "Find it in the dataset and read across to **System**", text: "C11's row says LMS, the learning management system that holds training records." },
        { lead: "Compare with the draft", text: "The draft says Awareness platform. That is C12's system, the phishing simulation: the two awareness controls were mixed up." },
        { lead: "Choose **LMS** in C11's list", text: "Next unlocks once it is in." },
      ],
      nextWhen: () => selIs("System", 1, "LMS"),
      doIt: "Correct C11's system",
      getEl: () => oblCell("System", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("System", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("System", 1),
      alsoShow: () => (innerWidth > 700 ? $(PBC_WINDOW) : null),
    },
    checkBeside(PBC_WINDOW, "Check all six the same way. Then Check my answers shows each row's answer. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.1-3": [
    {
      title: "How many to test",
      icon: "table",
      body: "An auditor tests a **sample**, not every occurrence: too few and the test proves nothing. Rule **R15** sets the minimum for each control from how often it runs.",
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
    firstItem("The first control yourself", "C11's row in dataset PBC-6 gives its Frequency as Annual: the training runs once a year. In Ref-Sampling, the Annual row has a population of 1 and a Minimum sample of 1. One run, so one to test: choose **1**.", "Sample (R15)", 1, () => selIs("Sample (R15)", 1, "1"), "Choose C11's sample", PAGE_WINDOW("Ref-Sampling")),
    checkAnswers("Do the other five. Once every request has a sample, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.1-4": [
    {
      title: "Who gets each request",
      icon: "table",
      body: "A request sent to the wrong person comes back late, or not at all. BKB-POL-016 Section 6.2 says who gets it: the role **Responsible (R)** for the control's process in the GRC Charter's RACI. Each row shortlists three roles.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(4, "Charter", "The BKB Group GRC Charter", CHARTER_WINDOW),
    {
      title: "The RACI",
      icon: "book",
      body: "Find the owner in the Charter:",
      steps: [
        { lead: "Section 16: the RACI", text: "A row per process, a column per role. The legend under the table gives each column's full role." },
        { lead: "Section 7.1: what each role does", text: "Use it when a process name does not tell you where a control belongs." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to each." },
      ],
      // The whole window: Section 16's table and legend run taller than the window.
      getEl: () => $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="16"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The first control yourself", "C11 is training completion. In Section 16 its process is the row Awareness & training. Read along it for R: it is under Awr, which the legend gives as the Security Awareness & Training Specialist. The CISO has A there: accountable, but not the one who holds the records. Choose **Security Awareness & Training Specialist**.", "Owner", 1, () => selIs("Owner", 1, "Security Awareness & Training Specialist"), "Choose C11's owner", CHARTER_WINDOW),
    checkAnswers("Do the other five. Once every request has an owner, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T5.1-5": [
    {
      title: "Now the request timeline",
      icon: "table",
      body: "Your answer is in. Part 2: the dates of your own list. The due date gives you time to check each file and have a bad one replaced before the auditor arrives. Rule **R16** works in two steps back from the end of the audit period.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Request Evidence", "The screen you write requests from. Rule R16 is on it, tagged with this step.", REQ_WINDOW),
    {
      title: "Rule R16",
      icon: "book",
      body: "Work R16 in order:",
      steps: [
        { lead: "Fieldwork start", text: "How long after the period's end fieldwork starts." },
        { lead: "Requests due", text: "How far before fieldwork the requests are due." },
      ],
      getEl: () => $(REQ_WINDOW),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Compliance Manager has a question about a sample on your list. Open it from the **Inbox** on the toolbar and reply.",
      tips: [
        { kind: "unsure", text: "Ref-Sampling, which it cites, is in **Learn › Reference pages**." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    firstItem("The first line yourself", "The first line is Audit period ends. The note above the table gives the period as 2025-09-05 to 2026-09-04: it ends on the second date. Pick **4 September 2026** in **Date**. The other two lines are counted from it by rule R16.", "Date", 1, () => valIs("Date", 1, "2026-09-04"), "Pick the period's end"),
    checkAnswers("Work out the other two lines by R16. Check my answers then shows each date and how R16 gives it. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked and the message has your reply. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T5.1-6": cardQuestion(6, "At work, you tell owners what the auditor will accept before they send it, so nothing comes back. This step is a question about one owner's file.", {
    title: "Rule R17",
    icon: "book",
    body: "The acceptance criteria are one sentence naming **four things** a file must be. Hold each option up against all four.",
    getEl: () => $(REQ_WINDOW),
  }, openScreen("evidence", "Evidence", "Request Evidence", "Rule R17 is on it, tagged with this step.", REQ_WINDOW), "The platform writes R17's sentence on every request."),

  "T5.1-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is the list the auditor and every owner work from: T5.2 fills it with evidence and T12.2 answers the auditor from it, so every cell counts. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the list counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Compliance Manager has a seventh control for you. Open the message from the **Inbox** on the toolbar and confirm it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Sheet 2: the seventh control",
      icon: "table",
      body: "**PBC-EXTRA** is below your timeline: one row, the seventh control. It takes a **Sample (R15)** and an **Owner**, read as at steps 3 and 4. You fill them one at a time.",
      getEl: () => $('[data-reg="PBC-EXTRA"]'),
      onEnter: () => $('[data-reg="PBC-EXTRA"]')?.scrollIntoView({ block: "center" }),
    },
    // The row's two cells, each with the place it is read from opened first.
    ...openPage(7, "Ref-Sampling"),
    rowCell("Its sample", "Sample (R15)", t517Row, "Ref-Sampling gives the minimum sample for each frequency.", {
      steps: [
        { lead: "Read the row's **Frequency** on the sheet", text: "The seventh control, C06, scans internet-facing assets Weekly." },
        { lead: "Find that frequency in Ref-Sampling", text: "The Weekly row: 52 runs a year, Minimum sample 5." },
        { lead: "Choose **5** in **Sample (R15)**" },
      ],
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Sampling")) : null),
    }),
    ...openLib(7, "Charter", "The BKB Group GRC Charter", CHARTER_WINDOW),
    rowCell("Its owner", "Owner", t517Row, "**Section 16** of the Charter is the RACI: one row per process, one column per role.", {
      steps: [
        { lead: "Find the process this control belongs to", text: "Its Description is vulnerability scanning and its System is the VM platform. The RACI's row for that is Vulnerability governance." },
        { lead: "Find the role marked R in that row", text: "R is in the last column, VM. The legend gives VM as the Vulnerability Management Governance Analyst." },
        { lead: "Choose **Vulnerability Management Governance Analyst** in **Owner**", text: "Not the CISO, who has A: accountable, not the one who runs the scans." },
      ],
      tips: [{ kind: "note", text: "That is the full row." }],
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="16"]`)?.scrollIntoView({ block: "start" }),
      alsoShow: () => (innerWidth > 700 ? $(CHARTER_WINDOW) : null),
    }),
    ...nameAndSubmit("xlsx", "1 to 6"),
  ],

  "T5.1-8": [
    {
      title: "Stage 1 and Stage 2",
      icon: "table",
      body: "Management must know how certification works before they buy it. **LI-CERT** is that briefing; its first table says what each stage of the certification audit does. A colleague drafted it from memory; you check it against the card before it goes to management.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(8, "Ref-Certification card"),
    {
      title: "The two stages",
      icon: "table",
      body: "Each stage's row says what the auditor does (**before the colon**), where, and what the stage produces (**after Output**).",
      getEl: () => rowIn(CARD_WINDOW, "Stage 1") ?? $(CARD_WINDOW),
    },
    {
      title: "How to check a line",
      icon: "search",
      body: "Take the first line, Stage 1: what the auditor does.",
      steps: [
        { lead: "Find Stage 1's row on the card" },
        { lead: "Read the words before the colon", text: "The auditor reviews documented information and readiness." },
        { lead: "Compare with the draft", text: "The draft says the same. This line is right: leave it." },
      ],
      getEl: () => oblCell("From the card", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("From the card", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("From the card", 1),
      alsoShow: () => (innerWidth > 700 ? $(CARD_WINDOW) : null),
    },
    // A line the draft has wrong, corrected by the learner: the third, what Stage 1 produces.
    rowCell("One that differs", "From the card", () => oblCell("From the card", 3), "Now the third line, Stage 1: what it produces.", {
      steps: [
        { lead: "Read the end of Stage 1's row on the card", text: "After \"Output:\" it reads: readiness report and areas of concern." },
        { lead: "Compare with the draft", text: "The draft gives nonconformities and the certification recommendation. That is Stage 2's output: the two were swapped." },
        { lead: "Choose **Readiness report and areas of concern**", text: "Stage 1 only says whether you are ready. Nonconformities are graded at Stage 2." },
      ],
      nextWhen: () => /^readiness report/i.test((oblCell("From the card", 3) as HTMLSelectElement | null)?.value ?? ""),
      alsoShow: () => (innerWidth > 700 ? $(CARD_WINDOW) : null),
      doIt: "Correct the third line",
    }),
    checkBeside(CARD_WINDOW, "Check the other lines the same way. Then Check my answers shows each one's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.1-9": [
    {
      title: "Which stage does what",
      icon: "table",
      body: "A team prepares differently for each stage: documents for one, people and records for the other. Decide which stage each audit activity belongs to.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-Certification card"),
    firstItem("The first activity yourself", "The first activity is checking evidence that controls operated over the whole period. Read the two stage rows of the card. Stage 1 reviews documents and readiness. Stage 2 tests implementation, and its list ends with \"evidence of operation over the period\". Choose **Stage 2**.", "Stage (L11)", 1, () => selIs("Stage (L11)", 1, "Stage 2"), "Choose its stage", CARD_WINDOW),
    checkAnswers("Do the other seven. Once each has a stage, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T5.1-10": cardQuestion(10, "At work, management budgets audit days for each year of a certificate's life. This step is a question about the 3-year certification cycle.", {
    title: "The cycle",
    icon: "table",
    body: "The card's **3-year cycle** row names the audits in order, from the initial certification.",
    getEl: () => rowIn(CARD_WINDOW, "3-year cycle") ?? $(CARD_WINDOW),
    onEnter: () => rowIn(CARD_WINDOW, "3-year cycle")?.scrollIntoView({ block: "center" }),
  }),

  "T5.1-11": cardQuestion(11, "At work, an organisation lives with its certification body for the whole cycle, so the order of comparison matters. This step is a question about choosing one.", {
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
      body: "A control owner facing an auditor for the first time needs to know what to do, and what never to do. Each row is something an owner did in an interview: judge it as the card would.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(12, "Ref-Certification card"),
    {
      title: "Do, and do not",
      icon: "table",
      body: "The card's last two rows list what an auditee **does**, and **does not do**.",
      tips: [
        { kind: "avoid", text: "matching words. No row of your table uses the card's words: find the item each situation is an example of." },
      ],
      getEl: () => rowIn(CARD_WINDOW, "Auditee: do") ?? $(CARD_WINDOW),
      onEnter: () => rowIn(CARD_WINDOW, "Auditee: do")?.scrollIntoView({ block: "center" }),
    },
    firstItem("The first situation yourself", "In the first row, the owner names the control, stops, and waits for the next question. The card's Auditee: do row starts with \"Answer only what is asked\". The owner did that, so choose **Do**.", "Do or do not", 1, () => selIs("Do or do not", 1, "Do"), "Choose for the first situation", CARD_WINDOW),
    checkAnswers("Do the other nine. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.1-13": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "Management reads this before choosing a certification body. **LI-CERT** is one briefing: the two stages, the activities of each, the 3-year cycle, the criteria for choosing a certification body and the auditee briefing. It goes with PBC-LIST and prepares the week-12 audit. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each part counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "8 to 12"),
  ],

  // T5.2 (desk-step-builder, 29 Oct 2026): EVP-GAP in Evidence › Link to Control (steps 1, 4, 5), EVP-IDX in Evidence ›
  // Evidence Library (steps 2, 3), both handed in at step 6 with EVP-EXTRA, the late files (REWORK, 1 Nov).
  "T5.2-1": [
    {
      title: "Count what arrived",
      icon: "table",
      body: "Before checking any evidence, you count what each control owner sent against the PBC list, so an owner who sent nothing is chased at once. **EVP-GAP** has one row for each request of your PBC list.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "Dataset EVP-REPO is tagged with this step. It opens beside EVP-GAP.", LIB_WINDOW),
    {
      title: "Sorted by control",
      icon: "table",
      body: "Each row is one file the owners sent, listed by **Control**, so each control's files sit together. Three rows with C99 would mean its owner sent 3 files.",
      getEl: () => $(`${LIB_WINDOW} table`) ?? $(LIB_WINDOW),
    },
    firstItem("The first control yourself", "C11 is the first row of EVP-GAP. In the Evidence Library, find the rows whose Control is C11: they sit together, from E-001 down to E-041. There are seven, so type **7** in **Files received**. Count every file the owner sent, good or bad: checking them comes in step 2.", "Files received", 1, () => valIs("Files received", 1, "7"), "Type C11's count", LIB_WINDOW),
    checkAnswers("Count the other five. Once every row has a number, Check my answers shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.2-2": [
    {
      title: "Every file, checked",
      icon: "table",
      body: "An auditor rejects any file that is undated, unattributable, incomplete, altered, out of scope or unsafe, and you must say why. Each of the 42 files gets **Accept** or **Reject** here, with the code of every check that fails.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The checklist, beside the table",
      icon: "help",
      body: "Rule **R09**: read D1 to D10 in order. Each check shows the cell of the lit file it reads.",
      steps: [
        { lead: "Read each check against its cell", fork: [{ when: "It fails", then: "Mark it. Keep going: mark every check that fails." }, { when: "It passes", then: "Go on to the next check." }] },
        { lead: "Record the decision", text: "Any check marked: **Reject**. None: **Accept**.", mark: "stop" },
      ],
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates and the period",
      icon: "book",
      body: "**D3** and **D4** compare the file with the audit period, given in the note above the checks. A file dated 2024-12-01, for example, would fail D4.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="D4"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Scope can be tested",
      icon: "book",
      body: "**D7** reads two things:",
      steps: [
        { lead: "**System**", text: "Where the file came from." },
        { lead: "**Evidence type**, and what the request asks for", text: "In the lines under System. A file from inside the audit can still be the wrong record (BKB-POL-016 Section 7.1)." },
      ],
      getEl: () => $('[data-guide="checklist-row"] li[data-check="D7"]') ?? $('[data-guide="checklist"]'),
      onEnter: () => $('[data-guide="checklist-row"] li[data-check="D7"]')?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Check the first file",
      icon: "edit",
      body: "The first file, **E-015**, is lit: a critical-vulnerability remediation export for C07. This is what its cells say:",
      steps: [
        { lead: "D1 to D4 pass", text: "It has a timestamp, 2025-09-20, inside the audit period. **Generated by** names an account. **Period covered** is the whole period." },
        { lead: "D5 and D6 pass", text: "The export header shows the filter, and the export is unmodified." },
        { lead: "D7 passes", text: "**System** is in scope, and the file is the record C07's request asks for." },
        { lead: "D8 to D10 pass", text: "An approver is named, the content is masked and it is legible." },
        { lead: "No check is marked, so record **Accept**" },
      ],
      tips: [{ kind: "note", text: "On a file that fails, mark every check that fails, not only the first, then record Reject." }],
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the file's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => evqWalk("E-015")?.innerText.trim() === "Accept",
      doIt: "Check the first file",
    },
    {
      title: "Then the other 41",
      icon: "check",
      body: "The checklist moves on to the next file by itself.",
      tips: [
        { kind: "unsure", text: "To look at a file again, click its Accept/Reject in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 42 files are decided, Check my answers shows each file's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.2-3": [
    {
      title: "A colleague's index",
      icon: "table",
      body: "Every accepted file is indexed to the one request it answers, so the auditor goes from a request to its evidence in one step. A colleague filled in **PBC req.** from memory; you check it. Only the files accepted in step 2 are listed.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Audit Requests (PBC)", "Dataset PBC-6 is tagged with this step: each control with its request in PBC-LIST. It opens beside the index.", PBC_WINDOW),
    {
      title: "Requests by control",
      icon: "table",
      body: "The last column gives each control's request in your PBC list. Every accepted file covers the whole audit period, so its **control** decides its request.",
      getEl: () => $(`${PBC_WINDOW} table`) ?? $(PBC_WINDOW),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take the first file, E-015.",
      steps: [
        { lead: "Read its **Control**", text: "C07." },
        { lead: "Find that control in the dataset and read across to its request", text: "C07's row ends with PBC-02." },
        { lead: "Compare with the draft", text: "The draft says PBC-02 too. This row is right: leave it." },
      ],
      getEl: () => oblCell("PBC req.", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("PBC req.", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("PBC req.", 1),
      alsoShow: () => (innerWidth > 700 ? $(PBC_WINDOW) : null),
    },
    // A file the draft has wrong, corrected by the learner: E-023, found by its item (its row number depends on what step 2 accepted).
    rowCell("One that differs", "PBC req.", t523Row, "Now file E-023, phishing campaign results.", {
      steps: [
        { lead: "Read its **Control**", text: "C12, the phishing simulation." },
        { lead: "Find C12 in the dataset", text: "Its request is PBC-05." },
        { lead: "Compare with the draft", text: "The draft says PBC-06, the incident control's request. Choose **PBC-05**." },
      ],
      nextWhen: () => (t523Row() as HTMLSelectElement | null)?.value === "PBC-05",
      alsoShow: () => (innerWidth > 700 ? $(PBC_WINDOW) : null),
      doIt: "Correct E-023's request",
    }),
    checkBeside(PBC_WINDOW, "Check every file the same way. Then Check my answers shows each one's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.2-4": [
    {
      title: "Find the gaps",
      icon: "table",
      body: "Find a thin control before the auditor does: a control without enough accepted evidence is reported as \"no evidence\". Rule **R18**, in the note beside the table, decides it per control.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The files of each control",
      icon: "info",
      body: "Each row lists its control's files with the decision step 2 checked. Count the ones marked **Accept**.",
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first control yourself", "C11's row lists its seven files with the decision step 2 checked. Count the ones marked Accept: only one, E-014. Rule R18: a control has a gap when it has fewer than 2 accepted files. One is fewer than two, so choose **Gap**.", "Gap (R18)", 1, () => selIs("Gap (R18)", 1, "Gap"), "Choose for C11"),
    checkAnswers("Do the other five. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T5.2-5": [
    {
      title: "Write the follow-up",
      icon: "table",
      body: "A gap left open is \"no evidence\" at the audit. Its owner gets a follow-up at once, saying exactly what to send, for which period and by when. Rule **R18** gives the sentence.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-016", "The Compliance and Regulatory Management Policy", POL016_WINDOW),
    {
      title: "When it is due",
      icon: "book",
      body: "Section 6.2's paragraph under the request table says **by when** the missing files are due. The bar at the top of the window jumps to Section 6.2.",
      getEl: () => $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    ...openScreen("evidence", "Evidence", "Request Evidence", "The screen you write requests from. Rule R16, when fieldwork starts, is on it, tagged with this step.", REQ_WINDOW),
    {
      title: "Rule R16",
      icon: "book",
      body: "R16 gives how long after the audit period's end fieldwork starts. Count from there to the due date.",
      getEl: () => $(REQ_WINDOW),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Information Security Auditor has a question about one of your controls. Open it from the **Inbox** on the toolbar and reply. BKB-POL-016 Section 6.2, which it cites, is the section you have just read.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    firstItem("Your first follow-up", "The first control with a gap is C11. R18's sentence has three blanks. The control: C11. The period: the audit period, 2025-09-05 to 2026-09-04. The due date: the period ends 2026-09-04, fieldwork starts 30 days later, on Sunday 2026-10-04 (R16), and Section 6.2 sets the last working day before it, Friday 2026-10-02. Type: **Please send 2 more files for C11 covering 2025-09-05 to 2026-09-04 by 2026-10-02.**", "Follow-up request (R18)", 1, () => valIs("Follow-up request (R18)", 1, "Please send 2 more files for C11 covering 2025-09-05 to 2026-09-04 by 2026-10-02."), "Write the sentence"),
    checkAnswers("Write the other one the same way. Check my answers then shows the sentence R18 gives and why. Your rows lock then, so read them over first."),
    finish("**Mark step complete** unlocks once your answers are checked and the message has your reply."),
  ],

  "T5.2-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "This is what the auditor sees. **EVP-IDX** is the evidence index T12.2 answers the certification body from; **EVP-GAP** goes to the owners, and its gaps become actions in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each file counts them.",
      tips: [
        { kind: "avoid", text: "submitting while either count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Compliance Manager has five late files for you. Open the message from the **Inbox** on the toolbar and confirm it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...openScreen("evidence", "Evidence", "Import Log / Report", "What each late file says about itself, recorded when it was imported.", IMPORT_WINDOW),
    {
      title: "What each file says",
      icon: "table",
      body: "Read each row as you read a file at step 2: its source system against what its request names, its period, its query, who generated it. The second column is the file's **SHA-256** when it was exported.",
      getEl: () => $(`${IMPORT_WINDOW} table`) ?? $(IMPORT_WINDOW),
    },
    ...openScreen("evidence", "Evidence", "Upload Config File", "The upload manifest: the same five files as they arrived, and the naming rule for yours.", UPLOAD_WINDOW),
    {
      title: "Compare the fingerprints",
      icon: "search",
      body: "A SHA-256 is a file's fingerprint: one changed character changes it.",
      steps: [
        { lead: "Compare each file's SHA-256 on upload with its SHA-256 at export" },
        { lead: "Read the note under the manifest", text: "It says what a difference means." },
      ],
      getEl: () => $(`${UPLOAD_WINDOW} table`) ?? $(UPLOAD_WINDOW),
    },
    ...openScreen("evidence", "Evidence", "Audit Requests (PBC)", "Dataset PBC-6: each control with the system and the record its request names, and its request in PBC-LIST.", PBC_WINDOW),
    {
      title: "Sheet 2: the late files",
      icon: "table",
      body: "**EVP-EXTRA** is below your gap memo: one row for each late file, three cells in each row. You fill the first row, E-043, one cell at a time.",
      tips: [
        { kind: "unsure", text: "A wrong value is flagged at once, with where to read it." },
      ],
      getEl: () => $('[data-reg="EVP-EXTRA"]'),
      onEnter: () => {
        if (innerWidth <= 700) for (const w of [PBC_WINDOW, UPLOAD_WINDOW, IMPORT_WINDOW]) $(`${w} button[aria-label^="Close"]`)?.click();
        $('[data-reg="EVP-EXTRA"]')?.scrollIntoView({ block: "center" });
      },
    },
    // The first late file's row, cell by cell (tester, 18 Nov 2026): the guide listed the three cells and waited on none.
    rowCell("Its result", "Result (R09)", t526Row, "Check E-043 as you checked a file at step 2: rule R09, checks D1 to D10.", {
      steps: [
        { lead: "Find E-043's row in **Import Log / Report**", text: "It is dated 2026-08-21, covers 2025-09-05 to 2026-09-04, shows its filter in the header, and names hiro.svc and an approver. Scroll sideways to read them." },
        { lead: "Hold its Source system against its control's **System** in **Audit Requests (PBC)**", text: "E-043 comes from the VM platform. C07's system is the VM platform: in scope." },
        { lead: "Compare its two SHA-256s", text: "At export and on upload both read 7c1b20691b9bc277: the file was not changed." },
        { lead: "No check fails, so choose **Accept**", text: "A file whose two SHA-256s differ was altered: it takes D6." },
      ],
      alsoShow: () => (innerWidth > 700 ? $(IMPORT_WINDOW) : null),
    }),
    rowCell("Its request", "PBC req.", t526Row, "An accepted file is indexed to the request it answers, as at step 3.", {
      steps: [
        { lead: "Read the row's **Control**", text: "C07." },
        { lead: "Find that control in Audit Requests (PBC)", text: "C07's row ends with its PBC-LIST request: PBC-02." },
        { lead: "Choose **PBC-02** in **PBC req.**" },
      ],
      tips: [{ kind: "note", text: "A rejected file takes no request: the sheet writes a dash in its PBC req. cell." }],
      alsoShow: () => (innerWidth > 700 ? $(PBC_WINDOW) : null),
    }),
    rowCell("Its control's gap", "Gap now (R18)", t526Row, "Rule R18 again, now with the late files counted: a control with fewer than 2 accepted files has a gap.", {
      steps: [
        { lead: "Read the row's **Accepted at step 2**", text: "In a correct step 2, C07 had 1 accepted file." },
        { lead: "Add the late files of C07 that this sheet accepts", text: "E-043 is accepted: that makes 2. E-044 is C07's too, but its SHA-256 on upload differs from the one at export, so it is rejected and adds nothing." },
        { lead: "2 is not fewer than 2, so choose **No gap**" },
      ],
      tips: [{ kind: "note", text: "That is the full row. Do the other four the same way." }],
    }),
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, as the manifest's naming rule says: EVP-IDX ends .xlsx (a spreadsheet), EVP-GAP .docx (a memo)." } : c)),
  ],

  // T6.1 (desk-step-builder, 29 Oct 2026; REWORK 1 Nov): UAR-TEST's sheets and UAR-MEMO in Access Reviews › Generate Sample. Step 6's answer is read in BKB-POL-006
  // Section 6.3, so its question has a guide. Step 4 reads each lead on the Access Reviews screen that listed it.
  "T6.1-1": [
    {
      title: "The test plan",
      icon: "table",
      body: "Before testing a control, an auditor reads its fixed **test plan**: what each attribute checks and which columns show it. Sheet 1 is that plan, A1 to A6. You do not change it: every account in steps 3 and 4 is tested against it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "An account with no approval ticket: A1 passes only when the account has one, so that account **fails A1**. Each question here is a case like that.",
      getEl: () => rowIn('[data-guide="register"]', "A1") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: an account's review decision is blank. Read the **Passes when** column and click the attribute that fails. Next unlocks once it is right.",
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
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T6.1-2": [
    {
      title: "How many accounts to test",
      icon: "table",
      body: "An auditor tests a sample of the review's decisions, not all of them, and must show the sample is big enough for the population. Rule **R15**, in the note, sets the minimum.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Start Review", "The review's facts are tagged with this step. They open beside your sheet.", START_WINDOW),
    {
      title: "The review",
      icon: "book",
      body: "The form gives the system, how often it is reviewed, and how many accounts the review covered. The sample is taken from the accounts, so the number of accounts is the fact this step uses, not the frequency.",
      getEl: () => $(START_WINDOW),
    },
    firstItem("The first line yourself", "The first line is the population. On Start Review, the Population line reads \"216 accounts (dataset UAR-EXTRACT)\". The review made one decision per account, and those decisions are what you sample. Type **216** in **Value**. Not the frequency, Semi-annual: that is how often the review runs.", "Value", 1, () => valIs("Value", 1, "216"), "Type the population", START_WINDOW),
    ...openPage(2, "Ref-Sampling"),
    {
      title: "The sampling table",
      icon: "table",
      body: "Ref-Sampling has two kinds of row:",
      steps: [
        { lead: "Rows by frequency", text: "For a control tested occurrence by occurrence." },
        { lead: "The last two rows", text: "For a population of records. A review of 300 accounts, for example, is a population of 250 or more: a minimum sample of 40." },
      ],
      getEl: () => $(PAGE_WINDOW("Ref-Sampling")),
    },
    checkAnswers("Choose your row and its minimum sample. Check my answers then shows each line's answer and why, and the platform draws the sample. Your lines lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.1-3": [
    {
      title: "Test each sampled account",
      icon: "table",
      body: "An auditor **re-performs** the review on a sample: for each account, did the review get it right? Sheet 2 lists the 25 accounts the platform drew. Each is tested against A1 to A6.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The test plan, beside the table",
      icon: "help",
      body: "Read A1 to A6 in order. Each shows the cells of the lit account it reads.",
      steps: [
        { lead: "Read each attribute against its cells", fork: [{ when: "It fails", then: "Mark it. Keep going: mark every attribute that fails." }, { when: "It passes", then: "Go on to the next." }] },
        { lead: "Record the result", text: "Any attribute marked: **Fail**. None: **Pass**.", mark: "stop" },
      ],
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates",
      icon: "book",
      body: "**A2** and **A5** count from the review date, given in the note above the checks. An account last used 120 days before the review, and kept by the reviewer, would fail A2.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="A2"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Check the first account",
      icon: "edit",
      body: "The first account, **U-0007**, is lit. Each attribute shows the cells it reads:",
      steps: [
        { lead: "A1 to A3 pass", text: "It has an approval ticket. HR shows it Active and its last login, 2026-08-14, is within 90 days of the review. Its one role, Power user, is no toxic pair." },
        { lead: "A4 and A5 pass", text: "The reviewer is the asset owner, not the account holder, and the decision is Keep." },
        { lead: "A6 fails: mark it", text: "**Role change date** shows 2026-07-28. A6 passes only when HR shows neither a termination date nor a role change date." },
        { lead: "One attribute is marked, so record **Fail**", text: "**Attributes failed** then reads A6." },
      ],
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
      body: "The checklist moves on to the next account by itself.",
      tips: [
        { kind: "unsure", text: "To look at an account again, click its Result in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 25 are recorded, Check my answers shows each account's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.1-4": [
    {
      title: "Leads, not yet exceptions",
      icon: "table",
      body: "Analytics run on every account, not only the sample, and list anything that looks wrong. An auditor confirms each **lead** before reporting it: a false exception sends the owner chasing nothing. The task allows at most 10 % false positives.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(4, "Ref-UAR test plan"),
    {
      title: "The test plan",
      icon: "table",
      body: "The same A1 to A6 as Sheet 1. A lead is an **exception** only if it fails one of them. A privileged account with no approval ticket, for example, fails A1: an exception.",
      getEl: () => $(UARPLAN_WINDOW),
    },
    ...openScreen("access", "Access Reviews", "Terminated User Check", "Listed by names the screen that holds each lead. U-0007 is on this one: every account matched to the HR roster.", TUC_WINDOW),
    {
      title: "Read the lead",
      icon: "book",
      body: "Find **U-0007**'s row. The Terminated User Check shows what HR holds for it, beside the account's status and last login.",
      getEl: () => $(TUC_WINDOW),
    },
    firstItem("The first lead yourself", "U-0007 is listed for a role change date. Its row on the Terminated User Check shows HR status Active and Role change date 2026-07-28. Hold that against the test plan: A6 passes only when HR shows no termination date and no role change date. It shows one, so A6 fails and the lead is real: choose **Exception**.", "Exception?", 1, () => selIs("Exception?", 1, "Exception"), "Decide U-0007", TUC_WINDOW),
    checkAnswers("Decide the other eight, each on the screen Listed by names: Privilege Check and Reviewer Sign-off are in the same menu. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.1-5": [
    {
      title: "Name each exception",
      icon: "table",
      body: "Every exception is reported with its **type**: the type sets its severity, the action and who owns it. Only the accounts step 4 confirmed are listed.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(5, "Ref-UAR codes"),
    {
      title: "The ten types",
      icon: "table",
      body: "Each code names one kind of exception and its severity.",
      tips: [
        { kind: "avoid", text: "choosing from the first words. Some codes look alike: read each one to the end." },
      ],
      getEl: () => $(UCODES_WINDOW),
    },
    firstItem("The first exception yourself", "U-0007's HR roster shows a role change date and no termination date: the person moved to a new role and stayed. Read down Ref-UAR codes for that. U1 is for a terminated employee, which this is not. U9 reads \"Mover not re-validated within 5 days\". Choose **U9**.", "Type (U1–U10)", 1, () => selIs("Type (U1–U10)", 1, "U9"), "Choose U-0007's type", UCODES_WINDOW),
    ...openScreen("access", "Access Reviews", "Start Review", "The review's facts are tagged with this step: they say which break-glass accounts are registered.", START_WINDOW),
    {
      title: "Break-glass accounts",
      icon: "book",
      body: "The form lists the **break-glass accounts** registered for this system. Read it before you type a generic account.",
      getEl: () => $(START_WINDOW),
    },
    checkAnswers("Type the other exceptions. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T6.1-6": [
    {
      title: "A question first",
      icon: "help",
      body: "A test memo says what happens about each kind of exception, and the IAM team act on it. This step is a question about one kind.",
      steps: [
        { lead: "Read the situation box first" },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-6 [data-guide="decision"]'),
    },
    ...openScreen("access", "Access Reviews", "Track Remediation", "The standard action, owner and due date of each exception type.", REMEDIATION_WINDOW),
    {
      title: "The standard action",
      icon: "table",
      body: "Find the row for **an active account of a terminated employee**. It gives the action and how soon. Keep it in mind for the next card.",
      getEl: () => $(REMEDIATION_WINDOW),
    },
    ...openLib(6, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The leaver procedure",
      icon: "book",
      body: "**Section 6.3** is the leaver procedure: each step, who does it and what it produces. The bar at the top of the window jumps to it. Read all four steps.",
      getEl: () => $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-6 [data-guide="decision"]'),
      pointAt: () => $('#act-6 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-6 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-6 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the feedback read, click **Mark step complete**. Sheet 3 then records rule R20's action, owner and due date for each of your exceptions.",
      getEl: () => $('#act-6 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Click **▶ Show me how** to run this guide again.",
      getEl: () => $('#act-6 [data-guide="show-me-how"]'),
    },
  ],

  "T6.1-7": [
    {
      title: "Conclude the test",
      icon: "table",
      body: "A control test ends in one of **three conclusions**, and the control owner, the auditor and management act on it. The note lists your exceptions and says where each thing is read.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("testing", "Control Testing", "Record Result", "Rule R19 is the first row: it decides the conclusion from how many exceptions there are and how severe they are.", RESULT_WINDOW),
    {
      title: "Rule R19",
      icon: "book",
      body: "Read R19's first row to the end. It looks at two things:",
      steps: [
        { lead: "The highest severity" },
        { lead: "The share of the population" },
      ],
      getEl: () => $(RESULT_WINDOW),
    },
    firstItem("The first line yourself", "The first line is Exceptions in Sheet 3. The note beside the table lists them as steps 4 and 5 checked them: U-0007, U-0025, U-0072, temp-user-99, U-0117 and admin01-141. Count them: six. Type **6** in **Your answer**. The three leads step 4 found not to be exceptions are not counted.", "Your answer", 1, () => valIs("Your answer", 1, "6"), "Type the count", RESULT_WINDOW),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Information Security Auditor has a question about one account. Open it from the **Inbox** on the toolbar and reply.",
      tips: [
        { kind: "unsure", text: "You need **Ref-UAR codes** for it, and for the severities." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    checkAnswers("Then the highest severity, their share of the 216 accounts, R19's conclusion, and the number the memo's sentence needs (Learn › Sentence frames, Memo conclusion). Check my answers then shows each line's answer and why. Your lines lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked and the message has its reply. UAR-MEMO's conclusion is then written from them."),
  ],

  // Four jobs in order (owner, 2 Nov 2026: the step "gets stuck"; nothing led to the lab). Each card belongs to one job
  // of the panel's list and passes by once that job is done, so the walk picks up where the learner is. The Inbox and the
  // Tech Lab open windows of their own: the walk ends as one opens and starts again when it closes; Sheet 4 is filled
  // with the walk out of the way, and it starts again once the sheet is complete.
  "T6.1-8": [
    {
      title: "Four jobs, in order",
      icon: "file",
      body: "The hand-in is where a test's workpapers are finished and sealed: **UAR-TEST** is what an auditor re-reads, **UAR-MEMO** states the conclusion. Four jobs, in order:",
      steps: [
        { lead: "The Compliance Manager's message" },
        { lead: "Sheet 4" },
        { lead: "The Tech Lab" },
        { lead: "Name and submit both files" },
      ],
      tips: [
        { kind: "note", text: "The job marked **Next** is yours now." },
      ],
      getEl: () => $('[data-guide="jobs"]'),
      skip: () => jobDone("sheet"),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Compliance Manager has a second system for you.",
      steps: [
        { lead: "Click **Open Inbox**" },
        { lead: "Read the message and confirm it" },
        { lead: "Click **Back to step**", text: "This guide carries on from the next job." },
      ],
      // The notice in this window's panel (the step list behind it has its own).
      getEl: () => $('[data-desk-modal] [data-guide="message-notice"]'),
      pointAt: () => $('[data-desk-modal] [data-guide="message-open"]'),
      waitFor: () => !!$(J3_MSG),
      away: J3_MSG,
      doIt: "Click Open Inbox",
      skip: () => !jobNow("msg"),
    },
    {
      title: "Sheet 4: the second system",
      icon: "table",
      body: "**Sheet 4** is first in this window: the ten accounts of Diligent Entities, from the same review. Each row holds what Sheet 2 held for an account. **Type**, at the right edge, is yours: test them as you tested Sheets 2 and 3.",
      getEl: () => $(`${SHEET4} > p`),
      onEnter: () => $(SHEET4)?.scrollIntoView({ block: "start" }),
      skip: () => jobDone("sheet"),
    },
    ...openPage(8, "Ref-UAR test plan").map((c) => ({ ...c, ...(c.title === "Open Ref-UAR test plan" ? { body: "The page that holds A1 to A6. Drag its window aside if it covers the sheet." } : {}), skip: () => jobDone("sheet") })),
    {
      title: "The test plan",
      icon: "table",
      body: "A1 to A6, as in steps 3 and 4: each row says when the attribute passes and which cell it reads. **Ref-UAR codes**, further down the Reference pages list, names the types.",
      getEl: () => $(UARPLAN_WINDOW),
      skip: () => jobDone("sheet"),
    },
    {
      title: "The first account yourself",
      icon: "edit",
      body: "Do **D-0001** first. Walk its row through A1 to A6:",
      steps: [
        { lead: "A1 to A3 pass", text: "It has an approval ticket. HR status is Active and its last login, 2026-08-19, is within 90 days of the review. Its one role is Standard user." },
        { lead: "A4 to A6 pass", text: "The reviewer is the asset owner, not the holder. The decision is Keep. HR shows no termination date and no role change date." },
        { lead: "It fails none, so choose **None** in Type", text: "A row that fails one takes the type Ref-UAR codes gives for that failure." },
      ],
      // The account's row; on a phone its facts are lines under it, so the sheet (the card floats clear of the row).
      getEl: () => (innerWidth > 600 ? $(`${SHEET4} tr[data-row="0"]`) : $(SHEET4)),
      // On a phone the page's window covers the sheet: it was read on the card before, and Learn reopens it.
      onEnter: () => { if (innerWidth <= 600) closeRefPages(); $(SHEET4)?.scrollIntoView({ block: "start" }); },
      pointAt: () => x4(1),
      alsoShow: () => (innerWidth > 700 ? $(UARPLAN_WINDOW) : null),
      nextWhen: () => !!(x4(1) as HTMLSelectElement | null)?.value && x4(1)?.getAttribute("aria-invalid") !== "true",
      doIt: "Choose D-0001's type",
      skip: () => jobDone("sheet"),
    },
    {
      title: "The other nine, then R19",
      icon: "edit",
      body: "Do the other nine the same way; a wrong type is flagged at once, with where to read it.",
      steps: [
        { lead: "Type the other nine" },
        { lead: "Conclude on the last line", text: "By rule R19 (Control Testing › Record Result), on these ten accounts alone." },
      ],
      tips: [
        { kind: "note", text: "Click **Got it** and fill the sheet: this guide comes back once every row is right." },
      ],
      getEl: () => $(SHEET4),
      away: () => jobDone("sheet"),
      skip: () => jobDone("sheet"),
    },
    {
      title: "Next: the Tech Lab",
      icon: "grid",
      body: "An access review is confirmed in the application's own admin console: who holds admin now, and who signs in around SSO. The Compliance Manager has asked for it on TeamConnect.",
      tips: [
        { kind: "note", text: "Submit does not wait for it, but its findings join UAR-MEMO's **Tenant check** row only if you finish it before you submit." },
      ],
      getEl: () => $('[data-guide="jobs"] [data-job="lab"]'),
      // Straight there, not a smooth scroll: back from a long sheet on a phone it is far down, and a long smooth scroll
      // outlasts the card's tracking (the card was left off screen).
      onEnter: () => { closeRefPages(); $('[data-guide="jobs"] [data-job="lab"]')?.scrollIntoView({ block: "center" }); },
      skip: () => !jobNow("lab"),
    },
    ...openScreen("systems", "Systems", "AppAdmin", "The lab is tagged Step 8. It opens in its own window, with its own guide. When you have marked it complete, close it: this guide carries on with the files.", LAB61_WINDOW).map((c, i) => ({ ...c, skip: () => !jobNow("lab"), ...(i === 1 ? { away: LAB61_WINDOW } : {}) })),
    ...nameAndSubmit("xlsx", "1 to 7").map((c) =>
      c.title === "Name the file"
        ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: UAR-TEST ends .xlsx (a workbook), UAR-MEMO .docx (a memo).", nextWhen: () => [...document.querySelectorAll<HTMLInputElement>('[data-guide="file-name-input"]')].every((el) => !!el.value.trim() && el.getAttribute("aria-invalid") !== "true"), doIt: "Type both file names", onEnter: () => { closeRefPages(); $('[data-guide="file-name"]')?.scrollIntoView({ block: "center" }); }, skip: () => !jobNow("files") }
        : c.title === "Submit it"
          ? { ...c, body: "Submit hands both files in. The receipt shows a hash (a fingerprint of the files) and a UTC time. If Submit is grey, the line beside it says what is left.", nextWhen: () => !!$('[data-guide="receipt"]'), doIt: "Click Submit", skip: () => !jobNow("files") }
          : c,
    ),
  ],
  // T6.2 (desk-step-builder, 29 Oct 2026): LVR-REC's two sheets and LVR-KPI, worked in Access Reviews › Terminated User
  // Check, whose screen shows T6.2 its own disable logs. Step 5 asks its question in the row (guide "5q", BKB-POL-006
  // Section 6.3), then works Sheet 3 in the modal.
  "T6.2-1": [
    {
      title: "Put the logs in UTC",
      icon: "table",
      body: "Before comparing HR's termination times with system logs, put every time in one zone, **UTC**. A time read in the wrong zone makes an account look late, or on time, when it is not. Sheet 1 has one row per system log.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Terminated User Check", "The five systems' disable logs are tagged with this step. They open beside your sheet.", TUC_WINDOW),
    {
      title: "Read how each log writes the time",
      icon: "book",
      body: "Every time ends with its zone. Example: a log in **EDT**, New York summer time, is four hours behind UTC, so it needs 4 hours **added** to reach UTC.",
      getEl: () => $(TUC_WINDOW),
    },
    firstItem("The VPN log yourself", "Take the third row, VPN / ZTNA. Its lines in the log end with CEST, for example 2026-08-28 13:36 CEST. The step's note says CEST is two hours ahead of UTC. A clock that is ahead shows a later time, so take the two hours off to reach UTC: 13:36 CEST is 11:36 UTC. Choose **Subtract 2 hours**. A log that already ends with UTC needs nothing: Already UTC.", "Time in the log → UTC", 3, () => selIs("Time in the log → UTC", 3, "Subtract 2 hours"), "Choose VPN / ZTNA's conversion", TUC_WINDOW),
    checkAnswers("Choose the other four. Check my answers then shows each row's answer and why, and the platform converts the times. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.2-2": [
    {
      title: "Match the leavers",
      icon: "table",
      body: "The weekly reconciliation matches HR's leavers to every system's log by **Employee ID**. A leaver missing from a log was never disabled there: the account is still active. Non-SSO systems are where leavers hide.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Terminated User Check", "The five systems' disable logs are tagged with this step. They open beside your sheet.", TUC_WINDOW),
    {
      title: "One log at a time",
      icon: "book",
      body: "Each system's lines are together, sorted by Employee ID. Read down one system's IDs: a skipped number, say E0007 between E0006 and E0008, is a leaver with no line in that log.",
      getEl: () => $(TUC_WINDOW),
    },
    firstItem("The first log yourself", "Take the first log, SSO / IdP. HR lists 29 leavers, E0001 to E0029. Read down the log's SSO / IdP lines: they run from E0001 to E0029 with no number skipped, so every leaver has a disable line. Type **none** in **Leavers with no disable line**. In a log that skips a number, type that Employee ID.", "Leavers with no disable line", 1, () => valIs("Leavers with no disable line", 1, "none"), "Type SSO / IdP's missing leavers", TUC_WINDOW),
    checkAnswers("Do the other four logs. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.2-3": [
    {
      title: "A colleague's SLA column",
      icon: "table",
      body: "A disable is measured against the **SLA** for how the person left: someone dismissed loses access faster than someone who resigns. A colleague filled in this column from memory, and every late disable you find next depends on it, so you check it first.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R21 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R21",
      icon: "book",
      body: "**R21** gives the SLA for each leaver type, and the KPI you work out in step 6.",
      getEl: () => rowIn(RULES_WINDOW, "R21") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R21")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "How to check a row",
      icon: "search",
      body: "Take E0001.",
      steps: [
        { lead: "Read its **Leaver type**", text: "Voluntary: the person resigned." },
        { lead: "Find that type in R21", text: "Voluntary leaver: account disabled within 4 hours of termination." },
        { lead: "Compare R21's SLA with the row", text: "The draft says 4 hours too. This row is right: leave it." },
      ],
      getEl: () => oblCell("SLA (R21)", 1)?.closest("td") ?? null,
      onEnter: () => oblCell("SLA (R21)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => oblCell("SLA (R21)", 1),
      alsoShow: () => (innerWidth > 700 ? $(RULES_WINDOW) : null),
    },
    // A row the draft has wrong, corrected by the learner: E0018, the eighteenth.
    rowCell("One that differs", "SLA (R21)", () => oblCell("SLA (R21)", 18), "Now E0018.", {
      steps: [
        { lead: "Read its **Leaver type**", text: "Voluntary." },
        { lead: "Read the draft's SLA", text: "1 hour. In R21 that is the SLA of an involuntary leaver, someone dismissed." },
        { lead: "Choose **4 hours**", text: "R21's SLA for a voluntary leaver. With 1 hour, an account closed in time would be counted late." },
      ],
      nextWhen: () => selIs("SLA (R21)", 18, "4 hours"),
      alsoShow: () => (innerWidth > 700 ? $(RULES_WINDOW) : null),
      doIt: "Correct E0018's SLA",
    }),
    checkBeside(RULES_WINDOW, "Check the other 27 the same way. Then Check my answers shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.2-4": [
    {
      title: "Disabled in time?",
      icon: "table",
      body: "Every account a leaver held is measured against the SLA: a late disable is a breach the KPI counts, even if the account is closed now. The checklist beside the table shows the leaver in hand: each system's disable time in UTC and how long after termination it came.",
      getEl: () => $('[data-guide="checklist"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A voluntary leaver, SLA 4 hours: an account disabled **5 h 10 min** after termination is late; one disabled after **3 h 50 min** is in time.",
      tips: [
        { kind: "note", text: "A system shown **Still active** was found in step 2. It is not late." },
      ],
      getEl: () => $('[data-guide="checklist-row"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "Check the first leaver",
      icon: "edit",
      body: "**E0001** is lit: a voluntary leaver, so the SLA is 4 hours. Each system shows how long after termination it was disabled.",
      steps: [
        { lead: "SSO / IdP: late, mark it", text: "Disabled 68 h 56 min after termination. That is more than 4 hours." },
        { lead: "Jira + Confluence: late, mark it", text: "Disabled 61 h 05 min after termination." },
        { lead: "The other systems: in time", text: "E-mail, VPN / ZTNA and Power BI were each disabled in under 4 hours. Leave them unmarked." },
        { lead: "Two are marked, so record **Late**" },
      ],
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
      body: "The checklist moves on to the next leaver by itself.",
      tips: [
        { kind: "unsure", text: "To look at a leaver again, click its Timeliness in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 29 are recorded, Check my answers shows each leaver's answer and why. Your rows lock then, so look them over first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T6.2-5q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. An exception is not finished when its account is closed: someone asks what happened while it was open. Part 1: what is done about an account closed late and still used.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    ...openLib(5, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The leaver procedure",
      icon: "book",
      body: "**Section 6.3** is the leaver procedure: each step, who does it and what it produces. The bar at the top of the window jumps to it.",
      getEl: () => $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-5 [data-guide="decision"]'),
      pointAt: () => $('#act-5 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-5 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button (LVR-REC Sheet 3), below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-5 [data-guide="show-me-how"]'),
    },
  ],

  "T6.2-5": [
    {
      title: "Each exception's action",
      icon: "table",
      body: "Your answer is in. Part 2: every exception a reconciliation finds leaves with an **action** and an **owner**, or it is simply forgotten. Sheet 3 lists the accounts steps 2 and 4 found, with each one's last sign-in.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("access", "Access Reviews", "Track Remediation", "Ref-Actions: the standard action, owner and due date of each exception type.", REMEDIATION_WINDOW),
    {
      title: "Two codes matter here",
      icon: "book",
      body: "Two codes matter here. Read what each makes the IAM team do:",
      steps: [
        { lead: "An account still active" },
        { lead: "An account disabled after the SLA" },
      ],
      getEl: () => $(REMEDIATION_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "A made-up account: disabled at 14:00, last sign-in 09:00 the same day, termination 12:00.",
      steps: [
        { lead: "Its code comes from how it was closed", text: "Here: disabled at 14:00, two hours after termination." },
        { lead: "Compare the last sign-in with termination", text: "09:00 is before 12:00, so nothing was used after the person left." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    firstItem("The first exception yourself", "The first row is E0001's SSO / IdP account. Its code comes from how it was closed: Disabled (UTC) is 2026-08-31, three days after Termination, so it is closed but after the SLA. Track Remediation calls that LV. Then compare Last sign-in with Termination: 2026-08-30 19:12 is after 2026-08-28 10:45, so the account was used after the person left. BKB-POL-006 Section 6.3 step 4 raises an incident for that. Choose **LV and incident**.", "Action (R20)", 1, () => selIs("Action (R20)", 1, "LV and incident"), "Choose its action", REMEDIATION_WINDOW),
    checkBeside(REMEDIATION_WINDOW, "Do the other 14. Compare the two times with care: some fall on the same day. Check my answers then shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T6.2-6": [
    {
      title: "The leaver KPI",
      icon: "table",
      body: "This KPI is what management watches: the share of leavers whose every account was disabled within the SLA. It feeds the ISMS objectives (T7.2).",
      tips: [
        { kind: "unsure", text: "Rule R21's formula is in the note; LVR-REC **Sheet 2**, below LVR-KPI, has each leaver's result." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    firstItem("The numerator yourself", "The first line is the numerator: leavers fully disabled within the SLA. In Sheet 2, below, read down the last column, Fully disabled within SLA, and count the rows marked Yes. In a correct run 18 of the 29 are Yes: the other 11 had an account disabled late or still active. Type **18** in **Your answer**.", "Your answer", 1, () => valIs("Your answer", 1, "18"), "Type the numerator"),
    ...openLib(6, "BKB-POL-006", "The Access Control and Identity Management Policy", POL006_WINDOW),
    {
      title: "The target",
      icon: "book",
      body: "**Section 10** lists the policy's KPIs and their targets. The bar at the top of the window jumps to it.",
      getEl: () => $(POL006_WINDOW),
      onEnter: () => $(`${POL006_WINDOW} [data-sec="10"]`)?.scrollIntoView({ block: "start" }),
    },
    checkAnswers("Then the denominator, the KPI and the target line. Check my answers then shows each line's answer and why. Your lines lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked and LVR-REC is submitted. The file box appears under your checked answers, with the four parts of the file's name; LVR-KPI is a platform form, handed in with it."),
  ],

  // T7.1 (desk-step-builder, 29 Oct 2026): RR-UPD and its working sheets in Risk Register › Score Risk; RRU-EVENTS on Risk
  // Register › New Risk, the office register on Score Risk (both T7.1's own screens). Steps 7 and 8 ask their question in the
  // row (guides "7q", "8q": R07 in Rule tables, BKB-ERM-001 Section 4), then work part 2 in the modal. Step 13's question needs
  // no guide; its part 2 does.
  "T7.1-1": [
    {
      title: "Read the new events",
      icon: "table",
      body: "An analyst reads each incoming event before logging it: what it is, what it would harm, how often it happens and what already protects against it. **RRU-EVENTS** has five: three new risks, **N1 to N3**, and two changes to rows already in the register, **C1** and **C2**.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A made-up event: \"A laptop is lost once in 5–20 years.\" Its likelihood is read from that fact: BKB-ERM-001 Section 6.2 calls \"once in 5–20 years\" **Unlikely**. Each question here asks where a part like that sits in RRU-EVENTS.",
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
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint. The wide sheet scrolls sideways." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T7.1-2": [
    {
      title: "One statement per new risk",
      icon: "table",
      body: "Every risk is written in one frame, **cause, event, consequence, asset**, so risks can be compared and nobody reads a cause as the risk. Rule R06 is in the note. Each new event has three drafts; one fills the frame right.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "New Risk", "RRU-EVENTS is tagged with this step. It opens beside your sheet.", NEWRISK_WINDOW),
    {
      title: "The facts",
      icon: "book",
      body: "Each new event's **Facts** name its cause, what may happen and the consequence; **Asset** names the asset.",
      tips: [
        { kind: "avoid", text: "a draft that puts a fact in the wrong place, or ends with something that is not the asset. It does not follow R06." },
      ],
      getEl: () => $(NEWRISK_WINDOW),
    },
    rowAnswer(firstItem("N1, worked", "Hold each of N1's three drafts against its facts.", "Best draft (R06)", 1, () => selIs("Best draft (R06)", 1, "Draft 2"), "Choose N1's best draft", NEWRISK_WINDOW), [
      { lead: "Read N1's **Facts** in RRU-EVENTS", text: "The cause is the retention cut to 90 days. What may happen is the deletion of logs." },
      { lead: "Rule out two drafts", text: "Draft 1 puts the deletion where the cause goes. Draft 3 ends with a cost saving and a department: not the consequence, not the asset." },
      { lead: "Choose **Draft 2**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(NEWRISK_WINDOW, "N1")),
    checkAnswers("Then N2 and N3, read the same way. Check my answers then shows each row's answer and why, and RR-UPD records the statements. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-3": [
    {
      title: "Rate each new risk",
      icon: "table",
      body: "Ratings compare only when every analyst reads the same scale the same way. Rule **R07**, in the note, takes the descriptor whose words the fact uses. Each new risk has three lines: inherent likelihood, inherent impact, residual likelihood.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(3, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "The scales",
      icon: "book",
      body: "**Section 6.2** gives the likelihood descriptors, **Section 6.3** the impact ones. The bar at the top of the window jumps to each.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    // N1's three lines, worked (owner, 22 Nov 2026): each is read a different way, so each has its card.
    rowAnswer(firstItem("N1's likelihood, worked", "**N1 · Likelihood (inherent)** is the first line.", "Score (R07)", 1, () => selIs("Score (R07)", 1, "4"), "Score N1's likelihood", ERM_WINDOW), [
      { lead: "Read its **Fact**", text: "Incidents found late happen \"about once a year at the office\"." },
      { lead: "Find those words in Section 6.2", text: "The row **Likely** has the Frequency \"About once a year\". Its Score is 4." },
      { lead: "Choose **4**", text: "Next unlocks once it is chosen." },
    ], () => $(`${ERM_WINDOW} [data-sec="6.2"]`)),
    rowAnswer(firstItem("N1's impact, worked", "**N1 · Impact (inherent)** is the second line.", "Score (R07)", 2, () => selIs("Score (R07)", 2, "3"), "Score N1's impact", ERM_WINDOW), [
      { lead: "Read its **Fact**", text: "\"A reportable breach the office cannot investigate, and a warning from the National Privacy Commission.\"" },
      { lead: "Find those words in Section 6.3", text: "The row **3 Moderate** has \"Reportable breach; warning\" under Legal / regulatory." },
      { lead: "Choose **3**", text: "Next unlocks once it is chosen." },
    ], () => $(`${ERM_WINDOW} [data-sec="6.3"]`)),
    rowAnswer(firstItem("N1's residual likelihood, worked", "**N1 · Likelihood (residual)** is the third line. No scale is read for it: rule R07, in the note, works it out.", "Score (R07)", 3, () => selIs("Score (R07)", 3, "3"), "Score N1's residual likelihood", STEP_NOTE), [
      { lead: "Start from the inherent likelihood", text: "4, from the first line." },
      { lead: "Count the controls its **Fact** marks working", text: "SIEM alerting is \"working\". The monthly review is \"not working\". So one counts." },
      { lead: "Choose **3**", text: "4 less 1. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then N2 and N3: three lines each, read the same way. Check my answers then shows each line's answer and why, and RR-UPD works out the scores and ratings. Your lines lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-4": [
    {
      title: "Who owns each risk, who may accept it",
      icon: "table",
      body: "Every risk needs two names:",
      steps: [
        { lead: "Its owner", text: "Carries out the treatment and reports changes." },
        { lead: "Its acceptance authority", text: "Decides whether what is left can be lived with." },
      ],
      tips: [
        { kind: "avoid", text: "copying the authority from the register. Rule R36 sets it from the Charter's delegation table, even where the register's own rows differ." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Assign Owner", "The office's assets, with their owners, are tagged with this step.", OWNER_WINDOW),
    rowAnswer(firstItem("R-16-HQ-26's owner, worked", "R-16-HQ-26 is worked here, both cells. First its **Risk owner**.", "Risk owner", 26, () => selIs("Risk owner", 26, "Chief Information Security Officer"), "Choose R-16-HQ-26's owner", OWNER_WINDOW), [
      { lead: "Read its asset in the note", text: "R-16-HQ-26, SIEM & log analytics platform." },
      { lead: "Find that asset in Assign Owner", text: "Its row's Owner is the Chief Information Security Officer." },
      { lead: "Choose **Chief Information Security Officer**", text: "A risk takes its asset's owner, whoever raised the event. Next unlocks once it is chosen." },
    ], () => rowIn(OWNER_WINDOW, "SIEM & log")),
    {
      title: "Rule R36",
      icon: "book",
      body: "R36, in the note, gives one authority for each residual rating. Your three rows show their residual rating beside the choice.",
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    rowAnswer(firstItem("Its authority, worked", "The same row's second cell: **Acceptance authority (R36)**.", "Acceptance authority (R36)", 26, () => selIs("Acceptance authority (R36)", 26, "Org CRCO"), "Choose R-16-HQ-26's authority", STEP_NOTE), [
      { lead: "Read its **Residual rating**", text: "Residual score 9: **Medium**, in this row." },
      { lead: "Read R36 in the note", text: "\"Medium → Org CRCO.\"" },
      { lead: "Choose **Org CRCO**", text: "Grey rows show Org CEO for a Medium risk. R36 says to use its own table. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way: owner and authority. A wrong owner is flagged at once. Check my answers then shows each authority's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-5": [
    {
      title: "Controls for each new risk",
      icon: "table",
      body: "Every risk is linked to the controls that treat it, so the Statement of Applicability and the control tests can be traced back to it. **Ref-Keywords** maps key words to a BKB policy and its Annex A controls.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(5, "Ref-Keywords"),
    {
      title: "Key words",
      icon: "book",
      body: "Find the row whose key words the risk's **category** uses. Example: a category \"Cyber — misuse of access\" uses \"access\", so its row's controls are A.5.15–A.5.18, A.8.5.",
      getEl: () => $(PAGE_WINDOW("Ref-Keywords")),
    },
    rowAnswer(firstItem("R-16-HQ-26, worked", "R-16-HQ-26's controls are read from its category.", "ISO/IEC 27001:2022 controls", 26, () => selIs("ISO/IEC 27001:2022 controls", 26, "A.8.15, A.8.16, A.8.32"), "Choose R-16-HQ-26's controls", PAGE_WINDOW("Ref-Keywords")), [
      { lead: "Read its **Category**", text: "It ends \"logging gaps\"." },
      { lead: "Find that word under **Key words** in Ref-Keywords", text: "The row \"logging, monitoring, change\" (BKB-POL-009)." },
      { lead: "Choose that row's controls", text: "**A.8.15, A.8.16, A.8.32**. Next unlocks once they are chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Keywords"), "logging")),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-6": [
    {
      title: "Decide each new risk",
      icon: "table",
      body: "A risk **above appetite** needs a treatment with a due date; one **within** it is accepted and monitored. Rule R08, in the note, gives the appetite; BKB-ERM-001 Section 7 gives the days for each rating.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Compare the residual score with the appetite:",
      steps: [
        { lead: "Within appetite", text: "A residual of 10: **Accept and monitor**." },
        { lead: "Above appetite", text: "A residual of 14: **Treat**, with the days Section 7 gives a High risk." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("R-16-HQ-26, worked", "R-16-HQ-26's decision follows from one comparison.", "Decision and due (R08)", 26, () => selIs("Decision and due (R08)", 26, "Accept and monitor"), "Choose R-16-HQ-26's decision", STEP_NOTE), [
      { lead: "Read its **Residual score**", text: "9, in this row." },
      { lead: "Compare it with R08's appetite, in the note", text: "The appetite is 11. 9 is not above 11, so the risk is within appetite." },
      { lead: "Choose **Accept and monitor**", text: "Only a risk above appetite is treated and given due days. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.1-7q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. A control reported as finished changes **one field** of a risk and no other, and the register has to show which. Part 1: which field a new control changes.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R07 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R07",
      icon: "book",
      body: "**R07** says how each part of a rating is set, and what an existing control does to it.",
      getEl: () => rowIn(RULES_WINDOW, "R07") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R07")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
      pointAt: () => $('#act-7 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-7 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button (the change log), below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-7 [data-guide="show-me-how"]'),
    },
  ],

  "T7.1-7": [
    {
      title: "Now apply C1 and C2",
      icon: "table",
      body: "Your answer is in. Part 2: the two change events. Every change to a register row is logged **field by field**, with old and new value and its evidence (rule R22), so a reviewer sees what moved and why.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The office register is tagged with this step. It opens beside the change log.", SCORE_WINDOW),
    {
      title: "The rows they change",
      icon: "book",
      body: "Find **R-16-HQ-21** and **R-16-HQ-12** in the register: their residual scores, ratings and authorities as they stand.",
      getEl: () => $(SCORE_WINDOW),
    },
    rowAnswer(firstItem("C1, worked", "C1 changes one field of R-16-HQ-21.", "Change (R22)", 1, () => selIs("Change (R22)", 1, "Likelihood (residual): 1 → 2"), "Choose C1's change", SCORE_WINDOW), [
      { lead: "Read **What the event says**", text: "The existing control \"Multi-region deployment for some services\" is not working for this risk." },
      { lead: "Ask what R07 took off for it", text: "Each working control takes one off the residual likelihood. This one no longer counts, so its one comes back." },
      { lead: "Choose **Likelihood (residual): 1 → 2**", text: "The inherent rating is before controls, and nothing in C1 touches the impact. Next unlocks once it is chosen." },
    ], () => rowIn(SCORE_WINDOW, "R-16-HQ-21")),
    ...openScreen("risk", "Risk Register", "Mitigation Tracker", "C2 is about a treatment action. The office's open actions are tagged with this step.", TRACKER_WINDOW),
    {
      title: "C2's line",
      icon: "book",
      body: "Find **R-16-HQ-12**:",
      steps: [
        { lead: "Read its action, due date and progress" },
        { lead: "Read the note under the table", text: "What an action in this tracker is." },
        { lead: "Ask what rule R07 counts" },
      ],
      getEl: () => $(TRACKER_WINDOW),
    },
    checkAnswers("Then C2. Check my answers then shows each change's answer and why, and the platform writes its fields and the rows that follow from it. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.1-8q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. A Director reads the note to see what needs a decision, so the test for that list has to be the right one. Part 1: which risks the note lists as above appetite.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    ...openLib(8, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "Appetite",
      icon: "book",
      body: "**Section 4** sets the appetite for each criticality band. Read what kind of score it is the maximum of. The bar at the top of the window jumps to it.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="4"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
      pointAt: () => $('#act-8 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-8 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button (RR-NOTE), below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-8 [data-guide="show-me-how"]'),
    },
  ],

  "T7.1-8": [
    {
      title: "Now complete RR-NOTE",
      icon: "table",
      body: "Your answer is in. Part 2: the register's owner gets a one-page note, not the register. The new and changed risks are listed for you. You add two lists:",
      steps: [
        { lead: "The risks above appetite" },
        { lead: "The rows to correct", text: "Rows whose acceptance authority is not the one rule R36 gives. Their owners correct them, not this update." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The office register is tagged with this step. It opens beside the note.", SCORE_WINDOW),
    {
      title: "Read down the register",
      icon: "book",
      body: "Residual score, rating and acceptance authority are side by side. Your own three rows, and R-16-HQ-21 after C1, are in the note above the sheet.",
      getEl: () => $(SCORE_WINDOW),
    },
    rowAnswer(firstItem("The first list, worked", "**Risks above appetite**: every risk whose residual score is above 11, the appetite you read in part 1.", "Content", 3, () => valIs("Content", 3, "R-16-HQ-02; R-16-HQ-27; R-16-HQ-28"), "Type the risks above appetite", SCORE_WINDOW), [
      { lead: "Read down **Residual score** in Score Risk", text: "Of its 25 rows only R-16-HQ-02 is above 11: it stands at 12." },
      { lead: "Add your own rows, from the note", text: "R-16-HQ-27 is 20 and R-16-HQ-28 is 12. R-16-HQ-26, at 9, and R-16-HQ-21, at 6, are within appetite." },
      { lead: "Type **R-16-HQ-02; R-16-HQ-27; R-16-HQ-28**", text: "Separated by ;. Next unlocks once the list is right." },
    ], () => cellAt(SCORE_WINDOW, "R-16-HQ-02", "Residual score")),
    checkAnswers("Then the rows to correct: read each row's rating and authority against R36 the same way. Check my answers then shows each list's answer and why, and the note writes the decisions needed. Your lists lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Cyber Risk Manager has one more change for you. Open it from the **Inbox** on the toolbar and reply: Mark step complete waits for your reply.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked and your reply is in."),
  ],

  "T7.1-9": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "**RR-UPD** is the record a reviewer trusts: the office register with your three new rows and its change log. **RR-NOTE** goes to the Regional Managing Director. T7.2's Top-5 table and the acceptance request are built from them. This step checks them, names RR-UPD and submits both.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "The Cyber Risk Manager has one more event for you. Open the message from the **Inbox** on the toolbar and confirm it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Sheet N4: one more event",
      icon: "edit",
      body: "**Sheet N4** is below the note. Work its lines as you worked N1 to N3:",
      steps: [
        { lead: "Statement", text: "By R06." },
        { lead: "Scores", text: "By R07 and BKB-ERM-001." },
        { lead: "Owner", text: "On Assign Owner." },
        { lead: "Decision, authority and option", text: "R08, R36 and L12, on the residual you worked out." },
      ],
      tips: [
        { kind: "unsure", text: "A wrong value is flagged at once, with where to read it." },
      ],
      getEl: () => $('[data-reg="RR-UPD N4"]'),
      onEnter: () => $('[data-reg="RR-UPD N4"]')?.scrollIntoView({ block: "center" }),
    },
    rowCell("The first line, worked", "Your answer", t719Row, "**Best statement (R06)** is the first line. Its Read cell holds N4's facts and three drafts.", {
      steps: [
        { lead: "Read the facts", text: "Cause: leavers' access removed by hand. What may happen: use of a leaver's account after termination. Consequence: unauthorised changes to company filings. The sheet's heading names the asset: Corporate entity & governance records." },
        { lead: "Rule out two drafts", text: "Draft 1 starts with the event, not the cause. Draft 2 ends \"for Legal & Corporate Affairs\": a department, not the asset." },
        { lead: "Choose **Draft 3**", text: "Each part in R06's place. Next unlocks once it is chosen." },
      ],
      tips: [{ kind: "note", text: "The other seven lines are yours: each Read cell says what to read, and the card before this one names its rule." }],
    }),
    ...nameAndSubmit("xlsx", "1 to 8").map((c) => (c.title === "Name the file" ? { ...c, body: "Type the four parts listed under the box, in order, joined by underscores, then .xlsx. RR-NOTE is a platform form, handed in with it." } : c)),
  ],

  "T7.1-10": [
    {
      title: "Asset, threat, control",
      icon: "table",
      body: "ISO/IEC 27005 traces a risk through an **asset**: the threat to it, the weakness it exploits, the harm and the control. Each new risk has its asset here, from the asset register.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-Chain"),
    {
      title: "Asset types",
      icon: "book",
      body: "Each row is an asset type, information or supporting. Match each asset by what the asset register says it is. Example: an HR file of staff records is a **Personal-data set**, information.",
      getEl: () => $(PAGE_WINDOW("Ref-Chain")),
    },
    rowAnswer(firstItem("The first asset, worked", "SIEM & log analytics platform is the first asset.", "Asset type (Ref-Chain)", 1, () => selIs("Asset type (Ref-Chain)", 1, "Log / SIEM platform"), "Choose the SIEM's asset type", PAGE_WINDOW("Ref-Chain")), [
      { lead: "Read its line **From the asset register**", text: "\"Security event aggregation, detection and correlation\": a platform that collects security events and logs." },
      { lead: "Find that kind of asset in Ref-Chain", text: "The last row, **Log / SIEM platform**: a supporting asset." },
      { lead: "Choose **Log / SIEM platform**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Chain"), "Log / SIEM")),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why, and the platform copies each type's threat, vulnerability and impact. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-11": [
    {
      title: "A treatment option per risk",
      icon: "table",
      body: "ISO/IEC 27001 clause 6.1.3 asks for a treatment option for every risk: **modify**, **retain**, **avoid** or **share**. Rule L12, in the note, sets it from the residual score shown beside each risk.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Rule L12",
      icon: "book",
      body: "L12, in the note, gives one option for a residual score **above 11**, another for **11 or less**.",
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    rowAnswer(firstItem("The first risk, worked", "The first row is R-16-HQ-26, the SIEM platform's risk.", "Treatment option (L12)", 1, () => selIs("Treatment option (L12)", 1, "Retain"), "Choose the first option", STEP_NOTE), [
      { lead: "Read its **Residual score (RR-UPD)**", text: "9, in this row." },
      { lead: "Read L12 in the note", text: "\"Residual score ≤ 11 → Retain.\" 9 is not above 11." },
      { lead: "Choose **Retain**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-12": [
    {
      title: "The control for each threat",
      icon: "table",
      body: "Each chain ends in the control that stops its threat. A colleague filled this column from memory; a wrong control sends the treatment to the wrong place. **Ref-Chain** lists one control per asset type, on the same row as the threat shown beside each asset.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(12, "Ref-Chain"),
    {
      title: "The first chain yourself",
      icon: "edit",
      body: "Check each chain against Ref-Chain:",
      steps: [
        { lead: "SIEM & log analytics platform, worked", text: "Its **Asset type (Ref-Chain)** is Log / SIEM platform. That row of Ref-Chain, the last, ends in A.8.15 Logging. The cell says **A.8.15 Logging** too: it agrees, so leave it." },
        { lead: "The next two", text: "Compare the same way.", fork: [{ when: "They agree", then: "Leave it." }, { when: "They differ", then: "Type the ID Ref-Chain gives." }] },
      ],
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Chain")) : null),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-Chain"), "Log / SIEM")?.scrollIntoView({ block: "center" }),
    },
    checkAnswers("Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.1-13": [
    {
      title: "Now tag each control (L05)",
      icon: "table",
      body: "Your answer is in. Part 2: ISO/IEC 27002 tags every control with **attributes**, so controls can be sorted by what they do. Rule L05, in the note, copies three of them from Ref-27002 attributes.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(13, "Ref-27002 attributes"),
    // The first chain's control through its three attributes (tester, 18 Nov 2026): the guide waited on Control type alone.
    rowCell("Its control type", "Control type", t7113Row, "The first row's control is **A.8.15 Logging**, in its Annex A control cell.", {
      steps: [
        { lead: "Find A.8.15's row in Ref-27002 attributes", text: "It is far down the page, among the A.8 controls." },
        { lead: "Read its **Control type** column", text: "It says Detective: logging finds an attack, it does not stop one." },
        { lead: "Choose **Detective**", text: "Next unlocks once it is chosen." },
      ],
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27002 attributes")) : null),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-27002 attributes"), "A.8.15")?.scrollIntoView({ block: "center" }),
    }),
    rowCell("Its security property", "Security property", t7113Row, "Stay on A.8.15's row of the page.", {
      steps: [
        { lead: "Read its **Security properties** column", text: "It says C / I / A: confidentiality, integrity and availability, all three." },
        { lead: "Choose **C / I / A**", text: "Next unlocks once it is chosen." },
      ],
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27002 attributes")) : null),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-27002 attributes"), "A.8.15")?.scrollIntoView({ block: "center" }),
    }),
    rowCell("Its cybersecurity concept", "Cybersecurity concept", t7113Row, "The last cell of the row.", {
      steps: [
        { lead: "Read A.8.15's **Cybersecurity concepts** column", text: "It says Detect." },
        { lead: "Choose **Detect**", text: "Next unlocks once it is chosen." },
      ],
      tips: [{ kind: "note", text: "That is the full row." }],
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-27002 attributes")) : null),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-27002 attributes"), "A.8.15")?.scrollIntoView({ block: "center" }),
    }),
    {
      title: "Then the other two",
      icon: "check",
      body: "Tag the other two controls the same way: three cells each, read on the control's own row of the page.",
      tips: [
        { kind: "unsure", text: "A value that is not the page's is flagged at once, with where to read it." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    finish("**Mark step complete** unlocks once every attribute is the page's."),
  ],

  "T7.1-14": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "**LI-CHAIN** records why each control was chosen: for each new risk's asset, its threat, vulnerability, impact and control, tagged with its attributes. T7.2's acceptance request cites it. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "10 to 13"),
  ],

  "T7.1-15": [
    {
      title: "Treat each risk",
      icon: "table",
      body: "A treatment plan (ISO/IEC 27001 clause 6.1.3) says what is done about each risk.",
      tips: [
        { kind: "avoid", text: "an action that does not reach the risk's cause. It leaves the risk as likely as before." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "New Risk", "RRU-EVENTS is tagged with this step. It opens beside the plan.", NEWRISK_WINDOW),
    rowAnswer(firstItem("R-16-HQ-26, worked", "The action has to carry out the row's option, and no other.", "Action", 1, () => selIs("Action", 1, "Retain and monitor: record the decision, review the KRI quarterly and re-rate if it moves"), "Choose R-16-HQ-26's action", NEWRISK_WINDOW), [
      { lead: "Read its **Option (L12)**", text: "Retain: the risk is within appetite, so it is kept and watched." },
      { lead: "Rule out two actions", text: "\"Modify: restore online retention...\" adds a control the option does not ask for. \"Share: take cyber insurance...\" is another option again." },
      { lead: "Choose the action that starts **Retain and monitor**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(NEWRISK_WINDOW, "N1"), [{ kind: "note", text: "On a Modify row, read the event's **Facts** in RRU-EVENTS: the action has to reach the cause they name." }]),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-16": [
    {
      title: "Link each action to a control",
      icon: "table",
      body: "A plan names the Annex A control each action puts in place, so the Statement of Applicability and the control tests can find it.",
      tips: [
        { kind: "avoid", text: "picking a control from outside the row of the risk's category in Ref-Keywords: rule L12 takes it from that row. Where the row lists several controls, the action's own words decide among them." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(16, "Ref-Keywords"),
    rowAnswer(firstItem("R-16-HQ-26, worked", "A control is linked only where the action puts one in place.", "Control (SoA ID)", 1, () => selIs("Control (SoA ID)", 1, "None: the risk is retained"), "Choose R-16-HQ-26's control"), [
      { lead: "Read its **Option (L12)** and **Action**", text: "Retain, and \"Retain and monitor\": the risk is watched, and no new control is put in place." },
      { lead: "Choose **None: the risk is retained**", text: "Next unlocks once it is chosen." },
    ], undefined, [{ kind: "note", text: "The two Modify rows do take a control: find the category's row in Ref-Keywords, then choose the control on it that the action's own words describe." }]),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-17": [
    {
      title: "A due date per action",
      icon: "table",
      body: "Every action has an owner and a due date it is tracked against; in T12.1 they become rows of the action tracker. Rule **R08** gives the days by residual rating; count them from the **plan's date**, which is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Rule R08",
      icon: "book",
      body: "R08, in the note, gives the days for a risk to **treat**, by its residual rating. A risk within appetite is accepted and monitored: it has **no due date**.",
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A plan dated 2026-01-10 with 30 days to go: 21 days take it to 31 January, 9 more to **2026-02-09**.",
      tips: [
        { kind: "avoid", text: "assuming every month has 30 days. Count across the month end day by day." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      ...firstItem("R-16-HQ-26, worked", "R-16-HQ-26 has no due date. This is how the row says so:", "Due (R08)", 1, () => noneIs("Due (R08)", 1), "Set R-16-HQ-26's due date", STEP_NOTE),
      // The whole row is lit, not the cell alone: the Option the card says to read is three columns to its left.
      getEl: () => oblCell("Due (R08)", 1)?.closest("tr") ?? null,
      // Plain lines, not boxes side by side: the card has to fit under the row on a laptop screen.
      steps: [
        { lead: "Read its **Option (L12)**", text: "Retain: accepted and monitored, not treated." },
        { lead: "Read R08 in the note", text: "It gives due days only to a risk it treats, so nothing is due here." },
        { lead: "Tick **none**", text: "Next unlocks once it is ticked." },
      ],
      tips: [{ kind: "note", text: "A Modify row is treated: count R08's days for its rating from the plan's date, as the example did, and pick that date." }],
    },
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-18": [
    {
      title: "The residual after treatment",
      icon: "table",
      body: "The plan says what the risk will be once the action is done, so the owner knows what is left to accept. Rule **R07** rates it again with the action's control working.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Rule R07",
      icon: "book",
      body: "R07, in the note: each control marked **working** takes one off the residual likelihood, down to 1 at the lowest; the impact stays. Score = likelihood × impact.",
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "Likelihood 3, impact 5, residual 15; the action's control starts working: likelihood 2, impact 5, expected residual **10**.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("R-16-HQ-26, worked", "R-16-HQ-26's score after treatment is read from two cells of its row.", "Expected residual", 1, () => valIs("Expected residual", 1, "9"), "Type R-16-HQ-26's expected residual", STEP_NOTE), [
      { lead: "Read its **Residual (now)**", text: "9: likelihood 3 × impact 3." },
      { lead: "Read its **Control (SoA ID)**", text: "None: the risk is retained. No new control starts working, so R07 takes nothing off the likelihood." },
      { lead: "Type **9**", text: "3 × 3 stays 9. Next unlocks once it is typed." },
    ], undefined, [{ kind: "note", text: "On a Modify row the new control counts as working: one off the likelihood, then multiply by the impact again." }]),
    checkAnswers("Then the other two. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-19": [
    {
      title: "Who accepts the residual",
      icon: "table",
      body: "ISO/IEC 27001 clause 6.1.3 f: the risk owners approve the plan and accept the residual risk it leaves, within the authority the Charter gives them. Rule **R36** names it by rating.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Rule R36",
      icon: "book",
      body: "R36, in the note, names who may accept a residual risk, by its **rating**. Rate the expected residual first, with the bands on the note's last line.",
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    rowAnswer(firstItem("R-16-HQ-26, worked", "R-16-HQ-26: rate the score first, then read who accepts that rating.", "Residual accepted by (R36)", 1, () => selIs("Residual accepted by (R36)", 1, "Org CRCO"), "Choose who accepts R-16-HQ-26", STEP_NOTE), [
      { lead: "Read its **Expected residual**", text: "9, in this row." },
      { lead: "Rate it with the bands on the note's last line", text: "6–11 is Medium, so 9 is Medium." },
      { lead: "Read R36 in the note, then choose **Org CRCO**", text: "\"Medium → Org CRCO.\" Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why, and the plan goes to the owners: their approval is recorded. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.1-20": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "**LI-RTP** is the record an auditor asks for under ISO/IEC 27001 clause 6.1.3: option, action, control, owner, due date, expected residual and approval for each new risk. T12.1 tracks its actions. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "15 to 19"),
  ],
  "T7.2-1q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. Part 1: how two risks with the same residual score are ranked.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R23 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R23",
      icon: "book",
      body: "**R23**'s first sentence says how risks are ranked for the board, and what happens on equal scores.",
      getEl: () => rowIn(RULES_WINDOW, "R23") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R23")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-1 [data-guide="decision"]'),
      pointAt: () => $('#act-1 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-1 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button (the Top-5 ranking), below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-1 [data-guide="show-me-how"]'),
    },
  ],

  "T7.2-1": [
    {
      title: "Rank the Top-5",
      icon: "table",
      body: "Your answer is in. Part 2: the board sees the five residual risks that most need its attention, ranked by one rule so anyone checking reaches the same order. Rule **R23** is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The updated register is tagged with this step. It opens beside RSK-TOP5.", SCORE_WINDOW),
    {
      title: "The register",
      icon: "book",
      body: "28 risks, with your three from T7.1. Rank them by R23:",
      steps: [
        { lead: "Highest Residual score first" },
        { lead: "On a tie, the higher Inherent score" },
        { lead: "Both equal? The lower Risk ID" },
      ],
      getEl: () => $(SCORE_WINDOW),
    },
    rowAnswer(firstItem("Rank 1, worked", "Rank 1 is the risk with the highest residual score.", "Risk ID (R23)", 1, () => selIs("Risk ID (R23)", 1, "R-16-HQ-27"), "Choose rank 1's Risk ID", SCORE_WINDOW), [
      { lead: "Read down **Residual score** in Score Risk", text: "The highest is 20, on R-16-HQ-27, near the end of the register." },
      { lead: "Look for a tie", text: "No other risk is at 20, so R23's tie rules are not needed for this rank." },
      { lead: "Choose **R-16-HQ-27**", text: "Next unlocks once it is chosen." },
    ], () => cellAt(SCORE_WINDOW, "R-16-HQ-27", "Residual score"), [{ kind: "note", text: "Lower ranks do tie. Then read **Inherent score**: the higher ranks first. If that is level too, the lower Risk ID ranks first." }]),
    checkAnswers("Then ranks 2 to 5, the same way. Check my answers then shows each rank's answer and why, and RSK-TOP5 copies each risk's row. Your ranks lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-2": [
    {
      title: "Which way each risk moved",
      icon: "table",
      body: "A board reads a risk's **trend** as much as its score: is it getting better or worse since it last looked? R23's arrows compare each risk's residual score now with the score at the last board report.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Heat Map with KRIs", "What moved since the last board report is tagged with this step. It opens beside RSK-TOP5.", HEAT_WINDOW),
    {
      title: "The change log",
      icon: "book",
      body: "One row for each changed field, with its old and new value.",
      tips: [
        { kind: "avoid", text: "reading only the last change. A residual that went 6 → 8 and later 8 → 6 is where it was: no change." },
      ],
      getEl: () => $(HEAT_WINDOW),
    },
    rowAnswer(firstItem("Rank 1, worked", "Rank 1 is R-16-HQ-27, at residual 20 now.", "Trend (R23)", 1, () => selIs("Trend (R23)", 1, "↑"), "Choose rank 1's trend", HEAT_WINDOW), [
      { lead: "Find R-16-HQ-27 in the change log", text: "One row, dated 2026-11-19: its Residual score went from \"not in the register\" to 20." },
      { lead: "Compare with the last board report, 2026-05-20", text: "The risk had no score then. The note says such a risk's score went up." },
      { lead: "Choose **↑**", text: "Next unlocks once it is chosen." },
    ], () => rowWith(HEAT_WINDOW, "R-16-HQ-27"), [{ kind: "note", text: "A risk with several rows in the log: take its score before the first change after 2026-05-20, and compare that with its score now." }]),
    checkAnswers("Then the other four, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.2-3": [
    {
      title: "One line for the board",
      icon: "table",
      body: "Your answer is in. Part 2: a board reads one line per risk, so the line has to say what the **business** suffers. Each Top-5 risk gets its \"so what\" line, R23's frame completed from the risk's statement. Each row offers three lines.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Business Risk Translator", "The Translator is tagged with this step. It opens beside RSK-TOP5.", TRANSLATOR_WINDOW),
    {
      title: "One statement taken apart",
      icon: "info",
      body: "A statement has a **cause**, an **event** and a **consequence**. This risk is outside your Top-5: read which part reaches the board's line. Your own rows work the same way.",
      getEl: () => $(TRANSLATOR_WINDOW),
    },
    rowAnswer(firstItem("Rank 1, worked", "Rank 1's statement is under its row. R23's frame takes its **consequence**.", "“So what” (R23)", 1, () => selIs("“So what” (R23)", 1, "If this happens, customers suffer large-scale harm from the exposure of their personal data."), "Choose rank 1's line", TRANSLATOR_WINDOW), [
      { lead: "Find the consequence in the statement", text: "It follows \"leading to\": large-scale personal-data harm to customers." },
      { lead: "Rule out two lines", text: "\"...exported to spreadsheets for manual onboarding\" is the cause. \"...sent or saved outside the CRM\" is the event. Both say how it happens, not what it costs." },
      { lead: "Choose the line that says **customers suffer large-scale harm**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other four, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.2-4q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. Part 1: how long an acceptance may last.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R23 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R23",
      icon: "book",
      body: "**R23**'s last sentences say how a risk acceptance is dated.",
      getEl: () => rowIn(RULES_WINDOW, "R23") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R23")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-4 [data-guide="decision"]'),
      pointAt: () => $('#act-4 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-4 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button (RSK-ACC), below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-4 [data-guide="show-me-how"]'),
    },
  ],

  "T7.2-4": [
    {
      title: "The acceptance request",
      icon: "table",
      body: "Your answer is in. Part 2: a risk carried knowingly is accepted **in writing**, by someone with the authority to, until a date when it is decided again. Rules R23 and R36 are in the note; the request's date is on the form.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Score Risk", "The updated register is tagged with this step. It opens beside RSK-ACC.", SCORE_WINDOW),
    {
      title: "The register",
      icon: "book",
      body: "Residual score, rating and acceptance authority are side by side.",
      tips: [
        { kind: "avoid", text: "taking the approver from the register. R36 decides it, even where the register shows another." },
      ],
      getEl: () => $(SCORE_WINDOW),
    },
    rowAnswer(firstItem("The risk, worked", "**Risk ID (R23)** is the form's first field: R23 takes the Medium risk with the highest residual score.", "Value", 2, () => selIs("Value", 2, "R-16-HQ-19"), "Choose the risk for acceptance", SCORE_WINDOW), [
      { lead: "Keep to the rows rated **Medium** in Score Risk", text: "High and Critical rows are out, whatever their score: 6 to 11 is Medium." },
      { lead: "Find the highest **Residual score** among them", text: "R-16-HQ-19 stands at 10. The next Medium rows are at 9." },
      { lead: "Choose **R-16-HQ-19**", text: "Next unlocks once it is chosen." },
    ], () => cellAt(SCORE_WINDOW, "R-16-HQ-19", "Residual score")),
    checkAnswers("Then the expiry, the re-assessment date and the approver. Check my answers then shows each field's answer and why, and the risk's existing controls are copied. The form locks then, so check it first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-5": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "**RSK-TOP5** goes to the board in the semi-annual report and **RSK-ACC** to the approver; nothing changes once they are filed. T12.1's management review reads both. This step checks them and submits both.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...nameAndSubmit("docx", "1 to 4").slice(1).map((c) => (c.title === "Submit it" ? { ...c, body: "Both are platform forms, so there is no file to name. Submit hands them in; the receipt shows a hash (a fingerprint of the files) and a UTC time." } : c)),
  ],

  "T7.2-6": [
    {
      title: "Rate each clause",
      icon: "table",
      body: "A gap analysis rates every clause of ISO/IEC 27001 against the evidence the organisation already has, so the plan works on what is missing. Rule **L13** is in the note; each clause's row lists the deliverables that evidence it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step. They open beside the Gap sheet." } : c)),
    {
      title: "Your review records",
      icon: "book",
      body: "One line for each deliverable you have handed in, with its automated review. A deliverable not in the list has no record yet.",
      getEl: () => $(WAIT_WINDOW),
    },
    rowAnswer(firstItem("Clause 4.1, worked", "Clause 4.1 is the first row.", "Status (L13)", 1, () => selIs("Status (L13)", 1, "Conforms"), "Choose clause 4.1's status", WAIT_WINDOW), [
      { lead: "Read **Your deliverables (Ref-Clause map)**", text: "CTX-BRIEF, CTX-IP and LI-SCOPE." },
      { lead: "Look each up in your review records", text: "All three are listed, each as Accepted, with no review comments." },
      { lead: "Choose **Conforms**", text: "L13: every deliverable accepted. Next unlocks once it is chosen." },
    ], () => rowIn(WAIT_WINDOW, "CTX-BRIEF")),
    checkAnswers("Then the other 24, the same way. Check my answers then shows each clause's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T7.2-7": [
    {
      title: "The scales in the method card",
      icon: "table",
      body: "Your answer is in. Part 2: a method card (ISO/IEC 27001 clause 6.1.2) names the scales every assessor uses, so two people rate the same risk the same way. A colleague filled these rows from memory; you check them against **BKB-ERM-001**.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "The scales",
      icon: "book",
      body: "**Section 6.2** gives the likelihood scale, **Section 6.3** the impact scale. The bar at the top of the window jumps to each.",
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Compare name by name",
      icon: "edit",
      body: "For each row:",
      steps: [
        { lead: "Likelihood scale, worked", text: "Section 6.2's table starts at score 5, so read its **Descriptor** column from the bottom: Rare; Unlikely; Possible; Likely; Almost certain. The row holds the same five names in that order: it agrees, so leave it." },
        { lead: "Impact scale: yours", text: "Read the name beside each number in Section 6.3's **Score** column the same way, and correct any name that differs." },
      ],
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(ERM_WINDOW) : null),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    checkAnswers("Check my answers then shows each row's answer and why. Your rows lock then, so compare both first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-8": [
    {
      title: "Appetite and due days",
      icon: "table",
      body: "The method card states the criteria that decide what happens to a risk: the **appetite** it is compared with (clause 6.1.2 a) and how fast a risk above it must be treated. A colleague filled these two rows: check them before the card goes in.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(8, "BKB-ERM-001", "The Enterprise Risk Management Framework", ERM_WINDOW),
    {
      title: "Section 4",
      icon: "book",
      body: "Read the right place in BKB-ERM-001:",
      steps: [
        { lead: "Section 4: appetite", text: "One row per criticality band. GlobalConnect is **LOW**." },
        { lead: "Section 7: due days", text: "In a column of their own." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to each." },
      ],
      getEl: () => $(ERM_WINDOW),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="4"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The appetite, worked", "**Risk appetite, LOW-criticality organisation** is the first row. The colleague wrote 10.", "What the card says", 6, () => valIs("What the card says", 6, "11"), "Correct the appetite", ERM_WINDOW), [
      { lead: "Read Section 4's table, the row **LOW**", text: "Its Max. residual score is 11." },
      { lead: "See where the 10 came from", text: "The row above, MEDIUM: another band's value." },
      { lead: "Type **11** over the 10", text: "The number only. Next unlocks once it is typed." },
    ], () => $(`${ERM_WINDOW} [data-sec="4"]`)),
    {
      title: "The due days: yours",
      icon: "edit",
      body: "Read the second row against Section 7 the same way: each rating's row, its **Due** column and no other. Correct any value that differs, and leave one that agrees.",
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(ERM_WINDOW) : null),
      onEnter: () => $(`${ERM_WINDOW} [data-sec="7"]`)?.scrollIntoView({ block: "start" }),
    },
    checkAnswers("Check my answers then shows each row's answer and why. Your rows lock then, so compare both first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-9": [
    {
      title: "Who accepts what",
      icon: "table",
      body: "The method card names who may accept each level of residual risk (clause 6.1.2 a), so an acceptance is never signed by the wrong person. A colleague filled these four rows and nobody has checked them. The source is the Charter's delegation table.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(9, "Charter", "The BKB Group GRC Charter", CHARTER_WINDOW),
    {
      title: "Section 6.1",
      icon: "book",
      body: "**Section 6.1**: one row per residual rating, one column per criticality band.",
      tips: [
        { kind: "avoid", text: "reading another band's column. GlobalConnect is LOW-criticality: read only that column." },
      ],
      getEl: () => $(`${CHARTER_WINDOW} [data-sec="6.1"]`) ?? $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Compare each row",
      icon: "edit",
      body: "For each rating, compare the row with the Charter.",
      steps: [
        { lead: "Accepts a Low residual risk, worked", text: "In Section 6.1, the row **Low (1–5)** under **LOW-criticality org** says Risk owner. The card says Risk owner too: it agrees, so leave it." },
        { lead: "The other three: yours", text: "Read each rating's row under the same column.", fork: [{ when: "They agree", then: "Leave the row." }, { when: "They differ", then: "Choose the authority the Charter names." }] },
      ],
      getEl: () => $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(CHARTER_WINDOW) : null),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    checkAnswers("Check my answers then shows each row's answer and why. Your rows lock then, so compare all four first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-10": [
    {
      title: "Where the results live",
      icon: "table",
      body: "An auditor asks where the results of risk assessments are kept: clause 8.2 makes them documented information. The method card names the record.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-Clause map"),
    {
      title: "Clause 8.2",
      icon: "book",
      body: "Row 8.2 lists the documented information it requires, and your deliverables that evidence it. Choose the record that holds **every** risk's results.",
      getEl: () => rowIn(PAGE_WINDOW("Ref-Clause map"), "8.2") ?? $(PAGE_WINDOW("Ref-Clause map")),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-Clause map"), "8.2")?.scrollIntoView({ block: "center" }),
    },
    rowAnswer(firstItem("The one row, worked", "This step has one row, so its answer is worked here in full.", "What the card says", 13, () => selIs("What the card says", 13, "Office risk register (RR-UPD)"), "Choose where the results are kept", PAGE_WINDOW("Ref-Clause map")), [
      { lead: "Read row 8.2 of Ref-Clause map", text: "The results of risk assessments are kept as documented information." },
      { lead: "Ask which record holds every risk's results", text: "RSK-TOP5 holds five risks and RSK-ACC one. LI-RAM is the method, not the results. RR-UPD holds each risk's ratings, decision and owner." },
      { lead: "Choose **Office risk register (RR-UPD)**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Clause map"), "8.2")),
    checkAnswers("Then Check my answers: you see the answer and why. The row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  "T7.2-11": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "The method card is part of the ISMS's documented information: a certification auditor reads it, and asks another assessor to follow it. This step checks **LI-RAM**, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "7 to 10"),
  ],

  "T7.2-12": [
    {
      title: "What each gap needs",
      icon: "table",
      body: "Every **Partial** or **Gap** clause gets an action, and the action is the evidence still missing. Your statuses are checked; the Conforms rows are filled for you.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step. They open beside the Gap sheet." } : c)),
    rowAnswer(firstItem("Clause 4.2, worked", "Clause 4.2 is the first row you rated Partial.", "Not yet accepted (action)", 2, () => valIs("Not yet accepted (action)", 2, "LI-FAM"), "Type clause 4.2's missing deliverables", WAIT_WINDOW), [
      { lead: "Read **Your deliverables (Ref-Clause map)**", text: "CTX-BRIEF, CTX-IP, OBL-REG, LI-FAM and LI-SCOPE." },
      { lead: "Look each up in your review records", text: "Four are Accepted. LI-FAM is \"Accepted with review comments\": not accepted yet." },
      { lead: "Type **LI-FAM**", text: "Next unlocks once it is typed." },
    ], () => rowIn(WAIT_WINDOW, "LI-FAM"), [{ kind: "note", text: "A deliverable that is not in the records at all is missing too. Where a clause has several, separate their codes with ;." }]),
    checkAnswers("Then the other Partial and Gap clauses, the same way. Check my answers then shows each clause's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-13": [
    {
      title: "Objectives you can measure",
      icon: "table",
      body: "An ISMS objective (clause 6.2) is written so the management review can say whether it was met: **a number, a unit and a date**. Rule L14, in the note, gives each target.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Calendar", CAL_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Calendar")) ?? null, body: "The calendar is tagged with this step: it gives the day week 12 opens." } : c)),
    {
      title: "An example",
      icon: "info",
      body: "A date of \"week 3 + 2 months\", with week 3 opening on 19 October 2026, is **2026-12-19**.",
      getEl: () => $(CAL_WINDOW),
    },
    rowAnswer(firstItem("The first objective, worked", "The leavers objective needs its number from L14 and its date from the calendar.", "Objective as measured (L14)", 1, () => selIs("Objective as measured (L14)", 1, toLearner("95 % of leavers are de-provisioned within 4 hours by 2027-06-21")), "Choose the leavers objective", CAL_WINDOW), [
      { lead: "Read L14 in the note", text: "Leavers disabled within 4 h: target 95 %." },
      { lead: "Work out the date", text: "The note dates it programme week 12 + 6 months: week 12 opens on 2026-12-21 (Home › Calendar), so 2027-06-21." },
      { lead: "Choose the line with **95 %** and that date", text: "The other three have another target, a date one month after week 12, or no number. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-14": [
    {
      title: "An owner for each milestone",
      icon: "table",
      body: "Every milestone of an implementation plan has one accountable owner (clause 7.1, resources), taken from the RACI so nobody owns work they are not accountable for. Rule **L15** is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(14, "Ref-Milestones"),
    {
      title: "The Owner column",
      icon: "book",
      body: "Read the **Owner** column:",
      steps: [
        { lead: "It names an owner", text: "No ISMS process covers the milestone: that is its owner." },
        { lead: "It names a process", text: "The RACI is the authority, so read the role there." },
      ],
      getEl: () => $(PAGE_WINDOW("Ref-Milestones")),
    },
    ...openPage(14, "Ref-ISMS processes"),
    {
      title: "The Accountable roles",
      icon: "book",
      body: "Each ISMS process with its Accountable role. Take the role it names **first**.",
      getEl: () => $(PAGE_WINDOW("Ref-ISMS processes")),
    },
    // M2, not M1: M1's owner is named in Ref-Milestones itself, and M2 is the first row that needs both pages.
    rowAnswer(firstItem("M2, worked", "M2, Statement of Applicability approved, is the first row that needs both pages.", "Owner (L15)", 2, () => selIs("Owner (L15)", 2, "CISO"), "Choose M2's owner", PAGE_WINDOW("Ref-ISMS processes")), [
      { lead: "Read M2's **Owner** in Ref-Milestones", text: "\"RACI A of Statement of Applicability\": a process, not a role." },
      { lead: "Find that process in Ref-ISMS processes", text: "The row Statement of Applicability: its Owner (Accountable) is CISO." },
      { lead: "Choose **CISO**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-ISMS processes"), "Statement of Applicability")),
    checkAnswers("Then the other five, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-15": [
    {
      title: "Risks to the ISMS itself",
      icon: "table",
      body: "Clause 6.1.1 asks what could stop the ISMS itself working, and puts each action that addresses it into the plan, so it is done and tracked like the rest.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("The first one, worked", "ISMS risk / opportunity 1 is the first row.", "Milestone (clause 6.1.1)", 1, () => selIs("Milestone (clause 6.1.1)", 1, "M2 Statement of Applicability approved"), "Choose its milestone", STEP_NOTE), [
      { lead: "Read its **ISMS risk**", text: "The only person who knows the SoA, the Statement of Applicability, leaves." },
      { lead: "Ask which milestone produces the thing at risk", text: "The note says to choose that one. The SoA is produced in M2, so documenting it and cross-training belong to M2's work." },
      { lead: "Choose **M2 Statement of Applicability approved**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T7.2-16": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This file is what top management signs off and the management review follows: the gap analysis, the objectives and the implementation plan, in four sheets. T12.1 checks each objective. This step checks **LI-PLAN**, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
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
      body: "A vulnerability SLA test starts by putting every finding in the policy **class** that sets its deadline. The class depends on three things the scanner gives: **exposure**, **KEV listing** and **severity**. Each row is one kind of finding; your class goes to every finding of that kind. Rule R24 is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Rule R24",
      icon: "book",
      body: "Read R24's classes in the note **in order** and stop at the first that fits.",
      tips: [
        { kind: "note", text: "Example: a KEV-listed Medium finding on an internet-facing asset is class 1. KEV on an internet-facing asset comes first, whatever the severity." },
      ],
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    rowAnswer(firstItem("The first kind, worked", "Row 1 names three things, separated by dots.", "Class (R24)", 1, () => selIs("Class (R24)", 1, "Class 2 (14 days)"), "Choose row 1's class", STEP_NOTE), [
      { lead: "Read the row", text: "An internal asset. KEV-listed. Scanner severity Critical." },
      { lead: "Try R24's classes from the top, in the note", text: "Class 1 needs an internet-facing asset: this one is internal. Class 2 is an internal asset that is Critical or KEV-listed: this one is both." },
      { lead: "Choose **Class 2 (14 days)**", text: "Next unlocks once it is chosen." },
    ], undefined, [{ kind: "note", text: "Stop at the first class that fits. A row can fit a later class too." }]),
    checkAnswers("Then the other eight, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-2": [
    {
      title: "Check the formula by hand",
      icon: "table",
      body: "Before relying on a colleague's formula for 172 rows, an analyst works a few rows out by hand and compares. Here: one finding of each class. **Due date** shows what the formula gives; due = first detected + the class's days.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A class 3 finding (30 days) first detected on 2026-01-20: 11 days take it to 31 January, 19 more to **2026-02-19**.",
      tips: [
        { kind: "avoid", text: "trusting a date that crosses a month end. Formulas slip most there." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    // V-0009, not the first row: the first two agree with the formula, and this is the first whose count crosses a month end.
    rowAnswer(firstItem("V-0009, worked", "V-0009 is the third row. The formula gave it 2026-09-28.", "Due date", 3, () => valIs("Due date", 3, "2026-09-27"), "Check V-0009's due date", STEP_NOTE), [
      { lead: "Read its **Class (R24)** and **First detected**", text: "Class 3 (30 days), first detected 2026-08-28." },
      { lead: "Count 30 days on, day by day", text: "August has 31 days: 3 days reach 31 August, and 27 more reach 27 September." },
      { lead: "Change **Due date** to **2026-09-27**", text: "The formula added one month where R24 adds 30 days. Next unlocks once the date is right." },
    ]),
    checkAnswers("Check the other three the same way: leave a date that agrees, correct one that does not. Check my answers then shows each answer and why, and the corrected formula fills every finding's due date. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-3": [
    {
      title: "Each finding's status",
      icon: "table",
      body: "This is the test itself. For every finding: fixed in time, fixed late, still open within its deadline, or open past it? The test date and how to compare are in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Compare the dates:",
      steps: [
        { lead: "Closed", text: "Due 2026-10-10, closed 2026-10-12: **closed late**." },
        { lead: "No closed date", text: "Due 2026-12-01, tested on 2026-11-19: **open**, its due date not passed." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("V-0001, worked", "V-0001 is the first finding. Only its dates are read.", "Status at the test date", 1, () => selIs("Status at the test date", 1, "Closed in SLA"), "Choose V-0001's status"), [
      { lead: "Read its **Closed** date", text: "2026-07-25. It has one, so the finding is closed, not open." },
      { lead: "Compare it with its **Due** date", text: "2026-09-24. 25 July is before it." },
      { lead: "Choose **Closed in SLA**", text: "Closed on or before the due date. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other 171, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-4": [
    {
      title: "Test each exception",
      icon: "table",
      body: "An **exception** lets a finding stay open past its deadline only while it is properly approved and controlled. An auditor tests each one against the register: an invalid exception leaves the finding overdue. R24's validity test and the test date are in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "The validity test",
      icon: "book",
      body: "The note gives R24's **three conditions**, and every one must hold.",
      tips: [
        { kind: "note", text: "Example: approved by the system owner and the CISO, with a compensating control, but expired last week: **invalid**." },
      ],
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    ...openScreen("policies", "Policies", "Policy Exceptions", "The exception register: each exception's approval, compensating control and expiry.", EXC_WINDOW),
    rowAnswer(firstItem("EX-001, worked", "EX-001 is the first exception. R24 sets three tests, and all three must hold.", "Valid at the test date (R24)", 1, () => selIs("Valid at the test date (R24)", 1, "Invalid"), "Decide EX-001", EXC_WINDOW), [
      { lead: "Read its **Approved by**", text: "System owner. R24 asks for the system owner and the CISO: the CISO is missing." },
      { lead: "Stop there", text: "One failed test is enough. Its control, Network isolation, and its expiry, 2026-12-17, would both have passed." },
      { lead: "Choose **Invalid**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(EXC_WINDOW, "EX-001"), [{ kind: "note", text: "On the other rows read all three: who approved, a compensating control recorded, and an expiry after the test date, 2026-11-19." }]),
    checkAnswers("Then the other eleven, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-5": [
    {
      title: "Was each fix verified?",
      icon: "table",
      body: "A finding marked closed is not trusted until the scanner confirms the fix. **Patch Timeline Check** shows the closed findings only, with the scanner's latest scan of each. BKB-POL-010 says when a fix counts as verified.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "BKB-POL-010", "The Vulnerability and Patch Management Policy", POL010_WINDOW),
    {
      title: "Section 6.1, step 4",
      icon: "book",
      body: "Step 4 of the triage procedure says what a verification needs: read it **to the end**. The bar at the top of the window jumps to Section 6.1.",
      getEl: () => $(POL010_WINDOW),
      onEnter: () => $(`${POL010_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("V-0001, worked", "V-0001 is the first closed finding. Section 6.1 step 4 asks two things of its last scan.", "Re-scan verified", 1, () => selIs("Re-scan verified", 1, "Verified by re-scan"), "Decide V-0001", POL010_WINDOW), [
      { lead: "Was the scan after the fix?", text: "**Closed** 2026-07-25, **Last scan** 2026-07-27: yes, two days after." },
      { lead: "Did it still find the vulnerability?", text: "**Found in last scan** says No." },
      { lead: "Choose **Verified by re-scan**", text: "Both hold. Next unlocks once it is chosen." },
    ], () => $(`${POL010_WINDOW} [data-sec="6.1"]`), [{ kind: "note", text: "A last scan dated before the closed date, or one that still finds it, verifies nothing." }]),
    checkAnswers("Then the other closed findings, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-6": [
    {
      title: "Compliance per class",
      icon: "table",
      body: "The result of the test is one figure per class, with its numerator and denominator, so management can see where the policy is kept and where it is not. Under each class, its findings are counted by what you found in steps 3 to 5.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(6, "BKB-POL-010", "The Vulnerability and Patch Management Policy", POL010_WINDOW),
    {
      title: "Section 10",
      icon: "book",
      body: "**Section 10**'s first paragraph says which findings count as within SLA, and how the figure is worked out. The bar at the top of the window jumps to Section 10.",
      getEl: () => $(POL010_WINDOW),
      onEnter: () => $(`${POL010_WINDOW} [data-sec="10"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "An example",
      icon: "info",
      body: "A class with 20 findings, 12 of them within SLA: **12 / 20 = 60.0 %**.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("Class 1, worked", "Class 1's findings are counted in groups, on the line under its row.", "Compliance (within SLA / all findings = %)", 1, () => valIs("Compliance (within SLA / all findings = %)", 1, "11 / 17 = 64.7 %"), "Type class 1's compliance", POL010_WINDOW), [
      { lead: "Read the line", text: "17 findings: 11 closed in SLA and verified, 1 closed late and verified, 5 open, past due, no valid exception." },
      { lead: "Keep the groups Section 10 calls within SLA", text: "Closed in SLA and verified: 11. Closed late is a breach, and so is open, past due with no valid exception." },
      { lead: "Type **11 / 17 = 64.7 %**", text: "11 ÷ 17 × 100, to one decimal. Next unlocks once it is typed." },
    ], () => $(`${POL010_WINDOW} [data-sec="10"]`), [{ kind: "note", text: "Section 10 also counts a finding that is open or reopened and not yet due, and one past due under a valid exception. Class 1 has neither; other classes do." }]),
    checkAnswers("Then the other three, the same way. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.1-7q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. The first line of a memo is what management acts on. Part 1: which recommendation leads the memo.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R25 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R25",
      icon: "book",
      body: "**R25** says what comes first and how the rest follow. Read it to the end.",
      getEl: () => rowIn(RULES_WINDOW, "R25") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R25")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
      pointAt: () => $('#act-7 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-7 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-7 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button (VUL-MEMO), below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-7 [data-guide="show-me-how"]'),
    },
  ],

  "T8.1-7": [
    {
      title: "The memo's recommendations",
      icon: "table",
      body: "Your answer is in. Management acts on a memo's recommendations in the order they are written, so the order is a judgment an auditor can question. VUL-MEMO's lines are written from your checked sheets; its three recommendations become actions in T12.1. Rule **R25** is in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(7, "Ref-Actions"),
    {
      title: "The deviation types",
      icon: "book",
      body: "**V1 to V4**: the vulnerability deviations, each with its action, and the classes V1 and V2 cover. Count each one's breaches from the memo's lines.",
      getEl: () => rowIn(PAGE_WINDOW("Ref-Actions"), "V1") ?? $(PAGE_WINDOW("Ref-Actions")),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-Actions"), "V1")?.scrollIntoView({ block: "center" }),
    },
    rowAnswer(firstItem("Recommendation 1, worked", "Recommendation 1 is the deviation type R25 puts first.", "What the memo says", 6, () => selIs("What the memo says", 6, "V1: Patch or isolate the asset; record an approved exception if not possible"), "Choose recommendation 1", PAGE_WINDOW("Ref-Actions")), [
      { lead: "Read what each type covers in Ref-Actions", text: "V1 is a vulnerability past SLA in classes 1–2. V2 is the same in classes 3–4." },
      { lead: "Apply R25's first test, in the note", text: "The type covering the highest classes leads, whatever its count. V2 has more breaches in the memo's lines above, but V1 covers classes 1–2." },
      { lead: "Choose the line that starts **V1: Patch or isolate the asset**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Actions"), "V1"), [{ kind: "note", text: "Recommendations 2 and 3 follow by number of breaches, most first: count each type in the memo's lines above." }]),
    checkAnswers("Then recommendations 2 and 3. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-8": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "A test is finished when its workpaper and memo are filed. **VUL-TEST** is the workpaper an assessor re-performs at checkpoint HC4; **VUL-MEMO**'s recommendations become actions in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: VUL-TEST ends .xlsx (a workbook), VUL-MEMO .docx (a memo)." } : c)),
  ],

  "T8.1-9": [
    {
      title: "The measure card",
      icon: "table",
      body: "A KPI reported every month needs a card that fixes how it is measured, so next month's figure means the same as this one's. A colleague filled **LI-KPI** from memory. **What it answers** says what each field is for: ISO/IEC 27001 clause 9.1 asks most of these of every measure.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openPage(9, "Ref-Measure card"),
    {
      title: "The fixed values",
      icon: "book",
      body: "This page holds the values the card must carry. Compare it with LI-KPI row by row.",
      tips: [
        { kind: "avoid", text: "skimming. Read the whole of each value: a row can look right and still say something else." },
      ],
      getEl: () => $(PAGE_WINDOW("Ref-Measure card")),
    },
    {
      title: "Frequency, worked",
      icon: "info",
      body: "Find **Frequency** on Ref-Measure card: its value is **Monthly**. The row says Monthly too. It agrees, so it stands.",
      getEl: () => rowIn('[data-guide="register"]', "Frequency") ?? $('[data-guide="register"]'),
      alsoShow: () => (innerWidth > 700 ? $(PAGE_WINDOW("Ref-Measure card")) : null),
      onEnter: () => rowIn(PAGE_WINDOW("Ref-Measure card"), "Frequency")?.scrollIntoView({ block: "center" }),
    },
    checkAnswers("Do the same on every row, and choose the page's value where a row differs. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.1-10": [
    {
      title: "A question",
      icon: "help",
      body: "A KPI needs one person **accountable** for judging it, or a missed target has no owner.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-10 [data-guide="decision"]'),
    },
    ...openPage(10, "Ref-Measure card"),
    {
      title: "The card's roles",
      icon: "book",
      body: "The page lists a role for each job on the card: **collecting**, **analysing** and **evaluating** are three separate rows.",
      getEl: () => $(PAGE_WINDOW("Ref-Measure card")),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-10 [data-guide="decision"]'),
      pointAt: () => $('#act-10 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-10 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-10 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "play",
      body: "Then click **Mark step complete**, in this row.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-10 [data-guide="show-me-how"]'),
    },
  ],

  "T8.1-11": [
    {
      title: "Against the target",
      icon: "table",
      body: "A measure is only useful once its result is judged against its **target**: that is what the evaluator acts on. Each class's result is the card's formula applied to VUL-TEST; the target and thresholds are in the note.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Target 90 % or more, red below 80 %, result 85.0 %: **below the target, but not red**.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("Class 1, worked", "Class 1 is the first row.", "Against the target", 1, () => selIs("Against the target", 1, "Below the red threshold"), "Choose class 1's standing", STEP_NOTE), [
      { lead: "Read its **Result**", text: "11 / 17 = 64.7 %." },
      { lead: "Read the card's line for classes 1–2, in the note", text: "Target 90 % or more, red below 80 %." },
      { lead: "Choose **Below the red threshold**", text: "64.7 is under 80, so it is red, not only below the target. Next unlocks once it is chosen." },
    ], undefined, [{ kind: "note", text: "Classes 3–4 have a target and no red threshold: read the note's last sentence before choosing theirs." }]),
    checkAnswers("Then the other three. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.1-12": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "A measure card is filed so next month's figure is taken the same way. **LI-KPI**'s result is an input to the management review in T12.1 (clause 9.3.2 c). This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
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
      body: "A control test is run from a **script** written before the evidence is opened, so it cannot be bent to pass. Sheet 1 is that script: what is tested, the six attributes A1 to A6, and when a record passes. You do not change it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A record whose MFA is No **fails A3**: A3 passes only when MFA is Yes. Each question here is a case like that.",
      getEl: () => rowIn('[data-guide="register"]', "A3") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: a review done five weeks after its quarter ended. Read the **What the script says** column and click the attribute that fails. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="late"]'),
      doIt: "Click the attribute a late review fails",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T8.2-2": [
    {
      title: "How many quarters to test",
      icon: "table",
      body: "An auditor tests a sample of a control's occurrences and shows the sample is big enough. A review run every quarter is tested **quarter by quarter**. Rule R15, in the note, takes the minimum from the control's frequency.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("testing", "Control Testing", "Restore Test Review", "It shows which of the task card's three controls you are assigned, what it holds and how it is concluded.", RESTORE_WINDOW),
    {
      title: "Your control",
      icon: "book",
      body: "Read **Variant**, and how its population is counted.",
      tips: [
        { kind: "avoid", text: "counting records. R15 needs how often the control runs, not how many records it left." },
      ],
      getEl: () => $(RESTORE_WINDOW),
    },
    ...openLib(2, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 5",
      icon: "book",
      body: "**Section 5**: the values LearnTech applies from each Group policy's criticality table. The bar at the top of the window jumps to Section 5.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="5"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The frequency, worked", "**Control frequency (LearnTech)** is the first line.", "Value", 1, () => selIs("Value", 1, "Quarterly"), "Choose the control's frequency", ADD36_WINDOW), [
      { lead: "Find **Privileged access review** in Section 5", text: "It is one of the BKB-POL-006 rows." },
      { lead: "Read the value LearnTech applies", text: "Quarterly: the review runs four times a year." },
      { lead: "Choose **Quarterly**", text: "Next unlocks once it is chosen." },
    ], () => rowWith(ADD36_WINDOW, "Privileged access review")),
    ...openPage(2, "Ref-Sampling"),
    {
      title: "The sampling table",
      icon: "table",
      body: "One row per frequency, then two for a population of records. A control run every week, for example, is the **Weekly** row: a minimum sample of 5.",
      getEl: () => $(PAGE_WINDOW("Ref-Sampling")),
    },
    checkAnswers("The minimum sample is yours: find the row of Ref-Sampling for the frequency you chose, and choose its Minimum sample. Check my answers then shows each line's answer and why, and the platform selects the quarters. Your lines lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.2-3": [
    {
      title: "Test each record",
      icon: "table",
      body: "This is the test itself: every record of the sampled quarters is checked against the script's six attributes. Sheet 2 lists the records of the two quarters the platform selected.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The script, beside the table",
      icon: "help",
      body: "Read A1 to A6 in order. Each shows the cells of the lit record it reads.",
      steps: [
        { lead: "Read each attribute against its cells", fork: [{ when: "It fails", then: "Mark it. Keep going: mark every attribute that fails." }, { when: "It passes", then: "Go on to the next." }] },
        { lead: "Record the result", text: "Any attribute marked: **Fail**. None: **Pass**.", mark: "stop" },
      ],
      getEl: () => $('[data-guide="checklist"]'),
    },
    {
      title: "Dates",
      icon: "book",
      body: "**A2** counts from the end of the record's quarter; the note gives the quarters. A Q3 record (April to June) reviewed on 2026-07-20 is 20 days after the quarter ended: it would fail A2.",
      getEl: () => $('[data-guide="checklist-row"] li[data-check="A2"]') ?? $('[data-guide="checklist"]'),
    },
    {
      title: "PR-011, worked",
      icon: "edit",
      body: "PR-011, the first record, is lit. Each check shows the cells it reads.",
      steps: [
        { lead: "A1 and A2", text: "It has a review date, 2026-04-04, and a decision, Keep. Q2 ended on 2026-03-31, so the review came 4 days after: within the 15 allowed." },
        { lead: "A3 to A6", text: "MFA is Yes. Session recording is On. The reviewer is the system owner, not the account's holder. The decision is Keep, so no revocation is due." },
        { lead: "Click **Record Pass**", text: "No check fails, so none is marked. Next unlocks once the result is in." },
      ],
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
      title: "Then the other 27",
      icon: "check",
      body: "The checklist moves on to the next record by itself, down to CT-EXTRA's two at the foot of the sheet.",
      tips: [
        { kind: "unsure", text: "To look at a record again, click its Result in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 28 are recorded, Check my answers shows each record's answer and why. Your rows lock then, so look them over first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "A message for this step is in your **Inbox** on the toolbar. It carries data the step uses and asks for no reply: open it and read it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.2-4": [
    {
      title: "Rate the deviations",
      icon: "table",
      body: "Every deviation is **rated**: the rating decides the test's conclusion and how fast the owner must act. Rule R26 rates it by what it affects and what went wrong.",
      tips: [
        { kind: "note", text: "When a test finds a deviation, you query the team that holds the record. The table's last column is their answer." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R26 is in the rule tables, tagged with this step.", RULES_WINDOW),
    ...openLib(4, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 8",
      icon: "book",
      body: "**Section 8**: LearnTech's assets by office and criticality. Example: a deviation on an account of a Mission Critical system is **High**, whatever went wrong. The bar at the top of the window jumps to Section 8.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("PR-022, worked", "PR-022 is the first deviation. R26's ratings are tried in order: High, then Medium, then Low.", "Rating (R26)", 1, () => selIs("Rating (R26)", 1, "Medium"), "Choose PR-022's rating", ADD36_WINDOW), [
      { lead: "Is it High?", text: "No. Section 8's row for Amsterdam shows 0 Mission Critical assets, and the IAM team's answer says the review is on file, so evidence exists." },
      { lead: "Is it Medium?", text: "Yes: \"done late or partly\". The review was done on 2026-04-29, past A2's limit." },
      { lead: "Choose **Medium**", text: "Next unlocks once it is chosen." },
    ], () => rowWith(ADD36_WINDOW, "Netherlands\t0\t21")),
    checkAnswers("Then PR-050, the same way: read the IAM team's answer before you choose. Check my answers then shows each answer and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.2-5": [
    {
      title: "Conclude the test",
      icon: "table",
      body: "A control test ends in one of **three conclusions**, and the control owner, the auditor and management act on it. Rule R19 decides it from the deviations: how many, and how they are rated.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("testing", "Control Testing", "Record Result", "Rule R19 is the first row. Read it to its last sentence: not every line of it applies to every kind of test.", RESULT_WINDOW),
    rowAnswer(firstItem("The first line, worked", "**Deviations in Sheet 3** is a count.", "Your answer", 1, () => valIs("Your answer", 1, "2"), "Type the count", STEP_NOTE), [
      { lead: "Read the note's list of Sheet 3's deviations", text: "PR-022 and PR-050: two records." },
      { lead: "Type **2**", text: "As a number. Next unlocks once it is typed." },
    ]),
    checkAnswers("Then the highest rating, from the same list, and the conclusion R19 gives a control test with that many deviations. Check my answers then shows each line's answer and why. Your lines lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.2-6": [
    {
      title: "The memo's finding",
      icon: "table",
      body: "Your answer is in. Part 2: a finding is written in five parts, so its reader sees what happened, against what, why, so what, and what to do. Most of CT-MEMO is written from your checked sheets. Two parts are yours:",
      steps: [
        { lead: "The Effect" },
        { lead: "The Recommendation", text: "It becomes an action in T12.1." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("testing", "Control Testing", "Raise Finding", "The five-part frame every finding is written in.", FINDING_WINDOW),
    {
      title: "The Effect",
      icon: "book",
      body: "An effect says what the evidence shows was **exposed**. Example: an approved change with no test record means nobody can show it was tested.",
      tips: [
        { kind: "avoid", text: "going further than the evidence. Do not say the change broke something unless a record shows it did." },
      ],
      getEl: () => $(FINDING_WINDOW),
    },
    rowAnswer(firstItem("The Effect, worked", "The Effect is taken from PR-022, the first deviation.", "What the memo says", 6, () => selIs("What the memo says", 6, "For longer than the script allows, nobody had confirmed that adm-petrov11 still needed its privileged access."), "Choose the effect", FINDING_WINDOW), [
      { lead: "Read PR-022's line under **Condition**", text: "A2 On time failed, review dated 2026-04-29, decision Keep." },
      { lead: "Rule out what that line cannot support", text: "It shows no misuse. The decision was Keep, so nothing should have been removed. One late review says nothing of the other quarters." },
      { lead: "Choose the line that starts **For longer than the script allows**", text: "A late review means the access went unconfirmed for that time. Next unlocks once it is chosen." },
    ]),
    ...openPage(6, "Ref-Actions"),
    {
      title: "The deviation types",
      icon: "book",
      body: "Each row is a type of deviation with its action. **U1 to U10** are user-access review exceptions, **V1 to V4** vulnerability ones.",
      tips: [
        { kind: "avoid", text: "stopping before the end. Read the last row too." },
      ],
      getEl: () => $(PAGE_WINDOW("Ref-Actions")),
    },
    firstItem("The recommendation yourself", "Rule R25, in the note, takes the Ref-Actions action for each deviation type your test found. Your test found one type, on PR-022. Its row in Ref-Actions gives the action: choose **CT: Correct the instance and add the missing step to the procedure**. Next unlocks once it is chosen.", "What the memo says", 7, () => selIs("What the memo says", 7, "CT: Correct the instance and add the missing step to the procedure"), "Choose the recommendation", PAGE_WINDOW("Ref-Actions")),
    checkAnswers("Check my answers then shows each answer and why, and the memo's other parts are written. Your rows lock then."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.2-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "A test is not done until its workpaper is filed. **CT-SCRIPT** is the workpaper an assessor re-performs at checkpoint HC4; **CT-MEMO**'s recommendation becomes an action in T12.1. This step checks both, names them and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores: CT-SCRIPT ends .xlsx (a workbook), CT-MEMO .docx (a memo)." } : c)),
  ],

  "T8.2-8": [
    {
      title: "The nonconformity report",
      icon: "table",
      body: "A deviation found in a control test becomes a **nonconformity**: ISO/IEC 27001 clause 10.2 says what the organisation must then do, and **LI-NCR** records each part. Its entries come in steps 9 to 11.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Clause 10.2 asks for documented information on the nature of the nonconformity: the **Nonconformity** and **Evidence** fields hold it. Each question here is a clause 10.2 requirement like that.",
      getEl: () => rowIn('[data-guide="register"]', "Evidence") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: clause 10.2 a), react to the nonconformity and correct it. Read the **What it holds** column and click the field that holds it. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="react"]'),
      doIt: "Click the field that corrects it",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T8.2-9": [
    {
      title: "Requirement and gap",
      icon: "table",
      body: "A nonconformity is written in three parts: the **requirement**, the **evidence**, and the **gap** between them, so the owner sees exactly what was required and what was found. The evidence is copied for you.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLib(9, "BKB-POL-006", "The Access Control policy", POL006_WINDOW),
    {
      title: "The requirements",
      icon: "book",
      body: "Choose the one the deviation's attribute is about:",
      steps: [
        { lead: "Section 3.1", text: "The policy statements." },
        { lead: "Section 4", text: "The frequencies for each criticality band." },
        { lead: "Section 6.2", text: "The review procedure." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to each." },
      ],
      getEl: () => $(POL006_WINDOW),
    },
    rowAnswer(firstItem("The requirement, worked", "The **Requirement** is the one PR-022's failed attribute is about.", "Entry", 2, () => selIs("Entry", 2, "BKB-POL-006 Section 4 (LOW): Privileged access review — Quarterly"), "Choose the requirement", POL006_WINDOW), [
      { lead: "Read the **Nonconformity** entry", text: "PR-022 failed A2, On time: the review came too long after its quarter." },
      { lead: "Find what sets how often the review is due", text: "Section 4's table, the row Privileged access review. LearnTech is LOW: Quarterly." },
      { lead: "Choose the **Section 4 (LOW)** line on the privileged access review", text: "The other lines are about MFA, the tool, recording, the reviewer and removal: none is about timing. Next unlocks once it is chosen." },
    ], () => rowWith(POL006_WINDOW, "Privileged access review")),
    {
      title: "An example of a gap",
      icon: "info",
      body: "A Q3 review (April to June) dated 2026-07-20 is **20 days** after the quarter ended.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    checkAnswers("Type the gap in days. Check my answers then shows each answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.2-10": [
    {
      title: "Grade it",
      icon: "table",
      body: "A nonconformity is graded **Major** or **Minor**: a Major one can stop a certification until it is fixed. The note gives your test's counts.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule L17 is in the rule tables, tagged with this step. It asks two questions.", RULES_WINDOW),
    {
      title: "An example",
      icon: "info",
      body: "A quarterly review that was **never done** in one of the quarters would be Major: the activity was not done in the period.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("The grade, worked", "This step has one row, so its answer is worked here in full. L17 asks two questions: either one makes it Major.", "Entry", 5, () => selIs("Entry", 5, "Minor"), "Choose the grade", RULES_WINDOW), [
      { lead: "Was the activity never done in the period?", text: "No. The Q2 review was done, on 2026-04-29: late, not missed." },
      { lead: "Did it fail in more than half of the sample?", text: "No. The note gives 2 deviations in 28 records." },
      { lead: "Choose **Minor**", text: "Neither holds. Next unlocks once it is chosen." },
    ], () => rowIn(RULES_WINDOW, "L17")),
    checkAnswers("Check my answers then shows the answer and why. Your row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T8.2-11": [
    {
      title: "The 5-Whys form",
      icon: "table",
      body: "Your answer is in. Part 2: the root cause is found by asking **why**, five times. The note gives rule L18 and the IAM team's answer on PR-022.",
      tips: [
        { kind: "avoid", text: "a guess or a person to blame. Each answer must be a fact from the evidence." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "For a change implemented without approval, Why 4 might be: the change tool has no approval gate. Each answer explains the one before it.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("Why 1, worked", "Each Why has its question in the row. Six facts are offered for the five.", "Answer (a fact from the evidence)", 1, () => ((oblCell("Answer (a fact from the evidence)", 1) as HTMLSelectElement | null)?.value ?? "").startsWith("PR-022"), "Choose Why 1's answer", STEP_NOTE), [
      { lead: "Read Why 1's question", text: "\"What exactly failed?\" It asks for the deviation itself: the record, the attribute and the date." },
      { lead: "Find the fact that states only that", text: "One starts \"PR-022\" and gives the review date, 2026-04-29, and A2. The others give a reason or a fix." },
      { lead: "Choose the line that starts **PR-022: the Q2 review**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then Why 2 to Why 5, the same way: read the question, then find the fact that answers it and no more. Check my answers then shows each answer and why, and the three action fields are written. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T8.2-12": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "A nonconformity is on record only once its report is filed. **LI-NCR**'s corrective action becomes an action in T12.1, and its re-test checks it worked. This step checks it, names it and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "8 to 11"),
  ],

  // T9.1 (desk-step-builder, 29 Oct 2026; REWORK 2 Nov): VEN-TIER, VEN-Q and VEN-CL in Vendors, then VEN-Q's cloud section (LI-13).
  // Steps 3 and 4 ask their question in the row, with no question guide: the situation and the options say everything. Their guides are for part 2.
  "T9.1-1": [
    {
      title: "Six facts to record",
      icon: "table",
      body: "A vendor is tiered from **facts**, not impressions: the business owner's intake form says what the vendor will receive and do, and the supplier policy says what each of rule R35's terms means. **VEN-TIER** records each fact; step 2 tiers the vendor from them.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Vendor Intake", "Lumen's intake form, completed by the business owner.", VEN_INTAKE_WINDOW),
    {
      title: "The intake form",
      icon: "book",
      body: "Each line is a fact about Lumen and its service.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table, and keep it open." },
      ],
      getEl: () => $(VEN_INTAKE_WINDOW),
    },
    ...openLib(1, "BKB-POL-013", "The supplier policy", POL013_WINDOW),
    {
      title: "Section 3.1",
      icon: "book",
      body: "**Section 3.1**'s table gives each of R35's terms its meaning, and the line of the intake form to read it from. Example: a payments provider whose Business criticality says Revenue is **revenue-critical**. The bar at the top of the window jumps to Section 3.1.",
      getEl: () => $(POL013_WINDOW),
      onEnter: () => $(`${POL013_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The data tier, worked", "**Highest data tier (BKB-STD-001)** is the first fact.", "Your answer", 1, () => selIs("Your answer", 1, "Tier 4 — Restricted"), "Choose the highest data tier", POL013_WINDOW), [
      { lead: "Read the intake form", text: "Data the vendor receives ends \"pseudonymous IDs of minors\". Volume: about 800 million events a month, a continuous feed." },
      { lead: "Read two rows of Section 3.1's table", text: "**Children's data at scale** is data about children as a continuous feed, and pseudonymised data counts. **Tier 4 data** lists children's data at scale." },
      { lead: "Choose **Tier 4 — Restricted**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(POL013_WINDOW, "Tier 4 data")),
    checkAnswers("Then the five Yes or No facts, the same way: each by its row of Section 3.1, and the form line that row names. Check my answers then shows each fact's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.1-2": [
    {
      title: "Tier the vendor",
      icon: "table",
      body: "The tier decides how deep the assessment goes: the questions sent, the contract clauses and how often the vendor is reassessed. Rule **R35** is in the note, with Lumen's facts as step 1 checked them. Two other vendors wait in the same queue.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "From Critical down",
      icon: "help",
      body: "Walk R35 from the top tier down:",
      steps: [
        { lead: "Read Critical's conditions first", fork: [{ when: "One holds", then: "Stop: that is the tier." }, { when: "None holds", then: "Go on to High, then Medium, then Low." }] },
        { lead: "Read each condition whole", text: "**OR** needs one of its parts. \"that is hard to replace\" must hold too." },
      ],
      tips: [
        { kind: "note", text: "Example: a payroll provider that holds only staff data, at volume, and is easy to replace stops at **High**." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("Lumen, worked", "Lumen is the first vendor. Its facts are in the note, as step 1 checked them.", "Tier (R35)", 1, () => selIs("Tier (R35)", 1, "Critical"), "Choose Lumen's tier", STEP_NOTE), [
      { lead: "Read R35's Critical line first", text: "Access to Tier 4 data or children's data at scale, OR a customer-facing service that is hard to replace." },
      { lead: "Hold Lumen's facts against it", text: "Its highest data tier is Tier 4, and children's data at scale is Yes. One part of the line is enough." },
      { lead: "Choose **Critical**", text: "R35 stops at the first match, so the lower tiers are not read. Next unlocks once it is chosen." },
    ]),
    ...openScreen("vendors", "Vendors", "Vendor Intake", "Quill's and MathMind's forms are below Lumen's.", VEN_INTAKE_WINDOW),
    {
      title: "The other two forms",
      icon: "book",
      body: "Scroll past Lumen's form. Read each vendor's lines the way you read Lumen's in step 1, then walk R35 for it.",
      getEl: () => $(VEN_INTAKE_WINDOW),
    },
    checkAnswers("Choose Quill's and MathMind's tiers. Check my answers then shows each answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step starts with a question, so the desk takes you back to the step list."),
  ],

  "T9.1-3": [
    {
      title: "What the tier sets",
      icon: "table",
      body: "Your answer is in, and VEN-Q is written. A tier is only useful for what it sets: BKB-POL-013 Section 3.1 says it sets the **questions** a vendor is sent and how often it is **reassessed**. The same rule gives each of your three vendors a different workload.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Send Questionnaire", "The question bank: each question shows the tier it is included from.", BANK_WINDOW),
    {
      title: "Counting the questions",
      icon: "info",
      body: "For a vendor of a given tier, count the rows rule **R27** includes. Example: a Medium vendor counts the Low **and** the Medium rows.",
      tips: [
        { kind: "note", text: "Keep the window open beside the table." },
      ],
      getEl: () => $(BANK_WINDOW),
    },
    rowAnswer(firstItem("Lumen's questions, worked", "The first row asks how many questions Lumen is sent.", "Your answer", 1, () => selIs("Your answer", 1, "17"), "Choose Lumen's count", BANK_WINDOW), [
      { lead: "Start from Lumen's tier", text: "Critical, from step 2. R27, in the note, includes every question marked for that tier or a lower one." },
      { lead: "Count the bank's rows by **Include from tier**", text: "Low 2, Medium 5, High 6, Critical 4." },
      { lead: "Choose **17**", text: "2 + 5 + 6 + 4: every row of the bank. Next unlocks once it is chosen." },
    ]),
    ...openScreen("vendors", "Vendors", "Reassessment Reminder", "One line per tier: how often a vendor of that tier is reassessed.", 'section[role="dialog"][aria-label^="Vendors › Reassessment Reminder"]'),
    checkAnswers("Now the other two counts and the three cycles. Check my answers then shows each answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked. The next step starts with a question, so the desk takes you back to the step list."),
  ],

  "T9.1-4": [
    {
      title: "Reading Lumen's draft",
      icon: "table",
      body: "Your answer is in. Part 2: a vendor sends its own paper, and you read it against the checklist before Legal negotiates. Lumen's tier takes every clause, so **In VEN-CL** is written for you, and the last row comes from your answer. Each line of Lumen's draft is in the table.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-POL-013", "The supplier policy", POL013_WINDOW),
    {
      title: "Section 6.3",
      icon: "book",
      body: "**Section 6.3** says what each clause must say, and what **Covered**, **Falls short** and **Missing** mean. The bar at the top of the window jumps to it.",
      tips: [
        { kind: "avoid", text: "passing a clause on its title. Read every part of the row: a clause can have the right title and still say less." },
      ],
      getEl: () => $(POL013_WINDOW),
      onEnter: () => $(`${POL013_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The first clause, worked", "**Security obligations and standards** is the first clause.", "Result", 1, () => selIs("Result", 1, "Covered"), "Choose for the first clause", POL013_WINDOW), [
      { lead: "Read its row in Section 6.3", text: "The draft must say: \"A named security standard or programme, kept for the whole contract\". Two parts." },
      { lead: "Read Lumen's line for it, in the table", text: "Clause 7 names ISO/IEC 27001, and keeps the programme \"throughout the term\". Both parts are there." },
      { lead: "Choose **Covered**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(POL013_WINDOW, "Security obligations"), [{ kind: "note", text: "A line that has the clause but says less than the row is Falls short. No line at all is Missing." }]),
    checkAnswers("Then the other seven, the same way. Check my answers then shows each clause's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.1-5": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "These are the records the next person relies on. **VEN-TIER** is the vendor register's entry, with each tier and what it sets. **VEN-Q** goes to Lumen, and **VEN-CL**, with the gaps in Lumen's draft, to Legal. This step checks all three, names the two workbooks and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 4").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then .xlsx. VEN-TIER is a platform form: it goes in with them, with no file name." } : c)),
  ],

  "T9.1-6": [
    {
      title: "Who secures what",
      icon: "table",
      body: "A cloud supplier's questions must go to the party that actually secures each part: under each service model the provider secures some layers and the customer the rest. Rule **L19**, in the note: the model first, then Ref-Cloud's split for it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Vendor Intake", "Lumen's intake form: its Delivery line says who runs what.", VEN_INTAKE_WINDOW),
    {
      title: "The Delivery line",
      icon: "book",
      body: "The **Delivery** line says what Lumen runs and what LearnTech sets up.",
      tips: [
        { kind: "note", text: "Keep the window open beside the table." },
      ],
      getEl: () => $(VEN_INTAKE_WINDOW),
    },
    ...openPage(6, "Ref-Cloud"),
    {
      title: "The three models",
      icon: "table",
      body: "One row per model: what the **provider** secures, and what the **customer** secures. Example: under IaaS the customer patches the operating system.",
      getEl: () => $(PAGE_WINDOW("Ref-Cloud")),
    },
    rowAnswer(firstItem("The model, worked", "**Service model (L19)** is the first row: every other row depends on it.", "Your answer", 1, () => selIs("Your answer", 1, "SaaS"), "Choose the service model", PAGE_WINDOW("Ref-Cloud")), [
      { lead: "Read the form's **Delivery** line", text: "Lumen runs the analytics application, its database and the servers under them. LearnTech only sets up dashboards, sign-in and what is shared." },
      { lead: "Find the row of Ref-Cloud that fits", text: "Only SaaS has the provider securing \"the application itself\". Under IaaS and PaaS the customer runs its own code." },
      { lead: "Choose **SaaS**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Cloud"), "SaaS")),
    checkAnswers("Then who secures each part: find the part in the SaaS row's Provider secures or Customer secures column. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.1-7": [
    {
      title: "Each question's control",
      icon: "table",
      body: "Each questionnaire question is tied to the control it gives evidence for, so its answer can be filed against that control. L19's five fixed questions are copied in from Ref-Cloud; you choose each one's control: **A.5.23** for the use of cloud services, or **A.5.21** for the ICT supply chain.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(7, "BKB-POL-021", "The Cloud Security Policy", POL021_WINDOW),
    {
      title: "Sections 3.1 and 9",
      icon: "book",
      body: "Read BKB-POL-021:",
      steps: [
        { lead: "Section 3.1", text: "What it requires of every cloud service." },
        { lead: "Section 9", text: "Maps the policy to its Annex A control." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to each." },
      ],
      getEl: () => $(POL021_WINDOW),
      onEnter: () => $(`${POL021_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("Question 1, worked", "Fixed question 1 is the first row.", "Control it gives evidence for", 1, () => selIs("Control it gives evidence for", 1, "A.5.23 Information security for use of cloud services"), "Choose question 1's control", POL021_WINDOW), [
      { lead: "Read the question", text: "In which countries our data is stored and processed, and whether we can choose the region." },
      { lead: "Look for that subject in Section 3.1", text: "\"Data residency requirements ... are enforced by region selection and policy\": the policy requires it of a cloud service." },
      { lead: "Choose the control that starts **A.5.23**", text: "Information security for use of cloud services: Section 9 maps this policy to it. Next unlocks once it is chosen." },
    ], () => $(`${POL021_WINDOW} [data-sec="3.1"]`), [{ kind: "note", text: "A question whose subject Section 3.1 does not cover is about what stands behind the service: A.5.21." }]),
    checkAnswers("Then the other four, the same way. Check my answers then shows each question's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.1-8": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "The cloud section goes out with the questionnaire. **VEN-Q** now carries **LI-CLD**: the service model, who secures what, and the five fixed questions with their controls. This step checks the section, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
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
      body: "A vendor's **SOC 2 report** is its main proof of security, but only for a reader who knows what each part says. SOC-REV's checklist gives the team's nine checks, **S1 to S9**. Here you find which check reads which line of Lumen's report; step 2 then makes the checks.",
      getEl: () => $('[data-guide="study"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "SOC Report Review", "Lumen's SOC 2 report summary.", SOC_WINDOW),
    {
      title: "The report",
      icon: "book",
      body: "Each line is one part of the report: the auditor, its type and period, the opinion, what it covers, and what it asks of LearnTech.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the checklist, and keep it open." },
      ],
      getEl: () => $(SOC_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "The **Opinion** line is read by **S4**, Qualified opinion: S4 is the check whose words are about the auditor's opinion. Each question here names another line.",
      getEl: () => rowIn('[data-guide="register"]', "S4") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: the **Subservice** line. Read the **Fails when** column and click the code of the check that reads it. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="sub"]'),
      doIt: "Click the check that reads the Subservice line",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong click turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T9.2-2": [
    {
      title: "Nine checks",
      icon: "table",
      body: "The review worksheet records each check's result, so the decision can be traced to the report. **SOC-REV** takes **Pass** or **Fail** for each check S1 to S9, read from Lumen's report on your review date.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "SOC Report Review", "Lumen's SOC 2 report summary, with your review date under it.", SOC_WINDOW),
    {
      title: "The review date",
      icon: "book",
      body: "The line under the report gives your **review date**: check S3 counts the months to it.",
      tips: [
        { kind: "note", text: "Keep the window open beside the table." },
      ],
      getEl: () => $(SOC_WINDOW),
    },
    ...openLib(2, "BKB-POL-013", "The supplier policy", POL013_WINDOW),
    {
      title: "Section 7.1",
      icon: "book",
      body: "**Section 7.1**'s table says how each check is read and which line of the report it reads. The bar at the top of the window jumps to Section 7.1.",
      tips: [
        { kind: "note", text: "Example: an Exceptions line listing a CC6 exception with the response \"process being improved\" fails **S6**: the response does not show it fixed." },
      ],
      getEl: () => $(POL013_WINDOW),
      onEnter: () => $(`${POL013_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("S1, worked", "S1 is the first check. Each check names what makes it **fail**.", "Result", 1, () => selIs("Result", 1, "Pass"), "Choose S1's result", POL013_WINDOW), [
      { lead: "Read S1's row in Section 7.1", text: "It fails when the report is Type I: design only, with no testing of how the controls operated. It reads the report's Type line." },
      { lead: "Read the report's **Type** line", text: "Type II: the auditor tested the controls over a period." },
      { lead: "Choose **Pass**", text: "What makes S1 fail is not there. Next unlocks once it is chosen." },
    ], () => rowIn(POL013_WINDOW, "S1")),
    checkAnswers("Then S2 to S9, the same way, each by its row of Section 7.1. S7 and S9 also read Lumen's intake form (Vendors › Vendor Intake). Check my answers then shows each check's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.2-3": [
    {
      title: "Controls LearnTech runs",
      icon: "table",
      body: "A **CUEC** is a control the vendor's report counts on its customer to run. Nobody runs one that has no owner, and then the report's assurance has a hole in it. Each row is a CUEC from Lumen's report; you give it its internal owner.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Flag Risk", "The conditions for failed checks, and the owners of CUECs.", FLAG_WINDOW),
    {
      title: "The CUEC owners",
      icon: "table",
      body: "The rows that start **CUEC owner** name the internal owner of each kind of CUEC. Example: a CUEC that asks for user access reviews goes to the system owner.",
      getEl: () => $(FLAG_WINDOW),
    },
    rowAnswer(firstItem("The first CUEC, worked", "The first row is the report's standard CUEC.", "Internal owner", 1, () => selIs("Internal owner", 1, "IAM team"), "Choose the CUEC's owner", FLAG_WINDOW), [
      { lead: "Read what it asks of LearnTech", text: "\"User entities manage their own user provisioning\": LearnTech creates and removes its own users." },
      { lead: "Find that kind among Flag Risk's CUEC owner rows", text: "**CUEC owner: User provisioning** names the IAM team." },
      { lead: "Choose **IAM team**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(FLAG_WINDOW, "CUEC owner: User provisioning")),
    checkAnswers("Then the second CUEC the same way. Check my answers then shows each answer and why. Your rows lock then."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.2-4": [
    {
      title: "The onboarding decision",
      icon: "table",
      body: "The analyst recommends and the approver decides: BKB-POL-013 Section 6.1 names the approver for each tier. **SOC-DEC** gives them the decision with its grounds. Rule **R28**, in the note, turns the failed checks into the decision.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "R28 in order",
      icon: "help",
      body: "Each row is a check step 2 found failing.",
      steps: [
        { lead: "Say what it does under R28", text: "Rejects the vendor on its own, or needs a condition." },
        { lead: "Then the decision", text: "The last row." },
      ],
      tips: [
        { kind: "note", text: "Example: a failed S3 needs a condition, a bridge letter, from Vendors › Flag Risk." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("S2, worked", "S2 is the first check that failed.", "Under R28", 2, () => selIs("Under R28", 2, "Needs a condition"), "Choose S2's effect", STEP_NOTE), [
      { lead: "Read R28's grounds to reject, in the note", text: "Two only: S9, and S4 where the qualified opinion covers CC6 or CC7 with no remediation tested by the auditor." },
      { lead: "Ask whether S2 is either", text: "No. S2 is a Type II period shorter than 6 months." },
      { lead: "Choose **Needs a condition**", text: "R28: any other failed check takes one condition. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other failed checks and the decision. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T9.2-5": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Vendors often send more once they hear a decision, and the file has to show what each item did. **SOC-EXTRA** holds what Lumen sent.",
      steps: [
        { lead: "Say what each item does" },
        { lead: "Hand in SOC-REV and SOC-DEC", text: "SOC-REV is the review worksheet; SOC-DEC goes to the approver. Its conditions and CUEC owners become actions in T12.1." },
      ],
      tips: [
        { kind: "note", text: "**Systems › LedgerSim** also opens here: the Compliance Manager's check of the finance system where a supplier decision is enforced. Submit does not wait for it, but its findings join SOC-DEC's **Vendor set-up check** row only if you finish it before you submit." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("vendors", "Vendors", "Flag Risk", "The document each failed check needs.", FLAG_WINDOW),
    ...openLib(5, "BKB-POL-013", "The supplier policy", POL013_WINDOW),
    {
      title: "What a late document can do",
      icon: "book",
      body: "The paragraph under Section 7.1's table says what can **clear** a failed check. Example: a vendor that failed S1 and now sends a Type II report has sent the document Flag Risk names, so it clears S1. The bar at the top of the window jumps to Section 7.1.",
      getEl: () => $(POL013_WINDOW),
      onEnter: () => $(`${POL013_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("X1, worked", "X1 is the first item Lumen sent. Its row names the check it is for: S5.", "What it does", 1, () => selIs("What it does", 1, "Clears the check"), "Choose what X1 does", FLAG_WINDOW), [
      { lead: "Read what arrived", text: "The hosting provider's own SOC 2 Type II report, with its bridge letter to 30 November 2026." },
      { lead: "Read Flag Risk's row for S5", text: "\"Send the hosting provider's own SOC 2 report\": X1 is that document." },
      { lead: "Choose **Clears the check**", text: "Section 7.1: a late document clears a check when it is the one Flag Risk names. Next unlocks once it is chosen." },
    ], () => rowIn(FLAG_WINDOW, "S5"), [{ kind: "note", text: "A vendor's own statement or plan is not a document Flag Risk names: read who wrote each of the others." }]),
    checkAnswers("Then X2 to X4 and the decision, which rule R28 in the note settles. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "A message for this step is in your **Inbox** on the toolbar. It carries data the step uses and asks for no reply: open it and read it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked and both files are submitted. The file boxes appear under your checked answers, each with the four parts of the file's name: .xlsx for SOC-REV, .docx for SOC-DEC. Any empty cell is marked amber, and the line above each sheet counts them."),
  ],

  // T10.1 (desk-step-builder, 30 Oct 2026): the corporate LMS's RoPA entry and data-flow map in Regulatory Watch › RoPA &
  // Data Flows. Step 1 is D1 alone, answered in its row (no part 2); its guide opens BKB-POL-017 Section 3.2, which the
  // question is worked out from. Steps 2–5 are checked per row; 6 hands in.
  "T10.1-1": [
    {
      title: "A question first",
      icon: "help",
      body: "A RoPA entry starts with the organisation's **role**: a controller and a processor keep different records and answer for different duties. This step is the question alone.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    ...openLib(1, "BKB-POL-017", "The Data Protection and Privacy Policy", POL017_WINDOW),
    {
      title: "Section 3.2",
      icon: "book",
      body: "**Section 3.2**'s table says what each role means. Example: two companies that together decide why and how they use a shared customer list are **joint controllers**. The bar at the top of the window jumps to Section 3.2.",
      tips: [
        { kind: "note", text: "Drag the window aside to see the question." },
      ],
      getEl: () => $(POL017_WINDOW),
      onEnter: () => $(`${POL017_WINDOW} [data-sec="3.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Match the situation to a role's meaning, choose that option, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-1 [data-guide="decision"]'),
      onEnter: () => { $(`${POL017_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-1 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-1 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-1 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options. **ROPA** records your role.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-1 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the feedback read, click **Mark step complete**.",
      getEl: () => $('#act-1 [data-guide="step-complete"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Click **▶ Show me how** to run this guide again.",
      getEl: () => $('#act-1 [data-guide="show-me-how"]'),
    },
  ],

  "T10.1-2": [
    {
      title: "The client's stated basis",
      icon: "table",
      body: "A processor's analyst records the **lawful basis** each client states for each purpose (GDPR Art.6), so the DPO can handle a data-subject request and spot an instruction with no basis. GDPR Art.30(2) does not require it; the note says why the Group records it. Each row of ROPA is one purpose; you work out its basis.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(2, "BKB-POL-017", "The Data Protection and Privacy Policy", POL017_WINDOW),
    {
      title: "Section 3.1",
      icon: "book",
      body: "**Section 3.1**'s lawful-basis table asks four questions **in order**; the first Yes gives the basis. Example: payroll tax records an employer must keep by law: question 1, **Legal obligation**. The bar at the top of the window jumps to Section 3.1.",
      getEl: () => $(POL017_WINDOW),
      onEnter: () => $(`${POL017_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The first purpose, worked", "The first purpose: the training each client requires its employees to complete as part of their job.", "Client's stated lawful basis", 1, () => selIs("Client's stated lawful basis", 1, "Contract"), "Choose the first purpose's basis", POL017_WINDOW), [
      { lead: "Ask question 1 of Section 3.1's table", text: "Does a law require it? No: the purpose says the client requires it." },
      { lead: "Ask question 2", text: "Is it necessary to perform a contract the person is party to? Yes: for staff that is their employment contract, \"what their job requires them to do\"." },
      { lead: "Choose **Contract**", text: "The first yes gives the basis, so questions 3 and 4 are not asked. Next unlocks once it is chosen." },
    ], () => rowWith(POL017_WINDOW, "Is it necessary to perform a contract")),
    checkAnswers("Then the other four, the same way: the questions in order, on each purpose's own words. Check my answers then shows each purpose's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.1-3": [
    {
      title: "Map the data",
      icon: "table",
      body: "A data-flow map shows where personal data comes in, which systems hold it, where it crosses a border and where it is erased, named as the asset register names the systems. A breach assessment (T10.2) starts from it. Each row of **DFM** is one flow: give it its **shape** and its **system**.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Asset Register", "LearnTech's Amsterdam and Mumbai assets.", ASSET_WINDOW),
    {
      title: "The asset register",
      icon: "book",
      body: "Each asset has its office and a description of what it holds. A flow happens in the asset whose **description** fits it.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table, and keep it open." },
      ],
      getEl: () => $(ASSET_WINDOW),
    },
    {
      title: "The four shapes",
      icon: "info",
      body: "The note above the table says what each shape means. Example: a paper form a visitor fills in at reception, which staff type into a system, is **Collect**.",
      tips: [
        { kind: "note", text: "Whether a flow crosses a border is read with BKB-POL-017 Section 3.1." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("F1's shape, worked", "F1 is worked here, both cells. First its **Shape**.", "Shape", 1, () => selIs("Shape", 1, "Collect"), "Choose F1's shape", STEP_NOTE), [
      { lead: "Read **What happens** in F1", text: "A client's training administrator uploads the list of employees into the corporate LMS." },
      { lead: "Ask what happens to the data", text: "It comes into LearnTech from outside, from a client. The note calls that Collect." },
      { lead: "Choose **Collect**", text: "Next unlocks once it is chosen." },
    ]),
    rowAnswer(firstItem("F1's system, worked", "The same row's second cell: **System (asset register)**.", "System (asset register)", 1, () => selIs("System (asset register)", 1, "Learning platform & content"), "Choose F1's system", ASSET_WINDOW), [
      { lead: "Read which system F1 names", text: "The corporate LMS, the learning management system the Amsterdam office runs." },
      { lead: "Find the asset whose description fits", text: "**Learning platform & content**, Amsterdam: \"EdTech platform, courseware and delivery\"." },
      { lead: "Choose **Learning platform & content**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(ASSET_WINDOW, "Learning platform")),
    checkAnswers("Then F2 to F8, the same way: shape, then system. Check my answers then shows each flow's shape and system, and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.1-4": [
    {
      title: "Each transfer's safeguard",
      icon: "table",
      body: "A data-flow map names the **safeguard** each cross-border transfer rests on, and the DPO approves it. The rows are the flows step 3 found to be transfers.",
      tips: [
        { kind: "avoid", text: "naming a chapter of a law. It is not a safeguard: an auditor asks to see the decision or the signed clauses." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 2",
      icon: "book",
      body: "**Section 2**: one row per office; the last column is its **Cross-border transfer** rule. Read the row of the office the data **leaves**. Example: data leaving Istanbul is read in the Istanbul row. The bar at the top of the window jumps to Section 2.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Section 6.1",
      icon: "book",
      body: "Where a Section 2 cell names only a chapter of a law, **Section 6.1** finds the safeguard:",
      steps: [
        { lead: "Ask its questions in order" },
        { lead: "Read the second table", text: "What holds for each destination." },
      ],
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("F4, worked", "F4 is the first transfer. The Amsterdam office holds the records, and engineers in Mumbai open them: the data leaves Amsterdam for India.", "Transfer safeguard", 4, () => selIs("Transfer safeguard", 4, "SCCs (GDPR Ch.V, Art.46)"), "Choose F4's safeguard", ADD36_WINDOW), [
      { lead: "Read Amsterdam's row in Section 2", text: "Its Cross-border transfer cell names only a chapter of the GDPR, so Section 6.1 finds the safeguard." },
      { lead: "Ask Section 6.1's questions for India", text: "1, an adequacy decision: the second table says None for India. 2, signed standard contractual clauses: Signed, Amsterdam to Mumbai." },
      { lead: "Choose **SCCs (GDPR Ch.V, Art.46)**", text: "Next unlocks once it is chosen." },
    ], () => rowWith(ADD36_WINDOW, "Amsterdam to Mumbai")),
    checkAnswers("Then the other transfers, the same way: the office the data leaves first. The evidence ref is written for you. Check my answers then shows each transfer's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.1-5": [
    {
      title: "Screen for a DPIA",
      icon: "table",
      body: "Every processing activity is **screened for a DPIA** before it starts, and the result is recorded even when it is No: the DPO and a supervisory authority ask for the screening, not only for DPIAs. The note says what to read.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "RoPA & Data Flows", "The processing description, from the business owner.", ROPA_WINDOW),
    {
      title: "The description",
      icon: "book",
      body: "The description says whose data is processed, what data, how people sign in, and how the courses, quizzes and exams work.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table, and keep it open." },
      ],
      getEl: () => $(ROPA_WINDOW),
    },
    ...openLib(5, "BKB-POL-017", "The Data Protection and Privacy Policy", POL017_WINDOW),
    {
      title: "Section 6.2",
      icon: "book",
      body: "**Section 6.2**'s second table defines each of R29's triggers. Example: CCTV in a shop is monitoring or recording; a paper register of who came to work is not. The bar at the top of the window jumps to Section 6.2.",
      getEl: () => $(POL017_WINDOW),
      onEnter: () => $(`${POL017_WINDOW} [data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The first trigger, worked", "**Children or students** is the first trigger.", "Your answer", 1, () => selIs("Your answer", 1, "No"), "Choose for the first trigger", POL017_WINDOW), [
      { lead: "Read its row in Section 6.2's second table", text: "Children are anyone under 18. Students are enrolled at a school, college or university." },
      { lead: "Read the description's **Data subjects** line", text: "The clients' employees, \"adults, 18 or over\", and the clients' administrators and HR managers." },
      { lead: "Choose **No**", text: "Adults on their employer's training are neither. Next unlocks once it is chosen." },
    ], () => rowIn(POL017_WINDOW, "Children or students")),
    checkAnswers("Then the other triggers, the same way, and last whether a DPIA is required: rule R29 in Learn › Rule tables says how that follows. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.1-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "The RoPA entry and data-flow map go to the DPO for approval, and a breach assessment (T10.2) starts from both. **ROPA** is the record, each purpose's lawful basis and the DPIA screening; **DFM** is the map. This step checks them, names the two files and submits them.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
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
      body: "A breach assessment starts from the incident's facts, and every statutory clock counts from one moment: when the breach was **discovered**, in **UTC**. An incident record holds several times, in local time. You find the right one and convert it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    {
      title: "The incident record",
      icon: "book",
      body: "Each line is one fact. Four of them are times, in Amsterdam time.",
      tips: [
        { kind: "avoid", text: "guessing which time starts the clock. Section 6.3 says which." },
        { kind: "note", text: "Drag the window aside if it covers the table, and keep it open." },
      ],
      getEl: () => $(BRC_WINDOW),
    },
    ...openLib(1, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.3, step 6",
      icon: "book",
      body: "**Section 6.3, step 6**: its first sentence says what the discovery time is. The bar at the top of the window jumps to Section 6.3.",
      tips: [
        { kind: "note", text: "Converting: 09:15 Amsterdam time in winter, one hour ahead of UTC, is 08:15 UTC, written **2026-03-02 08:15 UTC**." },
      ],
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The discovery time, worked", "This step has one row, so its answer is worked here in full.", "Value (incident record)", 1, () => valIs("Value (incident record)", 1, "2026-12-08T13:20"), "Pick the discovery time in UTC", BRC_WINDOW), [
      { lead: "Take what Section 6.3, step 6 says", text: "Discovery is the moment the incident is logged in the incident tool. An alert not yet logged does not start the clock." },
      { lead: "Find that line in the incident record", text: "**Incident logged in the incident tool**: 2026-12-08 14:20, Amsterdam time (UTC+1)." },
      { lead: "Convert it, and pick **2026-12-08 13:20**", text: "UTC+1 is one hour ahead of UTC, so take one hour off. Next unlocks once the date and time are right." },
    ], () => rowIn(BRC_WINDOW, "Incident logged")),
    checkAnswers("Check my answers shows whether it is right, and why. Your row locks then, so check it first."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  "T10.2-2": [
    {
      title: "Offices and countries",
      icon: "table",
      body: "First-hour facts are written down on a call, then checked against the record before anyone relies on them. Rule **R30** finds the regimes from two lines: the **offices** whose systems are affected, and the **countries** where the affected people live. The Incident Response & Crisis Manager's draft of both is in the table.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    rowAnswer(firstItem("The office, worked", "**Offices whose systems are affected** is the first line of the draft.", "Value (incident record)", 2, () => (oblCell("Value (incident record)", 2) as HTMLInputElement | null)?.value.trim().toLowerCase() === "amsterdam, netherlands", "Check the office", BRC_WINDOW), [
      { lead: "Read the record's **System affected** line", text: "Learning platform & content (Amsterdam)." },
      { lead: "Compare it with the draft", text: "The draft names Istanbul, the head office. No system of Istanbul's was hit." },
      { lead: "Type **Amsterdam, Netherlands** over it", text: "City, country, as the draft writes an office. Next unlocks once it is typed." },
    ], () => rowIn(BRC_WINDOW, "System affected")),
    checkAnswers("Then the countries, the same way: read the line that breaks the records down by country, and separate items with \";\". Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.2-3": [
    {
      title: "Which regimes apply",
      icon: "table",
      body: "The DPO must know every regime a breach engages, the ones that apply only if a condition is met, and why the others do not. Each row is a regime of **BKB-ADD-36 Section 2**, with its office and the words of its cell.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(3, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.3",
      icon: "book",
      body: "**Section 6.3**'s steps say which offices an incident engages and which of their regimes apply. Example: had only Istanbul's systems been hit, with every affected person in Turkey, only the Istanbul row would be read. The bar at the top of the window jumps to Section 6.3.",
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "The incident's lists",
      icon: "info",
      body: "The offices and countries you checked in step 2 are at the end of the note above the table.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Regulation Tracker", "Each law's status, as the Group GRC Office last checked it.", REGTRACK_WINDOW),
    {
      title: "Each law's status",
      icon: "book",
      body: "A regime is only as good as the law behind it. Read the **Status** column with Section 6.3's steps: steps 3 and 8 turn on it.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table." },
      ],
      getEl: () => $(REGTRACK_WINDOW),
    },
    rowAnswer(firstItem("KVKK, worked", "KVKK is the first regime. Its row says it is the Istanbul office's.", "Applies?", 1, () => selIs("Applies?", 1, "Applies"), "Choose for KVKK", POL014_WINDOW), [
      { lead: "Read Section 6.3, step 1", text: "An office is engaged when its systems are affected, or when affected data subjects live in its country." },
      { lead: "Read the incident's lists, at the end of the note", text: "The data-subject countries include Turkey, so the Istanbul office is engaged." },
      { lead: "Choose **Applies**", text: "Step 2: a breach-notification regime in an engaged office's row applies. KVKK's cell sets no condition, and its duty is in force. Next unlocks once it is chosen." },
    ], () => rowWith(POL014_WINDOW, "List the engaged offices"), [{ kind: "note", text: "Steps 2a to 8 take regimes out or mark them: read each of them against the other six rows." }]),
    checkAnswers("Then the other six. Check my answers then shows each regime's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.2-4": [
    {
      title: "Each deadline",
      icon: "table",
      body: "Each regime's clock becomes a date and time in **UTC**, so offices in four time zones work to the same moment, and the plan works to the **earliest firm** one. The rows are the regimes step 3 found to apply.",
      tips: [
        { kind: "note", text: "A regime that applies only if a condition is met has no date yet: its clock starts when the condition is met." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(4, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.3, step 6",
      icon: "book",
      body: "**Section 6.3, step 6** says how to count; **step 7** says which deadline governs. The bar at the top of the window jumps to Section 6.3.",
      tips: [
        { kind: "avoid", text: "skipping weekends. 72 hours from Friday 2026-03-06 18:00 UTC ends on Monday 2026-03-09 18:00 UTC." },
      ],
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("KVKK, worked", "KVKK is the first regime. Deadline = discovery time + the regime's clock.", "Deadline (UTC)", 1, () => valIs("Deadline (UTC)", 1, "2026-12-11T13:20"), "Pick KVKK's deadline", STEP_NOTE), [
      { lead: "Read the discovery time in the note", text: "2026-12-08 13:20 UTC." },
      { lead: "Read KVKK's clock in its row", text: "72h to the Board. Step 6 counts hours in calendar time, weekends included." },
      { lead: "Pick **2026-12-11 13:20**", text: "72 hours is three days exactly: the same time, three days on. Next unlocks once the date and time are right." },
    ]),
    checkAnswers("Then the other regimes, the same way, and last the earliest firm deadline. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.2-5": [
    {
      title: "Tell the people?",
      icon: "table",
      body: "Telling the people whose data was taken is a decision of its own, and the record shows why it was made. Rule **R30**, in the note, makes it from the data: each of its conditions, then the result.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    {
      title: "What the record says",
      icon: "book",
      body: "Read the record's lines for R30:",
      steps: [
        { lead: "Its conditions", text: "**Data categories**, **Approx. records** and **Children's data**." },
        { lead: "Its exception", text: "**What happened** and **Encrypted at rest**." },
      ],
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table, and keep it open." },
      ],
      getEl: () => $(BRC_WINDOW),
    },
    rowAnswer(firstItem("The first condition, worked", "**Children's data** is R30's first condition.", "Your answer", 1, () => selIs("Your answer", 1, "Yes"), "Choose for children's data", BRC_WINDOW), [
      { lead: "Read the record's **Children's data** line", text: "It says Yes." },
      { lead: "Check it against **Data categories**", text: "Student names, ages and schools: the records are of school students." },
      { lead: "Choose **Yes**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(BRC_WINDOW, "Children's data"), [{ kind: "note", text: "The other conditions have no line of their own: read them off **Data categories** and **Approx. records**." }]),
    checkAnswers("Then the other conditions, R30's exception, and last whether the data subjects must be told. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.2-6": [
    {
      title: "A question first",
      icon: "help",
      body: "A notice about a breach is a statement the organisation is held to, by the people affected and by the authorities. This step is the question alone.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-6 [data-guide="decision"]'),
    },
    ...openLib(6, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.1",
      icon: "book",
      body: "**Section 6.1**'s table gives each step of the response: what is done, who does it and what comes out. Example: step 2, Triage, is the Incident Response & Crisis Manager's, within an hour. The bar at the top of the window jumps to Section 6.1.",
      tips: [
        { kind: "note", text: "Drag the window aside to see the question." },
      ],
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option Section 6.1 supports, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-6 [data-guide="decision"]'),
      onEnter: () => { $(`${POL014_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-6 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-6 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-6 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options. **BRC-PLAN** records your answer with the rest of the plan.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-6 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the feedback read, click **Mark step complete**.",
      getEl: () => $('#act-6 [data-guide="step-complete"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Click **▶ Show me how** to run this guide again.",
      getEl: () => $('#act-6 [data-guide="show-me-how"]'),
    },
  ],

  "T10.2-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "The assessment and the plan go to the DPO together, with the breach-register entry.",
      steps: [
        { lead: "BRC-ASSESS", text: "The notification assessment: the facts, each regime with its deadline, and the data-subject test." },
        { lead: "BRC-PLAN", text: "The notification plan and breach-register entry, written by the platform from your steps 2 to 6. T11.1 and T12.1 build on it." },
      ],
      tips: [
        { kind: "note", text: "**Systems › LogLens** also opens here: the DPO's check of the logs behind the plan. Submit does not wait for it, but its findings join BRC-PLAN's **Log evidence check** row only if you finish it before you submit." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names: .xlsx for BRC-ASSESS, .docx for BRC-PLAN." } : c)),
  ],

  "T10.2-8": [
    {
      title: "Five phases",
      icon: "table",
      body: "An auditor asks how ISO/IEC 27001's incident controls, **A.5.24 to A.5.28**, worked in a real incident. **LI-IRBC** answers it: its Phases sheet gives rule L20's five phases, the control of each and the part of BKB-POL-014 it covers. Here you find three things in it.",
      getEl: () => $('[data-guide="study"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Logging an event in the incident tool and giving it a severity is Section 6.1 step 1: the **Detect and report** phase, control **A.6.8**.",
      getEl: () => rowIn('[data-guide="register"]', "Detect") ?? $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: the notification assessment. Each question is read in one column and answered in another.",
      steps: [
        { lead: "Read down **What it covers**", text: "Find the row that names the notification assessment." },
        { lead: "Stay on that row", text: "The question asks for its control, so the answer is its cell in the **Annex A control** column, not its **Phase** cell." },
        { lead: "Click that cell", text: "Next unlocks once it is right." },
      ],
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="assess"]'),
      doIt: "Click the control of the notification assessment's phase",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong click turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T10.2-9": [
    {
      title: "The incident, phase by phase",
      icon: "table",
      body: "The incident's timeline is read against the process, to show each phase happened and to see what was missed. Each row of LI-IRBC's **Timeline** is one event of INC-2610-3001, in UTC; you give it its phase.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "The phases",
      icon: "info",
      body: "The note gives each phase and the part of BKB-POL-014 it covers. Example: a member of staff forwarding a phishing e-mail to the service desk, which logs it, is **Detect and report**.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(9, "BKB-POL-014", "The incident policy", POL014_WINDOW),
    {
      title: "Section 6.1",
      icon: "book",
      body: "Match each event to a step's action:",
      steps: [
        { lead: "Section 6.1", text: "What each response step does. An event that matches a step's action belongs to that step's phase." },
        { lead: "Section 4", text: "The exercises that prepare for an incident." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to each section." },
      ],
      getEl: () => $(POL014_WINDOW),
      onEnter: () => $(`${POL014_WINDOW} [data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("E1, worked", "E1 is the first event of the timeline.", "Phase (L20)", 1, () => selIs("Phase (L20)", 1, "Plan"), "Choose E1's phase", POL014_WINDOW), [
      { lead: "Read E1 and its date", text: "2026-10-14: the office holds its annual tabletop exercise. The incident is in December, so this is before it." },
      { lead: "Find that in the note's phases", text: "**Plan** covers what is done before any incident, with the tabletop exercises of Section 4." },
      { lead: "Choose **Plan**", text: "Next unlocks once it is chosen." },
    ], () => $(`${POL014_WINDOW} [data-sec="4"]`)),
    checkAnswers("Then E2 to E9: match what each event does to a step of Section 6.1, then take that step's phase from the note. Check my answers then shows each event's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.2-10": [
    {
      title: "BC or DR",
      icon: "table",
      body: "An outage raises two separate questions:",
      steps: [
        { lead: "BC", text: "Does the business need its continuity plan to keep running?" },
        { lead: "DR", text: "Do the ICT systems need the disaster-recovery plan to be restored?" },
      ],
      tips: [
        { kind: "note", text: "Rule L20, in the note, decides each from the RTO." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("regwatch", "Regulatory Watch", "Breach Clock Calculator", "The incident record of INC-2610-3001.", BRC_WINDOW),
    {
      title: "What was down",
      icon: "book",
      body: "The **System affected** and **Service disruption** lines say which system was down, and for how long.",
      tips: [
        { kind: "note", text: "Close the window or drag it aside before you open the next one." },
      ],
      getEl: () => $(BRC_WINDOW),
    },
    ...openLib(10, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Sections 8 to 8.2",
      icon: "book",
      body: "Read BKB-ADD-36:",
      steps: [
        { lead: "Section 8 and 8.1", text: "Each office's Mission Critical assets, counted and listed." },
        { lead: "Section 8.2", text: "Each critical process of the Amsterdam office, the system it runs on and its **RTO**." },
      ],
      tips: [
        { kind: "note", text: "Example: a process stopped for 2 hours, with an RTO of 4 hours, needs no BC plan. The bar at the top jumps to Section 8; 8.1 and 8.2 follow it." },
      ],
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="8"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("The DR plan, worked", "The **DR plan** is the first row. L20, in the note: it is invoked when a Mission Critical system is down longer than its RTO.", "Your decision", 1, () => selIs("Your decision", 1, "Do not invoke"), "Choose for the DR plan", ADD36_WINDOW), [
      { lead: "Take the system that was down", text: "The record's System affected line: Learning platform & content (Amsterdam)." },
      { lead: "Ask whether it is Mission Critical", text: "Section 8's row for Amsterdam counts 0 Mission Critical assets, and Section 8.1 lists none there." },
      { lead: "Choose **Do not invoke**", text: "L20's first test fails, so the RTO is not read for this plan. Next unlocks once it is chosen." },
    ], () => rowWith(ADD36_WINDOW, "Netherlands\t0\t21")),
    checkAnswers("Then the BC plan, with Section 8.2. Check my answers then shows each plan's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T10.2-11": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "An auditor asks for this after an incident. **LI-IRBC** shows the incident against ISO/IEC 27001's incident controls: each event's phase, and whether the BC and DR plans were invoked, with why. An auditor reads it with BRC-PLAN. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "8 to 10"),
  ],
  "T11.1-1": [
    {
      title: "Four weeks",
      icon: "table",
      body: "Every office's awareness campaign follows the Group's **4-week template**, so campaigns can be compared and each week has a known output. **AWR-PLAN** has one row per week. A colleague drafted the activities from memory, and the team will run the campaign from this plan, so you check them first.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R31 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R31",
      icon: "book",
      body: "**R31**'s first sentence sets each week's activity, in order. Example: a template reading \"Week 1 kick-off, Week 2 lesson\" would give Week 2 the lesson.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table." },
      ],
      getEl: () => rowIn(RULES_WINDOW, "R31") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R31")?.scrollIntoView({ block: "center" }),
    },
    // Week 2, not Week 1: Week 1's draft agrees with R31, and Week 2 is the first row that has to change.
    rowAnswer(firstItem("Week 2, worked", "Week 1's row says Lesson, as R31 does: leave it. Week 2 is worked here.", "Activity (R31)", 2, () => selIs("Activity (R31)", 2, "Poster + quiz"), "Make Week 2 agree with R31", RULES_WINDOW), [
      { lead: "Read R31's first sentence", text: "\"Week 1 lesson, Week 2 poster + quiz, Week 3 phishing simulation, Week 4 results + refresher.\"" },
      { lead: "Compare it with Week 2's row", text: "The draft says Phishing simulation. R31 gives Week 2 the poster and quiz." },
      { lead: "Choose **Poster + quiz**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(RULES_WINDOW, "R31")),
    checkAnswers("Check Weeks 3 and 4 the same way, and change only what differs. Check my answers then shows each week's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-2": [
    {
      title: "A question first",
      icon: "help",
      body: "The scenario card is the first thing staff read in the lesson, so it must be the situation the theme is about. This step is the question alone: read the situation, then the three cards.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-2 [data-guide="decision"]'),
    },
    ...openScreen("awareness", "Awareness", "Content Templates", "The content bank, tagged with this step.", CT_WINDOW),
    {
      title: "The content bank",
      icon: "book",
      body: "One row for each theme, with its scenario card. Example: the theme **Secure remote and travel working** opens with a stranger reading your screen in a café.",
      tips: [
        { kind: "note", text: "Drag the window aside to see the question." },
      ],
      getEl: () => $(CT_WINDOW),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the card the content bank gives your theme, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every card. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-2 [data-guide="decision"]'),
      onEnter: () => { $(`${CT_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-2 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-2 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-2 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options. **AWR-LESSON** records the card and the theme's three behaviours.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-2 [data-guide="decision"]'),
    },
    { title: "Finish here", icon: "check", body: "With the feedback read, mark the step complete.", getEl: () => $('#act-2 [data-guide="step-complete"]') },
    { title: "Replay any time", icon: "play", body: "Click **▶ Show me how** to run this guide again.", getEl: () => $('#act-2 [data-guide="show-me-how"]') },
  ],

  "T11.1-3": [
    {
      title: "Three check questions",
      icon: "table",
      body: "Each check question of a micro-lesson tests **one** of the behaviours it teaches, so the quiz shows whether the lesson landed. A colleague drafted four questions, and a lesson has three. Each row is a drafted question; its choices are the theme's three behaviours, or none of them.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(3, "Ref-Content"),
    {
      title: "Ref-Content",
      icon: "book",
      body: "Your theme's row gives each question with its answer in brackets. Example: the vishing theme's \"Will IT ask for your code? (Never)\" checks its behaviour **Never share MFA codes**.",
      getEl: () => $(PAGE_WINDOW("Ref-Content")),
    },
    rowAnswer(firstItem("The first question, worked", "The first drafted question: \"Approve a request you did not start?\"", "Behaviour it checks", 1, () => selIs("Behaviour it checks", 1, "Never approve a request you did not start"), "Choose its behaviour", PAGE_WINDOW("Ref-Content")), [
      { lead: "Find it in your theme's row of Ref-Content", text: "MFA fatigue and push-bombing lists it as Q1, with its answer: (No)." },
      { lead: "Match the answer to one of the row's 3 behaviours", text: "Answering No is the behaviour \"Never approve a request you did not start\"." },
      { lead: "Choose **Never approve a request you did not start**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Content"), "MFA fatigue"), [{ kind: "note", text: "A drafted question that is not among your theme's three belongs to another theme, however close it sounds." }]),
    checkAnswers("Then the others, each found in your theme's row first. Check my answers then shows each question's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-4": [
    {
      title: "A question first",
      icon: "help",
      body: "A phishing simulation records what each person does, so it is cleared before anything is sent. This step is the question alone.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    ...openScreen("awareness", "Awareness", "Phishing Campaign Planner", "The plan waiting for its approvals, tagged with this step.", PLANNER_WINDOW),
    {
      title: "The plan",
      icon: "book",
      body: "The plan says who is targeted, when, and what follows a click. Its note says where the approvals are read.",
      tips: [
        { kind: "note", text: "Close the window or drag it aside before you open the next one." },
      ],
      getEl: () => $(PLANNER_WINDOW),
    },
    ...openLearn("Rule tables", "Rule R31 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R31",
      icon: "book",
      body: "**R31**'s last sentence says who approves a simulation, and when one more approval is added.",
      tips: [
        { kind: "note", text: "Close the window or drag it aside before you open the next one." },
      ],
      getEl: () => rowIn(RULES_WINDOW, "R31") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R31")?.scrollIntoView({ block: "center" }),
    },
    ...openLib(4, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 2.2",
      icon: "book",
      body: "**Section 2.2** lists each office's employee bodies. Example: for a simulation in New York, Section 2.2 lists no employee body, so R31 adds nothing to its first part there. The bar at the top of the window jumps to Section 2.2.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="2.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option R31 and Section 2.2 give for **Amsterdam**, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-4 [data-guide="decision"]'),
      onEnter: () => { $(`${ADD36_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-4 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-4 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-4 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options. **AWR-SIM** records the approvals.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-4 [data-guide="decision"]'),
    },
    { title: "Finish here", icon: "check", body: "With the feedback read, mark the step complete. The next step is a question too, so the desk takes you back to the step list.", getEl: () => $('#act-4 [data-guide="step-complete"]') },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    { title: "Replay any time", icon: "play", body: "Click **▶ Show me how** to run this guide again.", getEl: () => $('#act-4 [data-guide="show-me-how"]') },
  ],

  "T11.1-5": [
    {
      title: "Each metric's target",
      icon: "table",
      body: "Your answer is in. Part 2: a campaign is judged against targets the organisation has already set, each read from the place that sets it, and against where the last campaign left off. AWR-SIM's two metrics are in the table, each with its formula.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Heat Map with KRIs", "The Amsterdam office register's KRIs, tagged with this step.", HEAT_WINDOW),
    {
      title: "The office register",
      icon: "book",
      body: "Each risk with the **KRI** that tracks it and its target. Example: R-36-RO1-13's KRI is regulatory changes assessed within 30 days, with a target of 100%.",
      getEl: () => $(HEAT_WINDOW),
    },
    rowAnswer(firstItem("Click rate: its target, worked", "The click rate's row is worked here, both cells. First its **Target**.", "Target", 1, () => targetIs("Target", 1, "≤ 5 %"), "Type the click-rate target", HEAT_WINDOW), [
      { lead: "Find the phishing risk in the register", text: "R-36-RO1-02, Phishing and business-email compromise." },
      { lead: "Read its KRI", text: "\"Phishing simulation click rate (≤ 5%)\": the target is in the brackets." },
      { lead: "Type **≤ 5 %**", text: "You may type <= 5 %. Next unlocks once it is typed." },
    ], () => cellAt(HEAT_WINDOW, "R-36-RO1-02", "KRI")),
    // Click rate is worked from start to finish, target then rate (tester, 18 Nov 2026), before the report rate's target: the guide
    // waited on the two targets, one of each row, and on neither rate.
    ...openScreen("awareness", "Awareness", "Campaign Results", "Last campaign's counts, tagged with this step.", RESULTS_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${HEAT_WINDOW} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Last campaign's counts",
      icon: "book",
      body: "What happened to last campaign's simulation for this team.",
      tips: [
        { kind: "avoid", text: "using the wrong counts. More are shown than a rate needs: each row's formula says which two it uses." },
        { kind: "note", text: "Example: 40 sent, 30 opened, 6 clicked: click rate = 6 ÷ 40 × 100 = **15 %**." },
      ],
      getEl: () => $(RESULTS_WINDOW),
    },
    rowCell("Click rate: last campaign's rate", "Last campaign's rate", t1115Row, "The row's **How it is measured** cell gives the click rate's formula.", {
      steps: [
        { lead: "Read which two counts the formula uses", text: "Staff who clicked ÷ staff it was sent to × 100." },
        { lead: "Find them in Campaign Results", text: "1 clicked, 20 sent. The count of staff who opened it is not in the formula." },
        { lead: "Type **5 %** in **Last campaign's rate**", text: "1 ÷ 20 × 100. Next unlocks once it is typed." },
      ],
      tips: [{ kind: "note", text: "That is the click rate's full row. The report rate's row is yours: its target is next, then its rate from the same counts." }],
      alsoShow: () => (innerWidth > 700 ? $(RESULTS_WINDOW) : null),
      // The real rate, not any rate (owner, 22 Nov 2026).
      nextWhen: () => /^5(\.0)?\s*%$/.test((sameRow(t1115Row(), "Last campaign's rate") as HTMLInputElement | null)?.value.trim() ?? ""),
    }),
    ...openLib(5, "BKB-POL-020", "The awareness policy", POL020_WINDOW),
    {
      title: "Section 7.1",
      icon: "book",
      body: "**Section 7.1**'s table gives the target of each measure. The bar at the top of the window jumps to Section 7.1.",
      getEl: () => $(POL020_WINDOW),
      onEnter: () => $(`${POL020_WINDOW} [data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
    },
    firstItem("The report rate's target", "In Section 7.1's table, the **Report rate** row's Target cell reads ≥ 60 %: staff who report the simulated message, and more is better, so the sign is ≥. Type **≥ 60 %** as it is written. Next unlocks once it is right.", "Target", 2, () => targetIs("Target", 2, "≥ 60 %"), "Type the report-rate target", POL020_WINDOW),
    checkAnswers("Then the report rate's own rate, from the counts in Campaign Results and the formula in its row. Check my answers then shows each metric's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.1-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "The campaign plan, micro-lesson and simulation plan are filed so the team can run the campaign from them. **AWR-PLAN**, **AWR-LESSON** and **AWR-SIM** come from your steps 1 to 5. This step checks them, names the two files and submits them; AWR-SIM is a platform form, with no file to name.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then an extension the box names: .xlsx or .docx for AWR-PLAN, .docx or .pptx for AWR-LESSON." } : c)),
  ],

  "T11.1-7": [
    {
      title: "What LI-COMM evidences",
      icon: "table",
      body: "Before filling a template, an implementer checks which clauses of the standard it is evidence for, so an auditor finds what they look for. These are **Ref-Clause map**'s rows for clauses 5.1 and 7.2 to 7.4. Here you find three things in them.",
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
      body: "Question 1: the clause **LI-COMM alone** evidences. Read the deliverables column and click its clause. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="comm"]'),
      doIt: "Click the clause LI-COMM alone evidences",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong click turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-8": [
    {
      title: "Competence on file",
      icon: "table",
      body: "Your answer is in. Part 2: clause 7.2 is audited by asking for each role holder's evidence of **competence**. Each row is a role of Ref-Competence, copied for you, with its Amsterdam holder and the record on file.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A control owner whose record shows the briefing but no accepted evidence pack is **Action needed**, not Competent: one item of Evidence retained is missing.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("The risk owner, worked", "The risk owner is the first role. Two cells of its row are compared.", "Competence shown? (clause 7.2)", 1, () => selIs("Competence shown? (clause 7.2)", 1, "Action needed"), "Choose for the risk owner"), [
      { lead: "Read what must be kept as evidence", text: "Risk training with an assessed exercise, and two register entries reviewed by the Cyber Risk Manager." },
      { lead: "Read the record on file", text: "An e-learning with no assessed exercise, and no register entry reviewed." },
      { lead: "Choose **Action needed**", text: "Both items are missing, and one would be enough. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way: item by item. Check my answers then shows each role's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.1-9": [
    {
      title: "When each message goes",
      icon: "table",
      body: "Your answer is in. Part 2: the ISMS communication plan is dated against the **programme calendar**, so each message goes out when its event happens. Each row is a communication of Ref-Communications, copied for you, with the event that triggers it and a colleague's draft of its week.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("home", "Home", "Calendar", "The programme calendar, tagged with this step.", CAL_WINDOW),
    {
      title: "The calendar",
      icon: "book",
      body: "**Home › Calendar** gives each week with the day it opens and its tasks. Example: an event of T6.2 falls in W6, the row that lists T6.2, on the day W6 opens.",
      getEl: () => $(CAL_WINDOW),
    },
    // The incident notice, the third row: the first two rows' drafts agree with the calendar.
    rowAnswer(firstItem("The incident notice, worked", "The first two rows agree with the calendar: leave them. **Incident notice and lessons learned**, the third, is worked here.", "Week (Home › Calendar)", 3, () => selIs("Week (Home › Calendar)", 3, toLearner("W10 · Mon 07 Dec")), "Make its week agree with the calendar", CAL_WINDOW), [
      { lead: "Read its programme event", text: "BRC-PLAN, the notification plan of INC-2610-3001: task T10.2." },
      { lead: "Find T10.2 in the calendar", text: "It is in the Tasks cell of week W10. The draft has the week before." },
      { lead: "Choose the option that starts **W10**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(CAL_WINDOW, "W10")),
    checkAnswers("Check the other five the same way, and change only what differs. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.1-10": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "The competence matrix and the communication plan are filed as evidence for clauses 7.2 and 7.4, and feed the management review. **LI-COMM** holds both, and T12.1 reads it. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("xlsx", "7 to 9"),
  ],

  "T11.2-1": [
    {
      title: "Four offices, one source",
      icon: "table",
      body: "A brief names who supervises each office. The **Regulation Tracker** is only a copy that drifts: it is checked against the addendum before anyone relies on it. Each row is one of LearnTech's offices, with the authority the tracker gives it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(1, "BKB-ADD-36", "LearnTech's addendum", ADD36_WINDOW),
    {
      title: "Section 2",
      icon: "book",
      body: "**Section 2**: one row per office; its **Authority** column names who supervises it. Example: GlobalConnect's addendum gives Manila the NPC, so a tracker entry \"NPC\" for Manila would agree. The bar at the top of the window jumps to Section 2.",
      getEl: () => $(ADD36_WINDOW),
      onEnter: () => $(`${ADD36_WINDOW} [data-sec="2"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("Istanbul, worked", "Istanbul is the first office.", "Against BKB-ADD-36 Section 2", 1, () => selIs("Against BKB-ADD-36 Section 2", 1, "Agrees with Section 2"), "Choose for Istanbul", ADD36_WINDOW), [
      { lead: "Read the tracker's entry, in the row", text: "KVKK Authority." },
      { lead: "Read Istanbul's row of Section 2, column **Authority**", text: "KVKK Authority: the same body." },
      { lead: "Choose **Agrees with Section 2**", text: "Next unlocks once it is chosen." },
    ], () => rowWith(ADD36_WINDOW, "KVKK Law 6698")),
    checkAnswers("Then the other three, the same way: the Authority column only. Check my answers then shows each office's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.2-2": [
    {
      title: "Official or not",
      icon: "table",
      body: "Your answer is in. Part 2: a month's monitoring turns up the rule itself and plenty written about it; only the first may be cited in a brief. Each row is one of this month's results for your topic.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Read each result's **publisher** and **web address**.",
      tips: [
        { kind: "note", text: "Example: the European Data Protection Board publishing its own guidelines is an official source; a consultancy's newsletter about those guidelines is not." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("The first result, worked", "The first result is the Commission's own page.", "Official source?", 1, () => selIs("Official source?", 1, "Official source"), "Choose for the first result"), [
      { lead: "Read its publisher", text: "European Commission: the body that issued the guidelines." },
      { lead: "Read its web address", text: "digital-strategy.ec.europa.eu, the Commission's own site: the guidelines as issued, not someone's account of them." },
      { lead: "Choose **Official source**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other five, the same way: who published it, and where. Check my answers then shows each result's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-3": [
    {
      title: "Each source's dates",
      icon: "table",
      body: "A brief cites each source with when it was **published** and when its duties **apply**, so anyone can check the text as you saw it. A colleague logged these four dates from memory; you check them against the saved copies.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(3, "SRC-EC-MINORS-2025", "Source 1's saved copy", SRC1_WINDOW),
    {
      title: "Section 1",
      icon: "book",
      body: "**Section 1**'s table gives the publisher, the address and the date published, and a **Status** line on when the duty applies.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table." },
      ],
      getEl: () => $(SRC1_WINDOW),
    },
    // The second row, not the first: Source 1 · Published agrees with the saved copy, and this is the first date that has to change.
    rowAnswer(firstItem("One date, worked", "**Source 1 · Published** says 14 July 2025, as Section 1 does: leave it. **Source 1 · Applies from**, the second row, is worked here.", "Date in the log", 2, () => selIs("Date in the log", 2, "17 February 2024"), "Set the date", SRC1_WINDOW), [
      { lead: "Read what the log has", text: "14 July 2025: the same date as Published." },
      { lead: "Read Section 1's **Status** line", text: "The guidelines are not binding. The duty they explain, Article 28(1), \"has applied since 17 February 2024\"." },
      { lead: "Choose **17 February 2024**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(SRC1_WINDOW, "Status")),
    checkAnswers("Then source 2's two rows, against its saved copy: Section 1, and Article 93 in Section 4. Check my answers then shows each date's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.2-4": [
    {
      title: "Duty or background",
      icon: "table",
      body: "Your answer is in. Part 2: a brief lists what the organisation **must do** and leaves the rest to the source. Each row is one of source 1's key points, as its saved copy gives it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "\"Answer each complaint within 14 days\" is a **duty**; \"The authority received 2,000 complaints last year\" is **background**.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("Point 1, worked", "Point 1 is the first key point.", "Duty or background?", 1, () => selIs("Duty or background?", 1, "Background"), "Choose for point 1"), [
      { lead: "Read point 1", text: "On 14 July 2025 the Commission published guidelines, under Article 28(4)." },
      { lead: "Ask whether it tells a platform to do something", text: "No. It says who published what, and when." },
      { lead: "Choose **Background**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other nine, the same way. Check my answers then shows each point's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-5": [
    {
      title: "The Regulation's own words",
      icon: "table",
      body: "The duties a brief relies on are read in the **law itself**, not only in a summary of it. Each row is a paragraph of source 2, Regulation (EU) 2022/2065.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(5, "SRC-EU-2022-2065", "Source 2's saved copy", SRC2_WINDOW),
    {
      title: "Articles 19 and 28",
      icon: "book",
      body: "For each paragraph of **Articles 19 and 28**, read who it asks to do what. The bar at the top of the window jumps to each.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the table." },
      ],
      getEl: () => $(SRC2_WINDOW),
      onEnter: () => $(`${SRC2_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("Article 19(1), worked", "Article 19(1) is the first paragraph.", "Duty or background?", 1, () => selIs("Duty or background?", 1, "Background"), "Choose for Article 19(1)", SRC2_WINDOW), [
      { lead: "Read what it says", text: "This Section \"shall not apply to\" providers that are micro or small enterprises." },
      { lead: "Ask who must do what", text: "Nobody. It takes some providers out of scope: it limits who the duties bind. The word \"shall\" does not make a duty by itself." },
      { lead: "Choose **Background**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the four paragraphs of Article 28, the same way: who must do what. Check my answers then shows each one's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-6": [
    {
      title: "Office by office",
      icon: "table",
      body: "A new rule is applied to each office **in turn**: one office's answer is never assumed for the others. Each row is a LearnTech office with what it runs, from REG-EXTRA; the note above gives LearnTech's size.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(6, "BKB-POL-016", "The compliance policy", POL016_WINDOW),
    {
      title: "Section 7.2",
      icon: "book",
      body: "**Section 7.2** gives three tests, in order. The guidelines apply to an office only when **all three** are met:",
      steps: [
        { lead: "Reach" },
        { lead: "Activity" },
        { lead: "Threshold" },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to Section 7.2; source 1's key point 2 says whom the guidelines cover." },
      ],
      getEl: () => $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="7.2"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("Istanbul, worked", "Istanbul is the first office. The tests are taken in order, and all three must be met.", "Do the guidelines apply?", 1, () => selIs("Do the guidelines apply?", 1, "Does not apply"), "Choose for Istanbul", POL016_WINDOW), [
      { lead: "Read test 1, Reach", text: "A law that regulates a market reaches an office in that market, or one that offers its service to people there." },
      { lead: "Read Istanbul's line", text: "Turkey is not in the EU, and the office \"offers no service to learners in the EU\"." },
      { lead: "Choose **Does not apply**", text: "The first test fails, so tests 2 and 3 are not needed. Next unlocks once it is chosen." },
    ], () => rowIn(POL016_WINDOW, "1 Reach"), [{ kind: "note", text: "An office outside the EU can still be reached. And the threshold is measured on the whole enterprise: the note above the table gives its size." }]),
    checkAnswers("Then the other three, the same way. Check my answers then shows each office's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "A message for this step is in your **Inbox** on the toolbar. It carries data the step uses and asks for no reply: open it and read it.",
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-7": [
    {
      title: "Duty to policy",
      icon: "table",
      body: "Each new duty is mapped to the Group policy that must carry it, and a duty no policy carries is raised as a gap. Each row is a duty of steps 4 and 5.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(7, "Ref-Keywords"),
    {
      title: "Ref-Keywords",
      icon: "book",
      body: "**Ref-Keywords**: key words, the BKB policy they point to, and its Annex A controls. Example: a duty to \"patch internet-facing servers within 7 days\" uses \"patch\", which points to BKB-POL-010.",
      getEl: () => $(PAGE_WINDOW("Ref-Keywords")),
    },
    rowAnswer(firstItem("Point 4, worked", "Point 4 is the first duty.", "BKB policy (Ref-Keywords)", 4, () => selIs("BKB policy (Ref-Keywords)", 4, "BKB-POL-002"), "Choose point 4's policy", PAGE_WINDOW("Ref-Keywords")), [
      { lead: "Read point 4", text: "\"Review the risks the service poses to minors, and act on the results.\"" },
      { lead: "Find a word of it under **Key words** in Ref-Keywords", text: "\"risk\" is the last row's key word. Its BKB policy is BKB-POL-002." },
      { lead: "Choose **BKB-POL-002**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Keywords"), "risk"), [{ kind: "note", text: "A duty that uses no key word of the page has no policy yet: that is the gap option." }]),
    checkAnswers("Then the other seven, the same way. Check my answers then shows each duty's answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T11.2-8q": [
    {
      title: "A question first",
      icon: "help",
      body: "This step has two parts. Part 1: the deadline BKB-POL-016 sets for an impact assessment.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    ...openLib(8, "BKB-POL-016", "The compliance policy", POL016_WINDOW),
    {
      title: "Section 3.1",
      icon: "book",
      body: "**Section 3.1**'s second statement says how long the impact assessment of a change may take, and counted from when. The procedure in **Section 6.1** says the same. The bar at the top of the window jumps to each.",
      getEl: () => $(`${POL016_WINDOW} [data-sec="3.1"]`) ?? $(POL016_WINDOW),
      onEnter: () => $(`${POL016_WINDOW} [data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option the policy gives, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
      onEnter: () => { $(`${POL016_WINDOW} button[aria-label^="Close"]`)?.click(); $('#act-8 [data-guide="decision"]')?.scrollIntoView({ block: "nearest" }); },
      pointAt: () => $('#act-8 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-8 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    {
      title: "Replay any time",
      icon: "play",
      body: "Part 2 opens from the **Open** button, below the question.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-8 [data-guide="show-me-how"]'),
    },
  ],

  "T11.2-8": [
    {
      title: "Who owns each action",
      icon: "table",
      body: "Your answer is in. Part 2: each action of a brief goes to the **owner of the policy it changes**, so it is done and tracked. Each row is a policy the Impact Log found; the action is written for you, and takes the brief's deadline at the hand-in.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(8, "BKB-POL-000", "The policy index", POL000_WINDOW),
    {
      title: "Sections 3 and 7",
      icon: "book",
      body: "Find the owner:",
      steps: [
        { lead: "Section 3", text: "Each policy's owner. Example: an action on BKB-POL-010 goes to the Vulnerability Management Governance Analyst." },
        { lead: "Section 7", text: "Who drafts a new statement." },
      ],
      tips: [
        { kind: "note", text: "The bar at the top of the window jumps to each." },
      ],
      getEl: () => $(POL000_WINDOW),
      onEnter: () => $(`${POL000_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("BKB-POL-006, worked", "The first row's action changes BKB-POL-006.", "Owner (BKB-POL-000)", 1, () => selIs("Owner (BKB-POL-000)", 1, "Group CISO"), "Choose its owner", POL000_WINDOW), [
      { lead: "Find BKB-POL-006 in Section 3 of BKB-POL-000", text: "The Access Control and Identity Management Policy." },
      { lead: "Read its owner on that row", text: "Group CISO." },
      { lead: "Choose **Group CISO**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(POL000_WINDOW, "BKB-POL-006"), [{ kind: "note", text: "A row with no policy to change needs a new statement: Section 7 says who drafts one." }]),
    checkAnswers("Then the other four. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-9": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "The brief is what the business reads: what changed, who it affects, the deadline, what we must do, and the source. Its first sheet is that page, written from your steps 3 to 8; it updates the obligations register and starts the actions. **The two dates are yours.**",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openLearn("Rule tables", "Rule R32 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R32",
      icon: "book",
      body: "**R32**'s last two sentences set the actions' due date, and what happens when that date has already passed on the day a change is logged.",
      tips: [
        { kind: "note", text: "Example: published 1 March, so 31 March; logged in time, the due date stays 31 March." },
      ],
      getEl: () => rowIn(RULES_WINDOW, "R32") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R32")?.scrollIntoView({ block: "center" }),
    },
    rowAnswer(firstItem("The first date, worked", "**30 days from publication** is the first of the two dates.", "What the brief says", 3, () => valIs("What the brief says", 3, "13 August 2025"), "Type the date", RULES_WINDOW), [
      { lead: "Read the date beside the line", text: "Source 1 was published on 14 July 2025." },
      { lead: "Add 30 days, day by day", text: "July has 31 days: 17 days reach 31 July, and 13 more reach 13 August." },
      { lead: "Type **13 August 2025**", text: "Or 2025-08-13. Next unlocks once it is typed." },
    ], () => rowIn(RULES_WINDOW, "R32")),
    {
      title: "Then the deadline",
      icon: "edit",
      body: "Now the deadline.",
      steps: [
        { lead: "Compare that date with the Logged on date", text: "Beside the Deadline line." },
        { lead: "Apply R32", text: "A date that is not the rule's is flagged." },
      ],
      tips: [
        { kind: "note", text: "Once it is right, the platform writes the Found late line, and the actions take the date." },
      ],
      getEl: () => $('[data-guide="register"]'),
      onEnter: () => { $(`${RULES_WINDOW} button[aria-label^="Close"]`)?.click(); },
      nextWhen: () => !!oblCell("What the brief says", 4) && !!(oblCell("What the brief says", 4) as HTMLInputElement).value.trim() && oblCell("What the brief says", 4)?.getAttribute("aria-invalid") !== "true",
      doIt: "Type the deadline",
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "On each of the other sheets, any empty cell is marked amber, and the line above the sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "1 to 8"),
  ],

  "T11.2-10": [
    {
      title: "The type of the change",
      icon: "table",
      body: "Clause 6.3 of ISO/IEC 27001 asks for changes to the ISMS to be **planned**, and a change's type says which parts of the ISMS it touches. The row is your change.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(10, "Ref-Change types"),
    {
      title: "Ref-Change types",
      icon: "book",
      body: "**Ref-Change types**' first five rows are the topic types, each with the ISMS elements it touches and a new-technology note. Example: a new national incident-reporting law is a **cyber / resilience law**.",
      tips: [
        { kind: "note", text: "Close the window or drag it aside before you open the next one." },
      ],
      getEl: () => $(PAGE_WINDOW("Ref-Change types")),
    },
    ...openLib(10, "SRC-EU-2022-2065", "Source 2's saved copy", SRC2_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${PAGE_WINDOW("Ref-Change types")} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Section 1",
      icon: "book",
      body: "**Section 1**'s Title line gives the full name of the law the guidelines come from.",
      getEl: () => $(SRC2_WINDOW),
    },
    rowAnswer(firstItem("The type, worked", "This step has one row, so its answer is worked here in full.", "Topic type (Ref-Change types)", 1, () => selIs("Topic type (Ref-Change types)", 1, "Sector or market rule (media, finance, education, health)"), "Choose its topic type", SRC2_WINDOW), [
      { lead: "Read Section 1's **Title** line", text: "Regulation (EU) 2022/2065 \"on a Single Market For Digital Services\": a rule for the market of online services." },
      { lead: "Hold it against the five types you read", text: "It is not a data-protection law, a cyber law, a standard or an AI rule. LearnTech's platform is an education service on that market." },
      { lead: "Choose **Sector or market rule (media, finance, education, health)**", text: "A change takes the type of the law it comes from. Next unlocks once it is chosen." },
    ], () => rowIn(SRC2_WINDOW, "Title")),
    checkAnswers("Check my answers then shows the answer and why. The row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  "T11.2-11": [
    {
      title: "What the change touches",
      icon: "table",
      body: "The change plan lists each part of the ISMS a change touches, so none is left out of date until the next audit. A colleague marked the six elements from memory; the note names your topic type.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(11, "Ref-Change types"),
    {
      title: "The type's row",
      icon: "book",
      body: "The type's second column lists the elements a change of that type affects. Example: a standard revision affects SoA, Documents, Objectives and Resources, **not** Scope or Risks.",
      getEl: () => $(PAGE_WINDOW("Ref-Change types")),
    },
    // Objectives, the fourth row: the first whose draft does not agree with the type's row.
    rowAnswer(firstItem("Objectives, worked", "**Objectives** is worked here: the colleague marked it Affected.", "Affected by the change?", 4, () => selIs("Affected by the change?", 4, "Not affected"), "Set Objectives", PAGE_WINDOW("Ref-Change types")), [
      { lead: "Find your topic type's row in Ref-Change types", text: "Sector or market rule (media, finance, education, health), the third row." },
      { lead: "Look for Objectives in **ISMS elements to tick**", text: "The row lists four elements, and Objectives is not one of them." },
      { lead: "Choose **Not affected**", text: "L22: an element is affected only when the type's row lists it. Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Change types"), "Sector or market rule")),
    checkAnswers("Then the other five, the same way: leave a row that agrees, change one that does not. Check my answers then shows each element's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-12": [
    {
      title: "Systems on layers",
      icon: "table",
      body: "The change plan places each affected system on the **reference architecture**, so the people who run that layer are brought in. Each row is a LearnTech system that carries a new duty.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(12, "TSA-36 Technology_Stack"),
    {
      title: "Technology_Stack",
      icon: "book",
      body: "**Technology_Stack**: one row per capability, by Cap ID, with its **Domain**. Example: SOC-01, the SIEM, is in the Domain Security operations.",
      tips: [
        { kind: "note", text: "Close the window or drag it aside before you open the next one." },
      ],
      getEl: () => $(PAGE_WINDOW("TSA-36 Technology_Stack")),
    },
    ...openLib(12, "BKB-TECH-000", "The reference architecture", TECH_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${PAGE_WINDOW("TSA-36 Technology_Stack")} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Section 3",
      icon: "book",
      body: "**Section 3**'s table gives the layer each Technology_Stack Domain sits on, in the last column. The bar at the top of the window jumps to Section 3.",
      getEl: () => $(TECH_WINDOW),
      onEnter: () => $(`${TECH_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("SEC-50, worked", "SEC-50 is the first system. Its layer takes two lookups.", "Layer (BKB-TECH-000)", 1, () => selIs("Layer (BKB-TECH-000)", 1, "Application"), "Choose SEC-50's layer", TECH_WINDOW), [
      { lead: "Find SEC-50 in Technology_Stack", text: "Its Domain is Sector & core operations." },
      { lead: "Find that Domain in Section 3's last column", text: "It is on the row of the Application layer." },
      { lead: "Choose **Application**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(TECH_WINDOW, "Application")),
    checkAnswers("Then the other four, the same way. Check my answers then shows each system's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T11.2-13": [
    {
      title: "The new-technology note",
      icon: "table",
      body: "The change-impact note records what new technology in a change of this type raises, and on which system, so that system's owners answer it. The row is your change, with its topic type from step 10.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(13, "Ref-Change types"),
    {
      title: "The type's row",
      icon: "book",
      body: "The note is in the type's last column, **New-technology note**.",
      getEl: () => $(PAGE_WINDOW("Ref-Change types")),
    },
    rowAnswer(firstItem("The note, worked", "This step has one row, so both its cells are worked here in full. First the note.", "New-technology note (Ref-Change types)", 1, () => selIs("New-technology note (Ref-Change types)", 1, "Large data sets (volume, variety, velocity) raise retention and access questions"), "Choose the note", PAGE_WINDOW("Ref-Change types")), [
      { lead: "Take your topic type from step 10", text: "Sector or market rule (media, finance, education, health), in this row." },
      { lead: "Read that row's **New-technology note** in Ref-Change types", text: "\"Large data sets (volume, variety, velocity) raise retention and access questions\"." },
      { lead: "Choose the note that starts **Large data sets**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Change types"), "Sector or market rule")),
    ...openLib(13, "BKB-TECH-000", "The reference architecture", TECH_WINDOW).map((c) => (c.title === "Follow the orange dot" ? { ...c, onEnter: () => $(`${PAGE_WINDOW("Ref-Change types")} button[aria-label^="Close"]`)?.click() } : c)),
    {
      title: "Section 3",
      icon: "book",
      body: "**Section 3** lists the layers of the architecture. Its **What it holds** column says what sits on each layer.",
      getEl: () => $(TECH_WINDOW),
      onEnter: () => $(`${TECH_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
    },
    // The row's second cell (tester, 18 Nov 2026): it was a reading card with no cell lit and nothing to wait on.
    rowCell("Raised on", "Raised on", t11213Row, "The same row's second cell: the system the note is raised on.", {
      steps: [
        { lead: "Find the layer whose **What it holds** names what the note is about", text: "The note is about data sets. The **Data** layer holds databases and data platforms." },
        { lead: "Read your layers from step 12", text: "In the note beside the table: of your five systems, only DAT-08 is on Data." },
        { lead: "Choose **DAT-08 Object storage / data lake** in **Raised on**", text: "Next unlocks once it is chosen." },
      ],
      tips: [{ kind: "note", text: "That is the full row." }],
      onEnter: () => $(`${TECH_WINDOW} [data-sec="3"]`)?.scrollIntoView({ block: "start" }),
      alsoShow: () => (innerWidth > 700 ? $(TECH_WINDOW) : null),
      // The real system, not any system (owner, 22 Nov 2026).
      nextWhen: () => ((sameRow(t11213Row(), "Raised on") as HTMLSelectElement | null)?.value ?? "").startsWith("DAT-08"),
    }),
    checkAnswers("Check my answers then shows the answer and why. The row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  "T11.2-14": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "**LI-CHG** is the ISMS change impact note from your steps 10 to 13: the change's type, the ISMS elements it touches, the systems on their layers and the new-technology note. It goes with REG-BRIEF. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "10 to 13"),
  ],

  // T12.1 (desk-step-builder, 30 Oct 2026): ACT-TRACKER followed up in Risk Register › Mitigation Tracker. Steps 8 and 11 are
  // questions in their rows, each ruled by a rule its guide opens; step 9's guide is its part 2.
  "T12.1-1": [
    {
      title: "Read the tracker first",
      icon: "table",
      body: "A corrective-action tracker is read **column by column** before any closure is tested, so each test reads the right cell. This step reads ACT-TRACKER and the column guide of its template, T-ACT.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("risk", "Risk Register", "Mitigation Tracker", "ACT-TRACKER, tagged with this step.", MT_WINDOW),
    {
      title: "ACT-TRACKER",
      icon: "book",
      body: "One row per action, with what its owner reports and the evidence attached. A-20 to A-22 came in late, with ACT-EXTRA (Inbox).",
      tips: [
        { kind: "avoid", text: "reading another dataset. Use only this one." },
      ],
      getEl: () => $(MT_WINDOW),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: **R33's third test**. Read down the column guide's **What it records** column for the row that answers it, then click that row's name in the first column, **Column**. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => { $(`${MT_WINDOW} button[aria-label^="Close"]`)?.click(); $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="sys"]'),
      doIt: "Click the column the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered."),
  ],

  "T12.1-2": [
    {
      title: "Test each closure",
      icon: "table",
      body: "An owner's \"Closed\" is a **claim**: before the management review, the Compliance Manager's team tests the evidence of every closure. Each row is an action its owner reports Closed.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "Rule R33",
      icon: "book",
      body: "**R33**, in the note: four tests, in order, coded **K1 to K4**. An action is verified only if all four pass.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers the checklist." },
      ],
      // The note beside the table names the four tests: no Rule tables window over it (as T7.1 and T8.1, 16 Nov 2026).
      getEl: () => $(STEP_NOTE) ?? $('[data-guide="register"]'),
      onEnter: () => $(STEP_NOTE)?.scrollIntoView({ block: "nearest" }),
    },
    {
      title: "The tests, beside the table",
      icon: "help",
      body: "Each test shows the cells of the lit action it reads.",
      steps: [
        { lead: "Read the tests in order", fork: [{ when: "One fails", then: "Click **Fails** on it. The action is not verified." }, { when: "It passes", then: "Go on to the next test." }] },
        { lead: "All four pass? Record Pass", mark: "stop" },
      ],
      getEl: () => $('[data-guide="checklist"]'),
      onEnter: () => $(`${RULES_WINDOW} button[aria-label^="Close"]`)?.click(),
    },
    {
      title: "A-02, worked",
      icon: "edit",
      body: "A-02, the first action, is lit. Each test shows the cells it reads.",
      steps: [
        { lead: "K1, evidence attached", text: "It has a closure evidence date, 2026-11-27, and a type, System export: it passes." },
        { lead: "K2, dated after raising", text: "The action was raised on 2026-12-01. The evidence is dated four days before that, so it cannot show a fix made afterwards: it fails." },
        { lead: "Click **Fails** on K2, then record the result", text: "One failed test is enough: the action is not verified. Next unlocks once the result is Fail." },
      ],
      getEl: () => $('[data-guide="checklist-row"]'),
      // At the action's name, never at a button: the cursor must not suggest an answer.
      pointAt: () => $('[data-guide="checklist-row"] p:nth-of-type(2)'),
      nextWhen: () => uarResult("A-02")[0] === "Fail",
      doIt: "Test the first action",
    },
    {
      title: "Then the other 14",
      icon: "check",
      body: "The checklist moves on to the next action by itself.",
      tips: [
        { kind: "unsure", text: "To test an action again, click its Closure tests cell in the table." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Once all 15 are recorded, Check my answers shows each action's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-3": [
    {
      title: "Why each one reopened",
      icon: "table",
      body: "A reopened action carries the **code** of the test it failed, so its owner knows what is missing and the review can count the reasons. Each row is an action that failed a closure test in step 2.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "An action closed on a signed paper form, dated after it was raised, has evidence and a good date, but no system produced it: it fails the third test, **K3**.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("A-02, worked", "A-02 is the first action your tests reopened. Its cells are read against R33's tests in order.", "Status after your tests (R33)", 1, () => selIs("Status after your tests (R33)", 1, "Open — K2"), "Choose A-02's status"), [
      { lead: "K1, evidence attached", text: "**Closure evidence date** holds 2026-11-27, so evidence is attached: it passes." },
      { lead: "K2, dated after raising", text: "**Raised** says 2026-12-01. The evidence is dated four days before that: it fails." },
      { lead: "Choose **Open — K2**", text: "R33 records the first test that fails, so K3 and K4 are not read. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other six, the same way. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-4": [
    {
      title: "Escalate or not",
      icon: "table",
      body: "An action that has slipped well past its date goes to the **owner's manager**, so someone with authority can unblock it. Each row is an action still open after your tests.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Due 1 December, checked on 23 December: **22 days** past due, more than 14.",
      tips: [
        { kind: "note", text: "Read each row's **Due** and **Escalated** columns." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("A-01, worked", "A-01 is the first open action.", "Escalate? (R33)", 1, () => selIs("Escalate? (R33)", 1, "No escalation yet"), "Choose for A-01", STEP_NOTE), [
      { lead: "Read its **Due** date", text: "2027-01-04." },
      { lead: "Compare it with the test date, 23 December 2026", text: "The due date is still to come, so the action is not past due at all." },
      { lead: "Choose **No escalation yet**", text: "R33 escalates only an action more than 14 days past due. Next unlocks once it is chosen." },
    ], undefined, [{ kind: "note", text: "Where a due date has passed, count the days to 23 December as the example did, and read **Escalated** too: an action already escalated is not escalated again." }]),
    checkAnswers("Then the other 13. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-5": [
    {
      title: "How late each one is",
      icon: "table",
      body: "The tracker records how far past its due date each open action is: the owner, their manager and the review read it. Each row is an action still open after your tests.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Count to 23 December:",
      steps: [
        { lead: "Due 1 December", text: "**22** days past due." },
        { lead: "Due 5 January", text: "Not past due yet: **0**." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("A-01, worked", "A-01 is the first open action.", "Days past due at 23 Dec 2026", 1, () => valIs("Days past due at 23 Dec 2026", 1, "0"), "Type A-01's days", STEP_NOTE), [
      { lead: "Read its **Due** date", text: "2027-01-04." },
      { lead: "Ask whether it is before 23 December 2026", text: "No: it is twelve days after. The due date has not passed." },
      { lead: "Type **0**", text: "The note: 0 where the due date has not passed. Next unlocks once it is typed." },
    ], undefined, [{ kind: "note", text: "Where it has passed, count day by day across the month end, as the example did." }]),
    checkAnswers("Then the other 13. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-6": [
    {
      title: "Tell each owner",
      icon: "table",
      body: "A reopened action goes back to its owner with exactly **what will close it**, and a date. Each row is an action your tests reopened, with its code.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("A-02, worked", "A-02 is the first action your tests reopened.", "Ask the owner for", 2, () => selIs("Ask the owner for", 2, "Evidence dated after the action was raised"), "Choose for A-02", STEP_NOTE), [
      { lead: "Read its **Status after your tests**", text: "Open — K2: it failed the test \"dated after raising\"." },
      { lead: "Ask what that test needs to pass", text: "Closure evidence dated after the day the action was raised. A-02's was dated before it." },
      { lead: "Choose **Evidence dated after the action was raised**", text: "Next unlocks once it is chosen." },
    ], undefined, [{ kind: "note", text: "Each code asks for its own thing. For a K4, read where the re-test stands first: one that ran and failed needs something different from one never run." }]),
    {
      title: "The request is written",
      icon: "info",
      body: "**Request to the owner** fills itself, in the Evidence request frame of Learn › Sentence frames: what to send, for which action, by the next check date.",
      tips: [
        { kind: "avoid", text: "choosing for a K4 before reading its Status cell. It says where its re-test stands." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    checkAnswers("Then the other six. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-7": [
    {
      title: "The counts",
      icon: "table",
      body: "The counts are the first thing top management reads on the review input, so someone checks a colleague's draft against the tests before it goes up. Each line lists the actions your checked steps put on it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "A line listing A-30, A-31 and A-32 counts **3**. If its Count says 2, type 3 over it.",
      getEl: () => $('[data-guide="register"]'),
    },
    // The Open line, the fourth: the first three counts of the draft agree with their lines.
    rowAnswer(firstItem("The Open line, worked", "The first three lines' counts agree with the actions they list: leave them. **Open**, the fourth, is worked here.", "Count", 4, () => valIs("Count", 4, "14"), "Check the Open line's count"), [
      { lead: "Count the actions listed on the line", text: "14: the 7 their owners report Open, and the 7 your closure tests reopened." },
      { lead: "Compare with its **Count**", text: "The draft says 7. It left out the actions your tests reopened." },
      { lead: "Type **14** over the 7", text: "Next unlocks once it is typed." },
    ]),
    checkAnswers("Then the last two lines, the same way. Check my answers then shows each line's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  // Step 8's question: R33 is the source that rules each option in or out.
  "T12.1-8": [
    {
      title: "A question",
      icon: "help",
      body: "Owners often ask for a line to be softened before a review, and the page has to hold.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule R33 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule R33",
      icon: "book",
      body: "Read **R33**: when an action counts as closed, and what is measured from its due date.",
      getEl: () => rowIn(RULES_WINDOW, "R33") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "R33")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
      onEnter: () => $(`${RULES_WINDOW} button[aria-label^="Close"]`)?.click(),
      pointAt: () => $('#act-8 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-8 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-8 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "play",
      body: "Then click **Mark step complete**, in this row.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-8 [data-guide="show-me-how"]'),
    },
  ],

  "T12.1-9": [
    {
      title: "Issues that come back",
      icon: "table",
      body: "Your answer is in. Part 2: the tracker is read for **patterns** before it goes to the review. Each row is one of ACT-UPD's 22 actions.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "If \"Badge not returned\" were on A-30 and on A-41, both would be a **repeat issue**, whatever their status. An issue on one action alone is a **single action**.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("A-01, worked", "A-01 is the first action.", "Repeat issue?", 1, () => selIs("Repeat issue?", 1, "Repeat issue"), "Choose for A-01"), [
      { lead: "Read its **Issue**", text: "Evidence missing for sampled control." },
      { lead: "Read down **Issue** for the same words", text: "A-04 has them too, three rows down. One other action is enough." },
      { lead: "Choose **Repeat issue**", text: "Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other 21, the same way. Check my answers then shows each action's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "The tracker and the review input are filed before the review.",
      steps: [
        { lead: "ACT-UPD", text: "The updated tracker from your steps 2 to 9. T12.2 shows its verified closures to the surveillance auditor." },
        { lead: "ACT-MRI", text: "The management-review input: the counts, the overdue actions and the repeat issues." },
      ],
      tips: [
        { kind: "note", text: "This step checks both, names them and submits them." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 9").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names." } : c)),
  ],

  // Step 11's question: rule L23 sets who audits; the situation shows who is close to the process.
  "T12.1-11": [
    {
      title: "A question",
      icon: "help",
      body: "The certification auditor reads who audits each process, so the name in the programme has to stand up.",
      steps: [
        { lead: "Read the situation box first", text: "It holds the facts you decide from." },
        { lead: "Then read all three options" },
      ],
      getEl: () => $('#act-11 [data-guide="decision"]'),
    },
    ...openLearn("Rule tables", "Rule L23 is in the rule tables, tagged with this step.", RULES_WINDOW),
    {
      title: "Rule L23",
      icon: "book",
      body: "Read what **L23** says about the audit programme's auditor.",
      getEl: () => rowIn(RULES_WINDOW, "L23") ?? $(RULES_WINDOW),
      onEnter: () => rowIn(RULES_WINDOW, "L23")?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**.",
      tips: [
        { kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." },
      ],
      getEl: () => $('#act-11 [data-guide="decision"]'),
      onEnter: () => $(`${RULES_WINDOW} button[aria-label^="Close"]`)?.click(),
      pointAt: () => $('#act-11 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-11 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
    },
    {
      title: "Read the feedback",
      icon: "info",
      body: "The feedback opens under the options.",
      steps: [
        { lead: "Find the green option", text: "Green marks the best option.", fork: [{ when: "Yours is green", then: "Read why it is best, then go on." }, { when: "Yours is not", then: "Read why the green one is better before you go on." }] },
        { lead: "Read the line under each option", text: "It says why, and what happens if you take that option." },
      ],
      getEl: () => $('#act-11 [data-guide="decision"]'),
    },
    {
      title: "Finish here",
      icon: "play",
      body: "Then click **Mark step complete**, in this row.",
      tips: [
        { kind: "unsure", text: "Replay this guide any time with **▶ Show me how**." },
      ],
      getEl: () => $('#act-11 [data-guide="show-me-how"]'),
    },
  ],

  "T12.1-12": [
    {
      title: "The review's inputs",
      icon: "table",
      body: "The management review pack is built from inputs that must be ready before the meeting: **clause 9.3.2** lists them. Each row is one input; you decide whether it is available.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openPage(12, "Ref-Review inputs"),
    {
      title: "What feeds each input",
      icon: "book",
      body: "Each row names the deliverables that feed one input, by their codes.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers your table." },
      ],
      getEl: () => $(PAGE_WINDOW("Ref-Review inputs")),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step." } : c)),
    {
      title: "Your review records",
      icon: "book",
      body: "One row per deliverable you handed in, with its automated review: accepted, or accepted with review comments. A deliverable not listed is not in the records yet.",
      getEl: () => $(WAIT_WINDOW),
    },
    rowAnswer(firstItem("Input a, worked", "Input a is the first row.", "Status", 1, () => selIs("Status", 1, "Available"), "Choose input a's status", PAGE_WINDOW("Ref-Review inputs")), [
      { lead: "Read row a of Ref-Review inputs, **Source deliverable**", text: "ACT-UPD / ACT-MRI (T12.1)." },
      { lead: "Read what the note says of them", text: "Both are this task's own files, and the note counts those as available. They are not in your review records yet, and need not be." },
      { lead: "Choose **Available**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(PAGE_WINDOW("Ref-Review inputs"), "a"), [{ kind: "note", text: "For the other inputs, look each deliverable up in Home › Waiting On: accepted with review comments, or not listed, does not count as accepted." }]),
    checkAnswers("Then the other nine. Check my answers then shows each input's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-13": [
    {
      title: "The objectives",
      icon: "table",
      body: "The review checks each information security objective against its measure (clause 9.3.2 c). Each row is one of your LI-PLAN objectives, with its target and latest result.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    {
      title: "An example",
      icon: "info",
      body: "Work the result out as a percentage:",
      steps: [
        { lead: "Has a result", text: "Target 90 %, result 28 of 30 = 93.3 %: **met**." },
        { lead: "No result yet", text: "**Too early to judge**." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("The first objective, worked", "The leavers objective is the first row.", "Status", 1, () => selIs("Status", 1, "Not met"), "Choose its status"), [
      { lead: "Read its **Latest result**", text: "18 of 29 leavers were fully disabled within the SLA." },
      { lead: "Work it out as its **Measure** says", text: "18 ÷ 29 × 100 = 62.1 %." },
      { lead: "Compare with **Target**, and choose **Not met**", text: "62.1 % is below 95 %. Next unlocks once it is chosen." },
    ]),
    checkAnswers("Then the other two, the same way. Check my answers then shows each objective's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-14": [
    {
      title: "Ready for Stage 1?",
      icon: "table",
      body: "Before the certification body's Stage 1 audit, the ISMS's mandatory documented information is checked **item by item**: the auditor reviews it first. Each row is one item of your LI-DOC register, with the records that hold it.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openFromHome("Waiting On", WAIT_WINDOW, "with this step").map((c, i) => (i === 1 ? { ...c, getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="home"] li button')].find((b) => b.innerText.includes("Waiting On")) ?? null, body: "Your review records are tagged with this step." } : c)),
    {
      title: "Your review records",
      icon: "book",
      body: "Find each record here.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers your table." },
      ],
      getEl: () => $(WAIT_WINDOW),
    },
    rowAnswer(firstItem("Clause 4.3, worked", "Clause 4.3, the ISMS scope, is the first item.", "Present?", 1, () => selIs("Present?", 1, "Present"), "Choose for 4.3", WAIT_WINDOW), [
      { lead: "Read **Held in**", text: "LI-SCOPE." },
      { lead: "Find LI-SCOPE in your review records", text: "Task T3.1: Accepted, with no review comments." },
      { lead: "Choose **Present**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(WAIT_WINDOW, "LI-SCOPE"), [{ kind: "note", text: "Where an item is held in several records, every one must be accepted, or be this task's own file." }]),
    checkAnswers("Then the other 13, the same way, and the verdict in the last row by rule L24. Check my answers then shows each row's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.1-15": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "The auditor reads this file first. **LI-MR** holds:",
      steps: [
        { lead: "The audit programme", text: "From your answer in step 11 and this task's tracker." },
        { lead: "The management review pack", text: "With the objectives." },
        { lead: "The readiness verdict", text: "And its missing items, from your steps 12 to 14." },
      ],
      tips: [
        { kind: "note", text: "This step checks it, names the file and submits it." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
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
      body: "The repository's index is read **column by column** before the first auditor request is answered, so each answer is checked in the right cell. This step reads EVIDENCE-INDEX and its column guide.",
      getEl: () => $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "EVIDENCE-INDEX, tagged with this step.", EVLIB_WINDOW),
    {
      title: "EVIDENCE-INDEX",
      icon: "book",
      body: "One row per file the repository holds for this audit, sorted by control.",
      tips: [
        { kind: "avoid", text: "reading another dataset. Use only this one." },
      ],
      getEl: () => $(EVLIB_WINDOW),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1: **how a file was produced**. Read down the column guide's **What it records** column for the row that answers it, then click that row's name in the first column, **Column**. Next unlocks once it is right.",
      getEl: () => $('[data-guide="register"] table'),
      onEnter: () => { $(`${EVLIB_WINDOW} button[aria-label^="Close"]`)?.click(); $('[data-guide="register"] thead th')?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="src"]'),
      doIt: "Click the column the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.2-3": [
    {
      title: "Answer each request",
      icon: "table",
      body: "Each auditor request is answered with **one file** from the evidence repository, and the auditor concludes from what is sent. Each row is one of the auditor's requests, R-1 to R-8.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "The repository's index, tagged with this step.", EVLIB_WINDOW),
    {
      title: "Look up by control",
      icon: "book",
      body: "The index is sorted by control: a request's files sit together under its control. Read each one's **description**, **date** and **source**.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers your table." },
      ],
      getEl: () => $(EVLIB_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "A request asks for the incident log under A.5.24. The index holds an undated screenshot of the log and a system export of it dated inside the period: **the export** is the file to send.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("R-1, worked", "R-1 is the first request: A.5.19, for the period 2025-12-21 to 2026-12-21.", "File to send (R34)", 1, () => selIs("File to send (R34)", 1, "EV-5508"), "Choose R-1's file", EVLIB_WINDOW), [
      { lead: "Find A.5.19's files in the index", text: "Two: EV-1780 and EV-5508. Both are system exports of the supplier security assessments." },
      { lead: "Read each one's **Date** against the period", text: "EV-1780 is dated 2025-07-18, before the period starts. EV-5508 is dated 2026-07-03, inside it." },
      { lead: "Choose **EV-5508**", text: "R34: the record asked for, under the same control, dated inside the period, from a system. Next unlocks once it is chosen." },
    ], () => rowIn(EVLIB_WINDOW, "EV-5508"), [{ kind: "note", text: "Where no file under the request's control passes all of R34, the answer is No evidence available." }]),
    checkAnswers("Then R-2 to R-8, the same way. Check my answers then shows each request's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.2-4": [
    {
      title: "Check each fingerprint",
      icon: "table",
      body: "The log of what was sent to the auditor records each file's **SHA-256**, so the file the auditor holds can be proved to be the one sent. A fingerprint keyed by hand is compared with the repository before the log goes. Each row is a request answered with a file in step 3.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "The repository's index, tagged with this step.", EVLIB_WINDOW),
    {
      title: "The SHA-256 column",
      icon: "book",
      body: "Each file's fingerprint is in its own row. Two files of the same control have different fingerprints, so find the row of the **file sent**.",
      tips: [
        { kind: "avoid", text: "comparing only the start. Read to the end: one character can differ." },
      ],
      getEl: () => $(EVLIB_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "Take R-1:",
      steps: [
        { lead: "Find the file sent in the index", text: "Its row here names it." },
        { lead: "Set the two fingerprints side by side", text: "All 16 characters match, so R-1 stays as it is." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    // R-2, the second row: R-1's fingerprint agrees (the example card), and R-2 is the first that has to change.
    rowAnswer(firstItem("R-2, worked", "R-2 is the first row whose fingerprint does not match.", "SHA-256 of the file sent", 2, () => valIs("SHA-256 of the file sent", 2, "76ac8c53ceabc014"), "Check R-2's SHA-256", EVLIB_WINDOW), [
      { lead: "Read which file R-2 sent, in its row", text: "EV-6071." },
      { lead: "Find EV-6071's own row in the index", text: "Its SHA-256 is 76ac8c53ceabc014. The row here holds 3f7d3dc3d656947d: the fingerprint of EV-7170, the other file of the same control." },
      { lead: "Type **76ac8c53ceabc014** over it", text: "All 16 characters. Next unlocks once it is typed." },
    ], () => cellAt(EVLIB_WINDOW, "EV-6071", "SHA-256")),
    checkAnswers("Then the other five, the same way: leave a fingerprint that matches. Check my answers then shows each answer and why, and records the time sent. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.2-5": [
    {
      title: "The follow-up requests",
      icon: "table",
      body: "The auditor's follow-up requests ask for the ISMS's own records; the analyst knows which record answers which clause. Each row is one follow-up request.",
      steps: [
        { lead: "Your hand-ins", text: "Most records: **Policies › Version History**." },
        { lead: "The Group GRC Office's own", text: "In the repository: **Evidence › Evidence Library**." },
      ],
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("policies", "Policies", "Version History", "Your hand-ins, tagged with this step.", VH_WINDOW),
    {
      title: "Your hand-ins",
      icon: "book",
      body: "One row per deliverable you handed in, by code and name, with its task.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers your table." },
      ],
      getEl: () => $(VH_WINDOW),
    },
    {
      title: "An example",
      icon: "info",
      body: "A request asks for the record of each personal-data processing activity: the **RoPA entry** of T10.1 is that record.",
      getEl: () => $('[data-guide="register"]'),
    },
    rowAnswer(firstItem("R-9, worked", "R-9 is the first follow-up request.", "Answer with (record)", 1, () => selIs("Answer with (record)", 1, "LI-RAM"), "Choose R-9's deliverable", VH_WINDOW), [
      { lead: "Read what R-9 asks for", text: "Clause 6.1.2: the risk assessment process, \"the criteria risks are assessed against\"." },
      { lead: "Ask which of your hand-ins sets criteria", text: "LI-RAM, the risk assessment method card of T7.2: the scales, the appetite and who accepts each rating. RR-UPD and RSK-TOP5 hold risks already assessed: results, not criteria." },
      { lead: "Choose **LI-RAM**", text: "Next unlocks once it is chosen." },
    ], () => rowIn(VH_WINDOW, "LI-RAM"), [{ kind: "note", text: "Check whose record each one is: this audit covers GlobalConnect's ISMS only." }]),
    checkAnswers("Then R-10 to R-12, the same way. Check my answers then shows each request's answer and why. Your rows lock then, so check them first."),
    finish("**Mark step complete** unlocks once your answers are checked. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.2-6": [
    {
      title: "R-3's owner",
      icon: "table",
      body: "Your answer is in. Part 2: an action goes to the role that **runs the control**, because that role holds its records. The row is the action raised for R-3.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openLib(6, "Charter", "The BKB Group GRC Charter", CHARTER_WINDOW),
    {
      title: "The RACI",
      icon: "book",
      body: "**Section 16**: a row per process, a column per role; the legend under the table gives each column's full role. **R** marks the role that does the work.",
      getEl: () => $(CHARTER_WINDOW),
      onEnter: () => $(`${CHARTER_WINDOW} [data-sec="16"]`)?.scrollIntoView({ block: "start" }),
    },
    rowAnswer(firstItem("A-23, worked", "This step has one row, so its answer is worked here in full. A-23 is for R-3: A.6.3, awareness training completion records.", "Owner (GRC Charter Section 16)", 1, () => selIs("Owner (GRC Charter Section 16)", 1, "Security Awareness & Training Specialist"), "Choose A-23's owner", CHARTER_WINDOW), [
      { lead: "Find the control's process in Section 16", text: "Training completion belongs to the row **Awareness & training**." },
      { lead: "Find the R in that row", text: "It is far to the right, under **Awr**: scroll the table sideways. The legend under the table gives Awr as the Security Awareness & Training Specialist." },
      { lead: "Choose **Security Awareness & Training Specialist**", text: "The CISO has the A: accountable, but not the role that holds the records. Next unlocks once it is chosen." },
    ], () => rowIn(CHARTER_WINDOW, "Awareness & training")),
    checkAnswers("Check my answers then shows the answer and why. The row locks then, so check it first."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  "T12.2-7": [
    {
      title: "Answer the finding",
      icon: "table",
      body: "A finding is answered from the evidence it names: the auditee reads that file before deciding to **accept** or **challenge**. The note gives NC-1 and its file.",
      getEl: () => $('[data-guide="step-note"]') ?? $('[data-guide="register"]'),
    },
    ...openScreen("evidence", "Evidence", "Evidence Library", "The repository's index, tagged with this step.", EVLIB_WINDOW),
    {
      title: "The file NC-1 names",
      icon: "book",
      body: "Find the file the note names in the **File** column, and read its row to the last column.",
      tips: [
        { kind: "note", text: "Drag the window aside if it covers your table." },
      ],
      getEl: () => $(EVLIB_WINDOW),
    },
    rowAnswer(firstItem("The response, worked", "**Response (R34)** is the first of your two entries. NC-1 names the file EV-7148.", "Entry", 5, () => selIs("Entry", 5, "Accept and commit to corrective action"), "Choose the response", EVLIB_WINDOW), [
      { lead: "Find EV-7148 in the index, and read its **Result**", text: "\"3 of 25 samples fail\": a system export dated 2026-11-11, inside the period." },
      { lead: "Apply R34, in the note", text: "The file shows the problem, so the finding is accepted and the corrective action stated. A file showing the control worked would be a challenge." },
      { lead: "Choose **Accept and commit to corrective action**", text: "Next unlocks once it is chosen." },
    ], () => cellAt(EVLIB_WINDOW, "EV-7148", "Result")),
    ...openPage(7, "Ref-Actions"),
    {
      title: "Ref-Actions",
      icon: "book",
      body: "**Exception / deviation** names what went wrong; **Action**, **Owner** and **Due** say what fixes it. Find the row that fits what the file shows.",
      getEl: () => $(PAGE_WINDOW("Ref-Actions")),
    },
    checkAnswers("Choose the corrective action. Check my answers then shows each answer and why. Your rows lock then, so check them first."),
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  "T12.2-8": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "These two files are what the Compliance Manager keeps of the audit.",
      steps: [
        { lead: "AUD-LOG", text: "The auditor request log: what each request was answered with, its SHA-256, when it was sent, and the action raised." },
        { lead: "AUD-NCR", text: "GlobalConnect's response to NC-1." },
      ],
      tips: [
        { kind: "note", text: "This step checks both, names them and submits them." },
      ],
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above each sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while any count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    {
      title: "A message has arrived",
      icon: "inbox",
      body: "At work, colleagues interrupt you mid-task. A message for this step is in your **Inbox** on the toolbar.",
      steps: [
        { lead: "Open the Inbox and read the message" },
        { lead: "Choose your reply", text: "You then see whether it was the best reply, and why." },
      ],
      tips: [
        { kind: "note", text: "**Mark step complete** stays locked until you have replied." },
      ],
      getEl: () => $('[data-guide="message-notice"]') ?? $('[data-guide-section="inbox"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 7").map((c) => (c.title === "Name the file" ? { ...c, title: "Name the files", body: "Type the four parts listed under each box, in order, joined by underscores, then the extension the box names." } : c)),
  ],

  "T12.2-10": [
    {
      title: "The evidence row",
      icon: "table",
      body: "The auditee reads the auditor's evidence before the response cites it: is it the period's record, from a system, and what does it show? The step names the file; the table is the index.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "The first question yourself",
      icon: "edit",
      body: "Question 1:",
      steps: [
        { lead: "Find the file in the File column" },
        { lead: "Click the cell in its row that shows the problem", text: "Next unlocks once it is right." },
      ],
      getEl: () => $('[data-guide="register"] table'),
      pointAt: () => $('[data-guide="register"] thead th'),
      nextWhen: () => !!$('[data-guide="study"] [data-found="shows"]'),
      doIt: "Click the cell the question asks for",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two the same way, in the same row.",
      tips: [
        { kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." },
      ],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are answered. The next step is a question, so the desk takes you back to the step list."),
  ],

  "T12.2-12": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "This is the response filed with the certification body beside the finding. **LI-NCR-R** is the clause-based response to NC-1, written from your steps 7, 9, 10 and 11: the requirement, the evidence row, the response and the route if it is disputed. This step checks it, names the file and submits it.",
      getEl: () => $('[data-guide="register"]'),
    },
    {
      title: "No empty cells",
      icon: "check",
      body: "Any empty cell is marked amber, and the line above the sheet counts them.",
      tips: [
        { kind: "avoid", text: "submitting while the count is above zero." },
      ],
      getEl: () => $('[data-guide="empty-check"]'),
    },
    ...nameAndSubmit("docx", "9 to 11"),
  ],
};

/**
 * Every decision guide, once: its question can be answered at any card that lights it (the first card lights the
 * whole question, and the hole stays live), or before the guide runs at all (Show me how on an answered step).
 * - Each card from the second up to and including "Pick and check" leads to the answer (open the source, read it, pick): once the
 *   answer is checked they pass by, rather than send the learner to read for a choice that is locked.
 * - "Finish here" passes by once the step is complete (its button is gone; the card pointed at nothing).
 * Checked is the question's lock (its fieldset disabled), not its feedback, which arrives a moment later.
 */
const PICK_DOIT = "Pick an option and click Check my answer";
for (const [k, cards] of Object.entries(STEP_GUIDES)) {
  const at = cards.findIndex((c) => c.doIt === PICK_DOIT);
  if (at < 0) continue;
  const n = k.match(/-(\d+)q?$/)![1];
  const checked = () => !!($(`#act-${n} fieldset[data-guide="decision"]`) as HTMLFieldSetElement | null)?.disabled;
  STEP_GUIDES[k] = cards.map((c, i) => {
    if (i === at) return { ...c, skip: checked };
    if (i > 0 && i < at) return { ...c, skip: () => checked() || !!c.skip?.() };
    if (i > at && c.title === "Finish here") return { ...c, skip: () => !$(`#act-${n} [data-guide="step-complete"]`) };
    return c;
  });
}

// Each acronym spelled out at its first use in a step's guide (lib/desk/acronyms.ts). Corrections item 119.
expandGuides(STEP_GUIDES);
// In the learner's organisation names (lib/desk/names.ts).
localizable(STEP_GUIDES);

/**
 * A step's guide with its first card saying what the learner does in the step and what counts as done, from the
 * step's own title and outcome (testing team, 23 Nov 2026: a guide opened on background and never said what to do).
 * Cached: the tour takes the array's identity as the guide's.
 */
const BRIEFED = new Map<string, TourStep[]>();
export function guideFor(key: string, step?: { t: string; o: string }): TourStep[] | undefined {
  const g0 = STEP_GUIDES[key];
  if (!g0?.length || !step) return g0;
  if (!BRIEFED.has(key)) {
    const g = [...g0];
    // A step of click-a-cell questions: the first is worked on the card that waits for it (owner, 23 Nov 2026).
    const m = key.match(/^([A-Z]\d+\.\d+)-(\d+)$/);
    const q = m ? STUDY[m[1]]?.[Number(m[2])]?.[0] : undefined;
    const reg = m && q && q.col >= 0 ? regOf(m[1], Number(m[2])) : undefined;
    const row = reg && q ? reg.rows.find((r) => !q.row || q.row(r)) : undefined;
    const at = q && row ? g.findIndex((c) => !!c.nextWhen) : -1;
    if (at >= 0 && reg && q && row) {
      const where = q.col === 0 ? `in the **${reg.cols[0].h}** column` : `the **${reg.cols[q.col].h}** cell of the **${row[reg.ident?.[0] ?? 0]}** row`;
      g[at] = { ...g[at], tips: [...(g[at].tips ?? []), { kind: "note" as const, text: `Question 1, worked. The cell to click is **${row[q.col]}**, ${where}. ${q.why} The other questions are yours.` }] };
    }
    const job = { kind: "note" as const, text: `Your job in this step: ${step.t.replace(/[.…]+$/, "")}. It is done when: ${step.o.replace(/\.$/, "")}.` };
    g[0] = { ...g[0], tips: [job, ...(g[0].tips ?? [])] };
    BRIEFED.set(key, g);
  }
  return BRIEFED.get(key);
}
