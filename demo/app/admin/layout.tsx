"use client";

import { PortalShell, type PortalNavItem } from "@/components/PortalShell";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { listings, dealerApps } = useDemo();
  const pending = listings.filter((l) => l.status === "pending").length;
  const pendingDealers = dealerApps.filter((d) => d.status === "pending").length;

  const nav: PortalNavItem[] = [
    { href: "/admin", label: "Overview", icon: "chart" },
    { href: "/admin/queue", label: "Review queue", icon: "clipboard", badge: pending || undefined },
    { href: "/admin/listings", label: "All listings", icon: "car" },
    { href: "/admin/dealers", label: "Dealer verification", icon: "users", badge: pendingDealers || undefined },
  ];

  return (
    <PortalShell
      portalLabel="Platform admin"
      personaName={PERSONAS.admin.name}
      personaSub={PERSONAS.admin.label}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
