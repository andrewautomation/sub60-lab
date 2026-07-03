"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "🏠 Dashboard" },
  { href: "/dashboard/import", label: "⬆ Import", badge: "Recommended" },
  { href: "/dashboard/swim", label: "🏊 Swim" },
  { href: "/dashboard/bike", label: "🚴 Bike" },
  { href: "/dashboard/run", label: "🏃 Run" },
  { href: "/dashboard/goals", label: "🎯 Goals" },
  { href: "/dashboard/settings", label: "⚙ Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 md:min-h-screen">
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
            className={`flex items-center justify-between rounded-lg px-4 py-3 transition ${
              pathname === link.href
                ? "bg-cyan-500 text-black font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>{link.label}</span>
            {link.badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  pathname === link.href
                    ? "bg-black/20 text-black"
                    : "bg-cyan-500/20 text-cyan-400"
                }`}
              >
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
