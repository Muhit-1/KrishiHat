import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { profile: true, sellerProfile: true },
    });

    if (!user) return unauthorized();

    return ok({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      sellerProfile: user.sellerProfile,
    });
  } catch (err) {
    return serverError();
  }
}