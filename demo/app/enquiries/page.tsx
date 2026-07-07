"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConversationPanel } from "@/components/ConversationPanel";
import { api } from "@/lib/api";
import { fetchSession } from "@/lib/auth";
import { vehicleTitle } from "@/lib/format";
import type { Conversation, ListingDetail, User } from "@/lib/types";

export default function EnquiriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listingMap, setListingMap] = useState<Map<string, ListingDetail>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (session: User) => {
    setLoading(true);
    try {
      const buyerConversations = await api.getBuyerConversations();
      setConversations(buyerConversations);

      const listings = await Promise.all(
        buyerConversations.map((c) => api.getListing(c.listingId))
      );
      const map = new Map<string, ListingDetail>();
      buyerConversations.forEach((c, i) => {
        const listing = listings[i];
        if (listing) map.set(c.listingId, listing);
      });
      setListingMap(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession().then((session) => {
      if (!session) {
        router.replace("/login?next=/enquiries");
        return;
      }
      if (session.role === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(session);
      loadData(session);
    });
  }, [router, loadData]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">My enquiries</h1>
      <p className="mt-2 text-slate-600">
        Messages you sent to sellers and their replies. Check here after a seller
        responds to your enquiry.
      </p>

      {loading ? (
        <p className="mt-12 text-center text-slate-500">Loading…</p>
      ) : conversations.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
          <p className="text-slate-600">No enquiries yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Browse listings and use the contact form on a car you like.
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Browse cars
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {conversations.map((conv) => {
            const listing = listingMap.get(conv.listingId);
            const listingTitle = listing
              ? vehicleTitle(listing.vehicle)
              : "Listing";
            const sellerName = listing?.seller.name ?? "Seller";
            return (
              <ConversationPanel
                key={conv.id}
                conversation={conv}
                listingTitle={listingTitle}
                sellerName={sellerName}
                mode="buyer"
                onUpdated={(updated) =>
                  setConversations((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
