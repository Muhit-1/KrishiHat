import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Title too short"),
  titleBn: z.string().optional(),
  categoryId: z.string().min(1, "Category required"),
  subcategoryId: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().min(0),
  unit: z.string().default("kg"),
  condition: z.enum(["new", "used", "refurbished"]).default("new"),
  listingType: z.enum(["fixed", "auction"]).default("fixed"),
});

export type ProductInput = z.infer<typeof productSchema>;