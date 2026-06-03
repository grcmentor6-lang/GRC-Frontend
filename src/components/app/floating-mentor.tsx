"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Floating AI-mentor affordance, present across the app shell. Static for now — the live
 * mentor chat arrives with the Working Desk + grading engine (Phase 4).
 */
export function FloatingMentor() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[320px] rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_16px_48px_-16px_rgba(15,23,42,0.28)] overflow-hidden" style={{ animation: "popIn 0.16s ease-out" }}>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white">
              <Icon name="bot" size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold tracking-tight text-slate-900">Your AI mentor</div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online</div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight">
              An AI mentor reviews and grades every activity you submit, with Socratic feedback.
              Live chat opens with the Working Desk.
            </p>
            <div className="mt-3 flex items-center gap-2 px-3 h-10 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 text-slate-400">
              <Icon name="chat" size={15} />
              <span className="text-[12.5px]">Ask your mentor — coming soon</span>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-14 h-14 rounded-full shadow-[0_8px_24px_-6px_rgba(99,102,241,0.6)] ring-2 ring-white flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)" }}
        aria-label="Your AI mentor"
      >
        {open ? <Icon name="x" size={20} /> : <Icon name="bot" size={22} />}
        {!open && <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />}
      </button>
    </div>
  );
}
