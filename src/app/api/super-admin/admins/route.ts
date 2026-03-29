import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, forbidden, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword } from "@/backend/auth/password";
import { createAuditLog } from "@/lib/utils/audit";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";
import { z } from "zod";

const createAdminSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "moderator"]),
  phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPaginationParams({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
    });

    const role = searchParams.get("role") || undefined;

    const where = {
      role: role ? (role as any) : { in: ["admin", "moderator"] as any[] },
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          profile: { select: { fullName: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return ok(buildPaginatedResponse(items, total, page, limit));
  } catch (err) {
    console.error("[GET /api/super-admin/admins]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "super_admin") return forbidden();

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { email, password, fullName, phone, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return badRequest("Email already registered");

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        emailVerified: true, // Admin accounts are pre-verified
        profile: { create: { fullName, phone } },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: { select: { fullName: true } },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "ADMIN_ACCOUNT_CREATED",
      entity: "User",
      entityId: newUser.id,
      newValue: { email, role, fullName },
    });

    return created(newUser, `${role} account created successfully`);
  } catch (err) {
    console.error("[POST /api/super-admin/admins]", err);
    return serverError();
  }
}