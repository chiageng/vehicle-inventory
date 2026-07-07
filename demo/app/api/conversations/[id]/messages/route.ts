import { NextResponse } from "next/server";
import { addBuyerMessage, addSellerReply } from "@/lib/server/conversation-service";
import { getSessionUser } from "@/lib/server/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { message?: string };
  const message = body.message ?? "";

  let conversation = null;
  if (user.role === "seller" || user.role === "reseller") {
    conversation = addSellerReply(id, message, user);
  }
  if (!conversation) {
    conversation = addBuyerMessage(id, message, user);
  }

  if (!conversation) {
    return NextResponse.json({ error: "Could not send message" }, { status: 400 });
  }

  return NextResponse.json({ conversation });
}
