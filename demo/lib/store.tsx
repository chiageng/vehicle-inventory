"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_CONVERSATIONS,
  SEED_DEALER_APPS,
  SEED_FAVOURITES,
  SEED_LISTINGS,
  SEED_SAVED_SEARCHES,
} from "./mock-data";
import { TAXONOMY } from "./catalog";
import { formatPct, priceDeviation } from "./valuation";
import type {
  ChatMessage,
  Conversation,
  DealerApplication,
  Listing,
  MessageKind,
  NewListingInput,
  SavedSearch,
} from "./types";

interface DemoStore {
  listings: Listing[];
  conversations: Conversation[];
  dealerApps: DealerApplication[];
  savedSearches: SavedSearch[];
  favourites: string[];
  plateAlerts: string[];

  getListing: (id: string) => Listing | undefined;
  submitListing: (input: NewListingInput) => Listing;
  decideListing: (id: string, decision: "approve" | "reject", reason?: string) => void;
  takedownListing: (id: string, reason: string) => void;
  reportListing: (id: string, reason: string) => void;
  markSold: (id: string) => void;
  withdrawListing: (id: string) => void;
  updatePrice: (id: string, price: number) => void;

  startConversation: (listingId: string, buyerName: string, text: string, kind?: MessageKind) => string;
  sendMessage: (conversationId: string, from: "buyer" | "seller", text: string, kind?: MessageKind) => void;
  markConversationRead: (id: string) => void;

  decideDealer: (id: string, status: "verified" | "rejected") => void;
  toggleFavourite: (listingId: string) => void;
  addPlateAlert: (plate: string) => void;
}

const DemoContext = createContext<DemoStore | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [dealerApps, setDealerApps] = useState<DealerApplication[]>(SEED_DEALER_APPS);
  const [savedSearches] = useState<SavedSearch[]>(SEED_SAVED_SEARCHES);
  const [favourites, setFavourites] = useState<string[]>(SEED_FAVOURITES);
  const [plateAlerts, setPlateAlerts] = useState<string[]>([]);
  const counter = useRef(100);

  const nextId = useCallback((prefix: string) => {
    counter.current += 1;
    return `${prefix}-${2100 + counter.current}`;
  }, []);

  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings]
  );

  /**
   * Risk-based moderation (SOP 6): auto-checks run on submit. Clean listings
   * go live instantly; only flagged submissions enter the manual queue.
   */
  const submitListing = useCallback(
    (input: NewListingInput): Listing => {
      const flags: string[] = [];
      const dev = priceDeviation(input.askingPrice, input.valuation.value);
      if (dev.status === "under") {
        flags.push(
          `Priced ${formatPct(dev.pct)} below market valuation — too-good-to-be-true check`
        );
      }
      if (input.photos.length <= 1) flags.push("Only 1 photo");
      const dup = listings.find(
        (l) => l.status === "active" && l.spec.plate === input.spec.plate
      );
      if (dup) flags.push(`Duplicate plate — matches live listing ${dup.id}`);
      if (!TAXONOMY[input.spec.make]?.[input.spec.model]?.includes(input.spec.variant)) {
        flags.push("Custom vehicle spec — outside catalogue, needs data-quality review");
      }
      if (input.condition.grade === "excellent" && input.photos.length < 3) {
        flags.push(
          "Photo condition analysis — declared 'Excellent' not confirmed by photos, needs review"
        );
      }

      const listing: Listing = {
        ...input,
        id: nextId("L"),
        status: flags.length > 0 ? "pending" : "active",
        views: 0,
        listedAt: new Date().toISOString(),
        flags,
        reports: [],
      };
      setListings((prev) => [listing, ...prev]);
      return listing;
    },
    [listings, nextId]
  );

  const patchListing = useCallback((id: string, patch: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const decideListing = useCallback(
    (id: string, decision: "approve" | "reject", reason?: string) => {
      patchListing(
        id,
        decision === "approve"
          ? { status: "active", flags: [] }
          : { status: "rejected", rejectReason: reason ?? "Did not meet listing policy" }
      );
    },
    [patchListing]
  );

  const takedownListing = useCallback(
    (id: string, reason: string) => patchListing(id, { status: "removed", rejectReason: reason }),
    [patchListing]
  );
  const markSold = useCallback((id: string) => patchListing(id, { status: "sold" }), [patchListing]);
  const withdrawListing = useCallback(
    (id: string) => patchListing(id, { status: "withdrawn" }),
    [patchListing]
  );
  const updatePrice = useCallback(
    (id: string, price: number) => patchListing(id, { askingPrice: price }),
    [patchListing]
  );

  const reportListing = useCallback((id: string, reason: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, reports: [...l.reports, { reason, at: new Date().toISOString() }] }
          : l
      )
    );
  }, []);

  const startConversation = useCallback(
    (listingId: string, buyerName: string, text: string, kind: MessageKind = "text") => {
      const id = nextId("C");
      const message: ChatMessage = {
        id: nextId("M"),
        from: "buyer",
        text,
        kind,
        at: new Date().toISOString(),
      };
      setConversations((prev) => [
        { id, listingId, buyerName, unread: true, messages: [message] },
        ...prev,
      ]);
      return id;
    },
    [nextId]
  );

  const sendMessage = useCallback(
    (conversationId: string, from: "buyer" | "seller", text: string, kind: MessageKind = "text") => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                unread: from === "buyer" ? true : c.unread,
                messages: [
                  ...c.messages,
                  { id: `${c.id}-m${c.messages.length + 1}`, from, text, kind, at: new Date().toISOString() },
                ],
              }
            : c
        )
      );
    },
    []
  );

  const markConversationRead = useCallback((id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  }, []);

  const decideDealer = useCallback((id: string, status: "verified" | "rejected") => {
    setDealerApps((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  const toggleFavourite = useCallback((listingId: string) => {
    setFavourites((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  }, []);

  const addPlateAlert = useCallback((plate: string) => {
    setPlateAlerts((prev) => (prev.includes(plate) ? prev : [...prev, plate]));
  }, []);

  const value = useMemo<DemoStore>(
    () => ({
      listings,
      conversations,
      dealerApps,
      savedSearches,
      favourites,
      plateAlerts,
      getListing,
      submitListing,
      decideListing,
      takedownListing,
      reportListing,
      markSold,
      withdrawListing,
      updatePrice,
      startConversation,
      sendMessage,
      markConversationRead,
      decideDealer,
      toggleFavourite,
      addPlateAlert,
    }),
    [
      listings,
      conversations,
      dealerApps,
      savedSearches,
      favourites,
      plateAlerts,
      getListing,
      submitListing,
      decideListing,
      takedownListing,
      reportListing,
      markSold,
      withdrawListing,
      updatePrice,
      startConversation,
      sendMessage,
      markConversationRead,
      decideDealer,
      toggleFavourite,
      addPlateAlert,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoStore {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
