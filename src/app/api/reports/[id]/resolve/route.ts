import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["resolved", "dismissed"]),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["moderator", "admin", "super_admin"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid status");

    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return notFound();

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        resolvedBy: user.id,
        resolvedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: user.id,
      action: `REPORT_${parsed.data.status.toUpperCase()}`,
      entity: "Report",
      entityId: params.id,
    });

    return ok(updated, `Report ${parsed.data.status}`);
  } catch (err) {
    return serverError();
  }
}