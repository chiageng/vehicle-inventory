import Link from "next/link";

export function Logo({
  dark = false,
  href = "/",
}: {
  dark?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-black text-white shadow-sm">
        EA
      </span>
      <span className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
        EzAuto<span className="text-blue-500">Inventory</span>
      </span>
    </Link>
  );
}
