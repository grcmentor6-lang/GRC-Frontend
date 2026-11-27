"use client";

import { isoDmy } from "@/lib/dates";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { authApi } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return isoDmy(iso);
}

/**
 * One-time access extension for sharing a badge/certificate on LinkedIn.
 * Learner shares (the page's own share button), pastes their post link here, gets +4 weeks.
 * `kind` just tags what they shared; the backend grants the same bonus either way.
 */
export function ExtendAccessCard({ kind }: { kind: "badge" | "certificate" }) {
  const { user, setUser } = useAuth();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const claimed = user.linkedinShareClaimed;
  const expires = formatDate(user.accessExpiresOn);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const updated = await authApi.linkedinShare({ kind, url: url.trim() });
      setUser(updated); // refresh expiry + claimed flag everywhere
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify that link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex gap-4">
      <span className="w-10 h-10 shrink-0 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center">
        <Icon name="linkedin" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-semibold tracking-tight text-slate-900">Extend your access</h3>

        {claimed ? (
          <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-emerald-700 tracking-tight">
            <Icon name="check" size={14} strokeWidth={2.5} /> +4 weeks added — thanks for sharing on LinkedIn.
            {expires && <span className="text-slate-400">Access until {expires}.</span>}
          </p>
        ) : (
          <>
            <p className="mt-1 text-[12px] text-slate-500 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>
              Share your {kind} on LinkedIn, then paste the post link below to add{" "}
              <span className="font-medium text-slate-700">4 weeks</span> to your access.
              {expires && <> Currently active until <span className="font-medium text-slate-700">{expires}</span>.</>}
            </p>
            <form onSubmit={submit} className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/…"
                className="flex-1 min-w-[220px] h-9 px-3 rounded-lg bg-white ring-1 ring-slate-200 text-[12.5px] tracking-tight text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <button
                type="submit"
                disabled={busy || !url.trim()}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-sky-600 text-white text-[12.5px] font-medium tracking-tight hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Icon name="calendar" size={14} /> {busy ? "Adding…" : "Add 4 weeks"}
              </button>
            </form>
            {error && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-rose-600 tracking-tight">
                <Icon name="alertTriangle" size={13} /> {error}
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
