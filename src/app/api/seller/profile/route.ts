import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { z } from "zod";

const sellerProfileSchema = z.object({
  shopName: z.string().min(2).optional(),
  shopDescription: z.string().optional(),
  nidNumber: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return forbidden("Only sellers can update seller profile");

    const body = await req.json();
    const parsed = sellerProfileSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updated = await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: parsed.data,
    });

    return ok(updated, "Profile updated");
  } catch (err) {
    return serverError();
  }
}

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return forbidden();

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: { user: { include: { profile: true } } },
    });

    return ok(profile);
  } catch (err) {
    return serverError();
  }
}