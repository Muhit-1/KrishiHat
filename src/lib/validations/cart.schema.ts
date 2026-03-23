import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(100),
});

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, "Address too short"),
  note: z.string().optional(),
  paymentMethod: z.enum(["cod", "bkash", "nagad"]).default("cod"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;