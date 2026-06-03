import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import { BAR_TONES } from "@/lib/tones";

/** The grcmentor wordmark. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-baseline gap-0 no-underline">
      <span
        className={`text-[18px] font-semibold tracking-[-0.02em] ${light ? "text-white" : "text-slate-900"}`}
      >
        grc
      </span>
      <span className="text-[18px] font-semibold tracking-[-0.02em] text-indigo-500">mentor</span>
      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 self-center mt-1" />
    </Link>
  );
}

/** Standard dashboard/surface card. */
export function Card({
  className = "",
  children,
  pad = true,
}: {
  className?: string;
  children: ReactNode;
  pad?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] ${pad ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/** Thin progress bar. */
export function Bar({
  pct,
  tone = "indigo",
  className = "",
}: {
  pct: number;
  tone?: keyof typeof BAR_TONES;
  className?: string;
}) {
  return (
    <div className={`h-1.5 rounded-full bg-slate-100 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${BAR_TONES[tone]} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Circular progress ring. */
export function Ring({
  pct,
  size = 132,
  stroke = 12,
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F7" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#6366F1"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/** Section heading with eyebrow + optional sub copy (marketing + page headers). */
export function SectionHead({
  eyebrow,
  icon,
  children,
  sub,
  center = true,
  dark = false,
}: {
  eyebrow?: string;
  icon?: IconName;
  children: ReactNode;
  sub?: string;
  center?: boolean;
  /** Light text for use on a dark section background. */
  dark?: boolean;
}) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto" : ""}>
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase ${dark ? "text-indigo-300" : "text-indigo-600"} ${center ? "justify-center" : ""}`}
        >
          {icon && <Icon name={icon} size={14} />} {eyebrow}
        </div>
      )}
      <h2 className={`mt-2 text-[28px] md:text-[34px] font-semibold tracking-[-0.03em] leading-[1.1] ${dark ? "text-white" : "text-slate-900"}`}>
        {children}
      </h2>
      {sub && (
        <p
          className={`mt-3 text-[14.5px] leading-relaxed tracking-tight ${dark ? "text-slate-300" : "text-slate-500"}`}
          style={{ textWrap: "pretty" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
