import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/backend/auth/jwt";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";

// Route → minimum required role
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  "/buyer":      ["buyer", "admin", "super_admin"],
  "/seller":     ["seller", "admin", "super_admin"],
  "/moderator":  ["moderator", "admin", "super_admin"],
  "/admin":      ["admin", "super_admin"],
  "/super-admin":["super_admin"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find matching protected prefix
  const matchedPrefix = Object.keys(ROUTE_ROLE_MAP).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchedPrefix) return NextResponse.next();

  const token = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = verifyAccessToken(token);

    // Check suspension
    if (payload.status === "suspended" || payload.status === "banned") {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }

    // Check role
    const allowedRoles = ROUTE_ROLE_MAP[matchedPrefix];
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token expired or invalid
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/buyer/:path*",
    "/seller/:path*",
    "/moderator/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
  ],
};