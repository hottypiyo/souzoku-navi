import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // Next.js App Router requires 'unsafe-inline' for __NEXT_DATA__ inline scripts
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Supabase REST + Realtime WebSocket, PostHog analytics
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.i.posthog.com https://us.i.posthog.com https://eu.i.posthog.com",
  "frame-src 'none'",
  // Prevent clickjacking from any origin
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking (legacy browsers)
  { key: "X-Frame-Options", value: "DENY" },
  // Enforce HTTPS for 2 years
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Limit referrer leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature access
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
