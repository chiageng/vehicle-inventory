"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { ValuationPanel } from "@/components/ValuationPanel";
import { lookupPlate } from "@/lib/catalog";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { valuate } from "@/lib/valuation";
import type { VehicleSpec } from "@/lib/types";

/** SOP 4 — buyer plate lookup: vehicle data + market valuation for any plate. */
export default function PlateCheckPage() {
  const { listings, addPlateAlert, plateAlerts } = useDemo();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<{ plate: string; spec: VehicleSpec | null } | null>(null);

  const runCheck = () => {
    if (!input.trim()) return;
    const spec = lookupPlate(input);
    setChecked({ plate: input.trim().toUpperCase(), spec });
  };

  const matchedListing = checked?.spec
    ? listings.find((l) => l.status === "active" && l.spec.plate === checked.spec!.plate)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon name="search" className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Check any plate number</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          See a car&apos;s registered data and EZAUTO market valuation before you commit — whether
          it&apos;s listed here or you found it elsewhere. No account needed.
        </p>
      </div>

      <div className="mx-auto mt-6 flex max-w-md gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. VBU 3421"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-center font-mono text-lg uppercase tracking-widest"
        />
        <button
          onClick={runCheck}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Check
        </button>
      </div>

      {checked && !checked.spec && (
        <div className="mx-auto mt-8 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <Icon name="warning" className="mx-auto h-6 w-6 text-amber-500" />
          <p className="mt-2 text-sm font-semibold text-amber-800">
            No record for {checked.plate} in the EZAUTO datahouse
          </p>
          <p className="mt-1 text-xs text-amber-700">
            The plate may be new, re-registered, or mistyped. Try VBU 3421 in this mockup.
          </p>
        </div>
      )}

      {checked?.spec && (
        <div className="mt-8 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Icon name="check" className="h-4 w-4" />
                Record found — EZAUTO Central Vehicle Datahouse
              </p>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-slate-700">
                {checked.spec.plate}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{vehicleTitle(checked.spec)}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Engine", `${checked.spec.engineCc} cc`],
                ["Transmission", checked.spec.transmission],
                ["Fuel", checked.spec.fuelType],
                ["Colour", checked.spec.color],
              ].map(([l, v]) => (
                <div key={l}>
                  <dt className="text-[11px] font-medium text-slate-400">{l}</dt>
                  <dd className="mt-0.5 font-semibold capitalize text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ValuationPanel valuation={valuate(checked.spec)} />

          {matchedListing ? (
            <Link
              href={`/buyer/listings/${matchedListing.id}`}
              className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 transition hover:bg-blue-100"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image src={matchedListing.photos[0]} alt="" fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900">
                  This car is live on EzAutoInventory — {formatCurrency(matchedListing.askingPrice)}
                </p>
                <p className="text-xs text-blue-700">View the full listing, photos and enquire →</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Not listed on the marketplace yet</p>
                <p className="text-xs text-slate-500">Get notified if this car appears for sale.</p>
              </div>
              <button
                onClick={() => {
                  addPlateAlert(checked.spec!.plate);
                  showToast(`Alert set for ${checked.spec!.plate}`);
                }}
                disabled={plateAlerts.includes(checked.spec.plate)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {plateAlerts.includes(checked.spec.plate) ? "Alert set ✓" : "Notify me"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
