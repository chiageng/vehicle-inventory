import { NextResponse } from "next/server";
import type { ListingFilters } from "@/lib/types";
import { searchListings } from "@/lib/server/marketplace-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: ListingFilters = {
    make: searchParams.get("make") || undefined,
    model: searchParams.get("model") || undefined,
    yearMin: searchParams.get("yearMin") ? Number(searchParams.get("yearMin")) : undefined,
    yearMax: searchParams.get("yearMax") ? Number(searchParams.get("yearMax")) : undefined,
    priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
    mileageMax: searchParams.get("mileageMax")
      ? Number(searchParams.get("mileageMax"))
      : undefined,
    sort: (searchParams.get("sort") as ListingFilters["sort"]) || "newest",
  };

  const listings = searchListings(filters);
  return NextResponse.json({ listings });
}
