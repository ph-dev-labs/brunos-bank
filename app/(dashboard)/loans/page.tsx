"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [form, setForm] = useState({ amount: "", duration: "6" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function fetchLoans() {
    const res = await fetch("/api/loans");
    const data = await res.json();
    setLoans(data.loans ?? []);
  }

  useEffect(() => { fetchLoans(); }, []);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(form.amount), duration: parseInt(form.duration) }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: "Loan application submitted! We'll review it shortly." });
      setForm({ amount: "", duration: "6" });
      fetchLoans();
    } else {
      setMessage({ type: "error", text: data.error });
    }
  }

  const monthly = form.amount
    ? ((parseFloat(form.amount) * (1 + 5 / 100)) / parseInt(form.duration)).toFixed(2)
    : null;

  const statusColors: Record<string, string> = {
    pending: "badge-pending",
    approved: "badge-success",
    rejected: "badge-failed",
    repaid: "badge-success",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Loans</h1>
        <p className="text-gray-400 text-sm mt-1">Apply for a loan or track existing ones</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message.type === "success" ? "bg-primary-500/10 border-primary-500/20 text-primary-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Apply */}
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">Apply for Loan</h2>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Loan Amount ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 100000"
                min="1000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Duration</label>
              <select
                className="input-field"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              >
                {[3, 6, 12, 18, 24].map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>

            {monthly && (
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-400">Estimated monthly repayment</p>
                <p className="text-primary-400 font-bold text-lg">{formatCurrency(parseFloat(monthly))}</p>
                <p className="text-xs text-gray-500">5% interest rate over {form.duration} months</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Submitting..." : "Apply Now"}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">Loan Terms</h2>
          <div className="space-y-3">
            {[
              { label: "Interest Rate", value: "5% p.a" },
              { label: "Min. Amount", value: "$1,000" },
              { label: "Max. Amount", value: "$5,000,000" },
              { label: "Duration", value: "3 - 24 months" },
              { label: "Approval Time", value: "1 - 2 business days" },
              { label: "Disbursement", value: "Instant on approval" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm border-b border-dark-600 pb-2 last:border-0">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loan history */}
      <div className="card p-6">
        <h2 className="font-display font-semibold mb-4">Loan History</h2>
        {loans.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No loans yet</p>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                <div>
                  <p className="font-medium">{formatCurrency(loan.amount)}</p>
                  <p className="text-xs text-gray-400">{loan.duration} months • Applied {formatDate(loan.createdAt)}</p>
                </div>
                <span className={statusColors[loan.status] || "badge-pending"}>{loan.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
