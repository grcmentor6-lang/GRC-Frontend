"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { VerifyQR } from "@/components/cert/certificate-sheet";
import { certificateApi, type CertVerify } from "@/lib/certificate";
import { ApiError } from "@/lib/api";

export default function VerifyPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = use(params);
  const [data, setData] = useState<CertVerify | null>(null);
  const [state, setState] = useState<"loading" | "found" | "invalid" | "unavailable">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    certificateApi.verify(credentialId)
      .then((d) => { if (!cancelled) { setData(d); setState("found"); } })
      // Only a 404 means "no such credential". A timeout or a 5xx (the free-tier backend cold-
      // starting) must not tell an employer that a real credential is fake.
      .catch((e) => { if (!cancelled) setState(e instanceof ApiError && e.status === 404 ? "invalid" : "unavailable"); });
    return () => { cancelled = true; };
  }, [credentialId, attempt]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <div className="max-w-[640px] w-full mx-auto px-6 py-10 flex-1">
        <Link href="/" className="flex items-baseline gap-0 mb-8">
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-slate-700">grc</span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
        </Link>

        {state === "loading" && <Loader label="Verifying credential…" />}

        {state === "invalid" && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 ring-1 ring-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3"><Icon name="x" size={22} /></div>
            <div className="text-[16px] font-semibold text-slate-900">Credential not found</div>
            <p className="text-[13px] text-slate-500 mt-1.5">No issued credential matches <span className="font-mono text-slate-700">{credentialId}</span>.</p>
            <Link href="/" className="inline-block mt-4 text-[13px] font-medium text-indigo-600 hover:underline">Go to grcmentor →</Link>
          </div>
        )}

        {state === "unavailable" && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-8 text-center shadow-sm">
            <div className="text-[16px] font-semibold text-slate-900">Verification is temporarily unavailable</div>
            <p className="text-[13px] text-slate-500 mt-1.5">
              We could not reach the credential register just now. This says nothing about whether <span className="font-mono text-slate-700">{credentialId}</span> is valid.
            </p>
            <button onClick={() => { setState("loading"); setAttempt((n) => n + 1); }} className="mt-4 text-[13px] font-medium text-indigo-600 hover:underline">Try again</button>
          </div>
        )}

        {state === "found" && data && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)]">
            {/* An expired credential is still authentic — the header says lapsed, not fake. */}
            <div className={`px-7 py-5 border-b flex items-center gap-3 ${data.expired ? "bg-amber-50/60 border-amber-100" : "bg-emerald-50/60 border-emerald-100"}`}>
              <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 ${data.expired ? "bg-amber-500" : "bg-emerald-500"}`}>
                <Icon name={data.expired ? "history" : "check"} size={20} strokeWidth={data.expired ? 2 : 3} />
              </div>
              <div>
                <div className={`text-[14px] font-semibold tracking-tight ${data.expired ? "text-amber-800" : "text-emerald-800"}`}>
                  {data.expired ? "Expired credential" : "Verified credential"}
                </div>
                <div className={`text-[12px] tracking-tight ${data.expired ? "text-amber-700/80" : "text-emerald-700/80"}`}>
                  {data.expired
                    ? `Authentic and issued by grcmentor, but lapsed on ${data.expiryDate}`
                    : `Authentic, issued by grcmentor · valid to ${data.expiryDate}`}
                </div>
              </div>
            </div>

            <div className="px-7 py-6">
              <div className="text-[11px] font-semibold tracking-[0.13em] uppercase text-slate-400">Awarded to</div>
              <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900 mt-1">{data.recipient}</div>
              <div className="text-[13.5px] text-slate-600 tracking-tight mt-2">{data.programTitle}</div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mt-6">
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
                <VerifyQR url={data.verifyUrl} size={56} />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-amber-700">Credential ID</div>
                  <div className="font-mono text-[12px] text-slate-700 mt-0.5">{data.credentialId}</div>
                  <div className="text-[11.5px] text-slate-400 tracking-tight mt-1">
                    Issued {data.issueDate} · {data.expired ? "expired" : "valid until"} {data.expiryDate}
                  </div>
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
