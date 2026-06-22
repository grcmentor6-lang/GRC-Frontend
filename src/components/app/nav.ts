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
  { id: "standards", label: "Standards", icon: "shield", href: "/app/standards" },
  { id: "calendar", label: "Calendar", icon: "calendar", href: "/app/calendar" },
  { id: "learnings", label: "My Learnings", icon: "layers", href: "/app/learnings" },
  { id: "cv", label: "My CV", icon: "file", href: "/app/cv" },
  { id: "career", label: "Career", icon: "rocket", href: "/app/career" },
  { id: "reports", label: "Reports", icon: "chart", href: "/app/reports" },
  { id: "badges", label: "Badges", icon: "star", href: "/app/badges" },
  { id: "certificate", label: "Certificate", icon: "ribbon", href: "/app/certificate" },
  { id: "jobs", label: "Matching Jobs", icon: "briefcase", href: "/app/jobs" },
];

export function initialsOf(first?: string | null, last?: string | null, email?: string): string {
  const a = (first || "").trim();
  const b = (last || "").trim();
  if (a || b) return `${a[0] ?? ""}${b[0] ?? ""}`.toUpperCase() || "?";
  return (email?.[0] ?? "?").toUpperCase();
}
