"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ConversationPanel } from "@/components/ConversationPanel";
import { ListingPriceEditor } from "@/components/ListingPriceEditor";
import { api } from "@/lib/api";
import { vehicleTitle } from "@/lib/format";
import type { Conversation, ListingDetail } from "@/lib/types";
import { useRequireSellerAuth } from "@/lib/useRequireSellerAuth";

type Tab = "all" | "active" | "pending_review" | "draft" | "sold";

export default function DashboardPage() {
  const user = useRequireSellerAuth("/dashboard");
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [sellerListings, sellerConversations] = await Promise.all([
        api.getSellerListings(),
        api.getSellerConversations(),
      ]);
      setListings(sellerListings);
      setConversations(sellerConversations);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) {
    return null;
  }

  const isReseller = user.role === "reseller";

  const filtered = listings.filter((d) => {
    if (tab === "all") return true;
    return d.listing.status === tab;
  });

  const listingById = new Map(listings.map((d) => [d.listing.id, d]));

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "pending_review", label: "Pending review" },
    { key: "draft", label: "Draft" },
    { key: "sold", label: "Sold" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isReseller ? "Client listings" : "My listings"}
          </h1>
          <p className="mt-1 text-slate-600">
            {isReseller
              ? "Manage all client sales and respond to buyer enquiries"
              : "Manage your vehicles and respond to buyer enquiries"}
          </p>
        </div>
        <Link
          href="/sell"
          className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          + {isReseller ? "List for client" : "List a car"}
        </Link>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-12 text-center text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-600">No listings yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Start by listing {isReseller ? "a client vehicle" : "your first vehicle"}.
          </p>
          <Link
            href="/sell"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {isReseller ? "List for client" : "Sell your car"}
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Vehicle</th>
                <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">
                  Plate
                </th>
                <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">
                  Price
                </th>
                <th className="hidden px-4 py-3 font-medium text-slate-600 md:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 font-medium text-slate-600 md:table-cell">
                  Views
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => {
                const photo = d.photos.find((p) => p.isPrimary) ?? d.photos[0];
                const title = vehicleTitle(d.vehicle);
                return (
                  <tr key={d.listing.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {photo && (
                            <Image
                              src={photo.url}
                              alt={title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{title}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-sm text-slate-600 sm:table-cell">
                      {d.vehicle.plateNumber}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 sm:table-cell">
                      <ListingPriceEditor
                        listingId={d.listing.id}
                        askingPrice={d.listing.askingPrice}
                        status={d.listing.status}
                        onUpdated={(askingPrice) =>
                          setListings((prev) =>
                            prev.map((item) =>
                              item.listing.id === d.listing.id
                                ? {
                                    ...item,
                                    listing: { ...item.listing, askingPrice },
                                  }
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <StatusBadge status={d.listing.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {d.listing.viewCount}
                    </td>
                    <td className="px-4 py-3">
                      {d.listing.status === "active" ? (
                        <Link
                          href={`/listings/${d.listing.id}`}
                          className="text-teal-600 hover:underline"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-slate-400">Pending approval</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">Buyer conversations</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reply to enquiries about your listings. Buyers see your responses under My Enquiries.
        </p>

        {loading ? (
          <p className="mt-6 text-center text-sm text-slate-500">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No conversations yet. They will appear here when buyers contact you.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {conversations.map((conv) => {
              const listingDetail = listingById.get(conv.listingId);
              const listingTitle = listingDetail
                ? vehicleTitle(listingDetail.vehicle)
                : "Unknown listing";
              return (
                <ConversationPanel
                  key={conv.id}
                  conversation={conv}
                  listingTitle={listingTitle}
                  mode="seller"
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
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    draft: "bg-slate-100 text-slate-600",
    sold: "bg-blue-100 text-blue-700",
    removed: "bg-red-100 text-red-700",
    pending_review: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
