"use client";

import Image from "next/image";
import { useToast } from "@/components/Toast";
import { EmptyState, StatCard, StatusBadge } from "@/components/ui";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { ClassifiedChannel, Listing } from "@/lib/types";

export const CHANNELS: ClassifiedChannel[] = [
  "Carlist.my",
  "Mudah.my",
  "Facebook Marketplace",
];

/**
 * Classifieds aggregator — publish live listings to external marketplaces
 * from one place; price and sold/withdrawn status stay in sync (mock).
 */
export function ClassifiedsManager({ listings }: { listings: Listing[] }) {
  const { toggleChannel } = useDemo();
  const { showToast } = useToast();

  const rows = listings.filter((l) => ["active", "pending"].includes(l.status));
  const live = rows.filter((l) => l.status === "active");
  const syndicated = live.filter((l) => l.channels.length > 0);
  const totalPosts = live.reduce((sum, l) => sum + l.channels.length, 0);

  if (rows.length === 0) {
    return <EmptyState title="No listings to syndicate" hint="Add a car first — live listings can then be published to external channels." />;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Live listings" value={live.length} />
        <StatCard label="Syndicated" value={syndicated.length} sub="published to ≥1 channel" />
        <StatCard label="External posts" value={totalPosts} sub={`across ${CHANNELS.length} channels`} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Status</th>
              {CHANNELS.map((c) => (
                <th key={c} className="px-4 py-3">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      <Image src={l.photos[0]} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{vehicleTitle(l.spec)}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(l.askingPrice)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
                {CHANNELS.map((c) => {
                  const published = l.channels.includes(c);
                  return (
                    <td key={c} className="px-4 py-3">
                      {l.status !== "active" ? (
                        <span className="text-xs text-slate-300" title="Available once the listing is live">
                          —
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            toggleChannel(l.id, c);
                            showToast(
                              published
                                ? `Removed from ${c} (mock)`
                                : `Published to ${c} — photos, price & details synced (mock)`
                            );
                          }}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                            published
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "border border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-700"
                          }`}
                        >
                          {published ? "Published ✓" : "Publish"}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Price edits, mark-as-sold and withdrawals sync automatically to every published channel —
        no manual re-posting. Listings in review can be syndicated once live.
      </p>
    </div>
  );
}
