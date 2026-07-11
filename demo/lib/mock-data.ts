import { PLATE_DB } from "./catalog";
import { valuate } from "./valuation";
import type {
  CarType,
  Conversation,
  DealerApplication,
  Listing,
  SavedSearch,
  VehicleCondition,
  VehicleSpec,
} from "./types";

/** Demo personas — the "logged in" identity of each portal. */
export const PERSONAS = {
  buyer: { name: "You", label: "Guest buyer" },
  seller: { name: "Lim Wei Jian", email: "weijian@demo.my", label: "Private seller" },
  dealer: {
    name: "Prestige Auto Sdn Bhd",
    contact: "Michelle Tan",
    email: "michelle@prestigeauto.my",
    label: "Verified dealer",
  },
  admin: { name: "Aisyah Rahman", email: "aisyah@ezautoinventory.my", label: "Marketplace ops" },
} as const;

export const PHOTO_POOL = [
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
];

function photos(...idx: number[]): string[] {
  return idx.map((i) => PHOTO_POOL[i % PHOTO_POOL.length]);
}

interface SeedArgs {
  id: string;
  plate: string;
  /** Full spec override for unregistered (new / recon) units without a plate record. */
  spec?: Omit<VehicleSpec, "plate">;
  carType?: CarType;
  condition: VehicleCondition;
  askingPrice: number;
  sellerType: Listing["sellerType"];
  sellerName: string;
  location: string;
  status: Listing["status"];
  photos: string[];
  description: string;
  listedAt: string;
  views?: number;
  consignmentOwner?: string;
  flags?: string[];
  reports?: Listing["reports"];
  rejectReason?: string;
}

function seed(args: SeedArgs): Listing {
  const spec = { plate: args.plate, ...(args.spec ?? PLATE_DB[args.plate]) };
  return {
    id: args.id,
    spec,
    carType: args.carType ?? "used",
    condition: args.condition,
    description: args.description,
    photos: args.photos,
    location: args.location,
    sellerType: args.sellerType,
    sellerName: args.sellerName,
    consignmentOwner: args.consignmentOwner,
    askingPrice: args.askingPrice,
    valuation: valuate(spec, args.condition),
    status: args.status,
    views: args.views ?? 0,
    listedAt: args.listedAt,
    flags: args.flags ?? [],
    reports: args.reports ?? [],
    rejectReason: args.rejectReason,
  };
}

export const SEED_LISTINGS: Listing[] = [
  seed({
    id: "L-1001",
    plate: "VBU 3421",
    condition: { mileageKm: 58000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 46800,
    sellerType: "private",
    sellerName: "Amirul Hakim",
    location: "Kuala Lumpur",
    status: "active",
    photos: photos(0, 5),
    description:
      "First owner, full Perodua service record. Selling because upgrading to an SUV. Viewing in Wangsa Maju.",
    listedAt: "2026-07-02T03:20:00Z",
    views: 412,
  }),
  seed({
    id: "L-1002",
    plate: "WXD 8823",
    condition: { mileageKm: 64000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 66800,
    sellerType: "dealer",
    sellerName: PERSONAS.dealer.name,
    location: "Selangor",
    status: "active",
    photos: photos(1, 3, 6),
    description:
      "Certified pre-owned. 175-point inspection done, free 1-year warranty. Loan arrangement available.",
    listedAt: "2026-06-28T08:00:00Z",
    views: 655,
  }),
  seed({
    id: "L-1003",
    plate: "VDK 1198",
    condition: { mileageKm: 34000, grade: "excellent", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 96500,
    sellerType: "dealer",
    sellerName: PERSONAS.dealer.name,
    location: "Selangor",
    status: "active",
    photos: photos(4, 2),
    description:
      "Flagship spec with ADAS. Under Proton warranty until 2027. Trade-in welcome.",
    listedAt: "2026-07-05T02:10:00Z",
    views: 289,
  }),
  seed({
    id: "L-1004",
    plate: "PPV 2214",
    condition: { mileageKm: 45000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 125000,
    sellerType: "private",
    sellerName: PERSONAS.seller.name,
    location: "Kuala Lumpur",
    status: "active",
    photos: photos(2, 7),
    description:
      "Careful owner, weekend car. Full Honda service history, new Michelin tyres. Viewing at Mont Kiara.",
    listedAt: "2026-06-30T10:45:00Z",
    views: 178,
  }),
  seed({
    id: "L-1005",
    plate: "VEL 5529",
    condition: { mileageKm: 71000, grade: "good", owners: 2, accidentFree: true, floodFree: true },
    askingPrice: 92500,
    sellerType: "dealer",
    sellerName: "Weststar Motors",
    location: "Penang",
    status: "active",
    photos: photos(3, 0),
    description: "Soul Red Crystal, well maintained. Second owner, no accident, no flood.",
    listedAt: "2026-06-25T06:30:00Z",
    views: 502,
  }),
  seed({
    id: "L-1006",
    plate: "WC 5871",
    condition: { mileageKm: 52000, grade: "excellent", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 165000,
    sellerType: "dealer",
    sellerName: PERSONAS.dealer.name,
    consignmentOwner: "Dato' Rahman",
    location: "Kuala Lumpur",
    status: "active",
    photos: photos(5, 1, 4),
    description:
      "Consignment sale for owner. Full BMW service record, tip-top condition. Priced to sell this month.",
    listedAt: "2026-07-08T01:00:00Z",
    views: 143,
  }),
  seed({
    id: "L-1007",
    plate: "JSL 7742",
    condition: { mileageKm: 88000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 118000,
    sellerType: "private",
    sellerName: "Farid Osman",
    location: "Johor Bahru",
    status: "active",
    photos: photos(6, 2),
    description: "Rogue spec, never off-road. Kampung use only, full Toyota service.",
    listedAt: "2026-07-01T09:15:00Z",
    views: 367,
    reports: [
      { reason: "Odometer concern — dashboard photo shows different mileage", at: "2026-07-09T12:00:00Z" },
      { reason: "Seller asked for a deposit outside the platform", at: "2026-07-10T16:40:00Z" },
    ],
  }),
  seed({
    id: "L-1008",
    plate: "—",
    spec: { make: "Toyota", model: "Harrier", variant: "2.0 Luxury", year: 2021, engineCc: 1986, transmission: "automatic", fuelType: "petrol", color: "Precious Black" },
    carType: "recon",
    condition: { mileageKm: 38000, grade: "excellent", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 148800,
    sellerType: "dealer",
    sellerName: PERSONAS.dealer.name,
    location: "Selangor",
    status: "active",
    photos: photos(2, 5, 7),
    description:
      "Recon unit from Japan, grade 4.5 auction sheet. Unregistered — AP and duty included in price. 5-year warranty available.",
    listedAt: "2026-07-06T04:30:00Z",
    views: 231,
  }),
  seed({
    id: "L-1009",
    plate: "—",
    spec: { make: "Proton", model: "Saga", variant: "1.3 Premium", year: 2026, engineCc: 1332, transmission: "automatic", fuelType: "petrol", color: "Jet Grey" },
    carType: "new",
    condition: { mileageKm: 0, grade: "excellent", owners: 0, accidentFree: true, floodFree: true },
    askingPrice: 41800,
    sellerType: "dealer",
    sellerName: "Weststar Motors",
    location: "Penang",
    status: "active",
    photos: photos(0, 4),
    description: "Brand new 2026 unit, ready stock. On-the-road price excluding insurance. Fast loan approval.",
    listedAt: "2026-07-09T02:00:00Z",
    views: 129,
  }),
  // ── Pending review (admin queue) ──────────────────────────────────────────
  seed({
    id: "L-2001",
    plate: "VJN 4455",
    condition: { mileageKm: 41000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 39900,
    sellerType: "private",
    sellerName: "Chong Mei Ling",
    location: "Selangor",
    status: "pending",
    photos: photos(7),
    description: "Urgent sale, moving overseas next week. Price negotiable, first come first serve.",
    listedAt: "2026-07-10T14:20:00Z",
    flags: ["Priced 40% below market valuation — too-good-to-be-true check", "Only 1 photo"],
  }),
  seed({
    id: "L-2002",
    plate: "VDK 1198",
    condition: { mileageKm: 36000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 88000,
    sellerType: "private",
    sellerName: "Raj Kumar",
    location: "Kuala Lumpur",
    status: "pending",
    photos: photos(4),
    description: "Proton X50 flagship for sale. Serious buyer only.",
    listedAt: "2026-07-11T01:05:00Z",
    flags: ["Duplicate plate — matches live listing L-1003", "Only 1 photo"],
  }),
  // Passed auto-checks → went live instantly (risk-based moderation)
  seed({
    id: "L-2003",
    plate: "BMT 6612",
    condition: { mileageKm: 77000, grade: "good", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 62500,
    sellerType: "dealer",
    sellerName: PERSONAS.dealer.name,
    location: "Selangor",
    status: "active",
    photos: photos(0, 6),
    description: "Fresh trade-in, inspection completed. Certified unit with warranty.",
    listedAt: "2026-07-10T08:40:00Z",
    views: 48,
  }),
  // ── Sold ──────────────────────────────────────────────────────────────────
  seed({
    id: "L-3001",
    plate: "VHR 2210",
    condition: { mileageKm: 66000, grade: "fair", owners: 1, accidentFree: true, floodFree: true },
    askingPrice: 27500,
    sellerType: "private",
    sellerName: PERSONAS.seller.name,
    location: "Kuala Lumpur",
    status: "sold",
    photos: photos(1),
    description: "Sold within 12 days at asking price.",
    listedAt: "2026-05-14T07:00:00Z",
    views: 891,
  }),
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "C-01",
    listingId: "L-1004",
    buyerName: "Daniel Wong",
    unread: true,
    messages: [
      { id: "m1", from: "buyer", kind: "text", at: "2026-07-09T05:12:00Z", text: "Hi, is the Civic accident-free? Can I see the service records?" },
      { id: "m2", from: "seller", kind: "text", at: "2026-07-09T07:40:00Z", text: "Yes, accident-free and full Honda service history. Can share at viewing." },
      { id: "m3", from: "buyer", kind: "offer", at: "2026-07-10T13:02:00Z", text: "I'd like to offer RM 110,000 for this car." },
    ],
  },
  {
    id: "C-02",
    listingId: "L-1004",
    buyerName: "Nurul Aina",
    unread: true,
    messages: [
      { id: "m1", from: "buyer", kind: "viewing", at: "2026-07-10T09:30:00Z", text: "Hi, I'd like to arrange a viewing / test drive this Saturday morning." },
    ],
  },
  {
    id: "C-03",
    listingId: "L-1002",
    buyerName: "Jason Teh",
    unread: true,
    messages: [
      { id: "m1", from: "buyer", kind: "text", at: "2026-07-10T11:20:00Z", text: "Can you arrange a 9-year loan for this City? My CTOS is clean." },
    ],
  },
  {
    id: "C-04",
    listingId: "L-1006",
    buyerName: "Mei Fen",
    unread: false,
    messages: [
      { id: "m1", from: "buyer", kind: "offer", at: "2026-07-09T15:45:00Z", text: "I'd like to offer RM 158,000 for this car." },
      { id: "m2", from: "seller", kind: "text", at: "2026-07-09T16:30:00Z", text: "Thanks for the offer — owner is firm at RM 162k minimum. Shall we meet halfway?" },
    ],
  },
  {
    id: "C-05",
    listingId: "L-1001",
    buyerName: PERSONAS.buyer.name,
    unread: false,
    messages: [
      { id: "m1", from: "buyer", kind: "text", at: "2026-07-08T04:00:00Z", text: "Hi, is the Myvi still available? Any accident history?" },
      { id: "m2", from: "seller", kind: "text", at: "2026-07-08T06:22:00Z", text: "Still available! No accident, first owner. Welcome to view this weekend." },
    ],
  },
];

export const SEED_DEALER_APPS: DealerApplication[] = [
  {
    id: "D-101",
    businessName: "AutoHub Kajang Sdn Bhd",
    ssmNumber: "202301012345 (1512345-K)",
    contactName: "Vincent Loh",
    phone: "+60 12-345 6789",
    status: "pending",
    appliedAt: "2026-07-09T02:00:00Z",
  },
  {
    id: "D-102",
    businessName: "MegaWheels Trading",
    ssmNumber: "202402098765 (1598765-T)",
    contactName: "Sherry Ng",
    phone: "+60 16-889 2211",
    status: "pending",
    appliedAt: "2026-07-10T10:30:00Z",
  },
  {
    id: "D-100",
    businessName: PERSONAS.dealer.name,
    ssmNumber: "201901054321 (1354321-W)",
    contactName: PERSONAS.dealer.contact,
    phone: "+60 17-220 4455",
    status: "verified",
    appliedAt: "2026-06-02T08:00:00Z",
  },
];

export const SEED_SAVED_SEARCHES: SavedSearch[] = [
  { id: "S-01", label: "Perodua Myvi under RM 50k", criteria: "Myvi · ≤ RM 50,000 · any year", newMatches: 2 },
  { id: "S-02", label: "SUV under RM 110k", criteria: "X50, CX-5, HR-V · ≤ RM 110,000", newMatches: 1 },
];

export const SEED_FAVOURITES = ["L-1001", "L-1006"];
