import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  serverError,
} from "@/lib/utils/api-response";
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

type SavedAddress = {
  id: string;
  label: string;
  fullAddress: string;
  district: string;
  upazila: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
};

function safeParseAddresses(profile: {
  address?: string | null;
  district?: string | null;
  upazila?: string | null;
  phone?: string | null;
} | null): SavedAddress[] {
  if (!profile?.address) return [];

  try {
    const parsed = JSON.parse(profile.address);

    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map((item: any) => ({
        id: String(item.id ?? Date.now()),
        label: String(item.label ?? "Address"),
        fullAddress: String(item.fullAddress ?? ""),
        district: String(item.district ?? ""),
        upazila: String(item.upazila ?? ""),
        phone: String(item.phone ?? ""),
        isDefault: Boolean(item.isDefault),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }));
    }
  } catch {
    // Old profile address format: plain text in userProfile.address
  }

  const plainAddress = profile.address.trim();
  if (!plainAddress) return [];

  return [
    {
      id: "legacy-profile-address",
      label: "Saved Address",
      fullAddress: plainAddress,
      district: profile.district ?? "",
      upazila: profile.upazila ?? "",
      phone: profile.phone ?? "",
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: {
        address: true,
        district: true,
        upazila: true,
        phone: true,
      },
    });

    const addresses = safeParseAddresses(profile);
    return ok(addresses);
  } catch (err) {
    console.error("[GET /api/users/addresses]", err);
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
      select: {
        id: true,
        address: true,
        district: true,
        upazila: true,
        phone: true,
      },
    });

    if (!profile) {
      return badRequest("User profile not found");
    }

    let addresses = safeParseAddresses(profile);

    const newAddress: SavedAddress = {
      id: `${Date.now()}`,
      label: parsed.data.label.trim(),
      fullAddress: parsed.data.fullAddress.trim(),
      district: parsed.data.district.trim(),
      upazila: (parsed.data.upazila ?? "").trim(),
      phone: (parsed.data.phone ?? "").trim(),
      isDefault: parsed.data.isDefault ?? false,
      createdAt: new Date().toISOString(),
    };

    if (newAddress.isDefault || addresses.length === 0) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
      newAddress.isDefault = true;
    }

    addresses.push(newAddress);

    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
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
      select: {
        address: true,
        district: true,
        upazila: true,
        phone: true,
      },
    });

    if (!profile) {
      return badRequest("User profile not found");
    }

    let addresses = safeParseAddresses(profile);
    const toDeleteId = String(id);

    const existing = addresses.find((a) => a.id === toDeleteId);
    if (!existing) {
      return badRequest("Address not found");
    }

    addresses = addresses.filter((a) => a.id !== toDeleteId);

    if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        address: JSON.stringify(addresses),
      },
    });

    return ok(null, "Address deleted");
  } catch (err) {
    console.error("[DELETE /api/users/addresses]", err);
    return serverError();
  }
}