import type { Certificate } from "@/lib/certificate";

const SERIF = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

/** Wax-style gold seal. */
function Seal() {
  return (
    <div className="relative flex flex-col items-center" style={{ width: 132 }}>
      <div className="absolute" style={{ top: 78, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10 }}>
        <div style={{ width: 26, height: 64, transform: "rotate(-10deg)", background: "linear-gradient(180deg,#4f46e5,#312e81)", clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)" }} />
        <div style={{ width: 26, height: 64, transform: "rotate(10deg)", background: "linear-gradient(180deg,#4f46e5,#312e81)", clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)" }} />
      </div>
      <div className="relative" style={{ width: 118, height: 118, zIndex: 2 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 38% 32%, #F4D98B, #D4A93F 55%, #A9781F 100%)", boxShadow: "0 6px 18px -4px rgba(169,120,31,0.55), inset 0 1px 2px rgba(255,255,255,0.6)" }} />
        <div className="absolute rounded-full" style={{ inset: 7, border: "1.5px dashed rgba(255,255,255,0.6)" }} />
        <div className="absolute rounded-full flex flex-col items-center justify-center text-center" style={{ inset: 13, background: "radial-gradient(circle at 40% 30%, #fffdf7, #f6edd6)", boxShadow: "inset 0 1px 3px rgba(169,120,31,0.35)" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1, color: "#7c5a16", marginTop: 2 }}>G</span>
          <span style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "#9a7320", marginTop: 1, fontWeight: 600 }}>CERTIFIED</span>
          <span style={{ fontSize: 7, letterSpacing: "0.12em", color: "#b08a3a", marginTop: 1 }}>EST. 2026</span>
        </div>
      </div>
    </div>
  );
}

/** Deterministic QR-style verification matrix seeded from the credential id. */
function FauxQR({ seed, size = 54 }: { seed: string; size?: number }) {
  const n = 21;
  const cell = size / n;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rng = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const inFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const mods: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (inFinder(r, c)) continue; if (rng() > 0.52) mods.push([r, c]); }
  const Finder = ({ r, c }: { r: number; c: number }) => (
    <div style={{ position: "absolute", left: c * cell, top: r * cell, width: cell * 7, height: cell * 7 }}>
      <div style={{ position: "absolute", inset: 0, border: `${cell}px solid #1e1b3a` }} />
      <div style={{ position: "absolute", inset: cell * 2, background: "#1e1b3a" }} />
    </div>
  );
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {mods.map(([r, c], i) => (
        <div key={i} style={{ position: "absolute", left: c * cell, top: r * cell, width: cell + 0.4, height: cell + 0.4, background: "#1e1b3a" }} />
      ))}
      <Finder r={0} c={0} /><Finder r={0} c={n - 7} /><Finder r={n - 7} c={0} />
    </div>
  );
}

export interface CertStat { value: string; label: string }

/**
 * The certificate document. Fixed 1000px design width — the caller scales it to fit.
 * `preview` watermarks the sheet when the credential has not yet been issued.
 */
export function CertificateSheet({
  cert,
  stats,
  preview = false,
}: {
  cert: Pick<Certificate, "eyebrow" | "programTitle" | "blurb" | "recipient" | "standards" | "credentialId" | "verifyUrl" | "issueDate" | "mentor" | "issuer">;
  stats: CertStat[];
  preview?: boolean;
}) {
  const credentialId = cert.credentialId ?? "— pending completion —";
  const verifyUrl = cert.verifyUrl ?? "issued at 100% completion";
  return (
    <div id="cert-sheet" className="relative" style={{ width: 1000, background: "#FCFBF6", fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(1200px 500px at 50% -10%, rgba(79,70,229,0.05), transparent 60%), radial-gradient(800px 500px at 50% 120%, rgba(201,154,63,0.06), transparent 60%)" }} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" style={{ opacity: 0.035 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 460, color: "#312e81", lineHeight: 1 }}>G</span>
      </div>
      {preview && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" style={{ transform: "rotate(-24deg)" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, letterSpacing: "0.1em", color: "rgba(49,46,129,0.06)" }}>PREVIEW</span>
        </div>
      )}

      <div className="absolute" style={{ inset: 18, border: "2px solid #312e81" }} />
      <div className="absolute" style={{ inset: 25, border: "1px solid #C99A3F" }} />
      {([["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]] as const).map(([v, hh], i) => (
        <div key={i} className="absolute" style={{ [v]: 18, [hh]: 18, width: 14, height: 14, transform: `translate(${hh === "left" ? "-50%" : "50%"},${v === "top" ? "-50%" : "50%"}) rotate(45deg)`, background: "linear-gradient(135deg,#E8C77A,#B8860B)" } as React.CSSProperties} />
      ))}

      <div className="relative flex flex-col items-center text-center" style={{ padding: "58px 76px 46px" }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
          <span className="inline-flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontFamily: MONO, fontWeight: 600, fontSize: 13 }}>G</span>
          <span style={{ fontSize: 11, letterSpacing: "0.34em", textTransform: "uppercase", color: "#6b6680", fontWeight: 600 }}>grcmentor</span>
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 40, lineHeight: 1.05, color: "#1e1b3a", letterSpacing: "0.01em" }}>Certificate of Completion</div>
        <div className="flex items-center justify-center gap-3" style={{ marginTop: 12, marginBottom: 18 }}>
          <span style={{ height: 1, width: 56, background: "linear-gradient(90deg,transparent,#C99A3F)" }} />
          <span style={{ fontSize: 10.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "#9a7320", fontWeight: 600 }}>{cert.eyebrow}</span>
          <span style={{ height: 1, width: 56, background: "linear-gradient(90deg,#C99A3F,transparent)" }} />
        </div>

        <div style={{ fontSize: 12.5, letterSpacing: "0.06em", color: "#6b6680" }}>This is to certify that</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 58, lineHeight: 1.1, color: "#312e81", margin: "6px 0 4px" }}>{cert.recipient}</div>
        <div style={{ width: 280, height: 1, background: "linear-gradient(90deg,transparent,#C99A3F,transparent)", marginBottom: 16 }} />

        <p style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.7, color: "#3a3647" }}>
          has successfully completed the <span style={{ fontWeight: 600, color: "#1e1b3a" }}>{cert.programTitle}</span>, {cert.blurb}
        </p>

        <div className="flex items-stretch justify-center" style={{ gap: 0, marginTop: 22 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center" style={{ padding: "0 22px", borderLeft: i ? "1px solid rgba(49,46,129,0.14)" : "none" }}>
              <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 28, color: "#4f46e5", lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6680", marginTop: 5 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {cert.standards.length > 0 && (
          <div className="flex items-center justify-center flex-wrap" style={{ gap: 7, marginTop: 22 }}>
            {cert.standards.map((s) => (
              <span key={s} style={{ fontSize: 10, letterSpacing: "0.02em", color: "#4a4660", border: "1px solid rgba(201,154,63,0.5)", background: "rgba(201,154,63,0.07)", borderRadius: 999, padding: "3px 10px", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        )}

        <div className="w-full flex items-end justify-between" style={{ marginTop: 34 }}>
          <div className="flex flex-col items-center" style={{ width: 210 }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: "#312e81", lineHeight: 1 }}>{cert.mentor.name}</span>
            <span style={{ height: 1, width: "100%", background: "#312e81", opacity: 0.35, margin: "8px 0 6px" }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "#1e1b3a", letterSpacing: "0.04em" }}>{cert.mentor.name}</span>
            <span style={{ fontSize: 9, color: "#6b6680", marginTop: 1 }}>{cert.mentor.title}</span>
          </div>

          <div className="flex flex-col items-center" style={{ marginBottom: 2 }}>
            <Seal />
            <div className="flex items-center gap-2.5" style={{ marginTop: 16 }}>
              <FauxQR seed={credentialId} size={54} />
              <div className="text-left">
                <div style={{ fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a7320", fontWeight: 600 }}>Credential ID</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "#3a3647", marginTop: 1 }}>{credentialId}</div>
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#6b6680", marginTop: 2 }}>{verifyUrl}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center" style={{ width: 210 }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: "#312e81", lineHeight: 1 }}>{cert.issuer.name}</span>
            <span style={{ height: 1, width: "100%", background: "#312e81", opacity: 0.35, margin: "8px 0 6px" }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "#1e1b3a", letterSpacing: "0.04em" }}>{cert.issuer.name}</span>
            <span style={{ fontSize: 9, color: "#6b6680", marginTop: 1 }}>{cert.issuer.title}</span>
          </div>
        </div>

        <div style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9a7320", marginTop: 22 }}>
          {cert.issueDate ? `Issued ${cert.issueDate}` : "Issued on completion"}
        </div>
      </div>
    </div>
  );
}

export { Seal, FauxQR };
