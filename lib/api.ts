import { campaigns, creators, posters } from "@/data";
import { backendEnabled, remote } from "@/lib/backend";
export interface UploadedImage {
  url: string;
  width: number;
  height: number;
  /** Size of the stored image. */
  bytes: number;
  /** What the user picked, before resizing. */
  original: { width: number; height: number; bytes: number; name: string };
}
/** Approximate decoded size of a base64 data URL. */
export const dataUrlBytes = (url: string) =>
  Math.round(((url.length - url.indexOf(",") - 1) * 3) / 4);
/**
 * Backend mode: load the live catalogue into the shared arrays.
 *
 * Components read `campaigns`, `creators` and `posters` synchronously, so we
 * refill those same arrays in place (rather than swapping the exports) and
 * then bump `catalogVersion` in the store to re-render.
 */
export async function loadCatalog() {
  if (!backendEnabled) return false;
  const live = await remote.catalog();
  campaigns.splice(0, campaigns.length, ...live.campaigns);
  creators.splice(0, creators.length, ...live.creators);
  posters.splice(0, posters.length, ...live.posters);
  return true;
}
export const api = {
  // Catalogue reads are served from the shared arrays (live in backend mode).
  getCampaigns: async () => campaigns,
  getCampaign: async (slug: string) => campaigns.find((c) => c.slug === slug),
  getCreators: async () => creators,
  getCreator: async (username: string) =>
    creators.find((c) => c.username === username),
  getPosters: async () => posters,
  getPoster: async (slug: string) => posters.find((p) => p.slug === slug),
  /**
   * Upload an image the user picked from their device and return a URL to store.
   * Always resized in the browser first. Demo: returns a data URL kept in
   * localStorage. Backend: uploads the resized JPEG and returns its hosted URL.
   */
  uploadImage: async (
    file: File,
    maxSize = 1200,
    purpose:
      | "campaign-cover"
      | "brand-logo"
      | "avatar"
      | "cover"
      | "portfolio" = "campaign-cover",
  ): Promise<UploadedImage> => {
    if (!file.type.startsWith("image/"))
      throw new Error("Please pick an image file (JPG, PNG or WebP).");
    if (file.size > 10 * 1024 * 1024)
      throw new Error("Please pick an image under 10 MB.");
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const original = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    if (backendEnabled) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.82),
      );
      if (!blob) throw new Error("Couldn't read that image. Try another one.");
      const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      const uploaded = await remote.upload(blob, name, purpose);
      return {
        url: uploaded.url,
        width: canvas.width,
        height: canvas.height,
        bytes: uploaded.bytes,
        original: { ...original, bytes: file.size, name: file.name },
      };
    }
    const url = canvas.toDataURL("image/jpeg", 0.82);
    return {
      url,
      width: canvas.width,
      height: canvas.height,
      bytes: dataUrlBytes(url),
      original: { ...original, bytes: file.size, name: file.name },
    };
  },
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

/**
 * The creator profile the signed-in user acts as (`store.me.creatorId`).
 * Falls back to the first creator so demo screens always have data.
 */
export const creatorFor = (id: string) =>
  creators.find((c) => c.id === id) ?? creators[0];

export function mergeCampaigns(local: import("@/types").Campaign[]) {
  const ids = new Set(local.map((c) => c.id));
  return [...local, ...campaigns.filter((c) => !ids.has(c.id))];
}
