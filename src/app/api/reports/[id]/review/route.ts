import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["moderator", "admin", "super_admin"].includes(user.role)) return forbidden();

    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return notFound("Report not found");

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { status: "under_review" },
    });

    return ok(updated, "Report marked as under review");
  } catch (err) {
    return serverError();
  }
}