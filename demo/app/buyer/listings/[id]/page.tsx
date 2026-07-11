"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { PriceBadge } from "@/components/PriceBadge";
import { useToast } from "@/components/Toast";
import { ValuationPanel } from "@/components/ValuationPanel";
import { Chip } from "@/components/ui";
import { formatCurrency, formatMileage, timeAgo, vehicleTitle } from "@/lib/format";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";
import { priceDeviation, formatPct } from "@/lib/valuation";

const REPORT_REASONS = [
  "Suspected scam or fraud",
  "Wrong or misleading information",
  "Car already sold elsewhere",
  "Odometer concern",
  "Seller asked to deal off-platform",
];

export default function BuyerListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getListing, startConversation, toggleFavourite, favourites, reportListing } = useDemo();
  const { showToast } = useToast();
  const [activePhoto, setActivePhoto] = useState(0);
  const [message, setMessage] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reported, setReported] = useState(false);

  const listing = getListing(params.id as string);

  if (!listing || listing.status !== "active") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-slate-600">This listing is not available.</p>
        <Link href="/buyer" className="mt-4 inline-block text-blue-700 hover:underline">
          ← Back to browse
        </Link>
      </div>
    );
  }

  const title = vehicleTitle(listing.spec);
  const dev = priceDeviation(listing.askingPrice, listing.valuation.value);
  const isFav = favourites.includes(listing.id);

  const sendEnquiry = (text: string, kind: "text" | "viewing" = "text") => {
    if (!text.trim()) return;
    startConversation(listing.id, PERSONAS.buyer.name, text.trim(), kind);
    setMessage("");
    showToast(
      `${listing.sellerType === "dealer" ? "Dealer" : "Seller"} notified by email & SMS (mock)`
    );
    router.push("/buyer/messages");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/buyer" className="text-sm text-blue-700 hover:underline">
        ← Back to browse
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={listing.photos[activePhoto] ?? listing.photos[0]}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <PriceBadge price={listing.askingPrice} valuation={listing.valuation} className="absolute left-3 top-3 shadow" />
          </div>
          {listing.photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {listing.photos.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setActivePhoto(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activePhoto ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <Image src={url} alt={`${title} photo ${i + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {listing.spec.plate !== "—" && (
                    <p className="inline-block rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-slate-700">
                      {listing.spec.plate}
                    </p>
                  )}
                  {listing.carType !== "used" && (
                    <span
                      className={`rounded-md px-2.5 py-1 text-sm font-semibold ${
                        listing.carType === "new"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {listing.carType === "new" ? "Brand new" : "Recon import"} · unregistered
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleFavourite(listing.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  isFav ? "border-red-200 bg-red-50 text-red-600" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon name="heart" className="h-4 w-4" />
                {isFav ? "Saved" : "Save"}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {listing.location} · listed {timeAgo(listing.listedAt)} · {listing.views} views
            </p>

            {/* Specs */}
            <h2 className="mt-6 text-base font-bold text-slate-900">Specifications</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
              <Spec label="Variant" value={listing.spec.variant} />
              <Spec label="Year" value={String(listing.spec.year)} />
              <Spec label="Engine" value={`${listing.spec.engineCc} cc`} />
              <Spec label="Fuel" value={listing.spec.fuelType} />
              <Spec label="Transmission" value={listing.spec.transmission} />
              <Spec label="Mileage" value={formatMileage(listing.condition.mileageKm)} />
              <Spec label="Colour" value={listing.spec.color} />
              <Spec label="Condition" value={listing.condition.grade} />
            </dl>

            {/* Condition report */}
            <h2 className="mt-6 text-base font-bold text-slate-900">Condition report</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone={listing.condition.accidentFree ? "emerald" : "red"}>
                <Icon name={listing.condition.accidentFree ? "check" : "warning"} className="h-3.5 w-3.5" />
                {listing.condition.accidentFree ? "Accident-free (declared)" : "Accident history"}
              </Chip>
              <Chip tone={listing.condition.floodFree ? "emerald" : "red"}>
                <Icon name={listing.condition.floodFree ? "check" : "warning"} className="h-3.5 w-3.5" />
                {listing.condition.floodFree ? "No flood damage (declared)" : "Flood damaged"}
              </Chip>
              <Chip tone="slate">{listing.condition.owners} previous owner(s)</Chip>
            </div>

            {listing.description && (
              <>
                <h2 className="mt-6 text-base font-bold text-slate-900">Description</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {listing.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Asking price</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(listing.askingPrice)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {dev.pct <= 0
                ? `${formatPct(dev.pct)} below EZAUTO market value`
                : `${formatPct(dev.pct)} above EZAUTO market value`}{" "}
              ({formatCurrency(listing.valuation.value)})
            </p>
          </div>

          <ValuationPanel valuation={listing.valuation} compact />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                {listing.sellerName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{listing.sellerName}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  {listing.sellerType === "dealer" && <Icon name="shield" className="h-3.5 w-3.5 text-blue-600" />}
                  {listing.sellerType === "dealer" ? "Verified dealer" : "Private seller"}
                  {listing.consignmentOwner && " · consignment sale"}
                </p>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={`Hi, is the ${listing.spec.model} still available?`}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => sendEnquiry(message || `Hi, is the ${listing.spec.model} still available?`)}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Send enquiry
            </button>
            <button
              onClick={() => sendEnquiry("Hi, I'd like to arrange a viewing / test drive.", "viewing")}
              className="mt-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Request viewing / test drive
            </button>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Icon name="shield" className="h-3.5 w-3.5" />
              Your phone number & email stay masked in chat
            </p>
          </div>

          {/* Report — feeds the admin takedown review (SOP 6) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {reported ? (
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Icon name="check" className="h-4 w-4" />
                Report sent — our moderation team will review this listing.
              </p>
            ) : showReport ? (
              <div>
                <p className="text-xs font-semibold text-slate-700">Why are you reporting this listing?</p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      reportListing(listing.id, reportReason);
                      setReported(true);
                      showToast("Report sent to moderation (mock)");
                    }}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Submit report
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-600"
              >
                <Icon name="warning" className="h-3.5 w-3.5" />
                Report this listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold capitalize text-slate-800">{value}</dd>
    </div>
  );
}
