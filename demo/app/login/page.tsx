"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mockLogin } from "@/lib/auth";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = mockLogin(email, password);
    if (user) {
      showToast(`Welcome back, ${user.name}!`);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } else {
      showToast("Please enter email and password", "error");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Demo mode — any email and password work. Use{" "}
        <span className="font-mono text-slate-800">admin@carinventory.my</span> for admin access.
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
          className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-teal-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
