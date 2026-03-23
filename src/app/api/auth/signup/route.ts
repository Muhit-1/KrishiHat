import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/backend/auth/password";
import { createSession } from "@/backend/auth/session";
import { signupSchema } from "@/lib/validations/auth.schema";
import { created, badRequest, serverError } from "@/lib/utils/api-response";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "@/lib/auth/auth-cookie";

import { cookies } from "next/headers";
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
        profile: {
          create: { fullName, phone },
        },
        ...(role === "seller" && {
          sellerProfile: {
            create: { shopName: `${fullName}'s Shop` },
          },
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

    const cookieStore = cookies();
    cookieStore.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    cookieStore.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    return created({ role: user.role }, "Account created. Please check your email to verify.");
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return serverError();
  }
}