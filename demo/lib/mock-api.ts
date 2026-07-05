import { getSession } from "./auth";
import { SEED_DATA } from "./seed-data";
import type {
  AppData,
  Inquiry,
  Listing,
  ListingDetail,
  ListingFilters,
  PublishResult,
  User,
  Vehicle,
  VehicleInput,
  VehiclePhoto,
  Valuation,
} from "./types";
import { computeValuation } from "./valuation";

const STORAGE_KEY = "carinventory_data";
const DATA_VERSION = "11-inquiry-replies";

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
  const contact = data.users.find((u) => u.id === listing.sellerId);
  const ownerUser = listing.ownerId
    ? data.users.find((u) => u.id === listing.ownerId)
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
    if (filters.model) {
      results = results.filter(
        (d) => d.vehicle.model.toLowerCase().includes(filters.model!.toLowerCase())
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

  upsertUser(user: User): void {
    const data = loadData();
    const idx = data.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      data.users[idx] = user;
    } else {
      data.users.push(user);
    }
    saveData(data);
  },

  getInquiriesForSeller(sellerId: string): Inquiry[] {
    const data = loadData();
    const listingIds = new Set(
      data.listings.filter((l) => l.sellerId === sellerId).map((l) => l.id)
    );
    return data.inquiries
      .filter((i) => listingIds.has(i.listingId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createVehicle(input: VehicleInput): Vehicle {
    const data = loadData();
    const session = getSession();
    if (!session || (session.role !== "seller" && session.role !== "reseller")) {
      throw new Error("Must be logged in as seller or reseller");
    }
    const sellerId = session.id;
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
      sellerId,
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
    saveData(data);

    return vehicle;
  },

  publishListing(vehicleId: string, askingPrice: number): PublishResult | null {
    const data = loadData();
    const session = getSession();
    if (!session || (session.role !== "seller" && session.role !== "reseller")) {
      return null;
    }

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
        ? data.users.find(
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
    saveData(data);

    return { listing, valuation };
  },

  updateInquiryStatus(inquiryId: string, status: Inquiry["status"]): Inquiry | null {
    const data = loadData();
    const idx = data.inquiries.findIndex((i) => i.id === inquiryId);
    if (idx < 0) return null;
    data.inquiries[idx] = { ...data.inquiries[idx], status };
    saveData(data);
    return data.inquiries[idx];
  },

  replyToInquiry(inquiryId: string, replyMessage: string): Inquiry | null {
    const data = loadData();
    const session = getSession();
    if (!session || (session.role !== "seller" && session.role !== "reseller")) {
      return null;
    }

    const trimmed = replyMessage.trim();
    if (!trimmed) return null;

    const idx = data.inquiries.findIndex((i) => i.id === inquiryId);
    if (idx < 0) return null;

    const inquiry = data.inquiries[idx];
    const listing = data.listings.find((l) => l.id === inquiry.listingId);
    if (!listing || listing.sellerId !== session.id) return null;

    const now = new Date().toISOString();
    const updated: Inquiry = {
      ...inquiry,
      replyMessage: trimmed,
      repliedAt: now,
      status: "replied",
      buyerEmailNotified: Boolean(inquiry.contactEmail),
    };
    data.inquiries[idx] = updated;
    saveData(data);
    return updated;
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

    const listing = data.listings.find((l) => l.id === listingId);
    const seller = listing
      ? data.users.find((u) => u.id === listing.sellerId)
      : undefined;

    const inquiry: Inquiry = {
      id: generateId("inq"),
      listingId,
      buyerId: session?.id ?? null,
      contactName,
      contactEmail,
      message,
      status: "new",
      emailNotified: Boolean(seller?.email),
      smsNotified: Boolean(seller?.phone),
      replyMessage: null,
      repliedAt: null,
      buyerEmailNotified: false,
      createdAt: now,
    };

    data.inquiries.push(inquiry);
    saveData(data);
    return inquiry;
  },
};
