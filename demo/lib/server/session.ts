import { cookies } from "next/headers";
import { readUsers, toPublicUser } from "./db";
import type { User } from "../types";

export const SESSION_COOKIE = "carinventory_uid";

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  return user ? toPublicUser(user) : null;
}

export function sessionCookieOptions(userId: string) {
  return {
    name: SESSION_COOKIE,
    value: userId,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
