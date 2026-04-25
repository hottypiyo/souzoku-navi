import type { MetadataRoute } from "next";

const BASE = "https://souzoku-navi.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date("2026-04-25"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date("2026-04-25"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/tokushoho`,
      lastModified: new Date("2026-04-25"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
