"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { mockApi } from "@/lib/mock-api";
import type {
  ConditionGrade,
  FuelType,
  TransmissionType,
  Valuation,
  Vehicle,
  VehicleInput,
} from "@/lib/types";
import { PhotoUploader, type PhotoItem } from "./PhotoUploader";
import { useToast } from "./Toast";
import { ValuationCard } from "./ValuationCard";

const STEPS = ["Vehicle Info", "Details & Photos", "Publish"];

const CONDITION_OPTIONS: { value: ConditionGrade; label: string; desc: string }[] = [
  { value: "excellent", label: "Excellent", desc: "Like new, no visible wear" },
  { value: "good", label: "Good", desc: "Minor wear, well maintained" },
  { value: "fair", label: "Fair", desc: "Noticeable wear, needs some work" },
  { value: "poor", label: "Poor", desc: "Significant issues or damage" },
];

export function VehicleWizard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [isReseller, setIsReseller] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [plateNumber, setPlateNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear() - 3);
  const [trim, setTrim] = useState("");
  const [mileage, setMileage] = useState(0);
  const [clientOwnerName, setClientOwnerName] = useState("");

  const [color, setColor] = useState("");
  const [transmission, setTransmission] = useState<TransmissionType>("automatic");
  const [fuelType, setFuelType] = useState<FuelType>("gas");
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>("good");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [askingPrice, setAskingPrice] = useState(0);

  useEffect(() => {
    const session = getSession();
    setIsReseller(session?.role === "reseller");
  }, []);

  function validateStep0(): boolean {
    if (plateNumber.trim().length < 3) {
      showToast("Number plate is required", "error");
      return false;
    }
    if (!make.trim() || !model.trim()) {
      showToast("Make and model are required", "error");
      return false;
    }
    if (mileage < 0) {
      showToast("Mileage must be non-negative", "error");
      return false;
    }
    if (isReseller && !clientOwnerName.trim()) {
      showToast("Client owner name is required for reseller listings", "error");
      return false;
    }
    return true;
  }

  function validateStep1(): boolean {
    if (photos.length === 0) {
      showToast("Please upload at least one photo", "error");
      return false;
    }
    return true;
  }

  function handleNext() {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;

    if (step === 1) {
      const input: VehicleInput = {
        plateNumber,
        make,
        model,
        year,
        trim,
        mileage,
        color,
        transmission,
        fuelType,
        conditionGrade,
        description,
        photos,
        clientOwnerName: isReseller ? clientOwnerName : undefined,
      };
      try {
        const created = mockApi.createVehicle(input);
        setVehicle(created);
      } catch {
        showToast("Please log in as a seller or reseller to continue", "error");
        router.push("/login?next=/sell");
        return;
      }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handlePublish() {
    if (!vehicle || publishing) return;

    setPublishing(true);
    const result = mockApi.publishListing(
      vehicle.id,
      askingPrice > 0 ? askingPrice : 0
    );

    if (!result) {
      showToast("Could not publish — please log in and try again", "error");
      setPublishing(false);
      return;
    }

    const { valuation: publishedValuation } = result;
    const finalPrice =
      askingPrice > 0 ? askingPrice : publishedValuation.estimatedMid;

    setValuation(publishedValuation);
    setAskingPrice(finalPrice);

    showToast(
      `Published! Estimate: ${formatCurrency(publishedValuation.estimatedMid)} — pending admin approval.`
    );
    setPublishing(false);
    router.push("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    i <= step ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 hidden text-xs sm:block ${
                    i <= step ? "font-medium text-teal-600" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-teal-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {isReseller && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Client owner name
                </label>
                <input
                  value={clientOwnerName}
                  onChange={(e) => setClientOwnerName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Maria Garcia"
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Number plate</label>
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase"
                placeholder="BHK 3847"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Make</label>
              <input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Model</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Accord"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1990}
                max={new Date().getFullYear() + 1}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Trim</label>
              <input
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="EX-L"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mileage (km)</label>
              <input
                type="number"
                value={mileage || ""}
                onChange={(e) => setMileage(Number(e.target.value))}
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="68000"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Color</label>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Silver"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Fuel type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="gas">Gas</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Condition</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConditionGrade(opt.value)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      conditionGrade === opt.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium text-slate-900">{opt.label}</span>
                    <p className="mt-0.5 text-xs text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Tell buyers about your vehicle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Photos</label>
              <div className="mt-2">
                <PhotoUploader photos={photos} onChange={setPhotos} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              When you publish, CarInventory runs an automated valuation estimate so you can
              set your asking price with confidence. Your listing is sent for admin approval
              before it goes live.
            </p>
            {valuation && <ValuationCard valuation={valuation} />}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Asking price (optional — defaults to estimate mid-point)
              </label>
              <div className="relative mt-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  RM
                </span>
                <input
                  type="number"
                  value={askingPrice || ""}
                  onChange={(e) => setAskingPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-lg font-semibold"
                  placeholder="Auto from estimate"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0 || publishing}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Publish listing"}
          </button>
        )}
      </div>

    </div>
  );
}
