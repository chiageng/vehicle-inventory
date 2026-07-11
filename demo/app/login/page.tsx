import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

const ROLE_META: Record<string, { title: string; email: string; portal: string }> = {
  seller: { title: "Private Seller", email: "weijian@demo.my", portal: "/seller" },
  dealer: { title: "Dealer Portal", email: "michelle@prestigeauto.my", portal: "/dealer" },
  admin: { title: "Platform Admin", email: "aisyah@ezautoinventory.my", portal: "/admin" },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role = "seller" } = await searchParams;
  const meta = ROLE_META[role] ?? ROLE_META.seller;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 to-slate-800 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo dark />
        </div>
        <div className="mt-6 rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">{meta.title}</p>
          <div className="mt-6">
            <LoginForm defaultEmail={meta.email} portal={meta.portal} />
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Mockup only — any credentials work. No account is checked or stored.
          </p>
        </div>
        <p className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
            ← Back to portal selection
          </Link>
        </p>
      </div>
    </div>
  );
}
