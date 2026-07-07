import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { getAllListings } from "@/lib/server/marketplace-service";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = getAllListings();
  return NextResponse.json({ listings });
}
