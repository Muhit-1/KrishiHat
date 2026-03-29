import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { z } from "zod";

const settingsSchema = z.object({
  platformName: z.string().min(2),
  platformNameBn: z.string().min(2),
  supportEmail: z.string().email(),
  supportPhone: z.string().optional(),
  defaultLocale: z.enum(["en", "bn"]),
  maintenanceMode: z.boolean(),
  allowNewRegistrations: z.boolean(),
  maxProductImagesPerListing: z.coerce.number().int().min(1).max(20),
  deliveryChargeDefault: z.coerce.number().min(0),
});

type SettingsInput = z.infer<typeof settingsSchema>;

// Helper: read all settings as a typed object
async function getSettingsMap(): Promise<Partial<SettingsInput & Record<string, string>>> {
  const rows = await prisma.platformSetting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return {
    platformName: map.platformName ?? "KrishiHat",
    platformNameBn: map.platformNameBn ?? "কৃষিহাট",
    supportEmail: map.supportEmail ?? "support@krishihat.com",
    supportPhone: map.supportPhone ?? "",
    defaultLocale: (map.defaultLocale as "en" | "bn") ?? "en",
    maintenanceMode: map.maintenanceMode === "true",
    allowNewRegistrations: map.allowNewRegistrations !== "false",
    maxProductImagesPerListing: parseInt(map.maxProductImagesPerListing ?? "5"),
    deliveryChargeDefault: parseFloat(map.deliveryChargeDefault ?? "0"),
  };
}

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const settings = await getSettingsMap();
    return ok(settings);
  } catch (err) {
    console.error("[GET /api/super-admin/settings]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    // Upsert each setting key
    const entries = Object.entries(parsed.data) as [string, unknown][];
    await Promise.all(
      entries.map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    await createAuditLog({
      userId: user.id,
      action: "PLATFORM_SETTINGS_UPDATED",
      entity: "PlatformSetting",
      newValue: parsed.data as object,
    });

    return ok(parsed.data, "Settings saved successfully");
  } catch (err) {
    console.error("[POST /api/super-admin/settings]", err);
    return serverError();
  }
}