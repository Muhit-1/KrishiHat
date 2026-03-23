import { NextRequest } from "next/server";
import { consumeEmailVerificationToken } from "@/backend/auth/tokens";
import { ok, badRequest, serverError } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return badRequest("Missing token");

    const user = await consumeEmailVerificationToken(token).catch((err) => {
      throw new Error(err.message);
    });

    await createAuditLog({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      entity: "User",
      entityId: user.id,
    });

    // Redirect to login with success message
    return Response.redirect(
      new URL("/login?verified=1", process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (err: any) {
    if (["TOKEN_INVALID", "TOKEN_USED", "TOKEN_EXPIRED"].includes(err.message)) {
      return Response.redirect(
        new URL("/login?verify_error=1", process.env.NEXT_PUBLIC_APP_URL)
      );
    }
    console.error("[GET /api/auth/verify-email]", err);
    return serverError();
  }
}