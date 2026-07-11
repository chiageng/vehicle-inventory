"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { Chip, EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency, formatMileage, timeAgo, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { formatPct, priceDeviation } from "@/lib/valuation";

const REJECT_REASONS = [
  "Duplicate listing",
  "Suspected fraudulent pricing",
  "Insufficient photos",
  "Vehicle details don't match plate record",
  "Policy breach",
];

export default function AdminQueuePage() {
  const { listings, decideListing } = useDemo();
  const { showToast } = useToast();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState(REJECT_REASONS[0]);

  const pending = listings.filter((l) => l.status === "pending");

  return (
    <div>
      <PageHeader
        title="Manual review queue"
        description="Clean listings go live automatically — only submissions flagged by fraud & quality checks are held here."
      />

      {pending.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          hint="Only flagged submissions land here — clean listings publish instantly."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((l) => {
            const dev = priceDeviation(l.askingPrice, l.valuation.value);
            return (
              <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap gap-5">
                  <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={l.photos[0]} alt="" fill className="object-cover" sizes="176px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{vehicleTitle(l.spec)}</h2>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                        {l.spec.plate}
                      </span>
                      <span className="text-xs text-slate-400">{l.id}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {l.sellerType === "dealer" ? "Dealer" : "Private seller"}: {l.sellerName} ·{" "}
                      {l.location} · submitted {timeAgo(l.listedAt)} · {l.photos.length} photo(s) ·{" "}
                      {formatMileage(l.condition.mileageKm)}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-bold text-slate-900">{formatCurrency(l.askingPrice)}</span>{" "}
                      <span
                        className={
                          dev.status === "market" ? "text-emerald-600" : "font-semibold text-amber-600"
                        }
                      >
                        {dev.status === "market"
                          ? "· at market value"
                          : `· ${formatPct(dev.pct)} ${dev.pct > 0 ? "above" : "below"} EZAUTO value (${formatCurrency(l.valuation.value)})`}
                      </span>
                    </p>

                    {l.flags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {l.flags.map((f) => (
                          <Chip key={f} tone="amber">
                            <Icon name="warning" className="h-3 w-3" />
                            {f}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col justify-center gap-2">
                    {rejectingId === l.id ? (
                      <div className="w-56 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-xs font-semibold text-red-700">Rejection reason</p>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-1.5 w-full rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs"
                        >
                          {REJECT_REASONS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => {
                              decideListing(l.id, "reject", reason);
                              setRejectingId(null);
                              showToast("Rejected — seller notified with reason (mock)");
                            }}
                            className="flex-1 rounded-md bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Confirm reject
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="rounded-md px-2 py-1.5 text-xs text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            decideListing(l.id, "approve");
                            showToast("Approved & live — seller notified by email & SMS (mock)");
                          }}
                          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(l.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          Reject…
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
