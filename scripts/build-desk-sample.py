"""Extract the sample mentee's desk content from the v1.8.8 Desk prototype.

    python scripts/build-desk-sample.py <path to GRC101_Mentee_UI_Desk-12wk.html>

Writes public/desk/sample.json. Answer-key material is stripped: a task message's best option,
its reason and its check line are what the automated review reveals after submission, so they
must never ship to the browser.

ponytail: stand-in until Phase 1, when the backend runs the engine per mentee and serves the
same shape from /me/desk. Delete this script then.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

MONTHS = {m: i for i, m in enumerate(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}
DROP = {"ic", "pop"}  # inline SVG icons (we use our own) and a duplicate of `sections`
HIDDEN_INJ = {"best", "why", "check"}


def day_offset(label: str, start: date) -> int:
    """'Thu 5 Nov' -> days after the cohort start. Dates run Oct 2026 to Jan 2027."""
    _, d, m = label.split()
    year = start.year + (1 if MONTHS[m] < start.month else 0)
    return (date(year, MONTHS[m], int(d)) - start).days


def main(src: str) -> None:
    html = Path(src).read_text(encoding="utf8")
    i = html.index("const W=") + len("const W=")
    w, _ = json.JSONDecoder().raw_decode(html[i:])
    start = date.fromisoformat(w["start"])

    for k in DROP:
        w.pop(k, None)
    for t in w["tasks"].values():
        t["dueDay"] = day_offset(t["due"], start)
        for s in t["steps"]:
            s.pop("best", None)
    for j in w["inj"].values():
        for k in HIDDEN_INJ:
            j.pop(k, None)
        j["dueDay"] = (date.fromisoformat(j["due"]) - start).days

    blob = json.dumps(w, ensure_ascii=False, separators=(",", ":"))
    assert '"best"' not in blob, "answer key leaked into the sample"
    out = Path(__file__).resolve().parent.parent / "public" / "desk" / "sample.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(blob, encoding="utf8")
    print(f"{out} — {len(blob) // 1024} KB, {len(w['tasks'])} tasks")


if __name__ == "__main__":
    main(sys.argv[1])
