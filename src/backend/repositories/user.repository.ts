import { prisma } from "@/lib/db/prisma";
import type { Role, UserStatus } from "@prisma/client";

export const userRepository = {
  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { profile: true, sellerProfile: true },
    }),

  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email, deletedAt: null } }),

  findAll: (opts?: { role?: Role; status?: UserStatus; skip?: number; take?: number }) =>
    prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(opts?.role && { role: opts.role }),
        ...(opts?.status && { status: opts.status }),
      },
      include: { profile: true },
      skip: opts?.skip,
      take: opts?.take,
      orderBy: { createdAt: "desc" },
    }),

  count: (opts?: { role?: Role; status?: UserStatus }) =>
    prisma.user.count({
      where: {
        deletedAt: null,
        ...(opts?.role && { role: opts.role }),
        ...(opts?.status && { status: opts.status }),
      },
    }),

  softDelete: (id: string) =>
    prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),

  updateStatus: (id: string, status: UserStatus) =>
    prisma.user.update({ where: { id }, data: { status } }),
};