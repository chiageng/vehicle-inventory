"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchSession, logout } from "@/lib/auth";
import type { User } from "@/lib/types";

/** Seller and reseller routes require a logged-in seller/reseller account. */
export function useRequireSellerAuth(loginNext = "/dashboard"): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchSession().then((session) => {
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
      setChecked(true);
    });
  }, [router, loginNext]);

  if (!checked) return null;
  return user;
}
