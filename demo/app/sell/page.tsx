"use client";

import { VehicleWizard } from "@/components/VehicleWizard";
import { useRequireSellerAuth } from "@/lib/useRequireSellerAuth";

export default function SellPage() {
  const user = useRequireSellerAuth("/sell");

  if (!user) {
    return null;
  }

  const isReseller = user.role === "reseller";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          {isReseller ? "List a client vehicle" : "Sell your car"}
        </h1>
        <p className="mt-2 text-slate-600">
          {isReseller
            ? "Add your client's vehicle details and photos. Valuation runs when you publish."
            : "Add your vehicle details and photos. You get an automated estimate when you publish."}
        </p>
      </div>
      <VehicleWizard />
    </div>
  );
}
