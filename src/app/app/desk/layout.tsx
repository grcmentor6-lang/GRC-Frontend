"use client";

import { DeskLearningsProvider } from "@/components/app/desk-context";
import { DeskSidebar } from "@/components/app/desk-sidebar";

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeskLearningsProvider>
      <div className="flex h-full min-h-0">
        <DeskSidebar />
        <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
      </div>
    </DeskLearningsProvider>
  );
}
