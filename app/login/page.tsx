"use client";

import { useState } from "react";
import { signIn } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Login
        </h1>

        <input
          className="w-full mb-4 rounded-lg p-3 bg-slate-800"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 rounded-lg p-3 bg-slate-800"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <div className="mt-6 flex justify-between text-sm">

          <Link href="/register">
            Create account
          </Link>

          <Link href="/forgot-password">
            Forgot password
          </Link>

        </div>

      </div>
    </main>
  );
}
