import type {
  Conversation,
  Listing,
  ListingDetail,
  ListingFilters,
  PublishResult,
  User,
  Vehicle,
  VehicleInput,
} from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

function toQuery(filters: ListingFilters): string {
  const params = new URLSearchParams();
  if (filters.make) params.set("make", filters.make);
  if (filters.model) params.set("model", filters.model);
  if (filters.yearMin) params.set("yearMin", String(filters.yearMin));
  if (filters.yearMax) params.set("yearMax", String(filters.yearMax));
  if (filters.priceMin) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax) params.set("priceMax", String(filters.priceMax));
  if (filters.mileageMax) params.set("mileageMax", String(filters.mileageMax));
  if (filters.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  async fetchSession(): Promise<User | null> {
    const data = await request<{ user: User | null }>("/api/auth/me");
    return data.user;
  },

  async login(email: string, password: string): Promise<User> {
    const data = await request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return data.user;
  },

  async register(
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<User> {
    const data = await request<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, phone }),
    });
    return data.user;
  },

  async logout(): Promise<void> {
    await request("/api/auth/logout", { method: "POST" });
  },

  async searchListings(filters: ListingFilters = {}): Promise<ListingDetail[]> {
    const data = await request<{ listings: ListingDetail[] }>(
      `/api/listings${toQuery(filters)}`
    );
    return data.listings;
  },

  async getListing(listingId: string): Promise<ListingDetail | null> {
    try {
      const data = await request<{ listing: ListingDetail }>(`/api/listings/${listingId}`);
      return data.listing;
    } catch {
      return null;
    }
  },

  async getSellerListings(): Promise<ListingDetail[]> {
    const data = await request<{ listings: ListingDetail[] }>("/api/listings/mine");
    return data.listings;
  },

  async getAllListings(): Promise<ListingDetail[]> {
    const data = await request<{ listings: ListingDetail[] }>("/api/listings/all");
    return data.listings;
  },

  async updateListingStatus(
    listingId: string,
    status: Listing["status"]
  ): Promise<Listing> {
    const data = await request<{ listing: Listing }>(`/api/listings/${listingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return data.listing;
  },

  async updateListingPrice(listingId: string, askingPrice: number): Promise<Listing> {
    const data = await request<{ listing: Listing }>(`/api/listings/${listingId}/price`, {
      method: "PATCH",
      body: JSON.stringify({ askingPrice }),
    });
    return data.listing;
  },

  async createVehicle(input: VehicleInput): Promise<Vehicle> {
    const data = await request<{ vehicle: Vehicle }>("/api/vehicles", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.vehicle;
  },

  async publishListing(vehicleId: string, askingPrice: number): Promise<PublishResult> {
    return request<PublishResult>(`/api/vehicles/${vehicleId}/publish`, {
      method: "POST",
      body: JSON.stringify({ askingPrice }),
    });
  },

  async getSellerConversations(): Promise<Conversation[]> {
    const data = await request<{ conversations: Conversation[] }>(
      "/api/conversations/selling"
    );
    return data.conversations;
  },

  async getBuyerConversations(): Promise<Conversation[]> {
    const data = await request<{ conversations: Conversation[] }>(
      "/api/conversations/buying"
    );
    return data.conversations;
  },

  async createConversation(
    listingId: string,
    contactName: string,
    contactEmail: string,
    message: string
  ): Promise<Conversation> {
    const data = await request<{ conversation: Conversation }>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ listingId, contactName, contactEmail, message }),
    });
    return data.conversation;
  },

  async replyToConversation(
    conversationId: string,
    message: string
  ): Promise<Conversation> {
    const data = await request<{ conversation: Conversation }>(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    );
    return data.conversation;
  },
};
