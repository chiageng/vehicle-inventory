"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Conversation } from "@/lib/types";
import { useToast } from "./Toast";

interface ConversationPanelProps {
  conversation: Conversation;
  listingTitle: string;
  mode: "seller" | "buyer";
  sellerName?: string;
  onUpdated: (updated: Conversation) => void;
}

export function ConversationPanel({
  conversation,
  listingTitle,
  mode,
  sellerName,
  onUpdated,
}: ConversationPanelProps) {
  const { showToast } = useToast();
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || submitting) return;

    setSubmitting(true);
    try {
      const updated = await api.replyToConversation(conversation.id, reply);
      showToast(
        mode === "seller"
          ? `Reply sent to ${conversation.buyerName}.`
          : "Message sent to seller."
      );
      onUpdated(updated);
      setReply("");
    } catch {
      showToast("Could not send message — please try again.", "error");
    }
    setSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {mode === "seller" ? (
            <>
              <p className="font-medium text-slate-900">{conversation.buyerName}</p>
              <p className="text-sm text-slate-500">{conversation.buyerEmail}</p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-900">{sellerName ?? "Seller"}</p>
              <p className="text-sm text-slate-500">Re: {listingTitle}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <ConversationStatusBadge status={conversation.status} mode={mode} />
          {mode === "seller" && conversation.emailNotified && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Alert: email
            </span>
          )}
          {mode === "seller" && conversation.smsNotified && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Alert: SMS
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {conversation.messages.map((msg) => {
          const isMine =
            mode === "seller" ? msg.from === "seller" : msg.from === "buyer";
          return (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                isMine
                  ? "border border-teal-200 bg-teal-50"
                  : "bg-slate-50"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {isMine
                  ? "You"
                  : mode === "buyer"
                    ? sellerName ?? "Seller"
                    : msg.senderName}
              </p>
              <p className="mt-1 text-sm text-slate-800">{msg.text}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(msg.createdAt).toLocaleString("en-MY", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          {mode === "seller" ? "Your reply" : "Follow up"}
        </label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder={
            mode === "seller"
              ? "Yes, it's still available. When would you like to view it?"
              : "Thanks! Can I view it this weekend?"
          }
        />
        <button
          type="submit"
          disabled={submitting || !reply.trim()}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? "Sending…" : mode === "seller" ? "Send reply" : "Send message"}
        </button>
      </form>

      <p className="mt-3 text-xs text-slate-500">
        {mode === "seller" ? `Re: ${listingTitle} · ` : ""}
        Started{" "}
        {new Date(conversation.createdAt).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

function ConversationStatusBadge({
  status,
  mode,
}: {
  status: Conversation["status"];
  mode: "seller" | "buyer";
}) {
  const styles: Record<Conversation["status"], string> = {
    new: "bg-amber-100 text-amber-800",
    read: "bg-slate-100 text-slate-600",
    replied: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-100 text-slate-500",
  };
  const sellerLabels: Record<Conversation["status"], string> = {
    new: "Awaiting reply",
    read: "Read",
    replied: "Replied",
    closed: "Closed",
  };
  const buyerLabels: Record<Conversation["status"], string> = {
    new: "Waiting for seller",
    read: "Read",
    replied: "Seller replied",
    closed: "Closed",
  };
  const labels = mode === "buyer" ? buyerLabels : sellerLabels;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
