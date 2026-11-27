import PHY from "@/lib/desk/li-phy.json";

/**
 * Dataset PHY drawn (T9.1): the floor plan of the Manila head office, its points (Z rooms, D doors) and the 20 photo points,
 * as an inline SVG. Our own drawing; there are no photographs, the captions are the photo rows of sheet Photos.
 * ponytail: one fixed drawing from li-phy.json; a second plan would make this take the plan as a prop.
 */
const P = PHY.plan;
const name = Object.fromEntries(PHY.points.map(([id, n]) => [id, n]));

export function PhyPlan() {
  return (
    <figure data-guide="phy-plan" className="shrink-0 border-b border-[#DDE1E8] bg-white px-4 py-3">
      <figcaption className="mb-2 text-[12.5px] text-[#3F4757]">
        <strong className="font-semibold text-[#111827]">Dataset PHY · Floor plan</strong> · {PHY.office}. Rooms Z1–Z8, doors D1–D3 in orange, photos P01–P20 as numbered dots.
      </figcaption>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${P.w} ${P.h}`} role="img" aria-label="Floor plan of the Manila head office, floor 12" className="block h-auto w-full min-w-[560px] max-w-[760px]">
          <rect x={0} y={0} width={P.w} height={P.h} fill="#FAFAFB" />
          {P.outside.map(([t, x, y, w, h]) => (
            <g key={t as string}>
              <rect x={x as number} y={y as number} width={w as number} height={h as number} fill="#F1F2F5" stroke="#B9BFCA" strokeDasharray="5 4" />
              <text x={(x as number) + 8} y={(y as number) + 20} fontSize={14} fill="#5B6474">{t}</text>
            </g>
          ))}
          <rect x={P.corridor[0]} y={P.corridor[1]} width={P.corridor[2]} height={P.corridor[3]} fill="#F4F5F7" stroke="#C9CED8" />
          <text x={P.corridor[0] + 8} y={P.corridor[1] + 30} fontSize={13} fill="#6B7280">Corridor</text>
          {P.areas.map(([id, x, y, w, h]) => (
            <g key={id as string}>
              <rect x={x as number} y={y as number} width={w as number} height={h as number} fill="#FFFFFF" stroke="#3F4757" strokeWidth={2} />
              <text x={(x as number) + 8} y={(y as number) + 20} fontSize={(w as number) < 130 ? 13 : 15} fontWeight={600} fill="#111827">{id} {name[id as string]}</text>
            </g>
          ))}
          <rect x={P.above[1] as number} y={P.above[2] as number} width={P.above[3] as number} height={P.above[4] as number} fill="none" stroke="#8A91A3" strokeDasharray="4 3" />
          <text x={(P.above[1] as number) + 6} y={(P.above[2] as number) + 16} fontSize={12} fill="#5B6474" fontStyle="italic">{P.above[0]}</text>
          {P.doors.map(([id, x1, y1, x2, y2]) => (
            <g key={id as string}>
              <line x1={x1 as number} y1={y1 as number} x2={x2 as number} y2={y2 as number} stroke="#C2410C" strokeWidth={8} />
              <text x={(x1 as number) - 30} y={((y1 as number) + (y2 as number)) / 2 + 5} fontSize={15} fontWeight={700} fill="#C2410C">{id}</text>
            </g>
          ))}
          {Object.entries(P.photos).map(([id, [x, y]]) => (
            <g key={id}>
              <circle cx={x} cy={y} r={13} fill="#1F2A44" />
              <text x={x} y={y + 4.5} fontSize={12} fontWeight={700} fill="#FFFFFF" textAnchor="middle">{id.slice(1)}</text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
