"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordForEmail } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await resetPasswordForEmail(
      email.trim(),
      `${window.location.origin}/reset-password`
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
        <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
        <p className="text-slate-400 mb-8">We&apos;ll email you a link to reset it.</p>

        {sent ? (
          <p className="text-sm text-emerald-400">
            If an account exists for {email}, a reset link is on its way — check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="w-full mb-4 rounded-lg p-3 bg-slate-800"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm">
          <Link href="/login">Back to login</Link>
        </div>
      </div>
    </main>
  );
}
