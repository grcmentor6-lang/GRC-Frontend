"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export interface FaqEntry {
  q: string;
  a: string;
}

export function Faq({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-10 space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="bg-white rounded-2xl ring-1 ring-slate-200/70 overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full px-5 py-4 flex items-center gap-3 text-left"
            >
              <span className="text-[14.5px] font-semibold tracking-tight text-slate-900 flex-1">
                {item.q}
              </span>
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isOpen ? "bg-indigo-600 text-white rotate-45" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon name="plus" size={15} strokeWidth={2.4} />
              </span>
            </button>
            {isOpen && (
              <div
                className="px-5 pb-5 -mt-1 text-[13.5px] text-slate-500 leading-relaxed tracking-tight"
                style={{ textWrap: "pretty" }}
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
