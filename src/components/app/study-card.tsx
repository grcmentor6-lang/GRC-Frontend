import type { ReactNode } from "react";

/**
 * The study card (form 03) — read to understand · nothing due. See docs/FORM_LANGUAGE.md.
 *
 * **The only borderless form, and the absence of the border is load-bearing**: it is what tells the
 * mentee nothing is owed here. Everything else on the desk has an edge because everything else
 * either wants something back or came from somewhere that has to be credited. This does neither.
 *
 * The rule that goes with it: *the moment it acquires a button it must become a step marker or a
 * prompt well.* If you find yourself adding an action here, you are building a different form —
 * a borderless card with a submit button tells the learner nothing is due and then asks for
 * something, which is the one lie the silhouette can tell.
 *
 * Exact tokens: ground `--gf-steel-tint` #e2eff6 · body `--gf-ink-2` #4e5a6b · heading
 * `--gf-ink` #131c28 · meta `--gf-steel` #0b6e99. Serif body, because this is prose to be read
 * rather than fields to be scanned.
 *
 * `GivenNote` in workspaces/kit.tsx is the compact inline variant of this same silhouette — same
 * borderless steel, sized for a single line of given context rather than a passage.
 */
export function StudyCard({
  title,
  children,
  meta,
  className = "",
}: {
  /** Optional heading. Serif, because the card is prose. */
  title?: ReactNode;
  children: ReactNode;
  /** e.g. "4 min · no submission". Uppercase steel, and never a call to action. */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[14px] border-0 bg-[#e2eff6] p-4 ${className}`}>
      {title && (
        <h4 className="m-0 mb-1.5 font-serif text-[15px] font-semibold leading-snug text-[#131c28]" style={{ textWrap: "pretty" }}>
          {title}
        </h4>
      )}
      <div className="font-serif text-[14px] leading-[1.5] text-[#4e5a6b] [&_p]:m-0 [&_p+p]:mt-2" style={{ textWrap: "pretty" }}>
        {children}
      </div>
      {meta && (
        <span className="mt-2.5 block font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#0b6e99]">
          {meta}
        </span>
      )}
    </div>
  );
}
