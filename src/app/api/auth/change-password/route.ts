import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword, hashPassword } from "@/backend/auth/password";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/utils/audit";
import { getClearCookieOptions } from "@/lib/auth/auth-cookie";   // ADD THIS
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";       // ADD THIS
import { z } from "zod";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return unauthorized();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) return unauthorized();

    const valid = await comparePassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return badRequest("Current password is incorrect");

    const isSame = await comparePassword(parsed.data.newPassword, user.passwordHash);
    if (isSame) return badRequest("New password must be different from current password");

    const newHash = await hashPassword(parsed.data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Revoke all sessions in DB
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: user.id,
    });

    // ✅ NOW ALSO CLEAR THE COOKIES
    const response = NextResponse.json(
      { success: true, message: "Password changed. Please log in again." },
      { status: 200 }
    );
    response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, "", getClearCookieOptions());
    response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, "", getClearCookieOptions());

    return response;
  } catch (err) {
    console.error("[POST /api/auth/change-password]", err);
    return serverError();
  }
}