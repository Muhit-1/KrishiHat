import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { bidSchema } from "@/lib/validations/auction.schema";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "buyer") return forbidden("Only buyers can bid");
    if (user.status !== "active") return forbidden("Account not active");

    const body = await req.json();
    const parsed = bidSchema.safeParse({ auctionId: params.id, ...body });
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const auction = await prisma.auction.findUnique({ where: { id: params.id } });
    if (!auction) return notFound("Auction not found");
    if (auction.status !== "active") return badRequest("Auction is not active");
    if (new Date() > auction.endTime) return badRequest("Auction has ended");

    const minBid = Number(auction.currentPrice) + Number(auction.minIncrement);
    if (parsed.data.amount < minBid) {
      return badRequest(`Minimum bid is ৳${minBid}`);
    }

    // Place bid in transaction
    const [bid] = await prisma.$transaction([
      prisma.auctionBid.create({
        data: {
          auctionId: params.id,
          bidderId: user.id,
          amount: parsed.data.amount,
        },
      }),
      prisma.auction.update({
        where: { id: params.id },
        data: { currentPrice: parsed.data.amount },
      }),
    ]);

    return ok(bid, "Bid placed successfully");
  } catch (err) {
    console.error("[POST /api/auctions/[id]/bid]", err);
    return serverError();
  }
}