import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { updateListingStatus } from "@/lib/server/marketplace-service";
import type { Listing } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: Listing["status"] };
  if (!body.status) {
    return NextResponse.json({ error: "Status required" }, { status: 400 });
  }

  const listing = updateListingStatus(id, body.status);
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}
