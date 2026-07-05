"use client";

import { useState } from "react";
import { mockApi } from "@/lib/mock-api";
import { useToast } from "./Toast";

interface InquiryFormProps {
  listingId: string;
  contactLabel?: "seller" | "reseller";
}

export function InquiryForm({ listingId, contactLabel = "seller" }: InquiryFormProps) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setSubmitting(true);
    const inquiry = mockApi.createInquiry(
      listingId,
      name.trim(),
      email.trim(),
      message.trim()
    );
    const alerts = [
      inquiry.emailNotified && "email",
      inquiry.smsNotified && "SMS",
    ]
      .filter(Boolean)
      .join(" and ");
    showToast(
      alerts
        ? `Inquiry sent! The ${contactLabel} was notified by ${alerts}.`
        : `Inquiry sent! The ${contactLabel} will contact you soon.`
    );
    setName("");
    setEmail("");
    setMessage("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Mike Johnson"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="mike@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Is this still available? I'd like to schedule a test drive."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        Send inquiry
      </button>
    </form>
  );
}
