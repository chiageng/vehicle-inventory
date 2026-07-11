import { BASE_VALUES_2023, CURRENT_YEAR, TAXONOMY } from "./catalog";
import type {
  Valuation,
  VehicleCondition,
  VehicleSpec,
} from "./types";

/**
 * Mock of the EZAUTO valuation SaaS. It returns a single market value (MYR) —
 * no range. Two-stage per SOP 2: an instant estimate from identity fields
 * alone, refined (more accurate) once condition fields are supplied.
 */

const REF_YEAR = 2023;
const YEARLY_DEPRECIATION = 0.9;
const EXPECTED_KM_PER_YEAR = 18000;
const RM_PER_KM = 0.08;

const GRADE_MULTIPLIERS: Record<VehicleCondition["grade"], number> = {
  excellent: 1.06,
  good: 1.0,
  fair: 0.9,
  poor: 0.78,
};

function variantMultiplier(spec: VehicleSpec): number {
  const variants = TAXONOMY[spec.make]?.[spec.model] ?? [];
  const idx = Math.max(0, variants.indexOf(spec.variant));
  return 0.92 + idx * 0.05;
}

export function valuate(
  spec: VehicleSpec,
  condition?: VehicleCondition
): Valuation {
  const base = BASE_VALUES_2023[`${spec.make}|${spec.model}`] ?? 65000;
  const age = Math.max(0, REF_YEAR - spec.year);
  const baseValue = Math.round(
    base * Math.pow(YEARLY_DEPRECIATION, age) * variantMultiplier(spec)
  );

  let mileageAdjustment = 0;
  let conditionMultiplier = 1;

  if (condition) {
    const expectedKm = Math.max(1, CURRENT_YEAR - spec.year) * EXPECTED_KM_PER_YEAR;
    mileageAdjustment = Math.round((expectedKm - condition.mileageKm) * RM_PER_KM);
    conditionMultiplier = GRADE_MULTIPLIERS[condition.grade];
    if (condition.owners > 2) conditionMultiplier *= 0.97;
    if (!condition.accidentFree) conditionMultiplier *= 0.85;
    if (!condition.floodFree) conditionMultiplier *= 0.7;
  }

  const value = Math.max(
    5000,
    Math.round((baseValue + mileageAdjustment) * conditionMultiplier)
  );

  return {
    value,
    stage: condition ? "refined" : "instant",
    source: "ezauto",
    factors: {
      baseValue,
      mileageAdjustment,
      conditionMultiplier: Math.round(conditionMultiplier * 100) / 100,
    },
  };
}

/** SOP 3 — price deviation vs the retrieved valuation. Advisory threshold ±15%. */
export const DEVIATION_THRESHOLD = 0.15;

export type DeviationStatus = "market" | "over" | "under";

export interface Deviation {
  pct: number; // e.g. -0.31 = 31% below mid
  status: DeviationStatus;
}

export function priceDeviation(askingPrice: number, value: number): Deviation {
  const pct = (askingPrice - value) / value;
  const status: DeviationStatus =
    pct > DEVIATION_THRESHOLD ? "over" : pct < -DEVIATION_THRESHOLD ? "under" : "market";
  return { pct, status };
}

export function formatPct(pct: number): string {
  const abs = Math.round(Math.abs(pct) * 100);
  return `${abs}%`;
}
