"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { mockApi } from "@/lib/mock-api";
import type { ListingDetail } from "@/lib/types";

type Tab = "all" | "active" | "draft" | "sold";

export default function DashboardPage() {
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    const id = session?.id ?? "user-demo-001";
    setSellerId(id);
    setListings(mockApi.getSellerListings(id));
  }, []);

  const filtered = listings.filter((d) => {
    if (tab === "all") return true;
    return d.listing.status === tab;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Draft" },
    { key: "sold", label: "Sold" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My listings</h1>
          <p className="mt-1 text-slate-600">Manage your vehicles and track performance</p>
        </div>
        <Link
          href="/sell"
          className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          + List a car
        </Link>
      </div>

      <div className="mt-8 flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-600">No listings yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {sellerId
              ? "Start by listing your first vehicle."
              : "Log in to see your listings."}
          </p>
          <Link
            href="/sell"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Sell your car
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
                      {formatCurrency(d.listing.askingPrice)}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <StatusBadge status={d.listing.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {d.listing.viewCount}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/listings/${d.listing.id}`}
                        className="text-teal-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
