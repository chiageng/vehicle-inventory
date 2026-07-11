import type { VehicleSpec } from "./types";

export const CURRENT_YEAR = 2026;

/**
 * Vehicle taxonomy used when a plate lookup misses — manual selection is
 * always a dropdown pick (make → model → variant), never free text.
 */
export const TAXONOMY: Record<string, Record<string, string[]>> = {
  Perodua: {
    Myvi: ["1.3 G", "1.5 H", "1.5 AV"],
    Axia: ["1.0 G", "1.0 AV"],
    Bezza: ["1.3 X", "1.3 AV"],
  },
  Proton: {
    Saga: ["1.3 Standard", "1.3 Premium"],
    X50: ["1.5 Standard", "1.5 Executive", "1.5 TGDI Flagship"],
    Persona: ["1.6 Standard", "1.6 Premium"],
  },
  Honda: {
    City: ["1.5 S", "1.5 E", "1.5 V"],
    Civic: ["1.5 TC", "1.5 TC-P"],
    "HR-V": ["1.5 E", "1.5 V"],
  },
  Toyota: {
    Vios: ["1.5 E", "1.5 G"],
    Hilux: ["2.4 E", "2.8 Rogue"],
    "Corolla Cross": ["1.8 G", "1.8 V"],
    Harrier: ["2.0 Luxury", "2.0 Premium"],
  },
  Mazda: {
    "CX-5": ["2.0 Mid", "2.0 High"],
    Mazda3: ["2.0 High", "2.0 High Plus"],
  },
  BMW: {
    "3 Series": ["320i Sport", "330i M Sport"],
  },
  Nissan: {
    Almera: ["1.0 VL", "1.0 VLT"],
  },
};

export const MODEL_CC: Record<string, number> = {
  "Perodua|Myvi": 1496,
  "Perodua|Axia": 998,
  "Perodua|Bezza": 1329,
  "Proton|Saga": 1332,
  "Proton|X50": 1477,
  "Proton|Persona": 1597,
  "Honda|City": 1497,
  "Honda|Civic": 1498,
  "Honda|HR-V": 1498,
  "Toyota|Vios": 1496,
  "Toyota|Hilux": 2755,
  "Toyota|Corolla Cross": 1798,
  "Toyota|Harrier": 1986,
  "Mazda|CX-5": 1998,
  "Mazda|Mazda3": 1998,
  "BMW|3 Series": 1998,
  "Nissan|Almera": 999,
};

/** Reference retail value (MYR) for a 2023 unit of each model. */
export const BASE_VALUES_2023: Record<string, number> = {
  "Perodua|Myvi": 55000,
  "Perodua|Axia": 36000,
  "Perodua|Bezza": 42000,
  "Proton|Saga": 38000,
  "Proton|X50": 98000,
  "Proton|Persona": 46000,
  "Honda|City": 82000,
  "Honda|Civic": 132000,
  "Honda|HR-V": 108000,
  "Toyota|Vios": 86000,
  "Toyota|Hilux": 145000,
  "Toyota|Corolla Cross": 124000,
  "Toyota|Harrier": 178000,
  "Mazda|CX-5": 132000,
  "Mazda|Mazda3": 138000,
  "BMW|3 Series": 245000,
  "Nissan|Almera": 80000,
};

/**
 * Mock of the EZAUTO Central Vehicle Datahouse plate index.
 * A plate lookup that hits returns the full registered spec (auto-fill);
 * a miss falls back to manual taxonomy selection.
 */
export const PLATE_DB: Record<string, Omit<VehicleSpec, "plate">> = {
  "VBU 3421": { make: "Perodua", model: "Myvi", variant: "1.5 AV", year: 2021, engineCc: 1496, transmission: "automatic", fuelType: "petrol", color: "Granite Grey" },
  "WXD 8823": { make: "Honda", model: "City", variant: "1.5 V", year: 2020, engineCc: 1497, transmission: "automatic", fuelType: "petrol", color: "Platinum White" },
  "VDK 1198": { make: "Proton", model: "X50", variant: "1.5 TGDI Flagship", year: 2022, engineCc: 1477, transmission: "automatic", fuelType: "petrol", color: "Snow White" },
  "BMT 6612": { make: "Toyota", model: "Vios", variant: "1.5 G", year: 2020, engineCc: 1496, transmission: "automatic", fuelType: "petrol", color: "Attitude Black" },
  "PPV 2214": { make: "Honda", model: "Civic", variant: "1.5 TC-P", year: 2021, engineCc: 1498, transmission: "automatic", fuelType: "petrol", color: "Lunar Silver" },
  "JSL 7742": { make: "Toyota", model: "Hilux", variant: "2.8 Rogue", year: 2021, engineCc: 2755, transmission: "automatic", fuelType: "diesel", color: "Bronze Mica" },
  "VEL 5529": { make: "Mazda", model: "CX-5", variant: "2.0 High", year: 2020, engineCc: 1998, transmission: "automatic", fuelType: "petrol", color: "Soul Red Crystal" },
  "WC 5871": { make: "BMW", model: "3 Series", variant: "330i M Sport", year: 2020, engineCc: 1998, transmission: "automatic", fuelType: "petrol", color: "Alpine White" },
  "VJN 4455": { make: "Nissan", model: "Almera", variant: "1.0 VLT", year: 2021, engineCc: 999, transmission: "automatic", fuelType: "petrol", color: "Brilliant Silver" },
  // Fresh plates for live wizard / appraisal demos
  "VHR 2210": { make: "Perodua", model: "Axia", variant: "1.0 AV", year: 2020, engineCc: 998, transmission: "automatic", fuelType: "petrol", color: "Lava Red" },
  "WPM 9083": { make: "Proton", model: "Saga", variant: "1.3 Premium", year: 2021, engineCc: 1332, transmission: "automatic", fuelType: "petrol", color: "Armour Silver" },
};

export function lookupPlate(raw: string): VehicleSpec | null {
  const plate = raw.trim().toUpperCase().replace(/\s+/g, " ");
  const hit = PLATE_DB[plate];
  return hit ? { plate, ...hit } : null;
}

export const LOCATIONS = [
  "Kuala Lumpur",
  "Selangor",
  "Penang",
  "Johor Bahru",
  "Melaka",
  "Ipoh",
];

export const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - 1 - i);
