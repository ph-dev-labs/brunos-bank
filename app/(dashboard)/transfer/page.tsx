"use client";
import { useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";

export default function TransferPage() {
  const { formatCurrency } = useCurrency();
  const [tab, setTab] = useState<"internal" | "external">("internal");

  const [form, setForm] = useState({ accountNumber: "", amount: "", description: "" });
  const [extForm, setExtForm] = useState({ externalBank: "", externalAccountName: "", externalAccountNumber: "", amount: "", description: "", imfCode: "" });
  const [showImfPrompt, setShowImfPrompt] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleInternalSubmit(e: React.FormEvent) {
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

  async function handleExternalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!showImfPrompt) {
      setShowImfPrompt(true);
      return;
    }
    
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/transfer/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...extForm,
        amount: parseFloat(extForm.amount),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: data.message });
      setExtForm({ externalBank: "", externalAccountName: "", externalAccountNumber: "", amount: "", description: "", imfCode: "" });
      setShowImfPrompt(false);
    } else {
      setMessage({ type: "error", text: data.error || "Transfer failed" });
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Send Money</h1>
        <p className="text-gray-400 text-sm mt-1">Transfer funds securely</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setTab("internal"); setMessage(null); setShowImfPrompt(false); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            tab === "internal" ? "bg-primary-500 text-white" : "bg-dark-700 text-gray-400 hover:text-white border border-dark-500"
          }`}
        >
          Internal Transfer
        </button>
        <button
          onClick={() => { setTab("external"); setMessage(null); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            tab === "external" ? "bg-primary-500 text-white" : "bg-dark-700 text-gray-400 hover:text-white border border-dark-500"
          }`}
        >
          External Transfer
        </button>
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

      {tab === "internal" ? (
        <div className="card p-6">
          <form onSubmit={handleInternalSubmit} className="space-y-5">
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
              <label className="text-sm text-gray-400 mb-1.5 block">Amount</label>
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
      ) : (
        <div className="card p-6">
          <form onSubmit={handleExternalSubmit} className="space-y-5">
            {!showImfPrompt ? (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Bank Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Chase Bank"
                    value={extForm.externalBank}
                    onChange={(e) => setExtForm({ ...extForm, externalBank: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Account Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. John Doe"
                    value={extForm.externalAccountName}
                    onChange={(e) => setExtForm({ ...extForm, externalAccountName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Account Number / IBAN</label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="Enter account number"
                    value={extForm.externalAccountNumber}
                    onChange={(e) => setExtForm({ ...extForm, externalAccountNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={extForm.amount}
                    onChange={(e) => setExtForm({ ...extForm, amount: e.target.value })}
                    required
                  />
                  {extForm.amount && (
                    <p className="text-xs text-primary-500 mt-1">
                      {formatCurrency(parseFloat(extForm.amount) || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Description (optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Invoice payment"
                    value={extForm.description}
                    onChange={(e) => setExtForm({ ...extForm, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Continue
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-dark-800 p-4 rounded-xl border border-dark-600 text-sm text-gray-300">
                  <p className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">warning</span>
                    IMF Code Required
                  </p>
                  <p>To authorize this external transfer, please enter your IMF Code. If you do not have one, please contact the administrator.</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">IMF Code</label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="IMF-XXXXXX-XXXX"
                    value={extForm.imfCode}
                    onChange={(e) => setExtForm({ ...extForm, imfCode: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowImfPrompt(false)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" className="btn-primary flex-1" disabled={loading}>
                    {loading ? "Authorizing..." : "Authorize Transfer"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="card p-4">
        <p className="text-xs text-gray-500 text-center">
          <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">lock</span> All transfers are encrypted and processed securely.
        </p>
      </div>
    </div>
  );
}
