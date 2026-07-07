"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchSession } from "@/lib/auth";

/** Keep platform admin out of buyer/seller flows. */
export function useRedirectAdminAway(): void {
  const router = useRouter();

  useEffect(() => {
    fetchSession().then((session) => {
      if (session?.role === "admin") {
        router.replace("/admin");
      }
    });
  }, [router]);
}
