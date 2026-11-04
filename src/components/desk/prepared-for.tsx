"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useDeskIdentity } from "@/lib/desk/identity";

/**
 * "Prepared for Asha Rao · M2610-00001": the line a firm prints in a document's footer band, on every desk window the
 * learner reads or works in (owner, 3 Nov 2026). Everyone works the same desk; this says whose copy it is, so a
 * screenshot or a leaked answer sheet shows whose it was. Chrome, not content: a hairline-topped row in normal flow at
 * the foot of the window, mute, one line, truncating. Never floats over the page (tests read text with elementFromPoint).
 * Mute ink on white, no new hue or border style: it carries no authority and no status, only provenance.
 */
export function PreparedFor({ className = "pl-3" }: { className?: string }) {
  const { user } = useAuth();
  const { menteeId } = useDeskIdentity();
  const name = [user?.firstName, user?.lastName].map((s) => s?.trim()).filter(Boolean).join(" ");
  const text = name ? `Prepared for ${name} · ${menteeId}` : `Prepared for ${menteeId}`;
  // A long name gives way first; the ID, which is what identifies a leaked copy, always shows whole.
  return (
    <p data-prepared-for title={text} className={`flex shrink-0 whitespace-nowrap border-t border-[#DDE1E8] py-1 pr-6 text-[11px] leading-4 text-[#5B6474] ${className}`}>
      <span className="min-w-0 truncate">Prepared for&nbsp;{name}{name && <span className="text-[#8A91A3]">&nbsp;·&nbsp;</span>}</span>
      <span className="shrink-0 font-mono tabular-nums">{menteeId}</span>
    </p>
  );
}
