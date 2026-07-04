import { VehicleWizard } from "@/components/VehicleWizard";

export default function SellPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Sell your car</h1>
        <p className="mt-2 text-slate-600">
          Complete the steps below to get your valuation and publish your listing.
        </p>
      </div>
      <VehicleWizard />
    </div>
  );
}
