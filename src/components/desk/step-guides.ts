import type { TourStep } from "@/components/app/guided-tour";

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
const firstCell = () => $('[data-guide="rmf-table"] input');
/** The first row's value is in and matches its screen (the row is not flagged). */
const firstRowRight = () => {
  const el = firstCell() as HTMLInputElement | null;
  return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true";
};
const picked = () => !!$('[data-guide="decision"] input[type=radio]:checked');

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

export const STEP_GUIDES: Record<string, TourStep[]> = {
  "F1.1-1": [
    {
      title: "Six values to fill",
      icon: "table",
      body: "Table 1 of READ-ME-FIRST asks for six facts about your assignment. All six are on one platform screen, Home › My Organisation. Open it first.",
      getEl: () => $('[data-guide="rmf-table"]'),
    },
    ...openFromHome("My Organisation", ORG_WINDOW, "Step 1"),
    {
      title: "Where each value is",
      icon: "user",
      body: "Your start date is at the top left, and the task owner of F1.2 is in the task table beside it. Each organisation's name is on its tab, and its home office is on that tab's Overview.",
      getEl: () => $(ORG_WINDOW),
    },
    {
      title: "Fill the first row",
      icon: "edit",
      body: "Type the name on the Org A tab exactly as written. A value that does not match the screen is flagged under its row; Next unlocks once it matches.",
      // The whole cell, so the "not what the screen shows" flag under the box is lit with it.
      getEl: () => firstCell()?.closest("td") ?? null,
      // The window it is copied from stays lit beside the field.
      alsoShow: () => $(ORG_WINDOW),
      // Next unlocks once the first value is in and matches; the mentee moves on when they choose,
      // never pulled away mid-word.
      nextWhen: () => {
        const el = firstCell() as HTMLInputElement | null;
        return !!el?.value.trim() && el.getAttribute("aria-invalid") !== "true";
      },
      doIt: "Type the Org A name in the first row",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Fill the other five rows the same way. This button unlocks once all six are in.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  // A decision, then table 2 of the same file.
  "F1.1-4": [
    {
      title: "Decide first",
      icon: "help",
      body: "Where may a working copy of the customer dataset live? Pick one. When you mark the step complete, you see why each option is right or wrong.",
      getEl: () => $('[data-guide="decision"]'),
      nextWhen: picked,
      doIt: "Pick an option",
    },
    {
      title: "Then four paths",
      icon: "table",
      body: "Table 2 asks for the full path of your four task folders. They are on Home › My Tasks.",
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
      body: "Fill the other three paths the same way. Marking complete locks your decision and shows why each option is right or wrong.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],

  "F1.1-5": [
    {
      title: "Three dates to fill",
      icon: "calendar",
      body: "Table 3 asks for the due dates of F1.2, F1.3 and the knowledge check KC-01. The programme sets them, and they are on Home › My plan.",
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
      title: "Fill the first row",
      icon: "edit",
      body: "Pick the F1.2 due date from the calendar. It is recorded as DD-MMM-YYYY, the format the step asks for. Next unlocks once it matches My plan.",
      getEl: () => firstCell()?.closest("td") ?? null,
      alsoShow: () => $(PLAN_WINDOW),
      nextWhen: firstRowRight,
      doIt: "Pick the F1.2 due date",
    },
    {
      title: "Finish here",
      icon: "check",
      body: "Pick the other two dates the same way. This button unlocks once all three are in.",
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
    {
      title: "Name the file",
      icon: "edit",
      body: "Type the four parts listed under the box, in order, joined by underscores, then .docx.",
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
      body: "Submit hands the file in; it opens once steps 1 to 5 are complete. The receipt shows a hash (a fingerprint of the file) and a UTC time. If either is missing, use Report a problem, at the bottom right.",
      getEl: () => $('[data-guide="submit"]'),
    },
    {
      title: "Finish here",
      icon: "check",
      body: "With the receipt in, mark the step complete. That is the \"Done\" the step asks for.",
      getEl: () => $('[data-guide="mark-complete"]'),
    },
  ],
};
