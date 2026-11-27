"use client";
import { useSyncExternalStore } from "react";

/** The task and step the learner has open on the desk, for "Report a problem" to send with the note (UX101 W9, G-07). */
export type Where = { task: string; step: number } | null;
let now: Where = null;
const subs = new Set<() => void>();
export function setWhere(w: Where) {
  if (now?.task === w?.task && now?.step === w?.step) return;
  now = w;
  subs.forEach((f) => f());
}
export const useWhere = (): Where => useSyncExternalStore((f) => (subs.add(f), () => void subs.delete(f)), () => now, () => null);
