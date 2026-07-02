"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <button
          onClick={logout}
          className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          Logout
        </button>
      </div>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8">
        <h2 className="text-2xl font-semibold">SUB-60 Performance Lab</h2>
        <p className="mt-3 text-slate-400">
          Authentication works. Next step: protected routes and test database.
        </p>
      </div>
    </main>
  );
}