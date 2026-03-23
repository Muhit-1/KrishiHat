import { NextRequest } from "next/server";
import { rotateSession } from "@/backend/auth/session";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "@/lib/auth/auth-cookie";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) return unauthorized("No refresh token");

    const { accessToken, refreshToken: newRefreshToken } = await rotateSession(refreshToken);

    cookieStore.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    cookieStore.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, newRefreshToken, getRefreshTokenCookieOptions());

    return ok(null, "Token refreshed");
  } catch (err) {
    return unauthorized("Invalid or expired session");
  }
}