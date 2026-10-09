import { Icon } from "@/components/ui/icon";
import type { Program } from "@/lib/catalog";

/**
 * Segmented program-track switcher (GRC 101 / 301 / 501). Shared by Dashboard + My Learnings.
 * `variant="dark"` reads on the brand-gradient hero (glass track, white active pill).
 */
export function ProgramTabs({ programs, value, onChange, variant = "light" }: { programs: Program[]; value: string; onChange: (id: string) => void; variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  const track = dark ? "bg-white/10 ring-white/20" : "bg-slate-100/80 ring-slate-200";
  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl ring-1 w-fit ${track} ${dark ? "backdrop-blur-sm" : ""}`}>
      {programs.map((p) => {
        const sel = p.id === value;
        const locked = p.status === "locked";
        const cls = sel
          ? dark ? "bg-white text-indigo-700 shadow-sm" : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
          : dark ? "text-indigo-100/90 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-700";
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            aria-pressed={sel}
            className={`focus-ring cursor-pointer inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-200 ${cls}`}
          >
            {locked && <Icon name="lock" size={12} className={sel ? (dark ? "text-indigo-400" : "text-slate-400") : dark ? "text-indigo-200/70" : "text-slate-300"} />}
            {p.code}
          </button>
        );
      })}
    </div>
  );
}
