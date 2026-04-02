import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { parseUpload, getPublicUrl } from "@/backend/utils/upload";

// NOTE: Do NOT add `export const config = { api: { bodyParser: false } }` here.
// That only applies to the old Pages Router. In the App Router Next.js handles
// multipart bodies automatically — adding it does nothing and can cause confusion.

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const images = await prisma.productImage.findMany({
      where: { productId: params.id },
      orderBy: { sortOrder: "asc" },
    });
    return ok(images);
  } catch (err) {
    console.error("[GET /api/products/[id]/images]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const product = await prisma.product.findUnique({
      where: { id: params.id, deletedAt: null },
    });
    if (!product) return notFound("Product not found");

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    const isOwner = user.role === "seller" && product.sellerId === user.id;
    if (!isAdmin && !isOwner) return forbidden();

    let result: Awaited<ReturnType<typeof parseUpload>>;
    try {
      result = await parseUpload(req, "products", "image");
    } catch (uploadErr: any) {
      console.error("[POST /api/products/[id]/images] Upload parse error:", uploadErr);
      return serverError(
        uploadErr?.message ||
          "Failed to parse uploaded file. Make sure you are sending a multipart/form-data request with field name 'image'."
      );
    }

    const raw = result.files["image"];

    // Normalise to array regardless of whether one or many files were uploaded
    const uploadedFiles = Array.isArray(raw) ? raw : raw ? [raw] : [];

    if (uploadedFiles.length === 0) {
      return serverError("No file uploaded. Make sure the field name is 'image'.");
    }

    // Check if this is the first image so we can make it primary
    const existingCount = await prisma.productImage.count({
      where: { productId: params.id },
    });

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