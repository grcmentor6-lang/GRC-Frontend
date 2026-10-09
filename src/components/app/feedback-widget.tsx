"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

/** Longest edge we send. A downscaled JPEG of a 4K screen is ~200 KB; the raw PNG is ~4 MB, and
 *  the API caps the payload — without this most reports would bounce. */
const MAX_EDGE = 1600;

/** Downscale to a JPEG data URL. Screenshots are read for their layout, not their pixels. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

/**
 * Beta feedback button — fixed bottom-right of every signed-in page.
 *
 * A note, optionally a screenshot (picked or pasted — Win+Shift+S then Ctrl+V is how people
 * actually do this), and the page they were on. Lands in the admin panel's Issues section.
 */
/** `placement` moves it off whatever a page docks in the corner (the desk toolbar). */
export function FeedbackWidget({ placement = "bottom-5 right-5" }: { placement?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const attach = async (file: File | null | undefined) => {
    if (!file) return;
    setError("");
    try {
      setShot(await shrink(file));
    } catch {
      setError("Couldn't read that image.");
    }
  };

  const send = async () => {
    if (note.trim().length < 3 || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/me/feedback", { note: note.trim(), page: pathname, screenshot: shot });
      setSent(true);
      setNote("");
      setShot(null);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send that — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`fixed ${placement} z-50 flex flex-col items-end gap-3 print:hidden`}>
      {open && (
        <div
          onPaste={(e) => attach(Array.from(e.clipboardData.files)[0])}
          className="w-[330px] rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_18px_50px_-16px_rgba(15,23,42,0.28)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 h-11 border-b border-slate-200">
            <span className="text-[13px] font-semibold tracking-tight text-slate-900">Report an issue</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="focus-ring w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Icon name="x" size={15} />
            </button>
          </div>

          {sent ? (
            <div className="px-4 py-6 flex items-center gap-2.5 text-[13px] text-slate-700">
              <Icon name="checkCircle" size={17} className="text-emerald-500" />
              Thanks — we&apos;ve got it.
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={4000}
                rows={4}
                placeholder="What went wrong, or what would you change?"
                className="w-full p-3 rounded-lg bg-white ring-1 ring-slate-200 text-[13px] leading-[1.55] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none transition-shadow"
              />

              {shot ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot} alt="Screenshot to send" className="w-full rounded-lg ring-1 ring-slate-200" />
                  <button
                    onClick={() => setShot(null)}
                    aria-label="Remove screenshot"
                    className="focus-ring absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900"
                  >
                    <Icon name="x" size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="focus-ring h-9 rounded-lg ring-1 ring-dashed ring-slate-300 text-[12.5px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="camera" size={14} />
                  Add a screenshot — or paste one
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => attach(e.target.files?.[0])}
              />

              {error && <p className="text-[12px] text-rose-600">{error}</p>}

              <button
                onClick={send}
                disabled={busy || note.trim().length < 3}
                className="focus-ring h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium tracking-tight transition-colors"
              >
                {busy ? "Sending…" : "Send"}
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Report an issue"
        title="Report an issue"
        className="focus-ring w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_10px_30px_-8px_rgba(79,70,229,0.7)] flex items-center justify-center transition-colors"
      >
        <Icon name={open ? "x" : "messageSquare"} size={19} />
      </button>
    </div>
  );
}
