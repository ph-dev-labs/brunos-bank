"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [depositModal, setDepositModal] = useState<{ userId: string; userName: string } | null>(null);
  const [depositForm, setDepositForm] = useState({ amount: "", description: "" });
  const [depositLoading, setDepositLoading] = useState(false);
  
  const [adminModal, setAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminLoading, setAdminLoading] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      body: JSON.stringify({ loanId, status }),
    });
    fetchData();
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!depositModal) return;
    setDepositLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: depositModal.userId,
        amount: parseFloat(depositForm.amount),
        description: depositForm.description,
      }),
    });

    const result = await res.json();
    setDepositLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: result.message });
      setDepositModal(null);
      setDepositForm({ amount: "", description: "" });
      fetchData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdminLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminForm),
    });

    const result = await res.json();
    setAdminLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: result.message });
      setAdminModal(false);
      setAdminForm({ name: "", email: "", password: "" });
      fetchData();
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

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message.type === "success" ? "bg-primary-500/10 border-primary-500/20 text-primary-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
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

      {/* Tabs */}
      <div className="flex gap-2">
        {["overview", "users", "loans", "transactions", "admins"].map((t) => (
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

      {/* Overview tab */}
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
                    <button onClick={() => handleLoan(loan.id, "approved")} className="flex items-center gap-1 text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-2 py-1 rounded transition-colors"><span className="material-symbols-outlined text-[1rem]">check</span> Approve</button>
                    <button onClick={() => handleLoan(loan.id, "rejected")} className="flex items-center gap-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors"><span className="material-symbols-outlined text-[1rem]">close</span> Reject</button>
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

      {/* Users tab — with deposit action */}
      {tab === "users" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">All Users ({totalUsers})</h2>
          </div>
          {data?.users?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No users registered yet</p>
          ) : (
            <div className="space-y-3">
              {data?.users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold text-sm">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500">Acct: {user.accounts[0]?.accountNumber ?? "N/A"} • Joined {formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-400">
                        {formatCurrency(user.accounts[0]?.balance ?? 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.loans?.filter((l: any) => l.status === "pending").length > 0
                          ? `${user.loans.filter((l: any) => l.status === "pending").length} pending loan(s)`
                          : "No pending loans"}
                      </p>
                    </div>
                    <button
                      onClick={() => setDepositModal({ userId: user.id, userName: user.name })}
                      className="flex items-center gap-1 text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-3 py-2 rounded-lg transition-colors font-medium"
                    >
                      <span className="material-symbols-outlined text-[1rem]">payments</span> Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loans tab */}
      {tab === "loans" && (
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">Loan Applications</h2>
          {data?.loans?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No loans</p>
          ) : (
            <div className="space-y-3">
              {data?.loans?.map((loan: any) => (
                <div key={loan.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                  <div>
                    <p className="font-medium">{loan.user?.name}</p>
                    <p className="text-sm text-gray-400">{formatCurrency(loan.amount)} • {loan.duration}mo • {loan.interest}% interest</p>
                    <p className="text-xs text-gray-500">{formatDate(loan.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      loan.status === "approved" ? "bg-primary-500/10 text-primary-400" :
                      loan.status === "rejected" ? "bg-red-500/10 text-red-400" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>{loan.status}</span>
                    {loan.status === "pending" && (
                      <>
                        <button onClick={() => handleLoan(loan.id, "approved")} className="text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-3 py-1 rounded-lg transition-colors">
                          Approve
                        </button>
                        <button onClick={() => handleLoan(loan.id, "rejected")} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg transition-colors">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admins tab */}
      {tab === "admins" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">System Administrators</h2>
            <button
              onClick={() => setAdminModal(true)}
              className="text-sm bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              + Create Admin
            </button>
          </div>
          <div className="space-y-3">
            {/* Note: In a real app we would fetch the list of admins, but we can just show a placeholder or skip the list for this demo */}
            <p className="text-gray-500 text-sm py-4">Manage administrator accounts.</p>
          </div>
        </div>
      )}

      {/* Transactions tab */}
      {tab === "transactions" && (
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">Recent Transactions</h2>
          {data?.transactions?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {data?.transactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      tx.type === "deposit" ? "bg-primary-500/10" : "bg-blue-500/10"
                    }`}>
                      <span className="material-symbols-outlined text-[1.2rem]">{tx.type === "deposit" ? "download" : "call_made"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description || "Transaction"}</p>
                      <p className="text-xs text-gray-400">
                        {tx.type === "deposit"
                          ? `Deposit → ${tx.receiver?.user?.name ?? "Unknown"}`
                          : `${tx.sender?.user?.name ?? "Bank"} → ${tx.receiver?.user?.name ?? "Unknown"}`}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-primary-400">{formatCurrency(tx.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === "completed" ? "bg-primary-500/10 text-primary-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg">Deposit for {depositModal.userName}</h2>
              <button
                onClick={() => { setDepositModal(null); setDepositForm({ amount: "", description: "" }); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Amount ($)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Enter amount to deposit"
                  min="1"
                  step="0.01"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  required
                />
                {depositForm.amount && (
                  <p className="text-xs text-primary-500 mt-1">
                    {formatCurrency(parseFloat(depositForm.amount) || 0)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Description (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Cash deposit, Bank transfer..."
                  value={depositForm.description}
                  onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setDepositModal(null); setDepositForm({ amount: "", description: "" }); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={depositLoading}>
                  {depositLoading ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {adminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold">Create New Admin</h3>
              <button onClick={() => setAdminModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  required
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setAdminModal(false)} className="flex-1 px-4 py-2 rounded-xl font-medium border border-dark-600 hover:bg-dark-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={adminLoading} className="flex-1 btn-primary py-2">
                  {adminLoading ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
