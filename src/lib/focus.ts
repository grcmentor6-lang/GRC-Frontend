// GRC 101 works on ISO/IEC 27001 and its family only (docs/GRC101_FOCUS_PLAN.md; SOC 2 left with the LI101 rebuild,
// docs/li101). Every other standard or law, SOC 2 included, stays visible but greyed, tagged LATER_LABEL. This file is
// the one list; every surface asks it.

/** The focus standards, by the library/lib-standards id. ISO 27001 brings its family with it: see FOCUS below. */
export const FOCUS_IDS = ["iso27001"] as const;

export const LATER_LABEL = "Covered in GRC 301/501";

// ISO/IEC 27001 with its family: the standards that define, support, audit and certify an ISO 27001 ISMS count as
// ISO 27001 work (owner, 24 Nov 2026). That is ISO/IEC 27000 to 27008 (27006-1 included), ISO 19011 and
// ISO/IEC 17021-1: T3.1 steps 9 to 14, T5.1 step 11 and T12.2 steps 9 and 11 are answered from them.
// \b after the number keeps 27017, 27701 and 29151 out; ISO 9001 and every other ISO standard stay out too.
// An edition, part or amendment suffix (":2022 + Amd 1:2024", "-1") is fine.
const FOCUS = /\bISO(?:\s*\/\s*IEC)?\s*(?:2700[0-8]|19011|17021)\b/i;
// What reads as a standard or law at all, so "PDCA: Plan" or a policy code is never greyed.
const NAMED = /\bISO\b|\bGDPR\b|\bKVKK\b|\bHIPAA\b|\bPCI\b|\bCOPPA\b|\bFERPA\b|\bNIST\b|\bCIS\b|\bCOPC\b|\bSOC\s?[123]\b|\bDORA\b|\bNIS\s?2\b|\bData Privacy Act\b|\bDPA 2012\b|\bSDPC\b|\biNACOL\b|\bNSQOL\b/i;

/** Is this standard in GRC 101's focus? Takes a library id ("iso27001", "ISO27001", "NIST_CSF") or a name as the
 *  desk writes it ("ISO/IEC 27001:2022 + Amd 1:2024", "ISO/IEC 27005:2022", "GDPR / DPA 2012 / KVKK"). A line naming
 *  several standards is in focus when any of them is. */
export function isFocus(standard: string): boolean {
  const id = standard.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return (FOCUS_IDS as readonly string[]).includes(id) || FOCUS.test(standard);
}

/** Names a standard or law that GRC 101 does not work on: the ones to grey. False for text that names none. */
export function isLater(standard: string): boolean {
  const id = standard.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return !isFocus(standard) && (NAMED.test(standard) || ["nistcsf", "cisv8", "gdpr"].includes(id));
}
