import { prisma } from "@/lib/db/prisma";

export async function getOrCreateCart(buyerId: string) {
  const existing = await prisma.cart.findUnique({
    where: { buyerId },
    include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { buyerId },
    include: { items: true },
  });
}

export async function addToCart(buyerId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(buyerId);

  const product = await prisma.product.findUnique({ where: { id: productId, status: "active" } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  if (product.stock < quantity) throw new Error("INSUFFICIENT_STOCK");

  return prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity },
    create: { cartId: cart.id, productId, quantity },
  });
}

export async function removeFromCart(buyerId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { buyerId } });
  if (!cart) return;

  return prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
}