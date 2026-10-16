import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The new desk was briefly served at /desk; it is the Working Desk now. The #T5.1 fragment survives the redirect.
  async redirects() {
    return [
      { source: "/desk", destination: "/app/desk", permanent: false },
      // My Learnings gave way to My Submissions in the menu (2026-10-15).
      { source: "/app/learnings", destination: "/app/submissions", permanent: false },
    ];
  },
};

export default nextConfig;
