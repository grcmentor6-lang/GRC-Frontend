// Definitions for the technical terms a deliverable uses. Single source of truth: content strings
// are never annotated — the renderer matches text against this map, so adding a term here lights it
// up everywhere it already appears, retroactively.
//
// ponytail: seeded with AA-001 (Information Asset Inventory & Classification) vocabulary only, and
// deliberately NOT scoped per task — a term means the same thing in every task, so the map stays flat.
// Extend it task by task; no scoping machinery needed unless two tracks ever disagree on a definition.
export const GLOSSARY: Record<string, string> = {
  "information asset": "Anything holding information that has value to the organisation — data, software, hardware, services, people or intangibles such as reputation.",
  "asset register": "The controlled list of information assets with, for each one, its owner, location, format and classification.",
  "information asset register": "The controlled list of information assets with, for each one, its owner, location, format and classification. The deliverable for this task.",
  "asset owner": "The named role accountable for an asset's classification, protection and periodic review. A role title, never a person or a department.",
  "custodian": "The role that operates and safeguards an asset day to day, on the owner's behalf. Custody is not ownership — the owner remains accountable.",
  "classification": "Assigning an asset a sensitivity tier (here: Public, Internal or Confidential) so the level of protection follows the level of sensitivity.",
  "CIA triad": "Confidentiality, Integrity and Availability — the three properties an asset is rated against to decide how much protection it needs.",
  "confidentiality": "The property that information is disclosed only to those authorised to see it.",
  "integrity": "The property that information stays accurate and complete, and is changed only in authorised ways.",
  "availability": "The property that information is accessible to authorised users when they need it.",
  "personal data": "Any information relating to an identified or identifiable living person.",
  "sign-off": "Formal acceptance by the accountable role that the deliverable is complete and correct. Recorded — a verbal agreement is not sign-off.",
  "Annex A": "The catalogue of 93 reference controls in ISO/IEC 27001:2022. Controls are selected from it, and exclusions justified, in the Statement of Applicability.",
  "Statement of Applicability": "The ISO/IEC 27001 document recording which Annex A controls apply, why, and why any are excluded.",
  "scope": "The boundary of the engagement — which teams, systems and information are inside it, and what is explicitly outside.",
  "residual gap": "A shortfall that remains after the work is done — recorded openly rather than hidden, so it can be owned and scheduled.",
  "NIST CSF": "The NIST Cybersecurity Framework — an outcome-based framework this task cross-references, so one body of evidence can answer two standards.",
  "crosswalk": "A mapping showing how a control in one framework corresponds to a control in another.",
  "process owner": "The role accountable for how a business process runs, and the person who reviews work produced about it.",

  // ── Organisation context: the vocabulary the org profile, regulator rationale and standards
  // chips actually use. Different language from the task vocabulary above, same map. ──
  "GDPR": "The EU General Data Protection Regulation — the baseline law for processing personal data of people in the EU/EEA.",
  "KVKK": "Türkiye's personal data protection law, closely modelled on GDPR and enforced strictly, especially for children's data.",
  "NIS2": "The EU directive setting cybersecurity and incident-reporting duties on essential and important entities.",
  "HIPAA": "The US law governing protected health information held by healthcare providers and their business associates.",
  "FERPA": "The US law protecting the privacy of student education records.",
  "COPPA": "The US law requiring verifiable parental consent before collecting personal data from children under 13.",
  "CCPA": "California's consumer privacy law, giving residents rights over the personal information businesses hold about them.",
  "protected health information": "Health data that identifies an individual — the category HIPAA protects.",
  "PII": "Personally Identifiable Information — data that identifies a specific person, on its own or combined with other data.",
  "data controller": "The party that decides why and how personal data is processed, and carries the legal accountability.",
  "data processor": "The party that processes personal data on a controller's instructions, and only on those instructions.",
  "sub-processor": "A third party a processor engages to help process personal data. The customer must be told, and the same duties flow down.",
  "data processing agreement": "The contract, required by GDPR Article 28, that fixes what a processor may do with a controller's personal data.",
  "DPA": "Data Processing Agreement — the Article 28 contract fixing what a processor may do with a controller's personal data.",
  "Data Protection Officer": "The independent role required of some organisations to oversee data protection compliance and act as the regulator's contact.",
  "DPO": "Data Protection Officer — the independent role overseeing data protection compliance and acting as the regulator's contact.",
  "DPIA": "Data Protection Impact Assessment — the structured assessment required before processing likely to be high-risk to people's rights.",
  "RoPA": "Record of Processing Activities — the GDPR Article 30 register of what personal data an organisation processes, why, and with whom.",
  "lawful basis": "The specific legal ground (consent, contract, legal obligation, vital interests, public task or legitimate interests) that permits a given processing activity.",
  "breach notification": "The duty to tell the regulator — and sometimes the people affected — about a personal data breach, usually within 72 hours.",
  "cross-border data transfer": "Moving personal data outside its home jurisdiction, which needs a specific safeguard such as adequacy or standard contractual clauses.",
  "data residency": "A commitment about which country or region a customer's data is physically stored and processed in.",
  "multi-tenant": "One shared application instance serving many customers, with their data logically separated rather than physically.",
  "shared responsibility": "The split of security duties between a cloud provider and its customer — the provider secures the platform, the customer secures what they put on it.",
  "SOC 2": "An AICPA attestation report on a service organisation's controls for security, availability, confidentiality, processing integrity and privacy.",
  "BSI C5": "The German BSI's Cloud Computing Compliance Criteria Catalogue — the cloud security attestation expected for German public-sector buyers.",
  "attestation": "An independent auditor's formal opinion on whether stated controls exist and operate — evidence you can hand a customer.",
  "ISO 22301": "The international standard for business continuity management systems.",
  "ISO/IEC 27701": "The privacy extension to ISO/IEC 27001, adding requirements for managing personal data.",
  "CIS Controls": "A prioritised set of 18 defensive actions, grouped into Implementation Groups, that covers basic cyber hygiene first.",
  "SLA": "Service Level Agreement — the contractual commitment to a measurable level of service, such as uptime.",
  "KYC": "Know Your Customer — the identity checks a regulated business must run before onboarding a client.",
  "AML": "Anti-Money Laundering — the obligations to detect, prevent and report the laundering of criminal proceeds.",
  "BYOD": "Bring Your Own Device — staff using personal phones or laptops for work, which shifts where company data can end up.",
  "OWASP": "An open community whose Top 10 list of web application security risks is the common baseline for secure coding.",
  "PKI": "Public Key Infrastructure — the certificates, authorities and processes that let systems prove identity and encrypt traffic.",
  "HSM": "Hardware Security Module — tamper-resistant hardware that generates and stores cryptographic keys.",
  "NDA": "Non-Disclosure Agreement — the contract binding someone to keep disclosed information confidential.",
  "air-gapped": "Physically isolated from other networks, so data can only move in or out deliberately.",
  "GRC": "Governance, Risk and Compliance — running an organisation so that direction is set, risks are managed, and obligations are met, as one joined-up discipline.",
  "regulatory examination": "A supervisor's formal, recurring inspection of a regulated firm's controls, records and conduct.",
  "ESG": "Environmental, Social and Governance — the non-financial factors an organisation reports on and is increasingly held to account for.",
  "compliance": "Meeting the obligations that apply to the organisation — laws, regulations, standards and contracts — and being able to show it.",
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Longest first, so "information asset register" wins over "asset register" / "information asset".
const PATTERN = new RegExp(
  `\\b(${Object.keys(GLOSSARY).sort((a, b) => b.length - a.length).map(escape).join("|")})\\b`,
  "gi",
);

const BY_KEY = new Map(Object.entries(GLOSSARY).map(([k, v]) => [k.toLowerCase(), v]));

export interface TermHit {
  /** The text as it appears in the source, so casing is preserved. */
  text: string;
  /** Canonical lookup key. */
  key: string;
  definition: string;
}

/**
 * Splits `text` into plain strings and glossary hits. `seen` (a set of canonical keys, shared across
 * one deliverable) makes only the FIRST occurrence of a term interactive — otherwise a dense GRC
 * paragraph reads like a minefield. Pass a fresh set per deliverable; omit it to match every occurrence.
 */
export function splitTerms(text: string, seen: Set<string> = new Set()): (string | TermHit)[] {
  const out: (string | TermHit)[] = [];
  let last = 0;
  PATTERN.lastIndex = 0;
  for (let m = PATTERN.exec(text); m; m = PATTERN.exec(text)) {
    const key = m[0].toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ text: m[0], key, definition: BY_KEY.get(key)! });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

