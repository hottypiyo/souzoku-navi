import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/privacy", "/terms", "/tokushoho"],
        disallow: ["/dashboard", "/onboarding", "/settings", "/upgrade", "/api/"],
      },
    ],
    sitemap: "https://souzoku-navi.app/sitemap.xml",
  };
}
