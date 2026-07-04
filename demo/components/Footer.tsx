import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">CarInventory</p>
            <p className="mt-1 text-sm text-slate-500">
              Instant valuations. Trusted marketplace.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/browse" className="hover:text-slate-900">
              Browse
            </Link>
            <Link href="/sell" className="hover:text-slate-900">
              Sell
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          Demo prototype — no real transactions. Valuations are rule-based estimates.
        </p>
      </div>
    </footer>
  );
}
