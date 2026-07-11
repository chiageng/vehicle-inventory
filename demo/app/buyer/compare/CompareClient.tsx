"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { PriceBadge } from "@/components/PriceBadge";
import { formatCurrency, formatMileage, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { Listing } from "@/lib/types";

const SLOT_COUNT = 3;

export function CompareClient({ initialIds }: { initialIds: string[] }) {
  const { listings } = useDemo();
  const active = listings.filter((l) => l.status === "active");

  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => initialIds[i] ?? "")
  );

  const setSlot = (i: number, id: string) =>
    setSlots((prev) => prev.map((s, idx) => (idx === i ? id : s)));

  const slotListings = slots.map((id) => active.find((l) => l.id === id) ?? null);
  const chosenCount = slotListings.filter(Boolean).length;

  const ROWS: { label: string; render: (l: Listing) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (l) => (
        <span className="text-base font-bold text-slate-900">{formatCurrency(l.askingPrice)}</span>
      ),
    },
    {
      label: "vs market",
      render: (l) => <PriceBadge price={l.askingPrice} valuation={l.valuation} />,
    },
    { label: "EZAUTO value", render: (l) => formatCurrency(l.valuation.value) },
    { label: "Mileage", render: (l) => formatMileage(l.condition.mileageKm) },
    { label: "Year", render: (l) => String(l.spec.year) },
    { label: "Condition", render: (l) => <span className="capitalize">{l.condition.grade}</span> },
    { label: "Owners", render: (l) => String(l.condition.owners) },
    {
      label: "History",
      render: (l) =>
        l.condition.accidentFree && l.condition.floodFree
          ? "No accident · no flood"
          : [
              l.condition.accidentFree ? null : "accident history",
              l.condition.floodFree ? null : "flood damage",
            ]
              .filter(Boolean)
              .join(" · "),
    },
    { label: "Transmission", render: (l) => <span className="capitalize">{l.spec.transmission}</span> },
    {
      label: "Seller",
      render: (l) => (l.sellerType === "dealer" ? "Verified dealer" : "Private seller"),
    },
    { label: "Location", render: (l) => l.location },
    {
      label: "",
      render: (l) => (
        <Link
          href={`/buyer/listings/${l.id}`}
          className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          View listing →
        </Link>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/buyer/browse" className="text-sm text-blue-700 hover:underline">
        ← Back to browse
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Compare cars</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick up to {SLOT_COUNT} cars — swap any column at any time using its selector.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] table-fixed text-sm">
          <colgroup>
            <col className="w-28" />
            {slots.map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200">
              <th />
              {slots.map((slotId, i) => {
                const listing = slotListings[i];
                return (
                  <th key={i} className="px-3 py-4 text-left align-top font-normal">
                    <select
                      value={slotId}
                      onChange={(e) => setSlot(i, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium"
                    >
                      <option value="">— Select a car —</option>
                      {active.map((l) => (
                        <option
                          key={l.id}
                          value={l.id}
                          disabled={slots.includes(l.id) && slotId !== l.id}
                        >
                          {vehicleTitle(l.spec)} · {formatCurrency(l.askingPrice)}
                        </option>
                      ))}
                    </select>
                    {listing ? (
                      <>
                        <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100">
                          <Image
                            src={listing.photos[0]}
                            alt={vehicleTitle(listing.spec)}
                            fill
                            className="object-cover"
                            sizes="260px"
                          />
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {vehicleTitle(listing.spec)}
                        </p>
                      </>
                    ) : (
                      <div className="mt-3 flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Icon name="plus" className="h-4 w-4" />
                          Empty slot
                        </span>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ROWS.map((row) => (
              <tr key={row.label || "actions"}>
                <td className="px-3 py-2.5 align-middle text-xs font-medium text-slate-400">
                  {row.label}
                </td>
                {slotListings.map((l, i) => (
                  <td key={i} className="px-3 py-2.5 align-middle text-slate-700">
                    {l ? row.render(l) : <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chosenCount < 2 && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Select at least 2 cars to make the comparison meaningful.
        </p>
      )}
    </div>
  );
}
