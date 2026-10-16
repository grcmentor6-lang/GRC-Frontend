/**
 * The certification paths the Certification page shows: families of frameworks (ISO, NIST …), the
 * standards in each, and beneath each standard the professional roles it certifies. A role is live
 * when a programme already maps its skills to the desk work — today only ISO/IEC 27001 Lead
 * Implementer, from the GRC 101 pack's LI sheets.
 *
 * ponytail: placeholder structure, by request. The standards are the main ones in cybersecurity
 * GRC; the planned roles are the usual ones for each, not yet taken from a pack. Replace this list
 * when GRC 301 and 501 define their paths; the page reads nothing else.
 */
export interface CertRole {
  k: string;
  name: string;
  /** What someone in this role does, in one line. */
  does: string;
  programme?: "GRC 101" | "GRC 301" | "GRC 501";
  live?: boolean;
}
export interface CertStandard {
  k: string;
  name: string;
  about: string;
  roles: CertRole[];
}
export interface CertFamily {
  k: string;
  name: string;
  about: string;
  standards: CertStandard[];
}

const role = (k: string, name: string, does: string): CertRole => ({ k, name, does });
/** A management-system standard certifies the two roles: who builds the system and who audits it. */
const ms = (k: string, name: string, system: string, extra: CertRole[] = []): CertStandard => ({
  k,
  name,
  about: system.replace(/^./, (c) => c.toUpperCase()),
  roles: [
    role("lead-implementer", "Lead Implementer", `Plans, builds and runs the ${system}.`),
    role("lead-auditor", "Lead Auditor", `Plans and leads audits of the ${system} against the standard.`),
    ...extra,
  ],
});

/** Marks the role a programme already prepares for. */
const live = (s: CertStandard, k: string, programme: CertRole["programme"]): CertStandard => ({
  ...s,
  roles: s.roles.map((r) => (r.k === k ? { ...r, programme, live: true } : r)),
});

export const CERT_FAMILIES: CertFamily[] = [
  {
    k: "iso",
    name: "ISO",
    about: "International management-system standards",
    standards: [
      live(ms("iso27001", "ISO/IEC 27001", "information security management system"), "lead-implementer", "GRC 101"),
      ms("iso27701", "ISO/IEC 27701", "privacy information management system"),
      ms("iso22301", "ISO 22301", "business continuity management system"),
      ms("iso42001", "ISO/IEC 42001", "artificial intelligence management system"),
      ms("iso20000", "ISO/IEC 20000-1", "IT service management system"),
      { k: "iso27005", name: "ISO/IEC 27005", about: "Information security risk management", roles: [role("risk-manager", "Risk Manager", "Runs information security risk assessment and treatment to the standard's process.")] },
      { k: "iso31000", name: "ISO 31000", about: "Enterprise risk management", roles: [role("risk-manager", "Risk Manager", "Designs and runs the organisation's risk management framework and process.")] },
      { k: "iso27017", name: "ISO/IEC 27017 / 27018", about: "Cloud security and cloud privacy", roles: [role("implementer", "Cloud Security Implementer", "Applies the cloud controls and the protection of personal data in public clouds.")] },
    ],
  },
  {
    k: "nist",
    name: "NIST",
    about: "US National Institute of Standards and Technology",
    standards: [
      { k: "nist-csf", name: "CSF 2.0", about: "Cybersecurity Framework", roles: [role("practitioner", "Practitioner", "Builds current and target profiles and maps controls to the six functions."), role("lead-implementer", "Lead Implementer", "Leads an organisation's adoption of the framework, from profile to improvement plan.")] },
      { k: "nist-80053", name: "SP 800-53 Rev. 5", about: "Security and privacy controls", roles: [role("control-assessor", "Control Assessor", "Assesses whether the selected controls are implemented and effective.")] },
      { k: "nist-rmf", name: "RMF (SP 800-37)", about: "Risk Management Framework", roles: [role("practitioner", "RMF Practitioner", "Takes a system through categorise, select, implement, assess, authorise and monitor.")] },
      { k: "nist-privacy", name: "Privacy Framework", about: "Privacy risk management", roles: [role("practitioner", "Privacy Practitioner", "Builds privacy profiles and manages privacy risk across the data lifecycle.")] },
      { k: "nist-ai-rmf", name: "AI RMF", about: "AI Risk Management Framework", roles: [role("practitioner", "AI Risk Practitioner", "Maps, measures and manages the risks of AI systems.")] },
    ],
  },
  {
    k: "cis",
    name: "CIS",
    about: "Center for Internet Security",
    standards: [
      { k: "cis-controls", name: "CIS Controls v8", about: "Prioritised safeguards", roles: [role("implementer", "Implementer", "Puts the Implementation Group safeguards in place and tracks their coverage."), role("assessor", "Assessor", "Assesses safeguard implementation and scores maturity.")] },
      { k: "cis-benchmarks", name: "CIS Benchmarks", about: "Secure configuration baselines", roles: [role("hardening", "Hardening Specialist", "Applies and checks secure configuration baselines on systems.")] },
    ],
  },
  {
    k: "aicpa",
    name: "AICPA",
    about: "Service organisation reports",
    standards: [
      { k: "soc2", name: "SOC 2", about: "Trust Services Criteria", roles: [role("readiness", "Readiness Practitioner", "Prepares the controls, evidence and system description for a SOC 2 examination."), role("internal-auditor", "Internal Auditor", "Tests controls against the Trust Services Criteria before the external examination.")] },
      { k: "soc1", name: "SOC 1", about: "Controls over financial reporting", roles: [role("readiness", "Readiness Practitioner", "Prepares control objectives and evidence for a SOC 1 examination.")] },
    ],
  },
  {
    k: "privacy",
    name: "Privacy",
    about: "Data protection laws",
    standards: [
      { k: "gdpr", name: "GDPR", about: "EU General Data Protection Regulation", roles: [role("practitioner", "Data Protection Practitioner", "Runs records of processing, DPIAs, data-subject requests and breach assessments."), role("dpo", "Data Protection Officer", "Advises on and monitors compliance, and is the contact point for the supervisory authority.")] },
      { k: "ccpa", name: "CCPA / CPRA", about: "California privacy law", roles: [role("practitioner", "Privacy Practitioner", "Runs consumer rights requests, notices and service-provider terms.")] },
      { k: "dpdp", name: "DPDP Act 2023", about: "India's Digital Personal Data Protection Act", roles: [role("practitioner", "Privacy Practitioner", "Puts consent, notice and data-principal rights in place for Indian personal data.")] },
    ],
  },
  {
    k: "payments",
    name: "Payments",
    about: "Card data security",
    standards: [
      { k: "pci-dss", name: "PCI DSS v4.0.1", about: "Payment Card Industry Data Security Standard", roles: [role("implementer", "Implementer", "Scopes the cardholder data environment and puts the requirements in place."), role("isa", "Internal Security Assessor", "Assesses the organisation's own compliance against the requirements.")] },
    ],
  },
  {
    k: "cloud",
    name: "Cloud",
    about: "Cloud security assurance",
    standards: [
      { k: "csa-star", name: "CSA STAR / CCM v4", about: "Cloud Controls Matrix", roles: [role("auditor", "Cloud Auditor", "Assesses cloud services against the Cloud Controls Matrix.")] },
    ],
  },
  {
    k: "governance",
    name: "Governance",
    about: "IT governance frameworks",
    standards: [
      { k: "cobit", name: "COBIT 2019", about: "Governance of enterprise IT", roles: [role("practitioner", "Governance Practitioner", "Designs the governance system and assesses process capability.")] },
    ],
  },
  {
    k: "regulation",
    name: "Sector regulation",
    about: "Laws for regulated sectors",
    standards: [
      { k: "nis2", name: "NIS2", about: "EU network and information security directive", roles: [role("compliance", "Compliance Manager", "Puts the directive's risk measures and incident reporting in place.")] },
      { k: "dora", name: "DORA", about: "EU Digital Operational Resilience Act", roles: [role("compliance", "Compliance Manager", "Runs ICT risk, incident, testing and third-party requirements for financial entities.")] },
      { k: "hipaa", name: "HIPAA", about: "US health information privacy and security", roles: [role("compliance", "Compliance Officer", "Applies the Privacy and Security Rules and handles breach notification.")] },
    ],
  },
];
