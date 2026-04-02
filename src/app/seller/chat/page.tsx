"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations, useMessages } from "@/features/chat/hooks/use-chat";
import { MessageSquare, Send, Package, ShoppingBag, Gavel, BarChart2, User, BadgeCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/verification", label: "Verification", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

export default function SellerChatPage() {
  const { conversations, loading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage } = useMessages(activeId || "");

  const handleSend = async () => {
    if (!draft.trim() || !activeId) return;
    await sendMessage(draft.trim());
    setDraft("");
  };

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader title="Messages" />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : conversations.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No conversations yet" description="Buyers will message you from product pages." />
      ) : (
        <div className="flex border rounded-lg overflow-hidden h-[600px]">
          <div className="w-72 border-r flex flex-col">
            <div className="p-3 border-b text-sm font-medium text-muted-foreground">Conversations</div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv: any) => {
                const other = conv.participants?.find((p: any) => p.user);
                const lastMsg = conv.messages?.[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b",
                      activeId === conv.id && "bg-accent"
                    )}
                  >
                    <p className="font-medium text-sm truncate">{other?.user?.profile?.fullName || "User"}</p>
                    {lastMsg && <p className="text-xs text-muted-foreground truncate">{lastMsg.content}</p>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {!activeId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg: any) => (
                    <div key={msg.id} className="flex flex-col gap-1">
                      <div className="bg-muted rounded-lg px-3 py-2 max-w-xs text-sm">{msg.content}</div>
                      <span className="text-xs text-muted-foreground">{msg.sender?.profile?.fullName}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 h-9 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button size="sm" onClick={handleSend}><Send className="h-4 w-4" /></Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}