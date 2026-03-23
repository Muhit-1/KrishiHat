import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword } from "@/backend/auth/password";
import { createSession } from "@/backend/auth/session";
import { loginSchema } from "@/lib/validations/auth.schema";
import { ok, badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "@/lib/auth/auth-cookie";
import { cookies } from "next/headers";

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

    if (!user) return unauthorized("Invalid credentials");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return unauthorized("Invalid credentials");

    if (user.status === "suspended") return unauthorized("Account suspended");
    if (user.status === "banned") return unauthorized("Account banned");

    const { accessToken, refreshToken } = await createSession(user);

    const cookieStore = cookies();
    cookieStore.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    cookieStore.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    return ok({ role: user.role }, "Login successful");
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return serverError();
  }
}