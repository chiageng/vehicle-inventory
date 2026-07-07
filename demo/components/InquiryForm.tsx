"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fetchSession } from "@/lib/auth";
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

  useEffect(() => {
    fetchSession().then((user) => {
      if (user) {
        setName(user.name);
        setEmail(user.email);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const conversation = await api.createConversation(
        listingId,
        name.trim(),
        email.trim(),
        message.trim()
      );
      const alerts = [
        conversation.emailNotified && "email",
        conversation.smsNotified && "SMS",
      ]
        .filter(Boolean)
        .join(" and ");
      showToast(
        alerts
          ? `Message sent! The ${contactLabel} was notified by ${alerts}. Check My Enquiries for replies.`
          : `Message sent! Check My Enquiries for the seller's reply.`
      );
      setMessage("");
    } catch {
      showToast("Could not send message — please try again.", "error");
    }
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
        {submitting ? "Sending…" : "Send message"}
      </button>
      <p className="text-center text-xs text-slate-500">
        <Link href="/enquiries" className="text-teal-600 hover:underline">
          My Enquiries
        </Link>
        {" "}to see seller replies
      </p>
    </form>
  );
}
