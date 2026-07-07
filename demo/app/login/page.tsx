"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth";
import { loginRedirect } from "@/lib/roles";
import { useToast } from "@/components/Toast";

function getSafeNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@carinventory.my", password: "admin123" },
  { role: "Reseller", email: "reseller@carinventory.my", password: "reseller123" },
  { role: "Seller", email: "sarah@example.com", password: "demo123" },
];

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`);
      router.push(
        user.role === "admin"
          ? loginRedirect(user.role)
          : getSafeNextPath() ?? loginRedirect(user.role)
      );
    } catch {
      showToast("Invalid email or password", "error");
    }
    setSubmitting(false);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign in to manage listings, enquiries, and seller conversations.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <details className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Preview accounts
        </summary>
        <table className="mt-3 w-full text-left text-xs text-slate-600">
          <thead>
            <tr>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Password</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ACCOUNTS.map((account) => (
              <tr key={account.email}>
                <td className="py-1 pr-2">{account.role}</td>
                <td className="py-1 pr-2 font-mono">{account.email}</td>
                <td className="py-1 font-mono">{account.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-teal-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
