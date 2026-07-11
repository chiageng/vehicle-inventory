"use client";

import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState, SectionCard } from "@/components/ui";
import { useDemo } from "@/lib/store";

export default function SavedPage() {
  const { listings, favourites, savedSearches, plateAlerts } = useDemo();
  const favListings = listings.filter((l) => favourites.includes(l.id) && l.status === "active");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Saved</h1>
      <p className="mt-1 text-sm text-slate-500">
        Favourites, saved searches and plate alerts — you get notified when something new matches.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-slate-700">Favourite cars</h2>
          {favListings.length === 0 ? (
            <EmptyState title="No favourites yet" hint="Tap the heart on any listing to save it here." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {favListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <SectionCard title="Saved searches">
            <ul className="space-y-3">
              {savedSearches.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.criteria}</p>
                  </div>
                  {s.newMatches > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {s.newMatches} new
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              Email alerts go out when new listings match a saved search.
            </p>
          </SectionCard>

          <SectionCard title="Plate alerts">
            {plateAlerts.length === 0 ? (
              <p className="text-xs text-slate-400">
                Check a plate that isn&apos;t listed yet and tap &quot;Notify me&quot; — alerts
                appear here.
              </p>
            ) : (
              <ul className="space-y-2">
                {plateAlerts.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Icon name="bell" className="h-4 w-4 text-blue-600" />
                    <span className="font-mono">{p}</span>
                    <span className="text-xs text-slate-400">— watching for a listing</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
