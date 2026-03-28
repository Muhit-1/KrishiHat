import { z } from "zod";

export const marketPriceBaseSchema = z.object({
  categoryId: z.string(),
  productName: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
  unit: z.string().default("kg"),
  market: z.string(),
  recordedAt: z.string().optional(),
});

export const marketPriceSchema = marketPriceBaseSchema.refine(
  (data) => data.maxPrice >= data.minPrice,
  { message: "maxPrice must be >= minPrice", path: ["maxPrice"] }
);
export type MarketPriceInput = z.infer<typeof marketPriceSchema>;