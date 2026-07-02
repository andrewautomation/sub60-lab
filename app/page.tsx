import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center space-y-8">

        <div>
          <p className="uppercase tracking-[0.4em] text-cyan-400 text-sm">
            SUB-60 PERFORMANCE LAB
          </p>

          <h1 className="text-6xl font-bold mt-4">
            Sprint Triathlon
          </h1>

          <p className="mt-6 text-slate-400 max-w-xl">
            Personal Performance Database for Swim, Bike and Run.
          </p>
        </div>

        <div className="flex gap-4 justify-center">

          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-8 py-3 rounded-xl border border-slate-600 hover:border-cyan-500"
          >
            Register
          </Link>

        </div>

      </div>
    </main>
  );
}
