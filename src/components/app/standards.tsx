import { Icon } from "@/components/ui/icon";
import { VERB_TONES } from "@/lib/tones";
import { TASK_META } from "@/lib/taskmeta";
import { CONTROLS_BY_TASK } from "@/lib/controls";
import { STANDARD_BY_ID, standardForTaskCode } from "@/lib/standards";
import { Gloss } from "@/components/app/glossary";

// Static tone maps (Tailwind v4 purges dynamic `bg-${tone}` classes). Each framework carries its
// own colour identity — the banner wears it so the mentee reads the standard at a glance.
const SOLID: Record<string, string> = {
  indigo: "bg-indigo-600", violet: "bg-violet-600", emerald: "bg-emerald-600", amber: "bg-amber-500", rose: "bg-rose-600",
};
const BAND: Record<string, string> = {
  indigo: "from-indigo-50 via-indigo-50/30", violet: "from-violet-50 via-violet-50/30",
  emerald: "from-emerald-50 via-emerald-50/30", amber: "from-amber-50 via-amber-50/30", rose: "from-rose-50 via-rose-50/30",
};
const SEAL_RING: Record<string, string> = {
  indigo: "ring-indigo-100", violet: "ring-violet-100", emerald: "ring-emerald-100", amber: "ring-amber-100", rose: "ring-rose-100",
};
const ACCENT_BORDER: Record<string, string> = {
  indigo: "border-indigo-200", violet: "border-violet-200", emerald: "border-emerald-200", amber: "border-amber-200", rose: "border-rose-200",
};
const tone = (t: string) => VERB_TONES[t] ?? VERB_TONES.indigo;

/** The framework dossier heading a task brief: the standard the task is graded against, its colour
 *  identity, what's assessed, the framework's own explainer, and the task context. `onControls`, when
 *  given, makes the "controls assessed" chip open the task's Control references. */
export function StandardBanner({ taskCode, onControls }: { taskCode: string; onControls?: () => void }) {
  const standard = standardForTaskCode(taskCode);
  if (!standard) return null;
  const t = tone(standard.tone);
  const nistRef = TASK_META[taskCode]?.nistCrossRef?.trim();
  const alsoNist = standard.id !== "nistcsf" && !!nistRef ? STANDARD_BY_ID["nistcsf"] : null;
  const desc = TASK_META[taskCode]?.description?.trim();
  const controlCount = CONTROLS_BY_TASK[taskCode]?.controls.length ?? 0;

  return (
    // Dossier layout: a colour-coded identity panel (left) beside the content panel (right). The
    // tinted panel is a fixed width filled with seal + identity + meta, so no half is left empty.
    <div className="mb-4 rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.02),0_8px_28px_-16px_rgba(15,23,42,0.14)] flex flex-col sm:flex-row">
      {/* Identity panel — the framework's colour, monogram, name, and what it's assessed against. */}
      <div className={`sm:w-[268px] shrink-0 bg-gradient-to-b ${BAND[standard.tone]} to-white/30 border-b sm:border-b-0 sm:border-r border-slate-200 p-4 sm:p-5 flex flex-col gap-3.5`}>
        <div className="flex items-center gap-3">
          <span aria-hidden className={`shrink-0 w-12 h-12 rounded-xl ${SOLID[standard.tone]} text-white flex flex-col items-center justify-center leading-none ring-4 ${SEAL_RING[standard.tone]} shadow-sm`}>
            <span className="text-[12px] font-mono font-semibold tracking-[0.04em]">{standard.short}</span>
            <span className="text-[7.5px] font-mono uppercase tracking-[0.14em] opacity-75 mt-0.5">std</span>
          </span>
          <div className="min-w-0">
            <span className={`block text-[9.5px] font-semibold tracking-[0.16em] uppercase ${t.text}`}>Standard · Framework</span>
            <h2 className="mt-0.5 text-[16.5px] font-semibold tracking-[-0.02em] text-slate-900 leading-snug tabular-nums">{standard.fullName}</h2>
          </div>
        </div>

        <div className="text-[12px] font-medium tracking-tight text-slate-600 leading-snug">{standard.domain}</div>

        {/* Meta — compliance vernacular: what this task is assessed against. */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {standard.crossCutting && (
            <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-semibold uppercase tracking-[0.08em] ${t.bg} ${t.text} ring-1 ${t.ring}`}>
              <Icon name="layers" size={11} /> Cross-cutting
            </span>
          )}
          {controlCount > 0 && (onControls ? (
            <button
              type="button"
              onClick={onControls}
              aria-label={`View the ${controlCount} controls this task is assessed against`}
              className="focus-ring group inline-flex items-center gap-1.5 h-6 pl-1.5 pr-1.5 rounded-md bg-white/80 ring-1 ring-slate-200 hover:ring-slate-300 hover:bg-white text-[11px] tracking-tight text-slate-600 transition-colors cursor-pointer"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
              <b className="font-semibold text-slate-900 tabular-nums">{controlCount}</b> controls assessed
              <Icon name="arrowRight" size={11} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 h-6 pl-1.5 pr-2 rounded-md bg-white/80 ring-1 ring-slate-200 text-[11px] tracking-tight text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
              <b className="font-semibold text-slate-900 tabular-nums">{controlCount}</b> controls assessed
            </span>
          ))}
          {alsoNist && (
            <span className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] leading-none font-medium tracking-tight ${tone(alsoNist.tone).bg} ${tone(alsoNist.tone).text} ring-1 ${tone(alsoNist.tone).ring}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tone(alsoNist.tone).dot}`} /> + {alsoNist.code}
            </span>
          )}
        </div>
      </div>

      {/* Content panel — the framework explainer + the task in context. */}
      <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
        <div>
          <span className="block text-[9.5px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1.5">About this framework</span>
          <p className="text-[12.5px] leading-relaxed text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}><Gloss>{standard.description}</Gloss></p>
          {standard.tagline && (
            <p className={`mt-2 pl-2.5 border-l-2 text-[12px] italic tracking-tight text-slate-700 ${ACCENT_BORDER[standard.tone]}`}><Gloss>{standard.tagline}</Gloss></p>
          )}
        </div>
        {desc && (
          <div className="pt-3 border-t border-slate-100">
            <span className="block text-[9.5px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1.5">Your task in context</span>
            <p className="text-[12.5px] leading-relaxed text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}><Gloss>{desc}</Gloss></p>
          </div>
        )}
      </div>
    </div>
  );
}
