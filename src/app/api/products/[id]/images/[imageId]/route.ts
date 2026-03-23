import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import fs from "fs";
import path from "path";

type Params = { params: { id: string; imageId: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const image = await prisma.productImage.findUnique({ where: { id: params.imageId } });
    if (!image) return notFound("Image not found");

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return notFound();

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isOwner = user.role === "seller" && product.sellerId === user.id;
    if (!isAdmin && !isOwner) return forbidden();

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), "public", image.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Non-fatal: file may already be gone
    }

    await prisma.productImage.delete({ where: { id: params.imageId } });

    return ok(null, "Image deleted");
  } catch (err) {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return notFound();

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isOwner = user.role === "seller" && product.sellerId === user.id;
    if (!isAdmin && !isOwner) return forbidden();

    // Set this image as primary; unset all others
    await prisma.productImage.updateMany({
      where: { productId: params.id },
      data: { isPrimary: false },
    });

    const updated = await prisma.productImage.update({
      where: { id: params.imageId },
      data: { isPrimary: true },
    });

    return ok(updated, "Primary image updated");
  } catch (err) {
    return serverError();
  }
}