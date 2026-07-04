import type { User } from "./types";

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

export function mockLogin(email: string, password: string): User | null {
  if (!email || !password) return null;
  const isAdmin = email.toLowerCase() === "admin@carinventory.my";
  const user: User = {
    id: isAdmin ? "user-admin" : "user-demo-001",
    email,
    name: isAdmin ? "Admin" : email.split("@")[0],
    role: isAdmin ? "admin" : "seller",
    createdAt: new Date().toISOString(),
  };
  setSession(user);
  return user;
}

export function mockRegister(
  email: string,
  password: string,
  name: string
): User | null {
  if (!email || !password || !name) return null;
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: "seller",
    createdAt: new Date().toISOString(),
  };
  setSession(user);
  return user;
}
