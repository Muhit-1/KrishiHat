import { prisma } from "@/lib/db/prisma";

let cachedMaintenance: boolean | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance !== null && now - cacheTime < CACHE_TTL) {
    return cachedMaintenance;
  }

  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "maintenanceMode" },
    });
    cachedMaintenance = setting?.value === "true";
    cacheTime = now;
    return cachedMaintenance;
  } catch {
    return false;
  }
}