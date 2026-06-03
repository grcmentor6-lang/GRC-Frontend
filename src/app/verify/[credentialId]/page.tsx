"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FauxQR } from "@/components/cert/certificate-sheet";
import { certificateApi, type CertVerify } from "@/lib/certificate";

export default function VerifyPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = use(params);
  const [data, setData] = useState<CertVerify | null>(null);
  const [state, setState] = useState<"loading" | "valid" | "invalid">("loading");

  useEffect(() => {
    let cancelled = false;
    certificateApi.verify(credentialId)
      .then((d) => { if (!cancelled) { setData(d); setState("valid"); } })
      .catch(() => { if (!cancelled) setState("invalid"); });
    return () => { cancelled = true; };
  }, [credentialId]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <div className="max-w-[640px] w-full mx-auto px-6 py-10 flex-1">
        <Link href="/" className="flex items-baseline gap-0 mb-8">
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-slate-700">grc</span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
        </Link>

        {state === "loading" && (
          <div className="flex items-center justify-center py-24 text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" /></div>
        )}

        {state === "invalid" && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 ring-1 ring-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3"><Icon name="x" size={22} /></div>
            <div className="text-[16px] font-semibold text-slate-900">Credential not found</div>
            <p className="text-[13px] text-slate-500 mt-1.5">No issued credential matches <span className="font-mono text-slate-700">{credentialId}</span>.</p>
            <Link href="/" className="inline-block mt-4 text-[13px] font-medium text-indigo-600 hover:underline">Go to grcmentor →</Link>
          </div>
        )}

        {state === "valid" && data && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)]">
            <div className="px-7 py-5 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Icon name="check" size={20} strokeWidth={3} /></div>
              <div>
                <div className="text-[14px] font-semibold text-emerald-800 tracking-tight">Verified credential</div>
                <div className="text-[12px] text-emerald-700/80 tracking-tight">Authentic, issued by grcmentor</div>
              </div>
            </div>

            <div className="px-7 py-6">
              <div className="text-[11px] font-semibold tracking-[0.13em] uppercase text-slate-400">Awarded to</div>
              <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900 mt-1">{data.recipient}</div>
              <div className="text-[13.5px] text-slate-600 tracking-tight mt-2">{data.programTitle}</div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                {data.stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-slate-50/70 ring-1 ring-slate-200/60 px-3 py-2.5 text-center">
                    <div className="text-[17px] font-semibold tracking-[-0.02em] text-indigo-600 tabular-nums">{s.value}</div>
                    <div className="text-[10.5px] text-slate-500 tracking-tight mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {data.standards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {data.standards.map((s) => (
                    <span key={s} className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium tracking-tight bg-amber-50 text-amber-800 ring-1 ring-amber-100">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100">
                <FauxQR seed={data.credentialId} size={56} />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-amber-700">Credential ID</div>
                  <div className="font-mono text-[12px] text-slate-700 mt-0.5">{data.credentialId}</div>
                  <div className="text-[11.5px] text-slate-400 tracking-tight mt-1">Issued {data.issueDate}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="text-center text-[11px] text-slate-400 pb-6">grcmentor · verifiable GRC credentials</div>
    </div>
  );
}
