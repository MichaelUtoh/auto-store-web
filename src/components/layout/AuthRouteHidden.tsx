"use client";

import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/** Hides children on login, register, and forgot-password pages. */
export function AuthRouteHidden({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAuthRoute(pathname)) return null;
  return <>{children}</>;
}
