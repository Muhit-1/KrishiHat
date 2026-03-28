import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { parseUpload, getPublicUrl } from "@/backend/utils/upload";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return unauthorized();

    const { files } = await parseUpload(req, "profiles");
    const uploaded = Array.isArray(files.logo) ? files.logo[0] : files.logo;

    if (!uploaded) return serverError("No file uploaded");

    const url = getPublicUrl(uploaded.filepath);

    // Delete old logo
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (existing?.shopLogoUrl) {
      try {
        const oldPath = path.join(process.cwd(), "public", existing.shopLogoUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch {}
    }

    const updated = await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: { shopLogoUrl: url },
    });

    return ok({ shopLogoUrl: updated.shopLogoUrl }, "Logo updated");
  } catch (err) {
    console.error("[POST /api/seller/logo]", err);
    return serverError();
  }
}