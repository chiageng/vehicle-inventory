import { computeValuation } from "../valuation";
import type {
  Listing,
  ListingDetail,
  ListingFilters,
  PublishResult,
  User,
  Vehicle,
  VehicleInput,
  VehiclePhoto,
  Valuation,
} from "../types";
import {
  generateId,
  readMarketplace,
  readUsers,
  writeMarketplace,
} from "./db";

function getListingDetail(
  listingId: string
): ListingDetail | null {
  const data = readMarketplace();
  const users = readUsers();
  const listing = data.listings.find((l) => l.id === listingId);
  if (!listing) return null;

  const vehicle = data.vehicles.find((v) => v.id === listing.vehicleId);
  if (!vehicle) return null;

  const valuation = data.valuations.find((v) => v.vehicleId === vehicle.id) ?? null;
  const photos = data.photos
    .filter((p) => p.vehicleId === vehicle.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const contact = users.find((u) => u.id === listing.sellerId);
  const ownerUser = listing.ownerId
    ? users.find((u) => u.id === listing.ownerId)
    : null;

  return {
    listing,
    vehicle,
    valuation,
    photos,
    seller: { id: contact?.id ?? "", name: contact?.name ?? "Unknown" },
    owner: ownerUser ? { id: ownerUser.id, name: ownerUser.name } : null,
  };
}

function sortListings(
  details: ListingDetail[],
  sort: ListingFilters["sort"]
): ListingDetail[] {
  const sorted = [...details];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.listing.askingPrice - b.listing.askingPrice);
    case "price_desc":
      return sorted.sort((a, b) => b.listing.askingPrice - a.listing.askingPrice);
    case "mileage_asc":
      return sorted.sort((a, b) => a.vehicle.mileage - b.vehicle.mileage);
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.listing.listedAt ?? 0).getTime() -
          new Date(a.listing.listedAt ?? 0).getTime()
      );
  }
}

export function searchListings(filters: ListingFilters = {}): ListingDetail[] {
  const data = readMarketplace();
  let results = data.listings
    .filter((l) => l.status === "active")
    .map((l) => getListingDetail(l.id))
    .filter((d): d is ListingDetail => d !== null);

  if (filters.make) {
    results = results.filter(
      (d) => d.vehicle.make.toLowerCase() === filters.make!.toLowerCase()
    );
  }
  if (filters.model) {
    results = results.filter((d) =>
      d.vehicle.model.toLowerCase().includes(filters.model!.toLowerCase())
    );
  }
  if (filters.yearMin) {
    results = results.filter((d) => d.vehicle.year >= filters.yearMin!);
  }
  if (filters.yearMax) {
    results = results.filter((d) => d.vehicle.year <= filters.yearMax!);
  }
  if (filters.priceMin) {
    results = results.filter((d) => d.listing.askingPrice >= filters.priceMin!);
  }
  if (filters.priceMax) {
    results = results.filter((d) => d.listing.askingPrice <= filters.priceMax!);
  }
  if (filters.mileageMax) {
    results = results.filter((d) => d.vehicle.mileage <= filters.mileageMax!);
  }

  return sortListings(results, filters.sort ?? "newest");
}

export function getListing(listingId: string): ListingDetail | null {
  const data = readMarketplace();
  const detail = getListingDetail(listingId);
  if (!detail) return null;

  const idx = data.listings.findIndex((l) => l.id === listingId);
  if (idx >= 0) {
    data.listings[idx].viewCount += 1;
    writeMarketplace(data);
    detail.listing.viewCount += 1;
  }

  return detail;
}

export function getSellerListings(sellerId: string): ListingDetail[] {
  const data = readMarketplace();
  return data.listings
    .filter((l) => l.sellerId === sellerId)
    .map((l) => getListingDetail(l.id))
    .filter((d): d is ListingDetail => d !== null)
    .sort(
      (a, b) =>
        new Date(b.listing.updatedAt).getTime() -
        new Date(a.listing.updatedAt).getTime()
    );
}

export function getAllListings(): ListingDetail[] {
  const data = readMarketplace();
  return data.listings
    .map((l) => getListingDetail(l.id))
    .filter((d): d is ListingDetail => d !== null)
    .sort(
      (a, b) =>
        new Date(b.listing.updatedAt).getTime() -
        new Date(a.listing.updatedAt).getTime()
    );
}

export function updateListingStatus(
  listingId: string,
  status: Listing["status"]
): Listing | null {
  const data = readMarketplace();
  const listingIdx = data.listings.findIndex((l) => l.id === listingId);
  if (listingIdx < 0) return null;

  const now = new Date().toISOString();
  const listing = { ...data.listings[listingIdx], status, updatedAt: now };
  data.listings[listingIdx] = listing;

  const vehicleIdx = data.vehicles.findIndex((v) => v.id === listing.vehicleId);
  if (vehicleIdx >= 0) {
    const vehicleStatus =
      status === "active" ? "active" : status === "removed" ? "removed" : "pending_review";
    data.vehicles[vehicleIdx] = {
      ...data.vehicles[vehicleIdx],
      status: vehicleStatus,
      updatedAt: now,
    };
  }

  writeMarketplace(data);
  return listing;
}

export function updateListingPrice(
  listingId: string,
  askingPrice: number,
  session: User
): Listing | null {
  if (askingPrice <= 0) return null;
  if (session.role !== "seller" && session.role !== "reseller") return null;

  const data = readMarketplace();
  const listingIdx = data.listings.findIndex((l) => l.id === listingId);
  if (listingIdx < 0) return null;

  const listing = data.listings[listingIdx];
  if (listing.sellerId !== session.id) return null;
  if (listing.status !== "active" && listing.status !== "pending_review") return null;

  const now = new Date().toISOString();
  const updated = { ...listing, askingPrice, updatedAt: now };
  data.listings[listingIdx] = updated;
  writeMarketplace(data);
  return updated;
}

export function createVehicle(input: VehicleInput, session: User): Vehicle {
  const data = readMarketplace();
  const now = new Date().toISOString();

  let description = input.description;
  if (session.role === "reseller" && input.clientOwnerName?.trim()) {
    description = `Client: ${input.clientOwnerName.trim()}${description ? `\n\n${description}` : ""}`;
  }

  const vehicle: Vehicle = {
    id: generateId("veh"),
    plateNumber: input.plateNumber.toUpperCase().replace(/\s+/g, " ").trim(),
    make: input.make,
    model: input.model,
    year: input.year,
    trim: input.trim,
    mileage: input.mileage,
    color: input.color,
    transmission: input.transmission,
    fuelType: input.fuelType,
    conditionGrade: input.conditionGrade,
    description,
    status: "draft",
    sellerId: session.id,
    createdAt: now,
    updatedAt: now,
  };

  const photos: VehiclePhoto[] = input.photos.map((p, i) => ({
    id: generateId("ph"),
    vehicleId: vehicle.id,
    url: p.url,
    sortOrder: p.sortOrder ?? i,
    isPrimary: p.isPrimary ?? i === 0,
  }));

  data.vehicles.push(vehicle);
  data.photos.push(...photos);
  writeMarketplace(data);

  return vehicle;
}

export function publishListing(
  vehicleId: string,
  askingPrice: number,
  session: User
): PublishResult | null {
  const data = readMarketplace();
  const users = readUsers();

  const vehicleIdx = data.vehicles.findIndex((v) => v.id === vehicleId);
  if (vehicleIdx < 0) return null;

  const vehicle = data.vehicles[vehicleIdx];
  if (vehicle.sellerId !== session.id) return null;

  const isReseller = session.role === "reseller";
  const now = new Date().toISOString();

  const result = computeValuation({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    mileage: vehicle.mileage,
    conditionGrade: vehicle.conditionGrade,
  });

  const valuation: Valuation = {
    id: generateId("val"),
    vehicleId: vehicle.id,
    estimatedLow: result.estimatedLow,
    estimatedMid: result.estimatedMid,
    estimatedHigh: result.estimatedHigh,
    factors: result.factors,
    algorithmVersion: result.algorithmVersion,
    createdAt: now,
  };

  const clientMatch = vehicle.description.match(/^Client: ([^\n]+)/);
  const ownerId =
    isReseller && clientMatch
      ? users.find(
          (u) => u.name.toLowerCase() === clientMatch[1].trim().toLowerCase()
        )?.id ?? null
      : null;

  const finalPrice = askingPrice > 0 ? askingPrice : result.estimatedMid;

  const listing: Listing = {
    id: generateId("lst"),
    vehicleId,
    sellerId: session.id,
    ownerId: isReseller ? ownerId : null,
    listingType: isReseller ? "reseller" : "owner",
    askingPrice: finalPrice,
    status: "pending_review",
    viewCount: 0,
    listedAt: now,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
  };

  data.valuations.push(valuation);
  data.vehicles[vehicleIdx] = { ...vehicle, status: "pending_review", updatedAt: now };
  data.listings.push(listing);
  writeMarketplace(data);

  return { listing, valuation };
}
