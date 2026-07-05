import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatMileage, vehicleTitle } from "@/lib/format";
import type { ListingDetail } from "@/lib/types";

interface ListingCardProps {
  listing: ListingDetail;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { vehicle, valuation } = listing;
  const primaryPhoto =
    listing.photos.find((p) => p.isPrimary) ?? listing.photos[0];
  const title = vehicleTitle(vehicle);

  return (
    <Link
      href={`/listings/${listing.listing.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No photo
          </div>
        )}
        {valuation && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
            Est. {formatCurrency(valuation.estimatedMid)}
          </span>
        )}
        {listing.listing.listingType === "reseller" && (
          <span className="absolute top-2 right-2 rounded-md bg-purple-600/90 px-2 py-1 text-xs font-medium text-white">
            Reseller
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-teal-600">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {formatMileage(vehicle.mileage)} · {vehicle.color}
        </p>
        <p className="mt-1 text-xs font-mono font-medium tracking-wide text-slate-400">
          {vehicle.plateNumber}
        </p>
        <p className="mt-3 text-xl font-bold text-slate-900">
          {formatCurrency(listing.listing.askingPrice)}
        </p>
      </div>
    </Link>
  );
}
