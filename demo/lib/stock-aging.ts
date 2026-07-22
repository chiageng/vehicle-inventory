import type { Acquisition, Listing } from "./types";

/**
 * Domain rule: a unit that doesn't sell within 6 months of STMS take-in
 * becomes eSTM — hard to sell. Aging alerts are designed around this window.
 */
export const ESTM_THRESHOLD_DAYS = 180;
/** Early-warning window before the unit crosses into eSTM. */
export const ESTM_WARNING_DAYS = 150;

/**
 * What crossing into eSTM costs the dealer. The temporary STMS status lapses,
 * so ownership must be transferred into the dealer's own name:
 * a transfer fee is charged, and the record gains +1 owner — which the
 * market prices in as a discount.
 */
export const ESTM_TRANSFER_FEE = 350; // JPJ transfer + admin (mock figure)
export const ESTM_VALUE_HAIRCUT = 0.08; // +1 owner on record → market marks the unit down
/** Floor-stocking financing rate used to accrue holding interest (mock). */
export const FINANCING_APR = 0.08;

/** Interest accrued to date on a voluntary financing record. */
export function financingInterest(acq: Acquisition): number {
  if (!acq.financing) return 0;
  const days = stockAgeDays(acq.financing.drawdownDate);
  return Math.round(acq.financing.amount * FINANCING_APR * (days / 365));
}

/** Total holding cost to date: accrued interest + the eSTM transfer fee once crossed. */
export function holdingCost(acq: Acquisition): {
  interest: number;
  estmFee: number;
  total: number;
} {
  const interest = financingInterest(acq);
  const estmFee = stockAgeDays(acq.takeInDate) >= ESTM_THRESHOLD_DAYS ? ESTM_TRANSFER_FEE : 0;
  return { interest, estmFee, total: interest + estmFee };
}

/** Market value after the eSTM markdown (+1 owner on the record). */
export function estmAdjustedValue(marketValue: number, days: number): number {
  if (days < ESTM_THRESHOLD_DAYS) return marketValue;
  return Math.round((marketValue * (1 - ESTM_VALUE_HAIRCUT)) / 100) * 100;
}

export type AgingBand = "fresh" | "aging" | "warning" | "estm";

export const AGING_BANDS: Record<
  AgingBand,
  { label: string; hint: string; chip: string; bar: string }
> = {
  fresh: {
    label: "Healthy",
    hint: "< 90 days in stock",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
  },
  aging: {
    label: "Aging",
    hint: "90–149 days in stock",
    chip: "bg-blue-50 text-blue-700 ring-blue-200",
    bar: "bg-blue-500",
  },
  warning: {
    label: "eSTM risk",
    hint: "150–179 days — nearing the 6-month STMS window",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
  },
  estm: {
    label: "eSTM",
    hint: "≥ 180 days — past the 6-month window, hard to sell",
    chip: "bg-red-50 text-red-700 ring-red-200",
    bar: "bg-red-500",
  },
};

export function stockAgeDays(takeInDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(takeInDate).getTime()) / 86_400_000));
}

export function agingBand(days: number): AgingBand {
  if (days >= ESTM_THRESHOLD_DAYS) return "estm";
  if (days >= ESTM_WARNING_DAYS) return "warning";
  if (days >= 90) return "aging";
  return "fresh";
}

/** Dealer-owned stock (has a take-in record) that is still unsold. */
export function agingStock(listings: Listing[], dealerName: string): Listing[] {
  return listings.filter(
    (l) =>
      l.sellerName === dealerName &&
      l.acquisition &&
      !["sold", "removed", "withdrawn"].includes(l.status)
  );
}
