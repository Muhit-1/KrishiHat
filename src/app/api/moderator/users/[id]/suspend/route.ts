import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!["moderator", "admin", "super_admin"].includes(currentUser.role)) {
      return forbidden("Insufficient permissions");
    }

    const body = await req.json();
    const action = body.action as "suspend" | "unsuspend";

    if (action !== "suspend" && action !== "unsuspend") {
      return badRequest("Invalid action. Must be 'suspend' or 'unsuspend'");
    }

    // Find the target user
    const target = await prisma.user.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!target) return notFound("User not found");

    // Moderators can only act on buyers and sellers, not admins/moderators
    if (!["buyer", "seller"].includes(target.role)) {
      return forbidden("Moderators can only suspend buyers and sellers");
    }

    // Prevent suspending already-suspended or banning active
    if (action === "suspend" && target.status === "suspended") {
      return badRequest("User is already suspended");
    }
    if (action === "unsuspend" && target.status === "active") {
      return badRequest("User is not currently suspended");
    }
    if (target.status === "banned") {
      return forbidden("Cannot change status of a banned user");
    }

    const newStatus = action === "suspend" ? "suspended" : "active";

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: { profile: { select: { fullName: true } } },
    });

    await createAuditLog({
      userId: currentUser.id,
      action: action === "suspend" ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
      entity: "User",
      entityId: params.id,
      newValue: { status: newStatus, performedBy: currentUser.id },
    });

    return ok(
      { id: updated.id, status: updated.status },
      `User ${action === "suspend" ? "suspended" : "unsuspended"} successfully`
    );
  } catch (err) {
    console.error("[POST /api/moderator/users/[id]/suspend]", err);
    return serverError();
  }
}