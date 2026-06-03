import type { ReactNode } from "react";

/**
 * Shared inline SVG icon set, ported verbatim from the mockups (single source so every
 * surface uses identical glyphs). Server-safe: no hooks, no browser APIs.
 */
const paths: Record<string, ReactNode> = {
  home: (<><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  desk: (<><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M7 21l2-5" /><path d="M17 21l-2-5" /><path d="M3 12h18" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  trophy: (<><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 6H5a2 2 0 0 0 0 4h3" /><path d="M16 6h3a2 2 0 0 1 0 4h-3" /><path d="M10 14v3h4v-3" /><path d="M8 20h8" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-9 6 9 6" />,
  arrowRight: (<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>),
  arrowLeft: (<><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></>),
  arrowUpRight: (<><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>),
  check: <path d="M5 13l4 4L19 7" />,
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  minus: <path d="M5 12h14" />,
  x: (<><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>),
  bell: (<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />,
  file: (<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>),
  checkSquare: (<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12l3 3 5-6" /></>),
  menu: (<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>),
  sparkle: <path d="M12 2l1.8 5.5L19 9.5l-5.2 2L12 17l-1.8-5.5L5 9.5l5.2-2L12 2z" />,
  target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></>),
  book: (<><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M6 21h13" /></>),
  clipboard: (<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M9 12h6" /><path d="M9 16h4" /></>),
  list: (<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" /></>),
  flag: (<><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>),
  save: (<><path d="M5 3h11l3 3v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M8 3v5h7V3" /><rect x="8" y="13" width="8" height="6" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v.01" /><path d="M11 12h1v5h1" /></>),
  send: (<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  chat: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-11.5a8.5 8.5 0 0 1 17 0z" />,
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  table: (<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M9 4v16" /></>),
  rocket: (<><path d="M5 13l3-7c3-1 7-1 10 0l3 7-3 4-3-2-1 5-3-5-3 2-3-4z" /><circle cx="12" cy="9" r="1.5" /></>),
  upload: (<><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" /></>),
  download: (<><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></>),
  link: (<><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1" /></>),
  history: (<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>),
  eye: (<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>),
  filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />,
  sortDesc: (<><path d="M11 5h10" /><path d="M11 9h7" /><path d="M11 13h4" /><path d="M3 17l4 4 4-4" /><path d="M7 21V3" /></>),
  move: (<><path d="M5 9l-3 3 3 3" /><path d="M9 5l3-3 3 3" /><path d="M15 19l-3 3-3-3" /><path d="M19 9l3 3-3 3" /><path d="M2 12h20" /><path d="M12 2v20" /></>),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  shield: (<><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" /><path d="M9 12l2 2 4-4" /></>),
  cube: (<><path d="M12 3l9 5v8l-9 5-9-5V8z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v9" /></>),
  layers: (<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 18l9 5 9-5" /></>),
  refresh: (<><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>),
  play: <path d="M6 4l14 8-14 8z" fill="currentColor" />,
  sliders: (<><path d="M3 6h12" /><path d="M19 6h2" /><path d="M3 12h6" /><path d="M13 12h8" /><path d="M3 18h14" /><path d="M21 18h0" /><circle cx="17" cy="6" r="2" /><circle cx="11" cy="12" r="2" /><circle cx="19" cy="18" r="2" /></>),
  chart: (<><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-6" /></>),
  bullseye: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="3" /></>),
  handshake: (<><path d="M11 17l-3-3 3-3 2 2 4-4 3 3-6 6-3-1z" /><path d="M3 12l5-5 3 3" /></>),
  star: <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />,
  bot: (<><rect x="4" y="8" width="16" height="12" rx="2" /><circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" /><path d="M12 4v4" /><circle cx="12" cy="3" r="1" /></>),
  edit: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>),
  treeDown: (<><circle cx="12" cy="4" r="2" /><circle cx="6" cy="20" r="2" /><circle cx="18" cy="20" r="2" /><path d="M12 6v4" /><path d="M6 18v-4h12v4" /><path d="M12 10v4" /></>),
  ribbon: (<><circle cx="12" cy="8" r="5.5" /><path d="M8.5 12.2L6.5 21l5.5-3 5.5 3-2-8.8" /></>),
  linkedin: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7" /><path d="M7 7v.01" /><path d="M11 17v-4a2 2 0 0 1 4 0v4" /><path d="M11 13v4" /></>),
  lock: (<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  creditCard: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></>),
  receipt: (<><path d="M5 3v18l2-1.2 2 1.2 2-1.2 2 1.2 2-1.2 2 1.2V3l-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2L5 3z" /><path d="M9 8.5h6" /><path d="M9 12.5h6" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>),
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.2a2.5 2.5 0 0 1 4.8 1c0 1.6-2.3 2-2.3 3.3" /><path d="M12 17.5v.01" /></>),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  phone: <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 0-2z" />,
  smartphone: (<><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>),
  mapPin: (<><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  trash: (<><path d="M4 7h16" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /></>),
  camera: (<><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L18 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" /><circle cx="12" cy="13" r="3.5" /></>),
};

export type IconName = keyof typeof paths;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: string;
}

export function Icon({
  name,
  size = 16,
  className = "",
  strokeWidth = 1.75,
  fill = "none",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
