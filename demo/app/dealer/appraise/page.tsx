"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { PlateExamples } from "@/components/PlateExamples";
import { useToast } from "@/components/Toast";
import { ValuationPanel } from "@/components/ValuationPanel";
import { PageHeader } from "@/components/ui";
import { lookupPlate } from "@/lib/catalog";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { valuate } from "@/lib/valuation";
import type { ConditionGrade, VehicleSpec } from "@/lib/types";

/**
 * AutoGrab-style instant appraisal: plate + mileage + grade in, the retrieved
 * market value plus a derived trade-in guide out — before acquiring or
 * consigning a unit.
 */
export default function DealerAppraisePage() {
  const { showToast } = useToast();
  const [plate, setPlate] = useState("");
  const [mileage, setMileage] = useState("");
  const [grade, setGrade] = useState<ConditionGrade>("good");
  const [result, setResult] = useState<{ spec: VehicleSpec | null; missed?: boolean } | null>(null);

  const runAppraisal = () => {
    const spec = lookupPlate(plate);
    setResult(spec ? { spec } : { spec: null, missed: true });
  };

  const valuation =
    result?.spec && mileage
      ? valuate(result.spec, {
          mileageKm: Number(mileage),
          grade,
          owners: 1,
          accidentFree: true,
          floodFree: true,
        })
      : result?.spec
        ? valuate(result.spec)
        : null;

  return (
    <div>
      <PageHeader
        title="Instant appraisal"
        description="Value a trade-in or consignment before you commit — plate in, EZAUTO market value out."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Plate number</span>
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="e.g. WPM 9083"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm uppercase tracking-wider"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-slate-600">Mileage (km) — optional, refines the value</span>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g. 74000"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-slate-600">Condition grade</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as ConditionGrade)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </label>
          <button
            onClick={runAppraisal}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Appraise
          </button>
          <PlateExamples
            onPick={setPlate}
            samples={[
              { plate: "WPM 9083", note: "Proton Saga — walk-in trade-in" },
              { plate: "VHR 2210", note: "Perodua Axia" },
            ]}
          />
        </div>

        <div>
          {result?.missed && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Icon name="warning" className="h-4 w-4" />
                No EZAUTO record for that plate
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Use manual entry in the Add Vehicle flow, or re-check the plate.
              </p>
            </div>
          )}

          {result?.spec && valuation && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">{vehicleTitle(result.spec)}</h2>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-slate-700">
                    {result.spec.plate}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {result.spec.engineCc} cc · {result.spec.transmission} · {result.spec.color} ·
                  spec auto-filled from EZAUTO datahouse
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Trade-in guide (−10%)
                    </p>
                    <p className="mt-1 text-xl font-bold text-emerald-900">
                      {formatCurrency(Math.round(valuation.value * 0.9))}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Derived from the retrieved value — your margin buffer to acquire this unit
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Retail market value
                    </p>
                    <p className="mt-1 text-xl font-bold text-blue-900">
                      {formatCurrency(valuation.value)}
                    </p>
                    <p className="mt-1 text-[11px] text-blue-700">
                      As retrieved from EZAUTO — compare your asking price against this
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dealer/inventory/new?plate=${encodeURIComponent(result.spec.plate)}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Add to inventory →
                  </Link>
                  <button
                    onClick={() => showToast("Appraisal saved to your history (mock)")}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Save appraisal
                  </button>
                </div>
              </div>

              <ValuationPanel valuation={valuation} />
            </div>
          )}

          {!result && (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
              <div className="text-center">
                <Icon name="sparkles" className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Appraisal result appears here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
