import { NextResponse } from "next/server";
import { getConversationsForSeller } from "@/lib/server/conversation-service";
import { getSessionUser } from "@/lib/server/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "seller" && user.role !== "reseller")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = getConversationsForSeller(user.id);
  return NextResponse.json({ conversations });
}
