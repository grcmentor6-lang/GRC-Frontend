/**
 * Organisation logos: a monogram on a round, sector-coloured badge.
 *
 * Replaces the per-org line-art glyphs, which were keyed by ids (`cloudtech`, `atlas`) from a
 * catalogue that no longer exists — every one of the seventeen real organisations was falling
 * through to a plain initials square. Keyed now by the id `/me/learnings` actually returns
 * (`org-<ref>`), with the monogram a person would read off a letterhead rather than the seed's
 * three-letter reference.
 *
 * Colours are grouped by sector, so a glance at the dock says what kind of client each is: blues
 * and cyans for cloud and telecom, amber and bronze for legal, greens for finance and payroll,
 * violets for education, pinks and reds for media and customer operations.
 */
const BRAND: Record<string, { ini: string; from: string; to: string }> = {
  "org-ct": { ini: "CT", from: "#38bdf8", to: "#0369a1" },
  "org-ax": { ini: "AS", from: "#818cf8", to: "#3730a3" },
  "org-mru": { ini: "MR", from: "#a78bfa", to: "#5b21b6" },
  "org-lt": { ini: "LT", from: "#c084fc", to: "#7e22ce" },
  "org-amn": { ini: "AM", from: "#fb7185", to: "#be123c" },
  "org-gc": { ini: "GC", from: "#f472b6", to: "#9d174d" },
  "org-ess": { ini: "ES", from: "#94a3b8", to: "#334155" },
  "org-sac": { ini: "SA", from: "#6b8afd", to: "#1e3a8a" },
  "org-aci": { ini: "ACI", from: "#22d3ee", to: "#0e7490" },
  "org-dvc": { ini: "DV", from: "#2dd4bf", to: "#0f766e" },
  "org-jwl": { ini: "JW", from: "#fbbf24", to: "#c2410c" },
  "org-npp": { ini: "NP", from: "#34d399", to: "#047857" },
  "org-nnc": { ini: "NN", from: "#60a5fa", to: "#1d4ed8" },
  "org-pap": { ini: "PA", from: "#86c940", to: "#3f6212" },
  "org-sal": { ini: "S&A", from: "#d4a15a", to: "#7c4a14" },
  "org-tms": { ini: "TF", from: "#e879f9", to: "#a21caf" },
  "org-uts": { ini: "UT", from: "#f87171", to: "#b91c1c" },
};

/** An organisation we have no brand for still gets a badge, in the programme's own indigo. */
const FALLBACK = { from: "#8b7cf8", to: "#5b4fe9" };

export interface OrgLogoProps {
  org: { id: string; initials: string; tone: string; status?: string };
  /** Box classes — size, and type size if wanted. The badge is always round; rounding classes
   *  passed here are ignored so every caller draws the same mark. */
  className?: string;
  /** Monogram size in px. */
  iconSize?: number;
}

export function OrgLogo({ org, className = "w-11 h-11", iconSize = 22 }: OrgLogoProps) {
  const brand = BRAND[org.id];
  const ini = brand?.ini ?? org.initials;
  const { from, to } = brand ?? FALLBACK;
  const locked = org.status === "locked" || org.status === "upcoming";
  const long = ini.length > 2;

  return (
    <div
      aria-hidden
      className={`grid shrink-0 place-items-center ${className.replace(/\brounded(-\S+)?/g, "")} rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.18),inset_0_-3px_5px_rgba(0,0,0,.12)] ${locked ? "opacity-50 grayscale" : ""}`}
      style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
        {ini === "S&A" ? (
          <text x="12" y="15.4" textAnchor="middle" fontSize="9.4" fontWeight="700" fill="#fff" letterSpacing="-.3">
            S<tspan fontSize="7" fontWeight="600" fillOpacity=".8" dy="-.4">&amp;</tspan><tspan dy=".4">A</tspan>
          </text>
        ) : (
          <text
            x="12"
            y={long ? 15.2 : 15.8}
            textAnchor="middle"
            fontSize={long ? 8.6 : 10.6}
            fontWeight="700"
            fill="#fff"
            letterSpacing={long ? -0.4 : -0.5}
          >
            {ini}
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * The badge for an organisation known only by name (the GRC 101 desk content): its letterhead
 * monogram, "GlobalConnect Customer Solutions" → GC, "Atlas Systems" → AS, and the sector colour
 * of the brand that carries that monogram.
 */
export function logoFor(name: string): OrgLogoProps["org"] {
  const words = name.split(/\s+/);
  const caps = (words[0].match(/[A-Z]/g) ?? []).join("");
  const initials = caps.length >= 2 ? caps.slice(0, 2) : words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  const id = Object.keys(BRAND).find((k) => BRAND[k].ini === initials) ?? `name-${initials}`;
  return { id, initials, tone: "" };
}
