"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LibraryProvenance } from "@/components/app/library";
import { LIBRARY, entriesOf, partsOf } from "@/lib/library";
import { STANDARD_BY_ID } from "@/lib/standards";
import { isFocus } from "@/lib/focus";
import { LATER_BOX, LATER_INK, LaterTag } from "@/components/app/later";

/** Every standard GRC 101 is graded against. Tasks link into it; this is the way in without one. */
export default function LibraryPage() {
  return (
    <div className="page-shell space-y-4">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Standards library</h1>
        <p className="mt-1 text-[13px] text-slate-500 tracking-tight max-w-[72ch]" style={{ textWrap: "pretty" }}>
          Every clause and control of five standards — as a graphic you can present or share, and in plain
          terms. GRC 101 works on ISO/IEC 27001; the greyed standards are here to read.
        </p>
      </header>
      <LibraryProvenance />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* The focus standards first; the rest greyed, still openable. */}
        {[...LIBRARY].sort((a, b) => +isFocus(b.id) - +isFocus(a.id)).map((s) => {
          const meta = STANDARD_BY_ID[s.id];
          const later = !isFocus(s.id);
          return (
            <Link
              key={s.id}
              href={`/app/library/${s.id}`}
              className={`focus-ring group rounded-2xl p-4 flex flex-col transition-shadow ${later ? `bg-slate-50 border border-dashed border-slate-300 hover:border-slate-400 ${LATER_BOX} ${LATER_INK}` : "bg-white ring-1 ring-slate-200 hover:ring-slate-300"}`}
            >
              {later && <LaterTag className="mb-2 self-start" />}
              <span className="font-mono text-[10.5px] tracking-[0.08em] text-[#1f3564]">{meta?.fullName}</span>
              <span className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-slate-900 tracking-tight">
                {meta?.code}
                <Icon name="arrowRight" size={14} className="ml-auto text-slate-300 group-hover:text-sky-700" />
              </span>
              <p className="mt-2 flex-1 text-[12.5px] text-slate-600 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
                {meta?.description}
              </p>
              <span className="mt-3 font-mono text-[10.5px] text-slate-500">
                {entriesOf(s).length} items · {partsOf(s).join(" · ")}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
