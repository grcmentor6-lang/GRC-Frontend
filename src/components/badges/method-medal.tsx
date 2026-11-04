import { ICONS, shade, type BadgeState, type MethodBadge } from "@/lib/desk/badges";

/**
 * A method badge as the pack draws it (p_badges.svg): a hexagon in the badge's colour with a
 * darker edge, an inner ring, a white line icon and the code on a ribbon. Earned badges are in
 * full colour; distinction adds a gold ring. Anything not earned is grey, so a cropped screenshot
 * can never pass an unearned badge off as held; one under way keeps only its colour as the inner ring.
 */
export function MethodMedal({ badge, state, size = 96 }: { badge: MethodBadge; state: BadgeState; size?: number }) {
  const held = state === "earned" || state === "distinction";
  const c = held ? badge.colour : "9AA3AE";
  const d = shade(c);
  const dist = state === "distinction";
  const ring = dist ? "#D4AF37" : state === "in-progress" ? `#${badge.colour}` : "#FFFFFF";
  return (
    <svg
      viewBox="0 0 120 132"
      width={size}
      height={Math.round(size * 1.1)}
      role="img"
      aria-label={`${badge.name} badge${held ? "" : state === "in-progress" ? ", in progress, not earned" : ", not started"}`}
    >
      <title>{badge.name}</title>
      <path d="M60 4l50 28v56l-50 28-50-28V32z" fill={`#${d}`} />
      <path d="M60 10l45 25v50l-45 25-45-25V35z" fill={`#${c}`} />
      <path d="M60 18l38 21v42l-38 21-38-21V39z" fill="none" stroke={ring} strokeOpacity={dist || state === "in-progress" ? 1 : 0.55} strokeWidth={dist || state === "in-progress" ? 3 : 1.5} />
      <g fill="none" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[badge.icon] }} />
      {/* The pack's ribbon is white; on a white page it needs its edge to be seen. */}
      <rect x={34} y={104} width={52} height={18} rx={9} fill="#FFFFFF" stroke={`#${d}`} strokeWidth={1.5} />
      <text x={60} y={117} textAnchor="middle" fontFamily="Arial,Helvetica,sans-serif" fontSize={11} fontWeight={700} fill={`#${d}`}>
        {badge.label}
      </text>
    </svg>
  );
}
