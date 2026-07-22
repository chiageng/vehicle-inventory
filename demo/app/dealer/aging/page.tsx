"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { Chip, EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { formatCurrency, vehicleTitle } from "@/lib/format";
import { PERSONAS } from "@/lib/mock-data";
import {
  AGING_BANDS,
  ESTM_THRESHOLD_DAYS,
  ESTM_VALUE_HAIRCUT,
  ESTM_WARNING_DAYS,
  agingBand,
  agingStock,
  estmAdjustedValue,
  holdingCost,
  stockAgeDays,
  type AgingBand,
} from "@/lib/stock-aging";
import { useDemo } from "@/lib/store";

const BAND_ORDER: AgingBand[] = ["fresh", "aging", "warning", "estm"];

export default function DealerStockAgingPage() {
  const { listings, updatePrice } = useDemo();
  const { showToast } = useToast();

  const stock = agingStock(listings, PERSONAS.dealer.name)
    .map((l) => {
      const days = stockAgeDays(l.acquisition!.takeInDate);
      return { listing: l, days, band: agingBand(days) };
    })
    .sort((a, b) => b.days - a.days);

  const capitalDeployed = stock.reduce((sum, s) => sum + s.listing.acquisition!.costOfPurchase, 0);
  const netPotentialProfit = stock.reduce(
    (sum, s) =>
      sum +
      (s.listing.askingPrice -
        s.listing.acquisition!.costOfPurchase -
        holdingCost(s.listing.acquisition!).total),
    0
  );
  const financedExposure = stock.reduce(
    (sum, s) => sum + (s.listing.acquisition!.financing?.amount ?? 0),
    0
  );
  const interestAccrued = stock.reduce(
    (sum, s) => sum + holdingCost(s.listing.acquisition!).interest,
    0
  );
  const atRisk = stock.filter((s) => s.band === "warning" || s.band === "estm");

  return (
    <div>
      <PageHeader
        title="Stock aging & financial position"
        description="Every unit's take-in cost and age in one view — cut price and sell fast before a unit crosses the 6-month window."
        action={
          <Link
            href="/dealer/inventory/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add a car
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Capital deployed"
          value={formatCurrency(capitalDeployed)}
          sub={`cost of purchase · ${stock.length} own unit(s)`}
        />
        <StatCard
          label="Potential profit (net)"
          value={formatCurrency(netPotentialProfit)}
          sub="asking − cost − financing interest − eSTM fees"
        />
        <StatCard
          label="Financing exposure"
          value={formatCurrency(financedExposure)}
          sub={`voluntary records · ≈ ${formatCurrency(interestAccrued)} interest accrued`}
        />
        <StatCard
          label="Units at risk"
          value={atRisk.length}
          sub={`≥ ${ESTM_WARNING_DAYS} days — 6-month eSTM window`}
          accent={atRisk.length > 0}
        />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <Icon name="warning" className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <span className="font-semibold">
            A unit unsold {ESTM_THRESHOLD_DAYS / 30} months after STMS take-in becomes eSTM:
          </span>{" "}
          ownership must be transferred into your own name — a transfer fee is charged, the record
          gains <span className="font-semibold">+1 owner</span>, and the market marks the unit down
          (−{Math.round(ESTM_VALUE_HAIRCUT * 100)}% here) — while financing interest keeps
          accruing the whole time. ezAuto flags every unit from day {ESTM_WARNING_DAYS} so you can
          reprice and move it while it still sells clean.
        </p>
      </div>

      {/* Aging distribution */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Aging distribution
        </p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
          {BAND_ORDER.map((band) => {
            const count = stock.filter((s) => s.band === band).length;
            if (count === 0) return null;
            return (
              <div
                key={band}
                className={AGING_BANDS[band].bar}
                style={{ width: `${(count / stock.length) * 100}%` }}
                title={`${AGING_BANDS[band].label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {BAND_ORDER.map((band) => {
            const count = stock.filter((s) => s.band === band).length;
            return (
              <span key={band} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${AGING_BANDS[band].bar}`} />
                <span className="font-semibold">{AGING_BANDS[band].label}</span>
                <span className="text-slate-400">· {AGING_BANDS[band].hint} · {count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {stock.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No own stock with a take-in record yet"
            hint="Add a car — the take-in cost and date you enter power this report."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Take-in</th>
                <th className="px-4 py-3">Stock age</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Asking</th>
                <th className="px-4 py-3">Net margin</th>
                <th className="px-4 py-3">Financing</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map(({ listing: l, days, band }) => {
                const acq = l.acquisition!;
                const holding = holdingCost(acq);
                const netMargin = l.askingPrice - acq.costOfPurchase - holding.total;
                const marketValue = estmAdjustedValue(l.valuation.value, days);
                const meta = AGING_BANDS[band];
                return (
                  <tr key={l.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          <Image src={l.photos[0]} alt="" fill className="object-cover" sizes="64px" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{vehicleTitle(l.spec)}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <StatusBadge status={l.status} />
                            {l.carType !== "used" && (
                              <Chip tone="blue">{l.carType === "new" ? "New" : "Recon"}</Chip>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">
                        {new Date(acq.takeInDate).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-400">{acq.source}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${meta.chip}`}
                      >
                        {meta.label} · {days}d
                      </span>
                      <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={meta.bar}
                          style={{
                            width: `${Math.min(100, (days / ESTM_THRESHOLD_DAYS) * 100)}%`,
                            height: "100%",
                          }}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {days >= ESTM_THRESHOLD_DAYS
                          ? `${days - ESTM_THRESHOLD_DAYS}d past eSTM — transferred to own name, +1 owner`
                          : `${ESTM_THRESHOLD_DAYS - days}d to eSTM`}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {formatCurrency(acq.costOfPurchase)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{formatCurrency(l.askingPrice)}</p>
                      {band === "estm" ? (
                        <p className="text-[11px] font-medium text-red-500">
                          market {formatCurrency(marketValue)} · −
                          {Math.round(ESTM_VALUE_HAIRCUT * 100)}% eSTM markdown
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          market {formatCurrency(marketValue)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className={`font-semibold ${netMargin >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                        {formatCurrency(netMargin)}
                      </p>
                      {holding.total > 0 ? (
                        <p className="text-[11px] text-slate-400">
                          after {formatCurrency(holding.total)} holding cost
                          {holding.estmFee > 0 && ` (incl. ${formatCurrency(holding.estmFee)} eSTM transfer fee)`}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          {((netMargin / acq.costOfPurchase) * 100).toFixed(1)}% on cost
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {acq.financing ? (
                        <>
                          <Chip tone="amber">{formatCurrency(acq.financing.amount)}</Chip>
                          <p className="mt-1 text-slate-400">
                            {acq.financing.provider} · {acq.financing.tenureDays}d tenure
                          </p>
                          <p className="text-slate-400">
                            ≈ {formatCurrency(holding.interest)} interest accrued
                          </p>
                        </>
                      ) : (
                        <span className="text-slate-300">not recorded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(band === "warning" || band === "estm") && l.status === "active" ? (
                        <button
                          onClick={() => {
                            const cut = Math.round((l.askingPrice * 0.95) / 100) * 100;
                            updatePrice(l.id, cut);
                            showToast(
                              `Price cut 5% to ${formatCurrency(cut)} — synced to all published channels`
                            );
                          }}
                          className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                        >
                          Cut price 5%
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Consignment units are excluded — they are the owner&apos;s capital, not yours. Financing
        records are voluntary: record them to see true exposure, skip them if you prefer.
        Holding-cost figures are illustrative for the mockup: 8% p.a. on the financed amount, a
        flat RM 350 eSTM transfer fee, and a −8% eSTM market markdown — all configurable in
        production.
      </p>
    </div>
  );
}
