import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/utils/audit";
import { sendMail } from "@/backend/utils/mailer";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actingUser = await getCurrentUser();
    if (!actingUser) return unauthorized();
    if (!["admin", "super_admin"].includes(actingUser.role)) return forbidden();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid action");

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: params.id },
      include: { user: { include: { profile: true } } },
    });

    if (!sellerProfile) return notFound("Seller profile not found");

    const isApproved = parsed.data.action === "approve";

    await prisma.sellerProfile.update({
      where: { userId: params.id },
      data: {
        isVerified: isApproved,
        verifiedAt: isApproved ? new Date() : null,
      },
    });

    // Send email notification
    const sellerEmail = sellerProfile.user.email;
    const sellerName = sellerProfile.user.profile?.fullName || "Seller";

    await sendMail({
      to: sellerEmail,
      subject: isApproved
        ? "KrishiHat — Your seller account is verified!"
        : "KrishiHat — Seller verification update",
      html: isApproved
        ? `<p>Hi <strong>${sellerName}</strong>, your seller account has been verified. You can now publish products!</p>`
        : `<p>Hi <strong>${sellerName}</strong>, your verification was not approved. Reason: ${parsed.data.reason || "Please resubmit with correct documents."}. Contact support if you have questions.</p>`,
    });

    await createAuditLog({
      userId: actingUser.id,
      action: `SELLER_VERIFICATION_${parsed.data.action.toUpperCase()}`,
      entity: "SellerProfile",
      entityId: params.id,
      newValue: { isVerified: isApproved, reason: parsed.data.reason },
    });

    return ok(null, `Seller ${parsed.data.action === "approve" ? "verified" : "rejected"} successfully`);
  } catch (err) {
    console.error("[POST /api/admin/sellers/verify/[id]]", err);
    return serverError();
  }
}