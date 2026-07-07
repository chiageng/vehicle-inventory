import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readUsers, toPublicUser } from "@/lib/server/db";
import { sessionCookieOptions } from "@/lib/server/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email);

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions(user.id));

  return NextResponse.json({ user: toPublicUser(user) });
}
