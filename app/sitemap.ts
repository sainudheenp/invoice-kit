import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { LOCATIONS, ROUTES } from "@/lib/content";

const STATIC_PATHS = [
  "/",
  "/wayanad-taxi/",
  "/wayanad-cab/",
  "/airport-transfers/",
  "/wayanad-sightseeing/",
  "/tempo-traveller/",
  "/bus-rental/",
  "/resort-transfers/",
  "/locations/",
  "/routes/",
  "/contact/",
  "/privacy-policy/",
  "/terms-and-conditions/",
  "/cancellation-policy/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  for (const location of LOCATIONS) {
    entries.push({
      url: `${SITE.siteUrl}/locations/${location.slug}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const route of ROUTES) {
    entries.push({
      url: `${SITE.siteUrl}/routes/${route.slug}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
