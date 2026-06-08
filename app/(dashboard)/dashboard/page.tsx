import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const account = await prisma.account.findFirst({ where: { userId: session.user.id } });
  const unreadCount = await prisma.notification.count({ where: { userId: session.user.id, read: false } });

  const recentTransactions = account
    ? await prisma.transaction.findMany({
        where: { OR: [{ senderId: account.id }, { receiverId: account.id }] },
        include: { sender: { include: { user: true } }, receiver: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  const loans = await prisma.loan.findMany({ where: { userId: session.user.id }, take: 3 });

  const totalSent = recentTransactions
    .filter((t) => t.senderId === account?.id)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {session.user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's your financial overview</p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm px-3 py-1.5 rounded-full">
            {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-900 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <p className="text-blue-100 text-sm font-medium mb-1">Available Balance</p>
        <p className="text-4xl font-display font-bold mb-4">{formatCurrency(account?.balance ?? 0)}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs">Account Number</p>
            <p className="font-mono text-sm">{account?.accountNumber}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Account Type</p>
            <p className="text-sm capitalize">{account?.type}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sent", value: formatCurrency(totalSent), icon: "trending_up", color: "text-red-400" },
          { label: "Transactions", value: recentTransactions.length.toString(), icon: "receipt_long", color: "text-blue-400" },
          { label: "Active Loans", value: loans.filter((l) => l.status === "approved").length.toString(), icon: "account_balance_wallet", color: "text-yellow-400" },
          { label: "Account Status", value: "Active", icon: "verified", color: "text-primary-400" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
            <p className={`text-lg font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-display font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/transfer", label: "Send Money", icon: "send" },
            { href: "/transactions", label: "History", icon: "receipt_long" },
            { href: "/loans", label: "Apply Loan", icon: "account_balance_wallet" },
            { href: "/cards", label: "My Cards", icon: "credit_card" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-xl p-4 transition-all"
            >
              <span className="material-symbols-outlined text-2xl text-primary-400">{action.icon}</span>
              <span className="text-sm font-medium text-gray-300">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Recent Transactions</h2>
          <a href="/transactions" className="text-primary-500 text-sm hover:text-primary-400">View all</a>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              const isSender = tx.senderId === account?.id;
              return (
                <div key={tx.id} className="flex items-center gap-4 py-3 border-b border-dark-600 last:border-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isSender ? "bg-red-500/10" : "bg-primary-500/10"}`}>
                    <span className={`material-symbols-outlined ${isSender ? "text-red-400" : "text-primary-400"}`}>{isSender ? "arrow_outward" : "arrow_downward"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tx.description || "Transaction"}</p>
                    <p className="text-xs text-gray-400">
                      {isSender ? `To: ${tx.receiver?.user.name}` : `From: ${tx.sender?.user.name ?? "Bank"}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isSender ? "text-red-400" : "text-primary-400"}`}>
                      {isSender ? "-" : "+"}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
