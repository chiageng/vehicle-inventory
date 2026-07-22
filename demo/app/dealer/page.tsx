"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { formatCurrency, timeAgo, vehicleTitle } from "@/lib/format";
import { PERSONAS } from "@/lib/mock-data";
import {
  AGING_BANDS,
  ESTM_WARNING_DAYS,
  agingBand,
  agingStock,
  stockAgeDays,
} from "@/lib/stock-aging";
import { useDemo } from "@/lib/store";

export default function DealerDashboardPage() {
  const { listings, conversations } = useDemo();
  const stock = listings.filter(
    (l) => l.sellerName === PERSONAS.dealer.name && !["sold", "removed"].includes(l.status)
  );
  const consignments = stock.filter((l) => l.consignmentOwner);
  const myIds = new Set(stock.map((l) => l.id));
  const leads = conversations.filter((c) => myIds.has(c.listingId));
  const unread = leads.filter((c) => c.unread).length;
  const ownStock = agingStock(listings, PERSONAS.dealer.name);
  const capitalDeployed = ownStock.reduce((sum, l) => sum + l.acquisition!.costOfPurchase, 0);
  const atRisk = ownStock.filter((l) => stockAgeDays(l.acquisition!.takeInDate) >= ESTM_WARNING_DAYS);

  return (
    <div>
      <PageHeader
        title={PERSONAS.dealer.name}
        description="Inventory, consignments and buyer leads in one place."
        action={
          <div className="flex gap-2">
            <Link
              href="/dealer/appraise"
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Instant appraisal
            </Link>
            <Link
              href="/dealer/inventory/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add a car
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Units in stock" value={stock.length} sub={`${consignments.length} consignment(s)`} />
        <StatCard label="Capital deployed" value={formatCurrency(capitalDeployed)} sub="cost of purchase, own stock" />
        <StatCard
          label="Aging risk"
          value={atRisk.length}
          sub={`unit(s) ≥ ${ESTM_WARNING_DAYS} days — eSTM window`}
          accent={atRisk.length > 0}
        />
        <StatCard label="Active leads" value={leads.length} sub={unread ? `${unread} unread` : "all handled"} accent={unread > 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Inventory snapshot"
          className="lg:col-span-2"
          action={
            <Link href="/dealer/inventory" className="text-xs font-medium text-blue-700 hover:underline">
              Full inventory →
            </Link>
          }
        >
          <ul className="divide-y divide-slate-100">
            {stock.map((l) => {
              const days = l.acquisition ? stockAgeDays(l.acquisition.takeInDate) : null;
              const band = days !== null ? agingBand(days) : null;
              return (
                <li key={l.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-[72px] shrink-0 overflow-hidden rounded-md bg-slate-100">
                    <Image src={l.photos[0]} alt="" fill className="object-cover" sizes="72px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {vehicleTitle(l.spec)}
                      {l.consignmentOwner && (
                        <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          consignment
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(l.askingPrice)} · {l.views} views ·{" "}
                      {conversations.filter((c) => c.listingId === l.id).length} lead(s)
                    </p>
                  </div>
                  {band !== null && days !== null && (
                    <span
                      className={`hidden shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset sm:inline-flex ${AGING_BANDS[band].chip}`}
                      title={AGING_BANDS[band].hint}
                    >
                      {days}d in stock
                    </span>
                  )}
                  <StatusBadge status={l.status} />
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <div className="space-y-5">
          {atRisk.length > 0 && (
            <SectionCard
              title="Aging stock — act now"
              action={
                <Link href="/dealer/aging" className="text-xs font-medium text-blue-700 hover:underline">
                  Stock aging →
                </Link>
              }
            >
              <ul className="space-y-2.5">
                {atRisk.map((l) => {
                  const days = stockAgeDays(l.acquisition!.takeInDate);
                  const band = agingBand(days);
                  return (
                    <li key={l.id} className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs font-medium text-slate-700">
                        {vehicleTitle(l.spec)}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${AGING_BANDS[band].chip}`}
                      >
                        {AGING_BANDS[band].label} · {days}d
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[11px] text-slate-400">
                Unsold 6 months after take-in ⇒ eSTM, hard to sell. Reprice these units early.
              </p>
            </SectionCard>
          )}

          <SectionCard title="Latest leads">
            {leads.length === 0 ? (
              <p className="text-xs text-slate-400">No leads yet.</p>
            ) : (
              <ul className="space-y-3">
                {leads.slice(0, 3).map((c) => {
                  const listing = listings.find((l) => l.id === c.listingId);
                  const last = c.messages[c.messages.length - 1];
                  return (
                    <li key={c.id} className="rounded-lg border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{c.buyerName}</p>
                        {c.unread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {listing ? vehicleTitle(listing.spec) : ""}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {last?.text} · {last ? timeAgo(last.at) : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-sm">
            <Icon name="sparkles" className="h-6 w-6 text-blue-200" />
            <p className="mt-2 text-sm font-bold">Appraise a trade-in on the spot</p>
            <p className="mt-1 text-xs text-blue-100">
              Plate in → EZAUTO market value out, in seconds. Then push it straight to
              inventory.
            </p>
            <Link
              href="/dealer/appraise"
              className="mt-3 inline-block rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
            >
              Open appraisal tool →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
