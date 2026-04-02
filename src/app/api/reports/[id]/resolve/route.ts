import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["moderator", "admin", "super_admin"].includes(user.role)) {
      return forbidden("Only moderators can resolve reports");
    }

    const body = await req.json();
    const status = body.status as string;

    if (!["resolved", "dismissed"].includes(status)) {
      return badRequest("Status must be 'resolved' or 'dismissed'");
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) return notFound("Report not found");

    if (report.status === "resolved" || report.status === "dismissed") {
      return badRequest("Report has already been closed");
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        status: status as any,
        resolvedAt: new Date(),
         resolvedBy: user.id,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: status === "resolved" ? "REPORT_RESOLVED" : "REPORT_DISMISSED",
      entity: "Report",
      entityId: params.id,
    });

    return ok(updated, `Report ${status} successfully`);
  } catch (err) {
    console.error("[POST /api/reports/[id]/resolve]", err);
    return serverError();
  }
}