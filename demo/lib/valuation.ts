import type { ConditionGrade, ValuationFactors } from "./types";

const BASE_VALUES: Record<string, number> = {
  "Honda|Accord|2019": 103000,
  "Honda|Accord|2020": 110000,
  "Honda|Civic|2021": 99000,
  "Toyota|Camry|2018": 92000,
  "Toyota|Camry|2020": 108000,
  "Toyota|RAV4|2021": 125000,
  "Ford|F-150|2019": 150000,
  "Ford|Mustang|2018": 132000,
  "Tesla|Model 3|2022": 165000,
  "BMW|3 Series|2019": 136000,
  "Chevrolet|Silverado|2020": 160000,
  "Nissan|Altima|2019": 82000,
  "Hyundai|Elantra|2021": 87000,
  "Mazda|CX-5|2020": 113000,
  "Subaru|Outback|2019": 106000,
};

const CONDITION_MULTIPLIERS: Record<ConditionGrade, number> = {
  excellent: 1.05,
  good: 1.0,
  fair: 0.9,
  poor: 0.75,
};

const EXPECTED_KM_PER_YEAR = 19000;
const KM_ADJUSTMENT_RATE = -0.031;

export interface ValuationInput {
  make: string;
  model: string;
  year: number;
  mileage: number;
  conditionGrade: ConditionGrade;
}

export interface ValuationResult {
  estimatedLow: number;
  estimatedMid: number;
  estimatedHigh: number;
  factors: ValuationFactors;
  algorithmVersion: "v1.0-rule-based";
}

function lookupBaseValue(make: string, model: string, year: number): number {
  const key = `${make}|${model}|${year}`;
  if (BASE_VALUES[key]) return BASE_VALUES[key];

  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  const depreciation = Math.pow(0.88, age);
  return Math.round(141000 * depreciation);
}

export function computeValuation(input: ValuationInput): ValuationResult {
  const baseValue = lookupBaseValue(input.make, input.model, input.year);
  const currentYear = new Date().getFullYear();
  const expectedMileage = Math.max(0, currentYear - input.year) * EXPECTED_KM_PER_YEAR;
  const mileageDelta = input.mileage - expectedMileage;
  const mileageAdjustment = Math.round(mileageDelta * KM_ADJUSTMENT_RATE);
  const conditionMultiplier = CONDITION_MULTIPLIERS[input.conditionGrade];

  const estimatedMid = Math.max(
    5000,
    Math.round((baseValue + mileageAdjustment) * conditionMultiplier)
  );
  const estimatedLow = Math.round(estimatedMid * 0.92);
  const estimatedHigh = Math.round(estimatedMid * 1.08);

  return {
    estimatedLow,
    estimatedMid,
    estimatedHigh,
    factors: {
      baseValue,
      mileageAdjustment,
      conditionMultiplier,
      expectedMileage,
      actualMileage: input.mileage,
    },
    algorithmVersion: "v1.0-rule-based",
  };
}
