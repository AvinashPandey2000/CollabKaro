import { campaigns, creators, posters } from "@/data";
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
// Replace these functions with authenticated API fetches when the backend is ready.
export const api = {
  getCampaigns: async () => campaigns,
  getCampaign: async (slug: string) => campaigns.find((c) => c.slug === slug),
  getCreators: async () => creators,
  getCreator: async (username: string) =>
    creators.find((c) => c.username === username),
  getPosters: async () => posters,
  getPoster: async (slug: string) => posters.find((p) => p.slug === slug),
  /**
   * Upload an image the user picked from their device and return a URL to store.
   * Demo: resizes in the browser and returns a data URL kept in localStorage.
   * Backend: POST the file (multipart) to your upload endpoint / signed URL and
   * return the hosted URL instead. Callers don't need to change.
   */
  uploadImage: async (file: File, maxSize = 1200): Promise<UploadedImage> => {
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

export function mergeCampaigns(local: import("@/types").Campaign[]) {
  const ids = new Set(local.map((c) => c.id));
  return [...local, ...campaigns.filter((c) => !ids.has(c.id))];
}
