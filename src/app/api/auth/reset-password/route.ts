import { NextRequest } from "next/server";
import { consumePasswordResetToken } from "@/backend/auth/tokens";
import { hashPassword } from "@/backend/auth/password";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth.schema";
import { ok, badRequest, serverError } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { token, password } = parsed.data;

    const user = await consumePasswordResetToken(token).catch((err) => {
      throw new Error(err.message);
    });

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens (security measure)
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: user.id,
    });

    return ok(null, "Password reset successfully. Please log in.");
  } catch (err: any) {
    if (["TOKEN_INVALID", "TOKEN_USED", "TOKEN_EXPIRED"].includes(err.message)) {
      return badRequest("This reset link is invalid or has expired.");
    }
    console.error("[POST /api/auth/reset-password]", err);
    return serverError();
  }
}