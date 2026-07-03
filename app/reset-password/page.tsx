"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, onPasswordRecovery, updatePassword } from "@/services/auth.service";
import { validatePassword } from "@/lib/validators/shared";

/**
 * Landing page for the link sent by resetPasswordForEmail
 * (app/forgot-password/page.tsx). Supabase's client exchanges the link's
 * token for a session automatically on load and fires PASSWORD_RECOVERY;
 * we also check for an already-established session in case that event
 * fired before this component mounted.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const subscription = onPasswordRecovery(() => setReady(true));

    getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validatePassword(password, confirm);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
        <h1 className="text-3xl font-bold mb-2">Set a new password</h1>

        {!ready && !success && (
          <p className="text-slate-400 text-sm mt-6">
            Verifying your reset link... if this doesn&apos;t update in a moment, request a new one from{" "}
            <a href="/forgot-password" className="text-cyan-400">
              forgot password
            </a>
            .
          </p>
        )}

        {ready && !success && (
          <form onSubmit={handleSubmit} className="mt-6">
            <input
              type="password"
              className="w-full mb-4 rounded-lg p-3 bg-slate-800"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              className="w-full mb-4 rounded-lg p-3 bg-slate-800"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update password"}
            </button>
          </form>
        )}

        {success && (
          <p className="mt-6 text-sm text-emerald-400">Password updated. Redirecting to login...</p>
        )}
      </div>
    </main>
  );
}
