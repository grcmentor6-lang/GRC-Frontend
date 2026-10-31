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


def desect(t: str) -> str:
    """§2 -> Section 2, §2–§3 -> Sections 2–3, §§ -> Sections."""
    t = re.sub(r"§§\s*", "Sections ", t)
    t = re.sub(r"§\s*([0-9A-Za-z][\w.]*)\s*([–-])\s*§\s*([0-9A-Za-z][\w.]*)", r"Sections \1\2\3", t)
    return re.sub(r"§\s*", "Section ", t)


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
            # A decision's `why` is the key's explanation ("approval sits with the CISO"): served by
            # POST /me/desk/decision once the pick is checked, never shipped to the browser.
            s["why"] = None
            if s["kind"] == "pick":
                # The desk reveals a decision's feedback on "Check my answer", and says so
                # under the options; the pack's "after you submit" line would contradict it.
                s["w"] = s["w"].replace(" Choose one. After you submit, you see why each option is right or wrong.", "")
    # F1.1 steps 2 and 3 send the mentee to "Policies › Onboarding attestations", a screen the pack's
    # own toolbar does not have. The two forms are on the steps themselves (ATTEST in lib/desk/forms.ts).
    f11 = w["tasks"]["F1.1"]["steps"]
    for n, old, new in [
        (2, 'Then: Open Policies › Onboarding attestations › "Undertaking". Read its clauses. Type your full name and mentee ID and click "Sign" (ADM-UND).',
            'Then: open the undertaking below and read it. Type your full name and mentee ID, add your signature and click "Sign" (ADM-UND).'),
        (3, 'Then: Open Policies › Onboarding attestations › "Data rules". Tick all four boxes and click "Save" (ADM-RULES).',
            'Then: tick the four data rules below and click "Save" (ADM-RULES).'),
    ]:
        s = f11[n - 1]
        assert old in s["w"], (n, s["w"])
        s["w"] = s["w"].replace(old, new)
        s["tool"] = "On this step"
    # The undertaking is signed at the end of step 3, not in step 2: the mentee signs once both
    # conduct questions are answered and the four data rules read and saved, and before step 4, the
    # first contact with data ("Without a signed undertaking your account is not opened for data",
    # BKB-POL-024 §6.1 step 3). Decided by the owner, 2026-10-28. Step numbers are unchanged, so KR2
    # ("Activities 2–3") still holds.
    sign = ' Then: open the undertaking below and read it. Type your full name and mentee ID, add your signature and click "Sign" (ADM-UND).'
    assert sign in f11[1]["w"], f11[1]["w"]
    f11[1]["w"] = f11[1]["w"].replace(sign, "")
    f11[1]["o"] = "Decision recorded"
    f11[2]["w"] += ' Last, open the undertaking below and read it: it restates the rules you have just saved. Type your full name and mentee ID, add your signature and click "Sign" (ADM-UND).'
    f11[2]["o"] = "Decision recorded; ADM-RULES ticked; ADM-UND signed"
    help_sign = ' Then open the undertaking, read it, type your full name and mentee ID and click "Sign" — your signature is the record that you know the rules.'
    help_last = ' Last, read the undertaking on the step, type your full name and mentee ID and click "Sign" — your signature is the record that you know the rules, so you sign once you have read them all.'
    notes = {r[0]: r for r in w["notes"]["F1.1"]}
    for holder, field in ((f11[1], "help"), (notes[2], 2)):
        assert help_sign in holder[field], holder[field]
        holder[field] = holder[field].replace(help_sign, "")
    for holder, field in ((f11[2], "help"), (notes[3], 2)):
        holder[field] = holder[field].rstrip() + help_last
    for j in w["inj"].values():
        for k in HIDDEN_INJ:
            j.pop(k, None)
        j["dueDay"] = (date.fromisoformat(j["due"]) - start).days

    # F1.2 step 3 decides each GlobalConnect standard's instrument type with rule R01, but Learn ›
    # Framework Quick Reference describes only four of the nine (ISO/IEC 27001, SOC 2, GDPR, DPA 2012).
    # Platform-written entries for the other five, in the same style, agreeing with the pack's own key
    # (GRC101_Engine/datasets.py INSTRUMENT). Listed for the authors' review in
    # docs/GRC101_Content_Corrections.md; drop each once the pack carries its own.
    # F1.2 step 2 is a walk of rule R01 on worked row 1 (LADDER): the learner answers its questions
    # until the first yes. The pack's step text and help state the outcome ("Can an organisation get
    # a certificate? Yes → Certifiable standard (rule R01, question 2)"), which gives the walk away.
    # Say what to do, not what comes out (owner, 2026-10-28).
    s12 = w["tasks"]["F1.2"]["steps"][1]
    assert "Yes → Certifiable standard (rule R01, question 2)" in s12["w"], s12["w"]
    s12["t"] = "Apply rule R01 to the worked example in row 1"
    s12["w"] = ("Apply rule R01 to the worked example in row 1, ISO/IEC 27001:2022: ask its questions in order "
                "and stop at the first yes. The first yes gives the instrument type that row shows in column D.")
    s12["o"] = "Rule R01 walked on row 1, to its first yes"
    help12 = ("Row 1 is a finished row. Walk rule R01 on it: ask the questions in order and stop at the first "
              "\"yes\". That yes gives the type in column D. In step 3 you walk it the same way for each of your rows.")
    s12["help"] = help12
    for r in w["notes"]["F1.2"]:
        if r[0] == 2:
            assert "Yes → certifiable standard" in r[2], r[2]
            r[1], r[2] = s12["t"], help12
    qr = w["tp"]["learn|Framework Quick Reference"]["pl"]["p"]
    qr += [line for line in [
        "<b>HIPAA</b> A US federal law (1996), enforced by the HHS Office for Civil Rights. Healthcare providers and their business associates must comply.",
        "<b>PCI DSS</b> A card-data security standard set by the PCI Security Standards Council, founded by the card brands; not a law. It binds merchants and service providers through their contracts with banks and card brands, and compliance is shown by a qualified assessor's Report on Compliance on their controls.",
        "<b>ISO 9001</b> A certifiable quality management-system standard: accredited certification bodies audit organisations and certify them against it.",
        "<b>ISO 18295</b> A certifiable ISO standard for customer contact centres: service requirements a centre can be certified against.",
        "<b>COPC CX Standard</b> An industry performance standard for customer-experience operations, written by COPC Inc. Contact centres can be certified against it.",
        # T12.2 cites "ISO/IEC 17021-1:2015 — Appeals and complaints (concepts)" (card, LI-18), and no screen held it (item 75).
        "<b>ISO/IEC 17021-1</b> Requirements for the certification bodies that audit and certify management systems, ISO/IEC 27001 among them. A certification body must have a documented process to receive, evaluate and decide on appeals against its decisions (clause 9.7), and one for complaints (clause 9.8).",
    ] if line.split("</b>")[0] not in "".join(qr)]
    # A reference is looked things up in: alphabetical by name, not in the order the entries were written.
    # Numbers by value, so ISO 9001 comes before ISO 18295 and ISO/IEC 27001.
    def by_name(line):
        name = line.split("</b>")[0].removeprefix("<b>").lower().replace("/iec", "")
        return [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", name)]
    qr.sort(key=by_name)

    f13(w)
    f21(w)
    f22(w)
    t31(w)
    t32(w)
    t41(w)
    t42(w)
    t51(w)
    t52(w)
    t61(w)
    t62(w)
    t71(w)
    t72(w)
    t81(w)
    t82(w)
    t91(w)
    t92(w)
    t101(w)
    t102(w)
    t111(w)
    t112(w)
    t121(w)
    t122(w)
    # Learn › Rule tables cut each rule at 160 characters ("… Write the descriptor n…"): a learner sent there to read R07
    # or R08 (T7.1) could not read the rule to its end. The screen shows each rule in full (owner rule: answers on screen).
    for r in w["tp"]["learn|Rule tables"]["pl"]["r"]:
        full = w["rules"].get(r[0], [None, ""])[1]
        if r[2].endswith("…") and full.startswith(r[2][:-1]):
            r[2] = full

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
         "the platform shows the best option and why as soon as you click Check my answer"),
        ("Then tick all four boxes of the data rules", "Then tick the four data rules on the step"),
    ]:
        assert blob.count(old) == 2, (old, blob.count(old))  # once in the step's help, once in the notes
        blob = blob.replace(old, new)
    # Every T-task decision's help says the answer comes "after you submit the task", while its panel
    # reveals it on "Check my answer" (tester report D8). The panel is what happens; say so.
    old = "After you submit the task you see the best option and why."
    assert blob.count(old) > 0, "the T-task decision line has changed in the pack"
    blob = blob.replace(old, "When you click Check my answer you see the best option and why.")
    # F1.2 column F ("Rule") is written by the desk from D and E (registers.ts `derived`): typing the
    # same "R01", then "; R02", on every row is no decision. Say what the screen does.
    for old, new, n in [
        ('Select the type in column D and type \\"R01\\" in column F.',
         'Select the type in column D; column F records \\"R01\\" by itself.', 2),
        ('Then add \\"; R02\\" in column F.', 'Column F then records \\"R02\\" by itself.', 2),
        ('Add \\"; R02\\" in column F.', 'Column F then records \\"R02\\" by itself.', 1),
        # F1.2 step 4: an Optional row's column E is a fixed phrase, written by the desk (registers.ts
        # `derived`), not something read from a source.
        ('For each Optional row type \\"Optional — not mapped\\".', 'Optional rows are filled for you.', 1),
        ('Optional rows get \\"Optional — not mapped\\".', 'Optional rows are filled for you (\\"Optional — not mapped\\").', 2),
        # F1.2 step 5: § and – are on no ordinary keyboard. The desk records "BKB-ADD-16 2-3" in full
        # (registers.ts `cells`), so the step says what to type, and how it is recorded.
        # F1.2 step 5 is its question: which kind of evidence ref is acceptable. The column G typing that
        # followed added nothing (owner, 2026-10-28): the desk writes each row's section itself (§2 where
        # its offices came from an office row, else §3; registers.ts `derived`).
        (' Then: Type \\"BKB-ADD-16 §2–§3\\" in column G of every GlobalConnect Customer Solutions row.', '', 1),
        ('Type the addendum name followed by \\"§2–§3\\" in column G of every one of your rows.', 'Column G of every row is then filled for you with the section its offices were read from.', 2),
        ('Decision recorded; evidence ref on every row', 'Decision recorded', 1),
        ('column G = \\"BKB-ADD-16 §2–§3\\"', "column G cites the section each row's offices came from", 1),
    ]:
        assert blob.count(old) == n, (old, blob.count(old))
        blob = blob.replace(old, new)
    # Where the task card names that screen, name the steps instead.
    # Both forms are on step 3 since the undertaking moved there (owner, 2026-10-28).
    blob = blob.replace("Policies › Onboarding attestations", "F1.1 step 3 (onboarding attestations)")
    w = json.loads(blob)
    retro(w)
    rework_f11(w)
    rework_f12(w)
    blob = json.dumps(w, ensure_ascii=False, separators=(",", ":"))
    # No section sign anywhere the learner reads or types (owner, 2026-10-28): it is on no ordinary
    # keyboard. "§2" is written "Section 2", "§2–§3" "Sections 2–3". The pack keeps its §; every
    # rewrite above still matches it, and this runs last.
    blob = desect(blob)
    assert "§" not in blob, "a section sign is left in the sample"
    assert '"best"' not in blob, "answer key leaked into the sample"
    # The keys' reasons are answers too: none may reach the browser (D5's "why" once did, unseen).
    seeds = Path(__file__).resolve().parents[2] / "backend" / "_seed"
    for f in ("grc101_decisions.json", "grc101_row_keys.json", "grc101_inbox_keys.json"):
        k = json.loads((seeds / f).read_text(encoding="utf8"))
        whys = [v["why"] for v in k.values() if isinstance(v, dict) and isinstance(v.get("why"), str)]
        whys += [r["why"] for v in k.values() if isinstance(v, dict) for r in (v.get("rows") or {}).values() if isinstance(r, dict) and isinstance(r.get("why"), str)]
        leaked = [w for w in whys if len(w) > 30 and json.dumps(w, ensure_ascii=False)[1:-1] in blob]
        assert not leaked, f"answer reasons from {f} leaked into the sample: {leaked[:3]}"
    out = Path(__file__).resolve().parent.parent / "public" / "desk" / "sample.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(blob, encoding="utf8")
    print(f"{out} — {len(blob) // 1024} KB, {len(w['tasks'])} tasks")


def f13(w: dict) -> None:
    """F1.3 in the platform's own vocabulary (tester report, 28 Oct 2026), keeping the pack's intent.

    The pack sends the mentee to Information_Asset_Register_by_Department.xlsx ("organisation tab,
    filter ...") and to a DOCX print preview; neither exists on the platform. The register's Mission
    Critical assets by office are BKB-ADD-16 §8.1; the brief is a page on the desk that says whether it
    fits on one A4 page. The brief's Source fields are labelled "Source:", so the mentee types only
    what follows. Listed in docs/GRC101_Content_Corrections.md (items 24-28).
    """
    t = w["tasks"]["F1.3"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["F1.3"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    sub(1, "o", "Nothing to produce — you read the worked section", "Section 1 checked against BKB-ADD-16 §1.1")
    # The services list section 1 holds is §1.1 "Services and products"; §1 is the profile table above it.
    sub(1, "w", "from BKB-ADD-16 §1 — this is the worked example. Put it next to BKB-ADD-16 §1 and check",
        "from BKB-ADD-16 §1.1 — this is the worked example. Put it next to BKB-ADD-16 §1.1 and check")
    steps[0]["refs"]["docs"] = [["BKB-ADD-16", ["1.1"]]]
    # §9's heading is "Processing activities and data"; the list is its "Client data handled" column.
    sub(2, "t", 'Open BKB-ADD-16 §9 "Data handled"', 'Open BKB-ADD-16 §9 "Processing activities and data"')
    sub(2, "w", 'Open BKB-ADD-16 §9 "Data handled". Copy every item of the list into section 2, word for word and in the same order. Type "Source: BKB-ADD-16 §9" under the list.',
        'Open BKB-ADD-16 §9 "Processing activities and data". Copy every item of its "Client data handled" list into section 2, one per line, word for word and in the same order. Type "BKB-ADD-16 §9" in the Source line under the list.')
    sub(2, "help", 'Open the addendum §9 ("Data handled"). Copy every item into section 2',
        'Open the addendum §9 and find the "Client data handled" list. Copy every item into section 2')
    sub(2, "help", 'Type "Source: " and the addendum §9 under the list.', "Type the addendum and §9 in the Source line under the list.")
    sub(3, "w", 'Type "Source: BKB-ADD-16 §2".', 'Type "BKB-ADD-16 §2" in the Source line.')
    # Step 4: the asset register's Mission Critical assets by office are BKB-ADD-16 §8.1.
    s4 = steps[3]
    sub(4, "w", 'Then: Open Information_Asset_Register_by_Department.xlsx, organisation tab. Filter Office = Manila, Philippines and Criticality = Mission Critical. Copy every Asset name shown into section 4, one per line. Type "Source: asset register".',
        'Then: open BKB-ADD-16 §8.1 "Mission Critical assets": the asset register\'s assets rated Mission Critical, with their office. Copy the Asset of every row whose Office is Manila, Philippines into section 4, one per line. Type "BKB-ADD-16 §8.1" in the Source line.')
    sub(4, "help", "Then open the asset register, set the two filters (Office = your home office; Criticality = Mission Critical) and copy every asset name the filter shows, one per line.",
        "Then open the addendum §8.1, which lists the register's Mission Critical assets with their office, and copy the Asset of every row of your home office, one per line.")
    sub(4, "o", "section 4 copied from the register", "section 4 copied from BKB-ADD-16 §8.1")
    s4["tool"], s4["key"], s4["sec"] = "Home › My Organisation", "home|My Organisation", "home"
    s4["refs"]["wbs"] = []
    s4["refs"]["docs"] = [["BKB-ADD-16", ["8.1"]]]
    # Step 5: Rule records R04 by itself once a party is in (registers.ts `derived`).
    sub(5, "w", 'Then: Open template CTX-IP (columns Party · Internal/External · Requirement · Standard/law · Rule · Evidence ref). Copy the first five parties of BKB-ADD-16 §4, in the same order, with the four values given for each. Type "R04" in Rule and "BKB-ADD-16 §4" in Evidence ref.',
        'Then: open CTX-IP (columns Party · Internal/External · Requirement · Standard/law · Rule · Evidence ref). Copy the first five parties of BKB-ADD-16 §4, in the same order, each with the values given for it. Rule records "R04" and Evidence ref "BKB-ADD-16 §4" by themselves.')
    sub(5, "help", 'Type "R04" and the source in the last two columns.', "Rule records R04, and Evidence ref the source, by themselves.")
    # Step 6: the desk draws the brief at A4 and says whether it fits; there is no print preview.
    sub(6, "w", 'Then: Open the print preview of CTX-BRIEF: it must show 1 page and the label "Internal" in the footer. Save both files in 02_Working as',
        'Then: check CTX-BRIEF as it prints: the page must fit on one A4 page and carry the label "Internal" in its footer. Name both files in 02_Working as')
    sub(6, "help", "If the print preview shows more than one page,", "If the page shows that it runs onto a second page,")
    # The task card and references name the workbook; name what the platform has.
    blob = json.dumps(t, ensure_ascii=False)
    for old, new in [
        ("Information_Asset_Register_by_Department.xlsx (organisation tab — synthetic)", "The asset register's Mission Critical assets by office (BKB-ADD-16 §8.1)"),
        ("Information_Asset_Register_by_Department.xlsx — Organisation tab: Asset, Owner, Classification, Criticality", "BKB-ADD-16 — §8.1 Mission Critical assets (the asset register's, by office)"),
        ("see Information_Asset_Register_by_Department.xlsx", "see BKB-ADD-16 §8.1"),
        ("Information_Asset_Register_by_Department.xlsx", "BKB-ADD-16 §8.1"),
    ]:
        blob = blob.replace(old, new)
    w["tasks"]["F1.3"] = json.loads(blob)
    lib = w["library"]["cited_by_task"]["F1.3"]
    w["library"]["cited_by_task"]["F1.3"] = [x.replace("Information_Asset_Register_by_Department.xlsx — Organisation tab: Asset, Owner, Classification, Criticality", "BKB-ADD-16 — §8.1 Mission Critical assets (the asset register's, by office)") for x in lib]
    for k, c in enumerate(w["cards"].get("F1.3", [])):
        w["cards"]["F1.3"][k] = json.loads(json.dumps(c, ensure_ascii=False).replace("Information_Asset_Register_by_Department.xlsx — Organisation tab: Asset, Owner, Classification, Criticality", "BKB-ADD-16 — §8.1 Mission Critical assets (the asset register's, by office)").replace("see Information_Asset_Register_by_Department.xlsx", "see BKB-ADD-16 §8.1"))
    assert "Information_Asset_Register" not in json.dumps([w["tasks"]["F1.3"], w["notes"]["F1.3"], w["cards"].get("F1.3")], ensure_ascii=False)


def f21(w: dict) -> None:
    """F2.1 in the platform's own terms (tester report, 28 Oct 2026), keeping the pack's intent.

    The worked rows' paths do not follow BKB-STD-001 §5's questions, so step 1 finds the parts of a
    finished row instead of tracing them against §5; step 2's walk records path and tier itself; step 3's
    Rule column records R05 itself; §6 has no "Transmission" column, only Internal and External
    transmission rows; steps 4 and 5 fill CLS-RES, which is on Risk › Asset Register, reading from the
    Policy Library. Listed in docs/GRC101_Content_Corrections.md (items 29-35).
    """
    t = w["tasks"]["F2.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["F2.1"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)

    sub(1, "w", "Read them next to BKB-STD-001 §5.", "Find in them the three parts every finished row has.")
    sub(1, "o", "Nothing to produce — you read the worked rows", "Three things found in the worked rows A-01 and A-02")
    sub(1, "help", "Put BKB-STD-001 §5 (the tree) next to them and follow each path question by question. That is exactly what you will do for the other six.",
        "Find in them the tier, the path that reached it and the facts the questions were answered from. In step 2 you walk the tree (BKB-STD-001 §5) for the other six.")
    steps[0]["refs"]["docs"] = []
    sub(2, "help", "Write the path, stop when the tree gives a tier, select that tier.",
        "Stop when the tree gives a tier: the walk beside the table records the path and the tier.")
    sub(3, "help", 'Write "R05" in the Rule column.', "The Rule column records R05 by itself.")
    sub(5, "w", 'Then: Copy the "Transmission" value for Tier 3 and for Tier 4 from the BKB-STD-001 §6 matrix.',
        'Then: copy the "External transmission" value for Tier 3 and for Tier 4 from the BKB-STD-001 §6 matrix, and type "BKB-STD-001 §6" as the source.')
    sub(5, "help", 'find the "Transmission" column, copy the value of the Tier 3 row and the Tier 4 row. Write "§6" as the source.',
        'find the "External transmission" row, copy its value in the Tier 3 and the Tier 4 column. Write "BKB-STD-001 §6" as the source.')
    sub(4, "w", "(one label per tier; the template shows the four tiers).", '(one label per tier; the template shows the four tiers), and type "BKB-ADD-16 §7" as the source.')
    # CLS-RES is worked on Risk › Asset Register; the Policy Library is where steps 4 and 5 read from.
    for n in (4, 5):
        s = steps[n - 1]
        s["tool"], s["key"], s["sec"] = "Risk Register › Asset Register", "risk|Asset Register", "risk"


def f22(w: dict) -> None:
    """F2.2 in the platform's own terms (tester report, 28 Oct 2026), keeping the pack's intent.

    Step 1 sent the mentee to Evidence › Defect Codes and asked them to tick "I have read the worked
    example", but the worked items E-001 and E-002 are in dataset EVQ-6, on Evidence › Evidence Library
    (EVQ-RES); the codes are read beside them. Step 3's "fix text" is not in Ref-Defect codes (two
    columns: code, defect), so the Fix column waits for it, and Rule records R09 by itself. Listed in
    docs/GRC101_Content_Corrections.md (items 36-40).
    """
    t = w["tasks"]["F2.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["F2.2"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    sub(1, "t", "Open dataset EVQ-6 and the sheet Ref-Defect codes", "Find what decided the worked items E-001 and E-002")
    sub(1, "w", "Open dataset EVQ-6 and the sheet Ref-Defect codes. Items E-001 and E-002 are worked examples: the decision and the defect code are filled in. Read them.",
        "Items E-001 and E-002 of dataset EVQ-6 are worked examples: the decision and the defect code are filled in. With Evidence › Defect Codes open beside them, find what made E-002 a Reject.")
    sub(1, "o", "Nothing to produce — you read the worked items", "Three things found in the worked items E-001 and E-002")
    sub(1, "help", "Open Ref-Defect codes next to them", "Open Evidence › Defect Codes next to them")
    sub(3, "t", "For each rejected item, copy the one defect code that applies and its…", "For each rejected item, record the one defect code that applies")
    sub(3, "w", "For each rejected item, copy the one defect code that applies and its fix text from Ref-Defect codes.",
        'For each rejected item, choose the code of the one check that failed, as Evidence › Defect Codes lists it. An accepted item records "none" by itself.')
    sub(3, "o", "Defect code and fix copied for every rejected item", "Defect code recorded for every rejected item")
    sub(3, "help", 'Find the check that failed, copy its code (D1 … D10) and its fix text from Ref-Defect codes into the row. Write "R09" in the Rule column.',
        "Find the check that failed and choose its code (D1 … D10) in the row. Ref-Defect codes gives no fix text yet, so the Fix column waits for it. The Rule column records R09 by itself.")
    # EVQ-RES is worked on Evidence › Evidence Library; Defect Codes is read beside it.
    for n in (1, 3):
        s = steps[n - 1]
        s["tool"], s["key"], s["sec"] = "Evidence › Evidence Library", "evidence|Evidence Library", "evidence"
    # The toolbar calls the screen Defect Codes; its window said "Evidence defect codes".
    w["tp"]["evidence|Defect Codes"]["tool"] = "Evidence › Defect Codes"


def t31(w: dict) -> None:
    """T3.1 in the platform's own terms (tester report, 28 Oct 2026), keeping the pack's intent.

    The steps named 01_Inputs and "Learn › Reference", which the platform does not have; Organization_Profiles
    was not in the Policy Library; the Lead Implementer steps opened OBL-REG and repeated its "Done when";
    three hand-ins said three different things. Each step now names where its values are and what it
    produces. Listed in docs/GRC101_Content_Corrections.md (items 41-46).
    """
    t = w["tasks"]["T3.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T3.1"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    LI1 = "[LI-01 — ISO/IEC 27000 family and the management-system structure] "
    LI2 = "[LI-02 — ISMS scope statement and ISMS process map] "
    OPEN = "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything."
    COPY = "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column."
    RULE = " Write the rule ID in the Rule column."
    VALUES = "Values copied with evidence ref"

    sub(1, "t", "Open BKB-ADD-16 §2", "Copy your two offices' rows of BKB-ADD-16 §2")
    sub(1, "w", "Open BKB-ADD-16 §2. Copy the rows for Manila, Philippines and Warsaw, Poland.",
        "Open BKB-ADD-16 §2 (Policies › Policy Library). Add one register row for Manila, Philippines and one for Warsaw, Poland: "
        "the office's Breach notification cell is its obligation, its Data-protection law the source instrument.")
    sub(1, "o", VALUES, "2 rows, one per office, copied from §2 with their evidence ref")
    sub(1, "help", OPEN, "Open BKB-ADD-16 from Policies › Policy Library and read §2 before you write anything. Copy each value exactly as it is written there.")
    sub(2, "o", "Decision T3.1-D1 recorded with the rule used", "Decision T3.1-D1 checked; every row holds one duty (R10)")
    sub(3, "w", "Copy the lead-regulator rows from §2.1 and the sector rows from §6.",
        "Copy the lead-regulator rows from BKB-ADD-16 §2.1 and the sector rows from §6, one register row for each.")
    sub(3, "o", VALUES, "10 rows copied from §2.1 and §6, with their evidence ref")
    sub(3, "help", COPY, "Copy each line exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section) in the Evidence ref column.")
    old4 = 'Open Organization_Profiles. Copy the first three "Key Requirements" for GlobalConnect Customer Solutions as contract obligations.'
    new4 = "open Organization_Profiles (Policies › Policy Library) and copy the first three Key Requirements of GlobalConnect Customer Solutions, one row each, as contract obligations."
    sub(4, "w", "Then: " + old4, "Then: " + new4)
    sub(4, "help", old4, new4[0].upper() + new4[1:])
    sub(4, "o", "Decision T3.1-D2 recorded with the rule used", "Decision T3.1-D2 checked; 3 contract rows copied")
    old5 = "For each row copy the owner role, the evidence and the frequency from the linked BKB policy (BKB-POL-000 index). Write the rule used."
    new5 = "for each row choose the BKB policy that implements it (BKB-POL-000 index); its owner role is filled from the index by itself. Copy the deadline or frequency the obligation states."
    sub(5, "w", "Then: " + old5, "Then: " + new5)
    sub(5, "help", old5, new5[0].upper() + new5[1:])
    sub(5, "o", "Decision T3.1-D3 recorded with the rule used", "Decision T3.1-D3 checked; every row linked to its policy")
    sub(6, "t", "Stop at 15 rows (take them in the order above).", "Stop at 15 rows")
    sub(6, "w", "Stop at 15 rows (take them in the order above).", "Bring the register to 15 rows: keep the 3 contract rows and remove two others.")
    sub(6, "o", "Step ticked in the work log", "Register at 15 rows, 3 of them contract")
    sub(6, "help", "Do exactly what the step says, one action at a time; the step names its source and its output.",
        "Steps 1 to 4 give 17 rows. Keep the 3 contract rows and remove two others, so that the register holds 15.")
    sub(7, "o", "Decision T3.1-D4 recorded with the rule used", "Decision T3.1-D4 checked; both offices' clocks compared with Annex A")
    sub(8, "t", 'Submit OBL-REG. Click "Done".', "Hand in OBL-REG")
    sub(8, "w", 'Submit OBL-REG. Click "Done".', "Check that OBL-REG has no empty cell, name the file and submit it.")
    tool(8, "regwatch|Obligations Register")

    # LI-01 is worked in Frameworks › Framework Library (its card: "Framework map, sheet ISO/IEC 27000 family").
    for n in range(9, 15):
        tool(n, "frameworks|Framework Library")
    sub(9, "t", "Open T-LI-FAM. The 10 documents are listed.", "Record whether each document is certifiable, and who uses it")
    sub(9, "w", LI1 + "Open T-LI-FAM. The 10 documents are listed.",
        LI1 + "Open T-LI-FAM: its 10 documents are listed. For each, record from Ref-27000 family (Learn › Reference pages) whether it is certifiable and who uses it.")
    sub(9, "o", VALUES, "Certifiable? and Who uses it recorded for the 10 documents")
    sub(9, "help", OPEN, "Open Ref-27000 family from Learn › Reference pages and read it before you choose anything.")
    steps[8]["refs"]["pages"] = ["Ref-27000 family"]
    sub(10, "t", "Copy the one-line purpose for each document from Ref-27000 family (Le…", "Choose the one-line purpose of each document")
    sub(10, "w", "Copy the one-line purpose for each document from Ref-27000 family (Learn › Reference).",
        "Choose the one-line purpose of each document, as Ref-27000 family (Learn › Reference pages) gives it.")
    sub(10, "o", VALUES, "Purpose recorded for the 10 documents")
    sub(10, "help", COPY, "Each document's purpose is a sentence of Ref-27000 family; choose that same sentence.")
    sub(11, "o", VALUES, "Requirements or guidance chosen for the 10 documents (L02)")
    sub(11, "help", RULE, "")
    sub(12, "o", VALUES, "Clauses 4–10 placed in Plan, Do, Check or Act (L01)")
    sub(12, "help", RULE, "")
    sub(13, "t", "Copy the fixed note on Amendment 1:2024 (climate change in 4.1 and 4.…", "Copy the note on Amendment 1:2024")
    sub(13, "w", "Copy the fixed note on Amendment 1:2024 (climate change in 4.1 and 4.2).",
        "Copy the note on Amendment 1:2024 (climate change in 4.1 and 4.2) from the ISO/IEC 27001 row of Ref-27000 family.")
    sub(13, "o", VALUES, "Note on Amendment 1:2024 copied")
    sub(13, "help", COPY, "Copy it exactly as Ref-27000 family writes it, then name the page in the Source line.")
    steps[12]["refs"]["pages"] = ["Ref-27000 family"]
    sub(14, "t", 'Submit LI-FAM. Click "Done".', "Hand in LI-FAM")
    sub(14, "w", LI1 + 'Submit LI-FAM. Click "Done".', LI1 + "Check that LI-FAM has no empty cell, name the file and submit it.")
    sub(14, "o", VALUES, "LI-FAM submitted with manifest")

    # LI-02 is worked in Home › My Organisation (its card: "Home › My Organisation").
    for n in range(15, 20):
        tool(n, "home|My Organisation")
    sub(15, "t", "Open T-LI-SCOPE", "Complete the scope statement")
    sub(15, "w", "covers ___ at ___.\"", "covers ___ at ___.\" Covers: the departments of your office in BKB-ADD-16 §8.1. At: the office.")
    sub(15, "o", VALUES, "Scope statement completed, with its source")
    sub(15, "help", OPEN, "Open BKB-ADD-16 from Policies › Policy Library: §8.1 lists your office's departments. Rule L03: in scope = the office and its departments.")
    steps[14]["refs"]["docs"] = [["BKB-ADD-16", ["8.1"]]]
    sub(16, "o", VALUES, "Out of scope and interfaces recorded (L03)")
    steps[15]["refs"]["docs"].append(["BKB-ADD-16", []])  # L03: only what the addendum lists as excluded
    sub(16, "help", RULE, "")
    sub(17, "o", VALUES, "Climate-change row copied (L03)")
    sub(17, "help", COPY, "Copy the climate-change row of Ref-ISMS processes exactly as it is written, then name the page in the Source line.")
    sub(18, "o", VALUES, "10 ISMS processes copied with their owners (L04)")
    sub(18, "help", RULE, "")
    sub(19, "t", 'Submit LI-SCOPE. Click "Done".', "Hand in LI-SCOPE")
    sub(19, "w", LI2 + 'Submit LI-SCOPE. Click "Done".', LI2 + "Check the scope statement on its page, name the file and submit it.")
    sub(19, "o", VALUES, "LI-SCOPE submitted with manifest")

    # Organization_Profiles is "the organisation profile workbook of the library" (step 4's own reference):
    # the step opens it from Policies › Policy Library, which did not list it.
    if not any(d[0] == "Organization_Profiles" for d in w["library"]["docs"]):
        w["library"]["docs"].append(["Organization_Profiles", "Organisation profiles — Key Requirements (workbook)", [["1", "GlobalConnect Customer Solutions"], ["2", "LearnTech Educational Solutions"]]])
    # "The reference pages are under Learn › Reference" (pack help notes; the task card: "Learn › Reference
    # pages"): the toolbar's Learn menu had no such screen, so Ref-27000 family and Ref-ISMS processes
    # could not be opened.
    learn = w["sections"]["learn"]["tools"]
    if not any(x["n"] == "Reference pages" for x in learn):
        learn.append({"n": "Reference pages", "d": "Reference sheets of your pack", "k": "L10"})
    w["tp"]["learn|Reference pages"] = {"tool": "Learn › Reference pages", "stamp": "Reference", "kind": "list", "pl": {}}


def t32(w: dict) -> None:
    """T3.2 in the platform's own terms (tester report, 28 Oct 2026), keeping the pack's intent.

    No step chose the BKB policy before step 3 asked for "the policy"'s procedure section; step 1 asked for
    ID, standard and title, which MAP-8 already gives; the three candidate controls of step 2 are not in the
    pack; LI-05 opened Map Control, MAP-XW's screen. Step 1 now chooses the policy, step 2 the control from
    Annex A, step 3 reads the policy's procedures; LI-05 is worked in Frameworks › Export Mapping ("MAP-XW
    and SoA"). The Map Control screen shows dataset MAP-8, not another sample. Listed in
    docs/GRC101_Content_Corrections.md (items 47-52).
    """
    t = w["tasks"]["T3.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T3.2"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    LI = "[LI-05 — Statement of Applicability (SoA)] "
    OPEN = "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything."
    sub(1, "t", "Open dataset MAP-8", "Choose the BKB policy that covers each requirement")
    sub(1, "w", "Open dataset MAP-8. Copy the requirement ID, standard and title into the template.",
        "Your 8 requirements from dataset MAP-8 are already in MAP-XW. For each, choose the BKB policy that covers it: "
        "Frameworks › Crosswalk View gives the policy of common key words, and BKB-POL-000 (Policies › Policy Library) lists "
        "every policy in §3 and the policy of each sector obligation in §8.")
    sub(1, "o", "Values copied with evidence ref", "BKB policy chosen for the 8 requirements")
    # The order the key follows (corrections item 47): BKB-POL-000 §8 names the policy that implements each
    # kind of standard; a narrower policy takes a requirement only where a Crosswalk View key word is what the
    # requirement and that policy's title are both about.
    sub(1, "help", OPEN, "Start with BKB-POL-000 §8: it names the policy that implements each kind of standard. Then read the requirement itself: "
        "where one of its words is a key word in Frameworks › Crosswalk View, and that policy's title (BKB-POL-000 §3) is about the same thing, "
        "that narrower policy covers it. A key word is a lead, not an answer: read the requirement and the title together.")
    steps[0]["refs"]["docs"] = [["BKB-POL-000", ["3", "8"]]]
    sub(2, "t", "choose the matching Annex A control f…", "choose the Annex A control that implements it")
    sub(2, "w", "Guidance: policy §9 mapping tables.", "Guidance: Frameworks › Crosswalk View, for the policy you chose in step 1.")
    # Step 2 offers three candidate controls per requirement (platform-written, corrections item 47): the
    # pack's text "from the three candidates shown" now holds.
    old3 = 'Check the policy for a procedure section. Write its number, or "none".'
    sub(3, "t", old3, "Find the procedure in each row's policy")
    sub(3, "w", old3, 'Open each row\'s BKB policy in Policies › Policy Library. If one of its "Procedure:" sections carries out the requirement, type its number (e.g. 6.1); otherwise type "none".')
    sub(3, "o", "Step ticked in the work log", 'Procedure section or "none" recorded for the 8 requirements')
    sub(3, "help", "Do only what the step says, for the rows it names. If a rule is named, follow its numbered questions in order.",
        'Open the row\'s policy from Policies › Policy Library: its §6 lists its procedures by name. Type the number of the one that carries out the requirement, or "none" if no procedure does. R11 counts it in step 4.')
    # Help that states a decision's answer before it is checked (owner rule, 28 Oct 2026): step 5's note
    # quotes R12's frame, which is option C word for word; step 12's quotes L06, whose first sentences
    # decide D7. Each now says where the rule is read.
    sub(5, "help", ' Rule R12 (Gap sentence): Write: "Missing: <policy clause / procedure / control>. Owner: <policy owner>."',
        " Rule R12 is in Learn › Rule tables; the gap sentences of part 2 follow it.")
    l06 = (' Rule L06 (SoA applicability): Every control is Applicable. A control is Not applicable only if it appears in Ref-SoA exclusions '
           '(Learn › Reference); copy the justification shown there. Justification for applicable controls: copy the first source found in '
           'this order — risk register treatment ID, law in addendum §2, contract in Organization_Profiles, "Group baseline (BKB-POL-001)".')
    sub(12, "help", l06, " Rule L06 (Learn › Reference pages › Ref-Rules) says when a control may be Not applicable, and where a justification comes from: read it before you choose.")
    sub(2, "o", "Per-row decisions recorded in MAP-XW", "Annex A control chosen for the 8 requirements")
    sub(4, "o", "Per-row decisions recorded in MAP-XW", "Coverage rated with R11 for the 8 requirements")
    sub(5, "o", "Decision T3.2-D3 recorded with the rule used", "Decision T3.2-D3 checked; a gap sentence (R12) on every Partial or None row")
    sub(6, "t", 'Fill "Evidence ref" for every row.', "Fill Evidence ref for every row")
    sub(6, "w", 'Fill "Evidence ref" for every row.', "Fill Evidence ref for every row: the row's BKB policy, then the section of it you read (BKB-POL-… §…).")
    sub(6, "o", "Step ticked in the work log", "Evidence ref recorded for the 8 rows")
    sub(6, "help", "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column.",
        "Name where a reader can check each row: its BKB policy and the section you read in it, such as its procedure section or §9 Framework mapping.")
    sub(7, "t", 'Submit MAP-XW. Click "Done".', "Hand in MAP-XW")
    sub(7, "w", 'Submit MAP-XW. Click "Done".', "Check that MAP-XW has no empty cell, name the file and submit it.")
    tool(7, "frameworks|Map Control")
    # LI-05 is worked in Frameworks › Export Mapping ("MAP-XW and SoA"), not in Map Control (MAP-XW's screen).
    for n in range(8, 14):
        tool(n, "frameworks|Export Mapping")
    sub(8, "t", "Open T-LI-SOA. The 93 controls are listed.", "Check the SoA template against Annex A")
    sub(8, "w", LI + "Open T-LI-SOA. The 93 controls are listed.",
        LI + "Open T-LI-SOA: the 93 controls of Annex A are listed. Check that it ends each of Annex A's four themes where the standard does.")
    sub(8, "o", "LI-SOA updated", "The last control of three themes found in T-LI-SOA")
    sub(8, "help", OPEN, "Annex A of ISO/IEC 27001:2022 has four themes: A.5 Organisational, A.6 People, A.7 Physical, A.8 Technological. Scroll the template to where each theme ends.")
    steps[7]["refs"]["tpls"] = []
    for n in (9, 11, 12):
        for f in ("w", "help"):
            if "(Learn › Reference)" in steps[n - 1][f]:
                sub(n, f, "(Learn › Reference)", "(Learn › Reference pages)")
    sub(9, "o", "Per-row decisions recorded in MAP-XW", "Applicable or Not applicable, and L06's justification, recorded for the 93 controls")
    sub(10, "o", "Per-row decisions recorded in MAP-XW", "Implementation status of the 12 deep-dive controls recorded with L07")
    sub(11, "o", "Per-row decisions recorded in MAP-XW", "Cybersecurity concept recorded for the 12 deep-dive controls")
    sub(12, "o", "Decision T3.2-D7 recorded with the rule used", "Decision T3.2-D7 checked; the consistency check finds no row against L06")
    # Steps 9 and 12 cited BKB-POL-001 (no text on the platform) and Organization_Profiles for L06's
    # justification, which is awaiting content: nothing there answers either step.
    for n in (9, 12):
        steps[n - 1]["refs"]["docs"] = []
        steps[n - 1]["refs"]["wbs"] = []
        # Learn › Rule tables shortens long rules ("…"); Ref-Rules gives L06 in full.
        steps[n - 1]["refs"]["pages"].append("Ref-Rules")
    # LI-05's sources (corrections item 49): LearnTech's risk register (RA-36, sheet HQ Istanbul) and the
    # TSA-36 Control_Mapping sheet, from the pack's engine (context.json, techlab_catalogue.json), and a
    # platform-written TSA-36 Roadmap sheet. Built by scratchpad gen_lt36.py into lt36-pages.json; shown in
    # Learn › Reference pages, where the step's other sources are.
    extra = json.loads((Path(__file__).resolve().parent / "lt36-pages.json").read_text(encoding="utf8"))
    for k, v in extra.items():
        assert k not in w["pages"], k
        w["pages"][k] = v
    steps[8]["refs"]["pages"].insert(0, "RA-36 Risk register (HQ Istanbul)")
    steps[9]["refs"]["pages"] += ["TSA-36 Control_Mapping", "TSA-36 Roadmap"]
    steps[11]["refs"]["pages"].insert(0, "RA-36 Risk register (HQ Istanbul)")
    sub(13, "t", 'Submit LI-SOA. Click "Done".', "Hand in LI-SOA")
    sub(13, "w", LI + 'Submit LI-SOA. Click "Done".', LI + "Check that LI-SOA has no empty cell, name the file and submit it.")
    # Map Control's screen showed another sample's eight rows (GDPR Art.45, KVKK Art.6 …); the mentee's
    # dataset MAP-8 is ISO/IEC 29151 A.11, GDPR Art.12 … The screen shows the dataset.
    rows = [[r[0], r[1], r[2], r[3], "copy", "copy", "◆ Decide"] for r in w["ds"]["MAP-8"]["r"]]
    for panel in (t["panel"], w["tp"]["frameworks|Map Control"]):
        panel["pl"]["r"] = rows
    w["tp"]["frameworks|Export Mapping"]["stamp"] = "MAP-XW and SoA"
    w["li"]["LI-05"]["card"]["where"]["tool"] = "Frameworks › Export Mapping"


def t41(w: dict) -> None:
    """T4.1 in the platform's own terms (desk-step-builder, 28 Oct 2026), keeping the pack's intent.

    The pack's step 2 searched Q1 only and step 5 said "Repeat for Q2 to Q6", while steps 3 and 4 decide every
    row: step 2 now records each requirement's clause, and step 5 writes the redlines the engine's step 4 asks
    for ("Write the redline with the R13 frame"; POL-GAP is "Gap table and redlines"). Steps 6 and 10 hand the
    files in where they were filled. The Review & Redline screen showed another policy's six requirements
    (BKB-POL-017's); it now shows dataset POL-GAP. Listed in docs/GRC101_Content_Corrections.md (item 57).
    """
    t = w["tasks"]["T4.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T4.1"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    LI = "[LI-06 — ISMS policy conformity, leadership evidence and roles (RACI)] "
    SCORED = "The platform scores each row against the key after you submit."
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    # Step 1: the engine's step copies the document-control values too ("Copy the document-control values into
    # POL-CUR. Write Yes or No for each checklist line"); POL-CUR is "Check | Yes/No | Value copied | Evidence ref".
    sub(1, "w", "decide Yes or No. Options:", "copy the value from the document-control table of BKB-POL-006 (§11) and decide Yes or No. Options:")
    sub(1, "w", "Guidance: the document-control table.", "Guidance: the document-control table, read against BKB-POL-000 §2 and §7.")
    sub(1, "o", "Per-row decisions recorded in POL-CUR", "Value copied and Yes or No decided for the 6 lines of POL-CUR")
    sub(1, "help", SCORED, "Copy each line's value from BKB-POL-006 §11 as written, then decide whether it meets the line: BKB-POL-000 §2 says who approves a policy, §7 how its lifecycle runs. " + CHECK)
    steps[0]["refs"]["docs"] = [["BKB-POL-006", ["11"]], ["BKB-POL-000", ["2", "7"]]]
    old2 = "Open POL-GAP. For Q1, search BKB-POL-006 Access Control and Identity Management Policy and BKB-ADD-16 for the action words of the requirement."
    sub(2, "t", "Open POL-GAP", "Find the clause that covers each requirement")
    sub(2, "w", old2, "Open POL-GAP. For each requirement, starting with Q1, search BKB-POL-006 Access Control and Identity Management Policy "
        "and BKB-ADD-16 for the action words of the requirement, and record the clause that holds them, or none.")
    sub(2, "o", "POL-GAP updated", "Policy clause, or none, recorded for Q1 to Q6")
    sub(2, "help", "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything.",
        "Pick out the requirement's action words: what must be done, to what. Look for them in BKB-POL-006 §3 to §7 and in BKB-ADD-16 §5 and §6 "
        "(Policies › Policy Library). A bullet of §3.1 is counted from the top: the first is bullet 1. Check my answers then shows each row's clause and why.")
    steps[1]["refs"]["docs"] = [["BKB-POL-006", ["3", "4", "6", "7"]], ["BKB-ADD-16", ["5", "6"]]]
    sub(3, "o", "Per-row decisions recorded in POL-CUR", "Coverage decided with R13 for Q1 to Q6")
    sub(3, "help", SCORED, CHECK)
    sub(4, "o", "Per-row decisions recorded in POL-CUR", "Fix location decided with R13 for every gap")
    sub(4, "help", SCORED, CHECK)
    sub(5, "t", "Repeat for Q2 to Q6.", "Write the redline for each gap")
    sub(5, "w", "Repeat for Q2 to Q6.", 'For each requirement you rated Partly or Not covered, write the redline in rule R13\'s frame: '
        '"<Role> shall <action> within <time limit>." Never make a Group value weaker; if a redline would, write "Exception needed".')
    sub(5, "o", "Step ticked in the work log", "A redline in the R13 frame for every gap")
    sub(5, "help", "Do only what the step says, for the rows it names. If a rule is named, follow its numbered questions in order.",
        "Policy language is \"shall\" (BKB-POL-000 §2). Name the role that acts, as BKB-POL-006 §5 or §6 names it, the action the requirement asks for, "
        "and a time limit. A covered row needs no redline. The frame is checked as you type; what each redline says is reviewed at checkpoint HC2.")
    sub(6, "t", 'Submit POL-CUR and POL-GAP. Click "Done".', "Hand in POL-CUR and POL-GAP")
    sub(6, "w", 'Submit POL-CUR and POL-GAP. Click "Done".', "Check that POL-CUR and POL-GAP have no empty cell, name the two files and submit them.")
    tool(6, "policies|Review & Redline")
    sub(7, "o", "Per-row decisions recorded in POL-CUR", "Found or Gap decided with L08 for the 7 items, with the section of each item found")
    sub(7, "help", SCORED, CHECK)
    sub(7, "w", "decide Found or Gap. Options:", "decide Found or Gap, and copy the section number of each item found. Options:")
    sub(8, "help", "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column. Reference page (Learn › Reference): Ref-Leadership.",
        "Learn › Reference pages › Ref-Leadership lists the five items and where each is stored. Copy both columns exactly as written, one row per item.")
    sub(8, "o", "Values copied with evidence ref", "The 5 leadership evidence items copied, each with where it is stored")
    steps[7]["refs"]["pages"] = ["Ref-Leadership"]
    # L09's "Charter table for the 10 ISMS processes" is Ref-ISMS processes (L04: "the Group RACI in the Charter");
    # Charter §16 lists the Group's 16 core GRC processes, not these ten (Content Corrections item 57).
    sub(9, "w", "Then: Apply rule L09. Copy the RACI.",
        "Then: apply rule L09: record the Accountable role of each of the 10 ISMS processes.")
    sub(9, "help", "Then do the step that follows: Apply rule L09. Copy the RACI. Rule L09 (RACI): Copy the RACI from the Charter table for the 10 ISMS processes (rule L04). Do not change any letter.",
        "Then record the Accountable role of each ISMS process with rule L09: once your answer is checked, the RACI's note names the page to copy it from. Do not change any letter.")
    sub(9, "o", "Decision T4.1-D5 recorded with the rule used", "Decision T4.1-D5 checked; the Accountable role of the 10 ISMS processes recorded (L09)")
    # Nothing read before D5 is answered may state its outcome (owner, 28 Oct 2026): Ref-ISMS processes lists
    # "Statement of Applicability → CISO", so the step names it only in the RACI's note, which opens once the pick
    # is checked; L04 names the page, so the step cites L09 alone (the note quotes "L09, read with L04").
    steps[8]["refs"]["docs"] = []
    steps[8]["refs"]["pages"] = []
    steps[8]["refs"]["rules"] = ["L09"]
    # The LI-06 card's "why" and "important" lines ruled out D5's option A before it was asked (owner, 28 Oct).
    card = w["li"]["LI-06"]["card"]
    lic = {r[0]: r for r in w["licards"]["LI-06"]}
    for field, label, old, new in [
        ("why", "Why am I doing this", "The RACI makes the three lines real and keeps Internal Audit independent.",
         "The RACI makes the three lines real: one accountable role for each process."),
        ("important", "Why is this important", 'Internal Audit must never be Accountable for operating a control (decision T4.1-D5). Exactly one "A" per activity is what makes a RACI usable.',
         'Exactly one "A" per activity is what makes a RACI usable; who may hold it follows the three lines of the Charter (decision T4.1-D5).'),
    ]:
        assert old in card[field], (field, card[field])
        card[field] = card[field].replace(old, new)
        assert old in lic[label][1], (label, lic[label])
        lic[label][1] = lic[label][1].replace(old, new)
    sub(10, "t", 'Submit LI-POL. Click "Done".', "Hand in LI-POL")
    sub(10, "w", LI + 'Submit LI-POL. Click "Done".', LI + "Check that LI-POL has no empty cell, name the file and submit it.")
    tool(10, "policies|Review & Redline")
    # Step 5 now writes the redlines (KR2 named it for finding gaps); the engine's KR3 is "one redline per gap
    # using the R13 frame, with the fix location".
    krs = t["krs"]
    assert krs[1].endswith("· Activities 2–3, 5") and krs[2].startswith("KR3 — Fix location correct for every gap;"), krs
    krs[1] = krs[1].replace("· Activities 2–3, 5", "· Activities 2–3")
    krs[2] = "KR3 — Fix location and a redline in the R13 frame for every gap; POL-CUR and POL-GAP submitted · Activities 4–6"
    # The Review & Redline screen and the task's panel listed BKB-POL-017's probes (data-subject requests, DPIAs …);
    # the mentee's dataset POL-GAP (Datasets_M2610-00001_W04.xlsx) is BKB-POL-006's, which the task assigns.
    rows = [[r[0], r[1], r[2], "◆ Decide"] for r in w["ds"]["POL-GAP"]["r"]]
    for panel in (t["panel"], w["tp"]["policies|Review & Redline"]):
        assert panel["pl"]["r"][0][1].startswith("Data-subject requests"), panel["pl"]["r"][0]
        panel["pl"]["r"] = rows
        panel["pl"]["note"] = 'Redline frame (R13): "<Role> shall <action> within <time limit>."'
        # The task's three files are worked here, POL-CUR and LI-POL as well as POL-GAP: the screen is not titled
        # after one of them.
        assert panel["tool"] == "Policies › Review & Redline (POL-GAP)", panel["tool"]
        panel["tool"], panel["stamp"] = "Policies › Review & Redline", "BKB-POL-006 and BKB-POL-001 review"


def t42(w: dict) -> None:
    """T4.2 in the platform's own terms (desk-step-builder, 28 Oct 2026), keeping the pack's intent.

    The mentee's SOP topic is "Approving a new cloud service" (BKB-POL-021 §6.1). Rule R14 fixes six SOP steps;
    §6.1 gives each line a role, an output and (platform-written) a time limit, and BKB-ADD-36 §5 tightens two of
    them. Step 1 chooses each SOP step's action, step 2 its time limit, step 3 its role (the pack offered an access
    SOP's roles), step 5 its output. LI-07 fills the document-control block and life-cycle from BKB-POL-000 §7.1
    (platform-written) and the mandatory-documents register; Ref-Locations' "Document or record" column, the key of
    step 9, leaves the browser. Steps 6 and 10 hand the files in where they were filled. Text read before a decision
    is answered no longer states its outcome. Listed in docs/GRC101_Content_Corrections.md (item 58).
    """
    t = w["tasks"]["T4.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T4.2"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    LI = "[LI-07 — Documented-information control and the mandatory-documents list] "
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    # Step 1: open the template and choose, for each of R14's six steps, the §6.1 line that carries it out.
    old1 = "Open the SOP template. The six steps are already written (rule R14)."
    sub(1, "t", old1, "Choose the action of each SOP step")
    sub(1, "w", old1, "Open the SOP template: its six steps are fixed by rule R14. For each step, choose the action of BKB-POL-021 §6.1 that carries it out.")
    sub(1, "o", "Step ticked in the work log", "Action chosen for the 6 steps of SOP-DOC")
    old1h = "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything. "
    sub(1, "help", old1h, "BKB-POL-021 §6.1 (Policies › Policy Library) is the procedure your SOP implements; it has seven lines and the SOP six steps, so one line has no step of its own. "
        "For each SOP step choose the §6.1 action that does what the step's name says. " + CHECK + " ")
    steps[0]["refs"]["docs"] = [["BKB-POL-021", ["6.1"]]]
    # Step 2: D1, then each step's time limit. The pack's "Then" sent the mentee to find the clause their task page names.
    old2 = 'Open the source document named on your task page (BKB-POL-021 §6.1). Find the clause for "Approving a new cloud service".'
    sub(2, "w", "Then: " + old2, "Then: record the time limit of each SOP step, from BKB-POL-021 §6.1 and BKB-ADD-36 §5.")
    sub(2, "help", "Then do the step that follows: " + old2, "Then record each SOP step's time limit: BKB-POL-021 §6.1 gives one for each line, and BKB-ADD-36 §5 lists LearnTech's own values for some of them. " + CHECK)
    sub(2, "o", "Decision T4.2-D1 recorded with the rule used", "Decision T4.2-D1 checked; the time limit of each SOP step recorded")
    steps[1]["refs"]["docs"] = [["BKB-POL-021", ["6.1"]], ["BKB-ADD-36", ["5"]]]
    # Step 3: the pack's options (Requester, System owner, IAM team, Control owner) are an access SOP's; this SOP's
    # roles are BKB-POL-021's.
    sub(3, "w", "Options: A) Requester  B) System owner  C) IAM team  D) Control owner. Guidance: the policy RACI table.", "Guidance: the Responsible column of BKB-POL-021 §6.1.")
    steps[2]["opt"] = sorted(["Business owner", "Cloud operations", "Internal Audit", "Org CISO", "Security Architect", "Security Architecture & Standards Manager", "Vendor / Third-Party Risk Analyst"])
    sub(3, "o", "Per-row decisions recorded in SOP-DOC", "Responsible role chosen for the 6 steps of SOP-DOC")
    sub(3, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit.",
        "The role is the one BKB-POL-021 §6.1 names for the line the step carries out. " + CHECK)
    steps[2]["refs"]["docs"] = [["BKB-POL-021", ["6.1"]]]
    # Step 4: the policy's RACI table is §5, Roles and responsibilities.
    old4 = "Copy the RACI roles from the policy RACI table."
    sub(4, "t", old4, "Copy the policy's roles into the SOP's RACI")
    sub(4, "w", old4, "Copy the policy's roles table, BKB-POL-021 §5, into the SOP's RACI: for each role, choose its responsibility as §5 writes it.")
    sub(4, "o", "Values copied with evidence ref", "The 8 roles of BKB-POL-021 §5 copied with their responsibilities")
    sub(4, "help", "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column.",
        "BKB-POL-021 §5, Roles and responsibilities, is the policy's RACI table: one row per role. Choose each role's responsibility as §5 writes it. " + CHECK)
    steps[3]["refs"]["docs"] = [["BKB-POL-021", ["5"]]]
    # Step 5: D3, then the outputs (the records the SOP leaves) and the exception step. Read before D3 is answered, the
    # text names no escalation contact.
    old5 = "Copy the records list and the escalation contact from the policy."
    sub(5, "w", "Then: " + old5, "Then: record what each SOP step produces, from BKB-POL-021 §6.1, and complete the last step from §8.")
    sub(5, "help", "Then do the step that follows: " + old5, "Then record what each SOP step produces (its output: the record it leaves), from BKB-POL-021 §6.1, and complete the last step from §8. " + CHECK)
    sub(5, "o", "Decision T4.2-D3 recorded with the rule used", "Decision T4.2-D3 checked; the output of each SOP step recorded")
    steps[4]["refs"]["docs"] = [["BKB-POL-021", ["6.1", "8"]]]
    sub(6, "t", 'Submit SOP-DOC. Click "Done".', "Hand in SOP-DOC")
    sub(6, "w", 'Submit SOP-DOC. Click "Done".', "Check that SOP-DOC has no empty cell, name the file and submit it.")
    tool(6, "policies|New from Template")
    # Step 7: D4, then the document-control block by BKB-POL-000 §7.1 (platform-written).
    old7 = "Copy the metadata block from the template to the top of your SOP. Fill ID, version, owner, approver, dates, label."
    sub(7, "w", "Then: " + old7, "Then: fill your SOP's document-control block (ID, version, owner, approver, dates, label) by BKB-POL-000 §7.1.")
    sub(7, "help", "Then do the step that follows: " + old7, "Then fill the SOP's document-control block, field by field, by the rules of BKB-POL-000 §7.1. " + CHECK)
    sub(7, "o", "Decision T4.2-D4 recorded with the rule used", "Decision T4.2-D4 checked; the SOP's document-control block filled (BKB-POL-000 §7.1)")
    steps[6]["refs"]["docs"] = [["BKB-POL-000", ["7.1", "2", "3"]]]
    # Step 8: the life-cycle's roles, from BKB-POL-000 §7.1 (platform-written; the pack's "template" text does not exist).
    old8 = "Copy the 7-line life-cycle text from the template."
    sub(8, "t", old8, "Record who does each stage of the SOP's life-cycle")
    sub(8, "w", LI + old8, LI + "For each of the seven stages of your SOP's life-cycle, record who does it, by BKB-POL-000 §7.1, naming each role as it is held for BKB-POL-021.")
    sub(8, "o", "Values copied with evidence ref", "Who does each of the 7 life-cycle stages recorded")
    sub(8, "help", "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column.",
        "BKB-POL-000 §7.1's second table gives the role for each stage. Where it says Policy owner, record the role that owns BKB-POL-021 (BKB-POL-000 §3). " + CHECK)
    steps[7]["refs"]["docs"] = [["BKB-POL-000", ["7.1", "3"]]]
    # Step 9: Document or Record from the standard's own words (Framework Quick Reference), then the location.
    sub(9, "w", "decide Document or Record. Options:", "decide Document or Record, then copy where BKB keeps it from Ref-Locations. Options:")
    sub(9, "o", "Per-row decisions recorded in SOP-DOC", "Document or Record decided, and the BKB location recorded, for the 14 rows of LI-DOC")
    sub(9, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit.",
        "Read each row's documented information against Learn › Framework Quick Reference › ISO/IEC 27001 documented information: does the standard ask for it to be maintained, or retained? "
        "Then copy its BKB library location from Ref-Locations (Learn › Reference pages), by clause. " + CHECK)
    sub(10, "t", 'Submit LI-DOC. Click "Done".', "Hand in LI-DOC")
    sub(10, "w", LI + 'Submit LI-DOC. Click "Done".', LI + "Check that LI-DOC has no empty cell, name the file and submit it.")
    tool(10, "policies|New from Template")
    # KR1 and the card said "the stricter source" and "addenda may only tighten": D1's answer, read before it is asked.
    krs = t["krs"]
    assert krs[0].startswith("KR1 — Every time limit taken from the stricter source (BKB-ADD-36 §5 over the policy)"), krs[0]
    krs[0] = "KR1 — Every SOP step's action and time limit taken from BKB-POL-021 §6.1 or BKB-ADD-36 §5 · Activities 1–2"
    oldl = "Find the LOW-band parameter for an office and know that addenda may only tighten"
    newl = "Find the parameter an addendum sets for an office, and how it stands against the Group policy"
    learn = t["card"]["What will I learn"]
    assert any(oldl in x for x in learn), learn
    t["card"]["What will I learn"] = [x.replace(oldl, newl) for x in learn]
    for r in w["cards"]["T4.2"]:
        if r[0] == "What will I learn":
            r[1] = [x.replace(oldl, newl) for x in r[1]]
    # The template screen and the task's panel showed a skeleton of their own (Trigger, Input, Action, Check, Record,
    # Escalate); rule R14, which the steps apply, names the six differently.
    R14 = ["Trigger received", "Check input", "Do the action", "Record", "Tell the owner", "Exception: escalate"]
    for panel in (t["panel"], w["tp"]["policies|New from Template"]):
        assert panel["pl"]["p"][1] == "<b>2. Input</b> ___", panel["pl"]["p"]
        panel["pl"]["p"] = [f"<b>{i}. {x}</b> ___" for i, x in enumerate(R14, 1)]
        panel["pl"]["note"] = "The six steps are fixed by rule R14. You fill each one's action, time limit, responsible role and output."
    # Ref-Locations' "Document or record" column is the key of step 9: it stays on the server (row key T4.2-9).
    loc = w["pages"]["Ref-Locations"]
    assert loc["h"][2] == "Document or record", loc["h"]
    del loc["h"][2]
    for r in loc["r"]:
        del r[2]
    # Step 9 decides from the standard's wording; Learn › Framework Quick Reference says what it means (a general fact
    # about ISO/IEC 27001, platform-written).
    qr = w["tp"]["learn|Framework Quick Reference"]["pl"]["p"]
    qr.append("<b>ISO/IEC 27001 documented information</b> Clause 7.5 controls all of it. Where a clause says the organisation shall "
              "“maintain” documented information, it is a document: kept current and changed under control, such as a scope, a policy, "
              "a process or objectives. Where it says “retain” documented information, as evidence, it is a record: kept unchanged as "
              "proof of what was done or found, such as evidence of competence or the results of a review, an audit or a measurement.")
    # Looked up by name, as main() sorts the others.
    def by_name(line):
        name = line.split("</b>")[0].removeprefix("<b>").lower().replace("/iec", "")
        return [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", name)]
    qr.sort(key=by_name)
    for d in w["library"]["docs"]:
        if d[0] == "BKB-POL-000":
            secs = [x[0] for x in d[2]]
            d[2].insert(secs.index("7") + 1, ["7.1", "Document control of procedures"])


def t51(w: dict) -> None:
    """T5.1 in the platform's own terms (desk-step-builder, 28 Oct 2026), keeping the pack's intent.

    PBC-LIST is built on the mentee's dataset PBC-6 (the panel showed another six controls). The platform copies each
    control in; step 1 chooses the evidence each request asks for (the engine's own first step), step 2 copies the
    system, step 3 the R15 sample, step 4 the owner (the pack's "Owner option 1–3" placeholders become a shortlist from
    the GRC Charter §16 RACI), steps 5 and 6 the R16 due date and R17's criteria after their questions. BKB-POL-016 §6.2
    and §7.1 are platform-written. LI-08 fills LI-CERT from the Ref-Certification card. Text read before a question no
    longer states its answer. Steps 7 and 13 hand the files in where they were filled. Corrections item 60.
    """
    t = w["tasks"]["T5.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T5.1"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    def rep(obj, old: str, new: str) -> int:
        """Replaces `old` in every string of `obj`; returns how many strings changed."""
        n = 0
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, str) and old in v:
                    obj[k], n = v.replace(old, new), n + 1
                else:
                    n += rep(v, old, new)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                if isinstance(v, str) and old in v:
                    obj[i], n = v.replace(old, new), n + 1
                else:
                    n += rep(v, old, new)
        return n

    LI = "[LI-08 — Certification audit readiness: Stage 1, Stage 2, certification body] "
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    PBC = "evidence|Audit Requests (PBC)"
    OPEN = "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything."
    # The screen and the task's panel listed six other controls (C07, C13, C11, C04, C16, C03); the mentee's dataset
    # PBC-6 (Datasets_M2610-00001_W05.xlsx) is C11, C07, C22, C14, C12, C15. They show the dataset as it is.
    ds = w["ds"]["PBC-6"]
    for panel in (t["panel"], w["tp"][PBC]):
        assert panel["pl"]["r"][0][0] == "C07" and panel["pl"]["h"][5] == "Sample (R15)", panel["pl"]["r"][0]
        panel["pl"]["h"], panel["pl"]["r"] = list(ds["h"]), [list(r) for r in ds["r"]]
        panel["pl"]["note"] = "Dataset PBC-6: the six controls in scope of the audit, for Manila, Philippines."
    # Step 1: the platform copies the controls in; the mentee chooses what each request asks for.
    old1 = "Open dataset PBC-6. Copy the six controls into the template."
    sub(1, "t", old1, "Choose the evidence each request asks for")
    sub(1, "w", old1, "Dataset PBC-6 lists the six controls in scope of the audit, and PBC-LIST has a request for each. For each control, choose the evidence that shows it operated during the audit period, by BKB-POL-016 §6.2.")
    sub(1, "o", "Values copied with evidence ref", "Evidence requested chosen for the 6 requests of PBC-LIST")
    sub(1, "help", OPEN, "BKB-POL-016 §6.2 (Policies › Policy Library) says what a request asks for. Read each control's description and choose the evidence that shows it ran. " + CHECK)
    steps[0]["refs"]["docs"] = [["BKB-POL-016", ["6.2"]]]
    # Step 2: the system is copied; the period is the task's own input, written by the platform.
    old2t = "For each control copy the system and write the period 2025-09-05 to 2…"
    sub(2, "t", old2t, "Copy each control's system from dataset PBC-6")
    sub(2, "w", "For each control copy the system and write the period 2025-09-05 to 2026-09-04.",
        "For each control, copy its system from dataset PBC-6 (Evidence › Audit Requests (PBC)). The population is every record in that system, and the period is the audit period, 2025-09-05 to 2026-09-04: the platform writes both.")
    sub(2, "o", "Values copied with evidence ref", "System copied for the 6 requests; population and period recorded")
    sub(2, "help", "Repeat the same small action for every row the step names, one row at a time, and write the source next to each value.",
        "Open Evidence › Audit Requests (PBC) from the toolbar: dataset PBC-6 opens beside your list. Copy each control's System as written there. A value that is not the dataset's is flagged with where to read it.")
    steps[1]["refs"]["docs"] = [["BKB-POL-016", ["6.2"]]]
    # Step 3: R15. The help's "random seed … Select sample" names a feature the platform does not have.
    sub(3, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit. Rule R15 (Sample size): Look up the control frequency in Ref-Sampling and copy the minimum sample. Select the sample with the random seed shown on your task page (the platform does the selection when you click \"Select sample\"). Reference page (Learn › Reference): Ref-Sampling.",
        "Rule R15: find the control's frequency in dataset PBC-6 (Evidence › Audit Requests (PBC)), then its minimum sample in Ref-Sampling (Learn › Reference pages). " + CHECK)
    sub(3, "o", "Per-row decisions recorded in PBC-LIST", "Minimum sample chosen for the 6 requests of PBC-LIST")
    # Step 4: the pack's options were placeholders ("Owner option 1–3"); each row offers a shortlist of three roles
    # from the GRC Charter §16 RACI, which BKB-POL-016 §6.2 names (platform-written). Worked on the list itself.
    sub(4, "w", "Options: A) Owner option 1  B) Owner option 2  C) Owner option 3. Guidance: asset register / RACI.",
        "Options: A) the three roles shortlisted in each row. Guidance: the RACI of the GRC Charter, §16, as BKB-POL-016 §6.2 says.")
    steps[3]["opt"] = sorted({"Security Awareness & Training Specialist", "Chief Information Security Officer (CISO)", "Compliance Manager", "Vulnerability Management Governance Analyst",
                              "Cyber Risk Manager", "Privacy Compliance Analyst", "Data Protection Officer (DPO)", "Vendor / Third-Party Risk Analyst",
                              "Cyber Threat Intelligence Analyst", "Incident Response & Crisis Manager", "Information Security Auditor"})
    sub(4, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit.",
        "Each row shortlists three roles. BKB-POL-016 §6.2 says which role a request goes to, and the GRC Charter §16 (Policies › Policy Library) is the RACI it names: find the process each control belongs to. " + CHECK)
    sub(4, "o", "Per-row decisions recorded in PBC-LIST", "Owner chosen for the 6 requests of PBC-LIST")
    tool(4, PBC)
    steps[3]["refs"]["docs"] = [["BKB-POL-016", ["6.2"]], ["Charter", ["7.1", "16"]]]
    # Step 5: D3, then R16 worked out in its steps (period end, fieldwork start, due date); the list takes the due date.
    sub(5, "w", "Then: Apply rule R16. Write the due date.", "Then: by rule R16, work out when the audit period ends, when fieldwork starts and when your requests are due.")
    sub(5, "help", "Then do the step that follows: Apply rule R16. Write the due date.", "Then work out R16's dates for your list, one line at a time; the due date then goes on every request. " + CHECK)
    sub(5, "o", "Decision T5.1-D3 recorded with the rule used", "Decision T5.1-D3 checked; the request timeline worked out by R16")
    # Step 6: D4 only (owner, 28 Oct: part 2 only where it is real work). Its part 2 copied R17's sentence, the same on
    # every request: the platform writes it, and the request's sentence frame, on every row. The help quoted R17, which
    # decides D4: it names where R17 is instead.
    sub(6, "w", " Then: Copy the R17 text into \"Acceptance criteria\". Complete the evidence-request sentence frame.", "")
    sub(6, "help", " Then do the step that follows: Copy the R17 text into \"Acceptance criteria\". Complete the evidence-request sentence frame. Rule R17 (Acceptance criteria text): Copy for every request: \"The evidence must be dated, show who produced it, cover the whole period and be an unchanged system export.\"",
        " Rule R17 is in Learn › Rule tables. Once your answer is checked, the platform writes R17's sentence on every request of your list, and completes each request's sentence frame.")
    sub(6, "o", "Decision T5.1-D4 recorded with the rule used", "Decision T5.1-D4 checked")
    # Step 7: handed in where it was filled.
    sub(7, "t", 'Submit PBC-LIST. Click "Done".', "Hand in PBC-LIST")
    sub(7, "w", 'Submit PBC-LIST. Click "Done".', "Check that PBC-LIST has no empty cell, name the file and submit it.")
    tool(7, PBC)
    # Step 8: a reading step becomes LI-CERT's Stage 1 / Stage 2 table, copied from the card's own words.
    old8 = "Open T-LI-CERT and the sheet Ref-Certification card."
    sub(8, "t", old8, "Fill the Stage 1 and Stage 2 table from the certification card")
    sub(8, "w", LI + old8, LI + "Open the Ref-Certification card (Learn › Reference pages). For Stage 1 and Stage 2, record what the auditor does, where, and what the stage produces.")
    sub(8, "o", "LI-CERT updated", "Stage 1 and Stage 2 table of LI-CERT filled")
    sub(8, "help", OPEN + " Reference page (Learn › Reference): Ref-Certification card.",
        "The Ref-Certification card (Learn › Reference pages) has a row for each stage. For each line of the table, choose the card's words. " + CHECK)
    # Step 9: the help quoted rule L11, which answers step 9 and D6 (step 10): it names where L11 is instead.
    sub(9, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit. Rule L11 (Certification facts): Copy from Ref-Certification card (Learn › Reference): Stage 1 = documents and readiness; Stage 2 = implementation on site; surveillance in years 2 and 3; recertification before year 3 ends. Certification-body criteria = the 5 listed on the card, in order.",
        "Read each activity against the card's Stage 1 and Stage 2 rows (Learn › Reference pages › Ref-Certification card; rule L11 is in Learn › Rule tables). " + CHECK)
    sub(9, "o", "Per-row decisions recorded in PBC-LIST", "Stage 1 or Stage 2 decided for the 8 audit activities of LI-CERT")
    # Steps 10 and 11: D6 and D7, then the cycle and the criteria from the card.
    # Steps 10 and 11: the question only. Their part 2 copied the rest of the card row the question had just been read
    # from (the cycle; the criteria in order): the platform writes both into LI-CERT from the card.
    sub(10, "w", " Then: Fill the 3-year cycle diagram.", "")
    sub(10, "help", " Then do the step that follows: Fill the 3-year cycle diagram.", " LI-CERT's 3-year cycle is then written from the Ref-Certification card.")
    sub(10, "o", "Decision T5.1-D6 recorded with the rule used", "Decision T5.1-D6 checked")
    sub(11, "w", " Then: Copy the 5 certification-body criteria.", "")
    sub(11, "help", " Then do the step that follows: Copy the 5 certification-body criteria.", " LI-CERT's five criteria are then written from the Ref-Certification card, in its order.")
    sub(11, "o", "Decision T5.1-D7 recorded with the rule used", "Decision T5.1-D7 checked")
    # Step 12: the copy becomes the briefing's sorting: each behaviour the card names, do or do not.
    old12 = "Copy the auditee do/don't list."
    sub(12, "t", old12, "Sort the auditee briefing into do and do not")
    sub(12, "w", LI + old12, LI + "Brief control owners for the audit: for each behaviour, record whether the Ref-Certification card says do it or do not.")
    sub(12, "o", "Values copied with evidence ref", "Do or Do not recorded for the 10 behaviours of the auditee briefing")
    sub(12, "help", "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column.",
        "The card's last two rows list what an auditee does and does not do in an audit. " + CHECK)
    sub(13, "t", 'Submit LI-CERT. Click "Done".', "Hand in LI-CERT")
    sub(13, "w", LI + 'Submit LI-CERT. Click "Done".', LI + "Check that LI-CERT has no empty cell, name the file and submit it.")
    tool(13, PBC)
    for n in (10, 11, 12):
        steps[n - 1]["refs"]["pages"] = ["Ref-Certification card"]
    # The sampling line gave values that Ref-Sampling contradicts (monthly 2–5, weekly 5–15, daily 20–40,
    # many-per-day 25–60) and step 3's answers before it is done; it now names the page.
    old_s = "Sampling guide — Programme sampling table (annual 1, quarterly 2, monthly 2–5, weekly 5–15, daily 20–40, many-per-day 25–60)"
    assert rep(t, old_s, "Sampling guide — Programme sampling table (Learn › Reference pages › Ref-Sampling)") == 2
    assert rep(w["cards"]["T5.1"], old_s, "Sampling guide — Programme sampling table (Learn › Reference pages › Ref-Sampling)") == 1
    # Owners come from the Charter's RACI: the asset register lists no owner for these systems.
    old_o = "Find the control owner in the asset register / RACI — see Asset register; policy RACI tables"
    new_o = "Find the control owner in the RACI — see GRC Charter §16; BKB-POL-016 §6.2"
    assert rep(t, old_o, new_o) == 1 and rep(w["cards"]["T5.1"], old_o, new_o) == 1
    assert rep(t["inputs"], "Asset register (synthetic) for owners", "GRC Charter §16 RACI for owners") == 1
    # LI-08's card stated D6's and D7's answers and the criteria's order, read before they are asked.
    li = w["li"]["LI-08"]
    old_w = "Stage 1 reviews documents and readiness, Stage 2 tests implementation on site, surveillance follows in years 2 and 3, and only an accredited body is worth paying."
    new_w = "what each stage of the audit looks at, what follows in the years after, and how to choose the body that certifies them."
    assert rep(li, old_w, new_w) == 1 and rep(w["licards"]["LI-08"], old_w, new_w) == 1
    old_i = "Accreditation comes first (decision T5.1-D7); an unaccredited certificate is not recognised by customers or regulators."
    new_i = "Choosing the certification body is decision T5.1-D7: the organisation lives with its choice for the whole 3-year cycle."
    assert rep(li, old_i, new_i) == 1 and rep(w["licards"]["LI-08"], old_i, new_i) == 1
    old_c = "(accreditation by an IAF-member accreditation body to ISO/IEC 17021-1 and ISO/IEC 27006-1; sector experience; auditor competence; languages/offices; cost)"
    assert rep(li, old_c, "(the five criteria of the Ref-Certification card, in its order)") == 1
    # BKB-POL-016's text is on the platform now (public/desk/docs/BKB-POL-016.md, platform-written).


def t52(w: dict) -> None:
    """T5.2 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    Two files, as the task hands them in: EVP-IDX (the 42 files of dataset EVP-REPO, sorted by control) and EVP-GAP (one
    row per PBC request). Step 1 counts the files received per control (EVP-GAP), step 2 walks rule R09 on every file and
    records every failed code, step 3 indexes each accepted file to its PBC-LIST request, step 4 applies R18 per control,
    step 5 writes R18's follow-up sentence for each gap. BKB-POL-016 Section 6.2 gains the follow-up's due date
    (platform-written). The screens show the mentee's dataset (the panel showed 14 files of other controls). Corrections
    item 61.
    """
    t = w["tasks"]["T5.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T5.2"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    SCORE = "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit."
    LIB, LINK = "evidence|Evidence Library", "evidence|Link to Control"
    # The screens showed 14 files of six other controls (C13, C16, C04, C03 …) and "40 files"; the mentee's dataset
    # EVP-REPO (Datasets_M2610-00001_W05.xlsx) has 42 files of the six PBC-6 controls. Evidence Library shows it, sorted by
    # control, as step 1 asks; Link to Control lists the six requests the files are linked to.
    ds = w["ds"]["EVP-REPO"]
    assert len(ds["r"]) == 42 and ds["h"][2] == "Control", (len(ds["r"]), ds["h"])
    by_control = sorted(ds["r"], key=lambda r: (r[2], r[0]))
    for panel in (t["panel"], w["tp"][LIB]):
        assert panel["stamp"] == "40 files" and panel["pl"]["r"][0][2] == "C13", panel["pl"]["r"][0]
        panel["stamp"] = "42 files"
        panel["pl"]["h"], panel["pl"]["r"] = list(ds["h"]), [list(r) for r in by_control]
        panel["pl"]["note"] = "Dataset EVP-REPO: the 42 evidence files the control owners sent for the audit, sorted by control."
    link = w["tp"][LINK]
    assert link["stamp"] == "40 files" and link["pl"]["r"][0][2] == "C13", link["pl"]["r"][0]
    pbc = w["ds"]["PBC-6"]["r"]
    link["stamp"] = "6 requests"
    link["pl"] = {"h": ["PBC request", "Control", "Description"], "r": [[f"PBC-{i:02d}", r[0], r[1]] for i, r in enumerate(pbc, 1)],
                  "note": "Each evidence file is linked to the PBC-LIST request for its control."}
    # Evidence › Audit Requests (PBC) shows PBC-6; PBC-LIST numbers its requests in that order (Req. no., T5.1). Step 3
    # indexes each file to a request number, so the screen gives it.
    req = w["tp"]["evidence|Audit Requests (PBC)"]["pl"]
    assert req["h"] == ["Control", "Description", "System", "Frequency", "Office"], req["h"]
    req["h"].append("PBC-LIST request")
    for i, r in enumerate(req["r"], 1):
        r.append(f"PBC-{i:02d}")
    req["note"] = "Dataset PBC-6: the six controls in scope of the audit, for Manila, Philippines, each with its request in PBC-LIST."
    # Step 1: "sort by control" is the screen's order; the work is counting what each control's owner sent.
    old1 = "Open EVP-REPO. Sort by control."
    sub(1, "t", old1, "Count the files received for each control")
    sub(1, "w", old1, "Open the evidence repository EVP-REPO (Evidence › Evidence Library); it lists the files sorted by control. For each control of your PBC list, count the files its owner sent.")
    sub(1, "o", "Step ticked in the work log", "Files received counted for the 6 controls of EVP-GAP")
    sub(1, "help", "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything.",
        "Open Evidence › Evidence Library from the toolbar: dataset EVP-REPO opens beside EVP-GAP, sorted by control. Count each control's files. " + CHECK)
    tool(1, LINK)
    # Step 2: R09 records every failed code (EVP-IDX's Defect code column), not only the decision.
    sub(2, "w", "For each file, decide Accept or Reject.", "For each file, decide Accept or Reject, and record the code of every check that fails.")
    sub(2, "help", SCORE, "Walk the checklist beside the table for each file: the result fills Accept/Reject and Defect code. " + CHECK)
    sub(2, "o", "Per-row decisions recorded in EVP-IDX", "Accept or Reject, with every failed code, recorded for the 42 files of EVP-IDX")
    # Step 3: the pack's option was a placeholder ("PBC request 1–6"); PBC-LIST numbers its requests PBC-01 to PBC-06.
    sub(3, "w", "Options: A) PBC request 1–6.", "Options: A) PBC-01 to PBC-06.")
    steps[2]["opt"] = [f"PBC-{i:02d}" for i in range(1, 7)]
    sub(3, "help", SCORE, "Evidence › Audit Requests (PBC) gives each control's request in PBC-LIST. Rejected files are not indexed. " + CHECK)
    sub(3, "o", "Per-row decisions recorded in EVP-IDX", "PBC request chosen for each accepted file of EVP-IDX")
    # Step 4: R18 per control, from the files and decisions of step 2.
    tool(4, LINK)
    sub(4, "help", SCORE, "EVP-GAP lists each control's files with the decision step 2 checked. " + CHECK)
    sub(4, "o", "Per-row decisions recorded in EVP-IDX", "Gap or No gap decided for the 6 controls of EVP-GAP")
    # Step 5: R18's sentence for each gap; the due date is BKB-POL-016 Section 6.2's (platform-written).
    tool(5, LINK)
    sub(5, "t", "Write one request sentence for each gap control in EVP-GAP.", "Write the follow-up request for each gap")
    sub(5, "w", "Write one request sentence for each gap control in EVP-GAP.",
        "Write one follow-up request for each control with a gap, in the words of rule R18. BKB-POL-016 Section 6.2 says when it is due.")
    sub(5, "help", "Copy the value exactly as it is written in the source — same spelling, same numbers. Then write where you found it (document and section, or row ID) in the Evidence ref column.",
        "Rule R18 (Learn › Rule tables) gives the sentence. BKB-POL-016 Section 6.2 (Policies › Policy Library) says by when the missing files must arrive; rule R16 says when fieldwork starts. " + CHECK)
    sub(5, "o", "EVP-GAP updated", "Follow-up request written for each control with a gap")
    steps[4]["refs"]["docs"] = [["BKB-POL-016", ["6.2"]]]
    steps[4]["refs"]["rules"] = ["R18", "R16"]
    # Step 6: handed in where the files were filled.
    sub(6, "t", 'Submit EVP-IDX and EVP-GAP. Click "Done".', "Hand in EVP-IDX and EVP-GAP")
    sub(6, "w", 'Submit EVP-IDX and EVP-GAP. Click "Done".', "Check that EVP-IDX and EVP-GAP have no empty cell, name the two files and submit them.")
    tool(6, LIB)
    # BKB-POL-016's Section 6.2 follow-up paragraph is on the platform (public/desk/docs/BKB-POL-016.md, platform-written).


def t61(w: dict) -> None:
    """T6.1 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    The pack ships 60 of the 216 accounts of dataset UAR-EXTRACT; src/lib/desk/uar-t61.json holds all 216 (rows 61-216
    platform-written by the engine's rules around the pack's planted exceptions), the review date and the fixed test plan
    A1-A6. Step 1 reads the test plan (three questions), step 2 works out R15's sample size, step 3 walks A1-A6 on each
    sampled account, step 4 decides which accounts the analytics list are exceptions, step 5 types them (U1-U10), step 6
    asks D3 only (R20's copy is written by the platform), step 7 works out R19. The screens show the mentee's review
    (they showed another mentee's, SAP SuccessFactors, 257 accounts). Corrections item 62.
    """
    t = w["tasks"]["T6.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T6.1"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    uar = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "uar-t61.json").read_text(encoding="utf8"))
    ex, hr = w["ds"]["UAR-EXTRACT"], w["ds"]["HR-ROSTER"]
    assert ex["n"] == 216 and len(ex["r"]) == 60, (ex["n"], len(ex["r"]))
    assert [r[:12] for r in uar["extract"]["r"][:60]] == ex["r"] and uar["hr"]["r"][:60] == hr["r"], "the pack's first 60 accounts changed"
    ex["h"], ex["r"] = uar["extract"]["h"], uar["extract"]["r"]
    hr["r"] = uar["hr"]["r"]
    X, review = ex["r"], uar["review"]
    HR = {r[0]: r for r in hr["r"]}
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    GEN = "access|Generate Sample"
    # The task's panel and the Access Reviews screens showed another mentee's review (SAP SuccessFactors EC, 257 accounts).
    t["panel"] = {"tool": "Access Reviews › UAR extract · Mitratech TeamConnect", "stamp": f"{len(X)} accounts", "kind": "table",
                  "pl": {"h": list(ex["h"]), "r": [list(r) for r in X],
                         "note": f"Dataset UAR-EXTRACT: the {len(X)} accounts of Mitratech TeamConnect at the user access review of {review} (sanitised, synthetic)."}}
    tp = w["tp"]
    assert tp["access|Start Review"]["pl"]["f"][2] == ["Population", "257 accounts"], tp["access|Start Review"]["pl"]["f"]
    sod = w["ds"]["SOD-MATRIX"]["r"][0]
    tp["access|Start Review"] = {"tool": "Access Reviews › Start Review", "stamp": "Campaign", "kind": "form", "pl": {"f": [
        ["System", "Mitratech TeamConnect"], ["Asset", "Matter & litigation management (Legal & Corporate Affairs, Manila)"],
        ["Criticality (CLS-RES, F2.1)", "Business Critical"], ["Review frequency (BKB-POL-006 Section 4)", "Semi-annual"],
        ["Population", f"{len(X)} accounts (dataset UAR-EXTRACT)"], ["Review date", review], ["Reviewer", "Asset owner (department head)"],
        ["Registered break-glass accounts", "None registered for this system"], ["Test plan", "A1–A6, fixed (UAR-TEST Sheet 1)"]],
        "wide": [["SoD matrix", f"{sod[0]}: {sod[1].lower()}"]]}}
    assert tp[GEN]["pl"]["note"].startswith("Population 257"), tp[GEN]["pl"]["note"]
    tp[GEN] = {"tool": "Access Reviews › Generate Sample", "stamp": f"{len(X)} accounts", "kind": "table",
               "pl": {"h": list(ex["h"]), "r": [list(r) for r in X], "note": f"Dataset UAR-EXTRACT: the population the sample is drawn from, {len(X)} accounts."}}
    priv = [r for r in X if r[5] == "Yes"]
    assert tp["access|Privilege Check"]["stamp"] == "3 privileged"
    tp["access|Privilege Check"] = {"tool": "Access Reviews › Privilege Check", "stamp": f"{len(priv)} privileged", "kind": "table",
                                    "pl": {"h": ["User ID", "Name", "Role", "Approval ticket", "Decision"], "r": [[r[0], r[1], r[4], r[9] or "— none", r[10] or "(blank)"] for r in priv],
                                           "note": f"Every account of the {len(X)} with a privileged role, and its approval ticket."}}
    hits = [r for r in X if HR[r[0]][2] != "Active" or HR[r[0]][3] or HR[r[0]][4]]
    assert tp["access|Terminated User Check"]["stamp"] == "5 no match"
    tp["access|Terminated User Check"] = {"tool": "Access Reviews › Terminated User Check", "stamp": f"{len(hits)} listed", "kind": "table",
                                          "pl": {"h": ["User ID", "Name", "HR status", "Termination date", "Role change date", "Account", "Last login"],
                                                 "r": [[r[0], r[1], HR[r[0]][2], HR[r[0]][3], HR[r[0]][4], r[6], r[8]] for r in hits],
                                                 "note": f"Every account of the {len(X)} matched to the HR roster by User ID: listed where HR does not show it active, or shows a termination or role change date."}}
    dec = [r for r in X if r[10] != "Keep" or r[11] == r[1]]
    assert tp["access|Reviewer Sign-off"]["stamp"] == "7 issues"
    tp["access|Reviewer Sign-off"] = {"tool": "Access Reviews › Reviewer Sign-off", "stamp": f"{len(dec)} listed", "kind": "table",
                                      "pl": {"h": ["User ID", "Name", "Decision", "Reviewer", "Review date", "Revocation executed", "Last login"],
                                             "r": [[r[0], r[1], r[10] or "(blank)", r[11], r[12], r[13], r[8]] for r in dec],
                                             "note": f"Every account of the {len(X)} whose review decision is not Keep, or whose reviewer is the account holder."}}
    # The fixed test plan, a reference page the checklist (step 3) and step 4 read; Sheet 1 shows the same in step 1.
    w["pages"]["Ref-UAR test plan"] = {"h": ["Code", "Attribute: passes when", "Read from"], "r": [[c, f"{n}: {x[0].lower()}{x[1:]}", f] for c, n, x, f in uar["plan"]], "n": 6}
    w["page_users"]["Ref-UAR test plan"] = ["T6.1"]
    # The memo is a document (p_tasks.py: "DOCX (≤ 1 page)"); "Template (sentence frames)" names no file type.
    memo = next(x for x in t["subs"] if x["code"] == "UAR-MEMO")
    assert memo["fmt"] == "Template (sentence frames)", memo
    memo["fmt"] = "DOCX (template sentence frames)"
    # Step 1: reading the fixed plan becomes three questions on it.
    sub(1, "t", "Open the UAR template", "Read the fixed test plan, A1 to A6")
    sub(1, "w", "Open the UAR template. The test plan (attributes A1–A6) is already written. Do not change it.",
        "Open UAR-TEST Sheet 1, the test plan: attributes A1 to A6, already written. Do not change it. Answer its three questions: each is a case you meet when you test the accounts.")
    sub(1, "o", "Step ticked in the work log", "Three questions on the test plan answered")
    sub(1, "help", "Open what the step names. Your inputs are in the task folder 01_Inputs; the reference pages are under Learn › Reference. Read before you write anything.",
        "Sheet 1 says, for each attribute, when an account passes and which columns to read. Click the cell that answers each question: you see at once whether it is right.")
    # Step 2: R15 worked out; the platform selects the sample (no "Select sample" button) and records the seed.
    old2 = 'Apply rule R15. Click "Select sample". The platform records the seed.'
    sub(2, "t", old2, "Work out the sample size (R15)")
    sub(2, "w", old2, "Apply rule R15 to your review: record its population, the Ref-Sampling row and the minimum sample. Once your answers are checked, the platform selects the sample and records the seed.")
    sub(2, "o", "Step ticked in the work log", "Population, Ref-Sampling row and minimum sample checked; seed recorded")
    sub(2, "help", "Apply the rule exactly as written — the rule tells you what to do, step by step. Write the rule ID in the Rule column. Rule R15 (Sample size): Look up the control frequency in Ref-Sampling and copy the minimum sample. Select the sample with the random seed shown on your task page (the platform does the selection when you click \"Select sample\").",
        "Rule R15 is in Learn › Rule tables, Ref-Sampling in Learn › Reference pages, and the review's facts on Access Reviews › Start Review. " + CHECK)
    steps[1]["refs"]["pages"] = ["Ref-Sampling"]
    # Step 3: A1-A6 walked on each sampled account; every failing attribute recorded.
    sub(3, "t", "Decide for each row: For each sampled account, decide pass or fail for A1–A6", "Test each sampled account against A1 to A6")
    sub(3, "w", "For each sampled account, decide pass or fail for A1–A6.", "For each sampled account, read A1 to A6 in order and mark every attribute that fails.")
    sub(3, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit.",
        "Walk the test plan beside the table for each account: the result fills Result and Attributes failed. " + CHECK)
    sub(3, "o", "Per-row decisions recorded in UAR-TEST", "Pass or Fail, with every failed attribute, recorded for the 25 sampled accounts")
    # Step 4: the analytics' list is a list of leads: each is decided against the test plan.
    old4 = 'Click "Run analytics". Copy the listed leavers, orphans, dormant, shared and privileged accounts to Sheet 3 (codes in Ref-UAR codes).'
    sub(4, "t", 'Click "Run analytics"', "Confirm the exceptions the analytics list")
    sub(4, "w", old4, "The platform has run the full-population analytics: leavers, orphans, dormant, shared and privileged accounts, and the review's decisions. For each account they list, decide by the test plan whether it is an exception.")
    sub(4, "o", "Values copied with evidence ref", "Exception or not decided for each account the analytics list")
    sub(4, "help", "Do exactly what the step says, one action at a time; the step names its source and its output. Reference page (Learn › Reference): Ref-UAR codes.",
        "An account the analytics list fails an attribute, or it does not: read its cells against Ref-UAR test plan (Learn › Reference pages). " + CHECK)
    steps[3]["refs"]["pages"] = ["Ref-UAR test plan"]
    # Step 5: the type of each exception; the severity is copied by the platform from the same page.
    sub(5, "t", "Decide for each row: For each exception, choose the exception type", "Choose each exception's type (U1 to U10)")
    sub(5, "w", "Options: A) U1–U10 (see Ref-UAR codes). Guidance: Ref-UAR codes.", "Options: A) U1 to U10. Guidance: Ref-UAR codes.")
    steps[4]["opt"] = [f"U{i}" for i in range(1, 11)]
    sub(5, "help", "Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit.",
        "Ref-UAR codes (Learn › Reference pages) names each type; its severity is copied for you. " + CHECK)
    sub(5, "o", "Per-row decisions recorded in UAR-TEST", "Type chosen for each exception of Sheet 3")
    tool(5, GEN)
    # Step 6: D3 only (owner, 28 Oct: part 2 only where it is real work). Its part 2 copied R20's action, owner and due date
    # from Ref-Actions, the same for every exception of a type: the platform writes them into Sheet 3. The help quoted R20's
    # example, which names the best option's action.
    # The pack's title is the question cut at 60 characters ("… used after termi…").
    sub(6, "t", "Decide: A leaver's account is still active and was used after termi…", "Decide: The memo's action for a leaver's account used after termination")
    sub(6, "w", " Then: Apply rule R20: copy the action, owner and due date.", "")
    sub(6, "help", " Then do the step that follows: Apply rule R20: copy the action, owner and due date. Rule R20 (Standard actions): Copy the action for the exception type from Ref-Actions (e.g., U1 active leaver account → \"Disable within 1 working day; check for use after termination\" — owner IAM team).",
        " Once your answer is checked, the platform copies rule R20's action, owner and due date for each of your exceptions from Ref-Actions into Sheet 3.")
    sub(6, "o", "Decision T6.1-D3 recorded with the rule used", "Decision T6.1-D3 checked")
    # Step 7: R19 worked out in its parts, then the conclusion.
    sub(7, "t", "Decide for each row: Decide the test conclusion", "Conclude the test (R19)")
    sub(7, "w", "Decide the test conclusion.", "Work out rule R19 for your test: how many exceptions Sheet 3 holds, the highest severity, their share of the population, then the conclusion.")
    sub(7, "help", "You decide one value for every row: decide the test conclusion. Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit.",
        "Count and grade Sheet 3's exceptions, then apply R19. " + CHECK)
    sub(7, "o", "Per-row decisions recorded in UAR-TEST", "R19 worked out and the conclusion checked; UAR-MEMO written")
    # Step 8: handed in where the files were filled.
    sub(8, "t", 'Submit UAR-TEST and UAR-MEMO. Click "Done".', "Hand in UAR-TEST and UAR-MEMO")
    sub(8, "w", 'Submit UAR-TEST and UAR-MEMO. Click "Done".', "Check that UAR-TEST and UAR-MEMO have no empty cell, name the two files and submit them.")
    tool(8, GEN)
    # The card's "why" stated D3's answer ("is a security incident"), read before the question.
    old_y = "A leaver with access used after termination is a security incident, not a record-keeping issue (R19: any High exception → Not effective)."
    new_y = "An account a leaver can still use after termination is the exception R19 weighs most: any High exception makes the control Not effective."
    n = 0
    for holder in (t["card"], dict(w["cards"]["T6.1"])):
        assert old_y in holder["Why is this important"], holder["Why is this important"]
    t["card"]["Why is this important"] = t["card"]["Why is this important"].replace(old_y, new_y)
    for row in w["cards"]["T6.1"]:
        if row[0] == "Why is this important":
            row[1], n = row[1].replace(old_y, new_y), n + 1
    assert n == 1


def t62(w: dict) -> None:
    """T6.2 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    The pack ships 60 of the 145 rows of dataset LVR-DATA (leavers E0001-E0012); src/lib/desk/lvr-t62.json holds all 29
    leavers and the five systems' disable logs (E0013-E0029 platform-written around the pack's answer key; two logs write
    Amsterdam summer time). Step 1 converts each log to UTC, step 2 matches the leavers to each log (the ones with no
    line are still active), step 3 sets each leaver's SLA (R21), step 4 finds the accounts disabled late, step 5 asks D3
    only (R20's copy is written by the platform), step 6 works out the KPI and hands in. Access Reviews › Terminated User
    Check shows T6.2 its own logs ("…#T6.2"); every other task still sees T6.1's review there. Corrections item 63.
    """
    t = w["tasks"]["T6.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T6.2"]}

    def sub(n: int, field: str, old: str, new: str) -> None:
        s = steps[n - 1]
        assert old in s[field], (n, field, s[field])
        s[field] = s[field].replace(old, new)
        if field == "help":  # the help window shows the owner's notes table, which repeats it
            assert old in notes[n][2], (n, notes[n][2])
            notes[n][2] = notes[n][2].replace(old, new)
        if field == "t":
            notes[n][1] = s["t"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    lvr = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "lvr-t62.json").read_text(encoding="utf8"))
    ds = w["ds"]["LVR-DATA"]
    assert ds["n"] == 145 and len(ds["r"]) == 60, (ds["n"], len(ds["r"]))
    first = {r[0]: r for r in lvr["leavers"]}
    assert all(first[r[0]][1:] == [r[1], r[2]] for r in ds["r"]), "the pack's leavers changed"
    KEY = "access|Terminated User Check"
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    head = ["Employee ID", "System", "Disabled (as logged)"]
    log = [r[:3] for r in lvr["log"]]
    note = (f"Account disable logs of LearnTech's five systems for the {len(lvr['leavers'])} leavers HR recorded from {lvr['first']} "
            f"to {lvr['last']} (dataset LVR-DATA, synthetic): one line per account disabled, sorted by system, then Employee ID. "
            "Each time ends with the zone its system writes.")
    # The dataset as the platform shows it: the logs as written, not the pack's joined table in UTC.
    ds["h"], ds["r"], ds["n"] = head, log, len(log)
    # T6.2's own data on the screen it shares with T6.1 (registers.ts: a screen keyed "<tool>#<task>" wins for that task).
    assert w["tp"][KEY]["tool"] == "Access Reviews › Terminated User Check"
    w["tp"][f"{KEY}#T6.2"] = {"tool": "Access Reviews › Terminated User Check", "stamp": f"{len(log)} log lines", "kind": "table", "pl": {"h": head, "r": log, "note": note}}
    # The task's panel showed another mentee's leavers (Adobe Experience Manager Assets, Diligent Entities).
    t["panel"] = {"tool": "Access Reviews › Leaver disable logs (LVR-DATA)", "stamp": f"{len(log)} log lines", "kind": "table", "pl": {"h": head, "r": log, "note": note}}
    # Step 1: "Convert to UTC" (a button) becomes the conversion each log needs; the platform then converts the times.
    old1 = 'Click "Convert to UTC" to normalise the timestamps.'
    sub(1, "t", old1, "Put every system's disable log in UTC")
    sub(1, "w", old1, "Open LVR-REC Sheet 1. For each system, read how its disable log on Access Reviews › Terminated User Check writes the time, and choose what turns it into UTC. Once your answers are checked, the platform converts the times.")
    sub(1, "o", "Step ticked in the work log", "Conversion to UTC checked for the 5 system logs")
    sub(1, "help", "Do exactly what the step says, one action at a time; the step names its source and its output.",
        "HR records each termination in UTC (BKB-POL-006 Section 6.3, step 1). A disable time can only be compared with it once it is in UTC too. " + CHECK)
    # Step 2: "use the Match button" becomes the match itself: the leavers each log has no line for.
    old2 = 'Match each leaver to each system log by employee ID (use the "Match" button).'
    sub(2, "t", 'Match each leaver to each system log by employee ID (use the "Match" …', "Match the leavers to each system's log")
    sub(2, "w", old2, "Match HR's leavers to each system's disable log by Employee ID. For each system, record the leavers it has no disable line for: their accounts are still active.")
    sub(2, "o", "Step ticked in the work log", "Leavers with no disable line checked for the 5 system logs")
    sub(2, "help", "Do exactly what the step says, one action at a time; the step names its source and its output.",
        "Finding the leavers whose accounts were never disabled is what the weekly reconciliation is for (BKB-POL-006 Section 6.3, step 3). " + CHECK)
    # Step 3: the options without their bracketed leaver type, which answered each row by itself.
    sub(3, "t", "Decide for each row: For each leaver, decide which SLA applies", "Set each leaver's SLA (R21)")
    sub(3, "w", "Options: A) 4 hours (voluntary)  B) 1 hour (involuntary).", "Options: A) 4 hours  B) 1 hour.")
    steps[2]["opt"] = ["4 hours", "1 hour"]
    sub(3, "help", "You decide one value for every row: for each leaver, decide which SLA applies. Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit. Rule R21 (Leaver SLA): Voluntary leaver: account disabled within 4 hours of termination. Involuntary leaver: within 1 hour. KPI = leavers fully disabled within SLA ÷ all leavers × 100.",
        "Read rule R21 in Learn › Rule tables, then each leaver's type in LVR-REC Sheet 2. " + CHECK)
    sub(3, "o", "Per-row decisions recorded in LVR-REC", "SLA set for each of the 29 leavers")
    # Step 4: Met / Not met on 145 pairs becomes, per leaver, the systems disabled late (still-active ones were step 2's).
    sub(4, "t", "Decide for each row: For each leaver and system, decide SLA met or not met", "Find the accounts disabled late (R21)")
    sub(4, "w", "For each leaver and system, decide SLA met or not met. Options: A) Met  B) Not met. Guidance: rule R21.",
        "For each leaver, compare each system's disable time with the leaver's SLA and mark every system disabled late.")
    steps[3]["opt"] = None
    sub(4, "help", "You decide one value for every row: for each leaver and system, decide SLA met or not met. Choose from the options shown — nothing is written from nothing. The platform scores each row against the key after you submit. Rule R21 (Leaver SLA): Voluntary leaver: account disabled within 4 hours of termination. Involuntary leaver: within 1 hour. KPI = leavers fully disabled within SLA ÷ all leavers × 100.",
        "Sheet 2 gives each system's disable time in UTC and how long after termination it came. A system still active was found in step 2. " + CHECK)
    sub(4, "o", "Per-row decisions recorded in LVR-REC", "Systems disabled late found for each leaver")
    # Step 5: D3 only (owner, 28 Oct: part 2 only where it is real work). Its part 2 copied R20's action, the same for every
    # account still active: the platform writes it into Sheet 2. The help quoted R20's U1 example, which steers to option C.
    sub(5, "w", " Then: Copy the R20 action for each exception.", "")
    sub(5, "help", ' Then do the step that follows: Copy the R20 action for each exception. Rule R20 (Standard actions): Copy the action for the exception type from Ref-Actions (e.g., U1 active leaver account → "Disable within 1 working day; check for use after termination" — owner IAM team).',
        " Once your answer is checked, the platform writes rule R20's action into LVR-REC Sheet 2 for each account still active.")
    sub(5, "o", "Decision T6.2-D3 recorded with the rule used", "Decision T6.2-D3 checked")
    steps[4]["refs"]["rules"], steps[4]["refs"]["pages"] = [], []
    # Step 6: the KPI worked out (R21) against BKB-POL-006 Section 10's target; handed in where the files were filled.
    old6 = 'Calculate the KPI. Submit LVR-REC and LVR-KPI. Click "Done".'
    sub(6, "t", old6, "Work out the leaver KPI and hand in LVR-REC and LVR-KPI")
    sub(6, "w", old6, "Work out the KPI with rule R21: its numerator, its denominator and the percentage, and whether it meets the target of BKB-POL-006 Section 10. Once your answers are checked, name LVR-REC and LVR-KPI and submit them.")
    sub(6, "help", "Do only what the step says, for the rows it names. If a rule is named, follow its numbered questions in order.",
        "Count the leavers LVR-REC Sheet 2 marks fully disabled within the SLA, and all the leavers, then apply rule R21. " + CHECK + " Then name the two files and submit them.")
    steps[5]["refs"]["rules"] = ["R21"]
    steps[5]["refs"]["docs"] = [["BKB-POL-006", ["10"]]]
    for n in (1, 2, 3, 4, 6):
        tool(n, KEY)
    # The card's "What will I learn" states D3's answer ("raise an incident when access was used after termination"), read
    # before the question.
    old_l = "Choose the standard action for an exception and raise an incident when access was used after termination — see Rule R20; Ref-Actions U1"
    new_l = "Decide the action for an account used after termination — see BKB-POL-006 Section 6.3; Rule R20"
    learn = t["card"]["What will I learn"]
    assert old_l in learn, learn
    learn[learn.index(old_l)] = new_l
    n = 0
    for row in w["cards"]["T6.2"]:
        if row[0] == "What will I learn" and old_l in row[1]:
            row[1][row[1].index(old_l)] = new_l
            n += 1
    assert n == 1


def t71(w: dict) -> None:
    """T7.1 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    The pack gives the five events' one-line descriptions and the register's first 12 columns; src/lib/desk/rru-t71.json
    holds the 25 rows with all their columns (the pack's own, from its engine context) and the platform-written facts of
    each event (Content Corrections item 64). Step 1 reads RRU-EVENTS (three questions), steps 2-6 fill the three new
    rows (R06 draft, R07 ratings, R36 authority, Ref-Keywords controls, R08 decision), step 7 asks D5 and applies C1 and
    C2 (change log, R22), step 8 asks D6 and completes RR-NOTE, step 9 hands in. LI-03 (10-14): the chain of each new
    risk's asset (Ref-Chain type, L12 option, Annex A control, D8, L05 attributes). LI-09 (15-20): the treatment plan
    (action, control, due date, expected residual, approval). Risk Register › New Risk and Score Risk show T7.1 its own
    events and register ("…#T7.1").
    """
    t = w["tasks"]["T7.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T7.1"]}
    rru = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "rru-t71.json").read_text(encoding="utf8"))
    assert [r[:4] for r in w["ds"]["RRU-EVENTS"]["r"]] == rru["events"], "the pack's events changed"
    assert [r[0] for r in w["ds"]["OFFICE-REGISTER"]["r"]] == [r[0] for r in rru["register"]], "the pack's register changed"
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI3 = "[LI-03 — Asset–threat–vulnerability–control chain and control attributes] "
    LI9 = "[LI-09 — Risk treatment plan] "

    def put(n: int, old_t: str, **f: object) -> None:
        """A step rewritten: its old title asserted (a pack change is noticed), the new fields set, the notes kept in step."""
        s = steps[n - 1]
        assert s["t"].startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    # RRU-EVENTS with the facts the steps read (platform-written), on Risk Register › New Risk for this task.
    eh = ["Event", "Type", "Description", "Category", "Facts", "Asset", "How often", "Impact if it happens", "Existing controls", "Applies to"]
    er = [[n["ev"], "New risk", n["desc"], n["cat"], n["facts"], n["asset"], n["often"], n["impact"], n["controls"], "—"] for n in rru["new"]]
    er += [[c["ev"], "Change", c["desc"], "—", c["facts"], "—", "—", "—", "—", c["row"]] for c in rru["changes"]]
    enote = "Five events for the Manila, Philippines register (dataset RRU-EVENTS): three new risks, N1 to N3, and two changes to rows already in it, C1 and C2."
    w["ds"]["RRU-EVENTS"].update(h=eh, r=er, cols=len(eh))
    w["tp"]["risk|New Risk#T7.1"] = {"tool": "Risk Register › New Risk", "stamp": "5 events", "kind": "table", "pl": {"h": eh, "r": er, "note": enote}}
    # The office register as Score Risk shows it for this task: the pack's 25 rows, with the columns the steps read.
    rh = ["Risk ID", "Risk title", "Inherent score", "Likelihood (residual)", "Impact (residual)", "Residual score", "Residual rating", "Decision", "Risk owner", "Acceptance authority"]
    rr = [[r[0], r[2], r[6], r[9], r[10], r[11], r[12], r[13], r[14], r[15]] for r in rru["register"]]
    rnote = "The Manila, Philippines office register as it stands before your update (RA-16, synthetic copy): 25 risks."
    w["tp"]["risk|Score Risk#T7.1"] = {"tool": "Risk Register › Score Risk", "stamp": "25 risks", "kind": "table", "pl": {"h": rh, "r": rr, "note": rnote}}
    t["panel"] = {"tool": "Risk Register › Score Risk (Manila office)", "stamp": "25 risks", "kind": "table", "pl": {"h": rh, "r": rr, "note": rnote}}

    # KR3 named D6's answer ("residual score") on the card read before the question.
    old_kr = "KR3 — Above-appetite list correct (residual score); RR-UPD and RR-NOTE submitted · Activities 8–9"
    assert old_kr in t["krs"], t["krs"]
    t["krs"][t["krs"].index(old_kr)] = "KR3 — Above-appetite list correct; RR-UPD and RR-NOTE submitted · Activities 8–9"
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    put(1, "Open RRU-EVENTS", t="Read the new events in RRU-EVENTS", kind="do", opt=None,
        w="Open RRU-EVENTS. Read event N1, then the others, and find what a risk statement (rule R06) and a rating (rule R07) are built from.",
        o="Three questions on RRU-EVENTS answered",
        help="RRU-EVENTS lists five events: three new risks, N1 to N3, and two changes to rows already in the register, C1 and C2. Each question's answer is a cell of the sheet: click it. A wrong cell turns amber, with a hint.",
        refs=refs(rules=["R06", "R07"], ds=["RRU-EVENTS"]))
    tool(1, "risk|New Risk")
    put(2, "Decide for each row: For each event, choose the best risk statement", t="Choose the best risk statement for each new event (R06)", opt=["Draft 1", "Draft 2", "Draft 3"],
        w="For each new-risk event, choose the draft that follows rule R06: each part filled with the right fact, in the frame's order, and the asset as the register names it. The facts are in RRU-EVENTS (Risk Register › New Risk).",
        o="Best draft checked for N1 to N3",
        help="Rule R06 (Learn › Rule tables) gives the frame. Read each draft against the event's facts in RRU-EVENTS: is each part the right fact, in its place, and is the asset the one the event names? " + CHECK,
        refs=refs(rules=["R06"], ds=["RRU-EVENTS"]))
    put(3, "Decide for each row: For each new risk, decide likelihood and impact", t="Rate each new risk (R07)", opt=["1", "2", "3", "4", "5"],
        w="For each new risk, score its inherent likelihood, its inherent impact and its residual likelihood with rule R07, from the facts on each line and the scales of BKB-ERM-001 Sections 6.2 and 6.3.",
        o="Ratings checked for N1 to N3 (9 lines)",
        help="Rule R07 (Learn › Rule tables): find the descriptor that uses the same words as the fact and write its number; the residual likelihood counts the existing controls marked working. The scales are BKB-ERM-001 Sections 6.2 and 6.3 (Policies › Policy Library). The platform then works out each score and rating. " + CHECK,
        refs=refs(rules=["R07"], docs=[["BKB-ERM-001", ["6.2–6.4"]]]))
    put(4, "Decide for each row: For each risk, choose the acceptance authority", t="Set each new risk's acceptance authority (R36)",
        w="For each new risk, choose who may accept it: rule R36, on its residual rating. Use R36's table even where the register's other rows show a different value.",
        o="Acceptance authority checked for the 3 new risks",
        help="Rule R36 (Learn › Rule tables) is the Charter's delegation table, Section 6.1 (Policies › Policy Library). " + CHECK)
    put(5, "Decide for each row: For each risk, choose the matching ISO/IEC 27001 controls", t="Choose each new risk's ISO/IEC 27001 controls (Ref-Keywords)", opt=None,
        w="For each new risk, find the key words of its category in Ref-Keywords (Learn › Reference pages) and choose the Annex A controls of that row.",
        o="Controls checked for the 3 new risks",
        help="Ref-Keywords lists key words, the BKB policy that covers them and its Annex A controls. Match the words of the risk's category. " + CHECK)
    # "Repeat for N2 and N3": steps 2-5 already work on all three events. The rows are completed with rule R08 (the pack's
    # guided step "Rate with rule R07. Apply rule R08." and its KR2, "decisions/due dates correct").
    put(6, "Repeat for N2 and N3", t="Set each new risk's decision and due days (R08)",
        w="Rule R08: compare each new risk's residual score with the appetite and choose its decision. A risk to treat takes the due days of its residual rating (BKB-ERM-001 Section 7).",
        o="Decision and due checked for the 3 new risks",
        help="Rule R08 (Learn › Rule tables) gives the appetite and the decision; BKB-ERM-001 Section 7 (Policies › Policy Library) the due days. " + CHECK,
        refs=refs(rules=["R08"], docs=[["BKB-ERM-001", ["7"]]]))
    old7 = 'Then: Apply events C1 and C2 to the rows named in "Applies to". Add change-log rows (R22).'
    new7 = 'Then: Apply events C1 and C2 to the rows named in "Applies to": for each, choose the change it makes. The change log (R22) records it, field by field.'
    assert old7 in steps[6]["w"], steps[6]["w"]
    put(7, "Decide: Event", w=steps[6]["w"].replace(old7, new7), o="Decision T7.1-D5 checked; C1 and C2 applied in the change log",
        help=steps[6]["help"].replace('Then do the step that follows: Apply events C1 and C2 to the rows named in "Applies to". Add change-log rows (R22).',
                                      'Then apply events C1 and C2 to the rows named in "Applies to": their facts are in RRU-EVENTS (Risk Register › New Risk).'))
    old8 = "Then: Complete the update-note template (it lists new risks, changed risks and risks above 11 — copy them)."
    assert old8 in steps[7]["w"], steps[7]["w"]
    put(8, "Decide: Which risks go", w=steps[7]["w"].replace(old8, "Then: Complete RR-NOTE: list the risks above appetite, and the rows whose acceptance authority is not the one rule R36 gives. The new and changed risks are listed for you."),
        o="Decision T7.1-D6 checked; RR-NOTE completed",
        help=steps[7]["help"].replace("Then do the step that follows: Complete the update-note template (it lists new risks, changed risks and risks above 11 — copy them).",
                                      "Then complete RR-NOTE from the register on Risk Register › Score Risk and your own three rows.") + " BKB-ERM-001 Section 4 (Policies › Policy Library) sets the appetite.")
    steps[7]["refs"]["docs"] = []  # Section 4 answers the question only: DECIDE_FROM in registers.ts
    steps[7]["refs"]["rules"] = ["R36"]
    put(9, "Submit RR-UPD and RR-NOTE", t="Hand in RR-UPD and RR-NOTE", w="Check RR-UPD (the register and its change log) and RR-NOTE for empty cells, name RR-UPD and submit both.")
    tool(9, "risk|Score Risk")
    put(10, "Open T-LI-CHAIN", t="Classify each asset by its Ref-Chain asset type",
        w=LI3 + "Open T-LI-CHAIN. Three assets of Manila, Philippines are pre-filled from the asset register, one for each new risk. For each, choose its asset type in Ref-Chain (Learn › Reference pages); the platform then copies that type's threat, vulnerability and impact.",
        o="Asset type checked for the 3 assets",
        help="Ref-Chain gives, for each asset type, whether it is information or a supporting asset, its typical threat and vulnerability, the impact and the Annex A control. Match each asset to its type from what the asset register says it is. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(tpls=["T-LI-CHAIN"], pages=["Ref-Chain"], arts=["LI-CHAIN"]))
    put(11, "Decide for each row: For each new risk, choose the treatment option", t="Choose each new risk's treatment option (L12)",
        w=LI3 + "For each new risk, choose its treatment option with rule L12, from its residual score in RR-UPD.",
        o="Treatment option checked for the 3 risks",
        help="Rule L12 (Learn › Rule tables) gives the option from the residual score. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["L12"]))
    put(12, "Copy the Annex A control", t="Copy the Annex A control for each chain's threat (Ref-Chain)",
        w=LI3 + "Copy the Annex A control Ref-Chain lists for each chain's threat.", o="Annex A control checked for the 3 chains",
        help="Ref-Chain (Learn › Reference pages) lists one Annex A control for each threat. Type its ID as written there; the title is added for you. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.")
    old13 = "Then: Apply rule L05 for the three attributes."
    assert old13 in steps[12]["w"], steps[12]["w"]
    put(13, "Decide: The owner wants", w=steps[12]["w"].replace(old13, "Then: Apply rule L05: tag each chain's control with its control type, security property and cybersecurity concept from Ref-27002 attributes."),
        o="Decision T7.1-D8 checked; L05 attributes recorded for the 3 controls")
    put(14, "Submit LI-CHAIN", t="Hand in LI-CHAIN", w=LI3 + "Check LI-CHAIN for empty cells, name it and submit it.", o="LI-CHAIN submitted with manifest")
    put(15, "Copy your three new risks", t="Choose each risk's treatment action",
        w=LI9 + "LI-RTP lists your three new risks, copied from RR-UPD with the option you chose in step 11. For each, choose the action that carries out its option at the risk's cause.",
        o="Treatment action checked for the 3 risks",
        help="Read each risk's statement and option, and the facts of its event in RRU-EVENTS (Risk Register › New Risk). " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(ds=["RRU-EVENTS"], arts=["RR-UPD"]))
    put(16, "Apply rule L12", t="Link each action to its control (L12)",
        w=LI9 + "Rule L12: a treatment's controls are the ones Ref-Keywords lists for the risk's category. For each risk, choose the control of that list its action puts in place; a retained risk has none.",
        o="Control checked for the 3 actions",
        help="Each row offers the controls of its risk's category in Ref-Keywords, with their titles. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["L12"]))
    put(17, "Copy owner and due days", t="Set each action's due date (R08)",
        w=LI9 + f"Each action's owner is the risk's owner in RR-UPD, copied for you. Rule R08 gives the due days of a risk to treat by its residual rating: count them from the plan's date, {rru['plan']}, and type the due date. A retained risk has none: type none.",
        o="Due date checked for the 3 actions",
        help="Rule R08 (Learn › Rule tables) and BKB-ERM-001 Section 7 (Policies › Policy Library) give the days. Count calendar days. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.")
    put(18, "Copy the residual score", t="Estimate each risk's residual score after treatment (R07)",
        w=LI9 + "Count each action's control as working and apply rule R07 again: type the residual score expected once the action is done. A retained risk keeps its residual score.",
        o="Expected residual checked for the 3 risks",
        help="Rule R07 (Learn › Rule tables): a working control lowers the residual likelihood by one; the impact stays. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["R07"], arts=["RR-UPD"]))
    put(19, 'Click "Request approval"', t="Request approval: who accepts each residual (R36)",
        w=LI9 + "For each risk, choose who must accept the residual risk left after treatment: rule R36, on the rating of the expected residual. Once your answers are checked, the plan goes to each risk owner and the AI risk owner's approval is recorded.",
        o="Approval recorded for the 3 risks",
        help="ISO/IEC 27001 clause 6.1.3 f: the risk owners approve the plan and accept the residual risk. Rule R36 (Learn › Rule tables) says who may accept each rating. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["R36"]))
    put(20, "Submit LI-RTP", t="Hand in LI-RTP", w=LI9 + "Check LI-RTP for empty cells, name it and submit it.")
    tool(20, "risk|Score Risk")
    steps[3]["refs"]["docs"] = [["Charter", ["6.1"]]]
    steps[5 - 1]["refs"] = refs(pages=["Ref-Keywords"])
    steps[10]["refs"]["pages"] = []  # L12's controls are step 16's, not this step's
    steps[11]["refs"]["pages"] = ["Ref-Chain"]
    steps[12]["refs"]["pages"] = ["Ref-27002 attributes"]


def t72(w: dict) -> None:
    """T7.2 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    src/lib/desk/top-t72.json holds what the steps read that the pack does not give (Content Corrections item 65): the
    register as T7.1's key leaves it, its change log since the last board report, the "so what" lines, the review records
    of weeks 1-7, the objective statements and the plan's dates. Step 1 asks D1 and ranks the Top-5 (R23); 2 the trend;
    3 asks D3 and chooses each "so what"; 4 asks D4 and fills RSK-ACC (R23, R36); 5 hands in. LI-10's gap rating (step 6,
    D5) and LI-04's method card (7 D6 + scale names, 8 appetite and due days, 9 R36, 10 clause 8.2, 11 hand in); LI-10's
    actions (12), objectives (13, L14), owners (14, L15), ISMS risks (15, clause 6.1.1) and hand-in (16).
    """
    t = w["tasks"]["T7.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T7.2"]}
    top = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "top-t72.json").read_text(encoding="utf8"))
    assert [r[:3] for r in w["pages"]["Ref-Clause map"]["r"]] == top["clauses"], "the pack's clause map changed"
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI4 = "[LI-04 — Risk assessment method and risk criteria] "
    LI10 = "[LI-10 — Clause 4–10 gap analysis, ISMS objectives and implementation plan] "
    LIX = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]
        if "li" in f:
            notes[n][4] = f["li"]

    def then(n: int, old: str, new: str) -> str:
        s = desect(steps[n - 1]["w"])
        assert old in s, (n, s)
        return s.replace(old, new)

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    # Risk Register › Score Risk: the register after T7.1 (its key's values). Heat Map with KRIs: what moved since the
    # last board report, the register's change log. Home › Waiting On: the review records the gap analysis reads.
    rh = ["Risk ID", "Risk title", "Inherent score", "Residual score", "Residual rating", "Decision", "Risk owner", "Acceptance authority"]
    rr = [r[:8] for r in top["register"]]
    rnote = "The Manila, Philippines office register after your T7.1 update (RR-UPD, as checked): 28 risks. R-16-HQ-26 to -28 are your new risks; R-16-HQ-21 is after event C1."
    w["tp"]["risk|Score Risk#T7.2"] = {"tool": "Risk Register › Score Risk", "stamp": "28 risks", "kind": "table", "pl": {"h": rh, "r": rr, "note": rnote}}
    t["panel"] = {"tool": "Risk Register › Score Risk (Manila office)", "stamp": "28 risks", "kind": "table", "pl": {"h": rh, "r": rr, "note": rnote}}
    lh = ["Date", "Risk ID", "Field", "Old value", "New value", "Event and evidence"]
    w["tp"]["risk|Heat Map with KRIs#T7.2"] = {"tool": "Risk Register › Heat Map with KRIs", "stamp": f"Since {top['board']}", "kind": "table", "pl": {
        "h": lh, "r": top["log"], "note": f"What moved since the last board report, {top['board']}: the register's change log (rule R22, one row for each changed field). The rows of 2026-11-19 are your T7.1 update."}}
    vh = ["Deliverable", "Task", "Automated review", "Review comment"]
    w["tp"]["home|Waiting On#T7.2"] = {"tool": "Home › Waiting On", "stamp": "Review records", "kind": "table", "pl": {
        "h": vh, "r": [[r[0], *r[2:]] for r in top["reviews"]], "note": f"Automated review records returned for your deliverables up to T7.1, as of {top['request']}. A file handed in this week is under review: it is not listed until its record comes back."}}

    # Text read before a question must not give its answer: KR3 and the card named D4's answer.
    old_kr = "KR3 — Acceptance request correct (risk, expiry ≤ 12 months, re-assessment date, approver); RSK-TOP5 and RSK-ACC submitted · Activities 4–5"
    assert old_kr in t["krs"], t["krs"]
    t["krs"][t["krs"].index(old_kr)] = "KR3 — Acceptance request correct (risk, expiry, re-assessment date, approver); RSK-TOP5 and RSK-ACC submitted · Activities 4–5"
    # Step 6 rates the clauses: LI-10's gap analysis, not LI-04's method card.
    old_li = "LI-04 KR — Risk method card: measurable objective, appetite, scales, owner and acceptance rules, record location; LI-RAM submitted · Activities 6–11"
    assert old_li in t["krs"], t["krs"]
    t["krs"][t["krs"].index(old_li)] = old_li.replace("Activities 6–11", "Activities 7–11")
    old_card = "an expiry (≤ 12 months), not"
    assert old_card in t["card"]["Why is this important"]
    t["card"]["Why is this important"] = t["card"]["Why is this important"].replace(old_card, "an expiry, not")
    for c in w["cards"]["T7.2"]:
        if c[0] == "Why is this important":
            assert old_card in c[1]
            c[1] = c[1].replace(old_card, "an expiry, not")

    put(1, "Decide: Two risks both have residual score 12",
        w=then(1, "Then: Sort your updated register with rule R23. Copy the first five rows into RSK-TOP5.",
               "Then: Rank the updated register (Risk Register › Score Risk) with rule R23 and choose the Risk ID at each of the five ranks of RSK-TOP5."),
        o="Decision T7.2-D1 checked; Top-5 ranked and checked",
        help="A scripted question first: which of two risks with the same residual score ranks higher. Rule R23 (Learn › Rule tables) says how risks are ranked. When you click Check my answer you see the best option and why. Then rank the updated register with R23: it is on Risk Register › Score Risk, with your three new risks from T7.1 and R-16-HQ-21 after event C1. " + CHECK,
        refs=refs(rules=["R23"], arts=["RSK-TOP5"]))
    put(2, "Decide for each row: For each top-5 risk, choose the trend", t="Choose the trend of each Top-5 risk since the last board report (R23)",
        w=f"For each Top-5 risk, compare its residual score now with its score at the last board report, {top['board']}, and choose the trend. What moved since then is on Risk Register › Heat Map with KRIs.",
        o="Trend checked for the five risks",
        help="Rule R23 (Learn › Rule tables) gives the three arrows. Heat Map with KRIs lists each change to the register since the last board report, field by field, with the old and new value. A risk can change more than once. " + CHECK,
        refs=refs(rules=["R23"]))
    put(3, 'Decide: Which "so what" line suits a board',
        w=then(3, 'Then: Complete the "so what" frame for each.', "Then: For each Top-5 risk, choose the \"so what\" line that completes rule R23's frame from the risk's statement."),
        o="Decision T7.2-D3 checked; \"so what\" line checked for the five risks",
        help="A scripted question: Which \"so what\" line suits a board? Read the three options and choose one. When you click Check my answer you see the best option and why. Then, for each Top-5 risk, read its statement and choose the line that completes rule R23's frame (Learn › Rule tables). " + CHECK,
        refs=refs(rules=["R23"], arts=["RSK-TOP5"]))
    put(4, "Decide: The acceptance starts on 1 November 2026",
        w=then(4, "Then: Apply rule R23 to select the risk for acceptance. Fill RSK-ACC.", "Then: Fill RSK-ACC: choose the risk for acceptance with rule R23, type its expiry and re-assessment date, and choose its approver with rule R36."),
        o="Decision T7.2-D4 checked; RSK-ACC checked",
        help="A scripted question first: the latest expiry of an acceptance that starts on 1 November 2026. Rule R23 (Learn › Rule tables) sets the limit. When you click Check my answer you see the best option and why. Then fill RSK-ACC from the updated register on Risk Register › Score Risk: R23 picks the risk and dates it, R36 names who approves it. " + CHECK,
        refs=refs(rules=["R23", "R36"], arts=["RSK-ACC"]))
    put(5, "Submit RSK-TOP5 and RSK-ACC", t="Hand in RSK-TOP5 and RSK-ACC", w="Check RSK-TOP5 and RSK-ACC for empty cells and submit both. Both are platform forms: there is no file to name.")
    tool(5, "risk|Heat Map with KRIs")
    put(6, "Decide for each row: For each clause 4–10, decide the status", t="Rate each clause 4–10 of ISO/IEC 27001 (L13)", li="LI-10",
        w=LI10 + "For each of the 25 clauses of LI-PLAN's Gap sheet, decide its status with rule L13: look up each of its deliverables in your review records on Home › Waiting On.",
        o="Status checked for the 25 clauses",
        help="Rule L13 (Learn › Rule tables). Each clause's row lists its deliverables, from Ref-Clause map; the review record of every deliverable you have handed in is on Home › Waiting On. " + CHECK + LIX,
        refs=refs(rules=["L13"], tpls=["T-LI-PLAN"], arts=["LI-PLAN"]))
    put(7, "Decide: Which is a measurable ISMS objective",
        w=then(7, "Then: Copy the likelihood and impact scale names from BKB-ERM-001 Section 6.2–6.4.",
               "Then: Copy into LI-RAM the names of the likelihood scale (BKB-ERM-001 Section 6.2) and of the impact scale (Section 6.3), from score 1 to score 5."),
        o="Decision T7.2-D6 checked; scale names in LI-RAM as BKB-ERM-001 writes them",
        help="A scripted question: Which is a measurable ISMS objective? Read the three options and choose one. When you click Check my answer you see the best option and why. Then copy the scale names into LI-RAM, the risk assessment method card, from BKB-ERM-001 (Policies › Policy Library). A name that is not the document's is flagged at once, with where to read it." + LIX,
        refs=refs(docs=[["BKB-ERM-001", ["6.2", "6.3"]]], arts=["LI-RAM"]))
    put(8, "Copy the appetite (11) and the rules R07 and R08", t="Record the appetite and the treatment due days in LI-RAM",
        w=LI4 + "Copy into LI-RAM the risk appetite of a LOW-criticality organisation (BKB-ERM-001 Section 4) and the due days of each residual rating (Section 7). Rules R07 and R08, the method that uses them, are copied for you.",
        o="Appetite and due days in LI-RAM as BKB-ERM-001 writes them",
        help="BKB-ERM-001 (Policies › Policy Library): Section 4 gives each criticality band's appetite as a maximum score; GlobalConnect is a LOW-criticality organisation. Section 7 gives the due days. A value that is not the document's is flagged at once, with where to read it." + LIX,
        refs=refs(docs=[["BKB-ERM-001", ["4", "7"]]]))
    put(9, "Copy the risk-owner and acceptance rules (R36)", t="Record who accepts each residual rating (R36)",
        w=LI4 + "For each residual rating, choose who may accept the risk: rule R36, the Charter's delegation table (Section 6.1). The risk-owner rule is written for you from BKB-ERM-001 Sections 2 and 3.",
        o="Acceptance authority checked for the four ratings",
        help="Rule R36 (Learn › Rule tables) copies the Charter's Section 6.1 (Policies › Policy Library). " + CHECK + LIX,
        refs=refs(rules=["R36"]))
    put(10, "Write where results are kept", t="Say where the results of risk assessments are kept (clause 8.2)",
        w=LI4 + "ISO/IEC 27001 clause 8.2 asks for the results of risk assessments to be kept as documented information. Choose the record that keeps them.",
        o="Record for clause 8.2 checked",
        help="Ref-Clause map (Learn › Reference pages) gives, for clause 8.2, the documented information it requires and the deliverables that evidence it. " + CHECK + LIX,
        refs=refs(pages=["Ref-Clause map"], clauses=["8.2"]))
    put(11, "Submit LI-RAM", t="Hand in LI-RAM", w=LI4 + "Check LI-RAM for empty cells, name it and submit it.", o="LI-RAM submitted with manifest")
    put(12, 'Open T-LI-PLAN, sheet "Gap"', t="Name what each Partial or Gap clause is missing",
        w=LI10 + "For each clause you rated Partial or Gap, type the deliverables that are not yet accepted: those not in your review records, and those accepted with review comments. They are the clause's action in the plan.",
        o="Missing deliverables checked for the Partial and Gap clauses",
        help="Each clause's deliverables are on its row (Ref-Clause map); your review records are on Home › Waiting On. Type the codes as written, separated by ;. " + CHECK + LIX,
        refs=refs(tpls=["T-LI-PLAN"], arts=["LI-PLAN"]))
    put(13, 'Sheet "Objectives": apply rule L14', t="Write each ISMS objective with its number, unit and date (L14)",
        w=LI10 + "The Objectives sheet copies Ref-Objectives' three templates. For each, choose the objective as it will be measured: rule L14's target, by Ref-Objectives' date, programme week 12 + 6 months. Home › Calendar gives the day week 12 opens.",
        o="Objectives checked for the three templates",
        help="Rule L14 (Learn › Rule tables) gives each objective's target. Ref-Objectives (Learn › Reference pages) gives its owner and its date; count the months from the day week 12 opens. " + CHECK + LIX,
        refs=refs(rules=["L14"], pages=["Ref-Objectives"]))
    put(14, 'Sheet "Plan": apply rule L15', t="Name the owner of each milestone (L15)",
        w=LI10 + "The Plan sheet lists Ref-Milestones' six milestones, dated by rule L15 from programme week 12 + 1 month, one month each. For each, choose its owner with L15.",
        o="Owner checked for the six milestones",
        help="Rule L15 (Learn › Rule tables). The Accountable role of each ISMS process is in Ref-ISMS processes (Learn › Reference pages), as in your LI-POL RACI (T4.1). " + CHECK + LIX,
        refs=refs(rules=["L15"], pages=["Ref-Milestones", "Ref-ISMS processes"]))
    put(15, "Copy the 3 ISMS risks", t="Put each ISMS risk's action into the plan (clause 6.1.1)",
        w=LI10 + "Ref-Milestones lists three risks to the ISMS itself, each with an opportunity: the action that addresses it. Clause 6.1.1 asks for each action to be part of the plan: choose the milestone whose work it belongs to.",
        o="Milestone checked for the three ISMS risks",
        help="The three risks and their opportunities are copied from Ref-Milestones (Learn › Reference pages); the milestones are the Plan sheet's. " + CHECK + LIX,
        refs=refs(pages=["Ref-Milestones"]))
    put(16, "Submit LI-PLAN", t="Hand in LI-PLAN", w=LI10 + "Check LI-PLAN's four sheets for empty cells, name it and submit it.")
    tool(16, "risk|Heat Map with KRIs")
    steps[1]["opt"] = ["↑", "↓", "→"]
    steps[5]["opt"] = ["Conforms", "Partial", "Gap"]


def t81(w: dict) -> None:
    """T8.1 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    src/lib/desk/vul-t81.json holds the scanner export in full (the pack ships 60 of its 172 findings; rows 61-172 and the
    scanner's Last scan / Found in last scan columns are platform-written around the pack's answer key, Content Corrections
    item 66). VUL-TEST is worked in Control Testing › Vulnerability Remediation Check: step 1 sets the class of each kind of
    finding (R24), 2 works out four due dates by hand, 3 each finding's status, 4 each exception (R24), 5 each closure's
    re-scan (BKB-POL-010 Section 6.1), 6 compliance per class (Section 10); 7 asks D5 and writes the memo's recommendations
    (R25); 8 hands in. LI-11: 9 reads the measure card against clause 9.1, 10 asks D6 (no part 2: the platform writes the
    card's fixed fields), 11 rates each class's result against the card's target, 12 hands in.
    """
    t = w["tasks"]["T8.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T8.1"]}
    vul = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "vul-t81.json").read_text(encoding="utf8"))
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = "[LI-11 — Measurement specification for the SLA KPI] "
    LIX = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    # The scanner export in full, where the task, its panel and its tool showed 60 rows, or 14 of another mentee's (142).
    ds = w["ds"]["VUL-FINDINGS"]
    assert ds["n"] == 172 and len(ds["r"]) == 60 and [r[0] for r in ds["r"]] == [r[0] for r in vul["findings"][:60]], "the pack's findings changed"
    assert w["ds"]["EXCEPTIONS"]["r"] == vul["exceptions"], "the pack's exceptions changed"
    ds["h"], ds["r"] = vul["h"], vul["findings"]
    note = (f"Vulnerability scanner export of LearnTech's Amsterdam office on {vul['test']}, the test date: {len(vul['findings'])} findings first "
            "detected in the last six months (dataset VUL-FINDINGS, synthetic). Last scan is the latest scan of the asset, and Found in last scan "
            "whether that scan still found the vulnerability. Exception ID points to the exception register.")
    panel = {"tool": "Control Testing › Vulnerability Remediation Check (VUL-FINDINGS)", "stamp": f"{len(vul['findings'])} findings", "kind": "table", "pl": {"h": vul["h"], "r": vul["findings"], "note": note}}
    assert t["panel"]["stamp"] == "142 findings" and w["tp"]["testing|Vulnerability Remediation Check"]["stamp"] == "142 findings"
    t["panel"] = panel
    w["tp"]["testing|Vulnerability Remediation Check"] = {**panel, "tool": "Control Testing › Vulnerability Remediation Check"}
    closed = [[r[0], r[8], r[9], r[10], r[11]] for r in vul["findings"] if r[9]]
    w["tp"]["testing|Patch Timeline Check"] = {"tool": "Control Testing › Patch Timeline Check", "stamp": f"{len(closed)} closed findings", "kind": "table", "pl": {
        "h": ["Finding", "First detected", "Closed", "Last scan", "Found in last scan"], "r": closed,
        "note": f"The findings of the scanner export of {vul['test']} that are marked closed, with the scanner's latest scan of each."}}
    # Ref-Measure card's formula ("closed within SLA ÷ all findings due in the period") is not the per-class compliance the pack's
    # key computes (findings within SLA, open ones not yet due and valid exceptions included, ÷ all findings of the class): the
    # card states the one BKB-POL-010 Section 10 defines, so that LI-11's check (step 11) can reproduce VUL-TEST.
    mc = w["pages"]["Ref-Measure card"]["r"]
    f = next(r for r in mc if r[0] == "Formula")
    assert f[1] == "Findings closed within SLA ÷ all findings due in the period × 100, per policy class", f
    f[1] = "Findings within SLA at the measurement date ÷ all findings of the class × 100, per policy class (BKB-POL-010 Section 10)"

    old_kr = "KR1 — Class, due date and status correct for ≥ 95 % of 172 findings · Activities 1–3"
    assert old_kr in t["krs"], t["krs"]
    t["krs"][t["krs"].index(old_kr)] = "KR1 — Class of each kind of finding, due-date check and status of the 172 findings correct (≥ 95 %) · Activities 1–3"

    put(1, "Decide for each row: For each finding, decide the policy class", t="Set the policy class of each kind of finding (R24)",
        w="VUL-TEST's class rules list each kind of finding in the scanner export, by exposure, KEV listing and scanner severity, with how many findings are of that kind. Choose each kind's policy class with rule R24; the workbook then gives each of the 172 findings its class.",
        o="Class checked for the 9 kinds of finding",
        help="Rule R24 (Learn › Rule tables) lists the classes in order: the first that fits the finding gives its class. KEV-listed means the vulnerability is in CISA's Known Exploited Vulnerabilities catalogue: attackers are already using it. " + CHECK,
        refs=refs(rules=["R24"]))
    put(2, "Calculate the due date.", t="Work out the due date of one finding of each class",
        w="Before relying on the workbook's due-date formula, work out by hand the due date of one finding of each class: first detected + the class's SLA in days (rule R24). Once your four dates are checked, the formula fills the Due column of all 172 findings.",
        o="Due date checked for four findings, one of each class",
        help="Rule R24: due = first detected + SLA. Count calendar days, across the end of a month. " + CHECK)
    put(3, "Decide for each row: For each finding, decide the status at the test date", t="Decide each finding's status at the test date",
        w=f"For each of the 172 findings, compare its closed date with its due date, or, if it is still open, the test date ({vul['test']}) with its due date, and choose its status.",
        o="Status checked for the 172 findings",
        help="A closed finding is in SLA when it was closed on or before its due date; an open finding is in SLA while its due date has not passed at the test date. Use the dates only: whether a fix is verified is step 5, whether an exception holds is step 4. " + CHECK)
    put(4, "Decide for each row: For each exception, decide Valid or Invalid", t="Test each exception (R24)",
        w=f"For each exception in the register, decide whether it is valid at the test date, {vul['test']}, with rule R24's validity test.",
        o="Validity checked for the 12 exceptions",
        help="Rule R24 (Learn › Rule tables), its last sentence, is the validity test: every part of it must hold. " + CHECK,
        refs=refs(rules=["R24"]))
    put(5, "Decide for each row: For each closed finding, decide Verified or Not verified", t="Check each closure was verified by a re-scan",
        w="For each closed finding, decide whether its fix was verified as BKB-POL-010 Section 6.1 step 4 requires: read its closed date against the scanner's last scan, and what that scan found.",
        o="Verification checked for the 98 closed findings",
        help="BKB-POL-010 (Policies › Policy Library), Section 6.1 step 4, says when a fix counts as verified. " + CHECK,
        refs=refs(docs=[["BKB-POL-010", ["6.1"]]]))
    put(6, "Calculate compliance % per class.", t="Work out compliance per class",
        w="For each class, count the findings within SLA as BKB-POL-010 Section 10 defines it, and type the class's compliance: within SLA / all findings = %, to one decimal.",
        o="Compliance checked for the 4 classes",
        help="Section 10 of BKB-POL-010 (Policies › Policy Library) says which findings are within SLA. Under each class, the workbook counts its findings by what steps 3 to 5 found. " + CHECK,
        refs=refs(docs=[["BKB-POL-010", ["10"]]]))
    # D5's premise ("most breaches are class 1") is not what this office's test shows: asked as the general question it is, and
    # its part 2 is R25 on the office's own counts (Content Corrections item 66).
    old7 = "DECIDE: Most breaches are class 1 on internet-facing assets. Which recommendation comes first?"
    s7 = desect(steps[6]["w"])
    assert old7 in s7 and "Then: Apply rule R25. Complete the memo template." in s7, s7
    put(7, "Decide: Most breaches are class 1 on internet-facing assets", t="Decide which recommendation comes first",
        w=s7.replace(old7, "DECIDE: If most breaches in a test were class 1 findings on internet-facing assets, which recommendation would come first?")
            .replace("Then: Apply rule R25. Complete the memo template.", "Then: Write VUL-MEMO's three recommendations with rule R25: count the breaches of each deviation type of Ref-Actions, V1 to V4, and choose the actions of the three with the most, most first."),
        o="Decision T8.1-D5 checked; the three recommendations checked",
        help="A scripted question first: which recommendation comes first when most breaches are class 1 on internet-facing assets. When you click Check my answer you see the best option and why. Then VUL-MEMO's recommendations: rule R25 (Learn › Rule tables) orders them by the number of breaches; the deviation types and their actions are Ref-Actions' V1 to V4 (Learn › Reference pages). " + CHECK,
        refs=refs(rules=["R25"], pages=["Ref-Actions"], arts=["VUL-MEMO"]))
    put(8, "Submit VUL-TEST and VUL-MEMO", t="Hand in VUL-TEST and VUL-MEMO", w="Check VUL-TEST's sheets and VUL-MEMO for empty cells, name both files and submit them.")
    tool(8, "testing|Vulnerability Remediation Check")
    put(9, "Open T-LI-KPI.", t="Read the measure card against clause 9.1",
        w=LI + "LI-KPI, the measure card, carries the fixed values of Ref-Measure card. ISO/IEC 27001 clause 9.1 asks what an organisation decides for each thing it measures: find the field of the card that answers each of three of its questions.",
        o="Three of clause 9.1's questions answered from LI-KPI",
        help="LI-KPI's fields are copied from Ref-Measure card (Learn › Reference pages); its results come in step 11." + LIX,
        refs=refs(tpls=["T-LI-KPI"], arts=["LI-KPI"]))
    old10 = " Then: Apply rule L16 to every field."
    assert old10 in steps[9]["w"], steps[9]["w"]
    put(10, "Decide: Who evaluates the KPI result",
        w=steps[9]["w"].replace(old10, ""),
        o="Decision T8.1-D6 checked",
        help="A scripted question: Who evaluates the KPI result? Read the three options and choose one. When you click Check my answer you see the best option and why. Once it is checked, the card's fixed fields are written for you from Ref-Measure card (rule L16)." + LIX,
        refs=refs())
    put(11, "Check the formula gives the % in your VUL-TEST.", t="Rate each class's result against the card's target",
        w=LI + "The card's formula, applied to VUL-TEST, gives each class's result. For each class, decide where its result stands against the card's target and thresholds.",
        o="Each class's result against the target checked",
        help="The target and thresholds are a field of the card, from Ref-Measure card. " + CHECK + LIX,
        refs=refs(arts=["LI-KPI"]))
    put(12, "Submit LI-KPI", t="Hand in LI-KPI", w=LI + "Check LI-KPI for empty cells, name it and submit it.")
    tool(12, "testing|Vulnerability Remediation Check")
    steps[10]["opt"] = ["Meets the target", "Below the target", "Below the red threshold"]


def t82(w: dict) -> None:
    """T8.2 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    The mentee's dataset CT-DATA is variant C, the quarterly privileged-access review (48 records, the pack's key: one
    deviation, PR-022, late), while the task's panel and Control Testing › Test Plan showed another mentee's variant B (44
    change requests). src/lib/desk/ct-t82.json (scratchpad build/T8.2/gen.py) holds the records, the fixed test script, the
    review quarters, the sample of quarters, the IAM team's answer and the 5-Whys facts (platform-written, Content
    Corrections item 67). CT-SCRIPT is worked in Control Testing › Test Plan: step 1 reads the script (three questions), 2
    works out R15 by frequency, 3 walks A1-A6 on each sampled record, 4 rates the deviation (R26), 5 concludes (R19), 6 asks
    D4 and writes the memo's recommendation (R25), 7 hands in. LI-12: 8 reads LI-NCR against clause 10.2, 9 writes its
    requirement and gap, 10 grades it (L17), 11 asks D6 and fills the 5-Whys form (L18), 12 hands in.
    """
    t = w["tasks"]["T8.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T8.2"]}
    ct = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "ct-t82.json").read_text(encoding="utf8"))
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = "[LI-12 — Nonconformity, root cause and corrective action] "
    LIX = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    # The mentee's own dataset on the task panel and Control Testing › Test Plan, where both showed variant B's 44 changes.
    ds = w["ds"]["CT-DATA"]
    assert ds["r"] == ct["records"] and ds["h"] == ct["h"], "the pack's CT-DATA changed"
    assert t["panel"]["stamp"] == "44 changes" and w["tp"]["testing|Test Plan"]["stamp"] == "44 changes"
    note = (f"Privileged-access review records of LearnTech's Amsterdam office, October 2025 to September 2026 (dataset CT-DATA, synthetic): "
            f"one record per privileged account per quarter, {len(ct['records'])} records. The fixed test script is CT-SCRIPT Sheet 1.")
    panel = {"tool": "Control Testing › Test Plan (CT-DATA)", "stamp": f"{len(ct['records'])} records", "kind": "table", "pl": {"h": ct["h"], "r": ct["records"], "note": note}}
    t["panel"] = panel
    w["tp"]["testing|Test Plan"] = {**panel, "tool": "Control Testing › Test Plan"}
    av = w["tp"]["testing|Restore Test Review"]
    assert av["pl"]["f"][0] == ["Variant", "Change management"], av
    av["pl"]["f"] = [["Variant", "Privileged-access review (quarterly)"], ["Population", f"{len(ct['records'])} review records, four quarters (CT-DATA)"],
                     ["Attributes", "A1–A6 (CT-SCRIPT Sheet 1)"], ["Conclusion rule", "R19 / Ref-Test rules"]]
    memo = next(x for x in t["subs"] if x["code"] == "CT-MEMO")
    assert memo["fmt"] == "Template (sentence frames)", memo
    memo["fmt"] = "DOCX (template sentence frames)"

    put(1, "Open the test script", t="Read the fixed test script",
        w="Open CT-SCRIPT Sheet 1, the test script: its objective, population, attributes A1 to A6 and pass criteria are already written. Do not change them. Answer its three questions: each is a case you meet when you test the records.",
        o="Three questions on the test script answered",
        help="Sheet 1 says what each attribute checks and which columns to read. Click the cell that answers each question: you see at once whether it is right.")
    put(2, 'Apply rule R15. Click "Select sample".', t="Work out the sample (R15)",
        w="Apply rule R15 to the privileged-access review: record LearnTech's control frequency and the minimum sample Ref-Sampling sets for it. Once your answers are checked, the platform selects the quarters with the seed and lists their records in Sheet 2.",
        o="Control frequency and minimum sample checked; quarters selected",
        help="Rule R15 is in Learn › Rule tables and Ref-Sampling in Learn › Reference pages. LearnTech's control frequencies are in BKB-ADD-36 Section 5 (Policies › Policy Library). " + CHECK,
        refs=refs(rules=["R15"], pages=["Ref-Sampling"], docs=[["BKB-ADD-36", ["5"]]]))
    put(3, "Decide for each row: For each sampled item, decide pass or fail per attribute", t="Test each sampled record against A1 to A6",
        w="For each record of the sampled quarters, read A1 to A6 in order and mark every attribute that fails.",
        o=f"Pass or Fail, with every failed attribute, recorded for the {sum(r[1] in ct['sample'] for r in ct['records'])} sampled records",
        help="Walk the test script beside the table for each record: the result fills Result and Attributes failed. " + CHECK)
    put(4, "Decide for each row: For each deviation, decide the rating", t="Rate each deviation (R26)",
        w="For each deviation in Sheet 3, choose its rating with rule R26: read its ratings in order, and take the first that fits.",
        o="Rating checked for each deviation",
        help="Rule R26 (Learn › Rule tables) rates a deviation by what it affects and what went wrong. Which of LearnTech's assets are Mission Critical, office by office, is in BKB-ADD-36 Section 8 (Policies › Policy Library). " + CHECK,
        refs=refs(rules=["R26"], docs=[["BKB-ADD-36", ["8"]]]))
    put(5, "Decide for each row: Decide the conclusion", t="Conclude the test (R19)",
        w="Work out rule R19 for your test: how many deviations Sheet 3 holds, the highest rating, then the conclusion.",
        o="R19 worked out and the conclusion checked; CT-MEMO's conclusion written",
        help="Count and rate Sheet 3's deviations, then apply R19 (Learn › Rule tables). " + CHECK)
    # D4 is about a change-management test; this mentee's test is the privileged-access review (variant C): asked as the
    # general question it is. Its part 2 is R25 on the mentee's own deviation (Content Corrections item 67).
    old6 = "DECIDE: Two deviations: both changes were implemented before approval. Which recommendation?"
    then6 = "Then: Apply rule R25 for the recommendations. Complete the memo frame."
    s6 = desect(steps[5]["w"])
    assert old6 in s6 and then6 in s6, s6
    put(6, "Decide: Two deviations: both changes were implemented before approv", t="Decide: The recommendation for changes implemented before approval",
        w=s6.replace(old6, "DECIDE: In a change-management test, two changes were implemented before approval. Which recommendation?")
            .replace(then6, "Then: Write CT-MEMO's recommendation with rule R25: the Ref-Actions action for the deviation type your own test found."),
        o="Decision T8.2-D4 checked; the recommendation checked",
        help="A scripted question first, about a change-management test. When you click Check my answer you see the best option and why. Then CT-MEMO's recommendation: rule R25 (Learn › Rule tables) takes the Ref-Actions action (Learn › Reference pages) for each deviation type your test found. " + CHECK,
        refs=refs(rules=["R25"], pages=["Ref-Actions"], arts=["CT-MEMO"]))
    put(7, 'Submit CT-SCRIPT and CT-MEMO', t="Hand in CT-SCRIPT and CT-MEMO", w="Check CT-SCRIPT's sheets and CT-MEMO for empty cells, name both files and submit them.")
    tool(7, "testing|Test Plan")
    put(8, "Open T-LI-NCR. Copy the first deviation from CT-MEMO.", t="Read the nonconformity report against clause 10.2",
        w=LI + "LI-NCR, the nonconformity report, records the first deviation of CT-MEMO: the platform copies it in, and you write the rest in steps 9 to 11. ISO/IEC 27001 clause 10.2 says what an organisation does when a nonconformity occurs: find the field of the report that records each of three of its requirements.",
        o="Three of clause 10.2's requirements matched to LI-NCR's fields",
        help="Each field of LI-NCR says what it holds; its entries are made in steps 9 to 11." + LIX)
    put(9, "Complete the NC frame: requirement (copy the clause), evidence (row)", t="Write the nonconformity's requirement and gap",
        w=LI + "LI-NCR's evidence, PR-022's record, is copied for you. Choose the requirement it breaks, as BKB-POL-006 writes it, and work out the gap: how many days after its quarter ended the review was done.",
        o="Requirement and gap checked",
        help="BKB-POL-006 (Policies › Policy Library) holds the requirements; the quarters are in CT-SCRIPT Sheet 1's population. " + CHECK + LIX,
        refs=refs(docs=[["BKB-POL-006", ["3.1", "4", "6.2"]]], arts=["LI-NCR"]))
    put(10, "Decide for each row: Decide the nonconformity grade", t="Grade the nonconformity (L17)",
        w=LI + "Grade the nonconformity with rule L17: Major or Minor.",
        o="Grade checked",
        help="Rule L17 is in Learn › Rule tables; the note gives your test's sample and deviations. " + CHECK + LIX)
    # D6's help quoted L18's corrective action, which is D6's best option in other words: read before the question.
    old11 = "DECIDE: Which is a CORRECTIVE action (not a correction)?"
    then11 = "Then: Apply rule L18. Fill the 5-Whys form and the three action fields."
    s11 = desect(steps[10]["w"])
    assert old11 in s11 and then11 in s11 and 'Corrective action = \\"Add the missing step' not in s11, s11
    assert 'Corrective action = "Add the missing step to the procedure and train the owners"' in steps[10]["help"], steps[10]["help"]
    put(11, "Decide: Which is a CORRECTIVE action (not a correction)", t="Decide: Which is a corrective action, not a correction",
        w=s11.replace(old11, "DECIDE: A change was implemented without approval. Which is a CORRECTIVE action (not a correction)?")
             .replace(then11, "Then: Fill LI-NCR's 5-Whys form with rule L18, from the facts of your own nonconformity; its three action fields are then written for you."),
        o="Decision T8.2-D6 checked; the 5-Whys form checked",
        help="A scripted question first: which action is corrective, not a correction. When you click Check my answer you see the best option and why. Then the 5-Whys form: rule L18 answers the five questions of Ref-5-Whys with facts from your test's evidence: the note gives the IAM team's answer on PR-022, and BKB-POL-006 Section 6.2 (Policies › Policy Library) the procedure. " + CHECK + LIX,
        refs=refs(rules=["L18"], docs=[["BKB-POL-006", ["6.2"]]], arts=["LI-NCR"]))
    put(12, "Submit LI-NCR", t="Hand in LI-NCR", w=LI + "Check LI-NCR for empty cells, name it and submit it.")
    tool(12, "testing|Test Plan")


def t91(w: dict) -> None:
    """T9.1 in the platform's own terms (desk-step-builder, 29 Oct 2026), keeping the pack's intent.

    The mentee's vendor is Lumen Learner Analytics (dataset VEN-INTAKE; the pack's key: tier High), while the task's panel and
    Vendors › Vendor Intake and Set Risk Tier showed another mentee's vendor (ProctorEye AI Ltd). src/lib/desk/ven-t91.json
    (scratchpad build/T9.1/gen.py) holds the intake form, with four platform-written lines (Requested by, Identifiers sent,
    Users, Delivery), and the rows of the steps' sheets. BKB-POL-013's text is platform-written; its Section 3.1 says what
    R35's terms mean. Step 1 records the facts R35 reads (VEN-TIER), 2 tiers the vendor, 3 asks D2 (VEN-Q is then written),
    4 asks D3 and marks VEN-CL's clauses, 5 hands in; LI-13: 6 the service model and its split, 7 maps the fixed questions
    to their controls, 8 hands in. Content Corrections item 68.
    """
    t = w["tasks"]["T9.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T9.1"]}
    ven = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "ven-t91.json").read_text(encoding="utf8"))
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = "[LI-13 — Cloud services and the ICT supply chain in the questionnaire] "
    LIX = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    # The mentee's own vendor on the panel and the Vendors screens, where they showed ProctorEye AI Ltd.
    v = dict(zip(w["ds"]["VEN-INTAKE"]["h"], w["ds"]["VEN-INTAKE"]["r"][0]))
    assert v["name"] == ven["intake"][0][1] == "Lumen Learner Analytics", v
    assert t["panel"]["pl"]["f"][0] == ["Name", "ProctorEye AI Ltd"] and w["tp"]["vendors|Vendor Intake"]["pl"]["f"][0] == ["Name", "ProctorEye AI Ltd"]
    intake = {"tool": "Vendors › Vendor Intake", "stamp": "Submitted by the business owner", "kind": "form", "pl": {"f": ven["intake"]}}
    t["panel"] = intake
    w["tp"]["vendors|Vendor Intake"] = json.loads(json.dumps(intake))
    tier = w["tp"]["vendors|Set Risk Tier"]["pl"]
    assert tier["f"][0] == ["Vendor", "ProctorEye AI Ltd"], tier
    tier["f"][0][1], tier["f"][1][1] = v["name"], v["data"]

    put(1, "Open VEN-INTAKE. Copy the data access and service facts into VEN-TIER.", t="Record the facts rule R35 tiers by",
        w="Lumen Learner Analytics' intake form is in Vendors › Vendor Intake. Read it with BKB-POL-013 Section 3.1, which says what each of rule R35's terms means and which line of the form it is read from. Record each fact in VEN-TIER: the highest data tier, then Yes or No for each criterion.",
        o="Six tiering facts checked in VEN-TIER",
        help="BKB-POL-013 (Policies › Policy Library) Section 3.1 defines R35's terms and names the line of the intake form each is read from. " + CHECK,
        refs=refs(docs=[["BKB-POL-013", ["3.1"]]], ds=["VEN-INTAKE"], arts=["VEN-TIER"]))
    tool(1, "vendors|Set Risk Tier")
    put(2, "Decide for each row: Decide the vendor tier", t="Tier the vendor (R35)",
        w="Apply rule R35 to the facts step 1 checked: read the tiers from Critical down and stop at the first that matches. Choose the tier in VEN-TIER.",
        o="Vendor tier checked in VEN-TIER",
        help="Rule R35 is in the note above the table, with your facts as step 1 checked them. " + CHECK,
        refs=refs(rules=["R35"], arts=["VEN-TIER"]))
    tool(2, "vendors|Set Risk Tier")
    # D2 named a tier ("The vendor is Medium tier"): this mentee's vendor is High, and naming either would give step 2's answer
    # away. Asked about the vendor's own tier; the options say the same three things in those terms. VEN-Q is written once
    # the answer is checked: including each question follows from the answer (no part 2).
    old3 = "DECIDE: The vendor is Medium tier. Which questions do you include? Options: A) Low and Medium questions  B) All questions  C) Only the Medium questions. Then: Apply rule R27: filter Ref-Questions by tier. Copy the questions into VEN-Q."
    assert steps[2]["w"] == old3, steps[2]["w"]
    put(3, "Decide: The vendor is Medium tier. Which questions do you include", t="Decide: Which questions go into the vendor's questionnaire",
        w="DECIDE: Which questions of Ref-Questions go into Lumen's questionnaire, VEN-Q? Options: A) Every question marked for the vendor's tier or a lower tier  B) Every question in the bank, whatever its tier  C) Only the questions marked for the vendor's tier.",
        opt=["Every question marked for the vendor's tier or a lower tier", "Every question in the bank, whatever its tier", "Only the questions marked for the vendor's tier"],
        o="Decision T9.1-D2 checked; VEN-Q written for the vendor's tier",
        help="A scripted question. Read the situation and the three options, and choose one. When you click Check my answer you see the best option and why. VEN-Q is then written for you from Ref-Questions (Learn › Reference pages).",
        refs=refs(rules=["R27"], pages=["Ref-Questions"], arts=["VEN-Q"]))
    tool(3, "vendors|Send Questionnaire")
    old4 = "Then: Apply rule R27 to the clause list. Copy the clauses into VEN-CL."
    assert old4 in steps[3]["w"], steps[3]["w"]
    put(4, "Decide: The service will be hosted in another country", t="Decide: The service will be hosted in another country",
        w=steps[3]["w"].replace(old4, "Then: Mark each clause of VEN-CL Yes or No for the vendor's tier, with rule R27."),
        o="Decision T9.1-D3 checked; VEN-CL's clauses checked",
        help="A scripted question first. When you click Check my answer you see the best option and why. Then VEN-CL: rule R27, in the note above the checklist, says which of Ref-Clauses' clauses a vendor's tier includes. " + CHECK,
        refs=refs(rules=["R27"], arts=["VEN-CL"]))
    tool(4, "vendors|Contract & DPA Check")
    put(5, "Submit VEN-TIER, VEN-Q and VEN-CL", t="Hand in VEN-TIER, VEN-Q and VEN-CL",
        w="Check VEN-TIER, VEN-Q and VEN-CL for empty cells, name the two workbooks and submit all three.")
    tool(5, "vendors|Set Risk Tier")
    put(6, "Decide for each row: Decide the cloud service model", t="Decide the cloud service model and who secures what (L19)",
        w=LI + "Read how Lumen delivers its service on its intake form (Vendors › Vendor Intake) and choose its service model from Ref-Cloud (Learn › Reference pages). Then, from Ref-Cloud's row for that model, choose who secures each part: Lumen, the provider, or LearnTech, the customer.",
        o="Service model and shared-responsibility split checked (VEN-Q, LI-CLD)",
        help="The intake form's Delivery line says who runs what; Ref-Cloud says what the provider and the customer secure under each model. " + CHECK + LIX,
        refs=refs(rules=["L19"], pages=["Ref-Cloud"], ds=["VEN-INTAKE"], arts=["VEN-Q"]))
    tool(6, "vendors|Send Questionnaire")
    put(7, "Copy the 5 fixed questions into VEN-Q.", t="Map the five fixed questions to their controls",
        w=LI + "Rule L19 adds Ref-Cloud's five fixed cloud and supply-chain questions to VEN-Q: the platform copies them in. For each, choose the Annex A control it gives evidence for: A.5.23, the use of cloud services, or A.5.21, the ICT supply chain. BKB-POL-021 (Cloud Security Policy) implements A.5.23; its Section 3.1 says what it requires of every cloud service.",
        o="Five fixed questions in VEN-Q, each mapped to its control and checked",
        help="BKB-POL-021 Sections 3.1 and 9 (Policies › Policy Library) say what the cloud-services control covers. " + CHECK + LIX,
        refs=refs(docs=[["BKB-POL-021", ["3.1", "9"]]], arts=["VEN-Q"]))
    tool(7, "vendors|Send Questionnaire")
    put(8, "Submit with VEN-Q.", t="Hand in VEN-Q with its cloud section",
        w=LI + "Check VEN-Q's cloud and supply-chain section (LI-CLD) for empty cells, name the file and submit it.")
    tool(8, "vendors|Send Questionnaire")
    # The card and KR3 named D3's answer (the transfer clause), read before the question.
    for holder, key in ((w["tasks"], "T9.1"), (w["cards"], "T9.1")):
        if key not in holder:
            continue
        x = json.dumps(holder[key], ensure_ascii=False)
        for a, b in (("Recognise a cross-border transfer and add the transfer mechanism", "Recognise a cross-border transfer and what the contract needs for it"),
                     ("Clause checklist complete, transfer clause included;", "Clause checklist complete for the tier and the hosting location;")):
            x = x.replace(a, b)
        holder[key] = json.loads(x)
    t = w["tasks"]["T9.1"]
    blob = json.dumps([t, w["notes"]["T9.1"], w["cards"].get("T9.1")], ensure_ascii=False)
    assert "transfer clause included" not in blob and "add the transfer mechanism" not in blob
    assert "ProctorEye" not in blob and "Medium tier" not in blob, "T9.1 still names another vendor or tier"

def t92(w: dict) -> None:
    """T9.2 in the platform's own terms (desk-step-builder, 30 Oct 2026), keeping the pack's intent.

    The mentee's vendor is Lumen Learner Analytics (dataset SOC2-SUMMARY; the pack's key: S2, S4, S5, S7, S9 fail, review
    date 2026-12-04), while the task's panel and Vendors › SOC Report Review showed another mentee's report (ProctorEye AI
    Ltd). src/lib/desk/soc-t92.json (scratchpad build/T9.2/gen.py) holds Lumen's report, the review date and the rows of the
    steps' sheets. BKB-POL-013 Section 7.1 says how each check is read (platform-written). Step 1 matches report lines to
    their checks (STUDY), 2 records each check Pass or Fail (SOC-REV), 3 gives the CUEC its owner, 4 walks R28 on the
    failed checks and records the decision (SOC-DEC), 5 hands in. Content Corrections item 69.
    """
    t = w["tasks"]["T9.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T9.2"]}
    soc = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "soc-t92.json").read_text(encoding="utf8"))
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    # The mentee's own vendor's report on the panel and Vendors › SOC Report Review, where they showed ProctorEye AI Ltd's.
    # The old note ("Qualified opinion or service out of scope → reject") stated R28's outcome beside a qualified opinion,
    # before the checks are made: it now gives the review date S3 counts to.
    rep = dict(w["ds"]["SOC2-SUMMARY"]["r"])
    assert rep["Vendor"] == soc["report"][0][1] == "Lumen Learner Analytics", rep
    old = w["tp"]["vendors|SOC Report Review"]
    assert t["panel"]["pl"]["f"][0] == ["Vendor", "ProctorEye AI Ltd"] and old["pl"]["f"][0] == ["Vendor", "ProctorEye AI Ltd"], old
    assert old["pl"]["note"] == "Check S1–S9 (R28). Qualified opinion or service out of scope → reject.", old["pl"]["note"]
    report = {"tool": "Vendors › SOC Report Review", "stamp": "SOC 2 summary", "kind": "form",
              "pl": {"f": soc["report"], "note": f"Your review date: {soc['review']}. Read each line with checks S1–S9 (Ref-SOC checks) and BKB-POL-013 Section 7.1."}}
    t["panel"] = report
    w["tp"]["vendors|SOC Report Review"] = json.loads(json.dumps(report))

    put(1, "Open SOC2-SUMMARY and Ref-SOC checks.", t="Match the report's lines to checks S1–S9",
        w="Lumen Learner Analytics' SOC 2 report summary is in Vendors › SOC Report Review. SOC-REV's checklist, below, gives the checks S1–S9 (Ref-SOC checks). Answer each question by clicking the code of the check that reads the line of the report it names.",
        o="Three questions answered in SOC-REV's checklist",
        help="Open the report from the toolbar and keep it beside the checklist. Each question names one line of the report; the check that reads it is the one whose words are about what that line says. A wrong click gives a hint.",
        refs=refs(pages=["Ref-SOC checks"], ds=["SOC2-SUMMARY"]))
    put(2, "Decide for each row: For each check S1–S9, decide pass or fail", t="Record each check S1–S9 Pass or Fail",
        w="Read Lumen's report (Vendors › SOC Report Review) line by line, as BKB-POL-013 Section 7.1 says, on your review date. Record each check in SOC-REV: Pass, or Fail.",
        o="Nine checks checked in SOC-REV",
        help="BKB-POL-013 (Policies › Policy Library) Section 7.1 says how each check is read and which line of the report it reads; two checks also read Lumen's intake form (Vendors › Vendor Intake). " + CHECK,
        refs=refs(docs=[["BKB-POL-013", ["7.1"]]], pages=["Ref-SOC checks"], ds=["SOC2-SUMMARY", "VEN-INTAKE"], arts=["SOC-REV"]))
    put(3, "Decide for each row: For each CUEC, choose the internal owner", t="Give each CUEC its internal owner",
        w="Each row of SOC-REV's CUEC sheet is a complementary user entity control from Lumen's report: a control Lumen expects LearnTech to run. Choose the internal owner of each from Ref-Conditions (Learn › Reference pages).",
        o="Every CUEC's owner checked in SOC-REV",
        help="Ref-Conditions' last rows name the internal owner of each kind of CUEC. " + CHECK,
        refs=refs(pages=["Ref-Conditions"], arts=["SOC-REV"]))
    put(4, "Decide for each row: Decide the onboarding decision", t="Decide onboarding with rule R28",
        w="Walk rule R28 on the checks step 2 found failing: for each, say whether it rejects the vendor on its own or needs a condition (Ref-Conditions). Then record the onboarding decision in SOC-DEC.",
        o="R28's effect of each failed check and the decision checked in SOC-DEC",
        help="Rule R28 is in the note above the table; Ref-Conditions (Learn › Reference pages) gives each failed check's condition. " + CHECK,
        refs=refs(rules=["R28"], pages=["Ref-Conditions"], arts=["SOC-DEC"]))
    put(5, "Submit SOC-REV and SOC-DEC.", t="Hand in SOC-REV and SOC-DEC",
        w="Check SOC-REV and SOC-DEC for empty cells, name the two files and submit them.")
    s5 = steps[4]
    s5["key"], s5["sec"], s5["tool"] = "vendors|SOC Report Review", "vendors", "Vendors › SOC Report Review"
    blob = json.dumps([t, w["notes"]["T9.2"]], ensure_ascii=False)
    assert "ProctorEye" not in blob and "DECIDE" not in blob and "after you submit" not in blob, "T9.2 still names another vendor or the pack's prompts"

def t101(w: dict) -> None:
    """T10.1 in the platform's own terms (desk-step-builder, 30 Oct 2026), keeping the pack's intent.

    The mentee's processing activity is "Corporate LMS for adult learners" (dataset PROC-DESC: Amsterdam and Mumbai,
    processor; the pack's key: no DPIA), while the task's panel and Regulatory Watch › RoPA & Data Flows showed another
    mentee's ("Assessment, quiz responses and grading"), and Risk Register › Asset Register showed GlobalConnect's assets.
    src/lib/desk/ropa-t101.json (scratchpad build/T10.1/gen.py) holds the processing description (platform-written beyond
    the pack's three lines), the purposes, the data-flow lines and LearnTech's asset register rows (the pack's). BKB-POL-017's
    text is platform-written. Step 1 asks D1 (no part 2: the role is the contract register's), 2 the lawful basis of each
    purpose, 3 the data-flow map's shapes and system names, 4 each transfer's mechanism, 5 the DPIA screening, 6 hands in.
    Content Corrections item 70.
    """
    t = w["tasks"]["T10.1"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T10.1"]}
    ropa = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "ropa-t101.json").read_text(encoding="utf8"))
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    # The mentee's own processing activity on the panel and the RoPA screen; LearnTech's asset register for this task.
    d = dict(zip(w["ds"]["PROC-DESC"]["h"], w["ds"]["PROC-DESC"]["r"][0]))
    assert d["Activity"] == ropa["desc"][0][1] == "Corporate LMS for adult learners", d
    old = w["tp"]["regwatch|RoPA & Data Flows"]
    assert t["panel"]["pl"]["f"][0] == ["Activity", "Assessment, quiz responses and grading"] and old["pl"]["f"][0] == t["panel"]["pl"]["f"][0], old
    desc = {"tool": "Regulatory Watch › RoPA & Data Flows", "stamp": "Processing activity description", "kind": "form", "pl": {"f": ropa["desc"]}}
    t["panel"] = desc
    w["tp"]["regwatch|RoPA & Data Flows"] = json.loads(json.dumps(desc))
    # PROC-DESC's "Role (contract register)" column states D1's answer ("processor") before it is asked, wherever the
    # dataset is opened (the task file's data viewer). The platform writes the role into ROPA once D1 is checked.
    pd = w["ds"]["PROC-DESC"]
    assert pd["h"] == ["Activity", "Offices involved", "Role (contract register)"] and pd["r"][0][2] == "processor", pd
    pd["h"], pd["r"] = pd["h"][:2], [r[:2] for r in pd["r"]]
    pd["cols"] = 2
    assert w["tp"]["risk|Asset Register"]["pl"]["r"][0][0] == "A-01", "the shared Asset Register screen changed"
    w["tp"]["risk|Asset Register#T10.1"] = {"tool": "Risk Register › Asset Register", "stamp": f"{len(ropa['assets'])} assets", "kind": "table",
        "pl": {"h": ["Asset", "Office", "Description"], "r": [[r[0], r[1], r[3]] for r in ropa["assets"]],
               "note": "LearnTech Educational Solutions: the customer-facing assets of the Amsterdam and Mumbai offices (Customer Operations & Support, Student Services, EdTech & Learning Platforms)."}}

    old1 = "Then: Open PROC-DESC. Copy the role (rule R29)."
    assert steps[0]["w"].endswith(old1), steps[0]["w"]
    put(1, "Decide: LearnTech Educational Solutions processes the data only on",
        w=steps[0]["w"].replace(" " + old1, ""),
        o="Decision T10.1-D1 checked; the role recorded in ROPA",
        help="A scripted question. Read the situation and the three options, and choose one; BKB-POL-017 Section 3.2 (Policies › Policy Library) says what each role means. When you click Check my answer you see the best option and why. ROPA then records the role from the contract register.",
        refs=refs(docs=[["BKB-POL-017", ["3.2"]]], arts=["ROPA"]))
    assert steps[1]["w"].startswith("DECIDE (for each item): For each purpose, choose the lawful basis.") and "addendum Section 2 lawful-basis column" in desect(steps[1]["w"])
    put(2, "Decide for each row: For each purpose, choose the lawful basis", t="Choose the lawful basis of each purpose",
        w="The RoPA records, for each purpose of the processing, the lawful basis it rests on: for an activity LearnTech carries out for a client, the basis the client relies on. Choose each purpose's lawful basis in ROPA with BKB-POL-017 Section 3.1 (Policies › Policy Library).",
        o="Lawful basis of every purpose checked in ROPA",
        help="BKB-POL-017 Section 3.1's lawful-basis table asks its questions in order: the first yes gives the basis. " + CHECK,
        refs=refs(docs=[["BKB-POL-017", ["3.1"]]], arts=["ROPA"]))
    put(3, "Draw the data flow with the template shapes", t="Draw the data flow with the template shapes",
        w="Each row of DFM is one movement of the personal data. Give it its T-ROPA shape (Collect, System, Transfer or Delete), and copy the name of the system it happens in from Risk Register › Asset Register.",
        o="Shape of every flow checked; system names copied from the asset register",
        help="The note above the table says what each shape means; BKB-POL-017 Section 3.1 (Policies › Policy Library) says what counts as a transfer. Copy each system's name as the asset register writes it. " + CHECK,
        refs=refs(docs=[["BKB-POL-017", ["3.1"]]], arts=["DFM"]))
    tool(3, "regwatch|RoPA & Data Flows")
    put(4, "Copy each cross-border transfer mechanism from BKB-ADD-36 Section 2", t="Copy each cross-border transfer mechanism from BKB-ADD-36 Section 2",
        w="For each flow step 3 found to be a transfer, copy the mechanism from the Cross-border transfer column of BKB-ADD-36 Section 2, in the row of the office the data leaves (BKB-POL-017 Section 3.1).",
        o="Mechanism of every transfer copied and checked in DFM",
        help="Copy the cell exactly as Section 2 writes it; the evidence ref is written for you from the row you copied. " + CHECK,
        refs=refs(docs=[["BKB-ADD-36", ["2"]], ["BKB-POL-017", ["3.1"]]], arts=["DFM"]))
    assert steps[4]["w"].startswith("DECIDE (for each item): Decide whether a DPIA is required.")
    put(5, "Decide for each row: Decide whether a DPIA is required", t="Screen the activity for a DPIA (R29)",
        w="Read the processing description (Regulatory Watch › RoPA & Data Flows) against each of rule R29's triggers, as BKB-POL-017 Section 6.2 defines them: is it involved, Yes or No? Then record whether a DPIA is required.",
        o="DPIA screening checked in ROPA",
        help="Rule R29 is in the note above the table; BKB-POL-017 Section 6.2 (Policies › Policy Library) says what each trigger means. " + CHECK,
        refs=refs(rules=["R29"], docs=[["BKB-POL-017", ["6.2"]]], arts=["ROPA"]))
    put(6, 'Submit ROPA and DFM. Click "Done".', t="Hand in ROPA and DFM",
        w="Check ROPA and DFM for empty cells, name the two files and submit them.", o="ROPA and DFM submitted with manifest")
    tool(6, "regwatch|RoPA & Data Flows")
    # The card stated inject J1's answer ("A new AI tool that profiles customers needs a DPIA").
    old_j1 = "A new AI tool that profiles customers needs a DPIA (inject T10.1-J1)."
    x = json.dumps(t["card"], ensure_ascii=False)
    assert old_j1 in x, "T10.1's card changed"
    new_j1 = "Whether a new AI tool that profiles customers needs a DPIA is a question you may meet (inject T10.1-J1)."
    if "T10.1" in w["cards"]:
        w["cards"]["T10.1"] = json.loads(json.dumps(w["cards"]["T10.1"], ensure_ascii=False).replace(old_j1, new_j1))
    t["card"] = json.loads(x.replace(old_j1, "Whether a new AI tool that profiles customers needs a DPIA is a question you may meet (inject T10.1-J1)."))
    blob = json.dumps([t, w["notes"]["T10.1"]], ensure_ascii=False)
    assert not any("Role (contract register)" in json.dumps(x) for x in (desc, w["ds"]["PROC-DESC"])), "the role shows before D1"
    for bad in ("Assessment, quiz responses", "DECIDE (for each", "after you submit", "lawful-basis column", "needs a DPIA (inject", "Copy the role"):
        assert bad not in blob, f"T10.1 still says {bad!r}"


def t102(w: dict) -> None:
    """T10.2 in the platform's own terms (desk-step-builder, 30 Oct 2026), keeping the pack's intent.

    The mentee's incident is INC-2610-3001 (dataset BRC-FACTS: discovered 2026-12-08 13:20 UTC, Amsterdam's systems, data
    subjects in India, Turkey and the United States; the pack's key: GDPR, KVKK, DPDP and US state laws, earliest firm
    deadline 2026-12-11 13:20 UTC), while the task's panel and Regulatory Watch › Breach Clock Calculator showed another
    mentee's (INC-2610-3748). src/lib/desk/brc-t102.json (scratchpad build/T10.2/gen.py) holds the incident record, the
    regime rows, the R30 conditions, the LI-IRBC phase sheet, the incident timeline and the BC/DR rows. BKB-POL-014 Section 6.3
    (which regimes apply) and BKB-ADD-36 Section 8.2 (Amsterdam's BIA) are platform-written. Step 1 copies the discovery
    time, 2 the offices and countries, 3 decides each regime, 4 works out each deadline and the earliest firm one, 5 walks
    R30's data-subject test, 6 asks D4 (no part 2: the plan records the hold), 7 hands in; 8 reads LI-IRBC's phase sheet
    (STUDY), 9 maps the timeline's events to phases, 10 decides BC and DR (L20), 11 hands in. Content Corrections item 71.
    """
    t = w["tasks"]["T10.2"]
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T10.2"]}
    brc = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "brc-t102.json").read_text(encoding="utf8"))
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert desect(s["t"]).startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    # The mentee's own incident on the panel and the Breach Clock Calculator, where they showed INC-2610-3748.
    f = dict(zip(w["ds"]["BRC-FACTS"]["h"], w["ds"]["BRC-FACTS"]["r"][0]))
    rec = dict(brc["record"])
    assert f["Incident"] == rec["Incident"] == "INC-2610-3001" and f["Discovered (UTC)"] == rec["Discovered (UTC)"], f
    old = w["tp"]["regwatch|Breach Clock Calculator"]
    assert t["panel"]["pl"]["f"][0] == ["Incident", "INC-2610-3748"] and old["pl"]["f"][0] == t["panel"]["pl"]["f"][0], old
    screen = {"tool": "Regulatory Watch › Breach Clock Calculator", "stamp": "Incident record", "kind": "form",
              "pl": {"f": brc["record"], "note": "Every notification deadline is worked out from the discovery time with rule R30. Legal interpretations are confirmed with the DPO."}}
    t["panel"] = screen
    w["tp"]["regwatch|Breach Clock Calculator"] = json.loads(json.dumps(screen))

    put(1, "Open BRC-FACTS. Copy the discovery time (UTC).", t="Copy the discovery time (UTC)",
        w="Every statutory clock counts from the moment the breach was discovered. Copy the discovery time from the incident record (Regulatory Watch › Breach Clock Calculator) into BRC-ASSESS's Facts sheet, as the record writes it.",
        o="Discovery time copied into BRC-ASSESS",
        help="The incident record is in Regulatory Watch › Breach Clock Calculator; the same facts are dataset BRC-FACTS in your task folder. Copy the time with its date and \"UTC\". The evidence ref is written for you.",
        refs=refs(ds=["BRC-FACTS"], arts=["BRC-ASSESS"]))
    put(2, "List the affected offices and the data-subject countries.", t="List the affected offices and the data-subject countries",
        w="Rule R30 looks up the regimes from two lists: the offices whose systems are affected and the countries where the affected people live. Copy both from the incident record (Regulatory Watch › Breach Clock Calculator) into the Facts sheet.",
        o="Offices and countries checked in BRC-ASSESS",
        help="Copy every office and every country the record lists, separated by \";\" as the record writes them. The evidence ref is written for you. " + CHECK,
        refs=refs(ds=["BRC-FACTS"], arts=["BRC-ASSESS"]))
    assert steps[2]["w"].startswith("DECIDE (for each item): For each regime, decide Applies")
    put(3, "Decide for each row: For each regime, decide Applies, Applies if condition met", t="Decide which regimes apply (R30)",
        w="Each row of BRC-ASSESS's Regimes sheet is a regime from BKB-ADD-36 Section 2. Decide for each whether it applies to this incident, applies only if a condition is met, or does not apply, with BKB-POL-014 Section 6.3.",
        o="Every regime's applicability checked in BRC-ASSESS",
        help="BKB-POL-014 Section 6.3 (Policies › Policy Library) says, step by step, which offices an incident engages and which of their regimes apply; the offices and countries are the ones you copied in step 2. " + CHECK,
        refs=refs(rules=["R30"], docs=[["BKB-POL-014", ["6.3"]]], arts=["BRC-ASSESS"]))
    assert "Choose the earliest firm deadline" in steps[3]["w"]
    put(4, "Decide for each row: Choose the earliest firm deadline", t="Work out each deadline and the earliest firm one",
        w="For each regime step 3 found to apply, work out its deadline in UTC: the discovery time plus its clock (BKB-POL-014 Section 6.3, step 6). Then write the earliest firm deadline, the one the plan works to.",
        o="Deadlines and the earliest firm deadline checked in BRC-ASSESS",
        help="Count hours and days in calendar time, weekends included; business days skip Saturdays and Sundays. A regime that applies only if a condition is met has no firm clock. " + CHECK,
        refs=refs(rules=["R30"], docs=[["BKB-POL-014", ["6.3"]]], arts=["BRC-ASSESS"]))
    assert steps[4]["w"].startswith("DECIDE (for each item): Decide whether data subjects must be told.")
    put(5, "Decide for each row: Decide whether data subjects must be told", t="Decide whether data subjects must be told (R30)",
        w="Read the incident record (Regulatory Watch › Breach Clock Calculator) against each condition of rule R30's last sentence: is it met, Yes or No? Then record whether the data subjects must be told.",
        o="R30's data-subject test checked in BRC-ASSESS",
        help="Rule R30 is in the note above the table; the data categories, the number of records and the children's-data flag are in the incident record. " + CHECK,
        refs=refs(rules=["R30"], arts=["BRC-ASSESS"]))
    # D4: no part 2. Filling the plan with what steps 2–5 decided, and ticking "Legal sign-off required", copies answers
    # already given: the platform writes BRC-PLAN from the checked steps and the checked answer.
    s6 = steps[5]
    then6 = ' Then: Fill the plan template and the breach-register entry. Tick "Legal sign-off required".'
    assert s6["w"].endswith(then6) and s6["did"] == "T10.2-D4", s6["w"]
    help6 = "A scripted question. Read the situation and the three options, and choose one; BKB-POL-014 Section 6.1 (Policies › Policy Library) sets out how notifications are made. When you click Check my answer you see the best option and why. BRC-PLAN then records your answer, with the regimes, deadlines and data-subject decision of steps 2 to 5."
    assert "Then do the step that follows" in s6["help"]
    put(6, "Decide: Marketing wants to send the customer notice today", w=s6["w"][: -len(then6)],
        o="Decision T10.2-D4 checked; BRC-PLAN records it", help=help6,
        refs=refs(docs=[["BKB-POL-014", ["6.1"]]], arts=["BRC-PLAN"]))
    put(7, 'Submit BRC-ASSESS and BRC-PLAN. Click "Done".', t="Hand in BRC-ASSESS and BRC-PLAN",
        w="Check BRC-ASSESS and BRC-PLAN for empty cells, name the two files and submit them.", o="BRC-ASSESS and BRC-PLAN submitted with manifest")
    tool(7, "regwatch|Breach Clock Calculator")
    put(8, "Open T-LI-IRBC.", t="Read LI-IRBC's phase sheet",
        w="[LI-14 — Incident-management process and business continuity vs disaster recovery] LI-IRBC's Phases sheet (template T-LI-IRBC) gives the five phases of rule L20, the Annex A control of each and the part of BKB-POL-014 it covers. Answer each question by clicking the cell that answers it.",
        o="Three questions answered in LI-IRBC's Phases sheet",
        help="Every answer is in the sheet. A wrong click gives a hint. This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["L20"], tpls=["T-LI-IRBC"], arts=["LI-IRBC"]))
    assert steps[8]["w"].endswith("DECIDE (for each item): Map each event of the incident to its phase. Options: A) Plan  B) Detect and report  C) Assess and decide  D) Respond  E) Learn. Guidance: rule L20.")
    put(9, "Decide for each row: Map each event of the incident to its phase", t="Map each event of the incident to its phase (L20)",
        w="[LI-14 — Incident-management process and business continuity vs disaster recovery] Each row of LI-IRBC's Timeline is one event of INC-2610-3001, in UTC. Choose the phase of rule L20 each belongs to, by the part of BKB-POL-014 it carries out.",
        o="Every event's phase checked in LI-IRBC",
        help="The note above the table gives each phase and the part of BKB-POL-014 it covers; BKB-POL-014 (Policies › Policy Library) Section 6.1 says what each step of the response does, and Section 4 names the exercises that prepare for one. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["L20"], docs=[["BKB-POL-014", ["4", "6.1"]]], clauses=["A.5.24", "A.5.25", "A.5.26", "A.5.27", "A.5.28"], arts=["LI-IRBC"]))
    assert steps[9]["w"].endswith("Decide whether to invoke the BC plan and the DR plan. Options: A) Invoke  B) Do not invoke. Guidance: rule L20 (RTO).")
    put(10, "Decide for each row: Decide whether to invoke the BC plan and the DR plan", t="Decide whether to invoke the BC plan and the DR plan (L20)",
        w="[LI-14 — Incident-management process and business continuity vs disaster recovery] Apply the BC/DR part of rule L20 to INC-2610-3001: for each plan, Invoke or Do not invoke.",
        o="BC and DR decisions checked in LI-IRBC",
        help="Rule L20 is in the note above the table. The incident record (Regulatory Watch › Breach Clock Calculator) says which system was down and for how long; BKB-ADD-36 Sections 8 and 8.1 (Policies › Policy Library) say which assets are Mission Critical, and Section 8.2 gives each critical process's RTO. " + CHECK + " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable.",
        refs=refs(rules=["L20"], docs=[["BKB-ADD-36", ["8"]]], clauses=["A.5.29", "A.5.30"], arts=["LI-IRBC"]))
    tool(11, "regwatch|Breach Clock Calculator")
    put(11, 'Submit LI-IRBC. Click "Done".', t="Hand in LI-IRBC",
        w="[LI-14 — Incident-management process and business continuity vs disaster recovery] Check LI-IRBC for empty cells, name the file and submit it.", o="LI-IRBC submitted with manifest")

    # Text seen before step 6 stated D4's answer ("sent only after legal sign-off", "with the legal sign-off box ticked",
    # "legal sign-off kept before sending"). It now says what is done, not what comes out. The card's record line sent the
    # learner to T3.1's register, which is GlobalConnect's (Org A): LearnTech's clocks are BKB-ADD-36 Section 2's.
    swaps = [
        (" The notification plan is drafted by GRC and sent only after legal sign-off (BKB-POL-016 Section 3.1).",
         " GRC drafts the notification plan for the DPO (BKB-POL-014 Section 6.2)."),
        ("Draft a notification plan and breach-register entry with the legal sign-off box ticked — see T-BRC; BKB-POL-014 Section 7.1 first-hour checklist",
         "Draft a notification plan and breach-register entry — see T-BRC; BKB-POL-014 Section 6.1 and Section 7.1 first-hour checklist"),
        ("the clocks come from your Obligations Register (T3.1) and the data from your RoPA (T10.1)",
         "the clocks come from BKB-ADD-36 Section 2 and the facts from the incident record (BRC-FACTS)"),
    ]
    x = json.dumps(t, ensure_ascii=False)
    for a, b in swaps:
        assert desect(a) in desect(x) or a in x, a
        x = x.replace(a, b).replace(a.replace("Section ", "§"), b)
    t.clear()
    t.update(json.loads(x))
    if "T10.2" in w["cards"]:
        y = json.dumps(w["cards"]["T10.2"], ensure_ascii=False)
        for a, b in swaps:
            y = y.replace(a, b).replace(a.replace("Section ", "§"), b)
        w["cards"]["T10.2"] = json.loads(y)
    kr3 = "KR3 — Data-subject decision correct; legal sign-off kept before sending; BRC-ASSESS and BRC-PLAN submitted · Activities 5–7"
    assert t["krs"][2] == kr3, t["krs"]
    t["krs"][2] = "KR3 — Data-subject decision correct (R30); the notice question answered; BRC-ASSESS and BRC-PLAN submitted · Activities 5–7"
    tb = w["tpls"]["T-BRC"]
    assert tb[2] == "Regime rows with deadline (R30); plan template; breach-register entry; legal sign-off box", tb
    tb[2] = "Regime rows with deadline (R30); plan template; breach-register entry"
    # The platform-written sections, in the library's headings.
    for d in w["library"]["docs"]:
        secs = [s[0] for s in d[2]]
        if d[0] == "BKB-POL-014" and "6.3" not in secs:
            d[2].insert(secs.index("6.2") + 1, ["6.3", "Procedure: Which regimes apply, and their deadlines (rule R30)"])
        if d[0] == "BKB-ADD-36" and "8.2" not in secs:
            d[2].insert(secs.index("8.1") + 1, ["8.2", "Business impact analysis: critical processes of the Amsterdam office"])
    blob = json.dumps([t, w["notes"]["T10.2"], w["cards"].get("T10.2"), w["tp"]["regwatch|Breach Clock Calculator"], w["tpls"]["T-BRC"]], ensure_ascii=False)
    for bad in ("INC-2610-3748", "DECIDE (for each", "after you submit", "sign-off box", "Then do the step", "Then: Fill", "Obligations Register (T3.1)"):
        assert bad not in blob, f"T10.2 still says {bad!r}"
    # Nothing a learner reads before step 6, other than the question's own option, may name its answer.
    seen = json.dumps([t["card"], t["krs"], w["cards"].get("T10.2"), w["tpls"]["T-BRC"], screen] + [s["help"] for s in steps[:6]], ensure_ascii=False)
    assert "sign-off" not in seen and "sign off" not in seen.replace("General Counsel sign off", ""), "D4's answer is stated before it is asked"


def t111(w: dict) -> None:
    """T11.1 in the platform's own terms (desk-step-builder, 30 Oct 2026), keeping the pack's intent.

    The mentee's theme is "MFA fatigue and push-bombing" for Regional Compliance & Legal at Amsterdam (the task's own text).
    src/lib/desk/awr-t111.json (scratchpad build/T11.1/gen.py) holds the content bank row of the theme, R31's weeks, the
    Amsterdam register's KRIs (engine context.json), Ref-Clause map, Ref-Competence and Ref-Communications rows, and the
    platform-written parts (D1's card options, the role holders' records, each communication's programme event, the AWR-SIM
    fields). BKB-POL-020's text and BKB-ADD-36 Section 2.2 are platform-written. Step 1 lays out R31's weeks, 2 asks D1 (no
    part 2: AWR-LESSON records the card), 3 matches each quiz question to its behaviour, 4 asks D2 for Amsterdam (no part 2:
    AWR-SIM records the approvals), 5 asks D3 then the metric targets, 6 hands in; 7 reads Ref-Clause map (STUDY), 8 asks D4
    then each role holder's competence, 9 asks D5 then each communication's week, 10 hands in. Content Corrections item 72.
    """
    w["tasks"]["T11.1"] = t = json.loads(desect(json.dumps(w["tasks"]["T11.1"], ensure_ascii=False)))
    w["notes"]["T11.1"] = json.loads(desect(json.dumps(w["notes"]["T11.1"], ensure_ascii=False)))
    if "T11.1" in w["cards"]:
        w["cards"]["T11.1"] = json.loads(desect(json.dumps(w["cards"]["T11.1"], ensure_ascii=False)))
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T11.1"]}
    awr = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "awr-t111.json").read_text(encoding="utf8"))
    assert f'"{awr["theme"]}" for {awr["audience"]} at {awr["office"]}' in t["obj"], t["obj"]
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    LI15 = "[LI-15 — Competence, awareness and ISMS communication plan] "
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert s["t"].startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    opts = lambda o: "  ".join(f"{'ABC'[i]}) {x}" for i, x in enumerate(o))
    put(1, "Open the 4-week template (rule R31).", t="Lay out the four weeks of the campaign (R31)",
        w="AWR-PLAN, the campaign plan (template T-AWR), has one row for each of the campaign's four weeks. Choose each week's activity with rule R31 (Learn › Rule tables).",
        o="Activity of each week checked in AWR-PLAN",
        help="Rule R31 (Learn › Rule tables) sets what each week of the campaign carries, in order. " + CHECK,
        refs=refs(rules=["R31"], arts=["AWR-PLAN"]))
    # D1: the pack's options ("Card 1", "Card 2", "Card 3") name no card, and its key has no best. The options are three cards
    # of the content bank; no part 2: AWR-LESSON records the card and the theme's behaviours once the answer is checked.
    assert steps[1]["opt"] == ["Card 1", "Card 2", "Card 3"] and steps[1]["w"].endswith('Then: Open Ref-Content. Copy the scenario card and the 3 behaviours for "MFA fatigue and push-bombing".'), steps[1]
    put(2, "Decide: Which scenario card fits the theme", opt=awr["cards"],
        w=f'DECIDE: Which scenario card fits the theme "{awr["theme"]}"? Options: {opts(awr["cards"])}',
        o="Decision T11.1-D1 checked; AWR-LESSON records the card",
        help="A scripted question. Read the situation and the three options, and choose one; the content bank (Awareness › Content Templates) gives each theme's scenario card. When you click Check my answer you see the best option and why. AWR-LESSON then records the card and the theme's three behaviours.",
        refs=refs(arts=["AWR-LESSON"]))
    put(3, "Copy the 3 quiz questions for the theme.", t="Match each quiz question to the behaviour it checks",
        w="The micro-lesson and its newsletter post (Awareness › Newsletter Builder) end with the theme's three check questions from Ref-Content. For each question, choose the behaviour it checks: read its answer in Ref-Content (Learn › Reference pages).",
        o="Behaviour of each question checked in AWR-LESSON",
        help="Ref-Content (Learn › Reference pages) gives each question of your theme with its answer in brackets. The answers are written into AWR-LESSON for you. " + CHECK,
        refs=refs(pages=["Ref-Content"], arts=["AWR-LESSON"]))
    tool(3, "awareness|Newsletter Builder")
    # D2: the pack's question gave its premise ("The office has a works council"); the learner now reads it in BKB-ADD-36
    # Section 2.2 (platform-written). No part 2: copying the approvals list copies the answer; AWR-SIM records it.
    old4 = "DECIDE: The office has a works council. Who must approve the phishing simulation? Options: A) HR only  B) HR, Legal and the works council  C) IT. Then: Fill the simulation plan fields. Copy the approvals list with rule R31."
    assert steps[3]["w"] == old4, steps[3]["w"]
    put(4, "Decide: The office has a works council", t="Decide: Who must approve the phishing simulation for the Amsterdam office",
        w=f"DECIDE: Who must approve the phishing simulation for {awr['audience']} at the Amsterdam office? Options: {opts(steps[3]['opt'])}",
        o="Decision T11.1-D2 checked; AWR-SIM records the approvals",
        help="A scripted question. Read the situation and the three options, and choose one; rule R31 (Learn › Rule tables) says who approves a simulation, and BKB-ADD-36 Section 2.2 (Policies › Policy Library) lists each office's employee bodies. When you click Check my answer you see the best option and why. AWR-SIM then records the approvals.",
        refs=refs(rules=["R31"], docs=[["BKB-ADD-36", ["2.2"]]], arts=["AWR-SIM"]))
    tool(4, "learn|Rule tables")
    old5 = "Then: Copy the metrics and the formula."
    assert steps[4]["w"].endswith(old5), steps[4]["w"]
    put(5, "Decide: Which metric best shows staff are learning",
        w=steps[4]["w"].replace(old5, "Then: Write each metric's target in AWR-SIM, from the source that sets it."),
        o="Decision T11.1-D3 checked; metric targets checked in AWR-SIM",
        help="A scripted question first. When you click Check my answer you see the best option and why. Then, in the campaign's measures (Awareness › Campaign Results), write each metric's target: the click-rate target is the KRI of the office's phishing risk (Risk Register › Heat Map with KRIs), the report-rate target is in BKB-POL-020 Section 7.1 (Policies › Policy Library). The formulas are written for you. " + CHECK,
        refs=refs(docs=[["BKB-POL-020", ["7.1"]]], arts=["AWR-SIM"]))
    tool(5, "awareness|Campaign Results")
    put(6, 'Submit AWR-PLAN, AWR-LESSON and AWR-SIM. Click "Done".', t="Hand in AWR-PLAN, AWR-LESSON and AWR-SIM",
        w="Check AWR-PLAN, AWR-LESSON and AWR-SIM for empty cells, name the two files and submit them. AWR-SIM is a platform form: it has no file to name.",
        o="AWR-PLAN, AWR-LESSON, AWR-SIM submitted with manifest")
    tool(6, "awareness|Content Templates")
    put(7, "Open T-LI-COMM.", t="Read what LI-COMM must evidence (Ref-Clause map)",
        w=LI15 + "Before you fill LI-COMM (template T-LI-COMM), see which ISO/IEC 27001 clauses it evidences. The rows are Ref-Clause map's, for clauses 5.1 and 7.2 to 7.4. Answer each question by clicking the cell that answers it.",
        o="Three questions answered in Ref-Clause map's rows",
        help="Every answer is in the rows. A wrong click gives a hint." + LI,
        refs=refs(pages=["Ref-Clause map"], tpls=["T-LI-COMM"], arts=["LI-COMM"]))
    old8 = "Then: Apply rule L21 for the competence rows."
    assert steps[7]["w"].endswith(old8), steps[7]["w"]
    put(8, "Decide: Risk owners cannot rate risks consistently",
        w=steps[7]["w"].replace(old8, "Then: For each role holder, compare the record on file with the evidence Ref-Competence requires, and record whether competence is shown."),
        o="Decision T11.1-D4 checked; competence of each role holder checked in LI-COMM",
        help="A scripted question first. When you click Check my answer you see the best option and why. Then, in LI-COMM's competence sheet, rule L21's rows are copied from Ref-Competence for you: for each role holder, compare the Record on file with the Evidence retained, and choose. " + CHECK + LI,
        refs=refs(rules=["L21"], pages=["Ref-Competence"], arts=["LI-COMM"]))
    old9 = "Then: Apply rule L21 for the 6 communication rows."
    assert steps[8]["w"].endswith(old9), steps[8]["w"]
    put(9, "Decide: Who should announce the ISMS policy to all staff",
        w=steps[8]["w"].replace(old9, "Then: Date each of the six communications from the programme calendar (Home › Calendar), by the week of the event that triggers it."),
        o="Decision T11.1-D5 checked; the week of each communication checked in LI-COMM",
        help="A scripted question first. When you click Check my answer you see the best option and why. Then, in LI-COMM's communication plan, rule L21's six rows are copied from Ref-Communications for you: for each, find the week of its programme event in Home › Calendar, and choose it. " + CHECK + LI,
        refs=refs(rules=["L21"], pages=["Ref-Communications"], arts=["LI-COMM"]))
    put(10, 'Submit LI-COMM. Click "Done".', t="Hand in LI-COMM",
        w=LI15 + "Check LI-COMM's two sheets for empty cells, name the file and submit it.", o="LI-COMM submitted with manifest")
    tool(10, "awareness|Content Templates")

    # Text seen before steps 4 and 5 stated their answers: the card's approvals ("HR, Legal, works council where the office has
    # one"; "the approvals the law and HR require"; "without legal/HR approval") and KR3's targets ("click ≤ 5 %, report ≥ 60 %").
    # The builds line sent the learner to T7.1's register, which is GlobalConnect's (Manila): the KRI is RA-36 Amsterdam's.
    swaps = [
        ("List the approvals a simulation needs — HR, Legal, works council where the office has one — see Rule R31; addendum Section 2",
         "List the approvals a simulation needs in the office it runs in — see Rule R31; addendum Section 2.2"),
        ("a fair phishing simulation with the approvals the law and HR require", "a fair phishing simulation with the approvals it needs"),
        ("a simulation without legal/HR approval is itself a finding", "a simulation run without the approvals rule R31 requires is itself a finding"),
        ("KR3 — Metrics copied (click ≤ 5 %, report ≥ 60 %, formula); AWR-PLAN, AWR-LESSON and AWR-SIM submitted · Activities 5–6",
         "KR3 — Metric targets read from their sources, with the formula; AWR-PLAN, AWR-LESSON and AWR-SIM submitted · Activities 5–6"),
        ("Platform: Awareness › Content Templates, Phishing Campaign Planner.", "Platform: Awareness › Content Templates, Newsletter Builder, Campaign Results."),
        ("The phishing/BEC risk and its KRI set the targets of the awareness campaign.",
         "In T7.1 you read a risk's KRI; here the Amsterdam register's phishing KRI (RA-36, Risk Register › Heat Map with KRIs) sets the click-rate target."),
    ]
    x = json.dumps(t, ensure_ascii=False)
    for a, b in swaps:
        assert a in x, a
        x = x.replace(a, b)
    w["tasks"]["T11.1"] = t = json.loads(x)
    steps = t["steps"]
    if "T11.1" in w["cards"]:
        y = json.dumps(w["cards"]["T11.1"], ensure_ascii=False)
        for a, b in swaps:
            y = y.replace(a, b)
        w["cards"]["T11.1"] = json.loads(y)
    # Awareness › Phishing Campaign Planner (T11.1's alone) said "Phishing launches need Programme Office and HR/Communications
    # approval", which contradicts rule R31 and answered D2 wrongly before it was asked.
    pl = w["tp"]["awareness|Phishing Campaign Planner"]
    assert pl["pl"]["note"] == "Phishing launches need Programme Office and HR/Communications approval." and pl["pl"]["f"][0] == ["Audience", "Department assigned on your task page"], pl
    pl["pl"]["f"][0] = ["Audience", f"{awr['audience']}, {awr['office'].split(',')[0]} office"]
    pl["pl"]["note"] = "Who approves a launch: rule R31 (Learn › Rule tables), with the office's row of the organisation addendum, Section 2.2."
    # The same line is the Awareness section's guard, shown on every Awareness screen (T11.1's alone).
    assert w["guard"]["awareness"] == "Phishing launches need Programme Office and HR/Communications approval.", w["guard"]["awareness"]
    w["guard"]["awareness"] = "A phishing simulation is launched only once the approvals rule R31 requires for the office are on file."
    # The two screens' window titles named them otherwise than the toolbar ("Content bank", "Phishing simulation plan").
    ct = w["tp"]["awareness|Content Templates"]
    assert ct["tool"] == t["panel"]["tool"] == "Awareness › Content bank" and pl["tool"] == "Awareness › Phishing simulation plan", (ct["tool"], pl["tool"])
    ct["tool"] = t["panel"]["tool"] = "Awareness › Content Templates"
    ct["stamp"] = t["panel"]["stamp"] = "Content bank · 10 themes"
    pl["tool"] = "Awareness › Phishing Campaign Planner"
    # Step 3 is done in Newsletter Builder (the post's quiz) and step 5 in Campaign Results (the campaign's measures).
    nb, cr = w["tp"]["awareness|Newsletter Builder"], w["tp"]["awareness|Campaign Results"]
    assert nb["tool"] == "Awareness › Newsletter post" and cr["tool"] == "Awareness › Campaign results" and cr["pl"]["k"][0] == ["Click rate", "—", "after launch"], (nb, cr)
    nb["tool"], cr["tool"] = "Awareness › Newsletter Builder", "Awareness › Campaign Results"
    cr["pl"]["k"][0] = ["Click rate", "—", "target: the office register's KRI"]
    t["meta"]["tool"] = "Awareness › Content Templates, Newsletter Builder, Campaign Results"
    rows = [d for d in w["deliverables"] if d[0] == "T11.1"]
    assert len(rows) == 4 and all(d[5] == "Awareness › Content Templates, Phishing Campaign Planner" for d in rows), rows
    for d in rows:
        d[5] = t["meta"]["tool"]
    # The Amsterdam office register's KRIs (RA-36), for step 5: the shared screen is GlobalConnect's Manila heat map.
    assert w["tp"]["risk|Heat Map with KRIs"]["kind"] == "bars", "the shared Heat Map screen changed"
    w["tp"]["risk|Heat Map with KRIs#T11.1"] = {"tool": "Risk Register › Heat Map with KRIs", "stamp": f"Amsterdam · {len(awr['kri'])} risks", "kind": "table",
        "pl": {"h": ["Risk ID", "Risk title", "Residual", "Risk owner", "KRI (target)"], "r": awr["kri"],
               "note": "LearnTech Educational Solutions, Amsterdam office register (RA-36): each risk with the key risk indicator that tracks it, and its target."}}
    for d in w["library"]["docs"]:
        secs = [s[0] for s in d[2]]
        if d[0] == "BKB-ADD-36" and "2.2" not in secs:
            d[2].insert(secs.index("2.1") + 1, ["2.2", "Employee representation by office"])
    blob = json.dumps([t, w["notes"]["T11.1"], w["cards"].get("T11.1"), pl, w["guard"]], ensure_ascii=False)
    for bad in ("DECIDE (for each", "after you submit", "Then do the step", "Card 1", "Copy the approvals", "Programme Office and HR", "Copy the metrics", "Apply rule L21"):
        assert bad not in blob, f"T11.1 still says {bad!r}"
    # Nothing read before steps 4 and 5 may name their answers: the approvals, and the targets.
    seen = json.dumps([t["card"], t["krs"], w["cards"].get("T11.1"), w["tpls"]["T-AWR"], pl] + [s["help"] for s in steps[:5]], ensure_ascii=False)
    assert "works council" not in seen and "≤ 5" not in seen and "≥ 60" not in seen, "an answer is stated before it is asked"


def t112(w: dict) -> None:
    """T11.2 in the platform's own terms (desk-step-builder, 30 Oct 2026), keeping the pack's intent.

    The mentee's topic is "EU Digital Services Act guidelines on the protection of minors online (2025)" for LearnTech (the
    task's own text). src/lib/desk/reg-t112.json (scratchpad build/T11.2/gen.py) holds the tracker's entries, the monitoring
    results, the two official sources (saved copies in public/desk/docs/SRC-*.md), REG-EXTRA, the duties, the affected systems and
    the LearnTech Technology_Stack. Step 1 checks the Regulation Tracker against BKB-ADD-36 Section 2; 2 asks D1, then sorts the
    monitoring results (Add Update); 3 logs the sources' dates; 4 asks D2, then sorts source 1's key points into duties and
    background; 5 does the same for the Regulation's articles; 6 decides applicability office by office (BKB-POL-016 Section
    7.2, written); 7 maps each duty to its policy (Impact Log, Ref-Keywords); 8 asks D5, then each action's owner; 9 hands in;
    10-13 (LI-16) the topic type, ISMS elements, layers and new-technology note, in the Impact Log; 14 hands in. Content
    Corrections item 73.
    """
    w["tasks"]["T11.2"] = t = json.loads(desect(json.dumps(w["tasks"]["T11.2"], ensure_ascii=False)))
    w["notes"]["T11.2"] = json.loads(desect(json.dumps(w["notes"]["T11.2"], ensure_ascii=False)))
    if "T11.2" in w["cards"]:
        w["cards"]["T11.2"] = json.loads(desect(json.dumps(w["cards"]["T11.2"], ensure_ascii=False)))
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T11.2"]}
    reg = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "reg-t112.json").read_text(encoding="utf8"))
    assert f'"{reg["topic"]}"' in t["obj"], t["obj"]
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    LI16 = "[LI-16 — Planning changes to the ISMS, new technology and architecture impact] "
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert s["t"].startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    put(1, "Open BKB-ADD-36 Section 2. Find the authority for each office.", t="Check the Regulation Tracker's authority for each LearnTech office",
        w="Before a brief names who supervises an office, the tracker is checked against the addendum. For each of LearnTech's four offices, compare the authority on Regulatory Watch › Regulation Tracker with the Authority column of BKB-ADD-36 Section 2 (Policies › Policy Library).",
        o="Each office's tracker entry checked against BKB-ADD-36 Section 2",
        help="The tracker is a copy; the addendum is the source. Read each office's row of BKB-ADD-36 Section 2, in its Authority column. " + CHECK,
        refs=refs(docs=[["BKB-ADD-36", ["2"]]]))
    tool(1, "regwatch|Regulation Tracker")
    # D1: the question stays; its part 2 ("Open the official website … Type the topic title in the site search") sent the
    # learner to the live web, which the platform's rules forbid (item 11). The month's monitoring results are on Regulatory
    # Watch › Add Update, and part 2 sorts them: official source or not.
    old2 = 'Then: Open the official website of the authority for the country named in "EU Digital Services Act guidelines on the protection of minors online (2025)". Type the topic title in the site search.'
    assert steps[1]["w"].endswith(old2), steps[1]["w"]
    put(2, "Decide: Which is an official source",
        w=steps[1]["w"].replace(old2, "Then: Sort this month's monitoring results for the topic, on Regulatory Watch › Add Update: official source or not."),
        o="Decision T11.2-D1 checked; each monitoring result sorted",
        help="A scripted question first. When you click Check my answer you see the best option and why. Then, on Regulatory Watch › Add Update, this month's monitoring results for your topic: decide for each whether it is an official source. " + CHECK)
    tool(2, "regwatch|Add Update")
    put(3, "Open the first official document with that title", t="Log the two official sources and their dates",
        w="Log the change on Regulatory Watch › Add Update from its two official sources. Their titles and web addresses are written for you from the monitoring results. For each source, read in its saved copy (Policies › Policy Library) the date it was published and the date its duties apply from, and write today's date as the date you read it.",
        o="Publication, application and access dates of both sources recorded",
        help="Each saved copy's Section 1 says where and when the source was published. The date a source's duties apply from is not always the date it was published: read the source's own line on it (for source 2, its Article 93). Type a date as 1 March 2024 or 2024-03-01.",
        refs=refs(docs=[["SRC-EC-MINORS-2025", ["1"]], ["SRC-EU-2022-2065", ["1", "4"]]]))
    tool(3, "regwatch|Add Update")
    old4 = "Then: Copy the list of obligations shown in the official summary or table of contents (maximum 8)."
    assert steps[3]["w"].endswith(old4), steps[3]["w"]
    put(4, "Decide: The document has 40 pages",
        w=steps[3]["w"].replace(old4, "Then: For each of source 1's key points, decide whether it is a duty or background."),
        o="Decision T11.2-D2 checked; each of source 1's key points sorted",
        help="A scripted question first. When you click Check my answer you see the best option and why. Then, in REG-BRIEF (Regulatory Watch › Briefing Builder), source 1's ten key points, from Section 2 of its saved copy (Policies › Policy Library): decide for each whether it is a duty or background. " + CHECK,
        refs=refs(docs=[["SRC-EC-MINORS-2025", ["2"]]], arts=["REG-BRIEF"]))
    tool(4, "regwatch|Briefing Builder")
    put(5, "Repeat steps 2–4 for the official journal", t="Find the duties in source 2, the Regulation's own text",
        w="Repeat step 4 for source 2: Articles 19 and 28 of Regulation (EU) 2022/2065, in its saved copy (Policies › Policy Library). For each paragraph, decide whether it is a duty or background.",
        o="Each paragraph of source 2 sorted: duty or background",
        help="A duty binds the provider. A paragraph can say “shall” and still bind no one: read what it asks, and of whom. " + CHECK,
        refs=refs(docs=[["SRC-EU-2022-2065", ["2", "3"]]], arts=["REG-BRIEF"]))
    tool(5, "regwatch|Briefing Builder")
    put(6, "Decide for each row: For each office, decide Applies or Does not apply", t="Decide where the guidelines apply, office by office",
        w="For each LearnTech office, decide whether the guidelines apply to it. Use the three tests of BKB-POL-016 Section 7.2 (Policies › Policy Library) on what the office runs (REG-EXTRA, in the table) and on whom source 1 covers (its key point 2).",
        o="Applicability of each office checked in REG-BRIEF",
        help="Rule R02 reads an office's row of BKB-ADD-36 Section 2; the guidelines are not in the addendum yet, so BKB-POL-016 Section 7.2 sets the tests. A colleague's question on the threshold is in the Inbox. " + CHECK,
        refs=refs(rules=["R02"], docs=[["BKB-POL-016", ["7.2"]], ["BKB-ADD-36", ["2"]], ["SRC-EC-MINORS-2025", ["2"]]], arts=["REG-BRIEF"]))
    tool(6, "regwatch|Briefing Builder")
    put(7, "Decide for each row: Choose the affected BKB policies from the shortlist", t="Map each duty to the BKB policy that must carry it",
        w="In the Impact Log, map each of the eight duties of steps 4 and 5 to the BKB policy whose key words it uses (rule R32, Ref-Keywords in Learn › Reference pages). A duty that uses none of the key words is a gap.",
        o="Policy of each duty checked in the Impact Log",
        help="Ref-Keywords lists key words, the BKB policy they point to and its Annex A controls. A key word counts when the duty uses that word, or its plural. " + CHECK,
        refs=refs(rules=["R32"], pages=["Ref-Keywords"], arts=["REG-BRIEF"]))
    tool(7, "regwatch|Impact Log")
    # D5's part 2 carried its own answer ("date = publication + 30 days"). The learner chooses each action's owner (BKB-POL-000
    # Sections 3 and 7); the date, the same on every row, is written by the platform from source 1's publication date (R32).
    old8 = 'Then: Write the actions using the frame "<Owner> updates <policy> by <date>" (date = publication + 30 days).'
    assert steps[7]["w"].endswith(old8), steps[7]["w"]
    put(8, "Decide: The rule was published on 1 October",
        w=steps[7]["w"].replace(old8, "Then: For each affected policy, choose who owns its action, written in the frame “<Owner> updates <policy> by <date>”."),
        o="Decision T11.2-D5 checked; the owner of each action checked in REG-BRIEF",
        help="A scripted question first: BKB-POL-016 (Policies › Policy Library) sets the deadline. When you click Check my answer you see the best option and why. Then, in REG-BRIEF's actions (Regulatory Watch › Briefing Builder), choose each action's owner: BKB-POL-000 Section 3 names each policy's owner, and Section 7 who drafts a new statement. The action and its date are written for you. " + CHECK,
        refs=refs(docs=[["BKB-POL-000", ["3", "7"]]], arts=["REG-BRIEF"]))
    tool(8, "regwatch|Briefing Builder")
    put(9, 'Submit REG-BRIEF. Click "Done".', t="Hand in REG-BRIEF",
        w="Check REG-BRIEF's six sheets for empty cells, name the file and submit it.", o="REG-BRIEF submitted with manifest")
    tool(9, "regwatch|Briefing Builder")
    put(10, "Open T-LI-CHG.", t="Choose the change's topic type (Ref-Change types)",
        w=LI16 + "LI-CHG, the ISMS change impact note (template T-LI-CHG), starts from the type of the change: it decides what the change touches. Choose the topic type Ref-Change types (Learn › Reference pages) gives the guidelines.",
        o="Topic type checked in LI-CHG",
        help="Ref-Change types' first five rows are the topic types. A change takes the type of the law it comes from: read source 2's title, in Section 1 of its saved copy (Policies › Policy Library). " + CHECK + LI,
        refs=refs(pages=["Ref-Change types"], docs=[["SRC-EU-2022-2065", ["1"]]], tpls=["T-LI-CHG"], arts=["LI-CHG"]))
    tool(10, "regwatch|Impact Log")
    put(11, "Decide for each row: Tick the ISMS elements the change affects", t="Mark the ISMS elements the change affects (L22)",
        w=LI16 + "For each of the six ISMS elements, mark whether the change affects it: rule L22, with the row of Ref-Change types for the topic type of step 10.",
        o="Each ISMS element checked in LI-CHG",
        help="The topic type checked in step 10 is named above the table. Its row of Ref-Change types (Learn › Reference pages) lists the elements to tick. " + CHECK + LI,
        refs=refs(rules=["L22"], pages=["Ref-Change types"], arts=["LI-CHG"]))
    tool(11, "regwatch|Impact Log")
    put(12, "Decide for each row: For each affected system, choose its architecture layer", t="Place each affected system on its architecture layer (L22)",
        w=LI16 + "Five LearnTech systems carry the new duties. For each, find its Domain in TSA-36 Technology_Stack (Learn › Reference pages), then the layer BKB-TECH-000 Section 3 (Policies › Policy Library) places that Domain on.",
        o="Layer of each affected system checked in LI-CHG",
        help="Rule L22: a system's layer comes from its Domain column. " + CHECK + LI,
        refs=refs(rules=["L22"], pages=["TSA-36 Technology_Stack"], docs=[["BKB-TECH-000", ["3"]]], arts=["LI-CHG"]))
    tool(12, "regwatch|Impact Log")
    put(13, "Copy the new-technology note", t="Record the new-technology note for the topic type",
        w=LI16 + "LI-CHG records the new-technology note Ref-Change types (Learn › Reference pages) lists for the topic type of step 10. Choose it.",
        o="New-technology note checked in LI-CHG",
        help="The note is in the topic type's row of Ref-Change types, its last column. " + CHECK + LI,
        refs=refs(pages=["Ref-Change types"], arts=["LI-CHG"]))
    tool(13, "regwatch|Impact Log")
    put(14, 'Submit LI-CHG. Click "Done".', t="Hand in LI-CHG",
        w=LI16 + "Check LI-CHG's four sheets for empty cells, name the file and submit it.", o="LI-CHG submitted with manifest")
    tool(14, "regwatch|Impact Log")
    # The per-row steps choose from their tables' own options (the pack's "Shortlist from Ref-Keywords" named none; step 11 listed
    # the elements as its options, which are its rows).
    for n, o in ((6, reg["appOpts"]), (7, reg["policies"]), (11, reg["elemOpts"]), (12, reg["layers"])):
        steps[n - 1]["opt"] = o

    # Text seen before steps 2, 4 and 8 stated their answers: "primary sources (regulator, official journal)" (D1), "their
    # shall/must duties" and the brief's "___ shall ___" line (D2), "30 days from publication" and "publication + 30 days" (D5).
    # The card cited a message the task does not have (T11.2-J1). Where to add now names the screens the steps use.
    swaps = [
        ("Find and cite primary sources (regulator, official journal) with access dates — see Rule R32;", "Find and cite the official sources of a change, with access dates — see Rule R32;"),
        ("Map a change to affected BKB policies and set actions within the 30-day window — see Rule R32;", "Map a change to affected BKB policies and set actions within BKB-POL-016's window — see Rule R32;"),
        ("BKB-POL-016 Section 6.1 gives the team 30 days from publication to assess the impact of a change:", "BKB-POL-016 gives the team a fixed time from publication to assess the impact of a change:"),
        ("KR1 — Two official sources with address, publication, effective and access dates, and their shall/must duties · Activities 1–5",
         "KR1 — Two official sources with address, publication, application and access dates, and the obligations each sets · Activities 1–5"),
        ("KR3 — Impact-assessment date = publication + 30 days; REG-BRIEF submitted · Activities 8–9", "KR3 — Impact-assessment date as BKB-POL-016 sets it; REG-BRIEF submitted · Activities 8–9"),
        ("BKB-POL-016 — Section 3.1 (monthly monitoring, 30-day impact assessment); Section 6.1 Procedure: Regulatory change management",
         "BKB-POL-016 — Section 3.1 (monitoring and impact assessment); Section 6.1 Procedure: Regulatory change management; Section 7.2 Applicability"),
        ("A news article is not a rule (inject T11.2-J1) — act on official text, track early signals. ", ""),
        ("Platform: Regulatory Watch › Briefing Builder, Impact Log.", "Platform: Regulatory Watch › Regulation Tracker, Add Update, Briefing Builder, Impact Log."),
        ("<b>What we must do</b> ___ shall ___ within ___.", "<b>What we must do</b> ___ (from the official sources)"),
    ]
    x = json.dumps(t, ensure_ascii=False)
    for a, b in swaps:
        assert a in x, a
        x = x.replace(a, b)
    w["tasks"]["T11.2"] = t = json.loads(x)
    steps = t["steps"]
    if "T11.2" in w["cards"]:
        y = json.dumps(w["cards"]["T11.2"], ensure_ascii=False)
        for a, b in swaps:
            y = y.replace(a, b)
        w["cards"]["T11.2"] = json.loads(y)
    bb = w["tp"]["regwatch|Briefing Builder"]["pl"]["p"]
    assert swaps[-1][0] in bb, bb
    bb[bb.index(swaps[-1][0])] = swaps[-1][1]
    tools = "Regulatory Watch › Regulation Tracker, Add Update, Briefing Builder, Impact Log"
    assert t["meta"]["tool"] == "Regulatory Watch › Briefing Builder, Impact Log", t["meta"]["tool"]
    t["meta"]["tool"] = tools
    rows = [d for d in w["deliverables"] if d[0] == "T11.2"]
    assert len(rows) == 2 and all(d[5] == "Regulatory Watch › Briefing Builder, Impact Log" for d in rows), rows
    for d in rows:
        d[5] = tools

    # The task's screens in the mentee's variant: the tracker's LearnTech rows (two entries wrong, as trackers drift), and this
    # month's monitoring results for the mentee's topic on Add Update.
    trk = w["tp"]["regwatch|Regulation Tracker"]
    assert desect(trk["pl"]["note"]) == "Confirm every regulator in addendum Section 2 before you copy it. Legal interpretations go to the DPO.", trk
    w["tp"]["regwatch|Regulation Tracker#T11.2"] = {"tool": "Regulatory Watch › Regulation Tracker", "stamp": "LearnTech · 4 offices", "kind": "table",
        "pl": {"h": ["Office", "Authority"], "r": reg["tracker"], "note": desect(trk["pl"]["note"])}}
    au = w["tp"]["regwatch|Add Update"]
    assert au["pl"]["f"][0] == ["Source", "Official regulator website only"], au
    w["tp"]["regwatch|Add Update#T11.2"] = {"tool": "Regulatory Watch › Add Update", "stamp": f"Monitoring results · {len(reg['feed'])}", "kind": "table",
        "pl": {"h": ["Publisher", "Title", "Web address", "Date"], "r": reg["feed"],
               "note": f"This month's monitoring results for “{reg['topic']}” (BKB-POL-016 Section 3.1). A change is logged with its sources: the publisher, title and web address, the date published, the date its duties apply from, and the date you read it."}}

    # Each Regulatory Watch screen the task uses is titled as the toolbar names it (the pack's "Reg Watch › Regulators", "… ›
    # Regulatory brief (REG-BRIEF)", "… › Impact log").
    for k, old in (("Regulation Tracker", "Reg Watch › Regulators"), ("Add Update", "Reg Watch › Add Update"), ("Briefing Builder", "Reg Watch › Regulatory brief (REG-BRIEF)"), ("Impact Log", "Reg Watch › Impact log")):
        assert w["tp"][f"regwatch|{k}"]["tool"] == old, (k, w["tp"][f"regwatch|{k}"]["tool"])
        w["tp"][f"regwatch|{k}"]["tool"] = f"Regulatory Watch › {k}"
    assert t["panel"]["tool"] == "Reg Watch › Regulatory brief (REG-BRIEF)", t["panel"]["tool"]
    t["panel"]["tool"] = "Regulatory Watch › Briefing Builder"
    # Injects. J2 (pack: "applies only to organisations with more than 250 staff; New York has 120") states a threshold the DSA
    # does not have; the DSA's is Article 19's micro and small enterprises, measured on the enterprise. J3 named a file of New
    # York's processes; REG-EXTRA now gives every office's, and they are in step 6's table. Senders speak as their GRC Office role.
    j2, j3 = w["inj"]["T11.2-J2"], w["inj"]["T11.2-J3"]
    assert j2["notice"] == "The rule applies only to organisations with more than 250 staff. New York, United States has 120. Applies?", j2
    assert j3["notice"] == 'The file "REG-EXTRA" in 01_Inputs lists the processes of New York, United States.', j3
    j2.update(sender="Compliance Manager", ref="BKB-POL-016 Section 7.2",
              notice="Before you set applicability, a quick one. Article 19 of the DSA keeps micro and small enterprises out of Article 28: fewer than 50 staff, and a turnover or balance sheet of no more than EUR 10 million. Our Amsterdam office has 46 staff. Does Article 28 apply to Amsterdam?",
              options=["Does not apply: Amsterdam has fewer than 50 staff. Record the threshold.", "Applies: the threshold is LearnTech's size, not one office's. Record the threshold.", "Applies only if the Group decides to apply it."])
    j3.update(sender="Policy & Governance Analyst", ref="BKB-POL-016 Section 7.2",
              notice="I have put REG-EXTRA in your 01_Inputs folder: what each LearnTech office runs for learners, and LearnTech's headcount and turnover. Its lines are in the applicability table of your step 6.",
              steps=["Read each office's line in step 6's table.", "Decide, office by office, whether the guidelines apply."])
    # Learn › Reference pages: LearnTech's Technology_Stack (step 12), from the engine's TSA-36.
    w["pages"]["TSA-36 Technology_Stack"] = {"h": ["Cap ID", "Domain", "Capability", "Target solution", "System owner"], "r": reg["tsa"], "n": len(reg["tsa"])}
    # Policies › Policy Library: the two saved official sources, and BKB-POL-016's new Section 7.2.
    lib = w["library"]["docs"]
    if not any(d[0] == "SRC-EC-MINORS-2025" for d in lib):
        lib += [["SRC-EC-MINORS-2025", "European Commission: guidelines on the protection of minors (saved copy of the official page)", [["1", "Source"], ["2", "Key points"]], {}],
                ["SRC-EU-2022-2065", "Regulation (EU) 2022/2065, Digital Services Act: Articles 19, 28 and 93 (saved copy from EUR-Lex)",
                 [["1", "Source"], ["2", "Article 19 — Exclusion for micro and small enterprises"], ["3", "Article 28 — Online protection of minors"], ["4", "Article 93 — Entry into force and application"]], {}]]
    for d in lib:
        secs = [s[0] for s in d[2]]
        if d[0] == "BKB-POL-016" and "7.2" not in secs:
            d[2].insert(secs.index("7.1") + 1, ["7.2", "Guideline: Applicability of a regulatory change"])

    blob = json.dumps([t, w["notes"]["T11.2"], w["cards"].get("T11.2"), w["inj"]["T11.2-J2"], w["inj"]["T11.2-J3"]], ensure_ascii=False)
    for bad in ("DECIDE (for each", "after you submit", "Then do the step", "site search", "Shortlist from Ref-Keywords", "T11.2-J1", "Programme office"):
        assert bad not in blob, f"T11.2 still says {bad!r}"
    # Nothing read before a decision may name its answer: D1 (step 2), D2 (step 4), D5 (step 8).
    seen = lambda k: json.dumps([t["card"], t["krs"], w["cards"].get("T11.2"), t["panel"], bb, w["tpls"]["T-REG"], w["tp"]["regwatch|Add Update#T11.2"]] + [s["help"] for s in steps[:k - 1]] + [s["w"] for s in steps[:k - 1]], ensure_ascii=False)
    assert not re.search(r"primary source|regulator's website", seen(2)), "D1 is answered before it is asked"
    assert "shall" not in seen(4).replace("“shall”", ""), "D2 is answered before it is asked"
    assert not re.search(r"30 days|\+ 30|30-day|31 October", seen(8)), "D5 is answered before it is asked"


def t121(w: dict) -> None:
    """T12.1 in the platform's own terms (desk-step-builder, 30 Oct 2026), keeping the pack's intent.

    src/lib/desk/act-t121.json (scratchpad build/T12.1/gen.py) holds the mentee's ACT-TRACKER (the pack's 19 actions) with
    ACT-EXTRA's three (A-20 to A-22, from the mentee's own T6.1, T8.1 and T8.2 findings), the tracker's read-me, the review records
    as of the test date and LI-17's inputs. Step 1 reads the tracker (STUDY); 2 runs R33's closure tests on each action reported
    Closed; 3 records each reopened action's code; 4 escalation; 5 days past due (next check written); 6 what each owner must send;
    7 reads ACT-MRI's counts (STUDY); 8 D4 (no part 2); 9 D5, then the repeat issues; 10 hands in; 11 D6 (no part 2: LI-MR's audit
    programme is written by the platform); 12 the 9.3.2 inputs; 13 the objectives; 14 Stage 1 readiness (L24); 15 hands in.
    Content Corrections item 74.
    """
    w["tasks"]["T12.1"] = t = json.loads(desect(json.dumps(w["tasks"]["T12.1"], ensure_ascii=False)))
    w["notes"]["T12.1"] = json.loads(desect(json.dumps(w["notes"]["T12.1"], ensure_ascii=False)))
    if "T12.1" in w["cards"]:
        w["cards"]["T12.1"] = json.loads(desect(json.dumps(w["cards"]["T12.1"], ensure_ascii=False)))
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T12.1"]}
    act = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "act-t121.json").read_text(encoding="utf8"))
    assert [r[:11] for r in act["tracker"][:19]] == w["ds"]["ACT-TRACKER"]["r"], "ACT-TRACKER changed in the pack"
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    LI17 = "[LI-17 — Internal audit programme, management review pack and certification readiness] "
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert s["t"].startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    put(1, "Open ACT-TRACKER. Use only this dataset.", t="Read the tracker before testing it",
        w="Before any closure is tested, read what each column of ACT-TRACKER records: template T-ACT's read-me says. Answer its three questions by clicking the cell that answers each. The tracker itself is on Risk Register › Mitigation Tracker.",
        o="Three questions answered from the tracker's read-me",
        help="At work, a tracker is read column by column before it is tested, so each closure test reads the right cell. Use only this dataset: ACT-TRACKER, 22 actions, three of them from ACT-EXTRA (Inbox).",
        refs=refs(ds=["ACT-TRACKER"], rules=["R33"]))
    put(2, "Decide for each row: For each action marked Closed", t="Run the four closure tests on each action reported Closed",
        w="For each action its owner reports Closed, run rule R33's four closure tests in order: evidence attached, dated after raising, a system record, re-test passed. Record Pass if all four pass, Fail at the first that fails.",
        o="Closure tests checked for every action reported Closed",
        help="Rule R33 (Learn › Rule tables): an action is verified only if all four tests pass. Read each test against the action's own cells; an empty cell is no evidence. " + CHECK,
        refs=refs(rules=["R33"]))
    put(3, "Decide for each row: For each action, decide the verified status", t="Record the reason code of each reopened action",
        w="Each action that failed a closure test is Open again. Record its status with the code of the test that failed: rule R33's codes K1 to K4.",
        o="Status and reason code checked for each reopened action",
        help="R33 (Learn › Rule tables) gives each test a code: K1 evidence attached, K2 dated after raising, K3 a system record, K4 re-test passed. Its tests are read in that order. " + CHECK,
        refs=refs(rules=["R33"]))
    put(4, "Decide for each row: For each open action, decide: escalate or not", t="Decide which open actions to escalate",
        w="For each open action, decide whether it goes to its owner's manager: rule R33, more than 14 days past its due date at the test date, 23 December 2026, and not escalated yet.",
        o="Escalation checked for every open action",
        help="Count the days from each action's Due date to 23 December 2026. Its Escalated column says whether it has gone up already. " + CHECK,
        refs=refs(rules=["R33"]))
    put(5, "Write the next check date", t="Record how many days each open action is past due",
        w="For each open action, type how many days past its due date it is at the test date, 23 December 2026: 0 where the due date has not passed. Its next check date, the test date + 14 days (rule R33), is written for you.",
        o="Days past due checked for every open action; next check dates set",
        help="Count calendar days from the Due date to 23 December 2026. " + CHECK, refs=refs(rules=["R33"]))
    put(6, "Repeat steps 2–5 for every action.", t="Tell each owner what closes a reopened action",
        w="Each reopened action goes back to its owner with what will close it. For each, choose what the owner must send, by the test it failed. The request is written for you in the Evidence request frame of Learn & Grow › Sentence frames, due by the next check date.",
        o="What each reopened action needs checked; requests to owners written",
        help="The test an action failed, and its code (step 3), say what is missing. " + CHECK, refs=refs(rules=["R33"]))
    put(7, 'Open the management-review input template. Click "Refresh counts".', t="Read the refreshed counts on the review input",
        w="ACT-MRI, the management-review input page, counts the tracker from your checked steps 2 to 5. Answer its three questions by clicking the count that answers each.",
        o="Three questions answered from ACT-MRI's counts",
        help="At work, the counts are what top management reads first, so the analyst checks each one says what the review needs to know.")
    old8 = " Then: List the overdue actions with owner and days overdue."
    assert steps[7]["w"].endswith(old8), steps[7]["w"]
    put(8, "Decide: An owner says an overdue action", w=steps[7]["w"][: -len(old8)], o="Decision T12.1-D4 checked",
        help="At work, the review input goes to the people who decide on resources, and owners sometimes ask for a line to be softened. A scripted question: read the situation and the three options, and choose one. When you click Check my answer you see the best option and why. ACT-MRI is completed from your checked steps.")
    old9q = 'DECIDE: The same issue ("leaver account still active") appears in three actions. What does this show?'
    old9 = " Then: Mark repeat issues (the same issue in two or more actions)."
    assert steps[8]["w"].startswith(old9q) and steps[8]["w"].endswith(old9), steps[8]["w"]
    put(9, "Decide: The same issue", t="Decide: The same issue appears in several actions",
        w=steps[8]["w"].replace(old9q, "DECIDE: The same issue appears in several actions. What does this show?").replace(old9, " Then: In ACT-UPD, mark each action whose issue is on another action too."),
        o="Decision T12.1-D5 checked; each action marked in ACT-UPD",
        help="At work, the tracker is read for patterns before it goes to the review. A scripted question first. When you click Check my answer you see the best option and why. Then, in ACT-UPD (Risk Register › Mitigation Tracker), mark each action whose issue is on two or more actions. " + CHECK)
    put(10, 'Submit ACT-UPD and ACT-MRI. Click "Done".', t="Hand in ACT-UPD and ACT-MRI",
        w="Check ACT-UPD's and ACT-MRI's sheets for empty cells, name the files and submit them.", o="ACT-UPD, ACT-MRI submitted with manifest")
    old11 = ' Then: Open T-LI-MR, sheet "Audit programme". Apply rule L23.'
    assert steps[10]["w"].endswith(old11), steps[10]["w"]
    put(11, "Decide: Who should audit the access-control process", w=steps[10]["w"][: -len(old11)], o="Decision T12.1-D6 checked",
        help="At work, the internal audit programme says who audits each process, and the certification auditor reads it. A scripted question: read the situation and the three options, and choose one. When you click Check my answer you see the best option and why. LI-MR's audit programme (rule L23) is written for you from your answer and this task's tracker." + LI,
        refs=refs(tpls=["T-LI-MR"], arts=["LI-MR"]))
    put(12, "Decide for each row: For each management-review input", t="Rate each management-review input (9.3.2 a–g)",
        w=LI17 + "LI-MR's review pack has one row per input of clause 9.3.2 (rule L24). For each, read the deliverables that feed it in Ref-Review inputs (Learn › Reference pages) and their review records on Home › Waiting On, and decide whether the input is available.",
        o="Status of each 9.3.2 input checked in LI-MR",
        help="Available: every deliverable it names is accepted, or is one of this task's own (ACT-UPD, ACT-MRI, LI-MR). Missing: none is. Partly available: anything between, a deliverable accepted with review comments or not in the records yet included. " + CHECK + LI,
        refs=refs(rules=["L24"], pages=["Ref-Review inputs"]))
    put(13, "Copy the status of the 3 objectives from your measures.", t="Judge each objective's status from its measure",
        w=LI17 + "LI-MR reports the three information security objectives of your LI-PLAN (Ref-Objectives). For each, compare the latest result of its measure with its target.",
        o="Status of each objective checked in LI-MR",
        help="Met: the latest result reaches the target. Not met: it is below the target. Too early: no result has been measured yet. " + CHECK + LI)
    put(14, "Decide for each row: Decide: ready for the Stage 1 audit", t="Decide Stage 1 readiness (rule L24)",
        w=LI17 + "For each of the 14 mandatory documented information items of your LI-DOC register, decide whether it is present: the artefacts that hold it (Ref-Locations) in your review records on Home › Waiting On. Then apply rule L24: is the ISMS ready for the Stage 1 audit?",
        o="Each item and the readiness verdict checked in LI-MR",
        help="Present: every artefact that holds it is accepted, or is one of this task's own. Accepted with review comments, or not in the records yet, is not present yet. " + CHECK + LI,
        refs=refs(rules=["L24"]))
    put(15, 'Submit LI-MR. Click "Done".', t="Hand in LI-MR", w=LI17 + "Check LI-MR's sheets for empty cells, name the file and submit it.", o="LI-MR submitted with manifest")
    for n in range(1, 16):
        tool(n, "risk|Mitigation Tracker")
    for n, o in ((2, ["Pass", "Fail"]), (3, ["Open — K1", "Open — K2", "Open — K3", "Open — K4"]), (4, ["Escalate to the owner's manager (K5)", "No escalation yet"]),
                 (12, ["Available", "Partly available", "Missing"]), (14, ["Present", "Not present", "Yes", "No"])):
        steps[n - 1]["opt"] = o

    # Text seen before steps 8, 9 and 11 named their answers: KR3's "overdue list with owners" (D4), the card's "the same issue
    # in three actions is a repeat issue that needs a corrective action on the cause" (D5), the LI KR's "Independent auditor" (D6).
    swaps = [
        ("KR1 — Closure tests, status and reason code (K1–K5) correct for every action · Activities 1–3, 6",
         "KR1 — Closure tests, status and reason code (K1–K4) correct for every action; owners told what closes each reopened action · Activities 1–3, 6"),
        ("KR2 — Every action > 14 days overdue escalated; next check dates set · Activities 4–5", "KR2 — Every action > 14 days overdue escalated; days past due and next check dates set · Activities 4–5"),
        ("KR3 — Review input complete: counts, overdue list with owners, repeat issues; ACT-UPD and ACT-MRI submitted · Activities 7–10",
         "KR3 — Review input complete and true to the verified tracker; ACT-UPD and ACT-MRI submitted · Activities 7–10"),
        ("LI-17 KR — Independent auditor chosen, 9.3.2 inputs rated, objective status copied, Stage 1 readiness decided (L23, L24)",
         "LI-17 KR — Auditor chosen, 9.3.2 inputs rated, objective status judged, Stage 1 readiness decided (L23, L24)"),
        ("Prepare the management-review input page: counts, overdue list, repeat issues — see", "Prepare the management-review input page from the verified tracker — see"),
        ("the same issue in three actions is a repeat issue that needs a corrective action on the cause (cl. 10.2).",
         "and the management review reads the tracker for what it says about the processes behind the actions (cl. 9.3.2, 10.2)."),
    ]
    x = json.dumps(t, ensure_ascii=False)
    for a, b in swaps:
        assert a in x, a
        x = x.replace(a, b)
    w["tasks"]["T12.1"] = t = json.loads(x)
    steps = t["steps"]
    if "T12.1" in w["cards"]:
        y = json.dumps(w["cards"]["T12.1"], ensure_ascii=False)
        for a, b in swaps:
            y = y.replace(a, b)
        w["cards"]["T12.1"] = json.loads(y)
    assert t["meta"]["tool"] == "Risk Register › Mitigation Tracker (corrective actions)", t["meta"]["tool"]
    assert t["card"]["Where to add"].startswith("Platform: Risk Register › Mitigation Tracker (corrective actions)."), t["card"]["Where to add"]

    # ACT-MRI's format "Template (1 page)" names no file type, so it was handed in with no file of its own: it is the one-page
    # management-review input page, a document (DOCX).
    sub = next(x for x in t["subs"] if x["code"] == "ACT-MRI")
    assert sub["fmt"] == "Template (1 page)", sub
    sub["fmt"] = "DOCX (1 page, the management-review input page)"
    for d in w["deliverables"]:
        if d[0] == "T12.1" and d[1] == "ACT-MRI":
            assert d[3] == "Template (1 page)", d
            d[3] = sub["fmt"]
    old = "ACT-MRI — Management-review input: action status (Template (1 page))"
    new = f"ACT-MRI — Management-review input: action status ({sub['fmt']})"
    assert old in t["card"]["What to deliver"], t["card"]["What to deliver"]
    t["card"]["What to deliver"] = [new if x == old else x for x in t["card"]["What to deliver"]]
    for c in w["cards"].get("T12.1", []):
        if c[0] == "What to deliver":
            c[1] = [new if x == old else x for x in c[1]]

    # Risk Register › Mitigation Tracker showed another mentee's 15 actions (and a note that read R33 as "dated before the claim"):
    # it now shows this mentee's ACT-TRACKER, A-20 to A-22 from ACT-EXTRA, and the test date.
    mt = w["tp"]["risk|Mitigation Tracker"]
    assert mt["pl"]["note"] == "An action is really closed only when closure evidence exists, is dated before the claim and the re-test passed.", mt
    screen = {"tool": "Risk Register › Mitigation Tracker", "stamp": f"{len(act['tracker'])} actions", "kind": "table",
              "pl": {"h": act["h"], "r": [[c or "—" for c in r] for r in act["tracker"]],
                     "note": "ACT-TRACKER: the corrective actions raised from the work of weeks 3–11 across GlobalConnect and LearnTech, with what each owner reports. A-20 to A-22 came in late, with ACT-EXTRA (Inbox). The closure tests run on 23 December 2026."}}
    w["tp"]["risk|Mitigation Tracker"] = screen
    w["tp"]["risk|Mitigation Tracker#T12.1"] = screen
    assert t["panel"]["tool"] == "Risk Register › Corrective actions (ACT-TRACKER)", t["panel"]
    t["panel"] = screen
    # Home › Waiting On: the review records as of the test date (steps 12 and 14 read them).
    w["tp"]["home|Waiting On#T12.1"] = {"tool": "Home › Waiting On", "stamp": "Review records", "kind": "table", "pl": {
        "h": ["Deliverable", "Task", "Automated review", "Review comment"], "r": act["reviews"],
        "note": "Automated review records returned for your deliverables up to T11.2, as of 2026-12-23. Files of this task (T12.1) and of T12.2 are not listed yet."}}

    # Injects. J2 (pack: "4 of 15 actions are overdue") gave a count of another variant, and step 5's result; it now asks how the
    # review page counts the closures the tests did not confirm. J3 came from "Programme office" with closure evidence for "three
    # more actions": the three are the mentee's own earlier findings (A-20 to A-22), sent by the Information Security Auditor.
    j2, j3 = w["inj"]["T12.1-J2"], w["inj"]["T12.1-J3"]
    assert j2["notice"] == "Management review is tomorrow. 4 of 15 actions are overdue. What goes on the review page?", j2
    assert j3["notice"] == 'The file "ACT-EXTRA" in 01_Inputs has closure evidence for three more actions.' and j3["sender"] == "Programme office", j3
    j2.update(sender="Compliance Manager", ref="ISO/IEC 27001 clause 9.3.2 (a); rule R33",
              notice="The management review is on Thursday, and I am building its page from your tracker. Several owners report their actions Closed, but your closure tests have not confirmed all of them. How should the page count those?",
              options=["As closed, as their owners report them", "As open, with the reason code your test found", "Leave them off the page until the owners reply"])
    ex = act["extra"]
    j3.update(sender="Information Security Auditor", ref="Rule R33",
              notice=f"Closure evidence has come in late for three actions raised from your own earlier tests, so I have added them to the tracker from ACT-EXTRA. A-20: {ex['A-20']} A-21: {ex['A-21']} A-22: {ex['A-22']}",
              steps=["Find A-20 to A-22 on Risk Register › Mitigation Tracker.", "Test them with the others, from step 2."])

    blob = json.dumps([t, w["notes"]["T12.1"], w["cards"].get("T12.1"), j2, j3], ensure_ascii=False)
    for bad in ("DECIDE (for each", "after you submit", "Then do the step", "Programme office", "leaver account still active", "Refresh counts", "4 of 15"):
        assert bad not in blob, f"T12.1 still says {bad!r}"
    # Nothing read before a decision may name its answer: D4 (step 8), D5 (step 9), D6 (step 11).
    seen = lambda k: json.dumps([t["card"], t["krs"], w["cards"].get("T12.1"), t["panel"], j2, j3, w["tpls"]["T-ACT"], w["tpls"]["T-LI-MR"]] + [s["help"] for s in steps[:k - 1]] + [s["w"] for s in steps[:k - 1]], ensure_ascii=False)
    assert not re.search(r"and days overdue|overdue list|with (the )?owners", seen(8)), "D4 is answered before it is asked"
    assert not re.search(r"repeat issue|root cause|cause \(", seen(9)), "D5 is answered before it is asked"
    assert not re.search(r"Internal Audit|[Ii]ndependent|never the process owner", seen(11)), "D6 is answered before it is asked"


def t122(w: dict) -> None:
    """T12.2 in the platform's own terms (desk-step-builder, 31 Oct 2026), keeping the pack's intent.

    src/lib/desk/aud-t122.json (scratchpad build/T12.2/gen.py) holds the mentee's AUD-REQUESTS, EVIDENCE-INDEX (each file with
    its own SHA-256) and AUD-FINDING, the index's read-me, the auditor's follow-up requests R-9 to R-12 and the Version History
    of the mentee's hand-ins. Step 1 reads the index (STUDY); 2 D1 (no part 2); 3 answers R-1 to R-8 by R34; 4 logs each sent
    file's SHA-256; 5 answers R-9 to R-12 from the mentee's own deliverables; 6 D3, then the owner of R-3's action (Charter
    RACI); 7 NC-1's response and corrective action (R34, Ref-Actions); 8 hands in AUD-LOG and AUD-NCR; 9 D5 (no part 2); 10
    reads NC-1's evidence row (L25, STUDY); 11 D6 (no part 2); 12 hands in LI-NCR-R. Content Corrections item 75.
    """
    w["tasks"]["T12.2"] = t = json.loads(desect(json.dumps(w["tasks"]["T12.2"], ensure_ascii=False)))
    w["notes"]["T12.2"] = json.loads(desect(json.dumps(w["notes"]["T12.2"], ensure_ascii=False)))
    if "T12.2" in w["cards"]:
        w["cards"]["T12.2"] = json.loads(desect(json.dumps(w["cards"]["T12.2"], ensure_ascii=False)))
    steps = t["steps"]
    notes = {n[0]: n for n in w["notes"]["T12.2"]}
    aud = json.loads((Path(__file__).resolve().parent.parent / "src" / "lib" / "desk" / "aud-t122.json").read_text(encoding="utf8"))
    assert aud["requests"] == w["ds"]["AUD-REQUESTS"]["r"], "AUD-REQUESTS changed in the pack"
    assert sorted(r[0] for r in aud["index"]) == sorted(r[0] for r in w["ds"]["EVIDENCE-INDEX"]["r"]), "EVIDENCE-INDEX changed in the pack"
    assert [aud["finding"]] == w["ds"]["AUD-FINDING"]["r"], "AUD-FINDING changed in the pack"
    CHECK = "Check my answers then shows each row's answer and why, before you complete the step."
    LI = " This is a Lead Implementer extension step: it adds to the task, with its own template and deliverable."
    LI18 = "[LI-18 — Challenging an external audit finding] "
    refs = lambda **k: {**{"rules": [], "docs": [], "pages": [], "tpls": [], "ds": [], "clauses": [], "arts": [], "wbs": []}, **k}

    def put(n: int, old_t: str, **f: object) -> None:
        s = steps[n - 1]
        assert s["t"].startswith(old_t), (n, s["t"])
        s.update(f)
        notes[n][1] = s["t"]
        if "help" in f:
            notes[n][2] = s["help"]

    def tool(n: int, key: str) -> None:
        s = steps[n - 1]
        sec, name = key.split("|")
        s["key"], s["sec"], s["tool"] = key, sec, f"{w['sections'][sec]['t']} › {name}"

    def no_then(n: int, old: str) -> str:
        assert steps[n - 1]["w"].endswith(old), (n, steps[n - 1]["w"])
        return steps[n - 1]["w"][: -len(old)]

    put(1, "Open AUD-REQUESTS and EVIDENCE-INDEX.", t="Read the repository index before answering",
        w="Before any request is answered, read what each column of EVIDENCE-INDEX, the evidence repository's index, records: its read-me says. Answer its three questions by clicking the column that answers each. The index itself is on Evidence › Evidence Library; the auditor's requests are on Evidence › Audit Requests (PBC).",
        o="Three questions answered from the index's read-me",
        help="At work, the repository's index is read column by column before the first request is answered, so each answer is checked in the right cell. Use only this dataset: AUD-REQUESTS and EVIDENCE-INDEX (15 files).",
        refs=refs(ds=["AUD-REQUESTS", "EVIDENCE-INDEX"]))
    put(2, "Decide: Two files match the control", w=no_then(2, " Then: For request R-1, filter EVIDENCE-INDEX by the control."), o="Decision T12.2-D1 checked",
        help="At work, the repository often holds more than one file for a control. A scripted question: read the situation and the three options, and choose one. When you click Check my answer you see the best option and why.",
        refs=refs(ds=["EVIDENCE-INDEX"], rules=["R34"]))
    put(3, "Decide for each row: For each request, choose the evidence file", t="Answer each request from the repository (rule R34)",
        w="For each of the auditor's requests R-1 to R-8, choose the one file of EVIDENCE-INDEX (Evidence › Evidence Library) that answers it by rule R34, or No evidence available where no file does.",
        o="File or No evidence available checked for every request",
        help="Rule R34 is in Learn › Rule tables. BKB-POL-016 Section 6.2 says what a request asks for: the record the control produces each time it operates. " + CHECK,
        refs=refs(rules=["R34"], ds=["EVIDENCE-INDEX"], docs=[["BKB-POL-016", ["6.2"]]]))
    put(4, 'Copy the file ID and SHA-256 into AUD-LOG.', t="Log the SHA-256 of each file you send",
        w="AUD-LOG records each file you send with its SHA-256, the fingerprint the repository took when the file was filed: the auditor can then prove the file they received is the one you logged. For each file sent, copy its SHA-256 from Evidence › Evidence Library. The time sent (UTC) is recorded when your answers are checked.",
        o="SHA-256 checked for every file sent; AUD-LOG updated",
        help="Copy it from the row of the file sent: another file of the same control has another fingerprint. " + CHECK,
        refs=refs(rules=["R34"], arts=["AUD-LOG"]))
    put(5, "Repeat steps 2–4 for R-2 to R-8.", t="Answer the auditor's follow-up requests from your own deliverables",
        w="At fieldwork the auditor asks for four more records, R-9 to R-12 (Evidence › Audit Requests (PBC)). Each is a record the Group GRC Office produced this year: one of your own hand-ins, from F1.1 to T12.1, listed in Policies › Version History. For each request, choose the deliverable that is the record it asks for, or No evidence available.",
        o="Answer checked for every follow-up request",
        help="At work, the auditor's follow-up requests ask for the ISMS's own records, and the analyst knows which record answers which clause. Version History gives each deliverable's name. " + CHECK,
        refs=refs(rules=["R34"]))
    old6 = " Then: Open AUD-FINDING. Open the evidence file it names."
    put(6, "Decide: No file exists for a request", w=no_then(6, old6) + " Then: For R-3, choose its owner by the GRC Charter's RACI (Section 16).",
        o="Decision T12.2-D3 checked; R-3's owner checked",
        help="At work, the owner of a control is asked for its records, and sometimes offers a way round. A scripted question first: when you click Check my answer you see the best option and why. Then choose R-3's owner: the role Responsible for the control's process in the GRC Charter's RACI (Section 16). " + CHECK,
        refs=refs(rules=["R34"], docs=[["Charter", ["16"]]]))
    put(7, "Decide for each row: Decide the response to NC-1", t="Respond to NC-1 from its evidence (rule R34)",
        w="NC-1 is the auditor's finding. Open the evidence file it names in Evidence › Evidence Library and decide GlobalConnect's response by rule R34: accept and commit to a corrective action, or challenge with the evidence. Then choose the corrective action from Ref-Actions (Learn › Reference pages), or none if you challenge.",
        o="Response and corrective action checked in AUD-NCR",
        help="Rule R34 (Learn › Rule tables) says how the evidence file decides the response. Ref-Actions' Exception / deviation column says which action fits a deviation. " + CHECK,
        refs=refs(rules=["R34"], pages=["Ref-Actions"], ds=["AUD-FINDING", "EVIDENCE-INDEX"]))
    put(8, 'Submit AUD-LOG and AUD-NCR. Click "Done".', t="Hand in AUD-LOG and AUD-NCR",
        w="Check AUD-LOG's and AUD-NCR's sheets for empty cells, name the files and submit them.", o="AUD-LOG, AUD-NCR submitted with manifest")
    old9 = " Then: Find the clause or Annex A control that NC-1 is raised against. Copy it into the frame."
    put(9, "Decide: NC-1 is raised against a control", w=no_then(9, old9), o="Decision T12.2-D5 checked",
        help="At work, the written response to a finding is filed with the certification body beside the finding. A scripted question: read the situation and the three options, and choose one. When you click Check my answer you see the best option and why. LI-NCR-R is then completed from AUD-FINDING." + LI)
    put(10, "Apply rule L25 to the evidence file named in NC-1.", t="Read NC-1's evidence row (rule L25)",
        w=LI18 + f"Before LI-NCR-R cites NC-1's evidence, read its row as rule L25 says. NC-1 names {aud['finding'][3]} as the evidence file to check: find it in the index below, and answer three questions by clicking the cell that answers each. The audit period is {aud['period']}.",
        o="Three questions answered on NC-1's evidence row",
        help="At work, the auditee reads the auditor's evidence before answering it: is it the period's record, from a system, and what does it show? Rule L25 is in Learn › Rule tables." + LI,
        refs=refs(rules=["L25"], ds=["AUD-FINDING"]))
    old11 = " Then: Name the route: closing meeting, then the certification body's appeal process."
    put(11, "Decide: After the closing meeting", w=no_then(11, old11), o="Decision T12.2-D6 checked",
        help="At work, a finding the auditee disagrees with is discussed at the closing meeting first. A scripted question: read the situation and the three options, and choose one. When you click Check my answer you see the best option and why. LI-NCR-R then records the route." + LI)
    put(12, 'Submit LI-NCR-R with AUD-NCR. Click "Done".', t="Hand in LI-NCR-R",
        w=LI18 + "Check LI-NCR-R for empty cells, name the file and submit it. It is filed with AUD-NCR.", o="LI-NCR-R submitted with manifest",
        refs=refs(arts=["LI-NCR-R"]))
    for n in range(1, 13):
        tool(n, "evidence|Audit Requests (PBC)")
    steps[2]["opt"] = [r[0] for r in sorted(aud["index"])] + ["No evidence available"]
    steps[6]["opt"] = aud["respOpts"] + aud["actOpts"]

    # Text read before an answer named it: the card's "never creates evidence after the request" (D3), "quoting the requirement"
    # (D5), "the escalation route — closing meeting, then the certification body's appeal process" (D6), KR1's "in-period file"
    # (D1) and "with an action" (D3), the LI KR's "quotes the requirement … names the appeal route" (D5, D6) and its "Challenge"
    # (step 7's answer here is the other), J2's answer ("only the auditor concludes").
    swaps = [
        ('KR1 — Correct in-period file, or "No evidence available" with an action, for all 8 requests · Activities 1–3, 5–6',
         "KR1 — Every request answered by rule R34 from the repository or your own records · Activities 1–3, 5–6"),
        ("LI-18 KR — Challenge quotes the requirement, cites the evidence (L25) and names the appeal route; LI-NCR-R submitted · Activities 9–12",
         "LI-18 KR — NC-1's response written in LI-NCR-R from its evidence row (L25), with the route if it is disputed; LI-NCR-R submitted · Activities 9–12"),
        ("The auditee provides exactly the file that matches the control and the period — never creates evidence after the request — and responds to a finding from the evidence, quoting the requirement.",
         "The auditee answers each request from the evidence repository and responds to a finding from the evidence: what is sent, and how a finding is answered, is what the auditor concludes from."),
        ('Answer an auditor request with one traceable file (ID, hash, time sent) or an honest "no evidence available" plus an action — see Rule R34; BKB-POL-016 Section 6.2',
         "Answer an auditor request from the evidence repository and log what you send (ID, hash, time sent) — see Rule R34; BKB-POL-016 Section 6.2"),
        ("Know the escalation route — closing meeting, then the certification body's appeal process (LI-18) — see ISO/IEC 17021-1 (appeals)",
         "Know what happens to a finding still disputed after the audit (LI-18) — see ISO/IEC 17021-1 (appeals)"),
        ("Evidence created after the request is not evidence of past operation (inject T12.2-J2); honesty protects the certificate. The auditee provides evidence, only the auditor concludes (ISO 19011 independence). HC6 scores this task.",
         "What the auditor receives, and how a finding is answered, is what the certificate rests on. HC6 scores this task."),
    ]
    js = lambda v: json.dumps(v, ensure_ascii=False)[1:-1]  # as the text sits in JSON: quotes escaped
    x = json.dumps(t, ensure_ascii=False)
    for a, b in swaps:
        assert js(a) in x, a
        x = x.replace(js(a), js(b))
    w["tasks"]["T12.2"] = t = json.loads(x)
    steps = t["steps"]
    if "T12.2" in w["cards"]:
        y = json.dumps(w["cards"]["T12.2"], ensure_ascii=False)
        for a, b in swaps:
            y = y.replace(js(a), js(b))
        w["cards"]["T12.2"] = json.loads(y)
    li = w["li"]["LI-18"]
    for holder, old, new in [
        (li, "Add the requirement and the appeal route to your NC-1 response (L25).", "Write your NC-1 response in LI-NCR-R, from its evidence row (L25)."),
        (li["card"], "Findings are only valid against a stated requirement. A professional auditee quotes the clause, shows the evidence, and knows the appeal route.",
         "A professional auditee answers a finding point by point, from the evidence, and knows what happens if the disagreement is not settled at the audit."),
        (li["card"], "Refusing to sign or deleting a finding is never the route (decision T12.2-D6); the certification body's appeal process is.", "HC6 scores how the response follows the evidence."),
    ]:
        k = next(k for k, v in holder.items() if v == old)
        holder[k] = new
    li["kr"] = li["kr"].replace("Challenge quotes the requirement, cites the evidence (L25) and names the appeal route", "NC-1's response written in LI-NCR-R from its evidence row (L25), with the route if it is disputed")
    assert li["card"]["learn"][0][0] == "Respond to NC-1 by quoting the requirement, citing the evidence row and naming the escalation route"
    li["card"]["learn"][0][0] = "Respond to NC-1 from its evidence row, and know where a dispute goes"
    lic = json.dumps(w["licards"]["LI-18"], ensure_ascii=False)
    for a, b in [("Add the requirement and the appeal route to your NC-1 response (L25).", li["obj"]),
                 ("Findings are only valid against a stated requirement. A professional auditee quotes the clause, shows the evidence, and knows the appeal route.", li["card"]["why"]),
                 ("Respond to NC-1 by quoting the requirement, citing the evidence row and naming the escalation route", li["card"]["learn"][0][0]),
                 ("Refusing to sign or deleting a finding is never the route (decision T12.2-D6); the certification body's appeal process is.", li["card"]["important"])]:
        assert a in lic, a
        lic = lic.replace(a, b)
    w["licards"]["LI-18"] = json.loads(lic)

    # The two frames name no file type ("Template (frame)"), so the hand-in had no file box for them: each is a document.
    for code, fmt in (("AUD-NCR", "DOCX (the finding-response frame)"), ("LI-NCR-R", "DOCX (the LI-NCR-R frame)")):
        sub = next(x for x in t["subs"] if x["code"] == code)
        assert sub["fmt"] == "Template (frame)", sub
        sub["fmt"] = fmt
        for d in w["deliverables"]:
            if d[0] == "T12.2" and d[1] == code:
                assert d[3] == "Template (frame)", d
                d[3] = fmt
        old = f"{code} — {sub['name']} (Template (frame))"
        assert old in t["card"]["What to deliver"], t["card"]["What to deliver"]
        t["card"]["What to deliver"] = [f"{code} — {sub['name']} ({fmt})" if v == old else v for v in t["card"]["What to deliver"]]
        for c in w["cards"].get("T12.2", []):
            if c[0] == "What to deliver":
                c[1] = [f"{code} — {sub['name']} ({fmt})" if v == old else v for v in c[1]]
    assert li["sub"]["fmt"] == "Template (frame)"
    li["sub"]["fmt"] = "DOCX (the LI-NCR-R frame)"
    for c in w["licards"]["LI-18"]:
        if c[0] == "What to deliver":
            c[1] = [v.replace("(Template (frame))", "(DOCX (the LI-NCR-R frame))") for v in c[1]]

    # "Where to add": the screens the steps use (step 5 reads the mentee's hand-ins in Policies › Version History).
    old_w = "Platform: Evidence › Audit Requests (PBC), Evidence Library."
    new_w = "Platform: Evidence › Audit Requests (PBC), Evidence Library; Policies › Version History."
    assert t["card"]["Where to add"].startswith(old_w), t["card"]["Where to add"]
    t["card"]["Where to add"] = t["card"]["Where to add"].replace(old_w, new_w)
    for c in w["cards"].get("T12.2", []):
        if c[0] == "Where to add":
            c[1] = c[1].replace(old_w, new_w)
    assert t["meta"]["tool"] == "Evidence › Audit Requests (PBC), Evidence Library"
    t["meta"]["tool"] = new_w.removeprefix("Platform: ").rstrip(".")
    for d in w["deliverables"]:
        if d[0] == "T12.2":
            assert d[5] == "Evidence › Audit Requests (PBC), Evidence Library", d
            d[5] = t["meta"]["tool"]

    # The screens. Evidence › Audit Requests (PBC) showed T5.1's six controls (PBC-6, with T5.1's copy note) to this task too, and
    # Evidence Library the 42 files of T5.2: each now shows this task's data as the task reaches it. Policies › Version History
    # lists the mentee's hand-ins (step 5).
    assert t["panel"]["tool"] == "Evidence › Audit Requests (PBC-6)", t["panel"]
    period = aud["period"]
    reqs = {"tool": "Evidence › Audit Requests (PBC)", "stamp": f"{len(aud['requests']) + len(aud['followups'])} requests", "kind": "table",
            "pl": {"h": ["Request", "Control / clause", "Auditor asks for", "Period"], "r": aud["requests"] + aud["followups"],
                   "note": f"AUD-REQUESTS: the certification body's surveillance audit of GlobalConnect's ISMS, audit period {period}. R-1 to R-8 came at the opening meeting; R-9 to R-12 are the auditor's follow-up requests from the first day of fieldwork."}}
    w["tp"]["evidence|Audit Requests (PBC)#T12.2"] = reqs
    t["panel"] = reqs
    w["tp"]["evidence|Evidence Library#T12.2"] = {"tool": "Evidence › Evidence Library", "stamp": f"{len(aud['index'])} files", "kind": "table", "pl": {
        "h": ["File", "Control", "Description", "Date", "Source", "SHA-256", "Result"], "r": [[c or "—" for c in r] for r in aud["index"]],
        "note": "EVIDENCE-INDEX: the Group evidence repository's files for the controls and clauses of this audit, sorted by control. It is built like the evidence index you made in T5.2 (EVP-IDX): each file filed under its control, with its date, source and SHA-256."}}
    w["tp"]["policies|Version History#T12.2"] = {"tool": "Policies › Version History", "stamp": f"{len(aud['versions'])} deliverables", "kind": "table", "pl": {
        "h": ["Deliverable", "Name", "Task", "Version"], "r": [r[:4] for r in aud["versions"]],
        "note": "Your hand-ins from F1.1 to T12.1. Each version is sealed with its SHA-256 and UTC time when you submit it; a resubmission is a new version, and nothing is overwritten."}}

    # Injects. J2's sender is this task's owner, and its "the auditor asks you, the intern" names no audit of this variant; the
    # Compliance Manager coordinates external audits (BKB-POL-016 Section 6.2). J4 came from "Unknown sender (outside the platform)":
    # a GRC Office colleague now passes it on, which is how such a mix-up reaches an intern.
    j2, j4 = w["inj"]["T12.2-J2"], w["inj"]["T12.2-J4"]
    assert j2["notice"] == 'The auditor asks you, the intern, whether the company "passes". What do you answer?' and j2["sender"] == "Information Security Auditor", j2
    assert j4["notice"] == "Someone offers you the auditor's internal checklist, sent by mistake. What do you do?" and j4["sender"] == "Unknown sender (outside the platform)", j4
    j2.update(sender="Compliance Manager",
              notice="End of day one in Manila. While I was with the CISO, the certification body's auditor stopped at your desk and asked whether GlobalConnect “passes”, with NC-1 open on change management. They will ask again tomorrow. What do you answer?")
    j4.update(sender="Policy & Governance Analyst",
              notice="The certification body's auditor e-mailed their internal checklist for tomorrow's change-management interviews to our shared mailbox by mistake. It shows exactly what they will test on NC-1. I can forward it to you now. What do you do?")

    # T12.2's builds line (also T7.2's feeds line and the connections map) named step 5's R-9 answer ("the auditor asks for the
    # risk assessment criteria (cl. 6.1.2) — the method card is the answer"): it now says what the card is to the auditor.
    old_b = "The auditor asks for the risk assessment criteria (cl. 6.1.2) — the method card is the answer."
    new_b = "The method card is part of the ISMS's documented information a certification auditor reads at fieldwork."
    for holder in (w["tasks"]["T12.2"], w["tasks"]["T7.2"], w["connections"]):
        x = json.dumps(holder, ensure_ascii=False)
        holder_new = json.loads(x.replace(old_b, new_b))
        holder.clear() if isinstance(holder, dict) else None
        holder.update(holder_new)
    t = w["tasks"]["T12.2"]
    steps = t["steps"]
    assert old_b not in json.dumps(w, ensure_ascii=False), "the R-9 answer is still named"
    # The messages arrive once the task is reached, before step 3: they may not name a request's answer.
    assert not re.search(r"R-\d|EV-\d", j2["notice"] + j4["notice"]), "an inject names a request's answer"
    blob = json.dumps([t, w["notes"]["T12.2"], w["cards"].get("T12.2"), j2, j4, w["li"]["LI-18"], w["licards"]["LI-18"]], ensure_ascii=False)
    for bad in ("DECIDE (for each", "after you submit", "Then do the step", "Unknown sender", "PBC-6", "Copy the minimum sample", "Repeat steps", "Template (frame)"):
        assert bad not in blob, f"T12.2 still says {bad!r}"
    # Nothing read before a decision may name its answer: D1 (step 2), D3 (step 6), D5 (step 9), D6 (step 11).
    seen = lambda k: json.dumps([t["card"], t["krs"], w["cards"].get("T12.2"), t["panel"], j2, j4, w["tpls"]["T-AUD"], w["li"]["LI-18"], w["licards"]["LI-18"]] + [s["help"] for s in steps[:k - 1]] + [s["w"] for s in steps[:k - 1]] + [steps[k - 1]["help"]], ensure_ascii=False)
    assert not re.search(r"in-period|inside the (audit )?period|before the period", seen(2)), "D1 is answered before it is asked"
    assert not re.search(r"never create|created after|honest|raise an action|with an action", seen(6)), "D3 is answered before it is asked"
    assert not re.search(r"quot(e|ing) the (requirement|clause)|stated requirement|raised against", seen(9)), "D5 is answered before it is asked"
    assert not re.search(r"appeal process|appeal route|escalation route", seen(11)), "D6 is answered before it is asked"


def rework_f11(w: dict) -> None:
    """REWORK F1.1 (owner, 30 Oct 2026). Runs on the final text, after retro().

    Steps 1 and 5 are orientation steps (owner: modify, never merge or remove). They were straight copies
    of values the platform shows; READ-ME-FIRST tables 1 and 3 now arrive pre-filled by the programme
    office with slips (lib/desk/forms.ts rmfGiven), and the learner checks each value against its source
    and corrects it, as an analyst checks a record someone else filled before relying on it. Table 2
    (folder paths, step 4) stays a copy: it feeds step 6. The card names the screens the steps use, and
    the drill F1.1-J2 names the learner's organisation. Logged in docs/GRC101_Content_Corrections.md.
    """
    t = w["tasks"]["F1.1"]
    notes = {r[0]: r for r in w["notes"]["F1.1"]}
    for n, old_w, title, text, out, old_help, help_ in [
        (1, 'In table 1 "My assignment" copy the 6 values exactly as shown',
         "Check table 1 of READ-ME-FIRST against Home › My Organisation",
         'Open the file READ-ME-FIRST (01_Inputs) and Home › My Organisation. The programme office filled in table 1 '
         '"My assignment" from your enrolment record: the name of Org A, its home office, the name of Org B, its home '
         'office, the task owner of F1.2 and your start date. Check each value against My Organisation, correct any '
         'that differ, then click Check my answers.',
         "READ-ME-FIRST table 1 checked against My Organisation (6 values)",
         "Copy six values into table 1 of READ-ME-FIRST, exactly as written on the screen: the name of each organisation, "
         "the home office of each (city, country), the task owner of F1.2 and your start date. Nothing to decide — copy, then tick the step.",
         "The programme office has filled in table 1 of READ-ME-FIRST for you. Before you rely on a record someone else "
         "filled in, check it against the screen it comes from: compare each of the six values with My Organisation, "
         "word for word, and correct any that differ. Then click Check my answers."),
        (5, 'In table 3 "My week-1 dates" copy the due dates of F1.2, F1.3 and the knowledge check KC-01 (format DD-MMM-YYYY).',
         "Check table 3 of READ-ME-FIRST against Home › My plan",
         'Open Home › My plan. The programme office filled in table 3 "My week-1 dates" with the due dates of F1.2, F1.3 '
         "and the knowledge check KC-01 (format DD-MMM-YYYY). Check each date against My plan, correct any that differ, "
         "then click Check my answers.",
         "READ-ME-FIRST table 3 checked against My plan (3 due dates)",
         "Copy three dates into table 3: F1.2, F1.3 and the knowledge check KC-01. Write each date as DD-MMM-YYYY, for example 05-OCT-2026.",
         "Table 3 was filled in for you: check its three dates (F1.2, F1.3 and the knowledge check KC-01) against My plan "
         "and correct any that differ. Dates are written DD-MMM-YYYY, for example 05-OCT-2026. Then click Check my answers."),
    ]:
        s = t["steps"][n - 1]
        assert old_w in s["w"], (n, s["w"])
        assert s["o"].startswith(f"READ-ME-FIRST table {1 if n == 1 else 3} filled"), s["o"]
        s["t"], s["w"], s["o"] = title, text, out
        for holder, field in ((s, "help"), (notes[n], 2)):
            assert old_help in holder[field], (n, holder[field])
            holder[field] = holder[field].replace(old_help, help_)
        notes[n][1] = title
    old_in = 'The file READ-ME-FIRST in your task folder (01_Inputs): three empty tables — 1 "My assignment" (6 rows), 2 "My folders" (4 rows), 3 "My week-1 dates" (3 rows)'
    assert t["inputs"][3] == old_in, t["inputs"][3]
    t["inputs"][3] = ('The file READ-ME-FIRST in your task folder (01_Inputs): three tables — 1 "My assignment" (6 rows) and '
                      '3 "My week-1 dates" (3 rows), filled in by the programme office for you to check; 2 "My folders" (4 rows), empty')
    # "Where to add": the screens the steps use (steps 1, 4 and 6, 5), and step 3 for both forms.
    old_tool, new_tool = "Home › My Tasks; F1.1 step 3 (onboarding attestations)", "Home › My Organisation, My Tasks, My plan; F1.1 step 3 (onboarding attestations)"
    assert t["card"]["Where to add"].startswith(f"Platform: {old_tool}."), t["card"]["Where to add"]
    t["card"]["Where to add"] = t["card"]["Where to add"].replace(old_tool, new_tool)
    for c in w["cards"]["F1.1"]:
        if c[0] == "Where to add":
            assert old_tool in c[1], c[1]
            c[1] = c[1].replace(old_tool, new_tool)
    assert t["meta"]["tool"] == old_tool, t["meta"]
    t["meta"]["tool"] = new_tool
    for d in w["deliverables"]:
        if d[0] == "F1.1":
            assert d[5] == old_tool, d
            d[5] = new_tool
    # The drill arrives at step 5 (lib/desk/inbox.ts INJ_AT), once the data rules are saved and the undertaking
    # signed. The pack's line names no organisation; the offer now names the learner's, and says it is real data.
    j = w["inj"]["F1.1-J2"]
    assert j["notice"] == 'Someone offers you the complete HR export "to save time". What do you do?', j["notice"]
    assert j["sender"] == "Unknown sender (outside the platform)", j["sender"]
    org = w["orgs"]["A"]
    j["notice"] = (f"Hi, I hear you have just joined the Group GRC Office and are working on {org['short']}. I can send you "
                   f"{org['short']}'s complete HR export, real staff names and all, to save you time on your tasks. Shall I send it?")
    # The Inbox window's footer told the learner the answer to every drill, above the reply buttons.
    old_g = " If anyone offers outside data: do not open it, click Report."
    assert w["guard"]["inbox"].endswith(old_g), w["guard"]["inbox"]
    w["guard"]["inbox"] = w["guard"]["inbox"][: -len(old_g)]


def rework_f12(w: dict) -> None:
    """REWORK F1.2 (owner, 30 Oct 2026). Runs on the final text, after rework_f11().

    Step 5's question (which evidence ref is acceptable) is answered from the Group's definition in Learn & Grow ›
    Glossary, so the step names that screen (its key: the WHERE column and the toolbar dot) instead of the Framework
    Library it is not worked in, and drops the addendum, which does not answer it. Its help no longer says which
    options are not sources. The card names the screens the steps use. The Framework Library screen's instrument types
    follow rule R01 as the step's key and the worked rows do. F1.2-J1 is about this mentee's Warsaw row.
    Logged in docs/GRC101_Content_Corrections.md (item 77).
    """
    t = w["tasks"]["F1.2"]
    s5 = t["steps"][4]
    note5 = next(r for r in w["notes"]["F1.2"] if r[0] == 5)
    old_help = 'A source is something another person can open and check: the document name and the section. "My notes" and "Internet" are not sources. '
    new_help = ("Learn & Grow › Glossary says what an evidence ref must hold. Hold each option against it, choose one and click "
                "Check my answer. ")
    for holder, field in ((s5, "help"), (note5, 2)):
        assert holder[field].startswith(old_help), holder[field]
        holder[field] = new_help + holder[field][len(old_help):]
    assert s5["key"] == "frameworks|Framework Library" and s5["kind"] == "pick", s5
    s5["tool"], s5["key"], s5["sec"] = "Learn & Grow › Glossary", "learn|Glossary", "learn"
    assert [d[0] for d in s5["refs"]["docs"]] == ["BKB-ADD-16"], s5["refs"]
    s5["refs"]["docs"] = []
    # The card: the learning line pointed at a "Capture standard" no screen is called, and gave D3's reason.
    old_learn = 'Give every value a source another person can open — see Capture standard — "Evidence ref"'
    new_learn = 'Record where every value came from — see Learn & Grow › Glossary, "Evidence ref"'
    old_tool = "Frameworks › Framework Library"
    new_tool = ("Frameworks › Framework Library; Policies › Policy Library (BKB-ADD-16); "
                "Learn & Grow › Rule tables, Framework Quick Reference, Glossary; Home › My Tasks")
    learn = t["card"]["What will I learn"]
    assert old_learn in learn, learn
    learn[learn.index(old_learn)] = new_learn
    assert t["card"]["Where to add"].startswith(f"Platform: {old_tool}."), t["card"]["Where to add"]
    t["card"]["Where to add"] = t["card"]["Where to add"].replace(old_tool, new_tool, 1)
    for c in w["cards"]["F1.2"]:
        if c[0] == "What will I learn":
            assert old_learn in c[1], c[1]
            c[1][c[1].index(old_learn)] = new_learn
        if c[0] == "Where to add":
            assert c[1].startswith(f"Platform: {old_tool}."), c[1]
            c[1] = c[1].replace(old_tool, new_tool, 1)
    assert t["meta"]["tool"] == old_tool, t["meta"]
    t["meta"]["tool"] = new_tool
    for d in w["deliverables"]:
        if d[0] == "F1.2":
            assert d[5] == old_tool, d
            d[5] = new_tool
    # Frameworks › Framework Library (opened from the toolbar once step 3 is checked) gave PCI DSS as an "Industry
    # standard" and ISO/IEC 29151 as "Certifiable guidance", which R01 has no outcome for; step 3's key (R01 question 3)
    # and the worked rows say Attestation framework and Code of practice.
    fl = {r[0]: r for r in w["tp"]["frameworks|Framework Library"]["pl"]["r"]}
    for std, old, new in (("PCI DSS v4.0.1", "Industry standard", "Attestation framework"),
                          ("ISO/IEC 29151", "Certifiable guidance", "Code of practice")):
        assert fl[std][1] == old, fl[std]
        fl[std][1] = new
    # F1.2-J1 arrives at step 6 (lib/desk/inbox.ts INJ_AT), once the GDPR row's office has been read and checked (step
    # 4) and the evidence-ref question answered (step 5), which its option C would otherwise hint at. The pack's line
    # named no standard; this mentee's Polish-language instrument is the 2018 Act in the Warsaw row of Section 2, and
    # BKB-ADD-16 Section 2's note now names the translation the Group reads it in.
    j = w["inj"]["F1.2-J1"]
    assert j["notice"] == "A standard is published only in the local language, and you read only English.", j["notice"]
    assert j["sender"] == "Policy & Governance Analyst", j["sender"]
    assert j["options"] == ["Skip the standard", "Translate it with a public AI tool",
                            "Use the official English translation named in the addendum, and record the language"], j["options"]
    org = w["orgs"]["A"]
    assert org["addendum"] == "BKB-ADD-16" and "Warsaw, Poland" in org["offices"], org
    j["notice"] = ("Before FAM-MAP goes in: your GDPR row rests on the Warsaw row of BKB-ADD-16 Section 2, which reads "
                   "“GDPR + 2018 Act”. The 2018 Act is Poland's Act of 10 May 2018 on the Protection of Personal Data. Its text "
                   "is published only in Polish, and you read only English. T3.1 builds the Warsaw office's obligations on "
                   "this row. How will you read the Act?")
    j["options"] = ["Skip the Act", "Translate it with a public AI tool",
                    "Use the English translation named in the addendum, and record the language"]
    j["ref"] = "BKB-ADD-16 Section 2; BKB-POL-022 Section 7.1"


def retro(w: dict) -> None:
    """Help notes read before a decision is answered must not state its answer (owner, 28 Oct 2026).

    Run on the final text (after the pack-wide replacements above). Each note says what to do and where
    to read, not what comes out. Listed in docs/GRC101_Content_Corrections.md (item 53).
    """
    def sub(tid: str, n: int, old: str, new: str) -> None:
        s = w["tasks"][tid]["steps"][n - 1]
        note = next(r for r in w["notes"][tid] if r[0] == n)
        for holder, field in ((s, "help"), (note, 2)):  # the help window shows the owner's notes table
            assert old in holder[field], (tid, n, holder[field])
            holder[field] = holder[field].replace(old, new)

    sub("F1.1", 3, "The point: all help on this platform is pre-written — the note you are reading now, the glossary in Learn, the rule tables under Learn › Rule tables. No AI tool and no chat is used for task work. ",
        "Read the situation and the three options, choose one and click Check my answer: you then see the best option and why. ")
    sub("F1.1", 4, "The answer is always a platform folder: 01_Inputs holds what you receive (read-only), 02_Working your drafts, 03_Submission your final files, 00_Admin your signed forms. Copy the four paths",
        "Choose one option and click Check my answer: you then see the best option and why. Then copy the four paths")
    sub("F1.3", 4, 'A scripted question first: only assets rated "Mission Critical" in the register belong in section 4 — not "Business Critical", whatever data they hold. Then',
        "A scripted question first, about which assets belong in section 4. Then")
    sub("F1.3", 5, "A party is a person or an organisation (customers, a regulator); a requirement is what they need from us (notify within 72 hours). Rule R04: copy",
        "A scripted question first, about telling an interested party from its requirement. Then, with rule R04, copy")
    sub("F1.3", 6, 'The template is fixed: four sections, one page, label "Internal". If the page shows that it runs onto a second page, cut repeated words — never a section, never the font size. Save',
        'A scripted question first, about a brief that runs past one page. Then check the page: it must fit on one A4 page and carry the label "Internal" in its footer. Save')
    sub("F2.1", 3, 'A scripted question about the "never below Tier 3" rule: anything with personal data or credentials is at least Tier 3, whatever the tree said. Then check every row of yours that holds personal data or credentials and raise the tier if needed.',
        "A scripted question about rule R05 (Learn › Rule tables) first. Then record, for each of your rows, whether it holds personal data or credentials.")
    sub("F2.2", 4, 'A scripted question about a password shown in plain text (defect D9): never copy it, never mask it yourself — click "Report data issue" and reject the item. Then do that for any D9 item in your dataset.',
        "A scripted question about a password shown in plain text (defect D9) first. Then report any of your items whose Content note shows unmasked data or a password.")
    sub("T3.1", 2, ' Rule R10 (One obligation per row): If a sentence has two actions (joined by "and" or ";"), make two rows. Owner role = the owner of the linked BKB policy in the BKB-POL-000 index.',
        " Rule R10 is in Learn › Rule tables.")
    sub("T3.1", 4, ", one row each, as contract obligations.", ", one row each.")
    sub("T3.1", 5, "(BKB-POL-000 index); its owner role is filled from the index by itself.", "(BKB-POL-000 index).")
    sub("T3.1", 7, ' If they differ, copy both values and write "Differs — addendum governs".', "")

    # Where the pack had no content, the platform writes it (owner, 28 Oct 2026). Listed in
    # docs/GRC101_Content_Corrections.md (item 55) for review.
    # F2.2: Ref-Defect codes gains a Fix column, so a rejected item's fix is copied as the step says.
    fixes = {
        "D1": "Re-export from the system with the date and time, or the system clock, visible.",
        "D2": "Re-export from the generating account, so the user or system identity shows.",
        "D3": "Re-export the evidence for the whole audit period.",
        "D4": "Replace it with evidence dated within the audit period.",
        "D5": "Re-export with the query or filter parameters shown in the export header.",
        "D6": "Provide the unmodified system export; put any notes in a separate file.",
        "D7": "Provide the evidence from the in-scope system, office and entity.",
        "D8": "Provide the signed version, with the approver's name and date visible.",
        "D9": "Do not use or copy it: report it, and ask the owner for a masked export.",
        "D10": "Re-export at full size, with every key column legible.",
    }
    page = w["pages"]["Ref-Defect codes"]
    assert page["h"] == ["Code", "Evidence defect"], page["h"]
    page["h"].append("Fix")
    for r in page["r"]:
        r.append(fixes[r[0]])
    screen = w["tp"]["evidence|Defect Codes"]["pl"]
    assert screen["h"] == ["Code", "Defect"], screen["h"]
    screen["h"].append("Fix")
    for r in screen["r"]:
        r.append(fixes[r[0]])
    f22 = w["tasks"]["F2.2"]["steps"]
    f22[2]["w"] += " Then copy that code's Fix from the same list."
    f22[2]["o"] = "Defect code and fix recorded for every rejected item"
    sub("F2.2", 3, "Ref-Defect codes gives no fix text yet, so the Fix column waits for it.", "Then copy that code's Fix from Evidence › Defect Codes into the row.")
    # T3.1: BKB-ADD-16 §2.2 gives each obligation's article, deadline, process and evidence of compliance;
    # §9.1 the integrations L03's interfaces are read from.
    t31s = w["tasks"]["T3.1"]["steps"]
    old5 = "Copy the deadline or frequency the obligation states."
    new5 = "Copy its frequency or deadline, process and evidence of compliance from BKB-ADD-16 §2.2."
    assert old5 in t31s[4]["w"], t31s[4]["w"]
    t31s[4]["w"] = t31s[4]["w"].replace(old5, new5)
    sub("T3.1", 5, "Copy the deadline or frequency the obligation states.", new5)
    for d in w["library"]["docs"]:
        if d[0] == "BKB-ADD-16":
            secs = [s[0] for s in d[2]]
            d[2].insert(secs.index("2.1") + 1, ["2.2", "Obligation details"])
            secs = [s[0] for s in d[2]]
            at = secs.index("9") + 1 if "9" in secs else len(d[2])
            d[2].insert(at, ["9.1", "System integrations"])


if __name__ == "__main__":
    main(sys.argv[1])
