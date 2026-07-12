"use client";

import Link from "next/link";
import { ManageListingsTable } from "@/components/ManageListingsTable";
import { PageHeader } from "@/components/ui";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function SellerListingsPage() {
  const { listings } = useDemo();
  const mine = listings.filter((l) => l.sellerName === PERSONAS.seller.name);

  return (
    <div>
      <PageHeader
        title="My inventory"
        description="Edit prices, mark cars as sold or withdraw listings — keep everything reflecting reality."
        action={
          <Link
            href="/seller/sell"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add a car
          </Link>
        }
      />
      <ManageListingsTable listings={mine} />
    </div>
  );
}
