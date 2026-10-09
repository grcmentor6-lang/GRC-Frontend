import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// IBM Plex (2026-10-09): Sans for reading, Mono for every code, tag, label and figure — the
// register look of the key-results strip, carried across the app. Plex was drawn for enterprise
// and regulated work and stays legible for readers whose first language is not English.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Display serif for the verifiable certificate.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "grcmentor — Become a job-ready GRC professional",
  description:
    "Hands-on governance, risk and compliance mentorship. Practise on simulated enterprise engagements, graded against ISO 27001, NIST CSF, CIS v8, SOC 2 and GDPR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
