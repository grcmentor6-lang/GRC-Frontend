import { VERBS } from "@/lib/verbs";
import { VERB_TONES } from "@/lib/tones";

/**
 * Verb chip. Renders a canonical verb id (from a learnings step / activity) using the
 * fixed frontend verb metadata. Falls back gracefully for an unknown id.
 */
export function DVerb({ verbId }: { verbId: string }) {
  const v = VERBS[verbId];
  if (!v) {
    return (
      <span className="inline-flex items-center h-[20px] px-1.5 rounded-md font-mono text-[10px] font-medium bg-slate-100 text-slate-500 ring-1 ring-slate-200/70">
        {verbId}
      </span>
    );
  }
  const t = VERB_TONES[v.color] ?? VERB_TONES.indigo;
  return (
    <span
      className={`inline-flex items-center gap-1 h-[20px] px-1.5 rounded-md font-mono text-[10px] font-medium ${t.bg} ${t.text} ring-1 ${t.ring}`}
      title={v.when}
    >
      <span className="opacity-70">{v.code}</span>
      {v.label}
    </span>
  );
}
