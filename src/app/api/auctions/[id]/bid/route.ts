import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, notFound, serverError } from "@/lib/utils/api-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            seller: { include: { profile: true, sellerProfile: true } },
          },
        },
        bids: {
          include: { bidder: { include: { profile: { select: { fullName: true } } } } },
          orderBy: { amount: "desc" },
          take: 20,
        },
      },
    });

    if (!auction) return notFound("Auction not found");
    return ok(auction);
  } catch (err) {
    return serverError();
  }
}