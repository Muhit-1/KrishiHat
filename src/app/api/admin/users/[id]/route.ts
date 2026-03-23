import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin", "moderator"].includes(user.role)) return forbidden();

    const target = await prisma.user.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        profile: true,
        sellerProfile: true,
        orders: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });

    if (!target) return notFound("User not found");

    const { passwordHash: _, ...sanitized } = target;
    return ok(sanitized);
  } catch (err) {
    return serverError();
  }
}