import { api } from "./api";
import type { User } from "./types";

let cachedUser: User | null | undefined;

export async function fetchSession(): Promise<User | null> {
  try {
    cachedUser = await api.fetchSession();
    return cachedUser;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function getCachedSession(): User | null {
  return cachedUser ?? null;
}

export function setCachedSession(user: User | null): void {
  cachedUser = user;
}

export async function login(email: string, password: string): Promise<User> {
  const user = await api.login(email, password);
  cachedUser = user;
  return user;
}

export async function register(
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<User> {
  const user = await api.register(email, password, name, phone);
  cachedUser = user;
  return user;
}

export async function logout(): Promise<void> {
  await api.logout();
  cachedUser = null;
}
