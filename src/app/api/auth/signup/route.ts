import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/backend/auth/password";
import { createSession } from "@/backend/auth/session";
import { signupSchema } from "@/lib/validations/auth.schema";
import { badRequest, serverError } from "@/lib/utils/api-response";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "@/lib/auth/auth-cookie";
import { createEmailVerificationToken } from "@/backend/auth/tokens";
import { sendMail, emailVerificationTemplate } from "@/backend/utils/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { email, password, fullName, phone, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return badRequest("Email already registered");

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profile: { create: { fullName, phone } },
        ...(role === "seller" && {
          sellerProfile: { create: { shopName: `${fullName}'s Shop` } },
        }),
      },
    });

    // Send verification email (non-blocking)
    createEmailVerificationToken(user.id)
      .then((token) => {
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
        return sendMail({
          to: email,
          subject: "KrishiHat — Verify Your Email",
          html: emailVerificationTemplate(fullName, verifyUrl),
        });
      })
      .catch((err) => console.error("[Signup email error]", err));

    const { accessToken, refreshToken } = await createSession(user);

    // Set cookies on the response object directly
    const response = NextResponse.json(
      { success: true, data: { role: user.role }, message: "Account created successfully" },
      { status: 201 }
    );

    response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    return response;
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return serverError();
  }
}