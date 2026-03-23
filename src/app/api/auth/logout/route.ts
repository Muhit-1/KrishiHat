import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/backend/auth/session";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getClearCookieOptions } from "@/lib/auth/auth-cookie";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      await destroySession(refreshToken).catch(() => {});
    }

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, "", getClearCookieOptions());
    response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, "", getClearCookieOptions());

    return response;
  } catch (err) {
    console.error("[POST /api/auth/logout]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}