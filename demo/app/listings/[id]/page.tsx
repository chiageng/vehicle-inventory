"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InquiryForm } from "@/components/InquiryForm";
import {
  formatCondition,
  formatCurrency,
  formatMileage,
  vehicleTitle,
} from "@/lib/format";
import { mockApi } from "@/lib/mock-api";
import { useRedirectAdminAway } from "@/lib/useRedirectAdminAway";
import type { ListingDetail } from "@/lib/types";

export default function ListingDetailPage() {
  useRedirectAdminAway();
  const params = useParams();
  const listingId = params.id as string;
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const data = mockApi.getListing(listingId);
    setDetail(data);
  }, [listingId]);

  if (!detail) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-slate-600">Listing not found.</p>
        <Link href="/browse" className="mt-4 inline-block text-teal-600 hover:underline">
          Back to browse
        </Link>
      </div>
    );
  }

  const { vehicle, valuation, photos, seller, owner, listing } = detail;
  const title = vehicleTitle(vehicle);
  const currentPhoto = photos[activePhoto] ?? photos[0];
  const isResellerListing = listing.listingType === "reseller";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/browse" className="text-sm text-teal-600 hover:underline">
        ← Back to browse
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
            {currentPhoto && (
              <Image
                src={currentPhoto.url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhoto(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activePhoto ? "border-teal-500" : "border-transparent"
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={`${title} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 inline-block rounded-md bg-slate-100 px-3 py-1 font-mono text-sm font-semibold tracking-wider text-slate-700">
              {vehicle.plateNumber}
            </p>
            <p className="mt-2 text-slate-500">
              {isResellerListing && owner ? (
                <>
                  Listed by {seller.name} (reseller) on behalf of {owner.name}
                </>
              ) : (
                <>Listed by {seller.name}</>
              )}
              {" · "}
              {listing.viewCount} views
            </p>

            {vehicle.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                <p className="mt-2 text-slate-600 whitespace-pre-wrap">
                  {vehicle.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Specifications</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Spec label="Number plate" value={vehicle.plateNumber} />
                <Spec label="Mileage" value={formatMileage(vehicle.mileage)} />
                <Spec label="Color" value={vehicle.color || "—"} />
                <Spec label="Transmission" value={vehicle.transmission} />
                <Spec label="Fuel" value={vehicle.fuelType} />
                <Spec label="Condition" value={formatCondition(vehicle.conditionGrade)} />
              </dl>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Asking price</p>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(listing.askingPrice)}
            </p>
            {valuation && (
              <div className="mt-4 rounded-lg bg-teal-50 p-3">
                <p className="text-xs font-medium text-teal-700">CarInventory estimate</p>
                <p className="mt-1 text-sm text-teal-900">
                  {formatCurrency(valuation.estimatedLow)} –{" "}
                  {formatCurrency(valuation.estimatedHigh)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {isResellerListing ? "Contact reseller" : "Contact seller"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isResellerListing && owner
                ? `Message ${seller.name} — they are helping ${owner.name} sell this vehicle.`
                : `Send a message to ${seller.name}`}
            </p>
            <div className="mt-4">
              <InquiryForm
                listingId={listing.id}
                contactLabel={isResellerListing ? "reseller" : "seller"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900 capitalize">{value}</dd>
    </div>
  );
}
