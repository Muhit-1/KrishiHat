import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const schema = z.object({
  status: z.enum([
    "not_shipped",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "returned",
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDate: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin"].includes(user.role)) return forbidden();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: params.id } });
    if (!shipment) return notFound("Shipment not found");

    const oldStatus = shipment.status;

    const updated = await prisma.shipment.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        trackingNumber: parsed.data.trackingNumber ?? shipment.trackingNumber,
        carrier: parsed.data.carrier ?? shipment.carrier,
        estimatedDate: parsed.data.estimatedDate
          ? new Date(parsed.data.estimatedDate)
          : shipment.estimatedDate,
        deliveredAt:
          parsed.data.status === "delivered" ? new Date() : shipment.deliveredAt,
      },
      include: {
        order: true,
      },
    });

    // Sync order status when shipment is delivered
    if (parsed.data.status === "delivered") {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: "delivered" },
      });
      await prisma.payment.updateMany({
        where: { orderId: shipment.orderId, method: "cod", status: "pending" },
        data: { status: "paid", paidAt: new Date() },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "SHIPMENT_UPDATED",
      entity: "Shipment",
      entityId: params.id,
      oldValue: { status: oldStatus },
      newValue: { status: parsed.data.status },
    });

    return ok(updated, "Shipment updated");
  } catch (err) {
    console.error("[PATCH /api/admin/shipments/[id]]", err);
    return serverError();
  }
}