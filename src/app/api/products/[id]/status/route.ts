import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["draft", "active", "inactive", "rejected"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin", "moderator"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid status");

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return notFound();

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    await createAuditLog({
      userId: user.id,
      action: "PRODUCT_STATUS_CHANGED",
      entity: "Product",
      entityId: params.id,
      oldValue: { status: product.status },
      newValue: { status: parsed.data.status },
    });

    return ok(updated, `Product ${parsed.data.status}`);
  } catch (err) {
    return serverError();
  }
}