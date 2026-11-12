"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { CertificateSheet, type CertStat } from "@/components/cert/certificate-sheet";
import { certificateApi, CERT_LOCKED, type Certificate } from "@/lib/certificate";
import { ExtendAccessCard } from "@/components/app/extend-access-card";

function ShareMenu({ cert }: { cert: Certificate }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const certUrl = cert.verifyUrl ?? "";

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const addToLinkedIn = () => {
    const p = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: cert.programTitle,
      organizationName: "grcmentor",
      issueYear: cert.issueYear ?? "",
      issueMonth: cert.issueMonth ?? "",
      certUrl,
      certId: cert.credentialId ?? "",
    });
    window.open("https://www.linkedin.com/profile/add?" + p.toString(), "_blank", "noopener,width=720,height=640");
    setOpen(false);
  };
  const shareFeed = () => {
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(certUrl), "_blank", "noopener,width=680,height=620");
    setOpen(false);
  };
  const copyVerify = async () => {
    try { await navigator.clipboard.writeText(certUrl); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const items: { id: string; icon: IconName; label: string; sub: string; onClick: () => void; hl?: boolean; ok?: boolean }[] = [
    { id: "li", icon: "linkedin", label: "Add to LinkedIn profile", sub: "Licenses & Certifications", onClick: addToLinkedIn, hl: true },
    { id: "feed", icon: "send", label: "Share to LinkedIn feed", sub: "Post your achievement", onClick: shareFeed },
    { id: "copy", icon: copied ? "check" : "link", label: copied ? "Link copied" : "Copy verification link", sub: cert.verifyUrl ?? "", onClick: copyVerify, ok: copied },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium tracking-tight hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
        <Icon name="send" size={14} /> Share
        <Icon name="chevronDown" size={13} className={`-mr-1 opacity-80 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[290px] z-50 rounded-xl bg-white ring-1 ring-slate-200 shadow-[0_16px_48px_-16px_rgba(15,23,42,0.28)] p-1.5 origin-top-right">
          <div className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-400">Share certificate</div>
          {items.map((it) => (
            <button key={it.id} onClick={it.onClick} className="w-full flex items-center gap-3 px-2.5 h-12 rounded-lg hover:bg-slate-50 transition-colors text-left">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${it.hl ? "bg-indigo-50 text-indigo-600 ring-indigo-100" : it.ok ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : "bg-slate-50 text-slate-500 ring-slate-200"}`}><Icon name={it.icon} size={15} strokeWidth={it.icon === "check" ? 3 : 1.8} /></span>
              <span className="min-w-0">
                <span className={`block text-[12.5px] font-medium tracking-tight ${it.ok ? "text-emerald-600" : "text-slate-800"}`}>{it.label}</span>
                <span className="block text-[11px] text-slate-400 tracking-tight truncate">{it.sub}</span>
              </span>
            </button>
          ))}
          <div className="my-1 h-px bg-slate-100" />
          <button onClick={() => { window.print(); setOpen(false); }} className="w-full flex items-center gap-3 px-2.5 h-12 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center ring-1 bg-slate-50 text-slate-500 ring-slate-200"><Icon name="download" size={15} /></span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium tracking-tight text-slate-800">Download as PDF</span>
              <span className="block text-[11px] text-slate-400 tracking-tight">A4 landscape, print-ready</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/** Scales the fixed 1000px certificate sheet to fit its container width. */
function CertStage({ children, dep }: { children: React.ReactNode; dep: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      const stage = stageRef.current;
      const sheet = sheetRef.current;
      if (!stage || !sheet) return;
      const scale = Math.min(1, stage.clientWidth / 1000);
      sheet.style.transform = `scale(${scale})`;
      sheet.style.transformOrigin = "top left";
      stage.style.height = `${sheet.offsetHeight * scale}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    if (document.fonts?.ready) document.fonts.ready.then(fit).catch(() => {});
    const t = setTimeout(fit, 400);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [dep]);

  return (
    <div ref={stageRef} className="relative w-full overflow-hidden">
      <div ref={sheetRef} className="shadow-[0_1px_2px_rgba(15,23,42,0.04),0_30px_80px_-32px_rgba(15,23,42,0.30)]">{children}</div>
    </div>
  );
}

export default function CertificatePage() {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("grc101");

  useEffect(() => {
    let cancelled = false;
    certificateApi.mine().then((c) => !cancelled && setCert(c)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  // The sheet prints exactly the figures the public verify page prints: one list, from the backend.
  const stats: CertStat[] = cert?.stats ?? [];

  const certVerifyLabel = cert?.verifyUrl?.replace(/^https?:\/\//, "") ?? "";
  const locked = CERT_LOCKED.find((l) => l.id === tab);
  const isLocked = !!locked;
  // What is still needed, from the server's own list (tasks, steps, the two exams).
  const todo = cert?.status === "preview" ? (cert.requirements ?? []).filter((r) => !r.met) : [];
  const statusNote = isLocked
    ? locked!.statusNote
    : cert?.status === "preview"
      ? `Not issued · ${todo.length} of ${cert.requirements?.length ?? 0} requirements to go`
      : `${cert?.statusNote ?? ""}${cert?.tier === "distinction" ? " · with distinction" : ""}`;
  const chipTone = isLocked
    ? "bg-slate-100 ring-slate-200 text-slate-500"
    : cert?.status === "issued"
      ? "bg-emerald-50 ring-emerald-100 text-emerald-700"
      : cert?.status === "expired"
        ? "bg-rose-50 ring-rose-100 text-rose-700"
        : "bg-amber-50 ring-amber-100 text-amber-700";

  const tabs = [{ id: "grc101", code: "GRC 101", locked: false }, ...CERT_LOCKED.map((l) => ({ id: l.id, code: l.code, locked: true }))];

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between gap-4 mb-5 cert-noprint flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-slate-900">Certificate</h1>
          {!loading && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full ring-1 text-[11px] font-medium tracking-tight ${chipTone}`}>
              <Icon name={!isLocked && cert?.status === "issued" ? "check" : "history"} size={12} /> {statusNote}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 ring-1 ring-slate-200 w-fit">
            {tabs.map((t) => {
              const sel = t.id === tab;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium tracking-tight transition-all ${sel ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                  {t.locked && <Icon name="lock" size={12} className={sel ? "text-slate-400" : "text-slate-300"} />}
                  {t.code}
                </button>
              );
            })}
          </div>
          {!isLocked && cert && cert.status !== "preview" && <ShareMenu cert={cert} />}
        </div>
      </div>

      {loading ? (
        <Loader label="Loading certificate…" />
      ) : isLocked ? (
        // No content exists for this programme yet, so no sheet with the mentee's name on it either.
        <section className="rounded-md border border-[#DDE1E8] bg-white px-6 py-10 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#F3F4F7] text-[#8A91A3]"><Icon name="lock" size={18} /></span>
          <h2 className="mt-3 text-[16px] font-bold text-[#111827]">{locked!.programTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] text-[#3F4757]">
            This programme has not opened yet, so there is no certificate to work towards. It {locked!.statusNote.replace(/^Locked · /, "")}.
          </p>
        </section>
      ) : cert ? (
        <>
          <CertStage dep={`${tab}-${cert.status}`}>
            <CertificateSheet preview={cert.status === "preview"} stats={stats} cert={cert} />
          </CertStage>
          <div className="text-center text-[11px] text-slate-400 pt-5 pb-2 cert-noprint">
            {cert.status === "preview" ? (
              <>Not issued yet. It is issued by itself the moment everything below is met.</>
            ) : cert.expired ? (
              <>This credential lapsed on {cert.expiryDate}. It stays verifiable at {certVerifyLabel} as a record of completed work.</>
            ) : (
              <>Verifiable at {certVerifyLabel} · valid for {cert.validityYears} years, until {cert.expiryDate}</>
            )}
          </div>
          {cert.status === "preview" && (cert.requirements?.length ?? 0) > 0 && (
            <section data-cert="requirements" aria-label="What the certificate takes" className="cert-noprint mx-auto mt-2 max-w-[720px] rounded-md border border-[#DDE1E8] bg-white">
              <h2 className="border-b border-[#E9ECF1] px-4 py-2.5 text-[13.5px] font-bold text-[#111827]">What the certificate takes</h2>
              <ul>
                {cert.requirements.map((r) => (
                  <li key={r.label} className="flex items-start gap-3 border-b border-[#F0F1F4] px-4 py-2.5 last:border-b-0">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${r.met ? "bg-[#16A34A] text-white" : "border border-[#C9CED8] text-transparent"}`} aria-label={r.met ? "met" : "to do"}>
                      <Icon name="check" size={11} strokeWidth={3.5} />
                    </span>
                    <span className="min-w-0 flex-1 text-[13.5px] font-medium text-[#111827]">{r.label}</span>
                    <span className={`shrink-0 text-[12.5px] tabular-nums ${r.met ? "text-[#15803D]" : "text-[#5B6474]"}`}>{r.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-[#E9ECF1] px-4 py-2.5 text-[12.5px] leading-relaxed text-[#5B6474]">
                The certificate records verified work, not a score. The weekly knowledge checks are practice and do not count; the two exams are the only pass marks. An exam not passed in two attempts opens again after 7 days. Both exams at 85 % or more at the first attempt earns it with distinction.
              </p>
            </section>
          )}
          {cert.status !== "preview" && (
            <div className="max-w-[720px] mx-auto mt-2 cert-noprint">
              <ExtendAccessCard kind="certificate" />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-[13px] text-slate-400 py-24">Couldn&apos;t load your certificate. Please try again.</div>
      )}
    </div>
  );
}
