"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function BuyerMessagesPage() {
  const { conversations, listings } = useDemo();

  const threads = conversations
    .filter((c) => c.buyerName === PERSONAS.buyer.name)
    .map((conversation) => ({
      conversation,
      listing: listings.find((l) => l.id === conversation.listingId)!,
    }))
    .filter((t) => t.listing);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your conversations with sellers and dealers — contact details stay masked on both sides.
      </p>
      <div className="mt-6">
        <ChatPanel
          threads={threads}
          perspective="buyer"
          emptyText="No conversations yet — enquire on any listing to start one."
        />
      </div>
    </div>
  );
}
