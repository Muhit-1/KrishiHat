import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AUTH_CONSTANTS } from "./auth-constants";

const isSecure = process.env.COOKIE_SECURE === "true";

export function getAccessTokenCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_CONSTANTS.ACCESS_EXPIRES_MS / 1000,
  };
}

export function getRefreshTokenCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_CONSTANTS.REFRESH_EXPIRES_MS / 1000,
  };
}

export function getClearCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}