import type { MetadataRoute } from "next";
import { campaigns, creators, posters } from "@/data";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/creators",
    "/brands",
    "/campaigns",
    "/pricing",
    "/about",
    "/contact",
    "/blog",
    "/tools/engagement",
    "/tools/rate-estimator",
    "/tools/brief-template",
    ...campaigns.map((c) => `/campaigns/${c.slug}`),
    ...creators.map((c) => `/creator/${c.username}`),
    ...posters.map((p) => `/agency/${p.slug}`),
  ].map((path) => ({
    url: `https://collabkaro.example${path}`,
    changeFrequency: "weekly",
    priority: path ? 0.7 : 1,
  }));
}
