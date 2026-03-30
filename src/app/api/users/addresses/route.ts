import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1, "Label required").max(50),
  fullAddress: z.string().min(10, "Address too short"),
  district: z.string().min(1, "District required"),
  upazila: z.string().optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Addresses are stored in userProfile.address as JSON array
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    let addresses: any[] = [];
    try {
      if (profile?.address) {
        addresses = JSON.parse(profile.address);
      }
    } catch {
      addresses = [];
    }

    return ok(addresses);
  } catch (err) {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        "Validation failed",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    let addresses: any[] = [];
    try {
      if (profile?.address) addresses = JSON.parse(profile.address);
    } catch {
      addresses = [];
    }

    const newAddress = {
      id: Date.now().toString(),
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    // If new address is default, unset others
    if (parsed.data.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    addresses.push(newAddress);

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { address: JSON.stringify(addresses) },
      create: {
        userId: user.id,
        fullName: "User",
        address: JSON.stringify(addresses),
      },
    });

    return created(newAddress, "Address saved");
  } catch (err) {
    console.error("[POST /api/users/addresses]", err);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await req.json();
    if (!id) return badRequest("Address ID required");

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    let addresses: any[] = [];
    try {
      if (profile?.address) addresses = JSON.parse(profile.address);
    } catch {
      addresses = [];
    }

    const filtered = addresses.filter((a) => a.id !== id);

    await prisma.userProfile.update({
      where: { userId: user.id },
      data: { address: JSON.stringify(filtered) },
    });

    return ok(null, "Address deleted");
  } catch (err) {
    return serverError();
  }
}