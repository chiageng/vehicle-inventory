"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/ui";
import { TAXONOMY } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/lib/store";

type SortKey = "newest" | "price_asc" | "price_desc" | "mileage_asc";

export function BrowseClient({ initialQuery }: { initialQuery: string }) {
  const { listings } = useDemo();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [make, setMake] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [transmission, setTransmission] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [compare, setCompare] = useState<string[]>([]);

  const results = useMemo(() => {
    let out = listings.filter((l) => l.status === "active");
    if (query) {
      const q = query.toLowerCase();
      out = out.filter((l) =>
        `${l.spec.make} ${l.spec.model} ${l.spec.variant}`.toLowerCase().includes(q)
      );
    }
    if (make) out = out.filter((l) => l.spec.make === make);
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
  }, [listings, query, make, maxPrice, minYear, transmission, sort]);

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Buy cars</h1>
      <p className="mt-1 text-sm text-slate-500">
        {results.length} live listings · every price checked against EZAUTO market valuation ·
        tick <span className="font-semibold text-slate-700">Compare</span> on 2–3 cars to see
        them side by side
      </p>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search model…"
            className="w-44 rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-sm"
          />
        </div>
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

      {/* Grid */}
      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No cars match your filters" hint="Try widening the price or year range." />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Compare bar — appears from the first selection so the action is discoverable */}
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
