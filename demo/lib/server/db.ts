import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { SEED_DATA } from "../seed-data";
import type {
  Conversation,
  ConversationMessage,
  Inquiry,
  Listing,
  MarketplaceData,
  StoredUser,
  User,
  Valuation,
  Vehicle,
  VehiclePhoto,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");
const MARKETPLACE_FILE = path.join(DATA_DIR, "marketplace.json");

const DEMO_PASSWORDS: Record<string, string> = {
  "admin@carinventory.my": "admin123",
  "reseller@carinventory.my": "reseller123",
  "sarah@example.com": "demo123",
  "james@example.com": "demo123",
  "maria@example.com": "demo123",
};

const DEFAULT_PASSWORD = "demo123";

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir();
  const tmp = `${filePath}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  renameSync(tmp, filePath);
}

function inquiryToConversation(inquiry: Inquiry, sellerId: string): Conversation {
  const messages: ConversationMessage[] = [
    {
      id: `msg-${inquiry.id}-1`,
      from: "buyer",
      senderId: inquiry.buyerId,
      senderName: inquiry.contactName,
      text: inquiry.message,
      createdAt: inquiry.createdAt,
    },
  ];

  if (inquiry.replyMessage) {
    messages.push({
      id: `msg-${inquiry.id}-2`,
      from: "seller",
      senderId: sellerId,
      senderName: "Seller",
      text: inquiry.replyMessage,
      createdAt: inquiry.repliedAt ?? inquiry.createdAt,
    });
  }

  return {
    id: inquiry.id.replace(/^inq/, "conv"),
    listingId: inquiry.listingId,
    sellerId,
    buyerId: inquiry.buyerId,
    buyerName: inquiry.contactName,
    buyerEmail: inquiry.contactEmail,
    status: inquiry.status,
    emailNotified: inquiry.emailNotified,
    smsNotified: inquiry.smsNotified,
    messages,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.repliedAt ?? inquiry.createdAt,
  };
}

function seedUsers(): StoredUser[] {
  return SEED_DATA.users.map((user) => ({
    ...user,
    password: DEMO_PASSWORDS[user.email.toLowerCase()] ?? DEFAULT_PASSWORD,
  }));
}

function seedConversations(): Conversation[] {
  return SEED_DATA.inquiries.map((inquiry) => {
    const listing = SEED_DATA.listings.find((l) => l.id === inquiry.listingId);
    return inquiryToConversation(inquiry, listing?.sellerId ?? "user-001");
  });
}

function seedMarketplace(): MarketplaceData {
  return {
    vehicles: structuredClone(SEED_DATA.vehicles),
    photos: structuredClone(SEED_DATA.photos),
    valuations: structuredClone(SEED_DATA.valuations),
    listings: structuredClone(SEED_DATA.listings),
  };
}

export function initDatabase(): void {
  ensureDataDir();
  if (!existsSync(USERS_FILE)) {
    writeJsonFile(USERS_FILE, seedUsers());
  }
  if (!existsSync(CONVERSATIONS_FILE)) {
    writeJsonFile(CONVERSATIONS_FILE, seedConversations());
  }
  if (!existsSync(MARKETPLACE_FILE)) {
    writeJsonFile(MARKETPLACE_FILE, seedMarketplace());
  }
}

export function readUsers(): StoredUser[] {
  initDatabase();
  return readJsonFile<StoredUser[]>(USERS_FILE) ?? seedUsers();
}

export function writeUsers(users: StoredUser[]): void {
  writeJsonFile(USERS_FILE, users);
}

export function readConversations(): Conversation[] {
  initDatabase();
  return readJsonFile<Conversation[]>(CONVERSATIONS_FILE) ?? seedConversations();
}

export function writeConversations(conversations: Conversation[]): void {
  writeJsonFile(CONVERSATIONS_FILE, conversations);
}

export function readMarketplace(): MarketplaceData {
  initDatabase();
  return readJsonFile<MarketplaceData>(MARKETPLACE_FILE) ?? seedMarketplace();
}

export function writeMarketplace(data: MarketplaceData): void {
  writeJsonFile(MARKETPLACE_FILE, data);
}

export function toPublicUser(user: StoredUser): User {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type { MarketplaceData, StoredUser, Vehicle, VehiclePhoto, Valuation, Listing };
