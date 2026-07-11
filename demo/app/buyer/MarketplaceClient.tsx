"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/ui";
import { TAXONOMY } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/lib/store";

type SortKey = "newest" | "price_asc" | "price_desc" | "mileage_asc";

export function MarketplaceClient({ initialQuery }: { initialQuery: string }) {
  const { listings } = useDemo();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [make, setMake] = useState("");
  const [carType, setCarType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [transmission, setTransmission] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [compare, setCompare] = useState<string[]>([]);

  const results = useMemo(() => {
    let out = listings.filter((l) => l.status === "active");
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const plateQ = query.trim().toUpperCase().replace(/\s+/g, "");
      out = out.filter(
        (l) =>
          `${l.spec.make} ${l.spec.model} ${l.spec.variant}`.toLowerCase().includes(q) ||
          (plateQ.length >= 3 && l.spec.plate.replace(/\s+/g, "").includes(plateQ))
      );
    }
    if (make) out = out.filter((l) => l.spec.make === make);
    if (carType) out = out.filter((l) => l.carType === carType);
    if (maxPrice) out = out.filter((l) => l.askingPrice <= Number(maxPrice));
    if (minYear) out = out.filter((l) => l.spec.year >= Number(minYear));
    if (transmission) out = out.filter((l) => l.spec.transmission === transmission);
    switch (sort) {
      case "price_asc":
        out = [...out].sort((a, b) => a.askingPrice - b.askingPrice);
        break;
      case "price_desc":
        out = [...out].sort((a, b) => b.askingPrice - a.askingPrice);
        break;
      case "mileage_asc":
        out = [...out].sort((a, b) => a.condition.mileageKm - b.condition.mileageKm);
        break;
      default:
        out = [...out].sort((a, b) => b.listedAt.localeCompare(a.listedAt));
    }
    return out;
  }, [listings, query, make, carType, maxPrice, minYear, transmission, sort]);

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );

  return (
    <div>
      {/* Hero with the main search — filters the grid below live */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Every car here is checked against{" "}
              <span className="text-blue-400">market value</span>.
            </h1>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex max-w-xl gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by model or plate — e.g. Myvi, Civic or VBU 3421"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400"
              />
              <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link
                href="/buyer/plate-check"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1.5 text-slate-300 hover:border-blue-500 hover:text-white"
              >
                <Icon name="search" className="h-3.5 w-3.5" />
                Car not listed here? Check any plate → data + valuation
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1.5 text-slate-300">
                <Icon name="shield" className="h-3.5 w-3.5" />
                No account needed to browse
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <select value={carType} onChange={(e) => setCarType(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">New / used / recon</option>
            <option value="new">New</option>
            <option value="used">Used (second-hand)</option>
            <option value="recon">Recon</option>
          </select>
          <select value={make} onChange={(e) => setMake(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">All makes</option>
            {Object.keys(TAXONOMY).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Any price</option>
            {[50000, 80000, 100000, 130000, 180000].map((p) => (
              <option key={p} value={p}>
                ≤ {formatCurrency(p)}
              </option>
            ))}
          </select>
          <select value={minYear} onChange={(e) => setMinYear(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Any year</option>
            {[2018, 2019, 2020, 2021, 2022].map((y) => (
              <option key={y} value={y}>
                {y}+
              </option>
            ))}
          </select>
          <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Any transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
          <span className="ml-auto flex items-center gap-2 text-sm text-slate-500">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="mileage_asc">Mileage: lowest</option>
            </select>
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {results.length} live listing{results.length === 1 ? "" : "s"} · tick{" "}
          <span className="font-semibold text-slate-700">Compare</span> on 2–3 cars to see them
          side by side
        </p>

        {/* Grid */}
        {results.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No cars match your search"
              hint="Try widening the filters — or check the plate on the Plate Check page if the car isn't listed here."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                compareChecked={compare.includes(l.id)}
                onCompareToggle={() => toggleCompare(l.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust strip */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
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

      {/* Compare bar */}
      {compare.length >= 1 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-full bg-slate-900 px-5 py-3 text-white shadow-xl">
            <span className="text-sm font-medium">
              {compare.length === 1
                ? "1 selected — pick at least one more to compare"
                : `${compare.length} cars selected`}
            </span>
            <button
              onClick={() => router.push(`/buyer/compare?ids=${compare.join(",")}`)}
              disabled={compare.length < 2}
              className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-40"
            >
              Compare
            </button>
            <button onClick={() => setCompare([])} className="text-xs text-slate-400 hover:text-white">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
