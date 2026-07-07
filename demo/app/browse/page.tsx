"use client";

import { useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { ListingGrid } from "@/components/ListingGrid";
import { api } from "@/lib/api";
import type { ListingDetail, ListingFilters } from "@/lib/types";

export default function BrowsePage() {
  const [filters, setFilters] = useState<ListingFilters>({ sort: "newest" });
  const [listings, setListings] = useState<ListingDetail[]>([]);

  useEffect(() => {
    api.searchListings(filters).then(setListings);
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse cars</h1>
        <p className="mt-2 text-slate-600">
          {listings.length} {listings.length === 1 ? "listing" : "listings"} available
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="mt-8">
        <ListingGrid listings={listings} />
      </div>
    </div>
  );
}
