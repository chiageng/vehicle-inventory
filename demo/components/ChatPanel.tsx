"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/ui";
import { formatCurrency, timeAgo, vehicleTitle } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { Conversation, Listing, MessageKind } from "@/lib/types";

export interface ChatThread {
  conversation: Conversation;
  listing: Listing;
}

/**
 * SOP 5 — on-platform chat with masked contact details and structured
 * actions (offer / viewing). Shared by buyer, seller and dealer portals.
 */
export function ChatPanel({
  threads,
  perspective,
  emptyText = "No conversations yet.",
}: {
  threads: ChatThread[];
  perspective: "buyer" | "seller";
  emptyText?: string;
}) {
  const { sendMessage, markConversationRead } = useDemo();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.conversation.id ?? null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [showOffer, setShowOffer] = useState(false);

  const selected = useMemo(
    () => threads.find((t) => t.conversation.id === selectedId) ?? threads[0] ?? null,
    [threads, selectedId]
  );

  if (threads.length === 0) {
    return <EmptyState title={emptyText} hint="Conversations from listings appear here." />;
  }

  const counterpartName = (t: ChatThread) =>
    perspective === "seller" ? t.conversation.buyerName : t.listing.sellerName;

  const send = (text: string, kind: MessageKind = "text") => {
    if (!selected || !text.trim()) return;
    sendMessage(selected.conversation.id, perspective === "buyer" ? "buyer" : "seller", text.trim(), kind);
    setDraft("");
    setShowOffer(false);
    setOfferAmount("");
    showToast(
      perspective === "buyer"
        ? "Sent — seller notified by email & SMS (mock)"
        : "Reply sent — buyer notified by email (mock)"
    );
  };

  return (
    <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[300px_1fr]">
      {/* Thread list — on mobile, hidden while a thread is open */}
      <div
        className={`max-h-[600px] overflow-y-auto border-r border-slate-200 ${
          mobileThreadOpen ? "hidden lg:block" : "block"
        }`}
      >
        {threads.map((t) => {
          const last = t.conversation.messages[t.conversation.messages.length - 1];
          const isSelected = selected?.conversation.id === t.conversation.id;
          return (
            <button
              key={t.conversation.id}
              onClick={() => {
                setSelectedId(t.conversation.id);
                setMobileThreadOpen(true);
                if (perspective === "seller") markConversationRead(t.conversation.id);
              }}
              className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition ${
                isSelected ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{counterpartName(t)}</p>
                {perspective === "seller" && t.conversation.unread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">{vehicleTitle(t.listing.spec)}</p>
              <p className="mt-1 truncate text-xs text-slate-400">
                {last?.text} · {last ? timeAgo(last.at) : ""}
              </p>
            </button>
          );
        })}
      </div>

      {/* Thread — on mobile, shown only after picking a conversation */}
      {selected && (
        <div className={`max-h-[600px] flex-col ${mobileThreadOpen ? "flex" : "hidden lg:flex"}`}>
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <button
              onClick={() => setMobileThreadOpen(false)}
              aria-label="Back to conversations"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              ←
            </button>
            <div className="relative h-10 w-14 overflow-hidden rounded-md bg-slate-100">
              <Image
                src={selected.listing.photos[0]}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {vehicleTitle(selected.listing.spec)}
              </p>
              <p className="text-xs text-slate-500">
                {counterpartName(selected)} · {formatCurrency(selected.listing.askingPrice)}
              </p>
            </div>
            <span className="hidden items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 sm:flex">
              <Icon name="shield" className="h-3 w-3" />
              Phone & email masked
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {selected.conversation.messages.map((m) => {
              const isMine =
                (perspective === "buyer" && m.from === "buyer") ||
                (perspective === "seller" && m.from === "seller");
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                      m.kind === "offer"
                        ? "border border-amber-300 bg-amber-50 text-amber-900"
                        : m.kind === "viewing"
                          ? "border border-blue-300 bg-blue-50 text-blue-900"
                          : isMine
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-700"
                    }`}
                  >
                    {m.kind !== "text" && (
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide">
                        {m.kind === "offer" ? "Offer" : "Viewing request"}
                      </p>
                    )}
                    <p>{m.text}</p>
                    <p className={`mt-1 text-[10px] ${isMine && m.kind === "text" ? "text-blue-200" : "text-slate-400"}`}>
                      {timeAgo(m.at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            {perspective === "buyer" && (
              <div className="mb-2 flex flex-wrap gap-2">
                <button
                  onClick={() => send("Hi, I'd like to arrange a viewing / test drive.", "viewing")}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  Request viewing
                </button>
                <button
                  onClick={() => setShowOffer((v) => !v)}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                >
                  Make an offer
                </button>
                {showOffer && (
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Amount (RM)"
                      className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() =>
                        offerAmount &&
                        send(`I'd like to offer ${formatCurrency(Number(offerAmount))} for this car.`, "offer")
                      }
                      className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      Send offer
                    </button>
                  </span>
                )}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
