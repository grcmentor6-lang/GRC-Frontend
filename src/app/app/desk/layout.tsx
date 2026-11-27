"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { StartDateGate, startKept } from "@/components/app/start-date-gate";
import { recordEmpty } from "@/lib/desk-record";
import { isoDay } from "@/lib/desk-plan";
import { useProgress } from "@/lib/desk/progress";
import { deskOpenFor } from "@/lib/flags";
import "./desk.css";

/** The Working Desk stays shut until the learner has said when they start: every due date counts from that one date.
 *  Asked when there is no start date, and again when the date has passed with no desk work at all (the backend sets
 *  one a week after joining, so a later first visit would open on a plan already behind). The app shell still
 *  surrounds this, so the rest of the app is open. */
export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // The same shared copy the desk reads (lib/desk/progress): no second request.
  const { progress, status } = useProgress(user?.email ?? "");
  const [kept, setKept] = useState(false);
  const start = user?.startDate?.slice(0, 10);
  const notBegun = !!user && !!start && start < isoDay(new Date()) && status === "ready" && recordEmpty(progress)
    && !kept && !startKept(user.email, start) && user.role !== "admin" && !deskOpenFor(user.email);
  if (user && (!start || notBegun)) {
    return (
      <div className="h-desk overflow-y-auto">
        <StartDateGate onKeep={() => setKept(true)} />
      </div>
    );
  }
  return <>{children}</>;
}
