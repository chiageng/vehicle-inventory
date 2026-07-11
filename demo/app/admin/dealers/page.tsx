"use client";

import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { Chip, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { useDemo } from "@/lib/store";

export default function AdminDealersPage() {
  const { dealerApps, decideDealer } = useDemo();
  const { showToast } = useToast();

  return (
    <div>
      <PageHeader
        title="Dealer verification"
        description="Business registration (SSM) is checked before dealer privileges — the verified badge has to mean something."
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">SSM registration</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dealerApps.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{d.businessName}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.ssmNumber}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{d.contactName}</p>
                  <p className="text-xs text-slate-400">{d.phone}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(d.appliedAt)}</td>
                <td className="px-4 py-3">
                  {d.status === "verified" && (
                    <Chip tone="emerald">
                      <Icon name="shield" className="h-3 w-3" />
                      Verified
                    </Chip>
                  )}
                  {d.status === "pending" && <Chip tone="amber">Pending</Chip>}
                  {d.status === "rejected" && <Chip tone="red">Rejected</Chip>}
                </td>
                <td className="px-4 py-3 text-right">
                  {d.status === "pending" && (
                    <span className="inline-flex gap-1.5">
                      <button
                        onClick={() => {
                          decideDealer(d.id, "verified");
                          showToast(`${d.businessName} verified — dealer badge granted (mock)`);
                        }}
                        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => {
                          decideDealer(d.id, "rejected");
                          showToast("Application rejected — applicant notified (mock)");
                        }}
                        className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        In production: SSM e-Info lookup, physical lot verification and a signed dealer agreement
        before the badge is granted.
      </p>
    </div>
  );
}
