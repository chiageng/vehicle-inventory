"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Icon, type IconName } from "@/components/icons";
import type { ReactNode } from "react";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
}

/**
 * Professional left-sidebar shell for the seller, dealer and admin portals.
 * The buyer marketplace uses a top navbar instead (see app/buyer/layout.tsx).
 */
export function PortalShell({
  portalLabel,
  personaName,
  personaSub,
  nav,
  children,
}: {
  portalLabel: string;
  personaName: string;
  personaSub: string;
  nav: PortalNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = [...nav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4">
          <Logo dark />
          <span className="mt-2 inline-block rounded-md bg-blue-600/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-400">
            {portalLabel}
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const isActive = item === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
              {personaName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{personaName}</p>
              <p className="truncate text-xs text-slate-400">{personaSub}</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 block rounded-lg border border-slate-700 px-3 py-1.5 text-center text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            ← Switch portal
          </Link>
        </div>
      </aside>

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <p className="text-sm font-semibold text-slate-700">{active?.label ?? portalLabel}</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              Interactive mockup — no real data
            </span>
            <button className="relative rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Notifications">
              <Icon name="bell" className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
