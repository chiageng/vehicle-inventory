import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readUsers, toPublicUser, writeUsers, generateId } from "@/lib/server/db";
import { sessionCookieOptions } from "@/lib/server/session";
import type { StoredUser } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim();
  const phone = body.phone?.trim();

  if (!email || !password || !name || !phone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: generateId("user"),
    email,
    password,
    phone,
    name,
    role: "seller",
    createdAt: now,
  };

  users.push(user);
  writeUsers(users);

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions(user.id));

  return NextResponse.json({ user: toPublicUser(user) });
}
