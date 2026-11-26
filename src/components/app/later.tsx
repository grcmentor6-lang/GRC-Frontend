import { LATER_LABEL } from "@/lib/focus";

// The grey treatment for a standard or law outside GRC 101's focus (lib/focus.ts). Not a new form: it is the mute
// hue ("not yours yet") on whatever form the standard already sits in, and the tag takes the dashed edge that
// means "not yet in your possession" (docs/FORM_LANGUAGE.md, law 4). Everything greyed stays readable and openable.

/** On a box: drains its hue (navy, steel, a framework's colour) to grey. Luminance, so contrast, is unchanged. */
export const LATER_BOX = "grayscale";
/** On text over a white or near-white ground: slate-500, 4.5:1 or better there. A chip ([data-tone]) sits on its own
 *  tinted ground, where slate-500 falls to 4:1: it keeps its own ink and LATER_BOX drains its hue. Wear the two
 *  together wherever text is greyed, so every greyed thing is the same neutral grey. */
export const LATER_INK = "text-slate-500 [&_*:not([data-tone])]:text-slate-500!";

/** The one tag. Use it once per group (a heading, a legend line), not once per row. */
export function LaterTag({ className = "" }: { className?: string }) {
  return (
    <span data-later-tag className={`inline-block shrink-0 whitespace-nowrap rounded-[3px] border border-dashed border-slate-400 bg-white px-1.5 py-px font-sans text-[10.5px] font-medium normal-case leading-[1.5] tracking-normal text-slate-600! ${className}`}>
      {LATER_LABEL}
    </span>
  );
}

/** The legend a list or table of standards carries once, where its greyed rows wear no tag of their own. */
export function LaterLegend({ className = "" }: { className?: string }) {
  return (
    <p data-later-legend className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-relaxed text-slate-600 ${className}`}>
      <LaterTag />
      <span>Greyed standards and laws are outside GRC 101, which works on ISO/IEC 27001 (with 27002). They are here to read.</span>
    </p>
  );
}
