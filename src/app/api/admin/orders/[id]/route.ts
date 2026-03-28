import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin", "moderator"].includes(user.role)) return forbidden();

    const order = await prisma.order.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true, sellerProfile: true } },
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        payment: true,
        shipment: true,
      },
    });

    if (!order) return notFound("Order not found");
    return ok(order);
  } catch (err) {
    return serverError();
  }
}