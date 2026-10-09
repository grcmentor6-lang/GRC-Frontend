import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The new desk was briefly served at /desk; it is the Working Desk now. The #T5.1 fragment survives the redirect.
  async redirects() {
    return [{ source: "/desk", destination: "/app/desk", permanent: false }];
  },
};

export default nextConfig;
