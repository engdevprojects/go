import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * Type and lint errors are deliberately NOT ignored during builds — a failing
 * check must fail the build. No remote image hosts are configured because all
 * imagery is local.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Pin the workspace root: a stray lockfile higher up the tree would otherwise be inferred as the root.
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera is needed only by the Pay & Tip QR scanner on this origin.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
