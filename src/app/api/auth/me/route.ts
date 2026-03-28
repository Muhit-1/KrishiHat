import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";

export async function GET(_req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phone: true,
            avatarUrl: true,
            district: true,
            division: true,
          },
        },
        sellerProfile: {
          select: {
            shopName: true,
            shopLogoUrl: true,
            isVerified: true,
            rating: true,
          },
        },
      },
    });

    if (!user) return unauthorized();

    return ok(user);
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return serverError();
  }
}