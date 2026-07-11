"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  defaultEmail,
  portal,
}: {
  defaultEmail: string;
  portal: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("demo1234");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(portal);
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Sign in
      </button>
      <Link
        href={portal}
        className="block text-center text-xs font-medium text-slate-400 hover:text-slate-600"
      >
        Skip sign-in →
      </Link>
    </form>
  );
}
