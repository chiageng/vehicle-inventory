"use client";

import { useState } from "react";
import { mockApi } from "@/lib/mock-api";
import type { Inquiry } from "@/lib/types";
import { useToast } from "./Toast";

interface InquiryReplyPanelProps {
  inquiry: Inquiry;
  listingTitle: string;
  onReplied: (updated: Inquiry) => void;
}

export function InquiryReplyPanel({
  inquiry,
  listingTitle,
  onReplied,
}: InquiryReplyPanelProps) {
  const { showToast } = useToast();
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || submitting) return;

    setSubmitting(true);
    const updated = mockApi.replyToInquiry(inquiry.id, reply);
    if (updated) {
      showToast(`Reply sent to ${inquiry.contactName} by email.`);
      onReplied(updated);
    } else {
      showToast("Could not send reply — please try again.", "error");
    }
    setSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{inquiry.contactName}</p>
          <p className="text-sm text-slate-500">{inquiry.contactEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InquiryStatusBadge status={inquiry.status} />
          {inquiry.emailNotified && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Alert: email
            </span>
          )}
          {inquiry.smsNotified && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Alert: SMS
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Buyer</p>
        <p className="mt-1 text-sm text-slate-700">{inquiry.message}</p>
      </div>

      {inquiry.replyMessage ? (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
              Your reply
            </p>
            {inquiry.buyerEmailNotified && (
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                Sent to buyer by email
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-800">{inquiry.replyMessage}</p>
          {inquiry.repliedAt && (
            <p className="mt-2 text-xs text-slate-500">
              Sent{" "}
              {new Date(inquiry.repliedAt).toLocaleDateString("en-MY", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700">Your reply</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Yes, it's still available. When would you like to view it?"
          />
          <button
            type="submit"
            disabled={submitting || !reply.trim()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send reply"}
          </button>
        </form>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Re: {listingTitle} · Received{" "}
        {new Date(inquiry.createdAt).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

function InquiryStatusBadge({ status }: { status: Inquiry["status"] }) {
  const styles: Record<Inquiry["status"], string> = {
    new: "bg-amber-100 text-amber-800",
    read: "bg-slate-100 text-slate-600",
    replied: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-100 text-slate-500",
  };
  const labels: Record<Inquiry["status"], string> = {
    new: "Awaiting reply",
    read: "Read",
    replied: "Replied",
    closed: "Closed",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
