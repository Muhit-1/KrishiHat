"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations, useMessages } from "@/features/chat/hooks/use-chat";
import { MessageSquare, Send, ShoppingBag, ShoppingCart, MapPin, Flag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buyerLinks = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/buyer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/buyer/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/buyer/profile", label: "Profile", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/buyer/reports", label: "Reports", icon: <Flag className="h-4 w-4" /> },
];

export default function BuyerChatPage() {
  const { conversations, loading} = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, loading: messagesLoading } = useMessages(activeId || "");

  // Auto-select first conversation on load
  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const handleSend = async () => {
    if (!draft.trim() || !activeId) return;
    await sendMessage(draft.trim());
    setDraft("");
  };

  const activeConversation = conversations.find((c: any) => c.id === activeId);
  const activeOther = activeConversation?.participants?.find(
    (p: any) => p.user
  );

  return (
    <DashboardLayout sidebarLinks={buyerLinks} sidebarTitle="Buyer Panel">
      <SectionHeader
        title="Messages"
        subtitle="Chat with sellers about their products"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No conversations yet"
          description="Visit a product page and click 'Message Seller' to start a conversation with a seller."
        />
      ) : (
        <div className="flex border rounded-lg overflow-hidden h-[600px]">
          {/* Conversation list */}
          <div className="w-72 border-r flex flex-col bg-muted/10">
            <div className="p-3 border-b text-sm font-semibold text-foreground bg-muted/30">
              Conversations ({conversations.length})
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv: any) => {
                const other = conv.participants?.find((p: any) => p.user);
                const lastMsg = conv.messages?.[0];
                const shopName =
                  other?.user?.sellerProfile?.shopName ||
                  other?.user?.profile?.fullName ||
                  "Seller";
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b",
                      activeId === conv.id && "bg-accent border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm">
                        🌾
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{shopName}</p>
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMsg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 flex flex-col">
            {!activeId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a conversation
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="border-b px-4 py-3 flex items-center gap-3 bg-muted/10">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    🌾
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {activeOther?.user?.sellerProfile?.shopName ||
                        activeOther?.user?.profile?.fullName ||
                        "Seller"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeOther?.user?.profile?.fullName}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-48" />
                      <Skeleton className="h-10 w-64 ml-auto" />
                      <Skeleton className="h-10 w-40" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground text-center">
                        No messages yet. Say hello! 👋
                      </p>
                    </div>
                  ) : (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col gap-1",
                          msg.isOwn ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 max-w-xs text-sm",
                            msg.isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {msg.sender?.profile?.fullName}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-3 flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 h-9 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  />
                  <Button size="sm" onClick={handleSend} disabled={!draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}