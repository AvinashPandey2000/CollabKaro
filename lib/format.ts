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
