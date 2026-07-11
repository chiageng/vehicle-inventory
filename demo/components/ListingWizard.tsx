"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { ValuationPanel } from "@/components/ValuationPanel";
import { LOCATIONS, MODEL_CC, TAXONOMY, YEAR_OPTIONS, lookupPlate } from "@/lib/catalog";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { PERSONAS, PHOTO_POOL } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";
import { DEVIATION_THRESHOLD, formatPct, priceDeviation, valuate } from "@/lib/valuation";
import type { ConditionGrade, Transmission, VehicleCondition, VehicleSpec } from "@/lib/types";

const STEPS = ["Vehicle", "Condition", "Photos", "Price", "Review"] as const;

/** Sentinel option value for "Other (custom)…" in the taxonomy dropdowns. */
const CUSTOM = "__custom__";

const GRADES: { value: ConditionGrade; label: string; hint: string }[] = [
  { value: "excellent", label: "Excellent", hint: "Like new, no flaws" },
  { value: "good", label: "Good", hint: "Well maintained, minor wear" },
  { value: "fair", label: "Fair", hint: "Visible wear, drivable" },
  { value: "poor", label: "Poor", hint: "Needs repair work" },
];

/** SOP 1 — listing creation wizard shared by the seller and dealer portals. */
export function ListingWizard({
  mode,
  initialPlate = "",
  doneHref,
}: {
  mode: "seller" | "dealer";
  initialPlate?: string;
  doneHref: string;
}) {
  const { submitListing } = useDemo();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);

  // Step 1 — vehicle identity. Arriving from the dealer appraisal with a
  // plate pre-filled, the lookup runs immediately.
  const initialHit = initialPlate ? lookupPlate(initialPlate) : null;
  const [plateInput, setPlateInput] = useState(initialPlate);
  const [lookupState, setLookupState] = useState<"idle" | "found" | "miss">(
    initialPlate ? (initialHit ? "found" : "miss") : "idle"
  );
  const [manual, setManual] = useState(Boolean(initialPlate && !initialHit));
  const [spec, setSpec] = useState<VehicleSpec | null>(initialHit);
  const [manualMake, setManualMake] = useState("");
  const [manualModel, setManualModel] = useState("");
  const [manualVariant, setManualVariant] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customVariant, setCustomVariant] = useState("");
  const [customEngineCc, setCustomEngineCc] = useState("");
  const [manualYear, setManualYear] = useState<number | "">("");
  const [manualTransmission, setManualTransmission] = useState<Transmission>("automatic");
  const [manualColor, setManualColor] = useState("");

  // Step 2 — condition
  const [mileage, setMileage] = useState("");
  const [grade, setGrade] = useState<ConditionGrade>("good");
  const [owners, setOwners] = useState(1);
  const [accidentFree, setAccidentFree] = useState(true);
  const [floodFree, setFloodFree] = useState(true);

  // Price step (now last input step)
  const [askingPrice, setAskingPrice] = useState("");

  // Photos & details step (before valuation/price)
  const [photoIdx, setPhotoIdx] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [isConsignment, setIsConsignment] = useState(false);
  const [consignmentOwner, setConsignmentOwner] = useState("");

  const [submitted, setSubmitted] = useState<{ id: string; live: boolean; flags: string[] } | null>(null);

  // "Other (custom)…" cascades: a custom make means model & variant are free
  // text too; a custom model means variant is free text.
  const isCustomMake = manualMake === CUSTOM;
  const isCustomModel = isCustomMake || manualModel === CUSTOM;
  const isCustomVariant = isCustomModel || manualVariant === CUSTOM;
  const effMake = isCustomMake ? customMake.trim() : manualMake;
  const effModel = isCustomModel ? customModel.trim() : manualModel;
  const effVariant = isCustomVariant ? customVariant.trim() : manualVariant;
  const knownCc = MODEL_CC[`${effMake}|${effModel}`];

  const manualSpec: VehicleSpec | null =
    manual && effMake && effModel && effVariant && manualYear
      ? {
          plate: plateInput.trim().toUpperCase() || "UNREGISTERED",
          make: effMake,
          model: effModel,
          variant: effVariant,
          year: Number(manualYear),
          engineCc: knownCc ?? (Number(customEngineCc) || 1500),
          transmission: manualTransmission,
          fuelType: effMake === "Toyota" && effModel === "Hilux" ? "diesel" : "petrol",
          color: manualColor || "Not specified",
        }
      : null;

  const effectiveSpec = manual ? manualSpec : spec;

  const condition: VehicleCondition | null = mileage
    ? { mileageKm: Number(mileage), grade, owners, accidentFree, floodFree }
    : null;

  // The valuation is revealed only at the price step — after vehicle details,
  // condition AND photos (with the AI condition check) are complete, so the
  // number always reflects verified, full information.
  const valuation = useMemo(() => {
    if (step < 3 || !effectiveSpec || !condition) return null;
    return valuate(effectiveSpec, condition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, effectiveSpec, condition?.mileageKm, condition?.grade, condition?.owners, condition?.accidentFree, condition?.floodFree]);

  const deviation =
    valuation && askingPrice ? priceDeviation(Number(askingPrice), valuation.value) : null;

  // Mock AI photo-condition check: a high grade claim needs photo evidence.
  const photoConditionOk = grade !== "excellent" || photoIdx.length >= 3;

  const runLookup = () => {
    const hit = lookupPlate(plateInput);
    if (hit) {
      setSpec(hit);
      setLookupState("found");
      setManual(false);
    } else {
      setSpec(null);
      setLookupState("miss");
      setManual(true);
    }
  };


  const canNext = [
    Boolean(effectiveSpec),
    Boolean(condition && condition.mileageKm > 0),
    photoIdx.length >= 1 && (mode === "seller" || !isConsignment || consignmentOwner.trim().length > 0),
    Boolean(askingPrice && Number(askingPrice) > 0),
    true,
  ][step];

  const submit = () => {
    if (!effectiveSpec || !condition || !valuation) return;
    const listing = submitListing({
      spec: effectiveSpec,
      condition,
      description,
      photos: photoIdx.map((i) => PHOTO_POOL[i]),
      location,
      sellerType: mode === "dealer" ? "dealer" : "private",
      sellerName: mode === "dealer" ? PERSONAS.dealer.name : PERSONAS.seller.name,
      consignmentOwner: mode === "dealer" && isConsignment ? consignmentOwner : undefined,
      askingPrice: Number(askingPrice),
      valuation,
    });
    setSubmitted({ id: listing.id, live: listing.status === "active", flags: listing.flags });
    showToast(
      listing.status === "active"
        ? "Auto-checks passed — your listing is live!"
        : "Held for manual review — you'll be notified once checked"
    );
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {submitted.live ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Icon name="check" className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Your listing is live 🎉</h2>
            <p className="mt-2 text-sm text-slate-500">
              Listing <span className="font-mono font-semibold">{submitted.id}</span> passed all
              automated fraud &amp; quality checks and is now visible to buyers on the
              marketplace.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Icon name="warning" className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Held for manual review</h2>
            <p className="mt-2 text-sm text-slate-500">
              Listing <span className="font-mono font-semibold">{submitted.id}</span> was flagged
              by our automated checks, so a moderator will review it before it goes live —
              you&apos;ll be notified by email &amp; SMS.
            </p>
            <ul className="mx-auto mt-3 inline-block text-left text-xs text-amber-700">
              {submitted.flags.map((f) => (
                <li key={f} className="mt-1 flex items-start gap-1.5">
                  <Icon name="warning" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={doneHref}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {mode === "dealer" ? "Back to inventory" : "View my listings"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Stepper */}
        <div className="flex border-b border-slate-100 px-6 py-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {i < step ? <Icon name="check" className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`ml-2 hidden text-xs font-medium sm:block ${i === step ? "text-slate-900" : "text-slate-400"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-3 h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Identify the vehicle</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the number plate — we look it up in the EZAUTO datahouse and auto-fill the
                registered spec.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  placeholder="e.g. VHR 2210"
                  className="w-48 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase tracking-wider"
                />
                <button
                  onClick={runLookup}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Look up plate
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Try <span className="font-mono">VHR 2210</span> (hit) or any other plate (miss →
                manual entry). Data source: EZAUTO Central Vehicle Datahouse (mock).
              </p>

              {lookupState === "found" && spec && (
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <Icon name="check" className="h-4 w-4" />
                    Record found — spec auto-filled from EZAUTO
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    <SpecItem label="Make / model" value={`${spec.make} ${spec.model}`} />
                    <SpecItem label="Variant" value={spec.variant} />
                    <SpecItem label="Year" value={String(spec.year)} />
                    <SpecItem label="Engine" value={`${spec.engineCc} cc`} />
                    <SpecItem label="Transmission" value={spec.transmission} />
                    <SpecItem label="Colour" value={spec.color} />
                  </dl>
                  <button
                    onClick={() => {
                      setManual(true);
                      setLookupState("miss");
                    }}
                    className="mt-3 text-xs font-medium text-emerald-700 underline"
                  >
                    Not your car? Enter details manually
                  </button>
                </div>
              )}

              {lookupState === "miss" && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Icon name="warning" className="h-4 w-4" />
                    No datahouse record — select your vehicle manually
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <select
                        value={manualMake}
                        onChange={(e) => {
                          setManualMake(e.target.value);
                          setManualModel("");
                          setManualVariant("");
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select make</option>
                        {Object.keys(TAXONOMY).map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                        <option value={CUSTOM}>Other (custom)…</option>
                      </select>
                      {isCustomMake && (
                        <input
                          value={customMake}
                          onChange={(e) => setCustomMake(e.target.value)}
                          placeholder="Type the make, e.g. Kia"
                          className="mt-2 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
                        />
                      )}
                    </div>
                    <div>
                      {isCustomMake ? (
                        <input
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          placeholder="Type the model, e.g. Cerato"
                          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
                        />
                      ) : (
                        <>
                          <select
                            value={manualModel}
                            onChange={(e) => {
                              setManualModel(e.target.value);
                              setManualVariant("");
                            }}
                            disabled={!manualMake}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
                          >
                            <option value="">Select model</option>
                            {manualMake &&
                              Object.keys(TAXONOMY[manualMake] ?? {}).map((m) => (
                                <option key={m}>{m}</option>
                              ))}
                            <option value={CUSTOM}>Other (custom)…</option>
                          </select>
                          {manualModel === CUSTOM && (
                            <input
                              value={customModel}
                              onChange={(e) => setCustomModel(e.target.value)}
                              placeholder="Type the model"
                              className="mt-2 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      {isCustomModel ? (
                        <input
                          value={customVariant}
                          onChange={(e) => setCustomVariant(e.target.value)}
                          placeholder="Variant / trim, e.g. 1.6 GT"
                          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
                        />
                      ) : (
                        <>
                          <select
                            value={manualVariant}
                            onChange={(e) => setManualVariant(e.target.value)}
                            disabled={!manualModel}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
                          >
                            <option value="">Select variant</option>
                            {manualMake &&
                              manualModel &&
                              (TAXONOMY[manualMake]?.[manualModel] ?? []).map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            <option value={CUSTOM}>Other (custom)…</option>
                          </select>
                          {manualVariant === CUSTOM && (
                            <input
                              value={customVariant}
                              onChange={(e) => setCustomVariant(e.target.value)}
                              placeholder="Type the variant / trim"
                              className="mt-2 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
                            />
                          )}
                        </>
                      )}
                    </div>
                    <select
                      value={manualYear}
                      onChange={(e) => setManualYear(Number(e.target.value))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <select
                      value={manualTransmission}
                      onChange={(e) => setManualTransmission(e.target.value as Transmission)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                    <input
                      value={manualColor}
                      onChange={(e) => setManualColor(e.target.value)}
                      placeholder="Colour"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    {!knownCc && effMake && effModel && (
                      <input
                        type="number"
                        value={customEngineCc}
                        onChange={(e) => setCustomEngineCc(e.target.value)}
                        placeholder="Engine capacity (cc), e.g. 1598"
                        className="rounded-lg border border-amber-300 px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-amber-700">
                    Pick from the list where possible — it keeps valuation and search accurate.
                    Anything entered via &quot;Other (custom)&quot; is auto-flagged for a quick
                    data-quality review before going live.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Condition &amp; history</h2>
              <p className="mt-1 text-sm text-slate-500">
                These fields refine the instant estimate into a more accurate market value.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Mileage (km)</span>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g. 65000"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Previous owners</span>
                  <select
                    value={owners}
                    onChange={(e) => setOwners(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-600">Condition grade</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-4">
                  {GRADES.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGrade(g.value)}
                      className={`rounded-lg border px-3 py-2.5 text-left transition ${
                        grade === g.value
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{g.label}</p>
                      <p className="text-[11px] text-slate-500">{g.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={accidentFree}
                    onChange={(e) => setAccidentFree(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  No accident history (declared)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={floodFree}
                    onChange={(e) => setFloodFree(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  Never flood damaged (declared)
                </label>
              </div>
            </div>
          )}

          {step === 3 && valuation && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Set your asking price</h2>
              <p className="mt-1 text-sm text-slate-500">
                You stay in control of the price — the market valuation is a guide, and warnings
                are advisory, never blocking.
              </p>
              <label className="mt-4 block max-w-xs">
                <span className="text-xs font-semibold text-slate-600">Asking price (RM)</span>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder={String(valuation.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold"
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setAskingPrice(String(valuation.value))}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                >
                  Use market value {formatCurrency(valuation.value)}
                </button>
              </div>

              {deviation && (
                <div
                  className={`mt-4 flex items-start gap-3 rounded-lg border p-4 text-sm ${
                    deviation.status === "market"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-300 bg-amber-50 text-amber-800"
                  }`}
                >
                  <Icon
                    name={deviation.status === "market" ? "check" : "warning"}
                    className="mt-0.5 h-5 w-5 shrink-0"
                  />
                  <div>
                    {deviation.status === "market" && (
                      <p>
                        <span className="font-semibold">Priced at market.</span> Your price is
                        within ±{Math.round(DEVIATION_THRESHOLD * 100)}% of the EZAUTO market value —
                        buyers will see an &quot;at market price&quot; badge.
                      </p>
                    )}
                    {deviation.status === "over" && (
                      <p>
                        <span className="font-semibold">
                          {formatPct(deviation.pct)} above market valuation.
                        </span>{" "}
                        Overpriced listings get ~60% fewer enquiries. You can still proceed — this
                        warning is advisory.
                      </p>
                    )}
                    {deviation.status === "under" && (
                      <p>
                        <span className="font-semibold">
                          {formatPct(deviation.pct)} below market valuation.
                        </span>{" "}
                        You may be leaving money on the table. Heavily underpriced listings are
                        also flagged for a too-good-to-be-true review.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Photos &amp; details</h2>
              <p className="mt-1 text-sm text-slate-500">
                At least 1 photo required. In production this is a real upload — pick stock photos
                for the mockup.
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {PHOTO_POOL.map((url, i) => {
                  const selected = photoIdx.includes(i);
                  return (
                    <button
                      key={url}
                      onClick={() =>
                        setPhotoIdx((prev) =>
                          selected ? prev.filter((x) => x !== i) : [...prev, i]
                        )
                      }
                      className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${
                        selected ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent"
                      }`}
                    >
                      <Image src={url} alt={`Stock photo ${i + 1}`} fill className="object-cover" sizes="120px" />
                      {selected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mock AI photo-condition analysis — verifies the declared grade */}
              {photoIdx.length > 0 && (
                <div
                  className={`mt-3 flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
                    photoConditionOk
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-300 bg-amber-50 text-amber-800"
                  }`}
                >
                  <Icon
                    name={photoConditionOk ? "check" : "warning"}
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  <p>
                    <span className="font-semibold">Photo condition analysis (AI, mock):</span>{" "}
                    {photoConditionOk
                      ? `photos are consistent with the declared "${grade}" condition.`
                      : `can't confirm the declared "Excellent" condition from ${photoIdx.length} photo(s) — add at least 3 photos, or the listing will be held for manual review.`}
                  </p>
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-600">Description</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Ownership, service history, reason for selling…"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Location</span>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
                {mode === "dealer" && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={isConsignment}
                        onChange={(e) => setIsConsignment(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                      />
                      Consignment (client&apos;s car)
                    </label>
                    {isConsignment && (
                      <input
                        value={consignmentOwner}
                        onChange={(e) => setConsignmentOwner(e.target.value)}
                        placeholder="Owner's name"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && effectiveSpec && valuation && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review &amp; submit</h2>
              <div className="mt-4 space-y-3 text-sm">
                <ReviewRow label="Vehicle" value={vehicleTitle(effectiveSpec)} />
                <ReviewRow label="Plate" value={effectiveSpec.plate} mono />
                <ReviewRow
                  label="Condition"
                  value={`${Number(mileage).toLocaleString()} km · ${grade} · ${owners} owner(s)`}
                />
                <ReviewRow
                  label="Declarations"
                  value={`${accidentFree ? "Accident-free" : "Has accident history"} · ${floodFree ? "No flood damage" : "Flood damaged"}`}
                />
                <ReviewRow label="Market valuation" value={formatCurrency(valuation.value)} />
                <ReviewRow label="Asking price" value={formatCurrency(Number(askingPrice))} strong />
                <ReviewRow label="Photos" value={`${photoIdx.length} selected`} />
                <ReviewRow label="Location" value={location} />
                {mode === "dealer" && isConsignment && (
                  <ReviewRow label="Consignment for" value={consignmentOwner} />
                )}
              </div>
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                On submit, automated fraud &amp; quality checks run (SOP 6). Clean listings go
                live instantly; flagged ones are held for manual review and you&apos;re notified
                by email &amp; SMS.
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex justify-between border-t border-slate-100 pt-5">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext && setStep((s) => s + 1)}
                disabled={!canNext}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={submit}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Submit for review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right rail — live valuation */}
      <div className="space-y-4">
        {valuation ? (
          <ValuationPanel valuation={valuation} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <Icon name="sparkles" className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-500">Valuation appears here</p>
            <p className="mt-1 text-xs text-slate-400">
              The market value is computed once your vehicle details, condition and photos are
              complete — the photo analysis verifies the condition before the number is shown.
            </p>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">How valuation works</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Plate → EZAUTO datahouse lookup, spec auto-filled</li>
            <li>Mileage, condition &amp; history declared</li>
            <li>Photos analyzed to verify the declared condition</li>
            <li>Valuation retrieved on full, verified info → set your price</li>
            <li>Every run stored &amp; versioned for audit</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-emerald-700/70">{label}</dt>
      <dd className="font-medium capitalize text-emerald-900">{value}</dd>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  mono = false,
  strong = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${mono ? "font-mono" : ""} ${strong ? "text-base font-bold text-slate-900" : "font-medium text-slate-800"}`}>
        {value}
      </span>
    </div>
  );
}
