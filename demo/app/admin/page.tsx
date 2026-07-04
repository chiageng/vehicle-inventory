"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { mockApi } from "@/lib/mock-api";
import type { Inquiry, ListingDetail, ListingStatus } from "@/lib/types";
import { useToast } from "@/components/Toast";

type Tab = "all" | ListingStatus;

export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  function refresh() {
    setListings(mockApi.getAllListings());
    setInquiries(mockApi.getAllInquiries());
  }

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.replace("/login");
      return;
    }
    refresh();
  }, [router]);

  const filtered =
    tab === "all" ? listings : listings.filter((d) => d.listing.status === tab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending_review", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "removed", label: "Removed" },
  ];

  function handleStatus(listingId: string, status: ListingStatus) {
    mockApi.updateListingStatus(listingId, status);
    showToast(status === "active" ? "Listing approved" : "Listing removed");
    refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Admin console</h1>
      <p className="mt-1 text-slate-600">Moderate listings and review buyer inquiries</p>

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

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Vehicle</th>
              <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">Seller</th>
              <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">Price</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <tr key={d.listing.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {vehicleTitle(d.vehicle)}
                  <span className="ml-2 font-mono text-xs text-slate-500">{d.vehicle.plateNumber}</span>
                </td>
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{d.seller.name}</td>
                <td className="hidden px-4 py-3 text-slate-700 sm:table-cell">
                  {formatCurrency(d.listing.askingPrice)}
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">
                  {d.listing.status.replace("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/listings/${d.listing.id}`} className="text-teal-600 hover:underline">
                      View
                    </Link>
                    {d.listing.status === "pending_review" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatus(d.listing.id, "active")}
                          className="text-emerald-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatus(d.listing.id, "removed")}
                          className="text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {d.listing.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handleStatus(d.listing.id, "removed")}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-slate-900">Inquiries</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {inquiries.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-500">No inquiries yet</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">From</th>
                <th className="px-4 py-3 font-medium text-slate-600">Listing</th>
                <th className="px-4 py-3 font-medium text-slate-600">Message</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquiries.map((inq) => {
                const listing = listings.find((d) => d.listing.id === inq.listingId);
                return (
                  <tr key={inq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{inq.contactName}</div>
                      <div className="text-xs text-slate-500">{inq.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {listing ? vehicleTitle(listing.vehicle) : inq.listingId}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">{inq.message}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{inq.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
