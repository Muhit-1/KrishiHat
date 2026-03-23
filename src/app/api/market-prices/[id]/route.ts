import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { marketPriceSchema , marketPriceBaseSchema } from "@/lib/validations/market-price.schema";
import { createAuditLog } from "@/lib/utils/audit";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const record = await prisma.marketPrice.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!record) return notFound();
    return ok(record);
  } catch (err) {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = marketPriceBaseSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const record = await prisma.marketPrice.findUnique({ where: { id: params.id } });
    if (!record) return notFound();

    const updated = await prisma.marketPrice.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await createAuditLog({
      userId: user.id,
      action: "MARKET_PRICE_UPDATED",
      entity: "MarketPrice",
      entityId: params.id,
      oldValue: { minPrice: record.minPrice, maxPrice: record.maxPrice },
      newValue: parsed.data as object,
    });

    return ok(updated, "Market price updated");
  } catch (err) {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const record = await prisma.marketPrice.findUnique({ where: { id: params.id } });
    if (!record) return notFound();

    await prisma.marketPrice.delete({ where: { id: params.id } });

    await createAuditLog({
      userId: user.id,
      action: "MARKET_PRICE_DELETED",
      entity: "MarketPrice",
      entityId: params.id,
    });

    return ok(null, "Market price deleted");
  } catch (err) {
    return serverError();
  }
}