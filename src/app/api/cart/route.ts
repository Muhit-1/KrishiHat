import { NextRequest } from "next/server";
import { ok, unauthorized, badRequest, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOrCreateCart, addToCart } from "@/backend/services/cart.service";
import { addToCartSchema } from "@/lib/validations/cart.schema";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "buyer") return unauthorized("Only buyers have a cart");

    const cart = await getOrCreateCart(user.id);
    return ok(cart);
  } catch (err) {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "buyer") return unauthorized("Only buyers can add to cart");

    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const item = await addToCart(user.id, parsed.data.productId, parsed.data.quantity).catch((err) => {
      throw err;
    });

    return ok(item, "Added to cart");
  } catch (err: any) {
    if (err.message === "PRODUCT_NOT_FOUND") return badRequest("Product not found or unavailable");
    if (err.message === "INSUFFICIENT_STOCK") return badRequest("Not enough stock");
    console.error("[POST /api/cart]", err);
    return serverError();
  }
}