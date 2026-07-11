import type { VehicleSpec } from "./types";

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

export function vehicleTitle(spec: Pick<VehicleSpec, "year" | "make" | "model" | "variant">): string {
  return `${spec.year} ${spec.make} ${spec.model} ${spec.variant}`;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}
