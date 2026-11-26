// Billing reference content — read-only for MVP (no Stripe yet; pricing still being finalised).
// GRC 101 ships free; the paid tracks (301/501) are previewed as upcoming. When billing goes
// live this is replaced by a real /me/billing endpoint, but the shape stays the same.

import type { IconName } from "@/components/ui/icon";

// --- Foundations course price (placeholder — change here to update checkout + billing) ---
export const FOUNDATION_PRICE = "$125";
export const FOUNDATION_PRICE_CAPTION = "One-time payment · lifetime access";

export interface BillingPlanContent {
  id: string;
  programCode: string;
  name: string;
  price: string;
  cycle: string;
  blurb: string;
  features: string[];
  icon: IconName;
  status: "current" | "upcoming";
}

/** The course the user buys to unlock the platform. One-time purchase in MVP. */
export const CURRENT_PLAN: BillingPlanContent = {
  id: "grc101",
  programCode: "GRC 101",
  name: "Foundations Course",
  price: FOUNDATION_PRICE,
  cycle: FOUNDATION_PRICE_CAPTION,
  blurb: "Full access to the GRC 101 Foundations track.",
  icon: "shield",
  status: "current",
  features: [
    "Complete GRC 101 engagement (25 tasks, 12 weeks)",
    "Automated checking against answer keys on every step",
    "Auto-compiled CV, badges & certificate",
    "Job matching from your executed work",
  ],
};

/** Higher tracks, shown as upcoming. Pricing is finalised before these launch. */
export const UPCOMING_PLANS: BillingPlanContent[] = [
  {
    id: "grc301",
    programCode: "GRC 301",
    name: "Practitioner",
    price: "Coming soon",
    cycle: "Medium-criticality industries",
    blurb: "Advance into medium-criticality engagements and deeper risk work.",
    icon: "rocket",
    status: "upcoming",
    features: ["Everything in Foundations", "GRC 301 practitioner engagements", "Practitioner-level certificate"],
  },
  {
    id: "grc501",
    programCode: "GRC 501",
    name: "Advanced",
    price: "Coming soon",
    cycle: "High-criticality industries",
    blurb: "Lead high-criticality programmes across banking, healthcare and government.",
    icon: "ribbon",
    status: "upcoming",
    features: ["Everything in Practitioner", "GRC 501 advanced engagements", "Advanced-level certificate"],
  },
];
