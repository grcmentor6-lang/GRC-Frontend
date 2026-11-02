#!/usr/bin/env python3
"""Writes Tech Lab TL-36-SOC-08-DLP02-C: its console data (public/desk/labs/<id>.json) and its key
(backend/_seed/grc101_lab_keys.json, merged, so take the shared lock). Pack: techlab_catalogue.json, simulator
DataSentry, template DLP 02 "Label coverage", LearnTech, Microsoft Purview Information Protection + DSPM; this is the
mentee's own DataSentry draw (week 9). Screens and defects from p_techsim.py and sims_b.dlp. Related task moved from
F2.1 (week 2, GlobalConnect) to T10.1 (week 10, LearnTech): the scan is read against the RoPA entry and data-flow map
the learner has just drawn. Labels per system come from the pack's asset register (context.json, org 36). The
repositories, catalogue and policies are written here and are synthetic. Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-SOC-08-DLP02-C"
AS_OF = "2026-12-07"

NL, IN, US = "Netherlands", "India", "United States"
CONF, RES, INT, PUB, NOLAB = "Confidential", "Restricted (Research/PII)", "Internal", "Public", "(no label)"
LMS, AN, AP, CMD, TKT, CTI = "Learning platform & content", "Learner analytics data", "Assessment & proctoring data", "Customer master data", "Customer support / ticketing", "Customer communications & CTI"
EDT, CSM, SSM, HRM, SAL, FIN, ITM = "Regional EdTech Manager", "Regional Customer Support Manager", "Regional Student Services Manager", "Regional HR Manager", "Regional Sales Director", "Regional Finance Controller", "Regional IT Manager"
ACT = "Corporate LMS"

# The pack's asset register (context.json, LearnTech, Amsterdam and Mumbai give each system the same label).
register = [
    [LMS, EDT, CONF], [AN, EDT, RES], [AP, EDT, RES], [CMD, CSM, RES], [TKT, CSM, CONF], [CTI, CSM, CONF],
    ["Knowledge base & help centre", CSM, INT], ["Student support / CRM", SSM, RES], ["Student records & welfare", SSM, RES],
    ["Accommodation & services data", SSM, INT], ["Regional HR records", HRM, RES], ["Local payroll & benefits", HRM, RES],
    ["Employee relations case files", HRM, RES], ["CRM platform", SAL, CONF], ["Quoting & proposal system (CPQ)", SAL, CONF],
    ["Sales analytics & forecasts", SAL, INT], ["Regional billing & AR records", FIN, CONF], ["Regional accounting ledger", FIN, CONF],
    ["Local tax & statutory filings", FIN, RES],
]
TIER = {INT: "Tier 2 — Internal", CONF: "Tier 3 — Confidential", RES: "Tier 4 — Restricted"}
label_of = {s: l for s, _, l in register}

# Repository, Activity, System, Country, Personal data, Types found, Label applied, Last scan; then owner and registered purpose (Catalogue).
F = [
    # The corporate LMS's eight (planted: two off the map with a purpose, one with none; two unlabelled, two below)
    ["lms-prod-eu", ACT, LMS, NL, "Yes", "Name; Work e-mail; Employee ID; Course progress; Quiz marks", CONF, "2026-12-04", EDT, "The corporate LMS: courses, enrolments, progress and marks of clients' employees", "2025-02-03"],
    ["crm-accounts-eu", ACT, CMD, NL, "Yes", "Administrator name; Work e-mail; Phone; Entitlements", CONF, "2026-12-03", CSM, "Client accounts: training administrators' contacts and the courses and seats bought", "2025-02-03"],
    ["support-desk-mum", ACT, TKT, IN, "Yes", "Learner name; Work e-mail; Ticket notes", CONF, "2026-12-02", CSM, "Second-line support tickets for LMS sign-in and enrolment problems", "2025-06-16"],
    ["lms-enrol-staging-mum", ACT, LMS, IN, "Yes", "Name; Work e-mail; Employee ID; Department; Job title", NOLAB, "2026-12-02", EDT, "Enrolment lists from clients in India, held until they are uploaded to the LMS", "2025-06-16"],
    ["proctor-recordings-us", ACT, AP, US, "Yes", "Learner name; Webcam video; Screen recording", RES, "2026-11-30", EDT, "Proctored final-exam recordings, held by the proctoring provider and erased 90 days after the exam", "2025-09-01"],
    ["lms-dr-replica-us", ACT, LMS, US, "Yes", "Name; Work e-mail; Employee ID; Course progress; Quiz marks", CONF, "2026-12-04", EDT, "Disaster-recovery replica of lms-prod-eu, in a second hosting region, so the LMS can be restored after an outage", "2026-05-11"],
    ["cti-ams-lms", ACT, CTI, NL, "Yes", "Administrator name; Phone; Call notes", INT, "2026-12-01", CSM, "Calls and chats with clients' training administrators about LMS problems", "2025-02-03"],
    ["analytics-lms-export", ACT, AN, NL, "Yes", "Employee ID; Department; Course progress; Quiz marks", NOLAB, "2026-12-03", EDT, "Copy of course progress and quiz marks for LearnTech's own engagement dashboards and course design", "2026-03-14"],
    # Decoys: the activity's repositories with no personal data
    ["lms-courseware-eu", ACT, LMS, NL, "No", "", INT, "2026-12-04", EDT, "Course pages, videos and documents of the corporate LMS", "2025-02-03"],
    ["lms-quizbank-eu", ACT, LMS, NL, "No", "", CONF, "2026-12-04", EDT, "Quiz questions and answer keys of the corporate courses", "2025-02-03"],
    ["lms-video-cdn-us", ACT, LMS, US, "No", "", PUB, "2026-12-01", EDT, "Course videos cached near learners for faster playback", "2025-09-22"],
    ["kb-lms-help-ams", ACT, "Knowledge base & help centre", NL, "No", "", INT, "2026-11-28", CSM, "Help articles for corporate LMS users", "2025-02-03"],
    # Decoys: other activities' personal data
    ["schools-lms-eu", "Schools platform", LMS, NL, "Yes", "Pupil name; Class; School e-mail; Marks", RES, "2026-12-04", EDT, "The schools platform: pupils' classes, work and marks", "2024-08-19"],
    ["schools-analytics-eu", "Schools platform", AN, NL, "Yes", "Pupil ID; Progress; Predicted grade", RES, "2026-12-03", EDT, "Progress analytics for schools, under each school's agreement", "2024-08-19"],
    ["schools-exams-eu", "Schools platform", AP, NL, "Yes", "Pupil name; Exam answers", RES, "2026-12-02", EDT, "Online tests set by schools", "2024-08-19"],
    ["schools-support-mum", "Schools platform", "Student support / CRM", IN, "Yes", "Pupil name; Parent e-mail; Case notes", RES, "2026-12-02", SSM, "Support cases raised by schools and parents", "2025-06-16"],
    ["schools-content-eu", "Schools platform", LMS, NL, "No", "", INT, "2026-12-04", EDT, "Lessons and worksheets of the schools platform", "2024-08-19"],
    ["student-crm-ams", "Student services", "Student support / CRM", NL, "Yes", "Student name; Case notes; Wellbeing flag", RES, "2026-11-29", SSM, "University students' support cases", "2024-09-02"],
    ["student-welfare-ams", "Student services", "Student records & welfare", NL, "Yes", "Student name; Student number; Welfare notes", RES, "2026-11-29", SSM, "Student welfare and support records", "2024-09-02"],
    ["student-crm-mum", "Student services", "Student support / CRM", IN, "Yes", "Student name; Case notes", RES, "2026-11-30", SSM, "University students' support cases, Mumbai", "2025-06-16"],
    ["accommodation-ams", "Student services", "Accommodation & services data", NL, "No", "", INT, "2026-11-25", SSM, "Room types and campus service catalogue", "2024-09-02"],
    ["hr-records-ams", "Workforce (HR)", "Regional HR records", NL, "Yes", "Employee name; Contract; Salary", RES, "2026-11-27", HRM, "LearnTech employees' HR records, Amsterdam", "2024-01-08"],
    ["payroll-ams", "Workforce (HR)", "Local payroll & benefits", NL, "Yes", "Employee name; Bank account; Salary", RES, "2026-11-27", HRM, "Payroll and benefits, Amsterdam", "2024-01-08"],
    ["er-cases-mum", "Workforce (HR)", "Employee relations case files", IN, "Yes", "Employee name; Case notes", RES, "2026-11-26", HRM, "Employee relations cases, Mumbai", "2025-06-16"],
    ["crm-sales-ams", "Sales & marketing", "CRM platform", NL, "Yes", "Contact name; Work e-mail; Phone", CONF, "2026-12-01", SAL, "Prospects and sales opportunities", "2024-03-04"],
    ["newsletter-list-ams", "Sales & marketing", "CRM platform", NL, "Yes", "Name; E-mail; Opt-in date", CONF, "2026-12-01", SAL, "Marketing newsletter subscribers who opted in", "2024-03-04"],
    ["cpq-ams", "Sales & marketing", "Quoting & proposal system (CPQ)", NL, "No", "", CONF, "2026-11-24", SAL, "Price books and proposal templates", "2024-03-04"],
    ["sales-analytics-ams", "Sales & marketing", "Sales analytics & forecasts", NL, "No", "", INT, "2026-11-24", SAL, "Pipeline totals and forecasts", "2024-03-04"],
    ["billing-ams", "Finance", "Regional billing & AR records", NL, "Yes", "Contact name; Invoice address", CONF, "2026-11-26", FIN, "Invoices and receivables, Amsterdam", "2024-01-08"],
    ["ledger-ams", "Finance", "Regional accounting ledger", NL, "Yes", "Supplier contact name", CONF, "2026-11-26", FIN, "General ledger, Amsterdam", "2024-01-08"],
    ["tax-filings-ams", "Finance", "Local tax & statutory filings", NL, "No", "", RES, "2026-11-26", FIN, "Tax returns and statutory filings, Amsterdam", "2024-01-08"],
]
assert all(f[2] in label_of for f in F), [f[2] for f in F if f[2] not in label_of]
assert len({f[0] for f in F}) == len(F)
# On screen: Repository, Activity, System, Country, Personal data, Label applied, Types found (last, so Label applied fits
# at 1366 without a sideways scroll). Last scan is written above for the record, not shown: no question reads it.
disc = sorted([[*f[:5], f[6], f[5]] for f in F], key=lambda r: r[0])
cat = sorted([[f[0], f[8], f[9], f[10]] for f in F], key=lambda r: r[0])

AUDIT, BLOCK = "Audit only", "Enforce (block + notify)"
pols = [
    ["DLP-0410", "Protect personal contact data", "Personal contact data", "Email, Web, Endpoint", BLOCK, CONF],
    ["DLP-0411", "Protect personal contact data (Restricted)", "Personal contact data", "All channels", AUDIT, RES],
    ["DLP-0412", "Protect government ID numbers", "Government ID numbers", "All channels", BLOCK, RES],
    ["DLP-0413", "Protect bank account / IBAN", "Bank account / IBAN", "Email, Cloud apps", AUDIT, CONF],
    ["DLP-0414", "Protect payment card numbers", "Payment card numbers", "All channels", BLOCK, RES],
    ["DLP-0415", "Protect employee HR records", "Employee HR records", "Email, Web, Endpoint", BLOCK, RES],
    ["DLP-0416", "Protect student records", "Student records", "Email, Cloud apps", AUDIT, RES],
    ["DLP-0417", "Protect research participant data", "Research participant data", "All channels", BLOCK, RES],
    ["DLP-0418", "Watch course content sharing", "Course content", "Web", AUDIT, INT],
]

FOUND = [f[0] for f in F[:8]]
ON, OFF = "On the map", "Not on the map"
OK_L, NO_L, LOW_L = "Labelled as the register requires", "Unlabelled", "Labelled below the register"
SYS, TRF, ERASE = "Add a System flow to DFM", "Add a Transfer flow to DFM", "Erase it and tell the DPO"

public = {
    "id": LAB,
    "sim": "DataSentry",
    "title": "Label coverage",
    "org": "LearnTech Educational Solutions",
    "product": "Microsoft Purview Information Protection + DSPM",
    "capability": "Data discovery, classification labelling & DSPM",
    "tenant": "learntech.example / Data Map",
    "asOf": AS_OF,
    "related": "T10.1",
    "feed": "ROPA Record, row Discovery scan check",
    "context": "At LearnTech, data discovery and labelling run on Microsoft Purview Information Protection with DSPM, named here only for context. DataSentry is a brand-neutral simulator that shows the same governance information. All repository data is synthetic.",
    "atWork": "At work, a junior analyst checks a RoPA entry against the data catalogue's discovery scan before the DPO approves it: an owner's description names the systems they know, and the scan finds the copies they forgot.",
    "owner": ["Privacy Compliance Analyst", "Your RoPA entry and data-flow map are drawn from the Regional EdTech Manager's description, and a description misses copies. Before the entry goes to the DPO, check LearnTech's data catalogue: where has the latest discovery scan found the corporate LMS's personal data, is each place on your map, and is each labelled as it should be? Capture what you find, so the DPO can rely on it without opening the console."],
    "rules": [
        ["BKB-POL-017 Section 3.1", "Each organisation keeps a RoPA entry for every processing activity (GDPR Art.30) … Its data-flow map shows where the personal data is collected, the systems that hold it, every transfer and where it is deleted, with the system names of the asset register. … A transfer is any movement of personal data out of that country, including when people in another country view it or download it remotely."],
        ["What that means for a repository", "A repository is on the map when a flow of your DFM puts the activity's data in that repository's system, in that repository's country. A system on the map in one country does not cover its copy in another."],
        ["BKB-POL-017 Section 3.2", "Processor: processes personal data on behalf of a controller, only on the controller's documented instructions and for the controller's purposes … An organisation that uses the personal data for a purpose of its own becomes a controller for that purpose, and records it as a separate processing activity."],
        ["BKB-STD-001 Sections 2 and 8", "Owner classifies: the asset owner recorded in the Information Asset Register is accountable for classification. Copies, extracts, screenshots and reports inherit the classification of the source. A repository therefore carries the label the Classification register gives its system."],
        ["BKB-STD-001 Section 6, Labelling", "Tier 3 Confidential: visible label (header+footer+metadata); MIP/DLP label mandatory. Tier 4 Restricted: visible label on every page/screen; watermark with user ID; DLP block rules."],
    ],
    "views": [
        {"key": "disc", "title": "Discovery scans", "sub": "The latest scan of each repository LearnTech has connected. Activity is the processing activity the scanner traced the data to. Personal data is Yes where the scan found any; Types found says what. Country is where the data is stored: LearnTech's EU hosting region is in the Netherlands.",
         "cols": ["Repository", "Activity", "System", "Country", "Personal data", "Label applied", "Types found"], "filters":["Activity", "Personal data", "Country", "Label applied"], "rows": disc},
        {"key": "cat", "title": "Catalogue", "sub": "Each repository's catalogue entry, as its data owner registered it.",
         "cols": ["Repository", "Data owner", "Registered purpose", "Registered on"], "filters": ["Data owner"], "rows": cat},
        {"key": "reg", "title": "Classification register", "sub": "LearnTech's classification register extract: the label each system's owner gave it. The label is the same in Amsterdam and Mumbai. Tier 3 is Confidential; Tier 4 is Restricted (Research/PII).",
         "cols": ["System", "Label", "Group tier"], "filters": [], "rows": [[s, l, TIER[l]] for s, _, l in register]},
        {"key": "pol", "title": "Policies", "sub": "Data-loss-prevention policies. \"Audit only\" detects and logs, but does not block.",
         "cols": ["Policy", "Name", "Data type", "Channels", "Mode", "Applies to label"], "filters": ["Mode", "Applies to label"], "rows": pols},
    ],
    "guide": {"view": "disc", "col": "Activity", "value": "Schools platform"},
    "parts": [
        {"id": "found", "kind": "capture", "title": "Where the activity's personal data sits",
         "ask": "Find every repository where the scan found personal data of the corporate LMS activity, and capture exactly those.",
         "where": "Discovery scans. Use two filters together: one for the activity, one for what the scan found. Press Capture evidence, then choose the capture here."},
        {"id": "map", "kind": "rows", "title": "Is each one on your data-flow map?",
         "ask": "For each repository you captured, decide whether your DFM accounts for it.",
         "where": "Discovery scans gives each repository's System and Country. DFM, in this step's hand-in on the desk, gives each flow's line and its System: close this window to read it, and open it again from Systems. The rules you apply says when a repository is on the map.",
         "options": [ON, OFF], "from": [{"part": "found"}]},
        {"id": "label", "kind": "rows", "title": "Is each one labelled as it should be?",
         "ask": "For each repository you captured, compare the label applied with the label its system should carry.",
         "where": "Discovery scans shows each repository's System and Label applied. Classification register gives each system's label. BKB-STD-001 is in The rules you apply.",
         "options": [OK_L, NO_L, LOW_L], "from": [{"part": "found"}]},
        {"id": "dlp", "kind": "capture", "title": "Policies that only watch",
         "ask": "BKB-STD-001 Section 6 asks for DLP block rules on Tier 4 data. Find every policy for LearnTech's Tier 4 label that does not block, and capture exactly those.",
         "where": "Policies. Classification register says which label is Tier 4; the Policies screen says what each Mode does. Use two filters together."},
        {"id": "act", "kind": "rows", "title": "What the DPO is asked to approve",
         "ask": "For each repository not on your map, decide what the DPO should be asked to approve.",
         "where": "Catalogue gives each repository's registered purpose: compare it with the client's purposes in your ROPA, in this step's hand-in. Discovery scans gives its Country. BKB-POL-017 Sections 3.1 and 3.2 are in The rules you apply.",
         "options": [SYS, TRF, ERASE], "from": [{"part": "map", "keep": OFF}]},
    ],
}

key = {
    "parts": {
        "found": {"view": "disc", "ids": sorted(FOUND),
                  "why": "Eight repositories of the corporate LMS activity hold personal data. Four more are traced to it but the scan found no personal data in them (course pages, quiz bank, video cache, help articles), and other activities' personal data is not this RoPA's."},
        "map": {"rows": {
            "lms-prod-eu": {"best": ON, "why": "F1 and F2: the LMS, Learning platform & content, in the EU hosting region in the Netherlands."},
            "crm-accounts-eu": {"best": ON, "why": "F3: the administrators and entitlements in the Amsterdam office's customer account records, Customer master data."},
            "support-desk-mum": {"best": ON, "why": "F4: the fix is recorded on the learner's ticket in the Mumbai office's support desk, Customer support / ticketing, in India."},
            "lms-enrol-staging-mum": {"best": ON, "why": "F5: the Mumbai office holds the enrolment lists clients in India send it, then uploads them. This is where it holds them."},
            "proctor-recordings-us": {"best": ON, "why": "F7: the recording goes to the proctoring provider's service in the United States, Assessment & proctoring data."},
            "lms-dr-replica-us": {"best": OFF, "why": "Learning platform & content is on the map in the Netherlands only. No flow takes the LMS's data to the United States, and a copy there is data leaving the country."},
            "cti-ams-lms": {"best": OFF, "why": "No flow of the map is in Customer communications & CTI. The administrators' calls are kept in a system the map does not name."},
            "analytics-lms-export": {"best": OFF, "why": "No flow of the map is in Learner analytics data. The course progress and marks were copied out of the LMS into a system the map does not name."},
        }},
        "label": {"rows": {
            "lms-prod-eu": {"best": OK_L, "why": "Confidential, and the register gives Learning platform & content Confidential."},
            "crm-accounts-eu": {"best": LOW_L, "why": "Confidential, but the register gives Customer master data Restricted (Research/PII), Tier 4."},
            "support-desk-mum": {"best": OK_L, "why": "Confidential, and the register gives Customer support / ticketing Confidential."},
            "lms-enrol-staging-mum": {"best": NO_L, "why": "No label. Section 6 makes a label mandatory from Tier 3, and personal data is never below Tier 3."},
            "proctor-recordings-us": {"best": OK_L, "why": "Restricted (Research/PII), and the register gives Assessment & proctoring data the same."},
            "lms-dr-replica-us": {"best": OK_L, "why": "Confidential, as Learning platform & content. A copy inherits its source's classification, and here they agree."},
            "cti-ams-lms": {"best": LOW_L, "why": "Internal, but the register gives Customer communications & CTI Confidential, Tier 3."},
            "analytics-lms-export": {"best": NO_L, "why": "No label. A copy keeps its source's classification, and this one carries none."},
        }},
        "dlp": {"view": "pol", "ids": ["DLP-0411", "DLP-0416"],
                "why": "Two policies for Restricted (Research/PII), LearnTech's Tier 4 label, are in Audit only: they log a Tier 4 file leaving and let it go. DLP-0413 and DLP-0418 also only audit, but for Tier 3 and Tier 2 labels, where Section 6 asks for no block rule."},
        "act": {"options": [SYS, TRF, ERASE], "rows": {
            "lms-dr-replica-us": {"best": TRF, "why": "Its purpose, restoring the LMS after an outage, is part of running the service the client bought. But it sits in the United States: the data leaves the Netherlands, so DFM needs a Transfer flow, and the DPO approves its safeguard (Section 3.1)."},
            "cti-ams-lms": {"best": SYS, "why": "Its purpose, LMS support for the client's administrators, is part of the service, and the RoPA's Recipients already names LearnTech's support teams. It is in the Netherlands, as the LMS is: DFM needs a System flow in Customer communications & CTI."},
            "analytics-lms-export": {"best": ERASE, "why": "Its purpose is LearnTech's own dashboards and course design, and none of the client's purposes covers it. A processor uses the data only for the controller's purposes (Section 3.2); using it for its own would make LearnTech a controller, with an entry of its own. It does not go on this map: erase it, and the DPO decides whether LearnTech wants such an activity."},
        }},
    },
    "findings": [
        "The discovery scan finds the corporate LMS's personal data in eight repositories; three are not on DFM. Two serve the client's purposes: cti-ams-lms needs a System flow (Customer communications & CTI), and lms-dr-replica-us, a copy of the LMS in the United States, a Transfer flow whose safeguard the DPO approves. Evidence {found}.",
        "The third, analytics-lms-export, copies course progress and quiz marks for LearnTech's own dashboards. No purpose of the client's covers it, and using it would make LearnTech a controller (BKB-POL-017 Section 3.2): Regional EdTech Manager to erase it; the DPO to be told. Evidence {found}.",
        "Labels (BKB-STD-001 Section 6): lms-enrol-staging-mum and analytics-lms-export carry none; crm-accounts-eu (Confidential, register Restricted (Research/PII)) and cti-ams-lms (Internal, register Confidential) are labelled below their system. Data owners to relabel. Evidence {found}.",
        "DLP-0411 and DLP-0416 cover Restricted (Research/PII) in Audit only, where Tier 4 needs DLP block rules: the CISO to set them to block. Evidence {dlp}.",
    ],
}

(ROOT / f"public/desk/labs/{LAB}.json").write_text(json.dumps(public, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
blob = json.dumps([public, key], ensure_ascii=False)
assert "§" not in blob
# Every capture key is on its view, the rows flow part to part, every best is an option.
views = {v["key"]: {r[0] for r in v["rows"]} for v in public["views"]}
p = key["parts"]
assert set(p["found"]["ids"]) <= views["disc"] and set(p["dlp"]["ids"]) <= views["pol"]
assert set(p["map"]["rows"]) == set(p["label"]["rows"]) == set(FOUND)
assert set(p["act"]["rows"]) == {r for r, x in p["map"]["rows"].items() if x["best"] == OFF}
# The data agrees with its key: the capture is the two filters; labels against the register; policies by label and mode.
assert sorted(r[0] for r in disc if r[1] == ACT and r[4] == "Yes") == sorted(FOUND)
for r in disc:
    if r[0] in FOUND:
        want = OK_L if r[5] == label_of[r[2]] else NO_L if r[5] == NOLAB else LOW_L
        assert p["label"]["rows"][r[0]]["best"] == want, r
assert sorted(x[0] for x in pols if x[4] == AUDIT and x[5] == RES) == p["dlp"]["ids"]
print(LAB, len(disc), "repositories", len(pols), "policies")
