"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LibraryProvenance } from "@/components/app/library";
import { LIBRARY, entriesOf, partsOf } from "@/lib/library";
import { STANDARD_BY_ID } from "@/lib/standards";

/** Every standard GRC 101 is graded against. Tasks link into it; this is the way in without one. */
export default function LibraryPage() {
  return (
    <div className="page-shell space-y-4">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Standards library</h1>
        <p className="mt-1 text-[13px] text-slate-500 tracking-tight max-w-[72ch]" style={{ textWrap: "pretty" }}>
          Every clause and control of the five standards the programme works against — as a graphic you can
          present or share, and in plain terms.
        </p>
      </header>
      <LibraryProvenance />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIBRARY.map((s) => {
          const meta = STANDARD_BY_ID[s.id];
          return (
            <Link
              key={s.id}
              href={`/app/library/${s.id}`}
              className="focus-ring group rounded-2xl bg-white ring-1 ring-slate-200 hover:ring-slate-300 p-4 flex flex-col transition-shadow"
            >
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
