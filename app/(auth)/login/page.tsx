"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
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

    // Credentials valid, now request OTP
    try {
      const otpRes = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, type: "login" }),
      });

      if (!otpRes.ok) {
        throw new Error("Failed to send OTP");
      }

      setStep("otp");
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: form.otp, type: "login" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid OTP");
      }

      // Re-trigger sign in but this time we actually complete it (we can't easily block NextAuth login natively without custom credentials logic, so we do this two-step approach)
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setLoading(false);
    }
  }

  return (
    <div className="card p-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <span className="font-display font-bold text-xl">Standard Chartered</span>
      </div>

      <h1 className="text-2xl font-display font-bold mb-1">
        {step === "credentials" ? "Welcome back" : "Verification"}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {step === "credentials" ? "Sign in to your account" : `Enter the 6-digit code sent to ${form.email}`}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {step === "credentials" ? (
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
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">6-Digit Code</label>
            <input
              type="text"
              className="input-field font-mono text-center tracking-widest text-lg"
              placeholder="000000"
              maxLength={6}
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Verifying..." : "Sign In"}
          </button>
          
          <button 
            type="button" 
            onClick={() => setStep("credentials")}
            className="w-full text-center text-sm text-gray-400 hover:text-white mt-4"
          >
            ← Back to login
          </button>
        </form>
      )}

      {step === "credentials" && (
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary-500 hover:text-primary-400 font-medium">
            Create one
          </Link>
        </p>
      )}
    </div>
  );
}
