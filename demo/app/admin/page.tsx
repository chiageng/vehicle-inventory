"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, SectionCard, StatCard } from "@/components/ui";
import { timeAgo, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";

export default function AdminOverviewPage() {
  const { listings, dealerApps } = useDemo();
  const pending = listings.filter((l) => l.status === "pending");
  const flagged = pending.filter((l) => l.flags.length > 0);
  const live = listings.filter((l) => l.status === "active");
  const reported = live.filter((l) => l.reports.length > 0);
  const pendingDealers = dealerApps.filter((d) => d.status === "pending");

  return (
    <div>
      <PageHeader
        title="Marketplace overview"
        description="Risk-based moderation: clean listings auto-publish, flagged ones wait for a human. Runs separately from the public site."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Flagged for review" value={pending.length} sub="clean listings auto-publish · SLA < 4h" accent={pending.length > 0} />
        <StatCard label="Auto-flagged" value={flagged.length} sub="fraud & quality signals" />
        <StatCard
          label="Reported by buyers"
          value={reported.length}
          sub={`of ${live.length} live listings — takedown review`}
          accent={reported.length > 0}
        />
        <StatCard label="Dealer applications" value={pendingDealers.length} sub="pending verification" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Manual review queue (flagged only)"
          action={
            <Link href="/admin/queue" className="text-xs font-medium text-blue-700 hover:underline">
              Review now →
            </Link>
          }
        >
          {pending.length === 0 ? (
            <p className="text-xs text-slate-400">Queue is clear — clean listings publish automatically. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{vehicleTitle(l.spec)}</p>
                    <p className="text-xs text-slate-500">
                      {l.sellerName} · submitted {timeAgo(l.listedAt)}
                    </p>
                    {l.flags.length > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Icon name="warning" className="h-3.5 w-3.5" />
                        {l.flags.length} auto-flag(s)
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                    pending
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Moderation signals (SOP 6)">
          <ul className="space-y-2.5 text-sm text-slate-600">
            {[
              ["Duplicate plate", "Same plate as a live listing — likely scam or double-post."],
              ["Price anomaly", "Asking price >15% below EZAUTO market value triggers a too-good-to-be-true check."],
              ["Low photo count", "Listings with a single photo get flagged for quality review."],
              ["Custom vehicle spec", "Make/model/variant entered outside the catalogue — reviewed and mapped so valuation & search stay accurate."],
              ["Photo condition mismatch", "AI compares uploaded photos against the declared condition grade — unconfirmed claims are held for review, and the valuation re-runs if the grade is corrected."],
              ["Disposable email", "Seller signed up with a throwaway email domain."],
              ["Buyer reports", "Every listing has a Report button — reported live listings queue here for takedown review with the reasons attached."],
            ].map(([rule, why]) => (
              <li key={rule} className="flex gap-2.5">
                <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  <span className="font-semibold text-slate-800">{rule}.</span> {why}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            Flags assist the reviewer — every approve/reject/takedown decision is logged with the
            operator and reason.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
