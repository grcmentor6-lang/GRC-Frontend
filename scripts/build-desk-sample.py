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
            if s["kind"] == "pick":
                # The desk reveals a decision's feedback when the step is marked complete, and says so
                # under the options; the pack's "after you submit" line would contradict it.
                s["w"] = s["w"].replace(" Choose one. After you submit, you see why each option is right or wrong.", "")
    # F1.1 steps 2 and 3 send the mentee to "Policies › Onboarding attestations", a screen the pack's
    # own toolbar does not have. The two forms are on the steps themselves (ATTEST in lib/desk/forms.ts).
    f11 = w["tasks"]["F1.1"]["steps"]
    for n, old, new in [
        (2, 'Then: Open Policies › Onboarding attestations › "Undertaking". Read its clauses. Type your full name and mentee ID and click "Sign" (ADM-UND).',
            'Then: read the undertaking below, type your full name and mentee ID and click "Sign" (ADM-UND).'),
        (3, 'Then: Open Policies › Onboarding attestations › "Data rules". Tick all four boxes and click "Save" (ADM-RULES).',
            'Then: tick the four data rules below and click "Save" (ADM-RULES).'),
    ]:
        s = f11[n - 1]
        assert old in s["w"], (n, s["w"])
        s["w"] = s["w"].replace(old, new)
        s["tool"] = "On this step"
    for j in w["inj"].values():
        for k in HIDDEN_INJ:
            j.pop(k, None)
        j["dueDay"] = (date.fromisoformat(j["due"]) - start).days

    blob = json.dumps(w, ensure_ascii=False, separators=(",", ":"))
    # The pack's toolbar calls it "This week's plan"; every step, input and key result says "My plan".
    blob = blob.replace("This week's plan", "My plan")
    # F1.1 step 1 numbers the organisations ("Organisation 1 … Organisation 2"); the pack's own My
    # Organisation screen, which the step copies from, calls them Org A and Org B.
    blob = blob.replace("Organisation 1, its home office, Organisation 2, its home office",
                        "the name of Org A, its home office, the name of Org B, its home office")
    # One screen title says "My Organisations"; the toolbar and all 30 other mentions say "My Organisation".
    blob = blob.replace("Home › My Organisations", "Home › My Organisation")
    # The pack calls each step's owner note "In simpler words"; on the desk it is the step's help
    # note, opened from the ? in the step's row. Step F1.1-3 sends the mentee to it by that name.
    blob = blob.replace('\\"In simpler words\\" note', "help note (?)")
    blob = blob.replace('"In simpler words"', '"Help note (?)"')
    blob = blob.replace("an help note", "a help note")
    assert "In simpler words" not in blob, "a mention of the old note name was missed"
    # The same, in the help text the mentee reads: each step's help and the task owner's notes table
    # (which is what the help window shows) both carry these lines, so they are rewritten pack-wide.
    for old, new in [
        ("the platform shows the best option and why after you submit the task",
         "the platform shows the best option and why as soon as you mark the step complete"),
        ("Then open the undertaking, read it,", "Then read the undertaking on the step,"),
        ("Then tick all four boxes of the data rules", "Then tick the four data rules on the step"),
    ]:
        assert blob.count(old) == 2, (old, blob.count(old))  # once in the step's help, once in the notes
        blob = blob.replace(old, new)
    # Where the task card names that screen, name the steps instead.
    blob = blob.replace("Policies › Onboarding attestations", "F1.1 steps 2 and 3 (onboarding attestations)")
    assert '"best"' not in blob, "answer key leaked into the sample"
    out = Path(__file__).resolve().parent.parent / "public" / "desk" / "sample.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(blob, encoding="utf8")
    print(f"{out} — {len(blob) // 1024} KB, {len(w['tasks'])} tasks")


if __name__ == "__main__":
    main(sys.argv[1])
