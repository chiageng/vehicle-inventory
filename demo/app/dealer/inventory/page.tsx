"use client";

import Link from "next/link";
import { ManageListingsTable } from "@/components/ManageListingsTable";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function DealerInventoryPage() {
  const { listings } = useDemo();
  const { showToast } = useToast();
  const mine = listings.filter((l) => l.sellerName === PERSONAS.dealer.name);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Own stock and consignment units — every listing tracks price vs market, views and leads."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => showToast("Bulk import template downloaded (mock) — CSV of plates & prices")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Bulk import (CSV)
            </button>
            <Link
              href="/dealer/inventory/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add vehicle
            </Link>
          </div>
        }
      />
      <ManageListingsTable listings={mine} showConsignment />
    </div>
  );
}
