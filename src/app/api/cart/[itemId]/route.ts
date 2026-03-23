import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { z } from "zod";

const updateQtySchema = z.object({ quantity: z.coerce.number().int().min(1).max(100) });

type Params = { params: { itemId: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const cart = await prisma.cart.findUnique({ where: { buyerId: user.id } });
    if (!cart) return notFound("Cart not found");

    const item = await prisma.cartItem.findUnique({ where: { id: params.itemId } });
    if (!item || item.cartId !== cart.id) return notFound("Item not in cart");

    const body = await req.json();
    const parsed = updateQtySchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid quantity");

    const updated = await prisma.cartItem.update({
      where: { id: params.itemId },
      data: { quantity: parsed.data.quantity },
    });

    return ok(updated, "Quantity updated");
  } catch (err) {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const cart = await prisma.cart.findUnique({ where: { buyerId: user.id } });
    if (!cart) return notFound();

    const item = await prisma.cartItem.findUnique({ where: { id: params.itemId } });
    if (!item || item.cartId !== cart.id) return notFound("Item not in cart");

    await prisma.cartItem.delete({ where: { id: params.itemId } });
    return ok(null, "Item removed from cart");
  } catch (err) {
    return serverError();
  }
}