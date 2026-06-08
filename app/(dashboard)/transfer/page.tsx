"use client";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function TransferPage() {
  const [form, setForm] = useState({ accountNumber: "", amount: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: form.accountNumber,
        amount: parseFloat(form.amount),
        description: form.description,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: "Transfer successful!" });
      setForm({ accountNumber: "", amount: "", description: "" });
    } else {
      setMessage({ type: "error", text: data.error || "Transfer failed" });
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Send Money</h1>
        <p className="text-gray-400 text-sm mt-1">Transfer funds to any Standard Chartered account</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message.type === "success"
            ? "bg-primary-500/10 border-primary-500/20 text-primary-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Recipient Account Number</label>
            <input
              type="text"
              className="input-field font-mono"
              placeholder="Enter 10-digit account number"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Amount ($)</label>
            <input
              type="number"
              className="input-field"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            {form.amount && (
              <p className="text-xs text-primary-500 mt-1">
                {formatCurrency(parseFloat(form.amount) || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Description (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Rent payment, Birthday gift..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Processing..." : "Send Money"}
          </button>
        </form>
      </div>

      <div className="card p-4">
        <p className="text-xs text-gray-500 text-center">
          <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">lock</span> All transfers are encrypted and processed instantly. No fees.
        </p>
      </div>
    </div>
  );
}
