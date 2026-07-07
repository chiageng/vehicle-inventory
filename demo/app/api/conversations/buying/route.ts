import { NextResponse } from "next/server";
import { getConversationsForBuyer } from "@/lib/server/conversation-service";
import { getSessionUser } from "@/lib/server/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = getConversationsForBuyer(user);
  return NextResponse.json({ conversations });
}
