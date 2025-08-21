import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://financecareermentor.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/chat`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/subscribe`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
