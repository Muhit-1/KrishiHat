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
      return badRequest(
        "Validation failed",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const orders = await placeOrder(user.id, parsed.data).catch((err: Error) => {
      throw err;
    });

    // Send confirmation email (non-blocking)
    prisma.user
      .findUnique({ where: { id: user.id }, include: { profile: true } })
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
        newValue: {
          totalAmount: Number(order.totalAmount),
          sellerId: order.sellerId,
          paymentMethod: parsed.data.paymentMethod,
        },
      });
    }

    return created(
      {
        orders,
        paymentMethod: parsed.data.paymentMethod,
        isPaid: orders[0]?.payment?.status === "paid",
      },
      "Order placed successfully"
    );
  } catch (err: any) {
    if (err.message === "CART_EMPTY") return badRequest("Your cart is empty");
    if (err.message?.startsWith("INSUFFICIENT_STOCK:")) {
      return badRequest(`Not enough stock for: ${err.message.split(":")[1]}`);
    }
    if (err.message?.startsWith("PRODUCT_UNAVAILABLE:")) {
      return badRequest(`Product no longer available: ${err.message.split(":")[1]}`);
    }
    console.error("[POST /api/orders/checkout]", err);
    return serverError();
  }
}