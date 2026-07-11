"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { PageHeader, StatusBadge } from "@/components/ui";
import { formatCurrency, timeAgo, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { ListingStatus } from "@/lib/types";

const FILTERS: { value: ListingStatus | "all" | "reported"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reported", label: "⚠ Reported" },
  { value: "active", label: "Live" },
  { value: "pending", label: "In review" },
  { value: "sold", label: "Sold" },
  { value: "rejected", label: "Rejected" },
  { value: "removed", label: "Taken down" },
];

export default function AdminListingsPage() {
  const { listings, takedownListing } = useDemo();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<ListingStatus | "all" | "reported">("all");

  const rows = listings.filter((l) =>
    filter === "all"
      ? true
      : filter === "reported"
        ? l.reports.length > 0 && l.status === "active"
        : l.status === filter
  );

  return (
    <div>
      <PageHeader
        title="All listings"
        description="Takedown candidates surface from buyer reports and auto re-checks — every decision is logged with a reason."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Buyer reports</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{vehicleTitle(l.spec)}</p>
                  <p className="font-mono text-xs text-slate-400">
                    {l.spec.plate} · {l.id} · {timeAgo(l.listedAt)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{l.sellerName}</p>
                  <p className="text-xs text-slate-400">
                    {l.sellerType === "dealer" ? "verified dealer" : "private"}
                  </p>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {formatCurrency(l.askingPrice)}
                </td>
                <td className="px-4 py-3">
                  {l.reports.length === 0 ? (
                    <span className="text-xs text-slate-300">none</span>
                  ) : (
                    <div>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                        {l.reports.length} report(s)
                      </span>
                      <ul className="mt-1 max-w-[220px] list-disc space-y-0.5 pl-4 text-[11px] text-red-600">
                        {l.reports.map((r) => (
                          <li key={r.at + r.reason}>{r.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                  {l.status === "removed" && l.rejectReason && (
                    <p className="mt-1 max-w-[180px] text-[11px] text-red-500">{l.rejectReason}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {l.status === "active" && (
                    <button
                      onClick={() => {
                        takedownListing(l.id, "Policy breach — removed by admin");
                        showToast("Listing taken down — decision logged (mock)");
                      }}
                      className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Take down
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
