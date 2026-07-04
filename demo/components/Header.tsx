"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "@/lib/auth";
import type { User } from "@/lib/types";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/sell", label: "Sell Your Car" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getSession());
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-sm">
            CI
          </div>
          <span className="text-lg font-semibold text-slate-900">CarInventory</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {(user?.role === "admin"
            ? [{ href: "/admin", label: "Admin" }, { href: "/browse", label: "Browse" }]
            : NAV_LINKS
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-teal-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-600">
                Hi, {user.name}
                {user.role === "admin" && (
                  <span className="ml-1.5 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-white">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {(user?.role === "admin"
              ? [{ href: "/admin", label: "Admin" }, { href: "/browse", label: "Browse" }]
              : NAV_LINKS
            ).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className="text-left text-sm font-medium text-slate-700">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-700">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-teal-600">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
