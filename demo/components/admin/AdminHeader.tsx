"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchSession, logout } from "@/lib/auth";
import type { User } from "@/lib/types";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (!session || session.role !== "admin") {
        router.replace("/login");
        return;
      }
      setUser(session);
    });
  }, [pathname, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-slate-900">
            PA
          </div>
          <span className="font-semibold">Platform Admin · Listing moderation</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="hidden text-sm text-slate-400 sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
