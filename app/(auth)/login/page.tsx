"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Test credentials against NextAuth first, but with redirect: false
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const session = await getSession();
    if (session?.user?.role === "admin") {
      router.push("/admin");
      return;
    }

    // Credentials valid, login is complete
    router.push("/dashboard");
  }

  return (
    <div className="card p-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/logo.png" alt="Standard Chartered" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold text-xl">Standard Chartered</span>
      </div>

      <h1 className="text-2xl font-display font-bold mb-1">
        Welcome back
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        Sign in to your account
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-gray-400 block">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary-500 hover:text-primary-400">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
