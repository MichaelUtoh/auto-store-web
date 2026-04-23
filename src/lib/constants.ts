export const ITEMS_PER_PAGE =
  parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE ?? "20", 10);

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
] as const;
