import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { sendMessageSchema } from "@/lib/validations/chat.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/lib/utils/pagination";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
    });
    if (!participant) return forbidden("Not a participant in this conversation");

    const { page, limit, skip } = getPaginationParams({
      page: Number(req.nextUrl.searchParams.get("page") || 1),
      limit: Number(req.nextUrl.searchParams.get("limit") || 30),
    });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: params.id },
        include: {
          sender: { include: { profile: { select: { fullName: true, avatarUrl: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId: params.id } }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: params.id, senderId: { not: user.id }, isRead: false },
      data: { isRead: true },
    });

    return ok(buildPaginatedResponse(messages.reverse(), total, page, limit));
  } catch (err) {
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
    if (!conversation) return notFound("Conversation not found");

    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
    });
    if (!participant) return forbidden("Not a participant");

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse({ conversationId: params.id, ...body });
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: user.id,
        content: parsed.data.content,
      },
      include: {
        sender: { include: { profile: { select: { fullName: true, avatarUrl: true } } } },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return created(message);
  } catch (err) {
    console.error("[POST /api/chat/conversations/[id]/messages]", err);
    return serverError();
  }
}