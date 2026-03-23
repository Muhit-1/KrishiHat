import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2),
  nameBn: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  auctionAllowed: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;