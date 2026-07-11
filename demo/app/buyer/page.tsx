"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { useDemo } from "@/lib/store";

export default function BuyerHomePage() {
  const { listings } = useDemo();
  const router = useRouter();
  const [q, setQ] = useState("");
  const featured = listings.filter((l) => l.status === "active").slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Every car here is checked against{" "}
              <span className="text-blue-400">market value</span>.
            </h1>
            <p className="mt-3 text-slate-300">
              Browse verified listings with transparent price-vs-market badges — or check any
              plate number to see what a car is really worth.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/buyer/browse${q ? `?q=${encodeURIComponent(q)}` : ""}`);
              }}
              className="mt-6 flex max-w-xl gap-2"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search make or model — e.g. Myvi, Civic, X50"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400"
              />
              <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link
                href="/buyer/plate-check"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1.5 text-slate-300 hover:border-blue-500 hover:text-white"
              >
                <Icon name="search" className="h-3.5 w-3.5" />
                Check a plate number → instant valuation
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1.5 text-slate-300">
                <Icon name="shield" className="h-3.5 w-3.5" />
                No account needed to browse
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Fresh on the marketplace</h2>
          <Link href="/buyer/browse" className="text-sm font-medium text-blue-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">Why buyers trust EzAutoInventory</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "tag" as const,
                title: "Transparent pricing",
                text: "Every listing carries a price-vs-market badge computed from EZAUTO valuations — spot great deals and overpriced cars at a glance.",
              },
              {
                icon: "shield" as const,
                title: "Moderated listings",
                text: "Every listing passes automated fraud checks — duplicate plates and too-good-to-be-true prices are held for human review before going live.",
              },
              {
                icon: "chat" as const,
                title: "Safe communication",
                text: "Chat with sellers and dealers on-platform. Your phone number and email stay masked until you choose to share them.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
