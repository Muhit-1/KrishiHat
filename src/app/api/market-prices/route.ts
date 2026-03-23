import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { marketPriceSchema } from "@/lib/validations/market-price.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

// Public endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 50),
    });

    const [items, total] = await Promise.all([
      prisma.marketPrice.findMany({
        skip,
        take: limit,
        include: { category: { select: { name: true, nameBn: true } } },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.marketPrice.count(),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    return serverError();
  }
}

// Admin-only
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "super_admin"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = marketPriceSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);

    const record = await prisma.marketPrice.create({ data: parsed.data });
    return created(record, "Market price added");
  } catch (err) {
    return serverError();
  }
}