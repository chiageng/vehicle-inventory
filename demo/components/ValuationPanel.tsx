import { formatCurrency } from "@/lib/format";
import type { Valuation } from "@/lib/types";

export function ValuationPanel({
  valuation,
  compact = false,
}: {
  valuation: Valuation;
  compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
      <div className="flex items-center justify-between border-b border-blue-100 px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
          EZAUTO Market Valuation
        </p>
        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {valuation.stage === "instant" ? "Instant estimate" : "Refined"}
        </span>
      </div>
      <div className="px-4 py-4">
        <div className="text-center">
          <p className="text-[11px] font-medium text-blue-600">Retrieved market value</p>
          <p className="text-3xl font-bold text-blue-800">{formatCurrency(valuation.value)}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {valuation.stage === "instant"
              ? "Based on identity fields only — add condition for a more accurate figure"
              : "Adjusted for mileage, condition and history"}
          </p>
        </div>

        {!compact && (
          <dl className="mt-4 space-y-1.5 border-t border-blue-100 pt-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <dt>Base value ({valuation.stage === "instant" ? "identity fields" : "spec"})</dt>
              <dd className="font-medium">{formatCurrency(valuation.factors.baseValue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Mileage adjustment</dt>
              <dd className="font-medium">
                {valuation.factors.mileageAdjustment >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(valuation.factors.mileageAdjustment))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Condition multiplier</dt>
              <dd className="font-medium">×{valuation.factors.conditionMultiplier.toFixed(2)}</dd>
            </div>
          </dl>
        )}

        <p className="mt-3 text-[10px] text-slate-400">
          Source: EZAUTO Central Vehicle Datahouse (mock) · cached 30 days · versioned for audit
        </p>
      </div>
    </div>
  );
}
