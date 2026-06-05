export function formatPrice(amount: number, currency = "USD"): string {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(safe);
}

function toValidDate(date: string | Date | null | undefined): Date | null {
  if (date == null || date === "") return null;
  const d = date instanceof Date ? date : new Date(date);
  return Number.isFinite(d.getTime()) ? d : null;
}

export function formatDate(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = toValidDate(date);
  if (!d) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatRelativeDate(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = toValidDate(date);
  if (!d) return fallback;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function formatDateTime(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = toValidDate(date);
  if (!d) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
