import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["moderator", "admin", "super_admin"].includes(user.role)) return forbidden();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 30),
    });

    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;

    const where: any = {
      deletedAt: null,
      // Moderators can only manage buyers and sellers, not other staff
      role: role ? role as any : { in: ["buyer", "seller"] },
      ...(status && { status: status as any }),
      ...(q && {
        OR: [
          { email: { contains: q } },
          { profile: { fullName: { contains: q } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { profile: { select: { fullName: true, phone: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/moderator/users]", err);
    return serverError();
  }
}