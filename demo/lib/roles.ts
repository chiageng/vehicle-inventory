import type { User, UserRole } from "./types";

export function loginRedirect(role: UserRole): string {
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Platform Admin";
    case "reseller":
      return "Reseller";
    case "seller":
      return "Seller";
    case "buyer":
      return "Buyer";
  }
}

export interface NavLink {
  href: string;
  label: string;
}

export function getUserNavLinks(user: User | null): NavLink[] {
  if (!user) {
    return [{ href: "/browse", label: "Browse" }];
  }
  if (user.role === "admin") {
    return [{ href: "/admin", label: "← Back to Admin" }];
  }
  if (user.role === "reseller") {
    return [
      { href: "/browse", label: "Browse" },
      { href: "/enquiries", label: "My Enquiries" },
      { href: "/sell", label: "List for Client" },
      { href: "/dashboard", label: "Client Listings" },
    ];
  }
  return [
    { href: "/browse", label: "Browse" },
    { href: "/enquiries", label: "My Enquiries" },
    { href: "/sell", label: "Sell Your Car" },
    { href: "/dashboard", label: "My Listings" },
  ];
}
