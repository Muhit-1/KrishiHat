import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin", "moderator"].includes(user.role)) return forbidden();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });

    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("q") || undefined;

    const where = {
      deletedAt: null,
      ...(role && { role: role as any }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { email: { contains: search } },
          { profile: { fullName: { contains: search } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
          sellerProfile: { select: { shopName: true, isVerified: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Remove password hashes
    const sanitized = items.map(({ passwordHash: _, ...u }) => u);
    return ok(buildPaginatedResponse(sanitized, total, page, limit));
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return serverError();
  }
}