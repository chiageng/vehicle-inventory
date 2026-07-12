"use client";

import { ListingWizard } from "@/components/ListingWizard";
import { PageHeader } from "@/components/ui";

export default function SellCarPage() {
  return (
    <div>
      <PageHeader
        title="Add a car"
        description="Plate / chassis lookup → condition → photos verified → valuation → your price. Clean listings go live instantly; flagged ones get a quick human review."
      />
      <ListingWizard mode="seller" doneHref="/seller/listings" />
    </div>
  );
}
