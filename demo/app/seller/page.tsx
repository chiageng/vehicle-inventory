"use client";

import Image from "next/image";
import Link from "next/link";
import { PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { formatCurrency, timeAgo, vehicleTitle } from "@/lib/format";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";
import { formatPct, priceDeviation } from "@/lib/valuation";

export default function SellerDashboardPage() {
  const { listings, conversations } = useDemo();
  const mine = listings.filter((l) => l.sellerName === PERSONAS.seller.name);
  const active = mine.filter((l) => l.status === "active");
  const myIds = new Set(mine.map((l) => l.id));
  const enquiries = conversations.filter((c) => myIds.has(c.listingId));
  const unread = enquiries.filter((c) => c.unread).length;
  const totalViews = mine.reduce((sum, l) => sum + l.views, 0);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${PERSONAS.seller.name.split(" ")[0]}`}
        description="Your listings, valuations and buyer enquiries at a glance."
        action={
          <Link
            href="/seller/sell"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Sell a car
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live listings" value={active.length} sub={`${mine.length} total`} />
        <StatCard label="Total views" value={totalViews.toLocaleString()} />
        <StatCard label="Enquiries" value={enquiries.length} sub={unread ? `${unread} unread` : "all read"} accent={unread > 0} />
        <StatCard
          label="Cars sold"
          value={mine.filter((l) => l.status === "sold").length}
          sub="via EzAutoInventory"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="My listings"
          className="lg:col-span-2"
          action={
            <Link href="/seller/listings" className="text-xs font-medium text-blue-700 hover:underline">
              Manage all →
            </Link>
          }
        >
          <ul className="divide-y divide-slate-100">
            {mine.map((l) => {
              const dev = priceDeviation(l.askingPrice, l.valuation.value);
              return (
                <li key={l.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-[72px] shrink-0 overflow-hidden rounded-md bg-slate-100">
                    <Image src={l.photos[0]} alt="" fill className="object-cover" sizes="72px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{vehicleTitle(l.spec)}</p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(l.askingPrice)} ·{" "}
                      {dev.status === "market"
                        ? "at market"
                        : dev.status === "over"
                          ? `${formatPct(dev.pct)} above market`
                          : `${formatPct(dev.pct)} below market`}{" "}
                      · {l.views} views
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard
          title="Recent enquiries"
          action={
            <Link href="/seller/messages" className="text-xs font-medium text-blue-700 hover:underline">
              Open inbox →
            </Link>
          }
        >
          {enquiries.length === 0 ? (
            <p className="text-xs text-slate-400">No enquiries yet.</p>
          ) : (
            <ul className="space-y-3">
              {enquiries.slice(0, 4).map((c) => {
                const listing = listings.find((l) => l.id === c.listingId);
                const last = c.messages[c.messages.length - 1];
                return (
                  <li key={c.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{c.buyerName}</p>
                      {c.unread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {listing ? vehicleTitle(listing.spec) : c.listingId}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {last?.text} · {last ? timeAgo(last.at) : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            New enquiries notify you by email &amp; SMS so you never miss a sale.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
