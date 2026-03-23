import { z } from "zod";

export const auctionSchema = z.object({
  productId: z.string().min(1),
  startPrice: z.coerce.number().positive(),
  minIncrement: z.coerce.number().positive().default(10),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine((d) => new Date(d.endTime) > new Date(d.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const bidSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export type AuctionInput = z.infer<typeof auctionSchema>;
export type BidInput = z.infer<typeof bidSchema>;