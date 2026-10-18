export type Role = "Guest" | "Creator" | "Brand-Agency" | "Admin";
export type Status =
  "Applied" | "Viewed" | "Shortlisted" | "Hired" | "Rejected" | "Withdrawn";
/** Audience and performance for one platform. Optional fields fall back to the creator's headline numbers. */
export interface PlatformStats {
  name: string;
  handle: string;
  followers: number;
  engagement?: number;
  /** Avg. views per post/video (impressions on LinkedIn). */
  avgViews?: number;
  growth?: { day: string; followers: number }[];
  audience?: { city: string; value: number }[];
  ages?: { age: string; value: number }[];
  gender?: { name: string; value: number }[];
  /** % of audience in India. */
  india?: number;
}
export interface ContentItem {
  id: string;
  image: string;
  title: string;
  views: number;
  likes: number;
  /** Short label, e.g. "Reel". Kept for older data; prefer `format`. */
  type: string;
  date: string;
  platform?: string;
  /** e.g. "Reel", "Long video", "Short", "Carousel". */
  format?: string;
  /** e.g. "0:45" or "8:24". */
  duration?: string;
  /** Link to the live post; YouTube and Instagram links play in the preview. */
  url?: string;
}
export interface PastCollab {
  brand: string;
  /** One-line headline result, e.g. "2.4L views across 3 reels". */
  result: string;
  platform?: string;
  /** What the creator made, e.g. "3 Reels + 5 Stories". */
  made?: string;
  year?: string;
  /** Outcome numbers the creator reports. */
  results?: { label: string; value: string }[];
  /** A short note from the brand. */
  quote?: { text: string; name: string };
  link?: string;
  /** True only when the collab was completed through CollabKaro. */
  viaCollabKaro?: boolean;
}
export interface Creator {
  id: string;
  username: string;
  name: string;
  avatar: string;
  cover: string;
  city: string;
  languages: string[];
  niche: string;
  niches: string[];
  bio: string;
  verified: boolean;
  followers: number;
  engagement: number;
  views: number;
  price: number;
  platform: string;
  platforms: PlatformStats[];
  growth: { day: string; followers: number }[];
  content: ContentItem[];
  audience: { city: string; value: number }[];
  ages: { age: string; value: number }[];
  gender: { name: string; value: number }[];
  india: number;
  collaborations: PastCollab[];
  testimonials: { name: string; text: string; rating: number }[];
  rates: { type: string; price: number }[];
  collabTypes: string[];
  turnaround: number;
  revisions: number;
  equipment: string[];
  shootTypes: string[];
  restrictions: string[];
  achievements: string[];
  strength: number;
  response: number;
}
export interface Poster {
  id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  about: string;
  website: string;
  industries: string[];
  verified: boolean;
  posted: number;
  active: number;
  hired: number;
  response: number;
  onTime: number;
  rating: number;
  reviews: number;
  since: string;
  color: string;
}
export interface Deliverable {
  /** Human label, e.g. "YouTube Long video (5-10 min)". Always present. */
  type: string;
  quantity: number;
  platform?: string;
  /** Catalogue id from lib/campaign-options.ts, or "other". */
  format?: string;
  duration?: string;
}
export interface UsageRight {
  kind:
    | "paid-ads"
    | "whitelisting"
    | "collab-post"
    | "brand-channels"
    | "offline"
    | "raw-footage"
    | "exclusivity";
  /** Length of the licence in days; 0 when not time-bound. */
  days: number;
  /** Who covers it: a fixed extra per creator, a creator quote, or the base fee. */
  pay: "fixed" | "quote" | "included";
  amount?: number;
}
export interface BudgetTier {
  id: "nano" | "micro" | "mid" | "macro" | "mega";
  /** Fee range per creator in this follower tier, in ₹. */
  min: number;
  max: number;
}
export interface Milestone {
  id: string;
  label: string;
  percent: number;
  amount: number;
  status: "due" | "paid";
  /** ISO date the brand recorded the payment. */
  paidOn?: string;
  /** UTR / transaction reference the brand entered. */
  reference?: string;
}
export interface Signature {
  name: string;
  at: string;
}
/** The agreed terms with one hired creator. Records only; no money moves. */
export interface Deal {
  id: string;
  applicationId: string;
  campaignId: string;
  creatorId: string;
  posterId: string;
  /** Creator fee in ₹, excluding usage fees. */
  amount: number;
  /** Extra usage the brand pays for, agreed per creator. */
  usageFees: { kind: UsageRight["kind"]; amount: number }[];
  scheduleId: string;
  milestones: Milestone[];
  brandSignature?: Signature;
  creatorSignature?: Signature;
  createdAt: string;
  updatedAt: string;
}
export interface Campaign {
  id: string;
  slug: string;
  title: string;
  posterId: string;
  brand: string;
  /** Optional uploaded brand logo URL. Falls back to the poster monogram. */
  brandLogo?: string;
  image: string;
  niche: string;
  /** Primary platform (first of `platforms`), used by filters and older data. */
  platform: string;
  platforms?: string[];
  type: "Paid" | "Barter" | "Affiliate";
  /** Per-creator range shown on cards; derived from `tiers` for paid campaigns. */
  min: number;
  max: number;
  /** Total campaign budget in ₹ (paid campaigns). */
  totalBudget?: number;
  tiers?: BudgetTier[];
  city: string;
  language: string;
  followers: number;
  /** Minimum engagement rate in percent; 0 or missing means no minimum. */
  minEngagement?: number;
  brief: string;
  /** Brand guidelines creators must follow, e.g. "Use our red and white palette". */
  dos?: string[];
  donts?: string[];
  deliverables: Deliverable[];
  needed: number;
  applicants: number;
  deadline: string;
  posted: string;
  /** One-line usage summary. Structured terms live in `usageRights`. */
  usage: string;
  usageRights?: UsageRight[];
  featured: boolean;
  urgent: boolean;
  status: "Live" | "Draft" | "Paused" | "Closed";
}
export interface Application {
  id: string;
  campaignId: string;
  creatorId: string;
  pitch: string;
  quote: number;
  status: Status;
  date: string;
  showcase: string[];
}
export interface CallInvite {
  /** ISO start time. */
  at: string;
  minutes: number;
  mode: "video" | "phone";
  topic: string;
  /** Meeting link for video calls, if the organiser added one. */
  link?: string;
  status: "proposed" | "accepted" | "declined" | "cancelled";
}
export interface Message {
  id: string;
  body: string;
  sender: "creator" | "brand";
  time: string;
  attachment?: string;
  /** Recorded voice note (data URL in the demo; a hosted URL with a backend). */
  voice?: { url: string; seconds: number };
  call?: CallInvite;
}
export interface Conversation {
  id: string;
  creatorId: string;
  posterId: string;
  campaignId: string;
  messages: Message[];
}
export interface Notice {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  audience?: Role;
}
