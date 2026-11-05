"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GuidedTour, markTourSeen, useTourOnce, type TourStep } from "./guided-tour";
import { useAuth } from "@/components/auth/auth-provider";
import { TOUR_SEEN_KEY } from "./nav";

/** Fire from anywhere to (re)start the main guide — the User Guide page, the account menu and the
 *  dashboard's own Guide button use it. A window event keeps the trigger decoupled from AppShell,
 *  which owns the tour state. */
export const TOUR_EVENT = "grc:welcome-tour";
export const startWelcomeTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

/** Spotlight a piece of app chrome by its data-tour tag. */
const tag = (name: string) => () => document.querySelector<HTMLElement>(`[data-tour="${name}"]`);

/**
 * The main guide: one walkthrough of the whole app. It covers the shell's navigation and, in the
 * middle, walks the dashboard itself — opening it if the mentee is somewhere else. The dashboard
 * has no separate tour; these are the same steps, in reading order.
 *
 * Mounted by AppShell, which persists across every /app route, so the tour survives the navigation
 * it performs. The Working Desk keeps its own deeper walkthrough (organisation, tree, task brief).
 */
function steps(showNav: () => void, goto: (href: string) => void): TourStep[] {
  /** Nav steps: the rail is always mounted; reveal the drawer on small screens. */
  const nav = (name: string): Pick<TourStep, "getEl" | "onEnter"> => ({ getEl: tag(name), onEnter: showNav });
  /** Dashboard steps: make sure we're on the dashboard (also covers stepping Back into them). */
  const dash = (name: string): Pick<TourStep, "getEl" | "onEnter"> => ({ getEl: tag(name), onEnter: () => goto("/app") });

  return [
    {
      title: "How the platform works",
      body: "You're joining a simulated Group GRC Office for 12 weeks, working two organisations. Two minutes now and you'll know where everything lives. Use Next, or Skip if you'd rather explore.",
      icon: "sparkle",
      getEl: () => null, // no target — the card floats, page dimmed
    },
    {
      title: "Your dashboard",
      body: "Start every session here. It shows your next step on the Working Desk and how far through the desk you are.",
      icon: "home",
      ...nav("nav-dashboard"),
    },
    {
      title: "Your next step, always on top",
      body: "This banner names the exact task and step to do next and opens the desk on it. On your first day it sends you to pick your start date: every due date counts from that day.",
      icon: "play",
      ...dash("dash-hero"),
    },
    {
      title: "Your numbers at a glance",
      body: "Steps done, decisions made, and your next task due date, all counted from the work saved to your account.",
      icon: "checkSquare",
      optional: true, // a locked track shows a preview instead
      ...dash("dash-stats"),
    },
    {
      title: "Your organisations",
      body: "The two organisations you work for. Click one for its full profile: offices, standards and what binds it.",
      icon: "briefcase",
      optional: true,
      ...dash("dash-orgs"),
    },
    {
      title: "Track your progress",
      body: "Method badges, tasks submitted and steps done fill in as you work on the desk.",
      icon: "star",
      optional: true,
      ...dash("dash-grid"),
    },
    {
      title: "The Working Desk",
      body: "Twelve weeks, a few tasks each, every task a list of steps. Each step names the screen to open from the toolbar at the bottom; an orange dot marks where to go. The desk has its own walkthrough, and \"Show me how\" replays a step's guide.",
      icon: "desk",
      ...nav("nav-desk"),
    },
    {
      title: "The documents hold the facts",
      body: "Policies, registers and the organisation's own records hold the facts each step needs. Decisions are checked the moment you answer and tell you why each option is right or wrong.",
      icon: "book",
      ...nav("nav-desk"),
    },
    {
      title: "Everything you submitted",
      body: "My Submissions lists every task and step you have completed on the desk, week by week.",
      icon: "inbox",
      ...nav("nav-submissions"),
    },
    {
      title: "What your work turns into",
      body: "Badges, your certificate, CV, career tools, reports and matched jobs are built from your desk work. You never write them by hand.",
      icon: "trophy",
      ...nav("nav"),
    },
    {
      title: "What's due, and your account",
      body: "The bell shows desk tasks due in the next week and anything overdue. Profile and password sit under your avatar, with a link back to this guide.",
      icon: "clock",
      getEl: tag("bell"),
    },
    {
      title: "The full written guide lives here",
      body: "Worth ten minutes before you start: how the desk works, how your work is checked, and what to do on your first day.",
      icon: "help",
      ...nav("nav-guide"),
    },
  ];
}

/** Mounted once by AppShell. Auto-runs on the mentee's first visit, and any time `startWelcomeTour`
 *  fires. `openNav` reveals the mobile drawer so the nav targets exist on small screens. */
export function WelcomeTour({ openNav }: { openNav: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(-1);

  // On desktop the sidebar is always present — don't pop the drawer open behind the spotlight.
  const showNav = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) openNav();
  }, [openNav]);

  // replace, not push: a twelve-step guide shouldn't bury the mentee's real history.
  const goto = useCallback((href: string) => {
    if (window.location.pathname !== href) router.replace(href);
  }, [router]);

  const tourSteps = useMemo(() => steps(showNav, goto), [showNav, goto]);

  // First run, per mentee. Delayed so the shell has painted and the nav targets are measurable.
  useTourOnce(TOUR_SEEN_KEY, user?.email, true, () => setStep(0), 600);

  // Manual relaunch.
  useEffect(() => {
    const onStart = () => setStep(0);
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, []);

  const close = useCallback(() => {
    setStep(-1);
    markTourSeen(TOUR_SEEN_KEY, user?.email);
  }, [user?.email]);

  return <GuidedTour steps={tourSteps} step={step} onStep={setStep} onClose={close} />;
}
