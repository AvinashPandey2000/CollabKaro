import { campaigns, creators, posters } from "@/data";
// Replace these functions with authenticated API fetches when the backend is ready.
export const api = {
  getCampaigns: async () => campaigns,
  getCampaign: async (slug: string) => campaigns.find((c) => c.slug === slug),
  getCreators: async () => creators,
  getCreator: async (username: string) =>
    creators.find((c) => c.username === username),
  getPosters: async () => posters,
  getPoster: async (slug: string) => posters.find((p) => p.slug === slug),
};

export {
  campaigns,
  creators,
  posters,
  niches,
  cities,
  languages,
  platforms,
  photo,
  covers,
} from "@/data";

export function mergeCampaigns(local: import("@/types").Campaign[]) {
  const ids = new Set(local.map((c) => c.id));
  return [...local, ...campaigns.filter((c) => !ids.has(c.id))];
}
