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

    const { files } = await parseUpload(req, "profiles");
    const uploaded = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;

    if (!uploaded) return serverError("No file uploaded");

    const url = getPublicUrl(uploaded.filepath);

    // Delete old avatar if exists
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    if (profile?.avatarUrl) {
      try {
        const oldPath = path.join(process.cwd(), "public", profile.avatarUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch {}
    }

    const updated = await prisma.userProfile.update({
      where: { userId: user.id },
      data: { avatarUrl: url },
    });

    return ok({ avatarUrl: updated.avatarUrl }, "Avatar updated");
  } catch (err) {
    console.error("[POST /api/users/avatar]", err);
    return serverError();
  }
}