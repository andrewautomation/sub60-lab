"use client";

import { useState } from "react";
import { signUp } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function register(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await signUp(
      email.trim(),
      password,
      `${window.location.origin}/login`
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
        <h1 className="text-3xl font-bold mb-8">Create account</h1>

        {sent ? (
          <p className="text-sm text-emerald-400">
            Check your email to confirm your account, then log in.
          </p>
        ) : (
          <form onSubmit={register}>
            <input
              type="email"
              className="w-full mb-4 rounded-lg p-3 bg-slate-800"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              type="password"
              className="w-full mb-4 rounded-lg p-3 bg-slate-800"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm">
          <Link href="/login">Already have an account? Login</Link>
        </div>
      </div>
    </main>
  );
}
