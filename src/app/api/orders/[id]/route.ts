import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const order = await prisma.order.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
        buyer: { include: { profile: true } },
        seller: { include: { profile: true, sellerProfile: true } },
        payment: true,
        shipment: true,
      },
    });

    if (!order) return notFound("Order not found");

    // Access control: only buyer, seller of this order, or admin can view
    const isAdmin = ["admin", "super_admin", "moderator"].includes(user.role);
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.sellerId === user.id;
    if (!isAdmin && !isBuyer && !isSeller) return forbidden();

    return ok(order);
  } catch (err) {
    return serverError();
  }
}