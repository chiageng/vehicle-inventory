"use client";

import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { Chip, EmptyState, StatusBadge } from "@/components/ui";
import { formatCurrency, timeAgo, vehicleTitle } from "@/lib/format";
import { AGING_BANDS, agingBand, stockAgeDays } from "@/lib/stock-aging";
import { useDemo } from "@/lib/store";
import { formatPct, priceDeviation } from "@/lib/valuation";
import type { Listing } from "@/lib/types";

/** Listing management table shared by the seller and dealer portals. */
export function ManageListingsTable({
  listings,
  showConsignment = false,
  showAging = false,
}: {
  listings: Listing[];
  showConsignment?: boolean;
  /** Dealer portal: show each unit's stock age from its take-in record. */
  showAging?: boolean;
}) {
  const { updatePrice, markSold, withdrawListing, conversations } = useDemo();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

  if (listings.length === 0) {
    return <EmptyState title="No listings yet" hint="Create your first listing to see it here." />;
  }

  const leadCount = (id: string) => conversations.filter((c) => c.listingId === id).length;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">Vehicle</th>
            {showConsignment && <th className="px-4 py-3">Consignment</th>}
            {showAging && <th className="px-4 py-3">Stock age</th>}
            <th className="px-4 py-3">Price vs market</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Leads</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {listings.map((l) => {
            const dev = priceDeviation(l.askingPrice, l.valuation.value);
            const isEditing = editingId === l.id;
            return (
              <tr key={l.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      <Image src={l.photos[0]} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{vehicleTitle(l.spec)}</p>
                      <p className="font-mono text-xs text-slate-400">
                        {l.spec.plate} · listed {timeAgo(l.listedAt)}
                      </p>
                    </div>
                  </div>
                </td>
                {showConsignment && (
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {l.consignmentOwner ? (
                      <Chip tone="blue">for {l.consignmentOwner}</Chip>
                    ) : (
                      <span className="text-slate-300">own stock</span>
                    )}
                  </td>
                )}
                {showAging && (
                  <td className="px-4 py-3">
                    {l.acquisition ? (
                      (() => {
                        const days = stockAgeDays(l.acquisition.takeInDate);
                        const band = agingBand(days);
                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${AGING_BANDS[band].chip}`}
                            title={AGING_BANDS[band].hint}
                          >
                            {AGING_BANDS[band].label} · {days}d
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <span className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={priceDraft}
                        onChange={(e) => setPriceDraft(e.target.value)}
                        className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          updatePrice(l.id, Number(priceDraft));
                          setEditingId(null);
                          showToast("Price updated");
                        }}
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-slate-400">
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <>
                      <p className="font-bold text-slate-900">{formatCurrency(l.askingPrice)}</p>
                      <p
                        className={`text-xs ${
                          dev.status === "market"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {dev.status === "market"
                          ? "at market"
                          : `${formatPct(dev.pct)} ${dev.pct > 0 ? "above" : "below"} market`}
                      </p>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{l.views}</td>
                <td className="px-4 py-3 text-slate-600">{leadCount(l.id)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                  {l.status === "rejected" && l.rejectReason && (
                    <p className="mt-1 max-w-[160px] text-[11px] text-red-500">{l.rejectReason}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {l.status === "active" && (
                    <span className="inline-flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingId(l.id);
                          setPriceDraft(String(l.askingPrice));
                        }}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit price
                      </button>
                      <button
                        onClick={() => {
                          markSold(l.id);
                          showToast("Marked as sold — congratulations!");
                        }}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Mark sold
                      </button>
                      <button
                        onClick={() => {
                          withdrawListing(l.id);
                          showToast("Listing withdrawn");
                        }}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                      >
                        Withdraw
                      </button>
                    </span>
                  )}
                  {l.status === "pending" && (
                    <span className="text-xs text-slate-400">Awaiting review</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
