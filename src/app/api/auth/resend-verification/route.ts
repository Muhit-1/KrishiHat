import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/db/prisma";
import { createEmailVerificationToken } from "@/backend/auth/tokens";
import { sendMail, emailVerificationTemplate } from "@/backend/utils/mailer";
import { ok, unauthorized, badRequest, serverError } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { profile: true },
    });

    if (!user) return unauthorized();
    if (user.emailVerified) return badRequest("Email already verified");

    const token = await createEmailVerificationToken(user.id);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "KrishiHat — Verify Your Email",
      html: emailVerificationTemplate(user.profile?.fullName || "User", verifyUrl),
    });

    return ok(null, "Verification email sent.");
  } catch (err) {
    console.error("[POST /api/auth/resend-verification]", err);
    return serverError();
  }
}
