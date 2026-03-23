import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, created, badRequest, unauthorized, serverError } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { startConversationSchema } from "@/lib/validations/chat.schema";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: user.id } },
      },
      include: {
        participants: {
          include: { user: { include: { profile: { select: { fullName: true, avatarUrl: true } } } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // last message preview
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return ok(conversations);
  } catch (err) {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = startConversationSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request");

    const { participantId } = parsed.data;

    if (participantId === user.id) return badRequest("Cannot start a conversation with yourself");

    // Check if conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
    });

    if (existing) return ok(existing, "Conversation already exists");

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user.id }, { userId: participantId }],
        },
      },
      include: { participants: true },
    });

    return created(conversation, "Conversation started");
  } catch (err) {
    console.error("[POST /api/chat/conversations]", err);
    return serverError();
  }
}