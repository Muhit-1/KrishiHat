import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { auctionSchema } from "@/lib/validations/auction.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });
    const status = searchParams.get("status") || "active";

    const [items, total] = await Promise.all([
      prisma.auction.findMany({
        where: { status: status as any },
        skip,
        take: limit,
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true, nameBn: true } },
            },
          },
          seller: { include: { sellerProfile: { select: { shopName: true } } } },
          bids: { orderBy: { amount: "desc" }, take: 1 }, // top bid
        },
        orderBy: { endTime: "asc" },
      }),
      prisma.auction.count({ where: { status: status as any } }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/auctions]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return forbidden("Only sellers can create auctions");

    const body = await req.json();
    const parsed = auctionSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    // Verify product belongs to seller and category allows auction
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId, deletedAt: null },
      include: { category: true, auction: true, },
    });

    if (!product) return badRequest("Product not found");
    if (product.sellerId !== user.id) return forbidden("Not your product");
    if (!product.category.auctionAllowed) return badRequest("Auction not allowed for this category");
    if (product.auction) return badRequest("Auction already exists for this product");

    const auction = await prisma.auction.create({
      data: {
        productId: parsed.data.productId,
        sellerId: user.id,
        startPrice: parsed.data.startPrice,
        currentPrice: parsed.data.startPrice,
        minIncrement: parsed.data.minIncrement,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        status: "scheduled",
      },
    });

    // Update product listing type
    await prisma.product.update({
      where: { id: parsed.data.productId },
      data: { listingType: "auction" },
    });

    await createAuditLog({
      userId: user.id,
      action: "AUCTION_CREATED",
      entity: "Auction",
      entityId: auction.id,
    });

    return created(auction, "Auction created");
  } catch (err) {
    console.error("[POST /api/auctions]", err);
    return serverError();
  }
}