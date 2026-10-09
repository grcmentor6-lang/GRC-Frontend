"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { TASK_META } from "@/lib/taskmeta";
import { learningsApi } from "@/lib/learnings";
import { nameOf, summaryOf, type LibGroup, type LibItem, type LibStandard } from "@/lib/library";

/*
 * The standards library's shareable graphics, and the two strips every library page carries.
 *
 * The posters are not one of the fourteen forms: they are artefacts a mentee takes *off* the
 * platform, so they carry the brand and an attribution line instead of a silhouette. They still
 * keep the palette honest — navy and steel only, no invented hue — and every poster says the words
 * are ours. That line is what lets a summary of a copyrighted standard be posted publicly; do not
 * drop it to tidy the layout.
 *
 * They are SVG so one render serves the page and the PNG: the download serialises the same node
 * onto a canvas. Web fonts do not survive that trip (an <img> of an SVG loads nothing external),
 * so the posters name system fonts.
 */

const FONT = "'Segoe UI', Helvetica, Arial, sans-serif";
const NAVY = "#1f3564";
const STEEL = "#0b6e99";
const INK = "#131c28";
const INK2 = "#4e5a6b";
const INK3 = "#7d899a";
const RULE = "#d3dbe6";
/** Navy/steel ramp for tiles and arcs — shades of the two existing hues, not new ones. */
const RAMP = [NAVY, STEEL, "#2b4a7f", "#12587a"];

/** Greedy word wrap by character count. ponytail: no text measuring, so a line of wide glyphs can
 *  run a little long; widths are set with margin to absorb it. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    if (line && `${line} ${w}`.length > max) { lines.push(line); line = w; }
    else line = line ? `${line} ${w}` : w;
  }
  if (line) lines.push(line);
  return lines;
}

function Lines({ x, y, lines, size, lh, anchor, fill, weight }: {
  x: number; y: number; lines: string[]; size: number; lh: number;
  anchor?: "start" | "middle" | "end"; fill: string; weight?: number;
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor}>
      {lines.map((l, i) => <tspan key={i} x={x} dy={i ? lh : 0}>{l}</tspan>)}
    </text>
  );
}

function Masthead({ w, standard }: { w: number; standard: LibStandard }) {
  return (
    <>
      <text x={60} y={84} fontSize={36} fontWeight={800} fill={NAVY}>grc<tspan fill={STEEL}>mentor</tspan></text>
      <text x={w - 60} y={84} fontSize={22} fill={INK3} textAnchor="end">{nameOf(standard)}</text>
      <line x1={60} x2={w - 60} y1={112} y2={112} stroke={RULE} strokeWidth={2} />
    </>
  );
}

function Colophon({ w, h, standard }: { w: number; h: number; standard: LibStandard }) {
  return (
    <>
      <line x1={60} x2={w - 60} y1={h - 110} y2={h - 110} stroke={RULE} strokeWidth={2} />
      <text x={60} y={h - 68} fontSize={19} fill={INK3}>{standard.source}</text>
      <text x={60} y={h - 38} fontSize={19} fill={INK3}>Summarised in our own words, not quoted. Read the standard before citing it.</text>
      <text x={w - 60} y={h - 52} fontSize={24} fontWeight={700} fill={NAVY} textAnchor="end">grcmentor.app</text>
    </>
  );
}

function SaveImage({ target, name }: { target: React.RefObject<SVGSVGElement | null>; name: string }) {
  const [busy, setBusy] = useState(false);
  async function save() {
    const svg = target.current;
    if (!svg) return;
    setBusy(true);
    try {
      const { width, height } = svg.viewBox.baseVal;
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `grcmentor-${name}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      onClick={save}
      disabled={busy}
      className="focus-ring h-9 px-3.5 rounded-lg bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white text-[12.5px] font-medium tracking-tight inline-flex items-center gap-2 transition-colors"
    >
      <Icon name="download" size={14} />
      {busy ? "Saving…" : "Save as image"}
    </button>
  );
}

function PosterFrame({ w, h, name, children }: { w: number; h: number; name: string; children: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  return (
    <figure className="m-0">
      <div className="rounded-xl ring-1 ring-slate-200 overflow-hidden bg-white">
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h} fontFamily={FONT} className="block w-full h-auto">
          <rect width={w} height={h} fill="#ffffff" />
          {children}
        </svg>
      </div>
      <figcaption className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <SaveImage target={ref} name={name} />
        <span className="text-[11.5px] text-slate-500 tracking-tight">PNG, ready to post on LinkedIn from your own account.</span>
      </figcaption>
    </figure>
  );
}

/** One standard, or one part of it, as tiles: the group, its count, and its first few items. */
export function OverviewPoster({ standard, part, slug }: { standard: LibStandard; part: string; slug: string }) {
  const W = 1600, M = 60, GAP = 28;
  const groups = standard.groups.filter((g) => g.part === part);
  // CIS has no groups, so its tiles are the controls themselves.
  const single = groups.length === 1;
  const cols = single ? 6 : Math.min(4, groups.length);
  const tw = (W - 2 * M - (cols - 1) * GAP) / cols;
  const titleSize = single ? 22 : 28;
  const titleLh = single ? 28 : 36;

  const tiles = single
    ? groups[0].items.map((i) => ({
        eyebrow: i.ref, title: wrap(i.title, Math.floor(tw / 12.5)),
        caption: i.count ? `${i.count} ${standard.countUnit ?? ""}` : "", list: [] as string[][], more: false,
      }))
    : groups.map((g) => ({
        eyebrow: "", title: wrap(g.name, Math.floor(tw / 16)), caption: `${g.items.length} ${g.unit}`,
        list: g.items.slice(0, 5).map((i) => wrap(i.title, Math.floor(tw / 11.5))), more: g.items.length > 5,
      }));
  type Tile = (typeof tiles)[number];
  const headH = (t: Tile) => 34 + (t.eyebrow ? 36 : 0) + t.title.length * titleLh + (t.caption ? 44 : 0) + 16;
  const listH = (t: Tile) => (t.list.length ? 24 + t.list.reduce((n, l) => n + l.length * 28 + 8, 0) + (t.more ? 28 : 0) : 0);

  let y = 290;
  const rows = Array.from({ length: Math.ceil(tiles.length / cols) }, (_, r) => {
    const row = tiles.slice(r * cols, (r + 1) * cols);
    const hh = Math.max(...row.map(headH));
    const out = { row, y, hh, start: r * cols };
    y += hh + Math.max(...row.map(listH)) + GAP;
    return out;
  });
  const H = y + 130;
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const sub = single
    ? `${total} ${groups[0].unit}${standard.countUnit ? ` · ${groups[0].items.reduce((n, i) => n + (i.count ?? 0), 0)} ${standard.countUnit}` : ""}`
    : `${total} ${groups[0].unit} in ${groups.length} groups`;

  return (
    <PosterFrame w={W} h={H} name={slug}>
      <Masthead w={W} standard={standard} />
      <text x={M} y={190} fontSize={46} fontWeight={800} fill={NAVY}>{part}</text>
      <text x={M} y={238} fontSize={24} fill={INK2}>{sub}</text>
      {rows.map(({ row, y: ry, hh, start }) =>
        row.map((t, c) => {
          const x = M + c * (tw + GAP);
          let ly = ry + hh + 24 + 21;
          return (
            <g key={start + c}>
              <rect x={x} y={ry} width={tw} height={hh} rx={16} fill={RAMP[(start + c) % RAMP.length]} />
              {t.eyebrow && <text x={x + 22} y={ry + 34 + 22} fontSize={24} fontWeight={800} fill="#ffffff">{t.eyebrow}</text>}
              <Lines x={x + 22} y={ry + 34 + (t.eyebrow ? 36 : 0) + titleSize * 0.8} lines={t.title} size={titleSize} lh={titleLh} fill="#ffffff" weight={700} />
              {t.caption && (
                <text x={x + 22} y={ry + hh - 22} fontSize={17} fontWeight={600} letterSpacing={2} fill="#ffffff" opacity={0.85}>
                  {t.caption.toUpperCase()}
                </text>
              )}
              {t.list.map((lines, k) => {
                const at = ly;
                ly += lines.length * 28 + 8;
                return (
                  <g key={k}>
                    <text x={x + 6} y={at} fontSize={21} fill={INK3}>–</text>
                    <Lines x={x + 28} y={at} lines={lines} size={21} lh={28} fill={INK} />
                  </g>
                );
              })}
              {t.more && <text x={x + 6} y={ly} fontSize={21} fill={INK3}>– …</text>}
            </g>
          );
        }),
      )}
      <Colophon w={W} h={H} standard={standard} />
    </PosterFrame>
  );
}

/** One clause or control: a wheel of its points where it has them, a card where it does not. */
export function ItemPoster({ standard, group, item, slug }: { standard: LibStandard; group: LibGroup; item: LibItem; slug: string }) {
  const W = 1080, H = 1350;
  return item.points ? (
    <PosterFrame w={W} h={H} name={slug}>
      <Masthead w={W} standard={standard} />
      <Wheel item={item} group={group} />
      <Colophon w={W} h={H} standard={standard} />
    </PosterFrame>
  ) : (
    <PosterFrame w={W} h={H} name={slug}>
      <Masthead w={W} standard={standard} />
      <Card item={item} group={group} />
      <Colophon w={W} h={H} standard={standard} />
    </PosterFrame>
  );
}

function Wheel({ item, group }: { item: LibItem; group: LibGroup }) {
  const cx = 540, cy = 730, ring = 200, reach = 262;
  const points = item.points!;
  const step = 360 / points.length;
  const at = (r: number, deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const title = wrap(item.title, 15);

  return (
    <>
      <text x={60} y={196} fontSize={58} fontWeight={800} fill={NAVY}>{item.ref}</text>
      <text x={60} y={242} fontSize={24} fill={INK3}>{group.name}</text>
      {points.map((p, i) => {
        const deg = -90 + i * step;
        const [x0, y0] = at(ring, deg - step / 2 + 2);
        const [x1, y1] = at(ring, deg + step / 2 - 2);
        const [nx, ny] = at(ring, deg);
        const [sx, sy] = at(ring + 26, deg);
        const [ex, ey] = at(reach - 14, deg);
        const [px, py] = at(reach, deg);
        const cos = Math.cos((deg * Math.PI) / 180), sin = Math.sin((deg * Math.PI) / 180);
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const lines = wrap(p, anchor === "middle" ? 26 : 20);
        const top = sin < -0.3 ? py - (lines.length - 1) * 29 : sin > 0.3 ? py + 20 : py - ((lines.length - 1) * 29) / 2 + 8;
        const color = RAMP[i % RAMP.length];
        return (
          <g key={i}>
            <path d={`M ${x0} ${y0} A ${ring} ${ring} 0 0 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={40} />
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={INK3} strokeWidth={1.5} />
            <circle cx={nx} cy={ny} r={20} fill="#ffffff" stroke={color} strokeWidth={7} />
            <Lines x={px} y={top} lines={lines} size={23} lh={29} anchor={anchor} fill={INK} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={152} fill="#ffffff" />
      <Lines x={cx} y={cy - ((title.length - 1) * 34) / 2 + 10} lines={title} size={28} lh={34} anchor="middle" fill={NAVY} weight={700} />
    </>
  );
}

function Card({ item, group }: { item: LibItem; group: LibGroup }) {
  const long = item.title.length > 110;
  const title = wrap(item.title, long ? 40 : 30);
  const tSize = long ? 34 : 44, tLh = long ? 44 : 54;
  const summary = wrap(summaryOf(item), 40);
  const labelY = 310 + (title.length - 1) * tLh + 96;
  const end = labelY + 60 + (summary.length - 1) * 50;
  // Centre the block in the space between masthead and group caption; a short control otherwise
  // leaves the bottom half of the image empty.
  const dy = Math.max(0, (1000 - (end - 150)) / 2 - 40);
  return (
    <>
      <g transform={`translate(0 ${dy})`}>
        {/* The navy rail echoes the plaque: the reference and title above belong to the standard. */}
        <rect x={60} y={176} width={10} height={end - 150} fill={NAVY} />
        <text x={100} y={232} fontSize={52} fontWeight={800} fill={NAVY}>{item.ref}</text>
        <Lines x={100} y={310} lines={title} size={tSize} lh={tLh} fill={INK} weight={700} />
        <text x={100} y={labelY} fontSize={20} fontWeight={600} letterSpacing={3} fill={STEEL}>IN PLAIN TERMS</text>
        <Lines x={100} y={labelY + 60} lines={summary} size={36} lh={50} fill={INK2} />
      </g>
      <text x={100} y={1170} fontSize={20} fontWeight={600} letterSpacing={2} fill={INK3}>{group.name.toUpperCase()}</text>
    </>
  );
}

/** Stated before any content, as on the Control references panel: which words are the standard's. */
export function LibraryProvenance({ standard }: { standard?: LibStandard }) {
  return (
    <p className="text-[11.5px] text-slate-600 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
      {standard && !standard.publishedTitles
        ? "The AICPA criteria have no short published titles, so the titles here are ours too. "
        : "References and titles are the standard's own. "}
      Every summary is written <span className="font-semibold">in our own words</span> — it is not the text of the
      standard, so quote the standard itself when your work has to cite it.
    </p>
  );
}

/** "You came here from a task" — the organisation whose work this reading is for, and the way back. */
export function TaskContext({ task }: { task: string }) {
  const meta = TASK_META[task];
  const [org, setOrg] = useState<string>();
  useEffect(() => {
    let off = false;
    learningsApi
      .get("grc101")
      .then((l) => !off && setOrg(l.orgs.find((o) => o.projects.some((p) => p.tasks.some((t) => t.code === task)))?.name))
      .catch(() => {});
    return () => { off = true; };
  }, [task]);
  if (!meta) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-l-2 border-sky-700 bg-sky-50/60 px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-sky-700">
          Reading for {task}{org ? ` · ${org}` : ""}
        </span>
        <span className="block text-[13px] text-slate-800 tracking-tight">{meta.name}</span>
      </div>
      <Link href={`/app/desk/task/${task}`} className="focus-ring inline-flex items-center gap-1.5 text-[12px] font-medium text-sky-700 hover:text-sky-900">
        Back to the task <Icon name="arrowRight" size={13} />
      </Link>
    </div>
  );
}
