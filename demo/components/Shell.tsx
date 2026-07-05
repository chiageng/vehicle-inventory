"use client";

import { usePathname } from "next/navigation";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 bg-slate-100">{children}</main>
        <AdminFooter />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
