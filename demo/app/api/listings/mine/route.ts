import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { getSellerListings } from "@/lib/server/marketplace-service";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "seller" && user.role !== "reseller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = getSellerListings(user.id);
  return NextResponse.json({ listings });
}
