import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  phone: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    return ok(profile);
  } catch (err) {
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: { userId: user.id, ...parsed.data },
    });

    return ok(profile, "Profile updated successfully");
  } catch (err) {
    console.error("[PATCH /api/users/profile]", err);
    return serverError();
  }
}