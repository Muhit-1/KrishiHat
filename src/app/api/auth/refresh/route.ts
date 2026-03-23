import { NextRequest, NextResponse } from "next/server";
import { rotateSession } from "@/backend/auth/session";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "@/lib/auth/auth-cookie";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, message: "No refresh token" }, { status: 401 });
    }

    const { accessToken, refreshToken: newRefreshToken } = await rotateSession(refreshToken);

    const response = NextResponse.json({ success: true, message: "Token refreshed" }, { status: 200 });

    response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, newRefreshToken, getRefreshTokenCookieOptions());

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid or expired session" }, { status: 401 });
  }
}