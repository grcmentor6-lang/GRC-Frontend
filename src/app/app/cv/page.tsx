"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { CvSheet } from "@/components/cv/cv-sheet";
import { cvApi, type Cv } from "@/lib/cv";

function ShareMenu({ cv }: { cv: Cv }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const publicUrl = `https://${cv.publicUrl}`;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const shareLinkedIn = () => {
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(publicUrl), "_blank", "noopener,width=680,height=620");
    setOpen(false);
  };
  const emailEmployer = () => {
    const subject = encodeURIComponent(`${cv.profile.name} — GRC CV`);
    const body = encodeURIComponent(`${cv.profile.name} — ${cv.profile.headline}. Verified GRC fieldwork on grcmentor.\n\nView the live CV: ${publicUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(publicUrl); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const items: { id: string; icon: IconName; label: string; sub: string; onClick: () => void; accent?: boolean }[] = [
    { id: "li", icon: "linkedin", label: "Share to LinkedIn", sub: "Post to your profile feed", onClick: shareLinkedIn },
    { id: "mail", icon: "mail", label: "Email to an employer", sub: "Opens your mail client", onClick: emailEmployer },
    { id: "copy", icon: copied ? "check" : "link", label: copied ? "Link copied" : "Copy public link", sub: cv.publicUrl, onClick: copyLink, accent: copied },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium tracking-tight hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
        <Icon name="send" size={14} /> Share
        <Icon name="chevronDown" size={13} className={`-mr-1 opacity-80 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[286px] z-50 rounded-xl bg-white ring-1 ring-slate-200 shadow-[0_16px_48px_-16px_rgba(15,23,42,0.28)] p-1.5 origin-top-right">
          <div className="px-2.5 pt-2 pb-1.5"><div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-400">Share your CV</div></div>
          {items.map((it) => (
            <button key={it.id} onClick={it.onClick} className="w-full flex items-center gap-3 px-2.5 h-12 rounded-lg hover:bg-slate-50 transition-colors text-left">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${it.accent ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : "bg-slate-50 text-slate-500 ring-slate-200/70"}`}><Icon name={it.icon} size={15} strokeWidth={it.icon === "check" ? 3 : 1.8} /></span>
              <span className="min-w-0">
                <span className={`block text-[12.5px] font-medium tracking-tight ${it.accent ? "text-emerald-600" : "text-slate-800"}`}>{it.label}</span>
                <span className="block text-[11px] text-slate-400 tracking-tight truncate">{it.sub}</span>
              </span>
            </button>
          ))}
          <div className="my-1 h-px bg-slate-100" />
          <button onClick={() => { window.print(); setOpen(false); }} className="w-full flex items-center gap-3 px-2.5 h-12 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center ring-1 bg-slate-50 text-slate-500 ring-slate-200/70"><Icon name="download" size={15} /></span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium tracking-tight text-slate-800">Download as PDF</span>
              <span className="block text-[11px] text-slate-400 tracking-tight">Print-ready document</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function CvPage() {
  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    cvApi.mine().then((c) => !cancelled && setCv(c)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-[980px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between gap-4 mb-5 cv-noprint flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-slate-900">My CV</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-emerald-50 ring-1 ring-emerald-100 text-[11px] font-medium text-emerald-700 tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto-synced from your work
          </span>
        </div>
        {cv && (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200/70 text-slate-600 text-[12.5px] font-medium tracking-tight hover:bg-slate-50 transition-colors">
              <Icon name="download" size={14} /> Download
            </button>
            <ShareMenu cv={cv} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" /></div>
      ) : cv ? (
        <>
          <CvSheet cv={cv} />
          <div className="text-center text-[11px] text-slate-400 pt-4 pb-2 cv-noprint">Updates automatically as you complete mentor-graded activities.</div>
        </>
      ) : (
        <div className="text-center text-[13px] text-slate-400 py-24">Couldn&apos;t load your CV. Please try again.</div>
      )}
    </div>
  );
}
