import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["suspend", "unsuspend", "ban"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actingUser = await getCurrentUser();
    if (!actingUser) return unauthorized();
    if (!["admin", "super_admin"].includes(actingUser.role)) return forbidden();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid action");

    const target = await prisma.user.findUnique({ where: { id: params.id, deletedAt: null } });
    if (!target) return notFound("User not found");

    // Super admin protection
    if (target.role === "super_admin") return forbidden("Cannot modify super admin");
    // Admin cannot suspend another admin (only super_admin can)
    if (target.role === "admin" && actingUser.role !== "super_admin") return forbidden("Only super admin can suspend admins");

    const newStatus = parsed.data.action === "suspend"
      ? "suspended"
      : parsed.data.action === "ban"
      ? "banned"
      : "active";

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status: newStatus },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: params.id } });

    await createAuditLog({
      userId: actingUser.id,
      action: `USER_${parsed.data.action.toUpperCase()}`,
      entity: "User",
      entityId: params.id,
      oldValue: { status: target.status },
      newValue: { status: newStatus, reason: parsed.data.reason },
    });

    return ok({ status: updated.status }, `User ${parsed.data.action}ed successfully`);
  } catch (err) {
    console.error("[POST /api/admin/users/[id]/suspend]", err);
    return serverError();
  }
}