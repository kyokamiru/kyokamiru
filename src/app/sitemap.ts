import type { MetadataRoute } from "next";

import { getPublishedGameSlugs, getPublisherSlugs } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, publishers] = await Promise.all([
    getPublishedGameSlugs(),
    getPublisherSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/games"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/publishers"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.4 },
  ];

  return [
    ...staticPages,
    ...games.map(({ slug }) => ({
      url: absoluteUrl(`/games/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...publishers.map(({ slug }) => ({
      url: absoluteUrl(`/publishers/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
