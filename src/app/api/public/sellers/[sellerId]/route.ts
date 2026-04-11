import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, notFound, serverError } from "@/lib/utils/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sellerId: string } }
) {
  try {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: params.sellerId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!sellerProfile) return notFound("Shop not found");

    // Only expose public-safe fields
    const publicData = {
      shopName: sellerProfile.shopName,
      shopDescription: sellerProfile.shopDescription,
      shopLogoUrl: sellerProfile.shopLogoUrl,
      isVerified: sellerProfile.isVerified,
      user: {
        profile: {
          fullName: sellerProfile.user?.profile?.fullName ?? null,
        },
      },
    };

    return ok(publicData);
  } catch (err) {
    return serverError();
  }
}