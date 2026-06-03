"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CvSheet } from "@/components/cv/cv-sheet";
import { cvApi, type Cv } from "@/lib/cv";

export default function PublicCvPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [cv, setCv] = useState<Cv | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    cvApi.public(slug)
      .then((c) => { if (!cancelled) { setCv(c); setState("ok"); } })
      .catch(() => { if (!cancelled) setState("missing"); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-[980px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="flex items-baseline gap-0">
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-slate-700">grc</span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
          </Link>
          <span className="text-[11px] text-slate-400 tracking-tight">Verified GRC fieldwork</span>
        </div>

        {state === "loading" && (
          <div className="flex items-center justify-center py-32 text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" /></div>
        )}
        {state === "missing" && (
          <div className="text-center py-32">
            <div className="text-[15px] font-semibold text-slate-900">CV not found</div>
            <p className="text-[13px] text-slate-500 mt-1">This public CV link is no longer available.</p>
            <Link href="/" className="inline-block mt-4 text-[13px] font-medium text-indigo-600 hover:underline">Go to grcmentor →</Link>
          </div>
        )}
        {state === "ok" && cv && (
          <>
            <CvSheet cv={cv} />
            <div className="text-center text-[11px] text-slate-400 pt-5 pb-2">
              Auto-compiled from verified mentor-graded work on{" "}
              <Link href="/" className="text-indigo-600 hover:underline">grcmentor</Link>.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
