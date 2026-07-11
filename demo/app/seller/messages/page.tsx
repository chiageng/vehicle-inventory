"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { PageHeader } from "@/components/ui";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function SellerMessagesPage() {
  const { conversations, listings } = useDemo();
  const myIds = new Set(
    listings.filter((l) => l.sellerName === PERSONAS.seller.name).map((l) => l.id)
  );

  const threads = conversations
    .filter((c) => myIds.has(c.listingId))
    .map((conversation) => ({
      conversation,
      listing: listings.find((l) => l.id === conversation.listingId)!,
    }))
    .filter((t) => t.listing);

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description="Buyer messages, offers and viewing requests. You're notified by email & SMS for every new enquiry."
      />
      <ChatPanel threads={threads} perspective="seller" emptyText="No enquiries yet." />
    </div>
  );
}
