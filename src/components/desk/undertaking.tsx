"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mr_Dafoe } from "next/font/google";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { press } from "./ui";
import { attestKey, same, type Attest } from "@/lib/desk/forms";
import { dmy, type Task } from "@/lib/desk/model";

/** A signed record's date is its UTC date, as its time is UTC: "22-OCT-2026" from the ISO stamp. */
const signedOn = (at: string) => dmy(new Date(`${at.slice(0, 10)}T12:00:00`));

// The signature's hand. Loaded here, not in the root layout: only this sheet writes in it.
const hand = Mr_Dafoe({ weight: "400", subsets: ["latin"], display: "swap" });

/**
 * The undertaking a mentee signs on joining, as the document a new joiner is handed on their first
 * day: letterhead, reference, the clauses, why it is signed, and a signature block. Every line of
 * content is the pack's (see ATTEST in lib/desk/forms.ts for the clauses and their sources); the
 * reasons are F1.1's "Why is this important", word for word in substance.
 *
 * Signing is final. It records name, mentee ID and the UTC time under ADM-UND, which is what
 * "Platform e-signature" means in the pack, and the step's Mark complete waits for it.
 */
export function UndertakingCard({ task, a, readOnly, waiting }: {
  task: Task;
  a: Attest;
  readOnly: boolean;
  /** Why it cannot be opened yet (a form before it is not saved); it opens when this is undefined. */
  waiting?: string;
}) {
  const { progress } = useDesk();
  const g = progress.grids?.[attestKey(task.id, a.code)] ?? {};
  const [open, setOpen] = useState(false);
  const signed = !!g.at;
  return (
    <>
      <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded border border-[#DDE1E8] bg-white p-3">
        <span className="grid h-11 w-9 shrink-0 place-items-center rounded-[3px] border border-[#DDE1E8] bg-[#F7F8FA] text-[#3F4757]">
          <Icon name="file" size={16} />
        </span>
        <span className="min-w-[12rem] flex-1">
          <span className="block text-[14px] font-semibold text-[#111827]">Mentee Undertaking</span>
          <span className="block font-mono text-[12px] text-[#5B6474]">{a.code} · from the BKB Group GRC Office</span>
          {waiting && !signed && <span className="mt-0.5 block text-[12px] text-[#5B6474]">{waiting}</span>}
        </span>
        {signed ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
            <Icon name="checkCircle" size={15} /> Signed {signedOn(g.at)}
          </span>
        ) : (
          <span className="rounded-[3px] border border-[#F2D29B] bg-[#FFF4DE] px-1.5 py-0.5 text-[12px] font-semibold text-[#92400E]">To sign</span>
        )}
        <button
          type="button"
          disabled={!!waiting && !signed}
          onClick={() => setOpen(true)}
          className={`disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] inline-flex h-9 items-center gap-1.5 rounded px-4 text-[13px] font-semibold ${press} ${
            signed ? "border border-[#DDE1E8] bg-white text-[#3F4757] hover:border-[#C9CED8]" : "bg-[#4338CA] text-white hover:brightness-90"
          }`}
        >
          {signed ? "View signed copy" : "Open and sign"}
        </button>
      </div>
      {open && <UndertakingSheet task={task} a={a} readOnly={readOnly} onClose={() => setOpen(false)} />}
    </>
  );
}

function UndertakingSheet({ task, a, readOnly, onClose }: { task: Task; a: Attest; readOnly: boolean; onClose: () => void }) {
  const { desk, progress, update } = useDesk();
  const k = attestKey(task.id, a.code);
  const g = progress.grids?.[k] ?? {};
  const set = (patch: Record<string, string>) => update((p) => ({ ...p, grids: { ...p.grids, [k]: { ...(p.grids?.[k] ?? {}), ...patch } } }));
  const signed = !!g.at;
  const lock = readOnly || signed;
  const name = (g.name ?? "").trim();
  // Full name: first and last. The mentee ID is checked against the one the platform gave.
  const nameOk = name.split(/\s+/).filter(Boolean).length >= 2;
  const idOff = !!g.id?.trim() && !same(g.id, desk.mentee);
  // The signature: drawn in the box (mouse, finger or pen), or typed in the signature hand for anyone
  // who cannot draw. A drawn one is kept as the image it is.
  const [how, setHow] = useState<"draw" | "type">("draw");
  const [ink, setInk] = useState<string | null>(null);
  const ready = nameOk && !!g.id?.trim() && !idOff && (how === "type" || !!ink);
  // Pointing at the mentee ID in the address: lit while its box is in use, flashed on "Show me".
  const idRef = useRef<HTMLElement>(null);
  const [idFocus, setIdFocus] = useState(false);
  const [flash, setFlash] = useState(0);
  const showId = () => {
    idRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash((f) => f + 1);
  };
  const date = signedOn(signed ? g.at : new Date().toISOString());
  // The pen stroke and the stamp play once, as it is signed; reopening the signed copy shows them still.
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const field = "block min-h-[38px] w-full border-0 border-b border-[#9CA3AF] bg-transparent px-0 py-1.5 text-[14px] text-[#111827] outline-none focus:border-[#4338CA] disabled:text-[#3F4757]";
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Mentee Undertaking" className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-[rgba(17,24,39,0.55)] p-3 sm:p-8">
      <article className="relative w-full max-w-[720px] bg-white px-6 py-7 text-[#111827] shadow-[0_24px_64px_-20px_rgba(17,24,39,0.6)] sm:px-12 sm:py-10">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded text-[#5B6474] hover:bg-[#F3F4F7] focus-ring">
          <Icon name="x" size={16} />
        </button>

        {/* Letterhead */}
        <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#111827] pb-3 pr-8 sm:pr-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6474]">BKB Group</p>
            <p className="text-[15px] font-semibold">Group GRC Office</p>
          </div>
          <dl className="grid grid-cols-[auto_auto] gap-x-3 font-mono text-[11.5px] text-[#3F4757]">
            <dt className="text-[#8A91A3]">Ref</dt><dd>{a.code} · {task.id}</dd>
            <dt className="text-[#8A91A3]">Date</dt><dd>{date}</dd>
          </dl>
        </header>

        {/* Addressed to the mentee, as a joining letter is: the ID the signature block asks for is
            here, on the letter itself, since nothing behind the sheet can be reached while it is open. */}
        <p className="mt-4 text-[13px] text-[#3F4757]">
          To: Mentee{" "}
          <mark
            key={flash}
            ref={idRef}
            className={`rounded-[3px] bg-[#FEF3C7] px-1.5 py-0.5 font-mono font-semibold text-[#111827] ring-2 transition-shadow ${
              idFocus || flash ? "ring-[#F59E0B]" : "ring-transparent"
            } ${flash ? "motion-safe:animate-[idFlash_1.2s_ease-out]" : ""}`}
          >
            {desk.mentee}
          </mark>{" "}
          · GRC 101
        </p>

        <h2 className="mt-5 font-[family-name:var(--font-cormorant)] text-[34px] font-semibold leading-tight">Mentee Undertaking</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#3F4757]">
          On joining the Group GRC Office as a GRC 101 mentee, under BKB-POL-024 Section 3.1, I undertake that:
        </p>

        <ol className="mt-5 grid gap-3">
          {a.items.map((t, i) => (
            <li key={t} className="grid grid-cols-[28px_1fr] text-[15px] leading-relaxed">
              <span className="font-mono text-[13px] leading-[1.75] text-[#8A91A3]">{i + 1}.</span>
              {t}
            </li>
          ))}
        </ol>

        <section aria-label="Why you sign" className="mt-6 border-l-2 border-[#C7CBF5] pl-4 text-[13.5px] leading-relaxed text-[#3F4757]">
          <p>Without a signed undertaking your account is not opened for data (BKB-POL-024 Section 6.1 step 3).</p>
          <p className="mt-1">A confirmed conduct breach later is an automatic fail (BKB-MEN-101 Section 13.2).</p>
        </section>

        {/* Signature block */}
        <section aria-label="Signature" className="relative mt-9 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[11.5px] uppercase tracking-[0.08em] text-[#5B6474]">Signature</p>
              {!lock && (
                <button type="button" onClick={() => { setHow(how === "draw" ? "type" : "draw"); setInk(null); }} className="text-[12px] font-medium text-[#3730A3] underline-offset-2 hover:underline focus-ring">
                  {how === "draw" ? "Type instead" : "Draw instead"}
                </button>
              )}
            </div>
            <div className={`relative mt-1 h-[120px] rounded-[3px] ${lock ? "" : "border border-dashed border-[#C9CED8] bg-[#FAFAFC]"}`}>
              {signed && g.sig ? (
                // eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn on this page; nothing to optimise or load
                <img
                  src={g.sig}
                  alt={`Signature of ${g.name}`}
                  className={`absolute inset-0 h-full w-full object-contain object-left ${fresh ? "motion-safe:animate-[signWrite_900ms_cubic-bezier(0.65,0,0.35,1)]" : ""}`}
                />
              ) : signed || how === "type" ? (
                // Typed: the name in the signature hand, faint while it is a preview, written in on Sign.
                <span
                  aria-hidden
                  className={`${hand.className} absolute bottom-3 left-3 whitespace-nowrap text-[40px] leading-none ${
                    signed ? `text-[#1E1B4B] ${fresh ? "motion-safe:animate-[signWrite_900ms_cubic-bezier(0.65,0,0.35,1)]" : ""}` : "text-[#9CA3AF] opacity-70"
                  }`}
                >
                  {name || "Your name"}
                </span>
              ) : (
                <SignaturePad onInk={setInk} />
              )}
              <span className="pointer-events-none absolute inset-x-3 bottom-3 border-b border-[#111827]" aria-hidden />
            </div>
            <p className="mt-4 grid gap-0.5 text-[11.5px] uppercase tracking-[0.08em] text-[#5B6474]">
              Date
              <span className="border-b border-[#9CA3AF] py-1.5 font-mono text-[14px] normal-case tracking-normal text-[#111827]">{date}</span>
            </p>
          </div>
          <div className="grid content-end gap-4">
            <label className="grid gap-0.5 text-[11.5px] uppercase tracking-[0.08em] text-[#5B6474]">
              Full name
              <input value={g.name ?? ""} disabled={lock} onChange={(e) => set({ name: e.target.value })} autoComplete="name" placeholder="First and last name" className={`${field} font-sans normal-case tracking-normal placeholder:text-[#9CA3AF]`} />
            </label>
            <label className="grid gap-0.5 text-[11.5px] uppercase tracking-[0.08em] text-[#5B6474]">
              Mentee ID
              <input
                value={g.id ?? ""}
                disabled={lock}
                onChange={(e) => set({ id: e.target.value })}
                onFocus={() => setIdFocus(true)}
                onBlur={() => setIdFocus(false)}
                aria-invalid={idOff}
                placeholder="As addressed above"
                className={`${field} font-mono normal-case tracking-normal placeholder:font-sans placeholder:text-[#9CA3AF]`}
              />
              {!lock && (
                <span className={`flex items-start gap-1.5 font-sans normal-case leading-snug tracking-normal text-[12px] ${idOff ? "text-[#92400E]" : "text-[#5B6474]"}`}>
                  <Icon name="arrowLeft" size={12} className="mt-[3px] shrink-0 rotate-90" />
                  <span>
                    {idOff ? "Not your mentee ID. Copy the one highlighted in the address." : "Copy it from the address at the top, highlighted."}{" "}
                    <button type="button" onClick={showId} className="font-semibold text-[#3730A3] underline-offset-2 hover:underline focus-ring">Show me</button>
                  </span>
                </span>
              )}
            </label>
          </div>
          {signed && (
            <p
              aria-label="Signed electronically"
              className={`pointer-events-none absolute -top-2 left-[30%] rotate-[-6deg] sm:left-[24%] rounded border-2 border-[#4338CA] px-3 py-1.5 text-center font-mono text-[11px] font-semibold uppercase leading-snug tracking-[0.08em] text-[#4338CA] opacity-90 ${fresh ? "motion-safe:animate-[stampIn_420ms_900ms_cubic-bezier(0.23,1,0.32,1)_both]" : ""}`}
            >
              Signed electronically
              <br />
              {g.at.replace("T", " ").slice(0, 16)} UTC
            </p>
          )}
        </section>

        <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#DDE1E8] pt-4">
          <p className="text-[12.5px] text-[#5B6474]">
            Platform e-signature. A signed copy is kept in <span className="font-mono">/{desk.mentee}/00_Admin</span>.
          </p>
          {signed ? (
            <button type="button" onClick={onClose} className={`h-10 rounded bg-[#111827] px-5 text-[14px] font-semibold text-white hover:brightness-110 ${press}`}>
              Close
            </button>
          ) : (
            <button
              type="button"
              disabled={lock || !ready}
              onClick={() => { setFresh(true); set({ name, at: new Date().toISOString(), ...(how === "draw" && ink ? { sig: ink } : {}) }); }}
              className={`h-10 rounded bg-[#4338CA] px-5 text-[14px] font-semibold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
            >
              Sign
            </button>
          )}
        </footer>
        {!signed && <p className="mt-2 text-right text-[12px] text-[#5B6474]">Signing is final: it is your record that you know the rules.</p>}
      </article>
    </div>,
    document.body,
  );
}

/**
 * A box to sign in with a mouse, a finger or a pen. Reports the drawing as a PNG once there is enough
 * of it to be a signature (a tap or a short tick is not), and null when cleared.
 *
 * Measured in the canvas's own pixels at the device's density, from the box's on-screen size each
 * time, so the stroke lands under the pointer whatever the page's zoom.
 */
function SignaturePad({ onInk }: { onInk: (png: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const drawn = useRef(0); // length of ink so far, in on-screen pixels
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1E1B4B";
    ctx.lineWidth = 2.4 * (c.width / r.width);
  }, []);

  const at = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height, k: r.width / c.width };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = at(e);
    last.current = p;
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#1E1B4B";
    ctx.fill();
    setEmpty(false);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const from = last.current;
    if (!from) return;
    const p = at(e);
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    drawn.current += Math.hypot(p.x - from.x, p.y - from.y) * p.k;
    last.current = p;
  };
  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    last.current = null;
    onInk(drawn.current > 40 ? e.currentTarget.toDataURL("image/png") : null);
  };
  const clear = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    drawn.current = 0;
    setEmpty(true);
    onInk(null);
  };

  return (
    <>
      <canvas
        ref={ref}
        aria-label="Signature box: draw your signature"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
      />
      {empty ? (
        <span className="pointer-events-none absolute left-3 top-2.5 text-[12.5px] text-[#9CA3AF]">Sign here with your mouse, finger or pen</span>
      ) : (
        <button type="button" onClick={clear} className="absolute right-2 top-2 rounded border border-[#DDE1E8] bg-white px-2 py-0.5 text-[12px] font-medium text-[#3F4757] hover:border-[#C9CED8] focus-ring">
          Clear
        </button>
      )}
    </>
  );
}
