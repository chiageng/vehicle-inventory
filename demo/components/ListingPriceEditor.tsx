"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useToast } from "./Toast";

interface ListingPriceEditorProps {
  listingId: string;
  askingPrice: number;
  status: Listing["status"];
  onUpdated: (askingPrice: number) => void;
}

export function ListingPriceEditor({
  listingId,
  askingPrice,
  status,
  onUpdated,
}: ListingPriceEditorProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(askingPrice);
  const [saving, setSaving] = useState(false);

  const canEdit = status === "active" || status === "pending_review";

  if (!canEdit) {
    return <span>{formatCurrency(askingPrice)}</span>;
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span>{formatCurrency(askingPrice)}</span>
        <button
          type="button"
          onClick={() => {
            setPrice(askingPrice);
            setEditing(true);
          }}
          className="text-xs font-medium text-teal-600 hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  async function handleSave() {
    if (price <= 0) {
      showToast("Enter a valid price", "error");
      return;
    }
    setSaving(true);
    try {
      await api.updateListingPrice(listingId, price);
      onUpdated(price);
      setEditing(false);
      showToast("Price updated");
    } catch {
      showToast("Could not update price", "error");
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-slate-500">RM</span>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-24 rounded border border-slate-200 px-2 py-1 text-sm"
        min={1}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="text-xs font-medium text-teal-600 hover:underline disabled:opacity-50"
      >
        {saving ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-slate-500 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
