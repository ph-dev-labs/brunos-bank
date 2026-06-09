"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/transfer", label: "Transfer", icon: "send" },
  { href: "/transactions", label: "Transactions", icon: "receipt_long" },
  { href: "/loans", label: "Loans", icon: "account_balance_wallet" },
  { href: "/cards", label: "Cards", icon: "credit_card" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/profile", label: "Profile", icon: "person" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "admin" && pathname !== "/admin") {
      router.push("/admin");
    } else if (status === "authenticated" && session?.user?.role !== "admin" && pathname === "/admin") {
      router.push("/dashboard");
    }
  }, [status, session, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const allNav = session.user.role === "admin"
    ? [{ href: "/admin", label: "Admin", icon: "admin_panel_settings" }]
    : navItems;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-600 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Standard Chartered" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-lg">Standard Chartered</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {allNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                }`}
              >
                <span className="material-symbols-outlined text-[1.2rem]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-dark-600 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold text-sm">
              {session.user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{session.user.role}</p>
            </div>
          </div>
          <div className="px-1">
            <LanguageSwitcher />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[1.2rem] align-middle mr-2">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-dark-600 bg-dark-800">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Standard Chartered" className="w-6 h-6 object-contain" />
            <span className="font-display font-bold">Standard Chartered</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="p-6 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
