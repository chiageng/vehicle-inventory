"use client";

import { PortalShell, type PortalNavItem } from "@/components/PortalShell";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { conversations, listings } = useDemo();
  const myListingIds = new Set(
    listings.filter((l) => l.sellerName === PERSONAS.seller.name).map((l) => l.id)
  );
  const unread = conversations.filter((c) => myListingIds.has(c.listingId) && c.unread).length;

  const nav: PortalNavItem[] = [
    { href: "/seller", label: "Dashboard", icon: "home" },
    { href: "/seller/sell", label: "Sell a car", icon: "plus" },
    { href: "/seller/listings", label: "My listings", icon: "car" },
    { href: "/seller/messages", label: "Enquiries", icon: "chat", badge: unread || undefined },
  ];

  return (
    <PortalShell
      portalLabel="Seller portal"
      personaName={PERSONAS.seller.name}
      personaSub={PERSONAS.seller.email}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
