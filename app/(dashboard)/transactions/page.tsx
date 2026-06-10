"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import InvoiceModal from "@/components/InvoiceModal";

export default function TransactionsPage() {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const transactions = data?.transactions ?? [];
  const account = data?.account;

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t: any) => {
        if (filter === "sent") return t.senderId === account?.id;
        if (filter === "received") return t.receiverId === account?.id;
        return t.type === filter;
      });

  return (
    <div className="space-y-6">
      {selectedTx && (
        <InvoiceModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Transactions</h1>
          <p className="text-gray-400 text-sm mt-1">Your complete transaction history</p>
        </div>
        <a 
          href="/api/statements" 
          download 
          className="text-sm bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-4 py-2 rounded-xl font-medium transition-colors border border-primary-500/20 w-fit flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[1.2rem]">download</span> Download Statement (CSV)
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "sent", "received", "deposit"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-primary-500 text-white"
                : "bg-dark-700 text-gray-400 hover:text-white border border-dark-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-dark-600">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No transactions found</p>
        ) : (
          filtered.map((tx: any) => {
            const isSender = tx.senderId === account?.id;
            const badgeClass = tx.status === "completed" ? "badge-success" : tx.status === "pending" ? "badge-pending" : "badge-failed";

            return (
              <div key={tx.id} className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  tx.type === "deposit" ? "bg-primary-500/10" : isSender ? "bg-red-500/10" : "bg-primary-500/10"
                }`}>
                  <span className={`material-symbols-outlined ${tx.type === "deposit" ? "text-primary-400" : isSender ? "text-red-400" : "text-primary-400"}`}>
                    {tx.type === "deposit" ? "account_balance" : isSender ? "arrow_outward" : "arrow_downward"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description || "Transaction"}</p>
                  <p className="text-xs text-gray-400">
                    {tx.type === "deposit"
                      ? "Bank deposit"
                      : isSender
                      ? `To: ${tx.receiver?.user?.name ?? "Unknown"}`
                      : `From: ${tx.sender?.user?.name ?? "Bank"}`}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className={`font-semibold ${tx.type === "deposit" || !isSender ? "text-primary-400" : "text-red-400"}`}>
                    {tx.type === "deposit" || !isSender ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={badgeClass}>{tx.status}</span>
                    <button 
                      onClick={() => setSelectedTx(tx)} 
                      className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-400 bg-dark-700 hover:bg-dark-600 px-2 py-1 rounded transition-colors"
                      title="View Receipt"
                    >
                      <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
