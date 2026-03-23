import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createPasswordResetToken } from "@/backend/auth/tokens";
import { sendMail, passwordResetTemplate } from "@/backend/utils/mailer";
import { forgotPasswordSchema } from "@/lib/validations/auth.schema";
import { ok, badRequest, serverError } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid email");

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { profile: true },
    });

    // Always return ok to prevent email enumeration
    if (!user) return ok(null, "If the email exists, a reset link has been sent.");

    const token = await createPasswordResetToken(user.id);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendMail({
      to: email,
      subject: "KrishiHat — Reset Your Password",
      html: passwordResetTemplate(user.profile?.fullName || "User", resetUrl),
    });

    return ok(null, "If the email exists, a reset link has been sent.");
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return serverError();
  }
}