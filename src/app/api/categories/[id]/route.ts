import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { categorySchema } from "@/lib/validations/category.schema";
import { createAuditLog } from "@/lib/utils/audit";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id, deletedAt: null },
      include: { subcategories: { where: { deletedAt: null } } },
    });
    if (!category) return notFound("Category not found");
    return ok(category);
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
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) return notFound();

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await createAuditLog({
      userId: user.id,
      action: "CATEGORY_UPDATED",
      entity: "Category",
      entityId: params.id,
      newValue: parsed.data as object,
    });

    return ok(updated, "Category updated");
  } catch (err) {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) return notFound();

    // Soft delete
    await prisma.category.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      userId: user.id,
      action: "CATEGORY_DELETED",
      entity: "Category",
      entityId: params.id,
    });

    return ok(null, "Category deleted");
  } catch (err) {
    return serverError();
  }
}