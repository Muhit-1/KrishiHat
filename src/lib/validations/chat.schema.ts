import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const startConversationSchema = z.object({
  participantId: z.string().min(1),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;