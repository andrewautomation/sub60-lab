"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "🏠 Dashboard" },
  { href: "/dashboard/swim", label: "🏊 Swim" },
  { href: "/dashboard/bike", label: "🚴 Bike" },
  { href: "/dashboard/run", label: "🏃 Run" },
  { href: "/dashboard/races", label: "🏁 Races" },
  { href: "/dashboard/analytics", label: "📈 Analytics" },
  { href: "/dashboard/goals", label: "🎯 Goals" },
  { href: "/dashboard/settings", label: "⚙ Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="p-6">
        <h2 className="text-cyan-400 text-xl font-bold">
          SUB-60 LAB
        </h2>
      </div>

      <nav className="px-3 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-4 py-3 transition ${
              pathname === link.href
                ? "bg-cyan-500 text-black font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
