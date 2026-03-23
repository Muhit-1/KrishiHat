import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { productSchema } from "@/lib/validations/product.schema";
import { createAuditLog } from "@/lib/utils/audit";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        images: true,
        category: true,
        subcategory: true,
        seller: {
          include: {
            profile: true,
            sellerProfile: true,
          },
        },
        auction: true,
      },
    });

    if (!product) return notFound("Product not found");
    return ok(product);
  } catch (err) {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const product = await prisma.product.findUnique({ where: { id: params.id, deletedAt: null } });
    if (!product) return notFound("Product not found");

    // Only seller who owns it or admin can edit
    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isOwner = user.role === "seller" && product.sellerId === user.id;
    if (!isAdmin && !isOwner) return forbidden();

    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const oldValue = { status: product.status, price: product.price };

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await createAuditLog({
      userId: user.id,
      action: "PRODUCT_UPDATED",
      entity: "Product",
      entityId: params.id,
      oldValue,
      newValue: parsed.data as object,
    });

    return ok(updated, "Product updated");
  } catch (err) {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const product = await prisma.product.findUnique({ where: { id: params.id, deletedAt: null } });
    if (!product) return notFound("Product not found");

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isOwner = user.role === "seller" && product.sellerId === user.id;
    if (!isAdmin && !isOwner) return forbidden();

    // Soft delete
    await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: "inactive" },
    });

    await createAuditLog({
      userId: user.id,
      action: "PRODUCT_DELETED",
      entity: "Product",
      entityId: params.id,
    });

    return ok(null, "Product deleted");
  } catch (err) {
    return serverError();
  }
}