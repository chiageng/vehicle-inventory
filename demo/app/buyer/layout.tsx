"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { useDemo } from "@/lib/store";
import { PERSONAS } from "@/lib/mock-data";

const NAV = [
  { href: "/buyer/browse", label: "Buy cars" },
  { href: "/buyer/plate-check", label: "Plate check" },
  { href: "/buyer/saved", label: "Saved" },
  { href: "/buyer/messages", label: "Messages" },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { conversations } = useDemo();
  const myChats = conversations.filter((c) => c.buyerName === PERSONAS.buyer.name).length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo href="/buyer" />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                    {item.href === "/buyer/messages" && myChats > 0 && (
                      <span className="absolute -right-0.5 top-1 h-2 w-2 rounded-full bg-blue-600" />
                    )}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 lg:block">
              Mockup — no real data
            </span>
            <Link
              href="/login?role=seller"
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sell your car
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Switch portal
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <Icon name={menuOpen ? "x" : "menu"} className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                  {item.href === "/buyer/messages" && myChats > 0 && (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </Link>
              );
            })}
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <Link
                href="/login?role=seller"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white"
              >
                Sell your car
              </Link>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium text-slate-600"
              >
                Switch portal
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-slate-400 sm:px-6">
          <p>EzAutoInventory — product mockup. Valuations simulated via EZAUTO datahouse integration point.</p>
          <p>Browsing needs no account · contact details are masked in chat</p>
        </div>
      </footer>
    </div>
  );
}
