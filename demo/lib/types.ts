export type UserRole = "seller" | "buyer" | "admin" | "reseller";
export type ListingType = "owner" | "reseller";
export type VehicleStatus = "draft" | "pending_review" | "active" | "sold" | "removed";
export type ListingStatus = "draft" | "pending_review" | "active" | "sold" | "removed";
export type ConditionGrade = "excellent" | "good" | "fair" | "poor";
export type TransmissionType = "automatic" | "manual" | "cvt";
export type FuelType = "gas" | "diesel" | "electric" | "hybrid";
export type InquiryStatus = "new" | "read" | "replied" | "closed";
export type SortOption = "price_asc" | "price_desc" | "newest" | "mileage_asc";

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface VehiclePhoto {
  id: string;
  vehicleId: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  color: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  conditionGrade: ConditionGrade;
  description: string;
  status: VehicleStatus;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValuationFactors {
  baseValue: number;
  mileageAdjustment: number;
  conditionMultiplier: number;
  expectedMileage: number;
  actualMileage: number;
}

export interface Valuation {
  id: string;
  vehicleId: string;
  estimatedLow: number;
  estimatedMid: number;
  estimatedHigh: number;
  factors: ValuationFactors;
  algorithmVersion: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  vehicleId: string;
  sellerId: string;
  ownerId: string | null;
  listingType: ListingType;
  askingPrice: number;
  status: ListingStatus;
  viewCount: number;
  listedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  listingId: string;
  buyerId: string | null;
  contactName: string;
  contactEmail: string;
  message: string;
  status: InquiryStatus;
  emailNotified: boolean;
  smsNotified: boolean;
  replyMessage: string | null;
  repliedAt: string | null;
  buyerEmailNotified: boolean;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  from: "buyer" | "seller";
  senderId: string | null;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string | null;
  buyerName: string;
  buyerEmail: string;
  status: InquiryStatus;
  emailNotified: boolean;
  smsNotified: boolean;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface MarketplaceData {
  vehicles: Vehicle[];
  photos: VehiclePhoto[];
  valuations: Valuation[];
  listings: Listing[];
}

export interface ListingDetail {
  listing: Listing;
  vehicle: Vehicle;
  valuation: Valuation | null;
  photos: VehiclePhoto[];
  seller: Pick<User, "id" | "name">;
  owner: Pick<User, "id" | "name"> | null;
}

export interface ListingFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  sort?: SortOption;
}

export interface VehicleInput {
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  color: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  conditionGrade: ConditionGrade;
  description: string;
  photos: { url: string; sortOrder: number; isPrimary: boolean }[];
  clientOwnerName?: string;
}

export interface PublishResult {
  listing: Listing;
  valuation: Valuation;
}

export interface AppData {
  users: User[];
  vehicles: Vehicle[];
  photos: VehiclePhoto[];
  valuations: Valuation[];
  listings: Listing[];
  inquiries: Inquiry[];
}
