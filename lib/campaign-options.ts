// Catalogues for the campaign builder. Kept in one place so a backend can serve
// the same lists later without touching the UI.
import type { Deliverable, UsageRight } from "@/types";
import { formatINR } from "./format";

export interface DeliverableFormat {
  id: string;
  label: string;
  plural: string;
  /** Length options, when length matters for this format. */
  durations?: string[];
}
export const OTHER_FORMAT = "other";
export const deliverableFormats: Record<string, DeliverableFormat[]> = {
  Instagram: [
    {
      id: "reel",
      label: "Reel",
      plural: "Reels",
      durations: ["Up to 30 sec", "30-60 sec", "60-90 sec"],
    },
    { id: "story", label: "Story", plural: "Stories" },
    { id: "post", label: "Feed post", plural: "Feed posts" },
    { id: "carousel", label: "Carousel", plural: "Carousels" },
    {
      id: "live",
      label: "Live session",
      plural: "Live sessions",
      durations: ["15 min", "30 min", "60 min"],
    },
  ],
  YouTube: [
    {
      id: "long",
      label: "Long video",
      plural: "Long videos",
      durations: ["3-5 min", "5-10 min", "10-20 min", "20+ min"],
    },
    {
      id: "integration",
      label: "Integrated mention",
      plural: "Integrated mentions",
      durations: ["30-60 sec", "60-90 sec", "90-120 sec"],
    },
    {
      id: "short",
      label: "Short",
      plural: "Shorts",
      durations: ["Up to 60 sec", "1-3 min"],
    },
    { id: "community", label: "Community post", plural: "Community posts" },
    {
      id: "live",
      label: "Live stream",
      plural: "Live streams",
      durations: ["30 min", "60 min", "90+ min"],
    },
  ],
  LinkedIn: [
    { id: "post", label: "Text / image post", plural: "Text / image posts" },
    {
      id: "carousel",
      label: "Document carousel",
      plural: "Document carousels",
    },
    {
      id: "video",
      label: "Video post",
      plural: "Video posts",
      durations: ["Up to 1 min", "1-3 min", "3-10 min"],
    },
    { id: "article", label: "Article", plural: "Articles" },
    {
      id: "newsletter",
      label: "Newsletter feature",
      plural: "Newsletter features",
    },
  ],
};
export const findFormat = (platform: string, format?: string) =>
  deliverableFormats[platform]?.find((f) => f.id === format);

/** Human label stored in `Deliverable.type`, e.g. "YouTube Long video (5-10 min)". */
export function deliverableType(d: {
  platform: string;
  format: string;
  duration?: string;
  custom?: string;
}) {
  const f = findFormat(d.platform, d.format);
  if (!f) {
    const custom = (d.custom || "").trim();
    return custom.toLowerCase().startsWith(d.platform.toLowerCase())
      ? custom
      : `${d.platform} ${custom}`;
  }
  return `${d.platform} ${f.label}${d.duration ? ` (${d.duration})` : ""}`;
}
/** Short count for summaries, e.g. "2 Long videos (5-10 min)". */
export function deliverableCount(d: Deliverable) {
  const f = d.platform ? findFormat(d.platform, d.format) : undefined;
  if (!f) return `${d.quantity} × ${d.type}`;
  return `${d.quantity} ${d.quantity === 1 ? f.label : f.plural}${d.duration ? ` (${d.duration})` : ""}`;
}
/** Best-effort match of older free-text deliverables to a catalogue format. */
export function parseDeliverable(d: Deliverable, fallbackPlatform: string) {
  const platform = d.platform || fallbackPlatform;
  if (d.format)
    return {
      platform,
      format: d.format,
      duration: d.duration || "",
      custom: d.format === OTHER_FORMAT ? d.type : "",
      quantity: d.quantity,
    };
  const type = d.type.toLowerCase();
  for (const f of deliverableFormats[platform] || []) {
    for (const name of [f.plural, f.label]) {
      const prefix = `${platform} ${name}`.toLowerCase();
      if (!type.startsWith(prefix)) continue;
      const duration =
        f.durations?.find((x) => type.includes(x.toLowerCase())) || "";
      return {
        platform,
        format: f.id,
        duration,
        custom: "",
        quantity: d.quantity,
      };
    }
  }
  return {
    platform,
    format: OTHER_FORMAT,
    duration: "",
    custom: d.type,
    quantity: d.quantity,
  };
}

export interface UsageOption {
  kind: UsageRight["kind"];
  label: string;
  help: string;
  /** Has a time limit (most paid usage does). */
  timed: boolean;
  /** Only offered when one of these platforms is picked. */
  platforms?: string[];
}
export const usageOptions: UsageOption[] = [
  {
    kind: "paid-ads",
    label: "Paid ads from your brand account",
    help: "You boost or run the creator’s content as ads from your own handle.",
    timed: true,
  },
  {
    kind: "whitelisting",
    label: "Whitelisting / partnership ads",
    help: "You run ads through the creator’s handle (e.g. Instagram partnership ads). The creator grants ad access.",
    timed: true,
    platforms: ["Instagram", "YouTube"],
  },
  {
    kind: "collab-post",
    label: "Collab post on your account",
    help: "Published as one joint post that appears on both profiles.",
    timed: false,
    platforms: ["Instagram", "LinkedIn"],
  },
  {
    kind: "brand-channels",
    label: "Website, app & marketplace listings",
    help: "Use on your website, app, emails, or Amazon / Flipkart product pages.",
    timed: true,
  },
  {
    kind: "offline",
    label: "Offline, print & TV",
    help: "In-store displays, hoardings, print or broadcast.",
    timed: true,
  },
  {
    kind: "raw-footage",
    label: "Raw footage",
    help: "Unedited files delivered for your own edits.",
    timed: false,
  },
  {
    kind: "exclusivity",
    label: "Category exclusivity",
    help: "The creator won’t promote competing brands in your category.",
    timed: true,
  },
];
export const usageDurations = [30, 60, 90, 180, 365];
export const durationLabel = (days: number) =>
  days === 365 ? "1 year" : `${days} days`;
export const payLabels: Record<UsageRight["pay"], string> = {
  fixed: "Fixed extra amount",
  quote: "Creator quotes",
  included: "Included in fee",
};
export function usageLine(u: UsageRight) {
  const o = usageOptions.find((x) => x.kind === u.kind);
  const name = o?.label || u.kind;
  const time = u.days ? ` for ${durationLabel(u.days)}` : "";
  const pay =
    u.pay === "fixed"
      ? `+${formatINR(u.amount || 0)} per creator`
      : u.pay === "quote"
        ? "creator quotes a fee"
        : "included in the creator fee";
  return `${name}${time} (${pay})`;
}
export const ORGANIC_USAGE =
  "The creator posts on their own profile, and the brand may reshare it on its handles with credit.";
/** Plain-text summary kept in `Campaign.usage` for places that show one line. */
export function usageSummary(rights: UsageRight[], notes = "") {
  const parts = [ORGANIC_USAGE];
  if (rights.length)
    parts.push(`Extra usage: ${rights.map(usageLine).join("; ")}.`);
  if (notes.trim()) parts.push(notes.trim());
  return parts.join(" ");
}
/** The free-text notes part of a structured campaign's usage summary. */
export function usageNotes(c: { usage: string; usageRights?: UsageRight[] }) {
  if (!c.usageRights) return "";
  return c.usage.replace(usageSummary(c.usageRights), "").trim();
}
/** Fixed add-on cost per creator, plus how many add-ons the creator will price. */
export function usageCost(rights: UsageRight[]) {
  return {
    fixed: rights
      .filter((u) => u.pay === "fixed")
      .reduce((sum, u) => sum + (u.amount || 0), 0),
    quotes: rights.filter((u) => u.pay === "quote").length,
  };
}
