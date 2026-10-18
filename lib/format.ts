export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const formatCount = (n: number) =>
  n >= 1e7
    ? `${(n / 1e7).toFixed(1)}Cr`
    : n >= 1e5
      ? `${(n / 1e5).toFixed(1)}L`
      : n >= 1000
        ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
        : String(n);
export function timeAgo(date: string) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86400000),
  );
  return days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
}
export function maskContact(text: string, hired = false) {
  if (hired) return text;
  return text
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      (m) => `${m.slice(0, 2)}***@***`,
    )
    .replace(/(?:\+91[\s-]?)?[6-9](?:[\s-]?\d){9}\b/g, (m) => {
      const n = m.replace(/\D/g, "");
      return `${n.slice(-10, -8)}******${n.slice(-2)}`;
    });
}
export function campaignValue(c: {
  type: "Paid" | "Barter" | "Affiliate";
  min: number;
  max: number;
}) {
  if (c.type === "Barter")
    return { amount: `Worth ${formatINR(c.max)}`, label: "Product value" };
  if (c.type === "Affiliate")
    return {
      amount: `Up to ${formatINR(c.max)}`,
      label: "Estimated earnings (commission-based)",
    };
  return {
    amount: `${formatINR(c.min)} - ${formatINR(c.max)}`,
    label: "per creator",
  };
}
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
// A campaign can target several cities, stored as "Mumbai, Pune, Delhi".
export const cityList = (city: string) =>
  city
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
export const servesCity = (campaignCity: string, city: string) =>
  campaignCity === "All India" || cityList(campaignCity).includes(city);
// Short form for cards: "Mumbai, Pune +2".
export function cityLabel(city: string) {
  const list = cityList(city);
  return list.length > 2
    ? `${list.slice(0, 2).join(", ")} +${list.length - 2}`
    : list.join(", ");
}
