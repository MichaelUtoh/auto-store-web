import { API_BASE_URL } from "@/lib/constants";

/** Server-side GET for public endpoints (SSR, sitemap). */
export async function serverGet<T = unknown>(
  path: string,
  options?: { revalidate?: number; tags?: string[] }
): Promise<T | null> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: options?.revalidate ?? 60,
        tags: options?.tags,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
