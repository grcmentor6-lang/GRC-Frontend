"""Extract the ISO/IEC 27001 Lead Implementer map from the GRC 101 Programme Workbook.

    python scripts/build-li-map.py <path to BKB-MEN-101-W_GRC101_Programme_Workbook.xlsx>

Writes public/desk/li.json from the six LI-* sheets: the PECB domains and their competency and
knowledge statements (LI-Domain Map), clauses 4–10 (LI-Clause Map), the 93 Annex A controls
(LI-Annex A Map), the 18 extensions (LI-Extensions) and the 5-day course (LI-Course Map).
LI-Summary is formulas over the Domain Map, so the app computes it; only its notes are kept.

Re-run it whenever the pack ships a new workbook.
"""
import json
import re
import sys
from pathlib import Path

import openpyxl



def desect(t: str) -> str:
    """No section sign for the learner: §2 -> Section 2, §2–§3 -> Sections 2–3."""
    t = re.sub(r"§§\s*", "Sections ", t)
    t = re.sub(r"§\s*([0-9A-Za-z][\w.]*)\s*([–-])\s*§\s*([0-9A-Za-z][\w.]*)", r"Sections \1\2\3", t)
    return re.sub(r"§\s*", "Section ", t)

def rows(wb, name, skip):
    """The sheet's data rows, header rows skipped, empty rows dropped, cells as stripped strings."""
    out = []
    for r in wb[name].iter_rows(values_only=True):
        if any(c is not None for c in r):
            out.append(["" if c is None else str(c).strip() for c in r])
    return out[skip:]


def main(src: str) -> None:
    wb = openpyxl.load_workbook(src, read_only=True)
    summary = rows(wb, "LI-Summary", 0)

    statements, domains = [], {}
    for r in rows(wb, "LI-Domain Map", 3):
        d, title, ref, kind, text, before, lvl_before, added, lvl_after, change = r[:10]
        domains[d] = title
        statements.append({"d": int(d), "ref": ref, "type": kind, "text": text, "before": before,
                           "lvlBefore": lvl_before, "added": added, "lvlAfter": lvl_after, "change": change})

    clauses = [dict(zip(["ref", "title", "before", "lvlBefore", "added", "lvlAfter", "docs"], r[:7]))
               for r in rows(wb, "LI-Clause Map", 2)]
    controls = [dict(zip(["ref", "title", "theme", "tasks", "labs", "soa", "pool", "depth"], r[:8]))
                for r in rows(wb, "LI-Annex A Map", 3)]
    extensions = [dict(zip(["id", "task", "week", "title", "domains", "iso", "hours", "objective", "kr"], r[:9]))
                  for r in rows(wb, "LI-Extensions", 3)]
    course = [dict(zip(["day", "topic", "weeks", "tasks"], r[:4])) for r in rows(wb, "LI-Course Map", 2)]

    out = {
        "title": summary[0][0],
        "intro": summary[1][0],
        "levels": rows(wb, "LI-Domain Map", 0)[1][0],
        "domains": [{"n": int(k), "title": v} for k, v in sorted(domains.items(), key=lambda kv: int(kv[0]))],
        "statements": statements,
        "clauses": clauses,
        "controls": controls,
        "extensions": extensions,
        "course": course,
    }
    assert len(controls) == 93, f"expected 93 Annex A controls, got {len(controls)}"
    assert len(extensions) == 18, f"expected 18 extensions, got {len(extensions)}"
    dest = Path(__file__).resolve().parent.parent / "public" / "desk" / "li.json"
    dest.write_text(desect(json.dumps(out, ensure_ascii=False, separators=(",", ":"))), encoding="utf8")
    print(f"{dest} — {len(statements)} statements, {len(clauses)} clauses, {len(controls)} controls, "
          f"{len(extensions)} extensions, {len(course)} course days")


if __name__ == "__main__":
    main(sys.argv[1])
