"use client";

import { PortalShell, type PortalNavItem } from "@/components/PortalShell";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const { conversations, listings } = useDemo();
  const myIds = new Set(
    listings.filter((l) => l.sellerName === PERSONAS.dealer.name).map((l) => l.id)
  );
  const unread = conversations.filter((c) => myIds.has(c.listingId) && c.unread).length;

  const nav: PortalNavItem[] = [
    { href: "/dealer", label: "Dashboard", icon: "home" },
    { href: "/dealer/appraise", label: "Instant appraisal", icon: "sparkles" },
    { href: "/dealer/inventory/new", label: "Add a car", icon: "plus" },
    { href: "/dealer/inventory", label: "My inventory", icon: "car" },
    { href: "/dealer/classifieds", label: "Classified listings", icon: "tag" },
    { href: "/dealer/leads", label: "Lead inbox", icon: "inbox", badge: unread || undefined },
  ];

  return (
    <PortalShell
      portalLabel="Dealer portal"
      personaName={PERSONAS.dealer.name}
      personaSub={`${PERSONAS.dealer.contact} · verified dealer`}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
