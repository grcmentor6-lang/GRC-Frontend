"use client";

import { useEffect, useRef, useState } from "react";
import { BADGES, CAPSTONE, isEarned, type BadgeState, type MethodBadge } from "@/lib/desk/badges";
import { useAuth } from "@/components/auth/auth-provider";
import { MethodMedal } from "./method-medal";
import { useMethodBadges } from "./use-method-badges";

/**
 * The moment a method badge is earned (owner, 24 Nov 2026): the medal comes in small, spins up to full size, lands,
 * and confetti bursts from behind it. Seen once per badge, so it is the one place the desk spends motion on delight.
 *
 * Its own keyframes, transform and opacity only, so it stays smooth while the desk loads behind it. Under reduced
 * motion the medal fades in and nothing moves.
 */
const CSS = `
@keyframes brGrow{0%{opacity:0;transform:scale(.18)}18%{opacity:1}62%{transform:scale(1.1)}80%{transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
@keyframes brSpin{from{transform:rotateY(-900deg)}to{transform:rotateY(0deg)}}
@keyframes brGlow{0%{opacity:0;transform:scale(.4)}55%{opacity:.9}100%{opacity:.55;transform:scale(1)}}
@keyframes brRays{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes brBurst{0%{opacity:0;transform:translate3d(0,0,0) rotate(0deg) scale(.6)}8%{opacity:1}70%{opacity:1}100%{opacity:0;transform:translate3d(var(--x),var(--y),0) rotate(var(--r)) scale(1)}}
@keyframes brUp{from{opacity:0;transform:translate3d(0,10px,0)}to{opacity:1;transform:none}}
@keyframes brFade{from{opacity:0}to{opacity:1}}
.br-scrim{animation:brFade 200ms cubic-bezier(.23,1,.32,1) both}
.br-grow{animation:brGrow 1150ms cubic-bezier(.23,1,.32,1) both}
.br-spin{animation:brSpin 1150ms cubic-bezier(.23,1,.32,1) both}
.br-glow{animation:brGlow 1100ms cubic-bezier(.23,1,.32,1) 250ms both}
.br-rays{animation:brRays 14s linear infinite}
.br-piece{animation:brBurst var(--d) cubic-bezier(.23,1,.32,1) var(--w) both}
.br-up{animation:brUp 320ms cubic-bezier(.23,1,.32,1) both}
@media (prefers-reduced-motion: reduce){
  .br-grow,.br-up{animation:brFade 200ms ease both}
  .br-spin,.br-rays,.br-glow{animation:none}
  .br-piece{display:none}
}`;

const PIECES = 44;

export function BadgeReveal({ badge, state, onClose }: { badge: MethodBadge; state: BadgeState; onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  const hues = [`#${badge.colour}`, "#D4AF37", "#F59E0B", "#16A34A", "#0EA5E9", "#DB2777"];
  return (
    <div role="dialog" aria-modal="true" aria-label={`Badge earned: ${badge.name}`} data-badge-reveal={badge.code} className="br-scrim fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#0B1020]/[0.93] p-4" onClick={onClose}>
      <style>{CSS}</style>
      <div className="grid max-w-[420px] justify-items-center text-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative grid h-[260px] w-[260px] place-items-center">
          {/* The light behind the medal: a soft disc, and slow rays in the badge's colour. */}
          <span aria-hidden className="br-glow absolute inset-0 rounded-full" style={{ background: `radial-gradient(closest-side, #${badge.colour}66, #${badge.colour}00)` }} />
          <span aria-hidden className="br-glow absolute inset-[-40px]">
            <span className="br-rays absolute inset-0 rounded-full" style={{ background: `repeating-conic-gradient(from 0deg, #${badge.colour}2E 0deg 9deg, transparent 9deg 22deg)`, maskImage: "radial-gradient(closest-side, #000 30%, transparent 78%)", WebkitMaskImage: "radial-gradient(closest-side, #000 30%, transparent 78%)" }} />
          </span>
          {/* The burst leaves from the medal's centre as it lands. */}
          <span aria-hidden className="absolute left-1/2 top-1/2">
            {Array.from({ length: PIECES }, (_, i) => {
              const a = (i / PIECES) * Math.PI * 2 + (i % 3) * 0.21;
              const far = 150 + ((i * 53) % 150);
              return (
                <span
                  key={i}
                  className="br-piece absolute block rounded-[1px]"
                  style={{
                    width: i % 3 === 0 ? 10 : 6,
                    height: i % 3 === 0 ? 6 : 11,
                    background: hues[i % hues.length],
                    ["--x" as string]: `${Math.round(Math.cos(a) * far)}px`,
                    // Pieces fall a little as they fly: the burst reads as thrown, not as a ring.
                    ["--y" as string]: `${Math.round(Math.sin(a) * far + 70)}px`,
                    ["--r" as string]: `${(i % 2 ? 1 : -1) * (360 + (i % 5) * 90)}deg`,
                    ["--d" as string]: `${1100 + (i % 6) * 110}ms`,
                    ["--w" as string]: `${680 + (i % 7) * 18}ms`,
                  }}
                />
              );
            })}
          </span>
          <span className="br-grow relative block" style={{ perspective: 900 }}>
            <span className="br-spin block drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]">
              <MethodMedal badge={badge} state={state} size={176} />
            </span>
          </span>
        </div>
        <p className="br-up mt-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#F5D97A]" style={{ animationDelay: "820ms" }}>
          {state === "distinction" ? "Badge earned with distinction" : "Badge earned"}
        </p>
        <h2 className="br-up mt-1.5 text-[26px] font-semibold leading-tight text-white" style={{ animationDelay: "900ms" }}>{badge.name}</h2>
        <p className="br-up mt-2 text-[14px] leading-[1.55] text-[#C9D1E3]" style={{ animationDelay: "980ms" }}>{badge.can}</p>
        <button ref={btn} type="button" onClick={onClose} className="br-up mt-5 h-10 rounded-lg bg-white px-6 text-[13.5px] font-semibold text-[#111827] transition-transform duration-150 ease-out hover:bg-[#F3F4F6] active:scale-[0.97] focus-ring" style={{ animationDelay: "1080ms" }}>
          Continue
        </button>
      </div>
    </div>
  );
}

const SHOW = "grc101:badge-reveal";
/** Play a badge's reveal again (the Badges page: click a medal you hold). */
export const replayBadge = (code: string) => window.dispatchEvent(new CustomEvent(SHOW, { detail: code }));

const byCode = (code: string) => [...BADGES, CAPSTONE].find((b) => b.code === code);

/**
 * Mounted once in the app shell: shows the reveal when a badge the learner did not hold the last time this browser
 * looked is now earned, one after another if several landed together. The badges held on the first look are noted
 * without a reveal, so an existing account is not walked through badges it earned weeks ago.
 * `?reveal=BDG-C2` plays any badge, for a look at the animation.
 */
export function BadgeRevealWatcher() {
  const { user } = useAuth();
  const sum = useMethodBadges();
  const [queue, setQueue] = useState<{ code: string; state: BadgeState }[]>([]);

  useEffect(() => {
    const ask = new URLSearchParams(window.location.search).get("reveal");
    const show = (code: string) => byCode(code) && setQueue((q) => [...q, { code, state: "earned" }]);
    if (ask) show(ask);
    const on = (e: Event) => show((e as CustomEvent<string>).detail);
    window.addEventListener(SHOW, on);
    return () => window.removeEventListener(SHOW, on);
  }, []);

  useEffect(() => {
    if (!sum || !user?.email) return;
    const key = `grc101.badges-seen:${user.email}`;
    const held = [...sum.rows.filter((r) => isEarned(r.g)).map((r) => ({ code: r.b.code, state: r.g.state })), ...(isEarned(sum.capstone) ? [{ code: CAPSTONE.code, state: sum.capstone.state }] : [])];
    try {
      const raw = localStorage.getItem(key);
      const seen: string[] = raw ? JSON.parse(raw) : held.map((h) => h.code);
      const fresh = held.filter((h) => !seen.includes(h.code));
      localStorage.setItem(key, JSON.stringify([...seen, ...fresh.map((h) => h.code)]));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read from localStorage, which only exists after mount
      if (fresh.length) setQueue((q) => [...q, ...fresh]);
    } catch {
      /* No storage: no reveal, and nothing else changes. */
    }
  }, [sum, user?.email]);

  const now = queue[0];
  const badge = now && byCode(now.code);
  if (!badge) return null;
  return <BadgeReveal key={`${now.code}-${queue.length}`} badge={badge} state={now.state} onClose={() => setQueue((q) => q.slice(1))} />;
}
