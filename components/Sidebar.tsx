"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Discipline } from "@/lib/race/models";

interface NavLink {
  href: string;
  label: string;
  badge?: string;
}

const DISCIPLINE_LINKS: (NavLink & { discipline: Discipline })[] = [
  { href: "/dashboard/swim", label: "🏊 Swim", discipline: "swim" },
  { href: "/dashboard/bike", label: "🚴 Bike", discipline: "bike" },
  { href: "/dashboard/run", label: "🏃 Run", discipline: "run" },
];

interface Props {
  disciplines: Discipline[];
}

export default function Sidebar({ disciplines }: Props) {
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: "/dashboard", label: "🏠 Dashboard" },
    { href: "/dashboard/import", label: "⬆ Import", badge: "Recommended" },
    ...DISCIPLINE_LINKS.filter((link) => disciplines.includes(link.discipline)),
    { href: "/dashboard/goals", label: "🎯 Goals" },
    { href: "/dashboard/settings", label: "⚙ Settings" },
  ];

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
