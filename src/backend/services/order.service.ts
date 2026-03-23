import { prisma } from "@/lib/db/prisma";
import type { CheckoutInput } from "@/lib/validations/cart.schema";
import { Decimal } from "@prisma/client/runtime/library";

export async function placeOrder(buyerId: string, data: CheckoutInput) {
    const cart = await prisma.cart.findUnique({
        where: { buyerId },
        include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    type CartItemWithProduct = typeof cart.items[number];

    // Group by seller (one order per seller)
    const bySeller = new Map<string, CartItemWithProduct[]>();
    for (const item of cart.items) {
        const existing = bySeller.get(item.product.sellerId) || [];
        bySeller.set(item.product.sellerId, [...existing, item]);
    }

    const orders = [];

    for (const [sellerId, items] of Array.from(bySeller)) {
        const totalAmount = items.reduce(
            (sum: number, item: CartItemWithProduct) =>
                sum + Number(item.product.price) * item.quantity,
            0
        );

        const order = await prisma.order.create({
            data: {
                buyerId,
                sellerId,
                totalAmount,
                deliveryAddress: data.deliveryAddress,
                note: data.note,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.product.price,
                        totalPrice: new Decimal(Number(item.product.price) * item.quantity),
                    })),
                },
                payment: {
                    create: {
                        amount: totalAmount,
                        method: data.paymentMethod || "cod",
                        status: "pending",
                    },
                },
            },
        });

        orders.push(order);
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return orders;
}