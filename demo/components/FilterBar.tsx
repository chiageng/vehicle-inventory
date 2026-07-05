"use client";

import { MAKES } from "@/lib/seed-data";
import type { ListingFilters, SortOption } from "@/lib/types";

interface FilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "mileage_asc", label: "Lowest Mileage" },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function update(partial: Partial<ListingFilters>) {
    onChange({ ...filters, ...partial });
  }

  function clearFilters() {
    onChange({ sort: filters.sort });
  }

  const hasFilters =
    filters.make ||
    filters.model ||
    filters.yearMin ||
    filters.yearMax ||
    filters.priceMin ||
    filters.priceMax ||
    filters.mileageMax;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[140px] flex-1">
          <label className="block text-xs font-medium text-slate-500">Make</label>
          <select
            value={filters.make ?? ""}
            onChange={(e) => update({ make: e.target.value || undefined })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All makes</option>
            {MAKES.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[120px] flex-1">
          <label className="block text-xs font-medium text-slate-500">Model</label>
          <input
            type="text"
            placeholder="Accord"
            value={filters.model ?? ""}
            onChange={(e) => update({ model: e.target.value || undefined })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="w-24">
          <label className="block text-xs font-medium text-slate-500">Year min</label>
          <input
            type="number"
            placeholder="2015"
            value={filters.yearMin ?? ""}
            onChange={(e) =>
              update({ yearMin: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="w-24">
          <label className="block text-xs font-medium text-slate-500">Year max</label>
          <input
            type="number"
            placeholder="2024"
            value={filters.yearMax ?? ""}
            onChange={(e) =>
              update({ yearMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="w-28">
          <label className="block text-xs font-medium text-slate-500">Min price</label>
          <input
            type="number"
            placeholder="RM 50,000"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              update({ priceMin: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="w-28">
          <label className="block text-xs font-medium text-slate-500">Max price</label>
          <input
            type="number"
            placeholder="RM 250,000"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              update({ priceMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="w-32">
          <label className="block text-xs font-medium text-slate-500">Max mileage</label>
          <input
            type="number"
            placeholder="130,000"
            value={filters.mileageMax ?? ""}
            onChange={(e) =>
              update({ mileageMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500">Sort by</label>
          <select
            value={filters.sort ?? "newest"}
            onChange={(e) => update({ sort: e.target.value as SortOption })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="rounded-lg px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
