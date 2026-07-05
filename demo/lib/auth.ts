import type { User } from "./types";
import { resolveDemoRole } from "./roles";

const SESSION_KEY = "carinventory_session";

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function mockLogin(email: string, password: string, phone?: string): User | null {
  if (!email || !password) return null;
  const demo = resolveDemoRole(email);
  const user: User = {
    ...demo,
    email,
    phone: phone ?? "+60123456789",
    createdAt: new Date().toISOString(),
  };
  setSession(user);
  return user;
}

export function mockRegister(
  email: string,
  password: string,
  name: string,
  phone: string
): User | null {
  if (!email || !password || !name || !phone) return null;
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    phone,
    name,
    role: "seller",
    createdAt: new Date().toISOString(),
  };
  setSession(user);
  return user;
}
