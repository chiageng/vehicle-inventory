"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSession } from "@/lib/auth";

/** Keep platform admins on /admin — user routes redirect away. */
export function useRedirectAdminAway() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session?.role === "admin") {
      router.replace("/admin");
    }
  }, [router]);
}
