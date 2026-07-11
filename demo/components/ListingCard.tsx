"use client";

import Image from "next/image";
import Link from "next/link";
import { PriceBadge } from "@/components/PriceBadge";
import { Icon } from "@/components/icons";
import { formatCurrency, formatMileage, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { Listing } from "@/lib/types";

export function ListingCard({
  listing,
  compareChecked,
  onCompareToggle,
}: {
  listing: Listing;
  compareChecked?: boolean;
  onCompareToggle?: () => void;
}) {
  const { favourites, toggleFavourite } = useDemo();
  const isFav = favourites.includes(listing.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/buyer/listings/${listing.id}`} className="relative block aspect-[16/10] bg-slate-100">
        <Image
          src={listing.photos[0]}
          alt={vehicleTitle(listing.spec)}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <PriceBadge
          price={listing.askingPrice}
          valuation={listing.valuation}
          className="absolute left-2 top-2 shadow-sm"
        />
      </Link>
      <button
        onClick={() => toggleFavourite(listing.id)}
        aria-label="Save to favourites"
        className={`absolute right-2 top-2 rounded-full p-1.5 shadow-sm transition ${
          isFav ? "bg-red-500 text-white" : "bg-white/90 text-slate-400 hover:text-red-500"
        }`}
      >
        <Icon name="heart" className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/buyer/listings/${listing.id}`}>
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
            {vehicleTitle(listing.spec)}
          </h3>
        </Link>
        <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(listing.askingPrice)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
          <span className="rounded bg-slate-100 px-1.5 py-0.5">{formatMileage(listing.condition.mileageKm)}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 capitalize">{listing.spec.transmission}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5">{listing.location}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${listing.sellerType === "dealer" ? "text-blue-700" : "text-slate-500"}`}>
            {listing.sellerType === "dealer" && <Icon name="shield" className="h-3.5 w-3.5" />}
            {listing.sellerType === "dealer" ? "Verified dealer" : "Private seller"}
          </span>
          {onCompareToggle && (
            <label
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold transition ${
                compareChecked
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              <input
                type="checkbox"
                checked={compareChecked ?? false}
                onChange={onCompareToggle}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-white"
              />
              Compare
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
