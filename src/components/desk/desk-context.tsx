"use client";

import { createContext, useContext } from "react";
import type { Desk, RefKind } from "@/lib/desk/model";
import type { Progress } from "@/lib/desk/progress";
import type { Here } from "@/lib/desk/tools";
import type { Tab } from "./task-file";

/** Something the viewer sheet can open: a reference an activity cites, or a platform tool mock. */
export type ViewItem = { kind: RefKind; id: string } | { kind: "tool"; id: string } | { kind: "panel"; id: string };

export interface DeskCtx {
  desk: Desk;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  start: Date;
  isOpen: (week: number) => boolean;
  openTask: (taskId: string, step?: number, tab?: Tab) => void;
  view: (item: ViewItem) => void;
  /** The step in hand (task file open on a step), or null on a week overview. */
  here: Here | null;
  /**
   * Opens a platform tool. The step in hand, not yet done, is worked in the tool modal (as is any
   * step opened with mode "work", to change it); every other opening is a floating read-only window.
   */
  openTool: (key: string, mode?: "work") => void;
  /** Closes a floating window (the Inbox, once its message is answered). */
  closeTool: (key: string) => void;
}

export const Ctx = createContext<DeskCtx | null>(null);
export function useDesk(): DeskCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDesk outside the desk");
  return c;
}
