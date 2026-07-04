export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("en-MY").format(mileage) + " km";
}

export function formatCondition(grade: string): string {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function vehicleTitle(vehicle: {
  year: number;
  make: string;
  model: string;
  trim?: string;
}): string {
  const trim = vehicle.trim ? ` ${vehicle.trim}` : "";
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${trim}`;
}
