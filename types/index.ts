export type Role = "Guest" | "Creator" | "Brand-Agency" | "Admin";
export type Status =
  "Applied" | "Viewed" | "Shortlisted" | "Hired" | "Rejected" | "Withdrawn";
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
  platforms: { name: string; handle: string; followers: number }[];
  growth: { day: string; followers: number }[];
  content: {
    id: string;
    image: string;
    title: string;
    views: number;
    likes: number;
    type: string;
    date: string;
  }[];
  audience: { city: string; value: number }[];
  ages: { age: string; value: number }[];
  gender: { name: string; value: number }[];
  india: number;
  collaborations: { brand: string; result: string }[];
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
export interface Campaign {
  id: string;
  slug: string;
  title: string;
  posterId: string;
  brand: string;
  image: string;
  niche: string;
  platform: string;
  type: "Paid" | "Barter" | "Affiliate";
  min: number;
  max: number;
  city: string;
  language: string;
  followers: number;
  brief: string;
  deliverables: { type: string; quantity: number }[];
  needed: number;
  applicants: number;
  deadline: string;
  posted: string;
  usage: string;
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
export interface Message {
  id: string;
  body: string;
  sender: "creator" | "brand";
  time: string;
  attachment?: string;
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
}
