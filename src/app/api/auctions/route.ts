import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
} from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { auctionSchema } from "@/lib/validations/auction.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 12),
    });

    // If no status filter → return all non-cancelled
    const statusParam = searchParams.get("status") || undefined;
    const where = statusParam
      ? { status: statusParam as any }
      : { status: { not: "cancelled" as any } };

    const [items, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            include: {
              images: { orderBy: [{ isPrimary: "desc" }], take: 1 },
              category: { select: { id: true, name: true, nameBn: true } },
            },
          },
          seller: {
            include: {
              sellerProfile: {
                select: { shopName: true, isVerified: true, shopLogoUrl: true },
              },
            },
          },
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
            select: { id: true, amount: true },
          },
          _count: { select: { bids: true } },
        },
        orderBy: [
          { status: "asc" }, // active first
          { endTime: "asc" },
        ],
      }),
      prisma.auction.count({ where }),
    ]);

    // Attach bid count to each auction
    const enriched = items.map((a) => ({
      ...a,
      bids: [
        ...(a.bids || []),
      ],
      bidCount: a._count.bids,
    }));

    return ok(buildPaginatedResponse(enriched, total, page, limit));
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
      return badRequest(
        "Validation failed",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Verify product belongs to seller and category allows auction
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId, deletedAt: null },
      include: { category: true, auction: true },
    });

    if (!product) return badRequest("Product not found");
    if (product.sellerId !== user.id) return forbidden("Not your product");
    if (!product.category.auctionAllowed) {
      return badRequest("Auction is not allowed for this category");
    }
    if (product.auction) {
      return badRequest("An auction already exists for this product");
    }

    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);

    const auction = await prisma.auction.create({
      data: {
        productId: parsed.data.productId,
        sellerId: user.id,
        startPrice: parsed.data.startPrice,
        currentPrice: parsed.data.startPrice,
        minIncrement: parsed.data.minIncrement,
        startTime,
        endTime,
        // Mark as active immediately if start time is now or in the past
        status: startTime <= new Date() ? "active" : "scheduled",
      },
    });

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