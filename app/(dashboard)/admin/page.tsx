"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";

export default function AdminPage() {
  const { formatCurrency, currency } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  
  // Modals state
  const [depositModal, setDepositModal] = useState<{ userId: string; userName: string; action: "deposit" | "debit" } | null>(null);
  const [depositForm, setDepositForm] = useState({ amount: "", description: "" });
  
  const [userModal, setUserModal] = useState<{ type: "create" | "edit"; user?: any }>({ type: "create" });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", phone: "", imfCode: "" });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [configCurrency, setConfigCurrency] = useState(currency);

  async function fetchData() {
    const res = await fetch("/api/admin");
    if (res.status === 403) { window.location.href = "/dashboard"; return; }
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  async function handleLoan(loanId: string, status: string) {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: status === "approved" ? "approve_loan" : "reject_loan", loanId }),
    });
    fetchData();
  }

  async function handleCard(cardId: string, status: string) {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: status === "approved" ? "approve_card" : "reject_card", cardId }),
    });
    fetchData();
  }

  async function handleExternalTx(transactionId: string, status: string) {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: status === "approved" ? "approve_external_transfer" : "reject_external_transfer", transactionId }),
    });
    fetchData();
  }

  async function handleDepositDebit(e: React.FormEvent) {
    e.preventDefault();
    if (!depositModal) return;
    setActionLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: depositModal.action,
        userId: depositModal.userId,
        amount: parseFloat(depositForm.amount),
        description: depositForm.description,
      }),
    });

    const result = await res.json();
    setActionLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: result.message });
      setDepositModal(null);
      setDepositForm({ amount: "", description: "" });
      fetchData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    const isEdit = userModal.type === "edit";
    const res = await fetch("/api/admin", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: isEdit ? "edit_user" : "create_user",
        ...(isEdit ? { userId: userModal.user?.id } : {}),
        ...userForm,
      }),
    });

    const result = await res.json();
    setActionLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: result.message });
      setShowUserModal(false);
      fetchData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function generateIMF(userId: string) {
    setMessage(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_imf", userId }),
    });
    const result = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: `IMF Code generated: ${result.code}` });
      fetchData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function updateCurrencyConfig(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: configCurrency }),
    });
    const result = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: "Global currency updated! Please refresh to see changes everywhere." });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const pendingLoans = data?.loans?.filter((l: any) => l.status === "pending") ?? [];
  const totalUsers = data?.users?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">Admin Panel <span className="material-symbols-outlined text-primary-500">admin_panel_settings</span></h1>
        <p className="text-gray-400 text-sm mt-1">System overview and management</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message.type === "success" ? "bg-primary-500/10 border-primary-500/20 text-primary-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: totalUsers, icon: "group" },
          { label: "Total Accounts", value: data?.totalAccounts ?? 0, icon: "account_balance" },
          { label: "Total Balance", value: formatCurrency(data?.totalBalance ?? 0), icon: "payments" },
          { label: "Pending Loans", value: pendingLoans.length, icon: "receipt_long" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <span className="text-2xl material-symbols-outlined text-primary-400">{stat.icon}</span>
            <p className="text-lg font-bold mt-2 text-primary-400">{stat.value}</p>
            <p className="text-gray-400 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["overview", "users", "loans", "cards", "transactions", "settings"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-primary-500 text-white" : "bg-dark-700 text-gray-400 hover:text-white border border-dark-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-display font-semibold mb-4">Pending Loans</h2>
            {pendingLoans.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No pending loans</p>
            ) : (
              pendingLoans.slice(0, 5).map((loan: any) => (
                <div key={loan.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{loan.user?.name}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(loan.amount)} • {loan.duration}mo</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleLoan(loan.id, "approved")} className="flex items-center gap-1 text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-2 py-1 rounded"><span className="material-symbols-outlined text-[1rem]">check</span> Approve</button>
                    <button onClick={() => handleLoan(loan.id, "rejected")} className="flex items-center gap-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded"><span className="material-symbols-outlined text-[1rem]">close</span> Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="card p-6">
            <h2 className="font-display font-semibold mb-4">Recent Users</h2>
            {data?.users?.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold text-xs">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-primary-400">
                  {formatCurrency(user.accounts[0]?.balance ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">All Users ({totalUsers})</h2>
            <button
              onClick={() => {
                setUserModal({ type: "create" });
                setUserForm({ name: "", email: "", password: "", phone: "", imfCode: "" });
                setShowUserModal(true);
              }}
              className="text-sm bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              + Create User
            </button>
          </div>
          {data?.users?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No users registered yet</p>
          ) : (
            <div className="space-y-4">
              {data?.users?.map((user: any) => (
                <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-dark-600 last:border-0 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {user.name}
                        {user.imfCodes?.some((c: any) => !c.used) && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Has IMF Code</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500">Acct: {user.accounts[0]?.accountNumber ?? "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <p className="text-sm font-semibold text-primary-400 w-full md:w-auto text-right mb-2 md:mb-0 md:mr-4">
                      {formatCurrency(user.accounts[0]?.balance ?? 0)}
                    </p>
                    <button onClick={() => setDepositModal({ userId: user.id, userName: user.name, action: "deposit" })} className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition-colors">
                      Deposit
                    </button>
                    <button onClick={() => setDepositModal({ userId: user.id, userName: user.name, action: "debit" })} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-colors">
                      Debit
                    </button>
                    <button onClick={() => generateIMF(user.id)} className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                      Gen IMF
                    </button>
                    <button 
                      onClick={() => {
                        setUserModal({ type: "edit", user });
                        setUserForm({ name: user.name, email: user.email, password: "", phone: user.phone || "", imfCode: "" });
                        setShowUserModal(true);
                      }} 
                      className="text-xs border border-dark-500 hover:bg-dark-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "cards" && (
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">Card Applications</h2>
          {data?.cards?.filter((c: any) => c.status === "pending").length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No pending card applications</p>
          ) : (
            <div className="space-y-3">
              {data?.cards?.filter((c: any) => c.status === "pending").map((card: any) => (
                <div key={card.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                  <div>
                    <p className="font-medium">{card.user?.name}</p>
                    <p className="text-sm text-gray-400">{card.type} Card</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCard(card.id, "approved")} className="text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-3 py-1.5 rounded-lg">Approve</button>
                    <button onClick={() => handleCard(card.id, "rejected")} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "transactions" && (
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">Recent & Pending Transactions</h2>
          {data?.transactions?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {data?.transactions?.map((tx: any) => (
                <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-dark-600 last:border-0 gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      tx.type === "deposit" ? "bg-primary-500/10 text-primary-400" : "bg-blue-500/10 text-blue-400"
                    }`}>
                      <span className="material-symbols-outlined text-[1.2rem]">{tx.type === "deposit" ? "download" : "call_made"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description || "Transaction"}</p>
                      <p className="text-xs text-gray-400">
                        {tx.type === "deposit"
                          ? `To: ${tx.receiver?.user?.name ?? "Unknown"}`
                          : `From: ${tx.sender?.user?.name ?? "Bank"} → ${tx.externalBank ? tx.externalBank : (tx.receiver?.user?.name ?? "Bank")}`}
                      </p>
                      {tx.imfCode && <p className="text-[10px] text-yellow-500">IMF: {tx.imfCode}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <div className="text-right">
                      <p className="font-semibold text-sm text-primary-400">{formatCurrency(tx.amount)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        tx.status === "completed" ? "bg-green-500/10 text-green-400" : 
                        tx.status === "pending_admin_approval" ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>{tx.status.replace(/_/g, " ")}</span>
                    </div>
                    {tx.status === "pending_admin_approval" && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => handleExternalTx(tx.id, "approved")} className="text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-2 py-1 rounded">Approve</button>
                        <button onClick={() => handleExternalTx(tx.id, "rejected")} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="card p-6 max-w-md">
          <h2 className="font-display font-semibold mb-4">System Settings</h2>
          <form onSubmit={updateCurrencyConfig} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Global App Currency</label>
              <select
                className="input-field"
                value={configCurrency}
                onChange={(e) => setConfigCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Save Changes</button>
          </form>
        </div>
      )}

      {/* Modals */}
      {depositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg capitalize">{depositModal.action} for {depositModal.userName}</h2>
              <button onClick={() => { setDepositModal(null); setDepositForm({ amount: "", description: "" }); }} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleDepositDebit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Amount</label>
                <input type="number" className="input-field" min="1" step="0.01" value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Description (optional)</label>
                <input type="text" className="input-field" value={depositForm.description} onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setDepositModal(null); setDepositForm({ amount: "", description: "" }); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 capitalize" disabled={actionLoading}>{actionLoading ? "Processing..." : depositModal.action}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold capitalize">{userModal.type} User</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div><label className="text-sm text-gray-400 mb-1.5 block">Full Name</label><input type="text" className="input-field" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required /></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Email</label><input type="email" className="input-field" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required /></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Phone Number</label><input type="text" className="input-field" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></div>
              {userModal.type === "create" && (
                <>
                  <div><label className="text-sm text-gray-400 mb-1.5 block">Password</label><input type="password" className="input-field" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required /></div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Initial IMF Code (Optional)</label>
                    <div className="flex gap-2">
                      <input type="text" className="input-field" value={userForm.imfCode || ""} onChange={(e) => setUserForm({ ...userForm, imfCode: e.target.value })} placeholder="IMF-XXXXXX-XXXX" />
                      <button type="button" onClick={() => setUserForm({ ...userForm, imfCode: "IMF-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000) })} className="btn-secondary whitespace-nowrap px-4">Generate</button>
                    </div>
                  </div>
                </>
              )}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 btn-primary py-2">{actionLoading ? "Saving..." : "Save User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
