import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "5") * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "seller") return unauthorized();

    const formData = await req.formData();
    const file = formData.get("logo") as File | null;

    if (!file) return serverError("No file uploaded");
    if (file.size > MAX_SIZE) return serverError("File too large");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) return serverError("Invalid file type");

    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, "profiles");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = path.join(uploadPath, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/profiles/${filename}`;

    const existing = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

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