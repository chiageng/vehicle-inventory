export type Role = "buyer" | "seller" | "dealer" | "admin";

export type ConditionGrade = "excellent" | "good" | "fair" | "poor";
export type Transmission = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";
export type SellerType = "private" | "dealer";
export type CarType = "new" | "used" | "recon";
export type ListingStatus =
  | "pending"
  | "active"
  | "rejected"
  | "sold"
  | "withdrawn"
  | "removed";
export type ValuationStage = "instant" | "refined";

export interface VehicleSpec {
  plate: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  engineCc: number;
  transmission: Transmission;
  fuelType: FuelType;
  color: string;
}

export interface VehicleCondition {
  mileageKm: number;
  grade: ConditionGrade;
  owners: number;
  accidentFree: boolean;
  floodFree: boolean;
}

export interface ValuationFactors {
  baseValue: number;
  mileageAdjustment: number;
  conditionMultiplier: number;
}

export interface Valuation {
  /** Single market value (MYR) retrieved from the valuation SaaS. */
  value: number;
  stage: ValuationStage;
  source: "ezauto" | "fallback";
  factors: ValuationFactors;
}

export interface ListingReport {
  reason: string;
  at: string;
}

export interface Listing {
  id: string;
  spec: VehicleSpec;
  carType: CarType;
  condition: VehicleCondition;
  description: string;
  photos: string[];
  location: string;
  sellerType: SellerType;
  sellerName: string;
  consignmentOwner?: string;
  askingPrice: number;
  valuation: Valuation;
  status: ListingStatus;
  views: number;
  listedAt: string;
  flags: string[];
  /** Buyer reports on a live listing — the admin's takedown signal. */
  reports: ListingReport[];
  rejectReason?: string;
}

export type NewListingInput = Omit<
  Listing,
  "id" | "status" | "views" | "listedAt" | "flags" | "reports" | "rejectReason"
>;

export type MessageKind = "text" | "offer" | "viewing";

export interface ChatMessage {
  id: string;
  from: "buyer" | "seller";
  text: string;
  kind: MessageKind;
  at: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerName: string;
  messages: ChatMessage[];
  unread: boolean;
}

export interface DealerApplication {
  id: string;
  businessName: string;
  ssmNumber: string;
  contactName: string;
  phone: string;
  status: "pending" | "verified" | "rejected";
  appliedAt: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  criteria: string;
  newMatches: number;
}
