import { formatCurrency } from "@/lib/format";
import type { Valuation } from "@/lib/types";

interface ValuationCardProps {
  valuation: Valuation;
}

export function ValuationCard({ valuation }: ValuationCardProps) {
  const { factors } = valuation;

  return (
    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Your Valuation</h3>
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
          {valuation.algorithmVersion}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Low</p>
          <p className="mt-1 text-xl font-bold text-slate-700">
            {formatCurrency(valuation.estimatedLow)}
          </p>
        </div>
        <div className="rounded-lg bg-teal-600 px-2 py-3 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-100">Mid</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(valuation.estimatedMid)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">High</p>
          <p className="mt-1 text-xl font-bold text-slate-700">
            {formatCurrency(valuation.estimatedHigh)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-700">How we calculated this</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <FactorChip
            label="Base value"
            value={formatCurrency(factors.baseValue)}
          />
          <FactorChip
            label="Mileage adj."
            value={formatCurrency(factors.mileageAdjustment)}
            positive={factors.mileageAdjustment > 0}
          />
          <FactorChip
            label="Condition"
            value={`×${factors.conditionMultiplier}`}
          />
          <FactorChip
            label="Expected mi."
            value={`${factors.expectedMileage.toLocaleString("en-MY")} km`}
          />
        </div>
      </div>
    </div>
  );
}

function FactorChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs border border-slate-200">
      <span className="text-slate-500">{label}:</span>
      <span
        className={`font-medium ${
          positive === true
            ? "text-emerald-600"
            : positive === false && value.startsWith("-")
              ? "text-red-600"
              : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </span>
  );
}
