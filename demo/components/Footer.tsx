const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-slate-900">CarInventory</p>
            <p className="mt-2 text-sm text-slate-500">
              Malaysia&apos;s trusted car valuation and marketplace platform. List with
              confidence, buy with clarity.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Follow us</p>
            <div className="mt-2 flex gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-teal-600"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2 border-t border-slate-200 pt-6 text-xs text-slate-400">
          <p>
            <strong className="text-slate-500">Disclaimer:</strong> Valuations shown are
            estimates only and not a guaranteed sale price. CarInventory does not handle
            payments, ownership transfer, or vehicle inspection. Always verify vehicle
            details independently before purchase.
          </p>
          <p>
            Demo prototype — no real transactions. Rule-based estimates in prototype;
            production uses EZAUTO datahouse.
          </p>
          <p>© {new Date().getFullYear()} CarInventory · VibeCoders Penang</p>
        </div>
      </div>
    </footer>
  );
}
