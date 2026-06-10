"use client";
import { useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";

// ─── Step config ──────────────────────────────────────────────────────────────
const EXT_STEPS = [
  { id: 1, label: "Transfer Details", icon: "send"    },
  { id: 2, label: "IMF Code",         icon: "vpn_key" },
  { id: 3, label: "Tax Code",         icon: "receipt" },
  { id: 4, label: "COT Code",         icon: "shield"  },
];

export default function TransferPage() {
  const { formatCurrency } = useCurrency();
  const [tab, setTab] = useState<"internal" | "external">("internal");

  // Internal transfer
  const [form, setForm] = useState({ accountNumber: "", amount: "", description: "" });

  // External transfer — step-based
  const [extStep, setExtStep] = useState(1); // 1 = details, 2 = IMF, 3 = Tax, 4 = COT
  const [extForm, setExtForm] = useState({
    externalBank: "", externalAccountName: "", externalAccountNumber: "",
    amount: "", description: "", imfCode: "", taxCode: "", cotCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function resetExternal() {
    setExtStep(1);
    setExtForm({ externalBank: "", externalAccountName: "", externalAccountNumber: "", amount: "", description: "", imfCode: "", taxCode: "", cotCode: "" });
    setMessage(null);
  }

  // ── Internal submit ──────────────────────────────────────────────────────────
  async function handleInternalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountNumber: form.accountNumber, amount: parseFloat(form.amount), description: form.description }),
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

  // ── External: advance steps ─────────────────────────────────────────────────
  function handleExtNext(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (extStep < 4) { setExtStep(extStep + 1); return; }
    handleExternalSubmit();
  }

  async function handleExternalSubmit() {
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/transfer/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...extForm, amount: parseFloat(extForm.amount) }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: data.message });
      resetExternal();
    } else {
      setMessage({ type: "error", text: data.error || "Transfer failed" });
    }
  }

  // ── Progress bar ─────────────────────────────────────────────────────────────
  function StepProgress() {
    return (
      <div className="flex items-center gap-1 mb-6">
        {EXT_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-all ${
              extStep > s.id  ? "bg-primary-500 text-white"        :
              extStep === s.id ? "bg-primary-500/20 border-2 border-primary-500 text-primary-400" :
              "bg-dark-700 border border-dark-500 text-gray-500"
            }`}>
              {extStep > s.id
                ? <span className="material-symbols-outlined text-[1rem]">check</span>
                : s.id}
            </div>
            {i < EXT_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded transition-all ${extStep > s.id ? "bg-primary-500" : "bg-dark-600"}`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Step labels ─────────────────────────────────────────────────────────────
  const currentStep = EXT_STEPS[extStep - 1];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Send Money</h1>
        <p className="text-gray-400 text-sm mt-1">Transfer funds securely</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setTab("internal"); setMessage(null); resetExternal(); }}
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

      {/* ── INTERNAL ── */}
      {tab === "internal" && (
        <div className="card p-6">
          <form onSubmit={handleInternalSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Recipient Account Number</label>
              <input type="text" className="input-field font-mono" placeholder="Enter 10-digit account number"
                value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} maxLength={10} required />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Amount</label>
              <input type="number" className="input-field" placeholder="0.00" min="1" step="0.01"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              {form.amount && <p className="text-xs text-primary-500 mt-1">{formatCurrency(parseFloat(form.amount) || 0)}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Description (optional)</label>
              <input type="text" className="input-field" placeholder="e.g. Rent payment, Birthday gift..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Processing..." : "Send Money"}
            </button>
          </form>
        </div>
      )}

      {/* ── EXTERNAL (step wizard) ── */}
      {tab === "external" && (
        <div className="card p-6">
          <StepProgress />

          {/* Step label */}
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary-400">
              {currentStep.icon}
            </span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Step {extStep} of 4</p>
              <p className="font-display font-semibold text-sm">{currentStep.label}</p>
            </div>
          </div>

          <form onSubmit={handleExtNext} className="space-y-4">

            {/* ── Step 1: Transfer Details ── */}
            {extStep === 1 && (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Bank Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Chase Bank"
                    value={extForm.externalBank} onChange={(e) => setExtForm({ ...extForm, externalBank: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Account Name</label>
                  <input type="text" className="input-field" placeholder="e.g. John Doe"
                    value={extForm.externalAccountName} onChange={(e) => setExtForm({ ...extForm, externalAccountName: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Account Number / IBAN</label>
                  <input type="text" className="input-field font-mono" placeholder="Enter account number"
                    value={extForm.externalAccountNumber} onChange={(e) => setExtForm({ ...extForm, externalAccountNumber: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Amount</label>
                  <input type="number" className="input-field" placeholder="0.00" min="1" step="0.01"
                    value={extForm.amount} onChange={(e) => setExtForm({ ...extForm, amount: e.target.value })} required />
                  {extForm.amount && <p className="text-xs text-primary-500 mt-1">{formatCurrency(parseFloat(extForm.amount) || 0)}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Description (optional)</label>
                  <input type="text" className="input-field" placeholder="e.g. Invoice payment"
                    value={extForm.description} onChange={(e) => setExtForm({ ...extForm, description: e.target.value })} />
                </div>
              </>
            )}

            {/* ── Step 2: IMF Code ── */}
            {extStep === 2 && (
              <>
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-sm text-gray-300">
                  <p className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1rem] text-primary-400">vpn_key</span>
                    Enter your IMF Code
                  </p>
                  <p className="text-xs text-gray-500">Your International Monetary Fund authorization code, provided by your administrator.</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">IMF Code</label>
                  <input type="text" className="input-field font-mono tracking-widest" placeholder="IMF-XXXXXX-XXXX"
                    value={extForm.imfCode} onChange={(e) => setExtForm({ ...extForm, imfCode: e.target.value.toUpperCase() })} required autoFocus />
                </div>
              </>
            )}

            {/* ── Step 3: Tax Code ── */}
            {extStep === 3 && (
              <>
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-sm text-gray-300">
                  <p className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1rem] text-primary-400">receipt</span>
                    Enter your Tax Code
                  </p>
                  <p className="text-xs text-gray-500">Your Tax authorization code assigned to your account by the administrator.</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Tax Code</label>
                  <input type="text" className="input-field font-mono tracking-widest" placeholder="TAX-XXXXXX-XXXX"
                    value={extForm.taxCode} onChange={(e) => setExtForm({ ...extForm, taxCode: e.target.value.toUpperCase() })} required autoFocus />
                </div>
              </>
            )}

            {/* ── Step 4: COT Code ── */}
            {extStep === 4 && (
              <>
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-sm text-gray-300">
                  <p className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[1rem] text-primary-400">shield</span>
                    Enter your COT Code
                  </p>
                  <p className="text-xs text-gray-500">Your Cost of Transfer authorization code, the final step to authorize this transfer.</p>
                </div>

                {/* Transfer summary */}
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Transfer Summary</p>
                  <div className="flex justify-between"><span className="text-gray-400">To Bank</span><span className="font-medium">{extForm.externalBank}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Account</span><span className="font-mono text-xs">{extForm.externalAccountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-bold text-primary-400">{formatCurrency(parseFloat(extForm.amount) || 0)}</span></div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">COT Code</label>
                  <input type="text" className="input-field font-mono tracking-widest" placeholder="COT-XXXXXX-XXXX"
                    value={extForm.cotCode} onChange={(e) => setExtForm({ ...extForm, cotCode: e.target.value.toUpperCase() })} required autoFocus />
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {extStep > 1 && (
                <button type="button" onClick={() => { setExtStep(extStep - 1); setMessage(null); }} className="btn-secondary flex-1">
                  Back
                </button>
              )}
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? "Authorizing..." : extStep === 4 ? "Authorize Transfer" : "Continue →"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4">
        <p className="text-xs text-gray-500 text-center">
          <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">lock</span>
          All transfers are encrypted and processed securely.
        </p>
      </div>
    </div>
  );
}
