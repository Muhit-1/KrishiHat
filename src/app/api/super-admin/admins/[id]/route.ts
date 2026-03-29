import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  role: z.enum(["admin", "moderator"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const target = await prisma.user.findUnique({
      where: { id: params.id, deletedAt: null },
    });
    if (!target) return notFound("User not found");
    if (target.role === "super_admin") return forbidden("Cannot modify super admin");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid data");

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: { select: { fullName: true } },
      },
    });

    // Revoke sessions if suspended
    if (parsed.data.status === "suspended") {
      await prisma.refreshToken.deleteMany({ where: { userId: params.id } });
    }

    await createAuditLog({
      userId: user.id,
      action: "ADMIN_ACCOUNT_UPDATED",
      entity: "User",
      entityId: params.id,
      newValue: parsed.data as object,
    });

    return ok(updated, "Account updated");
  } catch (err) {
    console.error("[PATCH /api/super-admin/admins/[id]]", err);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return notFound();
    if (target.role === "super_admin") return forbidden("Cannot delete super admin");

    // Soft delete
    await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: params.id } });

    await createAuditLog({
      userId: user.id,
      action: "ADMIN_ACCOUNT_DELETED",
      entity: "User",
      entityId: params.id,
    });

    return ok(null, "Account deleted");
  } catch (err) {
    return serverError();
  }
}