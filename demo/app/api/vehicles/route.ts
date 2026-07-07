import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { createVehicle } from "@/lib/server/marketplace-service";
import type { VehicleInput } from "@/lib/types";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "seller" && user.role !== "reseller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as VehicleInput;
  const vehicle = createVehicle(input, user);
  return NextResponse.json({ vehicle });
}
