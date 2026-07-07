import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { createConversation } from "@/lib/server/conversation-service";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    listingId?: string;
    contactName?: string;
    contactEmail?: string;
    message?: string;
  };

  const user = await getSessionUser();
  const conversation = createConversation(
    body.listingId ?? "",
    body.contactName ?? "",
    body.contactEmail ?? "",
    body.message ?? "",
    user
  );

  if (!conversation) {
    return NextResponse.json({ error: "Could not start conversation" }, { status: 400 });
  }

  return NextResponse.json({ conversation });
}
