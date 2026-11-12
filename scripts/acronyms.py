"""Spell an acronym out the first time a view uses it (owner, 12 Nov 2026: "What is PBC?"). Corrections item 119.

The table is src/lib/desk/acronyms.json, shared with src/lib/desk/acronyms.ts (the guide cards, expanded at load). A view
is one self-contained thing the learner reads: a task's summary, one step's instruction, one help note, one guide card
set, one knowledge-check question. `expand(text, seen)` spells out each acronym at its first occurrence, `seen` carrying
what a view has already spelled out across its strings. Never touched: an acronym already explained in the view (its
full form appears before it, or right after it), a code (PBC-6, SOA-GCS: a hyphen or digit joins it), a menu path or
tool name ("Evidence › Audit Requests (PBC)": it must match the button), a name in `keep`, anything bold or in quotes
(a label or value to type), a Lead Implementer tag and a decision's "Options: …" list (the desk matches the options
against the buttons). Forms: "SOP" → "SOP (standard operating procedure)"; "(PBC)" → "(PBC, Prepared By Client)";
"SLA (R23)" → "SLA (service level agreement; R23)". Self-check: python scripts/acronyms.py
"""
import json
import re
from pathlib import Path

_WEB = Path(__file__).resolve().parent.parent
TABLE = json.loads((_WEB / "src" / "lib" / "desk" / "acronyms.json").read_text(encoding="utf8"))
FORMS = {f: e for e in TABLE["acronyms"] for f in e["a"]}


def _names() -> list[str]:
    """The toolbar's sections, tools and reference pages, as the desk names them (step-text.tsx), plus `keep`."""
    src = (_WEB / "src" / "components" / "desk" / "step-text.tsx").read_text(encoding="utf8")
    out = list(TABLE["keep"])
    for name in ("SECTIONS", "TOOLS", "PAGES"):
        body = re.search(rf"export const {name} = \[(.*?)\];", src, re.S)[1]
        out += re.findall(r'"([^"]+)"', body)
    return [n for n in out if RE.search(n)]


_alt = "|".join(re.escape(f) for f in sorted(FORMS, key=len, reverse=True))
_TOKEN = rf"(?:{_alt})s?"
RE = re.compile(rf"(?<![\w-])({_TOKEN}(?:/{_TOKEN})*)(?![\w+-])")  # "UTC+1" is a zone, not UTC
PROTECT = re.compile(
    "|".join([
        r"^\[LI-\d+ — [^\]]+\]\s*",  # the step's extension tag: the desk drops it
        r"Options:.*?(?= Guidance:| Then:|$)",  # the option texts, matched against the buttons
        r"\*\*.+?\*\*", r'"[^"]*"', r"“[^”]*”",  # a label, a value to type
        r"›\s*[^,;.›]+",  # a menu path's tool
        *(rf"(?<![\w-]){re.escape(n)}(?![\w-])" for n in sorted(_names(), key=len, reverse=True)),
    ])
)


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[-‐–]", " ", s.lower()))


def _explained(text: str, start: int, end: int, e: dict) -> bool:
    """Its full form is already in the view before it, or follows it at once ("CISO (Chief Information …)")."""
    seen = _norm(text[:start] + " " + text[end:end + 12 + len(e["full"])])
    return any(_norm(x) in seen for x in [e["full"], *e.get("alt", [])])


def explained_in(text: str) -> set:
    """The acronyms `text` already spells out ("Prepared-by-client (PBC) …"): a view that shows it counts them as seen."""
    return {FORMS[m[1]]["a"][0] for m in RE.finditer(text) if m[1] in FORMS and _explained(text, m.start(), m.end(), FORMS[m[1]])}


def expand(text: str, seen: set | None = None) -> str:
    seen = set() if seen is None else seen
    if not text:
        return text
    guard = [m.span() for m in PROTECT.finditer(text)]
    out, last = [], 0
    for m in RE.finditer(text):
        s, e = m.span()
        if any(a <= s < b for a, b in guard):
            continue
        fulls = []
        for tok in m[1].split("/"):
            plural = tok not in FORMS
            ent = FORMS[tok[:-1] if plural else tok]
            key = ent["a"][0]
            if key in seen:
                continue
            seen.add(key)
            if not _explained(text, s, e, ent):
                fulls.append(ent.get("plural", ent["full"] + "s") if plural else ent["full"])
        if not fulls:
            continue
        end = e + re.match(r"(?:/[\w-]+)*(?:['’]s(?!\w))?", text[e:]).end()  # "OT/ICS", "CISA's": after the pair, the 's
        full = " / ".join(fulls)
        if text[s - 1:s] == "(" and text[end:end + 1] == ")":
            out.append(text[last:end] + f", {full}")
            last = end
        elif text.startswith(" (", end):
            out.append(text[last:end] + f" ({full}; ")
            last = end + 2
        else:
            out.append(text[last:end] + f" ({full})")
            last = end
    out.append(text[last:])
    return "".join(out)


if __name__ == "__main__":
    x = lambda t: expand(t, set())  # noqa: E731
    assert x("Fill the evidence request list (PBC) with the PBC rules.") == "Fill the evidence request list (PBC, Prepared By Client) with the PBC rules.", x("Fill the evidence request list (PBC) with the PBC rules.")
    assert x("Write the SOP. Then the SOP again.") == "Write the SOP (standard operating procedure). Then the SOP again."
    assert x("Open Evidence › Audit Requests (PBC): dataset PBC-6 and PBC-LIST, SOA-GCS, T-PBC.") == "Open Evidence › Audit Requests (PBC): dataset PBC-6 and PBC-LIST, SOA-GCS, T-PBC."
    assert x("the Statement of Applicability (SoA) lists") == "the Statement of Applicability (SoA) lists"
    assert x("Apply the SLA (R23) to KRIs.") == "Apply the SLA (service level agreement; R23) to KRIs (key risk indicators)."
    assert x('Type "SOP" in column B. Options: A) The CISO  B) The DPO. Guidance: see the CISO.') == 'Type "SOP" in column B. Options: A) The CISO  B) The DPO. Guidance: see the CISO (Chief Information Security Officer).'
    assert x("[LI-05 — ISMS scope] Scope the ISMS.") == "[LI-05 — ISMS scope] Scope the ISMS (information security management system)."
    assert x("systems that cannot use MFA/SSO.") == "systems that cannot use MFA/SSO (multi-factor authentication / single sign-on)."
    assert x("the GRC Charter Section 16 and the Group GRC Office") == "the GRC Charter Section 16 and the Group GRC Office"
    assert x("in UTC+1, then in UTC.") == "in UTC+1, then in UTC (Coordinated Universal Time)."
    assert x("in CISA's catalogue") == "in CISA's (US Cybersecurity and Infrastructure Security Agency) catalogue"
    assert x("scope statements and SoAs.") == "scope statements and SoAs (Statements of Applicability)."
    seen: set = set()
    assert (expand("The DPIA.", seen), expand("A DPIA.", seen)) == ("The DPIA (data protection impact assessment).", "A DPIA.")
    assert explained_in("Prepared-by-client (PBC) list for the SOP") == {"PBC"}
    once = x("Build the PBC list and the SOP.")
    assert x(once) == once, "expanding twice adds nothing"
    print("acronyms: ok")
