import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * JWT lives in localStorage (Zustand persist) after login — middleware cannot read it.
 * `/account/*` and `/checkout` enforce auth client-side (see account/layout, checkout/page).
 *
 * Optional: if your backend sets an httpOnly `auth-token` cookie, you can add cookie-based
 * protection here again for those routes.
 */
const authPaths = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const hasAuth = !!token;

  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage && hasAuth && pathname !== "/forgot-password") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password"],
};
