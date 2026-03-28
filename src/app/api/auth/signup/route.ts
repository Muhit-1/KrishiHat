import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/backend/auth/password";
import { signupSchema } from "@/lib/validations/auth.schema";
import { badRequest, serverError } from "@/lib/utils/api-response";
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
        // emailVerified stays false until they click the link
        profile: { create: { fullName, phone } },
        ...(role === "seller" && {
          sellerProfile: { create: { shopName: `${fullName}'s Shop` } },
        }),
      },
    });

    // Send verification email — await so we catch errors
    try {
      const token = await createEmailVerificationToken(user.id);
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
      await sendMail({
        to: email,
        subject: "KrishiHat — Verify Your Email",
        html: emailVerificationTemplate(fullName, verifyUrl),
      });
    } catch (emailErr) {
      console.error("[Signup] Email send failed:", emailErr);
      // Still create the account, but warn
    }

    // NO cookies set — user must verify email before login
    return NextResponse.json(
      {
        success: true,
        data: {
          email,
          // Mask email for display: se***@gmail.com
          maskedEmail: maskEmail(email),
        },
        message: "Account created. Please check your email to verify your account before logging in.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
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