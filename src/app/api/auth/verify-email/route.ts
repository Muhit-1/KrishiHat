import { NextRequest } from "next/server";
import { consumeEmailVerificationToken } from "@/backend/auth/tokens";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return Response.redirect(new URL("/login?verify_error=missing", appUrl));
    }

    const user = await consumeEmailVerificationToken(token).catch((err: Error) => {
      throw err;
    });

    await createAuditLog({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      entity: "User",
      entityId: user.id,
    });

    // Redirect to login with verified=1 so login page shows success message
    return Response.redirect(new URL("/login?verified=1", appUrl));
  } catch (err: any) {
    const errorMap: Record<string, string> = {
      TOKEN_INVALID: "invalid",
      TOKEN_USED: "used",
      TOKEN_EXPIRED: "expired",
    };
    const code = errorMap[err?.message] || "invalid";
    return Response.redirect(new URL(`/login?verify_error=${code}`, appUrl));
  }
}