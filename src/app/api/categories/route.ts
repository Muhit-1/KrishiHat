import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { categorySchema } from "@/lib/validations/category.schema";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: { subcategories: { where: { deletedAt: null } } },
      orderBy: { sortOrder: "asc" },
    });
    return ok(categories);
  } catch (err) {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "super_admin"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);

    const category = await prisma.category.create({ data: parsed.data });
    return created(category);
  } catch (err) {
    return serverError();
  }
}