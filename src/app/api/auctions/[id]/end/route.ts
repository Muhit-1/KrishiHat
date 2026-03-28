import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!["admin", "super_admin", "seller"].includes(user.role)) return forbidden();

    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        bids: { orderBy: { amount: "desc" }, take: 1 },
      },
    });

    if (!auction) return notFound("Auction not found");

    if (user.role === "seller" && auction.sellerId !== user.id) return forbidden();
    if (auction.status === "ended") return ok(null, "Auction already ended");

    const topBid = auction.bids[0];

    const updated = await prisma.auction.update({
      where: { id: params.id },
      data: {
        status: "ended",
        winnerId: topBid?.bidderId || null,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "AUCTION_ENDED",
      entity: "Auction",
      entityId: params.id,
      newValue: { winnerId: topBid?.bidderId || null, finalPrice: topBid?.amount || null },
    });

    return ok(updated, topBid ? `Auction ended. Winner: ${topBid.bidderId}` : "Auction ended with no bids.");
  } catch (err) {
    console.error("[POST /api/auctions/[id]/end]", err);
    return serverError();
  }
}