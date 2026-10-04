import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRouter } from "@/components/router";
import { campaigns, creators, posters } from "@/data";
const staticRoutes = [
  "",
  "creators",
  "brands",
  "agencies",
  "campaigns",
  "pricing",
  "about",
  "contact",
  "blog",
  "blog/a-better-creator-pitch",
  "terms",
  "privacy",
  "login",
  "signup",
  "role-select",
  "otp",
  "forgot-password",
  "onboarding",
  "c/dashboard",
  "c/applications",
  "c/saved",
  "c/work",
  "c/work/ca-6",
  "c/profile",
  "a/dashboard",
  "a/onboarding",
  "a/campaigns",
  "a/campaigns/new",
  "a/discover",
  "a/lists",
  "a/settings",
  "messages",
  "notifications",
  "settings",
  "admin",
  "tools/engagement",
  "tools/rate-estimator",
  "tools/brief-template",
];
export function generateStaticParams() {
  return [
    ...staticRoutes,
    ...campaigns.map((c) => `campaigns/${c.slug}`),
    ...campaigns.map((c) => `a/campaigns/${c.id}/applicants`),
    ...creators.map((c) => `creator/${c.username}`),
    ...posters.map((p) => `agency/${p.slug}`),
  ].map((p) => ({ path: p ? p.split("/") : [] }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path = [] } = await params;
  const c =
    path[0] === "campaigns" ? campaigns.find((c) => c.slug === path[1]) : null;
  const cr =
    path[0] === "creator" ? creators.find((c) => c.username === path[1]) : null;
  const p =
    path[0] === "agency" ? posters.find((p) => p.slug === path[1]) : null;
  return {
    title:
      c?.title ||
      cr?.name ||
      p?.name ||
      (path.length
        ? path
            .at(-1)!
            .replaceAll("-", " ")
            .replace(/\b\w/g, (m) => m.toUpperCase())
        : "Where India’s creators and brands collab."),
    description:
      c?.brief ||
      cr?.bio ||
      p?.about ||
      "Explore CollabKaro, India’s creator and brand collaboration marketplace.",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  const known = new Set([
    "creators",
    "brands",
    "agencies",
    "campaigns",
    "creator",
    "agency",
    "pricing",
    "about",
    "contact",
    "blog",
    "terms",
    "privacy",
    "login",
    "signup",
    "role-select",
    "otp",
    "forgot-password",
    "onboarding",
    "c",
    "a",
    "messages",
    "notifications",
    "settings",
    "admin",
    "tools",
  ]);
  if (path.length && !known.has(path[0])) notFound();
  const json =
    path.length === 0
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "CollabKaro",
          url: "https://collabkaro.example",
          description:
            "Frontend demonstration of an Indian creator marketplace.",
        }
      : null;
  return (
    <>
      {json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
      )}
      <PageRouter path={path} />
    </>
  );
}
