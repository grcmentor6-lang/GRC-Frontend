import type { IconName } from "@/components/ui/icon";

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
  badge?: number;
  /** Not yet built (Phase 3+) — rendered but not navigable. */
  soon?: boolean;
}

/** Primary dashboard navigation, ported from the mockup shell. */
export const DASH_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "home", href: "/app" },
  { id: "desk", label: "Working Desk", icon: "desk", href: "/app/desk" },
  { id: "calendar", label: "Calendar", icon: "calendar", href: "/app/calendar" },
  { id: "submissions", label: "My Submissions", icon: "inbox", href: "/app/submissions" },
  { id: "library", label: "Standards Library", icon: "book", href: "/app/library" },
  { id: "badges", label: "Badges", icon: "star", href: "/app/badges" },
  { id: "certificate", label: "Certificate", icon: "ribbon", href: "/app/certificate" },
  { id: "cv", label: "My CV", icon: "file", href: "/app/cv" },
  { id: "career", label: "Career", icon: "rocket", href: "/app/career" },
  { id: "certification", label: "Certification", icon: "shield", href: "/app/certification" },
  { id: "reports", label: "Reports", icon: "chart", href: "/app/reports" },
  { id: "jobs", label: "Matching Jobs", icon: "briefcase", href: "/app/jobs" },
  { id: "guide", label: "User Guide", icon: "help", href: "/app/guide" },
];

/** Walkthrough "already ran" flags — see `useTourOnce`, which suffixes them per mentee. */
export const TOUR_SEEN_KEY = "grc.tour.seen";

/** Same, for the Working Desk walkthrough (mounted by DeskLayout — it spans the org context page
 *  and a task brief). The desk is gated behind the start-date picker, so a mentee's first visit
 *  there is the moment right after they choose their start date. */
export const DESK_TOUR_SEEN_KEY = "grc.desk.tour.seen";

export function initialsOf(first?: string | null, last?: string | null, email?: string): string {
  const a = (first || "").trim();
  const b = (last || "").trim();
  if (a || b) return `${a[0] ?? ""}${b[0] ?? ""}`.toUpperCase() || "?";
  return (email?.[0] ?? "?").toUpperCase();
}
