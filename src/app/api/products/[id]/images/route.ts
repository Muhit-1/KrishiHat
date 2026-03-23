import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { parseUpload, getPublicUrl } from "@/backend/utils/upload";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const images = await prisma.productImage.findMany({
      where: { productId: params.id },
      orderBy: { sortOrder: "asc" },
    });
    return ok(images);
  } catch (err) {
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const product = await prisma.product.findUnique({ where: { id: params.id, deletedAt: null } });
    if (!product) return notFound("Product not found");

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isOwner = user.role === "seller" && product.sellerId === user.id;
    if (!isAdmin && !isOwner) return forbidden();

    const { files } = await parseUpload(req, "products");

    const uploadedFiles = Array.isArray(files.image) ? files.image : files.image ? [files.image] : [];

    if (uploadedFiles.length === 0) {
      return serverError("No file uploaded");
    }

    // Check if this is the first image (make it primary)
    const existingCount = await prisma.productImage.count({ where: { productId: params.id } });

    const images = await Promise.all(
      uploadedFiles.map((file, index) =>
        prisma.productImage.create({
          data: {
            productId: params.id,
            url: getPublicUrl(file.filepath),
            isPrimary: existingCount === 0 && index === 0,
            sortOrder: existingCount + index,
          },
        })
      )
    );

    return created(images, "Images uploaded");
  } catch (err) {
    console.error("[POST /api/products/[id]/images]", err);
    return serverError();
  }
}