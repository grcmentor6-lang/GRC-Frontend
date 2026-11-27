"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { useWhere } from "@/lib/desk/where";

interface MyReport { id: number; note: string; page: string | null; hasScreenshot: boolean; status: string; createdAt: string }

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
 * Report a problem: a note, optionally a screenshot (picked or pasted — Win+Shift+S then Ctrl+V is how people
 * actually do this), and the page they were on. Lands in the admin panel's Issues section.
 *
 * It lives inside the AI mentor panel (study-assistant.tsx), so learners meet one button, not two (owner, 27 Nov 2026).
 */
export function ReportProblem() {
  const [note, setNote] = useState("");
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  // Stuck and unable to go on: the one kind of report answered, by email within 24 hours (owner, 27 Nov 2026).
  // ponytail: the flag rides as a "STUCK:" prefix on the note (no column); the admin Issues list shows it first in the text.
  const [stuck, setStuck] = useState(false);
  const [sentStuck, setSentStuck] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const where = useWhere();
  // The task and step open on the desk go with the note (UX101 W9): the form says so, and the note need not.
  const at = where ? `${where.task}${where.step ? ` step ${where.step}` : ""}` : "";
  const [mine, setMine] = useState<MyReport[]>([]);
  const loadMine = () => api.get<MyReport[]>("/me/feedback").then(setMine).catch(() => {});
  useEffect(() => { void loadMine(); }, []);

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
      await api.post("/me/feedback", { note: `${stuck ? "STUCK: " : ""}${note.trim()}`, page: at ? `${pathname} (${at})` : pathname, screenshot: shot });
      setSent(true);
      setSentStuck(stuck);
      setStuck(false);
      void loadMine();
      setNote("");
      setShot(null);
      setTimeout(() => setSent(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send that — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onPaste={(e) => attach(Array.from(e.clipboardData.files)[0])} data-report>
          {sent ? (
            <div className="py-6 flex items-center gap-2.5 text-[13px] text-slate-700">
              <Icon name="checkCircle" size={17} className="text-emerald-500" />
              {sentStuck ? "Sent. The programme office replies to your sign-in email within 24 hours." : "Thanks. The programme office reads every report."}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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

              <label className="flex items-start gap-2 text-[12.5px] leading-snug text-slate-700">
                <input type="checkbox" checked={stuck} onChange={(e) => setStuck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-indigo-600" />
                <span><strong className="font-semibold text-slate-900">I&apos;m stuck and can&apos;t continue.</strong> We reply to your sign-in email within 24 hours.</span>
              </label>

              <p data-report-sends className="text-[12px] leading-snug text-slate-500">
                Sent with your note: the page{at ? <>, <strong className="font-semibold text-slate-700">{at}</strong> (the step you have open)</> : ""}, and a screenshot only if you add one. The programme office reads every report and replies to the ones marked stuck.
              </p>

              {error && <p className="text-[12px] text-rose-600">{error}</p>}

              <button
                onClick={send}
                disabled={busy || note.trim().length < 3}
                className="focus-ring h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium tracking-tight transition-colors"
              >
                {busy ? "Sending…" : "Send"}
              </button>
              {mine.length > 0 && (
                <details data-my-reports className="border-t border-slate-200 pt-2.5 text-[12.5px] text-slate-700">
                  <summary className="cursor-pointer font-semibold text-slate-900">Your past reports ({mine.length})</summary>
                  <ul className="mt-2 grid max-h-44 gap-2 overflow-y-auto">
                    {mine.map((r) => (
                      <li key={r.id} className="rounded-lg bg-slate-50 px-2.5 py-2">
                        <span className="block text-[11.5px] text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}
                          {r.page?.match(/\(([^)]+)\)$/) ? ` · ${r.page.match(/\(([^)]+)\)$/)![1]}` : ""} · {r.status === "closed" ? "Closed" : "Received"}
                        </span>
                        <span className="line-clamp-3 break-words">{r.note}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
    </div>
  );
}
