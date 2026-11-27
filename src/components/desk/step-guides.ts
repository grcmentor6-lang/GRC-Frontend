import type { TourStep } from "@/components/app/guided-tour";
import { localizable } from "@/lib/desk/names";
import { expandGuides } from "@/lib/desk/acronyms";
import { INJ_AT } from "@/lib/desk/inbox";
import { LABS } from "@/lib/desk/labs";
import { SPRINTS, STUDY, duration, regOf } from "@/lib/desk/registers";

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
          { lead: "Click **Check my answer**", text: "A line asks you to confirm: click **Yes, lock my pick**. Part 2 opens once your answer is checked." },
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
      body: "Choose the option you would take, then click **Check my answer**. In weeks 1 to 3 a line then asks you to confirm: click **Yes, lock my pick**.",
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
    // The learner may have opened the menu already: then the click is done.
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
      { lead: "Type the four parts together", text: "Use your own mentee ID. Next unlocks once the name follows the convention." },
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
    title: "Save it to 02_Working",
    icon: "upload",
    body: `Save to 02_Working opens once steps ${steps} are complete.`,
    steps: [
      { lead: "Click **Save to 02_Working**", text: "It saves the file and gives a receipt. Submit task, at the foot of the task, is a different button: it seals the task." },
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



/** Learn's dot, then one of its screens: the two clicks from the toolbar. */
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
const QR_WINDOW = 'section[role="dialog"][aria-label*="Framework Quick Reference"]';
/** On a phone the pick card takes at most half the screen, so the options it asks for show beside it (`low`). */
const lowPick = (g: TourStep[]): TourStep[] => g.map((c) => (c.doIt === "Pick an option and click Check my answer" ? { ...c, low: true } : c));
const finish = (body: string): TourStep => ({ title: "Finish here", icon: "check", body, getEl: () => $('[data-guide="mark-complete"]') });
/** Check my answers under a per-row decision: the verdict, answer and reason per row. */
const checkRowsCard = (body: string): TourStep => ({ title: "Then check your answers", icon: "check", body: `${body} In weeks 1 to 3 a line then asks you to confirm: click **Yes, lock my rows**.`, getEl: () => $('[data-guide="check-rows"]') ?? $('[data-guide="row-result"]') });

// F1.2's map, LI-FAM, and its sheet PDCA (registers.ts). A cell's row counts the worked rows too: ISO/IEC 27001 is row 4.
const FAM = '[data-guide="register"][data-reg="LI-FAM"]';
const PDCA = '[data-guide="register"][data-reg="PDCA"]';
const USE = "E Where this programme uses it";
const famCell = (col: string, row: number) => $(`${FAM} [aria-label="${col}, row ${row}"]`);
const famStudy = (col: string, doc: string) => $(`${FAM} button[aria-label^="${col}, ${doc}:"]`);
const pdcaCell = (row: number) => $(`${PDCA} [aria-label="PDCA phase (L02), row ${row}"]`);

// F1.3's sheets, CTX-ISS (template T-LI-CTX) and CTX-IP (registers.ts). A cell's row counts the worked rows too: the
// four external issues are rows 4–7, dataset CTX-ISS-6 rows 8–13, the climate row 14.
const ISS = '[data-guide="register"][data-reg="CTX-ISS"]';
const IP = '[data-guide="register"][data-reg="CTX-IP"]';
const issCell = (col: string, row: number) => $(`${ISS} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLTextAreaElement | null;
const ipCell = (col: string, row: number) => $(`${IP} [aria-label="${col}, row ${row}"]`) as HTMLInputElement | HTMLSelectElement | null;
const issStudy = (col: string, issue: string) => $(`${ISS} button[aria-label^="${col}, ${issue}"]`);
const EFFECT = "D Effect on the ISMS's intended outcomes";
const sentence = (el: { value: string } | null, n = 6) => (el?.value.trim().split(/\s+/).filter(Boolean).length ?? 0) >= n;
/** In, and not flagged by the cell's own check. */
const cellIn = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true";
/** Part 1's Quick Reference has been read: it closes as part 2 starts, so it never sits over the table. */
const closeQR = () => $(`${QR_WINDOW} button[aria-label^="Close"]`)?.click();
const docWindow = (id: string) => `section[role="dialog"][aria-label^="${id}"]`;
/** On a phone a document window covers the table: the card that reads it lights the window, and the card that fills the
 *  row closes it (it can be opened again from Policies › Policy Library). */
const phone = () => innerWidth <= 700;
const shutDoc = (id: string) => { if (phone()) $(`${docWindow(id)} button[aria-label^="Close"]`)?.click(); };
const REOPEN = { kind: "note" as const, text: "On a phone the document closes here so the table shows. Open it again from **Policies › Policy Library** when you need it." };
/** Policies' dot, its Policy Library, then the cited document: three clicks from the toolbar. */
const openDoc = (id: string, then: string): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: "**Policies** carries the dot: the Policy Library is in its menu. Click **Policies**.",
    getEl: () => $('[data-guide-section="policies"]'),
    waitFor: () => !!$('[data-guide-menu="policies"]'),
    skip: () => !!$('[data-guide-menu="policies"]') || !!$('[data-guide="policy-library"]') || !!$(docWindow(id)),
    doIt: "Click Policies",
  },
  {
    title: "Open Policy Library",
    icon: "grid",
    body: "Click **Policy Library**.",
    getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="policies"] li button')].find((b) => b.innerText.includes("Policy Library")) ?? null,
    waitFor: () => !!$('[data-guide="policy-library"]'),
    skip: () => !!$('[data-guide="policy-library"]') || !!$(docWindow(id)),
    doIt: "Click Policy Library",
  },
  {
    title: `Open ${id}`,
    icon: "book",
    body: `Click **${id}**: it carries this step's tag. ${then}`,
    getEl: () => $(`[data-guide="policy-library"] [data-doc="${id}"]`),
    waitFor: () => !!$(docWindow(id)),
    skip: () => !!$(docWindow(id)),
    doIt: `Click ${id}`,
  },
];
/** A question in its row answered from a Learn › Framework Quick Reference entry, then its part 2 in the template. */
const askFromQR = (n: number, question: string, term: string, read: string, partTwo: string): TourStep[] => {
  const row = (sel: string) => $(`#act-${n} ${sel}`);
  return [
    {
      title: "A question first",
      icon: "help",
      body: `This step has two parts. Part 1 is ${question}`,
      steps: [{ lead: "Read the situation box" }, { lead: "Then read all three options" }],
      tips: [{ kind: "unsure", text: "The answer is in **Learn › Framework Quick Reference**. The next cards take you there." }],
      getEl: () => row('[data-guide="decision"]'),
    },
    ...openLearn("Framework Quick Reference", "Click **Framework Quick Reference**. It carries the orange dot.", QR_WINDOW),
    {
      title: term.replace("ISO/IEC 27001 ", ""),
      icon: "book",
      body: read,
      getEl: () => $(`${QR_WINDOW} [data-term="${term}"]`) ?? $(QR_WINDOW),
      onEnter: () => $(`${QR_WINDOW} [data-term="${term}"]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**. In weeks 1 to 3 a line then asks you to confirm: click **Yes, lock my pick**.",
      tips: [{ kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." }],
      getEl: () => row('[data-guide="decision"]'),
      // On a phone the Quick Reference sits over the options: it has been read, so it closes here.
      onEnter: () => { if (innerWidth <= 700) $(`${QR_WINDOW} button[aria-label^="Close"]`)?.click(); },
      pointAt: () => row('[data-guide="decision-context"]'),
      nextWhen: () => !!row('[data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
      low: true,
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
    {
      title: "Then part 2",
      icon: "table",
      body: `${partTwo} Click **Open New from Template** to do it.`,
      getEl: () => [...document.querySelectorAll<HTMLElement>(`#act-${n} button`)].find((b) => /^Open /.test(b.innerText.trim())) ?? null,
    },
    { title: "Replay any time", icon: "play", body: "Click **▶ Show me how** to run this guide again.", getEl: () => row('[data-guide="show-me-how"]') },
  ];
};

/** A question in its row answered from a Quick Reference entry, with no part 2 (F2.1 step 2): askFromQR's cards, the
 *  part 2 card replaced by the step's own Mark complete. */
const askOnlyFromQR = (n: number, question: string, term: string, read: string): TourStep[] =>
  askFromQR(n, question, term, read, "").flatMap((c, i) =>
    i === 0 ? [{ ...c, body: `This step is a question: ${question}` }]
      : c.title === "Then part 2" ? [{ title: "Finish here", icon: "check", body: "Click **Mark step complete**.", getEl: () => $(`#act-${n} [data-guide="step-complete"]`) }]
      : [c]);

// F2.1's sheets: LI-SCOPE (sections 1–5), PROC (section 6) and IFACE (section 7), registers.ts. A cell's row counts the
// worked rows too: LearnTech's scope is rows 1–7, so Manila's lines are rows 8–12 and its exclusions row 13.
const SCOPE = '[data-guide="register"][data-reg="LI-SCOPE"]';
const PROC = '[data-guide="register"][data-reg="PROC"]';
const IFACE = '[data-guide="register"][data-reg="IFACE"]';
const scopeCell = (col: string, row: number) => $(`${SCOPE} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const procCell = (col: string, row: number) => $(`${PROC} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const ifCell = (col: string, row: number) => $(`${IFACE} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const pageWindow = (id: string) => `section[role="dialog"][aria-label="${id}"]`;
/** Learn's dot, its Reference pages, then the cited page: three clicks from the toolbar. */
const openPage = (id: string, then: string): TourStep[] => [
  ...openLearn("Reference pages", "Click **Reference pages**. It carries the orange dot.", '[data-guide="reference-pages"]').map((c) => ({ ...c, skip: () => !!c.skip?.() || !!$('[data-guide="reference-pages"]') || !!$(pageWindow(id)) })),
  {
    title: `Open ${id}`,
    icon: "table",
    body: `Click **${id}**: it carries this step's tag. ${then}`,
    getEl: () => $(`[data-guide="reference-pages"] [data-page="${id}"]`),
    waitFor: () => !!$(pageWindow(id)),
    skip: () => !!$(pageWindow(id)),
    doIt: `Click ${id}`,
  },
];
const shutPage = (id: string) => { if (phone()) $(`${pageWindow(id)} button[aria-label^="Close"]`)?.click(); };

// F2.2's sheets: Gap (LI-GAP, template T-LI-PLAN) and Plan, registers.ts. A cell's row counts the worked rows too: 4.1 and
// 4.2 are rows 1–2, so 7.3 Awareness is row 15.
const GAP = '[data-guide="register"][data-reg="LI-GAP"]';
const PLAN = '[data-guide="register"][data-reg="PLAN"]';
const gapCell = (col: string, row: number) => $(`${GAP} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const planCell = (col: string, row: number) => $(`${PLAN} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLInputElement | null;
/** A worked row's cell as a click-the-cell question shows it: its row found by the clause (the button names column B). */
const gapStudy = (col: string, clause: string) => [...document.querySelectorAll<HTMLElement>(`${GAP} tbody tr`)].find((tr) => tr.innerText.trim().startsWith(`${clause} `))?.querySelector<HTMLElement>(`button[aria-label^="${col},"]`) ?? null;
const MM = "Ref-Maturity Model";
/** A question in its row answered from a Learn › Reference page (F2.2 step 4), with no part 2: openPage's cards, the page
 *  read, then askFromQR's pick, feedback and Mark complete. */
const askOnlyFromPage = (n: number, question: string, id: string, read: string): TourStep[] => {
  const qr = askOnlyFromQR(n, question, "", read);
  const pick = qr.findIndex((c) => c.title === "Pick and check");
  return [
    { ...qr[0], tips: [{ kind: "unsure", text: `The answer is in **${id}**, in Learn › Reference pages. The next cards take you there.` }] },
    ...openPage(id, "It opens beside the step."),
    { title: id.replace("Ref-", ""), icon: "book", body: read, getEl: () => $(pageWindow(id)) },
    { ...qr[pick], onEnter: () => shutPage(id) },
    ...qr.slice(pick + 1),
  ];
};
/** A question in its row whose part 2 is worked in the step's screen (F2.2 step 5): the question, its feedback, then the
 *  button that opens the screen. No source to open: the situation and the step's work so far hold what it is decided on. */
const askThenScreen = (n: number, question: string, partTwo: string, screen: string): TourStep[] =>
  askFromQR(n, question, "", "", partTwo)
    .filter((c) => !["Follow the orange dot", "Open Framework Quick Reference", ""].includes(c.title))
    .map((c, i) => (i === 0 ? { ...c, tips: [] } : c.title === "Then part 2" ? { ...c, body: `${partTwo} Click **Open ${screen}** to do it.` } : c));

// T3.1's sheets of T-LI-POL (registers.ts): Policy check (LI-POL, items a)–g) in rows 1–7), Leadership (LEAD, eight rows)
// and Policy set (POL-SET, the twelve topics; Backup is row 8).
const LIPOL = '[data-guide="register"][data-reg="LI-POL"]';
const LEADS = '[data-guide="register"][data-reg="LEAD"]';
const PSET = '[data-guide="register"][data-reg="POL-SET"]';
const polCell = (col: string, row: number) => $(`${LIPOL} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const leadCell = (col: string, row: number) => $(`${LEADS} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const setCell = (col: string, row: number) => $(`${PSET} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
/** An item's cell as a click-the-cell question shows it, its row found by the item's letter. */
const polStudy = (letter: string) => [...document.querySelectorAll<HTMLElement>(`${LIPOL} tbody tr`)].find((tr) => tr.innerText.trim().startsWith(`${letter})`))?.querySelector<HTMLElement>("button") ?? null;
const PORTAL = "Ref-Policy portal";
const LEAD_COL = "Top management commitment (Clause 5.1)?";
/** A question in its row answered from a section of a Policy Library document (T3.1 step 3), with no part 2: openDoc's
 *  cards, the section read, then askFromQR's pick, feedback and Mark complete. */
const askOnlyFromDoc = (n: number, question: string, id: string, sec: string, read: string): TourStep[] => {
  const qr = askOnlyFromQR(n, question, "", read);
  const pick = qr.findIndex((c) => c.title === "Pick and check");
  const at = () => $(`${docWindow(id)} section[data-sec="${sec}"]`);
  return [
    { ...qr[0], tips: [{ kind: "unsure", text: `The answer is in **${id} Section ${sec}**, in Policies › Policy Library. The next cards take you there.` }] },
    ...openDoc(id, "It opens beside the step."),
    { title: `Section ${sec}`, icon: "book", body: read, getEl: () => at() ?? $(docWindow(id)), onEnter: () => at()?.scrollIntoView({ block: "start" }) },
    { ...qr[pick], onEnter: () => shutDoc(id) },
    ...qr.slice(pick + 1),
  ];
};

// T3.2's sheets (registers.ts): LI-RACI (the ten processes, Policy management is row 3), its header RACI-HEAD (a) and b)),
// and the sprint's two: the tracker CIT-S1 (citRegister: the LearnTech worked row is row 1, A.5.1–A.5.4 rows 2–5) and the
// evidence packs LI-A (packRegister: LI-A.5.2-01 … LI-A.5.3-03, rows 1–6). The later sprints reuse sprintCell and sprintStudy.
const RACI = '[data-guide="register"][data-reg="LI-RACI"]';
const HEADR = '[data-guide="register"][data-reg="RACI-HEAD"]';
const PACKR = '[data-guide="register"][data-reg="LI-A"]';
const citSel = (sprint: number) => `[data-guide="register"][data-reg="CIT-S${sprint}"]`;
const raciCell = (col: string, row: number) => $(`${RACI} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const headCell = (col: string, row: number) => $(`${HEADR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const packCell = (col: string, row: number) => $(`${PACKR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLTextAreaElement | null;
const sprintCell = (sprint: number, col: string, row: number) => $(`${citSel(sprint)} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
/** A tracker cell as a click-the-cell question shows it (its button names column A, the control). */
const sprintStudy = (sprint: number, col: string, control: string) => $(`${citSel(sprint)} button[aria-label^="${col}, ${control}:"]`);
const EVREF = "Evidence ref (file in 02_Working)";

// T4.2's sheets (registers.ts): LI-CHAIN (the LearnTech worked chain is row 1; the VPN gateway, client transaction data and the
// call-centre workstations rows 2–4) and RR-UPD (R-16-HQ-16 … 18, rows 1–3). Its tracker CIT-S3 follows the earlier sprints'
// rows, so a control's row is looked up, not counted.
const CHAIN = '[data-guide="register"][data-reg="LI-CHAIN"]';
const RRU = '[data-guide="register"][data-reg="RR-UPD"]';
const DRAFTSR = '[data-guide="register"][data-reg="DRAFTS"]';
const draftCell = (row: number) => $(`${DRAFTSR} [aria-label="Risk statement (R06), row ${row}"]`) as HTMLSelectElement | null;
const chainCell = (col: string, row: number) => $(`${CHAIN} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const chainStudy = (col: string, asset: string) => $(`${CHAIN} button[aria-label^="${col}, ${asset}:"]`);
const rrCell = (col: string, row: number) => $(`${RRU} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
/** A control's row in a sprint's tracker, 1-based, as the cells' labels count it (the worked row and earlier sprints first). */
const citRow = (task: string, n: number, control: string) => (regOf(task, n)?.rows.findIndex((r) => r[1] === control) ?? -2) + 1;
// T9.2: sheet VUL-TEST (40 findings, VUL-0007 is row 1) and sprint 11's rows of the tracker, found from the end: the worked row
// is A.8.13 too. The deep dives' packs: LI-A.8.8-01 is row 1.
const VULR = '[data-guide="register"][data-reg="VUL-TEST"]';
const vulCell = (col: string, row: number) => $(`${VULR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLInputElement | null;
const c92Row = (control: string) => { const rs = regOf("T9.2", 4)?.rows ?? []; for (let i = rs.length - 1; i > 0; i--) if (rs[i][1] === control) return i + 1; return 0; };
const c92 = (col: string, control: string) => sprintCell(11, col, c92Row(control));
const c92Study = (col: string, control: string) => [...document.querySelectorAll<HTMLElement>(`${citSel(11)} button[aria-label^="${col}, ${control}:"]`)].pop() ?? null;
const cit42 = (col: string, control: string, n: number) => sprintCell(3, col, citRow("T4.2", n, control));
// T8.2's sheets: BIA-RTO (row 1 is LearnTech's), OBL-REG with the ROPA rows under it (rows 11–14), and sprint 9 of the tracker.
const BIA = '[data-guide="register"][data-reg="BIA-RTO"]';
const OBLR = '[data-guide="register"][data-reg="OBL-REG"]';
const OBL_COL = "Obligation, or the RoPA field's value";
const biaCell = (col: string, row: number) => $(`${BIA} [aria-label="${col}, row ${row}"]`) as HTMLInputElement | HTMLSelectElement | null;
const oblCell = (col: string, row: number) => $(`${OBLR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const c82 = (col: string, control: string) => sprintCell(9, col, citRow("T8.2", 5, control));
const ROPA_WINDOW = 'section[role="dialog"][aria-label^="Regulatory Watch › RoPA & Data Flows"]';
/** Regulatory Watch's dot, then one of its screens, opened beside the step's sheet. */
const openRegwatch = (screen: string, what: string, win: string): TourStep[] => [
  {
    title: "Follow the orange dot",
    icon: "info",
    body: `**Regulatory Watch** carries the dot: ${screen} is in its menu. Click **Regulatory Watch**.`,
    getEl: () => $('[data-guide-section="regwatch"]'),
    waitFor: () => !!$('[data-guide-menu="regwatch"]'),
    skip: () => !!$('[data-guide-menu="regwatch"]') || !!$(win),
    doIt: "Click Regulatory Watch",
  },
  {
    title: `Open ${screen}`,
    icon: "grid",
    body: what,
    getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="regwatch"] li button')].find((b) => b.innerText.includes(screen)) ?? null,
    waitFor: () => !!$(win),
    skip: () => !!$(win),
    doIt: `Click ${screen}`,
  },
];
// T4.1's method card LI-RAM (registers.ts: seven lines, 4 Risk appetite is row 4); its sprint reuses citSel(2) and PACKR.
const RAM = '[data-guide="register"][data-reg="LI-RAM"]';
const ramCell = (col: string, row: number) => $(`${RAM} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;

// T6.1's sheets of T-LI-COMM (registers.ts): Competence (LI-COMM: the LearnTech worked rows are rows 1–2, the ten role holders
// rows 3–12, Jose Reyes row 4) and Communication (COMM, the five messages, rows 1–5); sprint 4's tracker CIT-S4, whose A.6.3 row
// follows every earlier sprint's rows (found by its control, so a sprint added before it moves nothing), and its pack LI-A.
const COMPR = '[data-guide="register"][data-reg="LI-COMM"]';
const COMMR = '[data-guide="register"][data-reg="COMM"]';
const compCell = (col: string, row: number) => $(`${COMPR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const commCell = (col: string, row: number) => $(`${COMMR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const compStudy = (col: string, who: string) => $(`${COMPR} button[aria-label^="${col}, ${who}:"]`);
const row63 = () => (regOf("T6.1", 7)?.rows.findIndex((r) => r[1] === "A.6.3") ?? -1) + 1;
const workedCit = (sprint: number) => $(`${citSel(sprint)} tbody tr[data-row="0"]`);
/** The worked rows fold behind one line on a step that fills the learner's rows: the card waits for the learner to open them. */
const openWorked = (sprint: number, then: () => void = () => {}): TourStep => ({
  title: "Open the worked rows",
  icon: "table",
  body: "The LearnTech worked row is folded under your row. Click **Show the worked rows**.",
  getEl: () => [...document.querySelectorAll<HTMLElement>(`${citSel(sprint)} button`)].find((b) => /^Show the \d+ worked rows/.test(b.innerText.trim())) ?? null,
  onEnter: then,
  waitFor: () => !!workedCit(sprint),
  skip: () => !!workedCit(sprint),
  doIt: "Click Show the worked rows",
});
const STATUS72 = "Status (Clause 7.2)";

// T6.2's sheets of T-LI-DOC (registers.ts): Register (LI-DOC, the ten items; Monitoring and measurement results is row 7) and
// Block (DOC-BLOCK, the seven fields; Document ID is row 1); sprint 5's tracker CIT-S5, whose rows follow every earlier
// sprint's (found by control, as T6.1's), and its pack LI-A (LI-A.6.1-01 … LI-A.6.7-03, rows 1–6).
const LIDOC = '[data-guide="register"][data-reg="LI-DOC"]';
const DBLOCK = '[data-guide="register"][data-reg="DOC-BLOCK"]';
const docCell = (col: string, row: number) => $(`${LIDOC} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const blockCell = (row: number) => $(`${DBLOCK} [aria-label="Value, row ${row}"]`) as HTMLSelectElement | null;
const row62 = (c: string) => (regOf("T6.2", 4)?.rows.findIndex((r) => r[1] === c) ?? -1) + 1;
const KIND = "Kind (Clause 7.5.1)";
const WIKI = "Ref-Wiki backup page";

// T5.1's sheets (registers.ts): LI-RTP (the LearnTech worked rows are rows 1–2, R-16-HQ-16 … 18 rows 3–5) and its sheet
// Controls, CTRL (the six proposed controls, rows 1–6).
const RTP = '[data-guide="register"][data-reg="LI-RTP"]';
const CTRLS = '[data-guide="register"][data-reg="CTRL"]';
const rtpCell = (col: string, row: number) => $(`${RTP} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const ctrlCell = (col: string, row: number) => $(`${CTRLS} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
/** A plan cell as a click-the-cell question shows it (its button names the Risk ID). */
const rtpStudy = (col: string, id: string) => $(`${RTP} button[aria-label^="${col}, ${id}:"]`);
const C613 = "ISO/IEC 27001 Clause 6.1.3";

// T11.1's sheets of T-LI-KPI (registers.ts): Cards (LI-KPI) and Dashboard (KPI-DASH). The LearnTech worked row is row 1,
// so Card 1 is row 2 on both.
const KPIC = '[data-guide="register"][data-reg="LI-KPI"]';
const KPID = '[data-guide="register"][data-reg="KPI-DASH"]';
const kpiCell = (col: string, row: number) => $(`${KPIC} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const dashCell = (col: string, row: number) => $(`${KPID} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
/** A worked-card cell as a click-the-cell question shows it (its button names column B, "Worked card"). */
const kpiStudy = (col: string) => $(`${KPIC} button[aria-label^="${col}, Worked card:"]`);

/** The step's own rows are in place when it opens: the first Obligation cell the learner can type in. */
/* A list where the step's lines are chosen (T3.1 steps 3 and 4), a box where they are typed: both are the cell. Naming
   the box alone left "Fill the first row" locked for good once the cell became a list (owner, 18 Nov 2026). */

// T12.1's sheets (registers.ts): ACT-UPD (ACT-01 … ACT-09, rows 1–9), LI-MR's Inputs (a) worked in row 1, so b) is row 2),
// its Readiness (one row), and L4-ROAD (the LearnTech worked row is row 1, then A.5.2, A.5.3, A.5.18, A.5.22, A.8.8).
const ACTU = '[data-guide="register"][data-reg="ACT-UPD"]';
const MRI = '[data-guide="register"][data-reg="LI-MR"]';
const MRR = '[data-guide="register"][data-reg="LI-MR-READY"]';
const ROADR = '[data-guide="register"][data-reg="L4-ROAD"]';
const regCell = (sel: string) => (col: string, row: number) => $(`${sel} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLInputElement | null;
const actCell = regCell(ACTU), mrCell = regCell(MRI), readyCell = regCell(MRR), roadCell = regCell(ROADR);
const REVIEW_PACK = "Ref-Review pack";

/**
 * Whether a step's guide starts by itself the first time the step is opened: an Activity step's does (owner,
 * 16 Nov 2026: "in the activity type it should open the guide by default for the first time as before"), and the
 * toolbar's menu waits until that guide has been through. A Decision's guide ("<task>-<n>" of a pick step, or its
 * question's "<task>-<n>q") and a Tech Lab's run from "Show me how" alone.
 */
// T7.2's sheets (registers.ts): VEN-TIER (three suppliers; VeriPass is row 2), VEN-CL (three suppliers × eight clauses;
// Deskline Cloud's are rows 1–8, its incident notification row 3), LI-CLD (the service model is row 1) and sprint 7's tracker,
// whose rows are found by control: the earlier sprints' rows come before them and grow as those sprints are built.
const VENT = '[data-guide="register"][data-reg="VEN-TIER"]';
const VENCL = '[data-guide="register"][data-reg="VEN-CL"]';
const CLDR = '[data-guide="register"][data-reg="LI-CLD"]';
const ventCell = (col: string, row: number) => $(`${VENT} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const venclCell = (col: string, row: number) => $(`${VENCL} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const cldCell = (col: string, row: number) => $(`${CLDR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
/** The tracker row (1-based, as the cells' labels count) of a control. */
const citRowOf = (sprint: number, control: string) => {
  const tr = [...document.querySelectorAll<HTMLElement>(`${citSel(sprint)} tbody tr[data-row]`)].find((r) => [...r.children].some((td) => (td as HTMLElement).innerText?.trim() === control));
  return tr ? Number(tr.getAttribute("data-row")) + 1 : 0;
};
const s7Cell = (col: string, control: string) => sprintCell(7, col, citRowOf(7, control));

// T9.1's sheets (registers.ts): Floor plan (PHY-PLAN, the plan's points; Z7 Server room is row 8) and Photos (PHY-WALK, P01–P20
// in rows 1–20), the floor plan drawn above them (phy-plan.tsx), and the sprint-10 tracker and packs. The tracker's rows hold every
// earlier sprint's controls, whose count grows as sprints are built, so a control's row is counted, not fixed.
const PLANR = '[data-guide="register"][data-reg="PHY-PLAN"]';
const WALKR = '[data-guide="register"][data-reg="PHY-WALK"]';
const planCell9 = (col: string, row: number) => $(`${PLANR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const walkCell = (col: string, row: number) => $(`${WALKR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLTextAreaElement | null;
/** A control's row in sprint 10's tracker: the worked row is row 1, then every sprint's controls up to sprint 10, in sprint order. */
const row10 = (c: string) => [...SPRINTS].sort((a, b) => a.n - b.n).filter((x) => x.n <= 10).flatMap((x) => x.controls).indexOf(c) + 2;

// T10.1's sheets of T-LI-CFG (registers.ts): CFG-BASE (CFG-01 … CFG-12 in rows 1–12) and Crypto (CRY-REG, K-01 … K-06 in rows
// 1–6), and the sprint-12 tracker, whose rows are counted as sprint 10's are.
const CFGR = '[data-guide="register"][data-reg="CFG-BASE"]';
const CRYR = '[data-guide="register"][data-reg="CRY-REG"]';
const cfgCell = (col: string, row: number) => $(`${CFGR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const cryCell = (col: string, row: number) => $(`${CRYR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLInputElement | null;
const row12 = (c: string) => [...SPRINTS].sort((a, b) => a.n - b.n).filter((x) => x.n <= 12).flatMap((x) => x.controls).indexOf(c) + 2;
const s12Cell = (col: string, c: string) => sprintCell(12, col, row12(c));
const ASM = "TSA-16 Asset_System_Map";

export const autoGuide =(desk: { tasks: Record<string, { steps: { kind: string }[] }> }, key: string) => {
  const m = key.match(/^(.+)-(\d+)$/);
  return !!m && desk.tasks[m[1]]?.steps[Number(m[2]) - 1]?.kind === "do";
};

// T11.2's sheets (registers.ts): LI-AUD (the LearnTech worked audit is row 1, IA-01 … IA-23 rows 2–24, so IA-05 is row 6),
// RV-SET (the worked card is row 1, RV-01 … RV-09 rows 2–10, so RV-03 is row 4) and LI-NCR (worked row 1, NC-1 row 2, NC-2 row 3).
const LIAUD = '[data-guide="register"][data-reg="LI-AUD"]';
const RVSET = '[data-guide="register"][data-reg="RV-SET"]';
const LINCR = '[data-guide="register"][data-reg="LI-NCR"]';
const audCell = (col: string, row: number) => $(`${LIAUD} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
const rvCell = (col: string, row: number) => $(`${RVSET} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLTextAreaElement | null;
const ncrCell = (col: string, row: number) => $(`${LINCR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLTextAreaElement | null;
const RVQ = "RV-Q fixed questions";

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
      body: "Click **Check my answers**. Each row then says whether it was right; a row still wrong is flagged with where to read it. A line then asks you to confirm: click **Yes, lock my answers**.",
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
  "F1.1-2": [
    // The first Read first card the learner meets (UX101 W9, integration B): what it is, before the situation and options.
    {
      title: "Read first",
      icon: "book",
      body: "Above the options, **Read first** names the rule or document section this question tests. It never says what the rule requires: you open it and read.",
      steps: [
        { lead: "Click the source", text: "It opens in its own window beside the step, at the part to read." },
        { lead: "Then come back and choose", text: "On a step that is not a decision, the same card is headed **Sources for this step**." },
      ],
      tips: [{ kind: "note", text: "Stuck? The **?** on the step has three **Hints**, one at a time, none giving the answer." }],
      getEl: () => $("#act-2 [data-guide=\"read-first\"]"),
    },
    ...decideInRow(2, "a question about your account.", [], "This button unlocks once you have checked your answer."),
  ],

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
      body: "Click **Check my answers**. Each date then says whether it was right; one still wrong is flagged with where to read it. A line then asks you to confirm: click **Yes, lock my answers**.",
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

  // GRC 101 was rebuilt to the Lead Implementer workbook (docs/li101): the guides of F1.2 … T12.2 went with their old steps.
  // Phase 2 writes each task's new ones.

  // F1.2 step 1: finding the three parts of a finished row in the two worked rows (general ISO facts).
  "F1.2-1": [
    {
      title: "Finished rows",
      icon: "table",
      body: "This is template **T-LI-FAM**. These two rows (ISO/IEC 27000 and ISO/IEC 27002:2022) are worked examples; they hold general facts of the standards, not one organisation's. Your ten GlobalConnect Customer Solutions rows must end up looking like them.",
      getEl: () => $(FAM),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right is answered by one cell in these rows. Answer it by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "The first question describes a document by what it is for. Read **column C** to find that row, then click its type in **column B**.",
      onEnter: () => famStudy("B Type (L01)", "ISO/IEC 27002:2022")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => famStudy("B Type (L01)", "ISO/IEC 27002:2022")?.closest("tr") ?? null,
      pointAt: () => famStudy("B Type (L01)", "ISO/IEC 27002:2022"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="B"]'),
      doIt: "Click the ISO/IEC 27002:2022 type in column B",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find the purpose in **column C** and the user in **column D** the same way: the question tells you which row by its type or its purpose.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // F1.2 step 2: each document's type, by rule L01, from what it is for and who uses it. One row worked: ISO/IEC 27001.
  "F1.2-2": [
    {
      title: "Your ten rows",
      icon: "table",
      body: "These are GlobalConnect Customer Solutions' ten documents. For each one you choose its type in **column B**.",
      steps: [
        { lead: "Read columns C and D", text: "They say what the document is for and who uses it. That is what you decide from." },
        { lead: "The worked rows are folded away", text: "Show them with the line under the table if you want to look again." },
      ],
      getEl: () => $(FAM),
    },
    {
      title: "Rule L01",
      icon: "book",
      body: "The note on the right is rule **L01**. It names the four types and says what makes each one.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **ISO/IEC 27001:2022 + Amd 1:2024**.",
      steps: [
        { lead: "Column C", text: "Requirements to establish, implement, maintain and improve an ISMS." },
        { lead: "Column D", text: "The organisation running the ISMS, and the certification body that audits it." },
        { lead: "Hold it against L01", text: "Requirements an organisation's management system shall meet, which a certification body certifies against: **Requirements standard (certifiable)**." },
      ],
      onEnter: () => famCell("B Type (L01)", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => famCell("B Type (L01)", 4)?.closest("tr") ?? null,
    },
    {
      title: "Choose it",
      icon: "edit",
      body: "Choose **Requirements standard (certifiable)** in column B of that row. Next unlocks once it is chosen.",
      onEnter: () => famCell("B Type (L01)", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => famCell("B Type (L01)", 4)?.closest("td") ?? null,
      nextWhen: () => (famCell("B Type (L01)", 4) as HTMLSelectElement | null)?.value === "Requirements standard (certifiable)",
      doIt: "Choose the type for ISO/IEC 27001",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "Do the same for each of the other nine rows.",
      steps: [
        { lead: "Read the row's columns C and D" },
        { lead: "Find the L01 type that fits them" },
        { lead: "Choose it in column B" },
      ],
      tips: [{ kind: "avoid", text: "choosing from the document's number. Two documents from the same family can be of different types." }],
      getEl: () => $(FAM),
    },
    checkRowsCard("Once every row has a type, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F1.2 step 3: a question, answered in its row from the map's column B.
  "F1.2-3": lowPick(decideInRow(3, "which document an organisation can be certified against. The types you gave in step 2 decide it: its View button opens your map again.", [], "This button unlocks once you have checked your answer.")),

  // F1.2 step 4: sheet PDCA, each clause placed by rule L02. One row worked: Clause 4.
  "F1.2-4": [
    {
      title: "Seven clauses",
      icon: "table",
      body: "Sheet **PDCA** of your map lists Clauses 4 to 10 of ISO/IEC 27001:2022 with their titles and, in the last column, what each requires in our own words. For each one you choose its place in the Plan-Do-Check-Act cycle.",
      getEl: () => $(PDCA),
    },
    {
      title: "Rule L02",
      icon: "book",
      body: "The note on the right is rule **L02**. It says what each phase of the cycle does.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Clause 4, Context of the organization**.",
      steps: [
        { lead: "Ask what the clause does", text: "It works out where the ISMS operates: the organisation, its interested parties, its scope." },
        { lead: "Hold it against L02", text: "Understanding where the ISMS operates is part of establishing it: **Plan**." },
      ],
      getEl: () => pdcaCell(1)?.closest("tr") ?? null,
    },
    {
      title: "Choose it",
      icon: "edit",
      body: "Choose **Plan** for Clause 4. Next unlocks once it is chosen.",
      getEl: () => pdcaCell(1)?.closest("td") ?? null,
      nextWhen: () => (pdcaCell(1) as HTMLSelectElement | null)?.value === "Plan",
      doIt: "Choose the phase for Clause 4",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "Do the same for Clauses 5 to 10.",
      steps: [
        { lead: "Read the clause's title and what it requires", text: "The last column. Its entry in Learn › Framework Quick Reference says more." },
        { lead: "Ask what it does", text: "Sets the ISMS up, runs it, checks it, or improves it?" },
        { lead: "Choose the phase L02 gives that" },
      ],
      getEl: () => $(PDCA),
    },
    checkRowsCard("Once every clause has a phase, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F1.2 step 5: a question answered from Clause 6.1.3's summary in Learn › Framework Quick Reference.
  "F1.2-5": [
    {
      title: "A question",
      icon: "help",
      body: "This step is a question: what the organisation must do with the 93 controls of Annex A.",
      steps: [
        { lead: "Read the situation box" },
        { lead: "Then read all three options" },
      ],
      tips: [{ kind: "unsure", text: "What Clause 6.1.3 requires is summarised in **Learn › Framework Quick Reference**. The next cards take you there." }],
      getEl: () => $('#act-5 [data-guide="decision"]'),
    },
    ...openLearn("Framework Quick Reference", "Click **Framework Quick Reference**. It carries the orange dot.", QR_WINDOW),
    {
      title: "Clause 6.1.3",
      icon: "book",
      body: "Read the entry for **ISO/IEC 27001 Clause 6.1.3**: what happens to Annex A in it, and what the Statement of Applicability records. Then hold each of the three options against it.",
      getEl: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 Clause 6.1.3"]`) ?? $(QR_WINDOW),
      onEnter: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 Clause 6.1.3"]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "Pick and check",
      icon: "edit",
      body: "Choose the option you would take, then click **Check my answer**. In weeks 1 to 3 a line then asks you to confirm: click **Yes, lock my pick**.",
      tips: [{ kind: "avoid", text: "checking before you have read every option. Your pick locks once it is checked." }],
      getEl: () => $('#act-5 [data-guide="decision"]'),
      // On a phone the Quick Reference sits over the options: it has been read, so it closes here.
      onEnter: () => { if (innerWidth <= 700) $(`${QR_WINDOW} button[aria-label^="Close"]`)?.click(); },
      pointAt: () => $('#act-5 [data-guide="decision-context"]'),
      nextWhen: () => !!$('#act-5 [data-guide="decision-result"]'),
      doIt: "Pick an option and click Check my answer",
      low: true,
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
    { title: "Finish here", icon: "check", body: "Click **Mark step complete**.", getEl: () => $('#act-5 [data-guide="step-complete"]') },
    { title: "Replay any time", icon: "play", body: "Click **▶ Show me how** to run this guide again.", getEl: () => $('#act-5 [data-guide="show-me-how"]') },
  ],

  // F1.2 step 6, part 1: the question, in its row. Part 2 (column E) opens from the row once it is checked.
  "F1.2-6q": (() => {
    const g = decideInRow(6, "what Amendment 1:2024 to ISO/IEC 27001:2022 added.", [
      {
        title: "Then column E",
        icon: "table",
        body: "Part 2 is column E of your map: where this programme uses each document. Click **Open Framework Library** to fill it.",
        getEl: () => [...document.querySelectorAll<HTMLElement>("#act-6 button")].find((b) => /^Open /.test(b.innerText.trim())) ?? null,
      },
    ], "");
    g[0] = { ...g[0], tips: [{ kind: "unsure", text: "The amendment is summarised in **Learn › Framework Quick Reference**, as Clause 6.1.3 was in step 5." }] };
    return lowPick(g);
  })(),

  // F1.2 step 6, part 2: column E, where the programme uses each document. One row worked: ISO/IEC 27004.
  "F1.2-6": [
    {
      title: "Now column E",
      icon: "table",
      body: "Your answer is in. Part 2 is **column E**: which tasks of this programme use each document.",
      steps: [
        { lead: "Read the row's column C", text: "What the document is for." },
        { lead: "Find the task about that", text: "The choices name tasks by code and title, as **Home › My plan** lists them." },
      ],
      getEl: () => $(FAM),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **ISO/IEC 27004**.",
      steps: [
        { lead: "Column C", text: "How to monitor, measure, analyse and evaluate how the ISMS performs." },
        { lead: "The task about that", text: "**T11.1, Monitoring, measurement and Level 4 measures**: that task builds the measures." },
      ],
      onEnter: () => famCell(USE, 7)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => famCell(USE, 7)?.closest("tr") ?? null,
    },
    {
      title: "Choose it",
      icon: "edit",
      body: "Choose the **T11.1** entry in column E of the ISO/IEC 27004 row. Next unlocks once it is chosen.",
      onEnter: () => famCell(USE, 7)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => famCell(USE, 7)?.closest("td") ?? null,
      nextWhen: () => ((famCell(USE, 7) as HTMLSelectElement | null)?.value ?? "").startsWith("T11.1 "),
      doIt: "Choose T11.1 for ISO/IEC 27004",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "Do the same for the other nine rows.",
      tips: [{ kind: "note", text: "A document used throughout, in every task's work, takes **Every task**." }],
      getEl: () => $(FAM),
    },
    checkRowsCard("Once every row has its tasks, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked. Columns B to E are then complete for step 7's check."),
  ],

  // F1.2 step 7: LI-FAM named and handed in, in its row.
  "F1.2-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "Your map, **LI-FAM**: column B and column E of your ten rows, and sheet PDCA. This step saves it in **02_Working** under its own name and submits it.",
      getEl: () => $('#act-7 [data-guide="jobs"]') ?? $('#act-7 [data-guide="file-name"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6").slice(0, 2),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-7 [data-guide="step-complete"]') },
  ],

  // F1.3 step 1: finding the three parts of a finished row in LearnTech's three worked rows.
  "F1.3-1": [
    {
      title: "Finished rows",
      icon: "table",
      body: "This is template **T-LI-CTX**. These three rows are LearnTech Educational Solutions', filled in as worked examples. Your GlobalConnect Customer Solutions rows must end up looking like them.",
      getEl: () => $(ISS),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right is answered by one cell in these rows. Answer it by clicking that cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "The GDPR and UAVG issue has a worked row. Its category is in **column C**. Click that cell.",
      onEnter: () => issStudy("C Category", "GDPR and the UAVG")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => issStudy("C Category", "GDPR and the UAVG")?.closest("tr") ?? null,
      pointAt: () => issStudy("C Category", "GDPR and the UAVG"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="C"]'),
      doIt: "Click the category of the GDPR and UAVG issue in column C",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find the effect in **column D** and the source in **column E** the same way.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // F1.3 step 2: four external issues for Manila from SITL-ADD-16 Sections 1–2. One row worked: the legal one.
  "F1.3-2": [
    {
      title: "Four rows, four kinds",
      icon: "table",
      body: "These are GlobalConnect Customer Solutions' four external issues. Column C names each row's kind: legal, regulatory, technological, market.",
      steps: [
        { lead: "Column A", text: "Choose the issue of that kind that applies to Manila." },
        { lead: "Column D", text: "Write what it does to what the ISMS must achieve." },
        { lead: "Column E", text: "Choose the section of SITL-ADD-16 you read it in." },
      ],
      getEl: () => $(ISS),
    },
    {
      title: "Where the issues are",
      icon: "book",
      body: "The note on the right says where to read: **SITL-ADD-16 Section 1 and Section 2**, the Manila, Philippines row.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ADD-16", "It opens beside the table."),
    {
      title: "Two sections",
      icon: "search",
      body: "Use **Section 1** and **Section 2** at the top of the document to jump.",
      steps: [
        { lead: "Section 1", text: "Who GlobalConnect is, who its clients are, and (1.1) the services it delivers." },
        { lead: "Section 2", text: "One row per office: its laws, its regulator and its breach clock. Only the Manila, Philippines row is yours." },
      ],
      getEl: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take the **Legal** row.",
      steps: [
        { lead: "Read Section 2, Manila row", text: "Its Data-protection law is the Data Privacy Act 2012; its Cyber / sector law names the Cybercrime Prevention Act 2012." },
        { lead: "Column A", text: "The issue that names both Acts for the Manila office is the legal one." },
        { lead: "Column D", text: "For example: \"Client data at Manila must be handled as both Acts require, so the ISMS must protect it and show that it does.\"" },
        { lead: "Column E", text: "You read it in **SITL-ADD-16 Section 2**." },
      ],
      onEnter: () => issCell("A Issue", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-ADD-16")) : issCell("A Issue", 4)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that issue in column A, write its effect in column D and choose **SITL-ADD-16 Section 2** in column E. Next unlocks once all three are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ADD-16"); issCell("A Issue", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => issCell("A Issue", 4)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("SITL-ADD-16")),
      nextWhen: () => (issCell("A Issue", 4)?.value ?? "").startsWith("The Data Privacy Act 2012") && issCell("E Source", 4)?.value === "SITL-ADD-16 Section 2" && sentence(issCell(EFFECT, 4)),
      doIt: "Fill columns A, D and E of the Legal row",
    },
    {
      title: "Now the other three",
      icon: "edit",
      body: "Regulatory, technological and market, the same way.",
      steps: [
        { lead: "Find the issue of that kind for Manila", text: "In Section 2's Manila row, or in Section 1." },
        { lead: "Choose it, write its effect, choose its section" },
      ],
      tips: [{ kind: "avoid", text: "an issue of another office. Section 2 has a row for each of the four offices, and some of the choices are theirs." }],
      getEl: () => $(ISS),
    },
    checkRowsCard("Once every row is filled, click **Check my answers**. It shows whether each row's issue and section were right, the answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked. Column D is format-checked and kept with your hand-in."),
  ],

  // F1.3 step 3: dataset CTX-ISS-6, internal or external per issue. One row worked: the induction training.
  "F1.3-3": [
    {
      title: "Six issues",
      icon: "table",
      body: "These are the six issues of dataset **CTX-ISS-6**, for the Manila office. For each you decide in **column B**: internal or external.",
      getEl: () => $(ISS),
    },
    {
      title: "The test",
      icon: "book",
      body: "The step's guidance, on the right, gives the test: within the organisation's control (its culture, structure, capabilities), or from its environment.",
      getEl: () => $('[data-guide="step-text"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Security awareness training for new agents is given once, at induction, with no refresher**.",
      steps: [
        { lead: "Ask who decides it", text: "How agents are trained is GlobalConnect's own choice: one of its capabilities." },
        { lead: "Hold it against the test", text: "Within its control: **Internal**." },
      ],
      onEnter: () => issCell("B Internal/External", 11)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => issCell("B Internal/External", 11)?.closest("tr") ?? null,
    },
    {
      title: "Choose it",
      icon: "edit",
      body: "Choose **Internal** in column B of that row. Next unlocks once it is chosen.",
      onEnter: () => issCell("B Internal/External", 11)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => issCell("B Internal/External", 11)?.closest("td") ?? null,
      nextWhen: () => issCell("B Internal/External", 11)?.value === "Internal",
      doIt: "Choose Internal for the induction training",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each issue, ask: could GlobalConnect change this by its own decision?",
      tips: [{ kind: "avoid", text: "calling an issue internal because GlobalConnect must respond to it. An outside party's demand, or a threat, comes from the environment." }],
      getEl: () => $(ISS),
    },
    checkRowsCard("Once every issue has a value, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F1.3 step 4, part 1: the climate question, answered from the Quick Reference. Part 2 opens from the row.
  "F1.3-4q": askFromQR(4, "whether GlobalConnect must determine if climate change is a relevant issue.", "ISO/IEC 27001:2022/Amd 1:2024", "Read the entry for **ISO/IEC 27001:2022/Amd 1:2024**: what it added to Clause 4.1, and for whom. Then hold each of the three options against it.", "Part 2 is the climate-change row of CTX-ISS: your conclusion for Manila and its reason."),

  // F1.3 step 4, part 2: the climate row, from the hazard profile in SITL-ADD-16 Section 1 (UX101 W4, C-02; its scores are
  // SITL-ERM-001 Annex B's). Worked on another office, never on Manila.
  "F1.3-4": [
    {
      title: "The climate row",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is the climate-change row of CTX-ISS: is climate change relevant to the Manila office, and why?",
      steps: [
        { lead: "Column A", text: "Your conclusion: relevant or not relevant." },
        { lead: "Column D", text: "The reason, from the natural-hazard and climate profile in SITL-ADD-16 Section 1." },
      ],
      getEl: () => $(ISS),
    },
    ...openDoc("SITL-ADD-16", "Then click **Section 1** at the top to jump to the organisation profile."),
    {
      title: "The hazard profile",
      icon: "search",
      body: "Under the profile table, Section 1 lists each office's natural hazards, scored from 1 (low) to 5 (very high). Find the **Manila** row. The scores come from SITL-ERM-001 Annex B, which the Policy Library also holds.",
      steps: [
        { lead: "Natural-hazard score", text: "How exposed the country is." },
        { lead: "Principal hazards", text: "Which hazards they are. Ask which of them the weather drives." },
        { lead: "Recorded at the office", text: "What those hazards have done to the office so far." },
      ],
      getEl: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "How a row reads",
      icon: "help",
      body: "An example on another office. For **Warsaw** the reason would say: \"Section 1 scores Poland 2 of 5 for natural hazards, with flooding, and Warsaw lost no working day to weather.\" The conclusion then follows from what those hazards can do to the office.",
      getEl: () => (phone() ? $(docWindow("SITL-ADD-16")) : $(ISS)),
      alsoShow: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "Record yours",
      icon: "edit",
      body: "Choose your conclusion in column A and write the reason in column D, from the Manila row. Next unlocks once both are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ADD-16"); issCell("A Issue", 14)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => issCell("A Issue", 14)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("SITL-ADD-16")),
      nextWhen: () => !!issCell("A Issue", 14)?.value && sentence(issCell(EFFECT, 14)),
      doIt: "Fill columns A and D of the climate row",
    },
    checkRowsCard("Click **Check my answers**. It shows whether your conclusion was right, the answer and why. The row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked. The reason is format-checked and kept with your hand-in."),
  ],

  // F1.3 step 5, part 1: requirement or party, answered from the Clause 4.2 summary.
  "F1.3-5q": askFromQR(5, "which of three entries is an interested party's requirement, not a party.", "ISO/IEC 27001 Clause 4.2", "Read the entry for **ISO/IEC 27001 Clause 4.2**: what an interested party is, and what a requirement is. Then hold each of the three options against them.", "Part 2 is CTX-IP: the first five parties of SITL-ADD-16 Section 4, copied in order."),

  // F1.3 step 5, part 2: CTX-IP copied from the table under SITL-ADD-16 Section 4 (rule R04). One row worked: the first.
  "F1.3-5": [
    {
      title: "Five parties to copy",
      icon: "table",
      onEnter: closeQR,
      body: "CTX-IP has five rows. Into them go the first five parties of the table under **SITL-ADD-16 Section 4**, in the table's order.",
      steps: [
        { lead: "Party, Internal/External, Requirement, Standard/law", text: "Copied from the table." },
        { lead: "Rule and Evidence ref", text: "Fill themselves: R04 and SITL-ADD-16 Section 4." },
      ],
      getEl: () => $(IP),
    },
    {
      title: "Rule R04",
      icon: "book",
      body: "The note on the right is rule **R04**: the first five parties, in the same order, each with its requirement.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ADD-16", "Then click **Section 4** at the top to jump to the table."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take the table's first row, **Stakeholders / customers**.",
      steps: [
        { lead: "Party", text: "Stakeholders / customers" },
        { lead: "Internal/External", text: "External" },
        { lead: "Requirement", text: "Its three bullets, separated by semicolons: Quality scores (CSAT, NPS); Data security for client customer data; Operational uptime and staffing" },
        { lead: "Standard/law", text: "Client contracts (MSA and data-protection agreement)" },
      ],
      onEnter: () => ipCell("Party", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-ADD-16")) : ipCell("Party", 1)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Type and choose those four values in row 1. A cell that differs from the table is flagged with where to read it. Next unlocks once all four match.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ADD-16"); ipCell("Party", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => ipCell("Party", 1)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("SITL-ADD-16")),
      nextWhen: () => ["Party", "Internal/External", "Requirement", "Standard/law"].every((c) => cellIn(ipCell(c, 1))),
      doIt: "Fill row 1 from the table's first row",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Rows 2 to 5 take the table's rows 2 to 5, in the same way.",
      tips: [{ kind: "note", text: "Where a cell lists several items, give them all, separated by semicolons." }],
      getEl: () => $(IP),
    },
    finish("**Mark step complete** unlocks once every cell matches the table."),
  ],

  // F1.3 step 6, part 1: what to record for a requirement the ISMS will meet, from the Clause 4.2 summary.
  "F1.3-6q": askFromQR(6, "what you record for a requirement the ISMS will meet.", "ISO/IEC 27001 Clause 4.2", "Read the entry for **ISO/IEC 27001 Clause 4.2** again: what c) asks for, and where the requirements are used next.", "Part 2 is the Addressed through the ISMS? column of CTX-IP."),

  // F1.3 step 6, part 2: which of each party's requirements the ISMS addresses. One row worked: end-customers of clients.
  "F1.3-6": [
    {
      title: "The last column",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is **Addressed through the ISMS?**: for each party, which of its requirements the ISMS addresses. Its requirements are shown beside the column.",
      getEl: () => $(IP),
    },
    {
      title: "The test",
      icon: "book",
      body: "The note on the right gives the test from Clause 4.2 c): a requirement about protecting information or personal data is the ISMS's; service levels, labour law and HR terms are met elsewhere.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **End-customers of clients**.",
      steps: [
        { lead: "Privacy of their personal data", text: "Protects personal data: the ISMS's." },
        { lead: "Accurate resolution of their queries", text: "Service quality: met elsewhere." },
        { lead: "Timely handling of complaints", text: "Service quality: met elsewhere." },
        { lead: "So", text: "**Yes: Privacy of their personal data**." },
      ],
      onEnter: () => ipCell("Addressed through the ISMS?", 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => ipCell("Addressed through the ISMS?", 5)?.closest("tr") ?? null,
    },
    {
      title: "Choose it",
      icon: "edit",
      body: "Choose **Yes: Privacy of their personal data** for that row. Next unlocks once it is chosen.",
      onEnter: () => ipCell("Addressed through the ISMS?", 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => ipCell("Addressed through the ISMS?", 5)?.closest("td") ?? null,
      nextWhen: () => ipCell("Addressed through the ISMS?", 5)?.value === "Yes: Privacy of their personal data",
      doIt: "Choose for the end-customers of clients",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Do the same for each party: hold each of its requirements against the test, then choose the line that names every one the ISMS addresses.",
      getEl: () => $(IP),
    },
    checkRowsCard("Once every party has a value, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F1.3 step 7: CTX-ISS and CTX-IP named and handed in, in its row.
  "F1.3-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **CTX-ISS**, the issues with your four external issues, the six of CTX-ISS-6 and the climate row, and **CTX-IP**, the five parties. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-7 [data-guide="jobs"]') ?? $('#act-7 [data-guide="file-name"]')?.parentElement ?? null,
    },
    // Two files, two boxes, one card each: a card lighting both was taller than a phone's screen.
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 6");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-7 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **CTX-ISS**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the CTX-ISS file name" },
        { ...name, title: "Name the second file", body: "The same for **CTX-IP**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CTX-IP file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-7 [data-guide="step-complete"]') },
  ],

  // F2.1 step 1: finding the six parts of a scope in LearnTech's worked scope.
  "F2.1-1": [
    {
      title: "A finished scope",
      icon: "table",
      body: "This is template **T-LI-SCOPE**. These seven lines are LearnTech Educational Solutions' scope for its Amsterdam office, filled in as a worked example. Your GlobalConnect Customer Solutions scope for Manila must end up looking like it.",
      getEl: () => $(SCOPE),
    },
    {
      title: "Six parts to find",
      icon: "help",
      body: "Each question on the right describes one part of a scope. Answer it by clicking the statement that does what it describes.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which statement says which departments the ISMS covers? Read the **Statement** column and click it.",
      onEnter: () => $(`${SCOPE} button[aria-label^="Statement, 1 Organisational units:"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => $(`${SCOPE} button[aria-label^="Statement, 1 Organisational units:"]`)?.closest("tr") ?? null,
      pointAt: () => $(`${SCOPE} button[aria-label^="Statement, 1 Organisational units:"]`),
      nextWhen: () => !!$('[data-guide="study"] [data-found="units"]'),
      doIt: "Click the statement that names the departments",
    },
    {
      title: "Now the other five",
      icon: "check",
      body: "Find the location, the services, the technology, the interfaces and dependencies, and the exclusions the same way.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all six are found."),
  ],

  // F2.1 step 2: a question answered from the Clause 4.3 summary; no part 2.
  "F2.1-2": askOnlyFromQR(2, "how the outside payroll provider appears in the Manila office's ISMS scope.", "ISO/IEC 27001 Clause 4.3", "Read the entry for **ISO/IEC 27001 Clause 4.3**: what a), b) and c) ask the scope to consider. Then hold each of the three options against it."),

  // F2.1 step 3: sections 1–4 and the requirements line, statement and source per line. One row worked: the location.
  "F2.1-3": [
    {
      title: "Five lines",
      icon: "table",
      body: "These are the lines of GlobalConnect Customer Solutions' scope for Manila: sections 1 to 4 and the requirements the ISMS addresses. For each one you choose two things.",
      steps: [
        { lead: "Statement", text: "What the line's source gives for Manila. Each line offers statements read from different places." },
        { lead: "Source", text: "The document and section you read it in." },
      ],
      getEl: () => $(SCOPE),
    },
    {
      title: "Where each line is read",
      icon: "book",
      body: "The note on the right names each line's source. Statement and source are checked together.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ADD-16", "Then click **Section 2** at the top to jump to the offices."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **2 Location**.",
      steps: [
        { lead: "Read Section 2", text: "One row per office. The first is Manila, Philippines, the head office: the office this scope is for." },
        { lead: "Statement", text: "**Manila, Philippines (head office)**." },
        { lead: "Source", text: "You read it in **SITL-ADD-16 Section 2**." },
      ],
      onEnter: () => scopeCell("Statement", 9)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-ADD-16")) : scopeCell("Statement", 9)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that statement and that source in the 2 Location row. Next unlocks once both are chosen.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ADD-16"); scopeCell("Statement", 9)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => scopeCell("Statement", 9)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("SITL-ADD-16")),
      nextWhen: () => scopeCell("Statement", 9)?.value === "Manila, Philippines (head office)" && scopeCell("Source", 9)?.value === "SITL-ADD-16 Section 2",
      doIt: "Choose the statement and source of the location",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Do the same for each line, from the source the note names.",
      steps: [
        { lead: "1 Organisational units", text: "SITL-ADD-16 Section 8.1: the **Department** column of the Manila rows." },
        { lead: "3 Services", text: "SITL-ADD-16 Section 1.1." },
        { lead: "4 Technology", text: "**TSA-16 Office_Deployment**, in Learn › Reference pages (it carries the dot): the Manila rows." },
        { lead: "Requirements addressed", text: "The ones you marked Addressed through the ISMS in CTX-IP, F1.3 step 6." },
      ],
      tips: [{ kind: "avoid", text: "a statement read from the right document but the wrong column or office. Each line offers some." }],
      getEl: () => $(SCOPE),
    },
    checkRowsCard("Once every line is filled, click **Check my answers**. It shows whether each line's statement and source were right, the answer and why. Your lines lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F2.1 step 4, part 1: the support-floor question, from the Clause 4.3 summary. Part 2 opens from the row.
  "F2.1-4q": askFromQR(4, "what you advise when a manager wants the customer-support floor left out of the scope.", "ISO/IEC 27001 Clause 4.3", "Read the entry for **ISO/IEC 27001 Clause 4.3** again: what the scope must consider, and what the certification body checks. Then hold each of the three options against it.", "Part 2 is section 5 of LI-SCOPE, Exclusions."),

  // F2.1 step 4, part 2: the exclusions line. Decided from part 1 and step 2; no worked answer.
  "F2.1-4": [
    {
      title: "Section 5, Exclusions",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is the exclusions line of your scope: what of the Manila office's own activities the scope leaves out, with the justification, or None.",
      getEl: () => $(SCOPE),
    },
    {
      title: "The test",
      icon: "book",
      body: "The note on the right says what to hold each choice against: your answer to part 1, about the support floor, and your answer to step 2, about payroll.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "Choose it",
      icon: "edit",
      body: "Choose the statement for section 5. Next unlocks once it is chosen.",
      tips: [{ kind: "note", text: "An exclusion is part of the office's **own** activities left out of the scope. Ask of each choice: is it the office's own activity, and do your answers keep it in?" }],
      onEnter: () => scopeCell("Statement", 13)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => scopeCell("Statement", 13)?.closest("tr") ?? null,
      nextWhen: () => !!scopeCell("Statement", 13)?.value,
      doIt: "Choose the exclusions statement",
    },
    checkRowsCard("Click **Check my answers**. It shows whether your exclusions line was right, the answer and why. The line locks then."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  // F2.1 step 5: the ten ISMS processes, owner and inputs → outputs. One row worked: risk assessment and treatment.
  "F2.1-5": [
    {
      title: "Ten processes",
      icon: "table",
      body: "Section 6 of LI-SCOPE lists the ten processes the ISMS runs. For each you choose two things.",
      steps: [
        { lead: "Owner", text: "The role that runs the process." },
        { lead: "Inputs → outputs", text: "What the process works from, and what it hands on." },
      ],
      getEl: () => $(PROC),
    },
    {
      title: "Rule L04",
      icon: "book",
      body: "The note on the right is rule **L04**. It sends you to **Ref-ISMS processes**, which says where each process's owner is read.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("Ref-ISMS processes", "It opens beside the table."),
    {
      title: "Where each owner is read",
      icon: "search",
      body: "One row per process. The last column says where its owner is read: for most, a row of the **GRC Charter Section 16** RACI and the role marked **R**, who runs it.",
      getEl: () => $(pageWindow("Ref-ISMS processes")),
    },
    ...openDoc("Charter", "Then click **Section 16** at the top to jump to the RACI."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Risk assessment and treatment**.",
      steps: [
        { lead: "Ref-ISMS processes", text: "Charter Section 16, rows Enterprise risk assessment and Risk register & treatment: the role marked R." },
        { lead: "Section 16", text: "On both rows R is in the **Risk** column. The line under the table spells Risk out: **Cyber Risk Manager**." },
        { lead: "Inputs → outputs", text: "The risk method, the asset inventory and the threats go in; the risk register, the treatment plan and the Statement of Applicability come out." },
      ],
      onEnter: () => procCell("Owner (L04)", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("Charter")) : procCell("Owner (L04)", 2)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("Charter")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Cyber Risk Manager** and the inputs → outputs that start \"Risk method\" in that row. Next unlocks once both are chosen.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("Charter"); shutPage("Ref-ISMS processes"); procCell("Owner (L04)", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => procCell("Owner (L04)", 2)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("Charter")),
      nextWhen: () => procCell("Owner (L04)", 2)?.value === "Cyber Risk Manager" && (procCell("Inputs → outputs", 2)?.value ?? "").startsWith("Risk method"),
      doIt: "Choose the owner and the inputs → outputs of risk assessment",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "Do the same for each process.",
      steps: [
        { lead: "Read its line in Ref-ISMS processes" },
        { lead: "Open the place it names", text: "Charter Section 16 for most; SITL-POL-001 or SITL-POL-000 for a few, in Policies › Policy Library." },
        { lead: "Choose the owner, then the inputs → outputs", text: "Each inputs → outputs line fits one process only." },
      ],
      tips: [{ kind: "avoid", text: "taking the role marked A. The CISO is Accountable on most rows; the owner who runs the process is the one Ref-ISMS processes names." }],
      getEl: () => $(PROC),
    },
    checkRowsCard("Once every process has both, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F2.1 step 6: section 7, interfaces and dependencies. One row worked: the telecom carriers.
  "F2.1-6": [
    {
      title: "Seven connections",
      icon: "table",
      body: "Section 7 of LI-SCOPE lists where the Manila office's systems and work meet another's: the six integrations of SITL-ADD-16 Section 9.1 and the payroll provider of step 2. For each you choose two things.",
      steps: [
        { lead: "What crosses the boundary", text: "Information, a service the office depends on, both, or nothing where both ends are in the scope." },
        { lead: "Annex A control", text: "The control that governs that crossing." },
      ],
      getEl: () => $(IFACE),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right says how: Section 9.1's Internal / External column, and whether the other party is a supplier.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ADD-16", "Then click **Section 9.1** at the top to jump to the integrations."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **VoIP and UCaaS platforms ↔ telecom carriers**.",
      steps: [
        { lead: "Section 9.1", text: "External; counterparty Telecom providers; call audio and call detail records exchanged." },
        { lead: "What crosses", text: "Call audio, and the carriers give the connectivity the calls run on: **Information and a service**." },
        { lead: "Control", text: "The carriers are suppliers, under an agreement: **A.5.20**." },
      ],
      onEnter: () => ifCell("What crosses the boundary", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-ADD-16")) : ifCell("What crosses the boundary", 4)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose those two in the telecom carriers row. Next unlocks once both are chosen.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ADD-16"); ifCell("What crosses the boundary", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => ifCell("What crosses the boundary", 4)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("SITL-ADD-16")),
      nextWhen: () => ifCell("What crosses the boundary", 4)?.value === "Information and a service" && (ifCell("Annex A control", 4)?.value ?? "").startsWith("A.5.20"),
      doIt: "Choose what crosses and the control for the telecom carriers",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "Do the same for each row: Internal or External in Section 9.1 first, then who the other party is.",
      tips: [{ kind: "avoid", text: "calling a client a supplier. The client companies buy GlobalConnect's services; they do not supply it." }],
      getEl: () => $(IFACE),
    },
    checkRowsCard("Once every row has both, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F2.1 step 7: LI-SCOPE named and handed in, in its row.
  "F2.1-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "Your scope, **LI-SCOPE**: sections 1 to 5, section 6's processes and section 7's interfaces. This step saves it in **02_Working** under its own name and submits it.",
      getEl: () => $('#act-7 [data-guide="jobs"]') ?? $('#act-7 [data-guide="file-name"]'),
    },
    ...nameAndSubmit("docx", "1 to 6").slice(0, 2),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-7 [data-guide="step-complete"]') },
  ],

  // F2.2 step 1: the worked rows 4.1 and 4.2, three click-the-cell questions, and the Maturity Model read.
  "F2.2-1": [
    {
      title: "Sheet Gap",
      icon: "table",
      body: "This is sheet **Gap** of template **T-LI-PLAN**: the 25 requirements of clauses 4.1 to 10.2, each with what the clause requires and what was found at the Manila office (dataset GAP-25). Rows 4.1 and 4.2 are filled in as worked examples.",
      getEl: () => $(GAP),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Every finished row has a status, a maturity level and a reason. Each question on the right asks for one of them in the worked rows: answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which status do the worked rows give clause 4.2? Read column **C** and click it.",
      onEnter: () => gapStudy("C Status (L13)", "4.2")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => gapStudy("C Status (L13)", "4.2")?.closest("tr") ?? null,
      pointAt: () => gapStudy("C Status (L13)", "4.2"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="C"]'),
      doIt: "Click the status of clause 4.2",
    },
    ...openPage(MM, "It opens beside the sheet."),
    {
      title: "The Maturity Model",
      icon: "book",
      body: "Four levels, one per row, each with what you find at that level and an example. The note above the table gives three questions: ask them in order and stop at the first **No**. You rate every clause with them in step 3.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Find the level the worked rows give clause 4.1, and the reason that says why 4.2 is not at Level 3.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage(MM),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // F2.2 step 2: column C for the 23 clauses, by rule L13. One row worked: 7.3 Awareness.
  "F2.2-2": [
    {
      title: "23 clauses to rate",
      icon: "table",
      body: "For each clause, read what it requires and what was found at Manila. Then choose its status in column **C**: Fully met, Partially met or Not met.",
      getEl: () => $(GAP),
    },
    {
      title: "Rule L13",
      icon: "book",
      body: "The note on the right is rule **L13**. Hold what was found against what the clause requires: all of it in place with its evidence, some of it, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **7.3 Awareness**.",
      steps: [
        { lead: "Requires", text: "People who work for the organisation know the policy, their part in the ISMS, and what happens if they do not conform." },
        { lead: "Found", text: "Agents are trained once, at induction; four of ten could not say where to report a suspicious call." },
        { lead: "Status", text: "Part of it is in place, part is missing: **Partially met**." },
      ],
      onEnter: () => gapCell("C Status (L13)", 15)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => gapCell("C Status (L13)", 15)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially met** in the 7.3 row. Next unlocks once it is chosen.",
      getEl: () => gapCell("C Status (L13)", 15)?.closest("tr") ?? null,
      pointAt: () => gapCell("C Status (L13)", 15),
      nextWhen: () => gapCell("C Status (L13)", 15)?.value === "Partially met",
      doIt: "Choose the status of 7.3",
    },
    {
      title: "Now the other 22",
      icon: "edit",
      body: "Do the same for each clause: what it requires, what was found, then the status.",
      tips: [{ kind: "avoid", text: "rating a clause Fully met because something exists. A draft nobody approved, or work with no records, is not all of it." }],
      getEl: () => $(GAP),
    },
    checkRowsCard("Once every clause has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F2.2 step 3: column D for 22 clauses, by the Maturity Model. One row worked: 7.3 Awareness again.
  "F2.2-3": [
    {
      title: "A level per clause",
      icon: "table",
      body: "For each clause, read what was found at Manila, with its status beside it. Then choose its maturity level in column **D**, Level 1 to Level 4. 6.1.2 waits for step 4.",
      getEl: () => $(GAP),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the sheet."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **7.3 Awareness**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: an induction deck, with attendance recorded." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed yearly? No: it is Manila's own deck, never reviewed." },
        { lead: "Level", text: "Stop at the first No: **Level 2 Managed**." },
      ],
      onEnter: () => { shutPage(MM); gapCell("D Maturity level", 15)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => gapCell("D Maturity level", 15)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 2 Managed** in the 7.3 row. Next unlocks once it is chosen.",
      getEl: () => gapCell("D Maturity level", 15)?.closest("tr") ?? null,
      pointAt: () => gapCell("D Maturity level", 15),
      nextWhen: () => gapCell("D Maturity level", 15)?.value === "Level 2 Managed",
      doIt: "Choose the level of 7.3",
    },
    {
      title: "Now the other 21",
      icon: "edit",
      body: "Do the same for each clause: the questions in order, against what was found.",
      tips: [{ kind: "note", text: "The status and the level are separate questions. A clause can be Partially met and still be done the Group's way." }],
      getEl: () => $(GAP),
    },
    checkRowsCard("Once every clause has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F2.2 step 4: 6.1.2's level, answered from the Maturity Model; no part 2.
  "F2.2-4": askOnlyFromPage(4, "the maturity level of clause 6.1.2, from its notes.", MM, "Ask the note's three questions of 6.1.2's notes, in order, and stop at the first **No**. Then hold each of the three options against where you stopped."),

  // F2.2 step 5, part 1: which kind of gap goes first. Part 2 (sheet Plan) opens from the row.
  "F2.2-5q": askThenScreen(5, "which kind of gap you close first.", "Part 2 is sheet Plan: your top three gaps, in order, with owner role and target date.", "Gap Finder"),

  // F2.2 step 5, part 2: sheet Plan. One row worked: priority 1, 9.2 Internal audit (part 1's own example).
  "F2.2-5": [
    {
      title: "Sheet Plan",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is sheet **Plan**: the three gaps you close first, in order, each with the role that owns it and a target date.",
      getEl: () => $(PLAN),
    },
    {
      title: "How to order them",
      icon: "book",
      body: "The note on the right says where the statuses are, how to order the gaps, and where each owner is read.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("Ref-ISMS processes", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Priority 1**.",
      steps: [
        { lead: "Gap", text: "**9.2 Internal audit**, part 1's own example: Not met, and the other gaps wait for what it finds." },
        { lead: "Owner", text: "Ref-ISMS processes, Internal audit: GRC Charter Section 16, row Internal audit, the role marked R. That is the **Information Security Auditor**, as in your LI-SCOPE section 6." },
        { lead: "Target date", text: "Yours to set: when the owner closes it." },
      ],
      onEnter: () => planCell("Gap (clause)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(pageWindow("Ref-ISMS processes")) : planCell("Gap (clause)", 1)?.closest("tr") ?? null),
      alsoShow: () => $(pageWindow("Ref-ISMS processes")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose 9.2 Internal audit and the Information Security Auditor in the Priority 1 row, and pick a target date. Next unlocks once all three are in.",
      onEnter: () => { shutPage("Ref-ISMS processes"); planCell("Gap (clause)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => planCell("Gap (clause)", 1)?.closest("tr") ?? null,
      nextWhen: () => (planCell("Gap (clause)", 1)?.value ?? "").startsWith("9.2 ") && planCell("Owner role", 1)?.value === "Information Security Auditor" && !!planCell("Target date", 1)?.value,
      doIt: "Fill the Priority 1 row",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "Priority 2 and 3: the other gaps step 2 found Not met, each before the one that takes in its output (Clause 9.3.2, in the note).",
      tips: [{ kind: "note", text: "The Status in sheet Gap column fills itself once a gap is chosen: it shows the status step 2 checked." }],
      getEl: () => $(PLAN),
    },
    checkRowsCard("Once all three rows are in, click **Check my answers**. It shows whether each gap and owner were right, the answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // F2.2 step 6: LI-GAP named and handed in, in its row.
  "F2.2-6": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "Your gap analysis, **LI-GAP**: sheet Gap's statuses and levels, and sheet Plan's top three gaps. This step saves it in **02_Working** under its own name and submits it.",
      getEl: () => $('#act-6 [data-guide="jobs"]') ?? $('#act-6 [data-guide="file-name"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 5").slice(0, 2),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-6 [data-guide="step-complete"]') },
  ],

  // T3.1 step 1: the seven Clause 5.2 items, three situation questions, and SITL-POL-001 opened.
  "T3.1-1": [
    {
      title: "Sheet Policy check",
      icon: "table",
      body: "This is sheet **Policy check** of template **T-LI-POL**: the seven items of Clause 5.2, a) to g), one per row. The Note column says what to look for in the policy for each. In step 2 you check SITL-POL-001 against them.",
      getEl: () => $(LIPOL),
    },
    {
      title: "Three situations",
      icon: "help",
      body: "Each question on the right is an everyday situation. Answer it by clicking the item it tests.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "A client asks for a copy of the policy before it signs a contract. Which item does that test? Click it.",
      onEnter: () => polStudy("g")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => polStudy("g")?.closest("tr") ?? null,
      pointAt: () => polStudy("g"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="g"]'),
      doIt: "Click the item a client's request tests",
    },
    ...openDoc("SITL-POL-001", "It opens beside the sheet."),
    {
      title: "The policy you check",
      icon: "book",
      body: "SITL-POL-001 is the Group's information security policy. Sections 1 to 3 say what it sets out to do and commits to; Section 11 is its document control, with who approved it and what is recorded about it.",
      getEl: () => $(docWindow("SITL-POL-001")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutDoc("SITL-POL-001"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T3.1 step 2: Found or Gap with its section, per item, by rule L08. One row worked: c), the commitment to requirements.
  "T3.1-2": [
    {
      title: "Seven items to check",
      icon: "table",
      body: "For each item, look for the section of SITL-POL-001 that meets it. Choose **Found** and the section, or **Gap** where no section meets it.",
      getEl: () => $(LIPOL),
    },
    {
      title: "Rule L08",
      icon: "book",
      body: "The note on the right is rule **L08**: Found only when you can cite the section. Cite the statement itself, not the procedure it points to.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-001", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **c) A commitment to satisfy applicable requirements**.",
      steps: [
        { lead: "Look for", text: "A commitment, and the kinds of requirement it covers (the row's note)." },
        { lead: "Found in", text: "Section 3.1: \"The Group commits to satisfy the legal, regulatory, contractual and information security requirements that apply to it.\"" },
        { lead: "Record", text: "**Found**, **Section 3.1**." },
      ],
      onEnter: () => polCell("Found/Gap (L08)", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-POL-001")) : polCell("Found/Gap (L08)", 3)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-POL-001")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Found** and **Section 3.1** in the c) row. Next unlocks once both are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-POL-001"); polCell("Found/Gap (L08)", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => polCell("Found/Gap (L08)", 3)?.closest("tr") ?? null,
      pointAt: () => polCell("Found/Gap (L08)", 3),
      nextWhen: () => polCell("Found/Gap (L08)", 3)?.value === "Found" && polCell("Section", 3)?.value === "Section 3.1",
      doIt: "Fill the c) row",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "Do the same for each item: what the note says to look for, then the section that says it.",
      tips: [
        { kind: "note", text: "Choose **Gap** and the Section column fills itself with None: a gap has no section to cite." },
        { kind: "avoid", text: "counting what an office says it does. Only what the policy or its record shows counts." },
      ],
      getEl: () => $(LIPOL),
    },
    checkRowsCard("Once every item is decided, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.1 step 3: an overdue policy, answered from SITL-POL-000 Section 7; no part 2.
  "T3.1-3": askOnlyFromDoc(3, "what you record for a policy last approved 26 months ago.", "SITL-POL-000", "7", "Read **Section 7**, the policy lifecycle: who drafts a policy, how it is approved, and how often it is reviewed. Then hold each of the three options against it."),

  // T3.1 step 4: who approves the top-level policy, from the Clause 5.2 summary; no part 2.
  "T3.1-4": askOnlyFromQR(4, "who approves the top-level information security policy.", "ISO/IEC 27001 Clause 5.2", "Read the entry for **ISO/IEC 27001 Clause 5.2**: who establishes the policy. Then hold each of the three options against it."),

  // T3.1 step 5, part 1: evidence of top management's commitment, from the Clause 5.1 summary. Part 2 opens from the row.
  "T3.1-5q": askFromQR(5, "which item is evidence of top management's commitment.", "ISO/IEC 27001 Clause 5.1", "Read the entry for **ISO/IEC 27001 Clause 5.1**: what top management does to show its commitment, and what the evidence looks like. Then hold each of the three options against it.", "Part 2 is sheet Leadership of LI-POL: five evidence items located in your inputs, with their source.")
    .map((c) => (c.title === "Then part 2" ? { ...c, body: "Part 2 is sheet Leadership of LI-POL: five evidence items located in your inputs, with their source. Click **Open Review & Redline** to do it." } : c)),

  // T3.1 step 5, part 2: sheet Leadership. One row worked: the Org CEO approving the objectives.
  "T3.1-5": [
    {
      title: "Sheet Leadership",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is sheet **Leadership**: eight statements found in your inputs. Mark the five that show top management's commitment, and choose where each one is read.",
      getEl: () => $(LEADS),
    },
    {
      title: "What counts",
      icon: "book",
      body: "The note on the right says what counts as top management's commitment, and which documents the statements come from.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-001", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **The Org CEO approves the security objectives, with their targets, owners and dates**.",
      steps: [
        { lead: "Where", text: "SITL-POL-001 **Section 6.2**, the objectives procedure: step 2, Approve the objectives with targets, owners and dates, responsible the Org CEO." },
        { lead: "Top management?", text: "The Org CEO is the organisation's top manager, setting its objectives (Clause 5.1 a): **Yes**." },
      ],
      onEnter: () => leadCell(LEAD_COL, 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-POL-001")) : leadCell(LEAD_COL, 5)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-POL-001")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Yes** and **SITL-POL-001 Section 6.2** in that row. Next unlocks once both are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-POL-001"); leadCell(LEAD_COL, 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => leadCell(LEAD_COL, 5)?.closest("tr") ?? null,
      pointAt: () => leadCell(LEAD_COL, 5),
      nextWhen: () => leadCell(LEAD_COL, 5)?.value === "Yes" && leadCell("Source", 5)?.value === "SITL-POL-001 Section 6.2",
      doIt: "Fill the objectives row",
    },
    {
      title: "Now the other seven",
      icon: "edit",
      body: "For each statement, find it in SITL-POL-001, SITL-POL-000 or the GRC Charter, then decide whether top management itself is acting.",
      tips: [{ kind: "avoid", text: "marking Yes for work done under the policy by others: owners, analysts and auditors are not top management." }],
      getEl: () => $(LEADS),
    },
    checkRowsCard("Once all eight rows are in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.1 step 6: sheet Policy set, the SITL policy and status per topic. One row worked: Backup.
  "T3.1-6": [
    {
      title: "Sheet Policy set",
      icon: "table",
      body: "This is **POL-SET**: the twelve topic-specific policies ISO/IEC 27002 Section 5.1 lists. For each, choose the SITL policy that covers it and its status. The owner, approver and last review date fill themselves.",
      getEl: () => $(PSET),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right says where each policy is found, and when a policy is Current, Overdue or Missing.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(PORTAL, "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Backup**.",
      steps: [
        { lead: "Covers it", text: "In Ref-Policy portal, SITL-POL-009 covers IT operations, backup among them: **SITL-POL-009**." },
        { lead: "Last approved", text: "2026-02-09: it fills in once the policy is chosen." },
        { lead: "Status", text: "Within the 12 months before 19 October 2026: **Current**." },
      ],
      onEnter: () => setCell("SITL policy", 8)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(pageWindow(PORTAL)) : setCell("SITL policy", 8)?.closest("tr") ?? null),
      alsoShow: () => $(pageWindow(PORTAL)),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **SITL-POL-009** and **Current** in the Backup row. Next unlocks once both are in.",
      onEnter: () => { shutPage(PORTAL); setCell("SITL policy", 8)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => setCell("SITL policy", 8)?.closest("tr") ?? null,
      pointAt: () => setCell("SITL policy", 8),
      nextWhen: () => setCell("SITL policy", 8)?.value === "SITL-POL-009" && setCell("Status", 8)?.value === "Current",
      doIt: "Fill the Backup row",
    },
    {
      title: "Now the other eleven",
      icon: "edit",
      body: "For each topic, find the policy whose coverage names it, then hold its last review date against 19 October 2026.",
      tips: [
        { kind: "note", text: "One policy can cover two topics. A topic no policy covers takes **None in the library**, and its status is Missing." },
        { kind: "avoid", text: "rounding: a policy approved a few days more than 12 months before the extract is past its yearly review." },
      ],
      getEl: () => $(PSET),
    },
    checkRowsCard("Once every topic is in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.1 step 7: LI-POL and POL-SET named and handed in, in its row.
  "T3.1-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **LI-POL**, the policy check and sheet Leadership, and **POL-SET**, the topic-specific policy register. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-7 [data-guide="jobs"]') ?? $('#act-7 [data-guide="file-name"]')?.parentElement ?? null,
    },
    // Two files, two boxes, one card each (F1.3 step 7).
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 6");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-7 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-POL**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-POL file name" },
        { ...name, title: "Name the second file", body: "The same for **POL-SET**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the POL-SET file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-7 [data-guide="step-complete"]') },
  ],

  // T3.2 step 1: sheet RACI, R and A per process. One row worked: Policy management.
  "T3.2-1": [
    {
      title: "Sheet RACI",
      icon: "table",
      body: "This is sheet **RACI** of template **T-LI-POL**: the ten ISMS processes of your LI-SCOPE section 6. For each, choose who is **R**esponsible and who is **A**ccountable. Consulted and Informed are filled in for you.",
      getEl: () => $(RACI),
    },
    {
      title: "Where R and A are read",
      icon: "book",
      body: "The note on the right says where: R is the process's owner, read where Ref-ISMS processes says; A is one role, read on the same row of the GRC Charter Section 16 RACI, or in SITL-POL-001.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("Ref-ISMS processes", "It opens beside the sheet."),
    {
      title: "Where each owner is read",
      icon: "search",
      body: "One row per process, with the place its owner is read: a row of the Charter's RACI, or a section of SITL-POL-001.",
      getEl: () => $(pageWindow("Ref-ISMS processes")),
    },
    // On a phone the page window covers the toolbar: it has been read, so it closes as the Charter is opened.
    ...openDoc("Charter", "Then click **Section 16** in the bar at the top of the window.").map((c, i) => (i === 0 ? { ...c, onEnter: () => shutPage("Ref-ISMS processes") } : c)),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Policy management**.",
      steps: [
        { lead: "Where", text: "Ref-ISMS processes: GRC Charter Section 16, row **Policy lifecycle**." },
        { lead: "R", text: "The role marked R on that row: Pol, the **Policy & Governance Analyst**, as in your LI-SCOPE." },
        { lead: "A", text: "The role marked A on the same row: the **Chief Information Security Officer (CISO)**." },
      ],
      onEnter: () => $(`${docWindow("Charter")} section[data-sec="16"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => (phone() ? $(docWindow("Charter")) : raciCell("R Responsible", 3)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("Charter")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose the Policy & Governance Analyst as R and the CISO as A in the Policy management row. Next unlocks once both are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("Charter"); shutPage("Ref-ISMS processes"); raciCell("R Responsible", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => raciCell("R Responsible", 3)?.closest("tr") ?? null,
      pointAt: () => raciCell("R Responsible", 3),
      nextWhen: () => raciCell("R Responsible", 3)?.value === "Policy & Governance Analyst" && (raciCell("A Accountable", 3)?.value ?? "").startsWith("Chief Information Security Officer"),
      doIt: "Fill the Policy management row",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "For each process, find where Ref-ISMS processes reads its owner, then R and A there.",
      tips: [
        { kind: "note", text: "Where it points to SITL-POL-001, A is the role the Responsible role answers to in that section." },
        { kind: "avoid", text: "two Accountables, or none. A row marked A/R gives one role both." },
      ],
      getEl: () => $(RACI),
    },
    checkRowsCard("Once every process has R and A, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.2 step 2, part 1: the two Clause 5.3 assignments, from the Clause 5.3 summary. Part 2 opens from the row.
  "T3.2-2q": askFromQR(2, "which two things Clause 5.3 requires top management to assign.", "ISO/IEC 27001 Clause 5.3", "Read the entry for **ISO/IEC 27001 Clause 5.3**: what top management assigns, item by item. Then hold each of the three options against it.", "")
    .map((c) => (c.title === "Then part 2" ? { ...c, body: "Part 2 is the RACI header: who holds each of the two assignments at Manila, and where you read it. Click **Open Review & Redline** to do it." } : c)),

  // T3.2 step 2, part 2: the RACI header. One row worked: a), the ISMS's conformity.
  "T3.2-2": [
    {
      title: "The RACI header",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is the header of sheet RACI: for each Clause 5.3 assignment, the role that holds it at GlobalConnect Manila and the section you read it in.",
      getEl: () => $(HEADR),
    },
    {
      title: "Where to read it",
      icon: "book",
      body: "The note on the right names the sections that give the roles: SITL-POL-001 for the organisation's ISMS, the GRC Charter for the Group's.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-001", "Then click **Section 5** in the bar at the top of the window."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **a) Making sure the ISMS conforms to ISO/IEC 27001**.",
      steps: [
        { lead: "Read", text: "SITL-POL-001 **Section 5**, the roles table: the Org CISO operationalises the policy and integrates it into the ISMS and the organisation addendum." },
        { lead: "Record", text: "The **Chief Information Security Officer (CISO)**, **SITL-POL-001 Section 5**." },
      ],
      onEnter: () => $(`${docWindow("SITL-POL-001")} section[data-sec="5"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => (phone() ? $(docWindow("SITL-POL-001")) : headCell("Role assigned", 1)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-POL-001")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose the CISO and SITL-POL-001 Section 5 in row a). Next unlocks once both are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-POL-001"); headCell("Role assigned", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => headCell("Role assigned", 1)?.closest("tr") ?? null,
      pointAt: () => headCell("Role assigned", 1),
      nextWhen: () => (headCell("Role assigned", 1)?.value ?? "").startsWith("Chief Information Security Officer") && headCell("Source", 1)?.value === "SITL-POL-001 Section 5",
      doIt: "Fill row a)",
    },
    {
      title: "Now row b)",
      icon: "edit",
      body: "Who reports on how the ISMS performs to top management? Read the procedures of SITL-POL-001 Section 6 for the step that reports results, and who does it.",
      tips: [{ kind: "avoid", text: "the role that collects or measures. The assignment is the one who reports." }],
      getEl: () => $(HEADR),
    },
    checkRowsCard("Once both rows are in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.2 step 3: the tracker located, the LI task pages and SPR-01 read; three click-the-cell questions.
  "T3.2-3": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, filtered to sprint 1: A.5.1 to A.5.4. You keep it across every control sprint. Its first row is a LearnTech Educational Solutions worked example, filled in from A to G.",
      getEl: () => $(citSel(1)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(1, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(1, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(1, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.5.1", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.5.1 to LI-A.5.4. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.5.1")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.5.1"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T3.2 step 4: column D, the status of the four controls. One row worked: A.5.2.
  "T3.2-4": [
    {
      title: "Four controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-01). Then choose its status in column **D**.",
      getEl: () => $(citSel(1)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.2 Information security roles and responsibilities**.",
      steps: [
        { lead: "Requirement 1", text: "Roles defined: met. The Charter Section 16 and SITL-POL-001 Section 5 define them." },
        { lead: "Requirements 2 and 3", text: "Allocated at Manila, and communicated: not met. Nobody owns the ISMS day to day, and nothing records who holds which role." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => sprintCell(1, "D Status", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintCell(1, "D Status", 3)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.5.2 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(1, "D Status", 3)?.closest("tr") ?? null,
      pointAt: () => sprintCell(1, "D Status", 3),
      nextWhen: () => sprintCell(1, "D Status", 3)?.value === "Partially implemented",
      doIt: "Choose the status of A.5.2",
    },
    {
      title: "Now the other three",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "counting what the Group has written as done at Manila. The observation says what the office does." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(1)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.2 step 5: column E, the level of the four controls. One row worked: A.5.3.
  "T3.2-5": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(1)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.3 Segregation of duties**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? No: nothing at Manila says which duties are kept apart, and nothing records it." },
        { lead: "Level", text: "Stop at the first No: **Level 1 Initial**." },
      ],
      onEnter: () => { shutPage(MM); sprintCell(1, "E Maturity level", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(1, "E Maturity level", 4)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 1 Initial** in the A.5.3 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(1, "E Maturity level", 4)?.closest("tr") ?? null,
      pointAt: () => sprintCell(1, "E Maturity level", 4),
      nextWhen: () => sprintCell(1, "E Maturity level", 4)?.value === "Level 1 Initial",
      doIt: "Choose the level of A.5.3",
    },
    {
      title: "Now the other three",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions. A control can be Implemented and still be done the office's own way." }],
      getEl: () => $(citSel(1)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.2 step 6: the evidence packs of A.5.2 and A.5.3. One row worked: LI-A.5.2-01, the RACI.
  "T3.2-6": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.5.2** and **LI-A.5.3**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.5.2", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.5.2-01**.",
      steps: [
        { lead: "Evidence item", text: "A RACI of the ISMS processes." },
        { lead: "Already handed in?", text: "Yes: your LI-RACI of step 1 holds it." },
        { lead: "Record", text: "**M2610-00001_T3.2_LI-RACI_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.5.2"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your LI-RACI file in row LI-A.5.2-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T3.2_LI-RACI_v1.xlsx"),
      doIt: "Fill row LI-A.5.2-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-01 observed (the tracker's Observed column, or the dataset on the step's Reference tab).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T3.2 step 7: sub-task 01 and the next action of A.5.1 and A.5.4. One row worked: A.5.1.
  "T3.2-7": [
    {
      title: "Two controls, first evidence",
      icon: "table",
      body: "For **A.5.1** and **A.5.4**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
      getEl: () => $(citSel(1)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 6, and what G needs: the step to Level 3, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.1 Policies for information security**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for a register of the policies in force: your POL-SET of T3.1, **M2610-00001_T3.1_POL-SET_v1.xlsx**." },
        { lead: "G", text: "Level 2, because the list is Manila's own and never reviewed: next, **move to the Group policy register, used in every office, reviewed yearly**; measure, **% of policies within review date, target 100%, each quarter**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); sprintCell(1, "F Evidence ref", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(1, "F Evidence ref", 2)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.5.1 row. Next unlocks once both are in.",
      getEl: () => sprintCell(1, "F Evidence ref", 2)?.closest("tr") ?? null,
      pointAt: () => sprintCell(1, "F Evidence ref", 2),
      nextWhen: () => (sprintCell(1, "F Evidence ref", 2)?.value ?? "").endsWith("_T3.1_POL-SET_v1.xlsx") && (sprintCell(1, "G Gap / next action", 2)?.value ?? "").includes("% of policies within review date") && (sprintCell(1, "G Gap / next action", 2)?.value ?? "").includes("Group policy register"),
      doIt: "Fill the A.5.1 row",
    },
    {
      title: "Now A.5.4",
      icon: "edit",
      body: "The same for A.5.4: read its sub-task 01 on LI-A.5.4 and what SPR-01 observed, then its level from step 5.",
      tips: [{ kind: "avoid", text: "doing the office's own way more often. Level 3 is the Group's way, in every office, reviewed yearly." }],
      getEl: () => $(citSel(1)),
    },
    checkRowsCard("Once both rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T3.2 step 8: the small finance team, answered from what A.5.3 requires; no part 2.
  "T3.2-8": askOnlyFromPage(8, "what you record for A.5.3 when one person in a team of three creates suppliers and approves their payments.", "LI-A.5.3", "Read **What it requires** in the note, all three items: what A.5.3 asks for, including where duties cannot be split. Then hold each of the three options against it."),

  // T3.2 step 9: LI-RACI and CIT-S1 named and handed in, in its row (the evidence packs go with them).
  "T3.2-9": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **LI-RACI**, the RACI and its header, and **CIT-S1**, your tracker for sprint 1. The evidence packs go in with them. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-9 [data-guide="jobs"]') ?? $('#act-9 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 8");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-9 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-RACI**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-RACI file name" },
        { ...name, title: "Name the second file", body: "The same for **CIT-S1**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S1 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-9 [data-guide="step-complete"]') },
  ],

  // T6.2 step 1: sheet Register, maintained or retained per item. One row worked: Monitoring and measurement results.
  "T6.2-1": [
    {
      title: "Sheet Register",
      icon: "table",
      body: "This is sheet **Register** of template **T-LI-DOC**: the ten items of documented information ISO/IEC 27001:2022 asks the ISMS for. For each, decide its kind: a **maintained** document or a **retained** record.",
      getEl: () => $(LIDOC),
    },
    {
      title: "How to tell them apart",
      icon: "book",
      body: "The note on the right gives the rule: read what the clause asks for, in the third column, not what the item looks like.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openLearn("Framework Quick Reference", "Click **Framework Quick Reference**. It carries the orange dot.", QR_WINDOW),
    {
      title: "Clause 7.5",
      icon: "book",
      body: "Read the entry for **ISO/IEC 27001 Clause 7.5**: the two kinds of documented information, and the words of a clause that tell you which one it asks for.",
      getEl: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 Clause 7.5"]`) ?? $(QR_WINDOW),
      onEnter: () => $(`${QR_WINDOW} [data-term="ISO/IEC 27001 Clause 7.5"]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Monitoring and measurement results**.",
      steps: [
        { lead: "Clause 9.1 asks for", text: "documented information to be available **as evidence of** the results." },
        { lead: "So", text: "Evidence of what was measured: a record, even though the clause says \"available\". **Retained (a record)**." },
      ],
      onEnter: () => { if (phone()) closeQR(); docCell(KIND, 7)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => docCell(KIND, 7)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Retained (a record)** in the Monitoring and measurement results row. Next unlocks once it is chosen.",
      getEl: () => docCell(KIND, 7)?.closest("tr") ?? null,
      pointAt: () => docCell(KIND, 7),
      nextWhen: () => docCell(KIND, 7)?.value === "Retained (a record)",
      doIt: "Choose the kind of row 7",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "For each item, read what its clause asks for and apply the rule.",
      tips: [{ kind: "avoid", text: "deciding from what the item seems to be. The clause's own words decide its kind." }],
      getEl: () => $(LIDOC),
    },
    checkRowsCard("Once every item has a kind, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.2 step 2, part 1: what the wiki page misses, from the Clause 7.5 summary. Part 2 opens from the row.
  "T6.2-2q": askFromQR(2, "which Clause 7.5.2 requirements the wiki backup page misses.", "ISO/IEC 27001 Clause 7.5", "Read the entry for **ISO/IEC 27001 Clause 7.5**, the part on 7.5.2: what is made sure of when documented information is created or updated, item by item. Then hold each of the three options against what the page lacks.", "Part 2 is sheet Block of LI-DOC: the document-control block of the backup and restore page."),

  // T6.2 step 2, part 2: sheet Block, the page's document-control block. One row worked: Document ID.
  "T6.2-2": [
    {
      title: "Sheet Block",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is sheet **Block**: the seven fields of the document-control block the backup and restore page now gets, one per row.",
      getEl: () => $(DBLOCK),
    },
    {
      title: "Where each field is read",
      icon: "book",
      body: "The note on the right names the places: the wiki page and its approval, SITL-POL-000 Section 7.1 for each field's rule, and the sections that give the owner, the approver and the classification.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(WIKI, "It opens beside the sheet."),
    {
      title: "The wiki page",
      icon: "search",
      body: "What the page shows today, row by row, and at the bottom the e-mail that approved it. The row **What it is for** names the policy section it carries out.",
      getEl: () => $(pageWindow(WIKI)),
    },
    ...openDoc("SITL-POL-000", "Then click **Section 7.1** in the bar at the top of the window.").map((c, i) => (i === 0 ? { ...c, onEnter: () => shutPage(WIKI) } : c)),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Document ID**.",
      steps: [
        { lead: "Rule (Section 7.1)", text: "The ID of the policy it implements, then -PR-, then the procedure's section in that policy." },
        { lead: "The page", text: "It is how Manila carries out SITL-POL-009 Section 6.2." },
        { lead: "Record", text: "**SITL-POL-009-PR-6.2**." },
      ],
      onEnter: () => $(`${docWindow("SITL-POL-000")} section[data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => (phone() ? $(docWindow("SITL-POL-000")) : blockCell(1)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-POL-000")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **SITL-POL-009-PR-6.2** in the Document ID row. Next unlocks once it is chosen.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-POL-000"); blockCell(1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => blockCell(1)?.closest("tr") ?? null,
      pointAt: () => blockCell(1),
      nextWhen: () => blockCell(1)?.value === "SITL-POL-009-PR-6.2",
      doIt: "Fill the Document ID row",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "For each field, read its rule in Section 7.1, then the place the rule sends you to.",
      tips: [
        { kind: "note", text: "The owner is the policy's owner (Section 3) and the approver the one Section 2 names for a procedure. The classification is in SITL-STD-001 Section 3 and SITL-ADD-16 Section 7." },
        { kind: "avoid", text: "dates when the page was written or edited. Only an approval starts the clock." },
      ],
      getEl: () => $(DBLOCK),
    },
    checkRowsCard("Once every field has a value, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.2 step 3: the tracker located (sprint 5), the LI task pages and SPR-05 read; three click-the-cell questions.
  "T6.2-3": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, at sprint 5: A.5.37 and A.6.1 to A.6.7 (A.6.3 was sprint 4). The earlier sprints' rows stand as you left them. Its first row is a LearnTech Educational Solutions worked example, filled in from A to G.",
      getEl: () => $(citSel(5)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(5, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(5, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(5, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.5.37", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.5.37 to LI-A.6.7. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.5.37")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.5.37"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T6.2 step 4: column D, the status of the seven controls. One row worked: A.6.7.
  "T6.2-4": [
    {
      title: "Seven controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-05). Then choose its status in column **D**.",
      getEl: () => $(citSel(5)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.6.7 Remote working**.",
      steps: [
        { lead: "Requirement 2", text: "Protected devices and a secure connection: met. Encrypted laptops and the VPN with multi-factor authentication, in the monthly reports." },
        { lead: "Requirements 1 and 3", text: "Rules set: in part, the Group remote-working rules leave out from where and how client information is protected. Told to remote workers: not met, nothing records that they read or accepted them." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => sprintCell(5, "D Status", row62("A.6.7"))?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintCell(5, "D Status", row62("A.6.7"))?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.6.7 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(5, "D Status", row62("A.6.7"))?.closest("tr") ?? null,
      pointAt: () => sprintCell(5, "D Status", row62("A.6.7")),
      nextWhen: () => sprintCell(5, "D Status", row62("A.6.7"))?.value === "Partially implemented",
      doIt: "Choose the status of A.6.7",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "stopping at the first requirement that is met. Read every requirement against the whole observation." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(5)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.2 step 5: column E, the level of the seven controls. One row worked: A.5.37.
  "T6.2-5": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(5)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.37 Documented operating procedures**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: the CIO approved the wiki as the place for the procedures, and it keeps each edit." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed yearly? No: no other office uses the wiki, and nobody reviews the pages." },
        { lead: "Level", text: "Stop at the first No: **Level 2 Managed**. The missing IDs and approvals are its status, not its level." },
      ],
      onEnter: () => { shutPage(MM); sprintCell(5, "E Maturity level", row62("A.5.37"))?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(5, "E Maturity level", row62("A.5.37"))?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 2 Managed** in the A.5.37 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(5, "E Maturity level", row62("A.5.37"))?.closest("tr") ?? null,
      pointAt: () => sprintCell(5, "E Maturity level", row62("A.5.37")),
      nextWhen: () => sprintCell(5, "E Maturity level", row62("A.5.37"))?.value === "Level 2 Managed",
      doIt: "Choose the level of A.5.37",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Question 2 asks three things: the Group's way, the same in every office, and reviewed each year. Reviewed yearly but Manila's own is still No." }],
      getEl: () => $(citSel(5)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.2 step 6: the evidence packs of A.6.1 and A.6.7. One row worked: LI-A.6.7-03, the risk treatment plan.
  "T6.2-6": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.6.1** and **LI-A.6.7**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.6.7", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.6.7-03**.",
      steps: [
        { lead: "Evidence item", text: "The treatment plan for the remote-access risks." },
        { lead: "Already handed in?", text: "Yes: your risk treatment plan of T5.1 treats R-16-HQ-16, the remote-access VPN gateway." },
        { lead: "Record", text: "**M2610-00001_T5.1_LI-RTP_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.6.7"); packCell(EVREF, 6)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 6)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your LI-RTP file in row LI-A.6.7-03. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 6)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 6),
      nextWhen: () => (packCell(EVREF, 6)?.value ?? "").endsWith("_T5.1_LI-RTP_v1.xlsx"),
      doIt: "Fill row LI-A.6.7-03",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-05 observed (the Observed column, or the dataset on the step's Reference tab).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T6.2 step 7: sub-task 01 and the next action of the five other controls. One row worked: A.5.37.
  "T6.2-7": [
    {
      title: "Five controls, first evidence",
      icon: "table",
      body: "For **A.5.37, A.6.2, A.6.4, A.6.5** and **A.6.6**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
      getEl: () => $(citSel(5)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 6, and what G needs: the step to Level 3, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.37 Documented operating procedures**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for an operating procedure with its document-control block: your LI-DOC of step 2, **M2610-00001_T6.2_LI-DOC_v1.xlsx**." },
        { lead: "G", text: "Level 2, the wiki Manila's own way: next, **move them to the Group library under SITL-POL-000 Section 7.1, reviewed yearly**; measure, **% of procedures within review date, target 100%, quarterly**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); sprintCell(5, "F Evidence ref", row62("A.5.37"))?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(5, "F Evidence ref", row62("A.5.37"))?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.5.37 row. Next unlocks once both are in.",
      getEl: () => sprintCell(5, "F Evidence ref", row62("A.5.37"))?.closest("tr") ?? null,
      pointAt: () => sprintCell(5, "F Evidence ref", row62("A.5.37")),
      nextWhen: () => (sprintCell(5, "F Evidence ref", row62("A.5.37"))?.value ?? "").endsWith("_T6.2_LI-DOC_v1.xlsx") && (sprintCell(5, "G Gap / next action", row62("A.5.37"))?.value ?? "").includes("% of procedures within review date") && (sprintCell(5, "G Gap / next action", row62("A.5.37"))?.value ?? "").includes("Group library"),
      doIt: "Fill the A.5.37 row",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "The same for A.6.2, A.6.4, A.6.5 and A.6.6: read each one's sub-task 01 on its LI task page and what SPR-05 observed, then its level from step 5.",
      tips: [{ kind: "avoid", text: "doing the office's own way more often. Level 3 is the Group's way, in every office, reviewed yearly." }],
      getEl: () => $(citSel(5)),
    },
    checkRowsCard("Once all five rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.2 step 8: the contractor who started before screening, answered from what A.6.1 requires; no part 2.
  "T6.2-8": askOnlyFromPage(8, "what A.6.1 expects when a contractor started work before his screening was complete.", "LI-A.6.1", "Read **What it requires** in the note, all three items: who is screened, when, and what happens where screening is not complete in time. Then hold each of the three options against it."),

  // T6.2 step 9: LI-DOC and CIT-S5 named and handed in, in its row (the evidence packs went in at step 6).
  "T6.2-9": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **LI-DOC**, the register and the document-control block, and **CIT-S5**, your tracker for sprint 5. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-9 [data-guide="jobs"]') ?? $('#act-9 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 8");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-9 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-DOC**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-DOC file name" },
        { ...name, title: "Name the second file", body: "The same for **CIT-S5**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S5 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-9 [data-guide="step-complete"]') },
  ],

  // T4.1 step 1: the method card LI-RAM, seven lines, statement and source each. One line worked: 4 Risk appetite.
  "T4.1-1": [
    {
      title: "Seven lines",
      icon: "table",
      body: "This is the method card, **LI-RAM**: the risk criteria every Manila assessment will use. For each line you choose two things.",
      steps: [
        { lead: "Statement", text: "What the Group's documents set for GlobalConnect. Each line offers statements read from different places, or for other organisations." },
        { lead: "Source", text: "The document and section you read it in." },
      ],
      getEl: () => $(RAM),
    },
    {
      title: "Where each line is read",
      icon: "book",
      body: "The note on the right names where each line is read. Statement and source are checked together.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ERM-001", "Then click **Section 4** at the top to jump to the appetite."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **4 Risk appetite**.",
      steps: [
        { lead: "Read Section 4", text: "The first table gives each criticality band its maximum residual score. GlobalConnect is LOW (SITL-ADD-16, its cover table): **11**, upper Medium, a balanced posture." },
        { lead: "Statement", text: "**Maximum residual score 11 (upper Medium): balanced**." },
        { lead: "Source", text: "You read it in **SITL-ERM-001 Section 4**." },
      ],
      onEnter: () => { $(`${docWindow("SITL-ERM-001")} section[data-sec="4"]`)?.scrollIntoView({ block: "start" }); ramCell("Statement", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => (phone() ? $(docWindow("SITL-ERM-001")) : ramCell("Statement", 4)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-ERM-001")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that statement and that source in the 4 Risk appetite row. Next unlocks once both are chosen.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ERM-001"); ramCell("Statement", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => ramCell("Statement", 4)?.closest("tr") ?? null,
      alsoShow: () => $(docWindow("SITL-ERM-001")),
      nextWhen: () => ramCell("Statement", 4)?.value === "Maximum residual score 11 (upper Medium): balanced" && ramCell("Source", 4)?.value === "SITL-ERM-001 Section 4",
      doIt: "Choose the statement and source of the appetite",
    },
    {
      title: "Now the other six",
      icon: "edit",
      body: "Do the same for each line, from the place the note names.",
      steps: [
        { lead: "1, 5 and 7", text: "SITL-POL-002 Section 3.1: its statements on acceptance, on risk owners and on the registers." },
        { lead: "2", text: "SITL-POL-002 Sections 3.1 and 4: the scales every office uses, and how often a LOW organisation refreshes." },
        { lead: "3", text: "SITL-ERM-001 Sections 6.2 to 6.4: the two scales and the matrix's ratings." },
        { lead: "6", text: "The GRC Charter Section 6.1, the LOW-criticality column (rule R36)." },
      ],
      tips: [{ kind: "avoid", text: "a value from another criticality band's column. GlobalConnect is LOW." }],
      getEl: () => $(RAM),
    },
    checkRowsCard("Once every line is filled, click **Check my answers**. It shows whether each line's statement and source were right, the answer and why. Your lines lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.1 steps 2 and 3: recall questions on Clause 6.1.2, answered from its summary; no part 2.
  "T4.1-2": askOnlyFromQR(2, "what Clause 6.1.2 b) requires repeated risk assessments to produce.", "ISO/IEC 27001 Clause 6.1.2", "Read the entry for **ISO/IEC 27001 Clause 6.1.2**: what item b) asks of the process. Then hold each of the three options against it."),
  "T4.1-3": askOnlyFromQR(3, "who must be identified for each information security risk.", "ISO/IEC 27001 Clause 6.1.2", "Read the entry for **ISO/IEC 27001 Clause 6.1.2**: what item c) asks the process to identify. Then hold each of the three options against it."),

  // T4.1 step 4: tracker CIT-S2 (worked row 1, sprint 1 rows 2–5, A.5.9–A.5.14 rows 6–11); three cells to find.
  "T4.1-4": [
    {
      title: "The tracker, sprint 2",
      icon: "table",
      body: "Your control implementation tracker, **T-LI-CIT**, now for sprint 2: A.5.9 to A.5.14. The LearnTech worked row comes first, then sprint 1's rows as you left them, then your six.",
      getEl: () => $(citSel(2)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which files does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(2, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(2, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(2, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.5.9", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.5.9 to LI-A.5.14. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.5.9")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.5.9"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T4.1 step 5: column D of A.5.9–A.5.14. One row worked: A.5.11 (row 8).
  "T4.1-5": [
    {
      title: "Six controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-02). Then choose its status in column **D**.",
      getEl: () => $(citSel(2)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.11 Return of assets**.",
      steps: [
        { lead: "Requirement 1", text: "Assets handed back by the last day: met. Each leaver returns headset, access card and laptop." },
        { lead: "Requirement 2", text: "Checked against what was issued, and recorded: met. The issue log, and a signed checklist for all 46 leavers." },
        { lead: "Requirement 3", text: "Knowledge handed over: met. Team leaders and managers write a handover note." },
        { lead: "Status", text: "Every one met: **Implemented**." },
      ],
      onEnter: () => sprintCell(2, "D Status", 8)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintCell(2, "D Status", 8)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Implemented** in the A.5.11 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(2, "D Status", 8)?.closest("tr") ?? null,
      pointAt: () => sprintCell(2, "D Status", 8),
      nextWhen: () => sprintCell(2, "D Status", 8)?.value === "Implemented",
      doIt: "Choose the status of A.5.11",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "counting a Group policy as done at Manila. The observation says what the office does." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(2)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.1 step 6: column E of A.5.9–A.5.14. One row worked: A.5.13 (row 10).
  "T4.1-6": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(2)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.12 Classification of information**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: SITL-STD-001, the Group's approved standard, and a label recorded for each asset." },
        { lead: "Question 2", text: "The Group's way, the same in every office, reviewed yearly? Yes: every office classifies with it, and Manila's yearly review of January 2026 is on file." },
        { lead: "Question 3", text: "Measured against targets? No: nothing is measured. **Level 3 Defined**." },
      ],
      onEnter: () => { shutPage(MM); sprintCell(2, "E Maturity level", 9)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(2, "E Maturity level", 9)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 3 Defined** in the A.5.12 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(2, "E Maturity level", 9)?.closest("tr") ?? null,
      pointAt: () => sprintCell(2, "E Maturity level", 9),
      nextWhen: () => sprintCell(2, "E Maturity level", 9)?.value === "Level 3 Defined",
      doIt: "Choose the level of A.5.12",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [
        { kind: "note", text: "Status and level are separate questions: A.5.12 is Partially implemented and still at Level 3." },
        { kind: "avoid", text: "rating Manila's own form, note or guide as the Group's way because a Group policy exists on the same subject." },
      ],
      getEl: () => $(citSel(2)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.1 step 7: the evidence packs of A.5.9 and A.5.12. One row worked: LI-A.5.9-01, prepared from the asset register.
  "T4.1-7": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.5.9** and **LI-A.5.12**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from records the office holds, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.5.9", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.5.9-01**.",
      steps: [
        { lead: "Evidence item", text: "An extract of the office's asset inventory, with each asset's owner and classification." },
        { lead: "Already handed in?", text: "No: none of your files lists the assets." },
        { lead: "Records the office holds?", text: "Yes: the Group Information Asset Register holds Manila's 81 assets with owner and classification. **Risk Register › Asset Register** shows the extract." },
        { lead: "Record", text: "The item's own new file, **M2610-00001_T4.1_LI-A.5.9-01_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.5.9"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in row LI-A.5.9-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T4.1_LI-A.5.9-01_v1.xlsx"),
      doIt: "Fill row LI-A.5.9-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-02 observed (the Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner, in eight words or more." },
        { kind: "avoid", text: "a new file where the office holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T4.1 step 8: sub-task 01 and the next action of A.5.10, A.5.11, A.5.13, A.5.14. One row worked: A.5.14 (row 11).
  "T4.1-8": [
    {
      title: "Four controls, first evidence",
      icon: "table",
      body: "For **A.5.10**, **A.5.11**, **A.5.13** and **A.5.14**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
      getEl: () => $(citSel(2)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 7, and what G needs: the step to Level 3, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.14 Information transfer**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for a register of the external transfers, each with its agreement. Section 7 of your LI-SCOPE (F2.1) lists the interfaces where information crosses the boundary, with A.5.14 as their control: **M2610-00001_F2.1_LI-SCOPE_v1.docx**." },
        { lead: "G", text: "Level 2, because the file transfer guide is Manila's own and never reviewed: next, **a Group transfer procedure under SITL-POL-011, every office, reviewed yearly**; measure, **% of client files sent encrypted, target 100%, monthly**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); sprintCell(2, "F Evidence ref", 11)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(2, "F Evidence ref", 11)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.5.14 row. Next unlocks once both are in.",
      getEl: () => sprintCell(2, "F Evidence ref", 11)?.closest("tr") ?? null,
      pointAt: () => sprintCell(2, "F Evidence ref", 11),
      nextWhen: () => (sprintCell(2, "F Evidence ref", 11)?.value ?? "").endsWith("_F2.1_LI-SCOPE_v1.docx") && (sprintCell(2, "G Gap / next action", 11)?.value ?? "").includes("Group transfer procedure") && (sprintCell(2, "G Gap / next action", 11)?.value ?? "").includes("% of client files"),
      doIt: "Fill the A.5.14 row",
    },
    {
      title: "Now the other three",
      icon: "edit",
      body: "The same for A.5.10, A.5.11 and A.5.13: read each sub-task 01 on its LI task page and what SPR-02 observed, then its level from step 6.",
      tips: [{ kind: "avoid", text: "doing the office's own way more often. Level 3 is the Group's way, in every office, reviewed yearly." }],
      getEl: () => $(citSel(2)),
    },
    checkRowsCard("Once the four rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.1 step 9: the unregistered cloud CRM, answered from what A.5.9 requires; no part 2.
  "T4.1-9": askOnlyFromPage(9, "what you do about a cloud CRM that Sales uses and the asset inventory does not list.", "LI-A.5.9", "Read **What it requires** in the note: what the inventory must cover, and who must answer for each asset. Then hold each of the three options against it."),

  // T4.1 step 10: the tier of a list of customer e-mail addresses, from SITL-STD-001's decision tree; no part 2.
  // Both sections are read, so the card lights the whole window (askOnlyFromDoc lights the one section it is given).
  "T4.1-10": askOnlyFromDoc(10, "the lowest tier a dataset of customer e-mail addresses may have.", "SITL-STD-001", "5", "Section 2 sets the floors for regulated data: read its fourth principle. Section 5 is the decision tree: ask its questions from the top and stop at the first Yes. Then hold each of the three options against both.")
    .map((c) => (c.title === "Section 5" ? { ...c, title: "Sections 2 and 5", getEl: () => $(docWindow("SITL-STD-001")), onEnter: () => $(`${docWindow("SITL-STD-001")} section[data-sec="2"]`)?.scrollIntoView({ block: "start" }) } : c)),

  // T4.1 step 11: LI-RAM and CIT-S2 named and handed in, in its row.
  "T4.1-11": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **LI-RAM**, the method card, and **CIT-S2**, your tracker for sprint 2. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-11 [data-guide="jobs"]') ?? $('#act-11 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("docx", "1 to 10");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-11 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-RAM**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-RAM file name" },
        { ...name, title: "Name the second file", body: "The same for **CIT-S2**, in the second box: it ends in .xlsx.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S2 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-11 [data-guide="step-complete"]') },
  ],

  // T6.1 step 1: sheet Competence of T-LI-COMM, read on its two worked rows, and one of the learner's rows found from the RACI.
  "T6.1-1": [
    {
      title: "Sheet Competence",
      icon: "table",
      body: "This is sheet **Competence** of template **T-LI-COMM**: the ten role holders of dataset COMP-10, each with the competence their role needs, their qualifications and the records Manila HR holds. The first two rows are LearnTech's worked examples.",
      getEl: () => $(COMPR),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the sheet. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "The first worked row's role holder has the competence, but HR holds no proof of it. Read along the **Sanne Bakker** row and click the cell that shows the proof is missing.",
      onEnter: () => compStudy("Records on file (HR)", "Sanne Bakker")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => compStudy("Records on file (HR)", "Sanne Bakker")?.closest("tr") ?? null,
      nextWhen: () => !!$('[data-guide="study"] [data-found="proof"]'),
      doIt: "Click the cell that shows the proof is missing",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third is in your own rows: read what each role runs or answers for.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T6.1 step 2: status and action per role holder (Clause 7.2). One row worked: Jose Reyes, row 4.
  "T6.1-2": [
    {
      title: "Ten role holders to rate",
      icon: "table",
      body: "For each role holder, hold the qualifications and the records on file against the competence the role needs. Choose a **status**, then an **action** for every gap or missing record.",
      getEl: () => $(COMPR),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives Clause 7.2 and what each status means: what the role needs, what the CV shows, what HR holds.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Jose Reyes**, Cyber Risk Manager.",
      steps: [
        { lead: "The role needs", text: "ISO/IEC 27005 risk management training, or equivalent." },
        { lead: "His CV", text: "The ISO/IEC 27005 Risk Manager certificate, and seven years of risk assessments: he has it." },
        { lead: "HR holds", text: "Nothing: no copy of the certificate. Status: **Competent, but no documented evidence**." },
        { lead: "Action", text: "**Obtain a copy of his ISO/IEC 27005 certificate and file it.** Training him again would not supply the missing record." },
      ],
      onEnter: () => compCell(STATUS72, 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => compCell(STATUS72, 4)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that status and that action in the Jose Reyes row. Next unlocks once both are in.",
      getEl: () => compCell(STATUS72, 4)?.closest("tr") ?? null,
      pointAt: () => compCell(STATUS72, 4),
      nextWhen: () => compCell(STATUS72, 4)?.value === "Competent, but no documented evidence" && (compCell("Action", 4)?.value ?? "").startsWith("Obtain a copy of his ISO/IEC 27005"),
      doIt: "Fill the Jose Reyes row",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "Do the same for each role holder: what the role needs, what the CV shows, what HR holds.",
      tips: [
        { kind: "avoid", text: "counting an induction session as the competence a role needs." },
        { kind: "note", text: "Competent — evidence held writes **No action** by itself." },
      ],
      getEl: () => $(COMPR),
    },
    checkRowsCard("Once every row has its status and action, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.1 steps 3 and 4: Clauses 7.2 and 7.3, from their Quick Reference entries; no part 2.
  "T6.1-3": askOnlyFromQR(3, "what the organisation must retain under Clause 7.2.", "ISO/IEC 27001 Clause 7.2", "Read the entry for **ISO/IEC 27001 Clause 7.2** item by item, to its last, d). Then hold each of the three options against it."),
  "T6.1-4": askOnlyFromQR(4, "what people working for the organisation must be aware of under Clause 7.3.", "ISO/IEC 27001 Clause 7.3", "Read the entry for **ISO/IEC 27001 Clause 7.3**: what people are aware of, a) to c). Then hold each of the three options against it."),

  // T6.1 step 5: sheet Communication, when, with whom and how per message, from the Group plan. One row worked: the policy.
  "T6.1-5": [
    {
      title: "Five messages",
      icon: "table",
      body: "Each row is a message the Manila ISMS sends: Clause 7.4's **on what**. For each, choose **when**, **with whom** and **how** it is communicated.",
      getEl: () => $(COMMR),
    },
    {
      title: "Where to read them",
      icon: "book",
      body: "The note on the right says where: the Group ISMS communication plan, which every office follows.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("Ref-Communications", "It opens beside the sheet."),
    {
      title: "The Group plan",
      icon: "search",
      body: "One row per **kind** of message: when it is sent, to whom, how, and who sends it. Find each message's kind.",
      getEl: () => $(pageWindow("Ref-Communications")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take the first message, **SITL-POL-020**, a policy put in force.",
      steps: [
        { lead: "Its kind", text: "Information security policy issued or re-issued." },
        { lead: "When", text: "**On approval, and at each yearly re-issue**." },
        { lead: "With whom", text: "**All staff**." },
        { lead: "How", text: "**All-staff e-mail and intranet, with an acknowledgement from each person**." },
      ],
      onEnter: () => { shutPage("Ref-Communications"); commCell("B When", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => commCell("B When", 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose those three in the first row. Next unlocks once all three are in.",
      getEl: () => commCell("B When", 1)?.closest("tr") ?? null,
      pointAt: () => commCell("B When", 1),
      nextWhen: () => commCell("B When", 1)?.value === "On approval, and at each yearly re-issue" && commCell("C With whom", 1)?.value === "All staff" && (commCell("D How", 1)?.value ?? "").startsWith("All-staff e-mail"),
      doIt: "Fill the first row",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "For each message, find its kind in the plan and read its row.",
      tips: [{ kind: "avoid", text: "skipping a condition in the plan's row. Where it names one, such as a SEV1 incident, check the message against it." }],
      getEl: () => $(COMMR),
    },
    checkRowsCard("Once every row is in, click **Check my answers**. When, with whom and how are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T6.1 step 6: the tracker located, LI-A.6.3 and SPR-04 read; three click-the-cell questions.
  "T6.1-6": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, now at sprint 4: **A.6.3**. The first row is LearnTech's worked example; the earlier sprints' rows show as you left them.",
      getEl: () => $(citSel(4)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(4, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(4, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(4, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.6.3", "It opens beside the tracker."),
    {
      title: "The LI task page",
      icon: "book",
      body: "**LI-A.6.3**: the note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of a control." }],
      getEl: () => $(pageWindow("LI-A.6.3")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.6.3"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T6.1 step 7: column D for A.6.3. The rule is worked on the tracker's LearnTech row: one control, so the guide does not
  // work the learner's own.
  "T6.1-7": [
    {
      title: "One control to rate",
      icon: "table",
      body: "Read what **A.6.3** requires and what was observed at Manila (dataset SPR-04). Then choose its status in column **D**.",
      getEl: () => $(citSel(4)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    openWorked(4),
    {
      title: "The rule, on the worked row",
      icon: "help",
      body: "Take the LearnTech row, **A.8.13 Information backup**, at Amsterdam.",
      steps: [
        { lead: "Requirement 1", text: "Backups kept, as the policy says: met, every night." },
        { lead: "Requirement 2", text: "Tested by restoring them: met, each month." },
        { lead: "Requirement 3", text: "Procedure approved, backups logged: met." },
        { lead: "Status", text: "Every one met: **Implemented**." },
      ],
      onEnter: () => workedCit(4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => workedCit(4),
    },
    {
      title: "Now A.6.3",
      icon: "edit",
      body: "Take each of A.6.3's three requirements in turn against what SPR-04 observed, then choose its status.",
      tips: [{ kind: "avoid", text: "counting a session given once as a programme. Read what requirement 1 asks for." }],
      onEnter: () => sprintCell(4, "D Status", row63())?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintCell(4, "D Status", row63())?.closest("tr") ?? null,
      pointAt: () => sprintCell(4, "D Status", row63()),
      nextWhen: () => !!sprintCell(4, "D Status", row63())?.value,
      doIt: "Choose the status of A.6.3",
    },
    checkRowsCard("Click **Check my answers**. It shows the answer and why. Your row locks then, so look it over first."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  // T6.1 step 8: column E for A.6.3. The Maturity Model's questions worked on the LearnTech row, as in step 7.
  "T6.1-8": [
    {
      title: "A level for A.6.3",
      icon: "table",
      body: "Read what was observed at Manila, with the status beside it. Then choose A.6.3's maturity level in column **E**.",
      getEl: () => $(citSel(4)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    openWorked(4, () => shutPage(MM)),
    {
      title: "The questions, on the worked row",
      icon: "help",
      body: "Take the LearnTech row, **A.8.13 Information backup**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: a procedure approved by the IT lead, and logs." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed yearly? No: Amsterdam's own, never reviewed." },
        { lead: "Level", text: "Stop at the first No: **Level 2 Managed**." },
      ],
      onEnter: () => { shutPage(MM); workedCit(4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => workedCit(4),
    },
    {
      title: "Now A.6.3",
      icon: "edit",
      body: "Ask the same questions of what SPR-04 observed at Manila, then choose the level.",
      tips: [{ kind: "note", text: "Status and level are separate questions: the level rates how what is in place is done, not what is missing." }],
      onEnter: () => sprintCell(4, "E Maturity level", row63())?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintCell(4, "E Maturity level", row63())?.closest("tr") ?? null,
      pointAt: () => sprintCell(4, "E Maturity level", row63()),
      nextWhen: () => !!sprintCell(4, "E Maturity level", row63())?.value,
      doIt: "Choose the level of A.6.3",
    },
    checkRowsCard("Click **Check my answers**. The level is checked exactly: a wrong one shows the key's level and why. Your row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  // T6.1 step 9: the evidence pack of A.6.3. One row worked: LI-A.6.3-01, the campaign plan.
  "T6.1-9": [
    {
      title: "The evidence pack",
      icon: "table",
      body: "Every sub-task of **LI-A.6.3**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you hand in, else the item's own new file prepared from the dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.6.3", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.6.3-01**.",
      steps: [
        { lead: "Evidence item", text: "The office's awareness campaign plan: **AWR-PLAN**, template T-AWR." },
        { lead: "A file you hand in?", text: "Yes: AWR-PLAN is one of this task's hand-ins. You prepare it now and submit it in step 10." },
        { lead: "Record", text: "**M2610-00001_T6.1_AWR-PLAN_v1.xlsx**, not a second copy under another name. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.6.3"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your AWR-PLAN file in row LI-A.6.3-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T6.1_AWR-PLAN_v1.xlsx"),
      doIt: "Fill row LI-A.6.3-01",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-04 observed (the Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the pack to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence pack is handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T6.1 step 10: LI-COMM and AWR-PLAN named and handed in, in its row.
  "T6.1-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **LI-COMM**, sheets Competence and Communication, and **AWR-PLAN**, the campaign plan your evidence pack names. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-10 [data-guide="jobs"]') ?? $('#act-10 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 9");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-10 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-COMM**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-COMM file name" },
        { ...name, title: "Name the second file", body: "The same for **AWR-PLAN**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the AWR-PLAN file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-10 [data-guide="step-complete"]') },
  ],

  // T4.2 step 1: LI-CHAIN read, three cells found: two links of the LearnTech worked chain, and the learner's information asset.
  "T4.2-1": [
    {
      title: "Template T-LI-CHAIN",
      icon: "table",
      body: "This is **LI-CHAIN**, the asset–threat–control chains. Row 1 is a LearnTech Educational Solutions worked chain. Rows 2 to 4 are your three Manila assets, each with its chain: threat, vulnerability, consequence, existing controls and the Annex A control it ends at.",
      getEl: () => $(CHAIN),
    },
    {
      title: "Three questions",
      icon: "help",
      body: "Each question on the right asks for one cell. Answer it by clicking that cell in the table.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "What weakness does the worked chain's threat use? Read column **Vulnerability** on the LearnTech row, and click it.",
      onEnter: () => chainStudy("Vulnerability", "Learning management platform")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => chainStudy("Vulnerability", "Learning management platform")?.closest("tr") ?? null,
      pointAt: () => chainStudy("Vulnerability", "Learning management platform"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="vuln"]'),
      doIt: "Click the worked chain's vulnerability",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third is on your own rows: read their **Asset type**.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T4.2 step 2: the best of three drafts per chain, by rule R06 and SITL-POL-002 Section 7.1. One row worked: the workstations.
  "T4.2-2": [
    {
      title: "Three drafts per chain",
      icon: "table",
      body: "Sheet Drafts gives each of your chains three draft risk statements, under its row. For each chain, choose the best in column **Risk statement (R06)**. It fills LI-CHAIN.",
      getEl: () => $(DRAFTSR),
    },
    {
      title: "What a good statement has",
      icon: "book",
      body: "The note on the right gives the test: a cause true today, one event, a consequence in business terms, and the asset as the register names it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-002", "Then click **Section 7.1** in the bar at the top of the window."),
    {
      title: "Section 7.1",
      icon: "book",
      body: "The guideline for writing a risk statement: the frame of rule R06, the cause as something true today, one event per statement, and the consequence in business terms.",
      onEnter: () => $(`${docWindow("SITL-POL-002")} section[data-sec="7.1"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => $(`${docWindow("SITL-POL-002")} section[data-sec="7.1"]`) ?? $(docWindow("SITL-POL-002")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take the **Call-centre workstations** chain.",
      steps: [
        { lead: "Draft 3", text: "Two events: records seen, and a headset taken. Two events are two risks." },
        { lead: "Draft 2", text: "Its consequence is a breach of a procedure, not something the business loses, and its cause is a maybe, not a fact." },
        { lead: "Draft 1", text: "The cause is true today (screens left unattended), one event, the loss in business terms, and the asset as named: **Draft 1**." },
      ],
      onEnter: () => { shutDoc("SITL-POL-002"); draftCell(3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => draftCell(3)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Draft 1** in the Call-centre workstations row. Next unlocks once it is chosen.",
      tips: [REOPEN],
      getEl: () => draftCell(3)?.closest("tr") ?? null,
      pointAt: () => draftCell(3),
      nextWhen: () => draftCell(3)?.value === "Draft 1",
      doIt: "Choose the workstations' statement",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "Do the same for the VPN gateway and the client transaction data: hold each draft against the four tests.",
      tips: [{ kind: "avoid", text: "a draft that names another asset than column Asset, or whose cause is a general threat rather than this asset's weakness." }],
      getEl: () => $(DRAFTSR),
    },
    checkRowsCard("Once every chain has a statement, click **Check my answers**. It shows each row's answer and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.2 step 3: likelihood and impact per chain, by rule R07 on SITL-ERM-001 Sections 6.2–6.3. One row worked: the client data.
  "T4.2-3": [
    {
      title: "Rate each chain",
      icon: "table",
      body: "For each of your chains choose a **Likelihood** and an **Impact**. The inherent score fills itself.",
      getEl: () => $(CHAIN),
    },
    {
      title: "How to rate",
      icon: "book",
      body: "The note on the right gives rule R07: the score whose words the threat and the consequence use.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ERM-001", "Then click **Section 6.2** in the bar at the top of the window."),
    {
      title: "The two scales",
      icon: "book",
      body: "Section 6.2 rates likelihood by how often (several times a year, about once a year …); Section 6.3 rates impact by what is lost, in five columns. Read the row whose words your chain uses.",
      onEnter: () => $(`${docWindow("SITL-ERM-001")} section[data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => $(`${docWindow("SITL-ERM-001")} section[data-sec="6.2"]`) ?? $(docWindow("SITL-ERM-001")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Client transaction data**.",
      steps: [
        { lead: "Likelihood", text: "The threat says \"about once a year\": Section 6.2's **4 Likely**." },
        { lead: "Impact", text: "The consequence says \"large-scale personal-data harm\" and \"formal enforcement\": both in Section 6.3's row **4 Major**." },
      ],
      onEnter: () => { shutDoc("SITL-ERM-001"); chainCell("Likelihood (R07)", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => chainCell("Likelihood (R07)", 3)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **4 Likely** and **4 Major** in the Client transaction data row. Next unlocks once both are in.",
      tips: [REOPEN],
      getEl: () => chainCell("Likelihood (R07)", 3)?.closest("tr") ?? null,
      pointAt: () => chainCell("Likelihood (R07)", 3),
      nextWhen: () => chainCell("Likelihood (R07)", 3)?.value === "4 Likely" && chainCell("Impact (R07)", 3)?.value === "4 Major",
      doIt: "Rate the client data chain",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "Do the same for the VPN gateway and the workstations: the threat's frequency words, then the consequence's.",
      tips: [{ kind: "avoid", text: "lowering a rating for the existing controls. This is the inherent risk; the controls come in at step 5." }],
      getEl: () => $(CHAIN),
    },
    checkRowsCard("Once every chain is rated, click **Check my answers**. Likelihood and impact are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.2 step 4: what the brief's item 2 changes, answered from what A.5.7 requires; no part 2.
  "T4.2-4": askOnlyFromPage(4, "what you update when a threat-intelligence brief reports active exploitation of the VPN product the office runs.", "LI-A.5.7", "Read **What it requires** in the note, all three items: what threat intelligence is for once it reaches the office. Then hold each of the three options against it, and against item 2 of THR-5."),

  // T4.2 step 5, part 1: who may accept a risk above appetite (rule R36). Part 2 opens from the row.
  "T4.2-5q": askThenScreen(5, "who may accept a risk that scores above appetite.", "Part 2 is RR-UPD: your three risks with the controls that work, the owner and the acceptance authority.", "Score Risk")
    .map((c, i) => (i === 0 ? { ...c, tips: [{ kind: "unsure" as const, text: "Rule **R36** says who may accept a risk: it is in **Learn › Rule tables**." }] } : c)),

  // T4.2 step 5, part 2: RR-UPD. One row worked: R-16-HQ-17, the client's file on the FTP server.
  "T4.2-5": [
    {
      title: "RR-UPD",
      icon: "table",
      body: "Your answer is in. Part 2 is **RR-UPD**, the Manila register with your three chains added as R-16-HQ-16 to R-16-HQ-18. Their statements and inherent scores come over from LI-CHAIN.",
      getEl: () => $(RRU),
    },
    {
      title: "Three things per risk",
      icon: "book",
      body: "The note on the right says where each is read: the controls marked working (rule R07), the asset's owner in the asset register, and rule R36 for the residual rating.",
      tips: [{ kind: "note", text: "The owner is read in **Risk Register › Asset Register**, which carries the dot: find the chain's asset register entry there." }],
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **R-16-HQ-17**, client transaction data.",
      steps: [
        { lead: "Controls that work", text: "Its chain marks the IP allow-list on the FTP server working: **IP allow-list on the FTP server**. The residual becomes 3 × 4 = 12 High." },
        { lead: "Risk owner", text: "The asset is A-HQ-10 in the asset register, owned by the **Chief Delivery Officer**." },
        { lead: "Acceptance authority", text: "Rule R36 for High: **Org CEO + Group CISO**." },
      ],
      onEnter: () => rrCell("Existing controls that work", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => rrCell("Existing controls that work", 2)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose those three in the R-16-HQ-17 row. Next unlocks once all three are in.",
      getEl: () => rrCell("Existing controls that work", 2)?.closest("tr") ?? null,
      pointAt: () => rrCell("Existing controls that work", 2),
      nextWhen: () => rrCell("Existing controls that work", 2)?.value === "IP allow-list on the FTP server" && rrCell("Risk owner", 2)?.value === "Chief Delivery Officer" && rrCell("Acceptance authority (R36)", 2)?.value === "Org CEO + Group CISO",
      doIt: "Fill the R-16-HQ-17 row",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "Do the same for R-16-HQ-16 and R-16-HQ-18: count only the controls marked working, then read the owner and the authority for the residual you get.",
      tips: [{ kind: "avoid", text: "counting a control that is in place but marked not working. It takes nothing off." }],
      getEl: () => $(RRU),
    },
    checkRowsCard("Once every row is in, click **Check my answers**. The three columns are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked. The change-log rows are written from your rows and go in with the register at step 11."),
  ],

  // T4.2 step 6: the tracker located, the LI task pages and SPR-03 read; three click-the-cell questions.
  "T4.2-6": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, filtered to sprint 3: A.5.6 and A.5.7. Its first row is the LearnTech Educational Solutions worked example; the earlier sprints' rows follow as you left them, and yours come last.",
      getEl: () => $(citSel(3)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(3, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(3, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(3, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.5.6", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Each sprint control has one, LI-A.5.6 and LI-A.5.7. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.5.6")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs both LI task pages: read each one's requirements.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.5.6"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T4.2 step 7: column D for A.5.6 and A.5.7. One row worked: A.5.7.
  "T4.2-7": [
    {
      title: "Two controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-03). Then choose its status in column **D**.",
      getEl: () => $(citSel(3)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.7 Threat intelligence**.",
      steps: [
        { lead: "Requirement 1", text: "Collected from vetted sources and analysed for the office: met. The Group's analyst does it, office by office." },
        { lead: "Requirements 2 and 3", text: "Reaches the people who act, and feeds the risk assessment: not met. The brief stops with the Org CISO, and no risk cites one." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => cit42("D Status", "A.5.7", 7)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => cit42("D Status", "A.5.7", 7)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.5.7 row. Next unlocks once it is chosen.",
      getEl: () => cit42("D Status", "A.5.7", 7)?.closest("tr") ?? null,
      pointAt: () => cit42("D Status", "A.5.7", 7),
      nextWhen: () => cit42("D Status", "A.5.7", 7)?.value === "Partially implemented",
      doIt: "Choose the status of A.5.7",
    },
    {
      title: "Now A.5.6",
      icon: "edit",
      body: "Do the same for A.5.6: each requirement in turn, against what was observed.",
      tips: [{ kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." }],
      getEl: () => $(citSel(3)),
    },
    checkRowsCard("Once both controls have a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.2 step 8: column E for A.5.6 and A.5.7. One row worked: A.5.6.
  "T4.2-8": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(3)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.6 Contact with special interest groups**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: the Org CISO approved the list and the sharing note, and the forwarded alerts are kept." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed? No: the list is Manila's own and has never been reviewed." },
        { lead: "Level", text: "Stop at the first No: **Level 2 Managed**." },
      ],
      onEnter: () => { shutPage(MM); cit42("E Maturity level", "A.5.6", 8)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => cit42("E Maturity level", "A.5.6", 8)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 2 Managed** in the A.5.6 row. Next unlocks once it is chosen.",
      getEl: () => cit42("E Maturity level", "A.5.6", 8)?.closest("tr") ?? null,
      pointAt: () => cit42("E Maturity level", "A.5.6", 8),
      nextWhen: () => cit42("E Maturity level", "A.5.6", 8)?.value === "Level 2 Managed",
      doIt: "Choose the level of A.5.6",
    },
    {
      title: "Now A.5.7",
      icon: "edit",
      body: "Do the same for A.5.7: the questions in order, against what is in place at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions. A control can be partly implemented, and what is in place can still be done the Group's way." }],
      getEl: () => $(citSel(3)),
    },
    checkRowsCard("Once both controls have a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T4.2 step 9: the evidence pack of A.5.7. One row worked: LI-A.5.7-03, your RR-UPD.
  "T4.2-9": [
    {
      title: "The evidence pack",
      icon: "table",
      body: "Every sub-task of **LI-A.5.7**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from a dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.5.7", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.5.7-03**.",
      steps: [
        { lead: "Evidence item", text: "Risk-register entries and change-log rows that cite the brief." },
        { lead: "Already in 02_Working?", text: "Yes: your RR-UPD of step 5. Its risks R-16-HQ-16 and -17 came from THR-5, and its change log names the items." },
        { lead: "Record", text: "Your **RR-UPD** file. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.5.7"); packCell(EVREF, 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 3)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your RR-UPD file in row LI-A.5.7-03. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 3)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 3),
      nextWhen: () => (packCell(EVREF, 3)?.value ?? "").endsWith("_T4.2_RR-UPD_v1.xlsx"),
      doIt: "Fill row LI-A.5.7-03",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files, what SPR-03 observed, and dataset THR-5 (both on the step's Reference tab).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
        { kind: "avoid", text: "a new file where no dataset holds a record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the pack to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence pack is handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T4.2 step 10: sub-task 01 and the next action of A.5.6. Its one row is the learner's: the worked row shows the pattern.
  "T4.2-10": [
    {
      title: "First evidence for A.5.6",
      icon: "table",
      body: "For **A.5.6**: in column **F** the file of sub-task 01, its first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
      getEl: () => $(citSel(3)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 9, and what G needs: the step to Level 3, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "The pattern, worked",
      icon: "help",
      body: "The LearnTech row, **A.8.13 Information backup**, shows a finished F and G.",
      steps: [
        { lead: "F", text: "Two files that hold its evidence: the procedure and the backup log." },
        { lead: "G", text: "Level 2, because the procedure is Amsterdam's own and never reviewed: next, the Group procedure, used in every office and reviewed yearly; measure, % of monthly restore tests passed, target 100%, each quarter." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); sprintStudy(3, "G Gap / next action", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => $(`${citSel(3)} tbody tr`),
    },
    ...openPage("LI-A.5.6", "It opens beside the tracker."),
    {
      title: "Sub-task 01",
      icon: "book",
      body: "Row **LI-A.5.6-01** of the table: what you do and the evidence item it produces. Hold that item against what SPR-03 observed at Manila (the tracker's Observed column).",
      getEl: () => $(pageWindow("LI-A.5.6")),
    },
    {
      title: "Now A.5.6",
      icon: "edit",
      body: "Choose F and G in the A.5.6 row: F by the order in the note, G from its level in step 8. Next unlocks once both are in.",
      onEnter: () => { shutPage("LI-A.5.6"); cit42("F Evidence ref", "A.5.6", 10)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      tips: [{ kind: "avoid", text: "doing the office's own way more often. Level 3 is the Group's way, in every office, reviewed yearly." }],
      getEl: () => cit42("F Evidence ref", "A.5.6", 10)?.closest("tr") ?? null,
      pointAt: () => cit42("F Evidence ref", "A.5.6", 10),
      nextWhen: () => !!cit42("F Evidence ref", "A.5.6", 10)?.value && !!cit42("G Gap / next action", "A.5.6", 10)?.value,
      doIt: "Fill the A.5.6 row",
    },
    checkRowsCard("Once the row is in, click **Check my answers**. F and G are checked together; it shows the answer and why."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  // T4.2 step 11: LI-CHAIN, RR-UPD and CIT-S3 named and handed in, in its row (the change log goes with RR-UPD).
  "T4.2-11": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your three files: **LI-CHAIN**, the chains; **RR-UPD**, the register with its Change log sheet; and **CIT-S3**, your tracker for sprint 3. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-11 [data-guide="jobs"]') ?? $('#act-11 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 10");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-11 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      const input = (i: number) => box(i)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null;
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-CHAIN**, in its box.", getEl: () => box(0), pointAt: () => input(0), nextWhen: () => ok(0), doIt: "Type the LI-CHAIN file name" },
        { ...name, title: "Name the second file", body: "The same for **RR-UPD**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => input(1), onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the RR-UPD file name" },
        { ...name, title: "Name the third file", body: "And for **CIT-S3**, in the third box.", steps: undefined, getEl: () => box(2), pointAt: () => input(2), onEnter: () => box(2)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1) && ok(2), doIt: "Type the CIT-S3 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-11 [data-guide="step-complete"]') },
  ],

  // T8.2 step 1: BIA-RTO, the business impact extract. One row worked: the CRM, row 2 (row 1 is LearnTech's).
  "T8.2-1": [
    {
      title: "The business impact extract",
      icon: "table",
      body: "This is **BIA-RTO**, template **T-LI-BIA**: the five Manila services of dataset BIA-5, each with its RTO and RPO and the times the DR test of 13 June 2026 logged. You fill the last three columns. The first row is a LearnTech Educational Solutions worked example.",
      getEl: () => $(BIA),
    },
    {
      title: "How to work it out",
      icon: "book",
      body: "The note on the right gives the two sums and the rule: time to recover against the RTO, data lost against the RPO, and Met only if both are within.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Customer service**, on the CRM.",
      steps: [
        { lead: "Time to recover", text: "Outage declared 06:00, service back 15:00: **9 h**." },
        { lead: "Data lost", text: "Data recovered up to 05:30, outage declared 06:00: **30 min**." },
        { lead: "Met / Not met", text: "30 min is within the 1 h RPO, but 9 h is over the 4 h RTO: **Not met**." },
      ],
      onEnter: () => biaCell("Time to recover", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => biaCell("Time to recover", 2)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Type **9 h** and **30 min**, and choose **Not met**, in the Customer service row. Next unlocks once all three are in.",
      getEl: () => biaCell("Time to recover", 2)?.closest("tr") ?? null,
      pointAt: () => biaCell("Time to recover", 2),
      nextWhen: () => duration(biaCell("Time to recover", 2)?.value ?? "") === "9 h" && duration(biaCell("Data lost", 2)?.value ?? "") === "30 min" && biaCell("Met / Not met", 2)?.value === "Not met",
      doIt: "Fill the Customer service row",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Work out each service the same way, from its own times.",
      tips: [
        { kind: "note", text: "Read the dates as well as the times: a recovery or a recovery point can fall on another day." },
        { kind: "avoid", text: "calling a service Met when only one of its two objectives is met." },
      ],
      getEl: () => $(BIA),
    },
    checkRowsCard("Once every row is filled, click **Check my answers**. The three values of a row are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T8.2 step 2: the CRM's missed RTO, answered from what A.5.30 requires; no part 2.
  "T8.2-2": askOnlyFromPage(2, "what you record for A.5.30 when the last DR test recovered the CRM in 9 hours against a 4-hour RTO.", "LI-A.5.30", "Read **What it requires** in the note, all three items, and what each asks for once a test has run. Then hold each of the three options against it."),

  // T8.2 step 3: OBL-REG and the RoPA entry, one sheet. One row worked: OBL-01, the first duty of the Manila breach cell.
  "T8.2-3": [
    {
      title: "Two parts, one sheet",
      icon: "table",
      body: "This sheet holds **OBL-REG**, the ten obligations of the Manila office (OBL-01 to OBL-10), and under them the **ROPA** entry, four fields. Each row says where it is read.",
      getEl: () => $(OBLR),
    },
    {
      title: "How to fill it",
      icon: "book",
      body: "The note on the right gives the order of the obligations, rule R10's split, how to tell the type from Section 2.2, and where the policy is read.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-ADD-16", "Then click **Section 2** in the bar at the top of the window."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **OBL-01**.",
      steps: [
        { lead: "Read", text: "Section 2, the Manila row, Breach notification: \"72h to NPC and data subjects\". Two duties joined by \"and\": two rows (R10). The first is **Notify the NPC of a breach within 72 hours**." },
        { lead: "Type", text: "Section 2.2 gives its article: DPA 2012 Sec. 20(f), an Act's section: **Statutory**." },
        { lead: "Policy", text: "Breach notification is met under **SITL-POL-014** (SITL-POL-000 Section 3). Its owner fills in." },
      ],
      onEnter: () => $(`${docWindow("SITL-ADD-16")} section[data-sec="2"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => (phone() ? $(docWindow("SITL-ADD-16")) : oblCell(OBL_COL, 1)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-ADD-16")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that obligation, **Statutory** and **SITL-POL-014** in row OBL-01. Next unlocks once all three are in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-ADD-16"); oblCell(OBL_COL, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => oblCell(OBL_COL, 1)?.closest("tr") ?? null,
      pointAt: () => oblCell(OBL_COL, 1),
      nextWhen: () => oblCell(OBL_COL, 1)?.value === "Notify the NPC of a breach within 72 hours" && oblCell("Type", 1)?.value === "Statutory" && oblCell("Linked SITL policy (R10)", 1)?.value === "SITL-POL-014",
      doIt: "Fill row OBL-01",
    },
    {
      title: "Now the other nine",
      icon: "edit",
      body: "Go on in the addendum's order: the rest of the breach cell, Section 2.1, then Section 6. Read each duty's article in Section 2.2 for its type.",
      tips: [
        { kind: "avoid", text: "an overlay whose Applies to does not include Manila, and a duty you have already recorded." },
        { kind: "note", text: "What each policy covers is on Ref-Policy portal (Learn › Reference pages)." },
      ],
      getEl: () => $(OBLR),
    },
    ...openRegwatch("RoPA & Data Flows", "Click **RoPA & Data Flows**. It carries the orange dot and opens beside the sheet.", ROPA_WINDOW),
    {
      title: "The activity",
      icon: "search",
      body: "The Operations Manager's description of the customer-support activity, field by field. Each ROPA row names the fields it is read from, and the section of SITL-POL-017 that decides it.",
      getEl: () => $(ROPA_WINDOW),
    },
    {
      title: "Then the four ROPA rows",
      icon: "edit",
      body: "Fill the role, the lawful basis and the DPIA screening. SITL-POL-017 is in Policies › Policy Library: Section 3.2 the roles, Section 3.1 the lawful-basis questions, Section 6.2 the triggers and who carries out a DPIA.",
      onEnter: () => { if (phone()) $(`${ROPA_WINDOW} button[aria-label^="Close"]`)?.click(); },
      getEl: () => oblCell(OBL_COL, 11)?.closest("tr") ?? $(OBLR),
    },
    checkRowsCard("Once every row is filled, click **Check my answers**. Each row is checked whole; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T8.2 step 4: the tracker located, the LI task pages and SPR-09 read; three click-the-cell questions.
  "T8.2-4": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, now at sprint 9: A.5.29 to A.5.36, below the rows of the earlier sprints. Its first row is a LearnTech Educational Solutions worked example, filled in from A to G.",
      getEl: () => $(citSel(9)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(9, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(9, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(9, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.5.29", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.5.29 to LI-A.5.36. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.5.29")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.5.29"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T8.2 step 5: column D, the status of the eight controls. One row worked: A.5.29.
  "T8.2-5": [
    {
      title: "Eight controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-09). Then choose its status in column **D**.",
      getEl: () => $(citSel(9)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.29 Information security during disruption**.",
      steps: [
        { lead: "Requirement 1", text: "The plans say how security is kept: met. The plan sets two rules, for CRM access at the recovery site and for home working." },
        { lead: "Requirement 2", text: "The controls work at the recovery site: not met. The SIEM collected no logs there for six hours." },
        { lead: "Requirement 3", text: "Tested, and a gap put right: not met. The test found the gap, and nobody followed it up." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => c82("D Status", "A.5.29")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => c82("D Status", "A.5.29")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.5.29 row. Next unlocks once it is chosen.",
      getEl: () => c82("D Status", "A.5.29")?.closest("tr") ?? null,
      pointAt: () => c82("D Status", "A.5.29"),
      nextWhen: () => c82("D Status", "A.5.29")?.value === "Partially implemented",
      doIt: "Choose the status of A.5.29",
    },
    {
      title: "Now the other seven",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "counting what the Group has written, or what a client checks for itself, as done at Manila. The observation says what the office does." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(9)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T8.2 step 6: column E, the level of the eight controls. One row worked: A.5.33.
  "T8.2-6": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(9)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.33 Protection of records**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: SITL-POL-018's schedule, with the shredding contractor's certificates on record." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed each year? Yes: the same schedule everywhere, reviewed by the Group each year." },
        { lead: "Question 3", text: "Measured against targets? No: nothing is measured. **Level 3 Defined**. The recordings kept too long are its status, not its level." },
      ],
      onEnter: () => { shutPage(MM); c82("E Maturity level", "A.5.33")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => c82("E Maturity level", "A.5.33")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 3 Defined** in the A.5.33 row. Next unlocks once it is chosen.",
      getEl: () => c82("E Maturity level", "A.5.33")?.closest("tr") ?? null,
      pointAt: () => c82("E Maturity level", "A.5.33"),
      nextWhen: () => c82("E Maturity level", "A.5.33")?.value === "Level 3 Defined",
      doIt: "Choose the level of A.5.33",
    },
    {
      title: "Now the other seven",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions. A control can miss a requirement and still be done the Group's way." }],
      getEl: () => $(citSel(9)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T8.2 step 7: the evidence packs of A.5.30 and A.5.31. One row worked: LI-A.5.30-01, your BIA-RTO.
  "T8.2-7": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.5.30** and **LI-A.5.31**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from records that exist, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.5.30", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.5.30-01**.",
      steps: [
        { lead: "Evidence item", text: "A business impact extract: each service's RTO and RPO against the DR test." },
        { lead: "Already handed in?", text: "Yes: your BIA-RTO of step 1 holds it." },
        { lead: "Record", text: "**M2610-00001_T8.2_BIA-RTO_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.5.30"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your BIA-RTO file in row LI-A.5.30-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T8.2_BIA-RTO_v1.xlsx"),
      doIt: "Fill row LI-A.5.30-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-09 observed (the Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is read in the task's review." },
        { kind: "avoid", text: "a new file where no record exists to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T8.2 step 8: sub-task 01 and the next action of the six other controls. One row worked: A.5.29.
  "T8.2-8": [
    {
      title: "Six controls, first evidence",
      icon: "table",
      body: "For **A.5.29** and **A.5.32 to A.5.36**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
      getEl: () => $(citSel(9)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 7, and what G needs: the step to Level 3, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.29 Information security during disruption**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for the continuity plan's security arrangements. No file you handed in holds them, but Manila's plan does (SPR-09): its new item, **M2610-00001_T8.2_LI-A.5.29-01_v1.pdf**." },
        { lead: "G", text: "Level 2, because the plan is Manila's own and never reviewed: next, **the Group continuity procedure for its security rules, every office, reviewed yearly**; measure, **% of security checks passed per DR test, target 100%**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); c82("F Evidence ref", "A.5.29")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => c82("F Evidence ref", "A.5.29")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.5.29 row. Next unlocks once both are in.",
      getEl: () => c82("F Evidence ref", "A.5.29")?.closest("tr") ?? null,
      pointAt: () => c82("F Evidence ref", "A.5.29"),
      nextWhen: () => (c82("F Evidence ref", "A.5.29")?.value ?? "").endsWith("_T8.2_LI-A.5.29-01_v1.pdf") && (c82("G Gap / next action", "A.5.29")?.value ?? "").includes("% of security checks passed") && (c82("G Gap / next action", "A.5.29")?.value ?? "").includes("Group continuity procedure"),
      doIt: "Fill the A.5.29 row",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "The same for each: read its sub-task 01 on its LI task page and what SPR-09 observed, then its level from step 6.",
      tips: [
        { kind: "avoid", text: "doing the office's own way more often, or having it signed again. Level 3 is the Group's way, in every office, reviewed yearly." },
        { kind: "note", text: "A control at Level 3 already: choose the step that closes its gap, not one that moves it back to a way of its own." },
      ],
      getEl: () => $(citSel(9)),
    },
    checkRowsCard("Once all six rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T8.2 step 9: who may review independently, answered from what A.5.35 requires; no part 2.
  "T8.2-9": askOnlyFromPage(9, "who may carry out the independent review of the Manila IT controls.", "LI-A.5.35", "Read **What it requires** in the note, all three items: who may review, and what they must be. Then hold each of the three options against it."),

  // T8.2 step 10: BIA-RTO, OBL-REG, ROPA and CIT-S9 named and handed in, in its row (the evidence packs went in at step 7).
  "T8.2-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your four files: **BIA-RTO**, the business impact extract; **OBL-REG**, the obligations register; **ROPA**, the RoPA entry; and **CIT-S9**, your tracker for sprint 9. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-10 [data-guide="jobs"]') ?? $('#act-10 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 9");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-10 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      const card = (i: number, code: string) => ({ ...name, title: i ? "Name the next file" : "Name the file", body: i ? `The same for **${code}**, in the next box.` : `Type the first file's name, for **${code}**, in its box.`, steps: i ? undefined : name.steps, getEl: () => box(i), pointAt: () => box(i)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(i)?.scrollIntoView({ block: "nearest" }), nextWhen: () => [...Array(i + 1).keys()].every(ok), doIt: `Type the ${code} file name` });
      return [card(0, "BIA-RTO"), card(1, "OBL-REG"), card(2, "ROPA"), card(3, "CIT-S9"), submit];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-10 [data-guide="step-complete"]') },
  ],

  // T9.1 step 1: dataset PHY's floor plan, its points marked. One row worked: Z7 Server room.
  "T9.1-1": [
    {
      title: "The floor plan",
      icon: "map",
      body: "This is dataset **PHY**: the floor plan of the Manila head office, floor 12. Rooms are Z1 to Z8, doors D1 to D3 in orange, and the numbered dots are the photos step 2 works on.",
      getEl: () => $('[data-guide="phy-plan"]'),
    },
    {
      title: "Sheet Floor plan",
      icon: "table",
      body: "Template **T-LI-PHY**, sheet Floor plan: one row per point of the plan, with what it holds and who goes there. Mark each one by who may be there.",
      getEl: () => $(PLANR),
    },
    {
      title: "The four markings",
      icon: "book",
      body: "The note on the right defines them: Public area, Perimeter entry point, Office area and Secure area.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Z7 Server room**.",
      steps: [
        { lead: "What it holds", text: "The core network, the PBX and the call-recording servers: information-processing equipment." },
        { lead: "Who enters", text: "Only the IT staff named on its access list." },
        { lead: "Marking", text: "**Secure area**." },
      ],
      onEnter: () => planCell9("Marking", 8)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => planCell9("Marking", 8)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Secure area** in the Z7 row. Next unlocks once it is chosen.",
      getEl: () => planCell9("Marking", 8)?.closest("tr") ?? null,
      pointAt: () => planCell9("Marking", 8),
      nextWhen: () => planCell9("Marking", 8)?.value === "Secure area",
      doIt: "Mark Z7",
    },
    {
      title: "Now the other ten",
      icon: "edit",
      body: "For each point, read what it is and who goes there, then hold it against the four markings.",
      tips: [{ kind: "note", text: "The doors D1 to D3 are points too: read what each one is for." }],
      getEl: () => $(PLANR),
    },
    checkRowsCard("Once every point is marked, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.1 step 2: sheet Photos, each photo's control and finding. One row worked: P05, the fire exit.
  "T9.1-2": [
    {
      title: "Twenty photos",
      icon: "table",
      body: "Sheet **Photos**: one row per photo of the walkthrough, its number on the floor plan above and its caption. For each, choose the A.7 control it is evidence for, then **Good practice** or **Gap**.",
      getEl: () => $(WALKR),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right: the control is the one whose requirement the photo shows; Good practice where it is met, Gap where it is not.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.7.1", "It opens beside the sheet."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every A.7 control has one, LI-A.7.1 to LI-A.7.14. Its note says **what the control requires**, numbered. A photo is evidence for the control whose requirement it shows.",
      getEl: () => $(pageWindow("LI-A.7.1")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **P05**, at D3 Fire exit.",
      steps: [
        { lead: "It shows", text: "The fire exit wedged open, its door alarm isolated." },
        { lead: "Which requirement", text: "LI-A.7.1, requirement 3: fire doors in the perimeter are alarmed, monitored and close by themselves. Control: **A.7.1 Physical security perimeters**." },
        { lead: "Met?", text: "No: **Gap**. Action, with its owner: close the fire exit and reset its alarm, checked daily, owner the Manila facilities manager." },
      ],
      onEnter: () => { shutPage("LI-A.7.1"); walkCell("Control", 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => walkCell("Control", 5)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "In the P05 row choose A.7.1 and Gap, then write the action. Next unlocks once all three are in.",
      getEl: () => walkCell("Control", 5)?.closest("tr") ?? null,
      pointAt: () => walkCell("Control", 5),
      nextWhen: () => (walkCell("Control", 5)?.value ?? "").startsWith("A.7.1 ") && walkCell("Good practice or gap", 5)?.value === "Gap" && sentence(walkCell("Action", 5)),
      doIt: "Fill the P05 row",
    },
    {
      title: "Now the other nineteen",
      icon: "edit",
      body: "For each photo, read its caption, find the requirement it shows on the LI task pages, then judge whether it is met.",
      tips: [
        { kind: "note", text: "The control titles help you narrow it down; the requirements decide it." },
        { kind: "avoid", text: "writing an action on a good practice row: it fills with a dash by itself." },
      ],
      getEl: () => $(WALKR),
    },
    checkRowsCard("Once every photo has its control and finding, and every gap its action, click **Check my answers**. Control and finding are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.1 step 3: the water threat, answered from what A.7.5 requires; no part 2.
  "T9.1-3": askOnlyFromPage(3, "which control the water above the server room affects.", "LI-A.7.5", "Read **What it requires** in the note: the threats it covers and how equipment rooms are protected against them. Then hold each of the three options against it."),

  // T9.1 step 4: what A.7.14 needs, answered from the Disposal row of SITL-STD-001 Section 6; no part 2.
  "T9.1-4": askOnlyFromDoc(4, "what A.7.14 needs before old laptops are given to staff.", "SITL-STD-001", "6", "Read the **Disposal** row of the handling matrix: how storage is cleared at each tier. Then hold each of the three options against it."),

  // T9.1 step 5: the tracker located, the LI task pages and SPR-10 read; three click-the-cell questions.
  "T9.1-5": [
    {
      title: "The tracker",
      icon: "table",
      body: "Your control implementation tracker, **T-LI-CIT**, for sprint 10: A.7.1 to A.7.14, after the rows of the earlier sprints. Its first row is a LearnTech Educational Solutions worked example, filled in from A to G.",
      getEl: () => $(citSel(10)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(10, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(10, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(10, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.7.1", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.7.1 to LI-A.7.14. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.7.1")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.7.1"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T9.1 step 6: column D, the status of the 14 controls. One row worked: A.7.1.
  "T9.1-6": [
    {
      title: "Fourteen controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-10). Then choose its status in column **D**.",
      getEl: () => $(citSel(10)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.7.1 Physical security perimeters**.",
      steps: [
        { lead: "Requirements 1 and 2", text: "Perimeter set, walls to the slab, doors shut and badged: met." },
        { lead: "Requirement 3", text: "Fire doors alarmed and monitored: not met. The fire exit was wedged open, its alarm isolated." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => sprintCell(10, "D Status", row10("A.7.1"))?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintCell(10, "D Status", row10("A.7.1"))?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.7.1 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(10, "D Status", row10("A.7.1"))?.closest("tr") ?? null,
      pointAt: () => sprintCell(10, "D Status", row10("A.7.1")),
      nextWhen: () => sprintCell(10, "D Status", row10("A.7.1"))?.value === "Partially implemented",
      doIt: "Choose the status of A.7.1",
    },
    {
      title: "Now the other thirteen",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "counting what the Group procedure says as done at Manila. The observation says what the office does." },
        { kind: "note", text: "Your walkthrough photos show many of the same findings." },
      ],
      getEl: () => $(citSel(10)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.1 step 7: column E, the level of the 14 controls. One row worked: A.7.4.
  "T9.1-7": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(10)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.7.4 Physical security monitoring**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: Manila's CCTV procedure, approved in 2024, with alarm test records." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed yearly? No: it is Manila's own and has never been reviewed." },
        { lead: "Level", text: "Stop at the first No: **Level 2 Managed**." },
      ],
      onEnter: () => { shutPage(MM); sprintCell(10, "E Maturity level", row10("A.7.4"))?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(10, "E Maturity level", row10("A.7.4"))?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 2 Managed** in the A.7.4 row. Next unlocks once it is chosen.",
      getEl: () => sprintCell(10, "E Maturity level", row10("A.7.4"))?.closest("tr") ?? null,
      pointAt: () => sprintCell(10, "E Maturity level", row10("A.7.4")),
      nextWhen: () => sprintCell(10, "E Maturity level", row10("A.7.4"))?.value === "Level 2 Managed",
      doIt: "Choose the level of A.7.4",
    },
    {
      title: "Now the other thirteen",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions. A control can be Partially implemented and still be done the Group's way." }],
      getEl: () => $(citSel(10)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.1 step 8: the evidence packs of A.7.2 and A.7.14. One row worked: LI-A.7.2-01, the walkthrough.
  "T9.1-8": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.7.2** and **LI-A.7.14**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.7.2", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.7.2-01**.",
      steps: [
        { lead: "Evidence item", text: "Walkthrough findings at each entry point." },
        { lead: "Already in a file?", text: "Yes: your PHY-WALK of steps 1 and 2 marks D1 to D3 and holds the photos taken there." },
        { lead: "Record", text: "**M2610-00001_T9.1_PHY-WALK_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.7.2"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your PHY-WALK file in row LI-A.7.2-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T9.1_PHY-WALK_v1.xlsx"),
      doIt: "Fill row LI-A.7.2-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-10 observed (the Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T9.1 step 9: sub-task 01 and the next action of the twelve other controls. One row worked: A.7.1.
  "T9.1-9": [
    {
      title: "Twelve controls, first evidence",
      icon: "table",
      body: "For A.7.1 and A.7.3 to A.7.13: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action and the Level 4 measure.",
      getEl: () => $(citSel(10)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 8, and what G needs: the next step for the control, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.7.1 Physical security perimeters**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for the marked floor plan: your PHY-WALK, **M2610-00001_T9.1_PHY-WALK_v1.xlsx**." },
        { lead: "G", text: "Already Level 3, the Group's way: next, close the gap the walkthrough found, **keep the fire exit shut and its alarm on, checked daily**; measure, **% of fire doors passing the monthly alarm test, target 100%, monthly**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); sprintCell(10, "F Evidence ref", row10("A.7.1"))?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => sprintCell(10, "F Evidence ref", row10("A.7.1"))?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.7.1 row. Next unlocks once both are in.",
      getEl: () => sprintCell(10, "F Evidence ref", row10("A.7.1"))?.closest("tr") ?? null,
      pointAt: () => sprintCell(10, "F Evidence ref", row10("A.7.1")),
      nextWhen: () => (sprintCell(10, "F Evidence ref", row10("A.7.1"))?.value ?? "").endsWith("_T9.1_PHY-WALK_v1.xlsx") && (sprintCell(10, "G Gap / next action", row10("A.7.1"))?.value ?? "").includes("keep the fire exit") && (sprintCell(10, "G Gap / next action", row10("A.7.1"))?.value ?? "").includes("target"),
      doIt: "Fill the A.7.1 row",
    },
    {
      title: "Now the other eleven",
      icon: "edit",
      body: "The same for each: its sub-task 01 on its LI task page, what SPR-10 observed, and its level from step 7.",
      tips: [{ kind: "avoid", text: "a Manila-only procedure for a control the Group already runs in every office: that is a step back from Level 3." }],
      getEl: () => $(citSel(10)),
    },
    checkRowsCard("Once every row is in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.1 step 10: PHY-WALK and CIT-S10 named and handed in, in its row.
  "T9.1-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **PHY-WALK**, the floor plan and the photos, and **CIT-S10**, your tracker for sprint 10. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-10 [data-guide="jobs"]') ?? $('#act-10 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 9");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-10 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **PHY-WALK**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the PHY-WALK file name" },
        { ...name, title: "Name the second file", body: "The same for **CIT-S10**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S10 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-10 [data-guide="step-complete"]') },
  ],

  // T9.2 step 1: VUL-TEST, class, due date and status of the 40 findings. One row worked: VUL-0007, row 1.
  "T9.2-1": [
    {
      title: "The SLA test",
      icon: "table",
      body: "This is **VUL-TEST**, template **T-VUL**: the 40 findings of dataset VUL-40, sampled from the Manila scanner. For each, record its **class**, its **due date** and its **status** on the test date, 30 November 2026.",
      getEl: () => $(VULR),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule in three parts: the class from exposure, KEV listing and CVSS; the due date from the first detected date; the status from the dates, the last scan and the exception.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("Ref-Test rules", "It opens beside the sheet."),
    {
      title: "The rules, with their source",
      icon: "search",
      body: "One row per rule: the class, the due date, the status at the test date, a valid exception. Each says where it comes from in **SITL-POL-010**.",
      getEl: () => $(pageWindow("Ref-Test rules")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **VUL-0007**, row 1: the call centre workstation image.",
      steps: [
        { lead: "Class", text: "Internal, KEV-listed: **Class 2 (14 days)**. Its CVSS of 8.1 alone would be High, class 3, but a KEV listing moves it up." },
        { lead: "Due date", text: "First detected 2026-10-28 + 14 days = **2026-11-11**." },
        { lead: "Status", text: "Closed 2026-11-06, before its due date, and the scan of 2026-11-10 no longer finds it: **Within SLA — closed on time, verified by re-scan**." },
      ],
      onEnter: () => { shutPage("Ref-Test rules"); vulCell("Class (R24)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => vulCell("Class (R24)", 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Record those three in row 1. Next unlocks once all three are in.",
      getEl: () => vulCell("Class (R24)", 1)?.closest("tr") ?? null,
      pointAt: () => vulCell("Class (R24)", 1),
      nextWhen: () => vulCell("Class (R24)", 1)?.value === "Class 2 (14 days)" && vulCell("Due date", 1)?.value === "2026-11-11" && (vulCell("Status at 30 November 2026", 1)?.value ?? "").startsWith("Within SLA — closed on time"),
      doIt: "Fill row 1",
    },
    {
      title: "Now the other 39",
      icon: "edit",
      body: "The same for each finding: class, then due date, then status.",
      tips: [
        { kind: "avoid", text: "trusting a closed date alone. If the last scan after it still finds the finding, it is open again, with its original due date." },
        { kind: "note", text: "An exception counts only if the system owner **and** the CISO approved it, it has a compensating control, and it has not expired on 30 November." },
      ],
      getEl: () => $(VULR),
    },
    checkRowsCard("Once every finding has its three values, click **Check my answers**. Class, due date and status are checked together; each row shows its answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.2 step 2: the class and status of a KEV-listed, internet-facing finding, from rule R24 on Ref-Test rules; no part 2.
  "T9.2-2": askOnlyFromPage(2, "the status of an internet-facing, KEV-listed finding detected 10 days ago, not fixed and with no exception.", "Ref-Test rules", "Read the **Vulnerability class** row: which class this finding is, and how many days that class has. Then the **Status at the test date** row. Then hold each of the three options against them."),

  // T9.2 step 3: the tracker located, the LI task pages and SPR-11 read; three click-the-cell questions.
  "T9.2-3": [
    {
      title: "The tracker, sprint 11",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**. Its first row is the LearnTech Educational Solutions worked example, then the rows of your earlier sprints, then this sprint's 13 controls: **A.8.1 to A.8.8** and **A.8.13 to A.8.17**, at the end.",
      getEl: () => $(citSel(11)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "The first question asks for the owner of the control whose LI task page asks for an SLA test of sampled findings: the work of step 1. Click it in column **C**.",
      onEnter: () => c92Study("C Owner role", "A.8.8")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => c92Study("C Owner role", "A.8.8")?.closest("tr") ?? null,
      pointAt: () => c92Study("C Owner role", "A.8.8"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="sla"]'),
      doIt: "Click the owner of the control the SLA test evidences",
    },
    ...openPage("LI-A.8.8", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.8.1 to LI-A.8.17. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.8.8")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way: one is read in your own A.8.13 row (the worked row is the same control), the other on the LI task pages, then in column C.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.8.8"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T9.2 step 4: column D, the status of the 13 controls. One row worked: A.8.6.
  "T9.2-4": [
    {
      title: "Thirteen controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-11). Then choose its status in column **D**.",
      getEl: () => $(citSel(11)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.8.6 Capacity management**.",
      steps: [
        { lead: "Requirement 1", text: "Use monitored: met. Server, storage and telephony use is recorded each month." },
        { lead: "Requirements 2 and 3", text: "Future needs projected, capacity added in time: not met. No plan for 2027, and the recording servers reached 94% before more storage came." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => c92("D Status", "A.8.6")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => c92("D Status", "A.8.6")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.8.6 row. Next unlocks once it is chosen.",
      getEl: () => c92("D Status", "A.8.6")?.closest("tr") ?? null,
      pointAt: () => c92("D Status", "A.8.6"),
      nextWhen: () => c92("D Status", "A.8.6")?.value === "Partially implemented",
      doIt: "Choose the status of A.8.6",
    },
    {
      title: "Now the other twelve",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "counting a Group policy as done at Manila. The observation says what the office does." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(11)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.2 step 5: column E, the level of the 13 controls. One row worked: A.8.17.
  "T9.2-5": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(11)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.8.17 Clock synchronization**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: the Group's time sources, set under SITL-POL-009, and the SIEM's offset report." },
        { lead: "Question 2", text: "The Group's way, the same in every office, reviewed yearly? Yes: set the same way everywhere, reviewed in March 2026." },
        { lead: "Question 3", text: "Measured against a target? No: nothing is. Stop: **Level 3 Defined**." },
      ],
      onEnter: () => { shutPage(MM); c92("E Maturity level", "A.8.17")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => c92("E Maturity level", "A.8.17")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 3 Defined** in the A.8.17 row. Next unlocks once it is chosen.",
      getEl: () => c92("E Maturity level", "A.8.17")?.closest("tr") ?? null,
      pointAt: () => c92("E Maturity level", "A.8.17"),
      nextWhen: () => c92("E Maturity level", "A.8.17")?.value === "Level 3 Defined",
      doIt: "Choose the level of A.8.17",
    },
    {
      title: "Now the other twelve",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions. A control can be Implemented and still be done the office's own way." }],
      getEl: () => $(citSel(11)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.2 step 6: the evidence packs of A.8.8 and A.8.13. One row worked: LI-A.8.8-01, your VUL-TEST.
  "T9.2-6": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.8.8** and **LI-A.8.13**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.8.8", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.8.8-01**.",
      steps: [
        { lead: "Evidence item", text: "An SLA test of a sample of findings: class, due date and status of each." },
        { lead: "Already in 02_Working?", text: "Yes: your VUL-TEST of step 1 is that test." },
        { lead: "Record", text: "**M2610-00001_T9.2_VUL-TEST_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.8.8"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your VUL-TEST file in row LI-A.8.8-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T9.2_VUL-TEST_v1.xlsx"),
      doIt: "Fill row LI-A.8.8-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-11 observed (the sheet's Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T9.2 step 7: sub-task 01 and the next action of the 11 controls that are not deep dives. One row worked: A.8.3.
  "T9.2-7": [
    {
      title: "Eleven controls, first evidence",
      icon: "table",
      body: "For **A.8.1 to A.8.7** and **A.8.14 to A.8.17**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action and the Level 4 measure.",
      getEl: () => $(citSel(11)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 6. For G, read the level you gave the control in step 5: below Level 3, the step to the Group's way; at Level 3, keep it. Either way, a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A one-off action is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.8.3 Information access restriction**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for the access rules by system and role: your ACC-RULES of T7.1, **M2610-00001_T7.1_ACC-RULES_v1.xlsx**." },
        { lead: "G", text: "Level 2, Manila's own role matrix: next, **the Group access rules matrix, in every office, reviewed yearly**; measure, **% of client folders open only to their roles, target 100%, quarterly**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); c92("F Evidence ref", "A.8.3")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => c92("F Evidence ref", "A.8.3")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.8.3 row. Next unlocks once both are in.",
      getEl: () => c92("F Evidence ref", "A.8.3")?.closest("tr") ?? null,
      pointAt: () => c92("F Evidence ref", "A.8.3"),
      nextWhen: () => (c92("F Evidence ref", "A.8.3")?.value ?? "").endsWith("_T7.1_ACC-RULES_v1.xlsx") && (c92("G Gap / next action", "A.8.3")?.value ?? "").startsWith("Next: the Group access rules matrix") && (c92("G Gap / next action", "A.8.3")?.value ?? "").includes("target 100%"),
      doIt: "Fill the A.8.3 row",
    },
    {
      title: "Now the other ten",
      icon: "edit",
      body: "The same for each: its sub-task 01 on its LI task page and what SPR-11 observed, then its level from step 5.",
      tips: [{ kind: "avoid", text: "doing the office's own way more often. Level 3 is the Group's way, in every office, reviewed yearly." }],
      getEl: () => $(citSel(11)),
    },
    checkRowsCard("Once all eleven rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T9.2 step 8: backups never restored, answered from SITL-POL-009 Section 4; no part 2.
  "T9.2-8": askOnlyFromDoc(8, "what you record for A.8.13 when the backups run every night but no restore has been tested in 12 months.", "SITL-POL-009", "4", "Read the **Backup restore test** row of the table: how often a LOW organisation, such as GlobalConnect, must test a restore. Then hold each of the three options against it."),

  // T9.2 step 9: 7-day, deletable logs, answered from what A.8.15 requires; no part 2.
  "T9.2-9": askOnlyFromPage(9, "which control is affected when security logs are kept for 7 days and administrators can delete them.", "LI-A.8.15", "Read **What it requires** in the note, all three items: what A.8.15 asks of logs. Then hold each of the three options against it."),

  // T9.2 step 10: VUL-TEST and CIT-S11 named and handed in, in its row.
  "T9.2-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **VUL-TEST**, the SLA test of the 40 findings, and **CIT-S11**, your tracker for sprint 11. The evidence packs went in at step 6. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-10 [data-guide="jobs"]') ?? $('#act-10 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 9");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-10 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **VUL-TEST**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the VUL-TEST file name" },
        { ...name, title: "Name the second file", body: "The same for **CIT-S11**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S11 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-10 [data-guide="step-complete"]') },
  ],

  // T10.1 step 1: CFG-BASE, Compliant or Drift and the fix. One row worked: CFG-05, the IAM's administrator MFA.
  "T10.1-1": [
    {
      title: "Sheet CFG-BASE",
      icon: "table",
      body: "This is **CFG-BASE**, template **T-LI-CFG**: the 12 settings of dataset CFG, each with its system, classification, baseline and the value configured on 30 November 2026. For each, decide **Compliant** or **Drift**; for a drift, choose the fix.",
      getEl: () => $(CFGR),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: hold the configured value against every part of the baseline. A stronger value meets it; anything missing, weaker or extra is a drift.",
      tips: [{ kind: "note", text: "The baseline cites SITL-STD-001 Section 6 (Policies › Policy Library), which asks more of Tier 4 than of Tier 3. Read the Classification first." }],
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **CFG-05**, the IAM's administrator MFA.",
      steps: [
        { lead: "Tier", text: "Identity and access management is Client-Restricted: Tier 4." },
        { lead: "Baseline", text: "Phishing-resistant MFA, a FIDO2 key or a certificate, for every administrator." },
        { lead: "Configured", text: "A push approval on a phone app. A tricked administrator can approve a push, so it is not phishing-resistant: **Drift**." },
        { lead: "Fix", text: "**Enrol every administrator on a FIDO2 security key and turn push approval off for admin roles.** Number matching still leaves a push." },
      ],
      onEnter: () => cfgCell("Compliant or Drift", 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => cfgCell("Compliant or Drift", 5)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Drift** in the CFG-05 row, then that fix. Next unlocks once both are in.",
      getEl: () => cfgCell("Compliant or Drift", 5)?.closest("tr") ?? null,
      pointAt: () => (cfgCell("Compliant or Drift", 5)?.value === "Drift" ? cfgCell("Fix", 5) : cfgCell("Compliant or Drift", 5)),
      nextWhen: () => cfgCell("Compliant or Drift", 5)?.value === "Drift" && (cfgCell("Fix", 5)?.value ?? "").startsWith("Enrol every administrator"),
      doIt: "Fill the CFG-05 row",
    },
    {
      title: "Now the other eleven",
      icon: "edit",
      body: "Do the same for each setting: its tier first, then the baseline part by part against the configured value.",
      tips: [
        { kind: "note", text: "A compliant setting needs no fix: None fills in by itself." },
        { kind: "avoid", text: "calling a setting Drift because a stronger one is possible. Drift means the baseline is not met." },
      ],
      getEl: () => $(CFGR),
    },
    checkRowsCard("Once every setting is decided and every drift has its fix, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T10.1 step 2: sheet Crypto. One row worked: K-01, the mail transport certificate.
  "T10.1-2": [
    {
      title: "Sheet Crypto",
      icon: "table",
      body: "This is **CRY-REG**, sheet Crypto of T-LI-CFG: every encryption use and key found in datasets CFG and NET, with the extract line it was found in. For each, record five things.",
      getEl: () => $(CRYR),
    },
    {
      title: "Where each value is read",
      icon: "book",
      body: "The note on the right says where: the algorithm, the store, the period and the last renewal from the extract line; the owner from TSA-16 Asset_System_Map.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(ASM, "It opens beside the sheet."),
    {
      title: "System owners",
      icon: "search",
      body: "One row per Manila system, with its owner, classification and network zone. A key's owner is the owner of the system it protects.",
      getEl: () => $(pageWindow(ASM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **K-01**, the mail transport certificate.",
      steps: [
        { lead: "Extract line", text: "RSA 2048, held in the mail gateway's certificate store, renewed every 12 months, last 2026-03-02." },
        { lead: "Owner", text: "Enterprise directory and email belongs to the **Chief Information Officer (CIO)** on Asset_System_Map." },
        { lead: "Next rotation", text: "2026-03-02 plus 12 months: **2027-03-02**." },
      ],
      onEnter: () => { shutPage(ASM); cryCell("Algorithm and key length", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => cryCell("Algorithm and key length", 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "In row K-01 choose RSA 2048, The system's own certificate store, the CIO and 12 months, and set the next rotation to 2027-03-02. Next unlocks once all five are in.",
      getEl: () => cryCell("Algorithm and key length", 1)?.closest("tr") ?? null,
      pointAt: () => cryCell("Algorithm and key length", 1),
      nextWhen: () => cryCell("Algorithm and key length", 1)?.value === "RSA 2048" && cryCell("Where the key is stored", 1)?.value === "The system's own certificate store" && (cryCell("Owner", 1)?.value ?? "").startsWith("Chief Information Officer") && cryCell("Rotation period", 1)?.value === "12 months" && cryCell("Next rotation", 1)?.value === "2027-03-02",
      doIt: "Fill the K-01 row",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each key, read its extract line, then its system's owner on Asset_System_Map.",
      tips: [
        { kind: "note", text: "Where the line sets no rotation period, choose None set and tick none for the date." },
        { kind: "avoid", text: "the place the data is kept. The column asks where the key itself is held." },
      ],
      getEl: () => $(CRYR),
    },
    checkRowsCard("Once every key has its five values, click **Check my answers**. The five are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T10.1 step 3: the tracker located, the LI task pages and SPR-12 read; three click-the-cell questions.
  "T10.1-3": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, at sprint 12: A.8.9 to A.8.12 and A.8.18 to A.8.24. Its first row is a LearnTech Educational Solutions worked example; the earlier sprints' rows stand as you left them, and your eleven controls come last.",
      getEl: () => $(citSel(12)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which control keeps guest and wireless networks apart? Read the **What it requires** column on your rows, then click that control's title in column **B**.",
      onEnter: () => sprintStudy(12, "B Title", "A.8.22")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(12, "B Title", "A.8.22")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(12, "B Title", "A.8.22"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="guest"]'),
      doIt: "Click A.8.22's title",
    },
    ...openPage("LI-A.8.24", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.8.9 to LI-A.8.24. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.8.24")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. Both need the LI task pages: read their requirements and their sub-tasks.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.8.24"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T10.1 step 4: column D, the status of the eleven controls. One row worked: A.8.19.
  "T10.1-4": [
    {
      title: "Eleven controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-12). Then choose its status in column **D**.",
      getEl: () => $(citSel(12)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.8.19 Installation of software on operational systems**.",
      steps: [
        { lead: "Requirement 1", text: "Only authorised administrators install, through an approved change: met. Server administrators install, each time with a ticket the Head of Infrastructure approved." },
        { lead: "Requirement 2", text: "Only approved software: met. Only software on Manila's approved list." },
        { lead: "Requirement 3", text: "Installations recorded, users cannot install: met. The change log, and no administrator rights for agents." },
        { lead: "Status", text: "Every one met: **Implemented**. That the list is Manila's own is a question for its level, in step 5." },
      ],
      onEnter: () => s12Cell("D Status", "A.8.19")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => s12Cell("D Status", "A.8.19")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Implemented** in the A.8.19 row. Next unlocks once it is chosen.",
      getEl: () => s12Cell("D Status", "A.8.19")?.closest("tr") ?? null,
      pointAt: () => s12Cell("D Status", "A.8.19"),
      nextWhen: () => s12Cell("D Status", "A.8.19")?.value === "Implemented",
      doIt: "Choose the status of A.8.19",
    },
    {
      title: "Now the other ten",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "counting what the Group has written as done at Manila. The observation says what the office does." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(12)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T10.1 step 5: column E, the level of the eleven controls. One row worked: A.8.20.
  "T10.1-5": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(12)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.8.20 Networks security**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? Yes: the network is run under SITL-POL-011, with its logs in the SIEM." },
        { lead: "Question 2", text: "The Group's way, in every office, reviewed at least once a year? SITL-POL-011 applies in every office, but it was last approved on 29 September 2025 and its yearly review has not been held: No." },
        { lead: "Level", text: "Stop at the first No: **Level 2 Managed**." },
      ],
      onEnter: () => { shutPage(MM); s12Cell("E Maturity level", "A.8.20")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => s12Cell("E Maturity level", "A.8.20")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 2 Managed** in the A.8.20 row. Next unlocks once it is chosen.",
      getEl: () => s12Cell("E Maturity level", "A.8.20")?.closest("tr") ?? null,
      pointAt: () => s12Cell("E Maturity level", "A.8.20"),
      nextWhen: () => s12Cell("E Maturity level", "A.8.20")?.value === "Level 2 Managed",
      doIt: "Choose the level of A.8.20",
    },
    {
      title: "Now the other ten",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions. A control can be Implemented and still be done the office's own way, or have a gap and still be done the Group's way." }],
      getEl: () => $(citSel(12)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T10.1 step 6: the evidence packs of A.8.9 and A.8.24. One row worked: LI-A.8.9-01, the baseline check.
  "T10.1-6": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.8.9** and **LI-A.8.24**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.8.9", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.8.9-01**.",
      steps: [
        { lead: "Evidence item", text: "A configuration baseline check of the office's systems." },
        { lead: "Already handed in?", text: "Yes: your CFG-BASE of step 1 is that check." },
        { lead: "Record", text: "**M2610-00001_T10.1_CFG-BASE_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.8.9"); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your CFG-BASE file in row LI-A.8.9-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 1),
      nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T10.1_CFG-BASE_v1.xlsx"),
      doIt: "Fill row LI-A.8.9-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-12 observed (the sheet's Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T10.1 step 7: sub-task 01 and the next action of the nine other controls. One row worked: A.8.20.
  "T10.1-7": [
    {
      title: "Nine controls, first evidence",
      icon: "table",
      body: "For the nine controls that are not deep dives: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action at the control's level and the Level 4 measure.",
      getEl: () => $(citSel(12)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 6, and what G needs: the step to Level 3, or keeping it where it is there already, and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.8.20 Networks security**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for the network devices' configurations checked against their baselines: your CFG-BASE of step 1 holds the core firewall's rows, **M2610-00001_T10.1_CFG-BASE_v1.xlsx**." },
        { lead: "G", text: "Level 2, because SITL-POL-011's yearly review is overdue: next, **the Group reviews SITL-POL-011 and then yearly**; measure, **% of network devices matching their baseline, target 100%, quarterly**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); s12Cell("F Evidence ref", "A.8.20")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => s12Cell("F Evidence ref", "A.8.20")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.8.20 row. Next unlocks once both are in.",
      getEl: () => s12Cell("F Evidence ref", "A.8.20")?.closest("tr") ?? null,
      pointAt: () => s12Cell("F Evidence ref", "A.8.20"),
      nextWhen: () => (s12Cell("F Evidence ref", "A.8.20")?.value ?? "").endsWith("_T10.1_CFG-BASE_v1.xlsx") && (s12Cell("G Gap / next action", "A.8.20")?.value ?? "").includes("Group reviews SITL-POL-011") && (s12Cell("G Gap / next action", "A.8.20")?.value ?? "").includes("network devices matching"),
      doIt: "Fill the A.8.20 row",
    },
    {
      title: "Now the other eight",
      icon: "edit",
      body: "For each, read its sub-task 01 on its LI task page and what SPR-12 observed, then its level in column E.",
      tips: [
        { kind: "avoid", text: "moving a control that is already at Level 3 to the Group's way: it is there. Its next step is a measure." },
        { kind: "avoid", text: "doing the office's own way more often. Level 3 is the Group's way, in every office, reviewed yearly." },
      ],
      getEl: () => $(citSel(12)),
    },
    checkRowsCard("Once every row is in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T10.1 steps 8–10: three questions answered from what the control requires; no part 2.
  "T10.1-8": askOnlyFromPage(8, "which control has the gap when the guest Wi-Fi can reach the internal file server.", "LI-A.8.22", "Read **What it requires** in the note, all three items: what A.8.22 asks of zones, of the traffic between them and of guest networks. Then hold each of the three options against it."),
  "T10.1-9": askOnlyFromPage(9, "what you record when a database's encryption key sits in plain text on the same server as the database.", "LI-A.8.24", "Read **What it requires** in the note: what A.8.24 asks of keys through their life. Then hold each of the three options against it."),
  "T10.1-10": askOnlyFromPage(10, "which controls apply when production customer data is copied to a test system without masking.", "LI-A.8.11", "Read **What it requires** in the note: where A.8.11 asks for data to be masked. Then open **LI-A.8.33** (Test information, in Learn › Reference pages) and read how it treats test data. Hold each of the three options against both."),

  // T10.1 step 11: CFG-BASE, CRY-REG and CIT-S12 named and handed in, in its row.
  "T10.1-11": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your three files: **CFG-BASE**, the configuration baseline check; **CRY-REG**, the key register; and **CIT-S12**, your tracker for sprint 12. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-11 [data-guide="jobs"]') ?? $('#act-11 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 10");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-11 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **CFG-BASE**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the CFG-BASE file name" },
        { ...name, title: "Name the second file", body: "The same for **CRY-REG**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CRY-REG file name" },
        { ...name, title: "Name the third file", body: "The same for **CIT-S12**, in the third box.", steps: undefined, getEl: () => box(2), pointAt: () => box(2)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(2)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1) && ok(2), doIt: "Type the CIT-S12 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-11 [data-guide="step-complete"]') },
  ],

  // T11.1 step 1: sheet Cards of T-LI-KPI, three fields of the LearnTech worked card found by what they are for.
  // T7.2 step 1: VEN-TIER, each supplier's tier and the R35 term that decides it. One row worked: VeriPass.
  "T7.2-1": [
    {
      title: "The tiering record",
      icon: "table",
      body: "This is **VEN-TIER**, the tiering record (template T-VEN): one row per Manila supplier, with what its business owner wrote on the intake form. For each, choose its **tier** and the **term of rule R35** that decides it.",
      getEl: () => $(VENT),
    },
    {
      title: "The rule",
      icon: "book",
      body: "The note on the right gives rule R35. Check from Critical down and stop at the first term that matches. SITL-POL-013 Section 3.1 says what each term means and where on the intake form to read it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-013", "Then click **Section 3.1** in the bar at the top of the window."),
    {
      title: "What each term means",
      icon: "search",
      body: "The table under Section 3.1: each term of R35, what it means, and the intake-form line it is read on. **Tier 4 data** is what SITL-STD-001 classifies Tier 4, special-category personal data among it.",
      onEnter: () => $(`${docWindow("SITL-POL-013")} section[data-sec="3.1"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => $(`${docWindow("SITL-POL-013")} section[data-sec="3.1"]`) ?? $(docWindow("SITL-POL-013")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **VeriPass Identity Services Inc.**",
      steps: [
        { lead: "Critical, first term", text: "Tier 4 data? Its data received: a selfie matched to the ID photo, biometric data used to identify each person, special-category personal data. Yes." },
        { lead: "Stop", text: "The first match decides: **Critical**, term **Tier 4 data**. That it is also hard to replace changes nothing." },
      ],
      onEnter: () => { shutDoc("SITL-POL-013"); ventCell("Tier (R35)", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => ventCell("Tier (R35)", 2)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Critical** and **Tier 4 data** in the VeriPass row. Next unlocks once both are in.",
      tips: [REOPEN],
      onEnter: () => ventCell("Tier (R35)", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => ventCell("Tier (R35)", 2)?.closest("tr") ?? null,
      pointAt: () => ventCell("Tier (R35)", 2),
      nextWhen: () => ventCell("Tier (R35)", 2)?.value === "Critical" && ventCell("Deciding term (R35)", 2)?.value === "Tier 4 data",
      doIt: "Fill the VeriPass row",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "For Deskline Cloud and PayWise, ask each term in turn, from Critical down, against the row's intake answers.",
      tips: [
        { kind: "avoid", text: "stopping at one half of a term. Customer-facing counts for Critical only when the service is also hard to replace." },
        { kind: "note", text: "At volume means 10,000 people or more, or a continuous feed (Section 3.1)." },
      ],
      getEl: () => $(VENT),
    },
    checkRowsCard("Once every supplier has a tier and a term, click **Check my answers**. Tier and term are checked together; it shows each row's answer and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T7.2 step 2: VEN-CL, each supplier's clauses held against the checklist. One row worked: Deskline's incident notification.
  "T7.2-2": [
    {
      title: "The clause checklist",
      icon: "table",
      body: "This is **VEN-CL**: for each supplier, the eight clauses of the checklist, each with the lowest tier it is required for, what it must say, and what the supplier's contract says. For each line, choose whether the contract holds it.",
      getEl: () => $(VENCL),
    },
    {
      title: "Two questions per line",
      icon: "book",
      body: "The note on the right gives the order. First: is the clause required for this supplier's tier, or, for the transfer mechanism, its hosting? If not, **Not required for this supplier**. Then: does the contract say all of it (**Covered**), less (**Falls short**), or nothing (**Missing**)?",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-013", "Then click **Section 6.3** in the bar at the top of the window."),
    {
      title: "Covered, Falls short, Missing",
      icon: "search",
      body: "Section 6.3: how a draft is read against the checklist, and what each clause must say. The same words are in the sheet's column **The contract must say**.",
      onEnter: () => $(`${docWindow("SITL-POL-013")} section[data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
      getEl: () => $(`${docWindow("SITL-POL-013")} section[data-sec="6.3"]`) ?? $(docWindow("SITL-POL-013")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Deskline Cloud: Incident notification**.",
      steps: [
        { lead: "Required?", text: "From Medium; Deskline is High (step 1). Yes." },
        { lead: "Must say", text: "The supplier notifies us within 24 hours of becoming aware." },
        { lead: "Contract says", text: "Without undue delay, and in any case within 72 hours: the clause is there, but says less. **Falls short**." },
      ],
      onEnter: () => { shutDoc("SITL-POL-013"); venclCell("In the contract", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => venclCell("In the contract", 3)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Falls short** in that row. Next unlocks once it is chosen.",
      tips: [REOPEN],
      onEnter: () => venclCell("In the contract", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => venclCell("In the contract", 3)?.closest("tr") ?? null,
      pointAt: () => venclCell("In the contract", 3),
      nextWhen: () => venclCell("In the contract", 3)?.value === "Falls short",
      doIt: "Choose Falls short for Deskline's incident notification",
    },
    {
      title: "Now the other 23",
      icon: "edit",
      body: "Line by line: required for the tier, then the contract against what the clause must say.",
      tips: [
        { kind: "note", text: "A clause marked Medium is required for Medium, High and Critical. The transfer mechanism is required only where the data leaves the Philippines: read Hosted in." },
        { kind: "avoid", text: "Missing for a clause the supplier's tier does not require. A contract that is silent there is not short of anything." },
      ],
      getEl: () => $(VENCL),
    },
    checkRowsCard("Once every line is decided, click **Check my answers**. It shows each line's answer and why. Your lines lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T7.2 step 3: the tracker located with sprint 7's rows, the LI task pages and SPR-07 read; three click-the-cell questions.
  "T7.2-3": [
    {
      title: "The tracker",
      icon: "table",
      body: "This is your control implementation tracker, **T-LI-CIT**, now at sprint 7: A.5.19 to A.5.23, after the rows of the earlier sprints. Its first row is a LearnTech Educational Solutions worked example, filled in from A to G.",
      getEl: () => $(citSel(7)),
    },
    {
      title: "Three things to find",
      icon: "help",
      body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
      onEnter: () => sprintStudy(7, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => sprintStudy(7, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
      pointAt: () => sprintStudy(7, "F Evidence ref", "A.8.13"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
      doIt: "Click the worked row's evidence ref",
    },
    ...openPage("LI-A.5.19", "It opens beside the tracker."),
    {
      title: "An LI task page",
      icon: "book",
      body: "Every sprint control has one, LI-A.5.19 to LI-A.5.23. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
      tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
      getEl: () => $(pageWindow("LI-A.5.19")),
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's third requirement.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      onEnter: () => shutPage("LI-A.5.19"),
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T7.2 step 4: column D, the status of the five controls. One row worked: A.5.21.
  "T7.2-4": [
    {
      title: "Five controls to rate",
      icon: "table",
      body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-07). Then choose its status in column **D**.",
      getEl: () => $(citSel(7)),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives the rule: every requirement met, some, or none.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.21 Managing information security in the ICT supply chain**.",
      steps: [
        { lead: "Requirement 1", text: "Requirements passed down the chain: not met. No agreement asks a supplier to pass them on." },
        { lead: "Requirement 2", text: "Sub-processors known: in part. The questionnaire records them, but Deskline's new one is not on the record." },
        { lead: "Requirement 3", text: "Delivered software checked: not met. The questionnaire does not ask." },
        { lead: "Status", text: "Some met: **Partially implemented**." },
      ],
      onEnter: () => s7Cell("D Status", "A.5.21")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => s7Cell("D Status", "A.5.21")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Partially implemented** in the A.5.21 row. Next unlocks once it is chosen.",
      getEl: () => s7Cell("D Status", "A.5.21")?.closest("tr") ?? null,
      pointAt: () => s7Cell("D Status", "A.5.21"),
      nextWhen: () => s7Cell("D Status", "A.5.21")?.value === "Partially implemented",
      doIt: "Choose the status of A.5.21",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Do the same for each control: each requirement in turn, against what was observed.",
      tips: [
        { kind: "avoid", text: "stopping at the Group's procedure. A supplier or service the observation names as left out of it is a requirement not met." },
        { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
      ],
      getEl: () => $(citSel(7)),
    },
    checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T7.2 step 5: column E, the level of the five controls. One row worked: A.5.20.
  "T7.2-5": [
    {
      title: "A level per control",
      icon: "table",
      body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
      getEl: () => $(citSel(7)),
    },
    {
      title: "The questions",
      icon: "book",
      body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(MM, "It opens beside the tracker."),
    {
      title: "What each level looks like",
      icon: "search",
      body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
      getEl: () => $(pageWindow(MM)),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.22 Monitoring, review and change management of supplier services**.",
      steps: [
        { lead: "Question 1", text: "A documented, approved way, with records? No: nothing at Manila sets when a supplier is reviewed or reassessed; reassessments are done as they come to mind." },
        { lead: "Level", text: "Stop at the first No: **Level 1 Initial**." },
      ],
      onEnter: () => { shutPage(MM); s7Cell("E Maturity level", "A.5.22")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => s7Cell("E Maturity level", "A.5.22")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Level 1 Initial** in the A.5.22 row. Next unlocks once it is chosen.",
      getEl: () => s7Cell("E Maturity level", "A.5.22")?.closest("tr") ?? null,
      pointAt: () => s7Cell("E Maturity level", "A.5.22"),
      nextWhen: () => s7Cell("E Maturity level", "A.5.22")?.value === "Level 1 Initial",
      doIt: "Choose the level of A.5.22",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Do the same for each control: the questions in order, against what was observed at the office.",
      tips: [{ kind: "note", text: "Status and level are separate questions: a control done the Group's way in every office can still be Partially implemented." }],
      getEl: () => $(citSel(7)),
    },
    checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T7.2 step 6: the evidence packs of A.5.19 and A.5.23. One row worked: LI-A.5.23-01, the cloud addendum.
  "T7.2-6": [
    {
      title: "The evidence packs",
      icon: "table",
      body: "Every sub-task of **LI-A.5.19** and **LI-A.5.23**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
      getEl: () => $(PACKR),
    },
    {
      title: "Three kinds of answer",
      icon: "book",
      body: "The note on the right gives the order: a file you hand in, else the item's own new file prepared from the dataset, else None with the gap written.",
      tips: [{ kind: "note", text: "Your files include this task's own hand-ins: **VEN-CL** (step 2) and **LI-CLD**, the cloud & supply-chain addendum you fill in step 8." }],
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-A.5.23", "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **LI-A.5.23-01**.",
      steps: [
        { lead: "Evidence item", text: "A cloud addendum with the service model and the shared-responsibility matrix." },
        { lead: "A file of yours?", text: "Yes: LI-CLD, this task's cloud & supply-chain addendum, holds Deskline's model and matrix." },
        { lead: "Record", text: "**M2610-00001_T7.2_LI-CLD_v1.xlsx**. Its gap fills with a dash by itself." },
      ],
      onEnter: () => { shutPage("LI-A.5.23"); packCell(EVREF, 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => packCell(EVREF, 4)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose your LI-CLD file in row LI-A.5.23-01. Next unlocks once it is chosen.",
      getEl: () => packCell(EVREF, 4)?.closest("tr") ?? null,
      pointAt: () => packCell(EVREF, 4),
      nextWhen: () => (packCell(EVREF, 4)?.value ?? "").endsWith("_T7.2_LI-CLD_v1.xlsx"),
      doIt: "Fill row LI-A.5.23-01",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each sub-task, hold its evidence item against your files and against what SPR-07 observed (the Observed column).",
      tips: [
        { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
        { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from, or counting onboarding to single sign-on as an approval." },
      ],
      getEl: () => $(PACKR),
    },
    checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
    {
      title: "Save the packs to 02_Working",
      icon: "upload",
      body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
      getEl: () => $('[data-guide="submit"]'),
    },
    finish("With the receipt in, click **Mark step complete**."),
  ],

  // T7.2 step 7: sub-task 01 and the next action of A.5.20, A.5.21 and A.5.22. One row worked: A.5.20.
  "T7.2-7": [
    {
      title: "Three controls, first evidence",
      icon: "table",
      body: "For **A.5.20**, **A.5.21** and **A.5.22**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
      getEl: () => $(citSel(7)),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right gives the order for F, as in step 6, and what G needs: the step to Level 3, or, for a control already there, the gap that remains; and a measure with a target (LI-Q2).",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
    {
      title: "LI-Q2",
      icon: "search",
      body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
      getEl: () => $(pageWindow("LI-Q fixed questions")),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.20 Addressing information security within supplier agreements**.",
      steps: [
        { lead: "F", text: "Sub-task 01 asks for each supplier's agreement held against the clause checklist: your VEN-CL of step 2, **M2610-00001_T7.2_VEN-CL_v1.xlsx**." },
        { lead: "G", text: "Level 3 already (step 5): the Group checklist is in use, so the gap is the two older contracts. **At Level 3 already: bring the older contracts up to the checklist at renewal**; measure, **% of contracts fully covered, target 100%, quarterly**." },
      ],
      onEnter: () => { shutPage("LI-Q fixed questions"); s7Cell("F Evidence ref", "A.5.20")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => s7Cell("F Evidence ref", "A.5.20")?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose that file in F and that next action in G, in the A.5.20 row. Next unlocks once both are in.",
      getEl: () => s7Cell("F Evidence ref", "A.5.20")?.closest("tr") ?? null,
      pointAt: () => s7Cell("F Evidence ref", "A.5.20"),
      nextWhen: () => (s7Cell("F Evidence ref", "A.5.20")?.value ?? "").endsWith("_T7.2_VEN-CL_v1.xlsx") && (s7Cell("G Gap / next action", "A.5.20")?.value ?? "").includes("% of contracts fully covered") && (s7Cell("G Gap / next action", "A.5.20")?.value ?? "").startsWith("At Level 3 already"),
      doIt: "Fill the A.5.20 row",
    },
    {
      title: "Now A.5.21 and A.5.22",
      icon: "edit",
      body: "The same for each: read its sub-task 01 on its LI task page and what SPR-07 observed, then its level from step 5.",
      tips: [
        { kind: "note", text: "LI-CLD, the cloud addendum of step 8, has a sheet Questions: the cloud supplier's answers to the fixed questions." },
        { kind: "avoid", text: "a Manila list of its own. Level 3 is the Group's way, in every office, reviewed yearly; at Level 3 already, close the gap the observation names." },
      ],
      getEl: () => $(citSel(7)),
    },
    checkRowsCard("Once the three rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T7.2 step 8, part 1: who patches the SaaS ticketing application, read on Ref-Cloud. Part 2 opens from the row.
  "T7.2-8q": (() => {
    const g = askFromQR(8, "who patches the application of Deskline Cloud, the SaaS ticketing tool.", "", "", "Part 2 is LI-CLD's shared-responsibility matrix: the service model, then who secures each part of the service.");
    const pick = g.findIndex((c) => c.title === "Pick and check");
    return [
      { ...g[0], tips: [{ kind: "unsure", text: "The answer is in **Ref-Cloud**, in Learn › Reference pages. The next cards take you there." }] },
      ...openPage("Ref-Cloud", "It opens beside the step."),
      { title: "Cloud", icon: "book", body: "Read the **SaaS** row, the model of a SaaS tool: what the provider secures and what the customer secures. Then hold each of the three options against the row.", getEl: () => $(pageWindow("Ref-Cloud")) },
      { ...g[pick], onEnter: () => shutPage("Ref-Cloud") },
      ...g.slice(pick + 1),
    ];
  })(),

  // T7.2 step 8, part 2: LI-CLD's matrix. One row worked: the service model.
  "T7.2-8": [
    {
      title: "The matrix",
      icon: "table",
      onEnter: () => shutPage("Ref-Cloud"),
      body: "Your answer is in. Part 2 is sheet **Matrix** of **LI-CLD**, the cloud & supply-chain addendum for Deskline Cloud: the service model, then who secures each part of the service.",
      getEl: () => $(CLDR),
    },
    {
      title: "How to fill it",
      icon: "book",
      body: "The note on the right gives rule L19: the model from the intake form, then the split for that model from Ref-Cloud.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take the **Service model** row.",
      steps: [
        { lead: "Read", text: "The intake form's delivery line: Deskline runs the application, its database and the servers under them; Manila sets up sign-in, roles, fields and retention." },
        { lead: "Model", text: "The provider runs the application itself: **SaaS**." },
      ],
      onEnter: () => cldCell("Who secures it", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => cldCell("Who secures it", 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **SaaS** in the Service model row. Next unlocks once it is chosen.",
      getEl: () => cldCell("Who secures it", 1)?.closest("tr") ?? null,
      pointAt: () => cldCell("Who secures it", 1),
      nextWhen: () => cldCell("Who secures it", 1)?.value === "SaaS",
      doIt: "Choose the service model",
    },
    ...openPage("Ref-Cloud", "It opens beside the matrix."),
    {
      title: "Now the nine parts",
      icon: "edit",
      body: "For each part, find it in Ref-Cloud's SaaS row: under The provider secures, or under The customer secures.",
      tips: [{ kind: "note", text: "The five fixed questions, with Deskline's answers, are on sheet Questions of LI-CLD: they go in with it at step 10." }],
      onEnter: () => shutPage("Ref-Cloud"),
      getEl: () => $(CLDR),
    },
    checkRowsCard("Once every row is in, click **Check my answers**. It shows each row's answer and why. Your rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T7.2 step 9: the essential clauses, answered from SITL-POL-013 Section 6.3; no part 2.
  "T7.2-9": askOnlyFromDoc(9, "which clauses are essential in the agreement with a supplier that holds Manila customer data.", "SITL-POL-013", "6.3", "Read the table under **Section 6.3**: the clauses of the checklist and what each must say. Then hold each of the three options against it: which ones protect the data the supplier holds?"),

  // T7.2 step 10: VEN-CL, LI-CLD and CIT-S7 named and handed in, in its row.
  "T7.2-10": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your three files: **VEN-CL**, the clause checklist; **LI-CLD**, the cloud & supply-chain addendum with its two sheets; and **CIT-S7**, your tracker for sprint 7. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-10 [data-guide="jobs"]') ?? $('#act-10 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 9");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-10 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **VEN-CL**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the VEN-CL file name" },
        { ...name, title: "Name the second file", body: "The same for **LI-CLD**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the LI-CLD file name" },
        { ...name, title: "Name the third file", body: "And **CIT-S7**, in the third box.", steps: undefined, getEl: () => box(2), pointAt: () => box(2)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(2)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1) && ok(2), doIt: "Type the CIT-S7 file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-10 [data-guide="step-complete"]') },
  ],

  // T5.1 step 1: LI-RTP read, three cells found: two in the LearnTech worked rows, one in the learner's own risks.
  "T5.1-1": [
    {
      title: "Template T-LI-RTP",
      icon: "table",
      body: "This is **LI-RTP**, the risk treatment plan. Rows 1 and 2 are LearnTech Educational Solutions worked examples. Rows 3 to 5 are your three Manila risks from RR-UPD, R-16-HQ-16 to R-16-HQ-18, each with what LI-CHAIN and RR-UPD record about it.",
      getEl: () => $(RTP),
    },
    {
      title: "Three questions",
      icon: "help",
      body: "Each question on the right asks for one cell. Answer it by clicking that cell in the table.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Which Annex A IDs do the worked rows give the risk that is modified? Find the LearnTech row whose option is Modify, then click its Annex A IDs.",
      onEnter: () => rtpStudy("Annex A IDs", "R-36-AMS-07")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => rtpStudy("Annex A IDs", "R-36-AMS-07")?.closest("tr") ?? null,
      pointAt: () => rtpStudy("Annex A IDs", "R-36-AMS-07"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="ids"]'),
      doIt: "Click the modified risk's Annex A IDs",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way. The table scrolls sideways: Due date and Residual sit right of Owner.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T5.1 step 2: the option per risk by rule L12, read with SITL-POL-002 Section 6.1. One row worked: R-16-HQ-18.
  "T5.1-2": [
    {
      title: "Your three risks",
      icon: "table",
      body: "For each of your risks, choose the treatment option in column **Option (L12)**. Its statement, its facts and its residual are beside it.",
      getEl: () => $(RTP),
    },
    {
      title: "Rule L12",
      icon: "book",
      body: "The note on the right is rule **L12**: four questions, asked in order. Stop at the first **Yes**.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-002", "It opens beside the plan."),
    {
      title: "Where L12 comes from",
      icon: "book",
      body: "**Section 6.1** is the office risk-assessment procedure. Step 4 holds each residual score against the appetite; step 5 chooses one option per risk.",
      getEl: () => $(`${docWindow("SITL-POL-002")} section[data-sec="6.1"]`) ?? $(docWindow("SITL-POL-002")),
      onEnter: () => $(`${docWindow("SITL-POL-002")} section[data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **R-16-HQ-18**, the unattended workstations.",
      steps: [
        { lead: "Question 1", text: "Its residual is 9 Medium. The appetite of a LOW-criticality organisation is 11, so 9 is within it: **Yes**." },
        { lead: "Record", text: "**Retain (accept)**. You stop at the first Yes." },
      ],
      onEnter: () => rtpCell("Option (L12)", 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-POL-002")) : rtpCell("Option (L12)", 5)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-POL-002")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Retain (accept)** in the R-16-HQ-18 row. Next unlocks once it is in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-POL-002"); rtpCell("Option (L12)", 5)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => rtpCell("Option (L12)", 5)?.closest("tr") ?? null,
      pointAt: () => rtpCell("Option (L12)", 5),
      nextWhen: () => rtpCell("Option (L12)", 5)?.value === "Retain (accept)",
      doIt: "Fill the R-16-HQ-18 row",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "Ask the four questions of R-16-HQ-16 and R-16-HQ-17, in order. Questions 2 and 3 are answered from each row's facts.",
      tips: [{ kind: "avoid", text: "stopping at question 1's No: a risk above the appetite still has three options to choose from." }],
      getEl: () => $(RTP),
    },
    checkRowsCard("Once every risk has an option, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T5.1 step 3: sheet Controls, needed or not and the Annex A ID, after Clause 6.1.3's summary. One row worked: the vendor's fix.
  "T5.1-3": [
    {
      title: "Sheet Controls",
      icon: "table",
      body: "Sheet **Controls** lists six controls the treatment workshop proposed for **R-16-HQ-16**, the risk you modify. They come from several sources: a vendor advisory, a rule review, NIST CSF 2.0.",
      getEl: () => $(CTRLS),
    },
    {
      title: "What to decide",
      icon: "book",
      body: "The note on the right says how: whether this risk needs each control, and which Annex A control covers it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openLearn("Framework Quick Reference", "Click **Framework Quick Reference**. It carries the orange dot.", QR_WINDOW),
    {
      title: "Clause 6.1.3",
      icon: "book",
      body: "Read the entry for **ISO/IEC 27001 Clause 6.1.3**: controls from any source (b), then compared with Annex A so that no necessary control is left out (c).",
      getEl: () => $(`${QR_WINDOW} [data-term="${C613}"]`) ?? $(QR_WINDOW),
      onEnter: () => $(`${QR_WINDOW} [data-term="${C613}"]`)?.scrollIntoView({ block: "center" }),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take the first control: **Apply the vendor's fix for the exploited flaw to the VPN gateway**.",
      steps: [
        { lead: "Needed?", text: "It removes the risk's cause, the exploited flaw: **Yes**." },
        { lead: "Annex A", text: "Fixing known flaws in time is managing technical vulnerabilities: **A.8.8 Management of technical vulnerabilities**." },
      ],
      onEnter: () => { closeQR(); ctrlCell("Needed for this risk?", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => ctrlCell("Needed for this risk?", 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Yes** and **A.8.8 Management of technical vulnerabilities** in that row. Next unlocks once both are in.",
      onEnter: () => ctrlCell("Needed for this risk?", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => ctrlCell("Needed for this risk?", 1)?.closest("tr") ?? null,
      pointAt: () => ctrlCell("Needed for this risk?", 1),
      nextWhen: () => ctrlCell("Needed for this risk?", 1)?.value === "Yes" && ctrlCell("Annex A ID", 1)?.value === "A.8.8 Management of technical vulnerabilities",
      doIt: "Fill the first control's row",
    },
    {
      title: "Now the other five",
      icon: "edit",
      body: "For each control, ask whether it acts on R-16-HQ-16's cause, event or consequence. Then choose the Annex A control whose title covers what it does.",
      tips: [{ kind: "note", text: "Choose **No** and the Annex A ID fills itself: a control this risk does not need is not compared." }],
      getEl: () => $(CTRLS),
    },
    checkRowsCard("Once every control is decided, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked. The needed controls and their IDs fill LI-RTP's Controls and Annex A IDs."),
  ],

  // T5.1 steps 4 and 5: from the Clause 6.1.3 summary; no part 2.
  "T5.1-4": askOnlyFromQR(4, "whether a control taken from the NIST Cybersecurity Framework may be used.", C613, "Read the entry for **ISO/IEC 27001 Clause 6.1.3**: where controls may come from, and what Annex A is for. Then hold each of the three options against it."),
  "T5.1-5": askOnlyFromQR(5, "who approves the risk treatment plan and accepts the residual risks.", C613, "Read the entry for **ISO/IEC 27001 Clause 6.1.3**: what e) and f) ask for. Then hold each of the three options against it."),

  // T5.1 step 6: due dates (R08) and the retained risk's RSK-ACC columns (SITL-POL-002 Section 6.2). One row worked: R-16-HQ-17.
  "T5.1-6": [
    {
      title: "Due dates and the acceptance",
      icon: "table",
      body: "Two jobs: a due date for each risk, and the four **RSK-ACC** columns for the risk you retain. Owner, Residual and Approved by are filled already.",
      getEl: () => $(RTP),
    },
    {
      title: "Where to read",
      icon: "book",
      body: "The note on the right names the sources: rule R08 and SITL-ERM-001 Section 7 for the days, SITL-POL-002 Section 6.2 for the acceptance, the GRC Charter Section 6.1 for who may accept it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openDoc("SITL-POL-002", "It opens beside the plan."),
    {
      title: "Section 6.2",
      icon: "book",
      body: "Read **Section 6.2**, the risk acceptance procedure: steps 1 to 3 say what the request holds, who approves it and how its two dates are set. Section 6.1 step 6 gives the due dates.",
      getEl: () => $(`${docWindow("SITL-POL-002")} section[data-sec="6.2"]`) ?? $(docWindow("SITL-POL-002")),
      onEnter: () => $(`${docWindow("SITL-POL-002")} section[data-sec="6.2"]`)?.scrollIntoView({ block: "start" }),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **R-16-HQ-17**, the legacy FTP feed.",
      steps: [
        { lead: "Residual", text: "12 High." },
        { lead: "Due date", text: "High: 90 days from the plan's date, 2 November 2026: **2027-01-31**." },
        { lead: "RSK-ACC", text: "It is not retained, so its RSK-ACC columns show —." },
      ],
      onEnter: () => rtpCell("Due date (R08)", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(docWindow("SITL-POL-002")) : rtpCell("Due date (R08)", 4)?.closest("tr") ?? null),
      alsoShow: () => $(docWindow("SITL-POL-002")),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **2027-01-31** as R-16-HQ-17's due date. Next unlocks once it is in.",
      tips: [REOPEN],
      onEnter: () => { shutDoc("SITL-POL-002"); rtpCell("Due date (R08)", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => rtpCell("Due date (R08)", 4)?.closest("tr") ?? null,
      pointAt: () => rtpCell("Due date (R08)", 4),
      nextWhen: () => rtpCell("Due date (R08)", 4)?.value === "2027-01-31",
      doIt: "Fill R-16-HQ-17's due date",
    },
    {
      title: "Now the other two",
      icon: "edit",
      body: "Set R-16-HQ-16's due date the same way. Then the retained risk: its due date, and its four RSK-ACC columns, from Section 6.2.",
      tips: [{ kind: "note", text: "Who may accept a retained risk depends on its residual rating: the GRC Charter Section 6.1 table, rule R36." }],
      getEl: () => $(RTP),
    },
    checkRowsCard("Once every cell is in, click **Check my answers**. Each row's due date and RSK-ACC columns are checked together; it shows the answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T5.1 step 7: LI-RTP (with sheet Controls) named and handed in, in its row; RSK-ACC goes with it.
  "T5.1-7": [
    {
      title: "The file you hand in",
      icon: "file",
      body: "Your risk treatment plan, **LI-RTP**, with its sheet Controls, and **RSK-ACC**, the acceptance request filled from the retained risk's row. This step saves the plan in **02_Working** under its own name and submits it.",
      getEl: () => $('#act-7 [data-guide="jobs"]') ?? $('#act-7 [data-guide="file-name"]'),
    },
    ...nameAndSubmit("xlsx", "1 to 6").slice(0, 2),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-7 [data-guide="step-complete"]') },
  ],

  "T11.1-1": [
    {
      title: "Sheet Cards",
      icon: "table",
      body: "This is sheet **Cards** of template **T-LI-KPI**: one measure card per row. The first row is LearnTech's worked card; in step 4 you write five for Manila.",
      getEl: () => $(KPIC),
    },
    {
      title: "Three questions",
      icon: "help",
      body: "Each question on the right names what a field is for. Answer it by clicking that cell in the worked card.",
      getEl: () => $('[data-guide="study"]'),
    },
    {
      title: "Find the first one",
      icon: "edit",
      body: "Who judges the result and reports it? Click the cell that says so.",
      onEnter: () => kpiStudy("Who analyses and evaluates")?.scrollIntoView({ block: "nearest", inline: "center" }),
      getEl: () => kpiStudy("Who analyses and evaluates"),
      nextWhen: () => !!$('[data-guide="study"] [data-found="who"]'),
      doIt: "Click who analyses and evaluates",
    },
    {
      title: "Now the other two",
      icon: "check",
      body: "Answer the other two questions the same way.",
      tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
      getEl: () => $('[data-guide="study"]'),
    },
    finish("**Mark step complete** unlocks once all three are found."),
  ],

  // T11.1 steps 2 and 3: Clause 9.1, from its Quick Reference entry; no part 2.
  "T11.1-2": askOnlyFromQR(2, "what the organisation must determine under Clause 9.1.", "ISO/IEC 27001 Clause 9.1", "Read the entry for **ISO/IEC 27001 Clause 9.1**: what the organisation determines, a) to f). Then hold each of the three options against it."),
  "T11.1-3": askOnlyFromQR(3, "what a measurement method must produce for its results to be valid.", "ISO/IEC 27001 Clause 9.1", "Read item **b)** of the entry for **ISO/IEC 27001 Clause 9.1**: the methods, and what they should produce. Then hold each of the three options against it."),

  // T11.1 step 4: five measure cards. One row worked: Card 1, the first Level 1 control in the list.
  "T11.1-4": [
    {
      title: "Five cards to write",
      icon: "table",
      body: "Each Manila row is a measure card. Choose its control, the rest of the card fills from the Control Maturity Matrix, then choose its target and threshold.",
      getEl: () => $(KPIC),
    },
    {
      title: "How to choose",
      icon: "book",
      body: "The note on the right says how to pick the five controls, where each target is read, and how the threshold follows from it.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One card, worked",
      icon: "help",
      body: "Take **Card 1**.",
      steps: [
        { lead: "Sort", text: "The Control list gives each control with the level your own tracker records for it. The lowest level in it is Level 1; one Level 1 control is **A.5.2 Information security roles and responsibilities** (CIT-S1)." },
        { lead: "Target", text: "Its Target set in reads Group catalogue: 100%, as no SITL policy sets one." },
        { lead: "Threshold", text: "No red line is set, so it is 10 points below the target: **Target 100%, threshold below 90%**." },
      ],
      onEnter: () => kpiCell("Control", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => kpiCell("Control", 2)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **A.5.2** in Card 1's Control, then **Target 100%, threshold below 90%**. Next unlocks once both are in.",
      onEnter: () => kpiCell("Control", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => kpiCell("Control", 2)?.closest("tr") ?? null,
      pointAt: () => kpiCell("Control", 2),
      nextWhen: () => (kpiCell("Control", 2)?.value ?? "").startsWith("A.5.2 ") && kpiCell("Target and threshold", 2)?.value === "Target 100%, threshold below 90%",
      doIt: "Fill Card 1",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "Cards 2 to 5 take the other controls at the lowest level, in any order. For each, read where its target is set.",
      tips: [
        { kind: "note", text: "A Group policy's targets are in its **Section 10, Key performance indicators** (Policies › Policy Library). A red line there is the threshold." },
        { kind: "avoid", text: "taking a target from another row of the same table: read the line for the measure on your card." },
      ],
      getEl: () => $(KPIC),
    },
    checkRowsCard("Once all five cards are in, click **Check my answers**. It shows each card's answer and why. The cards lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T11.1 step 5: Level 4 against Level 3, from the Maturity Model; no part 2.
  "T11.1-5": askOnlyFromPage(5, "which evidence shows Level 4 rather than Level 3.", MM, "Read the Level 3 and Level 4 rows and the note's third question: what Level 4 adds to Level 3. Then hold each of the three options against it."),

  // T11.1 step 6: the dashboard baseline. One row worked: Card 1, A.5.2.
  "T11.1-6": [
    {
      title: "Sheet Dashboard",
      icon: "table",
      body: "This is **KPI-DASH**: one row per measure card. Your data for each is in the Data column. Choose the current value and the line for management; the status fills itself.",
      getEl: () => $(KPID),
    },
    {
      title: "How to calculate",
      icon: "book",
      body: "The note on the right gives the calculation and when a value is Green, Amber or Red.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **Card 1**, A.5.2: ISMS roles held and accepted.",
      steps: [
        { lead: "Count", text: "The card's numerator is roles with a named holder who has signed: 4. Its denominator is all ISMS roles in LI-RACI: 10. The 7 named holders are not the numerator: 3 have not signed." },
        { lead: "Value", text: "4 ÷ 10 × 100 = **40.0%**. Against Target 100%, threshold below 90%, it is Red." },
        { lead: "Line", text: "Red calls for an owner, a date and the management review: **Have every ISMS role holder named and signed by 31 March 2027 …**." },
      ],
      onEnter: () => dashCell("Current value", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => dashCell("Current value", 2)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **40.0%** and that line in Card 1's row. Next unlocks once both are in.",
      onEnter: () => dashCell("Current value", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => dashCell("Current value", 2)?.closest("tr") ?? null,
      pointAt: () => dashCell("Current value", 2),
      nextWhen: () => dashCell("Current value", 2)?.value === "40.0%" && (dashCell("What management should do", 2)?.value ?? "").startsWith("Have every ISMS role holder"),
      doIt: "Fill Card 1's row",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "For each row, count what the card's method counts in the Data column, then choose the line the status calls for.",
      tips: [
        { kind: "avoid", text: "counting everything in the data: a measure counts only its own numerator and denominator (for A.8.8, classes 1–2 only)." },
        { kind: "note", text: "A green result needs no corrective action, and an amber one is a warning, not yet a breach." },
      ],
      getEl: () => $(KPID),
    },
    checkRowsCard("Once every row is in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T11.1 step 7: LI-KPI and KPI-DASH named and handed in, in its row.
  "T11.1-7": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your two files: **LI-KPI**, the five measure cards, and **KPI-DASH**, the measurement dashboard. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-7 [data-guide="jobs"]') ?? $('#act-7 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("docx", "1 to 6");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-7 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **LI-KPI** (a .docx), in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-KPI file name" },
        { ...name, title: "Name the second file", body: "The same for **KPI-DASH** (an .xlsx), in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the KPI-DASH file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-7 [data-guide="step-complete"]') },
  ],

  // T12.1 step 1: ACT-UPD, each action's status from its closure evidence. One row worked: ACT-01.
  "T12.1-1": [
    {
      title: "Nine actions to verify",
      icon: "table",
      body: "This is **ACT-TRACKER** as at 21 December 2026: the gaps and nonconformities of weeks 2–11. Each row shows what its owner reports and the evidence sent. You decide the status from the evidence, give the reason and set the next check date.",
      getEl: () => $(ACTU),
    },
    {
      title: "How to test the evidence",
      icon: "book",
      body: "The note on the right says when an action is Closed, Open or Overdue. Two questions decide most rows: is the evidence a dated record from a system, and has anyone checked since that the fix worked?",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **ACT-01**, separating supplier creation from payment approval.",
      steps: [
        { lead: "The fix", text: "The ERP role export of 30 November shows procurement creating suppliers and the finance clerk only approving payments: a dated system record." },
        { lead: "The check", text: "On 4 December the Compliance Manager reviewed every supplier-master change since the split: none was made by a payment approver. The fix worked (Clause 10.2 d)." },
        { lead: "Record", text: "**Closed — verified effective**, reason **The record shows the fix in place and a check that it worked**." },
      ],
      onEnter: () => actCell("Status (verified)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => actCell("Closure evidence", 1)?.closest("tr") ?? actCell("Status (verified)", 1)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose the status and the reason in the ACT-01 row, and a next check date after 21 December 2026: for a closed action, when you will look at it again, for example at the next audit. Next unlocks once all three are in.",
      onEnter: () => actCell("Status (verified)", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => actCell("Status (verified)", 1)?.closest("tr") ?? null,
      pointAt: () => actCell("Status (verified)", 1),
      nextWhen: () => actCell("Status (verified)", 1)?.value === "Closed — verified effective" && (actCell("Reason", 1)?.value ?? "").startsWith("The record shows the fix") && cellIn(actCell("Next check date", 1)),
      doIt: "Fill the ACT-01 row",
    },
    {
      title: "Now the other eight",
      icon: "edit",
      body: "For each action, read the evidence, not the owner's status, and hold the due date against 21 December 2026.",
      tips: [
        { kind: "avoid", text: "taking \"Closed\" on the owner's word: an e-mail, a draft or an undated screenshot is not a record." },
        { kind: "note", text: "A fix in place with no check since that it worked is not yet verified effective." },
      ],
      getEl: () => $(ACTU),
    },
    checkRowsCard("Once every action has a status, a reason and a date, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T12.1 step 2: what corrective action must do besides the fix, from the Clause 10.2 summary; no part 2.
  "T12.1-2": askOnlyFromQR(2, "what corrective action must do besides reacting to the nonconformity.", "ISO/IEC 27001 Clause 10.2", "Read the entry for **ISO/IEC 27001 Clause 10.2**: what the organisation does when a nonconformity occurs, a) to e). Then hold each of the three options against it."),

  // T12.1 step 3: LI-MR's inputs, Available or Missing with the source. One row worked: b), the changes in issues.
  "T12.1-3": [
    {
      title: "The review's inputs",
      icon: "table",
      body: "This is sheet **Inputs** of **LI-MR**: what Clause 9.3.2 says the management review must consider. For each, decide whether a file of the pack holds it, and name the file. Row a) is worked.",
      getEl: () => $(MRI),
    },
    {
      title: "Rule L24",
      icon: "book",
      body: "The note on the right is rule **L24**: Available when a file holds the input, and for an input about changes only where the file records a review that looked for them.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(REVIEW_PACK, "It opens beside the sheet."),
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **b) Changes in external and internal issues**.",
      steps: [
        { lead: "Which file", text: "The issues are in **CTX-ISS** (F1.3)." },
        { lead: "Changes?", text: "Its line says the six-monthly review of 2 November 2026 is recorded with it, and lists two changes: a review that looked for changes." },
        { lead: "Record", text: "**Available**, source **CTX-ISS (F1.3)**." },
      ],
      onEnter: () => mrCell("Available/Missing", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => (phone() ? $(pageWindow(REVIEW_PACK)) : mrCell("Available/Missing", 2)?.closest("tr") ?? null),
      alsoShow: () => $(pageWindow(REVIEW_PACK)),
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Available** and **CTX-ISS (F1.3)** in row b). Next unlocks once both are in.",
      onEnter: () => { shutPage(REVIEW_PACK); mrCell("Available/Missing", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
      getEl: () => mrCell("Available/Missing", 2)?.closest("tr") ?? null,
      pointAt: () => mrCell("Available/Missing", 2),
      nextWhen: () => mrCell("Available/Missing", 2)?.value === "Available" && mrCell("Source file", 2)?.value === "CTX-ISS (F1.3)",
      doIt: "Fill row b)",
    },
    {
      title: "Now the other eight",
      icon: "edit",
      body: "For each input, find the file whose line on Ref-Review pack holds it. Where no file does, choose **Missing**: the source fills itself with None.",
      tips: [
        { kind: "avoid", text: "naming a plan for its results: a file that plans something does not hold what it found." },
        { kind: "note", text: "One file can hold two inputs." },
      ],
      getEl: () => $(MRI),
    },
    checkRowsCard("Once every input is decided, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T12.1 step 4, part 1: a required output of management review, from the Clause 9.3 summary. Part 2 opens from the row.
  "T12.1-4q": askFromQR(4, "which is a required output of management review.", "ISO/IEC 27001 Clause 9.3", "Read the entry for **ISO/IEC 27001 Clause 9.3**: what the review's results (9.3.3) include. Then hold each of the three options against it.", "")
    .map((c) => (c.title === "Then part 2" ? { ...c, body: "Part 2 is sheet Readiness of LI-MR: whether the Manila ISMS is ready for Stage 1, and why. Click **Open New from Template** to do it." } : c)),

  // T12.1 step 4, part 2: Stage 1 readiness by rules L23 and L24. One row, so no worked answer: where to look instead.
  "T12.1-4": [
    {
      title: "Sheet Readiness",
      icon: "table",
      onEnter: closeQR,
      body: "Your answer is in. Part 2 is sheet **Readiness** of LI-MR: is the Manila ISMS ready for the Stage 1 audit? Choose Yes or No and the reason.",
      getEl: () => $(MRR),
    },
    {
      title: "Rules L24 and L23",
      icon: "book",
      body: "The note on the right holds both rules. L24 says what must have happened before the answer is Yes; L23 says what the first year's internal audit covers.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    ...openPage(REVIEW_PACK, "It opens beside the sheet."),
    {
      title: "What to check",
      icon: "search",
      body: "Read the **LI-AUD** line: has an internal audit of the Manila ISMS been held? Then think back to your sheet Inputs (step 3): did every input have a file?",
      getEl: () => $(pageWindow(REVIEW_PACK)),
    },
    {
      title: "Decide",
      icon: "edit",
      body: "Choose the answer and the reason that rule L24 gives for it. Next unlocks once both are in.",
      onEnter: () => shutPage(REVIEW_PACK),
      getEl: () => readyCell("Ready for Stage 1?", 1)?.closest("tr") ?? null,
      pointAt: () => readyCell("Ready for Stage 1?", 1),
      nextWhen: () => cellIn(readyCell("Ready for Stage 1?", 1)) && cellIn(readyCell("Reason", 1)),
      doIt: "Choose the answer and the reason",
      tips: [{ kind: "avoid", text: "a reason rule L24 says does not by itself decide readiness." }],
    },
    checkRowsCard("Click **Check my answers**. It shows the answer and why. The row locks then."),
    finish("**Mark step complete** unlocks once your answer is checked."),
  ],

  // T12.1 step 5: L4-ROAD, the quarter and the route per measure. One row worked: A.5.18, leavers disabled within the SLA.
  "T12.1-5": [
    {
      title: "The roadmap frame",
      icon: "table",
      body: "This is the **L4-ROAD** frame: one page, one row for each of your five LI-KPI measures. For each, decide the quarter it goes live and how its results reach management. The first row is a LearnTech Educational Solutions worked example.",
      getEl: () => $(ROADR),
    },
    {
      title: "How to decide",
      icon: "book",
      body: "The note on the right gives both tests: a measure goes live when its results can be produced the same way every time, and its route follows how often it is measured.",
      getEl: () => $('[data-guide="step-note"]'),
    },
    {
      title: "One row, worked",
      icon: "help",
      body: "Take **A.5.18 Access rights**: leavers disabled within the SLA.",
      steps: [
        { lead: "Ready first", text: "The baseline was counted by hand from two systems, which is not reproducible. The feed that time-stamps every disable goes live in May 2027: **Q2 2027 (April–June)**." },
        { lead: "Route", text: "Measured each month, so the Org CISO sees it each month at the dashboard review, the Org Risk & Compliance Committee each quarter, and the management review the year's trend." },
      ],
      onEnter: () => roadCell("Quarter it goes live", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => roadCell("Quarter it goes live", 4)?.closest("tr") ?? null,
    },
    {
      title: "Fill it",
      icon: "edit",
      body: "Choose **Q2 2027 (April–June)** and the route that starts **Each month to the Org CISO** in the A.5.18 row. Next unlocks once both are in.",
      onEnter: () => roadCell("Quarter it goes live", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      getEl: () => roadCell("Quarter it goes live", 4)?.closest("tr") ?? null,
      pointAt: () => roadCell("Quarter it goes live", 4),
      nextWhen: () => (roadCell("Quarter it goes live", 4)?.value ?? "").startsWith("Q2 2027") && (roadCell("Route to management review (Clause 9.3)", 4)?.value ?? "").startsWith("Each month to the Org CISO"),
      doIt: "Fill the A.5.18 row",
    },
    {
      title: "Now the other four",
      icon: "edit",
      body: "For each measure, read what has to be ready first and how often it is measured.",
      tips: [
        { kind: "note", text: "Where nothing has to be ready first, the measure goes live in Q1 2027." },
        { kind: "avoid", text: "keeping results on the dashboard until something breaks: management sees every measure each quarter." },
      ],
      getEl: () => $(ROADR),
    },
    checkRowsCard("Once every measure has a quarter and a route, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
    finish("**Mark step complete** unlocks once your answers are checked."),
  ],

  // T12.1 step 6: ACT-UPD, LI-MR and L4-ROAD named and handed in, in its row.
  "T12.1-6": [
    {
      title: "The files you hand in",
      icon: "file",
      body: "Your three files: **ACT-UPD**, the updated action tracker; **LI-MR**, the management-review pack with its readiness; and **L4-ROAD**, the one-page roadmap. This step saves them in **02_Working** under their own names and submits them.",
      getEl: () => $('#act-6 [data-guide="jobs"]') ?? $('#act-6 [data-guide="file-name"]')?.parentElement ?? null,
    },
    ...(() => {
      const [name, submit] = nameAndSubmit("xlsx", "1 to 5");
      const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-6 [data-guide="file-name"]')[i] ?? null;
      const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
      const input = (i: number) => box(i)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null;
      return [
        { ...name, title: "Name the file", body: "Type the first file's name, for **ACT-UPD** (an .xlsx), in its box.", getEl: () => box(0), pointAt: () => input(0), nextWhen: () => ok(0), doIt: "Type the ACT-UPD file name" },
        { ...name, title: "Name the second file", body: "The same for **LI-MR** (an .xlsx), in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => input(1), onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the LI-MR file name" },
        { ...name, title: "Name the third file", body: "And for **L4-ROAD** (a .docx), in the third box.", steps: undefined, getEl: () => box(2), pointAt: () => input(2), onEnter: () => box(2)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1) && ok(2), doIt: "Type the L4-ROAD file name" },
        submit,
      ];
    })(),
    { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-6 [data-guide="step-complete"]') },
  ],
  ...t122Guides(),
  ...t112Guides(),
  ...t52Guides(),
  ...t71Guides(),
  ...t102Guides(),
};

/**
 * T12.2's guides (registers.ts "T12.2 CERT", "T12.2", "T12.2 NCR"; all in Evidence › Audit Requests (PBC)). A function
 * declaration, so it is hoisted above STEP_GUIDES; it reads only helpers defined before STEP_GUIDES.
 */
function t122Guides(): Record<string, TourStep[]> {
  const CARD = "Ref-Certification card";
  const CERT = '[data-guide="register"][data-reg="LI-CERT"]';
  const LOG = '[data-guide="register"][data-reg="AUD-LOG"]';
  const NCR = '[data-guide="register"][data-reg="LI-NCR-R"]';
  const cell = (reg: string, col: string, row: number) => $(`${reg} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | HTMLInputElement | null;
  const WHEN = "When the auditor checks it", FILE = "Evidence file (EVIDENCE-INDEX)", SENT = "Time sent (UTC)";
  const LIB = 'section[role="dialog"][aria-label^="Evidence › Evidence Library"]';
  const openStepTool = (n: number) => [...document.querySelectorAll<HTMLElement>(`#act-${n} button`)].find((b) => /^Open /.test(b.innerText.trim())) ?? null;
  /** The question of a pick step read from Ref-Certification card, then its part 2 in Audit Requests (PBC). */
  const askThenCard = (n: number, question: string, read: string, partTwo: string): TourStep[] =>
    askOnlyFromPage(n, question, CARD, read).flatMap((c, i) =>
      i === 0 ? [{ ...c, body: `This step has two parts. Part 1 is ${question}` }]
        : c.title === "Finish here" ? [{ title: "Then part 2", icon: "table", body: `${partTwo} Click **Open Audit Requests (PBC)** to do it.`, getEl: () => openStepTool(n) }]
        : [c]);
  return {
    // T12.2 step 1: what Stage 1 reviews, from Ref-Certification card.
    "T12.2-1": askOnlyFromPage(1, "what the Stage 1 audit mainly reviews.", CARD, "Read the **Stage 1 audit** row, then the **Stage 2 audit** and **Certification decision** rows: what each one covers. Then hold each of the three options against them."),

    // T12.2 step 2, part 1: the certificate's cycle, from the same card. Part 2 opens from the row.
    "T12.2-2q": askThenCard(2, "how long a certification cycle lasts.", "Read the **Three-year cycle** and **Recertification** rows: how long the certificate is valid, and what happens each year. Then hold each of the three options against them.", "Part 2 is LI-CERT, sheet Facts: eight statements for your briefing, each placed at the audit that checks it."),

    // T12.2 step 2, part 2: sheet Facts of LI-CERT. One row worked: the interviews on the Manila floor (row 4).
    "T12.2-2": [
      { title: "Sheet Facts", icon: "table", body: "Your answer is in. Part 2 is sheet **Facts** of **LI-CERT**: eight statements your briefing will make. For each, decide when the certification body checks it.", getEl: () => $(CERT) },
      { title: "Where to read", icon: "book", body: "The note on the right names the four choices and where each is described.", getEl: () => $('[data-guide="step-note"]') },
      ...openPage(CARD, "It opens beside the sheet."),
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **The auditor interviews staff on the Manila floor and samples records of the Statement of Applicability's controls in operation**.",
        steps: [
          { lead: "Where", text: "On the card, the **Stage 2 audit** row: on site, interviews, records, samples of the controls in operation." },
          { lead: "So", text: "**Stage 2**. Stage 1 reads documents; it does not sample controls on the floor." },
        ],
        onEnter: () => cell(CERT, WHEN, 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => (phone() ? $(pageWindow(CARD)) : cell(CERT, WHEN, 4)?.closest("tr") ?? null),
        alsoShow: () => $(pageWindow(CARD)),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Stage 2** in that row. Next unlocks once it is in.",
        onEnter: () => { shutPage(CARD); cell(CERT, WHEN, 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => cell(CERT, WHEN, 4)?.closest("tr") ?? null,
        pointAt: () => cell(CERT, WHEN, 4),
        nextWhen: () => cell(CERT, WHEN, 4)?.value === "Stage 2",
        doIt: "Fill the interviews row",
      },
      {
        title: "Now the other seven",
        icon: "edit",
        body: "For each statement, find the card's row that describes it.",
        tips: [{ kind: "note", text: "Two audits in years two and three are both **Surveillance**; only the audit of the whole ISMS before expiry is **Recertification**." }],
        getEl: () => $(CERT),
      },
      checkRowsCard("Once all eight rows are in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked. Your two pages for management are written from these facts and format-checked and kept with your hand-in."),
    ],

    // T12.2 step 3: AUD-LOG, one file per request or No evidence available. One row worked: REQ-01, the scope.
    "T12.2-3": [
      { title: "AUD-LOG", icon: "table", body: "This is **AUD-LOG**, template **T-AUD**: the lead auditor's eight requests for the Stage 1 audit. For each, choose the one file that answers it, or **No evidence available** with the action you raise.", getEl: () => $(LOG) },
      { title: "Rule R34", icon: "book", body: "The note on the right gives rule R34: what makes a file the right answer, and the audit period.", getEl: () => $('[data-guide="step-note"]') },
      {
        title: "Follow the orange dot",
        icon: "info",
        body: "**Evidence** carries the dot: your EVIDENCE-INDEX is its **Evidence Library**. Click **Evidence**.",
        getEl: () => $('[data-guide-section="evidence"]'),
        waitFor: () => !!$('[data-guide-menu="evidence"]'),
        skip: () => !!$('[data-guide-menu="evidence"]') || !!$(LIB),
        doIt: "Click Evidence",
      },
      {
        title: "Open Evidence Library",
        icon: "grid",
        body: "Click **Evidence Library**. It opens beside the log.",
        getEl: () => [...document.querySelectorAll<HTMLElement>('[data-guide-menu="evidence"] li button')].find((b) => b.innerText.includes("Evidence Library")) ?? null,
        waitFor: () => !!$(LIB),
        skip: () => !!$(LIB),
        doIt: "Click Evidence Library",
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **REQ-01**: the ISMS scope of the Manila office.",
        steps: [
          { lead: "Two files say Clause 4.3", text: "Your **LI-SCOPE** (F2.1), dated 2026-10-15, and the template's worked example." },
          { lead: "R34", text: "The worked example is LearnTech's Amsterdam scope: another organisation. Yours is the record asked for: **M2610-00001_F2.1_LI-SCOPE_v1.docx**." },
        ],
        onEnter: () => cell(LOG, FILE, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => (phone() ? $(LIB) : cell(LOG, FILE, 1)?.closest("tr") ?? null),
        alsoShow: () => $(LIB),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose your LI-SCOPE file in the REQ-01 row. Next unlocks once it is in.",
        tips: [{ kind: "note", text: "On a phone the index closes here so the log shows. Open it again from **Evidence › Evidence Library** when you need it." }],
        onEnter: () => { if (phone()) $(`${LIB} button[aria-label^="Close"]`)?.click(); cell(LOG, FILE, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => cell(LOG, FILE, 1)?.closest("tr") ?? null,
        pointAt: () => cell(LOG, FILE, 1),
        nextWhen: () => /_F2\.1_LI-SCOPE_v1\.docx$/.test(cell(LOG, FILE, 1)?.value ?? ""),
        doIt: "Fill the REQ-01 row",
      },
      {
        title: "Now the other seven",
        icon: "edit",
        body: "For each request, find the files under its clause or control, then keep the one that is the record asked for, for Manila, dated in the period.",
        tips: [
          { kind: "avoid", text: "sending a plan, a template or a policy where the request asks for a record. Where nothing holds it, choose **No evidence available** and write the action you raise, with its owner and a date." },
        ],
        getEl: () => $(LOG),
      },
      checkRowsCard("Once every request is answered, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked and every action is written."),
    ],

    // T12.2 step 4: the UTC time each file was sent. One row worked: REQ-01.
    "T12.2-4": [
      { title: "The files you sent", icon: "table", body: "AUD-LOG now lists the six files you sent, each with its SHA-256 from EVIDENCE-INDEX. Record the time each one was sent, in **UTC**.", getEl: () => $(LOG) },
      { title: "From Manila time", icon: "book", body: "The note on the right says where the times are and how to turn them into UTC.", getEl: () => $('[data-guide="step-note"]') },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **REQ-01**.",
        steps: [
          { lead: "Portal receipt", text: "AP-77104 · 2026-12-28 09:12, Manila time (UTC+8)." },
          { lead: "UTC", text: "Eight hours earlier: **2026-12-28 01:12 UTC**. The same day, since 09:12 is after 08:00." },
        ],
        onEnter: () => cell(LOG, SENT, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => cell(LOG, SENT, 1)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Pick **2026-12-28** and **01:12** in that row's Time sent. Next unlocks once it is in.",
        getEl: () => cell(LOG, SENT, 1)?.closest("tr") ?? null,
        pointAt: () => cell(LOG, SENT, 1),
        nextWhen: () => cell(LOG, SENT, 1)?.value === "2026-12-28T01:12",
        doIt: "Fill the REQ-01 time",
      },
      {
        title: "Now the other five",
        icon: "edit",
        body: "For each file, take eight hours off the portal's Manila time.",
        tips: [{ kind: "avoid", text: "keeping the Manila date for an upload made before 08:00 Manila time: in UTC it is still the day before." }],
        getEl: () => $(LOG),
      },
      checkRowsCard("Once every time is in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T12.2 step 5, part 1: the response to a minor nonconformity, from the situation and rule L25. Part 2 opens from the row.
    "T12.2-5q": askThenScreen(5, "how you respond to a minor nonconformity the evidence supports.", "Part 2 is LI-NCR-R: the correction, the root cause and the corrective action, each with an owner and a date.", "Audit Requests (PBC)")
      .map((c, i) => (i === 0 ? { ...c, tips: [{ kind: "unsure" as const, text: "Rule **L25** says how an audit finding is answered: it is in **Learn › Rule tables**." }] } : c)),

    // T12.2 step 5, part 2: LI-NCR-R. One row worked: the correction.
    "T12.2-5": [
      { title: "LI-NCR-R", icon: "table", body: "Your answer is in. Part 2 is **LI-NCR-R**, your response to NC-1: three parts, each with the response that fits it, an owner and a date.", getEl: () => $(NCR) },
      { title: "The finding and L25", icon: "book", body: "The note on the right holds NC-1, what the auditor was told, and what each part of rule L25 is for.", getEl: () => $('[data-guide="step-note"]') },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **Correction**: what fixes this nonconformity now.",
        steps: [
          { lead: "This nonconformity", text: "A.8.32 is in LI-AUD (IA-23), but no audit before Stage 1 covered it. Fixing it now means holding that audit before Stage 2." },
          { lead: "So", text: "**Bring the internal audit of A.8.32 Change management (IA-23) forward and hold it before the Stage 2 audit**. The internal audit programme is the Information Security Auditor's, before 12 April 2027." },
        ],
        onEnter: () => cell(NCR, "Response", 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => cell(NCR, "Response", 1)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose that response, **Information Security Auditor** as owner, and a date before 12 April 2027, such as **2027-03-26**. Next unlocks once all three are in.",
        getEl: () => cell(NCR, "Response", 1)?.closest("tr") ?? null,
        pointAt: () => cell(NCR, "Response", 1),
        nextWhen: () => /^Bring the internal audit of A\.8\.32/.test(cell(NCR, "Response", 1)?.value ?? "") && cellIn(cell(NCR, "Owner", 1)) && cellIn(cell(NCR, "Date", 1)),
        doIt: "Fill the correction row",
      },
      {
        title: "Now the other two",
        icon: "edit",
        body: "The root cause says why the process let it happen; the corrective action changes the process so that it does not happen again.",
        tips: [{ kind: "avoid", text: "a root cause that names a person, and a corrective action that only repeats the correction." }],
        getEl: () => $(NCR),
      },
      checkRowsCard("Once all three rows are in, click **Check my answers**. It shows each row's answer and why. The rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked. Owners and dates are format-checked and kept with your hand-in."),
    ],

    // T12.2 step 6: LI-CERT, AUD-LOG and LI-NCR-R named and handed in, in its row.
    "T12.2-6": [
      {
        title: "The files you hand in",
        icon: "file",
        body: "Your three files: **LI-CERT**, the certification briefing; **AUD-LOG**, the auditor request log; and **LI-NCR-R**, your response to NC-1. This step saves them in **02_Working** under their own names and submits them.",
        getEl: () => $('#act-6 [data-guide="jobs"]') ?? $('#act-6 [data-guide="file-name"]')?.parentElement ?? null,
      },
      ...(() => {
        const [name, submit] = nameAndSubmit("docx", "1 to 5");
        const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-6 [data-guide="file-name"]')[i] ?? null;
        const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
        const input = (i: number) => box(i)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null;
        return [
          { ...name, title: "Name the file", body: "Type the first file's name, for **LI-CERT** (a .docx), in its box.", getEl: () => box(0), pointAt: () => input(0), nextWhen: () => ok(0), doIt: "Type the LI-CERT file name" },
          { ...name, title: "Name the second file", body: "The same for **AUD-LOG** (an .xlsx), in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => input(1), onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the AUD-LOG file name" },
          { ...name, title: "Name the third file", body: "And for **LI-NCR-R** (a .docx), in the third box.", steps: undefined, getEl: () => box(2), pointAt: () => input(2), onEnter: () => box(2)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1) && ok(2), doIt: "Type the LI-NCR-R file name" },
          submit,
        ];
      })(),
      { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-6 [data-guide="step-complete"]') },
    ],
  };
}

/** T11.2's guides (registers.ts "T11.2", "T11.2 RV", "T11.2 NCR"). Hoisted like t122Guides; reads only helpers defined
 *  before STEP_GUIDES. */
function t112Guides(): Record<string, TourStep[]> {
  return {
    // T11.2 step 1: sheet Programme of LI-AUD, how often and who audits, per audit. One row worked: IA-05.
    "T11.2-1": [
      {
        title: "Sheet Programme",
        icon: "table",
        body: "This is sheet **Programme** of template **T-LI-AUD**: 23 audits that together cover clauses 4–10 and every applicable Annex A control over 2027. For each, choose how often it runs, the month or months, the method and the auditor. What your trackers show is filled from your LI-GAP and your control trackers.",
        getEl: () => $(LIAUD),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right says when an audit runs twice, how the months go, and where the auditor is read.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openDoc("Charter", "Then click **Section 13** at the top: who performs the internal audits."),
      {
        title: "Who audits",
        icon: "book",
        body: "Section 13 names who performs the internal audits. Section 17 says GRC staff may not audit what they designed or operate, and Section 16 shows who runs each process.",
        getEl: () => $(`${docWindow("Charter")} section[data-sec="13"]`) ?? $(docWindow("Charter")),
        onEnter: () => $(`${docWindow("Charter")} section[data-sec="13"]`)?.scrollIntoView({ block: "start" }),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **IA-05**, objectives and resources.",
        steps: [
          { lead: "Your trackers", text: "6.2 Fully met, Level 4; 7.1 Fully met, Level 3." },
          { lead: "How often", text: "Nothing at Level 1 or 2, nothing short of Fully met: **Once**." },
          { lead: "Month", text: "One month, for example **May 2027**." },
          { lead: "Method", text: "Objectives and budgets are documents and records: **Document review, interviews and sampling of records**." },
          { lead: "Auditor", text: "Section 13: the **Information Security Auditor** performs the internal audits, and runs neither process." },
        ],
        onEnter: () => { shutDoc("Charter"); audCell("Audits in the 12 months", 6)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => audCell("Audits in the 12 months", 6)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Fill the IA-05 row: **Once**, a single month, the method and the **Information Security Auditor**. Next unlocks once all four are in.",
        tips: [REOPEN],
        onEnter: () => audCell("Audits in the 12 months", 6)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => audCell("Audits in the 12 months", 6)?.closest("tr") ?? null,
        pointAt: () => audCell("Audits in the 12 months", 6),
        nextWhen: () => audCell("Audits in the 12 months", 6)?.value === "Once" && cellIn(audCell("Month(s)", 6)) && !!audCell("Method", 6)?.value && audCell("Auditor", 6)?.value === "Information Security Auditor",
        doIt: "Fill the IA-05 row",
      },
      {
        title: "Now the other 22",
        icon: "edit",
        body: "Do the same for each audit: read what your trackers show, decide how often, then the months, the method and the auditor.",
        tips: [
          { kind: "avoid", text: "auditing a row once because its levels are 3: a status short of Fully met is a poor earlier result too." },
          { kind: "avoid", text: "giving an audit to a role that runs what it audits. Check each row's processes against Section 16." },
          { kind: "note", text: "The auditor is the same on every row but one: the audit whose subject is work the Information Security Auditor does. Finding that row, and who may audit it instead, is the point of the column (Clause 9.2.2)." },
        ],
        getEl: () => $(LIAUD),
      },
      checkRowsCard("Once every audit is in, click **Check my answers**. It shows whether how often and the auditor were right on each row, the answer and why. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T11.2 step 2: who may audit the risk management process, from the Clause 9.2 summary; no part 2.
    "T11.2-2": askOnlyFromQR(2, "who may audit the risk management process.", "ISO/IEC 27001 Clause 9.2", "Read the entry for **ISO/IEC 27001 Clause 9.2**: how auditors are selected and audits conducted. Then hold each of the three options against it."),

    // T11.2 step 3: the level of each RV card, by the Maturity Model. One row worked: RV-03.
    "T11.2-3": [
      {
        title: "The Review Deck",
        icon: "table",
        body: "This is **RV-SET**, your set of nine RV cards: each row is what a reviewer found at the Manila office. For each card, choose its maturity level, Level 1 to 3.",
        getEl: () => $(RVSET),
      },
      {
        title: "The questions",
        icon: "book",
        body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage(RVQ, "It opens beside the sheet."),
      {
        title: "Eight fixed questions",
        icon: "search",
        body: "RV-Q1 to RV-Q5 are the Maturity Model's questions, one indicator at a time, with where on the card each is answered. RV-Q6 to RV-Q8 come in steps 4 and 5.",
        getEl: () => $(pageWindow(RVQ)),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **RV-03**, managers' security duties.",
        steps: [
          { lead: "Question 1", text: "A documented, approved way, with records? Yes: the checklist, approved by the Org CEO, with signed copies." },
          { lead: "Question 2", text: "The Group's way, in every office, reviewed yearly? No: it is Manila's own and has never been reviewed." },
          { lead: "Level", text: "Stop at the first No: **Level 2**." },
        ],
        onEnter: () => { shutPage(RVQ); rvCell("Maturity level", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => rvCell("Maturity level", 4)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Level 2** in the RV-03 row. Next unlocks once it is chosen.",
        getEl: () => rvCell("Maturity level", 4)?.closest("tr") ?? null,
        pointAt: () => rvCell("Maturity level", 4),
        nextWhen: () => rvCell("Maturity level", 4)?.value === "Level 2",
        doIt: "Choose the level of RV-03",
      },
      {
        title: "Now the other eight",
        icon: "edit",
        body: "Do the same for each card: the questions in order, against what the reviewer found.",
        tips: [{ kind: "avoid", text: "stopping at a good result. A card where everything works can still be the office's own way." }],
        getEl: () => $(RVSET),
      },
      checkRowsCard("Once every card has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the answer and why. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T11.2 step 4: classification, ISO reference, gap and recommendation per card. One row worked: RV-03 again.
    "T11.2-4": [
      {
        title: "Classify and report",
        icon: "table",
        body: "Each card's level from step 3 is beside it, with the indicators it gives. For each card, choose the classification and the ISO reference, then write the gap and your recommendation.",
        getEl: () => $(RVSET),
      },
      {
        title: "The convention",
        icon: "book",
        body: "The note on the right gives the training convention from level to classification, and where each clause and control is described.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **RV-03**, managers' security duties, at Level 2.",
        steps: [
          { lead: "Classification", text: "Level 2 → **Minor NC**." },
          { lead: "ISO reference", text: "Managers requiring their staff to apply security: **A.5.4 Management responsibilities**." },
          { lead: "Gap", text: "One manager signed only after his staff had access, and the checklist has never been reviewed." },
          { lead: "Recommendation", text: "Adopt a Group checklist, reviewed each year, signed before access; owner the Org CEO." },
        ],
        onEnter: () => rvCell("Classification", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => rvCell("Classification", 4)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Fill the RV-03 row: **Minor NC**, **A.5.4 Management responsibilities**, and the gap and the recommendation in your own words, six words or more each. Next unlocks once all four are in.",
        getEl: () => rvCell("Classification", 4)?.closest("tr") ?? null,
        pointAt: () => rvCell("Classification", 4),
        nextWhen: () => rvCell("Classification", 4)?.value === "Minor NC" && (rvCell("ISO reference", 4)?.value ?? "").startsWith("A.5.4 ") && cellIn(rvCell("Gap", 4)) && cellIn(rvCell("Recommendation", 4)),
        doIt: "Fill the RV-03 row",
      },
      {
        title: "Now the other eight",
        icon: "edit",
        body: "Do the same for each card: the classification from its level, the clause or control it answers to, the gap and the next action.",
        tips: [{ kind: "note", text: "Two topics can sound alike. Awareness is what people know; competence is the skills a role needs and the evidence of them." }],
        getEl: () => $(RVSET),
      },
      checkRowsCard("Once every card is in, click **Check my answers**. Classification and ISO reference are checked together; the gap and the recommendation go to the review. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T11.2 step 5: two nonconformities in LI-NCR. One row worked: NC-2 from RV-03 (Level 2).
    "T11.2-5": [
      {
        title: "Two nonconformities",
        icon: "table",
        body: "This is **LI-NCR**, template T-LI-NCR. NC-1 comes from a Level 1 card of your set, NC-2 from a Level 2 card. For each, choose the card, write the evidence and the statement of the gap, and grade it.",
        getEl: () => $(LINCR),
      },
      {
        title: "Rule L17",
        icon: "book",
        body: "The note on the right says what fills itself, and gives rule **L17**: never done in the period, or failed in more than half of the sample, is Major; any other failure is Minor.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **NC-2**, from RV-03.",
        steps: [
          { lead: "Card", text: "**RV-03**: its level and A.5.4 fill in from your steps 3 and 4." },
          { lead: "Evidence", text: "Of 10 managers sampled, the one appointed in September signed the checklist only in November." },
          { lead: "Statement", text: "A.5.4 requires managers to apply security as the policy says; one manager's duties were not signed on appointment." },
          { lead: "Grade", text: "One of ten, fewer than half, and the checklist is in use: **Minor**." },
        ],
        onEnter: () => ncrCell("Card", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => ncrCell("Card", 3)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Fill the NC-2 row: **RV-03**, the evidence and the statement in your own words, eight words or more each, and **Minor**. Next unlocks once all four are in.",
        getEl: () => ncrCell("Card", 3)?.closest("tr") ?? null,
        pointAt: () => ncrCell("Card", 3),
        nextWhen: () => cellIn(ncrCell("Card", 3)) && cellIn(ncrCell("Evidence", 3)) && cellIn(ncrCell("Statement of the gap", 3)) && ncrCell("Grade (L17)", 3)?.value === "Minor",
        doIt: "Fill the NC-2 row",
      },
      {
        title: "Now NC-1",
        icon: "edit",
        body: "Do the same for NC-1, from one of your Level 1 cards: its facts as evidence, what its requirement asks and what is not done, and its grade by L17.",
        getEl: () => ncrCell("Card", 2)?.closest("tr") ?? $(LINCR),
      },
      checkRowsCard("Once both rows are in, click **Check my answers**. It shows whether each grade was right and why; the evidence and the statement go to the review. The rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T11.2 step 6: LI-AUD and LI-NCR named and handed in, in its row.
    "T11.2-6": [
      {
        title: "The files you hand in",
        icon: "file",
        body: "Your two files: **LI-AUD**, the internal audit programme, and **LI-NCR**, the nonconformity report. Your review set, RV-SET, is handed in on the platform with them. This step saves the files in **02_Working** under their own names and submits them.",
        getEl: () => $('#act-6 [data-guide="jobs"]') ?? $('#act-6 [data-guide="file-name"]')?.parentElement ?? null,
      },
      ...(() => {
        const [name, submit] = nameAndSubmit("xlsx", "1 to 5");
        const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-6 [data-guide="file-name"]')[i] ?? null;
        const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
        const input = (i: number) => box(i)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null;
        return [
          { ...name, title: "Name the file", body: "Type the first file's name, for **LI-AUD**, in its box.", getEl: () => box(0), pointAt: () => input(0), nextWhen: () => ok(0), doIt: "Type the LI-AUD file name" },
          { ...name, title: "Name the second file", body: "The same for **LI-NCR**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => input(1), onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the LI-NCR file name" },
          submit,
        ];
      })(),
      { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-6 [data-guide="step-complete"]') },
    ],
  };
}

/** T5.2's guides (registers.ts "T5.2" LI-SOA, "T5.2 CIT" CIT-S4a, "T5.2 PACK", "T5.2 OBJ"). Hoisted like t122Guides; reads
 *  only helpers defined before STEP_GUIDES. Rows are found by their control or gap, not by number: the tracker's rows move
 *  as the sprints before it are built. */
function t52Guides(): Record<string, TourStep[]> {
  const SOA = '[data-guide="register"][data-reg="LI-SOA"]';
  const CIT = '[data-guide="register"][data-reg="CIT-S4a"]';
  const OBJ = '[data-guide="register"][data-reg="LI-OBJ"]';
  const SRC = "Source: risk / legal / contractual / business";
  // On a phone a prose column becomes a line under its row (data-under-row): the row is found by either.
  const rowOf = (reg: string, first: string) => [...document.querySelectorAll<HTMLElement>(`${reg} tbody tr[data-row]`)].find((tr) => {
    let text = tr.innerText;
    for (let nx = tr.nextElementSibling as HTMLElement | null; nx?.hasAttribute("data-under-row"); nx = nx.nextElementSibling as HTMLElement | null) text += nx.innerText;
    return text.includes(first);
  }) ?? null;
  const cellOf = (reg: string, first: string, col: string) => rowOf(reg, first)?.querySelector<HTMLSelectElement | HTMLTextAreaElement>(`[aria-label^="${col}, row "]`) ?? null;
  const soaStudy = (col: string, control: string) => $(`${SOA} button[aria-label^="${col}, ${control}:"]`);
  const citStudy = (col: string, control: string) => $(`${CIT} button[aria-label^="${col}, ${control}:"]`);
  const LI58 = "LI-A.5.8";
  const RISK_ROW = "Vulnerabilities: your LI-RTP";
  return {
    // T5.2 step 1: the SoA opened; two cells of the worked row and one carried-over status found.
    "T5.2-1": [
      {
        title: "Your Statement of Applicability",
        icon: "table",
        body: "This is template **T-LI-SOA**: one row for each of the 93 Annex A controls, with each control's facts at Manila from dataset **SOA-93**. Its first row is a LearnTech Educational Solutions worked example, filled in from Applicable to Evidence ref.",
        getEl: () => $(SOA),
      },
      {
        title: "Three things to find",
        icon: "help",
        body: "Each question on the right asks for one cell of the SoA. Answer it by clicking the cell.",
        getEl: () => $('[data-guide="study"]'),
      },
      {
        title: "Find the first one",
        icon: "edit",
        body: "What calls for the worked row's control? Read its **Source** and click it.",
        onEnter: () => soaStudy(SRC, "A.5.23")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => soaStudy(SRC, "A.5.23")?.closest("tr") ?? null,
        pointAt: () => soaStudy(SRC, "A.5.23"),
        nextWhen: () => !!$('[data-guide="study"] [data-found="src"]'),
        doIt: "Click the worked row's source",
      },
      {
        title: "Now the other two",
        icon: "check",
        body: "Answer the other two the same way. The third is on one of your own rows: **Implemented?** is carried over from your tracker for the controls already sprinted (rule L07).",
        tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
        getEl: () => $('[data-guide="study"]'),
      },
      finish("**Mark step complete** unlocks once all three are found."),
    ],

    // T5.2 step 2: applicability and source of 92 controls. One row worked: A.5.5, Contact with authorities.
    "T5.2-2": [
      {
        title: "92 controls to decide",
        icon: "table",
        body: "For each control, read its facts at Manila (SOA-93). Choose whether it is **Applicable**, and the **Source** that calls for it. A.8.30 is step 3's question.",
        getEl: () => $(SOA),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right is rule **L06**: applicable when a risk, a legal or contractual requirement, or a business need calls for it; the source is the first the facts give, in that order.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.5 Contact with authorities**.",
        steps: [
          { lead: "What its facts name", text: "The Data Privacy Act 2012, which requires serious breaches to be notified to the National Privacy Commission within 72 hours." },
          { lead: "A risk?", text: "None is named. A law is: **Applicable**, source **Legal requirement**." },
        ],
        onEnter: () => cellOf(SOA, "A.5.5", "Applicable")?.scrollIntoView({ block: "center", inline: "nearest" }),
        getEl: () => rowOf(SOA, "A.5.5"),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Applicable** and **Legal requirement** in the A.5.5 row. Next unlocks once both are chosen.",
        getEl: () => rowOf(SOA, "A.5.5"),
        pointAt: () => cellOf(SOA, "A.5.5", "Applicable"),
        nextWhen: () => cellOf(SOA, "A.5.5", "Applicable")?.value === "Applicable" && cellOf(SOA, "A.5.5", SRC)?.value === "Legal requirement",
        doIt: "Fill the A.5.5 row",
      },
      {
        title: "Now the other 91",
        icon: "edit",
        body: "Do the same for each control: read its facts, ask what calls for it, and take the first source in rule L06's order.",
        tips: [
          { kind: "avoid", text: "marking a control Not applicable because most of the office does not do what it governs. Read the whole fact: if any part of the office does, it is applicable." },
          { kind: "note", text: "The justifications, Implemented? and Evidence ref fill themselves; you see them in step 1's view and in the hand-in." },
        ],
        getEl: () => $(SOA),
      },
      checkRowsCard("Once every control has both, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T5.2 step 3: A.8.30, answered from rule L06 and its facts; no part 2 (the row is written from the answer).
    "T5.2-3": lowPick(decideInRow(3, "what you record for A.8.30 Outsourced development, when Manila outsources no development. Rule L06, in the situation, says when a control is Not applicable and what the SoA records then.", [], "Your answer is written into the A.8.30 row of your SoA. This button unlocks once you have checked it.")),

    // T5.2 steps 4 and 5: answered from the Clause 6.1.3 entry; no part 2.
    "T5.2-4": askOnlyFromQR(4, "which four elements the SoA must contain.", "ISO/IEC 27001 Clause 6.1.3", "Read the entry for **ISO/IEC 27001 Clause 6.1.3**: what d) says the Statement of Applicability contains. Then hold each of the three options against it."),
    "T5.2-5": askOnlyFromQR(5, "which other ISMS output the SoA must agree with.", "ISO/IEC 27001 Clause 6.1.3", "Read the entry for **ISO/IEC 27001 Clause 6.1.3**: where the controls of b) come from, and what is recorded in d). Then hold each of the three options against it."),

    // T5.2 step 6: the tracker CIT-S4a opened; A.5.8's owner, its observation and an earlier sprint's status found.
    "T5.2-6": [
      {
        title: "The tracker, sprint 4a",
        icon: "table",
        body: "This is your control implementation tracker, **T-LI-CIT**, now at sprint 4a: **A.5.8 Information security in project management**. The rows of the sprints before it show as their own trackers stand, below the LearnTech worked row.",
        getEl: () => $(CIT),
      },
      {
        title: "Three things to find",
        icon: "help",
        body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
        getEl: () => $('[data-guide="study"]'),
      },
      ...openPage(LI58, "It opens beside the tracker."),
      {
        title: "A.5.8's LI task page",
        icon: "book",
        body: "The note gives the control's owner, **what it requires** (three numbered items) and its evidence focus; the table lists its three sub-tasks, each with the evidence item it produces.",
        tips: [{ kind: "note", text: "Stuck? **LI-Q fixed questions**, in the same list, gives the eight questions to ask of a control." }],
        getEl: () => $(pageWindow(LI58)),
      },
      {
        title: "Find the first one",
        icon: "edit",
        body: "Click A.5.8's owner role in column **C**.",
        onEnter: () => { shutPage(LI58); citStudy("C Owner role", "A.5.8")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => citStudy("C Owner role", "A.5.8")?.closest("tr") ?? null,
        pointAt: () => citStudy("C Owner role", "A.5.8"),
        nextWhen: () => !!$('[data-guide="study"] [data-found="own"]'),
        doIt: "Click A.5.8's owner role",
      },
      {
        title: "Now the other two",
        icon: "check",
        body: "Answer the other two the same way: one is on A.5.8's row, one on a sprint 1 row.",
        tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
        getEl: () => $('[data-guide="study"]'),
      },
      finish("**Mark step complete** unlocks once all three are found."),
    ],

    // T5.2 step 7: column D of A.5.8. The first requirement worked; the learner weighs the other two.
    "T5.2-7": [
      {
        title: "A.5.8's status",
        icon: "table",
        body: "Read what A.5.8 requires and what SOA-93 observed at Manila, one requirement at a time. Then choose its status in column **D**.",
        getEl: () => rowOf(CIT, "A.5.8") ?? $(CIT),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right gives the rule: every requirement met, some, or none.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "Requirement 1, worked",
        icon: "help",
        body: "**1) Security is built into the project method.**",
        steps: [
          { lead: "What was observed", text: "Every project uses Manila's own template, and it has a security review, but the review is an optional box." },
          { lead: "So", text: "Met in part: the method names security, but nothing makes a project do it." },
        ],
        tips: [{ kind: "note", text: "Now hold requirements 2 and 3 against the observation the same way, then count." }],
        onEnter: () => rowOf(CIT, "A.5.8")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => rowOf(CIT, "A.5.8"),
      },
      {
        title: "Choose it",
        icon: "edit",
        body: "Choose A.5.8's status in column **D**. Next unlocks once it is chosen.",
        getEl: () => rowOf(CIT, "A.5.8"),
        pointAt: () => cellOf(CIT, "A.5.8", "D Status"),
        nextWhen: () => !!cellOf(CIT, "A.5.8", "D Status")?.value,
        doIt: "Choose the status of A.5.8",
      },
      checkRowsCard("Click **Check my answers**. It shows the answer and why. The row locks then."),
      finish("**Mark step complete** unlocks once your answer is checked."),
    ],

    // T5.2 step 8: column E of A.5.8. The Maturity Model's first question worked; the learner asks the next.
    "T5.2-8": [
      {
        title: "A.5.8's level",
        icon: "table",
        body: "Read what was observed at Manila, with its status beside it. Then choose A.5.8's maturity level in column **E**.",
        getEl: () => rowOf(CIT, "A.5.8") ?? $(CIT),
      },
      ...openPage(MM, "It opens beside the tracker."),
      {
        title: "Ask in order",
        icon: "search",
        body: "The note gives the three questions; stop at the first **No**. Each level has a LearnTech example.",
        getEl: () => $(pageWindow(MM)),
      },
      {
        title: "Question 1, worked",
        icon: "help",
        body: "**Is there a documented, approved way of doing it, with records?**",
        steps: [{ lead: "What was observed", text: "Manila's project template, approved by the Org CISO in May 2025; every project is logged with its stage-gate records. **Yes**: go on to question 2." }],
        onEnter: () => { shutPage(MM); rowOf(CIT, "A.5.8")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => rowOf(CIT, "A.5.8"),
      },
      {
        title: "Choose it",
        icon: "edit",
        body: "Ask question 2 of the observation yourself, then choose the level in column **E**. Next unlocks once it is chosen.",
        tips: [{ kind: "note", text: "Status and level are separate questions: the missing security content is the status, not the level." }],
        getEl: () => rowOf(CIT, "A.5.8"),
        pointAt: () => cellOf(CIT, "A.5.8", "E Maturity level"),
        nextWhen: () => !!cellOf(CIT, "A.5.8", "E Maturity level")?.value,
        doIt: "Choose the level of A.5.8",
      },
      checkRowsCard("Click **Check my answers**. The level is checked exactly; it shows the answer and why."),
      finish("**Mark step complete** unlocks once your answer is checked."),
    ],

    // T5.2 step 9: the evidence pack of A.5.8. One row worked: LI-A.5.8-01, the project register.
    "T5.2-9": [
      {
        title: "The evidence pack",
        icon: "table",
        body: "Every sub-task of **LI-A.5.8**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
        getEl: () => $(PACKR),
      },
      {
        title: "Three kinds of answer",
        icon: "book",
        body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage(LI58, "It opens beside the sheet."),
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **LI-A.5.8-01**.",
        steps: [
          { lead: "Evidence item", text: "A project register, with the security assessment recorded for each project." },
          { lead: "Already handed in?", text: "No file of yours lists Manila's projects." },
          { lead: "In the dataset?", text: "Yes: SOA-93 says every project is logged in the project register. Prepare it from there: **the item's own new file**, M2610-00001_T5.2_LI-A.5.8-01_v1.xlsx." },
        ],
        onEnter: () => { shutPage(LI58); packCell(EVREF, 1)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose that file in row LI-A.5.8-01. Next unlocks once it is chosen.",
        getEl: () => packCell(EVREF, 1)?.closest("tr") ?? null,
        pointAt: () => packCell(EVREF, 1),
        nextWhen: () => (packCell(EVREF, 1)?.value ?? "").endsWith("_T5.2_LI-A.5.8-01_v1.xlsx"),
        doIt: "Fill row LI-A.5.8-01",
      },
      {
        title: "Now the other two",
        icon: "edit",
        body: "For each sub-task, hold its evidence item against your files and against what SOA-93 observed (the Observed column).",
        tips: [
          { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
          { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
        ],
        getEl: () => $(PACKR),
      },
      checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. If a ref turns out to be None, write its gap then."),
      {
        title: "Save the pack to 02_Working",
        icon: "upload",
        body: "Click **Save to 02_Working**: the evidence pack is handed in on the platform, and the receipt shows a hash and a UTC time.",
        getEl: () => $('[data-guide="submit"]'),
      },
      finish("With the receipt in, click **Mark step complete**."),
    ],

    // T5.2 step 10: answered from the Clause 6.2 entry; no part 2.
    "T5.2-10": askOnlyFromQR(10, "which of three lines is a measurable ISMS objective.", "ISO/IEC 27001 Clause 6.2", "Read the entry for **ISO/IEC 27001 Clause 6.2**: what b) asks of an objective, and what the last lines say a measurable objective names. Then hold each of the three options against it."),

    // T5.2 step 11: sheet Objectives. One row worked: the overdue risk treatment.
    "T5.2-11": [
      {
        title: "Sheet Objectives",
        icon: "table",
        body: "Four rows, each a gap or a risk your work so far found at Manila. For each, choose the **objective** and **who is responsible**, then write what will be done, the resources, how results are evaluated and the milestones. **When** fills from the objective.",
        getEl: () => $(OBJ),
      },
      {
        title: "How to choose",
        icon: "book",
        body: "The note on the right: measurable means what is counted, a target and a date (rule L14); the role is the one marked R for its process in the GRC Charter Section 16, or else the owner on the control's LI task page.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take the first row, **vulnerabilities**.",
        steps: [
          { lead: "Objective", text: "\"Close class 1–2 vulnerabilities on time: remediation SLA compliance 90% or more, by 30 June 2027\": a count, a target and a date. \"Faster than last year\" has neither; a scanner is an activity." },
          { lead: "Who", text: "Vulnerability governance: the Vulnerability Management Governance Analyst is R (Charter Section 16)." },
        ],
        onEnter: () => rowOf(OBJ, RISK_ROW)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => rowOf(OBJ, RISK_ROW),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose that objective and **Vulnerability Management Governance Analyst** in the first row. Next unlocks once both are chosen.",
        getEl: () => rowOf(OBJ, RISK_ROW),
        pointAt: () => cellOf(OBJ, RISK_ROW, "Objective (L14)"),
        nextWhen: () => (cellOf(OBJ, RISK_ROW, "Objective (L14)")?.value ?? "").startsWith("Close class 1–2") && cellOf(OBJ, RISK_ROW, "Who is responsible")?.value === "Vulnerability Management Governance Analyst",
        doIt: "Choose the objective and the role",
      },
      {
        title: "Then write its plan",
        icon: "edit",
        body: "In the same row write what will be done, the resources, how results are evaluated, and two or more dated milestones. Each box says what it needs if it is short.",
        tips: [{ kind: "note", text: "For example: done, \"Track every class 1–2 finding to its SLA date and escalate each one at risk of missing it\"; evaluated, \"Share of class 1–2 findings closed within SLA, counted by the Compliance Manager each quarter\"." }],
        getEl: () => rowOf(OBJ, RISK_ROW),
        pointAt: () => cellOf(OBJ, RISK_ROW, "What will be done"),
        nextWhen: () => ["What will be done", "Resources", "How results are evaluated", "Milestones (L15)"].every((c) => cellIn(cellOf(OBJ, RISK_ROW, c))),
        doIt: "Write the first row's plan",
      },
      {
        title: "Now the other three",
        icon: "edit",
        body: "Do the same for leavers, ISMS roles and suppliers.",
        tips: [{ kind: "avoid", text: "an objective with a date but nothing to count, or an activity in place of a result." }],
        getEl: () => $(OBJ),
      },
      checkRowsCard("Once every row is filled, click **Check my answers**. The objective and the role are checked together; the rest is format-checked and kept with your hand-in."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T5.2 step 12: LI-SOA and LI-OBJ named and handed in, in its row (the tracker rows go with them).
    "T5.2-12": [
      {
        title: "The files you hand in",
        icon: "file",
        body: "Your two files: **LI-SOA**, the Statement of Applicability, and **LI-OBJ**, the objectives and their plan. Your tracker's sprint 4a row goes in with them. This step saves them in **02_Working** under their own names and submits them.",
        getEl: () => $('#act-12 [data-guide="jobs"]') ?? $('#act-12 [data-guide="file-name"]')?.parentElement ?? null,
      },
      ...(() => {
        const [name, submit] = nameAndSubmit("xlsx", "1 to 11");
        const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-12 [data-guide="file-name"]')[i] ?? null;
        const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
        return [
          { ...name, title: "Name the file", body: "Type the first file's name, for **LI-SOA**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the LI-SOA file name" },
          { ...name, title: "Name the second file", body: "The same for **LI-OBJ**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the LI-OBJ file name" },
          submit,
        ];
      })(),
      { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-12 [data-guide="step-complete"]') },
    ],
  };
}

/**
 * Every decision guide, once: its question can be answered at any card that lights it (the first card lights the
 * whole question, and the hole stays live), or before the guide runs at all (Show me how on an answered step).
 * - Each card from the second up to and including "Pick and check" leads to the answer (open the source, read it, pick): once the
 *   answer is checked they pass by, rather than send the learner to read for a choice that is locked.
 * - "Finish here" passes by once the step is complete (its button is gone; the card pointed at nothing).
 * Checked is the question's lock (its fieldset disabled), not its feedback, which arrives a moment later.
 */
// T8.1's sheets (registers.ts): IR-TTX (the six injects, INJ-1 … INJ-6 in rows 1–6) and its sheet Notification (IR-NOTICE, one
// row); sprint 8's tracker CIT-S8, whose rows follow every earlier sprint's (found by control, as T6.1's), and its pack LI-A
// (LI-A.5.24-01 … LI-A.5.28-03, rows 1–6).
{
  const TTXR = '[data-guide="register"][data-reg="IR-TTX"]';
  const NOTR = '[data-guide="register"][data-reg="IR-NOTICE"]';
  const ttxCell = (col: string, row: number) => $(`${TTXR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
  // A click-the-cell button names column 1 (the UTC time), not the inject: its row is found by its first cell.
  const ttxStudy = (col: string, inj: string) => [...document.querySelectorAll<HTMLElement>(`${TTXR} tbody tr`)].find((tr) => tr.innerText.trim().startsWith(inj))?.querySelector<HTMLElement>(`button[aria-label^="${col},"]`) ?? null;
  const notCell = (col: string) => $(`${NOTR} [aria-label="${col}, row 1"]`) as HTMLInputElement | null;
  const cit81 = (col: string, control: string, n: number) => sprintCell(8, col, citRow("T8.1", n, control));
  const POL14 = "SITL-POL-014";
  // Step 4: the question from SITL-POL-014 Section 6.3, then part 2 in Control Testing › Record Result.
  const q4 = askOnlyFromDoc(4, "when the authority must be notified.", POL14, "6.3", "Read **Section 6.3**, rule R30 step by step: which offices are engaged (step 1), where their clock is read (step 2), when the clock starts (step 6) and which deadline governs (step 7). Then hold each of the three options against it.");
  Object.assign(STEP_GUIDES, {
    // T8.1 step 1: IR-TTX and the scenario read; three click-the-cell questions on the injects.
    "T8.1-1": [
      {
        title: "The exercise record",
        icon: "table",
        body: "This is **IR-TTX**, the record of the tabletop exercise: the six injects of dataset TTX, in the order the team plays them. Phase, Decision and Control fill in as you work through steps 2 to 4.",
        getEl: () => $(TTXR),
        // Kept in view and kept off: the card named Sources for this step sits beside the table (UX101 W9).
        alsoShow: () => $('[data-guide="read-first"]'),
      },
      {
        title: "The scenario",
        icon: "book",
        body: "The note on the right sets the scene: where and when the exercise is played, who runs it, and what the attacker does. Every time in the record is in UTC.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "Three things to find",
        icon: "help",
        body: "Each question on the right asks for one cell of the record. Answer it by clicking the cell.",
        getEl: () => $('[data-guide="study"]'),
      },
      {
        title: "Find the first one",
        icon: "edit",
        body: "Manila is 8 hours ahead of UTC (UTC+8). Find 11:20 Manila time in the **UTC time** column and click it.",
        steps: [
          { lead: "Manila to UTC: take 8 hours off", text: "17:30 in Manila is 09:30 UTC." },
          { lead: "UTC to Manila: add 8 hours", text: "22:00 UTC is 06:00 the next day in Manila." },
          { lead: "Now yours", text: "Convert 11:20 Manila time the same way." },
        ],
        onEnter: () => ttxStudy("UTC time", "INJ-3")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => ttxStudy("UTC time", "INJ-3")?.closest("tr") ?? null,
        pointAt: () => ttxStudy("UTC time", "INJ-3"),
        nextWhen: () => !!$('[data-guide="study"] [data-found="utc"]'),
        doIt: "Click the UTC time",
      },
      {
        title: "Now the other two",
        icon: "check",
        body: "Read the injects in order, then answer the other two questions the same way.",
        tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
        getEl: () => $('[data-guide="study"]'),
      },
      finish("**Mark step complete** unlocks once all three are found."),
    ],

    // T8.1 step 2: the phase of each inject. One row worked: INJ-4.
    "T8.1-2": [
      {
        title: "Six injects to place",
        icon: "table",
        body: "For each inject, read what happens in it. Then choose, in column **Phase**, the stage of the incident life cycle it belongs to.",
        getEl: () => $(TTXR),
      },
      {
        title: "The five phases",
        icon: "book",
        body: "The note on the right says what each phase covers, each with its Annex A control.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openDoc(POL14, "Then click **Section 6.1** in the bar at the top of the window."),
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **INJ-4**.",
        steps: [
          { lead: "What happens", text: "The laptop is cut off from the network, the site blocked, the password reset." },
          { lead: "Section 6.1", text: "Step 3, **Contain**: isolate, block, reset credentials. Acting on the incident." },
          { lead: "Phase", text: "**Response (A.5.26)**." },
        ],
        onEnter: () => $(`${docWindow(POL14)} section[data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
        getEl: () => (phone() ? $(docWindow(POL14)) : ttxCell("Phase", 4)?.closest("tr") ?? null),
        alsoShow: () => $(docWindow(POL14)),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Response (A.5.26)** in the INJ-4 row. Next unlocks once it is chosen.",
        tips: [REOPEN],
        onEnter: () => { shutDoc(POL14); ttxCell("Phase", 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => ttxCell("Phase", 4)?.closest("tr") ?? null,
        pointAt: () => ttxCell("Phase", 4),
        nextWhen: () => ttxCell("Phase", 4)?.value === "Response (A.5.26)",
        doIt: "Choose the phase of INJ-4",
      },
      {
        title: "Now the other five",
        icon: "edit",
        body: "For each inject, ask what it is about: getting ready, deciding what an event is, acting on the incident, keeping what an investigation needs, or learning afterwards.",
        tips: [{ kind: "avoid", text: "placing an inject by who owns it. The same person can act in several phases." }],
        getEl: () => $(TTXR),
      },
      checkRowsCard("Once every inject has a phase, click **Check my answers**. It shows each row's answer and why. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T8.1 step 3: the laptop, answered from SITL-POL-014 Sections 7.1 and 3.1; no part 2.
    "T8.1-3": askOnlyFromDoc(3, "what the team does first when an engineer wants to reimage the compromised laptop.", POL14, "7.1", "Read **Section 7.1**, the first-hour checklist, line by line, and the line of Section 3.1 on evidence. Then hold each of the three options against them."),

    "T8.1-4q": q4.map((c) => (c.title === "Finish here"
      ? { title: "Then part 2", icon: "table", body: "Part 2 is sheet **Notification** of IR-TTX: the discovery time and the deadline, in UTC. Click **Open Record Result** to do it.", getEl: () => [...document.querySelectorAll<HTMLElement>("#act-4 button")].find((b) => /^Open /.test(b.innerText.trim())) ?? null }
      : c)),

    // T8.1 step 4, part 2: sheet Notification. One worked case on another office (its only row is the learner's).
    "T8.1-4": [
      {
        title: "Sheet Notification",
        icon: "table",
        onEnter: () => shutDoc(POL14),
        body: "Your answer is in. Part 2 is sheet **Notification**: the regime of the engaged office with its clock, as the addendum's Section 2 gives it. You record when the clock started and when it runs out, both in UTC.",
        getEl: () => $(NOTR),
      },
      {
        title: "Where to read",
        icon: "book",
        body: "The note on the right names the steps of SITL-POL-014 Section 6.3 to read. Below them it quotes the three injects whose times bear on it.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openDoc(POL14, "Then click **Section 6.3** in the bar at the top of the window."),
      {
        title: "A worked case",
        icon: "help",
        body: "Another office, the same rule: LearnTech Educational Solutions, Amsterdam.",
        steps: [
          { lead: "Times", text: "Monitoring alert 13:05 UTC; incident logged in the incident tool 13:20 UTC; platform offline 13:50 UTC, all on 2026-12-08." },
          { lead: "Step 6", text: "Discovery is the moment it is logged: **2026-12-08 13:20 UTC**." },
          { lead: "Clock", text: "72h to the supervisory authority (GDPR Art.33): **2026-12-11 13:20 UTC**." },
        ],
        onEnter: () => $(`${docWindow(POL14)} section[data-sec="6.3"]`)?.scrollIntoView({ block: "start" }),
        getEl: () => (phone() ? $(docWindow(POL14)) : $(NOTR)),
        alsoShow: () => $(docWindow(POL14)),
      },
      {
        title: "Now yours",
        icon: "edit",
        body: "Find in the injects the moment INC-2611-0142 was logged, and record it as the discovery time. Then add the clock and record the deadline. Next unlocks once both are in.",
        tips: [REOPEN, { kind: "avoid", text: "starting the clock at the alert, or at a later inject. Section 6.3, step 6 says when it starts." }, { kind: "note", text: "Both times stay in UTC, as the injects give them. Only if you want the Manila time, add 8 hours: 22:00 UTC is 06:00 the next day in Manila." }],
        onEnter: () => { shutDoc(POL14); notCell("Discovery time (UTC)")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => notCell("Discovery time (UTC)")?.closest("tr") ?? null,
        pointAt: () => notCell("Discovery time (UTC)"),
        nextWhen: () => !!notCell("Discovery time (UTC)")?.value && !!notCell("Deadline (UTC)")?.value,
        doIt: "Record the two times",
      },
      checkRowsCard("Click **Check my answers**. It shows the answer and why. The row locks then."),
      finish("**Mark step complete** unlocks once your answer is checked."),
    ],

    // T8.1 step 5: the tracker located (sprint 8), the LI task pages and SPR-08 read; three click-the-cell questions.
    "T8.1-5": [
      {
        title: "The tracker",
        icon: "table",
        body: "This is your control implementation tracker, **T-LI-CIT**, at sprint 8: A.5.5, A.5.24 to A.5.28 and A.6.8. The earlier sprints' rows stand as you left them. Its first row is a LearnTech Educational Solutions worked example, filled in from A to G.",
        getEl: () => $(citSel(8)),
        alsoShow: () => $('[data-guide="read-first"]'),
      },
      {
        title: "Three things to find",
        icon: "help",
        body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
        getEl: () => $('[data-guide="study"]'),
      },
      {
        title: "Find the first one",
        icon: "edit",
        body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
        onEnter: () => sprintStudy(8, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => sprintStudy(8, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
        pointAt: () => sprintStudy(8, "F Evidence ref", "A.8.13"),
        nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
        doIt: "Click the worked row's evidence ref",
      },
      ...openPage("LI-A.5.5", "It opens beside the tracker."),
      {
        title: "An LI task page",
        icon: "book",
        body: "Every sprint control has one, LI-A.5.5 to LI-A.6.8. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
        tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
        getEl: () => $(pageWindow("LI-A.5.5")),
      },
      {
        title: "Now the other two",
        icon: "check",
        body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
        tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
        onEnter: () => shutPage("LI-A.5.5"),
        getEl: () => $('[data-guide="study"]'),
      },
      finish("**Mark step complete** unlocks once all three are found."),
    ],

    // T8.1 step 6: column D, the status of the seven controls. One row worked: A.5.28.
    "T8.1-6": [
      {
        title: "Seven controls to rate",
        icon: "table",
        body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-08). Then choose its status in column **D**.",
        getEl: () => $(citSel(8)),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right gives the rule: every requirement met, some, or none.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.28 Collection of evidence**.",
        steps: [
          { lead: "Requirements 1 and 2", text: "A procedure, approved for Manila; a chain-of-custody form for each SEV2 incident: met." },
          { lead: "Requirement 3", text: "No hash taken of what was collected, nobody trained: not met." },
          { lead: "Status", text: "Some met: **Partially implemented**." },
        ],
        onEnter: () => cit81("D Status", "A.5.28", 6)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => cit81("D Status", "A.5.28", 6)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Partially implemented** in the A.5.28 row. Next unlocks once it is chosen.",
        getEl: () => cit81("D Status", "A.5.28", 6)?.closest("tr") ?? null,
        pointAt: () => cit81("D Status", "A.5.28", 6),
        nextWhen: () => cit81("D Status", "A.5.28", 6)?.value === "Partially implemented",
        doIt: "Choose the status of A.5.28",
      },
      {
        title: "Now the other six",
        icon: "edit",
        body: "Do the same for each control: each requirement in turn, against what was observed.",
        tips: [
          { kind: "avoid", text: "counting what the Group has written as done at Manila. The observation says what the office does." },
          { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
        ],
        getEl: () => $(citSel(8)),
      },
      checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T8.1 step 7: column E, the level of the seven controls. One row worked: A.5.24.
    "T8.1-7": [
      {
        title: "A level per control",
        icon: "table",
        body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
        getEl: () => $(citSel(8)),
      },
      {
        title: "The questions",
        icon: "book",
        body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage(MM, "It opens beside the tracker."),
      {
        title: "What each level looks like",
        icon: "search",
        body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
        getEl: () => $(pageWindow(MM)),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.24 Information security incident management planning and preparation**.",
        steps: [
          { lead: "Question 1", text: "Documented, approved, with records? Yes: the plan, approved in October 2026, its yearly approval recorded." },
          { lead: "Question 2", text: "The Group's way, every office, reviewed yearly? Yes: the Group template, approved the same way in every office each year." },
          { lead: "Question 3", text: "Measured against targets? No: nobody measures how ready the team is. **Level 3 Defined**." },
        ],
        onEnter: () => { shutPage(MM); cit81("E Maturity level", "A.5.24", 7)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => cit81("E Maturity level", "A.5.24", 7)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Level 3 Defined** in the A.5.24 row. Next unlocks once it is chosen.",
        tips: [{ kind: "note", text: "The stale call tree and the missing training are the control's status (step 6), not its level." }],
        getEl: () => cit81("E Maturity level", "A.5.24", 7)?.closest("tr") ?? null,
        pointAt: () => cit81("E Maturity level", "A.5.24", 7),
        nextWhen: () => cit81("E Maturity level", "A.5.24", 7)?.value === "Level 3 Defined",
        doIt: "Choose the level of A.5.24",
      },
      {
        title: "Now the other six",
        icon: "edit",
        body: "Do the same for each control: the questions in order, against what was observed at the office.",
        tips: [{ kind: "avoid", text: "lowering a level for a gap. A control done the Group's way can still miss a requirement." }],
        getEl: () => $(citSel(8)),
      },
      checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T8.1 step 8: the evidence packs of A.5.24 and A.5.28. One row worked: LI-A.5.24-02, the tabletop record.
    "T8.1-8": [
      {
        title: "The evidence packs",
        icon: "table",
        body: "Every sub-task of **LI-A.5.24** and **LI-A.5.28**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
        getEl: () => $(PACKR),
      },
      {
        title: "Three kinds of answer",
        icon: "book",
        body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage("LI-A.5.24", "It opens beside the sheet."),
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **LI-A.5.24-02**.",
        steps: [
          { lead: "Evidence item", text: "A tabletop exercise record." },
          { lead: "Already in 02_Working?", text: "Yes: your IR-TTX of steps 1 to 4 records the tabletop of 24 November." },
          { lead: "Record", text: "**M2610-00001_T8.1_IR-TTX_v1.docx**. Its gap fills with a dash by itself." },
        ],
        onEnter: () => { shutPage("LI-A.5.24"); packCell(EVREF, 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => packCell(EVREF, 2)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose your IR-TTX file in row LI-A.5.24-02. Next unlocks once it is chosen.",
        getEl: () => packCell(EVREF, 2)?.closest("tr") ?? null,
        pointAt: () => packCell(EVREF, 2),
        nextWhen: () => (packCell(EVREF, 2)?.value ?? "").endsWith("_T8.1_IR-TTX_v1.docx"),
        doIt: "Fill row LI-A.5.24-02",
      },
      {
        title: "Now the other five",
        icon: "edit",
        body: "For each sub-task, hold its evidence item against your files and against what SPR-08 observed (the sheet's Observed column).",
        tips: [
          { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
          { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
        ],
        getEl: () => $(PACKR),
      },
      checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
      {
        title: "Save the packs to 02_Working",
        icon: "upload",
        body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
        getEl: () => $('[data-guide="submit"]'),
      },
      finish("With the receipt in, click **Mark step complete**."),
    ],

    // T8.1 step 9: sub-task 01 and the next action of the five other controls. One row worked: A.5.26.
    "T8.1-9": [
      {
        title: "Five controls, first evidence",
        icon: "table",
        body: "For **A.5.5, A.5.25, A.5.26, A.5.27 and A.6.8**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action and the Level 4 measure.",
        getEl: () => $(citSel(8)),
      },
      {
        title: "How to choose",
        icon: "book",
        body: "The note on the right gives the order for F, as in step 8, and what G needs: below Level 3, the step to Level 3; at Level 3 already, the step that closes the gap; and a measure with a target (LI-Q2).",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
      {
        title: "LI-Q2",
        icon: "search",
        body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
        getEl: () => $(pageWindow("LI-Q fixed questions")),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.26 Response to information security incidents**.",
        steps: [
          { lead: "F", text: "Sub-task 01 asks for an incident record with its timeline. No file you handed in holds one, but the incident tool logs every action of the 5 incidents: the new item **M2610-00001_T8.1_LI-A.5.26-01_v1.xlsx**." },
          { lead: "G", text: "Level 2, Manila's own runbook: next, **Group playbooks replace the runbook, all offices, reviewed yearly**; measure, **% of incidents reviewed within 10 days, target 100%, monthly**." },
        ],
        onEnter: () => { shutPage("LI-Q fixed questions"); cit81("F Evidence ref", "A.5.26", 9)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => cit81("F Evidence ref", "A.5.26", 9)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose that file in F and that next action in G, in the A.5.26 row. Next unlocks once both are in.",
        getEl: () => cit81("F Evidence ref", "A.5.26", 9)?.closest("tr") ?? null,
        pointAt: () => cit81("F Evidence ref", "A.5.26", 9),
        nextWhen: () => (cit81("F Evidence ref", "A.5.26", 9)?.value ?? "").endsWith("_T8.1_LI-A.5.26-01_v1.xlsx") && /^Next: Group playbooks.*within 10 days/.test(cit81("G Gap / next action", "A.5.26", 9)?.value ?? ""),
        doIt: "Fill the A.5.26 row",
      },
      {
        title: "Now the other four",
        icon: "edit",
        body: "The same for each: read its sub-task 01 on its LI task page and what SPR-08 observed, then its level in column E.",
        tips: [{ kind: "avoid", text: "a move to the Group's way for a control that is at Level 3 already. Its next step closes the gap at the office." }],
        getEl: () => $(citSel(8)),
      },
      checkRowsCard("Once all five rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T8.1 step 10: the unreported e-mail, answered from what A.6.8 requires; no part 2.
    "T8.1-10": askOnlyFromPage(10, "which control's evidence is weak when staff saw a suspicious e-mail and did not report it.", "LI-A.6.8", "Read **What it requires** in the note: what A.6.8 asks of the office and of its staff. Then hold each of the three options against it."),

    // T8.1 step 11: IR-TTX and CIT-S8 named and handed in, in its row (the evidence packs went in at step 8).
    "T8.1-11": [
      {
        title: "The files you hand in",
        icon: "file",
        body: "Your two files: **IR-TTX**, the tabletop exercise record with its sheet Notification, and **CIT-S8**, your tracker for sprint 8. This step saves them in **02_Working** under their own names and submits them.",
        getEl: () => $('#act-11 [data-guide="jobs"]') ?? $('#act-11 [data-guide="file-name"]')?.parentElement ?? null,
      },
      ...(() => {
        const [name, submit] = nameAndSubmit("docx", "1 to 10");
        const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-11 [data-guide="file-name"]')[i] ?? null;
        const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
        return [
          { ...name, title: "Name the file", body: "Type the first file's name, for **IR-TTX**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the IR-TTX file name" },
          { ...name, title: "Name the second file", body: "The same for **CIT-S8**, in the second box. It ends with .xlsx.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S8 file name" },
          submit,
        ];
      })(),
      { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-11 [data-guide="step-complete"]') },
    ],
  } satisfies Record<string, TourStep[]>);
}

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
 * What else a step's "complete" or "Submit" card must say, derived from labs.ts and inbox.ts so it cannot drift: the task's Tech
 * Lab(s) on the card that submits, and the Inbox message on the step that waits for its reply (and on the step it arrives at).
 */
function withRequired(key: string, g: TourStep[]): TourStep[] {
  const m = key.match(/^([A-Z]\d+\.\d+)-(\d+)/);
  if (!m) return g;
  const [, task, ns] = m, n = Number(ns);
  const add: string[] = [];
  const names = LABS.filter((l) => l.task === task).map((l) => l.tool.split("|")[1].replace(" (business SaaS)", ""));
  if (names.length && g.some((c) => c.title === "Save it to 02_Working" || /Save to 02_Working opens/.test(c.body ?? "")))
    add.push(`**Submit task** also needs the Tech Lab${names.length > 1 ? "s" : ""} ${names.join(" and ")} (Systems on the toolbar) completed with the findings recorded.`);
  for (const [id, at] of Object.entries(INJ_AT)) {
    if (id.split("-")[0] !== task) continue;
    const hold = id === "F1.1-J2" ? at : STEP_GUIDES[`${task}-${at + 1}`] || STEP_GUIDES[`${task}-${at + 1}q`] ? at + 1 : at;
    if (n === hold) add.push(`**Mark step complete** also needs your reply to the message ${id} in the Inbox.`);
    else if (n === at) add.push(`A message (${id}) arrives in the Inbox at this step. Reply to it before you complete step ${hold}.`);
  }
  if (!add.length) return g;
  const i = g.map((c) => /Mark step complete|Save to 02_Working opens/.test(c.body ?? "")).lastIndexOf(true);
  const note = add.join(" ");
  return i >= 0 ? g.map((c, j) => (j === i ? { ...c, body: `${c.body} ${note}` } : c)) : [...g, { title: "Before you finish", icon: "check", body: note, getEl: () => $(`#act-${n} [data-guide="step-complete"]`) }];
}

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
    g.splice(0, g.length, ...withRequired(key, g));
    const job = { kind: "note" as const, text: `Your job in this step: ${step.t.replace(/[.…]+$/, "")}. It is done when: ${step.o.replace(/\.$/, "")}.` };
    g[0] = { ...g[0], tips: [job, ...(g[0].tips ?? [])] };
    BRIEFED.set(key, g);
  }
  return BRIEFED.get(key);
}

/** T7.1's guides (registers.ts "T7.1" ACC-RULES, "T7.1 CIT" CIT-S6, "T7.1 PACK"). Hoisted like t122Guides. The tracker's rows
 *  are found by control (the earlier sprints' rows come first, and grow as sprints are added); ACC-02 is ACC-RULES row 2;
 *  LI-A.5.16-01 … LI-A.5.18-03 are the pack's rows 1–6. */
function t71Guides(): Record<string, TourStep[]> {
  const ACCR = '[data-guide="register"][data-reg="ACC-RULES"]';
  const accCell = (col: string, row: number) => $(`${ACCR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
  const LVL = "Access level (least privilege)", APR = "Approved by (SITL-POL-006 Section 6.1)", MORE = "More than the job needs?";
  const row = (c: string) => (regOf("T7.1", 3)?.rows.findIndex((r) => r[1] === c) ?? -1) + 1;
  const cit = (col: string, c: string) => sprintCell(6, col, row(c));
  const at = (sec: string) => $(`${docWindow("SITL-POL-006")} section[data-sec="${sec}"]`);
  return {
    // T7.1 step 1: ACC-RULES, level · approver · mark per line. One line worked: ACC-02, the CRM's team leader.
    "T7.1-1": [
      {
        title: "The access rules matrix",
        icon: "table",
        body: "This is template **T-LI-ACC**: one line for each role on each of the three systems in dataset SPR-06. Each line gives what the role does (the role list) and the access it holds today (the account extract). You choose the access level, who approves it, and whether it holds more than it needs.",
        getEl: () => $(ACCR),
      },
      {
        title: "How to decide a line",
        icon: "book",
        body: "The note on the right gives the three choices and where each is read: SITL-POL-006 Section 3.1 for the level, Section 6.1 for the approver.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openDoc("SITL-POL-006", "Then click **Section 6.1** in the bar at the top of the window."),
      {
        title: "Section 6.1",
        icon: "search",
        body: "Step 2 of the access request procedure says who approves a request: **line manager, then asset owner**. Section 3.1, above it, says access is given on **least privilege and need-to-know**.",
        onEnter: () => at("6.1")?.scrollIntoView({ block: "start" }),
        getEl: () => at("6.1") ?? $(docWindow("SITL-POL-006")),
      },
      {
        title: "One line, worked",
        icon: "help",
        body: "Take **ACC-02**, the team leader on the CRM.",
        steps: [
          { lead: "Level", text: "The role moves tickets between the team's agents and follows the team's queue and reports: **Team lead: reassign tickets, see team reports**. Settings and accounts are the CRM administrator's work." },
          { lead: "Approver", text: "Reports to the Operations manager; the CRM's asset owner is the Chief Delivery Officer: **Operations manager, then the Chief Delivery Officer**." },
          { lead: "More than it needs?", text: "It holds Administrator today: **Yes**." },
        ],
        onEnter: () => { shutDoc("SITL-POL-006"); accCell(LVL, 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => accCell(LVL, 2)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose those three in the ACC-02 line. Next unlocks once all three are in.",
        tips: [REOPEN],
        getEl: () => accCell(LVL, 2)?.closest("tr") ?? null,
        pointAt: () => accCell(LVL, 2),
        nextWhen: () => (accCell(LVL, 2)?.value ?? "").startsWith("Team lead") && accCell(APR, 2)?.value === "Operations manager, then the Chief Delivery Officer" && (accCell(MORE, 2)?.value ?? "").startsWith("Yes"),
        doIt: "Fill the ACC-02 line",
      },
      {
        title: "Now the other eleven",
        icon: "edit",
        body: "For each line: the least level the role's work needs, its line manager then the system's asset owner, and whether what it holds today goes beyond that level.",
        tips: [
          { kind: "avoid", text: "giving a role a level for work another role does. Read the role's own duties." },
          { kind: "note", text: "An administrator's work needs administrator access: holding it is not more than the job needs." },
        ],
        getEl: () => $(ACCR),
      },
      checkRowsCard("Once every line is filled, click **Check my answers**. It shows each line's answer and why. Your lines lock then, so look them over first."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T7.1 step 2: the tracker located, the LI task pages and SPR-06 read; three click-the-cell questions.
    "T7.1-2": [
      {
        title: "The tracker",
        icon: "table",
        body: "This is your control implementation tracker, **T-LI-CIT**. Its first row is the LearnTech Educational Solutions worked example; the earlier sprints' rows follow, read-only, and this sprint's four controls, A.5.15 to A.5.18, are at the bottom.",
        getEl: () => $(citSel(6)),
      },
      {
        title: "Three things to find",
        icon: "help",
        body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
        getEl: () => $('[data-guide="study"]'),
      },
      {
        title: "Find the first one",
        icon: "edit",
        body: "Which maturity level does the worked row give? Read column **E** and click it.",
        onEnter: () => sprintStudy(6, "E Maturity level", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => sprintStudy(6, "E Maturity level", "A.8.13")?.closest("tr") ?? null,
        pointAt: () => sprintStudy(6, "E Maturity level", "A.8.13"),
        nextWhen: () => !!$('[data-guide="study"] [data-found="E"]'),
        doIt: "Click the worked row's level",
      },
      ...openPage("LI-A.5.15", "It opens beside the tracker."),
      {
        title: "An LI task page",
        icon: "book",
        body: "Every sprint control has one, LI-A.5.15 to LI-A.5.18. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
        tips: [{ kind: "note", text: "Stuck on a control? **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
        getEl: () => $(pageWindow("LI-A.5.15")),
      },
      {
        title: "Now the other two",
        icon: "check",
        body: "Answer the other two the same way. Both need your four rows: what each control requires, and the LI task pages.",
        tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
        onEnter: () => shutPage("LI-A.5.15"),
        getEl: () => $('[data-guide="study"]'),
      },
      finish("**Mark step complete** unlocks once all three are found."),
    ],

    // T7.1 step 3: column D, the status of the four controls. One row worked: A.5.15.
    "T7.1-3": [
      {
        title: "Four controls to rate",
        icon: "table",
        body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-06). Then choose its status in column **D**.",
        getEl: () => $(citSel(6)),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right gives the rule: every requirement met, some, or none.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.15 Access control**.",
        steps: [
          { lead: "Requirement 1", text: "A policy on least privilege and need-to-know, with the asset owner's approval: met. SITL-POL-006 applies at Manila." },
          { lead: "Requirements 2 and 3", text: "Rules per system, and applied: not met. Manila has set no access rules, and new starters get a colleague's access." },
          { lead: "Status", text: "Some met: **Partially implemented**." },
        ],
        onEnter: () => cit("D Status", "A.5.15")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => cit("D Status", "A.5.15")?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Partially implemented** in the A.5.15 row. Next unlocks once it is chosen.",
        getEl: () => cit("D Status", "A.5.15")?.closest("tr") ?? null,
        pointAt: () => cit("D Status", "A.5.15"),
        nextWhen: () => cit("D Status", "A.5.15")?.value === "Partially implemented",
        doIt: "Choose the status of A.5.15",
      },
      {
        title: "Now the other three",
        icon: "edit",
        body: "Do the same for each control: each requirement in turn, against what was observed.",
        tips: [
          { kind: "avoid", text: "rating one control on a fact its own observation does not give. Each row's Observed cell says what to rate it on." },
          { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
        ],
        getEl: () => $(citSel(6)),
      },
      checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T7.1 step 4: column E, the level of the four controls. One row worked: A.5.18.
    "T7.1-4": [
      {
        title: "A level per control",
        icon: "table",
        body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
        getEl: () => $(citSel(6)),
      },
      {
        title: "The questions",
        icon: "book",
        body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage(MM, "It opens beside the tracker."),
      {
        title: "What each level looks like",
        icon: "search",
        body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
        getEl: () => $(pageWindow(MM)),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.18 Access rights**.",
        steps: [
          { lead: "Question 1", text: "A documented, approved way, with records? No: Manila grants access on an e-mail to the administrator, keeps no approvals and no review records, and does not yet apply SITL-POL-006 Section 6." },
          { lead: "Level", text: "Stop at the first No: **Level 1 Initial**." },
        ],
        onEnter: () => { shutPage(MM); cit("E Maturity level", "A.5.18")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => cit("E Maturity level", "A.5.18")?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Level 1 Initial** in the A.5.18 row. Next unlocks once it is chosen.",
        getEl: () => cit("E Maturity level", "A.5.18")?.closest("tr") ?? null,
        pointAt: () => cit("E Maturity level", "A.5.18"),
        nextWhen: () => cit("E Maturity level", "A.5.18")?.value === "Level 1 Initial",
        doIt: "Choose the level of A.5.18",
      },
      {
        title: "Now the other three",
        icon: "edit",
        body: "Do the same for each control: the questions in order, against what is in place at the office.",
        tips: [{ kind: "note", text: "Status and level are separate questions. A control with gaps can still be done the Group's way, in every office, reviewed each year." }],
        getEl: () => $(citSel(6)),
      },
      checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T7.1 step 5: the evidence packs of A.5.16 and A.5.18. One row worked: LI-A.5.18-01, the access rules.
    "T7.1-5": [
      {
        title: "The evidence packs",
        icon: "table",
        body: "Every sub-task of **LI-A.5.16** and **LI-A.5.18**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
        getEl: () => $(PACKR),
      },
      {
        title: "Three kinds of answer",
        icon: "book",
        body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage("LI-A.5.18", "It opens beside the sheet."),
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **LI-A.5.18-01**.",
        steps: [
          { lead: "Evidence item", text: "The access rules requests are approved against." },
          { lead: "Already in 02_Working?", text: "Yes: your ACC-RULES of step 1 sets, per system, what each role may be granted and who approves it." },
          { lead: "Record", text: "**M2610-00001_T7.1_ACC-RULES_v1.xlsx**. Its gap fills with a dash by itself." },
        ],
        onEnter: () => { shutPage("LI-A.5.18"); packCell(EVREF, 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => packCell(EVREF, 4)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose your ACC-RULES file in row LI-A.5.18-01. Next unlocks once it is chosen.",
        getEl: () => packCell(EVREF, 4)?.closest("tr") ?? null,
        pointAt: () => packCell(EVREF, 4),
        nextWhen: () => (packCell(EVREF, 4)?.value ?? "").endsWith("_T7.1_ACC-RULES_v1.xlsx"),
        doIt: "Fill row LI-A.5.18-01",
      },
      {
        title: "Now the other five",
        icon: "edit",
        body: "For each sub-task, hold its evidence item against your files and against what SPR-06 holds (the Observed column, or the dataset on the step's Reference tab: the account extract, the joiner and leaver records, the last access review).",
        tips: [
          { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
          { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
        ],
        getEl: () => $(PACKR),
      },
      checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
      {
        title: "Save the packs to 02_Working",
        icon: "upload",
        body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
        getEl: () => $('[data-guide="submit"]'),
      },
      finish("With the receipt in, click **Mark step complete**."),
    ],

    // T7.1 step 6: sub-task 01 and the next action of A.5.15 and A.5.17. One row worked: A.5.15.
    "T7.1-6": [
      {
        title: "Two controls, first evidence",
        icon: "table",
        body: "For **A.5.15** and **A.5.17**: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action to Level 3 and the Level 4 measure.",
        getEl: () => $(citSel(6)),
      },
      {
        title: "How to choose",
        icon: "book",
        body: "The note on the right gives the order for F, as in step 5, and what G needs: the step to Level 3 where the control is below it, and a measure with a target (LI-Q2).",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
      {
        title: "LI-Q2",
        icon: "search",
        body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
        getEl: () => $(pageWindow("LI-Q fixed questions")),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.5.15 Access control**.",
        steps: [
          { lead: "F", text: "Sub-task 01 asks for the access rules matrix by system and role: your **ACC-RULES**, M2610-00001_T7.1_ACC-RULES_v1.xlsx." },
          { lead: "G", text: "Your step 4 put it at Level 3 already, so no step to Level 3: **Already Level 3. Gap: asset owners approve ACC-RULES**, the status gap; measure, **% of accounts matching ACC-RULES at review, target 100%, quarterly**." },
        ],
        onEnter: () => { shutPage("LI-Q fixed questions"); cit("F Evidence ref", "A.5.15")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => cit("F Evidence ref", "A.5.15")?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose that file in F and that line in G, in the A.5.15 row. Next unlocks once both are in.",
        getEl: () => cit("F Evidence ref", "A.5.15")?.closest("tr") ?? null,
        pointAt: () => cit("F Evidence ref", "A.5.15"),
        nextWhen: () => (cit("F Evidence ref", "A.5.15")?.value ?? "").endsWith("_T7.1_ACC-RULES_v1.xlsx") && (cit("G Gap / next action", "A.5.15")?.value ?? "").startsWith("Already Level 3. Gap") && (cit("G Gap / next action", "A.5.15")?.value ?? "").includes("% of accounts matching"),
        doIt: "Fill the A.5.15 row",
      },
      {
        title: "Now A.5.17",
        icon: "edit",
        body: "The same for A.5.17: read its sub-task 01 on LI-A.5.17 and what SPR-06 observed, then its level from step 4 and its status from step 3.",
        tips: [{ kind: "avoid", text: "a step to the Group's way for a control that is already done the Group's way." }],
        getEl: () => $(citSel(6)),
      },
      checkRowsCard("Once both rows are in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T7.1 step 7: the leaver's WFM account, answered from SITL-POL-006 Section 6.3; no part 2.
    "T7.1-7": askOnlyFromDoc(7, "what you record for A.5.18 when a leaver's account is still active three days after termination.", "SITL-POL-006", "6.3", "Read **Section 6.3**, the leaver procedure, step by step: how fast every account of a leaver is disabled, how often HR's leavers are reconciled with the accounts, and what is raised for an account used after termination. Then hold each of the three options against it."),

    // T7.1 step 8: the shared support account, answered from what A.5.16 requires; no part 2.
    "T7.1-8": askOnlyFromPage(8, "what A.5.16 allows when five support agents share one account.", "LI-A.5.16", "Read **What it requires** in the note, all three items, and the second one closely: when a shared identity is allowed, and what the Group's policy adds. Then hold each of the three options against it."),

    // T7.1 step 9: ACC-RULES and CIT-S6 named and handed in, in its row (the evidence packs went in at step 5).
    "T7.1-9": [
      {
        title: "The files you hand in",
        icon: "file",
        body: "Your two files: **ACC-RULES**, the access rules matrix, and **CIT-S6**, your tracker for sprint 6. This step saves them in **02_Working** under their own names and submits them.",
        getEl: () => $('#act-9 [data-guide="jobs"]') ?? $('#act-9 [data-guide="file-name"]')?.parentElement ?? null,
      },
      ...(() => {
        const [name, submit] = nameAndSubmit("xlsx", "1 to 8");
        const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-9 [data-guide="file-name"]')[i] ?? null;
        const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
        return [
          { ...name, title: "Name the file", body: "Type the first file's name, for **ACC-RULES**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the ACC-RULES file name" },
          { ...name, title: "Name the second file", body: "The same for **CIT-S6**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the CIT-S6 file name" },
          submit,
        ];
      })(),
      { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-9 [data-guide="step-complete"]') },
    ],
  };
}

/** T10.2's guides (registers.ts "T10.2 SAMPLE" CHG-SAMPLE, "T10.2" CHG-TEST, "T10.2 SDLC" SDLC-MAP, "T10.2 CIT" CIT-S13, "T10.2 PACK").
 *  Hoisted like t122Guides. CHG-TEST's rows are the 25 sampled RFCs in RFC order (RFC-4106 is row 3), then the conclusion;
 *  SDLC-MAP's rows are A.8.26 … A.8.33 (A.8.27 is row 2); the tracker's rows are found by control (worked row 1, then every
 *  sprint's controls up to sprint 13, in sprint order); LI-A.8.28-01 … LI-A.8.32-03 are the pack's rows 1–6. */
function t102Guides(): Record<string, TourStep[]> {
  const SAMPLER = '[data-guide="register"][data-reg="CHG-SAMPLE"]';
  const CTR = '[data-guide="register"][data-reg="CHG-TEST"]';
  const SDLCR = '[data-guide="register"][data-reg="SDLC-MAP"]';
  const sampleCell = (row: number) => $(`${SAMPLER} [aria-label="Value, row ${row}"]`) as HTMLSelectElement | null;
  const ctCell = (col: string, row: number) => $(`${CTR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
  const sdlcCell = (col: string, row: number) => $(`${SDLCR} [aria-label="${col}, row ${row}"]`) as HTMLSelectElement | null;
  const row13 = (c: string) => [...SPRINTS].sort((a, b) => a.n - b.n).filter((x) => x.n <= 13).flatMap((x) => x.controls).indexOf(c) + 2;
  const s13 = (col: string, c: string) => sprintCell(13, col, row13(c));
  const s13row = (c: string) => s13("D Status", c)?.closest("tr") ?? s13("E Maturity level", c)?.closest("tr") ?? s13("F Evidence ref", c)?.closest("tr") ?? null;
  const S = "Ref-Sampling";
  return {
    // T10.2 step 1: sheet Sample of CHG-TEST, rule R15. One row worked: the population, 64.
    "T10.2-1": [
      {
        title: "Sheet Sample",
        icon: "table",
        body: "This is sheet **Sample** of **CHG-TEST**, template **T-CT**. Before you test any change, you decide how many to test, by rule **R15**: the Ref-Sampling row that fits, the population and the minimum sample. The seed of the draw is recorded for you.",
        getEl: () => $(SAMPLER),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right gives rule R15: a recurring control is sampled by how often it runs, a population of records by its size.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage(S, "It opens beside the sheet."),
      {
        title: "The sampling table",
        icon: "search",
        body: "One row per kind of population. The **frequency** rows (Annual … Daily) are for testing how often a control ran; the last two are for testing the **records** it acted on, by how many there are.",
        getEl: () => $(pageWindow(S)),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **Population: RFCs in the export**.",
        steps: [
          { lead: "Read", text: "Dataset **CT-B**, the change-ticket export (on the step's Reference tab): its rows run from RFC-4101 to RFC-4164." },
          { lead: "Record", text: "Every change made in the period is the population: **64**." },
        ],
        onEnter: () => { shutPage(S); sampleCell(2)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => sampleCell(2)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **64** in the Population row. Next unlocks once it is chosen.",
        getEl: () => sampleCell(2)?.closest("tr") ?? null,
        pointAt: () => sampleCell(2),
        nextWhen: () => sampleCell(2)?.value === "64",
        doIt: "Choose the population",
      },
      {
        title: "Now the other two",
        icon: "edit",
        body: "Which Ref-Sampling row fits? You test the RFCs themselves, not how often a meeting was held. Then read that row's minimum sample.",
        tips: [{ kind: "avoid", text: "a frequency row. The CAB meets weekly, but what you test is each change's record." }],
        getEl: () => $(SAMPLER),
      },
      checkRowsCard("Once all three are in, click **Check my answers**. It shows each row's answer and why. The seed row is the draw's, already recorded."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T10.2 step 2: the 25 sampled changes against the script, R26, then R19. One row worked: RFC-4106.
    "T10.2-2": [
      {
        title: "The change sample test",
        icon: "table",
        body: "The 25 changes the draw picked, one per row, each with what its RFC records for the script's four attributes, **A1** to **A4**. For each, choose **Pass** or **Deviation**, and rate a deviation. The last row is your conclusion.",
        getEl: () => $(CTR),
      },
      {
        title: "The rules",
        icon: "book",
        body: "The note on the right gives the script, rule **R26** for the rating and rule **R19** for the conclusion.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openDoc("SITL-POL-009", "Then click **Section 6.1** in the bar at the top of the window."),
      {
        title: "What the procedure sets",
        icon: "search",
        body: "Section 6.1, the change procedure: approval by the CAB **before** the change (step 3), test evidence and a rollback plan covering every component (step 2), a review within **5 working days** (step 5), and the emergency path, **E1** and **E2**.",
        onEnter: () => $(`${docWindow("SITL-POL-009")} section[data-sec="6.1"]`)?.scrollIntoView({ block: "start" }),
        getEl: () => $(`${docWindow("SITL-POL-009")} section[data-sec="6.1"]`) ?? $(docWindow("SITL-POL-009")),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **RFC-4106**.",
        steps: [
          { lead: "A1", text: "Implemented on 7 October; the CAB approved it on 13 October. Approved after, not before: **Deviation**." },
          { lead: "Rating (R26)", text: "It affects client transaction data, a Mission Critical asset in SITL-ADD-16 Section 8.1. R26 checks High first: **High**." },
        ],
        onEnter: () => { shutDoc("SITL-POL-009"); ctCell("Result", 3)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => ctCell("Result", 3)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Deviation**, then **High**, in the RFC-4106 row. Next unlocks once both are in.",
        tips: [REOPEN],
        getEl: () => ctCell("Result", 3)?.closest("tr") ?? null,
        pointAt: () => (ctCell("Result", 3)?.value === "Deviation" ? ctCell("Rating (R26)", 3) : ctCell("Result", 3)),
        nextWhen: () => ctCell("Result", 3)?.value === "Deviation" && ctCell("Rating (R26)", 3)?.value === "High",
        doIt: "Fill the RFC-4106 row",
      },
      {
        title: "Now the other 24",
        icon: "edit",
        body: "Hold each RFC against all four attributes. A change that passes needs no rating: it fills itself.",
        tips: [
          { kind: "note", text: "An emergency change is approved by the emergency approver before it is made, and by the CAB within 2 working days (E1, E2)." },
          { kind: "avoid", text: "rating a change High only because it touches a Mission Critical asset. It must fail an attribute first." },
        ],
        getEl: () => $(CTR),
      },
      {
        title: "The conclusion",
        icon: "check",
        body: "On the last row, **Conclusion (R19)**, choose what your results add up to, by rule R19 in the note.",
        onEnter: () => ctCell("Result", 26)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => ctCell("Result", 26)?.closest("tr") ?? $(CTR),
      },
      checkRowsCard("Once every row has its result, click **Check my answers**. Result and rating are checked together; it shows each row's answer and why."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T10.2 step 3: SDLC-MAP, the stage and the gate of seven controls. One row worked: A.8.27.
    "T10.2-3": [
      {
        title: "The gate map",
        icon: "table",
        body: "This is **SDLC-MAP**, template **T-LI-SDLC**: seven controls, each with what it asks of the pipeline. For each, choose the **stage** of the customer portal's pipeline where it is applied, and whether the **gate** there does what it asks.",
        getEl: () => $(SDLCR),
      },
      {
        title: "Where to read it",
        icon: "book",
        body: "Dataset **SDLC** (on the step's Reference tab) describes each stage: what happens, the record it leaves, who does it. The note on the right says how to judge the gate.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.8.27**: each design change reviewed against the engineering principles before it is built.",
        steps: [
          { lead: "Stage", text: "Dataset SDLC, **2 Design review**: a design change that alters a data flow or an integration is reviewed against the portal team's engineering principles before it is built." },
          { lead: "Gate", text: "It does all the control asks, and leaves a signed record: **Yes**." },
        ],
        onEnter: () => sdlcCell("Pipeline stage", 2)?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => sdlcCell("Pipeline stage", 2)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **2 Design review** and **Yes** in the A.8.27 row. Next unlocks once both are in.",
        getEl: () => sdlcCell("Pipeline stage", 2)?.closest("tr") ?? null,
        pointAt: () => (sdlcCell("Pipeline stage", 2)?.value ? sdlcCell("Gate in place?", 2) : sdlcCell("Pipeline stage", 2)),
        nextWhen: () => sdlcCell("Pipeline stage", 2)?.value === "2 Design review" && (sdlcCell("Gate in place?", 2)?.value ?? "").startsWith("Yes"),
        doIt: "Fill the A.8.27 row",
      },
      {
        title: "Now the other six",
        icon: "edit",
        body: "For each control, find the stage whose work matches what it asks, then read what that stage really does, sentence by sentence.",
        tips: [
          { kind: "avoid", text: "Yes where the stage can be skipped or leaves no reason on record. Not every time is Partly." },
          { kind: "note", text: "Environments are not a single stage: the last row of the dataset covers every stage." },
        ],
        getEl: () => $(SDLCR),
      },
      checkRowsCard("Once every row is in, click **Check my answers**. Stage and gate are checked together; it shows each row's answer and why."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T10.2 step 4: the tracker located, the LI task pages and SPR-13 read; three click-the-cell questions.
    "T10.2-4": [
      {
        title: "The tracker",
        icon: "table",
        body: "Your control implementation tracker, **T-LI-CIT**, for sprint 13: A.8.25 to A.8.34, the last of the thirteen sprints. Its first row is the LearnTech Educational Solutions worked example; the earlier sprints' rows stand as you left them.",
        getEl: () => $(citSel(13)),
      },
      {
        title: "Three things to find",
        icon: "help",
        body: "Each question on the right asks for one cell of the tracker. Answer it by clicking the cell.",
        getEl: () => $('[data-guide="study"]'),
      },
      {
        title: "Find the first one",
        icon: "edit",
        body: "Which file does the worked row give as its evidence? Read column **F** and click it.",
        onEnter: () => sprintStudy(13, "F Evidence ref", "A.8.13")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => sprintStudy(13, "F Evidence ref", "A.8.13")?.closest("tr") ?? null,
        pointAt: () => sprintStudy(13, "F Evidence ref", "A.8.13"),
        nextWhen: () => !!$('[data-guide="study"] [data-found="F"]'),
        doIt: "Click the worked row's evidence ref",
      },
      ...openPage("LI-A.8.33", "It opens beside the tracker."),
      {
        title: "An LI task page",
        icon: "book",
        body: "Every sprint control has one, LI-A.8.25 to LI-A.8.34. The note gives the control's owner, **what it requires** (numbered) and its evidence focus; the table lists its sub-tasks, each with the evidence item it produces.",
        tips: [{ kind: "note", text: "Stuck on a control? The page **LI-Q fixed questions**, in the same list, gives the eight questions to ask of it." }],
        getEl: () => $(pageWindow("LI-A.8.33")),
      },
      {
        title: "Now the other two",
        icon: "check",
        body: "Answer the other two questions the same way. The third needs the LI task pages: read each one's requirements.",
        tips: [{ kind: "unsure", text: "A wrong cell turns amber and the question gives a hint." }],
        onEnter: () => shutPage("LI-A.8.33"),
        getEl: () => $('[data-guide="study"]'),
      },
      finish("**Mark step complete** unlocks once all three are found."),
    ],

    // T10.2 step 5: column D, the status of the ten controls. One row worked: A.8.31.
    "T10.2-5": [
      {
        title: "Ten controls to rate",
        icon: "table",
        body: "For each sprint control, read what it requires and what was observed at Manila (dataset SPR-13). Then choose its status in column **D**.",
        getEl: () => $(citSel(13)),
      },
      {
        title: "How to decide",
        icon: "book",
        body: "The note on the right gives the rule: every requirement met, some, or none. One control is excluded in your LI-SOA (T5.2): its status is the SoA's.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.8.31 Separation of development, test and production environments**.",
        steps: [
          { lead: "Requirement 1", text: "Separate environments: met. Development, QA and production each have a cloud account of their own." },
          { lead: "Requirements 2 and 3", text: "No standing developer access to production, separate accounts: not met. The nine developers can write to the production database with their development accounts." },
          { lead: "Status", text: "Some met: **Partially implemented**." },
        ],
        onEnter: () => s13("D Status", "A.8.31")?.scrollIntoView({ block: "nearest", inline: "nearest" }),
        getEl: () => s13row("A.8.31"),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Partially implemented** in the A.8.31 row. Next unlocks once it is chosen.",
        getEl: () => s13row("A.8.31"),
        pointAt: () => s13("D Status", "A.8.31"),
        nextWhen: () => s13("D Status", "A.8.31")?.value === "Partially implemented",
        doIt: "Choose the status of A.8.31",
      },
      {
        title: "Now the other nine",
        icon: "edit",
        body: "Do the same for each control: each requirement in turn, against what was observed.",
        tips: [
          { kind: "avoid", text: "Not implemented for a control the SoA excludes. Not implemented says a needed control is missing." },
          { kind: "note", text: "Each control's LI task page (Learn › Reference pages) names its ISO/IEC 27002:2022 guidance section." },
        ],
        getEl: () => $(citSel(13)),
      },
      checkRowsCard("Once every control has a status, click **Check my answers**. It shows each row's answer and why. Your rows lock then, so look them over first."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T10.2 step 6: column E, the level of the ten controls. One row worked: A.8.32.
    "T10.2-6": [
      {
        title: "A level per control",
        icon: "table",
        body: "For each sprint control, read what was observed at Manila, with its status beside it. Then choose its maturity level in column **E**.",
        getEl: () => $(citSel(13)),
      },
      {
        title: "The questions",
        icon: "book",
        body: "The note on the right gives the Maturity Model's three questions. Ask them in order and stop at the first **No**.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage(MM, "It opens beside the tracker."),
      {
        title: "What each level looks like",
        icon: "search",
        body: "One row per level: what you find there, and an example from LearnTech Educational Solutions' Amsterdam office.",
        getEl: () => $(pageWindow(MM)),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.8.32 Change management**.",
        steps: [
          { lead: "Question 1", text: "A documented, approved way, with records? Yes: SITL-POL-009 Section 6.1, and an RFC for every change." },
          { lead: "Question 2", text: "The Group's way, in every office, reviewed yearly? Yes: the Group change procedure, which the Group CIO reviews each year." },
          { lead: "Question 3", text: "Measured against targets? No: nothing is measured." },
          { lead: "Level", text: "Stop at the first No: **Level 3 Defined**. The deviations your CHG-TEST found are its status, not its level." },
        ],
        onEnter: () => { shutPage(MM); s13("E Maturity level", "A.8.32")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => s13row("A.8.32"),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose **Level 3 Defined** in the A.8.32 row. Next unlocks once it is chosen.",
        getEl: () => s13row("A.8.32"),
        pointAt: () => s13("E Maturity level", "A.8.32"),
        nextWhen: () => s13("E Maturity level", "A.8.32")?.value === "Level 3 Defined",
        doIt: "Choose the level of A.8.32",
      },
      {
        title: "Now the other nine",
        icon: "edit",
        body: "Do the same for each control: the questions in order, against what was observed at the office.",
        tips: [
          { kind: "note", text: "Status and level are separate questions. A control can be Partially implemented and still done the Group's way." },
          { kind: "note", text: "A control your LI-SOA excludes is not rated." },
        ],
        getEl: () => $(citSel(13)),
      },
      checkRowsCard("Once every control has a level, click **Check my answers**. Each level is checked exactly: a wrong one shows the key's level and why. Your rows lock then."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T10.2 step 7: the evidence packs of A.8.28 and A.8.32. One row worked: LI-A.8.32-01, CHG-TEST.
    "T10.2-7": [
      {
        title: "The evidence packs",
        icon: "table",
        body: "Every sub-task of **LI-A.8.28** and **LI-A.8.32**, one per row, with the evidence item it produces. For each, choose the file in 02_Working that holds the item, or None.",
        getEl: () => $(PACKR),
      },
      {
        title: "Three kinds of answer",
        icon: "book",
        body: "The note on the right gives the order: a file you already handed in, else the item's own new file prepared from the dataset, else None with the gap written.",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage("LI-A.8.32", "It opens beside the sheet."),
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **LI-A.8.32-01**.",
        steps: [
          { lead: "Evidence item", text: "A change sample test with each deviation rated." },
          { lead: "Already handed in?", text: "Yes: your CHG-TEST of steps 1 and 2 is that test." },
          { lead: "Record", text: "**M2610-00001_T10.2_CHG-TEST_v1.xlsx**. Its gap fills with a dash by itself." },
        ],
        onEnter: () => { shutPage("LI-A.8.32"); packCell(EVREF, 4)?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => packCell(EVREF, 4)?.closest("tr") ?? null,
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose your CHG-TEST file in row LI-A.8.32-01. Next unlocks once it is chosen.",
        getEl: () => packCell(EVREF, 4)?.closest("tr") ?? null,
        pointAt: () => packCell(EVREF, 4),
        nextWhen: () => (packCell(EVREF, 4)?.value ?? "").endsWith("_T10.2_CHG-TEST_v1.xlsx"),
        doIt: "Fill row LI-A.8.32-01",
      },
      {
        title: "Now the other five",
        icon: "edit",
        body: "For each sub-task, hold its evidence item against your files and against what SPR-13 and dataset SDLC hold (the sheet's Observed column, and the step's Reference tab).",
        tips: [
          { kind: "note", text: "Choose None where nothing at the office shows it, then write the gap and the next action, with its owner. It is format-checked and kept with your hand-in." },
          { kind: "avoid", text: "a new file where the dataset holds no record to prepare it from." },
        ],
        getEl: () => $(PACKR),
      },
      checkRowsCard("Once every row has its ref and every None its gap, click **Check my answers**. It shows each row's answer and why. If a ref turns out to be None, write its gap then."),
      {
        title: "Save the packs to 02_Working",
        icon: "upload",
        body: "Click **Save to 02_Working**: the evidence packs are handed in on the platform, and the receipt shows a hash and a UTC time.",
        getEl: () => $('[data-guide="submit"]'),
      },
      finish("With the receipt in, click **Mark step complete**."),
    ],

    // T10.2 step 8: sub-task 01 and the next action of the eight other controls. One row worked: A.8.25.
    "T10.2-8": [
      {
        title: "Eight controls, first evidence",
        icon: "table",
        body: "For the eight controls that are not deep dives: in column **F** the file of sub-task 01, their first evidence item; in column **G** the next action at the control's level and the Level 4 measure.",
        getEl: () => $(citSel(13)),
      },
      {
        title: "How to choose",
        icon: "book",
        body: "The note on the right gives the order for F, as in step 7, and what G needs: the step to Level 3, or closing the gap of a control already there, and a measure with a target (LI-Q2).",
        getEl: () => $('[data-guide="step-note"]'),
      },
      ...openPage("LI-Q fixed questions", "It opens beside the tracker."),
      {
        title: "LI-Q2",
        icon: "search",
        body: "**LI-Q2**: a Level 4 measure names what is counted, the target and how often it is reported. A review held on time is not a measure.",
        getEl: () => $(pageWindow("LI-Q fixed questions")),
      },
      {
        title: "One row, worked",
        icon: "help",
        body: "Take **A.8.25 Secure development life cycle**.",
        steps: [
          { lead: "F", text: "Sub-task 01 asks for a gate map of the life cycle: your SDLC-MAP of step 3, **M2610-00001_T10.2_SDLC-MAP_v1.xlsx**." },
          { lead: "G", text: "Implemented at Level 3, the Group's way: next, **keep the Group life cycle and log each gate result**; measure, **% of releases passing every gate first time, target 90%, each quarter**." },
        ],
        onEnter: () => { shutPage("LI-Q fixed questions"); s13("F Evidence ref", "A.8.25")?.scrollIntoView({ block: "nearest", inline: "nearest" }); },
        getEl: () => s13row("A.8.25"),
      },
      {
        title: "Fill it",
        icon: "edit",
        body: "Choose that file in F and that next action in G, in the A.8.25 row. Next unlocks once both are in.",
        getEl: () => s13row("A.8.25"),
        pointAt: () => ((s13("F Evidence ref", "A.8.25")?.value ?? "").endsWith("_SDLC-MAP_v1.xlsx") ? s13("G Gap / next action", "A.8.25") : s13("F Evidence ref", "A.8.25")),
        nextWhen: () => (s13("F Evidence ref", "A.8.25")?.value ?? "").endsWith("_T10.2_SDLC-MAP_v1.xlsx") && (s13("G Gap / next action", "A.8.25")?.value ?? "").includes("keep the Group life cycle") && (s13("G Gap / next action", "A.8.25")?.value ?? "").includes("passing every gate"),
        doIt: "Fill the A.8.25 row",
      },
      {
        title: "Now the other seven",
        icon: "edit",
        body: "For each, read its sub-task 01 on its LI task page and what SPR-13 observed, then its level in column E.",
        tips: [
          { kind: "avoid", text: "the office's own way for a control at Level 3: it moves it back to Level 2." },
          { kind: "note", text: "A.8.30 is excluded in your LI-SOA: its first evidence is the SoA's entry." },
        ],
        getEl: () => $(citSel(13)),
      },
      checkRowsCard("Once every row is in, click **Check my answers**. F and G are checked together; it shows each row's answer and why."),
      finish("**Mark step complete** unlocks once your answers are checked."),
    ],

    // T10.2 steps 9 and 10: answered from the change procedure and from what the control requires; no part 2.
    "T10.2-9": askOnlyFromDoc(9, "what change management expects of an emergency change applied at 02:00 without approval.", "SITL-POL-009", "6.1", "Read **Section 6.1**, the change procedure, and its emergency rows **E1** and **E2**: who authorises an emergency change, and what happens to it afterwards. Then hold each of the three options against it."),
    "T10.2-10": askOnlyFromPage(10, "which control has the gap when developers can write to the production database.", "LI-A.8.31", "Read **What it requires** in the note: what A.8.31 asks about how changes reach production and who may change it. Then hold each of the three options against it."),

    // T10.2 step 11: CHG-TEST, SDLC-MAP and CIT-S13 named and handed in, in its row.
    "T10.2-11": [
      {
        title: "The files you hand in",
        icon: "file",
        body: "Your three files: **CHG-TEST**, the change sample test; **SDLC-MAP**, the gate map; and **CIT-S13**, your tracker for sprint 13. This step saves them in **02_Working** under their own names and submits them.",
        getEl: () => $('#act-11 [data-guide="jobs"]') ?? $('#act-11 [data-guide="file-name"]')?.parentElement ?? null,
      },
      ...(() => {
        const [name, submit] = nameAndSubmit("xlsx", "1 to 10");
        const box = (i: number) => document.querySelectorAll<HTMLElement>('#act-11 [data-guide="file-name"]')[i] ?? null;
        const ok = (i: number) => { const el = box(i)?.querySelector<HTMLInputElement>('[data-guide="file-name-input"]'); return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true"; };
        return [
          { ...name, title: "Name the file", body: "Type the first file's name, for **CHG-TEST**, in its box.", getEl: () => box(0), pointAt: () => box(0)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, nextWhen: () => ok(0), doIt: "Type the CHG-TEST file name" },
          { ...name, title: "Name the second file", body: "The same for **SDLC-MAP**, in the second box.", steps: undefined, getEl: () => box(1), pointAt: () => box(1)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(1)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1), doIt: "Type the SDLC-MAP file name" },
          { ...name, title: "Name the third file", body: "The same for **CIT-S13**, in the third box.", steps: undefined, getEl: () => box(2), pointAt: () => box(2)?.querySelector<HTMLElement>('[data-guide="file-name-input"]') ?? null, onEnter: () => box(2)?.scrollIntoView({ block: "nearest" }), nextWhen: () => ok(0) && ok(1) && ok(2), doIt: "Type the CIT-S13 file name" },
          submit,
        ];
      })(),
      { title: "Finish here", icon: "check", body: "With the receipt in, click **Mark step complete**. That is the \"Done\" the step asks for.", getEl: () => $('#act-11 [data-guide="step-complete"]') },
    ],
  };
}
