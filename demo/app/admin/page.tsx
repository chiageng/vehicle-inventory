"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  formatCondition,
  formatCurrency,
  formatMileage,
  vehicleTitle,
} from "@/lib/format";
import { mockApi } from "@/lib/mock-api";
import type { ListingDetail, ListingStatus } from "@/lib/types";
import { useToast } from "@/components/Toast";

type Tab = "all" | ListingStatus;

export default function AdminPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function refresh() {
    setListings(mockApi.getAllListings());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered =
    tab === "all" ? listings : listings.filter((d) => d.listing.status === tab);

  const pendingCount = listings.filter((d) => d.listing.status === "pending_review").length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "pending_review", label: "Pending", count: pendingCount },
    { key: "active", label: "Active" },
    { key: "removed", label: "Removed" },
  ];

  function handleStatus(listingId: string, status: ListingStatus) {
    mockApi.updateListingStatus(listingId, status);
    showToast(status === "active" ? "Listing approved" : "Listing removed");
    setExpandedId(null);
    refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Listing moderation</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review, approve, reject, or remove marketplace listings
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-12 text-center text-slate-500">
            No listings in this tab.
          </p>
        ) : (
          filtered.map((d) => {
            const isOpen = expandedId === d.listing.id;
            const photo = d.photos.find((p) => p.isPrimary) ?? d.photos[0];

            return (
              <div
                key={d.listing.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{vehicleTitle(d.vehicle)}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-mono">{d.vehicle.plateNumber}</span>
                      <span>{formatCurrency(d.listing.askingPrice)}</span>
                      <span className="capitalize">{d.listing.status.replace("_", " ")}</span>
                      <span
                        className={
                          d.listing.listingType === "reseller"
                            ? "text-purple-600"
                            : undefined
                        }
                      >
                        {d.listing.listingType}
                      </span>
                      <span>
                        {d.seller.name}
                        {d.owner ? ` → owner: ${d.owner.name}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : d.listing.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {isOpen ? "Hide" : "Details"}
                    </button>
                    {d.listing.status === "pending_review" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatus(d.listing.id, "active")}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatus(d.listing.id, "removed")}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {d.listing.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handleStatus(d.listing.id, "removed")}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {photo && (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-200 sm:col-span-1">
                          <Image
                            src={photo.url}
                            alt={vehicleTitle(d.vehicle)}
                            fill
                            className="object-cover"
                            sizes="240px"
                          />
                        </div>
                      )}
                      <dl className="space-y-2 text-sm sm:col-span-1">
                        <Detail label="Mileage" value={formatMileage(d.vehicle.mileage)} />
                        <Detail label="Color" value={d.vehicle.color || "—"} />
                        <Detail label="Transmission" value={d.vehicle.transmission} />
                        <Detail label="Fuel" value={d.vehicle.fuelType} />
                        <Detail label="Condition" value={formatCondition(d.vehicle.conditionGrade)} />
                        <Detail label="Views" value={String(d.listing.viewCount)} />
                        {d.valuation && (
                          <Detail
                            label="Estimate"
                            value={`${formatCurrency(d.valuation.estimatedLow)} – ${formatCurrency(d.valuation.estimatedHigh)}`}
                          />
                        )}
                      </dl>
                      {d.vehicle.description && (
                        <div className="text-sm sm:col-span-2 lg:col-span-1">
                          <dt className="font-medium text-slate-600">Description</dt>
                          <dd className="mt-1 text-slate-700">{d.vehicle.description}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium capitalize text-slate-900">{value}</dd>
    </div>
  );
}
