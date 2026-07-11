import { priceDeviation } from "@/lib/valuation";
import type { Valuation } from "@/lib/types";

/**
 * Buyer-facing price-vs-market signal (SOP 3). Same deviation math the
 * seller warning uses, phrased for buyers.
 */
export function PriceBadge({
  price,
  valuation,
  className = "",
}: {
  price: number;
  valuation: Valuation;
  className?: string;
}) {
  const { pct } = priceDeviation(price, valuation.value);

  let label: string;
  let cls: string;
  if (pct <= -0.05) {
    label = "Great deal";
    cls = "bg-emerald-100 text-emerald-800";
  } else if (pct <= 0.08) {
    label = "At market price";
    cls = "bg-blue-50 text-blue-700";
  } else {
    label = "Above market";
    cls = "bg-amber-100 text-amber-800";
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${cls} ${className}`}>
      {label}
    </span>
  );
}
