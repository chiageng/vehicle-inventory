import { getSession } from "./auth";
import { SEED_DATA } from "./seed-data";
import type {
  AppData,
  Inquiry,
  Listing,
  ListingDetail,
  ListingFilters,
  Vehicle,
  VehicleInput,
  VehiclePhoto,
  Valuation,
} from "./types";
import { computeValuation } from "./valuation";

const STORAGE_KEY = "carinventory_data";
const DATA_VERSION = "7-admin-console";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadData(): AppData {
  if (typeof window === "undefined") return structuredClone(SEED_DATA);
  const version = localStorage.getItem(`${STORAGE_KEY}_version`);
  if (version !== DATA_VERSION) {
    const seed = structuredClone(SEED_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    localStorage.setItem(`${STORAGE_KEY}_version`, DATA_VERSION);
    return seed;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = structuredClone(SEED_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    const seed = structuredClone(SEED_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(`${STORAGE_KEY}_version`, DATA_VERSION);
}

function getListingDetail(data: AppData, listingId: string): ListingDetail | null {
  const listing = data.listings.find((l) => l.id === listingId);
  if (!listing) return null;

  const vehicle = data.vehicles.find((v) => v.id === listing.vehicleId);
  if (!vehicle) return null;

  const valuation =
    data.valuations.find((v) => v.vehicleId === vehicle.id) ?? null;
  const photos = data.photos
    .filter((p) => p.vehicleId === vehicle.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const seller = data.users.find((u) => u.id === listing.sellerId);

  return {
    listing,
    vehicle,
    valuation,
    photos,
    seller: { id: seller?.id ?? "", name: seller?.name ?? "Unknown" },
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

export const mockApi = {
  getData(): AppData {
    return loadData();
  },

  resetData(): void {
    const seed = structuredClone(SEED_DATA);
    saveData(seed);
  },

  searchListings(filters: ListingFilters = {}): ListingDetail[] {
    const data = loadData();
    let results = data.listings
      .filter((l) => l.status === "active")
      .map((l) => getListingDetail(data, l.id))
      .filter((d): d is ListingDetail => d !== null);

    if (filters.make) {
      results = results.filter(
        (d) => d.vehicle.make.toLowerCase() === filters.make!.toLowerCase()
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
  },

  getListing(listingId: string): ListingDetail | null {
    const data = loadData();
    const detail = getListingDetail(data, listingId);
    if (!detail) return null;

    const idx = data.listings.findIndex((l) => l.id === listingId);
    if (idx >= 0) {
      data.listings[idx].viewCount += 1;
      saveData(data);
      detail.listing.viewCount += 1;
    }

    return detail;
  },

  getSellerListings(sellerId: string): ListingDetail[] {
    const data = loadData();
    return data.listings
      .filter((l) => l.sellerId === sellerId)
      .map((l) => getListingDetail(data, l.id))
      .filter((d): d is ListingDetail => d !== null)
      .sort(
        (a, b) =>
          new Date(b.listing.updatedAt).getTime() -
          new Date(a.listing.updatedAt).getTime()
      );
  },

  getAllListings(): ListingDetail[] {
    const data = loadData();
    return data.listings
      .map((l) => getListingDetail(data, l.id))
      .filter((d): d is ListingDetail => d !== null)
      .sort(
        (a, b) =>
          new Date(b.listing.updatedAt).getTime() -
          new Date(a.listing.updatedAt).getTime()
      );
  },

  getAllInquiries(): Inquiry[] {
    const data = loadData();
    return [...data.inquiries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  updateListingStatus(listingId: string, status: Listing["status"]): Listing | null {
    const data = loadData();
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

    saveData(data);
    return listing;
  },

  createVehicle(input: VehicleInput): { vehicle: Vehicle; valuation: Valuation } {
    const data = loadData();
    const session = getSession();
    const sellerId = session?.id ?? "user-demo-001";
    const now = new Date().toISOString();

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
      description: input.description,
      status: "draft",
      sellerId,
      createdAt: now,
      updatedAt: now,
    };

    const result = computeValuation({
      make: input.make,
      model: input.model,
      year: input.year,
      mileage: input.mileage,
      conditionGrade: input.conditionGrade,
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

    const photos: VehiclePhoto[] = input.photos.map((p, i) => ({
      id: generateId("ph"),
      vehicleId: vehicle.id,
      url: p.url,
      sortOrder: p.sortOrder ?? i,
      isPrimary: p.isPrimary ?? i === 0,
    }));

    data.vehicles.push(vehicle);
    data.valuations.push(valuation);
    data.photos.push(...photos);
    saveData(data);

    return { vehicle, valuation };
  },

  publishListing(
    vehicleId: string,
    askingPrice: number
  ): Listing | null {
    const data = loadData();
    const vehicleIdx = data.vehicles.findIndex((v) => v.id === vehicleId);
    if (vehicleIdx < 0) return null;

    const vehicle = data.vehicles[vehicleIdx];
    const now = new Date().toISOString();

    const listing: Listing = {
      id: generateId("lst"),
      vehicleId,
      sellerId: vehicle.sellerId,
      askingPrice,
      status: "pending_review",
      viewCount: 0,
      listedAt: now,
      expiresAt: null,
      createdAt: now,
      updatedAt: now,
    };

    data.vehicles[vehicleIdx] = { ...vehicle, status: "pending_review", updatedAt: now };
    data.listings.push(listing);
    saveData(data);

    return listing;
  },

  createInquiry(
    listingId: string,
    contactName: string,
    contactEmail: string,
    message: string
  ): Inquiry {
    const data = loadData();
    const session = getSession();
    const now = new Date().toISOString();

    const inquiry: Inquiry = {
      id: generateId("inq"),
      listingId,
      buyerId: session?.id ?? null,
      contactName,
      contactEmail,
      message,
      status: "new",
      createdAt: now,
    };

    data.inquiries.push(inquiry);
    saveData(data);
    return inquiry;
  },
};
