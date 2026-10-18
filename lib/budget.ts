// Budget, rate and payment helpers shared by the campaign builder, the
// applicant pipeline, the payments page and the creator workspace.
// Nothing here moves money: it only records what brands and creators agree.
import type { BudgetTier, Campaign, Creator, Deal, Milestone } from "@/types";

export interface TierInfo {
  id: BudgetTier["id"];
  label: string;
  /** Follower band, lower bound inclusive. */
  from: number;
  to: number;
  /** Starting suggestion only. Brands should set their own ranges. */
  min: number;
  max: number;
}
export const tierCatalog: TierInfo[] = [
  {
    id: "nano",
    label: "Nano",
    from: 1_000,
    to: 10_000,
    min: 3_000,
    max: 8_000,
  },
  {
    id: "micro",
    label: "Micro",
    from: 10_000,
    to: 1_00_000,
    min: 8_000,
    max: 25_000,
  },
  {
    id: "mid",
    label: "Mid-tier",
    from: 1_00_000,
    to: 5_00_000,
    min: 25_000,
    max: 75_000,
  },
  {
    id: "macro",
    label: "Macro",
    from: 5_00_000,
    to: 10_00_000,
    min: 75_000,
    max: 2_00_000,
  },
  {
    id: "mega",
    label: "Mega",
    from: 10_00_000,
    to: Infinity,
    min: 2_00_000,
    max: 5_00_000,
  },
];
export const tierInfo = (id: BudgetTier["id"]) =>
  tierCatalog.find((t) => t.id === id)!;
export const tierFor = (followers: number) =>
  tierCatalog.find((t) => followers >= t.from && followers < t.to) ??
  tierCatalog[0];

const roundTo = (n: number, step = 500) => Math.round(n / step) * step;
/**
 * Suggested fee for a creator on this campaign: their follower tier's range,
 * placed higher for stronger engagement (1.5% → bottom, 6%+ → top).
 */
export function suggestRate(c: Campaign, creator: Creator) {
  const tier = tierFor(creator.followers);
  const set = c.tiers?.find((t) => t.id === tier.id);
  // Campaigns without tiers (older ones) use the catalogue range.
  const range = set ?? tier;
  const t = Math.min(1, Math.max(0, (creator.engagement - 1.5) / 4.5));
  return {
    tier,
    /** The creator's size isn't one of the tiers this campaign picked. */
    outsideTiers: !!c.tiers?.length && !set,
    min: range.min,
    max: range.max,
    suggested: roundTo(range.min + (range.max - range.min) * t),
  };
}

/** What the brand owes this creator in total: fee plus agreed usage fees. */
export const dealTotal = (d: Deal) =>
  d.amount + d.usageFees.reduce((s, u) => s + u.amount, 0);
export const dealPaid = (d: Deal) =>
  d.milestones
    .filter((m) => m.status === "paid")
    .reduce((s, m) => s + m.amount, 0);
export const nextDue = (d: Deal) =>
  d.milestones.find((m) => m.status === "due");
export type ContractStatus = "unsigned" | "brand" | "creator" | "signed";
export const contractStatus = (d: Deal): ContractStatus =>
  d.brandSignature && d.creatorSignature
    ? "signed"
    : d.brandSignature
      ? "brand"
      : d.creatorSignature
        ? "creator"
        : "unsigned";
export const contractLabel: Record<ContractStatus, string> = {
  unsigned: "Contract not signed",
  brand: "Waiting for creator",
  creator: "Waiting for brand",
  signed: "Contract signed",
};

/** Budget position of one campaign given its deals. */
export function campaignBudget(c: Campaign, deals: Deal[]) {
  const mine = deals.filter((d) => d.campaignId === c.id);
  const committed = mine.reduce((s, d) => s + dealTotal(d), 0);
  const paid = mine.reduce((s, d) => s + dealPaid(d), 0);
  const total = c.totalBudget ?? 0;
  const left = total - committed;
  const slots = Math.max(0, c.needed - mine.length);
  const lowest = c.tiers?.length
    ? Math.min(...c.tiers.map((t) => t.min))
    : undefined;
  return {
    deals: mine,
    total,
    committed,
    paid,
    due: committed - paid,
    left,
    slots,
    perSlot: slots ? Math.floor(Math.max(0, left) / slots) : 0,
    lowest,
    overBudget: total > 0 && left < 0,
    tight:
      total > 0 && slots > 0 && lowest !== undefined && left / slots < lowest,
  };
}

export interface ScheduleTemplate {
  id: string;
  label: string;
  steps: { label: string; percent: number }[];
}
export const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: "30-70",
    label: "30% advance, 70% on approval",
    steps: [
      { label: "Advance on signing", percent: 30 },
      { label: "On content approval", percent: 70 },
    ],
  },
  {
    id: "50-50",
    label: "50% advance, 50% after go-live",
    steps: [
      { label: "Advance on signing", percent: 50 },
      { label: "After content goes live", percent: 50 },
    ],
  },
  {
    id: "30-40-30",
    label: "30% / 40% / 30%",
    steps: [
      { label: "Advance on signing", percent: 30 },
      { label: "On content approval", percent: 40 },
      { label: "After content goes live", percent: 30 },
    ],
  },
  {
    id: "100",
    label: "100% after go-live",
    steps: [{ label: "After content goes live", percent: 100 }],
  },
];
/** Split a total across percentages; the last step absorbs rounding. */
export function splitMilestones(
  total: number,
  steps: { label: string; percent: number }[],
  existing: Milestone[] = [],
): Milestone[] {
  let assigned = 0;
  return steps.map((s, i) => {
    const amount =
      i === steps.length - 1
        ? total - assigned
        : Math.round((total * s.percent) / 100);
    assigned += amount;
    const old = existing[i];
    return {
      id: old?.id ?? crypto.randomUUID(),
      label: s.label,
      percent: s.percent,
      amount,
      status: "due",
    };
  });
}
