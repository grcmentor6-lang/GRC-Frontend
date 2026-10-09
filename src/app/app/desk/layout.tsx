"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { StartDateGate } from "@/components/app/start-date-gate";
import "./desk.css";

/** The Working Desk stays locked until the learner picks their start date: every week of the
 *  programme opens from it. The app shell still surrounds this, so the rest of the app is open. */
export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user && !user.startDate) {
    return (
      <div className="h-desk overflow-y-auto">
        <StartDateGate />
      </div>
    );
  }
  return <>{children}</>;
}
