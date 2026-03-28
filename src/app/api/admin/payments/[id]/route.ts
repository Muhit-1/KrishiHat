import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["paid", "refunded", "failed"]),
  transactionId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid data");

    const payment = await prisma.payment.findUnique({ where: { id: params.id } });
    if (!payment) return notFound("Payment not found");

    const oldStatus = payment.status;

    const updated = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        transactionId: parsed.data.transactionId || payment.transactionId,
        paidAt: parsed.data.status === "paid" ? new Date() : payment.paidAt,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "PAYMENT_STATUS_UPDATED",
      entity: "Payment",
      entityId: params.id,
      oldValue: { status: oldStatus },
      newValue: { status: parsed.data.status },
    });

    return ok(updated, "Payment updated");
  } catch (err) {
    console.error("[PATCH /api/admin/payments/[id]]", err);
    return serverError();
  }
}