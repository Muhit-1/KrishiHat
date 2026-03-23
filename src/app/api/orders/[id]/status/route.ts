import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const order = await prisma.order.findUnique({
      where: { id: params.id, deletedAt: null },
      include: { shipment: true },
    });
    if (!order) return notFound("Order not found");

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isSeller = user.role === "seller" && order.sellerId === user.id;
    if (!isAdmin && !isSeller) return forbidden();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid status");

    const { status, trackingNumber, carrier } = parsed.data;

    const oldStatus = order.status;

    // Update order status
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    // Update or create shipment when shipping
    if (status === "shipped") {
      await prisma.shipment.upsert({
        where: { orderId: params.id },
        update: {
          status: "in_transit",
          trackingNumber: trackingNumber || null,
          carrier: carrier || null,
        },
        create: {
          orderId: params.id,
          status: "in_transit",
          trackingNumber: trackingNumber || null,
          carrier: carrier || null,
        },
      });
    }

    if (status === "delivered") {
      await prisma.shipment.upsert({
        where: { orderId: params.id },
        update: { status: "delivered", deliveredAt: new Date() },
        create: { orderId: params.id, status: "delivered", deliveredAt: new Date() },
      });

      // Mark payment as paid for COD
      await prisma.payment.updateMany({
        where: { orderId: params.id, method: "cod", status: "pending" },
        data: { status: "paid", paidAt: new Date() },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "ORDER_STATUS_CHANGED",
      entity: "Order",
      entityId: params.id,
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    return ok(updated, `Order status updated to ${status}`);
  } catch (err) {
    console.error("[PATCH /api/orders/[id]/status]", err);
    return serverError();
  }
}