import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["moderator", "admin", "super_admin"].includes(user.role)) return forbidden();

    const [
      openReports,
      underReviewReports,
      resolvedReports,
      dismissedReports,
      totalUsers,
      suspendedUsers,
      recentReports,
    ] = await Promise.all([
      prisma.report.count({ where: { status: "open" } }),
      prisma.report.count({ where: { status: "under_review" } }),
      prisma.report.count({ where: { status: "resolved" } }),
      prisma.report.count({ where: { status: "dismissed" } }),
      prisma.user.count({ where: { deletedAt: null, role: { in: ["buyer", "seller"] } } }),
      prisma.user.count({ where: { status: "suspended", deletedAt: null } }),
      prisma.report.findMany({
        where: { status: { in: ["open", "under_review"] } },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { include: { profile: { select: { fullName: true } } } },
          reported: { include: { profile: { select: { fullName: true } } } },
        },
      }),
    ]);

    return ok({
      openReports,
      underReviewReports,
      resolvedReports,
      dismissedReports,
      totalUsers,
      suspendedUsers,
      recentReports,
    });
  } catch (err) {
    console.error("[GET /api/moderator/stats]", err);
    return serverError();
  }
}