import { NextRequest } from "next/server";
import { destroySession } from "@/backend/auth/session";
import { ok, serverError } from "@/lib/utils/api-response";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getClearCookieOptions } from "@/lib/auth/auth-cookie";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      await destroySession(refreshToken);
    }

    cookieStore.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, "", getClearCookieOptions());
    cookieStore.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, "", getClearCookieOptions());

    return ok(null, "Logged out successfully");
  } catch (err) {
    console.error("[POST /api/auth/logout]", err);
    return serverError();
  }
}