import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/Logo";

const PORTALS: {
  role: string;
  title: string;
  icon: IconName;
  description: string;
  features: string[];
  href: string;
  loginHref: string;
}[] = [
  {
    role: "buyer",
    title: "Buyer Marketplace",
    icon: "search",
    description: "Browse, compare and enquire — no account needed.",
    features: ["Search & compare listings", "Plate check with market valuation", "Chat with sellers, masked contact"],
    href: "/buyer",
    loginHref: "/buyer",
  },
  {
    role: "seller",
    title: "Private Seller",
    icon: "car",
    description: "Sell your own car with a guided, valuation-first flow.",
    features: ["Plate auto-fill via EZAUTO", "Instant + refined valuation", "Price warning & enquiry inbox"],
    href: "/seller",
    loginHref: "/login?role=seller",
  },
  {
    role: "dealer",
    title: "Dealer Portal",
    icon: "store",
    description: "Manage inventory, consignments and leads in one place.",
    features: ["Instant appraisal by plate", "Inventory & consignment dashboard", "Shared lead inbox"],
    href: "/dealer",
    loginHref: "/login?role=dealer",
  },
  {
    role: "admin",
    title: "Platform Admin",
    icon: "shield",
    description: "Moderation, approvals and dealer verification.",
    features: ["Review queue for flagged listings", "Fraud signals (price, duplicate plate)", "Dealer verification"],
    href: "/admin",
    loginHref: "/login?role=admin",
  },
];

export default function PortalSelectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between">
          <Logo dark />
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/30">
            Interactive product mockup
          </span>
        </div>

        <div className="mt-16 max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            One marketplace.
            <br />
            <span className="text-blue-400">Valuation-driven</span> buying &amp; selling.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            EzAutoInventory connects private sellers, dealers and buyers around a single source of
            truth: live market valuations from the EZAUTO Central Vehicle Datahouse.
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Choose a portal below to walk through each role&apos;s flow. No database, no real
            credentials — everything is mocked for demonstration.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PORTALS.map((p) => (
            <div
              key={p.role}
              className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-800/60 p-5 transition hover:border-blue-500 hover:bg-slate-800"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                <Icon name={p.icon} className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{p.description}</p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2">
                <Link
                  href={p.loginHref}
                  className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition group-hover:bg-blue-500"
                >
                  Enter portal
                </Link>
                {p.role !== "buyer" && (
                  <Link
                    href={p.href}
                    className="block text-center text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
                  >
                    Skip sign-in →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            The critical flow — valuation
          </p>
          <div className="mt-4 grid gap-4 text-sm text-slate-300 sm:grid-cols-4">
            {[
              ["1 · Plate lookup", "Seller enters a plate; EZAUTO returns the registered spec — make, model, variant, year — auto-filled."],
              ["2 · Condition & photos", "Mileage, condition and history declared; AI photo analysis verifies the declared condition."],
              ["3 · Valuation retrieved", "Only on complete, verified information is the MYR market value revealed."],
              ["4 · Priced with confidence", "Setting the asking price is the final step — deviation warnings for sellers, price badges for buyers."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="font-semibold text-white">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          EzAutoInventory · product mockup for demonstration · valuation data simulated (EZAUTO
          SaaS integration point)
        </p>
      </div>
    </div>
  );
}
