"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingGrid } from "@/components/ListingGrid";
import { api } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";

export default function HomePage() {
  const [featured, setFeatured] = useState<ListingDetail[]>([]);

  useEffect(() => {
    api.searchListings({ sort: "newest" }).then((listings) => {
      setFeatured(listings.slice(0, 3));
    });
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Know your car&apos;s worth. Sell with confidence.
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Get an instant valuation, set your price, and reach thousands of
              buyers on the CarInventory marketplace.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/sell"
                className="rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-400"
              >
                Sell your car
              </Link>
              <Link
                href="/browse"
                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Browse listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          How it works
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Upload your car",
              desc: "Enter number plate, specs, condition, and photos in our guided wizard.",
            },
            {
              step: "2",
              title: "Get instant valuation",
              desc: "Our engine analyzes make, mileage, and condition for a fair price range.",
            },
            {
              step: "3",
              title: "List & sell",
              desc: "Set your asking price and publish to our marketplace. Buyers contact you directly.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured listings</h2>
            <Link
              href="/browse"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8">
            <ListingGrid listings={featured} />
          </div>
        </div>
      </section>
    </>
  );
}
