import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword } from "@/backend/auth/password";
import { createSession } from "@/backend/auth/session";
import { loginSchema } from "@/lib/validations/auth.schema";
import { badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "@/lib/auth/auth-cookie";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) return unauthorized("Invalid email or password");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return unauthorized("Invalid email or password");

    // Block unverified users
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
          data: { maskedEmail: maskEmail(email) },
        },
        { status: 403 }
      );
    }

    if (user.status === "suspended") return unauthorized("Your account has been suspended. Contact support.");
    if (user.status === "banned") return unauthorized("Your account has been banned.");

    const { accessToken, refreshToken } = await createSession(user);

    const response = NextResponse.json(
      { success: true, data: { role: user.role }, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return serverError();
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  const masked = "*".repeat(Math.max(local.length - 2, 3));
  return `${visible}${masked}@${domain}`;
}