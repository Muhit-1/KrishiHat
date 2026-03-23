// src/lib/auth/auth-cookie.ts

import { AUTH_CONSTANTS } from "./auth-constants";

const isSecure = process.env.COOKIE_SECURE === "true";

// Use plain objects — compatible with Next.js cookies().set()
export function getAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_CONSTANTS.ACCESS_EXPIRES_MS / 1000,
  };
}

export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_CONSTANTS.REFRESH_EXPIRES_MS / 1000,
  };
}

export function getClearCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}