import { NextRequest } from "next/server";
import { placeOrder } from "@/backend/services/order.service";
import { checkoutSchema } from "@/lib/validations/cart.schema";
import { created, badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/db/prisma";
import { sendMail, orderConfirmationTemplate } from "@/backend/utils/mailer";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "buyer") return unauthorized("Only buyers can checkout");

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const orders = await placeOrder(user.id, parsed.data).catch((err) => {
      throw err;
    });

    // Send order confirmation email (non-blocking)
    prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } })
      .then((u) => {
        if (!u?.profile) return;
        const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        return sendMail({
          to: u.email,
          subject: "KrishiHat — Order Confirmed",
          html: orderConfirmationTemplate(u.profile.fullName, orders[0].id, totalAmount),
        });
      })
      .catch((err) => console.error("[Order email error]", err));

    for (const order of orders) {
      await createAuditLog({
        userId: user.id,
        action: "ORDER_PLACED",
        entity: "Order",
        entityId: order.id,
        newValue: { totalAmount: order.totalAmount, sellerId: order.sellerId },
      });
    }

    return created(orders, "Order placed successfully");
  } catch (err: any) {
    if (err.message === "CART_EMPTY") return badRequest("Your cart is empty");
    console.error("[POST /api/orders/checkout]", err);
    return serverError();
  }
}