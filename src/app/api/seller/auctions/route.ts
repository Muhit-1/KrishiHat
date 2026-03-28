import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return unauthorized();

    const auctions = await prisma.auction.findMany({
      where: { sellerId: user.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        bids: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(auctions);
  } catch (err) {
    console.error("[GET /api/seller/auctions]", err);
    return serverError();
  }
}