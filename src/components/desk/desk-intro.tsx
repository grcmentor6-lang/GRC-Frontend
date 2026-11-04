"use client";

import { useCallback, useState } from "react";
import { GuidedTour, markTourSeen, useTourOnce, type TourStep } from "@/components/app/guided-tour";

/** The one on screen: the week panel is hidden below lg, and a hidden target has no hole to cut. */
const shown = (sel: string) => () => {
  const el = document.querySelector<HTMLElement>(sel);
  return el && el.getBoundingClientRect().width > 0 ? el : null;
};

const STEPS: TourStep[] = [
  {
    title: "This is your Working Desk",
    icon: "desk",
    body: "Every piece of GRC 101 is done here: twelve weeks of tasks for the organisations you are placed at. This guide shows you round once and does not come back, so read each card before you click Next.",
    getEl: () => null,
  },
  {
    title: "The twelve weeks",
    icon: "calendar",
    body: "Each week opens on its date, counted from your start date; the dot marks this week. The logos say which organisation the week's work is for. Click a week to read its overview.",
    getEl: shown('nav[aria-label="Weeks"]'),
  },
  {
    title: "This week's tasks",
    icon: "checkSquare",
    body: "The week's tasks, in the order to do them. The ring fills as you complete a task's steps, and the line under it says when it is due. Click a task to open it.",
    getEl: shown('aside[aria-label="This week"]'),
    optional: true,
  },
  {
    title: "Your progress",
    icon: "chart",
    body: "Steps, tasks and weeks completed across the whole programme.",
    getEl: shown('section[aria-labelledby="programme"]'),
    optional: true,
  },
  {
    title: "Where the work happens",
    icon: "layers",
    body: "You are on this week's overview. Open a task and its steps appear here, one after the other. Each step has a guide of its own, which runs the first time you open that step.",
    getEl: shown("main"),
  },
  {
    title: "The platform tools",
    icon: "grid",
    body: "Home, Evidence, Risk, Policies, your Inbox and the rest: the screens the organisation runs on. A tool unlocks when a step needs it, and the step you are on is marked against its tool.",
    getEl: shown('nav[aria-label="Platform tools"]'),
  },
  {
    title: "Start with this week's first task",
    icon: "play",
    body: "Open it from the week's tasks and begin with step 1. The step's own guide takes it from there.",
    getEl: () => null,
  },
];

export const INTRO_KEY = "grc101.guide.desk";
const KEY = INTRO_KEY;

/** First visit to the desk, per mentee: a walkthrough with no Skip, since there is no button to bring it back. */
export function DeskIntro({ who, ready, onDone }: { who: string; ready: boolean; onDone: () => void }) {
  const [at, setAt] = useState(-1);
  const start = useCallback(() => setAt(0), []);
  useTourOnce(KEY, who, ready, start, 700);
  return (
    <GuidedTour
      required
      steps={STEPS}
      step={at}
      onStep={setAt}
      onClose={() => {
        setAt(-1);
        markTourSeen(KEY, who);
        onDone();
      }}
    />
  );
}
