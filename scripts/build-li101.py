"""Overlay the manager's ISO/IEC 27001 Lead Implementer workbook onto the desk content (docs/li101/LI101_REBUILD_PLAN.md).

    python scripts/build-desk-sample.py <path to GRC101_Mentee_UI_Desk-12wk.html>   # the pack, as before
    python scripts/build-li101.py [path to LI101_source.xlsx]                         # then this, in place

Reads public/desk/sample.json and writes it back. For F1.2 … T12.2 every task field (title, objective, key results,
inputs, hand-ins, owner, support, hours, steps) comes from his Tasks and Steps sheets, the weeks from his Weeks sheet,
and the old task content for those tasks (cards, owner notes, task messages, panels, Lead Implementer extensions,
task screens, deliverables, links between tasks) is dropped. F1.1 is his "copied unchanged" task: left exactly as the
pack build made it, but takes his title. Learn › Reference pages keeps only the pages the programme names (a task's steps,
inputs or card, or a written content item). The ISO coverage sheet lands in `isocov`, where a later phase reads it.

Idempotent: everything it writes comes from the workbook, and everything it drops is found by task code, so running it
twice gives the same file. Answer keys stay out: his Decision key goes to backend/_seed (see backend/scripts), never here.
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
WEB = HERE.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else WEB.parent / "docs" / "li101" / "LI101_source.xlsx"
OUT = WEB / "public" / "desk" / "sample.json"

# desect() and the group rename are the pack build's, reused rather than copied.
_spec = importlib.util.spec_from_file_location("build_desk_sample", HERE / "build-desk-sample.py")
_bds = importlib.util.module_from_spec(_spec)
sys.path.insert(0, str(HERE))
_spec.loader.exec_module(_bds)
desect, rename_group = _bds.desect, _bds.rename_group

KEPT = {"F1.1"}  # his "copied unchanged" task
TASK = re.compile(r"^([FT]\d+\.\d+)(?=$|[-|:#])")
LETTER = re.compile(r"(?<![\w.])([A-Z])\)\s*")
# "Options: A) … B) … C) …" up to what follows the list: "Then:", "Guidance:", "Scored …", or the end.
OPTIONS = re.compile(r"\s*Options:\s*(?P<body>[A-Z]\).*?)(?=\s*(?:Then:|Guidance:|Scored\b)|$)", re.S)


def clean(v) -> str:
    return desect(rename_group(str(v or "").strip()))


def lines(v) -> list[str]:
    return [x.strip() for x in clean(v).split("\n") if x.strip()]


def split_options(w: str) -> tuple[str, list[str] | None]:
    """(the step's text without its lettered options, the options) — or the text unchanged and None."""
    m = OPTIONS.search(w)
    if not m:
        return w, None
    opts = [o.strip() for o in LETTER.split(m["body"])[2::2]]
    opts[-1] = opts[-1].rstrip(".").strip()
    return (w[: m.start()] + " " + w[m.end():].lstrip()).strip(), opts


def refs_of(text: str, d: dict) -> dict:
    """What a step's text cites, for the step's Reference tab and the toolbar dots: rules, documents, ISO clauses."""
    rules = sorted({r for r in re.findall(r"\b([RL]\d{2})\b", text) if r in d["rules"]})
    docs = []
    for code in sorted(d["docs"], key=len, reverse=True):
        for m in re.finditer(rf"(?<![\w-]){re.escape(code)}(?![\w-])((?:,?\s*(?:and\s+)?Sections?\s+[\d.]+(?:\s*[–-]\s*[\d.]+)?)*)", text):
            secs = re.findall(r"[\d.]+(?:\s*[–-]\s*[\d.]+)?", m[1])
            if not any(x == code for x, _ in docs):
                docs.append([code, [s.rstrip(".") for s in secs]])
    clauses = sorted({c for c in re.findall(r"\bClauses?\s+(\d+(?:\.\d+)*)", text) if c in d["iso"]})
    return {"rules": rules, "docs": docs, "pages": [], "tpls": [], "ds": [], "clauses": clauses, "arts": [], "wbs": []}


# ---- Phase 2: what the task builders wrote where his workbook is silent (each piece logged, platform-written, in
# docs/GRC101_Content_Corrections.md under its task). One block per task; everything is set outright, so a rerun
# gives the same file. Per step: `tool` (the toolbar screen the step is worked in, "Section › Screen") and `w` (his
# text tightened for the screen, never a new instruction). `panel` names the screen's own view of the task's template.
STEPS = {
    "F1.2": {
        1: {"tool": "Frameworks › Framework Library",
            "w": "Open template T-LI-FAM: it opens in Frameworks › Framework Library (columns A Document · B Type · C What it is for · D Who uses it · E Where this programme uses it). Read the two LearnTech Educational Solutions worked rows and find the three things every finished row has: a type from rule L01, a one-line purpose and a user."},
        2: {"tool": "Frameworks › Framework Library",
            "w": "For each of the ten documents, decide its type in column B from what it is for and who uses it. Guidance: rule L01."},
        4: {"tool": "Frameworks › Framework Library",
            "w": "For each clause 4 to 10 of ISO/IEC 27001:2022, decide its place in the PDCA cycle on sheet PDCA. Guidance: rule L02."},
        6: {"tool": "Frameworks › Framework Library"},
    },
    # F1.3: T-LI-CTX and CTX-IP are worked in Policies › New from Template (a template, filled for the task).
    "F1.3": {
        1: {"tool": "Policies › New from Template",
            "w": "Open template T-LI-CTX: it opens in Policies › New from Template (columns A Issue · B Internal/External · C Category · D Effect on the ISMS's intended outcomes · E Source). Rows 1–3 are LearnTech Educational Solutions worked examples. Find in them the three parts every finished row has: a category, the effect on the ISMS's intended outcomes, and the source it was read from."},
        2: {"tool": "Policies › New from Template",
            "w": "Open SITL-ADD-16 Section 1 and Section 2 (the Manila, Philippines row). Record four external issues for GlobalConnect Customer Solutions at Manila, one legal, one regulatory, one technological and one market: choose the issue in column A, write its effect on the ISMS in column D, and choose the section you took it from in column E."},
        3: {"tool": "Policies › New from Template", "ds": ["CTX-ISS-6"],
            "w": "For each of the six issues of dataset CTX-ISS-6, decide in column B whether it is internal or external. Guidance: an internal issue sits within the organisation's control (culture, structure, capabilities); an external one comes from its environment."},
        4: {"tool": "Policies › New from Template",
            "w": "Must GlobalConnect Customer Solutions determine whether climate change is a relevant issue for its ISMS? Then: on the climate-change row of CTX-ISS, record your conclusion (relevant or not relevant) in column A and the reason in column D."},
        5: {"tool": "Policies › New from Template",
            "w": "Which of these is an interested-party requirement, not a party? Then: open CTX-IP and copy the first five parties of the table under SITL-ADD-16 Section 4, in the same order, each with the values given for it (rule R04). Rule and Evidence ref fill themselves: R04 and SITL-ADD-16 Section 4."},
        6: {"tool": "Policies › New from Template",
            "w": "A party's requirement will be met through the ISMS. What do you record? Then: fill Addressed through the ISMS? for all five parties of CTX-IP, naming which of each party's requirements the ISMS addresses (Clause 4.2 c)."},
    },
    # F2.1: LI-SCOPE (template T-LI-SCOPE) is worked in Policies › New from Template, its sections 6 and 7 as sheets of it.
    # `pages`: the Learn › Reference pages a step reads (its toolbar dot and tag).
    "F2.1": {
        1: {"tool": "Policies › New from Template",
            "w": "Open template T-LI-SCOPE: it opens in Policies › New from Template (columns Part · Statement · Source). Its first seven rows are the LearnTech Educational Solutions worked scope, for the Amsterdam office. Find in it the six parts every scope has: organisational units, locations, services, technology, interfaces and dependencies, and exclusions with their justification."},
        2: {"w": "The Manila office's payroll is run by an outside provider. How does it appear in the ISMS scope?"},
        3: {"tool": "Policies › New from Template", "pages": ["TSA-16 Office_Deployment"],
            "w": "Fill sections 1–4 of LI-SCOPE for Manila (rule L03): units, location (SITL-ADD-16 Section 2), services (SITL-ADD-16 Section 1.1) and technology (TSA-16 Office_Deployment, in Learn › Reference pages). Carry over every CTX-IP requirement marked \"Addressed through the ISMS\". For each line choose the statement and the source you read it in."},
        4: {"tool": "Policies › New from Template",
            "w": "A manager wants to leave out the Manila customer-support floor to make certification quicker. The floor handles customer data that is in scope. What do you advise? Then: fill section 5 of LI-SCOPE, Exclusions: each exclusion with its justification, or None."},
        5: {"tool": "Policies › New from Template", "pages": ["Ref-ISMS processes"],
            "w": "For each of the ten ISMS processes in section 6 of LI-SCOPE, choose the owner role, and the process's inputs and outputs. Guidance: rule L04, Ref-ISMS processes and the GRC Charter Section 16 RACI."},
        6: {"tool": "Policies › New from Template",
            "w": "Fill section 7 of LI-SCOPE from SITL-ADD-16 Section 9.1 and the payroll provider of step 2: for each interface or dependency, choose what crosses the scope's boundary (information, a service, people, or nothing where both ends are in the scope) and the Annex A control that governs it (for example A.5.20 for a supplier agreement, A.5.14 for information transfer)."},
    },
    # F2.2: LI-GAP (template T-LI-PLAN, sheets Gap and Plan) is worked in Frameworks › Gap Finder; the Maturity Model is a
    # Learn › Reference page (his "Learn › Review module" does not exist), written once for the sprints, T11.2 and T12.1.
    "F2.2": {
        1: {"tool": "Frameworks › Gap Finder", "ds": ["GAP-25"], "pages": ["Ref-Maturity Model"],
            "w": "Open dataset GAP-25 and template T-LI-PLAN, sheet Gap: it opens in Frameworks › Gap Finder (25 rows, 4.1 to 10.2; columns A Clause · B What was found at Manila · C Status · D Maturity level · E Reason). The rows of clauses 4.1 and 4.2 are worked examples with status, level and reason. Find those three in them, and read the Maturity Model (Ref-Maturity Model, in Learn › Reference pages)."},
        2: {"tool": "Frameworks › Gap Finder", "ds": ["GAP-25"],
            "w": "For each of the 23 remaining clauses, decide its status in column C from what was found at Manila, held against what the clause requires. Guidance: rule L13."},
        3: {"tool": "Frameworks › Gap Finder", "ds": ["GAP-25"], "pages": ["Ref-Maturity Model"],
            "w": "For each clause, decide its maturity level in column D from what was found. Guidance: the Maturity Model's questions (Ref-Maturity Model, in Learn › Reference pages). 6.1.2 is step 4's question."},
        4: {"pages": ["Ref-Maturity Model"],
            "w": "The notes for 6.1.2 say \"Risk assessments use the Group method in every office and are reviewed each year; no measures or targets.\" Which level is that?"},
        5: {"tool": "Frameworks › Gap Finder",
            "w": "Which gap do you put first? Then: list your top 3 gaps in sheet Plan with owner role and target date."},
    },
    # T3.1: LI-POL and POL-SET (template T-LI-POL) are worked in Policies › Review & Redline, the currency and gap review.
    # The policy portal extract (each policy's coverage, version and last approval) is a Learn › Reference page.
    "T3.1": {
        1: {"tool": "Policies › Review & Redline",
            "w": "Open template T-LI-POL: it opens in Policies › Review & Redline (columns Clause 5.2 item · Found/Gap · Section · Note), and SITL-POL-001 is in Policies › Policy Library. Its seven rows are the items of Clause 5.2 a)–g), each with a note on what to look for in the policy. Before you check the policy, find the item each of three everyday situations tests."},
        2: {"tool": "Policies › Review & Redline",
            "w": "For each Clause 5.2 item, decide whether SITL-POL-001 meets it: Found or Gap, with the section you cite. Guidance: rule L08 — Found only when you can cite the section."},
        5: {"tool": "Policies › Review & Redline",
            "w": "Which is evidence of top management commitment (Clause 5.1)? Then: on sheet Leadership of LI-POL, locate five leadership evidence items in your inputs and record them with their source."},
        6: {"tool": "Policies › Review & Redline", "pages": ["Ref-Policy portal"],
            "w": "Open sheet Policy set. For each topic-specific policy listed in ISO/IEC 27002:2022 Section 5.1, find the SITL policy that covers it in SITL-POL-000 Section 3 and Ref-Policy portal (Learn › Reference pages), and decide its status (Current / Overdue / Missing). Its owner, approver and last review date fill themselves from the policy you choose."},
    },
    # T3.2, the first control sprint: LI-RACI (template T-LI-POL, sheet RACI) in Policies › Review & Redline; the tracker
    # T-LI-CIT in Frameworks › Map Control and the evidence packs in Evidence › Link to Control, the screens every sprint
    # uses. The LI task library and the fixed questions are Learn › Reference pages (his "Learn › Lead Implementer").
    "T3.2": {
        1: {"tool": "Policies › Review & Redline", "pages": ["Ref-ISMS processes"],
            "w": "Open sheet RACI of template T-LI-POL: it opens in Policies › Review & Redline. For each of the ten ISMS processes from LI-SCOPE section 6, choose who is Responsible and who is Accountable, using Ref-ISMS processes and the GRC Charter Section 16 RACI. Consulted and Informed are filled from the same rows. Only one Accountable per process."},
        2: {"tool": "Policies › Review & Redline",
            "w": "Clause 5.3 requires top management to assign the responsibility and authority for two things. Which? Then: record the role holding each in the RACI header."},
        3: {"tool": "Frameworks › Map Control", "ds": ["SPR-01"], "pages": ["LI-A.5.1", "LI-A.5.2", "LI-A.5.3", "LI-A.5.4", "LI-Q fixed questions"],
            "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's controls: A.5.1, A.5.2, A.5.3, A.5.4. Its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.5.1 to LI-A.5.4 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-01, what was observed at the Manila office for each control, is the tracker's Observed column."},
        4: {"tool": "Frameworks › Map Control", "ds": ["SPR-01"], "pages": ["LI-A.5.1", "LI-A.5.2", "LI-A.5.3", "LI-A.5.4"],
            "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-01. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
        5: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
            "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
        6: {"tool": "Evidence › Link to Control", "ds": ["SPR-01"], "pages": ["LI-A.5.2", "LI-A.5.3"],
            "w": "Complete every sub-task of LI-A.5.2 and LI-A.5.3 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-01. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
        7: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.1", "LI-A.5.4", "LI-Q fixed questions", "Ref-Maturity Model"],
            "w": "For A.5.1 and A.5.4: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3, and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
        8: {"pages": ["LI-A.5.3"],
            "w": "The Manila finance team has three people; one of them both creates suppliers and approves their payments. What do you record for A.5.3?"},
    },
}
# T11.1: LI-KPI and KPI-DASH (template T-LI-KPI, sheets Cards and Dashboard) are worked in Policies › New from Template. The
# trackers' controls (no levels), the Control Maturity Matrix extract (CMM-L4) and the baseline data (KPI-BASE) are web/src/lib/desk/li-kpi.json.
STEPS["T11.1"] = {
    1: {"tool": "Policies › New from Template",
        "w": "Open template T-LI-KPI: it opens in Policies › New from Template. Sheet Cards (LI-KPI) holds one measure card per row: what is measured, method (numerator ÷ denominator), data source, when measured, who measures, when results are analysed and evaluated, who analyses and evaluates, where the target is set, and the target and threshold. Its first row is the LearnTech Educational Solutions worked card. Read it and find three of its fields by what they are for."},
    2: {"w": "What must the organisation determine under Clause 9.1?"},
    3: {"w": "The methods selected should produce results that are what, to be considered valid (Clause 9.1)?"},
    4: {"tool": "Policies › New from Template", "ds": ["CMM-L4"],
        "w": "Sort your trackers by maturity level and pick the five controls with the lowest level: the Control list of sheet Cards gives every control of CIT-S1 to CIT-S13 with its level. For each, write a measure card from its Level 4 measures in the Control Maturity Matrix (dataset CMM-L4): the measure, numerator and denominator, data source, when and who fill from the matrix; choose the target and threshold."},
    5: {"pages": ["Ref-Maturity Model"],
        "w": "Which shows Level 4 rather than Level 3 (Ref-Maturity Model)?"},
    6: {"tool": "Policies › New from Template", "ds": ["KPI-BASE"],
        "w": "Open KPI-DASH, sheet Dashboard of T-LI-KPI. For each of your five measures, calculate the current value from your data (dataset KPI-BASE: your trackers, LI-OBJ and VUL-TEST, for example the SLA compliance % from VUL-TEST), see it against target and threshold, and choose the one line on what management should do."},
}
PANELS = {
    "F1.2": {"tool": "Frameworks › Framework Library (T-LI-FAM)", "stamp": "Template", "kind": "table", "pl": {}},
    "F1.3": {"tool": "Policies › New from Template (CTX-ISS and CTX-IP)", "stamp": "Template", "kind": "table", "pl": {}},
    "F2.1": {"tool": "Policies › New from Template (LI-SCOPE)", "stamp": "Template", "kind": "table", "pl": {}},
    "F2.2": {"tool": "Frameworks › Gap Finder (LI-GAP)", "stamp": "Template", "kind": "table", "pl": {}},
    "T3.1": {"tool": "Policies › Review & Redline (LI-POL and POL-SET)", "stamp": "Template", "kind": "table", "pl": {}},
    "T3.2": {"tool": "Frameworks › Map Control (CIT-S1)", "stamp": "Template", "kind": "table", "pl": {}},
    "T11.1": {"tool": "Policies › New from Template (LI-KPI and KPI-DASH)", "stamp": "Template", "kind": "table", "pl": {}},
}
TEMPLATES = {
    "T-LI-FAM": ["F1.2", "LI-FAM", "The ten ISO/IEC 27000-family documents pre-listed with what each is for and who uses it; type (rule L01) and where the programme uses it chosen per row; sheet PDCA for clauses 4–10 (rule L02); two LearnTech Educational Solutions worked rows", "Frameworks › Framework Library"],
    "T-LI-CTX": ["F1.3", "CTX-ISS", "Internal and external issues of the organisation (Clause 4.1): A Issue, B Internal/External, C Category, D Effect on the ISMS's intended outcomes, E Source; three LearnTech Educational Solutions worked rows; GlobalConnect's four external issues, the six issues of dataset CTX-ISS-6 and the climate-change row", "Policies › New from Template"],
    "T-LI-SCOPE": ["F2.1", "LI-SCOPE", "ISMS scope statement (Clause 4.3) and process list (Clause 4.4), one line per part with its source: 1 organisational units, 2 location, 3 services, 4 technology, the interested-party requirements addressed, 5 exclusions with justification, 6 the ten ISMS processes with owner, inputs and outputs, 7 interfaces and dependencies with their Annex A control; the LearnTech Educational Solutions scope (Amsterdam) as a worked example", "Policies › New from Template"],
    "T-LI-PLAN": ["F2.2", "LI-GAP", "Clause gap analysis. Sheet Gap: the 25 requirements of clauses 4.1–10.2, each with what it requires (Task Library, Requirements sheet) and what was found at Manila (dataset GAP-25), its status (rule L13), maturity level (Ref-Maturity Model) and reason; rows 4.1 and 4.2 worked. Sheet Plan: the top three gaps with owner role and target date", "Frameworks › Gap Finder"],
    # T3.1 fills three sheets of it; T3.2 fills sheet RACI.
    "T-LI-POL": ["T3.1", "LI-POL", "ISMS policy check. Sheet Policy check: the seven items of Clause 5.2 a)–g), each Found or Gap (rule L08) with the section of SITL-POL-001 cited, and a note on what to look for. Sheet Leadership: eight statements read in the inputs, each judged as evidence of top management's commitment (Clause 5.1) or not, with its source. Sheet Policy set (POL-SET): the twelve topic-specific policies of ISO/IEC 27002:2022 Section 5.1, each with its SITL policy, owner, approver, last approval and status. Sheet RACI (LI-RACI, task T3.2): the ten ISMS processes, each with Responsible, Accountable, Consulted and Informed (GRC Charter Section 16), and a header naming who holds the two Clause 5.3 assignments", "Policies › Review & Redline"],
    # T3.2 … T10.2: one tracker kept across the control sprints (lib/desk/li-sprints.json, registers.ts citRegister).
    "T-LI-KPI": ["T11.1", "LI-KPI", "Measure cards and the ISMS measurement dashboard (Clause 9.1, ISO/IEC 27004). Sheet Cards (LI-KPI): one card per measure, with the control, what is measured, method (numerator ÷ denominator), data source, when measured, who measures, when results are analysed and evaluated, who analyses and evaluates, where the target is set, and the target and threshold; the LearnTech Educational Solutions worked card. Sheet Dashboard (KPI-DASH): each measure's current value from the data, its target and threshold, status (Green, Amber, Red), the LI-OBJ objective it reports on, and one line on what management should do; a LearnTech worked row", "Policies › New from Template"],
    "T-LI-CIT": ["T3.2", "CIT-S1", "Control implementation tracker, kept across the control sprints T3.2–T10.2: A Control, B Title, C Owner role, D Status, E Maturity level, F Evidence ref, G Gap / next action, with what each control requires (its LI task) and what the sprint's dataset observed; one LearnTech Educational Solutions worked row. Each sprint fills its own controls and hands them in (CIT-S1 … CIT-S13); earlier sprints' rows show as they stand", "Frameworks › Map Control"],
}
# Learn › Reference pages his F2.1 reads (`desk.pages`), set outright. TSA-16 Office_Deployment: his input "SITL-TSA-16 …
# Office_Deployment" sheet, which the platform holds by name only; an extract written from SITL-ADD-16 Sections 8.1 and 9
# (Manila and Warsaw). Ref-ISMS processes: the pack's page listed another set of processes, with owners (the step's
# answer) and L03's climate row; now his ten processes, the clause each serves, and where its owner is read.
PAGES = {
    "TSA-16 Office_Deployment": {"note": "Extract of TSA-16_GlobalConnect_Customer_Solutions.xlsx, sheet Office_Deployment: the systems deployed at the Manila head office and the Warsaw regional office, and how each is deployed.", "h": ["Office", "Layer", "System", "Deployment"], "r": [
        ["Manila, Philippines", "Facility", "Manila data centre: core network and infrastructure", "On premises"],
        ["Manila, Philippines", "Network", "Network access control systems", "On premises"],
        ["Manila, Philippines", "Voice", "PBX/telephony infrastructure and call recording servers", "On premises"],
        ["Manila, Philippines", "End user", "Call-centre workstations and headsets, CRM access terminals", "On premises"],
        ["Manila, Philippines", "Security", "PKI and secrets / key management", "On premises"],
        ["Manila, Philippines", "Security", "SIEM and log analytics platform", "Hybrid: on premises at Manila and cloud"],
        ["Manila, Philippines", "Identity", "Identity and access management (IAM)", "Hybrid: on premises at Manila and cloud"],
        ["Manila, Philippines", "Collaboration", "Enterprise directory and email", "Hybrid: on premises at Manila and cloud"],
        ["Manila, Philippines", "Customer", "CRM platforms (Salesforce, HelpLoop)", "SaaS"],
        ["Manila, Philippines", "Operations", "Workforce management system and QA monitoring tools", "SaaS"],
        ["Manila, Philippines", "Voice", "VoIP and UCaaS platforms", "SaaS"],
        ["Manila, Philippines", "Delivery", "Production delivery platform", "SaaS"],
        ["Manila, Philippines", "HR", "HR and payroll systems (payroll is run by an outside provider)", "SaaS"],
        ["Warsaw, Poland", "End user", "Call-centre workstations and headsets", "On premises"],
        ["Warsaw, Poland", "Voice", "PBX/telephony infrastructure", "On premises"],
        ["Warsaw, Poland", "Customer", "CRM platforms (Salesforce, HelpLoop)", "SaaS"],
        ["Warsaw, Poland", "Delivery", "Production delivery platform", "SaaS"],
        ["Warsaw, Poland", "Data", "Client transaction data store", "Cloud (multi-region)"],
    ]},
    "Ref-ISMS processes": {"note": "The ten processes of the ISMS (Clause 4.4), the clauses or controls each serves, and where its owner is read. The GRC Charter, SITL-POL-000 and SITL-POL-001 are in Policies › Policy Library.", "h": ["ISMS process", "ISO/IEC 27001:2022", "Where its owner is read"], "r": [
        ["Context and scope review", "Clauses 4.1–4.3", "SITL-POL-001 Section 5: the organisation's role that builds the policy into the ISMS and the organisation addendum, where the scope is recorded"],
        ["Risk assessment and treatment", "Clauses 6.1.2, 6.1.3, 8.2, 8.3", "GRC Charter Section 16, rows Enterprise risk assessment and Risk register & treatment: the role marked R"],
        ["Policy management", "Clause 5.2; Annex A 5.1", "GRC Charter Section 16, row Policy lifecycle: the role marked R"],
        ["Document control", "Clause 7.5", "GRC Charter Section 16, row Policy lifecycle: the role marked R (SITL-POL-000 Section 7 runs documents through that lifecycle)"],
        ["Competence and awareness", "Clauses 7.2, 7.3", "GRC Charter Section 16, row Awareness & training: the role marked R"],
        ["Incident management", "Annex A 5.24–5.28", "GRC Charter Section 16, row Incident & breach response: the role marked R (two roles are; the DPO's part is personal-data breaches)"],
        ["Supplier security", "Annex A 5.19–5.22", "GRC Charter Section 16, row Third-party risk: the role marked R"],
        ["Internal audit", "Clause 9.2", "GRC Charter Section 16, row Internal audit: the role marked R"],
        ["Management review", "Clause 9.3", "SITL-POL-001 Section 6.1: the role that holds the review and records its decisions"],
        ["Corrective action", "Clause 10.2", "SITL-POL-001 Section 6.1 and GRC Charter Section 13: the role that tracks each decision and finding to closure"],
    ]},
    # F2.2 and every later rating (the sprints' column E, T11.2, T12.1): his "Maturity Model, Levels 1–4 (Learn › Review
    # module)", which the platform did not hold. Written from the GRC Charter Section 3.3 (its CMMI-style scale: Level 3 Defined,
    # current for every organisation; Level 4 Quantitatively Managed and Level 5 Optimizing, targets; the page says why one office's
    # clause can rate below the Group's Level 3) and his sprints' guidance (documented? approved? applied organisation-wide? records?
    # reviewed?). The LearnTech examples are written.
    "Ref-Maturity Model": {"note": "The maturity scale of the GRC Charter Section 3.3 (CMMI-style), Levels 1 to 4, used here to rate how one office practises a clause or a control, from what was found. Ask its questions in order and stop at the first No. 1) Is there a documented, approved way of doing it, and records that it is done? No → Level 1. 2) Is it the Group's standard way, done the same in every office, and reviewed at least once a year? No → Level 2. 3) Is it measured against targets, with the results tracked and acted on? No → Level 3; Yes → Level 4. The Charter puts every Group organisation at Level 3, Defined, and aims for Level 4, Quantitatively Managed, then Level 5, Optimizing: that rates the Group's GRC processes (the Charter, the Group Policy Library, the common control framework), which every organisation has adopted. An office's own practice of one clause can sit below it: where the office still does a requirement its own way, without records, or not at all, that clause rates Level 1 or 2 even though the Group stands at Level 3. Level 5 is the Group's aim for its programme as a whole and is not used to rate one clause. Status (rule L13) and level are separate questions: the level rates how what is in place is done.", "h": ["Level", "Name", "What you find", "Example (LearnTech Educational Solutions, Amsterdam)"], "r": [
        ["Level 1", "Initial", "Done ad hoc, or not at all: no documented, approved way, or no records that it is done.", "Access to the learning platform is granted by whoever is asked, with no written rule and no record."],
        ["Level 2", "Managed", "Documented, approved and done with records, but the office's own way, or never reviewed.", "Amsterdam keeps its own backup procedure, approved by its IT lead, with backup logs; no other office uses it, and it has never been reviewed."],
        ["Level 3", "Defined", "The Group's standard way, documented and approved, done the same in every office, with records, and reviewed at least once a year.", "Every LearnTech office runs the Group incident procedure, with incident records, and the Group reviews it each year."],
        ["Level 4", "Quantitatively Managed", "Level 3, and measured against targets: the results are tracked and acted on.", "Phishing training runs the Group way, and the click rate is reported each month against a target of under 5%; a miss triggers extra training."],
    ]},
    # T3.1 step 6 (and step 3's situation): what each Group policy covers, its version and its last approval, which SITL-POL-000
    # Section 3 does not hold and his step reads. Written: the coverage lines in our words from the titles, and the
    # versions and dates (the policies on the Policy Library's shelf keep their own 2026-10-01; the others were carried over).
    "Ref-Policy portal": {"note": "Extract of the SITL policy portal, taken on 19 October 2026: each Group policy's ID, what it covers, its current version and the date that version was last approved. A policy carried over from before the library's issue on 1 October 2026 keeps its last approval date until it is reviewed and approved again. Titles and owners are in SITL-POL-000 Section 3 (Policies › Policy Library).", "h": ["ID", "What it covers", "Version", "Last approved"], "r": [
        ["SITL-POL-001", "The Group's direction for information security, its objectives and the ISMS", "1.0", "2026-10-01"],
        ["SITL-POL-002", "Enterprise risk: appetite, assessment and treatment", "1.0", "2026-10-01"],
        ["SITL-POL-003", "The inventory and ownership of information and other assets, and the return of assets", "2.1", "2026-03-16"],
        ["SITL-POL-004", "Classifying information, and handling it by its classification: labelling, storage and disposal", "1.0", "2026-10-01"],
        ["SITL-POL-005", "Acceptable use of the Group's information, e-mail, internet and social media by the workforce", "1.3", "2026-05-04"],
        ["SITL-POL-006", "Granting, reviewing and removing access; identities, authentication and privileged access", "1.0", "2026-10-01"],
        ["SITL-POL-007", "When to encrypt, approved algorithms, and the management of keys and certificates", "1.2", "2025-11-10"],
        ["SITL-POL-008", "Secure areas, entry controls, the siting and protection of equipment, and environmental threats to premises", "1.1", "2024-08-14"],
        ["SITL-POL-009", "IT operations: operating procedures, change and capacity management, malware protection, backup, logging and monitoring", "2.0", "2026-02-09"],
        ["SITL-POL-010", "Technical vulnerabilities: scanning, patching deadlines and penetration tests", "1.0", "2026-10-01"],
        ["SITL-POL-011", "Network security and segregation, network services, and the transfer of information by any means, inside and outside the Group", "1.4", "2025-09-29"],
        ["SITL-POL-012", "Security in the development life cycle: secure coding, security testing and separate environments", "1.1", "2026-06-22"],
        ["SITL-POL-013", "Supplier and third-party risk, from due diligence to exit", "1.0", "2026-10-01"],
        ["SITL-POL-014", "Detecting, reporting, responding to and learning from security incidents, and breach notification", "1.0", "2026-10-01"],
        ["SITL-POL-015", "Business continuity, ICT readiness and disaster recovery", "1.2", "2026-04-13"],
        ["SITL-POL-016", "Identifying and meeting legal, regulatory and contractual requirements", "1.0", "2026-10-01"],
        ["SITL-POL-017", "Protecting personal data and privacy", "1.0", "2026-10-01"],
        ["SITL-POL-018", "Keeping and disposing of records", "1.1", "2026-01-12"],
        ["SITL-POL-019", "Screening, terms of employment, the disciplinary process and leavers", "1.2", "2025-12-01"],
        ["SITL-POL-020", "Security awareness, training and culture", "1.0", "2026-10-01"],
        ["SITL-POL-021", "Using and securing cloud services", "1.0", "2026-10-01"],
        ["SITL-POL-022", "The use and governance of artificial intelligence", "1.0", "2026-10-01"],
        ["SITL-POL-023", "Security of operational technology and industrial control systems", "1.0", "2026-07-06"],
        ["SITL-POL-024", "Conduct and data in the mentorship programme", "1.0", "2026-10-01"],
    ]},
}
# His dataset CTX-ISS-6 ("six issue statements for Manila with internal/external key"): the statements and their effect,
# never the key (backend/scripts/li101_written.json, F1.3-3). The same rows are the CTX-ISS sheet's (registers.ts); main()
# asserts the two agree.
DATASETS = {
    "CTX-ISS-6": {"h": ["Issue", "Effect on the ISMS's intended outcomes"], "r": [
        ["Agents on some client accounts share CRM log-ins to keep call-handling times down", "Actions on client data cannot be traced to one agent, which weakens accountability and any breach investigation"],
        ["Phishing and pretext calls aimed at call-centre agents are rising across the BPO sector", "Agents may be talked into disclosing client customer data, a threat to its confidentiality"],
        ["Clients send security questionnaires and audit the data-protection controls once a year", "A finding in a client audit can cost a contract, so controls must be evidenced all year round"],
        ["Security awareness training for new agents is given once, at induction, with no refresher", "Agents forget what they learned, so phishing and data-handling mistakes become more likely"],
        ["The telecom carriers set the connectivity service levels of the Manila centres", "An outage at a carrier stops calls, a threat to the availability of client services"],
        ["Day-to-day ownership of the ISMS at the Manila office is not assigned to any role", "Nobody drives the ISMS between audits, so actions stall and evidence goes out of date"],
    ]},
    # F2.2 (his "notes per clause 4.1–10.2 for Manila with status and maturity key"): what was found at Manila, never the key
    # (backend/scripts/li101_written.json, F2.2-2 and F2.2-3). The same notes are column B of sheet Gap (registers.ts).
    "GAP-25": {"h": ["Clause", "What was found at the Manila office"], "r": [
        ["4.1 Understanding the organization and its context", "The issues are recorded in CTX-ISS on the Group template T-LI-CTX, the way every GlobalConnect office records them, climate change included. The Compliance Manager reviews the list every six months, and the record of each review is kept."],
        ["4.2 Understanding the needs and expectations of interested parties", "The interested parties are recorded in CTX-IP, copied from the Group table in SITL-ADD-16 Section 4. The client contracts and data-protection agreements, which hold most of Manila's requirements, have not been read into it. The Manila team keeps the register its own way, and it has never been reviewed."],
        ["4.3 Determining the scope of the information security management system", "A scope statement for Manila is drafted in LI-SCOPE: units, location, services, technology, interfaces and exclusions. It is a draft: neither the Org CEO nor the Group CISO has approved it, and nothing yet records it as the ISMS's scope."],
        ["4.4 Information security management system", "Manila runs seven of the ten ISMS processes of the Group's process model, with records. Internal audit, management review and corrective action have never run there. Nobody has reviewed the set of processes at Manila."],
        ["5.1 Leadership and commitment", "The Org CEO approved SITL-ADD-16 with the Group CISO, effective 1 October 2026, and signs a yearly ISMS commitment statement, as every Group organisation's CEO does. The ISMS budget is in the approved plan, and the minutes of the CEO's quarterly security briefings to Manila managers are kept. The Group reviews the commitment each year."],
        ["5.2 Policy", "SITL-POL-001, the Group information security policy, applies at Manila through SITL-ADD-16, the same policy in every office. It is approved by the Group GRC Steering Committee and kept under document control, with a yearly review. Two things the clause asks for are missing: nothing records that it was communicated to the workforce (its document control shows no communication record attached), and it is classified Internal, with no way set for clients or other interested parties to obtain it. Nobody measures how well staff know it."],
        ["5.3 Organizational roles, responsibilities and authorities", "The GRC Charter Section 16 sets the Group's roles, but at Manila day-to-day ownership of the ISMS is not assigned to any role, and the Manila job descriptions say nothing about security responsibilities. No record shows the roles were communicated at Manila."],
        ["6.1.1 Actions to address risks and opportunities: general", "Manila's own risk-planning sheet turns the issues of CTX-ISS and the requirements of CTX-IP into risks, approved by the Org CISO. It records no opportunities and no way of evaluating whether the actions worked. It has not been reviewed since it was written."],
        ["6.1.2 Information security risk assessment", "Risk assessments use the Group method in every office and are reviewed each year; no measures or targets."],
        ["6.1.3 Information security risk treatment", "A risk treatment plan for Manila names an owner and a date for each risk, and the risk owners' approval is recorded. The Statement of Applicability is the Group's generic one, not yet worked out from Manila's own risks. The plan is Manila's own sheet and has not been reviewed."],
        ["6.2 Information security objectives and planning to achieve them", "Manila's four information security objectives for 2026 were set from the risk assessment and approved by the Org CEO with targets, owners and dates, by the Group procedure in SITL-POL-001 Section 6.2, as in every organisation. Progress is measured each quarter on the objectives dashboard against the Group's target of 80% on track, and an objective that falls behind gets a corrective plan: two did in the second quarter. The objectives themselves are reviewed each year."],
        ["6.3 Planning of changes", "Changes to the ISMS are made as they come, decided by whoever asks for them, with no documented way of planning them and no record of most. Only one change, the SIEM's move to a hybrid set-up, was planned with a written impact note."],
        ["7.1 Resources", "The ISMS's resources for Manila (the CISO office, three GRC analysts, tools and a training budget) are approved in the Group's yearly budget cycle, the same way for every organisation, and the needs are reviewed each year. Nothing is measured against a target."],
        ["7.2 Competence", "Manila keeps its own list of the skills each security role needs, approved by the Org CISO, and records of the training each person attended. Nobody checks whether the training made people competent, and the list has never been reviewed."],
        ["7.3 Awareness", "New agents get security awareness training once, at induction, from Manila's own slide deck, with attendance recorded; there is no refresher. In a spot check, four of ten agents could not say where to report a suspicious call. The deck has never been reviewed."],
        ["7.4 Communication", "What to communicate about the ISMS, when, to whom and how is set in the Group communication plan, which every office follows. Manila sends the monthly security bulletin and the quarterly client updates, with records, and the plan is reviewed each year."],
        ["7.5 Documented information", "The ISMS documents sampled in the Group library follow the Group document-control procedure (SITL-POL-000 Section 7): each has an ID, version, approver and review date. Retention and disposal are reviewed each year. The Manila IT team also keeps its own operating procedures on the office wiki, outside the library: the pages the analysis opened carry no version, owner or approval date."],
        ["8.1 Operational planning and control", "The Group procedures say how the ISMS processes are run, but Manila keeps no record that they were carried out as planned. The payroll that the outside provider runs is not controlled: nobody checks the provider's work against the agreement."],
        ["8.2 Information security risk assessment", "The Manila risk assessment was performed in March 2026 on the Group method, the same way as in every office, with the results in the risk register and the next yearly run booked for March 2027. It was not performed again when the office took on healthcare-claims clients in August 2026, a significant change, so no health-data risks are on the register."],
        ["8.3 Information security risk treatment", "Manila tracks its treatment actions on its own tracker: 14 of 22 are done with evidence, and eight are overdue with no new date. The tracker has never been reviewed."],
        ["9.1 Monitoring, measurement, analysis and evaluation", "Manila reports the Group's KPIs each quarter, with records, but has not set what else it monitors, by which methods, or who analyses and evaluates the results and when. The reports are filed; nobody reviews them or acts on them."],
        ["9.2 Internal audit", "No internal audit of the Manila ISMS has been held and none is planned: there is no audit programme, no auditor named and no audit report."],
        ["9.3 Management review", "No management review has covered the Manila ISMS, and none is scheduled. There are no minutes and no decisions on record."],
        ["10.1 Continual improvement", "Improvements are made one at a time, when a client asks or after an incident. Nothing records that the ISMS as a whole is being made more suitable, adequate or effective, and nobody is asked to look for improvements."],
        ["10.2 Nonconformity and corrective action", "No nonconformity is identified or recorded at Manila: there is no log, no corrective-action procedure in use and nobody assigned to deal with nonconformities."],
    ]},
}
# The control sprints (T3.2 … T10.2): his "Lead Implementer task library (Learn › Lead Implementer)", fixed questions LI-Q1–
# LI-Q8 and datasets SPR-01 … SPR-13, none of which the platform held. One source, web/src/lib/desk/li-sprints.json, which
# registers.ts reads for the tracker and the evidence packs: here each control becomes a Learn › Reference page (LI-A.<control>),
# the questions a page of their own, and each sprint's observations its dataset. Platform-written, logged (T3.2).
SPRINTS = json.loads((WEB / "src" / "lib" / "desk" / "li-sprints.json").read_text(encoding="utf8"))
for _c, _x in SPRINTS["controls"].items():
    PAGES[f"LI-{_c}"] = {
        "note": f"LI-{_c} · {_x['title']}. ISO/IEC 27001:2022 Annex A control {_c[2:]}; its guidance is ISO/IEC 27002:2022 Section {_x['guide']}. Owner role: {_x['owner']}. What it requires: "
        + " ".join(f"{i}) {r}" for i, r in enumerate(_x["requires"], 1))
        + f" Evidence focus: {_x['focus']} Each sub-task below produces one evidence item; sub-task 01 is the first. Unsure? Ask the fixed questions LI-Q1 to LI-Q8 (LI-Q fixed questions).",
        "h": ["Sub-task", "What you do", "Evidence item it produces"],
        "r": [[f"LI-{_c}-{i:02d}", what, item] for i, (what, item, _ext) in enumerate(_x["subs"], 1)],
    }
PAGES["LI-Q fixed questions"] = {"note": "The eight questions a Lead Implementer asks of every control in a sprint, and where each answer is found.", "h": ["Question", "Ask", "Where to look"], "r": SPRINTS["fixed"]}
SPRINT_DS = set()
for _s in SPRINTS["sprints"]:
    SPRINT_DS.add(_s["ds"])
    DATASETS[_s["ds"]] = {"h": ["Control", "What was observed at the Manila office"], "r": [[f"{c} {SPRINTS['controls'][c]['title']}", _s["observed"][c]] for c in _s["controls"]]}
# T11.1 (his "Control Maturity Matrix, Level 4 measures" and "your data"): datasets read by registers.ts from li-kpi.json too.
KPI = json.loads((WEB / "src" / "lib" / "desk" / "li-kpi.json").read_text(encoding="utf8"))
DATASETS["CMM-L4"] = {"h": ["Control", "Level 4 measure", "Method: numerator ÷ denominator", "Data source at Manila", "Measured", "Measured by", "Target set in"],
                      "r": [[f"{r[0]} {KPI['titles'][r[0]]}", *r[1:]] for r in KPI["matrix"]]}
DATASETS["KPI-BASE"] = {"h": ["Control", "Data at 30 November 2026"], "r": [[f"{c} {KPI['titles'][c]}", v] for c, v in KPI["base"].items()]}
SPRINT_DS.update({"CMM-L4", "KPI-BASE"})

# His rule numbers (F1.2: "Rules L01 (document types) and L02 (PDCA placement)"); the pack had them the other way round,
# and L02 knew two types where his step decides four.
RULES = {
    "L01": ["Document types", "Decide each document's type from what it is for and who uses it. Requirements standard (certifiable): it sets the requirements an organisation's management system shall meet, and an accredited certification body can certify the organisation against it. Requirements for certification and audit bodies: it sets the requirements a body that audits and certifies management systems shall meet, not requirements for the organisations it certifies. Guidance standard: it gives guidance or guidelines (on controls, implementation, risk, measurement or auditing) and holds no requirements to certify against. Vocabulary: it gives the overview and the terms and definitions the family uses."],
    # His F2.1 cites L03 (scope) and L04 (processes); the pack's texts were the old T3.1's (copy owners from a page that
    # gave them, the first 3 TSA integrations, a Group climate decision).
    "L03": ["Scope content", "Write the ISMS scope (Clause 4.3) for the office in hand, one line per part, each with the source it was read in: the organisational units, the location, the services and the technology it covers; the interested parties' requirements the ISMS addresses (CTX-IP); each exclusion with its justification, or None; and the interfaces and dependencies with activities other organisations perform, each with the Annex A control that governs it."],
    "L04": ["ISMS process list", "List the ten ISMS processes (Clause 4.4), each with its owner, inputs and outputs. The owner is the role that runs the process: read it where Ref-ISMS processes (Learn › Reference pages) says, for most processes the role marked R on its row of the GRC Charter Section 16 RACI (the role abbreviations are spelled out under the table). The inputs are what the process works from; the outputs are what it hands on."],
    # His F2.2 cites L13 (clause rating: Fully, Partially or Not met); the pack's L13 was the old Conforms/Partial/Gap lookup.
    "L13": ["Clause rating", "Rate each requirement from what was found, held against what the clause requires. Fully met: everything the clause requires is in place at the office, with the evidence it asks for (approved documents, records). Partially met: some of it is in place, or it is in place but not approved, not done everywhere it should be, or without its records. Not met: none of it is in place."],
    # His T3.1 cites L08 ("Found only when you can cite the section"); the pack's L08 searched for a key word.
    "L08": ["Policy check (Clause 5.2)", "Check the information security policy against Clause 5.2 a)–g), one item at a time. Found only when you can cite the section of the policy that meets the item: the section whose own words say it. Where a statement points on to another section (a procedure, the document control), cite the statement. What an office reports doing counts only where the policy or its record shows it. Gap: no section meets the item, and its section is None."],
    "L02": ["PDCA placement","Place each clause of ISO/IEC 27001 by what it does in the cycle. Plan: establishing the ISMS — understanding where it operates, who leads it, what it must achieve and what it needs. Do: operating the ISMS as planned. Check: monitoring, measuring, auditing and reviewing it. Act: correcting and improving it."],
}
# Learn › Framework Quick Reference: what F1.2 steps 5 and 6 read (in our own words, not the standard's text).
QUICK_REF = [
    # F1.3 steps 4–6 (and the issues of steps 2–3).
    "<b>ISO/IEC 27001 Clause 4.1</b> Understanding the organization and its context. The organisation determines the external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its ISMS. In practice, external issues come from its environment (laws, regulators, technology, markets, threats) and internal ones from within (culture, structure, capabilities). Since Amd 1:2024 it also determines whether climate change is a relevant issue. The issues are used again when the scope is set (Clause 4.3) and when risks and opportunities are planned (Clause 6.1.1).",
    "<b>ISO/IEC 27001 Clause 4.2</b> Understanding the needs and expectations of interested parties. The organisation determines a) the interested parties relevant to its ISMS, b) their relevant requirements, and c) which of those requirements will be addressed through the ISMS. An interested party is a person or organisation that can affect, be affected by, or perceive itself to be affected by the ISMS, such as customers, employees or a regulator. A requirement is a need or expectation such a party holds; it can be legal, regulatory or contractual. The requirements are used again when the scope is set (Clause 4.3 b) and when risks and opportunities are planned (Clause 6.1.1). Since Amd 1:2024 a note adds that parties can have requirements related to climate change.",
    # F2.1 steps 2, 4 and 5.
    "<b>ISO/IEC 27001 Clause 4.3</b> Determining the scope of the information security management system. The organisation determines the boundaries and applicability of its ISMS to set its scope. In doing so it considers a) the external and internal issues of Clause 4.1, b) the requirements of Clause 4.2, and c) the interfaces and dependencies between the activities it performs itself and those that other organisations perform. The scope is available as documented information. In practice a scope statement names the organisational units, locations, services and technology it covers, and lists the interfaces and dependencies at its boundary. The certification body checks that the scope is credible for the information it claims to protect, and that every exclusion is justified.",
    "<b>ISO/IEC 27001 Clause 4.4</b> Information security management system. The organisation establishes, implements, maintains and continually improves an ISMS, including the processes it needs and how they interact (the 2022 edition added the processes and their interactions). In practice each process is written down with the owner who runs it, the inputs it works from and the outputs it hands on, so that one process's output can be followed into the next.",
    # T3.1 steps 4 and 5 (and the items of steps 1–2); step 6's topics.
    "<b>ISO/IEC 27001 Clause 5.1</b> Leadership and commitment. Top management shows leadership and commitment to the ISMS by a) making sure the information security policy and objectives are set and fit the organisation's strategic direction; b) building the ISMS's requirements into the organisation's processes; c) making sure the resources the ISMS needs are available; d) communicating why effective information security, and conforming to the ISMS, matter; e) making sure the ISMS achieves its intended outcomes; f) directing and supporting people to contribute to its effectiveness; g) promoting continual improvement; and h) supporting other managers to show leadership in their own areas. In practice the evidence is top management's own acts on record: approvals, budget and resource decisions, minutes, and the communications it issues.",
    "<b>ISO/IEC 27001 Clause 5.2</b> Policy. Top management establishes an information security policy that a) is appropriate to the purpose of the organisation; b) includes information security objectives or provides a framework for setting them; c) includes a commitment to satisfy the applicable requirements related to information security; and d) includes a commitment to continual improvement of the ISMS. The policy e) is available as documented information, f) is communicated within the organisation, and g) is available to interested parties, as appropriate. Items a)–d) are about what the policy says; e)–g) about what is done with it.",
    # T3.2 step 2 (and the RACI of step 1).
    "<b>ISO/IEC 27001 Clause 5.3</b> Organizational roles, responsibilities and authorities. Top management makes sure that the responsibilities and authorities for roles relevant to information security are assigned and communicated within the organisation. It assigns the responsibility and authority for a) ensuring that the ISMS conforms to the requirements of ISO/IEC 27001; and b) reporting on the performance of the ISMS to top management. A note adds that top management can also assign responsibilities for reporting on the ISMS's performance within the organisation. In practice the assignments are written down, for example in a RACI and in job descriptions, so that they can be shown to an auditor.",
    "<b>ISO/IEC 27001 A.5.1</b> Policies for information security (Annex A control 5.1; its guidance is ISO/IEC 27002:2022 Section 5.1). The information security policy and the topic-specific policies are defined, approved by management, published, communicated to the relevant staff and interested parties, who acknowledge them, and reviewed at planned intervals and when significant changes occur. ISO/IEC 27002 Section 5.1 gives example topics for topic-specific policies: access control; physical and environmental security; asset management; information transfer; secure configuration and handling of user endpoint devices; networking security; information security incident management; backup; cryptography and key management; information classification and handling; management of technical vulnerabilities; and secure development.",
    "<b>ISO/IEC 27001 Clause 6.1.3</b> Information security risk treatment. The organisation chooses how to treat each risk and determines the controls that treatment needs, from any source (b). It then compares those controls with Annex A to verify that no necessary control has been omitted (c): Annex A is a list to check against, not a list to adopt whole. It records the result in a Statement of Applicability: the necessary controls, why each is included, whether each is implemented, and why any Annex A control is excluded (d). It formulates a risk treatment plan (e), and obtains the risk owners' approval of the plan and their acceptance of the residual information security risks (f). Notes to the clause add that the organisation can design controls itself or take them from any source, and that the controls in Annex A are not exhaustive: further controls are added where they are needed.",  # e), f) and the notes: T5.1 steps 3–5
    # T11.1 steps 2 and 3 (and the measure cards of step 4).
    "<b>ISO/IEC 27001 Clause 9.1</b> Monitoring, measurement, analysis and evaluation. The organisation determines a) what needs to be monitored and measured, including information security processes and controls; b) the methods for monitoring, measurement, analysis and evaluation, as applicable, to ensure valid results: the methods selected should produce comparable and reproducible results to be considered valid; c) when the monitoring and measuring is performed; d) who monitors and measures; e) when the results are analysed and evaluated; and f) who analyses and evaluates them. Documented information is available as evidence of the results. The organisation evaluates the information security performance and the effectiveness of the ISMS. In practice each measure is written on a measure card that answers a) to f), with its formula, target and threshold, and its results go to the management review (Clause 9.3).",
    "<b>ISO/IEC 27004</b> Information security management: monitoring, measurement, analysis and evaluation (ISO/IEC 27004:2016). Guidance for meeting Clause 9.1 of ISO/IEC 27001; it holds no requirements to certify against. It explains what to measure (performance measures, about how well a process or activity is carried out, and effectiveness measures, about how far the ISMS and its controls achieve their intended outcomes), how a measure is built from an information need, with its formula, target and the criteria for deciding what a result means, and how results are analysed and reported. Its annex gives example measures.",
    "<b>ISO/IEC 27001:2022/Amd 1:2024</b> Climate action changes, published in February 2024. It adds one sentence to Clause 4.1: the organisation shall determine whether climate change is a relevant issue. It adds a note to Clause 4.2: relevant interested parties can have requirements related to climate change. Nothing else changes: the clauses are still 4 to 10 and Annex A still has its 93 controls.",
]

# ---- T5.1, the risk treatment plan (LI-RTP, template T-LI-RTP) and the acceptance request (RSK-ACC, template T-ACC), worked
# in Risk Register › Assign Owner, which held the old programme's owner list and now opens in week 5. Platform-written, logged
# (T5.1): the three risks R-16-HQ-16 … 18 (T4.2's, which is not built: its builder follows them), SITL-POL-002's text
# (public/desk/docs), rule L12 as an ordered question, and the step texts below (his, tightened for the screen).
STEPS["T5.1"] = {
    1: {"tool": "Risk Register › Assign Owner",
        "w": "Open template T-LI-RTP: it opens in Risk Register › Assign Owner (columns Risk · Option · Controls · Annex A IDs · Owner · Due date · Residual · Approved by). Your three risks from RR-UPD are listed, R-16-HQ-16 to R-16-HQ-18, each with what LI-CHAIN records about it. Rows 1 and 2 are LearnTech Educational Solutions worked examples: read them, and find what a finished row holds."},
    2: {"tool": "Risk Register › Assign Owner",
        "w": "For each of your three risks, decide the treatment option. Guidance: rule L12 and SITL-POL-002 Section 6.1."},
    3: {"tool": "Risk Register › Assign Owner",
        "w": "For each risk you modify, decide which of the controls proposed for it are needed: they come from any source. Then compare each needed control with Annex A and record the Annex A ID that matches, so that no necessary control is left out (Clause 6.1.3)."},
    4: {"w": "One control you need comes from the NIST Cybersecurity Framework and is not in Annex A. May you use it?"},
    5: {"w": "Who approves the risk treatment plan and accepts the residual risks?"},
    6: {"tool": "Risk Register › Assign Owner",
        "w": "For each risk, the owner and the residual rating come over from RR-UPD and the approver from step 5. Record the due date (R08, SITL-ERM-001 Section 7), counted from the plan's date, 2 November 2026. For the risk you retain, fill the RSK-ACC columns as SITL-POL-002 Section 6.2 sets them: the reason, the expiry date, the re-assessment date and the approver (R36)."},
}
PANELS["T5.1"] = {"tool": "Risk Register › Assign Owner (LI-RTP)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-RTP"] = ["T5.1", "LI-RTP", "Risk treatment plan (Clause 6.1.3 e): per risk of RR-UPD its option (rule L12), the controls and their Annex A IDs (sheet Controls, Clause 6.1.3 c), owner, due date (rule R08), residual rating and approver, and the acceptance of a retained risk (RSK-ACC columns); two LearnTech Educational Solutions worked rows", "Risk Register › Assign Owner"]
TEMPLATES["T-ACC"] = ["T5.1", "RSK-ACC", "Risk acceptance request (SITL-POL-002 Section 6.2): the risk retained, its residual rating, the reason, the expiry date, the re-assessment date and the approver (rule R36)", "Risk Register › Assign Owner"]
# His L12 is "treatment options" (ISO/IEC 27005:2022); the pack's was a residual-score switch between two options and a lookup
# page that is gone. Written as questions asked in order (avoid before modify: an activity nobody needs is stopped, not
# controlled); the order is the platform's, logged.
RULES["L12"] = ["Treatment options", "Choose one option for each risk (ISO/IEC 27005:2022), from its residual score and the facts of the risk. Ask in order and stop at the first Yes. 1) Is the residual score within the appetite (SITL-ERM-001 Section 4: 11 for a LOW-criticality organisation)? Yes → Retain (accept): keep it as it is, monitor it, and raise an acceptance request (SITL-POL-002 Section 6.2). 2) Can the activity that causes the risk be stopped, or not started, without losing what the office needs it for? Yes → Avoid. 3) Can controls the office runs bring the likelihood or the impact down? Yes → Modify (reduce). 4) Otherwise → Share: another party, an insurer or a supplier under contract, carries part of the consequence. A Critical risk (20–25) is never retained (SITL-ERM-001 Section 7)."]

# ---- T4.1, the risk method and control sprint 2 (A.5.9–A.5.14). LI-RAM (template T-LI-RAM, the method card) is worked in
# Policies › New from Template; the sprint in Frameworks › Map Control and Evidence › Link to Control (li-sprints.json, SPR-02).
# Risk Register › Asset Register held the old CLS-6 (12 assets of four offices to classify), which his workbook does not have:
# it is his "SITL-TSA-16 Asset_System_Map sheet" now, the Manila extract the sprint reads. Platform-written, logged (T4.1).
STEPS["T4.1"] = {
    1: {"tool": "Policies › New from Template",
        "w": "Open the method card frame, template T-LI-RAM (one page): it opens in Policies › New from Template. From SITL-POL-002 and SITL-ERM-001 record, each with its source: the risk acceptance criteria, the criteria for performing assessments, the likelihood and impact scales of the 5×5 matrix, the appetite, who owns risks, who may accept them (R36) and where the records are kept."},
    2: {"w": "Clause 6.1.2 b) requires repeated risk assessments to produce what?"},
    3: {"w": "Who must be identified for each information security risk (Clause 6.1.2)?"},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-02"], "pages": ["LI-A.5.9", "LI-A.5.10", "LI-A.5.11", "LI-A.5.12", "LI-A.5.13", "LI-A.5.14", "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's controls: A.5.9, A.5.10, A.5.11, A.5.12, A.5.13, A.5.14. Its first row is the LearnTech Educational Solutions worked example, and sprint 1's rows follow as you left them. For each control, open its Lead Implementer task, LI-A.5.9 to LI-A.5.14 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-02, what was observed at the Manila office for each control, is the tracker's Observed column."},
    5: {"tool": "Frameworks › Map Control", "ds": ["SPR-02"], "pages": ["LI-A.5.9", "LI-A.5.10", "LI-A.5.11", "LI-A.5.12", "LI-A.5.13", "LI-A.5.14"],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-02. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    6: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    7: {"tool": "Evidence › Link to Control", "ds": ["SPR-02"], "pages": ["LI-A.5.9", "LI-A.5.12"],
        "w": "Complete every sub-task of LI-A.5.9 and LI-A.5.12 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-02 or the Manila asset extract (Risk Register › Asset Register). For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    8: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.10", "LI-A.5.11", "LI-A.5.13", "LI-A.5.14", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.5.10, A.5.11, A.5.13 and A.5.14: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3, and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    9: {"pages": ["LI-A.5.9"],
        "w": "Sales, the client relationship managers at Manila, use a cloud CRM that is not in the asset inventory. What do you do?"},
    10: {"w": "A dataset holds customer e-mail addresses. What is the lowest tier it may have? Guidance: SITL-STD-001 Section 2 and Section 5, rule R05."},
}
PANELS["T4.1"] = {"tool": "Policies › New from Template (LI-RAM)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-RAM"] = ["T4.1", "LI-RAM", "Risk assessment method card (Clause 6.1.2 a), one page: seven lines, each with its statement and the section it is read in: the risk acceptance criteria, the criteria for performing risk assessments, the likelihood and impact scales of the 5×5 matrix, the appetite, who owns a risk, who may accept it (rule R36) and where the records are kept", "Policies › New from Template"]
QUICK_REF.insert(next(i for i, p in enumerate(QUICK_REF) if p.startswith("<b>ISO/IEC 27001 Clause 6.1.3")),
    # T4.1 steps 2 and 3 (and the method card of step 1).
    "<b>ISO/IEC 27001 Clause 6.1.2</b> Information security risk assessment. The organisation defines and applies a risk assessment process that a) establishes and maintains information security risk criteria, including 1) the risk acceptance criteria and 2) the criteria for performing information security risk assessments; b) ensures that repeated risk assessments produce consistent, valid and comparable results; c) identifies the information security risks: 1) the risks of losing the confidentiality, integrity and availability of information within the scope of the ISMS, and 2) the risk owners; d) analyses the risks: the potential consequences, their realistic likelihood and the resulting levels of risk; and e) evaluates them: compares the results with the risk criteria and prioritises the risks for treatment. It keeps documented information about the process. In practice the criteria of a) are set once, on a method card, so that every assessment uses the same scales. (Summarised in our own words, not the standard's text.)")
# His "SITL-TSA-16 Asset_System_Map sheet": an extract written from SITL-ADD-16 Sections 7, 8 and 8.1 (the ten Mission Critical
# assets, their owners and labels) and TSA-16 Office_Deployment (the other systems). Owners of the systems 8.1 does not list,
# the healthcare-claims case files and the review date are platform-written.
ASSET_MAP = {"h": ["Asset ID", "Asset", "Department", "Owner", "Classification", "Criticality", "Hosting"], "r": [
    ["A-HQ-01", "Treasury management system", "Finance & Treasury (Group)", "Group Treasurer", "Client-Restricted", "Mission Critical", "SaaS (vendor-hosted)"],
    ["A-HQ-02", "Banking & payment files", "Finance & Treasury (Group)", "Chief Financial Officer", "Client-Restricted", "Mission Critical", "SaaS (vendor-hosted)"],
    ["A-HQ-03", "SIEM & log analytics platform", "Information Security (CISO Office)", "Chief Information Security Officer", "Client-Restricted", "Mission Critical", "Hybrid: on premises at Manila and cloud"],
    ["A-HQ-04", "Identity & access management (IAM)", "Information Security (CISO Office)", "Chief Information Security Officer", "Client-Restricted", "Mission Critical", "Hybrid: on premises at Manila and cloud"],
    ["A-HQ-05", "PKI & secrets / key management", "Information Security (CISO Office)", "Chief Information Security Officer", "Client-Restricted", "Mission Critical", "On premises: Manila data centre"],
    ["A-HQ-06", "Enterprise directory & email", "Corporate IT & Technology", "Chief Information Officer", "Client-Confidential", "Mission Critical", "Hybrid: on premises at Manila and cloud"],
    ["A-HQ-07", "Core network & infrastructure", "Corporate IT & Technology", "Head of Infrastructure", "Client-Confidential", "Mission Critical", "On premises: Manila data centre"],
    ["A-HQ-08", "Client data security controls", "Information Security & Privacy", "Head of Security & Privacy", "Client-Restricted", "Mission Critical", "Hybrid: on premises at Manila and cloud"],
    ["A-HQ-09", "Production delivery platform", "Service Delivery Operations", "Chief Delivery Officer", "Client-Restricted", "Mission Critical", "SaaS (vendor-hosted)"],
    ["A-HQ-10", "Client transaction data", "Service Delivery Operations", "Chief Delivery Officer", "Client-Restricted", "Mission Critical", "Cloud (multi-region)"],
    ["A-HQ-11", "CRM platforms (Salesforce, HelpLoop)", "Service Delivery Operations", "Chief Delivery Officer", "Client-Restricted", "Business Critical", "SaaS"],
    ["A-HQ-12", "Healthcare-claims case files", "Service Delivery Operations", "Chief Delivery Officer", "Client-Confidential", "Business Critical", "SaaS (on the production delivery platform)"],
    ["A-HQ-13", "Call recording servers", "Quality Assurance", "Chief Delivery Officer", "Client-Restricted", "Business Critical", "On premises: Manila data centre"],
    ["A-HQ-14", "QA monitoring tools", "Quality Assurance", "Quality Assurance Manager", "Client-Confidential", "Standard / Operational", "SaaS"],
    ["A-HQ-15", "VoIP and UCaaS platforms", "Corporate IT & Technology", "Head of Infrastructure", "Client-Confidential", "Business Critical", "SaaS"],
    ["A-HQ-16", "Workforce management system", "HR & Workforce Management", "HR & Workforce Management lead", "Internal", "Business Critical", "SaaS"],
    ["A-HQ-17", "HR and payroll systems", "HR & Workforce Management", "HR & Workforce Management lead", "Client-Confidential", "Business Critical", "SaaS"],
    ["A-HQ-18", "Call-centre workstations and headsets", "Corporate IT & Technology", "Chief Information Officer", "Internal", "Standard / Operational", "On premises"],
], "note": "Extract of TSA-16_GlobalConnect_Customer_Solutions.xlsx, sheet Asset_System_Map, as held in the Group Information Asset Register (SITL-POL-003): 18 of the Manila office's 81 registered assets, each with its owner role, its classification in GlobalConnect's labels (SITL-ADD-16 Section 7: Public, Internal, Client-Confidential, Client-Restricted for Tiers 1 to 4) and its criticality. Manila's part of the register was last reviewed by the Chief Information Officer on 18 March 2026."}

# ---- T4.2, risk identification with threat intelligence and control sprint 3 (A.5.6, A.5.7). LI-CHAIN (template T-LI-CHAIN)
# is worked in Risk Register › New Risk, which held the old T7.1 vignettes; RR-UPD in Risk Register › Score Risk, the Manila
# sheet of RA-16 (15 risks); the sprint in Frameworks › Map Control and Evidence › Link to Control (li-sprints.json, SPR-03).
# Dataset THR-5 (his new item) and the note of Ref-27002 attributes are platform-written, logged (T4.2).
STEPS["T4.2"] = {
    1: {"tool": "Risk Register › New Risk", "ds": ["THR-5"],
        "w": "Open template T-LI-CHAIN: it opens in Risk Register › New Risk (columns Asset · Asset type · Threat · Vulnerability · Consequence · Existing controls · Annex A control, then the risk statement and its rating). Row 1 is the LearnTech Educational Solutions worked chain: asset → threat → vulnerability → consequence → existing control → Annex A control. Your three Manila assets are pre-filled with their chains, read from dataset THR-5 and the office's own checks. Find the worked chain's links, and locate your three assets."},
    2: {"tool": "Risk Register › New Risk",
        "w": "For each of your three chains, choose the best of its three draft risk statements. Guidance: rule R06 (cause, event and consequence for the named asset) and SITL-POL-002 Section 7.1."},
    3: {"tool": "Risk Register › New Risk",
        "w": "For each chain, rate likelihood and impact on the 5×5 scales of SITL-ERM-001 Sections 6.2–6.4. Guidance: rule R07 and your method card."},
    4: {"ds": ["THR-5"], "pages": ["LI-A.5.7"],
        "w": "Item 2 of THR-5 reports active exploitation of a flaw in the VPN product the Manila office uses. What do you update?"},
    5: {"tool": "Risk Register › Score Risk",
        "w": "Some of your risks score above appetite. Who may accept one of them? Then: add the three risks to RR-UPD with owner, acceptance authority (R36) and existing controls; each gets one change-log row (R22)."},
    6: {"tool": "Frameworks › Map Control", "ds": ["SPR-03"], "pages": ["LI-A.5.6", "LI-A.5.7", "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's controls: A.5.6, A.5.7. Its first row is the LearnTech Educational Solutions worked example, and the earlier sprints' rows follow as you left them. For each control, open its Lead Implementer task, LI-A.5.6 and LI-A.5.7 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-03, what was observed at the Manila office for each control, is the tracker's Observed column."},
    7: {"tool": "Frameworks › Map Control", "ds": ["SPR-03"], "pages": ["LI-A.5.6", "LI-A.5.7"],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-03. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    8: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    9: {"tool": "Evidence › Link to Control", "ds": ["SPR-03", "THR-5"], "pages": ["LI-A.5.7"],
        "w": "Complete every sub-task of LI-A.5.7 in the Lead Implementer task library (Learn › Reference pages): the evidence pack opens in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-03 or THR-5. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    10: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.6", "LI-Q fixed questions", "Ref-Maturity Model"],
         "w": "For A.5.6: record the file of sub-task 01 of its LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3, and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
}
PANELS["T4.2"] = {"tool": "Risk Register › New Risk (LI-CHAIN)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-CHAIN"] = ["T4.2", "LI-CHAIN", "Asset–threat–control chains (Clauses 6.1.2 and 8.2): per asset its type and asset register entry, threat with its source, vulnerability, consequence, existing controls (working or not) and the Annex A control it ends at; the risk statement chosen from three drafts (rule R06) and its likelihood, impact and inherent score (rule R07); one LearnTech Educational Solutions worked chain", "Risk Register › New Risk"]
# His "THR-5: threat-intelligence brief with five items (one on the VPN product)". The Charter's reporting calendar (Section
# 15.1) sends a weekly brief from the Cyber Threat Intelligence Analyst to every Org CISO: this is Manila's of 26 October 2026.
# Items 2 and 4 feed two of the chains (R-16-HQ-16, -17); 1, 3 and 5 are already on the register.
DATASETS["THR-5"] = {"note": "Threat-intelligence brief for GlobalConnect Customer Solutions, Manila, 26 October 2026, from the Group's Cyber Threat Intelligence Analyst to the Org CISO (the weekly brief of the GRC Charter Section 15.1). Five items, each with its source and what it means for the office.",
                     "h": ["Item", "What is reported", "Source", "What it means for the Manila office"], "r": [
    ["1", "Pretext calls to call-centre agents: callers pose as a client's customer or as IT support to have account details changed or a password reset. Rising across the BPO sector since July 2026.", "BPO sector ISAC bulletin, October 2026", "Manila's agents take customer calls on the CRM platforms. Already on the register: R-16-HQ-02, phishing and business-email compromise."],
    ["2", "Active exploitation of a flaw in the remote-access VPN product the Manila office runs: attackers get into the network through unpatched gateways without valid credentials. Attacks on unpatched gateways of this product are reported several times a year across the sector, more often since the advisory. The vendor issued a fix on 14 October 2026.", "The VPN vendor's security advisory, 14 October 2026; BPO sector ISAC bulletin, October 2026", "Manila's remote-access VPN gateway runs the affected version. Night-shift supervisors and IT on-call staff reach the network only through it."],
    ["3", "A ransomware group targeting BPO providers through their remote-support tools, then moving into their clients' environments.", "Group SOC weekly report, 19 October 2026", "Manila supports its clients' delivery platforms. Already on the register: R-16-HQ-01, ransomware disrupting Mission Critical services."],
    ["4", "Interception of files sent to BPO providers over plain FTP: attackers on the network path read the files and the passwords sent with them. Reported at BPO providers in the region about once a year.", "BPO sector ISAC bulletin, September 2026", "One client still sends its weekly transaction file to Manila's legacy FTP server without encryption."],
    ["5", "Hacktivist DDoS campaigns against the public-facing services of companies in the Philippines, timed with regional tensions.", "Group SOC weekly report, 12 October 2026", "Manila's public-facing services are in reach. Already on the register: R-16-HQ-08, DDoS and hacktivist campaigns."],
]}
SPRINT_DS.add("THR-5")  # read by no sheet: the chains cite its items
# His input "ISO/IEC 27002:2022 attribute values (Ref-27002 attributes)": the pack's page, rows kept (A.5.6 and A.5.7 checked
# against ISO/IEC 27002:2022), with a note on what the attributes are, which the page lacked.
_ref27002 = json.loads(OUT.read_text(encoding="utf8"))["pages"]["Ref-27002 attributes"]
# Two rows of the pack disagreed with ISO/IEC 27002:2022 (integration fixes, 26 Nov 2026, logged): 7.13 Equipment
# maintenance serves #Protect only, and 8.21 Security of network services is #Preventive and #Protect only.
for _r in _ref27002["r"]:
    if _r[0] == "A.7.13":
        _r[3:6] = ["Preventive", "C / I / A", "Protect"]
    if _r[0] == "A.8.21":
        _r[3:6] = ["Preventive", "C / I / A", "Protect"]
PAGES["Ref-27002 attributes"] = {"note": "The 93 controls of ISO/IEC 27001:2022 Annex A with the attribute values ISO/IEC 27002:2022 gives each one (its Annex A): the theme (organisational, people, physical, technological), the control type (preventive, detective, corrective: whether it acts before, during or after an incident), the security properties it preserves (confidentiality, integrity, availability) and the cybersecurity concepts it serves (identify, protect, detect, respond, recover). ISO/IEC 27002:2022 also gives each control its operational capabilities and security domains, not listed here. A.5.7 Threat intelligence is one of the eleven controls new in the 2022 edition.",
                                  "h": _ref27002["h"], "r": _ref27002["r"]}


# ---- T12.2, certification readiness: LI-CERT's facts, AUD-LOG (template T-AUD) and LI-NCR-R are worked in Evidence › Audit
# Requests (PBC), which held the old programme's PBC list; EVIDENCE-INDEX is Evidence › Evidence Library, which held the old
# EVP-REPO. His AUD-REQUESTS, EVIDENCE-INDEX and AUD-FINDING, and the portal receipts (AUD-PORTAL) step 4 reads, are
# web/src/lib/desk/li-t122.json, read by registers.ts too. Platform-written, logged (T12.2); keys in li101_written.json.
T122 = json.loads((WEB / "src" / "lib" / "desk" / "li-t122.json").read_text(encoding="utf8"))
STEPS["T12.2"] = {
    1: {"pages": ["Ref-Certification card"],
        "w": "What does the Stage 1 audit mainly review? Guidance: rule L11 and Ref-Certification card (Learn › Reference pages)."},
    2: {"tool": "Evidence › Audit Requests (PBC)", "pages": ["Ref-Certification card"],
        "w": "How long is an ISO/IEC 27001 certification cycle? Then: write LI-CERT, two pages for management on Stage 1, Stage 2, surveillance and what the Manila office must have ready. Its sheet Facts holds eight statements for the briefing: decide for each when the auditor checks it, from Ref-Certification card. The two pages you write from them are format-checked and kept with your hand-in."},
    3: {"tool": "Evidence › Audit Requests (PBC)", "ds": ["AUD-REQUESTS", "EVIDENCE-INDEX"],
        "w": "Open AUD-LOG, template T-AUD: it opens in Evidence › Audit Requests (PBC), with the eight requests of AUD-REQUESTS. For each request, choose the file from your EVIDENCE-INDEX (Evidence › Evidence Library) that answers it, or \"No evidence available\" and write the action you raise. Guidance: rule R34."},
    4: {"tool": "Evidence › Audit Requests (PBC)", "ds": ["AUD-PORTAL"],
        "w": "For each file sent, AUD-LOG shows its file ID and its SHA-256 hash from EVIDENCE-INDEX. Record the UTC time it was sent: the Portal receipt column gives each upload as the audit portal recorded it (dataset AUD-PORTAL), in Manila time, which is UTC+8."},
    5: {"tool": "Evidence › Audit Requests (PBC)", "ds": ["AUD-FINDING"],
        "w": "The auditor raises a minor nonconformity: the internal audit programme did not cover A.8.32 Change management (dataset AUD-FINDING). How do you respond? Then: write the response in the LI-NCR-R frame (L25): the correction, the root cause and the corrective action, each with an owner and a date."},
}
PANELS["T12.2"] = {"tool": "Evidence › Audit Requests (PBC) (LI-CERT, AUD-LOG and LI-NCR-R)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-AUD"] = ["T12.2", "AUD-LOG", "Auditor request log: each request of AUD-REQUESTS with the one file from EVIDENCE-INDEX that answers it (rule R34) or No evidence available and the action raised, the file's SHA-256 and the UTC time it was sent", "Evidence › Audit Requests (PBC)"]
TEMPLATES["LI-NCR-R frame"] = ["T12.2", "LI-NCR-R", "Response to an audit finding (Clause 10.2, rule L25): the correction, the root cause and the corrective action, each with an owner and a date", "Evidence › Audit Requests (PBC)"]
# His input "Certification-process summary card (Ref-Certification card)": the pack's page listed five body-selection criteria
# and copy instructions his steps do not use. Rewritten from ISO/IEC 17021-1:2015 (9.3 stages, 9.4.9 and 9.5 nonconformities
# and the decision, 9.6 surveillance and recertification) and ISO/IEC 27006-1; in our words.
PAGES["Ref-Certification card"] = {"note": "How ISO/IEC 27001 certification runs, summarised in our own words from ISO/IEC 17021-1 (requirements for bodies that audit and certify management systems) and ISO/IEC 27006-1 (its additional requirements for information security management systems). Read each fact here before you brief on it.", "h": ["Item", "What it means"], "r": [
    ["Who certifies", "A certification body accredited for ISMS certification: accredited against ISO/IEC 17021-1 and ISO/IEC 27006-1 by a national accreditation body that signs the IAF multilateral recognition arrangement. Check the body in the accreditation register before you appoint it."],
    ["Stage 1 audit", "The auditor reviews the ISMS's documented information and the organisation's readiness for Stage 2: the scope, the information security policy, the risk assessment and treatment process, the Statement of Applicability, and whether internal audits and management reviews are planned and performed. It ends with documented conclusions, including any area of concern that could be graded a nonconformity at Stage 2."],
    ["Stage 2 audit", "The auditor evaluates on site whether the ISMS is implemented and effective: interviews, records and observation, with samples of the Statement of Applicability's controls in operation. Findings are graded major or minor nonconformities, and the lead auditor recommends whether to certify."],
    ["Nonconformities", "Minor: the certification body reviews and accepts the organisation's plan for correction and corrective action before it decides. Major: it reviews and accepts the correction and the corrective action and verifies that they are effective before it certifies. Some bodies already grade Stage 1 findings as minor or major."],
    ["Certification decision", "Made by the certification body after Stage 2, by people who did not carry out the audit. The auditor does not issue the certificate."],
    ["Three-year cycle", "The certificate is valid for three years. Surveillance audits come at least once a calendar year, the first no later than 12 months after the certification decision: in practice in years two and three. Each covers part of the ISMS, with the internal audits, management reviews, complaints and the actions on earlier nonconformities."],
    ["Recertification", "Before the certificate expires at the end of year three, a recertification audit of the whole ISMS; a positive decision starts a new three-year cycle."],
    ["Auditee: do", "Answer only what is asked; send the one record asked for and name its clause or control; say \"I will check\" when unsure; raise a disagreement with the Org CISO and, if it stands, at the closing meeting."],
    ["Auditee: do not", "Guess; create or re-date evidence after the request; argue without evidence; share other clients' or other mentees' data; sign anything you have not read."],
]}
DATASETS["AUD-REQUESTS"] = {"h": ["Request", "Clause or control", "What the auditor asks for"], "r": T122["requests"]}
DATASETS["EVIDENCE-INDEX"] = {"h": ["File ID", "What it holds", "Clause or control", "Dated", "SHA-256"], "r": T122["index"]}
DATASETS["AUD-PORTAL"] = {"h": ["Request", "Receipt", "Uploaded (Manila time, UTC+8)"], "r": T122["portal"]}
DATASETS["AUD-FINDING"] = {"h": ["Item", "Text"], "r": T122["finding"]}
SPRINT_DS.update({"AUD-REQUESTS", "EVIDENCE-INDEX", "AUD-PORTAL", "AUD-FINDING"})
# His T12.2 cites R34, L11 and L25; the pack's L11 copied answers and five body criteria, its L25 read a Ref-Actions page that is
# gone, and its R34 also argued findings (L25's job). L11 says where the facts are, never the facts (steps 1 and 2 ask them).
RULES["L11"] = ["Certification facts", "Read each certification fact on Ref-Certification card (Learn › Reference pages), the summary of ISO/IEC 17021-1 and ISO/IEC 27006-1: what each audit stage reviews, how nonconformities are graded and closed, who decides, and how long the certificate lasts and how it is kept. Brief management in the card's terms, not from memory."]
RULES["L25"] = ["Audit-finding response", "Open the evidence the finding names and read what it shows. Where it supports the finding, accept it and respond in three parts (Clause 10.2), each with an owner and a date: the correction, which fixes this nonconformity now; the root cause, why the process let it happen (a cause in the process, not a person's name); and the corrective action, which changes the process so that it does not happen again. Dispute a finding only with evidence that the requirement was met: at the closing meeting, then through the certification body's appeal process."]
RULES["R34"] = ["Auditor requests", "Answer each request with ONE evidence file: the record the auditor asks for (not a plan, a template or a policy where a record is asked for), under the same clause or control, for this office, dated inside the audit period, from a system or a controlled document (not an undated screenshot). Record its file ID and SHA-256. If no file holds what is asked, answer \"No evidence available\" and raise an action, with an owner and a date, to produce it from now on: never create evidence after the request."]

# ---- T12.1, management review, corrective action and the Level 4 roadmap. ACT-UPD (template T-ACT) is worked in Risk
# Register › Mitigation Tracker, which held the old programme's action list; LI-MR and L4-ROAD (his "L4-ROAD frame") in
# Policies › New from Template. The pack's files are a Learn › Reference page (Ref-Review pack). Platform-written, logged
# (T12.1): the step texts below (his, tightened), the options of steps 1 and 3 without the instruction his lettered list
# carried ("Overdue — escalate. Record the reason …"), the page, rule L24, three Quick Reference entries.
STEPS["T12.1"] = {
    1: {"tool": "Risk Register › Mitigation Tracker",
        "opt": ["Closed — verified effective", "Open — evidence insufficient", "Overdue — escalate"],
        "w": "Open ACT-TRACKER: it opens in Risk Register › Mitigation Tracker, as at 21 December 2026, with your gaps and nonconformities from weeks 2–11, each with its owner-reported status and closure evidence. For each action, test the closure evidence and decide its status in ACT-UPD: Closed — verified effective, Open — evidence insufficient, or Overdue — escalate. Record the reason and the next check date. Guidance: Clause 10.2 and SITL-POL-016 Section 6.2."},
    2: {"w": "Besides reacting to the nonconformity, what must corrective action do (Clause 10.2)?"},
    3: {"tool": "Policies › New from Template", "pages": ["Ref-Review pack"], "opt": ["Available", "Missing"],
        "w": "Open LI-MR, the management-review pack: it opens in Policies › New from Template. For each Clause 9.3.2 input (status of actions from previous reviews · changes in external and internal issues · changes in needs and expectations of interested parties · feedback on performance: nonconformities and corrective actions, monitoring and measurement results, audit results, fulfilment of objectives · feedback from interested parties · results of risk assessment and status of the risk treatment plan · opportunities for continual improvement), decide whether your pack holds it: Available or Missing. Record the source file for each Available. The pack's files are listed on Ref-Review pack (Learn › Reference pages). Guidance: rule L24."},
    4: {"tool": "Policies › New from Template", "pages": ["Ref-Review pack"],
        "w": "Which is a required output of management review (Clause 9.3)? Then: decide in LI-MR whether the Manila ISMS is ready for Stage 1 (L23, L24) and give your reason."},
    5: {"tool": "Policies › New from Template",
        "w": "Write L4-ROAD, the one-page roadmap from Level 3 to Level 4 for the next 12 months: the L4-ROAD frame opens in Policies › New from Template, one row for each measure of your LI-KPI, with its target, owner and what has to be ready first. For each measure, decide the quarter it goes live and how its results reach management review (Clause 9.3); how results drive improvement (Clause 10.1) is written in the frame."},
}
PANELS["T12.1"] = {"tool": "Risk Register › Mitigation Tracker (ACT-UPD)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-ACT"] = ["T12.1", "ACT-UPD", "Updated action tracker: each action of ACT-TRACKER (gaps and nonconformities from weeks 2–11) with its owner-reported status and closure evidence, and the verified status (Closed — verified effective, Open — evidence insufficient, Overdue — escalate), the reason and the next check date", "Risk Register › Mitigation Tracker"]
TEMPLATES["LI-MR"] = ["T12.1", "LI-MR", "Management-review pack (no template of its own): sheet Inputs, each Clause 9.3.2 input a)–g) Available or Missing with its source file (rule L24); sheet Readiness, whether the ISMS is ready for Stage 1, with the reason (rules L23, L24)", "Policies › New from Template"]
TEMPLATES["L4-ROAD frame"] = ["T12.1", "L4-ROAD", "One-page Level 3 → Level 4 roadmap by quarter, for the next 12 months: each LI-KPI measure with its control, frequency, owner, target and threshold, what has to be ready first, the quarter it goes live, its route to management review (Clause 9.3) and how its results drive improvement (Clause 10.1); a LearnTech Educational Solutions worked row", "Policies › New from Template"]
# What the Compliance Manager collected for the first Manila management review (SITL-POL-001 Section 6.1 step 1): the
# programme's own files and two records of the office's. Written; each line says what the file holds, never whether an input
# is in it.
PAGES["Ref-Review pack"] = {"note": "The files the Compliance Manager has collected, by 21 December 2026, for the first management review of the Manila ISMS (SITL-POL-001 Section 6.1, step 1: collect the inputs of Clause 9.3). Each line says what the file holds and when it was last brought up to date. The review itself has not met yet: it is booked for 14 January 2027.", "h": ["File", "From", "What it holds", "Up to date at"], "r": [
    ["CTX-ISS", "F1.3", "The Manila office's internal and external issues. The Compliance Manager's six-monthly review of 2 November 2026 is recorded with it and lists two changes since the list was drawn up: the healthcare-claims clients taken on in August 2026, and the SIEM's move to a hybrid set-up.", "2 November 2026"],
    ["CTX-IP", "F1.3", "The interested parties and their requirements, copied from SITL-ADD-16 Section 4. It has not been reviewed since it was drawn up, so no change is recorded.", "October 2026"],
    ["LI-GAP", "F2.2", "The baseline: the status and maturity level of each requirement of clauses 4.1–10.2, and the top three gaps to close.", "October 2026"],
    ["RR-UPD", "T4.2", "The Manila office risk register: every risk with its rating, owner and acceptance authority, the three risks added in week 4, and each risk's treatment status from LI-RTP (T5.1).", "November 2026"],
    ["LI-OBJ", "T5.2", "The ISMS objectives and the plan to achieve them: what, who, resources, by when, and how each is evaluated. Progress is not recorded in it.", "November 2026"],
    ["LI-KPI", "T11.1", "The five measure cards: what each measure counts, how, when and by whom, with its target and threshold.", "December 2026"],
    ["KPI-DASH", "T11.1", "Each measure's value at 30 November 2026 against its target and threshold, the ISMS objective of LI-OBJ it reports on, and a line on what management should do.", "30 November 2026"],
    ["LI-AUD", "T11.2", "The internal audit programme and plan for the next 12 months. No internal audit of the Manila ISMS has been held yet: the programme's first audit falls in 2027.", "December 2026"],
    ["LI-NCR", "T11.2", "Two nonconformities written as practice from the maturity review set of week 11 (scenarios of the review deck), not from an audit of the Manila ISMS.", "December 2026"],
    ["ACT-UPD", "T12.1", "The action tracker with each action's status as you verified it in step 1: the nonconformities and gaps raised in weeks 2–11 and their corrective actions.", "21 December 2026"],
    ["CLI-FB", "Service Delivery Operations", "The client feedback log for October to December 2026: security questions from clients, and one complaint (4 November 2026) that agents on a client's account shared CRM log-ins.", "18 December 2026"],
]}
# ---- T5.2: the Statement of Applicability (LI-SOA, template T-LI-SOA) in Frameworks › Export Mapping, which held the old
# T3.2's MAP-XW; sprint 4a (A.5.8) in the tracker and the evidence packs, as the sprints do; sheet Objectives (LI-OBJ) of
# template T-LI-PLAN in Frameworks › Gap Finder, where T-LI-PLAN opens. His dataset SOA-93 is web/src/lib/desk/li-soa.json
# (facts only: the key is backend/scripts/li101_written_T5.2.json), also the observation of A.5.8. Platform-written, logged (T5.2).
SOA = json.loads((WEB / "src" / "lib" / "desk" / "li-soa.json").read_text(encoding="utf8"))
STEPS["T5.2"] = {
    1: {"tool": "Frameworks › Export Mapping", "ds": ["SOA-93"],
        "w": "Open template T-LI-SOA: it opens in Frameworks › Export Mapping, pre-filled with the 93 Annex A controls and their titles (columns Control · Applicable · Source: risk / legal / contractual / business · Justification for inclusion · Justification for exclusion · Implemented? · Evidence ref), and each control's facts at Manila from dataset SOA-93. Its first row is a LearnTech Educational Solutions worked example. Implemented? and Evidence ref are carried over from your CIT files for the controls already sprinted, and say when the others are planned (rule L07). Find three cells: two in the worked row, one carried over."},
    2: {"tool": "Frameworks › Export Mapping", "ds": ["SOA-93"],
        "w": "For each of the 92 controls (A.8.30 is step 3's), decide whether it is applicable to the Manila ISMS from its facts in SOA-93, and the source that calls for it. Guidance: rule L06 — applicable when a risk, a legal or contractual requirement, or a business need calls for it. The justifications fill themselves from your choices."},
    3: {"w": "Manila builds its own customer portal in-house and outsources no development. What do you record for A.8.30 Outsourced development?"},
    4: {"w": "Which four elements must the SoA contain?"},
    5: {"w": "The SoA must be consistent with which other output?"},
    6: {"tool": "Frameworks › Map Control", "ds": ["SOA-93"], "pages": ["LI-A.5.8", "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's control: A.5.8, below the rows of the sprints before it. Open its Lead Implementer task, LI-A.5.8 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. What dataset SOA-93 observed at the Manila office for A.5.8 is the tracker's Observed column."},
    7: {"tool": "Frameworks › Map Control", "ds": ["SOA-93"], "pages": ["LI-A.5.8"],
        "w": "Decide in column D the implementation status of A.5.8 at GlobalConnect Customer Solutions, Manila, from the observations in SOA-93. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    8: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "Decide in column E the current maturity level of A.5.8. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    9: {"tool": "Evidence › Link to Control", "ds": ["SOA-93"], "pages": ["LI-A.5.8"],
        "w": "Complete every sub-task of LI-A.5.8 in the Lead Implementer task library (Learn › Reference pages): the evidence pack opens in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SOA-93. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    10: {"w": "Which is a measurable ISMS objective?"},
    11: {"tool": "Frameworks › Gap Finder",
         "w": "Open sheet Objectives of template T-LI-PLAN: it opens in Frameworks › Gap Finder. Write three objectives consistent with SITL-POL-001, one for each gap its rows name. For each, choose the objective and who is responsible, and write what will be done, what resources are needed and how results will be evaluated (L14); when it will be completed comes from the objective. Add the plan milestones (L15)."},
}
PANELS["T5.2"] = {"tool": "Frameworks › Export Mapping (LI-SOA)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-SOA"] = ["T5.2", "LI-SOA", "Statement of Applicability (Clause 6.1.3 d): the 93 Annex A controls of ISO/IEC 27001:2022 with their titles and each one's facts at the office (dataset SOA-93); applicable or not and the source that calls for it (rule L06), the justification for its inclusion or exclusion, whether it is implemented and its evidence ref (rule L07, carried over from the tracker T-LI-CIT); one LearnTech Educational Solutions worked row", "Frameworks › Export Mapping"]
TEMPLATES["T-LI-PLAN"][2] += ". Sheet Objectives (LI-OBJ, task T5.2): three ISMS objectives, each with what will be done, the resources, who is responsible, when and how results are evaluated (Clause 6.2, rule L14), and its milestones (rule L15)"
DATASETS["SOA-93"] = {"h": ["Control", "Facts at the Manila office"], "r": [[f"{x['c']} {x['title']}", x["fact"]] for x in SOA["controls"]]}
SPRINT_DS.add("SOA-93")  # read by registers.ts from li-soa.json, like the sprints' datasets
# His T5.2 cites L06, L07, L14 and L15; the pack's texts copied from pages and sheets that are gone (Ref-SoA exclusions,
# Ref-Objectives, Ref-Milestones, the TSA Control_Mapping sheet) and fixed the answers. Written to his step texts.
RULES["L06"] = ["SoA applicability", "A control is Applicable when a risk, a legal or contractual requirement, or a business need calls for it, and Not applicable only when the office does nothing the control governs: record that justification, and review it if that changes. Every Annex A control stays in the SoA. For an applicable control, record the source that calls for it, read in its facts: Risk, where a risk in the risk register or in your risk treatment plan (LI-RTP) is treated with it; Legal requirement, where a law or a regulator's rule requires it; Contractual requirement, where a client or supplier contract requires it (PCI DSS reaches Manila through its card-handling clients' contracts); Business need, where the Group requires it of every office or the office needs it to run. Where the facts give more than one, record the first in that order. A control is still applicable when only part of the office does what it governs."]
RULES["L07"] = ["SoA implementation status", "Implemented? in the SoA: for a control already sprinted, its status in your tracker T-LI-CIT (column D), with its evidence ref (column F); for a control whose sprint is still to come, Planned, with its sprint and week; for an excluded control, Not applicable. The platform carries them over from the tracker and the plan."]
RULES["L14"] = ["ISMS objectives", "Set each objective (Clause 6.2) consistent with the information security policy (SITL-POL-001 Section 3.1: measurable, set each year, tracked), measurable where practicable (what is counted, a target and a date), and from the results of the risk assessment and treatment and last year's results (SITL-POL-001 Section 6.2). For each, record what will be done, what resources will be required, who will be responsible (the role R for its process, GRC Charter Section 16), when it will be completed and how the results will be evaluated (the measure, who measures it and how often)."]
RULES["L15"] = ["Objective milestones", "Break each objective's plan into at least two milestones, each with what is delivered and its date, the last on or before the objective's own date. Progress against them is measured each quarter on the objectives dashboard (SITL-POL-001 Section 6.2, step 3)."]
QUICK_REF.insert(next(i for i, p in enumerate(QUICK_REF) if p.startswith("<b>ISO/IEC 27001 Clause 6.1.3")) + 1,
    # T5.2 steps 10 and 11.
    "<b>ISO/IEC 27001 Clause 6.2</b> Information security objectives and planning to achieve them. The organisation sets information security objectives at relevant functions and levels. They a) are consistent with the information security policy; b) are measurable (if practicable); c) take into account the applicable information security requirements and the results of risk assessment and risk treatment; d) are monitored; e) are communicated; f) are updated as appropriate; and g) are available as documented information. When planning how to achieve them, the organisation determines what will be done, what resources will be required, who will be responsible, when it will be completed, and how the results will be evaluated. In practice a measurable objective names what is counted, a target and a date; an activity (buy a tool, run a course) is part of the plan, not the objective.")

# His T12.1 cites L23 (kept: the audit programme) and L24; the pack's L24 read a sheet that named the deliverable for each input
# (the step's answer) and counted 14 documents of an LI-DOC this programme does not have.
RULES["L24"] = ["Management review pack and readiness", "Fill one row per Clause 9.3.2 input (a to g, with d in its four parts). Available: a file of the pack holds it; name that file as the source. An input about changes is available only where the file records a review that looked for changes. Missing: no file holds it, and its source is None. Opportunities for continual improvement are ways to make the ISMS better beyond fixing what failed; a line that answers a measure in the red is feedback on performance. Stage 1 readiness (the Group's working test): Yes only when an internal audit of the ISMS has been held and reported (rule L23's first year: clauses 4–10) and a management review has met with every input; otherwise No, with what must happen first. Corrective actions still open do not by themselves stop Stage 1, as long as each is tracked to closure."]
_amd = next(i for i, p in enumerate(QUICK_REF) if p.startswith("<b>ISO/IEC 27001:2022/Amd"))
QUICK_REF[_amd:_amd] = [
    # T12.1 steps 3 and 4 (and the readiness of step 4).
    "<b>ISO/IEC 27001 Clause 9.3</b> Management review. Top management reviews the ISMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness (9.3.1). The review considers (9.3.2): a) the status of actions from previous management reviews; b) changes in external and internal issues relevant to the ISMS; c) changes in the needs and expectations of interested parties relevant to the ISMS; d) feedback on information security performance, including trends in 1) nonconformities and corrective actions, 2) monitoring and measurement results, 3) audit results and 4) the fulfilment of information security objectives; e) feedback from interested parties; f) the results of risk assessment and the status of the risk treatment plan; and g) opportunities for continual improvement. Its results (9.3.3) include decisions related to continual improvement opportunities and any needs for changes to the ISMS, and documented information is available as evidence of them. In practice the inputs are collected into a review pack before the meeting, and the minutes record the decisions.",
    # T12.1 step 5.
    "<b>ISO/IEC 27001 Clause 10.1</b> Continual improvement. The organisation continually improves the suitability, adequacy and effectiveness of the ISMS. In practice the improvements come from the management review's decisions, from measures that show a trend, and from audits and nonconformities.",
    # T12.1 steps 1 and 2.
    "<b>ISO/IEC 27001 Clause 10.2</b> Nonconformity and corrective action. When a nonconformity occurs, the organisation a) reacts to it: takes action to control and correct it, and deals with the consequences; b) evaluates the need for action to eliminate its causes, so that it does not recur or occur elsewhere, by reviewing it, determining its causes and determining whether similar nonconformities exist or could occur; c) implements any action needed; d) reviews the effectiveness of any corrective action taken; and e) makes changes to the ISMS, if necessary. Corrective actions are appropriate to the effects of the nonconformities met. Documented information is available as evidence of the nature of the nonconformities, the actions taken and the results of any corrective action. In practice an action is closed only when the evidence shows the fix in place and a check that it worked.",
]

# ---- T11.2, the internal audit programme and the maturity review. LI-AUD (his new item T-LI-AUD) is worked in Policies › New
# from Template; RV-SET (his "Review Deck, one set of 9 cards"; the Review module does not exist) in Frameworks › Gap Finder,
# beside the clause gap analysis; LI-NCR (template T-LI-NCR) in Control Testing › Raise Finding, which held the old 5C finding
# frame. Platform-written, logged (T11.2): the step texts below (his, tightened), step 4's options without the instruction his
# last option carried ("Conforming. Then fill …"), the fixed questions RV-Q1–RV-Q8, the templates, the Clause 9.2 entry.
STEPS["T11.2"] = {
    1: {"tool": "Policies › New from Template",
        "w": "Open template T-LI-AUD: it opens in Policies › New from Template, sheet Programme (columns Audit · Scope · Criteria · What your trackers show · Audits in the 12 months · Month(s) · Method · Auditor). Its 23 audits cover, over January to December 2027, clauses 4–10 and every applicable Annex A control in your SoA (LI-SOA). For each audit record how often it runs, the month or months, the method and the auditor. Audit more often where your trackers (LI-GAP and CIT-S1 to CIT-S13) show Level 1 or Level 2, or where earlier results were poor. Guidance: Clause 9.2 and the GRC Charter Sections 13, 16 and 17."},
    2: {"w": "Who may audit the risk management process?"},
    3: {"tool": "Frameworks › Gap Finder", "pages": ["Ref-Maturity Model", "RV-Q fixed questions"],
        "w": "Open your assigned set of nine RV cards: the Review Deck opens in Frameworks › Gap Finder as sheet RV-SET, one card per row with what a reviewer found at the Manila office. For each card, decide its maturity level. Guidance: the Maturity Model (Ref-Maturity Model) and the fixed questions RV-Q1 to RV-Q8 (RV-Q fixed questions), both in Learn › Reference pages."},
    4: {"tool": "Frameworks › Gap Finder", "pages": ["RV-Q fixed questions", "Ref-Review references"], "opt": ["Major NC", "Minor NC", "OFI", "Conforming"],
        "w": "For each card, classify the finding: Major NC, Minor NC, OFI (opportunity for improvement) or Conforming. Then record, for each card, the ISO/IEC 27001:2022 clause or Annex A control it answers to, the gap and your recommendation. The indicators fill themselves from the level you decided in step 3."},
    5: {"tool": "Control Testing › Raise Finding",
        "w": "Pick one Level 1 card and one Level 2 card from your set. In template T-LI-NCR, which opens in Control Testing › Raise Finding, write each as a nonconformity: the requirement (ISO/IEC 27001:2022 clause or Annex A control, filled from the card), the evidence (what the scenario shows), the statement of the gap, and its grade by rule L17."},
}
PANELS["T11.2"] = {"tool": "Policies › New from Template (LI-AUD)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-AUD"] = ["T11.2", "LI-AUD", "Internal audit programme and plan (Clause 9.2.2), January–December 2027: sheet Programme, one audit per area so that clauses 4–10 and every applicable Annex A control of the SoA are covered over the cycle, each with its scope, criteria, what the trackers show (LI-GAP, CIT-S1–CIT-S13), how often it runs, its month or months, method and auditor; one LearnTech Educational Solutions worked audit", "Policies › New from Template"]
TEMPLATES["T-LI-NCR"] = ["T11.2", "LI-NCR", "Nonconformity report: per nonconformity the card it comes from, the requirement (ISO/IEC 27001:2022 clause or Annex A control), the evidence, the statement of the gap and its grade (rule L17); one LearnTech Educational Solutions worked nonconformity", "Control Testing › Raise Finding"]
# His "fixed questions RV-Q1 to RV-Q8", which the platform did not hold: the Maturity Model's questions (Ref-Maturity Model),
# rule L17's sample test and the card's requirement, gap and next action, asked of every card.
PAGES["RV-Q fixed questions"] = {"note": "The eight questions a reviewer asks of every RV card of the Review Deck, and where each answer is found. RV-Q1 to RV-Q5 give the level, RV-Q6 the ISO reference, RV-Q7 the grade of a nonconformity, RV-Q8 the gap and the recommendation.", "h": ["Question", "Ask", "Where to look"], "r": [
    ["RV-Q1", "Is there a documented, approved way of doing it?", "The card's scenario. No → Level 1 (the Maturity Model's first question, Ref-Maturity Model)."],
    ["RV-Q2", "Are there records that it is done?", "The card's scenario: logs, signed records, minutes. None → Level 1."],
    ["RV-Q3", "Is it the Group's standard way, done the same in every office?", "The card's scenario: \"the Group's\", \"every office\", or the office's own way. Its own → Level 2."],
    ["RV-Q4", "Is it reviewed at least once a year?", "The card's scenario. Never reviewed → Level 2."],
    ["RV-Q5", "Is it measured against targets, with the results acted on?", "The card's scenario. Not measured → Level 3; measured → Level 4."],
    ["RV-Q6", "Which clause of ISO/IEC 27001:2022, or which Annex A control, does it answer to?", "Ref-Review references (Learn › Reference pages): what each clause and control you can choose requires."],
    ["RV-Q7", "In the period or the sample, was it never done, or did more than half fail?", "The card's numbers, against rule L17 (Learn › Rule tables): yes → Major; any other failure → Minor."],
    ["RV-Q8", "What is missing, and what is the next action that takes it a level up?", "The first question the card answers No; the next action is what would turn it to Yes, with its owner."],
]}
# T11.2 step 4's ISO reference choices, each with what it requires: the clauses' lines are sheet Gap's "What the clause
# requires" (registers.ts GAP_25, read from there so the two cannot differ), the controls' their LI task pages (li-sprints.json).
_regs = (WEB / "src" / "lib" / "desk" / "registers.ts").read_text(encoding="utf8")
PAGES["Ref-Review references"] = {"note": "The clauses of ISO/IEC 27001:2022 and the Annex A controls an RV card can answer to (fixed question RV-Q6), each with what it requires, in our own words. The clauses' lines are those of sheet Gap of LI-GAP; the controls' are their LI task pages.", "h": ["ISO reference", "What it requires"], "r": [
    *[[f"{c} {m[1]}", m[2]] for c in ["5.3", "6.3", "7.1", "7.2", "7.3", "7.4", "7.5", "8.1", "9.1", "10.1"] for m in [re.search(rf'\["{re.escape(c)} ([^"]+)", "([^"]+)"', _regs)]],
    *[[f"{c} {SPRINTS['controls'][c]['title']}", " ".join(f"{i}) {r}" for i, r in enumerate(SPRINTS["controls"][c]["requires"], 1))] for c in ["A.5.1", "A.5.4"]],
]}
_amd = next(i for i, p in enumerate(QUICK_REF) if p.startswith("<b>ISO/IEC 27001:2022/Amd"))
QUICK_REF[_amd:_amd] = [
    # T11.2 steps 1 and 2.
    "<b>ISO/IEC 27001 Clause 9.2</b> Internal audit. The organisation conducts internal audits at planned intervals to find out whether the ISMS conforms to the organisation's own requirements for it and to ISO/IEC 27001, and whether it is effectively implemented and maintained (9.2.1). It plans, establishes, implements and maintains an audit programme, with the frequency, methods, responsibilities, planning requirements and reporting; the programme takes into consideration the importance of the processes concerned and the results of previous audits (9.2.2). For each audit it a) defines the audit criteria and scope; b) selects auditors and conducts audits so that the audit process is objective and impartial; and c) makes sure the results are reported to relevant management. Documented information is kept as evidence of the programme and the results. In practice auditors do not audit their own work, and ISO 19011 gives the guidance on how audits are run.",
]

# ---- T6.1, competence, awareness and communication — control sprint 4. LI-COMM (template T-LI-COMM, sheets Competence and
# Communication) in Policies › New from Template; sprint 4's tracker rows (A.6.3) in Frameworks › Map Control and its evidence
# pack in Evidence › Link to Control. Dataset COMP-10 (his new item), the Group communication plan (Ref-Communications, the page
# SITL-POL-020 Section 5 names) and the messages are web/src/lib/desk/li-t61.json, which registers.ts reads too. Step 2's
# options lose the instruction his last option carried ("… evidence. Then record the action for every B or C"). Platform-
# written, logged (T6.1).
T61 = json.loads((WEB / "src" / "lib" / "desk" / "li-t61.json").read_text(encoding="utf8"))
STEPS["T6.1"] = {
    1: {"tool": "Policies › New from Template", "ds": ["COMP-10"],
        "w": "Open template T-LI-COMM, sheet Competence: it opens in Policies › New from Template. The ten role holders of dataset COMP-10 are listed with the competence their role needs, taken from what the role runs or answers for in your LI-RACI (T3.2), and with their qualifications and the records Manila HR holds. The first two rows are LearnTech Educational Solutions worked examples. Find in them what the questions ask for."},
    2: {"tool": "Policies › New from Template", "ds": ["COMP-10"], "opt": T61["statuses"],
        "w": "For each role holder, decide the competence status from what the role needs, the person's qualifications and the records on file. Then choose the action for every Gap and every Competent, but no documented evidence. Guidance: Clause 7.2 a)–d) and SITL-POL-020 Section 3.1."},
    3: {"w": "What must the organisation retain under Clause 7.2?"},
    4: {"w": "Under Clause 7.3, people working under the organisation's control must be aware of what?"},
    5: {"tool": "Policies › New from Template", "pages": ["Ref-Communications"],
        "w": "Open sheet Communication. For each of the five ISMS messages listed (the new policy, the risk-acceptance outcome, an incident lesson, the awareness campaign's results, the management review's outcomes), record when, with whom and how it is communicated (Clause 7.4), from the Group ISMS communication plan (Ref-Communications, in Learn › Reference pages)."},
    6: {"tool": "Frameworks › Map Control", "ds": ["SPR-04"], "pages": ["LI-A.6.3", "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's control: A.6.3. Its first row is a LearnTech Educational Solutions worked example; the earlier sprints' rows show as you left them. Open the control's Lead Implementer task, LI-A.6.3 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-04, what was observed at the Manila office, is the tracker's Observed column."},
    7: {"tool": "Frameworks › Map Control", "ds": ["SPR-04"], "pages": ["LI-A.6.3"],
        "w": "For the sprint control, A.6.3, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-04. Guidance: compare the observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    8: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For the sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    9: {"tool": "Evidence › Link to Control", "ds": ["SPR-04"], "pages": ["LI-A.6.3"],
        "w": "Complete every sub-task of LI-A.6.3 in the Lead Implementer task library (Learn › Reference pages): the evidence pack opens in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a file you hand in, or the item's own new file, prepared from dataset SPR-04. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, the gaps column G."},
}
PANELS["T6.1"] = {"tool": "Policies › New from Template (LI-COMM)", "stamp": "Template", "kind": "table", "pl": {}}
# The pack's T-LI-COMM and T-AWR were the old T11.1's (LI-15): his T6.1 hands both in.
TEMPLATES["T-LI-COMM"] = ["T6.1", "LI-COMM", "Competence matrix and communication plan. Sheet Competence: the role holders of dataset COMP-10, each with the competence their role needs (from the LI-RACI), qualifications, the records on file, the status (Clause 7.2) and the action for a gap or a missing record; two LearnTech Educational Solutions worked rows. Sheet Communication: the ISMS's messages, each with when, with whom and how it is communicated (Clause 7.4), from the Group communication plan", "Policies › New from Template"]
TEMPLATES["T-AWR"] = ["T6.1", "AWR-PLAN", "Awareness campaign plan from the Group's 4-week template (rule R31): the theme and its scenario card, the three behaviours, the audiences, the four weeks (lesson; poster and quiz; phishing simulation; results and refresher), the approvals (HR and Legal; the works council where the addendum lists one) and the measures of SITL-POL-020 Section 7.1 (click rate, report rate at least 60%)", "your 02_Working folder, as sub-task 01 of LI-A.6.3"]
PAGES["Ref-Communications"] = T61["plan"]
DATASETS["COMP-10"] = {"h": ["Role holder", "ISMS role", "Qualifications and experience (CV)", "Training and certificate records on file (Manila HR)"],
                       "r": [[r[0], r[1], r[3], r[4]] for r in T61["holders"]]}
SPRINT_DS.add("COMP-10")  # read by registers.ts from li-t61.json
_c91 = next(i for i, p in enumerate(QUICK_REF) if p.startswith("<b>ISO/IEC 27001 Clause 9.1"))
QUICK_REF[_c91:_c91] = [
    # T6.1 steps 2–5.
    "<b>ISO/IEC 27001 Clause 7.2</b> Competence. The organisation a) determines the competence the people doing work under its control need, where that work affects its information security performance; b) makes sure those people are competent, on the basis of appropriate education, training or experience; c) where applicable, takes action to acquire the competence needed, and evaluates whether the action worked; and d) retains appropriate documented information as evidence of competence. A note gives examples of action: training, mentoring or re-assigning current staff, or hiring or contracting competent people.",
    "<b>ISO/IEC 27001 Clause 7.3</b> Awareness. People doing work under the organisation's control are aware of a) the information security policy; b) their contribution to the effectiveness of the ISMS, including the benefits of better information security performance; and c) what it means not to conform with the ISMS's requirements. Awareness is what people know and act on, not only a session attended; Annex A control 6.3 is the training that builds it.",
    "<b>ISO/IEC 27001 Clause 7.4</b> Communication. The organisation determines the internal and external communications relevant to the ISMS: a) on what to communicate; b) when to communicate; c) with whom to communicate; and d) how to communicate. In practice a communication plan lists each message with these four.",
]

# ---- T6.2, documented information (LI-DOC, template T-LI-DOC: sheets Register and Block, in Policies › New from Template) and
# control sprint 5 (A.5.37, A.6.1, A.6.2, A.6.4–A.6.7; li-sprints.json). Platform-written, logged (T6.2): the wiki page and its
# approval (Ref-Wiki backup page), the Clause 7.5 summary, SPR-05, the LI task pages, the step texts (his, tightened).
_T62_CTL = ["LI-A.5.37", "LI-A.6.1", "LI-A.6.2", "LI-A.6.4", "LI-A.6.5", "LI-A.6.6", "LI-A.6.7"]
STEPS["T6.2"] = {
    1: {"tool": "Policies › New from Template",
        "w": "Open template T-LI-DOC, sheet Register: it opens in Policies › New from Template (columns Item · ISO/IEC 27001:2022 · What the clause asks for · Held at Manila · Kind). For each of the ten items ISO/IEC 27001:2022 asks the ISMS to document (ISMS scope, information security policy, Statement of Applicability, ISMS objectives, evidence of competence, results of risk assessments, monitoring and measurement results, audit programme and results, management review results, nonconformities and corrective action results), decide which kind of documented information it is: a maintained document or a retained record. Guidance: Clause 7.5 (Learn › Framework Quick Reference)."},
    2: {"tool": "Policies › New from Template", "pages": ["Ref-Wiki backup page"],
        "w": "An operating procedure on the Manila IT wiki, the data-centre backup and restore page, has no version, owner or approval date. Which Clause 7.5.2 requirements does it miss? Then: on sheet Block of LI-DOC, add the document-control block (ID, version, owner, approver, approval date, classification, next review) to that procedure for A.5.37, by the rules of SITL-POL-000 Section 7.1."},
    3: {"tool": "Frameworks › Map Control", "ds": ["SPR-05"], "pages": [*_T62_CTL, "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), with this sprint's controls: A.5.37, A.6.1, A.6.2, A.6.4, A.6.5, A.6.6, A.6.7. Its first row is a LearnTech Educational Solutions worked example; the earlier sprints' rows stand as you left them. For each control, open its Lead Implementer task, LI-A.5.37 to LI-A.6.7 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-05, what was observed at the Manila office for each control, is the tracker's Observed column."},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-05"], "pages": _T62_CTL,
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-05. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    5: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    6: {"tool": "Evidence › Link to Control", "ds": ["SPR-05"], "pages": ["LI-A.6.1", "LI-A.6.7"],
        "w": "Complete every sub-task of LI-A.6.1 and LI-A.6.7 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-05. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    7: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.37", "LI-A.6.2", "LI-A.6.4", "LI-A.6.5", "LI-A.6.6", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.5.37, A.6.2, A.6.4, A.6.5 and A.6.6: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3, and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    8: {"pages": ["LI-A.6.1"],
        "w": "A contractor started work in Manila before his background screening was complete. What does A.6.1 expect?"},
}
PANELS["T6.2"] = {"tool": "Policies › New from Template (LI-DOC)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-DOC"] = ["T6.2", "LI-DOC", "Documented information (Clause 7.5). Sheet Register: the ten items of documented information ISO/IEC 27001:2022 asks the ISMS for, each with its clause, what the clause asks for, where it is held at Manila, and its kind: a maintained document or a retained record (Clause 7.5.1). Sheet Block: the document-control block a procedure carries (SITL-POL-000 Section 7.1): document ID, version, owner, approver, effective date, classification and next review", "Policies › New from Template"]
# His step 2's "operating procedure on the IT wiki": the page the learner gives its block, with the e-mail that approved it.
PAGES["Ref-Wiki backup page"] = {"note": "Extract of a page of the Manila IT wiki, as this sprint's walk-through found it in November 2026, with the e-mail that approved it afterwards. The data-centre team follows the page every night.", "h": ["Field", "What the wiki page shows"], "r": [
    ["Page", "Data-centre backup and restore (Manila IT wiki › Data centre)"],
    ["What it is for", "The steps the Manila data-centre team follows for the nightly backup (SITL-POL-009 Section 3.3) and for each restore test, at the frequency of SITL-POL-009 Section 4. It is how Manila carries out SITL-POL-009 Section 6.2, Procedure: Backup restore test."],
    ["Written", "2024-03-11, by the Manila data-centre team lead"],
    ["Edits", "14 since then, by four members of the team; the last on 2026-10-02"],
    ["Version", "None shown"],
    ["Owner", "None named"],
    ["Approval", "None recorded"],
    ["Next review", "None set"],
    ["Classification", "None marked"],
    ["E-mail of 2026-11-10", "From the Group CIO to the Policy & Governance Analyst: \"I have gone through the backup and restore page with the Manila data-centre team, and I approve it as it stands, as Manila's procedure for SITL-POL-009 Section 6.2. Please put it under document control.\""],
]}
_c74 = next(i for i, p in enumerate(QUICK_REF) if p.startswith("<b>ISO/IEC 27001 Clause 7.4")) + 1
QUICK_REF[_c74:_c74] = [
    # T6.2 steps 1 and 2.
    "<b>ISO/IEC 27001 Clause 7.5</b> Documented information. 7.5.1: the ISMS includes the documented information the standard requires, and what the organisation itself decides it needs for the ISMS to be effective. The ISO management-system standards use two terms for it: documented information to maintain, a document, which says what is to be done or how things stand and is kept current; and documented information to retain, a record, which is evidence of what was done or achieved and is kept unchanged. Where a clause asks for something to be available as documented information, or to be produced, it is a document; where it asks for documented information to be retained, or to be available as evidence of results, it is a record. 7.5.2: when documented information is created or updated, the organisation makes sure of a) its identification and description (for example a title, date, author or reference number); b) its format (for example language, software version, graphics) and media (for example paper, electronic); and c) its review and approval for suitability and adequacy. 7.5.3: it is controlled so that it is available and suitable for use where and when it is needed, and adequately protected (against loss of confidentiality, improper use or loss of integrity): its distribution, access, retrieval and use, storage and preservation (legibility included), control of changes (version control), and retention and disposition. Documented information of external origin that the ISMS needs is identified and controlled too.",
]

# ---- T10.2, secure development and change management, control sprint 13 (A.8.25–A.8.34). CHG-TEST (template T-CT, script
# pre-filled: sheet Sample, then the test of the 25 sampled changes) in Control Testing › Test Plan, which held the old
# programme's privileged-account records; SDLC-MAP (his new item T-LI-SDLC) in Policies › New from Template; the tracker and the
# packs in the sprints' screens. One source, web/src/lib/desk/li-t102.json (dataset CT-B, his "CT variant B: change-ticket
# population", 64 RFCs; dataset SDLC, the in-house customer portal's pipeline; the gate-map rows), read by registers.ts too.
# Ref-Sampling is the pack's page (rule R15 cites it), restored as the pack had it. SITL-POL-009's text is
# public/desk/docs/SITL-POL-009.md. Platform-written, logged in docs/GRC101_Content_Corrections.md (T10.2); keys in
# backend/scripts/li101_written_T10.2.json.
T102 = json.loads((WEB / "src" / "lib" / "desk" / "li-t102.json").read_text(encoding="utf8"))
DATASETS["CT-B"] = {"h": T102["ct"]["cols"], "r": T102["ct"]["rows"]}
DATASETS["SDLC"] = {"h": T102["sdlc"]["cols"], "r": T102["sdlc"]["rows"]}
SPRINT_DS.update({"CT-B", "SDLC"})
PAGES["Ref-Sampling"] = {"h": ["Control frequency", "Population guide", "Minimum sample"], "r": [
    ["Annual", "1", "1"], ["Semi-annual", "2", "1"], ["Quarterly", "4", "2"], ["Monthly", "12", "2"], ["Weekly", "52", "5"],
    ["Daily", "250–365", "20"], ["Many per day / population of records < 250", "< 250", "25"], ["Population of records ≥ 250", "≥ 250", "40"]],
    "note": "A recurring control is sampled by frequency; a population of items is sampled by records. Use a frequency row when you test how often the control ran, and a records row when you test the items it acted on, such as the accounts of one access review."}
_T102_CTRL = ["A.8.25", "A.8.26", "A.8.27", "A.8.28", "A.8.29", "A.8.30", "A.8.31", "A.8.32", "A.8.33", "A.8.34"]
_T102_PAGES = [f"LI-{c}" for c in _T102_CTRL]
STEPS["T10.2"] = {
    1: {"tool": "Control Testing › Test Plan", "ds": ["CT-B"], "pages": ["Ref-Sampling"],
        "w": "Open dataset CT-B, the change-ticket population (variant B: every change to the customer portal's production environment, 1 October to 4 December 2026), and sheet Sample of template T-CT: it opens in Control Testing › Test Plan. Draw your sample with rule R15: choose the Ref-Sampling row (Learn › Reference pages) that fits what you test, the population and the minimum sample. The platform then draws the RFCs and records the seed. Do not change the test script."},
    2: {"tool": "Control Testing › Test Plan", "ds": ["CT-B"], "opt": ["Pass", "Deviation"],
        "w": "For each sampled change, test the script's four attributes against its RFC: approved before implementation, tested, rollback plan, post-implementation review (SITL-POL-009 Section 6.1). Record Pass or Deviation, and rate each deviation with rule R26 (SITL-ADD-16 Section 8.1 lists the Mission Critical assets). On the last row, record the conclusion with rule R19."},
    3: {"tool": "Policies › New from Template", "ds": ["SDLC"],
        "w": "Open template T-LI-SDLC: the gate map SDLC-MAP opens in Policies › New from Template. For the customer portal in dataset SDLC, record where each control is applied in the pipeline, and whether the gate there does what the control asks: requirements (A.8.26), architecture (A.8.27), coding (A.8.28), testing (A.8.29), environments (A.8.31), change (A.8.32), test data (A.8.33)."},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-13"], "pages": _T102_PAGES + ["LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's controls: A.8.25, A.8.26, A.8.27, A.8.28, A.8.29, A.8.30, A.8.31, A.8.32, A.8.33, A.8.34. Its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.8.25 to LI-A.8.34 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-13, what was observed at the Manila office, is the tracker's Observed column."},
    5: {"tool": "Frameworks › Map Control", "ds": ["SPR-13"], "pages": _T102_PAGES,
        "opt": ["Implemented", "Partially implemented", "Not implemented", "Not applicable (excluded in LI-SOA)"],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-13, and A.8.30 as your LI-SOA (T5.2) records it. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    6: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "opt": ["Level 1 Initial", "Level 2 Managed", "Level 3 Defined", "Not applicable (excluded in LI-SOA)"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed? A control your LI-SOA excludes is not rated."},
    7: {"tool": "Evidence › Link to Control", "ds": ["SPR-13", "SDLC"], "pages": ["LI-A.8.28", "LI-A.8.32"],
        "w": "Complete every sub-task of LI-A.8.28 and LI-A.8.32 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from datasets SPR-13 and SDLC. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    8: {"tool": "Frameworks › Map Control", "pages": [f"LI-{c}" for c in _T102_CTRL if c not in ("A.8.28", "A.8.32")] + ["LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.8.25, A.8.26, A.8.27, A.8.29, A.8.30, A.8.31, A.8.33 and A.8.34: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3 (or, where it is at Level 3 already, close its gap or keep it there), and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    9: {"w": "An emergency change was applied to the customer portal at 02:00 without approval. What does change management expect? Guidance: SITL-POL-009 Section 6.1."},
    10: {"ds": ["SPR-13"], "pages": ["LI-A.8.31"],
         "w": "Developers have write access to the production database. Which control has the gap?"},
}
PANELS["T10.2"] = {"tool": "Control Testing › Test Plan (CHG-TEST)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-CT"] = ["T10.2", "CHG-TEST", "Change sample test, script pre-filled. Sheet Sample: the Ref-Sampling row, the population and the minimum sample (rule R15), and the seed of the draw. Then each sampled RFC tested against the script's four attributes (approved before implementation, tested, rollback plan, post-implementation review: SITL-POL-009 Section 6.1), Pass or Deviation, each deviation rated (rule R26), and the conclusion (rule R19)", "Control Testing › Test Plan"]
TEMPLATES["T-LI-SDLC"] = ["T10.2", "SDLC-MAP", "Secure development gate map of the in-house customer portal (dataset SDLC): for each control (A.8.26 requirements, A.8.27 architecture, A.8.28 coding, A.8.29 testing, A.8.31 environments, A.8.32 change, A.8.33 test data), the pipeline stage where it is applied and whether the gate there does what the control asks", "Policies › New from Template"]


def t102_screens(d: dict) -> None:
    """Control Testing › Test Plan held the old programme's privileged-account records (old T8.2). Two tasks test here: T9.1's
    walkthrough (PHY-WALK, week 9) and T10.2's CHG-TEST (week 10). Each step opens its own sheet; the screen names both
    (integration fixes, 26 Nov 2026, queue item 9d: T10.2's text used to replace T9.1's)."""
    d["tp"]["testing|Test Plan"] = {"tool": "Control Testing › Test Plan", "stamp": "PHY-WALK and CHG-TEST", "kind": "doc", "pl": {
        "p": ["<b>PHY-WALK</b> Physical security walkthrough (template T-LI-PHY): the floor plan of the Manila head office (dataset PHY) with its points marked by who may be there, and the 20 walkthrough photos, each matched to its A.7 control and judged good practice or a gap, with the action for each gap.",
              "<b>CHG-TEST</b> Change sample test (template T-CT, script pre-filled): sheet Sample, the sample drawn with rule R15 and its seed; then each sampled change tested against the script's four attributes (SITL-POL-009 Section 6.1), each deviation rated (rule R26), and the conclusion (rule R19)."],
        "note": "PHY-WALK opens from T9.1's first two steps (week 9), CHG-TEST from T10.2's first two steps (week 10): each step shows its own sheet."}}
    _tp = next(t for t in d["sections"]["testing"]["tools"] if t["n"] == "Test Plan")
    _tp["d"], _tp["u"] = "The walkthrough (T9.1) and the change test (T10.2)", 9


# ---- T10.1, control sprint 12 (A.8.9–A.8.12, A.8.18–A.8.24). His new items CFG / NET / T-LI-CFG: datasets CFG (12 settings of
# six Manila systems against their baselines) and NET (the segmentation zones and the core firewall's rules), and template
# T-LI-CFG (sheet CFG-BASE and sheet Crypto, CRY-REG), worked in Control Testing › Configuration Check. One source,
# web/src/lib/desk/li-cfg.json, which registers.ts reads too; the baselines cite SITL-STD-001 Section 6 (handling matrix by
# tier), SITL-TECH-000 Section 2 and SITL-ADD-16 Section 5. TSA-16 Asset_System_Map (his input "SITL-TSA-16 Asset_System_Map
# sheet"): the Manila systems with layer (SITL-TECH-000 Section 3), owner and classification (SITL-ADD-16 Section 8.1), zone.
# Platform-written, logged in docs/GRC101_Content_Corrections.md (T10.1).
CFG = json.loads((WEB / "src" / "lib" / "desk" / "li-cfg.json").read_text(encoding="utf8"))
DATASETS["CFG"] = {"h": ["Setting", "System", "Classification", "Setting checked", "Baseline (Manila hardening checklist, and the rule it carries out)", "Configured value (extract, 30 November 2026)"], "r": CFG["cfg"]}
DATASETS["NET"] = {"h": ["Rule or zone", "From (or zone)", "To", "Service", "Action", "Comment (or what the zone holds)"], "r": CFG["net"]}
SPRINT_DS.update({"CFG", "NET"})
PAGES["TSA-16 Asset_System_Map"] = {"note": "Extract of TSA-16_GlobalConnect_Customer_Solutions.xlsx, sheet Asset_System_Map: the Manila systems the configuration check and the key register cover, each with its layer of the Group reference architecture (SITL-TECH-000 Section 3), its system owner and classification (SITL-ADD-16 Section 8.1), the network zone it sits in (dataset NET) and how it is deployed. Every capability has a named system owner (SITL-TECH-000 Section 2): the owner answers for the system, its configuration and the keys that protect it.",
                                    "h": ["System", "Layer (SITL-TECH-000)", "System owner", "Classification", "Network zone", "Deployment"], "r": CFG["map"]}
_LI_PAGES_12 = [f"LI-{c}" for c in ["A.8.9", "A.8.10", "A.8.11", "A.8.12", "A.8.18", "A.8.19", "A.8.20", "A.8.21", "A.8.22", "A.8.23", "A.8.24"]]
STEPS["T10.1"] = {
    1: {"tool": "Control Testing › Configuration Check", "ds": ["CFG"], "opt": ["Compliant", "Drift"],
        "w": "Open CFG-BASE, template T-LI-CFG: it opens in Control Testing › Configuration Check. Dataset CFG gives 12 settings of six Manila systems: each system's classification, the setting's baseline (Manila's hardening checklist, with the SITL-STD-001 or SITL-ADD-16 rule it carries out) and the value configured on 30 November 2026. For each setting, compare the configured value with its baseline and decide Compliant or Drift. For every drift, choose the fix that brings it back to the baseline."},
    2: {"tool": "Control Testing › Configuration Check", "ds": ["CFG", "NET"], "pages": ["TSA-16 Asset_System_Map"],
        "w": "Open sheet Crypto (CRY-REG) of template T-LI-CFG, in Control Testing › Configuration Check. It lists every encryption use and key found in datasets CFG and NET, each with the extract line it was found in. For each, record the algorithm and key length, where the key is stored, its owner (the owner of its system on TSA-16 Asset_System_Map, in Learn › Reference pages), the rotation period and the next rotation."},
    3: {"tool": "Frameworks › Map Control", "ds": ["SPR-12"], "pages": _LI_PAGES_12 + ["LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), filtered to this sprint's controls: A.8.9, A.8.10, A.8.11, A.8.12, A.8.18, A.8.19, A.8.20, A.8.21, A.8.22, A.8.23, A.8.24. Its first row is a LearnTech Educational Solutions worked example, and the earlier sprints' rows stand as you left them. For each control, open its Lead Implementer task, LI-A.8.9 to LI-A.8.24 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-12, what was observed at the Manila office for each control, is the tracker's Observed column."},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-12"], "pages": _LI_PAGES_12,
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-12. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    5: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    6: {"tool": "Evidence › Link to Control", "ds": ["SPR-12"], "pages": ["LI-A.8.9", "LI-A.8.24"],
        "w": "Complete every sub-task of LI-A.8.9 and LI-A.8.24 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-12. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    7: {"tool": "Frameworks › Map Control", "pages": ["LI-A.8.10", "LI-A.8.11", "LI-A.8.12", "LI-A.8.18", "LI-A.8.19", "LI-A.8.20", "LI-A.8.21", "LI-A.8.22", "LI-A.8.23", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.8.10, A.8.11, A.8.12, A.8.18, A.8.19, A.8.20, A.8.21, A.8.22 and A.8.23: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3 (or, where it is at Level 3 already, keep it there), and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    8: {"ds": ["NET"], "pages": ["LI-A.8.22"],
        "w": "The guest Wi-Fi can reach the internal file server. Which control has the gap?"},
    9: {"ds": ["CFG"], "pages": ["LI-A.8.24"],
        "w": "The database encryption keys are stored in plain text on the same server as the encrypted database. What do you record?"},
    10: {"ds": ["SPR-12"], "pages": ["LI-A.8.11"],
         "w": "Production customer data is copied to the test system without masking. Which controls apply?"},
}
PANELS["T10.1"] = {"tool": "Control Testing › Configuration Check (CFG-BASE and CRY-REG)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-CFG"] = ["T10.1", "CFG-BASE", "Configuration baseline check. Sheet CFG-BASE: the 12 settings of dataset CFG, each with its system, classification, baseline (with the SITL rule it carries out) and configured value, decided Compliant or Drift, with the fix for each drift. Sheet Crypto (CRY-REG): every encryption use and key found in datasets CFG and NET, with its algorithm and key length, where the key is stored, owner, rotation period and next rotation", "Control Testing › Configuration Check"]


# ---- T7.1, control sprint 6 (A.5.15–A.5.18): ACC-RULES (his template T-LI-ACC, "access rules matrix by system and role") in
# Access Reviews › Privilege Check, which held the old programme's privileged-account list; the tracker and the evidence packs
# as every sprint. His dataset SPR-06 ("role list, account extract, joiner/leaver records and last access review for three
# Manila systems") is the sprint's observations plus the `acc` and `data` of its entry in li-sprints.json, which registers.ts
# reads for ACC-RULES. Platform-written, logged (T7.1); keys in backend/scripts/li101_written_T7.1.json.
_T71 = next(s for s in SPRINTS["sprints"] if s["task"] == "T7.1")
_acc = _T71["acc"]
DATASETS["SPR-06"]["h"] = ["Item", "What was observed at the Manila office"]
DATASETS["SPR-06"]["r"] += (
    [["Systems in this sprint", " ".join(f"{n}: asset owner the {o}, run by the {a}." for n, o, a, _l in _acc["systems"].values())]]
    + [[f"Role list · {role}", f"{duties} Reports to: {boss}."] for role, (duties, boss) in _acc["roles"].items()]
    + [[f"Account extract, 16 November 2026 · {name}",
        "; ".join(f"{r[2]} — {r[3]}" for r in _acc["rows"] if r[1] == code) + "."
        + {"CRM": " Also one shared account, \"support\", signed in to by five after-hours agents.",
           "WFM": " Also the account of the agent who left on 13 November 2026, still active."}.get(code, "")]
       for code, (name, _o, _a, _l) in _acc["systems"].items()]
    + _T71["data"]
)
STEPS["T7.1"] = {
    1: {"tool": "Access Reviews › Privilege Check", "ds": ["SPR-06"],
        "w": "Open template T-LI-ACC: it opens in Access Reviews › Privilege Check, one line per role on each of the three systems in SPR-06, with what the role does (role list) and the access it holds today (account extract). For each line, record the access level the role gets and who approves it, following SITL-POL-006 Section 3.1 and Section 6.1. Mark any role that holds more than its job needs."},
    2: {"tool": "Frameworks › Map Control", "ds": ["SPR-06"], "pages": ["LI-A.5.15", "LI-A.5.16", "LI-A.5.17", "LI-A.5.18", "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action). This sprint's controls are A.5.15, A.5.16, A.5.17 and A.5.18, below the earlier sprints' rows; its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.5.15 to LI-A.5.18 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-06, what was observed at the Manila office for each control, is the tracker's Observed column."},
    3: {"tool": "Frameworks › Map Control", "ds": ["SPR-06"], "pages": ["LI-A.5.15", "LI-A.5.16", "LI-A.5.17", "LI-A.5.18"],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-06. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    4: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    5: {"tool": "Evidence › Link to Control", "ds": ["SPR-06"], "pages": ["LI-A.5.16", "LI-A.5.18"],
        "w": "Complete every sub-task of LI-A.5.16 and LI-A.5.18 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-06. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    6: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.15", "LI-A.5.17", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.5.15 and A.5.17: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3, and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    7: {"w": "A leaver's account is still active three days after termination; SITL-POL-006 Section 3.1 and Section 6.3 set 4 hours. What do you record for A.5.18?"},
    8: {"pages": ["LI-A.5.16"],
        "w": "Five support agents share one \"support\" account. What does A.5.16 allow?"},
}
PANELS["T7.1"] = {"tool": "Access Reviews › Privilege Check (ACC-RULES)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-ACC"] = ["T7.1", "ACC-RULES", "Access rules matrix by system and role (A.5.15, SITL-POL-006 Sections 3.1 and 6.1): one line per role on each system, with what the role does and the access it holds today (dataset SPR-06), the access level its work needs (least privilege), who approves it (line manager, then the system's asset owner), and whether it holds more than its job needs", "Access Reviews › Privilege Check"]


# ---- T9.1, the physical security walkthrough and control sprint 10 (A.7.1–A.7.14). His new item PHY / T-LI-PHY (floor plan,
# 20 captioned photos, walkthrough checklist) is web/src/lib/desk/li-phy.json, worked in Control Testing › Test Plan, which held
# the old programme's privileged-access records: the plan drawn as an inline SVG (components/desk/phy-plan.tsx) above sheets
# Floor plan and Photos. The tracker and packs are the sprint pattern (T3.2). Platform-written, logged (T9.1); keys in
# backend/scripts/li101_written_T9.1.json.
PHY = json.loads((WEB / "src" / "lib" / "desk" / "li-phy.json").read_text(encoding="utf8"))
_A7 = [c for c in SPRINTS["controls"] if c.startswith("A.7.")]
STEPS["T9.1"] = {
    1: {"tool": "Control Testing › Test Plan", "ds": ["PHY"],
        "w": "Open dataset PHY and template T-LI-PHY: they open in Control Testing › Test Plan, the floor plan of the Manila head office above sheet Floor plan (columns Point · Name · What it is · Marking). Sheet Photos (columns Photo · What it shows · Control · Good practice or gap · Action) is step 2's. Mark the secure areas and the perimeter on the floor plan: for each point, choose Public area, Perimeter entry point, Office area or Secure area."},
    2: {"tool": "Control Testing › Test Plan", "ds": ["PHY"], "pages": [f"LI-{c}" for c in _A7],
        "w": "For each of the 20 photos on sheet Photos, decide which A.7 control it is evidence for, A.7.1 to A.7.14 (each control's LI task page is in Learn › Reference pages), and whether it shows good practice or a gap. For a gap, write the action and its owner."},
    3: {"pages": ["LI-A.7.5"],
        "w": "The server room sits below the staff kitchen and has no water detection. Which control does this affect?"},
    4: {"pages": ["LI-A.7.14"],
        "w": "Old laptops were given to staff after a quick format. What does A.7.14 need? Guidance: SITL-STD-001 Section 6 handling matrix."},
    5: {"tool": "Frameworks › Map Control", "ds": ["SPR-10"], "pages": [f"LI-{c}" for c in _A7] + ["LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), with this sprint's controls A.7.1 to A.7.14 after the rows of the earlier sprints. Its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.7.1 to LI-A.7.14 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-10, what was observed at the Manila office for each control, is the tracker's Observed column."},
    6: {"tool": "Frameworks › Map Control", "ds": ["SPR-10"], "pages": [f"LI-{c}" for c in _A7],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-10. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    7: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    8: {"tool": "Evidence › Link to Control", "ds": ["SPR-10"], "pages": ["LI-A.7.2", "LI-A.7.14"],
        "w": "Complete every sub-task of LI-A.7.2 and LI-A.7.14 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in (your PHY-WALK among them), or the item's own new file, prepared from dataset SPR-10. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    9: {"tool": "Frameworks › Map Control", "pages": [f"LI-{c}" for c in _A7 if c not in ("A.7.2", "A.7.14")] + ["LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.7.1, A.7.3 to A.7.13: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action for the control and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
}
PANELS["T9.1"] = {"tool": "Control Testing › Test Plan (PHY-WALK)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-PHY"] = ["T9.1", "PHY-WALK", "Physical security walkthrough checklist and findings, from dataset PHY (the floor plan of the Manila head office and 20 captioned photos). Sheet Floor plan: each point of the plan marked Public area, Perimeter entry point, Office area or Secure area. Sheet Photos: Photo · What it shows · Control (A.7.1–A.7.14) · Good practice or gap · Action", "Control Testing › Test Plan"]
DATASETS["PHY"] = {"h": ["Photo", "Where (floor plan)", "What it shows"], "r": PHY["photos"]}
SPRINT_DS.add("PHY")  # read by registers.ts from li-phy.json

# ---- T9.2, the vulnerability SLA test (R24) and control sprint 11 (A.8.1–A.8.8, A.8.13–A.8.17). His new item VUL-40 (40 findings
# sampled from dataset VUL, with key) is web/src/lib/desk/li-t92.json, worked as VUL-TEST (template T-VUL) in Control Testing ›
# Vulnerability Remediation Check, which held the old programme's 172 findings. The SLAs are SITL-POL-010 Section 4's for a LOW
# organisation (SITL-ADD-16 Section 5); Ref-Test rules is rewritten to them. The tracker and packs are the sprint pattern (T3.2).
# Platform-written, logged (T9.2); keys in backend/scripts/li101_written_T9.2.json.
T92 = json.loads((WEB / "src" / "lib" / "desk" / "li-t92.json").read_text(encoding="utf8"))
_S11 = next(s for s in SPRINTS["sprints"] if s["task"] == "T9.2")
_S11F = [c for c in _S11["controls"] if c not in _S11["deep"]]
STEPS["T9.2"] = {
    1: {"tool": "Control Testing › Vulnerability Remediation Check", "ds": ["VUL-40"], "pages": ["Ref-Test rules"],
        "w": "Open dataset VUL-40 and template T-VUL: they open in Control Testing › Vulnerability Remediation Check, the 40 findings sampled from the Manila scanner's dataset VUL, each with its asset, exposure, CVSS, KEV listing, dates and exception. For each finding record its class with the programme classification rule (rule R24, Ref-Test rules in Learn › Reference pages), its due date, and its status on the test date, 30 November 2026: fixed on time and verified by re-scan, open and not yet due, covered by a valid exception, or a breach (SITL-POL-010 Sections 4, 6.1, 7.1 and 10)."},
    2: {"pages": ["Ref-Test rules"],
        "w": "An internet-facing, KEV-listed vulnerability was detected 10 days ago, is not fixed and has no exception. What is its status?"},
    3: {"tool": "Frameworks › Map Control", "ds": ["SPR-11"], "pages": [f"LI-{c}" for c in _S11["controls"]] + ["LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), with this sprint's controls A.8.1 to A.8.8 and A.8.13 to A.8.17 after the rows of the earlier sprints. Its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.8.1 to LI-A.8.17 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-11, what was observed at the Manila office for each control, is the tracker's Observed column."},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-11"], "pages": [f"LI-{c}" for c in _S11["controls"]],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-11. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    5: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    6: {"tool": "Evidence › Link to Control", "ds": ["SPR-11"], "pages": ["LI-A.8.8", "LI-A.8.13"],
        "w": "Complete every sub-task of LI-A.8.8 and LI-A.8.13 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in (your VUL-TEST among them), or the item's own new file, prepared from dataset SPR-11. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    7: {"tool": "Frameworks › Map Control", "pages": [f"LI-{c}" for c in _S11F] + ["LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.8.1 to A.8.7 and A.8.14 to A.8.17: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3 (or keep it, where it is at Level 3 already) and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    8: {"w": "Backups run daily, but no restore has been tested in 12 months; SITL-POL-009 Section 4 sets a semi-annual restore test. What do you record for A.8.13?"},
    9: {"pages": ["LI-A.8.15"],
        "w": "Security logs are kept for 7 days and administrators can delete them. Which control is affected?"},
}
PANELS["T9.2"] = {"tool": "Control Testing › Vulnerability Remediation Check (VUL-TEST)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-VUL"] = ["T9.2", "VUL-TEST", "SLA test workbook for a sample of vulnerability findings (rule R24, SITL-POL-010): each finding of dataset VUL-40 with its asset, exposure, CVSS, KEV listing, first detected, closed and last-scan dates and its exception, and the tester's Class (R24), Due date and Status at the test date", "Control Testing › Vulnerability Remediation Check"]
DATASETS["VUL-40"] = {"h": T92["h"], "r": T92["r"]}
SPRINT_DS.add("VUL-40")  # read by registers.ts from li-t92.json
# His input "Programme classification rule (Ref-Test rules, Learn › Reference)": the pack's page held four rules of old tasks (the
# SLA classes labelled T8.1, a SOC 2 bridge letter, vendor tiering and the test conclusion); only T9.2 cites it. Rewritten to
# what VUL-TEST applies, each line with its source in SITL-POL-010.
PAGES["Ref-Test rules"] = {
    "note": "The rules the vulnerability SLA test applies (T9.2, VUL-TEST), each with where it comes from in SITL-POL-010 (Policies › Policy Library). Rule R24 (Ref-Rules) is the short form of the first two rows.",
    "h": ["Rule", "Text"],
    "r": [
        ["Vulnerability class (rule R24)", "Class 1: on an internet-facing asset, KEV-listed (in the CISA Known Exploited Vulnerabilities catalogue) or Critical → 7 days. Class 2: on an internal asset, Critical or KEV-listed → 14 days. Class 3: High → 30 days. Class 4: Medium → 90 days. Critical is CVSS 9.0 or more, High 7.0 to 8.9, Medium 4.0 to 6.9. The days are SITL-POL-010 Section 4's for a LOW organisation, as SITL-ADD-16 Section 5 sets them for GlobalConnect."],
        ["Due date", "Due = first detected + the class's days, counted in calendar days from the date the finding was first detected (SITL-POL-010 Section 3.1 and Section 6.1, step 2)."],
        ["Status at the test date", "Within SLA: closed on or before its due date and verified by a later scan that no longer finds it; open, with its due date not yet passed; or past its due date under a valid exception. Anything else is a breach: closed after its due date, or open past its due date with no valid exception. A closure that no later scan confirms, or that a later scan still finds, is open again with its original due date (SITL-POL-010 Section 6.1, step 4, and Section 10)."],
        ["Valid exception", "Approved by the system owner and the CISO, with a compensating control recorded, and not expired on the date it is relied on; it lasts six months at most. A compensating control reduces the risk but never closes the finding (SITL-POL-010 Section 7.1)."],
        ["SLA compliance", "For each class: findings within SLA ÷ all findings of the class × 100, to one decimal. Targets: classes 1–2, 90% or more (red below 80%); classes 3–4, 95% or more (SITL-POL-010 Section 10)."],
    ],
}


# ---- T7.2, supplier and cloud security, control sprint 7. VEN-TIER (template T-VEN) is worked in Vendors › Set Risk Tier and
# VEN-CL in Vendors › Contract & DPA Check, which held the old T9.1's Lumen forms and the pack's clause table; the tracker and
# the packs in the sprints' screens; LI-CLD (his new item T-LI-CLD) in Policies › New from Template. Ref-Cloud is the sheet rule
# L19 names: written in our words (the shared-responsibility model; ISO/IEC 27017 CLD.6.3.1 asks for the split to be agreed).
# Platform-written, logged (T7.2): the step texts below (his, tightened), the page, the screens' text.
STEPS["T7.2"] = {
    1: {"tool": "Vendors › Set Risk Tier",
        "w": "For each of the three Manila suppliers of dataset SPR-07, decide its tier in VEN-TIER, the tiering record (template T-VEN): it opens in Vendors › Set Risk Tier with each supplier's intake form. Tiers as rule R35 defines them, its terms read as SITL-POL-013 Section 3.1 says. Guidance: data handled, access, criticality and substitutability. Record the tier and the term of R35 that decides it."},
    2: {"tool": "Vendors › Contract & DPA Check",
        "w": "Open VEN-CL, the contract clause checklist: it opens in Vendors › Contract & DPA Check. For each supplier, decide which required clauses its contract holds, for its tier and hosting location: confidentiality, security requirements, incident notification, right to audit, sub-contracting, return and deletion of data, termination, and the transfer mechanism (rule R27, SITL-POL-013 Section 6.3)."},
    3: {"tool": "Frameworks › Map Control", "ds": ["SPR-07"], "pages": ["LI-A.5.19", "LI-A.5.20", "LI-A.5.21", "LI-A.5.22", "LI-A.5.23", "LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), with this sprint's controls: A.5.19, A.5.20, A.5.21, A.5.22, A.5.23, after the earlier sprints' rows. Its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.5.19 to LI-A.5.23 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-07, what was observed at the Manila office for each control, is the tracker's Observed column."},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-07"], "pages": ["LI-A.5.19", "LI-A.5.20", "LI-A.5.21", "LI-A.5.22", "LI-A.5.23"],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-07. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    5: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    6: {"tool": "Evidence › Link to Control", "ds": ["SPR-07"], "pages": ["LI-A.5.19", "LI-A.5.23"],
        "w": "Complete every sub-task of LI-A.5.19 and LI-A.5.23 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-07. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    7: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.20", "LI-A.5.21", "LI-A.5.22", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.5.20, A.5.21 and A.5.22: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action that would take the control to Level 3, and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model)."},
    8: {"tool": "Policies › New from Template", "pages": ["Ref-Cloud"],
        "w": "Who patches the application of Deskline Cloud, the SaaS ticketing tool? Then: fill the shared-responsibility matrix in LI-CLD, the cloud & supply-chain addendum (template T-LI-CLD), which opens in Policies › New from Template: the service model from the intake form, then who secures each part, from Ref-Cloud (rule L19)."},
    9: {"w": "Which clauses are essential in the agreement with a supplier that holds Manila customer data? Guidance: SITL-POL-013 Section 6.3."},
}
PANELS["T7.2"] = {"tool": "Vendors › Set Risk Tier (VEN-TIER)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-VEN"] = ["T7.2", "VEN-TIER", "Tiering record (SITL-POL-013 Section 6.1, step 2): each supplier's intake facts (service, data received, volume, users, business criticality, substitutability), its tier by rule R35 (Critical, High, Medium, Low) and the term of R35 that decided it", "Vendors › Set Risk Tier"]
TEMPLATES["T-LI-CLD"] = ["T7.2", "LI-CLD", "Cloud & supply-chain addendum (SITL-POL-021, rule L19). Sheet Matrix: the service model, from the intake form, and the shared-responsibility matrix, who secures each part of the service, the provider or the office (Ref-Cloud). Sheet Questions: the five fixed cloud and supply-chain questions with the provider's answers", "Policies › New from Template"]
PAGES["Ref-Cloud"] = {"note": "Rule L19's sheet. Who secures what under each cloud service model, and the five fixed cloud and supply-chain questions every cloud service is asked. Summarised in our own words from the shared-responsibility model that ISO/IEC 27017 (control CLD.6.3.1) asks a provider and its customer to agree; SITL-POL-021 Section 3.1 asks for a matrix for each service. The model is read from the intake form's delivery line: whoever runs the application, the platform and the servers.", "h": ["Service model", "The provider secures", "The customer (the office) secures"], "r": [
    ["IaaS (infrastructure as a service)", "Data centres, hardware, the network fabric and the virtualisation layer", "Operating systems and their patches, platforms and applications, user accounts and access, its data, encryption keys, network rules, logging"],
    ["PaaS (platform as a service)", "Data centres, hardware, network, virtualisation, operating systems and the runtime platform, with their patches", "Its application code, user accounts and access, its data, encryption keys, configuration, exporting the logs"],
    ["SaaS (software as a service)", "Data centres, hardware, network and hosting, operating systems and platform, and the application itself, with its patches", "User accounts and access (single sign-on, MFA, roles, leavers), its data and how it is classified and shared, configuration and retention settings, integrations and API keys, exporting and reviewing the audit log"],
    ["Fixed question 1", "In which countries is our data stored and processed, and can we choose the region?", ""],
    ["Fixed question 2", "Who holds the encryption keys, and can we bring or manage our own?", ""],
    ["Fixed question 3", "How will you return and delete our data at exit, and in what format?", ""],
    ["Fixed question 4", "Which sub-processors and software components can access or handle our data?", ""],
    ["Fixed question 5", "How do you check the provenance and security of the software and updates you deliver to us?", ""],
]}
# His rule L19's text is kept; it names the sheet above.
TP_T72 = {
    "vendors|Vendor Intake": ("Vendors › Vendor Intake", "SPR-07", "<b>SPR-07</b> The intake forms of three Manila suppliers: Deskline Cloud, the service desk's SaaS ticketing tool; VeriPass, the KYC identity-check provider; PayWise, the payroll provider. Their answers are the columns of the tiering record VEN-TIER.", "They open with the tiering record, in Vendors › Set Risk Tier (T7.2, step 1).", "The intake forms of SPR-07"),
    "vendors|Set Risk Tier": ("Vendors › Set Risk Tier", "VEN-TIER", "<b>VEN-TIER</b> Tiering record (template T-VEN): each supplier's intake facts and its tier by rule R35, with the term that decided it.", "It opens from T7.2's first step, which fills it.", "The tiering record (R35)"),
    "vendors|Contract & DPA Check": ("Vendors › Contract & DPA Check", "VEN-CL", "<b>VEN-CL</b> Contract clause checklist: each supplier's contract held against the clauses its tier and hosting require (rule R27, SITL-POL-013 Section 6.3).", "It opens from T7.2's second step, which fills it.", "The contract clause checklist"),
}

# ---- T8.2, control sprint 9 (A.5.29–A.5.36) with BIA-RTO, OBL-REG and ROPA. His new item T-LI-BIA and dataset BIA-5 are worked
# in Control Testing › Restore Test Review (the old T8.2's restore-test variant); T-OBL and T-ROPA in Regulatory Watch ›
# Obligations Register, with the customer-support processing activity described on Regulatory Watch › RoPA & Data Flows (both
# held old programme content). BIA-5's rows are registers.ts BIA_5 (asserted). Platform-written, logged (T8.2).
_T82_CTRL = ["A.5.29", "A.5.30", "A.5.31", "A.5.32", "A.5.33", "A.5.34", "A.5.35", "A.5.36"]
STEPS["T8.2"] = {
    1: {"tool": "Control Testing › Restore Test Review", "ds": ["BIA-5"],
        "w": "Open dataset BIA-5 and template T-LI-BIA: the business impact extract opens in Control Testing › Restore Test Review, with the five Manila services of BIA-5, each with its RTO and RPO and the times the last DR test logged. For each service, record what the test achieved, the time to recover and the data lost, and Met or Not met against the RTO and RPO. The first row is a LearnTech Educational Solutions worked example."},
    2: {"pages": ["LI-A.5.30"],
        "w": "The last DR test recovered the CRM in 9 hours; its RTO is 4 hours. What do you record for A.5.30?"},
    3: {"tool": "Regulatory Watch › Obligations Register", "pages": ["Ref-Policy portal"],
        "w": "Open template T-OBL: it opens in Regulatory Watch › Obligations Register. Record ten obligations for Manila from SITL-ADD-16 Section 2, Section 2.1 and Section 6, splitting compound duties (R10), each with its type and the SITL policy whose owner owns it. Then, on the same sheet, fill the RoPA entry (template T-ROPA) for the customer-support processing activity described on Regulatory Watch › RoPA & Data Flows: its role, its lawful basis (SITL-POL-017 Section 3.1) and its DPIA screening (R29)."},
    4: {"tool": "Frameworks › Map Control", "ds": ["SPR-09"], "pages": [f"LI-{c}" for c in _T82_CTRL] + ["LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action). This sprint's controls are A.5.29 to A.5.36, below the earlier sprints' rows; its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.5.29 to LI-A.5.36 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-09, what was observed at the Manila office for each control, is the tracker's Observed column."},
    5: {"tool": "Frameworks › Map Control", "ds": ["SPR-09"], "pages": [f"LI-{c}" for c in _T82_CTRL],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-09. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    6: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    7: {"tool": "Evidence › Link to Control", "ds": ["SPR-09"], "pages": ["LI-A.5.30", "LI-A.5.31"],
        "w": "Complete every sub-task of LI-A.5.30 and LI-A.5.31 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in, or the item's own new file, prepared from dataset SPR-09. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    8: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.29", "LI-A.5.32", "LI-A.5.33", "LI-A.5.34", "LI-A.5.35", "LI-A.5.36", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.5.29, A.5.32, A.5.33, A.5.34, A.5.35 and A.5.36: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model): the step to Level 3 where the control is below it, or the step that closes its gap where it is at Level 3 already."},
    9: {"pages": ["LI-A.5.35"],
        "w": "Who may carry out the independent review of the Manila IT controls (A.5.35)?"},
}
PANELS["T8.2"] = {"tool": "Frameworks › Map Control (CIT-S9)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-BIA"] = ["T8.2", "BIA-RTO", "Business impact extract (A.5.30): each service of the office with the system it runs on, its RTO and RPO from the business impact analysis, the times the last DR test logged (outage declared, service back for users, data recovered up to), the time to recover and the data lost it achieved, and Met or Not met; a LearnTech Educational Solutions worked row", "Control Testing › Restore Test Review"]
TEMPLATES["T-OBL"] = ["T8.2", "OBL-REG", "Obligations register extract (A.5.31, SITL-POL-016 Section 3.1): one obligation per row (rule R10), each with where it is read, its type (Statutory, Regulatory or Contractual), the SITL policy it is met under and that policy's owner", "Regulatory Watch › Obligations Register"]
TEMPLATES["T-ROPA"] = ["T8.2", "ROPA", "Record of processing activities entry (A.5.34, SITL-POL-017 Section 3.1): the processing activity, the organisation's role and the lawful basis, and the DPIA screening (rule R29): the triggers involved and whether a DPIA is required, and by whom", "Regulatory Watch › Obligations Register"]
DATASETS["BIA-5"] = {"h": ["Service", "Runs on", "RTO", "RPO", "DR test: outage declared", "DR test: service back for users", "DR test: data recovered up to"], "r": [
    ["Customer service (inbound and outbound)", "CRM platforms (Salesforce, HelpLoop)", "4 h", "1 h", "2026-06-13 06:00", "2026-06-13 15:00", "2026-06-13 05:30"],
    ["Voice calls", "PBX/telephony and VoIP/UCaaS platforms", "2 h", "15 min", "2026-06-13 06:00", "2026-06-13 07:30", "2026-06-13 05:50"],
    ["Back-office data processing", "Production delivery platform", "8 h", "4 h", "2026-06-13 06:00", "2026-06-13 13:00", "2026-06-13 02:00"],
    ["Quality monitoring and call recording", "Call recording servers", "24 h", "24 h", "2026-06-13 06:00", "2026-06-14 05:00", "2026-06-12 03:00"],
    ["Agent scheduling", "Workforce management system", "12 h", "8 h", "2026-06-13 06:00", "2026-06-13 14:00", "2026-06-13 00:00"],
]}
# Regulatory Watch › RoPA & Data Flows held the old T10.1's LearnTech LMS description: the description his step 3's RoPA entry is
# filled from, as the business owner gives it (SITL-POL-017 Section 5). Written for GlobalConnect Manila from SITL-ADD-16
# Sections 1, 4 and 9; the DPIA screening is left to the learner.
T82_ROPA_DESC = [
    ["Activity", "Customer support for client companies: inbound customer service by voice, chat and e-mail"],
    ["Office", "Manila, Philippines"],
    ["Described by", "Operations Manager, customer service floors, Manila (the business owner of the processing, SITL-POL-017 Section 5)"],
    ["Clients", "Fortune 500 companies that outsource their customer service to GlobalConnect, each under a master services agreement with a data-protection agreement (SITL-ADD-16 Section 4)"],
    ["Who decides", "Each client decides why its customers' data is processed and how: the scripts, the data its agents may see, and how long records are kept. GlobalConnect's agents work only on the client's written instructions, in the client's own CRM tenant, and use the data for nothing of GlobalConnect's own"],
    ["Data subjects", "The clients' end-customers who call, chat or write about the service they bought from the client"],
    ["Personal data", "Name, address, account number and contact details; the query and its history in the client's CRM; the recording of every call"],
    ["Why it is needed", "End-customers contact the client about the service they bought; answering them is part of what the client agreed to give them when they bought it. No law requires the client to run the support line"],
    ["Recording and monitoring", "Every call is recorded on the call recording servers. Quality Assurance listens to a sample of each agent's calls every week and scores them by hand against the client's script"],
    ["Not part of this activity", "Health information (healthcare-claims support) and identity documents (KYC for financial clients): each is its own processing activity with its own entry"],
    ["Systems", "CRM platforms (Salesforce, HelpLoop) in each client's tenant; VoIP and UCaaS platforms; call recording servers; QA monitoring tools"],
    ["Recipients", "The client, in its own CRM tenant; GlobalConnect's agents, team leaders and QA analysts at Manila"],
    ["Retention", "As each client's data-protection agreement sets it"],
]


# ---- T8.1, incident management and evidence, control sprint 8. IR-TTX (his new item TTX / T-LI-TTX: the tabletop scenario with
# six injects in UTC, and the exercise record frame) is worked in Control Testing › Record Result, which held the old R19 rule
# texts; its sheet Notification is step 4's part 2. The tracker and the packs in the sprints' screens. One source for the
# scenario, web/src/lib/desk/li-ttx.json, read by registers.ts too. Platform-written, logged (T8.1): the step texts below (his,
# tightened for the screen), the dataset, the screen's text.
TTX = json.loads((WEB / "src" / "lib" / "desk" / "li-ttx.json").read_text(encoding="utf8"))
_T81_CTRL = ["A.5.5", "A.5.24", "A.5.25", "A.5.26", "A.5.27", "A.5.28", "A.6.8"]
STEPS["T8.1"] = {
    1: {"tool": "Control Testing › Record Result", "ds": ["TTX"],
        "w": "Open dataset TTX and template T-LI-TTX: the exercise record IR-TTX opens in Control Testing › Record Result (columns Inject · UTC time · Phase · Decision · Owner · Control), with the scenario above it and its six injects in the order they are played. Read the scenario and the six injects, and find three facts in them."},
    2: {"tool": "Control Testing › Record Result", "ds": ["TTX"],
        "w": "For each inject, decide in column Phase of IR-TTX the stage of the incident life cycle it belongs to. Guidance: SITL-POL-014 Section 6.1."},
    3: {"w": "An engineer wants to reimage the compromised laptop straight away. What comes first? Guidance: SITL-POL-014 Section 3.1 and Section 7.1."},
    4: {"tool": "Control Testing › Record Result", "ds": ["TTX"],
        "w": "Personal data of customers in the Philippines is affected. When must the authority be notified? Then: on sheet Notification of IR-TTX, record the discovery time and the deadline, in UTC (rule R30, SITL-POL-014 Section 6.3)."},
    5: {"tool": "Frameworks › Map Control", "ds": ["SPR-08"], "pages": [f"LI-{c}" for c in _T81_CTRL] + ["LI-Q fixed questions"],
        "w": "Open your control implementation tracker, template T-LI-CIT: it opens in Frameworks › Map Control (columns A Control · B Title · C Owner role · D Status · E Maturity level · F Evidence ref · G Gap / next action), with this sprint's controls A.5.5, A.5.24 to A.5.28 and A.6.8 after the rows of the earlier sprints. Its first row is a LearnTech Educational Solutions worked example. For each control, open its Lead Implementer task, LI-A.5.5 to LI-A.6.8 in Learn › Reference pages, and read what it requires and its evidence focus. The fixed questions LI-Q1 to LI-Q8 are on LI-Q fixed questions, for whenever you are unsure. Dataset SPR-08, what was observed at the Manila office for each control, is the tracker's Observed column."},
    6: {"tool": "Frameworks › Map Control", "ds": ["SPR-08"], "pages": [f"LI-{c}" for c in _T81_CTRL],
        "w": "For each sprint control, decide in column D its implementation status at GlobalConnect Customer Solutions, Manila, from the observations in SPR-08. Guidance: compare each observation with \"What it requires\" in the LI task and the ISO/IEC 27002:2022 guidance section of the control."},
    7: {"tool": "Frameworks › Map Control", "pages": ["Ref-Maturity Model"],
        "w": "For each sprint control, decide in column E its current maturity level. Guidance: the Maturity Model (Ref-Maturity Model, in Learn › Reference pages): documented? approved? applied organisation-wide? records? reviewed?"},
    8: {"tool": "Evidence › Link to Control", "ds": ["SPR-08"], "pages": ["LI-A.5.24", "LI-A.5.28"],
        "w": "Complete every sub-task of LI-A.5.24 and LI-A.5.28 in the Lead Implementer task library (Learn › Reference pages): the evidence packs open in Evidence › Link to Control. For each sub-task, record the file in 02_Working that holds its evidence item for the Manila office: a deliverable you already handed in (your IR-TTX among them), or the item's own new file, prepared from dataset SPR-08. For anything you cannot evidence, choose None and write the gap and the next action. The refs fill T-LI-CIT column F, and the gaps column G."},
    9: {"tool": "Frameworks › Map Control", "pages": ["LI-A.5.5", "LI-A.5.25", "LI-A.5.26", "LI-A.5.27", "LI-A.6.8", "LI-Q fixed questions", "Ref-Maturity Model"],
        "w": "For A.5.5, A.5.25, A.5.26, A.5.27 and A.6.8: record the file of sub-task 01 of each LI task (its first evidence item) in T-LI-CIT column F. In column G choose the next action and the Level 4 measure you would track (fixed question LI-Q2 and the Maturity Model): the step to Level 3 where the control is below it, or the step that closes its gap where it is at Level 3 already."},
    10: {"pages": ["LI-A.6.8"],
         "w": "Staff saw a suspicious e-mail yesterday but did not report it, because they did not know how. Which control's evidence is weak?"},
}
PANELS["T8.1"] = {"tool": "Control Testing › Record Result (IR-TTX)", "stamp": "Template", "kind": "table", "pl": {}}
TEMPLATES["T-LI-TTX"] = ["T8.1", "IR-TTX", "Tabletop exercise record (A.5.24–A.5.28), from dataset TTX (the scenario and its six injects in UTC): Inject · UTC time · Phase (the incident life cycle, A.5.24–A.5.28) · Decision · Owner · Control. Sheet Notification: the authority's regime and clock (SITL-ADD-16 Section 2), the discovery time and the deadline in UTC (rule R30, SITL-POL-014 Section 6.3)", "Control Testing › Record Result"]
DATASETS["TTX"] = {"h": TTX["head"], "r": [["Scenario", "2026-11-24", TTX["scenario"], "Facilitator: Incident Response & Crisis Manager (GRC); observer: Information Security Auditor", ""]]
                   + [[*r[:4], r[4] or TTX["open"][r[0]]] for r in TTX["injects"]]}
SPRINT_DS.add("TTX")  # read by registers.ts from li-ttx.json


# ---- The Inbox: task messages (docs/li101/inbox.md, "Inbox pattern"). One or two per task, from the Group GRC Office role (or
# the organisation's own officer) who would really send it. Each is a pushback or a question that arrives AFTER the step whose
# call it tests (`step` = the step it waits at, INJ_AT in web/src/lib/desk/inbox.ts), so it never gives that step's answer away.
# The reply (3 options, one best, a reason and consequence each) is the server's key in backend/scripts/li101_written_inbox.json.
# Canonical org names: the desk swaps them per learner. Add new messages above the marker line (Edit tool, your lines only).
INBOX = {
    "F1.2-J1": {"task": "F1.2", "step": 4, "sender": "Compliance Manager", "ref": "Rule L01",
        "notice": "Sales is answering a client's tender today and has drafted this line: \"GlobalConnect's ISMS meets ISO/IEC 27002:2022, the ISO 27000 family standard.\" I have until noon to approve it or send it back. What do I tell Sales?",
        "options": ["Approve it: the 27000 standards are one family, so naming 27002 is close enough for a tender",
                    "Send it back: the standard to name is ISO/IEC 27001:2022, the one a certificate is issued against, and ISO/IEC 27002:2022 can be described as the guidance behind our controls",
                    "Send it back and ask Sales to write \"international best practice\" instead of a standard's number, so nobody can challenge it"]},
    "F1.3-J1": {"task": "F1.3", "step": 7, "sender": "Chief Information Security Officer (CISO)", "ref": "Clause 4.2 c); your CTX-IP (step 6)",
        "notice": "The Manila Compliance & DPO lead has seen your CTX-IP draft. She asks me to mark every requirement of the Regulators row as addressed through the ISMS, DOLE labour law compliance included: \"they are all legal requirements, so they all belong in the ISMS.\" What do I tell her?",
        "options": ["Mark all three: she is the compliance lead, and a legal requirement is always an ISMS requirement",
                    "Remove the Regulators row from CTX-IP: Legal deals with regulators, so they do not belong in an ISMS register",
                    "Keep DOLE labour law compliance out of that column: HR meets it, and the ISMS addresses the requirements about protecting information, such as the NPC registration and the clients' data laws"]},
    "F2.1-J1": {"task": "F2.1", "step": 6, "sender": "Org CEO", "ref": "Clause 4.3 c); your LI-SCOPE section 7",
        "notice": "Manila's payroll is run by an outside provider on its own systems. I would like it left out of the ISMS scope: it is not our system, and it is one less thing to certify. Can we do that?",
        "options": ["Not as an exclusion: the provider's own systems stay outside the scope, but the dependency on the provider stays in LI-SCOPE section 7 as an interface, with the supplier control that governs it",
                    "Yes: write payroll under Exclusions in section 5, since the provider runs it and it is not ours",
                    "Yes, once the provider shows its own ISO/IEC 27001 certificate: then payroll can be left out"]},
    "F2.2-J1": {"task": "F2.2", "step": 6, "sender": "Compliance Manager", "ref": "Rule L13",
        "notice": "I am writing the one-page board summary of your gap analysis. The Manila operations director looked at your sheet Gap, where \"Partially met\" is the most common status, and asks me to show it as \"Met\": \"most of it is in place,\" she says. Can I?",
        "options": ["Yes: show Partially met as Met in the board summary and keep the detail in the file",
                    "No: Partially met means some of what the clause requires is missing, unapproved or unrecorded (rule L13); show the three statuses as rated, with the biggest gaps first",
                    "Show only Fully met and Not met, counting Partially met as Not met, to stay on the safe side"]},
    "T3.1-J1": {"task": "T3.1", "step": 7, "sender": "Chief Information Security Officer (CISO)", "ref": "SITL-POL-000 Section 7; your POL-SET",
        "notice": "I am building tomorrow's audit pack. The owner of SITL-POL-011 says he went through it in June and found nothing to change, so I should show it as Current. The policy portal still says last approved 29 September 2025. What goes in your POL-SET for that policy?",
        "options": ["Current: his June review counts, and I put a note beside the row",
                    "Missing: a review that left no record is the same as having no policy",
                    "Overdue: the register follows the portal's approval date against the yearly review in SITL-POL-000 Section 7; he logs his June review and has the policy re-approved, and then I update the row"]},
    "T3.2-J1": {"task": "T3.2", "step": 9, "sender": "Finance lead, Manila", "ref": "A.5.3; ISO/IEC 27002:2022 Section 5.3",
        "notice": "I hear our finance team of three is on your tracker as a conflict: one of us both creates suppliers and approves their payments. I cannot hire a fourth person this year, and I would rather the sheet did not call it a conflict. Can you leave it off?",
        "options": ["No: it stays on the sheet as a segregation conflict, with a compensating control such as an independent check of supplier-master changes, and an owner for that check",
                    "Yes: a team of three cannot separate the duties, so there is nothing to record",
                    "Keep the row but call it a \"working practice\", so the sheet reads more gently"]},
    "T4.1-J1": {"task": "T4.1", "step": 4, "sender": "Cyber Risk Manager", "ref": "Clause 6.1.2 b); SITL-ERM-001 Sections 6.2–6.4",
        "notice": "The Manila operations director wants her floor's risks scored on a 3-point scale: five levels feel too fine, and the Group scales are \"for head office\". I have to answer her before your method card goes to the register. Do we let her?",
        "options": ["Yes: she knows her floor best, and the scores can be converted to the Group scale later",
                    "No: every office scores on the same Group scales, so the results can be compared; if five levels are too fine, that goes to the owner of the Group method as a change request",
                    "Yes for her floor only, with a note of the difference in the register"]},
    "T4.2-J1": {"task": "T4.2", "step": 9, "sender": "Chief Information Security Officer (CISO)", "ref": "A.5.7; THR-5",
        "notice": "Item 2 of this week's brief, the exploited flaw in our VPN product, went to the Manila site lead last night. The risk committee now asks whether every item of THR-5 needs its own new risk on the register before Thursday. What do I tell them?",
        "options": ["Yes: one new risk per item, so the register shows the whole brief",
                    "No: only the item that reports active exploitation matters, and the other four are background",
                    "Not every item: where a risk is already on the register it is not added again, its likelihood is reviewed and the brief is cited as the source (A.5.7); only items with no risk yet become new risks"]},
    "T5.1-J1": {"task": "T5.1", "step": 6, "sender": "Head of Infrastructure", "ref": "Rule L12; SITL-ERM-001 Section 7",
        "notice": "R-16-HQ-16 is mine, the VPN gateway. The vendor's fix is out, but applying it interrupts remote access, and the night-shift supervisors and IT on-call reach the network only through the VPN. I would rather retain the risk for now and sign the acceptance myself. What do you put in the plan?",
        "options": ["Not as a retained risk: a Critical risk is treated, not accepted, so it stays on the plan with its controls and a due date, and his worry about the interruption goes into agreeing that date",
                    "Retain it, with the acceptance form signed by him as the risk owner, since the risk is his",
                    "Retain it for a short time, with the Org CRCO approving and a review in January"]},
    "T5.2-J1": {"task": "T5.2", "step": 6, "sender": "Org CEO", "ref": "Rule L06; Clause 6.1.3 d)",
        "notice": "I have to sign the Statement of Applicability this week, and I would rather it did not open on controls we have not implemented. The sprints found some missing. Can we show those as Not applicable until we get to them?",
        "options": ["Yes: until a control is implemented it does not apply to the office, so Not applicable is accurate for now",
                    "No: Not applicable is for a control whose subject the office does nothing about (rule L06); each control the sprints found missing stays Applicable with its source, and Implemented? shows its status, or the sprint and week where it is planned",
                    "Take those controls out of the SoA until they are implemented, and list them in a separate gap file"]},
    "T6.1-J1": {"task": "T6.1", "step": 3, "sender": "Chief Information Security Officer (CISO)", "ref": "Clause 7.2 d); your LI-COMM",
        "notice": "Jose Reyes says he holds the ISO/IEC 27005 Risk Manager certificate, and I have seen it myself in his office. I would like his row in your LI-COMM to read Competent, evidence held, today. Can you do that?",
        "options": ["Yes: you have seen the certificate yourself, and the CISO's word is evidence enough for Clause 7.2",
                    "Mark it Gap, action needed: without a certificate on file he is not competent, so he should be enrolled on the course again",
                    "Not as evidence held: Manila HR has no copy, so his row stays Competent, but no documented evidence, and the action is to obtain a copy of the certificate and have HR file it; the row changes once it is on file"]},
    "T6.2-J1": {"task": "T6.2", "step": 9, "sender": "Org CEO", "ref": "A.6.1; LI-A.6.1",
        "notice": "The contractor who started before his background screening was complete is asking the team lead for the same access as everyone else. The team lead has come to me: \"the check is only a formality, and he already works here.\" I have to answer today. What do I tell the team lead?",
        "options": ["Not yet: the exception stays recorded with its reason and an owner, and his access to sensitive information stays restricted until the screening is back; then his access is widened and the exception closed",
                    "Yes: he already works here, so give him full access and let the screening finish in the background",
                    "Take him off the floor until the screening is back, because nobody may work before the check"]},
    "T7.1-J1": {"task": "T7.1", "step": 9, "sender": "Compliance Manager", "ref": "SITL-POL-006 Section 3.1; A.5.16",
        "notice": "The client who complained on 4 November that agents on its account shared CRM log-ins has asked in writing where we stand. Service Delivery tells me the five after-hours agents still sign in with the one shared \"support\" account. I have to write back today. What do I tell the client?",
        "options": ["That after-hours support is a special case, so the shared account is approved practice at Manila",
                    "That it is not fixed yet: the shared account breaks the Group rule that every person signs in with their own account, so each of the five gets a named account, with an owner and a date, and we report back when the access log shows no shared sign-ins",
                    "That it is fixed, once the shared account's password has been changed"]},
    "T7.2-J1": {"task": "T7.2", "step": 8, "sender": "Finance lead, Manila", "ref": "SITL-POL-013 Sections 4 and 6.1; your CIT-S7",
        "notice": "PayWise runs our payroll, and I hear its reassessment is overdue. A file goes to them every fortnight and I would rather not add a security questionnaire for them to answer this month. Can the reassessment wait until after the January payroll, with the vendor register showing it as not yet due?",
        "options": ["Yes: show it as not yet due until January, so the payroll runs are not disturbed",
                    "Take PayWise off the reassessment schedule, because its 2023 contract already covers the security it owes us",
                    "No: PayWise is a High supplier, so its reassessment is due on the schedule of SITL-POL-013 Section 4; the register keeps it overdue until it is done, with the Vendor / Third-Party Risk Analyst as owner and a new date agreed with Finance around the payroll runs"]},
    "T8.1-J1": {"task": "T8.1", "step": 11, "sender": "Incident Response & Crisis Manager (GRC)", "ref": "A.6.8; SITL-POL-014",
        "notice": "The team leader whose laptop it was has read the draft post-incident review. He asks that it not say he had seen the phishing e-mail the day before and not reported it: \"write that the e-mail reached me.\" I have until the review is filed to decide what the record says. What do I tell him?",
        "options": ["The record keeps what the review found: he had seen the e-mail and had not reported it, not knowing how; the actions go to the reporting route and to awareness, each with an owner and a date, and the review does not judge him",
                    "Record only that a phishing e-mail reached him: the review should name the attack, not the person",
                    "Record it as his breach of the reporting rule and pass it to HR for discipline, so everyone sees that reporting is not optional"]},
    "T8.2-J1": {"task": "T8.2", "step": 3, "sender": "Chief Information Officer", "ref": "A.5.30; LI-A.5.30; your BIA-RTO",
        "notice": "Corporate IT's report marks the DR test as passed, yet your BIA-RTO shows the CRM taking 9 hours against a 4-hour RTO. The simplest fix is to change the CRM's RTO to 9 hours, which is what the systems can really do. Do you agree?",
        "options": ["Yes: record 9 hours as the CRM's RTO, and the test then passes",
                    "No: the RTO comes from the business impact analysis and is not changed to fit a test; keep 4 hours in BIA-RTO, record the 9 hours as a gap with a remediation and a retest date, and take any change of the RTO to its owners as a separate decision",
                    "Keep 4 hours and mark the row Met, with a footnote that the recovery took longer than planned"]},
    "T9.1-J1": {"task": "T9.1", "step": 4, "sender": "Chief Information Security Officer (CISO)", "ref": "LI-A.7.1; your PHY-WALK (step 2)",
        "notice": "The Manila site lead has seen the photo of the fire exit in your walkthrough file and asks me to take it out: \"that door is a fire-safety matter for facilities, not for the ISMS.\" The file is due in the audit pack on Friday. What do I tell him?",
        "options": ["Take it out: if facilities owns the door, a walkthrough for the ISMS should not carry it",
                    "Keep the photo but mark it Good practice: a fire exit has to open for people leaving, and this one is not locked",
                    "Keep it: the photo shows a door in the perimeter held open with its alarm isolated, which is a finding on the walkthrough; facilities can own the action, but the finding stays"]},
    "T9.2-J1": {"task": "T9.2", "step": 3, "sender": "Manila IT manager", "ref": "SITL-POL-010 Sections 7.1 and 10; your VUL-TEST (step 1)",
        "notice": "My QA lead has booked the fix for the upload flaw on the QA monitoring server (VUL-0471) in the December maintenance window. He asks that your VUL-TEST shows it as within SLA until then: \"it is scheduled, so it is not late.\" Can you do that?",
        "options": ["No: on the test date it is open, past its due date and has no exception in the register, so a booked fix does not cover it; if he wants cover he asks the system owner and the Org CISO for an exception, with a compensating control and an expiry date",
                    "Yes: a fix with a date means the owner is acting on it, so the finding is within SLA until the window",
                    "Put it in a slower class: the QA server is not customer-facing, so a longer timescale fits and it is not yet late"]},
    "T10.1-J1": {"task": "T10.1", "step": 3, "sender": "Head of Infrastructure", "ref": "A.8.9; your CFG-BASE (step 1)",
        "notice": "My team will correct the settings that failed your check this week. Once they have, can your CFG-BASE show them as Compliant? The auditor will read the sheet as the state of the office, and I would rather it showed the fixed state.",
        "options": ["Yes: once a setting is fixed it is Compliant, and the sheet should show the current state",
                    "No: CFG-BASE records the settings as they were at the extract date, 30 November; each fix goes in as an action with an owner and a date, and the setting is checked again after it",
                    "Show them as Compliant, with the old value kept in a note so nothing is hidden"]},
    "T10.2-J1": {"task": "T10.2", "step": 2, "sender": "Manila development lead", "ref": "Rule R15; Ref-Sampling; your CHG-TEST (step 1)",
        "notice": "I have looked at the changes your draw picked, and a few of them were rushed ones. Could three be swapped for ordinary changes before you test? The sample should show how we usually work.",
        "options": ["Yes: swap them, the sample should show normal practice and he knows which changes were rushed",
                    "Draw the whole sample again with a new seed, so that nobody can say the three were picked",
                    "No: the draw stands and every change in it is tested as it is; swapping picks for better ones means the sample no longer stands for the whole population, and nobody could repeat it from its seed"]},
    "T11.1-J1": {"task": "T11.1", "step": 6, "sender": "Chief Information Security Officer (CISO)", "ref": "Clause 9.1; your LI-KPI and KPI-DASH",
        "notice": "For the management review I would like the A.8.8 line of your dashboard to read \"vulnerability scans run this month\". It is a number we always reach, and the board likes a green line. Can you set it that way?",
        "options": ["Not in place of the card's measure: a count of scans run shows the activity happened, not whether the findings were fixed in time; keep the card's measure, and show the scan count beside it as context if he wants it",
                    "Yes: a count of scans is easy to reproduce, so it is a safer measure than a percentage",
                    "Yes on the dashboard, and keep the card's own measure in the LI-KPI file only"]},
    "T11.2-J1": {"task": "T11.2", "step": 6, "sender": "Chief Information Security Officer (CISO)", "ref": "Clauses 9.2 and 10.2; your LI-NCR (step 5)",
        "notice": "Your two nonconformities in LI-NCR go into the pack for the management review on 14 January, and the review reads the pack. I would like them worded as observations: a nonconformity reads as a failure. Can you change them before you submit?",
        "options": ["Yes: an observation makes the same point without alarming the review, and it can still be acted on",
                    "No: each states a requirement the office has not met, with the evidence, so each is a nonconformity; the wording of the statement can be made neutral, but what they are cannot change",
                    "Keep one and reword the other as an observation: the Level 2 card is closer to meeting its requirement"]},
    "T12.1-J1": {"task": "T12.1", "step": 5, "sender": "Chief Information Security Officer (CISO)", "ref": "Clauses 9.2 and 9.3; rule L23; your LI-MR (step 4)",
        "notice": "The certification body has offered the first week of January for Stage 1, and I would like to take it and save a month. Can you put that on the readiness line of your LI-MR, so I can tell them yes?",
        "options": ["Yes: Stage 1 only reads documents, so the audits and the review can follow it before Stage 2",
                    "Yes, and ask the Org CEO to bring the management review forward into December to be in time",
                    "No: Stage 1 checks that internal audits and the management review have been planned and performed, and the first audits and the review on 14 January come after that week; the readiness line stays as rated"]},
    "T12.2-J1": {"task": "T12.2", "step": 4, "sender": "Chief Information Security Officer (CISO)", "ref": "Rule R34; Clause 9.3",
        "notice": "REQ-05 asks for the minutes of the latest management review. I can send the invitation and the draft agenda for 14 January against it, so the line is not empty. Will you put them in the log?",
        "options": ["No: an invitation and a draft agenda are not minutes with decisions, and the review has not met, so there are none; tell the auditor so, and that the minutes follow once it has met on 14 January",
                    "Yes: send them and describe them as the latest management review documents, so the auditor sees one is planned",
                    "Send nothing and log REQ-05 as answered: the auditor will see the 14 January booking in the review pack anyway"]},
    "T12.2-J2": {"task": "T12.2", "step": 6, "sender": "Chief Information Security Officer (CISO)", "ref": "Clauses 9.2.2 and 10.2; your LI-NCR-R (step 5)",
        "notice": "NC-1 in the Stage 1 report is about A.8.32 and our audit programme. But A.8.32 is in LI-AUD, so I would like to reply that the auditor misread it and ask for NC-1 to be withdrawn. Do you agree?",
        "options": ["Yes: A.8.32 is in the programme, so the auditor misread it, and the finding should be withdrawn",
                    "No: the finding is that no audit held before Stage 1 covered A.8.32, which is true, so we answer it with a correction, a cause and a corrective action, each with an owner and a date",
                    "Accept it, but ask the auditor to regrade it as an observation, since Stage 2 is only two months away"]},
    # INBOX: add new messages above this line.
}


def inbox(d: dict) -> None:
    """The messages above, as the desk's `inj` (task, week and the week's meeting text follow). Run after the old injects are cleared."""
    for tid in d["order"]:
        d["tasks"][tid]["inj"] = [j for j in d["tasks"][tid]["inj"] if j not in INBOX]
    for wk in d["weeks"]:
        wk["inj"] = [j for j in wk["inj"] if j not in INBOX]
    for jid, m in INBOX.items():
        t = d["tasks"][m["task"]]
        assert m["task"] in d["order"] and 1 <= m["step"] <= len(t["steps"]) and len(m["options"]) == 3, jid
        assert jid == f"{m['task']}-J{jid.rsplit('-J', 1)[1]}" and "§" not in json.dumps(m, ensure_ascii=False), jid
        d["inj"][jid] = {
            "task": m["task"], "due": t["due"], "id": jid, "type": "DECISION",
            "sim_notice": "Training scenario — the people, systems and data in this message are fictional.",
            "notice": m["notice"], "options": m["options"], "sender": m["sender"],
            "steps": ["Read the situation.", "Choose A, B or C.", "Read the feedback."],
            "ref": m["ref"], "assess": "Decision", "release_offset_min": 60 + 30 * m["step"], "dueDay": t["dueDay"],
        }
        t["inj"].append(jid)
        wk = d["weeks"][t["week"] - 1]
        assert wk["n"] == t["week"], jid
        wk["inj"].append(jid)
    for wk in d["weeks"]:  # the week's meeting text counts its messages
        n = len(wk["inj"])
        sentence = f"{n} message{'s arrive' if n > 1 else ' arrives'} in your inbox during your working hours. " if n else ""
        meet = re.sub(r"\d+ messages? arrives? in your inbox during your working hours\. ", "", wk["meet"])
        wk["meet"] = meet.replace("Every step has a help note", sentence + "Every step has a help note", 1)


def written(d: dict) -> None:
    for tid, steps in STEPS.items():
        for n, v in steps.items():
            s = d["tasks"][tid]["steps"][n - 1]
            if "tool" in v:
                sec, screen = v["tool"].split(" › ")
                key = f"{next(k for k, x in d['sections'].items() if x['t'] == sec)}|{screen}"
                assert key in d["tp"], key
                s["tool"], s["key"] = v["tool"], key
            if "w" in v:
                s["w"] = v["w"]
                s["refs"] = refs_of(v["w"], d)
            if "ds" in v:
                s["refs"]["ds"] = v["ds"]
            if "pages" in v:
                s["refs"]["pages"] = v["pages"]
            if "opt" in v:  # his lettered options, without an instruction the last one carried (T12.1)
                s["opt"] = v["opt"]
    for name, t in PAGES.items():
        d["pages"][name] = {**t, "n": len(t["r"])}
    assert all(p in d["pages"] for v in STEPS.values() for s in v.values() for p in s.get("pages", [])), "a step reads a page that does not exist"
    # A dataset's rows are also the sheet's given rows (registers.ts): the two must say the same.
    regs = (WEB / "src" / "lib" / "desk" / "registers.ts").read_text(encoding="utf8")
    for code, t in DATASETS.items():
        if code in SPRINT_DS:  # read by registers.ts from the same file
            continue
        for r in t["r"]:
            assert all(json.dumps(x, ensure_ascii=False) in regs for x in r), (code, r[0])
    d["ds"].update(DATASETS)
    # T3.1's POL-SET looks each policy's owner and last approval up (registers.ts POL_INDEX): the owner as SITL-POL-000
    # Section 3 gives it, the date as Ref-Policy portal does.
    idx = (WEB / "public" / "desk" / "docs" / "SITL-POL-000.md").read_text(encoding="utf8")
    for pid, _cov, _ver, date in PAGES["Ref-Policy portal"]["r"]:
        owner = re.search(rf"^\| {pid} \| [^|]+ \| ([^|]+?) \|", idx, re.M)[1]
        assert f'["{pid}", "{owner}", "{date}"]' in regs, (pid, owner, date)
    for tid, panel in PANELS.items():
        d["tasks"][tid]["panel"] = panel
    d["tpls"].update(TEMPLATES)
    # Policies › New from Template held the old T4.2's SOP template (T-SOP, R14), which his workbook does not have: it is
    # the programme's templates now, each with where it opens (F1.3 works T-LI-CTX and CTX-IP here).
    d["tp"]["policies|New from Template"] = {"tool": "Policies › New from Template", "stamp": "Templates", "kind": "doc", "pl": {
        "p": [f"<b>{code}</b> {desc} (task {task}, {out}; opens in {where})" for code, (task, out, desc, where) in TEMPLATES.items()],
        "note": "A template opens from the step that uses it, in the screen named beside it."}}
    next(t for t in d["sections"]["policies"]["tools"] if t["n"] == "New from Template")["d"] = "The programme's templates"
    # Frameworks › Gap Finder held the old T4.1's policy gap check (POL-GAP), which his workbook does not have: it is the clause
    # gap analysis now (F2.2 works T-LI-PLAN here).
    d["tp"]["frameworks|Gap Finder"] = {"tool": "Frameworks › Gap Finder", "stamp": "LI-GAP", "kind": "doc", "pl": {
        "p": ["<b>LI-GAP</b> Clause gap analysis (template T-LI-PLAN): the 25 requirements of ISO/IEC 27001:2022 clauses 4.1–10.2 rated Fully, Partially or Not met (rule L13) and at a maturity level (Ref-Maturity Model), and the top three gaps to close."],
        "note": "It opens from F2.2's steps, which fill it."}}
    next(t for t in d["sections"]["frameworks"]["tools"] if t["n"] == "Gap Finder")["d"] = "The clause gap analysis"
    # Policies › Review & Redline held the old T4.1's SITL-POL-006 review (Q1–Q7), which his workbook does not have: it is
    # the policy check and the topic-specific policy register now (T3.1 works T-LI-POL here).
    d["tp"]["policies|Review & Redline"] = {"tool": "Policies › Review & Redline", "stamp": "LI-POL, POL-SET and LI-RACI", "kind": "doc", "pl": {
        "p": ["<b>LI-POL</b> ISMS policy check (template T-LI-POL): SITL-POL-001 held against Clause 5.2 a)–g) (rule L08), and the evidence of top management's commitment (Clause 5.1).",
              "<b>POL-SET</b> Topic-specific policy register (template T-LI-POL, sheet Policy set): each topic of ISO/IEC 27002:2022 Section 5.1 with its SITL policy, owner, approver, last approval and status.",
              "<b>LI-RACI</b> ISMS RACI (template T-LI-POL, sheet RACI): the ten ISMS processes with who is Responsible, Accountable, Consulted and Informed, and who holds the two Clause 5.3 assignments."],
        "note": "It opens from the steps of T3.1 and T3.2, which fill it."}}
    next(t for t in d["sections"]["policies"]["tools"] if t["n"] == "Review & Redline")["d"] = "The policy check, policy register and RACI"
    # Frameworks › Map Control held the old T3.2's SOC 2 mapping (MAP-8) and Evidence › Link to Control the old PBC index, which
    # his workbook does not have: they are the control sprints' tracker (T-LI-CIT) and evidence packs (LI-A) now, T3.2 … T10.2.
    d["tp"]["frameworks|Map Control"] = {"tool": "Frameworks › Map Control", "stamp": "T-LI-CIT", "kind": "doc", "pl": {
        "p": ["<b>T-LI-CIT</b> Control implementation tracker: each Annex A control of the control sprints with its owner role, status, maturity level, evidence ref and gap / next action. One tracker, kept across the sprints T3.2–T10.2; each sprint hands in its rows (CIT-S1 …)."],
        "note": "It opens from the sprints' steps, which fill it."}}
    next(t for t in d["sections"]["frameworks"]["tools"] if t["n"] == "Map Control")["d"] = "The control implementation tracker"
    d["tp"]["evidence|Link to Control"] = {"tool": "Evidence › Link to Control", "stamp": "LI-A", "kind": "doc", "pl": {
        "p": ["<b>LI-A</b> Evidence packs: each sub-task of a deep-dive control's Lead Implementer task, linked to the file in 02_Working that holds its evidence item, or to a gap and the next action."],
        "note": "It opens from the sprints' evidence-pack steps."}}
    next(t for t in d["sections"]["evidence"]["tools"] if t["n"] == "Link to Control")["d"] = "The sprints' evidence packs"
    # T10.1: Control Testing › Configuration Check keeps its Tech Lab list and also opens CFG-BASE and CRY-REG (template
    # T-LI-CFG); its window was titled "Tech Lab tasks", which is not the name on the toolbar.
    d["tp"]["testing|Configuration Check"]["tool"] = "Control Testing › Configuration Check"
    d["tp"]["testing|Configuration Check"]["pl"]["note"] = "The Tech Lab tasks. Template T-LI-CFG (CFG-BASE and sheet Crypto, CRY-REG) opens here from T10.1's first two steps."
    next(t for t in d["sections"]["testing"]["tools"] if t["n"] == "Configuration Check")["d"] = "Tech Lab tasks; the configuration baseline check"
    # Risk Register › Assign Owner held the old programme's owner list (week 7): T5.1's treatment plan and acceptance request
    # now, open from week 5.
    d["tp"]["risk|Assign Owner"] = {"tool": "Risk Register › Assign Owner", "stamp": "LI-RTP and RSK-ACC", "kind": "doc", "pl": {
        "p": ["<b>LI-RTP</b> Risk treatment plan (template T-LI-RTP): each risk with its treatment option (rule L12), the controls it needs and their Annex A IDs (sheet Controls), owner, due date (rule R08), residual rating and approver.",
              "<b>RSK-ACC</b> Risk acceptance request (template T-ACC): the retained risk, the reason, the expiry and re-assessment dates and the approver (rule R36), as SITL-POL-002 Section 6.2 sets them."],
        "note": "It opens from T5.1's steps, which fill it."}}
    _ao = next(t for t in d["sections"]["risk"]["tools"] if t["n"] == "Assign Owner")
    _ao["d"], _ao["u"] = "The risk treatment plan and acceptance", 5
    # T11.2: Control Testing › Raise Finding held the old 5C finding frame (rule R19's memo); it is LI-NCR now. Frameworks › Gap
    # Finder also hosts the maturity review set RV-SET, beside F2.2's clause gap analysis.
    d["tp"]["testing|Raise Finding"] = {"tool": "Control Testing › Raise Finding", "stamp": "LI-NCR", "kind": "doc", "pl": {
        "p": ["<b>LI-NCR</b> Nonconformity report (template T-LI-NCR): each nonconformity with the card it comes from, the requirement (ISO/IEC 27001:2022 clause or Annex A control), the evidence, the statement of the gap and its grade (rule L17)."],
        "note": "It opens from T11.2's step 5, which fills it."}}
    next(t for t in d["sections"]["testing"]["tools"] if t["n"] == "Raise Finding")["d"] = "The nonconformity report"
    d["tp"]["frameworks|Gap Finder"]["pl"]["p"].append("<b>RV-SET</b> Maturity review set (T11.2, the Review Deck): nine RV cards, each with its maturity level (Ref-Maturity Model), classification, ISO reference, gap and recommendation.")
    next(t for t in d["sections"]["frameworks"]["tools"] if t["n"] == "Gap Finder")["d"] = "The clause gap analysis and the maturity review"
    # Risk Register › Mitigation Tracker held the old programme's action list (22 actions of old tasks): T12.1's ACT-TRACKER
    # and ACT-UPD now.
    d["tp"]["risk|Mitigation Tracker"] = {"tool": "Risk Register › Mitigation Tracker", "stamp": "ACT-UPD", "kind": "doc", "pl": {
        "p": ["<b>ACT-UPD</b> Updated action tracker (template T-ACT): each gap and nonconformity of ACT-TRACKER with its owner-reported status and closure evidence, and its status as verified from the evidence (Clause 10.2), the reason and the next check date."],
        "note": "It opens from T12.1's first step, which fills it."}}
    next(t for t in d["sections"]["risk"]["tools"] if t["n"] == "Mitigation Tracker")["d"] = "The action tracker"
    # T4.2: Risk Register › New Risk held the old T7.1 vignettes (five events to rate): LI-CHAIN now. Score Risk keeps the RA-16
    # Manila sheet (15 risks, which its stamp miscounted as 25); T4.2 step 5 adds RR-UPD's three risks there.
    d["tp"]["risk|New Risk"] = {"tool": "Risk Register › New Risk", "stamp": "LI-CHAIN", "kind": "doc", "pl": {
        "p": ["<b>LI-CHAIN</b> Asset–threat–control chains (template T-LI-CHAIN): per asset its threat, vulnerability, consequence, existing controls and Annex A control, the risk statement (rule R06) and its likelihood, impact and inherent score (rule R07)."],
        "note": "It opens from T4.2's first three steps, which fill it."}}
    next(t for t in d["sections"]["risk"]["tools"] if t["n"] == "New Risk")["d"] = "The asset–threat–control chains"
    d["tp"]["risk|Score Risk"]["stamp"] = f"{len(d['tp']['risk|Score Risk']['pl']['r'])} risks"
    # T4.1: Risk Register › Asset Register is the Manila extract of TSA-16 Asset_System_Map (ASSET_MAP), from week 4.
    d["tp"]["risk|Asset Register"] = {"tool": "Risk Register › Asset Register (TSA-16 Asset_System_Map)", "stamp": f"{len(ASSET_MAP['r'])} assets", "kind": "table", "pl": ASSET_MAP}
    _ar4 = next(t for t in d["sections"]["risk"]["tools"] if t["n"] == "Asset Register")
    _ar4["d"], _ar4["u"] = "The Manila asset inventory extract", 4
    # Evidence › Audit Requests (PBC) held the old PBC-6 list and Evidence › Evidence Library the old EVP-REPO: T12.2's audit
    # (LI-CERT, AUD-LOG, LI-NCR-R) and its EVIDENCE-INDEX now, from week 12.
    d["tp"]["evidence|Audit Requests (PBC)"] = {"tool": "Evidence › Audit Requests (PBC)", "stamp": "LI-CERT, AUD-LOG and LI-NCR-R", "kind": "doc", "pl": {
        "p": ["<b>LI-CERT</b> Certification briefing for management: Stage 1, Stage 2, surveillance and what the Manila office must have ready (Ref-Certification card).",
              "<b>AUD-LOG</b> Auditor request log (template T-AUD): the certification body's eight requests (AUD-REQUESTS), each answered with one file from EVIDENCE-INDEX or No evidence available (rule R34), with its SHA-256 and the UTC time sent.",
              "<b>LI-NCR-R</b> Response to the auditor's finding NC-1 (AUD-FINDING): correction, root cause and corrective action, each with an owner and a date (rule L25)."],
        "note": "It opens from T12.2's steps, which fill it."}}
    _ar = next(t for t in d["sections"]["evidence"]["tools"] if t["n"] == "Audit Requests (PBC)")
    _ar["d"], _ar["u"] = "The certification audit: briefing, requests, finding", 12
    d["tp"]["evidence|Evidence Library"] = {"tool": "Evidence › Evidence Library (EVIDENCE-INDEX)", "stamp": f"{len(T122['index'])} files", "kind": "table", "pl": {
        "h": DATASETS["EVIDENCE-INDEX"]["h"], "r": T122["index"],
        "note": "Dataset EVIDENCE-INDEX: the files that can answer the certification body's requests, your own hand-ins among them, each with what it holds, its clause or control, its date and its SHA-256."}}
    _el = next(t for t in d["sections"]["evidence"]["tools"] if t["n"] == "Evidence Library")
    _el["d"], _el["u"] = "Your evidence index (EVIDENCE-INDEX)", 12
    # Frameworks › Export Mapping held the old T3.2's MAP-XW (and named "LI-SOA (93 Annex A rows)"): T5.2's Statement of
    # Applicability now, from week 5. Frameworks › Gap Finder adds T5.2's sheet Objectives of the same template, T-LI-PLAN.
    d["tp"]["frameworks|Export Mapping"] = {"tool": "Frameworks › Export Mapping", "stamp": "LI-SOA", "kind": "doc", "pl": {
        "p": ["<b>LI-SOA</b> Statement of Applicability (template T-LI-SOA, Clause 6.1.3 d): the 93 Annex A controls, each applicable or not with the source that calls for it (rule L06), the justification for its inclusion or exclusion, whether it is implemented and its evidence ref (rule L07)."],
        "note": "It opens from T5.2's steps, which fill it."}}
    _em = next(t for t in d["sections"]["frameworks"]["tools"] if t["n"] == "Export Mapping")
    _em["d"], _em["u"] = "The Statement of Applicability", 5
    d["tp"]["frameworks|Gap Finder"]["pl"]["p"].append("<b>LI-OBJ</b> ISMS objectives and plan (template T-LI-PLAN, sheet Objectives): three measurable objectives, each with what will be done, the resources, who is responsible, when and how results are evaluated (Clause 6.2, rule L14), and its milestones (rule L15).")
    d["tp"]["frameworks|Gap Finder"]["pl"]["note"] = "It opens from the steps of F2.2, T5.2 and T11.2, which fill it."
    # T7.1: Access Reviews › Privilege Check held the old programme's privileged-account list; it is ACC-RULES now, from week 7.
    d["tp"]["access|Privilege Check"] = {"tool": "Access Reviews › Privilege Check", "stamp": "ACC-RULES", "kind": "doc", "pl": {
        "p": ["<b>ACC-RULES</b> Access rules matrix (template T-LI-ACC): each role on each of three Manila systems with the access level its work needs, who approves it, and whether it holds more than its job needs (SITL-POL-006 Sections 3.1 and 6.1)."],
        "note": "It opens from T7.1's first step, which fills it."}}
    _pc = next(t for t in d["sections"]["access"]["tools"] if t["n"] == "Privilege Check")
    _pc["d"], _pc["u"] = "The access rules matrix", 7
    # T9.1: Control Testing › Test Plan held the old privileged-access records (48 rows); it is T9.1's walkthrough now, from week 9.
    d["tp"]["testing|Test Plan"] = {"tool": "Control Testing › Test Plan", "stamp": "PHY-WALK", "kind": "doc", "pl": {
        "p": ["<b>PHY-WALK</b> Physical security walkthrough (template T-LI-PHY): the floor plan of the Manila head office (dataset PHY) with its points marked by who may be there, and the 20 walkthrough photos, each matched to its A.7 control and judged good practice or a gap, with the action for each gap."],
        "note": "It opens from T9.1's first two steps, which fill it."}}
    _tp9 = next(t for t in d["sections"]["testing"]["tools"] if t["n"] == "Test Plan")
    _tp9["d"], _tp9["u"] = "The physical security walkthrough", 9
    # T9.2: Control Testing › Vulnerability Remediation Check held the old programme's 172 findings; it is VUL-TEST now, week 9.
    d["tp"]["testing|Vulnerability Remediation Check"] = {"tool": "Control Testing › Vulnerability Remediation Check", "stamp": "VUL-TEST", "kind": "doc", "pl": {
        "p": ["<b>VUL-TEST</b> SLA test workbook (template T-VUL): the 40 findings of dataset VUL-40, sampled from the Manila scanner, each given its class (rule R24), its due date and its status at the test date, 30 November 2026 (SITL-POL-010)."],
        "note": "It opens from T9.2's first step, which fills it."}}
    _vr = next(t for t in d["sections"]["testing"]["tools"] if t["n"] == "Vulnerability Remediation Check")
    _vr["d"], _vr["u"] = "The vulnerability SLA test", 9
    # T7.2: three Vendors screens held the old T9.1's Lumen forms and the pack's clause table; they are VEN-TIER and VEN-CL now.
    for _key, (_tool, _stamp, _p, _note, _d) in TP_T72.items():
        d["tp"][_key] = {"tool": _tool, "stamp": _stamp, "kind": "doc", "pl": {"p": [_p], "note": _note}}
        _vt = next(t for t in d["sections"]["vendors"]["tools"] if t["n"] == _key.split("|")[1])
        _vt["d"], _vt["u"] = _d, 7
    # T8.2: Control Testing › Restore Test Review held the old T8.2's privileged-access test variant; it is BIA-RTO now. Regulatory
    # Watch › Obligations Register held the old two-office OBL-REG frame and RoPA & Data Flows the old LearnTech LMS: OBL-REG and
    # ROPA, and the customer-support activity they are filled from. All three from week 8.
    d["tp"]["testing|Restore Test Review"] = {"tool": "Control Testing › Restore Test Review", "stamp": "BIA-RTO", "kind": "doc", "pl": {
        "p": ["<b>BIA-RTO</b> Business impact extract (template T-LI-BIA): each Manila service of dataset BIA-5 with its RTO and RPO, and the time to recover and the data lost in the last DR test, Met or Not met."],
        "note": "It opens from T8.2's first step, which fills it."}}
    d["tp"]["regwatch|Obligations Register"] = {"tool": "Regulatory Watch › Obligations Register", "stamp": "OBL-REG and ROPA", "kind": "doc", "pl": {
        "p": ["<b>OBL-REG</b> Obligations register extract (template T-OBL): the Manila office's obligations from SITL-ADD-16, one per row (rule R10), each with its type, the SITL policy it is met under and that policy's owner.",
              "<b>ROPA</b> RoPA entry (template T-ROPA): the customer-support processing activity, with its role, lawful basis and DPIA screening (rule R29)."],
        "note": "It opens from T8.2's step 3, which fills it."}}
    d["tp"]["regwatch|RoPA & Data Flows"] = {"tool": "Regulatory Watch › RoPA & Data Flows", "stamp": "Processing activity description", "kind": "form", "pl": {"f": T82_ROPA_DESC}}
    for _sec, _n, _desc in (("testing", "Restore Test Review", "The business impact extract (BIA-RTO)"), ("regwatch", "Obligations Register", "The obligations register (OBL-REG) and RoPA entry"), ("regwatch", "RoPA & Data Flows", "The customer-support processing activity")):
        _t = next(t for t in d["sections"][_sec]["tools"] if t["n"] == _n)
        _t["d"], _t["u"] = _desc, 8
    # T8.1: Control Testing › Record Result held the old R19 rule texts (test conclusions, SLA classes, tiering), which his
    # workbook does not have: it is the tabletop exercise record now, from week 8.
    d["tp"]["testing|Record Result"] = {"tool": "Control Testing › Record Result", "stamp": "IR-TTX", "kind": "doc", "pl": {
        "p": ["<b>IR-TTX</b> Tabletop exercise record (template T-LI-TTX): the six injects of dataset TTX in UTC, each with its incident phase (A.5.24–A.5.28), the decision taken, its owner and its control; sheet Notification, the authority's deadline in UTC (rule R30)."],
        "note": "It opens from T8.1's steps 1, 2 and 4, which fill it."}}
    _rr8 = next(t for t in d["sections"]["testing"]["tools"] if t["n"] == "Record Result")
    _rr8["d"], _rr8["u"] = "The tabletop exercise record", 8
    t102_screens(d)  # T10.2: Control Testing › Test Plan
    d["rules"].update(RULES)
    for table in (d["pages"]["Ref-Rules"]["r"], d["tp"]["learn|Rule tables"]["pl"]["r"]):
        for r in table:
            if r[0] in RULES:
                r[1:] = RULES[r[0]]
    qr = d["tp"]["learn|Framework Quick Reference"]["pl"]["p"]
    term = lambda p: re.match(r"<b>(.*?)</b>", p)[1]  # noqa: E731
    qr[:] = [p for p in qr if term(p) not in {term(x) for x in QUICK_REF}]
    at = max(i for i, p in enumerate(qr) if term(p).startswith("ISO/IEC 27001")) + 1  # beside the standard's own entries
    qr[at:at] = QUICK_REF
    unused_screens(d)


# Toolbar screens no rebuilt step opens, reads or names: they held the old programme's data (Lumen's SOC 2 report, the old
# access review's 216 accounts, the old T9.2's patch timeline, LearnTech's campaigns and breach clock …). Taken off the dock
# with their content, so no SOC 2 or old-programme content shows anywhere (integration fixes, 26 Nov 2026, queue item 9c).
# The Tech Lab was unlinked here on 26 Nov and is mandatory again (owner, 26 Nov 2026, docs/li101/labs.md): its five
# simulators are on the Systems menu and the dock (tech_labs() below), each in its task's week. Generic screens (frames,
# defect codes, version history) stay.
UNUSED_SCREENS = [
    "evidence|Request Evidence", "frameworks|Crosswalk View",
    "access|Start Review", "access|Generate Sample", "access|Terminated User Check", "access|Reviewer Sign-off", "access|Track Remediation",
    "risk|Heat Map with KRIs",
    "vendors|Send Questionnaire", "vendors|SOC Report Review", "vendors|Flag Risk", "vendors|Reassessment Reminder",
    "testing|Patch Timeline Check", "policies|Send for Approval", "policies|Policy Exceptions",
    "awareness|Phishing Campaign Planner", "awareness|Campaign Results",
    "regwatch|Breach Clock Calculator", "regwatch|Impact Log",
    "learn|Stakeholder Directory", "learn|Skills Tracker",
]
# The five Tech Labs: simulator, console title, product (named for context only), the task it is a required part of.
# Console data is public/desk/labs/<id>.json and the order here is the Systems menu's; the lab ids, steps and the order they
# open in are lib/desk/labs.ts (the one place that says after which step).
TECH_LABS = [
    ("LedgerSim", "Segregation of duties in finance", "Manila finance system", "T3.2"),
    ("AppAdmin (business SaaS)", "Administrators and shared accounts", "HelpLoop", "T7.1"),
    ("LogLens", "Log-source coverage", "SIEM", "T9.2"),
    ("NetShield", "Remote-admin exposure", "Core firewall", "T10.1"),
    ("DataSentry", "Data leakage coverage", "Data discovery and DLP", "T10.1"),
]
# SOC 2 terms of the old Glossary (the programme has no SOC 2: docs/li101 plan).
SOC2_TERMS = {"CUEC", "Bridge letter"}


def unused_screens(d: dict) -> None:
    keys = {s.get("key") for t in d["tasks"].values() for s in t["steps"]}
    for key in UNUSED_SCREENS:
        assert key not in keys, f"{key} is a step's screen"
        sec, name = key.split("|")
        d["tp"].pop(key, None)
        d["sections"][sec]["tools"] = [t for t in d["sections"][sec]["tools"] if t["n"] != name]
    tech_labs(d)
    g = d["tp"]["learn|Glossary"]
    g["pl"]["i"] = [x for x in g["pl"]["i"] if x[0] not in SOC2_TERMS]
    g["stamp"] = f"{len(g['pl']['i'])} terms"
    code = "".join(f.read_text(encoding="utf8") for f in (WEB / "src" / "lib" / "desk" / "registers.ts", WEB / "src" / "components" / "desk" / "step-guides.ts"))
    # Templates: the old programme's (T-MAP, T-SOC, T-UAR …) go unless a step, a screen or a written item names them.
    cites = json.dumps([d["tasks"], d["cards"], d["tp"]], ensure_ascii=False) + code
    d["tpls"] = {k: v for k, v in d["tpls"].items() if k in TEMPLATES or re.search(rf"(?<![\w-]){re.escape(k)}(?![\w-])", cites)}
    # Datasets (01_Inputs): only those a task, a written item or a screen still names. The old programme's (OFFICE-REGISTER,
    # SOC2-SUMMARY, UAR-EXTRACT …) go with the steps that read them (queue item 7).
    named = json.dumps([d["tasks"], d["cards"], d["tp"], d["pages"], d["tpls"]], ensure_ascii=False) + code
    d["ds"] = {k: v for k, v in d["ds"].items() if k in DATASETS or re.search(rf"(?<![\w-]){re.escape(k)}(?![\w-])", named)}


def tech_labs(d: dict) -> None:
    """The Systems menu and its overview: the five labs, each in the week of its task (unlock_weeks sets `u` from first use)."""
    wk = {n: d["tasks"][t]["week"] for n, _, _, t in TECH_LABS}
    d["sections"]["systems"] = {"t": "Systems", "sub": "Tech Lab: five required simulators", "tools": [
        {"n": n, "d": f"{title} · {prod}", "k": f"W{wk[n]}"} for n, title, prod, _ in TECH_LABS]}
    for k in [k for k in d["tp"] if k.startswith("systems|")]:
        del d["tp"][k]
    for n, title, prod, task in TECH_LABS:
        d["tp"][f"systems|{n}"] = {"tool": f"Systems › {n} (Tech Lab)", "stamp": "Required lab", "kind": "doc", "pl": {"p": [
            f"<b>{title}</b> A required part of {task}: a practice console of {prod} at GlobalConnect Manila, opened from the toolbar once the step it follows is done. Its task's Submit waits until you mark it complete."]}}
    d["tp"]["systems|*"] = {"tool": "Systems › Tech Lab", "stamp": f"{len(TECH_LABS)} required labs", "kind": "table", "pl": {
        "h": ["Lab", "Simulator", "Product (text only)", "Part of", "Week"],
        "r": [[title, n, prod, task, str(wk[n])] for n, title, prod, task in TECH_LABS],
        "note": "Each lab is a required part of its task: the task's Submit stays closed until the lab is marked complete. Read-only lab-reader role. Every filter and capture is logged. All data is synthetic."}}


def unlock_weeks(d: dict) -> None:
    """Each work screen opens in the earliest week any step uses it (as its key or a screen it reads, from tools.stepUses);
    a section opens with its earliest screen. Screens no step uses keep the week they had. Home, Learn and the utilities stay."""
    import subprocess
    out = subprocess.run("npx tsx scripts/step-uses.ts", shell=True, cwd=WEB, input=json.dumps(d, ensure_ascii=False),
                         capture_output=True, text=True, encoding="utf8", check=True).stdout
    first = json.loads(out)
    secs = {s["k"]: s for s in d["secs"] if s}
    for t in d["sections"]["systems"]["tools"]:  # a lab opens in its task's week (step-uses.ts counts a lab as a use)
        t["u"] = first[f"systems|{t['n']}"]
    for sec in ("evidence", "frameworks", "access", "risk", "vendors", "testing", "policies", "awareness", "regwatch"):
        tools = d["sections"][sec]["tools"]
        eff = {t["n"]: first.get(f"{sec}|{t['n']}") or max(secs[sec]["u"], t.get("u") or 1) for t in tools}
        for t in tools:
            t["u"] = eff[t["n"]]
        secs[sec]["u"] = min(eff.values())


def sheet(wb, name: str) -> list[tuple]:
    return [r for r in wb[name].iter_rows(min_row=2, values_only=True) if r[1] is not None]


def prune_old_programme(d: dict, wb) -> None:
    """Fix round 3: nothing of the old programme (SOC 2, Lumen, its rules, glossary, defect codes, capability map, test
    schedule, library citations) is left where a learner can open it. Runs last, on the finished sample."""
    # ---- rules: only those a step, guide, register or written content cites (his input line "R01-R36" is a label, not a cite)
    def live(p: Path) -> str:  # source without comment lines
        return "\n".join(l for l in p.read_text(encoding="utf8").split("\n") if not l.strip().startswith(("//", "*", "/*")))
    src = [re.sub(r"R01.{1,3}R36", "", json.dumps([d["tasks"], d["cards"]], ensure_ascii=False))]
    desk_dir = WEB / "src" / "lib" / "desk"
    src += [live(f) for f in [WEB / "src" / "components" / "desk" / "step-guides.ts", desk_dir / "registers.ts", desk_dir / "decision-context.ts"]]
    src += [f.read_text(encoding="utf8") for f in [*(WEB.parent / "backend" / "scripts").glob("li101_written*.json"), *desk_dir.glob("li-*.json")]]
    keep = {r for r in re.findall(r"\b([RL]\d{2})\b", "\n".join(src)) if r in d["rules"]}
    for tid in d["order"]:
        for st in d["tasks"][tid]["steps"]:
            keep |= set(st["refs"]["rules"])
    d["rules"] = {k: v for k, v in d["rules"].items() if k in keep}
    d["rule_users"] = {k: v for k, v in d["rule_users"].items() if k in keep}
    d["rulebook"]["core"] = [r for r in d["rulebook"]["core"] if r in keep]
    d["rulebook"]["li"] = [r for r in d["rulebook"]["li"] if r in keep]
    rt = d["tp"]["learn|Rule tables"]
    rt["pl"]["r"] = [r for r in rt["pl"]["r"] if r[0] in keep]
    rt["tool"], rt["stamp"] = "Learn › Rule tables", f"{len(rt['pl']['r'])} rules"
    d["pages"]["Ref-Rules"]["r"] = [r for r in d["pages"]["Ref-Rules"]["r"] if r[0] in keep]
    d["pages"]["Ref-Rules"]["n"] = len(d["pages"]["Ref-Rules"]["r"])

    # ---- Framework Quick Reference / Library / Glossary / Defect Codes
    qr = d["tp"]["learn|Framework Quick Reference"]["pl"]
    qr["p"] = [x for x in qr["p"] if not x.startswith("<b>SOC 2</b>")]
    fl = d["tp"]["frameworks|Framework Library"]["pl"]
    fl["r"] = [r for r in fl["r"] if r[0] != "SOC 2"]
    fl["h"] = ["Standard", "Kind", "Applies to", "Flag"]
    fl["note"] = "Kind: law / regulation, certifiable standard, attestation framework, code of practice or voluntary framework. Confirm each row against addendum Section 3."
    gl = d["tp"]["learn|Glossary"]["pl"]
    gl["i"] = [t for t in gl["i"] if t[0] not in ("PBC", "Orphan account")]
    d["tp"]["learn|Glossary"]["stamp"] = f"{len(gl['i'])} terms"
    d["tp"]["evidence|Defect Codes"] = {"tool": "Evidence › Defect Codes", "stamp": "Not used in GRC 101", "kind": "doc", "pl": {"p": [
        "<b>Defect codes</b> A list of ways an evidence file can be unfit to rely on. GRC 101 does not use it: evidence here is judged by the rules of the step you are on (rule L01, L17, R15, R19 and the others in Learn › Rule tables) and by what the file shows."]}}

    # ---- the old capability map: gone, with the lines of F1.1 that named it
    d["pages"].pop("Ref-Capability map", None)
    d["page_users"].pop("Ref-Capability map", None)

    def drop(o):
        if isinstance(o, dict):
            return {k: drop(v) for k, v in o.items()}
        if isinstance(o, list):
            return [drop(x) for x in o if not (isinstance(x, str) and ("Ref-Capability map" in x or x.startswith("See which areas of the GRC")))]
        return o
    for k in ("tasks", "cards", "help", "notes"):
        d[k] = drop(d[k])

    # ---- levels and ratings are scored exactly (fixes 1): his key results that still say "within one" say what is scored
    for old, new in (("Maturity level within one level for every clause and exact for ≥ 80 %", "Maturity level correct for every clause"),
                     ("(level within one)", "(level correct)"), ("ratings within ±1 (R07)", "ratings correct (R07)")):
        for k in ("tasks", "weeks", "cards"):
            blob = json.dumps(d[k], ensure_ascii=False)
            d[k] = json.loads(blob.replace(old, new))

    # ---- the old schedule of human checkpoints (not rendered; kept truthful for anything that reads it)
    hcs = [w for w in d["weeks"] if w["hc"]]
    d["tests"]["human"] = [[w["hc"].replace(" (", f" — Week {w['n']} (", 1), pts] for w, (_, pts) in zip(hcs, d["tests"]["human"])]
    # ---- Home › My plan data: the rebuilt tasks (the rendered plan reads the tasks; this stays in step with them)
    mp = d["tp"]["home|My plan"]["pl"]
    mp["r"] = [[str(d["tasks"][t]["week"]), t, d["tasks"][t]["org"].replace("AB", "A+B"), d["tasks"][t]["title"], d["tasks"][t].get("due", ""), str(d["tasks"][t]["hrs"]), d["tasks"][t]["rev"]] for t in d["order"]]
    d["library"]["cited_by_task"] = cited_by_task(d)
    release_fixes(d)


def release_fixes(d: dict) -> None:
    """Release fixes (26 Nov): no screen says a person reviews, scores or signs off the work (mentor review of HC1-HC6 is not
    built); the organisations describe this programme, not the old one; no retired rule or stale count. Idempotent."""
    n_tasks, n_labs, n_rules = len(d["order"]), len(TECH_LABS), len(d["rules"])
    # ---- what the certificate needs, as backend/app/services/desk_record.py + certificate.py compute it
    d["gates"] = d["tests"]["gates"] = [
        f"All {n_tasks} tasks submitted, every step complete (each step is checked against its key before it can be marked complete).",
        f"All {n_labs} Tech Labs completed.",
        "Foundation Gate Exam passed at 70 % or more (one resit on a new form within 5 working days).",
        "Final Exam passed at 60 % or more (including the practical station).",
        "No confirmed integrity breach (use of live/real data, copying another mentee's work, impersonation, or use of any AI tool for task work: the platform has no chat assistant; all help is scripted).",
    ]
    d["tp"]["home|My Scores"]["pl"] = {"k": [
        ["Tasks submitted", f"0 / {n_tasks}", f"need all {n_tasks}"], ["Tech Labs completed", f"0 / {n_labs}", f"need all {n_labs}"],
        ["Foundation Gate Exam", "≥ 70 %", "Week 2"], ["Final Exam", "≥ 60 %", "Week 12"]],
        "note": "The certificate needs every task submitted, every Tech Lab completed and both exams passed. With distinction: both exams at 85 % or more on the first attempt. Work is checked automatically against the key."}
    d["tp"]["home|Waiting On"]["pl"]["i"] = [
        ["Automated check", "Returned within 24 hours of each submission.", "≤ 24 h"],
        ["Checkpoints HC1–HC6", "Where the work of the week's tasks is checked, at the end of the week.", "Every 2 weeks"],
        ["Task message answers", "Each message must be answered within 2 working days.", "2 days"]]
    d["tp"]["home|Calendar"]["pl"]["h"][4] = "Checkpoint"
    # Home > Assessor Notes becomes Home > Checkpoints (no assessor: every checkpoint is checked automatically against the keys)
    d["sections"]["home"]["tools"][2]["d"] = "Automated checks and answers coming back"
    d["sections"]["home"]["tools"][6]["d"] = "My scores and what the certificate needs"
    d["sections"]["home"]["tools"][3].update(n="Checkpoints", d="The six checkpoints, checked automatically")
    old = d["tp"].pop("home|Assessor Notes", None)
    if old is not None:
        d["tp"]["home|Checkpoints"] = old
    cp = d["tp"]["home|Checkpoints"]
    cp.update(tool="Home › Checkpoints", stamp="Checkpoints", kind=cp["kind"])
    cp["pl"]["note"] = "Every checkpoint is checked automatically against the server keys; no person reviews the work. Written cells are format-checked and kept with your hand-in."
    cp["pl"]["i"] = [[f"{m.group(1)} checkpoint", f"The work of {' and '.join(re.findall(r'[FT]\d+\.\d+', m.group(2)))} is checked automatically against the server keys at checkpoint {m.group(1)}, at the end of its week. No person reads it.", f"Week {w['n']}"]
                     for w in d["weeks"] if w["hc"] for m in [re.match(r"^(HC\d+) \((.+)\)$", w["hc"])] if m]
    d["guard"].update({
        "testing": "Every result links to evidence. Your results are checked against the key.",
        "frameworks": "Copy values from the named source only. New mappings stay \"Proposed\" until they are checked.",
        "vendors": "You recommend. Onboarding approval sits with the vendor owner.",
        "learn": "Owned by you. Opening a step note is never penalised.",
        "risk": "You draft and score with R06–R08. Acceptance follows the authority rule R36 sets for the score; risk owners accept residual risk (Clause 6.1.3 f).",
        "evidence": "Evidence must be dated inside the period, attributable and unaltered. Never copy unmasked personal data or secrets: report them.",
    })
    d["sections"]["evidence"]["tools"][6]["d"] = "Not used in GRC 101"
    # per-task review line and the unrendered policy text that described a human review
    for t in d["order"]:
        tk = d["tasks"][t]
        tk["rev"] = "Checked automatically within 24 h" + (f"; work checked at checkpoint {tk['hc']}" if tk.get("hc") else "")
    for row, t in zip(d["tp"]["home|My plan"]["pl"]["r"], d["order"]):
        row[6] = d["tasks"][t]["rev"]
    d["rulebook"]["principles"][8][2] = "Reviews check decisions and evidence: the automatic check scores decision accuracy against the key, correct rule application, evidence for every row, and data handling."
    d["capture"]["folders"][5][1] = "Automated review record (read-only to mentee)"
    d["capture"]["late"] = [x for x in d["capture"]["late"] if not x.startswith(("Moderation", "Re-checks"))]
    d["people"]["human"] = [x for x in d["people"]["human"] if x[0] == "Programme Quality Lead"]
    # ---- retired rule numbers and the old rule-table ranges
    blob = json.dumps({k: v for k, v in d.items() if k not in ("orgs",)}, ensure_ascii=False)
    for a, b in (("rules L01–L25 and", "rules and"), ("Rules L01–L25 applied", "Rules applied"), ("(L01–L25)", "(the L rules)"), ("Rule ID used in the step (R01–R36, L01–L25)", "Rule ID used in the step (for example R15 or L06)"),
                 ("Rule tables R01–R36, L01–L25", f"Rule tables ({n_rules} rules)"), ("(R01–R36, L01–L25)", f"({n_rules} rules)"),
                 ("R01–R36, L01–L25", f"{n_rules} rules"), ("The rule tables R01–R36 (Ref-Rules)", "The rule tables (Ref-Rules)")):
        blob = blob.replace(a, b)
    d.update(json.loads(blob))
    # ---- T5.2 step 11: four rows (OBJ-01 ... OBJ-04), so four objectives
    st = d["tasks"]["T5.2"]["steps"][10]
    st["t"] = st["t"].replace("Write three objectives", "Write four objectives")
    st["w"] = st["w"].replace("Write three objectives consistent with SITL-POL-001, one for each gap its rows name", "Write four objectives consistent with SITL-POL-001, one for each of the four gaps its rows name")
    st["o"] = st["o"].replace("3 objectives with plan recorded", "4 objectives with plan recorded")
    # ---- task inputs point at what exists; Quick Reference agrees with T6.2-1's key (ISMS objectives are a retained record)
    blob = json.dumps({k: v for k, v in d.items() if k != "orgs"}, ensure_ascii=False)
    for a, b in (("from the Review module,", "from the review deck (RV-SET),"), ("Review module: Maturity Model and your assigned set of 9 RV cards (Review Deck)", "Ref-Maturity Model and your assigned set of 9 RV cards (RV-SET, in Frameworks › Gap Finder)"),
                 ("(Learn › Review module)", "(Ref-Maturity Model, Learn › Reference pages)"),
                 ("(Learn › Lead Implementer)", "(Learn › Reference pages)"),
                 (" such as a scope, a policy, a process or objectives.", " such as a scope, a policy or a process."),
                 ("g) are available as documented information. When planning", "g) are available as documented information, and the organisation retains documented information on the objectives, as a record. When planning")):
        blob = blob.replace(a, b)
    d.update(json.loads(blob))
    # ---- organisations: this programme's, from his Tasks sheet (tasks[*].org) and the rebuilt tasks' hand-ins
    def mine(k: str) -> list[str]:
        return [t for t in d["order"] if k in d["tasks"][t]["org"]]
    def rec(t: str) -> list[str]:
        tk = d["tasks"][t]
        subs = "; ".join(f"{s['code']} {s['name']}" for s in tk["subs"] if s["code"] != "DEC-LOG")
        return [t, f"{tk['title']}. Hand-ins: {subs}."]
    a, b = d["orgs"]["A"], d["orgs"]["B"]
    a["tasks"], b["tasks"] = mine("A"), mine("B")
    a["records"], b["records"] = [rec(t) for t in a["tasks"]], [rec(t) for t in b["tasks"]]
    a["obj"] = ("Your organisation for the whole programme. You implement its ISMS at the Manila office, from context and scope in weeks 1–2, through the "
                "policy, risk, control sprints and measures in weeks 3–11, to the management review, the internal audits and certification readiness in week 12, ahead of the initial certification audit.")
    a["audit"] = "Initial ISO/IEC 27001:2022 certification of the Manila office: Stage 1 on 8–9 February 2027, Stage 2 on 12–14 April 2027."
    a["legal_note"] = "The law, authority, cyber law, transfer rule and breach clocks of your office are in SITL-ADD-16 Section 2 and Section 2.1."
    b["obj"] = (f"A secondary organisation, used for worked examples only. {', '.join(b['tasks'])} is the only task that touches it: it appears in the worked examples of the templates, "
                "and you do no ISMS work for it.")
    b["audit"] = "None in GRC 101: LearnTech only supplies worked examples."
    b["legal_note"] = "The law, authority, cyber law, transfer rule and breach clocks of this office are in SITL-ADD-36 Section 2 and Section 2.1."
    mo = d["tp"]["home|My Organisation"]["pl"]["wide"][0]
    mo[1] = ("Org A (GlobalConnect, Manila): the organisation you implement the ISMS for in every task, ahead of its initial certification audit (Stage 1 February 2027). "
             f"Org B (LearnTech, Amsterdam): worked examples only; {', '.join(b['tasks'])} is the only task that touches it. See column \"Org\" in the Plan sheet.")


def cited_by_task(d: dict) -> dict:
    """Standards Library citations per task: ISO/IEC 27001 only, from his ISO coverage sheet; F1.1 keeps its own SITL documents."""
    out = {}
    for t in d["order"]:
        if t == "F1.1":
            out[t] = [x for x in d["library"]["cited_by_task"].get(t, []) if "Capability map" not in x]
            continue
        rows = [r for r in d["isocov"] if re.search(rf"(?<![\w.]){re.escape(t)}(?!\d)", r[3])]
        out[t] = [("ISO/IEC 27001:2022 — Clause " if r[1] == "Clause" else "ISO/IEC 27001:2022 — Annex A ") + r[0] for r in rows]
    return out


def main() -> None:
    wb = openpyxl.load_workbook(SRC, data_only=True)
    d = json.loads(OUT.read_text(encoding="utf8"))
    tasks_rows = {r[1]: r for r in sheet(wb, "Tasks")}
    steps_rows: dict[str, list[tuple]] = {}
    for r in sheet(wb, "Steps"):
        steps_rows.setdefault(r[1], []).append(r)
    assert list(tasks_rows) == d["order"], "his task codes are not the desk's"
    rebuilt = [t for t in d["order"] if t not in KEPT]
    gone = set(rebuilt)
    role_code = {v: k for k, v in d["roles"].items()}
    hc_of = {}  # task -> "HC1"
    weeks = {r[0]: r for r in wb["Weeks"].iter_rows(min_row=2, values_only=True) if isinstance(r[0], int)}
    for r in weeks.values():
        if r[12]:
            m = re.match(r"(HC\d+) \((.+)\)", r[12])
            for t in re.findall(r"[FT]\d+\.\d+", m[2]):
                hc_of[t] = m[1]

    # ---- tasks
    for tid in rebuilt:
        r, old = tasks_rows[tid], d["tasks"][tid]
        week, title, obj, orglbl, owner, support, method, resp, hands, krs, inputs, nsteps, hrs, review = r[0], *r[2:15]
        subs = []
        for line in lines(hands):
            m = re.match(r"(\S+) (.+?) \((.+)\)$", line)
            subs.append({"code": m[1], "name": m[2], "fmt": m[3]})
        org = "AB" if "Org A + B" in orglbl else "B" if orglbl.startswith("Org B") else "A"
        steps, ndec = [], 0
        for s in steps_rows[tid]:
            kind = s[6]
            w, opt = split_options(clean(s[4]))
            did = None
            if kind != "do":
                ndec += 1
                did = f"{tid}-D{ndec}"
                assert opt or kind == "each", (tid, s[2])
            steps.append({
                "n": s[2], "t": clean(s[3]), "w": w, "tool": "On this step", "key": None, "o": clean(s[5]), "sec": "",
                "kind": kind, "opt": opt, "why": None, "did": did, "help": "", "li": None, "refs": refs_of(clean(s[4]), d),
            })
        assert [s["n"] for s in steps] == list(range(1, len(steps) + 1)) and len(steps) == nsteps, tid
        d["tasks"][tid] = {
            "id": tid, "week": week, "title": clean(title), "obj": clean(obj), "krs": lines(krs), "inputs": lines(inputs),
            "m": clean(method), "method": clean(method), "due": old["due"], "dueDay": old["dueDay"], "hrs": hrs,
            "org": org, "orglbl": clean(orglbl), "owner": clean(owner), "support": clean(support),
            "role": role_code.get(clean(owner), ""), "rev": clean(review), "subs": subs, "refs": [],
            "card": {
                "What will I do": f"{clean(title)}. {clean(obj)}",
                "What to read or refer": lines(inputs),
                "What to deliver": [f"{x['code']} — {x['name']} ({x['fmt']})" for x in subs],
            },
            "meta": {"stage": "", "thread": "", "domains": [], "builds": [], "feeds": [], "sec": "", "tool": "", "template": "", "record": ""},
            "panel": {"tool": "", "stamp": "", "kind": "", "pl": {}},
            "steps": steps, "li": [], "inj": [], "ds": [], "builds": [], "feeds": [],
            "hc": hc_of.get(tid, ""), "human": "", "resp": clean(resp), "weight": hrs, "ndec": ndec,
        }

    # ---- weeks: his, whole (week 1 holds F1.1 too; its task is untouched)
    for wk in d["weeks"]:
        r = weeks[wk["n"]]
        kc = clean(r[11])
        support = [x.split(" — ", 1) if " — " in x else [x, ""] for x in lines(r[8])]
        wk.update({
            "ph": clean(r[1]), "th": clean(r[2]), "obj": clean(r[3]), "tasks": [x.strip() for x in str(r[4]).split(",")],
            "resp": [["●", x] for x in lines(r[6])], "lead": clean(r[7]).replace(" (task owner for the week)", ""),
            "lp": "task owner for the week", "support": support,
            "deliver": clean(r[9]), "crit": lines(r[10]), "kc": kc, "hc": clean(r[12]),
            "gate": (re.search(r"\((.+)\)", kc) or [None, ""])[1] if kc.startswith(("FGE", "FEX")) else "",
            "inj": [j for j in wk.get("inj", []) if TASK.match(j)[1] not in gone],
        })
        n = len(wk["inj"])
        wk["meet"] = (
            f"Monday: your extracts are released and the {wk['lead']} opens the week with a pre-recorded 3-minute brief. "
            + (f"{n} message{'s arrive' if n > 1 else ' arrives'} in your inbox during your working hours. " if n else "")
            + "Every step has a help note (?) from the task owner — all briefs, notes and messages are pre-written; there is no live chat. "
            "Each submission is reviewed automatically within 24 hours."
            + (f" Checkpoint {wk['hc']} is checked at the end of this week." if wk["hc"] else "")
        )

    # ---- old task content for the rebuilt tasks: dropped, found by task code
    for k in ("cards", "notes"):
        for tid in rebuilt:
            d[k].pop(tid, None)
    d["inj"] = {k: v for k, v in d["inj"].items() if v["task"] not in gone}
    d["tp"] = {k: v for k, v in d["tp"].items() if "#" not in k or k.split("#")[1] not in gone}
    d["li"], d["licards"] = {}, {}  # every Lead Implementer extension was hosted by a rebuilt task
    d["litrack"]["ext"] = []
    d["deliverables"] = [x for x in d["deliverables"] if x[0] not in gone] + [
        [tid, s["code"], s["name"], s["fmt"], "", "", "", f"/{d['mentee']}/W{d['tasks'][tid]['week']:02d}/{tid}/03_Submission"]
        for tid in rebuilt for s in d["tasks"][tid]["subs"]
    ]
    d["connections"]["links"] = []
    # The saved official sources were the old T11.2's (SRC-…): off the Policy Library's shelf.
    d["library"]["docs"] = [x for x in d["library"]["docs"] if not x[0].startswith("SRC-")]
    # Who uses each rule: from the steps' own citations now (Learn › Rule tables' "Used in").
    users: dict[str, list[str]] = {}
    for tid in d["order"]:
        for s in d["tasks"][tid]["steps"]:
            for rid in s["refs"]["rules"]:
                if tid not in users.setdefault(rid, []):
                    users[rid].append(tid)
    d["rule_users"] = users

    written(d)
    inbox(d)

    # ---- F1.1 is "copied unchanged", but takes his title (Tasks sheet); its steps, card and guides stay as built.
    f11, his = d["tasks"]["F1.1"], clean(tasks_rows["F1.1"][2])
    if f11["title"] != his:
        old_title = f11["title"]
        d["tasks"]["F1.1"] = json.loads(json.dumps(f11, ensure_ascii=False).replace(old_title, his))
        d["cards"]["F1.1"] = json.loads(json.dumps(d["cards"]["F1.1"], ensure_ascii=False).replace(old_title, his))

    # ---- Learn › Reference pages: only those the programme cites. A page stays when a task (its steps, inputs or card, F1.1
    # included) or a written content item names it: the registers, the step guides, the backend's written keys. The old
    # programme's pages (Ref-27000 family, Ref-Clause map, Ref-SOC checks …) answered or contradicted his steps.
    named = json.dumps([d["tasks"], d["cards"]], ensure_ascii=False) + "".join(
        f.read_text(encoding="utf8") for f in (WEB / "src" / "lib" / "desk" / "registers.ts", WEB / "src" / "components" / "desk" / "step-guides.ts",
                                              WEB.parent / "backend" / "scripts" / "li101_written.json"))
    d["pages"] = {k: v for k, v in d["pages"].items() if re.search(rf"(?<![\w-]){re.escape(k)}(?![\w-])", named)}
    cites = {t: json.dumps([d["tasks"][t], d["cards"].get(t)], ensure_ascii=False) for t in d["order"]}
    d["page_users"] = {k: [t for t in d["order"] if re.search(rf"(?<![\w-]){re.escape(k)}(?![\w-])", cites[t])] for k in d["pages"]}

    # ---- his ISO coverage: requirement, type, week, tasks, depth
    # A range of tasks in his cell ("T3.2–T10.2 control sprints", Clause 8.1) is written out task by task, in programme
    # order, so the certification page and the catalogue credit every task in it, not its two ends (integration fixes).
    def spans(cell: str) -> str:
        sprint = {s["task"] for s in SPRINTS["sprints"]}
        named = set(re.findall(r"\b[FT]\d{1,2}\.\d\b", re.sub(r"\b[FT]\d{1,2}\.\d\s*[–-]\s*[FT]\d{1,2}\.\d\b", "", cell)))

        def one(m):  # "control sprints": the sprint tasks only (T5.1 sits between them and is not one)
            a, b = d["order"].index(m[1]), d["order"].index(m[2])
            return ", ".join(t for t in d["order"][a:b + 1] if ("sprint" not in cell or t in sprint) and t not in named)
        return re.sub(r"\b([FT]\d{1,2}\.\d)\s*[–-]\s*([FT]\d{1,2}\.\d)\b", one, cell)
    d["isocov"] = [[clean(r[0]), clean(r[1]), r[2], spans(clean(r[3])), clean(r[4])] for r in wb["ISO coverage"].iter_rows(min_row=2, values_only=True) if r[0]]

    prune_old_programme(d, wb)
    unlock_weeks(d)

    blob = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    assert "§" not in blob, "a section sign is left in the sample"
    assert '"best"' not in blob, "answer key leaked into the sample"
    OUT.write_text(blob, encoding="utf8")
    print(f"{OUT} — {len(blob) // 1024} KB, {len(rebuilt)} tasks rebuilt, {sum(len(d['tasks'][t]['steps']) for t in rebuilt)} steps")


if __name__ == "__main__":
    main()
