import { z } from "zod";

export const auctionSchema = z.object({
  productId: z.string().min(1),
  startPrice: z.coerce.number().positive(),
  minIncrement: z.coerce.number().positive().default(10),
  // FIX: Use plain z.string() — datetime-local produces "YYYY-MM-DDTHH:mm"
  // which fails Zod's strict .datetime() (requires full ISO 8601 with timezone).
  // We convert to ISO in the submit handler before sending to the API.
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
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