import { prisma } from "@/lib/db/prisma";

interface AuditOptions {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: object;
  newValue?: object;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(opts: AuditOptions): Promise<void> {
  try {
    await prisma.auditLog.create({ data: opts });
  } catch (err) {
    // Audit log failures should never crash the main flow
    console.error("[AuditLog] Failed:", err);
  }
}