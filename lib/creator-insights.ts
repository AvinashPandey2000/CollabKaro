// Per-platform view of a creator's media kit, plus helpers for portfolio links.
import type {
  Campaign,
  Creator,
  Deal,
  PastCollab,
  PlatformStats,
} from "@/types";
import { contractStatus } from "./budget";
import { deliverableCount } from "./campaign-options";

export const platformLabels: Record<
  string,
  { followers: string; views: string; content: string }
> = {
  Instagram: {
    followers: "Followers",
    views: "Avg. views per post",
    content: "posts and reels",
  },
  YouTube: {
    followers: "Subscribers",
    views: "Avg. views per video",
    content: "videos and Shorts",
  },
  LinkedIn: {
    followers: "Followers",
    views: "Avg. impressions",
    content: "posts",
  },
};

/** One platform's numbers, falling back to the creator's headline data. */
export function insights(c: Creator, platform: string) {
  const p: PlatformStats | undefined = c.platforms.find(
    (x) => x.name === platform,
  );
  if (!p) return undefined;
  return {
    ...p,
    engagement: p.engagement ?? c.engagement,
    avgViews: p.avgViews ?? c.views,
    growth: p.growth ?? c.growth,
    audience: p.audience ?? c.audience,
    ages: p.ages ?? c.ages,
    gender: p.gender ?? c.gender,
    india: p.india ?? c.india,
  };
}

export function platformFromUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
    if (host.endsWith("instagram.com")) return "Instagram";
    if (host.endsWith("linkedin.com")) return "LinkedIn";
  } catch {}
  return undefined;
}

/** Embeddable player URL for YouTube and Instagram links, if we can build one. */
export function embedUrl(url?: string) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const id = /^[\w-]{6,}$/;
    if (host === "youtu.be") {
      const v = u.pathname.slice(1);
      return id.test(v)
        ? `https://www.youtube-nocookie.com/embed/${v}`
        : undefined;
    }
    if (host.endsWith("youtube.com")) {
      const v =
        u.searchParams.get("v") ??
        u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
      return v && id.test(v)
        ? `https://www.youtube-nocookie.com/embed/${v}`
        : undefined;
    }
    if (host.endsWith("instagram.com")) {
      const m = u.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/);
      return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : undefined;
    }
  } catch {}
  return undefined;
}

export const isVideoFormat = (format?: string) =>
  !!format && /reel|video|short|live|vlog/i.test(format);

/**
 * Collabs this creator finished on CollabKaro: contract signed by both sides
 * and every milestone recorded as paid. These are the only ones we mark as
 * confirmed; everything else is "shared by creator".
 */
export function completedCollabs(
  creatorId: string,
  deals: Deal[],
  campaigns: Campaign[],
): PastCollab[] {
  return deals
    .filter(
      (d) =>
        d.creatorId === creatorId &&
        contractStatus(d) === "signed" &&
        d.milestones.every((m) => m.status === "paid"),
    )
    .flatMap((d) => {
      const c = campaigns.find((x) => x.id === d.campaignId);
      if (!c) return [];
      return [
        {
          brand: c.brand,
          platform: (c.platforms ?? [c.platform]).join(", "),
          made: c.deliverables.map(deliverableCount).join(", "),
          year: d.updatedAt.slice(0, 4),
          result: `“${c.title}”`,
          viaCollabKaro: true,
        },
      ];
    });
}
