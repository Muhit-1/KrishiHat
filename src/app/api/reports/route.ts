import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";
import { z } from "zod";

const reportSchema = z.object({
  reportedId: z.string().min(1),
  reason: z.string().min(5).max(200),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const isStaff = ["moderator", "admin", "super_admin"].includes(user.role);
    const { page, limit, skip } = getPaginationParams({
      page: Number(req.nextUrl.searchParams.get("page") || 1),
      limit: Number(req.nextUrl.searchParams.get("limit") || 50),
    });

    const statusParam = req.nextUrl.searchParams.get("status") || undefined;
    const searchParam = req.nextUrl.searchParams.get("q") || undefined;

    const where = isStaff
      ? {
          ...(statusParam && { status: statusParam as any }),
          ...(searchParam && {
            OR: [
              { reason: { contains: searchParam } },
              { description: { contains: searchParam } },
            ],
          }),
        }
      : { reporterId: user.id };

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          reporter: { include: { profile: { select: { fullName: true } } } },
          reported: { include: { profile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.report.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/reports]", err);
    return serverError();
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    if (parsed.data.reportedId === user.id) return badRequest("Cannot report yourself");

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedId: parsed.data.reportedId,
        reason: parsed.data.reason,
        description: parsed.data.description,
        status: "open",
      },
    });

    return created(report, "Report submitted");
  } catch (err) {
    return serverError();
  }
}