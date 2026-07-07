import { NextResponse } from "next/server";
import { updateListingPrice } from "@/lib/server/marketplace-service";
import { getSessionUser } from "@/lib/server/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "seller" && user.role !== "reseller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { askingPrice?: number };
  if (!body.askingPrice || body.askingPrice <= 0) {
    return NextResponse.json({ error: "Valid price required" }, { status: 400 });
  }

  const listing = updateListingPrice(id, body.askingPrice, user);
  if (!listing) {
    return NextResponse.json({ error: "Could not update price" }, { status: 400 });
  }

  return NextResponse.json({ listing });
}
