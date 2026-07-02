"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/login",
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Check your email to confirm your account.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
        <h1 className="text-3xl font-bold mb-8">Create account</h1>

        <input
          className="w-full mb-4 rounded-lg p-3 bg-slate-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 rounded-lg p-3 bg-slate-800"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={register}
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <div className="mt-6 text-sm">
          <Link href="/login">Already have an account? Login</Link>
        </div>
      </div>
    </main>
  );
}
