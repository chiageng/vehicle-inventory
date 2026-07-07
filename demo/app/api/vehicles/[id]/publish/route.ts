import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { publishListing } from "@/lib/server/marketplace-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "seller" && user.role !== "reseller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { askingPrice?: number };
  const result = publishListing(id, body.askingPrice ?? 0, user);

  if (!result) {
    return NextResponse.json({ error: "Could not publish" }, { status: 400 });
  }

  return NextResponse.json(result);
}
