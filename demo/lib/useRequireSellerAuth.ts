"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import type { User } from "@/lib/types";

/** Seller and reseller routes require a logged-in seller/reseller account. */
export function useRequireSellerAuth(loginNext = "/dashboard"): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }
    if (session.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (session.role !== "seller" && session.role !== "reseller") {
      router.replace("/browse");
      return;
    }
    setUser(session);
  }, [router]);

  return user;
}
