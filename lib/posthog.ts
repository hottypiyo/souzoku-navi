import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (posthog.__loaded) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: false, // Next.js App Router のルート変化は手動でキャプチャ
    capture_pageleave: true,
    persistence: "localStorage",
  });
}

export { posthog };
