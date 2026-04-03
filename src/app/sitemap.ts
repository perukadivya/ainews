import { MetadataRoute } from "next";
import { getAvailableDates } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ainews.kprsnt.in";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic: add archive dates that have data
  try {
    const dates = await getAvailableDates();
    const archivePages: MetadataRoute.Sitemap = dates.slice(0, 90).map((date) => ({
      url: `${baseUrl}/archive?date=${date}`,
      lastModified: new Date(date + "T23:59:59Z"),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    return [...staticPages, ...archivePages];
  } catch {
    return staticPages;
  }
}
