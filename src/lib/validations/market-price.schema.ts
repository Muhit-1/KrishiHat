import { z } from "zod";

export const marketPriceSchema = z.object({
  categoryId: z.string().min(1),
  productName: z.string().min(2),
  minPrice: z.coerce.number().positive(),
  maxPrice: z.coerce.number().positive(),
  unit: z.string().default("kg"),
  market: z.string().min(2),
  recordedAt: z.string().datetime().optional(),
}).refine((d) => d.maxPrice >= d.minPrice, {
  message: "Max price must be >= min price",
  path: ["maxPrice"],
});

export type MarketPriceInput = z.infer<typeof marketPriceSchema>;