"use client";

import { useState, useEffect, useCallback } from "react";

export function useConversations() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((json) => { if (json.success) setConversations(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { conversations, loading };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
    const json = await res.json();
    if (json.success) setMessages(json.data.items);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (json.success) setMessages((prev) => [...prev, json.data]);
    return json;
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}