import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";
import { questionsApi } from "@/lib/api/questions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = APP_URL.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/q`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
  ];

  let questionRoutes: MetadataRoute.Sitemap = [];
  try {
    const { items } = await questionsApi.listServer({ page: 1, limit: 500 });
    questionRoutes = items
      .filter((q) => q.status !== "closed")
      .map((q) => ({
        url: `${base}/q/${q.slug}`,
        lastModified: new Date(q.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    /* API unavailable at build time */
  }

  return [...staticRoutes, ...questionRoutes];
}
