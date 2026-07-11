"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { PageHeader } from "@/components/ui";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function DealerLeadsPage() {
  const { conversations, listings } = useDemo();
  const myIds = new Set(
    listings.filter((l) => l.sellerName === PERSONAS.dealer.name).map((l) => l.id)
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
        title="Lead inbox"
        description="Every buyer enquiry across all your listings lands here — no lead is missed, and your team can follow up."
      />
      <ChatPanel threads={threads} perspective="seller" emptyText="No leads yet." />
    </div>
  );
}
