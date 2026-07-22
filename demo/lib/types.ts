export type Role = "buyer" | "seller" | "dealer" | "admin";

export type ConditionGrade = "excellent" | "good" | "fair" | "poor";
export type Transmission = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";
export type SellerType = "private" | "dealer";
export type CarType = "new" | "used" | "recon";
export type ClassifiedChannel = "Carlist.my" | "Mudah.my" | "Facebook Marketplace";
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
  chassisNo?: string;
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

/** Voluntary financing record a dealer can attach to a stock unit. */
export interface FinancingRecord {
  provider: string;
  amount: number;
  drawdownDate: string;
  tenureDays: number;
}

/**
 * Dealer stock take-in record — powers stock aging and the dealer's
 * financial / trading position. Internal to the dealer, never shown to buyers.
 */
export interface Acquisition {
  takeInDate: string;
  costOfPurchase: number;
  source: string;
  /** Voluntary basis — dealer opts in to record financing against the unit. */
  financing?: FinancingRecord;
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
  /** Dealer-only stock take-in record (cost, datetime, optional financing). */
  acquisition?: Acquisition;
  askingPrice: number;
  valuation: Valuation;
  status: ListingStatus;
  views: number;
  listedAt: string;
  flags: string[];
  /** Buyer reports on a live listing — the admin's takedown signal. */
  reports: ListingReport[];
  /** External classified channels this listing is syndicated to. */
  channels: ClassifiedChannel[];
  rejectReason?: string;
}

export type NewListingInput = Omit<
  Listing,
  "id" | "status" | "views" | "listedAt" | "flags" | "reports" | "channels" | "rejectReason"
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
