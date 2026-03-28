import { prisma } from "@/lib/db/prisma";
import type { CheckoutInput } from "@/lib/validations/cart.schema";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type CartItemWithProduct = CartWithItems["items"][number];

export async function placeOrder(buyerId: string, data: CheckoutInput) {
  const cart: CartWithItems | null = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  // Validate stock and product availability first
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`INSUFFICIENT_STOCK:${item.product.title}`);
    }

    if (item.product.status !== "active") {
      throw new Error(`PRODUCT_UNAVAILABLE:${item.product.title}`);
    }
  }

  // Group cart items by seller
  const bySeller = new Map<string, CartItemWithProduct[]>();

  for (const item of cart.items) {
    const sellerId = item.product.sellerId;
    const existing = bySeller.get(sellerId) ?? [];
    existing.push(item);
    bySeller.set(sellerId, existing);
  }

  const orders = [];

  // Use Map.forEach instead of `for...of` on Map to avoid TS2802 issue
  for (const entry of Array.from(bySeller.entries())) {
    const [sellerId, items] = entry;

    const totalAmount = items.reduce((sum: number, item: CartItemWithProduct) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Mock payment logic
    const isMobilePay =
      data.paymentMethod === "bkash" || data.paymentMethod === "nagad";

    const paymentStatus =
      isMobilePay && data.transactionId ? "paid" : "pending";

    const paidAt = paymentStatus === "paid" ? new Date() : null;

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId,
        totalAmount: new Decimal(totalAmount),
        deliveryAddress: data.deliveryAddress,
        note: data.note,
        status: "pending",
        items: {
          create: items.map((item: CartItemWithProduct) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: new Decimal(Number(item.product.price) * item.quantity),
          })),
        },
        payment: {
          create: {
            amount: new Decimal(totalAmount),
            method: data.paymentMethod,
            status: paymentStatus,
            transactionId: data.transactionId || null,
            paidAt,
          },
        },
        shipment: {
          create: {
            status: "not_shipped",
          },
        },
      },
      include: {
        payment: true,
        shipment: true,
      },
    });

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    orders.push(order);
  }

  // Clear cart after successful order creation
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return orders;
}